# XML Jsoup Xpath

## 概述

概念：Extensible Markup Language 可扩展标记语言

*   可扩展：标签都是自定义的。 &lt;user&gt;  &lt;student&gt;

*   功能

    *   存储数据
        1.  配置文件
        2.  在网络中传输

<!---->

*   xml与html的区别
    *   xml标签都是自定义的，html标签是预定义。
    *   xml的语法严格，html语法松散
    *   xml是存储数据的，html是展示数据

<!---->

*   w3c:万维网联盟

## 基本语法

    1. xml文档的后缀名 .xml
    2. xml第一行必须定义为文档声明，不能是空行
    	<?xml version='1.0' ?>
    3. xml文档中有且仅有一个根标签
    4. 属性值必须使用引号(单双都可)引起来
    5. 标签必须正确关闭
    6. xml标签名称区分大小写

### 组成部分

1.  文档声明
    1.  格式：&lt;?xml 属性列表 ?&gt;
    2.  属性列表：
        *   version：版本号，**必须的属性**
        *   encoding：编码方式。告知解析引擎当前文档使用的字符集，默认值：ISO-8859-1
        *   standalone：是否独立
            *   取值：
                *   yes：不依赖其他文件
                *   no：依赖其他文件

2.  指令(了解)：结合css的
    *
        &lt;?xml-stylesheet type="text/css" href="a.css" ?&gt;

3.  标签：标签名称自定义的，规则和java类似

4.  属性：
    id属性值唯一

5.  文本：
    *   CDATA区：在该区域中的数据会被原样展示
    *   格式：  &lt;![CDATA[ 数据 ]]&gt;

### 约束

> 规定xml文档的书写规则

1.  DTD:一种简单的约束技术

    *   (了解)内部dtd：将约束规则定义在xml文档中

        ```xml
        <?xml version="1.0" encoding="UTF-8" ?>
        <!DOCTYPE students[
            <!ELEMENT students (student*) >
            <!ELEMENT student (name,age,sex)>
            <!ELEMENT name (#PCDATA)>		
            <!ELEMENT age (#PCDATA)>
            <!ELEMENT sex (#PCDATA)>
            <!ATTLIST student number ID #REQUIRED>		
        ]>

        <students>
        	<student number="itcast_0001">
        		<name>tom</name>
        		<age>18</age>
        		<sex>male</sex>
        	</student>	
        </students>
        ```

    *   外部dtd：将约束的规则定义在外部的dtd文件中

        *   本地：&lt;!DOCTYPE 根标签名 SYSTEM "dtd文件的位置"&gt;
        *   网络：&lt;!DOCTYPE 根标签名 PUBLIC "dtd文件名字（随便写）" "dtd文件的位置URL"&gt;

    ```dtd
    <!ELEMENT students (student*) >
    <!ELEMENT student (name,age,sex)>
    <!ELEMENT name (#PCDATA)>		<!-- #PCDATA  字符串-->
    <!ELEMENT age (#PCDATA)>
    <!ELEMENT sex (#PCDATA)>
    <!ATTLIST student number ID #REQUIRED>		<!-- #REQUIRED  必须属性-->
    ```

    ```xml
    <?xml version="1.0" encoding="UTF-8" ?>
    <!DOCTYPE students SYSTEM "student.dtd">		<!--引入约束文件-->

    <students>
    	<student number="itcast_0001">
    		<name>tom</name>
    		<age>18</age>
    		<sex>male</sex>
    	</student>	
    </students>
    ```

