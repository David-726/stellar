---
title: 集合
published: '2026-10-14'
description: ''
tags:
  - Rust学习
draft: false
---
### 动态数组Vector:
动态数组类型使用`Vec<T>`表示
`Vector`允许存储多个值,在内存中一个紧挨着一个排列,因此访问其中某个元素的成本很低。
#### 创建动态数组:
rust中,创建动态数组的方式很多;
###### Vec::new
使用`Vec::new`创建动态数组是最rusty的方式,调用了`Vec`中的`new`关联函数:
```rust
let v:Vec<i32> = Vec::new();
```
这里`v`被显式的声明了类型`Vec<i32>`,因为rust编译器无法从`Vec::new()`中得到任何关于类型的暗示信息,因此无法推导`v`的具体类型。
但是当向里面增加一个元素之后,一切又不同了:
```rust
let mut v = Vec::new();
v.push(1);
```
此时,`v`无需手动声明类型,因为编译器通过`v.push(1)`推导出`v`中的元素类型是`i32`
因此推导`v`->`Vec<i32>`
>如果预先知道需要存储的元素个数,可以使用`Vec::with_capcity(capacity)`创建动态数组,这样可以避免因为插入大量数组导致频繁的内存分配和拷贝,提升性能

#### vec![]
还可以使用宏`vec!`创建数组,和`Vec::new`不相同,前者能够创建同时给予初始值:
```rust
let v = vec![1,2,3];
```
同时,此时的`v`也无需标注类型,编译器只需要检查它内部的元素即可自动推导出`v`的类型是`Vec<i32>`(rust中,整数默认类型是`i32`)
#### 更新Vector
向数组尾部添加元素,可以使用`push`方法:
```rust
let mut v = Vec::new();
v.push(1);
```
#### Vector和其元素共存亡
和struct一样,`Vector`类型在超出作用域范围之外,会被自动删除:
```rust
{
	let v = vec![1,2,3];
	
	//...
}//<-v超出作用域并在此处被删除
```
`Vector`在此处被删除后,内部存储的所有内容也会随之被删除。目前来看,这种解决办法简单直白,但是当`Vector`中的元素被引用后,事情可能没这么简单
#### 从Vector中读取元素
读取指定位置元素的方式:
- 通过下标索引访问
- 使用`get`方法
```rust
let v = vec![1,2,3,4,5];

let third:&i32=&v[2];
println!("第3个元素是{}",third);

match v.get(2){
	Some(third)=>println!("第3个元素是{third}"),
	None=>println!("去你的第三个元素,根本没有"),
}
```
集合类型的索引都是从`0`开始,`&v[2]`表示借用`v`中的第3个元素,最终会获得该元素的引用。而`v.get(2)`也是访问第3个元素,但是,却返回了`Option<&T>`,因此还需要额外的`match`来匹配结构出具体的值
**存疑**

