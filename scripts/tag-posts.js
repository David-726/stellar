// 自动打标签脚本：按内容特征给每篇文章打 1-2 个精准标签
// 用法: node scripts/tag-posts.js [--dry]
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const BLOG = path.join(ROOT, "src", "content", "blog");
const dry = process.argv.includes("--dry");

// 规则表：[标签, 匹配正则]，按顺序取前两条命中的规则；目录名兜底
const RULES = [
  // === 通用技术栈 ===
  ["注意力机制", /attention|注意力|Q.{0,3}K.{0,3}V|softmax归一|多头/i],
  ["Transformer", /transformer|encoder.{0,4}decoder|位置编码|positional/i],
  ["BERT", /\bbert\b|wordpiece|tokenizer|pooler|hidden.?state|masked/i],
  ["RNN", /\brnn\b|循环神经网络|GRU|LSTM|seq2seq|时序|hmm|隐马尔可夫/i],
  ["CNN", /\bcnn\b|卷积|conv|LeNet|AlexNet|VGG|ResNet|GoogLeNet|NiN|DenseNet|池化|汇聚层|padding|填充|步长|感受野/i],
  ["目标检测", /R-?CNN|YOLO|SSD|anchor|边界框|bounding|NMS|目标检测/i],
  ["语义分割", /FCN|语义分割|分割|segmentation/i],
  ["生成模型", /GAN|生成对抗|VAE|自编码器|diffusion|扩散/i],
  ["优化", /梯度下降|optimiz|SGD|Adam|动量|学习率|梯度消失|梯度爆炸|数值稳定性|初始化/i],
  ["正则化", /dropout|暂退法|权重衰减|weight decay|正则|L2|过拟合|欠拟合/i],
  ["归一化", /Batch.?Norm|Layer.?Norm|归一化|normalization/i],
  ["反向传播", /反向传播|back.?prop|链式法则|自动求导|autograd|计算图/i],
  ["线性回归", /线性回归|linear regression/i],
  ["softmax", /softmax/i],
  ["多层感知机", /多层感知机|MLP|感知机|全连接/i],
  ["GPU", /GPU|CUDA|显卡/i],
  // === 工程框架 ===
  ["PyTorch", /pytorch|torch\.|torch\.no_grad|DataLoader|Dataset|nn\.Module|tensor/i],
  ["分布式训练", /DDP|DataParallel|NCCL|all.?reduce|集合通信|DeepSpeed|ZeRO|tensor.?parallel|process.?group|分布式|parallel/i],
  ["混合精度", /\bAMP\b|混合精度|automatic mixed precision|fp16|bf16/i],
  ["HuggingFace", /hugging|transformers库|AutoModel|AutoTokenizer/i],
  // === 硬件/FPGA ===
  ["Verilog", /verilog|always@|wire|reg\b|assign|模块例化|时序逻辑|组合逻辑|状态机|仿真激励|testbench/i],
  ["FPGA", /fpga|vivado|xilinx|FIFO|ROM|RAM|PLL|引脚分配|约束|xdc|呼吸灯|数码管|Zynq|ZYNQ/i],
  ["数字电路", /状态机|FSM|流水线|竞争与冒险|毛刺|亚稳态|时延/i],
  // === 竞赛/嵌入式 ===
  ["单片机", /单片机|STM32|TI\s?MSP|MSPM0|SysConfig|时钟配置|串口|UART|PWM|定时器/i],
  ["OpenCV", /opencv|cv2/i],
  // === 语言 ===
  ["Rust", /rust|cargo|所有权|借用|生命周期|mut\b|fn\s+main/i],
  ["Python", /python|pip\b|conda/i],
  ["Linux", /linux|shell|bash|vim|git\s/i],
];

// 目录 → 固定语义标签（第一个标签，最可靠）
const DIR_TAG = {
  "Verilog": "Verilog",
  "Rust学习": "Rust",
  "刘二大人pytorch": "PyTorch",
  "Pytorch distributed": "分布式训练",
  "BERT": "BERT",
  "D2lNotes": null,
  "d2l": null,
};

