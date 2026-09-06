---
title: "nn.DataParallel"
published: 2026-08-31
description: ""
tags: ["Pytorch distributed"]
draft: false
---
## Summary
- 数据并行vs模型并行
	- 数据并行:模型拷贝(per device),数据 split/chunk
		- the module is replicated on each device,and each reolica handles a portion of th input
		- During The BackWards Pass,gradients from each replica are summed into the original module
	- DPvsDDP
		- Dp:nn.DataParnalled
		- DDp:DistributedDataParallel
		- Use nn.parallel.DistributedDataParallel instead of multiprocessing or nn.DataParallel and Distributed Data Parallel
### Import And Parameters
```python
import torch
import torch.nn as nn
from torch.utils.data import Dataset,DataLoader

#Parameters And DataLoaders
input_size =5
output_size =2

batch_size = 30
data_size = 100
```
```python
device = torch.device('cuda:0' if torch.cuda.is_avaiable() else 'cpu')
device
```
### Dummy Dataset
```python
class RandomDataset(Dataset):
	def __init__(self,size,length):
		self.len = length
		self.data = torch.randn(length,size)
	def __getitem__(self,index):
		return self.data(index)
	def __len__(self):
		return self.len

rand_loader = DataLoader(dataset=RandomDataset(input_size,data_size),batch_size=batch_size,shuffle=True)
```
### Simple Model
```python
class Model(nn.Module):
	def __init__(self,input_size,output_size):
		super(Model,self).__init__()
		self.to=nn.Linear(input_size,output_size)
	def forward(self,input):
		output = self.fc(input)
		print("\tIn Model:input size",input.size(),"output size",output_size())
		return output
```
#### DataParallel
- device_ids = None(None表示ALl device)
	参与训练的GPU,device_ids=gpus
- output_device=None
	用于汇总梯度的GPU是哪个,默认output_device=gpus[0]
- dim=0
The paralleled module must have its parameters and buffers on device_ids[0] before running this DataParallel module
- model.to('cuda:0')
```python
model = Model(input_size,output_size)
if torch.cuda.device.count()>1:
	print("Lets use",torch.cuda.device_count()."GPUs")
	model = nn.DataParalled(model)
```
```python
#model = model.to(device)
model.to(device)
```

##### tensors:to(device)
```python
a = torch.randn(3,4)
print('a is_cuda',a.is_cuda)
b = a.to('cuda:0')
print('a.is_cuda',a.is_cuda)
print('b,is_cuda',b.is_cuda)
```
```
False
False
True
```
##### models:to(device)
```python
a = Model(3,4)
print(next(a.parameters()).is_cuda)
b = a.to('cuda:0')
print(next(a.parameters()).is_cuda)
print(next(b.parameters()).is_cuda)
```
```
False
True
True
```
##### Run The model(forward)
```python
for data in rand_loader:
	# input_var can be on any device,iucluding cpu
	# input = data.to(device)
	input = data
	output = model(input)
	print("Outside:input size",input.size(),
	"output_size",output.size())
```
尽管我们将数据放在了一个device上，但是在Run这个DataParallel的时候会在双卡上复制一份信息，每张卡处理的Input_size reduce了
如果我们打印上面的log，会发现进行了两次内部的数据的拆分数据集的复制，每张卡中的模型接收的样本量降低
