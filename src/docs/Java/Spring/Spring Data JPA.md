# Spring Data JPA

## 概述

### JPA与JDBC

相同处：
- 都跟数据∙库操作有关，JPA 是JDBC 的升华，升级版。
- JDBC和JPA都是一组规范接口
- 都是由SUN官方推出的

不同处：
- JDBC是由各个关系型数据库实现的， JPA 是由ORM框架实现
- JDBC 使用SQL语句和数据库通信。 JPA用面向对象方式， 通过ORM框架来生成SQL，进行操作。
- JPA在JDBC之上的， JPA也要依赖JDBC才能操作数据库。

**JAP规范**

- <u>ORM映射元数据</u>：JPA支持XML和注解两种元数据的形式，元数据描述对象和表之间的映射关系，框架据此将实体对
  象持久化到数据库表中；如：@Entity 、 @Table 、@Id 与 @Column等注解。

- <u>JPA 的API</u>：用来操作实体对象，执行CRUD操作，框架在后台替我们完成所有的事情，开发者从繁琐的JDBC和
  SQL代码中解脱出来。如：entityManager.merge(T t)；

- <u>JPQL查询语言</u>：通过面向对象而非面向数据库的查询语言查询数据，避免程序的SQL语句紧密耦合。
  如：from Student s where s.name = ?

  ::: tip

  So: JPA仅仅是一种规范，也就是说JPA仅仅定义了一些接口，而接口是需要实现才能工作的

​		:::

### Hibernate与JPA

JPA是一套ORM规范，Hibernate实现了JPA规范！

<img src="http://minio.botuer.com/study-node/2024/01/04/image-20240104141547010_repeat_1704348972245__294117.png" alt="image-20240104141547010" style="zoom: 67%;" />

## Hello JPA

### 依赖

和hibernate相同

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

::: tip

必须在META-INFO目录下创建persistence.xml文件

:::

```java
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="http://xmlns.jcp.org/xml/ns/persistence"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/persistence
                                 http://xmlns.jcp.org/xml/ns/persistence/persistence_2_2.xsd"
             version="2.2">

    <!-- 需要配置 persistence‐unit节点 - 持久化单元：
            - name：持久化单元名称
            - transaction‐type：事务管理的方式
                - JTA：分布式事务管理
                - RESOURCE_LOCAL：本地事务管理 -->
    <persistence-unit name="myPersistenceUnit" transaction-type="RESOURCE_LOCAL">

        <!-- jpa的实现方式 -->
        <provider>org.hibernate.jpa.HibernatePersistenceProvider</provider>

        <class>com.jd.starlink.hibernate.model.Customer</class>

        <!-- jpa实现方(hibernate)的配置信息 -->
        <properties>
            <property name="javax.persistence.jdbc.driver" value="com.mysql.cj.jdbc.Driver"/>
            <property name="javax.persistence.jdbc.url" value="jdbc:mysql://localhost:3306/hibernate_test?useUnicode=true&amp;characterEncoding=UTF-8&amp;serverTimezone=UTC"/>
            <property name="javax.persistence.jdbc.user" value="root"/>
            <property name="javax.persistence.jdbc.password" value="root"/>

            <property name="hibernate.dialect" value="org.hibernate.dialect.MySQL8Dialect"/>
            <property name="hibernate.show_sql" value="true"/>
            <property name="hibernate.format_sql" value="true"/>
            <property name="hibernate.hbm2ddl.auto" value="update"/>

            <!-- 其他属性配置 -->
        </properties>
    </persistence-unit>

</persistence>
```

### 实体

```java
@Date
@Entity
@Table(name = "customer")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
}
```

### 测试

```java
public static void main(String[] args) {
    EntityManagerFactory factory = Persistence.createEntityManagerFactory("myPersistenceUnit");
    EntityManager em = factory.createEntityManager();
     //2.开启事务
    EntityTransaction tx = em.getTransaction();
    tx.begin();
    //3.查询全部
    String jpql = "select c from Customer c";
    Query query = em.createQuery(jpql);//创建Query查询对象，query对象才是执行jqpl的对象

    //发送查询，并封装结果集
    List list = query.getResultList();

    for (Object obj : list) {
        System.out.println(obj);
    }

    //4.提交事务
    tx.commit();
    //5.释放资源
    em.close();

}
```

## JPA

### 对象4种状态

新建状态（New）：刚创建出来，没有与entityManager发生关系，没有被持久化，不处于entityManager中的对象

托管状态（Detached）：与entityManager发生关系，在该状态下，对实体对象的任何更改都会被自动同步到数据库中，当从数据库中查询实体对象时（即查出来的对象），它们通常处于托管状态

