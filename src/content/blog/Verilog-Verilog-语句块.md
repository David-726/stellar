---
title: "Verilog 语句块"
published: 2026-08-18
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 语句块
## 顺序块
`begin`+`end`
这很顺序
## 并行块`
`fork`+`join`表示，并行块中的语句是并行的，即便是阻塞性是的赋值
```Verilog
`timescale 1ns/1ns

module test;
	reg [3:0] ai_sequen,bi_sequen;
	reg [3:0] ai_paral,bi_paral;
	reg [3:0] ai_nonblk.bi_nonblk;
	
	initial begin
		#5 ai_sequen = 4'd5;
		#5 bi_sequen = 4'd8;
	end
	initial begin
		#5 ai_paral = 4'd5;
		#5 bi_paral = 4'd8;
	join
	initial begin
		#5 ai_nonblk <= 4'd5;
		#5 bi_nonblk <= 4'd8;
	join
endmodule
```
## 嵌套块
顺序或并行`blockage`相互嵌套使用
```Verilog
`timescale 1ns/1ns;
module test;

	reg [3:0] ai_sequen2,bi_sequen2;
	reg [3:0] ai_paral2,bi_paral2;
	initial begin
		ai_sequen2 = 4'd5;
		fork
			#10 ai_paral2 = 4'd5;
			#15 bi_paral2 = 4'd8;
		join
		#20 bi_sequen2 = 4'd8;
	end
endmodule
```
## 命名块
```Verilog
`timescale 1ns/1ns
module test;
	initial begin:runoob //命名该模块为runoob
		interger i;
		i =0 ;
		forever begin
			#10 i = i+10;
		end
	end
	
	reg stop_flag;
	initial stop_flag = 1'b0;
	always begin:detect_stop
		if(test.runoob.i==100)begin
		stop_flag = 1'b1;
		end
		#10;
	end
endmodule
```
命名的块也可以被`disable`禁用
```Verilog
`timescale 1ns/1ns

module test;
	initial begin : runoob_d
		integer i_d;
		i_d = 0;
		while(i_d<=100) begin:runoob_d2
			#10;
		if(i_d>=50) begin
			disable runoob_d3.clk_gen;
			disable runoob_d2;
		end
		i_d = i_d+10;
	end
	
	reg clk;
	initial begin:runoob_d3
		while(1)begin:clk_gen
		clk=1;#10;
		clk=0;#10;
		end
	end
endmodule
```
