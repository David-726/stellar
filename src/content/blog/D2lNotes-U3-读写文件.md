---
title: "读写文件"
published: 2026-08-22
description: ""
tags: ["D2lNotes"]
draft: false
---
# 读写文件
## 加载和保存张量
**对于单个张量，我们可以直接调用load和save函数分别读写他们** 
```python
import torch
from torch import nn
from torch.nn import functioal as F

x = torch.arange(4)
torch.save(x,'x-file')
```
```python
x2 = torch.load('x-file')
x2
```
```python
y = torch.zeros(4)
torch.save([x,y],'x-file')
x2,y2 = torch.load('x-file')
(x2,y2)
```
甚至可以写入或读取从字符串映射到张量的字典，当我们要读取或这写入模型中的所有权重时，这很方便
```python
mydict = {'x':x,'y':y}
torch.save(mydict,'mydict')
mydict2 = torch.load('mydict')
mydict2
```
## 加载和保存模型参数
如果我们想要保存整个模型，并且在以后加载它们，单独保存每个向量则会变得很麻烦。
`pytorch`框架提供了内置函数来保存和加载整个网络。*保存这个模型的参数而不是保存这个模型*
```python
class MLP(nn.Module):
	def __init__(self):
		super().__init__()
		self.hidden = nn.Linear(20,256)
		self.output = nn.Linear(256,10)
	def forward(self,x):
		return self.output(self.hidden(x))

net = MLP()
X = torch.randn(size=(2,20))
Y = net(X)
```
```
torch.save(net.state_dict(),'mlp.params')
```
```
clone = MLP()
clone.load_stata_dict(torch.load('mlp.params'))
clone.eval()
```
```
Y_clone=clone(X)
Y_clone==Y
```
