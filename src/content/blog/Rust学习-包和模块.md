---
title: 包和模块
published: '2026-10-17'
description: ''
tags:
  - Rust学习
draft: false
---
## 包和package
Def:真实项目的`Package`和`Crate`很容易搞混,但是rust官方做出了明确的区分

### Crate
对于rust而言,crate是一个独立的可编译单元,编译后生成一个可执行文件或者一个库
1个包会将相关联的功能打包在一起,使得该功能可以很方便的在多个项目分享,例如标准库中没有但是第三方库中提供的`rand`包,提供了随机数生成的功能,只需要将该包通过`use rand;`引入当前项目的作用域,从而可以在项目中使用`rand`的功能:`rand::XXX`
同一个包中不能有同名的类型,但是不同包中可以。虽然`rand`包中,有一个`Rng`特征,但是我们依然可以在我们自己的项目中定义一个`Rng`特征,可是我们依然可以在自己的项目中定义一个`Rng`

### Package 项目
包的名称被crate占用,库的名称被library占用,我们决定将Package翻译成项目
由于`Package`就是一个项目,因此有独立的`Cargo.toml`文件,以及因为功能性被组织在一起的一个或多个包,一个`Package`只能包含以恶个library类型的包,但是可以包含多个2禁止可执行类型的包
#### 2进制
下面来创建一个2机制`Package`
```
$ cargo new my-project
	Created binary (application) 'my-project' package
$ ls my-project
Caro.toml
src
$ ls my-project/src
main.rs
```
```
my-project/
├── Cargo.toml
└── src/
    └── main.rs
```
这里cargo创建了1个名为`my-project`的`Package`,我们看看`Cargo.toml`中名没有提到`src/main.rs`作为程序的入口,Cargo惯例:`src/main.rs`是2进制包根文件,该2进制包的报名和所属`Package`相同,这里都是`my-project`,所有的代码执行都从该文件的`fn main()`开始
使用`cargo run`可以运行该项目,输出:`Hello,world`

### 库 Package
再来创建1个库类型的`Package`:
```
$ cargo new my-lib --lib
	Created library 'my-lib' package
$ ls my-lib
Cargo.toml
src
$ ls my-lib/src
lib.rs
```
```
$ cargo run
error: a bin target must be available for 'cargo run'
```
原因是库类型的`Package`只能作为第三方库被其他项目引用,而不能独立运行,
和`src/main.rs`一样,如果1个`Package`包含有`src/lib.rs`,意味着含有一个库类型的同名包`my-lib`,跟文件是`src/lib.rs`

### 易混淆的Package和包
因为`cargo new`创建的`Package`和其中包含的包是同名的:
不过需要记住的是`Package`是一个项目工程,但是crate只是一个编译单元

### 典型的Package结构
上面创建的`Package`中仅仅包含`src/main.rs`文件,意味着仅仅包含1个2进制同名包`my-project`,如果1个`Package`同时拥有`src/main.rs`和`src/lib.rs`,意味着包含2个包:库包和2进制包,包名也是`my-project`-都和`Package`同名
1个真实项目中典型的`Package`,包含多个2进制包,放在`src/bin`下,每个文件都是独立的2进制包,同时也会包含一个库包,该包只能存在1个`src/lib.rs`
```
├── Cargo.toml
├── Cargo.lock
├── src
│   ├── main.rs
│   ├── lib.rs
│   └── bin
│       └── main1.rs
│       └── main2.rs
├── tests
│   └── some_integration_tests.rs
├── benches
│   └── simple_bench.rs
└── examples
    └── simple_example.rs
```
- 唯一库包:`src/lib.rs`
- 默认2进制包:`src/main.rs`,编译后生成的可执行文件和`Package`同名
- 其余2进制包:`src/bin/maim1.rs`和`src/bin/main2.rs`,会分别生成1个文件同名的2进制可执行文件
- 集成测试文件:`tests`目录下
- 基准性能测试:`benchmark`文件:`benches`目录下
- 项目实例:`examples`目录下
这种基本是rust的标准目录结构

