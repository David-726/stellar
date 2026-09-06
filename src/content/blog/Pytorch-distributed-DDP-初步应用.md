---
title: "DDP 初步应用"
published: 2026-09-01
description: ""
tags: ["Pytorch distributed"]
draft: false
---
```python
import os 
import torch
import torch.nn.functional as F
from torch.utils.data import Dataset,DataLoader
```
```python
import torch.multipleprocessing as mp
from torch.utils.data.distributed import DistributedSampler
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.distributed import init_process_group,destory_process_group
```
### Basics:
- All to one:reduce:one to all:broadcast
- rank:[0,world_size]
### ddp_size
```python
def ddp_setup(rank,world_size):
	"""
	Args:
		rank:Unique identifier of each process
		world_size:Total number of process
	"""
	#rank 0 process
	os.environ["MASTER_ADDR"]="localhost"
	os.environ["MASTER_PORT"]="12355"
	#nccl:NVIDIA Collective Communciation Library
	#分布式情况下的gpus间通信
	init_process_group(backend="nccl",rank=rank,world_size=world_size)
	torch.cuda.set_device(rank)
```
### custom Trainer(自定义trainer)
```python
class Trainer:
	def __init__(self,model:torch.nn.Module,train_dataloader:DataLoader,optimimzer:torch.optim.Optimizer,gpu_id:int)->None:
		#rank
		self.gpu_id = gpu_id
		self.model = model.to(gpu_id)
		self.train_dataloader = train_dataloader
		self.optimizer = optimizer
		self.model = DDP(model,device_ids=[gpu_id])
		
	def _run_batch(self,xs,ys):
		self.optimizer.zero_grad()
		output = self.model(xs)
		loss = F.cross_entropy(output,ys)
		loss.backward()
		self.optimizer.step()
		
	def _run_epoch(self,epoch):
		batch_size = len(next(iter(self.train_dataloader))[0])
		print(f'[GPU:{self.gpu_id}] Epoch:{epoch}|Batchsize:{batch_size}|Steps:{len(self.train_dataloader)})
		self.train_dataloader.sampler.set_epoch(epoch)
		for xs,ys in self.train_dataloader:
			xs = xs.to(self.gpu_id)
			ys = ys.to(self.gpu_id)
			self._run_batch(xs,ys)
	def train(self,max_epoch:int):
		for epoch in range(max_epoch):
			self._run_epoch(epoch)
```
### pipeline
```python
class MyTrainDataset(Dataset):
	def __init__(self,size):
		self.size=size
		self.data=[(torch.rand(20),torch.rand(1))for _ in range(size)]
	def __len__(self):
		return self.size
	def __getitem__(self,index):
		return self.data[index]
```
```python
train_dataset  =MyTrainDataset(2048)
```
```python
train_dataset[0]
```
```python
def main(rank:int,world_size:int,max_epochs:int;batch_size:int):
	ddp_setup(rank,world_size)
	train_dataset = MyTrainDataset(2048)
	train_dataloader = DataLoader(train_dataset,batch_size=bacth_size,pin_memory=True,shuffle=False,sample=DistributedSample(train_dataset))
	model=torch.nn.Linear(20,1)
	optimizer= torch.optim.SGD(model.parameters(),lr=1e-3)
	trainer = Trainer(model=model,gpu_id=rank,optimizer=optimizer,train_dataloader=train_loader)
	trainer.train(max_epoches)
	
	destory_process_group()
	
```
### 分布式training
- `python -m torch.distributed.launch`
- `torchrun`
```python
world_size=torch.cuda.device_count()
world_size
```
```
2048/32
```
```python
!python ddp_gpus.py --max_epochs 5 --batch_size 32
```
batch_size固定,batch_step会分布在多个gpus上,且一个epoch中gpu的先后执行顺序不同
### torchrun运行
- `torchrun`
	- Work RANK and WORLD_SIZE are asssigned automatically
	- `python -m torch.distributed.launch --use-env`
```python
!torchrun ddp_gpus_torchrun.py --max_epochs 5 --batch_size 32
```
```python
!torchrun --nproc-per-node=2 ddp_gpus_torchrun.py --max_epochs 5 --batch_size 32
```
```python
!python -m torch.distributed.launch --use-env --nproc-per-node=2 ddp_gpus_torchrun.py --max_epochs 5 --batch_size 32
```
