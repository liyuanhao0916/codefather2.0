# jQuery Ajax JSON


##  jQuery

### 概述

- 概念： 一个JavaScript框架。简化JS开发

  JavaScript框架：本质上就是一些js文件，封装了js的原生代码而已

- JQuery对象和js对象互转

  - jq -- > js : jq对象[索引] 或者 jq对象.get(索引)
  - js -- > jq : $(js对象)

- 入口函数

  - window.onload 只能定义一次,如果定义多次，后边的会将前边的覆盖掉
  - $(function)可以定义多次的。

  ​		 

  ​		$(function () {
  ​	         

  ​		 });

- $.方法  即this.方法

### 选择器

- 基本选择器
  - 元素（标签）选择器   $("html标签名")
  - id选择器  $("#id的属性值")
  - 类选择器  $(".class的属性值")
  - 并集选择器  $("选择器1,选择器2....")
- 层级选择器
  - 后代选择器  $("A B ")
  - 子选择器  $("A > B")
- 属性选择器
  - 属性名选择器  $("A[属性名]")
  - 属性值选择器  $("A[属性名='值']")
  - 复合属性选择器  $("A\[属性名='值'][]...")
- 过滤选择器
  - 首元素选择器  $("div:first")
  - 尾元素选择器  $("div:last")
  - 非元素选择器   $("div:not(.one)")
  - 偶数选择器  $("div:even")
  - 奇数选择器 $("div:odd")
  - 等于索引选择器  $("div:eq(3)")
  - 大于索引选择器   $("div:gt(3)")
  - 小于索引选择器  $("div:lt(3)")
  - 标题选择器  $(":header")
- 表单过滤选择器
  - 可用元素选择器  $("input[type='text']:enabled")
  - 不可用元素选择器 $("input[type='text']:disabled")
  - 选中单选/复选框选择器 $("input[type='checkbox']:checked")
  - 选中下拉框选择器 $("#job > option:selected")

### DOM操作方法

- 内容操作

  - html(): 获取/设置元素的标签体内容
  - text(): 获取/设置元素的标签体纯文本内容
  - val()： 获取/设置元素的value属性值

- 属性操作

  - attr(): 获取/设置元素的属性

  - removeAttr():删除属性

  - prop():获取/设置元素的固有属性

  - removeProp():删除固有属性

    <hr>

  - addClass():添加class属性值

  - removeClass():删除class属性值

  - toggleClass():切换class属性  :存在此class就删除，不存在就添加

  - css：样式

    - $("#div1").css("background-color","red");
    - $("#div1").css("backgroundColor","pink");

- CRUD操作

  - append():父元素将子元素追加到末尾：对象1.append(对象2): 将对象2添加到对象1元素内部，并且在末尾

  - prepend():父元素将子元素追加到开头

  - appendTo():

  - prependTo()：

    <hr>

  - after()

  - before()

  - insertAfter()

  - insertBefore()

    <hr>

  - remove()

  - empty()：清空后代，保留当前

### 动画方法

- 默认显示show([speed,[easing],[fn]])
  - speed：动画的速度。三个预定义的值("slow","normal", "fast")或表示动画时长的毫秒数值
  - easing：用来指定切换效果，默认是"swing"，可用参数"linear"匀速
  - fn：在动画完成时执行的函数，每个元素执行一次。
- 默认隐藏hide([speed,[easing],[fn]])
- 默认切换toggle([speed],[easing],[fn])

<hr>


- 滑动显示slideDown([speed],[easing],[fn])
- 滑动隐藏slideUp([speed,[easing],[fn]])
- 滑动切换slideToggle([speed],[easing],[fn])

<hr>


- 淡入显示fadeIn([speed],[easing],[fn])
- 淡出隐藏fadeOut([speed],[easing],[fn])
- 淡入切换fadeToggle([speed,[easing],[fn]])

### 遍历

