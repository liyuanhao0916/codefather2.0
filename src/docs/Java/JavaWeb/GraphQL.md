# GraphQL

## 入门

### 查询与变更

#### 简介

GraphQL 是由 Facebook 创造的用于描述复杂数据模型的一种查询语言。这里查询语言所指的并不是常规意义上
的类似 sql 语句的查询语言，而是一种用于前后端数据查询方式的规范。
官网（中文）：https://graphql.cn/
规范地址：http://spec.graphql.cn/



#### 查询的字段

> 查询和其结果拥有几乎一样的结构。这是 GraphQL 最重要的特性，因为这样一来，你就总是能得到你想要的数据，而服务器也准确地知道客户端请求的字段

```graphql
{
  hero {
  	id
    name
    # 查询可以有备注！
    friends {
      name
    }
  }
}
```

结果

```json
{
  "data": {
    "hero": {
      "id": "2001",
      "name": "R2-D2",
      "friends": [
        {
          "name": "Luke Skywalker"
        },
        {
          "name": "Han Solo"
        }
      ]
    }
  }
}
```

#### 查询的参数

```graphql
{
  human(id: "1000") {
    name
    height
  }
}
```

结果

```json
{
  "data": {
    "human": {
      "name": "Luke Skywalker",
      "height": 1.72
    }
  }
}
```

> 在类似 REST 的系统中，你只能传递一组简单参数 —— 请求中的 query 参数和 URL 段。但是在 GraphQL 中，每一个字段和嵌套对象都能有自己的一组参数，从而使得 GraphQL 可以完美替代多次 API 获取请求。甚至你也可以给 标量（scalar）字段传递参数，用于实现服务端的一次转换，而不用每个客户端分别转换

```graphql
{
  human(id: "1000") {
    name
    height(unit: FOOT)
  }
}
```

结果

```json
{
  "data": {
    "human": {
      "name": "Luke Skywalker",
      "height": 5.6430448
    }
  }
}
```

参数可以是多种不同的类型。上面例子中，我们使用了一个枚举类型，其代表了一个有限选项集合（本例中为长度单位，即是 `METER` 或者 `FOOT`）。GraphQL 自带一套默认类型，但是 GraphQL 服务器可以声明一套自己的定制类型，只要能序列化成你的传输格式即可。



#### 查询的别名

不同参数但是查询相同字段，如：想要查询A的信息又想查询B的信息，用rest方式请求在不改变后端接口的情况下只能发送两个请求，但是graphql只需要一个请求

由于响应的字段完全相同，就需要给相同的结构起别名

```graphql
{
  empireHero: hero(episode: EMPIRE) {
    name
  }
  jediHero: hero(episode: JEDI) {
    name
  }
}
```

结果

```json
{
  "data": {
    "empireHero": {
      "name": "Luke Skywalker"
    },
    "jediHero": {
      "name": "R2-D2"
    }
  }
}
```

#### 查询的片段

类似mybatis的sql片段，重复使用

- 定义：fragment 片段名 on 接口、抽象类型或具体对象类型
- 引用：...片段名

```graphql
{
  leftComparison: hero(episode: EMPIRE) {
    ...comparisonFields
  }
  rightComparison: hero(episode: JEDI) {
    ...comparisonFields
  }
}

# 这里定义了一个片段
fragment comparisonFields on Character {
  name
  appearsIn
  friends {
    name
  }
}
```

结果

```json
{
  "data": {
    "leftComparison": {
      "name": "Luke Skywalker",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "friends": [
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        }
      ]
    },
    "rightComparison": {
      "name": "R2-D2",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "friends": [
        {
          "name": "Luke Skywalker"
        }
      ]
    }
  }
}
```

#### 操作与操作名称

**操作类型**：可以是 *query - 查询*、*mutation - 变更* 或 *subscription - 订阅*

- 查询时query可省略

- 其实query也可进行修改

**操作名称**：仅在有多个操作时是必需的，但最好有，方便阅读

```graphql
query getUser {
  user {
    id
    name
  }
}

mutation createUser {
  createUser(input: { name: "John", age: 25 }) {
    id
    name
    age
  }
}
```



#### 查询的变量

上面所示的参数是写死的，但实际开发，我们想传动态的，这个动态值就是变量