删除状态（Removed）：执行remove方法，事物提交之前，在删除状态下，实体对象的相关记录将被从数据库中删除。然而，在事务提交之前，实际的数据库删除操作并不会立即执行，而是在事务提交时才会执行

游离状态（Detached）：游离状态就是提交到数据库后，事务commit后实体的状态，因为事务已经提交了，此时实体的属性任你如何改变，也不会同步到数据库，因为游离是没人管的孩子，不在持久化上下文中。

![image-20240104181206654](http://minio.botuer.com/study-node/2024/01/04/image-20240104181206654_repeat_1704363135254__712262.png)

- persist方法可以将实例转换为managed(托管)状态。在调用flush()方法或提交事物后，实例将会被插入到数据库中；对不同状态下的实例A，persist会产生以下操作:
    - 如果A是一个new状态的实体，它将会转为managed状态
    - 如果A是一个managed状态的实体，它的状态不会发生任何改变。但是系统仍会在数据库执行INSERT操作
    - 如果A是一个removed(删除)状态的实体，它将会转换为managed状态
    - 如果A是一个detached(分离)状态的实体，该方法会抛出IllegalArgumentException异常，具体异常根据不同的JPA实现有关
- merge方法的主要作用是将用户对一个detached状态实体的修改进行归档，归档后将产生一个新的managed状态对象。对不同状态下的实例A，merge会产生以下操作
    - 如果A是一个detached状态的实体，该方法会将A的修改提交到数据库，并返回一个新的managed状态的实例A2
    - 如果A是一个new状态的实体，该方法会产生一个根据A产生的managed状态实体A2
    - 如果A是一个managed状态的实体，它的状态不会发生任何改变。但是系统仍会在数据库执行UPDATE操作
    - 如果A是一个removed状态的实体，该方法会抛出IllegalArgumentException异常

- refresh方法可以保证当前的实例与数据库中的实例的内容一致。对不同状态下的实例A，refresh会产生以下操作:
    - 如果A是一个new状态的实例，不会发生任何操作，但有可能会抛出异常，具体情况根据不同JPA实现有关
    - 如果A是一个managed状态的实例，它的属性将会和数据库中的数据同步
    - 如果A是一个removed状态的实例，该方法将会抛出异常: Entity not managed
    - 如果A是一个detached状态的实体，该方法将会抛出异常

- remove方法可以将实体转换为removed状态，并且在调用flush()方法或提交事物后删除数据库中的数据。对不同状态下的实例A，remove会产生以下操作:
    - 如果A是一个new状态的实例，A的状态不会发生任何改变，但系统仍会在数据库中执行DELETE语句
    - 如果A是一个managed状态的实例，它的状态会转换为removed
    - 如果A是一个removed状态的实例，不会发生任何操作
    - 如果A是一个detached状态的实体，该方法将会抛出异常

## Hello Spring Data Jpa



### 依赖

```xml
<!-- 用来spring data的版本管理-->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.data</groupId>
      <artifactId>spring-data-bom</artifactId>
      <version>2021.1.10</version>
      <scope>import</scope>
      <type>pom</type>
    </dependency>
  </dependencies>
</dependencyManagement>


<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.19</version>
</dependency>
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.2.8</version>
</dependency>

<!-- springboot中不需要hibernate-->
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-core</artifactId>
    <version>5.4.10.Final</version>
</dependency>
```



### 配置文件（2选1）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:jpa="http://www.springframework.org/schema/data/jpa"
  xsi:schemaLocation="http://www.springframework.org/schema/beans
    https://www.springframework.org/schema/beans/spring-beans.xsd
    http://www.springframework.org/schema/data/jpa
    https://www.springframework.org/schema/data/jpa/spring-jpa.xsd">

  	<!-- 整合spring data jpa - dao包扫描 -->  
	<jpa:repositories base-package="com.jd.starlink.jpa.dao"
                      entity-manager-factory-ref="entityManagerFactory"
                      transaction-manager-ref="transactionManager"/>
	<!-- 配置entityManagerFactory -->
    <bean name="entityManagerFactory" class="org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean">
        <property name="jpaVendorAdapter">
            <bean class="org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter">
                <property name="generateDdl" value="true"/>
                <property name="showSql" value="true"/>
                <property name="database" value="MYSQL"/>
                <property name="databasePlatform" value="org.hibernate.dialect.MySQL8Dialect"/>
            </bean>
        </property>
        <property name="packagesToScan" value="com.jd.starlink.jpa.model"/>
        <property name="dataSource" ref="dataSource"/>

    </bean>
    <!-- 1.dataSource 配置数据库连接池 -->
    <bean class="com.alibaba.druid.pool.DruidDataSource" name="dataSource">
        <property name="url"
                  value="jdbc:mysql://localhost:3306/hibernate_test?useUnicode=true&amp;characterEncoding=UTF-8&amp;serverTimezone=UTC"/>
        <property name="username" value="root"/>
        <property name="password" value="root"/>
        <property name="driverClassName" value="com.mysql.cj.jdbc.Driver"/>
    </bean>

    
    <!-- JPA事务管理器 -->
    <bean class="org.springframework.orm.jpa.JpaTransactionManager" name="transactionManager">
        <property name="entityManagerFactory" ref="entityManagerFactory"/>
    </bean>
	<!-- 基于注解方式的事务，开启事务的注解驱动
	 如果基于注解的和xml的事务都配置了会以注解的优先 -->
    <tx:annotation-driven transaction-manager="transactionManager"/>
</beans>
```

### 配置类（2选1）

```java
@Configuration
@EnableJpaRepositories("com.jd.starlink.jpa.dao")
@EnableTransactionManagement
class ApplicationConfig {

  @Bean
  public DataSource dataSource() {
    DruidDataSource dataSource = new DruidDataSource();
    dataSource.setUsername("root");
    dataSource.setPassword("root");
    dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
    dataSource.setUrl("jdbc:mysql://localhost:3306/hibernate_test");
    return dataSource;
  }

  @Bean
  public LocalContainerEntityManagerFactoryBean entityManagerFactory() {

    HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
    vendorAdapter.setGenerateDdl(true);

    LocalContainerEntityManagerFactoryBean factory = new LocalContainerEntityManagerFactoryBean();
    factory.setJpaVendorAdapter(vendorAdapter);
    factory.setPackagesToScan("com.jd.starlink.jpa.model");
    factory.setDataSource(dataSource());
    return factory;
  }

  @Bean
  public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {

    JpaTransactionManager txManager = new JpaTransactionManager();
    txManager.setEntityManagerFactory(entityManagerFactory);
    return txManager;
  }
}
```

### DAO

```java
public interface CustomerRepository extends CrudRepository<Customer, Integer> { }
```

### 测试

```java

@ContextConfiguration("/spring.xml")
//@ContextConfiguration(classes = ApplicationConfig.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class SpringdataJpaTest {

    @Autowired
    CustomerRepository repository;

    @Test
    public void testR() {
        Optional<Customer> byId = repository.findById(1L);

        System.out.println(byId.get());
    }

    @Test
    public void testC() {


        Customer customer = new Customer();
        customer.setId(3);
        customer.setName("李四");

        repository.save(customer);
    }

    @Test
    public void testD() {


        Customer customer = new Customer();
        customer.setId(3);
        customer.setName("李四");

        repository.delete(customer);
    }
}
```

### 方法介绍

#### CrudRepository

```java
// org.springframework.data.repository.CrudRepository
public interface CrudRepository<T, ID> extends Repository<T, ID> {

