---
title: "Verilog 多路分支语句"
published: 2026-08-18
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog多路分支语句
## case语句
**少说废话、看代码吧->>**
```Verilog
module mux4to1(
	input [1:0] sel,
	input [1:0] p0,
	input [1:0] p1,
	input [1:0] p2,
	input [1:0] p3,
	output [1:0] sout
	);
	reg [1:0] sout_t;
	always @(*)
		case(sel)
			2'b00:begin
				sout_t = p0;
			end
			2'b01: sout_t = p1;
			2'b10: sout_t = p2;
			default: sout_t p3;
		endcase
	assign sout=sout_t;
endmodule
```
`case`语句中的条件选项表达式也可以是`x`或者`z`
但是`case`中的`x`和`z`一般是不可综合的
```Verilog
case (sel)
	2'b00: sout_t = p0;
	2'b01: sout_t = p1;
	2'b10: sout_t = p2;
	2'b11: sout_t = p3;
	2'bx0,2'bx1,2'bxz,2'bxx,2'b1x,2'bzx;
		sout_t = 2'bxx;
	2'bz0,2'bz1,2'bzz,2'b0z,2'b1z;
		sout_t = 2'bzz;
	default: $display("Unexpected input conytol!!!");
endcase
```
## casex/casez 语句
`casex`用`x`表示无关值，`casez`用问号`?`表示无关值。
二者实现功能完全一致，语法与`case`完全一致
```Verilog
module mux4to1(
	input [3:0] sel,
	input [1:0] p0,
	input [1:0] p1,
	input [1:0] p2,
	input [1:0] p3,
	output [1:0] sout
	);
	reg [1:0] sout_t;
	always @(*)
		case(sel)
			4'b???1: sout_t =p0;
			4'b??1?: sout_t = p1;
			4'b?1??: sout_t = p2;
			4'b1???: sout_t =p3;
			default: sout_t = 2'b
		endcase
	assign sout=sout_t;
endmodule
```