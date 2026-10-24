---
title: 表格型方法
published: '2026-09-28'
description: ''
tags:
  - easyRL
draft: false
---
### Marcvo决策方法
强化学习是1个和时间序相关的序列决策问题;在输出每一个动作之前我们需要做出1个决策;我们用$p[s_{t+1},r_t|s_t,a_t]$来表示在状态$s_t$选择动作$a_t$时,转移到状态$s_{t+1}$,而且得到奖励$r_t$的概率是多少,状态转移概率是具有**马尔可夫性质**的。
再加上这个过程也取决于智能体和环境的交互的$a_t$,所以包含了决策的过程,我们称这样的过程为马尔可夫决策过程
(S,A,P,R)
#### 有模型
我们使用**概率函数**(probability function)$P[s_{t+1},r_t|s_t,a_t]$和奖励函数$R[s_t|a_t]$来描述环境,概率函数就是状态转移的概率,反应的是环境的随机性。
若我们一直概率函数和奖励函数,马尔可夫决策过程则是已知的,
通过策略迭代和价值迭代来找最佳的策略。
若我们知道状态转移函数和奖励函数,就可以任务这个环境是已知的,因为我们用这两个函数来描述环境
#### 免模型
很多强化学习的经典算法都是免模型的,环境未知
强化学习用价值函数$V(s)$表示状态是好的还是坏的,用Q函数来判断在什么状态下采取什么样子的动作能够取得最大奖励,即用Q函数来表示状态-动作值
### Q 表格
**Q表格**是一张已经训练好的表格;相当于一篇指南手册,强化学习的目标导向性很强.
用未来的奖励来评判当前动作的好坏;
但是把目标放的太长远并不好,如果task是一个没有尽头的持续任务,即**continuing task**,我们把未来的奖励全部相加就很不合理.
同前面所说的,引入折扣因子$\gamma$来计算未来奖励.

| state | up  | down | left | right |
| :---: | :-: | :--: | :--: | :---: |
| (1,1) |  0  |  0   |  0   |   0   |
| (1,2) |  0  |  0   |  0   |   0   |
| (1,3) |  0  |  0   |  0   |   0   |
| (1,4) |  0  |  0   |  0   |   0   |
| (1,5) |  0  |  0   |  0   |   0   |
| (1,6) |  0  |  0   |  0   |   0   |
最终我们需要求解的就是类似于上面的一张表格
**强化**是指我们用下一个状态的价值来更新当前状态的价值,就是强化学习里面自举的概念。
在强化学习里面,我们可以走一步更新一次Q表格,用下一个状态来更新当前状态的Q值,这种单步更新的方法被称之为时序差分方法;
### 免模型预测
#### 蒙特卡洛策略预测:
**蒙特卡洛**方法是基于采样的方法,给定策略$\pi$,让agent和环境进行交互,我们可以得到很多轨迹,每个轨迹都有对应的回报:
$$
G_t=r_{t+1}+\gamma\,r_{t+2}+\gamma^{2}r_{t+3}+\cdots
$$
求出所有轨迹回报的平均值,就知道某一个策略对应状态的价值,即:
$$
V_{\pi}(s)=\mathbb{E}_{r-\pi}[G_t|s_t=s]
$$
蒙特卡洛仿真指我们可以采样大量的轨迹,计算所有轨迹的真实回报,然后计算平均值。蒙特卡洛方法用经验平均回报(empirical mean return)的方法来估计,不需要马尔可夫决策过程的状态转移函数和奖励函数,并且不需要像动态规划那样用自举的方法‘
为了得到评估$V(s)$,我们采取了以下步骤:
- 在每个回合中,如果在时间步$t$状态$s$被访问,有:
	- 状态$s$的访问数$N(s)$增加1,$N(s)+1\rightarrow N(s)$
	- 状态$s$的总回报数$S(s)$增加$G_t$,$S(s)+G_t\rightarrow S(s)$
