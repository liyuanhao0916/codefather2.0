# Mybatis-plus

## 特性

- 无侵入：只做增强不做改变，不会对现有工程产生影响
- 强大的 CRUD 操作：内置通用 Mapper，少量配置即可实现单表CRUD 操作
- 支持 Lambda：编写查询条件无需担心字段写错
- 支持主键自动生成
- 内置分页插件
- ……

## Lombok

- Lombok，一个Java类库，提供了一组注解，简化POJO实体类开发。

- 添加依赖

  ```xml
  <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <!--<version>1.18.12</version>-->
  </dependency>
  ```

- 如果删除setter和getter方法爆红需要装Lombok插件

- pojo类添加注解

  - @Data:是个组合注解（=@Setter+@Getter+@ToString+@EqualsAndHashCode）
  - @NoArgsConstructor:提供一个无参构造函数
  - @AllArgsConstructor:提供一个包含所有参数的构造函数

## 步骤

- 补全pom ----druid
- 配置yml ----datasource
- 创建pojo
- 创建dao，继承接口BaseMapper<>
- 编写引导类
- Dao接口要想被容器扫描到，有两种解决方案:
  - dao接口添加注解@Mapper
  - （推荐）引导类加注解@MapperScan

## CURD与分页

### DQL

#### 查询    

T selectById (Serializable id)、List`<T>` selectList(Wrapper`<T>` queryWrapper)

- Wrapper构建查询条件
  - QueryWrapper`<User>` qw = new QueryWrapper`<User>`();
    - 普通方法如：lt（“属性”，"属性值"）
    - lambda方法：lambda（）.普通方法（lambda表达式，属性值）
  - **（推荐） LambdaQueryWrapper`<User>` lqw = new LambdaQueryWrapper`<User>`();**

#### 条件查询

