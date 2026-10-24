---
title: 模式匹配
published: '2026-10-24'
description: ''
tags:
  - Rust学习
draft: false
---
### `match`和`if let`
rust中最常用的模式匹配
一个`match`的例子:
```rust
enum Direction{
	East,
	West,
	North,
	South
}
fn main(){
	let dire = Direction::South;
	match dire{
		Direction::East=>Println!("East"),
		Direction::North|Direction::South=>{
			println!("South or North");	
		},
		_=>println!("West")
		};
}
```
Notice:
- `match`的匹配必须穷举出所有可能,一次这里`_`表示未列出来的所有可能性
- `match`的每一个分支都必须是一个表达式,且所有分支的表达式返回的类型必须相同
- X|Y,类似于逻辑或
其实`match`和`switch`十分相似

### `match`匹配
基本格式:
```rust
match target {
    模式1 => 表达式1,
    模式2 => {
        语句1;
        语句2;
        表达式2
    },
    _ => 表达式3
}
```
将模式和target进行匹配,就是模式匹配
`match`允许我们将一个值和一系列的模式相比较,并且根据相匹配的模式执行对应代码:
```rust
enum Coin{
	Penny,
	Nickel,
	Dime,
	Quarter,
}

fn value_in_cents(coin:Coin)->u8{
	match coin{
		Coin::Penny=>{
			println!("Lucky penny!");
			1
		},
		Coin::Nickel=>5,
		Coin::Dime=>10,
		Coin::Quarter=>25,
	}
}

```
`match`后的表达式可以是任何值,只要和后面分支中能对应上
每个分支相关联的代码是一个表达式,而表达式的结果值将作为整个`match`表达式的返回值;如果分支有多行代码,那么就需要用`{}`包裹,同时最后一行代码需要是一行表达式

