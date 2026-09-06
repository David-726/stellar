---
title: "DenseNet"
published: 2026-08-24
description: ""
tags: ["D2lNotes"]
draft: false
---
# DenseNet
### 从ResNet到DenseNet
f(x)在x=0处的`Taylor`展开:
$$
f(x)=f(0)+f'(0)x+\frac{f''(0)}{2!}x^{2}+...
$$
同样的`ResNet`:
$$f(x)=x+g(x)$$
<img src="/posts/assets/1306j-densenet-block.svg" alt="densenet-block.svg" loading="lazy" />一个简单的线性项和一个复杂的非线性项
<img src="/posts/assets/1il5lnu-densenet.svg" alt="densenet.svg" loading="lazy" />`DenseNet`与`ResNet`的区别是:
`DenseNet`的输出是连接而不是直接相加:
`DenseNet`主要由2部分组成：
- `denseblock`
- `transition layer`
### Denseblock
```python
import torch
from torch import nn
from d2l import torch as d2l

def conv_block(input_channels,num_channels):
	return nn.Sequential(
		nn.BatchNorm2d(input_channels),nn.ReLU(),
		nn.Conv2d(input_channels,num_channels,kernel_size=3,padding=1)
	)
```
一个`denseblock`由多个`conv_block`组成，每个`conv_block`使用相同数量的输出通道:
前向传播中，将每个卷积块的输入和输出在通道维上连接
```python
class DenseBlock(nn.Module):
	def __init__(self,num_convs,input_channels,num_channels):
		super(DenseBlock,self).__init__()
		layer=[]
		for i in range(num_convs):
			layer.append(conv_block(num_channels*i+input_channels,num_channels))
			self.net = nn.Sequential(*layer)
	def forward(self,X):
		for blk in self.net:
			Y = blk(X)
			X = torch.cat((X,Y),dim=1)
		return X
```
好的定义1个有2个通道数为10的DenseBlock，使用通道数为3的输入，会得到通道数为3+2\*10=23的的输出
```python
blk = DenseBlock(2,3,10)
X = torch.randn(4,3,8,8)
Y = blk(X)
Y.shape
```
### 过渡层
由于每个稠密块都会带来通道数的增加，使用过多则会过于复杂化模型，过渡层通过1x1卷积层减小通道数，stride=2的平均池化层减半高宽
```python
def transition_block(input_channels,num_channels):
	return nn.Sequential(
		nn.BatchNorm2d(input_channels),nn.ReLU(),
		nn.Conv2d(input_channels,num_channels,kernel_size=1),
		nn.AvgPool2d(kernel_size=2,stride=1)
	)
```
### DenseNet模型
构造DenseNet模型
```python
bl = nn.Sequential(
	nn.Conv2d(1,64,kernel_size=7,stride=2,padding=3),
	nn.BatchNorm2d(64),nn.ReLU(),
	nn.MaxPool2d(kernel_size=3,stride=2,padding=1)
)
```
接下来使用4个`DenseBlock`
```python
num_channels,growth_rate=64,32
num_conv_in_dense_blocks=[4,4,4,4]
blks=[]
for i,num_conv in enumerate(num_conv_in_dense_blocks):
	blks.append(DenseBlock(num_convs,num_channels,growth_rate))
	num_channels+=num_convs*growth_rate
	#加入一个过渡层，是通道数减半
	if i!=len(num_convs_in_dense_blocks)-1:
		blks.append(transition_block(num_channels,num_channels//2))
		num_channels=num_channels//2
```
```python
net = nn.Sequential(
	bl,*blks,
	nn.BatchNorm2d(num_channels),nn.ReLU(),
	nn.AdaptiveAvgPool2d((1,1)),
	nn.Flatten(),
	nn.Linear(num_channels,10)
)
```
### 训练模型
```python
lr,num_epoches,batch_size=0.1,10,256
train_iter,test_iter=d2l.load_data_fashion_mnist(batch_size,resize=96)
d2l.train_ch6(net,train_iter,test_iter,num_epoches,lr,d2l.try_gpu())
```

### Practice:
1. 为什么我们在过渡层使用平均汇聚层而不是最大汇聚层？
    
2. DenseNet的优点之一是其模型参数比ResNet小。为什么呢？
    
3. DenseNet一个诟病的问题是内存或显存消耗过多。
    
    1. 真的是这样吗？可以把输入形状换成，来看看实际的显存消耗。
        
    2. 有另一种方法来减少显存消耗吗？需要改变框架么？
        
4. 实现DenseNet论文 ([Huang _et al._, 2017](https://zh.d2l.ai/chapter_references/zreferences.html#id73 "Huang, G., Liu, Z., Van Der Maaten, L., & Weinberger, K. Q. (2017). Densely connected convolutional networks. Proceedings of the IEEE conference on computer vision and pattern recognition (pp. 4700–4708)."))表1所示的不同DenseNet版本。
    
5. 应用DenseNet的思想设计一个基于多层感知机的模型。将其应用于 [4.10节](https://zh.d2l.ai/chapter_multilayer-perceptrons/kaggle-house-price.html#sec-kaggle-house)中的房价预测任务