## 模块 Module
### 创建嵌套模块
使用`cargo new --lib restaurant`创建一个小餐馆,创建的是1个lib类型的`package`,然后将代码放入`src/lib.rs`中:
```rust
mod front_of_house{
	mod hosting{
		fn add_to_waitlist(){}
		
		fn seat_at_table(){}
	}
	mod serving{
		fn take_oreder(){}
		
		fn serve_order(){}
		
		fn take_payment(){}
	}
}
```
创建3个模块:
- 使用`mod`关键字来创建新模块,后面紧跟着模块名称
- 模块可以嵌套
- 模块中定义各种rust类型
- 所有模块均定义在同一个文件中
使用模块可以将功能相关的代码组织在一起,通过1个模块名称来说明这些代码为什么被组织在一起
### 模块树
之前我们将`src/main.rs`和`src/lib.rs`被称之为crate root;由于这两个文件的内容形成了一个crate,该模块位于包的树形结构:
```
crate
 └── front_of_house
     ├── hosting
     │   ├── add_to_waitlist
     │   └── seat_at_table
     └── serving
         ├── take_order
         ├── serve_order
         └── take_payment
```
其中`crate`包根是`src/lib.rs`文件,3个模块分别形成了模块树的剩余部分

#### 父子关系
`A`包含`B`,那么`A`是`B`的父模块,`B`是`A`的子模块;`front_of_house`是`hosting`和`serving`的父模块

### 用路劲引用模块
想要引用1个模块,需要知道路径,rust中,这种路径有2中形式:
- 绝对路径,从crate root开始,以报名或者`crate`开头
- 相对路径,从当前模块开始,以`self`,`super`或者当前的模块的标识符为开头
src/lib.rs:
```rust
mod front_of_house{
	mod hosting{
		fn add_to_waitlist(){}
	}
}

pub fn eat_at_restaurant(){
	//绝对路劲
	create::front_of_house::hosting::add_to_waitlist();
	//相对路径
	front_of_house::hosting::add_to_waitlist();
}
```
上面为了简化实现,省去了其余模块和函数,这样可以将关注点放在函数调用上,`eat_at_restaurant`是一个定义在包跟中的函数

### 绝对路径引用
因为`eat_at_restaurant`和`add_to_waitlist`都定义在一个包中,因此在绝对路径引用时,直接用crate开头,逐层引用:
```
crate::front_of_house::hosting::add_to_waitlist();
```

就像文件系统似的
### 相对路径引用
因为`eat_at_restaurant`和`dront_of_house`都处于包`crate`中,因此相对路劲引用可以使用`front_of_house`作为开头:
```
front_of_house::hosting::add_to_waitlist();
```
选择绝对和相对的原则:
**当代码被挪动位置时,尽量减少路径的修改**
### 代码可见性
```rust
mod front_of_house{
	mod hosting{
		fn add_to_waitlist(){}
	}
}

pub fn eat_at_restaurant(){
	//绝对路劲
	create::front_of_house::hosting::add_to_waitlist();
	//相对路径
	front_of_house::hosting::add_to_waitlist();
}
```
`cargo build`->Error:
```
```
`hosting`模块是私有的,不能在crate root进行访问,但是`front_of_house`和`eat_at_restaurant`同属于一个crate root作用域下,同一个模块内的代码自然不存在私有化问题;
模块不仅仅对于组织代码很有用，它还能定义代码的私有化边界;
rust出于安全的考虑,默认情况下,所有的类型都是私有化的；rust中,**父模块完全无法访问子模块中的私有化,但是子模块却可以访问父模块、父父模块..的私有项**
### pub 关键字
类似其他语言的`public`,rust提供了`pub`关键字,可以控制模块和模块中指定项的可见性
```rust
mod front_of_house{
	pub mod hosting{
		fn add_to_waiting(){}
	}
}
//...
```
But error again:
```
```
模块可见性不代表模块内部项的可见性,模块的可见性仅仅是允许其他模块去引用,但是想要引用其中的项,还是得继续将对应的项标为`pub`

实际上,标`pub`比标`private`更容易；
如何解决?
```rust
mod front_of_house{
	pub mod hosting{
		pub fn add_to_waitlist() {}
	}
}
```
Bang,NoError
### 使用`super`引用模块

`super`代表的是父模块为开始的引用方式,很类似于文件系统中的`../a/b`
```rust
fn serve_order(){}

mod back_of_house {
	fn fix_incorrect_order(){
		cook_order();
		super::serve_order();
	}
	
	fn cook_order(){}
}
```
使用`super::serve_order()`调用了夫模块中的`serve_order`函数

