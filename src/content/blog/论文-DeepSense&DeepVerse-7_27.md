---
title: "7_27"
published: 2026-07-27
description: ""
tags: ["论文"]
draft: false
---
### 阅读顺序
DeepSense 6G Dataset -> Occulusion-Aware Multimodal Beam Prediction and Pose Estimation for mmWare V2l ->Digital Twin Beam Prediction -> Multimodal Radio and Vision Fusion Localization -> Reading Radio from Camera -> JEPA-MSAC

### DeepSense 6G: A Large-Scale Real World Multi-Model Sensing and Communication Dataset
一个多模态感知通信dataset : 该文章用于帮助该数据集的应用与复现验证 
1-8：**通信、多模态感知和定位之间的协同效应**。
4-9：更高频是之后的趋势、高带宽与大型天线阵列是通信与传感领域的理想特性。
4-6：ml和dl可以为解决这些问题提供帮助，因而需要大量的数据集。
12 13：2个dataset的介绍
#### 该dataset的特点包括:
- 感知与通信共存
- 多模态采集数据(人工合成的):雷达、视觉数据、*LIDAR*(激光雷达)、GPS定位数据、传感器采集的气象数据。
- 基于真实世界的数据集
- 大规模
- 多场景的:包括*V2l*、*V2V*、adapted device(不同的设备产生不同的数据)eg:(低于6GHz的大规模MIMO、mmWave、RIS)。不同的场景会缠上不同的数据。**数据集的定义和结构必须具有可扩展性，从而支持数据集持续增长。**(因为若是dataset的定义比较狭窄，未来新的场景的数据则会破坏目前狭窄的结构)
        基站
         |
         |
      🚗车辆    🚗  <------>  🚙
>Q：什么是MIMO？什么是RIS(reconfigurable intelligent surfaces)
> MIMO->multiple Input Multiple Output->用多个天线同时发送和接收信号
> 普通的:SISO(single input and output)
> RIS:Reconfigurable Intelligent Surface(可重构智能表面)
> 

 发送端              接收端

  📡  ----------------> 📱

 一个天线             一个天线
 发送端                    接收端

📡 📡 📡  ------------->  📡 📡

多个天线                  多个天线
**因为信号的传播路径并不是一条直线 会发生反射绕射和散射,形成多种路径，而MIMO可以利用这种路径**
#### Structure
- 每个场景是不同的独立数据集，包含multi-model sensing and commuciation data(如题目所示)。并且采用相同的格式。
	- Q:这里的formatted in a generic way具体指代的什么?
		- 支持DeepSense dataset的可拓展性，便于后续增加应用场景
		- 统一的格式可以整合不同场景的数据，便于构建具有目标多样性的更大规模的dataset
		- 简化dataset的定义，便于复现(**reproducibility**)
- data structure in each scenario
- DeepSense 6G网站为用户提供docs说明采用的测试模式及应用场景的路径结构
#### DeepSense Testbeds
testbeds:用于提升dataset的可拓展性并涵盖多种应用场景，每个testbed由多个processing units组成，每个units包括不同组件:(i):一套无线及环境传感器，一个或多个频段的无线通信收发器(eg:sub-6GHz MIMO),还包含多种传感器:(rgb摄像头、rador、GPS...)(ii):
`Real-World data collection -> Multi-Model Raw Data -> Data Processing`
- Example - **DeepSense Testbed 5**:
针对V2I的一个testbed,由2个Units：
- Unit1:a stationary unit,包括:
	- A mmWave receiver
	- RGB Camera
	- 3D LIDAR
	- Radar
	- GPS receiver
- Unit2:a vehicle
#### Data Collection And Processing Framework
##### Data Collection:
data collection process comprises 2 main phases:**Off-field**(进入真实场地采集之前的准备) planning and **on-field collection**(现场采集).
`Off-field planning`:决定需要哪些传感器，对数据收集的时间和地点统一规范。
`on-field collection`:实际的现场采集。
- **Fov alignment**:
field of View
eg:rgb camera:110;LIDAR:90。
为保证数据集质量，在dataset采集之前，需对传感器进行校准。为此，该testbed设有若干校准步骤，以根据不同的FOV对传感器进行校准。
- **Capturing rate alignment**:
不同的传感器有不同的capturing rate.为了使数据有意义，需进行跨模态数据对齐。采取了一系列措施实现必要的对准。例如：camera 1s 拍了10帧pic,LIDAR却1s有数十个数据。采用**UTC**时间戳来完成时间维度上的数据校准

```
Sample t=10s
{
 image,
 point cloud,
 radar,
 GPS,
 channel
}
```
从而拥有类似于Str的数据结构。否则各个传感器的数据将会是分散的，无意义的数据。
eg:Camera 和 mmWave同步，*摄像头曝光会在波束扫描完成后立刻触发*
**beam sweeping**:mmWave:会尝试不同方向的beam；从而使得曝光时刻的camera数据刚好是刚刚测的无线环境。因为camera的曝光是瞬时的，因而便于完成camera和mmWave之间的数据对齐。
- **Real-Time monitoring**:
对采集的数据进行:人工核查+数据可视化管理.
##### Data Processing:
通过testbed收集的是原始数据:(raw data),raw data随后会经过一系列的post-processing.
- **Data Synchronization**:
同上文所说，不同的传感器有不同的采集速率，可能导致dataset缺乏一致性。上文中的校准会减轻一部分该问题，但不足以完全解决.利用同一时刻的**UTC timestamp**作为基准点，有助于对齐不同数据模式。DeepSense 6G已经拥有利用保存的timestamp 生成同步且对齐的multi-model dataset的脚本。
- **Data Filtering**：数据采集过程一旦开始采集，将持续捕获数据直至手动停止该过程。对于mobile user而言，持续的数据采集过程可能会导致样本中用户处于FOV之外。因此需要进行数据过滤。
- **Data Verification**:生成数据集的最后一步是验证同步和过滤之后的dataset.其中一种工具是GUI，用于呈现所有数据类型。
#### DeepSense 6G Scenarios
每个Scenarios包含一个完整的数据收集过程，该dataset包含40+种Scenarios,阐述这些场景固有的多样性和价值。
- **Multiple Sensors**:
各传感器有各自的优缺点，DeepSense6G具有多种数据模式。
- **Multiple locations**：
场景大多在美国和西班牙，覆盖15个以上的室内外场景。选择的室内外场景均具有较高的复杂度。
- **Different times of the day**:
光照会对carmera的图像质量产生影响，Dp6g 对1天中的各个时段收集数据。
- **Different weather conditions**:
LIDAR数据易受天气影响，Dp6g有各种天气条件下的数据，并在持续增加。
- **Different types of UEs**:
object classes、object instances、object speed
classes:汽车、行人、建筑...
instances:SUV、MPU、golf...
speed:车速:10km/h、20km/h...
- **Deployment scenarios**:
广泛的部署场景,eg:V2I,V2V,RIS,pedestrians...
##### Enabled Application and ML Tasks
应用领域广泛,包括:多模态感知的波束和信道预测、主动阻塞预测及切换控制、ISAC系统的波形设计、radar/LIRADAR目标检测，为了加速这些方面的ML reserch,提高可复现性、Dp6G还提供了针对多项关键应用的任务特定开发数据集。为transfer learning,scalability,robustness,distribution shift analysis提供了支持。
>Q:什么是transfer learning 和 distribution shify analysis
>transfer learning:将一个任务中学到的知识，迁移到另一个相关任务上，而不是从0开始；distribution shift analysis:不用数据分布下的分析，在不同的复杂的数据分布下，有的dataset可能会表现不佳
- **Example:Generalizability evaluation for ML-based beam prediction:**
ML的模型能否在特定场景数据集上进行训练，并成功泛化到该模型此前未见过的其他场景中？
ML-based beam prediction；目标是对于目前的multi-model dataset 开发一种ML-based 解决方案，使其能够预测训练集中没有的未知场景。采用了一篇文献中提到的ML模型，并进行轻微修改，采用Yolov3来检测并提取视觉数据中各个目标对象的锚框中心坐标，确定视觉数据中各个目标对象的边界，随后将其作为输入给与一个双层前馈神经网络，以从预定义的波束成形码本中预测最优波束索引。
- **Performance:**
该特定开发dataset在不同的场景下展示出了良好的可泛化性，因而是研究该泛化能力的理想对象。并采取该dataset中的70%作为训练集，30%作为测试集，
作者测试了模型的跨场景泛化能力。模型在Scenario 1训练，在完全没有Scenario 5训练数据的情况下，仍然能够在Scenario 5预测beam，并达到超过70%的Top-3准确率，说明模型具有一定的跨Scenario泛化能力。
#### Conclusion:
对Dp6g进行概述与展望

### Occclusion-Aware Multimodal Beam Prediction and Pose Estimation for mmWave V2l
#### Abstract
提出一种用于定位和SLAM概念的遮挡感知multi-model学习框架，用于轨迹解析和姿态预测。针对车载infra(V2l)的需求，我们的基于transforamer的融合网络可整合同步化的多模态数据。

