---
isOriginal: true
category: 
    - 数据库
    - ORM
tag: 
  - MySQL
---

# Hibernate

主流 ORM 框架 Object Relation Mapping 对象关系映射，将⾯向对象映射成⾯向关系。

## Hello Hibernate

### 依赖

```xml
<dependencies>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.19</version>
    </dependency>
    <dependency>
        <groupId>org.hibernate</groupId>
        <artifactId>hibernate-core</artifactId>
        <version>5.4.10.Final</version>
    </dependency>
</dependencies>
```

### 配置文件

```xml
<!--  hibernate.cfg.xml  -->

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-configuration PUBLIC
        "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
        "http://hibernate.sourceforge.net/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
    <session-factory>
        <!-- 数据源配置 -->
        <property name="connection.username">root</property>
        <property name="connection.password">root</property>
        <property name="connection.driver_class">com.mysql.cj.jdbc.Driver</property>
        <property name="connection.url">jdbc:mysql://localhost:3306/test?useUnicode=true&amp;characterEncoding=UTF-8
        </property>
        <!-- C3P0 -->
        <property name="hibernate.c3p0.acquire_increment">10</property>
        <property name="hibernate.c3p0.idle_test_period">10000</property>
        <property name="hibernate.c3p0.timeout">5000</property>
        <property name="hibernate.c3p0.max_size">30</property>
        <property name="hibernate.c3p0.min_size">5</property>
        <property name="hibernate.c3p0.max_statements">10</property>
        <!-- 数据库⽅⾔ -->
        <property name="dialect">org.hibernate.dialect.MySQLDialect</property>
        <!-- 打印SQL -->
        <property name="show_sql">true</property>
        <!-- 格式化SQL -->
        <property name="format_sql">true</property>
        <!-- 是否⾃动⽣成数据库, 生产环境不要用 -->
        <property name="hibernate.hbm2ddl.auto">create</property>
    </session-factory>
</hibernate-configuration>
```

### 实体类

```java
@Data
public class People {
    private Integer id;
    private String name;
    private Double money;
}
```

### 映射文件

```xml
<!-- resource/mapper/People.hbm.xml -->

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-mapping PUBLIC "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://hibernate.sourceforge.net/hibernate-mapping-3.0.dtd">
<hibernate-mapping>
    <class name="com.jd.starlink.hibernate.model.People" table="people">
        <id name="id" type="java.lang.Integer"><!-- 主键 -->
            <column name="id"></column>
            <generator class="identity"></generator><!-- 自增 -->
        </id>
        <property name="name" type="java.lang.String">
            <column name="name"></column>
        </property>
        <property name="money" type="java.lang.Double">
            <column name="money"></column>
        </property>
    </class>
</hibernate-mapping>
```

```xml
<!--  hibernate.cfg.xml  -->

<!-- 注册实体关系映射⽂件 -->
<mapping resource="mapper/People.hbm.xml"/>
```

### 测试

```java
public static void main(String[] args) {
    //创建Configuration
    Configuration configuration = new Configuration().configure();
    //获取SessionFactory
    SessionFactory sessionFactory = configuration.buildSessionFactory();
    //获取Session
    Session session = sessionFactory.openSession();
    People people = new People();
    people.setName("张三");
    people.setMoney(1000.0);
    session.save(people);
    session.beginTransaction().commit();
    session.close();
}
```



### 报错

#### 表不存在

明明设置自动创建表了，sql也打印了，仍然报错

```
Caused by: java.sql.SQLSyntaxErrorException: Table 'hibernate_test.people' doesn't exist
```

- 检查 Hibernate 版本和数据库驱动版本之间的兼容性。

- 替换数据库方言 

  ```xml
  <!-- 数据库版本8.x -->
  <property name="hibernate.dialect">org.hibernate.dialect.MySQL8Dialect</property>
  <!-- 数据库版本5.x -->
  <property name="hibernate.dialect">org.hibernate.dialect.MySQL5Dialect</property>
  <!-- 使用InnoDB -->
  <property name="hibernate.dialect">org.hibernate.dialect.MySQL5InnoDBDialect</property>
  ```

  

#### 时区报错

```
ERROR SqlExceptionHelper The server time zone value '�й���׼ʱ��' is unrecognized or represents more than one time zone. You must configure either the server or JDBC driver (via the 'serverTimezone' configuration property) to use a more specifc time zone value if you want to utilize time zone support.
```

