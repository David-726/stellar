---
title: "VGG"
published: 2026-08-23
description: ""
tags: ["CNN"]
draft: false
---
### VGG块
卷积神经网络基本组成:
- 带填充以保持分辨率的卷积层
- 非线性激活函数
- 池化层
一个VGG块与之类似，由一系列卷积层组成，后面加上用于空间下采样的最大汇聚层
```python
import torch
from torch import nn
from d2l import torch as d2l

def vgg_block(num_convs,in_channels,out_channels):
	layers =[]
	for _ in range(num_convs):
	layers.append(nn.Conv2d(in_channels,out_channels,kernel_size=3,padding=1))
	layers.append(nn.ReLU())
	in_channels = out_channels
	layers.append(nn.MaxPool2d(kernel_size=2,stride=2))
	return nn.Sequential(*layer)
```

### VGG网络
VGG网络可以分为两部分:第一部分由卷积层和池化层组成，第二部分由全连接层组成。




<img src="/posts/assets/ay3843-vgg.svg" alt="vgg.svg" loading="lazy" />



VGG神经网络连接几个VGG块，其中有超参数`conv_arch`,改变了指定了卷积层个数二号输出通道
原始VGG网络有5个卷积块，其中前2个块各有1个卷积层，后3个块包含2个卷积层。
改网络采用8个卷积层和3个全连接层，因此被称之为VGG-11
```python
def vgg(conv_arch):
	conv_blks = []
	in_channels=1
	#卷积层部分
	for (num_convs,out_channels)in conv_arch:
		conv_blks.append(vgg_block(num_convs,in_channels,out_channels))
		in_channels=out_channels
	return nn.Sequential(
		*conv_blks,nn.Flatten(),
		nn.Linear(out_channel*7*7,4096),nn.ReLU(),nn.DropOut(0.5)
		nn.Linear(4096,10)
	)
net = vgg(conv_arch)
```
接下来来看一下每个层输出的形状
```python
X = torch.randn(size=(1,1,224,224))
for blk in net:
	X = blk(X)
	print(blk.__class__.__name__,'output shape:\t',X.shape)
```

### Train
```python
ratio = 4
samll_conv_arch = [(pair[0],pair[1]//ratio)for pair in conv_arch]
```
```python
lr,num_epoches,batch_size=0.05,10,128
train_iter,test_iter = d2l.load_data_fashion_mnist(batch_size,resiz=224)
d2l.train_ch6(net,train_iter,test_iter,num_epoches,lr,d2l.try_gpu())
```