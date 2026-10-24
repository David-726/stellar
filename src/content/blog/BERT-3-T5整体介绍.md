---
title: T5整体介绍
published: '2026-10-03'
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
from transformers_utils import get_params
from transformers import pipeline
from transformers import AutoTokenizer,AutoConfig,AutoModel

from datasets import load_dataset
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib as mpl

device = 'cuda' if torch.cuda.is_available() else 'cpu'
```
### summary
- t5:Text-to-text Transfer Transformer
	- <https://ai.googleblog.com/2020/02/exploring-transfer-learning-with-t5.html>
- CoLA:Linguistic Acceptablity
	- Corpus of Linguistic Acceptablity
- STSB:Sernantic Textual Similarity BenchMark
### T5 model
```python
from transformers import T5ForConditionalGeneration
```
```python
model_ckpt = 't5-3b'
model = AutoModel.from_pretrained(model_ckpt,)
tokenizer = AutoTokenizer.from_pretrained(model_ckpt)
config = AUtoConfig.from_pretrained(model_ckpt)
config
```
```python
format(get_params(model),' ')
```
```python
input_ids = tokenizer.encode('translate English to German:Hello,my dog is cute',return_tensors='pt')
result = t5.generate(input_ids)
tokenizer.decode(result[0])
```
### forward
```python
input_ids = tokenizer("studies have been shown that owning a dog is good for you",return_tensors='pt').input_ids
```
```python
input_ids
```
```python
decoder_input_ids = tokenizer("Studies show that",return_tensors='pt').input_ids

# preprocess:Prepend decoder_input_ids with start token which is pad token for T5model
# This is not needed for torch's T5ForconditionalGeneration as it does this iternally using labels arg.
decoder_input_ids = model._shift_right(decoder_input_ids)
```
```python
model.eval()
# forward pass
outputs = model(input_ids=input_ids,decoder_input_ids=decoder_input_ids)
last_hidden_state = outputs.last_hidden_state
last_hidden_state
```
```python
def t5_forward(model,input_ids,decoder_input_ids):
	encoder_outputs = model.encoder(input_ids=input_ids)
	hidden_states = encoder_outputs[0]
	decoder_ouputs = model.decoder(input_ids=decoder_input_ids,
			  encoder_hidden_state=hidden_state)
	return decoder_outputs.last_hidden_state
```
### 预训练任务
- Unsupervised denoising training
	- MLM
	- span mask
- Superivised training
	- seq2seq
```python
from transformers import T5ForConditionalGeneration
model = T5forConditinalGeneration.from_pretrained(model_ckpt)
```
```python
model
```
```python
# Unsupervised dencising training
# mlm
input_ids = tokenizer("The <extra_id_0> walks in <extra_id_l> park",return_tensors='pt')
labels = tokenizer("<extra_id_0> cute dog <extra_id_i> the <extra_id_2>",return_tensors='pt')

# the forward function automatically creates the correct decoder_input_ids
loss = model(input_ids=input_ids,labels=labels).loss
loss.item() 
```
### 预训练任务
- Unsupervised denoising training
	- MLM
	- span Mask
- Supervised training
	- Seq2Seq
```python
from transformers import T5ForConditionalGeneration
model = T5ForConditionalGeneration.from_pretrained(model_ckpt)
```
```python
model
```
```python
# Unsupervised dencising training
# mlm
input_ids = tokenizer("The <extra_id_0> walks in <extra_id_l> park",return_tensors='pt')
labels = tokenizer("<extra_id_0> cute dog <extra_id_i> the <extra_id_2>",return_tensors='pt')

# the forward function automatically creates the correct decoder_input_ids
loss = model(input_ids=input_ids,labels=labels).loss
loss.item()
```
```python
# Supervised training
# seq2seq

input_ids = tokenizer("translate English to German:The house is wonderful.",return_tensors='pt')
labels = tokenizer("Das Haus ist wonderbar",return_tensors='pt').input_ids

# the forward function automatically creates the correct decoder_input_ids
loss = model(input_ids=input_ids,labels=labels).loss
loss.item()
```
#### multi sentence pairs
```python
# the following 2 hyperparameters are task-specific
max_source_length = 512
max_target_length = 128

# Suppose we have the following 2 training examples:
input_sequence_1 = "Welcome to NYC"
output_sequence_1 = "Bienvenue a NYC"

input_sequence_2 = "HuggingFace is a company"
output_sequence_2 = "HuggingFace est une entreprise"

# encoder the inputs
task_prefix = "translate English to French:"
input_sequence = [input_sequence_1,input_sequence_2]

encoding = tokenizer
```