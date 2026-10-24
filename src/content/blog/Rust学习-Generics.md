---
title: Generics
published: '2026-10-10'
description: ''
tags:
  - Rust学习
draft: false
---
用统一功能的函数处理不同类型的数据,在不支持泛型的语言当中,通常需要为每一种类型编写一个函数：
```rust
fn add_18(a:i8,b:i8)->i8{
	a+b
}
fn add_12(a:i32,b:i32)->i32{
	a+b
}
fn add_f64(a:f64,b:f64)->f64{
	a+b
}
fn main() {
    println!("add i8: {}", add_i8(2i8, 3i8));
    println!("add i32: {}", add_i32(20, 30));
    println!("add f64: {}", add_f64(1.23, 1.23));
}
```
相当的哆嗦
**多态**:
>通俗的讲，多态就是好比坦克的炮管，既可以发射普通弹药，也可以发射制导炮弹（导弹），也可以发射贫铀穿甲弹，甚至发射子母弹，没有必要为每一种炮弹都在坦克上分别安装一个专用炮管，即使生产商愿意，炮手也不愿意，累死人啊。所以在编程开发中，我们也需要这样“通用的炮管”，这个“通用的炮管”就是多态。

实际上,泛型就是一种多态:
```rust
fn add<T>(a:T,b:T)->T{
	a+b
}
fn main(){
	println!("add i8: {}", add(2i8, 3i8));
    println!("add i32: {}", add(20, 30));
    println!("add f64: {}", add(1.23, 1.23));
	
}
```
### 泛型讲解
上面代码中的`<T>`就是**泛型参数**,rust中,泛型参数的名称可以随便起,但是我们一般用`T`作为首选(`T`是`type`的首字母)
使用泛型参数有一个先决条件:必须在使用前进行声明:
```rust
fn largest<T>(list:&[T])->T
```
从列表中找到最大的值,其中列表中的元素类型是T,`largest<T>`对`T`进行了声明,然后踩在函数参数中使用该泛型参数`list:&[T]`
`largest`有泛型类型`T`,有参数`list`,其元素是类型为`T`的数组切片,最后返回的类型也是`T`
1个错误示例:
```rust
fn largest<T>(list:&[T])->T{
	let mut largest = list[0];
	
	for &item in list.iter(){
		if item > largest{
			largest = item;
		}
	}
}
fn main(){
	let number_list = vec![34,50,25,100,65];
	
	let result = largest(&number_list);
	println!("The latgest number is {}",result);
	
	let char_list = vec!['y','m','a','f'];
	
	let result = largest(&char_list);
	println!("The largest char is {}",result);
	
}
```
Error
对于上面的错误,编译器建议我们对`T`添加一个类型限制,使用`std::cmp::PartialOrd`特征对`T`进行限制,该特征就是为了让类型**实现可比较的功能**
同样的,最开始的`add`也会error,如果运行会得到error:
```
```
不是所有的`T`都可以相加,需要用`std::ops::Add<Output=T>`对`T`进行限制:
```rust
fn add<T:std::ops::Add<Output=T>>(a:T,b:T){
	a+b
}
```
#### 显式的指定泛型的类型参数
有时候,编译器无法推断你想要的泛型参数
```rust
use std::fmt::Display

fn create_and_print<T>() where T:From<i32>+Display{
	let a:T=100.into(); //创建了类型为T的变量,初始值由100转换而来
	println!("a is{}",a);
}

fn main()
{
	create_and_print();
}

```
Error:
```
```
好心的编译器让我们:显式指定类型`create_and_print::<T>()`
于是我们修改代码
```rust
use std::fmt::Diplay

fn create_and_point<T>() where T:From<i32>+Display{
	let a:T = 100.into();
	println!("a is {}",a);
}
fn main(){
	create_and_point::<i64>();
}
```
#### 结构体中使用泛型
```rust
struct Point<T>{
	x:T,
	y:T,
}
fn main(){
	let integer = Point{x:5,y:10};
	let float = Pont{x:1.0,y:4.0};
}
```
Notice:
- 提前声明,和泛型函数定义类似,首先我们在使用泛型参数之前必须进行声明`Pony<T>`
- **x和y是相同的类型**
```rust
struct Point<T>
{
	x:T,
	y:T,
}
fn main(){
	let p = Point{x:1,y:1.1};
}
```
Error：
```
```
如过想让`x``y`既能够类型相同,又能够类型不同,就需要使用不同的泛型参数:
```rust
struct Point<T,U>{
	x:T,
	y:U,
}
fn main(){
	let p = Point{x:1,y:1.1};
}
```
#### 枚举中使用泛型
`Option`应该是枚举中第一杯想起来的
```rust
enum Option<T>{
	Some<T>,
	None,
}
```
`Option<T>`是1个具有泛型`T`的枚举类型,第一个成员是`Some<T>`,存放了一个类型为`T`的值;我们可以在任何一个需要返回值的函数中国,取使用`Option<T>`取作为返回值,用于返回一个任意类型的`Some<T>`,或者没有值`None`
`Result`->卧龙凤雏,得1可安天下
```rust
enum Result<T,E>{
	Ok(T),
	Error(E),
}
```
这个枚举也主要用于函数返回值
>如果函数正常运行，则最后返回一个 `Ok(T)`，`T` 是函数具体的返回值类型，如果函数异常运行，则返回一个 `Err(E)`，`E` 是错误类型。例如打开一个文件：如果成功打开文件，则返回 `Ok(std::fs::File)`，因此 `T` 对应的是 `std::fs::File` 类型；而当打开文件时出现问题时，返回 `Err(std::io::Error)`，`E` 对应的就是 `std::io::Error` 类型。

