![](assets/ClaudeCode超详细入门教程/file-20260415183140814.png)
# 前言
ClaudeCode(简称CC)，它是Anthropic公司发布的一款AI编程助手，也就是现在常说的Vibe Coding工具，通过自然语言让AI自动生成、修改、调试代码。
CC是一个住在电脑命令行的Agent，可以自由访问我们的本地文件，直接对文件进行修改。而用网页端AI写代码，需要我们自己把代码复制下来去本地运行，出现报错还得再把错误发给AI，CC这类工具可以说大大提高了编程的效率。
它目前有桌面版和CLI版(Command-Line Interface,也就是命令行版)，这里我们主要来介绍更常用的CLI版。
另外Anthropic这家公司对国内用户非常不友好，想使用CC对网络配置是有一定要求的，必须要有非国区的节点。
# 安装
方法一：官方版安装（需要开启代理）
https://code.claude.com/docs/zh-CN/overview#native-install-recommended
![](assets/ClaudeCode超详细入门教程/file-20260415145838038.png)
这里我以Window PowerShell为例：
输入指令
`irm https://claude.ai/install.ps1 | iex`
![](assets/ClaudeCode超详细入门教程/file-20260415145931640.png)

如果不开代理的话会这样
![](assets/ClaudeCode超详细入门教程/file-20260415151851388.png)

![](assets/ClaudeCode超详细入门教程/file-20260415150236487.png)
这里安装成功之后它提示我没有设置环境变量，没设置的话会显示：
*claude : 无法将“claude”项识别为 cmdlet、函数、脚本文件或可运行程序的名称。请检查名称的拼写，如果包括路径，请确保路径 正确，然后再试一次*。

我直接让AI帮我生成了配置环境变量的指令，之后把它粘贴到PowerShell里面就好了
![](assets/ClaudeCode超详细入门教程/file-20260415150920095.png)
这样就能正常查看到版本了，也就算正式安装成功了
![](assets/ClaudeCode超详细入门教程/file-20260415151556663.png)

方法二：使用npm安装
首先我们需要确保电脑上有Node.js
下载地址：https://nodejs.org/zh-cn/download
![](assets/ClaudeCode超详细入门教程/file-20260415152745827.png)

下载完之后我们来验证一下是否安装成功
![](assets/ClaudeCode超详细入门教程/file-20260415152839618.png)

然后我们可以不使用代理，直接用国内镜像来安装，这样速度会更快一点
`npm install -g @anthropic-ai/claude-code --registry=https://registry.npmmirror.com`
![](assets/ClaudeCode超详细入门教程/file-20260415153534857.png)

OK至此我们就已经成功安装上claudecode了。

# 使用
这里我用VSCode新建了一个文件夹，然后在终端里面输入claude，这时候我们发现虽然开启了代理，但依然显示无法连接到网络。
![](assets/ClaudeCode超详细入门教程/file-20260415160508606.png)
解决方法是使用支持TUN(虚拟网卡)功能的代理软件，开启TUN模式之后，软件就可以正常使用了。
![](assets/ClaudeCode超详细入门教程/file-20260415161104525.png)
第一步它让我们选一个主题，然后是选择登录方式。
1.登录你的claude账号，不过你得充值它的套餐
2.使用Anthropic的官方api
3.使用官方支持的第三方平台，目前只有图中写的这三家
![](assets/ClaudeCode超详细入门教程/file-20260415161631514.png)

那如果我们想使用国内AI模型的api呢？
答案是使用三方开源工具——CC Swich
https://github.com/farion1231/cc-switch
![](assets/ClaudeCode超详细入门教程/file-20260415162309363.png)

我拿MiniMax的api举例，它家新用户实名认证送15元免费余额。
![](assets/ClaudeCode超详细入门教程/file-20260415162733952.png)

第一步复制密钥
![](assets/ClaudeCode超详细入门教程/file-20260415163013333.png)

第二步打开CC Swich，选择MiniMax，把密钥粘贴，然后点右下角的添加就ok了。
![](assets/ClaudeCode超详细入门教程/file-20260415163111521.png)

添加完成后我们再重新打开终端，输入claude，这时候就没有登录按钮了
![](assets/ClaudeCode超详细入门教程/file-20260415163409312.png)
![](assets/ClaudeCode超详细入门教程/file-20260415163500995.png)

到这里我们就可以正常使用了CC了
![](assets/ClaudeCode超详细入门教程/file-20260415163811994.png)
然后我让它帮我生成了一个极简主义的博客
![](assets/ClaudeCode超详细入门教程/file-20260415164425451.png)
![](assets/ClaudeCode超详细入门教程/file-20260415164356392.png)
![](assets/ClaudeCode超详细入门教程/file-20260415164550862.png)

# Skills
我理解的skills就是，它是一个更详细更有针对性的一套系统提示词。就比如最近很火的把同事蒸馏成skill，本质就是把他的工作内容和细节转化成了一套提示词。
接下来演示一下在CC里使用skills的具体方法：
首先我们在everything里搜索.claude，找到CC的根目录，在里面创建一个skills的文件夹，之后把网上的skills下载到这里就可以使用了。
![](assets/ClaudeCode超详细入门教程/file-20260415171253592.png)

这里我找到了一个马斯克的skill
![](assets/ClaudeCode超详细入门教程/file-20260415174122829.png)
然后可能是我的网络问题，克隆仓库总是出错，我就直接手动下载了。直接下载整个项目的压缩包，然后解压拖进我们的skills文件夹即可。
![](assets/ClaudeCode超详细入门教程/file-20260415174300720.png)
![](assets/ClaudeCode超详细入门教程/file-20260415174409010.png)
然后我们在CC里输入”/+skill名称“就可以找到我们想使用的skill了，按tab键就可以一键选中
![](assets/ClaudeCode超详细入门教程/file-20260415174528177.png)

还别说，真的挺有意思的
![](assets/ClaudeCode超详细入门教程/file-20260415175114459.png)


OK，本期教程就到这里了，由于我个人没有编程方面的需求，所以内容也是很基础，我的使用需求很简单，它对我来说更像是一个玩具，主要用来满足我这一颗喜欢折腾的心。
如果大家感觉有帮助的话可以点个赞支持一下，这里是博阳，我们下期再见。