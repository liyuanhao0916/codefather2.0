# Redis

## 命令

### 登录

```sh
redis-cli -h localhost -p 6379 -a 1234  #登录		-p -h可省略 
#-a也可省略
redis-cli
AUTH 1234  #进入交互后输入密码
ping #测试心跳 返回pong正常

select 0 #选择库
help @genneric  #查通用组命令帮助文档
help set #查具体命令文档
```

### 通用

```sh
#在生产环境下，不推荐使用keys 命令，因为这个命令在key过多的情况下，效率不高
keys 		#查看符合模板的所有key  支持通配符 key *

del  		#删除某个key 支持删除多个
exists 	#是否存在
expire	#设置有效期  
ttl			#查剩余有效期	未设置返回-1，到期返回-2
```

### String

*   string、int、float都是String类型，底层都是byte\[]存储，但是编码方式不同
*   key的层级结构：`项目名:业务名:类型:id`

```sh
set key value
get key
mset k1 v1 k2 v2
mget k1 k2

incr key     				#自增
decy key						#自减 可用自定义自增步长代替
incrby key num			#自定义自增步长
incrbyfloat key num #自定义浮点型自增步长

setnx key value  		#不存在增加
setex key time value#含有效期增加

set botuer:user:1 '{"id":1, "name": "Jack", "age": 21}'
```

### Hash

*   类似HashMap

```sh
hset key field value
hmset key f1 v1 f2 v2

hget key field
hmget key f1 f2
hgetall key							#获取key的所有字段和值
hkeys key								#获取key的字段
hincrby key field				#自定义自增步长
hsetnx key field value	#不存在增加
```

### List

*   类似LinkedList，双向链表，支持双向检索
    *   有序
    *   可重复
    *   插入、删除速度快
    *   查询速度一般
*   多用于存储有序数据，如点赞列表、评论列表

```sh
lpush key element...  #可插入多个
rpush key element...  		
lrange key star end		#按索引查，0开始

#查，并移除
lpop key [几个]				#可取出多个
rpop key [几个]
blpop key timeout			#取一个，设置超时时间，临时阻塞
```

### Set

*   类似HashSet
    *   无序
    *   不重复
    *   查找速度快
    *   支持交、并、差

```sh
sadd key member...		#添加一个或多个
srem key member...		#移除一个或多个
scard key							#查个数
smembers key					#查全部
sismember key member	#判断是否含有某元素

sinter k1 k2					#交集
sdiff k1 k2						#差集
sunion k1 k2					#并集
```

### SortedSet

*   类似TreeSet，但底层差异很大，SortedSet“排序Set”，是对每个元素score属性排序，默认生序
    *   排序
    *   不重复
    *   查询速度快
*   多用于排行榜

```sh
zadd key s1 m1 s2 m2
zrem key member
zscore key member			#查分
zcard key							#查个数

zrank key member			#查排名（默认升序）
zcount key min max		#查一定范围score的个数
zrange key min max		#查指定排名的元素
zrangebyscore key min max #查一定范围score的元素
zrev...								#降序查

zincrby key 步长 menber#让指定score自增

zinter k1 k2
zdiff k1 k2
zunion k1 k2
```

### 其他

- 位图 ( Bitmaps ) --- 签到
- 基数统计 ( HyperLogLogs ) --- 统计
- 地理坐标（Geo） --- 附近
- 流（Streams） --- 队列

## java客户端与整合

### Jedis

