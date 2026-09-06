---
title: "Verilog 过程连续赋值"
published: 2026-08-18
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 过程连续赋值
## assign,deassign
`assign`和`deassign`表示第一类过程连续赋值语句。赋值对象只能是寄存器。
```Verilog
module dff_normal(
	input rstn,
	input clk,
	input D,
	output reg Q
);
	always @(posedge clk or negedge rstn) begin
		if(!rstn) begin
			Q<=1'b0;
		end
		else begin
			Q<=D;
		end
	end
endmodule
```
```Verilog
module dff_assign(
	input rstn,
	input clk,
	input D,
	output reg Q
);
	always @(posedge clk)begin
		Q<=D;
	end
	always @(negedge rstn)begin
		if(!rstn) begin
			assign Q=1'b0;
		end
		else begin
			deassign Q;
		end
	end
endmodule
```
## force、release
`force`强制赋值与`release`取消强制赋值表示第二类过程连续赋值语句。
```Verilog
`timescale 1ns/1ns

module test;
	reg rstn;
	reg clk;
	reg [3:0] cnt;
	wire cout;
	
	counter10 u_counter(
		.rstn (rstn),
		.clk (clk),
		.cnt (cnt),
		.count (cout));
	initial begin
		clk = 0;
		rstn = 0;
		#10;
		rstn = 1'b1;
		wait (test.u_counter.cnt_temp = 4'd4)
		@(negedge clk);
		force test.u_counter.cnt_temp = 4'd6;
		force test.u_counter.cout = 1'b1;
		#40;
		@(negedge clk);
		release test.u_counter.cnt_temp;
		release test.u_counter.count;
	end
	initial begin
		clk = 0;
		forever #10 clk=~clk;
	end
	
	always begin
		clk = 0;
		forever #10 clk=~clk;
	end
	always begin
		#1000;
		if($time>=1000) $finish;
	end
endmodule  
```