	<S extends T> S save(S entity);

	<S extends T> Iterable<S> saveAll(Iterable<S> entities);

	Optional<T> findById(ID id);

	boolean existsById(ID id);

	Iterable<T> findAll();

	Iterable<T> findAllById(Iterable<ID> ids);

	long count();

	void deleteById(ID id);

	void delete(T entity);

	void deleteAllById(Iterable<? extends ID> ids);

	void deleteAll(Iterable<? extends T> entities);

	void deleteAll();
}
```

#### PagingAndSortingRepository

是CrudRepository子类，支持分页和排序

```java
// org.springframework.data.repository.PagingAndSortingRepository
public interface PagingAndSortingRepository<T, ID> extends CrudRepository<T, ID> {

	Iterable<T> findAll(Sort sort);

	Page<T> findAll(Pageable pageable);
}
```

示例

```java
@Test
public void testPaging(){
    Page<Customer> all = repository.findAll(PageRequest.of(0, 2));
    System.out.println(all.getTotalPages());
    System.out.println(all.getTotalElements());
    System.out.println(all.getContent());
}
```



```java
@Test
public void testSort(){
    Sort sort = Sort.by("custId").descending();
    Iterable<Customer> all = repository.findAll(sort);
    System.out.println(all);
}
```



```java
@Test
public void testSortTypeSafe(){
    Sort.TypedSort<Customer> sortType = Sort.sort(Customer.class);
    Sort sort = sortType.by(Customer::getCustId).descending();
    Iterable<Customer> all = repository.findAll(sort);
    System.out.println(all);
}
```

### JPQL

