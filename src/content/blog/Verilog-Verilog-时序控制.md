---
title: "Verilog 时序控制"
published: 2026-08-18
description: ""
tags: ["Verilog"]
draft: false
---
## 时延控制
### 常规时延
等一会的时延
```Verilog
reg value_test;
reg value_general;
#10 value_general = value_test;
```
亦或是
```Verilog
//另起一行 可读性+1
reg value_test;
reg value_general;
#10;
value_general - value_test;
```
### 内嵌时延
先将计算结果保存，然后等待一段时间后赋值给目标信号
内嵌时延控制加在赋值号之后，如:
```Verilog
reg value_test;
reg value_embed;
value_enbed = #10 vaule_test;
```
区别在哪？？
```Verilog
`timescale 1ns/1ns

module tset;
	reg value_test;
	reg value_general,value_embed,value_single;
	initial begin
		value_test = 0;
		#25; value_test = 1;
		#35; value_test = 0;
		#40; value_test = 1;
		#10; value_test = 0;
	end
	
	//general Delay
	initial begin
		value_general = 1;
		#10 value_general = value_test;
		#45 value_general = value_tset;
		#30 value_general = value_test;
		#20 value_general = value_test;
	end
	
	initial begin
		value_general = 1;
		value_embed = #10 value_test;
		value_embed = #45 value_test;
		value_embed = #30 value_test;
		value_embed = #20 value_test;
	end
	
	initial begin
		value_single = 1;
		#10;
		value_single = value_test;
		#45;
		value_single = value_test;
		#30;
		value_single = value_test;
		#20;
		value_single = value_test;
	end
	always begin
		#10;
		if($time >= 150)begin
			$finish
		end
	end
endmodule
```
`general`先延时后赋值，`embed`先取值后延时。细看差别即可
## 边沿触发事件控制
### 一般事件控制
事件控制用`@`表示
关键字`posedge`表示正向边沿跳变，`negedge`表示负向边沿跳变，未指明边沿跳变方向时，2种情况的边沿变化都会触发事件
如:
```Verilog
always @(clk) q<=d;
always #(posedge clk) q<=d;
always #(negedge clk) q<=d;
q = @(posedge clk)d;
```
### 命名事件控制
用户可以声明`event`事件类型的变量，并触发该变量来识别该事件是否发生。命名事件用`event`来声明，触发信号用`->`表示，如：
```Verilog
event start_receiving;
always @(posedge clk_samp) begin
	->start_receiving;//采样 posedge来作为时间触发时刻
end
always @(start_receiving) begin
	data_buf = {data_if[0],data_if[1]};
end
```
### 敏感列表
**有多敏感**
多个信号或是事件中任意一个发生变化都能触发语句的执行时，用`or`连接或者用`,`连接，`Verilog`中称之为敏感列表。
**我去这么敏感**:
```Verilog
always @(posedge clk or negedge rstn) begin
//always @(posedge clk,negedge rstn) begin
	assign s = a?b+c:d?e+f:g?h+i:j?k+l:m;
end
```
### 电平敏感事件控制
关键词`wait`表示电平敏感情况
```Verilog
initial begin
	wait (start_enbale);
	forever begin
		@(posedge clk_samp);
		data_buf = {data_if[0],data_if[1]};
	end
end
```
