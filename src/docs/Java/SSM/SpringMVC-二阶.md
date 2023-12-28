# SpringMVC二阶

## Spring

### IOC

#### 接口

##### BeanFactory

> 表面上只有 getBean
>
> 实际上控制反转、基本的依赖注入、直至 Bean 的生命周期的各种功能，都由它的实现类提供
>
> 例子中通过反射查看了它的成员变量 singletonObjects，内部包含了所有的单例 bean

- beanFactory 可以通过 registerBeanDefinition 注册一个 bean definition 对象
  * 我们平时使用的配置类、xml、组件扫描等方式都是生成 bean definition 对象注册到 beanFactory 当中
  * bean definition 描述了这个 bean 的创建蓝图：scope 是什么、用构造还是工厂创建、初始化销毁方法是什么，等等
- beanFactory 需要手动调用 beanFactory 后处理器对它做增强
  * 例如通过解析 @Bean、@ComponentScan 等注解，来补充一些 bean definition
- beanFactory 需要手动添加 bean 后处理器，以便对后续 bean 的创建过程提供增强
  * 例如 @Autowired，@Resource 等注解的解析都是 bean 后处理器完成的
  * bean 后处理的添加顺序会对解析结果有影响，见视频中同时加 @Autowired，@Resource 的例子
- beanFactory 需要手动调用方法来初始化单例
- beanFactory 需要额外设置才能解析 ${} 与 #{}

##### ApplicationContext 

ApplicationContext 接口，是 BeanFactory 的子接口。它扩展了 BeanFactory 接口的功能，如：

* 国际化
* 通配符方式获取一组 Resource 资源
* 整合 Environment 环境（能通过它获取各种来源的配置信息）
* 事件发布与监听，实现组件之间的解耦

##### 国际化

```java
public class TestMessageSource {
    public static void main(String[] args) {
        GenericApplicationContext context = new GenericApplicationContext();

        context.registerBean("messageSource", MessageSource.class, () -> {
            ResourceBundleMessageSource ms = new ResourceBundleMessageSource();
            ms.setDefaultEncoding("utf-8");
            ms.setBasename("messages");
            return ms;
        });

        context.refresh();

        System.out.println(context.getMessage("hi", null, Locale.ENGLISH));
        System.out.println(context.getMessage("hi", null, Locale.CHINESE));
        System.out.println(context.getMessage("hi", null, Locale.JAPANESE));
    }
}
```

国际化文件均在 src/resources 目录下

messages.properties（空）

messages_en.properties

```properties
hi=Hello
```

messages_ja.properties

```properties
hi=こんにちは
```

messages_zh.properties

```properties
hi=你好
```

> ***注意***
>
> * ApplicationContext 中 MessageSource bean 的名字固定为 messageSource
> * 使用 SpringBoot 时，国际化文件名固定为 messages
> * 空的 messages.properties 也必须存在

#### 实现

* DefaultListableBeanFactory，是 BeanFactory 最重要的实现，像**控制反转**和**依赖注入**功能，都是它来实现
* ClassPathXmlApplicationContext，从类路径查找 XML 配置文件，创建容器（旧）
* FileSystemXmlApplicationContext，从磁盘路径查找 XML 配置文件，创建容器（旧）
* XmlWebApplicationContext，传统 SSM 整合时，基于 XML 配置文件的容器（旧）
* AnnotationConfigWebApplicationContext，传统 SSM 整合时，基于 java 配置类的容器（旧）
* AnnotationConfigApplicationContext，Spring boot 中非 web 环境容器（新）
* AnnotationConfigServletWebServerApplicationContext，Spring boot 中 servlet web 环境容器（新）
* AnnotationConfigReactiveWebServerApplicationContext，Spring boot 中 reactive web 环境容器（新）

> 后面这些带有 ApplicationContext 的类都是 ApplicationContext 接口的实现，但它们是**组合**了 DefaultListableBeanFactory 的功能，并非继承而来

#### Bean后置处理器

> 1. 实现了 PriorityOrdered 接口的优先级最高
> 2. 实现了 Ordered 接口与加了 @Order 注解的平级, 按数字升序
> 3. 其它的排在最后

创建前后的增强

* postProcessBeforeInstantiation
  * 这里返回的对象若不为 null 会替换掉原本的 bean，并且仅会走 postProcessAfterInitialization 流程
* postProcessAfterInstantiation
  * 这里如果返回 false 会跳过依赖注入阶段

依赖注入前的增强

* postProcessProperties
  * 如 @Autowired、@Value、@Resource 

初始化前后的增强

* postProcessBeforeInitialization
  * 这里返回的对象会替换掉原本的 bean
  * 如 @PostConstruct、@ConfigurationProperties
* postProcessAfterInitialization 
  * 这里返回的对象会替换掉原本的 bean
  * 如代理增强

销毁之前的增强

* postProcessBeforeDestruction
  * 如 @PreDestroy 

##### Autowired

* AutowiredAnnotationBeanPostProcessor 解析 @Autowired 与 @Value
* CommonAnnotationBeanPostProcessor 解析 @Resource、@PostConstruct、@PreDestroy
* ConfigurationPropertiesBindingPostProcessor 解析 @ConfigurationProperties
*  ContextAnnotationAutowireCandidateResolver 负责获取 @Value 的值，解析 @Qualifier、泛型、@Lazy 等





### AOP





## HTTP协议

- 概念	Hyper Text Transfer Protocol 超文本传输协议
  - 传输协议：定义了，客户端和服务器端通信时，发送数据的格式

- 特点：
  	1. 基于TCP/IP的高级协议
  	2. 默认端口号:80
  	3.  基于请求/响应模型的:一次请求对应一次响应
  	4. 无状态的：每次请求之间相互独立，不能交互数据

### 请求

   - 请求行
     - GET /login.html	HTTP/1.1
     - 请求方式  url  协议/版本

   - 请求头：浏览器告诉服务器一些信息，以键值对形式呈现，请求头名: 请求头值
     - User-Agent：浏览器版本信息（解决浏览器的兼容性问题）
     - Referer：我从哪里来http://localhost/login.html（防盗链、统计）

   - 请求空行

   - 请求体：封装POST请求消息的请求参数的（post特有）

### 响应

   - 响应行
     - 协议/版本 响应状态码 状态码描述
   - 响应头
     - Content-Type：响应体数据格式以及编码格式
     - Content-disposition：什么格式打开响应体数据
       - in-line:默认值,在当前页面内打开，
       - attachment;filename=xxx：以附件形式打开响应体。用于文件下载弹窗
   - 响应空行
   - 响应体

- 响应状态码（都是3位数字 ）
  - 1xx：服务器就收客户端消息，但没有接受完成，等待一段时间后，发送1xx多状态码
  - 2xx：成功。代表：200
  - 3xx：重定向。代表：302(重定向)，304(访问缓存)
  - 4xx：客户端错误。
    * 400：请求参数错误
    * 404：请求路径没有对应的资源
    * 405：请求方式没有对应的doXxx方法
  - 5xx：服务器端错误。代表：500(服务器内部出现异常)

## JavaWeb

### Servlet

**概念**：运行在服务器端的小程序
	Servlet就是一个接口，定义了Java类被浏览器访问到(tomcat识别)的规则。
	将来我们自定义一个类，实现Servlet接口，重写方法。

- 静态资源【html/css/js/img】 --- /Web应用名称/静态资源本身的路径
- 动态资源【jsp/sevrlet】 --- /Web应用名称/虚拟路径

**步骤**

1. 创建JavaEE项目

2. 定义一个类，实现Servlet接口

   * public class ServletDemo1 implements Servlet

3. 实现接口中的抽象方法

4. 配置Servlet
   在web.xml中配置   或   注解配置（Servlet3.0）（@WebServlet("资源路径")）

   ```xml
   <!--配置Servlet -->
   <servlet>
       <servlet-name>demo1</servlet-name>
       <servlet-class>cn.itcast.web.servlet.ServletDemo1</servlet-class>
   </servlet>
   
   <servlet-mapping>
       <servlet-name>demo1</servlet-name>
       <url-pattern>/demo1</url-pattern>
   </servlet-mapping>
   ```

**资源路径**

   1. urlpartten:Servlet访问路径

      一个Servlet可以定义多个访问路径 ： @WebServlet({"/d4","/dd4","/ddd4"})

   2. 路径定义规则：

      - /xxx：路径匹配
      - /xxx/xxx:多层路径，目录结构
      - *.xxx：扩展名匹配（扩展名任意写）

> 相对路径
>
> - 与当前资源的相对位置
> - 以./xxx  	  ../xxx  	  xxx开头
>
> **绝对路径（推荐）**
>
> - 可确定唯一资源
> - 以/开头
> - 给客户端浏览器使用：需要加虚拟目录(项目的访问路径)
>   - 建议虚拟目录动态获取：request.getContextPath()
>   - `<a>` , `<form>` 重定向...
> - 给服务器使用：不需要加虚拟目录
>   - 转发路径

#### 执行原理

1. 当服务器接受到客户端浏览器的请求后，会解析请求URL路径，获取访问的Servlet的资源路径
2. 查找web.xml文件，是否有对应的`<url-pattern>`标签体内容。
3. 如果有，则在找到对应的`<servlet-class>`全类名
4. tomcat会将字节码文件加载进内存，并且创建其对象
5. 调用其方法

> - 默认情况下：Servlet在**第一次接收到请求**的时候才创建对象
> - 创建对象后，所有的URL地址匹配的请求都由这同一个对象来处理
> - Tomcat中，每一个请求会被分配一个线程来处理，所以可以说：Servlet是**单实例，多线程**方式运行的。
> - 既然Servlet是多线程方式运行，所以有线程安全方面的可能性，所以不能在处理请求的方法中修改公共属性

