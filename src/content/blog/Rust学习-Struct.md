---
title: Struct
published: '2026-10-08'
description: ''
tags:
  - Rust学习
draft: false
---
#### grammar
构成:
- 通过关键字`struct`定义
- 一个清晰明确的结构体名称
- 几个有名字的结构体字段
```rust
struct User{
	active:bool,
	username:String,
	email:String,
	sign_in_count:u64,
}
```
结构体名称是`User`,有4个字段,其中每个字段都有类型声明。
###### 创建结构体实例:
```rust
let user1 = User{
	email:String::from("someone@example.com"),
	username:String::from("someusername123"),
	active:true,
	sign_in_count:1,
};
```
###### 访问结构体字段
通过`.`即可访问结构体实例内部的字段值
```rust
let mut user1 = User{
	email:String::from("someone@example.com"),
	username:String::from("someusername123"),
	active:true,
	sign_in_count:1,
};
	user1.email = String::from("anotheremail@example.com");
```
必要时候需要将struct实例化为可变的,才能修改其中的字段,Rust不支持将某个结构体某个字段标记为可变。
###### 简化结构体创建
```rust
fn build_user(email:String,username:String)->User{
	email:email,
	username:username,
	active:true,
	sign_in_count:1,
	}
}
```
这里接收2个参数`email`和`username`,然后使用它们来创建一个`User`结构体,并且返回。注意到`email:email,username:username,`相当的刺挠:
```rust
fn build_user(email:String,username:String)->User{
	User{
		email,
		username,
		active:true,
		sign_in_count:1,
	}
}
```
当函数参数和结构体字段相同时,直接使用缩略的方式进行初始化
##### 结构体更新
```rust
let user2 = User{
	active:user1.active,
	username:user.username,
	email:String::from("another@example.com"),
	sign_in_count:user1.sign_in_count,
};
```
等价于
```rust
let user2 = User{
	email:String::from("another@example.com"),
	..user1
}
```
`..user1`嗯嗯表示凡是没有显式声明的字段,全部从`user1`中自动获取,**1`..user1`需要在结构体的尾端进行使用`**

>上面,`user1`的部分字段所有权被转移到了`user2`,`username`字段发生了所有权转移,因此`user1`无法使用
>这里又回到了`Copy`特征:实现`copy`特征的类型无需进行所有权转移,可以直接在赋值时进行数据拷贝。
>`username`所有权被转移给了`user2`,导致了`user1`无法再被使用,但是并不代表`user1`内部的其他字段不能被继续使用:

```rust
#[derive(Debug)]
struct User{
	active:bool,
	username:Sring,
	email:Sring,
	sign_in_count:u64,
};
fn main(){
	let user1 = User{
	email:String::from("someone@example.com"),
	username:String::from("someusername123"),
	active:true,
	sign_in_count:1	
	};
	let user2 = User{
	active:user1.active,
	username:user1.username,
	email:String::from("another@example.com"),
	sign_in_count:user1.sign_in_count,
	};
	// active有copy特性
	println!("{}",user1.active)
	//下面则会报错
	println!("{:?}",user1);
}
```
##### struct的内存排列
```rust
#[derive(Debug)]
struct File{
	name:String,
	data:Vec<u8>,
}
fn main(){
	let f1 = File{
		name:String::from("f1.txt"),
		data:Vec::new(),
	};
	let f1_name = &f1.name;
	let f1_length = &f1.data.len();
	
	println!("{:?}",f1);
	println!("{} is {} bytes length",f1_name,f1_lengbth);	
};
```




<img src="/posts/assets/8b76da88e52c1a7a-Pasted-image-20261008205128.png" alt="Pasted image 20261008205128.png" loading="lazy" />




*从图中可以清晰地看出 `File` 结构体两个字段 `name` 和 `data` 分别拥有底层两个 `[u8]` 数组的所有权（`String` 类型的底层也是 `[u8]` 数组），通过 `ptr` 指针指向底层数组的内存地址，这里你可以把 `ptr` 指针理解为 Rust 中的引用类型。*
##### Tuple struct
结构体必须要有名称,但是结构体的字段可以没有名称,这种结构体长得很像数组,因此被称之为tuple struct
```rust
struct Color(i32,i32,i32);
struct Point(i32,i32,i32);

