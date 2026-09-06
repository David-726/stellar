---
title: "Verilog 的数值表示"
published: 2026-08-07
description: ""
tags: ["Verilog"]
draft: false
---
# 数值表示:
## 数值种类:
`Verilog HDL`中有4种基本的硬件表示电平逻辑:
- 0:逻辑`0`
- 1:逻辑`1`
- x或X:未知
- z或Z:高阻态，与电平的上下拉有关系
## 整数数值表示方法"
### 指明位宽:
```
4'b1011 //4bit
32'h3022_c0de //32bit
```
### 不指明位宽:
```Verilog
counter = `d100`; //一般会根据编译器自动分频位宽
counter = 100;
counter = 32'h64;
```
### 负数表示
```Verilog
-6'd15
-15
```
>`-15`在5位2进制中的形式是`5'b10001`,6位2进制中的形式是`6'b11_0001`。注意补码表示的特点。

### 字符串表示方法:
```Verilog
reg [0:12*8-1] str;
initial begin
	str = "HelloWorld";
end
```
字符串是由双引号包起来的字符队列，不能多行书写，不能有回车符。

