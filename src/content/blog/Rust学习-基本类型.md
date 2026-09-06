---
title: "基本类型"
published: 2026-07-12
description: ""
tags: ["Rust学习"]
draft: false
---
Rust中每一个值都有其确切的数据类型，总的来说可以分为两类：基本和复合。
- **数值类型**：
    
    - 有符号整数：`i8`， `i16`, `i32`, `i64`, `i128`, `isize`
    - 无符号整数：`u8`， `u16`, `u32`, `u64`, `u128`, `usize`
    - 浮点数：`f32`（单精度）, `f64`（双精度，默认）
- **字符串切片**：`&str`
    
- **布尔类型**：`true` 和 `false`
    
- **字符类型**：`char` 表示单个 Unicode 字符（存储为 4 字节），如 `'A'`, `'中'`, `'😻'`
    
- **单元类型**：`()`，其唯一可能的值也是 `()`
**Rust是一门静态类型语言**,需要在编译时知道所有变量的类型，但是不一定要为每一个变量指定类型，**Rust的高级编译器可以根据变量的值和上下文中的使用方式自动推导变量的类型**,但是不一定能够总是推导出来。
```rust
let guess = "42".parse().expect("Not a number");
```
## 数值类型
### 整数类型
|长度|有符号类型|无符号类型|
|---|---|---|
|8 位|`i8`|`u8`|
|16 位|`i16`|`u16`|
|32 位|`i32`|`u32`|
|64 位|`i64`|`u64`|
|128 位|`i128`|`u128`|
|视架构而定|`isize`|`usize`|
Rust默认使用`i32`，例如`let i =1`,这里的`x`就是`i32`。
#### 整型溢出
256->u8(编译时会panic)。当使用`--release`参数进行`release`模式构建时，Rust不会检查溢出。Rust 会按照补码循环溢出的规则处理。简而言之，大于该类型最大值的数值会被补码转换成该类型能够支持的对应数字的最小值。但是有时候并不是我们想要的。
显式的处理可能的溢出，可以使用标准库针对原始数字类型提供的方法。
- 使用`wrapping_*`方法在所有模式下都按照补码循环方式处理溢出，例如`wrapping_add`
- `checked_*`时发生溢出，返回`None`
- `overflowing_*`返回该值和一个指标是否存在溢出的`bool`值
- `saturating_*`根据限定计算后的结果不超过目标类型的最大值或低于最小值,
```rust
assert_eq!(100u8.saturating_add(1),101);
assert_eq!(u8::MAX.saturating_add(127),u8::MAX);

```
```rust
fn main(){
	let a : u8 = 255;
	let b = a.wrapping_add(20);
	println!("{}",b);//19
}
```
### 浮点类型
带小数点的数字
```rust
fn main(){
	let x =2.0;
	
	let y:f32=3.0;
}
```
>f32单精度，f64双精度