这个错误通常是由于数据库服务器和 JDBC 驱动程序之间的时区设置不一致导致的

```java
String url = "jdbc:mysql://localhost:3306/mydatabase?serverTimezone=UTC";
```

## 级联

### 一对多

以客户和订单为例：一个客户对应多个订单，一个订单只能对应一个客户

#### 实体

```java
@Data
public class Customer {
    private Integer id;
    private String name;
    private Set<Orders> orders;
}
```



```java
@Data
public class Orders {
    private Integer id;
    private String name;
    private Customer customer;
}
```

#### 映射

::: tip 小表

- set 标签来配置实体类中的集合属性 orsers
  - name属性： 实体类属性名
  - table属性： 表名
  - key 标签：table 表的外键
  - one-to-many标签： 与集合泛型的实体类对应

:::

```xml
<!-- resource/mapper/Customer.hbm.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-mapping PUBLIC "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://hibernate.sourceforge.net/hibernate-mapping-3.0.dtd">
<hibernate-mapping>
    <class name="com.jd.starlink.hibernate.model.Customer" table="customer">
        <id name="id" type="java.lang.Integer">
            <column name="id"></column>
            <generator class="identity"></generator>
        </id>
        <property name="name" type="java.lang.String">
            <column name="name"></column>
        </property>
        <set name="orders" table="orders">
            <key column="cid"></key>
            <one-to-many class="com.jd.starlink.hibernate.model.Orders"></one-to-many>
        </set>
    </class>
</hibernate-mapping>
```

::: tip 大表

- many-to-one 配置实体类对应的对象属性
  - name属性： 属性名
  - class属性： 属性对应的类
  - column属性： 外键

:::

```xml
<!-- resource/mapper/Orders.hbm.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-mapping PUBLIC "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://hibernate.sourceforge.net/hibernate-mapping-3.0.dtd">
<hibernate-mapping>
    <class name="com.jd.starlink.hibernate.model.Orders" table="orders">
        <id name="id" type="java.lang.Integer">
            <column name="id"></column>
            <generator class="identity"></generator>
        </id>
        <property name="name" type="java.lang.String">
            <column name="name"></column>
        </property>
        <many-to-one name="customer" class="com.jd.starlink.hibernate.model.Customer" column="cid" />
    </class>
</hibernate-mapping>
```



```xml
<!--  hibernate.cfg.xml  -->

<!-- 注册实体关系映射⽂件 -->
<mapping resource="mapper/Customer.hbm.xml"></mapping>
<mapping resource="mapper/Orders.hbm.xml"></mapping>
```

#### 测试

```java
public static void main(String[] args) {
    Configuration configuration = new Configuration().configure();
    SessionFactory sessionFactory = configuration.buildSessionFactory();
    Session session = sessionFactory.openSession();
    //创建 Customer
    Customer customer = new Customer();
    customer.setName("张三");
    //创建 Orders
    Orders orders = new Orders();
    orders.setName("订单1");
    //建⽴关联关系
    orders.setCustomer(customer);
    //保存
    session.save(customer);
    session.save(orders);
    //提交事务
    session.beginTransaction().commit();
    //关闭session
    session.close();
}
```



### 多对多

以学生选课为例：一个学生可选对门课，一个课可以对应多个学生

#### 实体

```java
@Data
public class Student {
    private Integer id;
    private String name;
    private Set<Course> courses;
}
```



```java
@Data
public class Course {
    private Integer id;
    private String name;
    private Set<Student> students;
}
```

#### 映射

::: tip 多对多需要中间表

- set
  - name属性： 实体类对应的集合属性名
  - table属性： **中间表**
  - key标签： 外键
  - many-to-many标签： 与集合泛型的实体类对应
    - column属性： 属性与中间表的外键字段名对应

:::

```xml
<!-- resource/mapper/Student.hbm.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-mapping PUBLIC 
		"-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://hibernate.sourceforge.net/hibernate-mapping-3.0.dtd">
<hibernate-mapping>
    <class name="com.jd.starlink.hibernate.model.Student" table="student">
        <id name="id" type="java.lang.Integer">
            <column name="id"></column>
            <generator class="identity"></generator>
        </id>
        <property name="name" type="java.lang.String">
            <column name="name"></column>
        </property>
        <set name="courses" table="student_course_relation">
            <key column="sid"></key>
            <many-to-many class="com.jd.starlink.hibernate.model.Course" column="cid"></many-to-many>
        </set>
    </class>
</hibernate-mapping>
```



