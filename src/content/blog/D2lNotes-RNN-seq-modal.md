---
title: "seq modal"
published: 2026-08-24
description: ""
tags: ["D2lNotes"]
draft: false
---
目前时间事件发生的概率与之前任一时刻都相关
$$
x_{t}\sim P(x_{t}|x_{t-1},...,x_{1})
$$
### 自回归模型
<img src="/posts/assets/7x9308-sequence-model.svg" alt="sequence-model.svg" loading="lazy" />整个序列的估计值都将通过以下方式获得:
$$
P(x_{1},...,x_{T})=\sum_{t=1}^{T}P(x_{t}|x_{t-1},...,x_{1})
$$
### Markov Model
**?!强强!?**
$$
P(x_{1},...,x_{T})= \sum_{t=1}^{T}P(x_{t}|x_{t-1})当P(x_{1}|x_{0})=P(x_{1})
$$
假设$x_{t}$是离散值时，这样的模型十分出色!
$$
\begin{align}
P(x_{t+1}|x_{t-1})&=\frac{\sum_{x_{t}}P(x_{t+1},x_{t},x_{t-1})}{P(x_{t-1})}\\
&=\sum_{x_{t}}\frac{P(x_{t+1}|x_{t},x_{t-1})P(x_{t},x_{t-1})}{P(x_{t-1})}\\
&= \sum_{x_{t}}P(x_{t+1}|x_{t})P(x_{t}|x_{t-1})
\end{align}
$$

### 因果关系
原则上将$P(x_{1},...,x_{T})$倒序展开也没什么问题
$$
P(x_{1},...,x_{T})=\sum_{t=T}^{1}P(x_{t}|x_{t+1},...,x_{T})
$$
### Train
```python
%matplotlib incline
import torch
from torch import nn
from d2l import torch as d2l

T=100
time=torch.arange(1,T+1,dtype=torch.float32)
x=torch.sin(0.01*time)+torch.normal(0,0.2,(T,))
d2l.plot(time,[x],'time','x',xlim=[1,1000],figsize=(6,3))
```

<img src="/posts/assets/1vklzoc-output_sequence_ce248f_6_0-1.svg" alt="output_sequence_ce248f_6_0 1.svg" loading="lazy" />接下来将改序列转换为模型的特征-标签对
```python
tau = 4
features = torch.zeros((T-tau,tau))
for i in rang(tau):
	features[:,i]=x[i:T-tau+i]
labels = x[tau:].reshape((-1,1))

batch_size,n_train=16,600
train_iter = d2l.load_array((features[:n_train],label[:n_train]),batch_size,is_train=True)
```
使用1个相当简单的架构训练模型:1个拥有2个全连接层的MLP，ReLU和平方损失
```python
def init_weight(m):
	if type(m)==nn.Linear:
		nn.init.xavier_uniform_(m.weight)
def get_net():
	net = nn.Sequential(nn.Linear(4,10),nn.ReLU(),nn.Linear(10,1))
	net.apply(init_weights)
	return net
loss = nn.MSELoss(reduction='none')
```
下面准备训练模型
```python
def train(net,train_iter,loss,epoches,lr):
	trainer=torch.optim.Adam(net.parameters(),lr)
	for epoch in range(epoches):
		for X,y in train_iter:
			trainer.zero_grad()
			l=loss(net(X),y)
			l.sum().backward()
			trainer.step()
		print(f'epoch{epoch+1},'
		f'loss:{d2l.evaluate_loss(net,train_iter,loss):f}')
net = get_net()
train(net,train_iter,loss,5,0.01)
```
### 预测
单步预测:
```python
onestep_preds=net(features)
d2l.plot([time, time[tau:]],
         [x.detach().numpy(), onestep_preds.detach().numpy()], 'time',
         'x', legend=['data', '1-step preds'], xlim=[1, 1000],
         figsize=(6, 3))
```
