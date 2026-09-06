---
title: "Linear Regression"
published: 2026-05-25
description: ""
tags: ["D2lNotes"]
draft: false
---
# Linear Regression
通常，我们使用$n$来表示数据集中的样本数。 对索引为$i$的样本，其输入表示为$\mathbf{x}^{(i)} = [x_1^{(i)}, x_2^{(i)}]^\top$， 其对应的标签是$y^{(i)}$。
### 线性模型
线性假设是指目标（房屋价格）可以表示为特征（面积和房龄）的加权和，如下面的式子：
$$
\mathrm{price} = w_{\mathrm{area}} \cdot \mathrm{area} + w_{\mathrm{age}} \cdot \mathrm{age} + b.
$$
$w_{area}$和$w_{age}$称为权重**weight**,b称之为偏移**bias**、偏移量**offset**或是截距。
严格的说:上式是对输入特征的一个仿射变换。仿射变换的特点是通过加权和对特征线性变换，并通过偏执来求平移。
给定一个数据集，我们的目标是寻找模型的权重$\mathbf{w}$和偏置$b$， 使得根据模型做出的预测大体符合数据里的真实价格。
- 在机器学习领域，我们通常使用的是高维数据集，建模时采用线性代数表示法会比较方便。 当我们的输入包含$d$个特征时，我们将预测结果$\hat{y}$ 表示为：
$$
\hat{y} = w_1  x_1 + ... + w_d  x_d + b.
$$
>我们常将预测结果用$\hat y$表示


将所有特征放到向量$\mathbf{x} \in \mathbb{R}^d$中， 并将所有权重放到向量$\mathbf{w} \in \mathbb{R}^d$中， 我们可以用点积形式来简洁地表达模型：
$$
\hat{y} = \mathbf{w}^\top \mathbf{x} + b.
$$
对于特征集合$\mathbf{X}$，预测值$\hat{\mathbf{y}} \in \mathbb{R}^n$ 可以通过矩阵-向量乘法表示为：
$$
{\hat{\mathbf{y}}} = \mathbf{X} \mathbf{w} + b
$$
这个过程中的求和将使用广播机制
>广播机制

我们相信给定$\mathbf{x}$预测$y$的最佳模型会是线性的， 但我们很难找到一个有$n$个样本的真实数据集，其中对于所有的$1 \leq i \leq n$，$y^{(i)}$完全等于$\mathbf{w}^\top \mathbf{x}^{(i)}+b$。 无论我们使用什么手段来观察特征$\mathbf{X}$和标签$\mathbf{y}$， 都可能会出现少量的观测误差。 因此，即使确信特征与标签的潜在关系是线性的， 我们也会加入一个噪声项来考虑观测误差带来的影响。

### Loss Function
$$
Loss^{i}(w,b)=\frac{1}{2}(\hat y^{i}-y^{i})^{2}
$$
**1/2只是为了求导的时候方便**