基于60GHz DeepSense 6G Scenario 31 dataset,该模型拥有50.92%的top-1准确率和86.5%的top-3准确率，同时仅损失0.018 bits/s/Hz的频谱效率，
##### Introduction
背景：**AVs**(自动驾驶车辆)需要具备精确的定位能力以及可靠的高速无线通信链路，**SLAM**是自动驾驶感知的核心技术，**LIDAR**等在多种场景下能够实现高精度，但是目前感知和通信仍然是独立分开的两部分，这种隔离对于mmWave V2l应用尤其不利，Los被车辆行人等阻挡时，mmWave通信链路会出现吞吐量下降。传统的方法低效且容易失效。
Unimodal beam prediction也会因为遮挡失效。为此我们在寻求一种多模态方法，*将感知与短期的无线通信上下文相结合，同时支持姿态估计和波束管理*，
```
传统方法:
信号下降
 ↓
扫描所有beam
 ↓
找到最佳beam

新的方法:
环境信息
 ↓
AI预测
 ↓
直接切换最佳beam
```
现有研究解决了该目标的部分方面，但仍具有局限性，常常假设布局静态且完全依赖电观测数据，**Semantic radio SLAM**则更强，在原来基础上加入了通信的上下文，可以实现估计物体姿态将交互点标记为反射体或是散射体(预测交互点的类型)，然而**Senmantic radio SLAM**仅仅利用了无线信息，并没有结合摄像头、LIDAR等非无线传感器来辅助波速选择及解决遮挡问题。
提出自动驾驶领域的**multi-sensor SLAM**，融合了激光雷达、摄像头、雷达及GNSS信号，在部分遮挡条件下实现可靠的定位。本文利用真实的**60 GHz DeepSense 6G Scenario 31 V2l dataset**将这些研究方向进行创新。设计了一种基于transformer的多模态融合网络。能够处理每一帧图像观测数据并学习共享的潜在表示，可以联合预测接收波束索引、遮挡概率及车辆2维姿态。
离线**LIDAR map**可用于以**SLAM**风格方式可视化预测轨迹，主要贡献包括:
- 接收波束预测、遮挡检测、2d姿态估计整合为一个统一的多任务学习问题，基于多模态数据共同构建的**shared lantent state**
```
多模态输入
Camera
LiDAR
Radar
GNSS
mmWave

        ↓

  Shared latent state

        ↓

 -------------------
 |        |          |
Beam   Blockage   Pose
预测    检测       估计
```

- 我们提出一种基于Transformer的多模态融合网络。不同类型的传感器数据先通过各自的编码器提取特征，然后利用beam扫描测量自动生成beam和遮挡标签进行训练，最终学习到一个能够理解遮挡影响的mmWave车联网环境表示。
- 动单模态相比精度大大提升，Loss大大降低，遮挡抑制效果更好

#### SYSTEM MODEL AND PROBLEM FORMULATION
以mmWave V2l link举例，由1个有多模态感知的`stationary infrastructure unit`和`a moving vehicle unit`组成，(同A1所描述的units一致)。
`The mmWave receiver employs a phased array and (during data collection) sweepsa fixed receive-beam codebook of size B = 64 at each timeindex t ∈ {1, . . . , T} to measure the received power across beams`这里的`B=64`是mmWave相关的一个参数。`phased array`是一组接收端的天线，每一个方向就是一个`receive beam`.这里的`B=64`就是指接收端提前设计了64个候选的接收波束。
>Q:为什么需要beam?
>mmWave频率吧很高，不想低频天线，可以大范围传播，mmWave需要对准方向后才能有效传播

融合了多模态数据，便于预测最优光束路径、遮挡状态和车辆姿态。
- **State and Map Representation**:
BS-centric(Base station-centric),2D position:
$$
(s_t = \begin{bmatrix} x_t\\ y_t \end{bmatrix} \in R^2)
$$
GNSS接收`真实+噪声`的数据：
$$
(\tilde{s}_t=s_t+n_t^{gps})
$$

其中 $(n_t^{gps})$ 表示GNSS转换到局部坐标系后的残余误差。静态环境由`LIDAR`的点云图表示环境，而不是图片文字。
$$
(M_L=\{l_i\}_{i=1}^{N_L}, \quad l_i\in R^3)
$$
$M_L$代表`LIDAR`地图，$l_i$代表第$i$个`LIDAR`点，$N_l$代表点的个数。该地图通过离线聚合并对齐车辆行驶过程中的`LIDAR`扫描构建，且`LIDAR map`中不会出现动态物体。对于遮挡和多径传播的影响由学习模型隐式处理。
- **Sensor and Observation Model**
每个时刻，系统收集:
	- mmWave 接收功率向量$r_t$,$r_t(b)$代表第`b`个beam上电接收功率
	- Rgb Image
	- `LIDAR`点云(3-dim)
	- `FMCW`雷达检测结果，处理后得到的距离-角度幅值表 *`FMCW`是一种汽车常用雷达*
	- `GNSS`测量值，转换为2d局部坐标系中 (*GNSS:Global Navigation Satelite System*)
	**构建模型**:$(O_t= ( I_t, L_t, \tilde R_t, \tilde s_t, r_{t-1} ))$
	参数分别是 camera image,LIDAR cloud points,处理后的距离-角度幅值,GNSS位置，$r_(t-1)$是上一个时间点的mmWave received-power vector

- **Beam and Blockage Labellimg**:
oracle receive beam index(最优解的index):
$(b_t^*= \arg\max_{b\in\{1,...,B\}} r_t(b))$,又$r_t(b)$是第`b`个beam的received-power vector
最大接收功率:
$(P_t^{max}=\max_b r_t(b))$
选择一个阈值 $(\tau)$，例如训练集中最大功率分布的20%分位点。
生成二分类问题：
$y_t^{blk} = \begin{cases} 1,&P_t^{max}<\tau\\ 0,&P_t^{max}\geq\tau \end{cases}$
1表示有遮挡，0表示无遮挡
>为什么用received-power vector来判断有无遮挡?
>mmWave被遮挡后，`P`会急剧下降。

