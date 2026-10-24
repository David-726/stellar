---
title: 初识生命周期
published: '2026-10-15'
description: ''
tags:
  - Rust学习
draft: false
---
生命周期:
就是引用的有效作用域.大多数时候,因为编译器可以自动推导.
多个生命周期存在，且编译器无法推导出某个引用的生命周期时，就需要我们手动标明生命周期.
生命周期是rust特有的,比较难。
### 悬垂指针和生命周期
生命周期的作用主要是避免悬垂引用,导致程序引用了本不该引用的数据:
```rust
{
	let r;
	{
		let x = 5;
		r = &x;
	}
	println!("r:{}",r);
}
```
Notice:
- `let r`生命方式存在使用`null`的风险,实际上,当我们不初始化就使用时,编译器会给予报错
- `r`引用了内部花括号中的`x`变量,但是`x`会在内部花括号内`}`处被释放,回到外部花括号后,`r`或引用一个无效的`x`
这里的`r`就是1个悬垂指针,引用了提前被释放的变量`x`,Error:
```
```
#### 借用检查
保证rust的所有权和借用的正确性,rust使用了一个借用检查器(Borrow checker),来检查我们程序的借用正确性:
```rust
{
    let r;                // ---------+-- 'a
                          //          |
    {                     //          |
        let x = 5;        // -+-- 'b  |
        r = &x;           //  |       |
    }                     // -+       |
                          //          |
    println!("r: {}", r); //          |
}                         // ---------+
```
这里`r`变量被赋予了生命周期`'a`,`x`被赋予了生命周期`'b`,可以明显知道了生命周期`'b`比`'a`小很多
rust会比较2个变量的生命周期,结果发现`r`明明有生命周期`'a`,但是却引用了一个小的多的生命周期`'b`,这种情况下,编译器会认为我们的程序存在风险,因此拒绝执行
要想编译通过,只需要`'b`比`'a`大,总之`x`变量要比`r`活得久,那么`r`就能随意引用`x`且不会存在危险:
```rust
{
    let x = 5;            // ----------+-- 'b
                          //           |
    let r = &x;           // --+-- 'a  |
                          //   |       |
    println!("r: {}", r); //   |       |
                          // --+       |
}                         // ----------+
```
#### 函数中的生命周期
一个例子-返回2个字符串切片中较长的那个,该函数的参数是2个字符串切片,返回值也是字符串切片
```rust
fn main(){
	let string1 = String::from("abcd");
	let string2 = "xyz";
	
	let result = longest(string1.as_str(),string2);
	println!("The longest string is {}",result);
}
fn longest(x:&str,y:&str)->&str{
	if x.len()>y.len(){
		x
	}else
	{
		y
	}
}
```
这一段`longest`的实现,十分的又没,连多余的`return`和分号都没有,但是还是Error:
```
```
编译器不知道该函数的返回值到底引用`x`还是引用`y`,**因为编译器需要知道这些,来确保函数调用后的引用生命周期分析**
定义函数时,无法知道传递给函数的具体值,因此到底是`if`还是`else`被执行,无从得知。其次,传入引用的具体生命周期也无法知道,不能像之前那样通过分析生命周期来确定引用是否有效,同时,编译器的借用检查也无法推导出返回值的生命周期,因此不知道`x`和`y`的的生命周期和返回值的生命周期之间的关系是怎么样的
存在多个引用时,编译器有时候会无法自动推导生命周期,此时就需要我们**手动去标注**,通过为参数标注合适的生命周期来帮助编译器进行借用检查的分析
#### 生命周期标注语法
很多时候我们需要标注生命周期来告诉编译器:相信我们！！！
生命周期的语法也颇为不同,以`'`开头,名称往往是一个单独的小写字母,大多数人以`'a`来作为生命周期的名称,如果是引用类型的参数,那么生命周期会位于`&`之后,并用一个空格来讲生命周期和引用参数分割开
```rust
&i2      //一个引用
&‘a i32  //具有显式声明周期的引用
&'a mut i32 //具有显式生命周期的可变引用
```
一个生命周期标注,本身并不具有什么意义,但是生命周期的作用是告诉编译器多个引用之间的关系.有一个函数,第一个参数`first`是一个指向`i32`类型的引用,具有生命周期`'a`,该函数还有另一个参数`second`,也是指向`i32`类型的引用,并且同样具有生命周期`'a`,此处生命周期标注仅仅说明,**这2个参数`first`和`second`至少活的和`'a`一样久,至于到底活多久或者哪个获得更久,都无从得知**
```rust
fn useless<'a>(first:&‘a i32,second:&'a i32){}
```
#### 函数签名中的生命周期标注
继续之前的`longest`函数,从2个字符串切片中返回较长的那个:
```rust
fn longest<'a>(x:&'a str,y:&’a str)->&'a str{
	if x.len()>y.len(){
		x
	}else{
		y
	}
}
```
Notice:
- 和泛型一样,使用生命周期参数,需要先声明`'<a>`
- `x``y`和返回值至少活的和`'a`一样久
该函数签名表示对于某些生命周期`'a`,函数的2个参数都至少要和`'a`活的一样久,同时函数的返回引用也要获得和`'a`一样久.同时函数的返回引用也要和`'a`活的一样久.实际上,这意味者返回值的生命周期和参数生命周期中的较小值一致:虽然两个参数的生命周期都是标注了 `'a`，但是实际上这两个参数的真实生命周期可能是不一样的（生命周期`'a`不代表生命周期等于`'a`，而是大于等于`'a`）。
**通过函数签名指定生命周期指定生命周期参数时,我们并没有改变传入引用或者引用的真实生命周期,而是告诉编译器不满足此约束条件时,就拒绝编译通过**
因此`longest`并不知道`x`和`y`具体会活多久,只需要知道作用域至少能持续`'a`这么长就行
当把具体的引用传给`longest`时,生命周期`'a`的大小就是`x`和`y`的作用域的重合部分,换句话说,`'a`的大小将等于`x`和`y`中较小的那个,由于返回值的生命周期被标记为`'a`,因此返回值的生命周期也是`x`和`y`中作用域较小的那个

