---
title: "Verilog 过程赋值"
published: 2026-08-18
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 过程赋值
## 阻塞赋值
用`=`赋值,顺序执行
## 非阻塞赋值
并行执行，用`<=`作为赋值符号
```Verilog
`timescale 1ns/1ns

module test;
	reg[3:0] ai,bi;
	reg[3:0] ai2,bi2;
	reg[3:0] value_blk;
	reg[3:0] value_non;
	reg[3:0] value_non2;
	
	initial begin
		ai = 4'd1;
		bi = 4'd2;
		ai2 = 4'd7;
		bi2 = 4'd8;
		
		ai = 4'd3;
		bi = 4'd4;
		value_blk = ai+bi;
		value_non <=ai+bi;
		
		ai2 <= 4'd5;
		bi2 <= 4'd6;
		value_non2 <= ai2+bi2;
		//发现这里value_none2使用的旧的ai2和bi2
	end
	
	always begin
		#10;
		if($time >=1000) $finish
	end
endmodule
```
**使用非阻塞赋值避免竞争冒险关系**:
**`timing`不好，容易阻塞**
**baka!baka!baka!baka!**:
```Verilog
always @(posedge clk) begin
	a = b;
end

always @(posedge clk) begin
	b = a;
end
//非常容易竞争冒险 拉完了
```
```Verilog
always @(posedge clk) begin
	temp = a;
	a = b;
	b = temp;
end
//多写个temp 拉完了
```
```Verilog
always @(posedge clk) begin
	a >= b;
	b >= a;
end
//bingo
```
