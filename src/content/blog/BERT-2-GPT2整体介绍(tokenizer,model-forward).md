---
title: GPT2整体介绍(tokenizer,model forward)
published: '2026-10-02'
description: ''
tags:
  - BERT
draft: false
---
```python
import torch
from torch import nn
import torch.nn.functional as F
import transformers
from transforemers import AutoTokenizer,AutoModel,AutoConfig
import numpy as np

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib as mpl
device = 'cuda' if torch.cuda.is_avilable() else 'cpu'
device
```
### summary
- transformer-based language model
	- 目前最核心的一个能力是: text generation,尤其对于gpt而言
- openai gpt2
- 预训练之后,被prompt(context)激活的广泛能力

#### pretrained model
- on English language
- casual language model(CLM) objective(多分类问题)
- Language Models are Unsupervised Multitask Learners

#### decoding strategies
- converting the model's probabilistic output to text
	- iteratively,意味着更多的计算量
	- qualirt&diverity
- greedy search decoding 搜狗输入法,每次都用top1的候选
- beam search decoding
- top-k& nucleus sampling
- (autoregressive or casual)language models
- $x=x_1,x_2,\cdots,x_n$
- $y=y_1,y_2,\cdots,y_n$
	- chain rule or probality to factorize it as a product of condictional probalitities
	- $$P(y|x)=P(y_1,y_2,\cdots,y_t|x)=\sum_{i=1}^Np(y_t|y_{<t},x)\,(y_{<t}=y_{1,2,\cdots,t-1})$$
	- 单向的,从左到右的,(BERT的B表示的含义就是bidirectional)
	- 具体的解码过程:
		$$p(y_t=w_i|y_{<i,x}=softmax(z_{t,i}))\,\hat y=argmax_{y}P(y|x)$$
### gpt2
```python
from transformer import AutoModelForCausalLM
from transformer_utils import get_params
```
```python
model_clpt = 'gpt-x1'
config = AutoConfig.from_pretrained(model_ckpt)
tokenizer = AutoTokenizer.from_pretrained(model_ckpt)
model = AutoModel.from_pretrained(model_ckpt)
# model clm==>AutoModelForCasualLM.from_pretrained(model_ckpt)
print(format(get_params(model),','))
```
#### tokenizer
```python
tokenizer
```
```python
print(tokenizer.special_tokens_map)
print(tokenozer.special_tokens_map_extended)

print(tokenizer.encode('<|endoftext|>'))
print(tokenizer.decode(50256))

print(tokenizer.encode(' '))
print(tokenizer.decode(220))

# 大小写敏感
print(tokenizer.encode('Hello'))
print(tokenizer.encode('hello'))
```
```python
tokenizer('My favorite color is charteuses')
```
```python
tokenizer.encode(' chartreuse')
```

#### attention_mask
- 更好的构造结构化,批次化输出（tensor,shape)是一定的
```python
from transformers import GPT2LMHeadModel,GPT2Tokenizer

tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
gpt2 = GPT2LMHeadModel.from_pretrained('gpt2')

context = tokenizer('It will rain in the',return_tensors='pt')
context
# prediction = gpt2.generate(**context,max_length=10)
# tokenizer.decode(prediction(0))
```
```python
# tokenizer.padding_size = 'left'
tokenizer.padding_size = 'right'
tokenizer.pad_token = tokenizer.eos_token

sentences = ["It will rain in the",
			"I want to eat a big bowl of",
			"My dog is"]
inputs = tokenizer(sentences,return_tensors='pt',padding=True)
print(inputs.input_ids)
print(inputs.attention_mask)
# output_sequences = gpt2.generate(**inputs)
# for seq in output_sequences:
#    print(tokenizer.decode(seq))
```
### forward
- GPT2Model
	- wte:word token embedding
	- wpe:word possion embedding
- LMHead
	- mlp:hidden_state=>vocab_size
```python
model_ckpt = 'gpt-x1'
config = AutoConfig.from_pretrained(model_ckpt)
tokenizer = AutoTokenizer.from_pretrained(model_ckpt)
model = AutoModel.from_pretrained(model_ckpt)
model_clm = AutoModelForCasualLM.from_pretrained(model_ckpt)
```
```python
# 大小写是不同的token
# 空格也是token
input_txt = "A long long time ago"
model_inputs = tokenier(input_txt,return_tensors='pt')
model_inputs
```
```python
input_ids = model_inputs['input_ids'].to(device)
```
```python
output = model_clm(input_ids=input_ids)
```
```python
output
```
#### model.transformer()
```python
model_clm.eval()
model_clm.transformer(input_ids).last_hidden_state
```
```python
model_clm
```
```python
input_ids.size()
```
```python
model_clm.config
```
#### 自定义(model.transformer)
```python
model.config
```
```python
def gpt2_transformer_forward(model,input_ids):
	model.eval()
	input_shape = input_ids.size()
	input_ids = input_ids.view(-1,input_shape[-1])
	batch_size = input_ids.shape[0]
	
	past_length = 0
	past_key_values = tuple([None]*len(model.h))
	position_ids = torch.arange(past_length,input_shape[-1]+past_length,dtype=torch.loong,device=device)
	position_ids = position_ids.unsqueeze(0).view(-1,input_shape[-1])
	
	encoder_attention_mask = None
	
	#embedding
	input_embed = model.wte(input_ids)
	position_embed = mdeol.wpe(input_ids)
	hidden_states = inputs_embed+position_embed
	hidden_states = model.drop(hidden_state)
	output_shape = input_shape+(hidden_states.size(-1),)
	
	head_mask = model.get_head_mask(None,model.config.n_layer)
	
	for i,(block,layer_past) in enumerate(zip(model.h,past_key_values)):
		outputs = block(
					hidden_states,
					layer_past = layer_past,
					head_mask = head_mask[i]
		)
		hidden_states = model.ln_f(hidden_states)
		hidden_states = hidden_states.view(output_shape)
		return hidden_states
```
```python
with torch.no_grad()：
	print(gpt2_transformer_forward(model_clm.transformer,input_ids))
	
```
#### 自定义lmhead_model(input_ids)
```python
def gpt2_clm_forward(model,input_ids):
	model.eval()
	transformer_output = model.transformer(input_ids)
	hidden_states = transformer_outputs[0]
	print(hidden_states)
	lm_logits = model.lm_head(hidden_states)
	print(lm_logits)
	return lm_logits
```
```python
gpt2_clm_forward(model_clm,input_ids)
```
