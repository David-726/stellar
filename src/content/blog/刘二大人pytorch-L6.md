---
title: "L6"
published: 2026-04-21
description: ""
tags: ["刘二大人pytorch"]
draft: false
---
# Logistic Regression
### Classification-The MINIST Dataset
**The database of handwritten dighits
- Training set:60000 examples
- Test set:10000 examples
- Classes:10
**手写数字识别:
$y\in\{0,1,2,3,4,5,6,7,8,9\}$
不能通过LinearRegression进行分类 因为识别数字并不是在进行数值上的比较
核心需要：跟据输入的x 分析输出的概率值P(x) 从而在P(x)中找最大值
```python
import torchvision
train_set = torchvision.datasets.MNIST(root='../dataset/mnist',train=True,download=True)
test_set=torchvision.datasets.MNIST(root='../dataset/mnist',train=False,download=True)
#train=True是否作为训练集使用 download=True第一次使用是否下载
```
**torchvision是pytorch提供的一个数据包：包含了一些比较流行的数据集
#### The CIFAR-10 dataset
pytorch还提供CIFAR-10dataset
```python
import torchvision
train_set=torchvision.datasets.CIFAR10(...)
train_set=torchvision.datasets.CIFAR10(...)
```

| x(hours) | y(pass/fail) |
| :--: | :--: |
| 1 | 0 |
| 2 | 0 |
| 3 | 1 |
| 4 | ？|
$P(\hat y=1)+P(\hat y =0)=1$
**In classification,the output of model is the probability of input belongs to the exact class
#### Logistic Function:How to map :R->[0,1]
$\sigma(x)=\frac{1}{1+e^{-x}}$
将$\hat y=w*x+b$由实数值映射到[0,1]
Sigmond Function(饱和函数)：
$$
\begin{align}
erf(\frac{\sqrt{\pi}}{2}x)\newline
\frac{x}{\sqrt{1+x^2}}\newline
tanh(x)\newline
\frac{2}{\pi}arctan(\frac{\pi}{2}x)\newline
\frac{2}{\pi}gd(\frac{\pi}{2}x)\newline
\frac{x}{1+|x|}
\end{align}
$$
**这些函数的值有极限 单调增 是饱和函数：
称之为sigmond:其中最出名的是logistic Function 因而在很多的框架中直接将其称作sigmond函数
$\hat y=\sigma(x*w+b)$
