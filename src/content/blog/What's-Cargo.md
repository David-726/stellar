---
title: "What's Cargo"
published: 2026-07-10
description: ""
tags: []
draft: false
---
**一个包管理工具**像node.js或是npm
## 开启一个world_hello
```
cargo new world_hello
cd world_hello
ls
```
```
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         2026/7/10     23:08                src
-a----         2026/7/10     23:08              8 .gitignore
-a----         2026/7/10     23:08             82 Cargo.toml
```
cargo会创建src,甚至连.git都创建了
## 运行项目
- `cargo run`
```
cargo run
   Compiling world_hello v0.1.0 (D:\sometoolsforme\Rust\Rust Projects for self-learning\world_hello)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 1.30s
     Running `target\debug\world_hello.exe`
Hello, world!
```
*Hello,world*
- 手动编译运行项目
`cargo run`相当于运行了2个命令即编译和运行，也可以拆分为手动的两部分
```
cargo build
./target/debug/world_hello
```
debug模式下代码的运行速度会变慢，rust编译器不会做任何的优化，只是为了让编译完成。
当然我们还可以
```
cargo run --release
cargo build --release
```
  ┌─────┬───────────┬────────┬────────┬────────┬────────┐
  │ 模  │   命令    │  优化  │ 编译速 │ 运行速 │ 调试信 │
  │ 式  │           │        │   度   │   度   │   息   │
  ├─────┼───────────┼────────┼────────┼────────┼────────┤
  │ 调  │ cargo run │ 无     │ 快     │ 慢     │ 完整   │
  │ 试  │ （默认）  │        │        │        │        │
  ├─────┼───────────┼────────┼────────┼────────┼────────┤
  │ 发  │ cargo run │ 全力优 │        │        │        │
  │ 布  │           │ 化     │ 慢     │ 快     │ 有限   │
  │     │ --release │        │        │        │        │
  └─────┴───────────┴────────┴────────┴────────┴────────┘
  ```
  ./target/release/world_hello
  ```
## Cargo Check
在项目体积大的时候，'cargo build'和'cargo run'速度会变慢许多，这时候可以试一试'cargo check',**快速的检查代码能否编译通过**。
### Cargo.toml&Cargo.lock
Cargo.toml是cargo特有的**项目数据描述文件**.存储了项目的所有元配置信息。
Cargo.lock是cargo工具根据同一项目的toml文件生成的**项目依赖详细清单**。
>什么情况下该把 `Cargo.lock` 上传到 git 仓库里？很简单，当你的项目是一个可运行的程序时，就上传 `Cargo.lock`，如果是一个依赖库项目，那么请把它添加到 `.gitignore` 中。

### package 配置段落
`package` 中记录了项目的描述信息
```
[package]
name = "world_hello"
version = "0.1.0"
edition = "2021"
```
### 定义项目依赖
`cargo` 工具的最大优势就在于，能够对该项目的各种依赖项进行方便、统一和灵活的管理。
在 `Cargo.toml` 中，主要通过各种依赖段落来描述该项目的各种依赖项：
- 基于 Rust 官方仓库 `crates.io`，通过版本说明来描述
- 基于项目源代码的 git 仓库地址，通过 URL 来描述
- 基于本地项目的绝对路径或者相对路径，通过类 Unix 模式的路径来描述




  