---
title: "L11"
published: 2026-05-01
description: ""
tags: ["PyTorch"]
draft: false
---
# Advanced CNN
### GoogLeNet
>减少代码的冗余：过程式函数；面向对象类

**Inception
#### Inception Module:
**引入:实际情况下我们不知道Kernel_size选择哪一个比较好用 因而我们在Googlenet的Inception Module块中我们都用一下 然后将几种卷积的结果摞在一起
<img src="/posts/assets/44fmp1-Pasted-image-20260501100005.png" alt="Pasted image 20260501100005.png" loading="lazy" />
**Concatenate:沿着通道Channel拼接
对于pooling和conv都可以通过padding保证size的不变
##### Whats 1*1 Conv:
可以改变Channel的数量
##### Implementation of Inception Module:
- **Average Pooling+1*1conv:
```python
self.branch_pool=nn.Conv2d(in_channels,24,kernel_size=1)

branch_pool=F.avg_pool2d(x,kernel_size=2,stride=1,padding=1)
branch_poll=self.branch_pool(branch_pool)
```
- **1*1Conv:
```python
self.branch1x1=nn.Conv2d(in_channels,16,kernel_size=1)
branch1x1=self.branch1x1(x)
```
- **1*1Conv+5*5Conv:
```python
self.branch5x5_1=nn.Conv2d(in_channels,16,kernel_size=1)
self.branch5x5_2=nn.Conv2d(16,24,kernel_size=5,padding=2)

branch5x5=self.branch5x5_1(x)
branch5x5=self.branch5x5_2(branch5x5)
```
- **1*1Conv+3*3Conv+3*3Conv:
```python
self.branch3x3_1=nn.Conv2d(in_channels,16,kernel_size=1)
self.branch3x3_2=nn.Conv2d(16,24,kernel_size=3,padding_size=1)
self.branch3x3_3=nn.Conv2d(24,24,kernel_size=3,padding_size=1)

branch3x3=self.branch3x3_1(x)
branch3x3=self.branch3x3_2(branch3x3)
```
- **Concatenate:
```python
outputs=[branch1x1,branch5x5,branch3x3,branch_pool]
return torch.cal(outputs,dim=1)
```
```python
class InceptionA(nn.Module):
	def __init__(self,in_channels):
	super(Inception,self).__init__()
	self.branch1x1=nn.Conv2d(in_channels,16,kernel_size=1)
	
	self.branch5x5_1=nn.Conv2d(in_channels,16,kernel_size=1)
	self.branch5x5_2=nn.Conv2d(16,24,kernel_size=5,padding=2)
	
	self.branch3x3_1=nn.Conv2d(in_channels,16,kernel_size=1)
self.branch3x3_2=nn.Conv2d(16,24,kernel_size=3,padding_size=1)
self.branch3x3_3=nn.Conv2d(24,24,kernel_size=3,padding_size=1)
	self.branch_pool=nn.Conv2d(in_channels,24,kernel_size=1)
	
	def forward(self,x):
		branch1x1=self.branch1x1(x)
		
		branch5x5=self.branch5x5_1(x)
		branch5x5=self.branch5x5_2(branch5x5)
		
		branch3x3=self.branch3x3_1(x)
		branch3x3=self.branch3x3_2(branch3x3)
		branch3x3=self.branch3x3_3(branch3x3)
		
		branch_pool=F.avg_pool2d(x,kernel_size=3,stride=1,padding=1)
		branch_poll=self.branch_pool(branch_pool)
		
		outputs=[branch1x1,branch5x5,branch3x3,branch_pool]
		return torch.cat(outputs,dim=1)
```
```python
class Net(nn.Module):
	def __init__(self):
		super(Net,self).__init__()
		#这里第一个参数是1意味着输入单通道
		self.conv1=nn.Conv2d(1,10,kernel_size=5)
		self.conv2=nn.Conv2d(88,20,kernel_size=5)
		
		self.incep1=InceptionA(in_channels=10)
		self.incep2=InceptionA(in_channels=20)
		
		self.mp=nn.MaxPool2d(2)
		self.fc=nn.Linear(1408,10)
	def forward(self,x):
		in_size=x.size(0)
		x=F.relu(self.mp(self.conv1(x)))
		x=self.incep1(x)
		x=F.relu(self.mp(self.conv2(x)))
		x=self.incep2(x)
		x=x_view(in_size,-1)
		#全连接
		x=self.fc(x)
		return x
```
**We need to Go Deeper
##### Can we stack layers to go deeper？
**CIFAR-10
>20层的卷积比50层的卷积性能却更好

**梯度消失
$w=w-\alpha*g$
** Deep Residual Learning:
Residual net
Drawing 2026-05-01 10.52.17.excalidraw
$$
\begin{align}
z=F(x)+x\newline
\frac{\partial L}{\partial x}=\frac{\partial L}{\partial z}*\frac{\partial z}{\partial x}\newline
\frac{\partial z}{\partial x}=\frac{\partial F(x)}{\partial x}+1\newline
\end{align}
$$
**最终我们发现,即使$\frac{\partial F(x)}{\partial x}$很小我们的梯度也不为0而是1 最终无数个约为1的梯度相乘很好的解决了梯度消失的问题
##### Residual NetWork:(残差结构快)
Plain Net VS Residual Net
<img src="/posts/assets/1x7lrd9-Pasted-image-20260501110221.png" alt="Pasted image 20260501110221.png" loading="lazy" />
##### Implementation Of Simple Residual Network
```python
class ResidualBlock(nn.Module):
	def __init__(self,channels):
		super(ResidualBlock,self).__init__()
		self.channels=channels
		self.conv1=nn.Conv2d(channels,channels,kernel_size=3,padding=1)
		self.conv2=nn.Conv2d(channels,channels,kernel_size=3,padding=1)
	def forward(self,x):
		y=F.relu(self.conv1(x))
		y=self.conv2(y)
		#Residual Block
		return F.relu(x+y)
```
```python
class Net(nn.Module):
	def __init__(self):
		super(Net,self).__init__()
		self.conv1=nn.Conv2d(1,16,kernel_size=5)
		self.conv2=nn.Conv2d(16,32,kernel_size=5)
		self.mp=nn.MaxPool2d(2)
		
		self.rblock1=ResidualBlock(16)
		self.rblock2=ResidualBlock(32)
		
		self.fc=nn.Linear(512,10)
	def forward(self,x):
		in_size=x.size(0)
		x=self.mp(F.relu(self.conv1(x)))
		x=self.rblock1(x)
		x=self.mp(F.relu(self.conv2(x)))
		x=self.rblock2(x)
		x=x.view(in_size,-1)
		x=self.fc(x)
		return x
```
>增量式开发

### Exercise:Reading Paper And Implementing
- **Identity Mappings in Deep Network
- **Densrly Connected Convolutional NetWorks