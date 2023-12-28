# Dubbo

## Dubbo入门

### 概念

*   Dubbo是阿里巴巴公司开源的一个高性能、轻量级的 Java RPC 框架
*   致力于提供高性能和透明化的 RPC 远程服务调用方案，以及 SOA 服务治理方案
*   官网：[http://dubbo.apache.org](http://dubbo.apache.org/)
*   **节点角色说明：**
    *   Provider：暴露服务的服务提供方
    *   Container：服务运行容器
    *   Consumer：调用远程服务的服务消费方
    *   Registry：服务注册与发现的注册中心
    *   Monitor：统计服务的调用次数和调用时间的监控中心

​		![image-20220927124919261](http://minio.botuer.com/study-node/old/image-20220927124919261.png)

### 实现步骤

#### 工程架构

根据 dubbo《服务化最佳实践》

*   分包

    > 建议将服务接口，服务模型，服务异常等均放在 API 包中，因为服务模型及异常也是 API 的一部分，同时，这样做也符合分包原则：重用发布等价原则(REP)，共同重用原则(CRP)
    >
    > 如果需要，也可以考虑在 API 包中放置一份 spring 的引用配置，这样使用方，只需在 spring 加载过程中引用此配置即可，配置建议放在模块的包目录下，以免冲突，如：com/alibaba/china/xxx/dubbo-reference.xml

*   粒度

    > 服务接口尽可能大粒度，每个服务方法应代表一个功能，而不是某功能的一个步骤，否则将面临分布式事务问题，Dubbo 暂未提供分布式事务支持
    >
    > 服务接口建议以业务场景为单位划分，并对相近业务做抽象，防止接口数量爆炸
    >
    > 不建议使用过于抽象的通用接口，如：Map query(Map)，这样的接口没有明确语义，会给后期维护带来不便

#### 创建模块

*   公共接口层Interface模块（model，service，exception…）

    > 定义公共接口，公共依赖

*   服务提供者Provider模块

    > 引入公共依赖
    >
    > 实现被需要的接口 -- 为消费者提供服务

*   服务消费者Consumer模块

    > 引入公共依赖
    >
    > 调用提供者模块 -- Controller 远程调用 Provider ServiceImpl 提供的服务

    现在为止该无法实现远程调用

    <hr>

#### 使用dubbo

*   Provider模块引入dubbo、zookeeper

    *   dubbo --- dubbo - com.alibaba

    *   zookeeper

        *   dubbo 2.6以前的版本引入zkclient操作zookeeper  --- zkclient - com.101tec
        *   dubbo 2.6及以后的版本引入curator操作zookeeper --- curator-framework - org.apache.curator

    *   配置提供者

        ```xml
        <!--当前应用的名字  -->
        <dubbo:application name="gmall-user"></dubbo:application>
        <!--指定注册中心的地址  -->
        <dubbo:registry address="zookeeper://118.24.44.169:2181" />
        <!--使用dubbo协议，将服务暴露在20880端口  -->
        <dubbo:protocol name="dubbo" port="20880" />
        <!-- 指定需要暴露的服务 -->
        <dubbo:service interface="com.atguigu.gmall.service.UserService" ref="userServiceImpl" />
        ```

    *   启动服务

        ```java
        public static void main(String[] args) throws IOException {
        	ClassPathXmlApplicationContext context = 
        			new ClassPathXmlApplicationContext("classpath:spring-beans.xml");
        	
        	System.in.read(); 
        }
        ```

*   Consumer模块引入dubbo、zookeeper

    *   依赖同上

    *   配置消费者

        ```xml
        <!-- 应用名 -->
        <dubbo:application name="gmall-order-web"></dubbo:application>
        <!-- 指定注册中心地址 -->
        <dubbo:registry address="zookeeper://118.24.44.169:2181" />
        <!-- 生成远程服务代理，使得可以和本地bean一样使用demoService -->
        <dubbo:reference id="userService" interface="com.atguigu.gmall.service.UserService"></dubbo:reference>
        ```

    *   调用

#### **注解开发**

*   配置文件 --- 提供方

    ```xml
    <!--当前应用的名字  -->
    <!--指定注册中心的地址  -->
    <!--使用dubbo协议，将服务暴露在20880端口  -->

    <!--需要暴露的实现类加上dubbo的@Service注解，但需要包扫描  -->
    <dubbo:annotation package="com.atguigu.gmall.user.impl"/>
    ```

*   配置文件 --- 消费方

    ```xml
    <!--当前应用的名字  -->
    <!--指定注册中心的地址  -->
    <!--使用dubbo提供的reference注解引用远程服务，但需要包扫描  -->
    <dubbo:annotation package="com.atguigu.gmall.order.controller"/>
    ```

### 整合SpringBoot

*   引入依赖

    *   注意starter版本适配
    *   dubbo-spring-boot-starter  --- com.alibaba.boot

*   配置文件

    ```properties
    dubbo.application.name=gmall-user			#当前服务名
    dubbo.registry.protocol=zookeeper			#注册中心协议
    dubbo.registry.address=192.168.67.159:2181	#注册中心地址
    dubbo.scan.base-package=com.atguigu.gmall	#包扫描
    dubbo.protocol.name=dubbo					#dubbo协议
    ```

    ```properties
    dubbo.application.name=gmall-order-web		#当前服务名
    dubbo.registry.protocol=zookeeper			#注册中心协议
    dubbo.registry.address=192.168.67.159:2181	#注册中心地址
    dubbo.scan.base-package=com.atguigu.gmall	#包扫描
    dubbo.protocol.name=dubbo					#dubbo协议
    ```

*   注解

    ```java
    @Service		//暴露接口实现类
    @Reference		//引用远程服务
    @EnableDubbo	//可代替配置文件中的包扫描
    ```

## Dubbo高可用特性 & 配置

### 传输

*   **两个机器传输数据，如何传输Java对象？**
    *   dubbo 内部已经将**序列化和反序列化**的过程内部封装了
    *   我们只需要在定义pojo类时实现Serializable接口即可
    *   一般会**定义一个公共的pojo模块，让生产者和消费者都依赖该模块**

### 超时与重试

*   服务消费者在调用服务**提供者**的时候发生了**阻塞**、等待的情形，这个时候，服务**消费者**会**一直等待**下去

*   在某个峰值时刻，大量的请求都在同时请求服务消费者，会造成线程的大量堆积，势必会造成雪崩

*   dubbo 利用**超时机制**来解决这个问题，设置一个超时时间，在这个时间段内，**无法完成服务访问，则自动断开连接**
    *   使用timeout属性配置超时时间，**默认值1000**，单位毫秒
    *   设置了超时时间，在这个时间段内，无法完成服务访问，则自动断开连接
    *   如果出现网络抖动，则这一次请求就会失败
    *   Dubbo 提供**重试机制**来避免类似问题的发生
    *   通过 retries  属性来设置重试次数。**默认为 2 次**

*   重试配置

    ```xml
    <dubbo:service retries="2" />
    或
    <dubbo:reference retries="2" />
    或
    <dubbo:reference>
        <dubbo:method name="findFoo" retries="2" />
    </dubbo:reference>
    ```

*   超时时间配置 --- 消费者与提供者不同

    ```xml
    <!--全局超时配置-->
    <dubbo:consumer timeout="5000" />

    <!--指定接口以及特定方法超时配置-->
    <dubbo:reference interface="com.foo.BarService" timeout="2000">
        <dubbo:method name="sayHello" timeout="3000" />
    </dubbo:reference>
    ```

    ```xml
    <!--全局超时配置-->
    <dubbo:provider timeout="5000" />

    <!--指定接口以及特定方法超时配置-->
    <dubbo:provider interface="com.foo.BarService" timeout="2000">
        <dubbo:method name="sayHello" timeout="3000" />
    </dubbo:provider>
    ```

### 多版本

*   **灰度发布**：当出现新功能时，会让一部分用户先使用新功能，用户反馈没问题时，再将所有用户迁移到新功能

*   dubbo 中使用version 属性来设置和调用同一个接口的不同版本

*   负载均衡策略（4种） ：

    *   Random ：按权重随机，默认值。按权重设置随机概率

    *   RoundRobin ：按权重轮询

    *   LeastActive：最少活跃调用数，相同活跃数的随机

    *   ConsistentHash：一致性 Hash，相同参数的请求总是发到同一提供者

*   版本号配置

    ```xml
    <!--老版本服务提供者配置-->
    <dubbo:service interface="com.foo.BarService" version="1.0.0" />

    <!--新版本服务提供者配置-->
    <dubbo:service interface="com.foo.BarService" version="2.0.0" />

    <!--老版本服务消费者配置-->
    <dubbo:reference id="barService" interface="com.foo.BarService" version="1.0.0" />

    <!--新版本服务消费者配置-->
    <dubbo:reference id="barService" interface="com.foo.BarService" version="2.0.0" />

    <!--如果不需要区分版本，可以按照以下的方式配置-->
    <dubbo:reference id="barService" interface="com.foo.BarService" version="*" />
    ```

### 注册中心宕机

*   **注册中心挂了，服务是否可以正常访问？**

    > *   可以
    > *   监控中心宕掉不影响使用，只是丢失部分采样数据
    > *   数据库宕掉后，注册中心仍能通过缓存提供服务列表查询，但不能注册新服务
    > *   注册中心对等集群，任意一台宕掉后，将自动切换到另一台
    > *   dubbo服务消费者在第一次调用时，会将**服务提供方地址缓存到本地**，以后在调用则**不会访问注册中心**，**注册中心全部宕掉后，服务提供者和服务消费者仍能通过本地缓存通讯**
    > *   服务提供者无状态，任意一台宕掉后，不影响使用，当服务提供者地址发生**变化**时，注册中心会**通知**服务消费者
    > *   服务提供者全部宕掉后，服务消费者应用将无法使用，并无限次重连等待服务提供者恢复

### 负载均衡

*   **Random LoadBalance**

    随机，按权重设置随机概率

    在一个截面上碰撞的概率高，但调用量越大分布越均匀，而且按概率使用权重后也比较均匀，有利于动态调整提供者权重

*   **RoundRobin LoadBalance**

    轮循，按公约后的权重设置轮循比率

    存在慢的提供者累积请求的问题，比如：第二台机器很慢，但没挂，当请求调到第二台时就卡在那，久而久之，所有请求都卡在调到第二台上

*   **LeastActive LoadBalance**

    最少活跃调用数，相同活跃数的随机，活跃数指调用前后计数差

    使慢的提供者收到更少请求，因为越慢的提供者的调用前后计数差会越大

*   **ConsistentHash LoadBalance**

    一致性 Hash，相同参数的请求总是发到同一提供者

    当某一台提供者挂时，原本发往该提供者的请求，基于虚拟节点，平摊到其它提供者，不会引起剧烈变动。算法参见：<http://en.wikipedia.org/wiki/Consistent_hashing>

    ```xml
    <!--缺省只对第一个参数 Hash，如果要修改，请配置 -->
    <dubbo:parameter key="hash.arguments" value="0,1" />
    <!--缺省用 160 份虚拟节点，如果要修改，请配置-->
     <dubbo:parameter key="hash.nodes" value="320" />
    ```

### 服务降级

*   **当服务器压力剧增的情况下，根据实际业务情况及流量，对一些服务和页面有策略的不处理或换种简单的方式处理，从而释放服务器资源以保证核心交易正常运作或高效运作。**

*   可以通过服务降级功能临时屏蔽某个出错的非关键服务，并定义降级后的返回策略

*   向注册中心写入动态配置覆盖规则

    *   mock=force\:return+null 表示消费方对该服务的方法调用都直接返回 null 值，不发起远程调用。用来屏蔽不重要服务不可用时对调用方的影响
    *   还可以改为 mock=fail\:return+null 表示消费方对该服务的方法调用在失败后，再返回 null 值，不抛异常。用来容忍不重要服务不稳定时对调用方的影响

    ```java
    RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
    Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
    registry.register(URL.valueOf("override://0.0.0.0/com.foo.BarService?category=configurators&dynamic=false&application=foo&mock=force:return+null"));
    ```

### 集群容错

*   在集群调用失败时，Dubbo 提供了多种容错方案，缺省为 failover 重试

*   集群容错模式

    *   **Failover Cluster**

        失败自动切换，当出现失败，重试其它服务器。通常用于读操作，但重试会带来更长延迟。可通过 retries="2" 来设置重试次数(不含第一次)

    *   **Failfast Cluster**

        快速失败，只发起一次调用，失败立即报错。通常用于非幂等性的写操作，比如新增记录

    *   **Failsafe Cluster**

        失败安全，出现异常时，直接忽略。通常用于写入审计日志等操作

    *   **Failback Cluster**

        失败自动恢复，后台记录失败请求，定时重发。通常用于消息通知操作

    *   **Forking Cluster**

        并行调用多个服务器，只要一个成功即返回。通常用于实时性要求较高的读操作，但需要浪费更多服务资源。可通过 forks="2" 来设置最大并行数

    *   **Broadcast Cluster**

        广播调用所有提供者，逐个调用，任意一台报错则报错 \[2]。通常用于通知所有提供者更新缓存或日志等本地资源信息

*   按照以下示例在服务提供方和消费方配置集群模式

    ```xml
    <dubbo:service cluster="failsafe" />
    或
    <dubbo:reference cluster="failsafe" />
    ```

### 整合hystrix

*   Hystrix 旨在通过控制那些访问远程系统、服务和第三方库的节点，从而对延迟和故障提供更强大的容错能力。Hystrix具备拥有回退机制和断路器功能的线程和信号隔离，请求缓存和请求打包，以及监控和配置等功能

*   配置spring-cloud-starter-netflix-hystrix

    *   spring boot官方提供了对hystrix的集成，直接在pom.xml里加入依赖

        ```xml
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
            <version>1.4.4.RELEASE</version>
        </dependency>
        ```

    *   然后在Application类上增加@EnableHystrix来启用hystrix starter

        ```java
        @SpringBootApplication
        @EnableHystrix
        public class ProviderApplication {
        }
        ```

*   配置Provider端

    *   在Dubbo的Provider上增加@HystrixCommand配置，这样子调用就会经过Hystrix代理

        ```java
        @Service(version = "1.0.0")
        public class HelloServiceImpl implements HelloService {
            @HystrixCommand(commandProperties = {
             @HystrixProperty(name = "circuitBreaker.requestVolumeThreshold", value = "10"),
             @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "2000") })
            @Override
            public String sayHello(String name) {
                // System.out.println("async provider received: " + name);
                // return "annotation: hello, " + name;
                throw new RuntimeException("Exception to show hystrix enabled.");
            }
        }
        ```

*   配置Consumer端

    *   对于Consumer端，则可以增加一层method调用，并在method上配置@HystrixCommand。当调用出错时，会走到fallbackMethod = "reliable"的调用里

        ```java
        @Reference(version = "1.0.0")
        private HelloService demoService;

        @HystrixCommand(fallbackMethod = "reliable")
        public String doSayHello(String name) {
            return demoService.sayHello(name);
        }
        public String reliable(String name) {
            return "hystrix fallback value";
        }
        ```

### 配置的优先级

*   JVM 启动 -D 参数优先，这样可以使用户在部署和启动时进行参数重写，比如在启动时需改变协议的端口 -Ddubbo.protocol.port=20880
*   XML 次之，如果在 XML 中有配置，则 dubbo.properties 中的相应配置项无效
*   Properties 最后，相当于缺省值，只有 XML 没有配置时，dubbo.properties 的相应配置项才会生效，通常用于共享公共配置，比如应用名

### 重试次数配置原则

*   dubbo推荐在Provider上尽量多配置Consumer端属性

    *   作服务的提供者，比服务使用方更清楚服务性能参数，如调用的超时时间，合理的重试次数，等

    *   在Provider配置后，Consumer不配置则会使用Provider的配置值，即Provider配置可以作为Consumer的缺省值。否则，Consumer会使用Consumer端的全局设置，这对于Provider不可控的，并且往往是不合理的

*   配置的**覆盖规则**

    *   方法级别配置优于接口级别，即小Scope优先

    *   Consumer端配置 优于 Provider配置 优于 全局配置

    *   最后是Dubbo Hard Code的配置值（见配置文档）

        ![image-20220927140801620](http://minio.botuer.com/study-node/old/image-20220927140801620.png)

## Dubbo原理

### RPC原理

一次完整的RPC调用流程（同步调用，异步另说）如下：

**1**）服务消费方（client\*\*\*\*）调用以本地调用方式调用服务；

2）client stub接收到调用后负责将方法、参数等组装成能够进行网络传输的消息体；

3）client stub找到服务地址，并将消息发送到服务端；

4）server stub收到消息后进行解码；

5）server stub根据解码结果调用本地的服务；

6）本地服务执行并将结果返回给server stub；

7）server stub将返回结果打包成消息并发送至消费方；

8）client stub接收到消息，并进行解码；

**9**）服务消费方得到最终结果。

RPC框架的目标就是要2\~8这些步骤都封装起来，这些细节对用户来说是透明的，不可见的

![image-20220927180000766](http://minio.botuer.com/study-node/old/image-20220927180000766.png)

### Netty通信原理

Netty是一个异步事件驱动的网络应用程序框架， 用于快速开发可维护的高性能协议服务器和客户端。它极大地简化并简化了TCP和UDP套接字服务器等网络编程

*   BIO：(Blocking IO)

    ![image-20220927180158704](http://minio.botuer.com/study-node/old/image-20220927180158704.png)

*   NIO (Non-Blocking IO)

    ![image-20220927180224713](http://minio.botuer.com/study-node/old/image-20220927180224713.png)

*   Selector 一般称 为**选择器** ，也可以翻译为 **多路复用器，**

*   Connect（连接就绪）、Accept（接受就绪）、Read（读就绪）、Write（写就绪）

*   Netty基本原理

    ![image-20220927180304855](http://minio.botuer.com/study-node/old/image-20220927180304855.png)

### Dubbo原理

#### 框架设计

![image-20220927180346964](http://minio.botuer.com/study-node/old/image-20220927180346964.png)

*   config 配置层：对外配置接口，以 ServiceConfig, ReferenceConfig 为中心，可以直接初始化配置类，也可以通过 spring 解析配置生成配置类
*   proxy 服务代理层：服务接口透明代理，生成服务的客户端 Stub 和服务器端 Skeleton, 以 ServiceProxy 为中心，扩展接口为 ProxyFactory
*   registry 注册中心层：封装服务地址的注册与发现，以服务 URL 为中心，扩展接口为 RegistryFactory, Registry, RegistryService
*   cluster 路由层：封装多个提供者的路由及负载均衡，并桥接注册中心，以 Invoker 为中心，扩展接口为 Cluster, Directory, Router, LoadBalance
*   monitor 监控层：RPC 调用次数和调用时间监控，以 Statistics 为中心，扩展接口为 MonitorFactory, Monitor, MonitorService
*   protocol 远程调用层：封装 RPC 调用，以 Invocation, Result 为中心，扩展接口为 Protocol, Invoker, Exporter
*   exchange 信息交换层：封装请求响应模式，同步转异步，以 Request, Response 为中心，扩展接口为 Exchanger, ExchangeChannel, ExchangeClient, ExchangeServer
*   transport 网络传输层：抽象 mina 和 netty 为统一接口，以 Message 为中心，扩展接口为 Channel, Transporter, Client, Server, Codec
*   serialize 数据序列化层：可复用的一些工具，扩展接口为 Serialization, ObjectInput, ObjectOutput, ThreadPool

#### 启动解析、加载配置信息

![image-20220927180501790](http://minio.botuer.com/study-node/old/image-20220927180501790.png)

#### 服务暴露

![image-20220927180528440](http://minio.botuer.com/study-node/old/image-20220927180528440.png)

#### 服务引用

![image-20220927180542812](http://minio.botuer.com/study-node/old/image-20220927180542812.png)

#### 服务调用

![image-20220927180602889](http://minio.botuer.com/study-node/old/image-20220927180602889.png)

## SpringBoot整合Dubbo、zookeeper

### API模块

```java
package com.botuer.shop.service;
public interface IUserService {
	String sayHello(String name);
}
```

### 提供者模块

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.0.1.RELEASE</version>
</parent>
<dependencies>
    <!--dubbo-->
    <dependency>
        <groupId>com.alibaba.spring.boot</groupId>
        <artifactId>dubbo-spring-boot-starter</artifactId>
        <version>2.0.0</version>
    </dependency>
	<!--spring-boot-stater-->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
        <exclusions>
            <exclusion>
                <artifactId>log4j-to-slf4j</artifactId>
                <groupId>org.apache.logging.log4j</groupId>
            </exclusion>
        </exclusions>
    </dependency>
	<!--zookeeper服务端-->
    <dependency>
        <groupId>org.apache.zookeeper</groupId>
        <artifactId>zookeeper</artifactId>
        <version>3.4.10</version>
        <exclusions>
            <exclusion>
                <groupId>org.slf4j</groupId>
                <artifactId>slf4j-log4j12</artifactId>
            </exclusion>
            <exclusion>
                <groupId>log4j</groupId>
                <artifactId>log4j</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
	<!--zookeeper客户端-->
    <dependency>
        <groupId>com.101tec</groupId>
        <artifactId>zkclient</artifactId>
        <version>0.9</version>
        <exclusions>
            <exclusion>
                <artifactId>slf4j-log4j12</artifactId>
                <groupId>org.slf4j</groupId>
            </exclusion>
        </exclusions>
    </dependency>
  	<!--API-->
    <dependency>
        <groupId>org.example</groupId>
        <artifactId>interface</artifactId>
        <version>1.0-SNAPSHOT</version>
    </dependency>
</dependencies>
```

```properties
## application.properties
spring.application.name=dubbo-demo-provider
spring.dubbo.application.id=dubbo-demo-provider
spring.dubbo.application.name=dubbo-demo-provider
spring.dubbo.registry.address=zookeeper://192.168.10.103:2181;zookeeper://192.168.10.103:2182;zookeeper://192.168.10.103:2183
spring.dubbo.server=true
spring.dubbo.protocol.name=dubbo
spring.dubbo.protocol.port=20880
```

```java
//启动类
@SpringBootApplication
@EnableDubboConfiguration
public class ProviderBootStrap {
	public static void main(String[] args) {
		SpringApplication.run(ProviderBootStrap.class);
	}
}
```

```java
//实现API
package com.botuer.shop.service.impl;
@Component																		//spring的Service
@Service(interfaceClass = IUserService.class) //dubbo的Service
public class UserServiceImpl implements IUserService{
	@Override
	public String sayHello(String name) {
		return "hello " + name;
	}
}
```

### 消费者模块

```xml
<!--依赖和提供者大致相同，多一个web-->
<packaging>war</packaging>

<dependencies>
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-web</artifactId>
   </dependency>
  ...
  ...
  ...
</dependencies>
```

```properties
#application.properties
spring.application.name=dubbo-demo-consumer
spring.dubbo.application.name=dubbo-demo-consumer
spring.dubbo.application.id=dubbo-demo-consumer
spring.dubbo.registry.address=zookeeper://192.168.10.103:2181;zookeeper://192.168.10.103:2182;zookeeper://192.168.10.103:2183
```

```java
//启动类
@SpringBootApplication
@EnableDubboConfiguration
public class ConsumerBootStrap {
	public static void main(String[] args) {
		SpringApplication.run(ConsumerBootStrap.class);
	}
}
```

```java
//控制层，远程调用提供者实现类
@RestController
@RequestMapping("/user")
public class UserController {
	@Reference
	private IUserService userService;

	@RequestMapping("/sayHello")
	public String sayHello(String name){
		return userService.sayHello(name);
	}
}
```

*   访问：<http://localhost:8080/user/sayHello?name=张三>

