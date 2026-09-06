---
title: "Verilog 并行FIR滤波器设计"
published: 2026-08-21
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 并行FIR滤波器设计
## FIR滤波器远离
有限长度 单位冲击响应滤波器
直接型结构:
<img src="/posts/assets/1qab4z6-Pasted-image-20260821185002.png" alt="Pasted image 20260821185002.png" loading="lazy" />$$
y_{n}=h(n)*x(n)=\sum_{k=0}^{N-1}h(k)x(n-k)
$$
**傅里叶表示**
### 并行FIR滤波器设计
设计参数:
```
输入参数: 7.5MHz 和 250MHz
采样频率: 50MHz
阻带: 1MHz~6MHz
阶数: 15(N-1=15)
```
#### 并行设计
设计中使用的乘法器模块代码，可以参考之前流水线式设计的乘法器
这里先用普通的乘法`*`
```Verilog
`define SAFE_DESIGN

	module fir_guide(
		 input rstn,
		 input clk,
		 input en,
		 input [11:0] xin,//输入信号
		 output valid,//输出数据有效信号
		 output [28:0] yout//输出数据，低频信号
	);
	
	reg [3:0] en_r;
	always @(posedge clk or negedge rstn) begin
		if(!rstn)begin
			en_r[3:0]<='b0;
		end
		else begin
			en_r[3:0] <= {en_r[2:0],en};
		end
	end
	
	reg [11:0] xin_reg[15:0];
	reg [3:0] i,j;
	always @(posedge clk or negedge rstn)begin
		if(!rstn)begin
			for(i=0;i<15;i=i+1)begin
				xin_reg[i]<=12'b0;
			end
		end
		else if (en)begin
			xin_reg[0]<=xin;
			for(j=0;j<15;j=j+1)begin
				xin_reg[j+1]<=xin_reg[j];//周期性移位操作
			end
		end
	end
	//系数对称 16个移存器进行首位相加 利用线性滤波器对称的特性 x[1]=x[15]...
	reg [12:0] add_reg[7:0];
	always @(posedge clk or negedge rstn)begin
		if(!rstn)begin
			for(i=0;i<8;i=i+1)begin
				add_reg[i]<=13'b0;
			end
		end
		else if(en_r[0])begin
			for(i=0;i<8;i=i+1)begin
				add_reg[i]<=xin_reg[i]+xin_reg[15-i];
			end
		end
	end
	
	//8个乘法器
	//滤波器系数，已经过一定程度的放大
	wire [11:0] coe[7:0];
	assign coe[0] = 12'd11;
	assign coe[1] = 12'd31;
	assign coe[2] = 12'd63;
	assign coe[3] = 12'd104;
	assign coe[4] = 12'd152;
	assign coe[5] = 12'd198;
	assign coe[6] = 12'd235;
	assign coe[7] = 12'd255;
	reg [24:0] mout[7:0];
	
ifdef SATE_DESIGN
	wire [7:0] valid_mult;
	genvar k;
	generate 
		for(k=0;k<9;k=k+1)begin
			mult_man #(13,12)
			u_mult_paral(
			.clk (clk),
			.rstn (rstn),
			.data_rdy (data_rdy),
			.mult1 (add_reg[k]),
			.mult2 (coe[k]),
			.res_rdy (valid_mult[k]),
			.res (mout[k])
			);
		end
	endgenerate
	wire valid_mult7 = valid_mult[7];
	
	else
		always @(posedge clk or negedge rstn)begin
			if(!rstn)begin
				for(i=0;i<8;i=i+1)begin
					mout[i]<=25'd0;
				end
			end
			else if(en_r[1])begin
				for(i=0;i<8;i=i+1)begin
					mout[i]<=coe[i]*add_reg[i];
				end
			end
		end
		wire valid_mult7 = en_r[2];
	endif
	
		//积分累加
		reg [3:0] valid_mult_r;
		always @(posedge clk or negedge rstn)begin
			if(!rstn)begin
				valid_mult_r[3:0]<='b0;
			end
			else begin
				valid_mult_r[3:0] <= {valid_mult_r[2:0],valid_mult7};
			end
		end
ifdef SAFE_DESIGN
	reg [28:0] sum1;
	reg [28:0] sum2;
	reg [28:0] yout_t;
	always @(posedge clk or negedge rstn)begin
		if(!rstn)begin
			sum1<=29'd0;
			sum2<=29'd0;
			yout_t <=29'd0;
		end
		else if(valid_mult7)begin
			sum1<=mout[0]+mout[1]+mout[2]+mout[3];
			sum2<=mout[4]+mout[5]+mout[6]+mout[7];
			yout_t <= sum1+sum2;
		end
	end
	
else 
	//一步计算累加结果，实际中时序很危险
	reg signed [28:0] sum;
	reg signed [28:0] yout_t;
	always @(posedge clk or negedge rstn)begin
		if(!rstn)begin
			sum<=29'd0;
			yout_t<=29'd0;
		end
		else if(valid_mult7)begin
			sum<=mout[0]+mout[1]+mout[2]+mout[3]+mout[4]+mout[5]+mout[6]+mout[7];
			yout_t<=sum;
		end
	end
endif
	assign yout = yout_t;
	assign vaild = valid_mult_r[0];
endmodule
	  
```