```xml
<!-- resource/mapper/Course.hbm.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-mapping PUBLIC "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://hibernate.sourceforge.net/hibernate-mapping-3.0.dtd">
<hibernate-mapping>
    <class name="com.jd.starlink.hibernate.model.Course" table="course">
        <id name="id" type="java.lang.Integer">
            <column name="id"></column>
            <generator class="identity"></generator>
        </id>
        <property name="name" type="java.lang.String">
            <column name="name"></column>
        </property>
        <set name="students" table="student_course_relation">
            <key column="cid"></key>
            <many-to-many class="com.jd.starlink.hibernate.model.Student" column="sid">
            </many-to-many>
        </set>
    </class>
</hibernate-mapping>
```



```xml
<!--  hibernate.cfg.xml  -->

<!-- 注册实体关系映射⽂件 -->
<mapping resource="mapper/Customer.hbm.xml"></mapping>
<mapping resource="mapper/Orders.hbm.xml"></mapping>
```



#### 测试

```java
public static void main(String[] args) {
    //创建 Configuration
    Configuration configuration = new Configuration().configure();
    //获取 SessionFactory
    SessionFactory sessionFactory = configuration.buildSessionFactory();
    //获取 Session
    Session session = sessionFactory.openSession();
    Course course = new Course();
    course.setName("Java");
    Student account = new Student();
    account.setName("张三");
    Set<Course> courses = new HashSet<>();
    courses.add(course);
    account.setCourses(courses);
    session.save(course);
    session.save(account);
    session.beginTransaction().commit();
    session.close();
}
```

## 延迟加载

延迟加载、惰性加载、懒加载

使⽤延迟加载可以提高程序的运⾏效率，Java 程序与数据库交互的频次越低，程序运行的效率就越高，所以我们应该尽量减少 Java 程序与数据库的交互次数，Hibernate 延迟加载就很好的做到了这一点。

客户和订单，当我们查询客户对象时，因为有级联设置，所以会将对应的订单信息⼀并查询出来，这样
就需要发送两条 SQL 语句，分别查询客户信息和订单信息。

延迟加载的思路是：当我们查询客户的时候，如果没有访问订单数据，只发送一条 SQL 语句查询客户信
息，如果需要访问订单数据，则发送两条 SQL。

延迟加载可以看作是⼀种优化机制，根据具体的需求，自动选择要执行的 SQL 语句数量。

### 一对多

#### 通过小表级联

**查询测试**

```java
public static void main(String[] args) {
    Configuration configuration = new Configuration().configure();
    SessionFactory sessionFactory = configuration.buildSessionFactory();
    Session session = sessionFactory.openSession();

 	Customer customer = session.get(Customer.class,1);
    System.out.println(customer.getOrders());


    //关闭session
    session.close();
}
```

::: danger 循环依赖

由于两个实体类之间存在相互引用，我们使用了`@Data`注解会自动生成toString和hashCode方法，造成了循环引用，打断其中一个即可

```java
@Getter
@Setter
public class Customer {
    private Integer id;
    private String name;
    private Set<Orders> orders;

    @Override
    public String toString() {
        return "Customer{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
```

:::

当打印级联对象时，会查询多次，打印多条查询语句

当不打印级联对象时，只会查询一次

**默认开启**

**关闭** -- **修改映射文件**

- set的lazy属性改为false



```xml
<!-- resource/mapper/Customer.hbm.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-mapping PUBLIC "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://hibernate.sourceforge.net/hibernate-mapping-3.0.dtd">
<hibernate-mapping>
    <class name="com.jd.starlink.hibernate.model.Customer" table="customer">
        <id name="id" type="java.lang.Integer">
            <column name="id"></column>
            <generator class="identity"></generator>
        </id>
        <property name="name" type="java.lang.String">
            <column name="name"></column>
        </property>
        <set name="orders" table="orders" lazy="false">
            <key column="cid"></key>
            <one-to-many class="com.jd.starlink.hibernate.model.Orders"></one-to-many>
        </set>
    </class>
</hibernate-mapping>
```

**更智能**

- set的lazy属性改为extra

测试

- 只想要一个客户的订单个数，还需要查询出所有的订单吗

