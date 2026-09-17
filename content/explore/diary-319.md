# 删除openSUSE后恢复Windows引导

今天把上周在实训电脑上安装的 openSUSE 系统删除了，在删除的过程中，由于只删了系统文件，没清理 EFI 系统分区里的引导文件，从而导致了开机失败。详细来说就是：开机时 UEFI 固件仍按原来的启动顺序去找 openSUSE 的 GRUB，但 GRUB 的配置文件（在原系统分区里）已被删除，于是 GRUB 找不到配置，卡在命令行界面。

完整的解决方法：
1. `ls` → 确认分区结构
2. `ls (hd0,gpt1)/` → 发现是 EFI 分区，里面有 `efi/` 文件夹
3. `chainloader /efi/Microsoft/Boot/bootmgfw.efi` → 加载 Windows 引导器
4. `boot` → 启动 Windows
