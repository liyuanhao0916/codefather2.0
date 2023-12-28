# SpringMVC

## 概述

三层架构

<img src="http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220603183822342.png" alt="image-20220603183822342" style="zoom:33%;" />

MVC模式

<img src="http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220603183906082.png" alt="image-20220603183906082" style="zoom:33%;" />

## 基本使用

- 注意打包为war包，否则报400（get）或415（post）

- 添加依赖 和 tomcat插件  javax.servlet-api、spring-webmvc、spring-jdbc、mysql、druid、mybatis、mybatis-spring

  **说明:**servlet的坐标为什么需要添加`<scope>provided</scope>`?

  * scope是maven中jar包依赖作用范围的描述，
  * 如果不设置默认是`compile`在在编译、运行、测试时均有效
  * 如果运行有效的话就会和tomcat中的servlet-api包发生冲突，导致启动报错
  * provided代表的是该包只在编译和测试的时候用，运行的时候无效直接使用tomcat中的，就避免冲突

- 创建springMVC配置类

  - SpringMVC加载其相关bean(表现层bean),也就是controller包下的类
  - @Configuration、@ComponentScan("com.botuer.controller")

- 创建spring配置类（要排除SpringMVC管理的Bean）

  - Spring控制的bean

    * 业务bean(Service)

    * 功能bean(DataSource,SqlSessionFactoryBean,MapperScannerConfigurer等)

  - @Configuration、

  - 排除方式一：精确扫描@ComponentScan({"com.botuer.service","com.botuer.dao"})

    **说明:**

    上述只是通过例子说明可以精确指定让Spring扫描对应的包结构，真正在做开发的时候，因为Dao最终是交给`MapperScannerConfigurer`对象来进行扫描处理的，我们只需要将其扫描到service包即可。

  - 排除方式二：excludeFilters属性：设置扫描加载bean时，排除的过滤规则

    - type属性：设置排除规则，当前使用按照bean定义时的注解类型进行排除

      * **ANNOTATION：按照注解排除**
      * ASSIGNABLE_TYPE:按照指定的类型过滤
      * REGEX:按照正则表达式排除
      * CUSTOM:按照自定义规则排除
    - classes属性：设置排除的具体注解类，当前设置排除@Controller定义的bean

  ```java
  @Configuration
  @ComponentScan(value="com.botuer",
      excludeFilters=@ComponentScan.Filter(
      	type = FilterType.ANNOTATION,	//设置按注解排除
          classes = Controller.class		//排除Controller注解类
      )
  )
  public class SpringConfig {
  }
  ```

  

- 定义请求功能类  @Controller、@RequestMapping("资源路径")

- 创建请求映射设置类ServletContainersInitConfig

  方式一：继承AbstractDispatcherServletInitializer“调度Servlet初始化抽象类”

  - 取代了之前的web.xml

  - AbstractDispatcherServletInitializer类是SpringMVC提供的快速初始化Web3.0容器的抽象类

  - AbstractDispatcherServletInitializer提供了三个方法供用户实现

    * createServletApplicationContext（），createServletApplicationContext用来加载SpringMVC环境，创建Servlet容器时，加载SpringMVC对应的bean并放入WebApplicationContext对象范围中，而WebApplicationContext的作用范围为ServletContext范围，即整个web容器范围
    * getServletMappings（），设定SpringMVC对应的请求映射路径，即SpringMVC拦截哪些请求
    * createRootApplicationContext（），用来加载Spring环境，如果创建Servlet容器时需要加载非SpringMVC对应的bean,使用当前方法进行，使用方式和createServletApplicationContext相同。

    <img src="http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220603231519463.png" alt="image-20220603231519463" style="zoom:33%;" />

  ```java
  public class ServletContainersInitConfig extends AbstractDispatcherServletInitializer {
      //加载springmvc配置类
      protected WebApplicationContext createServletApplicationContext() {
          //初始化WebApplicationContext对象
          AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
          //加载指定配置类
          ctx.register(SpringMvcConfig.class);
          return ctx;
      }
  
      //设置由springmvc控制器处理的请求映射路径
      protected String[] getServletMappings() {
          return new String[]{"/"};
      }
  
      //加载spring配置类
      protected WebApplicationContext createRootApplicationContext() {
          AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
          ctx.register(SpringConfig.class);
          return ctx;
      }
  }
  ```

  方式二：继承AbstractAnnotationConfigDispatcherServletInitializer，实现三个方法

  ```java
  public class ServletContainersInitConfig extends AbstractAnnotationConfigDispatcherServletInitializer {
  
      protected Class<?>[] getRootConfigClasses() {
          return new Class[]{SpringConfig.class};
      }
    
      protected Class<?>[] getServletConfigClasses() {
          return new Class[]{SpringMvcConfig.class};
      }
      
      protected String[] getServletMappings() {
          return new String[]{"/"};
      }
  }
  ```

  

