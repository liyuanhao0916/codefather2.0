# RocketMQ

## 概述

### 基本概念

- **消息Message**：消息系统所传输信息的物理载体，生产和消费数据的最小单位，每条消息必须属于一个主题。

- **主题Topic**：表示一类消息的集合，每个主题包含若干条消息，**每条消息只能属于一个主题**，是RocketMQ进行消息订阅的基本单位

- **标签Tag**：同一主题下区分不同类型的消息，是对Topic的细分

- **队列Queue**：存储消息的物理实体。一个Topic中可以包含多个Queue，每个Queue中存放的就是该Topic的消息。一个Topic的Queue也被称为一个Topic中消息的分区（Partition），**一个Topic的Queue中的消息只能被一个消费者组中的一个消费者消费**。一个Queue中的消息不允许同一个消费者组中的多个消费者同时消费

- **分片Sharding**：分片不同于分区。分片是存放相应Topic的Broker。每个分片中会创建出相应数量的分区，即Queue，每个Queue的大小都是相同的。

- **消息标识MessageId/Key**：每个消息拥有唯一的MessageId，且可以携带具有业务标识的Key，以方便对消息的查询，不过需要注意的是，MessageId有两个：在生产者send()消息时会自动生成一个MessageId（msgId)，当消息到达Broker后，Broker也会自动生成一个MessageId(offsetMsgId)。msgId、offsetMsgId与key都称为消息标识。

  - msgId：由producer端生成

    > msgId = producerIp + 进程pid + MessageClientIDSetter类的ClassLoader的hashCode + 当前时间 + AutomicInteger自增计数器

  - offsetMsgId：由broker端生成

    > offsetMsgId = brokerIp + 物理分区的offset（Queue中的偏移量）

  - key：由用户指定的业务相关的唯一标识

- **注册中心NameServer**：Broker与Topic路由的注册中心，支持Broker的动态注册与发现

  > NameServer是一个几乎无状态节点，可集群部署，节点之间无任何信息同步。

  > Producer与NameServer集群中的其中一个节点（随机选择）建立长连接，定期从NameServer取Topic路由信息，并向提供Topic服务的Master建立长连接，且定时向Master发送心跳。Producer完全无状态，可集群部署。
  >
  > Consumer与NameServer集群中的其中一个节点（随机选择）建立长连接，定期从NameServer取Topic路由信息，并向提供Topic服务的Master、Slave建立长连接，且定时向Master、Slave发送心跳。Consumer既可以从Master订阅消息，也可以从Slave订阅消息，订阅规则由Broker配置决定。

### 集群模式

- #### 单Master模式

  这种方式风险较大，一旦Broker重启或者宕机时，会导致整个服务不可用。不建议线上环境使用,可以用于本地测试。

- #### 多Master模式

  一个集群无Slave，全是Master，例如2个Master或者3个Master，这种模式的优缺点如下：

  - 优点：配置简单，单个Master宕机或重启维护对应用无影响，在磁盘配置为RAID10时，即使机器宕机不可恢复情况下，由于RAID10磁盘非常可靠，消息也不会丢（异步刷盘丢失少量消息，同步刷盘一条不丢），性能最高；
  - 缺点：单台机器宕机期间，这台机器上未被消费的消息在机器恢复之前不可订阅，消息实时性会受到影响。

- #### 多Master多Slave模式（异步）

  每个Master配置一个Slave，有多对Master-Slave，HA采用异步复制方式，主备有短暂消息延迟（毫秒级），这种模式的优缺点如下：

  - 优点：即使磁盘损坏，消息丢失的非常少，且消息实时性不会受影响，同时Master宕机后，消费者仍然可以从Slave消费，而且此过程对应用透明，不需要人工干预，性能同多Master模式几乎一样；
  - 缺点：Master宕机，磁盘损坏情况下会丢失少量消息。

- #### 多Master多Slave模式（同步）

  每个Master配置一个Slave，有多对Master-Slave，HA采用同步双写方式，即只有主备都写成功，才向应用返回成功，这种模式的优缺点如下：

  - 优点：数据与服务都无单点故障，Master宕机情况下，消息无延迟，服务可用性与数据可用性）在主节点宕机后，备机不能自动切换为主机
  - 缺点：性能比异步复制模式略低（大约低10%左右），发送单个消息的RT会略高，且目前版本（4.5.1）在主节点宕机后，备机不能自动切换为主机

## 消息发送样例