- 使用 `$variableName` 替代查询中的静态值
  - 变量前缀必须为 `$`，后跟其类型，本例中为 `Episode`
  - 所有声明的变量都必须是标量、枚举型或者输入对象类型
  - 如果想要传递一个复杂对象到一个字段上，你必须知道服务器上其匹配的类型
- 声明 `$variableName` 为查询接受的变量之一
- 将 `variableName: value` 通常通过json传入

```graphql
# { "graphql": true, "variables": { "episode": JEDI } }
query HeroNameAndFriends($episode: Episode) {
  hero(episode: $episode) {
    name
    friends {
      name
    }
  }
}
```

这样一来，我们的客户端代码就只需要传入不同的变量，而不用构建一个全新的查询了

**默认变量**

```graphql
query HeroNameAndFriends($episode: Episode = "JEDI") {
  hero(episode: $episode) {
    name
    friends {
      name
    }
  }
}
```

#### 查询的指令

动态改变查询的结构：比如一个组件需要概括视图和详情视图

```graphql
## 变量值为
## {
##   "episode": "JEDI",
##   "withFriends": false
## }

query Hero($episode: Episode, $withFriends: Boolean!) {
  hero(episode: $episode) {
    name
    friends @include(if: $withFriends) {
      name
    }
  }
}
```

- `@include(if: Boolean)` 仅在参数为 `true` 时，包含此字段
- `@skip(if: Boolean)` 如果参数为 `true`，跳过此字段。

服务端实现也可以定义新的指令来添加新的特性

#### 变更

rest约定不要用get改数据，但是也可以改，只是不建议

graphql也一样，变更时使用 mutations

```graphql
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}
```

变量为

```json
{
  "ep": "JEDI",
  "review": {
    "stars": 5,
    "commentary": "This is a great movie!"
  }
}
```

结果为

```json
{
  "data": {
    "createReview": {
      "stars": 5,
      "commentary": "This is a great movie!"
    }
  }
}
```

查询和变更之间名称之外的一个重要区别是：

- **查询字段时，是并行执行，而变更字段时，是线性执行，一个接着一个。**

- 这意味着如果我们一个请求中发送了两个 `incrementCredits` 变更，第一个保证在第二个之前执行，以确保我们不会出现竞态。

#### 内联片段

跟许多类型系统一样，GraphQL schema 也具备定义接口和联合类型的能力

如果你查询的字段返回的是接口或者联合类型，那么你可能需要使用**内联片段**来取出下层具体类型的数据：

```graphql
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    name
    ... on Droid {
      primaryFunction
    }
    ... on Human {
      height
    }
  }
}
```

参数

```json
{
  "ep": "JEDI"
}
```

结果

```json
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "primaryFunction": "Astromech"
    }
  }
}
```

这个查询中，`hero` 字段返回 `Character` 类型，取决于 `episode` 参数，其可能是 `Human` 或者 `Droid` 类型。在直接选择的情况下，你只能请求 `Character` 上存在的字段，譬如 `name`。

如果要请求具体类型上的字段，你需要使用一个类型条件**内联片段**。因为第一个片段标注为 `... on Droid`，`primaryFunction` 仅在 `hero` 返回的 `Character` 为 `Droid` 类型时才会执行。同理适用于 `Human` 类型的 `height` 字段。

具名片段也可以用于同样的情况，因为具名片段总是附带了一个类型。

#### 元字段（Meta fields）

某些情况下，你并不知道你将从 GraphQL 服务获得什么类型，这时候你就需要一些方法在客户端来决定如何处理这些数据。GraphQL 允许你在查询的任何位置请求 `__typename`，一个元字段，以获得那个位置的对象类型名称。

```graphql
{
  search(text: "an") {
    __typename
    ... on Human {
      name
    }
    ... on Droid {
      name
    }
    ... on Starship {
      name
    }
  }
}
```

结果

```json
{
  "data": {
    "search": [
      {
        "__typename": "Human",
        "name": "Leia Organa"
      },
      {
        "__typename": "Starship",
        "name": "TIE Advanced x1"
      }
    ]
  }
}
```

### GraphQL schema

schema是规范，与查询语言结构相似，为了和各种语言后端沟通而定义的语言

#### 对象类型和字段

```graphql
type Character {
  name: String!
  appearsIn: [Episode!]!
}
```

- Character 是定义的类型，包含了两个字段
- `String` 是内置的**标量**类型之一，`!`表示非空
- `[Episode!]!` 表示一个 `Episode` **数组**

#### 参数