```java
public static void main(String[] args) {
    Configuration configuration = new Configuration().configure();
    SessionFactory sessionFactory = configuration.buildSessionFactory();
    Session session = sessionFactory.openSession();

 	Customer customer = session.get(Customer.class,1);
    // System.out.println(customer.getOrders());
    System.out.println(customer.getOrders().size());

    //关闭session
    session.close();
}
```

当懒加载设置为true时，执行的SQL为

```sql
Hibernate: 
    select
        customer0_.id as id1_0_0_,
        customer0_.name as name2_0_0_ 
    from
        customer customer0_ 
    where
        customer0_.id=?
Hibernate: 
    select
        orders0_.cid as cid3_1_0_,
        orders0_.id as id1_1_0_,
        orders0_.id as id1_1_1_,
        orders0_.name as name2_1_1_,
        orders0_.cid as cid3_1_1_ 
    from
        orders orders0_ 
    where
        orders0_.cid=?
```

当懒加载设置为extra时，执行的SQL为

```sql
Hibernate: 
    select
        customer0_.id as id1_0_0_,
        customer0_.name as name2_0_0_ 
    from
        customer customer0_ 
    where
        customer0_.id=?
Hibernate: 
    select
        count(id) 
    from
        orders 
    where
        cid =?
```

#### 通过大表级联

查询测试

```java
public static void main(String[] args) {
    Configuration configuration = new Configuration().configure();
    SessionFactory sessionFactory = configuration.buildSessionFactory();
    Session session = sessionFactory.openSession();

 	Orders orders = session.get(Orders.class,1);
    System.out.println(orders.getCustomer());


    //关闭session
    session.close();
}
```

打印两条

::: danger

**默认关闭** --- 但是测试时打印出一条，咋办

:::

- many-to-one的lazy属性
  - `false`，默认值，表示不使用延迟加载
  - `lazy="proxy"`：表示使用代理对象进行延迟加载。当访问关联数据时，Hibernate 会返回一个代理对象，只有在真正访问代理对象的属性或方法时才会触发查询加载子实体。
  - `lazy="no-proxy"`：表示直接延迟加载。当访问关联数据时，Hibernate 会执行额外的查询，以加载子实体，而不使用代理对象

### 多对多

默认延迟加载开启。

测试验证

```java
public static void main(String[] args) {
    Configuration configuration = new Configuration().configure();
    SessionFactory sessionFactory = configuration.buildSessionFactory();
    Session session = sessionFactory.openSession();

    Student student = session.get(Student.class, 1);
//        System.out.println(student.getCourses());


    //关闭session
    session.close();
}
```

## 配置文件

### hibernate.cfg.cml

配置 Hibernate 的全局环境。

- hibernate-configuration
  - SessionFactory：表示一个 Hibernate 的会话工厂
    - `hibernate.hbm2ddl.auto`：
      - create：表示每次启动应用程序时重新创建表结构，
      - create-drop：初始化创建表，程序结束时删除表。
      - update：表示根据实体类的变化更新表结构，表不存在则创建
      - validate：表示验证实体类和表结构是否一致，不进行修改，
      - none：表示关闭自动更新表结构的功能。

### *.hbm.xml

配置实体关系映射

- hibernate-mapping的属性
  - package：给 class 节点对应的实体类统⼀设置包名，此处设置包名，class 的 name 属性就可以省略包名
  - schema：数据库 schema 的名称
  - catalog：数据库 catalog 的名称
  - default-cascade：默认的级联关系，默认为 none
  - default-access：Hibernate 用来访问属性的策略
  - default-lazy：指定了未明确注明 lazy 属性的 Java 属性和集合类，Hibernate 会采用什么样的加载风格，默认为 true
  - auto-import：指定我们是否可以在查询语句中使用非全限定类名，默认为 true，如果项目中有两
    个同名的持久化类，最好在这两个类的对应映射文件中配置为 false

- class的属性

  - name：实体类名
  - table：数据表名
  - schema：数据库 schema 的名称，会覆盖 hibernate-mapping 的 schema
  - catalog：数据库 catalog 的名称，会覆盖 hibernate-mapping 的 catalog
  - proxy：指定⼀个接⼝，在延迟加载时作为代理使⽤
  - dynamic-update：动态更新 ---- 不会给没有set的属性赋值默认值null
  - dynamic-insert：动态添加 ---- 不会给没有set的属性赋值默认值null
  - where：查询时给 SQL 添加 where 条件

