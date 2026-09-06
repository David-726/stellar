---
title: "LeNet on fpga"
published: 2026-09-05
description: ""
tags: []
draft: false
---
### 硬件加速器架构

<img src="/posts/assets/1y162tj-lenet-2.svg" alt="lenet 2.svg" loading="lazy" />
第一层conv输出channel=6,第二层conv输出channel=12
<img src="/posts/assets/m4hdzb-Pasted-image-20260905154645.png" alt="Pasted image 20260905154645.png" loading="lazy" />
- 卷积部分并行度等于6(**由第一个卷积层的通道数决定**)
- 整个网络可以分为**13**次卷积:
	6个卷积加速模块可复用，(6x1/6+6x12/6=13)
- 权重参数直接存储在 BRAM 中，图片存储在SD卡中，通过DMA读取，传输到pl端的FIFO中，供加速器使用
#### window
滑窗模块的实现:
输入28x28:<img src="/posts/assets/1afcuw5-Pasted-image-20260905160610.png" alt="Pasted image 20260905160610.png" loading="lazy" />
该window需要满足:2层卷积都能应用:
- conv2d1:28x28
- conv2d2:12x12
由于kernel_size=5x5,因此由左到右由上到下的顺序，先进行前5行的滑动:28x5
```Verilog
module windows
(
	input clk,
	input rstn,
	input start,
	input state,
	input [7:0] din,
	output [39:0] taps //1列数据
);
	integer i;
	// reg start_ff;
	reg [7:0] mem[0:139];
	always@(posedge clk)begin
		if(start)
			begin
				mem[0]<=din;
				for(i=0;i<139;i=i+1)
					mem[i+1]<=mem[i];
			end
	end
	assign taps = (!state)?{mem[139],mem[111],mem[83],mem[55],mem[27]}:{mem[59],mem[47],mem[35],mem[23],mem[11]}
endmodule
```
testBench
```Verilog
module window_tb():
	reg clk;
	reg resetn;
	reg start_window;
	reg[7:0] image_in;
	
	wire [39:0] taps//5x8=40
	
	integer fp_i;
	integer count_w;
	//读取行数计数
	reg [10:0] cnt_line;
	//windows module
	window window_inst(
		.clk (clk),
		.rstn (rstn),
		.start (start_window),
		.state (state),
		.din (image_in),
		.taps (taps)
	);
	initial
	begin
		//读取图片数据(将图片的像素点转化为txtx文件)
		fp_i = $fopen...
	end
	//初始信号
	initial
	begin
		cnt_line = 0;
		clk = 0;
		start_window = 0;
		state = 0;
		#20;
		start_window = 1;
	end
	always @(posedge clk)
	begin
		begin
			count_w <= $fscanf(fp_i,"%b",image_in);
			cnt_line <= cnt_line+1;
			if(cnt_line == 11'd784) $display("picture read over");
			end 
	end
	//50MHz
	always #10 clk<=~clk;
endmodule
```

