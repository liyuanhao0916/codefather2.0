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