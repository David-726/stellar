---
title: "LSTM"
published: 2026-08-29
description: ""
tags: ["D2lNotes"]
draft: false
---
### LSTM
<img src="/posts/assets/7p6etz-lstm-3.svg" alt="lstm-3.svg" loading="lazy" />
ForgettenGate、InputGate、OutputGate
上方时Long-TermMemory、下方是Short-TermMemory
多看几遍理解一下
### 从0开始实现
```python
import torch
from torch import nn
from d2l import torch as d2l
```
```python
def get_lstm_param(vocab_size,num_hiddens,device):
	num_inputs = num_outputs = vocab_size
	def normal(shape):
		return torch.randn(size=shape,device=device)*0.01
	def three():
		return (normal((num_inputs,num_hiddens)),
				normal((num_hiddens,num_hiddens)),
				torch.zeros(num_hiddens,device=device))
	W_xi,W_hi,b_i = three() #inputgate
	W_xf,W_hf,b_f = three() #forgettengate
	W_xo,W_ho,b_o = three() #outputgate
	W_xc,W_hc,b_c = three() #候选记忆元参数
	
	W_hq = normal((num_hiddens,num_outputs))
	b_q = torch.zeros(num_outputs,device=device)
	
	params = [W_xi,W_hi,b_i,W_xf,W_hf,b_f,W_xo,W_ho,b_o,W_xc,W_hc,b_c,W_hq,b_q]
	for param in params:
		param.requires_grad_(True)
	return params
```
### DefineTheModel
```python
def init_lstm_state(batch_size,num_hiddens,device):
	return (torch.zeros((batch_size,num_hiddens),device=device),
 torch.zeros((batch_size,num_hiddens),device=device))
```
```python
def lstm(inputs,state,param):
	[W_xi,W_hi,b_i,W_xf,W_hf,b_f,W_xo,W_ho,b_o,W_xc,W_hc,b_c,W_hq,b_q]=params
	(H,C)=state
	outputs=[]
	for X in inputs:
		I = torch.sigmoid((X@W_xi)+(H@W_hi)+b_i)
		F = torch.sigmoid((X@W_xf)+(H@W_hf)+b_f)
		O = torch.sigmoid((X@W_xo)+(H@W_ho)+b_o)
		C_tilda = torch.tanh((X@W_xc)+(H@W_hc)+b_c)
		C = F*C+I*C_tilda
		H = O*torch.tanh(C)
		Y = (H@W_hq)+b_q
		outputs.append(Y)
		
	return torch.cat(outputs,dim=0),(H,C)
```
### Train And Predict
```python
vocab_size,num_hiddens,device = len(vocab),256,d2l.try_gpu()
num_epochs,lr=500,1
model = d2l.RNNModelScratch(len(vocab),num_hiddens,device,get_lstm_params,init_lstm_state,lstm)
d2l.train_ch8(model,train_iter,vocab,lr,num_epochs,device)
```

### 简介实现
```python
num_inputs = vocab_size
lstm_layer = nn.LSTM(num_inputs,num_hiddens)
model = d2l.RNNModel(lstm_layer,len(vocab))
model = model.to(device)
d2l.train_ch8(model,train_iter,vocab,lr,num_epochs,device)
```

### Practice:
1. 调整和分析超参数对运行时间、困惑度和输出顺序的影响。
    
2. 如何更改模型以生成适当的单词，而不是字符序列？
    
3. 在给定隐藏层维度的情况下，比较门控循环单元、长短期记忆网络和常规循环神经网络的计算成本。要特别注意训练和推断成本。
    
4. 既然候选记忆元通过使用函数来确保值范围在之间，那么为什么隐状态需要再次使用函数来确保输出值范围在之间呢？
    
5. 实现一个能够基于时间序列进行预测而不是基于字符序列进行预测的长短期记忆网络模型。