---
title: "多输入多输出通道"
published: 2026-08-22
description: ""
tags: ["CNN"]
draft: false
---
# 多输入多输出通道
### 多输入
输入包含多个通道时，需要构造1个与输入数据具有相同输入通道数的卷积核，以便与输入数据进行互相关运算。
对每个通道输入的2为张量和卷积核的二维张量进行互相关运算，再对通道求和得到2维张量，这是多通道输入和多输入通道卷积核之间进行互相关运算的结果:
<img src="/posts/assets/y45azc-conv-multi-in.svg" alt="conv-multi-in.svg" loading="lazy" />
```python
import torch
from d2l import torch as d2l

def corr2d_multi_in(X,K):
	return sum(d2l.corr2d(x,k)for x,k in zip(X,K))
```
### 多输出通道
$c_{i}$和$c_{o}$分别表示输入输出通道的数目，并让$k_{w}$和$k_{h}$为卷积核的高宽，为了多个通道的输出，可以为每个通道创建一个$c_{i}*k_{h}*k_{w}$的卷积核张量，这样卷积和的形状是$c_{o}*c_{i}*k_{h}*k_{w}$
```python
def corr2d_multi_in_out(X,K)：
	return torch.stack([corr2d_multi_in(X,K) for k in K],0)
	
```
```python
K = torch.stacj((K,K+1,K+2),0)
K.shape
corr2d_multi_in_out(X,K)
```
### 1\*1卷积层
**1\*1卷积有什么用**
作用发生在通道上
不改变高宽的前提下，对通道进行线性组合和调整

<img src="/posts/assets/11mr3ur-conv-1x1.svg" alt="conv-1x1.svg" loading="lazy" />
我们仍然可以视作每个像素位置应用的全连接层，以$c_{i}$转换为$c_{o}$个输出值
**妙哉妙哉**
**善**
```python
def corr2d_multi_in_out_1x1(X,K):
	c_i,h,w=X.shape
	c_o=K.shape[0]
	#为了让每个位置进行1次全连接
	X=X.reshape((c_i,h*w))
	K=K.reshape((c_o,c_i))
	
	#全连接中的矩阵运算
	Y=torch.matmul(K,X)
	return Y.reshape((c_o,h,w))
```
```python
X=torch.normal(0,1,(3,3,3))
K=torch.normal(0,1,(2,3,1,1))

Y1=corr2d_multi_in_out_1x1(X,K)
Y2=corr2d_multi_in_out(X,K)
assert float(torch.abs(Y1-Y2).sum())<le-6
```