#### 使用`match`表达式幅值
`match`本身也是一个表达式,可以用于赋值
```rust
enum IpAddr{
	Ipv4,
	Ipv6
}
fn main(){
	let ip1 = IpAddr::Ipv6;
	let ip_str = match ip1{
		IpAddr::Ipv4=>"127.0.0.1",
		_=>"::1",
	};
	
	println!("{}",ip_str);
}
```
#### 模式绑定
从模式中取出绑定的值
```rust
#[derive(Debug)]
enum UsState{
	Alabama,
	Alaska,
}
enum Coin{
	Penny,
	Nickel,
	Dime,
	Quarter(UsState),
}
```
其中`Coin::Quarter`成员还存放了一个值;
下面,我们希望在模式匹配中,获取到25美分硬币上刻印的州的名称:
```rust
fn value_in_cents(coin:Coin)->u8{
	match coin{
		Coin::Penny=>1,
		Coin::Nickel=>5,
		Coin::Dime=>10,
		Coin::Quarter(state)=>{
			println!("State quarter from {:?}!",state);
			25
		},
	}
}
```
上面代码中,在匹配`Coin::Quarter(state)`模式时,将内部存储的值绑定到了`state`变量上,因此`state`变量就是对应的`Usstate`枚举类型
再来看一个更复杂的例子:
```rust
enum Action{
	Say(String),
	MoveTo(i32,i32),
	ChangeColorRGB(u16,u16,u16),
}
fn main(){
	let actions = [
		Action::Say("Hello Rust".to_string()),
		Action::MoveTo(1,2),
		ACtion::ChangeColorRGB(255,255,0),
	];
	for action in actions{
		match action{
			Action::Say(s)=>{
				println!("{}",s);
			},
			Action::MoveTo(x,y)->{
				println!("point from (0,0) move to ({},{}"),x,y);
			},
			Action::ChangeColorRGB(r,g,_)=>{
				println!("change color into'(r:{},g:{},b:0)','b' has been ignored",r,g,);
			}
			}
	}
}
```
和上面的state相同,也是将内部存储的值绑定到(s),(x,y),(r,g,b)上
```
$cargo run
Log:
```
#### 穷尽匹配
`match`的匹配必须穷尽所有情况:
```rust
enum Direction{
	East,
	West,
	North,
	South,
}
fn main(){
	let dire = Direction::South;
	match dire{
		Direction::East => println!("East");
		Direction::North!Direction::South=>{
			println!("South or North");
		},
	};
}
```
Error:
```
```
#### `_`通配符
不想在匹配时列出所有值的时候,可以使用rust提供的一个特殊格式
```rust
let some_u8_value = 0u8;
match some_u8_value{
	1 => println!("one"),
	3 => println!("three"),
	5 => println!("five"),
	7 => println!("seven"),
	_ => (),
}
```
除了`_`,用一个变量来承载其他情况也是可以的:
```rust
#[derive(Debug)]
enum Direction{
	East,
	West,
	North,
	South,
}
fn main(){
	let dire = Direction::South;
	match dire{
		Direction::East => println!("East"),
		other =>println!("other direction:{:?}",other),
	};
}
```
### `if let`匹配
有时候会遇到一个模式的值需要被处理,其他值直接忽略的场景,如果用`match`：
```rust
let v = Some(3u8);
match v{
	Some(3)=>println!("three"),
	_=>(),
	}
```
很冗余对吧
可以用`if let`的方式实现
```rust
if let Some(3)-v{
	println!("three");
}
```
**当需要匹配一个条件时用`if let`,否则用`match`**
### matches!宏
rust提供了一个很实用的宏:`macthes!`,可以将1个表达式和模式进行匹配,然后返回匹配的结果`true`或`false`
```rust
enum MyEnum{
	Foo,
	Bar
}
fn main(){
	let v =vec![MyEnum::Foo,MyEnum::Bar,MyEnum::Foo];
}
```
对`v`进行过滤,只保留值是`MyEnum::Foo`的元素,可以这么写:
```rust
v.iter().filter(|x|x==MyEnum::Foo);
```
Error,因为无法将`x`直接和一个枚举对象进行比较;但是可以用`match`来完成,但是代码很哆嗦,这时候用
```rust
v.iter.filter(|x| macthes!(x,MyEnum::Foo));
```
再看看其他例子:
```rust
let foo = 'f';
assert!(macthes!(foo,'A'..='Z'|'a'..='z'));

let bar = Some(4)
assert!(macthes!(bar,Some(x) if x>2));
```

### 变量遮蔽
`match`和`if let`都是一个新的代码块,而且这里的绑定相当于新变量,如果使用同名变量,会发生变量遮蔽:
```rust
fn main(){
	let age = Some(30);
	println!("匹配前{:?}",age);
	if let Some(age) = age{
		println!("匹配出{}",age);
	}
	println!("匹配后{:?}",age);
}
```
`if let`中,`=`右边的`Some(i32)`类型的`age`被左边的`i32`类型的新`age`遮蔽了,一直持续到`if let`语句块的结束

对于`match`也是如此:
```rust
fn main(){
	let age = Some(30);
	println!("匹配前,age是{:?}",age);
	match age{
		Some(age)=>println!("匹配出的age是{}"，age),
		_=>()
	}
	println!("匹配后,age是{:?}",age);
}
```
`match`中的变量遮蔽并不那么容易看出来,因此需要小心,尽量避免同名
```rust
fn main(){
	let age = Some(30);
	println!("匹配前,age{:?}",age);
	match age{
		Some(x) => println!("匹配中{}",x),
		_=>()
	}
	println!("匹配后,age{:?}",age);
}
```

## 结构Option
```rust
enum Optoin<T>{
	None,
	Some(T),
}
```
>因为`Option`,`Some`,`None`都包含在`prelude`中,因此可以直接通过名称来使用,无需以`Option::Some`形式来使用

