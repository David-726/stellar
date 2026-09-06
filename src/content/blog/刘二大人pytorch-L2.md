---
title: "L2"
published: 2026-04-16
description: ""
tags: ["PyTorch"]
draft: false
---
## L2
	 - DataSet
	 - Model
	 - Training
	 - Inferring
### Training methis
>Supppose that students would get y points in final exams . if they spent x hours in paper

|  x  | y   |
| :-: | --- |
|  1  | 2   |
|  2  | 4   |
|  3  | 6   |
|  4  | ?   |
4 hours -> model ->?points
	Input                 Prediction
supervised Learning:Test Set用于测试泛化能力
前3行Training Set 第4行Test Set
>kaggle

训练$(x,y)$  $D(x,y)$ 为$x,y$ 的联合分布
采样set 是否能够达到$D(x,y)$的目标
> 大数定律 维度的诅咒
即便数据量很大 依旧难以表示真实的分布

**真实的场景和训练存在差异**
**训练集过好 --> 过拟合
但我们希望我们的模型能够有较好的泛化能力
因而常常我们将训练集分为 Train和Dev两部分。Dev开发集对模型泛化能力进行评估

### Model Design
**What would be the best model for the data**
**Linear Model?
最初我们会选择LInear作为实验 若效果不好则换模型
$f(x)=w*x+b$
To simplify the model
$\hat y=x*w$
值得注意的是 $\hat y$ 加上标的y一般表示预测的结果
The machine starts with a random guess
w=random value
Evalvate Model

### Training Loss
$loss=(\hat y-y)^2=(x*w-y)^2$
$\hat y$ 预测值 y 真实值
**Mean Square Error
$\text{cost} = \frac{1}{N} \sum_{n=1}^{N} \left( \hat{y}_n - y_n \right)^2$
平均平方误差 : MSE
- 穷举
**穷举w的所有取值，观察MSE曲线找到最优权重**
```python
import numpy as np
import matplotlib.pyplot as plt

x_data=[1.0,2.0,3.0]
y_data=[2.0,4.0,6.0]

def forward(x):
	return x*w
def loss(x,y):
	y_pred = forward(x)
	return (y_pred-y)*(y_pred-y)
w_list=[]
mse_list=[]
for w in np.arrange(0.0,4.1,0.1)
	printf('w=',w)
	l_sum=0
	for x_val,y_val in zip(x_data,y_data)
		y_pred_val=forward(x_val)
		loss_val=loss(x_val,y_val)
		l_sum+=loss_val
		print('\t',x_val,y_val,y_pred_val,loss_val)
	print('MSE=',l_sum/3)
	w_list.append(w)
	mse_list.append(l_sum/3)

plt.plot(w_list,mse_list)
plt.ylabel('Loss')
plt.xlabel('w')
plt.show()
```
>常常我们需要话这种plot表格 但是横坐标一般是Epot轮数 观察最佳轮数 收敛点
考虑模型训练过程中的存盘和持久化
**Visdom**

Test:
**Try to use the model in right-side and draw the cost graph
$\hat y=x*w+b$
- **Tips:
read the material of how to darw 3d graph
Function np.meshgrid is very popular for drawing 3d graph

