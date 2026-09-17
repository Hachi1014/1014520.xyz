# zhangboyang · Personal Website

个人网站，包含博客、想法、日常和 Explore 技术探索，以及独立文章页与简历入口。

## 本地运行

需要 Node.js 22.13 或更新版本。

```sh
npm ci
npm run dev
npm run build
npm run check
```

`public/` 中的完整图片随源码提交，与本地网站资源保持一致。构建会校验博客、探索、想法和日常的图片；缺失或损坏时，从对应 `content/<板块>/media-parts` 还原。原始知识库不属于本仓库。

## 内容与交互

- 首页分区导航、每区最多十条及“全部展开”。
- 想法和 Explore 支持日期排序与分类浏览。
- 文章返回原入口并居中定位；图片支持放大、滚轮缩放和拖动。
- 明暗主题与跟随页面的回到顶部。

`content` 中仅保留选入网站的内容。导入原稿时，向 `scripts/import_blog.py` 或 `scripts/import_explore.py` 显式传入对应目录；导入所需的 Python 包为 markdown-it-py、bleach、Pillow。原文件只读。 探索板块追加导入使用 `python scripts/import_explore.py "原稿目录" --selection content/explore/selections/2026-09-12.json`；清单限定选文、原文哈希和隐私遮挡坐标，已有其他文章保持不变。

## 隐私与部署

本仓库为作者授权公开的个人网站源码，仓库名为 `1014520.xyz`。内容包括作者选入网站的文章、生活记录、配图，以及页面公开展示的 GitHub 和联系邮箱。

当前网站通过 Cloudflare 部署，线上入口为 [1014520.xyz](https://1014520.xyz)。网站和源码仓库均公开访问，仓库代码本身没有独立登录系统。

本仓库从检查后的当前内容建立，不携带旧的文章编辑历史。凭证、原始日记、构建缓存和本地文字识别结果不提交。安全检查范围与结果见 `SECURITY-REVIEW.md`。

原波点参考页面保留在 `/how-it-works`；部分效果算法、字体与素材来自 ainft.com 的公开前端资源。字体许可见 `public/fonts`。

## 精简结构

- `app/`：页面、共用分区布局与交互。`section-layout.tsx` 统一博客、想法、日常和探索的导航与页脚。
- `components/ui/switch.tsx`：唯一保留的模板组件。图片查看器直接使用现有弹窗基础组件。
- `lib/utils.ts`：主题开关所需的样式合并工具。
- `content/`、`public/`：内容与资源；不为整理结构而更改展示数据。
- `scripts/`：内容导入、资源还原和交互校验。

依赖只保留当前页面或构建明确使用的包。不要预装图表、日历、轮播等未接入的组件；新功能确有需要时再添加。保留当前运行框架、样式体系和部署配置，避免为追求文件数量少而改变已有行为。