#### 生命周期

Servlet中的生命周期方法：

1. 被创建：执行init方法，只执行一次

   * Servlet什么时候被创建？

     默认情况下，第一次被访问时，Servlet被创建

   - 可以配置执行Servlet的创建时机。

     在`<servlet>`标签下配置

     - **第一次被访问时，创建 `<load-on-startup>`的值为负数**

     - **在服务器启动时，创建`<load-on-startup>`的值为0或正整数**

   * Servlet的**init**方法，只执行一次，说明一个Servlet在内存中只存在一个对象，Servlet是单例的

   * 多个用户同时访问时，可能存在线程安全问题。
     解决：尽量不要在Servlet中定义成员变量。即使定义了成员变量，也不要对修改值

2. 提供服务：执行**service**方法，执行多次
   	每次访问Servlet时，Service方法都会被调用一次。

3. 被销毁：执行**destroy**方法，只执行一次

   * Servlet被销毁时执行。服务器关闭时，Servlet被销毁
   * 只有服务器正常关闭时，才会执行destroy方法。
   * destroy方法在Servlet被销毁之前执行，一般用于释放资源

#### 体系结构	

​	Servlet -- 接口
​		|
​	GenericServlet -- 抽象类（只需重写service方法）
​		|
​	**HttpServlet  -- 实现类（重写doGet/doPos方法）**

> * GenericServlet：将Servlet接口中其他的方法做了默认空实现，只将service()方法作为抽象
>   * 定义Servlet类时，继承GenericServlet，实现service()方法即可
>
> * **HttpServlet**：对http协议的一种封装，简化操作
>   1. 定义类继承HttpServlet
>   2. 复写doGet/doPost方法

#### ServletConfig

接口方法介绍

| 方法名                  | 作用                                                         |
| ----------------------- | ------------------------------------------------------------ |
| getServletName()        | 获取`<servlet-name>`HelloServlet`</servlet-name>`定义的Servlet名称 |
| **getServletContext()** | 获取ServletContext对象                                       |
| getInitParameter()      | 获取配置Servlet时设置的『初始化参数』，根据名字获取值        |
| getInitParameterNames() | 获取所有初始化参数名组成的Enumeration对象                    |

初始化参数举例

```xml
<!-- 配置Servlet本身 -->
<servlet>
    <!-- 全类名太长，给Servlet设置一个简短名称 -->
    <servlet-name>HelloServlet</servlet-name>

    <!-- 配置Servlet的全类名 -->
    <servlet-class>com.atguigu.servlet.HelloServlet</servlet-class>

    <!-- 配置初始化参数 -->
    <init-param>
        <param-name>goodMan</param-name>
        <param-value>me</param-value>
    </init-param>

    <!-- 配置Servlet启动顺序 -->
    <load-on-startup>1</load-on-startup>
</servlet>
```

```java
public class HelloServlet implements Servlet {

    // 声明一个成员变量，用来接收init()方法传入的servletConfig对象
    private ServletConfig servletConfig;

    public HelloServlet(){
        System.out.println("我来了！HelloServlet对象创建！");
    }

    @Override
    public void init(ServletConfig servletConfig) throws ServletException {

        System.out.println("HelloServlet对象初始化");

        // 将Tomcat调用init()方法时传入的servletConfig对象赋值给成员变量
        this.servletConfig = servletConfig;

    }

    @Override
    public ServletConfig getServletConfig() {

        // 返回成员变量servletConfig，方便使用
        return this.servletConfig;
    }

    @Override
    public void service(ServletRequest servletRequest, ServletResponse servletResponse) throws ServletException, IOException {

        // 控制台打印，证明这个方法被调用了
        System.out.println("我是HelloServlet，我执行了！");

        // 返回响应字符串
        // 1、获取能够返回响应数据的字符流对象
        PrintWriter writer = servletResponse.getWriter();

        // 2、向字符流对象写入数据
        writer.write("Hello,I am Servlet");

        // =============分割线===============
        // 测试ServletConfig对象的使用
        // 1.获取ServletConfig对象：在init()方法中完成
        System.out.println("servletConfig = " + servletConfig.getClass().getName());

        // 2.通过servletConfig对象获取ServletContext对象
        ServletContext servletContext = this.servletConfig.getServletContext();
        System.out.println("servletContext = " + servletContext.getClass().getName());

        // 3.通过servletConfig对象获取初始化参数
        Enumeration<String> enumeration = this.servletConfig.getInitParameterNames();
        while (enumeration.hasMoreElements()) {
            String name = enumeration.nextElement();
            System.out.println("name = " + name);

            String value = this.servletConfig.getInitParameter(name);
            System.out.println("value = " + value);
        }
    }

    @Override
    public String getServletInfo() {
        return null;
    }

    @Override
    public void destroy() {
        System.out.println("HelloServlet对象即将销毁，现在执行清理操作");
    }
}
```

#### ServletContext

**ServletContext接口是ServletConfig接口的升级**

- 概念：服务器会为每一个工程创建一个对象，这个对象就是ServletContext对象。这个对象**全局（WEB应用）唯一（单例）**，而且工程内部的所有servlet都共享这个对象。所以叫全局应用程序共享对象，代表整个web应用，可以和程序的容器(服务器)来通信

- 获取：
  request.getServletContext();
  this.getServletContext();

- 功能：

   	1. 获取MIME类型：String    getMimeType(String filename)  
        * MIME类型:在互联网通信过程中定义的一种文件数据类型
          * 格式： 大类型/小类型   text/html		image/jpeg

   2. 获取整个Web应用级别的初始化参数：getInitParameter()

   3. 域对象：共享数据

      1. setAttribute(String name,Object value)
      2. getAttribute(String name)
      3. removeAttribute(String name)

      ServletContext对象范围：所有用户所有请求的数据

   4. 获取文件的真实(服务器)路径     String getRealPath(String path)  

      - 能放文件的地方有三个
      - web目录下资源访问 context.getRealPath("/b.txt")
      - WEB-INF目录下的资源访问 context.getRealPath("/WEB-INF/c.txt")
      - src目录下的资源访问context.getRealPath("/WEB-INF/classes/a.txt")

#### Request

**体系结构**

ServletRequest		--	接口
		|	继承
HttpServletRequest	-- 接口
		|	实现
org.apache.catalina.connector.RequestFacade 类(tomcat)

**获取请求数据**

| 1. 获取请求行数据                    |                                      |
| ------------------------------------ | ------------------------------------ |
| String getMethod()                   | 获取请求方式                         |
| **String getContextPath()**          | **获取虚拟目录(*)**                  |
| String getServletPath()              | 获取资源路径                         |
| String getQueryString()              | 获取get方式请求参数                  |
| **String getRequestURI()**           | **获取请求URI(*)**                   |
| StringBuffer getRequestURL()         | 获取请求URL                          |
| String getProtocol()                 | 获取协议及版本                       |
| String getRemoteAddr()               | 获取客户机的IP地址                   |
| **2. 获取请求头数据**                |                                      |
| **String getHeader(String name)**    | **通过请求头的名称获取请求头的值**   |
| Enumeration`<String>` getHeaderNames() | 获取所有的请求头名称                 |
| **3. 获取请求体数据**                |                                      |
| BufferedReader getReader()           | 获取字符输入流，只能操作字符数据     |
| ServletInputStream getInputStream()  | 获取字节输入流，可以操作所有类型数据 |


**获取请求参数通用方式：不论get还是post请求方式都可以使用下列方法来获取请求参数**

| String getParameter(String name)         | 根据参数名称获取参数值                                       |
| ---------------------------------------- | ------------------------------------------------------------ |
| String[] getParameterValues(String name) | 根据参数名称获取参数值的数组                                 |
| Enumeration`<String>` getParameterNames()  | 获取所有请求的参数名称（返回值类型类似迭代器），多个值的只能返回一个结果 |
| Map`<String,String[]>` getParameterMap()   | 获取所有参数的map集合                                        |

**常用总结**

| request.setCharacterEncoding("utf-8")        | 解决中文乱码问题                   |
| -------------------------------------------- | ---------------------------------- |
| **String getContextPath()**                  | **获取虚拟目录(*)**                |
| **String getRequestURI()**                   | **获取请求URI(*)**                 |
| **String getHeader(String name)**            | **通过请求头的名称获取请求头的值** |
| **String getParameter(String name)**         | **根据参数名称获取参数值**         |
| **String[] getParameterValues(String name)** | **根据参数名称获取参数值的数组**   |
| **Map`<String,String[]>` getParameterMap()**   | **获取所有参数的map集合**          |

```java
//判断浏览器版本
String agent = req.getHeader("user-agent");
System.out.println(agent);
if (agent.contains("Chrome")) {
    System.out.println("谷歌谷歌你最棒");
}else if (agent.contains("Firefox")){
    System.out.println("火狐来了...");
}
```

```java
//防盗链
String referer = req.getHeader("Referer");
if (referer != null) {
    if (referer.contains("/XML")){
        System.out.println("播放.........");
    }else{
        System.out.println("滚...........");
    }
}
```

```html
<a href="/XML/demo2">看电影</a>
```

**转发（forward）**

- 步骤
  - 通过request对象获取请求转发器RequestDispatcher对象
  - 使用RequestDispatcher对象来进行转发
- 特点
  - 浏览器地址栏路径不发生变化
  - 只能转发到当前服务器内部资源中
  - 转发是一次请求

```java
//demo3
req.setAttribute("name","张三");
req.getRequestDispatcher("/demo4").forward(req,resp);
```