#### 浮点数陷阱
- **浮点数往往是你想要数字的近似表达**,浮点数类型是基于2进制实现的，但是我们想要的数字往往是10进制的，(可参考2进制到10进制的小数转换方法)
- **浮点数再某些特性上是反直觉的**，Rust的`HashMap`数据结构，是一个KV类型的Hash Map实现，对于`K`没有特定类型的限制，但是要求能用做`K`的类型必须实现了`std::cmp::Eq` 特征。
**没明白**
```rust
fn main(){
	assert!(0.1+0.2==0.3);
}
```
上面程序会`panic`,因为2进制精度问题，导致了0.1+0.2并不严格等于0.3,可能在小数点N位后存在误差。
```rust
fn main() {
	let abc :(f32,f32,f32)=(0.1,0.2,0.3);
	let xyz :(f64,f64,f64)=(0.1,0.2,0.3)；
	
	println!("abc(f32)");
	println!("0.1+0.2:{:x}",(abc.0+abc.1).to_bits());
	println!("    0.3:{:x}",(abc.2).to_bits());
	
	println!("xyz(f64)");
	println!("   0.1 + 0.2: {:x}",(xyz.0 + xyz.1).to_bits());
	println!("         0.3: {:x}"),(xyz.2).to_bits());
	
	assert!(abc.0 + abc.1 == abc.2);
	assert!(xyz.0 + xyz.1 == xyz.2);
}
```
So we get
```
abc (f32)
   0.1 + 0.2: 3e99999a
         0.3: 3e99999a

xyz (f64)
   0.1 + 0.2: 3fd3333333333334
         0.3: 3fd3333333333333

thread 'main' panicked at 'assertion failed: xyz.0 + xyz.1 == xyz.2',
➥ch2-add-floats.rs.rs:14:5
note: run with `RUST_BACKTRACE=1` environment variable to display
➥a backtrace

```
**blow my mind away**
## NaN
对于数学上未定义的结果，Rust的浮点数类型会产生`NaN`。
所有与`Nan`交互的操作，都会返回`NaN`.
```rust
fn main() {
	let x = (-42.0_f32).sqrt();
	assert_eq!(x,x);
}
```
```rust
fn main() {
	let x = (-42.0_f32).sqrt();
	if x.is_nan() {
		println!("未定义的数学行为");
	}
}
```
## 数学运算
Rust支持所有类型的基本数字运算 加减乘除取模
```rust
fn main() {
	let twenty = 20;
	let twenty_one:i32 = 21;
	let twenty_two=22i32;
	
	let addition = twenty + twenty_one + twenty_two;
	println!("{} + {} +{} = {}",twenty,twenty_one,twenty_two);
	
	let one_million:i64=1_000_000;
	println!("{}“.one_million.pow(2));
	
	let forty_twos = [
		42.0;
		42f32;
		42.0_f32;
	];
	println!("{:.2}",forty_twos[0]);

}
```
## 位运算
| 运算符   | 说明                           |     |
| ----- | ---------------------------- | --- |
| & 位与  | 相同位置均为1时则为1，否则为0             |     |
| \| 位或 | 相同位置只要有1时则为1，否则为0            |     |
| ^ 异或  | 相同位置不相同则为1，相同则为0             |     |
| ! 位非  | 把位中的0和1相互取反，即0置为1，1置为0       |     |
| << 左移 | 所有位向左移动指定位数，右位补0             |     |
| >> 右移 | 所有位向右移动指定位数，带符号移动（正数补0，负数补1） |     |
|       |                              |     |


```rust
fn main() {
	let a:u8 = 2;
	let b:u8 = 3;
	println!("a value is      {:08b}",a);
	println!("b value iss     {:08b}",b);
	println!("(a & b) value is {:08b}",a&b);
	println!("(a | b) value is {:08b}",a|b);
	println!("(a ^ b) value is {:08b}",a^b);
	println!("(!b) value is {:08b}",!b);
	println!("(a << b) value is {:08b}",a<<b);
	println!("(a >> b) value is {:08b}",a>>b);
	let mut a = a;
	a<<=b;
	println!("(a<<b) value is {:08b}",a);
}
```

## 序列(range)
Rust提供了一个非常简洁的方式，用于生成连续的的数值，例如`1..5`,生成从1到4的连续数字，不包含5；`1..=5`，生成从1到5的连续数字，包含5，用途很简单，常用于循环中:
```rust
for i in 1..=5{
	println!("{}",i);
}
```
序列只允许用数字或字符类型，原因是他们可以连续。
```rust
for j in 'a'..='z'{
	println!("{}",j);
}
```
## 有理数和复数
`num`库的引入:
- 创建新工程`cargo new complex-num && cd complex-num`
- 在`Cargo.toml`中的`[dependencies]`下添加一行`num="0.4.0"`
- 将`src/main.rs`文件中的`main`替换为:
```rust
use num::complex::Complex;

fn main() {
	let a = Complex {re:2.1,im=-1.2};
	let b = Complex::new(11.1,22.2);
	let result = a + b;
	
	println!("{} + {}j",result.re,result.im);
}
```
## Rust by Practice
```rust

```