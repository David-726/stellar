---
title: "RNN的从0开始实现"
published: 2026-08-27
description: ""
tags: ["RNN"]
draft: false
---
```python
$matplotlib inline
import math
import torch
from torch import nn
from torch.nn import functioanl as F
from d2l import torch as d2l

batch_size,num_steps=32,25
train_iter,vocab = d2l.load_data_time_machine(batch_size,num_steps)
```
### 独热编码
将每个次元表示为更具表现力的特征向量,最简单的表示称之为**独热编码**
```python
F.one_hot(torch.tensor([0,2]),len(vocab))
```
```python
X = torch.arange(10).reshape((2,5))
F.one_hot(X.T,28).shape
```
### 初始化模型参数
```python
def get_params(vocab_size,num_hiddens,device):
	num_inputs = num_outputs = vocab_size
	def normal(shape):
		return torch.randn(size=shape,device=device)*0.01
	W_xh = normal((num_inputs,num_hiddens))
	W_hh = normal((num_hiddens,num_hiddens))
	b_h = torch.zeros(num_hiddens,device=device)
	
	W_hq=normal((num_hiddens,num_outputs))
	b_q = torch.zeros(num_outputs,device=device)
	
	param = [W_xh,W_hh,b_h,W_hq,b_q]
	for param in params:
		param.requires_grad_(True)
	return params
```
### RNN Model
```python
def init_rnn_state(batch_size,num_hiddens,device):
	return (torch.zeros((batch_size,num_hiddens),device=device),)
```
下面的rnn函数定义了如何让在1个时间步内计算隐状态和输出，循环神经网络模型通过inputs最外层的维度实现循环
```python
def rnn(inputs,state,params):
	W_xh,W_hh,b_h,W_hq,b_q=params
	H,=state
	outputs=[]
	for X in inputs:
		H = torch.tanh(torch.mm(X,W_xh)+torch.mm(H,W_hh)+b_h)
		Y = torch.mm(H,W_hq)+b_q
		outputs.append(Y)
	return torch.cat(outputs,dim=0),(H,)
```
```python
class RNNModelScrath:
	def __init__(self,vocab_size,num_hiddens,device,get_params,init_state,forward_fn):
	self.vocab_size,self.num_hiddens = vocab_size,num_hiddens
	self.params = get_params(vocab_size,num_hiddens,device)
	self.init_state,self.forward_fn = init_state,forward_fn
	
	def __call__(self,X,state):
		X = F.one_hot(X.T,self.vocab_size).type(torch.float32)
		return self.forward_fn(X,state,self.params)
	def begin_state(self,batch_size,device):
		return self.init_state(batch_size,self.num_hiddens,device)
```
```python
num_hiddens = 512
net = RNNModuleScratch(len(vocab),num_hiddens,d2l.try_gpu(),get_params,init_run_state,rnn)
state = net.begin_state(X.shape[0],d2l.try_gpu())
Y,new_state=net(X。to(d2l.try_gpu()),state)
Y.shape,len(new_state),new_state[0].shape
```
### 预测
prefix是一个用户提供的包含多个字符的字符串，循环遍历prefix中的开始字符时，不断的将隐状态传递到下一个时间步，但是不生成任何输出**称之为预热期**,在此状态期间模型会自我更新，但不会进行预测。
```python
def predict_ch8(prefix,num_preds,net,vocab,device):
	state = net.begin_state(batch_size=1,device=device)
	outputs = [vocab[prefix[0]]]
	get_inputs = lamba:torch.tensor([outputs[-1],device=device]).reshape((1,1))
	for y in prefix[1:]:
		_,state=net(get_input(),state)
		outputs.append(vocab[y])
	for _ in range(num_preds):
		y,state=net(get_input(),state)
		outputs.append(int(y.argmax(dim=1).reshape(1)))
	return ''.join([vocab.idx_to_token[i] for i in outputs])
```
```python
predict_ch8('time traveller',10,net,vocab,d2l.try_gpu())
```
### 梯度裁剪
对于长度较长的序列，在反向传播中会产生长度为$O(T)$的矩阵乘法链。当T较大时，可能会导致梯度爆炸或者梯度消失
一般的解决优化问题时，对模型采用更新步骤。
- 一般的梯度下降：
  $$
	x←x−ηg
	$$
