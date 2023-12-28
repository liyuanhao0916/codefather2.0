# Servlet Filter Listener

## Servlet

### 概述

概念：运行在服务器端的小程序
	Servlet就是一个接口，定义了Java类被浏览器访问到(tomcat识别)的规则。
	将来我们自定义一个类，实现Servlet接口，复写方法。

### 步骤

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

### 资源路径

   1. urlpartten:Servlet访问路径

      一个Servlet可以定义多个访问路径 ： @WebServlet({"/d4","/dd4","/ddd4"})

   2. 路径定义规则：

      - /xxx：路径匹配
      - /xxx/xxx:多层路径，目录结构
      - *.xxx：扩展名匹配（扩展名任意写）

### 执行原理

1. 当服务器接受到客户端浏览器的请求后，会解析请求URL路径，获取访问的Servlet的资源路径
2. 查找web.xml文件，是否有对应的`<url-pattern>`标签体内容。
3. 如果有，则在找到对应的`<servlet-class>`全类名
4. tomcat会将字节码文件加载进内存，并且创建其对象
5. 调用其方法

### 生命周期

Servlet中的生命周期方法：

1. 被创建：执行init方法，只执行一次

   * Servlet什么时候被创建？

     默认情况下，第一次被访问时，Servlet被创建

   - 可以配置执行Servlet的创建时机。

     在`<servlet>`标签下配置

     - 第一次被访问时，创建 `<load-on-startup>`的值为负数

     - 在服务器启动时，创建`<load-on-startup>`的值为0或正整数

   * Servlet的init方法，只执行一次，说明一个Servlet在内存中只存在一个对象，Servlet是单例的

   * 多个用户同时访问时，可能存在线程安全问题。
     解决：尽量不要在Servlet中定义成员变量。即使定义了成员变量，也不要对修改值

2. 提供服务：执行service方法，执行多次
   	每次访问Servlet时，Service方法都会被调用一次。

3. 被销毁：执行destroy方法，只执行一次

   * Servlet被销毁时执行。服务器关闭时，Servlet被销毁
   * 只有服务器正常关闭时，才会执行destroy方法。
   * destroy方法在Servlet被销毁之前执行，一般用于释放资源

### 体系结构	

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

### HTTP协议

- 概念	Hyper Text Transfer Protocol 超文本传输协议
  - 传输协议：定义了，客户端和服务器端通信时，发送数据的格式

- 特点：
  	1. 基于TCP/IP的高级协议
  	2. 默认端口号:80
  	3.  基于请求/响应模型的:一次请求对应一次响应
  	4. 无状态的：每次请求之间相互独立，不能交互数据

#### 请求消息数据格式

   - 请求行
     - GET /login.html	HTTP/1.1
     - 请求方式  url  协议/版本

   - 请求头：浏览器告诉服务器一些信息，以键值对形式呈现，请求头名: 请求头值
     - User-Agent：浏览器版本信息（解决浏览器的兼容性问题）
     - Referer：我从哪里来http://localhost/login.html（防盗链、统计）

   - 请求空行

   - 请求体：封装POST请求消息的请求参数的（post特有）

#### 响应消息数据格式

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
    * 404（请求路径没有对应的资源） 
    * 405：请求方式没有对应的doXxx方法
  - 5xx：服务器端错误。代表：500(服务器内部出现异常)

### Request

#### 体系结构

ServletRequest		--	接口
		|	继承
HttpServletRequest	-- 接口
		|	实现
org.apache.catalina.connector.RequestFacade 类(tomcat)

#### 获取请求数据

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

#### 请求转发（forward）

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



#### 共享数据

- 域对象：一个有作用范围的对象，可以在范围内共享数据
- request域：代表一次请求的范围，一般用于请求转发的多个资源中共享数据
- 方法
  - void setAttribute(String name,Object obj)  存储数据
  - Object getAttitude(String name)   通过键获取值
  - void removeAttribute(String name):通过键移除键值对

#### 获取ServletContext

- ServletContext getServletContext()



### Response

#### 设置响应消息

- 设置状态码：setStatus(int sc) 

- 设置响应头：setHeader(String name, String value) 

- 设置响应体

  - 获取输出流：

    > 字符输出流：PrintWriter getWriter()
    >
    > 字节输出流：ServletOutputStream getOutputStream()

  - 使用输出流，将数据输出到客户端浏览器

#### 重定向（redirect）

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

#### 输出到浏览器

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

### ServletContext

- 概念：服务器会为每一个工程创建一个对象，这个对象就是ServletContext对象。这个对象全局唯一，而且工程内部的所有servlet都共享这个对象。所以叫全局应用程序共享对象，代表整个web应用，可以和程序的容器(服务器)来通信

- 获取：
  request.getServletContext();
  this.getServletContext();

