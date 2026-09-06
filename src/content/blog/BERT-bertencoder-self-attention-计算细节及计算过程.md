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
att_head_size = int(model.config.hidden_size/model.config.um_aatention_heads)
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




