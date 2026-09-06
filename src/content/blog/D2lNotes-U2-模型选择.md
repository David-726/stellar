---
title: "模型选择"
published: 2026-06-06
description: ""
tags: ["正则化"]
draft: false
---
如何实现泛化的能力是学习的根本目的
### 训练误差和泛化误差
我们永远不能准确地计算出泛化误差。 这是因为无限多的数据样本是一个虚构的对象。 在实际中，我们只能通过将模型应用于一个独立的测试集来估计泛化误差， 该测试集由随机选取的、未曾在训练集中出现的数据样本构成。
#### 统计学习理论
#### 模型选择

#### 验证集

#### K折交叉验证
原始训练数据被分成$K$个不重叠的子集。 然后执行$K$次模型训练和验证，每次在$K-1$个子集上进行训练， 并在剩余的一个子集（在该轮中没有用于训练的子集）上进行验证。 最后，通过对$K$次实验的结果取平均来估计训练和验证误差。
### 欠拟合还是过拟合
过拟合并不总是一件坏事。 特别是在深度学习领域，众所周知， 最好的预测模型在训练数据上的表现往往比在保留（验证）数据上好得多。 最终，我们通常更关心验证误差，而不是训练误差和验证误差之间的差距。

#### 模型复杂度
$$
\hat{y}= \sum_{i=0}^d x^i w_i
$$
![images/capacity-vs-error.svg](https://zh.d2l.ai/_images/capacity-vs-error.svg)
高阶多项式函数比低阶多项式函数复杂得多。 高阶多项式的参数较多，模型函数的选择范围较广。 因此在固定训练数据集的情况下， 高阶多项式函数相对于低阶多项式的训练误差应该始终更低（最坏也是相等）。
#### 数据集大小
 训练数据集中的样本越少，我们就越有可能（且更严重地）过拟合。 随着训练数据量的增加，泛化误差通常会减小。

## 多项式回归

```python
import math
import numpy as np
import torch
from torch import nn
from d2l import torch as d2l
```

#### 生成数据集
给定$x$，我们将使用以下三阶多项式来生成训练和测试数据的标签：

$$
y = 5 + 1.2x - 3.4\frac{x^2}{2!} + 5.6 \frac{x^3}{3!} + \epsilon \text{ where }
\epsilon \sim \mathcal{N}(0, 0.1^2).
$$
```python
max_degree = 20
n_train,n_test = 100,100
true_w = np.zeros(max_degree)
true_w[0:4] = np.array([5,1.2,-3.4,5.6])

features = np.random.normal(size =(n_train + n_test,1))
np.random.shuffle(features)
poly_features = np.power(features,np.arrange(max_degress).reshape(1,-1))
for i in range(max_degree):
	poly_features[:,i]/=math.gamma(i+1)
labels = np.dot(poly_features,true_w)
labels += np.random.normal(scale=0.1,size=labels,shape)
true_w,features,poly_features,labels = [torch.tensor(x,dtype=torch.float32)for x in [true_w,faetures,poly_features,lables]]
features[:2],poly_features[:2,:],labels[:2]
```

#### 对模型进行训练和测试
```python
def evaluate_loss(net,data_iter,loss):
	metric = d2l.Accumulator(2)
	for X,y in data_iter:
		l = loss(net(X),y)
		metric.add(l.sum(),d2l.size(l))
	return metric[0]/metric[1]
```

```python
def train(train_features,test_features,train_labels,test_labels,num_epochs=400):
	loss = nn.MSELoss(reduction = 'none')
	input_shape = train_features.sahpe[-1]
	net = nn.Sequential(nn.Linear(input_shape,1,bias=False))
	batch_size = min(10,train_labels.shape[0])
	train_iter = d2l.load_array((train_features,train_labels.reshape(-1,1),batch_size)
	test_iter = d2l.load_array((teset_features,test_labels.reshape(-1,1)),batch_size,is_train_False)
	trainer = torch.optim.SGD(net.parameters(),lr=0.01)
	animator = d2l.Animator(xlabel='epoch',ylabel='loss',yscale='log',xlim=[1,num_epochs],ylim=[le-3,le2],legend=['traim','test'])
	for epoch in range(num_epoches):
		d2l.train_epoch_ch3(net,train_iter,loss,trainer)
		if epoch == 0 or (epoch+1)%20 == 0:
			animator.add(epcoh+1,(evaluate_loss(net,train_iter,loss),evaluate_loss(net,test_iter,loss)))
	print('weight',net[0].weight.data.numpy())
```
#### 三阶多项式函数拟合(正常拟合)
```python
# 从多项式特征中提取前4个维度
train(poly_features[:n_train,:4],poly_features[n_train:,:4],labels[:n_train],labels[n_train:])
```
![images/output_underfit-overfit_ec26bd_78_1.svg](https://zh.d2l.ai/_images/output_underfit-overfit_ec26bd_78_1.svg)

#### 线性函数拟合（欠拟合）
```python
#只取前两个维度
train(poly_features[:n_train,:2],poly_features[n_train:,:2],labels[:n_train],labels[n_train:])
```
#### 高阶多项式拟合（过拟合）
```python
train(poly_features[:n_train,:],poly_features[n_train:,:],labels[:n_train],labels[n_train:],num_epochs=1500)
```
![images/output_underfit-overfit_ec26bd_108_1.svg](https://zh.d2l.ai/_images/output_underfit-overfit_ec26bd_108_1.svg)

### Practice:
1.  这个多项式回归问题可以准确地解出吗？提示：使用线性代数。
    
2.  考虑多项式的模型选择。
    
    1.  绘制训练损失与模型复杂度（多项式的阶数）的关系图。观察到了什么？需要多少阶的多项式才能将训练损失减少到0?
        
    2.  在这种情况下绘制测试的损失图。
        
    3.  生成同样的图，作为数据量的函数。
        
3.  如果不对多项式特征$x^i$进行标准化($1/i!$)，会发生什么事情？能用其他方法解决这个问题吗？
    
4.  泛化误差可能为零吗？

