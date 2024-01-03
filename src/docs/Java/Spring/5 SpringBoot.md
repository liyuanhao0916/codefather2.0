# SpringBoot

## 构建工程

- 注意打包方式为  **jar **

- idea快速构建

- 官网快速构建

  - https://spring.io/projects/spring-boot
    

  - 选择依赖


- 引导类

  - 项目的入口，运行main就可启动项目

  ```java
  @SpringBootApplication
  public class Application {
      public static void main(String[] args) {
          SpringApplication.run(Application.class, args);
      }
  }
  ```

- pom.xml

  - 起步依赖：名称含starter的依赖，可以减少依赖的配置
  - parent：继承的父模块，版本不同，管理的坐标不同
  - 父模块 spring-boot-starter-parent 的父模块 spring-boot-dependencies 中，`<properties>`中定义了各技术的依赖版本，避免不兼容，还包含了依赖管理，添加依赖或插件都不再需要版本号
  - spring-boot-starter-web包含了spring-web、spring-webmvc、spring-boot-starter-tomcat“内置tomcat”
  - 需要使用技术，只需要引入该技术对应的起步依赖即可

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
      <modelVersion>4.0.0</modelVersion>
      
      <!--指定了一个父工程，父工程中的东西在该工程中可以继承过来使用-->
      <parent>
          <groupId>org.springframework.boot</groupId>
          <artifactId>spring-boot-starter-parent</artifactId>
          <version>2.5.0</version>
      </parent>
      <groupId>com.itheima</groupId>
      <artifactId>springboot_01_quickstart</artifactId>
      <version>0.0.1-SNAPSHOT</version>
  
      <!--JDK 的版本-->
      <properties>
          <java.version>8</java.version>
      </properties>
      
      <dependencies>
          <!--该依赖就是我们在创建 SpringBoot 工程勾选的那个 Spring Web 产生的-->
          <dependency>
              <groupId>org.springframework.boot</groupId>
              <artifactId>spring-boot-starter-web</artifactId>
          </dependency>
  		<!--这个是单元测试的依赖，我们现在没有进行单元测试，所以这个依赖现在可以没有-->
          <dependency>
              <groupId>org.springframework.boot</groupId>
              <artifactId>spring-boot-starter-test</artifactId>
              <scope>test</scope>
          </dependency>
      </dependencies>
  
      <build>
          <plugins>
              <!--这个插件是在打包时需要的，而这里暂时还没有用到-->
              <plugin>
                  <groupId>org.springframework.boot</groupId>
                  <artifactId>spring-boot-maven-plugin</artifactId>
              </plugin>
          </plugins>
      </build>
  </project>
  ```

  

## 启动工程

- 问题：前端不会安装tomcat、idea

- 打成jar包交给前端后，只需要前端连接对应数据库

- 打包：依赖于pom文件的插件，执行maven的package命令即可，必须有，否则打包会出问题

- 启动：在jar包所在位置，cmd中 

  ```shell
   jar -jar 文件名.jar
  ```

## 切换服务器

使用jetty服务器，只需在spring-boot-starter-web依赖中排除内置的tomcat服务器，再添加jetty服务器依赖即可   spring-boot-starter-jetty

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <artifactId>spring-boot-starter-tomcat</artifactId>
            <groupId>org.springframework.boot</groupId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jetty</artifactId>
</dependency>
```

## 配置文件与yaml

- properties、yaml、yml配置文件其实都可以，现在主流的是yaml类型的，其中yml最受欢迎，yaml和yml语法基本相同

- 同时存在时优先级：`application.properties`  >  `application.yml`   >  `application.yaml`

- YAML（YAML Ain't Markup Language），一种数据序列化格式

- 优点：容易阅读、容易与脚本语言交互、以数据为核心，重数据轻格式

- yml语法：

  - 冒号后面有空格不能省略
  - 用“ **---** ”即**三个减号**表示一份内容的**开始**（“ **...** ”表示结束（可省略））
  - 大小写敏感
  - 冒号 或 key结束
  - 层级缩进只能空格：空格的个数并不重要，只要保证同层级的左侧对齐即可
  - \## 表示注释
  - 数组：换行  - 元素

- SpringBoot的配置文件名必须是application

- 直接把生成的application.properties后缀名改为yml

- 配置端口号

  ```yaml
  server:
    port: 80
  ```

- 修改日志级别

  ```yaml
  logging:
    level:
      root: info
  ```

