# MongoDB

## 基本使用

### 概述

- MongoDB是一个基于分布式文件存储的数据库。由C++语言编写。旨在为WEB应用提供可扩展的高性能数据存储解决方案
- MongoDB是一个介于关系数据库和非关系数据库之间的产品，是非关系数据库当中功能最丰富，最像关系数据库的，它支持的数据结构非常松散，是类似json的bson格式，因此可以存储比较复杂的数据类型
- MongoDB最大的特点是它支持的查询语言非常强大，其语法有点类似于面向对象的查询语言，几乎可以实现类似关系数据库单表查询的绝大部分功能，而且还支持对数据建立索引
- 官网：https://www.mongodb.com

### 基本操作

#### docker安装

```sh
docker pull mongo
## 无密码
docker run -d -p 27017:27017 -v mongo_configdb:/data/configdb -v mongo_db:/data/db --name mongo docker.io/mongo
```

- 有密码

  ```sh
  ## 有密码
  docker run -d -p 27017:27017 -v mongo_configdb:/data/configdb -v mongo_db:/data/db --name mongo docker.io/mongo --auth
  #设置用户和密码
  docker exec -it mongo mongo admin
  
  db.createUser({ user: 'liyuanhao', pwd: 'root', roles: [ { role: "userAdminAnyDatabase", db: "admin" } ] });
  ```


#### 数据库及表操作

```sh
docker exec -it mongodb sh	#进入docker
mongo						#进入mongoDB

show dbs					#查看数据库
use admin					#切换数据库
use testdb					#没有自动创建，此刻还没创建，插入数据时创建
db.user.insert({id:1,name:'zhangsan'})	#添加数据，表自动创建
db.dropDatabase()			#删除数据库

show tables					#查看表
show collections			#查看表
db.user.drop()				#删除表
```

#### 数据操作

```sh
db.user.insert({id:1,name:'zhangsan'})	#添加数据，表自动创建
db.user.save({id:1,name:'zhangsan'})	#添加数据，表自动创建

#查询
db.user.find(query,fields)
#query 	可选 	查询条件
#fields	可选	查询字段
#{<key>:<value>}
db.user.find()							#查询所有
db.user.find().pretty()					#使查到的记录格式更易读
db.user.find().count() 					#查询数据条数
db.user.find({age:{$lte:21}}) 			#查询小于等于21的数据
db.user.find({$or:[{id:1},{id:2}]}) 	#查询id=1 or id=2
db.user.find().limit(2).skip(1) 		#跳过1条数据，查询2条数据
db.user.find().sort({id:-1}) 			#按照age倒序排序，-1为倒序，1为正序

#更新，若字段不存在，自动新增字段
db.user.update(query,update,upsert,multi,writeConcern)	
#query 	必选 	更新条件
#update	必选	更新内容
#upsert	可选	默认false，表示若记录不存在，不插入
#multi 	可选	默认false，表示可更新第一条
#writeConcern	可选，抛出异常的级别
db.user.update({id:1},{$set:{age:22}})	#只更新age字段
db.user.update({id:1},{age:22})			#只剩下age字段

#删除
db.user.remove(query,justOne,writeConcern)
#query 	必选 	删除条件
#justOne	可选	默认false，删除所有匹配的记录
#writeConcern	可选，抛出异常的级别
db.user.remove({})						#删除所有
db.user.remove({age:22})				#删除匹配
db.user.remove({age:22},true)			#只删除匹配的第一条
db.user.remove.deleteOne({age:22})		#只删除匹配的第一条
db.user.remove.deleteMany({age:22})		#删除匹配
```

|        操作        |                  格式                   |         实例          |
| :----------------: | :-------------------------------------: | :-------------------: |
|        等于        |             {`<key>`:`<value>`}             |      ｛age:21｝       |
|     小于；大于     |          {`<key>`:{$lt:`<value>`}}          |    {age:{$lt:21}}     |
| 小于等于；大于等于 |         {`<key>`:{$gte:`<value>`}}          |    {age:{$lte:21}}    |
|       不等于       |          {`<key>`:{$ne:`<value>`}}          |    {age:{$ne:21}}     |
|         或         | {$or:[{`<key>`:`<value>`},{`<key>`:`<value>`}]} | {$or:[{id:1},{id:2}]} |

