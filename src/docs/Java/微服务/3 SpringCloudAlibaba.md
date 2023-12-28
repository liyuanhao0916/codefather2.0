# SpringCloudAlibaba



## nacos

### 注册中心

#### 使用

*   bin目录下进入cmd，输入     默认是集群模式，需要改为standalone单机模式

    ```cmd
    startup.cmd -m standalone
    ```

    mac在终端中进入bin目录，输入

    ```cmd
    sh startup.sh -m standalone
    ```

*   mac关闭不彻底时，需要杀死进程

    ```shell
    lsof -i:8848
    kill -9 PID  #上面查出的进程号
    ```

*   访问 ： <http://127.0.0.1:8848/nacos>

    *   ，默认端口号8848，可在application.properties中修改

*   账号密码都是nacos

*   依赖

    *   父工程，依赖管理中添加

        ```xml
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-dependencies</artifactId>
            <version>2.2.5.RELEASE</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        ```

    *   客户端 --- 服务提供者

        ```xml
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
        ```

*   配置nacos地址 --- 服务提供者

    ```yaml
    spring:
      cloud:
        nacos:
          server-addr: localhost:8848
    ```

    **如果nacos注册中心不显示，就是没有配置spring.application.name**

#### 服务分级存储模型

集群：一个服务可以有多个实例，每个实例可以位于不同机房，Nacos就将同一机房内的实例 划分为一个**集群**

访问时尽可能访问同集群实例，速度更快，本集群访问不到，再访问其他集群

*   配置集群 --- 服务提供者

    ```yaml
    spring:
      cloud:
        nacos:
          server-addr: localhost:8848
          discovery:
            cluster-name: HZ ## 集群名称
    ```

*   复制一个 “copy configuration”   在VM options中配置：-Dspring.cloud.nacos.discovery.cluster-name=\*\*

*   同集群有限的负载均衡

    默认的`ZoneAvoidanceRule`并不能实现根据同集群优先来实现负载均衡。

    因此Nacos中提供了一个`NacosRule`的实现，可以优先从同集群中挑选实例。

    *   给服务消费者配置集群信息，并修改负载均衡规则

        ```yaml
        spring:
          cloud:
            nacos:
              server-addr: localhost:8848
              discovery:
                cluster-name: HZ ## 集群名称
                
        userservice:
          ribbon:
            NFLoadBalancerRuleClassName: com.alibaba.cloud.nacos.ribbon.NacosRule ## 负载均衡规则         
        ```

#### 权重配置

性能有好有坏，在nacos控制台，在服务提供者的实例列表中，点击编辑，即可修改权重，改为0永远不会被访问

#### 环境隔离

Nacos提供了namespace来实现环境隔离功能。

*   nacos中可以有多个namespace
*   namespace下可以有group、service等
*   Namespace > group"集群" > service
*   不同namespace之间相互隔离，例如不同namespace的服务互相不可见
*   **环境隔离用于多环境配置**

使用

*   默认情况下，所有service、data、group都在同一个namespace，名为public：即未隔离

*   创建namespace，填写表单

*   微服务配置namespace

    *   namespace写自动生成的id
    *   配置后，不能再向其他namespace访问资源

    ```yaml
    spring:
      cloud:
        nacos:
          server-addr: localhost:8848
          discovery:
            cluster-name: HZ
            namespace: 492a7d5d-237b-46a1-a99a-fa8e98e4b0f9 ## 命名空间，填ID
    ```

#### Nacos和Eureka的区别

Nacos的服务实例分为两种l类型：

*   临时实例：如果实例宕机超过一定时间，会从服务列表剔除，默认的类型。

*   非临时实例：如果实例宕机，不会从服务列表剔除，也可以叫永久实例。

配置一个服务实例为永久实例：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: false ## 设置为非临时实例
```

Nacos和Eureka整体结构类似，服务注册、服务拉取、心跳等待，但是也存在一些差异：

*   Nacos与eureka的共同点
    *   都支持服务注册和服务拉取
    *   都支持服务提供者心跳方式做健康检测
*   Nacos与Eureka的区别
    *   Nacos支持服务端主动检测提供者状态：**临时实例采用心跳模式，非临时实例采用主动检测模式**
    *   临时实例心跳不正常会被剔除，**非临时实例则不会被剔除**
    *   Nacos支持服务列表**变更的消息推送模式，服务列表更新更及时**
    *   Nacos集群默认采用AP方式，当集群中存在非临时实例时，采用CP模式；Eureka采用AP方式

### nacos配置中心

#### 统一配置管理

*   问题：一个一个实例部署太麻烦，也容易出错

*   解决：nacos配置中心

*   步骤

    *   填写表单

        *   Data ID：服务名称-环境.后缀（userservice-dev.yaml）
        *   Group:分组默认即可
        *   配置格式：yaml
        *   配置内容：需要热更新的配置，一般为开关类的配置

    *   引入依赖

        ```xml
        <!--nacos配置管理依赖-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
        </dependency>
        ```

    *   添加bootstrap.yml

        *   比application.yml优先级高

        ```yaml
        spring:
          application:
            name: userservice ## 服务名称
          profiles:
            active: dev #开发环境，这里是dev 
          cloud:
            nacos:
              server-addr: localhost:8848 ## Nacos地址
              config:
                file-extension: yaml ## 文件后缀名
        ```

        这里会根据spring.cloud.nacos.server-addr获取nacos地址，再根据

        `${spring.application.name}-${spring.profiles.active}.${spring.cloud.nacos.config.file-extension}`作为文件id，来读取配置。

        本例中，就是去读取`userservice-dev.yaml`：

    *   读取nacos配置

        ```java
        @Slf4j
        @RestController
        @RequestMapping("/user")
        public class UserController {
        
            @Autowired
            private UserService userService;
        
            @Value("${pattern.dateformat}")
            private String dateformat;
            
            @GetMapping("now")
            public String now(){
                return LocalDateTime.now().format(DateTimeFormatter.ofPattern(dateformat));
            }
            // ...略
        }
        ```

#### 配置热更新

*   方式一：读取nacos配置类（即@Value所在类）上加注解@RefreshScope

*   方式二：

    *   在config包下，创建一个类读取配置中心的属性

        ```java
        @Component
        @Data
        @ConfigurationProperties(prefix = "pattern")
        public class PatternProperties {
            private String dateformat;
        }
        ```

    *   自动注入代替@Value

        ```java
        @Slf4j
        @RestController
        @RequestMapping("/user")
        public class UserController {
        
            @Autowired
            private UserService userService;
        
            @Autowired
            private PatternProperties patternProperties;
        
            @GetMapping("now")
            public String now(){
                return LocalDateTime.now().format(DateTimeFormatter.ofPattern(patternProperties.getDateformat()));
            }
        
            // 略
        }
        ```

#### 配置共享

配置管理中除了可以配置\[spring.application.name]-\[spring.profiles.active].yaml【服务名-环境.yaml】，

还可以配置\[spring.application.name].yaml【服务名.yaml】不包含环境，因此可以被多个环境共享

*   添加共享配置\[spring.application.name].yaml
*   读取nacos配置

配置的优先级：带环境的配置 > 共享的配置 > 本地配置

#### 多配置文件

```yml
spring:
  application:
    name: nacos-config-multi
  main:
    allow-bean-definition-overriding: true
  cloud:
    nacos:
      username: ${nacos.username}
      password: ${nacos.password}
      config:
        server-addr: ${nacos.server-addr}
        namespace: ${nacos.namespace}
        ## 用于共享的配置文件
        shared-configs:
          - data-id: common-mysql.yaml
            group: SPRING_CLOUD_EXAMPLE_GROUP
            
          - data-id: common-redis.yaml
            group: SPRING_CLOUD_EXAMPLE_GROUP
            
          - data-id: common-base.yaml
            group: SPRING_CLOUD_EXAMPLE_GROUP

        ## 常规配置文件,在 shared-configs 之后加载
        extension-configs:
          - data-id: nacos-config-advanced.yaml
            group: SPRING_CLOUD_EXAMPLE_GROUP
            refresh: true

          - data-id: nacos-config-base.yaml
            group: SPRING_CLOUD_EXAMPLE_GROUP
            refresh: true
