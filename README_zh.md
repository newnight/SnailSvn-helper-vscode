[中文](./README_zh.md) | [English](./README.md)
# SnailSVN Helper
因为[原版](https://marketplace.visualstudio.com/items?itemName=Zlorn.snail-svn-helper)支持的命令比较少,所以增加了一些其他需要的命令

这是一个基于 [SnailSVN](https://apps.apple.com/cn/app/snailsvn/id847259925) 或 [SnailSVNLite](https://apps.apple.com/cn/app/snailsvn/id1063090543) 的 VSCode 右键快捷菜单扩展。



## 使用方法
在文件内容中右键，或者在资源管理器中右键，都可以看到此快捷菜单。保留了常用的update 和 commit ,其他 命令放入二级菜单.

## l10n
1. 直接修改`SnailSvn.localizeSetting` 对应的 Value值, 可以替换成自己喜欢的 emoji 表情.
2. 改完对应的菜单项翻译后,需要右键触发任一 SnailSVN 命令 或者直接触发`Snailsvn resetLocalize`命令, 然后重启Vscode, 使修改生效.


## 注意
该扩展只支持 Mac 系统，并且需要已经安装了 [SnailSVN](https://apps.apple.com/cn/app/snailsvn/id847259925) 或 [SnailSVNLite](https://apps.apple.com/cn/app/snailsvn/id1063090543) 才会生效。  
