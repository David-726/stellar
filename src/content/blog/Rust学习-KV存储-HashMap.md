---
title: KV存储 HashMap
published: '2026-10-14'
description: ''
tags:
  - Rust学习
draft: false
---
`HashMap`也是rust标准库中提供的集合类型,但是又和动态数组不同,`HashMap`中存储的是-映射的`KV`键值对,并提供了平均复杂度为`O(1)`的查询方法,当我们希望通过一个`Key`取查询值时,该类型相当有用。
rust中哈希类型为`HashMap<K,V>`
### 创建HashMap
和`Vec`的创建类似,也可以用`new`方法来创建`HashMap`,然后通过`insert`方法插入键值对

#### 使用new方法创建
```rust
use std::collections::HashMap;

let mut my_gems = HashMap::new();

my_gems.insert("红宝石",1);
my_gems.insert("蓝宝石",2);
my_gems.insert("河边捡的误以为是宝石的破石头",18);
```
该HashMap的类型:`HashMap<&str,i32>`
但是还有一点,就是使用`HashMap`需要手动通过`use...`从标准库中引入到我们当前的作用域中,之前使用另外2个集合类型`String`和`Vec`时,我们并没有引入
因为`HashMap`没有包括在rust的`prelude`中
所有的集合类型都是动态的,无固定的内存大小,底层的数据都存储在内存堆上,然后通过一个存储在栈中的引用类型来访问,同时,和其他类型一样,`HashMap`也是**内聚性**的,所有的`K`类型相同,`V`也是
>和Vec一样,如果预先知道要存储的`KV`对个数,可以使用`HashMap::with_capacity(capacity)`创建指定大小的`HashMap`,避免频繁的内存分配和调用,提升性能

#### 使用迭代器和collect创建
实际我们更多遇见的,从另外一个数据结构中,获取到对应的数据,最终生成`HashMap`
考虑一个场景,1张表格中记录了各个足球联赛中各个队伍名称和积分的信息,如果被到导入rust中,一个合理的数据结构是`Vec<String,u32>`类型,该数组的元素是一个个元组,该数据结构和表格数据很契合:表格中的数据都是逐行存储,每一行都有一个`(队伍,名称,积分)`的信息
但是很多时候,又需要通过队伍名称来查询对应的积分,此时动态数组就不适用了,因此可以用`HashMap`来保存相关的队伍名称->积分映射关系
```rust
fn main(){
	use std::collections::HashMap;
	
	let teams_list=vec![
		("China".to_string(),100),
		("Amercia".to_string(),10),
		("Japan".to_string(),50),
	];
	
	let mut teams_map = Hash::new();
	for team in &teams_list{
		teams_map.insert(&team.0,team.1);
	}
	
	println!("{:?}",teams_map)
}
```
遍历数组,将每一个元组作为`KV`插入`HashMap`中,很简单,但是,**不够rusty**
好在,rust提供了:先将`Vec`转为迭代器,然后通过`collect`方法,将迭代器的元素收集后,转为`HashMap`
```rust
fn main(){
	use std::fmt::collections::HashMap;
	
	let teams_list = vec![
		("China".to_string()，100)，
		("Amercia".to)string(),10),
		("Japan".to_string()，50),
	];
	
	let teams_map:HashMap<_,_> = teams_list.into_iter().collect();
	
	println!("{:?}",teams_up)
}
```
`into_iter`方法将列表转为迭代器,接着通过`collect`进行收集,不过需要注意的是,`collect`方法在内部实际上支持多种类型的目标集合,因此我们需要通过类型标注`HashMap<_,_>`告诉编译器:帮忙收集`HashMap`集合类型,具体的`KV`类型,请编译器进行推导
但是有时候rust编译器大聪明:看不懂,让你手动标注