```

#### 搭建集群

Nacos生产环境下一定要部署为集群状态

*   多个nacos部署在多个服务器上，ip不同，一台电脑模拟只需端口设置不同即可

*   初始化数据库官方推荐使用带有主从的高可用数据库集群

*   配置nacos：

    *   在cluster.conf“集群"文件中添加服务器的  ip：端口号

    *   修改application.properties，添加数据库配置

        ```properties
        spring.datasource.platform=mysql
        
        db.num=1
        
        db.url.0=jdbc:mysql://127.0.0.1:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
        db.user.0=root
        db.password.0=123
        ```

*   复制几份放到不同服务器（若一台电脑需要在application.properties改端口号server.port=\*\*）

*   分别启动

*   Nignx反向代理

    *   修改配置nginx.conf

        ```nginx
        upstream nacos-cluster {
          server 127.0.0.1:8845;
        	server 127.0.0.1:8846;
        	server 127.0.0.1:8847;
        }

        server {
            listen       80;
            server_name  localhost;

            location /nacos {
                proxy_pass http://nacos-cluster;
            }
        }
        ```

    *   浏览器访问     <http://localhost/nacos>

    *   代码中application.yml配置

        ```yaml
        spring:
          cloud:
            nacos:
              server-addr: localhost:80 ## Nacos地址
        ```

*   优化

    *   实际部署时，需要给做反向代理的nginx服务器设置一个域名，这样后续如果有服务器迁移nacos的客户端也无需更改配置.
    *   Nacos的各个节点应该部署到多个不同服务器，做好容灾和隔离

## Sentinel

### 概述

#### 雪崩问题

- 微服务中，服务间调用关系错综复杂，一个微服务往往依赖于多个其它微服务
- 如果服务提供者I发生了故障，当前的应用的部分业务因为依赖于服务I，因此也会被阻塞。此时，其它不依赖于服务I的业务似乎不受影响
- 但是，依赖服务I的业务请求被阻塞，用户不会得到响应，则tomcat的这个线程不会释放，于是越来越多的用户请求到来，越来越多的线程会阻塞
- 服务器支持的线程和并发数有限，请求一直阻塞，会导致服务器资源耗尽，从而导致所有其它服务都不可用，那么当前服务也就不可用了

- 依赖于当前服务的其它服务随着时间的推移，最终也都会变的不可用，形成级联失败，雪崩就发生了
- 解决方式
  - 超时处理：设定超时时间，请求超过一定时间没有响应就返回错误信息，不会无休止等待
  - 仓壁模式：我们可以限定每个业务能使用的线程数，避免耗尽整个tomcat的资源，因此也叫线程隔离
  - 断路器模式：由**断路器**统计业务执行的异常比例，如果超出阈值则会**熔断**该业务，拦截访问该业务的一切请求，当发现访问服务D的请求异常比例过高时，认为服务D有导致雪崩的风险，会拦截访问服务D的一切请求，形成熔断
  - **流量控制**：限制业务访问的QPS，避免服务因流量的突增而故障
- 总结
  - 雪崩：微服务之间相互调用，因为调用链中的一个服务故障，引起整个链路都无法访问的情况
  - **限流**是对服务的保护，避免因瞬间高并发流量而导致服务故障，进而避免雪崩。是一种**预防**措施
  - **超时处理、线程隔离、降级熔断**是在部分服务故障时，将故障控制在一定范围，避免雪崩。是一种**补救**措施
  - 造成雪崩的原因是多元的，限流只能预防一方面，但还有可能由于网络等问题造成阻塞，引发雪崩，所以都是搭配使用

#### 服务保护技术对比

在SpringCloud当中支持多种服务保护技术：

- [Netfix Hystrix](https://github.com/Netflix/Hystrix)
- [Sentinel](https://github.com/alibaba/Sentinel)
- [Resilience4J](https://github.com/resilience4j/resilience4j)

早期比较流行的是Hystrix框架，但目前国内实用最广泛的还是阿里巴巴的Sentinel框架，这里我们做下对比：

|                | **Sentinel**                                   | **Hystrix**                   |
| -------------- | ---------------------------------------------- | ----------------------------- |
| 隔离策略       | 信号量隔离                                     | 线程池隔离/信号量隔离         |
| 熔断降级策略   | 基于慢调用比例或异常比例                       | 基于失败比率                  |
| 实时指标实现   | 滑动窗口                                       | 滑动窗口（基于 RxJava）       |
| 规则配置       | 支持多种数据源                                 | 支持多种数据源                |
| 扩展性         | 多个扩展点                                     | 插件的形式                    |
| 基于注解的支持 | 支持                                           | 支持                          |
| 限流           | 基于 QPS，支持基于调用关系的限流               | 有限的支持                    |
| 流量整形       | 支持慢启动、匀速排队模式                       | 不支持                        |
| 系统自适应保护 | 支持                                           | 不支持                        |
| 控制台         | 开箱即用，可配置规则、查看秒级监控、机器发现等 | 不完善                        |
| 常见框架的适配 | Servlet、Spring Cloud、Dubbo、gRPC  等         | Servlet、Spring Cloud Netflix |

#### Sentinel

- 官网地址：https://sentinelguard.io/zh-cn/index.html
- 特征
  - **丰富的应用场景**：Sentinel 承接了阿里巴巴近 10 年的双十一大促流量的核心场景，例如秒杀（即突发流量控制在系统容量可以承受的范围）、消息削峰填谷、集群流量控制、实时熔断下游不可用应用等
  - **完备的实时监控**：Sentinel 同时提供实时的监控功能。您可以在控制台中看到接入应用的单台机器秒级数据，甚至 500 台以下规模的集群的汇总运行情况
  - **广泛的开源生态**：Sentinel 提供开箱即用的与其它开源框架/库的整合模块，例如与 Spring Cloud、Dubbo、gRPC 的整合。您只需要引入相应的依赖并进行简单的配置即可快速地接入 Sentinel
  - **完善的** **SPI** **扩展点**：Sentinel 提供简单易用、完善的 SPI 扩展接口。您可以通过实现扩展接口来快速地定制逻辑。例如定制规则管理、适配动态数据源等

#### 整合

- 依赖

  ```xml
  <!--sentinel-->
  <dependency>
      <groupId>com.alibaba.cloud</groupId> 
      <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
  </dependency>
  ```

- 配置

  修改application.yaml文件，添加下面内容：

  ```yaml
  server:
    port: 8088
  spring:
    cloud: 
      sentinel:
        transport:
          dashboard: localhost:8080
  ```

- 测试

  - 访问任意端点（controller），触发sentinel

### 流量控制

#### 簇点链路

- 当请求进入微服务时，首先会访问DispatcherServlet，然后进入Controller、Service、Mapper，这样的一个调用链就叫做**簇点链路**
- 簇点链路中被监控的每一个接口就是一个**资源**

- 默认情况下sentinel会监控SpringMVC的每一个端点（Endpoint，也就是controller中的方法），因此SpringMVC的每一个端点（Endpoint）就是调用链路中的一个资源

例如，我们刚才访问的order-service中的OrderController中的端点：/order/{orderId}

![image-20221027173304498](http://minio.botuer.com/study-node/old/image-20221027173304498.png)

- 流控、熔断等都是针对簇点链路中的资源来设置的，因此我们可以点击对应资源后面的按钮来设置规则

  - 流控：流量控制
  - 降级：降级熔断
  - 热点：热点参数限流，是限流的一种
  - 授权：请求的权限控制

- 示例 -- **直接模式**

  - 给 /order/{orderId}这个资源设置流控规则，QPS不能超过 5，然后测试

    ![image-20221027173426030](http://minio.botuer.com/study-node/old/image-20221027173426030.png)

  - 测试 -- 利用jmeter测试

#### 流控模式

在添加限流规则时，点击高级选项，可以选择三种**流控模式**：

- **直接**：统计当前资源的请求，触发阈值时对当前资源直接限流，也是默认的模式
- **关联**：统计与当前资源相关的另一个资源，触发阈值时，对当前资源限流
- **链路**：统计从指定链路访问到本资源的请求，触发阈值时，对指定链路限流

![image-20221027174209851](http://minio.botuer.com/study-node/old/image-20221027174209851.png)

##### 直接模式

示例中的就是直接模式

##### 关联模式

**关联模式**：统计与当前资源相关的另一个资源，触发阈值时，对当前资源限流

**配置规则**：

![image-20221028072209060](http://minio.botuer.com/study-node/old/image-20221028072209060.png)

**语法说明**：当/write资源访问量触发阈值时，就会对/read资源限流，避免影响/write资源。



**使用场景**：比如用户支付时需要修改订单状态，同时用户要查询订单。查询和修改操作会争抢数据库锁，产生竞争。业务需求是优先支付和更新订单的业务，因此当修改订单业务触发阈值时，需要对查询订单业务限流。



**需求说明**：

- 在OrderController新建两个端点：/order/query和/order/update，无需实现业务

- 配置流控规则，当/order/ update资源被访问的QPS超过5时，对/order/query请求限流

**实现**：

- controller

- 填写表单

  ![image-20221028072408643](http://minio.botuer.com/study-node/old/image-20221028072408643.png)

**总结**：

- 两个有竞争关系的资源，一个优先级高，一个优先级低，采用关联模式

##### 链路模式

**链路模式**：只针对从指定链路访问到本资源的请求做统计，判断是否超过阈值。

**配置示例**：

例如有两条请求链路：

- /test1 --> /common

- /test2 --> /common

如果只希望统计从/test2进入到/common的请求，则可以这样配置：

![image-20221028072541710](http://minio.botuer.com/study-node/old/image-20221028072541710.png)

**实战案例**

需求：有查询订单和创建订单业务，两者都需要查询商品。针对从查询订单进入到查询商品的请求统计，并设置限流



**实现**：

- service  --- 方法上加`@SentinelResource`注解

- 配置

  > 链路模式中，是对不同来源的两个链路做监控。但是sentinel默认会给进入SpringMVC的所有请求设置同一个root资源（sentinel_default_context），会导致链路模式失效

  我们需要关闭这种对SpringMVC的资源聚合，修改order-service服务的application.yml文件：

  ```yaml
  spring:
    cloud:
      sentinel:
        web-context-unify: false ## 关闭context整合
  ```

  ![image-20221028073731724](http://minio.botuer.com/study-node/old/image-20221028073731724.png)

- 填写表单

  **点击service资源**（goods资源）后面的流控按钮，在弹出的表单中填写下面信息：

  ![image-20221028073835995](http://minio.botuer.com/study-node/old/image-20221028073835995.png)

##### 总结

- 直接：对当前资源限流
- 关联：高优先级资源触发阈值，对低优先级资源限流
- 链路：阈值统计时，只统计从指定资源进入当前资源的请求，是对请求来源的限流

#### 流控效果

在流控的高级选项中，还有一个流控效果选项：

![image-20221028074037507](http://minio.botuer.com/study-node/old/image-20221028074037507.png)

流控效果是指请求达到流控阈值时应该采取的措施，包括三种：

- **快速失败**：达到阈值后，新的请求会被立即拒绝并**抛出FlowException异常**。是**默认**的处理方式

- **warm up：预热模式**，对超出阈值的请求同样是拒绝并抛出异常。但这种模式**阈值会动态变化**，从一个**较小**值逐渐**增加到最大**阈值

- **排队等待**：让所有的请求按照**先后次序排队执行**，两个请求的间隔不能小于指定时长

##### 快速失败

##### warm up

阈值一般是一个微服务能承担的最大QPS，但是一个服务刚刚启动时，一切资源尚未初始化（**冷启动**），如果直接将QPS跑到最大值，可能导致服务瞬间宕机。



warm up也叫**预热模式**，是应对服务冷启动的一种方案。请求阈值初始值是 maxThreshold / coldFactor，持续指定时长后，逐渐提高到maxThreshold值。而coldFactor的默认值是3.

例如，我设置QPS的maxThreshold为10，预热时间为5秒，那么初始阈值就是 10 / 3 ，也就是3，然后在5秒后逐渐增长到10

![image-20221028074223370](http://minio.botuer.com/study-node/old/image-20221028074223370.png)

**案例**

需求：给/order/{orderId}这个资源设置限流，最大QPS为10，利用warm up效果，预热时长为5秒

**实现**：

- 填写表单

![image-20221028074303724](http://minio.botuer.com/study-node/old/image-20221028074303724.png)

##### 排队等待

当请求超过QPS阈值时，快速失败和warm up 会拒绝新的请求并抛出异常。

而排队等待则是让所有请求进入一个队列中，然后按照阈值允许的时间间隔依次执行。后来的请求必须等待前面执行完成，如果请求预期的等待时间超出最大时长，则会被拒绝。

工作原理

例如：QPS = 5，意味着每200ms处理一个队列中的请求；timeout = 2000，意味着**预期等待时长**超过2000ms的请求会被拒绝并抛出异常。

那什么叫做预期等待时长呢？

比如现在一下子来了12 个请求，因为每200ms执行一个请求，那么：

- 第6个请求的**预期等待时长** =  200 * （6 - 1） = 1000ms
- 第12个请求的预期等待时长 = 200 * （12-1） = 2200ms



现在，第1秒同时接收到10个请求，但第2秒只有1个请求，此时QPS的曲线这样的：

![image-20221028074413804](http://minio.botuer.com/study-node/old/image-20221028074413804.png)

如果使用队列模式做流控，所有进入的请求都要排队，以固定的200ms的间隔执行，QPS会变的很平滑：

![image-20221028074424587](http://minio.botuer.com/study-node/old/image-20221028074424587.png)

平滑的QPS曲线，对于服务器来说是更友好的。



**案例**

需求：给/order/{orderId}这个资源设置限流，最大QPS为10，利用排队的流控效果，超时时长设置为5s

**实现**：

- 填写表单

  ![image-20221028074456512](http://minio.botuer.com/study-node/old/image-20221028074456512.png)

- 测试全部都通过了

  ![image-20221028074626385](http://minio.botuer.com/study-node/old/image-20221028074626385.png)

- QPS非常平滑，一致保持在10，但是超出的请求没有被拒绝，而是放入队列。因此**响应时间**（等待时间）会越来越长

- 当队列满了以后，才会有部分请求失败

  ![image-20221028074607344](http://minio.botuer.com/study-node/old/image-20221028074607344.png)

##### 总结

- 快速失败：QPS超过阈值时，拒绝新的请求

- warm up： QPS超过阈值时，拒绝新的请求；QPS阈值是逐渐提升的，可以避免冷启动时高并发导致服务宕机。

- 排队等待：请求会进入队列，按照阈值允许的时间间隔依次执行请求；如果请求预期等待时长大于超时时间，直接拒绝

#### 热点参数限流

之前的限流是统计访问某个资源的所有请求，判断是否超过QPS阈值。而热点参数限流是**分别统计参数值相同的请求**，判断是否超过QPS阈值

##### 全局参数限流

例如，一个根据id查询商品的接口：

![image-20221028074736031](http://minio.botuer.com/study-node/old/image-20221028074736031.png)

访问/goods/{id}的请求中，id参数值会有变化，热点参数限流会根据参数值分别统计QPS，统计结果：

![image-20221028074745364](http://minio.botuer.com/study-node/old/image-20221028074745364.png)

当id=1的请求触发阈值被限流时，id值不为1的请求不受影响。



配置示例：

![image-20221028074803296](http://minio.botuer.com/study-node/old/image-20221028074803296.png)

代表的含义是：对hot这个资源的0号参数（第一个参数）做统计，每1秒**相同参数值**的请求数不能超过5

##### 热点参数限流

刚才的配置中，对查询商品这个接口的所有商品一视同仁，QPS都限定为5.

而在实际开发中，可能部分商品是热点商品，例如秒杀商品，我们希望这部分商品的QPS限制与其它商品不一样，高一些。那就需要配置热点参数限流的高级选项了：

![image-20221028074828929](http://minio.botuer.com/study-node/old/image-20221028074828929.png)

结合上一个配置，这里的含义是对0号的long类型参数限流，每1秒相同参数的QPS不能超过5，有两个例外：

- 如果参数值是100，则每1秒允许的QPS为10

- 如果参数值是101，则每1秒允许的QPS为15

**需求**：

给/order/{orderId}这个资源添加热点参数限流，规则如下：

- 默认的热点参数规则是每1秒请求量不超过2

- 给102这个参数设置例外：每1秒请求量不超过4
- 给103这个参数设置例外：每1秒请求量不超过10

**实现**：

- **注意事项**：热点参数限流对默认的SpringMVC资源无效，需要利用`@SentinelResource`注解标记资源

  ![image-20221028074949830](http://minio.botuer.com/study-node/old/image-20221028074949830.png)

- 填写表单

  ![image-20221028075044143](http://minio.botuer.com/study-node/old/image-20221028075044143.png)

  ![image-20221028075055951](http://minio.botuer.com/study-node/old/image-20221028075055951.png)

### 隔离和降级

限流是一种预防措施，虽然限流可以尽量避免因高并发而引起的服务故障，但服务还会因为其它原因而故障

而要将这些故障控制在一定范围，避免雪崩，就要靠**线程隔离**（舱壁模式）和**熔断降级**手段了



**线程隔离**之前讲到过：调用者在调用服务提供者时，给每个调用的请求分配独立线程池，出现故障时，最多消耗这个线程池内资源，避免把调用者的所有资源耗尽

不管是线程隔离还是熔断降级，都是对**客户端**（调用方）的保护。需要在**调用方** 发起远程调用时做线程隔离、或者服务熔断

而我们的微服务远程调用都是基于Feign来完成的，因此我们需要将Feign与Sentinel整合，在Feign里面实现线程隔离和服务熔断

#### FeignClient整合Sentinel

SpringCloud中，微服务调用都是通过Feign来实现的，因此做客户端保护必须整合Feign和Sentinel



- 修改OrderService的application.yml文件，开启Feign的Sentinel功能

  ```yml
  feign:
    sentinel:
      enabled: true ## 开启feign对sentinel的支持
  ```

- 编写失败降级逻辑

  业务失败后，不能直接报错，而应该返回用户一个友好提示或者默认结果，这个就是失败降级逻辑

  给FeignClient编写失败后的降级逻辑

  ①方式一：FallbackClass，无法对远程调用的异常做处理

  ②方式二：FallbackFactory，可以对远程调用的异常做处理，我们选择这种

  **步骤一**：在feing-api项目中定义类，实现FallbackFactory

  ![image-20221028085004519](http://minio.botuer.com/study-node/old/image-20221028085004519.png)

  ```java
  @Slf4j
  public class UserClientFallbackFactory implements FallbackFactory<UserClient> {
      @Override
      public UserClient create(Throwable throwable) {
          return new UserClient() {
              @Override
              public User findById(Long id) {
                  log.error("查询用户异常", throwable);
                  return new User();
              }
          };
      }
  }
  ```

  **步骤二**：在feing-api项目中的DefaultFeignConfiguration类中将UserClientFallbackFactory注册为一个Bean

  ```java
  @Bean
  public UserClientFallbackFactory userClientFallbackFactory(){
      return new UserClientFallbackFactory();
  }
  ```

  **步骤三**：在feing-api项目中的UserClient接口中使用UserClientFallbackFactory

  ```java
  @FeignClient(value = "userservice", fallbackFactory = UserClientFallbackFactory.class)
  public interface UserClient {
  
      @GetMapping("/user/{id}")
      User findById(@PathVariable("id") Long id);
  }
  ```

  重启后，访问一次订单查询业务，然后查看sentinel控制台，可以看到新的簇点链路：

  ![image-20221028085143160](http://minio.botuer.com/study-node/old/image-20221028085143160.png)

- 总结

  - Sentinel支持的雪崩解决方案：

    - 线程隔离（仓壁模式）

    - 降级熔断


  - Feign整合Sentinel的步骤：

    - 在application.yml中配置：feign.sentienl.enable=true

    - 给FeignClient编写FallbackFactory并注册为Bean

    - 将FallbackFactory配置到FeignClient


#### 线程隔离（舱壁模式）

线程隔离有两种方式实现：

- **线程池隔离**：给每个服务调用业务分配一个线程池，利用线程池本身实现隔离效果

- **信号量隔离**：不创建线程池，而是计数器模式，记录业务使用的线程数量，达到信号量上限时，禁止新的请求

- Hystrix支持线程池隔离、信号量隔离

- **Sentinel采用信号量隔离**


![image-20221028085348378](http://minio.botuer.com/study-node/old/image-20221028085348378.png)

- 特点

  ![image-20221028085433940](http://minio.botuer.com/study-node/old/image-20221028085433940.png)

**信号量隔离用法说明**：

在添加限流规则时，可以选择两种阈值类型：

![image-20221028085534728](http://minio.botuer.com/study-node/old/image-20221028085534728.png)

- QPS：就是每秒的请求数，在快速入门中已经演示过

- 线程数：是该资源能使用用的tomcat线程数的最大值。也就是通过限制线程数量，实现**线程隔离**（舱壁模式）
  - **单机阈值**：信号量最大值




**案例需求**：给 order-service服务中的UserClient的查询用户接口设置流控规则，线程数不能超过 2。然后利用jemeter测试

**实现**：

![image-20221028085557721](http://minio.botuer.com/study-node/old/image-20221028085557721.png)

- 表单

  ![image-20221028085619267](http://minio.botuer.com/study-node/old/image-20221028085619267.png)

**总结**

- 线程隔离的两种手段是？

  - 信号量隔离


  - 线程池隔离


- 信号量隔离的特点是？
  - 基于计数器模式，简单，开销小


- 线程池隔离的特点是？
  - 基于线程池模式，有额外开销，但隔离控制更强

#### 熔断降级

熔断降级是解决雪崩问题的重要手段。其思路是由**断路器**统计服务调用的异常比例、慢请求比例，如果超出阈值则会**熔断**该服务。即拦截访问该服务的一切请求；而当服务恢复时，断路器会放行访问该服务的请求。

断路器控制熔断和放行是通过状态机来完成的：

![image-20221028090920300](http://minio.botuer.com/study-node/old/image-20221028090920300.png)

状态机包括三个状态：

- closed：关闭状态，断路器放行所有请求，并开始统计异常比例、慢请求比例。超过阈值则切换到open状态
- open：打开状态，服务调用被**熔断**，访问被熔断服务的请求会被拒绝，快速失败，直接走降级逻辑。Open状态5秒后会进入half-open状态
- half-open：半开状态，放行一次请求，根据执行结果来判断接下来的操作。
  - 请求成功：则切换到closed状态
  - 请求失败：则切换到open状态



断路器熔断策略有三种：慢调用、异常比例、异常数

##### 慢调用

**慢调用**：业务的响应时长（RT）大于指定时长的请求认定为慢调用请求。在指定时间内，如果请求数量超过设定的最小数量，慢调用比例大于设定的阈值，则触发熔断。

![image-20221028091032546](http://minio.botuer.com/study-node/old/image-20221028091032546.png)

解读：RT超过500ms的调用是慢调用，统计最近10000ms内的请求，如果请求量超过10次，并且慢调用比例不低于0.5，则触发熔断，熔断时长为5秒。然后进入half-open状态，放行一次请求做测试

**案例**

需求：给 UserClient的查询用户接口设置降级规则，慢调用的RT阈值为50ms，统计时间为1秒，最小请求数量为5，失败阈值比例为0.4，熔断时长为5

**实现**：

- 为实现慢调用，可让线程睡60ms

- 设置熔断规则 -- 超过50ms的请求都会被认为是慢请求

  ![image-20221028121741473](http://minio.botuer.com/study-node/old/image-20221028121741473.png)

  ![image-20221028121752970](http://minio.botuer.com/study-node/old/image-20221028121752970.png)

##### 异常比例、异常数

**异常比例或异常数**：统计指定时间内的调用，如果调用次数超过指定请求数，并且出现异常的比例达到设定的比例阈值（或超过指定异常数），则触发熔断

**异常比例**：统计最近1000ms内的请求，如果请求量超过10次，并且异常比例不低于0.4，则触发熔断。

![image-20221028173459502](http://minio.botuer.com/study-node/old/image-20221028173459502.png)

**异常数**：统计最近1000ms内的请求，如果请求量超过10次，并且异常比例不低于2次，则触发熔断

![image-20221028173650157](http://minio.botuer.com/study-node/old/image-20221028173650157.png)

**案例**：给 UserClient的查询用户接口设置降级规则，统计时间为1秒，最小请求数量为5，失败阈值比例为0.4，熔断时长为5s

**实现**：

- 修改一个controller抛异常，使其达到异常数或异常比例

- 填写表单

  ![image-20221028173909575](http://minio.botuer.com/study-node/old/image-20221028173909575.png)

#### 授权规则

##### 基本规则

授权规则可以对调用方的来源做控制，有白名单和黑名单两种方式

- 白名单：来源（origin）在白名单内的调用者允许访问

- 黑名单：来源（origin）在黑名单内的调用者不允许访问

点击左侧菜单的授权，可以看到授权规则：

### 授权规则

#### 基本规则

授权规则可以对调用方的来源做控制，有白名单和黑名单两种方式。

- 白名单：来源（origin）在白名单内的调用者允许访问

- 黑名单：来源（origin）在黑名单内的调用者不允许访问

点击左侧菜单的授权，可以看到授权规则：

![image-20221028174019459](http://minio.botuer.com/study-node/old/image-20221028174019459.png)

- 资源名：就是受保护的资源，例如/order/{orderId}

- 流控应用：是来源者的名单，
  - 如果是勾选白名单，则名单中的来源被许可访问
  - 如果是勾选黑名单，则名单中的来源被禁止访问

比如：

![image-20221028174052745](http://minio.botuer.com/study-node/old/image-20221028174052745.png)

我们允许请求从gateway到order-service，不允许浏览器访问order-service，那么白名单中就要填写**网关的来源名称（origin）**

**作用**：有gateway，为什么还要授权规则？ --- 防内鬼

##### 获取origin

Sentinel是通过RequestOriginParser这个接口的parseOrigin来获取请求的来源的

```java
public interface RequestOriginParser {
    /**
     * 从请求request对象中获取origin，获取方式自定义
     */
    String parseOrigin(HttpServletRequest request);
}
```

这个方法的作用就是从request对象中，获取请求者的origin值并返回

默认情况下，sentinel不管请求者从哪里来，返回值永远是default，也就是说一切请求的来源都被认为是一样的值default

因此，我们需要自定义这个接口的实现，让**不同的请求，返回不同的origin**

例如order-service服务中，我们定义一个RequestOriginParser的实现类：

```java
@Component
public class HeaderOriginParser implements RequestOriginParser {
    @Override
    public String parseOrigin(HttpServletRequest request) {
        // 1.获取请求头
        String origin = request.getHeader("origin");
        // 2.非空判断
        if (StringUtils.isEmpty(origin)) {
            origin = "blank";
        }
        return origin;
    }
}
```

我们会尝试从request-header中获取origin值

##### 给网关添加请求头

既然获取请求origin的方式是从reques-header中获取origin值，我们必须让**所有从gateway路由到微服务的请求都带上origin头**

这个需要利用之前学习的一个GatewayFilter来实现，AddRequestHeaderGatewayFilter。

修改gateway服务中的application.yml，添加一个defaultFilter：

```yaml
spring:
  cloud:
    gateway:
      default-filters:
        - AddRequestHeader=origin,gateway
      routes:
       ## ...略
