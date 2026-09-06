---
title: "机翻数据集的连续"
published: 2026-08-30
description: ""
tags: ["D2lNotes"]
draft: false
---
```python
import torch
import os
from d2l import torch as d2l
```

### Dataset预处理
```python
d2l.DATA_HUB['fra-eng'] = (d2l.DATA_URL + 'fra-eng.zip',
                           '94646ad1522d915e7b0f9296181140edcf86a4f5')
def read_data_nmt():
	data_dir = d2l.download_extract('fra-end')
	with open(os.path.join(data_dir,'fra.txt').'r',encoding='utf-8')as f:
		return f.read()
raw_text = read_data_nmt()
print(raw_text[:75])
```
预处理
```python
#@save
def preprocess_nmt(text):
    """预处理“英语－法语”数据集"""
    def no_space(char, prev_char):
        return char in set(',.!?') and prev_char != ' '

    # 使用空格替换不间断空格
    # 使用小写字母替换大写字母
    text = text.replace('\u202f', ' ').replace('\xa0', ' ').lower()
    # 在单词和标点符号之间插入空格
    out = [' ' + char if i > 0 and no_space(char, text[i - 1]) else char
           for i, char in enumerate(text)]
    return ''.join(out)

text = preprocess_nmt(raw_text)
print(text[:80])
```
#### Tokenizer
```python
def tokenize_nmt(text,num_examples=None):
	source,taerget=[],[]
	for i,line in enumerate(text.split('\n')):
		if num_examples and i>num_examples:
			break
		parts = line.split('\t')
		if len(parts)==2:
			source.append(parts[0].split(' '))
			source.append(parts[1].split(' '))
	return source,target
	
source,target = tokenize_nmt(text)
source[:6],target[:6]
```
可视化一下：
```python
#@save
def show_list_len_pair_hist(legend, xlabel, ylabel, xlist, ylist):
    """绘制列表长度对的直方图"""
    d2l.set_figsize()
    _, _, patches = d2l.plt.hist(
        [[len(l) for l in xlist], [len(l) for l in ylist]])
    d2l.plt.xlabel(xlabel)
    d2l.plt.ylabel(ylabel)
    for patch in patches[1].patches:
        patch.set_hatch('/')
    d2l.plt.legend(legend)

show_list_len_pair_hist(['source', 'target'], '# tokens per sequence',
                        'count', source, target);
```
### Vocab
```python
src_vocab = d2l.Vocab(source,min_freq=2,reserved_tokens['<pad>','<bos>','<eos>'])
len(src_vocab)
```
#### 加载数据集
```python
def truncate_pad(line,num_steps,padding_token):
	if len(line)>num_steps:
		return line[:num_steps]
	return line + [padding_token]*(num_steps-len(line))
truncate_pad(src_vocab[source[0]],10,src_vocab['<pad>'])
```
将机翻文本序列转换为小批量
```python
def build_array_nmt(lines,vocab,num_steps):
	lines = [vocab[l] for l in lines]
	lines = [l+[vocab['<eos>']]for l in lines]
	array = torch.tensor([truncate_pad(l,num_steps,vocab['<pad>'])for l in lines])
	valid_len = (array!=vocab['<pad>']).type(torch.int32).sum(1)
	
```
### Train The Model
```python
def load_data_nmt(batch_size,num_steps,num_examples=600):
	text = preprocess_nmt(read_data_nmt())
	source,target=tokenize_nmt(text,num_examples)
	src_vocab = d2l.Vocab(source,min_frqe=2,reserved_tokens=['<pad>','<bos>','<eos>'])
	tgt_vocab = d2l.Vocab(target, min_freq=2,
                          reserved_tokens=['<pad>', '<bos>', '<eos>'])
	src_array, src_valid_len = build_array_nmt(source, src_vocab, num_steps)
    tgt_array, tgt_valid_len = build_array_nmt(target, tgt_vocab, num_steps)
    data_arrays = (src_array, src_valid_len, tgt_array, tgt_valid_len)
    data_iter = d2l.load_array(data_arrays, batch_size)
    return data_iter, src_vocab, tgt_vocab
```
```python
train_iter,src_vocab,tgt_vocab = load_data_nmt(batch_size=2,num_steps=8)
for X,X_valid_len,Y,Y_valid_len in train_iter:
	print('X:', X.type(torch.int32))
    print('X的有效长度:', X_valid_len)
    print('Y:', Y.type(torch.int32))
    print('Y的有效长度:', Y_valid_len)
    break
```
### Practice:
1. 在`load_data_nmt`函数中尝试不同的`num_examples`参数值。这对源语言和目标语言的词表大小有何影响？
    
2. 某些语言（例如中文和日语）的文本没有单词边界指示符（例如空格）。对于这种情况，单词级词元化仍然是个好主意吗？为什么？

