---
isOriginal: true
category: 运维
tag: 
  - Maven
  - 依赖
---
# Maven高级


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

## 属性

问题：更新某一技术版本需要改很多依赖，容易发生遗漏导致程序问题

解决

- maven的属性

  

- maven属性管理maven属性

  - 父模块定义属性：`<properties>`中添加`<***.version>`

  - 依赖的version引用`${***.version}`

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

  

## 跳过测试

对于`test`来说有它存在的意义，

* 可以确保每次打包或者安装的时候，程序的正确性，假如测试已经通过在我们没有修改程序的前提下再次执行打包或安装命令，由于顺序执行，测试会被再次执行，就有点耗费时间了。
* 功能开发过程中有部分模块还没有开发完毕，测试无法通过，但是想要把其中某一部分进行快速打包，此时由于测试环境失败就会导致打包失败。

方式一：idea中跳过

- 图中的按钮为`Toggle 'Skip Tests' Mode`,
- Toggle翻译为切换的意思，也就是说在测试与不测试之间进行切换。



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

