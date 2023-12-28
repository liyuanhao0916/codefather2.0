# SpringCloud

## 微服务

- 单体架构：简单方便，高度耦合，扩展性差，适合小型项目。例如：学生管理系统

- 分布式架构：松耦合，扩展性好，但架构复杂，难度大。适合大型互联网项目，例如：京东、淘宝

- 微服务：一种良好的分布式架构方案

  ①优点：拆分粒度更小、服务更独立、耦合度更低

  ②缺点：架构非常复杂，运维、监控、部署难度提高

- SpringCloud是微服务架构的一站式解决方案，集成了各种优秀微服务功能组件

- 微服务拆分原则

  - 不同微服务，不要重复开发相同业务
  - 微服务数据独立，不要访问其它微服务的数据库
  - 微服务可以将自己的业务暴露为接口，通过Restful接口供其它微服务调用

## 远程调用

问题：微服务数据独立，怎么获取另一个数据库数据？（订单信息中包含用户信息）

解决：

- 注册RestTemplate

  - RestTemplate 是一个类，对象可调用其他服务

  - 再调用者的启动类添加一个Bean

    ```java
    @Bean
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }
    ```

- 业务层远程调用

  - 注入对象

  - 远程查询

    - url
    - 发起调用

  - set注入

    ```java
    @Service
    public class OrderService {
    
        @Autowired
        private OrderMapper orderMapper;
        @Autowired
        private RestTemplate restTemplate;
    
        public Order queryOrderById(Long orderId) {
            // 1.查询订单
            Order order = orderMapper.findById(orderId);
            // 2.远程调用
            String url = "http://localhost:8080/user/" + order.getUserId();
            User user = restTemplate.getForObject(url, User.class);
            // 3.存入order
            order.setUser(user);
            // 4.返回
            return order;
        }
    }
    ```

> 说明：上述被调用的称为**服务提供者**，调用服务的称为**服务消费者**

## Eureka注册中心

### **概述**

- 问题1：当服务提供者有多个实例（即部署了多个服务器），服务消费者怎么获取url？
  - 服务注册：服务启动后，先将自己的信息注册到eureka-server（Eureka服务端），eureka-server保存服务名称到服务实例地址列表的映射关系
  - 服务拉取：消费者根据服务名称，拉取实例地址列表

- 问题2：服务提供者多个实例，服务消费者选择哪个？
  - 消费者从实例列表中利用负载均衡算法选中一个实例地址，发起远程调用

- 问题3：服务消费者如何得知服务提供者是否健康？
  - 心跳：提供者每隔一段时间（默认30秒）向eureka-server发起请求，报告自己状态
  - 长时间不心跳，eureka-server会认为故障，将该实例从服务列表中剔除，消费者拉取不到故障实例

> 说明：由于服务提供者、服务消费者是相对的，故eureka将服务注册、服务发现等功能统一封装到了eureka-client端

### **搭建eureka-server**

- 父工程下创建子模块eureka-server

- 引入SpringCloud为eureka提供的starter依赖

  ```xml
  <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
  </dependency>
  ```


- 编写启动类

  - 启动类注释@SpringBootApplication
  - 开启Eureka注释@EnableEurekaServer

  ```java
  @SpringBootApplication
  @EnableEurekaServer
  public class EurekaApplication {
      public static void main(String[] args) {
          SpringApplication.run(EurekaApplication.class, args);
      }
  }
  ```

- 编写配置文件 ---- application.yml

  ```yaml
  server:
    port: 10086
  spring:
    application:
      name: eureka-server
  eureka:
    client:
      service-url: 
        defaultZone: http://127.0.0.1:10086/eureka
  ```

- 启动服务 ---- 浏览器访问：http://127.0.0.1:10086

### 服务注册

将服务提供者注册到eureka-server

- 引入依赖

  - 搭建的时候后缀是server，注册的时候是client

  ```xml
  <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
  </dependency>
  ```

- 配置文件

  ```yaml
  spring:
    application:
      name: userservice
  eureka:
    client:
      service-url:
        defaultZone: http://127.0.0.1:10086/eureka
  ```

