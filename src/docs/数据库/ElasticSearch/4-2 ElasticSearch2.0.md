# 待整合2

## 索引管理

### 创建索引

```js
PUT /my_index
{
    "settings": { ... any settings ... },
    "mappings": {
        "type_one": { ... any mappings ... },
        "type_two": { ... any mappings ... },
        ...
    }
}
```

### 删除索引

```html
DELETE /my_index
## 删除多个
DELETE /index_one,index_two
DELETE /index_*
## 删除全部
DELETE /_all
DELETE /*
```


对一些人来说，能够用单个命令来删除所有数据可能会导致可怕的后果。如果你想要避免意外的大量删除, 你可以在你的 `elasticsearch.yml` 做如下配置：

```
action.destructive_requires_name: true
```

这个设置使删除只限于特定名称指向的数据, 而不允许通过指定 `_all` 或通配符来删除指定索引库。你同样可以通过 [Cluster State API](https://www.elastic.co/guide/cn/elasticsearch/guide/current/_changing_settings_dynamically.html) 动态的更新这个设置。

### 索引设置

下面是两个 最重要的设置：

- **`number_of_shards`**

  每个索引的主分片数，默认值是 `5` 。这个配置在索引创建后不能修改。

- **`number_of_replicas`**

  每个主分片的副本数，默认值是 `1` 。对于活动的索引库，这个配置可以随时修改。

例如，我们可以创建只有 一个主分片，没有副本的小索引：

```json
PUT /my_temp_index
{
    "settings": {
        "number_of_shards" :   1,
        "number_of_replicas" : 0
    }
}
```

然后，我们可以用 `update-index-settings` API 动态修改副本数：

```json
PUT /my_temp_index/_settings
{
    "number_of_replicas": 1
}
```

### 分析器

- 配置分析器

  分析器用于将全文字符串转换为适合搜索的倒排索引。

  `standard` 分析器是用于全文字段的默认分析器，对于大部分西方语系来说是一个不错的选择。 它包括了以下几点：

  - `standard` 分词器，通过单词边界分割输入的文本。
  - `standard` 语汇单元过滤器，目的是整理分词器触发的语汇单元（但是目前什么都没做）。
  - `lowercase` 语汇单元过滤器，转换所有的语汇单元为小写。
  - `stop` 语汇单元过滤器，删除停用词—对搜索相关性影响不大的常用词，如 `a` ， `the` ， `and` ， `is` 。

  默认情况下，停用词过滤器是被禁用的。如需启用它，你可以通过创建一个基于 `standard` 分析器的自定义分析器并设置 `stopwords` 参数。 可以给分析器提供一个停用词列表，或者告知使用一个基于特定语言的预定义停用词列表。

  在下面的例子中，我们创建了一个新的分析器，叫做 `es_std` ， 并使用预定义的西班牙语停用词列表：

  ```json
  PUT /spanish_docs
  {
      "settings": {
          "analysis": {
              "analyzer": {
                  "es_std": {
                      "type":      "standard",
                      "stopwords": "_spanish_"
                  }
              }
          }
      }
  }
  ```

- 自定义分词器有三部分组成
    - character filters：字符过滤器，字符过滤器 用来 `整理` 一个尚未被分词的字符串。例如，如果我们的文本是HTML格式的，它会包含像 `<p>` 或者 `<div>` 这样的HTML标签，这些标签是我们不想索引的。我们可以使用 [`html清除` 字符过滤器](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/analysis-htmlstrip-charfilter.html) 来移除掉所有的HTML标签，并且像把 `Á` 转换为相对应的Unicode字符 `Á` 这样，转换HTML实体。一个分析器可能有0个或者多个字符过滤器。
    - tokenizer: 分词器，一个分析器 *必须* 有一个唯一的分词器。 分词器把字符串分解成单个词条或者词汇单元。 `标准` 分析器里使用的 [`标准` 分词器](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/analysis-standard-tokenizer.html) 把一个字符串根据单词边界分解成单个词条，并且移除掉大部分的标点符号，然而还有其他不同行为的分词器存在。例如， [`关键词` 分词器](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/analysis-keyword-tokenizer.html) 完整地输出 接收到的同样的字符串，并不做任何分词。 [`空格` 分词器](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/analysis-whitespace-tokenizer.html) 只根据空格分割文本 。 [`正则` 分词器](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/analysis-pattern-tokenizer.html) 根据匹配正则表达式来分割文本 。
    - tokenizer filter：**词单元过滤器**，经过分词，作为结果的 *词单元流* 会按照指定的顺序通过指定的词单元过滤器 。词单元过滤器可以修改、添加或者移除词单元。我们已经提到过 [`lowercase` ](http://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-lowercase-tokenizer.html)和 [`stop` 词过滤器](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/analysis-stop-tokenfilter.html) ，但是在 Elasticsearch 里面还有很多可供选择的词单元过滤器。 [词干过滤器](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/analysis-stemmer-tokenfilter.html) 把单词 `遏制` 为 词干。 [`ascii_folding` 过滤器](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/analysis-asciifolding-tokenfilter.html)移除变音符，把一个像 `"très"` 这样的词转换为 `"tres"` 。 [`ngram`](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/analysis-ngram-tokenfilter.html) 和 [`edge_ngram` 词单元过滤器](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/analysis-edgengram-tokenfilter.html) 可以产生 适合用于部分匹配或者自动补全的词单元。

```json
PUT /test
{
	"settings": {								// 配置
		"analysis": {								// 分析器配置
			"analyzer": {							// 自定义分词器
				"my_analyzer": {					// 分词器1名称
					"type": "custom",				// custom 代表自定义，可省略
					"char_filter": ["html_strip", "&_to_and"],		// 字符过滤器
					"tokenizer": "ik_max_word",						// 分词器
					"filter": ["py", "lowercase", "my_stopwords"]	// 词单元过滤器
				}
			},
			"filter": {								// 自定义词单元过滤器
				"py": {									// 拼音过滤器
					"type": "pinyin",
					"keep_full_pinyin": false,
					"keep_joined_full_pinyin": true,
					"keep_original": true,
					"limit_first_letter_length": 16,
					"remove_duplicated_term": true,
					"none_chinese_pinyin_tokenize": false
				},
				"my_stopwords": {						// stop过滤器
					"type": "stop",
					"stopwords": ["the", "a"]
				}
			},
			"char_filter": {						// 字符过滤器
				"&_to_and": {
					"type": "mapping",
					"mappings": ["&=> and "]		// 将&替换为and
				}
			}
		}
	},
	"mappings": {							// 映射
		"properties": {
			"name": {
				"type": "text",
				"analyzer": "my_analyzer",
				"search_analyzer": "ik_smart"
			}
		}
	}
}
```





## 查询

```json
match_all	查询所有
match		全文检索
multi_match	多字段全文检索
term		精确查询
range		范围查询
```

ElasticsearchRestTemplate

```xml
     <!--Spring Boot-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
        </dependency>
————————————————
<!--Spring MVC-->
  			<dependency>
                <groupId>org.springframework.data</groupId>
                <artifactId>spring-data-elasticsearch</artifactId>
                <version>4.2.1</version>
            </dependency>
```

yaml

```yaml
spring:
  elasticsearch:
    rest:
      uris: 127.0.0.1:9200               #---ES的连接地址，多个地址用逗号分隔
      username:                          #---用户名
      password:                          #---密码
      connection-timeout: 1000           #---连接超时时间(默认1s)
      read-timeout: 1000                 #---读取超时时间(默认30s)
```

javaBean

- 注解：@Document用来声明Java对象与ElasticSearch索引的关系
  - indexName 索引名称(是字母的话必须是小写字母)

  - type 索引类型

  - shards 主分区数量，默认5

  -  replicas 副本分区数量，默认1

  - createIndex 索引不存在时，是否自动创建索引，默认true

    > 不建议自动创建索引(自动创建的索引 是按着默认类型和默认分词器)

- 注解：@Id 表示索引的主键
- 注解：@Field 用来描述字段的ES数据类型，是否分词等配置，等于Mapping描述
  - index 设置字段是否索引，默认是true，如果是false则该字段不能被查询
  - store 默认为no,被store标记的fields被存储在和index不同的fragment中，以便于快速检索。虽然store占用磁盘空间，但是减少了计算
  - type 数据类型(text、keyword、date、object、geo等)
  - analyzer 对字段使用分词器，注意一般如果要使用分词器，字段的type一般是text
  - format 定义日期时间格式，详细见 [官方文档](https://www.elastic.co/guide/reference/mapping/date-format/)
- 注解：@CompletionField 定义关键词索引 要完成补全搜索
  - analyzer 对字段使用分词器，注意一般如果要使用分词器，字段的type一般是text
  - searchAnalyzer 显示指定搜索时分词器，默认是和索引是同一个，保证分词的一致性
  - maxInputLength:设置单个输入的长度，默认为50 UTF-16 代码点

> **数据类型**
>
> - 简单类型：
>   - 字符串类型
>     - text：会分词，不支持聚合
>     - keyword：不会分词，将全部内容作为一个词条，支持聚合
>   - 数字类型: 尽可能选择范围小的数据类型, 字段的长度越短, 索引和搜索的效率越高;(优先考虑使用带缩放因子的浮点类型)
>     - byte :            有符号的8位整数, 范围: [-128 ~ 127]                
>     - short :           有符号的16位整数, 范围: [-32768 ~ 32767]                
>     - integer :        有符号的32位整数, 范围: [−231 ~ 231-1]                
>     - long :            有符号的64位整数, 范围: [−263 ~ 263-1]                
>     - float :             32位单精度浮点数   
>     - double :         64位双精度浮点数                
>     - half_float :     16位半精度IEEE 754浮点类型
>     - scaled_float : 缩放类型的的浮点数, 比如price字段只需精确到分, 57.34缩放因子为100, 存储结果为5734
>   - 日期类型:date JSON没有日期数据类型, 所以在ES中, 日期可以是:
>     - 包含格式化日期的字符串 “2018-10-01”, 或"2018/10/01 12:10:30"    (可以通过 format属性 定义日期时间格式）DateFormat 官方文法.
>     - 代表时间毫秒数的长整型数字.
>
>     - 代表时间秒数的整数.
>   - 布尔类型： boolean 可以接受表示真、假的字符串或数字:
>     - 真值: true, “true”, “on”, “yes”, “1”…
>
>     - 假值: false, “false”, “off”, “no”, “0”, “”(空字符串), 0.0, 0
>
> - 复杂类型:
>   - 数组[]： 由数组中第一个非空值决定数组类型(type = FieldType.Keyword)
>   - List集合： 由数组中第一个非空值决定数组类型(type = FieldType.Keyword)
>   - 嵌套类型: list里泛型是object形式的或自定义对象(type = FieldType.Nested)
>   - 对象：{ }object for single JSON objects 单个JSON对象(type = FieldType.Object)

```java
@Document(indexName = "student", type = "_doc", replicas = 1, shards = 1, createIndex = true)
public class Student {

    @Id
    @Field(index = true, store = true, type = FieldType.Keyword)
    private String sId;

    @Field(index = true, store = true, type = FieldType.Keyword)
    private String sName;

    @Field(index = true, store = true, type = FieldType.Text, analyzer = "ik_smart")
    //Text可以分词 ik_smart=粗粒度分词 ik_max_word 为细粒度分词
    private String sAddress;

    @Field(index = false, store = true, type = FieldType.Integer)
    private Integer sAge;

    @Field(index = false, store = true, type = FieldType.Date, format = DateFormat.basic_date_time)
    private Date sCreateTime;

    @Field(index = false, store = true, type = FieldType.Object)
    private Headmaster sHeadmaster;//班主任

    @Field(index = true, store = false, type = FieldType.Keyword)
    private String[] sCourseList; //数组类型 由数组中第一个非空值决定(这里数组和集合一个意思了)

    @Field(index = true, store = false, type = FieldType.Keyword)
    private List<String> sColorList; //集合类型 由数组中第一个非空值决定


    @Field(index = true, store = false, type = FieldType.Nested)//嵌套类型list里泛型是object形式的或自定义对象
    private List<Teacher> sTeacherList; //教所有科目的老师

}
```

### 索引操作

#### 创建

```java
 public boolean createIndexAndMapping(Class<?> classType) {
        if (elasticsearchRestTemplate.indexExists(classType))
            return true;
        boolean index = elasticsearchRestTemplate.createIndex(classType);
        boolean mapping = elasticsearchRestTemplate.putMapping(classType);
        return index && mapping;
    }
```

#### 删除

```java
elasticsearchRestTemplate.deleteIndex(clazz);
```

单元测试中可以直接创建索引

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



### 文档操作

#### 添加

```java
// 单个
elasticsearchRestTemplate.save(t);

// 批量
elasticsearchRestTemplate.save(entities);

// 可变个数形参
elasticsearchRestTemplate.save(t1,t2,t3);
```

#### 删除

```java
// 主键删除
elasticsearchRestTemplate.delete(entity);
elasticsearchRestTemplate.delete(id, entityType);

// 条件删除
 public void deleteByQuery() {
    // query:查询语法 包含(term查询、terms查询、match查询、范围查询、模糊查询…)
    MatchQueryBuilder matchQueryBuilder = QueryBuilders.matchQuery("tAddress", "山东省济南市").operator(Operator.AND).analyzer("ik_smart");
    NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(matchQueryBuilder);
    Boolean aBoolean = elasticsearchDeleteController.delete(nativeSearchQuery, Teacher.class);
}
```

#### 修改

```java
 /**
     * @param id        : 主键id(es里的_id)
     * @param object    : 要修改的数据(这里的值都会转成Map)注意 这里入参如果是空或null的话 那么也会被更新
     * //  用的 hutool-core转map(版本高一些，低版本的 如果传的就是Map类型,在map转map时会报错  -- 5.7.13)
     * @param classType :  修改的哪个索引实体
     */
public Boolean update(String id, Object object, Class<?> classType) {
    // 更新条件
    UpdateQuery.Builder builder = UpdateQuery.builder(id)
        .withDocument(org.springframework.data.elasticsearch.core.document.Document.from(BeanUtil.beanToMap(object)));
    // 指定索引
    IndexCoordinates of = IndexCoordinates.of(classType.getAnnotation(Document.class).indexName());
    UpdateResponse update = elasticsearchRestTemplate.update(builder.build(), of);
    return true;
}
```

#### 查询

```java
// 根据主键查询
elasticsearchRestTemplate.get(id, classType);

// 是否存在
elasticsearchRestTemplate.exists(id, classType);
```

### 高级查询

#### QueryBuilder

- **NativeSearchQueryBuilder**: NativeSearchQueryBuilder 是最常用的 QueryBuilder 实现之一。它允许您构建原生的 Elasticsearch 查询语句。您可以添加查询条件、排序、分页设置和聚合等。
- **BoolQueryBuilder**: BoolQueryBuilder 是用于构建布尔逻辑查询的实现。它可以组合多个查询条件，并通过逻辑运算符（MUST、MUST_NOT、SHOULD）来定义查询语句的组合关系。
- **MatchQueryBuilder**: MatchQueryBuilder 用于构建文本匹配查询。它可以根据字段进行全文搜索，并返回与搜索词匹配的结果。您可以设置搜索的字段、搜索词、分词器和其他选项。
- **TermQueryBuilder**: TermQueryBuilder 用于构建精确匹配查询。它搜索一个字段是否完全匹配给定的值，不对搜索词进行分词处理。
- **RangeQueryBuilder**: RangeQueryBuilder 用于构建范围查询。它可以搜索满足指定范围条件的字段值，如日期范围、数字范围等。

#### 分词

```java
/**
     * @param tokenizer : 粗细粒度分词(粗粒度:ik_smart   细粒度:ik_max_word)
     * @param text      : 需要分词的入参
     */
public List<AnalyzeResponse.AnalyzeToken> selectBreakUpText(String tokenizer, String text){
        RestHighLevelClient restHighLevelClient = elasticsearchRestTemplate.execute((client) -> client);
        AnalyzeRequest request = AnalyzeRequest.buildCustomAnalyzer(tokenizer).build(text);
        AnalyzeResponse response = restHighLevelClient.indices().analyze(request, RequestOptions.DEFAULT);
        return response.getTokens();
    }
```

#### 精确查询

```java
 /**
     * @param key       : es里索引的域(字段名)
     * @param classType : 返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     * @param values    : 一域多值, 查询的值
     */
    public <T> List<T> termQuery(String key, Class<T> classType, String... values) {
        //查询条件(词条查询：对应ES query里的term)
        TermsQueryBuilder termsQueryBuilder = QueryBuilders.termsQuery(key, values);
        //创建查询条件构建器SearchSourceBuilder(对应ES外面的大括号)
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(termsQueryBuilder);
        //查询,获取查询结果
        SearchHits<T> search = elasticsearchRestTemplate.search(nativeSearchQuery, classType);
        //获取总记录数
        long totalHits = search.getTotalHits();
        //获取值返回
        return search.getSearchHits().stream().map(SearchHit::getContent).collect(Collectors.toList());

    }
```

#### 分词查询

```java
/**
     * 入参分词: 山东省济南市  ik_smart粗粒度:[山东省,济南市] ik_max_word细粒度:[山东省,山东,省,济南市,济南,南市]
     *
     * @param operator  : Operator.OR(并集) [默认] 只要分的词有一个和索引字段上对应上则就返回
     *                  Operator.AND(交集)   分的词全部满足的数据返回
     * @param analyzer  : 选择分词器[ik_smart粗粒度,ik_max_word细粒度] 默认:ik_max_word细粒度
     * @param key       :  es里索引的域(字段名)
     * @param classType :  返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     * @param text    :  查询的值
     */
    public <T> List<T> matchQuery(Operator operator, String analyzer, String key, Class<T> classType, String text) {
        //查询条件(词条查询：对应ES query里的match)
        MatchQueryBuilder matchQueryBuilder = QueryBuilders.matchQuery(key, text).analyzer(analyzer).operator(operator);
        //创建查询条件构建器SearchSourceBuilder(对应ES外面的大括号)
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(matchQueryBuilder);
        //查询,获取查询结果
        SearchHits<T> search = elasticsearchRestTemplate.search(nativeSearchQuery, classType);
        //获取总记录数
        long totalHits = search.getTotalHits();
        //获取值返回
        return search.getSearchHits().stream().map(SearchHit::getContent).collect(Collectors.toList());

    }
```

#### 查询所有

```java
 /**
     * @param classType :返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     * @return java.util.List<T>
     * @explain : 返回索引库里所有数据
     * @Author Mhh
     * @Date 2021/12/10 15:44
     */
    public <T> List<T> matchAllQuery(Class<T> classType) {
        //查询条件(词条查询：对应ES query里的match)
        MatchAllQueryBuilder matchAllQueryBuilder = QueryBuilders.matchAllQuery();
        //创建查询条件构建器SearchSourceBuilder(对应ES外面的大括号)
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(matchAllQueryBuilder);
        //查询,获取查询结果
        SearchHits<T> search = elasticsearchRestTemplate.search(nativeSearchQuery, classType);
        //获取总记录数
        long totalHits = search.getTotalHits();
        //获取值返回
        return search.getSearchHits().stream().map(SearchHit::getContent).collect(Collectors.toList());

    }
```

#### 模糊查询

```java
 /*
     *   ?:只包含一个字符
     *       山?省:  山东省 或者 山西省 等等   ?包含一个字符
     *       ??省：  山东省 或者 吉林省 等等   ?包含一个字符
     *       ???:    你好啊 或者 早上好 等等 ?包含一个字符
     *
     *   *:表示0个或多个字符
     *       济南*： 济南市 或者 济南市历下区.....  *表示0个或多个字符
     *       *剑 ：  长虹剑 或者 冰魄长虹倚天剑.... *表示0个或多个字符
     *
     * 注意: *或者?放在最前面(例如：*省 | ?省    *为 | ?为) 会引发全表(全索引)扫描  注意效率问题
     * */

    /**
     * @param key       :  es里索引的域(字段名)
     * @param value     : 查询的值
     * @param classType : 返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     */

    public <T> List<T> wildcardQuery(String key, String value, Class<T> classType) {

        //查询条件(词条查询：对应ES query里的wildcard)
        WildcardQueryBuilder wildcardQueryBuilder = QueryBuilders.wildcardQuery(key, value);
        //创建查询条件构建器SearchSourceBuilder(对应ES外面的大括号)
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(wildcardQueryBuilder);
        //查询,获取查询结果
        SearchHits<T> search = elasticsearchRestTemplate.search(nativeSearchQuery, classType);
        //获取总记录数
        long totalHits = search.getTotalHits();
        //获取值返回
        return search.getSearchHits().stream().map(SearchHit::getContent).collect(Collectors.toList());

    }
```

#### 前缀查询

```java
 /**
     * @param key       :  es里索引的域(字段名)
     * @param value     : 查询的值
     * @param classType : 返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     */
    public <T> List<T> prefixQuery(String key, String value, Class<T> classType) {

        //查询条件(词条查询：对应ES query里的prefixQuery)
        PrefixQueryBuilder prefixQueryBuilder = QueryBuilders.prefixQuery(key, value);
        //创建查询条件构建器SearchSourceBuilder(对应ES外面的大括号)
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(prefixQueryBuilder);
        //查询,获取查询结果
        SearchHits<T> search = elasticsearchRestTemplate.search(nativeSearchQuery, classType);
        //获取总记录数
        long totalHits = search.getTotalHits();
        //获取值返回
        return search.getSearchHits().stream().map(SearchHit::getContent).collect(Collectors.toList());

    }
```

#### 正则查询

```java
  /**
     * @param key       :  es里索引的域(字段名)
     * @param value     : 查询的值
     * @param classType : 返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     */
    public <T> List<T> regexpQuery(String key, String value, Class<T> classType) {
        //查询条件(词条查询：对应ES query里的regexpQuery)
        RegexpQueryBuilder regexpQueryBuilder = QueryBuilders.regexpQuery(key, value);
        //创建查询条件构建器SearchSourceBuilder(对应ES外面的大括号)
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(regexpQueryBuilder);
        //查询,获取查询结果
        SearchHits<T> search = elasticsearchRestTemplate.search(nativeSearchQuery, classType);
        //获取总记录数
        long totalHits = search.getTotalHits();
        //获取值返回
        return search.getSearchHits().stream().map(SearchHit::getContent).collect(Collectors.toList());
    }
```



#### 范围查询

```java
 /**
     * @param name       :es里索引的域(字段名)
     * @param from    :范围查询值 1 from(Object from, boolean includeLower) includeLower：是否包含 默认为true[包含]
     * //              如果from==null  那么就是<=to的
     * @param to    :范围查询值 2 to(Object to, boolean includeUpper) includeLower：是否包含 默认为true[包含]
     * //              如果to==null 那么就是 >=from的
     * @param classType :返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     */
    public <T> List<T> rangeQuery(String name, Integer from, Integer to, Class<T> classType) {

        //查询条件(词条查询：对应ES query里的rangeQuery)
        RangeQueryBuilder rangeQueryBuilder = QueryBuilders.rangeQuery(name).from(from).to(to);
        //创建查询条件构建器SearchSourceBuilder(对应ES外面的大括号)
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(rangeQueryBuilder);
        //查询,获取查询结果
        SearchHits<T> search = elasticsearchRestTemplate.search(nativeSearchQuery, classType);
        //获取总记录数
        long totalHits = search.getTotalHits();
        //获取值返回
        return search.getSearchHits().stream().map(SearchHit::getContent).collect(Collectors.toList());
    }
```

#### 分页

```java
// 分页查询
public <T> List<T> selectFindPage(Integer pageNum, Integer pageSize, String key, String value, Class<T> classType) {

    	// 文本匹配查询
        MatchQueryBuilder matchQueryBuilder = QueryBuilders.matchQuery(key, value).analyzer("ik_smart");
    
    	// 用于组合查询条件
        NativeSearchQueryBuilder nativeSearchQueryBuilder = new NativeSearchQueryBuilder()
            .withQuery(matchQueryBuilder)
            // 分页
    		.withPageable(PageRequest.of(pageNum == null || pageNum == 0 ? 0 : pageNum - 1, pageSize))
            .build();
		// 指定索引
        IndexCoordinates of = IndexCoordinates.of(classType.getAnnotation(Document.class).indexName());
        AggregatedPage<T> page = elasticsearchRestTemplate.queryForPage(query, classType, of);
    
        long totalElements = page.getTotalElements(); // 总记录数
        int totalPages = page.getTotalPages();  // 总页数
        int pageNumber = page.getPageable().getPageNumber(); // 当前页号
        List<T> beanList = page.toList();  // 当前页数据集
        Set<T> beanSet = page.toSet();  // 当前页数据集
        return page.getContent();

    }
```

#### 排序

```java
 /**
     * @param direction : 排序 Sort.Direction.ASC:升序  ||  Sort.Direction.DESC:降序
     * @param classType : 返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     * @param properties       : 域名(可变参数,可传1至多个)
     */
    public <T> List<T> sort(Sort.Direction direction, Class<T> classType, String... properties) {
        //查询条件(词条查询：对应ES query里的sort)
        MatchAllQueryBuilder matchAllQueryBuilder = QueryBuilders.matchAllQuery();
        //创建查询条件构建器SearchSourceBuilder(对应ES外面的大括号)
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(matchAllQueryBuilder);
        nativeSearchQuery.addSort(Sort.by(direction, properties));
        //查询,获取查询结果
        SearchHits<T> search = elasticsearchRestTemplate.search(nativeSearchQuery, classType);
        //获取总记录数
        long totalHits = search.getTotalHits();
        //获取值返回
        return search.getSearchHits().stream().map(SearchHit::getContent).collect(Collectors.toList());
    }
```

#### 多条件查询

```java
 /*
     *      多域查询的交并集理解:
     *                      OR:  只要有一个域中包含入参value被分词后的"一个值"时就返回
     *                      AND: 只要有一个域中包含入参value被分词后的"所有值"时返回
     *
     * @param fields    : Map<String,Float>类型:key为域名,Float为boost值
     *                  boost: 参数被用来提升一个语句的相对权重（ boost 值大于 1 ）或降低相对权重（ boost 值处于 0 到 1 之间），但是这种提升或降低并不是线性的，换句话说，如果一个 boost 值为 2 ，并不能获得两倍的评分 _score 。
     * @param queryString   : 要查询的值 (会对查询条件进行分词)
     * @param analyzer  : 选择分词器[ik_smart粗粒度,ik_max_word细粒度] 默认:ik_max_word细粒度
     * @param operator  : Operator.OR(并集) [默认] 只要分的词有一个和索引字段上对应上则就返回
     *                  Operator.AND(交集)   分的词全部满足的数据返回
     * @param classType :  返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     * @return java.util.List<T>
     * @explain :  queryString 多条件查询
     * •会对查询条件进行分词。
     * •然后将分词后的查询条件和词条进行等值匹配
     * •默认取并集（OR）
     * •可以指定多个查询字段
     * •query_string：识别query中的连接符（or 、and）
     */
    public <T> List<T> queryStringQuery(Map<String, Float> fields, String queryString, String analyzer, Operator operator, Class<T> classType) {
        //查询条件(词条查询：对应ES query里的queryStringQuery)
        QueryStringQueryBuilder queryStringQueryBuilder = QueryBuilders.queryStringQuery(queryString).fields(fields).analyzer(analyzer).defaultOperator(operator);
        //创建查询条件构建器SearchSourceBuilder(对应ES外面的大括号)
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(queryStringQueryBuilder);
        //查询,获取查询结果
        SearchHits<T> search = elasticsearchRestTemplate.search(nativeSearchQuery, classType);
        //获取总记录数
        long totalHits = search.getTotalHits();
        //获取值返回
        return search.getSearchHits().stream().map(SearchHit::getContent).collect(Collectors.toList());
    }


@Test
    public void queryStringQuery() throws IllegalAccessException, NoSuchFieldException, IOException {
//        List<AnalyzeResponse.AnalyzeToken> analyzeTokens = elasticsearchSelectController.selectBreakUpText("ik_smart", "black是河北省的");
        Map<String, Float> fields = new HashMap<>();
        fields.put("tAddress", (float) 1);
        fields.put("tEnglishName", (float) 1);
        List<Teacher> teacherList = elasticsearchSelectController.queryStringQuery(
                fields,
                "black是山东省的",
                "ik_smart",
                Operator.OR,
                Teacher.class);
        teacherList.forEach(System.err::println);
    }
```

#### 布尔查询

> - must（and）：条件必须成立
> - must和filter配合使用时，max_score（得分）是显示的
> - must 可以是单个条件，也可以对各条件 (默认数组形式)
> - maxSore(得分) : 即条件匹配度,匹配度越高，得分越高

> - filter（and）：条件必须成立
> - filter : 可以是单个条件，也可以对各条件 (默认数组形式)
> - filter : 单独使用不会计算得分

> - must_not（not）：条件必须不成立
> - must_not : 可以是单个条件，也可以对各条件 (默认数组形式)

> - should（or）：条件可以成立
> - minimumShouldMatch : 参数定义了至少满足几个子句
> - should : 可以是单个条件，也可以对各条件 (默认数组形式)

```java
 /**
     * ------boolQuery子句用termsQuery做的测试
     * //               fields: 只要有一条数据包含fields 都包含value数组中的一种就能返回
     *
     * @param fields    :Map<String,String[]> key:es索引库里的域(字段名), value数组:一域多值, 查询的值
     * @param classType : 返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     * @return java.util.List<T>
     * @explain : boolQuery：返回的文档必须满足must子句的条件,并且参与计算分值
     * //                   条件必须成立，性能比filter低。会计算得分
     * //                   对多个查询条件连接。连接方式：must（and）：条件必须成立(会计算得分)
     * //                   maxSore(得分):即条件匹配度,匹配度越高，得分越高
     */
    public <T> List<T> boolQueryBuilderByMust(Map<String, String[]> fields, Class<T> classType) {
        //构建boolQuery(词条查询：对应ES query里的bool)对多个查询条件连接
        BoolQueryBuilder boolQueryBuilder = QueryBuilders.boolQuery();
        fields.forEach((key, value1) -> {
            //查询条件(词条查询：对应ES query里的termQuery)
            TermsQueryBuilder termsQueryBuilder = QueryBuilders.termsQuery(key, value1);
            //must（and）：条件必须成立
            boolQueryBuilder.must(termsQueryBuilder);
        });

        //创建查询条件构建器SearchSourceBuilder(对应ES外面的大括号)
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(boolQueryBuilder);
        //查询,获取查询结果
        SearchHits<T> search = elasticsearchRestTemplate.search(nativeSearchQuery, classType);
        //获取总记录数
        long totalHits = search.getTotalHits();
        //获取值返回
        return search.getSearchHits().stream().map(SearchHit::getContent).collect(Collectors.toList());
    }
```

#### 高亮

```java
 /**
     * @param field     : 高亮字段 也是 match要查询的字段
     * @param preTags   : 高亮前缀
     * @param postTags  : 高亮后缀
     * @param text      : 查询的值(会分词)
     * @param classType :  返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     */
    public <T> List<T> highlightBuilder(String field, String preTags, String postTags, String text, Class<T> classType) {
        //查询条件(词条查询：对应ES query里的match)
        MatchQueryBuilder matchQueryBuilder = QueryBuilders.matchQuery(field, text);
        //
        //设置高亮三要素                                    field: 你的高亮字段    // preTags ：前缀    // postTags：后缀
        HighlightBuilder highlightBuilder = new HighlightBuilder().field(field).preTags(preTags).postTags(postTags);
        //创建查询条件构建器SearchSourceBuilder(对应ES外面的大括号)
        NativeSearchQuery nativeSearchQuery = new NativeSearchQueryBuilder().withQuery(matchQueryBuilder).withHighlightBuilder(highlightBuilder).build();
        //查询,获取查询结果
        SearchHits<T> search = elasticsearchRestTemplate.search(nativeSearchQuery, classType);
        //获取总记录数
        long totalHits = search.getTotalHits();
        //获取值返回
        return search.getSearchHits().stream().map(searchHit -> {
            //获得结果实体
            T content = searchHit.getContent();
            //所有高亮结果
            Map<String, List<String>> highlightFields = searchHit.getHighlightFields();
            //遍历高亮结果
            for (Map.Entry<String, List<String>> stringListEntry : highlightFields.entrySet()) {
                String key = stringListEntry.getKey();
                //获取实体反射类
                Class<?> aClass = content.getClass();
                try {
                    //获取该实体属性
                    Field declaredField = aClass.getDeclaredField(key);
                    //权限为私的 解除！
                    declaredField.setAccessible(true);
                    //替换，把高亮字段替换到这个实体对应的属性值上
                    declaredField.set(content, stringListEntry.getValue().get(0));
                } catch (NoSuchFieldException | IllegalAccessException e) {
                    e.printStackTrace();
                }
            }
            return content;
        }).collect(Collectors.toList());
    }


 @Test
    public void highlightBuilder() {
        List<Teacher> teacherList = elasticsearchSelectController.highlightBuilder(
                "tAddress",
                "<font color='red'>",
                "</font>",
                "山东省高新区",
                Teacher.class);
    teacherList.forEach(System.err::println);
    }
```

#### 聚合查询

> - AggregationBuilders.max(String name).field(String field) : 最大值(max)
> - AggregationBuilders.min(String name).field(String field) : 最小值(min)
> - AggregationBuilders.avg(String name).field(String field) : 平均值(avg)
> - AggregationBuilders.terms(String name).field(String field) : 分组(group by)
> - AggregationBuilders.sum(String name).field(String field) : 总数(sum)

```java
/**
     * @param name      : es里索引的域(字段名)
     * @param classType : 返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     * @param values    : 一域多值, 查询的值
     * @return java.util.List<T>
     * @explain : 聚合对数据进行分组的求和，求数，最大值，最小值，或者其它的自定义的统计功能，
     * //            es对聚合有着不错的支持，需要注意的是，在对某字段进行聚合之后，需要开启这个字段的fielddata
     * //            不要对text类型的数据进行分组,会失败
     */

    public <T> List<T> aggregationBuilder(String name, Class<T> classType, String... values) {
        //构建termsQueryBuilder(词条查询：对应ES query里的terms)不分词查询
        TermsQueryBuilder termsQueryBuilder = QueryBuilders.termsQuery(name, values);

        //最大值(max)
        MaxAggregationBuilder maxAggregationBuilder = AggregationBuilders.max("maxAge").field("tAge");
        //最小值(min)
        MinAggregationBuilder minAggregationBuilder = AggregationBuilders.min("minAge").field("tAge");
        //平均值(avg)
        AvgAggregationBuilder avgAggregationBuilder = AggregationBuilders.avg("avgAge").field("tAge");
        //分组(group by)
        TermsAggregationBuilder termsAggregationBuilder = AggregationBuilders.terms("termClassName").field("tClassName");
        //总数(sum)
        SumAggregationBuilder sumAggregationBuilder = AggregationBuilders.sum("sumAge").field("tAge");
        //创建查询条件构建器SearchSourceBuilder(对应ES外面的大括号)
        NativeSearchQuery nativeSearchQuery = new NativeSearchQueryBuilder().withQuery(termsQueryBuilder).
                //聚合最大值
                        addAggregation(maxAggregationBuilder).
                //聚合最小直
                        addAggregation(minAggregationBuilder).
                //聚合平均值
                        addAggregation(avgAggregationBuilder).
                //聚合总值
                        addAggregation(sumAggregationBuilder).
                //分组后聚合  各组的最大值和各组的总和
                        addAggregation(termsAggregationBuilder.subAggregation(maxAggregationBuilder).subAggregation(sumAggregationBuilder)).
                        build();

        //查询,获取查询结果
        SearchHits<T> search = elasticsearchRestTemplate.search(nativeSearchQuery, classType);
        //获取总记录数
        long totalHits = search.getTotalHits();
        for (Aggregation aggregation : Objects.requireNonNull(search.getAggregations())) {
            //查询结果中的总和
            Sum sum = aggregation instanceof Sum ? ((Sum) aggregation) : null;
            Optional.ofNullable(sum).ifPresent(s -> System.err.println(aggregation.getName() + ":" + s.getValue()));
            //查询结果中的最大值
            Max max = aggregation instanceof Max ? ((Max) aggregation) : null;
            Optional.ofNullable(max).ifPresent(s -> System.err.println(aggregation.getName() + ":" + s.getValue()));
            //查询结果中的最小值
            Min min = aggregation instanceof Min ? ((Min) aggregation) : null;
            Optional.ofNullable(min).ifPresent(s -> System.err.println(aggregation.getName() + ":" + s.getValue()));
            //查询结果中的平均值
            Avg avg = aggregation instanceof Avg ? ((Avg) aggregation) : null;
            Optional.ofNullable(avg).ifPresent(s -> System.err.println(aggregation.getName() + ":" + s.getValue()));
            //分组后查询结果
            Terms terms = aggregation instanceof Terms ? (Terms) aggregation : null;
            Optional.ofNullable(terms).ifPresent(s -> System.err.println(aggregation.getName() + ":" + s.getBuckets()));
        }
        //获取值返回
        return search.getSearchHits().stream().map(SearchHit::getContent).collect(Collectors.toList());
    }
```

#### 搜索补全

```java
/**
     * 速度要快  输入的内容立即返回  对字段类型要求多节省存储空间  时间复杂度O(1)，做建议不做纠错
     * 感觉和prefixQuery 前缀查询 差不多.....
     * <p>
     * 搜索补全必须定义 这个属性(
     * //                  @CompletionField(analyzer = "ik_smart", searchAnalyzer = "ik_smart", maxInputLength = 100)
     * //                  private Completion completion;)
     * //      给Completion属性赋值: new Completion(new String[]{"山东省泰安市岱岳区"}))
     * //                  :里面的值就是被自动补全的值
     *
     * @param fieldName : 要用哪个字段进行标题联想(必须是这个@CompletionField注解所标注的类型为Completion的字段名)
     * @param text      : 被补全的值(比如传的是山东 可能就能给补全为 山东省)
     * @param classType : 返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     * @return java.util.List<java.lang.String>
     * @explain : 搜索补全功能 比如在输入框输入(天上)下面就自动补全 (天上人间)(天上边的彩霞)(....)
     */
    public List<String> completionSuggestion(String fieldName, String text, Class<?> classType) {
        //定义反参容器
        List<String> stringList = new ArrayList<>();
        //构建搜索建议补全对象
        CompletionSuggestionBuilder completionSuggestionBuilder = SuggestBuilders.
                completionSuggestion(fieldName). // 使用fieldName入参进行标题联想(这里就是索引被@CompletionField注解标注的字段)
                prefix(text).       // 关键字（参数传此）
                skipDuplicates(true)// 重复过滤
                //.size(100)       // 匹配数量
                ;
        //创建搜索提示对象 进行封装搜索补全
        SuggestBuilder suggestBuilder = new SuggestBuilder();
        //  completionSuggestionBuilder:随便起的搜索补全的名字
        suggestBuilder.addSuggestion("completionSuggestionBuilder", completionSuggestionBuilder);
        //查询es并反参
        SearchResponse searchResponse = elasticsearchRestTemplate.suggest(suggestBuilder, elasticsearchRestTemplate.getIndexCoordinatesFor(classType));
        //获取反参中的搜索补全结果
        Suggest.Suggestion<? extends Suggest.Suggestion.Entry<? extends Suggest.Suggestion.Entry.Option>> suggestionBuilder = searchResponse.getSuggest().getSuggestion("completionSuggestionBuilder");

        // 处理返回
        List<String> suggests = suggestionBuilder.getEntries().stream().map(x -> x.getOptions().stream().map(y -> y.getText().toString()).collect(Collectors.toList())).findFirst().get();
        // 将搜索补全内容保存到容器返回
        for (String suggest : suggests) {
            stringList.add(suggest);
            System.err.println("suggest = " + suggest);
        }
        return stringList;
    }
```

#### 纠错补全

```java
/**
     * https://www.cnblogs.com/Alexephor/p/11408446.html(Elasticsearch之建议器suggester)写的很详细
     * 词条建议器（term suggester）对用户搜索的内容做纠正帮助用户搜索到精确度高的关键字
     *
     * @param fieldName : 从fieldName字段中获取候选建议的字段。这是一个必需的选项，需要全局设置或根据建议设置。Keyword字段
     * @param text      : 建议文本，建议文本是必需的选项，可以通过全局（多个建议器中查询相同的内容）或者按照单个建议器的格式来。
     * @param classType : 返回的list里的对象并且通过对象里面@Document注解indexName属性获取查询哪个索引
     * @return java.util.List<java.lang.String>
     * @explain :　词条建议器（term suggester）主要做纠正 但是是短语就不能做了(Keyword字段)
     * //                 用在查询用户中心查询人名上
     * //                  例如：查询 孟浩号 而在字段中是孟浩浩 则就建议返回了 孟浩浩
     */

    public List<String> termSuggestion(String fieldName, String text, Class<?> classType) {
        //定义反参容器
        List<String> stringList = new ArrayList<>();
//        构建纠正词条对象  词条建议器(只要是词,短的 比如姓名)
        TermSuggestionBuilder termSuggestionBuilder = SuggestBuilders.termSuggestion(fieldName).text(text);
/*        termSuggestionBuilder.suggestMode(TermSuggestionBuilder.SuggestMode.ALWAYS);/*建议模式（控制提供建议词的方式）：
                                                                                           1. missing：默认方式，仅在‘要搜索词项’不在索引中存在时，才提供建议词；
                                                                                           2. popular：仅提供频率比‘要搜索词项’高的建议词；
                                                                                           3. always：总是提供建议词；*/

        termSuggestionBuilder.sort(SortBy.SCORE);   /*建议词的排序方式：
                                                        1. score：先按评分排序，再按文档频率、term顺序排；
                                                        2. frequency：先按文档频率排序，再按评分、term顺序排*/

        //创建搜索提示对象 进行封装词条纠正
        SuggestBuilder suggestBuilder = new SuggestBuilder();
        //  termSuggestionBuilder:随便起的搜索补全的名字(后面会用到)
        suggestBuilder.addSuggestion("termSuggestionBuilder", termSuggestionBuilder);
        //查询,获取查询结果
        SearchResponse searchResponse = elasticsearchRestTemplate.suggest(suggestBuilder, IndexCoordinates.of(classType.getAnnotation(Document.class).indexName()));
        //获取反参中的词条纠正结果
        Suggest.Suggestion<? extends Suggest.Suggestion.Entry<? extends Suggest.Suggestion.Entry.Option>> suggestionBuilder = searchResponse.getSuggest().getSuggestion("termSuggestionBuilder");

        // 处理返回
        List<String> suggests = suggestionBuilder.getEntries().stream().map(x -> x.getOptions().stream().map(y -> y.getText().toString()).collect(Collectors.toList())).findFirst().get();

        // 将词条纠正内容保存到容器返回
        for (String suggest : suggests) {
            stringList.add(suggest);
            System.err.println("suggest = " + suggest);
        }

        return stringList;
    }
```

