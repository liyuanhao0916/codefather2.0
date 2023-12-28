# Ubuntu

## 软件

### Chrome
```sh
## 下载 chrome 包
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
## 下载  gdebi 工具自动安装 deb 包和依赖关系
sudo apt install gdebi
## 您报错  也许需要运行“apt --fix-broken install”来修正上面的错误。
## sudo apt --fix-broken install

## 下载依赖
sudo gdebi google-chrome-stable_current_amd64.deb 


```


### 搜狗输入法(失败)

官方文档 https://shurufa.sogou.com/linux/guide

```sh
### 在设置-- 语言--语言支持 中， 检查键盘输入系统 是否有 fcitx 或 fcitx4,没有就下载， 有fcitx5不行，需要卸载
sudo apt search fcitx | grep 安装  ## 含有 fcitx 的都是要删除的
sudo apt remove *fcitx5*
sudo apt-get install fcitx  ## 安装 fcitx ， 其实安装的是 fcitx4

### 设置fcitx开机自启动
sudo cp /usr/share/applications/fcitx.desktop /etc/xdg/autostart/

### 官网下载后，执行安装
sudo dpkg -i sogoupinyin_4.2.1.145_amd64.deb
### 如果安装过程中提示缺少相关依赖，则执行如下命令解决：
sudo apt -f install

### 卸载系统ibus输入法框架
sudo apt purge ibus

### 安装输入法依赖 ， 一般已经自动安装了
sudo apt install libqt5qml5 libqt5quick5 libqt5quickwidgets5 qml-module-qtquick2
sudo apt install libgsettings-qt1
```
### fcitx5

```sh
sudo apt install fcitx5                 ## 输入法主体框架
sudo apt install fcitx5-chinese-addons  ## 中文输入法引擎
sudo apt install fcitx5-frontend-*      ## 图形界面的支持组件
sudo apt install kde-config-fcitx5      ## 配置工具

im-config
```

离线词库：下载dict后缀的文件，复制到~/.local/share/fcitx5/pinyin/dictionaries
- 萌娘百科词库 https://github.com/outloudvi/mw2fcitx
- 维基百科词库 https://github.com/felixonmars/fcitx5-pinyin-zhwiki

安装主题 
```sh
git clone https://github.com/tonyfettes/fcitx5-nord.git
cp -r Nord-Dark/ Nord-Light/ ~/.local/share/fcitx5/themes/
```


## 常识

配置某一用户的环境变量 编辑 用户文件夹下 .bashrc 文件
配置所有用户的环境变量 编辑 /etc/profile

编辑后 执行 source 文件名  重新加载配置

## 技巧

### 关盖不挂起

如果你查看文件 /etc/systemd/logind.conf 的内容，你将看到三种不同类型的笔记本电脑合盖默认设置：

- HandleLidSwitchExternalPower=suspend：当笔记本电脑插入电源插座时，合盖挂起
- HandleLidSwitch=suspend：当笔记本电脑使用电池供电时，合盖挂起
- HandleLidSwitchDocked=ignore：当笔记本电脑连接到扩展坞时，合盖忽略

如你所见，如果合上盖子，笔记本电脑将挂起，无论它是否连接到电源。而连接扩展坞忽略合盖。

如果需要，你可以根据自己的喜好将这些参数的值更改为其中之一：

- suspend：合盖时挂起
- lock：合盖时锁定
- ignore：什么都不做
- poweroff：关机
- hibernate：合盖时休眠
重启服务`service systemd-logind restart`
登录不了用户，就重启电脑


