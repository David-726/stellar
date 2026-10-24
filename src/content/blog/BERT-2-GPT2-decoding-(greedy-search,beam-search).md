---
title: GPT2 decoding (greedy search,beam search)
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
from transformers import AutoTokenizer,AutoModel,AutoConfig

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib as mpl

device = 'cuda' if torch.cuda.is_available() else 'cpu'
```
### summary
- converting the model's probabilistic output (vocab size classificition) to text
	- iteratively,意味着更多的计算量
	- quality&diversity
- greedy search decoding
- beam search decoding
- sampling methos
- decoding的场景:
	- 文本生成
		- seq2seq
		- image caption:image2text
- (autoregressive or casual)language models
- $x=x_1,x_2,\cdots,x_n\,y=y_1,y_2,\cdots,y_n$
	- chain rule of probability to factorize it as a product of conditional probalities
		$$P(y|x)=P(y_1,y_2,\cdots,y_t|x)=\prod_{t=1}^{N}p(y_i|y_{<t},x)$$
		$$log\,P(y|x)=log\,P(y_1,y_2,\cdots,y_t|x)=log\,\prod_{t=1}^Np(y_i|y_{<t},x)=\sum_{i=1}^{N}\,logp(y_i|y_{<t},x)$$
- 单向的,从左到右的,BERT的B表示的是bhidirectional
- 具体的decode过程:
	$$p(y_i=w_i|y_{<i},x)=softmax(z_{j,i})$$
	$$\hat y =argmax_{y}P(y|x)$$
	### decoding
	- greedy search decoding:重复性较高,diversity不足,整体未必是最优解
	- beam search decoding:
		$$\hat y_i=argmax_{y_i}\,P(y_t|y_{<t},x)$$
```python
from transformers import AutoModelForCausalLM
```
```python
model_ckpt = 'gpt-x1'
tokenizer = AutoTokenizer.from_pretrained(model_ckpt)
model = AutoModelForCasualLM.from_pretrained(model_ckpt).to(device)
```
```python
sample_text = "A long long time ago"
```
```python
model_inputs = tokenizer(sample_text,return_tensors='pt')
model_inputs
```
#### greedy search
```python
input_ids = model_input['input_ids'].to(device)
print(input_ids.shape)
input_ids
```
```python
sorted_ids = torch.argsort(torch.softmax(model(input_ids).logits[0,-1,:],dim-1),decending=True)

sorted_ids[None,0,None].shape
```
```python
n_steps = 10
choices_per_step = 5

iterations = []
with torch.no_grad():
	# iteratively
	for _ in range(n_steps):
		iteratiosn={}
		iteration['input']=tokenizer.decode(input_ids[0])
		
		output = model(input_ids=input_ids)
		# output.logits.shape = [1,7,50257]
		# last_token_logits.shape == [50257]
		last_token_logits = output.logits[0,-1,:]
		last_token_probs = torch.softmax(last_token_logits,dim=-1)
		sorted_ids = torch.argmax(last_token_probs,idm=-1,descending=True)
		
		for choice_idx in range(choices_per_step):
			token_id = sorted_ids[choice_idx]
			token_prob = last_token_probs[token_id].cpu().numpy()
			sorted_ids = torch.argsort(last_token_probe,dim=-1,descending=True)
		
		# append
		print('before append input_ids.shape',input_ids.shape)
		input_ids = torch.cat([input_ids,sorted_ids[None,0,None]],dim=-1)
		print('after append input_ids.shape',input_ids.shape)
		
		iterations.append(iteration)