每一个字段都可能有零个或者多个参数，例如下面的 `length` 字段：

```graphql
type Starship {
  id: ID!
  name: String!
  length(unit: LengthUnit = METER): Float
}
```

- 所有参数都是具名的，不像 JavaScript 或者 Python 之类的语言，函数接受一个有序参数列表，而在 GraphQL 中，**所有参数必须具名传递**
- 当一个参数是可选的，我们可以定义一个**默认值** —— 如果 `unit` 参数没有传递，那么它将会被默认设置为 `METER`

#### 查询和变更类型

大部分的类型都是普通对象类型，但是一个 schema 内有两个特殊类型：

- `query` 类型
-  `mutation` 类型

这两个类型和常规对象类型无差，但是它们之所以特殊，是因为它们定义了每一个 GraphQL 查询的**入口**。因此如果你看到一个像这样的查询：

```graphql
query {
  hero {
    name
  }
  droid(id: "2000") {
    name
  }
}
```

表示这个 GraphQL 服务需要一个 `Query` 类型，且其上有 `hero` 和 `droid` 字段：

```graphql
type Query {
  hero(episode: Episode): Character
  droid(id: ID!): Droid
}
```

除了作为 schema 的入口，`Query` 和 `Mutation` 类型与其它 GraphQL 对象类型别无二致，它们的字段也是一样的工作方式。

#### 标量类型（Scalar Types）

GraphQL 自带一组默认标量类型：

- `Int`：有符号 32 位整数。
- `Float`：有符号双精度浮点值。
- `String`：UTF‐8 字符序列。
- `Boolean`：`true` 或者 `false`。
- `ID`：ID 标量类型表示一个唯一标识符，ID 类型使用和 String 一样的方式序列化；然而将其定义为 ID 意味着并不需要人类可读型

大部分的 GraphQL 服务实现中，都有自定义标量类型的方式。例如，我们可以定义一个 `Date` 类型：

```graphql
scalar Date
```

然后就取决于我们的实现中如何定义将其序列化、反序列化和验证。例如，你可以指定 `Date` 类型应该总是被序列化成整型时间戳，而客户端应该知道去要求任何 date 字段都是这个格式。

#### 枚举类型（enum）

```graphql
enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}
```

#### 列表和非空

> **对象类型、标量以及枚举是 GraphQL 中你唯一可以定义的类型种类**

可以给它们应用额外的**类型修饰符**来影响这些值的验证

用`!`标记非空

```graphql
query DroidById($id: ID!) {
  droid(id: $id) {
    name
  }
}
```

参数

```json
{
	"id": null
}
```

结果

```json
{
  "errors": [
    {
      "message": "Variable \"$id\" of non-null type \"ID!\" must not be null.",
      "locations": [
        {
          "line": 1,
          "column": 17
        }
      ]
    }
  ]
}
```

列表的运作方式也类似：在 GraphQL schema 语言中，将类型包在方括号（`[` 和 `]`）中的方式来标记列表

组合使用：`myField: [String!]`表示**数组本身**可以为空，但是其不能有任何空值成员

```js
myField: null // 有效
myField: [] // 有效
myField: ['a', 'b'] // 有效
myField: ['a', null, 'b'] // 错误
```

#### 接口

一个**接口**是一个抽象类型，它包含某些字段，而对象类型必须包含这些字段，才能算实现了这个接口

例如，用一个 `Character` 接口用以表示《星球大战》三部曲中的任何角色：

```graphql
interface Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
}
```

这意味着任何**实现** `Character` 的类型都要具有这些字段，并有对应参数和返回类型。

例如，这里有一些可能实现了 `Character` 的类型：

```graphql
type Human implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  starships: [Starship]
  totalCredits: Int
}
 
type Droid implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  primaryFunction: String
}
```

可见这两个类型都具备 `Character` 接口的所有字段，但也引入了其他的字段 `totalCredits`、`starships` 和 `primaryFunction`，这都属于特定的类型的角色。

当你要返回一个对象或者一组对象，特别是一组不同的类型时，接口就显得特别有用。

注意下面例子的查询会产生错误：

```
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    name
    primaryFunction
  }
}
```

参数

```json
{
  "ep": "JEDI"
}
```

结果

```json
{
  "errors": [
    {
      "message": "Cannot query field \"primaryFunction\" on type \"Character\". Did you mean to use an inline fragment on \"Droid\"?",
      "locations": [
        {
          "line": 4,
          "column": 5
        }
      ]
    }
  ]
}
```