### 所有权转移
`HashMap`的所有权和其他类型无区别:
- 若类型实现`Copy`特征,该类型会被复制进`HashMap`,因此无所谓所有权
- 若没实现`Copy`特征,所有权被转移给`HashMap`中
```rust
fn main(){
	use std::collections::HashMap;
	
	let name = String::from("Sunface");
	let age = 18;
	
	let mut handsome_boys = HashMap::new();
	handsome_boys,insert(name,age);
	
	println!("因为过于无耻,{}已经被从帅气男孩名单中除名",name);
	println!("还有，它的真实年龄远远不止{}岁",age);
}
```
Error:
```
```
`name`是`String`类型,因此收到所有权限制,在`insert`时,所有权转移给了`handsome_boys`,所以在最后使用时,会遇到这个无情但是意料之中的报错。
**如果使用引用类型放入HashMap中**,确保该引用的生命周期至少和`HashMap`获得一样久
```rust
fn main(){
	use std::collections::HashMaps;
	
	let name = String:;from("Sunface");
	let age = 18;
	
	let mut handsome_boys = HashMap::new();
	handsome_boys.insert(&name,age);
	
	std::mem::drop(name);
	println!("因为过于无耻,{:?}ui经被除名了",handsome_boys);
	println!("还有,他的真实年龄远远不止{}岁",age);
	
}
```
上面借用`name`获取了引用,然后插入了`handsome_boys`,但是紧接着,就通过`drop`函数手动将`name`字符串从内存中移除,Error:
```
```
### 查询HashMap
通过`get`方法获取元素:
```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"),10);
scores.insert(String::from("Yellow"),50);

let team_name = String::from("Blue");
let scores:Option<&i32> = scores.get(&team_name);
```
注意:
- `get`方法返回1个`Option<&i32>`类型:查询不到时,会返回一个`None`,查询到返回`Some<&i32>`
- `&i32`是对`HashMap`中值的借用,如果不适用借用,可能发生所有权的转移
- `get`方法的`key`参数必须是一个引用,如这里的`scores.get(&team_name)`,这是因为`HashMap<K,V>`的`get`方法的签名如下:
```rust
impl<K,V> HashMap<K,V>

where
	K:Eq+Hash,
{
	pub fn get<Q>(&self,k:&Q)->Option<&V>
	where
		K:Borrow<Q>,
		Q:Hash+Eq+?Sized,
	{...}
}
```
可以看见签名中的`k:&Q`,下面的特征约束`K:Borrow<Q>`指的是类型`K`需要能从另一种形式`Q`被借用,这种情况下,`String`实现了`Borrow<str>`,所以`&String`和`&str`类型都可以用于`get`方法
还可以继续拓展:
上面的代码中,如果我们想要直接获得值类型的`score`怎么办:
```rust
let score:i32 = scores.get(&team_name).copied().unwrap_or(0);
```
官方文档中查询`Option`的`copied`方法和`unwrap_or`方法的含义以及该怎么用
还可以通过循环依次遍历`KV`对:
```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores,insert(String::from("Blue"),10);
scores.insert(String::from("Yellow",50));

for (key,value) in &scores{
	println!("{}:{}",key,value);
}
```

#### 更新HashMap中的值
更新值的时候,涉及多种情况,一一说明:
```rust
fn main(){
	use std::collections::HashMap:;new();
	
	let mut scores = HashMap::new();
	
	scores.insert("Blue",10);
	
	//覆盖已有的值
	let old = scores.insert("Blue",20);
	assert_eq!(old，Some(10));
	
	//查询新键入的值
	let new = scores.get("Blue");
	assert_eq!(new,some(&20));
	
	//查询Yellow对应的值,若不存在则插入新值
	let v = scores.entry("Yellow").or_insert(5);
	assert_eq!(*v,5);
	
	//查询Yellow对应的值,若不存在则插入新值
	let v = scores.entry("Yellow").or_insert(50);
	assert_eq!(*v,5); //已经存在,因此50没有插入
}
```
#### 再已有值的基础上更新
查询某个`key`对应的值,若不存在则插入新值,若存在则对已有的值进行更新,例如在文本中统计词语出现的次数:
```rust
use std::collections::HashMap;

let text = "hello world wonderful world";
let mut map = HashMap::new();

//根据空格来切分字符串
for word in text.split_whitespace(){
	let count = map.entry(word).or_insert(0);
	*count+=1;
}
println!("{:?}",map);
```
上述代码中,新建一个`map`用于保存词语出现的次数,出入一个词语会进行判断:之前没有插入过,则使用该词语作为`Key`,插入次数0作为Value,若之前插入过则取出之前统计的该词语出现的次数,对其加1
Notice:
- `or_insert`返回了`&mut v`引用,因此可以通过该引可变引用直接修改`map`中对应的值
- 使用`count`引用时,需要先进行解引用`*count`,否则会出现类型不匹配
### 哈希函数
到底什么是Hash?
如果要实现`Key`和`Value`的一一对应,是不是意味着我们要能够比较2个`Key`的相等性?**一个类型能否作为`Key`的关键就是是否能够进行相等比较,或者说该类型是否实现了`std::cmp::Eq`特征**
eg:f32和f64浮点数,没有实现`std::cmp::Eq`特征,因此不可以用作`HashMap`的`Key`
那么,一个较为复杂的值作为`Key`,怎么在底层对它进行存储,怎么使用它进行查询和比较,有哈希函数:通过把`Key`计算后映射为哈希值,使用该哈希值来进行存储,查询,比较
如何保证不同`Key`通过哈希后2个值不同?如果相同,意味着我们使用不同的`Key`,却查到了同一个结果,错误...
若要追求安全,尽量减少冲突,同时防止拒绝服务(Denial of Service,DOS)服务,需要使用密码学安全的哈希函数,`HashMap`就是使用了这样的哈希函数;反之若要追求性能,就需要使用没有那么安全的算法
#### 高性能第三方库
若标准库默认的哈希函数不能满足你的性能需求,就需要去`crates.io`上寻找其他哈希函数实现,使用方法很简单:
```rust
use std::hash::BuildHasherDefault;
use std::collectiosn::HashMap;
//引入第三方哈希函数
use twox_hash::XxHash64;

//指定HashMap使用第三方的哈希函数XxHash64
let mut hash:HashMap<_,_,BuildHasherDefault<XxHash64>>=Default::defalut();

hash.insert(42,'the answer');
assert_eq!(hash.get(&42),Some(&"The answer"))；
```
目前,`HashMap`使用的哈希函数是`SpiHash`,性能不是很高,但是安全性很高,`SipHash`在中等大小的`Key`上,性能相当不错,但是对于小型的`Key`(例如整数)或者大型`Key`(例如字符串)来说,性能还是不够好,若是需要极致性能,或者实现算法,可以考虑:`ahash`


