import type en from "./en";

const zh: typeof en = {
  title: "颜色转换",
  subtitle: "一个 CSS 颜色格式转换工具。",
  placeholder: `/*
  在此处粘贴包含颜色值的 CSS。
  工具会立即转换它们。
*/

:root {
  --md-sys-color-primary: #6750A4;
  --md-sys-color-secondary: #958DA5;
  --md-ref-palette-tertiary50: #7D5260;

  /* 其他格式也可以 */
  --accent-rgb: rgb(103, 80, 164);
  --accent-hsl: hsl(200, 80%, 60%);
  --transparent: oklch(59.69% 0.154 292.34 / 50%);
}

.card {
  background-color: var(--md-sys-color-secondary);
  color: #FFFFFF;
}`,
  copyOutput: "复制输出",
  copied: "已复制!",
  outputFormat: "输出格式",
  cssSyntax: "CSS 语法",
  showColorPreviews: "显示颜色预览",
  compareOnPreview: "预览时对比",
  showLineNumbers: "显示行号",
  showRayButton: '显示 "在 Ray.so 打开"',
  syncScroll: "同步滚动并限制高度",
  viewMode: "视图模式",
  dualColumn: "双栏视图",
  singleColumn: "单栏视图",
  previewBackground: "预览背景",
  input: "输入",
  output: "输出",
  original: "原始",
  converted: "转换后",
  released: "基于 MIT 许可证发布。",
  copyright: "版权所有 © 2025-2026 owocc",
  urlError: "无法从 URL 加载代码，因为内容似乎已损坏。将加载默认示例。",
  ariaOpenSettings: "打开设置",
  ariaGitHub: "在 GitHub 上查看源码",
  ariaRaySo: "在 Ray.so 中打开输出",
  ariaCssInput: "CSS 输入",
  ariaCssOutput: "转换后的 CSS 输出",
  ariaOutputFormat: "选择输出颜色格式",
  ariaEditorView: "编辑器视图",
  ariaBgDark: "设置预览背景为深色",
  ariaBgGrey: "设置预览背景为灰色",
  ariaBgLight: "设置预览背景为浅色",
  ariaBgWhite: "设置预览背景为白色",
};

export default zh;
