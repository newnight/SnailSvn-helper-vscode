# SnailSVN Helper
因为[原版](https://marketplace.visualstudio.com/items?itemName=Zlorn.snail-svn-helper)支持的命令比较少,所以增加了一些其他需要的命令

这是一个基于 [SnailSVN](https://apps.apple.com/cn/app/snailsvn/id847259925) 或 [SnailSVNLite](https://apps.apple.com/cn/app/snailsvn/id1063090543) 的 VSCode 右键快捷菜单扩展。



## 使用方法
在文件内容中右键，或者在资源管理器中右键，都可以看到此快捷菜单。保留了常用的update 和 commit ,其他 命令放入二级菜单.


## 注意
该扩展只支持 Mac 系统，并且需要已经安装了 [SnailSVN](https://apps.apple.com/cn/app/snailsvn/id847259925) 或 [SnailSVNLite](https://apps.apple.com/cn/app/snailsvn/id1063090543) 才会生效。  

## changelog
- 1.0.0 添加二级菜单,支持 更多的命令. 暂时只在菜单中支持以下命令:
  1. update
  2. commit
  3. blame
  4. delete
  5. add
  6. log
  7. unlock
  8. revert

## Issues
1. 目前资源管理器中无法显示二级菜单,只支持 update,commit