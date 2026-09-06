---
title: "天空星点亮Spi触摸屏"
published: 2026-04-10
description: ""
tags: []
draft: false
---
## 触摸芯片XPT2046
## 接线
## 推荐的接线方案（杜邦线方式）

由于天空星和正点原子屏幕的排针布局不同，建议用 **杜邦线** 连接：

>天空星的引脚数量够了

## 第一阶段：仅LCD显示（并口模式）

| LCD 引脚 | STM32H743IIT 引脚 | 功能                   | 确认                |
| ------ | --------------- | -------------------- | ----------------- |
| DB0    | PD14            | FMC_D0               | ✅ RM0433 Table 78 |
| DB1    | PD15            | FMC_D1               | ✅                 |
| DB2    | PD0             | FMC_D2               | ✅                 |
| DB3    | PD1             | FMC_D3               | ✅                 |
| DB4    | PF14            | FMC_D4 (Alternative) | ✅ RM0433 Table 78 |
| DB5    | PF15            | FMC_D5 (Alternative) | ✅                 |
| DB6    | PE9             | FMC_D6               | ✅                 |
| DB7    | PE10            | FMC_D7               | ✅                 |
| DB8    | PE11            | FMC_D8               | ✅                 |
| DB9    | PE12            | FMC_D9               | ✅                 |
| DB10   | PE13            | FMC_D10              | ✅                 |
| DB11   | PE14            | FMC_D11              | ✅                 |
| DB12   | PE15            | FMC_D12              | ✅                 |
| DB13   | PD8             | FMC_D13              | ✅                 |
| DB14   | PD9             | FMC_D14              | ✅                 |
| DB15   | PD10            | FMC_D15              | ✅                 |
| RS/DC  | PD11            | FMC_A16              | ✅ Bank1 mode      |
| CS     | PE7             | FMC_NE1              | ✅ Bank1 NE1       |
| WR     | PD5             | FMC_NWE              | ✅                 |
| RD     | PD4             | FMC_NOE              | ✅                 |
| LED    | PB15            | GPIO_Output          | ✅                 |
| RST    | PA4             | GPIO_Output          | ✅                 |