#### 方法中使用泛型
方法中使用泛型:
```rust
struct Point<T>{
	x:T,
	y:T
}
impl<T> Point<T>{
	fn x(&self)->&T{
		&self.x
	}
}
fn main(){
	let p = Point{x:5,y:10};
	
	println!("p.x={}",p.x());
}
```
依旧提前声明`impl<T>`,这里的`Point<T>`不再是声明,而是一个完整的结构体类型
我们还能在该结构体的方法中定义额外的泛型参数:
```rust
struct Poiunt<T,U>{
	x:T,
	y:U,
}
impl <T,U> Point<T,U>{
	fn mixip<V,W>(self,other:Point<V,W>)->Point<T,W>{
		Point{
			x:self.x,
			y:self.y,
		}
	}
}
fn main(){
	let p1 = Point{x:5,y:10.4};
	let p2 = Point{x:"Hello",y:'c'};
	let p3 = p1.mixup(p2);
	
	println!("p3.x = {},p3.y= {}",p3.x,p3.y);
}
```
其中,`<V,W>`是`Point`上的泛型参数,`V,W`是单独定义在`mixup`上的泛型参数
##### 为具体的泛型类型实现方法
对于`Point<T>`类型,不仅能定义基于`T`的方法,还能针对特定的具体类型,进行方法定义:
```rust
impl Point<f32>{
	fn distance_from_origin(&self)->f32{
		(self.x.powi(2)+self.y.powi(2)).sqrt()
	}
}
```
这里意味着`Point<f32>`类型会有1个方法`distance_from_origin`,但是其他`T`不是`f32`类型的`Point<T>`实例则没有定义此方法,使用了只能用于浮点型的数学运算符号
#### const泛型
有没有针对值的泛型?
之前我们有提到,`[i32;2]`和`[i32;3]`是不同的数组类型:
之前我们有提到`[i32;3]`和`[i32;2]`是不同的数组类型
```rust
fn display_array(arr:[i32;3]){
	println!("{:?}",arr);
}
fn main(){
	let arr:[i32;3]=[1,2,3];
	display_array(arr);
	
	let arr:[i32;2]=[1,2];
	display_arr(arr);
}
```
Error:
```
```
我们来修改代码:
```rust
fn display_array(arr:&[i32]){
	println!("{:?}",arr);
}
fn main(){
	let arr:[i32;3]=[1,2,3];
	display_array(&arr);
	
	let arr:[i32;2]=[1,2];
	display_arr(&arr);
}
```
很简单,只需要使用数组切片,然后传入`arr`的不可变引用即可;
接着,我们将`i32`改为所有类型的数组
```rust
fn display_array<T:std::fmt::Debug>(arr:&[T]){
	println!("{:?}",arr);
}
fn main(){
	let arr:[i32;3]=[1,2,3];
	display_array(&arr);
	
	let arr:[i32;2]=[1,2];
	display_arr(&arr);
}
```
我们只需要给`T`加一个限制`std::fmt::Debug`,表明`T`可以用在`println!("{:?}",arr)`中,因为`{:?}`形式的格式化输出需要`arr`实现改特征
之前rust的一些数组库,在使用的时候限定长度不超过32->因为会为每个长度单独实现一个函数
现在我们有了const泛型,也就是针对值的泛型,可以用于处理数组长度的问题:
```rust
fn display_array<T:std::fmt::Debug,const N:usize>(arr:[T;N]){
	println!("{:?}",arr);
}
fn main(){
	let arr:[i32;3]=[1,2,3];
	display_array(&arr);
	
	let arr:[i32;2]=[1,2];
	display_arr(&arr);
}
```
如上,我们定义了一个类型为`[T;N]`的数组,其中`T`是一个基于类型的泛型参数,`N`是一个基于值的泛型参数。
#### const泛型表达式
假设我们需要在一个内存很小的平台上工作,因此需要限制函数参数占用的内存大小,使用const泛型表达式来实现
```rust
#![allow(incomplete_features)]
#![feature(generic_const_exprs)]

fn something<T>(val:T){
where
	Assert<{core::mem::size_of::<T>()<768}>:isTrue,
    //       ^-----------------------------^ 这里是一个 const 表达式，换成其它的 const 表达式也可以
{
    //
}
}
fn main(){
	something([0u8;0]);
	something([0u8;512]);
	something([0u8;1024]);
}
pub enum Assert<const CHECK:bool>{
	//
}
pub trait IsTrue{
	//
}
impl IsTrue for Arrert<true>{
	//
}
```
#### const fn
我们要提及1个和它密切相关的强大的特性:`const fn`
**为什么需要const fn**
通常情况下,函数是在运行时被调用和执行的。然而,在某些场景下,我们希望在编译器就计算出一些值
*有了`const fn`,我们可以在编译器执行这些函数,,从而将计算结果直接嵌入到生成的代码中,不仅提高了运行的性能,还使得代码更加简介安全*
定义一个常量函数,只需要在函数声明上加上`const`关键字:
基本用法:
```rust
const fn add(a:usize,b:usize)->usize{
	a+b
}
const RESULT:usize = add(5,10);

fn main(){
	println!("The result is:{}",RESULT);
}
```
限制:
由于在编译期间执行,为了确保函数能够在编译期间被安全的求值,因此有一些限制,不可以将随机数生成器携程`const fn`
如果我们在极端的情况下进行复杂的浮点运算,可能会得到不同结果,因此不建议使`数组长度(arr.len)`和`Enum判别式`依赖于浮点运算
##### const fn和const 泛型结合,实现更加灵活和高效的代码设计
```rust
struct Buffer<const N:usize>{
	data:[u8;N],
}
const fn compute_buffer_size(factor:usize)->usize{
	factor*1024
}
fn main(){
	const SIZE:usize = compute_buffer_size(4);
	let buffer = Buffer::<SIZE>{
		data:[0;SIZE];
	};
	println!("Buffer size:{} bytes",buffer.data.len());
}
```
在这个例子中`compute_buffer_size`是一个常量函数,我们用`compute_buffer_size`来计算缓冲区大小为4096bytes,并假期作为泛型参数传给`Buffer`->这样缓冲区的大小在编译器就被确定下来了,避免了运行的计算开销
#### 泛型的性能
我们在rust上收获了性能;但是鱼与熊掌不可得兼,rust在编译期间为泛型对应的多个类型,生成格子的代码,因此损失了编译速度增大了最终生成文件的大小。
rust在编译期进行泛型代码的**单态化**来保证效率,是一个通过填充编译时使用的具体类型,将通用diamagnetic祝你华为特定代码的过程
编译器所做的工作和我们创建泛型函数的步骤相反,寻找所有泛型代码被调用的位置并针对具体的类型生成代码
看看1个标准库中的例子:
```rust
let integer = Some(5);
let float = Some(5.0);
```
rust编译这些代码时候,会进行单态化,编译器会读取传递给`Option<T>`的值并发现有2种`Option<T>`:一种对应`i32`一种对应`f64`,将`Option<T>`展开为`Option_i32`和`Option_f64`
编译器生成的单态化像这样:
```rust
enum Option_i32{
	Some(i32),
	None
}
enum Option_f64{
	Some(f64),
	None
}
fn main(){
	let integer = Option_i32::Some(5);
	let float = Option_f64::Some(5.0);
}
```
我们可以在使用泛型来编写不重复的代码,rust会为每一个实例编译其特性类型的代码,意味着使用泛型时没有运行时开销;代码运行,执行效率好像手写每个具体定义的重复代码一样,这正是rust的泛型运行时及其高效的原因
