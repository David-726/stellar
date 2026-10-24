---
title: "bert embedding,word embedding,pooler embedding"
published: 2026-09-02
description: ""
tags: ["BERT"]
draft: false
---
## bert embedding
### summary
- bert input embedding:一种查表结构(LUT)
	- LUT
		- token embeddings:
		- segment embeddings
		- position embeddings
	- 后处理:
		- layer norm
		- dropout
```python
from transformers import BertTokenizer,BertModel
import torch
from torch import nn
```
```python
model_name = 'bert-base-uncased'
tokenizer = BertTokenizer.from_pretained(model_name)
model = BertModel.from_pretained(model_nmae)
```
```python
test_sent = 'this is a test sentence'
```
```python
input = tokenizer(test_sent,return_tensors='pt')
```
```python
input_ids = input['input_ids']
token_type_ids = input['token_type_ids']
```
```python
pos_ids = torch.arange(input_ids.shape[1])
```
```python
pos_ids
```
```python
token_embed = model.embeddings.word_embeddings(input_ids)
```
```python
model.embeddings(input_ids,token_type_ids)
```
```python
model.embeddings(input_ids,token_type_ids)
```
### token embedding
```python
token_embed = model.embeddings.word_embeddings(input_ids)
token_embed.shape
```
### segment type embedding
```python
seg_embed=model.embeddings.token_type_embeddings(token_type_ids)
seg_embed.shape
```
### pos embedding
```python
pos_embed = model.embeddings.position_embeddings(pos_ids)
```
```python
pos_embed.shape
```
### input embedding
```python
input_embed = token_embed+seg_embed+pos_embed.unsqueeze(0)
```
### 后处理
```python
model=model.embeddings.LayerNorm(input_embed)
```
```python

```