```java
//demo4
req.getAttribute("name")
```

**共享数据**

- 域对象：一个有作用范围的对象，可以在范围内共享数据
- request域：代表一次请求的范围，一般用于请求转发的多个资源中共享数据
- 方法
  - void setAttribute(String name,Object obj)  存储数据
  - Object getAttitude(String name)   通过键获取值
  - void removeAttribute(String name):通过键移除键值对

#### Response

**设置响应消息**

- 设置状态码：setStatus(int sc) 

- 设置响应头：setHeader(String name, String value) 

- 设置响应体

  - 获取输出流：

    > 字符输出流：PrintWriter getWriter()
    >
    > 字节输出流：ServletOutputStream getOutputStream()

  - 使用输出流，将数据输出到客户端浏览器

**重定向（redirect）**

- response.sendRedirect("路径");

- 重定向的特点:redirect

  - 地址栏发生变化
  - 可以访问其他站点(服务器)的资源
  - **两次请求，不能使用request对象来共享数据**

  ```java
  //respdemo1
  req.setAttribute("name","张三");
  String contextPath = req.getContextPath();
  resp.sendRedirect(contextPath + "/respdemo2");
    //resp.sendRedirect("https://www.baidu.com/");
  System.out.println(req.getAttribute("name"));
  ```

  ```java
  //respdemo2
  System.out.println(req.getAttribute("name"));		//输出null（数据不共享）
  ```

**输出到浏览器**

- 字符

  - 乱码问题，设置字符集resp.setContentType("text/html;charset=utf-8");

  - 获取输出流resp.getWriter();

  - 输出数据pw.write("你好啊啊啊 response");

    ```java
    resp.setContentType("text/html;charset=utf-8");
    PrintWriter pw = resp.getWriter();
    pw.write("就安静安静安静骄傲");	
    ```

- 字节

  - 设置字符集

  - 获取输出流resp.getOutputStream();

  - 输出数据sos.write("你好".getBytes("utf-8"));

    ```java
    resp.setContentType("text/html;charset=utf-8");
    ServletOutputStream sos = resp.getOutputStream();
    sos.write("你好！".getBytes("utf-8"));
    ```

#### Cookie

- 会话：一次会话中包含多次请求和响应。
  - 一次会话：浏览器第一次给服务器资源发送请求，会话建立，直到有一方断开为止
- 功能：在一次会话的范围内的多次请求间，共享数据
- 方式：
  	1. 客户端会话技术：Cookie
  	2. 服务器端会话技术：Session

- 客户端会话技术，将数据保存到客户端

- 步骤

  - 创建Cookie对象，绑定数据  new Cookie(String name, String value) 
  - 发送Cookie对象   response.addCookie(Cookie cookie) 
  - 获取Cookie，拿到数据  Cookie[]  request.getCookies()  

- 实现原理：基于响应头set-cookie和请求头cookie实现

- 注意事项

  - 一次可以发送多个cookie，response调用多次addCookie方法发送cookie即可
  - cookie在浏览器中保存时间
    - 默认浏览器关闭，Cookie销毁
    - 持久化setMaxAge(int seconds)
      - 参数为正：在硬盘中存储时间
      - 参数为负：默认，关闭浏览器销毁
      - 参数为〇：删除Cookie
  - tomcat 8 之后支持中文，但特殊字符需要采用URL编码存储，URL解码解析
  - 数据共享
    - 同服务器，不同项目的共享：setPath（"/"）
    - 不同服务器的共享：setDomain("相同的一级域名")  如：setDomain(".baidu.com")

- 特点和作用

  - 浏览器对于单个cookie 的大小有限制(4kb) 以及 对同一个域名下的总cookie数量也有限制(20个)
  - 用于存储少量的不太敏感的数据，在不登录的情况下，完成服务器对客户端的身份识别

- Cookie的domain和path

  > 上网时间长了，本地会保存很多Cookie。对浏览器来说，访问互联网资源时不能每次都把所有Cookie带上。浏览器会使用Cookie的domain和path属性值来和当前访问的地址进行比较，从而决定是否携带这个Cookie

#### Session

- 概念：服务器端会话技术，在一次会话的多次请求间共享数据，将数据保存在服务器端的对象中。HttpSession

- 步骤

  - 获取HttpSession对象：request.getSession();
  - 使用HttpSession对象：
    - Object getAttribute(String name)  
    - void setAttribute(String name, Object value)
    - void removeAttribute(String name)  

- 实现原理：Session的实现是依赖于Cookie的。创建session对象时会创建一个cookie，键为JSESSIONID（值为随机的一个id），每次请求的请求头都会携带写个cookie，实现数据共享

- 注意事项

  - 当客户端关闭后，服务器不关闭，默认不能获取同一个session

    创建Cookie,键为JSESSIONID，设置最大存活时间，让cookie持久化保存。
    			 Cookie c = new Cookie("JSESSIONID",session.getId());
    	         c.setMaxAge(60*60);
    	         response.addCookie(c);

  - 客户端不关闭，服务器关闭后，默认不能获取同一个session，但是要确保数据不丢失。tomcat自动完成以下工作，虽然地址值不同，但数据相同（idea只会钝化，数据丢失，真正部署时直接在tomcat上进行）

    - session的钝化：

      在服务器正常关闭之前，将session对象系列化到硬盘上（【work】文件夹中）

    - session的活化：
      在服务器启动后，将session文件转化为内存中的session对象即可

  - session的销毁

    - 服务器关闭

    - session对象调用invalidate() 

    - session默认失效时间 30分钟

      选择性配置修改	
      			`<session-config>`
      		        `<session-timeout>`30`</session-timeout>`
      		    `</session-config>`

- session的特点：存在服务器端，可以存储任意类型，任意大小的数据，数据安全



### Filter

