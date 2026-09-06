---
title: "amp 原理 automatic mixed precision 自动混合精度"
published: 2026-09-05
description: ""
tags: ["Pytorch distributed"]
draft: false
---
混合精度训练
- amp:
	- single precision:fp32(float32)
	- half presision:fp16(float16)
	- large batch size/models,加速训练
	- 模型 performances 并不会有显著降低
- training steps:
	- Porting the model to use FP16 data type where appropricate
	- Adding loss scaling to preserve samll gradient value:
```python
import torch
from transformers import AutoModelForCauselLM
```
```python
model = AutoModelForCausalLM.from_pretained('gpt2')
print(model.get_momery_footprint()/(1024**2))
model = AutoModelForCausalLM.from_pretained('gpt2',torch_type=torch.float16)
print(model.get_memory_footprint()/(1024**2))
AutoModelForCausalLM.from_pretained('gpt2',torch_type=torch.float16,load_in_8bit=True)
print(model.get_memory_footprint()/(1024**2))
```
```python
for name,para in model.named_parameters():
	print(para.dtype,name,para.device)
```
- transformer.wte.weight、transformer.wpe.weight:torch.float16
- h.0-h.11:
	- In_1.weight,In_1.blas,In_2.weight,In_2.bias:torch.float32
	- attn
		- c_attn.weight:torch_int8
			- bias:torch.float16
		- c_proj.weight:torch_int8
			- bias:torch.float16
		- mlp
			- c_fc.weight:torch.int8
			- bias:torch.float16
	- In_f.weight,In_f:torch.float16
```python
a_float32 = torch.rand((8,8),device="cuda")
b_float32 = torch.rand((8,8),device-"cuda")
c_float32 = torch.rand((8,8),device="cuda")
d_float32 = torch.rand((8,8),device="cuda")

with torch.cuda.amp.autocast():
	e_float16 = torch.mm(a_float32,b_float32)
	print('in autocast',e_float16.dtype,e_float16.device)
	#Also handles mixed input type:
	f_float16 = torch.mm(d_floar32,e_float16)
	print('in autocast',f_float16.dtype,e_float16.device)
	
g_float32 = torch.mm(d_float32,f_float16.float())
print('out autocast',g_float32.dtype,g_float32.device)
```
### basics:
<img src="/posts/assets/1cq3sm8-Pasted-image-20260905132828.png" alt="Pasted image 20260905132828.png" loading="lazy" />
- fp32(single precision)vsfp16(half precision)
	- fp16的dynamic range是足够的,gradient(weight update)的计算将其scale避免fp16的浮点数下溢
- fp16 is fast and memory-efficient:
	- 更快的compute throughout
	- 更高的memory throughout
	- 更小的显存占用
```python
para = torch.cuda.HalfTensor([1.])
update = torch.cuda.HalfTensor([.0001])
para + update
```
```python
para = torch.cuda.FloatTensor([1.])
update = torch.cuda.FloatTensor([.0001])
para + update
```
### amp
<img src="/posts/assets/1ygtlp0-Pasted-image-20260905133551.png" alt="Pasted image 20260905133551.png" loading="lazy" /><img src="/posts/assets/ykudex-Pasted-image-20260905133736.png" alt="Pasted image 20260905133736.png" loading="lazy" />
- forward:weights,activations
- backward:activation grad,weighth grad
- update(weight gradients 乘上学习率)会非常小，在FP16中，小于2^(-24)的数都会被置0
- 2-level NN
$$
\begin{align*}
\frac{\partial L}{\partial W^{[2]}} &= \frac{\partial L}{\partial a^{[2]}} \frac{\partial a^{[2]}}{\partial W^{[2]}} \\
\frac{\partial L}{\partial a^{[1]}} &= \frac{\partial L}{\partial a^{[2]}} \frac{\partial a^{[2]}}{\partial a^{[1]}} \\
\frac{\partial L}{\partial W^{[1]}} &= \frac{\partial L}{\partial a^{[1]}} \frac{\partial a^{[1]}}{\partial W^{[1]}}
\end{align*}
$$
```python
torch.cuda.HalfTensor([2**-24])
```
### loss scaling
```python
scaler = GradScaler()

# forward
with autocast():
	output = model(input)
	loss = loss_fn(ouput,target)
#backward
scaler.scale(loss).backward()
scaler.step(optimizer)
scaler.update()
```
- 针对的是loss(loss scaling)
	- small gradients may underflow in FP16 regions of the network
	- scaling the loss brings gradients into the fp16 dynamic range
	- unscale gradients in PF32 for `optimizer.step()`
- 