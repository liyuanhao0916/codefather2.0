# Maven

## 基础

### Maven安装配置

* 目录

  <img src="http://minio.botuer.com\003JavaWeb\黑马\day04-Maven&MyBatis\day04-1-Maven\ppt\assets\image-20210726163518885.png" alt="image-20210726163518885" style="zoom:80%;" />

  * bin目录 ： 存放的是可执行命令。mvn 命令重点关注。
  * conf目录 ：存放Maven的配置文件。`settings.xml` 配置文件后期需要修改。
  * lib目录 ：存放Maven依赖的jar包。Maven也是使用java开发的，所以它也依赖其他的jar包。

* 配置环境变量 MAVEN_HOME 为安装路径的bin目录

  打开命令提示符进行验证，出现如图所示表示安装成功

  <img src="http://minio.botuer.com\003JavaWeb\黑马\day04-Maven&MyBatis\day04-1-Maven\ppt\assets\image-20210726164306480.png" alt="image-20210726164306480" style="zoom:80%;" />

* 配置本地仓库

  修改 conf/settings.xml 中的 `<localRepository>` 为一个指定目录作为本地仓库，用来存储jar包。

  <img src="http://minio.botuer.com\003JavaWeb\黑马\day04-Maven&MyBatis\day04-1-Maven\ppt\assets\image-20210726164348048.png" alt="image-20210726164348048" style="zoom:60%;" />

* 配置阿里云私服

  中央仓库在国外，所以下载jar包速度可能比较慢，而阿里公司提供了一个远程仓库，里面基本也都有开源项目的jar包。

  修改 conf/settings.xml 中的 `<mirrors>`标签，为其添加如下子标签：

  ```xml
  <mirror>  
      <id>alimaven</id>  
      <name>aliyun maven</name>  
      <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
      <mirrorOf>central</mirrorOf>          
  </mirror>
  ```

### IDEA配置Maven环境

我们需要先在IDEA中配置Maven环境：

* 选择 IDEA中 File --> Settings

  <img src="http://minio.botuer.com\003JavaWeb\黑马\day04-Maven&MyBatis\day04-1-Maven\ppt\assets\image-20210726174202898.png" alt="image-20210726174202898" style="zoom:80%;" />

* 搜索 maven 

  <img src="http://minio.botuer.com\003JavaWeb\黑马\day04-Maven&MyBatis\day04-1-Maven\ppt\assets\image-20210726174229396.png" alt="image-20210726174229396" style="zoom:80%;" />

* 设置 IDEA 使用本地安装的 Maven，并修改配置文件路径

  <img src="http://minio.botuer.com\003JavaWeb\黑马\day04-Maven&MyBatis\day04-1-Maven\ppt\assets\image-20210726174248050.png" alt="image-20210726174248050" style="zoom:70%;" />

### Maven 坐标

**什么是坐标？**

* Maven 中的坐标是==资源的唯一标识==
* 使用坐标来定义项目或引入项目中需要的依赖

**Maven 坐标主要组成**

* groupId：定义当前Maven项目隶属组织名称（通常是域名反写，例如：com.itheima）
* artifactId：定义当前Maven项目名称（通常是模块名称，例如 order-service、goods-service）
* version：定义当前项目版本号

### Maven面板

* 如果没有Maven面板，选择

  View --> Appearance --> Tool Window Bars

  <img src="http://minio.botuer.com\003JavaWeb\黑马\day04-Maven&MyBatis\day04-1-Maven\ppt\assets\image-20210726182634466.png" alt="image-20210726182634466" style="zoom:80%;" />



可以通过下图所示进行命令的操作：

<img src="http://minio.botuer.com\003JavaWeb\黑马\day04-Maven&MyBatis\day04-1-Maven\ppt\assets\image-20210726182902961.png" alt="image-20210726182902961" style="zoom:80%;" />

### **Maven-Helper 插件** 

### **自动导入设置**

