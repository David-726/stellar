---
title: rust的错误哲学
published: '2026-10-17'
description: ''
tags:
  - Rust学习
draft: false
---
Error divided by:
- 可回复错误:常用于从系统全局来看可以接收的错误
- 不可恢复错误:该错误通常是全局性或者系统性的错误
## panic!
一个场景:文件读取操作发生在系统启动阶段->一旦文件读取失败,系统启动也将失败,意味着该失败是不可恢复的,错误的原因不重要,归根结底都是不可恢复的错误
对于这些严重到影响程序运行的错误,触发`panic`是很好的解决方式,在rust中触发`panic`有2中方式:被动触发和主动调用,下面依次来看看:
#### 被动触发
eg:
```rust
fn main(){
	let v = vec![1,2,3];
	
	v[99];
}
```
数组访问越界,严重的异常的错误——数组访问越界
Error:
```
```
类似的`panic`还有很多,而被动触发的`panic`是我们日常中最常遇见的,也是rust给我们的一些保护
#### 主动调用
rust提供了`panic!`宏,调用执行该宏时,**程序会打印出一个错误信息,展开报错点往前的函数调用堆栈,最后退出程序**
>只有不可恢复的错误,才调用`panic!`处理,**只有当不知道怎么处理时,再去调用panic!**

先来调用一下`panic!`,这里使用了最简单的代码调用,实际上最程序的任何地方都可以这么调用:
```rust
fn main(){
	panic!("crash and burn");
}
```
Output log:
```
```
- `main`函数所在的线程崩溃了
- 使用时可以加上一个环境变量可以获取更详细的站展开信息:
  - Linux/maxOs等UNIX系统:`RUST_BACKTRACE=1 cargo run`
  - Windows(Powershell):`$env:RUST_BACKTRACE=1;cargo run`
#### backrtrace 栈展开
一个真实的崩溃例子:
```rust
fn main(){
	let v = vec![1,2,3];
	v[99];	
}
```
C语言中,即便越界了,依然尝试去访问,这种情况称之为**缓冲区溢出**,可能导致安全漏洞
宁愿 panic!,因为取到一个不属于你的值,很多时候会导致程序上的逻辑BUG!
好的,回到问题上,成功知道了问题发生的位置,但是我们想要知道该问题之前经过了哪些调用环节,按照提示用`RUST_BACKTRACE=1 cargo run`或者`$env:RUST_BACKTRACE=1;cargo run`再来运行一次程序:
```
```
上面的代码就是一次栈展开,包含了函数调用的顺序,当然按照逆序排列:最近调用的函数排在列表的最上方,因为咱们的`main`函数基本是最先调用的函数了,所以排在了倒数第二位,还有一个关注点,排在最顶部最后一个调用的函数时`rust_begin_unwind`,该函数的目的就是进行栈展开
要获取栈回溯信息,还需要开启`debug`标志,该标志在使用`cargo run`或者`cargo build`时自动开启(这两个操作默认是`Debug`运行方式)

#### panic是的2种终止方式
出现`panic!`时,程序提供了2种方式来处理终止流程:**栈展开**和**直接终止**
默认的方式是`栈展开`,意味着rust会回溯栈上数据和函数调用,意味着更多的善后工作,好处是可以给出充分的报错信息和栈调用信息,便于后面的复盘;`直接终止`,不清理数据就直接退出程序,善后工作和操作系统来负责
绝大多数用户而言,默认选择是最好的,但是当你关心最终编译出的2机制可执行文件大小时,尝试使用直接终止的方式,例如下面的配置修改`Cargo.toml`,实现在`release`模式下遇到`panic`直接终止:
```rust
[profile.release]
panic='abort'
```
### 线程panic后,程序是否会终止
如果是`main`线程,则程序会终止,其他子线程,该线程会中,但是不会影响`main`线程,尽量不要再`main`线程种做太多任务,将这些任务交给子线程做,即便子线程`panic`也不会导致整个程序的结束

