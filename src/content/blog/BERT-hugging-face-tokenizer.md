---
title: "hugging face tokenizer"
published: 2026-09-02
description: ""
tags: ["BERT", "HuggingFace"]
draft: false
---
- tokenizer,构造输入
	tokenizer需要和model相匹配,tokenizer的一系列output作为Model的输入
- tokenizer:服务于`model input`
	- len(input_ids)=len(attention_mask)
	- `tokenizer.encode == tokenizer.tokenize + tokenizer.convert_tokens_to_ids`
	- `tokenizer.decode`
	- tokenzier 工作原理: tokenizer.vocab：字典存储了 token ==> ids 的关系，包括了一些`special tokens_map`
	- attention mask 与 padding 相匹配
- Auto\*Tokenizer,Auto\*Model:General type
	使用这种auto tokenizer无需具体知道哪种分词器实现，只需要提供模型名称即可自动加载对应正确的配置
```python
test_sentences = ['today is not taht bad','today is so bad']
model_name = 'distilbert-base-uncased-finetuned-sst-2-english'
```
```python
from transformers import AutoTokenizer,AutoModelForSequenceClassification
```
```python
tokenizer = AutoTokenizer.from_pretrained(model_name)
#加载模型对应的网络架构(例如分类头)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
```
```python
inputs = tokenizer(test_sentences)
```
```python
batch_input = tokenizer(test_sentence,truncation=True,padding=True,return_tensors='pt')
```
```python
tokenizer(test_sentences[0])
tokenizer.encode(test_sentences[0])
```
```python
tokenizer.convert_tokens_to_ids(tokenizer.tokenize(test_sentences[0]))
```
```python
tokenizer.decode(...)
```
字典
```python
tokenizer.vocab
```
```python
tokenizer.vocab_size
```
```python
tokenizer.special_tokens_map.values()
tokenizer.convert_tokens_to_ids((special for special in tokenizer.specical_tokens_map.values()))
```
```python
batch_input=tokenizer(test_sentences,max_length=256,truncation=True,padding=True,return_tensors='pt')
```
- model,调模型
```python
import torch
import torch.nn.Functional as f
```
```python
model(**batch_input)
```
```python
model.config
```
```python
with torch.no_grad():
	output=model(**batch_input)
	print(outputs)
	scores = f.softmax(outputs.logits,dim=1)
	print(scores)
	labels = torch.argmax(scores,dim=1)
	labels = [model.config.id2label for id in labels.tolist()]
	print(labels)
```