**Performance evaluation**:**SE(Spectral Efficiency)**
将beam的功率转化为近似的频谱效率(**SE**)
$SE_t(b)=\log_2(1+SNR_t(b))$
(其中，`SNR`表示*Signal-to-Noise Ratio*,信噪比/信号强度)，预测错误后beam损失：
$(\Delta SE_t= SE_t(b_t^*) - SE_t(\hat b_t)$
- **Learning Objective**(学习目标):
Input:$O_t=(I_t,L_t,\tilde R_t,\tilde s_t,r_{t-1})$
*snapshot-based mapping*模型主要看基于当前时刻的信息
*multimodel observations*多模态观测
$f_\theta$ denote the fusion network with parameters $\theta$.
$$(z_t,v_t,\hat{s}_t)=f_\theta(O_t)$$
input:$O_t$,output:$z_t,v_t,\hat s_t$
- $z_t$->`beam logits`
- $v_t$->`blockage logit`
- $\hat s_t$->`estimated 2D position`
>Q:what s `logit`
>这里的`logit`指的是一种未归一化的得分

归一化:
$$
\begin{align}
\pi_t&=softmax(z_t)\\
q_t&=\sigma(v_t)
\end{align}
$$
取max的`index`:
$$\hat b_t=\arg\max_b \pi_t(b)$$
遮挡判断:
$$\hat y_t^{blk}=1[q_t\ge0.5]$$

Dataset 格式:
$$D=\{(O_t,b_t^*,y_t^{blk},s_t)\}_{t=1}^{T}$$
Loss Function(Multi-task loss):
$$L(\theta)= \lambda_{beam}L_{beam} + \lambda_{blk}L_{blk} + \lambda_{pose}L_{pose}$$
`beam loss`、`blockage loss`、`position loss`
$L_{beam}$->entropy loss between $\pi_t$ and $b_t^*$
*recall:entropy loss:*
$L_{blk}$->**binary** entropy loss between $q_t$ and $y_t^{blk}$
$L_{pose}$->`MSE` betwwen $\hat s_t$ and $s_t$
>Q:为什么着几个loss要用不同的Loss Function:

$\lambda_{...}$表示各个参数的权重
**RMSE**评价指标:
$$RMSE= \sqrt{ \frac1T \sum_{t=1}^{T} ||\hat{s}_t-s_t||_2^2 }$$
**RMSE**越小越好

```
A. State and Map
    ↓
定义车辆和环境

B. Sensor Model
    ↓
定义输入数据

C. Labelling
    ↓
生成训练标签

D. Learning Objective
    ↓
定义学习目标与损失函数
```
#### Proposed method
- **A Multimodel Tokens:Preprocessing and Encoders**:
**各种多模态的数据如何转换为`Transform`能够理解的`tokens`**
多模态`tokens`:数据预处理与编码器
input:$O_t=(I_t,L_t,\tilde R_t,\tilde s_t,r_{t-1})$
   - rgb image:
     resized to `224*224` -> convert to `tensor` -> `ImageNet` Normalization
>Q:`ImageNet` Normalization?
>作者使用`ResNet-18`作为预训练参数，因而`input`需要符合`ImageNet`的数据分布


Tokenlization 流程:
```
Camera Image(height*weight*3)
			↓
	ImageNet Normalization
			↓
		ResNet-18
			↓
	features vector
			↓
		Linear Units
			↓
		Get Tokens
			↓
		Transformer
```
`input`标准化后加入`ResNet`进行数据预处理，生成`features vector`后加入`Linear Units`进行`dim`对齐后s输出$h_t^{img}\in R^d$,作为`transformer`的输入
   - **LIDAR**:
$$l_i=(x,y,z)$$
```
	LIDAR cloud points
			↓
	 remove invalid points
			↓
	randomly subsampled
			↓
	PointNet-style encoder + ReLU
			↓
	Maxpooling
			↓
	Transformer
```
>PointNet-style encoder?
>PointNet是一种专门处理点云数据的神经网络

- RADAR

 ```
 FMCW Radar raw data
			↓
		   FFT
			↓
		距离-角度幅度图
			↓
		CNN Encoder
			↓
		 Output
 ```
 `Output`->$h_t^{radar} \in R^{d}$
- GNSS
`GNSS`:类似于`GPS`的坐标信息
```
GNSS raw data(Latitude.longtitude)
			↓
BS(base station)-centred local frame(获取移动物体与基站的相对距离)
			↓
	加入`GPS`误差偏置
			↓
	2-layer MLP
			↓
	Batch Normazalition
			↓
		Output
```
`Output`:$h_t^{gps}$
- mmWave power history
Traditional mmWave:
`Station`不知道`vehicle`在哪个`beam`,只能一遍遍的扫描，但是这样效率低下
```
   64-beam sweep at time t
			↓
	t-1时刻的received-power vector
			↓
	
        ┌────────────────────────┐
        │ 检查是否存在缺失beam数据  │
        └────────────────────────┘
                         │
              ┌──────────┴──────────┐
              ↓                     ↓

        有缺失数据              无缺失数据

              ↓                     ↓

     缺失beam功率置0          保持原值


        └──────────┬──────────┘
	               ↓
	---------------------
	↓                    ↓
选取`max`的beam index    P_t^{max} index
			↓
		Output
	
```
`Output`->$y_t^{blk}$
>missing entries set to zero?
>保持输入格式不变，缺失部位补0

- **Transformer Based Fusion and Task Heads**:
	- Vectorlize->Hidden Layer Parameters:
$$H_t= [ h_t^{img}, h_t^{lidar}, h_t^{radar}, h_t^{gps}, h_t^{mmw} ] \in R^{5\times d}$$
`dim:5*d`->`dim:6*d`:
在原来的$H_t$sequence前加入$h_t^{cls}$,一个可学习的分类token
>Q:Why we need $h_t^{cls}$?
>shared kantent state

   - Add Token-Type embedding
	加入一个`embedding`类型编码每个`token`属于哪一种模态
	
$$H_t^{new}=[ h^{img}, h^{lidar}, h^{radar}, h^{gps}, h^{mmw}, h^{CLS} ]$$
得到的`token sequence`通过一个`Transformer Encoder`处理，其中包含`multi-head self-attention`和`feed-forward layers`,`Transformer`的核心工作是**让不同模态之间进行交流**,多头注意力机制使得不同任务关注不同信息，$h_t^{cls}$作为一个紧凑的多模态状态输出，$h_t^{cls}$表示模型对当前环境的理解，即前文提到的**shared latent state**.
`summarizing geometry,occlusion cues,and radio context`
3个`linear heads`分别产生`beam logits`、`blockage logit`和`pose estimate`
```
              h_CLS
                |
    ┌───────────┼───────────┐
    ↓           ↓           ↓

 Beam Head  Block Head   Pose Head

    ↓           ↓           ↓

  z_t         v_t        ŝ_t
```
$$
\begin{align}
z_t&=W_{beam}h_t^{CLS}+b_{beam}\\
v_t&=W_{blk}^{T}h_t^{CLS}+b_{blk}\\
\hat{s}_t&=W_{pose}h_t^{CLS}+b_{pose}
\end{align}
$$
$z_t$->`beam logit`,$v_t$->`blockage logit`,$\hat s_t$->`pose estimate`

- Training Strategy
$$\mathcal L(\theta) = \lambda_{beam}\mathcal L_{beam} + \lambda_{blk}\mathcal L_{blk} + \lambda_{pose}\mathcal L_{pose}$$
  - 采用`AdamW`优化器，和`权重衰减`加`梯度裁切`
>Adamw Adaptor?weight decay?gradient crapping?

  - 将`dataset`按照`sequence`划分为`training set`、`valitating set`、`testing set`。
  - 保留每个`sequence`中的时间顺序，使$r_{t-1}$对应紧邻前一个时间快照。
  - 在$\mathcal L_{blk}$中提高正遮挡的权重->遮挡预测错误,`Loss`更大。
  - 选择3个$\lambda$权重，使得各个`loss`规模接近，同时优先考虑`beam`对齐。
  - 调整学习率
  - 保存`validation loss`最低的模型进行测试
- **LIDAR Map And Trajectory Visualization**:
验证模型预测的位置是否合理:
  - 建立离线`LIDAR`地图
  - 将`LIDAR`扫描数据积累到`BS-central local frame`,(累积使得cloud points信息积累)
  - 使用数据集提供的同步和标定信息
  - 画出真实轨迹和预测轨迹
  - 绘制积累点云的俯视图
  - 不同于`SLAM`，该模型只回归2d平面坐标，并没有进行匹配地图优化，由于绘制出了真实轨迹和预测轨迹，这种可视化提供了一种类似于`SLAM`的几何一致性检查。
#### Results And Discussions:
- **Training Behaviour**:
在`DeepSense 6G Scenario 31`上进行评估，有大量的同步数据`Snapshots`(**某一时间点的一组完整观测**),`training/validation/test sets`比例分别为`70%/15%/15%`，按照序列进行划分，减少时间泄露导致的结果偏高。
`epoches:40`+`multi-task loss`+`最佳validation checkpoints for testing`
随着`epoch`的增加，过拟合开始出现,但并非严重的过拟合。
- **Beam Alignment and Spectral Efficienct**:
   - Beam Alignment:
	   - Top-1 Accuracy
		$$ Top-1 \, Accuracy = \frac{正确预测数量}{总数量}$$
		- Top-3 Accuracy
	作者的`T-1 Acc`=`50.92`、`T-3 Acc`=`86.5`,略微超过单模态方法的`Acc`
- Spectral Efficiency(**SE**)[频谱效率]
$$SE_t(b)=\log_2(1+SNR_t(b))$$
	`Beam`预测错误，会损失多少通信效率?
	即便`Beam`预测错了，通信损失很小。
	- SE-Drop:
	$$\Delta SE_t = SE_t(b_t^*) - SE_t(\hat b_t)$$
	作者的`SE-Drop`=`0.018`，比`camera only`单模态方法小一点。

- Blockage Detection:
$$F1= \frac{2PR}{P+R}$$
`P`->`Precision`,`R`->`Recall`.
展示作者对于F1的`training``validation`的效果,也有一点过拟合，不过是正常的。
`Blockage F1`相比于单模态的提升很小。
- **Localization and SLAM-Style Behaviour**:
将真实和预测轨迹累积在`LIDAR`地图上，实现定性可视化，通过图可以看到预测和真实相差很小
- **Comparsion with Unimodal Baselines**:
**?!强强!?**
#### CONCLUSION
不做赘述


### Digital Twin Based Beam Prediction: Can we Train in the Digital World and Deploy in Reality?
#### Abstract
背景：为发挥`large-scale MIMO`的性能优势，需要准确估计信道+调整窄波束
tradition methods:
遍历尝试每一个`beam`，效率底下
deep-learning and machine learning methods:或许可以解决该问题。
但是现实世界的`dataset`成本太高，利用仿真的`3D model`来模拟真实的通信环境，利用`Ray -tracing`追踪模拟特定地点的信道并降低计算成本，以位置辅助`beam`作为案例研究。事实证明：利用`digital-twin`训练而成的`model`，在真实世界中也有较好的效果，再加上少量的真实数据可以接近最佳性能。
#### Introduction:
`MIMO`前景很好，有诸多优势:
- Multiplexing gain (multi-input and output)多条数据流传输
- Array gain(阵列优势)
但是实现这些诸多优势，需要知道无线信道信息，eg:车辆的相对位置、有无遮挡...,**CSI**->**Channel State Information**,**CSI**获取信息的成本随着天线的增加而增加，**Beam Sweep**开销巨大，使得难以继续扩大性能的优势，也难以支持告诉移动的应用。
作者提出:**Machine and Deep Learnning**+**Digital Twins**
前提：
`digital twins based-sation` 拥有周围物体的位置、方向、运动状态...
- position:(x,y,z)
- orientation*(方向)
- dynamics(动态)，eg:(speed、acculation)
- shapes
- materials
>Q:Ray-Tracing?
>计算到达路径、反射次数、信号强度、延迟
>Q:communciation link?
>BS---------Vehicle

`Digital Twins`产生的`Channel`或是`CSI`帮助`beam selection`、`channel selection`、`resource allcation`*(资源分配)*
```
true condition
↓
Digital Twin
↓
模拟channel
↓
Train the model
```
**Digital Twin = 3D condition + Ray Tracing -> 模拟Channel**
**Machine learning models**可以证明用较低计算成本逼近复杂函数，促使我没使用数据驱动的方法,用**ML**近似数字副本。
注意这里说的是**ML**来代替其中的昂贵部分,而不是代替**Digital Twin**.
**End-to-end communication task**:
以端到端的方式解决现实通信的任务。
```
环境信息
↓
ML
↓
Beam prediction
```
但是虚拟世界与真实世界之间亦有差距，因而需要`transfer learning`。
```
少量Real-World Data
↓
Fine-Tune
↓
适应真实环境
```
>Fine-Tune?
>**微调**

之前有人已经探索了感知辅助无线通信方向(**sensing-aided communication**),在感知辅助系统中，通信设备装备各种传感器，用于`Beam Prediction`、`Blockage Detection`、`Channel Prediction`。
*感知信息和无线信道之间直接关系难以描述时*，**ML**尤其适用.
省略了人工建立公式的过程，因为这个过程将会及其复杂,给`model`喂多模态的`data`。但是基于**ML**的方法需要大量的数据，而现实中却很难收集,从而引出`Digital Twins`
以上都是引出`Digital Twins`的背景.
然后介绍`Digital Twins`相比`Sensing-aided communication`的提升:
- `digital twins`里利用精确的`Ray-tracing`，将数据和通信信道联系起来，充分利用感知数据。
- 减少真实世界信道采集的开销
- `Digital Twin`可以拓展道各个任务
贡献总结:
- **ML**近似`Digital Reokica`,降低运算复杂度。
- `Ray-tracing`本质上是一个复杂的映射，`Environment->Channel`
- 构建**Digital Twin Dataset**,该`dataset`包括1个`real-world dataset`(`from DeepSense 6G`)和1个基于3d射线追踪生成的数字副本数据集。
#### SYSTEM MODEL AND PROBLEM FORMULATION
考虑1个通用`MIMO`系统，其中包含`A`个`BS`和`B`个`UE`提供服务。
第a个基站配备一个包含 $N_a$ 个元素的天线阵列,> 第b个用户设备使用包含 $M_b$ 个元素的天线阵列,另外假设`BS`知道周围环境信息，包括`position`、`orientations`、
`dynamics`、`shapes`、`materials`。
**System Models**:
$H_{b,a}$表示第$a$个基站和第$b$个用户之间的信道，所有信道组成集合，$$\mathcal{H} = \{H_{b,a}|b=1,...,B,a=1,...,A\}$$
准确的信道信息对于发挥`MIMO`系统优势非常关键，需要信道的任务:`precoding`、`Beamforming`、`Handover`、`Resource allocation`、`Interference coordination`（干扰协调)。
$T^*$表示最优解,$S_t$表示1个已有方法,根据信道信息求解通信任务,信道信息获取昂贵，这就是本文所要解决的问题。
$$T^*=S_t(H)$$
`Digital Twin`希望从环境中直接预测,`Environment -> T^*`,$Position + Digital\ Twin \rightarrow T^*$是本文的核心内容。
#### From The Real World To The Digital Replca
`real-world`中，信道$\mathcal{H}$由2部分组成:
- 通信环境$\mathcal E$,包括`position`，`orientations`，`dynamics`,`shapes`
- 信号传播规律 $g(\cdot)$,无线电的传播规律
因而易得信道的数学表达：
$$ \mathcal{H}=g(\mathcal{E})$$
又有：
$$T^*=S_{T}(\mathcal{H})$$
易得:
$$T^*=S_{T}(g(\mathcal{E}))$$
然而然而
- `real-world`中获取$\mathcal{E}$极其困难
- 复杂的环境中,精确的传播规律$g(\cdot)$仍然未知
##### EM 3D Model
提出`digital twin`的做法,真实$\mathcal{E}$,数字$\hat{\mathcal E}$，...
```Digital Twins:
EM 3D Model + Ray Tracing
↓
模拟H
```
>EM 3D Model?
>使用电磁3d模型近似通信环境