- 功能：
  	1. 获取MIME类型：String    getMimeType(String filename)  
  		* MIME类型:在互联网通信过程中定义的一种文件数据类型
  			* 格式： 大类型/小类型   text/html		image/jpeg

   2. 域对象：共享数据

      1. setAttribute(String name,Object value)
      2. getAttribute(String name)
      3. removeAttribute(String name)

      ServletContext对象范围：所有用户所有请求的数据

   3. 获取文件的真实(服务器)路径     String getRealPath(String path)  

      - 能放文件的地方有三个
      - web目录下资源访问 context.getRealPath("/b.txt")
      - WEB-INF目录下的资源访问 context.getRealPath("/WEB-INF/c.txt")
      - src目录下的资源访问context.getRealPath("/WEB-INF/classes/a.txt")

### 会话技术

- 会话：一次会话中包含多次请求和响应。
  - 一次会话：浏览器第一次给服务器资源发送请求，会话建立，直到有一方断开为止
- 功能：在一次会话的范围内的多次请求间，共享数据
- 方式：
  	1. 客户端会话技术：Cookie
  	2. 服务器端会话技术：Session

#### Cookie

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

### 路径写法

相对路径

- 与当前资源的相对位置
- 以./xxx  	  ../xxx  	  xxx开头

**绝对路径（推荐）**

- 可确定唯一资源
- 以/开头
- 给客户端浏览器使用：需要加虚拟目录(项目的访问路径)
  - 建议虚拟目录动态获取：request.getContextPath()
  - `<a>` , `<form>` 重定向...
- 给服务器使用：不需要加虚拟目录
  - 转发路径

### BeanUtils工具类

简化数据封装

用于封装JavaBean的

成员变量：
			属性：setter和getter方法截取后的产物
				例如：getUsername() --> Username--> username		

方法：
      			1. setProperty()
      			2. getProperty()
      			3. **populate(Object obj , Map map):将map集合的键值对信息，封装到对应的JavaBean对象中**

### 案例：用户登录

用户登录案例需求：
	1.编写login.html登录页面
		username & password 两个输入框
	2.使用Druid数据库连接池技术,操作mysql，day14数据库中user表
	3.使用JdbcTemplate技术封装JDBC
	4.登录成功跳转到SuccessServlet展示：登录成功！用户名,欢迎您
	5.登录失败跳转到FailServlet展示：登录失败，用户名或密码错误

```html
<!--编写login.html登录页面-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>注册</title>
</head>
<body>
<form action="/userlogin/login" method="post">
  用户名：<input name="username" type="text" placeholder="请输入用户名"><br>
  密&nbsp;&nbsp;&nbsp;码：<input name="password" type="password" placeholder="请输入密码"><br>
  <input value="登录" type="submit">
</form>
</body>
</html>
```

```java
//数据库连接池
public class JDBCUtils {
    private static DataSource dataSource;
    
    static {
        Properties properties = new Properties();
        InputStream is = JDBCUtils.class.getClassLoader().getResourceAsStream("druid.properties");
        properties.load(is);
        dataSource = DruidDataSourceFactory.createDataSource(properties);
    }
    
    public static DataSource getDataSource(){
        return dataSource;
    }
}
```

```java
//javabean略
//dao
public class UserDao {
    //JdbcTemplate是Spring的一个工具类
    private JdbcTemplate template = new JdbcTemplate(JDBCUtils.getDataSource());
    public User login(User loginUser){
        String sql = "select * from user where username = ? and password = ?";
        User user = null;
        try {
            //BeanPropertyRowMapper把结果映射为javaBean类
            user = template.queryForObject(sql, new BeanPropertyRowMapper<User>(User.class),loginUser.getUsername(),loginUser.getPassword());
            return user;
        } catch (DataAccessException e) {
            e.printStackTrace();
            return null;
        }
    }
}
```

```java
//servlet-1(login)
@WebServlet("/login")
public class LoginServlet extends HttpServlet{
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //改字符集
        req.setCharacterEncoding("utf-8");
        //获取请求参数
        Map<String, String[]> parameterMap = req.getParameterMap();
        // BeanUtils.populate()把参数封装为javaBean对象
        User loginUser = new User();
        BeanUtils.populate(loginUser,parameterMap); 
        //调用dao中的方法
        UserDao userDao = new UserDao();
        User user = userDao.login(loginUser);

        if (user == null) {
            req.getRequestDispatcher("/fail").forward(req,resp);
        }else {
            //设置请求转发参数
            req.setAttribute("hahaha",user);
            req.getRequestDispatcher("/success").forward(req,resp);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        this.doGet(req,resp);
    }
}
```

```java
//servlet-2(fail)
@WebServlet("/fail")
public class FailServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //设置页面字符集
        response.setContentType("text/html;charset=utf-8");
        response.getWriter().write("登录失败");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.doGet(request, response);
    }
}
```

```java
//servlet-3(success)
@WebServlet("/success")
public class SuccessServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html;charset=utf-8");
        User user = (User) request.getAttribute("hahaha");
        response.getWriter().write(user.getUsername() + "你好，登录成功");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.doGet(request, response);
    }
}
```



### 案例：文件下载

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>文件下载</title>
</head>
<body>
    <!--图片直接打开，不被下载-->
