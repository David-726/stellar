---
title: "Verilog 条件语句"
published: 2026-08-18
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog条件语句
嗯对`if`+`condition x`
```Verilog
module mux4to1(
	input [1:0] sel,
	input [1:0] p0,
	input [1:0] p1,
	input [1:0] p2,
	input [1:0] p3,
	output [1:0] sout
);
	reg[1:0] sout_t;
	always @(*) begin
		if(sel == 2'b00)
			sout_t = p0;
		else if(sel == 2'b01)
			sout_t = p1;
		else if(sel == 2'b10)
			sout_t = p2;
		else
			sout_t = p3;
	end
	assign sout = sout_t;
endmodule
```
对于多个`if``else`嵌套，可以选择加上`begin``end`
```Verilog
if(en) begin
	if(sel == 2'b1) begin
		sout = p1s;
	end
	else begin
		sout = p0;
	end
end
```