- 配置tomcat

- 设置返回数据为@ResponseBody设置当前控制器方法响应内容为当前返回值，无需解析

  - 可用于方法 或者 整个类

## 静态资源放行

- 在config包下新建SpringMvcSupport类 继承 WebMvcConfigurationSupport，重写方法addResourceHandlers”添加资源处理器“
- 必须保证SpringMvc配置类能够扫到这个包
- 必须加配置类注释@Configuration

```java
@Configuration
public class SpringMvcSupport extends WebMvcConfigurationSupport {
    //设置静态资源访问过滤，当前类需要设置为配置类，并被扫描加载
    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        //当访问/pages/????时候，从/pages目录下查找内容
        registry.addResourceHandler("/pages/**").addResourceLocations("/pages/");
        registry.addResourceHandler("/js/**").addResourceLocations("/js/");
        registry.addResourceHandler("/css/**").addResourceLocations("/css/");
        registry.addResourceHandler("/plugins/**").addResourceLocations("/plugins/");
    }
}
```

## 请求

- 资源访问路径，防止重名，加一层，提取到类上@RequestMapping（"/模块名"）
- 中文乱码
  - 中文乱码Tomcat8.5以后的版本已经处理了中文乱码的问题
  - Tomcat7插件需要在pom.xml配置<uriEncoding>UTF-8</uriEncoding>

### 参数传递

- 基本数据类型和String，要求：请求参数类型与个数与方法形参相对应，请求参数key和变量名不一致时，用@RequestParam("key")注解
- pojo类型，自动封装：要求key与属性名一致
- 嵌套，级联自动封装：要求key与属性名一致（前端key为：address.province）
- 数组，自动封装：要求key相同，且与变量名相同，不相同用@RequestParam注解
- 集合：不能自动封装
  - 原因：List是接口，没有对象，自动找List的pojo，找不到自然报错
  - 解决：加注解@RequestParam，可以与形参不一致依然用这个

### Json参数传递

- 步骤

  - 添加依赖jackson-databind
  - SpringMvc配置类开启json支持**@EnableWebMvc**
  - controller类的形参列表中，添加请求体注解@RequestBody

- 普通数组，可用数组/集合接

  ```json
  ["ndasdj","hdkah"]
  ```

  ```java
  @RequestMapping("/save4")
  @ResponseBody
  public String save4(@RequestBody String[] args){
      System.out.println(Arrays.toString(args));
      return "{'info':'true'}";
  }
  ```

- 对象

  ```json
  {
     "username":"haah",
     "password":"123",
     "address":{
         	"province":"河北",
     		"city":"邢台"}
  }
  ```

- 对象数组

  ```json
  [
      {
          "username": "haah",
          "password": "123",
          "address": {
              "province": "河北",
              "city": "邢台"
          }
      },
      {
          "username": "haah",
          "password": "123",
          "address": {
              "province": "河北",
              "city": "邢台"
          }
      }
  ]
  ```

### 日期传递参数

- 默认可传递yyyy/MM/dd格式的，其他格式报400

