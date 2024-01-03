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

- SessionFactory：表示一个 Hibernate 的会话工厂
  - `hibernate.dialect`：指定 Hibernate 使用的数据库方言，例如 MySQL 数据库使用`org.hibernate.dialect.MySQL5Dialect`。
  - `hibernate.connection.url`：指定数据库连接 URL。
  - `hibernate.connection.username`：指定数据库用户名。
  - `hibernate.connection.password`：指定数据库密码。
  - `hibernate.show_sql`：设置为`true`表示输出 Hibernate 执行的 SQL 语句到控制台。
  - `hibernate.hbm2ddl.auto`：
    - `create`表示每次启动应用程序时重新创建表结构，
    - `update`表示根据实体类的变化更新表结构，
    - `validate`表示验证实体类和表结构是否一致，不进行修改，
    - `none`表示关闭自动更新表结构的功能。

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
  - name 实体类属性名
  - table 表名
  - key ：table 表的外键
  - one-to-many 与集合泛型的实体类对应

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
  - name 属性名
  - class 属性对应的类
  - column 外键

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
        <many-to-one name="customer" class="com.jd.starlink.hibernate.model.Customer" column="cid"></many-to-one>
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
  - name 实体类对应的集合属性名
  - table **中间表**
  - key 外键
  - many-to-many 与集合泛型的实体类对应
  - column 属性与中间表的外键字段名对应

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
- 
