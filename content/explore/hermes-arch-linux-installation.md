今天突发奇想，既然Archlinux是从0开始安装系统，那么假如我在系统里部署一个Agent，是不是只需要AI来帮我执行各种麻烦的安装过程，我只需要指挥它就好了？那么说干就干。

第一步下载iso镜像文件
[archlinux-iso-2026.05.01安装包下载-开源镜像站-阿里云](https://mirrors.aliyun.com/archlinux/iso/2026.05.01/)
文件名：archlinux-x86_64.iso

用的idm下载，大概用了两分钟
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 1](/explore/assets/b7de8a449ccb8da175e9bbe7.webp)

初步设置
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 2](/explore/assets/4f3eb54bc9d254a4cf9fa419.webp)
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 3](/explore/assets/0477517bd4c04b8f6940ab13.webp)

这是进来的第一个界面，真的是纯黑框
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 4](/explore/assets/57e400f60a433ecfabe2399d.webp)

首先来ping一下，看看连没连上网，然后就可以直接安装Hermes了。
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 5](/explore/assets/b70ee71fd20a5fc89f916e15.webp)

但是在虚拟机里我们没法粘贴指令，所以需要先用一下ssh连接到我们本地的终端

先用ip addr show，获取一下ip
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 6](/explore/assets/5ee9fffa9c5171d828197067.webp)

接下来在自己的终端里输入ssh root@192.168.47.137
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 7](/explore/assets/bcbb823858e1c8c7b346ef7e.webp)

等等，这里漏了一步，还没设置密码呢，我说ssh怎么连接不上
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 8](/explore/assets/e88e401c55478df6ed01f904.webp)

ok呀，现在就成功了，我可以直接在自己的终端里控制archlinux了
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 9](/explore/assets/477292108e0611fc1f7b2425.webp)

接下来启动代理，运行安装命令
```
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```
能进入安装界面，说明咱们的想法已经基本得到验证了
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 10](/explore/assets/b55e7ff2f041cf6e8bce8148.webp)

坏了停止了，还需要我们手动安装git
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 11](/explore/assets/8656e05aab41acaedb42611e.webp)

结果安装git还报错了，问了一下ai
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 12](/explore/assets/7e1d18bcecac2df52385dbea.webp)

这下git安装成功了
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 13](/explore/assets/865a7a5c34e202a92bf16a52.webp)

再次回到hermes的安装，遭到严重报错
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 14](/explore/assets/ce1adbe61a58fa5bf85f6a3b.webp)

发给ai之后，它告诉我磁盘空间满了
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 15](/explore/assets/d1daa815366df75735f132f5.webp)

还真是，cowspace和 airootfs 都满了
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 16](/explore/assets/5f6ccd64fe9c79b3950aba89.webp)

接下来扩容

在系统启动的时候狂按e，会进入到grub界面
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 17](/explore/assets/0054505ecc7b017385f9f1fe.webp)

然后点击tab键进行编辑
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 18](/explore/assets/0df4d17714340f9b484564ac.webp)

按空格，补上下面这行
cow_spacesize=4G
然后按enter进入系统
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 19](/explore/assets/55824d4194aba0f5d772bf0f.webp)

ai牛逼，扩容成功
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 20](/explore/assets/5b8b5af1cbd37985a3e5b2ef.webp)

继续ssh连接，然后再次安装hermes

这时候我发现了一个奇怪的问题，我再次进入系统的时候，不仅passwd需要重新设置，我上次安装的git也没了，都需要再重新操作一遍，可恶。

ok,重新鼓捣了一遍，猜猜我这次能成功吗？
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 21](/explore/assets/d8b2d801bb2c8558fd62e4cf.webp)

对了，ai是这么解释原因的
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 22](/explore/assets/884fab0e13c28c23ac621cbc.webp)

那么目前虽然没有出现什么报错，但是这个安装速度真的一言难尽
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 23](/explore/assets/d2c0a3230ee39c6a1d808364.webp)

忍不了，直接国内镜像
```
curl -fsSL https://res1.hermesagent.org.cn/install.sh | bash
```
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 24](/explore/assets/2584a71231c48c713e1bd52e.webp)

牛逼，直接几秒钟就安装完成了
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 25](/explore/assets/e9d67b954cf464b86b32fcd9.webp)

后面就是正常的安装过程了

接上了一个小米的api
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 26](/explore/assets/4657a024dcab9e8b0401bbc3.webp)

ok，安装成功
输入下面这个命令，可以重新加载当前 Shell 的配置文件
```
source ~/.zshrc
```

然后输入hermes命令，启动它。但是这里不知道为什么，我输完之后就卡住了。
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 27](/explore/assets/9ef3ca244c94fa31e03003e7.webp)

ok，问题再次解决，原来是因为我把代理的tun给关了，后台无法正常下载文件，把tun打开就可以正常下载了。
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 28](/explore/assets/7b21d2c061e6f18a52e8b7d2.webp)

下面是见证奇迹的时刻，金色传说啊！我终于成功了！
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 29](/explore/assets/c892e765719acfe7dd425f07.webp)

现在我要让它介绍一下我的江山
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 30](/explore/assets/06281daf1d52444ad713d1be.webp)

爽！！！

看哭了，为了新入新系统一定要失去你吗😭
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 31](/explore/assets/70a5662c8faa115f7e0eb438.webp)

好在有解决办法！
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 32](/explore/assets/b2dc962a1cce940722c7812b.webp)

重启之后hermes还在，成功达成happy ending
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 33](/explore/assets/cf356f43659836501cd6924e.webp)

最后再补一张，由于每次遇到hermes敲不了的终端命令，需要我退出之后手动敲，敲完之后再回来之前的聊天对话框就不在了，需要hermes手动拉取之前的历史记录。然后这张图里主要是hermes帮我开了哪些荒：
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 34](/explore/assets/585e57fd116a941bafcf4733.webp)

至此，本次折腾圆满结束。


补充：

进入新系统的hermes并没有携带在live系统时候的记忆，不知道如果我要求的话，能不能添加进来。这个小米模型的配置就不是我手动操作了，是live环境里的hermes帮忙配好的，我用root用户直接输入hermes就正常启动了。
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 35](/explore/assets/f7ce533b0ab0c87cc6e288ff.webp)

root和user不共用一套hermes配置，所以我一开始用root能进入hermes，但用user就不可以。
![用 Hermes 指挥 Arch Linux 系统的安装 · 步骤截图 36](/explore/assets/5eac5c93f5e69708986f4a23.webp)