- 参数前使用格式注解@DateTimeFormat(pattern="格式")

  ```url
  http://localhost/user/save7?date=2021/2/12&date1=1234-6-9 8:00:12
  ```

  ```java
  @RequestMapping("/save7")
  @ResponseBody
  public String save7(Date date,@DateTimeFormat(pattern = "yyyy-MM-dd hh:mm:ss") Date date1){
      System.out.println(date);
      System.out.println(date1);
      return "{'info':'true'}";
  }
  ```

### 总结

- **@RequestParam用于  get传参、表单传参的别名或类型匹配**

- **@RequestBody用于json，且SpringMvc配置类需加@EnableWebMvc**

### 类型转换内部实现

- 请求参数传递过程中存在很多类型转换

  - 前端传递字符串，后端使用日期Date接收

  - 前端传递JSON数据，后端使用对象接收

  - 前端传递字符串，后端使用Integer接收

  - ......

- SpringMVC中提供了很多类型转换接口和实现类
  - Converter接口：字符串到日期、字符串到int，等等
  - HttpMessageConverter接口：json和对象的转换

## 响应

### 中文乱码

在ServletContainerInitConfig类配置

```java
public class ServletContainersInitConfig extends AbstractAnnotationConfigDispatcherServletInitializer {
    protected Class<?>[] getRootConfigClasses() {
        return new Class[0];
    }
    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{SpringMvcConfig.class};
    }
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }
    //乱码处理
    @Override
    protected Filter[] getServletFilters() {
        CharacterEncodingFilter filter = new CharacterEncodingFilter();
        filter.setEncoding("UTF-8");
        return new Filter[]{filter};
    }
}
```

### 响应跳转页面

- 跳转页面直接return
- **不能有@ResponseBody注释，否则会作为文本解析**
- **资源地址注意层级**
- **由于配置的交由SpringMvc管理的拦截路径为根目录，故静态页面均不能访问（jsp为动态页面）**

```java
@RequestMapping("/save10")
public String save10(){
    System.out.println("--------------------");
    return "../index.jsp";
}
```

### 响应文本数据

- 必须有@ResponseBody注释，否则会查找页面，找不到报404

### 响应json数据

- 可返回实体对象或集合

- 依赖@ResponseBody、@EnableWebMvc

  ```java
  //对象----->json
  @RequestMapping("/testUser")
  @ResponseBody
  public User testUser(){
      User user = new User();
      user.setUsername("fafaf");
      user.setPassword("11345");
      return user;
  }
  //对象集合----->json数组
  @RequestMapping("/testUserList")
  @ResponseBody
  public List<User> testUserList(){
      ArrayList<User> users = new ArrayList<>();
      User user1 = new User();
      user1.setUsername("fafaf");
      user1.setPassword("11345");
      users.add(user1);
      User user2 = new User();
      user2.setUsername("hthth");
      user2.setPassword("11344464545");
      users.add(user2);
      return users;
  }
  //List集合------>json数组
  @RequestMapping("/testList")
  @ResponseBody
  public List<String> testList(){
      List<String> list = new ArrayList<>();
      list.add("dada");
      list.add("dadd");
      return list;
  }
  //Map集合------>json的Map
  @RequestMapping("/testMap")
  @ResponseBody
  public Map<String,String> testMap(){
      Map<String, String> map = new HashMap<>();
      map.put("username","dadad");
      return map;
  }
  ```

## Rest风格

- REST（Representational State Transfer），表现形式状态转换,它是一种软件架构风格
- 传统url很容易将信息暴露
- 按照不同的请求方式代表不同的操作类型。
  * 发送GET请求是用来做查询
  * 发送POST请求是用来做新增
  * 发送PUT请求是用来做修改
  * 发送DELETE请求是用来做删除
- 根据REST风格对资源进行访问称为RESTful

### RESTful的使用

- GET查询、POST新增、PUT修改、DELETE删除
- 有请求参数时加注解@PathVariable，请求参数key与形参要一致，不一致时，注解添加请求参数key
- 参数之间用"/"隔开

