---
title: "Hello World"
published: 2026-07-10
description: ""
tags: ["Rust学习"]
draft: false
---
```rust
fn greet_world(){

    let southern_German = "Grüß Gott!";

    let chinese = "世界，你好！";

    let english = "World, hello!";

    let regions = [southern_German, chinese, english];

    for region in regions.iter(){

        println!("{}", region);
	
    }

}

fn main() {

    greet_world();

}
```
```
cargo run --release
Grüß Gott!
世界，你好！
World, hello!
```
Rust原生支持UTF-8的字符。
`println!("{}", region);`这里的`!`是`宏`操作符。
对于 `println` 来说，我们没有使用其它语言惯用的 `%s`、`%d` 来做输出占位符，而是使用 `{}`，因为 Rust 在底层帮我们做了大量工作，会自动识别输出数据的类型，例如当前例子，会识别为 `&str` 类型。
*最后，和其它语言不同，Rust 的集合类型不能直接进行循环，需要变成迭代器（这里是通过 `.iter()` 方法），才能用于迭代循环。在目前来看，你会觉得这一点好像挺麻烦，不急，以后就知道这么做的好处所在。*
>yes but why

