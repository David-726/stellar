---
title: "还没想好"
published: 2026-06-07
description: ""
tags: ["D2lNotes"]
draft: false
---

### 梯度消失和梯度爆炸

#### 梯度爆炸
考虑一个具有$L$层、输入$\mathbf{x}$和输出$\mathbf{o}$的深层网络。 每一层$l$由变换$f_l$定义， 该变换的参数为权重$\mathbf{W}^{(l)}$， 其隐藏变量是$\mathbf{h}^{(l)}$（令 $\mathbf{h}^{(0)} = \mathbf{x}$）。 我们的网络可以表示为：
$$
\mathbf{h}^{(l)} = f_l (\mathbf{h}^{(l-1)}) \text{ 因此 } \mathbf{o} = f_L \circ \ldots \circ f_1(\mathbf{x}).
$$
所有隐藏变量和输出都是向量，将$o$关于任何一组参数$\mathbf{W}^{(l)}$的梯度写为下式：
$$
\partial_{\mathbf{W}^{(l)}} \mathbf{o} = \underbrace{\partial_{\mathbf{h}^{(L-1)}} \mathbf{h}^{(L)}}_{ \mathbf{M}^{(L)} \stackrel{\mathrm{def}}{=}} \cdot \ldots \cdot \underbrace{\partial_{\mathbf{h}^{(l)}} \mathbf{h}^{(l+1)}}_{ \mathbf{M}^{(l+1)} \stackrel{\mathrm{def}}{=}} \underbrace{\partial_{\mathbf{W}^{(l)}} \mathbf{h}^{(l)}}_{ \mathbf{v}^{(l)} \stackrel{\mathrm{def}}{=}}.
$$
在线性代数里，矩阵连续相乘时，决定整体大小的是矩阵的**最大特征值**（或者说谱半径）：
- 如果大多数层的矩阵，其最大特征值都**大于 1**（哪怕只大了一点点，比如 1.1）。
- 经过几十层的**指数级累积**，最终乘出来的结果就会像滚雪球一样疯狂膨胀。
- **结果**：梯度数值变得极其巨大，超出了计算机浮点数的表示范围（变成 `NaN`），或者导致参数更新幅度过大，直接把已经学好的权重“炸飞”了，模型彻底无法收敛。这就是**梯度爆炸（Gradient Exploding）**。
#### 梯度消失
曾经sigmoid函数很流行，作为一个阈值函数使用，但是后来却发现他是导致梯度消失的一个重要原因。
```python
import torch
from d2l import torch as d2l

x = torch.arange(-8.0,8.0,0.1,requires_grad=True)
y = torch.sigmoid(x)
y.backward(torch.ones_like(x))

d2l.plot(x.detach().numpy(),[y.detach().numpy(),x.grad.numpy()],legend=['sigmoid','gradient'],figsize=(4.5,2.5))
```
![images/output_numerical-stability-and-init_e60514_3_1.svg](https://zh.d2l.ai/_images/output_numerical-stability-and-init_e60514_3_1.svg)
我们发现，当sigmoid函数的输入很大或是很小时，梯度都会消失。
$$
\begin{align}
\frac{\partial \sigma(z)}{\partial z}&= \frac{\exp(-z)}{(1-exp(-z))^2}
\end{align}
$$
### 梯度爆炸
我们随机生成100个高斯随机矩阵，并将它们与某个初始矩阵相乘。对于我们选择的尺度（方差$\sigma^2=1$），矩阵乘积发生爆炸。
```python
M = np.random.normal(size=(4,4))
print('one Martrix')
for i in range(100):
	M = np.dot(M,np.random.normal(size=(4,4)))
print('after 100 matrixs',M)
```

#### 打破对称性
假设输出层将上述两个隐藏单元的多层感知机转换为仅一个输出单元。 想象一下，如果我们将隐藏层的所有参数初始化为$\mathbf{W}^{(1)} = c$， $c$为常量，会发生什么？ 在这种情况下，在前向传播期间，两个隐藏单元采用相同的输入和参数， 产生相同的激活，该激活被送到输出单元。 在反向传播期间，根据参数$\mathbf{W}^{(1)}$对输出单元进行微分， 得到一个梯度，其元素都取相同的值。 因此，在基于梯度的迭代（例如，小批量随机梯度下降）之后， $\mathbf{W}^{(1)}$的所有元素仍然采用相同的值。 这样的迭代永远不会打破对称性，我们可能永远也无法实现网络的表达能力。 隐藏层的行为就好像只有一个单元。 请注意，虽然小批量随机梯度下降不会打破这种对称性，但暂退法正则化可以。

**参数的初始化是打破这种对称性的一种好方法**
#### 默认初始化
前面我们使用正态分布来初始化权重值。如果我们不指定初始化方法，框架将使用默认的随机初始化方法。
#### Xavier初始化
对于某些没有非线性的全连接层输出$o_{i}$的初读分布。
$$
o_{i} = \sum_{j=1}^{n_\mathrm{in}} w_{ij} x_j.
$$
权重$w_{ij}$都是从同一分布中独立抽取的。 此外，让我们假设该分布具有零均值和方差$\sigma^2$。但这并不意味着分布是高斯的。
让我们假设层$x_j$的输入也具有零均值和方差$\gamma^2$， 并且它们独立于$w_{ij}$并且彼此独立。 在这种情况下，我们可以按如下方式计算$o_i$的平均值和方差：
$$
\begin{split}\begin{aligned}
    E[o_i] & = \sum_{j=1}^{n_\mathrm{in}} E[w_{ij} x_j] \\&= \sum_{j=1}^{n_\mathrm{in}} E[w_{ij}] E[x_j] \\&= 0, \\
    \mathrm{Var}[o_i] & = E[o_i^2] - (E[o_i])^2 \\
        & = \sum_{j=1}^{n_\mathrm{in}} E[w^2_{ij} x^2_j] - 0 \\
        & = \sum_{j=1}^{n_\mathrm{in}} E[w^2_{ij}] E[x^2_j] \\
        & = n_\mathrm{in} \sigma^2 \gamma^2.
\end{aligned}\end{split}
$$
保持方差不变的一种方法是设置$n_\mathrm{in} \sigma^2 = 1$。
现在考虑反向传播过程，我们面临着类似的问题，尽管梯度是从更靠近输出的层传播的。 使用与前向传播相同的推断，我们可以看到，除非$n_\mathrm{out} \sigma^2 = 1$， 否则梯度的方差可能会增大，其中$n_\mathrm{out}$是该层的输出的数量。
$$
\begin{aligned}
\frac{1}{2} (n_\mathrm{in} + n_\mathrm{out}) \sigma^2 = 1 \text{ 或等价于 }
\sigma = \sqrt{\frac{2}{n_\mathrm{in} + n_\mathrm{out}}}.
\end{aligned}
$$
这就是现在标准且实用的Xavier初始化的基础。
通常，Xavier初始化从均值为零，方差 $\sigma^2 = \frac{2}{n_\mathrm{in} + n_\mathrm{out}}$ 的高斯分布中采样权重。我们也可以将其改为选择从均匀分布中抽取权重时的方差。 注意均匀分布$U(-a, a)$的方差为$\frac{a^2}{3}$。 将$\frac{a^2}{3}$代入到$\sigma^2$的条件中，将得到初始化值域：
$$
U\left(-\sqrt{\frac{6}{n_\mathrm{in} + n_\mathrm{out}}}, \sqrt{\frac{6}{n_\mathrm{in} + n_\mathrm{out}}}\right).
$$
本章提到的参数初始化只是皮毛，继续探索吧。现代深度学习框架通常实现实际中不同的启发式方法。
### Practice:

1.  除了多层感知机的排列对称性之外，还能设计出其他神经网络可能会表现出对称性且需要被打破的情况吗？
    
2.  我们是否可以将线性回归或softmax回归中的所有权重参数初始化为相同的值？
    
3.  在相关资料中查找两个矩阵乘积特征值的解析界。这对确保梯度条件合适有什么启示？
    
4.  如果我们知道某些项是发散的，我们能在事后修正吗？看看关于按层自适应速率缩放的论文 ([You _et al._, 2017](https://zh.d2l.ai/chapter_references/zreferences.html#id192 "You, Y., Gitman, I., & Ginsburg, B. (2017). Large batch training of convolutional networks. arXiv preprint arXiv:1708.03888.")) 。
