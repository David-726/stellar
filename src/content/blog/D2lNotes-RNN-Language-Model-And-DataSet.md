---
title: "Language Model And DataSet"
published: 2026-08-25
description: ""
tags: ["D2lNotes"]
draft: false
---
假设长度为T的文本序列中的词元依次是$x_1,x_2,...,x_T$，语言模型目标是估计序列的联合概率
$$
P(x_{1},x_2,...)
$$
例如只需要依次抽取一个词元$x_t~P(x_t|x_1,x_2,...,x_t)$,一个理想的语言模型就能够基于模型本还说呢生成自然文本
### 学习语言模型
$$
P(x_1,x_2,...,x_T)=\sum_{t=1}^{T}P(x_t|x_1,...,x_{t-1})
$$
包含了4个单词的1一个文本序列的概率是
$$
P(deep,learning,is,fun)=P(deep)P(learning|deep)P(is|deep,learning)P(fun|deep,learning,is)
$$
假设训练数据集是一个大型的文本语料库，训练数据集中词的概率可以根据给定词的相对词频来计算,可以将估计值$\hat P(deep)$计算为任何以单词deep开头的句子的概率，一种方法是统计单词deep在数据集中的出现次数，然后除以震哥哥语料库中的单词总数。
接下来，尝试估计:
$$
\hat P(learning|deep)=\frac{n(deep,learnig)}{n(deep)}
$$
然而多个单词的联合概率很难找到
一种常用策略是执行Laplace Smoothing,具体方式是在所有计数中添加一个小常量
$$
\begin{align}
\hat P(x)&=\frac{n(x)+\epsilon_1 /m}{n+\epsilon_1}\\
\hat P(x'|x)&=\frac{n(x,x')+\epsilon_2{\hat P(x')}}{n(x)+\epsilon_2}\\
\hat P(x''|x,x')&=\frac{n(x,x',x'')+\epsilon_3{\hat P(x'')}}{n(x,x')+\epsilon_3}
\end{align}
$$

### Markvo Model
序列上的分布满足一阶马尔可夫模型。阶数越高，对应的依赖关系越长，推导出可以应用于序列建模的近似公式:
$$
\begin{align}
P(x_1,x_2,x_3,x_4)&=P(x_1)P(x_2)P(x_3)P(x_4)\\
P(x_1,x_2,x_3,x_4)&=P(x_1)P(x_2|x_1)P(x_3|x_2)P(x_4|x_3)\\
P(x_1,x_2,x_3,x_4)&=P(x_1)P(x_2|x_1)P(x_3|x_1,x_2)P(x_4|x_2,x_3)
\end{align}
$$
### 自然语言统计
```python
import random
import torch
from d2l import toech as d2l

tokens = d2l.tokenize(d2l.read_time_machine())

corpus = [token for line in tokens for token in line]
vocab = d2l.Vocab(corpus)
vocab.token_freqs[:10]
```
```python
freqs = [freq for token,freq in vocab.token_freqs]
d2l.plot(freqs,xlabel='token:x',ylabel='frequenct:n(x)',xscale='log',yscale='log')
```
单词的频率满足奇普夫定律
$$
log n_i=-\alpha \,logi+c
$$
- 二元词元的频率
```python
bigram_tokens = [pair for pair in zip(corpus[:-1],corpus[1:])]
bigram_vocab = d2l.Vocab(bigram_tokens)
bigram_vocab.token_freqs[:10]
```
- 三元
```python
trigram_tokens = [triple for triple in zip(corpus[:-2],corpus[1:-1],corpus[2:])]
trigram_vocab = d2l.Vocab(trigram_tokens)
trigram_vocab.token_freqs[:10]
```

### 读取长序列数据
文本序列是任意长的，任意长的序列可以被我们划分为具有相同时间步数的子序列，训练我们的神经网络时，这样的小批量子序列将被输入到模型中
即使步长是固定的，但是我们可以任意确认初始位置，给了我们很大的操作空间
#### 随机采样
随机采样中，每个样本都是在原始的长序列上任意捕捉的子序列
```python
def seq_data_iter_random(corpus,batch_size,num_steps):
	#从随机偏移量开始对序列进行分区，随机范围包括num-steps-1
	corpus = corpus[random.randint(0,num_steps-1):]
	num_substeps = (len(corpus)-1)//num_steps
	initial_indices=list(range(0),num_subseqs*num_steps,num_steps)
	#来自两个相邻的随机的小批量中的子序列不一定在原始序列中相邻
	random.shuffle(initial_indices)
	def data(pos):
		return corpus[pos:pos+num_steps]
		
	num_batches = num_subseqs//batch_size
	for i in range(0,batch_size*num_bathches,batch_size):
		initial_indices_per_batch=initial_indices[i:i+batch_size]
		X = [data[j] for j in intial_indices_per_batch]
		Y = [data[j+1]for j in initial_indices_per_batch]
		yield torch.tensor(X),torch.tensor(Y)
```
```python
my_seq = list(range(35))
for X,Y in seq_data_iter_random(my_seq,batch_size=2,num_step=5)
	print('X:',X,'\nY',Y)
```
### 顺序分区
迭代过程中，除了对原始序列可以随机抽样外，我们还可以保证两个相邻的小批量中的子序列在原始序列上也是相邻的。这种策略在基于小批量的迭代过程中保留了子序列的顺序，因此称之为顺序分区
```python
def seq_data_iter_sequential(corpus,batch_size,num_steps):
	offset = random.randint(0,num_steps)
	num_tokens = ((len(corpus)-offset-1)//batch_size)*batch_size
	Xs = torch.tensor(corpus[offset:offset+num_tokens])
	Ys = torch.tensor(corpus[offset+1:offset+1+num_tokens])
	Xs,Ys = Xs.reshape(batch_size,-1),Ys.reshape(batch_size,-1)
	num_batches = Xs.reshape(batch_size,-1)//num_steps
	for i in range(0,num_steps*num_batches,num_steps):
		X = Xs[:,i:i+num_steps]
		Y = Ys[:,i:i+num_steps]
		yield X,Y
```
基于相同的设置，通过顺序分区读取每个小批量的子序列的特征X和标签Y,通过将它们打印出可以发现:迭代期间来自2个相邻的小批量中的子序列在原始序列中是相邻的
```python
for X,Y in seq_data_iter_sequential(my_seq,batch_size=2,num_steps=5):
	print('X: ',X,'\nY:',Y)
```
下面将上面的2中采样函数包装到一个类中，以便稍后可以将其用作数据迭代器
```python
class SeqDataLoader:
	def __init__(self,batch_size,num_steps,use_random_iter,max_tokens):
		if use_random_iterL:
			self.data_iter_fn = d2l.seq_data_iter_random
		else:
			self.data_iter_fn = d2l.seq_data_iter_sequential
		self.corpus,self.vocab = d2l.load_corpus_time_machine(max_tokens)
		self.batch_size,self.num_steps = batch_size,num_steps
	def __iter__(self):
		return self.data_iter_fn(self.corpus,self.batch_size,self.num_steps)
```

### Practice:
1. 假设训练数据集中有个单词。一个四元语法需要存储多少个词频和相邻多词频率？
    
2. 我们如何对一系列对话建模？
    
3. 一元语法、二元语法和三元语法的齐普夫定律的指数是不一样的，能设法估计么？
    
4. 想一想读取长序列数据的其他方法？
    
5. 考虑一下我们用于读取长序列的随机偏移量。
    
    1. 为什么随机偏移量是个好主意？
        
    2. 它真的会在文档的序列上实现完美的均匀分布吗？
        
    3. 要怎么做才能使分布更均匀？
        
6. 如果我们希望一个序列样本是一个完整的句子，那么这在小批量抽样中会带来怎样的问题？如何解决？