### 何时该使用 panic!
之前我们讲过`Result<T,E>`这个枚举类型,用于表示函数的返回结果:
```rust
enum Result<T,E>{
	Ok(T),
	Err(E),
}
```
当没有错误发生时,返回一个用`Result`类型包裹的值`OK(T)`,当错误时,返回一个`Err(E)`,对于`Result`返回我们有很多处理方式,最简单粗暴的是`unwrap`和`expect`,这2个函数很类似,我们以`unwrap`举例:
```rust
use std::fmt::IpAddr;
let home:IpAddr = '127.0.0.1'.parse().unwrap();
```
上面的`parse`方法试图将字符串`127.0.0.1`解析为一个IP地址类型`IpAddr`,返回了一个`Result<IpAddr,E>`类型,若解析成功,则把`Ok(IpAddr)`中的值赋给`home`,若是失败,则不处理`Err(E)`,而是直接`panic`
`unwrap`简而言之:成功则返回值,失败则`panic`,不进行任何错误处理。
#### 可能导致全局有害状态
有害状态大概分为几个大类:
- 非预期的错误
- 后续代码的运行会收到显著影响
- 内存安全的问题
当错误预期发生时,返回一个错误比较合适,例如解析器接收到格式错误的数据,HTTP请求接收到错误的参数甚至该请求内的任何错误.**因为数据是可预期的,因此也是可以处理的**
启动时某个流程发生了错误,后续代码的运行产生了影响,那么就应该使用`panic`,而不是处理错误后继续进行
### panic原理剖析
调用`panic!`宏时,会:
- 格式化`panic`信息,然后使用该信息作为参数,调用`std::panic::panic_any()`函数
- `panic_any`会检查应用是否使用了`panic hook`,若是使用了,该`hook`函数就会被调用(`hook`是一个狗子函数,外部代码设置的,用于在`panic`触发时,执行外部代码所需功能)
- `hook`函数返回时,当前线程就开始进行栈展开:从`panic_any`开始,如果寄存器或者栈因为某些原因错乱了,那很可能该展开会发生一场,最终线程会直接停止,展开也无法继续
- 展开的过程是一帧一帧的去回溯整个栈,整个帧的数据都会随之被丢弃,但是在展开的过程中,可能会遇到被用户标记为`catching`的帧(通过`std::panic::catch_unwind()`标记),此时用户提供的`catch`函数就会被调用,展开就会随之停止;当然,如果`catch`选择在内部调用`std::panic::resume_unwind()`函数,则展开还会继续
还有一种情况,就是在展开过程中,如果展开本身`panic`了,那展开线程会终止,展开也会随之停止

一旦线程展开终止或者完成,最终的输出结果是取决于哪个线程`panic`:对于`main`线程,操作系统提供的终止功能`core::intrinsics::abort()`会被调用,最终结束当前的`panic`进程;如果是其他子进程,那么子进程就会被简单的终止,同时信息会在稍后通过`std::thread::join()`进行收集。

## 可恢复的错误 Result
有一台消息服务器,每个用户通过websocket连接到该服务器来接收和发送消息,该过程就涉及到了socket文件的读写,那么此时,如果一个用户的读写发生了错误,显然不能直接`panic`,否则服务器会直接崩溃,所有用户都会断连,因此我们需要一种更温和的错误处理方式:`Result<T,E>`
```rust
enum Result<T,E>{
	Ok(T),
	Err(E),
}
```
`T`代表成功传入时存入的正确值的类型,存放方式是`Ok(T)`,`E`代表错误时存入的错误值,存放方式是`Err(E)`->
```rust
use std::fs::File;

fn main(){
	let f = File::open("hello.txt");
}
```
以上`File::open`返回一个`Result`类型,那么问题来了:
>如何获知变量类型或者函数的返回类型

