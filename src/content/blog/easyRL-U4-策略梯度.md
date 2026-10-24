---
title: 策略梯度
published: '2026-10-04'
description: ''
tags:
  - easyRL
draft: false
---
### 策略梯度算法
RL有3个重要的组成部分,**演员,环境和奖励函数**,对于AlphaGo而言演员就是Alphago,决定落子的位置,环境就是对手,奖励函数就是围棋规则。
在Rl当中,环境和奖励函数是不可控的,我们唯一需要做的是调整演员的策略,使得演员能够得到最大的奖励——演员中的策略决定了演员的动作,即给定一个输入,输出演员现在能够执行的动作
对于策略$\pi$,假如我们用深度学习来做强化学习,$\pi$就是神经网络,常用$\theta$代表$\pi$的参数,策略是1个网络,输入是游戏画面,输出是我们要执行的动作,可以简化为一个多分类问题,有几个动作,输出层就有几个神经元,输出层输出各个动作的执行概率。
环境决定游戏的结束。
将一场游戏称之为一个回合,对于蒙特卡洛而言,需要等到一个回合结束之后才能计算,将这一回合的所有得到的奖励都加起来就是**总奖励(total reward)**,我们用$R$表示,演员需要最大化它可以得到的奖励
环境是一个函数,可能是神经网络的,也可能是rule-based的,环境一开始吐出一个状态$s_1$,接下来演员看到状态$s_1$之后,吐出动作$a_1$,环境将$a_1$作为输入,再吐出$s_2$,...,不断迭代的过程,直到环境决定需要停止的时候。
一场游戏中,将所有状态和动作组合起来,就是一个轨迹,即$$\tau=\{s_1,a_1,s_2,a_2,\cdots,s_t,a_t\}$$
给定演员的参数$\theta$,我们可以计算某个轨迹$\tau$发生的概率:
$$p_{\theta}(\tau)=p(s_1)p_{\theta}(a_1|s_1)p(s_2|s_1)p_{\theta}(a_2|s_2)p(s_3|s_2,a_2)\cdots=p(s_1)\prod_{t=1}^Tp_{\theta}(a_t|s_t)p(s_{t+1}|s_t,a_t)$$
$p(s_{t+1}|s_t,a_t)$代表环境,我们能控制的是$p_{\theta}(a_t|s_t)$,给定$s_t$,采取的动作$a_t$取决于参数$\theta$.
对于一个回合中,将轨迹中所有的奖励加起来得到了$R(\tau)$,代表1个轨迹$\tau$的奖励.
我们需要做的是调整$\theta$,使$R(\tau)$越大越好,但是实际上$R(\tau)$是一个随机变量,能够计算的是$R(\tau)$的期望值,给定一组参数$\theta$,可以计算$r_{\theta}$的期望值为:
$$\hat R_{\theta}=\sum_{\tau}R(\tau)p_{\theta}(\tau)$$
穷举所有可能的轨迹$\tau$,每一个轨迹$\tau$都有一个概率,根据$\theta$算出某一个轨迹$\tau$出现的概率,接下来计算$\tau$的总奖励,总奖励使用$\tau$出现的概率进行加权,对所有的$\tau$进行求和,就是期望值:$$\hat R_{\theta}=\sum_{\tau}R(\tau)p_{\theta}(\theta)=\mathbb{E}_{r\sim p_{\theta}(\tau)}[R(\tau)]$$
从分布$p_{\theta}(\tau)$采样1个轨迹$\tau$,计算$R(\tau)$的轨迹,就是期望奖励(expected reward),最大化期望奖励,采用**梯度上升**(gradient ascent)来最大化期望奖励,先对$\hat R_{\theta}$计算梯度,$$\nabla \hat R_{\theta}=\sum_{\tau}R(\tau)\nabla p_{\theta}(\tau)$$
只有$\nabla p_{\theta}(\tau)$与$\theta$有关,由$\nabla f(x)=f(x)\nabla logf(x)$得:
$$\frac{\nabla p_{\theta}(\tau)}{p_{\theta(\tau)}}=\nabla\,log\,p_{\theta}(\tau)$$
$$
\begin{align}
\nabla \hat R_{\theta}&=\sum_{\tau}R(\tau)\nabla p_{\theta}(\tau)\\
&=\sum_{\tau}R(\tau)p_{\theta}(\tau)\frac{\nabla p_{\theta}(\tau)}{p_{\theta}(\tau)}\\
&=\sum_{\tau}R(\tau)p_{\theta}(\tau)\nabla\,log\,p_{\theta}(\tau)\\
&=\mathbb{E}_{\tau\sim p_{\theta}(\tau)}[R_{\tau}\nabla\,log\,p_{\theta}(\tau)]
\end{align}
$$
实际上这个连续的期望无法计算,我们需要将其离散采样后取均值:
$$
\begin{align}
\mathbb{E}_{\tau\sim p_{\theta}(\tau)}[R_{\tau}\nabla\,log\,p_{\theta}(\tau)]&=\frac{1}{N}\sum_{n=1}^NR(\tau^n)\nabla log\,p_{\theta}(\tau^n)\\
&=\frac{1}{N}\sum_{n=1}^N\sum_{t=1}^{T_n}R(\tau^n)\nabla\,log\,p_{\theta}(a_t^n|s_t^n)
\end{align}
$$
又因为
$$p_{\theta}(\tau)=p(s_1)\prod_{t=1}^Tp_{\theta}(a_t|s_t)p(s_{t+1}|s_t,a_t)$$
有

