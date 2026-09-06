---
title: "前言_1_install"
published: 2026-04-07
description: ""
tags: ["环境搭建"]
draft: false
---
### Anaconda中安装
### 1. 创建全新的虚拟环境

打开你的终端（Mac/Linux）或 Anaconda Prompt（Windows），输入以下命令创建一个新环境。我们可以把它命名为 `d2l`，并指定一个比较稳定的 Python 版本（比如 3.9）：

Bash

```
conda create -n d2l python=3.9
```

_(系统询问 `Proceed ([y]/n)?` 时，输入 `y` 并回车等待完成)_

### 2. 激活新环境

创建完成后，你需要激活它，也就是“进入”这个纯净的新环境：

Bash

```
conda activate d2l
```

_(成功激活后，你命令行最前面的提示符会从 `(base)` 变成 `(d2l)`)_

### 3. 在新环境中安装框架和 d2l 包

确保你现在处于 `(d2l)` 环境下，接着就可以照着你截图里的命令敲了。

**💡 一个小建议：** 你的截图当前选中的是 **MXNET** 标签页。虽然它是这本书早期使用的框架，但目前业界更主流的是 **PyTorch**。如果你想学 PyTorch，建议你在网页上点一下 `PYTORCH` 那个标签，复制对应的命令。
**注意以下我们展示的都是基于pytorch的命令**
我们可以按如下方式安装PyTorch的CPU或GPU版本：
```
pip install torch==1.12.0
pip install torchvision==0.13.0
```
我们的下一步是安装`d2l`包，以方便调取本书中经常使用的函数和类：
```
pip install d2l==0.17.6
```
### 4. 后续使用

以后你每次要看这本书或者运行相关的代码时，只需要打开终端，先运行 `conda activate d2l` 激活环境，然后再运行 Jupyter Notebook 就可以了。

## 下载 D2L Notebook
**d2l** 是 **Dive into Deep Learning** 的首字母缩写
下载这本书的代码
```
mkdir d2l-zh && cd d2l-zh
curl https://zh-v2.d2l.ai/d2l-zh-2.0.0.zip -o d2l-zh.zip
unzip d2l-zh.zip && rm d2l-zh.zip
cd pytorch
```
**安装完成后我们可以通过运行以下命令打开Jupyter笔记本（在Window系统的命令行窗口中运行以下命令前，需先将当前路径定位到刚下载的本书代码解压后的目录**
```
jupyter notebook
```
现在可以在Web浏览器中打开[http://localhost:8888](http://localhost:8888/)（通常会自动打开）。 由此，我们可以运行这本书中每个部分的代码。 在运行书籍代码、更新深度学习框架或`d2l`软件包之前，请始终执行`conda activate d2l`以激活运行时环境。 要退出环境，请运行`conda deactivate`。