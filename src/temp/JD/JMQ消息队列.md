## 名词解析

[名词解释](https://cf.jd.com/pages/viewpage.action?pageId=331672510)

## 消息类型

### 顺序消息

- 严格顺序消息模式，是指发送端发送一系列的消息之后消费端严格按照发送的先后顺序进行消费，注意以下几点：

  ​    1、顺序消息需要在JMQ管理端申请新的顺序消息类型主题，只有顺序消息主题消费消息的时候才会是按顺序推送

  ​    2、消息的顺序由发送者保证，同一个顺序消息主题服务端只允许有一个发送实例进行发送，在起多个实例进行发送时只会有一个实例能发送成功，其余实例会抛出异常

  ​    3、如果起了多个实例消费同一个顺序消息主题，同时只会有一个实例能收到消息

  ​    4、顺序消息默认不会有重试功能，所以当消息消费出错时会一直等到当前消息被消费掉才会继续消费剩余消息

**注：客户端请用2.1.3 以上版本， 除此之外客户端的配置和使用方式与普通类型的消息并无区别！！！**

- 普通顺序消息，与严格顺序消息相比，牺牲了特殊情况下的顺序，保证了正常情况下的高性能。使用方式：

  - 升级客户端到最新版本，

  - 发送消息前通过setOrdered方法设置Message类Ordered属性为true,需要保证顺序的消息之间businessId保证一致，比如要保证同一订单的消息有序，可以设置businessId为订单编号

> **注意事项：**
>
> - **broker group数量变化**和**queue数量变化**，以及由于客户端对有问题的broker会自动摘除，导致**broker数量变化**，都可能导致乱序
>   - **说明：不同订单的消息没有顺序关系，服务端处理时会使用businessId的hash值对该topic分配的broker group数量取模，获得对应broker 后再对queue值取模。**
> - 当发生乱序时，需要手动关闭重试，不能开并行
>   - ***\**\*说明：\*\**\***因为**顺序消息没有重试功能**，所以消费者在遇到消息消费失败并且此消息不需要重传时一定要处理好（判断是该舍弃还是需要重传，如果该舍弃的没舍弃那此消息会一直重复不断的推送给消费者，这样就会造成后边消息无法消费）

### 广播消息

发布-订阅模式也被称为广播模式，广播模式指消息队列的生产者发送一条消息后，具有订阅关系的所有消费者的每个消费实例都能够收到该条消息。为了使用JMQ广播功能，需要注意一下几点：

- 广播模式需要在JMQ管理端申请新的广播类型主题，只有广播主题才能使用广播模式；

- 广播模式默认会在主目录下创建一个offset的文件夹，需要确认主目录具有创建文件权限，具体创建位置也可以设置, config.setTempPath();这个用来配置offsets路径，**在xml配置文件中，配置tempPath属性**

- 广播模式需要有实例名称，默认的是应用名称，也可以自己设置实例名称；如果在一台机器上启动多个广播的实例，需要在consumer标签中配置clientName属性，设置不同的值区分本地offsets

- 广播模式生产者发送的消息有效期为两天，请消费者在两天之内消费完所有消息。

- 消费者客户端版本必须是 2.1.0以上。低版本不适用。

- 新实例上线，会消费到当前服务器能读到的所有消息，**会有大量消息推送**。

- 目前发现，JMQ2客户端（所有低于 2.3.3-RC2 的版本）连接JMQ4服务端，遇到JMQ4服务端主从切换时，会有大量重复消息推送，需要客户端做好大量防重措施。JMQ团队正在修复此问题，需要客户端升级，请静待发版或暂时使用jmq2广播主题

**异常处理**

- 发送方

  > 发送方发送消息过程中出现异常，业务程序应当重发此条消息

- 消费方

  > 广播模式的消费位置管理方式是本地管理，如果消费方消费失败，不会进入重试，不会更新本地消费位置。此外，业务方需要按照业务逻辑做好防止重复消费的处理，不要依赖消息系统生成的属性，这些属性值有可能会被调整（包括messageId）

### 过滤消息

[说明](https://cf.jd.com/pages/viewpage.action?pageId=410220205)

[开发](https://cf.jd.com/pages/viewpage.action?pageId=425503634)

## 接入流程

- 登录站点[JMQ4测试站 ](http://test.ssa.jd.com/sso/login?ReturnUrl=http://test.mq.jd.com/#/zh-CN/application)或[JMQ线上环境](http://taishan.jd.com/jmq/application)

  > 新入职（2019年8月以后）的用户不能登录[test.mq.jd.com](http://test.mq.jd.com/)，只能用其他人ERP登录，密码都是xinxibu456

-  同步/新建应用

  - 已有应用，跳过此步骤
  - 同步应用：登录[管理端](http://test.mq.jd.com/#/zh-CN/application)，路径：Group管理(我的应用)→新建Group(同步应用)，根据提示填写Group名及其它信息。JMQ4只能通过零售JDOS平台同步应用联系人信息，如果没有零售JDOS平台应用参考[创建group应用](https://cf.jd.com/pages/viewpage.action?pageId=946866354)文档创建。
  - 创建令牌：建立完成后，可以在Group管理(我的应用)页面中查看到应用信息，点击Group名跳转到Group信息页面， 点击:SDK令牌-添加 创建一个Token。

  > 注意事项：
  >
  > - **测试环境需要同步应用**，只能通过零售JDOS测试环境同步应用联系人信息，如果没有零售JDOS测试平台应用参考[创建group应用](https://cf.jd.com/pages/viewpage.action?pageId=946866354)文档创建。
  > - **线上环境必须同步应用**，只能通过零售JDOS平台同步应用联系人信息，如果没有零售JDOS平台应用参考[创建group应用](https://cf.jd.com/pages/viewpage.action?pageId=946866354)文档创建。
  > - **注意令牌的有效期**，过期的令牌无法继续使用。

- 创建Topic：消息生产方在接入前，必须申请生产发布。生产发布流程中，可以创建新主题，也可以发布到已有主题上

  - 管理端中，点击：创建Topic
  - 输入Topic信息，点击下一步
  - 如果是jmq客户端可以选择跨机房高可用，分配两个机房的broker；kafka客户端因为要求分区必须联系，因此不能选择跨机房高可用

- 申请生产发布：消息生产方在接入前，必须申请生产发布。生产发布流程中，可以创建新主题，也可以发布到已有主题上 ----- 管理端中，点击：Topic管理→生产发布

  - SDk类型：按实际选择即可。这里选定客户端类型只作为记录，并**不会限制使用其他支持的客户端类型接入**
  - Group：step2中创建应用时自定义的Group名，注意，不是零售jdos的应用名
  - Topic：填写已创建topic的名称
  - 申请描述：供流程的审批者参考的描述信息

- 申请消费订阅：消息消费方在接入前，必须申请消费订阅。消费方不能创建新主题，只能订阅已有主题 --- 管理端中，点击：Topic管理→消费订阅

  - Topic：申请订阅的主题名，可以联系生产方获取或者在Topic管理中搜索
  - Group：step2中创建应用时自定义的Group名，注意，不是零售jdos的应用名
  - SDk类型：按实际选择即可。这里选定客户端类型只作为记录，并**不会限制使用其他支持的客户端类型接入**
  - 其它信息使用默认值或按需填写即可

  > **审批通过后，消费订阅关系并未立刻建立。** 用户需要在：个人中心→我的申请→处理 ，点击”执行”才能真正生效
  >
  > **审批通过后，先不要点击“执行”，如果消费程序还没上线，会产生大量消息积压。**待消费应用程序上线前，再点击“执行”

- 编写客户端代码

  - address

    - jmq4 --- 国内站 - http://taishan.jd.com/jmq/application - nameserver.jmq.jd.local:80

    - jmq2 --- 国内站 - http://jmq.jd.com/ 

      - java客户端配置address：jmq-cluster.jd.local:80
      - 非java客户端应proxy方式接入[proxy.jmq.jd.com](http://proxy.jmq.jd.com/) (172.16.133.29:80)

    - 测试环境，域名无法解析，ping不通域名，（日志报错为：config.address is invaild）处理方法：

      1. 检查address配置，行首行尾不要加入空格

      2. 检查hosts配置，jmq-testcluster.jd.local不要配置hosts

      3. 检查dns配置，公司Mac电脑有时会自动配置dns服务器8.8.8.8，导致域名无法解析，需要在 系统偏好设置-网络-高级-DNS 中删除此配置。

      4. 如果删除后，仍然ping不通，根据自己的操作系统配置以下dns服务器

         > 商城dns配置地址：
         > nameserver 172.16.16.16
         > nameserver 10.16.16.16
         > 金融dns配置地址(不保证可用，需自己联系金融网络同事):
         > nameserver 172.25.11.48
         > (ubuntu环境解析local域名有问题，解决方法请自行谷歌百度)

      5. vpn环境下，报config.address is invaild 使用ip端口替换域名（以下3个ip任选一个）

         > ​       11.91.153.189:50088
         > ​       11.91.153.190:50088
         > ​       11.91.177.249:50088

  - user&app：申请生产发布或者消费订阅选择的Group

  - password：Group管理 -> Group详情 -> SDK令牌 -> token 如果没有添加可以，注意不要过期

    > jmq2 --- 用户名密码：应用--应用管理--搜索到自己的应用--操作–获取连接凭证。
    >
    > jmq4 --- token：Group管理--SDK令牌–添加

- 在测试环境编写代码和调试

- 线上环境申请接入 -- 国内站http://taishan.jd.com/jmq/application

- 预发环境上线验证 ---- JMQ不提供预发环境，可以在JMQ的[线上环境](http://taishan.jd.com/jmq)申请预发主题用于预发环境验证

- 上线CheckList：为了确保系统上线后稳定运行不丢消息，系统首次上线前，务必按照CheckList逐项检查

  > **消费者**
  >
  > - 消费业务逻辑是否具备幂等性？
  > - 是否设置了合理的消费应答超时？
  > - 是否开启了重试服务？
  >
  > **生产者**
  >
  > - 是否捕获了发送消息异常并做了相应的处理？
  > - 是否设置了合适的业务ID？业务ID长度需要小于100个字符，建议小于16个字符且尽量唯一。

- Step 10 系统正式上线

## 原生

### 生产者

- 依赖

  ```xml
  <dependency>
      <groupId>com.jd.jmq</groupId>
      <artifactId>jmq-client-core</artifactId>
      <version>2.3.1</version>
  </dependency>
  <!--日志-->
  <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-simple</artifactId>
      <version>1.7.30</version>
      <scope>runtime</scope>
  </dependency>
  <!--监控-->
  <dependency>
      <groupId>com.jd.jmq</groupId>
      <artifactId>jmq-client-ump</artifactId>
      <version>2.3.1</version>
  </dependency>
  <dependency>
      <groupId>com.jd.ump</groupId>
      <artifactId>profiler</artifactId>
      <version>4.0.5</version>
  </dependency>
  ```

- 生产

  ```java
  public class Jmq2ProducerExample {
      public static void main(String[] args) throws Exception {
  
          TransportManager manager;
          MessageProducer producer;
          String topic = "liyue01";
          String app = "liyue1";
          String address="test-nameserver.jmq.jd.local:50088";
          // JMQ2 测试环境
  //        String address="jmq-testcluster.jd.local:50088";
          String token = "b321fc8ac3324b1bb7e0150ab473f478";
          //连接配置
          TransportConfig config = new TransportConfig();
          config.setApp(app);
          //设置broker地址
          config.setAddress(address);
          //设置用户名
          config.setUser(app);
          //设置密码
          config.setPassword(token);
  
          //创建集群连接管理器
          manager = new ClusterTransportManager(config);
          manager.start();
  
          //创建发送者
          producer = new MessageProducer(manager);
          producer.start();
  
          Message message = new Message(topic, "Hello, World!", "My business id");
  
          try {
              producer.send(message);
              System.out.println("Send success ...");
          } catch (JMQException ex) {
              System.out.println("Send failure !!! cause by " + ex.getCause());
          }
          /*
           * 异步消息
           * producer.send(message, new AsyncSendCallback() {
              @Override
              public void success(PutMessage putMessage, Command command) {
                  System.out.println("Send success ...");
              }
  
              @Override
              public void execption(PutMessage putMessage, Throwable throwable) {
                  System.out.println("Send failure !!! cause by " + throwable.getCause());
              }
          });
           */
          
           /*
           * 事务消息，但是又说目前不支持事务消息
           * producer.send(message, new LocalTransaction<T>() {
  				@Override
  			    public T execute() throws Exception {
  			           //执行代码逻辑如商品库存占用
  			           return t;
  			     }
  			 	@Override
  			    public int getTimeout() {
  			           //设置超时时间
  			          return sendTimeout;
  			             }
                 });
           */
  
          producer.stop();
          manager.stop();
      }
  }
  ```

### 消费者

- 依赖 --- 同生产者

- 消费

  ```java
  public class Jmq2ConsumerExample {
      public static void main(String[] args) throws Exception {
          TransportManager manager;
          MessageConsumer messageConsumer;
          String topic = "liyue01";
          String app = "liyue1";
          String user = "liyue1";
          // JMQ4 测试环境
          String address="test-nameserver.jmq.jd.local:50088";
          // JMQ2 测试环境
  //        String address="jmq-testcluster.jd.local:50088";
          String password = "b321fc8ac3324b1bb7e0150ab473f478";
          //连接配置
          TransportConfig config = new TransportConfig();
          config.setApp(app);
          //设置broker地址
          config.setAddress(address);
          //设置用户名
          config.setUser(user);
          //设置密码
          config.setPassword(password);
          // 如果是广播主题需要设置 tempPath，若不存在最好提前创建
  //        File file = new File("/export/xxx");
  //        if (!file.exists()) {
  //            if (!file.mkdirs()) {
  //                throw new RuntimeException("mkdir failed");
  //            }
  //        }
  //        config.setTempPath(file.getAbsolutePath());
  
          //创建集群连接管理器
          manager = new ClusterTransportManager(config);
          manager.start();
  
          ConsumerConfig consumerConfig = new ConsumerConfig();
          messageConsumer = new MessageConsumer(consumerConfig, manager, null);
  
          //启动消费者
          messageConsumer.start();
          System.out.println("Consumer started, press enter to exit.");
  
          //订阅主题
          messageConsumer.subscribe(topic, messageList -> {
              if (messageList == null || messageList.isEmpty()) {
                  return;
              }
              for (Message message : messageList) {
                  System.out.printf("Received: key(business id): %s, value: %s,%n", message.getBusinessId(), message.getText());
              }
          });
  
          Scanner userInput = new Scanner(System.in);
          userInput.nextLine();
          userInput.close();
          messageConsumer.stop();
          manager.stop();
  
      }
  }
  ```

- （了解）pull模式

  ```java
  public class Jmq2PullConsumerExample {
      public static void main(String[] args) throws Exception {
          TransportManager manager;
          MessageConsumer messageConsumer;
          String topic = "liyue01";
          String app = "liyue1";
          String user = "liyue1";
          String address="test-nameserver.jmq.jd.local:50088";
          String password = "b321fc8ac3324b1bb7e0150ab473f478";
          //连接配置
          TransportConfig config = new TransportConfig();
          config.setApp(app);
          //设置broker地址
          config.setAddress(address);
          //设置用户名
          config.setUser(user);
          //设置密码
          config.setPassword(password);
  
          //创建集群连接管理器
          manager = new ClusterTransportManager(config);
          manager.start();
  
          ConsumerConfig consumerConfig = new ConsumerConfig();
          messageConsumer = new MessageConsumer(consumerConfig, manager, null);
  
          //启动消费者
          messageConsumer.start();
          System.out.println("Consumer stated, press enter to exit.");
  
          Runtime.getRuntime().addShutdownHook(new Thread(() -> {
              messageConsumer.stop();
              manager.stop();
          }));
  
          // 手动PULL模式，每调用一次从服务端拉取一批消息
  
          for(;;) {
              messageConsumer.pull(topic, messageList -> {
                  if (messageList == null || messageList.isEmpty()) {
                      return;
                  }
                  for (Message message : messageList) {
                      System.out.println(String.format("Received: key: %s, value: %s,", message.getBusinessId(), message.getText()));
                  }
              });
          }
      }
  }
  ```

  

## spring

### 生产者

- 依赖

  ```xml
  <dependency>
      <groupId>com.jd.jmq</groupId>
      <artifactId>jmq-client-spring</artifactId>
      <version>2.3.1</version>
  </dependency>
  <!--日志-->
  <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-simple</artifactId>
      <version>1.7.30</version>
      <scope>runtime</scope>
  </dependency>
  <!--监控-->
  <dependency>
      <groupId>com.jd.ump</groupId>
      <artifactId>profiler</artifactId>
      <version>4.0.5</version>
  </dependency>
  ```

- 配置文件

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  
  <beans xmlns="http://www.springframework.org/schema/beans"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns:jmq="http://code.jd.com/schema/jmq"
         xmlns:context="http://www.springframework.org/schema/context"
         xsi:schemaLocation="http://www.springframework.org/schema/beans
      http://www.springframework.org/schema/beans/spring-beans.xsd
      http://code.jd.com/schema/jmq http://code.jd.com/schema/jmq/jmq-1.1.xsd
      http://www.springframework.org/schema/context
                http://www.springframework.org/schema/context/spring-context.xsd
  ">
  
      <context:property-placeholder location="classpath:config.properties"/>
  
  <!--    配置transport，每个transport实例对应一个APP，同一APP如果生产和消费多个主题，只需要配置一个transport实例即可-->
      <jmq:transport address="${jmq.address}" password="${jmq.password}" app="${jmq.app}" user="${jmq.app}"/>
  <!--    配置producer-->
      <jmq:producer id="producer" retryTimes="2" transport="jmq.transport"/>
  
      <bean id="jmq2SpringProducerExample" class="com.jd.jmq.client.examples.jmq2.producer.Jmq2SpringProducerExample">
          <property name="topic" value="${jmq.topic}"/>
          <property name="producer" ref="producer"/>
      </bean>
  </beans>
  ```

- 生产

  ```java
  public class Jmq2SpringProducerExample {
      private String topic;
      private Producer producer;
  
      public void send() throws JMQException {
          //普通发送方式
          Message message = new Message(topic, "消息内容", "业务ID");
          producer.send(message);
      }
  
      public void sendBatch() throws JMQException {
          //批量发送方式
          List<Message> messages = new ArrayList<>(10);
          for (int i = 0; i < 10; i++) {
              Message message = new Message(topic, "消息内容" + i, "业务ID" + i);
              messages.add(message);
          }
          producer.send(messages);
      }
  
      public void setTopic(String topic) {
          this.topic = topic;
      }
  
      public void setProducer(Producer producer) {
          this.producer = producer;
      }
  }
  ```

### 消费者

- 依赖 --- 同生产者

- 配置文件

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  
  <beans xmlns="http://www.springframework.org/schema/beans"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns:jmq="http://code.jd.com/schema/jmq"
         xmlns:context="http://www.springframework.org/schema/context"
         xsi:schemaLocation="http://www.springframework.org/schema/beans
      http://www.springframework.org/schema/beans/spring-beans.xsd
      http://code.jd.com/schema/jmq http://code.jd.com/schema/jmq/jmq-1.1.xsd
      http://www.springframework.org/schema/context
                http://www.springframework.org/schema/context/spring-context.xsd
  ">
  
      <context:property-placeholder location="classpath:config.properties"/>
  
  <!--    配置transport，每个transport实例对应一个APP，同一APP如果生产和消费多个主题，只需要配置一个transport实例即可-->
      <jmq:transport address="${jmq.address}" password="${jmq.password}" app="${jmq.app}" user="${jmq.user}"/>
  
  <!--    配置Consumer，messageListener bean需要实现com.jd.jmq.client.consumer.MessageListener接口，在onMessage方法中接收消息。-->
      <jmq:consumer id="consumer" transport="jmq.transport">
          <jmq:listener topic="${jmq.topic}" listener="messageListener"/>
      </jmq:consumer>
      <bean id="messageListener" class="com.jd.jmq.client.examples.jmq2.consumer.Jmq2SpringConsumerExample" init-method="init"/>
  
  <!--    使用PULL模式消费按下面的方式配置，不需要再配置jmq:consumer-->
      <bean class="com.jd.jmq.client.examples.jmq2.consumer.Jmq2SpringPullConsumerExample"
            init-method="init" destroy-method="destory" scope="singleton">
          <property name="topic" value="${jmq.topic2}"/>
          <property name="consumer" ref="consumer"/>
      </bean>
  </beans>
  ```

- 消费

  ```java
  public class Jmq2SpringConsumerExample implements MessageListener {
      public void init() {
          System.out.println("JMQ message listener started.");
      }
      @Override
      public void onMessage(List<Message> messages) {
          if (messages == null || messages.isEmpty()) {
              return;
          }
  
          for (Message message : messages) {
              System.out.println(String.format("Received: key: %s, value: %s,", message.getBusinessId(), message.getText()));
          }
      }
  }
  ```

- （了解）pull模式

  ```java
  public class Jmq2SpringPullConsumerExample {
      private String topic;
      private Consumer consumer;
      private boolean stopped = false;
  
      private final Executor executor = Executors.newSingleThreadExecutor();
  
      public void init() {
          System.out.println("JMQ2 pull consumer started.");
          executor.execute(() -> {
              while (!stopped) {
                  consumer.pull(topic, messageList -> {
                      if (messageList == null || messageList.isEmpty()) {
                          return;
                      }
                      for (Message message : messageList) {
                          System.out.println(String.format("Received: key: %s, value: %s,", message.getBusinessId(), message.getText()));
                      }
                  });
              }
          });
      }
  
      public void destory() {
          stopped = true;
      }
  
      public void setTopic(String topic) {
          this.topic = topic;
      }
  
      public void setConsumer(Consumer consumer) {
          this.consumer = consumer;
      }
  }
  ```

## SpringBoot

### 生产者

- 依赖

  ```xml
  <dependency>
      <groupId>com.jd.jmq</groupId>
      <artifactId>jmq2-client-springboot-starter</artifactId>
  </dependency>
  <!--或者springboot1-->
  <dependency>
      <groupId>com.jd.jmq</groupId>
      <artifactId>jmq2-client-springboot1-starter</artifactId>
      <version>1.0.0-SNAPSHOT</version>
  </dependency>
  ```

- 生产

  ```java
  @Component
  public class ProducerDemo {
  
      @JmqProducer(name = "producer1")
      private Producer producer1;
  
      @JmqProducer(name = "producer2")
      private Producer producer2;
  
      // producer1 和 producer3 实际上是同一个实例
      @JmqProducer(name = "producer1")
      private Producer producer3;
  
      @Value("${demo.topic}")
      private String topic;
  
  
      public void sendMessage() throws Exception {
          // 不需要 producer1.start()
          producer1.send(new Message(topic, "helloworld", "bId"));
      }
  }
  ```

### 消费者

- 依赖 --- 同生产者

- 消费

  ```java
  @Component
  public class ConsumerDemo {
  
      // topic 支持通配符
      @JmqListener(id= "consumer1", topics = {"${demo.topic}", "jmqq3", "jmqq2"})
      public void onMessage(List<Message> messages) {
          for (Message message: messages) {
              System.out.println("topic: " + message.getTopic() + " , body: " + new String(message.getByteBody()));
          }
      }
  
      // 同一消费者可以同时绑定多个 JmqListener，以实现不同的 topic 使用不同的 messageListener
      @JmqListener(id= "consumer1", topics = {"jmqq"})
      public void onMessage2(List<Message> messages) {
          for (Message message: messages) {
              System.out.println("topic: " + message.getTopic() + " , body: " + new String(message.getByteBody()));
          }
      }
  }
  ```

  



