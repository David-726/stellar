---
title: "Verilog 循环"
published: 2026-08-18
description: ""
tags: ["Verilog"]
draft: false
---
## while
```
while (condition) begin
	...
end
```
## for
```
for(initial_assignment;condition;step_assignment) begin
	...
end
```
```Verilog
interger i;
reg [3:0] counter2;
initial begin
	counter2 = b'0;
	for(i=0;i<=10;i=i+1)begin
		#10;
		counter2 = counter2 + 1'b1;
	end
end
```
## repeat
```
repeat (loop_times) begin
	...
end
```
```Verilog
reg [3:0] counter3;
initial begin
	counter3 = 'b0;
	repeat (11) begin
		#10;
		counter3 = counter3 + 1'b1;
	end
end
```
## forever
```
forever begin
	...
end
```
```
while (1) begin
 ...
end
```
```Verilog
reg clk;
initial begin
	 clk = 0;
	 forever begin
		 clk = ~clk;
		 #5;
	end
end
```
```Verilog
reg clk;
reg data_in,data_temp;
initial begin
	forever @(posedge clk) data_temp=data_in;
end
```