### 使用`self`引用模块
`self`就是引用自身模块中的项,调用同一模块中的内容,区别在于之前章节直接通过名称调用
```rust
fn serve_order(){
	self::back_of_house::cook_order()
}

mod back_of_house{
	fn fix_incorrect_order(){
		cook_order();
		crate::serve_order();
	}
	
	pub fn cook_order() {}
}
```
为什么不直接相对路径调用呢?是多此一举吗?
非也非也?肯定是有用的呀兄弟,先卖关子
```
```

### 结构体和枚举的可见性
有完全不同的可见性:
- 将结构体设置为`pub`,所有字段依然是私有的
- 枚举设置为pub,所有字段都对外可见
如果枚举的成员不对外开放,那枚举则一点没有用

### 模块和文件分离
之前的例子,所有的模块都定义在`src/lib.rs`中,但是模块更大的时候,需要放入一个单独的文件
现在将`front_of_house`放到`src/front_of_house.rs`中
```rust
pub mod hosting{
	pub fn add_to_waitlist(){}
}
```
然后将一下代码留在`src/lib.rs`中:
```rust
mod front_of_house;

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant(){
	hosting::add_to_waitlist()；
	hosting::add_to_waitlist();
	hosting::add_to_waitlist();
}
```
- `mod front_of_house`告诉rust从另一个模块`front_of_house`同名的文件中加载该模块的内容
- 使用绝对路径的方式引用`hosting`模块:`crate::front_of_house::hosting;`
Notice:
- `mod front_of_house;`告诉rust从另一个和模块`front_of_house`同名的文件加载该模块的内容
- 使用绝对路径方式引用`hosting`模块:`create::front_of_house::hosting`
现在模块的声明和实现是分离的,实现是在单独的`front_of_house.rs`中,然后通过`mod front_of_house;`从该文件中将模块内容加载进来.
关键字`use`用于将外部模块中的项引入当前作用域中,无需冗长的父模块前缀即可调用:`hosting::add_to_waitlist();`

当一个模块具有很多子模块时,可以通过文件夹的方式组织这些子模块:上述例子,可以创建一个目录`front_of_house`,然后在文件夹中创建一个`hosting.rs`文件,`hosting.rs`文件就剩下:
```rust
pub fn add_to_waitlist() {}
```
Error:
```
```
如果将文件夹作为一个模块,需要显式指定暴露哪些子模块:
- 在`front_of_house`目录里创建一个`mod.rs`,如果你使用的`rustc`较早,这是唯一的方法
- 在`front_of_house`同级目录里创建一个和模块同名的rs文件`front_of_house.rs`
第2中方式更推荐:
```
src
├── front_of_house
│   └── hosting.rs
├── front_of_house.rs
└── lib.rs
```
无论哪一种方式,内容都是一样的,需要在定义的子模块:
```rust
pub mod hosting;
```

## 使用use及受限可见性
如果代码中,通篇都是`crate::front_of_house::hosting::add_to_waitlist`这样的函数调用形式,嗯,很难看

### 基本引入形式
#### 绝对路径引入模块:
```rust
mod front_of_house{
	pub mod hosting{
		pub fn add_to_waitlist(){}
	}
}

use crate::front_of_house::hosting;

pub fn eat_at_restaurant(){
	hosting::add_to_waitlist();
	hosting::add_to_waitlist()；
	hosting::add_to_waitlist();
}
```
使用`use`和绝对路径,将`hosting`模块引入当前作用域
#### 相对路径引入模块中的函数
```rust
mod front_of_house{
	pub mod hosting{
		pub fn add_to_waitlist() {}
	}
}
use front_of_house::hosting::add_to_waitlist();

pub fn eat_at_restautant(){
	add_to_waitlist();
	add_to_waitlist();
	add_to_waitlist();
}
```
更短了是吧

##### 引入模块还是函数
从简洁性而言,还是引入函数更舒服,但是有时候,引入模块更好:
- 需要引入一个模块中的多个函数
- 作用域中存在同名函数
建议:**优先引入最细粒度的引用方式,若是引起了某种麻烦,在使用引入模块的方式**