- 导入依赖

  ```xml
  <dependency>
      <groupId>org.apache.rocketmq</groupId>
      <artifactId>rocketmq-client</artifactId>
      <version>4.9.4</version>
  </dependency>
  ```

- 消息发送步骤

  ```tex
  1.创建消息生产者producer，并制定生产者组名
  2.指定Nameserver地址
  3.启动producer
  4.创建消息对象，指定主题Topic、Tag和消息体
  5.发送消息
  6.关闭生产者producer
  ```

- 消息接收步骤

  ```tex
  1.创建消费者Consumer，制定消费者组名
  2.指定Nameserver地址
  3.订阅主题Topic和Tag
  4.设置回调函数，处理消息
  5.启动消费者consumer
  ```

### 基本样例

#### 消息发送

##### 同步消息

> 这种可靠性同步地发送方式使用的比较广泛，比如：重要的消息通知，短信通知。

同步发送结果实时返回，故send时，可直接接收返回值SendResult

```java
public class SyncProducer {
	public static void main(String[] args) throws Exception {
		//1.实例化生产者
		DefaultMQProducer producer = new DefaultMQProducer("please_rename_unique_group_name");
		//2.设置nameserver地址
		producer.setNamesrvAddr("192.168.10.101:9876");
		//3.启动
		producer.start();
		//4.模拟发消息
		for (int i = 0; i < 100; i++) {
			//创建消息实例，指定Topic、tag、消息体
			Message message = new Message("TopicTest", "TagA", ("hello,RocketMQ" + i).getBytes(RemotingHelper.DEFAULT_CHARSET));
			//发送消息
			SendResult sendResult = producer.send(message);
			System.out.println(sendResult);
		}
		//5.关闭
		producer.shutdown();
	}
}
```

##### 异步消息

> 异步传输通常用于响应时间敏感的业务场景。

**由于异步发送，消息发送结果不能及时返回，故send时，第二个形参即回调实例**

**注意：异步消息一定要在消息发送完后关闭Producer,否则报错**No route info of this topic, TopicTest

```java
public class AsyncProducer {
	public static void main(String[] args) throws Exception {
		DefaultMQProducer producer = new DefaultMQProducer("please_rename_unique_group_name");
		producer.setNamesrvAddr("192.168.10.101:9876");
		producer.start();
		producer.setRetryTimesWhenSendAsyncFailed(0);
		for (int i = 0; i < 100; i++) {
			Message msg = new Message("TopicTest",
					"TagA",
					"Hello world".getBytes(RemotingHelper.DEFAULT_CHARSET));
			
      // SendCallback接收异步返回结果的回调
			producer.send(msg, new SendCallback() {
				@Override
				public void onSuccess(SendResult sendResult) {
					System.out.println(sendResult);
				}

				@Override
				public void onException(Throwable throwable) {
					throwable.printStackTrace();
				}
			});
		}
    //睡1s，等把消息发完再关闭
		TimeUnit.SECONDS.sleep(1);
		// 如果不再发送消息，关闭Producer实例。
		producer.shutdown();
	}
}
```

##### 单向消息

> 用于需要中等可靠性的情况，例如日志收集。

发送方法用sendOneway

```java
public class OnewayProducer {
	public static void main(String[] args) throws Exception {
		DefaultMQProducer producer = new DefaultMQProducer("name");
		producer.setNamesrvAddr("192.168.10.101:9876");
		producer.start();
		for (int i = 0; i < 100; i++) {
			byte[] body = "hello.OnewayProducer".getBytes();
			Message message = new Message("TopicTest", "TagA", body);
			producer.sendOneway(message);
		}
		TimeUnit.SECONDS.sleep(1);
		producer.shutdown();
	}
}
```

#### 消息接收

##### 负载均衡

默认接受模式为负载均衡：MessageModel.CLUSTERING

```java
public class SomeConsumer {
	public static void main(String[] args) throws Exception {
    //创建消费实例（push或pull）
		DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("cg");
		consumer.setNamesrvAddr("192.168.10.101:9876");
    //指定消费等topic和tag
		consumer.subscribe("TopicTest","*");
    //注册消息监听器，回调函数处理消息
		consumer.registerMessageListener(new MessageListenerConcurrently() {
			// 一旦broker中有了其订阅的消息就会触发该方法的执行
			@Override
			public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> messages, ConsumeConcurrentlyContext context) {
				for (MessageExt message:messages) {
					System.out.println(new String(message.getBody()) + "   " + message.getBrokerName());
				}
				return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
			}
		});
    //启动
		consumer.start();
		System.out.println("Consumer Started");
	}
}
```