举个例子:
```rust
fn main(){
	let string1 = String::from("long string is long");
	{
		let string2 = String::from("xyz");
		let result = longest(string1.as_str(),string2.as_str());
		println!("The longest string is {}"，result);
	}
}
```
在上例中，`string1` 的作用域直到 `main` 函数的结束，而 `string2` 的作用域到内部花括号的结束 `}`，那么根据之前的理论，`'a` 是两者中作用域较小的那个，也就是 `'a` 的生命周期等于 `string2` 的生命周期，同理，由于函数返回的生命周期也是 '`a`，可以得出函数返回的生命周期也等于 `string2` 的生命周期。
再看一个例子:
```rust
fn main(){
	let string = String::from("long string is long");
	let result;
	{
		let string2 = String::from("xyz");
		result = longest(string1.as_str(),string2.as_str());
	}
	println!("The longest string is {}",result);
}
```
Bang,Error:
```
```
`longest`函数中,`string2`生命周期也是`'a`,说明`string2`也必须活到`println!`处,可是`string2`在代码中,既然如此,编译器不该如此矫情才对,应该能认识到`result`没有引用`string2`。但是事实就是如此:
rust编译器在调教上十分保守...
#### 深入思考生命周期标注
使用生命周期的方式往往取决于函数的功能,例如之前`longest`函数,若它永远只返回一个参数`x`,生命周期的标注该如何修改:
```rust
fn longest<'a>(x:&'a str,y:&str)->&'a str{
	x
}
```
`y`完全没有被使用,因此`y`的生命周期和`x`和返回值的生命周期没有关系,意味着我们也不必再为`y`标注生命周期,只需要标注`x`参数和返回值即可
函数的返回值是一个引用类型,那么它的生命周期只会来源于:
- 函数参数的生命周期
- 函数体内某个新建引用的生命周期
后者,就是典型的悬垂引用场景:
```rust
fn longest<'a>(x:&str,y:&str)->&'a str{
	let result = String::from("really long string");
	result.as_str()
}
```
上面的函数的返回值就和参数 `x`，`y` 没有任何关系，而是引用了函数体内创建的字符串，那么很显然，该函数会Error:
```
```
主要问题在于:`result`在函数结束之后就被释放,但是函数结束之后,对`result`的引用依然还是在继续,这种情况下,等于`result`的引用依然在继续,这种情况下,没有办法指定合适的生命周期让编译通过,因此我们也就在rust中避免了悬垂引用
返回内部
这种情况下,最好的办法就是返回内部字符串的所有权,然后把字符串的所有权转移给调用者:
```rust
fn longest(_x:&str,_y:&str)->String{
	String::from("really from string")
}
fn main(){
	let s = longest("not","important");
}
```
生命周期语法用来将函数的多个引用参数和返回值的作用域关联在一起,一旦关联在一起,rust就有了充分的信息来确保操作是内存安全的

