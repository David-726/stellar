---
title: "deepspeed 基本概念、原理"
published: 2026-09-05
description: ""
tags: ["Pytorch distributed"]
draft: false
---
- 事实上成为了很多大模型公司做LLMs分布式训练的标准组件:
- a key appeal of ZeRO if that no model code modifications are required
	- using ZeRO in a DeepSpeed model is quick and easy because all you need is to change a few configurations in the DeepSpeed configuration JSON。**No code changes are needed**
- 3篇论文:(Zero Redundancy Optimizer)
	- ZeRO:Memory Optimizations Toward Training Trillion Parameter Models
	- ZeRO-Infinity:Breaking the GPU Memory Wall for Exterme Scale Deep Learning
	- ZeRO-Offload:Democratizing Billion-Scale Model Training
- DeepSpeed
	- Optimizer state partitioning (ZeRO stage 1)
	- Gradient partitioning (ZeRO stage 2)
	- Paramter partitioning (ZeRO satge 3)
	- Custom mixed precision training handing
	- A range of fast CUDA-extension-based opyimizers
	- ZeRO-Offload to CPU and NVMe
- 安装
	- 安装之后的校验,命令行执行`ds_report`
	- 除此之外还有:
		  `ds_acceleartor`:setting ds_acceleratot to cuda(auto_detect)
	- 其他
		- sparse attention:
			- 10x longer seq,up to 6x faster;
```
!ds_report
```
### os+g+p
