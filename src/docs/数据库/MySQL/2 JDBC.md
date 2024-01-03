# JDBC

## 获取数据库连接

### **获取数据库连接方式一**

1.获取Driver对象

2.配置url协议地址

3.获取Properties对象，把用户名，密码封装到Properties

4.调用Driver的connect方法，获取连接

> ​		url：jdbc:mysql://localhost:3306/database?		传输协议/主机/端口号/数据库（文件）/
>
> ​						rewriteBatchedStatements=true			（参数）读写批处理编译
>
> ​						characterEncoding=utf8							（参数）字符集
>
> ​						useSSL=false										安全验证
>
> ​						serverTimezone=UTC						时区
>
> ​					参数之间用&连接

```java
Driver driver = new com.mysql.cj.jdbc.Driver();//8.0
		//Driver driver = new com.mysql.jdbc.Driver();//5.7
		//String url = "jdbc:mysql://localhost:3306/database";
String url = "jdbc:mysql://localhost:3306/database?characterEncoding=utf8&useSSL=false&serverTimezone=UTC&rewriteBatchedStatements=true";

Properties info = new Properties();
info.setProperty("user","root");
info.setProperty("password","abc123");

Connection conn = driver.connect(url, info);
```

### **获取数据库连接方式二**

由于Driver是第三方的，不方便管理，所以用反射替代

使用DriverManager替换Driver来获取连接

​	DriverManager中有一个返回Connection类型的静态方法getConnection

1.提供url、user、password

2.加载Driver(`<u>`mysql可以省，但不要省，写入配置文件后更改为其他像Oracle就不行了`</u>`)

3.通过DriverManager.getConnection（）获取连接

```Java
String url = "jdbc:mysql://localhost:3306/atguigudb?characterEncoding=utf8&useSSL=false&serverTimezone=UTC&rewriteBatchedStatements=true";
String user = "root";
String password = "abc123";

Class.forName("com.mysql.cj.jdbc.Driver");

Connection conn = DriverManager.getConnection(url, user, password);
System.out.println(conn);
```

### **获取数据库连接方式三**

> 1.实现了数据与代码的分离。实现了解耦
> 2.如果需要修改配置文件信息，可以避免程序重新打包。（配置文件不被打包）

1.将url、user、password、driver对象写入配置文件.properties

> 在idea中，配置文件放在resources目录下
>
> 在eclipse中，放在src目录下

2.通过类的加载器，获取配置文件输入流，为了更具通用性，我们选择系统类加载器

3.创建Properties对象，输入流作为形参，读取配置文件信息

4.加载驱动

5.获取连接

**此处直接封装为方法**：如下

```java
public class JDBCUtils {
    public static Connection getConnection() throws Exception {
        InputStream is = ClassLoader.getSystemClassLoader().getResourceAsStream("jdbc.properties");

        Properties pros = new Properties();
        pros.load(is);

        String user = pros.getProperty("user");
        String password = pros.getProperty( "password");
        String url = pros.getProperty("url");
        String driver = pros.getProperty("driver");

        Class.forName(driver);

        Connection conn = DriverManager.getConnection(url, user, password);
        return conn;
    }
}
```

## **PreparedStatment实现增删改**

Statement弊端

> 使用Statement的弊端：需要拼写sql语句，并且存在SQL注入的问题
> 如何避免出现sql注入：只要用 PreparedStatement(从Statement扩展而来) 取代 Statement

PreparedStatment优点

> 解决Statement的拼串、sql注入问题：占位符
>
> PreparedStatement操作Blob的数据，而Statement做不到。
>
> PreparedStatement可以实现更高效的批量操作。

### **关闭资源封装为方法**

```java
public class JDBCUtils {
    public static void closeResource(Connection conn, PreparedStatement ps){
            try {
                if (conn != null)
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            try {
                if (ps != null)
                ps.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
    }
}
```

### **增删改通用步骤**：

1.获取连接

2.预编译sql语句，返回PreparedStatement实例

3.填充占位符

4.执行

5.资源关闭

```java
Connection conn = JDBCUtils.getConnection();

String sql = "update employees2 set last_name = ? where id = ?";
PreparedStatement ps = conn.prepareStatement(sql);

ps.setString(1,"李某某");
ps.setInt(2, 110);

ps.execute();

conn.close();
ps.close();
```

### **增删改封装为方法**：

```java
public class JDBCUtils { 
    public static void update(String sql,Object ... args){
            Connection conn = null;
            PreparedStatement ps = null;
            try {
                conn = JDBCUtils.getConnection();
                ps = conn.prepareStatement(sql);
                for (int i = 0; i < args.length; i++) {
                    ps.setObject(i + 1,args[i]);
                }
                ps.execute();
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                JDBCUtils.closeResource(conn,ps);
            }
        }
}
```