- 启动多个服务提供者实例

  - 右击-copy configuration
  - 修改名称
  - 填写VM Options：-Dserver.port=8082
  - Active profiles：设置环境【test等】

### 服务发现

- 引入依赖

  ```xml
  <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
  </dependency>
  ```


- 配置文件

  ```yaml
  spring:
    application:
      name: orderservice
  eureka:
    client:
      service-url:
        defaultZone: http://127.0.0.1:10086/eureka
  ```

- 服务拉取和负载均衡

  - 给RestTemplate的Bean上加注解@LodeBalanced

    ```java
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }
    ```

  - 修改业务层查找数据的url路径

    ```java
    //userservice即为配置文件中服务提供者的spring-application-name
    String url = "http://userservice/user/" + order.getUserId();
    ```

## Ribbon负载均衡

### 概述

SpringCloud底层其实是利用了一个名为Ribbon的组件，来实现负载均衡功能的。

问题：请求是http://userservice/user/1，怎么变成了http://localhost:8081的呢？

- LoadBalancerInterceptor类拦截RestTemplate的请求，根据服务id（即配置文件中的name），从Eureka获取服务列表，利用负载均衡算法得到ip和端口，替换了服务id

### 源码跟踪

**1）LoadBalancerIntercepor**

![image-20220615190352887](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220615190352887.png)

可以看到这里的intercept方法，拦截了用户的HttpRequest请求，然后做了几件事：

- `request.getURI()`：获取请求uri，本例中就是 http://user-service/user/8
- `originalUri.getHost()`：获取uri路径的主机名，其实就是服务id，`user-service`
- `this.loadBalancer.execute()`：处理服务id，和用户请求。

这里的`this.loadBalancer`是`LoadBalancerClient`类型，我们继续跟入。

**2）LoadBalancerClient**

继续跟入execute方法：

![image-20220615190403562](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220615190403562.png)

代码是这样的：

- getLoadBalancer(serviceId)：根据服务id获取ILoadBalancer，而ILoadBalancer会拿着服务id去eureka中获取服务列表并保存起来。
- getServer(loadBalancer)：利用内置的负载均衡算法，从服务列表中选择一个。本例中，可以看到获取了8082端口的服务

放行后，再次访问并跟踪，发现获取的是8081：

 ![image-20220615190410740](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220615190410740.png)

果然实现了负载均衡。

**3）负载均衡策略IRule**

在刚才的代码中，可以看到获取服务使通过一个`getServer`方法来做负载均衡:

 ![image-20220615190418343](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220615190418343.png)

我们继续跟入：

![image-20220615190424035](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220615190424035.png)

继续跟踪源码chooseServer方法，发现这么一段代码：

 ![image-20220615190432631](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220615190432631.png)

我们看看这个rule是谁：

 ![image-20220615190439010](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220615190439010.png)

这里的rule默认值是一个`RoundRobinRule`，看类的介绍：

 ![image-20220615190444397](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220615190444397.png)

这不就是轮询的意思嘛。

到这里，整个负载均衡的流程我们就清楚了。

**4）总结**

SpringCloudRibbon的底层采用了一个拦截器，拦截了RestTemplate发出的请求，对地址做了修改。用一幅图来总结一下：

![image-20220615190450845](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220615190450845.png)



基本流程如下：

- 拦截我们的RestTemplate请求http://userservice/user/1
- RibbonLoadBalancerClient会从请求url中获取服务名称，也就是user-service
- DynamicServerListLoadBalancer根据user-service到eureka拉取服务列表
- eureka返回列表，localhost:8081、localhost:8082
- IRule利用内置负载均衡规则，从列表中选择一个，例如localhost:8081
- RibbonLoadBalancerClient修改请求地址，用localhost:8081替代userservice，得到http://localhost:8081/user/1，发起真实请求

### 负载均衡策略

- **自定义负载均衡策略** --- **在服务消费者中配置**

  给服务消费者定义IRule

  > **注意**：一般用默认的负载均衡规则，不做修改。

  - 方式一：启动类中定义Bean

    ```java
    @Bean
    public IRule randomRule(){
        return new RandomRule();
    }
    ```

  - 方式二：配置文件中给 **服务提供者** 配置负载均衡策略

    ```yaml
    userservice: ## 给某个微服务配置负载均衡规则，这里是userservice服务
      ribbon:
        NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RandomRule ## 负载均衡规则 
    ```