- 状态$s$的价值可以通过回报的平均来估计,即$V(s)=S(s)/N(s)$
根据大数定律,只要我们有足够多的轨迹,就可以趋近于这个策略对应的价值函数;$N(s)\rightarrow \infty$,有$V(s)\rightarrow V_{\pi}(s)$
假设现在有样本$x_1,x_2,\cdots,x_t$,可以把经验值(empirical mean)转换为增量均值(incremental mean)的形式:
$$
\begin{align}
\mu_{t}&=\frac{1}{t}\sum_{j=1}^{t}x_j\\
&=\frac{1}{t}(x_t+\sum_{j=1}^{t-1}x_j)\\
&=\frac{1}{t}(x_t+(t-1)\mu_{t-1})\\
&=\frac{1}{t}(x_t+t\mu_{t-1}-\mu_{t-1})\\
&=\mu_{t-1}+\frac{1}{t}(x_t-\mu_{t-1})
\end{align}
$$
从而将上一时刻的均值和现在时刻的均值建立联系;其中$x_t-\mu_{t-1}$是残差,$\frac{1}{t}$相当于lr,更新
将上面更新的方法称之为蒙特卡洛方法,我们采集数据,得到一个新的轨迹($s_1,a_1,r_1,\cdots,s_T$)，
soweget:
$$
\begin{gather}
N(s_t)\leftarrow N(s_t)+1 \\
V(s_t)\leftarrow V(s_t)+\frac{1}{N(s_t)}(G_t-V(s_t))
\end{gather}
$$
我们直接将$\frac{1}{N(s_t)}$换成$\alpha$(学习率),代表更新的速率

