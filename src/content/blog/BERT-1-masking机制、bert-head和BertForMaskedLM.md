---
title: masking机制、bert head和BertForMaskedLM
published: '2026-09-18'
description: ''
tags:
  - BERT
draft: false
---
```python
import torch
from torch import nn
from transformers.model.bert import BertModel,BertTokenizer,BertForMaskedLM
```
### model load and data preprocessing
```python
model_type = 'bert-base-uncased'
```
```python
tokenizer = BertTokenizer.from_pretained(model_type)
bert = BertModel.from_pretained(model_type)
mlm = BertForMaskedLM.from_pretained(model_type,output_hidden_states=True)
```
```python
text = ("After Abraham Lincoln won the November 1860 presidential "
        "election on an anti-slavery platform, an initial seven "
        "slave states declared their secession from the country "
        "to form the Confederacy. War broke out in April 1861 "
        "when secessionist forces attacked Fort Sumter in South "
        "Carolina, just over a month after Lincoln's "
        "inauguration.")
```
```python
text
```
```python
bert
```
```python
mlm
```
```python
inputs = tokenizer(text,return_tensors='pt')
```
```python
inputs
```
```python
inputs['input_ids'].shape
```
```python
' '.join(tokenizer.convert_ids_to_tokens(inputs['input_ids'][0]))
```
### masking
```python
inputs['labels']=inputs['input_ids'].detach().clone()
```
```python
inputs['labels']
```
```python
mask = torch.rand(inputs['input_ids'].shape)<0.15
```
```python
mask
```
```python
sum(mask[0])
```
```python
mask_arr = (torch.rand(inputs['input_ids'].shape)<0.15)\
		*(inputs['input_ids']!=101)\
		*(inputs['input_ids']!=102)
```
```python
mask_arr
```
```python
sum(mask_arr[0])
```
```python
selection = torch.flatten(mask_arr[0].nonzero().tolist())
```
```python
selection
```
```python
tokenizer.specical_tokens_map
```
```python
tokenizer.vocab['[MASK]']
```
```python
inputs['input_ids'][0,selection]=103
```
```python
inputs
```
```python
' '.join(tokenizer.convert_ids_to_tokens(inputs['input_ids'][0]))
```
```python
' '.join(tokenizer.convert_ids_to_tokens(inputs['labels'][0]))
```
### forward and calculate loss
```python
mlm.eval()
with torch.no_grad():
	output = mlm(**inputs)
```
```python
output.keys()
```
```python
output.logits
```
```python
output.loss
```
```python
type(output['hidden_states'])
```
```python
output['hidden_states'][-1]
```
### from scratch
```python
mlm.cls(output['hidden_states'][-1])
```
```python
output.logits
```
```python
last_hidden_state = output['hidden_states'][-1]
```
```python
last_hidden_state.shape
```
```python
mlm.eval()
with torch.no_grad():
	transformed = mlm.cls.predictions.transform(last_hidden_state)
	print(transformed.shape)
	logits = mlm.cls.prediction.decoder(transformed)
	print(logits.shape)
logits
```
### loss and translate
```python
ce = nn.CrossEntropyLoss()
```
```python
logits.shape
```
```python
inputs['label'].shape
```
```python
inputs['label'][0].view(-1).shape
```
```python
ce(logits[0],inputs['labels'][0].view(-1))
```
```python
torch.argmax(logits[0],dim=1)
```
```python
' '.join(tokenizer.convert_ids_to_tokens(torch.argmax[logits[0],dim=1]))
```
```python
' '.join(toeknizer.convet_ids_to_tokens(inputs['labels'][0])) 
```

