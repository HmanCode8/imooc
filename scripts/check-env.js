#!/usr/bin/env node
import process from "process";
import fs from "fs";
// ==== 配置 ====
const requiredMajor = 22; // Node 主版本要求
const allowedPM = "pnpm"; // 允许的包管理器

const deleteNodeModules = () => {
  try {
    fs.rmSync("node_modules", { recursive: true, force: true });
    // console.log("已删除旧的 node_modules 目录");
  } catch (err) {
    console.error("删除旧的 node_modules 目录失败:", err);
  }
};

// ==== 检查 Node 版本 ====
const currentMajor = parseInt(process.versions.node.split(".")[0], 10);

if (currentMajor !== requiredMajor) {
  console.error(
    `❌ 当前 Node 版本是 v${process.versions.node}，请切换到 Node v${requiredMajor} (用 nvm use ${requiredMajor})`
  );
  console.log("请使用 nvm 切换 Node 版本");
  // deleteNodeModules();
  process.exit(1);
}

// ==== 检查包管理器 ====
const userAgent = process.env.npm_config_user_agent || "";
if (!userAgent.startsWith(allowedPM)) {
  console.error(
    `❌ 当前检测到使用的是 ${userAgent.split("/")[0] || "未知工具"}，请使用 ${allowedPM} 来执行此命令！`
  );
  // deleteNodeModules();

  process.exit(1);
}

// ==== 通过检查 ====
// console.log("✅ 环境检查通过，可以继续安装/运行。");