#### 索引

- 索引通常能够极大的提高查询的效率，如果没有索引，MongoDB在读取数据时必须扫描集合中的每个文件并选取那些符合查询条件的记录
- 这种扫描全集合的查询效率是非常低的，特别在处理大量的数据时，查询可以要花费几十秒甚至几分钟，这对网站的性能是非常致命的
- 索引是特殊的数据结构，索引存储在一个易于遍历读取的数据集合中，索引是对数据库表中一列或多列的值进行排序的一种结构

```sh
#查看索引
db.user.getIndexes()
```

```sh
[
    {
        "v" : 2,				#版本号
        "key" : {				#索引
        	"_id" : 1
        },
        "name" : "_id_",		#索引名
        "ns" : "testdb.user"	#命名空间
    }
]
#说明：1表示升序创建索引，-1表示降序创建索引
```

```sh
#创建索引
db.user.createIndex({'age':1})
#创建联合索引
db.user.createIndex({'age':1,'id':-1})


#删除索引
db.user.dropIndex("age_1")
#或者，删除除了_id之外的索引
db.user.dropIndexes()

#查看索引大小，单位：字节
db.user.totalIndexSize()
```

- 默认主键 `_id `

#### 执行计划

- MongoDB 查询分析可以确保我们建议的索引是否有效，是查询语句性能分析的重要工具

```sh
#插入1000条数据
for(var i=1;i<1000;i++)db.user.insert({id:100+i,username:'name_'+i,age:10+i})

#查看执行计划
db.user.find({age:{$gt:100},id:{$lt:200}}).explain()
```

```sh
{
    "queryPlanner" : {
        "plannerVersion" : 1,
        "namespace" : "testdb.user",
        "indexFilterSet" : false,
        "parsedQuery" : {
            "$and" : [
                {
                    "id" : {
                        "$lt" : 200
                    }
                },
                {
                    "age" : {
                        "$gt" : 100
                    }
                }
            ]
        },
        "winningPlan" : { #最佳执行计划
            "stage" : "FETCH", #查询方式，常见的有COLLSCAN/全表扫描、IXSCAN/索引扫描、FETCH/根据索引去检索文档、SHARD_MERGE/合并分片结果、IDHACK/针对_id进行查询
            "inputStage" : {
                "stage" : "IXSCAN",
                "keyPattern" : {
                    "age" : 1,
                    "id" : -1
            	},
                "indexName" : "age_1_id_-1",
                "isMultiKey" : false,
                "multiKeyPaths" : {
                    "age" : [ ],
                    "id" : [ ]
            	},
                "isUnique" : false,
                "isSparse" : false,
                "isPartial" : false,
                "indexVersion" : 2,
                "direction" : "forward",
                "indexBounds" : {
                    "age" : [
                    	"(100.0, inf.0]"
                    ],
                    "id" : [
                    	"(200.0,-inf.0]"
                    ]
               	}
            }
        },
        "rejectedPlans" : [ ]
    },
    "serverInfo" : {
        "host" : "c493d5ff750a",
        "port" : 27017,
        "version" : "4.0.3",
        "gitVersion" : "7ea530946fa7880364d88c8d8b6026bbc9ffa48c"
    },
    "ok" : 1
}
```

```sh
#测试没有使用索引
db.user.find({username:'zhangsan'}).explain()
```

```sh
{
    "queryPlanner" : {
        "plannerVersion" : 1,
        "namespace" : "testdb.user",
        "indexFilterSet" : false,
        "parsedQuery" : {
            "username" : {
            	"$eq" : "zhangsan"
        	}
    	},
        "winningPlan" : {
            "stage" : "COLLSCAN", #全表扫描
            "filter" : {
            	"username" : {
            		"$eq" : "zhangsan"
            	}
        	},
       	 	"direction" : "forward"
        },
        "rejectedPlans" : [ ]
    },
    "serverInfo" : {
        "host" : "c493d5ff750a",
        "port" : 27017,
        "version" : "4.0.3",
        "gitVersion" : "7ea530946fa7880364d88c8d8b6026bbc9ffa48c"
    },
    "ok" : 1
}
```

