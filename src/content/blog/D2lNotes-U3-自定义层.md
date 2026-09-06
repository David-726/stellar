---
title: "自定义层"
published: 2026-08-22
description: ""
tags: ["PyTorch"]
draft: false
---
# 自定义层
## 不带参数的层
先构造1个不带参数的层
```python
import torch
import torch.nn.functional as F
from torch import nn

class CenteredLayer(bb.Module):
	def __init__(self):
		super().__init__()
	def forward(self,X):
		return X-X.mean()
```
```
layer = CenteredLayer()
layer(torch.FloatTensor([1,2,3,4,5]))
```
```
net = nn.Sequential(nn.Linear(8,128),CenteredLayer())
```
向该网络发送任意参数后，检查是否为0.处理的是浮点数，因为存储精度的问题，会看到一个非常小的非零数
```
Y = net(torch.rand(4,8))
Y.mean()
```
## 带参数的层
继续定义一些具有参数的层，这些参数可以通过训练继续调整，使用内置函数来创建函数
```python
class MyLinear(nn.Module):
	def __init__(self,in_units,units):
		super().__init__()
		self.weight = nn.Parameter(torch.randn(in_units,units))
		self.bias = nn.Parameter(torch.randn(units,))
	
	def forward(self,X):
		linear = torch.matmul(X,self.weight.data)+self.bias.data
		return F.relu(linear)
```