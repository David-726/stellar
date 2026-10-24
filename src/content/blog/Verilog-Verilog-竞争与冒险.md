---
title: "Verilog 竞争与冒险"
published: 2026-08-19
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 竞争与冒险
消除办法:
- 增加滤波电容，滤除窄脉冲
- 修改逻辑，增加冗余项
- 使用时钟同步电路，利用触发器进行打拍延迟
```Verilog
module competition_hazrad
	(
	input clk,
	input rstn,
	input en,
	input din_rvs,
	input flag
	);
	
	wire condition = din_rvs & en;
	always @(posedge clk or negedge !rstn) begin
		if(!rstn) begin
			flag <= 1'b0;
		end
		else begin
			flag <= condition;
		end
endmodule
```
->出现了毛刺，尖峰脉冲
改进一下:
```Verilog
module clap_delay
	(
	input clk,
	input rstn,
	input en,
	input din_rvs,
	output reg flag
	);
	reg din_rvs_r;
	reg en_r;
	always @(posedge clk or !rstn) begin
		if(!rstn) begin
			din_rvs_r <= 1'b0;
			en_r <= 1'b0;
		end
		else begin
			din_rvs_r <= din_rvs;
			en_r <= en;
		end
	end
	
	wire condition = din_rvs_r&en_r;
	always @(posedge clk or negedge !rstn) begin
		if(!rstn) begin
			flag <= 1'b0;
		end
		else begin
			flag <= condition;
		end
	end
endmodule
```
- 采用格雷码计数器

## **Verilog书写规范**:
- 时序电路建模时，用非阻塞赋值
```
always @(posedge clk)begin
	a = b;
	b = a;
end
```
非常容易阻塞！！！！
```
always @(posedge clk) begin
	a<=b;
	b<=a;
end
```
并行不堵车
- 组合逻辑建模时，用阻塞赋值
```
always @(*) begin
	C <= A&B;
	F <= C&D;
end
//依旧用的旧的C,Error!
```
```
always @(*) begin
	C = A&B;
	F = C&D;
end
```
- 在同一个always块中建立时序和组合逻辑模型时，用非阻塞赋值
```Verilog
always @(posedge clk or negedge rst_n)
	if(!rst_n)begin
		q<= 1'b0;
	end
	else begin
		q<=a&b;
	end
end
```
- 在同一个always块中不要及使用阻塞又使用非阻塞
```Verilog
always @(*) begin
	C = A&B;
	F <= C&D;
end
```
乍一看没什么问题
F还是得等到阻塞完了才能赋值
```Verilog
always @(*) begin
	C <= A&B;
	F = C&D;
end
//不多说了
```
```Verilog
always @(posedge clk or negedge rst_n)
	if(!rst_n) begin
		q<=1'b0;
	end
	else begin
		q=a&b;
	end
end
```
- 不要在多个always块为同一个变量赋值
- 避免latch产生

## Verilog Latch
**Whats Latch**
Latch(锁存器)->电平触发的存储单元，数据存储的动作取决于输入时钟信号的电平值，锁存器使能时，



<img src="/posts/assets/1rpz68t-Pasted-image-20260819120814.png" alt="Pasted image 20260819120814.png" loading="lazy" />



输出才会随着数据输入变化。
Latch的危害:
- 输入状态可能多次变化，容易产生毛刺，增加了下一级电路的不确定性
- 大部分FPGA资源中，可能需要比触发器更多的资源实现Latch结构
- 锁存器的出现使得静态时序分析变得复杂
一般的设计中，应该避免Latch的产生
### if结构不完整
缺少else结构，系统默认else分支下的q值保持不变，所以q会被综合为latch结构
```Verilog
module module1_latch1(
	input data,
	input en,
	output reg q);
	
	always @(*) begin
		if(en) q=data;
	end
endmodule
```
补全`if-else`结构或者对信号赋初值
```Verilog
always @(*) begin
	if(en) q=data;
	else q=1'b0;
end

always @(*) begin
	q = 1'b0;
	if(en) q = data;
end
```
时序逻辑中，不完整的`if-else`结构，不会产生latch
```Verilog
module module1_ff(
	input clk,
	input data,
	input en,
	output reg q);
	
	always @(posedge clk)begin
		if(en) q<=data;
	end
endmodule
```
组合逻辑下，条件语句中有很多赋值语句时，每个分支语句下赋值语句的不完整也是会产生latch
```Verilog
module module1_latch1(
	input data1;
	input data2;
	input en,
	output reg q1,
	output reg q2);
	
	always @(*) begin
		if(en) q1=data1;
		else q2 = data2;
	end
endmodule
```
也可以通过补充完整赋值语句或者赋初值来避免latch
```Verilog
always @(*) begin
	if(en)begin
		q1=data1;
		q2= 1;b0;
	end
	else begin
		q1=1'b0;
		q2=data2;
	end
end
```
### case结构不完整
`case`语句产生Latch原理同`if-else`类似
```Verilog
module module1_latch2(
	input data1,
	input data2,
	input [1:0] sel,
	output reg q);
	
	always @(*) begin
		case(sel)
			2'b00:q=data1;
			2'b01:q=data2;
		end
	end
endmodule
```
解决也是将选项列表补充完整或是赋初值
```Verilog
always @(*) begin
	case(sel)
		2'b00: q=data1;
		2'b01: q=data2;
		default: q=1'b0;
	endcase
end
always @(*) begin
	case(sel)
		2'b00: q=data1;
		2'b01: q=data2;
		2'b10,2'b11:
			q=1'b0;
	endcase
end
```
### 原信号赋值或判断
组合逻辑中，若一个信号的赋值源头有信号本身，或者判断条件有其信号的逻辑，则也会产生latch。
```Verilog
reg a,b;
always @(*) begin
	if(a&b) a=1'b1;
	else a=1'b0;
end

reg c;
wire [1:0] sel;
always @(*) begin
	case(sel)
	2'b00: c=c;
	2'b01: c=1'b1;
	default:c=1'n0;
	endcase
end

wire d,sel2;
assign d= (sel2&&d)?1'b0:1'b1;
```
避免latch的方法，**即在组合逻辑中避免这种写法**，神之一手说是
```Verilog
reg a,b;
reg a_r;

always (@posedge clk)
	a_r <=a;
always $(*) begin
	if(a_r&b) a = 1'b1;
	else a =1'b0;
end
```
### 敏感信号列表不完整
敏感列表没有列全，该触发的时候没有触发，那么相关寄存器还是会保存之前的结果，因而生成锁存器。