let black = Color(0,0,0);
let origin = Point(0,0,0);
```
在我们希望有一个整体的名称,但是却不关心字段的名字的时候使用,例如上面的`Point`元组结构体,众所周知3d点是(x,y,z)形式的坐标点,因此无需再为内部的再短之一命名为:`x,y,z`

##### Unit-like Struct
如果定义一个类型,但是不关心该类型的内容,只关心它的行为时,就可以使用`unit-like struct`
```rust
struct AlwaysEqual;

let subject = AlwaysEqual;

impl SomeTrait for AlwaysEqual{

}
```
##### 结构体数据的所有权
之前的`User`结构体的定义当中,哦我们使用了自身拥有所有权的`String`类型而不是基于引用的`&str`字符串切片类型。**我们希望这个结构体拥有它所拥有的数据,而不是从其他地方借用数据**
也可以让`User`结构体从其他对象借用数据,不过这么做,就需要引入**生命周期(lifetime)**,简而言之,生命周期能够确保结构体的作用范围比他所借用的数据作用范围要小
总之,要是在结构体中使用一个引用,就必须要加入生命周期,否则就会报错:
```rust
struct User{
	username:&str,
	email:&str,
	sign_in_count:u64,
	active:bool,
}
fn main(){
	let user1 = User{
		email:"someone@example.com",
		username:"someusername123",
		active:true,
		sign_in_count:1,		
	};
}
```
编译器会抱怨它需要生命周期标识符：Error
##### 使用`#[derive(Debug)]`来打印结构体的信息
前面的代码中我们使用了`#[derive(Debug)]`来对结构体进行标记,这样才能使用`println!("[:?]",s)`的方式进行输出,如果不加就会bigbang!!!
```rust
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!("rect1 is {}", rect1);
}
```
```
error[E0277]: `Rectangle` doesn't implement `std::fmt::Display`
```
我的发,我们的struct没有`display`特征,我们如果使用`[]`来进行格式化输出,那对应的类型就必须实现`Display`特征,之前学习的基本类型,也默认实现了该特征:
```rust
fn main(){
	let v =1;
	let b = true,
	
	println!("{},{}",v,b);
}
```
为什么结构体步默认实现`Display`特征呢?原因在于struct较为复杂?
考虑如下问题,想要逗号对字段进行分割吗?需要逗号吗?加再什么地方?类似还有很多问题,rust不希望猜测我们想要的是什么,而是把选择权交给我们,如果要使用`{}`的方式打印结构体,那就自己实现`Display`特征
下面我们用`{:?}`来试试,这个方式我们再本文的前面也见过,试试:
```rust
print!("rect1 is {:?}",rect1);
```
依旧无情报错
好在又一次给出了提示
```
= help: the trait `Debug` is not implemented for `Rectangle`
= note: add `#[derive(Debug)]` to `Rectangle` or manually `impl Debug for Rectangle`
```
- impl Debug for Rectangle
- #[derive(Debug]
```rust
#[derive(Debug)]
struct Rectangle{
	width:u32,
	height:u32,
}
fn main(){
	let rect1 = Rectangle{
		width:30,
		height:50,
	};
	
	println!("rect1 is {:?}",rect1);
}
```
我的发,bingo
当结构体较大时候,我们可能希望能够有更好的输出表现,此时可以使用`{:#?}`来代替`{:?}`,输出:
```
rect1 is Rectangle {
    width: 30,
    height: 50,
}
```
此时的结构体输出和我们的创建一样了,当然还可以手动实现`Display`特征,以向用户更美的展示私藏结构体。
还有1个简单的输出debug信息的方法,就是使用`dbg!`宏,它会拿走表达式的所有权,然后打印出相应的文件名,行号灯debug信息。**最终还会将表达式的所有权返回**
```rust
#[derive(Debug)]
struct Rectangle{
	width:u32,
	height:u32,
};
fn main(){
	let scale = 2;
	let rect1 = Rectangle{
		width:dbg!(30*scale),
		height:50,
	};
	dbg!(&rect1);
}
```
最终输出:
```
$ cargo run
[src/main.rs:10] 30 * scale = 60
[src/main.rs:14] &rect1 = Rectangle {
    width: 60,
    height: 50,
}
```