#### 结构体中的生命周期
结构体也拥有生命周期,在结构体中使用引用也变得可能:只要为结构体的**每一个引用都标注上生命周期**即可:
```rust
struct ImportantExcerpt<'a>{
	part:&'a str,
}
fn main(){
	let novel = String::from("Call me Ischmal.Some years ago...");
	let first_sentence = novel.split('.').next().expect("Could not find a '.'");
	let i = ImportantExcerpt{
		part:first_sentence,
	};
}
```

结构体的生命周期标注语法和泛型参数很像,需要对生命周期进行声明`<'a>`,该生命周期标注说明,需要对生命周期参数进行声明`<'a>`,该声明周期的标注说明,**结构体`ImportantExcerpt`引用的字符串`str`的生命周期大于等于该结构体的声明周期**,
从 `main` 函数实现来看，`ImportantExcerpt` 的生命周期从第 4 行开始，到 `main` 函数末尾结束，而该结构体引用的字符串从第一行开始，也是到 `main` 函数末尾结束，可以得出结论**结构体引用的字符串生命周期大于等于结构体**，这符合了编译器对生命周期的要求，因此编译通过。
相反的:
```rust
#[derive(Debug)]
struct importantExcerpt<'a>{
	part:&'a str,
}
fn main(){
	let i;
	{
		let novel = String::from("Call me Ishmael.Some yaers ago..");
		let first_sentence = novel.sply('.').next().expect("Could not find a '.'");
		i = ImportantExcerpt{
			part:first_sentence;
			
		};
	}
	println!("{:?}",i);
}
```
**这个例子结构体就是比字符串活的还要久**,引用字符串在内部语句块末尾'}'被释放后,`println!`依旧在外面使用该结构体,导致了无效的引用。
#### 生命周期消除
对于编译器而言,每一个引用类型都有一个生命周期,那为什么在我们的使用过程中,很多时候无需标注生命周期:
```rust
fn first_word(s:&str)->&str{
	let bytes = s.as_bytes();
	
	for (i,&ietm) in bytes.iter().enumerate(){
		if item == b' '{
			return &s[0..i];
		}
	}
	&s[..]
}
```
该函数的参数和返回值都是引用类型,尽管没有显式的标注生命周期,编译依旧可以通过,**编译器为了简化用户的使用,运用了生命周期消除大法**
对于`first_word`函数,返回值是一个引用类型,那么该引用就只有2种情况:
- 从参数获取
- 从函数体内部新创建的变量获取
后者,会出现悬垂引用,最终被编译器拒绝,因此只能是返回值的引用是从参数中获取,意味着参数和返回值的生命周期是一样的,编译器可以看出来这种很简单的规则
实际上,rust1.0版本之前,这种代码果断不给通过,rust要求必须显式的引用标注生命周期:
```rust
fn first_word<'a>(s:&'a str)->&'a str{}
```
天下苦生命周期标注久矣!!!,社区怨声载道,最终揭竿而起,才有了今天的现状。
Notice:
- 消除规则不是万能的,有时候编译器会看不出来
- **函数或者方法中,参数的生命周期被称之为`输入生命周期`,返回值的生命周期被称之为`输出生命周期`**
#### 3条消除规则
- 每一个引用参数都会获得独自的生命周期:
  如一个引用参数的函数就有一个生命周期标注:`fn foo<'a>(x:&'a i32)`,2个引用参数的有2个生命周期标注:`fn foo<'a,'b>(x:&'a i32,y:&'b i32)`,依次进行
- **若只有一个输入生命周期(函数参数中只有一个引用类型),那么该声明周期会被赋予个i所有的输出生命周期**
	如`fn foo(x:&i32)->&i32`,`x`参数的生命周期会被自动赋给返回值`&i32`,因此该函数等同于`fn foo<'a>(x:&'a i32)->&'a i32`