- class的子标签

  - id的属性

    - name：实体类属性名

    - type：实体类属性数据类型

      ::: tip

      此处可以设置两种类型的数据：Java 数据类型或者 Hibernate 映射类型。

      实体类的属性数据类型必须与数据表对应的字段数据类型⼀致：int 对应 int，String 对应 varchar
      如何进行映射？<br>

      Java 数据类型映射到 Hibernate 映射类型，再由 Hibernate 映射类型映射到 SQL 数据类型
      Java ---> Hibernate ---> SQL

      :::

  - id的子标签

    - column：数据表的主键字段名
    - generator：主键⽣成策略
        - hilo 算法
        - increment：Hibernate ⾃增
        - identity：数据库⾃增
        - native：本地策略，根据底层数据库⾃动选择主键的⽣成策略
        - uuid.hex 算法
        - select 算法
    
  - property 的属性
  
    - name：实体类属性名
    - type：实体类属性数据类型
    - update：该字段是否可以修改，默认为 true
    - insert：该字段是否可以添加，默认为 true
    - lazy：延迟加载策略
  
  - property 的子标签
  
    - column：数据表的主键字段名

### inverse 

测试

```java
public static void main(String[] args) {
    Configuration configuration = new Configuration().configure();
    SessionFactory sessionFactory = configuration.buildSessionFactory();
    Session session = sessionFactory.openSession();
    
    Customer customer = new Customer();
    customer.setName("张三");
    Orders orders1 = new Orders();
    orders1.setName("订单1");
    orders1.setCustomer(customer);
    Orders orders2 = new Orders();
    orders2.setName("订单2");
    orders2.setCustomer(customer);
    Set<Orders> orders = new HashSet<>();
    orders.add(orders1);
    orders.add(orders2);
    customer.setOrders(orders);
    session.save(customer);
    session.save(orders1);
    session.save(orders2);
    session.beginTransaction().commit();
    //关闭session
    session.close();
}
```

::: danger

期望打印三条SQL，结果打印了5条

```sql
Hibernate: 
    insert 
    into
        customer
        (name) 
    values
        (?)
Hibernate: 
    insert 
    into
        orders
        (name, cid) 
    values
        (?, ?)
Hibernate: 
    insert 
    into
        orders
        (name, cid) 
    values
        (?, ?)
Hibernate: 
    update
        orders 
    set
        cid=? 
    where
        id=?
Hibernate: 
    update
        orders 
    set
        cid=? 
    where
        id=?
```

因为 Customer 和 Orders 都在维护⼀对多关系，所以会重复设置主外键约束关系。

如何避免这种情况？

- 在 Java 代码中去掉一方维护关系代码。
- 通过配置来解决。

:::

配置

```xml
<set name="orders" table="orders" inverse="true" >
    <key column="cid"/>
    <one-to-many class="com.jd.starlink.hibernate.model.Orders"/>
</set>
```

inverse 属性是⽤来设置是否将维护权交给对⽅，默认是 false，不交出维护权，双方都在维护，将它设
置为 true，表示 Customer 放弃维护。

### cascade

⽤来设置级联删除操作

由于有外键约束，删除customer时会报错

两种解决方案

- 遍历删除大表关联的数据

- 配置文件完成级联删除

  ```xml
  <set name="orders" table="orders" inverse="true" cascade="delete">
      <key column="cid"/>
      <one-to-many class="com.jd.starlink.hibernate.model.Orders"/>
  </set>
  ```


## 注解

上述都是通过xml进行关系映射的，也可以通过注解进行映射

### 表-类

```java
@Data
@Entity
@Table(name = "people")
public class People {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "name", unique = false)
    private String name;
    @Column(name = "money",unique = false)
    private Double money;
}
```



```xml
<!-- 注册实体关系映射⽂件 -->
<!--	<mapping resource="mapper/People.hbm.xml" />-->
<mapping class="com.jd.starlink.hibernate.model.People"/>
```

#### @Entity

用于将一个 Java 类标记为实体类，使其可以被 EntityManager 管理。该注解通常与 @Table 注解一起使用，用于指定实体类与数据库表之间的映射关系

