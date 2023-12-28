# Mybatis

## 1. 使用步骤

### 1. Maven配置文件【pom.xml】

```xml
 <dependencies>

        <!-- mybatis -->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.5.5</version>
        </dependency>
        <!-- mysql 驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.28</version>
        </dependency>
        <!-- 添加slf4j日志api -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>1.7.25</version>
        </dependency>
        <!-- 添加logback-classic依赖 -->
        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>1.2.3</version>
        </dependency>
        <!-- 添加logback-core依赖 -->
        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-core</artifactId>
            <version>1.2.3</version>
        </dependency>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.1</version>
            <scope>test</scope>
        </dependency>

    </dependencies>
```

### 2.properties配置为文件

```properties
jdbc.driver=com.mysql.cj.jdbc.Driver
jdbc.username=root
jdbc.password=abc123
jdbc.url=jdbc:mysql://localhost:3306/atguigudb?characterEncoding=utf8&useSSL=false&serverTimezone=UTC&rewriteBatchedStatements=true
```

### 3. 核心配置文件【mybatis-config.xml】

> 1. properties：resource是properties的文件名，此方式可以更好管理数据库连接信息
> 2. settings：每个setting子标签都是进行全局设置，name属性可以是下列值，value是布尔类型
>    - mapUnderscoreToCamelCase（下划线改驼峰），true则自动转换
>    - lazyLoadingEnabled（延迟加载），开启延迟加载后，sql查询时只加载需要的属性，true则开启延迟加载，此设置可以根据需要，在各个配置文件中自定义映射的`<association>`,`<collection>`标签的fetchType属性进行设置，lazy为延迟加载，eager为立即加载
> 3. typeAliases：给实体类起别名，采用包扫描，package子标签的name属性填写包名，使得类在配置文件中默认值为实体类名，不配置的话需要写全类名
> 4. environments：配置数据库连接环境信息。可以配置多个environment，通过default属性切换不同的environment
>
>    - transactionManager
>
>      - JDBC：手动事务管理，即手动提交回滚
>
>      - MANAGED：事务被管理，如Spring中的AOP
>
>    - dataSource：POOLED（使用连接池），UNPOOLED，JNDI
> 5. Mapper：包扫描的方式，package子标签的name属性填写包名，使得包下所有Mapper配置文件得到匹配

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <properties resource="jdbc.properties"></properties>
    
    <settings>
        <!--将表中字段的下划线自动转换为驼峰-->
        <setting name="mapUnderscoreToCamelCase" value="true"/>
        <!--开启延迟加载-->
        <setting name="lazyLoadingEnabled" value="true"/>
    </settings>
    
    <typeAliases>
        <package name="com.botuer.pojo"/>
    </typeAliases>

    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <!--数据库连接信息-->
            <dataSource type="POOLED">
                <property name="driver" value="${jdbc.driver}"/>
                <property name="url" value="${jdbc.url}"/>
                <property name="username" value="${jdbc.username}"/>
                <property name="password" value="${jdbc.password}"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
        <package name="com.botuer.mapper"/>
    </mappers>
</configuration>
```

### 4. 映射配置文件【BrandMapper.xml】	

> 1. 文件名和接口名相同，以”类+Mapper“的格式命名
> 2. 路径和同名接口的路径相同（com/botuer/mapper）注意用/代替.
> 3. 【namespace】填写代理接口全类名
> 4. 每个Statement的【id】必须和同名接口的方法一一对应
> 5. 【resultType】填写含包的类的完整路径，但是字段名和对应属性名的命名方式不一样，尽管可以使用字段别名，但还是很繁琐，可以用sql标签提供sql片段，提高复用，但很不灵活
>
>    - 我们定义resultMap标签来替换resultType属性
>    - resultMap的id属性作为唯一标识，替换resultType的属性值
>    - resultMap的type属性是映射的类型，一般为pojo的类名
>    - result子标签是对一般字段名的映射，id子标签是对主键字段名的映射
>    - 子标签中column属性为字段名，property为属性名，形成替换
> 6. 【可省略】配置 `ParameterType` 来指定参数类型
> 7. 特殊字段
>    - 使用转义字符，`&lt;` 就是 `<`
>
>    - 使用&lt;![CDATA[内容]]>,idea中输入CD直接提示生成

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.botuer.mapper.BrandMapper">
    <!--此部分使用resultMap标签替换
    <select id="selectAll" resultType="com.botuer.pojo.Brand">
        select * from Brands2;
    </select>
	-->
     <resultMap id="brandResultMap" type="Brand">
         <result column="brand_name" property="brandName"/>
        <result column="company_name" property="companyName"/>
    </resultMap>   
	<select id="selectAll" resultMap="brandResultMap">
        select *
        from tb_brand;
    </select>    
</mapper>
```

### 5.日志配置文件【logback.xml】

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!--
        CONSOLE ：表示当前的日志信息是可以输出到控制台的。
    -->
    <appender name="Console" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>[%level] %blue(%d{HH:mm:ss.SSS}) %cyan([%thread]) %boldGreen(%logger{15}) - %msg %n</pattern>
        </encoder>
    </appender>

    <logger name="com.botuer" level="DEBUG" additivity="false">
        <appender-ref ref="Console"/>
    </logger>
    <!--
      level:用来设置打印级别，大小写无关：TRACE, DEBUG, INFO, WARN, ERROR, ALL 和 OFF
     ， 默认debug
      <root>可以包含零个或多个<appender-ref>元素，标识这个输出位置将会被本日志级别控制。
      -->
    <root level="DEBUG">
        <appender-ref ref="Console"/>
    </root>
</configuration>
```

### 6. 提供对应的实体类

> 放在pojo包下

### 7. 提供对应的接口

> 放在mapper包下
>
> 接口名要和映射文件名相同
>
> 方法名要和Statement的id相同

```java
public interface BrandMapper {
    //查询所有
    List<Brand> selectAll();
    //查看详情：根据Id查询
    Brand selectById(int id);
	   //添加
    void add(Brand brand);
    //修改
    int update(Brand brand);
}
```

### 8. 创建Utils类

> 在utils包下创建
>
> 提供获取SqlSession的静态方法
>
> - sqlSessionFactory.openSession(true)此方法调用时，true表示自动提交，空参默认false
>
> 还可以直接提供获取对应实体类Mapper的静态方法

```java
public class SqlSessionUtils {
    public static SqlSession getSqlSession(){
         //1. 加载mybatis的核心配置文件，获取 SqlSessionFactory
        String resource = "mybatis-config.xml";
        InputStream inputStream = null;
        try {
            inputStream = Resources.getResourceAsStream(resource);
        } catch (IOException e) {
            e.printStackTrace();
        }
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        //2. 获取SqlSession对象，用它来执行sql
        return sqlSessionFactory.openSession(true);
    }

    public static BrandMapper getBrandMapper(){
         //3. 获取UserMapper接口的代理对象
        SqlSession sqlSession = getSqlSession();
        return sqlSession.getMapper(BrandMapper.class);
    }
}
```





### 9. 创建测试类

> 在测试文件夹的对应包下创建

```java
public class BrandTest {
    @Test
    public void sestSelectAll throws IOException {
        //3. 获取UserMapper接口的代理对象，并执行sql
  		BrandMapper brandMapper = SqlSession.getBrandMapper();
        List<Brand> brands = brandMapper.selectAll();
        System.out.println(brands);
        //4. 释放资源
        sqlSession.close();
    }
}
```

## 2. 基础操作

### 1. 占位符

- 参数占位符#{}替换？，底层使用的仍然是`PreparedStatement`

- #{}的{}中填写的内容和属性对应

- ${}，特殊情况才用（用的话加单引号），底层使用的是 `Statement`，存在Sql注入

### 2.sql片段（可选）

​		不仅可以为字段起别名，更重要的是提高复用性

```xml
<sql id="empColumns">
	eid,ename,age,sex,did
</sql>

