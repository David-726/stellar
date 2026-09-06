---
title: "lanqiao_notes"
published: 2026-03-28
description: ""
tags: ["蓝桥杯"]
draft: false
---
# **lanqiao_notes**

### Notice
- **pa15 pb4的输入应该通过TIM_IC进行捕获 注意初始化时候HAL_TIM_IC_Start_IT(*htim)
- **注意每一次cnt 以及 tick的复位
- **注意按键处理逻辑的错误写法
- **注意这里的这个%*[0-9]%d是跳过非数字的字符%d是读取数字 注意这里的*[^] ssancf%*[^0-9]跳过所有非数字
## led
```c
void Led_Disp()
{
    uint16_t led_ctrl=0xFFFF;
    //ld(i)闪亮或是熄灭
    if(1)led_ctrl&=~(1<<i);
    GPIOC->ODR=(GPIOC->ODR&0x00FF)|(led_ctrl<<8);
    //GPIOC-ODR高8位控制led故清零
    HAL_GPIO_WritePin(GPIOD,GPIO_PIN_2,GPIO_PIN_SET);
    HAL_GPIO_WritePin(GPIOD,GPIO_PIN_3,GPIO_PIN_RESET);
    //通过pd2高低电平表示公用引脚在led闪烁时不对lcd有影响
}
```
## eeprom
```c
#include "i2c.h"
//软件i2C
void EEPROM_Write(uint8_t addr,uint8_t data)
{
    I2C_Start();
    I2C_SendByte(0xA0);//写地址
    I2C_WaitAck();
    I2C_SendByte(addr);
    I2C_WaitAck();
    I2C_SendByte(data);
    I2C_WaitAck();
    I2C_Stop();
    HAL_Delay(10);
}
void EEPROM_Read(uint8_t addr)
{
    uint8_t data;
    I2C_Start();
    I2C_SendByte(0xA0);//写地址 假写
    I2C_WaitAck();
    I2C_SendByte(addr);
    I2C_WaitAck(5);

    I2C_Start();
    I2C_SendByte(0xA1);// 读地址
    I2C_WaitAck();
    data=I2C_ReceiveByte();
    I2C_SendNoAck();
    I2C_Stop();

    HAL_Delay(5);
}
```
## pwm动态输出 pa6/pa7
```c
void Set_PWM_Val(TIM_HandleTypeDef *htim,uint32_t Channel,uint16_t freq,uint16_t duty)
{
    if(freq==0)return;
    uint16_t arr_val=1000000/freq-1;
    uint16_t crr_val=arr_val*duty/100;
    __HAL_TIM_SET_AUTORELOAD(htim,arr_val);
    __HAL_TIM_SET_COMPARE(htim,Channel,crr_val);
    if(duty==0)__HAL_TIM_SET_COMPARE(htim,Channel,0);
}
``` 
## ADC转换 R37/R38
```c
void Get_R37()
{
    if(HAL_ADC_PollForConversion(&hadc1,HAL_MAX_DELAY)==HAL_OK){
    uint16_t sum=0;
    for(int i=0;i<10;i++)
    {
        HAL_ADC_Start(&hadc1);
        sum+=HAL_ADC_GetValue(&hadc1);
    }
    }
    uint16_t val_R37=sum/10;
   }
```
## 读取Ne555Val pa15
```c
uint8_t ic_flag=0;
uint16_t ic_val1=0;
uint8_t ic_val2=0;
uint8_t ic_diff=0;
void HAL_TIM_IC_CaptureCallback(TIM_HandleTypeDef *htim)
{
   if(htim==&htim2&&htim->Channel==TIM_CHANNEL_1)
   {
    if(ic_flag==0)
    {
        ic_val1=HAL_TIM_ReadCapture(htim,TIM_CHANNEL_1);
        ic_flag=1;
    }else
    {
        ic_val2=HAL_TIM_ReadCapture(htim,TIM_CHANNEL_1);
        ic_flag=0;
    }
    if(ic_val2>ic_val1)ic_diff=ic_val2-ic_val1;
    else ic_diff=0xFFFFFFFF-ic_val2+ic_val1;
    if(ic_diff!=0)return 1000000/ic_diff;

   }
}
```
## RTC 
```c
void Get_RTC()
{
    RTC_TimeTypeDef sTime;
    RTC_DateTypeDef sDate;
    HAL_RTC_GetTime(&rtcrtc, &sTime, RTC_FORMAT_BIN);
    HAL_RTC_GetDate(&rtcrtc, &sDate, RTC_FORMAT_BIN);
    //GetTime和GetDate必须同时调用，否则会报错
    char str;
    sprintf(str,"%02d:%02d:%02d",sTime.Hours,sTime.Minutes,sTime.Seconds);
   }
```
## 按键逻辑处理 
>在一个普通定时器中进行定时处理 例如这里的TIM6中
```c
typedef struct key
{
    uint8_t age;
    uint8_t pressed;
    uint8_t long_pressed;
    uint16_t tick;
}key;
key key[4]={0};
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
    if(htim->Instance==TIM6)
    {
        uint16_t sta[4];
        sta[0]=HAL_GPIO_ReadPin(GPIOB,GPIO_PIN_0);
        sta[1]=HAL_GPIO_ReadPin(GPIOB,GPIO_PIN_1);
        sta[2]=HAL_GPIO_ReadPin(GPIOB,GPIO_PIN_2);
        sta[3]=HAL_GPIO_ReadPin(GPIOA,GPIO_PIN_0);
        for(int i=0;i<4;i++)
        {
            switch(keys[i].age)
            {
                case 0:
                if(sta[i]==GPIO_PIN_RESET)
                {
                    keys[i].age=1;
                }
                break;
                case 1:
                if(sta[i]==GPIO_PIN_RESET)
                {
                    keys[i].age=2;
                    keys[i].tick++;
                    if(keys[i].tick>=200)
                    {
                        keys[i].age=3;
                    }else
                    {
                        keys[i].tick=0;
                        keys[i].age=0;
                    }
                }
                break;
                case 2:
                if(sta[i]==GPIO_PIN_RESET)
                {
                    if(keys[i].tick>=800)
                    {
                        keys[i].long_pressed=1;
                        keys[i].age=3;
                    }else
                    {
                        keys[i].pressed=1;
                        keys[i].tick=0;
                    }
                }
                break;
                case 3:
                if(sta[i]==GPIO_PIN_SET)
                {
                    keys[i].tick=0;
                    keys[i].age=0;
                }
                break;
                default:
                break;
            }
        }
    }
}
```
## Uart处理 IDLE+DMA
```c
** 一般写在uart的中断函数中 **
if(HAL_UART_GET_FLAG(&huart1, UART_FLAG_IDLE)==HAL_UART_FLAG_SET)
{
    HAL_UART_ClearFlag(&huart1, UART_FLAG_IDLE);
    HAL_UART_DMAStop(&huart1);
    UART_Process();
    HAL_UART_Receive_DMA(&huart1,rx_buf,sizeof(rx_buf));
}

void UART_Process()
{
    //例如接收到"SET:%d:%d:%d"来改变RTC时钟
    int hour,minute,second;
    if(strncmp(rx_buf,"SET:",4)==0)
    {
        sscanf(rx_buf+4,"%d:%d:%d",&hour,&minute,&second);
        sTime.Hours=hour;
        sTime.Minutes=minute;
        sTime.Seconds=second;
        HAL_Get_RTC();
        HAL_RTC_SetTime(&rtcrtc, &sTime, RTC_FORMAT_BIN);
        HAL_UART_Transmit(&huart1,"its OK\r\n",10,HAL_MAX_DELAY);
    }
   }
>对于跳过一般字符直接读数字的
char buf[] = "Temp: 125 C, Humidity: 45 %, Pressure: 1013 hPa";
int temp = 0, hum = 0, press = 0;
// 连环组合拳：跳过非数字 + 读数字 + 跳过非数字 + 读数字...
int count = sscanf(buf, "%*[^0-9]%d%*[^0-9]%d%*[^0-9]%d", &temp, &hum, &press);
// 此时：
// temp = 125
// hum = 45
// press = 1013
// count = 3 (表示成功提取了3个数)
```

```c
void EEPROM_Write(uint8_t addr,uint8_t data)
{
	I2C_Start();
	I2C_SendByte(0xA0);
	I2C_WaitAck();
	I2C_SendByte(addr);
	I2C_WaitAck();
	I2C_SendByte(data)；
	I2C_WaitAck();
	I2C_Stop();
	Delay(5);
}
void EEPROM_Read(uint8_t addr)
{
	I2C_Start();
	I2C_SendByte(0xA0);
	I2C_WaitAck();
	I2C_SendByte(addr);
	I2C_WaitAck();
	
	I2C_SendByte(0xA1);
	I2C_WaitAck();
	uint8_t data=I2C_Readdata();
	I2C_SendNoAck();
	I2C_Stop();
	Delay(5);
}