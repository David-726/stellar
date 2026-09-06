// Obsidian 笔记迁移脚本
// 用法: node scripts/migrate-notes.js
// 从 D:/somethingaboutnothing/notefiles/note 迁移全部 md 到 src/content/blog
// - 剔除 .obsidian/.claudian/.trash/空文件/Excalidraw 源文件/d2l 网页剪藏副本
// - 生成 frontmatter（title/published/description/tags: [目录名]/draft）
// - ![[wiki]] 嵌入 → 按文件名全库解析 → /posts/assets/<hash>-<name> 拷贝到 public/posts/assets
// - markdown 相对路径图片按源文件相对位置拷贝并改写 URL
import fs from "node:fs";
import path from "node:path";

const SRC = "D:/somethingaboutnothing/notefiles/note";
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const OUT = path.join(ROOT, "src", "content", "blog");
const ASSETS = path.join(ROOT, "public", "posts", "assets");

const SKIP_DIRS = new Set([
  ".obsidian", ".claudian", ".trash", ".git", ".agents", ".smart-env",
]);
// d2l 网页剪藏副本目录（目录名太长且内容是网页快照，剔除）
const SKIP_DIR_PATTERNS = [/documentation$/];
// 只迁移这些顶层目录（置空 Set 则迁移全部）；根目录散文件不迁移
const KEEP_DIRS = new Set([
  "D2lNotes", "d2l", "Verilog", "BERT", "Rust学习", "刘二大人pytorch", "Pytorch distributed",
]);

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      if (SKIP_DIR_PATTERNS.some((re) => re.test(e.name))) continue;
      yield* walk(p);
    } else if (e.name.endsWith(".md")) {
      yield p;
    }
  }
}

const extNames = fs.readdirSync(SRC, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name) && !SKIP_DIR_PATTERNS.some((re) => re.test(e.name)))
  .map((e) => e.name);

// 短链接解析器：文件名 → 绝对路径（首次用时构建索引）
let nameIndex = null;
function buildIndex() {
  nameIndex = new Map();
  for (const e of fs.readdirSync(SRC, { withFileTypes: true })) {
    if (e.isFile() && !e.name.startsWith(".")) nameIndex.set(e.name, path.join(SRC, e.name));
  }
  for (const d of extNames) {
    const dd = path.join(SRC, d);
    for (const e of fs.readdirSync(dd, { withFileTypes: true })) {
      if (e.isFile()) {
        if (!nameIndex.has(e.name)) nameIndex.set(e.name, path.join(dd, e.name));
      } else if (e.isDirectory()) {
        for (const f of fs.readdirSync(path.join(dd, e.name), { withFileTypes: true })) {
          if (f.isFile() && !nameIndex.has(f.name)) nameIndex.set(f.name, path.join(dd, e.name, f.name));
        }
      }
    }
  }
}