获取完整的环境$\mathcal{E}$的方法：
- 记忆已有的静态物体:
- 利用传感器获取环境，基站识别出物体后，可以查询数据库补充信息。
- `loT`设备主动发送信息
##### Ray tracing
**从3D数字环境生成无线信道**：
- 随机信道模型:`stochastic model`,`Ray-tracing`属于确定性模型，不依赖传播参数的概率假设，尝试追踪每一对`TX`和`RX`天线之间的传播路径，根据3d模型中的几何和材料信息`geometry``material`
**`Ray-tracing`考虑的传播现象**:
- **Transmission**:直射
- **Reflection**:反射
- **Scattering**:散射
- **Diffraction**:绕射
每一条路径都有3个重要参数：
- **Path gain**:路径增益
- **Propagation delay**:传播延迟
- **Propagation angle**:传播角度
信道冲激响应公式：
$$tilde h(t) = \sum_{l=1}^{L} \alpha_l \delta(t-\tau_l) G_t(\theta_l^{AoD}) G_r(\theta_l^{AoA})$$
$\delta(t-\tau_l)$表示延迟，$G_t(\theta_l^{AoD})$表示发送方向增益,$G_r(\theta_l^{AoA})$表示接收方向增益。
`digital Twin`中的:
$$\tilde T^* = S_T(\tilde g(\tilde{\mathcal E}))$$
`Ray-Tracing`计算太慢，用`ML`来加速，
- 复杂度高，需追踪大量传播路径
- 3d模型越精确，计算越慢
- `Digital Twin`会导致高延迟
- 实时性不强
##### APPROXIMATING THE DIGITAL REPLA WITH MACHINE LEARNING
**ML-based Digital Replica Approximate**，设计1个ML函数$\mathcal{f(\cdot)}$,输入环境，输出直接近似$\tilde T^* = S_T(\tilde g(\tilde{\mathcal E}))$,定义一个神经网络$\mathcal{f(\cdot;\Theta)}$,其中$\Theta$表示网络参数,例如`bias`，`\Lambda`,该`ML`的输入输出,`input`:数字环境$\tilde{\mathcal E}$,`output`:预测通信方案$\hat{T}$,训练目标公式:$$\max_f E_{\tilde{\mathcal E}\sim \tilde{\mathcal Y}} \{ s(\tilde T^*,\hat T) |\tilde{\mathcal E} \}$$
其中$s(\cdot,\cdot)$表示2者的差异化
?以上$max()$函数表示最大化`ML`预测结果与`Digital Twin`结果的相似度。
作者提出$p(\tilde{\mathcal E})$，用于从3d模型中提取有效信息,最优`ML`公式:
$$f^*(\cdot;\Theta^*) = argmax_f E \{ s( \tilde T^*, f(p(\tilde E);\Theta) ) \}$$
找到最优解$\Theta^*$,令`ML`的输出与`Digital Twin`的结果最为相似.
训练数据是`Digital TWin`自己生成的
`Loss Function`:
$$J_{train} = -\sum_{d=1}^{D} s( \tilde T_d^*, f(p(\tilde E_d);\Theta) )$$
为了最大化相似度，一般的都是最小化`Loss`，因而作者在这里加入了`-`,取`Loss`越小的。
另外，`ML`不能完全依赖`Digital Twin`生成的数据训练，需要加入少量的`real-world`数进行微调，利用`Transfer Learnning`来校准`Digital Twin`带来的误差。
#### CASE STUDY:POSITION-AIDED BEAM PREDICTION
`position-aided beam prediction`
1个拥有`N`个天线的基站，与一个单天线用户进行基站通信，下行传输模型:
$$y=h^Hfs+n$$
$s$->发送信号，$f$->`beamforminf vector`,$h$->信道，$n$->`noise`
**Beam Codebook**:
基站使用1个包含`Q`个预定义`beam`的`codebook`,按照提前设计好的方案调整`beam`,然后在`Q`个`beam`中找到最优解:
$$q^* = S_{pr}(h) = \arg\max_q |f_q^Hh|^2$$
其中,$f_q^Hh$表示第`q`个`beam`和信道的匹配度，因而$q^*$表示的是与信道接收功率匹配度最高的`beam`。
评价`digital Twin`的准确性,定义真实的$q^*$和$\hat q^*$的差异函数:
$$s(q^*,\tilde q^*) = \delta(q^*-\tilde q^*)$$
`ML`的输入,作者这里不用完整的3d模型，只提取`UE`位置，即`input:(x,y)`,`output`:`Beam index`。
#### EXPERIMENTAL SETUP:
##### Real-World Data: DS S 1
静止基站`BS`+移动车辆`UE`
`UE`携带1个`GPS`和`60GHz mmWave Transmitter`，`BS`拥有1个16个天线阵列，每个采样点，进行完整的`beam`扫描，测得$p^i$,
##### Digital Replica Data:
建立数字环境，`UE grids`覆盖车辆可能出现的区域，并利用网格将位置离散化，每个位置模拟一次信道，完成`Ray-Tracing`,然后得到`channel`：$h^d$,然后计算每个`beam`的功率$u^d$,生成`Synthetic`数据$(p^d,u^d)$。
然而`digital Twin`主要由`Los`主导,**Line-of-sight**,直射路径，因而更加需要`transfer learning`。
##### ML Model
用来一个全连接神经网络**FCNN**,包含2个`hidden layer`,每个`hiddenlayer`有256个`node`,激活函数是`RELU()`。
输入:
- 笛卡尔坐标,$(x,y)$
- 极坐标,$(r,\Theta)$
实验表明，用2种重复的坐标可以提高稳定性。
并且将输入归一化,将$(x,y)$坐标分别除以距离的最大值
输出:
16个node,因为有`16`个`Beam`候选，分类问题，且将在最终输出之前加入softmax回归。
训练方法:
加入`Adam`优化器,并且`Fine-tune`。
#### Evaluation Results
利用`Digital Twin`:`UE position`->`Beam`，评价指标:
- `Top-k Accuracy`
- `Top-k Relative Receive Power`:$\frac{ \text{预测beam最高接收功率} } { \text{真实最佳beam接收功率} }$
##### can the1 digital Twin Matches The Reality:
使用最近邻方法：仅依靠Digital Twin，不用beam训练，不用信道估计，就可以获得84.8%的接收功率。
##### Can the model TRained in the digital World Work in Reality?
`Real-World`->`NN`+`Digital Twin`->`NN`
`measured codebook`+`uniform beam codebook`,`ML`完全不需要任何真实数据。
又因为任务简单，`Digital Twin`输入是简单的$(x,y)$，因为仅在100个时候就收敛，因而证明了`Digital Twin`数据可以训练真实可用模型,`beam codebook`很重要。
##### Does Transfer learning Improve The ML Performance?
**Digital World**和**Real World**之间存在**Sim-To-Real Gap**：仿真到显示的差异，对于`Digital Twin`训练的数据，需要加入`Fine-Tuning`微调，结果表明：
- 少量的`real-world data`就可以明显提升
#### CONCLUSION
不做赘述

