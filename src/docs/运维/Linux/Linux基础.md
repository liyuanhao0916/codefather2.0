---
isOriginal: true
category: 
    - 运维
    - Linux
# tag: 
#   - 变量

---

# Linux 基础

## 安装

* 手动分区，**标准分区**，添加挂载点

  *   /boot  1G       文件系统：ext4
  *   /           45G    文件系统：ext4
  *   swap   4G      文件系统：swap

* 禁用KDUMP：系统崩溃时的备份空间

* 网络与主机名：可以配置一些系统的网络，但是不全

* 说明:学习期间这里选择了桌面化,正常公司开发选择最小安装;如果是选择了最小安装需要下载:

  net-tool:工具包集合,包含ifconfig等命令

  切换到root用户 su root 输入密码

  ```sh
  yum install -y net-tools
  ```

  在下载vim编辑器:

  ```sh
  yum install -y vim
  ```

  下载红帽提供的软件包

  ```sh
  yum install -y epel-release
  ```

## 网络

* 网络模式

  *   VM 桥接模式：虚拟网络适配器与主机的物理网络适配器进行交接，直接通过主机的物理网络适配器访问外网，相当于一台独立计算机访问网络，会占用局域网的一个ip

  *   VMware NAT模式：（Network Address Translation网络地址转换），VMware会在主机上建立单独的专用网络，用以在主机和虚拟机之间相互通信，访问网络时，先和主机通信，间接访问外网，**依托vmnet8**

  *   VMware 仅主机模式：虚拟机只能访问内网，要想访问外网，需要在主机上安装路由或代理，在一台主机上（相同的仅主机模式网络），多个虚拟机设置仅主机模式，他们之间可以互相通信，不同主机上，要想相互通信需要设置路由器，**依托vmnet1**

* ip地址

  * IP地址 = 网络地址 + 主机地址，又称网络号和主机号构成。

    *   A类：以0开头，第1字节为网络地址+后3个字节主机地址组成，地址范围0.0.0.0\~127.255.255.255。可用的A类网络有126个网络，每个网络能容纳1亿多个主机。
    *   B类：以10开头，前2字节为网络地址+后2个字节主机地址组成，地址范围128.0.0.0\~191.255.255.255。可用的B类网络有16382个，每个网络能容纳6万多个主机 。
    *   C类：以110开头，前3字节为网络地址+后1个字节主机地址组成，地址范围192.0.0.0\~223.255.255.255。可用的C类网络可达209万余个，每个网络能容纳254个主机。
    *   D类：以1110开头，地址范围是224.0.0.0\~239.255.255.255，D类地址作为组播地址（一对多的通信）。
    *   E类：以11110开始，地址范围是240.0.0.0\~255.255.255.255，为保留地址，实际中并不是有很多的使用。
    *   注：只有A,B,C有网络号和主机号之分，D类地址和E类地址没有划分网络号和主机号。A类地址第一组数字为1\~126，数字0和127不作为A类地址

  * 全1地址（255.255.255.255）

    该IP地址指的是受限的广播地址。受限广播地址与一般广播地址（直接广播地址）的区别在于，受限广播地址只能用于本地网络，路由器不会转发以受限广播地址为目的地址的分组；一般广播地址既可在本地广播，也可跨网段广播。例如：主机192.168.1.1/30上的直接广播数据包后，另外一个网段192.168.1.5/30也能收到该数据报；若发送受限广播数据报，则不能收到。

    注：一般的广播地址（直接广播地址）能够通过某些路由器（当然不是所有的路由器），而受限的广播地址不能通过路由器。

  * 全0地址（0.0.0.0）

    常用于寻找自己的IP地址，例如在我们的RARP，BOOTP和DHCP协议中，若某个未知IP地址的无盘机想要知道自己的IP地址，它就以255.255.255.255为目的地址，向本地范围（具体而言是被各个路由器屏蔽的范围内）的服务器发送IP请求分组。

  * 回环地址

    127.0.0.0/8被用作回环地址，回环地址表示本机的地址，常用于对本机的测试，用的最多的是127.0.0.1。

  * A、B、C类私有地址

    私有地址(private address)也叫专用地址，它们不会在全球使用，只具有本地意义。

    *   A类私有地址：10.0.0.0/8，范围是：10.0.0.0\~10.255.255.255

    *   B类私有地址：172.16.0.0/12，范围是：172.16.0.0\~172.31.255.255

    *   C类私有地址：192.168.0.0/16，范围是：192.168.0.0\~192.168.255.255