上面每次操作都需要点击刷新按钮，让引入的坐标生效。当然我们也可以通过设置让其自动完成

* 选择 IDEA中 File --> Settings

  <img src="http://minio.botuer.com\003JavaWeb\黑马\day04-Maven&MyBatis\day04-1-Maven\ppt\assets\image-20210726193854438.png" alt="image-20210726193854438" style="zoom:60%;" />

* 在弹出的面板中找到 Build Tools

  <img src="http://minio.botuer.com\003JavaWeb\黑马\day04-Maven&MyBatis\day04-1-Maven\ppt\assets\image-20210726193909276.png" alt="image-20210726193909276" style="zoom:80%;" />

* 选择 Any changes，点击 ok 即可生效

### 依赖范围

通过设置坐标的依赖范围(scope)，可以设置 对应jar包的作用范围：编译环境、测试环境、运行环境。

如下图所示给 `junit` 依赖通过 `scope` 标签指定依赖的作用范围。 那么这个依赖就只能作用在测试环境，其他环境下不能使用。

<img src="http://minio.botuer.com\003JavaWeb\黑马\day04-Maven&MyBatis\day04-1-Maven\ppt\assets\image-20210726194703845.png" alt="image-20210726194703845" style="zoom:70%;" />

那么 `scope` 都可以有哪些取值呢？

| **依赖范围** | 编译classpath | 测试classpath | 运行classpath | 例子              |
| ------------ | ------------- | ------------- | ------------- | ----------------- |
| **compile**  | Y             | Y             | Y             | logback           |
| **test**     | -             | Y             | -             | Junit             |
| **provided** | Y             | Y             | -             | servlet-api       |
| **runtime**  | -             | Y             | Y             | jdbc驱动          |
| **system**   | Y             | Y             | -             | 存储在本地的jar包 |

* compile ：作用于编译环境、测试环境、运行环境。
* test ： 作用于测试环境。典型的就是Junit坐标，以后使用Junit时，都会将scope指定为该值
* provided ：作用于编译环境、测试环境。我们后面会学习 `servlet-api` ，在使用它时，必须将 `scope` 设置为该值，不然运行时就会报错
* runtime  ： 作用于测试环境、运行环境。jdbc驱动一般将 `scope` 设置为该值，当然不设置也没有任何问题 

> 注意：
>
> * 如果引入坐标不指定 `scope` 标签时，默认就是 compile  值。以后大部分jar包都是使用默认值。

## 分模块开发

- 模块直接建立依赖
- Maven从本地仓库找其他模块依赖，显然没有，所以需要使用maven的install“安装“命令，把其安装到Maven的本地仓库中

## 依赖管理

- 依赖传递与版本冲突

  - 特殊优先：同模块配置了相同资源的不同版本，后配置的覆盖先配置的。

  - 路径优先：不同层级，层级越浅，优先级越高

  - 声明优先：相同层级，配置顺序靠前的覆盖配置顺序靠后的
- 可选依赖（不透明）：隐藏依赖的这个资源，隐藏后该资源不具有依赖传递
  - `<dependency>`标签中添加`<optional>`true`</optional>`
- 排除依赖（不需要）：把传递过来的依赖排除掉
  - `<dependency>`标签中添加`<exclusion>`含`<groupId>`、`<artifactId>`，无需版本号

## 聚合与继承

问题1：每个模块都需要执行install命令，模块多了很麻烦

问题2：某模块修改，依赖此模块的其他模块也都要重新编译

聚合:将多个模块组织成一个整体，同时进行项目构建的过程称为聚合

聚合模块（聚合工程）：通常是一个不具有业务功能的"空"工程（有且仅有一个pom文件）

- 创建空的maven工程
- 打包方式改为pom
- 添加所需管理的模块 `<modules>``<module>`../maven_02_ssm`</module>``</modules>`
- 执行compile“编译”命令

问题3：重复配置、部分重复配置、依赖版本升级

