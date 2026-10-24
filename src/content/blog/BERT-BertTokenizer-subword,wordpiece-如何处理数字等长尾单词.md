---
title: "BertTokenizer subword,wordpiece 如何处理数字等长尾单词"
published: 2026-09-03
description: ""
tags: ["BERT"]
draft: false
---
```python
s1 = 'albums sold 26739812837 copies'
s2 = 'technically perfect,melodically correct'
s3 = 'featuring a previously unheard track'
s4 = 'best-selling music atrist'
s5 = 's1 d2 o1 and o2'
s6 = 'asbofwheohwsahi'
```
### 实例化tokenizer
```python
from transformer import BertTokenizer
```
```python
model_name='bert-base-uncased'
tokenizer = BertTokenizer.from_pretained(model_name)
```
### vocab
- `tokenizer.vocab vs tokenizer.ids_to_tokens`
- `len(tokenizer.vocab) == 30522`
```python
tokenizer.vocab
tokenizer.ids_to_tokens
```
```python
len(tokenizer.vocab)
```
```python
tokenizer.vocab['[UNK]']
```
```python
tokenizer.tokenize('bestselling')
```
```python
for token,id in tokenizer.vocab.items():
	if token.startswith('##'):
		print(token)
		cnt_sharp+=1
print(cnt_sharp)
```
### 样本子词测试
```python
inputs = tokenzer(s1)
print(inputs)
print(tokenizer.convert_ids_to_token(inputs['input_ids']))
```
```python
tokenizer.decode(inputs['input_ids'])
```
### summary
- tokenizer 轻易不会吧一个词处理为'`[UNK](100)`'
- 基于词汇表,tokenizer,encode,decode一体
	- tokenizer:word==>token(s),将word尽可能的映射为vocab中的keys
	- encode:token==>id
	- decode:id==>token==>word
		- encode完了之后不是终点(word),decode还要能很好的将id还原，尽可能的与输入的word对齐
