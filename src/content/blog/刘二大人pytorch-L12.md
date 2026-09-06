---
title: "L12"
published: 2026-05-06
description: ""
tags: ["刘二大人pytorch"]
draft: false
---
# L12
### Basic RNN
>**RNN:循环神经网络**
#### Revision:DNN
**Dense Netural Network**
>例如：我们需要预测天气情况 若干天的数据来作为输入 

| Day | 温度 | 气压 | 雨 |
| :--: | :--: | :--: | :--: |
| ... | ... | ... | ... |

**每一天：若干个特征
若干天：Input**
>x1_3dim x2_3dim x3_3dim
我们可以选择将3个3dim的数据拼成一个9dim的数据
**如果我们的序列很长 而且维度很高 这对我们的网络的训练是一个非常大的挑战 原因是稠密的神经网络中神经其实是最多的**
**例如Input 128 Output 64 25*25的Net 我们需要$128*64*25*25=20w$个元素**
**卷积网络虽然比较复杂 但是权重不多(权重共享) 全连接层的权重很多**

**RNN则用于处理具有序列连接的数据的问题**
例如我们常见的股市、天气、**以及我们常见的自然语言**
>eg:我爱北京天安门
是一种具有典型的序列的数据的输入

### What is RNNs
$$
\begin{align}
x_{t} -> RNN Cell -> h_{t}\newline
\end{align}
$$
>例如x_t是一个3dim数据 h_t是一个5dim数据 则这里的RNN Cell是一个Linear Unit
$$
\begin{align}
x_{1} -> RNN Cell_{1} -> h_{1}\newline
x_{2} -> RNN Cell_{2} -> h_{2}\newline
x_{3} -> RNN Cell_{3} -> h_{3}\newline
x_{4} -> RNN Cell_{4} -> h_{4}\newline
\end{align}
$$
但这里的Linear Unit同从前的不同但这里的$RNN Cell_{i}$同之前的$i-1$的元素有关 也就是所谓的循环
$$ 
\begin{align}
h_{t-1}\in\mathbf{R}^{hidden\_size}\newline
W_{hh}*h_{t-1}+b_{hh}\newline
+
x_{in}\in \mathbf{R}^{input\_size}\newline
W_{in}*x_{t}+b_{ih}\newline
\newline
tanh\,(activate function)\newline
h_{t}\in \mathbf{R}^{hidden\_size}\newline
\begin{bmatrix}
w_1\,w_2
\end{bmatrix}
\begin{bmatrix}
h\\
x
\end{bmatrix}=w_1*h+w_2*x
\end{align}
$$
**以循环的形式序列一个一个送进去 求出他们的隐层的过程就叫做RNN**
RNNCell只是其中的一个单元
#### RNN Cell in Pytorch
**Pytorch中有两种方式构造RNN Cell**
- 一种是构造自己的RNN Cell
- 另一种是直接使用RNN
~~~python
cell=torch.nn.RNNCell(input_size=input_size,hidden_size=hidden_size)
hidden=cell(input,hidden)#当前时刻的input和hidden input of shape(batch,input_size) hidden of shape(batch,hidden_size)Output:hidden of shape(batch,hidden_size)
~~~
**Suppose We Have swquence with below properities**
- batchSize=1
- seqLen=3
- inputSize=4
- hiddenSize=2

**So the shape of inputs and outputs of RNNCell:**
- input.shape=(batchSize,inputSize)
- output.shape=(batchSize,hiddenSize)

**The Sequence can be warped in one Tensor with shape:**
- dataset.shape=(seqLen,batchSize,inputSize)
~~~python
import torch

batch_size=1
seq_len=3
input_size=4
hidden_size=2

cell=torch.nn.RNNCell(input_size=input_size,output_size=output_size)

#(seq,batch,features)
daraset=torch.randn(seq_len,batch_size,input_size)
hidden=torch.zeros(batch_size,hidden_size)

for idx,input in enumerate(dataset):
  print('='*20,idx,'='*20)
  print('Input size: ',input.shape)
  
  hidden=cell(input,hidden)
  
  print('outputs size: ',hidden.shape)
  print(hidden)