- `@Entity`注解通常与JPA的实体管理器一起使用，用于表示一个类是一个实体类，可以被持久化到数据库中。
- 实体类必须具有无参构造函数，并且可以有其他构造函数。
- 实体类必须具有一个标识属性（通常是一个主键），可以使用`@Id`注解标识。
- 实体类可以有其他属性，可以使用不同的注解（如`@Column`）来指定属性与数据库表中列的映射关系。
- 实体类可以有关联关系，如一对多、多对一、一对一、多对多等，可以使用不同的注解（如`@OneToMany`、`@ManyToOne`、`@OneToOne`、`@ManyToMany`）来定义关系。
- 实体类可以有其他注解来定义索引、约束、继承等其他数据库相关的特性。

#### @Table

```java
@Entity
@Table(
        name = "customer",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"email"})},
        indexes = {@Index(columnList = "lastName, firstName")})
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(unique = true)
    private String email;

    // Getter and Setter methods
}

```

### 列-字段

#### @Id

- `@Id`注解可以应用于实体类的任何属性，例如整型、长整型、字符串等类型。
- 主键属性的值在数据库中必须是唯一的，以便能够准确地标识和检索实体对象。
- 主键属性可以通过不同的生成策略（GenerationType）来指定如何生成主键的值，例如自增长、序列、UUID等。
- 如果主键属性的类型是基本类型（如整型、长整型），则JPA会自动为其生成默认的主键生成策略；如果主键属性的类型是字符串或其他非基本类型，则需要手动指定主键生成策略。

#### @GeneratedValue

- `strategy`属性：指定主键生成策略的类型。常用的主键生成策略包括：
  - `GenerationType.IDENTITY`：使用数据库的自增长机制生成主键值。
  - `GenerationType.AUTO`：根据数据库的支持情况，在`IDENTITY`和`SEQUENCE`之间选择合适的主键生成策略。
  - `GenerationType.SEQUENCE`：使用序列（Sequence）生成主键值。
  - `GenerationType.TABLE`：使用表（Table）生成主键值。
- `generator`属性：指定自定义的主键生成器名称，用于自定义主键生成策略

::: tip 使用UUID作为主键生成策略

```java
@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", columnDefinition = "VARCHAR(36)")
    private String id;
    
    // 其他属性和方法
}
```

在上述示例中，`Employee`类的主键属性使用了UUID作为生成策略。具体配置如下：

1. `@GeneratedValue`注解的`strategy`属性设置为`GenerationType.AUTO`，表示根据数据库的支持情况选择合适的主键生成策略。
2. `@GeneratedValue`注解的`generator`属性设置为`uuid2`，指定了自定义的主键生成器名称。
3. `@GenericGenerator`注解用于定义自定义的主键生成器。`name`属性设置为`uuid2`，与`@GeneratedValue`注解中的`generator`属性对应。`strategy`属性设置为`org.hibernate.id.UUIDGenerator`，表示使用Hibernate提供的UUID生成策略。
4. `@Column`注解用于指定主键属性对应的数据库列的定义。`name`属性设置为"id"，表示对应数据库表中的"id"列。`columnDefinition`属性设置为"VARCHAR(36)"，指定列的数据类型为UUID的字符串表示形式。

:::

#### @Column

用于指定实体类属性与数据库表列之间的映射关系。

- `name`属性：指定列的名称。默认情况下，列名与属性名一致
- `nullable`属性：指定列是否允许为空值。默认情况下，`nullable`属性为`true`，表示允许为空值；
- `unique`属性：指定列是否需要唯一约束。默认情况下，`unique`属性为`false`，
- `length`属性指定列的长度。对于字符串类型的列，`length`属性指定了字符串的最大长度。
- `columnDefinition`属性指定列的定义，包括数据类型、长度等。可以使用原生的SQL语句来定义列的属性。
- `insertable`属性指定是否允许插入数据到该列。默认情况下，`insertable`属性为`true`，表示允许插入
- `updatable`属性指定是否允许更新该列的数据。默认情况下，`updatable`属性为`true`，表示允许更新

#### @Transient

表示被注解的属性不需要持久化到数据库中，即不会映射为数据库表的列

### 级联相关



::: tip

一对多的关系，应该在多的一方（大表）维护，在@ManyToOne中维护

:::

通用的一些属性

- **targetEntity**：用于指定关联表的实体类类型
- cascade 属性：用于指定级联操作的策略。级联操作是指当对当前实体对象进行增删改操作时，是否级联对关联对象进行相应的操作。常见的选项有 
  - CascadeType.ALL
  - CascadeType.PERSIST
  - CascadeType.MERGE
  - CascadeType.REMOVE 