- 使用聚合模块，添加公共依赖
- 子模块中设置父模块`<parent>`添加父模块坐标和路径
- 父模块添加依赖管理`<dependencyManagement>`，添加部分重复依赖
- 子模块设置单独需要的依赖，不需要配置版本信息

idea快速创建

- 创建聚合模块
- 在聚合模块上new一个模块

<img src="http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607222537615.png" alt="image-20220607222537615" style="zoom:33%;" />

## 属性

问题：更新某一技术版本需要改很多依赖，容易发生遗漏导致程序问题

解决

- maven的属性

  <img src="http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607230045959.png" alt="image-20220607230045959" style="zoom: 50%;" />

- maven属性管理maven属性

  - 父模块定义属性：`<properties>`中添加`<***.version>`

  - 依赖的version引用${***.version}

- maven属性管理配置文件加载属性

  - 父模块定义属性

  - 配置文件引用

  - 设置maven过滤文件范围

    - 方式一：

    ```xml
    <build>
        <resources>
            <!--设置资源目录-->
            <resource>
                <directory>../maven_02_ssm/src/main/resources</directory>
                <!--设置能够解析${}，默认是false -->
                <filtering>true</filtering>
            </resource>
        </resources>
    </build>
    ```

    - 方式二：模块多时的简化
      - 打包出错：需要添加web.xml文件 或 打包为war包

    ```xml
    <build>
        <resources>
            <!--
    			${project.basedir}: 当前项目所在目录,子项目继承了父项目，
    			相当于所有的子项目都添加了资源目录的过滤
    		-->
            <resource>
                <directory>${project.basedir}/src/main/resources</directory>
                <filtering>true</filtering>
            </resource>
        </resources>
    </build>
    ```

## 版本管理

- SNAPSHOT：”快照“  
- RELEASE：”发布“

* alpha版:内测版，bug多不稳定内部版本不断添加新功能
* beta版:公测版，不稳定(比alpha稳定些)，bug相对较多不断添加新功能
* 纯数字版

## 多环境配置与应用

问题：开发环境、测试环境、生产环境的数据库不同，即url不同，需要实现环境切换

- 父模块配置多个环境，并指定默认激活环境`<profiles>`、  `<profile>`、`<properties>`、`<activation>`

  ```xml
  <profiles>
      <!--开发环境-->
      <profile>
          <id>env_dep</id>
          <properties>
              <jdbc.url>jdbc:mysql://127.1.1.1:3306/ssm_db</jdbc.url>
          </properties>
          <!--设定是否为默认启动环境-->
          <activation>
              <activeByDefault>true</activeByDefault>
          </activation>
      </profile>
      <!--生产环境-->
      <profile>
          <id>env_pro</id>
          <properties>
              <jdbc.url>jdbc:mysql://127.2.2.2:3306/ssm_db</jdbc.url>
          </properties>
      </profile>
      <!--测试环境-->
      <profile>
          <id>env_test</id>
          <properties>
              <jdbc.url>jdbc:mysql://127.3.3.3:3306/ssm_db</jdbc.url>
          </properties>
      </profile>
  </profiles>
  ```

- 切换默认启动环境：修改`<activation>`的位置

- 命令行实现环境切换：mvn 指令 -P 环境定义ID[环境定义中获取]

  

  <img src="http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607231407123.png" alt="image-20220607231407123" style="zoom:33%;" />

  

## 跳过测试

对于`test`来说有它存在的意义，

* 可以确保每次打包或者安装的时候，程序的正确性，假如测试已经通过在我们没有修改程序的前提下再次执行打包或安装命令，由于顺序执行，测试会被再次执行，就有点耗费时间了。
* 功能开发过程中有部分模块还没有开发完毕，测试无法通过，但是想要把其中某一部分进行快速打包，此时由于测试环境失败就会导致打包失败。

方式一：idea中跳过

- 图中的按钮为`Toggle 'Skip Tests' Mode`,
- Toggle翻译为切换的意思，也就是说在测试与不测试之间进行切换。