- 饥饿加载 --- **在服务消费者中配置**

  Ribbon默认是采用懒加载，即第一次访问时才会去创建LoadBalanceClient，请求时间会很长。

  而饥饿加载则会在项目启动时创建，降低第一次访问的耗时，通过下面配置开启饥饿加载：

  **在服务消费者中配置**

  ```yaml
  ribbon:
    eager-load:
      enabled: true
      clients: userservice
  ```

- 负载均衡的规则都定义在IRule接口中，而IRule有很多不同的实现类：

<img src="http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220615190730583.png" alt="image-20220615190730583" style="zoom:33%;" />

不同规则的含义如下：

| **内置负载均衡规则类**    | **规则描述**                                                 |
| ------------------------- | ------------------------------------------------------------ |
| RoundRobinRule            | 简单轮询服务列表来选择服务器。它是Ribbon默认的负载均衡规则。 |
| AvailabilityFilteringRule | 对以下两种服务器进行忽略：   （1）在默认情况下，这台服务器如果3次连接失败，这台服务器就会被设置为“短路”状态。短路状态将持续30秒，如果再次连接失败，短路的持续时间就会几何级地增加。  （2）并发数过高的服务器。如果一个服务器的并发连接数过高，配置了 AvailabilityFilteringRule 规则的客户端也会将其忽略。并发连接数的上限，可以由客户端的`<clientName>`.`<clientConfigNameSpace>`.ActiveConnectionsLimit属性进行配置。 |
| WeightedResponseTimeRule  | 为每一个服务器赋予一个权重值。服务器响应时间越长，这个服务器的权重就越小。这个规则会随机选择服务器，这个权重值会影响服务器的选择。 |
| **ZoneAvoidanceRule**     | 以区域可用的服务器为基础进行服务器的选择。使用Zone对服务器进行分类，这个Zone可以理解为一个机房、一个机架等。而后再对Zone内的多个服务做轮询。 |
| BestAvailableRule         | 忽略那些短路的服务器，并选择并发数较低的服务器。             |
| RandomRule                | 随机选择一个可用的服务器。                                   |
| RetryRule                 | 重试机制的选择逻辑                                           |

默认的实现就是ZoneAvoidanceRule，是一种轮询方案

## Feign远程调用

RestTemplate存在的问题

- 代码可读性差，编程体验不统一

- 参数复杂URL难以维护

Feign替代RestTemplate

### 使用

- 引入依赖

  ```xml
  <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-openfeign</artifactId>
  </dependency>
  ```

- 启动类添加注解@EnableFeignClients

- 编写feign客户端：在服务消费者模块的client包下创建接口

  - 服务名称
  - 请求方式
  - 请求路径
  - 请求参数
  - 返回值类型

  ```java
  @FeignClient("userservice")
  public interface UserClient {
      @GetMapping("/user/{id}")
      User findById(@PathVariable("id") Long id);
  }
  ```

- 测试

  ```Java
  @RestController
  @RequestMapping("order")
  public class OrderController {
     @Autowired
     private OrderService orderService;
     @Autowired
     private UserClient userClient;
      @GetMapping("{orderId}")
      public Order queryOrderByUserId(@PathVariable("orderId") Long orderId) {
          // 根据id查询订单并返回
          Order order = orderService.queryOrderById(orderId);
          User user = userClient.getById(order.getUserId());
          order.setUser(user);
          return order;
      }
  }
  ```

### 自定义配置

Feign可以支持很多的自定义配置，如下表所示：

