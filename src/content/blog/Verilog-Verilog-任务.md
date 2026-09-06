---
title: "Verilog 任务"
published: 2026-08-19
description: ""
tags: ["Verilog"]
draft: false
---
# 任务
## 任务声明
模块内子程序出现下面任意一个条件时，则必须使用任务而不是函数
- 子程序中包括时序控制逻辑，如延迟、事件控制
- 无输入变量
- 无输出或输出大于1
```Verilog
task task_id;
	port_declaraion;
	procedural_statement;
endtask
```
任务中也要进行端口的声明；
进行任务的逻辑设计时，可以把`input`声明的端口变量视作`wire`型，`output`声明的端口变量视作`reg`型。但是不需要用`reg`对`output`端口再次说明
对`output`赋值也不要使用`assign`，尽量用阻塞赋值，避免时序混乱
```Verilog
task xor_oper_iner
	input [N-1:0] numa,
	input [N-1:0] numb,
	input [N-1:0] numco;
	
	#3 numco = numa^numb;
endtask
```
也可以用括号将端口声明括起来
```Verilog
task xor_oper_iner（
    input [N-1:0]   numa,
    input [N-1:0]   numb,
    output [N-1:0]  numco  ） ; 
    #3  numco       = numa ^ numb ;
endtask
```
## 任务调用
```
task_id(input1,input2,...,output1,output2,...)
```
```Verilog
module xor_oper
	#(parameter N=4)
	(
	input clk,
	input rstn,
	input [N-1:0] a,
	input [N-1:0] b,
	output [N-1:0] co
	);
	
	reg[N-1:0] co_t;
	always @(*) begin
		xor_oper_iner(a,b,co_t);
	end
	reg[N-1:0] co_r;
	always @(posedge clk or negedge rstn) begin
		if(!rstn) begin
			co_r <='b0;
		end
		else begin
			co_r <= co_t;
		end
	end
	assign co=co_r;
	
	task xor_oper_iner;
		input [N-1:0] numa;
		input [N-1:0] numb;
		output [N-1:0] numc0;
		#3 numco = numa^numb; //阻塞赋值，便于控制时序
	endtask
endmodule
``` 
## 任务操作全局变量
任务内部变量只有在任务中可见，若想要具体观测任务中对变量的操作过程，需要将观测的变量声明在模块之后、任务之外。
```Verilog
task clk_rvs_iner;
	output clk_no_rvs;
	#5; clk_no_rvs=0;
	#5; clk_no_rvs=1;
endtask
reg clk_test1;
always clk_rvs_iner(clk_test1);

reg clk_test2;
task clk_rvs_global;
	#5; clk_test2=0;
	#5; clk_test2=1;
endtask
always clk_rvs_global;
```
## automatic 任务
和函数一样，Verilog中任务调用的局部变量也是静态的。
多次被调用时，使用关键字`automatic`
```Verilog
task test_flag;
	input [3:0] cnti;
	input en;
	output [3:0] cnto;
	if (en) cnto = cnti;
endtask
reg en_cnt;
reg [3:0] cnt_temp;
initial begin
	en_cnt = 1;
	cnt_temp = 0;
	#25; en_cnt=0;
end
always #10 cnt_temp = cnt_temp+1;
reg [3:0] cnt1,cnt2;
always @(posedge clk) test_flag(2,en_cnt,cnt1);
always @(posedge clk) test_flga(cnt_temp,!en_cnt,cnt2);

```