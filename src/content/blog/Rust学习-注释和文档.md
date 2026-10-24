---
title: 注释和文档
published: '2026-10-22'
description: ''
tags:
  - Rust学习
draft: false
---
### 注释的种类
rust中,注释一般分为3种:
- 代码注释
- 文档注释,支持`markdown`
- 包和模块煮熟,严格而言属于文档注释的一种
### 代码注释
**围绕原则,言简意骇**
#### 行注释`//`
```rust
fn main(){
	//face
	let name = "sunface";
	let age = 18; //今年18岁
}
```
#### 块注释`/*....*/`
```rust
fn main(){
	/*
		我
		是
		S
		u
		n
	*/
	let name = "sunface";
	let age = 18;
}
```
### 文档注释
当查看一个`crates.io`上的包时,需要通过它提供的文档来浏览相关的功能
rust提供了`cargo doc`的命令,用于将文档注释转换为`html`网页文件,用于给用户浏览
#### 文档行注释`///`
```rust
/// `add_one` 将指定值+1
///
/// #Example
///
///```
/// let age = 5;
/// let answer = my_crate::add_one(arg);
///
/// assert_eq!(6,answer);
pub fn add_one(x:i32)->i32{
	x+1
}
```
Notice:
- 文档注释需要位于`lib`类型的包中,例如`src/lib.rs`中
- 可以使用`markdown`语法,例如`#Example`的标题,以及代码高亮
- 被注释的对象需要使用`pub`对外可见
#### 文档块注释`/**...*/`
```rust
````rust
/** `add_two` 将指定值加2

# Examples

/```
let arg = 5;
let answer = my_crate::add_two(arg);

assert_eq!(7, answer);
/```
*/
pub fn add_two(x: i32) -> i32 {
    x + 2
}
```
#### 查看文档 cargo doc
运行`cargo doc`可以直接生成`html`文件,放入*target/doc*目录下
或者直接使用`cargo doc --open`,可以在生成文档后,自动在浏览器中打开网页
#### 常用文档标题
除了`# Example`标题,还有一些常用的标题,可以酌情使用:
- Panics:函数可能出现的异常状况
- Errors:描述可能出现的错误
- Safety:如果函数使用`unsafe`代码,那么调用者就需要注意一些使用条件,来确保`unsafe`代码块的正常工作

### 包和模块级别的注释
给包和模块加注释
Notice:**这些注释需要加在包、模块的最上方**
和之前的注释一样,包级别的注释也分为2种:行注释`//!`和块注释`/*!...*/`
为包添加注释,在`src/lib.rs`包根的最上方,添加:
```rust
/*! lib包是world_hello二进制包的依赖包，
 里面包含了compute等有用模块 */
pub mod compute;
```
再为该包根的子模块`src/compute.rs`添加注释
```rust
//! 计算一些你口算算不出来的算数题

/// `add_one`将指定添加
///
```
运行`cargo doc --open`
### 文档注释
在之前的`add_one`中,我们写的实例很像是一个单元测试的用例,是偶然吗?NoNoNo,rust允许我们在文档注释中写单元测试用例!方法就如之前做的:
```rust
/// `add_one` 将指定值加1
///
/// # Examples11
///
/// ```
/// let arg = 5;
/// let answer = world_hello::compute::add_one(arg);
///
/// assert_eq!(6, answer);
/// ```
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```
上面的注释不仅仅是文档,还可以作为单元测试的用例,使用`cargo test`进行测试:
Log:
```
```
可以看到文档中的注释被完美的运行,输出`Doc-tests world_hello`,意味着这些测试的名字叫做`Doc test`文档测试
#### 造成panic的文档测试
文档测试的用例中还可以造成`panic`:
```rust
/// #Panics
/// The function panics if the second argument is zero
///
///```rust
/// // panics on division by zero
/// world_hello::compute::div(10,0);
///```
pub fn div(a:i32,b:i32)->i32{
	if b == 0{
		panic!("Divide-by-zero error");
	}
	a/b
}
```
以上的测试会`panic`
```
```
如果想要通过这种测试,可以添加`should_panic`:
```rust
/// # Panics
///
/// The function panics if the second argument is zero
/// ```rust,should_panic
/// //panics on division by zero
/// world_hello::compute::div(10,0);
/// ```
```
通过`should_panic`,告诉rust我们这个用例会导致`panic`,这样测试用例就会顺利通过
#### 保留测试,隐藏文档
我们希望保留文档测试的功能,但是又要将测试用例的内容从文档中隐藏:
```rust
/// ```
/// #//使用#开头的行会在文档中隐藏起来,但是依然会在文档测试中运行
/// # fn try_main() -> Result<(),String>{
/// let res = world_hello::compute::try_div(10,0)?；
/// # Ok(()) // returning from try_main
/// #}
/// ```
pub fn try_div(a:i32,b:i32)->Result<i32,String>{
	if b ==0 {
		Err(String::from("Divido-by-zero"))
	}else{
		Ok(a/b)
	}
}
```
以上文档注释中,我们将使用`#`将用户看到的内容隐藏起来,但是又不影响测试用例的运行,最终用户只能看见那一行`let res = world_hello::compute::try_div(10,0)?:`:
like this:
(ps:截图一张)