<a href="/download/img/九尾.jpg">下载图片</a>
<a href="/download/img/1.avi">下载视频</a>
<hr>
    <!--都可被下载-->
<a href="/download/downloadServlet?filename=九尾.jpg">下载图片</a>
<a href="/download/downloadServlet?filename=1.avi">下载视频</a>
</body>
</html>
```



```java
@WebServlet("/downloadServlet")
public class DownloadServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //获取请求参数，文件名称
        String filename = req.getParameter("filename");
        //找到文件服务器路径
        ServletContext servletContext = this.getServletContext();
        String realPath = servletContext.getRealPath("/img/" + filename);
        //设置响应头--数据格式
        String mimeType = servletContext.getMimeType(filename);
        resp.setContentType(mimeType);
        //设置响应头--响应方式（弹窗）
        resp.setHeader("content-disposition","attachment;filename=" + filename);
        //使用字节输入流加载文件进内存
        FileInputStream fis = new FileInputStream(realPath);
        ServletOutputStream sos = resp.getOutputStream();
        BufferedInputStream bis = new BufferedInputStream(fis);
        BufferedOutputStream bos = new BufferedOutputStream(sos);

        byte[] buff = new byte[1024 * 8];
        int len;
        while ((len = bis.read(buff)) != -1){
            bos.write(buff,0,len);  //输出
            bos.flush();
        }
        fis.close();
        sos.close();
        bis.close();
        bos.close();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        this.doGet(req,resp);
    }
}
```

### 案例：验证码

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>验证码</title>
</head>
<body>
<img id="checkCode" src="/checkcode/checkCode">
<a id="change" href="#">看不清，换一张</a>

<script>
    var img = document.getElementById("checkCode");
    img.onclick = fun;
    var a = document.getElementById("change");
    a.onclick = fun;
    function fun() {
        var date = new Date().getTime()
        img.src = "/checkcode/checkCode?" + date;
    }
</script>
</body>
</html>
```

```java
@WebServlet("/checkCode")
public class CheckCodeServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //创建画布
        int width = 100;
        int height = 50;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);

        //创建画笔
        Graphics graphics = image.getGraphics();
        //设置画笔颜色
        graphics.setColor(Color.BLACK);
        //画矩形
        graphics.drawRect(0,0,width - 1,height - 1);
        //随机验证码
        graphics.setColor(Color.white);
        String str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        for (int i = 1; i < 5; i++) {
            int index = random.nextInt(str.length());
            char ch = str.charAt(index);
            //画字符串
            graphics.drawString(ch + "",width/5*i,height/2);
        }
        graphics.setColor(Color.PINK);
        //画干扰线
        for (int j = 0; j < 10; j++) {
            int x1 = random.nextInt(width);
            int x2 = random.nextInt(width);
            int y1 = random.nextInt(height);
            int y2 = random.nextInt(height);
            graphics.drawLine(x1,y1,x2,y2);
        }
        //写到页面
        ImageIO.write(image,"jpg",resp.getOutputStream());
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        this.doGet(req,resp);
    }
}
```

###   案例：记住上次访问时间

```java
resp.setContentType("text/html;charset=utf-8");
Cookie[] cookies = req.getCookies();
boolean flag = false;
if (cookies != null && cookies.length > 0) {
    for (Cookie cookie: cookies) {
        String name = cookie.getName();
        if ("lastTime".equals(name)){
            flag = true;
            String value = cookie.getValue();
            value = URLDecoder.decode(value,"utf-8");
            resp.getWriter().write("<h1>欢迎回来，您上次访问时间为:"+value+"</h1>");

            Date date = new Date();
            SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy年MM月dd日  hh:mm:ss");
            String str_date = simpleDateFormat.format(date);
            str_date = URLEncoder.encode(str_date,"utf-8");
            cookie.setValue(str_date);
            cookie.setMaxAge(60*60*24);
            resp.addCookie(cookie);
            break;
        }
    }
}
if(cookies == null || cookies.length == 0 || flag == false){
    Date date = new Date();
    SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy年MM月dd日hh:mm:ss");
    String str_date = simpleDateFormat.format(date);
    str_date = URLEncoder.encode(str_date,"utf-8");
    Cookie cookie = new Cookie("lastTime", str_date);
    cookie.setMaxAge(60*60*24);
    resp.addCookie(cookie);
    resp.getWriter().write("<h1>您好，欢迎您首次访问</h1>");
}
```



## Filter

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

## Listener

- 概念

  事件监听机制
  		事件	：一件事情
  		事件源 ：事件发生的地方
  		监听器 ：一个对象
  		注册监听：将事件、事件源、监听器绑定在一起。 当事件源上发生某个事件后，执行监听器代码

- ServletContextListener:监听ServletContext对象的创建和销毁

  - void contextInitialized(ServletContextEvent sce) ：ServletContext对象创建后会自动调用该方法
  - void contextDestroyed(ServletContextEvent sce) ：ServletContext对象被销毁之前自动调用该方法

- 步骤

  - 定义一个类，实现ServletContextListener接口

- 复写方法

  - 配置

    - web.xml
  - 注解@WebListener