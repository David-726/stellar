---
title: "片内ROM读写"
published: 2026-08-26
description: ""
tags: ["Learning Fpga"]
draft: false
---
### 实验原理
只需要通过IP和例化一个RAM，根据RAM的读写时序来写入和读取RAM中存储的数据
### 创建vivado工程
新建一个`ram_test`工程，然后在工程中添加RAM IP
- 图中IP Catalog中，搜索ram,找到`Block Memory Generator`双击打开
- 将Component Name改为ram_ip,Basic下Memory Type改为Simple Dual Prot RAM，->伪双口RAM,一般是最常见的，输入和输出独立
- 切换到Port A Options下，RAM 位宽Port A Width改为16，也就是数据宽度。RAM深度Port A Depth->512,Enable Port Type->Always Enable
- 切换到Port B Options，将RAM位宽 Port B Width->16,Enable Port Type->Always Enable,或者Use ENB Pin，相当于读使能信号
- 在Other Options栏目中，保持默认配置
- Generate RAM IP

### RAM的端口定义和时序
|信号名称|方向|说明|
|---|---|---|
|clka|in|端口A时钟输入|
|wea|in|端口A使能|
|addra|in|端口A地址输入|
|dina|in|端口A数据输入|
|clkb|in|端口B时钟输入|
|addrb|in|端口B地址输入|
|doutb|out|端口B数据输输出|
RAM A数据写入和读出都是按时钟的上升沿操作的，写入时需要拉高wea信号，同时提供地址和要写入的数据<img src="/posts/assets/1hpxc-image712.webp" alt="image712.webp" loading="lazy" />RAM B 只能读出，因此不粗要din_in
<img src="/posts/assets/1uul-image88.webp" alt="image88.webp" loading="lazy" />
### 测试程序编写
```Verilog
`timescale 1ns/1ns

module ram_test(
					input clk,
					input rst_n
	);
reg [8:0] w_addr;
reg [15:0] w_data;
reg wea;
reg [8:0] r_addr;
wire [15:0] r_data;

always @(posedge clk or negedge rst_n)
begin
	if(!rst_n)
		r_addr<=9'd0;
	else if(|w_addr)
		r_addr<=r_addr+1‘b1;
	else 
		r_addr<=9'd0;
end

always @(posedge clk or negedge rst_n)begin
	if(!rst_n)begin
		w_addr<=9'd0;
		w_data<=16'd1;
	end
	else
	begin
		if(wea)begin
				if(&w_addr)begin
					w_addr<=w_addr;
					w_data<=w_data;
				end
				else begin
					w_addr<=w_addr+1'b1;
					w_data<=w_data+1'b1;
				end
		end
	end
end

ram_ip ram_ip_inst(
	.clka (clk ),
	.wea(wea ),
	.addra(w_addr ),
	.dina(w_data ),
	.clkb(clk ),
	.addrb(r_addr ),
	.doutb(r_dara )
);
//实例化ila逻辑分析仪
ila_0 ila_0_inst(
	.clk （clk),
	.probe (r_data),
	.probe1 (r_addr)
	
);
endmodule
				
```
添加ila工具来观察RAM PORTB的数据信号和地址信号
- 绑定引脚
### 仿真

