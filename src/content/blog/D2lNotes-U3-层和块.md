---
title: "层和块"
published: 2026-06-08
description: ""
tags: ["PyTorch"]
draft: false
---

当考虑具有多个输出的网络时， 我们利用矢量化算法来描述整层神经元。 像单个神经元一样，层（1）接受一组输入， （2）生成相应的输出， （3）由一组可调整参数描述。 当我们使用softmax回归时，一个单层本身就是模型。 然而，即使我们随后引入了多层感知机，我们仍然可以认为该模型保留了上面所说的基本架构。

为了实现复杂的网络，我们引入块Block的概念。block可以描述单个层、由多个层组成的组件或者整个模型本身。 使用块进行抽象的好处是可以将一些块组合成更大的组件。![images/blocks.svg](https://zh.d2l.ai/_images/blocks.svg)
从编程的角度，块由class表示。任何子类都必须定义一个将其转换为输出的前向传播函数，并且必须存储任何必须的参数。最后为了计算梯度，块必须具有反向传播函数。
在构造自定义块之前，我们线回顾一下多层感知机。下面的代码生成一个网络，包括以恶搞具有256个单元和Relu激活函数的全连接隐藏层，然后是一个具有10个隐藏单元且不带激活函数的全连接输出层
```python
import torch
from torch import nn
from torch.nn import functional as F

net = nn.Sequential(nn.Linear(20,256),nn.ReLU(),nn.Linear(256,10))
X = torch.rand(2,20)
net(X)
```
简而言之，`nn.Sequential`定义了一种特殊的`Module`， 即在PyTorch中表示一个块的类， 它维护了一个由`Module`组成的有序列表。 注意，两个全连接层都是`Linear`类的实例， `Linear`类本身就是`Module`的子类。 另外，到目前为止，我们一直在通过`net(X)`调用我们的模型来获得模型的输出。 这实际上是`net.__call__(X)`的简写。 这个前向传播函数非常简单： 它将列表中的每个块连接在一起，将每个块的输出作为下一个块的输入。

### 自定义块

每一个块必须提供的基本功能:

- 将输入数据作为前向传播函数的参数
- 通过前向传播函数来生成输出。请注意，输出的形状可能与输入的形状不同。
- 计算其输出关于输入的梯度，可以通过反向传播函数进行访问。
- 存储和访问前向传播需要的参数
- 根据需要初始化参数

在下面的代码片段中，我们从零开始编写一个块。 它包含一个多层感知机，其具有256个隐藏单元的隐藏层和一个10维输出层。

```python
class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.hidden = nn.Linear(20, 256)  # 隐藏层
        self.out = nn.Linear(256, 10)  # 输出层
    def forward(self, X):
        return self.out(F.relu(self.hidden(X)))
```
我们可以子类化块一创建层、整个模型或具有中等复杂度的各种组件。

### 顺序块

我们需要：
一种将块逐个追加到函数的参数
```python
class MySequential(nn.Module):
    def __init__(self, *args):
        super().__init__()
        for idx, module in enumerate(args):
            self._modules[str(idx)] = module

    def forward(self, X):
        for block in self._modules.values():
            X = block(X)
        return X
```
### 前向传播函数中执行代码
`Sequential`类使得模型构造变得简单，允许我们组合新的架构，而不必定义自己的类->
但是顺序块并不灵活,我们需要定义自己的Block
```python
class FixedHiddenMLP(nn.Module)
	def __init__(self):
		super().__init__()
		self.rand_weight = torch.rand((20,20),requiers_grad=False)
		self.linear = nn.Linear(20,20)
		
	def forward(self,X):
		X = self.linear(X)
		X = F.relu(torch.mm(X,self.rand_weight)+1)
		X = self.linear(X)
		#限制:防止数值过大
		while X.abs().sum()>1:
			X/=2;
		returm X.sum()
```
```
net = FixedHiddenMLP()
net(X)
```
混合搭配各种组合快
```python
class NestMLP(nn.Module):
	def __init__(self):
		super().__init__()
		self.net = nn.Sequential(nn.Linear(20,64),nn.ReLU(),nn.Linear(64,32),nn.ReLU())
		self.linear = nn.Linear(32,16)
	def forward(self,X):
		return self.linear(self.net(X))

chimera = nn.Sequential(NestMLP(),nn.Linear(16,20),FixedHiddenMLP())
chimera(X)
```

## Practice
1. 如果将`MySequential`中存储块的方式更改为Python列表，会出现什么样的问题？
    
2. 实现一个块，它以两个块为参数，例如`net1`和`net2`，并返回前向传播中两个网络的串联输出。这也被称为平行块。
    
3. 假设我们想要连接同一网络的多个实例。实现一个函数，该函数生成同一个块的多个实例，并在此基础上构建更大的网络。