### 避免同名引用
#### 模块::函数
```rust
use std::fmt;
use std::io;

fn function1()->fmt::Result{
	//--snip--
}
fn function2()->io::Result<()>{

}
```
#### `as`别名引用
像py那种
```rust
use std::fmt::Result;
use std::io::Result as IoResult;

fn function1()->Result{
	//--snip--
}
fn function2()->IoResult(<>){
	//--snip--
}
```
实现通过`use std::io::Result`将`Result`引入作用域,然后使用`as`给与一个新的名称`IoResult`

### 引入项再导出
当外部的模块项`A`被引入当前模块中,可见性自动被设置为**私有的**,如果希望允许其他外部代码引用模块`A`,需要进行再导出
```rust
mod front_od_house{
	pub mod hosting{
		pub fn add_to_waitlist(){}
	}
}

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant(){
	hosting::add_to_waitlist();
	hosting::add_to_waitlist();
	hosting::add_to_waitlist();
}
```
如上使用`pub use`实现,这里`use`代表引入`hosting`模块到当前的作用域,`pub`表示将引入的内容再度设置为可见

### 使用第三方包
如何引入外部依赖:
- 修改`Cargo.toml`文件,在`[dependencies]`区域添加:`rand=0.8.3`
- 如果是用的是`vscode`和`rust-analyzer`插件,会自动拉去该库,可能需要等他完成之后,在进行下一步
此时,`rand`包被我们添加到依赖中,下一步在代码中使用:
```rust
use rand::Rng;

fn main(){
	let secret_number = rand::thread_rng().gen_range(1..101);
}
```
#### carte.io,lib.rs
rusts社区为我们提供了大量高质量的第三方包,可以在`crates.io`或者`lib.rs`中检索使用,更推荐`lib.rs`,搜索功能更强大,但是下载依赖还是需要`crates.io`

### 使用`{}`简化引入方式
```rust
use std::collections::HashMap;
use std::collections::BTreeMap;
use std::collectiosn::HashSet;

use std::cmp::Ordering;
use std::io;
```
可以使用`{}`一起引入,大型项目中,这种引入,可以减少大量`use`的引用:
```rust
use std::collections::{HashMap,BTreeeMap,HashSet};
use std::{cmp::Ordering,io};
```
对于这种的
```rust
use std::io;
use std::io::Write;
```
可以使用`{}`简化:
```rust
use std::io::{self,Write};
```
####  self
上面使用了`self`关键字,用于替代模块本身

### 使用`*`引入模块下的所有项
对于之前一行一行引入`std::collections`的方式,还可以使用:
```rust
use std::collections::*；
```
引入`std::collections`下的所有公共项,这些公共项自然包括了`HashMap`,`HashSet`等想要手动引入的集合类型
使用`*`需要小心:很难知道哪些被引入了当前作用域:
```rust
use std::collections:*；

struct HashMap;

fn main(){
	let mut = HashMap::new()；
	v.insert("a",1);
}
```
### 受限的可见性

rust中包是一个模块树,可以通过`pub(crate) item;`这种方式来实现:`item`虽然是对外可见的,但是只在当前包内可见,外部无法引入到该`item`

