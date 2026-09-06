---
title: "Verilog 函数"
published: 2026-08-18
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 函数
## 函数
函数只能在**module**中定义，并在`module`的任意地方引用，作用范围当然只是这个`module`
特点:
- 不含任何延迟、时序或者时序控制逻辑
- 至少有1个输入变量
- 只有一个返回值，且没有输出
- 不含非阻塞赋值语句
- 可以调用其他函数，但是不能调用任务
```Verilog
function [range-1:0] function_id;
input_declaration;
	other_declaration;
procedural_statement;
endfunction
```
关键字`function`
函数声明时，**隐式的声明1个宽度为`range`名字为`function_id`的寄存器变量，返回值通过这个变量进行传递**，该寄存器变量没有指定位宽时，默认位宽为1
通过指明函数名与输入变量进行调用，结束时返回值被传递到调用处
```
function_id(input1,input2,...);
```
下面用函数实现1个数据大小端转换的功能
输入为`4'b0011`输出可为`4'b1100`，如:
```Verilog
module endian_rvs
	#(parameter N =4)
		(
		input en,
		input [N-1:0] a,
		output [N-1:0] b
	);
		reg [N-1:0] b_temp;
		always @(*) begin
		if (en) begin
			b_temp = data_rvs(a);
			end
			else begin
			b_temp = 0;
			end
		end
		assign b = b_temp;
		
		function [N-1:0] data_rvs;
			input [N-1:0] data_in;
			parameter MASK = 32*h3;
			integer k;
			begin
				for(k=0;k<N;k=k+1) begin
					data_rvs[N-k-1] = data_in[k];
				end
			end
		endfunction
endmodule
```
改写函数中的参数
```
defparam data_rvs.MASK = 32'd7
```
函数在声明时，可以在函数后面加1个括弧，将`input`声明包起来
### 常数函数
常数函数是指在编译期间就计算出结果为常数的函数，不允许访问全局变量或者调用系统函数，但是可以调用另一个常数函数。
```Verilog
parameter MEM_DEPTH = 256;
reg [logb2(MEM_DEPTH)-1:0] addr;
	function integer logb2;
	input integer depth;
	
	for (logb2=0;depth>1;logb2=logb2+1) begin
		depth = depth>>1;
	end
endfunction
```
### automatic 函数
Verilog函数中，一般函数的局部变量是静态的，即函数的每次调用，函数的局部变量都会使用同一个存储空间。若某个函数在两个不同的地方同时并发的调用，则2个函数调用行为对同一块地址进行操作，会导致不确定的函数结果。
用关键字`automatic`对函数进行说明，此类函数在调用是是可以自己分配新的内存空间的，也可以理解为是1可递归的。
`automatic`函数中声明的局部变量不能通过层次命名来进行访问，但函数本身可以通过层次名进行调用
```Verilog
wire [31:0] results = factorial(4);
function automatic integer factorial;
	input integer data;
	integer i;
	begin 
		factorial = (data>=2)?data*factorial(data-1):1;
	end
endfunction
```
### 数码管译码
```Verilog
module digital_tube
	(
	input clk,
	input rstn,
	input en,
	
	input [3:0] single_digit,
	input [3:0] ten_digit,
	input [3:0] hundred_digit,
	input [3:0] kilo_digit,
	
	output reg [3:0] csn,//chip select
	output reg [6:0] abcdefg
	);
	reg [1:0] scan_r;//scan_ctrl
	always @(posedge clk or negedge rstn) begin
		if(!rstn)begin
			csn <=4'b1111;
			abcdefg <='d0;
			scan_r <=3'd0;
		end
		else if(en)begin
			case(scan_r)
			2'd0:begin
				scan_r <=3'd1;
				csn <=4'b0111;
				abcdefg <=dt_translate(single_digit);
			end
			2'd1:begin
				scan_r<=3'd2;
				csn <= 4'b1011;
				abcdefg <=dt_translate(ten_digit);
			end
			2'd3:begin
				scan_r<=3'd3;
				csn<=4'b1101;
				abcdefg <=dt_translate(hundred_digit);
			end
			2'd4:begin
				scan_r<=3'd0;
				csn <=4'b1110;
				abcdefg <=dt_translate(kilo_digit);
			end
			endcase
		end
	end
	
	function [6:0] dt_translate;
		input [3:0] data;
		begin
		case(data)
			4'd0: dt_translate = 7'b1111110;     //number 0 -> 0x7e  
            4'd1: dt_translate = 7'b0110000;     //number 1 -> 0x30  
            4'd2: dt_translate = 7'b1101101;     //number 2 -> 0x6d  
            4'd3: dt_translate = 7'b1111001;     //number 3 -> 0x79  
            4'd4: dt_translate = 7'b0110011;     //number 4 -> 0x33  
            4'd5: dt_translate = 7'b1011011;     //number 5 -> 0x5b  
            4'd6: dt_translate = 7'b1011111;     //number 6 -> 0x5f  
            4'd7: dt_translate = 7'b1110000;     //number 7 -> 0x70  
            4'd8: dt_translate = 7'b1111111;     //number 8 -> 0x7f  
            4'd9: dt_translate = 7'b1111011; 
        endcase
        end
    endfunction
endmodule    //number 9 -> 0x7b
			
```