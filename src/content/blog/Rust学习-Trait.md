---
title: Trait
published: '2026-10-11'
description: ''
tags:
  - Rust学习
draft: false
---
如果我们要定义一个文件系统,那么将改系统和底层存储解耦是很重要的;主要包括4个:`open`,`write`,`read`,`close`,这些操作可以发生在硬盘或者内存......;但是要是为每一种情况都实现一套代码,那么这种实现
使用rust中的`trait`特征;
在之前的代码中,也是见过特征的使用,`#[derive(Debug)]`,在我们定义的类型`struct`上自动派生`Debug`特征,接着继续使用`println!("{:?}",x)`打印,如:
```rust
fn add<T:std::ops::Add<Output=T>>(a:T,b:T)->T{
	a+b
}
```
通过`std::ops::Add`特征来限制`T`,只有实现了`std::ops::add`才能进行合法的加法操作
#### 定义特征
若不同的类型有相同的行为,那么我们就可以定义一个特征,然后为这些类型实现该特征,**定义特征**是吧一些方法组合在一起,定义一个实现某些目标所必须的行为的集合
例如,我们有文章`Post`和`Weibo`2中内容载体,我们想对对应的内容进行总结,总结这个行为就是共享的,因此可以用特征定义:
```rust
pub trait Summary{
	fn summarize(&self)->String;
}
```
这里使用`trait`声明1个特征,`Summary`是特征名,大括弧中定义了该特征的所有方法,这个例子是:`fn summarize(&self)->String`
特征无法定义行为具体是怎么样的,因此,我们只定义特征方法的签名,而不进行实现,此时方法签名的结尾是`;`,而不是`{}`
接下来,每一个实现这个特征的类型都需要具体实现该特征的相应方法,编译器也会确保任何实现`Summary`特征的类型都拥有和这个签名的定义完全一致的`summarize`方法
#### 为类型实现特征
首先来为`Post`和`Weibo`实现`Summary`
```rust
pub trait Summary{
	fn summarize(&self)->String;
}
pub struct Post{
	pub title:String,
	pub author:String,
	pub content:String
}
impl Summary for Post{
	fn summarize(&self)->String{
		format!("文章{},作者是{}",self.title,self.author)
	}
}
pub struct Weibo{
	pub username:String,
	pub content:String
}
impl Summary for Weibo{
	fn summarize(&self)->String{
		format!("{}发表了微博",self.username,self.content)
	}
}
```
实现特征的语法和结构体和枚举的方法很像,`impl Summary for Post`,读作为`Post`类型实现`Summary`特征,然后在`impl`的花括号中实现该特征的具体方法
```rust
fn main(){
	let post = Post{title:"Rust语言简介".to_string(),author:"Sunface".to_string(),content:"Rust Nice!!!".to_string()}
	let weibo = Weibo{username:"sunface".to_string(),content:"微博没tweet好用".to_string()};
	println!("{}",post.summarize());
	println!("{}",weibo.summarize());
}
```
下面来看看`trait`真正的威力:
#### 特征定义和实现的位置(孤儿规则)
上面将`Summary`定义为了`pub`的,这样他人想要使用我们的`Summary`特征,则可以引入到它们的包中,然后再实现
关于特征实现和定义的位置,有一条规则:**如果想要为`A`实现特征`T`,那么`A`或者`T`至少有一个是在当前作用域中定义的**,例如我们可以为`Post`类型实现标准库中的`Display`特征,这是因为`Post`类型定义在当前的作用域中;同时,我们也可以在当前包中为`String`类型实现`Summary`特征,因为`Summary`定义在当前作用域中
但是无法在当前作用域中,为`String`实现`Display`特征,因为它们都定义在标准库中,定义所在的位置都不在当前作用域:)
这就是**孤儿规则**,确保其他人编写的代码不会破坏你的代码,也确保了你不会莫名其妙的破坏别人的代码
#### 默认实现
```rust
pub trait Summary{
	fn summarizze(&self)->String{
		String::from("(Read more...)")
	}
}
```
上面为`String`定义了一个默认实现
这样其他类型无需再实现该方法,也可以选择重写该方法:
```rust
pub trait Summary{
	fn summarize(&self)->String{
		String::from("(Read more...)")
	}
}
```
下面我们来编写代码测试:
```rust
impl Summary for Post{}

impl Summary for Weibo{
	fn summarize(&self)->String{
		format!("{}发表了微博{}",self.username,self.content)
	}
}
```
`Post`选择了默认实现,`Weibo`重写了方法,
```rust
println!("{}",post.summarize());
println!("{}",weibo.summarize());
```
默认实现允许调用相同特征中的其他方法,即便这些方法没有默认实现;特征可以提供很多有用的功能而只需要指定一小部分内容,如:可以定义`Summary`特征,使其具有一个需要实现的`summarize_author`方法,然后定义一个`summarize`方法,此方法的默认实现调用`summarize_author`方法:
```rust
pub trait Summary{
	fn summarize_author(&self)->String;
	
	fn summarize(&self)->String{
		format!("(Read more from {}...",self.summarize_author())})
	}
}
```
为了使用`Summary`,只需要实现`summarize_author`方法即可:
```rust
impl Summary for Weibo{
	fn summarize_author(&self)->String{
		format!("@{}",self.username)
	}
}
println!("1 new weibo:{}",weibo.summarize());
```
`weibo.summarize()`会调用`Summary`特征默认实现的`summarize`方法,通过该方法进而调用`Weibo`为`Summary`实现的`summarize_author`方法,最终输出:
`1 new weibo:(Read more from @horse_ebooks...)`
#### 使用特征作为函数参数
之前提到,特征若仅仅只是用来实现方法,
现在,先来定义一个函数,使用特征作为函数参数:
```rust
pub fn notify(item:&impl Summary){
	println!("Breaking news!{}",item.summarize())
}
```
`impl Summary`,意思是,实现了`summary`特征的`item`参数
现在可以使用任何实现了`Summary`特征的类型作为该函数的类型,通过在函数体内,还可以调用该特征的方法,例如`summarize`方法。具体地说,就是我们可以传递`Post`和`Weibo`的实例来作为参数,而其他例如`String`或者`i32`的类型则不能用作该函数的参数,因为没有实现`Summary`特征
#### 特征约束(trait bound)
虽然`impl Trait`这种好理解,但是实际上只是一个语法糖
```rust
pub fn notify<T:Summary>(item:&T){
	println!("Breaking news!{}",item.summarize());
}
```
真正的完整书写形式要和上面一样,形如`T:Summary`称之为**特征约束**
简单的场景下`impl Trait`这种语法糖就足够使用,但是对于复杂的场景,特征约束可以给我们更大的灵活性和语法表现能力,例如一个函数接收2个`impl Summary`的参数:
```rust
pub fn notify(item1:&impl Summary,item2:&impl Summary){}
```
如果函数2个参数是不同的参数,只要这2个类型都实现了`Summary`特征即可。如果我们想要强制函数的2个参数是同一个类型呢?
```rust
pub fn notify<T:Summary>(item1:&T,item2:&T){}
```
泛型类型`T`说明了`item1`和`item2`具有同样的类型,但是`T:Summary`说明了`T`必须实现`Summary`特征
##### 多重约束
除了单个约束条件,我们还可以指定多个约束条件,例如除了让参数实现`Summary`特征外,还可以让参数实现`Display`特征以控制格式化输出:
```rust
pub fn notify(item:&(impl Summary+Display)){}
```
除了上述的语法糖形式,还能使用特征约束形式:
```rust
pub fn notify<T:Summary+Display>(item:&T){}
```
通过这2个特征,就可以使用`item.summarize`方法,以及通过`println!("{}",item)`来格式化输出`item`
##### Where约束
当特征约束变得很多时,函数的签名就会变得复杂:
```rust
fn some_function<T:Display+Clone,U:Clone+Debug>(t:&T,u:&U)->i32{}
```
严格而言,上面的例子不够复杂,但是还是能对其做一些形式上的改进,通过`where`
```rust
fn some_function<T,U>(t:&T,u:&U)->i32
	where T:Display+Clone,
		U:Clone+Debug
		{}
```
##### 使用特征约束有条件的实现方法或特征
特征约束,可以让我们再指定类型+指定特征的条件下实现方法,如:
```rust
use std::fmt::Display;

struct Pair<T>{
	x:T,
	y:T,
}
impl<T>Pair<T>{
	fn new(x:T,y:T)->Self{
		Self{
			x,
			y,
		}
	}
}
impl<T:Display+PatialOrd>Pair<T>{
	fn cmp_display(&self){
		if self.x>self.y{
			println!("The largest member is x = {}",self.x);
		}else{
			println!("The largest member is y = {}",self.y);
		}
	}
}
```
`cmp_display`方法,并不是所有的`Pair<T>`结构体对象都可以拥有,只有`T`同时实现了`Display+PartialOrd`的`Pair<T>`才可以拥有该方法。**该函数的可读性更好**
**也可以有条件的实现特征**,标准库为任何实现了`Display`特征的类型实现了`ToString`特征:
```rust
impl<T:Display>ToString for T{
	// --snip--
}
```
我们可以对任何实现了`Display`特征的类型调用由`ToString`定义的`to_string`方法,可以将整形转换为对应的`String`值,因为整形转换实现了`Display`
```rust
let s = 3.to_string();
```
#### 函数返回中的`impl Trait`
可以通过`impl Trait`说明1个函数返回了一个函数,该类型实现了某个特征:
```rust
fn return_summarizable()->impl Summary{
	Weibo{
		username:String::from("sunface"),
		content:String::from(
			"m1 max太厉害,电脑再也不会卡",
		)		
	}
}
```
因为`Weibo`实现了`Summary`,因此这里可以来作为返回值。要注意的是,虽然是以恶个`Weibo`类型,但是对于`returns_summarizable`的调用者而言,只知道返回了一个实现`Summary`特征的对象,但是并不知道返回了一个`Weibo`类型
这种`impl Trait`形式的返回值,在一个场景下都很有用,那就是返回的真实类型很复杂,不知道该怎么声明的时候(Rust要求你标出所有的类型),此时就可以用`impl Trait`的方式简单返回。
但是这种返回的限制:只能有1个具体的类型,如:
```rust
fn returns_summarizable(switch:bool)->impl Summary{
	if switch{
		Post{
			title:String::from(
				"Penguins win the Stanley Cup Championship!",
			),
			author:String::from("Iceburgh")，
			content:String::from(
				"The Pittsburgh Penguins once again are the best \
				hockey team in the NHL."
			),
		}
	}else{
		Weibo{
			username:String::from("horse_ebooks"),
			content:String:from(
				"of course,as you probably already know,people",
			),
		}
	}
}
```
Error:
```
```
以上的代码就无法通过编译,因为返回了2个不同的类型`Post`和`Weibo`
下面对上一节的一个错误进行纠正:
```

```
在`largest`函数中我们想要使用`>`来比较2个`T`类型的值,这个运算符是标准库中特征`std::cmp::PartialOrd`的1个默认方法,所以需要在`T`的特征约束中指定`PartitalOrd`,这样`largest`函数可以用于内部元素类型可以比较大小的数组切片
由于`PartialOrd`位于`prelude`中所以不需要通过`std::cmp`手动将其引入作用域,所以可以将`largest`的签名修改:
```rust
fn largest<T:PartialOrd>(list:&[T])->T{}
```
但是此时编译,会有新的错误
```
```
`cannot move out of type [T],a non-copy slice`,原因是`T`没有实现`copy`特性,因此我们只能进行所有权转移,毕竟只有`i32`此实现了`Copy`特性,而`T`可以指代任何类型(实现了`PartialOrd`的所有方法)
为了让`T`有`Copy`特性:
```rust
fn largest<T:PartitalOrd+Copy>(list:&[T])->T{
	let mut largest = list[0];
	
	for &item in list.iter(){
		if item>largest{
			largest = item;
		}
	}
	largest
}
fn main(){
	let number_list = vec![34,50,25,100,65];
	let result = largest(&number_list);
	println!("The largest number is {}",result);
	
	let char_list = vec!['y','m','a','q'];
	
	let result = largest(&char_list);
	println!("The largest char is {}",result);
}
```
如果不希望限制`largest`函数只能用于`Copy`特征的类型,我们可以在`T`的特征约束中,指定`Clone`而不是`Copy`,并克隆`list`中每一个值使得`largest`函数拥有其所有权,使用`clone`函数意味着对于类似`String`这样对上数据的类型,会潜在的分配更多堆上空间,而堆分配在设计大量数据时会相当缓慢
**另一种`largest`的实现方式是在返回在`list`中`T`值的引用,如果我们将函数返回值从`T`改为`&T`并改变函数体使其能够返回1个引用,我们将不需要任何`Clone`或者`Copy`的特征约束而且也不会有任何的堆分配。**
试试这种方法:
```
```
#### 通过`derive`派生特征
之前形如`[derive(Debug)]`的代码已经出现了很多次,这是一种**特征派生语法**,被`derive`标记的对象会自动实现对应的默认特征代码,继承相应的功能
例如`Debug`代码,有一套自动实现的默认代码,当给了一个结构体标记之后,就可以使用`println!("{:?}",s)`的形式打印改结构体的对象
如`Copy`特征,也有一套自动实现的默认代码,当标记到一个类型上,可以让这个类型实现`Copy`特征,进而可以调用`copy`方法,进行自我复制
总之,`derive`派生出来的是rust默认给我们提供的特征,开发过程中极大的简化了自己动手实现相应特征的需求,当然也可以自动重写该实现
#### 调用方法需要引入标签
一些场景中,使用`as`关键字做类型准换有比较大的限制,要想在类型转换上有完全的控制,需要用`TryInto`:
```rust
use std::comvert::TryInto

fn main(){
	let a:i32 = 10;
	let b:i32 = 100;
	
	let b_ = n.try_into()
			  .unwrap();
	let a<b_{
		println!("Ten is less than one hundred");
	}
}
```
上面代码引入了`std::convert::TryInto`特征,但是却没有使用,主要原因在于**如果需要使用一个特征的代码,需要将该特征引入当前的作用域中**,我们在上面用到了`try_into`方法,需要引入对应的特征。
rust还提供了一个非常便利的方法,即吧最常用的标准库中的特征通过`std::prelude`模块提前引入当前的作用域,其中包括了`std::convert::TryInto`,可以尝试删除第一行的代码`use...`,
#### 几个综合的例子:
##### 为自定义类型实现`+`操作
rust中除了数值类型的加法,`String`也可以做加法,因为rust为该类型实现了`std::ops::Add`特征,同理,如果我们为自定义类型实现该特征,那么就可以自己实现`Point1+Point2`的操作
```rust
use std::ops::Add

#[deirve[Debug]]
struct Point<T:Add<T,Output=T>>{
	x:T,
	y:T,
}
impl<T:add<T,Output-T>>Add for Point<T>{
	type Output = Point<T>;
	
	fn add(self,p:Point<T>)=>Point<T>{
		Point{
			x:self.x+p.x,
			y:self.x+p.y,
		}
	}
}

fn add<T:Add<T,Output=T>>(a:T,b:T)->T{
	a+b
}
fn main(){
	let p1 = Point{x:1.1f32,y:1.1f32};
	let p2 = Point{x:2.1f32,y:2.1f32};
	println!("{:?}",add(p1,p2));
	
	let p3 = Point{x:1i32,y:1i32};
	let p4 = Point{x:2i32,y:2i32};
	println!("{:?}",add(p3,p4));
}
```
##### 自定义类型的打印输出
开发过程中,往往只需要使用`#[derive(Debug)]`对我们的自定义类型进行标注,即可打印输出的功能:
```rust
#[derive(Debug)]
struct Point{
	x:i32,
	y:i32,
}
fn main(){
	let p = Point{x:3,y:3};
	println!("{:?}",p)
}
```
但是往往在实践当中,需要对我们自定义类型进行个书画输出,让用户更好的阅读理解我们的类型,此时就需要实现`std::fmt::Display`
```rust
#![allow(dead_code)]

use std::fmt;
use std::fmt::{Display};

#[derive(Debug,PartialEq)]
enum FileState{
	Open,
	Closed,
}
#[derive(Debug)]
struct File{
	name:String,
	data:Vec<u8>,
	state:FileState,
}

impl Display for FileState{
	fn fmt(&self,f:&mut fmt::Formatter)->fmt::Result{
		match*self{
			FileState::Open=>write!(f,"OPEN")，
			FileState::Closed=>write!(f,"CLOSED")，
		}
	}
}
impl Display for File{
	fn fmt(&self,f:&mut fmt::Formatter)->fmt::Result{
		write!(f,"<{}({})>",self.name,self.state)
	}
}
impl File{
	fn new(name:&str)->File{
		File{
			name:String::from(name),
			data:Vec::new(),
			state:FileState::Closed,
		}
	}
}

fn main(){
	ley f6 = File::new("f6.txt");
	
	//...
	println!("{:?}",f6);
	println!("{}",f6);
}
```
