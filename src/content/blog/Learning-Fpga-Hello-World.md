---
title: "Hello World"
published: 2026-08-26
description: ""
tags: ["Learning Fpga"]
draft: false
---

### Vivado建立工程
- 创建1个名为"ps_hello"的工程
- 点击`Create Block Design`,创建一个Block设计，也就是图形设计
- `Design Name`随便
- Add IP
- 搜索`ZYNQ7 Processing System`
- 双击Diagram中的`processing_system7_0`配置
- 首先出现`ZYNQ Block Design`中ZYNQ硬核的架构图，其中绿色部分是可配置模块，点击可以进入编辑模块
- 进入`PS-PL Configuration`界面，进行PS与PL之间接口的配置，主要是AXI接口，这些接口可以拓展PL端的AXI接口外设，所以PL如果要和PS进行数据交互，全部按照AXI总线协议，xilinx提供了大量的AXI接口的IP核。
- 之后进行PS端外设的配置阶段，ZYNQ的PS端外设很多是复用，同一般的arm设备类似
### PS端外设配置
- 原理图中找到串口连接在PS的MIO48-MIO49上，在`Peripheral I/O Pins`选项中使能UART1(MIO48 MIO49)，PS端MIO分为Bank,Bank 0,也就是原理图中的BANK500,电压选择3.3V,Bank1,也就是原理图中的BANK501，电压选择1.8V
- 配置QSPI,QSPI作为ZYNQ的启动存储设备,ZYNQ可以读取QSPI中存储的启动文件加载ARM和FPGA
- 配置以太网
- MDIO为以太网PHY寄存器配置接口
- 配置USB
- 除了QSPI启动ZYNQ,还有SD卡模式启动ZYNQ,选择SD 0,配置到MIO
- 打开GPIO MIO,PS便可以控制剩余未分配的MIO，用作GPIO

### MIO配置
MIO Configuration：
- 时钟配置
Clock Configuration 选项卡中我们可以配置PS时钟输入时钟频率，默认33.33333，CPU频率默认666.66666MHz，PS还为PL端提供4路时钟，频率可配置，还有OS端外设的时钟也可以进行配置
### DDR3配置
DDR Configuration中配置PS端ddr的参数

ZYNQ核的配置结束
- `Run Block Automation`,vivado自动完成一些导出端口的工作
- <img src="/posts/assets/1qh6-image246.webp" alt="image246.webp" loading="lazy" /><img src="/posts/assets/234-image254.webp" alt="image254.webp" loading="lazy" />连接FCLK_CLK0到M_AXI_GP0_ACLK
- <img src="/posts/assets/22p-image264.webp" alt="image264.webp" loading="lazy" />
>DDR和FIXED_IO是PS端引脚，PS_PORB为PS端上电复位信号，不能用于PL端复位，不要将PL端的复位绑定到这个引脚号上，切记！！！

<img src="/posts/assets/22p-image264-1.webp" alt="image264 1.webp" loading="lazy" />
- 选择Block设计，右键Create HDL Warpper,创建一个Verilog文件，为block design生成HDL顶层文件
- 保持默认next,展开设计可以看见PS被当作1普通IP来使用
- 选择block设计，右键Generate Output Products,次步骤会生成block的输出文件，包括IP,例化模板,RTL源文件，XDC约束，第三方综合源文件。供后续综合使用
- Generate
- IP生成的输出文件中已经包含了PS端引脚分配的xdc文件，在IP Sources,Block Designdesign_....中，可以看见处理器的xdc文件，绑定了PS端的IO，因此不需要再新建xdc绑定这些引脚
- Export Hardware 导出硬件信息
- 弹出对话框中点击OK,如果需要Pl端参与的话，这里就需要使能"include bitstream",一定不要放在vivado路径下，Vitis和vivado是两套独立的系统
- 此时可以在对应目录下看见xsa文件，这个文件就包含了Vivado硬件设计的信息

