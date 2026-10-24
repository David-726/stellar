---
title: enum
published: '2026-10-08'
description: ''
tags:
  - Rust学习
draft: false
---
```rust
enum PokerSuit{
	Clubs,
	Spades,
	Diamonds,
	Hearts,
}
```
枚举虽好，可不要滥用哦。
这里我们枚举出poker所有的花色可能。
#### 枚举值
```rust
let heart = PokerSuit:Hearts;
let diamond = PokerSuit:Diamonds;
```
通过`::`操作符来访问`PokerSuit`下的具体成员
```rust
fn main(){
	let heart = PokerSuit::Hearts;
	let diamond = PokerSuit::Diamonds;
	
	print_suit(heart);
	print_suit(diamond);
}
fn print_suit(card:PokerSuit){
	// 需要在定义 enum PokerSuit 的上面添加上 #[derive(Debug)]，否则会报 card 没有实现 Debug
	println!("{:?}",card);

```
`print_suit`函数的参数类型是`PokerSuit`,因此我们可以把`heart`和`diamond`传给它,虽然`heart`是基于`PokerSuit`下的`Hearts`成员实例化的,但是他是货真价实的`PokerSuit`枚举类型。
下面我们给每一个花色赋一个值
```rust
enum PokerSuit{
	Clubs,
	Spads,
	Diamonds,
	Hearts,
}

struct PokerCard{
	suit:PokerSuit,
	value:u8
}

fn main(){
	let c1=PokerCard{
		suit:PokerSuit::Clubs,
		value:1,
	};
	let c2=PokerCard{
		suit:PokerSuit::Diamonds,
		value:12，
	};
}
```
这里通过`PokerCard`代表一张牌,结构体的`suit`代表牌的花色,类型是`PokerSuit`枚举类型,`value`字段代表扑克牌的数值。
更简洁的方式:
```rust
enum PokerCard{
	Clubs(u8),
	Spads(u8),
	Diamonds(u8),
	Hearts(u8),
}

fn main(){
	let c1 = PokerCard::Spades(5);
	let c2 = PokerCard::Diamonds(13);
}
```
直接将数据信息关联到枚举成员上,省去了很多
另外,同一个枚举类型下的不同成员可以有不同的类型
```rust
enum PokerCard{
	Clubs(u8),
	Spades(u8),
	Diamonds(char),
	Hearts(char),
}
fn main(){
	let c1 = PokerCard::Spades(3);
	let c2 = PokerCard::Hearts('A');
}
```
我们再来看一个标准库中的例子:
```rust
struct Ipv4Addr{
	// --snip--
}
struct Ipv6Addr{
	// --snip--
}
enum IpAddr{
	V4(Ipv4Addr),
	V6(Ipv6Addr),
}
```
枚举成员的类型变成了结构体.
**任何类型的数据都可以放入枚举成员当中**:
```rust
enum Message{
	Quit,
	Move{x:i32,y:i32},
	Write(String),
	ChangeColor(i32,i32,i32),
}

fn main(){
	let m1 = Message::Quit;
	let m2 = Message::Move{x:1,y:1};
	let m3 = Message::ChangeColor(255,255,0);
}
```
该枚举类型代表一条消息,包含4个不同的成员:
- `Quit`没有任何关联数据
- `Move`包含一个匿名结构体
- `Write`包含一个`String`字符串
- `ChangeColor`包含3个`i32`
```rust
struct QuitMessage;
struct MoveMessage{
	x:i32,
	y:i32
};
struct WriteMessage(String);
struct ChangeColorMessage(i32,i32,i32);
```
由于每一个结构体都有自己的类型,因此我们无法在需要同一个类型的地方进行调用,*例如某个函数它的功能是接受消息并进行发送，那么用枚举的方式，就可以接收不同的消息，但是用结构体，该函数无法接受 4 个不同的结构体作为参数。*
##### 同一化类型:
加入我们有1个WEB服务,需要接收用户的长连接,加入连接有2种:`TcpStream`和`TlsStream`,但是我们希望用同一个函数来处理这两个连接:
```rust
fn new(stream:TcpStream){
	let mut s = stream;
	if tls{
		s = negotiate_tls(stream
	}
}
	// websocket是一个WebSocket<TcpStream>或者
  //  WebSocket<native_tls::TlsStream<TcpStream>>类型
	websocket = WebSocket::from_raw_socket(s,....)
```
此时枚举就很有用
```rust
enum Websocket{
	Tcp(Websocket<TcpStream>),
	Tls(Websocket<native_tls:TlsStream<TcpStream>>),
}
```
##### Option枚举用于处理空值
其他语言种,一版都有一个`null`关键字,该关键字用于表明一个变量当前的值为空,也就是不存在.
>Tony Hoare， `null` 的发明者，曾经说过一段非常有名的话：
我称之为我十亿美元的错误。当时，我在使用一个面向对象语言设计第一个综合性的面向引用的类型系统。我的目标是通过编译器的自动检查来保证所有引用的使用都应该是绝对安全的。不过在设计过程中，我未能抵抗住诱惑，引入了空引用的概念，因为它非常容易实现。就是因为这个决策，引发了无数错误、漏洞和系统崩溃，在之后的四十多年中造成了数十亿美元的苦痛和伤害。

有鉴于此,Rust选择抛弃了`null`改为使用`Option`枚举变量来表述这种结果,
`Option`枚举包含2个成员,1个成员表示含有值,另一个表示没有值
```rust
enum Option<T>{
	Some(T),
	None,
}
```
其中`T`是泛型参数,`Some(T)`表示该枚举成员的数据类型可以包含任何类型
`Option<T>`相当的有用,以至于被包含在`prelude`种(Rust标准库种的函数);另外,我们不需要使用`Option::`就可以直接使用`Some`和`None`,总之,不能因为`Some(T)`和`None`种没有`Option<T>`的身影,就否认它们是卧龙凤雏
```rust
let some_number = Some(5);
let some_string = Some("a string");

let absent_number = Option<i32>=None;
```
如果使用`None`则需要告诉Rust`Option<T>`的类型,因为编译器只会通过`None`值无法推断出`Some`成员保存的值的类型。
`Option<T>`和`T`是不同的类型,所以不能做一些运算:
```rust
let x:i8 = 5;
let y:Option<i8>=Some(5);

let sum = x+y;
```
Error!!!
在对`Option<T>`进行`T`的运算时必须将其准话为`T`;
Rust的一个经过深思熟虑的设计:
为了拥有一个可能为空的值,必须显式的将其放如对应类型的`Option<T>`中,接着,要使用啊啊这个值时,必须明确的处理值为空的情况->只要一个值不为`Option<T>`,就可以安全的认定它的值不为空；
**如何从`Some`中取出`T`呢**:
参看文档:
<<https://doc.rust-lang.org/std/option/enum.Option.html>>
为了使用`Option<T>`值,需要编写处理每个成员的代码,当我们想要一些代码中只当拥有`Some(T)`值时运行,允许这些代码使用`T`;也希望一些代码在值为`None`时运行,这些代码并没有可用的`T`,`match`表达式就是这么一个处理枚举的控制流结构:根据枚举的成员运行不同的代码,这些代码可以使用匹配到的值中的数据:
```rust
fn plus_one(x:Option<i32>)->Option<i32>{
	match x{
		None=>None,
		Some<i>=> Some(i+1),
	}
}
let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);
```
`plus_one`通过`match`来处理不同`Option`的情况.