#### 下标索引和`.get`的区别
这2种方式都能成功的读取到指定的数组元素,为什么要用2种方法?
```rust
let v = vec![1,2,3,4,5];

let does_not_exist = &v[100];
let docs_not_exist = v.get(100);
```
运行上面代码,`&v[100]`访问方式会导致程序无情的报错,因为发生了数组越界访问。但是`v.get`不会,在内部做了处理,有值的时候返回`Some(T)`,无值的时候返回None,因此`v.get`的使用方式非常安全
那为什么不统一用`v.get()`形式?
确保索引不会越界时,就用索引访问,否则用`.get`;
#### 同时借用多个数组元素
既然涉猎到借用数组元素,很可能会遇到借用多个数组元素的情况,
```rust
let mut v = vec![1,2,3,4,5];

let first = &v[0];

v.push(6);

println!("The first element is :{first}");
```
首先`first=&v[0]`进行了不可变借用,`v.push`进行了可变借用,如果`first`在`v.push`之后不再使用,那么该段代码就可以成功编译
可是上面的代码中,`first`这个不可变借用在可变借用`v.push`后被使用了,那么编译器就会报错:
Error:
```
```
其实,这两个引用不应噶互相影响的:一个是查询元素,一个是在数组尾部插入元素,完全不相干的操作,为何编译器要这么严格?
原因在于:数组的大小是可变的,旧数组的大小不够用时,rust会重新分配一块更大的内存空间,然后将旧数组copy过来。这时候->之前的引用显然会指向一块无效的内存,这很rusty->对用户进行严格的教育
rusty就像那个良师益友,不断的纠正我们不好的变成习惯,知道某一天,发现自己能写出一次性通过的漂亮代码时,就能明白良苦用心。
可以看看<<https://nomicon.purewhite.io/vec/vec.html>>,手撸一个动态数组
#### 迭代遍历Vector中的元素
如果想要依次访问数组中的元素,可以使用迭代的方式遍历数组,这种方式比用下标的方式遍历更加高效:
```rust
let v = vec![1,2,3];
for i in &v{
	println!("{i}");
}
```
也可以在迭代中,修改`Vector`中的元素:
```rust
let mut v = vec![1,2,3];
for i in &mut v{
	*i += 10
}
```
#### 存储不同类型的数组
我们之前讲到数组中的元素类型必须相同,但是也有解决方案:通过枚举类型和特征对象来实现不同类型元素的存储
枚举的实现:
```rust
#[derive(Debug)]
enum IpAddr{
	V4(String),
	V6(String)
}
fn main(){
	let v = vec![
		IpAddr::V4("127.0.0.1".to_string()),
		IpAddr::V6("::1".to_string())
	];
	for ip in v{
		show_addr(ip)
	}
}
fn show_addr(ip:IpAddr){
	println!("{:?}",ip);
}
```
`v`中存储了不同的`ip`类型,但是都属于`IpAddr`枚举类型的成员,因此可以存储在数组中
特征对象的实现:
```rust
trait IpAddr{
	fn display(&self);
}
struct V4(String);
impl IpAddr for V4{
	fn display(&self){
		println!("ipv4:{:?}",self.0)
	}
}
struct V6(String);
impl Ippaddr for V6{
	fn displau(&self){
		println!("ipv6:{:?}",self.0)
	}
}

fn main(){
	let v:Vec<Box<dyn IpAddr>>=vec![
		Box::new<V4("127.0.0.1".to_string()),
		Box::new<V6("::1".to_string()),
	];
	
	for ip in v{
		ip.display();
	}
}
```
将`V4`和`V6`都实现了特征`IpAddr`,然后将二者的实例用`Box<new>`包裹后,存在了数组`v`中,这里必须手动指定类型:`Vec<Box<dyn IpAddr>>`,
实际使用场景中,**特征对象要比枚举数组常见很多**,主要在于特征对象十分灵活,而编译器对枚举的限制较多,且无法动态加载类型

