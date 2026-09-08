# 博客内容

已导入选定的九篇文章。Markdown 副本仅保留网站采用的正文；原始知识库文件不在仓库中。`editorial.json` 记录已确认的截取边界与修改。

`index.generated.json` 用于列表，`posts.generated.json` 包含经过过滤的正文和目录。网站构建不需要访问知识库或安装 Python。

重新导入时运行 `python scripts/import_blog.py "原稿目录"`。图片根据 `media.generated.json` 从 `media-parts` 校验还原。导入流程移除图片附加元数据，原图不改动。