### 匹配`Option<T>`
使用`Option<T>`,是为了从`Some`中取得内部的`T`以及处理没有值的情况,下面来编写一个函数,获取一个`Option<i32>`,若其中含有一个值,则加1;若其中没有值,则返回`None`
```rust
fn plus_one(x:Option<i32>)=>Option<i32>{
	match x{
		None=>None,
		Some(i)=>Some(i+1),
	}
}
let five = Some(5);
let six = plus_one(five);
let none = plus_one(None)
```

## 模式使用场景
模式一般由:
- 字面值
- 解构的数组,枚举,结构体或者元组
- 变量
- 通配符
- 占位符

### 所有可能用到模式的地方
#### match分支
```rust
match VALUE{
	PATTERN => EXPRESSION,
	PATTERN => EXPRESSION,
	PATTERN => EXPRESSION,
}
```
`match`上每一个分支就是一个模式,因为`match`是穷尽式的,所以我们总需要1个特殊的模式`_`,匹配剩余的所有情况:
```rust
match VALUE{
	PATTERN => EXPRESSION,
	PATTREN => EXPRESSION,
	_ => EXPRESSION,
}
```
#### if let 分支
```rust
if let PATTERN=SOME_VALUE{
	
}
```
#### while let 条件循环
允许只要模式匹配就一直进行`while`循环:
```rust
let mut stack = Vec::new();'

stack.push(1);
stack.push(2);
stack.push(3);

while let Some(top)=stack.pop(){
	println!("{}",top);
}
```
#### for循环
```rust
let v = vec!['a','b','c'];

for (index,value) in v.iter().enumerate(){
	println!("{} is at index {}",value,index);
}
```
#### Let
也是一种模式匹配
```rust
let PATTERN = EXPRESSION;
```
其中`x`也是一种模式绑定,**将匹配的值绑定到变量x**,因此在rust中,**变量名也是一种模式**
模式匹配会要求两边的类型相同:
```rust
let (x,y) = (1,2,3);
```
Error:
```
```
#### 函数参数
也是模式:
```rust
fn foo(x:i32){
	
}
```
其中`x`就是一个模式,还可以在参数中匹配模式:
```rust
fn print_coordinates(&(x,y):&(i32,i32)){
	println!("Current location:（{},{}}",x,y);
}
fn main(){
	let point = (3,5);
	print_coordinates(&point);
}
```
`&(3,5`会匹配模式,x->3,y->5

#### `let`和`if let`
对于下面代码:
```rust
let Some(x)=some_option_value;
```
会报错,因为右边的值可能不是`Some`而是`None`,这时候就能进行匹配,也就是上面的代码遗漏了`None`的匹配
类似`let`,`for`和`match`都必须要求完全覆盖匹配,才能通过编译
但是对于`if let`,可以这样使用:
```rust
if let Some(x) = some_option_value{
	println!("{}",x);
}
```
因为`if let`允许匹配一种模式,而忽略其余的模式
#### let-else(rust1.65新增)
使用`let-else`匹配,即可使`let`变为可驳模式,可以使用`else`分支来处理模式不匹配的情况,但是`else`分支中必须使用发散的代码块处理
Like this:
```rust
use std::str::FromStr;

fn get_count_item(s:&str)->(u64,&str){
	let mut it = s.split(' ');
	let (Some(count_str),Some(item))=(it.next(),it.next())else{
		panic!("Can't segment count item pair:'{s}'");
	}
	let Ok(count)=u64::from_str(count_str)else{
		panic!("Can't parse integer:'{count_str}'");
	(count,item)
	}；
	// error:'else' clause of 'let..else' does not diverge
	// let Ok(count)=u64::from_str(count_str)else{0};
}
fn main(){
	assert_eq!(get_count_item("3 chars"),(3,"chairs"));
}
```
`let-else`的一个显著特点在于解包成功时所创建的变量具有更广的作用域
```rust
if let Some(x) = some_option_value{
	println!("{}",x);
}
let Some(x) = some_option_value else{return;};
println!("{}",x);
```
上面`if let`写法中的`x`只能在`if`分支中使用,而`if-else`写法中的`x`可以在`let`之外使用

