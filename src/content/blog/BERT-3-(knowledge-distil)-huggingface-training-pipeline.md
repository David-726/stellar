---
title: (knowledge distil) huggingface training pipeline
published: '2026-10-04'
description: ''
tags:
  - BERT
draft: false
---
### review
- $q(x)$:from student model,$p(x)$:from teacher model
- 其次对于$q(x),p(x)$在计算时需要加温度:
	$$
	\begin{align}
	L_{student}&=\alpha L_{CE}+(1-\alpha L_{KD})\\
	&=\alpha L_{CE}+(1-\alpha)T^2D_{KL}
	&=\alpha L_{CE}+(1-\alpha)T^2\sum_ip_i(x)log\frac{p_i(x)}{q_i(x)}
	\end{align}
	$$
- 关于`nn.KLDivLoss()`
	- inputs(q(x)):log probablities
	- labels(p(x)):normal probablities
### trainer argument&trainer
```python
from transfomers import TrainingArguments,Trainer
import torch
from torch import nn
import torch.nn.functional as F
import numpy as np
import wandb
```
```python
class DistilTrainingArgument(TrainingArguments):
	# TrainingArgument:@dataclass
	# 增加2个KD所需的参数
	def __init__(self,*args,alpha=0.5,temperature=2.,**kwargs):
		super().__init__(*args,**kwargs)
		self.aplha=alpha
		self.temperature=temperature
```
```python
class DistilTrainer(Trainer):
	def __init__(self,*args,teacher_model=None,**kwargs):
		# 增加teacher_model参数
		super.__init__(*args,**kwargs)
		self.teacher_model=teacher_model
	# 重写trainer中核心方法
	# forward计算损失
	def compute_loss(self,model,inputs,return_outputs=False):
		s_output = model(**inputs)
		s_ce = s_output.loss
		s_logits = s_output.logits
		
		with torch.no_grad():
			t_output = self.teacher_model(**inputs)
			t_logits = t_output.logits
			
		loss_kl_fct = nn.KLDivLoss(reduction='batchmean')
		loss_kd = self.args.temperature**2 *loss_kl_fct(F.log_softmax(s_logits/self.args.temperature,dim=-1),F.softmax(t_logits/self.args.temperature,dim=-1))
		
		loss = self.args.alpha*s_ce+(1-self.args.alpha)*loss_kd
		return (loss,s_output) if return_outputs else loss
```
### pipeline
#### datasets
```python
import os
os.environ['HTTP_PROXY']='http://127.0.0.1:7890'
os.environ['HTTPS_PROXY']='https://127.0.0.1:7890'
```
```python
from datasets import load_dataset
clinc = load_dataset("clinc_cos","plus")
```
```python
clinc
```
```python
clinc['train'][:10]
```
```python
intents = clinc['train'].features['intent']
num_labels = intents.num_classes
```
#### student model初始化
```python
from transformers import AutoModel,AutoTokenizer
from transformers import AutoModelForSequenceClassification
```
```python
device = torch.device("cuda" if torch.cuda.is_available() else 'cpu')
device
```
```python
s_ckpt = 'distilbert-base-uncased'
s_tokenizer = AutoTokenizer.from_pretrained(s_ckpt)

t_ckpt = 'transformersbook/bert-base-uncased-finetuned-clinc'
t_model = AutoModelForSequenceClassficiation.from_pretrained(t_ckpt,num_labels=num_labels).to(device)
```
```python
clinc_enc = clinc.map(lamda batch: s_tokenizer(batch['text'],truncation=True),batched=True,remove_columns=['text'])
clinc_enc = clinc_enc.rename_columns({'intent':'labels'})
clinc_enc
```
```python
batch_size = 64
s_training_args = DistillTrainingArguments(output_dir='distrilbert-base-uncased-ft-clinc',
						evaluation_strategy='epoch',num_train_epochs=5,
						learning_rate=3e-4,
						per_device_train_batch_size=batch_size,
						per_device_eval_batch=batch_size,
						alpha=1,weight_decay=0.01,
						logging_strategy='epoch',
						push_to_hub=False
						)
s_config = AutoConfig.from_pretrained(s_ckpt,num_labels=num_labels,id2label=t_model.config.id2label,label2id=t_model.config.label2id)
```
```python
def student_init():
	return AutoModelForSequenceClassfication.from_pretrained(s_ckpt,config=s_config).to(device)
```
#### trainer.train
```python
# from datasets import load_metric
# accuary_score = load_metric('accuary')
# SequenceClassfication
import evaluate
accuracy_score = evaluate.load('accuracy')
```
```python
# trainer 需要的回调函数,非成员函数
def compute_metrics(pred):
	predictions,labels = pred
	predictions = np.argmax(prediction,axis=1)
	return accuracy_score.compute(reference=labels,prediction=prediction)
```
```python
distill_trainer = DistillTrainer(model_init=student_init,teacher_model=t_model,args=s_training_args,train_dataset=clinc_enc['train'],eval_dataset=clinc_enc['validation'],compute_metrics=compute_metrics,tokenizer=s_tokenizer)
distill_trainer.train()
```
```python
import math
math.cell(15250/(64*2))*5
```
#### 使用
```python
from transformers import pipeline
pipe = pipeline('text-classification',model=',/distilbert-base-uncased-ft-clinc/')
```