提到Lipschitz连续:
$$
∣f(x)−f(y)∣≤L∥x−y∥
$$
**参数改变一点点，损失函数也不会毫无上线的乱跳**
有时候梯度很大，梯度下降一般的方法可能无法收敛，我们可以通过降低$n$的学习率来解决
但是当很少得到打的梯度时，一个流行的替代方案是通过将梯度$g$投影回给定半径的球来裁剪梯度$g$
$$
g←min(1,\frac{\theta}{∥g∥})g​
$$
这样一来，梯度范数永远不会超过$\theta$，且更新后的防线和$g$一致
下面定义函数来裁剪模型的梯度：
```python
def grad_clipping(net,theta):
	if isinstance(net,nn.Module):
		params = [p for p in net.parameters() if p.requires_grad]
	else:
		params = net.params
	norm = torch.sqrt(sum(torch.sum(p.grad**2)) for p in params)
	if norm > theta:
		for param in params:
			param.grad[:]*=theta/norm
```
### Train
特点:
- 序列数据的不同采样方式(随机采样和顺序分区)将导致隐状态初始化的差异
- 更新模型参数之前裁剪梯度->即使训练过程中某个点上发生了梯度爆炸，也能保证模型不会发散
- 用困惑度来评价模型，保证不同长度序列具有可比性
```python
def train_epoch_ch8(net,train_iter,loss,updater,devoce,use_random_iter):
	state,timer=None,d2l.Timer()
	metric = d2l.Accumulator(2)
	for X,Y in train_iter:
		if state is None or use_random_iter:
			#第一次迭代或者使用随机抽样时
			state=net.begin_state(batch_size=X.shape[0],device=dev ice)
		else:
			if isinstance(net,nn.Module)and noy isinstance(state,tuple):
				state.detach_()
			else:
				for s in state:
					s.detach_()
		y = Y.T.reshape(-1)
		X,y = X.to(device),y.to(device)
		y_hat,state=net(X,state)
		l = loss(y_hat,y.long()).mean()
		if isinstance(updater,torch.optim.Optimizer):
			updater.zero_grad()
			l.backward()
			grad_clipping(net,1)
			updater.step()
		else:
			l.backward()
			grad_clipping(net,1)
			updater(batch_size=1)
		metric.add(l*y.numel(),y.numel())
	return math.exp(metric[0]/metric[1]),metric[1]/timer.stop()
```
RNN的训练函数既支持从0开始，还可以使用高级api实现
```python
def train_ch8(net,train_iter,vocab,lr,num_epochs,device,use_random_iter=False):
	loss = nn.CrossEntropyLoss()
	animator=d2l.Animator(xlabel='epoch',ylabel='perplexity',legend=['train'],xlim=[10,num_epoches])
	if isinstance(net,nn.Module):
		updater = torch.optim.SGD(net.parameter()，lr)
	else:
		updator = lambda batch_size:d2l.sgd(net.params,lr,batch_size)
	perdict = lambda predix:predict_ch6(perfic,50,net,vocab,device)
	for epoch in range(num_epoches):
		ppl,speed=train_epoch_ch8(net,train_iter,loss,updater,device,use_random_iter)
		if(epoch+1)%10==0:
			print(predict('time travller'))
			animator.add(epoch+1,[ppl])
	print(f'困惑度{ppl:.1f},{speed:.1f}token/s {str{device}}')
	print(predict(‘timer traveller'))
	print(perdict(’traveller'))
```
```python
num_epoches,lr=500,1
train_ch8(net,train_iter,vocab,lr,num_epoches,d2l.try_gpu())
```
```python
net = RNNModelScratch(len(vocab),num_hiddens,d2l.try_gpu(),get_params,init_rnn_state,rnn)
train_ch8(net,train_iter,vocab,lr,num_epoches,d2l.try_gpu(),use_random_iter=True)
```

### Practice:
1. 尝试说明独热编码等价于为每个对象选择不同的嵌入表示。
    
2. 通过调整超参数（如迭代周期数、隐藏单元数、小批量数据的时间步数、学习率等）来改善困惑度。
    
    - 困惑度可以降到多少？
        
    - 用可学习的嵌入表示替换独热编码，是否会带来更好的表现？
        
    - 如果用H.G.Wells的其他书作为数据集时效果如何， 例如[世界大战](http://www.gutenberg.org/ebooks/36)？
        
3. 修改预测函数，例如使用采样，而不是选择最有可能的下一个字符。
    
    - 会发生什么？
        
    - 调整模型使之偏向更可能的输出，例如，当，从中采样。
        
4. 在不裁剪梯度的情况下运行本节中的代码会发生什么？
    
5. 更改顺序划分，使其不会从计算图中分离隐状态。运行时间会有变化吗？困惑度呢？
    
6. 用ReLU替换本节中使用的激活函数，并重复本节中的实验。我们还需要梯度裁剪吗？为什么