- 过滤器：一般用于完成通用的操作。如：登录验证、统一编码处理、敏感字符过滤...

  - 定义一个类，实现接口Filter

  - 复写方法

  - 配置拦截路径

    - web.xml
    - 注解

  - 过滤器执行流程
    	1. 执行过滤器

    2. 执行放行后的资源
       3. 回来执行过滤器放行代码下边的代码

  - 过滤器生命周期方法

    - init
    - doFilter（req,resp，filterChain）:每一次请求被拦截资源时，会执行。执行多次
      - filterChain.doFilter(req,resp)   放行
    - destroy

  - 拦截路径

    - 具体资源路径： /index.jsp
    - 拦截目录： /user/*
    - 后缀名拦截： *.jsp
    - 拦截所有资源：/*

  - 拦截方式

    - 设置dispatcherTypes属性

      > REQUEST：默认值。浏览器直接请求资源
      >
      > FORWARD：转发访问资源
      >
      > INCLUDE：包含访问资源
      >
      > ERROR：错误跳转资源
      >
      > ASYNC：异步访问资源

      > web.xml配置设置`<dispatcher>``</dispatcher>`标签即可

      ```xml
      <filter>
          <filter-name>demo1</filter-name>
          <filter-class>cn.itcast.web.filter.FilterDemo1</filter-class>
      </filter>
      <filter-mapping>
          <filter-name>demo1</filter-name>
          <url-pattern>/*</url-pattern>
          <dispatcher></dispatcher>
      </filter-mapping>
      ```

  - 过滤器链(配置多个过滤器)

    - 执行顺序：过滤器1 --- 过滤器2 ---资源执行 --- 过滤器2 --- 过滤器1
    - 注解配置：按照类名的字符串比较规则比较，值小的先执行
    - web.xml配置： `<filter-mapping>`谁定义在上边，谁先执行

### Listener

- 概念

  事件监听机制
  		事件	：一件事情
  		事件源 ：事件发生的地方
  		监听器 ：一个对象
  		注册监听：将事件、事件源、监听器绑定在一起。 当事件源上发生某个事件后，执行监听器代码

- 步骤

  - 定义一个类，实现监听器接口

- 复写方法

  - 配置

    - web.xml
  - 注解@WebListener

#### 监听域对象的创建、销毁

- **ServletContextListener**:监听ServletContext对象的创建和销毁

  | 方法名                                      | 作用                     |
  | ------------------------------------------- | ------------------------ |
  | contextInitialized(ServletContextEvent sce) | ServletContext创建时调用 |
  | contextDestroyed(ServletContextEvent sce)   | ServletContext销毁时调用 |

- **HttpSessionListener**：监听HttpSession对象的创建与销毁

  | 方法名                                 | 作用                      |
  | -------------------------------------- | ------------------------- |
  | sessionCreated(HttpSessionEvent hse)   | HttpSession对象创建时调用 |
  | sessionDestroyed(HttpSessionEvent hse) | HttpSession对象销毁时调用 |

- **ServletRequestListener**：监听ServletRequest对象的创建与销毁

  | 方法名                                      | 作用                         |
  | ------------------------------------------- | ---------------------------- |
  | requestInitialized(ServletRequestEvent sre) | ServletRequest对象创建时调用 |
  | requestDestroyed(ServletRequestEvent sre)   | ServletRequest对象销毁时调用 |

#### 监听域对象的属性

- **ServletContextAttributeListener**：监听ServletContext中属性的创建、修改和销毁

  | 方法名                                               | 作用                                 |
  | ---------------------------------------------------- | ------------------------------------ |
  | attributeAdded(ServletContextAttributeEvent scab)    | 向ServletContext中添加属性时调用     |
  | attributeRemoved(ServletContextAttributeEvent scab)  | 从ServletContext中移除属性时调用     |
  | attributeReplaced(ServletContextAttributeEvent scab) | 当ServletContext中的属性被修改时调用 |

  > ServletContextAttributeEvent对象代表属性变化事件，它包含的方法如下：
  >
  > | 方法名              | 作用                     |
  > | ------------------- | ------------------------ |
  > | getName()           | 获取修改或添加的属性名   |
  > | getValue()          | 获取被修改或添加的属性值 |
  > | getServletContext() | 获取ServletContext对象   |

- **HttpSessionAttributeListener**：监听HttpSession中属性的创建、修改和销毁

  | 方法名                                        | 作用                              |
  | --------------------------------------------- | --------------------------------- |
  | attributeAdded(HttpSessionBindingEvent se)    | 向HttpSession中添加属性时调用     |
  | attributeRemoved(HttpSessionBindingEvent se)  | 从HttpSession中移除属性时调用     |
  | attributeReplaced(HttpSessionBindingEvent se) | 当HttpSession中的属性被修改时调用 |

  > HttpSessionBindingEvent对象代表属性变化事件，它包含的方法如下：
  >
  > | 方法名       | 作用                          |
  > | ------------ | ----------------------------- |
  > | getName()    | 获取修改或添加的属性名        |
  > | getValue()   | 获取被修改或添加的属性值      |
  > | getSession() | 获取触发事件的HttpSession对象 |

- ServletRequestAttributeListener：监听ServletRequest中属性的创建、修改和销毁

  | 方法名                                               | 作用                                 |
  | ---------------------------------------------------- | ------------------------------------ |
  | attributeAdded(ServletRequestAttributeEvent srae)    | 向ServletRequest中添加属性时调用     |
  | attributeRemoved(ServletRequestAttributeEvent srae)  | 从ServletRequest中移除属性时调用     |
  | attributeReplaced(ServletRequestAttributeEvent srae) | 当ServletRequest中的属性被修改时调用 |

  > ServletRequestAttributeEvent对象代表属性变化事件，它包含的方法如下：
  >
  > | 方法名               | 作用                             |
  > | -------------------- | -------------------------------- |
  > | getName()            | 获取修改或添加的属性名           |
  > | getValue()           | 获取被修改或添加的属性值         |
  > | getServletRequest () | 获取触发事件的ServletRequest对象 |

#### 监听Session对象的属性值

- HttpSessionBindingListener：监听某个对象在Session域中的创建与移除

  | 方法名                                      | 作用                              |
  | ------------------------------------------- | --------------------------------- |
  | valueBound(HttpSessionBindingEvent event)   | 该类的实例被放到Session域中时调用 |
  | valueUnbound(HttpSessionBindingEvent event) | 该类的实例从Session中移除时调用   |

  > HttpSessionBindingEvent对象代表属性变化事件，它包含的方法如下：
  >
  > | 方法名       | 作用                          |
  > | ------------ | ----------------------------- |
  > | getName()    | 获取当前事件涉及的属性名      |
  > | getValue()   | 获取当前事件涉及的属性值      |
  > | getSession() | 获取触发事件的HttpSession对象 |

- HttpSessionActivationListener：监听某个对象在Session中的序列化与反序列化。

  | 方法名                                    | 作用                                  |
  | ----------------------------------------- | ------------------------------------- |
  | sessionWillPassivate(HttpSessionEvent se) | 该类实例和Session一起钝化到硬盘时调用 |
  | sessionDidActivate(HttpSessionEvent se)   | 该类实例和Session一起活化到内存时调用 |

- 

  方法名

## SpringMVC

### 准备

#### 依赖

```xml
<dependencies>
    <!-- SpringMVC -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>5.3.1</version>
    </dependency>

    <!-- 日志 -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.2.3</version>
    </dependency>

    <!-- ServletAPI -->
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>3.1.0</version>
        <scope>provided</scope>
    </dependency>

    <!-- Spring5和Thymeleaf整合包 -->
    <dependency>
        <groupId>org.thymeleaf</groupId>
        <artifactId>thymeleaf-spring5</artifactId>
        <version>3.0.12.RELEASE</version>
    </dependency>
</dependencies>
```

#### 配置web.xml

> 在WEB-INFO下

```xml
<!-- 配置SpringMVC的前端控制器，对浏览器发送的请求统一进行处理 -->
<servlet>
    <servlet-name>springMVC</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <!-- 通过初始化参数指定SpringMVC配置文件的位置和名称 -->
    <init-param>
        <!-- contextConfigLocation为固定值 -->
        <param-name>contextConfigLocation</param-name>
        <!-- 使用classpath:表示从类路径查找配置文件，例如maven工程中的src/main/resources -->
        <param-value>classpath:springMVC.xml</param-value>
    </init-param>
    <!-- 
 		作为框架的核心组件，在启动过程中有大量的初始化操作要做
		而这些操作放在第一次请求时才执行会严重影响访问速度
		因此需要通过此标签将启动控制DispatcherServlet的初始化时间提前到服务器启动时
	-->
    <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
    <servlet-name>springMVC</servlet-name>
    <!--
        设置springMVC的核心控制器所能处理的请求的请求路径
        只能请求静态资源，不能请求动态资源（jsp）
    -->
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

> `<url-pattern>`标签中使用**/和/*的区别**：
>
> - /只能匹配静态资源，不能匹配动态资源（.jsp请求路径的请求）
>
> - 因此就可以避免在访问jsp页面时，该请求被DispatcherServlet处理，从而找不到相应的页面
>
> - /*则能够匹配所有请求

#### 配置spring-mvc.xml

```xml
<!-- 自动扫描包 -->
<context:component-scan base-package="com.atguigu.mvc.controller"/>

<!-- 配置Thymeleaf视图解析器 -->
<bean id="viewResolver" class="org.thymeleaf.spring5.view.ThymeleafViewResolver">
    <property name="order" value="1"/>
    <property name="characterEncoding" value="UTF-8"/>
    <property name="templateEngine">
        <bean class="org.thymeleaf.spring5.SpringTemplateEngine">
            <property name="templateResolver">
                <bean class="org.thymeleaf.spring5.templateresolver.SpringResourceTemplateResolver">
    
                    <!-- 视图前缀 -->
                    <property name="prefix" value="/WEB-INF/templates/"/>
    
                    <!-- 视图后缀 -->
                    <property name="suffix" value=".html"/>
                    <property name="templateMode" value="HTML5"/>
                    <property name="characterEncoding" value="UTF-8" />
                </bean>
            </property>
        </bean>
    </property>
</bean>

<!-- 
   处理静态资源，例如html、js、css、jpg
  若只设置该标签，则只能访问静态资源，其他请求则无法访问
  此时必须设置<mvc:annotation-driven/>解决问题
 -->
<mvc:default-servlet-handler/>

<!-- 开启mvc注解驱动 -->
<mvc:annotation-driven>
    <mvc:message-converters>
        <!-- 处理响应中文内容乱码 -->
        <bean class="org.springframework.http.converter.StringHttpMessageConverter">
            <property name="defaultCharset" value="UTF-8" />
            <property name="supportedMediaTypes">
                <list>
                    <value>text/html</value>
                    <value>application/json</value>
                </list>
            </property>
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>
```

#### 流程

- 浏览器发送请求，若请求地址符合前端控制器的url-pattern，该请求就会被**前端控制器DispatcherServlet**处理
- 前端控制器会读取SpringMVC的核心配置文件，通过扫描组件找到控制器，将请求地址和控制器中@RequestMapping注解的value属性值进行匹配，若匹配成功，该注解所标识的控制器方法就是处理请求的方法
- 处理请求的方法需要返回一个字符串类型的视图名称，该视图名称会被**视图解析器**解析，加上前缀和后缀组成视图的路径，通过Thymeleaf对视图进行渲染，最终转发到视图所对应页面

### @RequestMapping

#### params属性

> @RequestMapping注解的params属性是一个字符串类型的数组，可以通过四种表达式设置请求参数和请求映射的匹配关系
>
> - "param"：要求请求映射所匹配的请求**必须携带**param请求参数
>
> - "!param"：要求请求映射所匹配的请求必须不能携带param请求参数
>
> - "param=value"：要求请求映射所匹配的请求**必须携带**param请求参数**且**param=value
>
> - "param!=value"：要求请求映射所匹配的请求必须携带param请求参数但是param!=value

```java
@RequestMapping(
        value = {"/testRequestMapping", "/test"}
        ,method = {RequestMethod.GET, RequestMethod.POST}
        ,params = {"username","password!=123456"}
)
public String testRequestMapping(){
    return "success";
}
```

> 若当前请求满足@RequestMapping注解的value和method属性，但是不满足params属性，此时页面回报错400：Parameter conditions "username, password!=123456" not met for actual request parameters: "username={admin}, password={123456}"

#### headers属性

> @RequestMapping注解的headers属性是一个字符串类型的数组，可以通过四种表达式设置请求头信息和请求映射的匹配关系
>
> "header"：要求请求映射所匹配的请求必须携带header请求头信息
>
> "!header"：要求请求映射所匹配的请求必须不能携带header请求头信息
>
> "header=value"：要求请求映射所匹配的请求必须携带header请求头信息且header=value
>
> "header!=value"：要求请求映射所匹配的请求必须携带header请求头信息且header!=value
>
> 若当前请求满足@RequestMapping注解的value和method属性，但是不满足headers属性，此时页面显示404错误，即资源未找到

#### 路径

> - 支持ant风格的路径
>   - ？：表示任意的单个字符
>   - *：表示任意的0个或多个字符
>   - \**：表示任意的一层或多层目录
>   - 注意：在使用\**时，只能使用/**/xxx的方式
>
> - 占位符
>
>   ```java
>   @RequestMapping("/testRest/{id}/{username}")
>   public String testRest(@PathVariable("id") String id, @PathVariable("username") String username){
>       System.out.println("id:"+id+",username:"+username);
>       return "success";
>   }
>   ```