- fetch 属性：用于指定关联对象的加载策略。可以设置为 
  - 默认值为 FetchType.LAZY，表示延迟加载；
  - FetchType.EAGER 表示立即加载
- **mappedBy**：使用 `@OneToMany`、`@OneToOne` 或 `@ManyToMany` 注解时，可以通过设置 `mappedBy` 属性来指定关系的拥有方。拥有方负责维护关系的数据库表字段或属性，而被拥有方则会在关系中引用拥有方
- optional ：使用 `@ManyToOne` 或 `@OneToOne` 注解时，如果关联实体是必需的，那么应该将 `optional` 属性设置为 false
- orphanRemoval：使用 `@OneToMany` 或 `@OneToOne` 注解时，可以通过设置 `orphanRemoval` 属性来控制解除关联关系时是否删除孤儿实体。如果将 `orphanRemoval` 属性设置为 true，则在解除关联关系时会自动删除孤儿实体，一般不用管

#### @ManyToOne

表示一个实体类的属性与另一个实体类的多个实例之间存在多对一的关系。

将一个实体类的属性映射为另一个实体类的引用。在数据库层面，这通常通过外键关联来实现

```java
@Data
@Entity
@Table(name = "orders")
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    @ManyToOne
    private Customer customer;
}
```



#### @OneToMany

```java
@Getter
@Setter
@Entity
@Table(name = "customer")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    @OneToMany(mappedBy = "customer")
    private Set<Orders> orders;

    @Override
    public String toString() {
        return "Customer{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
```



#### @OneToOne

使用`@OneToOne`注解可以将一个实体类的属性映射为另一个实体类的引用，建立一对一的关联关系。在数据库层面，通常使用外键或共享主键来实现这种关系。

```java
@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String firstName;
    
    private String lastName;
    
    @OneToOne
    private Address address;
    
    // 其他属性和方法
}
```



#### @ManyToMany

`@ManyToMany`注解是JPA（Java Persistence API）中用于建立实体类之间多对多关系的注解。它表示一个实体类的属性与另一个实体类的多个实例之间存在多对多的关系。

使用`@ManyToMany`注解可以将一个实体类的属性映射为另一个实体类的集合，建立多对多的关联关系。在数据库层面，通常使用中间表来实现这种关系。

```java
@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @ManyToMany
    @JoinTable(
        name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private List<Course> courses;
    
    // 其他属性和方法
}
```

在上述示例中，`Student`类有一个`courses`属性，它使用了`@ManyToMany`注解来表示与`Course`实体类之间的多对多关系。`@JoinTable`注解用于指定中间表的名称以及关联的外键列信息。

这意味着在数据库中，将会创建一个名为`student_course`的中间表，用于存储`Student`实体与`Course`实体之间的关联关系。通过`courses`属性，可以在Java代码中访问和操作与`Student`实体相关联的多个`Course`实体。

`@ManyToMany`注解还可以用于指定其他属性，例如`fetch`属性用于指定关联对象的加载策略，默认为`LAZY`（延迟加载）。还可以使用`cascade`属性来指定级联操作的行为。

::: tip

通常只需要在其中一个实体类上使用`@ManyToMany`注解来定义关联关系。另一个实体类可以使用`@ManyToMany(mappedBy = "关联属性名")`来指定关联关系的维护方

```java
@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @ManyToMany(mappedBy = "courses")
    private List<Student> students;
    
    // 其他属性和方法
}
```

过在`Course`实体类上使用`mappedBy`属性，表示`Course`实体类不负责维护关联关系，关联关系的维护方是`Student`实体类的`courses`属性。

:::

#### @JoinTable

用于指定中间表的详细配置信息，包括中间表的名称、关联的外键列等。

- **`name`**：指定中间表的名称。默认情况下，中间表的名称将由 JPA 自动生成，但通过该属性可以自定义中间表的名称。

- **`joinColumns`**：指定<u>**当前**</u>实体类在中间表中的外键列配置信息。可以使用 `@JoinColumn` 注解来进一步配置外键列的名称、参考列等。

- **`inverseJoinColumns`**：指定<u>**关联**</u>实体类在中间表中的外键列配置信息。同样可以使用 `@JoinColumn` 注解来进行详细配置

  

- `uniqueConstraints`：指定中间表上的唯一约束

- `indexes`：指定中间表上的索引

  

