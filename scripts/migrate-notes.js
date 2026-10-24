// Sync selected Obsidian folders without deleting posts or changing published URLs.
// node scripts/migrate-notes.js [--source VAULT] [--existing BLOG] [--output BLOG]
// Add a folder explicitly with --include FOLDER (repeatable); --dry-run writes nothing.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const options = { source: "D:/somethingaboutnothing/notefiles/note", existing: ROOT, output: ROOT, include: [], dryRun: false };
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === "--dry-run" || arg === "--dry") options.dryRun = true;
  else if (["--source", "--existing", "--output", "--include", "--asset-fallback"].includes(arg)) {
    const value = process.argv[++i];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}`);
    if (arg === "--include") options.include.push(value);
    else options[arg.slice(2)] = path.resolve(value);
  } else throw new Error(`Unknown option: ${arg}`);
}
const SRC = path.resolve(options.source);
const EXISTING = path.resolve(options.existing);
const OUTPUT = path.resolve(options.output);
const OUT = path.join(OUTPUT, "src/content/blog");
const ASSETS = path.join(OUTPUT, "public/posts/assets");
const OLD_POSTS = path.join(EXISTING, "src/content/blog");
const OLD_ASSETS = path.join(EXISTING, "public/posts/assets");
const requireBlog = createRequire(path.join(EXISTING, "package.json"));
const requireAstro = createRequire(requireBlog.resolve("astro/package.json"));
const yaml = requireAstro("js-yaml");
const { slug: githubSlug } = await import(pathToFileURL(requireAstro.resolve("github-slugger")).href);
const KEEP_DIRS = new Set(["D2lNotes", "d2l", "Verilog", "BERT", "Rust学习", "刘二大人pytorch", "Pytorch distributed", "easyRL", ...options.include]);
for (const folder of KEEP_DIRS) {
  if (!folder || folder.startsWith(".") || /[\\/]/.test(folder)) throw new Error(`Invalid top-level folder: ${folder}`);
}
const MEDIA = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif", ".bmp", ".ico", ".pdf", ".mp3", ".wav", ".ogg", ".mp4", ".webm"]);
const IMAGE = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif", ".bmp", ".ico"]);
const slash = value => value.split(path.sep).join("/");
const normalize = value => value.normalize("NFC").toLowerCase();
const report = { source: SRC, existing: EXISTING, output: OUTPUT, includedFolders: [...KEEP_DIRS], new: 0, updated: 0, unchanged: 0, moved: 0, assetsCopied: 0, decorativeImagesRemoved: 0, renderingFixes: 0, skipped: [], missingAssets: [], unresolvedLinks: [], ambiguousLinks: [], posts: [] };
const diagnosticKeys = new Set();
function diagnostic(kind, note, target, reason) {
  const row = { note: slash(path.relative(SRC, note)), target, ...(reason ? { reason } : {}) };
  const key = kind + JSON.stringify(row);
  if (!diagnosticKeys.has(key)) { report[kind].push(row); diagnosticKeys.add(key); }
}
function* walk(dir, notesOnly = false) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith(".") || entry.isSymbolicLink()) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!/documentation$/i.test(entry.name)) yield* walk(abs, notesOnly);
    } else if (entry.isFile() && (entry.name.toLowerCase().endsWith(".md") || (!notesOnly && MEDIA.has(path.extname(entry.name).toLowerCase())))) yield abs;
  }
}
function frontmatter(text, file) {
  text = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const match = text.match(/^---\n([\s\S]*?)\n(?:---|\.\.\.)[ \t]*(?:\n|$)/);
  if (!match) return { data: {}, body: text, header: "", text };
  let data;
  try { data = yaml.load(match[1], { schema: yaml.CORE_SCHEMA }) || {}; }
  catch (error) { throw new Error(`Invalid YAML in ${file}: ${error.reason || error.message}`); }
  if (typeof data !== "object" || Array.isArray(data)) throw new Error(`Expected YAML mapping in ${file}`);
  return { data, body: text.slice(match[0].length), header: match[0], text };
}
function legacyName(rel) {
  const stem = path.basename(rel, path.extname(rel));
  const dir = path.dirname(rel) === "." ? "" : path.dirname(rel).replace(/[\\/\s]+/g, "-") + "-";
  return (dir + stem).replace(/[<>:"|?*\u0000-\u001f]/g, "").replace(/\s+/g, "-").slice(0, 120) || "untitled";
}
const routeFor = (filename, data = {}) => `/posts/${String(data.slug || filename.replace(/\.md$/i, "").split(/[\\/]/).map(githubSlug).join("/")).split("/").map(encodeURIComponent).join("/")}/`;
const oldPosts = [...walk(OLD_POSTS, true)].map(abs => ({ abs, filename: slash(path.relative(OLD_POSTS, abs)), ...frontmatter(fs.readFileSync(abs, "utf8"), abs) }));
const byFilename = new Map(oldPosts.map(post => [normalize(post.filename), post]));
const oldByTitle = new Map();
for (const post of oldPosts) {
  const title = normalize(String(post.data.title || ""));
  const categories = Array.isArray(post.data.tags) ? post.data.tags : [];
  for (const category of KEEP_DIRS) {
    if (categories.includes(category) || normalize(post.filename).startsWith(normalize(category + "-"))) {
      const key = normalize(category) + "/" + title;
      oldByTitle.set(key, [...(oldByTitle.get(key) || []), post]);
    }
  }
}
const files = [...walk(SRC)];
const fileSet = new Set(files.map(abs => normalize(abs)));
const fallbackAssets = [...new Set([OLD_ASSETS, options["asset-fallback"]].filter(Boolean))].flatMap(dir => [...walk(dir)].filter(abs => MEDIA.has(path.extname(abs).toLowerCase())));
const byName = new Map();
for (const abs of files) {
  const key = normalize(path.basename(abs));
  byName.set(key, [...(byName.get(key) || []), abs]);
}
const notes = [];
const claimed = new Set();
for (const abs of files.filter(abs => path.extname(abs).toLowerCase() === ".md")) {
  const rel = path.relative(SRC, abs);
  const topDir = rel.split(path.sep)[0];
  if (!KEEP_DIRS.has(topDir)) continue;
  const parsed = frontmatter(fs.readFileSync(abs, "utf8"), abs);
  let skip = "";
  if (!parsed.body.trim()) skip = "empty";
  else if (/excalidraw-plugin/.test(parsed.header) || /\.excalidraw\.md$/i.test(abs)) skip = "Excalidraw source";
  else if (/Open the notebook in Colab/.test(parsed.body.slice(0, 800))) skip = "clipped webpage";
  if (skip) { report.skipped.push({ note: slash(rel), reason: skip }); continue; }
  const basename = path.basename(abs, path.extname(abs));
  const title = typeof parsed.data.title === "string" ? parsed.data.title : basename;
  let existing = byFilename.get(normalize(legacyName(rel) + ".md"));
  if (!existing) {
    const matches = new Set([...(oldByTitle.get(normalize(topDir) + "/" + normalize(title)) || []), ...(oldByTitle.get(normalize(topDir) + "/" + normalize(basename)) || [])]);
    if (matches.size === 1) existing = [...matches][0];
    else if (matches.size > 1) throw new Error(`Ambiguous existing post for ${slash(rel)}; refusing to create a duplicate URL.`);
  }
  const filename = existing?.filename || legacyName(rel) + ".md";
  if (claimed.has(normalize(filename))) throw new Error(`Multiple notes map to ${filename}; resolve before syncing.`);
  claimed.add(normalize(filename));
  const note = { abs, rel, topDir, title, filename, existing, ...parsed };
  note.route = routeFor(filename, existing?.data || {});
  notes.push(note);
  if (existing && normalize(filename) !== normalize(legacyName(rel) + ".md")) report.moved++;
}
const routeOwners = new Map(oldPosts.map(post => [routeFor(post.filename, post.data), post.filename]));
for (const note of notes) {
  const owner = routeOwners.get(note.route);
  if (owner && owner !== note.filename) throw new Error(`Astro slug collision: ${note.filename} and ${owner}`);
  routeOwners.set(note.route, note.filename);
}
const noteByPath = new Map(notes.map(note => [normalize(note.abs), note]));
const isDraft = note => note.data.draft === true || note.existing?.data.draft === true;
function decode(value) { try { return decodeURIComponent(value); } catch { return value; } }
function resolveFile(rawTarget, from, extensions = []) {
  const target = decode(rawTarget.replace(/\\([ ()\[\]])/g, "$1")).replace(/\\/g, "/");
  const candidates = [target, ...extensions.map(ext => target + ext)];
  for (const candidate of candidates) {
    for (const base of [path.dirname(from), SRC]) {
      const abs = path.resolve(base, candidate.replace(/^\//, ""));
      if (fileSet.has(normalize(abs))) return { file: files.find(file => normalize(file) === normalize(abs)) };
    }
  }
  const hits = [...new Set(candidates.flatMap(candidate => byName.get(normalize(path.basename(candidate))) || []))];
  if (hits.length === 1) return { file: hits[0] };
  if (hits.length > 1) return { ambiguous: true };
  const basename = path.basename(target);
  if (MEDIA.has(path.extname(basename).toLowerCase())) {
    const fallback = fallbackAssets.filter(abs => normalize(path.basename(abs)) === normalize(basename) || normalize(path.basename(abs)).endsWith("-" + normalize(basename)));
    if (fallback.length === 1) return { file: fallback[0] };
    if (fallback.length > 1) {
      const first = fs.readFileSync(fallback[0]);
      if (fallback.every(abs => first.equals(fs.readFileSync(abs)))) return { file: fallback[0] };
      return { ambiguous: true };
    }
  }
  return {};
}
const copied = new Map();
function legacyHash(buffer, basename) {
  let value = 0;
  for (let i = 0; i < buffer.length; i += 4096) value = (value * 31 + buffer[i]) >>> 0;
  return value.toString(36) + "-" + basename.replace(/[<>:"|?*\s]/g, "-");
}
function copyAsset(abs) {
  if (copied.has(abs)) return copied.get(abs);
  const buffer = fs.readFileSync(abs);
  const retainedAsset = path.dirname(abs) === OLD_ASSETS;
  let filename = retainedAsset ? path.basename(abs) : legacyHash(buffer, path.basename(abs));
  const legacy = path.join(OLD_ASSETS, filename);
  if (!retainedAsset && (!fs.existsSync(legacy) || !buffer.equals(fs.readFileSync(legacy)))) {
    filename = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 16) + "-" + path.basename(abs).replace(/[<>:"|?*\s]/g, "-");
  }
  if (!options.dryRun) {
    fs.mkdirSync(ASSETS, { recursive: true });
    const destination = path.join(ASSETS, filename);
    if (!fs.existsSync(destination) || !buffer.equals(fs.readFileSync(destination))) fs.writeFileSync(destination, buffer);
  }
  const url = `/posts/assets/${encodeURIComponent(filename)}`;
  copied.set(abs, url);
  return url;
}
const escapeAttribute = value => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeLabel = value => value.replace(/([\[\]\\])/g, "\\$1");
function isExternal(url) { return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url); }
function noteLink(target, alias, note, embed = false) {
  const [name, heading] = target.split("#", 2);
  let targetNote = !name ? note : undefined;
  if (name) {
    const resolved = resolveFile(name, note.abs, [".md"]);
    if (resolved.ambiguous) diagnostic("ambiguousLinks", note.abs, target);
    if (resolved.file && /\.excalidraw\.md$/i.test(resolved.file)) {
      return `<a href="${copyAsset(resolved.file)}" download>手绘图源文件：${escapeAttribute(alias || name)}</a>`;
    }
    targetNote = resolved.file && noteByPath.get(normalize(resolved.file));
    if (!targetNote || isDraft(targetNote)) {
      diagnostic("unresolvedLinks", note.abs, target, targetNote ? "draft" : resolved.file ? "outside published scope or skipped" : "not found");
      return escapeLabel(alias || name || heading || target);
    }
  }
  const fragment = heading ? "#" + encodeURIComponent(githubSlug(heading)) : "";
  return `[${escapeLabel(alias || name || heading || targetNote.title)}](${targetNote.route}${fragment})`;
}
function transformWiki(text, note) {
  return text.replace(/(!?)\[\[([^\]\n]+)\]\]/g, (original, embed, value) => {
    const [targetRaw, ...aliasParts] = value.split("|");
    const target = targetRaw.trim();
    const alias = aliasParts.join("|").trim();
    const ext = path.extname(target.split("#")[0]).toLowerCase();
    if (!embed || ext === ".md" || !ext) {
      if (!embed || ext === ".md") return noteLink(target, alias, note, Boolean(embed));
      const resolved = resolveFile(target, note.abs, [".md"]);
      if (resolved.file && path.extname(resolved.file).toLowerCase() === ".md") return noteLink(target, alias, note, true);
    }
    let resolved = resolveFile(target, note.abs, ext ? [] : [...IMAGE]);
    let provenance = "";
    if (!resolved.file && slash(note.rel) === "Verilog/Verilog 模块例化.md" && target === "Pasted image 20260818203852.png") {
      resolved = resolveFile("verilog-module-hierarchy-runoob.png", note.abs);
      if (resolved.file) provenance = "\n\n[模块层级示意图来源：菜鸟教程](https://www.runoob.com/w3cnote/verilog-generate.html)";
    }
    if (!resolved.file || !MEDIA.has(path.extname(resolved.file).toLowerCase())) {
      diagnostic(resolved.ambiguous ? "ambiguousLinks" : "missingAssets", note.abs, target);
      return `\n\n> 图片暂缺：${escapeLabel(target)}\n\n`;
    }
    const url = copyAsset(resolved.file);
    if (!IMAGE.has(path.extname(resolved.file).toLowerCase())) return `[${escapeLabel(alias || path.basename(target))}](${url})`;
    const width = /^\d+(?:x\d+)?$/.test(alias) ? Number(alias.split("x")[0]) : null;
    // Blank lines prevent a raw HTML image from swallowing subsequent Markdown.
    const style = width ? ` style="max-width:${Math.max(1, Math.round(width / 2))}px"` : "";
    return `\n\n<img src="${url}" alt="${escapeAttribute(provenance ? "模块层级示意图（菜鸟教程）" : target)}" loading="lazy"${style} />${provenance}\n\n`;
  });
}
// Balanced destinations support local filenames containing spaces and parentheses.
function transformMarkdownLinks(text, note) {
  let out = "", cursor = 0;
  const startPattern = /!?\[(?:\\.|[^\]\\\n])*\]\(/g;
  for (let match; (match = startPattern.exec(text));) {
    const start = match.index;
    if (start > 0 && text[start - 1] === "\\") continue;
    const contentStart = startPattern.lastIndex;
    let depth = 1, end = contentStart, angle = false;
    for (; end < text.length; end++) {
      const char = text[end];
      if (char === "\\") { end++; continue; }
      if (char === "<" && end === contentStart) angle = true;
      else if (char === ">" && angle) angle = false;
      else if (!angle && char === "(") depth++;
      else if (!angle && char === ")" && --depth === 0) break;
      if (char === "\n" && depth === 1) break;
    }
    if (depth !== 0) continue;
    startPattern.lastIndex = end + 1;
    const original = text.slice(start, end + 1);
    const isImage = match[0].startsWith("!");
    const label = match[0].slice(isImage ? 2 : 1, -2);
    let destination = text.slice(contentStart, end).trim();
    let suffix = "";
    if (destination.startsWith("<") && destination.includes(">")) {
      const closing = destination.indexOf(">"); suffix = destination.slice(closing + 1); destination = destination.slice(1, closing);
    } else {
      const title = destination.match(/\s+(["'])([\s\S]*)\1$/);
      if (title) { suffix = title[0]; destination = destination.slice(0, title.index); }
    }
    let replacement = original;
    if (!isImage && label === "UNK" && destination === "100" && /BertTokenizer subword,wordpiece 如何处理数字等长尾单词\.md$/.test(note.rel)) {
      replacement = "`[UNK](100)`"; report.renderingFixes++;
    } else if (isImage && /(?:^|\/)copy-button\.svg(?:[?#]|$)/i.test(destination)) {
      replacement = ""; report.decorativeImagesRemoved++;
    } else if (!isExternal(destination) && !destination.startsWith("/posts/") && !destination.startsWith("#")) {
      const [local, fragment] = destination.split("#", 2);
      const resolved = resolveFile(local, note.abs, isImage ? [] : [".md"]);
      if (resolved.file && MEDIA.has(path.extname(resolved.file).toLowerCase())) replacement = `${isImage ? "!" : ""}[${label}](${copyAsset(resolved.file)}${fragment ? "#" + fragment : ""}${suffix})`;
      else if (!isImage && resolved.file && noteByPath.has(normalize(resolved.file))) {
        const linkedNote = noteByPath.get(normalize(resolved.file));
        if (isDraft(linkedNote)) { replacement = label; diagnostic("unresolvedLinks", note.abs, destination, "draft"); }
        else replacement = `[${label}](${linkedNote.route}${fragment ? "#" + encodeURIComponent(githubSlug(decode(fragment))) : ""}${suffix})`;
      }
      else diagnostic(resolved.ambiguous ? "ambiguousLinks" : isImage ? "missingAssets" : "unresolvedLinks", note.abs, destination);
    }
    out += text.slice(cursor, start) + replacement;
    cursor = end + 1;
  }
  return out + text.slice(cursor);
}
function outsideInlineCode(text, fn) {
  let result = "", cursor = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "`" || (i > 0 && text[i - 1] === "\\")) continue;
    let j = i;
    while (text[j] === "`") j++;
    const marker = text.slice(i, j);
    let end = j;
    while ((end = text.indexOf(marker, end)) !== -1) {
      if (text[end - 1] !== "`" && text[end + marker.length] !== "`") break;
      end += marker.length;
    }
    if (end === -1) { i = j - 1; continue; }
    result += fn(text.slice(cursor, i)) + text.slice(i, end + marker.length);
    cursor = end + marker.length; i = cursor - 1;
  }
  return result + fn(text.slice(cursor));
}
function transformBody(body, note) {
  const transform = text => {
    // Only known malformed delimiters are split; mathematical expressions stay intact.
    const rel = slash(note.rel);
    if (["D2lNotes/U1/Softmax.md", "D2lNotes/U2/权重衰减.md", "刘二大人pytorch/L7.md"].includes(rel)) {
      text = text.replace(/\$\$(?=尽管|将原来|\*\*So we get:)/g, () => { report.renderingFixes++; return "$$\n\n"; });
    }
    if (rel === "D2lNotes/U1/Linear Regression.md") text = text.replace(/^\$\$\$\$$/gm, () => { report.renderingFixes++; return "$$\n\n$$"; });
    if (rel === "BERT/2/GPT2 sampling (top-k,top-p (neculeus sampling).md") {
      text = text.replace(/^\$\$(.+?)\$\$(.+?)\$\$\$\$$/gm, (_all, first, second) => { report.renderingFixes++; return `$$\n${first}\n$$\n\n$$\n${second}\n$$`; });
    }
    if (rel === "easyRL/U4/策略梯度.md") {
      text = text.replace(/^有\$\$$/gm, () => { report.renderingFixes++; return "有\n\n$$"; });
      text = text.replace(/^\t\$\$(\\begin\{gather\}[\s\S]*?\\end\{gather\})\n\t\$\$/m, (_all, math) => {
        report.renderingFixes++;
        return ">\n> $$\n" + math.split("\n").map(line => "> " + line.replace(/^\t/, "")).join("\n") + "\n> $$";
      });
    }
    if (rel === "BERT/2/GPT2 decoding (greedy search,beam search).md") {
      text = text.replaceAll("\\sum_{i=1}^\\,logp", () => { report.renderingFixes++; return "\\sum_{i=1}^{N}\\,logp"; });
    }
    return transformWiki(transformMarkdownLinks(text, note), note)
      .replace(/<img\b[^>]*\/?\s*>/gi, image => `\n\n${image}\n\n`);
  };
  let result = "", plain = "", fence = null;
  for (const line of body.match(/.*(?:\n|$)/g) || []) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      result += line;
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && line.slice(marker[0].length).trim() === "") fence = null;
    } else if (marker) {
      result += outsideInlineCode(plain, transform) + line; plain = ""; fence = marker[1];
    } else plain += line;
  }
  return result + outsideInlineCode(plain, transform);
}
function dateOf(note) {
  const candidate = note.data.published ?? note.data.date ?? note.rel.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (candidate && /^\d{4}-\d{2}-\d{2}/.test(String(candidate)) && !Number.isNaN(Date.parse(String(candidate)))) return String(candidate).slice(0, 10);
  const stat = fs.statSync(note.abs);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(stat.birthtimeMs > 0 ? stat.birthtime : stat.mtime);
}
for (const note of notes) {
  let body = transformBody(note.body, note);
  if (!note.existing || body !== note.body) body = body.replace(/\n+$/, "\n");
  let header = note.existing?.header;
  if (!header) {
    const tags = Array.isArray(note.data.tags) && note.data.tags.every(tag => typeof tag === "string") ? note.data.tags : [note.topDir];
    header = `---\n${yaml.dump({ title: note.title, published: dateOf(note), description: typeof note.data.description === "string" ? note.data.description : "", tags, draft: note.data.draft === true }, { lineWidth: -1, noRefs: true })}---\n`;
  } else if (note.data.draft === true && note.existing.data.draft !== true) {
    header = `---\n${yaml.dump({ ...note.existing.data, draft: true }, { lineWidth: -1, noRefs: true })}---\n`;
  }
  const text = header + body;
  const status = !note.existing ? "new" : note.existing.text === text ? "unchanged" : "updated";
  report[status]++;
  report.posts.push({ source: slash(note.rel), file: note.filename, url: note.route, status, draft: note.data.draft === true || note.existing?.data.draft === true });
  if (!options.dryRun) {
    const destination = path.join(OUT, note.filename);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (OUTPUT !== EXISTING || status !== "unchanged") fs.writeFileSync(destination, text, "utf8");
  }
}
report.assetsCopied = copied.size;
if (!options.dryRun) fs.writeFileSync(path.join(OUTPUT, "note-sync-report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ new: report.new, updated: report.updated, unchanged: report.unchanged, preservedMovedUrls: report.moved, assets: report.assetsCopied, decorativeImagesRemoved: report.decorativeImagesRemoved, renderingFixes: report.renderingFixes, skipped: report.skipped.length, missingAssets: report.missingAssets.length, unresolvedLinks: report.unresolvedLinks.length, ambiguousLinks: report.ambiguousLinks.length, report: options.dryRun ? null : path.join(OUTPUT, "note-sync-report.json") }, null, 2));
