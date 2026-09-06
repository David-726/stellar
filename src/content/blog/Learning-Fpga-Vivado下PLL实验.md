---
title: "Vivado下PLL实验"
published: 2026-08-26
description: ""
tags: ["Learning Fpga"]
draft: false
---
zynq7100主频高达几百MHz,但是默认只有50MHz
### 实验原理
PLL：同单片机原理相似
Phase-locked loop
7系列的fpga使用了专门的全局和区域IO和始终资源来管理设计中各种的始终需求
CMT提供了时钟合成、侵袭呃矫正、过滤抖动的功能
<img src="/posts/assets/1ph7-image117.webp" alt="image117.webp" loading="lazy" />MMCM用于再给定输入时钟都有设定的相位和频率关系情况下，生成不同的时钟信号
<img src="/posts/assets/1cyw53-image215.webp" alt="image215.webp" loading="lazy" />
- **PLL**:
PLL主要用于频率综合，使用1个pll可以从1个输入时钟信号生成多个时钟信号

<img src="/posts/assets/1zi-image315.webp" alt="image315.webp" loading="lazy" />
### 创建Vivado工程
调用Xlinix提供的IP核来产生不同频率的时钟，并将其中一个时钟输出到fpga的外部IO上
- 新建1个`pll_test`的工程，选择`Ip Catalog`
- `IP catalog`中选择`fpga features and Design\Clocking`下的`Clock Wizard`
- 默认`clock Wizard`的名字为`clk_wiz_0`,再界面`Clocking Options`中，选择PLL资源，输入时钟频率50MHz
- `Output Clocks`界面可以选择`clk_out1-clk_out`4个时钟的输出，频率为200MHz,100MHz,50MHz,25MHz,还可以设置时钟输出的相位，不做设置，
- 弹出对话框中`Generate`
- 此时一个`clk_wiz_0.xci`的IP会自动添加到我们的`pll_test`项目中，点击可以修改该IP的配置
- 选择IP Sources,双击打开`clk_wiz_0.veo`，该文件提供了这个IP的实例化模板，将框中的内容复制粘贴到我们的verilog程序中，对IP进行实例化
- 再编写1个顶层设计来实例化这个PLL IP，编写pll_test.v
```Verilog
`timescale 1ns/1ns
module pll_test(
	input sys_clk,
	input rst_n,
	output clk_out
);
wire locked;
clk_wiz_0 clk_wiz_0_inst
(//Clock in ports
	.clk_in1(sys_clk),// In 50MHz
	//CLock Out Ports
	.clk_out1(),
	.clk_out2(),
	.clk_out3(),
	.clk_out4(clk_out),
	//Status and control signals
	.reset(~rst_n), //pll reset,high-active
	.locked(locked));

```
- 保存工程后，pll_test自动成为了top文件，clk_wiz_0成为了pll_teset文件的子模块
- 再为工程添加xdc管脚的约束文件pll.xdc,可以在GUI中添加，或者直接修改.xdc文件
```Verilog
############## clock and reset define##################
create_clock -period 20 [get_ports sys_clk]
set_property IOSTANDARD LVCMOS33 [get_ports {sys_clk}]
set_property PACKAGE_PIN U18 [get_ports {sys_clk}]

set_property IOSTANDARD LVCMOS33 [get_ports {rst_n}]
set_property PACKAGE_PIN N15 [get_ports {rst_n}]
############## pll output define  J11 PIN3##################
set_property IOSTANDARD LVCMOS33 [get_ports clk_out]
set_property PACKAGE_PIN F17 [get_ports clk_out]
```
### 仿真
