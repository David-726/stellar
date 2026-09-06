---
title: "MNIST 的尝试"
published: 2026-05-26
description: ""
tags: ["D2lNotes"]
draft: false
---
# MNIST的尝试
MNIST数据集 ([LeCun _et al._, 1998](https://zh.d2l.ai/chapter_references/zreferences.html#id90 "LeCun, Y., Bottou, L., Bengio, Y., Haffner, P., & others. (1998). Gradient-based learning applied to document recognition. Proceedings of the IEEE, 86(11), 2278–2324.")) 是图像分类中广泛使用的数据集之一，但作为基准数据集过于简单。 我们将使用类似但更复杂的Fashion-MNIST数据集 ([Xiao _et al._, 2017](https://zh.d2l.ai/chapter_references/zreferences.html#id189 "Xiao, H., Rasul, K., & Vollgraf, R. (2017). Fashion-mnist: a novel image dataset for benchmarking machine learning algorithms. arXiv preprint arXiv:1708.07747."))。
```python
import torch
import torchvision
from torch.utils import data
from torchvision import transforms
from d2l import torch as d2l

d2l.use_svg_display()
```
```python
# 通过ToTensor实例将图像数据从PIL类型变换成32位浮点数格式，
# 并除以255使得所有像素的数值均在0～1之间
trans = transforms.ToTensor()
mnist_train = torchvision.datasets.FashionMNIST(root="../data",train=True,transform=trans,download=True)
mnist_test = torchvision.datasets.FashionMNISET(root="../data",train=False,transform=trans,download=True)

len(mnist_train),len(mnist_test)
```
输入图像的高宽均为28pixels 又灰度图像组成，通道数为1。
```python
mnist_train[0][0].shape
```
Fashion-MNIST中有10种种类
```python
def get_fashion_mnist_labels(labels):
	text_labels = ['t-shirt', 'trouser', 'pullover', 'dress', 'coat',
                   'sandal', 'shirt', 'sneaker', 'bag', 'ankle boot']
    return [text_labels[int(i)]for i in labels]
```
```python
def show_iamges(img,num_rows,num_cols,titles=None,scale=1.5)
	figsize = (num_cols * scale,num_rows * scale)
	_,axes = d2l.plt.subplots(num_rows,num_cols,figsize=figsize)
	axes = axes.flastten()
	for i,(ax,img) in enumerate(zip(axes,imgs)):
		if torch.is_tensor(img):
			ax.imshow(img.numpy())
		else:
			ax.imshow(img)
		ax.axes.get_xaxis().set_visible(False)
		ax.axes.get_yaxis().set_visible(False)
		if titles:
			ax.set_title(titles[i])
	return axes
```
```python
X,y = next(iter(data.DataLoader(mnist_train,batch_size=18)))
show_images(X.reshape(18,28,28),2,9,titles=get_fashion_mnist_labels(y))
```
```python
batch_size = 256
def get_dataloader_workers():
	return 4
train_iter = data.DataLoader(mnist_train,baych_size,shuffle=True,num_workers=get_dataloader_workers())
```
```python
timer = d2l.Timer()
for X,y in train_iter:
	continue
f'{timer.stop():.2f}sec'
```
```python
def load_data_fashion_mnist(batch_size,resize=None)
	trans = [transform.ToTensor()]
	if resize:
		trans.insert(0,transform.Resize(rerszie))
	trans = transform.Compose(trans)
	mnist_train = torchvision.datasets.FashionMNIST(root="../data",train=True,transform=trans,download=True)
	mnist_test = torchvision.datasets.FashionMNIST(root="../data",train=False,transform=trans,download=True)
	return (data.DataLoader(mnist_train,batch_size,shuffle=True,num_workers=get_dataloader_workers()),data.DataLoader(mnist_test,batch_size,shuffle=True,num_workers=get_dataloader_workers()))
```
```python
train_iter,test_iter = load_data_fashion_mnist(32,resize=64)
for X,y in train_iter:
	print(X.shape,X.dtype,y.shape,y.dtype)
	break
torch.Size([32,1,64,64])torch.float32 torch.Szie([32])torch.int64
```