### Conv2d Module
pipeline:
- 先在缓存中加载5x5的kernel的权重矩阵，然后加载刚才的window5x5,各个元素相乘后相加，完成卷积
- 这里加法器采用流水线的设计:一步步两两相邻相加直到剩一个结果 **(合成大西瓜幻视)**
- 当前window的conv计算完毕后，window开始滑动(从左向右、从上到下)
- 最终卷积结果是(28-5+1)24x24
执行流程：
Drawing 2026-09-05 16.40.24.excalidraw
```Verilog
module conv
#(
	parameter K=5,
	parameter S=1
)
(
	input clk,
	input rstn,
	input start, //卷积计算开始标志
	input weight_en, //权重读取使能
	input signed [7:0] weight, //8bit:权重参数
	input [39:0] taps, 
	input state, //state=0,表示第一层卷积;state=1,表示第2层卷积
	
	output signed [31:0] dout,
	output ovalid,
	output done
);
	reg [7:0] weight_addr = 8'd0;
	reg [19:0] cnt1;
	reg [9:0] cnt2;
	reg [9:0] cnt2s;
	reg [9:0] cnt3s;
	reg [31:0] wr_data;//卷积计算结果
	
	reg sum_valid; //结果有效标志
	reg sum_valid_ff;
	
	reg [4:0] Ni;
	
	always@(*)
	if(!state)
		Ni<=5'd28;
	else
		Ni<=4'd12
	
	reg signed [7:0] k00,k01,k02,k03,k04,k10,k11,k12,k13,k14,k20,k21,k22,k23,k24,k30,k31,k32,k33,k34,k40,k41,k42,k43,k44
	wire signed [7:0] m04,m14,m24,m34,m44;
	reg signed [7:0] m00,m01,m02,m03,m10,m11,m12,m13,m20,m21,m22,m23,m30,m31,m32,m33,m40,m41,m42,m43;
	reg signed [15:0] p00,p01,p02,p03,p04,p10,p11,p12,p13,p14,p20,p21,p22,p23,p24,p30,p31,p32,p33,p34,p40,p41,p42,p43,p44
	reg signed [16:0] sum00,sum01,sum02,sum03,sum04,sum05,sum06,sum07,sum08,sum09,sum10,sum11,sum12,sum13,sum14;
	reg signed [17:0] sum15,sum16,sum17,sum18,sum19,sum20,sum21,sum22,sum23,sum24;
	reg signed[18:0] sum0,sum1,sum2,sum3,sum4;
	reg signed[19:0] sum100,sum101,sum102;
	reg signed[20:0] sum110,sum120
	
	//window
	assign m04=taps[39:32];
	assign m14=taps[31:24];
	assign m24=taps[23:16];
	assign m34=taps[15:8];
	assign m44=taps[7:0];
	
	always@(posedge clk)
	begin
		{m00,m01,m02,m03)<={m01,m02,m03,m04};
		{m10,m11,m12,m13}<={m11,m12,m13,m14};
		{m20,m21,m22,m23}<={m21,m22,m23,m24};
		{m30,m31,m32,m33}<={m31,m32,m33,m34};
		{m40,m41,m42,m43}<={m41,m42,m43,m44};
	end
	
	//=======加载权重矩阵======
	always@(posedge clk or negedge rstn)
	begin
		if(!rstn||!start)
			weight_addr<=0;
		else
			if(weight_addr == 8'd25)
				weight_addr<=weight_addr;
			else
				if(!weight_en)
					weight_addr<=weight_addr;
				else
					weight_addr<=weight_addr+1;
	end
	//缓存权重
	always@(posedge clk)
	begin
		case(weight_addr)
			8'd0: k00<=weight;
			8'd1: k01<=weight;
			8'd2: k02<=weight;
			8'd3: k03<=weight;
			8'd4: k04<=weight;
			8'd5: k10<=weight;
			8'd6: k11<=weight;
			8'd7: k12<=weight;
			8'd8: k13<=weight;
			8'd9: k14<=weight;
			8'd10: k20<=weight;
			8'd11: k21<=weight;
			8'd12: k22<=weight;
			8'd13: k23<=weight;
			8'd14: k24<=weight;
			8'd15: k30<=weight;
			8'd16: k31<=weight;
			8'd17: k32<=weight;
			8'd18: k33<=weight;
			8'd19: k34<=weight;
			8'd20: k40<=weight;
			8'd21: k41<=weight;
			8'd22: k42<=weight;
			8'd23: k43<=weight;
			8'd24: k44<=weight;
			default:;
			
	end
	//流水线 第一级
	always@(posedge clk)
	begin
		p00<=k00*m00;
		p01<=k01*m01;
		p02<=k02*m02;
		p03<=k03*m03;
		p04<=k04*m04;
		p10<=k10*m10;
		p11<=k11*m11;
		p12<=k12*m12;
		p13<=k13*m13;
		p14<=k14*m14;
		p20<=k20*m20;
		p21<=k21*m21;
		p22<=k22*m22;
		p23<=k23*m23;
		p24<=k24*m24;
		p30<=k30*m30;
		p31<=k31*m31;
		p32<=k32*m32;
		p33<=k33*m33;
		p34<=k34*m34;
		p40<=k40*m40;
		p41<=k41*m41;
		p42<=k42*m42;
		p43<=k43*m43;
		p44<=k44*m44;
	end
	//流水线 第二级
	always@(posedge clk)
	begin
		sum00<=p00+p10;
		sum01<=p20+p30;
		sum02<=p40;
		sum03<=p01+p11;
		sum04<=p21+p31;
		sum05<=p41;
		sum06<=p02+p12;
		sum07<=p22+p32;
		sum08<=p42;
		sum09<=p03+p13;
		sum10<=p23+p33;
		sum11<=p43;
		sum12<=p04+p14;
		sum13<=p24+p34;
		sum14<=p44;
	end
	//流水线 第三级
	always@(posedge clk)
	begin
		sum15<=sum00+sum01;
		sum16<=sum02;
		sum17<=sum03+sum04;
		sum18<=sum05;
		sum19<=sum06+sum07;
		sum20<=sum08;
		sum21<=sum09+sum10;
		sum22<=sum11;
		sum23<=sum12+sum13;
		sum24<=sum14;
	end
	//流水线 第四级
	always@(posedge clk)
	begin
		sum0<=sum15+sum16;
		sum1<=sum17+sum18;
		sum2<=sum19+sum20;
		sum3<=sum21+sum22;
		sum4<=sum23+sum24;
	end
	//流水线 第五级
	always@(posedge clk)
	begin
		sum100<=sum0+sum1;
		sum101<=sum2+sum3;
		sum102<=sum4
	end
	//流水线 第六级
	always@(posedge clk)
	begin
		sum110<=sum100+sum101;
		sum120<=sum102;
	end
	//流水线 第其级
	always@(posedge clk)
	begin
		wr_data<=sum110+sum120;
	end
	//conv模块工作时钟计数
	always@(posedge clk)
	begin
		if(start)
			cnt1<=cnt1+1'd1;
		else
			cnt1<=19'd0;
	end
	//列计数
	//计数窗口横向移动
	always@(posedge clk)
	begin
		if(sum_valid)
			if(cnt2 == Ni-1)
				cnt2<=10'd0;
			else
				cnt2<=cnt2+10'd1;
		else
			cnt2<=10'd0;
	end
	//卷积列步长
	always@(posedge clk)
	if(sum_valid)
		if(cnt2==Ni-1)
			if(cnt3s==S-1)
				cnt3s<=10'd0;
			else
				cnt3s<=cnt3s+1'd1;
		else
		cnt3s<=cnt3s;
	else
	cnt3s<=10'd0;
	
	//行步长
	always@(posedge clk)
	begin
		if(!start)
			sum_valid<=1'b0;
		else
			case(state)
			//输入图像28*28
			1'b0:if(cnt1==10'd829-2'd1)
					sum_valid<=1'd0;
				else if(cnt1==(8'd161-2'd1))
					sum_valid<=1'd1;
			1'b1:if(cnt1==10'd255)
					sum_valid<=1'b0;
				else if(cnt1==8'd163)
					sum_valid<=1'b1;
			endcase
	end
	//延迟一帧，用于采沿，判断卷积是否完成
	always@(posedge clk)begin
		sum_valid_ff<=sum_valid;
	end
		
	assign done=~sum_valid&&sum_valid_ff; //采样下降沿，标志此卷积核与输入图像卷积完成
	assign ovalid=(sum_vlaid&&cnt2<Ni-K+1&&cnt2s==0&&cnt3s==0)?1:0;
	assign dout = wr_data;
	
endmodule
	
```
testBench:
### Pooler Module
Max Pooler:
```Verilog
//Max Pooler
module maxpooling
(
	input clk,
	input rstn,
	input ivalid,  //输入有效
	input state,  
	input [7:0] din,
	output ovalid,
	output [7:0] dout
);
	reg [7:0] data[0:23]; //缓存一行输入数据24or8
	reg [6:0] ptr; //地址指针
	reg cnt;
	reg [7:0] data_reg_0;
	reg [7:0] data_reg_1;
	reg [7:0] dout_r; //最终输出结果
	 
	//ptr地址指针递增
	always@(posedge clk)begin
		if(!rstn)
			ptr<=7'b0000000;
		else
			case(state)
				1'b0:begin
					if(ptr == 7'd48-1) //2*24两行
						ptr<=7'd0;
					else
						if(!ivalid)
							ptr<=ptr;
						else
							ptr<=ptr+7'd1;
					end
				1'b1:begin
					if(ptr == 7'd15-1)
						ptr<=7'd0;
					else
						if(!valid)
							ptr<=ptr;
						else
							ptr<=ptr+7'd1;
						end
			endcase
	end
	
	//cnt计数 由于cnt只有1bit 所以只会在0\1之间变化
	always@(posedge clk or negedge rstn)begin
	if(!rstn)
	cnt<=0；
	else
		case(state)
			1'b0:begin
				if(ptr<7'd25-1)
					cnt<=0;
				else
					if(ivalid)
						cnt<=cnt+1'b1;
					else
						cnt<=cnt;
				end
			1'b1:begin
				if(ptr<=7'd8-1)
					cny<=0;
				else
					if(ivalid)
						cnt<=cnt+1'b1;
					else
						cnt<=cnt;
				end
		endcase
	end
	
	//行数据缓存
	always@(posedge clk)
	begin
		case(state)
		1'b0:begin
			if(ptr<=7'd24&&ivalid)
				data[ptr]<=din;
			end
		1'b1:begin
			if(ptr<=7'd8&&ivalid)
				data[ptr<=din;
			end
		endcase
	end
	always@(posedge clk)
	begin
		case({state,cnt})
		2'b00:begin
			if(ptr>=7'd24)
			begin
				if(din>data[ptr-7'd24])
					data_reg_0<=din;
				else
					data_reg_0<=data[ptr-7'd24]
			end
			else
				data_reg_0<=0;
			end
		2'b01:begin
			if(ptr>=7‘d24)
			begin
				if(din>data[ptr-7'd24])
					data_reg_1<=din;
				else
					data_reg_1<=data[ptr-7'd24];
			end
			else
				data_reg_1<=0;
			end
		2'b10:begin
			if(ptr>=7'd9)
			begin
				if(din>data[ptr-7'd9])
					data_reg_0<=din;
				else
					data_reg_0<=data[ptr-7'd9]
			end
			else
				data_reg_0<=0;
			end
		2'b11:begin
			if(ptr>=7'd9)
			begin
				if(din>data[ptr-7'd9])
					data_reg_1<=din;
				else
					data_reg_1<=data[ptr-7'd9]
			end
			else
				data_reg_1<=0;
			end
		endcase
	end
	//打拍采样
	reg cnt_d;
	always@(posedge clk)begin
		if(!rstn)
			cnt_d<=0;
		else
			cnt_d<=cnt;
	end
	
	//cnt为1时,输出有效:2x2的kernel,cnt=1含义是第二行且为偶数位索引
	assign ovalid=~cnt&&cnt_d;
	assign dout=data_reg_1>data_reg_0?data_reg_1:data_reg_0;
endmodule
```
Testbench:
略
### FNN Module
```Verilog
//192xcycle+(192/6)xcycle+4xcycle+cycle
module fc
(
	input clk,
	input rstn,
	input ivalid,
	input signed [7:0] din_0,
	input signed [7:0] din_1,
	input signed [7:0] din_2,
	input signed [7:0] din_3,
	input signed [7:0] din_4,
	input signed [7:0] din_5,
	input signed [7:0] weight,
	input weight_en,
	
	output ovalid,
	output sigend [31:0] dout
);
	reg [7:0] weight_addr;
	
	reg signed [7:0] w [0:191];
	
	reg [4:0] cnt;
	reg [4:0] cnt_sum; //有效num个数计数
	reg [1:0] cnt_wren; //到2时输出最终结果
	
	reg state;
	reg sum_valid;
	reg wren;
	reg signed [15:0] p0,p1,p2,p3,p4,p5;
	reg signed [16:0] sum00,sum01,sum02;
	reg signed [17:0] sum10,sum11;
	reg signed [18:0] sum;
	reg signed [22:0] dout_r;
	
	reg ivalid_ff_0,ivalid_ff_1,ivalid_ff_2,ivalid_ff_3;
	
	//权重加载
	always@(posedge clk)
	begin
		if(!rstn)
			weight_addr<=8'd0;
		else begin
			if(weight_addr==8'd192)
				weight_addr<=weight_addr;
			else
				if(weight_en)
					weight_addr<=weight_addr+1;
				else
					weight_addr<=weight_addr;
			end
	end
	
	//加载权重矩阵 ->192个时钟周期
	always@(posedge clk)
	begin
		case(weight_addr)
			8'd0  : w[0]  <= weight;
			8'd1  : w[1]  <= weight;
			8'd2  : w[2]  <= weight;
			8'd3  : w[3]  <= weight;
			8'd4  : w[4]  <= weight;
			8'd5  : w[5]  <= weight;
			8'd6  : w[6]  <= weight;
			8'd7  : w[7]  <= weight;
			8'd8  : w[8]  <= weight;
			8'd9  : w[9]  <= weight;
			8'd10 : w[10] <= weight;
			8'd11 : w[11] <= weight;
			8'd12 : w[12] <= weight;
			8'd13 : w[13] <= weight;
			8'd14 : w[14] <= weight;
			8'd15 : w[15] <= weight;
			8'd16 : w[16] <= weight;
			8'd17 : w[17] <= weight;
			8'd18 : w[18] <= weight;
			8'd19 : w[19] <= weight;
			8'd20 : w[20] <= weight;
			8'd21 : w[21] <= weight;
			8'd22 : w[22] <= weight;
			8'd23 : w[23] <= weight;
			8'd24 : w[24] <= weight;
			8'd25 : w[25] <= weight;
			8'd26 : w[26] <= weight;
			8'd27 : w[27] <= weight;
			8'd28 : w[28] <= weight;
			8'd29 : w[29] <= weight;
			8'd30 : w[30] <= weight;
			8'd31 : w[31] <= weight;
			8'd32 : w[32] <= weight;
			8'd33 : w[33] <= weight;
			8'd34 : w[34] <= weight;
			8'd35 : w[35] <= weight;
			8'd36 : w[36] <= weight;
			8'd37 : w[37] <= weight;
			8'd38 : w[38] <= weight;
			8'd39 : w[39] <= weight;
			8'd40 : w[40] <= weight;
			8'd41 : w[41] <= weight;
			8'd42 : w[42] <= weight;
			8'd43 : w[43] <= weight;
			8'd44 : w[44] <= weight;
			8'd45 : w[45] <= weight;
			8'd46 : w[46] <= weight;
			8'd47 : w[47] <= weight;
			8'd48 : w[48] <= weight;
			8'd49 : w[49] <= weight;
			8'd50 : w[50] <= weight;
			8'd51 : w[51] <= weight;
			8'd52 : w[52] <= weight;
			8'd53 : w[53] <= weight;
			8'd54 : w[54] <= weight;
			8'd55 : w[55] <= weight;
			8'd56 : w[56] <= weight;
			8'd57 : w[57] <= weight;
			8'd58 : w[58] <= weight;
			8'd59 : w[59] <= weight;
			8'd60 : w[60] <= weight;
			8'd61 : w[61] <= weight;
			8'd62 : w[62] <= weight;
			8'd63 : w[63] <= weight;
			8'd64 : w[64] <= weight;
			8'd65 : w[65] <= weight;
			8'd66 : w[66] <= weight;
			8'd67 : w[67] <= weight;
			8'd68 : w[68] <= weight;
			8'd69 : w[69] <= weight;
			8'd70 : w[70] <= weight;
			8'd71 : w[71] <= weight;
			8'd72 : w[72] <= weight;
			8'd73 : w[73] <= weight;
			8'd74 : w[74] <= weight;
			8'd75 : w[75] <= weight;
			8'd76 : w[76] <= weight;
			8'd77 : w[77] <= weight;
			8'd78 : w[78] <= weight;
			8'd79 : w[79] <= weight;
			8'd80 : w[80] <= weight;
			8'd81 : w[81] <= weight;
			8'd82 : w[82] <= weight;
			8'd83 : w[83] <= weight;
			8'd84 : w[84] <= weight;
			8'd85 : w[85] <= weight;
			8'd86 : w[86] <= weight;
			8'd87 : w[87] <= weight;
			8'd88 : w[88] <= weight;
			8'd89 : w[89] <= weight;
			8'd90 : w[90] <= weight;
			8'd91 : w[91] <= weight;
			8'd92 : w[92] <= weight;
			8'd93 : w[93] <= weight;
			8'd94 : w[94] <= weight;
			8'd95 : w[95] <= weight;
			8'd96 : w[96] <= weight;
			8'd97 : w[97] <= weight;
			8'd98 : w[98] <= weight;
			8'd99 : w[99] <= weight;
			8'd100: w[100] <= weight;
			8'd101: w[101] <= weight;
			8'd102: w[102] <= weight;
			8'd103: w[103] <= weight;
			8'd104: w[104] <= weight;
			8'd105: w[105] <= weight;
			8'd106: w[106] <= weight;
			8'd107: w[107] <= weight;
			8'd108: w[108] <= weight;
			8'd109: w[109] <= weight;
			8'd110: w[110] <= weight;
			8'd111: w[111] <= weight;
			8'd112: w[112] <= weight;
			8'd113: w[113] <= weight;
			8'd114: w[114] <= weight;
			8'd115: w[115] <= weight;
			8'd116: w[116] <= weight;
			8'd117: w[117] <= weight;
			8'd118: w[118] <= weight;
			8'd119: w[119] <= weight;
			8'd120: w[120] <= weight;
			8'd121: w[121] <= weight;
			8'd122: w[122] <= weight;
			8'd123: w[123] <= weight;
			8'd124: w[124] <= weight;
			8'd125: w[125] <= weight;
			8'd126: w[126] <= weight;
			8'd127: w[127] <= weight;
			8'd128: w[128] <= weight;
			8'd129: w[129] <= weight;
			8'd130: w[130] <= weight;
			8'd131: w[131] <= weight;
			8'd132: w[132] <= weight;
			8'd133: w[133] <= weight;
			8'd134: w[134] <= weight;
			8'd135: w[135] <= weight;
			8'd136: w[136] <= weight;
			8'd137: w[137] <= weight;
			8'd138: w[138] <= weight;
			8'd139: w[139] <= weight;
			8'd140: w[140] <= weight;
			8'd141: w[141] <= weight;
			8'd142: w[142] <= weight;
			8'd143: w[143] <= weight;
			8'd144: w[144] <= weight;
			8'd145: w[145] <= weight;
			8'd146: w[146] <= weight;
			8'd147: w[147] <= weight;
			8'd148: w[148] <= weight;
			8'd149: w[149] <= weight;
			8'd150: w[150] <= weight;
			8'd151: w[151] <= weight;
			8'd152: w[152] <= weight;
			8'd153: w[153] <= weight;
			8'd154: w[154] <= weight;
			8'd155: w[155] <= weight;
			8'd156: w[156] <= weight;
			8'd157: w[157] <= weight;
			8'd158: w[158] <= weight;
			8'd159: w[159] <= weight;
			8'd160: w[160] <= weight;
			8'd161: w[161] <= weight;
			8'd162: w[162] <= weight;
			8'd163: w[163] <= weight;
			8'd164: w[164] <= weight;
			8'd165: w[165] <= weight;
			8'd166: w[166] <= weight;
			8'd167: w[167] <= weight;
			8'd168: w[168] <= weight;
			8'd169: w[169] <= weight;
			8'd170: w[170] <= weight;
			8'd171: w[171] <= weight;
			8'd172: w[172] <= weight;
			8'd173: w[173] <= weight;
			8'd174: w[174] <= weight;
			8'd175: w[175] <= weight;
			8'd176: w[176] <= weight;
			8'd177: w[177] <= weight;
			8'd178: w[178] <= weight;
			8'd179: w[179] <= weight;
			8'd180: w[180] <= weight;
			8'd181: w[181] <= weight;
			8'd182: w[182] <= weight;
			8'd183: w[183] <= weight;
			8'd184: w[184] <= weight;
			8'd185: w[185] <= weight;
			8'd186: w[186] <= weight;
			8'd187: w[187] <= weight;
			8'd188: w[188] <= weight;
			8'd189: w[189] <= weight;
			8'd190: w[190] <= weight;
			8'd191: w[191] <= weight;
			default:;
		endcase
	end
	//流水线计算
	//第12次卷积循环和第13次卷积循环判断
	always@(posedge clk or negedge rstn)
	begin
	if(!rstn)
	begin
		state<=0;
		cnt_wrcn<=2'd0;
	end
	else
		if(wren)
		begin
			state<=state+1; //0\1之间循环
			cnt_wren<=cnt_wren+1;
		end
		else if(cnt_wren==2'd2)
		begin
			cnt_wren<=2'd0;
		end
	end
	
	//FSM状态转移,每来一次并行输入,状态转移1次
	always@(posedge clk)
	begin
		if(!rstn)
		cnt<=0;
		else
			if(!valid_ff_0)
				cnt<=cnt+1;
			else
				cnt<=cnt;
	end
	
	//输入与权重相乘
	//第1级流水线
	always@(posedge clk)
	begin
	4'd0:begin
		if(!state)//0-96
			begin
				p0<=w[0]*din_0;
				p1<=w[16]*din_1;
				p2<=w[32]*din_2;
				p3<=w[48]*din_3;
				p4<=w[64]*din_4;
				p5<=w[80]*din_5;
			end
		else
			begin
				p0<=w[96]*din_0；
				p1<=w[112]*din_1;
				p2<=w[128]*din_2;
				p3<=w[144]*din_3；
				p4<=w[160]*din_4;
				p5<=w[176]*din_5;
			end
	end
	4'd1:begin
		if(!state)
			begin
				p0<=w[1]*din_0;
				p1<=w[17]*din_1;
				p2<=w[33]*din_2;
				p3<=w[49]*din_3；
				p4<=w[65]*din_4;
				p5<=w[81]*din_5;
			end
		else
			begin
				p0<=w[97]*din_0;
				p1<=w[113]*din_1;
				p2<=w[129]*din_2;
				p3<=w[145]*din_3;
				p4<=w[161]*din_4;
				p5<=w[177]*din_5;
			end
		end
	4'd2:begin
		if(!state)
			begin
				p0<=w[2]*din_0;
				p1<=w[18]*din_1;
				p2<=w[34]*din_2;
				p3<=w[50]*din_3；
				p4<=w[66]*din_4;
				p5<=w[82]*din_5;
			end
		else
			begin
				p0<=w[98]*din_0;
				p1<=w[114]*din_1;
				p2<=w[130]*din_2;
				p3<=w[146]*din_3;
				p4<=w[162]*din_4;
				p5<=w[178]*din_5;
			end
		end
	4'd3:begin
		if(!state)
			begin
				p0<=w[3]*din_0;
				p1<=w[19]*din_1;
				p2<=w[35]*din_2;
				p3<=w[51]*din_3；
				p4<=w[67]*din_4;
				p5<=w[83]*din_5;
			end
		else
			begin
				p0<=w[99]*din_0;
				p1<=w[115]*din_1;
				p2<=w[131]*din_2;
				p3<=w[147]*din_3;
				p4<=w[163]*din_4;
				p5<=w[179]*din_5;
			end
		end
	4'd4:begin
		if(!state)
			begin
				p0<=w[4]*din_0;
				p1<=w[20]*din_1;
				p2<=w[36]*din_2;
				p3<=w[52]*din_3；
				p4<=w[68]*din_4;
				p5<=w[84]*din_5;
			end
		else
			begin
				p0<=w[100]*din_0;
				p1<=w[116]*din_1;
				p2<=w[132]*din_2;
				p3<=w[148]*din_3;
				p4<=w[164]*din_4;
				p5<=w[180]*din_5;
			end
		end
	4'd5:begin
		if(!state)
			begin
				p0<=w[5]*din_0;
				p1<=w[21]*din_1;
				p2<=w[37]*din_2;
				p3<=w[53]*din_3;
				p4<=w[69]*din_4;
				p5<=w[85]*din_5;
			end
		else
			begin
				p0<=w[101]*din_0;
				p1<=w[117]*din_1;
				p2<=w[133]*din_2;
				p3<=w[149]*din_3;
				p4<=w[165]*din_4;
				p5<=w[181]*din_5;
			end
		end
	4'd6:begin
		if(!state)
			begin
				p0<=w[6]*din_0;
				p1<=w[22]*din_1;
				p2<=w[38]*din_2;
				p3<=w[54]*din_3;
				p4<=w[70]*din_4;
				p5<=w[86]*din_5;
			end
		else
			begin
				p0<=w[102]*din_0;
				p1<=w[118]*din_1;
				p2<=w[134]*din_2;
				p3<=w[150]*din_3;
				p4<=w[166]*din_4;
				p5<=w[182]*din_5;
			end
		end
	4'd7:begin
		if(!state)
			begin
				p0<=w[7]*din_0;
				p1<=w[23]*din_1;
				p2<=w[39]*din_2;
				p3<=w[55]*din_3;
				p4<=w[71]*din_4;
				p5<=w[87]*din_5;
			end
		else
			begin
				p0<=w[103]*din_0;
				p1<=w[119]*din_1;
				p2<=w[135]*din_2;
				p3<=w[151]*din_3;
				p4<=w[167]*din_4;
				p5<=w[183]*din_5;
			end
		end
	4'd8:begin
		if(!state)
			begin
				p0<=w[8]*din_0;
				p1<=w[24]*din_1;
				p2<=w[40]*din_2;
				p3<=w[56]*din_3;
				p4<=w[72]*din_4;
				p5<=w[88]*din_5;
			end
		else
			begin
				p0<=w[104]*din_0;
				p1<=w[120]*din_1;
				p2<=w[136]*din_2;
				p3<=w[152]*din_3;
				p4<=w[168]*din_4;
				p5<=w[184]*din_5;
			end
		end
	4'd9:begin
		if(!state)
			begin
				p0<=w[9]*din_0;
				p1<=w[25]*din_1;
				p2<=w[41]*din_2;
				p3<=w[57]*din_3;
				p4<=w[73]*din_4;
				p5<=w[89]*din_5;
			end
		else
			begin
				p0<=w[105]*din_0;
				p1<=w[121]*din_1;
				p2<=w[137]*din_2;
				p3<=w[153]*din_3;
				p4<=w[169]*din_4;
				p5<=w[185]*din_5;
			end
		end
	4'd10:begin
		if(!state)
			begin
				p0<=w[10]*din_0;
				p1<=w[26]*din_1;
				p2<=w[42]*din_2;
				p3<=w[58]*din_3;
				p4<=w[74]*din_4;
				p5<=w[90]*din_5;
			end
		else
			begin
				p0<=w[106]*din_0;
				p1<=w[122]*din_1;
				p2<=w[138]*din_2;
				p3<=w[154]*din_3;
				p4<=w[170]*din_4;
				p5<=w[186]*din_5;
			end
		end
	4'd11:begin
		if(!state)
			begin
				p0<=w[11]*din_0;
				p1<=w[27]*din_1;
				p2<=w[43]*din_2;
				p3<=w[59]*din_3;
				p4<=w[75]*din_4;
				p5<=w[91]*din_5;
			end
		else
			begin
				p0<=w[107]*din_0;
				p1<=w[123]*din_1;
				p2<=w[139]*din_2;
				p3<=w[155]*din_3;
				p4<=w[171]*din_4;
				p5<=w[187]*din_5;
			end
		end
	4'd12:begin
		if(!state)
			begin
				p0<=w[12]*din_0;
				p1<=w[28]*din_1;
				p2<=w[44]*din_2;
				p3<=w[60]*din_3;
				p4<=w[76]*din_4;
				p5<=w[92]*din_5;
			end
		else
			begin
				p0<=w[108]*din_0;
				p1<=w[124]*din_1;
				p2<=w[140]*din_2;
				p3<=w[156]*din_3;
				p4<=w[172]*din_4;
				p5<=w[188]*din_5;
			end
		end
	4'd13:begin
		if(!state)
			begin
				p0<=w[13]*din_0;
				p1<=w[29]*din_1;
				p2<=w[45]*din_2;
				p3<=w[61]*din_3;
				p4<=w[77]*din_4;
				p5<=w[93]*din_5;
			end
		else
			begin
				p0<=w[109]*din_0;
				p1<=w[125]*din_1;
				p2<=w[141]*din_2;
				p3<=w[157]*din_3;
				p4<=w[173]*din_4;
				p5<=w[189]*din_5;
			end
		end
	4'd14:begin
		if(!state)
			begin
				p0<=w[14]*din_0;
				p1<=w[30]*din_1;
				p2<=w[46]*din_2;
				p3<=w[62]*din_3;
				p4<=w[78]*din_4;
				p5<=w[94]*din_5;
			end
		else
			begin
				p0<=w[110]*din_0;
				p1<=w[126]*din_1;
				p2<=w[142]*din_2;
				p3<=w[158]*din_3;
				p4<=w[174]*din_4;
				p5<=w[190]*din_5;
			end
		end
	4'd15:begin
		if(!state)
			begin
				p0<=w[15]*din_0;
				p1<=w[31]*din_1;
				p2<=w[47]*din_2;
				p3<=w[63]*din_3;
				p4<=w[79]*din_4;
				p5<=w[95]*din_5;
			end
		else
			begin
				p0<=w[111]*din_0;
				p1<=w[127]*din_1;
				p2<=w[143]*din_2;
				p3<=w[159]*din_3;
				p4<=w[175]*din_4;
				p5<=w[191]*din_5;
			end
		end
	default:begin
				p0<=0;
				p1<=0;
				p2<=0;
				p3<=0;
				p4<=0;
				p5<=0;
			end
	endcase
	end
	
	//第二级流水线
	always@(posedge clk)
	begin
		sum00<=p0+p1;
		sum01<=p2+p3;
		sum02<=p4+p5;
	end
	//第三级流水线
	always@(posedge clk)
	begin
		sum10<=sum00+sum01;
		sum11<=sum02;
	end
	//第四级流水线
	always@(posedge clk)
	begin
		sum<=sum10+sum11; //每次并行度为6的输入与权重相乘计算结果
	end
	
	//工作周期计算，计算最终结果
	//打拍采沿 延迟4拍
	always@(posedge clk)
	begin
		ivalid_ff_0<=ivalid;
		ivalid_ff_1<=ivalid_ff_0;
		ivalid_ff_2<=ivalid_ff_1;
		ivalid_ff_3<=ivalid_ff_2;
	end
	
	//sum交期对应输入晚3拍
	always@(posedge clk)
	begin
		if(ivalid_ff_2&&~ivalid_ff_1) //采样下降沿，此时有效sum生成
			sum_valid<=1;
		else
			if(sum_valid)
				cnt_sum<=cnt_sum_1;
			else
				cnt_sum<=cnt_sum;
		end
	end
	
	//输出使能 cnt_sum0-16表示一次卷积循环计算结束
	always@(posedge clk)
	begin
		if(cnt_sum == 5'd16-1)
			wren<=1;
		else
			wren<=0;
	end
	
	//最终值计算
	always@(posedge clk)
	begin
		if(!rstn)
			dout_r<=0;
		else if(cnt_wren == 2'd2)
			dout_r<=0;
		else if(ivalid_ff_3)
			dout_r<=dout_r+sum;
		else
			dout_r<=dout_r;
	end	
	
	assign dout=dout_r;
	assign ovalid=(cnt_wren == 2'd2)?1:0;
endmodule
``` 
TestBench:
```Verilog
module fc_tb():
	reg clk;
	reg rstn;
	reg ivalid;
	reg signed [7:0] din_0;
	reg signed [7:0] din_1;
	reg signed [7:0] din_2;
	reg signed [7:0] din_3;
	reg signed [7:0] din_4;
	reg signed [7:0] din_5'
	reg signed [7:0] weight;
	reg weight_en;
	
	//输出
	wire ovalid;
	wire signed [31:0] dout;
	
	reg [10:0] cnt_line;
	integer count_w,fp_i; //文件指针
	
	integer i_fc; //循环计数变量
	
	reg signed [31:0] fc_result_tb; //用于缓存全连接计算结果
	reg [10:0] cnt_fc; //缓存的全连接模块计算结果计数
	
	//fully connected module
	fc u_fc(
		.clk(clk),
		.rstn(rstn),
		.ivalid(valid),
		.din_0(din_0),
		.din_1(din_1),
		.din_2(din_2),
		.din_3(din_3),
		.din_4(din_4),
		.din_5(din_5),
		.weight(weight),
		.weight_en(weight_en),
		.ovalid(ovalid),
		.dout(dout)
	);
	
	//初始信号赋给-tuilconnect module
	initial
	begin
		clk = 0;
		rstn = 0;
		cnt_line = 0;
		cnt_fc = 0;
		ivalid = 0;
		din_0=0;
		din_1=0;
		din_2=0;
		din_3=0;
		din_4=0;
		din_5=0;
		weight_en=0;
		weight=0;
		#20; //一段时间后填充权重数据，需要192个时钟周期,192x20
		rstn=1;
		weight_en=1;
		weight=1;
		
		#(192*20);
		//全连接模块的输入有效信号不能一直为1
		for(i_fc=0;i_fc<32;i_fc=i_fc+1)
		begin
			ivalid=1;
			#20;
			ivalid=0;
			#20;
		end
	end
	
	//读取图片
	initial
	begin
		fp_i = $fopen(...)
	end
	
	//读取图象数据 192/6*20=640ns
	always@(posedge clk)
	begin
		if(!valid ==1)
		begin
			count_w <=$fscanf(fp_i,"%b",din_0);
			count_w <=$fscanf(fp_i,"%b",din_1);
			count_w <=$fscanf(fp_i,"%b",din_2);
			count_w <=$fscanf(fp_i,"%b",din_3);
			count_w <=$fscanf(fp_i,"%b",din_4);
			count_w <=$fscanf(fp_i,"%b",din_5);
			
			if(cnt_line==9'd192)$display("picture read over")
		end
	end
	
	//时钟信号50MHz
	always #10 clk<=~clk;
	//=========全连接模块计算结果打印
	integer i;
	integer display_line=0;
	always@(posedge clk)//缓存有效的计算结果
	begin
		if(ovalid)
		begin
			$display("cnt_fc:%d",cnt_fc);
			fc_result_tb[cnt_fc]=dout;
			$display("fc_result_tb:%d",dout);
			cnt_fc=cnt_fc+1;
		end
	end
	
	initial
	begin
		#(20+192*20+32+40+5*20)
		$finish
	end
endmodule
```

### 顶层模块设计
例化卷积、池化、全连接模块,组成1个完整的LeNet-5



