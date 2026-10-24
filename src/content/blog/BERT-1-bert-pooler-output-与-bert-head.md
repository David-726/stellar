---
title: bert pooler output 与 bert head
published: '2026-09-15'
description: ''
tags:
  - BERT
draft: false
---
```python
from transformers import BertTokenizer,BertModel
import torch
```
### Bert Model and Tokenizer
```python
model_type = 'bert-base-uncased'
```
```python
bert = BertModel.from_pretrained(model_type)
tokenizer = BertTokenizer.from_pretained(model_type)
```
```python
text = 'This is a text sentence'
```
```python
inputs = tokenizer(text,return_tensors='pt')
```
```python
inputs
```
```python
tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
```
### forward and pooler output
```python
bert.eval()
```
```python
with torch.no_grad():
	output = bert[**inputs]
```
```python
output.keys()
```
```python
output['last_hidden_state'].shape
```
```python
output['pooler_output']
```
### from scratch
```python
my_output = bert.pooler.activation(bert.pooler.dense(output['last_hidden-state'][0][0,:]))
```
```python
torch.equal(my_output,output['pooler_output'][0])
```
### bert head
 