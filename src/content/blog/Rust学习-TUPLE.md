---
title: TUPLE
published: '2026-10-08'
description: ''
tags:
  - Rust学习
draft: false
---
tuple是多种类型组合到一起的,复合类型,长度固定,tuple中元素的顺序也是一定的。
```rust
fn main(){
	let tup:(i32,f64,u8)=(500,6.4,1);
}
```
变量`tup`被绑定了一个元组值`(500,6.4,1)`,该tuple的类型是`(i32,f64,u8)`
##### 使用模式匹配解构tuple
```rust
fn main(){
	let tup = (500,6.4,1);
	
	let (x,y,z)=tup;
	
	println!("The value of y is:{}",y);
}
```
##### 用`.`来访问tuple
访问某个特定的元素
```rust
fn main(){
	let x:(i32,f64,u8)=(500,6.4,1);
	
	let five_hunderd =x.0;
	
	let six_point_four = x.1;
	
	let one = x.2;
}
```
##### for instance
```rust
fn main(){
	let s1 = String::from("hello");
	
	let (s2,len) = calculate_length(s1);
	
	print!("The value of '{}' is {}.",s2,len);
}
fn calculate_length(s:String)->(String,usize){
	let length = s.len();
	
	(s,length)
}
```
`calculate_length`函数接收`s1`字符串的所有权,计算length,然后将字符串所有权和length赋值给`s2`和`len`