- `foreignKey` ：指定中间表的外键约束配置。`foreignKey` 属性可以通过 `@ForeignKey` 注解来详细配置外键约束。

- `inverseForeignKey`：指定中间表中反向关联的外键约束配置。`inverseForeignKey` 属性可以通过 `@ForeignKey` 注解来详细配置外键约束

#### @JoinColumn

- **`name`**：指定外键列的名称。默认情况下，外键列的名称将由 JPA 自动生成，但通过该属性可以自定义外键列的名称。
- `referencedColumnName`：指定参考列的名称，即被关联实体类中的列名。默认情况下，参考列的名称将使用被关联实体类的主键列名。
- `nullable`：指定外键列是否允许为空。默认情况下，外键列是可空的
- `unique`：指定外键列是否唯一。默认情况下，外键列不是唯一的。
- `insertable`：指定在插入新记录时是否包含该外键列的值。默认情况下，外键列是可插入的。
- `updatable`：指定在更新记录时是否可以修改该外键列的值。默认情况下，外键列是可更新的。
- `columnDefinition`属性指定列的定义，包括数据类型、长度等。可以使用原生的SQL语句来定义列的属性。

### 其他

#### @OrderBy

`@OrderBy`: 用于指定**集合属性**的排序方式，可以按照某个属性进行升序或降序排序。

```java
@OneToMany(mappedBy = "parent")
@OrderBy("name ASC")
private List<ChildEntity> children;

// @OrderBy("name ASC, age DESC")
```

#### @Fetch

`@Fetch`: 指定关联关系的加载方式的注解

- 是hibernate包中的注解
- `FetchMode.SELECT`：默认值，使用 SELECT 语句在需要时加载关联数据。
- `FetchMode.JOIN`：使用 JOIN 语句一次性加载关联数据。
- `FetchMode.SUBSELECT`：使用子查询方式在需要时加载关联数据。

#### @Cascade

`@Cascade`: 用于指定级联操作的行为，例如级联保存、更新、删除等操作。

- 是hibernate包中的注解
- `CascadeType.ALL`：全部操作，包括 INSERT、UPDATE、DELETE。
- `CascadeType.PERSIST`：持久化操作，只包括 INSERT。
- `CascadeType.MERGE`：合并操作，只包括 UPDATE。
- `CascadeType.REMOVE`：删除操作，只包括 DELETE。
- `CascadeType.REFRESH`：刷新操作。
- `CascadeType.DETACH`：分离操作。

## HQL

HQL 只能完成查询、修改、删除，新增是⽆法操作的。

### 查询

查询表中所有数据，⾃动完成对象的封装，返回 List 集合。

HQL 进行查询，from 关键字后⾯不能写表名，必须写表对应的实体类名。

条件，排序和SQL完全一致

查询所有字段可省略 select *，查询具体某些字段同SQL

```java
public static void main(String[] args) {
    //创建Configuration
    Configuration configuration = new Configuration().configure();
    //获取SessionFactory
    SessionFactory sessionFactory = configuration.buildSessionFactory();
    //获取Session
    Session session = sessionFactory.openSession();
    
    String hql = "from People where id < 6 and name like '%h%' order by id desc";
    Query query = session.createQuery(hql);
    List<People> list = query.list();
    for (People people : list) {
        System.out.println(people);
    }
    
    session.beginTransaction().commit();
    session.close();
}
```



### 分页



```java
String hql = "from People where id < 6 and name like '%三%' order by id desc";
Query query = session.createQuery(hql);
// 分页
query.setFirstResult(0);
query.setMaxResults(10);
List<People> list = query.list();
```



### 占位符

```java
String hql = "from People where name = :name";
Query query = session.createQuery(hql);
query.setString("name","张三");
List<People> list = query.list();
```



### 级联

不依赖外键也可以级联

```java
String hql1 = "from Customer where name = :name";
Query query1 = session.createQuery(hql1);
query1.setString("name","张三");
Customer customer = (Customer) query1.uniqueResult();
String hql2 = "from Orders where customer = :customer";
Query query2 = session.createQuery(hql2);
query2.setEntity("customer",customer);
List<Orders> list = query2.list();
```

## 缓存

Hibernate 中的缓存是指在应用程序和数据库之间建立的一个缓存层，用于加速数据访问并减少数据库查询次数。Hibernate 中使用的缓存分为三种类型：一级缓存、二级缓存和查询缓存。