```rust
let f:u32 = File::open("hello.txt");
```
Error:
```
```
故意将`f`类型标记为整形,编译器立刻不同意,并且给你了正确答案:`std::result::Result<std::fs::File,std::io::Error>`
我靠这么长!!!，首先`Result`是被定义在`std::result`中的,而`Result`很常见,就被定义在了`prelude`中,因此无需手动引入`std::result::Result`,那么返回类型就被简化为`Result<std::fs::File,std::io::Error>`,很标准的`Result<T,E>`枚举定义,只不过`T`被替换成了具体的`std::fs::File`,是一个文件句柄类型,`E`被替换成了`std::io::Error`
1个返回值类型说明`File::open`调用成功则返回一个可以进行读写的文件句柄,若是失败,则返回一个IO错误:文件不存在或者没有访问文件的权限。总之`File::open`需要1个方式告知调用者成功还是失败
```rust
use std::fs::File;

fn main(){
	let f = File::open("hello.txt");
	
	let f = match f{
		Ok(file)=>file,
		Err(error)=>{
			panic!("Problem opening the file:{:?}",error)
		}
	}
}
```
### 对返回的错误进行处理
实际上我们可以对部分错误进行特殊处理,而不是所有的都直接panic:
```rust
use std::fs::File;
use std::io::ErrorKind;

fn main(){
	let f = File::open("hello.txt");
	let f = macth f{
		Ok(file)=>file,
		Err(error)=>macth error.kind(){
			ErrorKind::NotFound => match File::create("hello.txt"){
				Ok(fc)=>fc,
				Err(e)=>panic!("Problem creating the file:{:?}",e),
			},
			other_error=>panic("Problem opening the files:{:?}",other_error),
		},
	};
	}
```
上面匹配出`panic`之后,有对`error`进行了详细的匹配解析

### 失败就panic:unwrap和expect
`unwrap`和`expect`
成功就将`Ok(T)`中的值取出来,失败就直接`panic`,能崩溃绝不BB
```rust
use std::fs::File;

fn main(){
	let f = File::open("hello.txt".unwrap());
}
```
如果调用时候这段hello.txt不存在,那么就将`unwrap`直接`panic`
Error:
```
```
`expect`和`unwrap`相似,也是遇到错误直接`panic`,但是会带上自定义的错误提示信息:
```rust
use std::fs::File;

fn main(){
	let f = File::open("hello.txt").expect("Failed to open hello.txt");
}
```
Error:
```
```
`expect`相比`unwrap`能提供更精确的错误信息
### 传播错误
1个设计良好的程序,一个功能设计十几层的函数调用都有可能,但是错误处理也往往不是那里调用出错,就在哪里处理,实际中,大概率会把错误层上传然后交给调用链的上有函数进行处理；
eg:
```rust
use std::fs::File;
use std::io::{self,Read};

fn read_username_from_file()->Result<String,io::Error>{
	let f = File::open("hello.txt");
	
	let mut f = match f{
		OK(file)=>file,
		//错误,将错误层层上传
		Err(e)=>return Err(e),
	};
	
	let mut s = String::new();
	match f.read_to_string(&mut s){
		Ok(_)=>Ok(s),
		//错误,将错误层层上传
		Err(e)=>Err(e),
	}
}
```
Notice:
- 该函数返回一个`Result<String,io::Error>`类型,读取成功是`Ok(String)`,失败是`Err(io:Error)`
- `File::open`和`f.read_to_string`返回的是`Result<T,E>`中的`E`就是`io::Error`
该函数将`io::Error`的错误层层传播,该函数的调用者会对`Result<String,io::Error>`进行再处理,至于怎么处理是调用者的事；
但是还是太长了,怎么简化?

#### 传播界的大明星:?
```rust
use std::fs::File;
use std::io;
use std::io::Read;

fn read_username_from_file()->Result<String,io::Error>{
	let mut f = File::open("hello.txt");
	let mut s = String::new();
	f.read_to_string(&mut s)?;
	Ok(s)
}
```
这里的`?`就是个宏,作用和上面的`match`一模一样
```rust
let mut f = match f{
	OK(file)=>file,
	Err(e)=>return Err(e),
};
```
结果是`Ok(T)`,则将`T`赋值给`f`,若结果是`Err(E)`,则返回该错误
虽然`?`和`match`功能一致,但是事实上`?`更胜一筹
一个设计良好的系统,肯定有自定义的错误特征,错误之间很可能存在上下级关系,例如`std::io::Error`和`std::error::Error`,前者是IO相关的错误结构体,后者是一个最最通用的标准特征,同时前者实现了后者,所以可以实现`std::io::Error`到`std::error::Error`
可以直接进行类型提升:
```rust
fn open_file()->Result<File,Box<dyn std::error::Error>>{
	let mut f = File::open("hello.txt")?;
	Ok(f)
}
```
上面代码中`File::open`报错返回的错误是`std::io::Error`类型,但是`open_file`函数返回的错误类型是`std::error::Error`的特征对象,可以看到经过`?`之后,变成了另一个错误类型
根本原因在于标准库中的`From`类型,有一个方法`from`,用于将一个类型转化为另一个类型,`?`可以自动调用该方法,然后进行隐式类型转换,因此只要函数返回的错误`ReturnError`实现了`From<OtherError>`特征,那么`?`就会将`OtherError`转化为`ReturnError`