~~~
**最重要的一点是要Input和Output的Shape**
### How to Use RNN
~~~python
cell=torch.nn.RNN(input_size=input_size,hidden_size=hidden_size,num_layers=num_layers)#注意这里的num_layersRNN的层数 RNN的运算很耗时
out,hidden=cell(inputs,hidden)
~~~
**Input:**
Input of shape(seqSize,batch,input_size)
hidden of shape(numLayers,batch,hidden_size)
**Output:**
Output of shape(seqLen,batch,output_size)
hidden of shape(numLayers,batch,hidden_size)
**Suppose we have sequence with below properties**
- batchSize
- seqLen
- inputSize,hiddenSize
- numLayers
**The Shape of input and h_0 of RNN**
- input.shape=(seqLen,batchSize,inputSize)
- h_0.shape=(numLayers,batchSize,hiddenSize)
#### How to use RNN - numLayers
~~~python
import torch

batch_size=1
seq_len=3
input_size=4
hidden_size=2
num_layers=1

cell=torch.nn.RNN(input_size=input_size,output_size=output_size,num_layers=num_layers)
#(SeqLen,BatchLen,InputSize)
inputs=torch.randn(seq_len,batch_size,input_size)
hidden=torch.zeros(num_layers,batch_size,hidden_size)

out,hidden=cell(inputs,hidden)
print('Output size:',out.shape)
print('Output:',out)
print('Hidden Size',hidden.shape)
print('Hidden:',hidden)
~~~
##### Other Parameter

- batch_first:if True,the input and output tensors are provided as:
  - (batchSize,seqLen,input_Size)
- Train a Model to learn:
  - "hello"->"ohlol"
  >怎样用RNN_Cell实现这个功能
    - The inputs of RNN Cell should be vectors of numbers.
    Input:hello
**创建一个字典 为每一个需要的字符创造索引**

| character | index |
| :--: | :--: |
| e | 0 |
| h | 1 |
| l | 2 |
| o | 3 |

hello->10223\
**Indices**->**One-Hot vectors**
InputSize=4
#### Example 12-1:using RNNCell
~~~python
import torch 

input_size=4
hidden_size=4
batch_size=1

idx2char=['e','h','1','o']
x_data=[1,0,2,2,3]
y_data=[3,1,2,3,2]
one_hot_lookup=[[1,0,0,0],
                [0,1,0,0],
                [0,0,1,0],
                [0,0,0,1]]
x_one_hot=[one_hot_looku0p[x]for x in x_data]

inputs=torch.Tensor(x_one_hot).view(-1,batch_size,input_size)
labels=torch.LongTensor(y_data).view(-1,1)

class Model(torch.nn.Module):
  def __int__(self,input_size,hidden_size,batch_size):
    super(Model,self).__init
    self.batch_size=batch_size
    self.input_size=input_size
    self.hidden_size=hidden_size
    self.rnncell=torch.nn.RNNCell(input_size=self.input_size,hidden_size=self.hidden_size)
  
  def forward(self,input,hidden):
    hidden=self.rnncell(input,hidden)
    return hidden
  def init_hidden(self):
    return torch.zeros(self.batch_size,self.hidden_size)
net=Model(input_size,hidden_size,batch_size)

criterion=torch.nn.CrossEntropyLoss()
optimizer=torch.optim.Adam(net.parameters(),lr=0.1)

#training steps:
for epochs in range(15):
  loss=0
  optimizer.zero_grad()
  hidden=net.init_hidden()
  print('Predicted string:',end='')
  for input,label in zip(inputs,labels)：
    hidden=net(input,hidden)
    loss+=crtierion(hidden,label)
    _,idx=hidden.max(dim=1)
    print(idx2char[idx.item()],end='')
  loss.backward()
  optimizer.step()
  print(',Epoch[%d/15] loss=%.4f'%(epoch+1,loss.item()))