* 子网掩码

  * 作用

    *   **用于标记本地网络的号段，即网段**
    *   **将一个大的IP网络划分为若干小的子网络**

  * 子网掩码 32 位与IP 地址 32 位相对应，IP 地址如果某位是网络地址，则子网掩码为1，否则为0。

  * 11111111.11111111.11111111.00000000网络号的长度为 24（前三个字节），主机号长度为 8 （最后一个字节）

  * 不能单独存在，和ip在一起才有意义

  * 子网中只有1是**连续**的，才是子网掩码

  * 表示

    *   点分十进制表示法 11111111.11111111.11111111.00000000 即 255.255.255.0
    *   **CIDR斜线记法**：IP地址/n
        *   n 为 1 到 32 的数字，表示子网掩码中网络号的长度，通过 n 的个数确定子网的主机数=2^(32-n)-2（减去 2 的原因：主机位全为0时表示本网络的网络地址，主机位全为1时表示本网络的广播地址，这是两个特殊地址，不能被用户使用）。
        *   192.168.1.100/24 的子网掩码是11111111.11111111.11111111.00000000即255.255.255.0

  * 分类

    * 默认子网掩码

      即未划分子网，对应的网络号的位都置 1 ，主机号都置 0 。

      未做子网划分的IP地址：网络号＋主机号

      A类网络缺省子网掩码： 255.0.0.0，用CIDR表示为/8

      B类网络缺省子网掩码： 255.255.0.0，用CIDR表示为/16

      C类网络缺省子网掩码： 255.255.255.0，用CIDR表示为/24

    * 自定义子网掩码

      将一个网络划分子网后，把原本的主机号位置的一部分给了子网号，余下的才是给了子网的主机号。其形式如下：

      做子网划分后的IP地址：网络号＋子网号＋子网主机号

      如：192.168.1.100/25，其子网掩码表示：255.255.255.128

      意思就是将192.168.1.0这个网段的主机位的最高1位划分为了子网

  * 子网掩码与 IP 地址的关系

    > 通过观察两个 IP 地址与子网掩码做与运算的结果是否相同，可以得出两个 IP地址是否在一个网络中的结论。所以子网掩码可以用来判断任意两台主机的IP地址是否属于同一网络，就是拿双方主机的IP地址和自己主机的子网掩码做与运算，如结果为同一网络，就可以直接通信。

* 网关

  *   IP地址是以**网络号**和**主机号**来标示网络上的主机的。

  *   **我们把网络号相同的主机称之为本地网络，网络号不相同的主机称之为远程网络主机。**

  *   **本地网络中的主机可以直接相互通信，远程网络中的主机要相互通信必须通过本地网关（Gateway）来传递转发数据。**

  *   **不在本地网络中，就把数据包转发给它自己的网关，再由网关转发给网络 B 的网关，网络 B 的网关再转发给网络 B 的某个主机**
      *   只有设置好网关的 IP 地址，TCP/IP 协议才能实现不同网络之间的相互通信
      *   网关的 IP 地址是具有路由功能的设备的 IP 地址，具有路由功能的设备最典型的就是路由器
      *   **路由器接口使用的IP地址就是网关的地址，它可以是本网段中任何一个地址，不过通常使用该网段的第一个可用的地址或最后一个可用的地址**，这是为了尽可能避免和本网段中的主机地址冲突。

  *   即网关设置为路由器的ip地址

## 虚拟机网络配置

* VMware偏好设置

  *   网络，添加vmnet2

  *   勾选允许访问外网（基于NAT，即vmnet8）

  *   勾选将Mac主机连接到该网络

  *   勾选通过DHCP“动态主机配置协议”  在该网络提供地址
      *   子网ip：与虚拟机配置中的ip网段保持一致
      *   子网掩码：默认，即255.255.255.0

* 虚拟机网络适配器设置

  *   勾选vmnet2

* 查主机DNS地址

  ```shell
  cat /etc/resolv.conf
  ```

      nameserver fe80::1%en0
      nameserver 192.168.1.1

* 配置虚拟机网络：

  ```shell
  vim /etc/sysconfig/network-scripts/ifcfg-ens33
  ```

  ```properties
  TYPE="Ethernet"   #网络类型（通常是  Ethemet） 
  PROXY_METHOD="none"
  BROWSER_ONLY="no"
  #修改，IP 的配置方法[none|static|bootp|dhcp]（引导时不使用协议|静态分配IP|BOOTP协议|DHCP协议）
  BOOTPROTO="static"  
  DEFROUTE="yes"
  IPV4_FAILURE_FATAL="no"
  IPV6INIT="yes"
  IPV6_AUTOCONF="yes"
  IPV6_DEFROUTE="yes"
  IPV6_FAILURE_FATAL="no"
  IPV6_ADDR_GEN_MODE="stable-privacy"
  NAME="ens33"
  UUID="e83804c1-3257-4584-81bb-660665ac22f6"  #随机  id 
  DEVICE="ens33"  #接口名（设备,网卡）
  #修改，系统启动的时候网络接口是否有效（yes/no） 
  ONBOOT="yes" 
  #IP地址，自定义
  IPADDR=192.168.10.100 
  #网关，与
  GATEWAY=192.168.10.2 
  #域名解析器，与主机一致
  DNS1=fe80::1%en0
  DNS2=192.168.1.1
  ```