##### 广播接收

通过指定MessageModel

每个consumer都能接收到

```java
consumer.setMessageModel(MessageModel.BROADCASTING);
```

### 顺序消息

> 消息有序指的是可以按照消息的发送顺序来消费(FIFO)。RocketMQ可以严格的保证消息有序，可以分为分区有序或者全局有序。
>
> 在默认的情况下消息发送会采取Round Robin轮询方式把消息发送到不同的queue(分区队列)；而消费消息的时候从多个queue上拉取消息，这种情况发送和消费是不能保证顺序
>
> 如果控制发送的顺序消息只依次发送到同一个queue中，消费的时候只从这个queue上依次拉取，则就保证了顺序
>
> - 当发送和消费参与的queue只有一个，则是全局有序
> - 多个queue参与，则为分区有序，即相对每个queue，消息都是有序的

**模拟订单创建 ---> 付款 ---> 完成 ---> 推送 的过程** 

**要保证同一个订单的整个过程在同一个queue中**

**而无需要求每个订单在不同的queue**

```java
public class OrderStep {
	private long orderId;
	private String desc;
  //省略getter、setter、toString
  
  /**
	 * 生成模拟订单数据
	 */
	/*
	 * 15103111039L  创建 付款 完成 推送
	 * 15103111065L  创建 付款 完成
	 * 15103117235L  创建 付款 完成
	 * */
	public List<OrderStep> buildOrders() {
		List<OrderStep> orderList = new ArrayList<OrderStep>();

		OrderStep orderDemo = new OrderStep();
		orderDemo.setOrderId(15103111039L);
		orderDemo.setDesc("创建");
		orderList.add(orderDemo);

		orderDemo = new OrderStep();
		orderDemo.setOrderId(15103111065L);
		orderDemo.setDesc("创建");
		orderList.add(orderDemo);

		orderDemo = new OrderStep();
		orderDemo.setOrderId(15103111039L);
		orderDemo.setDesc("付款");
		orderList.add(orderDemo);

		orderDemo = new OrderStep();
		orderDemo.setOrderId(15103117235L);
		orderDemo.setDesc("创建");
		orderList.add(orderDemo);

		orderDemo = new OrderStep();
		orderDemo.setOrderId(15103111065L);
		orderDemo.setDesc("付款");
		orderList.add(orderDemo);

		orderDemo = new OrderStep();
		orderDemo.setOrderId(15103117235L);
		orderDemo.setDesc("付款");
		orderList.add(orderDemo);

		orderDemo = new OrderStep();
		orderDemo.setOrderId(15103111065L);
		orderDemo.setDesc("完成");
		orderList.add(orderDemo);

		orderDemo = new OrderStep();
		orderDemo.setOrderId(15103111039L);
		orderDemo.setDesc("推送");
		orderList.add(orderDemo);

		orderDemo = new OrderStep();
		orderDemo.setOrderId(15103117235L);
		orderDemo.setDesc("完成");
		orderList.add(orderDemo);

		orderDemo = new OrderStep();
		orderDemo.setOrderId(15103111039L);
		orderDemo.setDesc("完成");
		orderList.add(orderDemo);

		return orderList;
	}
}
```

#### 消息发送

```java
public class Producer {
	public static void main(String[] args) throws Exception {
		DefaultMQProducer producer = new DefaultMQProducer("orders");
		producer.setNamesrvAddr("192.168.10.101:9876");
		producer.start();
		
		List<OrderStep> orderStepList = new OrderStep().buildOrders();

		for (int i = 0; i < orderStepList.size(); i++) {
			String body = " Hello RocketMQ  " + orderStepList.get(i);
			Message msg = new Message("TopicOrders", "TagA", body.getBytes());
      /*
      参数1: 发送的消息
      参数2: 队列选择
      参数3: 选择队列的业务表示（为队列选择提供参数：订单ID）
      */
			SendResult sendResult = producer.send(msg, new MessageQueueSelector() {
				/*
      	参数1: 队列集合，默认4个
      	参数2: 发送的消息
      	参数3: 传进来的业务标识（订单ID）
      	*/
        @Override
				public MessageQueue select(List<MessageQueue> mqs, Message message, Object arg) {
					Long id = (Long) arg;
					int index = (int)(id % mqs.size());
					return mqs.get(index);
				}
			}, orderStepList.get(i).getOrderId());
			System.out.println(sendResult);
		}
		producer.shutdown();
	}
}
```

