今天心血来潮想用自己电脑当一个服务器，然后通过内网穿透部署我的个人网站。
最开始是想买一个便宜服务器当NAS的，AI给我推荐的方案是Windows + 虚拟机 + 飞牛OS(不过我现在都不知道为什么不直接拿电脑本身的系统整)。

第一步去飞牛官网下载iso镜像文件。
https://www.fnnas.com

第二步打开VMware，新建虚拟机，系统选择“Other Linux 5.x kernel 64-bit”（fnOS基于Linux内核）

![飞牛OS初体验 · 步骤截图 1](/explore/assets/42dd80bb425d5d53edfad269.webp)

系统安装好之后，给我自动开放了一个端口，这样就能直接在本地浏览器访问这个系统了。
![飞牛OS初体验 · 步骤截图 2](/explore/assets/b2e91fe58c3e3108f29327e2.webp)
![飞牛OS初体验 · 步骤截图 3](/explore/assets/4b646e684213a416d0a06e4d.webp)

这两边好像是对应的。
![飞牛OS初体验 · 步骤截图 4](/explore/assets/cd74bab7ab30e87c69979374.webp)

这里遇到了第一个问题，由于我给虚拟机分配的存储太小了，导致创建不了存储空 间。
![飞牛OS初体验 · 步骤截图 5](/explore/assets/8df427a76d4be0403a35fb86.webp)

然后我就开始研究内网穿透了，毕竟最后得把内容映射到公网， 不然别人访问不了。
![飞牛OS初体验 · 步骤截图 6](/explore/assets/da6d042ae42c487a627a2064.webp)
![飞牛OS初体验 · 步骤截图 7](/explore/assets/be752647cd2e6b832cb98087.webp)

整个过程其实也是很简单，这是我第一次内网穿透成功。
![飞牛OS初体验 · 步骤截图 8](/explore/assets/3ddb76e068a1bba5821f05c2.webp)
![飞牛OS初体验 · 步骤截图 9](/explore/assets/b296e2660bea87d5428abb17.jpg)

