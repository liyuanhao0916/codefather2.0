
# Emoji 处理

## Emoji转换工具

### 官方地址

[Java Emoji Converter](https://github.com/binarywang/java-emoji-converter)



### 快速入门

Add this in your maven pom file（将以下内容加入你的maven的pom文件中）：

```xml
<dependency>
  <groupId>com.github.binarywang</groupId>
  <artifactId>java-emoji-converter</artifactId>
  <version>0.1.1</version>
</dependency>
```

### 使用方法

```java
private EmojiConverter emojiConverter = EmojiConverter.getInstance();

@Test
public void testToAlias() {
    String str = "  An 😃😀awesome 😃😃string with a few 😃😉emojis!";
    String alias = this.emojiConverter.toAlias(str);
    System.out.println(str);
    System.out.println("EmojiConverterTest.testToAlias()=====>");
    System.out.println(alias);
    Assert.assertEquals(
        ":no_good: :ok_woman: :couple_with_heart:An :smiley::grinning:awesome :smiley::smiley:string with a few :smiley::wink:emojis!",
        alias);
}

@Test
public void testToHtml() {
    String str = "  An 😀😃awesome 😃😃string with a few 😉😃emojis!";
    String result = this.emojiConverter.toHtml(str);
    System.out.println(str);
    System.out.println("EmojiConverterTest.testToHtml()=====>");
    System.out.println(result);
    Assert.assertEquals(
        "&#128581; &#128582; &#128145;An &#128512;&#128515;awesome &#128515;&#128515;string with a few &#128521;&#128515;emojis!",
        result);
}

@Test
public void testToUnicode() {
    String str = "   :smiley: :grinning: :wink:";
    String result = this.emojiConverter.toUnicode(str);
    System.err.println(str);
    System.err.println("EmojiConverterTest.testToUnicode()=====>");
    System.err.println(result);
    Assert.assertEquals("🙅 🙆 💑 😃 😀 😉", result);
}
```



## 数据库

自行修改数据库存储编码为utf8mb4

### 改库
```sql
alter database <数据库名> character set utf8mb4;
```
### 改表
```sql
alter table social_post character set utf8mb4;
```
### 改字段
```sql
alter table social_post MODIFY post_message VARCHAR(5000)  character set utf8mb4;
```

### 最好在创建时就设置
```sql
CREATE TABLE `social_post` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` int(1) NOT NULL DEFAULT '0' COMMENT '删除标识: 0-正常, 非0删除 ',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COMMENT='社媒帖子表'
```
