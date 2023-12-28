# JSF

[JSF十分钟入门指南 - 京东微服务团队 - 主页面 (jd.com)](https://cf.jd.com/pages/viewpage.action?pageId=245188427)

依赖

```xml
<dependency>
    <groupId>com.jd</groupId>
    <artifactId>jsf</artifactId>
    <version>最新版本</version>
</dependency>
```

接口
```java
package com.jd.testjsf;
  
public interface HelloService {
    public String echoStr(String str);
}
```
实现类
```java
package com.jd.testjsf;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
  
public class HelloServiceImpl implements HelloService {
    private static Logger logger = LoggerFactory.getLogger(HelloServiceImpl.class);
    @Override
    public String echoStr(String str) {
        logger.info("server get request : {}", str);
        return str;
    }
}
```
提供者
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:jsf="http://jsf.jd.com/schema/jsf"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
    http://jsf.jd.com/schema/jsf http://jsf.jd.com/schema/jsf/jsf.xsd">
    <!-- 实现类 -->
    <bean id="helloServiceImpl" class="com.jd.testjsf.HelloServiceImpl" />
  
    <!-- #测试index服务地址   index="test.i.jsf.jd.local"   -->
    <jsf:registry id="jsfRegistry" protocol="jsfRegistry" index="i.jsf.jd.com" />
    <!-- 服务端 -->
    <jsf:server id="jsf" protocol="jsf"/>
    <!-- 发布服务 alias可以改成自己的 -->
    <jsf:provider id="helloService" interface="com.jd.testjsf.HelloService" alias="CHANGE-IT"
                 ref="helloServiceImpl" server="jsf" >
    </jsf:provider>
</beans>
```

启动提供者

```java
package com.jd.testjsf;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.support.ClassPathXmlApplicationContext;
  
public class ServerMain {
  
    private final static Logger LOGGER = LoggerFactory.getLogger(ServerMain.class);
  
    public static void main(String[] args) {
        ClassPathXmlApplicationContext appContext = new ClassPathXmlApplicationContext("/jsf-provider.xml");
        LOGGER.info("服务端启动完成！");
          
        // 启动本地服务，然后hold住本地服务
        synchronized (ServerMain.class) {
            while (true) {
                try {
                    ServerMain.class.wait();
                } catch (InterruptedException e) {
                }
            }
        }
    }
}
```

调用服务

> 引入接口类：
>
> 一般为服务发布者将接口打成jar包，上传到公司的maven私服给服务调用者。
>
> 或者直接将接口类告诉服务调用者。
>
> **请注意：服务匹配是依靠 interface（接口） 以及 alias（别名）两个配置来完成的；**
>
> 也就是说调用端（Service Consumer）必须与服务端（Service Provider）的interface 与alias 属性配置必须完全一致，否则调用时会收到一个No Provider（没有服务提供者）的错误！

消费者 **jsf-consumer.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:jsf="http://jsf.jd.com/schema/jsf"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
    http://jsf.jd.com/schema/jsf http://jsf.jd.com/schema/jsf/jsf.xsd">
    <!-- 注册中心  11.50.59.166 i.jsf.jd.com  #测试index服务地址 -->
    <jsf:registry id="jsfRegistry" protocol="jsfRegistry" index="i.jsf.jd.com"/>
    <!-- 服务调用者配置 直连使用 url="jsf://10.12.113.111:22000;jsf://10.12.113.112:22000" -->
    <jsf:consumer id="helloService" interface="com.jd.testjsf.HelloService"
                   protocol="jsf" alias="CHANGE-IT" timeout="10000" >
    </jsf:consumer>
</beans>
```

消费

> 可以通过applicationContext.getBean(name)获取，也可以使用spring的getter/setter注入，也可以使用@AutoWired或者@Resource注入。3. 注入到代码中进行调用
>
> 下面的例子是通过getBean注入的： **ClientMain**

```java
package com.jd.testjsf;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.support.ClassPathXmlApplicationContext;
  
public class ClientMain {
  
    private final static Logger LOGGER = LoggerFactory.getLogger(ClientMain.class);
  
    public static void main(String[] args) {
        ClassPathXmlApplicationContext appContext = new ClassPathXmlApplicationContext("/jsf-consumer.xml");
        HelloService service = (HelloService) appContext.getBean("helloService");
        LOGGER.info("得到调用端代理：{}", service);
        while (true) {
            try {
                String result = service.echoStr("zhanggeng put");
                LOGGER.info("response msg from server :{}", result);
            } catch (Exception e) {
                LOGGER.error(e.getMessage(), e);
            }
            try {
                Thread.sleep(2000);
            } catch (Exception e) {
            }
        }
        // JSFContext.destroy();
    }
}
```

