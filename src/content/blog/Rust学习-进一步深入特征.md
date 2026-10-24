---
title: 进一步深入特征
published: '2026-10-13'
description: ''
tags:
  - Rust学习
draft: false
---
#### 关联类型
关联类型是在特征定义的语句块中,声明一个自定义类型,这样就可以在特征的方法签名中使用改类型:
```rust
pub trait Iterator{
	type Item;
	
	fn next(&mut self)->Option<Self::Item>;
}
```
上面是标准库中的迭代器特征`iterator`,有一个`Item`类型,用于代替遍历的值的类型
同时,`next`也返回了以恶个`Item`类型,不过使用`Option`枚举进行了包裹,加入迭代器中的值还是`i32`,那么调用`next`方法就将获取一个`Option<i32>`的值
`Self`用来指代当前调用者的具体类型,那么`Self::Item`用于指代该类型实现中定义的`Item`类型:
```rust
impl Iterator for Counyer{
	type Item = u32;
	
	for next(&mut self)->Option<Self::Item>{
		//
	}
}
fn main(){

	let c = Counter{..}
	c.next()
}
```
我们在上面为`Counter`类型实现了`Iterator`特征,变量`c`是特征`Iterator`的实例,也是`next`方法的调用者.对于`next`而言,`Self`是调用者`c`的具体方法:`Counter`,而`Self::Item`是`Counter`中定义的`Item`类型:`u32`
泛型:
```rust
pub trait Iterator<Item>{
	fn next(&mut self)->Option<Item>;
}
```
使用泛型需要在所有地方都写`Iterator<Item>`,而是用了关联类型,只需要写`Iterator`,增加可读性:
```rust
pub trait Cacheable:Clone+Default+fmt::Debug+Decodable+Encodable{
	type Address:AsREf[u8]+Clone+fmt::Debug+Eq+Hash;
	fn is_null(&self)->bool;
}
```
`Address`的写法远比`AsREf<[u8]>+Clone+fmt::Debug+Eq+Hash`更简单
还有一个例子:
```rust
trait Container<A,B>{
	fn contains(&self,a:A,b:B)->bool;
}
fn difference<A,B,C>(container:&C)->i32
	where
		C:Container<A,B>{...}
```
由于使用泛型,函数头部也必须增加泛型的声明,而是用关联类型,将得到可读性很多的代码:
```rust
trait Container{
	type A;
	type B;
	fn contains(&self,a:&Self::A,b:&Self::B)->bool;
}
fn difference<C:Container>(container:&C){}
```
关联类型还可以被其他特征约束
```rust
trait Container{
	type A:Display;
	type B;
	fn contains(&self,a:&Self::A,&Self::B)->bool;
}
```
### 默认使用泛型参数类型
当使用泛型类型参数时候,可以为其指定一个默认的具体类型,例如标准库中的`std::ops::Add`特征:
```rust
trait Add<RHS=Self>{
	type Output;
	
	fn add(self,rhs:RHS)->Self::Output;
}
```
有一个泛型参数`RHS`,但是这里给`RHS`一个默认值,也就是用户不指定`RHS`时,默认使用2个相同类型的值进行相加,然后返回1个关联类型`Output`
```rust
use std::ops::Add;

#[derive(Debug,PartialEq)]
struct Point{
	x:i32,
	y:i32
}
impl Add for Point{
	type Output = Point;
	fn add(self,other:Point)->Point{
		Point{
			x:self.x+other.x,
			y:self.y+other.y,
		}
	}
}
fn main(){
	assert_eq!(Point{x:1,y:0}+Point{x:2,y:3},
	Point{x:3,y:3});
}
```
上面就是为`Point`提供了`+`的能力,也就是运算符重载,但是rust不支持创建自定义运算符,也无法为所有运算符进行重载,只有定义在`std::ops`中的运算符才能进行重载
下面来创建2个不相同的类型的相加:
```rust
use std::ops::Add

struct Millimeters(u32);
struct Meters(u32);

impl Add<Meters> for Millimeters{
	type Output = Millimeters;
	
	fn add(self,others:Meters)->Millimeters{
		Millimeters(self.0+(other.0*1000))
	}
}
```
这时候就不能再使用默认的`RHS`,否则就成为了`Millimeters+Millimeters`的形式
默认类型主要用于:
- 减少实现的样板代码
- 拓展类型但是无需大幅修改现有的代码
如果在一个复杂类型的基础上,新引入一个泛型类型,可能需要修改很多地方,但是如果新引入的泛型参数有了默认类型,情况就会好很多