### Multimodal Radio and Vision Fusion For Robust Localization in Urban V2I Comminications
#### Abstract
**CSI+GPS**、**contrastive learning**
`input`:
- **CSI**
- **Vision**
组合 **(CSI,Image)**
`output`:
- 位置$\hat s$
#### introduction
准确定位是**V2I**通信系统的基础，**GPS**信号会被遮挡影响，`4G`->`5G`无线定位的发展:观察:
- **OTDOA**:观察到达时间差
- **UL-TDOA**:Uplink Time Difference of Arrival
5G带来的提升:
- **PRS**:定位参考信息
- **RTT**:往返时间
- **Angle-Based methods**:基于角度的方法 
- `5G`可以达到厘米级:带宽更大、信号处理更强
但是问题仍然存在：
- **Multipath**:信号并不只是直线传播
- **NLOS**:`None-Line-of-Sight` 非视距
- **AoA methods**被干扰
- 带宽的限制
提出的解决方案是:将**CSI**和路测摄像头视觉数据融合。
**Vision**提供了什么?
- 环境地表信息,eg：`建筑`、`路口`、`交通标志`
- **CSI**:当视觉失败是提供稳定的信息
**DL Net**将**CSI**和**Vision**融合了起来
举了2个应用方向:
- `beam received power and visual data for GPS denoising`
- 多个摄像头做联合定位
本文提出：
- **Multimodal contrastive learning regression based localization framework**:多模态对比学习回归定位框架
- 只需要`single RSU`和单目摄像头(双目摄像头可以直接估计深度)
- `feature alignment`+`Fusion`:并非简单的叠加
#### SYSTEM MODEL
**RSU(road side unit)** 装有:单目摄像头和其他传感器，利用**UE**上传的`CSI`和`camera vision`数据，进行高精度定位。
**uplink CSI for the UE**:上行信道状态信息，注意**uplink**:`UE`->`RSU`
**OFDM**系统:将一个宽带宽拆成若干个小频率,无线阵列**UPA**,`RSU`需要`UE`发送参考信号,目标是估计**UE**位置:
$$\mathbf p_{UE} = [p_{UE}^{x}, p_{UE}^{y}, p_{UE}^{z}]^T$$
其中$(x,y,z)$是`3dim`坐标
**CSI**的定义:$\hat h_{m,k}$(m个天线，k个子载波),$\hat h_{m,k} = |\hat h_{m,k}| e^{j\angle \hat h_{m,k}}$
例如有`M`个天线,`K`个子载波:
$$H = \begin{bmatrix} h_{1,1}&h_{1,2}&...\\ h_{2,1}&h_{2,2}&...\\ ... \end{bmatrix}
$$
weight\*height->M\*K
一般的**CSI**的多径模型:
$$\hat h_{m,k} = \sum_{l=1}^{L} \alpha_l e^{-j2\pi(f_c+k\Delta f)\tau_l} a_m(\theta_l,\phi_l)$$
其中$\alpha_l$、$\tau_l$、$a_m(\theta_l,\phi_l)$分别表示 增益、延时、与对应角度的天线响应
```
          UE
          |
          | RS signal
          |
          ↓

       无线环境

  ┌──────────────┐
  │ LoS路径      │
  │ 反射路径     │
  │ 散射路径     │
  └──────────────┘

          ↓

       RSU UPA

          ↓

    CSI matrix H

          ↓

 Neural Network

          ↓

    UE Position
```
每个子载波看到不同的相位,因而加上不同的延时
$$d(\tau)= \begin{bmatrix} e^{-j2\pi f_c\tau}\\ e^{-j2\pi(f_c+\Delta f)\tau}\\ ... \end{bmatrix}$$
**2d矩阵**可以进一步分解为`x`矩阵*`y`矩阵
$$a(\theta,\phi) = a_y(\theta,\phi) \otimes a_x(\theta,\phi)$$
以`x`为例:沿着x方向有不同的相位延时
$$a_x(\theta,\phi) = [ 1, e^{j2\pi\frac d\lambda \cos\phi\sin\theta}, ... ]$$
#### 3D Localization Methods:
##### Traditional Method:
**CSI**->`Angle`->`Position`
对**CSI**而言,有$\hat H_F\in C^{M\times K}$
$$\hat R_h = \frac1K \sum_{k=1}^{K} H_kH_k^H$$
又，传统的方法假设:最强的信号来源于`LoS`直射，然而真实的协方差在现实中无法测量，因为固定的相位差是未知的，因此采用样本平均协方差矩阵$\hat R_h = \frac1K \sum_{k=1}^{K} [\hat H_F]_{:,k} [\hat H_F]_{:,k}^{H}$,接下来对该协方差矩阵进行特征值分解，$\hat R_h = U\Lambda U^H$,将信号与噪声分开，$= U_s\Lambda_sU_s^H + U_n\Lambda_nU_n^H$,其中$U_s$是信号子空间，$U_n$是噪声子空间，Λ是特征值组成的对角矩阵，即$U= [U_s,U_n]$。信号子空间的确定?$U_s=[U_s]_{:,1}$,$\Lambda_s=[\lambda_1]$,最大的特征值$\lambda_1$对应的是真实信号，剩余的`M-1`则是噪声。
**MUSIC伪谱**:
$$P_{MUSIC}(\theta,\phi) = \frac1{ a^H(\theta,\phi) U_n U_n^H a(\theta,\phi) }$$
假设信号来自某个方向，这个方向和噪声的空间是否正交？
其中$a(\theta,\phi)$是真实方向，$U_n^Ha(\theta,\phi)$应该正交，约等于`0`，因而$P_{MUSIC}$应该趋于$\infty$
$$(\hat\theta,\hat\phi) = argmax P_{MUSIC}(\theta,\phi)$$
取得最优角度
**Range**估计:
利用$IFFT$,将频域转化为时间延迟域。
$$H_D=IFFT(H_F)$$
得到**Delay-domain channel**,$H_D\in C^{M\times K}$,将所有天线的信息平均:
$$\bar h(\tau) = \frac1M \sum_{m=1}^{M} [H_D]_{m,:}(\tau)$$
找最大峰,$$\hat\tau = argmax_\tau |\bar h(\tau)|$$
时间->距离:$\hat d=\hat\tau c$
**Positioning**:
已有方向$(\hat \Theta,\hat \lambda)$,距离$\hat d$,由公式：
$$\hat p_{UE} = \hat d r(\hat\theta,\hat\phi) + p_{RSU}$$
其中$p_{RSU}$是RSU位置，`RSU坐标 + 距离方向= UE坐标`。
##### Proposed Multimodal Localization via CSI and Visual Feature Fusion
**CSI**+**Vision** `raw data`,不能直接输入网络，先进行特征提取。
- **CSI Encoder**:
作者只去$|\hat H_F|\in R^{M\times K}$,输入$f_{CSI}(\cdot)$,有:
$$z_{CSI}=f_{CSI}(|\hat H_F|)$$
输出$z_{CSI}\in R^{d_{CSI}}$
- **Vision Encoder**:
图片输入一个经过微调的`ResNet`,其中$X_{Vision} \in R^{W_{Vision}\times H_{Vision}\times C_{Vision}}$,$z_{Vision}=f_{vision}(X_{Vision})$
- **CSI-Vision Alignment**:
将上面的输出再次加入一个简单的`Net`:
$$\begin{align}
x_{CSI}&=h_{CSI}(z_{CSI})\\
x_{Vision}&=h_{Vision}(z_{Vision})
\end{align}
$$
**L2 归一化**：
$$\begin{align}
\bar x_{CSI} &= \frac{x_{CSI}}{||x_{CSI}||_2}\\
\bar x_{Vision} &= \frac{x_{Vision}}{||x_{Vision}||_2}
\end{align}
$$
**Localization Regression**:
对齐后有$x_{Joint} = [\bar{x}_{CSI};\bar{x}_{Vision}]$,将`CSI`和`VISION`拼接而成，并将$x_{joint}$输入一个回归网络，$$\hat p_{UE} = f_{Predict}(x_{Joint})$$,输出$\hat p_{UE}$表示`UE`的位置。
**Learning Objective of The Netural NetWork**:
同时优化2个目标:
- **CSI**和**Vision**特征对齐
- 让位置预测更加准确
###### Loss
- **Loss1:Localization loss:**
$$L_L = \frac1B \sum_{i=1}^{B} ||p_{UE}^{(i)} - \hat p_{UE}^{(i)} ||_2^2$$
预测位置与真实位置的MSE
- **Loss2:Contrastive Loss:**
训练一个匹配系统
```
CSI1 ↔ Image3
需要惩罚
```
**相似度矩阵**:
$S\in R^{B\times B}$
```
          Image

        1   2   3   4

CSI 1 0.9 0.2 0.1 0.3

CSI 2 0.1 0.8 0.2 0.4

CSI 3 0.2 0.1 0.95 0.2

CSI 4 0.3 0.2 0.1 0.9

其中，对角线就是正确匹配
```
$S_{ii}$应该最大，又有:
$$L_C = -\frac1B \sum_i \log \frac{e^{S_{ii}}} {\sum_j e^{S_{ij}}}$$
用于降低错误匹配的概率。
- **Loss 3: Adaptive weighted total Loss:**
已知$L_{L}$和$L_{C}$,有:
$$L_{Total} = \frac1{2e^{s_C}}L_C + \frac1{2e^{s_L}}L_L + \frac12(s_C+s_L)$$
让**CSI**和**Vision**在1个视觉空间里相互约束，然后联合预测位置。

