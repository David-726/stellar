---
title: "权重衰减"
published: 2026-06-07
description: ""
tags: ["D2lNotes"]
draft: false
---

我们总是可以通过去收集更多的训练数据来缓解过拟合。 但这可能成本很高，耗时颇多。
在多项式过拟合的例子中，我们总是可以通过调整多项式的结束来调整限制模型的容量。实际上，限制特征的数量是缓解过拟合的一种常用技术。 然而，简单地丢弃特征对这项工作来说可能过于生硬。
注意，随着阶数$d$的增长，带有阶数$d$的项数迅速增加。 给定$k$个变量，阶数为$d$的项的个数为 ${k - 1 + d} \choose {k - 1}$，即$C^{k-1}_{k-1+d} = \frac{(k-1+d)!}{(d)!(k-1)!}$。 因此即使是阶数上的微小变化，比如从$2$到$3$，也会显著增加我们模型的复杂性。 仅仅通过简单的限制特征数量（在多项式回归中体现为限制阶数），可能仍然使模型在过简单和过复杂中徘徊， 我们需要一个更细粒度的工具来调整函数的复杂性，使其达到一个合适的平衡位置。
**权重衰减**
是最为广泛使用的正则化技术之一，它通常也被称为$L_2正则化$。
通过函数与零的距离来衡量函数的复杂度， 因为在所有函数$f$中，函数$f = 0$（所有输入都得到值$0$） 在某种意义上是最简单的。 但是我们应该如何精确地测量一个函数和零之间的距离呢？ 没有一个正确的答案。
一种简单的方法是通过线性函数 $f(\mathbf{x}) = \mathbf{w}^\top \mathbf{x}$ 中的权重向量的某个范数来度量其复杂性， 例如$\| \mathbf{w} \|^2$。
$$
L(\mathbf{w}, b) = \frac{1}{n}\sum_{i=1}^n \frac{1}{2}\left(\mathbf{w}^\top \mathbf{x}^{(i)} + b - y^{(i)}\right)^2.
$$将原来的训练目标最小化训练标签上的预测损失， 调整为最小化预测损失和惩罚项之和。
$$
L(\mathbf{w}, b) + \frac{\lambda}{2} \|\mathbf{w}\|^2,
$$
我们通过正则化常数$\lambda$来描述这种权衡， 这是一个非负超参数，我们使用验证数据拟合。
**Q:为什么使用L2范数而不是L1范数**
$$
\begin{aligned}
\mathbf{w} & \leftarrow \left(1- \eta\lambda \right) \mathbf{w} - \frac{\eta}{|\mathcal{B}|} \sum_{i \in \mathcal{B}} \mathbf{x}^{(i)} \left(\mathbf{w}^\top \mathbf{x}^{(i)} + b - y^{(i)}\right).
\end{aligned}
$$
我们根据估计值与观测值之间的差异来更新$\mathbf{w}$。 然而，我们同时也在试图将$\mathbf{w}$的大小缩小到零。 这就是为什么这种方法有时被称为权重衰减。 我们仅考虑惩罚项，优化算法在训练的每一步衰减权重。

### 高维线性回归
```python
import torch
from torch import np
from d2l import torch as d2l
```
$$
y = 0.05 + \sum_{i = 1}^d 0.01 x_i + \epsilon \text{ where }
\epsilon \sim \mathcal{N}(0, 0.01^2).
$$
bias是均值0 标准差0.01的高斯噪声
```python
n_train,n_test,num_inputs,batch_size = 20,100,200,5
true_w,true_b = np.ones((num_inputs,1)*0.01,0.05)
train_data = d2l.sythestic_data(true_w,true_b,num_inputs)
train_iter = d2l.load_array(train_data,batch_size)
test_data = d2l.sythestic_data(true_w,true_b,num_inputs)
test_iter = d2l.load_array(test_data,batch_size,is_train=False)
```

### 手写实现

```python
def init_params():
	w = torch.normal(0,1,size=(num_inputs,1),requires_grad=True)
	b = torch.zeros(1,requires_grad=True)
	return [w,b]
```

#### 权重衰减L2范数惩罚
```python
def l2_penalty(w):
	return torch.sum[w.pow(w)/2]
```

### 训练
```python
def train(lambd):
	w,b = init_param()
	net,loss = lamba X:d2l.linreg(X,w,b),d2l.sequired_loss
	num_epochs,lr = 100,0.003
	animator = d2l.Animator(xlabel='epochs',ylabel='loss',yscale='log',xlim=[5,num_epochs],legend=['train','test'])
	
	for epoch in range(num_epochs):
		for X,y in train_iter:
			l - loss(net(X),y)+lambd+l2_penalty(w)
			l.sum().backward()
			d2l.sgd([w,b],lr,batch_size)
		if (epoch +1)%5 ==0 :
			animator.add(epoch+1,(d2l.evaluate_loss(net,train_iter,loss),d2l.evaluate_loss(net,test_iter,loss)))
		print('w的L2范数是',torch.norm(w).item())
		
train(lambd =0)
train(lambd =3)
```

### Pytorch的简单实现
```python
def train_concise(wd):
	net = nn.Sequential(nn.Linear(num_inputs,1))
	for param in net.parameters():
		param.data.normal_()
	loss = nn.MSELoss(reduction='none')
	num_epochs,lr = 100,0.03
	trainer = torch.optim.SGD([{'params':net[0].weight,'weight_decay':wd},{'params':net[0].bias}],lr=lr)
	animator = d2l.Animator(xlabel='epochs',ylabel='loss',yscale='log',xlim=[5,num_epochs],legend=['train','test'])
	
	for epoch in range(num_epochs):
		for X,y in trian_iter:
			trainer,zero_grad()
			l = loss(net(X),y)
			l.mean.backward()
			trainer.step()
		if (epoch+1)%5==0:
			animator.add(epoch+1,(d2l.evulate_loss(net,train_loss,loss),d2l.evulate_loss(net,test_loss,loss))
	print('w的L2范数:',net[0].weight.norm().item())
```
#### Practice:
## 4.5.5. 练习

1.  在本节的估计问题中使用$\lambda$的值进行实验。绘制训练和测试精度关于$\lambda$的函数。观察到了什么？
    
2.  使用验证集来找到最佳值$\lambda$。它真的是最优值吗？这有关系吗？
    
3.  如果我们使用$\sum_i |w_i|$作为我们选择的惩罚（$L_1$正则化），那么更新方程会是什么样子？
    
4.  我们知道$\|\mathbf{w}\|^2 = \mathbf{w}^\top \mathbf{w}$。能找到类似的矩阵方程吗（见 [2.3.10节](https://zh.d2l.ai/chapter_preliminaries/linear-algebra.html#subsec-lin-algebra-norms) 中的Frobenius范数）？
    
5.  回顾训练误差和泛化误差之间的关系。除了权重衰减、增加训练数据、使用适当复杂度的模型之外，还能想出其他什么方法来处理过拟合？
    
6.  在贝叶斯统计中，我们使用先验和似然的乘积，通过公式$P(w \mid x) \propto P(x \mid w) P(w)$得到后验。如何得到带正则化的$P(w)$？