* 配置运行的networking(检查vmnet2、vmnet8是否和虚拟机网络网段相同，vmnet1不要动（是仅主机模式）)，关闭vmnet8DHCP

  ```sh
  sudo vi /Library/Preferences/VMware\ Fusion/networking
  ```

  ```properties
  VERSION=1,0
  answer VNET_1_DHCP yes
  answer VNET_1_DHCP_CFG_HASH F9A2F6EBFA035FA88A0495E8AB7AA8CDED6C6BD2
  answer VNET_1_HOSTONLY_NETMASK 255.255.255.0
  answer VNET_1_HOSTONLY_SUBNET 172.16.1.0
  answer VNET_1_HOSTONLY_UUID 554D13E6-5756-4CBD-BC7A-092DC255F6F3
  answer VNET_1_VIRTUAL_ADAPTER yes
  answer VNET_2_DHCP yes
  answer VNET_2_DHCP_CFG_HASH 290B7E76B0E786CCDE36747A34D4D39741A4B40C
  answer VNET_2_HOSTONLY_NETMASK 255.255.255.0
  answer VNET_2_HOSTONLY_SUBNET 192.168.10.0
  answer VNET_2_HOSTONLY_UUID 99DEA4B4-A3E5-4C3E-8A35-736A33E1CF8A
  answer VNET_2_NAT yes
  answer VNET_2_NAT_PARAM_UDP_TIMEOUT 30
  answer VNET_2_VIRTUAL_ADAPTER yes
  #关闭
  answer VNET_8_DHCP no
  
  answer VNET_8_DHCP_CFG_HASH CBD1E467B474F4779F8339885953DCE45846FB81
  answer VNET_8_HOSTONLY_NETMASK 255.255.255.0
  answer VNET_8_HOSTONLY_SUBNET 192.168.10.0
  answer VNET_8_HOSTONLY_UUID EBCDFC12-3AB5-4C29-A731-413C4EDE7467
  answer VNET_8_NAT yes
  answer VNET_8_VIRTUAL_ADAPTER yes
  remove_answer VNET_2_DHCP_CFG_HASH
  answer VNET_2_DHCP_CFG_HASH F1AB5BE862601E5B3AF3D92A51F19ADADDB2B871
  "/Library/Preferences/VMware Fusion/networking" 24L, 1033B
  ```

* 配置主机NAT模式vmnet2网络：（检查vmnet2的ip是否和虚拟机网络网段相同）

  ```shell
  sudo vim /Library/Preferences/VMware\ Fusion/vmnet2/nat.conf
  ```

  ```properties
  # VMware NAT configuration file
  # Manual editing of this file is not recommended. Using UI is preferred.
  
  [host]
  
  # Use MacOS network virtualization API
  useMacosVmnetVirtApi = 1
  
  #网关地址：与虚拟机中系统的配置相同。   NAT gateway address
  ip = 192.168.10.2
  netmask = 255.255.255.0
  
  # VMnet device if not specified on command line
  device = vmnet2
  
  #省略
  ```

目前我的感觉，主机ping虚拟机，通过vmnet2（子网、网关与虚拟机字段相同）到vmnet8提供的NET

*   物理机能  ping  通虚拟机，但是虚拟机  ping  不通物理机,一般都是因为物理机的防火墙问题,把防火墙关闭就行
*   虚拟机能  Ping  通物理机,但是虚拟机  Ping 不通外网,一般都是因为  DNS 的设置有
    问题
