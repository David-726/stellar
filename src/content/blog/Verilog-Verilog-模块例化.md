---
title: "Verilog 模块例化"
published: 2026-08-18
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 模块例化
在一个`module`中引用另一个`module`叫做**模块例化**(名字有点捞
## 命名端口连接
将需要例化的端口与外部信号进行连接，端口顺序随意。
```Verilog
full_adder1 u_adder0(
	.Ai (a[0]),
	.Bi (b[0]),
	.Ci (c==1'b1?1'b0:1'b1);
	.So (so_bit0),
	.Co (co_temp[0]));
```
若是某些端口不需要例化，例化时可以悬空不连接，甚至删除。一般来说，`input`端口在例化时不能删除，`output`端口可以。
```Verilog
full_adder1 u_adder0(
	.Ai (a[0]),
	.Bi (b[0]),
	.Ci (c==1'b1?1'b0:1'b1),
	.So (so_bit0)
	.Co ());
//Co悬空
full_adder1 u_adder0(
	.Ai (a[0]),
	.Bi (b[0]),
	.Ci (c==1'b1?1'b0:1'b1),
	.So (so_bit0));
//Output端口Co删除
```
## 顺序端口连接
将需要例化的端口按照模块声明时的顺序与外部信号进行匹配连接，位置需要保持严格一致。
```
full_adder1 u_adder1(
	a[1],b[1],co_temp[0],so_bit1,co_temp[1]);
```
## 端口连接规则
### 输入端口
模块例化时，从外部来讲，`input`必须连接`wire`或者`reg`型变量，从内部来讲，只能连接`wire`
### 输出端口
模块例化时，从模块外部来讲，`output`端口必须连接`wire`变量。从内部而言，可以连接`wire`或是`reg`
### 悬空端口
`output`端口正常悬空，我们可以将其删除
`input`端口正常悬空时，视作高阻态，但是例化时不要删除(**编译会报错**)
```Verilog
//Warning
full_adder4 u_adder4(
	.a (a),
	.b (b),
	.c (),
	.so (so),
	.co (co));
```
不建议`input`悬空
### 位宽匹配
例化端口与连续信号位宽不匹配时，端会通过无符号的**右对齐或截断方式**进行匹配。
```Verilog
full_adder4 u_adder4(
	.a (a[1:0]),
	.b (b[5:0]),
	.c (1'b0),
	.so (so),
	.co (co));
```
上面`a`和`b`的位宽皆为`4bit`,则代码的例化结果为`u_adder.a={2'bzz,a[1:0],u_adder4.b=b[3:0]}
### 端口连续信号类型
连续端口的类型可以是:
- 标识符
- 位选择
- 部分选择
- 上述类型的合并
- 用于输入端口的表达式
## 用`generate`进行模块例化
例化多个相同的模块时，1个1个进行手动例化很繁琐。用`generate`语句进行多个模块的重复例化，可大大简化程序的编写过程。
```Verilog
module full_adder4(
	input [3:0] a,
	input [3:0] b,
	input c,
	
	output [3:0] so,
	output co
);
	wire [3:0] co_temp;
	full_adder1 u_adder0(
		.Ai (a[0]),
		.Bi (b[0]),
		.Ci (c==1'b1?1'b1:1'b0),
		.So (so[0]),
		.Co (co_temp[0]));
	genvar i;
	generate
		for(i=1;i<-3;i=i+1) begin: adder_gen
		full_adder1 u_adder(
			.Ai (a[i]),
			.Bi (b[i]),
			.Ci (co_temp[i-1]),
			.So (so[i]),
			.Co (co_temp[i]));
		end
	endgenerate
	assign co = co_temp[3];
endmodule
```

## 层次访问
每一个例化模块的名字，每个模块的信号变量，都使用1个特定的标识符定义。整个层次设计中，每个标识符都有唯一的位置与名字
使用一连串的`.`对各个模块的标识符进行层次连接，可以在任意地方进行访问。
```Verilog
a = top.u_m2.u_n3.c;

if(top.p == 'b0)a=1'b1;

assign p = top.u_m2.u_n4.d;
```


> ⚠️ 缺失图片：Pasted image 20260818203852.png

