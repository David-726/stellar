---
title: "字符 布尔 单元类型"
published: 2026-07-20
description: ""
tags: ["Rust"]
draft: false
---
## 字符类型(char)
```rust
fn main() {
    let c = 'z';
    let z = 'ℤ';
    let g = '国';
    let heart_eyed_cat = '😻';
}
```
Rust中所有合法的`Unicode`都可以作为Rust字符，包括单个的中文、日文、emoji表情。
由于`Unicode`都是4个字节编码，因此字符类型也是占用4个字节：
```rust
fn main(){
	let x = '中';
	println!("字符`中`占用了{}字节的内存大小",std::mem::size_of_val(&x));
}
```
## Bool
```rust
fn main() {
	let t = true;
	let f :bool = false;
	if f{
		printfln!("这是毫无意义的代码");
	}
}
```
## 单元类型
单元类型就是`()`
占0个内存