测试添加：（注意，**字段和表名不能用占位符代替**）

```
@Test
public void testInsert() {
        String sql = "INSERT INTO `employees2`(last_name,email,job_id) VALUES (?,?,?)";
        JDBCUtils.update(sql,"刘思思","hfkajshfjkahfajhf","dah5j");
}
```

## PreparedStatment实现查询

### **ORM编程思想  （object relational mapping）**

 * 一个数据表对应一个java类
 * 表中的一条记录对应java类的一个对象
 * 表中的一个字段对应java类的一个属性

### **查询步骤**

![image-20220505212508911](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220505212508911.png)

1.获取连接

2.预编译sql，返回PreparedStatement实例

3.填充占位符

4.执行，并返回结果集

5.处理结果集

6.关闭资源

```java
Connection conn = JDBCUtils.getConnection();

String sql = "select last_name,email,salary from employees where employee_id = ?";
PreparedStatement ps = conn.prepareStatement(sql);

ps.setObject(1,101);

ResultSet resultSet = ps.executeQuery();//执行并返回结果集

if (resultSet.next()){  //next()类似迭代器，判断是否有下条数据，有并下移
      //获取当前这条数据的各个字段
      String last_name = resultSet.getString(1);
      String email = resultSet.getString(2);
      double salary = resultSet.getDouble(3);
	  Employees dates = new Employees(last_name, email, salary);
      System.out.println(dates);
}

JDBCUtils.closeResource(conn,ps,resultSet);
```

### **通用操作低配版**

查一个表，一条数据

```java
 public static Employee queryForEmployees2(String sql,Object...args) throws Exception {
        Connection conn = JDBCUtils.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql);
        for (int i = 0; i < args.length; i++) {
            ps.setObject(i + 1,args[i]);
        }
        ResultSet rs = ps.executeQuery();
        //通过结果集获取元数据，元数据含每个字段的信息
        ResultSetMetaData rsmd = rs.getMetaData();
        //通过元数据获取列数，即字段个数
        int columnCount = rsmd.getColumnCount();
        if (rs.next()){
            Employee emp = new Employee();
            for (int i = 0; i < columnCount; i++) {
                Object columnvalue = rs.getObject(i + 1);
                //String columnName = rsmd.getColumnName(i + 1);//通过元数据获取列名
                //sql和java的命名方式不同，开发中字段和属性对应不上，我们只能通过别名来进行操作
                String columnLabel = rsmd.getColumnLabel(i + 1);//通过元数据获取别名

                //列名就是Employee类的一个属性，知道了列名和要赋的值，用反射
                Field field = emp.getClass().getDeclaredField(columnLabel);
                field.setAccessible(true);
                field.set(emp,columnvalue);
            }
            return emp;
        }
        JDBCUtils.closeResource(conn,ps,rs);
        return null;
    }
```

### **通用操作升级版**

查不同表，一条数据

```java
public static <T> T query(Class<T> clazz,String sql,Object...args) throws Exception {
        Connection conn = JDBCUtils.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql);
        for (int i = 0; i < args.length; i++) {
            ps.setObject(i + 1,args[i]);
        }
        ResultSet rs = ps.executeQuery();
        if (rs.next()){
            T t = clazz.newInstance();
            ResultSetMetaData rsmd = rs.getMetaData();
            int columnCount = rsmd.getColumnCount();
            for (int i = 0; i < columnCount; i++) {
                Object columnValue = rs.getObject(i + 1);
                String columnLable = rsmd.getColumnLabel(i+1);

                Field field = clazz.getDeclaredField(columnLable);
                field.setAccessible(true);
                field.set(t,columnValue);
            }
            return t;
        }
        JDBCUtils.closeResource(conn,ps,rs);
        return null;
    }
```

### **通用操作终极版**

查不同表，多条数据

```java
public static <E> List<E> queryAll(Class<E> clazz,String sql,Object...args) throws Exception {
       Connection conn = JDBCUtils.getConnection();
       PreparedStatement ps = conn.prepareStatement(sql);
       for (int i = 0; i < args.length; i++) {
           ps.setObject(i + 1,args[i]);
       }
       ResultSet rs = ps.executeQuery();

       ArrayList<E> list = new ArrayList<>();

       while (rs.next()){
           E e = clazz.newInstance();
           ResultSetMetaData rsmd = rs.getMetaData();
           int columnCount = rsmd.getColumnCount();
           for (int i = 0; i < columnCount; i++) {
               Object columnValue = rs.getObject(i + 1);
               String columnLable = rsmd.getColumnLabel(i+1);

               Field field = clazz.getDeclaredField(columnLable);
               field.setAccessible(true);
               field.set(e,columnValue);
           }
           list.add(e);
       }
       return list;
       JDBCUtils.closeResource(conn,ps,rs);
       return null;
   }
```