#### SIMULATION RESULTS:
- **Simulation Setting:**
使用**DT31**作为dataset,比较4中方法:
- **Evaluated Methods:**
	- **CSI+Vision model**:
	- **CSI only model**:
	- **Vision only model**:
	- **Tradition method**:
列举出了4种方法的表格和图。
- **Simulation Results**:
	- **Training Loss Analysis**:
		- **Localization Loss**急速下降
		- **Contrastive Loss**急剧收敛
		- **Adaptive weighting**调整的不错
	- **Localization Error Analysis**:
		结果表明定位较为精准，且比其他单模态方法都要强
- **Complementarity of CSI and Vision Modalities**:
$$\rho= \frac{Cov(\Delta p_{CO},\Delta p_{VO})} {\sigma_{CO}\sigma_{VO}}$$
	计算相关系数，结果表明$\rho$接近0，几乎没有线性关系，从而证明**CSI**和**Vision**的信息并不重叠，而是互补。
##### Complexity Analysis
复杂度指标:
- **Network parameters**: 超过11million
- **GFLOPS**: 1.82
需要更高的计算资源。
#### CONCLUSION:
不做赘述

### Reading Radio From Camera:Visully-Grounded,Lightweight,and Interpretable RSSI Prediction
#### Abstract:
已有的视觉预测方案存在:
- 计算量大
- 受环境变化影响
提出**物理引导+轻量化框架**,`input`：`Camera image`,`output`:`RSSI`(`Received Signal Strength Indicator`),作者不直接预测`RSSI`,而是将其分为:
- **Path Loss**
- **Shadow fading**
从而降低学习维度，并更容易解释，对环境的鲁棒性更强，使用`MobileNet`十分的轻量化、参数少。
#### Introduction:
传统方法困难重重,**DL methods**提供帮助,但许多**DL**是1个黑盒，而**RSSI**需要考虑更多，$$ RSSI = Path\ Loss + Shadow\ Fading $$,`DL`方法还有老生长谈的问题:缺乏可解释性；鲁棒性差，作者认为暴力端到端太捞了，提出一个具有物理可解释性的框架，从视觉语义预测，组合成$RSSI$
优势:
- 可解释性
- 性能
- 鲁棒性
不暴力端到端、不适用直接回归、利用无线传播基本规律、将**RSSI**分解,$$RSSI=PL+SF$$
从视觉语义预测**PL**和**SF**，$$RSSI=P_{tx}-PL-SH$$
为什么比普通的深度学习好?
**structured**、**physics-guided**...
主要贡献:
- **Physics-Guided Interpretable Learning**；
- 高性能高效率
- 抗干扰、鲁棒性
- 边缘设备部署潜力
#### Related Work
之前研究主要分为2类:
- **Radio map-based RSSI prediction**
基于无线电地图的`RSSI`预测
- **Camera-based RSSI prediction**:基于摄像头图像的`RSSI`预测
	- Indoor:
		- 使用`RNN`,输入连续深度图片
		- 或预测mmWave链路种的动态遮挡
		- 多模态融合
	- Outdoor:
		- 目标检测(例如YOLO)->根据目标预测`RSSI`
作者不认可:
- `blackbox`
- 模型太大
后续工作：预测更多无线参数，利用语义分割
- Challenge1:无法同时满足:
	- interpretable
	- robust
	- lightweight
- Challenge2:brute-force prediction
#### PHYSUCALLY INTERPRETABLE PREDICTION OF RSSI
$$Image \rightarrow PL,SH \rightarrow RSSI$$

$$RSSI=P_t-PL-SH$$
其中$P_t$是发送功率，$PL$是`Path Loss`,$SH$是`Shadow Fading`
$PL$计算:$\alpha(n,d)=10n\log_{10}(d)$,其中$d$是$TX$和$RX$之间的距离，$n$是路径损耗指数，但是实际中$P_t$不好求，所以$SH$求不出来->不用真实的$SH$,而是构造1个替代量。
由已知:$$P_t-\beta=RSSI+\alpha$$
作者定义:$$SH=P_t-\beta$$
易得:
$$RSSI=-PL+SH$$

#### Model Architecture
3个并行的特征编码分支，加上2个预测头，分别预测$PL$和$SH$
`input`:rgb图片,`2dim`位置,`Bounding Box`信息，分别用于理解环境、学习距离和$PL$、理解遮挡和$SH$。
3种`input`分别输入3个`encoder`：
- `Image Encoder`:`MobileNet`使用视觉网络提取高级的语义信息
- `Position Encoder`:`MLP`输入$(dx,dy)$,输出$Z_{pos}$
- `Bounding Box Encoder`:处理目标检测得到的`bounding box`信息，`MLP`+`CNN`
- 3个`Encoder`的输出融合后送入`PL Head`和`SH Head`,输出`PL`和`SH`，最后有$$RSSI=-PL+SH$$
#### EXPERIMENTAL SETUP
- Dataset and Preprocessing:
	`input`:
	- `rgb image`
	- `GPS Coordinates`
	- `Bounding Boxes`
	- `RSSI Measurements`
	预处理:
	- Image:
		- Resized
		- 归一化
	- GPS..
		- 转换为`TX`和`RX`之间的相对距离
	- Bounding Box:
		- 最多保留10个box
- **Training Details**:
	- Shuffle,分训练集、验证集、测试集
	- **multi-objective loss**:
	$$L_{total} = \lambda_{PL}L_{PL} + \lambda_{SH}L_{SH}$$,其中$L_{PL}=(\hat {PL}-PL)^2$,分为2个阶段训练:
	 - Stage1:**Frozen Image Encoder**:
			**Image Encoder**中的参数不更新,这里的`Encoder`是`MobileNetV3`,已经学会了`边缘``纹理``物体特征`等`feature`
	 - Stage2:**Fully Fine-Tuning**:
##### Evaluation Metrics:
选择1个`baseline`进行比较，使得评价更加公平，评价指标:
- **RMSE**:$$RMSE= \sqrt{ \frac1N \sum_{i=1}^{N} (y_i-\hat y_i)^2 }$$,对于大的错误惩罚力度极其大
- **MAE**(Mean Absolute Error),平均绝对值误差
- **1dB Tolerance Rate**:误差小于1DB的样本比例
#### RESULTS AND ANALYSIS
- **Overall Performance**:
	模型整体表现准确、稳定。
	- Stage1误差小，Stage2后又明显下降
	- `Fine-Tuning`有效
