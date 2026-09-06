---
title: "Verilog 带参例化"
published: 2026-08-18
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 带参例化
## defparam
用`defparam`通过模块层次调用的方法，改写低层次模块的参数值
如对1个单口地址线和数据线都是`4bit`宽度的`ram`模块的`MASK`参数进行改写:
```Verilog
defparam u_ram_4*4.MASK = 7;
ram_4*4 u_ram_4*4
	(
		.CLK (clk),
		.A (a[4-1:0]),
		.D (d),
		.EN (en),
		.WR (wr),
		.Q (q));
```
```Verilog
module ram4*4
	(
	input CLK,
	input [4-1:0] A,
	input [4-1:0] D,
	input EN,
	input WR,
	output reg [4-1:0] Q);
	
	parameter MASK =3;
	reg [4-1:0] mem[0:(1<<4)-1];
	always @(posedge CLK) begin
		if (EN&&WR) begin
			mem[A] <=D&MASK;
		end
		else if(EN&&!WR) begin
			Q <=mem[A]&MASK;
		end
	end
endmodule
```

## 带参数模块例化
例化模块时，将新的参数值写入模块例化语句，以此改写原`module`的参数值
```Verilog
ram #(.AW(4),.DW(4))
	u_ram
	(
		.CLK (clk),
		.A (a[AW-1:0]),
		.D (d),
		.EN (en),
		.WR (wr),
		.Q (q)
	);
```
```Verilog
module ram
	#( parameter AW=2,
	   parameter DW=3)
	(
		input CLK,
		input [AW-1:0] A,
		input [DW-1:0] D,
		input EN,
		input WR，
		output reg [DW-1:0] Q
	);
	
	reg [DW-1:0] mem[0:(1<<AW)-1];
	always @(posedge CLK) begin
		if (EN&&WR) begin
			mem[A] <= D;
		end
		else if(EN&&!WR) begin
			Q<=mem[A];
		end
	end
endmodule
```
## 区别与建议
- 与模块实例一样，参数例化时，可以不指定原有参数名字，按顺序进行参数例化
- 也可以带参例化
- 也可以混用
- 若1个模块中既有模块在声明时声明的参数，又有在模块实体中声明的参数，那这两种参数还能同时改写吗?
```Verilog
module ram
	#( parameter AW=2,
	   parameter DW=3 )
	   (
	   input CLK,
	   input [AW-1:0] A,
	   input [DW-1:0] D,
	   input EN,
	   input WR,
	   output reg [DW-1:0] Q);
	   
	   parameter MASK=3;
	   
	   reg [DW-1:0] mem[0:(1<<AW)-1];
	   always @(posedge CLK) begin
		   if (EN&&WR) begin
			   mem[A] <=D;
			end
			else if (EN&&!WR) begin
				Q<=mem[A]
			end
		end
endmodule
```
此时`defparame`改写`MASK`，编译报`Error`
```Verilog
defparam u_ram.AW =4;
defparam u_ram.DW =4;
defparam u_ram.MASK =7;
ram u_ram (......)

defparam u_ram.MASK=7;
ram #(.AW(4),.DW(4)) u_ram(......);
```
**用带参数模例化的方法改写MASK的值**,编译不会报错，`MASK`不会被改写
->:一种可能的解释时:编译器看来，如果有模块在端口声明时的参数，那么实体中的参数将会被视作`localparam`，使用`defparam`不能改写模块实体中声明的参数
- 不推荐`defparam`
- 推荐有要改写的参数，都写入到模块端口声明之前的地方，用关键字#表示，**可读性+1**