- like():前后加百分号,如 %J%
- likeLeft():前面加百分号,如 %J
- likeRight():后面加百分号,如 J%
- ge():大于等于(>=)
- le():小于等于(`<=)
- between()

#### 多条件查询

- 范围两个值，但pojo只有一个属性，怎么接？

  再创建一个pojo继承前面的属性，新加一个对应属性

- null判定

  - 方法形参（boolean condition，SFunction<T,?>` colunm,Object val）
  - condition"条件"   为boolean类型，返回true，则添加条件，返回false则不添加条件

  ```java
  @Test
  public void testSelect(){
      //模拟前端数据
      User user = new User();
      user.setName("Tom");
      user.setPassword("dadada");
      //查询条件
      LambdaQueryWrapper<User> lqw = new LambdaQueryWrapper<>();
      lqw
              .eq(user.getName() != null,User::getName,user.getName())
              .or()
              .eq(user.getId() != null,User::getId,user.getId());
      //分页条件
      Page<User> page = new Page<>(1,3);
      //查询
      Page<User> userPage = userDao.selectPage(page, lqw);
      System.out.println(userPage.getRecords());
  }
  ```

#### 指定字段

- select（...）

  ```java
  lqw.select(User::getId,User::getName,User::getAge);
  ```

#### 排序查询

- orderBy排序
  * condition:条件，true则添加排序，false则不添加排序
  * isAsc:是否为升序，true升序，false降序
  * columns:排序字段，可以有多个
- orderByAsc/Desc(单个column):按照指定字段进行升序/降序
- orderByAsc/Desc(多个column):按照多个字段进行升序/降序
- orderByAsc/Desc
  * condition:条件，true添加排序，false不添加排序
  * 多个columns：按照多个字段进行排序

#### 聚合函数

- 只能使用QueryWrapper创建查询条件

- select（“ ”）；

- 起别名，方便前端获取数据

  ```java
  @Test
  void testGetAll(){
      QueryWrapper<User> lqw = new QueryWrapper<User>();
      //lqw.select("count(*) as count");
      //SELECT count(*) as count FROM user
      //lqw.select("max(age) as maxAge");
      //SELECT max(age) as maxAge FROM user
      //lqw.select("min(age) as minAge");
      //SELECT min(age) as minAge FROM user
      //lqw.select("sum(age) as sumAge");
      //SELECT sum(age) as sumAge FROM user
      lqw.select("avg(age) as avgAge");
      //SELECT avg(age) as avgAge FROM user
      List<Map<String, Object>> userList = userDao.selectMaps(lqw);
      System.out.println(userList);
  }
  ```

#### 分组查询

- 只能使用QueryWrapper创建查询条件
- groupBy("tel");

#### 名称映射问题

- @TableField --- 字段映射问题
  - value -- 字段名
  - exist -- 数据表是否存在该字段
  - select -- 是否默认查询，排除敏感字段（如密码可设置为false）
- @TableName --- 表名映射问题

#### 其他方法

参考官网：https://baomidou.com/pages/10c804/#abstractwrapper

#### 自定义查询

可在dao中自定义查询语句

### DML

#### 增删改

- 新增	int insert (T t)
- 删除    int deleteById (Serializable id)
  - Serializable“序列化类”     参数类型
    - String、Number（Float、Double、Integer）是Serializable接口的子类
- 修改    int updateById(T t);

#### id生成策略

- 不同的表应用不同的id生成策略

  * 日志：自增（1,2,3,4，……）
  * 购物订单：特殊规则（FQ23948AK3843）
  * 外卖单：关联地区日期等信息（10 04 20200314 34 91）
  * 关系表：可省略id
  * ……

- @TableId

  - value设置为默认主键

  - type生成策略

    - IdType.AUTO自增，**只有一台服务器用**
    - NONE: 不设置id生成策略 ≈ INPUT，**基本不用**
    - INPUT:用户手工输入id，**基本不用**
    - ASSIGN_ID:雪花算法生成id(可兼容数值型与字符串型)，**如果手动设置，使用手动设置的**，**修改了系统时间就有可能导致出现重复主键**
    - ASSIGN_UUID:以UUID生成算法作为id生成策略，**String类型，数据库需要改为varchar**，32位的字符串，**不能排序，查询性能也慢**

  - 分布式id

    - 当数据量足够大的时候，一台数据库服务器存储不下，这个时候就需要多台数据库服务器进行存储
    - 比如订单表就有可能被存储在不同的服务器上
    - 如果用数据库表的自增主键，因为在两台服务器上所以会出现冲突
    - 这个时候就需要一个全局唯一ID,这个ID就是分布式ID。

  - 雪花算法

    雪花算法(SnowFlake),是Twitter官方给出的算法实现 是用Scala写的。其生成的结果是一个64bit大小整数，它的结构如下图:

    ![image-20220614144626484](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220614144626484.png)

    1. 1bit,不用,因为二进制中最高位是符号位，1表示负数，0表示正数。生成的id一般都是用整数，所以最高位固定为0。
    2. 41bit-时间戳，用来记录时间戳，毫秒级
    3. 10bit-工作机器id，用来记录工作机器id,其中高位5bit是数据中心ID其取值范围0-31，低位5bit是工作节点ID其取值范围0-31，两个组合起来最多可以容纳1024个节点
    4. 序列号占用12bit，每个节点每毫秒0开始不断累加，最多可以累加到4095，一共可以产生4096个ID

- 简化配置yml

  ```yaml
  mybatis-plus:
    global-config:
      db-config:
      	id-type: assign_id  #只需加@TableId，不需再配置ID策略
      	table-prefix: tbl_  #表别名前缀，类名除首字母大写外一致，可省略@TableName
  ```

#### 批量操作

- int deleteBatchIds(@Param(Constants.COLLECTION) Collection`<? extends Serializable>` **idList**);

  ```java
  @Test
  void testDelete(){
      //删除指定多条数据
      List<Long> list = new ArrayList<>();
      list.add(1402551342481838081L);
      list.add(1402553134049501186L);
      list.add(1402553619611430913L);
      userDao.deleteBatchIds(list);
  }
  ```

- List`<T>` selectBatchIds(@Param(Constants.COLLECTION) Collection`<? extends Serializable>` **idList**);

  ```java
  @Test
  void testGetByIds(){
      //查询指定多条数据
      List<Long> list = new ArrayList<>();
      list.add(1L);
      list.add(3L);
      list.add(4L);
      userDao.selectBatchIds(list);
  }
  ```

#### 逻辑删除

问题：员工离职，员工删除，业绩无主，年终统计数据有误

解决

- 数据库表添加`deleted`列（自定义：0为正常，设为默认值，1为删除）
- 实体类添加属性
- 标识新增的字段为逻辑删除字段，使用@TableLogic(value="0",delval="1")
  - value逻辑未删除的值
  - delval逻辑删除的值

对查询的影响

- 会在sql语句后默认添加where deleted = 0，被删除的查不出来

- 如果想查就在dao中自定义查询语句

  ```java
  public interface UserDao extends BaseMapper<User> {
      //查询所有数据包含已经被删除的数据
      @Select("select * from tbl_user")
      public List<User> selectAll();
  }
  ```

简化配置yml

```yml
mybatis-plus:
  global-config:
    db-config:
      ## 逻辑删除字段名
      logic-delete-field: deleted
      ## 逻辑删除字面值：未删除为0
      logic-not-delete-value: 0
      ## 逻辑删除字面值：删除为1
      logic-delete-value: 1
```

#### 乐观锁

问题：秒杀高并发时，发生超卖、重卖

解决：一台服务器可用线程锁，多台服务器线程锁依然存在问题，使用乐观锁

步骤

- 数据库表添加列version，设置默认值为`1`

- 在实体类中添加对应的属性，加@Version

- 添加乐观锁的拦截器

  ```java
  @Configuration
  public class MpConfig {
      @Bean
      public MybatisPlusInterceptor mpInterceptor() {
          //1.定义Mp拦截器
          MybatisPlusInterceptor mpInterceptor = new MybatisPlusInterceptor();
          //2.添加乐观锁拦截器
          mpInterceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
          return mpInterceptor;
      }
  }
  ```

- 拿到锁 ---- 查询

- 执行更新操作时携带version数据，自动在sql中加入version = ？的条件

- 执行完后version会自动 +1 ，其他的用户无法更新到同一个version

- 模拟

  ```java
  @Test
  void testUpdate(){
     //1.先通过要修改的数据id将当前数据查询出来
      User user = userDao.selectById(3L);     //用户1，拿到的version=3
      User user2 = userDao.selectById(3L);    //用户2，拿到的version=3
      //用户2更新
      user2.setName("Jock aaa");
      userDao.updateById(user2);              //version=>4
      //用户1更新
      user.setName("Jock bbb");
      userDao.updateById(user);               //verion=3?条件还成立吗？
  }
  ```

### 分页    

IPage`<T>`  selectPage(IPage`<T>` page, Wrapper`<T>` queryWrapper)

- 分页拦截器

  - 创建MybatisPlusConfig配置类

    ```java
    @Configuration
    public class MybatisPlusConfig {
        
        @Bean
        public MybatisPlusInterceptor mybatisPlusInterceptor(){
            //1 创建MybatisPlusInterceptor拦截器对象
            MybatisPlusInterceptor mpInterceptor=new MybatisPlusInterceptor();
            //2 添加分页拦截器
            mpInterceptor.addInnerInterceptor(new PaginationInnerInterceptor());
            return mpInterceptor;
        }
    }
    ```

- new Page（第几页，每页多少条）

- IPage分页条件，传入Page对象

- page方法

  - getRecords数据
  - getCurrent当前页码
  - getSize每页多少条
  - getPages一共多少页
  - getTotal一共多少条

```java
@Test
public void testPage(){
    Page<User> page = new Page<>(1, 3);
    userDao.selectPage(page, null);
    System.out.println("数据：" + page.getRecords());
    System.out.println("一共多少页：" + page.getPages());
}
```

## 代码生成器(旧)

- 添加依赖

  ```xml
  <!--代码生成器-->
  <dependency>
      <groupId>com.baomidou</groupId>
      <artifactId>mybatis-plus-generator</artifactId>
      <version>3.4.1</version>
  </dependency>
  
  <!--velocity模板引擎-->
  <dependency>
      <groupId>org.apache.velocity</groupId>
      <artifactId>velocity-engine-core</artifactId>
      <version>2.3</version>
  </dependency>
  ```

- 启动类添加@MapperScan（“”）

- 创建代码生成类

  [代码生成器（旧） | MyBatis-Plus (baomidou.com)](https://baomidou.com/pages/d357af/#使用教程)

  ```java
  public class CodeGenerator {
      public static void main(String[] args) {
          //1.获取代码生成器的对象
          AutoGenerator autoGenerator = new AutoGenerator();
  
          //设置数据库相关配置
          DataSourceConfig dataSource = new DataSourceConfig();
          dataSource.setDriverName("com.mysql.cj.jdbc.Driver");
          dataSource.setUrl("jdbc:mysql://localhost:3306/mybatisplus_db?serverTimezone=UTC");
          dataSource.setUsername("root");
          dataSource.setPassword("abc123");
          autoGenerator.setDataSource(dataSource);
  
          //设置全局配置
          GlobalConfig globalConfig = new GlobalConfig();
          globalConfig.setOutputDir(System.getProperty("user.dir")+"/src/main/java");    //设置代码生成位置
          globalConfig.setOpen(false);    //设置生成完毕后是否打开生成代码所在的目录
          globalConfig.setAuthor("黑马程序员");    //设置作者
          globalConfig.setFileOverride(true);     //设置是否覆盖原始生成的文件
          globalConfig.setMapperName("%sDao");    //设置数据层接口名，%s为占位符，指代模块名称
          globalConfig.setIdType(IdType.ASSIGN_ID);   //设置Id生成策略
          autoGenerator.setGlobalConfig(globalConfig);
  
          //设置包名相关配置
          PackageConfig packageInfo = new PackageConfig();
          packageInfo.setParent("com.botuer");   //设置生成的包名，与代码所在位置不冲突，二者叠加组成完整路径
          packageInfo.setEntity("domain");    //设置实体类包名
          packageInfo.setMapper("dao");   //设置数据层包名
          autoGenerator.setPackageInfo(packageInfo);
  
          //策略设置
          StrategyConfig strategyConfig = new StrategyConfig();
          strategyConfig.setInclude("tbl_user");  //设置当前参与生成的表名，参数为可变参数
          strategyConfig.setTablePrefix("tbl_");  //设置数据库表的前缀名称，模块名 = 数据库表名 - 前缀名  例如： User = tbl_user - tbl_
          strategyConfig.setRestControllerStyle(true);    //设置是否启用Rest风格
          strategyConfig.setVersionFieldName("version");  //设置乐观锁字段名
          strategyConfig.setLogicDeleteFieldName("deleted");  //设置逻辑删除字段名
          strategyConfig.setEntityLombokModel(true);  //设置是否启用lombok
          autoGenerator.setStrategy(strategyConfig);
          //2.执行生成操作
          autoGenerator.execute();
      }
  }
  ```

## 控制台日志

- 打印sql

  ```yaml
  mybatis-plus:
    configuration:
      log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  ```

- 取消spring

  - 创建logback.xml

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <configuration>
    </configuration>
    ```

- 取消MyBatisPlus图标

  ```yaml
  ## mybatis-plus日志控制台输出
  mybatis-plus:
    configuration:
      log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    global-config:
      banner: off ## 关闭mybatisplus启动图标
  ```

- 取消spring图标

  ```yaml
  spring:
    main:
      banner-mode: off ## 关闭SpringBoot启动图标(banner)
  ```

