---
title: "Encoder-Decoder 架构"
published: 2026-08-30
description: ""
tags: ["D2lNotes"]
draft: false
---
机翻的输入和输出都是长度可变的序列。为了处理这种类型的输入和输出，我们可以设计一个包含2个主要组件的架构:第一个组件时一个encoder：将一个长度可变的序列作为输入转换为具有固定形状的序列,第二个组件是decoder:将固定长度的编码状态映射到长度可变的序列,称之为**encoder-decoder**架构
### Encoder
```python
from torch import nn
class Encoder(nn.Module):
	def __init__(self,**kwargs):
		super(Encoder,self).__init__(**kwargs)
	def forward(self,X,*args):
		raise NotImplementedError
```
### Decoder
```python
class Decoder(nn.Module):
	def __init__(self,**kwargs):
		super(Decoder,self).__init__(**kwargs)
	def init_state(self,enc_outputs,*args):
		raise NotImplementedError
	def forward(self,X,state):
		raise NotImplementedError
```
### 合并编码器和解码器
```python
class EncoderDecoder(nn.Module):
	def __init__(self,encoder,decoder,**kwargs):
		super(EncoderDecoder,self).__init__（**kwargs)
		self.encoder=encoder
		self.decoder=decoder
	def forward(self,enc_X,dec_X,*args):
		enc_outputs = self.encoder(enc_X,*args)
		dec_state = self.decoder.init_state(enc_outputs,*args)
		return self.decoder(dec_X,dec_state)
```
### Practice:
1. 假设我们使用神经网络来实现“编码器－解码器”架构，那么编码器和解码器必须是同一类型的神经网络吗？
    
2. 除了机器翻译，还有其它可以适用于”编码器－解码器“架构的应用吗？