select <include refid="empColumns"></include>
from t_emp
```

### 3. 获取参数值

- 单条件查询时，一个参数，#{}中可以填任意值，但是一般填 `对应属性名` 

- 多条件查询需要用到多字段，多个字面量类型，有四种方式：自动生成Map，手动创建Map，**创建实体类对象，使用@param注解**

  **3.1 `（不推荐）` 接口中方法的参数为多个时，自动把参数放到map集合中**，以arg0，arg1...为键，以参数为值，或者以param1，param2...为键，以参数为值，通过#{}访问map集合的键来获取对应参数值

  - #{}可以写成#{arg0} and #{arg1}

  - #{}也可以写成#{param1} and #{param2}

  - #{}还可以写成#{arg0} and #{param2}

    ```java
    List<Brand> selectByCondition(String brandName,String companyName);
    ```

     ```xml
    <select id="selectByCondition" resultMap="brandResultMap">
      select *
      from tb_brand
      where brand_name = #{arg0} and company_name = #{arg1};
    </select>
     ```

    ```java
     List<Brand> brands = brandMapper.selectByCondition("三只松鼠", "三只松鼠股份有限公司");
    ```

  **3.2 接口方法参数类型为map，可以手动创建map集合**

  - 在测试类中创建map集合

  - 往map集合中添加键值对

    ```java
    List<Brand> selectByCondition(Map map);
    ```

    ```xml
    <select id="selectByCondition" resultMap="brandResultMap">
        select *  
        from tb_brand  
        where brand_name = #{brandName} and company_name = #{companyName};
    </select>
    ```

    ```java
    Map<String,String> map = new HashMap<>();
    map.put("brandName","三只松鼠");
    map.put("companyName","三只松鼠股份有限公司");
    
    List<Brand> brand = brandMapper.selectByCondition(map);
    ```

  **3.3 ` 使用最频繁` 接口方法参数类型为实体类，可以手动创建实体类对象**

  - 在测试类创建实体类对象

  - 通过set方法给属性赋值

    ```java
    int insertBrand(Brand brand);
    ```

    ```xml
    <insert id="insertBrand">
       insert into tb_brand (brand_name,company_name)
       values (#{brandName},#{companyName});
    </insert>
    ```

    ```java
    Brand brand = new Brand();
    brand.setBrandName("联想");
    brand.setCompanyName("联想集团");
    
    int count = brandMapper.insertBrand(brand);
    ```

  **3.4 ` 应用范围最广 ` 使用@param注解**

  ```java
  List<Brand> selectByCondition(@Param("brandName") String brandName,@Param("companyName") String companyName);
  ```

  ```xml
  <select id="selectByCondition" resultMap="brandResultMap">
      select *  
      from tb_brand  
      where brand_name = #{brandName} and company_name = #{companyName};
  </select>
  ```

  ```java
   List<Brand> brands = brandMapper.selectByCondition("三只松鼠", "三只松鼠股份有限公司");
  ```

### 4. 返回值类型

​	4.1 增删改返回值为void或int，int用于接收受影响的行数

​	4.2 查询的返回值，要根据Statement语句具体分析

- List集合可以接收0个、1个、多个实体类对象

- map可以接收0个、1个、多个（map键都设为String，值都设为Object）

  - 一个

  ```java
   Map<String,Object> selectByIdToMap(@Param("id")int id);
  ```

  ```xml
  <select id="selectByIdToMap" resultType="java.util.Map">
      select *
      from tb_brand
      where id = #{id};
  </select>
  ```

  ```java
  Map<String, Object> stringObjectMap = brandMapper.selectByIdToMap(2);
  ```

  - 多个(方式一：用List接收Map)

  ```java
   List<Map<String,Object>> selectByIdToMap(@Param("id")int id);
  ```

  ```xml
  <select id="selectByIdToMap" resultType="java.util.Map">
      select *
          from tb_brand
          where id <![CDATA[
              <
          ]]>#{id};
  </select>
  ```

  ```java
   List<Map<String, Object>> maps = brandMapper.selectAllByIdToMap(3);
  ```

  - 多个(方式二：用@MapKey（“id”）注解，来确定多个Map以什么为键输出，一般用主键)

  ```java
  @MapKey("id")
  Map<String,Object> selectAllByIdToMap2(@Param("id")int id);
  ```

  ```xml
  <select id="selectByIdToMap" resultType="java.util.Map">
      select *
          from tb_brand
          where id <![CDATA[
              <
          ]]>#{id};
  </select>
  ```

  ```java
   Map<String, Object> stringObjectMap = brandMapper.selectAllByIdToMap2(3);
  ```

### 5. 自定义映射`<resultMap>`

**5.1** resultMap标签不仅可以匹配别名（**不管字段和属性匹不匹配，都写上**），更重要的功能是多表查询

- `<id>`子标签匹配主键别名，column属性是字段名，property属性是属性名，还可以在核心配置文件用`<setting>`进行全局配置

  ```xml
  <id property="id" column="id"></id>
  <result property="brandName" column="brand_name"></result>
  ```

**5.2 多表查询--多对一（一对一）映射**（此处以员工表和部门表为例，通常多方表含少方的主键，如：员工表含部门表的主键）

- 两个实体类必须有联系，

  > 多对一映射是以emp为主表
  >
  > Emp类中添加Dept的实例为对象private Dept dept；

- 方式一：级联

  ```java
  Employee selectByEmpId1(@Param("empId") Integer empId);
  ```

  ```xml
  <resultMap id="EmpResultMap1" type="employee">
      <id column="emp_id" property="empId"/>
      <result column="emp_name" property="empName"/>
      <result column="dept_id" property="deptId"/>
      <result column="dept_id" property="dept.deptId"/>
      <result column="dept_name" property="dept.deptName"/>
  </resultMap>
  
  <select id="selectByEmpId" resultMap="EmpResultMap1">
      select * 
      from emp left join dept 
      on emp.dept_id = dept.dept_id 
      where emp_id = #{empId}
  </select>
  ```

  ```java
   Employee employee = employeeMapper.selectByEmpId(2);
  ```

- 方式二：`<association>`子标签表示关联，property属性是Emp类中两实体类关联属性（即Dept的实例），javaType属性是Dept类

  ```java
  Employee selectByEmpId1(@Param("empId") Integer empId);
  ```

  ```xml
  <resultMap id="EmpResultMap2" type="employee">
      <id column="emp_id" property="empId"/>
      <result column="emp_id" property="empId"/>
      <result column="emp_name" property="empName"/>
      <result column="age" property="age"/>
      <result column="dept_id" property="deptId"/>
      <association property="dept" javaType="department">
          <id column="dept_id" property="deptId"/>
          <result column="dept_name" property="deptName"/>
      </association>
  </resultMap>
  
  <select id="selectByEmpId1" resultMap="EmpResultMap2">
      select * from emp left join dept on emp.dept_id = dept.dept_id where emp_id = #{empId}
  </select>
  ```

  ```java
  Employee employee = employeeMapper.selectByEmpId1(2);
  ```

- 方式三：分步查询`<association>`，property属性是Emp类中两实体类关联属性（即Dept的实例），select属性是namespace.sqlId，column属性是关联条件的字段

  - 步骤一：查员工信息，得到部门id

  ```java
  Employee selectByEmpIdStepOne(@Param("empId") Integer empId);
  ```

  ```xml
  <resultMap id="EmpResultMap3" type="employee">
      <id column="emp_id" property="empId"/>
      <result column="emp_id" property="empId"/>
      <result column="emp_name" property="empName"/>
      <result column="age" property="age"/>
      <result column="dept_id" property="deptId"/>
      <association property="dept"
                   select="com.botuer.mapper.DepartmentMapper.selectByEmpIdStepTwo"
                   column="dept_id">
      </association>
  </resultMap>
  
  <select id="selectByEmpIdStepOne" resultMap="EmpResultMap3">
      select * from emp where emp_id = #{empId}
  </select>
  ```

  - 步骤二：根据得到的部门id查部门信息

  ```java
  Deprecated selectByEmpIdStepTwo(@Param("deptId") Integer deptId);
  ```

  ```xml
  <resultMap id="selectByEmpIdStepTwo" type="department">
      <id column="dept_id" property="deptId"/>
      <result column="dept_name" property="deptName"/>
  </resultMap>
  
  <select id="selectByEmpIdStepTwo" resultMap="selectByEmpIdStepTwo">
      select * from dept where dept_id = #{deptId}
  </select>
  ```

  ```java
  Employee employee = employeeMapper.selectByEmpIdStepOne(3);
  ```

**5.3 多表查询--一对多映射**

- 两个实体类必须有联系，

  > 多对一映射是以dept为主表
  >
  > Dept类中添加Emp的实例为对象`private List<Employee> emps`;

- 方式一：`<collection>`子标签表示集合，用法和`<association>`基本相同，property属性是Dept类中两实体类关联属性（即Emp的实例），ofType属性是Emp类

  ```java
  Department selectByDeptId1(@Param("deptId") Integer deptId);
  ```

  ```xml
  <resultMap id="selectByDeptId1" type="department">
      <id column="dept_id" property="deptId"/>
      <result column="dept_name" property="deptName"/>
      <collection property="emps" ofType="employee">
          <id column="emp_id" property="empId"/>
          <result column="emp_id" property="empId"/>
          <result column="emp_name" property="empName"/>
          <result column="age" property="age"/>
          <result column="dept_id" property="deptId"/>
      </collection>
  </resultMap>
  
  <select id="selectByDeptId1" resultMap="selectByDeptId1">
      select * from dept left join emp on dept.dept_id = emp.dept_id where dept.dept_id = #{deptId}
  </select>
  ```

  ```java
  Department department = departmentMapper.selectByDeptId1(2);
  ```

- 方式二：`<collection>`子标签表示集合，property属性是Dept类中两实体类关联属性（即Emp的实例），select属性是namespace.sqlId，column属性是关联条件的字段

  - 步骤一：查询部门信息

  ```java
  Department selectByDeptIdStepOne(@Param("deptId") Integer deptId);
  ```

  ```xml
  <resultMap id="selectByDeptIdStepOne" type="department">
      <id column="dept_id" property="deptId"/>
      <result column="dept_name" property="deptName"/>
      <collection property="emps"
                  select="com.botuer.mapper.EmployeeMapper.selectByDeptIdStepTwo"
                  column="dept_id"></collection>
  </resultMap>
  
  <select id="selectByDeptIdStepOne" resultMap="selectByDeptIdStepOne">
      select * from dept where dept_id = #{deptId}
  </select>
  ```

  -  步骤二：根据部门id查询员工信息

  ```java
  List<Employee> selectByDeptIdStepTwo(@Param("deptId") Integer deptId);
  ```

  ```xml
  <resultMap id="selectByDeptIdStepTwo" type="employee">
      <id column="emp_id" property="empId"/>
      <result column="emp_id" property="empId"/>
      <result column="emp_name" property="empName"/>
      <result column="age" property="age"/>
      <result column="dept_id" property="deptId"/>
  </resultMap>
  
  <select id="selectByDeptIdStepTwo" resultMap="selectByDeptIdStepTwo">
      select * from emp where dept_id = #{deptId}
  </select>
  ```

  ```java
  Department department = departmentMapper.selectByDeptIdStepOne(2);
  ```

**5.4 延迟加载**

​		核心配置文件中`<settings`>标签中`<setting>`子标签的name属性的值为lazyLoadingEnabled表示延迟加载，开启延迟加载后，sql查询时只加载需要的属性，value为true则开启延迟加载，此设置可以根据需要，在各个配置文件中自定义映射的`<association>`,`<collection>`标签的fetchType属性进行设置，lazy为延迟加载，eager为立即加载，设置的前提是lazyLoadingEnabled为true，否则都是立即加载

## 3. 应用场景

- 通用步骤

  - 条件表达式

  - 连接方式

  - 编写接口方法

    - 判断有无参数

    - 判断返回结果类型

  - 在映射配置文件中编写SQL语句

  - 编写测试方法并执行

### 1. 多条件查询

- 条件表达式需要用到 `模糊查询` 

  - 模糊查询需要用到%，有三种实现方式
  - ` 不推荐` 方式一：'%${mohu}%'（存在sql注入）
  - 方式二：concat('%',#{mohu},'%')
  - ` 最常用` 方式三："%"#{mohu}"%"

- 连接方式用 `AND`，考虑 `动态性 `

  - 实际应用中，每个参数都可能不填，因此需要解决sql语句中不填写内容和开头就and的情况

  - 解决参数为null，但仍需有返回，需要`<if test = "形参 != null and 形参 != '' ">` `</if>`

  - 解决where开始就and，方式一：加恒等式 1 = 1

  - 解决where开始就and，方式二：需要`<where>``</where>`，`<where>`标签只能去行首and或者or，不能去行尾的

    ```java
    List<Brand> selectByBrandNameAndCompanyName(@Param("brandName")String brandName,@Param("companyName")String companyName);
    ```

    ```xml
    <select id="selectByBrandNameAndCompanyName" resultMap="brandResultMap">
            select *
            from tb_brand
            <where>
                <if test="brandName != null and brandName != '' ">
                    brand_name like "%"#{brandName}"%";
                </if>
                <if test="companyName != null and companyName != '' ">
                    and company_name like "%"#{companyName}"%";
                </if>
            </where>
        </select>
    ```

    ```java
    List<Brand> brands = brandMapper.selectByBrandNameAndCompanyName("三只", null);
    ```

  - 解决where开始就and：方式三：需要`<trim>``</trim>`，四个属性（prefix、suffix 行首或行尾添加，prefixOverrides、suffixOverrides 行首或行尾去除）

    ```xml
    <select id="selectByBrandNameAndCompanyName" resultMap="brandResultMap">
        select *
        from tb_brand
        <trim prefix = "where" prefixOverrides = "and" suffixOverrides = "or">
            <if test="brandName != null and brandName != '' ">
                brand_name like "%"#{brandName}"%" or;
            </if>
            <if test="companyName != null and companyName != '' ">
                and company_name like "%"#{companyName}"%";
            </if>
        </trim>
    </select>
    ```

    

### 2. 单条件查询

- `<if>`标签没有if else的功能，在单选控件中使用很不方便

- `<choos><when><otherewise>,<when>`中有属性`test` 填写条件

  ```java
  List<Brand> selectByBrandNameAndCompanyNameAndDescription(@Param("brandName")String brandName,@Param("companyName")String companyName,@Param("description")String description);
  ```

  ```xml
  <select id="selectByBrandNameAndCompanyNameAndDescription" resultMap="Map">
      select *
      from tb_brand
      <where>
          <choose>
              <when test="brandName != null and brandName != ''">
                  brand_name = #{brandName}
              </when>
              <when test="companyName != null and companyName != ''">
                  company_name = "%"#{companyName}"%"
              </when>
              <when test="description != null and description != ''">
                  description = "%"#{description}"%"
              </when>
          </choose>
      </where>;
  </select>
  ```

  ```java
  List<Brand> brands = brandMapper.selectByBrandNameAndCompanyNameAndDescription("三只松鼠", "三只", "");
  ```

### 3. 添加数据并获取主键

- 添加数据：见基础操作--获取参数值--手动创建实体类

- 添加主键返回

  - 在 insert 标签上添加如下属性：

    - useGeneratedKeys：获取自动增长的主键值。true表示获取

    - keyProperty  ：指定将获取到的主键值封装到哪个属性里

    ```java
    int insertBrand2( Brand brand);
    ```

    ```xml
    <insert id="insertBrand2" useGeneratedKeys="true" keyProperty="id">
        insert into tb_brand (id, brand_name, company_name, ordered, description)
        values (#{id},#{brandName},#{companyName},#{ordered},#{description});
    </insert>
    ```

    ```java
    Brand brand = new Brand(null,"哇哈哈","娃哈哈集团",5,"niubi",null);
    brandMapper.insertBrand2(brand);
    System.out.println(brand);
    ```

### 4. 修改数据（动态）

- 实际应用中，很多不要的更新的未被修改，set语句中为设置的反应到数据库中就变成了null

- 这就需要`<set>``</set>`，这样，未被修改的字段值还是原来的

  ```java
  void update(Brand brand);
  ```

  ```xml
  <update id="update">
      update tb_brand
      <set>
          <if test="brandName != null and brandName != ''">
              brand_name = #{brandName},
          </if>
          <if test="companyName != null and companyName != ''">
              company_name = #{companyName},
          </if>
          <if test="ordered != null">
              ordered = #{ordered},
          </if>
          <if test="description != null and description != ''">
              description = #{description},
          </if>
          <if test="status != null">
              status = #{status}
          </if>
      </set>
      where id = #{id};
  </update>
  ```

  ```java
  brandMapper.update(brand);
  ```

### 5. 批量删除

- 批量删除的关键在个数是不固定的，删除几个，删除什么，是变化的

- 因此，删除操作执行前，首先要知道哪些数据需要删除，也就是要直到数据的唯一标识，一般为主键

- 把主键存放在一个数组或集合中，通过循环的方式实现批量删除，就需要用到`<foreach>`标签，含5个属性

  - collection：需要循环的数组或集合
    - 传入数组如果不用@Param注解给参数命名，那么默认为array，换句话说，不用注解，collection只能等于array
    - 传入集合必须用@Param注解
  - item：循环的元素，一般为主键或实体类对象
    - 如果表示实体类对象，那循环的#{}中的属性，必须指明对象的属性，如#{brand.brandName}
  - separator：每个元素的分隔符（连接符）   separator=","   separator="or"
  - open：拼接内容开始符   open="("
  - close：拼接内容结束符   close=")"

- 目的是拼接后的效果要符合sql语法

  例一：形如	delete from tb_brand where id in (1,2,3);

  - 方式一：用`<foreach>`标签

  ```java
  void deleteByIds1(int[] ids);
  ```

  ```xml
  <delete id="deleteByIds1">
      delete from tb_brand where id
      in
      <foreach collection="ids" item="id" separator="," open="(" close=")">
          #{id}
      </foreach>
  </delete>
  ```

  ```java
  int[] ids = {5,7,8};
  brandMapper.deleteByIds1(ids);
  ```

  - ` 不推荐` 方式二：用${}拼串

  ```java
  void deleteMoreBatch(@Param("ids") String ids);
  ```

  ```xml
  <delete id="deleteMoreBatch">
      delete
      from tb_brand
      where id in ${ids};
  </delete>
  ```

  ```java
  brandMapper.deleteMoreBatch("(5,7,9)");
  ```

  例二：形如	delete from tb_brand where id = 3 or id = 5;

  ```java
  void deleteByIds2(int[] ids);
  ```

  ```xml
  <delete id="deleteByIds2">
      delete from tb_brand where id
      <foreach collection="ids" item="id" separator="or">
          #{id}
      </foreach>
  </delete>
  ```

  ```java
  int[] ids = {3,5};
  brandMapper.deleteByIds2(ids);
  ```

### 6.批量添加与修改

- `<foreach>`还可用于批量添加，批量修改，只不过要把进行循环的元素（实体类对象）封装为List<>集合

- collection传入集合必须用@Param注解

- item：循环的元素，如果表示实体类对象，那循环的#{}中的属性，必须指明对象的属性，如#{brand.brandName}

  ```java
  int insertMoreBatch(@Param("brands") List<Brand> brands);
  ```

  ```xml
  <insert id="insertMoreBatch">
     insert into tb_brand
     values
        <foreach collection="brands" item="brand" separator=",">
            (null,#{brand.brandName},#{brand.companyName},#{brand.ordered},#{brand.description},null)
        </foreach>
  </insert>
  ```

  ```java
  Brand brand1 = new Brand(null,"1","",5,"",null);
  Brand brand2 = new Brand(null,"2","",6,"",null);
  Brand brand3 = new Brand(null,"3","",7,"",null);
  List<Brand> brands = Arrays.asList(brand1, brand2, brand3);
  brandMapper.insertMoreBatch(brands);
  ```


### 7.动态设置表名

- 实际应用中，为了方便，我们经常会把一张表分为几张分表，查询某个分表的数据

- 表名不能含单引号，故只能使用${表名}

  ```java
  List<Brand> getAllBrand(@Param("tableName") String tableName);
  ```

  ```xml
  <select id="getAllUser" resultType="User">
  	select * from ${tableName}
  </select>
  ```

  ```java
  List<Brand> brands = brandMapper.getAllBrand("tb_brand");
  ```

## 4.注解实现CRUD

使用注解开发会比配置文件开发更加方便。如下就是使用注解进行开发

```java
@Select(value = "select * from tb_user where id = #{id}")
public User select(int id);
```

> ==注意：==
>
> * 注解是用来替换映射配置文件方式配置的，所以使用了注解，就不需要再映射配置文件中书写对应的 `statement`

* 查询 ：@Select
* 添加 ：@Insert
* 修改 ：@Update
* 删除 ：@Delete

`<u>`**注解完成简单功能，配置文件完成复杂功能，提高代码可读性**`</u>`

## 5.缓存

### MyBatis的一级缓存

一级缓存是SqlSession级别的，通过同一个SqlSession查询的数据会被缓存，下次查询相同的数据，就
会从缓存中直接获取，不会从数据库重新访问

【失效的四种情况】SqlSession不同；查询条件不同；进行了增删改操作；手动清空（调用clearCache方法）

### MyBatis的二级缓存

二级缓存是SqlSessionFactory级别，通过同一个SqlSessionFactory创建的SqlSession查询的结果会被
缓存；此后若再次执行相同的查询语句，结果就会从缓存中获取

【开启条件】

1.核心配置文件中进行全局设置

```xml
<setting name="cacheEnabled" value="true"/>
```

2.在映射配置文件中设置标签`<cache />`，默认值为LRU，详情见【标签及属性】

3.SqlSession关闭或提交（调用close、 commit方法）

4.实体类必须实现序列化接口

```java
public class Brand implements Serializable {}
```

【失效条件】进行了增删改操作（一二级同时实效）

【缓存查询顺序】二级 ----> 一级 ----> 数据库

### 第三方缓存EHCache

虽然MyBatis自带二级缓存，但有更专业的第三方二级缓存

- 添加依赖

  ```xml
  <!-- Mybatis EHCache整合包 -->
  <dependency>
      <groupId>org.mybatis.caches</groupId>
      <artifactId>mybatis-ehcache</artifactId>
      <version>1.2.1</version>
  </dependency>
  <!-- slf4j日志门面的一个具体实现 -->
  <dependency>
      <groupId>ch.qos.logback</groupId>
      <artifactId>logback-classic</artifactId>
      <version>1.2.3</version>
  </dependency>
  ```

  

- 各个jar包功能

  | jar包名称       | 作用                            |
  | --------------- | ------------------------------- |
  | mybatis-ehcache | Mybatis和EHCache的整合包        |
  | ehcache         | EHCache核心包                   |
  | slf4j-api       | SLF4J日志门面包                 |
  | logback-classic | 支持SLF4J门面接口的一个具体实现 |

  

- 创建EHCache配置文件【ehcache.xml】

  ```xml
  <?xml version="1.0" encoding="utf-8" ?>
  <ehcache xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  		xsi:noNamespaceSchemaLocation="../config/ehcache.xsd">
      <!-- 磁盘保存路径 -->
      <diskStore path="D:\atguigu\ehcache"/>
      
      <defaultCache>
          <!--必填-->          
          <!--在内存中缓存的element的最大数目-->
          maxElementsInMemory="1000"
      	<!--在磁盘上缓存的element的最大数目，若是0表示无穷大-->
          maxElementsOnDisk="10000000"
      	<!--设定缓存的elements是否永远不过期。 如果为true，则缓存的数据始终有效， 如果为false那么还要根据timeToIdleSeconds、timeToLiveSeconds判断-->
          eternal="false"
          <!--设定当内存缓存溢出的时候是否将过期的element缓存到磁盘上-->
          overflowToDisk="true"
          
          <!--可选-->
          <!--当缓存在EhCache中的数据前后两次访问的时间超过timeToIdleSeconds的属性取值时， 这些数据便会删除，默认值是0,也就是可闲置时间无穷大-->
          timeToIdleSeconds="120"
          <!--缓存element的有效生命期，默认是0.,也就是element存活时间无穷大-->
          timeToLiveSeconds="120"
          <!--DiskStore(磁盘缓存)的缓存区大小。默认是30MB。每个Cache都应该有自己的一个缓冲区-->
          diskSpoolBufferSizeMB = "50"
          <!--在VM重启的时候是否启用磁盘保存EhCache中的数据，默认是false-->
          diskPersistent = "false"
          <!--磁盘缓存的清理线程运行间隔，默认是120秒。每个120s， 相应的线程会进行一次EhCache中数据的清理工作-->
          diskExpiryThreadIntervalSeconds="120"
          <!--当内存缓存达到最大，有新的element加入的时候， 移除缓存中element的策略。 默认是LRU（最近最少使用），可选的有LFU（最不常使用）和FIFO（先进先出）-->
          memoryStoreEvictionPolicy="LRU">
      </defaultCache>
  </ehcache>
  ```

  

- 设置二级缓存类型【Mapper.xml】

  ```xml
  <cache type="org.mybatis.caches.ehcache.EhcacheCache"/>
  ```

  

- 加入logback日志【logback.xml】

  存在SLF4J时，作为简易日志的log4j将失效，此时我们需要借助SLF4J的具体实现logback来打印日志。
  创建logback的配置文件logback.xml（换句话说，可以用log4j  或  SLF4J + logback）

  

## 6. MyBatis逆向工程

正向工程：先创建Java实体类，由框架负责根据实体类生成数据库表。Hibernate是支持正向工程的。
逆向工程：先创建数据库表，由框架负责根据数据库表，反向生成如下资源：

- Java实体类
- Mapper接口
- Mapper映射文件

### 14.1创建逆向工程

- 添加依赖和插件

  ```xml
  <!-- 依赖MyBatis核心包 -->
  <dependencies>
      <dependency>
          <groupId>org.mybatis</groupId>
          <artifactId>mybatis</artifactId>
          <version>3.5.7</version>
      </dependency>
      <!-- MySQL驱动 -->
      <dependency>
          <groupId>mysql</groupId>
          <artifactId>mysql-connector-java</artifactId>
          <version>8.0.28</version>
      </dependency>
  </dependencies>
  
  <!-- 控制Maven在构建过程中相关配置 -->
  <build>
      <!-- 构建过程中用到的插件 -->
      <plugins>
          <!-- 具体插件，逆向工程的操作是以构建过程中插件形式出现的 -->
          <plugin>
              <groupId>org.mybatis.generator</groupId>
              <artifactId>mybatis-generator-maven-plugin</artifactId>
              <version>1.3.0</version>
              
              <!-- 插件的依赖 -->
              <dependencies>
                  <!-- 逆向工程的核心依赖 -->
                  <dependency>
                      <groupId>org.mybatis.generator</groupId>
                      <artifactId>mybatis-generator-core</artifactId>
                      <version>1.3.7</version>
                  </dependency>
                  <!-- 数据库连接池 -->
                  <dependency>
                      <groupId>com.mchange</groupId>
                      <artifactId>c3p0</artifactId>
                      <version>0.9.2</version>
                  </dependency>
              </dependencies>
          </plugin>
      </plugins>
  </build>
  ```

  

- 创建MyBatis核心配置文件【mybatis-config.xml】

- 创建逆向工程配置文件【generatorConfig.xml】

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE generatorConfiguration
          PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
          "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">
  <generatorConfiguration>
      <!--
      targetRuntime: 执行生成的逆向工程的版本
      MyBatis3Simple: 生成基本的CRUD（清新简洁版）
      MyBatis3: 生成带条件的CRUD（奢华尊享版）
      -->
      <context id="DB2Tables" targetRuntime="MyBatis3">
          <!-- 数据库的连接信息 -->
          <jdbcConnection driverClass="com.mysql.cj.jdbc.Driver"
                          connectionURL="jdbc:mysql://localhost:3306/atguigudb?characterEncoding=utf8&amp;useSSL=false&amp;serverTimezone=UTC&amp;rewriteBatchedStatements=true"
                          userId="root"
                          password="abc123">
          </jdbcConnection>
          <!-- javaBean的生成策略-->
          <javaModelGenerator targetPackage="com.botuer.pojo"
                              targetProject=".\src\main\java">
              <property name="enableSubPackages" value="true" />
              <property name="trimStrings" value="true" />
          </javaModelGenerator>
          <!-- SQL映射文件的生成策略 -->
          <sqlMapGenerator targetPackage="com.botuer.mapper"
                           targetProject=".\src\main\resources">
              <property name="enableSubPackages" value="true" />
          </sqlMapGenerator>
          <!-- Mapper接口的生成策略 -->
          <javaClientGenerator type="XMLMAPPER"
                               targetPackage="com.botuer.mapper" targetProject=".\src\main\java">
              <property name="enableSubPackages" value="true" />
          </javaClientGenerator>
          <!-- 逆向分析的表 -->
          <!-- tableName设置为*号，可以对应所有表，此时不写domainObjectName -->
          <!-- domainObjectName属性指定生成出来的实体类的类名 -->
          <table tableName="employees" domainObjectName="Employee"/>
          <table tableName="departments" domainObjectName="Department"/>
      </context>
  </generatorConfiguration>
  ```

  

- 执行MBG插件的generate目标

  ![image-20220513135122560](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220513135122560.png)

  **【注意】：需要手动生成构造器和toString**

### 14.2 使用逆向工程：QBC查询

- 逆向工程创建的实体类包含两种：含Example的实体类里含满足各种复杂条件的方法

- QBC 查询(Query By Criteria”通过条件查询“)

- 不含ByExample的方法，通过接口实例直接调用

- 含有ByExample的方法，需要创建$$$Example的实例，通过QBC方式调用$$$Example实例的方法

  - 创建$$$Example的实例
  - 调用$$$Example实例的QBC方法createCriteria()”创建条件“，返回值为Criteria类型，调用（一个或多个）add***方法
  - 如果需要or连接，调用$$$Example实例的or()方法，返回值为Criteria类型，接着调用（一个或多个）add***方法

  ```java
  @Test
  public void testMBG() throws IOException {
      InputStream inputStream = Resources.getResourceAsStream("mybatis-config.xml");
      SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
      SqlSession sqlSession = sqlSessionFactory.openSession();
      EmployeeMapper employeeMapper = sqlSession.getMapper(EmployeeMapper.class);
  
      EmployeeExample employeeExample = new EmployeeExample();
      employeeExample.createCriteria().andDepartmentIdIsNotNull().andSalaryBetween(6000.0,8000.0);
      employeeExample.or().andSalaryBetween(20000.0,30000.0);
      List<Employee> employees = employeeMapper.selectByExample(employeeExample);
      employees.forEach(System.out::println);
  }
  ```

- （添加/修改）含有Selective的方法，只更新非空的内容，空值不更新



## 7.分页插件

### 1 添加插件步骤

- 添加依赖

  ```xml
  <!-- https://mvnrepository.com/artifact/com.github.pagehelper/pagehelper -->
  <dependency>
      <groupId>com.github.pagehelper</groupId>
      <artifactId>pagehelper</artifactId>
      <version>5.2.0</version>
  </dependency>
  ```

- 配置分页插件【mybatis-config.xml】

  ```xml
  <plugins>
      <!--设置分页插件-->
      <plugin interceptor="com.github.pagehelper.PageInterceptor"></plugin>
  </plugins>
  ```

### 2 使用插件方法（两步）

- 在查询功能之前使用PageHelper.startPage(int pageNum, int pageSize)开启分页功能
  - pageNum第几页
  - pageSize每页几条数据

- 在查询获取list集合之后，使用PageInfo`<T>` pageInfo = new PageInfo<>(List`<T>` list, intnavigatePages)获取分页相关数据
  - list要分页的数据
  - intnavigatePages，导航分页页码数（一般为奇数，当前页在中间）

```java
//开启分页功能
Page<Object> page = PageHelper.startPage(2, 3);
//QBC查询
EmployeeExample employeeExample = new EmployeeExample();
employeeExample.createCriteria().andDepartmentIdIsNotNull().andSalaryBetween(6000.0,8000.0);
employeeExample.or().andSalaryBetween(20000.0,30000.0);
List<Employee> employees = employeeMapper.selectByExample(employeeExample);
//获取页面信息
PageInfo<Employee> employeePageInfo = new PageInfo<>(employees, 5);
//输出该页数据和页面信息
System.out.println(employeePageInfo);
employees.forEach(System.out::println);
```

- 分页相关数据

  > PageInfo{
  > pageNum=8, pageSize=4, size=2, startRow=29, endRow=30, total=30, pages=8,
  >
  > list=Page{count=true, pageNum=8, pageSize=4, startRow=28, endRow=32, total=30,
  > pages=8, reasonable=false, pageSizeZero=false},
  >
  > prePage=7, nextPage=0, isFirstPage=false, isLastPage=true, hasPreviousPage=true,
  > hasNextPage=false, navigatePages=5, navigateFirstPage4, navigateLastPage8,
  > navigatepageNums=[4, 5, 6, 7, 8]
  > }

  - pageNum：当前页的页码
  - pageSize：每页显示的条数
  - size：当前页显示的真实条数
  - total：总记录数
  - pages：总页数
  - prePage：上一页的页码
  - nextPage：下一页的页码
  - isFirstPage/isLastPage：是否为第一页/最后一页
  - hasPreviousPage/hasNextPage：是否存在上一页/下一页
  - navigatePages：导航分页的页码数
  - navigatepageNums：导航分页的页码，[1,2,3,4,5]

## 8.标签及属性

### 		1 【mybatis-config.xml】

- - `<properties>`"属性"	匹配jdbc.properties方便数据库连接	resource属性来赋值

    ```xml
    <properties resource="jdbc.properties"></properties> 
    ```

  - `<settings>`"设置"		进行全局配置

    - `<setting>` 有name和value属性
      - name可为mapUnderscoreToCamelCase”下划线转驼峰“、lazyLoadingEnabled”延迟加载“、cacheEnabled“开启二级缓存”
      - value是布尔型									

  - `<typeAliases>`"类型别名"    给实体类起别名，设置后不必再用全类名

    - `<package>`有name属性，填写实体类所在的包名

  - `<plugins>`

    - `<plugin>`
      - interceptor"拦截器"  填写插件全类名  分页插件，通过拦截数据进行分页，改变原页面信息，达到分页效果

  - `<environments>`"环境"    设置数据库连接，default属性设置默认连接

    - `<environment>`设置每个连接，id属性是唯一标识
      - `<transactionManager>`"事务管理器"
        - type属性可设置为JDBC（手动事务管理）、MANAGED（事务被管理，如Spring中的AOP）
      - `<dataSource>`"数据源"，type属性可设置为POOLED（使用连接池），UNPOOLED，JNDI
        - `<property>`"属性"
          - name填写driver、url、username、password
          - value填写"${jdbc.driver}"...（注意，避免重复命名读取不到，jdbc.properties中键尽量详细）
    - `<mappers>`"映射"
      - `<package>`有name属性，填写映射接口所在的包名



### 		2 【Mapper.xml】

- - `<mapper>`"映射"	namespace”命名空间“填写映射接口全类名，可以使statement语句的唯一标识更具体

  - `<sql>`"sql片段"  id是唯一标识

  - `<cache />`"二级缓存"

    - tpye 设置缓存类型，默认是MyBatis自带的，可设置为第三方的

    - eviction“回收”属性可填写LRU“最近最少使用的”、FIFO“先进先出”、FOFT“软引用--移除基于垃圾回收器状态和软引用规则的对象”、WEAK“弱引用--更积极地移除基于垃圾收集器状态和弱引用规则的对象“
    - flushInterval”刷新间隔“，时间为毫秒
    - size  引用数目（正整数）--代表缓存最多可以存储多少个对象，太大容易导致内存溢出
    - readOnly”只读“  值为true时只读，值为false时读写--返回缓存对象的拷贝（通过序列化）。这会慢一些，但是安全，因此默认是false。

  - `<resultMap>`"映射结果"， 自定义映射，id是唯一标识，type是返回类型

    - `<id>` property属性和column属性 填写主键的 属性名和字段名

    - `<result>`property属性和column属性 填写其他的 属性名和字段名

    - `<association>`"关联" 用于多对一的多表查询 
      - property填写”多“的属性
      - javaType填写”少”的类名
      
      - `<id>`、`<result>`
      - select填写第二步查询语句的唯一标识“namespace+id”或“对应接口的对应方法全路径”
      - column填写关联条件的字段
      
    - `<collection>`"集合" 用于一对多的多表查询
      - property
      - ofType填写“多”的类名
      - `<id>`、`<result>`
      - select、column
    
  - ·`<select>`"查询"

    - id唯一标识，要与接口方法一致

    - resultType 结果类型

    - resultMap填写自定义映射的id

  - `<insert>`"添加"

    - id
    - useGeneratedKeys“使用生成的键”  填写true表示使用主键
    - keyProperty“键属性” 填写把主键的值赋给哪个属性，一般是主键字段对应的属性
  
  - `<delete>`、`<update>`

    ---------------------------------------------------------------------------------------------------------------------------------------

  - ------------------------以下为查询或其他方法中用到的标签--------------------------

  - `<include>`"包含" refid填写sql片段的id

  - `<if>` test填写条件

  - `<where>`

  - `<trim>`

    - prefix、suffix  在行首、行尾 添加
    - prefixOverrides、suffixOverrides  在行首、行尾 去除
  
  - `<choose>`

    - `<when>` test填写条件
    - `<otherwise>`
  
  - `<foreach>`

    - collection 填写数组、集合名
    - item“项”  填写元素名
    - separator “分隔符”  填写连接字符
    - open  填写循环内开始符
    - close  填写循环内结束符

## Mybatis 拦截器

### Mybatis的核心对象

| 对象             | 作用                                                  |
| ---------------- | ----------------------------------------------------- |
| SqlSession       | 顶层api，和数据库交互的会话                           |
| Executor         | 执行器，生成语句，维护缓存                            |
| StatementHandler | 封装了JDBC Statement操作，负责对JDBC statement 的操作 |
| ParameterHandler | 参数处理，将用户传递的参数转为Statement需要的参数     |
| ResultSetHandler | 处理结果集，将结果集转为集合                          |
| TypeHandler      | 处理java与sql数据类型的映射转换                       |
| MappedStatement  | 维护mapper.xml文件节点的封装                          |
| SqlSource        | 根据参数对象生成sql，封装到BoundSql中                 |
| BoundSql         | 动态sql和参数                                         |
| Configuration    | 配置信息                                              |



### 两个注解

`@Intercepts`注解

属性是一个`@Signature[]`数组，而`@Signature`有3个属性

- type --- 拦截的目标对象类型，只能拦截Executor、ParameterHandler、StatementHandler、ResultSetHandler四个对象里面的方法
- method --- 拦截的方法
- args --- 方法对应的参数类型

**两个注解**

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
public @interface Intercepts {
    Signature[] value();
}

@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({})
public @interface Signature {
    Class<?> type();
    String method();
    Class<?>[] args();
}
```

### 四个对象

**Executor**

```java
public interface Executor {
    ResultHandler NO_RESULT_HANDLER = null;

    // 增删改
    int update(MappedStatement var1, Object var2) throws SQLException;
    // 先查缓存
    <E> List<E> query(MappedStatement var1, Object var2, RowBounds var3, ResultHandler var4, CacheKey var5, BoundSql var6) throws SQLException;
    // 查询
    <E> List<E> query(MappedStatement var1, Object var2, RowBounds var3, ResultHandler var4) throws SQLException;
    // 查询结果封装为 Cursor
    <E> Cursor<E> queryCursor(MappedStatement var1, Object var2, RowBounds var3) throws SQLException;
    List<BatchResult> flushStatements() throws SQLException;
    void commit(boolean var1) throws SQLException;
    void rollback(boolean var1) throws SQLException;
    CacheKey createCacheKey(MappedStatement var1, Object var2, RowBounds var3, BoundSql var4);
    boolean isCached(MappedStatement var1, CacheKey var2);
    void clearLocalCache();
    void deferLoad(MappedStatement var1, MetaObject var2, String var3, CacheKey var4, Class<?> var5);
    Transaction getTransaction();
    void close(boolean var1);
    boolean isClosed();
    void setExecutorWrapper(Executor var1);
}
```

**StatementHandler**

```java
public interface StatementHandler {

    // 从连接中获取一个Statement
    Statement prepare(Connection var1, Integer var2) throws SQLException;
    // 设置statement执行里所需的参数
    void parameterize(Statement var1) throws SQLException;
    // 批量
    void batch(Statement var1) throws SQLException;
    // 增删改
    int update(Statement var1) throws SQLException;
    // 查
    <E> List<E> query(Statement var1, ResultHandler var2) throws SQLException;
    <E> Cursor<E> queryCursor(Statement var1) throws SQLException;
    BoundSql getBoundSql();
    ParameterHandler getParameterHandler();
}
```

**ParameterHandler**

```java
public interface ParameterHandler {
    
    // 获取参数
    Object getParameterObject();
	// 设置参数
    void setParameters(PreparedStatement var1) throws SQLException;
}
```

**ResultSetHandler**

```java
public interface ResultSetHandler {
    // 将Statement执行后产生的结果集（可能有多个结果集）映射为结果列表
    <E> List<E> handleResultSets(Statement var1) throws SQLException;
    <E> Cursor<E> handleCursorResultSets(Statement var1) throws SQLException;
	// 处理存储过程执行后的输出参数
    void handleOutputParameters(CallableStatement var1) throws SQLException;
}
```

### 使用步骤

1. 定义拦截器，实现`org.apache.ibatis.plugin.Interceptor`，注册为组件`@Component`
2. 实现 `Object intercept(Invocation var1) throws Throwable` 方法
3. 配置到Spring管理 --- 配置类 或 配置文件



### 模糊查询转义

这里有两个问题

- mybatis-plus只能精确处理全模糊，左模糊、右模糊可能会出现按全模糊的情况处理
- mybatis-plus拦截带缓存的query方法时，会再转义回去，导致转义失效

```java
package com.jd.diagnosis.interceptor;

import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.ibatis.cache.CacheKey;
import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.*;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.plugin.Intercepts;
import org.apache.ibatis.plugin.Invocation;
import org.apache.ibatis.plugin.Signature;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Intercepts(
        value = {
                @Signature(type = Executor.class, method = "query", args = {MappedStatement.class,
                        Object.class, RowBounds.class, ResultHandler.class})
        }
)
@Component
@Slf4j
public class MybatisLikeQueryInterceptor implements Interceptor {

    // 转义
    private static final String ESCAPE_SYMBOL = "\\";

    // like 匹配的正则
    @Value("${mybatis.escape.regex.like:like\\s}")
    private String REGEX_LIKE;

    // 可从配置文件中获取,没有的话取【 默认值  \ _ % 】
    @Value("#{'${mybatis.escape.symbols:\\,_,%}'.split(',')}")
    private String[] symbols;

    // 开关 【 默认 开】
    @Value("${mybatis.escape.enabled:true}")
    private boolean enableEscape;


    @Override
    public Object intercept(Invocation invocation) throws Throwable {

        // 开关
        if (!enableEscape) {
            return invocation.proceed();
        }
        // 获取 拦截的方法的参数列表，此处只拦截了 query 方法
        Object[] args = invocation.getArgs();
        // 第一个参数 MappedStatement 封装了mapper.xml 配置和 sql语句
        MappedStatement ms = (MappedStatement) args[0];
        // 第二个参数 封装了 参数列表
        Object parameter = args[1];
        // 第三个参数 分页相关配置
        RowBounds rowBounds = (RowBounds) args[2];
        // 第四个参数 用于结果处理
        ResultHandler resultHandler = (ResultHandler) args[3];
        // 这里拦截的目标是执行器
        Executor executor = (Executor) invocation.getTarget();
        // 第五个参数，如果开启了缓存就有
        CacheKey cacheKey;
        // 第六个参数 动态sql 开启缓存才有
        BoundSql boundSql;


        //由于逻辑关系，只会进入一次
        if (args.length == 4) {
            //4 个参数时
            boundSql = ms.getBoundSql(parameter);
            cacheKey = executor.createCacheKey(ms, parameter, rowBounds, boundSql);
        } else {
            //6 个参数时
            cacheKey = (CacheKey) args[4];
            boundSql = (BoundSql) args[5];
        }

        // sql类型  UNKNOWN,INSERT,UPDATE,DELETE,SELECT,FLUSH;
        SqlCommandType sqlCommandType = ms.getSqlCommandType();
        // StatementType
        //      1、STATEMENT：直接操作sql，不进行预编译，获取数据：$ >> Statement
        //      2、PREPARED：预处理，参数，进行预编译，获取数据：# >> PreparedStatement（默认）
        //      3、CALLABLE：执行存储过程————CallableStatement
        StatementType statementType = ms.getStatementType();
        // 这里只处理 预编译的【查询】语句
        if (sqlCommandType == SqlCommandType.SELECT
                && statementType == StatementType.PREPARED) {
            // 匹配模糊查询 并 转义
            escapeParameterIfContainingLike(boundSql, invocation);
            // 执行更改后的SQL
            return executor.query(ms, parameter, rowBounds, resultHandler, cacheKey, boundSql);
        }
        return invocation.proceed();
    }

    private void escapeParameterIfContainingLike(BoundSql boundSql, Invocation invocation) {
        if (boundSql == null) {
            return;
        }

        // 获取动态sql
        String prepareSql = boundSql.getSql();

        // 找到 like 后面的参数 所在的索引位置
        List<Integer> position = findLikeParam(prepareSql);

        if (position == null || position.size() == 0) {
            return;
        }
        log.info("#### position ={}", position);

        // parameterMappings 中有 映射的字段名，且有序
        List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
        log.info("### parameterMappings = {}", parameterMappings);

        Map<String, Object> map;
        if (invocation.getArgs()[1] instanceof Map) {
            // 参数转为map方便获取 --- 有字段名 也有字段值
            map = (Map) invocation.getArgs()[1];
            // 这里注释掉是因为一些情况下json序列化有问题，会报错
   //         log.info("### map = {}", JSON.toJSONString(map));

            // 把原有的参数先设置到动态sql的参数中，再设置需要修改的参数
            map.forEach(boundSql::setAdditionalParameter);
            position.forEach((p) -> {
                ParameterMapping pm = parameterMappings.get(p);
                // 参数名
                String property = pm.getProperty();
                // 参数值
                String oldValue, newValue;

                // mybatis-plus 的 QueryWrapper 方式 与原生的 Mybatis 拿到的参数不同，分别处理（Mybatis-plus只能处理like，左右模糊目前无法处理）
                if (map.containsKey("ew")) {
                    // mybatis-plus 的 QueryWrapper
                    if (map.get("ew") instanceof LambdaQueryWrapper) {
                        LambdaQueryWrapper wrapper = (LambdaQueryWrapper) map.get("ew");
                        oldValue = wrapper.getParamNameValuePairs().get(property.replaceFirst("ew.paramNameValuePairs.", "")).toString();
                    } else if (map.get("ew") instanceof QueryWrapper) {
                        QueryWrapper wrapper = (QueryWrapper) map.get("ew");
                        oldValue = wrapper.getParamNameValuePairs().get(property.replaceFirst("ew.paramNameValuePairs.", "")).toString();
                    } else {
                        log.error("#### 既不是LambdaQueryWrapper，也不是QueryWrapper");
                        return;
                    }
                    if (oldValue.startsWith("%")) {
                        // 全模糊处理 + 部分左模糊处理（若用户传入xxx%会按全模糊处理---导致查出更多数据）
                        newValue = oldValue.endsWith("%") ? "%" + escapeLike(oldValue.substring(1, oldValue.length() - 1)) + "%" : "%" + escapeLike(oldValue.substring(1));
                    } else {
                        // 部分右模糊处理（若用户传入%xxx会按全模糊处理---导致查出更多数据）
                        newValue = escapeLike(oldValue.substring(0, oldValue.length() - 1)) + "%";
                    }
                    log.info("## oldValue = {}，newValue = {}", oldValue, newValue);
                } else {
                    // 原生的 Mybatis
                    oldValue = (String) map.get(property);
                    newValue = escapeLike(oldValue);
                    log.info("## oldValue = {}，newValue = {}", oldValue, newValue);
                }
                // 设置到动态sql
                boundSql.setAdditionalParameter(property, newValue);

            });
        } else {
            // 处理只有一个入参且没有加@Param注解绑定的情形
            ParameterMapping pm = parameterMappings.get(0);
            // 参数名
            String property = pm.getProperty();
            String oldValue, newValue;
            // 改
            oldValue = invocation.getArgs()[1].toString();
            newValue = escapeLike(oldValue);
            // 设置到动态sql
            boundSql.setAdditionalParameter(property, newValue);
        }

    }

    String escapeLike(String value) {
        if (value != null) {
            for (String symbol : symbols) {
                value = value.replace(symbol, ESCAPE_SYMBOL + symbol);
            }
            return value;
        }
        return null;
    }


    List<Integer> findLikeParam(String prepareSql) {
        // 正则匹配
        Matcher matcher = Pattern.compile(REGEX_LIKE, Pattern.CASE_INSENSITIVE).matcher(prepareSql);

        int pos = 0;

        // 返回索引集合
        List<Integer> indexes = new ArrayList<>();

        while (matcher.find(pos)) {
            int start = matcher.start();
            int index = StringUtils.countMatches(prepareSql.substring(0, start), "?");
            indexes.add(index);
            pos = matcher.end();
        }
        return indexes;
    }
}
```

配置类

```java
@Configuration
public class MyBatisConfig {
    @Bean
    public MybatisMetaInterceptor mybatisInterceptor() {
        return new MybatisMetaInterceptor();
    }
}
```

## mybatis缓存
mybatis和缓存相关的类都在cache包里面，其中有一个Cache接口，且只有一个实现类PerpetualCache，它是用HashMap实现缓存功能的。

```
org.apache.ibatis.cache
	- decorators			(装饰器 --- 主要用于配置二级缓存)
		- BlockingCache		(阻塞缓存 blocking=true开启)
		- FifoCache			(FIFO淘汰策略的缓存 eviction=“FIFO”开启)
		- LoggingCache		(带日志功能的缓存 比如输出缓存命中率)
		- LruCache			(LRU淘汰策略的缓存	eviction=“LRU” （默认）)
		- ScheduledCache	(定时调度的缓存 flushInterval=？)
		- SerializedCache	(支持序列化的缓存)
		- SoftCache			(基于JVM的软引用缓存)
		- SynchronizedCache	(同步缓存 基于Synchronized关键字实现，解决并发问题)
		- TransactionCache	(事务缓存)
		- WeakCache  		(基于JVM的弱引用缓存)
	- impl
		- PerpetualCache	(基本缓存 - Cache的唯一实现类)
    - Cache					(接口)
    - CacheException		(异常处理类)
    - CacheKey				(缓存的key）
    - NullCackeKey			(已弃用）
    - TransactionalCacheManager		(TCM事务管理器--用于二级缓存)
```

除此之外，还有很多的装饰器，通过这些装饰器可以实现很多额外的功能：回收策略、日志记录、定时刷新等等

### 一级缓存

又叫本地缓存，默认开启，无需配置

同一个sqlSession中执行的相同的sql，第一次查会走数据库并写入缓存，第二次直接从一级缓存获取

**作用域**：sqlSession级别

**失效**

- 执行了增删改
- 执行了commit
- 执行了close

**不足**：不同会话的缓存情况不共享，可能导致**脏读**，如会话1更新了数据清除了缓存，但会话2感知不知道，还在以前的缓存中拿数据，这种情况在**分布式**环境中是很严重的问题

**源码分析**

可以看出sqlSession中维护的两个重要属性，如下，Configuration和Executor，Configuration维护的是全局配置，缓存不应该在这里，我们在Executor中找

```java
public class DefaultSqlSession implements SqlSession {

  private final Configuration configuration;
  private final Executor executor;

  private final boolean autoCommit;
  private boolean dirty;
  private List<Cursor<?>> cursorList;
}
```

可以发现在Executor中有一级缓存`PerpetualCache localCache`，如下

```java
public abstract class BaseExecutor implements Executor {

  private static final Log log = LogFactory.getLog(BaseExecutor.class);

  protected Transaction transaction;
  protected Executor wrapper;

  protected ConcurrentLinkedQueue<DeferredLoad> deferredLoads;
  protected PerpetualCache localCache;
  protected PerpetualCache localOutputParameterCache;
  protected Configuration configuration;

  protected int queryStack;
  private boolean closed;
    
  protected BaseExecutor(Configuration configuration, Transaction transaction) {
    this.transaction = transaction;
    this.deferredLoads = new ConcurrentLinkedQueue<>();
    this.localCache = new PerpetualCache("LocalCache");
    this.localOutputParameterCache = new PerpetualCache("LocalOutputParameterCache");
    this.closed = false;
    this.configuration = configuration;
    this.wrapper = this;
  }
}
```

在查询时，先查一级缓存，没有再查数据库，如下

```java
@Override
  public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler) throws SQLException {
    BoundSql boundSql = ms.getBoundSql(parameter);
    // 生成一个缓存的key
    CacheKey key = createCacheKey(ms, parameter, rowBounds, boundSql);
    return query(ms, parameter, rowBounds, resultHandler, key, boundSql);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
    ErrorContext.instance().resource(ms.getResource()).activity("executing a query").object(ms.getId());
    if (closed) {
      throw new ExecutorException("Executor was closed.");
    }
    if (queryStack == 0 && ms.isFlushCacheRequired()) {
      clearLocalCache();
    }
    List<E> list;
    try {
      queryStack++;
      // 先查缓存，再查数据库queryFromDatabase
      list = resultHandler == null ? (List<E>) localCache.getObject(key) : null;
      if (list != null) {
        handleLocallyCachedOutputParameters(ms, key, parameter, boundSql);
      } else {
        list = queryFromDatabase(ms, parameter, rowBounds, resultHandler, key, boundSql);
      }
    } finally {
      queryStack--;
    }
    if (queryStack == 0) {
      for (DeferredLoad deferredLoad : deferredLoads) {
        deferredLoad.load();
      }
      // issue #601
      deferredLoads.clear();
      if (configuration.getLocalCacheScope() == LocalCacheScope.STATEMENT) {
        // issue #482
        clearLocalCache();
      }
    }
    return list;
  }
```

更新操作，一定清空缓存，没有任何条件，如下

```java
  @Override
  public int update(MappedStatement ms, Object parameter) throws SQLException {
    ErrorContext.instance().resource(ms.getResource()).activity("executing an update").object(ms.getId());
    if (closed) {
      throw new ExecutorException("Executor was closed.");
    }
    // 直接清空缓存
    clearLocalCache();
    return doUpdate(ms, parameter);
  }
```



### 二级缓存

**作用域**：sqlSessionFactory级别，即namespace，多个sqlSession共享

开启二级缓存需要pojo实现Serializable接口

每当存取数据的时候，都有检测一下cache的生命时间，默认是1小时，如果这个cache存活了一个小时，那么将整个清空一下

当 Mybatis 调用 Dao 层查询数据库时，先查询二级缓存，二级缓存中无对应数据，再去查询一级缓存，一级缓存中也没有，最后去数据库查找

**使用场景**

- 由于增删改都会刷新二级缓存，导致二级缓存失效，所以适合在查询为主的应用中使用，比如历史交易、历史订单的查询。否则缓存就失去了意义
- 如果多个namespace中有针对于同一个表的操作，比如Blog 表，如果在一个namespace中刷新了缓存，另一个namespace中没有刷新，就会出现读到脏数据的情况。所以，推荐在一个Mapper里面只操作单表的情况使用

**源码解析**

还是思考在哪个对象上维护，要想sqlSession间共享，肯定在sqlSession的外层，BaseExecutor是维护不了的，mybatis维护了一个装饰器 CachingExecutor，也实现了 Executor

先回顾下开启二级缓存的步骤

mybatis-config.xml

```xml
<!-- 控制全局缓存（二级缓存）-->
<setting name="cacheEnabled" value="true"/>
```

mapper.xml

```xml
<!-- 声明这个namespace使用二级缓存 -->
<cache/>

<!--        <cache type="org.apache.ibatis.cache.impl.PerpetualCache"
               size="1024"
               eviction="LRU"
               flushInterval="120000"
               readOnly="false"/>-->
```

```
type		缓存实现类		需要实现Cache接口，默认是PerpetualCache
size		最多缓存对象个数	默认是1024
eviction	回收策略	LRU - 最近最少使用的，FIFO - 先进先出，SOFT - 软引用，WEAK - 弱引用
flushInterval	过期时间	自动刷新时间，单位ms，未配置时只有调用时刷新
readOnly	是否只读	
	- true: 只读缓存；会给所有对象的调用者返回对象的相同实例，因此这些对象不能被修改。这提供了很中要的性能优势
	- false: 读写缓存，会返回缓存对象的copy(通过序列化)，不会共享，性能会慢一些，但是安全，因此默认为false，此				时缓存的对象必须实现序列化接口
blocking	可重入锁实现缓存的并发控制	true: 会使用BlockingCache对Cache进行装饰。默认为false
```

Mapper.xml配置了之后，select()会被缓存，update()、insert()、delete()会刷新缓存。

只要配置了cacheEnabled=true，基本执行器就会被装饰，mapper中有没有配置，决定了在启动的时候会不会创建这个mapper的cache对象，最终会影响到CachingExecutor中query方法中的判断：也就是说，会被装饰，但没走二级缓存

```java
@Override
  public <E> List<E> query(MappedStatement ms, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql)
      throws SQLException {
    // 找xml中的cache配置
    Cache cache = ms.getCache();
    if (cache != null) {
      flushCacheIfRequired(ms);
      if (ms.isUseCache() && resultHandler == null) {
        ensureNoOutParams(ms, boundSql);
        
        // 去二级缓存拿
        @SuppressWarnings("unchecked")
        List<E> list = (List<E>) tcm.getObject(cache, key);
        if (list == null) {
          list = delegate.query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
          tcm.putObject(cache, key, list); // issue #578 and #116
        }
        return list;
      }
    }
    return delegate.query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
  }
```

对于单个实时性要求高的sql关闭二级缓存

```xml
<select id="selectBlog" resultMap="BaseResultMap" useCache="false">
```

跨namespace

cache-ref 代表引用别的命名空间的Cache 配置，两个命名空间的操作使用的是同一个Cache。在关联的表比较少，或者按照业务可以对表进行分组的时候可以使用。
在这种情况下，多个Mapper的操作都会引起缓存刷新，缓存的意义已经不大了。

```java
<cache-ref namespace="com.gupaoedu.crud.dao.DepartmentMapper" /> 
```

只有事务提交后，缓存才生效，二级缓存通过 TransactionalCacheManager（TCM）来管理，

```java
public class CachingExecutor implements Executor {

  private final Executor delegate;
  // 二级缓存通过tcm统一管理
  private final TransactionalCacheManager tcm = new TransactionalCacheManager();

  public CachingExecutor(Executor delegate) {
    this.delegate = delegate;
    delegate.setExecutorWrapper(this);
  }
}
```

最后又调用了TransactionalCache的getObject()、 putObject和commit()方法

TransactionalCache里面又持有了真正的Cache对象，比如是经过层层装饰的PerpetualCache。

在 putObject 的时候，只是添加到了entriesToAddOnCommit 里面，只有它的commit()方法被调用的时候才会调用 flushPendingEntries()真正写入缓存。它就是在DefaultSqlSession调用commit()的时候被调用的

```java
public class TransactionalCacheManager {
	// 真正的缓存
  private final Map<Cache, TransactionalCache> transactionalCaches = new HashMap<>();

  public void clear(Cache cache) {
    getTransactionalCache(cache).clear();
  }

  public Object getObject(Cache cache, CacheKey key) {
    return getTransactionalCache(cache).getObject(key);
  }

  // query中通过tcm调用putObject，实际调用的是TransactionalCache的putObject
  public void putObject(Cache cache, CacheKey key, Object value) {
    getTransactionalCache(cache).putObject(key, value);
  }

  public void commit() {
    for (TransactionalCache txCache : transactionalCaches.values()) {
      txCache.commit();
    }
  }

  public void rollback() {
    for (TransactionalCache txCache : transactionalCaches.values()) {
      txCache.rollback();
    }
  }

  private TransactionalCache getTransactionalCache(Cache cache) {
    return transactionalCaches.computeIfAbsent(cache, TransactionalCache::new);
  }

}
```

在 CachingExecutor 的 update()方法里面会调用 flushCacheIfRequired(ms)，isFlushCacheRequired 就是从标签里面渠道的 flushCache 的值。而增删改操作的flushCache属性默认为true

```java
  @Override
  public int update(MappedStatement ms, Object parameterObject) throws SQLException {
    flushCacheIfRequired(ms);
    return delegate.update(ms, parameterObject);
  }

  private void flushCacheIfRequired(MappedStatement ms) {
    Cache cache = ms.getCache();
    if (cache != null && ms.isFlushCacheRequired()) {
      tcm.clear(cache);
    }
  }
```

### 自定义Redis二级缓存

实现Cache，重写getId、putObject、getObject、removeObject、clear方法即可

```java
public class MyBatisRedisCacheImpl implements Cache {
    private static final Logger log = LoggerFactory.getLogger(MyBatisRedisCacheImpl.class);
    private static final String MY_BATIS_Redis_CACHE = "MyBatisRedisCache";
    private final String id;
    private int cacheSeconds = 600;
    private static RedisCache redisCache;	// 可以直接用RedisTemplate

    public static RedisCache getRedisCache() {
        if (redisCache == null) {
            redisCache = (RedisCache)SpringContextUtil.getBean("cache");
        }

        return redisCache;
    }

    public MyBatisRedisCacheImpl(String id) {
        log.info("####################### MyBatisRedisCacheImpl constructor init id : {}", id);
        this.id = id;
    }

    public String getId() {
        return this.id;
    }

    public String getCacheId() {
        return "MyBatisRedisCache_" + this.getId();
    }

    public void putObject(Object key, Object value) {
        String fieldMd5 = DigestUtils.md5Hex(key.toString());
        log.info("####################### put cache Object keyMd5 : {} valueType : {}", fieldMd5, value.getClass());
        String cacheId = this.getCacheId();

        try {
            boolean isExists = getRedisCache().exists(cacheId);
            log.info("putObject isExists : {} ", isExists);
            getRedisCache().hsetObj(cacheId, fieldMd5, value);
            if (!isExists) {
                getRedisCache().expire(cacheId, this.cacheSeconds);
            }
        } catch (Exception var6) {
            var6.printStackTrace();
        }

    }

    public Object getObject(Object key) {
        String fieldMd5 = DigestUtils.md5Hex(key.toString());
        log.info("####################### get cache Object key : {} ", fieldMd5);
        String cacheId = this.getCacheId();

        try {
            boolean isExists = getRedisCache().exists(cacheId);
            if (isExists) {
                long ttl = getRedisCache().ttl(cacheId);
                Object tmpObj = getRedisCache().hgetObj(cacheId, fieldMd5);
                if (ttl < 0L) {
                    getRedisCache().expire(cacheId, this.cacheSeconds);
                    log.info("getObject isExists : {} ttl : {} ", isExists, ttl);
                }

                return tmpObj;
            }
        } catch (Exception var8) {
            var8.printStackTrace();
        }

        return null;
    }

    public Object removeObject(Object key) {
        String keyMd5 = DigestUtils.md5Hex(key.toString());
        String cacheId = this.getCacheId();
        log.info("####################### removeObject namespace : {} get key : {} ", cacheId, keyMd5);

        try {
            getRedisCache().del(cacheId);
        } catch (Exception var5) {
            var5.printStackTrace();
        }

        return null;
    }

    public void clear() {
        String cacheId = this.getCacheId();
        log.info("####################### clear all namespace : {} cache Object ", cacheId);

        try {
            getRedisCache().del(cacheId);
        } catch (Exception var3) {
            var3.printStackTrace();
        }

    }

    public int getSize() {
        return 0;
    }

    public ReadWriteLock getReadWriteLock() {
        log.info(" getReadWriteLock ");
        return null;
    }
}
```

```xml
<!-- 开启基于redis的二级缓存
    <cache type="com.jd.stob.unionsaas.cache.impl.MyBatisJimdbCacheImpl"/>-->
```