## PreparedStatment实现读取BLOB字段

BLOB字段，二进制字段，主要用来存储图片，视频，音频

![image-20220505212652376](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220505212652376.png)

- 实际使用中根据需要存入的数据大小定义不同的BLOB类型。
- 需要注意的是：如果存储的文件过大，数据库的性能会下降。
- 如果在指定了相关的Blob类型以后，还报错：xxx too large，那么在mysql的安装目录下，找my.ini文件加上如下的配置参数： **max_allowed_packet=16M**。同时注意：修改了my.ini文件之后，需要重新启动mysql服务。（8.0未测试）

### 插入图片（增删相似）

```java
public void insertTest() throws Exception {
        Connection conn = JDBCUtils.getConnection();
        String sql = "insert into employees2(last_name,photo)values (?,?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setObject(1,"王八蛋");
        FileInputStream fis = new FileInputStream(new File("D:\\workspace_idea\\myself\\jdbc\\jdbc01\\src\\main\\java\\com\\botuer\\java2\\100.jpeg"));
        ps.setObject(2,fis);
        ps.execute();
        JDBCUtils.closeResource(conn,ps);
        fis.close();
    }
```

### 查询图片

```java
 public void queryTest() throws Exception {
        Connection conn = JDBCUtils.getConnection();
        String sql = "select id,last_name,photo from employees2 where last_name = '王八蛋'";
        PreparedStatement ps = conn.prepareStatement(sql);
        ResultSet rs = ps.executeQuery();
        if (rs.next()){
            int id = (Integer)rs.getInt(1);
            String last_name = rs.getString(2);
            Blob photo = rs.getBlob(3);
            Employee employee = new Employee(id, last_name);
            System.out.println(employee);

            InputStream is = photo.getBinaryStream();
            FileOutputStream fos = new FileOutputStream("liusisi.jpg");
            BufferedInputStream bis = new BufferedInputStream(is);
            BufferedOutputStream bos = new BufferedOutputStream(fos);

            byte[] buff = new byte[1024];
            int len;
            while ((len = bis.read(buff)) != -1){
                bos.write(buff,0,len);
                bos.flush();
            }
        }
     	is.close();
        fos.close();
        bis.close();
        bos.close();
        JDBCUtils.closeResource(conn,ps,rs);
    }
```

## PreparedStatment实现批量操作

update、delete本身就具有批量操作的效果。

此时的批量操作，主要指的是批量插入。

### 方式一：Statement

```java
public void insertTest1() throws Exception {
        Connection conn = JDBCUtils.getConnection();
        Statement st = conn.createStatement();
        for (int i = 1; i <= 20000; i++) {
            String sql = "insert into goods(name)values('name_" + i + "')";
            st.execute(sql);
        }
    }
```

### 方式二

```java
public void insertTest2() throws Exception {
        long start = System.currentTimeMillis();

        Connection conn = JDBCUtils.getConnection();
        String sql = "insert into goods1 (name) values (?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        for (int i = 0; i < 20000; i++) {
            ps.setString(1,"name_" + i);
            ps.execute();
        }
        long end = System.currentTimeMillis();
        System.out.println("花费时间：" + (end - start));//20000-- 63730 
```

### 方式三：攒sql

PreparedStatement的三个方法：类似流中的	byte[] buff = new byte[1024];

> addBatch()	添加一批
>
> executeBatch()	执行一批
>
> clearBatch()	清理一批

```java
public void insertTest3() throws Exception {
        long start = System.currentTimeMillis();

        Connection conn = JDBCUtils.getConnection();
        String sql = "insert into goods1 (name) values (?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        for (int i = 0; i < 20000; i++) {
            ps.setString(1,"name_" + i);

            ps.addBatch();
            if(i % 500 == 0){
                ps.executeBatch();
                ps.clearBatch();
            }
        }
        long end = System.currentTimeMillis();
        System.out.println("花费时间：" + (end - start));//20000--2248，2000000--86142
    }
```

### 最终版：设置不自动提交

Connection的两个方法

> setAutoCommit(false)	设置不自动提交
>
> commit()		提交

```java
public void insertTest3() throws Exception {
        long start = System.currentTimeMillis();

        Connection conn = JDBCUtils.getConnection();
        String sql = "insert into goods1 (name) values (?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        conn.setAutoCommit(false);
        for (int i = 0; i < 2000000; i++) {
            ps.setString(1, "name_" + i);
            ps.addBatch();
            if (i % 500 == 0) {
                ps.executeBatch();
                ps.clearBatch();
            }
        }
        conn.commit();
        long end = System.currentTimeMillis();
        System.out.println("花费时间：" + (end - start));//20000--1351,2000000--63668
    }
```

## 事务处理

### 事务概述

1.什么叫数据库事务？

​	事务：一组逻辑操作单元,使数据从一种状态变换到另一种状态。

