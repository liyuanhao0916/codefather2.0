# JDBC精华

## 1. Maven依赖

```xml
 <dependencies>
        <dependency>
            <groupId>commons-dbutils</groupId>
            <artifactId>commons-dbutils</artifactId>
            <version>1.7</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>commons-dbutils</groupId>
            <artifactId>commons-dbutils</artifactId>
            <version>1.7</version>
            <scope>compile</scope>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
            <version>1.2.9</version>
            <scope>compile</scope>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.28</version>
        </dependency>


    </dependencies>
```

## 2. Druid的配置文件

```properties
url=jdbc:mysql://localhost:3306/atguigudb?characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&rewriteBatchedStatements=true
username=root
password=abc123
driverClassName=com.mysql.cj.jdbc.Driver

initiaSize=10
maxActive=20
MaxWait=1000
```

## 3. Druid的连接池并创建连接

```java
public class JDBCUtils{
    static private DataSource dataSource;
    static{
        Properties pro = new Properties();
        InputStream is = ClassLoader.getSystemClassLoader().getResourceAsStream(druid.properties)
        pro.load(is);
        dataSource = DruidDataSourceFactory.createDataSource(pro);
    }
    public static Connection getConnection(){
        return dataSource.getConnection();
    }
}
```

## 4. DbUtils类的使用

### 	1. QueryRunner的使用

```java
@Test//测试修改
public void updateTest(){
    QueryRunner runner = new QueryRunner();
	Connection conn = JDBCUtils.getConnection();
    String sql = "update employees2 set last_name = ?,email = ?,birth_date = ? where id = ?";
    
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy--MM--dd")
    java.util.Date dateUtil = sdf.parse("2019-12-10");
    Long date = getTime(dateUtil);
    Date dateSQL = new Date(date);
    Employee emp = new Employee(112,"蜘蛛侠","zhizhuxia@163.com",dateSQL)
    runner.update(conn,sql,emp.getLastName(),emp.getEmail(),emp.getBirthDate(),emp.getId);
    System.out.println("修改成功");
    
    DbUtils.closeQuietly(conn);
}

@Test//测试添加
public void insertTest(){
    QueryRunner runner = new QueryRunner();
	Connection conn = JDBCUtils.getConnection();
    String sql = "insert into employees2(last_name,email,birth_date) values(?,?,?)";
    
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy--MM--dd")
    java.util.Date dateUtil = sdf.parse("2018-12-10");
    Long date = getTime(dateUtil);
    Date dateSQL = new Date(date);
    Employee emp = new Employee(112,"蜘蛛侠","zhizhuxia@163.com",dateSQL)
        
    runner.update(conn,sql,emp.getLastName(),emp.getEmail(),emp.getBirthDate());
    System.out.println("添加成功");
    
    DbUtils.closeQuietly(conn);
}

@Test//测试删除
public void deleteTest(){
    QueryRunner runner = new QueryRunner();
	Connection conn = JDBCUtils.getConnection();
    String sql = "delete from employees2 where id = ?";  
    runner.update(conn,sql,109);
    System.out.println("删除成功");
    DbUtils.closeQuietly(conn);
}
```

### 2. ResultSetHandler接口及其实现类

```java
@Test//测试查询（BeanHandler形式呈现）
public void selectOfBeanHandler(){
    QueryRunner runner = new QueryRunner();
	Connection conn = JDBCUtils.getConnection();
    String sql = "select last_name lastName,email,birth_date birthDate from employees2 where id = ?";  
    
    BeanHandle<Employee> rsh = new BeanHandler<>(Employee.class);
    Employee emp = runner.query(conn,sql,rsh,109);
    System.out.println(emp);
    
    DbUtils.closeQuietly(conn);
}

@Test//测试查询（MapListHandler形式呈现）
public void selectOfBeanHandler(){
    QueryRunner runner = new QueryRunner();
	Connection conn = JDBCUtils.getConnection();
    String sql = "select last_name lastName,email,birth_date birthDate from employees2 where id < ?";  
    
    MapListHandler rsh = new MapListHandler();
    List<Employee> emps = runner.query(conn,sql,rsh,109);
    emps.forEach(System.out::println);
    
    DbUtils.closeQuietly(conn);
}

@Test//测试查询（ScalarHandler形式呈现）
public void selectOfBeanHandler(){
    QueryRunner runner = new QueryRunner();
	Connection conn = JDBCUtils.getConnection();
    String sql = "select max(birth_date) from employees2";  
    
    ScalarHandler rsh = new ScalarHandler();
    Date maxBirthDate = runner.query(conn,sql,rsh);
    System.out.println(maxBirthDate);
    
    DbUtils.closeQuietly(conn);
}
```

