---
title: "变量绑定与解构"
published: 2026-07-10
description: ""
tags: ["Rust"]
draft: false
---
## YesButWhy
基于灵活性和安全性的考量与取舍
### 变量命名
- 须遵循rust命名规范
### 变量绑定
```rust 
let a = "helloworld"
```
为什么不是赋值而是绑定。。。
区别:
- 赋值:执行 `x = 5` 时，是把数值 `5` 复制并写入到 `x` 所代表的那块内存空间里。如果随后执行 `x = 6`，原本空间里的 `5` 就会被**覆盖**掉。*变量的内存地址通常是固定不变的，改变的只是那块内存里存储的二进制数据。*
- 绑定：当你写下 `x = 5` 时，系统首先在内存中创建了一个独立的数据对象 `5`，然后把名字 `x` 像贴标签一样**绑定**到这个对象上。如果随后执行 `x = 6`，系统会创建一个新的对象 `6`，并把标签 `x` 从 `5` 身上撕下来，重新贴到 `6` 身上。*变量本身并不持有数据，只是数据中的一个引用或是名字标签。*
引入:**所有权**.
### 变量可变性
**rust变量默认情况下不可变.** 使得代码更安全和更好的性能。可以通过`mut`关键字让变量变为**可变**的。
if `a`不可变，则在为它绑定值之后，就不能再修改`a`。
```rust
fn main(){
	let x =5;
	println!("The value of x is{}");
	x = 6;
	println!("The value of x is{}");
}
```
```
cargo build --release

```
```
warning: value assigned to `x` is never read                      
 --> src\main.rs:4:5
  |
4 |     x=6;
  |     ^^^
  |
  = help: maybe it is overwritten before being read? 
```
对于不可变和可变的考量，还是要基于自身对于安全性和性能的考量。

### 使用下划线忽略未使用的变量
如果创建了一个变量但是却从未调用过，则在编译或是调试时会警告。
*为了使rust不要警告未调用过的变量，这时候可以使用下划线作为变量名的开头*
```rust
fn main(){
	let _x=5;
	let y=10;
}
```
```
warning: unused variable: `y`                                     
  --> src\main.rs:12:9
   |
12 |     let y=10;
   |         ^ help: if this is intentional, prefix it with an underscore: `_y`
   |
   = note: `#[warn(unused_variables)]` (part of `#[warn(unused)]`) on by default