```

这样，从gateway路由的所有请求都会带上origin头，值为gateway。而从其它地方到达微服务的请求则没有这个头

##### 配置授权规则

接下来，我们添加一个授权规则，放行origin值为gateway的请求

![image-20221028174503579](http://minio.botuer.com/study-node/old/image-20221028174503579.png)

![image-20221028174511774](http://minio.botuer.com/study-node/old/image-20221028174511774.png)

#### 自定义异常结果

默认情况下，发生限流、降级、授权拦截时，都会抛出异常到调用方。异常结果都是flow limmiting（限流）。这样不够友好，无法得知是限流还是降级还是授权拦截

##### 异常类型

而如果要自定义异常时的返回结果，需要实现BlockExceptionHandler接口：

```java
public interface BlockExceptionHandler {
    /**
     * 处理请求被限流、降级、授权拦截时抛出的异常：BlockException
     */
    void handle(HttpServletRequest request, HttpServletResponse response, BlockException e) throws Exception;
}
```

这个方法有三个参数：

- HttpServletRequest request：request对象
- HttpServletResponse response：response对象
- BlockException e：被sentinel拦截时抛出的异常

这里的BlockException包含多个不同的子类：

| **异常**             | **说明**           |
| -------------------- | ------------------ |
| FlowException        | 限流异常           |
| ParamFlowException   | 热点参数限流的异常 |
| DegradeException     | 降级异常           |
| AuthorityException   | 授权规则异常       |
| SystemBlockException | 系统规则异常       |

##### 自定义异常处理

下面，我们就在order-service定义一个自定义异常处理类：

```java
@Component
public class SentinelExceptionHandler implements BlockExceptionHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, BlockException e) throws Exception {
        String msg = "未知异常";
        int status = 429;

