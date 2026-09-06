---
title: "前向传播"
published: 2026-06-07
description: ""
tags: ["多层感知机"]
draft: false
---

在之前的SGD的实现中，我们只考虑了通过前向传播设计的计算。在计算梯度是，我们只调用了pytorch框架提供的函数，而不知其所以然。
能够自动计算梯度大大简化了深度学习算法的实现。

### 前向传播
**前向传播**指的是：按顺序计算和存储神经网络中每层的结果
为了简单起见，我们假设输入样本是 $\mathbf{x}\in \mathbb{R}^d$， 并且我们的隐藏层不包括偏置项。中间变量$z$
$$
\mathbf{z}= \mathbf{W}^{(1)} \mathbf{x},
$$
其中$\mathbf{W}^{(1)} \in \mathbb{R}^{h \times d}$ 是隐藏层的权重参数。 将中间变量$\mathbf{z}\in \mathbb{R}^h$通过激活函数$\phi$后， 我们得到长度为$h$的隐藏激活向量：
$$
\mathbf{h}= \phi (\mathbf{z}).
$$
隐藏变量$\mathbf{h}$也是一个中间变量。 假设输出层的参数只有权重$\mathbf{W}^{(2)} \in \mathbb{R}^{q \times h}$， 我们可以得到输出层变量，它是一个长度为$q$的向量：
$$
\mathbf{o}= \mathbf{W}^{(2)} \mathbf{h}.
$$
假设损失函数为$l$，样本标签为$y$，我们可以计算单个数据样本的损失项，
$$
L = l(\mathbf{o}, y).
$$
根据$L_2$正则化的定义，给定超参数$\lambda$，正则化项为
$$
s = \frac{\lambda}{2} \left(\|\mathbf{W}^{(1)}\|_F^2 + \|\mathbf{W}^{(2)}\|_F^2\right),
$$
其中矩阵的Frobenius范数是将矩阵展平为向量后应用的$L_2$范数。 最后，模型在给定数据样本上的正则化损失为：
$$
J = L + s.
$$
![images/forward.svg](https://zh.d2l.ai/_images/forward.svg)

### 反向传播
应用链式法则，假设我们有函数$\mathsf{Y}=f(\mathsf{X})$和$\mathsf{Z}=g(\mathsf{Y})$， 其中输入和输出$\mathsf{X}, \mathsf{Y}, \mathsf{Z}$是任意形状的张量。 利用链式法则，我们可以计算$\mathsf{Z}$关于$\mathsf{X}$的导数

$$
\frac{\partial \mathsf{Z}}{\partial \mathsf{X}} = \text{prod}\left(\frac{\partial \mathsf{Z}}{\partial \mathsf{Y}}, \frac{\partial \mathsf{Y}}{\partial \mathsf{X}}\right).
$$
对于我们上面提到的计算图 我们接着使用反向传播计算$\partial J/\partial \mathbf{W}^{(1)}$和 $\partial J/\partial \mathbf{W}^{(2)}$。为此我们应用链式法则，依次计算每个中间变量和参数的梯度。计算的顺序与前向传播执行的顺序相反。
$$
\frac{\partial J}{\partial L} = 1 \; \text{and} \; \frac{\partial J}{\partial s} = 1.
$$
$$
\frac{\partial J}{\partial \mathbf{o}}
= \text{prod}\left(\frac{\partial J}{\partial L}, \frac{\partial L}{\partial \mathbf{o}}\right)
= \frac{\partial L}{\partial \mathbf{o}}
\in \mathbb{R}^q.
$$
$$
\frac{\partial s}{\partial \mathbf{W}^{(1)}} = \lambda \mathbf{W}^{(1)}
\; \text{and} \;
\frac{\partial s}{\partial \mathbf{W}^{(2)}} = \lambda \mathbf{W}^{(2)}.
$$
$$
\frac{\partial J}{\partial \mathbf{W}^{(2)}}= \text{prod}\left(\frac{\partial J}{\partial \mathbf{o}}, \frac{\partial \mathbf{o}}{\partial \mathbf{W}^{(2)}}\right) + \text{prod}\left(\frac{\partial J}{\partial s}, \frac{\partial s}{\partial \mathbf{W}^{(2)}}\right)= \frac{\partial J}{\partial \mathbf{o}} \mathbf{h}^\top + \lambda \mathbf{W}^{(2)}.
$$
$$
\frac{\partial J}{\partial \mathbf{h}}
= \text{prod}\left(\frac{\partial J}{\partial \mathbf{o}}, \frac{\partial \mathbf{o}}{\partial \mathbf{h}}\right)
= {\mathbf{W}^{(2)}}^\top \frac{\partial J}{\partial \mathbf{o}}.
$$
$$
\frac{\partial J}{\partial \mathbf{z}}
= \text{prod}\left(\frac{\partial J}{\partial \mathbf{h}}, \frac{\partial \mathbf{h}}{\partial \mathbf{z}}\right)
= \frac{\partial J}{\partial \mathbf{h}} \odot \phi'\left(\mathbf{z}\right).
$$
$$
\frac{\partial J}{\partial \mathbf{W}^{(1)}}
= \text{prod}\left(\frac{\partial J}{\partial \mathbf{z}}, \frac{\partial \mathbf{z}}{\partial \mathbf{W}^{(1)}}\right) + \text{prod}\left(\frac{\partial J}{\partial s}, \frac{\partial s}{\partial \mathbf{W}^{(1)}}\right)
= \frac{\partial J}{\partial \mathbf{z}} \mathbf{x}^\top + \lambda \mathbf{W}^{(1)}.
$$


### nn的训练
训练神经网路时，前向传播和反向传播相互依赖。 对于前向传播，我们沿着依赖的方向遍历计算图并计算其路径上的所有变量。 然后将这些用于反向传播，其中计算顺序与计算图的相反。
因此，在训练神经网络时，在初始化模型参数后， 我们交替使用前向传播和反向传播，利用反向传播给出的梯度来更新模型参数。 注意，反向传播重复利用前向传播中存储的中间值，以避免重复计算。 带来的影响之一是我们需要保留中间值，直到反向传播完成。 这也是训练比单纯的预测需要更多的内存（显存）的原因之一。
此外，这些中间值的大小与网络层的数量和批量的大小大致成正比。 因此，使用更大的批量来训练更深层次的网络更容易导致内存不足错误。