```java
//添加
@RequestMapping(value = "/users",method = RequestMethod.POST)
//删除
@RequestMapping(value = "/users",method = RequestMethod.DELETE)
//有请求参数
@RequestMapping(value = "/users/{id}",method = RequestMethod.DELETE)
//多个请求参数
@RequestMapping(value = "/users/{id}/{name}",method = RequestMethod.DELETE)
//修改
@RequestMapping(value = "/users",method = RequestMethod.PUT)
//查询
@RequestMapping(value = "/users/{id}" ,method = RequestMethod.GET)
//查询所有
@RequestMapping(value = "/users" ,method = RequestMethod.GET)
```

### 总结

@RequestBody`、`@RequestParam`、`@PathVariable

* 区别
  * @RequestParam用于接收url地址传参或表单传参`http://www.botuer.com?id=1`
  * @RequestBody用于接收json数据
  * @PathVariable用于接收路径参数，使用{参数名称}描述路径参数`http://www.botuer.com/1`
* 应用
  * 后期开发中，发送请求参数超过1个时，以json格式为主，@RequestBody应用较广
  * 如果发送非json格式数据，选用@RequestParam接收请求参数
  * 采用RESTful进行开发，当参数数量较少时，例如1个，可以采用@PathVariable接收请求路径变量，通常用于传递id值

### 简化

- @RequestMapping（”“）、@ResponseBody、@Controller置于类上
  - **@RestController、@RequestMapping（”“）置于类上**
  - @RestController = @ResponseBody + @Controller 

- **@GetMapping 、@PostMapping 、@PutMapping 、@DeleteMapping置于对应方法上**
  - 含参的路径写在注解内，常用id
- **形参上的注解**
  - **@RequestBody**：json对象直接可转换，不需添加参数路径
  - **@PathVariable**：其他形参

## SSM整合

### 配置类

- SpringConfig
  - 配置类标识@Configuration
  - 包扫描@ComponentScan
  - 事务管理@EnableTransactionManagement
  - 配置文件@PropertySource
  - 导入第三方配置类@Import
- 第三方配置类
  - JdbcConfig
    - 构建DataSource数据源，DruidDataSource注入四要素，@Bean、@Value
    - 构建事务管理器，DateSourceTransactionManager，@Bean
  - MyBatis配置类MyBatisConfig
    - 构建SqlSessionFactoryBean，设置别名扫描，设置数据源，@Bean
    - 构建MapperScannerConfigurer，设置Dao包扫描
- SpringMvcConfig
  - 配置类标识@configuration
  - 包扫描@ComponentScan("com.botuer.controller")
  - 开启注解支持@EnableWebMvc

```java
@Configuration
//@ComponentScan(value = "com.botuer",excludeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION,classes = Controller.class))
@ComponentScan("com.botuer.service")
@EnableTransactionManagement
@PropertySource("classpath:druid.properties")
@Import({JdbcConfig.class,MybatisConfig.class})

public class SpringConfig {
}
```

```java
public class JdbcConfig {
    @Value("${druid.url}")
    private String url;
    @Value("${druid.driverClassName}")
    private String driverClassName;
    @Value("${druid.username}")
    private String username;
    @Value("${druid.password}")
    private String password;
   @Bean
    public DataSource dataSource(){
       DruidDataSource druidDataSource = new DruidDataSource();
       druidDataSource.setDriverClassName(driverClassName);
       druidDataSource.setUrl(url);
       druidDataSource.setUsername(username);
       druidDataSource.setPassword(password);
       return druidDataSource;
   }
   @Bean
    public PlatformTransactionManager platformTransactionManager(DataSource dataSource){
       DataSourceTransactionManager dataSourceTransactionManager = new DataSourceTransactionManager();
       dataSourceTransactionManager.setDataSource(dataSource);
       return dataSourceTransactionManager;
   }
}
```

```java
public class MybatisConfig {
    @Bean
    public SqlSessionFactoryBean sqlSessionFactory(DataSource dataSource){
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setTypeAliasesPackage("com.botuer.domain");
        sqlSessionFactoryBean.setDataSource(dataSource);
        return sqlSessionFactoryBean;
    }

    @Bean
    public MapperScannerConfigurer mapperScannerConfigurer(){
        MapperScannerConfigurer mapperScannerConfigurer = new MapperScannerConfigurer();
        mapperScannerConfigurer.setBasePackage("com.botuer.dao");
        return mapperScannerConfigurer;
    }
}
```

