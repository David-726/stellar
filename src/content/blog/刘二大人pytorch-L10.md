---
title: "L10"
published: 2026-04-27
description: ""
tags: ["刘二大人pytorch"]
draft: false
---
# Basic CNN

### Revison:Fully Connected Netural Network
**任意的输入于输出之间都有对应的权重 故也称作为全连接层
### CNN
Convolutional Netural Network
以MNIST为例子：在全连接的时候，会将对应的features展开为一维数组，从而丧失某些空间结构的特征
但是CNN则以原始图像的结构作为输入，从而保留原始的空间结构
<img src="/posts/assets/ev6pbh-Pasted-image-20260427230245.png" alt="Pasted image 20260427230245.png" loading="lazy" />
这些Convolution和Subsampling被称之为Feature Extraction即特征提取器
对后面的全连接层进行分类操作 Classfication
### Convolution:
图像一般采用RGB三通道图像
>栅格图像 矢量图像

**Input Channel:Red Green Blue
<img src="/posts/assets/1cfnhg2-Pasted-image-20260427231538.png" alt="Pasted image 20260427231538.png" loading="lazy" />
卷积过程:遍历每一层
Convolution-Single Input Channel
<img src="/posts/assets/y1kbns-Pasted-image-20260427231737.png" alt="Pasted image 20260427231737.png" loading="lazy" />
Input 利用对应的Kernel Function 遍历 对应元素点乘累加
每一个通道都需要一个Kernel Function
<img src="/posts/assets/1ky5b3z-Pasted-image-20260427231922.png" alt="Pasted image 20260427231922.png" loading="lazy" />

<img src="/posts/assets/16xfe7-Pasted-image-20260427232047.png" alt="Pasted image 20260427232047.png" loading="lazy" />
**Input Channel=n;Kernel Function Channnel=n
若是需要m个output通道，则卷积核Kernel Function则需要m个，又是若需要m个filters
<img src="/posts/assets/otr9vy-Pasted-image-20260427232326.png" alt="Pasted image 20260427232326.png" loading="lazy" />

