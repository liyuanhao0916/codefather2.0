# RabbitMQ

## MQ

- **MQ，消息队列（MessageQueue）**，字面来看就是存放消息的队列。也就是事件驱动架构中的Broker。

- **同步通讯**：Feign调用就属于同步方式，**可以实时得到结果**，但是

  - 耦合度高
  - 性能和吞吐能力下降
  - 有额外的资源消耗
  - 有级联失败问题

- **异步通讯：事件驱动架构Broker**

  > 在事件模式中，支付服务是事件发布者（publisher），在支付完成后只需要发布一个支付成功的事件（event），事件中带上订单id。
  >
  > 订单服务和物流服务是事件订阅者（Consumer），订阅支付成功的事件，监听到事件后完成自己业务即可。
  >
  > 为了解除事件发布者与订阅者之间的耦合，两者并不是直接通信，而是有一个中间人（Broker）。发布者发布事件到Broker，不关心谁来订阅事件。订阅者从Broker订阅事件，不关心谁发来的消息。

  - 好处：
    - 吞吐量提升：无需等待订阅者处理完成，响应更快速

    - 故障隔离：服务没有直接调用，不存在级联失败问题
    - 调用间没有阻塞，不会造成无效的资源占用
    - 耦合度极低，每个服务都可以灵活插拔，可替换
    - 流量削峰：不管发布事件的流量波动多大，都由Broker接收，订阅者可以按照自己的速度去处理事件


  - 缺点：

    - 架构复杂了，业务没有明显的流程线，不好管理

    - 需要依赖于Broker的可靠、安全、性能

    - 系统可用性降低

      系统引入的外部依赖越多，系统稳定性越差。一旦MQ宕机，就会对业务造成影响。

      如何保证MQ的高可用？

    - 系统复杂度提高

      MQ的加入大大增加了系统的复杂度，以前系统间是同步的远程调用，现在是通过MQ进行异步调用。

      如何保证消息没有被重复消费？怎么处理消息丢失情况？那么保证消息传递的顺序性？

    - 一致性问题

      A系统处理完业务，通过MQ给B、C、D三个系统发消息数据，如果B系统、C系统处理成功，D系统处理失败。

      如何保证消息数据处理的一致性？

- 常见的MQ实现

  |            | **RabbitMQ**            | **ActiveMQ**                   | **RocketMQ** | **Kafka**  |
  | ---------- | ----------------------- | ------------------------------ | ------------ | ---------- |
  | 公司/社区  | Rabbit                  | Apache                         | 阿里         | Apache     |
  | 开发语言   | Erlang                  | Java                           | Java         | Scala&Java |
  | 协议支持   | AMQP，XMPP，SMTP，STOMP | OpenWire,STOMP，REST,XMPP,AMQP | 自定义协议   | 自定义协议 |
  | 可用性     | 高                      | 一般                           | 高           | 高         |
  | 单机吞吐量 | 一般                    | 差                             | 高           | 非常高     |
  | 消息延迟   | 微秒级                  | 毫秒级                         | 毫秒级       | 毫秒以内   |
  | 消息可靠性 | 高                      | 一般                           | 高           | 一般       |

## MQ的基本结构

