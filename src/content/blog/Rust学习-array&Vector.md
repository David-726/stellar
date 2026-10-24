---
title: array&Vector
published: '2026-10-10'
description: ''
tags:
  - Rust学习
draft: false
---
Rust中,最常用的数组有2种,一种是速度很快但是长度固定的`array`,另一种是可动态增长的但是有性能损耗的`Vector`;我们称`array`为数组,`Vector`为动态数组
这两个数组的关系和`String`和`&str`很像,前者是长度固定的字符串切片,后者是可动态增长的字符串
##### 创建数组
Rust中,数组的创建:
```rust
fn main(){
	let a = [1,2,3,4,5];
}
```
由于`array`的元素类型和大小固定,长度也固定,因此`array`是存储在**栈**上,性能非常优秀;
动态数组`Vector`存储在**堆**上,因此长度可以动态改变.
例子:需要知道一年中各个月份名称的程序之中,很可能希望使用的是`array`,因为月份是固定的:
```rust
let months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
```
在一些时候,还需要为**数组声明类型**:
```rust
let a:[i32;5]=[1,2,3,4,5];
```
这种声明方式也说明了`array`的类型统一,长度固定
另外也可以这样初始化一个**重复出现的N次的值**:
```rust
let a = [3;5];
```
##### 访问数组元素
数组是连续存放元素的,因此可以通过index来访问存放的元素:
```rust
fn main(){
	let a = [9,8,7,6,5];
	
	let first = a[0];
	let second = a[1];
}
```
##### 越界访问
使用超出数组范围的索引访问数组元素,bigbang
```rust
use std::io;

fn main(){
	let a = [1,2,3,4,5];
	println!("Please enter an array index");
	
	let mut index = String::new();
	//读取控制台的输出
	io::stdin()
		.read_line(&mut index)
		.expect("Failed to read line");
	let index:usize=index
		.trim()
		.parse()
		.expect("Index entered was not a number")
	let element = a[index];
	println!(
		"The value of the element at index {} is {}",
		index,element
	);
}
```
使用`cargo run`来运行代码,因为数组只有5个元素,当我们输入`5`去访问第6个元素,则会访问到不存在的数组元素,最终会panic
当我们尝试使用索引访问元素时,Rust会检查指定的索引是否小于数组长度,如果索引大于等于数组长度,rust会出现panic;这种检查只能在运行时进行,编*译器无法在编译的时候知道用户输入什么值*
这就是*Rust的安全特性之一*
##### 数组元素为非基础类型:
```rust
let array = [String::from("rust is good!");8];
println!("{:#?}",array);
```
Error:
```
```
前面的基本类型可以直接这样,是因为基本类型的`Copy`特性,但是复杂类型没有,只能一个个创建:
```rust
let array = [String::from("rust is good!"),String::from("rust is good!"),String::from("rust is good!")];

println!("{:#?}",array);
```
垃圾写法:
正确的写法应该调用`std::array::from_fn`
```rust
let array:[String:8]=std::array::from_fn(|_i| String::from("rust is good!"));
println!("{:#?}",array);
```
##### 数组切片
`Slice`允许我们引用集合中的部分连续片段,而不是整个集合,对于数组也是,允许我们引用数组的一部分:
```rust
let a:[i32;5]=[1,2,3,4,5];

let slice:&[i32]=&a[1..3];

assert_eq!(slice,&[2,3]);
```
数组切片的特点:
- 切片的长度可以和数组不同,并不是固定的,而是取决于你使用时指定的起始和结束位置
- 创建切片的代价很小,只是对底层数组的一个引用
- 切片类型`[T]`拥有不固定的大小,而切片引用类型`&[T]`则具有固定的大小,因为Rust很多时候都需要固定大小数据类型,因此`&[T]`更有用,`&str`字符串切片也同理
下面通过一个综合性使用的例子:
```rust
fn main(){
	//编译器自动推导出one的类型
	let one = [1,2,3];
	//显式类型标注
	let two:[u8;3] = [1,2,3];
	let blank1 = [0;3];
	let blank2:[u8;3] = [0;3];
	
	// arrays是一个二维数组,其中每一个元素都是一个数组,元素类型时[u8;3]
	let arrays:[[u8;3];4]=[one,two,blank1,blank2];
	// 借用arrays的元素用作循环中
	for a in &arrays{
		print!("{:?}:",a);
		// 将a变成一个迭代器,用于循环
		// 也可以直接使用 for n in a{} 来循环
		for n in a.iter(){
			print!("\t{} + 10 = {}",n,n+10);
		}
		let mut sum = 0;
		// 0..a.len时一个Rust的语法糖,其实就等于一个数组,元素是从0,1,2一直增加到a.len-1
		for i in 0..a.len(){
			sum+=a[i];
		}
		println!("\t({:?}={})",a,sum);
	}
}
```
In short:
- **数组类型容易和数组切片混淆**,`[T;n]`描述一个数组的类型,而`[T]`描述了一个切片的类型,因为切片是运行期的数据结构,长度无法在编译期得到,因此不能用`[T;n]`来描述
- `[u8;3]`和`[u8;4]`是不同的类型,数组的长度也是类型的属性
- **实际开发中,使用最多的是数组切片`[T]`**,往往通过引用来使用`&[T]`,因为后者有固定的长度
