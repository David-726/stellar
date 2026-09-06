---
title: "note1"
published: 2026-04-06
description: ""
tags: ["TI"]
draft: false
---
# **熟悉一下TI的环境**
## **串口打印重定向**
```c
int fputc(int ch, FILE *f)
{
    //发送一个字节
    DL_UART_Main_transmitData(UART_0_INST,ch);//UART_0_INST是系统生成的，若是自己改了名字，需要自行修改
    //等待发送完成
    while(DL_UART_Main_isBusy(UART_0_INST));
    return ch;
}
void delay(uint32_t ms)
{
    for(uint32_t i=0;i<ms;i++)
    {
        delay_cycles(80000);
        ///80MHz下的1ms
    }
}
int main(void)
{
    SYSCFG_DL_init();
    //开启中断
    NVIC_EnableIRQ(UART_0_IRQn);//开启接收中断
    printf("\r\n===========================\r\n");
    printf("天猛星 MspM0G3507\r\n");
    printf("System Clock:80MHz\r\n");
    printf("===========================\r\n");
    while(1)
    {
        printf("System Running\r\n");
    }
   }
```
## **小车控制**
### **方向控制**
```c
void move_forward(uint8_t dir)
{
   if(dir){
    DL_GPIO_setPins(GPIO_MOTOR_DIR_MOT1_DIR1_PORT, GPIO_MOTOR_DIR_MOT1_DIR1_PIN);
    DL_GPIO_clearPins(GPIO_MOTOR_DIR_MOT1_DIR2_PORT, GPIO_MOTOR_DIR_MOT1_DIR2_PIN);
    DL_GPIO_setPins(GPIO_MOTOR_DIR_MOT2_DIR1_PORT, GPIO_MOTOR_DIR_MOT2_DIR1_PIN);
    DL_GPIO_clearPins(GPIO_MOTOR_DIR_MOT2_DIR2_PORT, GPIO_MOTOR_DIR_MOT2_DIR2_PIN);
    DL_GPIO_setPins(GPIO_MOTOR_DIR_MOT3_DIR1_PORT, GPIO_MOTOR_DIR_MOT3_DIR1_PIN);
    DL_GPIO_clearPins(GPIO_MOTOR_DIR_MOT3_DIR2_PORT, GPIO_MOTOR_DIR_MOT3_DIR2_PIN);
    DL_GPIO_setPins(GPIO_MOTOR_DIR_MOT4_DIR1_PORT, GPIO_MOTOR_DIR_MOT4_DIR1_PIN);
    DL_GPIO_clearPins(GPIO_MOTOR_DIR_MOT4_DIR2_PORT, GPIO_MOTOR_DIR_MOT4_DIR2_PIN);
   }else
   {
    DL_GPIO_clearPins(GPIO_MOTOR_DIR_MOT1_DIR1_PORT, GPIO_MOTOR_DIR_MOT1_DIR1_PIN);
    DL_GPIO_setPins(GPIO_MOTOR_DIR_MOT1_DIR2_PORT, GPIO_MOTOR_DIR_MOT1_DIR2_PIN);
    DL_GPIO_clearPins(GPIO_MOTOR_DIR_MOT2_DIR1_PORT, GPIO_MOTOR_DIR_MOT2_DIR1_PIN);
    DL_GPIO_setPins(GPIO_MOTOR_DIR_MOT2_DIR2_PORT, GPIO_MOTOR_DIR_MOT2_DIR2_PIN);
    DL_GPIO_clearPins(GPIO_MOTOR_DIR_MOT3_DIR1_PORT, GPIO_MOTOR_DIR_MOT3_DIR1_PIN);
    DL_GPIO_setPins(GPIO_MOTOR_DIR_MOT3_DIR2_PORT, GPIO_MOTOR_DIR_MOT3_DIR2_PIN);
    DL_GPIO_clearPins(GPIO_MOTOR_DIR_MOT4_DIR1_PORT, GPIO_MOTOR_DIR_MOT4_DIR1_PIN);
    DL_GPIO_setPins(GPIO_MOTOR_DIR_MOT4_DIR2_PORT, GPIO_MOTOR_DIR_MOT4_DIR2_PIN);
   }
}
```
### **速度控制**
```c
void set_speed(int8_t motor1,int8_t motor2, int8_t motor3, int8_t motor4)
//映射逻辑:将-100到100映射到pwm的0-8000
{
    uint32_t pwm_val[4];
    int8_t speeds[4]={motor1,motor2,motor3,motor4};
    for(uint8_t i=0;i<4;i++)
    {
        if(speeds[i]>=0)
        {
            //正转逻辑DIR1=1,DIR2=0
            //这里只写出Motor1的代码
            if(i==0)
            {
                DL_GPIO_setPins(GPIO_MOTOR_DIR_MOT1_DIR1_PORT, GPIO_MOTOR_DIR_MOT1_DIR1_PIN);
                DL_GPIO_clearPins(GPIO_MOTOR_DIR_MOT1_DIR2_PORT, GPIO_MOTOR_DIR_MOT1_DIR2_PIN);
            }
            pwm_val[i]=speeds[i]*8000/100;
        }else
        {
                DL_GPIO_setPins(GPIO_MOTOR_DIR_MOT1_DIR2_PORT, GPIO_MOTOR_DIR_MOT1_DIR2_PIN);
                DL_GPIO_clearPins(GPIO_MOTOR_DIR_MOT1_DIR1_PORT, GPIO_MOTOR_DIR_MOT1_DIR1_PIN);
        }
    }
    DL_Timer_setCaptureCompareValue(PWM_MOT1_INST,pwm_val[0],DL_YIMER_CC_0_INDEX);
    DL_Timer_setCaptureCompareValue(PWM_MOT2_INST,pwm_val[1],DL_YIMER_CC_0_INDEX);
    DL_Timer_setCaptureCompareValue(PWM_MOT3_INST,pwm_val[2],DL_YIMER_CC_0_INDEX);
    DL_Timer_setCaptureCompareValue(PWM_MOT4_INST,pwm_val[3],DL_YIMER_CC_0_INDEX);
}
```