![images/fit-linreg.svg](https://zh.d2l.ai/_images/fit-linreg.svg)

##### Mean Average Square Error
$$
L(w,b)=\frac{1}{n}\sum_{i=1}^{n}L^{i}(w,b)=\frac{1}{n}\sum_{i=1}^{n}\frac{1}{2}(W^{T}x^{i}+b-y^{i})^{2}
$$
在模型训练过程中，我们希望寻找最优解$w^{*}$和$b^{*}$
$$
w^{*},b^{*}=argmin_{w,b}\,L(w,b)
$$
#### 解析解 analytical solution
**线性回归的解可以用一个公式简单的表达出来，这类解叫做解析解.
$$
w^{*}=(X^{T}X)^{-1}X^{T}y
$$
对于线性回归这种简单的问题存在解析解，但并不是所有的问题都存在解析解。
#### Stochastic Gradient Descent
###### Gradient Descent
$$
(\mathbf{w},b) \leftarrow (\mathbf{w},b) - \frac{\eta}{|\mathcal{B}|} \sum_{i \in \mathcal{B}} \partial_{(\mathbf{w},b)} Loss^{(i)}(\mathbf{w},b).
$$

- 初始化模型参量的值，如随机初始化
- 从数据集中随机抽取小批量样本且在负梯度的方向上更新参数，并且不断迭代这一步骤。对于平方损失和仿射变换
$$
\begin{split}\begin{aligned} \mathbf{w} &\leftarrow \mathbf{w} -   \frac{\eta}{|\mathcal{B}|} \sum_{i \in \mathcal{B}} \partial_{\mathbf{w}} l^{(i)}(\mathbf{w}, b) = \mathbf{w} - \frac{\eta}{|\mathcal{B}|} \sum_{i \in \mathcal{B}} \mathbf{x}^{(i)} \left(\mathbf{w}^\top \mathbf{x}^{(i)} + b - y^{(i)}\right),\\ b &\leftarrow b -  \frac{\eta}{|\mathcal{B}|} \sum_{i \in \mathcal{B}} \partial_b l^{(i)}(\mathbf{w}, b)  = b - \frac{\eta}{|\mathcal{B}|} \sum_{i \in \mathcal{B}} \left(\mathbf{w}^\top \mathbf{x}^{(i)} + b - y^{(i)}\right). \end{aligned}\end{split}
$$
$\mathcal{B}$称之为batch_size 批量大小、$\eta$称之为学习率 learning rate
batchsize和learningrate灯都不随模型的更新而更新，而是可以调整的，我们称之为超参数。
**调参**是我们选择超参数的过程。超参数一般是在我们的验证数据集的训练迭代结果上评估过得来的。
**Def 泛化**
线性回归恰好是一个在整个域中只有一个最小值的学习问题。 但是对像深度神经网络这样复杂的模型来说，损失平面上通常包含多个最小值。 深度学习实践者很少会去花费大力气寻找这样一组参数，使得在_训练集_上的损失达到最小。 事实上，更难做到的是找到一组参数，这组参数能够在我们从未见过的数据上实现较低的损失， 这一挑战被称为**泛化（generalization)**
### 矢量化加速
在训练我们的模型时，我们经常希望能够同时处理整个小批量的样本。 为了实现这一点，需要我们对计算进行矢量化
```python
%matplotlib inline
import math
import time
from mxnet import np
from d2l import mxnet as d2l
```
一种方法中，我们将使用Python的for循环遍历向量。但那样十分耗时。
我们使用重载的`+`运算符来计算按元素的和
```python
n=100000
a=ones([n])
b=ones([n])
d= a+b
```
#### 正态分布和噪声
**Normal distribution**或是叫做高斯分布
$$
p(x) = \frac{1}{\sqrt{2 \pi \sigma^2}} \exp\left(-\frac{1}{2 \sigma^2} (x - \mu)^2\right).
$$
```python
def normal(x,mu,sigma):
	p =1/math.sqrt(2*math.pi*sigma**2)
	return p*np.exp(-0.5/sigma**2 * (x-mu)**2)

x = np/arrange(-7,7,0.01)
params=[(0,1),(0,2),(3,1)]
d2l.plot(x.asnumpy(), [normal(x, mu, sigma).asnumpy() for mu, sigma in params], xlabel='x',
         ylabel='p(x)', figsize=(4.5, 2.5),
         legend=[f'mean {mu}, std {sigma}' for mu, sigma in params])
```

选择Maen Square Error 用于LR的原因：假设观测中含噪声，且噪声属于正态分布
$$
y=w^{T}x+b+\epsilon
$$
其中$\epsilon \sim \mathcal N(0,\sigma^{2})$
#### 对数似然
>似然

$$
P(y \mid \mathbf{x}) = \frac{1}{\sqrt{2 \pi \sigma^2}} \exp\left(-\frac{1}{2 \sigma^2} (y - \mathbf{w}^\top \mathbf{x} - b)^2\right).
$$
**使用极大似然估计法**
$$
P(\mathbf y \mid \mathbf X) = \prod_{i=1}^{n} p(y^{(i)}|\mathbf{x}^{(i)}).
$$
$$
\begin{split}
P(y|x)=exp(log(\frac{1}{\sqrt{2\pi\sigma^{2}}}))\exp\left(-\frac{1}{2 \sigma^2} (y - \mathbf{w}^\top \mathbf{x} - b)^2\right)
=-\frac{1}{2}exp(log(w\pi\sigma^{2}))exp(-\frac{1}{2\sigma^{2}}*(y-w^{T}x-b))^{2}
\end{split}
$$$$
-\log P(\mathbf y \mid \mathbf X) = \sum_{i=1}^n \frac{1}{2} \log(2 \pi \sigma^2) + \frac{1}{2 \sigma^2} \left(y^{(i)} - \mathbf{w}^\top \mathbf{x}^{(i)} - b\right)^2.
$$
### Practice:
1.  假设我们有一些数据$x_1, \ldots, x_n \in \mathbb{R}$。我们的目标是找到一个常数$b$，使得最小化$\sum_i (x_i - b)^2$。
    
    1.  找到最优值$b$的解析解。
	    $$
	    %MSE
	    \begin{align}
	    J(x_{i},b)&=\frac{1}{2}\sum_{i}^{n}(x_{i}-b)^{2}\\
	    \frac{\partial{J(x_{i},b)}}{\partial{b}}&=-\sum_{i}^{n}(x_{i}-b)\\
	    \frac{\partial{J(x_{i},b)}}{\partial{b}}&=0\\
	    \sum_{i=1}^{n}(x_{i}-b)&=0\\
	    b&=\frac{1}{n}\sum_{i=1}^{n}x_{i}   \\ 
	    b&=\bar{x} 
	    \end{align}
	    
        $$
    1.  这个问题及其解与正态分布有什么关系?
	        
