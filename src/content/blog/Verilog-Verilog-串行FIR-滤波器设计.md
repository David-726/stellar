---
title: "Verilog 串行FIR 滤波器设计"
published: 2026-08-21
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 串行FIR滤波器设计
## 串行FIR滤波器设计
输入要求:
```
输入频率：    7.5MHz 和 250KHz
采样频率：    50MHz
阻带：           1MHz-6MHz
阶数：           15 （N=15）
```
串行设计->16个时钟周期内对16个延时数据分时依次进行乘法、加法运算，然后再时钟驱动下输出滤波值。
FIE滤波器系数的对称性->计算1个滤波输出值的周期可以减少到8个，串行设计时每个周期只进行1此乘法运算，所以设计中只需要1个乘法器。
需要每8个时钟周期有效输入1次，但是为了保证输出信号频率的正确性，工作时钟需要为采样频率的8倍，
YesbutWhy
### 串行设计
```Verilog
`define SAFE_DESIGN

module fir_serial_low(
	input rstn,
	input clk,
	input en,
	input [11:0] xin,
	output valid,
	output [28:0] yout
);
	reg[11:0] en_r;
	always @(posedge clk or negedge rstn)begin
		if(!rstn)begin
			en_r[11:0] <= 'b0;
		end
		else begin
			en_r[11:0] <= {en_r[10:0],en};
		end
	end
	
	wire [11:0] coe[7:0];
	assign coe[0] = 12'd11;
	assign coe[1] = 12'd31;
	assign coe[2] = 12'd63;
	assign coe[3] = 12'd104;
	assign coe[4] = 12'd152;
	assign coe[5] = 12'd198;
	assign coe[6] = 12'd235;
	assign coe[7] = 12'd255;
	
	reg [2:0] cnt;
	integer i,j;
	always @(posedge clk or negedge rstn)begin
		if(!rstn)begin
			cnt<=3'0;
		end
		else if(en||cnt!=0)begin
			cnt<=cnt+1'b1;
		end
	end
	
	reg[11:0] xin_reg[15:0];
	always @(posedge clk or negedge rstn)begin
		if(!rstn)begin
			for(i=0;i<16;i=i+1)
				xin_reg[i]<=12'b0;
			end
		end
		else if (cnt==3'd0&&en)begin
			xin_reg[0]<=xin;
			for(j=0;j<15;j=j+1)begin
				xin_reg[j+1]<=xin_reg[j]
			end
		end
	end
	
	reg [11:0] add_a,add_b;
	reg [11:0] coe_s;
	wire [12:0] add_s;
	wire [2:0] xin_index = cnt<=1?cnt-1:3'd7;
	always @(posedge clk or negedge rstn)begin
		if(!rstn)begin
			add_a<=13'b0;
			add_b<=13'b0;
			coe_s<=12'b0;
		end
		else if(en_r[xin_index])begin
			add_a<=xin_reg[xin_index];
			add_n<=xin_reg[15-xin_index];
			coe_s<=coe[xin_index];
		end
	end
	assign add_s = {add_a}+{add_b};
	
	reg [24:0] mout;
`ifdef SAFE_DESIGN
	wire en_mult;
	wire [3:0] index_mult=cnt>=2?cnt-1:4'd7+cnt[0];
	mult_man #(13,12) u_mult_single
		(.clk (clk),
		 .rstn (rstn),
		 .data_rdy (en_r[index_mult]),
		 .mult1 (add_s),
		 .mult2 (coe_s),
		 .res_rdy (en_mult),
		 .res (mout)
		);
`else
	always @(posedge clk or negedge rstn)begin
		if(!rstn)begin
			mout<=25'd0;
		end
		else if(|en_r[8:1])begin
			mout<=coe_s+add_s;
		end
	end
	wire en_mult=en_r[2];
`endif

	reg [28:0] sum;
	reg valid_r;
	//mult output en counter
	reg [4:0] cnt_acc_r;
	always @(posedge clk or negedge rstn)begin
		if(!rstn)begin
			cnt_acc_r<='b0;
		end
		else if(cnt_acc_r==5'd7)begin
			cnt_acc_r<='b0;
		end
		else if(en_mult||cnt_acc_r!=0)begin
			cnt_acc_r<=cnt_acc_r+1'b1;
		end
	end
	always @(posedge clk or negedge rstn)begin
		if(!rstn)begin
			sum<=29'b0;
			valid_r<=1'b0;
		end
		else if(cnt_acc_r==5'd7)begin//第八个周期累加
			sum<=sum+mout;
			valid_r<=1'b1;
		end
		else if(en_mult&&cnt_acc_r==0)begin//初始化
			sum<=mout;
			valid_r<=1'b0;
		end
		else if(cnt_acc_r!=0)begin
			sum <=sum+mout;
			valid_r<=1'b0;
		end
	end
	reg [28:0] yout_r;
	always @(posedge clk or negedge rstn)begin
		if(!rstn)begin
			yout_r<='b0;
		end
		else if(valid_r)begin
			yout_r<=sum;
		end
	end
	assign yout=yout_r;
	
	//输出信号有效延迟
	reg [4:0] cnt_valid;
	always @(posedge clk or negedge rstn)begin
		if(!rstn)begin
			cnt_valid<='b0;
		end
		else if(valid_r&&cnt_valid!=5'd16)begin
			cnt_valid<=cnt_valid+1'b1;
		end
	end
	assign valid = (cnt_valid == 5'd16)&valid_r;
	
endmodule
``` 