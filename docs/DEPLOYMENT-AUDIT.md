# GitHub Pages 部署审计

审计日期：2026-10-21

## 结论

- 发布根目录包含 `index.html`，所有运行时资源均使用相对路径。
- 全站为原生 HTML / CSS / JavaScript，无 npm 依赖、无构建步骤、无 CDN 动画库。
- 所有 HTML 与 CSS 引用的本地资源均已验证存在；运行时外部 HTTP/HTTPS 资源为 0。
- 未发现超过 100 MB 的单文件；四个视频均为本地文件。
- `.gitignore` 排除 `.env`、`node_modules`、日志和系统文件。

## 内容统计

- 文件：172 个
- 总大小：53.45 MB
- 图片与动效帧：121 个
- 交互脚本：5 个
- 样式文件：5 个
- 视频：4 个

## 完整作品集下载

- `assets/downloads/Wang-Zheng-Portfolio-2026.pdf` — 9.29 MB
- 首页页脚使用相对路径与 HTML `download` 属性提供下载。

## 四个视频

- `assets/videos/design-leadership/case1-family01.mp4` — 2.50 MB
- `assets/videos/design-leadership/case2-family02.mp4` — 3.19 MB
- `assets/videos/design-leadership/case3-pingan.mp4` — 3.52 MB
- `assets/videos/design-leadership/case4-clinic.m4v` — 3.81 MB

## 动效运行文件

### JavaScript
- `assets/js/bianque.js` — 7.66 KB
- `assets/js/design-leadership.js` — 8.28 KB
- `assets/js/health-check.js` — 6.46 KB
- `assets/js/portfolio-shell.js` — 791 B
- `assets/js/site.js` — 5.77 KB

### CSS
- `assets/css/bianque.css` — 35.63 KB
- `assets/css/design-leadership.css` — 14.79 KB
- `assets/css/health-check.css` — 8.49 KB
- `assets/css/portfolio-shell.css` — 4.85 KB
- `assets/css/site.css` — 22.51 KB

### 预约路径动画 GIF
- `assets/images/health-check/fullpage/booking-step-1-forward.gif` — 2.70 MB
- `assets/images/health-check/fullpage/booking-step-1-reverse.gif` — 2.70 MB
- `assets/images/health-check/fullpage/booking-step-2-forward.gif` — 2.99 MB
- `assets/images/health-check/fullpage/booking-step-2-reverse.gif` — 2.99 MB
- `assets/images/health-check/fullpage/booking-step-3-forward.gif` — 2.92 MB
- `assets/images/health-check/fullpage/booking-step-3-reverse.gif` — 2.92 MB

### 首屏卡片动效图层
- `assets/images/design-leadership/hero-motion/hero-card-1.png` — 206.25 KB
- `assets/images/design-leadership/hero-motion/hero-card-2.png` — 209.63 KB
- `assets/images/design-leadership/hero-motion/hero-card-3.png` — 194.36 KB

### 动效与页面规划文档

- `docs/planning/三个重点项目-整体规划-v1.md` — 3.29 KB
- `docs/planning/体检到店履约-即时动态展示规划-v1.md` — 2.69 KB
- `docs/planning/体检到店履约-即时动态展示规划-v2.md` — 2.31 KB
- `docs/planning/体检到店履约-即时动态展示规划-v3.md` — 1.75 KB
- `docs/planning/体检检后报告-内容与画面规划-v1.md` — 5.84 KB
- `docs/planning/体检预约方案-01原位展开交互-v2.md` — 4.72 KB
- `docs/planning/体检预约方案-总览到细节交互构想-v1.md` — 7.42 KB
- `docs/planning/体检预约方案-视觉制作确认稿-v1.md` — 7.57 KB
- `docs/planning/体检预约链路-右侧内容定稿-v1.md` — 8.35 KB
- `docs/planning/体检预约链路-连续章节规划-v2.md` — 12.60 KB
- `docs/planning/正式动态网站-总体制作规划-v1.md` — 16.62 KB
- `docs/planning/正式网页-静态稿与交互映射-v1.md` — 6.67 KB
- `docs/planning/第三部分-内容与构图执行规划-v1.md` — 14.58 KB
- `docs/planning/第三部分-内容与构图执行规划-v2.md` — 19.03 KB
- `docs/planning/第三部分-网页文案与视觉润色基准-v1.md` — 8.24 KB
- `docs/planning/第三部分-设计书架与AI视频流程衔接-v1.md` — 21.79 KB
- `docs/planning/管理与技术拓展-章节规划与文案-v1.md` — 13.51 KB
- `docs/planning/管理与技术拓展-章节规划与文案-v2.md` — 15.71 KB
- `docs/planning/管理与技术拓展-章节规划与文案-v3.md` — 16.74 KB
- `docs/planning/管理与技术拓展-章节规划与文案-v4.md` — 17.46 KB

## 动效依赖

- 本地库：无第三方动画库。
- CDN：无。
- 浏览器原生能力：CSS `@keyframes`、`IntersectionObserver`、`requestAnimationFrame`、计时器与 HTML5 Video。

## 构建与发布

- 构建命令：无。
- 本地预览：`python3 -m http.server 4173`。
- GitHub Pages：从 `main` 分支仓库根目录直接发布。
