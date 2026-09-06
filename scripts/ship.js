// 一键发布：构建 → 部署到 Cloudflare Pages → 推送 GitHub
// 用法: pnpm ship [提交说明]
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// 读取 .env（不存在则跳过）
const envFile = join(root, ".env");
const env = {};
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
}
const childEnv = { ...process.env, ...env };

const run = (cmd, args, label) => {
  console.log(`\n==> ${label}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", cwd: root, env: childEnv, shell: false });
  if (r.status !== 0) {
    console.error(`✗ ${label} 失败 (exit ${r.status})`);
    process.exit(r.status ?? 1);
  }
};

const node = process.execPath;

// 1. 构建
run(node, [join(root, "node_modules", "astro", "bin", "astro.mjs"), "build"], "构建站点");

// 2. 部署到 Cloudflare Pages
run(
  node,
  [
    join(root, "node_modules", "wrangler", "bin", "wrangler.js"),
    "pages", "deploy", "dist",
    "--project-name=stellar",
    "--branch=master",
    "--commit-dirty=true",
  ],
  "部署到 Cloudflare Pages",
);

// 3. 推送 GitHub（没有变更时自动跳过）
const add = spawnSync("git", ["add", "-A"], { cwd: root });
const status = spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf-8" });
if (status.stdout.trim()) {
  const msg = process.argv[3] || `更新文章 ${new Date().toISOString().slice(0, 10)}`;
  spawnSync("git", ["commit", "-m", msg], { cwd: root, stdio: "inherit" });
  run("git", ["push"], "推送 GitHub");
  console.log("\n✅ 全部完成：已部署上线并备份到 GitHub");
} else {
  console.log("\n✅ 部署完成（内容与上次一致，git 无变更，跳过推送）");
}
