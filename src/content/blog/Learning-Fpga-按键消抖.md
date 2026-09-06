---
title: "按键消抖"
published: 2026-08-26
description: ""
tags: ["Learning Fpga"]
draft: false
---
key_debounce
### 实验原理
通过fpga计时来消抖，实验中设计1个计数器，当按键输入有变化时，计时器清零，否则累加，直到加到1个预定值，就认为按键稳定，输出按键值，这样就得到了没有抖动的按键值<img src="/posts/assets/2iqod-Pasted-image-20260826180025.png" alt="Pasted image 20260826180025.png" loading="lazy" />
### 程序设计
<img src="/posts/assets/2xhw-Pasted-image-20260826180249.png" alt="Pasted image 20260826180249.png" loading="lazy" />
```Verilog
`timescale 1ns/1ns
module ax_debounce
(
	input clk,
	input rst,
	input button_in,
	output reg button_posedge,
	output reg button_negedge,
	output reg button_out
);
parameter N = 32;
parameter FREQ=50;
parameter MAX_TIME = 20;
localparam TIMER_MAX_VAL = MAX_TIME*1000*FREQ;

reg [N-1:0] q_reg;
reg [N-1:0] q_next;
reg DFF1，DFF2;
wire q_add;
wire q_reset;
reg button_out_d0;

assign q_reset = (DFF1^DFF2)；
assign q_add = ~(q_reg == TIMER_MAX_VAL);

always @(q_reset,q_add,q_reg)
begin
	case({q_reset,q_add,q_reg})
		2'b00:
			q_next<=q_reg;
		2'b01:
			q_next<=q_reg+1;
		default:
			q_next<={N{1'b0}};
	endcase
end
always @(posedge clk or posedge rst)
begin
	if(rst==1'b1)
		button_out<=1'b1;
	else if(q_reg == TIMER_MAX_VAL)
		button_out<=DFF2;
	else 
		button_out<=button_out;
end
always @（posedge clk or posedge rst)
begin
	if(rst == 1'b1)
	begin
		button_out_d0<=1'b1;
		button_posedge <= 1'b0;
		button_negedge <= 1'b0;
	end
	else
	begin
		button_out_d0<=button_out;
		button_posedge <= ~button_out_d0&button_out;
		button_negedge <= button_out_d0 & ~button_out;
	end
end

endmodule 
```
### 仿真