`hero` 字段返回 `Character` 类型，取决于 `episode` 参数，它可能是 `Human` 或者 `Droid` 类型。上面的查询中，你只能查询 `Character` 接口中存在的字段，而其中并不包含 `primaryFunction`。

如果要查询一个只存在于特定对象类型上的字段，你需要使用内联片段：

```graphql
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    name
    ... on Droid {
      primaryFunction
    }
  }
}
```

参数

```json
{
  "ep": "JEDI"
}
```

结果

```json
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "primaryFunction": "Astromech"
    }
  }
}
```

#### 联合类型

联合类型和接口十分相似，但是它并不指定类型之间的任何共同字段

```graphql
union SearchResult = Human | Droid | Starship
```

- 任何返回一个 `SearchResult` 类型的地方，都可能得到一个 `Human`、`Droid` 或者 `Starship`。

> 注意，联合类型的成员需要是具体对象类型；
>
> 不能使用接口或者其他联合类型来创造一个联合类型。

如果你需要查询一个返回 `SearchResult` 联合类型的字段，那么你得使用内联片段才能查询任意字段。

```graphql
{
  search(text: "an") {
    __typename
    ... on Human {
      name
      height
    }
    ... on Droid {
      name
      primaryFunction
    }
    ... on Starship {
      name
      length
    }
  }
}
```

结果

```json
{
  "data": {
    "search": [
      {
        "__typename": "Human",
        "name": "Han Solo",
        "height": 1.8
      },
      {
        "__typename": "Human",
        "name": "Leia Organa",
        "height": 1.5
      },
      {
        "__typename": "Starship",
        "name": "TIE Advanced x1",
        "length": 9.2
      }
    ]
  }
}
```

由于 `Human` 和 `Droid` 共享一个公共接口（`Character`），你可以在一个地方查询它们的公共字段，而不必在多个类型中重复相同的字段：

```graphql
{
  search(text: "an") {
    __typename
    ... on Character {
      name
    }
    ... on Human {
      height
    }
    ... on Droid {
      primaryFunction
    }
    ... on Starship {
      name
      length
    }
  }
}
```

注意 `name` 仍然需要指定在 `Starship` 上，否则它不会出现在结果中，因为 `Starship` 并不是一个 `Character`！

#### 输入类型

在变更（mutation）时需要传递一整个对象作为新建对象。在 GraphQL schema language 中，输入对象看上去和常规对象一模一样，除了关键字是 `input` 而不是 `type`：

```graphql
input ReviewInput {
  stars: Int!
  commentary: String
}
```

使用

```graphql
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}
```

参数

```json
{
  "ep": "JEDI",
  "review": {
    "stars": 5,
    "commentary": "This is a great movie!"
  }
}
```

## 最佳实践

### HTTP请求

#### URI与路由

- REST 使用“资源”作为其核心概念

- GraphQL 的概念模型是一个实体图。因此，GraphQL 中的实体无法通过 URL 识别

- 相反，GraphQL 服务器在单个 URL /入口端点（通常是 `/graphql`）上运行，并且所有提供服务的 GraphQL 请求都应被导向此入口端点。

#### GET请求

如下查询

```graphql
{
  me {
    name
  }
}
```

请求

```http
http://myapi/graphql?query={me{name}}
```

#### POST请求

标准的 GraphQL POST 请求应当使用 `application/json` 内容类型（content type），并包含以下形式 JSON 编码的请求体：

```json
{
  "query": "...",
  "operationName": "...",
  "variables": { "myVariable": "someValue", ... }
}
```

- `operationName` （操作名称）和 `variables`（变量） 是可选字段。

- 仅当查询中存在多个操作时才需要 `operationName` 。

#### 响应

```json
{
  "data": { ... },
  "errors": [ ... ]
}
```

#### GraphiQL

GraphiQL 在测试和开发过程中非常有用，但在生产环境下应当默认被禁用。如果你使用的是 express-graphql，可以根据 NODE_ENV 环境变量进行切换：

```js
app.use('/graphql', graphqlHTTP({
  schema: MySessionAwareGraphQLSchema,
  graphiql: process.env.NODE_ENV === 'development',
}));
```

#### Node