## 全模式列表

### 匹配字面值
```rust
let x = 1;

match x{
	1=>println!("one"),
	2=>println!("two"),
	3=>println!("three"),
	_=>println!("anything"),
}
```
### 匹配命名变量
**匹配命名变量**时会遇到:
```rust
fn main(){
	let x =Some(5);
	let y =10;
	match x{
		Some(50)=>println!("Got 50"),
		Some(y)=>println!("Matched,y={:?}",y,
		_=>println!("Default case,x={:?}",x),
	}
	println!("at the end:x={:?},y={:?}",x,y);
}
```
第2个匹配分支引入了一个新变量`y`,会匹配任何`Some`中的值,因为这里的`y`在`match`表达式的作用域中,而不是之前`main`作用域中,所以是一个新变量,不是开头声明的10。这个新变量`y`绑定会匹配任何`Some`中的值,这里是`x`中的值
### 单分支多模式
在`match`表达式中,可以使用`|`匹配多个模式,表示**或**
```rust
let x = 1;
match x{
	1|2 => println!("one or two");
	3 => println!("three");
	_ => println!("anything")
}
```
### 通过`..=`匹配值的范围
`..=`允许匹配一个闭区间序列内的值,如下代码中,模式匹配任何在序列中的值,该分支会执行:
```rust
let x = 5;
match x{
	1..5=>println!("one through five"),
	_ =>println!("something else."),
}
```
序列只允许用于数字或者字符类型,原因是:可以连续,同时编译器在编译期可以检查该序列是否为空,字符和数字值是rust中仅有的可以用于判断是否为空的类型
下面是1个使用字符类型序列的例子:
```rust
let x ='c';
match x{
	'a'..='f'=>println!("early ASCII letter"),
	'k'..='z'=>println!("late ASCII letter"),
	_ =>println!("something else"),
}
```
#### 解构并分解值
也可以使用模式来解构结构体、枚举、元组、数组和引用
#### 解构结构体
下面展示如何用`let`解构一个含`x`和`y`的结构体`Point`:
```rust
struct Point{
	x:i32,
	y:i32,
}
fn main(){
	let p = Point{x:0,y:7};
	
	let Point {x:a,y:b}=p;
	assert_eq!(0,a);
	assert_eq!(7,b);
}
```
**模式中的变量名不必和解构体中的字段名一致**
因为变量名匹配字段名是常见的,因为`let Point {x:x,y:y}=p;`中`x`和`y`最常见,所以对于匹配结构体字段的模式存在简写:只需要列出结构体字段的名称,则模式创建的变量会有相同的名称。
```rust
struct Point{
	x:i32,
	y:i32,
}
fn main(){
	let p = Point{x:0,y:7};
	let Point{x,y}=p;
	assert_eq!(0,x);
	assert_eq!(7,y);
}
```

有时候不需要为所有的字段创建变量,可以使用字面值作为结构体模式的一部分进行解构:
```rust
# struct Point{
#     x: i32,
#     y: i32,
#}
# 
fn main(){
	let p = Point{x:0,y:7};
	
	match p{
		Point{x,y:0}=>println!("On the x axis at {}",x);
		Point{x:0,y}=>println!("On the y axis at {}",y);
		Point{x,y}=>println!("On neither axis:({},{})",x,y),
	}
}
```
首先是 `match` 第一个分支，指定匹配 `y` 为 `0` 的 `Point`； 然后第二个分支在第一个分支之后，匹配 `y` 不为 `0`，`x` 为 `0` 的 `Point`; 最后一个分支匹配 `x` 不为 `0`，`y` 也不为 `0` 的 `Point`。

