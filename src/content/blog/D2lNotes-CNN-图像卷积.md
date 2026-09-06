---
title: "图像卷积"
published: 2026-08-22
description: ""
tags: ["CNN"]
draft: false
---
### 互相关运算
严格而言,Conv Kernel进行的不是卷积运算，而是互相关运算
<img src="/posts/assets/zkz0c3-correlation.svg" alt="correlation.svg" loading="lazy" />输出大小略小于输入大小
输出等于:
$$(n_{h}-k_{h}+1)*(n_{w}-k_{w}+1)$$
```python
import torch
from torch import nn
from d2l import torch as d2l

def corr2d(X,K):
	h,w = K.shape
	Y = torch.zeros((X_shape[0]-h+1,X.shape[1]-w+1))
	for i in range(Y.shape[0]):
		for j in range(Y.shape[1]):
			Y[i,j]=(X[i:i+h,j:j+w]*K).sum()
	return Y
```
```python
X = torch.tensor([[0.0,1.0,2.0],[3.0,4.0,5.0],[6.0,7.0,8.0]])
K = torch.tesnor([0.0,1.0],[2.0,3.0])
corr2d(X,K)
```
### 卷积层
```python
class Conv2D(nn.Module):
	def __init__(self,kernel_size)
		super().__init__()
		self.weight = nn.Parameter(torch.rand(kernel_size))
		self.bias = nn.Parameter(torch.zeros(1))
		
	def forward(self,x):
		return corr2d(x,self.weight)+self.bias
```
### 图像中目标的目标检测
中间4列黑色(0),其余白色(1)
```python
X = torch.ones((6,8))
X[:,2:6]=0
X
```
构造1个$h=1,w=2$的卷积核
```
Y = corr2d(X,K)
Y
```
```
corr2d(X.t(),K)
```

### 学习卷积核
有了更复杂的卷积核，或者连续的卷积层，不可能手动设计滤波器，是否可以学习由X生成Y的卷积核呢
构造1个卷积层，并将其初始化为随机张量；在每一次迭代中，比较Y和卷积层输出的平方误差，计算梯度来更新卷积核。
为了简单起见，在此使用内置的2维卷积层
```python
conv2d = nn.Conv2d(1,1,kernel_size=(1,2),bias=False)

X = X.reshape((1,1,6,8))
Y = Y.reshape((1,1,6,7))
lr = 3e-2

for i in range(10):
	Y_hat = conv2d(X)
	l = (Y_hat-Y)**2
	conv2d.zero_grad()
	# 计算权重的梯度
	l.sum().backward()
	
	#迭代卷积核
	conv2d.weight.data[:]-=lr*conv2d.weighth.grad
	if(i+1)%2==0:
		print(f'epoch {i+1},loss{l.sum():.3f'})
```
### Practice:
1. 构建一个具有对角线边缘的图像`X`。
    
    1. 如果将本节中举例的卷积核`K`应用于`X`，会发生什么情况？
        
    2. 如果转置`X`会发生什么？
        
    3. 如果转置`K`会发生什么？
        
2. 在我们创建的`Conv2D`自动求导时，有什么错误消息？
    
3. 如何通过改变输入张量和卷积核张量，将互相关运算表示为矩阵乘法？
    
4. 手工设计一些卷积核。
    
    1. 二阶导数的核的形式是什么？
        
    2. 积分的核的形式是什么？
        
    3. 得到次导数的最小核的大小是多少？