DP方法采用Bellman expecation backup,通过上一时刻的值$V_{i-1}(s')$来更新当前时刻的值$V_i(s)$,即:
$$
V_{i}(s)\leftarrow\sum_{a\in A}\pi(a|s)(R(s,a)+\gamma\,\sum_{s'\in S}P(s'|s,a)V_{i-1}(s'))
$$
不断进行迭代可以收敛;
蒙特卡洛方法则通过1个回合的经验平均回报来进行更新:即:
$$
V(s_t)\leftarrow V(s_t)+\alpha\,(G_{i,t}-V(s_t))
$$
优势在我:
- 蒙卡不需要环境信息,不需要$P(s'|s,a)$,此乃一生
- DP需要对$s'\in S$的完整信息进行枚举,对于状态大的,计算量灾难级别的,蒙卡则主需要按照采样轨迹来更新实际访问到的值,此乃二胜
- 二胜,此乃三胜
### 时序差分
巴普洛夫条件反射实验;
时序差分方法是介于MC和DP之间的方法,也是model-free的,不需要马尔可夫决策过程中的转移矩阵和奖励函数;时序差分方法还可以从不完整的回合进行学习,并且结合了自举的思想
接下来对时序差分方法进行总结,目的是对某个给定的策略$\pi$,在线的算出它的价值函数$V_{\pi}$,$step-by-step$，
- 一步差分方法**one-step TD**,即TD(0),每往前走一步,就做一次自举,用得到的估计回报(estimated return)$r_{t+1}+\gamma\,V(s_{t+1})$来更新上一时刻的值$V(s)$
	$$
	V(s_t)\leftarrow V(s_t)+\alpha\,(r_{t+1}+\gamma\,V(s_{t+1}-V(s_t)))
	$$
	estimated return 被称之为时序差分目标**(TD-target)**
	- 走了某一步之后得到的实际奖励$r_{t+1}$
	- 我们利用了自举的方法,通过之前的估计来估计$V(s_{t+1})$,并且加了折扣因子,即$V(s_{t+1})$
**时序差分误差**(TD error) $\delta = r_{t+1}+\gamma V(s_{t+1})-V(s_t)$
类比增量式的蒙特卡洛方法,给定一个回合$i$,可以更新$V(s_t)$来逼近真实的回报$G_t$,具体的更新公式为:
$$V(s_t)\leftarrow V(s_t)+\alpha(G_{i,t}-V(s_t))$$
对比MK和TD方法,MD中$G_{i,t}$是实际得到的值,因为它把一条轨迹跑完了,可以算出每个状态真实的回报;而TD方法中的$V(s_t)$不等轨迹结束,就往前走一步,就可以更新状态函数。
具体的差别:
- TD可以在线学习(online learning),走一步学习一步;蒙卡却需要在整个轨迹结束之后才能学习
- TD可以在不完整的序列上进行学习,蒙卡却不行
- TD可以在无终止的环境下进行学习,蒙卡不行
- TD利用了马尔可夫性质,在马尔可夫环境下有更高的学习效率,蒙卡没有假设环境具有马尔可夫性质,利用采样的价值来估计某个状态的价值
- 也就是说TD又更高的灵活性
除了$TD(0)$,我们还可以调整步数,变成**n步时序差分(n-step TD)**:
$$
\begin{gather}
n=1(TD)\,G_t^{(1)}=r_{t+1}+\gamma V(s_{t+1})\\
n=2\,G_t^{(2)}=r_{t+1}+\gamma r_{t+2}+\gamma^2V(s_{t+2})\\
n=\infty\,G_t^{\infty}=r_{t+1}+\gamma r_{t+2}+\cdots+\gamma^{T-t-1}r_T
\end{gather}
$$
其中$n=\infty$,就是在整个游戏结束时候,这是$\infty$步TD就是蒙特卡洛方法
也就是$$G_t^n=r_{t+1}+\gamma\,r_{t+2}+\cdots+\gamma^{n-1}r_{t+n}+\gamma^nV(s_{t+n})$$
接着我们用增量式学习的方法来更新价值(incremental learning)
$$V(s_t)\leftarrow V(s_t)+\alpha\,(G_t^n-V(s_t))$$
#### DP,MK和TD方法的自举和采样
自举是指更新时用来估计,蒙卡方法没有自举,因为根据实际的回报进行更新,DP和TD则使用了自举。
采样是指更新时通过采样得到一个期望,蒙卡是纯采样,DP没有采样,直接用Bellman方程来更新状态价值,TD则是使用了采样,TD由自举和采样两部分组成:
DP直接计算期望,将所有相关的状态进行加和:
$$V(s_t)\leftarrow \mathbb{E}_t[r_{t+1}+\gamma\,V(s_{t+1})]$$
蒙卡在当前状态下,采取一条支路,在这条支路上进行更新,更新这一条路径的所有状态
$$V(s_t)\leftarrow V(s_t)+\alpha\,(G_t-V(s_t))$$
TD则从当前状态,向前走一步$$V(s_t)\leftarrow V(s_t)+\alpha(G_{i,t}-V(s_t))$$
如果TD进行更广度的更新,就变成了DP方法,若是需要更广度的更新,就成了MK方法
### 免模型控制
我们可以把策略迭代进行广义的推广,使它能够兼容蒙特卡洛和时序差分的方法,即带有蒙特卡洛和时序差分方法的**广义策略迭代（generalized policy iteration,GPI)**
策略迭代由2个方程组成:
- 根据给定的当前策略$\pi$来估计价值函数,
- 得到估计的函数之后,通过贪心的方法来改进策略:$$\pi'=贪心函数(V_{\pi})$$
- 这两个步骤不断进行迭代
$$\pi_{i+1}(s)=argmax_iQ_{\pi_i}(s,a)$$
可以计算出策略$\pi$的动作价值函数,并且可以根据上式来针对状态$s\in S$的新策略$\pi_{s+1}$,但得到了状态价值函数之后,我们并不知道奖励函数$R(s,a)$和状态转移$P(s'|s,a)$,所以就无法估计$Q$函数:
$$Q_{\pi_i}(s,a)=R(s,a)+\gamma\,\sum_{s'\in S}P(s'|s,a)V_{\pi_i}(s')$$
在不知道奖励函数和状态转移的时候,**怎么进行策略的优化**
引入广义的策略迭代的方法,对策略评估部分进行修改,使用蒙特卡洛方法代替DP估计Q函数$Q=Q(s)$,就可以通过贪心的方法去改进它:
$$\pi(s)=argmax_{a}Q(s,a)$$
一个保证策略迭代收敛的假设使回合有**探索性开始**(exploring start),假设每回合有一个探索性开始,保证所有的状态和动作都在无限步的执行后能够被采样到,这样才能进行很好的估计,算法通过蒙特卡洛方法产生很多轨迹,每条轨迹都可以算出它的价值,然后,我们可以通过平均的方法去估计Q函数,Q函数可以视作一个Q表格,通过采样的方法把表格的单元的值都填上,然后使用策略改进来选取更好的策略,**如何使用蒙特卡洛方法来填Q表格是这个算法的核心**
为了确保蒙特卡洛方法能够有足够的探索,我们使用$\epsilon-greedy$探索->我们有$1-\epsilon$的概率会按照Q函数来决定动作,通常$\epsilon$就设置一个很小的值,通常在实际中,$\epsilon$会随着时间递减
**我们使用蒙特卡洛方法和$\epsilon-greedy$探索的时候,可以确保价值函数是个递减的**:
$$
\begin{align}
Q_{\pi}(s,\pi'(s))&=\sum_{a\in A}\pi'(a|s)Q_{\pi}(s,a)\\
&=\frac{\epsilon}{|A|}\sum_{a\in A}Q_{\pi}(s,a)+(1+\epsilon)max_aQ_{\pi}(s,a)\\
&>=\frac{\epsilon}{|A|}\sum_{a\in A}Q_{\pi}(s,a)+(1+\epsilon)\sum_{a\in A}\frac{\pi(a|s)-\frac{\epsilon}{|A|}}{1-\epsilon}Q_{\pi}(s,a)\\
&=\sum_{a\in A}\pi(a|s)Q_{\pi}(s,a)=V_{\pi}(s)
\end{align}
$$
>基于$\epsilon-greedy$探索的蒙特卡洛方法:
>初始化Q(S,A)=0,N(S,A)=0,$\epsilon=1,k=1$
>$\pi_k=\epsilon-greedy search(Q)$
>循环：
>对于第k个回合$((S_1,A_1,R_2,\cdots,S_T))$进行采样
>$$N(S_t,A_t)\leftarrow N(S_t,A_t)+1$$
>$$Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\frac{1}{N(S_t,A_T)}(G_t-Q(S_t,A_t))$$
>k<-k+1,$\epsilon$<-1/k
>$\pi_k=\epsilon-greedy(Q)$
>停止循环

与蒙卡方法相比,TD方法有上述的很多优点:所以,
#### Sarsa:同策略时序差分控制
TD方法是给定一个策略,然后我们去估计它的价值函数,接着我们要去考虑怎么使用时序差分方法的框架去估计Q函数,也就是Sarsa算法:
Sarsa做出的决定很简单,将原本时序差分方法更新$V$的过程,变成了更新$Q$,即:
$$Q(s_t,a_t)\leftarrow Q(s_t,a_t)+\alpha[r_{t+1}+\gamma\,Q(s_{t+1},a_{t+1})-Q(s_t,a_t)]$$
直接去估计Q表格,得到Q表格之后,就可以更新策略:
该算法由于每一次都需要知道$(s_t,a_t,r_{t+1},s_{t+1},a_{t+1})$这几个值,因此得名**Sarsa**算法
$$
Q(S,A)\leftarrow Q(S,A)+\alpha\,(R+\gamma\,Q(S',A')-Q(S,A))
$$
Sarsa的更新公式和时序差分的公式是类似的$S'$就是$s_{t+1}$,就是用下一步的Q值$Q(S',A')$来更新这一步的Q值$Q(S,A)$,不断的强化每一个Q值
向上面那个n步TD似的,Sarsa属于单步更新算法,没执行一个动作,就会更新依次价值和策略,如果不进行单步更新,而是采取n步更新或者回合更新,即在n步之后再更新价值和策略,就得到了**n步Sarsa**
$$Q_t^n=r_{t+1}+\gamma\,r_{t+2}+\cdots+\gamma^{n-1}r_{t+n}+\gamma^nQ(s_{t+n},a_{t+n})$$
对$Q_t^n$加上资格迹衰减参数(decay-rate parameter for eligibility traces)$\lambda$并进行求和,即可得到Sarsa($\lambda$):$$Q_t^{\lambda}=(1-\lambda)\sum_{n=1}^{\infty}\lambda^{n-1}Q_t^n$$
因此n步Sarsa($\lambda$)的更新策略:
$$Q(s_t,a_t)\leftarrow Q(s_t,a_t)+\alpha\,(Q_t^{\lambda}-Q(s,a))$$
#### Q学习:异策略时序差分控制
Sarsa是一种同策略(on-policy)算法,优化的是它实际执行的策略,直接用下一步指定的动作去优化Q表格,同策略顾名思义,就是只有一种策略去做动作选择和优化
**Q学习** 是一种**异策略(off-policy)**算法,异策略在学习的时候,有2种不同的策略:**目标策略和行为策略**,target policy是我们需要去学习的策略,通常用$\pi$表示,行为策略是环境探索的策略,通常用$\mu$表示,行为策略无限探索到所有可能的轨迹,采集轨迹和数据,然后把采集的数据喂给目标策略学习,且喂给目标策略的东西中并不需要$a_{t+1}$,牛比!!!
在off-policy中,轨迹都是行为策略和环境交互产生的,产生了这些轨迹之后,再使用这些轨迹更新目标策略$\pi$
off-policy的优点:
 - 利用探索策略来学习到最佳的策略,效率高i
 - off-policy learning可以让我进行模仿学习,学习人或者其他agent的动作
 - 可以让我们重用旧的策略产生的轨迹,探索过程需要很多计算资源,这样可以节省资源
目标策略$\pi$直接在Q-table上进行贪心:
$$\pi(s_{t+1})=argmax_{a'}Q(s_{t+1},a')$$
行为策略$\mu$可以是一个随机的过程,但是我们采取$\epsilon-greedy$策略,使得其不那么随机,是一个逐渐收敛的过程;
构造Q学习目标,Q学习的下一个动作都是通过argmax操作选出来的,于是我们可以得到；
$$r_{t+1}+\gamma\,Q(s_{t+1},A')=r_{t+1}+\gamma\,Q(s_{t+1},argmaxQ(s_{t+1},a')=r_{t+1}+\gamma\,max_{a'}Q(s_{t+1},a')$$
接着我们可以将Q学习更新写成增量式的形式:
$$Q(s_t,a_t)\leftarrow Q(s_t,a_t)+\alpha\,[r_{t+1}+\gamma\,max_{a}Q(s_{t+1},a)-Q(s_t,a_t)]$$
Q学习在更新Q表格的时候,用到的是Q值$Q(S',a)$对应的动作,不一定是下一个步骤会执行的实际的动作,因为下一个实际会执行的那个动作可能会探索,Q学习默认的下一个动作是根据Q-tablet做出的,而不是通过行为探索得到的,是默认$A'$为最佳策略选取的动作,因此Q学习在学习的过程中,不需要传入$A'$,即$a_{t+1}$的值
可以对Sarsa和Q-learnning算法进行对比,这样更好理解。
Q-learnning不需要知道我们实际上选择哪一个动作,默认下一个动作就是Q值最大的动作
### 使用Q学习解决悬崖寻路问题
本节使用openAI Gym开发的**CliffWalking-v0**环境
在一个4x12的网络中,以网格的左下角为起点,右下角为终点,目标是移动agent到终点位置,可以在上下左右各移动一步,每移动一步会得到-1的奖励:
最后一行是悬崖(index:37-46):
- agent不能移出网格,移出网格外,扣-1w分的奖励
- 若掉入悬崖,-100奖励,回到起点
- 若是移动到终点,奖励为各步奖励之和
目标是以最少的不是到达终点,易得13步最短,因此在最佳策略收敛的情况下,总奖励为-13,
```python
import gym
from envs.gridworld_env import CliffWalkingWapper
env = gym.make('CliffWalking-v0')
env = CliffWalkingWapper(env)
```
由于`gym`环境封装的比较好,因此我们想要使用这个环境只需要使用gym.make命令输入函数名即可,然后就可以看见环境的状态和动作数:
```python
n_states = env.observation_space.n
n_actions = env.action_space.n
print(f'stata_nums:{n_states} action_nums:{n_actions}')
```
```python
state = env.reset()
print(f'initial state:{state}')
```
#### 强化学习基本接口
指的是一般的强化学习的训练模式,也是大多数的伪代码遵循的规则,如下:
- 初始化env和agent
- 对于每个epoch,agent选择action
- env接收action并反馈下一个state和reward
- agent->policy-update
- 多个回合迭代之后收敛
```python
env = gym.make('CliffWalking-v0')
env = CliffWalkingWapper(env)
env.seed(1)
n_states = env.obseration_space.n
n_actions = env.action_space.n
agent = QLearning(n_states,n_actions,cfg) #cfg用于存储算法相关的参数化
for i_ep in range(cfg.train_eps):
	ep_reward = 0
	state = env.reset()
	while True:
		action = agent.choose_action(state)
		next_state,reward,done,_ = env.step(action)
		agent.update(state,action,reward,next_state,done)
		state = next_state
		ep_reward+=reward
		if done:
			break
```
记录:
```python
rewards = []
ma_rewards = []
for i_ep in range(cfg.train_eps):
	ep_reward = 0
	state = env.reset()
	while True:
		action = agent.choose_action(state)
		next_state,reward,done,_ = env.step(action)
		agent.update(state,action,reward,next_state,done)
		state=next_state
		ep_reward+=reward
		if done:
			break
	rewards.append(ep_reward)
	if ma_rewards:
		ma_rewards.append(ma_rewards[-1]*0.9+ep_reward*0.1)
		else:
			ma_rewards.append(ep_reward)
```
#### Q学习算法
我们来定义1个Q-learning类,主要包含choose_action和update()两个函数
```python
def choose_action(self,state):
	self.sample_count+=1
	self.epsilon = self.epsilon_end+(self.epsilon_start-self.epsilon_end)*\
		math.exp(-1.*self.sample_count/self.epsilon_decay)# epsilon会递减,这里选择指数递减
	if np.random.uniform(0,1)>self.epsilon:
		action = np.argmax(self.Q_table[str(state)])
	else:
		action = np.random.choice(self.action_dim)
		# 随机选择动作
	return action
```
```python
def update(self,state,action,reward,next_state,done):
	Q_predict = self.Q_table[str(state)][action]
	if done:
		Q_target=rewad
	else:
		Q_target=reward+self.gamma*np.max(self.Q_table[str(next_state)])
	self.Q_table[str(state)][action]+=self.lr*(Q_target-Q_predict)
```
也就是$$Q(S,A)\leftarrow Q(S,A)+\alpha\,(R+\gamma\,max_{a}Q(S',a)-Q(S,A))$$
#### 分析结果
具体源码可以查看github的源码


