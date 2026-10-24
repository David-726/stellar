---
title: 马尔可夫决策过程
published: '2026-09-21'
description: ''
tags:
  - easyRL
draft: false
---
## Markov过程
### Markov Propety
一个随机过程再给定现在状态及所有过去状态下,未来的状态条件概率仅依赖于当前状态。
$X_0,X_1,...,X_t$构成了随机过程,这些随机过程的可能取值的集合称之为**状态空间**
$$
p(X_{t+1}=x_{t+1}|X_{0:t}=x_{0:t})=p(X_{t+1}=x_{t+1}|X_t=x_t)
$$
->if一个过程满足马尔科夫性质,则未来的转移和过去的是独立的,只取决于现在.
### 马尔科夫链
$$
p(s_{t+1}|s_t)=p(s_{t+1}|h_t)
$$
其中$h(t)={s_1,s_2,...,s_t}$,离散时间的马尔可夫过程也可称之为马尔科夫链
**状态转移矩阵**:
$$
P=\begin{pmatrix}
p(s_1|s_1)&p(s_2|s_1)&\cdots&p(s_N|s_1)\\
p(s_1|s_2)&p(s_2|s_2)&\cdots&p(s_N|s_2)\\
\vdots&\vdots&\ddots&\vdots\\
p(s_1|s_N)&p(s_2|s_N)&\cdots&p(s_N|s_N)
\end{pmatrix}
$$
## 马尔可夫奖励过程
Markov reward process(MRP) 是马尔科夫链加上奖励函数。
#### 回报与价值函数
Def:
**horizon**:一个回合的长度(每个回合最大的时间步数)
**return**:定义为奖励的累加
时间$t$后的奖励序列为$r_{t+1},r_{t+2},r_{t+3}$则回报为:
$$
G_t=r_{t+1}+\gamma*r_{t+2}+\gamma^2*r_{t+3}+\gamma^3*r_{t+4}+\cdots+\gamma^{T-t-1}r_{T}
$$
其中$T$是最终时刻,$\gamma$是折扣因子,越往后的奖励,折扣越多->**我们更希望现在的奖励**
对于Markov奖励过程,状态价值函数被定义为回报的期望:
$$
V^t(s)=\mathbb{E}[G_t|s_t=s]\\=\mathbb{E}[r_{t+1}+\gamma \, r_{t+2}+\gamma^2\,r_{t+3}+\cdots+\gamma^{T-t-1}\,r_{T}|s_t=s]
$$
使用$\gamma$的原因:
- 有些马尔可夫过程是带环的,我们想要避免无穷的奖励
- 不能完全信任模型,由于这种不确定性,对未来的评估增加一个折扣
- 我们更希望立刻得到奖励
$\gamma$常常作为一个超参数来进行调整,通过调整折扣因子,可以得到不同的智能体
#### 贝尔曼方程
从价值函数中推导的来**贝尔曼方程**:
$$
V(s)=R(s)+\gamma\,\sum_{s'\in S}p(s'|s)V(s')
$$
其中$R(s)$是即时奖励,$p(s'|s)$是指当前状态转移到未来状态的概率,$V(s')$代表的是未来某一个状态的价值
后半部分可以看作未来奖励的这空综合(disscount sum of future reward)
##### 全期望公式
**law of total expectation**:
$$
\mathbb{E}[V(s_{t+1}|s_t)]=\mathbb{E}[\mathbb{E}[G_{t+1}|s_{t+1}]|s_t]=\mathbb{E}[G_{t+1}|s_t]
$$
如果$A_i$是样本空间的有限的划分:
$$
\mathbb{E}[X]=\sum_{i}\mathbb{E}[X|A_i]p(A_i)
$$
令$s=s_t$,$g'=G_{t+1}$,$s'=s_{t+1}$,根据期望的定义:
$$
\mathbb{E}[G_{t+1}|s_{t+1}]=\mathbb{E}[g'|s']=\sum_{g'}g'p(g'|s')
$$
令$s_t=s$
对上市求期望有:
$$
\begin{align}
\mathbb{E}[\mathbb{E}[G_{t+1}|s_{t+1}]|s_t]&=\mathbb{E}[\mathbb{E}(g'|s')|s]\\
&=\mathbb{E}[\sum_{g'}g'p(g'|s')|s]\\
&=\sum_{s'}\sum_{g'}g'p(g'|s',s)p(s'|s)\\
&=\sum_{s'}\sum_{g'}\frac{g'p(g'|s',s)p(s'|s)p(s)}{p(s)}\\
&=\sum_{s'}\sum_{g'}\frac{g'p(g'|s',s)p(s',s)}{p(s)}\\
&=\sum_{g'}\sum_{s'}\frac{g'p(g',s',s)}{p(s)}\\
&=\sum_{g'}\sum_{s'}g'p(g',s'|s)\\
&=\sum_{g'}g'(g'|s)\\
&=\mathbb{E}[g'|s]\\
&=\mathbb{E}[G_{t+1}|s_t]
\end{align}
$$
#### 贝尔曼方程推导
$$
\begin{align}
V(s)&=\mathbb{E}[G_t|s_t=s]\\
&=\mathbb{E}[r_{t+1}+\gamma\,r_{t+2}+\gamma^2\,r_{t+3}+\cdots|s_t=s]\\
&=\mathbb{E}[r_{t+1}|s_t=s]+\gamma\mathbb{E}[\gamma\,r_{t+2}+\gamma^2\,r_{t+3}+\cdots|s_t=s]\\
&=R(s)+\gamma\,\mathbb{E}[G_{t+1}|s_t=s]\\
&=R(s)+\gamma\,\mathbb{E}[{V(s_{t+1})|s_t=s}]\\
&=R(s)+\gamma\,\sum_{s' \in S}p(s'|s)V(s')
\end{align}
$$
表示当前状态和未来状态的迭代过程->当前状态的Value可以由未来状态的Value决定和计算,也称之为动态规划过程
$$
V(s)=R(s)+\gamma\,\sum_{s'\in S}p(s'|s)V(s')
$$
定义为矩阵的形式:
$$
\begin{pmatrix}
V(s_1)\\
V(s_2)\\
\vdots\\
V(s_N)
\end{pmatrix}=
\begin{pmatrix}
R(s_1)\\
R(s_2)\\
\vdots\\
R(s_N)
\end{pmatrix}
+\gamma
\begin{pmatrix}
p(s_1|s_1)&p(s_2|s_1)&\cdots&p(s_N|s_1)\\
p(s_1|s_2)&p(s_2|s_2)&\cdots&p(s_N|s_2)\\
\vdots&\vdots&\ddots&\vdots\\
p(s_N|s_1)&p(s_N|s_2)&\cdots&p(s_N|s_N)
\end{pmatrix}
\,
\begin{pmatrix}
V(s_1)\\
V(s_2)\\
\vdots\\
V(s_N)
\end{pmatrix}
$$

$$
\begin{align}
\mathbf{V}&=\mathbf{R}+\gamma\,\mathbf{P}\mathbf{V}\\
\mathbf{I}\mathbf{V}&=\mathbf{R}+\gamma\,\mathbf{P}\mathbf{V}\\
(\mathbf{I}-\gamma\,\mathbf{P})\,\mathbf{V}&=\mathbf{R}\\
\mathbf{V}&=(\mathbf{I}-\gamma\,\mathbf{P})^{-1}\,\mathbf{R}
\end{align}
$$
得到解析解
#### 计算马尔可夫奖励的迭代算法
可以将迭代的方法应用于状态非常多的马尔可夫奖励过程(large MRP),**时序差分学习(temporal-difference learning,TD learning)**
>什么是蒙特马利方法
```
                 ______
              .-"      "-.
             /            \
            |              |
            |,  .-.  .-.  ,|
            | )(_o/  \o_)( |
            |/     /\     \|
  (@_       (_     ^^     _)
   _) \__  \__|IIIIII|__/__
  (_   \  \|  |IIIIII|  |   \
  /    /  /|  |IIIIII|  |    \
 (@_  /  /  \  \ IIII /  /     \
    \/  /    \  \____/  /       \
     \_/      \________/         \
      |        |      |           \
      |        |      |            \
      |________|______|_____________\
     /|        |      |             |\
    / |        |      |             | \
   /  |________|______|_____________|  \
  /_____________________________________\
  |  |    |    |    |    |    |    |    |
  |__|____|____|____|____|____|____|____|
```
先放一个骷髅占沙发

## 马尔可夫决策过程
马尔可夫决策过程满足:
$$
p(s_{t+1}|s_t,a_t)=p(s_{t+1}|h_t,a_t)
$$
对于奖励函数而言,多了一个当前的动作:$R(s_t=s,a_t=a)=\mathbb{E}[r_t=s,a_t=a]$
### 马尔可夫决策过程中的策略:
定义了某一个状态应该采取的动作,知道当前状态后,可以把当前状态带入策略函数得到一个概率:
$\pi(a|s)=p(a_t=a|s_t=s)$
在马尔可夫决策过程中,状态转移函数$P(s'|s)$基于当前的状态以及它当前的状态以及它当前的动作。
在已知在每一个状态中,可能采取的动作的概率,所以我们就可以直接把动作进行加和,去掉$a$：
$$P_{\pi}(s'|s)=\sum_{a \in A}\pi(a|s)p(s'|s,a)$$
对于奖励函数,同样也可以将动作去掉:
$$
r_{\pi}(s)=\sum_{a \in A}\pi(a|s)R(s,a)
$$
### 马尔可夫决策过程和马尔可夫奖励过程的区别
多了一个对于动作的选择性
### 马尔可夫过程中的价值函数
马尔可夫决策过程中的价值函数Def:
$$
V_{\pi}(s)=\mathbb{E}_{\pi}[G_t|s_t=s]
$$
另外引入一个**Q函数(Q-function)**,Q函数也被称之为**动作价值函数(action-value function)**,定义的是在某一个状态采取一个动作,有可能得到的回报的一个期望:
$$
Q_{\pi}(s,a)=\mathbb{E}_{\pi}[G_t|s_t=s,a_t=a]
$$
So woget:
$$
V_{\pi}(s)=\sum_{a \in A}\pi(a|s)Q_{\pi}(s,a)
$$
对Q函数的贝尔曼方程的推导:
$$
\begin{align}
Q(s,a)&=\mathbb{E}[G_t|s_t=s,a_t=a]\\
&=\mathbb{E}[r_{t+1}+\gamma\,r_{t+2}+\gamma^2\,r_{t+3}\,+\cdots|s_t=s,a_t=a]\\
&=\mathbb{E}[r_{t+1}|s_t=s,a_t=a]+\gamma\,\mathbb{E}{r_{t+2}+\gamma\,r_{t+3}+\cdots}\\
&=R(s,a)+\gamma\,\mathbb{E}[G_{t+1}|s_t=s,a_t=a]\\
&=R(s,a)+\gamma\,\mathbb{E}[V_{s+1}|s_t=s,a_t=s]\\
&=R(s,a)+\gamma\,\sum_{s'\in S}p(s'|s,a)V(s')
\end{align}
$$
### 贝尔曼期望方程:
将状态价值函数和Q函数拆分成2个部分:
即使奖励和后续状态的折扣价值(discounted value of successor state)
**Bellman expection equation**:
$$
V_{\pi}(s)=\mathbb{E}_{\pi}[r_{t+1}+\gamma\,V_{\pi}(s_{t+1})|s_t=s]
$$
对Q函数进行分解:
$$
Q_{\pi}(s,a)=\mathbb{E}[r_{t=1}+\gamma\,Q_{\pi}(s_{t+1},a_{t+1})|s_t=s,a_t=a]
$$
进一步进行简单的分解:
$$
V_{\pi}(s)=\sum_{a \in A}\pi(a|s)Q_{\pi}(s,a)
$$
又有:
$$
Q_{\pi}(s,a)=R(s,a)+\gamma\,\sum_{s'\in S}p(s'|s,a)V_{\pi}(s')
$$
得:
$$
V_{\pi}(s)=\sum_{a \in A}\pi(a|s)[R(s,a)+\gamma\,\sum_{s' \in S}p(s'|s,a)V_{\pi}(s')]
$$
或者:
$$
Q_{pi}(s,a)=R(s,a)+\gamma\,\sum_{s'\in S}p(s'|s,a)\sum_{a\in A}\pi(a'|s')Q_{\pi}(s',a')
$$
### 备份图
**backup**
...
### 策略评估:
已知马尔可夫决策过程以及要采取的策略$\pi$,计算价值函数$V_{\pi}(s)$的过程就是**策略评估**
可以直接通过贝尔曼方程来得到价值函数:
$$
V_{\pi}^{k}(s)=r(s,\pi(s))+\gamma\,\sum_{s'\in S}p(s'|s,\pi(s))V_{\pi}^{k-1}(s')
$$
通过NNNN次迭代,价值函数最终会收敛,收敛之后,价值函数的值就是每一个状态的价值:
如果折扣因子是$\gamma=0.5$
根据
$$
V_{\pi}^{t}(s)=\sum_{a}p(\pi(s)=a)(r(s,a)+\gamma\,\sum_{s'\in S}p(s'|s,a)V_{\pi}^{t-1}(s'))
$$
对$V(s')$赋一个初值,接着将$V(s')$代入贝尔曼期望方程里进行迭代,就可以得到状态价值
### 预测和控制
prediction & control是马尔可夫过程中的核心问题:
prediction:输入马尔可夫决策过程中的$<S,A,P,R,\gamma>$，输出是价值函数$V_{\pi}$
control:输入是马尔科夫决策过程中$<S,A,P,R,\gamma>$,输出是最佳价值函数(optiomal value function)$V^{*}$和最佳策略(optimal policy)$\pi^{*}$
二者的区别:
prediction是给定一个policy,计算它的价值函数;而control是在没有policy的前提下,我们要确定最佳的价值函数和对应的策略方案

### 动态规划:
**dynamic programming** **DP**
最适合解决**最优子结构**(optimal substrance)和**重叠子问题**(overlapping subproblem)
贝尔曼方程中,我们将马尔可夫决策分解为了递归的结构,当我们把它分解为递归的结构时,动态规划应用于马尔可夫决策过程的规划问题而不是学习问题,**必须对环境是完全已知的,才能做动态规划**,也就是要知道状态转移概率和对应的奖励
### 马尔可夫决策过程中的策略评估
直接把 Bellman expection backup,变成迭代的过程,反复迭代直至收敛
我们可以把贝尔曼期望备份转换成动态规划的迭代:
当我们得到上一时刻的$V_t$的时候,就可以通过递推的关系推出下一时刻的值,反复迭代,最后$V$的值就是从$V_1$、$V_2$到最后收敛之后的值$V_{\pi}$,$V_{\pi}$就是当前给定的策略$\pi$对应的价值函数:
$$
V_{t+1}(s)=\sum_{a\in A}\pi(a|s)(R(s,a)+\gamma\sum_{s'\in S}p(s'|s,a)V^{t}(s'))
$$
将上式NNNNN次狠狠的迭代,直至收敛
因为policy已知,将它简化为一个马尔可夫奖励过程的表达式:
$$
V_{t+1}(s)=r_{\pi}(s)+\gamma\,P_{\pi}(s'|s)V_t(s')
$$
1个动态的例子:
<https://cs.stanford.edu/people/karpathy/reinforcejs/gridworld_dp.html>
```
  🐱         🐱
    🐱     🐱
      🐱🐱🐱
    🐱  👁️  👁️  🐱
    🐱    👃    🐱
      🐱  👄  🐱
        🐱🐱🐱
    脑吃VS古振兴
```
#### 马尔可夫决策过程控制
最佳价值函数的定义:
$$
V^{*}(s)=max_{\pi}V_{\pi}(s)
$$
指的是搜索1中策略$\pi$让价值函数取得最大值,取得最佳价值函数之后,可以通过对Q函数进行最大化来得到最佳策略:
$$
\pi^{*}(s)=\begin{cases}
1,a=argmax_{a\in A}Q^{*}(s,a)\\
0,others
\end{cases}
$$
Q函数收敛后,由于是关于状态和动作的函数,所以如果能够在某个状态采取某个动作,就可以使得Q函数最大化,那么这个动作就是最佳的动作.
>Q:怎样进行策略搜索:
- 穷举
- 寻找最佳策略的过程就是马尔可夫决策过程的控制过程:
  $$\pi^{*}(s)=argmax_{\pi}V_{\pi}(s)$$
*最佳策略不一定是唯一的,多种策略可能会得到同样的价值*

#### 策略迭代
策略迭代的组成:
- 策略评估
- 策略改进
策略评估:给定当前策略来估计状态价值函数$V(s)$
策略改进:得到状态价值函数之后,进一步推算出$Q$函数->对$Q$函数做最大化处理->贪心算法仅以改进策略
2个过程交替迭代进行,直至收敛;
对于策略改进而言:
$$
Q_(s,a)=R(s,a)+\gamma\,\sum_{s'\in S}p(s'|s,a)V_{\pi_{i}}(s,a)
$$
对每个状态曲致使它取得最大值的策略:
$$\pi_{i+1}(s)=argmax_{a}Q_{\pi_{i}}(s,a)$$
我们可以吧Q函数视作一个Q表格
这就是大名鼎鼎的**Q-table**：
横轴是它的所有状态,纵轴是它的可能的动作;
```
------Q-Table------
--->--State--->---- |
------------------- |
| | | | | | | | | | |
------------------- action
| | | | | | | | | | |
------------------- |
| | | | | | | | | | |
```
对于某一个状态,每一列中我们取最大值,最大值采取的动作就是现在应该采取的动作
#### 贝尔曼最优方程:
我们一直采取$argmax$的策略,我们会得到1个单调的递增,通过采取这种贪心操作,我们就会得到更好的或者不变的策略,而不会使得价值函数$V(s)$变差。
当停止改进那一个刻：
$$
Q_{\pi}(s,\pi'(s))=max_{a\in A}Q_{\pi}(s,a)=Q_{\pi}(s,\pi(s))=V_{\pi}(s)
$$
从而得到**贝尔曼最优方程**（Bellman optimality equation)
$$V_{\pi}(s)=max_{a\in A}Q_{\pi}(s,a)$$
表明:最佳策略下的一个状态的价值必须等于在这个状态下采取最好行动得到的回报的期望
得到最佳的价值函数时,贝尔曼方程已达到最佳状态,满足了Bellman最优方程:
$$
V^{*}(s)=max_{s\in A}Q_{\pi}(s,a)
$$
满足Bellman最优方程之后,我们可以采取最优化操作:
又有:
$$
Q^{*}(s,a)=R(s,a)+\gamma\,\sum_{s'\in S}p(s'|a)V^{*}(s,a)
$$
Soweget:
$$
\begin{align}
Q^{*}(s,a)&=R(s,a)+\gamma\,\sum_{s'\in S}p(s'|a)max_{s\in A}Q^{*}(s,a)\\
\end{align}
$$
带入上式:
$$
\begin{align}
V^{*}(s)&=max_{a}Q^{*}(s,a)\\
&=max_{a\in A}\mathbb{E}[G_t|s_t=s,a_t=a]\\
&=max_{a}\mathbb{E}[r_{t+1}+\gamma\,G_{t+1}|s_t=s,a_t=a]\\
&=max_{a}\mathbb{E}[r_{t+1}+\gamma\,V^{*}(s_{t+1})|s_t=s,a_t=a]\\
&=max_{a}\mathbb{E}[r_{t+1}]+max_{a}\mathbb{E}[\gamma\,V^{*}(s_{t+1})|s_t=s,a_t=a]\\
&=max_{a}R(s,a)+max_{a}\gamma\,\sum_{s'\in S}p(s'|s,a)V^{*}(s')\\
&=max_{a}(R(s,a)+\gamma\,\sum_{s'\in S}p(s'|s,a)V^{*}(s'))
\end{align}
$$
从而得状态价值函数的转移

### 价值迭代
#### 最优性原理
**principle of optimality theorem**:1个策略在$\pi(a|s)$在状态$s$达到了最优价值,也就是$V_{\pi}(s)=V^{*}(s)$成立,都已经达到了最佳价值;对于所有的$s'$,$V_{\pi}(s')=V^{*}(s)$恒成立；
#### 确定性价值迭代:
我们已经确定了最优解$V^{*}(s)$,就可以通过最优解迭代来得到最优的$V^{*}(s)$的解,价值迭代就是将Bellman方程当作一个确定的规则来执行:
$$V(s)<-\,max_{a\in A}(R(s,a)+\gamma\,\sum_{s'\in S}p(s'|s,a)V(s'))
$$
#### 价值迭代算法:
- 初始化:k=1,对于所有状态$V_{o}(s)=0$
- 对于k=1:H
	- 对于所有状态s
		$$
		\begin{align}
		Q_{k+1}(s,a)&=R(s,a)+\gamma\,\sum_{s'\in S}p(s'|s,a)V_{k}(s')\\
		V_{k+1}(s)&=max_{a}Q_{k+1}(s,a)
		\end{align}
	  $$
	- k<-k+1
- 在迭代之后获得最佳策略:
	$$
	\pi(s)=argmax_{a}[R(s,a)+\gamma\sum_{s'\in S}p(s'|a)V_{H+1}(s')]
	$$
价值迭代做的是1个类似于反向传播的作用,每次迭代做一次传播,中间过程的策略和价值函数是没有作用的

继续进行前面提到的格子实验:
来体会策略迭代和价值迭代的区别