```java
@Configuration
@ComponentScan({"com.botuer.controller"})
@EnableWebMvc
public class SpringMvcConfig extends AbstractAnnotationConfigDispatcherServletInitializer {
    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class[]{SpringConfig.class};
    }

    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{SpringMvcConfig.class};
    }

    @Override
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }
    @Override
    protected Filter[] getServletFilters() {
        CharacterEncodingFilter characterEncodingFilter = new CharacterEncodingFilter();
        characterEncodingFilter.setEncoding("utf-8");
        return new Filter[]{characterEncodingFilter};
    }
}
```

### 功能模块

- 数据表

- pojo

- dao

- service与实现类

  - @Service
  - @Transactional
  - 整合Junit单元测试
    - 设置类运行器@RunWith(SpringJUnit4ClassRunner.class)
    - 加载配置类@ContextConfiguration(classes = {SpringConfig.class})
    - @Test

  **说明:**

  * bookDao在Service中注入的会提示一个红线提示，为什么呢?

    * BookDao是一个接口，没有实现类，接口是不能创建对象的，所以最终注入的应该是代理对象
    * 代理对象是由Spring的IOC容器来创建管理的
    * IOC容器又是在Web服务器启动的时候才会创建
    * IDEA在检测依赖关系的时候，没有找到适合的类注入，所以会提示错误提示
    * 但是程序运行的时候，代理对象就会被创建，框架会使用DI进行注入，所以程序运行无影响。

  * 如何解决上述问题?

    * 可以不用理会，因为运行是正常的

    * 设置错误提示级别

- controller

  - 类注解：简写@RestController、@RequestMapping("")
    - @Controller
    - @ResponseBody
    - @RequestMapping ("")
  - 方法 注解：
    - 查@GetMapping 
    - 增@PostMapping 
    - 改@PutMapping 
    - 删@DeleteMapping
  - 形参：
    - 请求参数@RequestParam
    - json对象封装@RequestBody
    - 可变路径@PathVariable
  - Autowired

```java
@RestController
@RequestMapping("/books")
public class BookController {
    @Autowired
    private BookService bookService;

    //新增
    @PostMapping
    public String save(@RequestBody Book book){
        bookService.save(book);
        return "['成功']";
    }
    //删除
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Integer id){
        bookService.delete(id);
        return "[0,0,0]";
    }
    //修改
    @PutMapping
    public String update(@RequestBody Book book){
        bookService.update(book);
        return "{'key':'hahaha'}";
    }
    //查询单个
    @GetMapping("/{id}")
    public Book getById(@PathVariable int id){
        Book book = bookService.getById(id);
        return book;
    }
    //查询所有
    @GetMapping
    public List<Book> getAll(){
        List<Book> books = bookService.getAll();
        return books;
    }
}
```

## 统一结果封装

返回的数据类型很多。前端解析数据比较凌乱，所以需要返回一个统一的数据结果，前端在解析的时候就可以按照一种方式进行解析。

在controller包下

### 结果类Result

* 封装数据到data属性中

* 封装操作结果到code属性中

* 封装特殊消息到message(msg)属性中

  ```java
  public class Result {
      //描述统一格式中的数据
      private Object data;
      //描述统一格式中的编码，用于区分操作，可以简化配置0或1表示成功失败
      private Integer code;
      //描述统一格式中的消息，可选属性
      private String msg;
  
      public Result() {
      }
  	//构造方法是方便对象的创建
      public Result(Integer code,Object data) {
          this.data = data;
          this.code = code;
      }
  	//构造方法是方便对象的创建
      public Result(Integer code, Object data, String msg) {
          this.data = data;
          this.code = code;
          this.msg = msg;
      }
  	//setter...getter...省略
  }
  ```

### 返回码类Code