#### 解构枚举
```rust
enum Message{
	Quit,
	Move{x:i32,y:i32},
	Write(String),
	ChangeColor(i32,i32,i32),
}
fn main(){
	let msg = Message::ChangeColor(0,160,255);
	
	match msg{
		Message::Quit=>{
			println!("The Quit variant has no data to destructure.")
		}
		Message::Move{x,y}=?{
			println!("Move in the x direction {} and in the y direction {}",x,y);
		}
		Message::Write(text)=>println!("Text message:{}",text),
		Message::ChangeColor(r,g,b)->{
			println!(
			"Change the color to red{},green{},and blue{}",r,g,b
			)
		}
	}
}
```
模式匹配一样需要类型相同,因此匹配`Message::Move{1,2}`这样的枚举值,必须用`Message::Move{x,y}`这样的同类型

对于像`Message::Quit`这样没有任何数据的枚举成员,不能进一步解构,只能匹配字面值`Message::Quit`,因此模式中没有任何变量

### 解构嵌套的结构体和枚举
```rust
enum Color{
	Rgb(i32,i32,i32),
	Hsv(i32,i32,i32),
}
enum Message{
	Quit,
	Move{x:i32,y:i32},
	Write(String),
	ChangeColor(Color),
}
fn main(){
	let msg = Message::ChangeColor(Color::Hsv(0,160,255));
	match msg{
		Message::ChangeColor(Color::Rgb(r,g,b))=>{
			println!(
			"Change the color to red{},green{},and blue{}",r,g,b)
		}
		Message::ChangeColor(Color::Hsv(h,s,v))=>{
			println!(
			"Change the color to hue{},stauration{},and value{}",h,s,v
			)
		}
		_=>()
	}
}
```
### 解构结构体和元组
我们可以用复杂的方式混合、匹配和嵌套解构模式,以下是一个复杂的结构体:
```rust
struct Point{
	x:i32,
	y:i32,
}
let ((feet,inches),Point{x,y})=((3，10),Point{x:3,y:-10});
```
### 解构数组
定长
```rust
let arr;[u16;2]=[114,514];
let [x,y]=arr;

assert_eq!(x,114);
assert_eq!(y,514);
```
不定长
```rust
let arr:&[u16]=&[114,514];

if let [x,...]=arr{
	assert_eq!(x，&114);
}
if let &[..,y]=arr{
	assert_eq!(y,514);
}
let arr:&[u16]=&[]
assert!(matches!(arr,[..]));
assert!(!matches!(arr,[x,..]));
```
### 忽略模式中的值
#### `_`忽略整个值
```rust
fn foo(_:i32,y:i32){
	println!("This code only uses the y parameter:{}",y);
}
fn main(){
	foo(3,4);
}
```

有些时候不需要特定函数参数时,最好修改签名不再包含无用的参数

#### 使用嵌套的`_`忽略部分值
可以在一个模式内使用`_`忽略部分值
```rust
let mut setting_value = Some(5);
let new_setting_value = Some(10);

match (setting_value,new_setting_value){
	(Some(),Some())->{
		println!("Can't overwrite an existing customized value");
	_=>{
		setting_value = new_setting_value;
	}
	}
}
println!("setting is {:?}",setting_value);
```
还可以在一个模式中的多处使用下划线来忽略特定值，如下所示，这里忽略了一个五元元组中的第二和第四个值：

```rust
let numbers = (2, 4, 8, 16, 32);

match numbers {
    (first, _, third, _, fifth) => {
        println!("Some numbers: {}, {}, {}", first, third, fifth)
    },
}
```