1.  推导出使用平方误差的线性回归优化问题的解析解。为了简化问题，可以忽略偏置$b$（我们可以通过向$\mathbf X$添加所有值为1的一列来做到这一点）。
    
    1.  用矩阵和向量表示法写出优化问题（将所有数据视为单个矩阵，将所有目标值视为单个向量）。
        
    2.  计算损失对$w$的梯度。
        
    3.  通过将梯度设为0、求解矩阵方程来找到解析解。
        
    4.  什么时候可能比使用随机梯度下降更好？这种方法何时会失效？
        
2.  假定控制附加噪声$\epsilon$的噪声模型是指数分布。也就是说，$p(\epsilon) = \frac{1}{2} \exp(-|\epsilon|)$
    
    1.  写出模型$-\log P(\mathbf y \mid \mathbf X)$下数据的负对数似然。
        
    2.  请试着写出解析解。
        
    3.  提出一种随机梯度下降算法来解决这个问题。哪里可能出错？（提示：当我们不断更新参数时，在驻点附近会发生什么情况）请尝试解决这个问题。

# 3.2 Linear Regression的从0实现

```python
%matplotlib inline
import random
import torch
from d2l import torch as d2l
```
#### 生成数据集
生成一个包含1000个样本的数据集， 每个样本包含从标准正态分布中采样的2个特征。 我们的合成数据集是一个矩阵$\mathbf{X}\in \mathbb{R}^{1000 \times 2}$。
我们使用线性模型参数$\mathbf{w} = [2, -3.4]^\top$、$b = 4.2$ 和噪声项$\epsilon$生成数据集及其标签：
$$
\mathbf{y}= \mathbf{X} \mathbf{w} + b + \mathbf\epsilon.
$$
$\epsilon$可以视为模型预测和标签时的潜在观测误差
```python
def synthetic_data(w,b,num_examples):
	X = torch.noraml(0,1,(num_examples,len(w)))
	y = torch.matmul(X,w) + b
	y += torch.normal(0,0.01,y.shape)
	return X,y.reshape((-1,1))
	#防止广播机制使矩阵变形
true_w = torch.tensor([2,-3.4])
true_b = 4.2
features,labels = synthetic_data(true_w,true_b,1000)

d2l.set_figsize()
d2l.plt.scatter(feature[:,(1)].detach().numpy(),labels.detach.numpy(),1)
```
### 读取数据集
```python
def data_iter(batch_size,features,labels):
	num_examples=len(freatures)
	indices=list(range(num_examples))
	random.shuffle(indices)
	for i in range(0,num_examples,batch_size):
		batch_indices = torch.tensor(indices[i:min(i+batch_szie,num_examples)])
		yield features[batch_indices],labels[batch_indices]
```
**我们可以利用GPU并行运算的优势 处理合理大小的batch_size.
```python
batch_size=10
for X,y in data_iter(batch_szie,features,labels):
	print(X,'\n',y)
	break
```
### 初始化模型参数
```python
w = torch.normal(0,0.01,size=(2,1),requires_grad=True)
b = torch.zeros(1,requires_grad=True)
```
### 定义模型
```python
def linreg(X,w,b):
	return torch.matumul(X,w)+b
```
### 定义损失函数
```python
def squared_loss(y_hat,y):
	return (y_hat-y.reshape(y_hat.shape))**2/2
```
### 定义优化算法
```python
#随机小批量梯度下降
def sga(params,lr,batch_size):
	    with torch.no_grad():
        for param in params:
            param -= lr * param.grad / batch_size
            param.grad.zero_()
```

## train
```python
lr = 0.03
num_epochs = 3
net = linreg
loss =squared_loss

for epoch i  range(num_epoches):
	for X,y in data_iter(batch_size,features,labels):
		l = loss(net(X,w,b),y)
		l.sum().backward
		sgd([w,b],lr,batch_size)
	with torch.no_grad():
		train_l = loss(net(features,w,b),labels)
		print(f'epoch {epoch+1},loss{float(train_l.mean()):f}')
print(f'w的估计误差: {true_w - w.reshape(true_w.shape)}')
print(f'b的估计误差: {true_b - b}')
```
### Practice:
1.  如果我们将权重初始化为零，会发生什么。算法仍然有效吗？
    
