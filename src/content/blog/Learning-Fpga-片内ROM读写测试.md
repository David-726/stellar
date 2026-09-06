---
title: "片内ROM读写测试"
published: 2026-08-26
description: ""
tags: ["Learning Fpga"]
draft: false
---
### 实验原理
依旧只需要对提供的IP核进行例化即可
### 程序设计
#### 创建初始化文件
创建1个名为rom_inst.coe的文件,注意后缀一定是.coe
格式很简单，都是这个32\*8bits的初始化数据
```
MEMORY_INITIALIZATION_RADIX=16
MEMORY_INITIALIZATION_VECTOR=
11,
22,
33,
44,
55,
66,
77,
88,
99,
aa,
bb,
cc,
dd,
ee,
ff,
00,
a1,
a2,
a3,
a4,
a5,
a6,
a7,
a8,
b1,
b2,
b3,
b4,
b5,
b6,
b7,
b8;
```
### 添加IP核
新建一个rom_test的工程，然后在工程中添加ROM IP
- 点击下图中IP Catalog,在右侧弹出的界面中搜索rom,找到Block Memory Generator,打开
- Component Name 改为rom_ip,Basic下，将Memory Type改为Single Port ROM
- 切换到Port A Options，ROM位宽Port A Width改为8,ROM深度Port A Depth改为32,Enable Port Type->Always,取消Primitive Output Register
- 切换到Other Options下，勾选Load Init File,点击Browse,选中之前制作好的.coe文件
- Generate ROM IP
### 程序编写
```Verilog
`timescale 1ns/1ns

module rom_test(
	input sys_clk,
	input rst_n,
);
wire [7:0] rom_data;
reg [4:0] rom_addr;

always @(posedge sys_clk or negedge rst_n)
begin
	if(!rst_n)
		rom_addr<=10'd0;
	else
		rom_addr<=rom_addr+1'b1;
end
rom_ip rom_ip_inst
(
	.clka (sys_clk),
	.addra (rom_addr),
	.douta (rom_data),
);

ila_0 ila_m0
(
	.clk (sys_clk),
	.probe0 (rom_addr),
	.probe1 (rom_data)
);
endmodule
```
- 绑定引脚
### 仿真
