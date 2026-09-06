---
title: "文本预处理"
published: 2026-08-25
description: ""
tags: ["D2lNotes"]
draft: false
---
### 读取数据集
```python
d2l.DATA_HUB['time_machine']=(d2l.DATA_URL+'timemachine.txt','090b5e7e70c295757f55df93cb0a180b9691891a')
def read_time_machine():
	with open(d2l.downlaod('time_machine'),'r')as f:
		lines=f.readlines()
	return [re.sub('[^A-Za-z]+',' ',line).strip().lower() for line in lines]
lines = read_time_machine()
print(f'#文本行数:{len(lines)}')
print(lines[0])
print(lines[10])
```
### Tokenizer
将文本的lines作为输入，列表中的每一个元素是一个文本序列
每个文本序列又被拆分成一个token列表，token是文本的基本单位
```python
def tokenize(lines,token='word'):
	if token == 'word':
		return [line.split() for line in lines]
	elif token == 'char':
		return [list(line) for line in lines]
	else:
		print('Error:UnKnown Token'+token)

token = tokenize(lines)
for i in range(11):
	print(tokens[i])
```
### 词表
构建一个字典，叫做词表，将`string`类型的`token`映射到从0开始的数字索引中。先将训练集中的所有文档合并在一起，对它们的唯一词元进行统计，得到的统计结果称之为**语料**(corpus),然后根据这个唯一词元出现的频率分配一个数字索引

```python
class Vacab:
	def __init__(self,tokens=None,min_freq=0,reserved_tokens=None)
	if tokens is None:
		tokens=[]
	if reserved_tokens is None:
		reserved_tokens=[]
	# 按出现频率排序
	counter = count_corpus(tokens)
	self.__token_freqs=sorted(counter.items(),key=lamba x:x[1],reverse=True)
	self.token_to_idex={token:idx for idx,tokrn in enumerate(self,idx_to_token)}
	for token,freq in self.__token_freqs:
		if freq<min_freq
			break
		if token not in self.token_to_idx:
			self.idx_to_token.append(token)
			self.token_to_idx[token]=len(self.idx_to_token)-1
def __le`Zn__(self):
	return len(self.idx_to_token)
def __getitem__(self,tokens):
	if not isinstance(tokens,(list,tuple)):
		return self.token_to_idx.get(tokens,self.unk)
	return [self.__getitem__(token) for token in tokens]
def to_tokens(self,indices):
	if not isinsatnce(indices,(list,tuple)):
		return self.idx_to_token[indices]
	return [self.idx_to_token[index] for index in indices]

	def unks(self):
	return 0
	def token_freqs(self):
	return self._token_freqs

def count_corpus(tokens):
	if len(tokens)==0or isinstance(tokens[0],list):
		tokens = [token for line in tokens for token in line]
	return collection.Counter(tokens)
```
```python
vocan = Vocab(tokens)
print(list(vocab.token_to_idx.items()))[:10]
```
```python
for i in [0,10]:
	print('文本',token[i])
	print('索引',vocab([tokens[i]]))
```
### 整合所有功能
```python
def load_corpus_time_machine(max_token=-1):
	lines = read_time_machine()
	tokens = tokenize(lines,'char')
	vocab = Vocab(tokens)
	
	corpus = [vocab[token] for line in tokens for token in line]:
	if max_tokens >0:
		corpus = corpus[:max_tokens]
	return corps,vocab
corpus,vocab = load_corpus_time_machine()
len(corpus),len(vocab)
```
