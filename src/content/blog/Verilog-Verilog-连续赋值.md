---
title: "Verilog 连续赋值"
published: 2026-08-13
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 连续赋值
## assign、全加器
连续赋值是Verilog数据流建模的基本语句，用于对`wire`型变量进行赋值:
格式如下:
```Verilog
assign LHS_target = RHS_expression;
```
**assign**为关键词，任何已经声明`wire`变量的连续赋值语句都是以`assign`开头，如:
```Verilog
wire Cout,A,B;
assign Count = A&B;
```
需要说明的是:
- `LHS_target`必须是标量或是线性向量，而不是寄存器类型
- `RHS_expression`的类型没有要求，可以是标量或线型或存器向量，也可以是函数调用。
- 只要`RHS_expression`表达式的操作数有事件发生，`RHS_expression`就会立刻重新计算，同时赋值给`LHS_target`
Verilog还提供了另一种对`wire`型赋值的简单方法，即在`wire`型变量声明的时候同时对其赋值。**`wire`型变量只能被赋值一次**，因此该种连续赋值方式也只能有一次，如:
```Verilog
wire A,B;
wire Cout = A&B;
```
## 全加器
下面采用数据流描述方式，来设计一个1bit全加器
设Ai,Bi,Ci分别为被加数、加数和相邻低位的进位数，So,Co分别为本位和与向相邻高位的进位数。

| Ci | Ai | Bi | So | Co |
|----|----|----|----|----|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 | 0 |
| 0 | 1 | 0 | 1 | 0 |
| 0 | 1 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 |
| 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 | 1 |
表达式如下:
```
So = Ai ⊕ Bi ⊕ Ci ;
Co = AiBi + Ci(Ai+Bi)
```
rtl代码(full_adder1.v)如下:
```Verilog
module full_adder1(
	input Ai,Bi,Ci,
	output So,Co);
	
	assign So = Ai^Bi^Ci;
	assign Co = (Ai&Bi)|(Ci&(Ai|Bi));
endmodule
```
```Verilog
module full_adder1(
	input Ai,Bi,Ci,
	output So,Co);
	
	assign {Co, So} = Ai + Bi + Ci ;
endmodule
```
tesrbench(test.sv)参考
```Verilog
`timescale 1ns/1ns

module test;
	reg Ai,Bi,Ci;
	wire So,Co;
	
	initial begin
		{Ai,Bi,Ci} = 3'b0;
		forever begin
		# 10；
		{Ai,Bi,Ci} = {Ai,Bi,Ci} + 1'b1;
		end
	end
	full_adder1 u_adder(
		.Ai     (Ai),
		.Bi     (Bi),
		.Ci     (Ci),
		.So     (So),
		.Co     (Co));
	initial begin
		forever begin
			#100;
			//$display("---gyc---%d",$time);
			if($time >= 1000)begin
			$finish
			end
		end
	end
endmodule
```

