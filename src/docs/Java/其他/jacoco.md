# Jacoco

## 原理

> Jacoco是一个开源的覆盖率统计工具，它针对的开发语言是java，其使用方法很灵活，可以嵌入到
>
> Ant、Maven中；可以作为Eclipse、IDEA插件，可以使用其JavaAgent技术监控Java程序
>
> 很多第三方的工具提供了对Jacoco的集成，如sonar、Jenkins等

**原理**：Jacoco使用ASM技术修改字节码方法，可以修改Jar文件、class文件字节码文件。

> ASM是一个Java字节码操纵框架，它能被用来动态生成类或者增强既有类的功能。ASM可以直接产生二进制class文件，也可以在类被加载入Java虚拟机之前动态改变类行为。Java class被存储在严格格式定义的.class文件里，这些类文件拥有足够的元数据来解析类中的所有元素：类名称、方法、属性以及Java 字节码（指令）。ASM从类文件中读入信息后，能够改变类行为，分析类信息，甚至能够根据用户要求生成新类

插桩方式

- Offline插桩

  > 在测试前先对Class文件进行插桩（探针），然后生成插过桩的class或jar包(目标文件)，执行目标文件以后得到覆盖执行结果，最终生成覆盖率报告，Offline插桩方式主要用于单测，集成测试等静态场景

- On The Fly插桩

  > java启动时添加 -javaagent 参数指定特定的jar文件启动代理程序，代理程序再通过自定义classloader实现自己的类装载策略，在类加载之前将探针插入class文件中
  >
  > 更加方便的获取代码覆盖率，无需提前进行字节码插桩，可以实时获取代码覆盖率信息
  >
  > 主要用于服务化系统的代码动态覆盖率获取
  >
  > > JaCoCo代理收集执行信息并根据请求或在JVM退出时将其转储。有三种不同的执行数据输出模式：
  > >
  > > - 文件系统：在JVM终止时，执行数据被写入本地文件。
  > >
  > > - TCP套接字服务器：外部工具可以连接到JVM，并通过套接字连接检索执行数据。可以在VM退出时进行可选的执行数据重置和执行数据转储。
  > >
  > > - TCP套接字客户端：启动时，JaCoCo代理连接到给定的TCP端点。执行数据根据请求写入套接字连接。可以在VM退出时进行可选的执行数据重置和执行数据转储

- 比较

  > On-the-fly模式更方便简单进行代码覆盖分析，无需提前进行字节码插桩，无需考虑classpath 的设置，存在如下情况不适合on-the-fly，需要采用offline提前对字节码插桩：
  >
  > (1) 运行环境不支持java agent
  >
  > (2) 部署环境不允许设置JVM参数
  >
  > (3) 字节码需要被转换成其他的虚拟机如Android Dalvik VM
  >
  > (4) 动态修改字节码过程中和其他agent冲突
  >
  > (5) 无法自定义用户加载类

## 参数说明

```shell
java -javaagent:target/classes/jacocoagent.jar=includes=**/controller/**,output=tcpserver,append=true,address=localhost,port=6200 -jar target/jacoco-code-coverage-0.0.1-SNAPSHOT.jar
```

- includes --- 包含的待测类、包
- excludes --- 排除的类、包
- output --- 输出方式
  - file --- 停止服务后本地生成
  - tcpserver --- 以服务的形式生成
  - tcpclient
- append --- true则覆盖已有的exec文件
- destfile --- exec文件位置，默认为当前目录jacoco.exec
- address --- 绑定tcpserver 时的ip
- port --- 绑定tcpserver 时的端口，默认6300
- classdumpdir --- 相对于代理程序看到的所有类文件转储到的工作目录的位置。这对于调试目的或在动态创建的类（例如使用脚本引擎时）非常有用

## mvn集成

- file --- mvn插件

```xml
<plugins>
    <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
    <!--设置测试失败忽略-->
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <configuration>
            <skipTests>false</skipTests>
            <testFailureIgnore>true</testFailureIgnore>
        </configuration>
    </plugin>

    <!-- 需要在存放测试类模块（通常是web模块）下的pom.xml中，并且在<build>标签下加入以下插件配置：jacoco maven 插件配置 -->
    <plugin>
        <groupId>org.jacoco</groupId>
        <artifactId>jacoco-maven-plugin</artifactId>
        <version>0.8.8</version>
        <configuration>
            <!--这里配置需要扫描的路径，可使用正则-->
            <includes>
                <include>**/controller/**</include>
            </includes>
            <excludes>
                <!-- 这里配置我们想要排除的包路径 -->
                <!--                        <exclude>com/rcplatform/athena/shorturl/models/*</exclude>-->
                <!-- 通过通配符来排除指定格式的类 -->
                <!-- <exclude>**/*ShortUrl.class</exclude>-->
                <!-- <exclude>**/*ShortUrlVisit.class</exclude>-->
            </excludes>
        </configuration>

        <executions>
            <!--配置覆盖率报告汇总，执行maven：test模块后进行汇总报告数据-->
            <execution>
                <id>prepare-agent</id>
                <goals>
                    <goal>prepare-agent</goal>
                </goals>
            </execution>
            <execution>
                <id>report</id>
                <phase>prepare-package</phase>
                <goals>
                    <goal>report</goal>
                </goals>
            </execution>

            <!--配置覆盖率报告汇总，执行maven：test模块后进行汇总报告数据-->
            <execution>
                <id>post-unit-test</id>
                <phase>test</phase>
                <goals>
                    <!--如果是多模块项目，以下配置表示生成的报表示不按项目模块进行划分，报表明细-->
                    <goal>report</goal>
                    <!--如果是多模块项目，以下配置表示生成的报表示可以按项目模块进行划分，即报表汇总-->
                    <goal>report-aggregate</goal>
                </goals>
                <configuration>
                    <dataFile>target/jacoco.exec</dataFile>
                    <outputDirctory>target/jacoco.exec</outputDirctory>
                </configuration>
            </execution>
        </executions>
    </plugin>
</plugins>
```

## tcpserver脚本

```sh
mkdir -p /export/home/jacoco
cd /export/home/jacoco && wget "http://storage.jd.local/bpp-quality-public/code_coverage_statistics/jacoco-0.8.7-20210115.151120-42.tar.gz"
tar -xzvf /export/home/jacoco/jacoco-0.8.7-20210115.151120-42.tar.gz
```

```sh
ip=$(/sbin/ip a | grep "inet " |grep -v "127.0.0.1" | awk '{print $2}' | awk -F/ '{print $1}')
export JAVA_OPTS="-javaagent:/export/home/jacoco/jacoco-0.8.7-20210115.151120-42/lib/jacocoagent.jar=includes=*,output=tcpserver,append=true,port=6200,address='${ip}'"
```

```sh
cd 工程目录

java -jar /export/home/jacoco/jacoco-0.8.7-20210115.151120-42/lib/jacococli.jar dump --address ${ip} --port 6200 --destfile target/jacoco-demo.exec

java -jar /export/home/jacoco/jacoco-0.8.7-20210115.151120-42/lib/jacococli.jar report target/jacoco-demo.exec --classfiles target/classes/com  --sourcefiles src/main/java --html target/report --xml target/report.xml
```

## 参考文档

https://www.cnblogs.com/liuyitan/p/15716027.html

https://blog.csdn.net/Michaelwubo/article/details/121142621

https://www.jianshu.com/p/98a17fa6b853