如果我们想要某一项可以在整个包中都可以被使用,有:
- 在包跟中定义一个非`pub`类型的`X`(夫模块的项对子模块都是可见的)
- 在子模块定义一个`pub`类型的`Y`,`use`引入到包跟
```rust
mod a{
	pub mod b{
		pub fn c(){
			println!("{:?}",crate::X);
		}
		
		#[derive(Debug)]
		pub struct Y;
	}
}

#[derive(Debug)]
struct X;
use a::b::Y;
fn d(){
	println!("{:?}",Y)；
}
```
有时候却会碰见这两种都不太好使的时候:
例如,希望对于某些特定的模块可见:
```rust
//目标:'a'导出'I‘,'bar'and'foo',其他的不到处
pub mod a{
	pub const I:i32 = 3;
	
	fn semisecret(x:i32)->i32{
		use self::b::c::J；
		x+J;
	}
	
	pub fn bar(z:i32)->i32{
		semisecret(I)*z
	}
	pub fn foo(y:i32)->i32{
		semisecret(I)+y
	}
	mod b {
		mod c{
			const J:i32=4;
		}
	}
}
```
子模块中的项对父模块是不可见的,这里`semisecret`方法中,`a`->`b`->`c`形成的父子模块链,`c`中的`J`对`a`模块不可见
若想要保持`J`私有,同时让`a`继续使用`semisecret`函数的办法是将该函数移动到`c`模块中,然后用`pub use`将`semisecret`将函数进行再导出:
```rust
pub mod a{
	pub const I:i32=3;
	
	use self::b::semisecret;
	
	pub fn bar(z:i32)->i32{
		semisecret(I)*z
	}
	pub fn foo(y:i32)->i32{
		semisecret(I)+y
	}
	mod b{
		pub use self::c::semisecret;
		mod c{
			const J:i32=4;
			pub fn semisecret(x:i32)->i32{
				x+J
			}
		}
	}
}
```
如果我们想保持代码逻辑,同时只让`J`在`a`内可见呢?
```rust
pub mod a{
	pub const I:i32 = 3;
	
	fn semisecret(x:i32)->i32{
		use self::b::c::J;
		x+J
	}
	pub fn bar(z:i32)->i32{
		semisecret(I)*z
	}
	pub fn foo(y:i32)->i32{
		semisecret(I)+y
	}
	
	mod b{
		pub(in crate::a)mod c{
			pub(in crate::a) const J:i32 = 4;
		}
	}
}
```
通过`pub(in crate::a)`的方式,指定了模块`c`和常量`J`的可见范围都是`a`模块内,`a`之外的模块是完全访问不到的
#### 限制可见性语法
`pub(crate)`或者`pub(in crate::a)`就是限制可见性语法,前者是限制在整个包内可见,后者是通过绝对路径,限制在包内的某个模块内可见:
- `pub`意味着可见性无任何限制
- `pub(crate)`表示在当前包内可见
- `pub(self)`在当前模块可见
- `pub(in<path>)`表示在某个路径代表的模块中可见,其中`path`必须是父模块或者祖先模块
#### 一个综合例子
```rust
mod my_mod{
	//模块中的项默认具有私有的可见性
	fn private_function(){
		println!("called 'my_mod::private_function()'");
	}
	//使用`pub`修饰语法来改变默认可见性
	pub fn function(){
		println!"called 'my_mod::function()'");
	}
	//在同一模块中,项可以访问其他项,即便是私有的
	pub fn indirect_access(){
		print!("called 'my_god::indirect_access()',that\n>");
	}
	
	//模块可以嵌套
	pub mod nested{
		pub fn function(){
			println!("called 'my_god::nested::function()'");
		}
		#[allow(dead_code)]
		fn private_function(){
			println!("called 'my_god::nested::private_function()'");
		}
	}
	
	//使用`pub(in path)`语法定义的函数只会在给定的路径中可见
	//'path'必须是父模块(parent module)或者(ancester module)
	pub(in crate::my_god)fn public_function_in_my_god(){
		print!("called 'my_mod::nested::public_function_in_my_mod()',that\n?"
		public_function_in_nested()
	}
	//使用'pub(self)'语法定义的函数则只在当前模块中可见
	pub(self) fn public_function_in_nested(){
		println!("called 'my_mod::nested::public_function_in_nested");
	}
}

	pub fn call_public_function_in_my_mod(){
	print!("called 'my_mod::call_public_function_in_my_mod()',that\n>")；
	nested::public_function_in_my_mod();
	print!(">");
	nested::public_function_in_super_mod();
}

	//'pub(crate)'使得函数只在当前包内可见
	pub(crate) fn public_function_in_crate(){
		println!("called'my_mod::public_function_in_crate()");
	}
	
	//嵌套模块的可见性遵循相同的规则
	mod private_nested{
		#[allow(dead_code)]
		pub fn function(){
			println!("called 'my_mod::private_nested::function()'");
		}
	}

fn function(){
	println!("called 'fucntion'")
}
fn main(){
	function();
	my_mod::function();
	
	my_mod::indirect_access();
	my_mod::nested::function();
	my_mod::call_public_function_in_my_mod();
	
	my_mod::public_function_in_crate();
	
	//pub(in path)只能在指定的模块中访问
	//error!'public_function_in_my_mod'is private
	//my_mod::nested::public_function_in_my_mod();
	//试一试取消该行的注释
	
	//模块的私有项不呢个直接访问,即便是嵌套在共有模块的内部的
	
	//Error!`private_function`is private
	//my_mod::private_function();
	//试一试取消注释
	
	//Error!'private_function'is private
	//my_mod::nested::private_function();
	//试一试取消注释
	
	//Error!'private_nested'is private
	//my_mod::private_nested::function();
	//试一试取消注释
}
```
