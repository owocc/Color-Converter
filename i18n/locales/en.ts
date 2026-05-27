const en = {
  title: "Color Convert",
  subtitle: "A utility to convert CSS colors between formats.",
  placeholder: `/*
  Paste any CSS with colors here.
  The tool will convert them instantly.
*/

:root {
  --md-sys-color-primary: #6750A4;
  --md-sys-color-secondary: #958DA5;
  --md-ref-palette-tertiary50: #7D5260;

  /* Other formats work too */
  --accent-rgb: rgb(103, 80, 164);
  --accent-hsl: hsl(200, 80%, 60%);
  --transparent: oklch(59.69% 0.154 292.34 / 50%);
}

.card {
  background-color: var(--md-sys-color-secondary);
  color: #FFFFFF;
}`,
  copyOutput: "Copy Output",
  copied: "Copied!",
  outputFormat: "Output Format",
  cssSyntax: "CSS Syntax",
  showColorPreviews: "Show Color Previews",
  compareOnPreview: "Compare on Preview",
  showLineNumbers: "Show Line Numbers",
  showRayButton: "Show 'Open in Ray.so'",
  syncScroll: "Sync Scroll & Limit Height",
  viewMode: "View Mode",
  dualColumn: "Dual column view",
  singleColumn: "Single column view",
  previewBackground: "Preview Background",
  input: "Input",
  output: "Output",
  original: "Original",
  converted: "Converted",
  released: "Released under the MIT License.",
  copyright: "Copyright © 2025-2026 owocc",
  urlError:
    "Could not load code from the URL because it appears to be corrupted. Loading the default example instead.",
  ariaOpenSettings: "Open settings",
  ariaGitHub: "View source on GitHub",
  ariaRaySo: "Open output in Ray.so",
  ariaCssInput: "CSS Input",
  ariaCssOutput: "Converted CSS Output",
  ariaOutputFormat: "Select output color format",
  ariaEditorView: "Editor view",
  ariaBgDark: "Set preview background to Dark",
  ariaBgGrey: "Set preview background to Grey",
  ariaBgLight: "Set preview background to Light",
  ariaBgWhite: "Set preview background to White",
};

export default en;