## Java Api

### 原生Api

#### 依赖

```xml
<dependency>
    <groupId>org.mongodb</groupId>
    <artifactId>mongodb-driver-sync</artifactId>
    <version>3.9.1</version>
</dependency>
```

#### 编写Demo

```java
public class MongoDBDemo {
    public static void main(String[] args) {
        // 建立连接
        MongoClient mongoClient = MongoClients.create("mongodb://42.193.100.99:27017");
        // 选择数据库
        MongoDatabase mongoDatabase = mongoClient.getDatabase("testdb");
        // 选择表
        MongoCollection<Document> userCollection = mongoDatabase.getCollection("user");
        // 查询数据
        userCollection.find().limit(10).forEach(
                (Consumer<? super Document>)document -> System.out.println(document.toJson()));
        // 关闭连接
        mongoClient.close();
    }
}
```

#### CURD操作

```java
public class TestCRUD {

    private MongoCollection<Document> mongoCollection;
    private MongoClient mongoClient;

    @Before
    public void init() {
        mongoClient= MongoClients.create("mongodb://42.193.100.99:27017");
        MongoDatabase testdb = mongoClient.getDatabase("testdb");
        mongoCollection = testdb.getCollection("user");
    }
    @After
    public void after(){
        mongoClient.close();
    }
    @Test
    public void findTest(){
        FindIterable<Document> documents = mongoCollection.find();
        documents.forEach((Consumer<? super Document>) document -> {
            System.out.println(document.toJson());
        });
    }
    // 查询age<=50并且id>=100的用户信息，并且按照id倒序排序，只返回id，age字段，不返回_id字段
    @Test
    public void queryTest() {
        mongoCollection.find(
                and(
                    lt("age",50),
                    gte("id",100)
        )).sort(
                descending("id")
                ).projection(
                        fields(
                                include("id"),
                                excludeId())).forEach((Consumer<? super Document>) document -> {
            System.out.println(document.toJson());
        });
    }
    @Test
    public void insertTest() {
        Document document = new Document("id",1).append("age",36).append("name","李四");
        mongoCollection.insertOne(document);
        System.out.println("+++++++++++++++");
        mongoCollection.find(eq("id",1)).forEach((Consumer<? super Document>) doc->{
            System.out.println(doc.toJson());
        });
    }
    @Test
    public void updateTest() {
        UpdateResult updateResult = mongoCollection.updateMany(eq("id", 1), set("name", "王五"));
        System.out.println(updateResult);
        mongoCollection.find().forEach((Consumer< ? super Document>) document->{
            System.out.println(document.toJson());
        });
    }

    @Test
    public void deleteTest() {
        DeleteResult deleteResult = mongoCollection.deleteOne(eq("age", 36));
        System.out.println(deleteResult);
        mongoCollection.find().forEach((Consumer<? super Document>)document -> {
            System.out.println(document.toJson());
        });
    }
}
```

#### 面向对象操作

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Person {
    private ObjectId id;
    private String name;
    private int age;
    private Address address;
}
```

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Address {
    private String street;
    private String city;
    private String zip;
}
```

