# Spring Data JPA 学习指南

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

## Spring Data JPA

### Hello Spring Data JPA

#### 依赖

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



#### 配置文件（2选1）

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

#### 配置类（2选1）

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

#### DAO

```java
public interface CustomerRepository extends CrudRepository<Customer, Integer> { }
```

#### 测试

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



### JPQL与SQL

#### JPQL

- @Query中写jpql，参数占位符两种写法
  - `?索引`：索引从1开始
  - `:参数名`：需要用@Param指定参数名
- 增删改时，需要加两个注解
  - @Transactional 开启事务，一般加在Service层，加在@Test标记的方法上不生效，这里为了方便直接加在Dao层
  - @Modifying 标记为DML操作
  - 新增时，只能在hibernate实现中使用，而且只能用 insert into ... select 语法

```java
public interface CustomerRepository extends CrudRepository<Customer, Integer> {


    @Query("from Customer where name = ?1 order by id desc")
    List<Customer> findCustomersByName(String name);

    @Query("from Customer where id = :id")
    Customer findCustomersById(@Param("id") Integer id);

    @Modifying
    @Transactional
    @Query("update Customer c set c.name = :name where c.id = :id")
    int updateCustomersById(@Param("id") Integer id, @Param("name") String name);
    
    @Modifying
    @Transactional
    @Query("delete from Customer c where c.id = :id")
    int deleteCustomersById(@Param("id") Integer id);
    
    @Modifying
    @Transactional
	@Query("INSERT into Customer(name) select name from Customer where id = :id ")
    int saveCustomersById(@Param("id") Integer id);
}
```

#### 原生SQL

原生写法和jpql写法类似，只需要将 @Query 的 nativeQuery 属性设置为 true 即可

可以新增，想咋写就咋写

可以不用事务，但是仍然需要 @Modifying

```java
public interface CustomerRepository extends CrudRepository<Customer, Integer> {

    @Query(value = "select * from Customer where id = ?1",nativeQuery = true)
    Customer query(Integer id);

    @Modifying
    @Query(nativeQuery = true,value = "insert into customer (name) values (?1)")
    int save(String name);
}
```

### 规范方法名

::: tip

只支持查询和删除

:::

####  查询主题关键字

| 关键词                                                       | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| `find…By`,,,,,,, `read…By`_ `get…By`_ `query…By`_ `search…By`_`stream…By` | 一般查询方法通常返回存储库类型、a`Collection`或`Streamable`子类型或结果包装器（例如`Page`）`GeoResults`或任何其他特定于存储的结果包装器。可以用作`findBy…`或`findMyDomainTypeBy…`与其他关键字结合使用。 |
| `exists…By`                                                  | 存在投影，通常返回`boolean`结果。                            |
| `count…By`                                                   | 返回数字结果的计数投影。                                     |
| `delete…By`,`remove…By`                                      | 删除查询方法返回不结果 ( `void`) 或删除计数。                |
| `…First<number>…`,`…Top<number>…`                            | 将查询结果限制为第一个`<number>`结果。该关键字可以出现在主题中`find`（以及其他关键字）和之间的任何位置`by`。 |
| `…Distinct…`                                                 | 使用不同的查询仅返回唯一的结果。请参阅商店特定文档是否支持该功能。该关键字可以出现在主题中`find`（以及其他关键字）和之间的任何位置`by`。 |

#### 查询谓词关键字

| 逻辑关键字            | 关键词表达式                                  |
| :-------------------- | :-------------------------------------------- |
| `AND`                 | `And`                                         |
| `OR`                  | `Or`                                          |
| `AFTER`               | `After`,`IsAfter`                             |
| `BEFORE`              | `Before`,`IsBefore`                           |
| `CONTAINING`          | `Containing`, `IsContaining`,`Contains`       |
| `BETWEEN`             | `Between`,`IsBetween`                         |
| `ENDING_WITH`         | `EndingWith`, `IsEndingWith`,`EndsWith`       |
| `EXISTS`              | `Exists`                                      |
| `FALSE`               | `False`,`IsFalse`                             |
| `GREATER_THAN`        | `GreaterThan`,`IsGreaterThan`                 |
| `GREATER_THAN_EQUALS` | `GreaterThanEqual`,`IsGreaterThanEqual`       |
| `IN`                  | `In`,`IsIn`                                   |
| `IS`                  | `Is`, `Equals`, （或无关键字）                |
| `IS_EMPTY`            | `IsEmpty`,`Empty`                             |
| `IS_NOT_EMPTY`        | `IsNotEmpty`,`NotEmpty`                       |
| `IS_NOT_NULL`         | `NotNull`,`IsNotNull`                         |
| `IS_NULL`             | `Null`,`IsNull`                               |
| `LESS_THAN`           | `LessThan`,`IsLessThan`                       |
| `LESS_THAN_EQUAL`     | `LessThanEqual`,`IsLessThanEqual`             |
| `LIKE`                | `Like`,`IsLike`                               |
| `NEAR`                | `Near`,`IsNear`                               |
| `NOT`                 | `Not`,`IsNot`                                 |
| `NOT_IN`              | `NotIn`,`IsNotIn`                             |
| `NOT_LIKE`            | `NotLike`,`IsNotLike`                         |
| `REGEX`               | `Regex`, `MatchesRegex`,`Matches`             |
| `STARTING_WITH`       | `StartingWith`, `IsStartingWith`,`StartsWith` |
| `TRUE`                | `True`,`IsTrue`                               |
| `WITHIN`              | `Within`,`IsWithin`                           |