- **comparsion to baseline**:简单、小型模型反而更好
	实验验证:
	- 有干扰物和去掉干扰物的数值，几乎没有变化->模型对干扰物不敏感
	- `Baseline`对于干扰物十分敏感，若无人工去干扰，下降将会十分明显
	- 模型复杂度低:`2.51M`
	- 提前告知网络$RSSI=-PL+SH$,并不单纯端到端
	- 得出结论:轻量的模型并不是牺牲性能，反而因为结构设计合理，可以：更准确、鲁棒、和减少计算
- **Impact Of Environmental Information**:
	- 同`Baseline`相比最佳:`0.78dB`,物理分解提高抗干扰能力
	- 轻量化:`2.51M`,低了数十倍
#### CONCLUSION:
不做赘述

### JEPA-MSAC:A Joint-Embedding Predictive Archiitecture for Multimodal Sensing-Assited Communications
联合嵌入架构-多模态非监督对齐
#### Abstract
**非监督学习**、将多模态数据映射到统一的`token`空间中。`shared backbone`、`temporal block-masked`、自监督学习:预测性的`latent`空间，其中包含:`environment dynamics`、`cross-modal dependencies`、预训练完成后，将`backbone`冻结，不再训练，而是作为通用特征提取器，在这个基础上，只训练很小的`task head`:`localization`、`beam prediction`、`RSSI prediction`，这个`lantent`状态：可以支持多个任务，且适配成本低，因为不用重新训练，此外，该文章还研究：消融实验->看数据量有无提升、预训练策略哪个更重要。
#### Introduction:
将`AI`引入物理层的通信，是趋势，克服传统基于数学模型的方法的限制。多模态感知辅助通信，加入**OOB modalities**,**LLM**类主要解决:输入->任务输出的问题，而不能理解物理世界的变化，作者认为更好的方向是学习`predictive latent repression`，采用**world-model**思想。
作者认为现在的方法都是针对某一个特定的任务区进行训练:*每一个新的任务都需要重新训练，十分浪费*->提出:先学习一个**shared predictive latent state**，然后这个表示给不同任务使用。**JEPA-MSAC**学习的是环境如何变化，
#### SYSTEM MODEL
**V2l**场景的框架由3个部分组成:
- **方向性波束成形架构**
- **定位模型**
- **多模态感知和通信空间**
##### mmWave V2l Commuication and ULA Beamforming
`BS`有1个`ULA`(Uniform Linear Array),`UE`全向接收，接收信号时不用调整方向，`BS`使用`beam codebook`，并不是任意调整方向，又因为空间稀疏,`mmWave`传播路径少，最后进入信道模型:$h[t]$表示t时刻的信道。
$$h[t]= \sqrt{\frac{N_{Ant}}{L[t]}} \sum_{l=1}^{L[t]} \alpha_l[t]a(\theta_l[t])$$
总信道=所有传播路径叠加。
接收信号模型:
$$y_k[t]=\sqrt{P_{tx}}h^H[t]w_k s[t]+n[t]$$
`beam`选择问题,目标->找到最优解
$$k^*[t] = \arg\max_{k\in\{1,...,K\}} |h^H[t]w_k|^2$$，遍历所有`beam`，找到最优解
##### Multimodal Sensing Observation Space
目的：减少完整的`beam`扫描
定义:$O[t]=\{X_m[t]\}_{m\in M}$,包含$M=\{Image,Radar,LiDAR,GPS,RF\}$,
##### Problem Formulation
- 时间序列划分，$O[1],O[2],...,O[T]$
- 历史窗口VS未来窗口:
	- 历史:$t\in\{1,...,T_{Hist}\}$
	- 未来:$\tau\in\{T_{Hist}+1,...,T\}$
当前时刻的输入是:
$$O[t]=\{O[t-T_{Hist}+1],...,O[t]\}$$
过去$T_{list}$帧，因为通信环境有动态的变化。
模型预测3个目标:
- 车辆的未来位置$Y_{Loc}[\tau]\in R^2$
- 未来最佳`beam`$Y_{Beam,\tau,:}\in\{0,1\}^K$,采用独热编码
- 未来$RSSI$
- 未来目标组合起来$Y_{Loc}\in R^{T_{Pred}\times2}$
- 最终的优化目标:
	$$\max_{\Theta} P(Y_{Loc},Y_{Beam},Y_{RSSI}|O[t];\Theta)$$
#### JEPA-MSAC Architecture
##### Multimodal Data Preprocessing
- **Vision Preprocessing**:`crop`and`resize`,$$V[t]=(Resize(X_{Image}[t])\ominus\mu_V)\oslash\sigma_V$$
	- 标准化(减均值，除以标准差)
	- 处理之后得到的$V[t]$,包含图片中的语义信息,eg:`车辆`、`行人`...
- **FMCW Radar Range-Angle Mapping**：
	要将`Radar`采集的信息转换为类似于图片的形式，`FMCW`是调频连续波雷达->雷达发射1个频率不断变化的波
	- **Raw Radar Data**:$X^{(c)}_{Radar}[t]\in C^{N_{rx}\times N_{adc}}$
	- 对事件采用做**Range FFT**，去除静态杂波
	- 第二步:**Angle FFT**角度**FFT**,得到2dRadar图
	$$R(i,j)[t] = \frac1{N_{chirp}} \sum_{c=1}^{N_{chirp}} |w_i^H X^{(c)}_{Radar}[t] w_j|$$
	对于第$i$个角度，第$j$个距离，计算能量。
- **3D LIDAR Point Cloud Depth Projection**
	- 原始的`LIDAR`数据是无序的、不规则的点云，但是神经网络需要的是二维深度矩阵
	```
(x,y,z)
↓
球坐标
距离 + 水平角 + 垂直角
↓
投影到二维图像
↓
Depth Image
	```
$(x,y,z)$->$(r,\phi_{yaw},\phi_{pitch})$,投射到2d平面，建立1个`LIDAR`深度图($H_{LIDAR}*W_{LIDAR})$,利用不同公式将横纵坐标分别映射为该深度图中的$H$和$W$坐标，最终得到深度矩阵。
- **GPS Equirectangular Projection**:
	**GPS raw data**:(`latitude`,`longtitude`)
	转换为局部2维坐标$p[t]= \frac{\pi R_E}{180} D(X_{GPS}[t]-x_{BS})$,
