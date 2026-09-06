---
title: "Verilog 编译指令"
published: 2026-08-13
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog编译指令
以反引号\`开始的某些表示符是Verilog系统编译指令。
编译指令以Verilog代码的撰写、编译、调试等提供了极大的便利。
- \`define,\`undef
	编译阶段,\`define用于文本替换，**C语言中的`#define`**
	一旦被编译，在整个编译过程中都会有效。
	```
	`define DATA_DW 32
	```
	则在另一个文件中也可以直接使用 DATA_DW
```Verilog
	`define S $step;
	//用S来替换系统函数$step
	`define WORD_DEF reg[31:0]
	//可以用WORD_REF声明32bit寄存器变量
```
- \`undef 用来取消之前的宏定义，如:
```Verilog
`define DATA_DW 32
......
reg [DATA_DW-1 :0] data_in;
`undef DATA_DW
```
- \`ifdef,\`ifndef,\`elsif,\`endif属于条件编译指令。如下面的例子中
```Verilog
`ifdef MCU51
	parameter DATA_DW = 8;
`elsdef WINDOW
	parameter DATA_DW = 64;
`else
	parameter DATA_DW = 32;
`endif
```
```Verilog
`ifndef WINDOW
	parameter DATA_DW = 32;
`else
	parameter DATA_DW = 64;
`endif
```
- \`include
使用\`include可以在编译时将1个Verilog文件内嵌到另一个Verilog文件种，类似于C语言种的`#include`结构,通常用于将全局或公用的文件包含在设计文件种
- \`timescale
`Verilog` 模型中,时延具有具体的单位时间表述，并用\`timescale编译指令将时间单位和实际时间相关联
```Verilog
`timescale time_unit/time_precision
```
`time_unit`表示时间单位，`time_precision`表示时间精度，均是由数字及单位s,ms,us,ns,ps和fs组成。时间精度可以和时间单位一样，但是时间精度大小不能超过时间单位大小。
```Verilog
`timescale 1ns/100ps //时间单位1ns 精度为100ps
module AndFunc(Z,A,B)
	output Z;
	input A,B;
	assign #5.207 Z = A & B
endmodule
```
编译时，该指令会影响后面所有的模块的时延值，直至遇到另一个\`timescale或是\`resetall指令，由于在Verilog中没有默认的\`timescale,如果没有指定\`timescale,Verilog模块就有会继承前面编译模块的\`timescale参数，有时候会导致出错。
若是1个设计的多个模块都带有\`timescale时，模拟器总是定位在所有模块的最小时延精度上，并且所有时延都相应的换算为最小时延精度，时延精度并不受影响，如:
```Verilog
`timescale 10ns/1ns
module test;
	reg A,B;
	wire OUTZ;
	initial begin
		A =1;
		B=0;
		# 1.28 B=1;
		# 3.1 A=0;
	end
	
	AndFunc u_and(OUTZ,A,B);
endmodule
```
在模块 AndFunc 中，5.207 对应 5.21ns。
在模块 test 中，1.28 对应 13ns，3.1 对应 31ns。
但是，当仿真 test 时，由于 AndFunc 中的最小精度为 100ps，因此 test 中的时延精度将进行重新调整。13ns 将对应 130*100ps，31ns 将对应 310*100ps。仿真时，时延精度也会使用 100ps。仿真时间单位大小没有影响。
```Verilog
`timescale 10ns/1ns
module OrFunc(Z,A,B);
	output Z;
	input A,B;
	assign #5.207 Z=A|B
endmodule

//顶层
`timescale 10ns/1ns
module test;
	reg A,B;
	wire OUTZ;
	wire OUTX;
	
	initial begin
		A = 1;
		B = 0;
		# 1.28 B=1;
		# 3.1 A=0;
	end
	
	AndFunc u_and(OUTZ,A,B);
	OrFunc u_and(OUTX,A,B);

```
仿真test睡觉时，OrFunc中的#5.207依旧对应52ns
\`timescale的时间精度设置时会影响仿真时间的。时间精度越小，仿真占用内存越多，实际使用的仿真时间就越长。如果没有必要，应该尽量将时间精度设置的大一点。
- \`default_nettype
该指令用于为隐式的线网变量指定为线网类型，即将灭有被声明的连线定义为线网类型
```Verilog
`default_nettype wand
```
该实例定义的缺省的线网为线与类型，因此若是在该指令后面的任何模块中的连线没有说明，该线网被假定为线与类型。
```Verilog
`default_nettype none
```
这种定义后，将不再自动产生wire变量
```Verilog

//五定义就使用，系统默认Z1为wire变量,有warning无Error
module test_and(
	input A,
	input B,
	output Z);
   assign Z1=A&B;
endmodule
```
```Verilog
//Z1无定义就使用，由于编译方式的存在,系统会报Error
`default_nettype none
module test_and(
	input A,
	input B,
	output Z);
   assign Z1=A&B;
endmodule
```
- \`resetall
该编译器指令将所有的编译指令重新设置为缺省值
\`resetall 可以使得缺省连线类型为线网类型。
当\`resetall 加到模块最后时，可以将当前的\`timescale取消防止进一步传递，只保证当前的\`timescale在局部有效，避免\`timescale的错误继承。
- \`celldefine,\`endcelldefine
这两个程序指令用于将模块标记为单元模块，他们包含模块的定义。如一些与、非、或门，一些PLL单元、PAD模型...
```Verilog
`celldefine
module (
	input clk,
	input rst,
	output clk_pll,
	output flag);
	......
endmodule
`endcelldefine
```
**??**
- \`unconnected_drive,\`nounconnected_drive
模块实例化中，出现在这两个编译指令间的任何未连接的输入端口，为**正偏电路或者为反偏电路**
```Verilog
`unconnected_drive pull1
...
//在这两个程序指令间的所有未连接的输入端口为正片电路状态
`nounconnected_drive
```
```Verilog
`unconnected_drive pull0
...
//在这两个程序指令之间的所有未连接的输入端口为反偏电路状态
`nounconnected_drive
```
