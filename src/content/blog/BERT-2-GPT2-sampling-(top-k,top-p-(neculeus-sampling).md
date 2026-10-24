---
title: GPT2 sampling (top-k,top-p (neculeus sampling)
published: '2026-10-03'
description: ''
tags:
  - BERT
draft: false
---
```python
import torch
from torch import nn
import torch.nn.functiosnal as F
import transformers
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib as mpl

device = 'cuda' if torch.cuda_is_aviable() else 'cpu'
```
```python
from transformers import AutoModelForCasual
model_ckpy = 'gpt2-x1'
tokenizer = AutoTokenizer.from_pretrained(model_ckpt)
mdoel = AutoModelForCasualLM.from_pretrained(model_ckpt)
```
### summary
$$P(y_t=w_i|y_{<t},x)=softmax(z_{t,i})=\frac{exp(z_{t,i})}{\sum_{j=1}^{|V|}exp(z_{t,j})}$$
- 对于概率化的输出进行sample,就出现了随机性(`do_sample=True`)
	- greedy search 是没有随机性的,是确定性的
### sample methods
#### softmax with temperature
$$
P(y_t=w_i|y_{<t},x)=softmax(z_{t,i})=\frac{exp(z_{t,i})/T}{\sum_{j=1}^{|V|}exp(z_{t,j}/T)}
$$

$$
P(y_t=w_i|y_{<t},x)=softmax(z_{t,i})=\frac{exp(z_{t,i})}{\sum_{j=1}^{|V|}exp(z_{t,j})}
$$
- Distilling the Knowledge in a Netual NetWork
	- Using a Higher value for T produces a softer probablity distribution over classes
- 温度越高,分布越平滑,雨露均沾
```python
print(np.exp(6))

print(np.exp(3))
print(np.exp(6)/(np.exp(6)+np.exp(3)),np.exp(3)/(np.exp(6)+np.exp(3)))

print()

print(np.exp(6/1.5))
print(np.exp(3/1.5))
print(np.exp(6/1.5)/(np.exp(6/1.5)+np.exp(3/1.5)),np.exp(3/1.5)/(np.exp(6/1.5)+np.exp(3/1.5)))
```
```python
def softmax_with_t(x,T=1):
	return np.exp(x/T)/sum(np.exp(x/T))
```
```python
plt.figure(figsize=(6,3))
logits = np.asarray([1,5,7,10])
Ts = [0.1,1,10,100,10000]
for T in Ts:
	plt.plot(softmax_with_t(logits,T),'-o')
plt.legend(['T=0.1','T=1','T=10','T=100','T=1000'])
```
#### model.generate
- `do_sample=True`
- 温度越高,gibberish,raw token依旧会被采样到
- 温度越低,coherent(连贯有条理)
	- less weird
	- temperatures->0,temperature scaled sampling becomes equal to greedy decoding
- coherence(low temperature)&diversity(high temperature):trade off
```python
prompt = 'In a shocking finding, scientist discovered a herd of unicorns living in a remote, previously unexplored valley, in the Andes Mountains. Even more surprising to the researchers was the fact that the unicorns spoke perfect English.'

input_ids = tokenizer(prompt,return_tensors='pt').input_ids
input_ids
```
```python
output_t = model.generate(input_ids,max_length=128,do_sample=True,temperature = 0.5,top_k=0)
tokenizer.decode(output_t[0])
```
```python
output_t = model.generate(input_ids,max_length=128,do_sample=True,temperature = 1.,top_k=0)
tokenizer.decode(output_t[0])
```
```python
output_t = model.generate(input_ids,max_length=128,do_sample=True,temperature = 2.,top_k=0)
tokenizer.decode(output_t[0])
```
### top-k&nucleus sampling(top-p)
- 平衡coherent&diversity的另外一种方式,truncate the distribution of the vocabulary
- top-k 和 nucleus sampling:限制了采样的范围(tokens):
	- top-k:1个刚性的限制
		- 避免低概率的选择
		- top_k == 0,deactive top_k,不对候选tokens的数量进行限制
		- nucleous sampling(top-p):核采样(是一个动态的,取决于概率分布的情况,例如说:如果token的概率分布越均匀,候选的token就会越多,若概率分布太偏袒,则候选的token就会相对的变少)
	- refer:
		- <https://huggingface.co/blog/how-to-generate>
```python
output_topk = model.generate(input_ids,max_length=128,do_sampling=True,top_k=50)
print(tokenizer.decode(output_topk[0]))
```
```python
output_topk = model.generate(input_ids,max_length=128,do_sampling=True,top_p=0.90)
print(tokenizer.decode(output_topk[0]))
```
```python
```