<img src="http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607231818119.png" alt="image-20220607231818119" style="zoom: 50%;" />



方式二：配置插件实现跳过测试

- 在父工程中的pom.xml中添加测试插件配置
- skipTests:如果为true，则跳过所有测试，如果为false，则不跳过测试
- excludes：哪些测试类不参与测试，即排除，针对skipTests为false来设置的
- includes: 哪些测试类要参与测试，即包含,针对skipTests为true来设置的

```xml
<build>
    <plugins>
        <plugin>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>2.12.4</version>
            <configuration>
                <skipTests>false</skipTests>
                <!--排除掉不参与测试的内容-->
                <excludes>
                    <exclude>**/BookServiceTest.java</exclude>
                </excludes>
            </configuration>
        </plugin>
    </plugins>
</build>
```

方式三：命令行跳过测试

- 使用Maven的命令行，`mvn 指令 -D skipTests`

- 注意事项:

  * 执行的项目构建指令必须包含测试生命周期，否则无效果。例如执行compile生命周期，不经过test生命周期。

  * 该命令可以不借助IDEA，直接使用cmd命令行进行跳过测试，需要注意的是cmd要在pom.xml所在目录下进行执行。

  <img src="http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607232116751.png" alt="image-20220607232116751" style="zoom:50%;" />

## 私服

* 私服是一台独立的服务器，用于解决团队内部的资源共享与资源同步问题

- 搭建Maven私服的方式有很多，我们来介绍其中一种使用量比较大的实现方式:

### Nexus配置私服

* Sonatype公司的一款maven私服产品

* 下载地址：https://help.sonatype.com/repomanager3/download

* 解压即可安装，cmd启动：`nexus-3.30.1-01\bin`,执行如下命令:nexus.exe /run nexus

* 浏览器访问：http://localhost:8081

* 重置密码：首次登录的密码在给出的路径文件中

  ![image-20220607233659894](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607233659894.png)

* 修改基础配置信息

  - 安装路径下etc目录中nexus-default.properties文件保存有nexus基础配置信息，例如默认访问端口。

* 修改服务器运行配置信息

  - 安装路径下bin目录中nexus.vmoptions文件保存有nexus服务器启动对应的配置信息，例如默认占用内存空间。

### 私服资源操作流程

![image-20220607233836774](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607233836774.png)

(1)在没有私服的情况下，我们自己创建的服务都是安装在Maven的本地仓库中

(2)私服中也有仓库，我们要把自己的资源上传到私服，最终也是放在私服的仓库中

(3)其他人要想使用你所上传的资源，就需要从私服的仓库中获取

(4)当我们要使用的资源不是自己写的，是远程中央仓库有的第三方jar包，这个时候就需要从远程中央仓库下载，每个开发者都去远程中央仓库下速度比较慢(中央仓库服务器在国外)

(5)私服就再准备一个仓库，用来专门存储从远程中央仓库下载的第三方jar包，第一次访问没有就会去远程中央仓库下载，下次再访问就直接走私服下载

(6)前面在介绍版本管理的时候提到过有`SNAPSHOT`和`RELEASE`，如果把这两类的都放到同一个仓库，比较混乱，所以私服就把这两个种jar包放入不同的仓库

(7)上面我们已经介绍了有三种仓库，一种是存放`SNAPSHOT`的，一种是存放`RELEASE`还有一种是存放从远程仓库下载的第三方jar包，那么我们在获取资源的时候要从哪个仓库种获取呢?

(8)为了方便获取，我们将所有的仓库编成一个组，我们只需要访问仓库组去获取资源。

### 私服仓库分类

- 宿主仓库hosted 
  - 保存无法从中央仓库获取的资源
    - 自主研发
    - 第三方非开源项目,比如Oracle,因为是付费产品，所以中央仓库没有


- 代理仓库proxy 
  - 代理远程仓库，通过nexus访问其他公共仓库，例如中央仓库