> ​	一组逻辑操作单元：一个或多个DML操作。

2.事务处理的原则：保证所有事务都作为一个工作单元来执行，即使出现了故障，都不能改变这种执行方式。

当在一个事务中执行多个操作时，要么所有的事务都被提交(commit)，那么这些修改就永久地保存下来；

要么数据库管理系统将放弃所作的所有修改，整个事务回滚(rollback)到最初状态。

3.数据一旦提交，就不可回滚

4.哪些操作会导致数据的自动提交？

> ①	DDL操作一旦执行，都会自动提交。
>
> ​    			set autocommit = false 对DDL操作失效
>
> ②	DML默认情况下，一旦执行，就会自动提交。
>
> ​				我们可以通过set autocommit = false的方式取消DML操作的自动提交。
>
> ③	默认在关闭连接时，会自动的提交数据

银行转账未考虑事务

```java
 public void updateBalance1() {
        String sql1 = "update user_table set balance = balance - 100 where id = ?";
        JDBCUtils.update(sql1, 1);
        //模拟异常
        System.out.println(10/0);
        String sql2 = "update user_table set balance = balance + 100 where id = ?";
        JDBCUtils.update(sql2, 2);
    }
```

### 银行转账考虑事务

**JDBC程序中为了让多个 SQL 语句作为一个事务执行：**

- 调用 Connection 对象的 **setAutoCommit(false);** 以取消自动提交事务
- 在所有的 SQL 语句都成功执行后，调用 **commit();** 方法提交事务
- 在出现异常时，调用 **rollback();** 方法回滚事务

> 若此时 Connection 没有被关闭，还可能被重复使用，则需要恢复其自动提交状态 setAutoCommit(true)。尤其是在使用数据库连接池技术时，执行close()方法前，建议恢复自动提交状态。

**步骤一、原增删改方法中，执行一次DML后关闭了连接，**

**不需要方法执行此操作，因此我们要自己创建连接，自己关闭连接**

```java
//考虑事务增删改
   public static void updateWithTransaction(Connection conn,String sql,Object ... args){
        PreparedStatement ps = null;
        try {
            ps = conn.prepareStatement(sql);
            for (int i = 0; i < args.length; i++) {
                ps.setObject(i + 1,args[i]);
            }
            ps.execute();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            JDBCUtils.closeResource(null,ps);
        }
    }
```

**步骤二、设置自动提交conn.setAutoCommit(false)**

**完后事务后提交 conn.commit()**

**并重新设置自动提交conn.setAutoCommit(true)**

**在catch中执行conn.rollback()**

```java
 public void updatebalance2()  {
        Connection conn = null;
        try {
            conn = JDBCUtils.getConnection();
            conn.setAutoCommit(false);

            String sql1 = "update user_table set balance = balance - 100 where id = ?";
            JDBCUtils.updateWithTransaction(conn, sql1, 1);

            //模拟异常
            System.out.println(10/0);
            
            String sql2 = "update user_table set balance = balance + 100 where id = ?";
            JDBCUtils.update(sql2, 2);
            System.out.println("转账成功");

            conn.commit();
        } catch (Exception e) {
            e.printStackTrace();
            try {
                conn.rollback();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
        } finally {
            try {
                conn.setAutoCommit(true);
            } catch (SQLException e) {
                e.printStackTrace();
            }
            JDBCUtils.closeResource(conn, null);
        }
    }
```

### 设置数据库隔离级别

2个事务，一个修改，一个查询

首先把查询通用方法改为考虑事务的

```java
 public static <E> List<E> selectWithTransaction(Connection conn, Class<E> clazz, String sql, Object... args) throws Exception {
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            ps = conn.prepareStatement(sql);
            for (int i = 0; i < args.length; i++) {
                ps.setObject(i + 1,args[i]);
            }
            rs = ps.executeQuery();
            ArrayList<E> list = new ArrayList<>();
            while (rs.next()){
                E e = clazz.newInstance();
                ResultSetMetaData rsmd = rs.getMetaData();
                int columnCount = rsmd.getColumnCount();
                for (int i = 0; i < columnCount; i++) {
                    Object columnValue = rs.getObject(i + 1);
                    String columnLable = rsmd.getColumnLabel(i+1);

                    Field field = clazz.getDeclaredField(columnLable);
                    field.setAccessible(true);
                    field.set(e,columnValue);
                }
                list.add(e);
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            JDBCUtils.closeResource(null,ps,rs);
        }
        return null;
    }
```

修改事务：不提交，不关闭

```java
//数据库隔离级别测试:更新事务
    public void testUpdateWithTransaction() throws Exception {
        Connection conn = JDBCUtils.getConnection();
        conn.setAutoCommit(false);
        String sql = "update user_table set balance = ? where id = ? or id = ?";
        JDBCUtils.updateWithTransaction(conn,sql,4000,3,4);

        Thread.sleep(10000);
        System.out.println("修改结束");
    }
```

