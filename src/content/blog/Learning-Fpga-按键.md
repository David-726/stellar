---
title: "按键"
published: 2026-08-26
description: ""
tags: ["Learning Fpga"]
draft: false
---
key_test
使用2个D触发器，防止亚稳态的产生，即key恰好在clk触发沿附近变化
### 程序设计
老流程
```Verilog
`timescale 1ns/1ns
module key_test(
	input clk,
	input [3:0] key,
	output [3:0] led
);
reg[3:0] led_r;
reg[3:0] led_r1;
always@(posedge clk)
begin
	led_r<=key;
end
always@(posedge clk)
begin
	led_r1<=led_r;
end
assign led=led_r1;
endmodule
```
可以使用RTL ANALYSIS工具查看设计

