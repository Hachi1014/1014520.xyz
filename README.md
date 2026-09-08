# zhangboyang · Personal Website

个人网站，包含博客、想法、日常和 Explore 技术探索，以及独立文章页与简历入口。

## 本地运行

需要 Node.js 22.13 或更新版本。

```sh
npm ci
npm run dev
npm run build
```

构建会校验并还原 `content/blog/media-parts` 和 `content/explore/media-parts` 中的图片分块。完整图片不重复提交，原始知识库不属于本仓库。

## 内容与交互

- 首页分区导航、每区最多十条及“全部展开”。
- 想法和 Explore 支持日期排序与分类浏览。
- 文章返回原入口并居中定位；图片支持放大、滚轮缩放和拖动。
- 明暗主题与跟随页面的回到顶部。

`content` 中仅保留选入网站的内容。导入原稿时，向 `scripts/import_blog.py` 或 `scripts/import_explore.py` 显式传入对应目录；导入所需的 Python 包为 markdown-it-py、bleach、Pillow。原文件只读。

## 隐私与部署

**本仓库为私有仓库。** 内容仍包括作者主动选入的观点、生活记录、配图，以及页面公开展示的 GitHub 和联系邮箱；不能因为经过检查就默认适合公开。

线上访问限制由 Sites 平台提供，仓库代码本身没有独立登录系统。将代码部署到其他平台，不会自动继承“仅作者可见”的访问设置。`.openai/hosting.json` 记录现有网站标识，不包含访问凭证。

本仓库从检查后的当前内容建立，不携带旧的文章编辑历史。凭证、原始日记、构建缓存和本地文字识别结果不提交。安全检查范围与结果见 `SECURITY-REVIEW.md`。

原波点参考页面保留在 `/how-it-works`；部分效果算法、字体与素材来自 ainft.com 的公开前端资源。字体许可见 `public/fonts`。