## 5.拓展：自定义ResultSetHandler的实现类

### 	1. 获取连接的底层原理

```java
public static Connection getConnection() throws Exception {
        
        //配置文件转为输入流，配置文件四要素：url,username,password,driverClassName
        InputStream is = ClassLoader.getSystemClassLoader().getResourceAsStream("jdbc.properties");
		
		//读取配置文件
        Properties pros = new Properties();
        pros.load(is);

        String user = pros.getProperty("user");
        String password = pros.getProperty( "password");
        String url = pros.getProperty("url");
        String driver = pros.getProperty("driverClassName");
		
    	//加载驱动
        Class.forName(driver);
        
		//DriverManager创建连接
        Connection conn = DriverManager.getConnection(url, user, password);
        return conn;
    }
```

### 	2. 增删改的底层原理

```java
String sql = "增删改代码";

public static void update(String sql,Object ... args){
    Connection conn = JDBCUtils.getConnection();		//1.创建连接
    //String sql = "增删改代码";		方便修改，把sql作为形参传入
    PreparedStatement ps = conn.prepareStatement(sql);	//2.连接conn调用预编译
    for (int i = 0; i < args.length; i++) {				//3.填充占位符，args.length即为占位符的个数
        ps.setObject(i + 1,args[i]);					//占位符从1开始计数
    }
    ps.execute();										//4.预编译开始执行
    DbUtils.closeQuietly(conn);							//5.关闭资源
    DbUtils.closeQuietly(ps);
}
```

### 	3.查询的底层原理

```java
String sql = "查询代码";
Connection conn = JDBCUtils.getConnection();			//1.创建连接
public static <E> List<E> update(Class<E> clazz,Connection conn,String sql,Object ... args){
    
    //Connection conn = JDBCUtils.getConnection();		考虑到事务把连接放在外面，方便控制开关
    //String sql = "增删改代码";							 方便修改，把sql作为形参传入
    
    PreparedStatement ps = conn.prepareStatement(sql);	//2.连接conn调用预编译
    for (int i = 0; i < args.length; i++) {				//3.填充占位符，args.length即为占位符的个数
        ps.setObject(i + 1,args[i]);					//占位符从1开始计数
    }
    ResoultSet rs = ps.executeQuery();					//4.执行并返回结果集 
    
    //********************************** 5.处理结果集 ********************************************
    ArrayList<E> list = new ArrayList<>();				//5.1想办法把结果存在集合中
    ResoultSetMetaData rsmd = rs.getMetaData();				//获取元数据，元数据中包含每列的属性信息
    while(rs.next()){									//5.2先搞定每一行，通过循环获取每行数据
        E e = clazz.newInstance();						//5.3想办法得到每行的值，并赋值到我们创建的对象中
   //              --------—————————————— 5.4搞定每一列 —————————————————---
              //          ----- 5.4.1获取元数据，为了执行效率，放在循环外----
   //   ResoultSetMetaData rsmd = rs.getMetaData();		//
        int columnCount = rsmd.getColumnCount();			//元数据获取列数，作为循环结束条件
        for (int i = 0; i < columnCount; i++) {				//循环中获取某行每列的值：列值、列名
            Object columnValue = rs.getObject(i + 1);			//从结果集中获取第i + 1列的值
            String columnLable = rsmd.getColumnLabel(i+1);		//从元数据中获取第i + 1列的列名
            //          ------------ 5.4.2通过反射得到属性类 ------------
            Field field = clazz.getDeclaredField(columnLable);	
            field.setAccessible(true);								//把私有属性改为可访问
            field.set(e,columnValue);								//通过属性类给属性赋值
        }
        list.add(e);									//5.4.5每次循环得到的一行数据都添加到集合中
    }
    return list;
    JDBCUtils.closeResource(null, ps, rs);
}

List<Employee> emps = update(Employee.class,conn,sql,args);
emps.forEach(System.out::println);
```

### 	4. Blob字段的增删改和读取

```java
//增删改
public void insertTest() throws Exception {
        Connection conn = JDBCUtils.getConnection();
        String sql = "insert into employees2(last_name,photo)values (?,?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setObject(1,"王八蛋");
    	//创建文件输入流
    	File file = new File("D:\\workspace_idea\\myself\\jdbc\\jdbc01\\src\\main\\java\\com\\botuer\\java2\\100.jpeg")
        FileInputStream fis = new FileInputStream(file);
    
        ps.setObject(2,fis);
        ps.execute();
        JDBCUtils.closeResource(conn,ps);
        fis.close();
}
```

