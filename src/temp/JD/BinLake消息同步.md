[文档](https://cf.jd.com/display/DSG/binlake)

## 客户端配置

### 依赖

```xml
<dependency>
  <groupId>com.jd.binlake</groupId>
  <artifactId>binlake-wave.client</artifactId>
  <version>1.0.3_alpha</version>
</dependency>
<dependency>
  <groupId>com.google.protobuf</groupId>
  <artifactId>protobuf-java</artifactId>
  <version>3.1.0</version>
</dependency>
```

>  由于消费客户端使用protobuf 3.1 ，部分业务需要引用protobuf 2.5，如hbase，造成依赖冲突，需要替换
>
> ```xml
> <dependency>
>  <groupId>com.jd.binlake</groupId>
>  <artifactId>binlake-wave.client</artifactId>
>  <version>1.0.3_alpha_pb2.5</version>
> </dependency>
> <dependency>
>  <groupId>com.google.protobuf</groupId>
>  <artifactId>protobuf-java</artifactId>
>  <version>2.5.0</version>
> </dependency>
> ```

### 消息格式

- EntryMessage类继承自JMQ的Message类，新增的变量为从Binlake-wave端生产消息解析后得到的变量，其中包含header、entryType、begin、end、rowChange等
- header为消息头，其中包含文件名、文件偏移量以及数据库变更信息等内容
- entryType为此entry的类型，一共分为TRANSACTIONBEGIN、TRANSACTIONEND以及ROWDATA三种。根据不同的类型，可以获取到相应的begin、end、rowChange三种信息

### 消费代码示例

> JMQ消费消息需实现MessageListener接口，重写onMessage()方法。Binlake Consumer Client提供了MessageDeserialize接口以及JMQMessageDeserialize类，其中的deserialize方法可用于将传入onMessage()的message list进行解析。(JMQ消费使用详见JMQ文档)

#### 消费

```java
@Slf4j
public class OrderMessageListener implements MessageListener {

    // @Autowired
    // private SyncBStoreOrderService syncBStoreOrderService;

    /**
     * BinLake - bean 转换器
     */
    @Autowired
    BinLakeMsgConverter binLakeMsgConverter;

    /**
     * binlake消息解析
     */
    MessageDeserialize deserialize = new JMQMessageDeserialize();

    @Override
    public void onMessage(List<Message> messages) throws Exception {


        try {
            if (messages != null) {
                log.info("########### messages size ###########" + messages.size());
            }

            if (messages == null || messages.isEmpty()) {
                return;
            }
            // 将从JMQ消费者客户端获取的Binlake消费数据进行解析
            List<EntryMessage> entryMessages = deserialize.deserialize(messages);
            // 存储对应操作的集合，最后进行批量处理
            List<OnlineOrder> insertList = null;
            List<OnlineOrder> updateList = null;
            List<OnlineOrder> deleteList = null;
            // 注册格式转换器，用于解析Date等类型
            this.registerConverter();
            // 获取 rowData 信息
            for (EntryMessage entryMessage : entryMessages) {
                //获取数据行消息，分为INSERT、DELETE、UPDATE和其他
                for (WaveEntry.RowData rowData : entryMessage.getRowChange().getRowDatasList()) {
                    // 将列信息转为为实体对象
                    BinLakeMsgConverter.RowDataPair<OnlineOrder> changes = binLakeMsgConverter.getChanges(rowData, OnlineOrder.class);
                    OnlineOrder after = changes.getAfter();
                    // 对应的操作都放到集合中，批量处理
                    switch (entryMessage.getHeader().getEventType()) {
                        case INSERT:
                            if (insertList == null) {
                                insertList = new ArrayList<>();
                            }
                            insertList.add(after);
                            break;
                        case UPDATE:
                            if (updateList == null) {
                                updateList = new ArrayList<>();
                            }
                            // 逻辑删除也是更新操作，看具体是否有逻辑删除字段
                            updateList.add(after);

    /*                        // 逻辑删除
                            if (user.getDelFlag() != null && user.getDelFlag() == 0) {
                                // 有逻辑删除字段 且 未删除，update
                                updateList.add(user);
                            } else if (user.getDelFlag() != null && user.getDelFlag() != 0) {
                                // 有逻辑删除字段 且 删除了，delete
                                if (deleteList == null) {
                                    deleteList = new ArrayList<>();
                                }
                                deleteList.add(user);
                            }*/
                            break;
                        case DELETE:
                            OnlineOrder before = changes.getBefore();
                            if (deleteList == null) {
                                deleteList = new ArrayList<>();
                            }
                            deleteList.add(before);
                            break;
                        default:
                            log.info("Event type is {}", entryMessage.getHeader().getEventType());
                            break;
                    }
                    // 批量操作
                    if (CollectionUtils.isNotEmpty(insertList)) {
                        save(insertList);
                    }
                    if (CollectionUtils.isNotEmpty(updateList)) {
                        update(updateList);
                    }
                    if (CollectionUtils.isNotEmpty(deleteList)) {
                        delete(deleteList);
                    }
                }
            }
        } catch (Exception e) {
            log.error("error message ={}", e.getStackTrace());
        }

    }

    /**
     * 注册格式转换器
     */
    private void registerConverter() {
        binLakeMsgConverter
                .registerConverter((Converter<String, Date>) s -> ParamParse.strToDate(s))
                .registerConverter((Converter<String, Long>) s -> ParamParse.strToLong(s));

    }

    /**
     * 批量删除
     *
     * @param deleteList
     */
    private void delete(List<OnlineOrder> deleteList) {
        try {
            // 批量删除的业务逻辑
            log.info("############# DELETE  OnlineOrder =={}", deleteList);
            // 业务逻辑
            // 业务逻辑
            // 业务逻辑
            // syncBStoreOrderService.deleteAll(deleteList);
        } catch (Exception e) {
            log.error("save es error={}", e.getStackTrace());
        }
    }

    /**
     * 批量更新
     *
     * @param updateList
     */
    private void update(List<OnlineOrder> updateList) {
        try {
            // 批量更新的业务逻辑
            log.info("############# UPDATE  OnlineOrder =={}", updateList);
            // 业务逻辑
            // 业务逻辑
            // 业务逻辑
            // syncBStoreOrderService.updateAll(updateList);
            log.info("updateAll={}");
        } catch (Exception e) {
            log.error("update es error={}", e.getStackTrace());
        }
    }

    /**
     * 批量插入
     *
     * @param insertList
     */
    private void save(List<OnlineOrder> insertList) {
        try {
            // 批量添加的业务逻辑
            log.info("############# INSERT  OnlineOrder =={}", insertList);
            // 业务逻辑
            // 业务逻辑
            // 业务逻辑
            // syncBStoreOrderService.saveAll(insertList);
        } catch (Exception e) {
            log.error("save es error={}", e.getStackTrace());
        }
    }

}
```

#### 转换器

```java
@Component
public class BinLakeMsgConverter {

    // 存储对应Class中的Field（若单例的注册到容器，存在并发问题）
    private ConcurrentHashMap<String, Map<String, Field>> fieldsOfClass = new ConcurrentHashMap<>();
    private DefaultConversionService conversionService = new DefaultConversionService();

    /**
     * 格式转换
     */
    public BinLakeMsgConverter registerConverter(Converter converter) {
        conversionService.addConverter(converter);
        return this;
    }

    /**
     * 转换
     *
     * @param rowData 行数据
     * @param clazz   要转换成的类
     * @param <T>
     * @return
     * @throws InstantiationException
     * @throws IllegalAccessException
     */
    public <T> RowDataPair<T> getChanges(WaveEntry.RowData rowData, Class<T> clazz) throws InstantiationException, IllegalAccessException {


        // 封装bean
        Map<String, Field> beanFields = fieldsOfClass.get(clazz.getName());
        // 从 map 中获取对应 bean 对应的 Class 对象，若为空，添加
        if (beanFields == null || beanFields.size() <= 0) {
            // 获取所有对应的 Field
            beanFields = getAllFieldsForBean(clazz);
            // 存入 map
            fieldsOfClass.putIfAbsent(clazz.getName(), beanFields);
            beanFields = fieldsOfClass.get(clazz.getName());
        }

        // 转换
        T dataBefore = convertRowData(rowData.getBeforeColumnsList(), beanFields, clazz);
        T dataAfter = convertRowData(rowData.getAfterColumnsList(), beanFields, clazz);
        return new RowDataPair<>(dataBefore, dataAfter);


    }

    /**
     * 获取bean的所有字段
     *
     * @param clazz
     * @param <T>
     * @return
     */
    private <T> Map<String, Field> getAllFieldsForBean(Class<T> clazz) {
        Map<String, Field> result = new HashMap<>();
        Class tmpClz = clazz;
        // 不获取Object层的属性
        String finalParent = "java.lang.object";
        while (tmpClz != null && !tmpClz.getName().toLowerCase().equals(finalParent)) {
            // 只获取bean普通属性
            for (Field field : tmpClz.getDeclaredFields()) {
                field.setAccessible(true);
                int modifiers = field.getModifiers();
                if (modifiers == Modifier.PUBLIC || modifiers == Modifier.PRIVATE || modifiers == Modifier.PROTECTED) {
                    result.put(field.getName().toLowerCase(), field);
                }
            }
            tmpClz = tmpClz.getSuperclass();
        }
        return result;
    }

    /**
     * 转为 bean
     *
     * @param cols       变动的实例的所有列
     * @param beanFields 列对应的字段
     * @param clz        要变成的 class 对象
     * @param <T>        最终变成的类
     * @return
     * @throws IllegalAccessException
     * @throws InstantiationException
     */
    private <T> T convertRowData(List<WaveEntry.Column> cols, Map<String, Field> beanFields, Class<T> clz) throws IllegalAccessException, InstantiationException {
        if (CollectionUtils.isEmpty(cols)) {
            return null;
        }
        T bean = clz.newInstance();
        for (WaveEntry.Column col : cols) {
            // 获取字段名和值，表中字段命名下划线去掉
            String name = col.getName().toLowerCase().replace("_", "");
            String value = col.getValue();
            // 匹配字段名与属性名
            Field field = beanFields.get(name);
            if (field == null) {
                continue;
            }
            // 填充属性，若涉及格式转换还需要格式转换
            field.set(bean, value == null ? null : conversionService.convert(value, field.getType()));
        }
        return bean;
    }


    @Data
    @AllArgsConstructor
    public class RowDataPair<T> {
        private T before;
        private T after;
    }

}
```

#### 格式化工具

```java
@Slf4j
public class ParamParse {

    static ThreadLocal<SimpleDateFormat> dateFormatThreadLocal = ThreadLocal
            .withInitial(() -> new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
    /**
     * 价格转换成long,乘以100。
     * @param price
     * @return
     */
    public static long stringPriceToLong(String price){
        try {
            if(StringUtils.isNotEmpty(price)){
                double dPrice = Double.parseDouble(price);
                return (long) dPrice * 100;
            }
        } catch (Exception e) {
            log.error("error- price={}", price);
        }


        return -1L;
    }

    /**
     * 价格转换成long,乘以100。
     * @param price
     * @return
     */
    public static long doublePriceToLong(Double price){
        try{
            if(price != null){
                return (long) (price * 100);
            }
        }catch (Exception e) {
            log.error("erro- double price={}", price);
        }


        return -1L;
    }

    /**
     *
     * @param value
     * @return
     */
    public static int strToInt(String value){
        try {
            if(StringUtils.isNotEmpty(value) && NumberUtils.isDigits(value)){
                return Integer.parseInt(value);
            }
        } catch (Exception e) {
            log.error("error- int={}", value);
        }
        return -1;
    }

    /**
     *
     * @param value
     * @return
     */
    public static long strToLong(String value){
        try {
            if(StringUtils.isNotEmpty(value) && NumberUtils.isDigits(value)){
                return Long.parseLong(value);
            }
        } catch (Exception e) {
            log.error("error- long={}", value);
        }

        return -1L;
    }
    /**
     *
     * @param value
     * @return
     */
    public static Date strToDate(String value){
        try {
            return dateFormatThreadLocal.get().parse(value);
        } catch (Exception e) {
            log.error("error- date={}",value);
        }
        return null;
    }

    /**
     *
     * @param value
     * @return
     */
    public static String dateToStr(Date value){
        try {
            return dateFormatThreadLocal.get().format(value);
        } catch (Exception e) {
            log.error("error- date={}",value);
        }
        return "";
    }

    public static void main(String[] args) {
        String value = "2022-02-27 18:10:00";
        Date strToDate = strToDate(value);
        System.out.println(strToDate);
    }
}
```

### 获取事务key

对应TRANSACTIONBEGIN、TRANSACTIONEND和ROWDATA消息，entryMessage中会携带事务标记（不是事务ID），属于一个事务的消息携带的事务标记是相同的

```java
for (WaveEntry.Pair pair :entryMessage.getHeader().getPropsList()) {
    if (pair.getKey().equals("transactionKey")) {
        System.out.println("Transaction key is " + pair.getValue());
        break;
    }
}
```

