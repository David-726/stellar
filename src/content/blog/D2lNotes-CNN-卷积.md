---
title: "卷积"
published: 2026-08-22
description: ""
tags: ["D2lNotes"]
draft: false
---
- 平移不变性
- 局部性
### MLP的限制
MLP的输入是2d图像$X$，MLP的任意一个中间位置$H$，都需要所有的输入:
$$
\begin{align}
[H]_{i,j} &= [U]_{i,j}+\sum_{k}\sum_{l}[W]_{i,j,k,l}[X]_{k,l}\\
&=[U]_{i,j}+\sum_{a}\sum_{b}[V]_{i,j,a,b}[X]_{i+a,j+b}
\end{align}
$$
上方$[W]$需要所有的$k、l$,下方$[V]$只需要一小部分的$a、b$
#### 平移不变性
检测对象在输入$X$中的平移，应该仅导致$H$中的平移，也就是说$V$和$U$实际上不依赖于$(i,j)$的值，即$[V]_{i,j,a,b}=[V]_{a,b}$,
因此可以简化$[H]$
$$
[H]_{i,j} = [U]_{i,j}+\sum_{a}\sum_{b}[V]_{a,b}[X]_{i+a,j+b}
$$
#### 局部性
在$|a| > \Delta$或$|b| >\Delta$范围之外，可以设置$[V]_{a,b}=0$,因此$[H]_{i,j}$可以重写为:
$$
[H]_{i,j}=u+ \sum^{\Delta}_{a=-\Delta}\sum^{\Delta}_{n-\Delta}[V]_{a,b}[X]_{i+a,j+b}
$$

$[V]$就是**大名鼎鼎**的**Conv Kernel**,**可使小儿止啼哭**

$$
\begin{align}
一维卷积:\\
(f*g)(i)&=\sum_{a}f(a)g(i-a)\\
(f*g)(i,j)&=\sum_{a}\sum_{b}f(a,b)g(i-a,j-b)
\end{align}
$$
