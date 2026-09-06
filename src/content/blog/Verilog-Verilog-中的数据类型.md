---
title: "Verilog 中的数据类型"
published: 2026-08-07
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 数据类型
## wire(线)
表示硬件单元之间的连线，由其连接的器件输出端连续驱动。如果没有驱动元件连接到`wire`型变量，缺省值一般位`Z`.
```Verilog
wire interrupt;
wire flag1,flag2;
wire gnd = 1'b0;
```
线网还有其他的一些数据类型，但是使用频率不高，包括`wand`、`wor`、`wri`、`triand`、`trior`、`trireg`,这些类型的使用频率不高，这里不做介绍。
## reg(寄存器)
`reg`用于表示存储单元，会保持数据原有的值，直到被改写。举例如下:
```Verilog
reg clk_tmp;
reg flag1,flag2;
```
`reg`的值可在任意时刻通过赋值操作进行改写，如：
```Verilog
reg rstn;
initial begin
	rstn = 1'b0;
	#100 ;
	rstn = 1'b1;
```
## 向量
位宽大于1时，`wire`或`reg`即可声明为向量的形式，如:
```Verilog
reg [3:0] counter;
wire[32-1:0] gpio_data;
wire[8:2] addr; //声明7bit位宽的线型变量addr,位宽范围为8:2
reg[0:31] data;

reg [msb:lsb] variable;
```
其中`msb`不必大于`lsb`,`[31:0]`和`[0:31]`开始的作用域不同。
对于上面的向量，我们可以指定某一位或者若干相邻位，作为其他逻辑使用
```Verilog
wire [9:0] data_low = data[0:9];
addr_tmp [3:2] = addr[8:7] + 1'b1;
```
还支持可变的向量域选择，如:
```Verilog
reg [31:0] data1;
reg [7:0] byte1 [3:0];
integer j;
alawys@* begin
 for (j=0;j<=3;j=j+1) begin
	 byte1[j]=data1[(j+1)*8-1:j*8]
	 //把data1[7:0]...data1[31:24]依次赋值给byte1[0][7:0]...byte1[3][7:0]...
	 end
end
```
`Verilog`还支持指定`bit`位后固定位宽的向量域选择访问。
- `[bit+:width]`:从起始bit位开始递增，位宽`width`
- `[bit-:width]`:从起始bit开始递减，位宽`width`
```Verilog
A = data1[31-:8];
A = data1[31:24];
//二者等价

B = data1[0+:8];
B = data1[0:7];
```
对信号重新组合成新的向量时，需要借助大括号，如:
```Verilog
wire [31:0] temp1,temp2;
assign temp1 = {byte1[0][7:0],data1[31:8]};//数据拼接
assign temp2 = {32{1'b0}};//赋值32bit的数值0
```
## 整数、实数、时间寄存器变量
这些也属于寄存器类型的数据类型
### 整数 integer
使用关键字`integer`来声明，不用指明位宽，位宽和编译器有关，一般为`32bit`,`reg`型变量位无符号数，而`integer`型为有符号数。如:
```Verilog
reg [31:0] data1;
reg [3:0] byte1 [7:0];
integer j;
always@* begin
	for (j=0;j<=3;j=j+1) begin
		byte1[j] = data1[(j+1)*8-1:j*8]
	end
end
```
### 实数 real
实数用关键字`real`来声明，可用十进制或是科学计数法来表示。实数声明不能带有范围，默认值为0.如果将1个实数赋值给1个整数，则只有实数的整数部分会被赋值给整数。如:
```Verilog
rael data1;
integer temp;
initial begin
	data1 = 2e3;
	data1 = 3.75;
end

initial begin
	temp = data1;//tmp的值为3
end
```
### 时间time
`Verilog`使用时间寄存器`time`型变量，对仿真时间进行保存，宽度一般为`64bit`,通过调用系统函数`$time`来获取当前仿真时间，如:
```Verilog
time current_time;
initial begin
	#100；
	current_time = $time;
end
```
## 数组
`Verilog`允许声明`reg`、`wire`、`integer`、`time`、`real`及其向量类型的数组。
数组的维度没有限制，可以用用于连接实例模块的端口。数组中的每个元素都可以作为1个标量或者向量来使用，形如:`<数组名>[<下标>]`,对于多为数组，用户需要说明每一个维度的索引
```Verilog
integer flag [7:0];//8个整数组成的数组
reg [3:0] counter [3:0];//4个bit计数器组成的数组
wire [7:0] addr_bus[3:0];//4个8bit wire组成的数组
wire data_bit[7:0][5:0];//2维数组
reg [31:0] data_4d[11:0][3:0][3:0][255:0];//声明4维的32bit数据变量数组
```
对于数组元素的赋值
```Verilog
flag [1] = 32'd0;
counter[3] =4'hF;
counter[3][3:0] = 4'hF;
assign addr_bus[0] = 8'b0;
assign data_bit[0][1] = 1'b1;
data_4d[0][0][0][0][15:0] = 15'd3;
```
向量是1个单独的元件，位宽是`n`；
数组由多个元件组成，其中每个元件的位宽为`n`或者`1`。
### 存储器
就是一种寄存器数组，用于描述RAM或者ROM的行为，如:
```Verilog
reg membit[0:255];
reg [7:0] mem[0:1023];
mem[511] = 8'b0;
```
### 参数
参数常用于表示常量，用关键字`parameter`声明，只能赋值1次。如
```Verilog
parameter data_width = 10'd32;
parameter i=1,j=2,k=3;
parameter mem_size = data_width*10;
```
局部参数用关键字`localparam`来声明，作用和用法与`parameter`相同，区别在于值不能被改变，所以参数只在本模块中调用时，可用`localparam`来说明。
### 字符串
字符串保存在`reg`类型的变量中，每个字符占用1个字节(8bit),因此寄存器的宽度应该足够大，从而保证不会溢出。
字符串不能多行书写，即字符串中不能出现回车符。如果寄存器变量的宽度大于字符串的宽度，则多余的左边位会自己补0，如果寄存器变量的宽度小于字符串大小，则会截取去字符串左边多余的数据。如:
```Verilog
reg [0:128-1] str;
initial begin
	str = "Here are The world"
end
```
一些特殊字符在显示字符串中由特殊的含义。

| 转义字符 |    显示字符     |
| :--: | :---------: |
|  \n  |     换行      |
|  \t  |     制表符     |
|  %%  |      %      |
|  \   |      \      |
|  \"  |      "      |
| \ooo | 1到3个8进制数字字符 |
