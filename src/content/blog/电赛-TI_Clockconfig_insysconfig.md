---
title: "TI_Clockconfig_insysconfig"
published: 2026-04-06
description: ""
tags: ["电赛"]
draft: false
---
# Mspm0G3507在sysconfig中配置的一些问题
## 时钟配置
为什么官方给的freeRTOS例程led_blink中时钟配置中的MCLK的source改不了
但是在nortos中的empty例程中就可以改呢
## 硬件I2C的configuration
- Add一组I2C
- Enable_controllerMode之后就可以在其下面的可选项中配置I2C的参数了
![alt text](/posts/assets/cqlr2p-image.png)
- 其他的高级配置暂时保持默认
 ### I2C8路灰度传感器的配置
 