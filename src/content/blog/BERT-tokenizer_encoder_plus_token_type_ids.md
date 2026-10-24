---
title: "tokenizer_encoder_plus_token_type_ids"
published: 2026-09-02
description: ""
tags: ["BERT"]
draft: false
---
### 加载模型
```python
from transformers import BertTokenizer
```
```python
model_names = 'bert-base-uncased'
```
```python
tokenizer = BertTokenizer.from_pretrained(model_name)
```
```python
tokenizer
```
```python
tokenizer.special_tokens_map
```
```python
special_tokens = list(tokenizer.special_tokens_map.values())
```
```python
specical_tokens
```
```python
tokenizer.convert_tokens_to_ids(special_tokens)
```
```python
tokenizer.encode(special_tokens)
```
```python
tokenizer.decode(...)
```
### 认识文本语料
	获得语料信息
- newsgroups_train.DESCR
- newsgroups_train.data
- newsgroups_train.target
- newsgroups_train.target_names
```python
from sklearn.datasets import fetch_20newsgroups
```
```python
newsgroups_train = fetch_20newsgroups(subset='train')
```
```python
newsgroups_train.DESCR
```
```python
from collections import Counter
```
```python
Counter(newsgroups_train.target)
```
```python
newsgroups_train.target_names
```
### tokenizer补充
- input_ids,attention_masks
- encode_plus,token_type_ids
- token_type_ids --> 表示第一句:1;表示第2句:0
- 句子对，一般用在nsp(next sentence predict)级别的，bert训练的1个预训练任务
```python
test_news = newsgroups_train.data[:3]
```
```python
len(test_news[2])
```
`truncation`截断
```python
#single sentence级别
tokenizer(test_news,truncation=True,max_lengths=32)
```
```python
#sentence pair级别的
tokenizer.encode_plus(text=text_news[0],text_pair=text_news[1])
```
```python
tokenizer.decode
```