```
>顺带提及，rust中的注释同c.

### 变量解构
let 表达式处理用于简单的变量绑定，还能进行简单结构的解构：*从一个相对复杂的结构中，匹配出该变量的一小部分。

```rust
fn main(){
	let (a,mut b):(bool,bool)=(true,false);
	println!("a= {:?},b={:?},a,b);
	
	b=true;
	assert_eq!(a,b);
	//assert_eq!()是一个是否常见的宏，用于判定两个表达式是否相等。
}
```
通过元组结构每一个元素的数据。
### 解构式赋值
```rust 
struct Struct{
	e: i32
}
fn main(){
	let (a,b,c,d,e);
	
	(a,b)=(1,2);
	[c,..,d,_]=[1,2,3,4,5];
	```rust
	// _ 代表匹配一个值，但是我们不关心具体的值是什么，因此没有使用一个变量名而是使用了 
	Struct {e,..}=Struct{e:5};
	//将struct中的e取出来并绑定数值5
	assert_eq!([1,2,1,4,5])
}
```
这种使用方式跟之前的 `let` 保持了一致性，但是 `let` 会重新绑定，而这里仅仅是对之前绑定的变量进行再赋值。
### 变量和常量之间的差异
**constant(常量)**:
- 不允许使用`mut`
- 使用`constant`关键字而不是用`let`声明，且声明值的类型**必须声明**
```rust
const MAX_POINTS:u32=100_000
```
常量可以在任意作用域内声明，包括全局作用域，在声明的作用域内，常量在程序运行的整个过程中都有效。
### 变量遮蔽
Rust允许声明相同的变量名，在后面声明的变量会遮蔽掉前面声明的。
```rust
fn main(){
	let x = 5;
	let x = x+1;
	{
		let x = x*2;
		println!("the value of x in the inner is {}");
	}
	println!("the value of x is {}");
}
```
```
the value of x in the inner is 12
the value of x is 6
```
这和 `mut` 变量的使用是不同的，第二个 `let` 生成了完全不同的新变量，两个变量只是恰好拥有同样的名称，涉及一次内存对象的再分配 ，而 `mut` 声明的变量，可以修改同一个内存地址上的值，并不会发生内存对象的再分配，性能要更好。
```rust
let spaces="    ";
let spaces=spaces.len();
```
这种结构是允许的，因为第一个 `spaces` 变量是一个字符串类型，第二个 `spaces` 变量是一个全新的变量且和第一个具有相同的变量名，且是一个数值类型。所以变量遮蔽可以帮我们节省些脑细胞，不用去想如 `spaces_str` 和 `spaces_num` 此类的变量名。
```rust
//Nope
let mut spaces = "    ";
spaces = spaces.len();
```
会发生编译器报错。

## Rust By Practice
```rust
/* 1.修复下面代码的错误并尽可能少的修改
fn main() {
    let x: i32; // 未初始化，但被使用
    let y: i32; // 未初始化，也未被使用
    println!("x is equal to {}", x); 
}
*/
fn main() {
    let x: i32=1; // 未初始化，但被使用
    let y: i32; // 未初始化，也未被使用
    println!("x is equal to {}", x); 
}
/* 2
// 完形填空，让代码编译
fn main() {
    let __ = 1;
    __ += 2; 
    
    println!("x = {}", x); 
}
*/
fn main() {
    let mut x = 1;
    x += 2; 
    
    println!("x = {}", x); 
}
/* 3// 修复下面代码的错误并使用尽可能少的改变
fn main() {
    let x: i32 = 10;
    {
        let y: i32 = 5;
        println!("x 的值是 {}, y 的值是 {}", x, y);
    }
    println!("x 的值是 {}, y 的值是 {}", x, y); 
}
*/
fn main() {
    let x: i32 = 10;
    let y: i32 = 5;{
        println!("x 的值是 {}, y 的值是 {}", x, y);
    }
    println!("x 的值是 {}, y 的值是 {}", x, y); 
}
/*4.
// 修复错误
fn main() {
    println!("{}, world", x); 
}

fn define_x() {
    let x = "hello";
}
*/
// 修复错误
fn main() {
	let x = "hello";
    println!("{}, world", x); 
}
/*5
// 只允许修改 `assert_eq!` 来让 `println!` 工作(在终端输出 `42`)
fn main() {
    let x: i32 = 5;
    {
        let x = 12;
        assert_eq!(x, 5);
    }

    assert_eq!(x, 12);

    let x = 42;
    println!("{}", x); // 输出 "42".
}
*/
fn main() {
    let x: i32 = 5;
    {
        let x = 12;
        assert_eq!(x, 12);
    }

    assert_eq!(x, 5);

    let x = 42;
    println!("{}", x); // 输出 "42".
}
// 在此之前我们需要知道的是 `assert_eq!()`宏表示的是若是A\B相等，则继续；反之立刻崩溃。
/*6
fn main() {
    let mut x: i32 = 1;
    x = 7;
    // 遮蔽且再次绑定
    let x = x; 
    x += 3;


    let y = 4;
    // 遮蔽
    let y = "I can also be bound to text!"; 
}
*/
fn main() {
    let mut x: i32 = 1;
    x = 7;
    // 遮蔽且再次绑定
    let x = x; 
	let x = x+3;
    let y = 4;
    // 遮蔽
    let y = "I can also be bound to text!"; 
}
//由于rust中变量的不可变性，x+=3等自加自建等运算不存在，`let x=x+3`体现了变量遮蔽
/*7
fn main() {
    let x = 1; 
}

// compiler warning: unused variable: `x`
*/
fn main() {
    let _x = 1; 
}
fn main() {
    let x = 1; 
    println!("The value of x is{}",x);
}
/*8 元组解构
// 修复下面代码的错误并尽可能少的修改
fn main() {
    let (x, y) = (1, 2);
    x += 2;

    assert_eq!(x, 3);
    assert_eq!(y, 2);
}
*/
fn main() {
    let (mut x, y) = (1, 2);
	x+=2;
    assert_eq!(x, 3);
    assert_eq!(y, 2);
}
/*9
fn main() {
    let (x, y);
    (x,..) = (3, 4);
    [.., y] = [1, 2];
    // 填空，让代码工作
    assert_eq!([x,y], __);
} 
*/
fn main() {
    let (x, y);
    (x,..) = (3, 4);
    [.., y] = [1, 2];
    // 填空，让代码工作
    assert_eq!([x,y], [3,2]);
} 
```