查询事务：不提交，不关闭

> conn.setTransactionIsolation()，参数可以是常量值，也可以直接通过Connection调静态属性
>
> conn.getTransactionIsolation()
>
> 静态属性TRANSACTION_READ_UNCOMMITTED，TRANSACTION_READ_COMMITTED，TRANSACTION_REPEATABLE_READ，TRANSACTION_SERIALIZABLE

```java
 //数据库隔离级别测试:查询事务
    public void testSelectWithTransaction() {
        Connection conn = null;
        try {
            conn = JDBCUtils.getConnection();
            conn.setTransactionIsolation(1);
            //获取隔离级别
            System.out.println(conn.getTransactionIsolation());
            conn.setAutoCommit(false);
            String sql = "select id,name,balance from user_table where id = ? or id = ?";
            List<UserTable> users = JDBCUtils.selectWithTransaction(conn, UserTable.class, sql, 3, 4);
            users.forEach(System.out::println);
//            conn.commit();
        } catch (Exception e) {
            e.printStackTrace();
            try {
                conn.rollback();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
        } finally {
//            try {
//                conn.setAutoCommit(true);
//            } catch (SQLException e) {
//                e.printStackTrace();
//            }
//            JDBCUtils.closeResource(conn,null,null);
        }
    }
```

## 数据库连接池

 **JDBC数据库连接池的必要性**

连接资源不能重复利用，大量同时申请连接资源，导致服务器崩溃

每次用完都需要断开，导致内存泄漏（对象未被回收）

不能控制被创建的连接数（需要就会申请，连接过多，导致服务器崩溃，内存泄漏）

**数据库连接池**

![image-20220507112039512](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220507112039512.png)

我们需要一个**缓冲区**，存放可以**重复利用**的现有的连接，**提高了系统反应速度**，**可以设置最大最小默认连接数**，**防止服务器崩溃**，连接用完放回连接池，不需要断开，**统一的连接管理，避免了内存泄漏**

多种开源的数据库连接池

JDBC 的数据库连接池使用 javax.sql.DataSource 来表示，DataSource 只是一个接口，该接口通常由服务器(Weblogic, WebSphere, Tomcat)提供实现，也有一些开源组织提供实现：

- **DBCP** 是Apache提供的数据库连接池。tomcat 服务器自带dbcp数据库连接池。**速度相对c3p0较快**，但因自身存在BUG，Hibernate3已不再提供支持。
- **C3P0** 是一个开源组织提供的一个数据库连接池，**速度相对较慢，稳定性还可以。**hibernate官方推荐使用
- **Proxool** 是sourceforge下的一个开源项目数据库连接池，有监控连接池状态的功能，**稳定性较c3p0差一点**
- **BoneCP** 是一个开源组织提供的数据库连接池，速度快
- **Druid** 是阿里提供的数据库连接池，据说是集DBCP 、C3P0 、Proxool 优点于一身的数据库连接池，但是速度不确定是否有BoneCP快

- DataSource 通常被称为数据源，它包含连接池和连接池管理两个部分，习惯上也经常把 DataSource 称为连接池
- **DataSource用来取代DriverManager来获取Connection，获取速度快，同时可以大幅度提高数据库访问速度。**
- 特别注意：
  - 数据源和数据库连接不同，数据源无需创建多个，它是产生数据库连接的工厂，因此**整个应用只需要一个数据源即可。**
  - 当数据库访问结束后，程序还是像以前一样关闭数据库连接：conn.close(); 但conn.close()并没有关闭数据库的物理连接，它仅仅把数据库连接释放，归还给了数据库连接池。

### C3P0连接池

配置文件为：【c3p0-config.xml】

配置文件信息

```xml
<?xml version="1.0" encoding="UTF-8"?>
<c3p0-config>
	<named-config name="helloc3p0">
		<!-- 获取连接的4个基本信息 -->
		<property name="user">root</property>
		<property name="password">abc123</property>
		<property name="jdbcUrl">jdbc:mysql:///test</property>
		<property name="driverClass">com.mysql.jdbc.Driver</property>
		
		<!-- 涉及到数据库连接池的管理的相关属性的设置 -->
		<!-- 若数据库中连接数不足时, 一次向数据库服务器申请多少个连接 -->
		<property name="acquireIncrement">5</property>
		<!-- 初始化数据库连接池时连接的数量 -->
		<property name="initialPoolSize">5</property>
		<!-- 数据库连接池中的最小的数据库连接数 -->
		<property name="minPoolSize">5</property>
		<!-- 数据库连接池中的最大的数据库连接数 -->
		<property name="maxPoolSize">10</property>
		<!-- C3P0 数据库连接池可以维护的 Statement 的个数 -->
		<property name="maxStatements">20</property>
		<!-- 每个连接同时可以使用的 Statement 对象的个数 -->
		<property name="maxStatementsPerConnection">5</property>

	</named-config>
</c3p0-config>
```

