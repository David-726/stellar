---
title: "填充"
published: 2026-08-22
description: ""
tags: ["CNN"]
draft: false
---
## Padding
我们直到Conv之后，输出会比输入略小，**经常丢失边缘像素**，随着卷积层的叠加，丢置会越来越多。
->聪明的古人发明了`Padding`




<img src="/posts/assets/4k714i-conv-pad.svg" alt="conv-pad.svg" loading="lazy" />



从而输出尺寸等于:
$$
(n_{h}-k_{h}+p_{h}+1)*(n_{w}-k_{w}+p_{w}-1)
$$
很多时候，我们要求输入和输出的尺寸保持一致
从而有$p_{h}=k_{h}-1$和$p_{w}=k_{w}-1$
假设$k_{h}$是奇数，我们将在高度的两侧填充$p_{h}/2$行，若$k_{h}$是偶数，则一种可能是在输入顶部两侧填充$[p_{h}/2]$，在底部填充$p_{h}-[p_{h}/2]$行,注意这里是整除运算。
下面，创建1个高宽为3的2d卷积层，并在所有侧边填充1个像素。给定高宽为8的输入，则输出的高宽也是8
8-3+2+1=8
```python
import torch
from torch import nn
# 为了方便起见，定义1个计算卷积层的函数
# 该函数初始化卷积层权重，并对输入提高和所见相应的位数
def comp_conv2d(conv2d,X:
	# (1,1)表示batch=1且通道数是1
	X=X.reshape((1,1)+X.shape)
	Y=conv2d(X)
	#省略前2个维度:批量大小通道数=
	return Y.reshape(Y.shape[2:])
	
#注意Conv2d每个边都填充1行或1列
conv2d = nn.Conv2d(1,1,kernel_size=3,padding=1)
X = torch.rand(size=(8,8))
comp_conv2d(conv2d,X).shape
```
```
conv2d = nn.Conv2d(1,1,kernel_size=(5，3),padding=(2,1))
comp_conv2d(conv2d,X).shape
```
### 步幅
计算互相关时，卷积窗口从输入张量的左上角开始，向下、向右滑动。
将每次滑动的元素称之为**slide**




<img src="/posts/assets/cbqk74-conv-stride.svg" alt="conv-stride.svg" loading="lazy" />



垂直步幅$s_{h}$、水平步幅$s_{w}$时，输出形状为
$$
[(n_{h}-k_{h}+p_{h}+s_{h})/s_{h}]*[(n_{w}-k_{w}+p_{w}+s_{w})/s_{w}]
$$
```python
conv2d = nn.Conv2d(1,1,kernel_size=3,padding=1,stride=2)
comp_conv2d(conv2d,X).shape
```
```python
conv2d = nn.Conv2d(1,1,kernel_size=(3,5),padding=(0,1),stride=(3,4))
comp_conv2d(conv2d,X).shape
```
### Practice
1. 对于本节中的最后一个示例，计算其输出形状，以查看它是否与实验结果一致。
    
2. 在本节中的实验中，试一试其他填充和步幅组合。
    
3. 对于音频信号，步幅说明什么？
    
4. 步幅大于的计算优势是什么？