$$
\begin{align}
\nabla\,log\,p_{\theta}(\tau)&=\nabla(log\,p(s_1)+\sum_{t=1}^Tlog\,p_{\theta}(a_t|s_t)+\sum_{t=1}^Tlog\,p(s_{t+1}|s_t,a_t))\\
&=\nabla\sum_{t=1}^Tlog\,p_{\theta}(a_t|s_t)\\
&=\sum_{t=1}^T\nabla log\,p_{\theta}(a_t|s_t)
\end{align}
$$
上式中$log\,p(s_1)$和$log(s_{t+1}|s_t,a_t)$由环境决定,和$\theta$无关,因此求梯度为0；
$$
\begin{align}
\nabla \hat R_{\theta}
&=\mathbb{E}_{\tau\sim p_{\theta}(\tau)}[R_{\tau}\nabla\,log\,p_{\theta}(\tau)]\\
&=\frac{1}{N}\sum_{n=1}^NR(\tau^n)\nabla log\,p_{\theta}(\tau^n)\\
&=\frac{1}{N}\sum_{n=1}^N\sum_{t=1}^{T_n}R(\tau^n)\nabla log\,p_{\theta}(a_t^n|s_t^n)
\end{align}
$$

在我们采样得到的数据当中,采样到在某一个状态$s_t$要执行某一个动作$a_t$,$(s_t,a_t)$是整个轨迹$\tau$的里面某一个状态的对,假设我们在$s_t$执行$a_t$,最后发现$\tau$的奖励是正的,那就增加在$s_t$执行$a_t$的概率,反之则减小:
**梯度上升**:
$$\theta\leftarrow\theta+\eta\nabla\hat R_{\theta}$$
用参数为$\theta$的的agent和环境交互,也就是拿已经训练过的agent和环境交互,交互完之后,就可以得到大量的游戏的数据,记录每一回合得到的轨迹$\tau$和得到的奖励$R(\tau)$
将每一局采集到的数据带入:
$$\nabla\hat R_{\theta}=\frac{1}{N}\sum_{n=1}^N\sum_{t=1}^{T_n}R(\tau^n)\nabla log\,p_{\theta}(a_t^n|s_t^n)$$
然后梯度上升更新参数,随后就在更新模型和数据采样之间迭代。
一般策略梯度(**policy gradient,PG**)采样的数据只会用1次,采样过的数据在更新参数之后就会丢掉重新采样。
将RL看作1个多分类问题时,在一般的分类问题中,我们在实现分类的时候,目标函数都会写成最小化交叉熵(cross entropy),最小化交叉熵就是最大化对数似然,目标函数就是最大化或者最小化的对象,因为我们现在是最大大话似然,所以需要最大化:$$\frac{1}{N}\sum_{n=1}^N\sum_{t=1}^{T_n}\,p_{\theta}(a_t^n|s_t^n)$$
对于RL问题,就是在一般的分类问题的损失前面乘上一个权重,整局游戏得到的总奖励$R(\tau)$,而不是在状态$s$z做出动作$a$的阶段奖励:$$\frac{1}{N}\sum_{n=1}^N\sum_{t=1}^{T_n}R(\tau^n)\,logp_{\theta}(a_t^n|s_t^n)$$
对于每一回合的每一笔训练数据都加上$R(\tau^n)$加权
### 策略梯度实现技巧
#### 技巧1:添加基线
添加baseline,$$\nabla\hat R_{\theta}=\frac{1}{N}\sum_{n=1}^N\sum_{t=1}^{T_n}R(\tau^n)\nabla log\,p_{\theta}(a_t^n|s_t^n)$$,我们总想着如果哪一步得到的奖励高,那么该步的概率就提高,也就是希望乘以的权重就更高,但是这是一个理想的情况,实际上我们采样应该是一个期望,对一个轨迹中所有的$a$和$s$进行加和后求平均,但是因为是采样,所以只采集到了少量的$s$和$a$,以动作$a,b,c$为例,假如三者都是好动作奖励都很正点,但是由于$a$没有被采样到,这下可完蛋了,$b,c$的概率就会提高,$a$的概率就会下降,但是这样却不是合理的,这就是问题之所在
解决方法:我们可以将奖励减去$b$,即:$$\nabla\hat R_{\theta}=\frac{1}{N}\sum_{n=1}^N\sum_{t=1}^{T_n}(R(\tau)-b)\nabla log\,p_{\theta}(a_t^n|s_t^n)$$
其中,$b$称之为基线,通过这种方法就可以让$R(\tau)-b$有正有负了。但是$b$怎么设置呢?一般的有,$$b=E[R(\tau)]$$,所以需要在训练的时候不断的取$R(\tau)$的值,将这个均值作为$b$来使用
#### 技巧2:分配合适的分数
$$\nabla\hat R_{\theta}=\frac{1}{N}\sum_{n=1}^N\sum_{t=1}^{T_n}(R(\tau)-b)\nabla log\,p_{\theta}(a_t^n|s_t^n)$$，对于一局游戏当中,有一些动作是好的,但也有坏的,一律都减去这个$b$,这并不公平,若是整局游戏结果不好,并不代表每一步都不好,在采样次数不够多的情况下,我们需要给每一个状态-动作对分配合理的分数。
一种做法是:计算某一个$s-a$对的奖励时,不把整局游戏的奖励全部加起来,只计算这个动作执行之后得到的奖励,*因为这场游戏在执行这个动作发生之前的事情和执行这个动作没有关系,所以在执行这个动作之前的奖励都不算这个动作做出的贡献*,将执行完这个动作之后的奖励加起来,才算是这个动作的贡献,于是有:$$\nabla\hat R_{\theta}=\frac{1}{N}\sum_{n=1}^N\sum_{t=1}^{T_n}(\sum_{t'=t}^{T_n}r_{t'}^n-b)\nabla\,log\,p_{\theta}(a_t^n|s_t^n)$$,然后对未来的奖励做一个折扣,$$\nabla\hat R_{\theta}=\frac{1}{N}\sum_{n=1}^N\sum_{t=1}^{T_n}(\sum_{t'=t}^{T_n}\gamma^{(t'-t)}r_{t'}^n-b)\nabla\,log\,p_{\theta}(a_t^n|s_t^n)$$,依旧是老盆友$\gamma$折扣因子,嗯嗯。
### REINFORCE:蒙特卡洛策略梯度
蒙特卡洛方法可以理解为算法经过一个回合之后,再利用这个回合的数据去学习,做一次更新,因为我们已经获得了整个回合的数据,所以每一步的数据自然也获得了,计算每个步骤的未来回报$G_t$,代表我们从这个步骤往后,能够得到的奖励之和。
一个最经典的算法是**REINFORCE**:
先获取每个步骤的奖励,然后计算每个步骤的未来总奖励$G_t$:$$\nabla\hat R_{\theta}=\frac{1}{N}\sum_{n=1}^N\sum_{t=1}^{T_n}G_t^n\nabla\,log\pi_{\theta}(a_t^n|s_t^n)$$，优化每一个动作的输出,伪代码是:设计一个函数输入时每个步骤获取的奖励,输出是每一个步骤的未来总奖励:$$G_t=\sum_{k=t+1}^T\gamma^{k-t-1}r_k=r_{t+1}+G_{t+1}$$
我们总是从后向前一步步的推,从$G_T$算到$G_1$,**REINFORCE**的伪代码:
>input:可微调的参数$\pi(a|s,\theta)$
>para:步长$\alpha>0$
>初始化的策略:$\theta\in\mathbb{R}^{d'}$
>对每一个回合进行循环:
>	根据policy$\pi$生成$s_t,a_t,\cdots$
>	对每一个回合中的每一步进行循环,t=0,1,...,T-1:
>
> $$
> \begin{gather}
> G\leftarrow\sum_{k=t+1}^T\gamma^{k-t-1}r_k;\\
> \theta\leftarrow\theta+\alpha\gamma^tG\nabla log\pi(a_t|s_t,\theta)
> \end{gather}
> $$

```
one-hot node:嗯老朋友不做介绍
```
对于多分类问题,在监督学习的优化中,我们将输入传给神经网络后得到输出,输出各种分类的概率,再计算交叉熵,即该输入真实的标签$Y_i'$和输出$T_i$之间的crossentropy$-\sum Y_i'.log(Y_i)$,我们希望尽可能的减小crossentropyloss,计算出的交叉熵可以直接交给optimizer优化,然后进行para-update,这是一般的深度学习中简单的多分类问题的流程。
类似的,策略梯度预测每一个状态下应该需要输出的动作的概率,即输入概率$s_t$,输出$a_t$的概率,我们给动作one-hotnode,将神经网络的输出和实际的真实动作计算交叉熵。但是实际中的动作并不一定是正确的动作,我们没有标签来指导动作的正确与否,这个时候就乘以一个$G_t$,相当于对当前的真实动作的评价,于是我们有了$$-G_t\sum Y_i'.log(Y_i)$$
实际上计算策略梯度损失的时候,就是对实际执行的动作取独热编码,和预测的动作的概率,二者相乘,得到了$log\pi(a_t|s_t,\theta)$,这就是我们需要的损失,对于整个轨迹中的所有损失加起来,给Adam optimizer优化参数
<a href="/posts/assets/4f2169a8a92ea080-Drawing-2026-10-05-20.22.02.excalidraw.md" download>手绘图源文件：Drawing 2026-10-05 20.22.02.excalidraw</a>

首先我们