[GitHub - redis/jedis: Redis Java client designed for performance and ease of use.](https://github.com/redis/jedis)

*   依赖

    ```xml
    <dependency>
        <groupId>redis.clients</groupId>
        <artifactId>jedis</artifactId>
        <version>4.2.0</version>
    </dependency>
    ```

*   测试类中测试

    ```java
    public class JedisTest {

    	private Jedis jedis;
      
      //创建连接
    	@BeforeEach
    	void setUp() {
    		jedis = new Jedis("192.168.10.108", 6379);
    		jedis.auth("1234");
    	}

    	@Test
    	void testString() {
    		jedis.set("name","李一玓");
    		System.out.println(jedis.get("name"));
    	}
    	@Test
    	public void testHash(){
    		jedis.hset("user:1","name","liyuanhao");
    		System.out.println(jedis.hget("user:1","name"));
    	}
    	//关闭资源
    	@AfterEach
    	void tearDown() {
    		if (jedis != null) {
    			jedis.close();
    		}
    	}
    }
    ```

*   jedis的连接池

    ```java
    public class JedisConnectionFactory {
    	public static final JedisPool jedisPool;
    	static {
    		JedisPoolConfig jedisPoolConfig = new JedisPoolConfig();
    		jedisPoolConfig.setMaxTotal(8);
    		jedisPoolConfig.setMaxIdle(8);
    		jedisPoolConfig.setMinIdle(0);
    
    		jedisPool = new JedisPool(jedisPoolConfig,"192.168.10.108",6379,1000,"1234");
    	}
    	public static Jedis getJedis(){
    		return jedisPool.getResource();
    	}
    }
    ```

    ```java
    public class JedisTest {
    
    	private Jedis jedis;
    
    	@BeforeEach
    	void setUp() {
    		//jedis = new Jedis("192.168.10.108", 6379);
    		//this.jedis.auth("1234");
    		jedis = JedisConnectionFactory.getJedis();
    
    	}
    	@Test
    	public void testList(){
    		jedis.lpush("helloList","hao are you");
    		System.out.println(jedis.lrange("helloList",0,2));
    	}
    
    	@AfterEach
    	void tearDown() {
    		if (jedis != null) {
    			jedis.close();
    		}
    	}
    }
    ```

### SpringDataRedis

SpringData是Spring中数据操作的模块，包含对各种数据库的集成，其中对Redis的集成模块就叫做SpringDataRedis，官网地址：`<https://spring.io/projects/spring-data-redis>`

*   提供了对不同Redis客户端的整合（Lettuce和Jedis）
*   提供了RedisTemplate统一API来操作Redis
*   支持Redis的发布订阅模型
*   支持Redis哨兵和Redis集群
*   支持基于Lettuce的响应式编程
*   支持基于JDK.JSON.字符串.Spring对象的数据序列化及反序列化
*   支持基于Redis的JDKCollection实现

SpringDataRedis中提供了RedisTemplate工具类，其中封装了各种对Redis的操作。并且将不同数据类型的操作API封装到了不同的类型中：

![image-20220721204103020](http://minio.botuer.com/study-node/old/typora202207212041141.png)

### SpringBoot整合

*   依赖

    ```xml
    <!--redis依赖-->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <!--Jackson依赖-->
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
    </dependency>
    <!--lombok-->
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>
    <!--test-->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
    ```

*   application.yml

    ```yml
    spring:
      redis:
        host: 192.168.10.108
        port: 6379
        password: 1234
        lettuce:  #默认是lettuce的连接池
          pool:
            max-active: 8  #最大连接
            max-idle: 8   #最大空闲连接
            min-idle: 0   #最小空闲连接
            max-wait: 100ms #连接等待时间
    ```

*   测试

    *   jdk序列化，可读性差，内存占用大，key可能对应不上

        ```java
        @SpringBootTest
        public class RedisTest {

        	@Autowired
        	private RedisTemplate redisTemplate;
        	@Test
        	public void test() {
        		redisTemplate.opsForValue().set("name","111111");
        		Object name = redisTemplate.opsForValue().get("name");
        		System.out.println(name);
        	}
        }
        ```

    *   自定义序列化--json：占内存

        ```json
        {
          //通过@class反序列化
          "@class": "com.botuer.springdataredistest.pojo.User",
          "name": "李某某",
          "age": 12
        }
        ```

        ```java
        //创建配置类
        @Configuration
        public class RedisConfig {

            @Bean
            public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory){
                // 创建RedisTemplate对象
                RedisTemplate<String, Object> template = new RedisTemplate<>();
                // 设置连接工厂
                template.setConnectionFactory(connectionFactory);
                // 创建JSON序列化工具
                GenericJackson2JsonRedisSerializer jsonRedisSerializer = 
                    							new GenericJackson2JsonRedisSerializer();
                // 设置Key的序列化
                template.setKeySerializer(RedisSerializer.string());
                template.setHashKeySerializer(RedisSerializer.string());
                // 设置Value的序列化
                template.setValueSerializer(jsonRedisSerializer);
                template.setHashValueSerializer(jsonRedisSerializer);
                // 返回
                return template;
            }
        }
        ```

        ```java
        @SpringBootTest
        public class RedisTest {

        	@Autowired
        	private RedisTemplate<String, Object> redisTemplate;
        	@Test
        	public void test() {

        		User user = new User("李某某", 12);
        		redisTemplate.opsForValue().set("user",user);
        		Object user1 = redisTemplate.opsForValue().get("user");
        		System.out.println(user1);
        	}
        }
        ```

    *   **StringRedisTemplate + 手动序列化**

        *   jackson是SpringBoot自带的json序列化工具，ObjectMapper类
            *   writeValueAsString（实体对象）
            *   readValue（jsonStr，实体类）
        *   fastjson需要导入依赖（alibaba的fastjson）
            *   JSON.toJSONString(实体对象);
            *   JSON.parseObject(jsonStr, 实体类);

        ```java
        @SpringBootTest
        class RedisStringTests {
        
            @Autowired
            private StringRedisTemplate stringRedisTemplate;
            private static final ObjectMapper mapper = new ObjectMapper();
        
            @Test
            void testSaveUser() throws JsonProcessingException {
                // 创建对象
                User user = new User("虎哥", 21);
                // 手动序列化
                String json = mapper.writeValueAsString(user);
                // 写入数据
                stringRedisTemplate.opsForValue().set("user:200", json);
                // 获取数据
                String jsonUser = stringRedisTemplate.opsForValue().get("user:200");
                // 手动反序列化
                User user1 = mapper.readValue(jsonUser, User.class);
                System.out.println("user1 = " + user1);
            }
        
        }
        ```

## 应用

### 短信登录

#### session实现

![image-20221113215740406](http://minio.botuer.com/study-node/old/image-20221113215740406.png)

##### 发送、登录、注册

- 发送验证码
  - 校验手机号格式`RegexUtils.isPhoneInvalid(phone)`
  - 生成验证码`RandomUtil.randomNumbers(6)`
  - 保存到session`session.setAttribute("code",code)`
  - 发送验证码`调用第三方api`
- 登录/注册
  - 校验手机号
  - 获取验证码`session.getAttribute("code")`
  - 校验验证码`cacheCode == null || !cacheCode.toString().equals(code)`
  - 根据手机号`查库`
    - 不存在，根据手机号创建用户
    - 存在，保存到session`session.setAttribute("user",user)`

##### 登录拦截

- 登陆拦截

  ```java
  public class LoginInterceptor implements HandlerInterceptor {
  
      @Override
      public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
         //1.获取session
          HttpSession session = request.getSession();
          //2.获取session中的用户
          Object user = session.getAttribute("user");
          //3.判断用户是否存在
          if(user == null){
                //4.不存在，拦截，返回401状态码
                response.setStatus(401);
                return false;
          }
          //5.存在，保存用户信息到Threadlocal
          UserHolder.saveUser((User)user);
          //6.放行
          return true;
      }
  }
  ```

  ```java
  @Configuration
  public class MvcConfig implements WebMvcConfigurer {
  
      @Resource
      private StringRedisTemplate stringRedisTemplate;
  
      @Override
      public void addInterceptors(InterceptorRegistry registry) {
          // 登录拦截器
          registry.addInterceptor(new LoginInterceptor())
                  .excludePathPatterns(
                          "/shop/**",
                          "/voucher/**",
                          "/shop-type/**",
                          "/upload/**",
                          "/blog/hot",
                          "/user/code",
                          "/user/login"
                  ).order(1);
          // token刷新的拦截器
          registry.addInterceptor(new RefreshTokenInterceptor(stringRedisTemplate)).addPathPatterns("/**").order(0);
      }
  }
  ```

##### 隐藏敏感信息

- 隐藏用户敏感信息

  - 创建VO或TO，无敏感信息进行返回

  - 登录时返回vo对象`session.setAttribute("user", BeanUtils.copyProperties(user,UserDTO.class))`

  - 拦截器中vo保存到ThreadLocal中`UserHolder.saveUser((UserDTO) user)`

  - **在UserHolder处：将user对象换成UserDTO**

    ```java
    public class UserHolder {
        private static final ThreadLocal<UserDTO> tl = new ThreadLocal<>();
    
        public static void saveUser(UserDTO user){
            tl.set(user);
        }
    
        public static UserDTO getUser(){
            return tl.get();
        }
    
        public static void removeUser(){
            tl.remove();
        }
    }
    ```


#### redis实现

- session的问题：分布式下的tomcat中的session不共享，这台机器有，换台机器就没了，登录拦截存在问题，可以拷贝session到多台服务器
  - 每台都有，浪费，服务器压力大
  - 拷贝存在延迟
- 数据类型的选择
  - string：更直观，但是每次增删改查都是完整大对象，性能不好，数据量小时可以考虑
  - hash：value是键值对，更新时只需要更新对应的属性即可，性能好

![image-20221113222022687](http://minio.botuer.com/study-node/old/image-20221113222022687.png)

##### 隐藏敏感信息

- 敏感信息保护
  - 以手机号为key容易暴露隐私
  - 随机生成以一个token令牌更合适

##### 发送、登录、注册

- 发送验证码

  - 校验手机号格式`RegexUtils.isPhoneInvalid(phone)`
  - 生成验证码`RandomUtil.randomNumbers(6)`
  - 保存到redis`stringRedisTemplate.opsForValue().set(LOGIN_CODE_KEY + phone)`
  - 发送验证码`调用第三方api`

- 登录/注册

  - 校验手机号

  - 从redis获取验证码`stringRedisTemplate.opsForValue().get(LOGIN_CODE_KEY + phone)`

  - 校验验证码

  - 根据手机号`查库`

    - 不存在，根据手机号创建用户

    - 存在，保存到redis

      ```java
      // 7.1.随机生成token，作为登录令牌
      String token = UUID.randomUUID().toString(true);
      // 7.2.将User对象转为HashMap存储
      UserDTO userDTO = BeanUtil.copyProperties(user, UserDTO.class);
      Map<String, Object> userMap = BeanUtil.beanToMap(userDTO, new HashMap<>(),
              CopyOptions.create()
                      .setIgnoreNullValue(true)
                      .setFieldValueEditor((fieldName, fieldValue) -> fieldValue.toString()));
      // 7.3.存储
      String tokenKey = LOGIN_USER_KEY + token;
      stringRedisTemplate.opsForHash().putAll(tokenKey, userMap);
      // 7.4.设置token有效期
      stringRedisTemplate.expire(tokenKey, LOGIN_USER_TTL, TimeUnit.MINUTES);
      ```

##### 拦截器

- 拦截器

  ![image-20221113223545624](http://minio.botuer.com/study-node/old/image-20221113223545624.png)

  - 问题：只拦截登录路径，其他路径不拦截，导致token有效期不能刷新

  - 解决：再加一个拦截器

    ![image-20221113223729851](http://minio.botuer.com/study-node/old/image-20221113223729851.png)

    ```java
    public class RefreshTokenInterceptor implements HandlerInterceptor {
    
        private StringRedisTemplate stringRedisTemplate;
    
        public RefreshTokenInterceptor(StringRedisTemplate stringRedisTemplate) {
            this.stringRedisTemplate = stringRedisTemplate;
        }
    
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
            // 1.获取请求头中的token
            String token = request.getHeader("authorization");
            if (StrUtil.isBlank(token)) {
                return true;
            }
            // 2.基于TOKEN获取redis中的用户
            String key  = LOGIN_USER_KEY + token;
            Map<Object, Object> userMap = stringRedisTemplate.opsForHash().entries(key);
            // 3.判断用户是否存在
            if (userMap.isEmpty()) {
                return true;
            }
            // 5.将查询到的hash数据转为UserDTO
            UserDTO userDTO = BeanUtil.fillBeanWithMap(userMap, new UserDTO(), false);
            // 6.存在，保存用户信息到 ThreadLocal
            UserHolder.saveUser(userDTO);
            // 7.刷新token有效期
            stringRedisTemplate.expire(key, LOGIN_USER_TTL, TimeUnit.MINUTES);
            // 8.放行
            return true;
        }
    
        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
            // 移除用户
            UserHolder.removeUser();
        }
    }
    ```

    ```java
    public class LoginInterceptor implements HandlerInterceptor {
    
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
            // 1.判断是否需要拦截（ThreadLocal中是否有用户）
            if (UserHolder.getUser() == null) {
                // 没有，需要拦截，设置状态码
                response.setStatus(401);
                // 拦截
                return false;
            }
            // 有用户，则放行
            return true;
        }
    }
    ```

### 秒杀

#### 分布式ID

- 优惠券的id

  - 需要全局唯一

  - 若使用订单的自增id存在问题：

    - 规律明显，容易猜出敏感信息，如订单量
    - 受单表数据量限制，数据量大需要拆表，id可能一样，但逻辑上还是一张表，必须保证id唯一

  - **全局ID生成器**，是一种在分布式系统下用来生成全局唯一ID的工具

    - 常见：UUID、雪花算法、redis自增ID等

    - **redis自增ID**一般要满足下列特性
      - 唯一性
      - 递增
      - 安全
      - 高可用
      - 高性能
    - **redis自增ID**组成
      - 符号位：1bit，永远为0
      - 时间戳：31bit，以秒为单位，可以使用69年
      - 序列号：32bit，秒内的计数器，支持每秒产生2^32个不同ID

    ```java
    @Component
    public class RedisIdWorker {
        /**
         * 开始时间戳
         */
        private static final long BEGIN_TIMESTAMP = 1640995200L;
        /**
         * 序列号的位数
         */
        private static final int COUNT_BITS = 32;
    
        private StringRedisTemplate stringRedisTemplate;
    
        public RedisIdWorker(StringRedisTemplate stringRedisTemplate) {
            this.stringRedisTemplate = stringRedisTemplate;
        }
    
        public long nextId(String keyPrefix) {
            // 1.生成时间戳
            LocalDateTime now = LocalDateTime.now();
            long nowSecond = now.toEpochSecond(ZoneOffset.UTC);
            long timestamp = nowSecond - BEGIN_TIMESTAMP;
    
            // 2.生成序列号
            // 2.1.获取当前日期，精确到天
            String date = now.format(DateTimeFormatter.ofPattern("yyyy:MM:dd"));
            // 2.2.自增长
            long count = stringRedisTemplate.opsForValue().increment("icr:" + keyPrefix + ":" + date);
    
            // 3.拼接并返回
            return timestamp << COUNT_BITS | count;
        }
    }
    ```

  - **redis自增ID**测试

    ```java
    @Test
    void testIdWorker() throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(300);
    
        Runnable task = () -> {
            for (int i = 0; i < 100; i++) {
                long id = redisIdWorker.nextId("order");
                System.out.println("id = " + id);
            }
            latch.countDown();
        };
        long begin = System.currentTimeMillis();
        for (int i = 0; i < 300; i++) {
            es.submit(task);
        }
        latch.await();
        long end = System.currentTimeMillis();
        System.out.println("time = " + (end - begin));
    }
    ```

    CountDownLatch名为信号枪：主要的作用是同步协调在多线程的等待于唤醒问题

    > 当异步程序没有执行完时，主线程已经执行完，我们期望的是分线程全部走完，主线程再走

    CountDownLatch 中有两个最重要的方法

    - countDown
    - await

    await 方法 是阻塞方法，我们担心分线程没有执行完时，main线程就先执行，所以使用await可以让main线程阻塞

    当CountDownLatch  内部维护的 变量变为0时，就不再阻塞，直接放行

    - 调用一次countDown ，内部变量就减少1，我们让分线程和变量绑定， 执行完一个分线程就减少一个变量，直到解除阻塞，统计出来的时间也就是所有分线程执行完后的时间

#### 秒杀逻辑

- 查询优惠券
- 判断是否具备秒杀条件
  - 秒杀是否开始
  - 秒杀是否结束
  - 库存是否充足
  - *一人一券一单*：查库：是否用券下过单（**存在并发问题**）
- 扣减库存（**存在并发问题**）
- 创建订单（订单id，用户id，优惠券id）（**存在并发问题**）

#### 并发问题

> **乐观锁**比较适合**更新**数据，而**插入**数据适合使用**悲观锁**

- 扣减库存 --- 乐观锁

  - 每次扣减的sql加上库存的判断条件

    - stock = xxx.getStock()
    - 但是同时进来的其他线程就永远无法满足上述条件，因为库存已经比getStock少一个
    - 故，只要 **stock > 0** 即可

  - cas自旋压力过大

    - AtomicLong中cas自旋压力过大，销毁cpu

    - java8的改进，LongAdder

      - 大量线程并发更新一个原子性的时候，天然的问题就是自旋，会导致并发性问题，当然这也比我们直接使用syn来的好

      - LongAdder来进行优化，如果获取某个值，则会对cell和base的值进行递增，最后返回一个完整的值

        ![image-20221113232703291](http://minio.botuer.com/study-node/old/image-20221113232703291.png)

- 一人一券一单（恶意刷单） --- 悲观锁

  - 锁

    - 降低锁粒度，不能使用同步方法或this锁，只需要锁住当前用户`userId`

    - 为保证是同一把锁，每个线程进来的userId不是同一个对象，所以`userId.toString()`

    - 但**包装类toString()是new String()**，仍不是同一个对象，故`userId.toString().intern()`

      ```java
      @Transactional
      public  Result createVoucherOrder(Long voucherId) {
      	Long userId = UserHolder.getUser().getId();
      	synchronized(userId.toString().intern()){
               // 5.1.查询订单
              int count = query().eq("user_id", userId).eq("voucher_id", voucherId).count();
              // 5.2.判断是否存在
              if (count > 0) {
                  // 用户已经购买过了
                  return Result.fail("用户已经购买过一次！");
              }
      
              // 6.扣减库存
              boolean success = seckillVoucherService.update()
                   .setSql("stock = stock - 1") // set stock = stock - 1
                   .eq("voucher_id", voucherId).gt("stock", 0) // where id = ? and stock > 0
                   .update();
              if (!success) {
                  // 扣减失败
                  return Result.fail("库存不足！");
              }
      
              // 7.创建订单
              VoucherOrder voucherOrder = new VoucherOrder();
              // 7.1.订单id
              long orderId = redisIdWorker.nextId("order");
              voucherOrder.setId(orderId);
              // 7.2.用户id
              voucherOrder.setUserId(userId);
              // 7.3.代金券id
              voucherOrder.setVoucherId(voucherId);
              save(voucherOrder);
      
              // 7.返回订单id
              return Result.ok(orderId);
          }
      }
      ```

  - 事务与锁

    - @Transactional方法被spring的事务控制，

    - 同步代码块执行完，**锁释放**

    - 但当前方法**事务未提交**

    - 新的线程拿到锁，造成并发

      ```java
      Long userId = UserHolder.getUser().getId();
      synchronized(userId.toString().intern()){
          return this.createVoucherOrder(voucherId);
      }
      ```

  - 事务

    - spring的事务是AOP实现的，也就是代理对象处理的事务，**非代理对象执行事务方法不生效**

    - this.的方式调用的事务不生效，需要利用代理对象调用来生效

      ```java
      Long userId = UserHolder.getUser().getId();
      synchronized(userId.toString().intern()){
          // 获取代理对象
          IVoucherOrderService proxy = (IVoucherOrderService)AopContext.currentProxy();
          return proxy.createVoucherOrder(voucherId);
      }
      ```

- 集群下的并发问题 --- [分布式锁](#分布式锁)

  ```java
  public interface ILock{
      boolean tryLock(long timeoutSec);
      void unlock();
  }
  ```

  ```java
  public class SimpleRedisLock implements ILock{
      private static final String KEY_PREFIX="lock:"
      @Override
      public boolean tryLock(long timeoutSec) {
          // 获取线程标示
          String threadId = Thread.currentThread().getId()
          // 获取锁
          Boolean success = stringRedisTemplate.opsForValue()
                  .setIfAbsent(KEY_PREFIX + name, threadId + "", timeoutSec, TimeUnit.SECONDS);
          return Boolean.TRUE.equals(success);
      }
      
      public void unlock() {
          //通过del删除锁
          stringRedisTemplate.delete(KEY_PREFIX + name);
  	}
  }
  ```

  ```java
  //创建锁对象(新增代码)
  SimpleRedisLock lock = new SimpleRedisLock("order:" + userId, stringRedisTemplate);
  //获取锁对象
  boolean isLock = lock.tryLock(1200);
  //加锁失败
  if (!isLock) {
      return Result.fail("不允许重复下单");
  }
  try {
      //获取代理对象(事务)
      IVoucherOrderService proxy = (IVoucherOrderService) AopContext.currentProxy();
      return proxy.createVoucherOrder(voucherId);
  } finally {
      //释放锁
      lock.unlock();
  }
  ```

  - 加锁的原子性问题（死锁）（上述代码不存在）

  - 锁误删

    > - 好多线程都在等锁释放
    > - 但是`线程1`没有手动释放，到期后自动释放
    > - `线程2`拿到锁
    > - `线程1`开始手动释放删除锁，误把线程2的删除了
    >
    > 解决方案：在占锁时加上或者设为UUID值。删除时进行判断

  - 删除的原子性问题

  - 自动续期问题 --- Redisson

    ```java
    //获取锁对象
    RLock lock = redissonClient.getLock("lock:order:" + userId);
    boolean isLock = lock.tryLock();	//看门狗时间30s
    
    //加锁失败
    if (!isLock) {
        return Result.fail("不允许重复下单");
    }
    try {
        //获取代理对象(事务)
        IVoucherOrderService proxy = (IVoucherOrderService) AopContext.currentProxy();
        return proxy.createVoucherOrder(voucherId);
    } finally {
        //释放锁
        lock.unlock();
    }
    ```

#### 优化

> - 将耗时比较短的逻辑判断放入到redis中，比如是否库存足够，比如是否一人一单
> - 这样的操作，只要这种逻辑可以完成，就意味着我们是一定可以下单完成的
> - 我们只需要进行快速的逻辑判断，根本就不用等下单逻辑走完，我们直接给用户返回成功，
> - 再在后台开一个线程，后台线程慢慢的去执行queue里边的消息，而且也不用担心线程池消耗殆尽的问题，因为这里我们的程序中并没有手动使用任何线程池
> - 快速校验一人一单，还有库存判断
>   - 库存放到redis查
>   - 一人一单放到redis的set集合（用户id、优惠券id）
>   - redis没有订单，把订单信息放到queue中，异步完成订单
>   - 下单成功，获取订单id，返回给前端

- **Redis完成秒杀资格判断**

  - 新增秒杀优惠券的同时，将优惠券信息保存到Redis中

  - 基于Lua脚本，判断秒杀库存、一人一单，决定用户是否抢购成功

    ```lua
    -- 1.参数列表
    -- 1.1.优惠券id
    local voucherId = ARGV[1]
    -- 1.2.用户id
    local userId = ARGV[2]
    -- 1.3.订单id
    local orderId = ARGV[3]
    
    -- 2.数据key
    -- 2.1.库存key
    local stockKey = 'seckill:stock:' .. voucherId
    -- 2.2.订单key
    local orderKey = 'seckill:order:' .. voucherId
    
    -- 3.脚本业务
    -- 3.1.判断库存是否充足 get stockKey
    if(tonumber(redis.call('get', stockKey)) <= 0) then
        -- 3.2.库存不足，返回1
        return 1
    end
    -- 3.2.判断用户是否下单 SISMEMBER orderKey userId
    if(redis.call('sismember', orderKey, userId) == 1) then
        -- 3.3.存在，说明是重复下单，返回2
        return 2
    end
    -- 3.4.扣库存 incrby stockKey -1
    redis.call('incrby', stockKey, -1)
    -- 3.5.下单（保存用户）sadd orderKey userId
    redis.call('sadd', orderKey, userId)
    -- 3.6.发送消息到队列中， XADD stream.orders * k1 v1 k2 v2 ...
    redis.call('xadd', 'stream.orders', '*', 'userId', userId, 'voucherId', voucherId, 'id', orderId)
    return 0
    ```

  - 如果抢购成功，将优惠券id和用户id封装后存入阻塞队列

    ```java
    @Override
    public Result seckillVoucher(Long voucherId) {
        //获取用户
        Long userId = UserHolder.getUser().getId();
        long orderId = redisIdWorker.nextId("order");
        // 1.执行lua脚本
        Long result = stringRedisTemplate.execute(
                SECKILL_SCRIPT,
                Collections.emptyList(),
                voucherId.toString(), userId.toString(), String.valueOf(orderId)
        );
        int r = result.intValue();
        // 2.判断结果是否为0
        if (r != 0) {
            // 2.1.不为0 ，代表没有购买资格
            return Result.fail(r == 1 ? "库存不足" : "不能重复下单");
        }
        //TODO 保存阻塞队列
        // 3.返回订单id
        return Result.ok(orderId);
    }
    ```

- **基于阻塞队列实现秒杀优化**

  - 开启线程任务，不断从阻塞队列中获取信息，实现异步下单功能

  - 实现类完整代码

    ```java
    //异步处理线程池
    private static final ExecutorService SECKILL_ORDER_EXECUTOR = Executors.newSingleThreadExecutor();
    // 消息队列
    private BlockingQueue<VoucherOrder> orderTasks = new ArrayBlockingQueue<>(1024 * 1024);
    // 代理对象
    private IVoucherOrderService proxy;
    //在类初始化之后执行，因为当这个类初始化好了之后，随时都是有可能要执行的
    @PostConstruct
    private void init() {
        SECKILL_ORDER_EXECUTOR.submit(new VoucherOrderHandler());
    }
    // 业务逻辑主体
    @Override
    public Result seckillVoucher(Long voucherId) {
        Long userId = UserHolder.getUser().getId();
        long orderId = redisIdWorker.nextId("order");
        // 1.执行lua脚本
        Long result = stringRedisTemplate.execute(
                SECKILL_SCRIPT,
                Collections.emptyList(),
                voucherId.toString(), userId.toString(), String.valueOf(orderId)
        );
        int r = result.intValue();
        // 2.判断结果是否为0
        if (r != 0) {
            // 2.1.不为0 ，代表没有购买资格
            return Result.fail(r == 1 ? "库存不足" : "不能重复下单");
        }
        VoucherOrder voucherOrder = new VoucherOrder();
        // 2.3.订单id
        long orderId = redisIdWorker.nextId("order");
        voucherOrder.setId(orderId);
        // 2.4.用户id
        voucherOrder.setUserId(userId);
        // 2.5.代金券id
        voucherOrder.setVoucherId(voucherId);
        // 2.6.放入阻塞队列
        orderTasks.add(voucherOrder);
        //3.获取代理对象
        proxy = (IVoucherOrderService) AopContext.currentProxy();
        //4.返回订单id
        return Result.ok(orderId);
    }
    @Transactional
    public void createVoucherOrder(VoucherOrder voucherOrder) {
        Long userId = voucherOrder.getUserId();
        // 5.1.查询订单
        int count = query().eq("user_id", userId).eq("voucher_id", voucherOrder.getVoucherId()).count(
        // 5.2.判断是否存在
        if (count > 0) {
            // 用户已经购买过了
            log.error("用户已经购买过了");
            return;
        }
        // 6.扣减库存
        boolean success = seckillVoucherService.update()
                .setSql("stock = stock - 1") // set stock = stock - 1
                .eq("voucher_id", voucherOrder.getVoucherId()).gt("stock", 0) // where id = ? and stoc
                .update();
        if (!success) {
            // 扣减失败
            log.error("库存不足");
            return;
        }
        save(voucherOrder);
    }
    // 用于线程池处理的任务
    // 当初始化完毕后，就会去从对列中去拿信息
    private class VoucherOrderHandler implements Runnable {
        @Override
        public void run() {
            while (true) {
                try {
                    // 1.获取队列中的订单信息
                    VoucherOrder voucherOrder = orderTasks.take();
                    // 2.创建订单
                    handleVoucherOrder(voucherOrder);
                } catch (Exception e) {
                    log.error("处理订单异常", e);
                }
            }
        }
        // 订单放入redis
        private void handleVoucherOrder(VoucherOrder voucherOrder) {
            //1.获取用户
            Long userId = voucherOrder.getUserId();
            // 2.创建锁对象
            RLock redisLock = redissonClient.getLock("lock:order:" + userId);
            // 3.尝试获取锁
            boolean isLock = redisLock.lock();
            // 4.判断是否获得锁成功
            if (!isLock) {
                // 获取锁失败，直接返回失败或者重试
                log.error("不允许重复下单！");
                return;
            }
            try {
                //注意：由于是spring的事务是放在threadLocal中，此时的是多线程，事务会失效
                proxy.createVoucherOrder(voucherOrder);
            } finally {
                // 释放锁
                redisLock.unlock();
            }
        }
    }
    ```

  - 问题

    - 内存限制
    - 数据安全


- **基于Redis的Stream结构作为消息队列，实现异步秒杀下单**

  - 创建一个Stream类型的消息队列，名为stream.orders
  - 修改之前的秒杀下单Lua脚本，在认定有抢购资格后，直接向stream.orders中添加消息，内容包含voucherId、userId、orderId
  - 项目启动时，开启一个线程任务，尝试获取stream.orders中的消息，完成下单

  修改lua表达式,新增3.6 

  ![image-20221114150749099](http://minio.botuer.com/study-node/old/image-20221114150749099.png)

  实现类

  ```java
  private class VoucherOrderHandler implements Runnable {
  
      @Override
      public void run() {
          while (true) {
              try {
                  // 1.获取消息队列中的订单信息 XREADGROUP GROUP g1 c1 COUNT 1 BLOCK 2000 STREAMS s1 >
                  List<MapRecord<String, Object, Object>> list = stringRedisTemplate.opsForStream().read(
                      Consumer.from("g1", "c1"),
                      StreamReadOptions.empty().count(1).block(Duration.ofSeconds(2)),
                      StreamOffset.create("stream.orders", ReadOffset.lastConsumed())
                  );
                  // 2.判断订单信息是否为空
                  if (list == null || list.isEmpty()) {
                      // 如果为null，说明没有消息，继续下一次循环
                      continue;
                  }
                  // 解析数据
                  MapRecord<String, Object, Object> record = list.get(0);
                  Map<Object, Object> value = record.getValue();
                  VoucherOrder voucherOrder = BeanUtil.fillBeanWithMap(value, new VoucherOrder(), true);
                  // 3.创建订单
                  createVoucherOrder(voucherOrder);
                  // 4.确认消息 XACK
                  stringRedisTemplate.opsForStream().acknowledge("s1", "g1", record.getId());
              } catch (Exception e) {
                  log.error("处理订单异常", e);
                  //处理异常消息
                  handlePendingList();
              }
          }
      }
  
      private void handlePendingList() {
          while (true) {
              try {
                  // 1.获取pending-list中的订单信息 XREADGROUP GROUP g1 c1 COUNT 1 BLOCK 2000 STREAMS s1 0
                  List<MapRecord<String, Object, Object>> list = stringRedisTemplate.opsForStream().read(
                      Consumer.from("g1", "c1"),
                      StreamReadOptions.empty().count(1),
                      StreamOffset.create("stream.orders", ReadOffset.from("0"))
                  );
                  // 2.判断订单信息是否为空
                  if (list == null || list.isEmpty()) {
                      // 如果为null，说明没有异常消息，结束循环
                      break;
                  }
                  // 解析数据
                  MapRecord<String, Object, Object> record = list.get(0);
                  Map<Object, Object> value = record.getValue();
                  VoucherOrder voucherOrder = BeanUtil.fillBeanWithMap(value, new VoucherOrder(), true);
                  // 3.创建订单
                  createVoucherOrder(voucherOrder);
                  // 4.确认消息 XACK
                  stringRedisTemplate.opsForStream().acknowledge("s1", "g1", record.getId());
              } catch (Exception e) {
                  log.error("处理pendding订单异常", e);
                  try{
                      Thread.sleep(20);
                  }catch(Exception e){
                      e.printStackTrace();
                  }
              }
          }
      }
  }
  ```

### 消息队列

#### 基于List实现消息队列

Redis的list数据结构是一个双向链表，很容易模拟出队列效果

队列是入口和出口不在一边，因此我们可以利用：LPUSH 结合 RPOP、或者 RPUSH 结合 LPOP来实现

不过要注意的是，当队列中没有消息时RPOP或LPOP操作会返回null，并不像JVM的阻塞队列那样会阻塞并等待消息，因此这里应该使用BRPOP或者BLPOP来实现阻塞效果

```sh
blpop key timeout			#取一个，设置超时时间，临时阻塞
brpop key timeout
```

优点：

* 利用Redis存储，不受限于JVM内存上限
* 基于Redis的持久化机制，数据安全性有保证
* 可以满足消息有序性

缺点：

* 无法避免消息丢失
* 只支持单消费者

#### 基于PubSub的消息队列

PubSub（发布订阅）是Redis2.0版本引入的消息传递模型。顾名思义，消费者可以订阅一个或多个channel，生产者向对应channel发送消息后，所有订阅者都能收到相关消息。

 SUBSCRIBE channel [channel] ：订阅一个或多个频道
 PUBLISH channel msg ：向一个频道发送消息
 PSUBSCRIBE pattern[pattern] ：订阅与pattern格式匹配的所有频道

```sh
SUBSCRIBE channel [channel] 		#订阅一个或多个频道
PUBLISH channel msg					#向一个频道发送消息
PSUBSCRIBE pattern[pattern] 		#订阅与pattern格式匹配的所有频道
```

优点：

* 采用发布订阅模型，支持多生产、多消费

缺点：

* 不支持数据持久化
* 无法避免消息丢失
* 消息堆积有上限，超出时数据丢失

#### 基于Stream的消息队列

Stream 是 Redis 5.0 引入的一种新数据类型，可以实现一个功能非常完善的消息队列。

发送消息的命令：

![image-20221114145730726](http://minio.botuer.com/study-node/old/image-20221114145730726.png)

![](http://minio.botuer.com/study-node/old/image-20221114145730726.png)

读取消息的方式之一：XREAD

![image-20221114145800660](http://minio.botuer.com/study-node/old/image-20221114145800660.png)

![image-20221114145806812](http://minio.botuer.com/study-node/old/image-20221114145806812.png)

XREAD阻塞方式，读取最新的消息：

![image-20221114145820418](http://minio.botuer.com/study-node/old/image-20221114145820418.png)

在业务开发中，我们可以循环的调用XREAD阻塞方式来查询最新消息，从而实现持续监听队列的效果，伪代码如下

![image-20221114145837269](http://minio.botuer.com/study-node/old/image-20221114145837269.png)

注意：当我们指定起始ID为$时，代表读取最新的消息，如果我们处理一条消息的过程中，又有超过1条以上的消息到达队列，则下次获取时也只能获取到最新的一条，会出现漏读消息的问题

STREAM类型消息队列的XREAD命令特点：

* 消息可回溯
* 一个消息可以被多个消费者读取
* 可以阻塞读取
* 有消息**漏读**的风险

#### 基于Stream的消息队列-消费者组

消费者组（Consumer Group）：将多个消费者划分到一个组中，监听同一个队列。具备下列特点：

![image-20221114150459861](http://minio.botuer.com/study-node/old/image-20221114150459861.png)

创建消费者组：

![image-20221114150535384](http://minio.botuer.com/study-node/old/image-20221114150535384.png)

key：队列名称
groupName：消费者组名称
ID：起始ID标示，$代表队列中最后一个消息，0则代表队列中第一个消息
MKSTREAM：队列不存在时自动创建队列
其它常见命令：

 **删除指定的消费者组**

```java
XGROUP DESTORY key groupName
```

 **给指定的消费者组添加消费者**

```java
XGROUP CREATECONSUMER key groupname consumername
```

 **删除消费者组中的指定消费者**

```java
XGROUP DELCONSUMER key groupname consumername
```

从消费者组读取消息：

```java
XREADGROUP GROUP group consumer [COUNT count] [BLOCK milliseconds] [NOACK] STREAMS key [key ...] ID [ID ...]
```

* group：消费组名称
* consumer：消费者名称，如果消费者不存在，会自动创建一个消费者
* count：本次查询的最大数量
* BLOCK milliseconds：当没有消息时最长等待时间
* NOACK：无需手动ACK，获取到消息后自动确认
* STREAMS key：指定队列名称
* ID：获取消息的起始ID：

">"：从下一个未消费的消息开始
其它：根据指定id从pending-list中获取已消费但未确认的消息，例如0，是从pending-list中的第一个消息开始

消费者监听消息的基本思路：

![image-20221114150552194](http://minio.botuer.com/study-node/old/image-20221114150552194.png)

STREAM类型消息队列的XREADGROUP命令特点：

* 消息可回溯
* 可以多消费者争抢消息，加快消费速度
* 可以阻塞读取
* 没有消息漏读的风险
* 有消息确认机制，保证消息至少被消费一次

最后我们来个小对比

![image-20221114150601907](http://minio.botuer.com/study-node/old/image-20221114150601907.png)

### 排行榜

#### 点赞

**实现点赞，用到set的不可重复**

需求：

* 同一个用户只能点赞一次，再次点击则取消点赞
* 如果当前用户已经点赞，则点赞按钮高亮显示（前端已实现，判断字段Blog类的isLike属性）

修改**查询业务**实现：

* 给Blog类中添加一个isLike字段，标示是否被当前用户点赞

  ```java
  @TableField(exist = false)
  private Boolean isLike;
  ```

* 查询blog时设置isLike

  * 获取登录用户
  * 判断是否点过赞`stringRedisTemplate.opsForSet().isMember(key, userId.toString())`
    * 未点赞，setIsLike(false)
    * 已点赞，setIsLike(true)


**点赞业务**实现：

* 获取登录用户
* 判断是否点过赞`stringRedisTemplate.opsForSet().isMember(key, userId.toString())`
  * 未点赞，则可以点赞（更新数据库，赞数+1，用户id放入redis的set中）
  * 已点赞，则取消点赞（更新数据库，赞数-1，用户id在redis中移除）


#### 点赞排行

**实现排序，用到zset即sortedSet**

**修改点赞业务**实现：

- 获取登录用户
- 判断是否点过赞`stringRedisTemplate.opsForZSet().score(key, userId.toString())`
  * 未点赞，则可以点赞（更新数据库，赞数+1，用户id放入redis的set中）
  * 已点赞，则取消点赞（更新数据库，赞数-1，用户id在redis中移除）

**查询top5**

- 查询top5的点赞用户 zrange key 0 4`stringRedisTemplate.opsForZSet().range(key, 0, 4)`
  - 没有，返回空集合`Collections.emptyList()`
  - 有，拿到id，查库

### 关注

#### 关注 - 取关

**关注业务**

- 获取登录用户
- 判断到底是关注还是取关
  - 关注 --- 更新数据库
  - 取关 --- 更新数据库

**查询业务**

- 获取登录用户
- 查询是否关注count > 0

#### 共同关注

使用**set**中**交并补**的api

**关注业务**

- 获取登录用户
- 判断到底是关注还是取关
  - 关注 --- 更新数据库，放入redis的set`stringRedisTemplate.opsForSet().add(key, followUserId.toString())`
  - 取关 --- 更新数据库，删除redis` stringRedisTemplate.opsForSet().remove(key, followUserId.toString())`

**共同关注**

- 获取当前用户
- 求交集`stringRedisTemplate.opsForSet().intersect(key, key2)`
  - 无交集，返回空集合`Collections.emptyList()`
  - 有交集，拿到id集合查库

#### 推送

##### Feed流推送

传统：通过查询被动呈现

Feed：主动推送（投喂）

常见模式

- Timeline：不做内容筛选，简单的按照内容发布时间排序，常用于好友或关注。例如朋友圈

  * 优点：信息全面，不会有缺失。并且实现也相对简单
  * 缺点：信息噪音较多，用户不一定感兴趣，内容获取效率低

- 智能排序：利用智能算法屏蔽掉违规的、用户不感兴趣的内容。推送用户感兴趣信息来吸引用户
  * 优点：投喂用户感兴趣信息，用户粘度很高，容易沉迷
  * 缺点：如果算法不精准，可能起到反作用

Timeline实现方案：

- **拉模式**：也叫做读扩散

  > 博主将消息存放在自己发件箱，等粉丝打开收件箱读取时，向每个博主发件箱拉取消息，进行排序
  >
  > - 优点：比较节约空间，因为粉丝读信息时，并没有重复读取，读取完之后可以清除收件箱
  >
  > - 缺点：比较延迟，当用户读取数据时才去关注的人里边去读取数据，假设用户关注了大量的用户，那么此时就会拉取海量的内容，对服务器压力巨大

- **推模式**：也叫做写扩散。

  > 博主直接推送到粉丝收件箱
  >
  > - 优点：时效快，不用临时拉取
  >
  > - 缺点：内存压力大，假设一个大V写信息，很多人关注他， 就会写很多分数据到粉丝那边去

- **推拉结合模式**：也叫做读写混合，兼具推和拉两种模式的优点。

  > 推拉模式是一个折中的方案，站在博主一端
  >
  > - 如果是个普通的人，那么我们采用写扩散的方式，直接把数据写入到他的粉丝中去，因为普通的人他的粉丝关注量比较小，所以这样做没有压力
  > - 如果是大V，那么他是直接将数据先写入到一份到发件箱里边去
  >   - 对于活跃粉丝，直接发送
  >   - 不活跃粉丝，等待拉取
  >
  > 站在收件人这端
  >
  > - 如果是活跃粉丝，大V和普通博主发的都会直接写入到自己收件箱里
  > - 如果是普通粉丝，由于他们上线不是很频繁，所以等他们上线时，再从发件箱里边去拉信息

需求：

* 修改新增探店笔记的业务，在保存blog到数据库的同时，推送到粉丝的收件箱
* 收件箱满足可以根据时间戳排序，必须用Redis的数据结构实现
* 查询收件箱数据时，可以实现分页查询

**传统分页失效**：Feed流中的数据会不断更新，所以数据的角标也在变化，因此不能采用传统的分页模式。

![image-20221114211814455](http://minio.botuer.com/study-node/old/image-20221114211814455.png)

**Feed流的滚动分页**：需要记录每次操作的最后一条，然后从这个位置开始去读取数据

![image-20221114170959145](http://minio.botuer.com/study-node/old/image-20221114170959145.png)

修改**新增blog业务**

- 获取登录用户
- 保存blog
- 查询所有粉丝
- 推送笔记id给所有粉丝`stringRedisTemplate.opsForZSet().add(key, blog.getId().toString(), System.currentTimeMillis())`

**分页查询业务**

> - 每次查询完成后，需要得到数据的最小时间戳，这个值会作为下一次查询的条件
>
> - 下次查询需要找到与上一次查询相同的查询个数，作为偏移量，跳过这些查询过的数据
>
> 综上：我们的请求参数中就需要携带上一次查询的**最小时间戳（ lastId）、偏移量**（offset）这两个参数
>
> 这两个参数**第一次会由前端来指定**，以后的查询就根据后台结果作为条件，再次传递到后台

- 获取当前用户

- 查询收件箱

  ```java
  Set<ZSetOperations.TypedTuple<String>> typedTuples = stringRedisTemplate.opsForZSet().reverseRangeByScoreWithScores(key, 0, lastId, offset, 2)
  ```

- 非空判断 --- null直接返回

- 解析blogId、minTime（时间戳）、offset

  ```java
  List<Long> ids = new ArrayList<>(typedTuples.size());
  long minTime = 0; // 最小时间戳.
  int os = 1; // 相同时间的偏移量
  for (ZSetOperations.TypedTuple<String> tuple : typedTuples) { 
      // 4.1.获取id，放入集合，用于查询blog内容
      ids.add(Long.valueOf(tuple.getValue()));
      // 4.2.获取分数(时间戳）
      long time = tuple.getScore().longValue();
      if(time == minTime){
          os++;	// 相同时间戳，os++
      }else{		// 时间戳不同，表示当前时间戳的blog全部浏览完，重置最小时间戳和相同时间戳偏移量
          minTime = time;
          os = 1;
      }
  }
  ```
  
- 根据id查询blog

  - 查询blog有关的用户 --- blog内容包含用户信息（**需要加排序**）
  - 查询blog是否被点赞

- 封装并返回

  ```java
  ScrollResult r = new ScrollResult();
  r.setList(blogs);		// blog集合
  r.setOffset(os);		// 偏移量
  r.setMinTime(minTime);	// 最小时间戳
  
  return Result.ok(r);
  ```

#### 互相关注

#####  MVP技术方案V0

mvp：最小可用版本

- 建模：互关功能比较简单，一般来说，除了用户主表，只需要一张中间表来存储用户之间的关系即可

  - 中间表：follower（id，from_user_id（粉丝），to_user_id（博主））

- 接口逻辑

  - 关注某人：在follower中添加一条from_user_id为当前登录用户，to_user_id为被关注者id

  - 取关某人：将follower中from_user_id为当前登录用户，并且to_user_id为某人Id的数据删除，或逻辑删除

  - 粉丝列表：查询to_user_id为某用户Id的所有用户Id，去user表查询用户缩略信息，比如头像，昵称等

    > 展示是否互关，根据博主id查询粉丝id，再将粉丝id作为to_user_id查from_user_id，然后进行一一匹配，可以匹配上的，可以认为是已经互关，在Vo层展示的时候可以加一个是否互关字段，用于展示是否互关

  - 我的关注：查询from_user_id为当前登录用户的所有用户id，然后去user表查询用户缩略信息

    > 同理，展示是否互关，还需要再查询to_user_id为当前登录用户的所有用户id，然后进行一一匹配

  - 关注数量、粉丝数量：查询from_user_id等于当前登录用户的数量、from_user_id等于当前登录用户的数量

- 部署方案：MVP部署方案，旨在首先将功能跑通，然后再在此基础上进行部署架构的优化

  依赖组件：

  - nginx：代理页面静态资源，和api

  - tomcat：部署应用

  - mysql：持久化数据

- 不足

  - 主键使用的数据库自带的id，这个无法应对分库分表的场景
  - 查询互关的时候，需要查两遍库，增加IO次数，并且需要匹配，也会降低接口性能
  - 获取用户粉丝数和关注数时，使用count的方法，在数据量级上来之后，还是会导致性能问题
  - follower表的数据是基本成指数级增长，比如，如果系统有1W的用户量，最糟糕的情况下，可能会产生小2亿的数据（不过一般达不到），但随着用户量的增加，这个表数据量会非常惊人
  - MVP版本部署，首先系统的吞吐量会比较低，其次，服务是处于一个无法容灾的状态，完全没有高可用

##### 改进V1

- 对应MVP的解决方案
  - 增加uid（**分布式ID**），作为业务主键，方便后续分库分表
  - 在follower**表中增加**is_mutual_follwer**标识是否互关**，在关注接口获取，取关接口对此值进行修改，可以提升查询时的速度。因为正常情况下都是读多写少
  - **增加user_follower_info**用来保存用户的**关注数和粉丝数**，避免使用count(*)导致性能问题
  - 对follower表进行拆分，**拆成follwer_from表和follower_to表**，分别表示用户关注和用户粉丝，方便后续对表水平拆分
  - **冷热分离**，为了进一步对表进行拆分，减少对大表的检索，将follwer_from表和follower_to表，分别拆分为follwer_from_hot表、follwer_from_cold表、follower_to_hot表和follwer_to_cold表，用来存储热点数据，按关注的先后顺序区分热点数据，在follwer_from_hot表，**只保存每个人用户前100的数据**（或者业务自己定），当新关注其他人时，先检查数量是否大于100，然后如果大于则将最旧挪到follwer_from_cold表，然后再将新数据插入此表。follwer_to_hot同理。此优化主要针对，大部分情况下，用户都是只看前面关注数，不会深度查询，这样可以增加较快的查询效率，尤其针对一些大V账号，动不动都是百万甚至千万级别的粉丝，效果尤其显著
- 部署
  - nginx提供负载均衡
  - tomcat集群
  - 数据库有MHA
- 不足
  - 用户的基本信息、follwer_from_hot和follwer_to_hot、关注数和粉丝数**缓存**至redis
  - 缓存一致性问题：加**MQ**

##### 改进V2

![image-20221114215024326](http://minio.botuer.com/study-node/old/image-20221114215024326.png)

- 不足

  > 此部署架构，基本就是一个可以应对较高并发的架构了，但是像微博这样的并发量，此架构显然无法承载，因为，仅考虑国**内用户的话，基本就分为了三大区域**，
  >
  > 华南、华中、华北，而这三大区域的网络运营商是不一样的，所以，如果服务器部署在华北，很有可能造成华中和华南用户的体验不如华北，所以就需要多机房部署，应对不同地区的用户，当然，上面的nginx还是一台，这个显然也是无法满足的，所以，上SLB也是势在必行。因此，我们进一步优化

##### 改进V3

![V4_version](http://minio.botuer.com/study-node/old/V4_version.png)

> 至此，基本已经可以应对高并发了，如果数据量不断增加的话，可以通过**使用Mycat或者sharding JDBC进行分库分表**。**增加分布式任务调度是为了保证缓存和数据库的一致性**，因为不能单纯靠rocketmq去保证一致性，**增加日志服务**为了后续审计数据，**增加监控服务**，快速感知应用服务和中间件等服务的状态。当然，代码层面依然有优化的空间，比如，**可以使用WebFlux和complatablefuture进行编程**，将有所有方法改成异步，这样可以进一步提升系统的吞吐量。并且可以**增加一级缓存**，继续提升系统性能，采用mq进行一级缓存和redis直接数据同步

#### GEO数据类型

GEO就是Geolocation的简写形式，代表地理坐标。Redis在3.2版本中加入了对GEO的支持，允许存储地理坐标信息，帮助我们根据经纬度来检索数据。常见的命令有：

**它只是一个zset结构**

* GEOADD：添加一个地理空间信息，包含：经度（longitude）、纬度（latitude）、值（member）
* GEODIST：计算指定的两个点之间的距离并返回
* GEOHASH：将指定member的坐标转为hash字符串形式并返回
* GEOPOS：返回指定member的坐标
* GEORADIUS：指定圆心、半径，找到该圆内包含的所有member，并按照与圆心之间的距离排序后返回。6.以后已废弃
* GEOSEARCH：在指定范围内搜索member，并按照与指定点之间的距离排序后返回。范围可以是圆形或矩形。6.2.新功能
* GEOSEARCHSTORE：与GEOSEARCH功能一致，不过可以把结果存储到一个指定的key。 6.2.新功能

#### 附近

api

- 请求方式 GET
- 请求路径 /shop/of/type
- 请求参数
  - typeId：商户类型
  - current：滚动查询页码
  - x：经度
  - y：纬度
- 返回值 List`<Shop>`

**导入Redis**

> 将数据库表中的数据导入到redis中
>
> - redis中的GEO，GEO在redis中就一个menber和一个经纬度
> - 把x和y轴传入到redis做的经纬度位置去，menber只存id（内存有限）
>
> 根据type筛选
>
> - redis中并没有存储type，所以我们无法根据type来对数据进行筛选
>
> - 按照商户类型做分组，类型相同的商户作为同一组，以typeId为key存入同一个GEO集合中即可
>
>   如：
>
>   ```sh
>   #		typeId	x		y	shopId
>   geoadd huoguo 116.25 34.44 haidilao
>   geoadd huoguo 116.25 34.44 xiapuxiapu
>   geoadd xiaochi 116.25 34.44 mixian
>   geoadd xiaochi 116.25 34.44 shaokao
>   ```

- 查询店铺信息

- 把店铺分组，按照typeId分组，typeId一致的放到一个集合

- 分批完成写入Redis

  - 获取类型typeId
  - 获取同类型的店铺的集合
  - 写入redis GEOADD key 经度 纬度 member

  ```java
  @Test
  void loadShopData() {
      // 1.查询店铺信息
      List<Shop> list = shopService.list();
      // 2.把店铺分组，按照typeId分组，typeId一致的放到一个集合
      Map<Long, List<Shop>> map = list.stream().collect(Collectors.groupingBy(Shop::getTypeId));
      // 3.分批完成写入Redis
      for (Map.Entry<Long, List<Shop>> entry : map.entrySet()) {
          // 3.1.获取类型id
          Long typeId = entry.getKey();
          String key = SHOP_GEO_KEY + typeId;
          // 3.2.获取同类型的店铺的集合
          List<Shop> value = entry.getValue();
          List<RedisGeoCommands.GeoLocation<String>> locations = new ArrayList<>(value.size());
          // 3.3.写入redis GEOADD key 经度 纬度 member
          for (Shop shop : value) {
              // stringRedisTemplate.opsForGeo().add(key, new Point(shop.getX(), shop.getY()), shop.getId().toString());
              locations.add(new RedisGeoCommands.GeoLocation<>(
                      shop.getId().toString(),
                      new Point(shop.getX(), shop.getY())
              ));
          }
          stringRedisTemplate.opsForGeo().add(key, locations);
      }
  }
  ```

**查询附近业务**

- 判断是否需要根据坐标查询

  ```java
  @Override
  public Result queryShopByType(Integer typeId, Integer current, Double x, Double y) {
      // 1.判断是否需要根据坐标查询
      if (x == null || y == null) {
          // 不需要坐标查询，按数据库查询
          Page<Shop> page = query()
                  .eq("type_id", typeId)
                  .page(new Page<>(current, SystemConstants.DEFAULT_PAGE_SIZE));
          // 返回数据
          return Result.ok(page.getRecords());
      }
  
      // 2.计算分页参数
      int from = (current - 1) * SystemConstants.DEFAULT_PAGE_SIZE;
      int end = current * SystemConstants.DEFAULT_PAGE_SIZE;
  
      // 3.查询redis、按照距离排序、分页。结果：shopId、distance
      String key = SHOP_GEO_KEY + typeId;
      GeoResults<RedisGeoCommands.GeoLocation<String>> results = stringRedisTemplate.opsForGeo() // GEOSEARCH key BYLONLAT x y BYRADIUS 10 WITHDISTANCE
              .search(
                      key,
                      GeoReference.fromCoordinate(x, y),
                      new Distance(5000),
                      RedisGeoCommands.GeoSearchCommandArgs.newGeoSearchArgs().includeDistance().limit(end)
              );
      // 4.解析出id
      if (results == null) {
          return Result.ok(Collections.emptyList());
      }
      List<GeoResult<RedisGeoCommands.GeoLocation<String>>> list = results.getContent();
      if (list.size() <= from) {
          // 没有下一页了，结束
          return Result.ok(Collections.emptyList());
      }
      // 4.1.截取 from ~ end的部分
      List<Long> ids = new ArrayList<>(list.size());
      Map<String, Distance> distanceMap = new HashMap<>(list.size());
      list.stream().skip(from).forEach(result -> {
          // 4.2.获取店铺id
          String shopIdStr = result.getContent().getName();
          ids.add(Long.valueOf(shopIdStr));
          // 4.3.获取距离
          Distance distance = result.getDistance();
          distanceMap.put(shopIdStr, distance);
      });
      // 5.根据id查询Shop
      String idStr = StrUtil.join(",", ids);
      List<Shop> shops = query().in("id", ids).last("ORDER BY FIELD(id," + idStr + ")").list();
      for (Shop shop : shops) {
          shop.setDistance(distanceMap.get(shop.getId().toString()).getValue());
      }
      // 6.返回
      return Result.ok(shops);
  }
  ```

### 签到

数据库太浪费，而且并发下，数据库压力大

位图：把每一个bit位对应当月的每一天，形成了映射关系。用0和1标示业务状态

Redis中是利用string类型数据结构实现BitMap，因此最大上限是512M，转换为bit则是 2^32个bit位

BitMap的操作命令有：

* SETBIT：向指定位置（offset）存入一个0或1
* GETBIT ：获取指定位置（offset）的bit值
* BITCOUNT ：统计BitMap中值为1的bit位的数量
* BITFIELD ：操作（查询、修改、自增）BitMap中bit数组中的指定位置（offset）的值
* BITFIELD_RO ：获取BitMap中bit数组，并以十进制形式返回
* BITOP ：将多个BitMap的结果做位运算（与 、或、异或）
* BITPOS ：查找bit数组中指定范围内第一个0或1出现的位置

#### 用户签到

- 获取当前登录用户

- 获取日期

- 拼接key

- 获取今天是本月的第几天

- 写入Redis SETBIT key offset 1

  ```java
  @Override
  public Result sign() {
      // 1.获取当前登录用户
      Long userId = UserHolder.getUser().getId();
      // 2.获取日期
      LocalDateTime now = LocalDateTime.now();
      // 3.拼接key
      String keySuffix = now.format(DateTimeFormatter.ofPattern(":yyyyMM"));
      String key = USER_SIGN_KEY + userId + keySuffix;
      // 4.获取今天是本月的第几天
      int dayOfMonth = now.getDayOfMonth();
      // 5.写入Redis SETBIT key offset 1
      stringRedisTemplate.opsForValue().setBit(key, dayOfMonth - 1, true);
      return Result.ok();
  }
  ```

#### 签到统计

**问题1：**什么叫做连续签到天数？

从最后一次签到开始向前统计，直到遇到第一次未签到为止，计算总的签到次数，就是连续签到天数

> Java逻辑代码：获得当前这个月的最后一次签到数据，定义一个计数器，然后不停的向前统计，直到获得第一个非0的数字即可，每得到一个非0的数字计数器+1，直到遍历完所有的数据，就可以获得当前月的签到总天数了

**问题2：**如何得到本月到今天为止的所有签到数据？

  BITFIELD key GET u[dayOfMonth] 0

> 假设今天是10号，那么我们就可以从当前月的第一天开始，获得到当前这一天的位数，是10号，那么就是10位，去拿这段时间的数据，就能拿到所有的数据了，那么这10天里边签到了多少次呢？统计有多少个1即可
>

**问题3：如何从后向前遍历每个bit位？**

注意：bitMap返回的数据是10进制，假如说返回一个数字8，那么我哪儿知道到底哪些是0，哪些是1呢？我们只需要让得到的**10进制数字和1做与运算**就可以了，因为1只有遇见1 才是1，其他数字都是0 ，我们把签到结果和1进行与操作，每与一次，就把签到结果向**右移动一位**，依次内推，我们就能完成逐个遍历的效果了。

**需求**：统计当前用户截止当前时间在**本月的连续签到天数**

> 有用户有时间我们就可以组织出对应的key，此时就能找到这个用户截止这天的所有签到记录，再根据这套算法，就能统计出来他连续签到的次数了

```java
@Override
public Result signCount() {
    // 1.获取当前登录用户
    Long userId = UserHolder.getUser().getId();
    // 2.获取日期
    LocalDateTime now = LocalDateTime.now();
    // 3.拼接key
    String keySuffix = now.format(DateTimeFormatter.ofPattern(":yyyyMM"));
    String key = USER_SIGN_KEY + userId + keySuffix;
    // 4.获取今天是本月的第几天
    int dayOfMonth = now.getDayOfMonth();
    // 5.获取本月截止今天为止的所有的签到记录，返回的是一个十进制的数字 BITFIELD sign:5:202203 GET u14 0
    // bitField可以多个子命令同时查询，故需要集合封装返回结果，这里其实集合中就一个元素
    List<Long> result = stringRedisTemplate.opsForValue().bitField(
            key,
            BitFieldSubCommands.create()
                    .get(BitFieldSubCommands.BitFieldType.unsigned(dayOfMonth)).valueAt(0)
    );
    if (result == null || result.isEmpty()) {
        // 没有任何签到结果
        return Result.ok(0);
    }
    Long num = result.get(0);
    if (num == null || num == 0) {
        return Result.ok(0);
    }
    // 6.循环遍历
    int count = 0;
    while (true) {
        // 6.1.让这个数字与1做与运算，得到数字的最后一个bit位  // 判断这个bit位是否为0
        if ((num & 1) == 0) {
            // 如果为0，说明未签到，结束
            break;
        }else {
            // 如果不为0，说明已签到，计数器+1
            count++;
        }
        // 把数字右移一位，抛弃最后一个bit位，继续下一个bit位
        num >>>= 1;
    }
    return Result.ok(count);
}
```

### UV统计

通常来说PV会比UV大很多，所以衡量同一个网站的访问量，我们需要综合考虑很多因素，所以我们只是单纯的把这两个值作为一个参考值

* UV：全称Unique Visitor，也叫独立访客量，是指通过互联网访问、浏览这个网页的自然人。1天内同一个用户多次访问该网站，只记录1次。
* PV：全称Page View，也叫页面访问量或点击量，用户每访问网站的一个页面，记录1次PV，用户多次打开页面，则记录多次PV。往往用来衡量网站的流量。

> UV统计在服务端做会比较麻烦，因为要判断该用户是否已经统计过了，需要将统计过的用户信息保存
>
> 但是如果每个访问的用户都保存到Redis中，数据量会非常恐怖，那怎么处理呢？

#### HyperLogLog

**天生唯一性，重复数据只记录一次**

Hyperloglog(HLL)是从Loglog算法派生的概率算法，用于确定非常大的集合的基数，而不需要存储其所有值。

相关算法原理大家可以参考：https://juejin.cn/post/6844903785744056333#heading-0

Redis中的HLL是基于string结构实现的，单个HLL的内存**永远小于16kb**，**内存占用低**的令人发指！作为代价，其测量结果是概率性的，**有小于0.81％的误差**。不过对于UV统计来说，这完全可以忽略

**指令**

![image-20221114210107347](http://minio.botuer.com/study-node/old/image-20221114210107347.png)

#### UV统计测试

测试思路：我们直接利用单元测试，向HyperLogLog中添加100万条数据，看看内存占用和统计效果如何

![image-20221114210920255](http://minio.botuer.com/study-node/old/image-20221114210920255.png)

经过测试：我们会发生他的误差是在允许范围内，并且内存占用极小

## 缓存

### 概述

**缓存(**Cache),就是数据交换的**缓冲区**,俗称的缓存就是**缓冲区内的数据**,一般从数据库中获取,存储于本地代码(例如:

```java
例1:Static final ConcurrentHashMap<K,V> map = new ConcurrentHashMap<>(); 本地用于高并发

例2:static final Cache<K,V> USER_CACHE = CacheBuilder.newBuilder().build(); 用于redis等缓存

例3:Static final Map<K,V> map =  new HashMap(); 本地缓存
```

由于其被**Static**修饰,所以随着类的加载而被加载到**内存之中**,作为本地缓存,由于其又被**final**修饰,所以其引用(例3:map)和对象(例3:new HashMap())之间的关系是固定的,不能改变,因此不用担心赋值(=)导致缓存失效

缓存数据存储于代码中,而代码运行在内存中,内存的读写性能远高于磁盘,缓存可以大大降低**用户访问并发量带来的**服务器读写压力

![image-20221031191637140](http://minio.botuer.com/study-node/old/image-20221031191637140.png)

实际开发中,会构筑多级缓存来使系统运行速度进一步提升,例如:本地缓存与redis中的缓存并发使用

**浏览器缓存**：主要是存在于浏览器端的缓存

**应用层缓存：**可以分为tomcat本地缓存，比如之前提到的map，或者是使用redis作为缓存

**数据库缓存：**在数据库中有一片空间是 buffer pool，增改查数据都会先加载到mysql的缓存中

**CPU缓存：**当代计算机最大的问题是 cpu性能提升了，但内存读写速度没有跟上，所以为了适应当下的情况，增加了cpu的L1，L2，L3级的缓存

### 更新策略

缓存更新是redis为了节约内存而设计出来的一个东西，主要是因为内存数据宝贵，当我们向redis插入太多数据，此时就可能会导致缓存中的数据过多，所以redis会对部分数据进行更新，或者把他叫为淘汰更合适。

**内存淘汰：**redis自动进行，当redis内存达到咱们设定的max-memery的时候，会自动触发淘汰机制，淘汰掉一些不重要的数据(可以自己设置策略方式)

**超时剔除：**当我们给redis设置了过期时间ttl之后，redis会将超时的数据进行删除，方便咱们继续使用缓存

**主动更新：**我们可以手动调用方法把缓存删掉，通常用于解决缓存和数据库不一致问题

![image-20221031194459958](http://minio.botuer.com/study-node/old/image-20221031194459958.png)

### 缓存不一致

> 由于我们的**缓存的数据源来自于数据库**,而数据库的**数据是会发生变化的**,因此,如果当数据库中**数据发生变化,而缓存却没有同步**,此时就会有**一致性问题存在**,其后果是：用户使用缓存中的过时数据,就会产生类似多线程数据安全问题
>

- Cache Aside Pattern 人工编码方式：缓存调用者在更新完数据库后再去更新缓存，也称之为双写方案

- Read/Write Through Pattern : 由系统本身完成，数据库与缓存的问题交由系统本身去处理

- Write Behind Caching Pattern ：调用者只操作缓存，其他线程去异步处理数据库，实现最终一致

![image-20221031194627479](http://minio.botuer.com/study-node/old/image-20221031194627479.png)

综合考虑使用方案一，操作缓存和数据库时有三个问题需要考虑：

1. 删除缓存还是更新缓存？

   * 更新缓存：每次更新数据库都更新缓存，无效写操作较多

     > 更新动作实际上只有最后一次生效，中间的更新动作意义并不大

   * **删除缓存**：更新数据库时让缓存失效，查询时再更新缓存

2. 如何保证缓存与数据库的操作的同时成功或失败？ --- **事务**

   * 单体系统，将缓存与数据库操作放在一个事务

   * 分布式系统，利用TCC等分布式事务方案

3. 先操作缓存还是先操作数据库？

   * 先删除缓存，再操作数据库

     > 两个线程并发来访问时
     >
     > - 线程1先把缓存删了
     >
     > - 线程2查询缓存数据并不存在，此时他写入缓存（旧数据）
     >
     > - 线程1再执行更新数据库
     >
     > 实际上缓存中是旧的数据

   * **先操作数据库，再删除缓存**

   ![image-20221031201509279](http://minio.botuer.com/study-node/old/image-20221031201509279.png)

**实现核心思路**

- 缓存未命中，则查询数据库，将数据库结果写入缓存，并设置超时时间
- 修改时，先修改数据库，再删除缓存

**解决方案**

- 用户维度数据（订单、会员），并发几率小，采用上述方案即可
- 菜单、介绍等基础数据，可以用Canal订阅binlog
- 加锁保证并发读写，适用于可忽略临时脏数据
- 放入缓存的数据本就不该是实时性、一致性超高的
- 要求高的就应该查库

### 缓存穿透

**缓存穿透**：查不存在 --- 次次都走DB

> 缓存和数据库中都不存在，这样缓存永远不会生效，这些请求都会打到数据库

风险：利用不存在的数据进行攻击，数据库瞬时压力增大，最终导致崩溃

解决：

- null结果缓存，并加入短暂过期时间
  - 优点：实现简单，维护方便
  - 缺点：
    * 额外的内存消耗
    * 可能造成短期的不一致
- 布隆过滤
  * 优点：内存占用较少，没有多余key
  * 缺点：
    * 实现复杂
    * 存在误判可能，布隆过滤器走的是哈希思想，只要哈希思想，就可能存在哈希冲突

![image-20221031203336881](http://minio.botuer.com/study-node/old/image-20221031203336881.png)

缓存穿透的解决方案有哪些？

* 缓存null值
* 布隆过滤
* 增强id的复杂度，避免被猜测id规律
* 做好数据的基础格式校验
* 加强用户权限校验
* 做好热点参数的限流

#### [布隆过滤器](https://blog.csdn.net/qq_41125219/article/details/119982158)

[(16条消息) 布隆(Bloom Filter)过滤器——全面讲解，建议收藏_李子捌的博客-CSDN博客_bloom filter](https://blog.csdn.net/qq_41125219/article/details/119982158)

**应用场景**

- 解决Redis缓存穿透问题（面试重点）
- 邮件过滤，使用布隆过滤器来做邮件黑名单过滤
- 对爬虫网址进行过滤，爬过的不再爬
- 解决新闻推荐过的不再推荐(类似抖音刷过的往下滑动不再刷到)
- HBase\RocksDB\LevelDB等数据库内置布隆过滤器，用于判断数据是否存在，可以减少数据库的IO请求

**利用Redis简单实现布隆过滤器，解决击穿问题**

> **分析**：我们可以将数据库的数据，所对应的id写入到一个list集合中，当用户过来访问的时候，我们直接去判断list中是否包含当前的要查询的数据，如果说用户要查询的id数据并不在list集合中，则直接返回，如果list中包含对应查询的id数据，则说明不是一次缓存穿透数据，则直接放行
>
> **问题**：在2011年左右，淘宝的商品总量就已经超过10亿个，仅主键数据量依然很大
>
> **方案**：使用redis的bitmap来减少list的存储空间
>
> - 把list数据抽象成一个非常大的bitmap
> - 不再使用list，而是将db中的id数据利用哈希思想
> - id % bitmap.size  = 算出当前这个id对应应该落在bitmap的哪个索引上，然后将这个值从0变成1
> - 查询的id去用相同的哈希算法， 算出来当前这个id应当落在bitmap的哪一位
> - 然后判断这一位是0，还是1，如果是0则表明这一位上的数据一定不存在
> - 采用这种方式来处理，需要重点考虑一个事情，就是误差率（哈希冲突的时候，产生的误差）

### 缓存雪崩

**缓存雪崩**：多条数据，失效后，同时请求

> 同一时段大量的缓存key同时失效或Redis服务宕机，导致大量请求到达数据库

解决：

- 原有的失效时间基础上增加一个随机值，比如1-5分钟随机
- 利用Redis集群提高服务的可用性
- 给缓存业务添加降级限流策略
- 给业务添加多级缓存

### 缓存击穿

**缓存击穿**：一条数据，失效后，同时请求

> 也叫热点Key问题，就是一个被高并发访问并且缓存重建业务较复杂的key突然失效了，无数的请求访问会在瞬间给数据库带来巨大的冲击

解决：

- 加锁，大量并发只让一个去查，其他人等待，查到以后释放锁，其他人获取到锁，先查缓存，就会有数据，不用去db

  ![image-20221031205110937](http://minio.botuer.com/study-node/old/image-20221031205110937.png)

- 逻辑过期

  > 之所以会出现缓存击穿问题，主要原因是在于我们对key设置了过期时间，假设我们不设置过期时间，其实就不会有缓存击穿的问题，但是不设置过期时间，这样数据不就一直占用我们内存了吗，我们可以采用逻辑过期方案
  >
  > 我们把过期时间设置在 redis的value中，注意：这个过期时间并不会直接作用于redis，而是我们后续通过逻辑去处理。假设线程1去查询缓存，然后从value中判断出来当前的数据已经过期了，此时线程1去获得互斥锁，那么其他线程会进行阻塞，获得了锁的线程他会开启一个 线程去进行 以前的重构数据的逻辑，直到新开的线程完成这个逻辑后，才释放锁， 而线程1直接进行返回，假设现在线程3过来访问，由于线程线程2持有着锁，所以线程3无法获得锁，线程3也直接返回数据，只有等到新开的线程2把重建数据构建完后，其他线程才能走返回正确的数据
  >
  > 这种方案巧妙在于，异步的构建缓存，缺点在于在构建完缓存之前，返回的都是脏数据

  ![image-20221031205253759](http://minio.botuer.com/study-node/old/image-20221031205253759.png)

- 对比

  - **互斥锁方案：**由于保证了互斥性，所以数据一致，且实现简单，因为仅仅只需要加一把锁而已，也没其他的事情需要操心，所以没有额外的内存消耗，缺点在于有锁就有死锁问题的发生，且只能串行执行性能肯定受到影响

  - **逻辑过期方案：** 线程读取过程中不需要等待，性能好，有一个额外的线程持有锁去进行重构数据，但是在重构数据完成前，其他的线程只能返回之前的数据，且实现起来麻烦

    ![image-20221031205514712](http://minio.botuer.com/study-node/old/image-20221031205514712.png)

**利用逻辑过期解决缓存击穿问题**

*需求：修改根据id查询商铺的业务，基于逻辑过期方式来解决缓存击穿问题*

思路分析：当用户开始查询redis时，判断是否命中，如果没有命中则直接返回空数据，不查询数据库，而一旦命中后，将value取出，判断value中的过期时间是否满足，如果没有过期，则直接返回redis中的数据，如果过期，则在开启独立线程后直接返回之前的数据，独立线程去重构数据，重构完成后释放互斥锁

![image-20221031205925397](http://minio.botuer.com/study-node/old/image-20221031205925397.png)

如果封装数据：因为现在redis中存储的数据的value需要带上过期时间，此时要么你去修改原来的实体类，要么你

**步骤一、**

新建一个实体类，我们采用第二个方案，这个方案，对原来代码没有侵入性。

```
@Data
public class RedisData {
    private LocalDateTime expireTime;
    private Object data;
}
```

**步骤二、**

在**ShopServiceImpl** 新增此方法，利用单元测试进行缓存预热

![image-20221031210004807](http://minio.botuer.com/study-node/old/image-20221031210004807.png)

**在测试类中**

![image-20221031210021904](http://minio.botuer.com/study-node/old/image-20221031210021904.png)

步骤三：正式代码

**ShopServiceImpl**

```java
private static final ExecutorService CACHE_REBUILD_EXECUTOR = Executors.newFixedThreadPool(10);
public Shop queryWithLogicalExpire( Long id ) {
    String key = CACHE_SHOP_KEY + id;
    // 1.从redis查询商铺缓存
    String json = stringRedisTemplate.opsForValue().get(key);
    // 2.判断是否存在
    if (StrUtil.isBlank(json)) {
        // 3.存在，直接返回
        return null;
    }
    // 4.命中，需要先把json反序列化为对象
    RedisData redisData = JSONUtil.toBean(json, RedisData.class);
    Shop shop = JSONUtil.toBean((JSONObject) redisData.getData(), Shop.class);
    LocalDateTime expireTime = redisData.getExpireTime();
    // 5.判断是否过期
    if(expireTime.isAfter(LocalDateTime.now())) {
        // 5.1.未过期，直接返回店铺信息
        return shop;
    }
    // 5.2.已过期，需要缓存重建
    // 6.缓存重建
    // 6.1.获取互斥锁
    String lockKey = LOCK_SHOP_KEY + id;
    boolean isLock = tryLock(lockKey);
    // 6.2.判断是否获取锁成功
    if (isLock){
        CACHE_REBUILD_EXECUTOR.submit( ()->{

            try{
                //重建缓存
                this.saveShop2Redis(id,20L);
            }catch (Exception e){
                throw new RuntimeException(e);
            }finally {
                unlock(lockKey);
            }
        });
    }
    // 6.4.返回过期的商铺信息
    return shop;
}
```

## 分布式锁

### 集群的并发问题

**有关锁失效原因分析**

- 多个tomcat
- 对应多个jvm
- 两个线程不在同一个tomcat
- 在对应的多个jvm中拿不到同一个锁对象 --- 锁不住

**基本原理**

分布式锁：满足分布式系统或集群模式下多进程可见并且互斥的锁

核心思想：保证同一把锁

可见性：多个线程都能看到相同的结果，注意：这个地方说的可见性并不是并发编程中指的内存可见性，只是说多个进程之间都能感知到变化的意思

互斥：互斥是分布式锁的最基本的条件，使得程序串行执行

高可用：程序不易崩溃，时时刻刻都保证较高的可用性

高性能：由于加锁本身就让性能降低，所有对于分布式锁本身需要他就较高的加锁性能和释放锁性能

安全性：安全也是程序中必不可少的一环

**实现方式对比**

常见的分布式锁有三种

*Mysql*：mysql本身就带有锁机制，但是由于mysql性能本身一般，所以采用分布式锁的情况下，其实使用mysql作为分布式锁比较少见

*Redis*：redis作为分布式锁是非常常见的一种使用方式，现在企业级开发中基本都使用redis或者zookeeper作为分布式锁，利用setnx这个方法，如果插入key成功，则表示获得到了锁，如果有人插入成功，其他人插入失败则表示无法获得到锁，利用这套逻辑来实现分布式锁

*Zookeeper*：zookeeper也是企业级开发中较好的一个实现分布式锁的方案，由于本套视频并不讲解zookeeper的原理和分布式锁的实现，所以不过多阐述

![image-20221114011515675](http://minio.botuer.com/study-node/old/image-20221114011515675.png)

### 核心思路

**利用互斥锁解决缓存击穿问题**

核心思路：相较于原来从缓存中查询不到数据后直接查询数据库而言，现在的方案是 进行查询之后，如果从缓存没有查询到数据，则进行互斥锁的获取，获取互斥锁后，判断是否获得到了锁，如果没有获得到，则休眠，过一会再进行尝试，直到获取到锁为止，才能进行查询

如果获取到了锁的线程，再去进行查询，查询后将数据写入redis，再释放锁，返回数据，利用互斥锁就能保证只有一个线程去执行操作数据库的逻辑，防止缓存击穿

![image-20221031205819352](http://minio.botuer.com/study-node/old/image-20221031205819352.png)

核心思路就是利用redis的setnx方法来表示获取锁，该方法含义是redis中如果没有这个key，则插入成功，返回1，在stringRedisTemplate中返回true，  如果有这个key则插入失败，则返回0，在stringRedisTemplate返回false，我们可以通过true，或者是false，来表示是否有线程成功插入key，成功插入的key的线程我们认为他就是获得到锁的线程

```sh
#[NX表示not exit]
set lock lock1 NX
#EX后跟过期时间
set lock lock1 EX 300 NX
```

**问题：加锁后不释放，造成死锁**

```java
//1、占分布式锁。去redis占坑
Boolean lock = redisTemplate.opsForValue().setIfAbsent("lock", "111");
if (lock){
    //设置过期时间，避免不释放造成死锁
    redisTemplate.expire("lock",30, TimeUnit.SECONDS);
    //加锁成功  执行业务
    Map<String, List<Catelog2Vo>> dataFromDb = getDataFromDb();
    redisTemplate.delete("lock");
    return dataFromDb;
}
```

**问题：占锁和设置时间必须原子性：占锁后时间没设置上，出现死锁**

```java
//1、占分布式锁。去redis占坑，并设置过期时间
Boolean lock = redisTemplate.opsForValue().setIfAbsent("lock", "111",300,TimeUnit.SECONDS);
if (lock){
    //加锁成功  执行业务
    Map<String, List<Catelog2Vo>> dataFromDb = getDataFromDb();
    redisTemplate.delete("lock");
    return dataFromDb;
} 
```

**问题：自动过期时间为10s，业务时间为20s，到期删除，其他业务抢到锁，锁失效**

> 在占锁时加上或者设为UUID值。删除时进行判断

```java
//1、占分布式锁。去redis占坑
String uuid = UUID.randomUUID().toString();
Boolean lock = redisTemplate.opsForValue().setIfAbsent("lock", uuid,300,TimeUnit.SECONDS);
if (lock){
    //加锁成功  执行业务
    Map<String, List<Catelog2Vo>> dataFromDb = getDataFromDb();
    if (uuid.equals(redisTemplate.opsForValue().get("lock"))){
        //存在网络时延问题，比如在redis获取到lock返回时，lock过期被自动删除，
        // 此时其他线程抢占了锁，创建了lock，但是会被这个线程删掉的情况
        redisTemplate.delete("lock");
    }
    return dataFromDb;
} 
```

**问题：删除时，获取lock、对比、删除必须原子性，否则可能会删除其他业务lock**

> 官网对此也与解释，使用lua脚本解决这个问题

```java

    public Map<String, List<Catalog2Vo>> getCatalogJsonFromDbWithRedisLock() {

        String token = UUID.randomUUID().toString();

        //1、占分布式锁。去redis占坑，
        Boolean lock = stringRedisTemplate.opsForValue().setIfAbsent("lock", token, 100, TimeUnit.SECONDS);


        if (lock) {
            System.out.println("获取分布式锁成功");

            //为了让锁自动续期，不至于执行途中因为时间过短而失效，可以设置时间长一些，然后finally保证业务操作完成之后，就执行删除锁的操作
            //不管怎样，哪怕崩溃也直接解锁，不关心业务异常
            Map<String, List<Catalog2Vo>> dataFromDB;
            try {
                //加锁成功
                dataFromDB = getDataFromDB();
            } finally {
      			//lua脚本保证原子性
                String lua = "if redis.call(\"get\",KEYS[1]) == ARGV[1]\n" +
                        "then\n" +
                        "    return redis.call(\"del\",KEYS[1])\n" +
                        "else\n" +
                        "    return 0\n" +
                        "end";
                RedisScript<Long> luaScript = RedisScript.of(lua, Long.class);
                //删除锁
                Long lock1 = stringRedisTemplate.execute(luaScript, Arrays.asList("lock"), token);
            }

            return dataFromDB;
        } else {
            System.out.println("获取分布式锁失败，等待重试");
            //加锁失败，自旋的方式，休眠300ms重试
            try {
                TimeUnit.MILLISECONDS.sleep(300);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return getCatalogJsonFromDbWithRedisLock();
        }

    }

```

**问题：锁的自动续期**

### Redisson

基于setnx实现的分布式锁存在下面的问题：

**重入问题**：重入问题是指 获得锁的线程可以再次进入到相同的锁的代码块中，可重入锁的意义在于防止死锁，比如HashTable这样的代码中，他的方法都是使用synchronized修饰的，假如他在一个方法内，调用另一个方法，那么此时如果是不可重入的，不就死锁了吗？所以可重入锁他的主要意义是防止死锁，我们的synchronized和Lock锁都是可重入的

**不可重试**：是指目前的分布式只能尝试一次，我们认为合理的情况是：当线程在获得锁失败后，他应该能再次尝试获得锁

**超时释放：**我们在加锁时增加了过期时间，这样的我们可以防止死锁，但是如果卡顿的时间超长，虽然我们采用了lua表达式防止删锁的时候，误删别人的锁，但是毕竟没有锁住，有安全隐患

**主从一致性：** 如果Redis提供了主从集群，当我们向集群写数据时，主机需要异步的将数据同步给从机，而万一在同步过去之前，主机宕机了，就会出现死锁问题



**Redisson**是一个在Redis的基础上实现的Java驻内存数据网格（In-Memory Data Grid）。它不仅提供了一系列的分布式的Java常用对象，还提供了许多分布式服务，其中就包含了各种分布式锁的实现

#### 整合

- 依赖

  ```xml
  <dependency>
       <groupId>org.redisson</groupId>
       <artifactId>redisson</artifactId>
       <version>3.13.6</version>
   </dependency>
  ```

- 配置类

  ```java
  @Configuration
  public class MyRedissonConfig {
  
      /**
       * 所有对Redisson的使用都是对RedissionClient对象的操作
       * @return
       * @throws IOException
       */
      @Bean(destroyMethod="shutdown")
      public RedissonClient redisson() throws IOException {
          //1、创建配置
          Config config = new Config();
        	config.useSingleServer().setAddress("redis://192.168.218.128:6379");
          //2、根据Config创建出RedisClient实例
          RedissonClient redissonClient = Redisson.create(config);
          return redissonClient;
      }
  }
  ```

- 测试

  ```java
  @Autowired
  private RedissonClient redissonClient;
  
  
  @Test
  public void redisson(){
      //获取锁(可重入)，指定锁的名称
      RLock lock = redissonClient.getLock("anyLock");
      //尝试获取锁，参数分别是：获取锁的最大等待时间(期间会重试)，锁自动释放时间，时间单位
      boolean isLock = lock.tryLock(1,10,TimeUnit.SECONDS);
      //判断获取锁成功
      if(isLock){
          try{
              System.out.println("执行业务");          
          }finally{
              //释放锁
              lock.unlock();
          }
      }
  }
  ```

- 应用

  ```java
  @ResponseBody
  @GetMapping("/hello")
  public String hello() {
      //1、获取同一把锁，只要锁的名字一样，就是同一把锁，
      RLock lock = redisson.getLock("my-lock");
      //2、加锁
      //阻塞式等待
      lock.lock();
      try{
          System.out.println("加锁成功，执行业务"+Thread.currentThread().getId());
          Thread.sleep(30000);
      } catch (InterruptedException e) {
          e.printStackTrace();
      } finally {
          //3、解锁
          System.out.println(Thread.currentThread().getId()+"释放锁");
          lock.unlock();
      }
      return "hello";
  }
  ```

- 手动没有解锁，也会为我解锁

  不断获取锁，只要能获取锁就继续执行我们的业务

- 看门狗原理-redisson如何解决死锁


##### 最佳实践

```java
 @ResponseBody
    @GetMapping("/hello")
    public String hello() {
        //1、获取同一把锁，只要锁的名字一样，就是同一把锁，
        RLock lock = redisson.getLock("my-lock");
        //2、加锁
        //阻塞式等待，默认加的锁都是30秒
        //lock.lock();
        //1)、锁的自动续期，如果业务超长，运行期间自动给锁续上30s,不用担心业务时间长，锁自动过期被删掉
        //2)、加锁的业务只要运行完成，就不会给当前续期，即使不手动删除解锁，锁默认在30s以后自动删除。

        //10秒自动解锁，自动解锁时间一定要大于业务的执行的时间
        lock.lock(10, TimeUnit.SECONDS);
        // 问题：在锁时间到了以后，不会自动续期
        //1、如果我们传递了锁的超时时间，就发送给redis执行脚本，进行占锁，默认超时就是我们指定的时间
        //2、如果我们未指定锁的超时时间，就使用 30 * 1000 【看门狗lockWatchdogTimeout的默认时间】
        // 只要占锁成功，就会启动一个定时任务【重新给锁设定过期时间，新的过期时间就是看门狗的默认时间】,每隔10s自动续期，续成30s
        // internalLockLeaseTime / 3【看门狗时间】/3,10s

        //最佳实战
        //1) lock.lock(10, TimeUnit.SECONDS);省掉了整个续期操作，手动解锁  
        try {
            System.out.println("加锁成功，执行业务" + Thread.currentThread().getId());
            Thread.sleep(30000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            //3、解锁 假设解锁代码没有运行，redis会不会出现死锁
            System.out.println(Thread.currentThread().getId() + "释放锁");
            lock.unlock();
        }
        return "hello";
    }
}
```

##### 读写锁

```java
/**
 * 保证一定能读到最新数据，修改期间，写锁是一个排他锁（互斥锁,共享锁）。读锁是一个共享锁
 * 写锁没释放，读就必须等待
 *
 * 读 + 读 ：相当于无锁，并发读，只会在redis中记录好，所有当前的读锁，他们都会同时加锁成功
 * 写 + 读 ：等待写锁释放
 * 写 + 写：阻塞方式
 * 读 + 写：有读锁，写也需要等待
 * //只要有写的存在，都必须等待
 * @return
 */
@GetMapping("/read")
@ResponseBody
public String readValue() {

    RReadWriteLock readWriteLock = redisson.getReadWriteLock("rw-lock");
    String s = "";
    RLock rLock = readWriteLock.readLock();
    rLock.lock();
    try {
        System.out.println("读锁加锁成功。。。。"+Thread.currentThread().getId());
        s = stringRedisTemplate.opsForValue().get("writeValue");
        Thread.sleep(30000);
    } catch (Exception e) {
        e.printStackTrace();
    } finally {
        rLock.unlock();
        System.out.println("读锁释放"+Thread.currentThread().getId());
    }
    return s;
}


@GetMapping("/write")
@ResponseBody
public String writeValue() {

    RReadWriteLock readWriteLock = redisson.getReadWriteLock("rw-lock");
    String s = "";
    RLock rLock = readWriteLock.writeLock();
    try {
        //1、改数据加写锁，读数据加读锁
        rLock.lock();
        System.out.println("写锁加锁成功。。。。"+Thread.currentThread().getId());
        s = UUID.randomUUID().toString();
        Thread.sleep(10000);
        stringRedisTemplate.opsForValue().set("writeValue", s);
    } catch (InterruptedException e) {
        e.printStackTrace();
    } finally {
        rLock.unlock();
        System.out.println("写锁释放"+Thread.currentThread().getId());
    }
    return s;
}
```

##### 信号量

```java
/**
 * 信号量可以做分布式限流
 */
@GetMapping("/park")
@ResponseBody
public String park() throws InterruptedException {

    RSemaphore park = redisson.getSemaphore("park");
    boolean b = park.tryAcquire();
    if (b) {
        //执行业务
    } else {
        return "error";
    }
    return "ok" + b;

}

@GetMapping("/go")
@ResponseBody
public String go() throws InterruptedException {
    RSemaphore park = redisson.getSemaphore("park");
    park.release();
    return "走了";

}
```

##### 闭锁 

闭锁 --- 都执行完了，上锁

```java
@GetMapping("/lockdoor")
@ResponseBody
public String lockDoor() throws InterruptedException {

    RCountDownLatch door = redisson.getCountDownLatch("door");
    door.trySetCount(5);
    door.await();
    return "放假了";
}

@GetMapping("/gogogo/{id}")
@ResponseBody
public String gogogo(@PathVariable int id){

    RCountDownLatch door = redisson.getCountDownLatch("door");
    door.countDown();
    return id+"号走了";
}
```

#### 可重入原理

在Lock锁中，他是借助于底层

- voaltile的一个state变量来记录重入的状态

- 没有持有这把锁，那么state=0

- 有持有这把锁，那么state=1

- 再次持有这把锁，那么state就会+1

  > 如果是对于synchronized而言，他在c语言代码中会有一个count，原理和state类似，也是重入一次就加一，释放一次就-1 ，直到减少成0 时，表示当前这把锁没有被人持有

- 在redission中，采用hash结构用来存储锁，其中大key表示表示这把锁是否存在，用小key表示当前这把锁被哪个线程持有

```lua
-- KEYS[1] ： 锁名称，锁的大key
-- ARGV[1]：  锁失效时间
-- ARGV[2]：  锁id，锁的小key(id:threadId)

-- 上锁 
-- Lock{
--   id + ":" + threadId :  1
--}

-- 锁大key == 0，无锁
if (redis.call('exists', KEYS[1]) == 0) then
    redis.call('hset', KEYS[1], ARGV[2], 1);	-- 上锁，计数+1
    redis.call('pexpire', KEYS[1], ARGV[1]); 	-- 设置过期时间
    return nil;
end;
-- 锁小key == 1，是自己的锁
if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then
    redis.call('hincrby', KEYS[1], ARGV[2], 1);	-- 计数+1
    redis.call('pexpire', KEYS[1], ARGV[1]);	-- 设置过期时间
    return nil;
end;
-- 都不满足，抢锁失败，返回pttl，即为当前这把锁的失效时间
return redis.call('pttl', KEYS[1]);
```

#### 锁重试原理

```lua
-- 抢锁过程
	-- 判断当前这个方法的返回值是否为null
	-- 如果是null，则对应则前两个if对应的条件，退出抢锁逻辑
	-- 如果返回的不是null，即走了第三个分支，会进行while(true)的自旋抢锁
```

```java
long threadId = Thread.currentThread().getId();
Long ttl = tryAcquire(-1, leaseTime, unit, threadId);
// lock acquired
if (ttl == null) {
    return;
}
```

leaseTime默认值为-1，如果传参，此时leaseTime != -1 则会进去抢锁

```java
if (leaseTime != -1) {
    return tryLockInnerAsync(waitTime, leaseTime, unit, threadId, RedisCommands.EVAL_LONG);
}
```

如果是没有传入时间，则此时也会进行抢锁， 而且抢锁时间是默认看门狗时间 

#### 看门狗原理

如果是没有传入时间，则此时也会进行抢锁， 而且抢锁时间是默认看门狗时间 

```java
//抢锁
RFuture<Long> ttlRemainingFuture = tryLockInnerAsync(waitTime,
            //没有传入时间，则此时也会进行抢锁， 而且抢锁时间是默认看门狗时间 
        	commandExecutor.getConnectionManager().getCfg().getLockWatchdogTimeout(),
            TimeUnit.MILLISECONDS, 
            threadId, 
            RedisCommands.EVAL_LONG);

//监听抢锁结果
ttlRemainingFuture.onComplete((ttlRemaining, e) -> {
    if (e != null) {
        return;
    }

    // 抢到锁后，后台开启一个线程，进行续约逻辑，也就是看门狗线程
    if (ttlRemaining == null) {
        scheduleExpirationRenewal(threadId);
    }
});
return ttlRemainingFuture;
```

```java
//续约逻辑
private void renewExpiration() {
    ExpirationEntry ee = EXPIRATION_RENEWAL_MAP.get(getEntryName());
    if (ee == null) {
        return;
    }
    //通过参数2，参数3 去描述什么时候去做参数1的事情,即到过期时间的1/3续约
    Timeout task = commandExecutor.getConnectionManager().newTimeout(new TimerTask() {
        @Override
        public void run(Timeout timeout) throws Exception {
            ExpirationEntry ent = EXPIRATION_RENEWAL_MAP.get(getEntryName());
            if (ent == null) {
                return;
            }
            Long threadId = ent.getFirstThreadId();
            if (threadId == null) {
                return;
            }
            //续约
            RFuture<Boolean> future = renewExpirationAsync(threadId);
            //监听续约结果
            future.onComplete((res, e) -> {
                if (e != null) {
                    log.error("Can't update lock " + getName() + " expiration", e);
                    return;
                }
                //续约成功，递归调用自己，再重新设置一个timeTask()，完成不停的续约
				//假设我们的线程出现了宕机,不能再调用renewExpiration方法，时间到后自然释放
                if (res) {
                    // reschedule itself
                    renewExpiration();
                }
            });
        }
    }, internalLockLeaseTime / 3, TimeUnit.MILLISECONDS);
    
    ee.setTimeout(task);
}
```

#### MutiLock原理

为了提高redis的可用性，我们会搭建集群或者主从，现在以**主从为例**

**问题**：主机还没有来得及把数据写入到从机去的时候，此时主机宕机，哨兵会发现主机宕机，并且选举一个slave变成master，而此时**新的master中实际上并没有锁信息**，此时锁信息就已经丢掉了

**解决**：redission提出来了MutiLock锁，使用这把锁后**每个节点的地位都一样**， 这把锁加锁的逻辑需要写入到每一个主从节点上，**只有所有的服务器都写入成功，此时才是加锁成功**，假设现在某个节点挂了，那么他去获得锁的时候，只要有一个节点拿不到，都不能算是加锁成功，就保证了加锁的可靠性

**原理**：redission会将多个锁添加到一个集合中，然后用while循环去不停去尝试拿锁，但是会有一个总共的加锁时间，这个时间是用需要加锁的个数 * 1500ms ，假设有3个锁，那么时间就是4500ms，假设在这4500ms内，所有的锁都加锁成功， 那么此时才算是加锁成功，如果在4500ms有线程加锁失败，则会再次去进行重试

![image-20221031233735846](http://minio.botuer.com/study-node/old/image-20221031233735846.png)

### Spring Cache

#### 整合

- 依赖

  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-cache</artifactId>
  </dependency>
  ```

- 配置

  ```properties
  spring.cache.type=redis
  #spring.cache.cache-names=
  
  #一小时，这里单位是毫秒
  spring.cache.redis.time-to-live=3600000
  #如果使用前缀，就用我们指定的前缀，如果没有就默认使用缓存的名字作为前缀
  spring.cache.redis.key-prefix=CACHE_
  spring.cache.redis.use-key-prefix=true
  ## 是否缓存空值。防止缓存穿透
  spring.cache.redis.cache-null-values=true
  ```

- 开启

  ```java
  @EnableCaching  // 开启缓存
  ```

- 使用

  ```java
  /**
   * 'catagory'放到哪个名字的缓存【缓存的分区（按照业务类型分）】
   *
   * 代表当前方法的结果需要缓存,如果缓存中有，方法不用调用
   * 如果缓存中没有，会调用方法，最后将方法的结果放入缓存
   *
   *  默认行为
   *  1）、如果缓存中有，方法不用调用
   *  2）、key默认自动生成，缓存名字::SimpleKey []（自动生成的key）
   *  3）、缓存的value值，默认使用的是jdk的序列化机制，将序列化后的值存在redis中
   *  4）、默认时间ttl=-1
   *
   *  自定义属性：
   *  1）、指定生成的缓存使用的key：key属性指定，使用spel表达式
   *        SPEL表达式：https://docs.spring.io/spring/docs/5.2.7.RELEASE/spring-framework-reference/integration.html#cache-spel-context
   *   2）、指定缓存的数据的存活时间：配置文件中修改ttl，spring.cache.redis.time-to-live=3600000
   *   3）、将数据保存为json格式（异构系统比如php可能不兼容）
   */
  
  //因为spel动态取值，所有需要额外加''表示字符串
  @Cacheable(value = {"catagory"},key = "'Level1Categorys'")
  @Override
  public List<CategoryEntity> getLevel1Categorys() {
      System.out.println("getLevel1Categorys......");
      long l = System.currentTimeMillis();
      return baseMapper.selectList(new QueryWrapper<CategoryEntity>().eq("parent_cid", 0));
  }
  ```

- 配置类

  ```java
  //开启属性配置绑定
  @EnableConfigurationProperties({CacheProperties.class})
  @EnableCaching
  @Configuration
  public class MyCacheConfig {
  
      /**
       * 配置文件中的东西没有用上
       *1、原来和配置文件绑定的配置类，是这样子的
       * @ConfigurationProperties(prefix = "spring.cache")
       * public class CacheProperties
       *2、要让他生效，要用这个注解，@EnableConfigurationProperties
       */
      @Bean
      public RedisCacheConfiguration redisCacheConfiguration(CacheProperties cacheProperties) {
          CacheProperties.Redis redisProperties = cacheProperties.getRedis();
          
          RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig();
          //指定缓存序列化方式为json
          config = config.serializeKeysWith(RedisSerializationContext
                                .SerializationPair
                                .fromSerializer(new StringRedisSerializer()));
          config = config.serializeValuesWith(RedisSerializationContext
                   .SerializationPair
                   .fromSerializer(new GenericJackson2JsonRedisSerializer()));
          CacheProperties.Redis redisProperties = cacheProperties.getRedis();
          //设置配置文件中的各项配置，如过期时间
          if (redisProperties.getTimeToLive() != null) {
              config = config.entryTtl(redisProperties.getTimeToLive());
          }
          if (redisProperties.getKeyPrefix() != null) {
              config = config.prefixKeysWith(redisProperties.getKeyPrefix());
          }
          if (!redisProperties.isCacheNullValues()) {
              config = config.disableCachingNullValues();
          }
          if (!redisProperties.isUseKeyPrefix()) {
              config = config.disableKeyPrefix();
          }
          return config;
      }
  }
  ```

- 缓存失效

  ```java
  //在执行被注解的方法时，会将缓存中的该数据删除
  @CacheEvict(value = {"category"},key = "'levelCategorys'")
  //删除多个
  @Caching(evict = {
          @CacheEvict(value = "category",key= "'xxx'"),
          @CacheEvict(value = "category",key = "'yyy'")
  })
  //删除所有
  @CacheEvict(value="category",allEntries=true)
  ```

- **问题：读模式下缓存击穿的锁默认没有开启，开启后是本地锁，不是分布式锁，写模式无锁**

  ```java
  // sync = true
  @Cacheable(value = {"catagory"}, key = "#root.method.name", sync = true)
  ```

  

## 分布式缓存

单机的Redis存在四大问题：

![image-20221030191448936](http://minio.botuer.com/study-node/old/image-20221030191448936.png)

### Redis持久化

Redis有两种持久化方案：

- RDB持久化
- AOF持久化

#### RDB持久化

RDB全称Redis Database Backup file（Redis数据备份文件），也被叫做Redis数据快照。简单来说就是把内存中的所有数据都记录到磁盘中。当Redis实例故障重启后，从磁盘读取快照文件，恢复数据。快照文件称为RDB文件，默认是保存在当前运行目录

**执行时机**

RDB持久化在四种情况下会执行：

- 执行save命令
- 执行bgsave命令
- Redis停机时
- 触发RDB条件时

**1）save命令**

> 可以立即执行一次RDB，save命令会导致主进程执行RDB，这个过程中其它所有命令都会被阻塞。只有在数据迁移时可能用到

**2）bgsave命令**

> 异步执行RDB，这个命令执行后会开启独立进程完成RDB，主进程可以持续处理用户请求，不受影响

**3）停机时**

Redis停机时会执行一次save命令，实现RDB持久化

**4）触发RDB条件**

Redis内部有触发RDB的机制，可以在redis.conf文件中找到，格式如下：

```properties
## 900秒内，如果至少有1个key被修改，则执行bgsave ， 如果是save "" 则表示禁用RDB
save 900 1  
save 300 10  
save 60 10000 
```

RDB的其它配置也可以在redis.conf文件中设置：

```properties
## 是否压缩 ,建议不开启，压缩也会消耗cpu，磁盘的话不值钱
rdbcompression yes

## RDB文件名称
dbfilename dump.rdb  

## 文件保存的路径目录
dir ./ 
```

**RDB原理**

bgsave开始时会fork主进程得到子进程，子进程共享主进程的内存数据。完成fork后读取内存数据并写入 RDB 文件。

fork采用的是copy-on-write技术：

- 当主进程执行读操作时，访问共享内存；
- 当主进程执行写操作时，则会拷贝一份数据，执行写操作。

![image-20221030191842933](http://minio.botuer.com/study-node/old/image-20221030191842933.png)

**总结**

- RDB方式bgsave的基本流程？

  - fork主进程得到一个子进程，共享内存空间

  - 子进程读取内存数据并写入新的RDB文件

  - 用新RDB文件替换旧的RDB文件


- RDB会在什么时候执行？save 60 1000代表什么含义？

  - 默认是服务停止时

  - 代表60秒内至少执行1000次修改则触发RDB


- RDB的缺点？

  - RDB执行间隔时间长，两次RDB之间写入数据有丢失的风险

  - fork子进程、压缩、写出RDB文件都比较耗时

#### AOF持久化

**AOF原理**

AOF全称为Append Only File（追加文件）。Redis处理的每一个写命令都会记录在AOF文件，可以看做是命令日志文件

![image-20221030192220846](http://minio.botuer.com/study-node/old/image-20221030192220846.png)

**AOF配置**

AOF默认是关闭的，需要修改redis.conf配置文件来开启AOF：

```properties
## 是否开启AOF功能，默认是no
appendonly yes
## AOF文件的名称
appendfilename "appendonly.aof"
```

AOF的命令记录的频率也可以通过redis.conf文件来配：

```properties
## 表示每执行一次写命令，立即记录到AOF文件
appendfsync always 
## 写命令执行完先放入AOF缓冲区，然后表示每隔1秒将缓冲区数据写到AOF文件，是默认方案
appendfsync everysec 
## 写命令执行完先放入AOF缓冲区，由操作系统决定何时将缓冲区内容写回磁盘
appendfsync no
```

三种策略对比：

![image-20221030192245302](http://minio.botuer.com/study-node/old/image-20221030192245302.png)

**AOF文件重写**

因为是记录命令，AOF文件会比RDB文件大的多。而且AOF会记录对同一个key的多次写操作，但只有最后一次写操作才有意义。通过执行bgrewriteaof命令，可以让AOF文件执行重写功能，用最少的命令达到相同效果

![image-20221030192328525](http://minio.botuer.com/study-node/old/image-20221030192328525.png)

> AOF原本有三个命令，但是`set num 123 和 set num 666`都是对num的操作，第二次会覆盖第一次的值，因此第一个命令记录下来没有意义。
>
> 所以重写命令后，AOF文件内容就是：`mset name jack num 666`

Redis也会在触发阈值时自动去重写AOF文件。阈值也可以在redis.conf中配置：

```properties
## AOF文件比上次文件 增长超过多少百分比则触发重写
auto-aof-rewrite-percentage 100
## AOF文件体积最小多大以上才触发重写 
auto-aof-rewrite-min-size 64mb 
```

#### RDB与AOF对比

RDB和AOF各有自己的优缺点，如果对数据安全性要求较高，在实际开发中往往会**结合**两者来使用

![image-20221030192424724](http://minio.botuer.com/study-node/old/image-20221030192424724.png)

### Redis主从

#### 全量同步

主从第一次建立连接时，会执行**全量同步**，将master节点的所有数据都拷贝给slave节点

![image-20221030201758737](http://minio.botuer.com/study-node/old/image-20221030201758737.png)

> 这里有一个问题，master如何得知salve是第一次来连接呢？？
>
> 有几个概念，可以作为判断依据：
>
> - **Replication Id**：简称replid，是数据集的标记，id一致则说明是同一数据集。每一个master都有唯一的replid，slave则会继承master节点的replid
> - **offset**：偏移量，随着记录在repl_baklog中的数据增多而逐渐增大。slave完成同步时也会记录当前同步的offset。如果slave的offset小于master的offset，说明slave数据落后于master，需要更新。
>
> 因此slave做数据同步，必须向master声明自己的replication id 和offset，master才可以判断到底需要同步哪些数据
>
> - 因为slave原本也是一个master，有自己的replid和offset，当第一次变成slave，与master建立连接时，发送的replid和offset是自己的replid和offset
>
> - master判断发现slave发送来的replid与自己的不一致，说明这是一个全新的slave，就知道要做全量同步了
>
> - master会将自己的replid和offset都发送给这个slave，slave保存这些信息。以后slave的replid就与master一致了
>
> 因此，**master判断一个节点是否是第一次同步的依据，就是看replid是否一致**
>
> ![image-20221030202033085](http://minio.botuer.com/study-node/old/image-20221030202033085.png)

- 完整流程描述：

  - slave节点请求增量同步

  - master节点判断replid，发现不一致，拒绝增量同步

  - master将完整内存数据生成RDB，发送RDB到slave

  - slave清空本地数据，加载master的RDB

  - master将RDB期间的命令记录在repl_baklog，并持续将log中的命令发送给slave

  - slave执行接收到的命令，保持与master之间的同步

#### 增量同步

全量同步需要先做RDB，然后将RDB文件通过网络传输个slave，成本太高了。因此除了第一次做全量同步，其它大多数时候slave与master都是做**增量同步**。

什么是增量同步？就是只更新slave与master存在差异的部分数据。如图：

![image-20221030202149105](http://minio.botuer.com/study-node/old/image-20221030202149105.png)



master怎么知道slave与自己的数据差异在哪里呢?

这就要说到全量同步时的repl_baklog文件了。

这个文件是一个固定大小的数组，只不过数组是环形，也就是说**角标到达数组末尾后，会再次从0开始读写**，这样数组头部的数据就会被覆盖



![image-20221030202248782](http://minio.botuer.com/study-node/old/image-20221030202248782.png)![image-20221030202338713](http://minio.botuer.com/study-node/old/image-20221030202338713.png)![image-20221030202428519](http://minio.botuer.com/study-node/old/image-20221030202428519.png)

- repl_baklog中会记录Redis处理过的命令日志及offset，包括master当前的offset，和slave已经拷贝到的offset，slave与master的offset之间的差异，就是salve需要增量拷贝的数据了

- 随着不断有数据写入，master的offset逐渐变大，slave也不断的拷贝，追赶master的offset，直到数组被填满

- 如果有新的数据写入，就会覆盖数组中的旧数据。不过，旧的数据只要是绿色的，说明是已经被同步到slave的数据，即便被覆盖了也没什么影响。因为未同步的仅仅是红色部分
- 但是，如果slave出现网络阻塞，导致master的offset远远超过了slave的offset，如果master继续写入新数据，其offset就会覆盖旧数据，直到将slave现在的offset也覆盖，还未同步的数据被覆盖，无法完成增量同步，**只能进行全量同步**

#### 主从同步优化

主从同步可以保证主从数据的一致性，非常重要。

可以从以下几个方面来优化Redis主从就集群：

- 在master中配置repl-diskless-sync yes**启用无磁盘复制**，避免全量同步时的磁盘IO。
- Redis**单节点上的内存占用不要太大**，减少RDB导致的过多磁盘IO
- 适当提高repl_baklog的大小，发现slave宕机时尽快实现故障恢复，**尽可能避免全量同步**
- 限制一个master上的slave节点数量，如果实在是太多slave，则可以采用**主-从-从链式结构**，减少master压力

### Redis哨兵

Redis提供了哨兵（Sentinel）机制来实现主从集群的自动故障恢复。

#### 哨兵原理

**作用**

- **监控**：Sentinel 会不断检查您的master和slave是否按预期工作
- **自动故障恢复**：如果master故障，Sentinel会将一个slave提升为master。当故障实例恢复后也以新的master为主
- **通知**：Sentinel充当Redis客户端的服务发现来源，当集群发生故障转移时，会将最新信息推送给Redis的客户端

**原理**

- Sentinel基于心跳机制监测服务状态，每隔1秒向集群的每个实例发送ping命令
- 主观下线：如果某sentinel节点发现某实例未在规定时间响应，则认为该实例**主观下线**
- 客观下线：若超过指定数量（quorum）的sentinel都认为该实例主观下线，则该实例**客观下线**quorum值最好超过Sentinel实例数量的一半

**集群故障恢复原理**

一旦发现master故障，sentinel需要在salve中选择一个作为新的master，选择依据是这样的：

- 首先会判断slave节点与master节点断开时间长短，如果超过指定值（down-after-milliseconds * 10）则会排除该slave节点
- 然后判断slave节点的slave-priority值，越小优先级越高，如果是0则永不参与选举
- 如果slave-prority一样，则判断slave节点的offset值，越大说明数据越新，优先级越高
- 最后是判断slave节点的运行id大小，越小优先级越高

**当选出一个新的master后，该如何实现切换呢？**

- sentinel给备选的slave1节点发送slaveof no one命令，让该节点成为master
- sentinel给所有其它slave发送slaveof 192.168.150.101 7002 命令，让这些slave成为新master的从节点，开始从新的master上同步数据
- 最后，sentinel将故障节点标记为slave，当故障节点恢复后会自动成为新的master的slave节点

#### 集成

在Sentinel集群监管下的Redis主从集群，其节点会因为自动故障转移而发生变化，Redis的客户端必须感知这种变化，及时更新连接信息。Spring的RedisTemplate底层利用lettuce实现了节点的感知和自动切换

- 依赖

  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-redis</artifactId>
  </dependency>
  ```

- 配置

  ```yml
  spring:
    redis:
      sentinel:
        master: mymaster
        nodes:
          - 192.168.150.101:27001
          - 192.168.150.101:27002
          - 192.168.150.101:27003
  ```

- 配置类 -- 读写分离

  ```java
  @Bean
  public LettuceClientConfigurationBuilderCustomizer clientConfigurationBuilderCustomizer(){
      return clientConfigurationBuilder -> clientConfigurationBuilder.readFrom(ReadFrom.REPLICA_PREFERRED);
  }
  ```

  这个bean中配置的就是读写策略，包括四种：

  - MASTER：从主节点读取
  - MASTER_PREFERRED：优先从master节点读取，master不可用才读取replica
  - REPLICA：从slave（replica）节点读取
  - REPLICA _PREFERRED：优先从slave（replica）节点读取，所有的slave都不可用才读取master

### Redis分片

主从和哨兵可以解决高可用、高并发读的问题。但是依然有两个问题没有解决：

- 海量数据存储问题

- 高并发写的问题

分片集群特征：

- 集群中有多个master，每个master保存不同数据

- 每个master都可以有多个slave节点

- master之间通过ping监测彼此健康状态

- 客户端请求可以访问集群任意节点，最终都会被转发到正确节点

#### 散列插槽

Redis会把每一个master节点映射到0~16383共16384个插槽（hash slot）上，查看集群信息时就能看到

数据key不是与节点绑定，而是与插槽绑定。redis会根据key的有效部分计算插槽值，分两种情况：

- key中包含"{}"，且“{}”中至少包含1个字符，“{}”中的部分是有效部分
- key中不包含“{}”，整个key都是有效部分

> 例如：key是num，那么就根据num计算，如果是{itcast}num，则根据itcast计算。计算方式是利用CRC16算法得到一个hash值，然后对16384取余，得到的结果就是slot值

**小结**

Redis如何判断某个key应该在哪个实例？

- 将16384个插槽分配到不同的实例
- 根据key的有效部分计算哈希值，对16384取余
- 余数作为插槽，寻找插槽所在实例即可

如何将同一类数据固定的保存在同一个Redis实例？

- 这一类数据使用相同的有效部分，例如key都以{typeId}为前缀

#### 集群伸缩

**添加节点**

- 创建一个文件夹

  ```sh
  mkdir 7004
  ```

- 拷贝配置文件

  ```sh
  cp redis.conf /7004
  ```

- 修改配置文件

  ```sh
  sed /s/6379/7004/g 7004/redis.conf
  ```

- 启动

  ```sh
  redis-server 7004/redis.conf
  ```

- 添加节点

  ```sh
  redis-cli --cluster add-node 192.168.150.101:7004 192.168.150.101:7001
  ```

- 通过命令查看集群状态 -- 默认新添加的为master节点

  ```sh
  redis-cli -p 7001 cluster nodes
  ```

- 转移插槽

  ```sh
  #建立连接
  redis-cli --cluster reshard 192.168.150.101:7001
  #输入转移多少
  #输入转移到的节点id
  #输入从哪个节点复制：输入all 或 id + ... + done
   - all：代表全部，也就是三个节点各转移一部分	
   - 具体的id：目标节点的id
   - done：没有了
  ```

#### 故障转移

- 自动故障转移

  直接停止一个redis实例，例如7002：

  ```sh
  redis-cli -p 7002 shutdown
  ```

  > - 首先是该实例与其它实例失去连接
  > - 然后是疑似宕机
  > - 最后是确定下线，自动提升一个slave为新的master
  > - 当7002再次启动，就会变为一个slave节点了

- 手动故障转移

  利用cluster failover命令可以手动让集群中的某个master宕机，切换到执行cluster failover命令的这个slave节点，实现无感知的数据迁移

  这种failover命令可以指定三种模式：

  - 缺省：默认的流程，如图1~6歩
  - force：省略了对offset的一致性校验
  - takeover：直接执行第5歩，忽略数据一致性、忽略master状态和其它master的意见

  ![image-20221030210643449](http://minio.botuer.com/study-node/old/image-20221030210643449.png)

#### 集成

RedisTemplate底层同样基于lettuce实现了分片集群的支持，而使用的步骤与哨兵模式基本一致：

1）引入redis的starter依赖

2）配置分片集群地址

3）配置读写分离

与哨兵模式相比，其中只有分片集群的配置方式略有差异，如下

```yaml
spring:
  redis:
    cluster:
      nodes:
        - 192.168.150.101:7001
        - 192.168.150.101:7002
        - 192.168.150.101:7003
        - 192.168.150.101:8001
        - 192.168.150.101:8002
        - 192.168.150.101:8003
```

## 多级缓存

传统的缓存策略一般是请求到达Tomcat后，先查询Redis，如果未命中则查询数据库

存在下面的问题：

- 请求要经过Tomcat处理，Tomcat的性能成为整个系统的瓶颈
- Redis缓存失效时，会对数据库产生冲击

多级缓存就是充分利用请求处理的每个环节，分别添加缓存，减轻Tomcat压力，提升服务性能

- 浏览器访问静态资源时，优先读取浏览器本地缓存
- 访问非静态资源（ajax查询数据）时，访问服务端
- 请求到达Nginx后，优先读取Nginx本地缓存
- 如果Nginx本地缓存未命中，则去直接查询Redis（不经过Tomcat）
- 如果Redis查询未命中，则查询Tomcat
- 请求进入Tomcat后，优先查询JVM进程缓存
- 如果JVM进程缓存未命中，则查询数据库

![image-20221031153948587](http://minio.botuer.com/study-node/old/image-20221031153948587.png)

在多级缓存架构中，Nginx内部需要编写本地缓存查询、Redis查询、Tomcat查询的业务逻辑，因此这样的nginx服务不再是一个**反向代理服务器**，而是一个编写**业务的Web服务器了**



因此这样的业务Nginx服务也需要搭建集群来提高并发，再有专门的nginx服务来做反向代理

![image-20221031154032969](http://minio.botuer.com/study-node/old/image-20221031154032969.png)

另外，我们的Tomcat服务将来也会部署为集群模式：

![image-20221031154043536](http://minio.botuer.com/study-node/old/image-20221031154043536.png)

可见，多级缓存的关键有两个：

- 一个是在nginx中编写业务，实现nginx本地缓存、Redis、Tomcat的查询

- 另一个就是在Tomcat中实现JVM进程缓存

其中Nginx编程则会用到OpenResty框架结合Lua这样的语言

### JVM进程缓存 - Caffeine

#### 概述

**缓存分类**

- 分布式缓存，例如Redis：
  - 优点：存储容量更大、可靠性更好、可以在集群间共享
  - 缺点：访问缓存有网络开销
  - 场景：缓存数据量较大、可靠性要求较高、需要在集群间共享
- 进程本地缓存，例如HashMap、GuavaCache：
  - 优点：读取本地内存，没有网络开销，速度更快
  - 缺点：存储容量有限、可靠性较低、无法共享
  - 场景：性能要求较高，缓存数据量较小

**Caffeine**是一个基于Java8开发的，提供了近乎最佳命中率的高性能的本地缓存库。目前Spring内部的缓存使用的就是Caffeine。GitHub地址：https://github.com/ben-manes/caffeine

**基本使用**

```java
@Test
void testBasicOps() {
    // 构建cache对象
    Cache<String, String> cache = Caffeine.newBuilder().build();

    // 存数据
    cache.put("gf", "迪丽热巴");

    // 取数据
    String gf = cache.getIfPresent("gf");
    System.out.println("gf = " + gf);

    // 取数据，包含两个参数：
    // 参数一：缓存的key
    // 参数二：Lambda表达式，表达式参数就是缓存的key，方法体是查询数据库的逻辑
    // 优先根据key查询JVM缓存，如果未命中，则执行参数二的Lambda表达式
    String defaultGF = cache.get("defaultGF", key -> {
        // 根据key去数据库查询数据
        return "柳岩";
    });
    System.out.println("defaultGF = " + defaultGF);
}
```

**清除策略**

> Caffeine既然是缓存的一种，肯定需要有缓存的清除策略，不然的话内存总会有耗尽的时候

- **基于容量**：设置缓存的数量上限

  ```java
  // 创建缓存对象
  Cache<String, String> cache = Caffeine.newBuilder()
      .maximumSize(1) // 设置缓存大小上限为 1
      .build();
  ```

- **基于时间**：设置缓存的有效时间

  ```java
  // 创建缓存对象
  Cache<String, String> cache = Caffeine.newBuilder()
      // 设置缓存有效期为 10 秒，从最后一次写入开始计时 
      .expireAfterWrite(Duration.ofSeconds(10)) 
      .build();
  
  ```

- **基于引用**：设置缓存为软引用或弱引用，利用GC来回收缓存数据。性能较差，不建议使用

> **注意**：在默认情况下，当一个缓存元素过期的时候，Caffeine不会自动立即将其清理和驱逐。而是在一次读或写操作后，或者在空闲时间完成对失效数据的驱逐

#### 整合

**需求**

- 给根据id查询商品的业务添加缓存，缓存未命中时查询数据库
- 给根据id查询商品库存的业务添加缓存，缓存未命中时查询数据库
- 缓存初始大小为100
- 缓存上限为10000

**实现**

- 配置类

  ```java
  @Configuration
  public class CaffeineConfig {
  
      //商品缓存
      @Bean
      public Cache<Long, Item> itemCache(){
          return Caffeine.newBuilder()
                  .initialCapacity(100)
                  .maximumSize(10_000)
                  .build();
      }
  	//库存缓存
      @Bean
      public Cache<Long, ItemStock> stockCache(){
          return Caffeine.newBuilder()
                  .initialCapacity(100)
                  .maximumSize(10_000)
                  .build();
      }
  }
  ```

- controller

  ```java
  @RestController
  @RequestMapping("item")
  public class ItemController {
  
      @Autowired
      private IItemService itemService;
      @Autowired
      private IItemStockService stockService;
  
      @Autowired
      private Cache<Long, Item> itemCache;
      @Autowired
      private Cache<Long, ItemStock> stockCache;
      
      // ...其它略
      
      @GetMapping("/{id}")
      public Item findById(@PathVariable("id") Long id) {
          return itemCache.get(id, key -> itemService.query()
                  .ne("status", 3).eq("id", key)
                  .one()
          );
      }
  
      @GetMapping("/stock/{id}")
      public ItemStock findStockById(@PathVariable("id") Long id) {
          return stockCache.get(id, key -> stockService.getById(key));
      }
  }
  ```

- service中查库后放入缓存

### Redis缓存 - 略

### Nginx缓存 - OpenResty

**架构**

- nginx用来反向代理
- openResty用来多级缓存

#### 建立连接

- 查询请求发给nginx，代理给openResty集群

  ```nginx
  upstream nginx-cluster{
      server 192.168.10.101:8081;
      server 192.168.10.101:8082;
  }
  server{
      listen		80;
      server_name	localhost;
      
      location /api{
          proxy_pass http://nginx-cluster;
      }
  }
  ```

- OpenResty监听请求

  > OpenResty的很多功能都依赖于其目录下的Lua库，需要在nginx.conf中指定依赖库的目录，并导入依赖

  - 添加对OpenResty的Lua模块的加载

    修改`/usr/local/openresty/nginx/conf/nginx.conf`文件，在其中的**http下面**，添加下面代码

    ```nginx
    #lua 模块
    lua_package_path "/usr/local/openresty/lualib/?.lua;;";
    #c模块     
    lua_package_cpath "/usr/local/openresty/lualib/?.so;;";  
    ```

  - 监听/api/item路径

    修改`/usr/local/openresty/nginx/conf/nginx.conf`文件，在nginx.conf的**server下面**，添加对/api/item这个路径的监听：

    ```nginx
    location  /api/item {
        ## 默认的响应类型
        default_type application/json;
        ## 响应结果由lua/item.lua文件来决定
        content_by_lua_file lua/item.lua;
    }
    ```

    > 这个监听，就类似于SpringMVC中的`@GetMapping("/api/item")`做路径映射
    >
    > 而`content_by_lua_file lua/item.lua`则相当于调用item.lua这个文件，执行其中的业务，把结果返回给用户
    >
    > 相当于java中调用service

- 编写item.lua

  - 在`/usr/loca/openresty/nginx`目录创建文件夹：lua

  - 在`/usr/loca/openresty/nginx/lua`文件夹下，新建文件：item.lua

    ```sh
    cd /usr/loca/openresty/nginx
    mkdir lua
    touch lua/item.lua
    ```

  - 编写item.lua，返回假数据

    item.lua中，利用ngx.say()函数返回数据到Response中

    ```lua
    ngx.say('{"id":10001,"name":"SALSA AIR","title":"RIMOWA 21寸托运箱拉杆箱 SALSA AIR系列果绿色 820.70.36.4","price":17900,"image":"https://m.360buyimg.com/mobilecms/s720x720_jfs/t6934/364/1195375010/84676/e9f2c55f/597ece38N0ddcbc77.jpg!q70.jpg.webp","category":"拉杆箱","brand":"RIMOWA","spec":"","status":1,"createTime":"2019-04-30T16:00:00.000+00:00","updateTime":"2019-04-30T16:00:00.000+00:00","stock":2999,"sold":31290}')
    ```

  - 重新加载配置

    ```sh
    nginx -s reload
    ```

  - 测试 --- 访问查询页面

- 请求参数处理

  - OpenResty中提供了一些API用来获取不同类型的前端请求参数

    ![image-20221031163841443](http://minio.botuer.com/study-node/old/image-20221031163841443.png)

  - 以路径占位符为例，利用正则表达式匹配的方式来获取ID

  - 获取商品id

    修改`/usr/loca/openresty/nginx/nginx.conf`文件中监听/api/item的代码，利用正则表达式获取ID：

    ```nginx
    location ~ /api/item/(\d+) {
        ## 默认的响应类型
        default_type application/json;
        ## 响应结果由lua/item.lua文件来决定
        content_by_lua_file lua/item.lua;
    }
    ```

  - 拼接ID并返回

    修改`/usr/loca/openresty/nginx/lua/item.lua`文件，获取id并拼接到结果中返回：

    ```lua
    -- 获取商品id
    local id = ngx.var[1]
    -- 拼接并返回
    ngx.say('{"id":' .. id .. ',"name":"SALSA AIR","title":"RIMOWA 21寸托运箱拉杆箱 SALSA AIR系列果绿色 820.70.36.4","price":17900,"image":"https://m.360buyimg.com/mobilecms/s720x720_jfs/t6934/364/1195375010/84676/e9f2c55f/597ece38N0ddcbc77.jpg!q70.jpg.webp","category":"拉杆箱","brand":"RIMOWA","spec":"","status":1,"createTime":"2019-04-30T16:00:00.000+00:00","updateTime":"2019-04-30T16:00:00.000+00:00","stock":2999,"sold":31290}')
    ```

  - 重新加载测试 --- 发现响应结果有id

#### 查询Tomcat

##### 发送请求

**nginx提供了内部API用以发送http请求**

```lua
local resp = ngx.location.capture("/path",{
    method = ngx.HTTP_GET,   -- 请求方式
    args = {a=1,b=2},  -- get方式传参数
})
```

返回的响应内容包括：

- resp.status：响应状态码
- resp.header：响应头，是一个table
- resp.body：响应体，就是响应数据

> 注意：这里的path是路径，并不包含IP和端口。这个请求会被nginx内部的server监听并处理
>
> 但是我们希望这个请求发送到Tomcat服务器，所以还需要编写一个server来对这个路径做反向代理
>
> ```nginx
>  location /path {
>      ## 这里是windows电脑的ip和Java服务端口，需要确保windows防火墙处于关闭状态
>      proxy_pass http://192.168.150.1:8081; 
>  }
> ```
>
> ![image-20221031164845508](http://minio.botuer.com/study-node/old/image-20221031164845508.png)

##### 封装http工具

基于ngx.location.capture来实现查询tomcat

- 添加反向代理，监听Java服务 -- 监听/item路径，代理到windows上的tomcat服务

  修改 `/usr/local/openresty/nginx/conf/nginx.conf`文件

  ```nginx
  location /item {
      proxy_pass http://192.168.150.1:8081;
  }
  ```

- 封装工具类

  OpenResty启动时会加载以下两个目录中的工具文件

  ![image-20221031165922748](http://minio.botuer.com/study-node/old/image-20221031165922748.png)

  所以，自定义的http工具也需要放到这个目录下

  在`/usr/local/openresty/lualib`目录下，新建common.lua文件

  ```sh
  vi /usr/local/openresty/lualib/common.lua
  ```

  ```lua
  
  -- 封装函数，发送http请求，并解析响应
  local function read_http(path, params)
      local resp = ngx.location.capture(path,{
          method = ngx.HTTP_GET,
          args = params,
      })
      if not resp then
          -- 记录错误信息，返回404
          ngx.log(ngx.ERR, "http请求查询失败, path: ", path , ", args: ", args)
          ngx.exit(404)
      end
      return resp.body
  end
  -- 将方法导出
  local _M = {  
      read_http = read_http
  }  
  return _M
  ```

  这个工具将read_http函数封装到_M这个table类型的变量中，并且返回，这类似于导出

  使用的时候，可以利用`require('common')`来导入该函数库，这里的common是函数库的文件名

- 实现商品查询

  最后，我们修改`/usr/local/openresty/lua/item.lua`文件，利用刚刚封装的函数库实现对tomcat的查询：

  ```lua
  -- 引入自定义common工具模块，返回值是common中返回的 _M
  local common = require("common")
  -- 从 common中获取read_http这个函数
  local read_http = common.read_http
  -- 获取路径参数
  local id = ngx.var[1]
  -- 根据id查询商品
  local itemJSON = read_http("/item/".. id, nil)
  -- 根据id查询商品库存
  local itemStockJSON = read_http("/item/stock/".. id, nil)
  ```

  这里查询到的结果是json字符串，并且包含商品、库存两个json字符串，页面最终需要的是把两个json拼接为一个json

  这就需要我们先把JSON变为lua的table，完成数据整合后，再转为JSON

  ```lua
  -- 导入common函数库
  local common = require('common')
  local read_http = common.read_http
  -- 导入cjson库
  local cjson = require('cjson')
  
  -- 获取路径参数
  local id = ngx.var[1]
  -- 根据id查询商品
  local itemJSON = read_http("/item/".. id, nil)
  -- 根据id查询商品库存
  local itemStockJSON = read_http("/item/stock/".. id, nil)
  
  -- JSON转化为lua的table
  local item = cjson.decode(itemJSON)
  local stock = cjson.decode(stockJSON)
  
  -- 组合数据
  item.stock = stock.stock
  item.sold = stock.sold
  
  -- 把item序列化为json 返回结果
  ngx.say(cjson.encode(item))
  ```

##### CJSON工具类

OpenResty提供了一个cjson的模块用来处理JSON的序列化和反序列化。

官方地址： https://github.com/openresty/lua-cjson/

1）引入cjson模块：

```lua
local cjson = require "cjson"
```

2）序列化：

```lua
local obj = {
    name = 'jack',
    age = 21
}
-- 把 table 序列化为 json
local json = cjson.encode(obj)
```

3）反序列化：

```lua
local json = '{"name": "jack", "age": 21}'
-- 反序列化 json为 table
local obj = cjson.decode(json);
print(obj.name)
```

##### 基于ID负载均衡

刚才的代码中，我们的tomcat是单机部署

实际开发中，tomcat一定是集群模式

因此，OpenResty需要对tomcat集群做负载均衡

而默认的负载均衡规则是轮询模式，当我们查询/item/10001时：

- 第一次会访问8081端口的tomcat服务，在该服务内部就形成了JVM进程缓存
- 第二次会访问8082端口的tomcat服务，该服务内部没有JVM缓存（因为JVM缓存无法共享），会查询数据库
- ...

**因为轮询，第一次查询8081形成的JVM缓存并未生效，直到下一次再次访问到8081时才可以生效，缓存命中率太低了**



怎么办？

如果能让同一个商品，每次查询时都访问同一个tomcat服务，那么JVM缓存就一定能生效了。

也就是说，我们**需要根据商品id做负载均衡，而不是轮询**

**原理**

nginx提供了基于请求路径做负载均衡的算法：

nginx根据请求路径做hash运算，把得到的数值对tomcat服务的数量取余，余数是几，就访问第几个服务，实现负载均衡

例如：

- 我们的请求路径是 /item/10001
- tomcat总数为2台（8081、8082）
- 对请求路径/item/1001做hash运算求余的结果为1
- 则访问第一个tomcat服务，也就是8081

只要id不变，每次hash运算结果也不会变，那就可以保证同一个商品，一直访问同一个tomcat服务，确保JVM缓存生效

**实现**

修改`/usr/local/openresty/nginx/conf/nginx.conf`文件

首先，定义tomcat集群，并设置基于路径做负载均衡：

```nginx 
upstream tomcat-cluster {
    hash $request_uri;
    server 192.168.150.1:8081;
    server 192.168.150.1:8082;
}
```

然后，修改对tomcat服务的反向代理，目标指向tomcat集群：

```nginx
location /item {
    proxy_pass http://tomcat-cluster;
}
```

重新加载OpenResty

```sh
nginx -s reload
```

#### 查询Redis缓存

##### Redis缓存预热

Redis缓存会面临冷启动问题：

**冷启动**：服务刚刚启动时，Redis中并没有缓存，如果所有商品数据都在第一次查询时添加缓存，可能会给数据库带来较大压力

**缓存预热**：在实际开发中，我们可以利用大数据统计用户访问的热点数据，在项目启动时将这些热点数据提前查询并保存到Redis中



我们数据量较少，并且没有数据统计相关功能，目前可以在启动时将所有数据都放入缓存中

1）利用Docker安装Redis

```sh
docker run --name redis -p 6379:6379 -d redis redis-server --appendonly yes
```

2）在item-service服务中引入Redis依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

3）配置Redis地址

```yaml
spring:
  redis:
    host: 192.168.150.101
```

4）编写初始化类

缓存预热需要在项目启动时完成，并且必须是拿到RedisTemplate之后。

这里我们利用`InitializingBean接口`来实现，因为InitializingBean可以在对象被Spring创建并且成员变量全部注入后执行

```java
@Component
public class RedisHandler implements InitializingBean {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private IItemService itemService;
    @Autowired
    private IItemStockService stockService;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void afterPropertiesSet() throws Exception {
        // 初始化缓存
        // 1.查询商品信息
        List<Item> itemList = itemService.list();
        // 2.放入缓存
        for (Item item : itemList) {
            // 2.1.item序列化为JSON
            String json = MAPPER.writeValueAsString(item);
            // 2.2.存入redis
            redisTemplate.opsForValue().set("item:id:" + item.getId(), json);
        }

        // 3.查询商品库存信息
        List<ItemStock> stockList = stockService.list();
        // 4.放入缓存
        for (ItemStock stock : stockList) {
            // 2.1.item序列化为JSON
            String json = MAPPER.writeValueAsString(stock);
            // 2.2.存入redis
            redisTemplate.opsForValue().set("item:stock:id:" + stock.getId(), json);
        }
    }
}
```

##### 封装Redis工具

OpenResty提供了操作Redis的模块，我们只要引入该模块就能直接使用。但是为了方便，我们将Redis操作封装到之前的common.lua工具库中。

修改`/usr/local/openresty/lualib/common.lua`文件：

1）引入Redis模块，并初始化Redis对象

```lua
-- 导入redis
local redis = require('resty.redis')
-- 初始化redis
local red = redis:new()
red:set_timeouts(1000, 1000, 1000)
```

2）封装函数，用来释放Redis连接，其实是放入连接池

```lua
-- 关闭redis连接的工具方法，其实是放入连接池
local function close_redis(red)
    local pool_max_idle_time = 10000 -- 连接的空闲时间，单位是毫秒
    local pool_size = 100 --连接池大小
    local ok, err = red:set_keepalive(pool_max_idle_time, pool_size)
    if not ok then
        ngx.log(ngx.ERR, "放入redis连接池失败: ", err)
    end
end
```

3）封装函数，根据key查询Redis数据

```lua
-- 查询redis的方法 ip和port是redis地址，key是查询的key
local function read_redis(ip, port, key)
    -- 获取一个连接
    local ok, err = red:connect(ip, port)
    if not ok then
        ngx.log(ngx.ERR, "连接redis失败 : ", err)
        return nil
    end
    -- 查询redis
    local resp, err = red:get(key)
    -- 查询失败处理
    if not resp then
        ngx.log(ngx.ERR, "查询Redis失败: ", err, ", key = " , key)
    end
    --得到的数据为空处理
    if resp == ngx.null then
        resp = nil
        ngx.log(ngx.ERR, "查询Redis数据为空, key = ", key)
    end
    close_redis(red)
    return resp
end
```

4）导出

```lua
-- 将方法导出
local _M = {  
    read_http = read_http,
    read_redis = read_redis
}  
return _M
```



完整的common.lua：

```lua
-- 导入redis
local redis = require('resty.redis')
-- 初始化redis
local red = redis:new()
red:set_timeouts(1000, 1000, 1000)

-- 关闭redis连接的工具方法，其实是放入连接池
local function close_redis(red)
    local pool_max_idle_time = 10000 -- 连接的空闲时间，单位是毫秒
    local pool_size = 100 --连接池大小
    local ok, err = red:set_keepalive(pool_max_idle_time, pool_size)
    if not ok then
        ngx.log(ngx.ERR, "放入redis连接池失败: ", err)
    end
end

-- 查询redis的方法 ip和port是redis地址，key是查询的key
local function read_redis(ip, port, key)
    -- 获取一个连接
    local ok, err = red:connect(ip, port)
    if not ok then
        ngx.log(ngx.ERR, "连接redis失败 : ", err)
        return nil
    end
    -- 查询redis
    local resp, err = red:get(key)
    -- 查询失败处理
    if not resp then
        ngx.log(ngx.ERR, "查询Redis失败: ", err, ", key = " , key)
    end
    --得到的数据为空处理
    if resp == ngx.null then
        resp = nil
        ngx.log(ngx.ERR, "查询Redis数据为空, key = ", key)
    end
    close_redis(red)
    return resp
end

-- 封装函数，发送http请求，并解析响应
local function read_http(path, params)
    local resp = ngx.location.capture(path,{
        method = ngx.HTTP_GET,
        args = params,
    })
    if not resp then
        -- 记录错误信息，返回404
        ngx.log(ngx.ERR, "http查询失败, path: ", path , ", args: ", args)
        ngx.exit(404)
    end
    return resp.body
end
-- 将方法导出
local _M = {  
    read_http = read_http,
    read_redis = read_redis
}  
return _M
```

##### 实现Redis查询

接下来，我们就可以去修改item.lua文件，实现对Redis的查询了。

查询逻辑是：

- 根据id查询Redis
- 如果查询失败则继续查询Tomcat
- 将查询结果返回

1）修改`/usr/local/openresty/lua/item.lua`文件，添加一个查询函数：

```lua
-- 导入common函数库
local common = require('common')
local read_http = common.read_http
local read_redis = common.read_redis
-- 封装查询函数
function read_data(key, path, params)
    -- 查询本地缓存
    local val = read_redis("127.0.0.1", 6379, key)
    -- 判断查询结果
    if not val then
        ngx.log(ngx.ERR, "redis查询失败，尝试查询http， key: ", key)
        -- redis查询失败，去查询http
        val = read_http(path, params)
    end
    -- 返回数据
    return val
end
```

2）而后修改商品查询、库存查询的业务：

![image-20221031171912136](http://minio.botuer.com/study-node/old/image-20221031171912136.png)

3）完整的item.lua代码：

```lua
-- 导入common函数库
local common = require('common')
local read_http = common.read_http
local read_redis = common.read_redis
-- 导入cjson库
local cjson = require('cjson')

-- 封装查询函数
function read_data(key, path, params)
    -- 查询本地缓存
    local val = read_redis("127.0.0.1", 6379, key)
    -- 判断查询结果
    if not val then
        ngx.log(ngx.ERR, "redis查询失败，尝试查询http， key: ", key)
        -- redis查询失败，去查询http
        val = read_http(path, params)
    end
    -- 返回数据
    return val
end

-- 获取路径参数
local id = ngx.var[1]

-- 查询商品信息
local itemJSON = read_data("item:id:" .. id,  "/item/" .. id, nil)
-- 查询库存信息
local stockJSON = read_data("item:stock:id:" .. id, "/item/stock/" .. id, nil)

-- JSON转化为lua的table
local item = cjson.decode(itemJSON)
local stock = cjson.decode(stockJSON)
-- 组合数据
item.stock = stock.stock
item.sold = stock.sold

-- 把item序列化为json 返回结果
ngx.say(cjson.encode(item))
```

#### Nginx本地缓存

##### 本地缓存API

OpenResty为Nginx提供了**shard dict**的功能，可以在nginx的多个worker之间共享数据，实现缓存功能。

1）开启共享字典，在nginx.conf的http下添加配置：

```nginx
 ## 共享字典，也就是本地缓存，名称叫做：item_cache，大小150m
 lua_shared_dict item_cache 150m; 
```

2）操作共享字典：

```lua
-- 获取本地缓存对象
local item_cache = ngx.shared.item_cache
-- 存储, 指定key、value、过期时间，单位s，默认为0代表永不过期
item_cache:set('key', 'value', 1000)
-- 读取
local val = item_cache:get('key')
```

##### 实现本地缓存查询

1）修改`/usr/local/openresty/lua/item.lua`文件，修改read_data查询函数，添加本地缓存逻辑：

```lua
-- 导入共享词典，本地缓存
local item_cache = ngx.shared.item_cache

-- 封装查询函数
function read_data(key, expire, path, params)
    -- 查询本地缓存
    local val = item_cache:get(key)
    if not val then
        ngx.log(ngx.ERR, "本地缓存查询失败，尝试查询Redis， key: ", key)
        -- 查询redis
        val = read_redis("127.0.0.1", 6379, key)
        -- 判断查询结果
        if not val then
            ngx.log(ngx.ERR, "redis查询失败，尝试查询http， key: ", key)
            -- redis查询失败，去查询http
            val = read_http(path, params)
        end
    end
    -- 查询成功，把数据写入本地缓存
    item_cache:set(key, val, expire)
    -- 返回数据
    return val
end
```

2）修改item.lua中查询商品和库存的业务，实现最新的read_data函数

![image-20221031172131835](http://minio.botuer.com/study-node/old/image-20221031172131835.png)

其实就是多了缓存时间参数，过期后nginx缓存会自动删除，下次访问即可更新缓存。

这里给商品基本信息设置超时时间为30分钟，库存为1分钟。

因为库存更新频率较高，如果缓存时间过长，可能与数据库差异较大。



3）完整的item.lua文件：

```lua
-- 导入common函数库
local common = require('common')
local read_http = common.read_http
local read_redis = common.read_redis
-- 导入cjson库
local cjson = require('cjson')
-- 导入共享词典，本地缓存
local item_cache = ngx.shared.item_cache

-- 封装查询函数
function read_data(key, expire, path, params)
    -- 查询本地缓存
    local val = item_cache:get(key)
    if not val then
        ngx.log(ngx.ERR, "本地缓存查询失败，尝试查询Redis， key: ", key)
        -- 查询redis
        val = read_redis("127.0.0.1", 6379, key)
        -- 判断查询结果
        if not val then
            ngx.log(ngx.ERR, "redis查询失败，尝试查询http， key: ", key)
            -- redis查询失败，去查询http
            val = read_http(path, params)
        end
    end
    -- 查询成功，把数据写入本地缓存
    item_cache:set(key, val, expire)
    -- 返回数据
    return val
end

-- 获取路径参数
local id = ngx.var[1]

-- 查询商品信息
local itemJSON = read_data("item:id:" .. id, 1800,  "/item/" .. id, nil)
-- 查询库存信息
local stockJSON = read_data("item:stock:id:" .. id, 60, "/item/stock/" .. id, nil)

-- JSON转化为lua的table
local item = cjson.decode(itemJSON)
local stock = cjson.decode(stockJSON)
-- 组合数据
item.stock = stock.stock
item.sold = stock.sold

-- 把item序列化为json 返回结果
ngx.say(cjson.encode(item))
```

## 缓存同步

大多数情况下，浏览器查询到的都是缓存数据，如果缓存数据与数据库数据存在较大差异，可能会产生比较严重的后果。

所以我们必须保证数据库数据、缓存数据的一致性，这就是缓存与数据库的同步

### 数据同步策略

缓存数据同步的常见方式有三种：

**设置有效期**：给缓存设置有效期，到期后自动删除。再次查询时更新

- 优势：简单、方便
- 缺点：时效性差，缓存过期之前可能不一致
- 场景：更新频率较低，时效性要求低的业务

**同步双写**：在修改数据库的同时，直接修改缓存

- 优势：时效性强，缓存与数据库强一致
- 缺点：有代码侵入，耦合度高；
- 场景：对一致性、时效性要求较高的缓存数据

**异步通知：**修改数据库时发送事件通知，相关服务监听到通知后修改缓存数据

- 优势：低耦合，可以同时通知多个缓存服务
- 缺点：时效性一般，可能存在中间不一致状态
- 场景：时效性要求一般，有多个服务需要同步

而异步实现又可以基于MQ或者Canal来实现：

1）基于MQ的异步通知：

![image-20221031172715602](http://minio.botuer.com/study-node/old/image-20221031172715602.png)

2）基于Canal的通知

![image-20221031172808527](http://minio.botuer.com/study-node/old/image-20221031172808527.png)

解读：

- 商品服务完成商品修改后，业务直接结束，**没有任何代码侵入**
- Canal监听MySQL变化，当发现变化后，立即通知缓存服务
- 缓存服务接收到canal通知，更新缓存

**Canal [kə'næl]**，译意为水道/管道/沟渠，canal是阿里巴巴旗下的一款开源项目，基于Java开发。基于数据库增量日志解析，提供增量数据订阅&消费。GitHub的地址：https://github.com/alibaba/canal

Canal是基于mysql的主从同步来实现的，**MySQL主从同步的原理**如下

- MySQL master 将数据变更写入二进制日志( binary log），其中记录的数据叫做binary log events
- MySQL slave 将 master 的 binary log events拷贝到它的中继日志(relay log)
- MySQL slave 重放 relay log 中事件，将数据变更反映它自己的数据



![image-20221031174641657](http://minio.botuer.com/study-node/old/image-20221031174641657.png)

而Canal就是把自己伪装成MySQL的一个slave节点，从而监听master的binary log变化。再把得到的变化信息通知给Canal的客户端，进而完成对其它数据库的同步

![image-20221031174747953](http://minio.botuer.com/study-node/old/image-20221031174747953.png)

### 监听Canal

- Canal提供了各种语言的客户端，当Canal监听到binlog变化时，会通知Canal的客户端
- 我们可以利用Canal提供的Java客户端，监听Canal通知消息。当收到变化的消息时，完成对缓存的更新

- 使用GitHub上的第三方开源的canal-starter客户端。地址：https://github.com/NormanGyllenhaal/canal-client，与SpringBoot完美整合，自动装配，比官方客户端要简单好用很多

- 依赖

  ```xml
  <dependency>
      <groupId>top.javatool</groupId>
      <artifactId>canal-spring-boot-starter</artifactId>
      <version>1.2.1-RELEASE</version>
  </dependency>
  ```

- 配置

  ```yml
  canal:
    destination: heima ## canal的集群名字，要与安装canal时设置的名称一致
    server: 192.168.150.101:11111 ## canal服务地址
  ```

- 实体类 - 通过@Id、@Column、等注解完成Item与数据库表字段的映射

  ```java
  @Data
  @TableName("tb_item")
  public class Item {
      @TableId(type = IdType.AUTO)
      @Id
      private Long id;//商品id
      @Column(name = "name")
      private String name;//商品名称
      private String title;//商品标题
      private Long price;//价格（分）
      private String image;//商品图片
      private String category;//分类名称
      private String brand;//品牌名称
      private String spec;//规格
      private Integer status;//商品状态 1-正常，2-下架
      private Date createTime;//创建时间
      private Date updateTime;//更新时间
      @TableField(exist = false)
      @Transient
      private Integer stock;
      @TableField(exist = false)
      @Transient
      private Integer sold;
  }
  ```

- #### 编写监听器

  通过实现`EntryHandler<T>`接口编写监听器，监听Canal消息。注意两点：

  - 实现类通过`@CanalTable("tb_item")`指定监听的表信息
  - EntryHandler的泛型是与表对应的实体类

  ```java
  package com.heima.item.canal;
  
  import com.github.benmanes.caffeine.cache.Cache;
  import com.heima.item.config.RedisHandler;
  import com.heima.item.pojo.Item;
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.stereotype.Component;
  import top.javatool.canal.client.annotation.CanalTable;
  import top.javatool.canal.client.handler.EntryHandler;
  
  @CanalTable("tb_item")
  @Component
  public class ItemHandler implements EntryHandler<Item> {
  
      @Autowired
      private RedisHandler redisHandler;
      @Autowired
      private Cache<Long, Item> itemCache;
  
      @Override
      public void insert(Item item) {
          // 写数据到JVM进程缓存
          itemCache.put(item.getId(), item);
          // 写数据到redis
          redisHandler.saveItem(item);
      }
  
      @Override
      public void update(Item before, Item after) {
          // 写数据到JVM进程缓存
          itemCache.put(after.getId(), after);
          // 写数据到redis
          redisHandler.saveItem(after);
      }
  
      @Override
      public void delete(Item item) {
          // 删除数据到JVM进程缓存
          itemCache.invalidate(item.getId());
          // 删除数据到redis
          redisHandler.deleteItemById(item.getId());
      }
  }
  ```

  

  在这里对Redis的操作都封装到了RedisHandler这个对象中，是我们之前做缓存预热时编写的一个类，内容如下：

  ```java
  package com.heima.item.config;
  
  import com.fasterxml.jackson.core.JsonProcessingException;
  import com.fasterxml.jackson.databind.ObjectMapper;
  import com.heima.item.pojo.Item;
  import com.heima.item.pojo.ItemStock;
  import com.heima.item.service.IItemService;
  import com.heima.item.service.IItemStockService;
  import org.springframework.beans.factory.InitializingBean;
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.data.redis.core.StringRedisTemplate;
  import org.springframework.stereotype.Component;
  
  import java.util.List;
  
  @Component
  public class RedisHandler implements InitializingBean {
  
      @Autowired
      private StringRedisTemplate redisTemplate;
  
      @Autowired
      private IItemService itemService;
      @Autowired
      private IItemStockService stockService;
  
      private static final ObjectMapper MAPPER = new ObjectMapper();
  
      @Override
      public void afterPropertiesSet() throws Exception {
          // 初始化缓存
          // 1.查询商品信息
          List<Item> itemList = itemService.list();
          // 2.放入缓存
          for (Item item : itemList) {
              // 2.1.item序列化为JSON
              String json = MAPPER.writeValueAsString(item);
              // 2.2.存入redis
              redisTemplate.opsForValue().set("item:id:" + item.getId(), json);
          }
  
          // 3.查询商品库存信息
          List<ItemStock> stockList = stockService.list();
          // 4.放入缓存
          for (ItemStock stock : stockList) {
              // 2.1.item序列化为JSON
              String json = MAPPER.writeValueAsString(stock);
              // 2.2.存入redis
              redisTemplate.opsForValue().set("item:stock:id:" + stock.getId(), json);
          }
      }
  
      public void saveItem(Item item) {
          try {
              String json = MAPPER.writeValueAsString(item);
              redisTemplate.opsForValue().set("item:id:" + item.getId(), json);
          } catch (JsonProcessingException e) {
              throw new RuntimeException(e);
          }
      }
  
      public void deleteItemById(Long id) {
          redisTemplate.delete("item:id:" + id);
      }
  }
  ```


## 原理

### 数据结构

#### 动态字符串（SDS）

Redis中保存的Key是字符串，value往往是字符串或者字符串的集合

不过Redis没有直接使用C语言中的字符串，因为C语言字符串存在很多问题：

- 获取字符串长度的需要通过运算
- 非二进制安全
- 不可修改

Redis构建了一种新的字符串结构，称为简单动态字符串（Simple Dynamic String），简称SDS。

> 如：set name 虎哥
>
> Redis将在底层创建两个SDS，其中一个是包含“name”的SDS，另一个是包含“虎哥”的SDS

**结构体**

```h
struct __attribute__ ((__packed__)) sdshdr8 {
    uint8_t len;	// buf数组中已使用字节的数量,也就是已用字符串的长度，不包括结束标识
    uint8_t alloc;	// buf数组中申请的字节数量，，不包括结束标识
    unsigned char flags;	// 不同的SDS头类型，用来控制SDS头大小
    char buf[];	// 字符数组，用于保存字符串
};

#define SDS_TYPE_5  0
#define SDS_TYPE_8  1
#define SDS_TYPE_16 2
#define SDS_TYPE_32 3
#define SDS_TYPE_64 4
```

> 如：name
>
> <img src="http://minio.botuer.com/study-node/old/image-20221114220109347.png" alt="image-20221114220109347" style="zoom: 67%;" />

**动态扩容**

- 假如我们要给SDS追加一段字符串“,Amy”，这里首先会申请新内存空间
- 如果**新串小于1M**，则新空间为**新串长度的两倍+1**，1是结束标识
- 如果新字符串大于1M，则新空间**新串长度+1M+1**。称为内存预分配

**优点**

- 获取字符串长度的时间复杂度为O(1)
- 支持动态扩容
- 减少内存分配次数
- 二进制安全

**sdsnew函数：创建一个包含给定字符串的SDS**

```c
sds sdsnew(const char *init) {
    // 如果输入为 NULL ，那么创建一个空白 sds,否则，新创建的 sds 中包含和 init 内容相同字符串
    size_t initlen = (init == NULL) ? 0 : strlen(init);		// sds长度
    return sdsnewlen(init, initlen);
}

/*
 * 根据给定的初始化字符串 init 和字符串长度 initlen
 *  init ：初始化字符串指针
 *  initlen ：初始化字符串的长度
 */
sds sdsnewlen(const void *init, size_t initlen) {

    struct sdshdr *sh;

    // 根据是否有初始化内容，选择适当的内存分配方式
    if (init) {
        // zmalloc 不初始化所分配的内存
        sh = zmalloc(sizeof(struct sdshdr) + initlen + 1);
    }
    else {
        // 输入为 NULL，zcalloc 将分配的内存全部初始化为 0
        sh = zcalloc(sizeof(struct sdshdr) + initlen + 1);
    }

    if (sh == NULL) return NULL;	// 内存分配失败，返回 
    sh->len = initlen;		// 设置初始化长度   
    sh->free = 0;		 // 新 sds 不预留任何空间
    if (initlen && init)		// 如果有指定初始化内容，将它们复制到 sdshdr 的 buf 中
        memcpy(sh->buf, init, initlen);
    sh->buf[initlen] = '\0';	 // 以 \0 结尾
    // 返回 buf 部分，而不是整个 sdshdr，因为sds是char指针类型的别名
    return (char*)sh->buf;
}
```

**sdsfree函数：释放给定的SDS**

- zfree函数为内存管理模块中的函数，可以释放指定的空间
- SDS的buf数组是柔性数组，也就是这个数组是不占据内存大小的，所以`sizeof(struct sdshdr)`为8

```c
void sdsfree(sds s) {
    if (s == NULL) return;
    zfree(s - sizeof(struct sdshdr));
}
```

**sdscat函数：将给定的C字符串拼接到SDS字符串的末尾**

```c
// 将给定字符串 t 追加到 sds 的末尾
sds sdscat(sds s, const char *t) {
    return sdscatlen(s, t, strlen(t));
}

// 将长度为 len 的字符串 t 追加到 sds 的字符串末尾
sds sdscatlen(sds s, const void *t, size_t len) {

    struct sdshdr *sh;
    size_t curlen = sdslen(s);	// 原有字符串长度
    s = sdsMakeRoomFor(s, len);	// 扩展 sds 空间
    if (s == NULL) return NULL;	// 内存不足？直接返回
    sh = (void*)(s - (sizeof(struct sdshdr)));	// 复制 t 中的内容到字符串后部
    memcpy(s + curlen, t, len);
    sh->len = curlen + len;		// 更新属性
    sh->free = sh->free - len;
    s[curlen + len] = '\0';		// 添加新结尾符号
    return s;
    
}
```

**sdsMakeRoomFor函数：扩容**

```c
sds sdsMakeRoomFor(sds s, size_t addlen) {

    struct sdshdr *sh, *newsh;

    size_t free = sdsavail(s);		// 获取 s 目前的空余空间长度
    size_t len, newlen; 
    if (free >= addlen) return s;	// s 目前的空余空间已经足够，无须再进行扩展，直接返回 
    len = sdslen(s);				// 获取 s 目前已占用空间的长度
    sh = (void*)(s - (sizeof(struct sdshdr)));
    newlen = (len + addlen);		 // s 最少需要的长度

    if (newlen < SDS_MAX_PREALLOC)	 // SDS_MAX_PREALLOC 最大预先分配长度 默认1M
        newlen *= 2;					// 新串长度的两倍+1
    else
        newlen += SDS_MAX_PREALLOC;		// 新串长度+SDS_MAX_PREALLOC+1
    
    newsh = zrealloc(sh, sizeof(struct sdshdr) + newlen + 1);
    
    if (newsh == NULL) return NULL;	 	// 内存不足，分配失败，返回
    newsh->free = newlen - len;		// 更新 sds 的空余长度
    return newsh->buf;
}
```

#### intset

IntSet是Redis中set集合的一种实现方式，基于整数数组来实现，并且具备长度可变、有序等特征。

**结构体**

```h
typedef struct intset {
    uint32_t encoding; /* 编码方式，支持存放16位、32位、64位整数*/
    uint32_t length; /* 元素个数 */
    int8_t contents[]; /* 整数数组，保存集合数据*/
} intset;

#define INTSET_ENC_INT16 (sizeof(int16_t)) /* 2字节整数，范围类似java的short*/
#define INTSET_ENC_INT32 (sizeof(int32_t)) /* 4字节整数，范围类似java的int */
#define INTSET_ENC_INT64 (sizeof(int64_t)) /* 8字节整数，范围类似java的long */
```

**插入流程**

为了方便查找，Redis会将intset中所有的整数按照升序依次保存在contents数组中，结构如图

![image-20221114225056010](http://minio.botuer.com/study-node/old/image-20221114225056010.png)

- 现在，数组中每个数字都在int16_t的范围内，因此采用的编码方式是INTSET_ENC_INT16，每部分占用的字节大小为
  - encoding：4字节
  - length：4字节
  - contents：2字节 * 3  = 6字节
- 我们向该其中添加一个数字：50000，这个数字超出了int16_t的范围，intset会自动升级编码方式到合适的大小
  - 升级编码为INTSET_ENC_INT32, 每个整数占4字节，并按照新的编码方式及元素个数扩容数组
  - **倒序依次**将数组中的元素**拷贝**到扩容后的正确位置（**倒序防止覆盖**）
  - 将待添加的元素放入数组末尾
  - 最后，将inset的encoding属性改为INTSET_ENC_INT32，将length属性改为4

**特点**：Intset可以看做是特殊的整数数组

* Redis会确保Intset中的元素唯一、有序
* 具备类型升级机制，可以节省内存空间
* 底层采用二分查找方式来查询

***intsetAdd函数：新增整数**

```c
intset *intsetAdd(intset *is, int64_t value, uint8_t *success) {
    uint8_t valenc = _intsetValueEncoding(value);// 获取当前值编码
    uint32_t pos; // 要插入的位置
    if (success) *success = 1;
    // 判断编码是不是超过了当前intset的编码
    if (valenc > intrev32ifbe(is->encoding)) {
        // 超出编码，需要升级
        return intsetUpgradeAndAdd(is,value);
    } else {
        // 在当前intset中查找值与value一样的元素的角标pos
        if (intsetSearch(is,value,&pos)) {
            if (success) *success = 0; //如果找到了，则无需插入，直接结束并返回失败
            return is;
        }
        // 数组扩容
        is = intsetResize(is,intrev32ifbe(is->length)+1);
        // 移动数组中pos之后的元素到pos+1，给新元素腾出空间
        if (pos < intrev32ifbe(is->length)) intsetMoveTail(is,pos,pos+1);
    }
    // 插入新元素
    _intsetSet(is,pos,value);
    // 重置元素长度
    is->length = intrev32ifbe(intrev32ifbe(is->length)+1);
    return is;
}
```

***intsetUpgradeAndAdd函数：升级编码方式**

```c
static intset *intsetUpgradeAndAdd(intset *is, int64_t value) {
    // 获取当前intset编码
    uint8_t curenc = intrev32ifbe(is->encoding);
    // 获取新编码
    uint8_t newenc = _intsetValueEncoding(value);
    // 获取元素个数
    int length = intrev32ifbe(is->length); 
    // 判断新元素是大于0还是小于0 ，小于0插入队首、大于0插入队尾
    int prepend = value < 0 ? 1 : 0;
    // 重置编码为新编码
    is->encoding = intrev32ifbe(newenc);
    // 重置数组大小
    is = intsetResize(is,intrev32ifbe(is->length)+1);
    // 倒序遍历，逐个搬运元素到新的位置，_intsetGetEncoded按照旧编码方式查找旧元素
    while(length--) // _intsetSet按照新编码方式插入新元素
        _intsetSet(is,length+prepend,_intsetGetEncoded(is,length,curenc));
    /* 插入新元素，prepend决定是队首还是队尾*/
    if (prepend)
        _intsetSet(is,0,value);
    else
        _intsetSet(is,intrev32ifbe(is->length),value);
    // 修改数组长度
    is->length = intrev32ifbe(intrev32ifbe(is->length)+1);
    return is;
}
```

#### Dict

Redis是一个键值型（Key-Value Pair）的数据库，我们可以根据键实现快速的增删改查

键与值的映射关系正是通过Dict来实现的

Dict由三部分组成，分别是：哈希表（DictHashTable）、哈希节点（DictEntry）、字典（Dict）

**结构体**

```h
// 字典（Dict）
typedef struct dict {
    dictType *type; // dict类型，内置不同的hash函数
    void *privdata;     // 私有数据，在做特殊hash运算时用
    dictht ht[2]; // 一个Dict包含两个哈希表，其中一个是当前数据，另一个一般是空，rehash时使用
    long rehashidx;   // rehash的进度，-1表示未进行
    int16_t pauserehash; // rehash是否暂停，1则暂停，0则继续
} dict;
```

```h
// DictHashTable哈希表
typedef struct dictht {
    // entry数组
    // 数组中保存的是指向entry的指针
    dictEntry **table; 
    // 哈希表大小
    unsigned long size;     
    // 哈希表大小的掩码，总等于size - 1
    unsigned long sizemask;     
    // entry个数
    unsigned long used; 
} dictht;
```

```h
// 哈希节点（DictEntry）
typedef struct dictEntry {
    void *key; // 键
    union {
        void *val;
        uint64_t u64;
        int64_t s64;
        double d;
    } v; // 值
    // 下一个Entry的指针
    struct dictEntry *next; 
} dictEntry;
```

**内存结构**

当我们向Dict添加键值对时，Redis首先根据key计算出hash值（h），然后利用 h & sizemask来计算元素应该存储到数组中的哪个索引位置。我们存储k1=v1，假设k1的哈希值h =1，则1&3 =1，因此k1=v1要存储到数组角标1位置。

![image-20221114230541343](http://minio.botuer.com/study-node/old/image-20221114230541343.png)

**Dict的扩容**

哈希冲突增多，链表过长，则查询效率会大大降低，需要扩容

Dict在每次新增键值对时都会检查负载因子（LoadFactor = used/size） ，满足以下两种情况时会触发哈希表扩容：

- 哈希表的 LoadFactor >= 1，并且服务器没有执行 BGSAVE 或者 BGREWRITEAOF 等后台进程；
- 哈希表的 LoadFactor > 5 ；

 扩容大小为used + 1，底层会对扩容大小做判断，实际上找的是**第一个大于等于 used+1 的 2^n**

```c
static int _dictExpandIfNeeded(dict *d){
    // 如果正在rehash，则返回ok
    if (dictIsRehashing(d)) return DICT_OK;    // 如果哈希表为空，则初始化哈希表为默认大小：4
    if (d->ht[0].size == 0) return dictExpand(d, DICT_HT_INITIAL_SIZE);
    // 当负载因子（used/size）达到1以上，并且当前没有进行bgrewrite等子进程操作
    // 或者负载因子超过5，则进行 dictExpand ，也就是扩容
    if (d->ht[0].used >= d->ht[0].size &&
        (dict_can_resize || d->ht[0].used/d->ht[0].size > dict_force_resize_ratio){
        // 扩容大小为used + 1，底层会对扩容大小做判断，实际上找的是第一个大于等于 used+1 的 2^n
        return dictExpand(d, d->ht[0].used + 1);
    }
    return DICT_OK;
}
```

**Dict的收缩**

当LoadFactor < 0.1 时，会做哈希表收缩

第一个大于等于minimal的2^n

```c
// t_hash.c ## hashTypeDeleted() 
...
if (dictDelete((dict*)o->ptr, field) == C_OK) {
    deleted = 1;
    // 删除成功后，检查是否需要重置Dict大小，如果需要则调用dictResize重置    /* Always check if the dictionary needs a resize after a delete. */
    if (htNeedsResize(o->ptr)) dictResize(o->ptr);
}
...
```

```c
// server.c 文件
int htNeedsResize(dict *dict) {
    long long size, used;
    // 哈希表大小
    size = dictSlots(dict);
    // entry数量
    used = dictSize(dict);
    // size > 4（哈希表初识大小）并且 负载因子低于0.1
    return (size > DICT_HT_INITIAL_SIZE && (used*100/size < HASHTABLE_MIN_FILL));
}
```

```c
int dictResize(dict *d){
    unsigned long minimal;
    // 如果正在做bgsave或bgrewriteof或rehash，则返回错误
    if (!dict_can_resize || dictIsRehashing(d)) 
        return DICT_ERR;
    // 获取used，也就是entry个数
    minimal = d->ht[0].used;
    // 如果used小于4，则重置为4
    if (minimal < DICT_HT_INITIAL_SIZE)
        minimal = DICT_HT_INITIAL_SIZE;
    // 重置大小为minimal，其实是第一个大于等于minimal的2^n
    return dictExpand(d, minimal);
}
```

**Dict的rehash**

![image-20221114232156581](http://minio.botuer.com/study-node/old/image-20221114232156581.png)

不管是扩容还是收缩，必定会创建新的哈希表，导致哈希表的size和sizemask变化，而key的查询与sizemask有关。因此必须对哈希表中的每一个key重新计算索引，插入新的哈希表，这个过程称为rehash。过程是这样的：

* 计算新hash表的realeSize，值取决于当前要做的是扩容还是收缩：
  * 如果是扩容，则新size为第一个大于等于dict.ht[0].used + 1的2^n
  * 如果是收缩，则新size为第一个大于等于dict.ht[0].used的2^n （不得小于4）
* 按照新的realeSize申请内存空间，创建dictht，并赋值给dict.ht[1]
* 设置dict.rehashidx = 0，标示开始rehash
* ~~将dict.ht[0]中的每一个dictEntry都rehash到dict.ht[1]~~（**一次性rehash太耗时**）
* **每次执行新增、查询、修改、删除操作时，都检查一下dict.rehashidx是否大于-1**
  * **如果是，则将dict.ht[0].table[rehashidx]的entry链表rehash到dict.ht[1]，并且将rehashidx++**
  * **直至dict.ht[0]的所有数据都rehash到dict.ht[1]**
* 将dict.ht[1]赋值给dict.ht[0]，给dict.ht[1]初始化为空哈希表，释放原来的dict.ht[0]的内存
* **将rehashidx赋值为-1，代表rehash结束**

> **新增操作，则直接写入ht[1]**
>
> **查询、修改和删除则会在dict.ht[0]和dict.ht[1]依次查找并执行**
>
> **这样可以确保ht[0]的数据只减不增，随着rehash最终为空**

#### ZipList

ZipList 是一种特殊的“双端链表”（**不是链表**） ，由一系列特殊编码的连续内存块组成。可以在任意一端进行压入/弹出操作, 并且该操作的时间复杂度为 O(1)

![image-20221114232412897](http://minio.botuer.com/study-node/old/image-20221114232412897.png)

| **属性** | **类型** | **长度** | **用途**                                                     |
| :------: | :------: | :------: | :----------------------------------------------------------- |
| zlbytes  | uint32_t |    4     | 记录整个压缩列表占用的内存字节数                             |
|  zltail  | uint32_t |    4     | 记录压缩列表表尾节点距离压缩列表的起始地址有多少字节，通过这个偏移量，可以确定表尾节点的地址 |
|  zllen   | uint16_t |    2     | 记录了压缩列表包含的节点数量。 最大值为UINT16_MAX （65534），如果超过这个值，此处会记录为65535，但节点的真实数量需要遍历整个压缩列表才能计算得出 |
|  entry   | 列表节点 |   不定   | 压缩列表包含的各个节点，节点的长度由节点保存的内容决定       |
|  zlend   | uint8_t  |    1     | 特殊值 0xFF （十进制 255 ），用于标记压缩列表的末端          |

**ZipListEntry**

ZipList 中的Entry并不像普通链表那样记录前后节点的指针，因为记录两个指针要占用16个字节，浪费内存。而是采用了下面的结构：

![image-20221114232644624](http://minio.botuer.com/study-node/old/image-20221114232644624.png)

* previous_entry_length：前一节点的长度，占1个或5个字节。
  * 如果前一节点的长度小于254字节，则采用1个字节来保存这个长度值
  * 如果前一节点的长度大于254字节，则采用5个字节来保存这个长度值，第一个字节为0xfe，后四个字节才是真实长度数据

* encoding：编码属性，记录content的数据类型（字符串还是整数）以及长度，占用1个、2个或5个字节
* contents：负责保存节点的数据，可以是字符串或整数

ZipList中所有存储长度的数值均采用**小端字节序，即低位字节在前，高位字节在后**。例如：数值0x1234，采用小端字节序后实际存储值为：0x3412

**Encoding编码**

ZipListEntry中的encoding编码分为字符串和整数两种：
*字符串*：如果encoding是以“00”、“01”或者“10”开头，则证明content是字符串

*整数*：如果encoding是以“11”开始，则证明content是整数，且encoding固定只占用1个字节

| **编码**                                             | **编码长度** | **字符串大小**      |
| ---------------------------------------------------- | ------------ | ------------------- |
| \|00pppppp\|                                         | 1 bytes      | `<= 63 bytes         |
| \|01pppppp\|qqqqqqqq\|                               | 2 bytes      | <= 16383 bytes      |
| \|10000000\|qqqqqqqq\|rrrrrrrr\|ssssssss\|tttttttt\| | 5 bytes      | <= 4294967295 bytes |

| **编码** | **编码长度** | **整数类型**                                                 |
| -------- | ------------ | ------------------------------------------------------------ |
| 11000000 | 1            | int16_t（2 bytes）                                           |
| 11010000 | 1            | int32_t（4 bytes）                                           |
| 11100000 | 1            | int64_t（8 bytes）                                           |
| 11110000 | 1            | 24位有符整数(3 bytes)                                        |
| 11111110 | 1            | 8位有符整数(1 bytes)                                         |
| 1111xxxx | 1            | **直接在xxxx位置保存数值**，范围从0001~1101（0~12），减1后结果为实际值 |

例如，我们要保存字符串：“ab”和 “bc”

![image-20221114232750853](http://minio.botuer.com/study-node/old/image-20221114232750853.png)

例如，一个ZipList中包含两个整数值：“2”和“5”，**0~12直接保存在encoding位置**

<img src="http://minio.botuer.com/study-node/old/image-20221114233547296.png" alt="image-20221114233547296" style="zoom: 80%;" />`



**连锁更新问题**

ZipList的每个Entry都包含previous_entry_length来记录上一个节点的大小，长度是1个或5个字节：

- 如果前一节点的长度小于254字节，则采用1个字节来保存这个长度值
- 如果前一节点的长度大于等于254字节，则采用5个字节来保存这个长度值，第一个字节为0xfe，后四个字节才是真实长度数据

现在，假设我们有N个连续的、长度为250~253字节之间的entry，因此entry的previous_entry_length属性用1个字节即可表示，如图所示：

![image-20221114234048388](http://minio.botuer.com/study-node/old/image-20221114234048388.png)

ZipList这种特殊情况下产生的连续多次空间扩展操作称之为连锁更新（Cascade Update）。新增、删除都可能导致连锁更新的发生

**特点**

- 压缩列表的可以看做一种连续内存空间的"双向链表"
- 列表的节点之间不是通过指针连接，而是记录上一节点和本节点长度来寻址，内存占用较低
- 如果列表数据过多，导致链表过长，可能影响查询性能
- 增或删较大数据时有可能发生连续更新问题

#### QuickList

问题1：ZipList虽然节省内存，但申请内存必须是**连续空间**，如果内存占用较多，申请内存效率很低。怎么办？

​	答：为了缓解这个问题，我们**必须限制ZipList的长度和entry大小**。

问题2：但是我们要存储大量数据，超出了ZipList最佳的上限该怎么办？

​	答：我们可以创建多个ZipList来分片存储数据。

问题3：数据拆分后比较分散，不方便管理和查找，这多个ZipList如何建立联系？

​	答：Redis在3.2版本引入了新的数据结构QuickList，它是一个双端链表，只不过链表中的每个节点都是一个ZipList，即**QuickList = 链表 + ZipList**

![image-20221114234358677](http://minio.botuer.com/study-node/old/image-20221114234358677.png)

为了避免QuickList中的每个ZipList中entry过多，Redis提供了一个配置项：list-max-ziplist-size来限制。
如果值为正，则代表ZipList的允许的entry个数的最大值
如果值为负，则代表ZipList的最大内存大小，分5种情况：

* -1：每个ZipList的内存占用不能超过4kb
* -2：每个ZipList的内存占用不能超过8kb（**默认**）
* -3：每个ZipList的内存占用不能超过16kb
* -4：每个ZipList的内存占用不能超过32kb
* -5：每个ZipList的内存占用不能超过64kb

```sh
config get list-max-ziplist-size
1) "list-max-ziplist-size"
2) "-2"
```

除了控制ZipList的大小，QuickList还可以对节点的ZipList做压缩。通过配置项list-compress-depth来控制。因为链表一般都是从首尾访问较多，所以首尾是不压缩的。这个参数是控制首尾不压缩的节点个数：

- 0：特殊值，代表不压缩（**默认**）

- 1：标示QuickList的首尾各有1个节点不压缩，中间节点压缩

- 2：标示QuickList的首尾各有2个节点不压缩，中间节点压缩

- …

```sh
config get list-compress-depth
1) "list-compress-depth"
2) "0"
```

**结构体**

```h
typedef struct quicklist {
    // 头节点指针
    quicklistNode *head; 
    // 尾节点指针
    quicklistNode *tail; 
    // 所有ziplist的entry的数量
    unsigned long count;    
    // ziplists总数量
    unsigned long len;
    // ziplist的entry上限，默认值 -2 
    int fill : QL_FILL_BITS;         // 首尾不压缩的节点数量
    unsigned int compress : QL_COMP_BITS;
    // 内存重分配时的书签数量及数组，一般用不到
    unsigned int bookmark_count: QL_BM_BITS;
    quicklistBookmark bookmarks[];
} quicklist;
```

```h
typedef struct quicklistNode {
    // 前一个节点指针
    struct quicklistNode *prev;
    // 下一个节点指针
    struct quicklistNode *next;
    // 当前节点的ZipList指针
    unsigned char *zl;
    // 当前节点的ZipList的字节大小
    unsigned int sz;
    // 当前节点的ZipList的entry个数
    unsigned int count : 16;  
    // 编码方式：1，ZipList; 2，lzf压缩模式
    unsigned int encoding : 2;
    // 数据容器类型（预留）：1，其它；2，ZipList
    unsigned int container : 2;
    // 是否被解压缩。1：则说明被解压了，将来要重新压缩
    unsigned int recompress : 1;
    unsigned int attempted_compress : 1; //测试用
    unsigned int extra : 10; /*预留字段*/
} quicklistNode;
```

![image-20221114234958537](http://minio.botuer.com/study-node/old/image-20221114234958537.png)

**特点**

- 是一个节点为ZipList的双端链表
- 节点采用ZipList，解决了传统链表的内存占用问题
- 控制了ZipList大小，解决连续内存空间申请效率问题
- 中间节点可以压缩，进一步节省了内存

#### SkipList

SkipList（跳表）首先是链表，但与传统链表相比有几点差异：

- 元素按照**升序**排列存储
- 节点可能包含**多个指针**，指针跨度不同

![image-20221114235119264](http://minio.botuer.com/study-node/old/image-20221114235119264.png)

**结构体**

```h
// t_zset.c
typedef struct zskiplist {
    // 头尾节点指针
    struct zskiplistNode *header, *tail;
    // 节点数量
    unsigned long length;
    // 最大的索引层级，默认是1
    int level;
} zskiplist;
```

```h
// t_zset.c
typedef struct zskiplistNode {
    sds ele; // 节点存储的值
    double score;// 节点分数，排序、查找用
    struct zskiplistNode *backward; // 前一个节点指针
    struct zskiplistLevel {
        struct zskiplistNode *forward; // 下一个节点指针
        unsigned long span; // 索引跨度
    } level[]; // 多级索引数组
} zskiplistNode;
```

**链表**

![image-20221114235324979](http://minio.botuer.com/study-node/old/image-20221114235324979.png)

**跳表**

![image-20221114235439422](http://minio.botuer.com/study-node/old/image-20221114235439422.png)

**特点**

- 跳跃表是一个双向链表，每个节点都包含score和ele值
- 节点按照score值排序，score值一样则按照ele字典排序
- 每个节点都可以包含多层指针，层数是1到32之间的随机数
- 不同层指针到下一个节点的跨度不同，层级越高，跨度越大
- 增删改查效率与红黑树基本一致，实现却更简单

#### RedisObject

Redis中的任意数据类型的键和值都会被封装为一个RedisObject，也叫做Redis对象，源码如下：

![image-20221114235633983](http://minio.botuer.com/study-node/old/image-20221114235633983.png)

> redisObject -- robj
>
> - 从Redis的使用者的角度来看，⼀个Redis节点包含多个database（非cluster模式下默认是16个，cluster模式下只能是1个），而一个database维护了从key space到object space的映射关系。这个映射关系的key是string类型，⽽value可以是多种数据类型，比如：string, list, hash、set、sorted set等。我们可以看到，key的类型固定是string，而value可能的类型是多个
> - 从Redis内部实现的⾓度来看，database内的这个映射关系是用⼀个dict来维护的。dict的key固定用⼀种数据结构来表达就够了，这就是动态字符串sds。而value则比较复杂，为了在同⼀个dict内能够存储不同类型的value，这就需要⼀个通⽤的数据结构，这个通用的数据结构就是robj，全名是redisObject

**Redis的编码方式**

Redis中会根据存储的数据类型不同，选择不同的编码方式，共包含11种不同类型：

| **编号** | **编码方式**            | **说明**               |
| -------- | ----------------------- | ---------------------- |
| 0        | OBJ_ENCODING_RAW        | raw编码动态字符串      |
| 1        | OBJ_ENCODING_INT        | long类型的整数的字符串 |
| 2        | OBJ_ENCODING_HT         | hash表（字典dict）     |
| 3        | OBJ_ENCODING_ZIPMAP     | 已废弃                 |
| 4        | OBJ_ENCODING_LINKEDLIST | 双端链表               |
| 5        | OBJ_ENCODING_ZIPLIST    | 压缩列表               |
| 6        | OBJ_ENCODING_INTSET     | 整数集合               |
| 7        | OBJ_ENCODING_SKIPLIST   | 跳表                   |
| 8        | OBJ_ENCODING_EMBSTR     | embstr的动态字符串     |
| 9        | OBJ_ENCODING_QUICKLIST  | 快速列表               |
| 10       | OBJ_ENCODING_STREAM     | Stream流               |

**五种数据结构**

Redis中会根据存储的数据类型不同，选择不同的编码方式。每种数据类型的使用的编码方式如下：

| **数据类型** | **编码方式**                                       |
| ------------ | -------------------------------------------------- |
| OBJ_STRING   | int、embstr、raw                                   |
| OBJ_LIST     | LinkedList和ZipList(3.2以前)、QuickList（3.2以后） |
| OBJ_SET      | intset、HT                                         |
| OBJ_ZSET     | ZipList、HT、SkipList                              |
| OBJ_HASH     | ZipList、HT                                        |

### 数据类型

#### String

**数据存储类型**：

- 其基本编码方式是**RAW**，基于简单动态字符串（**SDS**）实现，存储上限为**512mb**

- 如果存储的SDS长度*小于44字节*，则会采用**EMBSTR**编码，此时object head与SDS是一段**连续空间**。申请内存时只需要调用一次内存分配函数，效率更高
- 如果存储的字符串是整数值，并且*大小在LONG_MAX范围内*，则会采用**INT**编码：直接将数据保存在RedisObject的ptr**指针位置**（刚好8字节），**不再需要SDS了**

![image-20221115000924015](http://minio.botuer.com/study-node/old/image-20221115000924015.png)

确切地说，String在Redis中是⽤⼀个robj来表示的，用来表示String的robj可能编码成3种内部表⽰：

- OBJ_ENCODING_RAW --- （sds存储）
- OBJ_ENCODING_EMBSTR --- （sds存储）
- OBJ_ENCODING_INT --- （long类型存储在robj的指针位置）


在对string进行incr, decr等操作的时候

- 如果它内部是OBJ_ENCODING_INT编码，那么可以直接进行加减操作
- 如果它内部是OBJ_ENCODING_RAW或OBJ_ENCODING_EMBSTR编码，那么Redis会先试图把sds存储的字符串转成long型，如果能转成功，再进行加减操作

对⼀个内部表示成long型的string执行append, setbit, getrange这些命令

- 针对的仍然是string的值（即⼗进制表示的字符串）

- 而不是针对内部表⽰的long型进⾏操作

  > 比如字符串”32”
  >
  > - 如果按照字符数组来解释，它包含两个字符，它们的ASCII码分别是0x33和0x32。当我们执行命令setbit key 7 0的时候，相当于把字符0x33变成了0x32，这样字符串的值就变成了”22”
  > - 如果将字符串”32”按照内部的64位long型来解释，那么它是0x0000000000000020，在这个基础上执⾏setbit位操作，结果就完全不对了
  > - 因此，在这些命令的实现中，会把long型先转成字符串再进行相应的操作

#### List

可以首尾操作的数据结构

- LinkedList ：普通链表，可以从双端访问，内存占用较高，内存碎片较多
- ZipList ：压缩列表，可以从双端访问，内存占用低，存储上限低
- QuickList：LinkedList + ZipList，可以从双端访问，内存占用较低，包含多个ZipList，存储上限高

在3.2版本之后，Redis统一采用QuickList来实现List：

![image-20221115001742156](http://minio.botuer.com/study-node/old/image-20221115001742156.png)

#### Set

et是Redis中的单列集合，满足下列特点：

* 不保证有序性
* 保证元素唯一
* 求交集、并集、差集
* 对查询效率要求非常高

HashTable，也就是Redis中的Dict，不过Dict是双列集合（可以存键、值对）

- 为了查询效率和唯一性，set采用HT编码（Dict）
- Dict中的key用来存储元素，value统一为null
- 当存储的所有数据都是整数，并且元素数量不超过set-max-intset-entries时，Set会采用IntSet编码，以节省内存

**实现**

```c
robj *setTypeCreate(sds value) {
    // 判断value是否是数值类型 long long 
    if (isSdsRepresentableAsLongLong(value,NULL) == C_OK)
        // 如果是数值类型，则采用IntSet编码
        return createIntsetObject();
    // 否则采用默认编码，也就是HT
    return createSetObject();
}
```

```c
robj *createIntsetObject(void) {
    // 初始化INTSET并申请内存空间
    intset *is = intsetNew();
    // 创建RedisObject
    robj *o = createObject(OBJ_SET,is);
    // 指定编码为INTSET
    o->encoding = OBJ_ENCODING_INTSET;
    return o;
}
```

```c
robj *createSetObject(void) {
    // 初始化Dict类型，并申请内存
    dict *d = dictCreate(&setDictType,NULL);
    // 创建RedisObject
    robj *o = createObject(OBJ_SET,d);
    // 设置encoding为HT
    o->encoding = OBJ_ENCODING_HT;
    return o;
}
```

**IntSet转HT**

```c
int setTypeAdd(robj *subject, sds value) {
    long long llval;
    if (subject->encoding == OBJ_ENCODING_HT) {		// 已经是HT了，直接添加元素
        dict *ht = subject->ptr;
        dictEntry *de = dictAddRaw(ht,value,NULL);
        if (de) {
            dictSetKey(ht,de,sdsdup(value));
            dictSetVal(ht,de,NULL);
            return 1;
        }
    } else if (subject->encoding == OBJ_ENCODING_INTSET) {			// IntSet编码
        if (isSdsRepresentableAsLongLong(value,&llval) == C_OK) {	// 是否是整数
            uint8_t success = 0;	// 是整数直接添加元素
            subject->ptr = intsetAdd(subject->ptr,llval,&success);
            if (success) {
                /* 当 intset 元素超过set_max_intset_entries时，转换为HT */
                size_t max_entries = server.set_max_intset_entries;
                /* 由于intset的特性，限制max_entries为1G */
                if (max_entries >= 1<<30) max_entries = 1<<30;
                if (intsetLen(subject->ptr) > max_entries)
                    setTypeConvert(subject,OBJ_ENCODING_HT);
                return 1;
            }
        } else {		// 不是整数，直接转为HT
            /* Failed to get integer from object, convert to regular set. */
            setTypeConvert(subject,OBJ_ENCODING_HT);

            /* The set *was* an intset and this value is not integer
             * encodable, so dictAdd should always work. */
            serverAssert(dictAdd(subject->ptr,sdsdup(value),NULL) == DICT_OK);
            return 1;
        }
    } else {
        serverPanic("Unknown set encoding");
    }
    return 0;
}
```

<img src="http://minio.botuer.com/study-node/old/image-20221115003343329.png" alt="image-20221115003343329" style="zoom: 80%;" />

<img src="http://minio.botuer.com/study-node/old/image-20221115003439176.png" alt="image-20221115003439176" style="zoom:80%;" />

<img src="http://minio.botuer.com/study-node/old/image-20221115003505385.png" alt="image-20221115003505385" style="zoom:80%;" />

#### Zset

ZSet也就是SortedSet，其中每一个元素都需要指定一个score值和member值：

* 可以根据score值**排序**后
* member必须**唯一**
* 可以根据member查询分数
* **键值对**

数据结构

- SkipList：可以排序，并且可以同时存储score和ele值（member）
- HT（Dict）：可以键值存储，并且可以根据key找value
- **需要维护两个数据结构**

**结构体**

```h
// zset结构
typedef struct zset {
    // Dict指针
    dict *dict;
    // SkipList指针
    zskiplist *zsl;
} zset;
```

```c
robj *createZsetObject(void) {
    zset *zs = zmalloc(sizeof(*zs));
    robj *o;
    // 创建Dict
    zs->dict = dictCreate(&zsetDictType,NULL);
    // 创建SkipList
    zs->zsl = zslCreate(); 
    o = createObject(OBJ_ZSET,zs);
    o->encoding = OBJ_ENCODING_SKIPLIST;
    return o;
}
```

![image-20221115003844707](http://minio.botuer.com/study-node/old/image-20221115003844707.png)

当元素数量不多时，HT和SkipList的优势不明显，而且更耗内存。因此zset还会**采用ZipList结构来节省内存**，不过需要同时满足两个条件：

* 元素数量小于zset_max_ziplist_entries，默认值128
* 每个元素都小于zset_max_ziplist_value字节，默认值64

ziplist本身**没有排序功能**，而且没有键值对的概念，因此需要有zset通过**编码实现**：

* ZipList是连续内存，因此score和element是紧挨在一起的两个entry， element在前，score在后
* score越小越接近队首，score越大越接近队尾，按照score值升序排列

![image-20221115004312696](http://minio.botuer.com/study-node/old/image-20221115004312696.png)

```c
// zadd添加元素时，先根据key找到zset，不存在则创建新的zset
zobj = lookupKeyWrite(c->db,key);
if (checkType(c,zobj,OBJ_ZSET)) goto cleanup;
// 判断是否存在
if (zobj == NULL) { // zset不存在
    if (server.zset_max_ziplist_entries == 0 ||
        server.zset_max_ziplist_value < sdslen(c->argv[scoreidx+1]->ptr))
    { // zset_max_ziplist_entries设置为0就是禁用了ZipList，
        // 或者value大小超过了zset_max_ziplist_value，采用HT + SkipList
        zobj = createZsetObject();
    } else { // 否则，采用 ZipList
        zobj = createZsetZiplistObject();
    }
    dbAdd(c->db,key,zobj); 
}
// ....
zsetAdd(zobj, score, ele, flags, &retflags, &newscore);
```

```c
robj *createZsetObject(void) {
    // 申请内存
    zset *zs = zmalloc(sizeof(*zs));
    robj *o;
    // 创建Dict
    zs->dict = dictCreate(&zsetDictType,NULL);
    // 创建SkipList
    zs->zsl = zslCreate();
    o = createObject(OBJ_ZSET,zs);
    o->encoding = OBJ_ENCODING_SKIPLIST;
    return o;
}
```

```c
robj *createZsetZiplistObject(void) {
    // 创建ZipList
    unsigned char *zl = ziplistNew();
    robj *o = createObject(OBJ_ZSET,zl);
    o->encoding = OBJ_ENCODING_ZIPLIST;
    return o;
}
```

```c
int zsetAdd(robj *zobj, double score, sds ele, int in_flags, int *out_flags, double *newscore) {
    /* 判断编码方式*/
    if (zobj->encoding == OBJ_ENCODING_ZIPLIST) {// 是ZipList编码
        unsigned char *eptr;
        // 判断当前元素是否已经存在，已经存在则更新score即可        if ((eptr = zzlFind(zobj->ptr,ele,&curscore)) != NULL) {
            //...略
            return 1;
        } else if (!xx) {
            // 元素不存在，需要新增，则判断ziplist长度有没有超、元素的大小有没有超
            if (zzlLength(zobj->ptr)+1 > server.zset_max_ziplist_entries
 		|| sdslen(ele) > server.zset_max_ziplist_value 
 		|| !ziplistSafeToAdd(zobj->ptr, sdslen(ele)))
            { // 如果超出，则需要转为SkipList编码
                zsetConvert(zobj,OBJ_ENCODING_SKIPLIST);
            } else {
                zobj->ptr = zzlInsert(zobj->ptr,ele,score);
                if (newscore) *newscore = score;
                *out_flags |= ZADD_OUT_ADDED;
                return 1;
            }
        } else {
            *out_flags |= ZADD_OUT_NOP;
            return 1;
        }
    }    // 本身就是SKIPLIST编码，无需转换
    if (zobj->encoding == OBJ_ENCODING_SKIPLIST) {
       // ...略
    } else {
        serverPanic("Unknown sorted set encoding");
    }
    return 0; /* Never reached. */
}
```

#### Hash

Hash结构与Redis中的Zset非常类似：

* 都是键值存储
* 都需求根据键获取值
* 键必须唯一

区别如下：

* zset的键是member，值是score；hash的键和值都是任意值
* zset要根据score排序；hash则无需排序

**底层实现方式**：压缩列表ziplist 或者 字典dict

> 当ziplist变得很⼤的时候，它有如下几个缺点：
>
> * 每次插⼊或修改引发的realloc操作会有更⼤的概率造成内存拷贝，从而降低性能
> * ⼀旦发生内存拷贝，内存拷贝的成本也相应增加，因为要拷贝更⼤的⼀块数据
> * 当ziplist数据项过多的时候，在它上⾯查找指定的数据项就会性能变得很低，因为ziplist上的查找需要进行遍历
>
> 总之，ziplist本来就设计为各个数据项挨在⼀起组成连续的内存空间，这种结构并不擅长做修改操作。⼀旦数据发⽣改动，就会引发内存realloc，可能导致内存拷贝
>

Hash结构**默认采用ZipList编码，用以节省内存**。 ZipList中相邻的两个entry 分别保存field和value

当数据量较大时，Hash结构会**转为HT编码**，也就是Dict，触发条件有两个：

* ZipList中的元素数量超过了hash-max-ziplist-entries（默认512）
* ZipList中的任意entry大小超过了hash-max-ziplist-value（默认64字节）

![image-20221115004806563](http://minio.botuer.com/study-node/old/image-20221115004806563.png)

![image-20221115004835777](http://minio.botuer.com/study-node/old/image-20221115004835777.png)

![image-20221115004906391](http://minio.botuer.com/study-node/old/image-20221115004906391.png)

```c
void hsetCommand(client *c) {// hset user1 name Jack age 21
    int i, created = 0;
    robj *o; // 略 ...    // 判断hash的key是否存在，不存在则创建一个新的，默认采用ZipList编码
    if ((o = hashTypeLookupWriteOrCreate(c,c->argv[1])) == NULL) return;
    // 判断是否需要把ZipList转为Dict
    hashTypeTryConversion(o,c->argv,2,c->argc-1);
    // 循环遍历每一对field和value，并执行hset命令
    for (i = 2; i < c->argc; i += 2)
        created += !hashTypeSet(o,c->argv[i]->ptr,c->argv[i+1]->ptr,HASH_SET_COPY);    // 略 ...
}
```

```c
robj *hashTypeLookupWriteOrCreate(client *c, robj *key) {
    // 查找key
    robj *o = lookupKeyWrite(c->db,key);
    if (checkType(c,o,OBJ_HASH)) return NULL;
    // 不存在，则创建新的
    if (o == NULL) {
        o = createHashObject();
        dbAdd(c->db,key,o);
    }
    return o;
}
```

```c
robj *createHashObject(void) {
    // 默认采用ZipList编码，申请ZipList内存空间
    unsigned char *zl = ziplistNew();
    robj *o = createObject(OBJ_HASH, zl);
    // 设置编码
    o->encoding = OBJ_ENCODING_ZIPLIST;
    return o;
}
```

```c
void hashTypeTryConversion(robj *o, robj **argv, int start, int end) {
    int i;
    size_t sum = 0;
    // 本来就不是ZipList编码，什么都不用做了
    if (o->encoding != OBJ_ENCODING_ZIPLIST) return;
    // 依次遍历命令中的field、value参数
    for (i = start; i <= end; i++) {
        if (!sdsEncodedObject(argv[i]))
            continue;
        size_t len = sdslen(argv[i]->ptr);
        // 如果field或value超过hash_max_ziplist_value，则转为HT
        if (len > server.hash_max_ziplist_value) {
            hashTypeConvert(o, OBJ_ENCODING_HT);
            return;
        }
        sum += len;
    }// ziplist大小超过1G，也转为HT
    if (!ziplistSafeToAdd(o->ptr, sum))
        hashTypeConvert(o, OBJ_ENCODING_HT);
}
```

```c
int hashTypeSet(robj *o, sds field, sds value, int flags) {
    int update = 0;
    // 判断是否为ZipList编码
    if (o->encoding == OBJ_ENCODING_ZIPLIST) {
        unsigned char *zl, *fptr, *vptr;
        zl = o->ptr;
        // 查询head指针
        fptr = ziplistIndex(zl, ZIPLIST_HEAD);
        if (fptr != NULL) { // head不为空，说明ZipList不为空，开始查找key
            fptr = ziplistFind(zl, fptr, (unsigned char*)field, sdslen(field), 1);
            if (fptr != NULL) {// 判断是否存在，如果已经存在则更新
                update = 1;
                zl = ziplistReplace(zl, vptr, (unsigned char*)value,
                        sdslen(value));
            }
        }
        // 不存在，则直接push
        if (!update) { // 依次push新的field和value到ZipList的尾部
            zl = ziplistPush(zl, (unsigned char*)field, sdslen(field),
                    ZIPLIST_TAIL);
            zl = ziplistPush(zl, (unsigned char*)value, sdslen(value),
                    ZIPLIST_TAIL);
        }
        o->ptr = zl;
        /* 插入了新元素，检查list长度是否超出，超出则转为HT */
        if (hashTypeLength(o) > server.hash_max_ziplist_entries)
            hashTypeConvert(o, OBJ_ENCODING_HT);
    } else if (o->encoding == OBJ_ENCODING_HT) {
        // HT编码，直接插入或覆盖
    } else {
        serverPanic("Unknown hash encoding");
    }
    return update;
}
```

### 网络模型

#### 用户空间和内核态空间

![image-20221115005235805](http://minio.botuer.com/study-node/old/image-20221115005235805.png)

我们想要用户的应用来访问，计算机就必须要通过对外暴露的一些接口，才能访问到，从而简介的实现对内核的操控，但是内核本身上来说也是一个应用，所以他本身也需要一些内存，cpu等设备资源，用户应用本身也在消耗这些资源，如果不加任何限制，用户去操作随意的去操作我们的资源，就有可能导致一些冲突，甚至有可能导致我们的系统出现无法运行的问题，因此我们需要把用户和**内核隔离开**

进程的寻址空间划分成两部分：**内核空间、用户空间**

什么是寻址空间呢？我们的应用程序也好，还是内核空间也好，都是没有办法直接去物理内存的，而是通过分配一些虚拟内存映射到物理内存中，我们的内核和应用程序去访问虚拟内存的时候，就需要一个虚拟地址，这个地址是一个无符号的整数，比如一个32位的操作系统，他的带宽就是32，他的虚拟地址就是2的32次方，也就是说他寻址的范围就是0~2的32次方， 这片寻址空间对应的就是2的32个字节，就是4GB，这个4GB，会有3个GB分给用户空间，会有1GB给内核系统

在linux中，他们权限分成两个等级，0和3，用户空间只能执行受限的命令（Ring3），而且不能直接调用系统资源，必须通过内核提供的接口来访问内核空间可以执行特权命令（Ring0），调用一切系统资源，所以一般情况下，用户的操作是运行在用户空间，而内核运行的数据是在内核空间的，而有的情况下，一个应用程序需要去调用一些特权资源，去调用一些内核空间的操作，所以此时他俩需要在用户态和内核态之间进行切换。

比如：

Linux系统为了提高IO效率，会在用户空间和内核空间都加入缓冲区：

写数据时，要把用户缓冲数据拷贝到内核缓冲区，然后写入设备

读数据时，要从设备读取数据到内核缓冲区，然后拷贝到用户缓冲区

针对这个操作：我们的用户在写读数据时，会去向内核态申请，想要读取内核的数据，而内核数据要去等待驱动程序从硬件上读取数据，当从磁盘上加载到数据之后，内核会将数据写入到内核的缓冲区中，然后再将数据拷贝到用户态的buffer中，然后再返回给应用程序，整体而言，速度慢，就是这个原因，为了加速，我们希望read也好，还是wait for data也最好都不要等待，或者时间尽量的短。

![image-20221115005337886](http://minio.botuer.com/study-node/old/image-20221115005337886.png)

#### 阻塞IO

应用程序想要去读取数据，他是**无法直接去读取磁盘数据**的，他需要先**到内核里边**去**等待内核操作硬件拿到数据**，这个过程就是1，是需要等待的，等到**内核从磁盘上把数据加载出来**之后，再把这个数据**写给用户的缓存区**，这个过程是2，如果是阻塞IO，那么整个过程中，用户从发起读请求开始，一直到读取到数据，都是一个阻塞状态。

![image-20221115005422347](http://minio.botuer.com/study-node/old/image-20221115005422347.png)

**阶段一：**

- 用户进程发起**recvform**一个命令，尝试读取数据（比如网卡数据）
- 此时数据尚未到达，内核需要等待数据
- 此时用户进程也处于阻塞状态

阶段二：

* 数据到达并拷贝到内核缓冲区，代表已就绪
* 将内核数据拷贝到用户缓冲区
* 拷贝过程中，用户进程依然阻塞等待
* 拷贝完成，用户进程解除阻塞，处理数据

可以看到，阻塞IO模型中，用户进程在两个阶段都是阻塞状态。

![image-20221115005739868](http://minio.botuer.com/study-node/old/image-20221115005739868.png)

#### 非阻塞IO

阶段一：

* 用户进程尝试读取数据（比如网卡数据）
* 此时数据尚未到达，内核需要等待数据
* 返回异常给用户进程
* 用户进程拿到error后，再次尝试读取
* 循环往复，直到数据就绪

阶段二：

* 将内核数据拷贝到用户缓冲区
* 拷贝过程中，用户进程依然阻塞等待
* 拷贝完成，用户进程解除阻塞，处理数据
* 可以看到，非阻塞IO模型中，用户进程在第一个阶段是非阻塞，第二个阶段是阻塞状态。虽然是非阻塞，但性能并没有得到提高。而且忙等机制会导致CPU空转，CPU使用率暴增。

![image-20221115005808964](http://minio.botuer.com/study-node/old/image-20221115005808964.png)

#### IO多路复用

**文件描述符**（File Descriptor）：简称**FD**，是一个从0 开始的无符号整数，用来关联Linux中的一个文件。在Linux中，一切皆文件，例如常规文件、视频、硬件设备等，当然也包括网络套接字（Socket）。

通过FD，我们的网络模型可以利用**一个线程监听多个FD**，并在某个FD可读、可写时得到通知，从而避免无效的等待，充分利用CPU资源。

阶段一：

* 用户进程调用select，指定要监听的FD集合
* 核监听FD对应的多个socket
* 任意一个或多个socket数据就绪则返回readable
* 此过程中用户进程阻塞

阶段二：

* 用户进程找到就绪的socket
* 依次调用recvfrom读取数据
* 内核将数据拷贝到用户空间
* 用户进程处理数据

> 当用户去读取数据的时候，不再去直接调用recvfrom了，而是调用select的函数，select函数会将需要监听的数据交给内核，由内核去检查这些数据是否就绪了，如果说这个数据就绪了，就会通知应用程序数据就绪，然后来读取数据，再从内核中把数据拷贝给用户态，完成数据处理，如果N多个FD一个都没处理完，此时就进行等待
>

用IO复用模式，可以确保去读数据的时候，数据是一定存在的，他的效率比原来的阻塞IO和非阻塞IO性能都要高

![image-20221115010103859](http://minio.botuer.com/study-node/old/image-20221115010103859.png)

IO多路复用是利用单个线程来同时监听多个FD，并在某个FD可读、可写时得到通知，从而避免无效的等待，充分利用CPU资源。不过监听FD的方式、通知的方式又有多种实现，常见的有：

- select
- poll
- epoll

差异

- uselect和poll只会通知用户进程有FD就绪，但不确定具体是哪个FD，需要用户进程逐个遍历FD来确认
- uepoll则会在通知用户进程FD就绪的同时，把已就绪的FD写入用户空间

##### select方式

select是Linux最早是由的I/O多路复用技术：

- 把需要处理的数据封装成FD
- 在用户态时创建一个fd的集合（这个集合的大小是要监听的那个FD的最大值+1，但是大小整体是有限制的），同时在这个集合中，标明出来我们要控制哪些数据
- 比如要监听的数据，是1,2,5三个数据，此时会执行select函数，然后将整个fd发给内核态
- 内核态会去遍历用户态传递过来的数据，如果发现这里边都数据都没有就绪，就休眠
- 直到有数据准备好时，就会被唤醒
- 唤醒之后，再次遍历一遍，看看谁准备好了，然后再处理掉没有准备好的数据（置为0），最后再将这个FD集合写回到用户态中去
- 此时用户态就知道了有人准备好了，但是对于用户态而言，并不知道谁处理好了
- 所以用户态也需要去进行遍历，然后找到对应准备好数据的节点，再去发起读请求

<img src="http://minio.botuer.com/study-node/old/image-20221115010448064.png" alt="image-20221115010448064" style="zoom: 50%;" />

<img src="http://minio.botuer.com/study-node/old/image-20221115011620276.png" alt="image-20221115011620276" style="zoom: 50%;" />

**缺点**

- **多次拷贝**：需要将整个fd_set从用户空间拷贝到内核空间，select结束还要再次拷贝回用户空间
- **遍历集合**：select无法得知具体是哪个fd就绪，需要遍历整个fd_set
- **数量限制**：fd_set监听的fd数量不能超过1024

```c
// 定义类型别名 __fd_mask，本质是 long int
typedef long int __fd_mask;
/* fd_set 记录要监听的fd集合，及其对应状态 */
typedef struct {
    // fds_bits是long类型数组，长度为 1024/32 = 32
    // 共1024个bit位，每个bit位代表一个fd，0代表未就绪，1代表就绪
    __fd_mask fds_bits[__FD_SETSIZE / __NFDBITS];
    // ...
} fd_set;
// select函数，用于监听fd_set，也就是多个fd的集合
int select(
    int nfds, // 要监视的fd_set的最大fd + 1
    fd_set *readfds, // 要监听读事件的fd集合
    fd_set *writefds,// 要监听写事件的fd集合
    fd_set *exceptfds, // // 要监听异常事件的fd集合
    // 超时时间，null-用不超时；0-不阻塞等待；大于0-固定等待时间
    struct timeval *timeout
);
```

##### poll模式

poll模式对select模式做了简单改进，但性能提升不明显，部分关键代码如下：

IO流程：

* 创建pollfd数组，向其中添加关注的fd信息，数组大小自定义
* 调用poll函数，将pollfd数组拷贝到内核空间，转链表存储，无上限
* 内核遍历fd，判断是否就绪
* 数据就绪或超时后，拷贝pollfd数组到用户空间，返回就绪fd数量n
* 用户进程判断n是否大于0,大于0则遍历pollfd数组，找到就绪的fd

**与select对比：**

* select模式中的fd_set大小固定为1024，而pollfd在内核中采用链表，理论上无上限
* 监听FD越多，每次遍历消耗时间也越久，性能反而会下降

```h
// pollfd 中的事件类型
#define POLLIN     //可读事件
#define POLLOUT    //可写事件
#define POLLERR    //错误事件
#define POLLNVAL   //fd未打开

// pollfd结构
struct pollfd {
    int fd;     	  /* 要监听的fd  */
    short int events; /* 要监听的事件类型：读、写、异常 */
    short int revents;/* 实际发生的事件类型 */
};
// poll函数
int poll(
    struct pollfd *fds, // pollfd数组，可以自定义大小
    nfds_t nfds, // 数组元素个数
    int timeout // 超时时间
);
```

##### epoll函数

<img src="http://minio.botuer.com/study-node/old/image-20221115011422669.png" alt="image-20221115011422669" style="zoom:50%;" />

epoll模式是对select和poll的改进，它提供了三个函数：

**eventpoll的函数**

- 红黑树-> 记录的事要监听的FD

- 链表-> 记录的是就绪的FD

```c
struct eventpoll {
    //...
    struct rb_root  rbr; // 一颗红黑树，记录要监听的FD
    struct list_head rdlist;// 一个链表，记录就绪的FD
    //...
};
// 1.创建一个epoll实例,内部是event poll，返回对应的句柄epfd
int epoll_create(int size);
```

**epoll_ctl函数**

紧接着调用epoll_ctl操作，将要监听的数据添加到红黑树上去，并且给每个fd设置一个监听函数，这个函数会在fd数据就绪时触发，就是准备好了，现在就把fd把数据添加到list_head中去

```c
// 2.将一个FD添加到epoll的红黑树中，并设置ep_poll_callback
// callback触发时，就把对应的FD加入到rdlist这个就绪列表中
int epoll_ctl(
    int epfd,  // epoll实例的句柄
    int op,    // 要执行的操作，包括：ADD、MOD、DEL
    int fd,    // 要监听的FD
    struct epoll_event *event // 要监听的事件类型：读、写、异常等
);
```

**epoll_wait函数**

就去等待，在用户态创建一个空的events数组，当就绪之后，我们的回调函数会把数据添加到list_head中去，当调用这个函数的时候，会去检查list_head，当然这个过程需要参考配置的等待时间，可以等一定时间，也可以一直等， 如果在此过程中，检查到了list_head中有数据会将数据添加到链表中，此时将数据放入到events数组中，并且返回对应的操作的数量，用户态的此时收到响应后，从events中拿到对应准备好的数据的节点，再去调用方法去拿数据

```c
// 3.检查rdlist列表是否为空，不为空则返回就绪的FD的数量
int epoll_wait(
    int epfd,                   // epoll实例的句柄
    struct epoll_event *events, // 空event数组，用于接收就绪的FD
    int maxevents,              // events数组的最大长度
    int timeout   // 超时时间，-1用不超时；0不阻塞；大于0为阻塞时间
);
```

**总结**

- select模式存在的三个问题：

  * 能监听的FD最大不超过1024

  * 每次select都需要把所有要监听的FD都拷贝到内核空间

  * 每次都要遍历所有FD来判断就绪状态


- poll模式的问题：
  * poll利用链表解决了select中监听FD上限的问题，但依然要遍历所有FD，如果监听较多，性能会下降


- epoll模式中如何解决这些问题的？

  * 基于epoll实例中的红黑树保存要监听的FD，理论上无上限，而且增删改查效率都非常高

  * 每个FD只需要执行一次epoll_ctl添加到红黑树，以后每次epol_wait无需传递任何参数，无需重复拷贝FD到内核空间

  * 利用ep_poll_callback机制来监听FD状态，无需遍历所有FD，因此性能不会随监听的FD数量增多而下降

##### 事件通知机制ET和LT

当FD有数据可读时，我们调用epoll_wait（或者select、poll）可以得到通知。但是事件通知的模式有两种：

* LevelTriggered：简称LT，也叫做水平触发。只要某个FD中有数据可读，每次调用epoll_wait都会得到通知。
* EdgeTriggered：简称ET，也叫做边沿触发。只有在某个FD有状态变化时，调用epoll_wait才会被通知。

举个栗子：

* 假设一个客户端socket对应的FD已经注册到了epoll实例中
* 客户端socket发送了2kb的数据
* 服务端调用epoll_wait，得到通知说FD就绪
* 服务端从FD读取了1kb数据
* 回到步骤3（再次调用epoll_wait，形成循环）

结果

- 如果我们采用LT模式，因为FD中仍有1kb数据，则第⑤步依然会返回结果，并且得到通知
- 如果我们采用ET模式，因为第③步已经消费了FD可读事件，第⑤步FD状态没有变化，因此epoll_wait不会返回，数据无法读取，客户端响应超时

**结论**

- LT：事件通知频率较高，会有重复通知，影响性能

- ET：仅通知一次，效率高。可以基于非阻塞IO循环读取解决数据读取不完整问题

- select和poll仅支持LT模式，epoll可以自由选择LT和ET两种模式

##### 基于epoll的服务器端流程

服务器启动以后，服务端会去调用epoll_create，创建一个epoll实例，epoll实例中包含两个数据

1、红黑树（为空）：rb_root 用来去记录需要被监听的FD

2、链表（为空）：list_head，用来存放已经就绪的FD

创建好了之后，会去调用epoll_ctl函数，此函数会会将需要监听的数据添加到rb_root中去，并且对当前这些存在于红黑树的节点设置回调函数，当这些被监听的数据一旦准备完成，就会被调用，而调用的结果就是将红黑树的fd添加到list_head中去(但是此时并没有完成)

3、当第二步完成后，就会调用epoll_wait函数，这个函数会去校验是否有数据准备完毕（因为数据一旦准备就绪，就会被回调函数添加到list_head中），在等待了一段时间后(可以进行配置)，如果等够了超时时间，则返回没有数据，如果有，则进一步判断当前是什么事件，如果是建立连接时间，则调用accept() 接受客户端socket，拿到建立连接的socket，然后建立起来连接，如果是其他事件，则把数据进行写出

<img src="http://minio.botuer.com/study-node/old/image-20221115012546005.png" alt="image-20221115012546005" style="zoom: 50%;" />

#### 信号驱动

信号驱动IO是与内核建立SIGIO的信号关联并设置回调，当内核有FD就绪时，会发出SIGIO信号通知用户，期间用户应用可以执行其它业务，无需阻塞等待。

阶段一：

* 用户进程调用sigaction，注册信号处理函数
* 内核返回成功，开始监听FD
* 用户进程不阻塞等待，可以执行其它业务
* 当内核数据就绪后，回调用户进程的SIGIO处理函数

阶段二：

* 收到SIGIO回调信号
* 调用recvfrom，读取
* 内核将数据拷贝到用户空间
* 用户进程处理数据

![image-20221115012734723](http://minio.botuer.com/study-node/old/image-20221115012734723.png)

当有大量IO操作时，信号较多，SIGIO处理函数不能及时处理可能导致信号队列溢出，而且内核空间与用户空间的频繁信号交互性能也较低

#### 异步IO

这种方式，不仅仅是用户态在试图读取数据后，不阻塞，而且当内核的数据准备完成后，也不会阻塞

他会由内核将所有数据处理完成后，由内核将数据写入到用户态中，然后才算完成，所以性能极高，不会有任何阻塞，全部都由内核完成，可以看到，异步IO模型中，用户进程在两个阶段都是非阻塞状态。

![image-20221115012802669](http://minio.botuer.com/study-node/old/image-20221115012802669.png)

#### 对比

![image-20221115012836797](http://minio.botuer.com/study-node/old/image-20221115012836797.png)

#### Redis网络模型

Redis通过IO多路复用来提高网络性能，并且支持各种不同的多路复用实现，并且将这些实现进行封装， 提供了统一的高性能事件库API库 AE：

```c
/* ae.c */
#ifdef HAVE_EVPORT
#include "ae_evport.c"
#else
    #ifdef HAVE_EPOLL
    #include "ae_epoll.c"
    #else
        #ifdef HAVE_KQUEUE
        #include "ae_kqueue.c"
        #else
        #include "ae_select.c"
        #endif
    #endif
#endif
```

<img src="http://minio.botuer.com/study-node/old/image-20221115013252615.png" alt="image-20221115013252615" style="zoom:50%;" />

**Redis单线程网络模型流程**

```c
int main(
    int argc,
    char **argv
) {
    // ...
    // 初始化服务
    initServer();
    // ...
    // 开始监听事件循环
    aeMain(server.el);
    // ...
}
```

```c
void initServer(void) {
    // ...
    // 内部会调用 aeApiCreate(eventLoop)，类似epoll_create
    server.el = aeCreateEventLoop(
                    server.maxclients+CONFIG_FDSET_INCR);
    // ...
    // 监听TCP端口，创建ServerSocket，并得到FD
    listenToPort(server.port,&server.ipfd)
    // ...
    // 注册 连接处理器，内部会调用 aeApiCreate(&server.ipfd)监听FD
    createSocketAcceptHandler(&server.ipfd, acceptTcpHandler)
    // 注册 ae_api_poll 前的处理器
    aeSetBeforeSleepProc(server.el,beforeSleep);
}
```

```c
void aeMain(aeEventLoop *eventLoop) {
    eventLoop->stop = 0;
    // 循环监听事件
    while (!eventLoop->stop) {
        aeProcessEvents(
            eventLoop, 
            AE_ALL_EVENTS|
                AE_CALL_BEFORE_SLEEP|
                AE_CALL_AFTER_SLEEP);
    }
}
```

```c
int aeProcessEvents(
    aeEventLoop *eventLoop,
    int flags ){
    // ...  调用前置处理器 beforeSleep
    eventLoop->beforesleep(eventLoop);
    // 等待FD就绪，类似epoll_wait
    numevents = aeApiPoll(eventLoop, tvp);
    for (j = 0; j < numevents; j++) {
        // 遍历处理就绪的FD，调用对应的处理器
    }
}
```

```c
// 数据读处理器
void acceptTcpHandler(...) {
    // ...
    // 接收socket连接，获取FD
    fd = accept(s,sa,len);
    // ...
    // 创建connection，关联fd
    connection *conn = connCreateSocket();
    conn.fd = fd;
    // ... 
    // 内部调用aeApiAddEvent(fd,READABLE)，
    // 监听socket的FD读事件，并绑定读处理器readQueryFromClient
    connSetReadHandler(conn, readQueryFromClient);
}
```

**Redis单线程和多线程网络模型变更**

当我们的客户端想要去连接我们服务器，会去先到IO多路复用模型去进行排队，会有一个连接应答处理器，他会去接受读请求，然后又把读请求注册到具体模型中去，此时这些建立起来的连接，如果是客户端请求处理器去进行执行命令时，他会去把数据读取出来，然后把数据放入到client中， clinet去解析当前的命令转化为redis认识的命令，接下来就开始处理这些命令，从redis中的command中找到这些命令，然后就真正的去操作对应的数据了，当数据操作完成后，会去找到命令回复处理器，再由他将数据写出

> Redis 6.0版本中引入了多线程，目的是为了提高IO读写效率。因此在**解析客户端命令**、**写响应结果**时采用了多线程。核心的命令执行、IO多路复用模块依然是由主线程执行

![image-20221115012951481](http://minio.botuer.com/study-node/old/image-20221115012951481.png)

```c
void readQueryFromClient(connection *conn) {
    // 获取当前客户端，客户端中有缓冲区用来读和写
    client *c = connGetPrivateData(conn);
    // 获取c->querybuf缓冲区大小
    long int qblen = sdslen(c->querybuf);
    // 读取请求数据到 c->querybuf 缓冲区
    connRead(c->conn, c->querybuf+qblen, readlen);
    // ... 
    // 解析缓冲区字符串，转为Redis命令参数存入 c->argv 数组
    processInputBuffer(c);
    // ...
    // 处理 c->argv 中的命令
    processCommand(c);
}
int processCommand(client *c) {
    // ...
    // 根据命令名称，寻找命令对应的command，例如 setCommand
    c->cmd = c->lastcmd = lookupCommand(c->argv[0]->ptr);
    // ...
    // 执行command，得到响应结果，例如ping命令，对应pingCommand
    c->cmd->proc(c);
    // 把执行结果写出，例如ping命令，就返回"pong"给client，
    // shared.pong是 字符串"pong"的SDS对象
    addReply(c,shared.pong); 
}
void addReply(client *c, robj *obj) {
    // 尝试把结果写到 c-buf 客户端写缓存区
    if (_addReplyToBuffer(c,obj->ptr,sdslen(obj->ptr)) != C_OK)
            // 如果c->buf写不下，则写到 c->reply，这是一个链表，容量无上限
            _addReplyProtoToList(c,obj->ptr,sdslen(obj->ptr));
    // 将客户端添加到server.clients_pending_write这个队列，等待被写出
    listAddNodeHead(server.clients_pending_write,c);
}
```

<img src="http://minio.botuer.com/study-node/old/image-20221115013709295.png" alt="image-20221115013709295" style="zoom:50%;" />

```c
void beforeSleep(struct aeEventLoop *eventLoop){
    // ...
    // 定义迭代器，指向server.clients_pending_write->head;
    listIter li;
    li->next = server.clients_pending_write->head;
    li->direction = AL_START_HEAD;
    // 循环遍历待写出的client
    while ((ln = listNext(&li))) {
        // 内部调用aeApiAddEvent(fd，WRITEABLE)，监听socket的FD读事件
        // 并且绑定 写处理器 sendReplyToClient，可以把响应写到客户端socket
        connSetWriteHandlerWithBarrier(c->conn, sendReplyToClient, ae_barrier)
    }
}
```

**Redis到底是单线程还是多线程？**

* 如果仅仅聊Redis的核心业务部分（命令处理），答案是单线程
* 如果是聊整个Redis，那么答案就是多线程

在Redis版本迭代过程中，在两个重要的时间节点上引入了多线程的支持：

* Redis v4.0：引入多线程异步处理一些耗时较旧的任务，例如异步删除命令unlink
* Redis v6.0：在核心网络模型中引入 多线程，进一步提高对于多核CPU的利用率

因此，对于Redis的核心网络模型，在Redis 6.0之前确实都是单线程。是利用epoll（Linux系统）这样的IO多路复用技术在事件循环中不断处理客户端情况。

**为什么Redis要选择单线程？**

* 抛开持久化不谈，Redis是纯  内存操作，执行速度非常快，它的性能瓶颈是网络延迟而不是执行速度，因此多线程并不会带来巨大的性能提升。
* 多线程会导致过多的上下文切换，带来不必要的开销
* 引入多线程会面临线程安全问题，必然要引入线程锁这样的安全手段，实现复杂度增高，而且性能也会大打折扣

### 通信协议

#### RESP协议

Redis是一个CS架构的软件，通信一般分两步（不包括pipeline和PubSub）：

- 客户端（client）向服务端（server）发送一条命令

- 服务端解析并执行命令，返回响应结果给客户端

因此客户端发送命令的格式、服务端响应结果的格式必须有一个规范，这个规范就是通信协议



而在Redis中采用的是**RESP**（Redis Serialization Protocol）协议：

- Redis 1.2版本引入了RESP协议

- Redis 2.0版本中成为与Redis服务端通信的标准，称为RESP2

- Redis 6.0版本中，从RESP2升级到了RESP3协议，增加了更多数据类型并且支持6.0的新特性--客户端缓存

但目前，**默认**使用的依然是**RESP2**协议

**数据类型**

在RESP中，通过首字节的字符来区分不同数据类型，常用的数据类型包括5种：

- 单行字符串：首字节是 ‘+’ ，后面跟上单行字符串，以CRLF（ "\r\n" ）结尾。例如返回"OK"： "+OK\r\n"

- 错误（Errors）：首字节是 ‘-’ ，与单行字符串格式一样，只是字符串是异常信息，例如："-Error message\r\n"

- 数值：首字节是 ‘:’ ，后面跟上数字格式的字符串，以CRLF结尾。例如：":10\r\n"

- 多行字符串：首字节是 ‘$’ ，表示二进制安全的字符串，最大支持512MB：

  - 如果大小为0，则代表空字符串："$0\r\n\r\n"

  - 如果大小为-1，则代表不存在："$-1\r\n"

- 数组：首字节是 ‘*’，后面跟上数组元素个数，再跟上元素，元素数据类型不限:

![image-20221115014727514](http://minio.botuer.com/study-node/old/image-20221115014727514.png)

**基于Socket自定义Redis的客户端**

Redis支持TCP通信，因此我们可以使用Socket来模拟客户端，与Redis服务端建立连接：

```java
public class Main {

    static Socket s;
    static PrintWriter writer;
    static BufferedReader reader;

    public static void main(String[] args) {
        try {
            // 1.建立连接
            String host = "192.168.150.101";
            int port = 6379;
            s = new Socket(host, port);
            // 2.获取输出流、输入流
            writer = new PrintWriter(new OutputStreamWriter(s.getOutputStream(), StandardCharsets.UTF_8));
            reader = new BufferedReader(new InputStreamReader(s.getInputStream(), StandardCharsets.UTF_8));

            // 3.发出请求
            // 3.1.获取授权 auth 123321
            sendRequest("auth", "123321");
            Object obj = handleResponse();
            System.out.println("obj = " + obj);

            // 3.2.set name 虎哥
            sendRequest("set", "name", "虎哥");
            // 4.解析响应
            obj = handleResponse();
            System.out.println("obj = " + obj);

            // 3.2.set name 虎哥
            sendRequest("get", "name");
            // 4.解析响应
            obj = handleResponse();
            System.out.println("obj = " + obj);

            // 3.2.set name 虎哥
            sendRequest("mget", "name", "num", "msg");
            // 4.解析响应
            obj = handleResponse();
            System.out.println("obj = " + obj);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            // 5.释放连接
            try {
                if (reader != null) reader.close();
                if (writer != null) writer.close();
                if (s != null) s.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private static Object handleResponse() throws IOException {
        // 读取首字节
        int prefix = reader.read();
        // 判断数据类型标示
        switch (prefix) {
            case '+': // 单行字符串，直接读一行
                return reader.readLine();
            case '-': // 异常，也读一行
                throw new RuntimeException(reader.readLine());
            case ':': // 数字
                return Long.parseLong(reader.readLine());
            case '$': // 多行字符串
                // 先读长度
                int len = Integer.parseInt(reader.readLine());
                if (len == -1) {
                    return null;
                }
                if (len == 0) {
                    return "";
                }
                // 再读数据,读len个字节。我们假设没有特殊字符，所以读一行（简化）
                return reader.readLine();
            case '*':
                return readBulkString();
            default:
                throw new RuntimeException("错误的数据格式！");
        }
    }

    private static Object readBulkString() throws IOException {
        // 获取数组大小
        int len = Integer.parseInt(reader.readLine());
        if (len <= 0) {
            return null;
        }
        // 定义集合，接收多个元素
        List<Object> list = new ArrayList<>(len);
        // 遍历，依次读取每个元素
        for (int i = 0; i < len; i++) {
            list.add(handleResponse());
        }
        return list;
    }

    // set name 虎哥
    private static void sendRequest(String ... args) {
        writer.println("*" + args.length);
        for (String arg : args) {
            writer.println("$" + arg.getBytes(StandardCharsets.UTF_8).length);
            writer.println(arg);
        }
        writer.flush();
    }
}

```

### 内存回收

Redis之所以性能强，最主要的原因就是基于内存存储。然而单节点的Redis其内存大小不宜过大，会影响持久化或主从同步性能。
我们可以通过修改配置文件来设置Redis的最大内存：

```ini
## 格式：
## maxmemory <bytes>
## 例如：
maxmemory 1gb
```

当内存使用达到上限时，就无法存储更多数据了。为了解决这个问题，Redis提供了一些策略实现内存回收：

- 内存过期策略

- 内存淘汰策略

#### 过期策略

**Redis是如何知道一个key是否过期呢？**

**DB结构**：

Redis本身是一个典型的key-value内存存储数据库，因此所有的key、value都保存在之前学习过的Dict结构中。不过在其database结构体中，有两个Dict：一个用来记录key-value；另一个用来记录key-TTL

![image-20221115015248317](http://minio.botuer.com/study-node/old/image-20221115015248317.png)

**结构体**

```h
typedef struct redisDb {
    dict *dict;                 /* 存放所有key及value的地方，也被称为keyspace*/
    dict *expires;              /* 存放每一个key及其对应的TTL存活时间，只包含设置了TTL的key*/
    dict *blocking_keys;        /* Keys with clients waiting for data (BLPOP)*/
    dict *ready_keys;           /* Blocked keys that received a PUSH */
    dict *watched_keys;         /* WATCHED keys for MULTI/EXEC CAS */
    int id;                     /* Database ID，0~15 */
    long long avg_ttl;          /* 记录平均TTL时长 */
    unsigned long expires_cursor; /* expire检查时在dict中抽样的索引位置. */
    list *defrag_later;         /* 等待碎片整理的key列表. */
} redisDb;
```

**是不是TTL到期就立即删除了呢？**

- 惰性删除
- 周期删除

**惰性删除**：在**访问时**，检查该key的存活时间，如果已经过期才执行删除

```c
// 查找一个key执行写操作
robj *lookupKeyWriteWithFlags(redisDb *db, robj *key, int flags) {
    // 检查key是否过期
    expireIfNeeded(db,key);
    return lookupKey(db,key,flags);
}
// 查找一个key执行读操作
robj *lookupKeyReadWithFlags(redisDb *db, robj *key, int flags) {
    robj *val;
    // 检查key是否过期    if (expireIfNeeded(db,key) == 1) {
        // ...略
    }
    return NULL;
```

```c
int expireIfNeeded(redisDb *db, robj *key) {
    // 判断是否过期，如果未过期直接结束并返回0
    if (!keyIsExpired(db,key)) return 0;
    // ... 略
    // 删除过期key
    deleteExpiredKeyAndPropagate(db,key);
    return 1;
}
```

**周期删除**

通过一个定时任务，周期性的抽样部分过期的key，然后执行删除。执行周期有两种：

```c
// server.c
void initServer(void){
    // ...
    // 创建定时器，关联回调函数serverCron，处理周期取决于server.hz，默认10
    aeCreateTimeEvent(server.el, 1, serverCron, NULL, NULL) 
}
```

```c
// server.c
int serverCron(struct aeEventLoop *eventLoop, long long id, void *clientData) {
    // 更新lruclock到当前时间，为后期的LRU和LFU做准备
    unsigned int lruclock = getLRUClock();
    atomicSet(server.lruclock,lruclock);
    // 执行database的数据清理，例如过期key处理
    databasesCron();
}
```

- Redis服务初始化函数initServer()中设置定时任务，按照server.hz的频率来执行过期key清理，模式为SLOW

  ```c
  void databasesCron(void) {
      // 尝试清理部分过期key，清理模式默认为SLOW
      activeExpireCycle(
            ACTIVE_EXPIRE_CYCLE_SLOW);
  }
  ```

- Redis的每个事件循环前会调用beforeSleep()函数，执行过期key清理，模式为FAST

  ```c
  void beforeSleep(struct aeEventLoop *eventLoop){
      // ...
      // 尝试清理部分过期key，清理模式默认为FAST
      activeExpireCycle(
           ACTIVE_EXPIRE_CYCLE_FAST);
  }
  ```

**SLOW模式规则：**

* 执行频率受server.hz影响，默认为10，即每秒执行10次，每个执行周期100ms。
* 执行清理耗时不超过一次执行周期的25%.默认slow模式耗时不超过25ms
* 逐个遍历db，逐个遍历db中的bucket，抽取20个key判断是否过期
* 如果没达到时间上限（25ms）并且过期key比例大于10%，再进行一次抽样，否则结束

**FAST模式规则**（过期key比例小于10%不执行 ）：

* 执行频率受beforeSleep()调用频率影响，但两次FAST模式间隔不低于2ms
* 执行清理耗时不超过1ms
* 逐个遍历db，逐个遍历db中的bucket，抽取20个key判断是否过期
* 如果没达到时间上限（1ms）并且过期key比例大于10%，再进行一次抽样，否则结束

**总结**

- RedisKey的TTL记录方式：在RedisDB中通过一个Dict记录每个Key的TTL时间

- 过期key的删除策略：

  - 惰性清理：每次查找key时判断是否过期，如果过期则删除

  - 定期清理：定期抽样部分key，判断是否过期，如果过期则删除

- 定期清理的两种模式：

  - SLOW模式执行频率默认为10，每次不超过25ms

  - FAST模式执行频率不固定，但两次间隔不低于2ms，每次耗时不超过1ms

#### 淘汰策略

当Redis内存使用达到设置的上限时，主动挑选部分key删除以释放更多内存的流程。Redis会在处理客户端命令的方法processCommand()中尝试做内存淘汰

```c
int processCommand(client *c) {
    // 如果服务器设置了server.maxmemory属性，并且并未有执行lua脚本
    if (server.maxmemory && !server.lua_timedout) {
        // 尝试进行内存淘汰performEvictions
        int out_of_memory = (performEvictions() == EVICT_FAIL);
        // ...
        if (out_of_memory && reject_cmd_on_oom) {
            rejectCommand(c, shared.oomerr);
            return C_OK;
        }
        // ....
    }
}
```

Redis支持8种不同策略来选择要删除的key：

> noeviction不
>
> allkeys所有
>
> volatile设置了过期策略的
>
> random随机
>
> LRU（Least Recently Used），最少最近使用。用当前时间减去最后一次访问时间，值越大则淘汰优先级越高
>
> LFU（Least Frequently Used），最少频率使用。会统计每个key的访问频率，值越小淘汰优先级越高

* noeviction： 不淘汰任何key，但是内存满时不允许写入新数据，**默认**就是这种策略。
* volatile-ttl： 对设置了TTL的key，比较key的剩余TTL值，TTL越小越先被淘汰
* allkeys-random：对全体key ，随机进行淘汰。也就是直接从db->dict中随机挑选
* volatile-random：对设置了TTL的key ，随机进行淘汰。也就是从db->expires中随机挑选。
* allkeys-lru： 对全体key，基于LRU算法进行淘汰
* volatile-lru： 对设置了TTL的key，基于LRU算法进行淘汰
* allkeys-lfu： 对全体key，基于LFU算法进行淘汰

- volatile-lfu： 对设置了TTL的key，基于LFI算法进行淘汰

Redis的数据都会被封装为RedisObject结构：

```h
typedef struct redisObject {
    unsigned type:4;        // 对象类型
    unsigned encoding:4;    // 编码方式
    unsigned lru:LRU_BITS;  // LRU：以秒为单位记录最近一次访问时间，长度24bit
			  // LFU：高16位以分钟为单位记录最近一次访问时间，低8位记录逻辑访问次数
    int refcount;           // 引用计数，计数为0则可以回收
    void *ptr;              // 数据指针，指向真实数据
} robj;
```

LFU的访问次数之所以叫做逻辑访问次数，是因为并不是每次key被访问都计数，而是通过运算：

* 生成0~1之间的随机数R
* 计算 (旧次数 * lfu_log_factor + 1)，记录为P
* 如果 R < P ，则计数器 + 1，且最大不超过255
* 访问次数会随时间衰减，距离上一次访问时间每隔 lfu_decay_time 分钟，计数器 -1

![image-20221115020645066](http://minio.botuer.com/study-node/old/image-20221115020645066.png)
