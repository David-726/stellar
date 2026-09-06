---
title: "语句与表达式"
published: 2026-07-20
description: ""
tags: ["Rust"]
draft: false
---
Rust的函数体是由一系列语句组成，最后由一个表达式来返回值：
```rust
fn add_with_extra(x:i32,y:i32)->i32{
	let x = x +1;//语句
	let y = y +5;//语句
	x + y;//表达式
}
```
## 语句
```rust
let a = 8;
let b:Vec<f64> = Vec::new();
let （a,c) = ("hi",false);
```
上面都是语句,**完成了一个具体的操作，但是并没有返回值**
由于`let`是语句，因此不能将`let`语句赋值给其他值
```
let b = (let a =8)//错
```
语句不返回值，无法给变量赋值
## 表达式
表达式会进行求值，然后返回一个值。例如`5+6`,求值后，返回`11`,因此它就是一条表达式。
表达式也可以是语句的一部分，例如`let y =6`,`6`就是一个表达式，在求值后返回了一个值`6`
调用函数和宏也是表达式，因为会返回一个值，**总之，只要能返回值。就是表达式**
```rust
fn main(){
	let y ={
		let x =3;
		x+1
	};
	
	println!("The value of y is:{}",y);
}
```
上面使用一个语句块表达式将值赋给`y`变量，语句块长这样：
```rust
{
	let x =3;
	x+1
}
```
该语句块是表达式的原因是：它的最后一行是表达式，返回了 `x + 1` 的值，注意 `x + 1` 不能以分号结尾，否则就会从表达式变成语句， **表达式不能包含分号**。这一点非常重要，一旦你在表达式后加上分号，它就会变成一条语句，再也**不会**返回一个值!!!

若是表达式不返回任何值，会隐式的返回一个`()`。
```rust
fn main() {
	assert_eq!(ret_unit_type(),())
}
fn ret_unit_type() {
	let x =1;
	let y = if x%2 ==1{
		"odd"
	}else{
		"even"
	};
	let z = if x%2 ==1{"odd"}else{"even"};
}
```
## Rust by Practice
