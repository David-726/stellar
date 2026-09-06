---
title: "参数管理"
published: 2026-08-21
description: ""
tags: ["D2lNotes"]
draft: false
---
# 参数管理
选择了架构和超参数之后，就进入了训练阶段。
Target->找到使损失函数最小化的模型最小值
关注一下这几个点:
- 访问参数，用于调试、诊断和可视化
- 参数初始化
- 不同模型组件之间共享参数
1个具有单隐藏层的多层感知机
```python
import torch
from torch import nn

net = nn.Sequential(nn.Linear(4,8),nn.ReLU(),nn.Linear(8,1))
X = torch.rand(size=(2,4))
net(X)
```
## 参数访问
通过`Sequential`类定义模型时候，可以通过索引访问模型的任意层。就像模型是1个列表一样，每层的参数都在其属性中
```
print(net[2].state_dict())
```
查看第2个全连接层的参数
#### 目标参数
要对参数执行任何操作，首先我们需要访问底层的数值
```
print(type(net[2].bias))
print(net[2].bias)
print(net[2].bias.data)
```
```
net[2].weight.grad == None
```
#### 一次性访问所有参数
递归整个树来提取每个子块的参数
```
print(*[(name,param.shape) for name,param in net[0].named_parameters()])
print(*[(name,param.shape) for name,param in net.named_parameter()])
```
#### 嵌套块调用参数
多个块相互嵌套，参数命名规则是如何工作的，首先定义1个生成块的函数，然后将其组合到更大的块中
```python
def block1():
	return nn.Sequential(nn.Linear(4,8),nn.ReLU(),nn.Linear(8,4),nn.ReLU())
def block2():
	net = nn.Sequential()
	for i in range(4):
		#嵌套 新建一个blocki,内容是block1
		net.add_module(f'block{i}',block1())
	return net
rgnet = nn.Sequential(block2(),nn.Linear(4,1))
rgnet(X)
```
### 参数初始化
#### 内置初始化
将所有权重初始化高斯噪声，偏置初始化0
```python
def init_normal(m):
	if type(m) == nn.Linear:
		nn.init.normal_(m.weight,mean=0,std=0.01)
		nn.init.zeros_(n.bias)
net.apply(init_normal)
net[0].weight.data[0],net[0].bias.data[0]
```
也可以都设置为给定常数，如1
```python
def init_constant(m):
	if type(m) == nn.Linear:
		nn.init.constant_(m.weight,1)
		nn.init.zeros_(m.bias)
net.apply(init_constant)
net[0].weight.data[0],net[0].bias.data[0]
```

还可以对不同的`Block`应用不同的初始化方法，下面用`Xavier`方法初始化第一个神经网络层
```python
def init_xavier(m):
	if type(m) == nn.Linear:
		nn.init.xaiver_uniform_(m.weight)
def init_42(m):
	if type(m) == nn.Linear:
		nn.init.constant_(m.weight,42)
net[0].apply(init_xavier)
net[2].apply(init_42)
print(net[0].weight.data[0])
print(net[2].weight.data)
```

#### 自定义初始化
$$
w \sim
\begin{cases}
U(5,10), & \text{可能性 } \frac{1}{4} \\[6pt]
0, & \text{可能性 } \frac{1}{2} \\[6pt]
U(-10,-5), & \text{可能性 } \frac{1}{4}
\end{cases}
$$
```python
def my_init(m):
	if type(m) == nn.Linear:
		print("Init",*[(name,param.shape)
						for name,param in m.named_parameters()][0])
		nn.init.uniform_(m.weight,-10,10)
		m.weight.data*=m.weight.data.abs()>=5
net.apply(my_init)
net[0].weight[:2]
```
我们始终可以直接设置参数
```python
net[0].weight.data[:] += 1
net[0].weight.data[0,0] = 42
net[0].weight.data[0]
```

### 参数绑定
**在多个层之间共享参数**
```python
shared == nn.Linear(8,8)
net = nn.Sequential(nn.Linear(4,8),nn.ReLU(),shared,nn.ReLU(),shared,nn.ReLU(),nn.Linear(8,1))
net(X)

print(net[2].weight.data[0] == net[4].weight.data[0])
net[2].weight.data[0,0] = 100
print(net[2].weight.data[0]==net[4].weight.data[0])
```
*YesbutWhy*
为什么要这样