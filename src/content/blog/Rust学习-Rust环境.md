---
title: "Rust环境"
published: 2026-07-10
description: ""
tags: ["Rust学习"]
draft: false
---
 **`x86_64-pc-windows-msvc`** C++Toolskit
准备完C++环境后开始安装Rust,rustup-init
```
curl.exe -L -o rustup-init.exe https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe
```
下载完在powershell中运行:.\rustup-init.exe
```
$env:RUSTUP_HOME="D:\sometoolsforme\Rust\.rustup"
$env:CARGO_HOME="D:\sometoolsforme\Rust\.cargo"
```
```
rustc --version
cargo --version
```
vscode环境的安装:
  核心必须：
  - rust-analyzer（官方语言支持，补全、跳转、类型提示）

  推荐安装：
  - Even Better TOML（Cargo.toml 语法高亮）
  - CodeLLDB（调试支持）
  - Error Lens（行内显示错误信息）


