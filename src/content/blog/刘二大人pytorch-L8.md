---
title: "L8"
published: 2026-04-26
description: ""
tags: ["PyTorch"]
draft: false
---
# Dataset and DataLoader
**Revision:Manual date feed:
- Batch
- Stochastic Gradient Descent
### Terminology:Epoch,Batch-size,Lierations:
```python
#Training cycle:
for epoch in range(training_epochs):
	#Loop overt all batchs:
	for i in range(total_batchs):
```
***Definition:Lteration:
Numbers of passes,each passing using [batch size]number of examples.
### DataLoader:batch-size=2,shuffle=True
need:index and len
shuffle:打乱顺序
Loader:几个一组做成一个可以迭代的Loader分别是几个Batch
### How to define your Dataset
```python
import torch
from torch.utils.dara import Dataset
from torch.utils.data import DataLoader#DataLoader is a class to help us loading data in Pytorch

class DiabetesDataset(Dataset:)
	def __init__(self):
		pass
	#The expression,dataset[index],will call this magic function.
	def __getitem__(self,index):
		pass
	#This magic function returns the length of dataset
	def __len__(self):
		pass
#Initilize loader with batch-size,shuffle,process number
dataset=DiabetesDataset()
train_loader=DataLoader(dataset=dataset,batch_size=32,shuffle=True,num_workers=2)

```
**如果数据集本身不够大 那么我们就将其直接读到内存中
如果处理图像语音这种非结构性的数据 这时候我们就要想我们能不能给他加载到内存当中

```python
for epoch in range(100):
	for i,data in enumerate(train_loader,0):
	#The implementation of multiprocessing is defferent on Wh=indows,which uses spawn instead of fork So left code will cause:
```
**So we have to warp the code with an if-clause to protect the code from executing multiple times.
```python
if __name__=='_mian_':
	for epoch in range(100):
		for i,data in enumerate(train_loader,0):
			#1.Prepare data
```
```python
class DiabetesDataset(Dataset):
	def __init__(self,filepath):
	xy=np.loader(filepath,delimiter=',',dtype=np.float32)
	self.len=xy.shape[0]
	self.x_data=torch.from_numpy(xy[:,:[-1]])
	self.y_data=torch.form_numpy(xy[:,[-1]])
	
	def __getitrm__(self,index):
		return self.x_data[index],self.y_data[index]
	def __lem__(self):
		return self,len
dataset=DiabetesDataset('diabetes.csv.gz')
train_loader=DataLoader(dataset=dataset,batch_size=32,shuffle=True,num_workers=2)
```
```python
#training cycle:
for epoch in range(100):
	for i,data in enumerate(train_loader,0):
	#Prepare data:
	inputs,labels=data
	#Forward:
	y_pred=model(inputs)
	loss=criterion(y_pred,labels)
	print(epoch,i,loss.item())
	#Backward
	optimizer.zero_grad()
	loss.backward()
	#Update
	optimizer.step()
```
**Classifying Diabetes:
#### The following dataset loaders are available:
MNIST Fashion-MNIST EMNIST COCO LSUN ImageFolder DatasetFolder Imagenet-12 CIFAR STL10 PhotoTour
>torchvision.datasets
```python
import torch
from torch.utils.data import Dataloader
from torchvision import transforms
from torchvision import datasets

train_dataset=dataset.MNIST(root='../dataset/mnist',train=True,transform=transforms.ToTensor(),download=True)
test_dataset=datasets.MNIST(root='../dataset/mnist',train=False,transform=transforms.ToTensor(),download=True)
train_loader=DataLoader(dataset=train_dataset,batch_size=32,shuffle=True)
test_loader=DataLoader(dataset=test_dataset,batch_size=32,shuffle=False)
for batch_idx,(inputs,target)in enumerate(train_loader):
```
#### Exercise:
**Build Dataloader for 
Titanic dataset:[https://www.kaggle.com/c/titanic/data]
Build a classifier using the Dataloader