##### Multimodal Tokenization
$$O[t'] = \{V[t'],R[t'],L[t'],p[t'],x_{RF}[t']\}$$,一个时刻$t^{'}$的多模态数据,格式互异,先用各自的`encoder`转化为`token`:
- Vision Tokenizer:
	使用已经训练好的**EfficientNet**,提取物体、纹理、场景,输入$V[t]$,输出`feature`,然后自适应平均池化，然后做1\*1卷积,将`feature`维度统一,最后`flatten`,得到$Z_{Image}[t]\in R^{P_{Image}\times D}$,
	>Q:1\*1卷积的意义?
- **Radar/LIDAR Tokenizer**:
	作者将**RADAR**、**LIDAR**放在一起，因为它们都是空间几何信息，然后同上做一个神经网络的数据预处理的基本操作。
- State Tokenizer:处理低维数据:
	- **GPS**:$p[t]\in \mathcal{R}^{2}$
	- **RF**:$x_{RF}[t] \in \mathcal{R}^{K}$
	- 然后都`layer normalization`
- 将所有模态统一到`D`维，最终得到一个多模态信息$Z[t] \in \mathcal{R}^{D}$,最后将所有的时间拼起来得到$$Z=\{Z[t^{'}|t^{'}=1,...,T]\}$$,送入`shared transfomer backbone`
##### Factorized Positional Embedding
分解式位置编码
上面`tokenizer`之后,我们得到了1个长序列$Z={Z[t^{'}]}$,因为`transformer`需要每个`token`之间的位置关系来传递某种信息，但是多模态的`token`位置信息所传递的又不一样，作者提出**Factorized Positional Embedding**,$$E_{pos}=E_{time}+E_{modal}+E_{space}$$,将一个复杂的位置关系分解为了
```
时间因素+模态因素+空间因素
```
##### Temporal Block-Masked JEPA Pretraining
前面训练了1个多模态`transformer backbone`,这里介绍**JEPA**,不是直接预测图片，有3个网格:
- **online context encoder**:
- **momentum-updated target encoder:
- **predictor**
有2个设计考虑:
- **Latent prediction over data reconstruction**
- **Temporal Block Masking**:时间块遮挡，加强对未来的预测能力，鼓励模型学习:
	- temporal dynamics
	- cross-modal dynamics
前面定义的$\tilde Z=\{z_i\}_{i=1}^{I}$，其中$I$是总`token`的数量，$i$是`token`的位置编号，即是所有的模态经过`tokenization`后，拼接成1个长序列。对于每一种模态，随机选择1个连续时间片进行遮挡，不是随机遮挡，而是**按时间连续遮挡**，又$T_{Mask}=\lfloor \rho T\rfloor$,$T$是时间长度，$\rho$是`mask`比例，定义被遮挡和保留的`token`分别是$I_{Keep}$和$I_{Mask}$。
**JEPA**主要由3个部分组成:
- **Context Encoder**:
	输入：$Z_{Keep}$,输出$C=f_\theta(Z_{Keep})$
- **Target Encoder**:
	作用是:产生真实答案，但是参数的更新方式不同，是一点点接近`Context Encoder`,使得目标更加稳定。
- **Predictor**:
	预测被遮挡部分的`lantent`
$$C=f_\theta(Z_{Keep})$$,将没有被遮挡的`token`输入`context encoder`,输出$C$,尺寸是$R^{|T_{Keep}|*D}$,作者构造$C_{Pred}$,如果$C_{Pred}[i]=C[i]$,
由$\hat U=g_\phi(C_{Pred})$,`predictor`输出：完整的`latent`序列，其中被`mask`的位置，就是模型预测的->JEPA真正解决的问题是:根据现在看到的信息，缺失部分应该对应什么样的隐藏状态?
上面得到了$\hat U$，下一步我们怎么知道它对不对，此时需要**Target Encoder**:$f_{\Theta}$,输入完整序列:$Z$,这里的$Z$不是`mask`后的，而是完整的信息。
计算**JEPA Loss**:
$$L_{JEPA}=\sum_{i \in I_{Mask}} Smooth_{L1}(\hat U_{i},U_{i}^*)$$,上式中只比较**被遮挡的位置**，因为没有遮挡的位置本来就知道，没有必要去预测。其中$Smooth$是一种类似于$MSE$的误差函数，但是人如其名，更加的`smooth`,$$\bar\theta = \beta\bar\theta+(1-\beta)\theta$$,使得**Target Encoder**的参数$\hat \Theta$不仅与自己相关，还和**Context Encoder**的参数$\Theta$相关。
##### Froze-BackBone Prediction
**JEPA**预训练得到了1个很强的`backbone`，然后将其冻结，参数不再更新。下游3个任务:
- Localization
- Beam Prediction
- RSSI Prediction
输入:$Z_{List}$->历史观测，经过**JEPA**的`backbone`,得到预测`latent`:$S_{Pred}$
$$S_{Pred} = Pool(\{\hat U_i|i\in I_{Mask}\})$$,对每一个被`mask`的`token`，做平均池化，得到一个平均的未来状态表示,称之为**predictive latent state**，不是简单预测某一个特定的任务，而是包含各个任务变化的`backbone`,然后将`backbone`冻结，只训练小的`task head`
作者还做了1个特殊的情况：目标任务需要的历史数据不存在->`backbone`自己生成。
- Localization/Tracking
	目标是：预测未来车辆位置，作者采用*粗估计+残差修正*的方法：
	- 
		$$\hat Y_{Loc}[\tau] = p[T_{Hist}] + (\tau-T_{Hist}) (p[T_{Hist}] - p[T_{Hist}-1])$$,最后位置+速度\*时间。
		如果没有历史位置:$$\hat Y_{Loc}=MLP(S_{Pred})$$,用1个小的`MLP`，直接估计粗略的位置
	- 残差修正:
		$$\Delta Y_{Loc} = h^{Res}_{Loc}(S_{Pred})$$,再使用1个`Net`估计修正量，最终:$\hat Y_{Loc} = \tilde Y_{Loc} + \Delta Y_{Loc}$,最终位置=粗估计+修正量。
		**Localization Loss**:
		$$L_{Loc} = \frac1{T_{Pred}} \sum ||\hat Y_{Loc}-P||_1$$
- Beam Prediction:
	$S_{Fused} = [S_{Pred};\hat Y_{Loc}]$,拼接**JEPA latent+预测位置**->`Beam`分类头
	```
	Projection layer
	↓
	GRU
	↓
	MLP Decoder
	```
	输入:$S_{Fused}$,输出$\hat Y_{Beam}^{Cls}$->表示每一个`Beam`的概率
	- **Beam Loss**:
	$$L_{Beam} = \frac1{T_{Pred}} \sum CE(\hat Y,Y)$$
- RSSI Prediction:
	```
	H_{List}[多模态历史]
	↓
	JEPA backbone
	↓
	S-pred
	↓
	RSST task head
	↓
	预测 RSSI
	```
	**RSSI Prediction**依旧用融合状态的$S_{Fused}$,目标是预测**所有`beam`上的功率**,然后再用1遍**粗估计+残差修正**,最终得$$\hat Y_{Beam}^{Pow} = \tilde Y_{Beam}^{Pow} + \Delta Y_{Beam}^{Pow}$$,然后对所有`beam`功率求平均，$$\hat y_{RSSI}[\tau] = \frac1K \sum_{k=1}^{K} \hat Y_{Beam}^{Pow}[\tau,k]$$，得到平均信号强度，
	- RSSI Loss:
		$$L_{RSSI} = \frac1{T_{Pred}} \sum Smooth_{L1} (\hat y_{RSSI},X_{RF})$$
#### Simulation Results:
- Datasets and Platform
	采样方式:滑动窗口法，数据划分...
	训练:
	- `backbone`的训练:随机遮挡一部分，自监督学习
	- 冻结`backbone`,微调超参数，寻找最优解$\Theta$
- Baseline Schemes:
	- AR Model(自回归模型)
	- GRU(循环神经网络)
	- Transformer
	针对任务的方法：
	- Localization:卡尔曼滤波
	- Beam Prediction:$M^2Beam LLM$、$LoRA$
	- RSSI Prediction:
- Evaluation Metrics:
	- Representation Quality Metrics:
		- RankMe:衡量`latent`的空间复杂程度
		- LIDAR:不是那个雷达，是`Linear discriminant analysis rank metric`
	- Localization Metrics:
		- ADE:
			$$ADE=\frac1{T_{Pred}} \sum_{\tau=T_{Hist}+1}^{T}d_{Loc}[\tau]$$,未来时间点的误差平均
		- FDE:(Final Displacement Error)
			只看最后1个预测点
	- Beam Prediction Metrics:
		- Top-N Accuracy
		- L1-RSRP difference 功率损失
	- RSSI Prediction Metrics:
		- RMSE
		- MAE
- Downstream PHY-Tasks Performance:
	进入真正的实验结果，结果显示以上评价指标表现良好!
- Latent Space Quality
	分别验证:
	- `latent`空间质量
	- 下游任务性能
	- 维度变化对上文指标的影响，中等维度验证最佳`D=128`
- Comparsion of Different Training Paradigms
	将本文方法与重构式自监督学习和多任务自监督学习比较
- Complexity and Efficiency Analysis:
  - Model complexity
  - Inference latency
	计算量主要花在了`shared backbone`,结果表明该**JEPA**架构在复杂度上人具有优势
#### CONSLUSION
不做赘述

### StandPoint:
- 基于**DeepSense 6G**和**DeepVerse 6G**多模态数据集，进行数据预处理，数据集划分，归一化，`Loss Function`...等等基本的神经网络训练流程,利用 DeepVerse6G 的大规模仿真数据增强 DeepSense6G 的真实数据训练，然后用完全真实的 DeepSense 数据测试,不过二者可能在不同的`Scenario`中，需要进行`Transfer Learning`,这个还需要思考
- 可以跨场景`Scenario`泛化测试，验证更强的鲁棒性，例如在:`Scenario 31`的训练，可以放在另一个`Scenario`中进行验证和测试，值得一提的是,每一个不同的`Scenario`都需要有统一的数据形式，才能在不同场景中应用,其中:
	- `Scenario 31-34`模态最完整
	- `Scenario 36-39`有`V2V`场景
	- `41-44`方向更新
- 类似于上面的`mask`遮挡，可以提出每一次缺失某一个模态验证模型的鲁棒性
- 上面几篇文章几乎都用的较为简单的`CNN`、`transformer`或是加入物理世界的信息因素使它有一点`World Model`的味道，设计每个模态任务单独的模型，但是使得不同模型之间有某种联系，实现上面提到的多模态融合
	- 加入物理感知的`feature`,使其有`World Model`的味道，例如根据`BS`、`UE`位置，计算距离、`AoA`...
- 我可以使用1个较上面更为复杂的模型:
	- `CNN`+`RNN`,eg:`GoogleNet`
	- `Mamba`
	- `GNN`
	- 或是可以给不同模态使用不同模型，最终进行融合
		```
                 Camera
                    |
              ResNet + Attention
                    |
                    |

LiDAR ---- PointNet++ ----|
                          |
Radar ---- 3D CNN --------|---- Cross Modal Fusion
                          |
CSI ----- CNN/Mamba ------|
                          |
GPS ----- Motion Encoder --|
		```
- 任务选择:
	- 前面几篇多做`Beam Prediction`
	- `Localization`
	- `Blockage Prediction`
	- `RSSI Prediction`
	- 我暂时对`task`没有什么想法，只能想到上文提到的这几个任务或是对若干个进行联合任务
- 选择较为单一和简单的模型作为`baseline`进行对比
- 选择不同的评价指标，`Evaluation`时将自己选择的模型的各个评价指标的数据与`baseline`进行对比，并且将不同`baseline`之间的图或表格绘制在一起作对比