| 类型                   | 作用             | 说明                                                   |
| ---------------------- | ---------------- | ------------------------------------------------------ |
| **feign.Logger.Level** | 修改日志级别     | 包含四种不同的级别：NONE、BASIC、HEADERS、FULL         |
| feign.codec.Decoder    | 响应结果的解析器 | http远程调用的结果做解析，例如解析json字符串为java对象 |
| feign.codec.Encoder    | 请求参数编码     | 将请求参数编码，便于通过http请求发送                   |
| feign. Contract        | 支持的注解格式   | 默认是SpringMVC的注解                                  |
| feign. Retryer         | 失败重试机制     | 请求失败的重试机制，默认是没有，不过会使用Ribbon的重试 |

一般情况下，默认值就能满足我们使用，如果要自定义时，只需要创建自定义的@Bean覆盖默认Bean即可。



下面以日志为例来演示如何自定义配置。

- 配置文件配置

  - 基于配置文件修改feign的日志级别可以针对单个服务：

    ```yaml
    feign:  
      client:
        config: 
          userservice: ## 针对某个微服务的配置
            loggerLevel: FULL ##  日志级别
    ```

  - 也可以针对所有服务：

    ```yaml
    feign:  
      client:
        config: 
          default: ## 这里用default就是全局配置，如果是写服务名称，则是针对某个微服务的配置
            loggerLevel: FULL ##  日志级别 
    ```

  - 而日志的级别分为四种：

    - NONE：不记录任何日志信息，这是默认值。

    - BASIC：仅记录请求的方法，URL以及响应状态码和执行时间

    - HEADERS：在BASIC的基础上，额外记录了请求和响应的头信息

    - FULL：记录所有请求和响应的明细，包括头信息、请求体、元数据。

- java代码配置

  ```java
  public class DefaultFeignConfiguration  {
      @Bean
      public Logger.Level feignLogLevel(){
          return Logger.Level.BASIC; // 日志级别为BASIC
      }
  }
  ```

  全局生效：写在启动类@EnableFeignClients上

  ```java
  @EnableFeignClients(defaultConfiguration = DefaultFeignConfiguration .class)
  ```

  局部生效：写在对应的@FeignClient上

  ```java
  @FeignClient(value = "userservice", configuration = DefaultFeignConfiguration .class) 
  ```

### 优化

- 日志级别用basic或none

- 底层发http请求默认是URLConnection连接，不支持连接池，改为ApacheHttpClient或OKHttp

  - 引入依赖

    ```xml
    <!--httpClient的依赖 -->
    <dependency>
        <groupId>io.github.openfeign</groupId>
        <artifactId>feign-httpclient</artifactId>
    </dependency>
    ```

  - 配置连接池

    ```yaml
    feign:
      client:
        config:
          default: ## default全局的配置
            loggerLevel: BASIC ## 日志级别，BASIC就是基本的请求和响应信息
      httpclient:
        enabled: true ## 开启feign对HttpClient的支持
        max-connections: 200 ## 最大的连接数
        max-connections-per-route: 50 ## 每个路径的最大连接数
    ```

### 再优化

FeignClient和服务提供者的Controller的restfull请求极度相似，提取为一个接口，放在新的模块，并把相关的pojo，feign的默认配置都放进去

- 优点：

  - 简单
  - 实现了代码共享


- 缺点：

  - 服务提供方、服务消费方紧耦合


  - 参数列表中的注解映射并不会继承，因此Controller中必须再次声明方法、参数列表、注解

- feign-api模块

  - 引入依赖spring-cloud-starter-openfeign

  - 编写User、UserClient、DefailtFeignConfiguration（或application.yml）

  - 引用feign-api依赖，删除相关依赖

  - 包扫描配置

    - 方式一

      ```java
      @EnableFeignClients(basePackages = "cn.itcast.feign.clients")
      ```

    - 方式二

      ```java
      @EnableFeignClients(clients = {UserClient.class})
      ```

## Gateway服务网关

### 概述

Spring Cloud Gateway 是 Spring Cloud 的一个全新项目，该项目是基于 Spring 5.0，Spring Boot 2.0 和 Project Reactor 等响应式编程和事件流技术开发的网关，它旨在为微服务架构提供一种简单有效的统一的 API 路由管理方式。

网关的**核心功能特性**：

- 请求路由：一切请求都必须先经过gateway，但网关不处理业务，而是根据某种规则，把请求转发到某个微服务，这个过程叫做路由。当然路由的目标服务有多个时，还需要做负载均衡。
- 权限控制
- 限流

