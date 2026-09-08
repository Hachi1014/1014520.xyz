2026/2/10
虚拟机+Archlinux

第一步安装 Node.js 22+
```
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
$ source ~/.bashrc
$ nvm install 22
```

第二步安装git
```
$ sudo pacman -S git
```

第三步安装Openclaw(==用海外节点加速，否则会安装失败==)
```
$ curl -fsSL https://openclaw.ai/install.sh | bash
```

跟着步骤一步步来就行，但是由于全是英文，我根本看不懂，也不知道该怎么选，稀里糊涂的就过来了
![OpenClaw & Hermes · 步骤截图 1](/explore/assets/d1ec98605c05d855421da7d2.webp)

这是今天的最终成果，整了半天，实在连接不上飞书
![OpenClaw & Hermes · 步骤截图 2](/explore/assets/d91481f532f4c078ceb3ad8f.webp)

2026/4/19——续
Openclaw已经爆火这么久了，但是我迟迟没有体验，有两个原因吧：
1.它本身就不够成熟，属于是一个银样镴枪头，中看不中用
2.太费token了，我没钱养它

现在龙虾的热度已经过去了，我再接着来折腾吧，这次我的目标是能跑起来就行

2026/5/17——再续
上次忘了折腾了，今天势必拿下。看了罗福莉的访谈之后想安OpenClaw的欲望达到了顶峰。

代理也开了，就是不知道为什么，用官网上的指令下载总是卡住
![OpenClaw & Hermes · 步骤截图 3](/explore/assets/0ba88e7ae63881598b82d97f.webp)

最后用的pnpm终于成功了
![OpenClaw & Hermes · 步骤截图 4](/explore/assets/0a5dd9c06cf2947b619f4b02.webp)

久违了，控制面板
![OpenClaw & Hermes · 步骤截图 5](/explore/assets/4089d99d38b80de9d71d2af0.webp)

配置好Deepseek的API之后，开启了我和龙虾的第一句话
![OpenClaw & Hermes · 步骤截图 6](/explore/assets/371add45ce043c20c7bcc47b.webp)

接着连接QQ
![OpenClaw & Hermes · 步骤截图 7](/explore/assets/58de83ad798d8a8e7415e702.webp)

成功配置
![OpenClaw & Hermes · 步骤截图 8](/explore/assets/efd5fdb6421db64f8386f681.webp)

第一个报错，解决办法是重新配置了一下config文件
![OpenClaw & Hermes · 步骤截图 9](/explore/assets/6ed4dc0ca1e4fdd239d3849c.webp)
![OpenClaw & Hermes · 步骤截图 10](/explore/assets/1d83ce0bcbb1751e755710d1.webp)
![OpenClaw & Hermes · 步骤截图 11](/explore/assets/ad9cda49a022f250a8f11111.webp)
![OpenClaw & Hermes · 步骤截图 12](/explore/assets/927baf29efa03aa2c6ed0f64.webp)
![OpenClaw & Hermes · 步骤截图 13](/explore/assets/0231fc832cf9c185ea83a8f1.webp)
![OpenClaw & Hermes · 步骤截图 14](/explore/assets/d42888f6db25ce0f4c1c155b.jpg)

总结一下使用感受：鸡肋，没有实际应用场景


隔天趁着热乎劲，又来折腾一下Hermes：
这次我直接用的官方安装命令，之前一直觉得太慢，后面我发现，只要开TUN就行了。
依旧配置Deepseek的API，10块钱的余额我都用两年多了都没用完。
![OpenClaw & Hermes · 步骤截图 15](/explore/assets/c1a6429b9808fa76a4c5d765.webp)

这里安装完之后，直接输入hermes命令还没有反应。
需要用下面这个代码重新加载shell：`source ~/.bashrc`
![OpenClaw & Hermes · 步骤截图 16](/explore/assets/fb41b18d290d421e9c295402.webp)

OK呀，也是成功进入Hermes了。
![OpenClaw & Hermes · 步骤截图 17](/explore/assets/9d005904c8550e58af91c0bc.webp)

在配置qq bot的时候我遇到了一个问题，就是每次配置的时候总是跳过，我明明记得我是选中了qq bot的，结果我问了ai发现，还需要用空格进行选中的。ai真的越来越聪明了。
![OpenClaw & Hermes · 步骤截图 18](/explore/assets/87c14817056ea873c250a362.jpg)