---
title: "L4"
published: 2026-04-17
description: ""
tags: ["PyTorch"]
draft: false
---

#### Last Lecture
Linear model
$\hat y=x*w$
**input x 权重x
Stochastic Gradient Descent
$w= w-\alpha \frac{\partial loss}{\partial w}$
Derivative Gradient Descent
$\frac{\partial loss}{\partial w}=2*x_m*(x_n*w-y_n)$

**复杂的神经网络**
- **Gradient
	对于hiddenlayer较多的神经网络 需要的输入输出权重极多

#### Computational Graph
$\hat y =W_2*(W_1*X+b_1)+b_2$
$H^{(1)}=W_1^{T}*X$
<a href="/posts/assets/273297617518b8fe-Drawing-2026-04-17-23.19.30.excalidraw.md" download>手绘图源文件：Drawing 2026-04-17 23.19.30.excalidraw</a>
>Book->Martix cookbook

$\hat y=W_2*(W-1*X+b_1)+b_2=W_2*W_1*X+(W_2*b_1+b2)=W*X+b$
**无论多少层都可以化简为一个简单的线性模型
但我们希望模型可以愈加复杂 提高模型的复杂度 但增加权重函数没有意义
因而我们可以增加非线性函数打破这种化简的规律 例如sigmond函数**

#### Composition of functions and Chain Rules
**Chain rules
$\frac{dy}{dx}=\frac{dy}{du}*\frac{du}{dx}$
<a href="/posts/assets/9411e31901ccc14e-Drawing-2026-04-18-16.29.26.excalidraw.md" download>手绘图源文件：Drawing 2026-04-18 16.29.26.excalidraw</a>




<img src="/posts/assets/16t1nsk-Pasted-image-20260418163545.png" alt="Pasted image 20260418163545.png" loading="lazy" />




**有同学可能说$\frac{\partial L}{\partial w}$并没有什么需求 但是要是这里的x是一个中间变量**




<img src="/posts/assets/1pthsjo-Pasted-image-20260418163659.png" alt="Pasted image 20260418163659.png" loading="lazy" />





**Computational Graph of Linear Model**
$loss=(\hat y-y)^2=(x*w-y)^2$




<img src="/posts/assets/g7dlpz-Pasted-image-20260418164111.png" alt="Pasted image 20260418164111.png" loading="lazy" />




**Practice:
- x= 2，y=4 重新计算反向传播
- Affine Model : $\hat y=x*w+b$
#### Tensor in Pytorch
**In pytorch,Tensor is the important compenant in constructing dynamic computational graph
It contains data and grad,which storage the value of node and gradient w.r.t loss respectively.

```python
import torch
x_data =[1.0,2.0,3.0]
y_data =[2.0,4.0,6.0]
w=torch.Tensor([1.0])
w.requires_grad=True#需要计算梯度
```
**if autograd mechanics are required,the element variable requires_grad of Tensor has to be set to True**
**默认tensor计算过程中requires_grad是False,不会去保留关于w的梯度**
```python
def foeward(x):
	return x*w
def loss(x,y):
	y_pred=forward(x)
	return (y_pred-y)**2
```
**这里的w是一个Tensor x和w要进行数乘 因而x需要进行自动类型转换**
```python
print("predict (before training)",4,forward(4).item)

for epoch in range(100):
	for x,y in zip(x_data,y_data):
		#compute the forward
		l=loss(x,y)
		#backward computre grad for Tensor whose requires_grad set True
		l.backward()
		print('\tgrad',x,y,w.grad.item())
		w.data=w.data-0.01*w.grad.data
		#The grad computed by .bacjward() will be accumulated So after update,remember set the grad to Zero
		w.grad.data.zero_()
	print("progress:",epoch,1.item())
print("predict (after training)",4,forwarda(4).item())
	
```
**我们每调用一次loss函数 就将这个计算图动态构建出来 因而每次看见这个代码 就能够构建一次这个计算图 
但是每一次backward时候就会将计算图释放掉而去准备下一次的图 因而下一次调用loss函数时会创建一个新的计算图 这是一个非常灵活的方式 也是pytorch的核心竞争力**




<img src="/posts/assets/byy5r3-Pasted-image-20260418225231.png" alt="Pasted image 20260418225231.png" loading="lazy" />




```
sum=0
sum+=l

sum+=l.item
```
**由于没有backward操作释放计算图 因而所有计算图一直保留 在内存中从而使使得内存容量爆炸 因为这里的l是一个Tensor Tensor在进行加法计算时 会构建计算图 **

#### Practice:
**Input:Quadartic Model
$\hat y=w_1*x^2+w_2*x+b$
Loss Function:
$loss=(\hat y-y)^2$
$\frac{\partial loss}{\partial w_1}=?$
$\frac{\partial loss}{\partial w_2}=?$
$\frac{\partial loss}{\partial b}=?$
```python
x_data=[1.0,2.0,3.0]
y_data=[2.0,4.0,6.0]
```
尝试利用pytorch实现