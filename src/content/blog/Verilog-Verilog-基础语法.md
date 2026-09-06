---
title: "Verilog 基础语法"
published: 2026-08-07
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 基础语法
## 格式：
- 区分大小写；
- 格式自由，可在一行或多行内进行编写；
- 每个语句必须以`;`结束，空白符无意义，编译时将被忽略。
**为提高可读性**,推荐换行书写。
## 注释:
- `//`单行注释
- `/*`+`*/`进行多行注释
## 标识符与关键字
`Verilog`中的标识符可以是任意一组字母、数字、`$`符号和`_`的组合，但必须以`_`或字母开头，有大小写之分。
```Verilog
reg [3:0] counter;
input clk;
input CLK;
```