#### 调用同名的方法
不同特征拥有同名的方法是很正常的;甚至除了特征上电同名方法外,类型上,也有同名方法
```rust
trait Pilot{
	fn fly(&self);
}
trait Wizard{
	fn fly(&self);
}
struct Human;

impl Pilot for Human{
	fn fly(&self){
		println!("This is your captain speaking.");
	}
}
impl Wizard for Human{
	fn fly(&self){
		println!("Up!");
	}
}
impl Human{
	fn fly(&self){
		println!("*waving arms furiously*");
		}
}
```
这里2个特征`Pilot`和`Wizard`有`fly`方法,实现那两个特征的`Human`单元结构体,也拥有一个同名方法`fly`
##### 优先调用类型上的方法
调用`Human`实例的`fly`时,编译器默认调用该类型中定义的方法:
```rust
fn main(){
	let person = Human;
	person.fly();
}
```
会打印`Human`的`*waving arms furiouslu*`,直接调用类型上定义的方法
##### 调用特征上的方法
调用特征上的方法,需要使用显式调用的语法:
```rust
fn main(){
	let person = Human;
	Pilot::fly(&person);
	Wizard::fly(&person);
	person.fly();
}
```
```
This is your captain speaking.
Up!
*waving arms furiously*
```
显式调用时,编译器就可以根据调用的类型(`self`)决定具体调用什么方法
如果方法没有`self`参数呢?**关联函数**
```rust
trait Animal{
	fn baby_name()->String;
}
struct Dog;
impl Dog{
	fn baby_name()->String{
		String::from("Spot")
	}
}
impl Animal for Dog{
	fn baby_name()->String{
		String::from("puppy")
	}
}
fn main(){
	println!("A baby dog is called a {}",Dog::baby_name());
}
```
`Dog::baby_name()`的调用方式显然不行,可以通过下面来查询其他动物对狗的称呼:
```rust
fn main(){
	println!("A baby dog is called a {}",Animal::baby_name());
}
```
Error:
```
```
`Animal`有很多,需要使用**完全限定语法**
```rust
fn main(){
	println!("A baby dog is called a {}",<Dog as Animal)::baby_name());
	}
```
上面通过`as`关键字,向rust提供了类型注解,就是`Animal`就是`Dog`,而不是其他动物,因此最终会调用`impl Animal for Dog`中的方法
完全限定语法定义:
```rust
<Type as Trait>::function(receiver_if_method,next_arg,...);
```
上面定义中,一个是方法接收器`receiver`(3中`self`),只有方法才拥有,关联函数就没有`receiver`
完全限定语法可以用于任何函数或者方法调用,但是我们却很少用到,rust编译器能根据上下文自动推导出调用的路径,大多数时候,无需使用完全限定语法。只有当存在多个同名函数或方法,rust无法区分调用的目标函数时,该语法才能真正有用武之地
#### 特征定义中的特征约束
有时候我们需要让特征A使用另一个特征B的功能,这种情况下,不仅仅要为类型实现A,还需要为类型实现B，这就是基特征
例如一个特征`OutlinePrint`,有一个方法,能够对当前的实现类型进行格式化输出
```rust
use std::fmt::Display;

trait OutlinePrint:Display{
	fn outline_print(&self){
		let output = self.to_string();
		let len = output.len();
		println!("{}","*".repeat(len+4));
		println!("*{}*"," ".repeat(len+2));
		println!("* {} *",output);
		println!("*{}*"," ".repeat(len+2));
		println!("{}","*".repeat(len+4));
	}
}
```
这里有一个眼熟的语法:`OutlinePrint:Display`,就像之前讲过的**特征约束**,只不过用于特征定义中而不是函数的参数中,是的,某种意义上,和特征约束很类似,都用来说明一个特征需要实现另一个特征,激素hi说需要实现`OutlinePrint`特征,首先需要实现`Display`特征
假如没有这个特征约束,那么`self.to_string`还能调用吗(`to_string`方法会为实现`Display`特征的类型自动实现)?编译器是不愿意的,会报错说当前作用域中找不到用于`&Self`类型的方法`to_string`
```rust
struct Point{
	x:i32,
	y:i32,
}
impl OutlinePrint for Point{}
```
因为`Point`没有实现`Display`特征,Error as:
```
```
OK满足你:
```rust
use std::fmt;

impl fmt::Display for Poinht{
	fn fmt(&self,f:&mut fmt::Formatter)->fmt::Result{
		write!(f,"({},{})",self.x,self.y)	}
}
```
上面代码为`Point`实现了`Display`特征,那么`to_string`方法就会自动实现:最终获得字符串是通过这里的`fmt`获得的
#### 在外部类型上实现外部特征(newtype)
trait中提到了孤儿规则,简而言之,就是特征或者类型必须至少有一个是本地的,才能在该类型上实现特征
使用**newtype**来绕过孤儿规则:为一个tuple struct创建新类型,该元组结构体封装有一个字段,希望实现特征的具体类型
该封装类型是本地的,可以为该类型实现外部的特征:
`newtype`不仅能实现以上的功能,而且在运行时无任何性能损耗,编译期间,该类型会被自动忽略
下面的例子:
有一个动态数组类型:`Vec<T>`,定义在标准库中,还有一个特征`Display`,也定义在标准库中,若是没有`newtype`,我们无法为`Vec<T>`实现`Display`
编译器给了提示:`define and implement a trait or new type instead`,重新定义一个特征,或者使用`new Type`,前者不可行,后者:
```rust
use std::fmt;

struct Wrapper(Vec<String>);

impl fmt::Display for Wrapper{
	fn fmt(&self,f:&mut fmt::Formatter)->fmt::Result{
		write!(f,"[{}]",self.0.join("."))
	}
}
fn main(){
	let w = Wrapper(vec![String::from("hello"),String::from("world")]);
}
```
其中,`struct Wapper(Vec<String>)`就是一个元组结构体,定义了一个newtype`Wrapper`,代码很简单
`new type`的缺点->访问数组的时候,很啰嗦:`self.0.join(",")`:需要先从`Wrapper`中取出数组:`self.0`,然后才能执行`join`方法
类似的,任何数组上的方法,都无法直接调用,需要先用`self.0`取出数组,然后再进行调用
但是rust提供了一个特征叫做`Deref`,实现该特征之后,可以自动座一层类似类型转换的操作,将`Wrapper`变成`Vec<String>`来使用。这样就可以像直接使用数组一样来使用`Wrapper`,而无需为每一个操作都添加上`self.0`
同时,如果不想`Wrapper`暴漏底层数组的所有方法,还可以为`Wrapper`重载这些方法,实现隐藏的目的

**这里没懂**->看视频吧
