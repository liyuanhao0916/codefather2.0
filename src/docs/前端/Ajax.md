# Ajax

## 原生

基于node.js和express框架**搭建服务 server.js**

```js
const express = require('express')

const app = express()

// 中间件暴露静态页面 --- 防止跨域
app.use(express.static('./'));

app.get('/btn',(req,resp)=>{
    resp.json({msg:'success',data:{name:'lalal'}})
})

// 启动 --- 监听
app.listen(8080, () => {
    console.log('服务启动')
})
```

**客户端发送请求**

> readyState === 0		刚生成xhr实例，还没调用open
>
> readyState === 1		send还没调用，仍然可以设置请求头
>
> readyState === 2		send已经执行，接收到了状态码和响应头
>
> readyState === 3		开始接收响应体body的部分数据
>
> readyState === 4		已经完全接收，或接收失败

```js
const btn = document.querySelector('.test')

btn.addEventListener('click', function () {
    // 创建对象
    const xhr = new XMLHttpRequest()
    // 设置响应体类似
    xhr.responseType = 'json'
    // 设置请求信息
    xhr.open('post', 'http://127.0.0.1:8080/btn')
    // 设置请求头 --- 可选
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded')
    // 发送请求 参数为请求体 --- get请求不传参数
    xhr.send('a=100&b=200')
    // 接收响应
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            // console.log(xhr.status)      // 状态码
            // console.log(xhr.statusText)  // 状态字符串
            // console.log(xhr.getAllResponseHeaders()) // 所有响应头
            // console.log(xhr.responseText)   // 只能拿字符串
            console.log(xhr.response)       // 响应体，设置响应体类型为json，可直接转为对象，不设置拿到的是字符串
        } else { }
    }
})
```

**超时设置**

```js
const btn = document.querySelector('.test')

btn.addEventListener('click', function () {
    // 创建对象
    const xhr = new XMLHttpRequest()
    // 设置响应体类似。。。
    // 设置超时
    xhr.timeout = 2000
	xhr.ontimeout = function(){
        alert('优雅的弹窗告诉你超时了')
    }
    xhr.onerror = function(){
        alert('优雅的告诉你 崩了')
    }
    // 设置请求信息
    xhr.open('post', 'http://127.0.0.1:8080/btn')
    // 发送请求 参数为请求体 --- get请求不传参数
    xhr.send('a=100&b=200')
    // 接收响应
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.response)       // 响应体
        }
    }
})
```

**取消请求（防抖）**

xhr的abort()方法取消请求

```js
const btn = document.querySelector('.test')
let isSending = false
let xhr = null
btn.addEventListener('click', function () {
    if (isSending) xhr.abort()
    xhr = new XMLHttpRequest()
    isSending = true
    xhr.open('get', 'http://127.0.0.1:8080/btn')
    xhr.send()
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            isSending = false
            //其他业务逻辑
        }
    }
})
```



## jQuery

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>jQuery 发送 AJAX 请求</title>
    <link crossorigin="anonymous" href="https://cdn.bootcss.com/twitter-bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
    <script crossorigin="anonymous" src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</head>
<body>
    <div class="container">
        <h2 class="page-header">jQuery发送AJAX请求 </h2>
        <button class="btn btn-primary">GET</button>
        <button class="btn btn-danger">POST</button>
        <button class="btn btn-info">通用型方法ajax</button>
    </div>
    <script>
        $('button').eq(0).click(function(){
            $.get('http://127.0.0.1:8000/jquery-server', {a:100, b:200}, function(data){
                console.log(data);
            },'json');
        });

        $('button').eq(1).click(function(){
            $.post('http://127.0.0.1:8000/jquery-server', {a:100, b:200}, function(data){
                console.log(data);
            });
        });

        $('button').eq(2).click(function(){
            $.ajax({
                //url
                url: 'http://127.0.0.1:8000/jquery-server',
                //参数
                data: {a:100, b:200},
                //请求类型
                type: 'GET',
                //响应体结果
                dataType: 'json',
                //成功的回调
                success: function(data){
                    console.log(data);
                },
                //超时时间
                timeout: 2000,
                //失败的回调
                error: function(){
                    console.log('出错啦!!');
                },
                //头信息
                headers: {
                    c:300,
                    d:400
                }
            });
        });

    </script>
</body>
</html>
```

## axios

```html
<script crossorigin="anonymous" src="https://cdn.bootcdn.net/ajax/libs/axios/0.19.2/axios.js"></script>
```

```js
//配置 baseURL
axios.defaults.baseURL = 'http://127.0.0.1:8000'
```

**get**

```js
//GET 请求
axios.get('/axios-server', {
    //url 参数
    params: {
        id: 100,
        vip: 7
    },
    //请求头信息
    headers: {
        name: 'atguigu',
        age: 20
    }
}).then(value => {
    console.log(value);
})    
```

**post**

```js
axios.post('/axios-server', {
    username: 'admin',
    password: 'admin'
}, {
    //url 
    params: {
        id: 200,
        vip: 9
    },
    //请求头参数
    headers: {
        a: 180,
        b: 180,
    }
})
```

**通用 axios**

```js
axios({
    //请求方法
    method: 'POST',
    //url
    url: '/axios-server',
    //url参数
    params: {
        vip: 10,
        level: 30
    },
    //头信息
    headers: {
        a: 100,
        b: 200
    },
    //请求体参数
    data: {
        username: 'admin',
        password: 'admin'
    }
}).then(response => {
    //响应状态码
    console.log(response.status);
    //响应状态字符串
    console.log(response.statusText);
    //响应头信息
    console.log(response.headers);
    //响应体
    console.log(response.data);
})
```

## fetch

```js
fetch('http://127.0.0.1:8000/fetch-server?vip=10', {
     //请求方法
     method: 'POST',
     //请求头
     headers: {
         name:'atguigu'
     },
     //请求体
     body: 'username=admin&password=admin'
 }).then(response => {
     // return response.text();
     return response.json();
 }).then(response=>{
     console.log(response);
 })
```

## 跨域

```js
response.setHeader('Access-Control-Allow-Origin', '*')
```

