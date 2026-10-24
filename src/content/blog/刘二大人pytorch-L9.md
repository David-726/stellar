---
title: "L9"
published: 2026-04-26
description: ""
tags: ["PyTorch"]
draft: false
---
# 多分类问题处理
**Revision:MNIST Dataset:
There are 10 labels in MNIST dataset.
#### Design 10 outputs using Sigmoid?
我们希望得到我们的样本的输出$\hat y$的概率分布
所以我们希望每一个$\hat y^{(i)}$都>0且$\sum_{i=1}^{N}\hat y^{(i)}=1$
We hope the outputs is competitive!
Actually we hope the netural network outputs a distribution
### Output a Distribution of prediction with Softmax
**Softmax layer:
such that:
$$
\begin{align}
P(y=i)>=0\\
\sum_{i=0}^{0}P(y=i)=1
\end{align}
$$
### Softmax Layer:
Suppose $Z^l \in \mathbb{R}^K$ is the output of the last inear layer,the Softmax function:
$P(y=i)=\frac{e^{z_{i}}}{\sum){j=0}^{K-1}e^{z_{j}}}$

**分母求和保证结果为1
#### Softmax Layer -Example




<img src="/posts/assets/1qe796j-Pasted-image-20260426135251.png" alt="Pasted image 20260426135251.png" loading="lazy" />




#### Loss function-Cross Entropy




<img src="/posts/assets/1x0qujf-Pasted-image-20260426135749.png" alt="Pasted image 20260426135749.png" loading="lazy" />




将softmax的输出转化为独热编码one-hot code形式
$Loss(\hat Y,Y)=-Ylog(\hat Y)$
```python
#NLLloss
import numpy as np
y=np.array([1,0,0])
z=np.array([0.2,0.1,-0.1])
y_pred=np.exp(z)/np.exp(z).sum()
loss=(-y*np.log(y_pred).sum())
print(loss)
```
```python
import torch
y=torch.LongTensor([0])
z=torch.Tensor([0.2,0.1,-0.1])
#torch提供了crossEntropyLoss的交叉熵损失函数
criterion=torch.nn.CrossEntropyLoss()
loss=criteration(z,y)
print(loss)
```
**Mini-Batch:batch_size=3
```python
import torch
criterion=torch.nn.CrossEntropyLoss()
Y=torch.LongTensor([2,0,1])
Y_pred1=torch.Tensor([0.1,0.2,0.9],
					 [1.1,0.1,0.2],
					 [0.2,2.1,0.1])
Y_pred2=torch.Tensor([0.8,0.2,0.3],
					 [0.2,0.3,0.5].
					 [0.2,0.2,0.5])
l1=criterion(Y_pred1,Y)
l2=criterion(Y_pred2,Y)
print("Batch Loss1= ",l1.data,"\nBatch Loss2=",l2.data)
```
**Exercise:CrossEntropyLoss Vs NLLLoss
- What's the differences?
- Reading the document:
	- [https://pytorch.org/docs/stable/nn.html#crossentropyloss]
	- [https://pytorch.org/docs/stable/nn.html#nllloss]
- Try to know why:
	- CrossEntropyLoss<==>LogSoftmax+NLLLoss

### Back to MNIST Dataset:
#### Implementation of classifier to MNIST dataset:
- Prepare dataset
- Design model using Class
- Construct loss and optimizer
- Traing cycle+Test
```python
#For constructing DataLoader
import torch
from torchvision import transforms
from torchvision import datasets
from torch.utils.data import DataLoader
#For using Relu()
import torch.nn.functional as F
import torch.optim as optim
batch_size=64
transform=transform.Compose([
	transforms.ToTensor(),
	#The parameters are mean and std respectively.It use formulation below:
	transforms.Normalize((0.1307,),(0.3081,))
	#第一个参数是均值，第二个参数是标准差
])
train_dataset=datasets.MNIST(root='../dataset/mnist/',train=True,download=True,transform=transform)
train_loader=DataLoader(train_dataset,shuffle=True,batch_size=batch_size)

test_dataset=datasets.MNIST(root='../dataset/mnist/',train=False,download=True,transform=transform)
test_loader=Dataloader=DataLoader(test_dataset,shuffle=False,batch_size=batch_size)
```
```python
#The parameters are mean and std respectively.It use formulation below:
	transforms.Normalize((0.1307,),(0.3081,))
	#第一个参数是均值，第二个参数是标准差
```
**我们希望满足标准正态分布:$N(0,1)$
$\frac{X-\mu}{\theta}$即可完整标准化操作
$Pixel_{norm}=\frac{Pixel_{origin}-mean}{std}$
**PIL image:
$$
\begin{align}
\mathbf{Z}^{28*28},pixel\in\{0,...,255\}
\end{align}
$$
Pytorch image:
$$
\begin{align}
\mathbf{R}^{1*28*28},pixel \in[0,1]
\end{align}
$$

- Input Layer
- Linear Layer
- ReLU Layer
- Output Layer

**原来的MNIST数据集中的数据都是28\*28
```伪代码的实现
x=x.view(-1,784)
#view改变张量的形状
self.l1=torch.nn.Linear(784,512)
x=F.relu(self,l1(x))
self.l2=torch.nn.Linear(512,256)
x=F.relu(self,l2(x))
self.l3=toch.nn.Linear(256,128)
x=F.relu(self,l3(x))
self.l4=torch.nn.Linear(128,64)
x=F.relu(self,l4(x))
self.l5=torch.nn.Linear(64,10)
```
```python
class Net(torch.nn.Module):
	def __init__(self):
		super(Net,self).__init__()
		self.l1=torch.nn.Linear(784,512)
		self.l2=torch.nn.Linear(512,256)
		self.l3=torch.nn.Linear(256,128)
		self.l4=torch.nn.Linear(128,64)
		self.l5=torch.nn.Linear(64,10)
	def forward(self,x):
		x=x.view(-1,784)
		x=F.relu(self,l1(x))
		x=F.rrlu(self,l2(x))
		x=F.relu(self,l3(x))
		x=F.relu(self,l4(x))
		return self.l5(x)
model=Net()
criterion=torch.nn.CrossEntropyLoss()
optimizer=optim.SGD(model.parameters(),lr=0.01,momentim=0.5)
def train(epoch):
	running_loss=0.0
	for batch_idx,data in enumerate(train_loader,0):
		imputs,target=data
		optimizer.zero_grad()
		
		#forward+backward+update
		outputs=model(inputs)
		loss=criterion(outputs,target)
		loss.backward()
		optimizer.step()
		
		running_loss+=loss.item()
		if batch_idx %300 == 299:
			print('[%d,%5d]loss:%.3f'%(epoch+1,batch_idx+1,running_loss/300))
			running_loss=0.0
```
```python
def test():
	correct=0
	total=0
	with torch.no_grad():
		for data in test_loader:
		images,labels=data
		outputs=model(images)
		_,predicted=torch.max(outputs.data,dim=1)
		total+=labels.size(0)
		correct+=(predicted==labels).sum().item()
	print('Accuracy on test set:%d %%'%(100*correct/total))
```
```python
if __name__ == 'main'
	for epoch in range(10)：
		train(epoch)
		test()
```
>FFT Wavelength  CNN

### Exercise:Classifier Implementation:
**Try to implement a classfier for:
- Otto Group Product Classfication Challenage
- Dataset:[https://www.kaggle.com/c/otto-group-product-classification-chanllenge/data]
