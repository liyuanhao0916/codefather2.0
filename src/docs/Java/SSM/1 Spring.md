# Spring

## Spring系统架构

spring全称Spring Framework

* Spring Framework是Spring生态圈中最基础的项目，是其他项目的根基。

* Spring Framework的发展也经历了很多版本的变更，每个版本都有相应的调整

  ![image-20210729172153796](http://minio.botuer.com\ssm\基础框架8笔记\Spring笔记\spring_day01\assets\image-20210729172153796.png)

* Spring Framework的5版本目前没有最新的架构图，而最新的是4版本，所以接下来主要研究的是4的架构图

  ![1629720945720](http://minio.botuer.com\ssm\基础框架8笔记\Spring笔记\spring_day01\assets\1629720945720.png)

  (1)核心层

  * Core Container:核心容器，这个模块是Spring最核心的模块，其他的都需要依赖该模块

  (2)AOP层

  * AOP:面向切面编程，它依赖核心层容器，目的是==在不改变原有代码的前提下对其进行功能增强==
  * Aspects:AOP是思想,Aspects是对AOP思想的具体实现

  (3)数据层

  * Data Access:数据访问，Spring全家桶中有对数据访问的具体实现技术
  * Data Integration:数据集成，Spring支持整合其他的数据层解决方案，比如Mybatis
  * Transactions:事务，Spring中事务管理是Spring AOP的一个具体实现，也是后期学习的重点内容

  (4)Web层

  * 这一层的内容将在SpringMVC框架具体学习

  (5)Test层

  * Spring主要整合了Junit来完成单元测试和集成测试

## IOC

### IOC概述

- **IOC**（Inversion of Control）控制反转
  - 底层原理：xml解析、工厂模式、反射
- **IOC容器**

  - 创建对象，初始化对象

  - 被创建、管理的对象称为Bean
- **Bean**：IOC容器中存放的就是Bean
- **DI**（Dependency Injection）依赖注入
  - 把需要的对象，通过IOC容器注入进来
  - 构造器注入 -- 提供对应含参构造器 -- 强制依赖时，setter注入容易出现null
  - setter注入 -- 提供对应set方法 -- 可选依赖灵活性高
- **IOC操作Bean管理**
  - 创建对象
  - 依赖注入
  - xml管理
  - 注解管理
- **BeanFactory**：底层工厂模式中，用来创建Bean的接口，**延迟加载**，需要bean对象时才会创建
- **ApplicationContext**：BeanFactory的子接口，常用两个实现类，**立即加载**，想要延迟加载，在`<bean>`添加属性 lazy-init="true"
  - FileSystemXmlApplicationContext（了解），需要写xml文件全路径
  - ClassPathXmlApplicationContext，当前工程下的xml，直接写文件名
  - AnnotationConfigApplicationContext，加载注解配置类

### xml操作Bean管理

- 创建工程、添加依赖

  ```xml
  <dependencies>
      <dependency>
          <groupId>org.springframework</groupId>
          <artifactId>spring-context</artifactId>
          <version>5.2.10.RELEASE</version>
      </dependency>
      <dependency>
          <groupId>junit</groupId>
          <artifactId>junit</artifactId>
          <version>4.12</version>
          <scope>test</scope>
      </dependency>
  </dependencies>
  ```

- 创建Service、dao的包、接口、实现类

- 添加spring配置文件【applicationContext.xml】，配置Bean，注入依赖

  - `<bean>`配置Bean

    - id唯一标识
    - class全类名
    - scope：`singleton`默认为单例，`prototype`为非单例
    - name：别名，为了解决命名不规范（了解）
    - `<property>`注入属性
      - name属性名
      - ref：引用类型的赋值，对应Bean的id
      - value：基本类型、String的赋值
      - `<array>、<list>、<set>`数组、List集合、Set集合注入
        - `<value>数组元素</value>`
        - `<ref bean="对应Bean的id"></ref>`

      - `<map>`Map集合注入 
        - `<entry key="" value="">``</entry>`
    - `<constructor-arg>`构造器注入 --需提供对应含参构造器

      - name + value/ref 按构造器中参数名
      - type + value/ref 按类型注入（一般不选这个，除非构造方法参数名经常变）
      - index + value/ref 按参数索引
      - `<array>`、`<list>`、`<set>`、`<map>`

    

    

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.springframework.org/schema/beans
                               http://www.springframework.org/schema/beans/spring-beans.xsd">
    
        <bean id="唯一标识" class="全类名"/>
        <bean id="唯一标识" class="全类名" name="别名">
            <property name="属性名" ref="对应Bean的id"/>
            <property name="属性名">
            	<list>
                    <value>你好</value>
                    <value>哈喽</value>
                </list>
            </property>
            <property name="属性名">
            	<map>
                	<entry key="1" value="Java"></entry>
                    <entry key="2" value="MySQL"></entry>
                </map>
            </property>
        </bean>
    </beans>
    ```

  - 集合元素的提取

    - 引入命名空间util
    - 提取集合属性注入
    - 使用集合属性注入

  ```xml
  <?xml version="1.0" encoding="UTF-8"?> 
   <!--1 引入命名空间util--> 
  <beans xmlns="http://www.springframework.org/schema/beans"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns:p="http://www.springframework.org/schema/p" 
         xmlns:util="http://www.springframework.org/schema/util" 
         xsi:schemaLocation="http://www.springframework.org/schema/beans
                             http://www.springframework.org/schema/beans/spring-beans.xsd 
                             http://www.springframework.org/schema/util
                             http://www.springframework.org/schema/util/spring-util.xsd">
  
      <!--2 提取list集合类型属性注入--> 
      <util:list id="bookList">
  		<value>易筋经</value> 
          <value>九阳神功</value> 
      </util:list> 
      <!--3 提取list集合类型属性注入使用--> 
      <bean id="book" class="com.atguigu.spring5.collectiontype.Book"> 
          <property name="list" ref="bookList"></property> 
      </bean>
  </beans>
  ```

- 获取IOC容器，获取对象并调用方法

  ```java
  ApplicationContext ioc = new ClassPathXmlApplicationContext(applicationContext.xml)；
  BookDao bookDao = ioc.getBean("id名",类型名)
  //调用方法    
  ```

### xml自动装配

对应一些引用类型的成员变量，可以实现自动装配，**基本类型不能自动装配**

自动装配优先级低于setter注入与构造器注入，同时出现时自动装配配置失效

- 装配规则：首选根据类型，接口有多个实现类时使用根据名称

- `<bean>`添加 autoWire 属性，值为 ByName、ByType

  - 注意ByName时，属性必须和id一致（每个bean的id和属性（set的对应名）对应一致）
  - `NoUniqueBeanDefinitionException`报错，找到有多个对象，使用ByName

  ```xml
  <bean id="emp" class="com.atguigu.spring5.autowire.Emp" autowire="byName"></bean> 
  <bean id="dept" class="com.atguigu.spring5.autowire.Dept"></bean>
  
  <bean id="emp" class="com.atguigu.spring5.autowire.Emp" autowire="byType"></bean> 
  <bean id="dept" class="com.atguigu.spring5.autowire.Dept"></bean>
  ```

### 配置第三方Bean--数据源

- 添加依赖

- 配置Druid连接池的Bean

  - 内部

    ```xml
    <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">
        <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://localhost:3306/spring_db"/>
        <property name="username" value="root"/>
        <property name="password" value="root"/>
    </bean>
    ```

  - 外部properties文件

    - 引入命名空间context

    ```xml
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:p="http://www.springframework.org/schema/p" 
           xmlns:util="http://www.springframework.org/schema/util" 
           xmlns:context="http://www.springframework.org/schema/context"
           xsi:schemaLocation="http://www.springframework.org/schema/beans 
                               http://www.springframework.org/schema/beans/spring-beans.xsd 
                               http://www.springframework.org/schema/util 
                               http://www.springframework.org/schema/util/spring-util.xsd 
                               http://www.springframework.org/schema/context 
                               http://www.springframework.org/schema/context/spring-context.xsd">
     	<!--引入外部属性文件--> 
        <context:property-placeholder location="classpath:jdbc.properties"/> 
        <!--配置连接池--> 
        <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource"> 
            <property name="driverClassName" value="${prop.driverClass}"></property> 
            <property name="url" value="${prop.url}"></property> 
            <property name="username" value="${prop.userName}"></property> 
            <property name="password" value="${prop.password}"></property> 
        </bean>
    </beans>
    ```

  注意：

  - properties中key值最好加上前缀，比如username，在系统中也有这个配置，xml加载时系统的比我们写的优先级高，导致出错（不加前缀需要给context:property-placeholder加一个属性system-properties-mode="NEVER"）
  - 关于加载properties
    - location="jdbc.properties,jdbc2.properties"，多个以逗号分隔
    - location="classpath:*.properties"，`classpath:`代表的是从根路径下开始查找，但是只能查询当前项目的根路径，不加也可以，但是不标准
    - location="classpath\*:*.properties"，加载当前项目及所依赖的项目

- 获取对象

  ```java
  ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
  DataSource dataSource = (DataSource) ctx.getBean("dataSource");
  ```


<img src="http://minio.botuer.com\image-20220601180848969.png" alt="image-20220601180848969" style="zoom:50%;" />

<img src="http://minio.botuer.com\image-20220601180956689.png" alt="image-20220601180956689" style="zoom:50%;" />

### -------- 细节 --------

### Bean的实例化

- （重点）构造器实例化

  - 利用反射，通过调用空参构造器进行实例化
  - 报错从最底层看
    - java.lang.NoSuchMethodException:抛出的异常为`没有这样的方法异常`
    - 类名.`<init>`():没有找到某类的init方法，`<init>`()指类的无参构造方法
    - 第二层：nested:嵌套的意思，后面的异常内容和最底层的异常是一致的

- 静态工厂实例化(了解，现在主要为了兼容老系统)

  - xml配置
    - id
    - class工厂类
    - factory-method：工厂类中创建对象的方法名

  - 工厂类提供一个创建对象的静态方法

  ```xml
  <bean id="orderDao" class="工厂类全类名" factory-method="getOrderDao"/>
  ```

  - Why：工厂类创建对象的方法中可实现一些业务逻辑

- 实例工厂实例化

  - xml配置
    - id、class
    - factory-bean对应工厂类id、factory-method

  ```xml
  <bean id="userFactory" class="工厂类全类名"/>
  <bean id="userDao" factory-bean="userFactory" factory-method="getUserDao"/>
  ```

  - **工厂类提供的方法非静态，所有需要工厂类的`<Bean>`**

- （重点）FactoryBean

  - FactoryBean实际上是实例工厂的一种

  - 创建FactoryBean类，实现FactoryBean接口，重写两个方法，第三个方法默认单例

    - getObject（），返回实现类对象
    - getObjectType（），返回创建的接口类型

    ```java
    public class UserDaoFactoryBean implements FactoryBean<UserDao> {
        //代替原始实例工厂中创建对象的方法
        @Override
        public UserDao getObject() throws Exception {
            return new UserDaoImpl();
        }
        //返回所创建类的Class对象
        @Override
        public Class<?> getObjectType() {
            return UserDao.class;
        }
        //默认单例
        @Override
        public boolean isSingleton() {
            return false;
        }
    }
    ```

  - 配置xml

    ```xml
    <bean id="userDao" class="FactoryBean全类名"/>
    ```

### 属性注入

- 外部`<Bean>`

- 内部`<Bean>`

  ```xml
  <!--内部bean--> 
  <bean id="emp" class="com.atguigu.spring5.bean.Emp"> 
      <!--设置两个普通属性--> 
      <property name="ename" value="lucy"></property> 
      <property name="gender" value="女"></property> 
      <!--设置引用类型属性--> 
      <property name="dept"> 
          <bean id="dept" class="com.atguigu.spring5.bean.Dept"> 
              <property name="dname" value="安保部"></property> 
          </bean> 
      </property> 
  </bean>
  ```

- 级联赋值

  - 外部`<Bean>`

    ```xml
    <bean id="emp" class="com.atguigu.spring5.bean.Emp"> 
        <property name="ename" value="lucy"></property> 
        <property name="gender" value="女"></property> 
        <property name="dept" ref="dept"></property> 
    </bean> 
    <bean id="dept" class="com.atguigu.spring5.bean.Dept">     
        <property name="dname" value="财务部"></property> 
    </bean>
    ```

  - 级联赋值

    ```xml
    <bean id="emp" class="com.atguigu.spring5.bean.Emp"> 
        <property name="ename" value="lucy"></property>
    	<property name="gender" value="女"></property> 
        <property name="dept" ref="dept"></property> 
        <property name="dept.dname" value="技术部"></property> 
    </bean> 
    <bean id="dept" class="com.atguigu.spring5.bean.Dept"/> 
    ```

### 单例的线程安全问题

- 有状态对象（用来存储数据的成员变量），存在线程安全
- 无状态对象，只通过局部变量存储数据，不存在安全
- 封装的实例对象，不适合交给IOC容器管理

### Bean的生命周期

Spring的IOC容器是运行在JVM中----启动 JVM 后，解析xml，生成IOC容器

（1）通过构造器创建bean实例（无参数构造）

（2）为bean的属性设置值和对其他bean引用（调用set方法） 

（3）（了解）把bean实例传递bean后置处理器的方法postProcessBeforeInitialization

​				创建一个类，实现BeanPostProcessor接口，重写postProcessBeforeInitialization方法

（4）调用bean的初始化的方法（需要进行配置初始化的方法）

​    			初始化方式一：对应类提供初始化方法init（方法名随意），在xml添加Bean属性 init-method="init"

​				初始化方式二：实现InitializingBean接口，重写afterPropertiesSet方法，不要配置xml

（5）（了解）把bean实例传递bean后置处理器的方法 postProcessAfterInitialization

​				在实现了BeanPostProcessor接口的类中，重写postProcessAfterInitialization方法

（6）bean可以使用了（对象获取到了）

（7）当容器关闭时候，调用bean的销毁的方法（需要进行配置销毁的方法）

​			首先需要先关闭容器：

​				关闭方式一：创建容器对象时不要以ApplicationContext接口接，用实现类接（如ClassPathXmlApplicationContext），然后调用close方法

​				**关闭方式二：注册钩子关闭，容器对象调用方法registerShutdownHook()**，注意：ApplicationContext接口也没有此方法

​			两种方式对比：方式一是调用close方法强制关闭，而方式二是在 JVM 关闭时触发钩子，自动关闭



​				销毁方式一：对应类提供初始化方法destroy（方法名随意），在xml添加Bean属性 destroy-method="destroy"

​				销毁方式二：实现DisposableBean（disposable"一次性的"）接口，重写destroy方法，不需要xml配置

### ------ 注解操作 ------

### 配置Bean

- **@Component("id")	配置Bean**	

  - ”组件“

  - 相当于`<bean>` id可不写，默认为类名首字母小写

  - **@Controller用于控制层，@Service用于业务层，@Repository用于数据层**

- xml配置包扫描

  - base-package  包名
  - use-default-filters = "false" 不使用默认过滤
  - \`<context:include-filter   type=""  expression=""/>`     包括
  - \`<context:exclude-filter>`   type=""  expression=""/>  排除

  ```xml
  <context:component-scan base-package="com.itheima"/>
  ```

### 注入依赖

- 属性注入
  - **@Autowired**   ”自动装配“  默认按类型，多个实现类找类名首字母小写，找不到报错`NoUniqueBeanDefinitionException`  不需要set方法（反射暴力注入）
  - **@Qualifier**（”对应id“）  按名称，必须配合@Autowired一起
  - @Resource（name=”“）  不带括号按类型，有name属性按名称
  - @Value("")  注入基本类型和string类型，
    - 读配置文件，需要在配置类加注解@PropertySource（“”），和包扫描用法基本一致

### 完全注解开发

- 添加注解@Configuration
- 添加包扫描注解@ComponentScan(basePackages = {"com.atguigu"})，多个用大括号集合
- 依赖注入需要读取配置文件时还需要@PropertySource（“”）

### 第三方Bean（基本类型）--连接池

- 创建一个配置类
- 添加注释`<bean>`，使DataSource对象能够被IOC容器管理（durid的必须是DruidDataSource）
- 该配置类能被找到的两种方式，
  - 添加注解@Configuration  然后  在spring配置类中添加包扫描
  - 直接在spring配置类中添加注解@Import（“配置类名”）

```java
public class JdbcConfig {
    @Value("${driver}")
    private String driver;
    @Value("${url}")
    private String url;
    @Value("${userName}")
    private String userName;
    @Value("${password}")
    private String password;
	@Bean
    public DataSource dataSource(){
        DruidDataSource ds = new DruidDataSource();
        ds.setDriverClassName(driver);
        ds.setUrl(url);
        ds.setUsername(userName);
        ds.setPassword(password);
        return ds;
    }
}
```

### 第三方Bean（引用类型）--整合MyBatis

- 配置类中@Bean创建的对象已经交由IOC容器管理，可以直接使用

  ```java
  @Bean
  public  SqlSessionFactoryBean sqlSessionFactory(DataSource dataSource){
      SqlSessionFactoryBean ssfb = new SqlSessionFactoryBean();
      ssfb.setTypeAliasesPackage("com.botuer.domain");
      ssfb.setDataSource(dataSource);
      return ssfb;
  }
  ```

### 细节

- Bean的作用范围：@scope("prototype")非单例，没有该注解默认单例

- Bean的生命周期

  - @PostConstruct  用于初始化方法

  - @PreDestroy       用于销毁方法

    jdk9以后需要导入依赖

    ```xml
    <dependency>
      <groupId>javax.annotation</groupId>
      <artifactId>javax.annotation-api</artifactId>
      <version>1.3.2</version>
    </dependency>
    ```

<img src="http://minio.botuer.com\image-20220601195931872.png" alt="image-20220601195931872" style="zoom:50%;" />

### 整合MyBatis

- 创建数据库表

- 添加依赖spring-context、druid、mybatis、mysql、spring-jdbc，mybatis-spring

- 创建domain实现Serializable“序列化”接口

- 创建dao接口

- 创建service接口及实现类，并在实现类加注解@Service

- 创建druid.properties配置文件

- 创建spring配置类

  ```java
  @Configuration
  @ComponentScan("com.botuer")
  @PropertySource("classpath:druid.properties")
  @Import({JdbcConfig.class,MybatisConfig.class})
  public class SpringConfig {
  }
  ```

- 创建数据源配置类

  ```java
  public class JdbcConfig {
      @Value("${druid.driverClassName}")
      private String driver;
      @Value("${druid.url}")
      private String url;
      @Value("${druid.username}")
      private String username;
      @Value("${druid.password}")
      private String password;
      @Bean
      public DataSource dataSource(){
          DruidDataSource dds = new DruidDataSource();
          dds.setDriverClassName(driver);
          dds.setUrl(url);
          dds.setUsername(username);
          dds.setPassword(password);
          return dds;
      }
  }
  ```

- 创建MyBatis配置类

  - 使用SqlSessionFactoryBean封装SqlSessionFactory需要的环境信息

    - SqlSessionFactoryBean是前面我们讲解FactoryBean的一个子类，在该类中将SqlSessionFactory的创建进行了封装，简化对象的创建，我们只需要将其需要的内容设置即可。
    - 方法中有一个参数为dataSource,当前Spring容器中已经创建了Druid数据源，类型刚好是DataSource类型，此时在初始化SqlSessionFactoryBean这个对象的时候，发现需要使用DataSource对象，而容器中刚好有这么一个对象，就自动加载了DruidDataSource对象。

    <img src="http://minio.botuer.com\image-20220601234631921.png" alt="image-20220601234631921" style="zoom:33%;" />

  - 使用MapperScannerConfigurer加载Dao接口，创建代理对象保存到IOC容器中

    - 这个MapperScannerConfigurer对象也是MyBatis提供的专用于整合的jar包中的类，用来处理原始配置文件中的mappers相关配置，加载数据层的Mapper接口类

    - MapperScannerConfigurer有一个核心属性basePackage，就是用来设置所扫描的包路径

      <img src="http://minio.botuer.com\image-20220601234738784.png" alt="image-20220601234738784" style="zoom:33%;" />

  ```java
  public class MybatisConfig {
      //定义bean，SqlSessionFactoryBean，用于产生SqlSessionFactory对象
      @Bean
      public SqlSessionFactoryBean sqlSessionFactory(DataSource dataSource){
          SqlSessionFactoryBean ssfb = new SqlSessionFactoryBean();
          //设置模型类的别名扫描
          ssfb.setTypeAliasesPackage("com.botuer.domain");
          //设置数据源
          ssfb.setDataSource(dataSource);
          return ssfb;
      }
      //定义bean，返回MapperScannerConfigurer对象，Mybatis的dao没有实现类，有了这个Bean，才能在service层自动注入
      @Bean
      public MapperScannerConfigurer mapperScannerConfigurer(){
          MapperScannerConfigurer msc = new MapperScannerConfigurer();
          msc.setBasePackage("com.botuer.dao");
          return msc;
      }
  }
  ```

### 整合Junit

- 添加依赖junit、spring-test

- test\java下创建一个类，名字随意

- @RunWith(SpringJUnit4ClassRunner.class)

- @ContextConfiguration(classes = 配置类.class)

  ```java
  //设置类运行器
  @RunWith(SpringJUnit4ClassRunner.class)
  //设置Spring环境对应的配置类
  @ContextConfiguration(classes = {SpringConfig.class}) //加载配置类
  //@ContextConfiguration(locations={"classpath:applicationContext.xml"})//加载配置文件
  public class UserServiceTest {
      //支持自动装配注入bean
      @Autowired
      private UserService userService;
      @Test
      public void testFindById(){
          System.out.println(userService.findById(1));
      }
  }
  ```

## AOP

### AOP概述

- AOP(Aspect Oriented Programming)面向切面编程
- 原理：动态代理（使用JDK动态代理）
- 连接点：实现类所有可以被增强的方法
- 切入点：需要增强的方法
- 切入点表达式：execution([权限修饰符] [返回类型] [类全路径] \[方法名称]([参数列表]) )
  - 权限修饰符默认public，可以省略
  - 返回值类型一般用*代替，可返回任意类型
  - 参数列表直接写参数类型，多个用逗号隔开，*代表任意一个，参数类型不明确可以用..
  - 类/接口的全类名，可以com.*   execution(* com.atguigu.dao.BookDao.* (..))
    - 切入点通常描述接口，而不描述实现类,如果描述到实现类，就出现紧耦合了
    - 接口名通常写成如\*Service这样
  - 方法名可以用*    execution(* com.atguigu.dao.*.* (..))
    - 通常以动词匹配，如get*
  - *号多时倒着看
- 通知（增强）：增强方法，单独一个通知类用来写通知方法
  - 环绕通知  @Around  
  - 前置通知  @Before
  - 最终通知  @After  一定会返回
  - 后置通知  @AfterReturning  有异常不返回
  - 异常通知  @AfterThrowing
- 切面：将切入点和通知联系起来，把通知应用到切入点的动作
- 目标对象(Target)：需要增强的类对应的对象
- 代理(Proxy)

### AOP操作

- 添加依赖：spring-context、aspectjweaver

- 创建domain实现Serializable“序列化”接口

- 创建dao接口和实现类作为连接点

- 创建通知类，加注解@Component、@Aspect“切面”

- spring配置文件，添加包扫描，开启注解格式AOP功能@EnableAspectJAutoProxy（自动创建代理对象）
  - 定义切入点，随便定义一个方法，并加注解@Pointcut("execution(void com.itheima.dao.BookDao.update())")
    - 切入点定义依托一个不具有实际意义的方法进行，即无参数、无返回值、方法体无实际逻辑。

- 切面，在增强方法上，添加通知注释（如@Before），参数为定义切入点的无实际意义的方法名
- 有多个增强类多同一个方法进行增强，设置增强类优先级，数字类型值越小优先级越高   @Order(1)

**重点：环绕通知@Around的使用**

- 为了能调用原始方法，需要传入一个参数(ProceedingJoinPoint   pjp)
- 前置
- 调用原始方法   pjp.proceed();
- 后置

**获取参数**

* JoinPoint：适用于前置、后置、返回后、抛出异常后通知   getArgs()
* ProceedingJoinPoint：适用于环绕通知   proceed()、getArgs()、getSignature()

如果原始方法有返回值，通知方法返回值用Object，更重要的是，通知方法可以直接修改原方法的参数和返回值

- 获取参数，然后修改

- 获取返回值，并修改时，需要在通知方法上再加一个属性returning = "**与第二个参数名一致**"

- **JoinPoint类型参数放在首位**

  ```java
  @AfterReturning(value = "pt()",returning = "ret")
  public void afterReturning(JoinPoint jp,Object ret) {
     	//获取参数并修改
     	Object[] args = pjp.getArgs();
     	args[0] = 666;
     	Object ret = pjp.proceed(args);
      return ret + 1;  
  }
  ```

**获取异常**

- 在环绕通知中的Object ret = pjp.proceed()上try-catch，在catch中获取异常并抛出

- 在最终通知或后置通知中获取抛出的异常，并处理   throwing属性值与参数名要对应

  ```java
  @Around("pt()")
  public Object around(ProceedingJoinPoint pjp){
      Object ret = null;
      try{
          ret = pjp.proceed(args);
      }catch(Throwable throwable){
          t.printStackTrace();
      }
      return ret;
  }
  
  @AfterThrowing(value = "pt()",throwing = "t")
  public void afterThrowing(Throwable t) {
  }
  ```

**获取执行方法符类名、方法名** --- 效率测试时想知道方法执行的类名和方法名可以调用方法：

- Signature signature = pjp.getSignature();
- String className = signature.getDeclaringTypeName();
- String methodName = signature.getName();

```java
@Component
@Aspect
public class MyAdvice {
    @Pointcut("execution(void com.itheima.dao.BookDao.update())")
    private void pt(){}
    
    @Around("pt()")
    public void around(ProceedingJoinPoint pjp) throws Throwable{
        //获取执行签名信息
        Signature signature = pjp.getSignature();
        //通过签名获取执行操作名称(接口名)
        String className = signature.getDeclaringTypeName();
        //通过签名获取执行操作名称(方法名)
        String methodName = signature.getName();
        System.out.println("around before advice ...");
        //表示对原始操作的调用
        pjp.proceed();
        System.out.println("around after advice ...");
       
    }
}
```

### 工作流程

- Spring容器启动，加载类，加载Bean
- 读取所有切面配置中的切入点（被切面配置的才会读取）
- 初始化Bean
- 与切入点中方法名匹配
  - 找到需要增强的方法，创建实现接口的代理对象，执行代理对象的方法，在该方法中会对原始方法进行功能增强
  - 未找到的方法，即不需要增强，直接创建对象，调用本身的方法

### XML配置

```xml
<!--创建对象--> 
<bean id="book" class="com.atguigu.spring5.aopxml.Book"></bean> 
<bean id="bookProxy" class="com.atguigu.spring5.aopxml.BookProxy"></bean>
<!--配置aop增强--> 
<aop:config> 
    <!--切入点--> 
    <aop:pointcut id="p" expression="execution(* com.atguigu.spring5.aopxml.Book.buy(..))"/> 
    <!--配置切面--> 
    <aop:aspect ref="bookProxy"> <!--增强作用在具体的方法上--> <aop:before method="before" pointcut-ref="p"/> 
    </aop:aspect> 
</aop:config>
```

### 事务管理

#### 使用步骤

- 添加依赖

- 创建domain类、dao接口、service接口及实现类

- 创建druid.properties

- 创建spring配置类、Jdbc配置类、MyBatis配置类

- 创建Junit测试类

- 在需要事务的service接口 或 实现类中添加事务注释 -- @Transactional可以写在接口类上、接口方法上、实现类上和实现类方法上

  - 写在接口类上，该接口的所有实现类的所有方法都会有事务
  - 写在接口方法上，该接口的所有实现类的该方法都会有事务
  - 写在实现类上，该类中的所有方法都会有事务
  - 写在实现类方法上，该方法上有事务
  - **建议写在实现类或实现类的方法上**

- JdbcConfig类中配置事务管理器

  ```java
  public class JdbcConfig {
      @Value("${jdbc.driver}")
      private String driver;
      @Value("${jdbc.url}")
      private String url;
      @Value("${jdbc.username}")
      private String userName;
      @Value("${jdbc.password}")
      private String password;
  
      @Bean
      public DataSource dataSource(){
          DruidDataSource ds = new DruidDataSource();
          ds.setDriverClassName(driver);
          ds.setUrl(url);
          ds.setUsername(userName);
          ds.setPassword(password);
          return ds;
      }
  
      //配置事务管理器，mybatis使用的是jdbc事务
      @Bean
      public PlatformTransactionManager transactionManager(DataSource dataSource){
          DataSourceTransactionManager transactionManager = new DataSourceTransactionManager();
          transactionManager.setDataSource(dataSource);
          return transactionManager;
      }
  }
  ```

- 在spring配置类中开启事务注解@EnableTransactionManagement

#### 事务角色

分别是`事务管理员`和`事务协调员`。

<img src="http://minio.botuer.com/ssm/基础框架8笔记/Spring笔记/spring_day03/assets/1630249111055.png" alt="1630249111055" style="zoom:33%;" />

- 事务管理员：发起事务方，在Spring中通常指代业务层开启事务的方法
- 事务协调员：加入事务方，在Spring中通常指代数据层方法，也可以是业务层方法

==注意:==

目前的事务管理是基于`DataSourceTransactionManager`和`SqlSessionFactoryBean`使用的是同一个数据源。

#### 事务配置

`@Transactional`属性

* readOnly：true只读事务，false读写事务，增删改要设为false,查询设为true。
* timeout:设置超时时间单位秒，在多长时间之内事务没有提交成功就自动回滚，-1表示不设置超时时间。
* Spring的事务只会对`Error异常`和`RuntimeException异常`及其子类进行事务回顾，其他的异常类型是不会回滚的
  - **rollbackFor:当出现指定异常进行事务回滚**
  - **noRollbackFor:当出现指定异常不进行事务回滚**
  - rollbackForClassName等同于rollbackFor,只不过属性为异常的类全名字符串
  - noRollbackForClassName等同于noRollbackFor，只不过属性为异常的类全名字符串
* isolation设置事务的隔离级别

  * DEFAULT   :默认隔离级别, 会采用数据库的隔离级别
  * READ_UNCOMMITTED : 读未提交
  * READ_COMMITTED : 读已提交
  * REPEATABLE_READ : 重复读取
  * SERIALIZABLE: 串行化

#### 追加日志

步骤1:创建日志表

```sql
create table tbl_log(
   id int primary key auto_increment,
   info varchar(255),
   createDate datetime
)
```

步骤2:创建Bean类，添加LogDao接口

```java
public interface UserLogDao {
    @Insert("insert into log(info,creat_date)values(#{info},now())")
    void log(String info);
}
```

步骤3:添加LogService接口与实现类

```java
public interface UserLogService {
    void log(User user,String flag);
}
```

```java
@Service
public class UserLogServiceImpl implements UserLogService {
    @Autowired
    private UserLogDao userLogDao;
    @Override   
    public void log(User user,String flag) {
        userLogDao.log("用户" + user.getId() + "将用户名修改为" + user.getUsername() + ",密码修改为" +user.getPassword() + flag);
    }
}
```

步骤4:在转账的业务中添加记录日志，使用try-finally

```java
@Transactional
public void save(User user1,User user2) {
    String flag = "修改失败";
    try {
        userDao.update(user1);
        int a = 1/0;
        userDao.update(user2);
        flag = "修改成功";
    }  finally {
        userLogService.log(user1,flag);
        userLogService.log(user2,flag);
    }
}
```

问题：回滚后，日志也回滚了，需要用传播行为解决（在日志加入事务时，自己再单独创建一个事务）

#### 传播行为

事务传播行为：事务协调员对事务管理员所携带事务的处理态度。

用@Transactional的propagation属性来设置，可选值

- REQUIRES（默认）：有就加入，没有就新建
- REQUIRES_NEW：都新建

<img src="http://minio.botuer.com/ssm/基础框架8笔记/Spring笔记/spring_day03/assets/1630254257628.png" alt="1630254257628" style="zoom: 50%;" />

```java
@Service
public class UserLogServiceImpl implements UserLogService {
    @Autowired
    private UserLogDao userLogDao;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(User user,String flag) {
        userLogDao.log("用户" + user.getId() + "将用户名修改为" + user.getUsername() + ",密码修改为" +user.getPassword() + flag);
    }
}
```