        if (e instanceof FlowException) {
            msg = "请求被限流了";
        } else if (e instanceof ParamFlowException) {
            msg = "请求被热点参数限流";
        } else if (e instanceof DegradeException) {
            msg = "请求被降级了";
        } else if (e instanceof AuthorityException) {
            msg = "没有权限访问";
            status = 401;
        }

        response.setContentType("application/json;charset=utf-8");
        response.setStatus(status);
        response.getWriter().println("{\"msg\": " + msg + ", \"status\": " + status + "}");
    }
}
```

重启测试，在不同场景下，会返回不同的异常消息

### 规则持久化

现在，sentinel的所有规则都是内存存储，重启后所有规则都会丢失。在生产环境下，我们必须确保这些规则的持久化，避免丢失

#### 规则管理模式

规则是否能持久化，取决于规则管理模式，sentinel支持三种规则管理模式：

- 原始模式：Sentinel的默认模式，将规则保存在内存，重启服务会丢失
- pull模式
- push模式

**pull模式**：控制台将配置的规则推送到Sentinel客户端，而客户端会将配置规则保存在本地文件或数据库中。以后会定时去本地文件或数据库中查询，更新本地规则

![image-20221028174823586](http://minio.botuer.com/study-node/old/image-20221028174823586.png)

**push模式**：控制台将配置规则推送到远程配置中心，例如Nacos。Sentinel客户端监听Nacos，获取配置变更的推送消息，完成本地配置更新。

![image-20221028174848772](http://minio.botuer.com/study-node/old/image-20221028174848772.png)

#### 实现push模式

- 引入依赖

  在order-service中引入sentinel监听nacos的依赖：

  ```xml
  <dependency>
      <groupId>com.alibaba.csp</groupId>
      <artifactId>sentinel-datasource-nacos</artifactId>
  </dependency>
  ```

- 配置nacos地址

  在order-service中的application.yml文件配置nacos地址及监听的配置信息：

  ```yaml
  spring:
    cloud:
      sentinel:
        datasource:
          flow:
            nacos:
              server-addr: localhost:8848 ## nacos地址
              dataId: orderservice-flow-rules
              groupId: SENTINEL_GROUP
              rule-type: flow ## 还可以是：degrade、authority、param-flow
  ```


- 修改sentinel-dashboard源码

  SentinelDashboard默认不支持nacos的持久化，需要修改源码

  - 修改nacos依赖

    在sentinel-dashboard源码的pom文件中，nacos的依赖默认的scope是test，只能在测试时使用，这里要去除：

    ![image-20221028175302932](http://minio.botuer.com/study-node/old/image-20221028175302932.png)

    将sentinel-datasource-nacos依赖的scope去掉：

    ```xml
    <dependency>
        <groupId>com.alibaba.csp</groupId>
        <artifactId>sentinel-datasource-nacos</artifactId>
    </dependency>
    ```


  - 添加nacos支持

    在sentinel-dashboard的test包下，已经编写了对nacos的支持，我们需要将其拷贝到main下

    ![image-20221028175431732](http://minio.botuer.com/study-node/old/image-20221028175431732.png)

  - 修改nacos地址

    ![image-20221028175530894](http://minio.botuer.com/study-node/old/image-20221028175530894.png)

    ![image-20221028175541022](http://minio.botuer.com/study-node/old/image-20221028175541022.png)

    在sentinel-dashboard的application.properties中添加nacos地址配置：

    ```properties
    nacos.addr=localhost:8848
    ```

  - 配置nacos数据源

    另外，还需要修改com.alibaba.csp.sentinel.dashboard.controller.v2包下的FlowControllerV2类：

    ![image-20221028175618556](http://minio.botuer.com/study-node/old/image-20221028175618556.png)

    让我们添加的Nacos数据源生效：

    ![image-20221028175638526](http://minio.botuer.com/study-node/old/image-20221028175638526.png)

  - 修改前端页面

    接下来，还要修改前端页面，添加一个支持nacos的菜单。

    修改src/main/webapp/resources/app/scripts/directives/sidebar/目录下的sidebar.html文件

    ![image-20221028175719619](http://minio.botuer.com/study-node/old/image-20221028175719619.png)

    将其中的这部分注释打开、修改：

    ![image-20221028175809528](http://minio.botuer.com/study-node/old/image-20221028175809528.png)

  - 重新编译、打包项目

    maven插件，编译和打包修改好的Sentinel-Dashboard：

    ![image-20221028175841508](http://minio.botuer.com/study-node/old/image-20221028175841508.png)

  - #### 启动

    启动方式跟官方一样：

    ```sh
    java -jar sentinel-dashboard.jar
    ```

    如果要修改nacos地址，需要添加参数：

    ```sh
    java -jar -Dnacos.addr=localhost:8848 sentinel-dashboard.jar
    ```


## Seate

### 概述

#### 分布式事务

**分布式事务**，就是指不是在单个服务或单个数据库架构下，产生的事务，例如：

- 跨数据源的分布式事务
- 跨服务的分布式事务
- 综合情况



在数据库水平拆分、服务垂直拆分之后，一个业务操作通常要跨多个数据库、服务才能完成。例如电商行业中比较常见的下单付款案例，包括下面几个行为：

- 创建新订单
- 扣减商品库存
- 从用户账户余额扣除金额



完成上面的操作需要访问三个不同的微服务和三个不同的数据库

订单的创建、库存的扣减、账户扣款在每一个服务和数据库内是一个本地事务，可以保证ACID原则。

但是当我们把三件事情看做一个"业务"，要满足保证“业务”的原子性，要么所有操作全部成功，要么全部失败，不允许出现部分成功部分失败的现象，这就是**分布式系统下的事务**了。

此时ACID难以满足，这是分布式事务要解决的问题

#### CAP定理

1998年，加州大学的计算机科学家 Eric Brewer 提出，分布式系统有三个指标。

> - Consistency（一致性）
> - Availability（可用性）
> - Partition tolerance （分区容错性）

![image-20221030161439746](http://minio.botuer.com/study-node/old/image-20221030161439746.png)

Eric Brewer 说，这三个指标不可能同时做到。这个结论就叫做 CAP 定理。

- Consistency（一致性）：用户访问分布式系统中的任意节点，得到的数据必须一致

  > - 比如现在包含两个节点，其中的初始数据是一致的
  > - 当我们修改其中一个节点的数据时，两者的数据产生了差异
  > - 要想保住一致性，就必须实现node01 到 node02的数据 同步

- Availability （可用性）：用户访问集群中的任意健康节点，必须能得到响应，而不是超时或拒绝

  > - 有三个节点的集群，访问任何一个都可以及时得到响应
  > - 当有部分节点因为网络故障或其它原因无法访问时，代表节点不可用

- Partition tolerance（分区容错）

  > - **Partition（分区）**：因为网络故障或其它原因导致分布式系统中的部分节点与其它节点失去连接，形成独立分区
  > - **Tolerance（容错）**：在集群出现分区时，整个系统也要持续对外提供服务

- 矛盾

  在分布式系统中，系统间的网络不能100%保证健康，一定会有故障的时候，而服务有必须对外保证服务。因此**Partition Tolerance不可避免**

  当节点接收到新的数据变更时，就会出现问题了

  > 如果此时要保证**一致性**，就必须等待网络恢复，完成数据同步后，整个集群才对外提供服务，服务处于阻塞状态，不可用
  >
  > 如果此时要保证**可用性**，就不能等待网络恢复，那node01、node02与node03之间就会出现数据不一致

- BASE理论 -- BASE理论是对CAP的一种解决思路，包含三个思想：
  - **Basically Available** **（基本可用）**：分布式系统在出现故障时，允许损失部分可用性，即保证核心可用
  - **Soft State（软状态）：**在一定时间内，允许出现中间状态，比如临时的不一致状态
  - **Eventually Consistent（最终一致性）**：虽然无法保证强一致性，但是在软状态结束后，最终达到数据一致

- 解决分布式事务的思路

  > 分布式事务最大的问题是各个子事务的一致性问题，因此可以借鉴CAP定理和BASE理论，有两种解决思路
  >
  > - AP模式：各子事务分别执行和提交，允许出现结果不一致，然后采用弥补措施恢复数据即可，实现最终一致。
  > - CP模式：各个子事务执行后互相等待，同时提交，同时回滚，达成强一致。但事务等待过程中，处于弱可用状态

  但不管是哪一种模式，都需要在子系统事务之间互相通讯，协调事务状态，也就是需要一个**事务协调者(TC)**

  这里的子系统事务，称为**分支事务**；有关联的各个分支事务在一起称为**全局事务**

#### Seata

Seata是 2019 年 1 月份蚂蚁金服和阿里巴巴共同开源的分布式事务解决方案。致力于提供高性能和简单易用的分布式事务服务，为用户打造一站式的分布式解决方案。

官网地址：http://seata.io/，其中的文档、播客中提供了大量的使用说明、源码分析

**Seata的架构**：Seata事务管理中有三个重要的角色：

- **TC (Transaction Coordinator) -** **事务协调者：**维护全局和分支事务的状态，协调全局事务提交或回滚。

- **TM (Transaction Manager) -** **事务管理器：**定义全局事务的范围、开始全局事务、提交或回滚全局事务。

- **RM (Resource Manager) -** **资源管理器：**管理分支事务处理的资源，与TC交谈以注册分支事务和报告分支事务的状态，并驱动分支事务提交或回滚。

![image-20221030170953646](http://minio.botuer.com/study-node/old/image-20221030170953646.png)

Seata基于上述架构提供了四种不同的分布式事务解决方案：

- XA模式：强一致性分阶段事务模式，牺牲了一定的可用性，无业务侵入
- TCC模式：最终一致的分阶段事务模式，有业务侵入
- AT模式：最终一致的分阶段事务模式，无业务侵入，也是Seata的默认模式
- SAGA模式：长事务模式，有业务侵入

无论哪种方案，都离不开TC，也就是事务的协调者

#### 集成

- 事务涉及到的服务都要配置

- 依赖

  ```xml
  <!--seata-->
  <dependency>
      <groupId>com.alibaba.cloud</groupId>
      <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
      <exclusions>
          <!--版本较低，1.3.0，因此排除--> 
          <exclusion>
              <artifactId>seata-spring-boot-starter</artifactId>
              <groupId>io.seata</groupId>
          </exclusion>
      </exclusions>
  </dependency>
  <dependency>
      <groupId>io.seata</groupId>
      <artifactId>seata-spring-boot-starter</artifactId>
      <!--seata starter 采用1.4.2版本-->
      <version>${seata.version}</version>
  </dependency>
  ```

- 配置TC地址

  在order-service中的application.yml中，配置TC服务信息，通过注册中心nacos，结合服务名称获取TC地址：

  ```yaml
  seata:
    registry: ## TC服务注册中心的配置，微服务根据这些信息去注册中心获取tc服务地址
      type: nacos ## 注册中心类型 nacos
      nacos:
        server-addr: 127.0.0.1:8848 ## nacos地址
        namespace: "" ## namespace，默认为空
        group: DEFAULT_GROUP ## 分组，默认是DEFAULT_GROUP
        application: seata-tc-server ## seata服务名称
        username: nacos
        password: nacos
    tx-service-group: seata-demo ## 事务组名称
    service:
      vgroup-mapping: ## 事务组与cluster的映射关系
        seata-demo: SH
  ```

  > 微服务如何根据这些配置寻找TC的地址呢？
  >
  > 我们知道注册到Nacos中的微服务，确定一个具体实例需要四个信息：
  >
  > - namespace：命名空间
  > - group：分组
  > - application：服务名
  > - cluster：集群名
  >
  > ![image-20221030171501204](http://minio.botuer.com/study-node/old/image-20221030171501204.png)
  >
  > namespace为空，就是默认的public
  >
  > 结合起来，TC服务的信息就是：public@DEFAULT_GROUP@seata-tc-server@SH，这样就能确定TC服务集群了。然后就可以去Nacos拉取对应的实例信息了

### XA模式

XA 规范 是 X/Open 组织定义的分布式事务处理（DTP，Distributed Transaction Processing）标准，XA 规范 描述了全局的TM与局部的RM之间的接口，几乎所有主流的数据库都对 XA 规范 提供了支持

#### 两阶段提交

XA是规范，目前主流数据库都实现了这种规范，实现的原理都是基于两阶段提交

**正常情况**

![image-20221030171803286](http://minio.botuer.com/study-node/old/image-20221030171803286.png)

**异常情况**

![image-20221030171817407](http://minio.botuer.com/study-node/old/image-20221030171817407.png)

一阶段：

- 事务协调者通知每个事物参与者执行本地事务
- 本地事务执行完成后报告事务执行状态给事务协调者，此时事务不提交，继续持有数据库锁

二阶段：

- 事务协调者基于一阶段的报告来判断下一步操作
  - 如果一阶段都成功，则通知所有事务参与者，提交事务
  - 如果一阶段任意一个参与者失败，则通知所有事务参与者回滚事务

#### Seata的XA模型

Seata对原始的XA模式做了简单的封装和改造，以适应自己的事务模型，基本架构如图

![image-20221030171906948](http://minio.botuer.com/study-node/old/image-20221030171906948.png)

RM一阶段的工作：

​	① 注册分支事务到TC

​	② **执行分支业务sql但不提交**

​	③ 报告执行状态到TC

TC二阶段的工作：

- TC检测各分支事务执行状态

  a.如果都成功，通知所有RM提交事务

  b.如果有失败，通知所有RM回滚事务

RM二阶段的工作：

- 接收TC指令，提交或回滚事务

#### 优缺点

XA模式的优点是什么？

- 事务的强一致性，满足ACID原则
- 常用数据库都支持，实现简单，并且没有代码侵入

XA模式的缺点是什么？

- 因为一阶段需要锁定数据库资源，等待二阶段结束才释放，性能较差
- 依赖关系型数据库实现事务



#### 实现XA模式

Seata的starter已经完成了XA模式的自动装配，实现非常简单，步骤如下：

1）修改application.yml文件（每个参与事务的微服务），开启XA模式：

```yaml
seata:
  data-source-proxy-mode: XA
