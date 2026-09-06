---
title: "Verilog 时延"
published: 2026-08-14
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 时延
连续赋值延时语句中的延时，用于控制任意操作数发生变化到语句左端赋予新值之间的时间延时，
时延一般是不可综合的，寄存器的时延是可以控制的，这部分在时许控制里加以说明。
连续赋值时延一般可以分为普通赋值时延、隐式时延、声明时延。
```Verilog
//普通时延:A&B计算结果延时10个时间单位赋值给Z
wire Z,A,B;
assign #10 Z=A&B;
```
```Verilog
//隐式时延:声明一个wire型变量对其进行包含一定时延的连续赋值
wire A,B;
wire #10 Z=A&B;
```
```Verilog
//声明时延:声明一个wire型变量是指定一个时延，因此对该变量所有的连续赋值都会被推迟到指定的时间，除非门级建模中，一般不推荐此类方法建模。
wire A,B;
wire #10 Z;
assign Z=A&B
```
## 惯性时延
上述例子中，A或者B任意一个变量发生变化，在Z得到新的值之前，有10个时间单位的延时。若在这10个时间单位内，即在Z获取新的值之前，A或B任意一个值又发生了变化，那么计算Z的新值会取当前的新值。所以称之为惯性时延，即信号脉冲宽度小于时延时，对输出没有影响。
因此仿真时，时延一定要设置合理，防止某些信号不能进行有效的延迟。
```Verilog
module time_delay_module(
	input ai,bi,
	output so_lose,so_get,so_normal);
	
	assign #20 so_lose = ai&bi;
	assign #5 so_get = ai&bi;
	assign so_normal = ai&bi;
endmodule
```
testbench参考如下：
```Verilog
`timescale 1ns/1ns

module test
	reg ai,bi;
	wire so_lose,so_get,so_normal;
	
	initial begin
		ai = 0;
		#25; ai = 1;
		#35; ai = 0; //60ns
		#40; ai = 1; //100ns
		#10; ai = 0; //110ns
	end
	initial begin
		bi = 1;
		#70; bi =0;
		#20; bi =1;
	end
	
	time_delay_module u_wire_delay(
		.ai      (ai),
		.bi      (bi),
		.so_lose (so_lose),
		.so_get  (so_get),
		.so_normal (so_normal));
	initial begin
		forever begin
			#100
			//$display("---gyc---%d",$time);
			if($time >= 1000)begin
				$finish;
			end
		end
	end
endmodule
```