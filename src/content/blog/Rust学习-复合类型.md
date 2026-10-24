---
title: 复合类型
published: '2026-10-06'
description: ''
tags:
  - Rust学习
draft: false
---
复合类型是由其他类型组合而来的,最典型的就是结构体`struct`和枚举`enum`
来看一段例子:
```rust
#![allow(unused_variables)]
type File = String

fn open(f:&mut File)->bool{
	true
}
fn close(f:&mut File)->bool{
	true
}

#![allow(dead_code)]
fn read(f:&mut File,save_to:&mut Vec<u8>)->!{
	unimplemented!()
}

fn main(){
	let mut f1=File::from("f1.txt")；
	open(&mut f1);
	// read(&mut f1,&mut vec![])
	close(&mut f1);
}
```
我们需要排除一些编译器噪声(Rust在编译的时候会扫描代码,变量声明后未使用会以`warning`警告),引入`#[allow(unused_variables)]`属性标记,告诉编译器忽略未使用的变量,不要抛出`warning`警告；
`read`函数返回1个`!`类型,表明该函数时一个发散函数,不会返回任何值,包括`()`,`unimplemented()`表示该函数尚未实现,`unimplemented!()`通常意味着我们期望快速完成主要代码,回头再通过搜索这些标记来完成次要代码,类似的标记还有`todo!`,代码执行到这种未实现的地方时,程序会直接报错,可以反注释`read(&mut f1,&mut vec![]);`
### 字符串
先来看一段很简单的代码:
```rust
fn main(){
	let my_name="Pascal";
	greet(my_name);
	}
fn greet(name:String){
	println!("Hello,{}!",name);
}
```
上面的`greet`函数接受字符串类型的`name`参数,打印到终端控制台中,但是没有通过编译捏
```
Error:
```
我草泥马又是报错,编译器提示`greet`需要一个`String`类型的字符串,却传入了一个`&str`类型的字符串
### 切片(slice)
允许你引用集合中部分连续的元素序列,而不是引用整个集合
对于字符串,slice就是`String`类型中某一部分的引用:
```rust
let s = String::from("hello world")

let hello = &s[0..5];
let world = &s[6..11];
```
`hello`没有引用整个`String s`,而是引用了一部分,这就是切片的创建方式:**\[start index..end index]**,开始索引是切片中第一个元素的索引位置,而终止索引是最后一个元素后面的索引位置,换句话说,**这是一个左闭右开区间**,切片数据结构内部保存开始的位置和切片的长度,其中长度是通过`end index`-`start index`的方式计算得来的,对于`let world=&s[6..11];`而言,`world`是一个切片,该切片的指针指向`s`的第7个字节
使用rust的`..range`之时,下面都是从index0开始,二者等价
```rust
let s = String::from("hello");

let slice = &s[0..2];
let slice = &s[..2];
```
同样的,有:
```rust
let s = String::from("hello");

let len = s.len();

let slice = &s[4..len];
let slice = &s[4..];
```
也可以截取完整的`String`切片:
```rust
let s = String::from("hello")

let len = s.len()

let slice = &s[0..len]
let slice = &s[..]
```
>在对字符串使用切片的时候需要格外的小心,切片的索引必须落到字符之间的边界位置,也就是UTF-8字符的边界!这个时候的中文就很容易ERROR