```java
//状态码
public class Code {
    public static final Integer SAVE_OK = 20011;
    public static final Integer DELETE_OK = 20021;
    public static final Integer UPDATE_OK = 20031;
    public static final Integer GET_OK = 20041;

    public static final Integer SAVE_ERR = 20010;
    public static final Integer DELETE_ERR = 20020;
    public static final Integer UPDATE_ERR = 20030;
    public static final Integer GET_ERR = 20040;

}
```

controller修改后

```java
@RestController
@RequestMapping("/books")
public class BookController {
    @Autowired
    private BookService bookService;

    //新增
    @PostMapping
    public Result save(@RequestBody Book book){
        boolean flag = bookService.save(book);
        return new Result(flag? Code.SAVE_OK:Code.SAVE_ERR,flag);
    }
    //删除
    @DeleteMapping("/{id}")
    public Result delete(@PathVariable Integer id){
        boolean flag = bookService.delete(id);
        return new Result(flag? Code.DELETE_OK:Code.DELETE_ERR,flag);
    }
    //修改
    @PutMapping
    public Result update(@RequestBody Book book){
        boolean flag = bookService.update(book);
        return new Result(flag? Code.UPDATE_OK:Code.UPDATE_ERR,flag);
    }
    //查询单个
    @GetMapping("/{id}")
    public Result getById(@PathVariable int id){
        Book book = bookService.getById(id);
        String msg = book != null? "":"数据查询失败";
        return new Result(book != null? Code.GET_OK:Code.GET_ERR,book,msg);
    }
    //查询所有
    @GetMapping
    public Result getAll(){
        List<Book> books = bookService.getAll();
        String msg = books != null? "":"数据查询失败";
        return new Result(books != null? Code.GET_OK:Code.GET_ERR,books,msg);
    }
}
```

## 统一异常处理

出现异常直接弹500，返回前端的结果不在约定内

### 创建自定义异常类

- 异常太多，分为几类来处理

  - 业务异常（BusinessException）：发送提醒信息

  - 系统异常（SystemException）：发送安抚信息，并给运维发信息，记录日志

  - 未预期异常（Exception）：发送安抚信息，并给程序员发信息，记录日志

- 业务异常与系统异常：新建包exception，自定义异常类

  - BusinessException extends RuntimeException	

  - SystemException  extends RuntimeException

- 说明

  - 继承`RuntimeException`的好处是，业务类抛异常时，就不用再try...catch...或throws了

  - 添加`code`属性的原因是，为了更好的区分异常是来自哪个业务的

  - 提供两个构造器message，cause

```java
//自定义异常处理器，用于封装异常信息，对异常进行分类
public class BusinessException extends RuntimeException{
    private Integer code;
    public Integer getCode() {
        return code;
    }
    public void setCode(Integer code) {
        this.code = code;
    }
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }
    public BusinessException(Integer code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
}
```

### 包裹自定义异常

try-catch  和  手动throw

```java
public Result delete(@PathVariable Integer id){
    //业务异常
    if (id == 1) throw new BusinessException("请不要用技术挑战我的耐性",Code.BUSINESS_ERR) ;
   
    //系统异常
    try {
        int i = 1/0;
    } catch (Exception e) {
        throw new SystemException("服务器忙！！",e,Code.SYSTEM_TIMEOUT_ERR);
    }
    
    boolean flag = bookService.delete(id);
    String msg = flag? "":"删除失败";
    return new Result(flag? Code.DELETE_OK:Code.DELETE_ERR,flag,msg);
}
```

### 创建异常处理器类

- 在controller包下（确保能被springMvcConfig扫描到）
- @RestControllerAdvice
- @ExceptionHandler(异常类名)

```java
@RestControllerAdvice
public class ProjectExceptionAdvice {

    @ExceptionHandler(Exception.class)
    public Result doException(Exception e){
        return new Result(Code.SYSTEM_ERR,null,"异常来了");
    }
    @ExceptionHandler(SystemException.class)
    public Result doSystemException(SystemException e){
        return new Result(e.getCode(),null,e.getMessage());
    }
    @ExceptionHandler(BusinessException.class)
    public Result doBusinessException(BusinessException e){
        return new Result(e.getCode(),null,e.getMessage());
    }
}
```

