---
title: 格式化输出
published: '2026-10-22'
description: ''
tags:
  - Rust学习
draft: false
---
### 满分初印象
先看视频
```rust
println!("Hello");
println!("Hello,{}","world");
println!("The number is {}",1);
println!("{:?}",(3,4));
println!("{} {}",1,2);
println!("{:04}",42); //"0042"with leading zeros
```
可以看见`println!`宏接受的是可变参数,第一个参数是一个字符串常量,表示最终输出字符串的格式,包含形如`{}`的符号是**占位符**,会被`println!`之后的参数一次替代

### `print!`,`println!`,`format!`
rust中用于格式化出的3大金刚
- `print!`将格式化文本输出到标准输出,不带换行符
- `println!`同上,但是在行的末尾
- `format!`将格式化文本输出到`String`字符串
实际中,最常用的是`println!`和`format!`,前者最常用来调试输出,后者常用来生成格式化字符串:
```rust
fn main(){
	let s = "hello";
	println!("{},world",s);
	let s1 = format!("{},world",s);
	print!("{}"，s1);
	print!("{}\n","!");
}
```
其中,`s1`是通过`format`生成的`String`字符串,最终输出为:
```
```
### `eprint!`,`eprintln!`
2大护法,输出到标准错误输出:
```rust
eprintln!("Error:Could not compelete task")
```
仅仅用于输出错误信息和进度信息

### `{}`和`{:?}`
rust选择`{}`作为格式化占位符
和`{}`类似,`{:?}`也是占位符:
- `{}`适用于实现了`std::fmt::Display`特征的类型,用于以优雅友好的方式格式化文本
- `{:?}`适用于实现了`std::fmt::Debug`特征的类型,用于调试场景
选择很简单,调试的时候用`{:?}`,其余场景,用`{}`

### `Debug`特征
事实上,大多数rust类型都实现了`Debug`特征或支持派生该特征:
```rust
#[derive(Debug)]
struct Person{
	name:String.
	age:u8
}
fn main(){
	let i = 3.1415926;
	let s = String::from("hello");
	let v =  vec![1,2,3];
	let p = Person{name:"sunface".to_string(),age:18};
	println!("{:?},{:?},{:?},{:?}",i,s,v,p);
}
```
对于数值,字符串,数组,可以直接使用`{:?}`进行输出,但是对于结构体,需要派生`Debug`特征后,才能进行输出,很简单就是说
### `Display`特征
和大部分类型实现了`Debug`不同,实现了`Display`特征的rust类型并没有那么多,**经常需要我吗自定义想要的格式化方式**
```rust
let i = 3.1415926;
let s = String::from("hello");
let v = vec![1,2,3];
let p = Person{
	name:"sunface".to_string(),
	age:18,
};
println!("{},{},{},{}",i,s,v,p)
```
`v`和`p`都无法通过编译,因为没有实现`Display`特征,但是又不能像**派生Debug**一样派生Display,只能:
- 使用`{:?}`或`{:#?}`
- 为自定义类型实现`Display`特征
- 使用`newtype`为外部类型实现`Display`特征
`{:#?}`
`{:#？}`和`{:?}`几乎一样,区别是能够更优雅的输出内容:
```
// {:?}
[1, 2, 3], Person { name: "sunface", age: 18 }

// {:#?}
[
    1,
    2,
    3,
], Person {
    name: "sunface",
}
```
所以对于`Display`不支持的类型,可以考虑使用`{:#?}`进行格式化,虽然理论上更适合调试输出

### 为自定义类型实现`Display`特征
一个类型定义在当前作用域中,那么可以为其实现`Display`特征,可用于格式化输出:
```rust
struct Person{
	name:String,
	age:u8,
}

use std::fmt;
impl fmt::Display for Person{
	fn fmt(&self,f:&mut fmt::Formattrer)->fmt::Result{
		write!(
			f,
			"Jesus Chirst",
			self.name,self.age
		)
	}
}
fn main(){
	let p = Person{
		name:"sunface".to_string(),
		age:18,
	};
	println!("{}",p);
}
```
只要实现`Display`中的`fmt`方法,即可为自定义结构体`Person`添加自定义输出:
```
```
### 为外部类型实现`Display`特征
rust中,无法直接为外部类型实现外部特征,但是可以使用`newtype`解决:
```rust
struct Array(Vec<i32>)

use std::fmt;
impl fmt::Display for Array{
	fn fmt(&self,f:&mut fmt::Formattrer)->fmt::Result{
		write!(f,"数组是:{:?}",self.0)
	}
}
fn main(){
	let arr = Array(vec![1,2,3]);
	println!("{}",arr);
}
```
`Array`就是我们的`newtype`,将想要格式化输出的`Vec`包裹在内,最后只要为`Array`实现`Display`特征,即可进行格式化输出:
```
```
### 位置参数
除了按照一次顺序使用值取代替占位符之外,还能让指定位置的参数去代替某个占位符,例如`{1}`,表示用第2个参数替代该占位符:
```rust
fn main(){
	println!("{}{}",1,2);
	println!("{1}{0}",1,2);
	// ==> Alice,this is Bob.Bob,this is Alice
	println!("{0},this is {1}.{1},this is {0}",Alice,Bob);
	println!("{1}{}{0}{}",1,2);
}
```
### 具体参数
除了像上面那样指定位置外,还可以为参数指定名称:
```rust
fn main(){
	println!("{argyment}",argument="test");
	println!("{name}{}",1,name=2);
	println!("{a} {c} {b}",a="a",b="b",c="c");
}
```
Notice:**带名称的参数必须放在不带名称的参数的后面**
Error like this:
```
```
### 格式化参数
格式化输出,意味着对输出格式又更多的要求:
```rust
fn main(){
	let v = 3.1415926;
	// Display => 3.14
	println!("{:.2}",v);
	// Debug => 3.14
	printlb!("{:.2?}",v);
}
```
上面只输出小数点后2位,同时还展示了`{}`和`{:?}`的用法
\
下面来看看rust的格式化参数:
#### 宽度
只是输出目标的长度,若长度不够,则进行填充和对齐
##### 字符串子填充
```rust
fn main(){
	
	//x后填充空格,补齐宽度5
	println!("Hello {:5}!","x");
	//使用参数5来指定宽度
	println!("Hello {:1$}!","x"，5);
	//使用x作为占位符输出内容,同时使用5作为宽度
	println!("Hello {1:0$}!",5,"x");
	//使用有名称的参数作为宽度
	println!("Hello {:width$}!","x",width=5);
	
	
	//使用参数5为参数x指定宽度,
	println!("Hello {:1$}!{}","x",5);
}
```