在SpringCloud中网关的实现包括两种：

- gateway
- zuul

Zuul是基于Servlet的实现，属于阻塞式编程。而SpringCloudGateway则是基于Spring5中提供的WebFlux，属于响应式编程的实现，具备更好的性能

### 使用

- 创建boot工程gateway

- 引入依赖

  ```xml
  <!--网关-->
  <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-gateway</artifactId>
  </dependency>
  <!--nacos服务发现依赖-->
  <dependency>
      <groupId>com.alibaba.cloud</groupId>
      <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
  </dependency>
  ```

- 编写启动类

  ```java
  @SpringBootApplication
  public class GatewayApplication {
  
  	public static void main(String[] args) {
  		SpringApplication.run(GatewayApplication.class, args);
  	}
  }
  ```

- 编写基础配置和路由规则

  - 端口
  - 服务名
  - 路由
    - 路由id：路由的唯一标示
    - 路由目标（uri）：路由的目标地址，http代表固定地址，lb代表根据服务名负载均衡

    - 路由断言（predicates“谓语”）：判断路由的规则，

    - 路由过滤器（filters）：对请求或响应做处理

  ```yaml
  server:
    port: 10010 ## 网关端口
  spring:
    application:
      name: gateway ## 服务名称
    cloud:
      nacos:
        server-addr: localhost:8848 ## nacos地址
      gateway:
        routes: ## 网关路由配置
          - id: user-service ## 路由id，自定义，只要唯一即可
            ## uri: http://127.0.0.1:8081 ## 路由的目标地址 http就是固定地址
            uri: lb://userservice ## 路由的目标地址 lb就是负载均衡，后面跟服务名称
            predicates: ## 路由断言，也就是判断请求是否符合路由规则的条件
              - Path=/user/** ## 这个是按照路径匹配，只要以/user/开头就符合要求
  ```

### 断言工厂

掌握Path，其他了解

