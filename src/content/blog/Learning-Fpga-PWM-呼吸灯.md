---
title: "PWM 呼吸灯"
published: 2026-08-26
description: ""
tags: ["Learning Fpga"]
draft: false
---
### 实验原理
1个Nbit的计数器，最大可以表示2的N次方，最小值0，计数器以`period`为步进值累加，加到最大值会溢出，进入下一个累加周期。
计数器值大于`duty`时，脉冲输出高，否则输出低，这样就可以完成图中红色线所示的脉冲占空比可调的脉冲输出，同时`period`可调频率，理解为计数器的步进值
<img src="/posts/assets/3a1-Pasted-image-20260826183232.png" alt="Pasted image 20260826183232.png" loading="lazy" />
### 程序设计
|信号名称|方向|说明|
|---|---|---|
|clk|in|时钟输入|
|rst|in|异步复位输入，高复位|
|period|in|PWM脉宽周期（频率）控制。period = PWM输出频率 * (2 的N次方) / 系统时钟频率。显然N越大，频率精度越高。|
|duty|in|占空比控制，占空比 = duty / (2的N次方）* 100%|
```Verilog
`timescale 1ns/1ns
module ax_pwm
#(
	parameter N = 16
)
(
	input clk,
	input rst,
	input [N-1:0] period,
	input [N-1:0] duty,
	output pwm_out
);
reg [N-1:0] period_r;
reg [N-1:0] duty_r;
reg [N-1:0] period_cnt;
reg pwm_r;
assign pwm_out=pwm_r;
always@(posedge clk or posedge rst)
begin
	if(rst==1)
	begin
		period_r<={N{1'b0}};
		duty_r<={N{1'b0}};
	end
	else
	begin
		period_r<=period;
		duty<=duty;
	end
end
always@(posedge clk or posedge rst)
begin
	if(rst==1)
		period_cnt<={N{1'b0}};
	else
		period_cnt<=period_cnt+period_r;
end
always@(posedge clk or posedge rst)
begin
	if(rst==1)
	begin
		pwm_r<=1‘b0;
	end
	else
	begin
		if(period_cnt>=duty_r)
			pwm_r<=1'b1;
		else
			pwm_r<=1'b0;
	end
end
```
实现呼吸灯，控制占空比，就是控制duty的值
```Verilog
`timescale 1ns/1sn
module pwm_test(
	input clk,
	input rst_n,
	output led
);
localparam CLK_FREQ=50;
localparam US_COUNT=CLK_FREQ;
localparam MS_COUNT=CLK_FREQ*1000;

localparam DUTY_STEP = 32’d100000;
localparam DUTY_MIN_VALUE = 32‘h6fffffff;
localparam DUTY_MAX_VALUE = 32‘hffffffff;

localparam IDLE = 0;
localparam PWM_PLUS = 1;
localparam PWM_MINUS = 2;
localparam PWM_GAP = 3;

wire pwm_out;
reg [31:0] period;
reg [31:0] duty;
reg pwm_flag;

reg [3:0] state;
reg [31:0] timer;

assign led = ~pwm_out;
always@(posedge clk or negedge rst_n)
begin
	if(rst == 1'b0)
	begin
		period <= 32'd0;
		timer <= 32'd0;
		duty <= 32'd0;
		pwm_flag <= 1’b0;
		state <= IDLE;
	end
	else
		case(state)
			IDLE：
			begin
				period <= 32'd17178;
				state <= PWM_PLUS;
				duty <= DUTY_MIN_VALUE;
			end
			PWM_PLUS:
			begin
				if(duty>DUTY_MAX_VALUE-DUTY_STEP)
				begin
					pwm_flag<=1‘b1;
					duty <= duty-DUTY_STEP;
				end
				else
				begin
					pwm_flag<=1'b0;
					duty<=duty+DUTY_STEP;
				end
				state <=PWM_GAP;
			end
			PWM_MINUS:
			begin
				if(duty<DUTY_MIN_VALUE+DUTY_STEP)
				begin
					pwn_flag<=1'b0;
				end
				else
				begin
					pwm_flag<=1'b1;
				end
				state<=PWM_GAP;
			end
			PWM_GAP:
			begin
				if(timer>=US_COUNT*100)
				begin
					if(pwm_flag)
						state<=PWM_MINUS;
					else
						state<=PWM_PLUS;
					timer<=32'd0;
				end
				else
				begin
					timer<=timer=32'd1;
				end
			end
			default:
			begin
				state<=IDLE;
			end
		endcase
end
ax_pwm
#(
	.N(32)
)
ax_pwm_mo(
	.clk (clk),
	.rst (rst),
	.period (period),
	.duty (duty),
	.pwm_out (pwm_out)
);
endmodule
			
```