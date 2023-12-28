---
isOriginal: true
category: 运维
tag: 
  - Git
---
# Git 基础
## 概述

Git是目前最流行的分布式版本控制系统之一，它用于跟踪和管理项目代码的变化。Git的设计目标是速度、简单性和非线性开发。

**关键特点:**

1. **分布式**: 与集中式版本控制系统不同，每个开发者都可以拥有完整的代码仓库副本。这意味着即使没有网络连接，开发者仍然可以进行版本控制操作，并在需要时共享更新。

   🌐 集中式以（Subversion）为代表

   - 有一个单一的集中管理服务器，客户端都通过这台服务器拉取或提交更新
   - 缺点：中央服务器挂了，不能更新，不能拉取，不能协同

   🌐 分布式以Git为代表

   - 每台客户端都有本地库，版本控制在本地进行
   - 远程库：
     - 局域网：GitLab
     - 互联网：GitHub、Gitee

2. **提交（Commit）**: 提交是Git中的基本操作，用于保存代码的变更。开发者可以根据需要创建新的提交，并为每个提交添加描述性的注释。

3. **分支（Branch）**: Git鼓励使用分支进行开发。分支是独立的代码线，开发者可以在分支上进行实验、开发新功能或修复错误，而不会影响主代码线。分支之间可以合并以将更改合并到主代码线中。

4. **合并（Merge）**: 合并是将一个分支的更改合并到另一个分支的操作。Git提供了多种合并策略，可以根据需求选择适当的策略。

5. **远程仓库（Remote Repository）**: 远程仓库是位于网络上的代码仓库，可以由多个开发者共享和访问。常见的远程仓库托管服务包括GitHub、GitLab和Bitbucket等。

6. **克隆（Clone）**: 通过克隆操作，开发者可以在本地创建一个远程仓库的副本。克隆操作不仅会复制代码，还会复制整个版本历史。

7. **拉取（Pull）和推送（Push）**: 拉取操作用于从远程仓库获取最新的代码更新，而推送操作则将本地的代码更新上传到远程仓库。

Git具有许多其他功能和命令，例如**标签（Tagging）**、**重置（Resetting）**、**回滚（Reverting）**等，以满足各种版本控制需求。

## 命令

### 设置用户签名

::: tip

Git 首次安装必须设置一下用户签名，否则无法提交代码。

:::

*   git config --global user.name  用户名
*   git config --global user.email  邮箱
*   cat \~/.gitconfig

### 初始化本地库

*   `git init`   产生.git文件夹

```bash
git init
===========================
drwxr-xr-x    6 liusisi  staff   192B  6 24 21:29 .
drwx------@ 263 liusisi  staff   8.2K  6 21 13:46 ..
-rw-r--r--@   1 liusisi  staff   6.0K  6 24 21:05 .DS_Store
drwxr-xr-x   10 liusisi  staff   320B  6 24 21:29 .git
-rw-r--r--@   1 liusisi  staff   321K  6 24 21:28 4JavaWeb.md
-rw-r--r--@   1 liusisi  staff    39K  6 24 20:32 Linux.md
```

### 查看本地库状态

*   `git status`

    **此时文件处于为未追踪状态**，一般显示为红色

```sh
git status
===============================
#
On branch master
No commits yet
Untracked files:
  (use "git add <file>..." to include in what will be committed)

        4JavaWeb.md
        Linux.md

nothing added to commit but untracked files present (use "git add" to track)
```

### 添加暂存区

*   `git add 文件名`（支持通配符）

    **此时文件处于为未提交状态**，一般显示为绿色

```sh
git add *
==========================
#
On branch master
No commits yet
Changes to be committed:
  (use "git rm --cached <file>..." to unstage)

        new file:   4JavaWeb.md
        new file:   Linux.md
```
### 提交本地库

*   `git commit -m “日志信息”  文件名`
*   `git commit -m “日志信息”  . ` --------- 提交所有文件

```sh
git commit -m "Linux" Linux.md  
=========================
[master 6a80176] Linux
 1 file changed, 1392 insertions(+)
 create mode 100644 Linux.md
```

### 历史版本

*   `git reflog`  查看版本信息

```sh
git reflog
======================
193d6b5 (HEAD -> master) HEAD@{0}: commit: git-test
6a80176 HEAD@{1}: commit: Linux
15f2d2e HEAD@{2}: commit (initial): JavaWeb
```

*   `git log`   查看版本详细信息

```sh
git log
==================
commit 193d6b54907aad4114bfebdcaf9b122d76cd4c1d (HEAD -> master)
Author: liyuanhao <liyuanhao@qq.com>
Date:   Sat Jun 25 00:00:13 2022 +0800

    git-test

commit 6a80176774f72854323ecf129e17b445b52d3465
Author: liyuanhao <liyuanhao@qq.com>
Date:   Fri Jun 24 23:54:53 2022 +0800

    Linux

commit 15f2d2eb68adc3a425fbe616c4eb869f5726b414
Author: liyuanhao <liyuanhao@qq.com>
Date:   Fri Jun 24 23:54:02 2022 +0800
```

### 版本穿梭

