---
title: "GoogLeNet"
published: 2026-08-23
description: ""
tags: ["CNN"]
draft: false
---
# GoogLeNet
### Inception块
GoogLeNet中，基本的卷积块被称之`Inception Block`
We Need To Go Deeper




<img src="/posts/assets/o3q77i-inception.svg" alt="inception.svg" loading="lazy" />



**神之配比**:
```python
import torch
from torch import nn
from torch.nn import functioanl as F
from d2l import torch as d2l

class Inception(nn.Module):
	def __init__(self,in_channels,c1,c2,c3,c4,**kwargs):
		super(Inception,self).__init__(**kwargs)
		self.p1_1=nn.Conv2d(in_channels,c1,c2,c3,c4,**kwargs)
		self.p2_1=nn.Conv2d(in_channels,c2[0],kernel_size)
		self.p2_2=nn.Conv2d(c2[0],c2[1],kernel_size)
		self.p3_1=nn.Conv2d(in_channels,c2[0],kernel_size=1)
		self.p3_2=nn.Conv2d(c3[0],c3[1],kernel_size=5,padding=2)
		self.p4_1=nn.MaxPool2d(kernel_size=3,stride=1,padding=1)
		self.p4_2=nn.Conv2d(in_channels,c4,kernel_size=1)
	def forward(self,x):
		p1=F.relu(self.p1_1(x))
		p2=F.relu(self.p2_2(F.relu(self.p2_1(x))))
		p3=F.relu(self.p3_2(F.relu(self.p3_1(x))))
		p4=F.relu(self.p4_2(self.p4_1(x)))
	return torch.cat((p1,p2,p3,p4),dim=1)
```

### GoogLeNet模型




<img src="/posts/assets/vblmtd-inception-full.svg" alt="inception-full.svg" loading="lazy" />



穷人靠变异，富人靠科技
```python
b1 = nn.Sequential(nn.Conv2d(1,64,kernel_size=7,stride=2,padding=3),nn.ReLU(),nn.MaxPool2d(kernel_size=3,stride=2,padding=1))
```
```python
b2 = nn.Sequential(nn.Conv2d(64,64,kernel_size=1),nn.ReLU(),nn.Conv2d(64,192,kernel_size=3,padding=1),nn.ReLU(),nn.MaxPool2d(kernel_size=3,stride=3,padding=1))

```
```python
b3 = nn.Sequential(Inception(192,64,(96,128),（16，32),32),Inception(256,128,(128,192),(32,96),64),nn.MaxPool2d(kernel_size=2,stride=2,padding=1)
```
```python
b4 = nn.Sequential(Inception(480,192,(96,208),(16,48),64),
Incepyion(512,160,(112,224),(24,64),64),
Inception(512,128,(128,256),(24,64),64),
Inception(512,112,(144,288),(32,64),64),
Inception(528,256,(160,320),(32,128),128),
nn.MaxPool2d(kernel_size=3,stride=2,padding=1))
```
```python
b5 = nn.Sequential(Inception(832,256,(160,320),(32,128),128),
Inception(832,384,(192,384),(48,128),128),
nn.AdaptiveAvgPool2d((1,1)),
nn.Flatten())

net = nn.Sequential(b1,b2,b3,b4,b5,nn.Linear(1024,10))
```
```python
X = torch.rand(size=(1,1,96,96))
for layer in net:
	X=layer()
	print(layer.__class__.__name__,'output shape:\t',X.shape)
```
### 训练模型
```python
lr,num_epoches,batch_size=0.1,10,128
train_iter,test_iter=d2l.load_data_fashion_mnist(batch_size,resize=96)
d2l.train_ch6(net,train_iter,test_iter,num_epoches,lr,d2l.try_gpu())
```

### Peactice
1. GoogLeNet有一些后续版本。尝试实现并运行它们，然后观察实验结果。这些后续版本包括：
    
    - 添加批量规范化层 ([Ioffe and Szegedy, 2015](https://zh.d2l.ai/chapter_references/zreferences.html#id75 "Ioffe, S., & Szegedy, C. (2015). Batch normalization: accelerating deep network training by reducing internal covariate shift. arXiv preprint arXiv:1502.03167."))（batch normalization），在 [7.5节](https://zh.d2l.ai/chapter_convolutional-modern/batch-norm.html#sec-batch-norm)中将介绍；
        
    - 对Inception模块进行调整 ([Szegedy _et al._, 2016](https://zh.d2l.ai/chapter_references/zreferences.html#id163 "Szegedy, C., Vanhoucke, V., Ioffe, S., Shlens, J., & Wojna, Z. (2016). Rethinking the inception architecture for computer vision. Proceedings of the IEEE conference on computer vision and pattern recognition (pp. 2818–2826)."))；
        
    - 使用标签平滑（label smoothing）进行模型正则化 ([Szegedy _et al._, 2016](https://zh.d2l.ai/chapter_references/zreferences.html#id163 "Szegedy, C., Vanhoucke, V., Ioffe, S., Shlens, J., & Wojna, Z. (2016). Rethinking the inception architecture for computer vision. Proceedings of the IEEE conference on computer vision and pattern recognition (pp. 2818–2826)."))；
        
    - 加入残差连接 ([Szegedy _et al._, 2017](https://zh.d2l.ai/chapter_references/zreferences.html#id161 "Szegedy, C., Ioffe, S., Vanhoucke, V., & Alemi, A. A. (2017). Inception-v4, inception-resnet and the impact of residual connections on learning. Thirty-First AAAI Conference on Artificial Intelligence."))。（ [7.6节](https://zh.d2l.ai/chapter_convolutional-modern/resnet.html#sec-resnet)将介绍）。
        
2. 使用GoogLeNet的最小图像大小是多少？
    
3. 将AlexNet、VGG和NiN的模型参数大小与GoogLeNet进行比较。后两个网络架构是如何显著减少模型参数大小的？