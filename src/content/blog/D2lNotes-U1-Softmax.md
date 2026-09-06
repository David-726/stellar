---
title: "Softmax"
published: 2026-05-26
description: ""
tags: ["D2lNotes"]
draft: false
---
### Softmax
### Classifier
假设每次输入是一个$2\times2$的灰度图像。 我们可以用一个标量表示每个像素值，每个图像对应四个特征$x_1, x_2, x_3, x_4$。 此外，假设每个图像属于类别“猫”“鸡”和“狗”中的一个。
#### 独热编码 one-hot node
 独热编码是一个向量，它的分量和类别一样多。 类别对应的分量设置为1，其他所有分量设置为0。 在我们的例子中，标签$y$将是一个三维向量， 其中$(1, 0, 0)$对应于“猫”、$(0, 1, 0)$对应于“鸡”、$(0, 0, 1)$对应于“狗”
 $$
y \in \{(1, 0, 0), (0, 1, 0), (0, 0, 1)\}.
$$
### 网络架构 全连接层

为了估计所有可能类别的条件概率，我们需要一个有多个输出的模型，每个类别对应一个输出。 为了解决线性模型的分类问题，我们需要和输出一样多的仿射函数。
$$
\begin{split}\begin{aligned}
o_1 &= x_1 w_{11} + x_2 w_{12} + x_3 w_{13} + x_4 w_{14} + b_1,\\
o_2 &= x_1 w_{21} + x_2 w_{22} + x_3 w_{23} + x_4 w_{24} + b_2,\\
o_3 &= x_1 w_{31} + x_2 w_{32} + x_3 w_{33} + x_4 w_{34} + b_3.
\end{aligned}\end{split}
$$
![images/softmaxreg.svg](https://zh.d2l.ai/_images/softmaxreg.svg)
在深度学习中，全连接层无处不在。 然而，顾名思义，全连接层是“完全”连接的，可能有很多可学习的参数。

### Softmax

我们希望模型的输出$\hat{y}_j$可以视为属于类$j$的概率， 然后选择具有最大输出值的类别$\operatorname*{argmax}_j y_j$作为我们的预测。 例如，如果$\hat{y}_1$、$\hat{y}_2$和$\hat{y}_3$分别为0.1、0.8和0.1， 那么我们预测的类别是2，在我们的例子中代表“鸡”。
要将输出视为概率，我们必须保证在任何数据上的输出都是非负的且总和为1。
**softmax函数能够将未规范化的预测变换为非负数并且总和为1，同时让模型保持 可导的性质。**
$$
\begin{align}
\hat y &=softmax(o)\newline
\hat y_{j}&=\frac{exp(o_{j})}{\sum_{k}exp(o_{k})}
\end{align}
$$
这里，对于所有的$j$总有$0 \leq \hat{y}_j \leq 1$。 因此，$\hat{\mathbf{y}}$可以视为一个正确的概率分布。
$$
\operatorname*{argmax}_j \hat y_j = \operatorname*{argmax}_j o_j.
$$尽管softmax是一个非线性函数，但softmax回归的输出仍然由输入特征的仿射变换决定。 因此，softmax回归是一个**线性模型**
**注意softmax是一个线性模型**故不能用于激活函数

### 小批量样本的矢量化
为了提高计算效率并且充分利用GPU，我们通常会对小批量样本的数据执行矢量计算。 假设我们读取了一个批量的样本$\mathbf{X}$， 其中特征维度（输入数量）为$d$，批量大小为$n$。 此外，假设我们在输出中有$q$个类别。 那么小批量样本的特征为$\mathbf{X} \in \mathbb{R}^{n \times d}$， 权重为$\mathbf{W} \in \mathbb{R}^{d \times q}$， 偏置为$\mathbf{b} \in \mathbb{R}^{1\times q}$。 softmax回归的矢量计算表达式为：
$$
\begin{split}\begin{aligned} \mathbf{O} &= \mathbf{X} \mathbf{W} + \mathbf{b}, \\ \hat{\mathbf{Y}} & = \mathrm{softmax}(\mathbf{O}). \end{aligned}\end{split}
$$
### 损失函数
### 对数似然
$$
P(\mathbf{Y} \mid \mathbf{X}) = \prod_{i=1}^n P(\mathbf{y}^{(i)} \mid \mathbf{x}^{(i)}).
$$
根据最大似然估计，我们最大化$P(\mathbf{Y} \mid \mathbf{X})$，相当于最小化负对数似然：
$$
-\log P(\mathbf{Y} \mid \mathbf{X}) = \sum_{i=1}^n -\log P(\mathbf{y}^{(i)} \mid \mathbf{x}^{(i)})
= \sum_{i=1}^n l(\mathbf{y}^{(i)}, \hat{\mathbf{y}}^{(i)}),
$$
### Cross-Entropy Loss 交叉熵损失
$$
l(\mathbf{y}, \hat{\mathbf{y}}) = - \sum_{j=1}^q y_j \log \hat{y}_j.
$$
$$
\begin{split}\begin{aligned}
l(\mathbf{y}, \hat{\mathbf{y}}) &=  - \sum_{j=1}^q y_j \log \frac{\exp(o_j)}{\sum_{k=1}^q \exp(o_k)} \\
&= \sum_{j=1}^q y_j \log \sum_{k=1}^q \exp(o_k) - \sum_{j=1}^q y_j o_j\\
&= \log \sum_{k=1}^q \exp(o_k) - \sum_{j=1}^q y_j o_j.
\end{aligned}\end{split}
$$
$$
\partial_{o_j} l(\mathbf{y}, \hat{\mathbf{y}}) = \frac{\exp(o_j)}{\sum_{k=1}^q \exp(o_k)} - y_j = \mathrm{softmax}(\mathbf{o})_j - y_j.
$$
导数是我们softmax模型分配的概率与实际发生的情况的差异
### Practice:
## 3.4.10. 练习

1.  我们可以更深入地探讨指数族与softmax之间的联系。
    
    1.  计算softmax交叉熵损失$l(\mathbf{y},\hat{\mathbf{y}})$的二阶导数。
        
    2.  计算$\mathrm{softmax}(\mathbf{o})$给出的分布方差，并与上面计算的二阶导数匹配。
        
2.  假设我们有三个类发生的概率相等，即概率向量是$(\frac{1}{3}, \frac{1}{3}, \frac{1}{3})$。
    
    1.  如果我们尝试为它设计二进制代码，有什么问题？
        
    2.  请设计一个更好的代码。提示：如果我们尝试编码两个独立的观察结果会发生什么？如果我们联合编码$n$个观测值怎么办？
        
3.  softmax是对上面介绍的映射的误称（虽然深度学习领域中很多人都使用这个名字）。真正的softmax被定义为$\mathrm{RealSoftMax}(a, b) = \log (\exp(a) + \exp(b))$。
    
    1.  证明$\mathrm{RealSoftMax}(a, b) > \mathrm{max}(a, b)$。
        
    2.  证明$\lambda^{-1} \mathrm{RealSoftMax}(\lambda a, \lambda b) > \mathrm{max}(a, b)$成立，前提是$\lambda > 0$。
        
    3.  证明对于$\lambda \to \infty$，有$\lambda^{-1} \mathrm{RealSoftMax}(\lambda a, \lambda b) \to \mathrm{max}(a, b)$。
        
    4.  soft-min会是什么样子？
        
    5.  将其扩展到两个以上的数字。

## softmax的从0实现

```python
import torch
form IPython import display
fro d2l import torch as d2l

batch_size = 256
train_iter,test_iter=d2l.load_data_fashion_mnist(batch_size)
```
### 初始化模型参数
```python
num_inputs = 784
num_outputs = 10
W = torch.normal(0,0.01,szie=(num_inputs,out_puts),requires_grad=True)
b = torch.zeros(num_outputs,requires_grad=True)
```

### 定义softmax操作

矩阵沿特定张量维度的求和
```python
X = torch.tensor([1.0,2.0,3.0],[4.0,5.0,6.0])
X.sum(0,keepdim=True),X.sum(1,keepdim=True)
```
```python
def softmax(X):
	X_exp = torch.exp(X)
	partition = X_exp.sum(1,keepdim=True)
	return X_exp / partition
```
对于上述代码 加入任何随机输入 我们讲每个元素变成一个非负数
```python
X = torch.normal(0,1,(2,5))
X_prob = softmax(X)
X_prob , X_prob.sum(1)
```
### 定义模型

将数据传递到模型之前 我们使用reshape函数将每张函数图像展平为向量
```python
def net(X):
	return softmax(np.dot(X.reshape((-1,W.shape([0])),W)+b)
```

### 定义损失函数

我们创建一个数据样本`y_hat`，其中包含2个样本在3个类别的预测概率， 以及它们对应的标签`y`。 有了`y`，我们知道在第一个样本中，第一类是正确的预测； 而在第二个样本中，第三类是正确的预测。 然后使用`y`作为`y_hat`中概率的索引， 我们选择第一个样本中第一个类的概率和第二个样本中第三个类的概率。
```python
y = torch.tensor([0,2])
y_hat = torch.tensor([[0.1,0.3,0.6],[0.3,0.2,0.5]])
y_hat[[0,1],y]
```
```python
def cross_entropy(y_hat,y):
	return - torch.log(y_hat[range(len(y_hat)),y])
	
cross_entropy(y_hat,y)
```
### 分类精度

 首先，如果`y_hat`是矩阵，那么假定第二个维度存储每个类的预测分数。 我们使用`argmax`获得每行中最大元素的索引来获得预测类别。 然后我们将预测类别与真实`y`元素进行比较。 由于等式运算符“`==`”对数据类型很敏感， 因此我们将`y_hat`的数据类型转换为与`y`的数据类型一致。 结果是一个包含0（错）和1（对）的张量。 最后，我们求和会得到正确预测的数量。

```python
def accuracy(y_hat,y):
	if len(y_hat.shape)>1 and y_hat.shape[1]>1:
		y_hat = y_hat.argmax(axis=1)
	cmp = y_hat.type(y.dtype) == y
	return float(cmp.type(y.dtype).sum())
```

```python
def evulate_accuracy(net,data_iter):
	if isinstance(net,torch.nn.Module):
		net.eval()
	metric = Accumulator(2)
	with torch.no_grad():
		for X,y in data_iter:
			metric.add(accuracy(net(X),y),y.numel())
	return metric[0]/metric[1]
```

定义一个使用程序类Acuumulator 用于对多个变量进行累加。 在上面的evaluate_accuracy函数中 ，我们在Accumulator实例中创建了2个变量 ， 分别用于存储正确预测的数量和预测的总数量。当我们遍历数据集时，二者都将随着时间的推移而累加
```python
class Accumulator:
	def __init__(self,n):
		self.data = [0.0]*n
	def add(self,*args):
		self.data = [a + float(b) for a,b in zip(self.data,args)]
	def reset(self):
		self.data = [0.0]*len(self.data)
	def __getitem__(self,idx):
		return self.data[idx]
```
### 训练
```python
def train_epoch_ch3(net,train_iter,loss,updater):
	if isinstance(net,torch.nn.Module):
		net.train()
	#训练损失总和、训练准确度综合、样本值
	metric = Accumulator(3)
	for X,y in train_iter:
		y_hat = net(X)
		l = loss(y_hat,y)
		if isinstance(updater,torch.optim.Optimizer):
		# 使用pytorch内置的优化器和损失函数
			updater.zero_grad()
			l.mean().backward()
			updater.step()
		else:
		# 使用定制的优化器和损失函数
			l.sum().backward()
			updater(X.shape[0])
		metric.add(float(l.sum()),accuracy(y_hat,y),y.numel())#numel用于计算样本值
	return metric[0]/metric[2],metric[1]/metric[2]
```

定义一个在动画中绘制数据的实用程序类`Animator`， 它能够简化本书其余部分的代码。
```python
class Animator:  #@save
    """在动画中绘制数据"""
    def __init__(self, xlabel=None, ylabel=None, legend=None, xlim=None,
                 ylim=None, xscale='linear', yscale='linear',
                 fmts=('-', 'm--', 'g-.', 'r:'), nrows=1, ncols=1,
                 figsize=(3.5, 2.5)):
        # 增量地绘制多条线
        if legend is None:
            legend = []
        d2l.use_svg_display()
        self.fig, self.axes = d2l.plt.subplots(nrows, ncols, figsize=figsize)
        if nrows * ncols == 1:
            self.axes = [self.axes, ]
        # 使用lambda函数捕获参数
        self.config_axes = lambda: d2l.set_axes(
            self.axes[0], xlabel, ylabel, xlim, ylim, xscale, yscale, legend)
        self.X, self.Y, self.fmts = None, None, fmts

    def add(self, x, y):
        # 向图表中添加多个数据点
        if not hasattr(y, "__len__"):
            y = [y]
        n = len(y)
        if not hasattr(x, "__len__"):
            x = [x] * n
        if not self.X:
            self.X = [[] for _ in range(n)]
        if not self.Y:
            self.Y = [[] for _ in range(n)]
        for i, (a, b) in enumerate(zip(x, y)):
            if a is not None and b is not None:
                self.X[i].append(a)
                self.Y[i].append(b)
        self.axes[0].cla()
        for x, y, fmt in zip(self.X, self.Y, self.fmts):
            self.axes[0].plot(x, y, fmt)
        self.config_axes()
        display.display(self.fig)
        display.clear_output(wait=True)
```

```python
def train_ch3(net,train_iter,test_iter,loss,num_epoches,updater):
	animator = Animator(xlabel='epoch',xlim=[1,num_epoches],ylim=[0.3,0.9]),legned=['train loss','train acc','test acc']
	for epoch in range(num_epoches):
		train_metrics = train_epoch_ch3(net,train_iter,loss,updater)
		test_axx = evaluate_accuracy(net,test_iter)
		animator.add(epoch+1,train_metrics+(test_acc,))
	train_loss,train_acc = train_metrics
	assert train_loss <0.5,train_loss
	assert train_acc <=1 and train_acc>0.7,train_acc
	assert test_acc <=1 and test_acc>0.7,test_acc
```
```python
lr = 0.1
def updater(batch_size):
	return d2l.sgd([W,b],lr,batch_size)
```
```python
num_epoches = 10
train_ch3(net,train_iter,test_iter,cross_entropy,num_epoches,updater)
```
### 预测
```python
def predict_ch3(net,test_iter,n=6):
	for X,y in test_iter:
		break
	trues = d2l.get_fashion_mnist_labels(y)
	preds = d2l.get_fashion_mnist_labels(net(X.argmax(axis=1)))
	titles = [true +'\n'+pred for true,pred in zip(trues,preds)]
	d2l.show_images(X[0:n].reshape((n,28,28)),1,n,titles=titles[0:n])
	
predict_ch3(net,test_iter)
```
## Practice

1.  本节直接实现了基于数学定义softmax运算的`softmax`函数。这可能会导致什么问题？提示：尝试计算$\exp(50)$的大小。
    
2.  本节中的函数`cross_entropy`是根据交叉熵损失函数的定义实现的。它可能有什么问题？提示：考虑对数的定义域。
    
3.  请想一个解决方案来解决上述两个问题。
    
4.  返回概率最大的分类标签总是最优解吗？例如，医疗诊断场景下可以这样做吗？
    
5.  假设我们使用softmax回归来预测下一个单词，可选取的单词数目过多可能会带来哪些问题?

## softmax的Pytorch实现

通过pytorch框架的高级api实现会容易很多 我们继续使用fashion-mnist数据集
```python
import torch
from torhc import nn
from d2l import torch as d2l

batch_size = 256
train_iter,test_iter = d2l.load_data_fashion_mnist(batch_size)
```
### 初始化模型参数

softmax回归的输出层是一个全连接层。 因此，为了实现我们的模型， 我们只需在`Sequential`中添加一个带有10个输出的全连接层。 同样，在这里`Sequential`并不是必要的， 但它是实现深度模型的基础。 我们仍然以均值0和标准差0.01随机初始化权重。
```python
net = nn.Sequential(nn.Flattem(),nn.Linear(784,10))

def init_weights(m):
	if type(m) == nn.Linear:
		nn.init.normal_(m.weight,std=0.01)
net.apply(init_weights)
```
### 重新审视Softmax的实现
softmax函数$\hat y_j = \frac{\exp(o_j)}{\sum_k \exp(o_k)}$， 其中$\hat y_j$是预测的概率分布。 $o_j$是未规范化的预测$\mathbf{o}$的第$j$个元素。如果$o_k$中的一些数值非常大， 那么$\exp(o_k)$可能大于数据类型容许的最大数字，即**上溢（overflow）**。这将使分母或分子变为`inf`（无穷大）， 最后得到的是0、`inf`或`nan`（不是数字）的$\hat y_j$。

解决这个问题的一个技巧是： 在继续softmax计算之前，先从所有$o_k$中减去$\max(o_k)$。 这里可以看到每个$o_k$按常数进行的移动不会改变softmax的返回值：

$$
\begin{align}
\hat y_{j}&=\frac{\exp(o_{j})}{\sum_{k}exp(o_{k})}\\
&=\frac{\exp(o_{j}+max(o_{k})-max(o_{k}))}{\sum_{k}exp(o_{k}+max(o_{k})-max(o_{k}))}\\
& =  \frac{\exp(o_j - \max(o_k))\exp(\max(o_k))}{\sum_k \exp(o_k - \max(o_k))\exp(\max(o_k))} \\
& = \frac{\exp(o_j - \max(o_k))}{\sum_k \exp(o_k - \max(o_k))}.
\end{align}
$$
在减法和规范化步骤之后，可能有些$o_j - \max(o_k)$具有较大的负值。 由于精度受限，$\exp(o_j - \max(o_k))$将有接近零的值，即_下溢_（underflow）。 这些值可能会四舍五入为零，使$\hat y_j$为零， 并且使得$\log(\hat y_j)$的值为`-inf`。 反向传播几步后，我们可能会发现自己面对一屏幕可怕的`nan`结果。
尽管我们要计算指数函数，但我们最终在计算交叉熵损失时会取它们的对数。 通过将softmax和交叉熵结合在一起，可以避免反向传播过程中可能会困扰我们的数值稳定性问题。 如下面的等式所示，我们避免计算$\exp(o_j - \max(o_k))$， 而可以直接使用$o_j - \max(o_k)$，因为$\log(\exp(\cdot))$被抵消了。
$$
\begin{align}
log(\hat y_{j})&=log(\frac{exp(o_{j}-max(o_{k}))}{\sum_{k}exp(o_{j}-max(o_{k})}\\
&=log(exp(o_{j}-max(o_{k})))-log(\sum_{k}o_{k}-max(o_{k}))\\
&=o_{j}-max(o_{k})-log(\sum_{k}o_{k}-max(o_{k}))
\end{align}
$$
我们没有将softmax概率传递到损失函数中，而是在交叉熵损失函数中传递为规范的预测，并同时计算sofftmax机器对数，这是一种类似于**logsumexp**技巧的聪明方式
```python
loss = nn.CrossEntropyLoss(reduction='none')
```
```python
num_epoches=10
d2l.train_ch3(net,train_iter,test_iter,loss,num_epoches,trainer)
```
### Practice:

1.  尝试调整超参数，例如批量大小、迭代周期数和学习率，并查看结果。
    
2.  增加迭代周期的数量。为什么测试精度会在一段时间后降低？我们怎么解决这个问题？