字符串切片的类型是`&str`,因此我们可以声明一个函数,输入`String`函数,返回它的切片:`fn first_word(s:&String)->&str`
```rust
fn main(){
	let mut s = String::from("hello world");
	
	let word = first_word(&s);
	
	s.clear();
	
	println!("the first word is:{}",word);
}
fn first_word(s:&String)-> &str{
	&s[..1]
}
```
我日又Error!!!纳尼,瓦拉瓦库鲁西大->原来又是借用,当我们已经有了可变借用之时,就无法再拥有不可变的借用,因为`clear`需要情况改变`String`,因此它需要一个可变借用;而之后的`println!`又使用了不可变借用,也就是在`s.clear()`处可变借用和不可变借用试图同时生效,因此编译不通过。
#### 其他切片
数组的切片:
```rust
let a = [1,2,3,4,5];

let slice = &a[1..3];

assert_eq!(slice,&[2,3]);
```
该数组切片的类型是`&[32]`,数组切片的工作方式和字符串切片是一样的。
#### 字符串字面量是切片
字符串字面量的类型:
```rust
let s = "Hello,world";
```
实际上,`s`的类型是`&str`
```rust
let s:&str="Hello,world"
```
### String
what's string?
**Rust中的字符是Unicode类型,每个字符占据了4个字节的内存空间,但是字符串是Utf-8编码,也就是字符串中的字符所占的字符数是变化的(1-4)**,有助于答复降低字符串占据的内存空间
Rust在语言级别,只有`str`一种string类型,通常以引用类型出现`&str`,也就是上面的字符串切片,但是在标准库中,还是又多种不同用途的字符串类型,其中最广的是`String`类型
`str`类型是硬编码进可执行文件,也无法被修改,但是`String`则是1个可增长,可改变且具有所有权的UTF-8编码字符串,**Rust 用户提到字符串时,往往指的是`String`类型和`&str`字符串切片,二者都是UTF-8类型**
Rust的stdio中,还是提供了如`OsString`,`OsStr`,`CString`,`CStr`,*分别对应的是具有所有权和被借用的变量*
#### String和&str的转换
之前的代码中,已经看见了好几种`&str`类型生成`String`类型的操作:
- `String::from("hello,world")`
- `"hello,world".to_string()`
如何将`String`类型转化为`&str`类型?
**答案很简单,取引用即可**
```rust
fn main(){
	let s = String::from("hello,world")
	say_hello(&s);
	say_hello(&s[..]);
	say_hello(s.as_str());
}
fn say_hello(s:&str){
	println("{}",s);
}
```
#### 字符串索引
在其他语言中,使用索引的方式访问字符串的某个字符或者字串都是很正常的行为,但是Rust不允许
```rust
let s1 = String::from("hello");
let h = s1[0];
```
Error!!!
##### 深入字符串内部
字符串的底层存储格式实际上是[`u8`],一个字节数组,对于英文而言一个string中的1个str实际代表的是,但是对于中文或者梵文就不是那回事了;还有另一个原因是:因为索引操作,我们总是期望他的性能表现是$Q(1)$,*但是对`String`而言,无法保证这一点,因为Rust需要从0开始遍历字符串来定位合法的字符*
#### 操作字符串
##### PUSH
在字符串尾部可以使用`push()`方法追加字符`char`,也可以使用`push_str()`方法追加字符串字面量,这两个方法都是在**原有的字符上追加,并不会返回新的字符串**,由于字符串追加操作要修改原来的字符串,所以需要PUSH的字符串必须是可变的:
```rust
fn main(){
	let mut s = String::from("Hello");
	
	s.push_str("rust");
	println!("追加字符串 push_str()->{}",s);
	
	s.push('!');
	println!("追加字符 push()->{}",s);
}
```
##### Insert
可以用`insert`方法插入字符`char`,也可以使用`insert_str()`方法插入字符串字面量,和`push()`不同的是,这俩方法需要传入2个参水,第一个是字符串插入位置的索引,第二个是要插入的字符(串),索引从0开始计数,如果越界则会发生错误
```rust
fn main(){
	let mut s = String::from("Hello rust")；
	s.insert(5,',');
	println!("插入字符 insert()->{}",s);
	s.insert(6,"I like");
	println!("插入字符串 insert_str()->{}",s);
}
```
##### Replace
###### `replace`
该方法可适用于`String`和`&str`类型,`replace()`方阿飞接收2个参数,第一个参数是要被替换的字符串,第二个参数是新的字符串,该方法会替换所有匹配的字符串,**该方法是返回1个新的字符串,而不是操作原来的字符串**
```rust
fn main(){
	let string_replace = String::from("I fuck rust.Learning rust is my favorite");
	let new_string_replace = string_replace.replace("rust","RUST");
	dbg!(new_string_replace);
}
```
###### `replacen`
该方法可以适用于`String`和`&str`类型,`replacen()`方法接收3个参数,前2个参数和`replace()`方法一样,第3个参数则表示替换的个数,**该方法返回一个新的字符串,而不是操作原来的字符串**
```rust
fn main(){
	let string_replace = String::from("I fuck rust.Learning rust is my favorite");
	let new_string_replacen = string_replace.replacen("rust","RUST",1);
	dbg!(new_string_replaen);
}
```
###### `replace_range`
该方法仅仅用于`String`类型,`replace_range`接收2个参数,第一个参数是要替换字符串的范围,第二个参数是新的字符串,**该方法是直接操作原来的字符串,不会返回新的字符串,该方法需要使用`mut`关键字修饰**
```rust
fn main(){
	let mut string_replace_range = String::from("I like rust");
	string_replace_range.replace_range(7..8,"R");
	dbg!(string_replace_range);
}
```
##### Delete
###### `pop`-删除并返回字符串的最后一个字符
**直接操作原来的字符串**,但是存在返回值,返回值是一个`Option`类型,若是字符串为空,则返回`None`
```rust
fn main(){
	let mut string_pop = String::from("rust pop 中文!");
	let p1 = string_pop.pop();
	let p2 = string_pop.pop();
	dbg!(p1);
	dbg!(p2);
	dbg!(string_pop);
}
```
###### `remove`-删除并返回字符串中指定位置的字符
**该方法是直接操作原来的字符串**,但是存在返回值,返回值是删除位置的字符串
```rust
fn main(){
	let mut string_remove = String::from("测试remove方法");
	println!(
		"string_remove占据{}个字节",
		std::mem::size_of_val(string_remove.as_strA());
	//删除第一个汉字
	string_removve.remove(0);
	//下面代码会发生错误
	//string_remove.remove(1);
	//直接删除第二个汉字
	//string_remove.remove(3);
	dgb!(string_remove);
	)
}
```
###### `truncate`-删除字符串中从指定位置开始到结尾的全部字符
**该方法时直接操作原来的字符串**,该方法`truncate()`时按照字节来处理字符串的,如果参数所给的位置不是合法的字符边界,则会发生错误
```rust
fn main(){
	let mut string_truncate = String::from("test truncate");
	string_truncate.truncate(3);
	dbg!(string_truncate);
}
```
###### `clear`-清空字符串
**该方法是直接操作原来的字符串**
```rust
fn main(){
	let mut string_clear = String::from("string clear");
	string_clear.clear();
	dbg!(string_clear);
}
```
##### 连接(Concatenate)
###### 使用`+`或者`+=`连接字符串
使用`+`或者`+=`连接字符串,要求右边的参数必须为字符串的切片引用(slice)类型。其实当调用`+`操作符时候,相当于调用了`str::string`标准库中的`add()`方法,这里`add()`方法的第二个参数是一个引用的类型。因此在我们使用`+`的时候,必须传递切牌你引用类型,不能直接传递`String`类型。`+`是**返回一个新的字符串,所以变量声明可以不需要`mut`关键字修饰**
```rust
fn main(){
	let string_append = String::from("hello");
	let string_rust = String::from("rust");
	// &string_rust会自动解引用为&str
	let result = string_append+&string_rust;
	let mut result = result+"!";
	result += "!!!";
	
	println!("连接字符串 +->{}",result);
}
```
`add()`方法的定义:
```rust
fn add(self,s:&str)->String
```
因为该方法涉及到更复杂的特征功能，因此在这里简单的说明:
```rust
fn main(){
	let s1 = String::from("hello,");
	let s2 = String::from("world!");
	// 下一句中,s1的所有权都被转移走了,因此后面不能再使用s1
	let s3 = s1+&s2;
	assert_eq!(s3,"hello,world!")；
	// 下面的语句去掉注释,就会报错
	// println!("{}",s1);
}
```
`Self`是`String`类型的字符串`s1`,该函数说明,只能将`&str`类型的字符串切片添加到`String`类型的`s1`上,然后返回一个新的`String`类型,所以`let s3=s1+&s2;`,就很好解释了,将`String`类型的`s1`和`&str`类型的`s2`加在一起,最终得到`String`类型的`s3`
由此可以推得,以下的代码也是合法的:
```rust
let s1 = String::from("tic");
let s2 = String::from("tac");
let s3 = String::from("toe");

//String = String+&str+&str+&str+&str
let s = s1+'-'+&s2+'-'+&s3;
```
`String+&str`返回一个`String`,然后再继续和一个`str`进行`+`操作,返回`String`类型,迭代后,最终的`s`也是一个`String`
###### 使用`format!`连接字符串
`format!`这种方式适用于`String`和`&str`。用法和`print!`用法相似。
```rust
fn main(){
	let s1 = "hello";
	let s2 = String::from("rust");
	let s = format!("{} {}!",s1,s2);
	println!("{}",s);
}
```
##### 字符串转义
我们可以通过转义的方式`\`输出ASCII和Unicode字符
```rust
fn main(){
	// 通过\+字符的十六进制表示,转义输出一个字符
	let byte_escape = "I'm writing \x52\x75\x73\x74!";
	println!("What are you ding\x3F (\\x3F means?){}",byte_escape);
	
	// \u 可以输出一个unicode字符
	let unicode_codepoint = "\u{211D}";
	let character_name = "\"DOUBLE-STRUCK CAPTIAL R\"";
	println!(
		"Unicode character {} (U+211D) is called {}";
		unicode_codepoint,character_name
	);
	//使用\忽略换行符
	let long_string = "String literals
						can span multiple lines.
						The linebreak and indentation here->\
						<- can be escaped tpp!";
	println!("{}",long_string);
}
```
在某些情况下,可能希望保持字符串的原样,不要转义:
```rust
fn main(){
	println!("{}","hello \\x52\\x75\\x73\\x74");
	let raw_str = r"Escapes don't work here:
	\x3F \u{211D}";
	println!("{}",raw_str);
	
	let quotes = r#"And then I said:"There is ne escaped!""#;
	println!("{}",quotes);
	 // 如果字符串中包含 # 号，可以在开头和结尾加多个 # 号，最多加255个，只需保证与字符串中连续 # 号的个数不超过开头和结尾的 # 号的个数即可
    let longer_delimiter = r###"A string with "# in it. And even "##!"###;
    println!("{}", longer_delimiter);
```