#### 文档注释中的代码跳转
rust在文档中提供了一个很强大的功能,可以实现对外部项的链接:
#### 跳转到标准库:
```rust
/// `add_one`返回一个['Option']类型
pub fn add_one(x:i32)->Option<i32>{
	Some(x+1)
}
```
此处的[`Option`]就是一个链接,指向标准库中的`Option`枚举类型,有2种方式进行跳转:
- IDE中,使用`Ctrl + 鼠标左键`(Windows)
- 文档中直接点击继续

还可以使用路劲的方式继续:
```rust
use std::sync::mpsc::Receiver;

/// ['Receiver<T>'] ['std::future']
///
/// ['std::futrue::Future'] ['Self::rece()']
pub struct AsyncReceiver<T>{
	sender: Receiver<T>,
}
impl <T> AsyncReceiver<T>{
	pub async fn recv()->T{
		unimplemented!()
	}
}
```
#### 使用完整路径跳转到指定项
除了跳转到标准库,还可以通过指定具体的路径跳转到自己代码或者其他库的代码项,例如在`lib.rs`中添加:
```rust
pub mod a{
	/// `add_one`返回一个['Option']类型
	/// 跳转到['crate::MySpecialFormatter']
	pub fn add_one(x:i32)->Option<i32>{
		Some(x+1)
	}
}
pub struct MySpecialFormatter;
```
#### 同名项的跳转
如果遇到同名项,可以使用标示类型进行跳转:
```rust
/// 跳转到结构体 ['Foo'](struct@Foo)
pub struct Bar;
/// 跳转到同名函数 ['Foo'](fn@Foo)
pub struct Foo{}
/// 跳转到同名宏['fool']
pub fn Foo(){}

#[macro_export]
macro_export! foo{
	()=>{}
}
```
### 文档搜索别名
rust文档支持搜索功能,我们可以为我们自己的类型定义几个别名,以实现更好的搜索展现,别名命中时,搜索结果会被放在第一位:
```rust
#[doc(alias = "x")]
#[doc(alias = "big")]
pub struct BigX；

#[doc(alias("y","big"))]
pub struct BigY;
```

### 一个综合的例子:
重点列举:
- 文档注释
- 1个项目可以包含2个包:2进制可执行包和`lib`包,它们的包根分别时`src/main.rs`和`src/lib.rs`
- 2进制包中引用`lib`包
- 使用`pub use`再导出api,观察文档
`cargo new art`创建一个package`art`:
易得,该`Package`包含一个同名的2进制包,包跟为`src/main.rs`
现在在目录下创建1个`lib.rs`文件,同理,创建该文件相当于又创建1个库类型的包,包名也是`art`,包跟为`src/lib.rs`,该包是库类型的
```rust
//! #Art
//!
//! 未来的艺术建模库,现在的调色库

pub use self::kinds::PrimaryColor;
pub use self::kinds::SencondaryColor;
pub use self::utils::mix

pub mod kinds{
	//! 定义颜色类型
	
	//主色
	pub enum PrimaryColor{
		Red,
		Yellow,
		Blue
	},
	//副色
	#[derive(Debug,PartialEq)]
	pub enum SecondaryColor{
		Orange,
		Green,
		Purple,
	}
}
pub mod utils{
	//! 实用工具,目前只使用了调色板
	use crate::kinds::*；
	
	/// 将2种主色调成副色
	/// ```rust
	/// use art::utils::mix
	/// use art::kinds::{PrimaryColor,SecondaryColor};
	/// assert!(matches!(mix(PrimaryColor::Yellow,PrimaryColor::Blue),SecondaryColor::Green));
	/// ```
	
	pub fn mix(c1:PrimaryColor,c2:PrimaryColor)->SecondaryColor{
		SecondaryColor::Green
	}
}
```
在库包的包根`src/lib.rs`下,我们又定义了几个子模块,同时将子模块中的3个项`pub use`再导出

接着,将下面内容加入`main.rs`
```rust
use art::kinds::PrimaryColor;
use art::utils::mix;

fn main(){
	let blue = PrimaryColor::Blue;
	let yellow = PrimaryColor::Yellow;
	println!("{:?}",mix(blue,yellow));
}
```
2进制可执行包的包根`src/main.rs`下,引入库包`art`中的模块项,同时使用`main`函数作为程序的入口,该2进制包可以使用`cargo run`运行:
```
```

