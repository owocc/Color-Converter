# Color Convert

> 一个基于浏览器的 CSS 颜色格式转换工具。粘贴包含颜色值（HEX、RGB、HSL、OKLCH）的 CSS，即可实时转换为目标格式。

[English](./README.md)

## 功能特性

- **实时转换** — 粘贴 CSS，即时获得转换后的输出
- **多格式支持** — 支持 HEX、RGB、HSL 和 OKLCH
- **颜色预览** — 桌面端悬浮或移动端点击可查看色块预览
- **对比模式** — 原始颜色与转换后颜色并排对比
- **URL 分享** — 输入内容自动编码到 URL，方便分享
- **滚动同步** — 输入和输出编辑器同步滚动，支持高度限制
- **PWA 支持** — 首次访问后可离线使用
- **响应式设计** — 适配桌面端和移动端

## 快速开始

**前置要求：** Node.js

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## 技术栈

- React 19
- TypeScript
- Vite 6
- Tailwind CSS（通过 CDN 引入）

## 许可证

基于 [MIT 许可证](./LICENSE) 发布。

Copyright (c) 2014-2026 [owocc](https://github.com/owocc)