#### 消息接收

```java
public class Consumer {
	public static void main(String[] args) throws Exception {
		DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("orders");
		consumer.setNamesrvAddr("192.168.10.101:9876");
		consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);
		consumer.subscribe("TopicOrders","TagA || TagB || TagC");
		consumer.registerMessageListener(new MessageListenerOrderly() {
			Random random = new Random();

			@Override
			public ConsumeOrderlyStatus consumeMessage(List<MessageExt> messages, ConsumeOrderlyContext context) {
				context.setAutoCommit(true);
				for (MessageExt message:messages) {
					System.out.println("consumeThread = "+ Thread.currentThread().getName()
							+ ", queue = " + message.getQueueId()
							+ ", content : " + new String(message.getBody()));
				}

				try {
					TimeUnit.MILLISECONDS.sleep(random.nextInt(10));
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				return ConsumeOrderlyStatus.SUCCESS;
			}
		});
		consumer.start();
		System.out.println("Consumer Started");
	}
}
```

### 延时消息

> 当消息写入到Broker后，在指定的时长后才可被消费处理的消息，称为延时消息。
> 采用RocketMQ的延时消息可以实现 定时任务 的功能，而无需使用定时器。典型的应用场景是，电商交易中超时未支付关闭订单的场景，12306平台订票超时未支付取消订票的场景

延迟时长**不支持随意时长的延迟**,分18个等级

```
messageDelayLevel = 1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 
1h 2h 1d
```

#### 发送延时消息

```java
public class producer {
	public static void main(String[] args) throws Exception {
		DefaultMQProducer producer = new DefaultMQProducer("please_rename_unique_group_name");
		producer.setNamesrvAddr("192.168.10.101:9876;192.168.10.102:9876");
		producer.start();
		for (int i = 0; i < 10; i++) {
			byte[] body = ("hello,RocketMQ" + i).getBytes();
			Message message = new Message("TopicTest", "TagA", body);
			//设置延迟等级
			message.setDelayTimeLevel(5);
			SendResult sendResult = producer.send(message);
		}
		producer.shutdown();
	}
}
```

### 批量消息

> 每次只能发送不超过4MB的消息，否则需要分割

#### 发送批量消息

将message放到集合中，直接send集合即可

```java
public class producer {
	public static void main(String[] args) throws Exception {
		DefaultMQProducer producer = new DefaultMQProducer("please_rename_unique_group_name");
		producer.setNamesrvAddr("192.168.10.101:9876;192.168.10.102:9876");
		producer.start();

		String topic = "TopicBatch";
		String tag = "TagA";
		List<Message> messages = new ArrayList<Message>();

		for (int i = 0; i < 10; i++) {
			byte[] body = ("Hello Batch "+ i).getBytes();
			Message message = new Message(topic, tag, body);
			messages.add(message);
		}
		producer.send(messages);
		producer.shutdown();
	}
}
```

#### 分割

```java
public class ListSplitter implements Iterator<List<Message>> {
   private final int SIZE_LIMIT = 1024 * 1024 * 4;
   private final List<Message> messages;
   private int currIndex;
   public ListSplitter(List<Message> messages) {
           this.messages = messages;
   }
    @Override 
    public boolean hasNext() {
       return currIndex < messages.size();
   }
   	@Override 
    public List<Message> next() {
       int nextIndex = currIndex;
       int totalSize = 0;
       for (; nextIndex < messages.size(); nextIndex++) {
           Message message = messages.get(nextIndex);
           int tmpSize = message.getTopic().length() + message.getBody().length;
           Map<String, String> properties = message.getProperties();
           for (Map.Entry<String, String> entry : properties.entrySet()) {
               tmpSize += entry.getKey().length() + entry.getValue().length();
           }
           tmpSize = tmpSize + 20; // 增加日志的开销20字节
           if (tmpSize > SIZE_LIMIT) {
               //单个消息超过了最大的限制
               //忽略,否则会阻塞分裂的进程
               if (nextIndex - currIndex == 0) {
                  //假如下一个子列表没有元素,则添加这个子列表然后退出循环,否则只是退出循环
                  nextIndex++;
               }
               break;
           }
           if (tmpSize + totalSize > SIZE_LIMIT) {
               break;
           } else {
               totalSize += tmpSize;
           }

       }
       List<Message> subList = messages.subList(currIndex, nextIndex);
       currIndex = nextIndex;
       return subList;
   }
}
//把大的消息分裂成若干个小的消息
ListSplitter splitter = new ListSplitter(messages);
while (splitter.hasNext()) {
  try {
      List<Message>  listItem = splitter.next();
      producer.send(listItem);
  } catch (Exception e) {
      e.printStackTrace();
      //处理error
  }
}
```

