# Color Convert

> A browser-based CSS color format converter. Paste CSS containing color values (HEX, RGB, HSL, OKLCH) and instantly convert them to your target format.

[中文文档](./README_CN.md)

## Features

- **Real-time conversion** — Paste CSS, get converted output instantly
- **Multiple formats** — Supports HEX, RGB, HSL, and OKLCH
- **Color previews** — Hover (desktop) or tap (mobile) to see color swatches
- **Compare mode** — View original and converted colors side by side
- **URL sharing** — Input is encoded to the URL for easy sharing
- **Sync scroll** — Input and output editors scroll in sync with height limit
- **PWA support** — Works offline after first visit
- **Responsive** — Desktop and mobile friendly

## Getting Started

**Prerequisites:** Node.js

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- React 19
- TypeScript
- Vite 6
- Tailwind CSS (via CDN)

## License

Released under the [MIT License](./LICENSE).

Copyright (c) 2014-2026 [owocc](https://github.com/owocc)
