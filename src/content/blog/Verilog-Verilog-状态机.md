---
title: "Verilog 状态机"
published: 2026-08-19
description: ""
tags: ["Verilog"]
draft: false
---
# Verilog 状态机
## 状态机类型
状态机？
有限个状态以及在这些状态之间的转移和动作等行为的数学模型。
### Moore 型状态机
输出只与当前状态有关，与当前输入无关
输入对输出的影响要在下一个时钟周期才能反映出来，输出在一个完整的时钟周期内保持稳定，即使此时输入变化，输出也不会变化。
**输入与输出是隔离开的**
<img src="/posts/assets/1q824d-Pasted-image-20260819105200.png" alt="Pasted image 20260819105200.png" loading="lazy" />
### Melay 状态机
输出不仅与当前状态有关，还和当前的输入信号有关
状态机的输出是在输入信号变化后立刻发生变化，且输入变化可能出现在任何时刻的时钟周期内。
`Mealy`状态机比`Moore`状态机早一个时钟周期
<img src="/posts/assets/1s0j8p1-Pasted-image-20260819105403.png" alt="Pasted image 20260819105403.png" loading="lazy" />根据设计需求画出状态转移图，确定使用状态机类型，并标注出各种输入输出信号，更有助于编程
一般的使用最多的就是:Mealy型3段式状态机
#### 自动贩卖机
<img src="/posts/assets/ugqa2i-Pasted-image-20260819105602.png" alt="Pasted image 20260819105602.png" loading="lazy" />设计流程:
- 根据状态机的个数确定状态机编码，利用编码给状态寄存器赋值，代码可读性更好
- 第一段:时序逻辑，非阻塞赋值，传递寄存器的状态
- 第二段:组合逻辑，阻塞赋值，根据当前状态和当前输入，确定下一个状态机的状态
- 第三段:时序逻辑，非阻塞赋值，因为是Melay状态机，根据当前状态和输入，确定输出信号
```Verilog
module vending_machine_p3(
	input clk,
	input rstn,
	input [1:0] coin,
	
	output [1:0] change,
	output sell
	);
	parameter IDLE = 3'd0;
	parameter GET05 = 3'd1;
	parameter GET10 = 3'd2;
	parameter GET15 = 3'd3;
	
	reg [2:0] st_next;
	reg [2:0] st_cur;
	
	always @(posedge clk or negedge rstn) begin
		if(!rstn) begin
			st_cur <= 'b0;
		end
		else begin
			st_cur <= st_next;
		end
	end
	
	always @(*) begin
		case(st_cur)
			IDLE:
				case(coin)
					2'b01: st_next = GET05;
					2'b10: st_next = GET10;
					default: st_next = IDLE;
				endcase
			GET05:
				case(coin)
					2'b01: st_next = GET10;
					2'b10: st_next = GET15;
					default: st_next = GET05;
				endcase
			GET10:
				case(coin)
					2'b01: st_next = GET15;
					2'b10: st_next = IDLE;
					default: st_next = GET10;
				endcase
			GET15:
				case(coin)
					2'b01,2'b10:
						st_next = IDLE;
					default: st_next = GET15;
				endcase
			default: st_next = IDLE;
		endcase
	end
	
	reg [1:0] change_r;
	reg sell_r;
	always @(posedge clk or negedge rstn)begin
		if(!rstn) begin
			change_r <=2'b0;
			sell_r <= 1'b0;
		end
		else if ((st_cur == GET15 && coin ==2'h1)
				||(st_cur == GET10 && coin == 2'd2))begin
			change_r <= 2'b1;
			sell_r <= 1'b1;
		end
		else begin
			change_r <= 2'b0;
			sell_r <= 1'b0;
		end
	end
	assign sell = sell_r;
	assign change = change_r;
endmodule
```
### 状态机修改：2段式
2、3段合并
```Verilog
reg [1:0] change_r;
reg sell_r;
always @(*) begin
	case(st_cur)
		IDLE:begin
			change_r = 2'b0;
			sel_r = 1'b0;
			case(coin)
				2'b01: st_next = GET05;
				2'b10: st_next = GET10;
				default : st_next = IDLE;
			endcase
		end
		GET05:begin
		change_r = 2'b0;
		sell_r = 1'b0;
			case(coin)
				2'b01: st_next = GET10;
				2'b10: st_next = GET15;
				default: st_next = GET05;
			endcase
		end
		 GET10:  
            case (coin)  
                2'b01:     begin  
                    st_next      = GET15 ;  
                    change_r     = 2'b0 ;  
                    sell_r       = 1'b0 ;  
                end  
                2'b10:     begin  
                    st_next      = IDLE ;  
                    change_r     = 2'b0 ;  
                    sell_r       = 1'b1 ;  
                end  
                default:   begin  
                    st_next      = GET10 ;  
                    change_r     = 2'b0 ;  
                    sell_r       = 1'b0 ;  
                end  
            endcase // case (coin)  
  
        GET15:  
            case (coin)  
                2'b01: begin  
                    st_next     = IDLE ;  
                    change_r    = 2'b0 ;  
                    sell_r      = 1'b1 ;  
                end  
                2'b10:     begin  
                    st_next     = IDLE ;  
                    change_r    = 2'b1 ;  
                    sell_r      = 1'b1 ;  
                end  
                default:   begin  
                    st_next     = GET15 ;  
                    change_r    = 2'b0 ;  
                    sell_r      = 1'b0 ;  
                end  
            endcase  
        default:  begin  
            st_next     = IDLE ;  
            change_r    = 2'b0 ;  
            sell_r      = 1'b0 ;  
        end
    endcase
end
```
### 1段式
```Verilog
    reg  [1:0]   change_r ;
    reg          sell_r ;
    always @(posedge clk or negedge rstn) begin
        if (!rstn) begin
            st_cur     <= 'b0 ;
            change_r   <= 2'b0 ;
            sell_r     <= 1'b0 ;
        end
        else begin
            case(st_cur)

            IDLE: begin
                change_r  <= 2'b0 ;
                sell_r    <= 1'b0 ;
                case (coin)
                    2'b01:     st_cur <= GET05 ;
                    2'b10:     st_cur <= GET10 ;
                endcase
            end
            GET05: begin
                case (coin)
                    2'b01:     st_cur <= GET10 ;
                    2'b10:     st_cur <= GET15 ;
                endcase
            end

            GET10:
                case (coin)
                    2'b01:     st_cur   <=  GET15 ;
                    2'b10:     begin
                        st_cur   <= IDLE ;
                        sell_r   <= 1'b1 ;
                    end
                endcase

            GET15:
                case (coin)
                    2'b01:     begin
                        st_cur   <= IDLE ;
                        sell_r   <= 1'b1 ;
                    end
                    2'b10:     begin
                        st_cur   <= IDLE ;
                        change_r <= 2'b1 ;
                        sell_r   <= 1'b1 ;
                    end
                endcase

            default:  begin
                  st_cur    <= IDLE ;
            end

            endcase // case (st_cur)
        end // else: !if(!rstn)
    end
```
### 状态机修改:Morre型
```Verilog
module vending_machine_moore(
	input clk,
	input rstn,
	input [1:0] coin,
	
	output [1:0] change,
	output sell
	);
	
	parameter IDLE = 3'd0;
	parameter GET05 = 3'd1;
	parameter GET10 = 3'd2;
	parameter GET15 = 3'd3;
	parameter GET20 = 3'd4;
	parameter GET25 = 3'd5;
	
	reg [2:0] st_next;
	reg [2:0] st_cur;
	
	always @(posedge clk or negedge rstn)begin
		if(!rstn) begin
			st_cur<='b0;
		end
		else begin
			st_cur <= st_next;
		end
	end
	always @(*) begin //all case items need to be displayed completely  
        case(st_cur)  
            IDLE:  
                case (coin)  
                    2'b01:     st_next = GET05 ;  
                    2'b10:     st_next = GET10 ;  
                    default:   st_next = IDLE ;  
                endcase  
            GET05:  
                case (coin)  
                    2'b01:     st_next = GET10 ;  
                    2'b10:     st_next = GET15 ;  
                    default:   st_next = GET05 ;  
                endcase  
  
            GET10:  
                case (coin)  
                    2'b01:     st_next = GET15 ;  
                    2'b10:     st_next = GET20 ;  
                    default:   st_next = GET10 ;  
                endcase  
            GET15:  
                case (coin)  
                    2'b01:     st_next = GET20 ;  
                    2'b10:     st_next = GET25 ;  
                    default:   st_next = GET15 ;  
                endcase  
            GET20:         st_next = IDLE ;  
            GET25:         st_next = IDLE ;  
            default:       st_next = IDLE ;  
        endcase // case (st_cur)  
    end // always @ (*)
	
	reg [1:0] change_r;
	reg sell_r;
	always @(posedge clk or negedge rstn)begin
		if(!rstn) begin
			change_r <= 2'b0;
			sell_r <= 1'b0;
		end
		else if(st_cur == GET20) begin
			sell_r <= 1'b1;
		end
		else if(st_cur == GET25) begin
			sell_r <= 1'b1;
			change_r <=2'b1;
		end
		else begin
			change_r <= 2'b0;
			sell_r <= 1'b0;
		end
	end
	assign sell = sell_r;
	assign change = change_r;

endmodule 
```
输出信号赋值时，用阻塞赋值，则可以提前1个周期
```Verilog

reg [1:0] change_r;
reg sell_r;
always @(*) begin
	change_r = 'b0;
	sell_r = 'b0;
	if(st_cur==GET20)begin
		sell_r = 1'b1;
	end
	else if(st_cur == GET25) begin
		chage_r = 2'b1;
		sell_r = 1'b1;
	end
end
```