### 请求参数

#### ServletAPI获取

将HttpServletRequest作为控制器方法的形参，此时HttpServletRequest类型的参数表示封装了当前请求的请求报文的对象

```java
@RequestMapping("/testParam")
public String testParam(HttpServletRequest request){
    String username = request.getParameter("username");
    String password = request.getParameter("password");
    System.out.println("username:"+username+",password:"+password);
    return "success";
}
```

#### 形参获取

- 同名形参

  > 在控制器方法的形参位置，设置和请求参数**同名的形参**，当浏览器发送请求，匹配到请求映射时，在DispatcherServlet中就会将请求参数赋值给相应的形参
  >
  > - 若请求所传输的请求参数中有**多个同名的请求参数**，此时可以在控制器方法的形参中设置**字符串数组**或者**字符串**类型的形参接收此请求参数
  > - 若使用**字符串数组**类型的形参，此参数的数组中**包含了每一个数据**
  > - 若使用**字符串**类型的形参，此参数的值为每个数据中间使用**逗号拼接**的结果

- 不同命形参

  - @RequestParam是将请求参数和控制器方法的形参创建映射关系，@RequestParam注解一共有三个属性：

    - value：指定为形参赋值的请求参数的参数名

    - required：设置是否必须传输此请求参数，默认值为true（必传）

      > 若没有传输该请求参数，且没有设置defaultValue属性，则页面报错400：Required String parameter 'xxx' is not present；若设置为false，则当前请求不是必须传输value所指定的请求参数，若没有传输，则注解所标识的形参的值为null

    - defaultValue：不管required属性值为true或false，当value所指定的请求参数没有传输或传输的值为""时，则使用默认值为形参赋值

  - @RequestHeader是将请求头信息和控制器方法的形参创建映射关系，@RequestHeader注解一共有三个属性：value、required、defaultValue，用法同@RequestParam

  - @CookieValue是将cookie数据和控制器方法的形参创建映射关系，@CookieValue注解一共有三个属性：value、required、defaultValue，用法同@RequestParam

#### pojo获取

- 表单，参数名和属性名必须对应，直接解析
- json，加@RequestBody注解

### 域对象

#### request域

- 使用ServletAPI

  ```java
  @RequestMapping("/testServletAPI")
  public String testServletAPI(HttpServletRequest request){
      request.setAttribute("testScope", "hello,servletAPI");
      return "success";
  }
  ```

- 使用ModelAndView

  ```java
  @RequestMapping("/testModelAndView")
  public ModelAndView testModelAndView(){
      /**
       * ModelAndView有Model和View的功能
       * Model主要用于向请求域共享数据
       * View主要用于设置视图，实现页面跳转
       */
      ModelAndView mav = new ModelAndView();
      //向请求域共享数据
      mav.addObject("testScope", "hello,ModelAndView");
      //设置视图，实现页面跳转
      mav.setViewName("success");
      return mav;
  }
  ```

- 使用Model

  ```java
  @RequestMapping("/testModel")
  public String testModel(Model model){
      model.addAttribute("testScope", "hello,Model");
      return "success";
  }
  ```

- 使用map

  ```java
  @RequestMapping("/testMap")
  public String testMap(Map<String, Object> map){
      map.put("testScope", "hello,Map");
      return "success";
  }
  ```

- 使用ModelMap

  ```java
  @RequestMapping("/testModelMap")
  public String testModelMap(ModelMap modelMap){
      modelMap.addAttribute("testScope", "hello,ModelMap");
      return "success";
  }
  ```

- Model、ModelMap、Map的关系

  > Model、ModelMap、Map类型的参数其实本质上都是 BindingAwareModelMap 类型的
  >

  ```java
  public interface Model{}
  public class ModelMap extends LinkedHashMap<String, Object> {}
  public class ExtendedModelMap extends ModelMap implements Model {}
  public class BindingAwareModelMap extends ExtendedModelMap {}
  ```

#### session域

```java
@RequestMapping("/testSession")
public String testSession(HttpSession session){
    session.setAttribute("testSessionScope", "hello,session");
    return "success";
}
```

#### application域

```java
@RequestMapping("/testApplication")
public String testApplication(HttpSession session){
	ServletContext application = session.getServletContext();
    application.setAttribute("testApplicationScope", "hello,application");
    return "success";
}
```

### 视图

> SpringMVC中的视图是View接口，视图的作用渲染数据，将模型Model中的数据展示给用户
>
> SpringMVC视图的种类很多，默认有转发视图和重定向视图
>
> 当工程引入jstl的依赖，转发视图会自动转换为JstlView
>
> 若使用的视图技术为Thymeleaf，在SpringMVC的配置文件中配置了Thymeleaf的视图解析器，由此视图解析器解析之后所得到的是ThymeleafView

#### ThymeleafView

- 默认转发

  ```java
  @RequestMapping("/testHello")
  public String testHello(){
      return "hello";
  }
  ```

#### InternalResourceView

- 使用`forward:/`前缀，进行转发

  > SpringMVC中默认的转发视图是**InternalResourceView**，SpringMVC中创建转发视图的情况：
  >
  > 当控制器方法中所设置的视图名称以"forward:"为前缀时，创建InternalResourceView视图，此时的视图名称**不会被SpringMVC配置文件中所配置的视图解析器解析**，而是会将前缀"forward:"去掉，剩余部分作为最终路径通过转发的方式实现跳转

#### RedirectView

- 使用`redirect:/`前缀，进行重定向

  > SpringMVC中默认的重定向视图是RedirectView
  >
  > 当控制器方法中所设置的视图名称以"redirect:"为前缀时，创建RedirectView视图，此时的视图名称不会被SpringMVC配置文件中所配置的视图解析器解析，而是会将前缀"redirect:"去掉，剩余部分作为最终路径通过重定向的方式实现跳转

- 重定向视图在解析时，会先将redirect:前缀去掉，然后会判断剩余部分是否以/开头，若是则会自动拼接上下文路径

#### 视图控制器

若只实现跳转，没有逻辑代码，在spring-mvc.xml配置文件配置

> **注意**：
>
> - 当SpringMVC中设置任何一个view-controller时，其他控制器中的**请求映射将全部失效**
> - 此时需要在SpringMVC的核心配置文件中设置**开启mvc注解驱动**的标签：`<mvc:annotation-driven />`

```xml
<!--
	path：设置处理的请求地址
	view-name：设置请求地址所对应的视图名称
-->
<mvc:view-controller path="/testView" view-name="success"></mvc:view-controller>
```

### 报文转换器

HttpMessageConverter，报文信息转换器，将请求报文转换为Java对象，或将Java对象转换为响应报文

HttpMessageConverter提供了两个注解和两个类型：@RequestBody，@ResponseBody，RequestEntity，ResponseEntity

#### @RequestBody

- 处理表单

  > @RequestBody可以获取请求体，需要在控制器方法设置一个形参，使用@RequestBody进行标识，当前请求的请求体就会为当前注解所标识的形参赋值

  ```java
  @RequestMapping("/testRequestBody")
  public String testRequestBody(@RequestBody String requestBody){
      System.out.println("requestBody:"+requestBody);
      return "success";
  }
  ```

  ```
  输出结果：
  requestBody:username=admin&password=123456
  ```

#### RequestEntity

RequestEntity封装请求报文的一种类型，需要在控制器方法的形参中设置该类型的形参，当前请求的请求报文就会赋值给该形参，可以通过getHeaders()获取请求头信息，通过getBody()获取请求体信息

```java
@RequestMapping("/testRequestEntity")
public String testRequestEntity(RequestEntity<String> requestEntity){
    System.out.println("requestHeader:"+requestEntity.getHeaders());
    System.out.println("requestBody:"+requestEntity.getBody());
    return "success";
}
```

```
输出结果：
requestHeader:[host:"localhost:8080", connection:"keep-alive", content-length:"27", cache-control:"max-age=0", sec-ch-ua:"" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"", sec-ch-ua-mobile:"?0", upgrade-insecure-requests:"1", origin:"http://localhost:8080", user-agent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"]
requestBody:username=admin&password=123
```

#### @ResponseBody

@ResponseBody用于标识一个控制器方法，可以将该方法的返回值直接作为响应报文的响应体响应到浏览器

```java
@RequestMapping("/testResponseBody")
@ResponseBody
public String testResponseBody(){
    return "success";
}
```

结果：浏览器页面显示success文本

**处理json**