![image-20220629123500558](http://minio.botuer.com/study-node/old/typora202207201921523.png)

RabbitMQ中的一些角色：

- publisher：生产者
- consumer：消费者
- exchange个：交换机，负责消息路由
- queue：队列，存储消息
- virtualHost：虚拟主机，隔离不同租户的exchange、queue、消息的隔离

## RabbitMQ消息模型

![image-20220629124239094](http://minio.botuer.com/study-node/old/typora202207201921719.png)

- 导入工程

  包括三部分

  - mq-demo：父工程，管理项目依赖
  - publisher：消息的发送者
  - consumer：消息的消费者

- publisher实现

  ```java
  public class PublisherTest {
      @Test
      public void testSendMessage() throws IOException, TimeoutException {
          // 1.建立连接
          ConnectionFactory factory = new ConnectionFactory();
          // 1.1.设置连接参数，分别是：主机名、端口号、vhost、用户名、密码
          factory.setHost("192.168.10.101");
          factory.setPort(5672);
          factory.setVirtualHost("/");
          factory.setUsername("admin");
          factory.setPassword("admin");
          // 1.2.建立连接
          Connection connection = factory.newConnection();
  
          // 2.创建通道Channel
          Channel channel = connection.createChannel();
  
          // 3.创建队列
          String queueName = "simple.queue";
          channel.queueDeclare(queueName, false, false, false, null);
  
          // 4.发送消息
          String message = "hello, rabbitmq!";
          channel.basicPublish("", queueName, null, message.getBytes());
          System.out.println("发送消息成功：【" + message + "】");
  
          // 5.关闭通道和连接
          channel.close();
          connection.close();
  
      }
  }
  ```

- consumer实现

  ```java
  public class ConsumerTest {
  
      public static void main(String[] args) throws IOException, TimeoutException {
          // 1.建立连接
          ConnectionFactory factory = new ConnectionFactory();
          // 1.1.设置连接参数，分别是：主机名、端口号、vhost、用户名、密码
          factory.setHost("192.168.10.101");
          factory.setPort(5672);
          factory.setVirtualHost("/");
          factory.setUsername("admin");
          factory.setPassword("admin");
          // 1.2.建立连接
          Connection connection = factory.newConnection();
  
          // 2.创建通道Channel
          Channel channel = connection.createChannel();
  
          // 3.创建队列
          String queueName = "simple.queue";
          channel.queueDeclare(queueName, false, false, false, null);
  
          // 4.订阅消息
          channel.basicConsume(queueName, true, new DefaultConsumer(channel){
              @Override
              public void handleDelivery(String consumerTag, Envelope envelope,
                                         AMQP.BasicProperties properties, byte[] body) throws IOException {
                  // 5.处理消息
                  String message = new String(body);
                  System.out.println("接收到消息：【" + message + "】");
              }
          });
          System.out.println("等待接收消息。。。。");
      }
  }
  ```

## SpringAMQP

SpringAMQP是基于RabbitMQ封装的一套模板，并且还利用SpringBoot对其实现了自动装配

SpringAmqp的官方地址：https://spring.io/projects/spring-amqp

**AMQP**：**A**dvanced **M**essage **Q**ueuing **P**rotocol，是用于在应用程序之间传递业务消息的开放标准。该协议与语言和平台无关，更符合微服务中独立性的要求。

**Spring AMQP**是基于AMQP协议定义的一套API规范，提供了模板来发送和接收消息。包含两部分，其中spring-amqp是基础抽象，spring-rabbit是底层的默认实现。

**SpringAMQP提供了三个功能**：

- 自动声明队列、交换机及其绑定关系
- 基于注解的监听器模式，异步接收消息
- 封装了RabbitTemplate工具，用于发送消息

### 简单队列模型

#### Basic Queue基本队列模型

- 父工程引入依赖

  ```xml
  <!--AMQP依赖，包含RabbitMQ-->
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-amqp</artifactId>
  </dependency>
  ```

- 消息发送：publisher服务的application.yml中添加配置

  ```yaml
  spring:
    rabbitmq:
      host: 192.168.10.101 ## 主机名
      port: 5672 ## 端口
      virtual-host: / ## 虚拟主机
      username: admin ## 用户名
      password: admin ## 密码
  ```

- 测试类SpringAmqpTest，并利用RabbitTemplate实现消息发送

  ```java
  @RunWith(SpringRunner.class)
  @SpringBootTest
  public class SpringAmqpTest {
  
      @Autowired
      private RabbitTemplate rabbitTemplate;
  
      @Test
      public void testSimpleQueue() {
          // 队列名称
          String queueName = "simple.queue";
          // 消息
          String message = "hello, spring amqp!";
          // 发送消息
          rabbitTemplate.convertAndSend(queueName, message);
      }
  }
  ```

- 消息接收：consumer服务的application.yml中添加配置

  ```yaml
  spring:
    rabbitmq:
      host: 192.168.10.101 ## 主机名
      port: 5672 ## 端口
      virtual-host: / ## 虚拟主机
      username: admin ## 用户名
      password: admin ## 密码
  ```

- listener包中新建一个类SpringRabbitListene

  ```java
  @Component
  public class SpringRabbitListener {
  
      @RabbitListener(queues = "simple.queue")
      public void listenSimpleQueueMessage(String msg) throws InterruptedException {
          System.out.println("spring 消费者接收到消息：【" + msg + "】");
      }
  }
  ```

- 启动publisher测试，就会出现一个消息队列，再启动consumer服务，就会把publisher测试类的消息消费掉

#### WorkQueue任务模型

> Work queues，也被称为（Task queues），任务模型。简单来说就是**让多个消费者绑定到一个队列，共同消费队列中的消息**。
>
> 当消息处理比较耗时的时候，可能生产消息的速度会远远大于消息的消费速度。长此以往，消息就会堆积越来越多，无法及时处理。
>
> 此时就可以使用work 模型，多个消费者共同处理消息处理，速度就能大大提高了。

- 消息发送

  ```java
  @Test
  public void testWorkQueue() throws InterruptedException {
      // 队列名称
      String queueName = "simple.queue";
      // 消息
      String message = "hello, message_";
      for (int i = 0; i < 50; i++) {
          // 发送消息
          rabbitTemplate.convertAndSend(queueName, message + i);
          Thread.sleep(20);
      }
  }
  ```

- 消息接收

  ```java
  @RabbitListener(queues = "simple.queue")
  public void listenWorkQueue1(String msg) throws InterruptedException {
      System.out.println("消费者1接收到消息：【" + msg + "】" + LocalTime.now());
      Thread.sleep(20);
  }
  
  @RabbitListener(queues = "simple.queue")
  public void listenWorkQueue2(String msg) throws InterruptedException {
      System.err.println("消费者2........接收到消息：【" + msg + "】" + LocalTime.now());
      Thread.sleep(200);
  }
  ```

- 默认平均分配，改为能者多劳

  consumer服务的application.yml文件，添加配置

  ```yaml
  spring:
    rabbitmq:
      listener:
        simple:
          prefetch: 1 ## 每次只能获取一条消息，处理完成才能获取下一个消息
  ```

### 发布订阅队列模型

简单的消息队列中没有交换机，而订阅模型中多了个exchange角色，即交换机

与简单的消息队列模型不同的是，publisher不再把消息发送到队列中，而是发给交换机，交换机进行一些处理，如

- Fanout广播，消息交给所有队列
- Direct定向，消息交给符合routing key 的队列
- Topic通配符，消息交给符合routing pattern的队列

**Exchange（交换机）只负责转发消息，不具备存储消息的能力**，因此如果没有任何队列与Exchange绑定，或者没有符合路由规则的队列，那么消息会丢失！

#### Fanout Exchange

- 在consumer中创建一个类，声明队列和交换机

  ```java
  @Configuration
  public class FanoutConfig {
      /**
       * 声明交换机
       * @return Fanout类型交换机
       */
      @Bean
      public FanoutExchange fanoutExchange(){
          return new FanoutExchange("itcast.fanout");
      }
  
      /**
       * 第1个队列
       */
      @Bean
      public Queue fanoutQueue1(){
          return new Queue("fanout.queue1");
      }
  
      /**
       * 绑定队列和交换机
       */
      @Bean
      public Binding bindingQueue1(Queue fanoutQueue1, FanoutExchange fanoutExchange){
          return BindingBuilder.bind(fanoutQueue1).to(fanoutExchange);
      }
  
      /**
       * 第2个队列
       */
      @Bean
      public Queue fanoutQueue2(){
          return new Queue("fanout.queue2");
      }
  
      /**
       * 绑定队列和交换机
       */
      @Bean
      public Binding bindingQueue2(Queue fanoutQueue2, FanoutExchange fanoutExchange){
          return BindingBuilder.bind(fanoutQueue2).to(fanoutExchange);
      }
  }
  ```

- 消息接收：在consumer服务的SpringRabbitListener中添加两个方法，作为消费者

  ```java
  @RabbitListener(queues = "fanout.queue1")
  public void listenFanoutQueue1(String msg) {
      System.out.println("消费者1接收到Fanout消息：【" + msg + "】");
  }
  
  @RabbitListener(queues = "fanout.queue2")
  public void listenFanoutQueue2(String msg) {
      System.out.println("消费者2接收到Fanout消息：【" + msg + "】");
  }
  ```

- 消息发送：在publisher服务的SpringAmqpTest类中添加测试方法

  ```java
  @Test
  public void testFanoutExchange() {
      // 队列名称
      String exchangeName = "itcast.fanout";
      // 消息
      String message = "hello, everyone!";
      rabbitTemplate.convertAndSend(exchangeName, "", message);
  }
  ```

#### Direct Exchange

> 在Direct模型下：
>
> - 队列与交换机的绑定，不能是任意绑定了，而是要指定一个`RoutingKey`（路由key）
> - 消息的发送方在 向 Exchange发送消息时，也必须指定消息的 `RoutingKey`。
> - Exchange不再把消息交给每一个绑定的队列，而是根据消息的`Routing Key`进行判断，只有队列的`Routingkey`与消息的 `Routing key`完全一致，才会接收到消息

- 声明交换机和队列，消息接收

  ```java
  @RabbitListener(bindings = @QueueBinding(
      value = @Queue(name = "direct.queue1"),
      exchange = @Exchange(name = "itcast.direct", type = ExchangeTypes.DIRECT),
      key = {"red", "blue"}
  ))
  public void listenDirectQueue1(String msg){
      System.out.println("消费者接收到direct.queue1的消息：【" + msg + "】");
  }
  
  @RabbitListener(bindings = @QueueBinding(
      value = @Queue(name = "direct.queue2"),
      exchange = @Exchange(name = "itcast.direct", type = ExchangeTypes.DIRECT),
      key = {"red", "yellow"}
  ))
  public void listenDirectQueue2(String msg){
      System.out.println("消费者接收到direct.queue2的消息：【" + msg + "】");
  }
  ```

- 消息发送

  ```java
  @Test
  public void testSendDirectExchange() {
      // 交换机名称
      String exchangeName = "itcast.direct";
      // 消息
      String message = "红色警报！日本乱排核废水，导致海洋生物变异，惊现哥斯拉！";
      // 发送消息
      rabbitTemplate.convertAndSend(exchangeName, "red", message);
  }
  ```

#### Topic Exchange

> `Topic`类型的`Exchange`与`Direct`相比，都是可以根据`RoutingKey`把消息路由到不同的队列。只不过`Topic`类型`Exchange`可以让队列在绑定`Routing key` 的时候使用通配符！
>
> `Routingkey` 一般都是有一个或多个单词组成，多个单词之间以”.”分割，例如： `item.insert`
>
> 通配符规则：
>
> `#`：匹配一个或多个词
>
> `*`：匹配不多不少恰好1个词
>
> 举例：
>
> `china.#`：能够匹配`china.news.insert` 或者 `china.news`
>
> `china.*`：只能匹配`china.news`

- 消息接收

  ```java
  @RabbitListener(bindings = @QueueBinding(
      value = @Queue(name = "topic.queue1"),
      exchange = @Exchange(name = "itcast.topic", type = ExchangeTypes.TOPIC),
      key = "china.#"
  ))
  public void listenTopicQueue1(String msg){
      System.out.println("消费者接收到topic.queue1的消息：【" + msg + "】");
  }
  
  @RabbitListener(bindings = @QueueBinding(
      value = @Queue(name = "topic.queue2"),
      exchange = @Exchange(name = "itcast.topic", type = ExchangeTypes.TOPIC),
      key = "#.news"
  ))
  public void listenTopicQueue2(String msg){
      System.out.println("消费者接收到topic.queue2的消息：【" + msg + "】");
  }
  ```

- 消息发送

  ```java
  /**
       * topicExchange
       */
  @Test
  public void testSendTopicExchange() {
      // 交换机名称
      String exchangeName = "itcast.topic";
      // 消息
      String message = "喜报！孙悟空大战哥斯拉，胜!";
      // 发送消息
      rabbitTemplate.convertAndSend(exchangeName, "china.news", message);
  }
  ```

### 消息转换器

> 之前说过，Spring会把你发送的消息序列化为字节发送给MQ，接收消息的时候，还会把字节反序列化为Java对象。
>
> 只不过，默认情况下Spring采用的序列化方式是JDK序列化。众所周知，JDK序列化存在下列问题：
>
> - 数据体积过大
> - 有安全漏洞
> - 可读性差

#### 默认转换器测试

声明一个简单队列

```java
@Bean
public Queue objectQueue(){
    return new Queue("object.queue");
}
```

```java
@Test
public void testSendMap() throws InterruptedException {
    // 准备消息
    Map<String,Object> msg = new HashMap<>();
    msg.put("name", "Jack");
    msg.put("age", 21);
    // 发送消息
    rabbitTemplate.convertAndSend("object.queue", msg);
}
```

#### 配置Json转换器

显然，JDK序列化方式并不合适。我们希望消息体的体积更小、可读性更高，因此可以使用JSON方式来做序列化和反序列化。

**在publisher和consumer两个服务中都引入依赖：**

```xml
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
    <version>2.9.10</version>
</dependency>
```

**配置转换器：在publisher和consumer两个启动类中添加一个Bean**

```java
@Bean
public MessageConverter jsonMessageConverter(){
    return new Jackson2JsonMessageConverter();
}
```

发送消息

```java
@Test
public void testSendMap() throws InterruptedException {
    // 准备消息
    Map<String,Object> msg = new HashMap<>();
    msg.put("name", "Jack");
    msg.put("age", 21);
    // 发送消息
    rabbitTemplate.convertAndSend("object.queue", msg);
}
```

接收消息

```java
@RabbitListener(queues = {"object.queue"})
public void listenerObjectQueue(Map<String, Object> msg){
    System.out.println("收到消息：【" + msg + "】");
}
```

