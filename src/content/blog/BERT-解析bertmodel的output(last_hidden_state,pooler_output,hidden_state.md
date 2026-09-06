---
title: "解析bertmodel的output(last_hidden_state,pooler_output,hidden_state"
published: 2026-09-03
description: ""
tags: ["BERT"]
draft: false
---
### input
```python
text = 'After stealing money from the bank vault,the bank robber was seen'\
	"fishing on the Mississippi river bank"
```
```python
token_input = tokenizer(text,return_tensors='pt')
```
```python
token_input
```
```python
token_input['input_ids'],token_input['input_ids'].shape
```
### model forward
- forward
	- embedding->encoder->pooler
```python
model.eval()
with torch.no_grad():
	outputs = model(**token_input)
```
### output
- len(outputs)==3
- outputs[0]
	- last_hidden_state,shape:batch_size\*seq_len\*hidden_size(1\*768)
- outputs[1]
	- pooler_output,shape:batch_size\*hidden_size(1\*768)
	- Last layer hidden-state of the first token of the sequence (classification token,[CLS])
- outputs\[2](model.config.output_hidden_states=True)
	- type:tuple
	- one for the output of the embedding(1),if the model has an embedding layer(12),+one for the ouput of each layer
		- (1+12)\*(batch_size\*sqe_len\*hidden_size)=13\*1\*22\*768
	- outputs\[0]\==outputs\[2]\[-1]
	- outputs\[1]\==model.pooler(outputs\[2]\[-1])
	- outputs\[2]\[0]=model.embeddings(token_input['input_ids'],token_input['token_type_ids]
```python
type(outputs)
```
```python
outputs[0]
```
```python
outputs[1]
```
```python
outputs[2][-1]
```

```python
outputs[1]
```
```python
model.pooler(outputs[2][-1])
```
```python
outputs[2][0]
```
```python
model.embedding(token_input['input_ids'],token_input['token_type_ids'])
```
