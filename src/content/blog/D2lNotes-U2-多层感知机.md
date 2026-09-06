---
title: "多层感知机"
published: 2026-06-06
description: ""
tags: ["多层感知机"]
draft: false
---
## hidden Layer
仿射变换中的线性是一种很理想的假设
如何对猫和狗的图像进行分类呢？ 增加位置$(13, 17)$处像素的强度是否总是增加（或降低）图像描绘狗的似然？ 对线性模型的依赖对应于一个隐含的假设， 即区分猫和狗的唯一要求是评估单个像素的强度。 在一个倒置图像后依然保留类别的世界里，这种方法注定会失败

### 在网络中加入hidden layer

![images/mlp.svg](https://zh.d2l.ai/_images/mlp.svg)
**从线性到非线性**
$$
\begin{split}\begin{aligned}
    \mathbf{H} & = \mathbf{X} \mathbf{W}^{(1)} + \mathbf{b}^{(1)}, \\
    \mathbf{O} & = \mathbf{H}\mathbf{W}^{(2)} + \mathbf{b}^{(2)}.
\end{aligned}\end{split}
$$
但这样还是有问题 仿射函数的仿射函数本身还是仿射函数 
$$
\mathbf{O} = (\mathbf{X} \mathbf{W}^{(1)} + \mathbf{b}^{(1)})\mathbf{W}^{(2)} + \mathbf{b}^{(2)} = \mathbf{X} \mathbf{W}^{(1)}\mathbf{W}^{(2)} + \mathbf{b}^{(1)} \mathbf{W}^{(2)} + \mathbf{b}^{(2)} = \mathbf{X} \mathbf{W} + \mathbf{b}.
$$
线性方程在空间中只能画出**一条直线**、**一个平面**或者**一个超平面**。从而我们来引入激活函数(activation function)$\sigma$。从而给予弯曲边界的能力，能够适应于更多的复杂场景。

$$
\begin{split}\begin{aligned}
    \mathbf{H} & = \sigma(\mathbf{X} \mathbf{W}^{(1)} + \mathbf{b}^{(1)}), \\
    \mathbf{O} & = \mathbf{H}\mathbf{W}^{(2)} + \mathbf{b}^{(2)}.\\
\end{aligned}\end{split}
$$
为了构建更通用的多层感知机， 我们可以继续堆叠这样的隐藏层， 例如$\mathbf{H}^{(1)} = \sigma_1(\mathbf{X} \mathbf{W}^{(1)} + \mathbf{b}^{(1)})$和$\mathbf{H}^{(2)} = \sigma_2(\mathbf{H}^{(1)} \mathbf{W}^{(2)} + \mathbf{b}^{(2)})$， 一层叠一层，从而产生更有表达能力的模型。

### 通用近似原理

#### 激活函数
```python
%matplotlib inline
import torch
form d2l import torch as d2l
```
### RELU
$Relu(x)=max(x,0)$
![images/output_mlp_76f463_18_1.svg](https://zh.d2l.ai/_images/output_mlp_76f463_18_1.svg)
```python
x = totch.arange(-8.0,8.0,0.1,requires_grad=True)
y = torch.relu(x)
d2l.plot(x.detach(),y.detach(),'x','relu(x)',figsize=(5,2.5))
```
```python
y.backward()
d2l.plot(x,x.grad(),'x','grad of relu',figsize=(5,2.5))
```
RELU的求导表现非常好：要么使得参数消失，要么使得参数通过，这使得优化表现得更好。
参数化ReLu()：
$$
\operatorname{pReLU}(x) = \max(0, x) + \alpha \min(0, x).
$$
### sigmoid 函数
sigmoid函数总能将输入变换为区间(0, 1)上的输出
$$
\operatorname{sigmoid}(x) = \frac{1}{1 + \exp(-x)}.
$$
```python
with autograd.record():
	y = npx.sigmoid(x)
d2l.plot(x,y,'x','sigmoid(x)',figsize=(5,2.5))
```
x接近0的时候，sigmoid接近于线性函数
$$
\frac{d}{dx} \operatorname{sigmoid}(x) = \frac{\exp(-x)}{(1 + \exp(-x))^2} = \operatorname{sigmoid}(x)\left(1-\operatorname{sigmoid}(x)\right).
$$
```python
y.backward()
d2l.plot(x, x.grad, 'x', 'grad of sigmoid', figsize=(5, 2.5))
```

### tanh函数

tanh函数可以将输入压缩到-1到1
$$
\operatorname{tanh}(x) = \frac{1 - \exp(-2x)}{1 + \exp(-2x)}.
$$
```python
with autograd.record():
	y = np.tanh(x)
d2l.plot(x,y,'x','tanh(x)',figsize=(5,2.5))
```
$$
\frac{d}{dx} \operatorname{tanh}(x) = 1 - \operatorname{tanh}^2(x).
$$
Practice:
1.  计算pReLU激活函数的导数。
    
2.  证明一个仅使用ReLU（或pReLU）的多层感知机构造了一个连续的分段线性函数。
    
3.  证明$\operatorname{tanh}(x) + 1 = 2 \operatorname{sigmoid}(2x)$。
    
4.  假设我们有一个非线性单元，将它一次应用于一个小批量的数据。这会导致什么样的问题？


## MLP的手动实现
```python
import torch
from torch import nn
from torch import torch as d2l

batch_size = 256
train_iter,test_iter = d2l.load_data_fashion_mnist(batch_size)
```
#### 初始化模型
```python
num_inputs,num_outputs,num_hiddens = 784,10,256

W1 = np.random.normal(scale=0.01,size=(num_inputs,num_hiddens))
b1 = np.zeros(num_hiddens)
W2 = np.random.normal(scale=0.01,size=(num_hiddens,num_outputs))
b2 = np.zeros(num_outpputs)
params = [W1,b1,W2,b2]

for param in params:
	param.attach_grad()
```

### 激活函数
先来实现一下Relu
```python
def relu(X):
	return np.maximum(X,0)
```
### model
```python
def net(X):
	X = X.reshape((-1,num_inputs))
	H = relu(np.dot(X,W1)+b1)
	return np.dot(H,W2)+b2
```

### Loss function
```python
loss = nn.CrossEntropyLoss(reduction='none')
```

### Train
```python
num_epochs,lr = 10,0.01
d2l.train_ch3(net,train_iter,test_iter,loss,num_epoches,lamba batch_size:d2l.sgd(params,lr,batch_size))
d2l.predict_ch3(net,test_iter)
```

## Pytorch简洁实现
```python
import torch 
form torch import nn
form d2l import torch as d2l
```
#### model
```python
net = nn.Sequential()
net.add(nn.Dense(256,activation='relu'),nn.Dense(10))
net.initialize(init.Normal(sigma=0.01))
```
```python
batch_size,lr,num_epochs = 256,0.1,10
loss = nn.CrossentropyLoss(reduction='none')
trainer = torch.optim.SGD(net.parameters(),lr=lr)

train_iter,test,iter = d2l.load_data_fashion_mnist(batach_size)
d2l.train_ch3(net,train_iter,test_iter,loss,num_epoches,trainer)
```