实现版本切换，就是在切换Head指针的位置

*   `git reset --hard 版本号`

```sh
#切换前
===============
c7301c7 (HEAD -> master) HEAD@{0}: commit: git-changeversion-test
193d6b5 HEAD@{1}: commit: git-test
6a80176 HEAD@{2}: commit: Linux
15f2d2e HEAD@{3}: commit (initial): JavaWeb

```

```sh
git reset --hard 15f2d2e
===================
#切换后
15f2d2e (HEAD -> master) HEAD@{0}: commit (initial): JavaWeb
c7301c7 HEAD@{1}: commit: git-changeversion-test
193d6b5 HEAD@{2}: commit: git-test
6a80176 HEAD@{3}: commit: Linux
15f2d2e (HEAD -> master) HEAD@{4}: commit (initial): JavaWeb
```

## 分支

::: tip

在版本控制过程中，同时推进多个任务，为每个任务，我们就可以创建每个任务的单独 分支。使用分支意味着程序员可以把自己的工作从开发主线上分离开来，开发自己分支的时 候，不会影响主线分支的运行。对于初学者而言，分支可以简单理解为副本，一个分支就是 一个单独的副本。（分支底层其实也是指针的引用）

同时并行推进多个功能开发，提高开发效率。
各个分支在开发过程中，如果某一个分支开发失败，不会对其他分支有任何影响。失败 的分支删除重新开始即可

:::



### 查看分支

*   `git branch -v`

```sh
* macOS  74440d0 111
  master 74440d0 [领先 1] 111
```

### 创建分支

*   `git branch 分支名`

```sh
git branch macOS
```

### 切换分支

*   `git checkout 分支名`

```sh
git checkout macOS
M	4JavaWeb.md
切换到分支 'macOS'
```

### 合并分支

*   `git merge 分支名`

*   产生冲突：后面状态为  MERGING
    *   两个分支在同一个文件的同一个位置有两套完全不同的修改
*   解决冲突

## 团队协作机制

### 内部协作

从两个角度看

- 项目是在本地
  *   本地 push 到远程库 ----> 从远程库 pull 到本地库

*   项目是在远程
    *   第一次从远程库 clone 到本地库 ----> push 到远程

### 跨团队协作

跨团队协作

*   把团队1的项目 fork到自己团队的仓库中 ，在这个项目中改动，提交时只会提交到自己的仓库
*   想要提交到团队1，需要发起一个 pull request，团队1审核通过后进行 merge，就会进行合并

## GitHub、Gitee

*   创建远程仓库New repository，填写表单

### 操作远程仓库

*   `git remote -v`   查看当前所有远程地址别名
*   `git remote add  别名   远程地址`

```sh
$ git remote add origin https://gitee.com/liyuanhao0916/note-java.git
=======================
$ git remote -v  
#
origin  https://gitee.com/liyuanhao0916/note-java.git (fetch)
origin  https://gitee.com/liyuanhao0916/note-java.git (push)
```

*   ​	`git push 别名 分支` 	                 推送本地分支到远程仓库

```sh
git push -u origin "master"
========================
Username for 'https://gitee.com': liyuanhao0916
Password for 'https://liyuanhao0916@gitee.com': 
Counting objects: 12, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (11/11), done.
Writing objects: 100% (12/12), 118.02 KiB | 5.62 MiB/s, done.
Total 12 (delta 2), reused 0 (delta 0)
remote: Powered by GITEE.COM [GNK-6.3]
To https://gitee.com/liyuanhao0916/note-java.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.
```

*   `git clone 远程地址 `        克隆
*   邀请加入团队
    *   settings ---> manage access ---> invite a collaborator
    *   添加用户名
    *   复制邀请地址
*   git pull 别名 分支          拉取内容

### 跨团队合作

*   person1复制并发送远程仓库地址
*   person2点击Fork，叉到自己仓库
*   person2在线编辑 ---> 提交 ---> pull requests ---> New pull requests ---> Create pull request
*   person1 Pull requests1⃣️ ---> 查看 ---> Merge pull reque合并代码 ---> Confirm merge确认合并

### SSH免密登录

用户头像→Settings→SSH and GPG keys

