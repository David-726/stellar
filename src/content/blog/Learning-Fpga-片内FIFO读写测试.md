---
title: "片内FIFO读写测试"
published: 2026-08-26
description: ""
tags: ["Learning Fpga"]
draft: false
---
<img src="/posts/assets/1m747up-Pasted-image-20260826170130.png" alt="Pasted image 20260826170130.png" loading="lazy" />### 实验原理
FIFO
依旧通过例化IP核，根据FIFO的读写时序写入和读取FIFO存取的数据
<img src="/posts/assets/1vxo2ha-Pasted-image-20260826163848.png" alt="Pasted image 20260826163848.png" loading="lazy" />FIFO主要分为读和写两部分，另外是状态信号空和满和数据的数量状态信号，但是与RAM不同的是没有地址线，不能进行随机地址读取数据->也就是任意读取某个地址的数据
而FIFO则不能进行随机读取，这样的好处是不用频繁的控制地址线
虽然说没有引出地址线，但是在FIFO内部是有地址的操作的，用于控制RAM的读写端口，读写操作如图所示:
<img src="/posts/assets/1s0oosl-Pasted-image-20260826164239.png" alt="Pasted image 20260826164239.png" loading="lazy" />First In Last Out
深度值也就是1个FIFO中最大可以存放多少个数据，初始状态下，续写状态都是0，在向FIFO中写入1个数据时，写地址加1，读出1个数据，读地址加1，此时FIFO状态为空，因为写了1个数据，又读出了1个数据
>可以把FIFO想象成一个水池，写通道即为加水，读通道即为放水，假如不间断的加水和放水，如果加水速度比放水速度快，那么FIFO就会有满的时候，如果满了还继续加水就会溢出overflow，如果放水速度比加水速度快，那么FIFO就会有空的时候，所以把握好加水与放水的时机和速度，保证水池一直有水是一项很艰巨的任务。也就是判断空与满的状态，择机写数据或读数据

根据读写时钟，可以分为同步FIFO和异步FIFO，同步FIFO控制比较简单，主要介绍异步FIFO,其中读时钟75MHz,写时钟100MHz,
### 创建vivado工程
- 新建fifo_test工程，然后在工程中添加FIFO IP
- IP Catalog 弹出界面搜索FIFO 找到 FIFO Generator,双击打开
- 弹出的配置界面，可以选择读写时钟分开还是用1个，一般用FIFO是为了缓存数据，两边时钟速度不一样，独立时钟最常见，选择`Independent Clocks Block RAM`
- 切换到Native Ports 下，选择数据位宽16;FIFO Width Depth选择512,实际使用根据需要自行设置即可,Read Mode有2种方式:一个Standard FIFO，也就是常见的FIFO,数据之后于读信号1个周期，还有1个方式First Word Fall Through,数据预取模式，简称FWRT，FIFO会预先读出一个数据，当读信号有效时，相应的数据也有效
- 切换到Data Counts下，使能Write Data Count和Read Data Count,这样可以通过这两个值来看FIFO内部的数据多少，Generate FIFO IP
### FIFO端口定义与时序
|信号名称|方向|说明|
|---|---|---|
|rst|in|复位信号，高有效|
|wr_clk|in|写时钟输入|
|rd_clk|in|读时钟输入|
|din|in|写数据|
|wr_en|in|写使能，高有效|
|rd_en|in|读使能，高有效|
|dout|out|读数据|
|full|out|满信号|
|empty|out|空信号|
|rd_data_count|out|可读数据数量|
|wr_data_count|out|已写入的数据数量|
<img src="/posts/assets/b8wl33-Pasted-image-20260826165638.png" alt="Pasted image 20260826165638.png" loading="lazy" />FIFO 数据写入和读出都是按时钟的上升沿操作的，wr_en高电平时写入FIFO数据，almost_full信号有效时，表示FIFO只能再写入1个数据，一旦写入，full信号拉高，若是在full有效 wr_en仍然有效，也就是继续向FIFO写数据，则FIFO的overflow就会有效，溢出
- 标准FIFO写时序
rd_en信号为高时读FIFO数据，数据在下个周期有效。valid为数据有效信号，almost_enpty表示还有1个数据读，当再读1个数据,empty信号有效，如果继续读，则underflow有效，表示下溢，此时读出的数据无效
<img src="/posts/assets/1m747up-Pasted-image-20260826170132.png" alt="Pasted image 20260826170132.png" loading="lazy" />
- 标准FIFO读时序
再从FWRT模式读数据时序图中，rd_en信号有效时，有效数据D0已经在数据线上准备好有效了，不会再延后1个周期
### 程序编写
按照异步FIFO设计，pll产出2路时钟，用于读时钟和写时钟
```Verilog
`timescale 1ns/1ns
module fifo_test
	(
	input clk,
	input rst_n
	);