## 前后台协议联调

后端放行静态资源

前端编写js

```js
// import {axios} from "../js/axios-0.18.0";

var vue = new Vue({

    el: '#app',
    data:{
        pagination: {},
		dataList: [],//当前页要展示的列表数据
        formData: {},//表单数据
        dialogFormVisible: false,//控制表单是否可见
        dialogFormVisible4Edit:false,//编辑表单是否可见
        rules: {//校验规则
            type: [{ required: true, message: '图书类别为必填项', trigger: 'blur' }],
            name: [{ required: true, message: '图书名称为必填项', trigger: 'blur' }]
        }
    },

    //钩子函数，VUE对象初始化完成后自动执行
    created() {
        this.getAll();
    },

    methods: {
        //列表
        getAll() {
            axios.get("/books").then((resp) =>{
                this.dataList = resp.data.data;
            });
        },

        //弹出添加窗口
        handleCreate() {
            this.dialogFormVisible = true;
            this.resetForm();//重置表单，否则有上次添加的数据
        },

        //重置表单
        resetForm() {
            this.formData = {};
        },

        //添加
        handleAdd () {
            //请求时要携带表单数据
            axios.post("/books",this.formData).then((resp) => {
                if (resp.data.code == 20011){
                    this.dialogFormVisible = false;
                    this.$message.success("添加成功");
                }else if (resp.data.code == 20010){
                    this.$message.error("添加失败");
                }else {
                    this.$message.error(resp.data.msg);
                }
            }).finally(() => {
                //回显
                this.getAll();
            });
        },

        //弹出编辑窗口
        handleUpdate(row) {
			//请求地址要有id
            axios.get("/books/" + row.id).then((resp) => {
                if (resp.data.code == 20041){
                    this.formData = resp.data.data;
                    this.dialogFormVisible4Edit = true;
                }else {
                    this.$message.error(resp.data.msg);
                }
            });
        },

        //编辑
        handleEdit() {
            axios.put("/books",this.formData).then((resp) => {
                if (resp.data.code == 20031){
                    this.$message.success("修改成功");
                    this.dialogFormVisible4Edit = false;
                }else if (resp.data.code == 20030){
                    this.$message.error("修改失败");
                }else {
                    this.$message.error(resp.data.msg);
                }
            }).finally(() => {
                this.getAll();
            });
        },

        // 删除
        handleDelete(row) {
            //人性化提示this.$confirm("提示信息","提示头").then(确认方法).catch(取消方法)
            this.$confirm("此操作永久删除当前数据，是否继续？","提示").then(() => {
                axios.delete("/books/" + row.id).then((resp) => {
                    if (resp.data.code == 20021){
                        this.$message.success("删除成功");
                    } else if (resp.data.code == 20020){
                        this.$message.error("删除失败");
                    }else {
                        this.$message.error(resp.data.msg);
                    }
                }).finally(() => {
                    this.getAll();
                });
            }).catch(() => {
                this.$message.info("取消删除");
            });
        }
    }
});
```

## 拦截器

### 概念

<img src="http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220606220514908.png" alt="image-20220606220514908" style="zoom:33%;" />



- 执行顺序
  - 浏览器发送一个请求会先到Tomcat的web服务器
  - Tomcat服务器接收到请求以后，会去判断请求的是静态资源还是动态资源
  - 如果是静态资源，会直接到Tomcat的项目部署目录下去直接访问
  - 如果是动态资源，就需要交给项目的后台代码进行处理
  - 在找到具体的方法之前，我们可以去配置过滤器(可以配置多个)，按照顺序进行执行
  - 然后进入到到中央处理器(SpringMVC中的内容)，SpringMVC会根据配置的规则进行拦截
  - 如果满足规则，则进行处理，找到其对应的controller类中的方法进行执行,完成后返回结果
  - 如果不满足规则，则不进行处理