- jq对象.each(callback)

  - index索引
  - element元素对象
  - this当前元素对象
  - return true（即break）
  - return false（即continue）

  ```js
   $(function () {
       var citys = $("#city li");
       
        citys.each(function () {
  	    //alert(this.innerHTML);
  	    alert($(this).html());
        }
       
       citys.each(function (index,element) {
  	    //alert(index+":"+element.innerHTML);
  	    //alert(index+":"+$(element).html());
  	    //判断如果是上海，则结束循环
  	    if("上海" == $(element).html()){
  	        //如果当前function返回为false，则结束循环(break)。
  	        //如果返回为true，则结束本次循环，继续下次循环(continue)
  	        return true;
  	    }
  	    alert(index+":"+$(element).html());
  	});
   })
  ```

- $.each(object, [callback])

  ```js
  $.each(citys,function () {
       alert($(this).html());
  });
  ```

- for..of

  -  3.0 版本之后提供的方式

  ```js
  for(li of citys){
      alert($(li).html());
  }
  ```

### 事件绑定

- 标准的绑定方式
  - jq对象.事件方法(回调函数)；
  - 如果调用事件方法，不传递回调函数，则会触发浏览器默认行为。如   表单对象.submit();//让表单提交
  - click，mouseover，mouseout，focus“获得焦点”
  - 可链式绑定
- on绑定事件/off解除绑定
  - jq对象.on("事件名称",回调函数)
  - jq对象.off("事件名称")
  - 如果off方法不传递任何参数，则将组件上的所有事件全部解绑
- 事件切换：toggle
  - 1.9版本 .toggle() 方法删除,jQuery Migrate（迁移）插件可以恢复此功能。
  - jq对象.toggle(fn1,fn2...)

### 插件

- 增强JQuery的功能

- $.fn.extend(object)   定义方法，所有jq对象都可调用  $("#id")

  ```js
  $.fn.extend({
      //让复选框选中
      check:function () {
          this.prop("checked",true);
      }
   });
  
  $(function () {
  	$("#btn-check").click(function () {
      	//获取复选框对象
     		$("input[type='checkbox']").check();
      });
  });    
  ```

- $.extend(object)   定义方法，所有对象都可调用  $/jQuery

  ```
  $.extend({
    	max:function (a,b) {
    		//返回两数中的较大值
   		 return a >= b ? a:b;
  	}
  });	
  
  var max = $.max(4,3);
  ```

## AJAX

> AJAX (Asynchronous JavaScript And XML)：异步的 JavaScript 和 XML。
>
> - XML是以前的网络数据传输方式，现在使用json
>
> 实现异步请求

### 原生实现方式

```js
//1. 创建核心对象
var xmlhttp;
if (window.XMLHttpRequest)
{// code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp=new XMLHttpRequest();
}
else
{// code for IE6, IE5
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
}

//2. 建立连接
		//- true异步，false同步
xmlhttp.open("GET","ajaxServlet?username=tom",true);

//3. 发送请求
xmlhttp.send();

//4. 获得响应
xmlhttp.onreadystatechange=function(){
    //判断readyState就绪状态是否为4，判断status响应状态码是否为200
    if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
       //获取服务器的响应结果
        var responseText = xmlhttp.responseText;
        alert(responseText);
    }
}
```

### JQeury实现方式

```js
$.ajax({
    url:"ajaxServlet1111" , // 请求路径
    type:"POST" , //请求方式
    //data: "username=jack&age=23",//请求参数
    data:{"username":"jack","age":23},
    success:function (data) {
        alert(data);
    },//响应成功后的回调函数
    error:function () {
        alert("出错啦...")
    },//表示如果请求响应出现错误，会执行的回调函数

    dataType:"text"//设置接受到的响应数据的格式
});
```

```js
$.get("ajaxServlet",{username:"rose"},function (data) {
     alert(data);
},"text");
```

```js
$.post("ajaxServlet",{username:"rose"},function (data) {
     alert(data);
},"text");
```

### Axios实现方式

Axios 对原生的AJAX进行封装，简化书写。

Axios官网是：`https://www.axios-http.cn`

```js
//引入 axios 的 js 文件
<script src="js/axios-0.18.0.js"></script>

axios({
    method:"get",
    url:"http://localhost:8080/ajax-demo1/aJAXDemo1?username=zhangsan"
}).then(function (resp){
    alert(resp.data);
})
```