```java
//查询
public void queryTest() throws Exception {
        Connection conn = JDBCUtils.getConnection();
        String sql = "photo from employees2 where last_name = '王八蛋'";
        PreparedStatement ps = conn.prepareStatement(sql);
        ResultSet rs = ps.executeQuery();
        if (rs.next()){
            Blob photo = rs.getBlob(1);
            //通过Blob字段的对象photo来调用getBinaryStream()方法得到输入流
            InputStream is = photo.getBinaryStream();
            //创建文件输出流
            FileOutputStream fos = new FileOutputStream("liusisi.jpg");
            //创建两个缓冲流
            BufferedInputStream bis = new BufferedInputStream(is);
            BufferedOutputStream bos = new BufferedOutputStream(fos);
			
            //攒字节
            byte[] buff = new byte[1024];
            int len;
            //输入1024个字节,输出一次
            while ((len = bis.read(buff)) != -1){
                bos.write(buff,0,len);
                bos.flush();
            }
        }
    	//关流关资源
     	is.close();
        fos.close();
        bis.close();
        bos.close();
        JDBCUtils.closeResource(conn,ps,rs);
}
```

​	5.批量插入

```java
//删，改，查自带批量效果
public void insertTest3() throws Exception {
        Connection conn = JDBCUtils.getConnection();
        String sql = "insert into goods1 (name) values (?)";
        PreparedStatement ps = conn.prepareStatement(sql);
//    	------------------------ 设置不自动提交 ----------------------
        conn.setAutoCommit(false);
        for (int i = 0; i < 2000000; i++) {
            ps.setString(1, "name_" + i);
//    	------------------------ 攒sql ----------------------            
            ps.addBatch();		//添加到批中
            if (i % 500 == 0) {
                ps.executeBatch();	//执行一批
                ps.clearBatch();	//清空批
            }
        }
        conn.commit();//提交
    }
```

### 	5. 事务案例：银行转账

```java
public void updatebalance2()  {
 //   *************************** 要点一：手动创建连接，方便掌控开关 *****************************
        Connection conn = null;
        try {
            conn = JDBCUtils.getConnection();
//    *************************** 要点二：设置不自动提交 *****************************
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
//    *************************** 要点三：出现异常进行回滚 *****************************
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

### 	6. 事务案例：测试隔离级别

```java
//数据库隔离级别测试:更新事务，不提交，不关闭
    public void testUpdateWithTransaction() throws Exception {
        Connection conn = JDBCUtils.getConnection();
        conn.setAutoCommit(false);
        String sql = "update user_table set balance = ? where id = ? or id = ?";
        JDBCUtils.updateWithTransaction(conn,sql,4000,3,4);

        Thread.sleep(10000);
        System.out.println("修改结束");
    }

//数据库隔离级别测试:查询事务
    public void testSelectWithTransaction() {
            Connectionconn = JDBCUtils.getConnection();
        	
        /*conn.setTransactionIsolation()，参数可以是常量值，也可以直接通过Connection调静态属性
        静态属性
        	TRANSACTION_READ_UNCOMMITTED = 1
        	TRANSACTION_READ_COMMITTED = 2
       	 	TRANSACTION_REPEATABLE_READ = 4
        	TRANSACTION_SERIALIZABLE = 8
        */
        //设置隔离级别（获取用getTransactionIsolation()）
            conn.setTransactionIsolation(1);
            conn.setAutoCommit(false);
            String sql = "select id,name,balance from user_table where id = ? or id = ?";
            List<UserTable> users = JDBCUtils.selectWithTransaction(conn, UserTable.class, sql, 3, 4);
            users.forEach(System.out::println);
    }
```

### 	7. 自定义ResultSetHandler的实现类

```java
@Test//考虑事务的查询
public void selectOfBeanHandler(){
    QueryRunner runner = new QueryRunner();
	Connection conn = JDBCUtils.getConnection();
    String sql = "select last_name lastName,email,birth_date birthDate from employees2 where id < ?";  
    
    ResultSetHandler<List<Employee>> rsh = new ResultSetHandler<List<Employee>>(){
        @Override
        public List<Employee> handle(ResultSet rs) throws SQLException{ 
            List<Employee> emps = new ArrayList<>();
            while(rs.next()){
                String last_name = rs.getString("lastName");
                String email = rs.getString("email");
                Date birth_date = rs.getDate("birthDate");
                Employee emp = new Employee();
                for (int i = 0; i < 3; i++) {
                   emp.setBirthDate(birth_date);
                   emp.setEmail(email);
                   emp.setLastName(last_name);
                }
                emps.add(emp);
             }
             DbUtils.closeQuietly(rs);
             return emps;
         }
    };
    
    List<Employee> emps = runner.query(conn,sql,rsh,109);
    emps.forEach(System.out::println);
    
    DbUtils.closeQuietly(conn);
}
```