### Vitis调试
- Launch WorkPlace
- Create Application Project，该选项会生成app工程以及Platform工程，Platform工程类似于之前版本的hardware platform,包含了硬件支持的相关文件以及BAP
- Next
- Create a New platform Hardware(XSA)->Browse
- 选择生成的xsa
- Generate boot components选项，如果勾选上，软件会自动生成fsbl工程，一般选择默认勾选上
- Project Name:...,CPU默认选择ps7_cortesxa9_0,OS->standlone(裸机)
- Template Select -> HelloWorld
- 完成后生成了两个工程，一个是Platform工程(硬件工程)，一个是APP工程
- 展开Platform后看见包含BSP工程，以及zynq_fsbl工程，双击platform.spr即可看到Platform对应生成的BSP工程，可以在这里对BSP进行配置，包含开发所需的驱动文件。zynq_fsbl是fsbl的BSP,standlone on ps7_cortexa0_0即是app工程的BSP
	- 打开BSP，可以看见工程带有的所有驱动，其中Documentation是xilinx提供的驱动的说明文档，Import Examples是xlinix提供的example工程
- 选中APP工程，右键Build Project
- 在Console中看见编译过程
- 编译结束，生成elf文件(同传统的arm相似)
- 打开串口监视
- Run 或者 DeBug
### 固化程序
一般的fpga是可以从flash启动，或者被动加载，zynq启动时由arm主导的，zynq启动步骤:
- Stage0:上电复位或者热复位之后，处理器首先执行BootRam中的代码，这一步时最初始启动设置。BootRom中存放了一段用户不可更改的代码，当然是在非JTAG模式下执行，代码中包含了最基本的Nand,Nor,Quad-SPI,SD和PCAP的驱动。另一个很重要的作用就是将stage1中的代码搬运到OCM中，就是FSBL代码(FIRST STAGE BOOT LOADER)
- Stage1:BootRom被搬运到OCM后，处理开始执行fsbl代码，主要有以下几个作用:
	- 初始化PS端配置，这些配置也就是在Vivado工程中对zynq核的配置
	- 如果有PL端程序，加载PL端bitstream
	- 加载second stage bootloader或者bare-metal应用程序到DDR存储器
	- 交接给second stage bootloader或者bare-metal应用程序
### 生成FSBL
一个2级引导程序，完成对MIO的分配、时钟、PLL、DDR控制器初始化、SD、QSPI控制器初始化，通过启动模式查找bitstream配置FPGA，然后搜索用户程序加载到DDR,最后交接给应用程序执行
- 新建时选择了Genrerate boot components选项，所以Platform已经导入了fsbl的工程，并生成了相应的elf文件
- fsbl_debug.h添加调试宏定义FSBL_DEBUG_INFO,可以在启动输出FSBL的一些状态信息，有利于调试，但是会导致启动时间变长。
- 重新Build Project
- 这时候会多出一个DEBUG文件夹，生成了对应的BOOT.BIN
- 或者点击APP的system右键选择Create Boot Image,弹出窗口可以看见生成的BIF文件路径，BIF文件时生成BOOT文件的配置文件,还有生成的BOOT.bin文件路径,BOOT.bin文件是我们需要的启动文件，可以放到SD卡启动，或者烧写到QSPI Flash
- BootImagePartition列表中有要合成的文件，第一个文件一定是bootloader文件，就是上面生成的fsbl.elf文件，第二个文件是FPGA配置文件bitstream，第三个是应用程序.elf文件->Create Image
### SD卡启动
- 格式化SD卡为FAT32格式，其他格式无法启动
- 放入BOOT.bin文件，放在根目录
- 插入SD卡
- 调整跳线帽或者开关为SD卡启动模式
- 打开串口，可以看见FSBL启动信息+Hello_world
### QSPI启动测试
- Vitis菜单Xilinx->Program Flash
	- Hardware Platform选择最新的，Image File文件选择需要烧写的BOOT.bin,FSBL file选择fsbl.elf,选择Verift after flash,烧写完成后校验flash
	- 点击Program等待烧写完成
	- 调整跳线帽或拨码开关为QSPI启动模式
### Vivado下烧写QSPI
- Hardware Manger下选择器件，Add Configuratiuon Memort Devoce
- 选择尝试Winbond,类型选择qspi,宽度选择x4-signle,选择型号...
- 右键选择编程文件 Program Configuration Memory Device
- 选择要烧写的文件和fsbl文件，就可以烧写了，建议烧写QSPI时设置为JTAG模式