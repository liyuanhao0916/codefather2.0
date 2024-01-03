---
isOriginal: true
category: 运维
tag: 
  - Git
  - Gitee
  - GitHub
---
# 如何同时推送到GitHub和Gitee


## 准备工作

- 本地的 Git 环境肯定是必须的
- GitHub 创建一个项目，拷贝代码仓库地址
- Gitee 也同样创建一个项目，拷贝代码仓库地址

## 配置

### 通过命令配置

```sh
## 添加Gitee的远程地址
git remote set-url --add origin https://gitee.com/liyuanhao0916/codefather2.0.git
## 如果报错，error: No such remote 'origin' 需要先配置origin
git remote add origin https://gitee.com/liyuanhao0916/codefather2.0.git
## 添加GitHub的远程地址
git remote set-url --add origin https://github.com/liyuanhao0916/codefather2.0.git
```

### 直接编辑配置文件

找到项目根目录下的.git文件夹下的config文件

```ini
## .git/config
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	symlinks = false
	ignorecase = true
```

如果是远程clone的，你的配置可能是这样

```ini
## .git/config
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	symlinks = false
	ignorecase = true
[remote "origin"]
	url = https://gitee.com/liyuanhao0916/codefather2.0.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
	remote = origin
	merge = refs/heads/master
```

添加配置如下

```ini
## .git/config
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	symlinks = false
	ignorecase = true
[remote "origin"]
	url = https://gitee.com/liyuanhao0916/codefather2.0.git
	## 添加一个即可
	url = https://github.com/liyuanhao0916/codefather2.0.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
	remote = origin
	merge = refs/heads/master
```

