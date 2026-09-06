---
title: "Verilog 模块和端口"
published: 2026-08-18
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 模块和端口
## 模块
```
module module_name
(port_list);
	Declarations_and_Statements;
endmodule
```
<img src="/posts/assets/2hw56-Pasted-image-20260818193351.png" alt="Pasted image 20260818193351.png" loading="lazy" />
## 端口
是模块与外界交互的端口，模块内部不可见，对模块的调用通过端口连接进行
### 端口列表
模块的定义中包含一个可选的端口列表，一般将**不带类型、不带位宽的信号**变量罗列在模块声明里。下面是一个` PAD` 模型的端口列表：
```Verilog
module pad(
	DIN,OEN,PULL,
	DOUT,PAD);
```
若是和外部没有交互，则不用声明
### 端口声明
- 端口信号罗列出来后，可以在模块实体中声明了
			`input`、`inout`不能声明为`reg`数据类型，因为`reg`是用于保存数值的，输入端口只能反应与器相连的外部信号的变化，不能保存这些信号的值
			`output`可以声明为`wire`和`reg`数据类型。
```Verilog
//端口类型声明
input DIN,OEN;
input [1:0] PULL;
inout PAD;
output DOUT;

//端口数据类型声明
wire DIN,OEN;
wire [1:0] PULL;
wire PAD;
reg DOUT;
```
- `Verilog`中，端口隐式的声明为`wire`变量，即当端口具有`wire`属性时，不用再次声明端口类型为`wire`型。但是，当端口有`reg`属性，则`reg`声明不可省略
```Verilog
input DIN,OEN;
input [1:0] PULL;
input PAD;
output DOUT;
reg DOUT;
//output reg DOUT;
```
- 还有1种更简洁的方法来声明端口，即在声明`module`时就陈列其端口及其类型，`reg`端口要么在`module`声明时声明，要么在`module`实体中声明，如:
```Verilog
module pad(
	input DIN,OEN,
	input [1:0] PULL,
	input PAD,
	output reg DOUT
	);
module pad(
	input DIN,OEN,
	input [1:0] PULL,
	inout PAD,
	output DOUT
);
reg DOUT;
```
### inout端口仿真
```Verilog
module pad(
	input DIN,OEN,
	input [1:0] PULL,
	input PAD,
	output reg DOUT
);
	assign PAD=OEN?'bz:DIN;
	//input:(PAD->DOUT)
	always @(*) begin
		if(OEN == 1) begin
			DOUT = PAD;
		end
		else begin
			DOUT = 'bz;
		end
	end
	bufif1 puller(PAD,PULL[0],PULL[1]);
endmodule
```