~~~
```python

class Model(torch.nn.Module):
	def __init__(self,input_size,hidden_size,batch_size,num_layer=1):
		super(Model,self).__init__()
		self.num_layer=num_layer
		self.input_size=input_size
		self.hidden_size=hidden_size
		self.batch_size=batch_size
		self.rnn=torch.nn.RNN(input_size=self.input_size,output_size=self.output_size,num_layers=self.num_layers)
		
	def forward(self,input):
		hidden=torch.zeros(self.num_layers,self.batch_size,self.hidden_size)
		out,_=self.rnn(input,hidden)
		return out.view(-1,self.hidden_size)
		
net=Model(input_size,hidden_size,batch_size,num_layers)

criterion = torch.nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(net.parameters(),lr=0.05)
#Training Steps:
for epoch in range(15):
	optimizer.zero_grad()
	outputs=net(inputs)
	loss=criteriona(outputs,labels)
	loss.backward()
	optimizer.step()
	
	_,idx==outputs.max(dim=1)
	idx=idx.data.numpy()
	print('Predicted:.',' ',join([idx2char[x] for z in idx]),end=' ')
	print(',Epoch [%d/15] loss=%.3f'%(epoch+1,loss.item()))
	
	idx2char=['e','h','1','o']
	x_data=[1,0,2,2,3]
	y_data=[3,1,2,3,2]
	
	one_hot_lookup = [[1,0,0,0],
					  [0,1,0,0],
					  [0,0,1,0],
					  [0,0,0,1]]
	x_one_hot = [one_hot_lookup[x] for x in x_data]
	
	inputs=torch.Tensor(x_one_hot).view(seq_len,batch_size,input_size)
	labels=torch.LongTensor(y_data)
```
### Associate a vector with a word/character
#### One-hot encoding of words and characters
- The one-hot vectors are hig-dimension
- The one-hot vectors are sparse
- The one-hot vectors are hardcoded
### Do we have a way to associate a vector with word/character with following specification
- Lower-dimension
- Dense
- Learned from data
### A polular and powerful way is called EMBEDDING
#### One-hot VS Embedding
|  One-hot  | Embedding         |
| :-------: | ----------------- |
| High-dim  | Lower-dim         |
|  Sparse   | Dense             |
| Hardcoded | Learned from data |
### Embedding in Pytorch

#### Using embedding  and linear layer
Drawing 2026-05-07 22.34.53.excalidraw
```python
class Model(torch.nn.Module):
	def __init__(self):
		super(Model,self).__init__()
		self.emb=torch.nn.Embedding(input_size,embedding_size)
		self.rnn=torch.nn.RNN(input_size=embedding_size,hidden_size=hidden_size,hum_layer=num_layers,batch_first=True)
		self.fc=torch.nn.Linear(hidden_size,num_class)
	def forward(self,x):
		hidden=torch.zeros(num_layers,x.size(0),hidden_size)
		x=self.emd(x)#(batch,seqLen,embeddingSize)
		x,_=self.rnn(x,hidden)
		x=self.fc(x)
		return x.view(-1,num_class)
```
**Input of FC Layer
(batchSize,seqLen,embeddingSize)
Output of FC Layer
(batchSize,seqLen,numClass)


```python
#parameters:
num_class=4
input_size=4
hidden_size=8
embedding_size=10
num_layer=2
batch_size=1
seq_len=5

idx2char=['e','h','l','o']
x_data=1,0,2,2,3#(batch,seq_Len)
y_data=[3,1,2,3,2]#(batch*seq_len)

inputs=torch.LongTensor(x_data)
labels=torch.LongTensor(y_data)

net=Model()
crtierion=torch.nn.CrossEntropyLoss()
optimizer=torch.optim.Adam(net.parameters(),lr=0.05)

for epoch in range(15):
	optimizer.zero_grad()
	outputs=net(inputs)
	loss=criterion(outputs,labels)
	loss.backward()
	optimizer.step()
	
	_,idx=outputs.max(dim=1)
	idx=idx.data.numpy()
	print('Predicted',''.join([idx2char[x] for x in idx]),end='')
	print(',Epoch [%d/15] loss=%.3f' % (epoch+1,loss.item()))
```

### Exercise 12-1 Using LSTM
>读取文档了解什么是LSTM

