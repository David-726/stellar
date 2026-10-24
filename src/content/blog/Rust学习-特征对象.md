---
title: 特征对象
published: '2026-10-12'
description: ''
tags:
  - Rust学习
draft: false
---
trait那一章节有一段代码没有通过编译:
```rust
fn returns_summarize(switch:bool)->impl Summary{
	if switch{
		Post{
		//...
		}
	}else{
		Weibo{
		//...
		}
	}
}
```
其中`Post`和`Weibo`都实现了`Summary`特性,上面的函数试图通过返回`impl Summary`来返回`Post`和`Weibo`,但是却被无情的拒绝了,因为不支持返回多种类型,
但是我们就是想要返回多种类型,怎么整?
一款游戏,我们需要将多个对象渲染在屏幕上,这些对象属于不同的类型,存储在列表中,渲染的时候,需要循环该列表并顺序循环每个对象,在rust中的实现:
枚举,启动!
```rust
#[derive(Debug)]
enum Uiobjetc{
	Button,
	SelectBox,
}
fn main(){
	let objects = [
		UiObject::Button,
		UiObject::SelectBox
	];
	for o in objects{
		draw(o)
	}
}

fn draw(o:UiObject){
	println!("{:?}",o);
}
```
对,但是另一种情况:如果你的对象集合并不能实现正确的知道呢?这个时候枚举的类型还是有点缺少的,还需要修改代码增加1个枚举对象
在编写这个UI库时,我们不知道所有的UI对象类型,只知道:
- UI对象的类型不同
- 需要一个统一的类型来处理这些对象,无论是作为函数参数还是作为列表中的一员
- 需要对每一个对象调用`draw`方法
在有继承的语言中,会先创建一个`Component`的类,该类上有一`draw`方法,其余的比如`Button``Image`或者`SelectBox`会从`Component`派生并因此继承`draw`方法,各自足以覆盖`draw`方法来定义自己的行为,但是框架会把所有这些类型当作`Component`的实例,并在其中调用`draw`;不过rust并没有继承,额啊啊啊啊
#### 特征对象
rust引入一个概念-特征对象
先给之前的UI组件定义一个特征:
```rust
pub trait Draw{
	fn draw(&self);
}
```
只要组件实现了`Draw`特征,就可以调用`draw`方法来进行渲染,假设有一个`Button`和`SelectBox`组件实现了`Draw`组件:
```rust
pub trait Button{
	pub width:u32,
	pub height:u32,
	pub label:String,
}
impl Draw for Button{
	fn draw(&self){
		//绘制SelectBox的代码
	}
}
struct SelectBox{
	width:u32,
	height:u32,
	options:Vec<StringA>,
}
impl Draw for SelectBox{
	fn draw(&self){
		//绘制SelectBox的代码
	}
}
```
还需要一个动态数组来存储这些UI对象
```rust
pub struct Screen{
	pub components:Vec<?>,
}
```
注意到上面的`?`,意思是:我们应该填入上面类型,因为`Button`和`SelectBox`都实现了`Draw`特征,我们可以将`Draw`特征的对象作为类型,填入到数组中
**特征对象**指向实现了`Draw`特征的类型的实例,也就是指向了`Button`或者`SelectBox`的实例,这种映射关系是存在一张表中的,可以在运行的时候通过特征对象找到具体调用的类型方法
可以通过`&`引用或者`Box<T>`智能指针的方式来创建特征对象
>whats`Box<T>`
>先当作一个引用看到,只不过它包裹的值会被强制分配在堆上

