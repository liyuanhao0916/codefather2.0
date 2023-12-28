# WebSocket



## SpringBoot+WebSocket

**依赖**

```xml
<!--websocket-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

**配置类**

```java
@Configuration
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * EndPoint扫描器，自动扫描@ServerEndpoint
     *
     * @return
     */
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }

    /**
     * websocket 配置信息
     *
     * @return
     */
    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean bean = new ServletServerContainerFactoryBean();
        //文本缓冲区大小
        bean.setMaxTextMessageBufferSize(8192);
        //字节缓冲区大小
        bean.setMaxBinaryMessageBufferSize(8192);
        return bean;
    }

}
```

**重要的注解**

- @ServerEndpoint	用于声明websocket响应类，有点像@RequestMapping	@ServerEndpoint(“/websocket”)
- @OnOpen	websocket连接时触发	参数有：Session session, EndpointConfig config
- @OnMessage	有消息时触发	参数很多，一会再说
- @OnClose	连接关闭时触发	参数有：Session session, CloseReason closeReason
- @OnError	有异常时触发	参数有：Session session, Throwable throwable

**基本使用**

```java
@Log4j2
@Controller
@ServerEndpoint("/websocket")
public class BaseWebsocketController
{

	//使用 ConcurrentHashMap, 保证线程安全, static全局共享 session
	
	//这里之所以static，是因为这个类不是单例的！！
	//他虽然有@Controller注解，但是不适用Ioc容器中拿对象，每一次请求过来都是一个新的对象
	
    //存放 session
    private final static Map<String, Session> sessions = new ConcurrentHashMap<>();

    //onopen 在连接创建(用户进入聊天室)时触发
    @OnOpen
    public void openSession(Session session, EndpointConfig config){}

	//响应字符串
    @OnMessage
    public void onMessage(Session session, String message){}

	//响应字节流
    @OnMessage
    public void onMessage(Session session, byte[] message){}

    //onclose 在连接断开(用户离开聊天室)时触发
    @OnClose
    public void closeSession(Session session, CloseReason closeReason){}

    @OnError
    public void sessionError(Session session, Throwable throwable){}
}
```

> 这里有两个 @OnMessage， 这是因为websocket能发送三种请求（我知道的三种），一种是**字符串**，一种是**字节流**（用于上传文件），一种是**ping-pong**（乒乓机制）
>
> 因为js不好发送ping请求，我这里就只有**响应字符串和字节流**两种方法。



### 发消息

```java
@ServerEndpoint(value = "/ws/{from_user}")
@Component
@Slf4j
public class TestEndPoint {

    //用于存放消息 <key：发送方id , value：session>
    private static final Map<Long, Session> onlineUsers = new ConcurrentHashMap<>();

    /*
     * @ServerEndpoint 是由WebSocket容器而不是Spring容器进行管理的。
     * 因此，你不能在这个类中直接使用`@Autowired`注入Spring bean。
     * 为了解决这个问题，你可以将`userMessageMapper`设为静态变量，然后在Spring容器启动时管理 testEndPoint 这个 bean 的时候注入 userMessageMapper。
     * */
    private static UserMessageMapper userMessageMapper;

    @Autowired
    public void setUserMessageMapper(UserMessageMapper userMessageMapper) {
        TestEndPoint.userMessageMapper = userMessageMapper;
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("from_user") Long fromUser) {

        System.out.println(userMessageMapper);
        onlineUsers.put(fromUser, session);
        log.info("### 新用户加入，用户名 = {}，在线人数 = {}", UserData.USER_MAP.get(fromUser).getUsername(), onlineUsers.size());
        List<String> userList = onlineUsers.keySet().stream().map(id -> UserData.USER_MAP.get(id).getUsername()).collect(Collectors.toList());
        for (Long userId : onlineUsers.keySet()) {
            try {
                onlineUsers.get(userId).getBasicRemote().sendText(JSON.toJSONString(userList));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    @OnMessage
    public void onMessage(String message, @PathParam("from_user") Long fromUser) throws IOException {
        //获取toId、msg
        JSONObject jsonObject = JSON.parseObject(message);
        Long toId = jsonObject.getLong("toId");
        String msg = jsonObject.getString("msg");

        //创建message对象
        Date sendDate = new Date();
        UserMessage textUserMessage = UserMessage.builder()
                .fromUser(fromUser)
                .toUser(toId)
                .msg(msg)
                .status(1)  // 未读
                .sendDate(sendDate)
                .build();
        // 将消息保存到MongoDB
        userMessageMapper.insert(textUserMessage);
        // 判断to用户是否在线
        Session toSession = onlineUsers.get(toId);
        if (toSession != null && toSession.isOpen()) {
            Date readDate = new Date();
            // TODO 具体格式与前端对接
            UserMessageVo userMessageVo = new UserMessageVo();
            BeanUtils.copyProperties(textUserMessage, userMessageVo);
            userMessageVo.setFromUserName(UserData.USER_MAP.get(fromUser).getUsername());
            userMessageVo.setToUserName(UserData.USER_MAP.get(toId).getUsername());
            toSession.getBasicRemote().sendText(JSON.toJSONString(userMessageVo));
            //更新消息状态
            userMessageMapper.updateById(UserMessage.builder()
                    .status(2)
                    .readDate(readDate)
                    .id(textUserMessage.getId())
                    .build());
        }
    }

    @OnClose
    public void onClose(@PathParam("from_user") Long fromUser) {
        onlineUsers.remove(fromUser);
    }

    @OnError
    public void onError(Session session, Throwable e) {
        log.error("## e=", e);
    }
}
```

> 注意：`TestEndPoint`类同时被`@ServerEndpoint`和`@Component`注解，所以它既是一个WebSocket的端点又是一个Spring的组件。因此，WebSocket容器和Spring容器都会创建并管理`TestEndPoint`的一个实例。但是，这两个实例是不同的，即它们在内存中的地址不同。
>
> Spring容器支持依赖注入，所以在Spring容器创建并管理的`TestEndPoint`实例中，可以通过`@Autowired`注解注入依赖。当Spring容器创建`TestEndPoint`实例并调用`setUserMessageMapper()`方法时，`userMessageMapper`静态变量就会被赋值。
>
> 然而，WebSocket容器并不支持Spring的依赖注入，所以在WebSocket容器创建并管理的`TestEndPoint`实例中，`@Autowired`注解不会起作用，`userMessageMapper`静态变量不会被赋值。
>
> 但是，由于`userMessageMapper`是静态变量，它是属于`TestEndPoint`类的，而不是任何一个`TestEndPoint`实例。所以，无论是Spring容器的`TestEndPoint`实例还是WebSocket容器的`TestEndPoint`实例，它们都可以访问到这个静态变量。这就是为什么需要使用静态变量和静态方法进行注入，这样可以让WebSocket容器的`TestEndPoint`实例也能够访问到通过Spring容器注入的`UserMessageMapper`实例。

### 传文件