- **若存在多个输入生命周期,其中一个是`&self`或者`&mut self`,则`&self`生命周期被赋给所有的输出生命周期**
	拥有`&self`形式的参数,说明该函数是一个`方法`,该规则让方法的使用便利性大幅提升
若一个方法的返回值的生命周期和参数`&self`的不一样,需要手动标注生命周期,因为这些规则只是编译器发现没有标注生命周期时默认使用的.
EG1:
```rust
fn first_word(s:&str)->&str{}
```
=>
```rust
fn first_word<'a>(s:&'a str)->&str{}
```
=>
```rust
fn first_word<'a>(s:&’a str)->&‘a str{}
```
EG2：
```rust
fn longest(x:&str,y:&str)->&str{}
```
=>
```rust
fn longest<'a,'b>(x:&'a str,y:&’b str)->&str{}
```
Error:
```
```
需要我们手动标注生命周期
#### 方法中的生命周期
先来回忆泛型的语法：
```rust
struct Point<T>{
	x:T,
	y:T,
}
impl<T> Point<T>{
	fn x(&self)->&T{
		&self.x
	}
}
```
实际上为有生命周期的结构体实现方法时候,我们使用的语法和泛型参数语法很相似:
```rust
struct ImportantExcerpt<'a>{
	part:&'a str,
}
impl <'a> ImportantExcerpt<'a>{
	fn level(&self)->i32{
		3
	}
}
```
Notice:
- `impl`中必须使用结构体的完整名称,包括`<'a>`,因为生命周期标注也是结构体类型的一部分
- 方法签名中,往往不需要标注生命周期,得益于生命周期消除的第一个第三原则
eg:
```rust
impl <'a> ImportantExcerpt<'a>{
	fn announce_and_return_part(&self,announcement:&str)->&str{
		println!("Attention please:{}",announcement);
		self.part
	}
}
```
首先,编译器应用第一规则,给与每个输入参数一个周期
```rust
impl<'a> ImportantExcerpt<'a>{
	fn announce_and_return_part<'a>(&'a self,announcement:&'b str)->&str{
		println!("Attention please:{}",announcement);
		self.part
	}
}
```
接着应用第三规则:
```rust
impl<'a> ImportantExcerpt<'a>{
	fn announce_and_return_part<'b>(&'a self,announcement:&'b str)->&'a str{
		println!("Atttention please:{}",announcement);
		self.part
	}
}
```
Bingo
来做个修改
```rust
impl<'a> ImportantExcerpt<'a>{
	fn announce_and_return_part<'b>(&'a self,announcement:&'b str)->&'b str{
		println!("Atttention please:{}",announcement);
		self.part
	}
}
```
Error,编译器无法知道`'a`和`'b`的关系,`&self`生命周期是`'a`,那么`self.part`的生命周期也是`'a`,但是我们手动设置返回值`self.part`标注了生命周期`'b`,因此编译器需要知道`'a`和`'b`的关系

因为`&'a self`是被引用的一方,所有引用她的`&'b str`必须活的比她短,否则会出现悬垂引用,因此我们做出修改:
```rust
impl<'a:'b,'b> ImportantExcerpt<'a>{
	fn announce_and_return_part(&'a self,announcement:&'b str)->&'b str{
		println!("Attention please:{}"，announcement);
		self.part
	}
}
```
- `'a:'b`生命周期约束语法,说明`'a`必须比`'b`活得久
- 可以把`'a`和`'b`都在同一个地方声明,或者分开声明但是通过`where 'a:'b`约束生命周期关系,like this:
```rust
impl<'a> ImportantExcerpt<'a>{
	fn announce_and_return_part<'b>(&'a self,announcement:&'b str)->&'b str
	where
		'a:'b,
	{
		println!("Attention please:{}",announcement);
		self.part
	}
}
```
#### 静态生命周期
rust中有一个特殊的生命周期,就是`'static`,拥有该生命周期的引用可以和整个程序活的一样久：
之前学过字符串字面量,就是说被硬编码进rust的二进制文件,因此这些字符串变量都有`'static`的生命周期:
```rust
let s:&'static str = "I dont have any advantages,but only live well,Jesius Chirst"
```
不少情况下,`'static`确实可以解决生命周期编译不通过的问题,但是 