**This layer needs m fliter,which size are:
$n*kernel\_size_{width}*kernel\_size_{height}$
### Convolutional Layer
Input $n*width_{in}*height_{in}$
Output $m*width_{out}*height_{out}$
The Kernel Function need:4-Diemension Tensor
$m*n*kernel\_size_{width}*kernel\_size_{height}$
```python
import torch
in_channels,out_channels=5,10
width,height=100,100
kernel_size=3
batch_size=1
input=torch.randn(batch_size,in_channels,width,height)
conv_layer=torch.nn.Conv2d(in_channels,out_channels,kernel_size=kernel_size)
output=conv_layer(input)

print(input.shape)
print(output.shape)
print(conv_layer.weight.shape)
```
#### Padding :填充
**Output_size=input_size+padding_size-kernel_size+1
<img src="/posts/assets/1m7lnv2-Pasted-image-20260428211519.png" alt="Pasted image 20260428211519.png" loading="lazy" />
最常见的padding是填充0
```python
import torch
input = [3,4,6,5,7,
		 2,4,6,8,2,
		 1,6,7,8,4,
		 9,7,4,6,2,
		 3,7,5,4,1]
#四个参数分别是Batch,Channel,Width,Height
input = torch.Tensor(input).view(1,1,5,5)
#Bias是在卷积完了之后给卷积加上一个偏置量
conv_layer = torch.nn.Conv2d(1,1,kernel_size=3,padding=1,bias=False)
#这里view的参数分别是Output_Channel Input_Channel Width Height
kernel=torch.Tensor([1,2,3,4,5,6,7,8,9]).view(1,1,3,3)
conv_layer.weight.data=kernel.data

output=conv_layer(input)
print(output)
```
### Stride (步长)
**图中stride=2
<img src="/posts/assets/n4h9gz-Pasted-image-20260428212355.png" alt="Pasted image 20260428212355.png" loading="lazy" />
$Output_size=Input_size-Kernel_size-(Stride-1)+1$
```python
import torch
input = [3,4,6,5,7,
		 2,4,6,8,2,
		 1,6,7,8,4,
		 9,7,4,6,2,
		 3,7,5,4,1]
input=torch.Tensor(input).view(1,1,5,5)
conv_layer=torch.nn.Conv2d(1,1,kernel_size=3,stride=2,bias=False)
kernel=torch.Tensor([1,2,3,4,5,6,7,8,9])
conv_layer.weight.data=kernel.data
output=conv_layer(input)
print(output)
```
#### Max Pooling Layer(最大池化层)
Polling池化
对于一个2*2的MaxPooling而言默认的Stride=2
MaxPolling值得是按stride=2遍历找出每一个被MaxPolling所圈中的框中的最大值
2*2的MaxPooling的输出会减少一半
```python
import torch
input = [3,4,6,5,7,
		 2,4,6,8,2,
		 1,6,7,8,4,
		 9,7,4,6,2,
		 3,7,5,4,1]
input=torch.Tensor(input).view(1,1,5,5)
#torch中的MaxPooling的为MaxPool2d，其中默认步长和Kernel_size一致
maxpooling_layer=torch.nn.MaxPool2d(kernel_size=2)

output=maxpooling_layer(input)
print(output)
```
#### A simple Convolutional Neural NetWork
<img src="/posts/assets/1v1fgib-Pasted-image-20260428213758.png" alt="Pasted image 20260428213758.png" loading="lazy" />
**我们可以看出卷积和池化层不太在乎输入的大小 而最后的全连接层则需要计算出给其输入的尺寸大小
```python
class Net(torch.nn.Module):
	def __init__(self):
		super(Net,self).__init__()
		self.conv1=torch.nn.Conv2d(1,10,kernel_size=5)
		self.conv2=torhc.nn.Conv2d(10,20,kernel_size=5)
		self.pooling=torch.nn.MaxPool2d(2)
		self.fc=torch.nn.Linear(320,10)
		
	def forward(self,x):
		batch_size=x.size(0)
		x=F.relu(self.pooling(self.conv1(x)))
		x=F.relu(self.pooling(self.conv2(x)))
		x=x.view(batch_size,-1)#展开为全连接层 flatten
		x=self.fc(x)
		return x
model=Net(x)
```
#### How to Use Gpu 
##### Move Model to Gpu
```python
model=Net()
#Define device as the first visible cuda device if we have CUDA avaiable
device=torch.device("cuda:0",if torch.cuda.is_avaiable() else 'cpu')
#Convert parameters and buffers of all modules to CUDA Tensor
model.to(device)
```
```python
def train(epoch):
	running_loss=0.0
	for batch_idx,data in enumerate(train_loader,0):
		inputs,target=data
		#切记要放在同一块显卡上
		inputs,target=inputs.to(device),traget.to(device)
		optimizer.zero_grad()
		
	#forward+BackWard+Uodate
	outputs=model(inputs)
	loss=criterion(outputs,target)
	loss.backward()
	optimizer.step()
	
	running_loss+=loss_item()
	if batch_idx %300 -299
		#当前打印店是最近300次的loss
		print('[%d %5] loss:%.3f'%(epoch+1,batch_idx+1,running_loss/200))
		running_loss=0.0
```
```python
def test():
	correct=0
	total=0
	with torch.no_grad():
		for data in test_loader:
			inputs,target=data
			#Send the inputs and targets at every step to the GPU
			inputs,target=inputs.to(device),target.to(device)
			outputs=model(inputs)
			_,predicted=torch.max(outputs.data,dim=1)
			total+=target.size(0)
			correct+=(predicted==target).sum().item()
	print('Accuracy on test set:%d %% [%d%d]'%(100*correct/total,correct,total))
```
#### Exercise:
- **Try a more complex CNN
	- **Conv2d Layer*3
	- **ReLu Layer*3
	- **MaxPooling Layer*3
	- **Linear Layer*3
- **Try different configuration of this CNN:
  - **Compare their performance