```rust
trait Draw{
	fn draw(&self)->String;
}
impl Draw for u8{
	fn draw(&self)->String{
		format!("u8:{}",*self)
	}
}
impl Draw for f64{
	fn draw(&self)->String{
		format!("f64:{}",*self)
	}
}
//若T实现了Draw特征,则调用该函数的时候传入的Box<T>可以被隐式的转换为函数参数签名中的Box<dyn Draw>
fn draw1(x:Box<dyn Draw>){
	x.draw();
}
fn draw2(x:&dyn Draw){
	x.draw();
}
fn main(){
	let x = 1.1f64;
	let y = 8u8;
	
	//x和y的类型T都实现了`Draw`特征,因为Box<T>可以在函数调用时隐式的转换为特征对象
	//基于x的值创建了1个Box<f64>类型的智能指针,指针指向的数据被防止在堆上
	draw1(Box::new(x));
	draw1(Box::new(y));
	draw2(&x);
	draw2(&x);
}
```
- `draw1`函数的参数是`Box<dyn Draw>`形式的特征对象,特征对象是通过`Box::new<x>`的方式创建
- `draw2`函数的参数是`*dyn Draw`形式的特征对象,特征对象是通过`&x`的方式创建的
- `dyn`关键字只用在特征对象的类型声明上,创建的时候不需要用`dyn`
- `dyn`->dynamic
下面继续上面的UI组件
```rust
pub struct Screen{
	pub components:Vec<Box<dyn Draw>>,
}
```
存储1个动态数组,里面元素类型是`Draw`特征对象:`Box<dyn Draw>`,任何实现了`Draw`特征的对象,都可以存放其中
再来为`Screen`定义`run`方法,用于将列表中的UI组件渲染在屏幕上:
```rust
impl Screen{
	pub fn run(&self){
		for components in self.components.iter(){
			component.draw();
		}
	}
}
```
若是使用泛型来实现:
```rust
pub struct Screen<T:Draw>{
	pub components:Vec<T>,
}
impl <T> Screen<T>
	where T:Draw{
	pub fn run(&self){
		for component in self.components.iter(){
			component.draw();
		}
	}
	}
```
上面的`Screen`的列表中,存储了类型为`T`的元素,然后在`Screen`中使用特征为`T`实现了`Draw`特征,进而可以直接调用`draw`方法
这种写法限制了`Screen`实例的`Vec<T>`中**每个元素必须是相同类型**
如果我们只需要相同类型的集合,我们更倾向于采用泛型+特征约束的写法,实现更清晰,且性能更好
接下来运行渲染UI组件:
```rust
fn main(){
	let screen = Screen{
		components:vec![
			Box::new(SelectBox[
				width:75,
				height:10,
				options:vec![
					String::from("Yes"),
					String::from("Maybe"),
					String::from("No")
				],
			]),
			Box::new(Button{
				width:50,
				height:10,
				label:String::from("OK"),
			}),
		],
	};
	
	screen.run();
}
```
上面使用`Box::new(T)`方式创建了2个`Box<dyn Draw>`特征对象,以后若是还需要添加UI组件,让该组件实现`Draw`特征,则可以很轻松的渲染在屏幕上

在动态语言当中,有一个很重要的概念:**鸭子类型(duck typing)**,简单而言,就是只关心值长什么样,而不关心实际是什么。??!!当以恶个东西走起来像鸭子,叫起来像鸭子,那么它就是一只鸭子,就算实际上是只坤,我们也认为它是鸭子
上例中,`Screen`在`run`的时候,并不需要知道各个组件的类型是什么,也不检查到底是`button`还是`SelectBox`实例,只要实现了`Draw`特征,就能通过`Box::new`包装成`Box<dyn Draw>`特征对象,然后渲染在屏幕上
使用特征对象和rust类型系统来进行类似鸭子类型的优势是,无需在运行时检查一个值是否实现了特定方阿飞或者担心调用时没有实现方法而产生错误,**如果值没有实现特征对象所需要的特征,那么rust根本就不会编译这些代码**
```rust
fn main(){
	let screen = Screen{
		components:vec![
			Box::new(String::from("Hi")),
		],
	};
	
	screen.run();
}
```
因为`String`类型没有实现`Draw`特征,编译器就会直接报错,不让上面代码运行。若想要`String`类型被渲染在屏幕上,那么只需要为其实现`Draw`特征,很容易
注意`dyn`不能单独作为特征对象的定义,原因是特征对象可以是任意实现了某个特征的类型,编译器在编译器不知道该类型的大小,不同的类型大小不同:
```rust
fn draw2(x:dyn Draw){
	x.draw();
}
```
而`&dyn`和`Box<dyn>`在编译期都是已知大小,可以作为特征对象定义
```rust
fn draw2(x:dyn Draw){
	x.draw();
}
```
#### 特征对象的动态分发
在泛型中,泛型在编译期完成处理:编译器会为每一个泛型参数独赢的具体类型生成一份代码,这种方式是**静态分发**(static dispatch),因为是在编译期间完成的,对于运行期性能完全没有影响.
然而**动态分发**(dynamic dispatch),这种情况下,只有在运行时,才能确定需要调用什么方法,这也就是`dyn`的动态之一
使用特征对象时,rust必须使用dynamic dispacth。编译器无法知晓所有可能用于特征对象代码的类型,所以也不会知道应该调用哪个类型的哪个方法实现。动态分发也组织编译器有选择的内联方法代码,这会相应的禁用一些优化





