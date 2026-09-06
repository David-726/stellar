---
title: "L5"
published: 2026-04-18
description: ""
tags: ["PyTorch"]
draft: false
---
# Pytorch 高级api实现Linear Model

## Pytorch Fashion
- **Prepare dataset
- **Design moel using Class
- **Construst loss and optimizer(using Pytorch Api)
- **Training cycle (forward,backward,update)
>forward for loss,backward for gradient and update

**InPytorch,the compuattional graph is in mini-batch fashion,so X and Y are 3*1 Tensors**

$$
\begin{bmatrix}
y_{pred}^{(1)} \\
y_{pred}^{(2)} \\
y_{pred}^{(3)}
\end{bmatrix}
= \omega \cdot
\begin{bmatrix}
x^{(1)} \\
x^{(2)} \\
x^{(3)}
\end{bmatrix}
+ b
$$
**广播机制**
$$
\begin{bmatrix}
1\,2\,3\\
1\,4\,5\\
2\,4\,7\\
\end{bmatrix}
+
\begin{bmatrix}
1\\
2\\
3
\end{bmatrix}
=
\begin{bmatrix}
1\,2\,3\\
1\,4\,5\\
2\,4\,7\\
\end{bmatrix}
+
\begin{bmatrix}
1\,1\,1\\
2\,2\,2\\
3\,3\,3\\
\end{bmatrix}
$$
$$
\begin{bmatrix}
loss1\\
loss2\\
loss3
\end{bmatrix}
=(
\begin{bmatrix}
\hat y_1\\
\hat y_2\\
\hat y_3\\
\end{bmatrix}
-
\begin{bmatrix}
y_1\\
y_2\\
y_3\\
\end{bmatrix}
)^2
$$
```pythpon
import torch

x_data=torch.Tensor([1.0],[2.0],[3.0])
y_data=torch.Tensor([2.0],[4.0].[6.0])
```
$$
\begin{align}
\frac{\partial cost(w)}{\partial w}&=\frac{}{\partial w}*\frac{1}{N}\sum_{n=1}^{N}(x_n*w-y_n)\\
&=\frac{1}{N}\sum_{n=1}{N}\frac{\partial }{\partial w}(x_n*w-y_n)^2\\
&=\frac{1}{N}\sum_{n=1}{N}2*(x_n*w-y_n)\frac{\partial (x_n*w-y_n)}{\partial w}\\
&=\frac{1}{N}\sum_{n=1}{N}2*x_n*(x_n*w-y_n)
\end{align}
$$
- Design Model
**自动构造计算图**
<img src="/posts/assets/18mh3lv-Pasted-image-20260419230428.png" alt="Pasted image 20260419230428.png" loading="lazy" />
**我们需要x和y的维度**
```python
class LinearModel(torch.nn.Module):
	#Member methods __init() and forward() have to be implemented
	def __init__(self):
		super(LinearModule,self).__init__()
		#Class nn.Linear contain two members Tensors:weight and bias
		self.linear=torch.nn.Linear(1,1)
		
	def forward(self,x):
		y_pred=self.linear(x)
		return y_pred
model=LinearModuel

criterion= = torch.nn.MSELoss(size_average=Flase)
#size_average=True 1/N*MSELoss
#优化器对象
optimizer=torch.optim.SGD(model,parameters(),lr=0.01)
```
**Our model class should be inherit from nn.Module,which is Base class for all neural network modules.
Q：为什么没有backward:
Pytorch中的Module会自动完成backward的操作
Q：什么是super():
nn(neturalnetwork).Linaer

**MSEloss()-->
$$
loss=\sum_{i=0}^{n}\begin{bmatrix}
loss1\\
loss2\\
loss3
\end{bmatrix}
=(
\begin{bmatrix}
\hat y_1\\
\hat y_2\\
\hat y_3\\
\end{bmatrix}
-
\begin{bmatrix}
y_1\\
y_2\\
y_3\\
\end{bmatrix}
)^2
$$
**这里的loss是一个标量 要是一个向量的话没有办法 backward**
```
class Foobar:
	def __call__(self,*args,**kwargs)
		pass
```
**Q:*args?

**Class mm.Linear has implemented the magic method __call(),which  enable the class  can be called like a function.Normally the foeward() will be called
```python
for epoch in range(100):
	y_pred=model(x_data)
	loss=criterion(y_pred,y_data)
	print(epoch,loss)
	
	#The grad computed by .backward() will be accumulated.So before backward,remember set the grad to Zero.
	optimizer.zero_grad()
	#Backward
	loss.backward()
	#Update
	optimizer.step()
	
#Output weight and bias
print('w= ',model.linear.weight.item())
print('b= ',model.linear.bias.item())
#Test Model
x_test=torch.Tensor([4.0])
y_test=model(x_test)
print('y_pred =',y_test.data)
```
**Training data 会随着训练指数减少
Test data 会随着epoch增加先减少后增加

**训练过程总计为三部分：
前馈 反馈 更新
forward backward update

### Practice:Try Different Optimizer in Linear Regression
```python
torch.optim.Adagrad
torch.optim.Adam
torch.optim.Adamax
torch.optim.ASGD
torch.optim.LBFGS
torch.optim.RMSprop
torch.optim.Rprop
torch.optim.SGD
```
