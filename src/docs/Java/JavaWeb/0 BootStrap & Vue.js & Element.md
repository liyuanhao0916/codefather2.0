[TOC]

## BootStrap框架

### 使用方法

1.复制两个文件夹【css】【js】【fonts】

2.创建html页面，引入必要的资源文件

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- 上述3个meta标签*必须*放在最前面，任何其他内容都*必须*跟随其后！ -->
  <title>Bootstrap 测试</title>
  <link rel="stylesheet" href="css/bootstrap.min.css">
</head>
<body>
<h1>你好，世界！</h1>

<!-- jQuery (Bootstrap 的所有 JavaScript 插件都依赖 jQuery，所以必须放在前边) -->
<script src="js/jquery-3.2.1.min.js"></script>
<!-- 加载 Bootstrap 的所有 JavaScript 插件。你也可以根据需要只加载单个插件。 -->
<script src="js/bootstrap.min.js" ></script>
</body>
</html>
```

### 响应式布局

响应式布局： 同一套页面可以兼容不同分辨率的设备。

*   实现：依赖于栅格系统：将一行平均分成12个格子，可以指定元素占几个格子

*   步骤：三层div，给每层div设置class

    1.  定义容器（相当于table）

    *   container：两边留白

    *   container-fluid：每一种设备都是100%宽度

    1.  定义行（相当于之前的tr）   样式：row

    2.  定义元素：指定该元素在不同的设备上，所占的格子数目。样式：col-设备代号-格子数目

    *   xs：超小屏幕 手机 (<768px)：col-xs-12
    *   sm：小屏幕 平板 (≥768px)
    *   md：中等屏幕 桌面显示器 (≥992px)
    *   lg：大屏幕 大桌面显示器 (≥1200px)

    注意：

          	1. 一行中如果格子数目超过12，则超出部分自动换行。
          	2. 栅格类属性可以向上兼容。栅格类适用于与屏幕宽度大于或等于分界点大小的设备。
          	3. 如果真实设备宽度小于了设置栅格类属性的设备代码的最小值，会一个元素沾满一整行。

全局 CSS 样式   去官网复制class   <https://v3.bootcss.com/css/>

*   容器、行：container、containerr-fluid、row、col-md-\*\*
*   图片响应式：img-responsive
*   图文描述：caption
*   图文相框：thumbnail
*   位置：pull-left、pull-right、center-block
*   轮播图时间属性：data-interval="2000"

组件   去官网复制代码   <https://v3.bootcss.com/components/>

JavaScript 插件    去官网复制代码   <https://v3.bootcss.com/javascript/>

## vue.js

### 概述

免除原生JavaScript中的DOM操作，简化书写

基于MVVM(Model-View-ViewModel)思想，实现数据的双向绑定，将编程的关注点放在数据上

引入&lt;script src="js/vue.js"&gt;&lt;/script&gt;

**在JS代码区域，创建Vue核心对象，进行数据绑定**

```js
new Vue({
    el: "#app",
    data() {
        return {
            username: ""
        }
    }
    methods: {
        show(){
            alert("");
        }
    }
});
```

创建 Vue 对象时，需要传递一个 js 对象，而该对象中需要如下属性：

*   `el` ： 用来指定哪儿些标签受 Vue 管理。 该属性取值 `#app` 中的 `app` 需要是受管理的标签的id属性值
*   `data` ：用来定义数据模型
*   `methods` ：用来定义函数。这个我们在后面就会用到

**编写视图**

```html
<div id="app">
    <input name="username" v-model="username" >
    {{username}}
</div>
```

`{{}}` 是 Vue 中定义的 `插值表达式` ，在里面写数据模型，到时候会将该模型的数据值展示在这个位置。

### 指令

> HTML 标签上带有 v- 前缀的特殊属性，不同指令具有不同含义。例如：v-if，v-for…

**v-bind（简写：）**

该指令可以给标签原有属性绑定模型数据。这样模型数据发生变化，标签属性值也随之发生变化

**v-model**

该指令可以给**表单项标签**绑定模型数据。这样就能实现双向绑定效果。例如：

```html
<div id="app">
    <a v-bind:href="url">点击一下</a>		<!--3. 超链接与url数据模型绑定-->
    <a :href="url">点击一下</a>
    <input v-model="url">					<!--2. 输入框与url数据模型绑定-->
</div>

<script src="js/vue.js"></script>
<script>
    //1. 创建Vue核心对象
    new Vue({
        el:"#app",
        data(){
            return {
                username:"",					//usrname默认为空
                url:"https://www.baidu.com"  	//1. url默认值
            }
        }
    });
</script>
</body>
</html>
```

**v-on**（简写@）绑定事件

`v-on:` 后面的事件名称是之前原生事件属性名去掉on，如v-on\:click、v-on\:blur

```html
<input type="button" value="一个按钮" v-on:click="show()">
<script src="js/vue.js"></script>
<script>
    new Vue({
    el: "#app",
    methods: {
        show(){
            alert("我被点了");
        }
    }
});
</script>
```

**v-if、v-else、v-else-if和v-show**

```html
<div id="app">
    <div v-if="count == 3">div1</div>
    <div v-else-if="count == 4">div2</div>
    <div v-else>div3</div>
    <hr>
    <input v-model="count">
    
    <div v-show="count == 3">div v-show</div>
</div>

<script src="js/vue.js"></script>
<script>
    //1. 创建Vue核心对象
    new Vue({
        el:"#app",
        data(){
            return {
                count:3
            }
        }
    });
</script>
```

**v-for**遍历

```html
<标签 v-for="变量名 in 集合模型数据">
    {{变量名}}
</标签>

<标签 v-for="(变量名,索引变量) in 集合模型数据">
    <!--索引变量是从0开始，所以要表示序号的话，需要手动的加1-->
   {{索引变量 + 1}} {{变量名}}
</标签>
```

```html
<div id="app">
    <div v-for="addr in addrs">
        {{addr}} <br>
    </div>

    <hr>
    <div v-for="(addr,i) in addrs">
        {{i+1}}--{{addr}} <br>
    </div>
</div>

<script src="js/vue.js"></script>
<script>

    //1. 创建Vue核心对象
    new Vue({
        el:"#app",
        data(){
            return {
                addrs:["北京","上海","西安"]
            }
        }
    });
</script>
```

### 生命周期

生命周期的八个阶段：每触发一个生命周期事件，会自动执行一个生命周期方法，这些生命周期方法也被称为钩子方法

这里只关注mounted“加载完成”，Vue初始化成功，HTML页面渲染成功。在该方法中发送异步请求，加载数据。

## element

饿了么公司前端开发团队提供的一套基于 Vue 的网站组件库，用于快速构建网页。

官网<https://element.eleme.cn/#/zh-CN>

### 步骤

*   拷贝`element-ui` 文件夹到项目的 `webapp` 下

*   创建页面，并在页面引入Element 的css、js文件 和 Vue.js

    ```html
    <script src="vue.js"></script>
    <script src="element-ui/lib/index.js"></script>
    <link rel="stylesheet" href="element-ui/lib/theme-chalk/index.css">
    ```

*   创建Vue核心对象

    ```html
    <script>
        new Vue({
            el:"#app"
        })
    </script>
    ```

*   官网复制

### 布局

*   Layout 局部

    一行分为 24 栏，根据页面要求给每一列设置所占的栏数

*   Container 布局容器

    带导航栏