#### Vector常用方法
初始化vec的更多方式:
```rust
fn main(){
	let v = vec![0;3];
	let v_from = Vec::from([0,0,0]);
	assert_eq!(v,v_form);
}
```
动态数组意味着我们增加元素时,如果容量不足就会导致vector扩容(目前策略是重新申请一块2倍大小的内存,再将所有元素拷贝到新的内存位置,同时更新指针数据),显然,当频繁扩容或者当元素数量较多且需要扩容时,大量的内存拷贝会降低程序的性能
可以考虑在初始化时就指定一个世界的预估容量,尽量减少可能的内存拷贝:
```rust
fn main(){
	let mut = Vec::with_capacity(10);
	v.extend([1,2,3]);
	println!("Vector 长度是:{},容量是:{}",v.len(),v.capacity());
	
	v.reserve(100);
	println!("Vector (reserve) 长度是:{},容量是:{}",v.len(),v.capacity());
	
	//释放剩余的容量
	v.shrink_to_fit();
	println!("Vector (shrink_to_fit) 长度是:{},容量是:{}",v.len(),v.capacity());
}
```
一些常见方法的排序:
```rust
let mut v = vec![1,2];
assert!(!v.is_empty());

v.insert(2,3); //在指定索引处插入数据,索引值不能大于v的长度
assert_eq!(v.remove(1),2); //移除指定位置的元素并返回,v:[1,3]
assert_eq!(v.pop(),Some(3)); //删除并返回v尾部的元素,v:[1]
assert_eq!(v.pop(),Some(1)); //v:[]
assert_eq!(v.pop(),None); //记得pop方法返回的是OPtion枚举值
v.clear(); //清空 v,v:[]

let mut v1 = [11,22].to_vec(); //append 操作会导致v1清空数据,增加可变声明
v.append(&mut v1); //将v1中的所有元素附加到v中,v1:[]
v.truncate(1); //截断到指定长度,多余的元素被删除,v:[11]
v.retain(|x|*x>10); //保留满足条件的元素,删除不满足条件的元素

let mut v = vec![11,22,33,44,55];
//删除指定范围的元素,同时获取被删除元素的迭代器,v:[11,55],m:[22,33,44]
let mut m :Vec<_> = v.drain(1..=3).collect();

let v2 = m.split_off(1); //指定索引处切分为2个vec,m:[22],v2:[33,44]
```
也可以向数组切片的方式获取vec的部分元素:
```rust
fn main(){
	let v = vec![11,22,33,44,55];
	let slice = &v[1..=3];
	assert_eq!(slice,&[22,33,44]);
}
```
#### Vector的排序
rust中,实现了2种的排序算法,稳定的`sort`和`sort_by`,非稳定的`sort_unstable`和`sort_unstable_by`
这个所谓的`非稳定`指的是排序过程种对相等元素的处理方式,在`稳定`排序算法种,对相等的元素,不会对齐进行重新的排序,但是`不稳定`不一定
In short,`非稳定`排序的速度会优于`稳定`排序算法,同时,`稳定`排序还会额外分配原数组一半的空间
#### 整数数组的排序
对整数数组进行排序:
```rust
fn main(){
	let mut vec = vec![1,5,10,2,15];
	vec.sort_unstable();
	assert_eq!(vec,vec![1,2,3,10,15]);
}
```
#### 浮点数组的排序
```rust
fn main(){
	let mut vec = vec![1.0,5.6,10.3,2.0,15f32];
	vec.sort_unstable();
	assert_eq!(vec,vec![1.0,2.0,5.6,10.3,15f32]);
}
```
Error:
```
```
浮点数中存在`NaN`的值,这个值无法和其他的浮点数进行对比,因此,浮点数类型并没有实现全数值可比较`Ord`的特征,而是实现了部分课比较的特性`PartialOrd`
如果我们确定在我们的浮点数中,不含`NaN`值,就可以使用`partial_cmp`来作为大小判断的依据:
```rust
fn main(){
	let mut vec = vec![1.0,5.6,10.3,2.0,15f32];
	//WTF?
	vec.sort_unstable_by(|a,b|a.partial_cmp(b).unwrap());
	assert_eq!(vec,vec![1.0,2.0,5.6,10.3.15f32])
}
```
Bingo
#### 对结构体数组进行排序:
```rust
#[derive(Debug]]
struct Person{
	name:String,
	age:u32,
}
impl Person{
	fn new(name:String,age:u32)->Person{
		Person{name,age}
	}
}
fn main(){
	 let mut people = vec![
		 Person::new("Zoe".to_string(),25),
		 Person::new("Al".to_string(),60),
		 Person::new("John".to_string(),1),
	 ]
	 people.sort_unstable_by(|a,b| b.age.cmp(&a.age));
	 println!("{:?}",people);
}
```
输出:
```
```
排序需要我们实现`Ord`特性,那要是我们要给我们的结构体实现了该特征,是否不需要我们自定义对比函数呢?

是,但是不完全是,如是。
实现`Ord`需要我们实现`Ord`,`Eq`,`PartialEq`,`PartialOrd`属性,但是我们可以`derive`这个属性:
```rust
#[derive(Debug,Ord,Eq,PartialEq,PartialOrd)]
struct Person{
	name:String,
	age:u32,
}
impl Person{
	fn new(name:String,age:u32)->Person{
		Person{name,age}
	}
}

fn main(){
	let mut people = vec![
		Person::new("Zoe".to_string(),25),
		Person::new("Al".to_string(),60),
		Person::new("Al".to_string(),30),
		Person::new("John".to_string(),1),
		Person::new("John".to_string(),25),
	];
	
	people.sort_unstable();
	println!("{:?}",people);
}
```
输出:
```
```
需要`derive``Ord`相关特性,需要确保你的结构体中所有的属性均实现了`Ord`相关特性,否则会发生编译错误.`derive`的默认实现会依据属性的顺序依次进行比较,如上:`Person`的`name`相同,则会私用`age`进行比较