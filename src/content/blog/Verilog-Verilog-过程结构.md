---
title: "Verilog 过程结构"
published: 2026-08-18
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 过程结构
## initial语句
`initial`语句从0开始执行，只执行1次，多个`initial`语句块之间是独立的。如果`initial`语句块之间包含多个语句，需要使用关键词`begin`和`end`组成一个块语句。`initial`理论上也是不可综合的。
>Q：什么叫做综合

```Verilog
`timescale 1ns/1ns

module test
	reg ai,bi;
	
	initial begin
		ai = 0;
		#25; ai = 1;
		#35; ai = 0;
		#40; ai = 1;
		#10; ai = 0;
	end
	
	initial begin
		bi = 1;
		#70; bi = 0;
		#20; bi = 1;
	end
	
	initial begin
		forever begin
			if($time >= 1000)begin
				$finish
			end
	end
endmodule
```
## `alawys`语句
与`initial`语句相反,`alawys`语句是重复执行的，从0时刻开始执行其中的行为语句，执行完最后一条语句后，重复循环。
```Verilog
`timescale 1ns/1ns

module test;
	parameter CLK_FREQ = 100;
	parameter CLK_CYCLE  =1e9/(CLK_FREQ*1e6);
	
	reg clk;
	initial clk = 1'b0;
	always begin
		#10;
		if($time >= 1000)begin
			$finish
		end
	end
endmodule
	
```