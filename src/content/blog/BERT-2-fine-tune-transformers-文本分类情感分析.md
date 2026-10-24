---
title: fine tune transformers 文本分类情感分析
published: '2026-09-27'
description: ''
tags:
  - BERT
draft: false
---
```python
emotions = load_datat('emotion')
```
```python
emotions
```
```python
emotions.keys()
```
```python
print(emotions['train'],type(emotions['train']))

print(emotions['train']['text'][:5])
print(emotions['train']['label'][:5])
print(emotions['train'][:5])
```
```python
print(emotions['train'].features)
print(emotions['train'].features['label'])
print(emotions['train'].features['label'].int2str(2))
```

```python
labels = emotional['train'].features['label'].name
print(labels)
num_classes = len(labels)
num_classes
```
### Data Visualization analysis
- dataset->dataframe
- text length
- label freq
#### dataset to dataframe
```python
emotions_df = pd.DataFrame.from_dict(emotions['train'])
```
```python
print(emotions_df.shape,emotions_df.columns)
emotions_df[:5]
```
```python
emotions_df['label_name']=emotions_df['label'].apply(lamada x:labels(x))
```
```python
emotions_df[:5]
```

#### data analysis
各个类别的数量:
```python
emotions_df.labels.value_counts()
```
```python
emotions_df.labels_name.value_counts()
```
```python
plt.figure(figsize = (4,3))
emotions_df['label_name'].value_counts(ascending=True).plot.barh()
plt.title('freq of lanels')
```
##### text length analysis
```python
plt.figure(figsize=(4,3))
emotions_df['words per tweet']=emotions_df['text'].str.split().apply(len)
emotions_df.boxplot('word per tweet',by='label_name',showliers=False,grid=False,color='black')

plt.subtitle(' ')
plt.xlabel(' ')
```

```python
print(emotions_df['words per tweet'].max())
print(emotions_df['words per tweet'].idmax())
```
```python
print(emotions_df.iloc[6322])
emotions_df.iloc[6322]['text']
```
```python
print(emotions_df['words per tweet'].min())
print(emotions_df['words per tweet'].idmin())

print(emotions_df.iloc[6322])
emotions_df.iloc[6322]['text']
```

### text==>token
将数据集转换为模型接受的输入的类型
- Subword Tokenization
	- WordPiece
		- Bert And DistilBERT
- huggingface
	- `-/.cache/huggingface/`
- tokenizer
	- `tokenizer.vocab_size`
	- model config
		- `tokenizer.model_max_length`
		- `tokenizer.model_input_names`
#### tokenizer
```python
from transformers import AutoTokenizer
```
```python
model_ckpt = 'distilbert-base-uncased'
tokenizer = AutoTokenizer.from_pretrained(model_ckpt)
```
```python
#uncased
print(tokenizer.encode('Hello World')
print(tokenizer.encode('HELLO WORLD')
print(tokenizer.encode('hello world')
```
```python
print(tokenizer.vocab_size)
print(tokenizer.model_max_length)
print(tokenizer.model_input_name)
```
```python
#special_id
for special_id in tokenizer.all_special_ids:
	print(special_id,tokenizer.decode(special_id))
```
### tokenize the whole dataset
```python
def batch_tokenize(batch):
	return tokenizer(batch['text'],padding=True,truncation=True)
```
```python
emotions_encoded = emotions.map(batch_tokenizer,batched=True,batch_size=None)
```
```python
emotions_encoded
```
```python
type(emotions_encoded['train']['input_ids'])
```
```python
emotions_encoded.set_format('torch',column=['label','input_ids','attention_mask'])
```
```python
type(emotions_encoded['train']['input_ids'])
```
### fine-tune transformers
#### distilbert-case-uncased
- distilbert 是对 bert的distil 而来的
	- 模型的结构更为简单
	- 比 bert-base-uncased 参数量少不少
```python
from transformers import AutoModel
model_ckpt = 'distilbert-base-uncased'
model = AutoModel.from_pretrained(model_ckpt)
model
```

```python
from transformers import AutoModelForSequenceClassification
model_ckpt = 'distilbert-base-uncased'
device = torch.device('cuda' if torch.cuda.is_aviailable() else 'cpu')
model = AutoModelForSqeunceClassification.from_pretrained(model_ckpt,num_labels=num_classes).to(device)
model
```
和AutoModel的区别 多了一个下游任务