```
```python
import pandas as pd
```
```python
pd.DataFrame(iteration)
```
```python
iterations[-1]
```
```python
def greedy_search(model,input_ids,max_steps=10,max_choices=1):
	iterations=[]
	input_ids_clone=input_ids.clone()
	with torch.no_grad():
		for _ in range(max_steps):
			iterations={}
			iteratiosn['input']=tokenizer.decode(input_ids_clone[0])
			output = model(input_ids=input_ids_clone)
			
			last_token_logits =  output.logits[0,-1,:]
			last_token_probs = torch.softmax(last_token_logits,dim=-1)
			sorted_ids = torch.argsort(last_token_probs,dim=-1,descending=True)
			
			for choice_idx in range(max_choices):
				token_id = sorted_ids[choice_idx]
				token_prob = last_token_probs[token_idx].cpu.numpy()
				token_choice = f'{tokenizer.decode(token_id)}({100*token_prob:.2f}%)'
				iteration[f'choice{choice_idx+1}']=token_choice
				
		
			# append
			print('before append input_ids.shape',input_ids.shape)
			input_ids = torch.cat([input_ids,sorted_ids[None,0,None]],dim=-1)
			print('after append input_ids.shape',input_ids.shape)
			
			iterations.append(iteration)
		return iterations
```
```python
pd.DataFrame(greedy_search(model),input_ids)
```
#### model.generate()
- `model.generate()`
	- 默认greedy search,`num_beams`不设置的话
	- `do_samples=False`
	- `max_length`:prompt_generation的总长度
	- `max_new_tokens`:generation的长度
```python
input_ids = tokenizer(sample_text,return_tensors='pt').input_ids.to(device)
input_ids
```
```python
output = model.generate(input_ids,max_new_tokens=n_steps,do_sample=False)
```
```python
tokenizer.decode(output[0])
```
```python
prompt = "In a shocking finding,scientist discovered a herd of unicorns living in a remote,previously unexplored valid "
input_ids = tokenizer(prompt,return_tensors='pt').input_ids.to(device)
input_ids
```
```python
# greedy search
gen_1 = greedy_search(model,input_ids,128-input_ids[0].size(-1),)
```
```python
print(gen_1[-1]['input'])
print(len(tokenizer(gen_1[-1]['input']).input_ids))
```
```python
output_greedy = model.generate(input_ids,max_length=128,do_sample=False)

print(output_greedy.shape)
print(tokenizer.decode(output_greedy[0]))
```

#### math(追求的是精确而不是多样性)
```python
math_ids = tokenizer('5 + 8 => 13 \n 7 + 2 => 9 \n 1 + 5 =>',return_tensors='pt').input_ids.to(device)
tokenizer.decode(model.generate(math_ids,max_new_tokens=2,do_sample=False))
```
### beam search decoding
- `model.generate()`
	- 默认 greedy search,`num_beams`不设置的话
	- `do_samples=False`
	- `max_length`:prompt+generation的总长度
	- `max_new_tokens`:generation的长度
	- 对于beam search
		- num_beams=5
	- 控制重复性:`no_repeat_ngram_size`
		- tracks which n-grams have been seen and sets tne next token probaility to zero if it would produce a preciously seen n-gram:
			$$log\,P(y|x)=log\,P(y_1,y_2,\cdots,y_t|x)=log\,\prod_{t=1}^N\,p(y_t|y_{<t},x)$$
```python
0.5**1024
```
```python
1024*torch.log(torch.tensor(0.5))
```
```python
def log_probs_from_logits(logits,labels):
	logp = F.log_softmax(logits,dim=-1)
	logp_label = torch.gather(logp,2,labels.unsqueeze(2),sequeeze(-1))
	return logp_label
def sequence_logprob(model,labels,prompt_len=0):
	with torch.no_grad():
		output =  mdoel(labels)
		log_probs = log_porbs_from_logits(outputs.logits[:,:-1,:],labels[:,1:])
		seq_log_prob = torch.sum(log_probs[:,prompt_len:])
	return seq_log_prob.cpu().numpy()
```
```python
logp = sequence_log_prob(model,output_greedy,prompt_len=len(input_ids[0]))
print(tokenizer.decode(output_greedy[0]))
logp
```
```python
outputs_beam = model.generate(input_ids,max_length=128,num_bemas=5,do_sample=False)
logp = sequence_logprob(model,output_beam,prompt_len=len(input_ids[0]))
print(tokenizer.decode(output_beam[0]))
logp
```
```python
print(len(input_ids[0]))
print(output_greedy.shape)
```
```python
output_beam = model.generate(input_ids,max_length=128,num_beams=5,do_sample=False,no_repeat_ngram_size=2)
logp = sequence_logprib(model,output_beam,prompt_len=len(input_ids[0]))
```
