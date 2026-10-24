---
title: transformer 架构 scaled dot product self attention(qkv)
published: '2026-10-01'
description: ''
tags:
  - BERT
draft: false
---
```python
import torch
from torch import nn
import transformers
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib as mpl
```
```python
print(torch.__version__)
print(transformers.__version__)
```
### summary
- attention mechanism
- encoder VS decoder
	- seq2seq
		- seq of tokens => seq of tokens
	- tasks
		- machine translation
	- encoder
		- seq of token => seq of embedding vectors(hidden state/context)
	- decoder
		- encoder's hidden state => seq of tokens
			- iteratively generate
				- until EOS(end of seq)or reach max length limit
			- one token at a time
```python

```

- encoder only:seq of text => rich representation (**bidirectioanl attention**)
	- task
		- text classification
		- NER
	- models
		- BERT
		- RoBERTa
		- DistiBERT
	- 完形填空(bidirectional)
		- representation of a given token depends both on
- decoder only(casual or autoregressive attention)自回归的
		- gpt
		- 词语接龙
			- representation of a given token depends only on the left contxet
- encoder-decoder both
		- tasks
			- machine translation
			- summarization
		- models
			- t5
			- bart
### encoder(encoder layer task)
- encoder layer:encoding the context information (cnn)
	- input:seq of embedddings
		- multi-head self attention
		- fc
	- output:
		- same shape as `input`
	- contextual information(contextualized embeddings)
		- apple:company-like or friut-like
			- keynote/phone/Jobs
			- banana/pear
		- files
			- time files like an arrow:soars
			- friut files like a banana:insect
	-  skip connection(residual connection)&layer normalztion
		- 高效的训练深度神经网络的技巧
### Multi-head self-attention layer
#### self attention
- each token
	- 不是 fixed embeddings
	- 而是 weighted average of each embeddings of the whole inpue sequence
- a seq of token embeddings:$x_1,x_2,\cdots,x_n$,经过$self-attention$得到a seq of updated embeddings,$x_1',x_2',\cdots,x_n'$ $$x_i'=\sum_{j=1}^nw_{ji}x_j$$
- $w_{\mu}$
	- attention weights
	- $\sum_{j}w_{ji}=1$
	- $w\in \mathbb{R}^{n*n}$
#### scaled dot-product attention
- Project each token embedding into the three vectors called query,key and value
	- $W_q,W_k,W_v$：learnable parameters
- Compucts attention scores:
	- dot-product(**query,key**)==>attention scores
	- a sequence with $n$ input tokens there is a corresponding $\mathbb{R}^{n*n}$matrix of attention scores
- Compute attention weights from attention scores:$w_{j,i}$
	- Dot products 的结果可能是任意大的数m会让整个过程很不稳定
	- 将 attention scores 乘以1个scaling factor
	- softmax归一化:$\sum_{j}w_{ji}=1$
- update the final embedding of the tokens(value)
	- $$x_i'=\sum_{j=1}^nw_{ji}v_{j}$$
#### visualization analysis
```python
# !pip install bertviz
from transformers import AutoTokenizer
```
```python
from bertviz.transformers_neuron_view import BertModel
from bertviz.neturn_view import show
```
```python
model_ckpt = 'bert-base-uncased'
tokenizer = AutoTokenizer.from_pretrained(model_ckpt)
model = BertModel.from_pretrained(model_ckpt)
```
```python
model
```
```python
sample_text = 'time files like an arrow'
show(model,model_type="bert",tokenizer=tokenizer,sentence_a=ample_text,display_mode="light",layer=0,head=0)
```
- 稍微解释一下query,key,values
	- 源于information retreval systems
	- 以经典的厨师来举例子:
		- 你需要做一顿晚餐:
		- 晚餐的内容就是queries
		- 现在你在一个超市里,超市的货架上的labels就是keys
		- querys和keys进行匹配,得到合适的货架和层
		- 然后从匹配的货架和层取出对应的item
#### computation of self-attention
```python
tokenizer.model_input_names
```
```python
ample_text
```
```python
model_inputs = tokenizer(sample_text,return_tensors='pt',add_special_tokens=False)
model_inputs
```
```python
from torch import nn
from transformers import AutoConfig,AutoTokenizer,AutoModel
```
```python
#hyperparameters
config = AutoConfig.from_pretrained(model_ckpt)
config
```
```python
#config.vocba_size:30522
#config.hidden_size:768=64*12
token_embedding = nn.Embedding(config.vocab_size,config.hidden_size)
token_embedding
```
```python
# forward of embedding module
input_embedding = tokens_embedding(model_inputs['input_ids'])
#batch_size,seq_len,hidden_size
input_embedding

```
```python
# 暂时不考虑position encoding
query = key = value = input_embeddings
dim_k = key.size(-1)
attn_scores = torch.bmm(query,key.transpose(1,3)/np.sqrt(dim_k))
print('attn_scores.shape:',attn_scores.shape)
attn_scores
```
```python
# from scaores => weights,softmax
import torch.nn.functional as F
weights = F.softmax(attn_scores,dim=-1)
weights
```
```python
weights.sum(axis=1)
```
```python
attn_outputs = torch.bmm(weights,bias)
attn_outputs
```
```python
# batch_size,seq_len,hidden_szie
def scaled_dot_attention(query,key,value):
	dim_k = key.size(-1)
	# batch_size,seq_len,seq_len
	attn_scores = torch.bmm(query,key.transpose(1,2)/np.sqrt(dim_k))
	attn_weights = F.softmax(attn_scores,dim=-1)
	return torch.bmm(attn_weight,value)

```
```python
scaled_dot_attention(query,key,value)
```