强中自有强中手:
```rust
use std::fs::File;
use std::io;
use std::io::Read;

fn read_username_from_file()->Result<String,io::Error>{
	let mut s = String::new();
	
	File::open("hello.txt")?.read_to_string(&mut s)?；
	
	Ok(s)
}
```
`?`还是能够实现链式调用,`File::open`遇到错误就返回,没有错误就将`OK`中的值取出来用于下一个方法调用
just like:
```rust
fn read_username_from_file()->Result<String,io::Error>{
	let mut s = String::new();
	
	let mut file = match File::open("hello.txt"){
		Ok(file)=>file,
		Err(e)=>return Err(e),
	};
	
	match file.read_to_string(&mut s){
		Ok(_)=>Ok(s),
		Err(e)=>Err(e),
	}
}
```
还有更强:
```rust
use std::fs;
use std::io;

fn read_username_from_file()->Result<String,io::Error>{
	//read_to_string是定义再std::io中的方法,因此需要在上面进行引用
	fs::read_to_string("hello.txt")
}
```
...作者给我杆蒙了

### ?用于Option的返回
`?`还可以用于`Result`的传播,还能用于`Option`的传播,
```rust
pub enum Option<T>{
	Some(T)，
	None
}
```
`Result`通过`?`返回错误,那么`Option`就通过`?`返回`None`:
```rust
fn first(arr:&[i32])->Option<&i32>{
	let v = arr.get(0)?；
	Some(v)
}
```
更简单的:
```rust
fn first(arr:&[i32])->Option<&i32>{
	arr.get(0)
}
```
...
```rust
fn last_char_of_first_line(text:&str)->Option<char>{
	text.line().next?.chars().last()
}
```
1个链式调用的例子

#### 新手用?会犯的错误
初学者在使用`?`时,总是会犯错,例如:
```rust
fn first(arr:&[i32])->Option<&i32>{
	arr.get(0)?
}
```
No;
`?`需要一个变量来承载正确的值,这个函数只会返回`Some(&i32)`或者`None`,只有错误值能直接返回,正确的值不行,若存在0号元素,那么函数第2行使用`?`后的返回类型为`&i32`而不是`Some(&i32)`,智能用于:
- `let v = xxx()?;`
- `xxx()?.yyy()?;`
#### 带返回值的main函数
了解了`?`的使用限制,很容易看出错误
```rust
use std::fs::File;

fn main(){
	let f = File::open("hello.txt")?；
}
```
Error:
```
```
因为`?`要求`Result<T,E>`形式的返回值,而`main`函数的返回值是`()`,无法满足
事实上rust还支持这种形式的main函数:
```rust
use std::error::Error;
use std::fs::File;

fn main() -> Result<(),Box<dyn Error>>{
	let f = File::open("hello.txt")?;
	Ok(())
}
```
使用了`?`就可以提前返回了,通过我们又一次看见了`Box<dyn Error>`特征对象,因为`std::error::Error`是rust中层次最高的error,其他标准库中的错误都实现该错误,因此我们可以用该特征对象代表一切错误,就算`main`函数中调用任何标准库函数有错误,都可以通过`Box<dyn Error>`返回

至于`main`函数可以实现多种返回值,是因为实现了`std::process::Termination`特征...但是还没有被收录到稳定版rust中

### try!
`?`横空出世之前,rust开发者还使用`try!`来处理错误
```rust
macro_rules! try{
	($e:expr)=>(match $e{
		Ok(val)=>val,
		Err(err)=>return Err(::std::convert::From::from(err)),
	});
}
```
和`?`对比:
```rust
let x = function_with_erroe()?；

let x = try!(function_with_error())；
```
`try!`天已死,`?`天当立