2.  Schema:一种复杂的约束技术

    *   dtd缺点，不能约束属性值

    *   Schema后缀名是xsd，本质上是xml

        *   版本号等

        *   根标签schema

            引入前缀	xmlns\:xsi="<http://www.w3.org/2001/XMLSchema"（引入和声明可以同时）>

            声明前缀	xmlns\:xxx=”“（xxx就是前缀，省略：xxx即默认情况不写前缀）

            命名空间

            标签默认格式	qualified

            *   定义根标签（name type）

            *   定义complexType（内含子标签）

            *   sequence“顺序”--顺序限制

                *   子标签（name type minOccurs  maxOccurs）（unbounded“不限”）

            *   定义simpleType（最内层标签，即属性）

            *   restriction“约束”--内容限制 base（内容基于的类型）

                *   属性、属性值		enumeration”枚举“  value=male

                    ​								minInclusive”最小包含“maxInclusive

                    ​								pattern”模板“		value="heima\_\d{4}"

            ```xml
            <?xml version="1.0"?>
            <xsd:schema xmlns="http://www.itcast.cn/xml"
                    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                    targetNamespace="http://www.itcast.cn/xml" elementFormDefault="qualified">

                <xsd:element name="students" type="studentsType"/>

                <xsd:complexType name="studentsType">
                    <xsd:sequence>
                        <xsd:element name="student" type="studentType" minOccurs="0" maxOccurs="unbounded"/>
                    </xsd:sequence>
                </xsd:complexType>
                
                <xsd:complexType name="studentType">
                    <xsd:sequence>
                        <xsd:element name="name" type="xsd:string"/>
                        <xsd:element name="age" type="ageType" />
                        <xsd:element name="sex" type="sexType" />
                    </xsd:sequence>
                    <xsd:attribute name="number" type="numberType" use="required"/>
                </xsd:complexType>

                <xsd:simpleType name="sexType">
                    <xsd:restriction base="xsd:string">
                        <xsd:enumeration value="male"/>
                        <xsd:enumeration value="female"/>
                    </xsd:restriction>
                </xsd:simpleType>
                <xsd:simpleType name="ageType">
                    <xsd:restriction base="xsd:integer">
                        <xsd:minInclusive value="0"/>
                        <xsd:maxInclusive value="256"/>
                    </xsd:restriction>
                </xsd:simpleType>
                <xsd:simpleType name="numberType">
                    <xsd:restriction base="xsd:string">
                        <xsd:pattern value="heima_\d{4}"/>
                    </xsd:restriction>
                </xsd:simpleType>
            </xsd:schema> 
            ```

    *   引入：
        1.填写xml文档的根元素
        2.引入xsi前缀.  xmlns\:xsi="<http://www.w3.org/2001/XMLSchema-instance>"
        3.引入xsd文件命名空间.  xsi\:schemaLocation="<http://www.itcast.cn/xmlstudent.xsd>"
        4.为每一个xsd约束声明一个前缀,作为标识  xmlns="<http://www.itcast.cn/xml>"

        <根元素   引入前缀xmlns\:xsi="<http://www.w3.org/2001/XMLSchema-instance>"

        ​    给命名空间声明前缀xmlns\:a="<http://www.itcast.cn/xml1>" >

        ​                                      xmlns\:b="<http://www.itcast.cn/xml2>" >

        ​	命名空间xsi\:schemaLocation="<http://www.itcast.cn/xml1>

        ​                                                          student1.xsd”文件路径“

        ​                                                          <http://www.itcast.cn/xml2>

        ​                                                          student2.xsd"

        ```xml
        <?xml version="1.0" encoding="UTF-8"?>
        <beans xmlns="http://www.springframework.org/schema/beans"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        	xmlns:context="http://www.springframework.org/schema/context"
            xmlns:mvc="http://www.springframework.org/schema/mvc"
            xsi:schemaLocation="
                http://www.springframework.org/schema/beans
                http://www.springframework.org/schema/beans/spring-beans.xsd
                http://www.springframework.org/schema/context 
                http://www.springframework.org/schema/context/spring-context.xsd
                http://www.springframework.org/schema/mvc
                http://www.springframework.org/schema/mvc/spring-mvc.xsd">
        ```

## 操作xml文档

*   操作xml文档