获取连接

```java
private static DataSource cpds = new ComboPooledDataSource("helloc3p0");
public static Connection getConnection2() throws SQLException{
	Connection conn = cpds.getConnection();
	return conn;
}
```

### DBCP连接池（弃用）

配置文件为：【dbcp.properties】

配置文件信息

```properties
driverClassName=com.mysql.jdbc.Driver
url=jdbc:mysql://localhost:3306/test?rewriteBatchedStatements=true&useServerPrepStmts=false
username=root
password=abc123

initialSize=10
#...
```

- 配置属性说明

| 属性                       | 默认值 | 说明                                                         |
| -------------------------- | ------ | ------------------------------------------------------------ |
| initialSize                | 0      | 连接池启动时创建的初始化连接数量                             |
| maxActive                  | 8      | 连接池中可同时连接的最大的连接数                             |
| maxIdle                    | 8      | 连接池中最大的空闲的连接数，超过的空闲连接将被释放，如果设置为负数表示不限制 |
| minIdle                    | 0      | 连接池中最小的空闲的连接数，低于这个数量会被创建新的连接。该参数越接近maxIdle，性能越好，因为连接的创建和销毁，都是需要消耗资源的；但是不能太大。 |
| maxWait                    | 无限制 | 最大等待时间，当没有可用连接时，连接池等待连接释放的最大时间，超过该时间限制会抛出异常，如果设置-1表示无限等待 |
| poolPreparedStatements     | false  | 开启池的Statement是否prepared                                |
| maxOpenPreparedStatements  | 无限制 | 开启池的prepared 后的同时最大连接数                          |
| minEvictableIdleTimeMillis |        | 连接池中连接，在时间段内一直空闲， 被逐出连接池的时间        |
| removeAbandonedTimeout     | 300    | 超过时间限制，回收没有用(废弃)的连接                         |
| removeAbandoned            | false  | 超过removeAbandonedTimeout时间后，是否进 行没用连接（废弃）的回收 |

获取连接

```java
private static DataSource source = null;
static{									//读配置文件，创建连接池对象
	try {
		Properties pros = new Properties();	
		InputStream is = ClassLoader.getSystemClassLoader().getResourceAsStream("dbcp.properties");		
		pros.load(is);
		//根据提供的BasicDataSourceFactory创建对应的DataSource对象
		source = BasicDataSourceFactory.createDataSource(pros);
	} catch (Exception e) {
		e.printStackTrace();
	}	
}
public static Connection getConnection4() throws Exception {		
	Connection conn = source.getConnection();	
	return conn;
}
```

### Druid（德鲁伊）连接池

Druid是阿里巴巴开源平台上一个数据库连接池实现，它结合了C3P0、DBCP、Proxool等DB池的优点，同时加入了日志监控，可以很好的监控DB池连接和SQL的执行情况，可以说是针对监控而生的DB连接池，**可以说是目前最好的连接池之一。**

调用上和DBCP差不多

配置文件为：【druid.properties】

配置文件信息

```properties
url=jdbc:mysql://localhost:3306/test?rewriteBatchedStatements=true
username=root
password=123456
driverClassName=com.mysql.jdbc.Driver

initialSize=10
maxActive=20
maxWait=1000
filters=wall
```

- 详细配置参数：