```java
public class TestPerson {

    private MongoCollection<Person> personMongoCollection;
    private MongoClient mongoClient;

    @Before
    public void init() {
        //定义对象的解码注册器
        CodecRegistry codecRegistry = CodecRegistries.fromRegistries(
                MongoClientSettings.getDefaultCodecRegistry(),
                CodecRegistries.fromProviders(PojoCodecProvider.builder().automatic(true).build()));

        mongoClient = MongoClients.create("mongodb://42.193.100.99:27017");
        MongoDatabase testdb = mongoClient.getDatabase("testdb").withCodecRegistry(codecRegistry);
        personMongoCollection = testdb.getCollection("person", Person.class);
    }
    @After
    public void after(){
        mongoClient.close();
    }

    @Test
    public void insertTest(){
        Person person = new Person(ObjectId.get(), "张三", 20,
                new Address("人民路", "上海市", "666666"));
        personMongoCollection.insertOne(person);
        System.out.println("++++++++++++++++++");
    }
    @Test
    public void testInserts() {
        List<Person> personList = Arrays.asList(
                new Person(ObjectId.get(), "张三", 20,
                        new Address("人民路", "上海市", "666666")),
                new Person(ObjectId.get(), "李四", 21,
                        new Address("北京西路", "上海市", "666666")),
                new Person(ObjectId.get(), "王五", 22,
                        new Address("南京东路", "上海市", "666666")),
                new Person(ObjectId.get(), "赵六", 23,
                        new Address("陕西南路", "上海 市", "666666")),
                new Person(ObjectId.get(), "孙七", 24,
                        new Address("南京西路", "上海 市", "666666")));
        personMongoCollection.insertMany(personList);
        System.out.println("插入数据成功");
    }
    @Test
    public void testQuery() {
        personMongoCollection.find(Filters.eq("name", "张三"))
                .forEach((Consumer<? super Person>) person -> {
                    System.out.println(person);
                });
    }

    @Test
    public void testUpdate() {
        UpdateResult updateResult =
                personMongoCollection.updateMany(Filters.eq("name", "张三"), Updates.set("age", 22));
        System.out.println(updateResult);
    }

    @Test
    public void testDelete() {
        DeleteResult deleteResult =
                personMongoCollection.deleteOne(Filters.eq("name", "张三"));
        System.out.println(deleteResult);
    }

}
```

### SpringDataMongoDB

整合SpringBoot

- 依赖

  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-mongodb</artifactId>
  </dependency>
  ```

- application.properties配置文件

  ```properties
  ## Spring boot application
  spring.application.name = itcast-mongodb
  spring.data.mongodb.uri=mongodb://42.193.100.99:27017/testdb
  ```

- 编写PersonDao

  ```java
  @Component
  public class PersonDao {
      @Autowired
      private MongoTemplate mongoTemplate;
  
      public void savePerson(Person person) {
          this.mongoTemplate.save(person);
      }
  
      public List<Person> queryPersonListByName(String name) {
          Query query = Query.query(Criteria.where("name").is(name));
          return this.mongoTemplate.find(query, Person.class);
      }
  
      public List<Person> queryPersonListByName(Integer page, Integer rows) {
          Query query = new Query().limit(rows).skip((page - 1) * rows);
          return this.mongoTemplate.find(query, Person.class);
      }
  
      public UpdateResult update(Person person) {
          Query query = Query.query(Criteria.where("id").is(person.getId()));
          Update update = Update.update("age"
                  , person.getAge());
          return this.mongoTemplate.updateFirst(query, update, Person.class);
      }
  
      public DeleteResult deleteById(String id) {
          Query query = Query.query(Criteria.where("id").is(id));
          return this.mongoTemplate.remove(query, Person.class);
      }
  }
  ```

- 启动类

  ```java
  @SpringBootApplication
  public class MyApplication {
      public static void main(String[] args) {
          SpringApplication.run(MyApplication.class, args);
      }
  }
  ```

- 单元测试

  ```java
  @RunWith(SpringRunner.class)
  @SpringBootTest(classes = MyApplication.class)
  public class TestPersonDao {
      @Autowired
      private PersonDao personDao;
  
      @Test
      public void testSave() {
          Person person = new Person(ObjectId.get(), "张三", 20,
                  new Address("人民路", "上海市", "666666"));
          this.personDao.savePerson(person);
      }
  
      @Test
      public void testQuery() {
          List<Person> personList = this.personDao.queryPersonListByName("张三");
          for (Person person : personList) {
              System.out.println(person);
          }
      }
  
      @Test
      public void testQuery2() {
          List<Person> personList = this.personDao.queryPersonListByName(2, 2);
          for (Person person : personList) {
              System.out.println(person);
          }
      }
  
      @Test
      public void testUpdate() {
          Person person = new Person();
          person.setId(new ObjectId("5c0956ce235e192520086736"));
          person.setAge(30);
          this.personDao.update(person);
      }
  
      @Test
      public void testDelete() {
          this.personDao.deleteById("5c09ca05235e192d8887a389");
      }
  }
  ```

  