#### 查询谓词修饰符关键字

| 关键词                            | 描述                                                         |
| :-------------------------------- | :----------------------------------------------------------- |
| `IgnoreCase`,`IgnoringCase`       | 与谓词关键字一起使用以进行不区分大小写的比较。               |
| `AllIgnoreCase`,`AllIgnoringCase` | 忽略所有合适属性的大小写。在查询方法谓词中的某处使用。       |
| `OrderBy…`                        | 指定静态排序顺序，后跟属性路径和方向（例如`OrderByFirstnameAscLastnameDesc`）。 |

#### 方法名称中支持的关键字

| Keyword                | Sample                                                       | JPQL snippet                                                 |
| :--------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| `Distinct`             | `findDistinctByLastnameAndFirstname`                         | `select distinct … where x.lastname = ?1 and x.firstname = ?2` |
| `And`                  | `findByLastnameAndFirstname`                                 | `… where x.lastname = ?1 and x.firstname = ?2`               |
| `Or`                   | `findByLastnameOrFirstname`                                  | `… where x.lastname = ?1 or x.firstname = ?2`                |
| `Is`, `Equals`         | `findByFirstname`,<br />`findByFirstnameIs`,<br />`findByFirstnameEquals` | `… where x.firstname = ?1`                                   |
| `Between`              | `findByStartDateBetween`                                     | `… where x.startDate between ?1 and ?2`                      |
| `LessThan`             | `findByAgeLessThan`                                          | `… where x.age < ?1`                                         |
| `LessThanEqual`        | `findByAgeLessThanEqual`                                     | `… where x.age <= ?1`                                        |
| `GreaterThan`          | `findByAgeGreaterThan`                                       | `… where x.age > ?1`                                         |
| `GreaterThanEqual`     | `findByAgeGreaterThanEqual`                                  | `… where x.age >= ?1`                                        |
| `After`                | `findByStartDateAfter`                                       | `… where x.startDate > ?1`                                   |
| `Before`               | `findByStartDateBefore`                                      | `… where x.startDate < ?1`                                   |
| `IsNull`, `Null`       | `findByAge(Is)Null`                                          | `… where x.age is null`                                      |
| `IsNotNull`, `NotNull` | `findByAge(Is)NotNull`                                       | `… where x.age not null`                                     |
| `Like`                 | `findByFirstnameLike`                                        | `… where x.firstname like ?1`                                |
| `NotLike`              | `findByFirstnameNotLike`                                     | `… where x.firstname not like ?1`                            |
| `StartingWith`         | `findByFirstnameStartingWith`                                | `… where x.firstname like ?1` (parameter bound with appended `%`) |
| `EndingWith`           | `findByFirstnameEndingWith`                                  | `… where x.firstname like ?1` (parameter bound with prepended `%`) |
| `Containing`           | `findByFirstnameContaining`                                  | `… where x.firstname like ?1` (parameter bound wrapped in `%`) |
| `OrderBy`              | `findByAgeOrderByLastnameDesc`                               | `… where x.age = ?1 order by x.lastname desc`                |
| `Not`                  | `findByLastnameNot`                                          | `… where x.lastname <> ?1`                                   |
| `In`                   | `findByAgeIn(Collection<Age> ages)`                          | `… where x.age in ?1`                                        |
| `NotIn`                | `findByAgeNotIn(Collection<Age> ages)`                       | `… where x.age not in ?1`                                    |
| `True`                 | `findByActiveTrue()`                                         | `… where x.active = true`                                    |
| `False`                | `findByActiveFalse()`                                        | `… where x.active = false`                                   |
| `IgnoreCase`           | `findByFirstnameIgnoreCase`                                  | `… where UPPER(x.firstname) = UPPER(?1)`                     |

### Query by Example

::: warning 痛点

JPQL和规范方法名，无法像Mybatis动态标签那样实现动态的查询，

比如，想根据商品名称查询，又想根据型号等其他条件查询，用上述方法只能写多个方法来完成，

因此就有了Query by Example

但是只支持查询

- 不支持嵌套或分组的属性约束，如 firstname = ?1 or (firstname = ?2 and lastname = ?3)
- 只支持字符串 start/contains/ends/regex 匹配和其他属性类型的精确匹配。

:::

