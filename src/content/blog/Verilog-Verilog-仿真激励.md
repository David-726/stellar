---
title: "Verilog 仿真激励"
published: 2026-08-19
description: ""
tags: ["Verilog"]
draft: false
---
对于稍微复杂的Verilog设计，如果不进行仿真，99.999999%的手子都会出错
## testbench 结构划分
一般结构包括:
- 信号声明
- 复位
- 时钟
- 激励
- 模块例化
- 自校验
- 停止仿真
基本结构包括:
- 信号声明
- 激励
- 模块例化
### testbench 仿真举例
```Verilog
module data_consolidation
	(
	input clk,
	input rstn,
	input [1:0] din,
	input din_en,
	output [7:0] dout,
	output dout_en
	);
	reg [7:0] data_r;
	reg [1:0] state_cnt;
	always @(posedge clk or negedge rstn) begin
		if(!rstn) begin
			state_cnt <='b0;
			data_r <= 'b0;
		end
		else if(din_en)begin
			state_cnt <= state_cnt+1'b1;
			data_r <= {data_r[5:0],din};
		end
		else begin
			state_cnt <= 'b0;
		end
		
	end
	assign dout = data_r;
	reg dout_en_r;
	always @(posedge clk or negedge rstn) begin
		if(!rstn)begin
			dout_en_r<='b0;
		end
		else if(state_cnt == 2'd3&din_en) begin
			dout_en_r <= 1'b1;
		end
		else begin
			dout_en_r <= 1'b0;
		end
	end
	assign dout_en = dout_en_r;
endmodule
```
对应的testbench描述
```Verilog
`timescale 1ns/1ns

//信号声明
module test;
	reg clk;
	reg rstn;
	reg [1:0] din;
	reg din_en;
	wire [7:0] dout;
	wire dout_en;
	
	//时钟生成
	real CYCLE_200MHz= 5;
	always begin
		clk = 0; #(CYCLE_200MHz/2);
		clk = 1; #(CYCLE_200MHz/2);
	end
	
	//复位生成
	initial begin
		rstn = 1'b0;
		#8 rstn = 1'b1;
	end
	
	//motivation
	int fd_rd;
	reg [7:0] data_in_temp;
	reg [15:0] read_temp;
	initial begin
		din_en = 1'b0;
		din = 'b0;
		open_file("../tb/data_in.dat","r",fd_rd);
		wait (rstn);
		#CYCLE_200MHz;
		
		//read data from file
		while(!$Feof(fa_rd)) begin
			@(negedge clk);
			$fread(read_temp,fd_rd);
			din = read_temp[9:8];
			data_in_temp={data_in_temp[5:0],din};
			din_en=1'b1;
		end
		
		//stop data
		@(posedge clk);
		#2 din_en = 1'b0;
	end
	
	//open task
	task open_file;
		input string file_dir_name;
		input string rw;
		output int fd;
		
		fd = $open(file_dir_name,rw);
		if(!fd)begin
			$display("---iii---Failed to open files:%s",file_dir_name);
		end
		else begin
			$display("---iii---%s has been opened successfully.",file_dir_name)
		end
		
	endtask
	
	//模块例化
	data_consolidation u_data_process
	(
	.clk (clk),
	.rstn (rstn),
	.din (din),
	.din_en (din_en),
	.dout (dout),
	.dout_en (dout_en)
	);
	
	//自校验(不必要)
	reg [7:0] err_cnt;
	int fd_wr;
	initial begin
		err_cnt = 'b0;
		open_file("../tb/data_out.bat","w",fd_wr);
		forever begin
			@(negedge clk);
			if(dout_en)begin
				$fdisplay(fd_wr,"%h",dout);
			end
		end
	end
	always @(posedge clk) begin
		#1;
		if(dout_cnt) begin
			if(data_in_temp!=dout)begin
				err_cnt=err_cnt+1'b1;
			end
		end
	end
	
	//simulation finish
	always begin
		#100;
		if($time >= 1000000) begin
			if(!err_cnt) begin
				$display("---------------");
				$display("Data process is OK!!!");
				$display("---------------");
			end
			else begin
				$display("---------------");
				$display("Error occurs in data process!!!");
				$display("---------------");
			end
		end
	end
endmodule
```