reg [15:0] w_data;
wire wr_en;
wire rd_en;
wire [15:0] r_data;
wire full;
wire empty;
wire [8:0] rd_data_count;
wire [8:0] wr_data_count;
wire clk_100M;
wire clk_75M；
wire locked;
wire fifo_rst_n;

wire wr_clk;
wire rd_clk;
reg [7:0] wcnt;
reg [7:0] rcnt;

clk_wiz_0 fifo_pll
(
	.clk_out1(clk_100M)，
	.clk_out2(clk_75M),
	.reset(~ret_n),
	.locked(locked),
	.clk_in1(clk)
);
assign fifo_rst_n = locked;
assign wr_clk = clk_100M；
assign rd_clk = clk_75M；

localparam W_IDLE = 1;
localparam W_FIFO = 2;
reg [2:0] write_state;
reg [2:0] next_write_state;

always@(posedge wr_clk or negedge fifo_rst_n)
begin
	if(!fifo_rst_n)
		write_state<=W_IDLE；
	else
		write_state<=next_write_state;
end

always@(*)
begin
	case(write_state)
		W_IDLE:
			begin
				if(wcnt==8'd79)
					next_write_state<=W_FIFO;
				else
					next_write_satte<=W_IDLE；
			end
		W_FIFO:
			next_write_state<=W_FIFO；
		default:
			next_write_state<=W_IDLE；
	endcase
end
always@(posedge wr_clk or negedge fifo_rst_n)
begin
	if(!fifo_rst_n)
		wcnt<=8‘d0;
	else if(write_state==W_IDLE)
		wcnt<=wcnt+1'b1;
	else
		wcnt<=8'b0;
end
assign wr_en=(write_state==W_FIFO)?~full:1'b0;
always@(posedge wr_clk or negedge fifo_rst_n)
begin
	if(!fifo_rst_n)
		w_data<=16'd1;
	else if(wr_en)
		w_data<=w_data+1'b1;
end
localparam R_IDLE =1;
localparam R_FIFO =2;
reg[2:0] read_state;
reg[2:0] next_read_state;
always@(posedge rd_clk or negedge fifo_rst_n)
begin
	if(!fifo_rst_n)
		read_state<=R_IDLE;
	else
		read_state<=next_read_state;
end

always@(*)
begin
	case(read_state)
		R_IDLE:
			begin
				if(rcnt==8'd59)
					next_read_state<=R_FIFO;
				else
					next_read_state<=R_IDLE;
			end
		R_FIFO:
			next_read_state<=R_FIFO;
		default:
			next_read_status<=R_IDLE;
	endcase
end
always@(posedge rd_clk or negedge fifo_rst_n)
begin
	if(!fifo_rst_n)
		rcnt<=8'd0;
	else if(write_state==W_IDLE)
		rcnt<=rcnt+1'b1;
	else
		rcnt<=8'd0;
end
assign rd_en = (read_state==R_FIFO)?~empty:1'b0;

fifo_ip fifo_ip_inst
(
	.rst  (~fifo_rst_n),
	.wr_clk (wr_clk),
	.rd_clk (rd_clk),
	.din (w_data),
	.wr_en (wr_en),
	.rd_en (rd_en),
	.dout (r_data),
	.full (full),
	.empty (empty),
	.rd_data_count (rd_data_count),
	.wr_data_count (wr_data_count)
);
ila_m0 ila_wfifo(
	.clk (wr_clk),
	.probe0 (w_data),
	.probe1(wr_en),
	.probe2(full),
	.probe3(wr_data_count)
);
ila_m0 ila_rfifo(
	.clk(rd_clk),
	.probe0(r_data),
	.probe1(rd_en),
	.probe2(empty),
	.probe3(rd_data_count)
);
endmodule
```
**Notice**:
FIFO设置默认为safety circuit,保证到达内部RAM的输入信号是同步的，这种情况下，异步复位后，则需要等待60个最慢周期，本实验中就是75MHz的60个周期，那么100MHz时钟大概需要(100/75)x60=80个周期
这就是上面`8'd59`和`8'd79`的由来
### 仿真
