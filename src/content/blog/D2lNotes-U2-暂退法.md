---
title: "暂退法"
published: 2026-06-07
description: ""
tags: ["正则化"]
draft: false
---

当面对更多的特征而样本不足时，线性模型往往会过拟合。 相反，当给出更多样本而不是特征，通常线性模型不会过拟合。
泛化性和灵活行之间的基本权衡被描述为偏差和偏差权衡**bias-variance tradeoff** 线性模型有很高的偏差：它们只能表示一小类函数。 然而，这些模型的方差很低：它们在不同的随机数据样本上可以得出相似的结果。深度神经网络则位于偏差-方差谱的另一端。

即使我们有比特征多得多的样本，深度神经网络也有可能过拟合。深度网络的泛化性质令人费解，而这种泛化性质的数学基础仍然是悬而未决的研究问题。

### 暂退法(dropout)
 暂退法在前向传播过程中，计算每一内部层的同时注入噪声，这已经成为训练神经网络的常用技术。 这种方法之所以被称为暂退法，因为我们从表面上看是在训练过程中丢弃（drop out）一些神经元。 在整个训练过程的每一次迭代中，标准暂退法包括在计算下一层之前将当前层中的一些节点置零。
 在标准暂退法正则化中，通过按保留（未丢弃）的节点的分数进行规范化来消除每一层的偏差。 换言之，每个中间活性值$h$以暂退概率$p$由随机变量$h'$替换，如下所示：
$$
\begin{split}\begin{aligned}
h' =
\begin{cases}
    0 & \text{ 概率为 } p \\
    \frac{h}{1-p} & \text{ 其他情况}
\end{cases}
\end{aligned}\end{split}
$$

#### 实践中暂退法
 当我们将暂退法应用到隐藏层，以$p$的概率将隐藏单元置为零时， 结果可以看作一个只包含原始神经元子集的网络。 比如在右图中，删除了$h_2$和$h_5$， 因此输出的计算不再依赖于$h_2$或$h_5$，并且它们各自的梯度在执行反向传播时也会消失。 这样，输出层的计算不能过度依赖于$h_1, \ldots, h_5$的任何一个元素。

![images/dropout2.svg](https://zh.d2l.ai/_images/dropout2.svg)

### 从0开始的实现
```python
import torch
from torch import nn
from d2l import torch as d2l

def dropout_layer(X,dropout):
	assert 0<=dropout<=1
	if dropout == 1:
		return torch.zeros_like(X)
	if dropout == 0:
		return X
	mask = (torch.rand(X.shape)>dropout).float()
	return mask*X/(1.0 - dropout)
```

```python
X = np.arrange(16).reshape(2,8)
print(drop_layer(X,0))
print(drop_layer(X,0.5))
print(drop_layer(X,1))
```
#### 定义模型参数
```python
dropout1,dropout2 = 0.2,0.5
class Net(nn.Module):
	def __init__(self,num_inputs,num_outputs,num_hiddens1,num_hiddens2,is_train = True)
	super(Net,self).__init__()
	self.num_inputs = num_inputs
	self.training = is_training
	self.lin1 = nn.Linear(num_inputs,num_hiddens1)
	self.lin2 = nn.Linear(num_hiddens1,num_hiddens2)
	self.lin2 = nn.Linear(num_hiddens2,num_outputs)
	self.relu = nn.Relu()
	
	def forward(self,X):
		H1 = self.relu(self.lin1(X.reshape(-1,self.num_inputs)))
		if self.training == True:
			H1 = dropout_layer(H1,dropout1)
		H2 = self.relu(self.lin(H1))
		if self.training == True:
			H2 = dropout_layer(H2,dropout2)
		out = self.lin3(H2)
		return out
net = Net(num_inputs,num_outputs,num_hiddens1,num_hiddens2)

```
```python
num_epochs,lr,batch_size=10,0.5,256
loss = nn.CrossEntropy(reduction = 'none')
train_iter,test_iter = d2l.load_data_fashion_mnist(batch_size)
trainer = torch.optim.SGD(net.parameters(),lr=lr)
d2l.train_ch3(net,train_iter,test_iter,loss,num_epoches,trainer)
```
![images/output_dropout_1110bf_63_0.svg](https://zh.d2l.ai/_images/output_dropout_1110bf_63_0.svg)

### Pytorch 的简洁实现
```python
net = nn.Sequential(nn.Flatten(),nn.Linear(784,256),nn.ReLU(),
nn.Dropout(dropout1),nn.Linear(256,256),nn.ReLU(),nn.Dropout(dropout2),nn.Linear(256,10))
def init_weight(m):
	if type(m) == nn.Linear:
		nn.init.normal_(m.weight,std=0.01)
net.apply(init_weight)

trainer = torch.optim.SGD(net.parameters(),lr=lr)
d2l.train_ch3(net,train_iter,test_iter,num_epochs,trainer)
```

#### Practice:
1.  如果更改第一层和第二层的暂退法概率，会发生什么情况？具体地说，如果交换这两个层，会发生什么情况？设计一个实验来回答这些问题，定量描述该结果，并总结定性的结论。
    
2.  增加训练轮数，并将使用暂退法和不使用暂退法时获得的结果进行比较。
    
3.  当应用或不应用暂退法时，每个隐藏层中激活值的方差是多少？绘制一个曲线图，以显示这两个模型的每个隐藏层中激活值的方差是如何随时间变化的。
    
4.  为什么在测试时通常不使用暂退法？
    
5.  以本节中的模型为例，比较使用暂退法和权重衰减的效果。如果同时使用暂退法和权重衰减，会发生什么情况？结果是累加的吗？收益是否减少（或者说更糟）？它们互相抵消了吗？
    
6.  如果我们将暂退法应用到权重矩阵的各个权重，而不是激活值，会发生什么？
    
7.  发明另一种用于在每一层注入随机噪声的技术，该技术不同于标准的暂退法技术。尝试开发一种在Fashion-MNIST数据集（对于固定架构）上性能优于暂退法的方法。