---
title: "note_pid"
published: 2026-04-06
description: ""
tags: ["TI"]
draft: false
---
# 小车循迹逻辑
## 概述
8 路红外对管输出的是 0 或 1。如果直接用 if-else 写，代码会极其臃肿且难以调试。我们要把这 8 位数据转换成一个连续的偏差值 (Error)。
**I2C传回的是一个8bit的数据**

| 传感器位置 | 左4 | 左3 | 左2 |
| --- | --- | --- | --- |
| 0 | -4 | -3 | -2 |
简单的伪代码逻辑实现：
```c
float Get_Line_Error(uint8_t sensor_raw) {
    float total_error = 0;
    int hit_count = 0;

    // 循环扫描 8 位数据 (假设 1 代表检测到黑线)
    for (int i = 0; i < 8; i++) {
        if (sensor_raw & (1 << i)) {
            // 这里根据位偏移计算权重：0->4, 1->3... 7->-4
            // 简单处理：直接查表或 switch 
            total_error += Weight_Table[i]; 
            hit_count++;
        }
    }

    // 如果没线，返回上一次的误差（记忆功能）
    if (hit_count == 0) return Last_Error;

    // 关键：取平均偏差值，这样即使两路同时踩线，偏差也是平滑的
    return total_error / hit_count;
}
```
## 双环控制架构 (串级预备)
构建一个巡线速度双环PID
Drawing 2026-04-06 10.08.25.excalidraw
```c
typedef struct{
float Kp,Ki,Kd;
float target;
float current_error;
float last_error;
float intergral;
float output_limit;
}PID_Controller;
PID_Controller Line_PID;
PID_Controller Left_Motor_PID;
PID_Controller Right_Motor_PID;
void Cascade_Control_Loop(float line_error,float left_speed,float right_speed)
{
	float diff_compensation=PID_Compute(&Line_PID,line_error);
	float left_target=BASE_SPEED+diff_compensation;
	float right_target=BASE_SPEED-diff_compensation;
	//内环计算
	float left_pwm=PID_Compute_Speed(&Left_Motor_PID,left_target,left_speed);
	float right_pwm=PID_Compute_Speed(&RIght_Motor_PID,right_target,right_speed);
	Motor_Set_Output(left_pwm,right_pwm);
}
```
### 🚀 避坑与优化点

1. **权重表的精细化**： 在你图中的 `Weight_Table` 里，如果 8 路传感器间隔很密，可以尝试非线性权重（例如：`{-10, -5, -2, -1, 1, 2, 5, 10}`）。**越靠外的传感器权重越大**，这样当小车快要冲出赛道时，PID 的“拉力”会指数级增加。
    
2. **计算频率**：
    
    - **外环（巡线）**建议跑在 **20ms (50Hz)**。
        
    - **内环（速度）**建议跑在 **10ms (100Hz)** 甚至更快。
        
    - 在 FreeRTOS 中，你可以用两个不同优先级的 Task，或者在一个 10ms 任务里用计数器分频处理。
        
3. **丢线保护 (记忆功能)**： 正如你代码中写的 `return Last_Error`，这非常重要。但要更进一层：**如果丢线时间超过 500ms，说明彻底冲出去了，此时应立刻断电，防止小车原地“画龙”撞坏。**
### 位置式PID的实现 ###
```c
/**
 * @brief  位置式 PID 计算实现
 * @param  pid: 控制器结构体指针
 * @param  current_error: 当前传感器的偏差 (例如: -4.0 ~ 4.0)
 * @return float: 计算出的控制输出 (用于叠加到 PWM)
 */
float PID_Compute(PID_Controller *pid, float current_error) {
	pid->current_error=current_error;
	//比例项：解决当前误差
	float p_out= PID_Controller->Kp*PID_Controller->current_error;
	//积分项：解决静态误差：
	PID_Controller->integral+=PID_Controller->current_error;
	//积分限幅：
	if(PID_Controller->integral>PID_Controller->max_integral)PID_Controller->integral=PID_Controller->max_integral;
	else if(PID_Controller->integral>PID_Controller->max_integral)PID_Controller->integral=PID_Controller->max_integral;
	float i_out=PID_Controller->Ki*PID_Controller->integral;
	//微分先行：
	float d_out=PID_Controller->Kd*(PID_Controller->current_eroor-PID_Controller->last_error);
	//总输出：
	float total_out=p_out+i_out+d_out;
	//输出限幅：
	if(total_output>PID_Controller->output_limit)total_output=PID_Controller->outpt_limit;
	else if(total_output<-PID_Controller->output_limit)total_output=-PID_Controller->output_limit;
	PID_Controller->last_error=PID_Controller->current_error;
	return total_
}

```
Drawing 2026-04-06 10.42.37.excalidraw
