# WebSocket

## 概述

### 概念

- WebSocket 是HTML5一种新的协议。它实现了浏览器与服务器全双工通信(full-duplex)，一开始的握手需要借助HTTP请求完成

-  WebSocket是真正实现了全双工通信的服务器向客户端推的互联网技术。 它是一种在单个TCP连
  接上进行全双工通讯协议

- Websocket通信协议与2011年倍IETF定为标准RFC 6455，Websocket API被W3C定为标准

  > **全双工**（Full Duplex）是通讯传输的一个术语。通信允许数据在两个方向上同时传输，它在能力上相当于两个单工通信方式的结合。全双工指可以同时（瞬时）进行信号的双向传输（A→B且B→A）。指A→B的同时B→A，是瞬时同步的
  > **单工、半双工**（Half Duplex），所谓半双工就是指一个时间段内只有一个动作发生。早期的对讲机、以及早期集线器等设备都是基于半双工的产品。随着技术的不断进步，半双工会逐渐退出历史舞台

- 浏览器支持情况：https://caniuse.com/#search=websocket

- 服务器支持情况：Tomcat 7.0.47+以上才支持

### http与websocket

- http协议是短连接，因为请求之后，都会关闭连接，下次重新请求数据，需要再次打开链接
- WebSocket协议是一种长链接，只需要通过一次请求来初始化链接，然后所有的请求和响应都是通过这个TCP链接进行通讯

## 快速入门

### 创建工程

- 引入依赖

  ```xml
  <dependencies>
      <dependency>
          <groupId>javax</groupId>
          <artifactId>javaee-api</artifactId>
          <version>7.0</version>
          <scope>provided</scope>
      </dependency>
  </dependencies>
  ```

- tomcat插件

  ```xml
  <build>
      <plugins>
          <!-- 配置Tomcat插件 -->
          <plugin>
              <groupId>org.apache.tomcat.maven</groupId>
              <artifactId>tomcat7-maven-plugin</artifactId>
              <version>2.2</version>
              <configuration>
                  <port>8082</port>
                  <path>/</path>
              </configuration>
          </plugin>
      </plugins>
  </build>
  ```

- tomcat8:run-war启动

### 相关注解

- @ServerEndpoint("/websocket/{uid}")
  - 申明这是一个websocket服务
  - 需要指定访问该服务的地址，在地址中可以指定参数，需要通过{}进行占位
- @OnOpen
  - 用法：public void onOpen(Session session, @PathParam("uid") String uid) throws IOException{}
  - 该方法将在建立连接后执行，会传入session对象，就是客户端与服务端建立的长连接通道
  - 通过@PathParam获取url申明中的参数
- @OnClose
  - 用法：public void onClose() {}
  - 该方法是在连接关闭后执行
- @OnMessage
  - 用法：public void onMessage(String message, Session session) throws IOException {}
  - 该方法用于接收客户端发来的消息
  - message：发来的消息数据
  - session：会话对象（也是通道）
  - 发送消息到客户端
    - 用法：session.getBasicRemote().sendText("你好");
    - 通过session进行发送

### 实现

```java
@ServerEndpoint("/websocket/{uid}")
public class MyWebSocket {
    @OnOpen
    public void onOpen(Session session, @PathParam("uid") String uid) throws IOException {
        // 连接成功
        session.getBasicRemote().sendText(uid + "，你好，欢迎连接WebSocket！");
    }
    @OnClose
    public void onClose() {
        System.out.println(this + "关闭连接");
    }
    @OnMessage
    public void onMessage(String message, Session session) throws IOException {
        System.out.println("接收到消息：" + message);
        session.getBasicRemote().sendText("消息已收到.");
    }
    @OnError
    public void onError(Session session, Throwable error) {
    	System.out.println("发生错误");
    	error.printStackTrace();
    }
}
```

- 启动tomcat

- 测试http://wstool.js.org/

  ```ws
  ws://127.0.0.1:8082/websocket/zhangsan
  ```

- 连接不上

  > 导航到“控制面板” > “程序” > “程序和功能” > “启用或禁用 Windows 功能”（位于屏幕左侧） 
  > 打开以下节点：“Internet Information Services” > “万维网服务” > “应用程序开发功能” 
  > 选择“WebSocket 协议”功能。 选择“确定”

### SpringBoot整合

#### 依赖

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.1.0.RELEASE</version>
</parent>

<packaging>war</packaging>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
</dependencies>
```

#### 编写处理器

- **继承文本处理，实现注册**

```java
package cn.itcast.websocket.spring;

@Component
public class MyHandler extends TextWebSocketHandler implements WebSocketConfigurer {

    //消息处理
    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        System.out.println("获取消息 >>" + message.getPayload());
        session.sendMessage(new TextMessage("收到"));
        //对指定的消息进行返回
        //若发送了10，返回0-9，其他不返回任何信息
        if(message.getPayload().equals("10")){
            for (int i = 0; i < 10; i++) {
                session.sendMessage(new TextMessage("消息 -> " + i));
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    //连接处理
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        session.sendMessage(new TextMessage("欢迎连接到ws服务"));
    }

    //断开处理
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status){
        System.out.println("断开连接！");
    }

    //注册
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry webSocketHandlerRegistry) {
        webSocketHandlerRegistry.addHandler(new MyHandler(),"/ws").setAllowedOrigins("*");
    }
}
```

#### 编写配置类

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig {
}
```

#### 启动类

```java
@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

#### 配置文件

```yaml
spring:
  application:
    name: websorcket

server:
  port: 8081
```

#### 测试

```
ws://127.0.0.1:8081/ws
发送10，返回0-9
```

#### 编写拦截器

- 实现HandshakeInterceptor“握手拦截器”

```java
@Component
public class MyHandshakeInterceptor implements HandshakeInterceptor {

    /**
     * 握手之前，若返回false，则不建立链接
     * @param serverHttpRequest
     * @param serverHttpResponse
     * @param webSocketHandler
     * @param map
     * @return
     * @throws Exception
     */
    @Override
    public boolean beforeHandshake(ServerHttpRequest serverHttpRequest, ServerHttpResponse serverHttpResponse, WebSocketHandler webSocketHandler, Map<String, Object> map) throws Exception {
        //将用户id放入socket处理器的会话(WebSocketSession)中
        map.put("uid",1001);
        System.out.println("开始握手。。。。。。。");
        return true;
    }
    //握手后
    @Override
    public void afterHandshake(ServerHttpRequest serverHttpRequest, ServerHttpResponse serverHttpResponse, WebSocketHandler webSocketHandler, Exception e) {
        System.out.println("握手成功啦。。。。。。");
    }
}
```

- 拦截器添加到处理器

```java
@Component
public class MyHandler extends TextWebSocketHandler implements WebSocketConfigurer {

    @Autowired
    private MyHandshakeInterceptor myHandshakeInterceptor;
    //消息处理
    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        System.out.println("获取消息 >>" + message.getPayload());
        session.sendMessage(new TextMessage("收到"));
        //对指定的消息进行返回
        //若发送了10，返回0-9，其他不返回任何信息
        if(message.getPayload().equals("10")){
            for (int i = 0; i < 10; i++) {
                session.sendMessage(new TextMessage("消息 -> " + i));
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    //连接处理
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        session.sendMessage(new TextMessage("欢迎连接到ws服务"));
    }

    //断开处理
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status){
        System.out.println("断开连接！");
    }

    //注册
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry webSocketHandlerRegistry) {
        webSocketHandlerRegistry.addHandler(new MyHandler(),"/ws").setAllowedOrigins("*").addInterceptors(myHandshakeInterceptor);
    }
}
```