- 读取数据

  - 方式一：@Value("${一级属性名.二级属性名……}")

  ```java
  @Value("${lesson}")
  private String lesson;
  @Value("${server.port}")
  private String port;
  @Value("${enterprise.subject[0]}")
  private String subject;
  
  
  @GetMapping("/{id}")
  public String getById(@PathVariable int id){
      System.out.println(lesson);
      System.out.println(port);
      System.out.println(subject);
      return "hello!";
  }
  ```

  - 方式二： `@Autowired` 注解注入 `Environment` 对象，`getProperty(String name)` 方法获取

    - 框架开发中用的多，实际开发不用

    ```java
    @Autowired
    private Environment environment;
    
    @GetMapping("/{id}")
    public String getById(@PathVariable int id){
        System.out.println(environment.getProperty("lesson"));
        System.out.println(environment.getProperty("server.port"));
        System.out.println(environment.getProperty("enterprise.subject[0]"));
        return "hello!";
    }
    ```

  - 自定义对象：将配置文件中的数据封装到我们自定义的实体类对象中

    - 创建实体类，添加@Component，Bean交由spring管理

    - 使用 `@ConfigurationProperties` 注解表示加载配置文件，使用 `prefix` 属性指定只加载指定前缀的数据

    - 注入

    - 注意：出现如下警告，需要添加依赖


      ```xml
      <dependency>
          <groupId>org.springframework.boot</groupId>
          <artifactId>spring-boot-configuration-processor</artifactId>
          <optional>true</optional>
      </dependency>
      ```

    ```java
    @Component
    @ConfigurationProperties(prefix = "enterprise")
    public class Enterprise {
        private String name;
        private int age;
        private String tel;
        private String[] subject;
    //toString、getter、setter略
    }
    ```

    ```java
    @Autowired
    private Enterprise enterprise;
    
    @GetMapping("/{id}")
    public String getById(@PathVariable Integer id){
        System.out.println(enterprise.getName());
        System.out.println(enterprise.getAge());
        System.out.println(enterprise.getSubject());
        System.out.println(enterprise.getTel());
        System.out.println(enterprise.getSubject()[0]);
        return "hello , spring boot!";
    }
    ```

## 多环境配置

- yml配置

```yaml
#设置启用的环境
spring:
  profiles:
    active: dev

---
#开发
spring:
  profiles: dev #给开发环境起的名字
server:
  port: 80
---
#生产
spring:
  profiles: pro #给生产环境起的名字
server:
  port: 81
---
#测试
spring:
  profiles: test #给测试环境起的名字
server:
  port: 82
---
```

==注意：==

​	在上面配置中给不同配置起名字的 `spring.profiles` 配置项已经过时。最新用来起名字的配置项是 

```yaml
#开发
spring:
  config:
    activate:
      on-profile: dev
```

- properties配置：`properties` 类型的配置文件配置需要写在多个文件中：`application-dev.properties` 、`application-test.properties`等，然后在`application.properties`中设置默认加载哪个配置

```properties
server.port=80
```

```properties
spring.profiles.active=pro
```

- 命令行启动参数设置

  - 改环境

    ```shell
    java –jar xxx.jar –-spring.profiles.active=test
    ```

  - 改端口

    ```shell
    java –jar xxx.jar –-server.port=88
    ```

  当然也可以同时设置多个配置，比如即指定启用哪个环境配置，又临时指定端口，如下

  ```shell
  java –jar springboot.jar –-server.port=88 –-spring.profiles.active=test
  ```

  大家进行测试后就会发现命令行设置的端口号优先级高（也就是使用的是命令行设置的端口号），配置的优先级其实 `SpringBoot` 官网已经进行了说明，参见 :https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-external-config

  进入上面网站后会看到如下页面

  <img src="http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220609034432393.png" alt="image-20220609034432393" style="zoom:33%;" />

  如果使用了多种方式配合同一个配置项，优先级高的生效。

## 配置文件分类

`SpringBoot` 中4级配置文件放置位置：

* 1级：classpath：application.yml  
* 2级：classpath：config/application.yml
* 3级：file ：application.yml
* 4级：file ：config/application.yml 

> ==说明：==级别越高优先级越高

## 整合junit

已经生成了测试类，直接写就行

> @SpringBootTest代替了@RunWith和@ContextConfiguration
>
> 测试引导类所在包必须是测试类所在包及其子包。否则需要用classes属性指定@SpringBootTest(classes = Springboot07TestApplication.class)

## 整合MyBatis

- 创建工程时引入MyBatis和MySQL Driver技术

<img src="http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220609035354425.png" alt="image-20220609035354425" style="zoom:33%;" />

- 在yml配置文件中编写datesource四要素

  ```yaml
  spring:
    datasource:
      driver-class-name: com.mysql.jdbc.Driver
      url: jdbc:mysql://localhost:3306/ssm_db
      username: root
      password: root
  ```

- 添加druid依赖

- 在yml配置文件中配置连接池

  ```yaml
  spring:
    datasource:
      driver-class-name: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql://localhost:3306/ssm_db
      username: root
      password: root
      type: com.alibaba.druid.pool.DruidDataSource
  ```

  