| **名称**   | **说明**                       | **示例**                                                     |
| ---------- | ------------------------------ | ------------------------------------------------------------ |
| After      | 是某个时间点后的请求           | -  After=2037-01-20T17:42:47.789-07:00[America/Denver]       |
| Before     | 是某个时间点之前的请求         | -  Before=2031-04-13T15:14:47.433+08:00[Asia/Shanghai]       |
| Between    | 是某两个时间点之前的请求       | -  Between=2037-01-20T17:42:47.789-07:00[America/Denver],  2037-01-21T17:42:47.789-07:00[America/Denver] |
| Cookie     | 请求必须包含某些cookie         | - Cookie=chocolate, ch.p                                     |
| Header     | 请求必须包含某些header         | - Header=X-Request-Id, \d+                                   |
| Host       | 请求必须是访问某个host（域名） | -  Host=**.somehost.org,**.anotherhost.org                   |
| Method     | 请求方式必须是指定方式         | - Method=GET,POST                                            |
| **Path**   | **请求路径必须符合指定规则**   | **- Path=/red/{segment},/blue/****                           |
| Query      | 请求参数必须包含指定参数       | - Query=name, Jack或者-  Query=name                          |
| RemoteAddr | 请求者的ip必须是指定范围       | - RemoteAddr=192.168.1.1/24                                  |
| Weight     | 权重处理                       |                                                              |

### 过滤器工厂GatewayFilter

31种，如

| **名称**             | **说明**                     |
| -------------------- | ---------------------------- |
| AddRequestHeader     | 给当前请求添加一个请求头     |
| RemoveRequestHeader  | 移除请求中的一个请求头       |
| AddResponseHeader    | 给响应结果中添加一个响应头   |
| RemoveResponseHeader | 从响应结果中移除有一个响应头 |
| RequestRateLimiter   | 限制请求的流量               |

- AddRequestHeader

  > **需求**：给所有进入userservice的请求添加一个请求头：Truth=itcast is freaking awesome!

  

  只需要修改gateway服务的application.yml文件，添加路由过滤即可：

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
        - id: user-service 
          uri: lb://userservice 
          predicates: 
          - Path=/user/** 
          filters: ## 过滤器
          - AddRequestHeader=Truth, Itcast is freaking awesome! ## 添加请求头
  ```

  当前过滤器写在userservice路由下，因此仅仅对访问userservice的请求有效

- 默认过滤器

  如果要对所有的路由都生效，则可以将过滤器工厂写到default下。格式如下：

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
        - id: user-service 
          uri: lb://userservice 
          predicates: 
          - Path=/user/**
        default-filters: ## 默认过滤项
        - AddRequestHeader=Truth, Itcast is freaking awesome! 
  ```


### 全局过滤器GlobalFilter

GatewayFilter逻辑固定，不能自定义，GlobalFilter需要自己写代码

实现功能：

- 登录状态判断
- 权限校验
- 请求限流等

原理：实现GlobalFilter接口

```java
public interface GlobalFilter {
    /**
     *  处理当前请求，有必要的话通过{@link GatewayFilterChain}将请求交给下一个过滤器处理
     *
     * @param exchange 请求上下文，里面可以获取Request、Response等信息
     * @param chain 用来把请求委托给下一个过滤器 
     * @return {@code Mono<Void>} 返回标示当前过滤器业务结束
     */
    Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain);
}
```

使用：

> 需求：权限校验
>
> 定义全局过滤器，拦截请求，判断请求的参数是否满足下面条件：
>
> - 参数中是否有authorization“授权”，
>
> - authorization参数值是否为admin
>
> 如果同时满足则放行，否则拦截

- 定义过滤器实现GlobalFilter

  ```java
  @Order(-1)
  @Component
  public class AuthorizeFilter implements GlobalFilter {
      @Override
      public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
          // 1.获取请求参数
          MultiValueMap<String, String> params = exchange.getRequest().getQueryParams();
          // 2.获取authorization参数
          String auth = params.getFirst("authorization");
          // 3.校验
          if ("admin".equals(auth)) {
              // 放行
              return chain.filter(exchange);
          }
          // 4.拦截
          // 4.1.禁止访问，设置状态码
          exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
          // 4.2.结束处理
          return exchange.getResponse().setComplete();
      }
  }
  ```

过滤器执行顺序

- 请求进入网关会碰到三类过滤器：当前路由的过滤器、DefaultFilter、GlobalFilter

- 请求路由后，会将当前路由过滤器和DefaultFilter、GlobalFilter，合并到一个过滤器链（集合）中，排序后依次执行每个过滤器
- 排序规则
  - 每一个过滤器都必须指定一个int类型的order值，**order值越小，优先级越高，执行顺序越靠前**。
  - GlobalFilter通过实现Ordered接口，或者添加@Order注解来指定order值，由我们自己指定
  - 路由过滤器和defaultFilter的order由Spring指定，默认是按照声明顺序从1递增。
  - 当过滤器的order值一样时，会按照 defaultFilter > 路由过滤器 > GlobalFilter的顺序执行。

### 跨域问题

跨域：uri不一致，即域名（IP）或  端口号

跨域问题：浏览器禁止请求的发起者与服务端发生跨域ajax请求，请求被浏览器拦截的问题

解决方案：CORS，这个以前应该学习过，这里不再赘述了。不知道的小伙伴可以查看https://www.ruanyifeng.com/blog/2016/04/cors.html



Gateway解决跨域问题：

在gateway服务的application.yml文件中，添加下面的配置：

```yaml
spring:
  cloud:
    gateway:
      ## 。。。
      globalcors: ## 全局的跨域处理
        add-to-simple-url-handler-mapping: true ## 解决options请求被拦截问题
        corsConfigurations:
          '[/**]':
            allowedOrigins: ## 允许哪些网站的跨域请求 
              - "http://localhost:8090"
            allowedMethods: ## 允许的跨域ajax的请求方式
              - "GET"
              - "POST"
              - "DELETE"
              - "PUT"
              - "OPTIONS"
            allowedHeaders: "*" ## 允许在请求中携带的头信息
            allowCredentials: true ## 是否允许携带cookie
            maxAge: 360000 ## 这次跨域检测的有效期
```