| **配置**                      | **缺省** | **说明**                                                     |
| ----------------------------- | -------- | ------------------------------------------------------------ |
| name                          |          | 配置这个属性的意义在于，如果存在多个数据源，监控的时候可以通过名字来区分开来。   如果没有配置，将会生成一个名字，格式是：”DataSource-” +   System.identityHashCode(this) |
| url                           |          | 连接数据库的url，不同数据库不一样。例如：mysql :   jdbc:mysql://10.20.153.104:3306/druid2      oracle :   jdbc:oracle:thin:@10.20.149.85:1521:ocnauto |
| username                      |          | 连接数据库的用户名                                           |
| password                      |          | 连接数据库的密码。如果你不希望密码直接写在配置文件中，可以使用ConfigFilter。详细看这里：`<https://github.com/alibaba/druid/wiki/%E4%BD%BF%E7%94%A8ConfigFilter>` |
| driverClassName               |          | 根据url自动识别   这一项可配可不配，如果不配置druid会根据url自动识别dbType，然后选择相应的driverClassName(建议配置下) |
| initialSize                   | 0        | 初始化时建立物理连接的个数。初始化发生在显示调用init方法，或者第一次getConnection时 |
| maxActive                     | 8        | 最大连接池数量                                               |
| maxIdle                       | 8        | 已经不再使用，配置了也没效果                                 |
| minIdle                       |          | 最小连接池数量                                               |
| maxWait                       |          | 获取连接时最大等待时间，单位毫秒。配置了maxWait之后，缺省启用公平锁，并发效率会有所下降，如果需要可以通过配置useUnfairLock属性为true使用非公平锁。 |
| poolPreparedStatements        | false    | 是否缓存preparedStatement，也就是PSCache。PSCache对支持游标的数据库性能提升巨大，比如说oracle。在mysql下建议关闭。 |
| maxOpenPreparedStatements     | -1       | 要启用PSCache，必须配置大于0，当大于0时，poolPreparedStatements自动触发修改为true。在Druid中，不会存在Oracle下PSCache占用内存过多的问题，可以把这个数值配置大一些，比如说100 |
| validationQuery               |          | 用来检测连接是否有效的sql，要求是一个查询语句。如果validationQuery为null，testOnBorrow、testOnReturn、testWhileIdle都不会其作用。 |
| testOnBorrow                  | true     | 申请连接时执行validationQuery检测连接是否有效，做了这个配置会降低性能。 |
| testOnReturn                  | false    | 归还连接时执行validationQuery检测连接是否有效，做了这个配置会降低性能 |
| testWhileIdle                 | false    | 建议配置为true，不影响性能，并且保证安全性。申请连接的时候检测，如果空闲时间大于timeBetweenEvictionRunsMillis，执行validationQuery检测连接是否有效。 |
| timeBetweenEvictionRunsMillis |          | 有两个含义： 1)Destroy线程会检测连接的间隔时间2)testWhileIdle的判断依据，详细看testWhileIdle属性的说明 |
| numTestsPerEvictionRun        |          | 不再使用，一个DruidDataSource只支持一个EvictionRun           |
| minEvictableIdleTimeMillis    |          |                                                              |
| connectionInitSqls            |          | 物理连接初始化的时候执行的sql                                |
| exceptionSorter               |          | 根据dbType自动识别   当数据库抛出一些不可恢复的异常时，抛弃连接 |
| filters                       |          | 属性类型是字符串，通过别名的方式配置扩展插件，常用的插件有：   监控统计用的filter:stat日志用的filter:log4j防御sql注入的filter:wall |
| proxyFilters                  |          | 类型是List，如果同时配置了filters和proxyFilters，是组合关系，并非替换关系 |

获取连接

```java
private static DataSource source = null;
static{									//读配置文件，创建连接池对象
	try {
		Properties pros = new Properties();	
		InputStream is = ClassLoader.getSystemClassLoader().getResourceAsStream("druid.properties");		
		pros.load(is);
		//根据提供的BasicDataSourceFactory创建对应的DataSource对象
		source = DruidDataSourceFactory.createDataSource(pros);
	} catch (Exception e) {
		e.printStackTrace();
	}	
}
public static Connection getConnection4() throws Exception {		
	Connection conn = source.getConnection();	
	return conn;
}
```

## Apache-DbUtils实现CRUD操作

### **DbUtils类**：作用不大，都可以自己写

> close(参数)	参数可为Connection，Statement，ResultSet
>
> closeQuietly（参数）
>
> closeQuietly(Connection conn, Statement stmt, ResultSet rs)

### **QueryRunner类**

> int update(Connection conn, String sql, Object... params)	增删改，返回值为影响多少条记录
>
> T insert(Connection conn,String sql,ResultSetHandler`<T>` rsh, Object... params) 	只能插入
>
> int[] batch(Connection conn,String sql,Object[][] params)	批处理
>
> T insertBatch(Connection conn,String sql,ResultSetHandler`<T>` rsh,Object[][] params)	只能批量插入
>
> Object query(Connection conn, String sql, ResultSetHandler rsh,Object... params)	查询

```java
public void testInsert() throws Exception {
	QueryRunner runner = new QueryRunner();			//创建QueryRunner对象
	Connection conn = JDBCUtils.getConnection3();	//考虑事务情况下，需要自己创建链接
	String sql = "insert into customers(name,email,birth)values(?,?,?)";	//预编译sql
	int count = runner.update(conn, sql, "何成飞", "he@qq.com", "1992-09-08");	//调用update
	System.out.println("添加了" + count + "条记录");	
	JDBCUtils.closeResource(conn, null);		//关闭资源
}
```

ResultSetHandler接口及实现类

