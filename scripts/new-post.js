// 新建文章模板：node scripts/new-post.js 文章标题
import { writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const title = process.argv[2];

if (!title || !title.trim()) {
  console.error("用法: pnpm new-post <文章标题>");
  process.exit(1);
}

const safe = title.trim().replace(/[<>:"/\\|?*]/g, "").replace(/\s+/g, "-");
const file = join(root, "src", "content", "blog", `${safe}.md`);

if (existsSync(file)) {
  console.error(`已存在: ${file}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const content = `---
title: ${title.trim()}
published: ${today}
description: ""
tags: []
draft: false
---

在这里开始写正文……
`;

writeFileSync(file, content, "utf-8");
console.log(`✅ 已创建: ${file}`);
console.log("   用编辑器写好后执行: pnpm ship");
