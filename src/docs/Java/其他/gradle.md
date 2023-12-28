# Gradle

## 安装

- [下载](https://gradle.org/releases/)

- 环境变量

- 配置本地仓库路径 --- 可直接设置为maven的本地仓库路径

  - 环境变量中设置GRADLE_USER_HOME = maven的仓库路径

- 修改下载源 --- 在init.d文件夹下创建一个以.gradle结尾的文件（按字母顺序加载）

```groovy
allprojects {
    repositories {
        def ALIYUN_REPOSITORY_URL = 'https://maven.aliyun.com/repository/public'
        def ALIYUN_JCENTER_URL = 'https://maven.aliyun.com/repository/jcenter'
        def ALIYUN_GOOGLE_URL = 'https://maven.aliyun.com/repository/google'
        def ALIYUN_GRADLE_PLUGIN_URL = 'https://maven.aliyun.com/repository/gradle-plugin'
        def ALIYUN_GRAILS_CORE = 'https://maven.aliyun.com/repository/grails-core'

        def REPOSITORY_URL = 'https://repo1.maven.org/maven2/'
        def JCENTER_URL = 'https://jcenter.bintray.com/'
        def GOOGLE_URL = 'https://dl.google.com/dl/android/maven2/'
        def GRADLE_PLUGIN_URL = 'https://plugins.gradle.org/m2/'

        all { ArtifactRepository repo ->
            if (repo instanceof MavenArtifactRepository) {
                def url = repo.url.toString()
                if (url.startsWith(REPOSITORY_URL)) {
                    project.logger.lifecycle "Repository ${repo.url} replaced by $ALIYUN_REPOSITORY_URL."
                    remove repo
                }
                if (url.startsWith(JCENTER_URL)) {
                    project.logger.lifecycle "Repository ${repo.url} replaced by $ALIYUN_JCENTER_URL."
                    remove repo
                }
                if (url.startsWith(GOOGLE_URL)) {
                    project.logger.lifecycle "Repository ${repo.url} replaced by $ALIYUN_GOOGLE_URL."
                    remove repo
                }
                if (url.startsWith(GRADLE_PLUGIN_URL)) {
                    project.logger.lifecycle "Repository ${repo.url} replaced by $ALIYUN_GRADLE_PLUGIN_URL."
                    remove repo
                }
            }
        }
        maven { url ALIYUN_REPOSITORY_URL }
        maven { url ALIYUN_JCENTER_URL }
        maven { url ALIYUN_GOOGLE_URL }
        maven { url ALIYUN_GRADLE_PLUGIN_URL }
        maven { url ALIYUN_GRAILS_CORE }
        maven { url REPOSITORY_URL }
        maven { url JCENTER_URL }
        maven { url GOOGLE_URL }
        maven { url GRADLE_PLUGIN_URL }
    }
}
// allprojects {
//     repositories {
//         mavenLocal()
//         maven {name "Alibaba" ; url "https://maven.aliyun.com/repository/public"}
//         mavenCentral()
//     }
//     buildscript {

//         repositories {
//             mavenLocal()
//             maven { url 'https://maven.aliyun.com/repository/public' }
//             maven { url 'https://maven.aliyun.com/repository/jcenter' }
//             maven { url 'https://maven.aliyun.com/repository/google' }
//             maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
//             maven { url 'https://maven.aliyun.com/repository/grails-core' }
//         }
//         dependencies {
//             classpath 'com.android.tools.build:gradle:3.3.1'
//             classpath "io.objectbox:objectbox-gradle-plugin:2.3.4"
//             // NOTE: Do not place your application dependencies here; they belong
//             // in the individual module build.gradle files
//         }
//     }
// }
```



## 基本概念

- 缺点：版本兼容问题，需要与idea和spring的版本兼容

- 目录结构 --- 和maven基本相同

- 常用命令

```sh
gradle clean
gradle classes  # 编译
gradle test		# 编译 测试
gradle build	# 构建
gradle build -x test	# 构建时跳过测试
gradle --init-script 文件目录 -q 任务名称	# 加载初始化脚本（在init.d目录下自动初始化）
```



- gradle wrapper

  - gradle装饰器，对gradle进行包装，可以直接使用gradlew或gradle.bat脚本直接使用
  - 对于没有安装gradle或者版本不一致，使用wrapper就很方便
  - wrapper的版本和本地的gradle版本是不一样的
  - gradlew命令和gradle完全一致
  - 模块目录下`gradle wrapper --gradle-version=4.4`指定gradle的版本为4.4，只修改了gradle.properties 中的wrapper版本信息，并不下载，当执行classes或build的时候才下载，下载到了`GRADLE_USER_HOME`下，并在对应catch目录下缓存
  - `--gradle-distribution-url`指定gradle下载地址

## Groovy

- 可以安装groovy，也可以直接用idea中的

- 在idea中工具栏中的tools下有一个gradle控制台，可测试用

```groovy
println "hello world"
```



- 既可以作为面向对象的语言，也可以作为脚本语言，语法和java基本相同

  - 可省略句尾分号

  - 脚本中的类不能和文件名同名

  - 没有类的定义就作为script处理，即转换为一个Script类型的类，类名就是文件名

  - Trait类型 --- 有实现类的接口

  - 权限修饰符没有default，省略默认是public

  - 基本类型也是对象

  - 默认导入了一些包（long、utils等）

  - 属性

    - 默认有get、set方法

    - 赋值、获取

  ```groovy
  // 赋值
  
  对象.属性=
  对象["属性名"]=
  自带的setter方法
  自带的具名构造器
  
  // 获取
  对象.属性
  对象["属性名"]
  自带的getter方法
  ```

  - 方法

    - 声明
      - 参数类型，返回值类型可以省略
      - return可省略，默认最后一句返回值作为返回值
    - 调用 --- 括号可以省略

  - 字符串

    - 单引号 --- 作为字符串使用
    - 双引号 --- 可引用变量${}，有运算能力
    - 三引号 --- 作为模板字符串，支持换行
    - 字符串和基本类型、包装类可自动转换

  - 变量声明 -- 用def声明 --- 返回值也用def --- 不同的类型也可以放在一个集合中

  ```groovy
  def i = 5
  def j = "nihao"
  
  println i
  println j
  ```

  

  ```groovy
  // list
  def list = [1,2,3,4]
  list.add(5)
  list.add(0,6)
  list << 7
  
  println list
  println list.get(0)
  ```

  ```groovy
  // map
  def map = [name:"li",age:10]
  map.name = "李某某"
  map.group = "开发"
  map = map + [name:"yuan"]	// 无则添加，有则覆盖
  map = map - [name:"yuan"]
  
  println map
  println map.name
  println map.get("group")
  ```

  - 闭包 --- 类似c中的回调 --- 即函数作为参数

  ```groovy
  def sayHello = {
      println "hello"
  }
  
  def testSayHello(Closure closure){
      closure()
  }
  
  testSayHello(sayHello)
  ```

  

  ```groovy
  def c = {
      v ->
          println "hello ${v}"
  }
  
  def testC(Closure closure) {
      closure("李明")
  }
  
  testC(c)
  ```

## 配置文件

在build.gradle文件中

```groovy

```

## 工程聚合

在settings.gradle文件中

```groovy

```