> 定义返回数据结果的形式
>
> 主要实现类
>
> - **BeanHandler：**将结果集中的第一行数据封装到一个对应的JavaBean实例中。即查一行，以对象的形式呈现。**有泛型和形参**
> - **BeanListHandler：**查每一行，以对象组成的List的形式呈现。**有泛型和形参**
> - **ScalarHandler：**查询单个值对象。没有泛型和形参
> - **MapHandler：**将结果集中的第一行数据封装到一个Map里，key是列名，value就是对应的值。即查一行，以Map的形式呈现。没有泛型和形参
> - **MapListHandler：**查每一行，以Map组成的List的形式呈现。没有泛型和形参
> - ArrayHandler：把结果集中的第一行数据转成对象数组。
> - ArrayListHandler：把结果集中的每一行数据都转成一个数组，再存放到List中。
> - ColumnListHandler：将结果集中某一列的数据存放到List中。
> - KeyedHandler(name)：将结果集中的每一行数据都封装到一个Map里，再把这些map再存到一个map里，其key为指定的key。

```java
public void testQueryList() throws Exception{
	QueryRunner runner = new QueryRunner();		
	Connection conn = JDBCUtils.getConnection3();	
	String sql = "select id,name,email,birth from customers where id < ?";	
    //以类的对象形式呈现，需要填入泛型
	BeanListHandler<Customer> handler = new BeanListHandler<>(Customer.class);
	List<Customer> list = runner.query(conn, sql, handler, 23);
	list.forEach(System.out::println);	
	JDBCUtils.closeResource(conn, null);
}
```

自定义ResultSetHandler的实现类

```java
public void testQueryInstance1() throws Exception{
	QueryRunner runner = new QueryRunner();
	Connection conn = JDBCUtils.getConnection3();	
	String sql = "select id,name,email,birth from customers where id = ?";	
	ResultSetHandler<Customer> handler = new ResultSetHandler<Customer>() {

		@Override
		public Customer handle(ResultSet rs) throws SQLException {
			System.out.println("handle");
//			return new Customer(1,"Tom","tom@126.com",new Date(123323432L));				
			if(rs.next()){
				int id = rs.getInt("id");
				String name = rs.getString("name");
				String email = rs.getString("email");
				Date birth = rs.getDate("birth");				
				return new Customer(id, name, email, birth);
			}
			return null;				
		}
	};		
	Customer customer = runner.query(conn, sql, handler, 23);		
	System.out.println(customer);		
	JDBCUtils.closeResource(conn, null);
}
```








| java类型           |         SQL类型          |
| ------------------ | :----------------------: |
| boolean            |           BIT            |
| byte               |         TINYINT          |
| short              |         SMALLINT         |
| int                |         INTEGER          |
| long               |          BIGINT          |
| String             | CHAR,VARCHAR,LONGVARCHAR |
| byte array         |   BINARY , VAR BINARY    |
| java.sql.Date      |           DATE           |
| java.sql.Time      |           TIME           |
| java.sql.Timestamp |        TIMESTAMP         |
| BigDecimal         |         DECIMAL          |



| 类名                           | 常用对象 | 用途                                                         |
| ------------------------------ | -------- | ------------------------------------------------------------ |
| Driver                         | driver   | 创建驱动new com.mysql.cj.jdbc.Driver()                       |
| Class                          | clazz    | 反射加载驱动Class.forName("com.mysql.cj.jdbc.Driver");       |
| ClassLoader，SystemClassLoader |          | ClassLoader.getSystemClassLoader().getResourceAsStream（“配置文件”）返回InputStream |
| InputStream                    | is       | 读入                                                         |
| Properties                     | pros     | 封装配置文件setProperty（），加载配置文件load（is），获取配置信息getProperty，返回配置信息 |
| DriverManager                  |          | 静态方法，获取连接getConnection(url, user, password)返回Connection |
| Connection                     | conn     | 预编译SQL语句prepareStatement（sql），返回PreparedStatement  |
| PreparedStatement              | ps       | 填充占位符setObject（），执行execute（），执行返回结果集executeQuery()返回ResultSet |
| ResultSet                      | rs       | 控制指针下移next（），获取元数据getMetaData（）返回ResultSetMetaData，获取数据值getObject（）即列值 |
| ResultSetMetaData              | rsmd     | 获取列数getColumnCount（），获取列名getColumnName（），获取别名getColumnLabel（） |
| Field                          | field    | 反射获取属性对象：类名.class.getDeclaredField(“”)，私有设置setAccessible(true)，改属性值set(类对象,属性值) |





给数据库添加日期

```java
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");	//格式化
java.util.Date date = sdf.parse("2019-05-06");	//解析:字符串 ---> Util下的日期
long time = date.getTime();			//获取时间戳
Date dateSQL = new Date(time);		//通过时间戳构造器创建对象
```



```java
SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
java.util.Date date = sdf.parse("2019/05/06");
System.out.println(date);	//Mon May 06 00:00:00 CST 2019
String format = sdf.format(date);
System.out.println(format);	//2019/05/06
long time = date.getTime();
Date dateSql = new Date(time);
java.util.Date dateUtil = dateSql;
System.out.println(dateUtil);	//2019-05-06
```

