# 待整合

## 依赖
```xml
<dependency>
    <groupId>org.springframework.boot</
    <artifactId>spring boot starter data elasticsearch</artifactId>
</dependency>
```
## 配置文件
```properties
# es 服务地址
elasticsearch.host=127.0.0.1
# es 服务端口
elasticsearch.port=9200
```

## 实体类
```java

public class Product {
    private Long id;// 商品唯一标识
    private String title;// 商品名称
    private String category;// 分类名称
    private Double price;// 商品价格
    private String images;// 图片地址
}
```

## 配置类
- ElasticsearchRestTemplate 是 spring data elasticsearch 项目中的一个类，和其他 spring 项目中的 template类似
- 在新版的 spring data elasticsearch 中， ElasticsearchRestTemplate 代替了原来的ElasticsearchTemplate
- 原因是 Elasticsearc hTemplate 基于 TransportClient TransportClient 即将在 8.x 以后的版本中移除。所以，我们推荐使用 ElasticsearchRestTemplate
- ElasticsearchRestTemplate 基于 RestHighLevelClient 客户端的。需要自定义配置类，继承
AbstractElasticsearchConfiguration ，并实现 elasticsearchClient() 抽象方法，创建 RestHighLevelClient 对象

```java
@ConfigurationProperties(prefix = "elasticsearch")
@Configuration
public class ElasticsearchConfig extends AbstractElasticsearchConfiguration {
    @Value("${es.host:42.193.100.99}")
    private String host;
    @Value("${es.port:9200}")
    private Integer port;

    // 重写父类方法
    @Override
    @Bean
    public RestHighLevelClient elasticsearchClient() {
        RestClientBuilder builder = RestClient.builder(new HttpHost(host, port));
        return new
                RestHighLevelClient(builder);
    }

    @Bean
    public ElasticsearchRestTemplate elasticsearchRestTemplate() {
        return new ElasticsearchRestTemplate(elasticsearchClient());
    }
}
```
若是SpringMVC项目，xml配置
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:elasticsearch="http://www.springframework.org/schema/data/elasticsearch"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/data/elasticsearch
       https://www.springframework.org/schema/data/elasticsearch/spring-elasticsearch.xsd
       http://www.springframework.org/schema/beans
       https://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc https://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <!-- 配置文件-->
    <context:property-placeholder location="classpath:application.properties"/>
    <!-- 自动扫描包 -->
    <context:component-scan base-package="com.jd.starlink.es.**"/>
    <!-- 使用注解-->
    <mvc:annotation-driven/>
    <!-- dao包-->
    <elasticsearch:repositories base-package="com.jd.starlink.es.dao"/>
</beans>
```
## Repository
```java
import
org. springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface ProductDao extends ElasticsearchRepository<Product,Long> {}
```
## 实体类映射
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Document(indexName = "shopping", shards = 3, replicas =1)
public class Product {
    // 必须有 id, 这里的 id 是全局唯一的标识，等同于 es 中的 _id
    @Id
    private Long id;// 商品唯一标识
    /* type : 字段数据类型
    * analyzer : 分词器类型
    * index : 是否索引 默认 :
    * Keyword : 短语 不进行分词
    */
    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String title;       // 商品名称
    @Field(type = FieldType.Ketword)
    private String category;    // 分类名称
    @Field(type = FieldType.Double)
    private Double price;   // 商品价格
    @Field(type = FieldType.Keyword, index =false)
    private String images;  //图片地址
}

```

## 索引操作
```java
public class SpringDataESIndexTest {
    // 注入 ElasticsearchRestTemplate
    @Autowired
    private ElasticsearchRestTemplate elasticsearchRestTemplate;

    // 创建索引并增加映射配置
    @Test
    public void createIndex(){
        // 创建索引，系统初始化会自动创建索引
        System.out.println(" 创建索引");
    }
    @Test
    public void deleteIndex(){
        // 创建索引，系统初始化会自动创建索引
        boolean flg = elasticsearchRestTemplate.deleteIndex(Product.class);
        System.out.println(" 删除索引 = " + flg);
    }
}
```

## 文档操作
```java

public class SpringDataESProductDaoTest {
    @Autowired
    private ProductDao productDao;

    // 新增
    @Test
    public void save(){
        Product product = new Product();
        product.setId(2L);
        product.setTitle(" 华为手机");
        product.setCategory(" 手机");
        product.setPrice(2999.0);
        product.setImages("http://www.atguigu/hw.jpg");
        productDao.save(product);
    }

    // 修改
    @Test
    public void update(){
        Product product = new Product();
        product.setId(1L);
        product.setTitle(" 小米 2 手机");
        product.setCategory(" 手机");
        product.setPrice(9999.0);
        product.setImages("http://www.atguigu/xm.jpg");
        productDao.save(product);
    }

    // 根据 id 查询
    @Test
    public void findById(){
        Product product = productDao.findById(1L).get();
        System.out.println(product);
    }

    // 查询所有
    @Test
    public void findAll(){
        Iterable<Product> products = productDao.findAll();
        for (Product product : products) {
            System.out.println(product);
        }
    }

    // 删除
    @Test
    public void delete(){
        Product product = new Product();
        product.setId(1L);
        productDao.delete(product);
    }

    // 批量新增
    @Test
    public void saveAll(){
        List<Product> productList = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Product product = new Product();
            product.setId(Long.valueOf(i));
            product.setTitle("["+i+"] 小米手机
            product.setCategory(" 手机
            product.setPrice(1999.0+i);
            product.setImages("http://www.atguigu/xm.jpg");
            productList.add(product);
        }
        productDao.saveAll(productList);
    }

    // 分页查询
    @Test
    public void findByPageable(){
        // 设置排序 排序方式，正序还是倒序，排序的 id)
        Sor t sort = Sort.by(Sort.Direction.DESC,"id");
        int currentPage = 0;// 当前页，第一页从 0 开始， 1 表示第二页
        int pageSize = 5;// 每页显示多少条
        // 设置查询分页
        PageRequest pageRequest = PageRequest.of(currentPage, pageSize,sort);
        // 分页查询
        Page<Product > productPage = productDao.findAll(pageRequest);
        for (Product Product : productPage.getContent()) {
            System.out.println(Product);
        }
    }
}
```
## 文档搜索
```java
public class SpringDataESSearchTest {
    @Autowired
    private ProductDao productDao;
    /* term 查询
     * search(termQueryBuilder) 调用搜索方法，参数查询构建器对象
     */
    @Test
    public void termQuery(){
        TermQueryBuilder termQueryBuilder = QueryBuilders.termQuery("title", " 小米");
        Iterable<Product> products = productDao.search(termQueryBuilder);
        for (Pro duct product : products) {
            System.out.println(product);
        }
    }
    // term 查询加分页
    @Test
    public void termQueryByPage(){
        int currentPage= 0 ;
        int pageSize = 5;
        // 设置查询分页
        PageRequest pageRequest = PageRequest.of(currentPage, pageSize);
        TermQueryBuilder termQueryBuilder = QueryBuilders.termQuery("title", "小米");
        Iterable<Product> products = productDao.search(termQueryBuilder,pageRequest);
        for ( Product product : products) {
            System.out.println(product);
        }
    }
}
```