```

2）给发起全局事务的**入口方法添加`@GlobalTransactional`**注解:

本例中是OrderServiceImpl中的create方法

![image-20221030172204191](http://minio.botuer.com/study-node/old/image-20221030172204191.png)

### AT模式

AT模式同样是分阶段提交的事务模型，不过缺弥补了XA模型中资源锁定周期过长的缺陷

#### Seata的AT模型

![image-20221030172421714](http://minio.botuer.com/study-node/old/image-20221030172421714.png)

阶段一RM的工作：

- 注册分支事务
- **记录undo-log（数据快照）**
- **执行业务sql并提交**
- 报告事务状态

阶段二提交时RM的工作：

- 删除undo-log即可

阶段二回滚时RM的工作：

- 根据undo-log恢复数据到更新前

![image-20221030172523063](http://minio.botuer.com/study-node/old/image-20221030172523063.png)

#### AT与XA的区别

简述AT模式与XA模式最大的区别是什么？

- XA模式一阶段不提交事务，锁定资源；AT模式一阶段直接提交，不锁定资源。
- XA模式依赖数据库机制实现回滚；AT模式利用数据快照实现数据回滚。
- XA模式强一致；AT模式最终一致

#### 脏写问题

在多线程并发访问AT模式的分布式事务时，有可能出现脏写问题，如图：

![image-20221030172551810](http://minio.botuer.com/study-node/old/image-20221030172551810.png)

解决思路就是引入了全局锁的概念。在释放DB锁之前，先拿到全局锁。避免同一时刻有另外一个事务来操作当前数据

![image-20221030172610040](http://minio.botuer.com/study-node/old/image-20221030172610040.png)

#### 优缺点

AT模式的优点：

- 一阶段完成直接提交事务，释放数据库资源，性能比较好
- 利用全局锁实现读写隔离
- 没有代码侵入，框架自动完成回滚和提交

AT模式的缺点：

- 两阶段之间属于软状态，属于最终一致
- 框架的快照功能会影响性能，但比XA模式要好很多

#### 实现AT模式

AT模式中的快照生成、回滚等动作都是由框架自动完成，没有任何代码侵入，因此实现非常简单。

只不过，AT模式需要一个表来记录全局锁、另一张表来记录数据快照undo_log

导入数据库表，记录全局锁 — seata-at.sql，其中lock_table导入到TC服务关联的数据库，undo_log表导入到微服务关联的数据库

修改application.yml文件，将事务模式修改为AT模式即可

```yaml
seata:
  data-source-proxy-mode: AT ## 默认就是AT
