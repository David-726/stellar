---
title: "RNN简洁实现"
published: 2026-08-27
description: ""
tags: ["D2lNotes"]
draft: false
---
```python
import torch
from torch import nn
from torch.nn import functioanl as F
from d2l import torch as d2l

batch_size,num_steps=32,35
train_iter,vocab=d2l.load_data_time_machine(batch_size,num_steps)
```
### Definite The Model
```python
num_hiddens = 256
rnn_layer = nn.RNN(len(vocab),num_hiddens)
```
```python
state = torch.zeros((1,batch_size,num_hiddens))
state.shape
```
```python
X = torch.rand(size=(num_steps,batch_size,len(vocab)))
Y,state_new=rnn_layer(X,state)
Y.shape,state_new.shape
```
```python
class RNNModel(nn.Module):
	def __init__(self,rnn_layer,vocab_size,**kwargs):
		super(RNNModel,self).__init__(**kwargs)
		self.rnn=rnn_layer
		self.vocab_size=vocab_size
		self.num_hiddens=self.rnn.hidden_size
		if not self.rnn.bidirectional:
			self.num_directions=1
			self.linear=nn.Linear(self.num_hiddens,self.vocab_size)
		else:
			self.num_direction=	2
			self.linear=nn.Linear(self.num_hiddens*2,self.vocab_size)
	def forward(self,inputs,state):
		X=F.one_hot(inputs.T.long(),self.vocab_size)
		X=X.to(torch.float32)
		Y.state=self.nn(X,state)
		output = self.linear(Y.reshpe((-1,Y.shape[-1])))
		return output,state
	def begin_state(self,device,batch_size=1):
		if not isinstance(self.rnn,nn.LSTM)
			return torch.zeros((self.num_directions*self.rnn.num_layers,batch_size,self.num_hiddens),device=device)
		else:
return(torch.zeros((self.num_directions*self.rnn.num_layers,batch_size,self.num_hiddens),device=device),torch.zeros((self.num_directions*self.rnn.num_layers,batch_size,self.num_hiddens),device=device))
```
### Train And Predict
```python
device = d2l.try_gpu()
net = RNNModel(rnn_layer,vocab_size=len(vocab))
net = net.to(device)
d2l.predict_ch8('time travelller',10,net,vocab,device)
```
```python
num_epoches,lr=500,1
d2l.train_ch8(net,train_iter,vocab,lr,num_epochs,device)
```