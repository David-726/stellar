---
title: "torch.no_grad() VS requires_grad=False"
published: 2026-09-02
description: ""
tags: ["BERT", "PyTorch"]
draft: false
---
- `torch.no_grad()`
	- 定义了1个上下文管理器，隐式的不进行梯度更新，不改变requires_grad()
	- 适用于eval阶段，或者model forward过程中某些模块不更新梯度的模块(此时这些模块仅仅进行特征提取(前向计算),不反向更新)
- `param.requires_grad`
	- 显式的增加一些module(layer)的梯度更新
	- layer/module级别
	- 可能会更灵活
```python
from transformers import BertModel
import torch
from torch import nn
```
```python
model_name = 'bert-base-uncased'
```
```python
bert = BertModel.from_pretained(model_name)
```
```python
def calc_learnable_params(model):
	total_param = 0
	for name,param in model.named_parameters():
		if param.requires_grad:
			total_param += param.numel()
	return total_param
```
```python
calc_learnable_params(bert)
```
```python
with torch.nn_grad():
	print(calc_learnable_params(bert))
```
```python
for name,param in bert.named_parameters():
	if param.requires_grad():
		param.requires_grad = False
```
Answer:
- `with torch.no_grad()` is a context manager and is used to prevent calculating gradients[...]
- `requires_grad` on the other hand is used:
	> to freeze part of your model and train the rest[...]