> - 引入依赖
> - 在SpringMVC的核心配置文件中开启mvc的注解驱动，此时在HandlerAdaptor中会自动装配一个消息转换器：MappingJackson2HttpMessageConverter，可以将响应到浏览器的Java对象转换为Json格式的字符串

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.12.1</version>
</dependency>
```

```xml
<mvc:annotation-driven />
```

#### ResponseEntity

ResponseEntity用于控制器方法的返回值类型，该控制器方法的返回值就是响应到浏览器的响应报文

### 文件上传下载

#### 文件下载

使用ResponseEntity实现下载文件的功能

```java
@RequestMapping("/testDown")
public ResponseEntity<byte[]> testResponseEntity(HttpSession session) throws IOException {
    //获取ServletContext对象
    ServletContext servletContext = session.getServletContext();
    //获取服务器中文件的真实路径
    String realPath = servletContext.getRealPath("/static/img/1.jpg");
    //创建输入流
    InputStream is = new FileInputStream(realPath);
    //创建字节数组
    byte[] bytes = new byte[is.available()];
    //将流读到字节数组中
    is.read(bytes);
    //创建HttpHeaders对象设置响应头信息
    MultiValueMap<String, String> headers = new HttpHeaders();
    //设置要下载方式以及下载文件的名字
    headers.add("Content-Disposition", "attachment;filename=1.jpg");
    //设置响应状态码
    HttpStatus statusCode = HttpStatus.OK;
    //创建ResponseEntity对象
    ResponseEntity<byte[]> responseEntity = new ResponseEntity<>(bytes, headers, statusCode);
    //关闭输入流
    is.close();
    return responseEntity;
}
```

#### 文件上传

文件上传要求form表单的请求方式**必须为post**，并且添加属性**enctype="multipart/form-data"**

SpringMVC中将上传的文件封装到MultipartFile对象中，通过此对象可以获取文件相关信息

上传步骤：

- 添加依赖

  ```xml
  <!-- https://mvnrepository.com/artifact/commons-fileupload/commons-fileupload -->
  <dependency>
      <groupId>commons-fileupload</groupId>
      <artifactId>commons-fileupload</artifactId>
      <version>1.3.1</version>
  </dependency>
  ```

- 在SpringMVC的配置文件中添加配置

  ```xml
  <!--必须通过文件解析器的解析才能将文件转换为MultipartFile对象-->
  <bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver"></bean>
  ```

- 控制器方法

  ```java
  @RequestMapping("/testUp")
  public String testUp(MultipartFile photo, HttpSession session) throws IOException {
      //获取上传的文件的文件名
      String fileName = photo.getOriginalFilename();
      //处理文件重名问题
      String hzName = fileName.substring(fileName.lastIndexOf("."));
      fileName = UUID.randomUUID().toString() + hzName;
      //获取服务器中photo目录的路径
      ServletContext servletContext = session.getServletContext();
      String photoPath = servletContext.getRealPath("photo");
      File file = new File(photoPath);
      if(!file.exists()){
          file.mkdir();
      }
      String finalPath = photoPath + File.separator + fileName;
      //实现上传功能
      photo.transferTo(new File(finalPath));
      return "success";
  }
  ```

### 拦截器

#### 拦截器的配置

SpringMVC中的拦截器用于拦截控制器方法的执行

SpringMVC中的拦截器需要实现HandlerInterceptor

SpringMVC的拦截器必须在SpringMVC的配置文件中进行配置

```xml
<bean class="com.atguigu.interceptor.FirstInterceptor"></bean>
<ref bean="firstInterceptor"></ref>
<!-- 以上两种配置方式都是对DispatcherServlet所处理的所有的请求进行拦截 -->
<mvc:interceptor>
    <mvc:mapping path="/**"/>
    <mvc:exclude-mapping path="/testRequestEntity"/>
    <ref bean="firstInterceptor"></ref>
</mvc:interceptor>
<!-- 
	以上配置方式可以通过ref或bean标签设置拦截器，通过mvc:mapping设置需要拦截的请求，通过mvc:exclude-mapping设置需要排除的请求，即不需要拦截的请求
-->
```

#### 2、拦截器的三个抽象方法

SpringMVC中的拦截器有三个抽象方法：

- preHandle：控制器方法执行之前执行preHandle()，其boolean类型的返回值表示是否拦截或放行，返回true为放行，即调用控制器方法；返回false表示拦截，即不调用控制器方法

- postHandle：控制器方法执行之后执行postHandle()

- afterComplation：处理完视图和模型数据，渲染视图完毕之后执行afterComplation()

#### 3、多个拦截器的执行顺序

- 若每个拦截器的preHandle()都返回true，此时多个拦截器的执行顺序和拦截器在SpringMVC的配置文件的配置顺序有关
  - preHandle()会按照配置的顺序执行，而postHandle()和afterComplation()会按照配置的反序执行
- 若某个拦截器的preHandle()返回了false
  - preHandle()返回false**和它之前**的拦截器的preHandle()都会执行
  - postHandle()**都不**执行
  - 返回false的拦截器**之前**的拦截器的afterComplation()会执行

### 异常处理器

#### xml方式

SpringMVC提供了一个处理控制器方法执行过程中所出现的异常的接口：HandlerExceptionResolver

HandlerExceptionResolver接口的实现类有：DefaultHandlerExceptionResolver和SimpleMappingExceptionResolver

- DefaultHandlerExceptionResolver封装了很多默认的异常，很多报错都是在这里封装的

- SimpleMappingExceptionResolver自定义异常，使用方式：

```xml
<bean class="org.springframework.web.servlet.handler.SimpleMappingExceptionResolver">
    <!--
        properties的键表示处理器方法执行过程中出现的异常
        properties的值表示若出现指定异常时，设置一个新的视图名称，跳转到指定页面
    -->
    <property name="exceptionMappings">
        <props>
        	<!-- 此处是出现 ArithmeticException 异常，跳转到 error 页面 -->
            <prop key="java.lang.ArithmeticException">error</prop>
        </props>
    </property>
    <!--
    	exceptionAttribute属性设置一个属性名，将出现的异常信息在请求域中进行共享
		此处即可以通过ex获取异常信息
    -->
    <property name="exceptionAttribute" value="ex"></property>
</bean>
```

#### 注解方式

```java
//@ControllerAdvice将当前类标识为异常处理的组件
@ControllerAdvice
public class ExceptionController {

    //@ExceptionHandler用于设置所标识方法处理的异常
    @ExceptionHandler(ArithmeticException.class)
    //ex表示当前请求处理中出现的异常对象
    public String handleArithmeticException(Exception ex, Model model){
        model.addAttribute("ex", ex);
        return "error"
    }
}
```

### 注解配置

使用配置类和注解代替web.xml和SpringMVC配置文件的功能

#### 创建初始化类

- 代替web.xml

- 在Servlet3.0环境中，容器会在类路径中查找实现javax.servlet.ServletContainerInitializer接口的类，如果找到的话就用它来配置Servlet容器
- Spring提供了这个接口的实现，名为SpringServletContainerInitializer，这个类反过来又会查找实现WebApplicationInitializer的类并将配置的任务交给它们来完成
- Spring3.2引入了一个便利的WebApplicationInitializer基础实现，名为AbstractAnnotationConfigDispatcherServletInitializer，当我们的类扩展了AbstractAnnotationConfigDispatcherServletInitializer并将其部署到Servlet3.0容器的时候，容器会自动发现它，并用它来配置Servlet上下文

```java
public class WebInit extends AbstractAnnotationConfigDispatcherServletInitializer {

