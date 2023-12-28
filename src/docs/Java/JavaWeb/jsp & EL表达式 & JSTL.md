[toc]

# JSP

- Java Server Pages： java服务器端页面

- 一个特殊的页面，其中既可以指定定义html标签，又可以定义java代码

- JSP本质上就是一个Servlet，执行时先转为java文件，然后转为字节码文件，存放在服务器【work】文件夹中（work文件夹存放动态资源）

- JSP的脚本：JSP定义Java代码的方式

  -  <%  代码 %>   service方法中可以定义什么，该脚本中就可以定义什么
  -  <%! 代码 %>    在jsp转换后的java类的成员位置
  -  <%= 代码 %>  输出语句中可以定义什么，该脚本中就可以定义什么

  可把一段java代码拆开到两个脚本中

  ```jsp
  <% 
  	for(int i = 0;i < 5;i++){
          <%=  i %>
  %>
  <%
      }
  %>
  ```

## 内置对象

  （不需要获取和创建，可以直接使用的对象9个对象）

  - pageContext：当前页面共享数据，还可以获取其他八个内置对象	

  - request：一次请求的共享数据

  - session：一次会话的共享数据

  - application：即ServletContext，所有用户（整个web工程）的共享数据

    

  - response

  - out       和response.getWriter()类似

    - tomcat服务器真正给客户端做出响应之前，会先找response缓冲区数据，再找out缓冲区数据
    - response.getWriter()数据输出永远在out.write()之前

  - page：即Object（当前页面(Servlet)的对象  this）

  - config：即ServletConfig，Servlet的配置对象

  - exception：即Throwable，异常对象

## 指令

（用于配置JSP页面，导入资源文件）

- 格式：
  	<%@ 指令名称 属性名1=属性值1 属性名2=属性值2 ... %>

- 分类：

  - page		： 配置JSP页面的
    -  contentType：设置响应体的mime类型以及字符集
    -  import：导包
    -  errorPage：当前页面发生异常后，会自动跳转到指定的错误页面
    -  isErrorPage：标识当前也是是否是错误页面。
       - true：是，可以使用内置对象exception
       - false：否。默认值。不可以使用内置对象exception
  - include	： 包含某个页面。导入页面的资源文件
  - taglib	： 导入资源
    - uri
    - prefix：前缀，自定义的

  ```jsp
  <%@ page import="java.util.ArrayList" %>	<!--导包-->
  <%@ page import="java.util.List" %>
  <%@ page contentType="text/html;charset=gbk" errorPage="500.jsp"   pageEncoding="GBK" language="java" buffer="16kb" %>		<!--mime类型，字符集，错误跳转，页面编码，缓存-->
  <%@include file="top.jsp"%>		<!--包含页面-->
  <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>	<!--导入资源-->
  <html>
  <head>
      <title>Title</title>
  </head>
  <body>
   <%
  
      List list = new ArrayList();
      int i = 3/0;
  
    %>
  </body>
  </html>
  ```

  ```jsp
  <!--500.jsp-->
  <%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" language="java" %>	<!--错误页面-->
  <html>
  <head>
      <title>Title</title>
  </head>
  <body>
  
      <h1>服务器正忙...</h1>
      <%
          String message = exception.getMessage();
          out.print(message);
  
      %>
  </body>
  </html>
  ```


## 注释

- html注释：
  	<!-- -->:只能注释html代码片段
- jsp注释：推荐使用
  	<%-- --%>：可以注释所有



# EL表达式

## 概念

- 概念：Expression Language 表达式语言
- 作用：替换和简化jsp页面中java代码的编写
- 语法：${表达式}
- 忽略EL表达式
  - page指令中：isELIgnored="true" 忽略整个页面
  - \${表达式} ：忽略某一条

## 运算

- 算数运算符： + - * /(div) %(mod)
- 比较运算符： > < >= <= == !=
- 逻辑运算符： &&(and) ||(or) !(not)
- 空运算符： empty
  - 用于判断字符串、集合、数组对象是否为null或者长度是否为0
  - ${empty list}:判断字符串、集合、数组对象是否为null或者长度为0
  - ${not empty str}:表示判断字符串、集合、数组对象是否不为null 并且 长度>0

## 获取值

- el表达式只能从域对象中获取值

- ${域名称.键名}：从指定域中获取指定键的值

  - 域名
    -  pageScope		--> pageContext
    -  requestScope 	--> request
    -  sessionScope 	--> session
    -  applicationScope --> application（ServletContext）
  - 如${requestScope.name}           在request域中存储了name=张三

- ${键名}：表示依次从最小的域中查找是否有该键对应的值，直到找到为止。

- 获取对象、List集合、Map集合的值

  - 对象：${域名称.键名.属性名}
  - List集合：${域名称.键名[索引]}
  - ${域名称.键名.key名称}    或     ${域名称.键名["key名称"]}

- 隐式对象（类似内置对象）：11个

  **pageContext：获取jsp其他八个内置对象**

     * **${pageContext.request.contextPath}：动态获取虚拟目录**



# JSTL

## 概念

- 概念：JavaServer Pages Tag Library  JSP标准标签库

- 作用：用于简化和替换jsp页面上的java代码		

- 使用步骤：
  	1. 导入jstl相关jar包
  	2. 引入标签库：taglib指令：  <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
  	3. 使用标签

## 常用的JSTL标签

  - if:相当于java代码的if语句
    -  test 必须属性，接受boolean表达式
    -  test属性值为true，则显示if标签体内容
    -  test属性值会结合el表达式一起使用
    -  没有else情况
  - choose-when-otherwise:相当于java代码的switch语句
  - foreach:相当于java代码的for语句
    - 完成重复操作
      - 属性：begin，end，var“变量”，step，varStatus“循环状态对象”
      - varStatus“循环状态对象” 
        - index:容器中元素的索引，从0开始
        - count:循环次数，从1开始
    - 遍历
      - 属性：items“容器对象”，var“变量”，varStatus“循环状态对象”

  ```jsp
<%@ page import="java.util.List" %>
<%@ page import="java.util.ArrayList" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<html>
<head>
    <title>if标签</title>
</head>
<body>
   <c:if test="${not empty list}">
        遍历集合...
    </c:if>
    <br>
    <c:choose>
        <c:when test="${number == 1}">星期一</c:when>
        <c:when test="${number == 2}">星期二</c:when>
        <c:when test="${number == 3}">星期三</c:when>
        <c:when test="${number == 4}">星期四</c:when>
        <c:when test="${number == 5}">星期五</c:when>
        <c:when test="${number == 6}">星期六</c:when>
        <c:when test="${number == 7}">星期天</c:when>
        <c:otherwise>数字输入有误</c:otherwise>
    </c:choose>
    
    <c:forEach begin="1" end="10" var="i" step="2" varStatus="s">
    	${i} <h3>${s.index}<h3> <h4> ${s.count} </h4><br>
	</c:forEach>
    
     <c:forEach items="${list}" var="str" varStatus="s">
        ${s.index} ${s.count} ${str}<br>
   	 </c:forEach>
</body>
</html>
  ```

  