### 过滤消息

#### Tag过滤消息

```java
consumer.subscribe("TOPIC", "TAGA || TAGB || TAGC");
```

#### SQL过滤消息

> 通过发送消息时的属性进行筛选

**只有使用push模式的消费者才能用使用SQL92标准的sql语句**

**必须保证配置文件中开启过滤**

```properties
enablePropertyFilter=true
```

- 基本语法

  - 数值比较，比如：**>，>=，<，<=，BETWEEN，=；**
  - 字符比较，比如：**=，<>，IN；**
  - **IS NULL** 或者 **IS NOT NULL；**
  - 逻辑符号 **AND，OR，NOT；**
  - 常量支持类型为：

    * 数值，比如：**123，3.1415；**
    * 字符，比如：**'abc'，必须用单引号包裹起来；**
    * **NULL**，特殊的常量
    * 布尔值，**TRUE** 或 **FALSE**

- 消息生产者：发送前通过putUserProperty（属性名，属性值）方法设置属性

  ```java
  public class producer {
  	public static void main(String[] args) throws Exception {
  		DefaultMQProducer producer = new DefaultMQProducer("please_rename_unique_group_name");
  		producer.setNamesrvAddr("192.168.10.101:9876;192.168.10.102:9876");
  		producer.start();
  		for (int i = 0; i < 10; i++) {
  			byte[] body = ("Hello RocketMQ " + i).getBytes();
  			Message msg = new Message("TopicFilter", "TagA", body);
  			// 设置一些属性
  			msg.putUserProperty("a", String.valueOf(i));
  			SendResult sendResult = producer.send(msg);
  		}
  		producer.shutdown();
  	}
  }
  ```

- 消费者

  ```java
  public class Consumer {
  	public static void main(String[] args) throws Exception {
  		DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("cg");
  		consumer.setNamesrvAddr("192.168.10.101:9876;192.168.10.102:9876");
  		//sql筛选
      MessageSelector sql = MessageSelector.bySql("a > 8");
  		consumer.subscribe("TopicFilter",sql);
  		consumer.registerMessageListener(new MessageListenerConcurrently() {
  			@Override
  			public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {
  				for (MessageExt msg:list) {
  					String body = new String(msg.getBody());
  					System.out.println(body);
  				}
  				return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
  			}
  		});
  		consumer.start();
  	}
  }
  ```

### 事务消息

> **事务消息不支持延时消息和批量消息**
>
> 为了避免单个消息被检查太多次而导致半队列消息累积，我们默认将单个消息的检查次数限制为 15 次，但是用户可以通过 Broker 配置文件的 `transactionCheckMax`参数来修改此限制。如果已经检查某条消息超过 N 次的话（ N = `transactionCheckMax` ） 则 Broker 将丢弃此消息，并在默认情况下同时打印错误日志。用户可以通过重写 `AbstractTransactionCheckListener` 类来修改这个行为。
>
> 事务消息将在 Broker 配置文件中的参数 transactionMsgTimeout 这样的特定时间长度之后被检查。当发送事务消息时，用户还可以通过设置用户属性 CHECK_IMMUNITY_TIME_IN_SECONDS 来改变这个限制，该参数优先于 `transactionMsgTimeout` 参数。
>
> 事务性消息可能不止一次被检查或消费
>
> 提交给用户的目标主题消息可能会失败，目前这依日志的记录而定。它的高可用性通过 RocketMQ 本身的高可用性机制来保证，如果希望确保事务消息不丢失、并且事务完整性得到保证，建议使用同步的双重写入机制。
>
> 事务消息的生产者 ID 不能与其他类型消息的生产者 ID 共享。与其他类型的消息不同，事务消息允许反向查询、MQ服务器能通过它们的生产者 ID 查询到消费者

事务消息共有三种状态，提交状态、回滚状态、中间状态：

* TransactionStatus.CommitTransaction: 提交事务，它允许消费者消费此消息。
* TransactionStatus.RollbackTransaction: 回滚事务，它代表该消息将被删除，不允许被消费。
* TransactionStatus.Unknown: 中间状态，它代表需要检查消息队列来确定状态

