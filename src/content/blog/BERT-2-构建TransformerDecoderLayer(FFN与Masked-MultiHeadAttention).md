---
title: 构建TransformerDecoderLayer(FFN与Masked MultiHeadAttention)
published: '2026-10-02'
description: ''
tags:
  - BERT
draft: false
---
```python
import torch
from torch import nn
import torch.nn.functional as F
import transfomers
from transformers import AutoTokenizer,AutoConfig,AutoModel
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib as mpl
```
### summary
- decoder和encoder相比,有2个特殊的attention sublayers
	- masked multi-head(self)attention
	- encoder-decoder (cross) attention
		- (k,v)from encoder (memory)
		- q:decoder input
	- 两者的权重互不共享
### mask
```python
model_ckpt = 'bert-base-uncased'
mdoel = AutoModel.from_pretrained(model_ckpt)

tokenizer = AutoTokenizer.from_pretrained(model_ckpt)
config = AutoConfig.from_pretrained(model_ckpt)
```
```python
token_embedding = nn.Embedding(config.vocab_size,config.hidden_size)
# token_embedding
sample_text = 'time files like an arrow'
model_inputs = tokenizer(sample_text,return_tensors='pt',add_special_tokens=False)
# forward of embedding module
input_embeddings = token_embedding(model_inputs['input_ids'])
input_embeddings.shape
```
#### 下三角矩阵
```python
import torch
q = k =v =input_embeddings
scores = torch.bmm(q,k.transpose(1,2))/math.sqrt(k.size(-1))
scores
```
```python
seq_len = model_inputs['input_ids'].size(-1)
# trangular lower(上三角的话,torch.triu,upper triangular)
mask = torch.tril(torch.ones(seq_len,seq_len).unqueeze(0))
print(mask.shape)
mask
```
```python
scores.masked_fill(mask==0,-float('inf'))
```
```python
# in place
scores.masked_fill_(mask==0,-float('inf'))
```
```python
scores
```
```python
torch.exp(torch.tensor(-float('inf')))
```
### （masked)self-attention
```python
def sclaed_dot_product_attn(q,k,v,mask=None):
	# q,k,v:(b,s,h/s)(a:numeer heads,12,768/12=64)
	dim_k = k.size(-1)
	#b,s,s
	scores = torch.bmm(q,k.transpose(1,2))/math.sqrt(dim_k)
	if mask if not None:
		scores.masked_fill_(mask==0,-float('inf'))
	# 上对角值为0
	attn_weights = F.softmax(scores,dim=-1)
	print(attn_weights)
	return torch.bmm(attn_weights,v)
```
### 源码分析
```python
decoder_layer = nn.TransformerDecoderLayer(d_model=512,nhead=8)
# s1,b,h1
memory = torch.rand(10,32,512)
# s2,b,h2 from decoder_input
tgt = torch.rand(20,32,512)
```
```python

```
```python
print(decoder_layer.dropout.training)
print(decoder_layer.dropout1.training)
print(decoder_layer.dropout2.training)
print(decoder_layer.dropout3.training)
```
```python
out = decoder_layer(tgt,memory)
```
```python
out
```
```python
# multi head
def self_attn(x):
	x = decoder_layer.self_attn(x,x,x)[0]
	return decoder_layer.dropout1(x)
# multi head
def cross_attn(q,k,v=None):
	 if v is None:
		 v = k
	x = decoder_layer.multihead_attn(q,k,v)[0]
def ffn(x):
	# h==>4h
	x = decoder_layer.dropout(F.relu(decoder_layer.linear1(x)))
	# 4h==> h
	x = decoder_layer.linear2(x)
	return x
```
```python
print(self_attn(tgt).shape)
print(cross_attn(tgt,memroy,memory).shape)
print(ffn(tgt).shape)
```
```python
def decode_forward(tgt,memory,norm_first=False):
	x = tgt
	if norm_first:
		x = x+self_attn(decoder_layer.norm1(x))
		x = x+cross_attn(decoder_layer.norm2(x),memory)
		x = x+ffn(decoder_layer,norm3(x))
	else:
		x = decoder_layer.norm1(x+self_attn(x))
		x = decoder_layer.norm2(x+cross_attn(x,memory))
	return x
```
```python
decode_forward(tgt,memory)
```