const slugify = (name) => {
  const stem = path.basename(name).replace(/\.md$/, "");
  const dir = path.dirname(name) === "." ? "" : path.dirname(name).replace(/[\\/\s]+/g, "-") + "-";
  let s = dir + stem;
  s = s.replace(/[<>:"|?*\u0000-\u001f]/g, "");
  s = s.replace(/\s+/g, "-");
  return s.slice(0, 120) || "untitled";
};

const hashName = (p) => {
  const buf = fs.readFileSync(p);
  let h = 0;
  for (let i = 0; i < buf.length; i += 4096) h = (h * 31 + buf[i]) >>> 0;
  return h.toString(36) + "-" + path.basename(p).replace(/[<>:"|?*\s]/g, "-");
};

const copied = new Map(); // src abs → public url
function copyAsset(abs) {
  if (copied.has(abs)) return copied.get(abs);
  const fname = hashName(abs);
  fs.copyFileSync(abs, path.join(ASSETS, fname));
  const url = `/posts/assets/${encodeURIComponent(fname)}`;
  copied.set(abs, url);
  return url;
}

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(ASSETS, { recursive: true });
buildIndex();

const dateOf = (rel, stat) => {
  const m = rel.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return stat.birthtime.toISOString().slice(0, 10);
};

let ok = 0, skipped = 0;
const skippedList = [];
for (const abs of walk(SRC)) {
  const rel = path.relative(SRC, abs);
  // 目录白名单：只保留 KEEP_DIRS 下的文件
  const topDir = path.dirname(rel) === "." ? "" : rel.split(/[\\/]/)[0];
  if (KEEP_DIRS.size > 0 && !KEEP_DIRS.has(topDir)) { continue; }
  const txt = fs.readFileSync(abs, "utf-8");
  if (txt.trim() === "") { skipped++; skippedList.push(rel); continue; }
  // Excalidraw 源文件：无渲染内容，跳过
  if (/excalidraw-plugin/.test(txt)) { skipped++; skippedList.push(rel); continue; }
  // .md（无名字）和 d2l 网页剪藏正文（全是外链导航）跳过
  if (path.basename(abs) === ".md") { skipped++; skippedList.push(rel); continue; }
  if (/Open the notebook in Colab/.test(txt.slice(0, 800))) { skipped++; skippedList.push(rel); continue; }

  const title = path.basename(rel).replace(/\.md$/, "");

  // 日期：frontmatter 已有则沿用；否则文件名/创建时间
  let body = txt;
  let published = null;
  const fmMatch = body.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (fmMatch && !/excalidraw-plugin/.test(fmMatch[1])) {
    const m = fmMatch[1].match(/published:\s*["']?(\d{4}-\d{2}-\d{2})/);
    if (m) published = m[1];
  }
  if (!published) published = dateOf(rel, fs.statSync(abs));

  // ![[wiki]] 嵌入 → 解析并替换为 url
  body = body.replace(/!\[\[([^\]|]+)(\|([0-9]+))?\]\]/g, (all, name, _sz, size) => {
    const clean = name.trim();
    const hit = nameIndex.get(clean) || nameIndex.get(clean + ".png") || nameIndex.get(clean + ".svg") ||
      nameIndex.get(clean + ".webp") || nameIndex.get(clean + ".jpg") || nameIndex.get(clean + ".jpeg") ||
      nameIndex.get(clean + ".gif");
    if (!hit) return `\n> ⚠️ 缺失图片：${clean}\n`;
    try {
      const url = copyAsset(hit);
      const style = size ? ` style="max-width:${Math.round(size / 2)}px"` : "";
      return `<img src="${url}" alt="${clean}" loading="lazy"${style} />`;
    } catch {
      return `\n> ⚠️ 缺失图片：${clean}\n`;
    }
  });

  // markdown 相对图片 → 按源相对位置拷贝
  body = body.replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, (all, alt, url) => {
    const u = url.trim();
    if (/^https?:/.test(u)) return all;
    let dec;
    try { dec = decodeURIComponent(u.split(" ")[0]); } catch { dec = u.split(" ")[0]; }
    const absImg = path.resolve(path.dirname(abs), dec);
    if (!fs.existsSync(absImg)) return `\n> ⚠️ 缺失图片：${dec}\n`;
    try {
      const aurl = copyAsset(absImg);
      return `![${alt}](${aurl})`;
    } catch {
      return `\n> ⚠️ 缺失图片：${dec}\n`;
    }
  });

  // 残留的 [[内部链接]] → 纯文本
  body = body.replace(/(?<!\!)\[\[([^\]]+)\]\]/g, (_a, n) => n.split("|")[0].split("#")[0]);

  const slug = slugify(rel);
  const tags = topDir ? [topDir.replace(/\.md$/, "")] : [];
  const esc = (s) => s.replace(/"/g, '\\"');
  const header = `---
title: "${esc(title)}"
published: ${published}
description: ""
tags: [${tags.map((t) => `"${esc(t)}"`).join(", ")}]
draft: false
---
`;
  fs.writeFileSync(path.join(OUT, slug + ".md"), header + body, "utf-8");
  ok++;
}

console.log(`migrated: ${ok}, skipped: ${skipped}`);
console.log("assets copied:", copied.size);
if (skippedList.length) console.log("skipped files:\n" + skippedList.map((s) => "  " + s).join("\n"));