#### 发送事务消息

- 事务消息发送及提交

  (1) 发送消息（half消息）。

  (2) 服务端响应消息写入结果。

  (3) 根据发送结果执行本地事务（如果写入失败，此时half消息对业务不可见，本地逻辑不执行）。

  (4) 根据本地事务状态执行Commit或者Rollback（Commit操作生成消息索引，消息对消费者可见）

```java
public class producer {
	public static void main(String[] args) throws Exception {
    //创建事务生产者
		TransactionMQProducer producer = new TransactionMQProducer("pg");
		producer.setNamesrvAddr("192.168.10.101:9876;192.168.10.102:9876");
		//设置事务监听
    producer.setTransactionListener(new TransactionListener() {
			//执行本地事务
			@Override
			public LocalTransactionState executeLocalTransaction(Message message, Object o) {
				if (StringUtils.equals("TagA",message.getTags())){
					return LocalTransactionState.COMMIT_MESSAGE;
				}else if (StringUtils.equals("TagB",message.getTags())){
					return LocalTransactionState.ROLLBACK_MESSAGE;
				} else if (StringUtils.equals("TagC",message.getTags())){
					return LocalTransactionState.UNKNOW;
				}
				return LocalTransactionState.UNKNOW;
			}
			//本地事务返回UNKOWN，进行回查
			@Override
			public LocalTransactionState checkLocalTransaction(MessageExt messageExt) {
				System.out.println("执行消息回查  "+messageExt.getTags());
				return LocalTransactionState.COMMIT_MESSAGE;
			}
		});
		producer.start();

		for (int i = 0; i < 20; i++) {
			String[] tags = new String[]{"TagA","TagB","TagC"};
			byte[] body = ("hello transaction " + i).getBytes();
			Message message = new Message("TopicTransaction", tags[i % tags.length], body);
			TransactionSendResult sendResult = producer.sendMessageInTransaction(message, null);
			System.out.println(sendResult.getSendStatus());
		}
		producer.shutdown();
	}
}
```

## SpringBoot整合RocketMQ

- 添加依赖（可添加到父工程）

  ```xml
  <parent>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-parent</artifactId>
      <version>2.0.1.RELEASE</version>
  </parent>
  
  <properties>
      <maven.compiler.source>8</maven.compiler.source>
      <maven.compiler.target>8</maven.compiler.target>
      <rocketmq-spring-boot-starter-version>2.0.3</rocketmq-spring-boot-starter-version>
  </properties>
  
  <dependencies>
      <dependency>
          <groupId>org.apache.rocketmq</groupId>
          <artifactId>rocketmq-spring-boot-starter</artifactId>
          <version>${rocketmq-spring-boot-starter-version}</version>
      </dependency>
      <dependency>
          <groupId>org.projectlombok</groupId>
          <artifactId>lombok</artifactId>
          <version>1.18.6</version>
      </dependency>
      <dependency>
          <groupId>org.springframework.boot</groupId>
          <artifactId>spring-boot-starter-test</artifactId>
          <scope>test</scope>
      </dependency>
  </dependencies>
  ```

  consumer一般不关闭，故添加一个web依赖

  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  ```

- 配置文件

  ```yaml
  ## application.yml    consumer配置的是consumer组名
  rocketmq:
    name-server: 192.168.10.101:9876;192.168.10.102:9876
    producer:
      group: my-producer
  ```

- 启动类

  ```java
  @SpringBootApplication
  public class MQProducerApplication {
      public static void main(String[] args) {
          SpringApplication.run(MQProducerApplication.class);
      }
  }
  ```

- producer测试类

  ```java
  @RunWith(SpringRunner.class)
  @SpringBootTest(classes = {MQSpringBootApplication.class})
  public class ProducerTest {
  
      @Autowired
      private RocketMQTemplate rocketMQTemplate;
  
      @Test
      public void test1(){
          rocketMQTemplate.convertAndSend("springboot-mq","hello springboot rocketmq");
      }
  }
  ```

- consumer消息监听器

  ```java
  @Slf4j
  @Component
  @RocketMQMessageListener(topic = "springboot-mq",consumerGroup = "${rocketmq-consumer-group}")
  public class Consumer implements RocketMQListener<String> {
  
      @Override
      public void onMessage(String message) {
          log.info("Receive message："+message);
      }
  }
  ```

