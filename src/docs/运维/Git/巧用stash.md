---
isOriginal: true
category: 运维
tag: 
  - Git
---
# 巧用 stash

::: tip [小技巧
开发时，经常开发到一半，要下班了又不想提交不完整的代码，这时候stash命令就派上用场了
:::

## 添加

```sh
## 将当前工作区和暂存区的更改保存到一个栈结构
git stash
## 将当前工作区和暂存区的更改保存到一个栈结构，并附带一个信息
git stash save "message"
## 将当前工作区和暂存区的更改保存到一个栈结构，包括新增的文件, 下面两个同等效果
git stash -u
git stash --include-untracked
## 将当前工作区和暂存区的更改保存到一个栈结构，包括新增的文件以及忽略的文件，下面两个同等效果
git stash -a
git stash --all
```

## 查看

```sh
## 查看栈中保存的更改，返回 stash id
git stash list
## 查看栈中第一个更改的具体内容
git stash show
## 查看栈中指定的更改的具体内容
git stash show <stash id>
```

## 恢复

::: tip

可重复使用

:::

```sh
## 将栈中的第一个更改恢复到当前工作区和暂存区
git stash apply
## 将栈中的指定的更改恢复到当前工作区和暂存区
git stash apply <stash id>
```

## 删除

```sh

## 删除栈中的第一个更改
git stash drop
## 删除栈中的指定的更改
git stash drop <stash id>
## 清空栈中保存的更改
git stash clear


```

## 出栈

::: warning

相当于恢复并删除，不能在重复使用

:::

```sh
##### 恢复+删除
## 将栈中的第一个更改恢复到当前工作区和暂存区，同时删除栈中的第一个更改
git stash pop
## 将栈中的指定的更改恢复到当前工作区和暂存区，同时删除栈中的指定的更改
git stash pop <stash id>
```