    // 指定spring的配置类
    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class[]{SpringConfig.class};
    }

    // 指定SpringMVC的配置类
    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{WebConfig.class};
    }

    // 指定DispatcherServlet的映射规则，即url-pattern
    @Override
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }

    // 添加过滤器
    @Override
    protected Filter[] getServletFilters() {
        CharacterEncodingFilter encodingFilter = new CharacterEncodingFilter();
        encodingFilter.setEncoding("UTF-8");
        encodingFilter.setForceRequestEncoding(true);
        HiddenHttpMethodFilter hiddenHttpMethodFilter = new HiddenHttpMethodFilter();
        return new Filter[]{encodingFilter, hiddenHttpMethodFilter};
    }
}
```

#### 配置类

- 创建SpringConfig配置类,代替spring的配置文件

```java
@Configuration
public class SpringConfig {
	//ssm整合之后，spring的配置信息写在此类中
}
```

- 创建WebConfig配置类，代替SpringMVC的配置文件

```java
@Configuration
//扫描组件
@ComponentScan("com.atguigu.mvc.controller")
//开启MVC注解驱动
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    //使用默认的servlet处理静态资源
    @Override
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
        configurer.enable();
    }

    //配置文件上传解析器
    @Bean
    public CommonsMultipartResolver multipartResolver(){
        return new CommonsMultipartResolver();
    }

    //配置拦截器
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        FirstInterceptor firstInterceptor = new FirstInterceptor();
        registry.addInterceptor(firstInterceptor).addPathPatterns("/**");
    }
    
    //配置视图控制
    
    /*@Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("index");
    }*/
    
    //配置异常映射
    /*@Override
    public void configureHandlerExceptionResolvers(List<HandlerExceptionResolver> resolvers) {
        SimpleMappingExceptionResolver exceptionResolver = new SimpleMappingExceptionResolver();
        Properties prop = new Properties();
        prop.setProperty("java.lang.ArithmeticException", "error");
        //设置异常映射
        exceptionResolver.setExceptionMappings(prop);
        //设置共享异常信息的键
        exceptionResolver.setExceptionAttribute("ex");
        resolvers.add(exceptionResolver);
    }*/

    //配置生成模板解析器
    @Bean
    public ITemplateResolver templateResolver() {
        WebApplicationContext webApplicationContext = ContextLoader.getCurrentWebApplicationContext();
        // ServletContextTemplateResolver需要一个ServletContext作为构造参数，可通过WebApplicationContext 的方法获得
        ServletContextTemplateResolver templateResolver = new ServletContextTemplateResolver(
                webApplicationContext.getServletContext());
        templateResolver.setPrefix("/WEB-INF/templates/");
        templateResolver.setSuffix(".html");
        templateResolver.setCharacterEncoding("UTF-8");
        templateResolver.setTemplateMode(TemplateMode.HTML);
        return templateResolver;
    }

    //生成模板引擎并为模板引擎注入模板解析器
    @Bean
    public SpringTemplateEngine templateEngine(ITemplateResolver templateResolver) {
        SpringTemplateEngine templateEngine = new SpringTemplateEngine();
        templateEngine.setTemplateResolver(templateResolver);
        return templateEngine;
    }

    //生成视图解析器并未解析器注入模板引擎
    @Bean
    public ViewResolver viewResolver(SpringTemplateEngine templateEngine) {
        ThymeleafViewResolver viewResolver = new ThymeleafViewResolver();
        viewResolver.setCharacterEncoding("UTF-8");
        viewResolver.setTemplateEngine(templateEngine);
        return viewResolver;
    }
}
```

### 执行流程

#### 常用组件

- DispatcherServlet：**前端控制器**，不需要工程师开发，由框架提供

  > 作用：统一处理请求和响应，整个流程控制的中心，由它调用其它组件处理用户的请求

- HandlerMapping：**处理器映射器**，不需要工程师开发，由框架提供

  > 作用：根据请求的url、method等信息查找Handler，即控制器方法

- Handler：**处理器**，需要工程师开发，即 Controller

  > 作用：在DispatcherServlet的控制下Handler对具体的用户请求进行处理

- HandlerAdapter：**处理器适配器**，不需要工程师开发，由框架提供

  > 作用：通过HandlerAdapter对处理器（控制器方法）进行执行

- ViewResolver：**视图解析器**，不需要工程师开发，由框架提供

  > 作用：进行视图解析，得到相应的视图，例如：ThymeleafView、InternalResourceView、RedirectView

- View：**视图**

  > 作用：将模型数据通过页面展示给用户

#### DispatcherServlet初始化过程

- DispatcherServlet 本质上是一个 Servlet，所以天然的遵循 Servlet 的生命周期。所以宏观上是 Servlet 生命周期来进行调度

- Servlet的init（ServletConfig）

  ------> 实现类GenericServlet，重写了init(ServletConfig)方法，内部调用了本类的init()方法

  ------> 孙子类HttpServletBean，重写了init()方法，内部调用了initServletBean()方法【父类是HttpServlet】

  ------> 子类FrameworkServlet，重写了initServletBean()，内部调用了initWebApplicationContext()方法

  ​			---> 先get一下，有的话可以作为父容器

  ​			---> 开始注入web容器的操作 -- 已经创建好了，直接注入

  ​					---> 注入失败，可能已创建好的没有完成refresh（设置父容器，设置容器id）

  ​							---> 检查是否有父容器，没有则将get到的作为父容器

  ​							---> refresh

  ​			---> 没有注入，再查一遍，看看有没有了，有的话并且完成了初始化，就设置为父容器

  ​			---> 开始真正的创建web容器，通过反射创建 IOC 容器对象，设置父容器，刷新

  ​			---> refresh环境没有成功，执行onRefresh（加锁，可能多处有刷新操作，避免同时进行）

  ------> 子类DispatcherServlet，重写了onRefresh方法，内部调用了initStrategies(ApplicationContext)方法

##### initWebApplicationContext

> 所在类：org.springframework.web.servlet.FrameworkServlet

```java
// 初始化web容器 --- WebApplicationContext
protected WebApplicationContext initWebApplicationContext() {
    WebApplicationContext rootContext =
        WebApplicationContextUtils.getWebApplicationContext(getServletContext());
    WebApplicationContext wac = null;

    if (this.webApplicationContext != null) {
        // A context instance was injected at construction time -> use it
        // 注入容器实例对象
        wac = this.webApplicationContext;
        if (wac instanceof ConfigurableWebApplicationContext) {
            ConfigurableWebApplicationContext cwac = (ConfigurableWebApplicationContext) wac;
            if (!cwac.isActive()) {
                // The context has not yet been refreshed -> provide services such as
                // setting the parent context, setting the application context id, etc
                // 容器还没完成refresh，可能正在创建父容器，可能正在设置容器id
                if (cwac.getParent() == null) {
                    // The context instance was injected without an explicit parent -> set
                    // the root application context (if any; may be null) as the parent
                    // 没有给定父容器，设置父容器
                    cwac.setParent(rootContext);
                }
                // refresh
                configureAndRefreshWebApplicationContext(cwac);
            }
        }
    }
    if (wac == null) {
        // No context instance was injected at construction time -> see if one
        // has been registered in the servlet context. If one exists, it is assumed
        // that the parent context (if any) has already been set and that the
        // user has performed any initialization such as setting the context id
        // web容器没注入进去，检查是否已经注册了，如果有一个了，并且已经完成了初始化，那已有的就作为父容器
        wac = findWebApplicationContext();
    }
    if (wac == null) {
        // No context instance is defined for this servlet -> create a local one
        // 一个也没有，那就创建WebApplicationContext
        wac = createWebApplicationContext(rootContext);
    }

    if (!this.refreshEventReceived) {
        // Either the context is not a ConfigurableApplicationContext with refresh
        // support or the context injected at construction time had already been
        // refreshed -> trigger initial onRefresh manually here.
        synchronized (this.onRefreshMonitor) {
            // 刷新WebApplicationContext
            onRefresh(wac);
        }
    }

    if (this.publishContext) {
        // Publish the context as a servlet context attribute.
        // 将IOC容器在应用域共享
        String attrName = getServletContextAttributeName();
        getServletContext().setAttribute(attrName, wac);
    }

    return wac;
}
```

##### createWebApplicationContext

> 所在类：org.springframework.web.servlet.FrameworkServlet

```java
// 内部的createWebApplicationContext方法
protected WebApplicationContext createWebApplicationContext(@Nullable ApplicationContext parent) {
    Class<?> contextClass = getContextClass();
    if (!ConfigurableWebApplicationContext.class.isAssignableFrom(contextClass)) {
        throw new ApplicationContextException(
            "Fatal initialization error in servlet with name '" + getServletName() +
            "': custom WebApplicationContext class [" + contextClass.getName() +
            "] is not of type ConfigurableWebApplicationContext");
    }
    // 通过反射创建 IOC 容器对象
    ConfigurableWebApplicationContext wac =
        (ConfigurableWebApplicationContext) BeanUtils.instantiateClass(contextClass);

    wac.setEnvironment(getEnvironment());
    // 设置父容器
    wac.setParent(parent);
    String configLocation = getContextConfigLocation();
    if (configLocation != null) {
        wac.setConfigLocation(configLocation);
    }
    configureAndRefreshWebApplicationContext(wac);

    return wac;
}
```

##### initStrategies

> FrameworkServlet创建WebApplicationContext后，刷新容器，调用onRefresh(wac)，此方法在DispatcherServlet中进行了重写，调用了initStrategies(context)方法，初始化策略，即初始化DispatcherServlet的各个组件
>
> 所在类：org.springframework.web.servlet.DispatcherServlet

```
protected void initStrategies(ApplicationContext context) {
   initMultipartResolver(context);
   initLocaleResolver(context);
   initThemeResolver(context);
   initHandlerMappings(context);
   initHandlerAdapters(context);
   initHandlerExceptionResolvers(context);
   initRequestToViewNameTranslator(context);
   initViewResolvers(context);
   initFlashMapManager(context);
}
```

#### DispatcherServlet调用组件处理请求

##### processRequest()

> FrameworkServlet重写HttpServlet中的service()和doXxx()，这些方法中调用了processRequest(request, response)
>
> 所在类：org.springframework.web.servlet.FrameworkServlet

```java
protected final void processRequest(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {

    long startTime = System.currentTimeMillis();
    Throwable failureCause = null;

    LocaleContext previousLocaleContext = LocaleContextHolder.getLocaleContext();
    LocaleContext localeContext = buildLocaleContext(request);

    RequestAttributes previousAttributes = RequestContextHolder.getRequestAttributes();
    ServletRequestAttributes requestAttributes = buildRequestAttributes(request, response, previousAttributes);

    WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);
    asyncManager.registerCallableInterceptor(FrameworkServlet.class.getName(), new RequestBindingInterceptor());

    initContextHolders(request, localeContext, requestAttributes);

    try {
		// 执行服务，doService()是一个抽象方法，在DispatcherServlet中进行了重写
        doService(request, response);
    }
    catch (ServletException | IOException ex) {
        failureCause = ex;
        throw ex;
    }
    catch (Throwable ex) {
        failureCause = ex;
        throw new NestedServletException("Request processing failed", ex);
    }

    finally {
        resetContextHolders(request, previousLocaleContext, previousAttributes);
        if (requestAttributes != null) {
            requestAttributes.requestCompleted();
        }
        logResult(request, response, failureCause, asyncManager);
        publishRequestHandledEvent(request, response, startTime, failureCause);
    }
}
```

##### doService()

> 所在类：org.springframework.web.servlet.DispatcherServlet
>

```java
@Override
protected void doService(HttpServletRequest request, HttpServletResponse response) throws Exception {
    logRequest(request);

    // Keep a snapshot of the request attributes in case of an include,
    // to be able to restore the original attributes after the include.
    Map<String, Object> attributesSnapshot = null;
    if (WebUtils.isIncludeRequest(request)) {
        attributesSnapshot = new HashMap<>();
        Enumeration<?> attrNames = request.getAttributeNames();
        while (attrNames.hasMoreElements()) {
            String attrName = (String) attrNames.nextElement();
            if (this.cleanupAfterInclude || attrName.startsWith(DEFAULT_STRATEGIES_PREFIX)) {
                attributesSnapshot.put(attrName, request.getAttribute(attrName));
            }
        }
    }

    // Make framework objects available to handlers and view objects.
    request.setAttribute(WEB_APPLICATION_CONTEXT_ATTRIBUTE, getWebApplicationContext());
    request.setAttribute(LOCALE_RESOLVER_ATTRIBUTE, this.localeResolver);
    request.setAttribute(THEME_RESOLVER_ATTRIBUTE, this.themeResolver);
    request.setAttribute(THEME_SOURCE_ATTRIBUTE, getThemeSource());

    if (this.flashMapManager != null) {
        FlashMap inputFlashMap = this.flashMapManager.retrieveAndUpdate(request, response);
        if (inputFlashMap != null) {
            request.setAttribute(INPUT_FLASH_MAP_ATTRIBUTE, Collections.unmodifiableMap(inputFlashMap));
        }
        request.setAttribute(OUTPUT_FLASH_MAP_ATTRIBUTE, new FlashMap());
        request.setAttribute(FLASH_MAP_MANAGER_ATTRIBUTE, this.flashMapManager);
    }

    RequestPath requestPath = null;
    if (this.parseRequestPath && !ServletRequestPathUtils.hasParsedRequestPath(request)) {
        requestPath = ServletRequestPathUtils.parseAndCache(request);
    }

    try {
        // 处理请求和响应
        doDispatch(request, response);
    }
    finally {
        if (!WebAsyncUtils.getAsyncManager(request).isConcurrentHandlingStarted()) {
            // Restore the original attribute snapshot, in case of an include.
            if (attributesSnapshot != null) {
                restoreAttributesAfterInclude(request, attributesSnapshot);
            }
        }
        if (requestPath != null) {
            ServletRequestPathUtils.clearParsedRequestPath(request);
        }
    }
}
```

##### doDispatch()

> 所在类：org.springframework.web.servlet.DispatcherServlet
>

```java
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
    HttpServletRequest processedRequest = request;
    HandlerExecutionChain mappedHandler = null;
    boolean multipartRequestParsed = false;

    WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);

    try {
        ModelAndView mv = null;
        Exception dispatchException = null;

        try {
            processedRequest = checkMultipart(request);
            multipartRequestParsed = (processedRequest != request);

            // Determine handler for the current request.
            /*
            	mappedHandler：调用链
                包含handler、interceptorList、interceptorIndex
            	handler：浏览器发送的请求所匹配的控制器方法
            	interceptorList：处理控制器方法的所有拦截器集合
            	interceptorIndex：拦截器索引，控制拦截器afterCompletion()的执行
            */
            mappedHandler = getHandler(processedRequest);
            if (mappedHandler == null) {
                noHandlerFound(processedRequest, response);
                return;
            }

            // Determine handler adapter for the current request.
           	// 通过控制器方法创建相应的处理器适配器，调用所对应的控制器方法
            HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

            // Process last-modified header, if supported by the handler.
            String method = request.getMethod();
            boolean isGet = "GET".equals(method);
            if (isGet || "HEAD".equals(method)) {
                long lastModified = ha.getLastModified(request, mappedHandler.getHandler());
                if (new ServletWebRequest(request, response).checkNotModified(lastModified) && isGet) {
                    return;
                }
            }
			
            // 调用拦截器的preHandle()
            if (!mappedHandler.applyPreHandle(processedRequest, response)) {
                return;
            }

            // Actually invoke the handler.
            // 由处理器适配器调用具体的控制器方法，最终获得ModelAndView对象
            mv = ha.handle(processedRequest, response, mappedHandler.getHandler());

            if (asyncManager.isConcurrentHandlingStarted()) {
                return;
            }

            applyDefaultViewName(processedRequest, mv);
            // 调用拦截器的postHandle()
            mappedHandler.applyPostHandle(processedRequest, response, mv);
        }
        catch (Exception ex) {
            dispatchException = ex;
        }
        catch (Throwable err) {
            // As of 4.3, we're processing Errors thrown from handler methods as well,
            // making them available for @ExceptionHandler methods and other scenarios.
            dispatchException = new NestedServletException("Handler dispatch failed", err);
        }
        // 后续处理：处理模型数据和渲染视图
        processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
    }
    catch (Exception ex) {
        triggerAfterCompletion(processedRequest, response, mappedHandler, ex);
    }
    catch (Throwable err) {
        triggerAfterCompletion(processedRequest, response, mappedHandler,
                               new NestedServletException("Handler processing failed", err));
    }
    finally {
        if (asyncManager.isConcurrentHandlingStarted()) {
            // Instead of postHandle and afterCompletion
            if (mappedHandler != null) {
                mappedHandler.applyAfterConcurrentHandlingStarted(processedRequest, response);
            }
        }
        else {
            // Clean up any resources used by a multipart request.
            if (multipartRequestParsed) {
                cleanupMultipart(processedRequest);
            }
        }
    }
}
```

##### processDispatchResult()

```java
private void processDispatchResult(HttpServletRequest request, HttpServletResponse response,
                                   @Nullable HandlerExecutionChain mappedHandler, @Nullable ModelAndView mv,
                                   @Nullable Exception exception) throws Exception {

    boolean errorView = false;

    if (exception != null) {
        if (exception instanceof ModelAndViewDefiningException) {
            logger.debug("ModelAndViewDefiningException encountered", exception);
            mv = ((ModelAndViewDefiningException) exception).getModelAndView();
        }
        else {
            Object handler = (mappedHandler != null ? mappedHandler.getHandler() : null);
            mv = processHandlerException(request, response, handler, exception);
            errorView = (mv != null);
        }
    }

    // Did the handler return a view to render?
    if (mv != null && !mv.wasCleared()) {
        // 处理模型数据和渲染视图
        render(mv, request, response);
        if (errorView) {
            WebUtils.clearErrorRequestAttributes(request);
        }
    }
    else {
        if (logger.isTraceEnabled()) {
            logger.trace("No view rendering, null ModelAndView returned.");
        }
    }

    if (WebAsyncUtils.getAsyncManager(request).isConcurrentHandlingStarted()) {
        // Concurrent handling started during a forward
        return;
    }

    if (mappedHandler != null) {
        // Exception (if any) is already handled..
        // 调用拦截器的afterCompletion()
        mappedHandler.triggerAfterCompletion(request, response, null);
    }
}
```

#### 执行流程

- 用户向服务器发送请求，请求被SpringMVC 前端控制器 DispatcherServlet捕获

- DispatcherServlet对请求URL进行解析，得到请求资源标识符（URI），判断请求URI对应的映射：
  - 不存在
    - 再判断是否配置了mvc:default-servlet-handler
    - 没配置，则控制台报映射查找不到，客户端展示404错误
    - 有配置，则访问目标资源（一般为静态资源，如：JS,CSS,HTML），找不到客户端也会展示404错误
  - 存在则执行下面的流程
- 根据该URI，调用HandlerMapping获得该Handler配置的所有相关的对象（包括Handler对象以及Handler对象对应的拦截器），最后以HandlerExecutionChain执行链对象的形式返回
-  DispatcherServlet 根据获得的Handler，选择一个合适的HandlerAdapter
- 如果成功获得HandlerAdapter，此时将开始执行拦截器的preHandler(…)方法【正向】
- 提取Request中的模型数据，填充Handler入参，开始执行Handler（Controller)方法，处理请求。在填充Handler的入参过程中，根据你的配置，Spring将帮你做一些额外的工作
  - HttpMessageConveter： 将请求消息（如Json、xml等数据）转换成一个对象，将对象转换为指定的响应信息
  -  数据转换：对请求消息进行数据转换。如String转换成Integer、Double等
  - 数据格式化：对请求消息进行数据格式化。 如将字符串转换成格式化数字或格式化日期等
  - 数据验证： 验证数据的有效性（长度、格式等），验证结果存储到BindingResult或Error中
- Handler执行完成后，向DispatcherServlet 返回一个ModelAndView对象
- 此时将开始执行拦截器的postHandle(...)方法【逆向】
- 根据返回的ModelAndView（此时会判断是否存在异常：如果存在异常，则执行HandlerExceptionResolver进行异常处理）选择一个适合的ViewResolver进行视图解析，根据Model和View，来渲染视图
- 渲染视图完毕执行拦截器的afterCompletion(…)方法【逆向】
- 将渲染结果返回给客户端

### 其他问题

#### 参数乱码

- web.xml

  > 必须放到所有过滤器之前

  ```xml
  <!--配置springMVC的编码过滤器-->
  <filter>
      <filter-name>CharacterEncodingFilter</filter-name>
      <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
      <init-param>
          <param-name>encoding</param-name>
          <param-value>UTF-8</param-value>
      </init-param>
      <init-param>
          <param-name>forceResponseEncoding</param-name>
          <param-value>true</param-value>
      </init-param>
  </filter>
  <filter-mapping>
      <filter-name>CharacterEncodingFilter</filter-name>
      <url-pattern>/*</url-pattern>
  </filter-mapping>
  ```

#### 浏览器不支持PUT、DELETE

由于浏览器只支持发送get和post方式的请求，SpringMVC 提供了 HiddenHttpMethodFilter 帮助我们将 POST 请求转换为 DELETE 或 PUT 请求

> **HiddenHttpMethodFilter** 处理put和delete请求的条件：
>
> - a>当前请求的请求方式必须为post
>
> - b>当前请求必须传输请求参数_method
>
>   ```html
>   <form id="delete_form" method="post">
>       <!-- HiddenHttpMethodFilter要求：必须传输_method请求参数，并且值为最终的请求方式 -->
>       <input type="hidden" name="_method" value="delete"/>
>   </form>
>   ```
>
> 满足以上条件，**HiddenHttpMethodFilter** 过滤器就会将当前请求的请求方式转换为请求参数_method的值，因此请求参数\_method的值才是最终的请求方式
>

在web.xml中注册**HiddenHttpMethodFilter** 

```xml
<filter>
    <filter-name>HiddenHttpMethodFilter</filter-name>
    <filter-class>org.springframework.web.filter.HiddenHttpMethodFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>HiddenHttpMethodFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```