// 标题窄规则：只匹配标题，避免正文到处出现的词误伤
const TITLE_RULES = [
  ["注意力机制", /attention|注意力/i],
  ["Transformer", /transformer/i],
  ["BERT", /\bbert\b|tokenizer|wordpiece|pooler|embedding/i],
  ["RNN", /\brnn\b|GRU|LSTM|seq2seq|双向/i],
  ["CNN", /\bcnn\b|卷积|LeNet|AlexNet|VGG|ResNet|GoogLeNet|NiN|DenseNet|汇聚|池化|填充|通道/i],
  ["目标检测", /R-?CNN|目标检测/i],
  ["语义分割", /FCN|语义分割|样式迁移|转置卷积/i],
  ["归一化", /Batch.?Norm|normalization|归一化/i],
  ["反向传播", /反向传播|back.?prop/i],
  ["线性回归", /线性回归|linear.?regression/i],
  ["softmax", /softmax/i],
  ["多层感知机", /多层感知机|MLP|感知机|前向传播/i],
  ["正则化", /暂退法|dropout|权重衰减|模型选择|过拟合/i],
  ["优化", /数值稳定性|初始化|优化|梯度|SGD|Adam/i],
  ["GPU", /\bGPU\b/i],
  ["混合精度", /\bAMP\b|混合精度/i],
  ["HuggingFace", /hugging/i],
  ["PyTorch", /pytorch|torch|数据操作|数据读取|读写文件|参数管理|层和块|延后初始化|自定义层/i],
  ["模型部署", /部署|onnx/i],
  ["环境搭建", /环境搭建|安装|install/i],
];

const NOISE_TAGS = new Set();

const files = fs.readdirSync(BLOG).filter((f) => f.endsWith(".md"));
let changed = 0;
const report = [];

for (const f of files) {
  const p = path.join(BLOG, f);
  const txt = fs.readFileSync(p, "utf-8");
  const fmMatch = txt.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fmMatch) continue;

  const fm = fmMatch[1];
  const body = txt.slice(fmMatch[0].length);
  const titleM = fm.match(/title:\s*"([^"]*)"/);
  const title = titleM ? titleM[1] : f.replace(/\.md$/, "");

  const oldTagsM = fm.match(/tags:\s*\[([^\]]*)\]/);
  const oldTags = oldTagsM ? oldTagsM[1].split(",").map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean) : [];

  // 目录名（首个 - 前的段）
  const dir = f.split("-")[0];

  const hits = [];
  // ① 目录语义标签固定打底
  if (DIR_TAG[dir]) hits.push(DIR_TAG[dir]);
  // ② 标题匹配补第二标签（不重复）
  for (const [tag, re] of TITLE_RULES) {
    if (hits.length >= 2) break;
    if (hits.includes(tag)) continue;
    if (re.test(title)) hits.push(tag);
  }
  // ③ 目录本身就是标签名（如 Verilog/BERT/d2l 系列），标题没命中则保留目录名
  if (hits.length === 0 && oldTags[0]) hits.push(oldTags[0]);
  // ④ 最终兜底
  if (hits.length === 0) hits.push("深度学习");

  const newTags = hits.slice(0, 2);
  const same = oldTags.length === newTags.length && oldTags.every((t, i) => t === newTags[i]);
  if (same) continue;

  changed++;
  report.push(`${f}  [${oldTags.join(",")}] → [${newTags.join(",")}]`);
  if (!dry) {
    const newFm = fm.replace(/tags:\s*\[[^\]]*\]/, `tags: [${newTags.map((t) => `"${t}"`).join(", ")}]`);
    fs.writeFileSync(p, `---\n${newFm}\n---\n${body}`, "utf-8");
  }
}

console.log(`${dry ? "[DRY] " : ""}changed: ${changed} / ${files.length}`);
for (const r of report.slice(0, 30)) console.log("  " + r);
if (report.length > 30) console.log(`  ...共 ${report.length} 篇`);