#### 使用下划线开头忽略未使用的变量
若是创建了1个变量但是却不在任何地方使用,rust通常会给出警告,因为者可能是个BUG.
希望告诉rust不要警告未使用的变量:
```rust
fn main(){
	let _x = 5;
	let y = 10;
}
```
Notice:`_x`仍会将值绑定到变量,而`_`则完全不会绑定
```rust
let s = Some(String::from("Hello!"));

if let Some(_s)=s{
	println!("found a string");
}
println!("{:?}",s);
```
上面`s`的值会被转移给`_s`
只使用下划线则不会:
```rust
let s = Some(String::from("Hello"));

if let Some(_)=s{
	println!("found a string");
}
println!("{:?}",s);
```
#### 用`..`忽略剩余值
对于有多个部分的值,可以使用`..`来使用部分值而忽略部分值
```rust
struct Point{
	x:i32,
	y:i32,
	z:i32,
}
let origin = Point{x:0,y:0,z:0};

match origin{
	Point{x,..}=>println!("x is {}",x),
}
```
或是忽略中间值
```rust
fn main(){
	let numbers = (2,4,8,16,32);
	
	match numbers{
		(first,..,last)->{
			println!("Some numbers:{},{}",first,last);
		},
	}
}
```
然而使用`..`必须是无歧义的
```rust
fn main(){
	let numbers = (2,4,8,16,32);
	
	match numbers{
		(..,second,..)=>{
			println!("Some numbers:{}",second)
		},
	}
}
```
Error:
```
```
### Match guard
`match guard`是一个位于`match`分支模式之后的额外`if`条件,能为分支模式提供进一步的匹配条件
可以使用模式中创建的变量:
```rust
let num = Some(4);

match num{
	Some(x) if x<5 => println!("less than five:{}",x),
	Some(x)=> println!("{}",x);
	None => (),
}
```

`match`表达式的模式种新建了一个变量而不是使用`match`之外的同名变量,内部变量覆盖了外部变量,意味着此时不能够使用外部变量的值,下面的代码展示了如何用匹配守卫修复:
```rust
fn main(){
	let x = Some(5);
	let y = 10;
	
	match x{
		Some(50)=>println!("Got 50")，
		Some(n) if n==y =>println!("Matched,n=={}",n),
		_=>println!("Default case,x={:?}",x),
	}
	println!("at the end:x={:?},y={}",x,y);
}
```
这里新建一个n,然后match guardn\==y,这里的`y`是外部的`y`,并不是新建的
也可以在match guard种使用**或**`|`来指定多个模式,**同时匹配守卫的条件会作用于所有的模式**
```rust
let x = 4;
let y = false;
match x{
	4|5|6 if y => println!("yes"),
	_ => println!("no"),
}
```
`|`的优先级高于match guard,在满足 `x` 属于 `4 | 5 | 6` 后才会判断 `y` 是否为 `true`
### @绑定
@at允许为一个字段绑定另一个变量
下面,希望测试`Message::Hello`的`id`字段是否位于`3..=7`内,同时也将其值绑定到`id_variable`变量中以便此分支中相关的代码可以使用,也可以将`id_variable`命名为`id`,和字段相同
```rust
enum Message{
	Hello{id:i32},
}

let msg = Message:Hello{id:5};

match msg{
	Message::Hello{id:id_variable @ 3..=7}=>{
		println!("Found an id in range:{}",id_variable)
	},
	Message::Hello{id:10..=12}=>{
		println!("Found an id in another range")
	},
	Message::Hello{id}=>{
		println!("Found some other id:{}",id)
	},
}
```
上例会打印出 `Found an id in range: 5`
分支1执行;分支2只在模式中指定了一个范围,但是这个模式的代码,并不知情也不能使用`id`的值
当及想要限定分支的范围,又想要使用分支的变量时,就可以用`@`来绑定到一个新的变量上,实现想要的功能
#### @前绑定后解构
使用`@`可以在绑定新变量的同时,对目标进行解构:
```rust
#[derive(Debug)]
struct Point{
	x:i32,
	y:i32,
}
fn main(){

	let p @ Point{x:px,y:py}=Point{x:10,y:23};
	if let p @ Point{x:10,y}=point{
		println!("x is 10 and y is {} in {:?}",y,p);
	}else{
		println!("x was not 10:(");
	}
}
```