如果你正在使用 NodeJS，我们推荐使用 [express-graphql](https://github.com/graphql/express-graphql) 或 [apollo-server](https://github.com/apollographql/apollo-server)。

### java

#### graphql-java

[GraphQL Java](https://www.graphql-java.com/)是 GraphQL 的 Java（服务器）实现。GraphQL Java Github 组织中有多个存储库。最重要的是[GraphQL Java 引擎](https://github.com/graphql-java/graphql-java)，它是其他一切的基础。

GraphQL Java 引擎只关心执行查询。它不涉及任何 HTTP 或 JSON 相关主题。

对于这些方面，我们将使用[Spring for GraphQL](https://docs.spring.io/spring-graphql/docs/current/reference/html/)，它负责通过 HTTP 上的 Spring Boot 公开我们的 API。

##### hello world

**依赖**

```xml
<dependency>
    <groupId>com.graphql-java</groupId>
    <artifactId>graphql-java</artifactId>
    <version>20.6</version>
</dependency>
```

**hello world**

```java
import graphql.ExecutionResult;
import graphql.GraphQL;
import graphql.schema.GraphQLSchema;
import graphql.schema.StaticDataFetcher;
import graphql.schema.idl.RuntimeWiring;
import graphql.schema.idl.SchemaGenerator;
import graphql.schema.idl.SchemaParser;
import graphql.schema.idl.TypeDefinitionRegistry;

import static graphql.schema.idl.RuntimeWiring.newRuntimeWiring;

public class HelloWorld {

    public static void main(String[] args) {
        
        // 响应结果的规范
        String schema = "type Query{hello: String}";
        SchemaParser schemaParser = new SchemaParser();
        TypeDefinitionRegistry typeDefinitionRegistry = schemaParser.parse(schema);

        // 业务处理的逻辑
        RuntimeWiring runtimeWiring = newRuntimeWiring()
                .type("Query", builder -> builder.dataFetcher("hello", new StaticDataFetcher("world")))
                .build();

        // 添加到 schema
        SchemaGenerator schemaGenerator = new SchemaGenerator();
        GraphQLSchema graphQLSchema = schemaGenerator.makeExecutableSchema(typeDefinitionRegistry, runtimeWiring);

        // 构建 GraphQL 并执行
        GraphQL build = GraphQL.newGraphQL(graphQLSchema).build();
        ExecutionResult executionResult = build.execute("{hello}");

        System.out.println(executionResult.getData().toString());
        // Prints: {hello=world}
    }
}
```

##### SDL

创建在`resource`目录下场景`/graphql/schema.graphqls`规范文件

```graphql
schema {
    query:Query
}

type Query{
    bookById(id: ID): Book
    HouseResources(id:Int):HouseResources
}
type HouseResources{
    id:Int!
    title:String
    houseDesc:String
    contact:String
}
type Book {
    id: ID
    name: String
    pageCount: Int
}
```

##### 实体

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HouseResources {
    private Integer id;
    private String title;
    private String houseDesc;
    private String contact;
    
    private static List<HouseResources> houseResourcesList = Arrays.asList(
            new HouseResources(1,"author-1", "Joanne", "Rowling"),
            new HouseResources(2,"author-2", "Herman", "Melville"),
            new HouseResources(3,"author-3", "Anne", "Rice")
    );
    public static HouseResources getById(Integer id) {
        return houseResourcesList.stream().filter(houseResources -> houseResources.getId().equals(id)).findFirst().orElse(null);
    }
}
```

##### 整合Spring

```java
@Component
public class GraphQLConfig {

    private GraphQL graphQL;

    @PostConstruct
    public void init() throws IOException {
        File file = ResourceUtils.getFile("classpath:graphql/schema.graphqls");
        GraphQLSchema graphQLSchema = buildSchema(file);
        this.graphQL = GraphQL.newGraphQL(graphQLSchema).build();
    }

    private GraphQLSchema buildSchema(File file) {
        TypeDefinitionRegistry typeRegistry = new SchemaParser().parse(file);
        RuntimeWiring runtimeWiring = buildWiring();
        SchemaGenerator schemaGenerator = new SchemaGenerator();
        return schemaGenerator.makeExecutableSchema(typeRegistry, runtimeWiring);
    }

    private RuntimeWiring buildWiring() {
        return RuntimeWiring.newRuntimeWiring()
                .type("Query", builder ->
                        builder.dataFetcher("HouseResources",
                                environment -> {
                                    Integer id = environment.getArgument("id");
                                    return HouseResources.getById(id);
                                }
                        ))
                .type("Query", builder -> builder.dataFetcher("bookById", environment -> {
                    String id = environment.getArgument("id");
                    return Book.getById(id);
                }))
                .build();
    }

    @Bean
    public GraphQL graphQL() {
        return graphQL;
    }
}
```

##### Controller

```java
@RequestMapping("graphql")
@Controller
public class GraphQLController {
    @Autowired
    private GraphQL graphQL;

    @GetMapping
    @ResponseBody
    public Map<String, Object> graphql(@RequestParam("query") String query) throws
            IOException {
        return this.graphQL.execute(query).toSpecification();
    }
}
```

##### 改进

现在业务逻辑都在 `GraphQLConfig`，难以维护

- 定义`MyDataFetcher`接口，所有查询都实现这个接口
- 在`GraphQLConfig`中使用接口处理
- 业务查询接口增加只需添加实现类即可

也就是增加了Service层

```java
public interface MyDataFetcher {
    // 查询名称
    String fieldName();

    // 具体实现数据查询的逻辑
    Object dataFetcher(DataFetchingEnvironment environment);
}
```

```java
@Service
public class HouseResourcesDataFetcher implements MyDataFetcher {
    
    @Override
    public String fieldName() {
        return "HouseResources";
    }
    
    // 实际情况这里接入 dao 层或其他 service 层实现业务查询
    @Override
    public Object dataFetcher(DataFetchingEnvironment environment) {
        Integer id = environment.getArgument("id");
        return HouseResources.getById(id);
    }
}
```

配置类

```java
@Component
public class GraphQLConfig {

    private GraphQL graphQL;

    //注入容器中所有的MyDataFetcher实现类
    @Autowired
    private List<MyDataFetcher> myDataFetchers;

    @PostConstruct
    public void init() throws IOException {
        File file = ResourceUtils.getFile("classpath:graphql/schema.graphqls");
        GraphQLSchema graphQLSchema = buildSchema(file);
        this.graphQL = GraphQL.newGraphQL(graphQLSchema).build();
    }

    private GraphQLSchema buildSchema(File file) {
        TypeDefinitionRegistry typeRegistry = new SchemaParser().parse(file);
        RuntimeWiring runtimeWiring = buildWiring();
        SchemaGenerator schemaGenerator = new SchemaGenerator();
        return schemaGenerator.makeExecutableSchema(typeRegistry, runtimeWiring);
    }

    private RuntimeWiring buildWiring() {
        return RuntimeWiring.newRuntimeWiring()
                .type("Query", builder -> {
                    for (MyDataFetcher myDataFetcher : myDataFetchers) {
                        builder.dataFetcher(myDataFetcher.fieldName(), myDataFetcher::dataFetcher);
                    }
                    return builder;
                })
                .build();
    }

    @Bean
    public GraphQL graphQL() {
        return graphQL;
    }
}
```

#### graphql-java-tools

##### 依赖

```xml
<dependency>
    <groupId>com.graphql-java</groupId>
    <artifactId>graphql-spring-boot-starter</artifactId>
    <version>5.0.2</version>
</dependency>
<dependency>
    <groupId>com.graphql-java</groupId>
    <artifactId>graphiql-spring-boot-starter</artifactId>
    <version>5.0.2</version>
</dependency>
<dependency>
    <groupId>com.graphql-java</groupId>
    <artifactId>graphql-java-tools</artifactId>
    <version>5.2.4</version>
</dependency>
```

##### SDL

创建在`resource`目录下场景`/graphql/schema.graphqls`规范文件

```graphql
schema {
	query:Query
}

type Query {
	hello:String
	hi:String
}
```

##### 解析器

```java
@Service
public class Query implements GraphQLQueryResolver {
    
    public String hello(){
        return "Hello world";
    }
    public String hi(){
        return "hello,I'm Li!";
    }   
}
```

##### 测试

- graphiql

  - 访问 http://localhost:8080/graphiql

  - 请求

    ```graphql
    query{
    	hello
    	hi
    }
    ```

  - 响应

    ```json
    {
        "data": {
            "hello": "Hello world",
            "hi": "hello,I'm Li!"
        }
    }
    ```

- postman 发送post请求

##### 参数

```graphql
schema {
    query:Query
}

type Query{
    hello:String!
    hi:String
    allLinks:[Link]
    getLinkById(id:Long):Link
}

type Link{
    url:String!
    description:String!
}
```

```java
@Service
public class Query implements GraphQLQueryResolver {
    
    public String hello(){
        return "Hello world";
    }
     public Link getLinkById(Long id){
        return linkRepository.getLinkById(id);
    }  
}
```

```graphql
query {
  getLinkById(id:1){
    url
    description
  }
}
```

##### 变更

**SDL**

```graphql
schema {
    query:Query
    mutation: Mutation
}

type Query{
    hello:String!
    hi:String
    allLinks:[Link]
    getLinkById(id:Long):Link
}

type Mutation{
    createLink(link:LinkDTO): [Link]
}

input LinkDTO{
    id:ID!
    url:String!
    description:String!
}
type Link{
    id:ID!
    url:String!
    description:String!
}
```

**解析器**

- query的解析器

```java
@Service
public class Query implements GraphQLQueryResolver {

    @Autowired
    private LinkRepository linkRepository;

    public String hello() {
        return "Hello world";
    }

    public String hi() {
        return "hello,I'm Li!";
    }

    public List<Link> allLinks() {
        return linkRepository.getAllLinks();
    }

    public Link getLinkById(Long id) {
        return linkRepository.getLinkById(id);
    }
}
```

- mutation

```java
@Service
public class Mutation implements GraphQLMutationResolver {

    @Autowired
    private LinkRepository linkRepository;
    
    public List<Link> createLink(LinkDTO linkDTO) {
        Link link = new Link();
        BeanUtils.copyProperties(linkDTO,link);
        linkRepository.saveLink(link);
        return linkRepository.getAllLinks();
    }
}
```



#### Spring GraphQL

**spingboot 2.7.x 才支持**

##### 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-graphql</artifactId>
</dependency>
```

##### SDL

```graphql
type Query {
  bookById(id: ID): Book
}

type Book {
  id: ID
  name: String
  pageCount: Int
  author: Author
}

type Author {
  id: ID
  firstName: String
  lastName: String
}
```

##### 实体

```java
public class Book {

    private String id;
    private String name;
    private int pageCount;
    private String authorId;

    public Book(String id, String name, int pageCount, String authorId) {
        this.id = id;
        this.name = name;
        this.pageCount = pageCount;
        this.authorId = authorId;
    }
    
    private static List<Book> books = Arrays.asList(
            new Book("book-1", "Harry Potter and the Philosopher's Stone", 223, "author-1"),
            new Book("book-2", "Moby Dick", 635, "author-2"),
            new Book("book-3", "Interview with the vampire", 371, "author-3")
    );

    public static Book getById(String id) {
        return books.stream().filter(book -> book.getId().equals(id)).findFirst().orElse(null);
    }

    public String getId() {
        return id;
    }

    public String getAuthorId() {
        return authorId;
    }
}
```



```java
public class Author {

    private String id;
    private String firstName;
    private String lastName;

    public Author(String id, String firstName, String lastName) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    private static List<Author> authors = Arrays.asList(
            new Author("author-1", "Joanne", "Rowling"),
            new Author("author-2", "Herman", "Melville"),
            new Author("author-3", "Anne", "Rice")
    );

    public static Author getById(String id) {
        return authors.stream().filter(author -> author.getId().equals(id)).findFirst().orElse(null);
    }

    public String getId() {
        return id;
    }
}
```

##### Controller

```java
@Controller
public class BookController {
    @QueryMapping
    public Book bookById(@Argument String id) {
        return Book.getById(id);
    }

    @SchemaMapping
    public Author author(Book book) {
        return Author.getById(book.getAuthorId());
    }
}
```

##### 配置graphiql

```properties
spring.graphql.graphiql.enabled=true
spring.graphql.graphiql.path=/graphiql
```

##### 测试

访问 http://localhost:8080/graphiql

```graphql
query bookDetails {
  bookById(id: "book-1") {
    id
    name
    pageCount
    author {
      id
      firstName
      lastName
    }
  }
}
```

#### java客户端

这里用了hutool-http工具

```xml
<hutool.version>5.8.6</hutool.version>

<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-http</artifactId>
    <version>${hutool.version}</version>
</dependency>
```



```java
@Test
public void requestGraphQL(){
    String body = "{\"query\":\"query {hello hi}\"}";
    String result= HttpUtil.post("http://localhost:8080/graphql", body);
    System.out.println(result);
}
```





其他客户端包 [nodes](https://github.com/americanexpress/nodes)