##### 数字填充:符号和0
数字格式化默认也是使用空格进行填充,但是和字符串左对齐不同的是,数字是左对齐
```rust
fn main(){
	// 宽度是5 => Hello     5!
	println!("Hello {:5}!",5);
	// 显式的输出正号 => Hello +5！
	println!("Hello {:+}!",5);
	// 宽度5,使用0进行填充 => Hello 00005!
	println!("Hello {:05}!",5);
	// 负号也要占用一位宽度 => Hello -0005!
	println!("Hello {:05}!",-5);
}
```
##### 对齐
```rust
fn main(){
	//以下全部都会补齐5个字符的长度
	// 左对齐 => Hello x    !
	println!("Hello {:<5}!","x");
	// 右对齐 => Hello     x!
	println!("Hello {:>5}!","x");
	// 居中对齐 => Hello   x  !
	println!("Hello {:^5}!","x");
	
	// 对齐并使用指定符号填充 => Hello x&&&&!
	// 指定符号填充的前提是必须有对齐字符
	println!("Hello {:&<5!}","x");
}
```
##### 精度
精度用于控制浮点数的精度或者字符串的长度
```rust
fn main(){
	let v = 3.1415926;
	// 保留小数点后2位 => 3.14
	println!("{:.2}",v);
	// 带符号保留小数点后2位 => +3.14
	println!("{:+.2}",v);
	// 不带小数 => 3
	println!("{:.0}",v);
	// 通过参数来设定精度 => 3.1416,相当于{:.4}
	println!("{:.1$}",v,4);
	
	let s = "hi我是Jesus";
	println!("{:.3}",s);
	//{:.*}接收两个参数一个是精度,一个是被格式化的值 => Hello abc!
	println!("Hello {:.*}!",3,"abcdefg");
}
```
##### 进制
使用`#`来控制数字的进制输出:
- `#b`,2进制
- `#0`,8进制
- `#x`,小写16进制
- `#X`,大写16进制
- `x`,不带前缀的小写16进制
```rust
fn main(){
	// 2进制 => 0b11011!
	println!("{:#b}!",27);
	
	println!("{:#o}!",27);
	println!("{}!",27)；
	println!("{:#x}!",27);
	println!("{:#X}!",27);
	println!("{:x}!",27);
	
	println!("{:#010b}!",27);
}
```
##### 指数
```rust
fn main(){
	println!("{:2e}",1000000000);
	println!("{:2E}",1000000000);
}
```
##### 指针地址
```rust
let v = vec![1,2,3];
println!("{:p}",v.as_ptr())
```
##### 转义
```rust
fn main(){
	println!("Hello \"{{World}}\"");
	//其中\"转义为",{{转义为{,}}转义为}
	
	//error 因为{}只有一个左括弧
	//println!(“{{Hello}");
	// 也不能使用/来转义{}
	//println!("\{Hello\}");
}
```
### 格式化字符串时捕获环境中的值
之前,要想输出一个函数的返回值,需要:
```rust
fn get_person() -> String{
	String::from("sunface")
}
fn main(){
	let p = get_person();
	println!("Hello,{}!",p);
	println!("Hello,{0}!",p);
	println!("Hello,{person}!",person=p);
}
```
但是个书画字符串一旦长了之后,就会非常冗余:
```rust
fn get_person() -> String{
	String::from("sunface")
}
fn main(){
	let person = get_person();
	println!("Hello,{person}!");
}
```
甚至可以直接将环境中的值用于格式化参数
```rust
let (width,precision) = get_format();
for (name,score) in get_scores(){
	println!("{name}:{score:width$.precision$}");
}
```
但是也有局限性,只能捕获普通的变量,对于更复杂的类型,可以将它赋值给一个变量或者使用之前的`name=expression`形式的格式化参数;