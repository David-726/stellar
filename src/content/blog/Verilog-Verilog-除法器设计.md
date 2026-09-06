---
title: "Verilog 除法器设计"
published: 2026-08-14
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 除法器设计
<img src="/posts/assets/3eq-Pasted-image-20260820180149.png" alt="Pasted image 20260820180149.png" loading="lazy" />除法运算的过程:
- 被除数的高级位数据，位宽和除数相同(实例中是3bit数据)
- 被除数高位数据与除数作比较，若前者不小于后者，则可得到对应位的商为1，二者做差得到第一步的余数，肉则直接得到余数
- 上一步中的余数与被除数剩余最高位1bit数据拼接成新的数据，然后再和除数做比较，可以得到新的商和余数
- 重复上一步，直到最低位也参与运算
## 除法器设计
### 单步运算设计
单步除法运算时，单步被除数位宽需比除数位宽多1bit才不至于溢出，为了便于流水，输出端要有寄存器来存储原始的除数和被除数信息。
单步运算的结果就是得到新的i1bt商和余数
为了得到最后的除法结果，新的1bit商数据还需要和上一周期的商结果进行移位累加
```Verilog
// parameter M means the actual wifth of divissor
module divider_cell
	#(parameter N=5,
	  parameter M=3)
	  (
	  input clk,
	  input rstn,
	  input en,
	  
	  input [M:0] dividend,
	  input [M-1:0] divisor,
	  input [N-M:0] merchant_ci, //上一级输出的商
	  input [N-M-1:0] dividend_ci, //原始被除数
	  
	  output reg [N-M-1:0] dividend_kp, //原始的被除数信息
	  output reg [M-1:0] divisor_kp, //原始的除数信息
	  output reg rdy,
	  output reg [N-M:0] merchant, //运算单元输出商
	  output reg [M-1:0] remainder //运算单元输出余数
	  )；
	  
	  always @(posedge clk or negedge rstn) begin
		  if(!rstn) begin
			  rdy <= 'b0;
			  merchant <= 'b0;
			  remainder <= 'b0;
			  divisor_kp <= 'b0;
			  dividend_kp <= 'b0;
		  end
		  else if (en) begin
			  rdy <= 1'b1;
			  divisor_kp <= divisor;
			  dividend_kp <= dividend_ci;
			  if(dividend>={1'b0,divisor})begin
				  merchant <= (merchant_ci<<1)+1'b1;
				  remainder <= dividend - {1'b0,divisor};
			  end
			  else begin
				  merchant <= merchant_ci<<1;
				  remainder = dividend;
			  end
		  end
endmodule
```

### 流水线例化
将单步计算的余数和原始的被除数对应位的1bit数据重新拼接，作为新的单步被除数输入到下一级单步除法计算单元
其中，被除数、除数、及商的数据信息也要在下一级运算单元中传递
```Verilog
module divider_man
	#(parameter N=5,
	  parameter M=3,
	  parameter N_ACT = M_N-1)
	  (
	  input clk,
	  input rstn,
	  
	  input data_rdy,
	  input [N-1:0] dividend,
	  input [M-1:0] divisor,
	  
	  output res_rdy,
	  output [N_ACT-M:0] merchant,
	  output [M-1:0] remainder);
	  
	  wire [N_ACT-M-1:0] dividend_t [N_ACT-M:0];
	  wire [M-1:0] divisor_t [N_ACT-M:0];
	  wire [M-1:0] remainder_t [N_ACT-M:0];
	  wire [N_ACT-M:0] rdy_t;
	  wire [N_ACT-M:0] merchant_t [N_ACT-M:0];
	  
	  divider_cell #(.N(N_ACT),.M(M))
		  u_divider_step0
		(
		.clk (clk),
		.rstn (rstn),
		.en (data_rdy),
		
		.dividend ({{(M){1'b0}},dividend[N-1]})),
		.divisor (divisor),
		.merchant_ci ({(N_ACT-M+1){1'b0}}),
		.dividend_ci (dividend[N_ACT-M-1:]),
		
		.dividend_kp (dividend_t[N_ACT-M]),
		.divisor_kp (divisor_t[N_ACT-M]),
		.rdy (rdt_t[N_ACT-M]),
		.merchant (merchant_t[N_ACT-M]),
		.remainder (remainder_t[N_ACT-M])
		);
		genvar i;
		generate 
			for(i=1;i<=N_ACT-M;i=i+1)begin:sqrt_stepx
				divider_cell #(.N(N_ACT),.M(M))
					u_divider_step
					(.clk (clk),
					 .rstn (rstn)
					 .en (rdy[N_ACT-M-i+1]),
					 .dividend ({remainder_t[N_ACT-M-i+1],dividend_t[N_ACT_M-i+1][N_ACT_M-i]}),
					 .divisor (divisor_t[N_ACT-M-i+1]),
					 .merchant_ci (merchant_t[N_ACT-M-i+1]),
					 .dividend_ci (dividend_t[N_ACT-M-i+1]),
					 .divisor_kp (divisor_t[N-ACT-M-i]),
					 .dividend_kp (dividend_t[N_ACT-M-i]),
					 .rdy (rdy_t[N_ACT-M-i]),
					 .merchant (merchant[N_ACT-M-i]),
					 .remainder (remainder_t[N_ACT-M-i])
					 );
			end
		endgenerate
		
	assign res_rdy = rdy_t[0];
	assign meerchant = merchant_t[0];
	assign remainder = remainder_t[0];
endmodule
``` 