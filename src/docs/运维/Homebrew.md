```sh
#更新Homebrew
brew update

brew outdated						#列出可更新包(formula)

brew search $FORMULA		#查包
brew install $FORMULA		#安装包
brew list								#列出所有包
brew remove $FORMULA		#删除包
brew deps --installed --tree # 查看已安装的包的依赖，树形显示

brew upgrade             # 更新所有的包
brew upgrade $FORMULA    # 更新指定的包

brew cleanup             # 清理所有包的旧版本
brew cleanup $FORMULA    # 清理指定包的旧版本
brew cleanup -n          # 查看可清理的旧版本包，不执行实际操作

#锁定不想更新的包
brew pin $FORMULA      # 锁定某个包
brew unpin $FORMULA    # 取消锁定

brew info $FORMULA    # 显示某个包的信息
brew info             # 显示安装了包数量，文件数量，和总占用空间

```

