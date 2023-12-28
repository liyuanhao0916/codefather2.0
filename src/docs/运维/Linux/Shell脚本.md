---
isOriginal: true
category: 
    - 运维
    - Linux
tag: 
  - shell

---
# Shell 脚本

## 语法

### 概述

> shell是命令解析器，接收应用程序命令，调用系统内核
>
> sh默认是bash，乌班图中默认是dash，还其他有csh，zsh等
>
> bash前身是Bourne shell，后发展为Bourne- again shell，即bash

脚本

*   创建：touch、vim

*   编辑：

    *   以#!/bin/bash  开头（指定解析器）
    *   一行多个命令用；隔开

*   执行

    *   方式一：sh 脚本路径、bash 脚本路径

    *   方式二：

        *   赋予执行权限 chmod u+x  脚本 --->
        *   路径执行，**注意，相对路径不能省略./**



            chmod u+x helloworld.sh
            ./helloworld.sh
    
    *   方式三：.  路径、source 路径
    
            . text
    
    \*\*说明：\*\*前两种都是shell中打开了子shell，而最后一种在本shell中解析，区别就在于，环境变量的继承关系，如在子  shell  中设置的
    当前变量，父  shell  是不可见的。

### 变量

* 系统预定义变量 \$大写字母

* set 显示所有变量

* 自定义变量 变量名=变量值

* unset 变量名     撤销变量

* export 变量名   升为全局变量，在子shell也可以调用

  ```sh
  s=5
  vim test.sh
  ===============================
  #!/bin/bash
  echo $s
  ===============================
  sh test.sh   #无输出，这种执行方式开了子shell，s不是全局变量
  ===============================
  export s
  sh test.sh
  5
  ```

* 静态变量（常量）  readonly 变量名,静态变量不能撤销

* \=前后不能有空格

* 默认类型都是字符串，不能运算

  ```sh
  s=5
  echo $s+$s
  #5+5
  ```

* **变量值有空格，加引号**

* 特殊变量

  * `$1-$`9 , `${10} ...  第几个参数    $`0代表脚本名称

  * \$#  参数个数

  * \$\*  所有参数

  * \$@ 所有参数

    * `$* = $`@ = "\$@"

    * "\$\*" 把所有参数作为一个字符串

      ```sh
      for i in "$@"
      do
              echo $i真漂亮
      done
      
      sh test.sh 刘思思 李某某
      #刘思思真漂亮
      #李某某真漂亮
      
      ===========================
      
      #换成“$*”
      #刘思思 李某某真漂亮
      ```

  * \$？ 返回值（反人类）

    *   正常执行返回0，不正常执行返回1-255
    *   接收返回值0-255
        *

### 运算符

*   `$(())、$`\[]

### 条件判断

*   test \[ 条件 ]
    *   **前后必须有空格**
    *   非空为true
    *   比较   -eq、-ne、-lt、-le、-gt、-ge
    *   权限  -r、-w、-x
    *   文件类型  -e 文件存在、-f 是文件、-d 是目录

*   类似三元运算
    *   \[ 条件 ]    &&     命令1     ||    命令2

### 流程控制

* if \[ 条件 ] ;then 命令 ;fi

  ```sh
  if [ 1=1 ];then echo ok;  fi
  ===============================
  if [ 1=1 ]
  then
  	echo ok
  fi	
  ```

* if \[ 条件 ] ;then 命令 ;elif \[ 条件 ] ;then 命令; else 命令; fi

* case \$变量名 in "值1") 命令;;"值2") 命令;;esac

  ```sh
  case $s in "1")echo 我是1 ;; "2") echo 我是2;;esac
  ===============================
  case $s in 
  "1")
  	echo 我是1 ;; 
  "2") 
  	echo 我是2;;
  esac
  ```

* for ((初始值；循环条件；迭代)) ;do 命令 ;done

  ```sh
  for((i=0;i<=100;i++));do sum=$[$sum+$i]; done;echo $sum
  ===============================
  for((i=0;i<=100;i++))
  do
  	sum=$[$sum+$i]
  done
  echo $sum
  ```

* for 变量 in 值1 值2 值3 ；do 命令；done

  ```sh
  for i in 1 2 3 4 5;do sum=$[$sum+$i];done;echo $sum
  ===============================
  for i in 1 2 3 4 5
  do 
  	sum=$[$sum+$i]
  done
  echo $sum
  ```

* while \[ 条件 ] ;do 命令;done

  ```sh
  i=0;while [ $i -le 100 ];do sum=$[$sum+$i] i=$[$i+1];done;echo $sum
  ===============================
  while [ $i -le 100 ]
  do 
  	sum=$[$sum+$i] 
  	i=$[$i+1]
  done
  echo $sum
  ===============================
  i=0;while (($i <= 100));do sum=$[$sum+$i] i=$[$i+1];done;echo $sum
  ```

### 读控制台

* read -p "提示"  -t 等待时间 变量名

  ```sh
  read -p "请在3s内输入姓名：" -t 3 name
  echo $name,欢迎你！
  ```

### 函数

* basename  路径  \[后缀]   在路径中提取文件名  ，**本质上就是把路径最后部分剪切下来，不会进行路径校验**

  *   .后缀   把后缀也去掉

* dirname 绝对路径       去除文件名 ，返回剩下的路径

* 自定义函数

  > \[function] 函数名(){
  >
  > ​	命令
  >
  > ​	return int
  >
  > }

  *   必须先生命函数才能调用
  *   函数返回值，只能通过\$?系统变量获得，可以显示加：return  返回，如果不加，将以最后一条命令运行结果，作为返回值。return 后跟数值  n(0-255)

  ```sh
  sum(){
          s=0
          s=$[$1+$2]
          echo $s
  }
  read -p"请输入参数1：" x
  read -p"请输入参数2：" y
  sum $x $y
  ```

### 正则表达式

* 使用全的功能需要加 -E

* 使用转义字符时加**单引号**

  ```sh
  cat /etc/passwd | grep r[a,b,c]*t
  cat /etc/passwd | grep ‘a\$b’
  ```

### 文本处理

* grep 取行

* cut \[] 文件名     取列

  *   \-f  列号
  *   \-d 分隔符，默认是“\t”制表符
  *   \-c 2 按字符切，取第2列
  *   支持，-

  ```sh
  ifconfig ens33 | grep netmask | cut -d " " -f 10 
  192.168.111.101
  ```

* awk \[] '/匹配命令/{执行命令}    /匹配命令/{执行命令}  ...'   文件名

  *   F 分隔符
  *   \-v 赋值一个用户定义变量
  *   {print `$1","$`7}  输出第一列，第七列
  *   BEGIN{print "user, shell"} 在输出的最前面加user, shell
  *   END{print "dahaige,/bin/zuishuai"}  在输出的最后面加dahaige,/bin/zuishua
  *   内置变量
      *   FILENAME 文件名
      *   NR 行号
      *   NF 列数

  ```sh
  #只显示/etc/passwd  的第一列和第七列，以分号分割，且在所有行前面添加列名usershell在最后一加"dahaige，/bin/zuishuai"。
  awk -F : 'BEGIN{print "user, shell"} {print $1","$7} END{print "dahaige,/bin/zuishuai"}' passwd
  
  #将  passwd 文件中的用户  id  增加数值  1  并输出
  awk -v i=1 -F : '{print $3+i}' passwd
  
  #统计  passwd  文件名，每行的行号，每行的列数
  awk -F : '{print "filename:" FILENAME ",linenum:" NR ",col:"NF}' passwd
  ```

## 案例

### 归档文件

> 实际生产应用中，往往需要对重要数据进行归档备份。
> 需求：实现一个每天对指定目录归档备份的脚本，输入一个目录名称（末尾不带/）， 将目录下所有文件按天归档保存，并将归档日期附加在归档文件名上，放在/root/archive  下。
> 这里用到了归档命令：tar
> 后 面 可 以 加 上 -c  选 项 表 示 归 档 ， 加 上 -z  选 项 表 示 同 时 进 行 压 缩 ， 得 到 的 文 件 后 缀 名 为.tar.gz。

```sh
#!/bin/bash
# 首先判断输入参数个数是否为 1

if [ $# -ne 1 ] 
then
	echo "参数个数错误！应该输入一个参数，作为归档目录名" 
	exit
fi
# 从参数中获取目录名称 
if [ -d $1 ]
then
	echo 
else
	echo
	echo "目录不存在！"
	echo 
	exit
fi
DIR_NAME=$(basename $1)
DIR_PATH=$(cd $(dirname $1); pwd) 
# 获取当前日期
DATE=$(date +%y%m%d)

# 定义生成的归档文件名称
FILE=archive_${DIR_NAME}_$DATE.tar.gz 
DEST=/root/archive/$FILE
# 开始归档目录文件 
echo "开始归档..."
echo

tar -czf $DEST $DIR_PATH/$DIR_NAME 

if [ $? -eq 0 ]
then
	echo
	echo "归档成功！"
	echo "归档文件为：$DEST"
	echo 
else
	echo "归档出现问题！" 
	echo
fi 
exit
```

### 发送消息

>       我们可以利用  Linux 自带的  mesg 和  write  工具，向其它用户发送消息。
>       需求：实现一个向某个用户快速发送消息的脚本，输入用户名作为第一个参数，后面直接跟要发送的消息。脚本需要检测用户是否登录在系统中、是否打开消息功能，以及当前发送消息是否为空。

```sh
#!/bin/bash
login_user=$(who | grep -i -m 1 $1 | awk '{print $1}') 
if [ -z $login_user ]
then
	echo "$1 不在线！" 
	echo "脚本退出.." 
exit
fi
is_allowed=$(who -T | grep -i -m 1 $1 | awk '{print $2}') 
if [ $is_allowed != "+" ]
then
	echo "$1 没有开启消息功能" 
	echo "脚本退出.."
  exit 
fi
if [ -z $2 ] 
then
	echo "没有消息发出" 
	echo "脚本退出.." 
	exit
fi
whole_msg=$(echo $* | cut -d " " -f 2- )
user_terminal=$(who | grep -i -m 1 $1 | awk '{print $2}') 
echo $whole_msg | write $login_user $user_terminal
if [ $? != 0 ] 
then
	echo "发送失败！" 
else
	echo "发送成功！" 
fi
exit
```

