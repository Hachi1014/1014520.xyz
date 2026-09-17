[ArchLinux Vmware安装指北](https://www.cnblogs.com/Thato/p/18311683)

第一步下载系统的iso文件

第二步新建虚拟机，选好iso位置

进来之后没有系统，只有一个黑框
![Arch Linux安装过程 · 步骤截图 1](/explore/assets/7570934611ad6bee9db29a19.webp)

这时候只需要三个操作：
1，ping baidu.com 看看有没有网
2，passwd 因为一会需要用宿主机ssh连接
3，ip addr 查看虚拟机ip

操作完之后直接用宿主机的cmd的ssh连接，因为可以复制代码

连接完ssh之后，就跟着教程操作就行了，最好是多用手敲敲代码，因为你不敲代码，你就不知道你的打字水平有多差，我一开始输入的命令，十个得有五个错误的，基本上都是手误，比如etc打成ect，btrfs打成brtfs。。。真的需要这么个熟悉代码的过程，毕竟看得多了眼睛也会尖，有时候一眼就能看出来哪里错了

操作ing，后面需要跟着教程配置一堆东西，什么Network Manager啊，设置时区啊，分盘啊，挂载啊
![Arch Linux安装过程 · 步骤截图 2](/explore/assets/537c9c193512a50933a284b7.webp)


这里遇到了一个问题，因为镜像源配置错了，所有下载速度特别特别慢，然后这时候我问了ai，用ctrl+c取消了下载，然后再回到镜像源配置界面重新配置了一次
![Arch Linux安装过程 · 步骤截图 3](/explore/assets/ac3845e054268a0f93a27635.webp)
![Arch Linux安装过程 · 步骤截图 4](/explore/assets/728bd879128a420da5c2b68d.webp)

经过我的不懈努力之下，终于安装完了arch linux，但是这才刚刚开始，因为现在还没有桌面系统
![Arch Linux安装过程 · 步骤截图 5](/explore/assets/cbec94d28e071f5f1767a73d.webp)

这里我想安装deepin的桌面，但是很可惜一直报错，即使是gemini也束手无策
![Arch Linux安装过程 · 步骤截图 6](/explore/assets/6923ee61e384c8245417f0f0.webp)

目前的未解之谜
![Arch Linux安装过程 · 步骤截图 7](/explore/assets/5fe074f74e3434bec0063be3.webp)

接着我换了一个桌面，这次我选择了KDE，终于也是成功了
![Arch Linux安装过程 · 步骤截图 8](/explore/assets/bfd935891b7ff4156ba802c0.webp)
![Arch Linux安装过程 · 步骤截图 9](/explore/assets/a3ab6f584f163109e1359c90.webp)