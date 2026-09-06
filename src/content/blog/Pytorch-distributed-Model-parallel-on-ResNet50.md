---
title: "Model parallel on ResNet50"
published: 2026-09-01
description: ""
tags: ["Pytorch distributed"]
draft: false
---
### outline
- 数据并行是且数据(scattering inputs and gathering outputs),模型并行是切模型(model)
	- 模型并行:单卡放不下一个模型
	- 将1份大模型，不同的层s切到不同的卡上
- 模型并行 on ToyModel 怎么给1个模型切到不同的卡上
- 模型并行: on ResNet
	- 不要引入额外的torch api支持
### huggingface支持
#### device_map
- `auto`
	- GPU(s)>CPU(RAM)>Disk
```python
from transformers import LlamaTokenizer,LlamaForGauselLM，GenerationConfig
model = LlamaForCauselLM.from_pretained(
	"decapoda-research/lla,a-7b-hf",load_in_8bit=True,
	device_map="auto")
for i,para in enmuerate(model.named_parameters()):
	print(f'{i} ,\t {para[1].device}\t{para[1].dtype}')
```
### toy example
```python
import torch
import torch.nn as nn
import torch.optim as optim

class ToyModel(nn.Module):
	def __init__(self):
		super(ToyModel,self).__init__()
		self.net1 = torch.nn.Linear(10000,10).to('cuda:0')
		self.relu = torch.nn.ReLU()
		self.net2 = torch.nn.Linear(10,5).to('cuda:1')
		
	def forward(self,x):
		x = self.relu(self.net1(x.to('cuda:0')))
		return self.net2(x.to('cuda:2'))
```
```python
model = ToeModel()
```
```python 
model.relu
```
```python
type(list(model.net1.parameter())[0])
```
```python
print(next(model.net1.parameters()).device)
print(next(model.net2.parameters()).device)
```
```python
model = ToyModel()
loss_fn = nn.MSELoss()
optimizer = optim.SGD(model.parameters(),lr=0.001)

optimizer.zero_grad()
outputs = model(torch.rand(20,10000))
labels = torch.randn(20,5).to('cuda:1')
loss_fn(outputs,labels).backward()
optimizer.step()
```
### Split ResNet
以ResNet34为例
```python
import torch
from torch import nn
from torchvision.models.resnet import ResNet,Bottleneck
```
```python
#ResNet50
model = ResNet(Bottleneck,[3,4,6,3])
```
```python
#conv1->bn1->relu->maxpool->layer1-layer4->avgpool->fc
model
```
```python
from torchsummary import suammary
```
```python
summary(model,input_size=(3,128,128),device='cpu')
```
### 自定义模型并行
```python
t = torch.rand((2,3,4))
print(t.shape)
t.view(t.size(0),-1).shape
```
```python
class ModelParallelResNet50(ResNet):
	def __init__(self,num_classes=1000):
		super().__init__(Bottleneck,[3,4,6,3],num_classes=num_classes)
		self.seq1 = nn.Sequential(
			self.conv1,
			self.bn1,
			self.relu,
			self.maxpool,
			self.layer1,
			self.layer2
		).to('cuda:0')
		self.seq2 = nn.Sequential(
			self.layer3,
			self.layer4,
			self.avgpool,
		).to('cuda:1')
		self.fc.to('cuda:1')
	def forward(self,x):
		# model parts(layers) 的一个(卡间)串行
		x = self.seq2(self.seq1(x).to('cuda:1'))
		return self.fc(x.view(x.size(0),-1))
```
```python
def model_size(model):
	return sum([para.numel() for para in model.parameters()])
```
```python
model_size(model)
```
```python
mp_model = ModelParallelResNet50()
model_size(mp_model)
```
### train pipeline
```python
num_classes = 1000
```
```python
one_hot_indices = torch.LongTensor(5)\
						.random_(0,num_classes)\
						.view(5,1)
one_hot_indices
```
```python
num_batches = 3
batch_size = 120
image_w = 128
image_h = 128

def train(model):
	model.train(True)
	loss_fn=nn.MSELoss()
	optimizer = optim.SGD(model.parameters(),lr=0.01)
	
	one_hot_indices = torch.LongTensor(batch_size)\
							.random_(0,num_classes)\
							.view(batch_size,1)
			
	for _ in range(num_batches):
		# generate random inputs and labels
		# (b,c,w,h)
		inputs = torch.randn(batch_size,3,image_w,image_h)
		# onehot:(batch_size,num_classes),行粒度只有一个为1 (one-hot)
		labels = torch.zeros(batch_size,num_classes)\
						.scatter_(1,one_hot_indices,1)
		optimizer.zero_grad()
		outputs = model(inputs.to('cuda:0'))
		#run backward pass
		labels = labels.to(outputs.device)
		loss_fn(outputs,labels).backward()
		optimizer.step()
```
#### 可视化
```python
import  matplotlib.pyplot as plt
import numpy as np
import timeit

num_repeat = 10

stmt ='train(model)'
# 模型并行
setup = "model=ModelParellelResNet50()"
mp_run_times = timeit.repeat(
	stmt,setup,number=1,repeat=num_repeat,globals=globals())
mp_mean,mp_std=np.mean(mp_run_times),no.std(mp_run_times)
#单卡
setup = "import torchvision.models as models;"+\
		"model = models.resnet50(num_classes=num_classes).to("cuda:0")"
rn_run_times = timeie.repeat(
		stmt,setup,number=1,repeat=num_repeat,globals=globals())
rn_mean,rn_std = np.mean(rn_run_times),np.std(rn_run_times)

def plot(means,stds,labels,fig_name):
	fig,ax = plt.subplots()
	ax.bar(np.arange(len(means)),means,yerr=stds,align="center",alpha=0.5,ecolor='red',capsize=10,width=0.6)
	ax.set_ylabel('ResNet50 Execuation Time(Second)')
	ax.set_xticks(np.arange(len(means)))
	ax.set_xticklabels(labels)
	ax.yaxis.frid(True)
	plt.tight_layout()
```
```python
plot([mp_mean,rn_mean],
	 [mp_std,rn_std],
	 ['Model Parallel','Single GPU'],
	 'mp_vs_rn.png')
```
```python
mp_mean,rn_mean
```
```python
(mp_mean-rn_mean)/rn_mean
```