> 解析(读取)：将文档中的数据读取到内存中
>
> 写入：将内存中的数据保存到xml文档中。持久化的存储

*   解析xml的方式：

    1.  DOM：将标记语言文档一次性加载进内存，在内存中形成一颗dom树
        *   优点：操作方便，可以对文档进行CRUD的所有操作
        *   缺点：占内存
    2.  SAX：逐行读取，基于事件驱动的。
        *   优点：不占内存。
        *   缺点：只能读取，不能增删改
*   xml常见的解析器
    1.  JAXP：sun公司提供的解析器，支持dom和sax两种思想
    2.  DOM4J：一款非常优秀的解析器
    3.  Jsoup：jsoup 是一款Java 的HTML解析器，可直接解析某个URL地址、HTML文本内容。它提供了一套非常省力的API，可通过DOM，CSS以及类似于jQuery的操作方法来取出和操作数据。
    4.  PULL：Android操作系统内置的解析器，sax方式的。

## Jsoup

方便在于获取Element对象方法和js基本相同

*   导入jar包
*   获取Document对象
*   获取对应的标签Element对象
*   获取数据

```java
//1.获取student.xml的path
String path = JsoupDemo1.class.getClassLoader().getResource("student.xml").getPath();
//2.解析xml文档，加载文档进内存，获取dom树--->Document
Document document = Jsoup.parse(new File(path), "utf-8");
//3.获取元素对象 Element
Elements elements = document.getElementsByTag("name");
//4.获取第一个name的Element对象
Element element = elements.get(0);
//5.获取数据
String name = element.text();
System.out.println(name);
```

```java
URL url = new URL("https://www.baidu.com/");
Document document1 = Jsoup.parse(url, 3000);
```

1.  Jsoup：工具类，可以解析html或xml文档，返回Document
    *   parse：解析html或xml文档，返回Document
        *   parse​(File in, String charsetName)：解析xml或html文件的。
        *   parse​(URL url, int timeoutMillis)：通过网络路径获取指定的html或xml的文档对象
2.  Document：文档对象。代表内存中的dom树。获取元素对象方法和js基本相同
3.  Elements：元素Element对象的集合。可以当做 ArrayList&lt;Element&gt;来使用
4.  Element：元素对象
    1.  获取子元素对象
    2.  获取属性值
        *   String attr(String key)：根据属性名称获取属性值
    3.  获取文本内容
        *   String text():获取文本内容
        *   String html():获取标签体的所有内容(包括子标签字符串内容)和toString类似
5.  Node：节点对象，用于增删改，是Document和Element的父类

## 快捷查询方式

### selector:选择器

*   使用的方法：Elements	select​(String cssQuery)

    *   语法：参考Selector类中定义的语法（和css选择器基本相同）

    ```java
    String path = JsoupDemo.class.getClassLoader().getResource("student.xml").getPath();
    Document document = Jsoup.parse(new File(path), "utf-8");
    Elements select = document.select("#001");
    ```

### XPath

XPath即为XML路径语言，它是一种用来确定XML（标准通用标记语言的子集）文档中某部分位置的语言

*   使用Jsoup的Xpath需要额外导入jar包。

*   查询w3cshool参考手册，使用xpath的语法完成查询

    ```java
    String path = JsoupDemo.class.getClassLoader().getResource("student.xml").getPath();
    Document document = Jsoup.parse(new File(path), "utf-8");

    JXDocument jxDocument = new JXDocument(document);
    //获取所有student内容
    List<JXNode> jxNodes = jxDocument.selN("//student");
    //获取所有studentd的id属性值
    List<JXNode> jxNodes1 = jxDocument.selN("//student/@id");
    //获取含class属性的name内容
    List<JXNode> jxNodes2 = jxDocument.selN("//student/name[@class]");
    ///获取含class属性值为hehe的name的内容
    List<JXNode> jxNodes3 = jxDocument.selN("//student/name[@class='hehe']");
    ```

