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