- 拦截器概念：一种动态拦截方法调用的机制，在SpringMVC中动态拦截控制器方法的执行
- 与过滤器的区别
  - 归属不同：Filter属于Servlet技术，Interceptor属于SpringMVC技术
  - 拦截内容不同：Filter对所有访问进行增强，Interceptor仅针对SpringMVC的访问进行增强

### 拦截器开发

- 在controller包下建一个子包interceptor

- 创建类ProjectInterceptor,并实现HandlerIntercepor接口的三个方法

  - preHandler方法，如果返回true,则代表放行，会执行原始Controller类中要请求的方法，如果返回false，则代表拦截，后面的就不会再执行了。

    - request:请求对象，用法和servlet相同
    - response:响应对象，用法和servlet相同
    - handler:被调用的处理器对象，本质上是一个方法对象，对反射中的Method对象进行了再包装
      - 获取方法的相关信息
      - HandlerMethod hm = (HandlerMethod)handler;
        String methodName = hm.getMethod().getName();//可以获取方法的名称

  - postHandle

    - modelAndView:如果处理器执行完成具有返回结果，可以读取到对应数据与页面信息，并进行调整

      因为咱们现在都是返回json数据，所以该参数的使用率不高。

  - afterCompletion

    - ex：如果处理器执行过程中出现异常对象，可以针对异常情况进行单独处理  

      因为我们现在已经有全局异常处理器类，所以该参数的使用率也不高。

  ```java
  @Component
  public class ProjectInterceptor implements HandlerInterceptor {
      @Override
      public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
          System.out.println("原始方法调用前执行");
          return true;
      }
  
      @Override
      public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
          System.out.println("原始方法调用后执行");
      }
  
      @Override
      public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
          System.out.println("原始方法调用完成后执行");
      }
  }
  ```

- 添加注释Component，并保证能被SpringMvcConfig扫描到

- 配置拦截器类，添加/修改拦截规则，即SpringMvcSupport

  ```java
  @Configuration
  public class SpringMvcSupport extends WebMvcConfigurationSupport {
  
      @Autowired
      private ProjectInterceptor projectInterceptor;
  
      @Override
      protected void addInterceptors(InterceptorRegistry registry) {
          //registry.addInterceptor(projectInterceptor).addPathPatterns("/books");
          registry.addInterceptor(projectInterceptor).addPathPatterns("/books","/books/*");
      }
  
      @Override
      protected void addResourceHandlers(ResourceHandlerRegistry registry) {
          registry.addResourceHandler("/pages/**").addResourceLocations("/pages/");
          registry.addResourceHandler("/js/**").addResourceLocations("/js/");
          registry.addResourceHandler("/css/**").addResourceLocations("/css/");
          registry.addResourceHandler("/plugins/**").addResourceLocations("/plugins/");
          registry.addResourceHandler("/img/**").addResourceLocations("/img/");
      }
  }
  ```

- 拦截器类的简化:直接在SpringMvcConfig实现WebMvcConfigurer

  - 具有侵入性（耦合）

  ```java
  @Configuration
  @ComponentScan({"com.itheima.controller"})
  @EnableWebMvc
  //实现WebMvcConfigurer接口可以简化开发，但具有一定的侵入性
  public class SpringMvcConfig implements WebMvcConfigurer {
      @Autowired
      private ProjectInterceptor projectInterceptor;
  
      @Override
      public void addInterceptors(InterceptorRegistry registry) {
          //配置多拦截器
          registry.addInterceptor(projectInterceptor).addPathPatterns("/books","/books/*");
      }
  }
  ```

- 拦截器链配置

  - 当配置多个拦截器时，形成拦截器链
  - 拦截器链的运行顺序参照拦截器添加顺序为准
  - 当拦截器中出现对原始处理器的拦截，后面的拦截器均终止运行
  - 当拦截器运行中断，仅运行配置在前面的拦截器的afterCompletion操作
  - preHandle：与配置顺序相同，必定运行
  - postHandle、afterCompletion：与配置顺序相反，可能不运行

