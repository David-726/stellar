---
title: "GPU"
published: 2026-08-22
description: ""
tags: ["D2lNotes"]
draft: false
---
## 查看N卡信息
```
nvidia-smi
```
`Pytorch`中，每个数组都有1个`device`,通常称之为`context`,默认情况下，所有的变量和相关的计算都分配给CPU。
多GPU
**多卡计算一定是大趋势**
## 计算设备
指定用于存储和计算的设备
```python
import torch
from torch import nn

torch.device('cpu'),torch.device('cuda'),torch.device('cuda:1')
```
查询可用gpu的数量
```
torch.cuda.device_count()
```
定义2个方便的函数，允许我们在不存在所有GPU的情况下运行代码
```python
def try_gpu(i=0):
	if torch.cuda.device_count()>=i+1:
		return torch.device(f'cuda:{i}')
	return torch.device('cpu')
def try_all_gpus():
	devices = [torch.device(f'cuda:{i}') return devices if devices else [torch.device('cpu')]]

try_gpu(),try_gpu(10),try_all_gpus()
```
查询张量所在的设备，默认情况下是在cpu上创建的
```python
x = torch.tensor([1,2,3])
x.device
```
#### 存储在GPU上
可以在创建张量时候指定存储设备，接下来在第一个gpu上创建张量变量X,在GPU上创建的张量只消耗这个GPU的显存。
```python
X = torch.ones(2,3,device=try_gpu())
X
```
在第2个GPU上创建1个随机张量
```python
Y = torch.rand(2,3,device=try_gpu())
Y
```

### 复制
计算`X+Y`
X在gpu(0)上，Y在gpu(1)上，需要将X移到gpu(1)，才能完成相加计算
```python
Z = X.cuda(1)
print(X)
print(Z)
```
```
Y+Z
```
要是调用`Z.cuda(1)`会怎样,还是会返回`Z`，而不是复制并分配新内存
```
Z.cuda(1) is Z
```

### 神经网络与GPU
神经网络模型也可以指定gpu
```
net = nn.Sequential(nn.Linear(3,1))
net = net.to(device=try_gpu())
```
```
net(X)
```
模型参数存储在同一个GPU上
```
net[0].weight.data.device
```