```js
axios({
    method:"post",
    url:"http://localhost:8080/ajax-demo1/aJAXDemo1",
    data:"username=zhangsan"
}).then(function (resp){
    alert(resp.data);
});
```

精简后

```js
axios.get("http://localhost:8080/ajax-demo/axiosServlet?username=zhangsan").then(function (resp) {
    alert(resp.data);
});
```

```js
axios.post("http://localhost:8080/ajax-demo/axiosServlet","username=zhangsan").then(function (resp) {
    alert(resp.data);
})
```

### 响应数据格式

- 前段设置   将最后一个参数type指定为"json"
- 在服务器端设置MIME类型
  	response.setContentType("application/json;charset=utf-8");

## JSON

- 概念：JavaScript Object Notation。JavaScript 对象表示法

- 作用：在网络中进行数据传输

- 大家还记得 `ajax` 的概念吗？ 是 ==异步的 JavaScript 和 xml==。这里的 xml就是以前进行数据传递的方式，如下：

  ```xml
  <student>
      <name>张三</name>
      <age>23</age>
      <city>北京</city>
  </student>
  ```

  ```json
  {	
  	"name":"张三",
      "age":23,
      "city":"北京"
  }
  ```

- 本质上就是字符串

### 定义格式

```js
var 变量名 = '{"key":value,"key":value,...}';
```

`JSON` 串的键要求必须使用双引号括起来，而值根据要表示的类型确定。value 的数据类型分为如下

* 数字（整数或浮点数）
* 字符串（使用双引号括起来）
* 逻辑值（true或者false）
* 数组（在方括号中）
* 对象（在花括号中）
* null

```js
var jsonStr = '{"name":"zhangsan","age":23,"addr":["北京","上海","西安"]}'
```

### 获取数据

- json对象.键名

- json对象["键名"]  为了应对遍历时正确书写键

- 数组对象[索引]

- 遍历for  in  

  ```js
  var person = {"name": "张三", age: 23, 'gender': true};
  
  var ps = [{"name": "张三", "age": 23, "gender": true},
            {"name": "李四", "age": 24, "gender": true},
            {"name": "王五", "age": 25, "gender": false}];
  
  //获取person对象中所有的键和值
  for(var key in person){
      //这样的方式获取不行。因为相当于  person."name"
      //alert(key + ":" + person.key);
      alert(key+":"+person[key]);
  }   
  
  //获取ps中的所有值
  for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      for(var key in p){
          alert(key+":"+p[key]);
      }
  }
  ```

### jackson类型转换

- JSON解析器：
  	* 常见的解析器：Jsonlib，Gson，fastjson，jackson
- Java对象转换JSON
  - 导入jackson的相关jar包
  - 创建Jackson核心对象 ObjectMapper
  - 调用ObjectMapper的相关方法进行转换
    - writeValue(参数1，obj)
      - File：将obj对象转换为JSON字符串，并保存到指定的文件中
      - Writer：将obj对象转换为JSON字符串，并将json数据填充到字符输出流中
      - OutputStream：将obj对象转换为JSON字符串，并将json数据填充到字节输出流中
    - writeValueAsString(obj):将对象转为json字符串
  - 注解（在javaBean中使用，主要针对日期）
    - @JsonIgnore：排除属性。
    - @JsonFormat：属性值得格式化
      - @JsonFormat(pattern = "yyyy-MM-dd")
- JSON转为Java对象
  - 导入jackson的相关jar包
  - 创建Jackson核心对象 ObjectMapper
  - 调用ObjectMapper的相关方法进行转换
    - readValue(json字符串数据,Class)

### fastjson类型转换

> Fastjson` 是阿里巴巴提供的一个Java语言编写的高性能功能完善的 `JSON` 库，是目前Java语言中最快的 `JSON` 库

- 导入坐标

  ```xml
  <dependency>
      <groupId>com.alibaba</groupId>
      <artifactId>fastjson</artifactId>
      <version>1.2.62</version>
  </dependency>
  ```

- Java对象转JSON

  ```java
  String jsonStr = JSON.toJSONString(obj);
  ```

- JSON字符串转Java对象

  ```java
  User user = JSON.parseObject(jsonStr, User.class);
  ```

