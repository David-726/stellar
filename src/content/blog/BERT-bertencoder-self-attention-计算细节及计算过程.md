---
title: "bertencoder self attention 计算细节及计算过程"
published: 2026-09-03
description: ""
tags: ["BERT", "注意力机制"]
draft: false
---
$$
Attention(Q,K,V)=softmax(\frac{QK^T}{\sqrt{d_k}})V
$$
```python
import torch
from torch import nn
import math
from bertviz.transformers_neuron_view import BertModel,BertConfig
```
### model config and load
```python
max_length = 256
model_name = 'bert-base-uncased'
config = BertConfig.from_pretained(model_name,output_attentions=True,output_hidden_states=True,return_dict=True)
tokenizer = BertTokenizer.from_pretained(model_name)
config.max_position_embeddings=max_length
model = BertModel(config).from_pretained(model_name)
model = model.eval()
```
```python
att_head_size = int(model.config.hidden_size/model.config.um_attention_heads)
```
```python
att_head_size
```
```python
model.encoder.layer[0].attention.self.query.weight.T[:,:64]
```
```python
model.encoder.layer[0]
```
### data
```python
from sklearn.datasets import fetch_20newsgroups
newsgroups_train = fetch_20newsgroups(subset='train')
inputs_tests = tokenizer(newsgroups_train['data'][:1],truncation=True,paddding=True,max_length=max_length,return_tensors='pt')
```
```python
inputs_tests['input_size'].shape
```
### model output
```python
model_output = model(**inputs_tests)
```
```python
len(model_output)
```
```python
model_output[-1][0].keys()
```
```python
model_output[-1][0]['attn'].shape
```
### from scratch
```python
emb_output = model.embeddings(inputs_test['input_ids'],inputs_tests['token_type_ids'])
```
```python
emb_output.shape
```
```python
model.encoder.layer[0]
```
```python
# emb_output[0].shape:201*768
# query.weight.T.shape:768*768,query.weight.T[:,:att_head_size]:768*64
Q_first_head_first_layer = emb_output[0]@model.encoder.layer[0].attention.self.query.weight.T[:,:att_head_size]\+model.encoder.layer[0].attention.self.query.bias[:att_head_size]
```
```python
# 201*64
K_first_head_first_layer = emb_output[0]@model.encoder.layer[0].attention.self.key.weight.T[:,:att_head_size]\+model.encoder.layer[0].attention.self.key.bias[:att_head_size]
```
```python
# (201*64)*(64*201) ==> 201*201
attn_scores = torch.nn.Softmax(dim=1)(Q_first_head_first_layer@K_fisrt_head_first_layer.T/math.sqrt(att_head_size))
```
```python
attn_scores
```
```python
attn_scores.sum(dim=-1)
```
```python
V_first_head_first_layer = emb_output[0]@model.encoder.layer[0].attention.self.value.weight.T[:,:att_head_size]+model.encoder.layer[0].attention.self.value.bias[:att_head_size]
```
```python
attn_emb = attn_scores@V_first_head_first_layer
```
```python
attn_emb.shape
```
```python
V_first_head_first_layer
```
### all
```python
Q_first_layer = emb_output[0]@model.encoder.layer[0].attention.self.query.weight.T\
+model.encoder.layer[0].attention.self.query.bias
K_first_layer = emb_output[0]@model.encoder.layer[0].attention.self.key.weight.T\
+model.encoder.layer[0].attention.self.key.bias
V_first_layer = emb_output[0]@model.encoder.layer[0].attention.self.value.weight.T\
+model.encoder.layer[0].attention.self.value.bias
```
```python
scores = torch.nn.Softmax(dim=1)(Q_first_layer@K_first_layer/math.sqrt(64))
```
```python
scores @ V_first_layer[:,:64]
```





