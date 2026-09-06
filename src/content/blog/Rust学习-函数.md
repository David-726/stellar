---
title: "函数"
published: 2026-07-20
description: ""
tags: ["Rust学习"]
draft: false
---
Rust的函数，和其他语言几乎没有什么差异。
```rust
fn add(i:i32,j:i32)->i32{
	i+j
}
```
<img src="/posts/assets/2is4m-Pasted-image-20260720110938.png" alt="Pasted image 20260720110938.png" loading="lazy" />
**函数名和变量名**可采用**蛇形命名法**,`fn add_two()->{}`
## 函数参数
rust是静态类型语言，因此需要为每一个函数参数标识出它的具体类型
```rust
fn main(){
	another_function(5,6.1);
}
fn another_function(x:i32,y:i32){
	println!("The value of x is:{}",x);
	println!("The value of y is:{}",y);
}
```
`another_function`函数有2个参数，其中`x`是`i32`类型，`y`是`f32`类型，这里去掉`x`或者`y`中任意一个的类型都会报错
```rust
fn main(){
	another_function(5,6.1);
}
fn another_function(x:i32,y){
	println!("The value of x is {}",x);
	println!("The value of y is {}",y);
}
```
## 函数返回
函数的返回值就是函数体**最后一条表达式**的返回值，当然也可以用`return`提前返回
```rust
fn plus_five(x:i32)->i32{
	x+5
}
fn main(){
	let x = plus_five(5);//侧面说明了函数也是表达式
	
	println!("The value of x is {}“,x);
}
```
```rust
fn plus_or_minus(x:i32)->i32{
	if x>5{
		return x-5
	}
	x+5
}
fn main(){
	let x = plus_or_minus(5);
	println!("The value of x is {}",x);
}
```
### Rust中的特殊返回类型
#### 无返回值()
对于单元类型`()`，是一个0长度的元组。虽然没啥用，但是可以用来表达一个函数没有返回值：
- 函数没有返回值，返回`()`
- `;`结尾的语句返回`()`
```rust
use std::fmt::Debug;
fn report<T:Debug>(item:T){
	println!("{:?}",item);
}
```
`report`会隐式的返回一个()
```rust
fn clear(text:&mut String)->(){
	*text = String::from("");
}
```
在实际编程中，会经常看见错误提示中看到`()`的身影，假如函数需要一个`u32`值，但是不幸的以`表达式;`的语句形式作为函数的最后一行代码，就会报错
```rust
fn add(x:u32,y:u32)->u32{
	x+y;  
}
```
### 永不返回的发散函数`!`
当用`!`作函数返回类型的时候，表示该函数永不返回。特别的，这种语法往往会导致程序崩溃的函数:
```rust
fn dead_end()->!{
	panic!("你已经到了穷途末路，崩溃吧!"`);
}
```
无限循环:
```rust
fn forever()->!{
	loop{
	//...
	};
}
```
## Rust by Practice