```

### TCC模式

TCC模式与AT模式非常相似，每阶段都是独立事务，不同的是TCC通过人工编码来实现数据恢复。需要实现三个方法：

- Try：资源的检测和预留； 

- Confirm：完成资源操作业务；要求 Try 成功 Confirm 一定要能成功。

- Cancel：预留资源释放，可以理解为try的反向操作。

#### Seata的TCC模型

Seata中的TCC模型依然延续之前的事务架构，如图

![image-20221030172836555](http://minio.botuer.com/study-node/old/image-20221030172836555.png)

#### 流程分析

举例，一个扣减用户余额的业务。假设账户A原来余额是100，需要余额扣减30元。

- **阶段一（ Try ）**：检查余额是否充足，如果充足则冻结金额增加30元，可用余额扣除30

  初始余额：

  ![image-20221030173014874](http://minio.botuer.com/study-node/old/image-20221030173014874.png)

  余额充足：

  ![image-20221030173040909](http://minio.botuer.com/study-node/old/image-20221030173040909.png)

  > 此时，总金额 = 冻结金额 + 可用金额，数量依然是100不变。事务直接提交无需等待其它事务

- **阶段二（Confirm)**：假如要提交（Confirm），则冻结金额扣减30

  确认可以提交，不过之前可用金额已经扣减过了，这里只要清除冻结金额就好了

  ![image-20221030173142521](http://minio.botuer.com/study-node/old/image-20221030173142521.png)

  > 此时，总金额 = 冻结金额 + 可用金额 = 0 + 70  = 70元

- **阶段二(Canncel)**：如果要回滚（Cancel），则冻结金额扣减30，可用余额增加30

  需要回滚，那么就要释放冻结金额，恢复可用金额

  ![image-20221030173227388](http://minio.botuer.com/study-node/old/image-20221030173227388.png)

#### 优缺点

TCC模式的每个阶段是做什么的？

- Try：资源检查和预留
- Confirm：业务执行和提交
- Cancel：预留资源的释放

TCC的优点是什么？

- 一阶段完成直接提交事务，释放数据库资源，性能好
- 相比AT模型，无需生成快照，无需使用全局锁，性能最强
- 不依赖数据库事务，而是依赖补偿操作，可以用于非事务型数据库

TCC的缺点是什么？

- 有代码侵入，需要人为编写try、Confirm和Cancel接口，太麻烦
- 软状态，事务是最终一致
- 需要考虑Confirm和Cancel的失败情况，做好幂等处理

#### 事务悬挂和空回滚

**空回滚**：当某分支事务的try阶段**阻塞**时，可能导致全局事务超时而触发二阶段的cancel操作。在未执行try操作时先执行了cancel操作，这时cancel不能做回滚，就是**空回滚**

![image-20221030173328903](http://minio.botuer.com/study-node/old/image-20221030173328903.png)

执行cancel操作时，应当判断try是否已经执行，如果尚未执行，则应该空回滚

**业务悬挂**：对于已经空回滚的业务，之前被阻塞的try操作恢复，继续执行try，就永远不可能confirm或cancel ，事务一直处于中间状态，这就是**业务悬挂**

执行try操作时，应当判断cancel是否已经执行过了，如果已经执行，应当阻止空回滚后的try操作，避免悬挂

#### 实现TCC模式

解决空回滚和业务悬挂问题，必须要记录当前事务状态，是在try、还是cancel

**需要一张新表**

```sql
CREATE TABLE `account_freeze_tbl` (
  `xid` varchar(128) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL COMMENT '用户id',
  `freeze_money` int(11) unsigned DEFAULT '0' COMMENT '冻结金额',
  `state` int(1) DEFAULT NULL COMMENT '事务状态，0:try，1:confirm，2:cancel',
  PRIMARY KEY (`xid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

```

其中：

- **xid：是全局事务id**
- **freeze_money：用来记录用户冻结金额**
- **state：用来记录事务状态**

那此时，我们的业务开怎么做呢？

- Try业务：
  - 记录冻结金额和事务状态到account_freeze表
  - 扣减account表可用金额
- Confirm业务
  - 根据xid删除account_freeze表的冻结记录
- Cancel业务
  - 修改account_freeze表，冻结金额为0，state为2
  - 修改account表，恢复可用金额
- 如何判断是否空回滚？
  - cancel业务中，根据xid查询account_freeze，如果为null则说明try还没做，需要空回滚
- 如何避免业务悬挂？
  - try业务中，根据xid查询account_freeze ，如果已经存在则证明Cancel已经执行，拒绝执行try业务

**声明TCC接口**

TCC的Try、Confirm、Cancel方法都需要在接口中基于注解来声明，

我们在account-service项目中的`cn.itcast.account.service`包中新建一个接口，声明TCC三个接口：

```java
@LocalTCC
public interface AccountTCCService {

    @TwoPhaseBusinessAction(name = "deduct", commitMethod = "confirm", rollbackMethod = "cancel")
    void deduct(@BusinessActionContextParameter(paramName = "userId") String userId,
                @BusinessActionContextParameter(paramName = "money")int money);

    boolean confirm(BusinessActionContext ctx);

    boolean cancel(BusinessActionContext ctx);
}
```

**编写实现类**

在account-service服务中的`cn.itcast.account.service.impl`包下新建一个类，实现TCC业务：

```java
@Service
@Slf4j
public class AccountTCCServiceImpl implements AccountTCCService {

    @Autowired
    private AccountMapper accountMapper;
    @Autowired
    private AccountFreezeMapper freezeMapper;

    @Override
    @Transactional
    public void deduct(String userId, int money) {
        // 0.获取事务id
        String xid = RootContext.getXID();
        // 1.扣减可用余额
        accountMapper.deduct(userId, money);
        // 2.记录冻结金额，事务状态
        AccountFreeze freeze = new AccountFreeze();
        freeze.setUserId(userId);
        freeze.setFreezeMoney(money);
        freeze.setState(AccountFreeze.State.TRY);
        freeze.setXid(xid);
        freezeMapper.insert(freeze);
    }

    @Override
    public boolean confirm(BusinessActionContext ctx) {
        // 1.获取事务id
        String xid = ctx.getXid();
        // 2.根据id删除冻结记录
        int count = freezeMapper.deleteById(xid);
        return count == 1;
    }

    @Override
    public boolean cancel(BusinessActionContext ctx) {
        // 0.查询冻结记录
        String xid = ctx.getXid();
        AccountFreeze freeze = freezeMapper.selectById(xid);

        // 1.恢复可用余额
        accountMapper.refund(freeze.getUserId(), freeze.getFreezeMoney());
        // 2.将冻结金额清零，状态改为CANCEL
        freeze.setFreezeMoney(0);
        freeze.setState(AccountFreeze.State.CANCEL);
        int count = freezeMapper.updateById(freeze);
        return count == 1;
    }
}
```

### SAGA模式

Saga 模式是 Seata 即将开源的长事务解决方案，将由蚂蚁金服主要贡献

其理论基础是Hector & Kenneth  在1987年发表的论文[Sagas](https://microservices.io/patterns/data/saga.html)

Seata官网对于Saga的指南：https://seata.io/zh-cn/docs/user/saga.html

#### 原理

在 Saga 模式下，分布式事务内有多个参与者，每一个参与者都是一个冲正补偿服务，需要用户根据业务场景实现其正向操作和逆向回滚操作

分布式事务执行过程中，依次执行各参与者的正向操作，如果所有正向操作均执行成功，那么分布式事务提交。如果任何一个正向操作执行失败，那么分布式事务会去退回去执行前面各参与者的逆向回滚操作，回滚已提交的参与者，使分布式事务回到初始状态

![image-20221030181947719](http://minio.botuer.com/study-node/old/image-20221030181947719.png)

Saga也分为两个阶段：

- 一阶段：直接提交本地事务
- 二阶段：成功则什么都不做；失败则通过编写补偿业务来回滚

#### 优缺点

优点：

- 事务参与者可以基于事件驱动实现异步调用，吞吐高
- 一阶段直接提交事务，无锁，性能好
- 不用编写TCC中的三个阶段，实现简单

缺点：

- 软状态持续时间不确定，时效性差
- 没有锁，没有事务隔离，会有脏写

### 四种模式对比

我们从以下几个方面来对比四种实现：

- 一致性：能否保证事务的一致性？强一致还是最终一致？
- 隔离性：事务之间的隔离性如何？
- 代码侵入：是否需要对业务代码改造？
- 性能：有无性能损耗？
- 场景：常见的业务场景

![image-20221030182927385](http://minio.botuer.com/study-node/old/image-20221030182927385.png)

### 高可用

Seata的TC服务作为分布式事务核心，一定要保证集群的高可用性

**高可用架构模型**

搭建TC服务集群非常简单，启动多个TC服务，注册到nacos即可

但集群并不能确保100%安全，万一集群所在机房故障怎么办？所以如果要求较高，一般都会做异地多机房容灾

比如一个TC集群在上海，另一个TC集群在杭州：

![image-20221030183824487](http://minio.botuer.com/study-node/old/image-20221030183824487.png)

微服务基于事务组（tx-service-group)与TC集群的映射关系，来查找当前应该使用哪个TC集群。当SH集群故障时，只需要将vgroup-mapping中的映射关系改成HZ。则所有微服务就会切换到HZ的TC集群了
