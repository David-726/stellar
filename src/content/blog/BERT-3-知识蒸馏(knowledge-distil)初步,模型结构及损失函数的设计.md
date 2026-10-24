---
title: 知识蒸馏(knowledge distil)初步,模型结构及损失函数的设计
published: '2026-10-04'
description: ''
tags:
  - BERT
draft: false
---




<img src="/posts/assets/f41f4e7d6891c6ec-Pasted-image-20261004103740.png" alt="Pasted image 20261004103740.png" loading="lazy" />



### basics
- 为什么要学习KD
	- 必要:
		- GPT时代
		- 业务所需:
	- 模型结构(分支)和损失函数的设计,值得借鉴
- openai GPT一骑绝尘的时代,GPT4就是老师
- Teacher-Student paradigm
	- 在训练中将teacher的知识蒸馏/transfer到student model中:
		- 对于student model而言,就是Mimic(模仿)的过程
		- teacher:larger,slower,better-performing
		- student:smaller,faster,cheaper and lighter
- 2006年提出之后,在ensemble models(集成模型)的语境下提出来的
	- 2015年,引入到深度学习
- 本节的重点是知识蒸馏的**模型架构**(loss Function)及**Pipeline**
### 理论初步
- 理论方向:
	- Student model学的不是一个single value(one-hot representation),而是teacher model预测的概率的分布(dense feature representation)
	- 关于多分类问题的输出:
		- ground truth:hard target,one-hot encoding
		- Teacher predict output:softmax(T=1)
			- soften probablities(T>1)
- 假如对于一个有监督的分类问题,对于样本$x$
	- 对于Teacher model,其output(logits)为$z(x)=[z_1(x),z_2(x),\cdots,z_N(x)]$
		- 将其进一步通过softmax(with temperature)转化为概率化的输出:
			$$p_i(x)=\frac{exp(\frac{z_i(x)}{T})}{\sum_j\,exp(\frac{z_j(x)}{T})}$$
	- 对于student model,其预测的概率分布为$q_i(x)$
	- 此时使用KL-divergence(KL-散度)来度量2个概率分布的距离
			$$D_{KL}(p,q)=\sum_{i}p_i(x)log\,\frac{p_i(x)}{q_i(x)}$$ $$L_{KD}=T^{2}D_{KL}$$
	- 通过KL散度,也度量了当Student model(用$q_i(x)$)来逼近/近似 Teacher model(用$p_i(x$))的信息损失;
		$$L_{student}=\alpha\,L_{CE}+(1-\alpha)L_{KD}=\alpha\,L_{CE}+(1-\alpha)T^2D_{KL}$$
### 模型结构




<img src="/posts/assets/f41f4e7d6891c6ec-Pasted-image-20261004103838.png" alt="Pasted image 20261004103838.png" loading="lazy" />





### kd on pretraining
- BERT开启了一个范式:pretraining+downstream tasks
- 同样的对pretraining model(比如BERT)进行distil得到DistilBert
	- https://arxiv.org/abs/1910.01108（DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter
        - https://medium.com/huggingface/distilbert-8cf3380435b5
 - $L_(cos)=1-cos(h_s,h_i)$不只是对其输出,还对齐(align)direction of hidden state vectors (representation space)
	 $$L_{distil-bert}=\alpha L_{mlm}+\beta L_{KD}+\gamma\,L_{cos}=\alpha L_{mlm}+\beta L_{KD}+\gamma(1-cos(h_s,h_t))$$
```python
from transformer import AutoModel,AutoTokenizer
```
```python
import os
os.environ['HTTP_PROXY']='http://127.0.0.1:7890'
os.environ['HTTPS_PROXY']='https://127.0.0.1:7890‘
```
```python
model = AutoModel.from_pretrained('bert-base-uncased')
kd_model = AutoModel.from_pretrained('distilebert-base-uncased')
```
```python
model
```
```python
def model_size(model):
	return sum(para.num() for para in model.parameters())
```
```python
print(model_size(model))
print(model_size(kd_model))
print(model_size(model)/model_size(kd_model))
```