*   虚 拟 机  Ping    [www.baidu.com](http://www.baidu.com)    显 示 域 名 未 知 等 信 息 , 一 般 查 看  GATEWAY  和  DNS  设置是否正确
*   如果以上全部设置完还是不行，需要关闭  NetworkManager  服务
    *   systemctl   stop   NetworkManager        关闭
    *   systemctl   disable   NetworkManager    禁用
*   如果检查发现    systemctl    status   network   有问题    需要检查  ifcfg-ens33

## 集群配置

* 修改主机名称

  ```sh
  vim /etc/hostname
  ```

  hadoop100

* 配置  Linux  克隆机主机名称映射  hosts  文件

  ```sh
  vim /etc/hosts
  ```

      192.168.10.100 hadoop100
      192.168.10.101 hadoop101
      192.168.10.102 hadoop102
      192.168.10.103 hadoop103
      192.168.10.104 hadoop104
      192.168.10.105 hadoop105
      192.168.10.106 hadoop106
      192.168.10.107 hadoop107
      192.168.10.108 hadoop108

* 重启克隆机

  ```sh
  reboot
  ```

* 修改  windows  的主机映射文件（hosts  文件）

  ```sh
  vim /etc/hosts
  ```

      192.168.10.100 hadoop100
      192.168.10.101 hadoop101
      192.168.10.102 hadoop102
      192.168.10.103 hadoop103
      192.168.10.104 hadoop104
      192.168.10.105 hadoop105
      192.168.10.106 hadoop106
      192.168.10.107 hadoop107
      192.168.10.108 hadoop108

​		window10，先拷贝出来，修改保存以后，再覆盖即可C:\Windows\System32\drivers\etc

* 没网就重新生成MAC地址

  * 克隆机选择虚拟机 -- 网络适配器 -- 高级 -- 生成MAC地址

  * 修改虚拟机网络配置

    ```sh
    vim /etc/sysconfig/network-scripts/ifcfg-ens33
    ```

    ```properties
    HWADDR=
    ```

  * 删除70-persistent-net.rules文件,此文件重启自动生成

    ```sh
    rm -rf /etc/udev/rules.d/70-persistent-net.rules
    ```

  * 重启

    ```sh
    reboot
    ```

## Linux目录结构

## 

> 一切皆文件

*   /bin 普通命令
*   /sbin 管理员命令
*   /home 普通用户主目录
*   /root 超级管理员主目录
*   /lib  动态资源共享库
*   /lost+found 一般为空，存放非法关机产生的文件
*   /etc 系统配置文件和子目录
*   /usr 应用程序文件目录，类似win的program files
*   /boot 启动核心文件
*   /proc 虚拟目录，系统内存映射，可以直接访问这个目录获取系统信息
*   /srv service的缩写，服务启动后需要提取的数据
*   /sys linux2.6内核的一个重大变化，安装了文件系统sysfs
*   /tmp 存放临时文件
*   **/dev 设备管理器，所有硬件存储为文件**
*   /media（Centos6） 把识别的U盘等挂载到这里
*   /run/media（Centos7） 把识别的U盘等挂载到这里
*   /mnt 临时挂载别的文件系统
*   /opt 用户安装软件到存放位置
*   /var 存放经常变的，经常修改的，如日志

## VI/VIM编辑器

> VI 是  Unix 操作系统和类  Unix 操作系统中最通用的文本编辑器。
>
> VIM 编 辑 器 是从  VI 发 展 出 来的 一 个 性 能 更 强 大的 文 本 编 辑 器 。可 以 主 动 的 以 字体颜色辨别语法的正确性，方便程序设计。VIM 与  VI 编辑器完全兼容。

一般模式（删除、复制、添加）

*   yy 复制一行
*   yw 复制一词
*   p 粘贴
*   u 撤销
*   x 剪切
*   dd 删除一行
*   dw 删除一词
*   ^ 行首
*   \$ 行尾
*   G 页尾
*   \*+G  到\*行

编辑模式（修改）

命令模式

*   ！强制
*   w 保存
*   q 退出
*   set nu 显示行号
*   set nonu 关闭行号
*   %s/old/new 替换内容

## 命令

### 网络配置

*   ifconfig
*   ping
*   vim /etc/sysconfig/network-scripts/ifcfg-ens33
*   Service network restart
*   hostname查看主机名
*   vim /etc/hostname 修改主机名
*   vim /etc/hosts 修改映射文件

### 系统管理

> 正在执行的叫 **进程**
>
> 一直存在，常驻内存的叫 **守护进程/服务**

* service服务管理（Centos6）

  *   service 服务名 start｜stop｜restart｜status
  *   cd  /etc/init.d        ls -al  查看服务，只有两个服务
      *   netconsole
      *   network
  *   chkconfig  查看所有服务自启配置
      *   chkconfig 服务名 off  关闭自启
      *   chkconfig 服务名 on
      *   chkconfig 服务名 --list 查看某服务自启状态

* systemctl（Centos7）

  *   systemctl start｜stop｜restart｜status 服务名
  *   cd  /usr/lib/systemd/system    ls -al 查看服务
      *   firewalld 防火墙
  *   systemctl list-unit-files 查看所有服务自启配置
      *   systemctl enable 服务名.service
      *   systemctl disable 服务名.service

* 系统运行级别

  > 开机 -- bios -- /boot -- init“初始化”进程 -- 运行级别 -- 运行对应服务

  *   Centos6
      *   0：停机
      *   1：单用户root登录，禁止远程登录
      *   2：多用户登录，无网络
      *   3：有网络
      *   4：保留级别
      *   5：图形化界面
      *   6：关闭重启
  *   Centos7
      *   multi-user.target      =3(多用户，有网络)
      *   graphical.target        =5(图形化界面)
  *   systemctl get-default   查看运行级别
  *   systemctl set-default \*.target. 修改运行级别

* 关机重启

  *   sync 内存同步到硬盘  --修改后不会马上存到硬盘，存到buffer，满了写入硬盘

  *   halt 停机

  *   poweroff 关机

  *   reboot 重启

  *   shutdown 1min后关机（先去同步了）

      *   shutdown now 马上关

      *   shutdown 2   2min后关

      *   shutdown -r   重启

      *   shutdown -H  停机

      *   shutdown -h  关机

### 帮助命令

*   man 命令
*   help 命令     shell内置命令
*   which 命令  查看别名/命令路径

### 文件目录

*   pwd 绝对路径
    *   \-P 真实路径

*   ls
    *   ls -a
    *   ls -l
    *   ls -al

*   cd 回到home目录

*   mkdir
    *   \-p 创建多层

*   rmdir
    *   \-p 删除多层空目录

*   touch
    *   vim 也可以创建文件，但是：q后会消失，：wq创建成功

*   cp  源文件 目录/文件
    *   \-r 复制整个文件夹
    *   \cp强制覆盖

*   rm 删除文件/文件夹
    *   \-r 删除目录所有内容
    *   \-f 强制不提示
    *   \-v 显示过程
    *   \-rf 强制删除所有不提示

*   mv 旧名 新名  重命名

*   mv 文件 目录  移动文件

*   **cat 文件   查看文件内容**
    *   \-n 显示行号

*   more 文件  分屏查看
    *   空格翻一页
    *   enter翻一行
    *   q离开
    *   f  下翻一屏
    *   b 上翻一屏
    *   \= 输出当前行号
    *   ：f 输出文件名和当前行号

*   **less 文件 比more强大的分屏查看**
    *   空格翻一页
    *   G结尾，g开头
    *   /\*   向下搜索\*   ，n：向下查找；N：向上查找
    *   ?\*   向上搜索\*   ，n：向上查找；N：向下查找

*   **echo “#####”  输出#####到控制台**
    *   \-e 支持转义
    *   \\\ 输出\\
    *   \n换行
    *   \t制表符

*   head 显示文件头部信息

*   tail 输出文件尾部信息
    *   \-f 跟踪更新实时监控，多用于日志

*   **>  重定向（覆盖或追加）**
    *   ls -l > 文件  列表内容写入文件（覆盖）
    *   ls -al >> 文件  列表内容追加到文件
    *   cat 文件1 > 文件2 文件1覆盖文件2
    *   echo “####” >> 文件

*   ln -s 原文件/目录 软链接名   快捷方式
    *   rm -rf 软链接名 删除
    *   rm -rf 软链接名\*\*/\*\* 删除真实文件/目录
    *   ln  原文件/目录 硬链接名  硬链接

*   history 已执行命令
    *   \-c 清除历史

### 时间日期

*   date 显示当前时间
    *   date +%Y 当前年
    *   date +%m 当前月
    *   date +%d 当前日
    *   **date +%s 时间戳**
    *   **date "+%Y-%m-%d %H:%M:%S"**
    *   date -d '1 days ago'
    *   date -d '-1 days ago'
    *   date -s ""  设置系统当前时间
    *   ntpdate同步时间
*   总结
    *   Y       2022“年”
    *   y       22“年”
    *   m     06“月”
    *   h      6月
    *   d      16“日”
    *   D      06/16/22
    *   H
    *   M
    *   S
    *   s       时间戳
*   cal 查看本月日历
    *   \-3  上月 本月 下月
    *   \-m 周一在最前
    *   cal 2007 查看2007年日历

### 用户管理

* useradd 用户名   添加用户

  *   useradd -g 组名 用户名

* userdel 用户  删除，但保存主目录

  *   userdel -r 用户  完全删除

* password 用户名  设置密码

* id 用户名  查看是否有

* cat /etc/passwd 查看有哪些用户

* su 用户           切换用户，只有权限，没有环境

  *   su -用户   切换用户，有环境变量

* whoami 显示自身用户名

  *   who am i 显示用户名和登录时间

* sudo

  * 设置普通用户有root权限

    * 修改配置文件 vim /etc/sudoers，加一行

          用户名   ALL=(ALL)     ALL

    * 采用  sudo 命令时，不需要输入密码

          用户名   ALL=(ALL)     NOPASSWD:ALL

* usermod -g 组名 用户名  修改用户

### 用户组管理

> 每个用户都有一个用户组，系统可以对一个用户组中的所有用户进行集中管理。不同
> Linux  系统对用户组的规定有所不同，
> 如Linux下的用户属于与它同名的用户组，这个用户组在创建用户时同时创建。
> 用户组的管理涉及用户组的添加、删除和修改。组的增加、删除和修改实际上就是对
> /etc/group文件的更新。

**一个用户可以在多个组，不同的组可以赋予不同权限**

**第一个普通用户在wheel组中，管理员组，不用编辑sudoers就可以执行sudo**

**sudoers中%后面的就是组名**

*   groupadd 组名
*   groupdel 组名
*   groupmod -n 新组名 老组名
*   cat /etc/group

### 文件权限

ll执行后，行首表示的就是文件权限

    权限           属主 属组 文件大小
    -rw-------. 1 root root 1696 6月  22 00:10 anaconda-ks.cfg
    -rw-r--r--. 1 root root 1817 6月  22 00:41 initial-setup-ks.cfg
    drwxr-xr-x. 2 root root 4096 6月  22 00:50 公共
    drwxr-xr-x. 2 root root 4096 6月  22 00:50 模板
    drwxr-xr-x. 2 root root 4096 6月  22 00:50 视频
    drwxr-xr-x. 2 root root 4096 6月  22 00:50 图片
    drwxr-xr-x. 2 root root 4096 6月  22 00:50 文档
    drwxr-xr-x. 2 root root 4096 6月  22 00:50 下载
    drwxr-xr-x. 2 root root 4096 6月  22 00:50 音乐
    drwxr-xr-x. 2 root root 4096 6月  22 00:50 桌面
          硬链接数/子目录数

!\[image-20220622153600437]\(/Users/liusisi/Library/Application Support/typora-user-images/image-20220622153600437.png)

*   0文件类型
    *   \-开头 文件
    *   d开头 目录
    *   l开头 链接
    *   c   字符设备文件
    *   b  块设备文件“硬盘”
*   u：123属主权限user
*   g：456属组权限group
*   o：789其他用户权限other
    *   作用到文件
        *   r读
        *   w改，不一定可删，取决于对文件目录是否有w权限
        *   x可以被系统执行
    *   作用到目录
        *   r可用ls查看
        *   w改，创建删除重命名
        *   x可进入目录
*   chmod    \[{ugoa}{+-=}{rwx}]  文件或目录
    *   u:所有者    g:所有组    o:其他人    a:所有人(u、g、o 的总和)
    *   chmod u+r
*   chmod    \[mode=421 ]    \[文件或目录]
    *   r=4  w=2  x=1                rwx=4+2+1=7
    *   把三个位二进制化
        *   111 = rwx = 7
        *   110 = rw-  = 6
        *   101 = r-x   = 5
        *   100 = r--    = 4
        *   011 = -wx  = 3
        *   010 = -w-   = 2
        *   001 = --x    = 1
        *   000 = ---     = 0
    *   chomd 777
    *   \-R 目录中所有都修改
*   chowm 用户 文件/目录    改属主
    *   \-R
*   chgrp 组    文件/目录    改属组

### 搜索查找

* find 【路径】 -name 名字   加引号支持通配符

* find 【路径】 -user 用户名

* find 【路径】 -size +10M    大于10M

* locate 快速定位文件路径

  > locate 指令利用事先建立的系统中所有文件名称及路径的 locate 数据库实现快速定位给定的文件。Locate 指令无需遍历整个文件系统，查询速 度较快。默认每天更新一次，为了保证 查询结果的准确度，管理员必须定期更新 locate 时刻

  *   **updatedb 更新locate数据库**
  *   **locate 文件名**

* which 命令 查看命令别名/路径

* whereis 命令 查看命令真实路径

* **grep 关键字 文件名       查找文件中某内容**

  *   \-n显示行号

* 命令 ｜ grep 文件名      过滤：查找命令执行后满足文件名的文件

  *   ｜管道，前面的结果作为参数，传给后面

* wc  可用于查词频

  *   wc 文件名                  行数 词数 字节 文件名
  *   grep 关键字 文件名 ｜ wc          关键字所在行数  行中的次数（不是词频） 行中的字节数

### 压缩解压

* gzip 文件

* gunzip 文件.gz

  > **只能压缩文件，不能压缩目录**
  >
  > **删除原文件**
  >
  > **只能单文件，多个文件产生多个压缩包**

* zip 压缩包名 要压缩的文件

  *   \-r 压缩目录

* unzip

  *   \-d 指定存放位置

* tar 压缩包名 要压缩的文件 可多个空格隔开/目录

  > **tar -zcvf  什么.tar.gz 文件1 文件2**
  >
  > **tar -zxvf  什么.tar.gz  解压到当前目录**
  >
  > **tar -zxvf  什么.tar.gz -C 目录  解压到指定目录**

  *   \-c 打包
  *   \-x 解压
  *   \-z 打包并压缩    生成.tar.gz
  *   \-C 解压到指定目录
  *   \-v 显示详细信息
  *   \-f 指定压缩包名 放在最后

### 磁盘管理

* yum install tree      安装tree

* du 文件/目录     查看磁盘占用大小

  *   \-h 方便阅读
  *   \-a 所有子目录和文件
  *   \-c 还显示总和
  *   \-s 只显示总和
  *   \--max-depth=？指定深度

* df -h     查看磁盘使用情况（包括内存--临时文件系统）

      文件系统        容量  已用  可用 已用   %  挂载点
      devtmpfs        2.0G     0  2.0G    0% /dev
      tmpfs           2.0G     0  2.0G    0% /dev/shm
      tmpfs           2.0G   13M  2.0G    1% /run
      tmpfs           2.0G     0  2.0G    0% /sys/fs/cgroup
      /dev/sda2        15G  4.3G  9.7G   31% /
      /dev/sda1       976M  139M  770M   16% /boot
      tmpfs           394M   12K  394M    1% /run/user/42
      tmpfs           394M     0  394M    0% /run/user/0

* free -h 查内存使用情况

* lsblk -f 查看块设备--硬盘

      NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
      sda      8:0    0   20G  0 disk 
      ├─sda1   8:1    0    1G  0 part /boot
      ├─sda2   8:2    0   15G  0 part /
      └─sda3   8:3    0    4G  0 part [SWAP]
      sr0     11:0    1  4.4G  0 rom     安装用的光驱

  硬盘的命名和硬盘类型有关

  *   SATA、SCSI --> sda、sdb...
      *   挂载点 (分区)   sda1...
  *   IDE --> hda、hdb...
  *   虚拟硬盘 --> vda...

* mount 挂载

  *   在虚拟机上建立CD链接

  *   建立挂载点 mkdir /mnt/cdrom
      *   mnt是专门用于挂载的目录
      *   cdrom光盘

  *   mount  /dev/cdrom /mnt/cdrom/
      *   \-t iso9660 挂载的类型，一般可自动识别 iso9660是光盘
      *   \-o 权限，默认只读 rw读写

  *   umount /mnt/cdrom 卸载

  *   设置开机自动挂载
      *   vim /etc/fstab
      *   添加文件名 挂载点 类型 开启状态     /dev/cdrom      /mnt/cdrom     iso9660    defaults

* fdisk硬盘分区

  *   fdisk -l 查看分区情况
  *   添加硬盘
      *   在虚拟机上 硬盘 -- 添加硬盘
      *   重启reboot
      *   查看lsblk、fdisk -l
      *   fdisk 硬盘名         fdisk /dev/sdb
      *   根据提示进行分区
      *   n分区   q不保存退出  w保存退出
      *   分区类型
          *   p 主分区primary  最多4个主分区
          *   e 扩展分区extended  超过4个会把最后一个主分区分出最多12个扩展分区
          *   即最多sdb1～sdb16
      *   分区大小，可默认最大
      *   mkfs -t xfs /dev/sdb1   格式化
          *   \-t xfs 格式化类型
      *   mount /dev/sdb1 /home/用户名    挂载
          *   在该用户中添加的文件都会放在新的硬盘
      *   umount /home/用户名  卸载
          *   在该用户中添加的文件都又放在了旧盘

### 进程管理

> 进程 process
>
> 服务 service

* ps 查看当前用户进程

  * a 所有

  * x 当前用户，含终端

  * u 用户式信息

  * **ps aux ｜less      最全，可分屏查看**

  * \-e相当于ax

  * \-f 完整进程列表，相当于u

  * **ps -ef ｜less    最全，还多了父进程列**

  * 带-的是unix风格的，不带-的是bsd风格的，bsd是unix的衍生版本

  * **aux信息说明：查看cpu、内存占用率**

    * USER：该进程是由哪个用户产生的

    * PID：进程的  ID 号

    * **%CPU：该进程占用 CPU 资源的百分比，占用越高，进程越耗费资源；**

    * **%MEM：该进程占用物理内存的百分比，占用越高，进程越耗费资源；**

    * VSZ：该进程占用虚拟内存的大小，单位  KB；

    * RSS：该进程占用实际物理内存的大小，单位  KB；

    * TTY ：该进程是在哪个终端中运行的 。 对于CentOS来说 ，tty1是图形化终端  ，

      tty2-tty6 是本地的字符界面终端。pts/0-255 代表虚拟终端。

    * STAT：进程状态。常见的状态有：

      R：运行状态、S：睡眠状态、T：暂停状态、
      Z：僵尸状态、s：包含子进程、l：多线程、+：前台显示

    * START：该进程的启动时间

    * TIME：该进程占用  CPU 的运算时间，注意不是系统时间

    * COMMAND：产生此进程的命令名

  * **-ef信息说明：查看父进程**

    *   UID：用户  ID
    *   PID：进程  ID
    *   **PPID：父进程  ID**
    *   C：CPU 用于计算执行优先级的因子。数值越大，表明进程是 CPU 密集型运算，
        执行优先级会降低；数值越小，表明进程是 I/O 密集型运算，执行优先级会提高
    *   STIME：进程启动的时间
    *   TTY：完整的终端名称
    *   TIME：CPU 时间
    *   CMD：启动进程所用的命令和参数

* kill 进程号

  *   killall 进程名     支持通配符
  *   \-9 强制kill

* pstree 查看进程父子关系

  *   \-p 显示PID
  *   \-u 显示所属用户

* top 实时监控进程

  *   \-d 秒数   几秒刷新，默认3s
  *   \-p PID   监视某个进程状态
  *   P 按 %CPU排序
  *   N 按内存排序

* netstat

  *   netstat  -anp |  grep  进程名             查看该进程网络信息
  *   netstat  –nlp |  grep  端口号            查看网络端口号占用情况
      *   \-a 所有正在监听（listen）和未监听的套接字（socket）
      *   \-n 拒绝显示别名，能显示数字的全部转化成数字
      *   \-l 仅列出在监听的服务状态
      *   \-p 表示显示哪个进程在调用

### 定时任务

*   重启crond服务 systemctl restart crond
*   crontab
    *   \-e 编辑
    *   \-l 查看
    *   \-r 删除当前用户所有
    *   参数\*\*\*\*\* 命令
        *   \*\*\*\*\* 分，时，日，月，星期
        *   ，不连续的\*用，分割
        *   \-  连续的\*用-连接
        *   \*/n  每个n执行一次

### 软件包管理

* RPM

  > RPM（RedHat  Package  Manager），RedHat软件包管理工具，类似windows里面的setup.exe ，是Linux这系列操作系统里面的打包安装工具，它虽然是RedHat的标志，但理念是通用的。
  >
  > RPM包的名称格式
  > Apache-1.3.23-11.i386.rpm
  >
  > *
  >              “apache”  软件名称
  > *
  >              “1.3.23-11”软件的版本号，主版本和此版本
  > *
  >              “i386”是软件所运行的硬件平台，Intel  32位处理器的统称 
  > *
  >              “rpm”文件扩展名，代表RPM包

  *   rmp -qa    查询所安装的所有  rpm 软件包
      *   一般配合grep使用
  *   rpm -e  RPM软件包   卸载
      *   rpm  -e  --nodeps 软件包   不检查依赖卸载
  *   rpm -ivh  RPM 包全名
      *   \-i 安装
      *   \-v 显示信息
      *   \-h 进度条
      *   \--nodeps 不检查依赖

* YUM

  > YUM （ 全 称 为 Yellow dog Updater, Modified ） 是 一 个 在 Fedora 和 RedHat 以 及 CentOS 中 的 Shell 前 端 软 件 包 管 理 器 。 基 于 RPM 包 管 理 ， 能 够 从 指 定 的 服 务 器 自 动 下 载 RPM 包 并且安装，可以自动处理依赖性关系，并且一次安装所有依赖的软件包，无须繁琐地一次 次下载、安装

  *   yum -y install

      *   \-y 所有回答yes

      *   update

      *   remove

      *   list 显示包信息

      *   check-update 检查更新

      *   clean 清理缓存

      *   deplist 显示依赖
  *   修改镜像

      *   yum -y install wget    安装wget，wget 用来从指定的  URL 下载文件
      *   wget -O /etc/yum.repos.d/CentOS-Base.repo <http://mirrors.aliyun.com/repo/Centos-7.repo>