---
title: "R-CNN"
published: 2026-05-23
description: ""
tags: ["D2lNotes"]
draft: false
---
## R-CNN
- 使用启发式搜索算法来选择锚框
>什么是selective search
- 使用预训练模型来对每个锚框抽取特征
- 训练一个SVM来对类别分类
- 训练一个线性回归模型来预测边缘框偏移
## Rol Region of Interest 兴趣区域池化层
给定一个锚框，均匀分割成n\*m块，输出每块里的最大值
不管锚框多大，总是输出nm个值
<img src="/posts/assets/1k4qdwe-Pasted-image-20260523222508.png" alt="Pasted image 20260523222508.png" loading="lazy" />
## Fast RCNN
使用CNN对图片抽样特征
使用ROL池化层对每个锚框生成固定长度特征
## Faster R-CNN
使用一个区域提议网络来替代启发式搜索来获得更好的锚框
<img src="/posts/assets/rcz97n-Pasted-image-20260523223215.png" alt="Pasted image 20260523223215.png" loading="lazy" />
## Mask R-CNN
**如果有像素级别的标号，利用FCN来利用这些信息
<img src="/posts/assets/1x1wbkg-Pasted-image-20260523223506.png" alt="Pasted image 20260523223506.png" loading="lazy" />
#### Conclusion:
- R-CNN 是最早也是最有名的一类基于锚框和CNN的目标检测算法
- Fast/Faster R-CNN持续提升性能
- Faster R-CNN 和 Mask R-CNN 是在追求高精度场景下的常用算法

## Single Short Detection SSD 单发多框检测
### 生成锚框
对每个像素，生成多个以它为中心的锚框
给定n个大小s1,...,sn和m个高宽比，那么生成n+m-1个锚框，其大小和高宽比分别为:(s1,r1),(s2,r1),...,(sn,r1),(s1,r2),...,(s1,rm)
### SSD模型
一个基础网络来抽取特征，然后多个卷积层块来减半高宽
在每段都生成锚框
- 底部端来拟合小物体，顶部段来拟合大物体
对每个锚框预测类别和边缘框
<img src="/posts/assets/uez921-Pasted-image-20260523224931.png" alt="Pasted image 20260523224931.png" loading="lazy" />
**SSD通过单神经网络来检测模型
以每个像素为中心的产生多个锚框
在多个段的输出上进行多尺度的检测
## YOLO
You only look once
- SSD中锚框大量重叠，因此浪费了很多计算
- YOLO将图片均匀分成S\*S个锚框
- 每个锚框预测B个边缘框
- 后续版本有持续改进
