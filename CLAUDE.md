# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指引。

## 项目概述

Color Convert — 一个基于浏览器的 CSS 颜色格式转换工具。粘贴包含颜色值（HEX、RGB、HSL、OKLCH）的 CSS，即可实时转换为目标格式。支持 PWA 离线使用。

## 常用命令

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器，访问 http://localhost:3000
npm run build      # 生产构建（输出到 dist/）
npm run preview    # 本地预览生产构建
```

本项目未配置测试框架或代码检查工具。

## 架构

**技术栈：** React 19、TypeScript、Vite 6、Tailwind CSS（通过 `index.html` 中的 CDN `<script>` 标签引入，非构建依赖）。

**入口链路：** `index.html` → `index.tsx` → `App.tsx` → `components/ColorConverter.tsx`

**核心文件：**

- `services/colorConverter.ts` — 所有颜色转换逻辑。通过正则（`COLOR_REGEX`）解析 CSS 颜色字符串，以 RGB 为中间格式进行转换，再格式化输出。导出 `convertCssColors()`（主函数）和 `ColorFormat` 类型。未使用任何外部颜色库。
- `components/ColorConverter.tsx` — 全部 UI 集中在一个文件（约 860 行）。包含主组件 `ColorConverter` 及内联子组件：`SettingsPanel`（桌面端下拉设置）、`SettingsDrawer`（移动端底部抽屉）、`ColorTooltip`（桌面端悬浮预览）、`ColorPreviewDrawer`（移动端点击预览）、`ToggleSwitch`。设置项通过 `useLocalStorage` hook 持久化到 localStorage。
- `components/CodeEditor.tsx` — 自定义代码编辑器，基于 `<textarea>` 加同步的 `<pre>` 高亮层实现。颜色标记支持交互式高亮（桌面端悬浮预览，移动端点击预览）。通过 `forwardRef` 暴露 `CodeEditorHandle.scrollTo()` 方法，支持外部程序化滚动控制；`onScroll` 回调用于跨编辑器滚动同步。
- `hooks/useLocalStorage.ts` — 通用的 localStorage 同步 hook，支持 JSON 序列化。
- `sw.js` — PWA Service Worker，采用网络优先缓存策略。

**路径别名：** `@/*` 映射到项目根目录（在 `vite.config.ts` 和 `tsconfig.json` 中均已配置）。

**URL 分享：** 输入文本通过 Base64 编码（使用 `encodeURIComponent`/`escape` 保证 Unicode 安全）同步到 URL 的 `?code=` 参数。页面加载时 `getInitialInputText()` 优先从 URL 读取，否则使用默认占位文本。

**移动端适配：** 通过 `useIsMobile()` hook（768px 断点）在桌面端（悬浮提示/下拉设置）和移动端（底部抽屉）之间切换。

**滚动同步与高度限制：** 设置项 `syncScroll`（默认开启）控制两个功能：(1) 编辑器最大高度限制为 `80dvh`，超出后出现滚动条；(2) Input/Output 双向滚动同步（通过 `syncingRef` 防止无限循环）。关闭后编辑器高度自适应内容，无滚动条。

**颜色检测正则：** `COLOR_REGEX` 匹配 `hex`、`rgb()`、`rgba()`、`hsl()`、`hsla()`、`oklch()` 格式。输入编辑器仅高亮不转换（输入侧禁用高亮层）；输出编辑器展示转换后的颜色并启用高亮。

**Google AI Studio 来源：** `index.html` 的 importmap 将 `react` 和 `react-dom` 映射到 `aistudiocdn.com`。`vite.config.ts` 从 `.env.local` 读取 `GEMINI_API_KEY` 并定义为 `process.env.GEMINI_API_KEY`（README 中提及但当前代码未使用）。