2.  假设试图为电压和电流的关系建立一个模型。自动微分可以用来学习模型的参数吗?
    
3.  能基于[普朗克定律](https://en.wikipedia.org/wiki/Planck%27s_law)使用光谱能量密度来确定物体的温度吗？
    
4.  计算二阶导数时可能会遇到什么问题？这些问题可以如何解决？
    
5.  为什么在`squared_loss`函数中需要使用`reshape`函数？
    
6.  尝试使用不同的学习率，观察损失函数值下降的快慢。
    
7.  如果样本个数不能被批量大小整除，`data_iter`函数的行为会有什么变化？

### pytorch的简洁化实现
### 生成数据集
```python
import numpy as np
import torch
from torch.utils import data
from d2l import torch as d2l
#切记要把参数初始化为tensor的形式
true_w=torch.tensor([2,-3.4])
true_b=4.2
features,labels=d2l.synthetic_data(true_w,true_b,1000)
```
在 `d2l` 宏包内部，这个函数的底层源码和你之前写的几乎完全一样。它的核心逻辑是根据你给定的真实权重 $w$ 和偏置 $b$，加上随机高斯噪声，来生成特征矩阵 $X$ 和标签向量 $y$：
### 读取数据集
```python
def load_array(data_arrays,batch_size,is_train=True):
	dataset = data.TensorDataset(*data_arrays)
	#TensorDataset可以对数据进行打包类似于py中的zip
	return data.DataLoader(dataset,batch_size,shuffle=is_train)
	#shuffle打乱顺序
batch_size=10
data_iter = load_array((features,labels),batch_size)
```
### 定义模型
对于标准深度学习模型，可以直接使用框架定义好的层。(框架:Pytorch,Tensorflow)
 我们首先定义一个模型变量`net`，它是一个`Sequential`类的实例。 `Sequential`类将多个层串联在一起。 当给定输入数据时，`Sequential`实例将数据传入到第一层， 然后将第一层的输出作为第二层的输入，以此类推。 在下面的例子中，我们的模型只包含一个层，因此实际上不需要`Sequential`。 但是由于以后几乎所有的模型都是多层的，在这里使用`Sequential`会让你熟悉“标准的流水线”。**Sequential是全连接层 Densenet的基础**
 ```python
 from torch import nn
 net = nn.Sequential(nn.Linear(2,1))
 ```
### 初始化模型参数
正如我们在构造`nn.Linear`时指定输入和输出尺寸一样， 现在我们能直接访问参数以设定它们的初始值
我们下面之用到了$net[0]$选择网络中的第一个图层
```python
#我们使用方法weight.data和bias.data来初始化参数
net[0].weight.data.normal_(0,0.01)
net[0].bias.data.fill_(0)
```
### Loss Fumction
```python
loss = nn.MSELoss()
```
**Mean Sequared Loss Function**
### 优化算法
**这里我们采用sgd**
```python
#optim优化器
trainer = torch.optim.SGD(net.parameters(),lr=0.05)
```
### Train
**三步走**
**前馈 反馈 更新**
forward backward update
**一定不要忘记了梯度清零 不然无法看出每一轮新的epoch里的新的loss**
```python
num_epoches=3
for epoch in range(num_epoches):
	for X,y in data_iter:
		l = loss(net(X),y)
		trainer.zero_grad()
		l.backward()
		trainer.step()
	l = loss(net(features),labels)
	print(f'epoch {epoch+1},loss{l:f}')
```
```python
w = net[0].weight.data
print(true_w-w.reshape(true_w.shape()))
b = net[0].bias.data
print(true_b-w.reshape(true_b.shape()))
```
#### Practice:

1.  如果将小批量的总损失替换为小批量损失的平均值，需要如何更改学习率？
    
2.  查看深度学习框架文档，它们提供了哪些损失函数和初始化方法？用Huber损失代替原损失，即
    
    (3.3.1)
    
    $$
    \begin{split}l(y,y') = \begin{cases}|y-y'| -\frac{\sigma}{2} & \text{ if } |y-y'| > \sigma \\ \frac{1}{2 \sigma} (y-y')^2 & \text{ 其它情况}\end{cases}\end{split}
    $$
    
1.  如何访问线性回归的梯度？

