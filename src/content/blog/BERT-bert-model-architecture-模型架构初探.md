---
title: "bert model architecture 模型架构初探"
published: 2026-09-02
description: ""
tags: ["BERT"]
draft: false
---
### summary
- bert:encoder if transformer
	- transformer:encoder-decoder[seq2seq]
- bert:
	- word(token) embedding
	- encoder(12 layer)
		- self attention(qkv)
		- feed forward
	- pooler
- 为什么bert能被称之为Large Language Model
参数量相当的大!!! 吓哭了
```python
#参数量统计
total_param = 0
total_learned_params = 0
total_embedding_params = 0
total_encoder_params = 0
total_pooler_params = 0
```
- Bert_base 有 12个encoder layer
- Bert_large 有 24个encoder layer
```python
for name,param in model.named_parameters():
	print(name,'->',param.shape,'->',param.numel())#numel->number of memrble to learrned elements
	if 'embedding' in name:
		total_embedding_params += param.numel()
	if 'encoder' in name:
		total_encoder_params += param.numel()
	if 'pooler' in name:
		total_pooler_params += param.numel()
	if param.require_grad:
	total.param+=param.numel()
```
```python
print(total_embedding_params,total_encoder_params,total_pooler_params)
for param in params:
	print(param/sum(params))
```