示例查询 (QBE) 是一种用户友好的查询技术，界面简单。它允许动态查询创建，并且不需要您编写包含字段名称的查询。事实上，示例查询根本不需要您使用特定于商店的查询语言来编写查询

#### DAO

继承 `QueryByExampleExecutor<T>`

```java
public interface CustomerRepository extends CrudRepository<Customer, Integer>, QueryByExampleExecutor<Customer> {}
```

#### 方法

```java
public interface QueryByExampleExecutor<T> {

	<S extends T> Optional<S> findOne(Example<S> example);

	<S extends T> Iterable<S> findAll(Example<S> example);

	<S extends T> Iterable<S> findAll(Example<S> example, Sort sort);

	<S extends T> Page<S> findAll(Example<S> example, Pageable pageable);

	<S extends T> long count(Example<S> example);

	<S extends T> boolean exists(Example<S> example);

	<S extends T, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction);
}
```

#### 测试

```java
    @Test
    public void testFindAll() {
        Customer customer = new Customer();
        customer.setName("王五");
        Example<Customer> example = Example.of(customer);
        System.out.println(repository.findAll(example));
    }

    @Test
    public void testFindAll2() {
        Customer customer = new Customer();
        customer.setName("WingWu");想·
        // 匹配器， 去设置更多条件匹配
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withIgnoreCase("name");
        Example<Customer> example = Example.of(customer, matcher);
        System.out.println(repository.findAll(example));
    }
```

### Specifications

在之前使用Query by Example只能针对字符串进行条件设置，那如果希望对所有类型支持，可以使用Specifications

#### DAO

继承`JpaSpecificationExecutor<T>`

```java
public interface CustomerRepository extends CrudRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {}
```

#### 测试

- Root：查询哪个表（关联查询） 相当于 from，通过get方法拿到对应列
- CriteriaQuery：查询哪些字段，排序，用于组合（order by ，where ）
- CriteriaBuilder：条件之间是什么关系，如何生成一个查询条件，每一个查询条件都是什么类型（>,between, in...) ，相当于 where
- Predicate（Expression）： 每一条查询条件的详细描述

::: tip

不能分组、聚合函数， 需要自己通过entityManager玩

:::

```java
@Test
public void testSpecifications() {
    List<Customer> customers = repository.findAll((root, query, criteriaBuilder) -> {
        // root --- 列
        // query
        // criteriaBuilder --- 条件
        Path<Integer> id = root.get("id");
        Path<String> name = root.get("name");

        return criteriaBuilder.and(
                criteriaBuilder.gt(id, 2),
                criteriaBuilder.in(name).value("王五").value("李四")
        );

    });

    System.out.println(customers);
}
```



### Querydsl

QueryDSL是基于ORM框架或SQL平台上的一个通用查询框架。借助QueryDSL可以在任何支持的ORM框架或SQL平台上以通用API方式构建查询。

JPA是QueryDSL的主要集成技术，是JPQL和Criteria查询的代替方法。目前QueryDSL支持的平台包括JPA，JDO，SQL，Mongodb 等等。。。

Querydsl扩展能让我们以链式方式代码编写查询方法。该扩展需要一个接口QueryDslPredicateExecutor，它定义了很多查询方法。

#### 依赖

```xml
<!-- querydsl -->
<dependency>
    <groupId>com.querydsl</groupId>
    <artifactId>querydsl-jpa</artifactId>
    <version>4.4.0</version>
</dependency>
```

#### 插件

用来生成Q类

- 用maven执行编译，会在target/generated‐sources/queries生成对应的Q类
- 将target/generated‐sources/queries文件夹标记为source

```xml
<plugin>
    <groupId>com.mysema.maven</groupId>
    <artifactId>apt-maven-plugin</artifactId>
    <version>1.1.3</version>
    <dependencies>
        <dependency>
            <groupId>com.querydsl</groupId>
            <artifactId>querydsl-apt</artifactId>
            <version>4.4.0</version>
        </dependency>
    </dependencies>
    <executions>
        <execution>
            <phase>generate-sources</phase>
            <goals>
                <goal>process</goal>
            </goals>
            <configuration>
                <outputDirectory>target/generated‐sources/queries</outputDirectory>
                <processor>com.querydsl.apt.jpa.JPAAnnotationProcessor</processor>
                <logOnlyOnError>true</logOnlyOnError>
            </configuration>
        </execution>
    </executions>
</plugin>
```



#### DAO

继承`QuerydslPredicateExecutor<T>`

```java
public interface CustomerRepository extends CrudRepository<Customer, Integer>, QuerydslPredicateExecutor<Customer> {}
```

#### 测试

```java
@Test
public void testQueryDSL(){
    QCustomer qCustomer = QCustomer.customer;
    BooleanExpression expression = qCustomer.id.eq(2)
            .and(qCustomer.name.endsWith("四"));
    Optional<Customer> customer = repository.findOne(expression);
    System.out.println(customer);
}
```

