---
title: AttentionHead 和 MultiHeadAttention
published: '2026-10-02'
description: ''
tags:
  - BERT
draft: false
---
```python
from transformers import BertModel
```
```
Q ==> Linear
K ==> Linear ==> Scaled dot-product Attn ==> concat ==> Linear
V ==> Linear 
```
书接上回
```python
# 经过W_k,W_q,W_v的
def scaled_dot_product_attention(query,key,value):
	# hidden_size
	dim_k = key.size(-1)
	# batch_size,seq_len,seq_len
	attn_scores = torch.bmm(query,key.transpose(1,2))/np.sqrt(dim_k)
	attn_weights = F.softmax(attn_scores,dim=1)
	
	return torch.bmm(attn_weights,dim=1)
```
```python
class AttentionHead(nn.Module):
	def __init__(self,embed_dim,head_dim):
		super().__init__()
		self.Wq = nn.Linear(embed_dim,head_dim)
		self.Wk = nn.Linear(embed_dim,head_dim)
		self.Wv = nn.Linear(embed_dim,head_dim)
	def forward(self,hidden_states):
		q = self.Wq(hidden_states)
		k = self.Wk(hidden_states)
		v = self.Wv(hidden_states)
		attn_outputs = scaled_dot_product_attention(q,k,v)
		return attn_outputs
```
```python
class MultiHeadAttention(nn.Module):
	def __init__(self,config):
		super().__init__（）
		embed_dim = config.hidden_size
		num_heads = config.num_attention_heads
		# 768/12 == 64
		head_dim = embed_dim//num_heads
		self.heads = nn.ModuleList([
			AttentionHead(embed_dim,head_dim) for _ in range(num_heads)
		])
		self.output_layer = nn.Linear(embed_dim,embed_dim)
	def forward(self,hidden_size):
		print(f'input hidden_state:{hidden_state.shape}')
		print(f'head(hidden_state):{self.heads[11](hidden_state).shape}')
		x = torch.cat([head(hidden_state) for head in self.heads],dim=-1)
		print(f'cat heads:{x.shape}')
		x = self.output_layer(x)
		return x
```
```python
from torch import nn
from transformers import AutoConfig,AutoTokenizer,AutoModel
model_ckpt = 'bert-base-uncased'
tokenizer = AutoTokenizer.from_pretrained(model_ckpt)

# hyperparameters
config = AutoConfig.from_pretrained(model_ckpt)
config
```
```python
mha = MultiHeadAttention(config)
```
```python
mha(input_embeddings)
```
```python
from bertviz import head_view
from transformers import AutoModel
model = AutoModel.from_pretrained(model_ckpt,output_attention=True)
sentence_a = "time files like an arrow"
sentence_b = "fruit files like a banana"
viz_inputs = tokenizer(sentence_a,sentence_b,return_tensors='pt')
# nsp (next sentence prediction)
print(viz_inputs)
attention = model(**viz_inputs).attentions
sentence_b_start = (viz_inputs.token_type_ids == 0).sum(dim=1)
print(sentence_b_start)
tokens = tokenizer.convert_ids_to_tokens(viz_tokens.input_ids[0])
head_view(attention,tokens,sentence_b_start,head=[8])
```
```python

```