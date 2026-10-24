---
title: 流程控制
published: '2026-10-10'
description: ''
tags:
  - Rust学习
draft: false
---
#### `if-else`来做分支控制
>if else 无处不在 -- 鲁迅
```rust
if condition == true {
    // A...
} else {
    // B...
}
```
和平常的没什么区别
```rust
fn main() {
    let condition = true;
    let number = if condition {
        5
    } else {
        6
    };

    println!("The value of number is: {}", number);
}
```
Notice:
- `if`语句块是**表达式**,使用`if`表达式的返回值来给`number`进行赋值:`number`的值是`5`
- 用`if`来赋值时,要保证每个分支返回的类型一样(不准确),否则就会Error!!!
#### 使用 else if 来处理多重条件
```rust
fn main() {
    let n = 6;

    if n % 4 == 0 {
        println!("number is divisible by 4");
    } else if n % 3 == 0 {
        println!("number is divisible by 3");
    } else if n % 2 == 0 {
        println!("number is divisible by 2");
    } else {
        println!("number is not divisible by 4, 3, or 2");
    }
}
```

### 循环控制
#### for循环
`for`循环是rust的大杀器
```rust
fn main(){
	for i in 1..=5{
		println!("{}",i);
	}
}
```
循环输出1个1-5的序列,简单粗暴
我们在使用`for`时往往使用集合的引用形式,除非不想再后面的代码中继续使用该集合,(比如我们使用了`container`的引用);如果不适用引用的化,所有权会被转移到`for`语句块中,后面就无法使用这个集合了:
```rust
for item in &container{
	//
}
```
>对于实现了`copy`特征的数组,`for item in arr`并不会把`arr`的所有权转移,而是直接对其进行了copy,因此循环之后仍然可以使用`arr`

如果想要在循环中,**修改该元素**,使用`mut`关键字:
```rust
for item in &mut collection{
	//
}
```
一些总结:

|             使用方法              |                        等价                         |  所有权  |
| :---------------------------: | :-----------------------------------------------: | :---: |
|   `for item in collection`    | `for item in IntoIterator::into_iter(collection)` | 转移所有权 |
|   `for item in &collection`   |          `for item in collection.iter()`          | 不可变借用 |
| `for item in &mut collection` |        `for item in collection.iter_mut()`        | 可变借用  |
如果想要在循环中**获取元素的索引**:
```rust
fn main(){
	let a = [4,3,2,1];
	// `.iter()`将`a`转换为一个迭代器
	for (i,v) in a.iter().eumerate(){
		println!("第{}个元素是{}",i+1,v);
	}
}
```
当我们不想声明变量时:
```rust
for _ in 0..10{
	//..
}
```
##### 2中循环方式的优劣对比:
```rust
let collection = [1,2,3,4,5];
for i in 0.collection.len(){
	let item = collection[i];
	//
}
for item in collection{

}
```
对比:
- **性能**:第一种使用方式中`collection[index]`中的索引访问,会因为边界检查(Bounds Checking)导致运行时的性能损耗-Rust会检查`index`是否落在集合内,到那时第二种直接迭代就不会除法这种检查,因为编译器在编译的时候就会证明这种访问时合法的
- **安全**:第一种方式里对`collections`的索引访问时非连续的,存在一定可能性在2次访问之间,`collections`发生了变化,导致了脏数据的产生;第二种直接迭代的方式是连续访问,因此不存在这种风险
##### `continue`
跳过本次循环,直接下一次循环
##### `break`
使用`break`直接跳出整个循环
#### while循环
嗯
```rust
fn main() {
    let mut n = 0;

    while n <= 5  {
        println!("{}!", n);

        n = n + 1;
    }

    println!("111！");
}
```
也可以通过`loop`+`if`+`break`
```rust
fn main(){
	let mut n = 0;
	
	loop{
		if n>5{
			break
		}
		n = n+1;
	}
	println!("111");
}
```
#### while Vs for
也可以使用`while`来实现`for`的功能:
```rust
fn main(){
	let a = [10,20,30,40,50];
	let mut index = 0;
	
	while index<5{
		println!("The value is:{}",a[index]);
		
		index = index+1;
	}
}
```
看似很平常,但是这个过程很容易出错,如果索引长度不正确就会`panic`,这也使得程序更慢,因为编译器加了运行时代码会对每次循环的每个元素进行条件检查
```rust
for main(){

	let a = [10,20,30,40,50];
	
	for element in a.iter(){
		println!("the value is:{}",element);
	}
}
```
#### loop循环
对于循环而言,`loop`循环时适用面最高的,可以适用于所有循环场景,但是很哆嗦
嗯,这种就坏菜了
```rust
fn main(){
	loop{
		println!("again!");
	}
}
```
使用`loop`时,必不可少的是`break`关键字
```rust
fn main(){
	let mut counter = 0;
	
	let result = loop{
		counter += 1;
		if counter == 10{
			break counter*2;
		}
	};
	println!("The result is {}",result);
}
```
Notice:
- break可以单独使用,也可以带一个返回值,类似于`return`
- loop是一个表达式,因此可以返回一个值