<img src="/posts/assets/707765d05636642b-Pasted-image-20261012191317.jpg" alt="Pasted image 20261012191317.jpg" loading="lazy" />




- 特征对象大小不固定
- 几乎总是使用特征对象的引用方式:`&dyn Draw`,`Box<syn Draw>`
	- 虽然特征对象没有固定大小,但是引用类型的大小是固定的,由2个指针组成(`ptr`和`vptr`),因此占用2个ptr大下
	- `ptr`指向实现了特征`Draw`的具体类型的实例,也就是当作特征`Draw`来用的类型的实例
	- 另一个指针`vptr`指向一个虚表`vtable`,`vtable`中保存了`Button`或者`SelectBox`的实例对于可以调用的实现于特征`Draw`的方法,调用方法时,直接从`vtable`中找到方法并调用,使用`vtable`来保存实例是因为,实现了特征`Draw`的类型很多,各种类型拥有的方法不同,当将这些类型的实例都当作特征`Draw`来使用,都可以看作特征`Draw`类型的实例,有必要区分这些实例各自有什么方法调用
简而言之,类型`Button`实现了特征`Draw`时,类型`Button`的实例对象`btn`可以当作特征`Draw`特征对象来使用,`btn`中保存了作为特征对象的数据指针(指向类型`Button`的实数据)和行为指针(指向`vtable`)
Notice:
此时的`btn`是`Draw`的特征对象的实例,不再是具体类习惯`Button`的实例,且`btn`的`vtable`只包含了实现子特征`Draw`的那些方法,因此`btn`只能调用实现与特征`Draw`的`draw`方法,而不能调用`Button`本身的方法和类型`Button`实现与其他特征的方法.**`btn`是哪个特征的实例,它的`vtable`中就包含了改特征的方法**

#### Self和self
rust中,有2个`self`,一个指代当前的实例对象,一个指代特征或者方法类型的别名:
```rust
trait Draw{
	fn draw(&self)->Self;
}

#[derive(Clone)]
struct Button;
impl Draw for Buuton{
	fn draw(&self)->Self{
		return self.clone()
	}
}

fn main(){
	let button = Button;
	let newb = button.draw();
}
```
上面`self`指代的就是实例对象,`Self`指代的是`Button`类型
#### 特征对象的限制
不是所有特诊都能拥有特征对象,只有对象安全的特征才行,一个特征的方法都具有如下属性,它的对象才是安全的:
- 方法的返回类型不能是`Self`
- 方法没有任何泛型参数
对象安全对于特征对象是必须的,因为一旦有了特征对象,就不需要知道实现改特征的具体类型是什么了。如果特征方法返回了具体的`Self`类型,但是特征对象忘记了真正的类型,这时候`Self`就很尴尬。
对于泛型而言,使用特征的时候会在编译期间放入对应的类型参数:此具体类型变成了实现改特征的一部分,而当使用特征对象时其具体类型被抹去了,就无从得知放入泛型参数类型是什么了
标准库中的`Clone`就不符合:
```rust
pub trait Clone{
	fn clone(&self)->Self;
}
```
`String`类型实现了`Clone`特征,实例上调用`clone`方法会得到1个`String`实例,类似的,调用`Vec<T>`实例的`clone`方法会得到一个`Vec<T>`实例;`clone`签名需要知道什么类型会替代`Self`,因为这是它的返回值
```rust
pub struct Screen{
	pub componenys:Vec<Box<dyn Clone>>,
}
```
Error:
```
```