#### trainer
```python
# (write)
from transformers import notebook_login
notebook_login
```
```python
from transformers import TraimingArgyments,Trainer
```
```python
batch_size=64
logging_steps = len(emotions_encoded['train'])
model_name = f'{model_ckpt}_enmotions_ft'
training_args = TrainingArguments(outputs_dir = model_name,
									num_train_epoches=4,
									learning_rate=2e-5,
									per_device_train_batch_size=batch_size,
									per_device_eval_batch_size=batch_size,
									weight_decay=0.01,
									evaluation_strategy="epoch",
									disable_tqdem=False,
									logging_steps=logging_steps,
									#write
									push_to_bb=True,
									log_level='error')
```
- trainer默认自动开启torch的多gpu模式
	- `per_device_train_batch`用于设置每个gpu的上限
	- 一般而言,多gpu模式希望多个Gpu的性能尽可能的接近,否则最终**多gpu的速度由最慢的gpu决定**
		- 比如快gpu跑了1个batch需要5s,跑10个batch需要50s,慢的gpu跑1个batch500s,则快的gpu需要等慢gpu跑完1个batch之后才能继续
		- 同理`per_device_eval_batch_size`类似
	- `learning_rate/weight_decay`
		- 默认使用AdamW的优化算法
```python
from utils import compute_classification_metrics
trainer = Trainer(model=model,
				tokenizer=tokenizer,
				train_dataset=emotions_encoded['train']
				eval_dataset=emotions_encoded['validation'],
				args=training_args,
				compute_metrics = compute_classification_metrics2
				)
```
```python
trainer.train()
```
```python
preds_output = trainer.predict(emotions_encoded["validation"])
preds_output
```
```python
preds_output = traiher.predict(emotions_encoded["validation"])
y_preds = np.argmax(preds_output.prediction,axis=1)
```
```python
y_true = emotions_encoded['validation']['label']
```
```python
from utils import plot_confision_matrix
plot_confusion_matrix(y_preds,y_true,labels)
```
```python
labels
```
```python
preds_output = traiher.predict(emotions_encoded["test"])
y_preds = np.argmax(preds_output.prediction,axis=1)
y_true = emotions_encoded['test']['label']
plot_confusion_matrix(y_preds,y_true,labels)
```
### result analysis
```python
from torch.nn.functional import cross_entropy
```
```python
def forward_pass_with_label(batch):
	inputs = {k:v.to(device) for k,v in batch.items()
			  if k in tokenizer.model_input_name}
	with torch.no_grad():
		output = model(**inputs)
		pred_label = torch.argmax(output.logits,axis=1)
		loss = cross_entropy(output.logits,batch['label'].to(device),reduction="none")
		
	# Place outputs on CPU for compatibility with other dataset columns
	return {"loss":loss.cpu().numpy(),"predicted_label":pred_labels.cpu().numpy()}
```
```python
emotions_encoded["validation"]=emotions_encoded["valiadtion"].map(forward_pass_with_label,batched=True,batch_size=16)
```
```python
emotions_encoded["validation"]
```
```python
valid_df = pd.DataFrame.from_dict({'text':emotions_encoded["validation"]['txet'],
						'label':emotions_encoded['validation']['label'].numpu(),
						'pred_label':emotions_encoded["validation"]['loss'].numpy()})
valid_df['label']=valid_bf['label'].apply(lamda x:int2str(x))
valid_df['pred_label']=valid_bf['pred_label'].apply(lamada x:int2str(x))
```
```python
valid_df
```
```python
valid_df[vlaid_df['label']!=valid_bf['pred_label']].label.value_counts()
```
```python
# 
valid_df.mort_values('loss',ascending=False.head(10))

```
```python
#mislabeld
valid_df.iloc[882].text
```
```python
# less loss menas more confident
# sadness/joy
valid_df.sort_value('loss',ascending=True).head(20)
```
### to huggingface hub
```python
trainer.push_to_hub(commit_message="Training compeleted")
```
```python
from transformers import pipeline

model_id = '.../...'
classifier = pipeline(”text-classification",model=model_id)
```
```python
custom_tweet = "I saw a movie today and it was really good"
custom_tweet = "I saw a movie today adn it suck"
preds = classifier(custom_tweet,return_all_scores=True)
preds
```
```python
preds_df = pd.DataFrame(preds[0])
plt.bar(labels,100*pred_df["score"],color='C0')
plt.title(f"{custom_tweet}")
```