[GPG公钥 - Gitee.com](https://gitee.com/profile/gpg_keys)

[如何在 Gitee 上使用 GPG - Gitee.com](https://gitee.com/help/articles/4248#article-header1)

## Idea集成

### 集成git

* 配置忽略文件

  *   创建忽略规则文件 xxxx.ignore（前缀名随便起，建议是  git.ignore）

  * 这个文件的存放位置原则上在哪里都可以，为了便于让\~/.gitconfig 文件引用，建议也放在用户家目录下

    ```gitconfig 
    ## Compiled class file 
    *.class
    
    ## Log file 
    *.log
    ## BlueJ files 
    *.ctxt
    ## Mobile Tools for Java (J2ME) 
    .mtj.tmp/
    ## Package Files ## 
    *.jar
    *.war 
    *.nar 
    *.ear 
    *.zip 
    *.tar.gz 
    *.rar
    #
    virtual        machine 
    http://www.java.com/en/download/help/error_hotspot.xml 
    hs_err_pid*
    .classpath 
    .project 
    .settings 
    target
    .idea 
    *.iml
    ```

  *   在.gitconfig 文件中引用忽略配置文件（此文件在 Windows 的家目录中）

      ```ini
      [user]
      name = liyuanhao
      email = liyuanhao@qq.com
      [core]
      excludesfile = C:/Users/asus/git.ignore 
      ## 注意：这里要使用“正斜线（/）”，不要使用“反斜线（\）”
      ```

*   idea中设置安装到路径

*   初始化本地库：VCS ---> import into Version Control ---> Create Git Repository... ---> 选择工程

*   添加到暂存区：右键点击项目选择 Git -> Add 将项目添加到暂存区。

*   提交本地库：右键Git -> Commit Directory...

*   切换版本

    *   左下角，点击 Version Control，然后点击 Log 查看版本
    *   右键选择要切换的版本，然后在菜单里点击 Checkout Revision

*   创建分支：右键 Git--> Repository --> Branches --> new branch

*   切换分支：

    *   右下角 Checkout
    *   右下角显示切换到了 \*\*\* 分支。

*   合并分支：右下角Merge into Current，把\*\*\*合并到当前分支

*   解决冲突：点击 Conflicts 框里的  Merge 按钮，进行手动合并代码

### 集成github

*   添加github账户时链接不上

    *   点击Enter token
    *   官网上settings --- develoer settings --- personal access tokens --- Generate new token --- 名字随便 --- select scopes全选 --- Generate token
    *   复制字符串填到idea --- 登录

*   分享到github

    *   VCS --- import into version control --- share project on github
    *   填表单

* push推送

  *   git --- repository --- push --- master➡️define remote（自定义远程连接别名）

  * 把创建好的别名push到指定的远程仓库

    ::: tip

    注意：push 是将本地库代码推送到远程库，如果本地库代码跟远程库代码版本不一致， push 的操作是会被拒绝的。也就是说，要想 push 成功，一定要保证本地库的版本要比远程 库的版本高！因此一个成熟的程序员在动手改本地代码之前，一定会先检查下远程库跟本地 代码的区别！如果本地的代码版本已经落后，切记要先 pull 拉取一下远程库的代码，将本地 代码更新到最新以后，然后再修改，提交，推送
    
    :::

*   pull拉取

    *   git --- repository -- -pull --- 勾选

*   clone克隆

    *   git --- clone --- 输入要克隆的地址 --- 测试 --- clone
    *   创建新工程

### 集成码云

## 自建GitLab

*   官网地址：<https://about.gitlab.com/>
    安装说明：<https://about.gitlab.com/installation/>

### 安装

*   服务器准备

    > CentOS7 以上版本的服务器，要求内存  4G，磁盘 50G
    >
    > 关闭防火墙，并且配置好主机名和 IP，保证服务器可以上网。
    > 此教程使用虚拟机：主机名：gitlab-server   IP 地址：192.168.6.200

*   安装包准备

    > Yum 在线安装  gitlab- ce 时，需要下载几百 M 的安装文件，非常耗时，所以最好提前把 所需 RPM 包下载到本地，然后使用离线  rpm 的方式安装。
    >
    > 下载地址：<https://packages.gitlab.com/gitlab/gitlab-ce/packages/el/7/gitlab-ce-13.10.2-ce.0.el7.x86_64.rpm>
    >
    > 直接将包上传到服务器/opt/module 目录下即可。

*   编写安装脚本

    ```sh
    vim gitlab-install.sh
    =======脚本内容=========
    sudo rpm -ivh /opt/module/gitlab-ce-13.10.2-ce.0.el7.x86_64.rpm
    sudo yum install -y curl policycoreutils-python openssh-server cronie
    sudo lokkit -s http -s ssh
    sudo yum install -y postfix
    sudo service postfix start
    sudo chkconfig postfix on
    curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh | sudo bash
    sudo EXTERNAL_URL="http://gitlab.example.com" yum -y install gitlab-ce
    =======给脚本增加执行权限=========
    chmod +x gitlab-install.sh
    ./gitlab-install.sh 
    ```

*   初始化  GitLab 服务

    ```sh
    gitlab-ctl reconfigure
    ```

*   启动 GitLab 服务

    ```sh
    gitlab-ctl start
    ======停止======
    gitlab-ctl stop
    ```

*   浏览器访问  GitLab

    > 使用主机名或者 IP 地址即可访问 GitLab 服务。需要提前配一下 windows 的 hosts 文件。
    >
    > 192.168.10.200  gitlab-server

    > 浏览器**访问gitlab-server**

    > 首次登陆之前，需要修改下  GitLab 提供的  root 账户的密码，要求  8 位以上，包含大小 写子母和特殊符号。因此我们修改密码为 Atguigu.123456

### idea集成gitlab

*   插件 gitlab projects 2020

*   添加

    *   主机名：<http://gitlab-server/>
    *   选择https方式

*   push

    *   url从网页复制过来，**但是需要修改**

        > <http://gitlab.example.com/root/git-test.git，>
        > 需要手动修改为：<http://gitlab-server/root/git-test.git>