- 仓库组group 

  - 将若干个仓库组成一个群组，简化配置

  - 仓库组不能保存资源，属于设计型仓库

### 本地仓库访问私服配置

* 我们通过IDEA将开发的模块上传到私服，中间是要经过本地Maven的

* 本地Maven需要知道私服的访问地址以及私服访问的用户名和密码

* 私服中的仓库很多，Maven最终要把资源上传到哪个仓库?

* Maven下载的时候，又需要携带用户名和密码到私服上找对应的仓库组进行下载，然后再给IDEA

  ![image-20220607234347135](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607234347135.png)

上面所说的这些内容，我们需要在本地Maven的配置文件`settings.xml`中进行配置。

**步骤1:私服上配置仓库**

![image-20220607234409650](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607234409650.png)

**说明:**

第5，6步骤是创建itheima-snapshot仓库

第7，8步骤是创建itheima-release仓库

**步骤2:配置本地Maven对私服的访问权限**

```xml
<servers>
    <server>
        <id>itheima-snapshot</id>
        <username>admin</username>
        <password>admin</password>
    </server>
    <server>
        <id>itheima-release</id>
        <username>admin</username>
        <password>admin</password>
    </server>
</servers>
```

**步骤3:配置私服的访问路径**

```xml
<mirrors>
    <mirror>
        <!--配置仓库组的ID-->
        <id>maven-public</id>
        <!--*代表所有内容都从私服获取-->
        <mirrorOf>*</mirrorOf>
        <!--私服仓库组maven-public的访问路径-->
        <url>http://localhost:8081/repository/maven-public/</url>
    </mirror>
</mirrors>
```

为了避免阿里云Maven私服地址的影响，建议先将之前配置的阿里云Maven私服镜像地址注释掉，等练习完后，再将其恢复。

<img src="http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607234018223.png" alt="image-20220607234018223" style="zoom: 50%;" />

至此本地仓库就能与私服进行交互了。

### 私服资源上传与下载

本地仓库与私服已经建立了连接，接下来我们就需要往私服上上传资源和下载资源，具体的实现步骤为:

**步骤1:配置工程上传私服的具体位置**

```xml
 <!--配置当前工程保存在私服中的具体位置-->
<distributionManagement>
    <repository>
        <!--和maven/settings.xml中server中的id一致，表示使用该id对应的用户名和密码-->
        <id>itheima-release</id>
         <!--release版本上传仓库的具体地址-->
        <url>http://localhost:8081/repository/itheima-release/</url>
    </repository>
    <snapshotRepository>
        <!--和maven/settings.xml中server中的id一致，表示使用该id对应的用户名和密码-->
        <id>itheima-snapshot</id>
        <!--snapshot版本上传仓库的具体地址-->
        <url>http://localhost:8081/repository/itheima-snapshot/</url>
    </snapshotRepository>
</distributionManagement>
```

**步骤2:发布资源到私服**

![image-20220607234444490](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607234444490.png)

或者执行Maven命令

```
mvn deploy
```

**注意:**

要发布的项目都需要配置`distributionManagement`标签，要么在自己的pom.xml中配置，要么在其父项目中配置，然后子项目中继承父项目即可。

发布成功，在私服中就能看到:

![image-20220607234453197](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607234453197.png)

现在发布是在itheima-snapshot仓库中，如果想发布到itheima-release仓库中就需要将项目pom.xml中的version修改成RELEASE即可。

如果想删除已经上传的资源，可以在界面上进行删除操作:

![image-20220607234501302](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607234501302.png)

如果私服中没有对应的jar，会去中央仓库下载，速度很慢。可以配置让私服去阿里云中下载依赖。

![image-20220607234507544](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220607234507544.png)

至此私服的搭建就已经完成，相对来说有点麻烦，但是步骤都比较固定，后期大家如果需要的话，就可以参考上面的步骤一步步完成搭建即可。