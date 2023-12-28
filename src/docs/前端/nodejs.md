# Nodejs

## 基本概述

### node版本切换

下载安装 [nvm （Node Version Manager）](https://github.com/coreybutler/nvm-windows/releases)

或
```sh
# 二者选其一，注意wget命令里的-q参数表示--quiet，安静模式，无信息输出，看不到错误，也可去掉该参数
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

在其他用户使用时不生效，是因为环境变量配置的路径是从$HOME获取的，每个用户获取到的值不同
```sh
$NVM_DIR  ## 查看安装路径
vim ~/.bashrc ## 该环境变量
```

找到$NVM_DIR的配置替换为查看到的路径

export NVM_DIR="/home/li/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion


**命令**

```sh
nvm list available 			## 显示可下载的版本
nvm list					## 显示已安装版本
nvm install 版本号			## 安装指定版本
nvm install latest			## 安装最新版
nvm uninstall 版本号		## 删除指定版本
nvm use 版本号				## 使用指定版本
```

### Buffer

Buffer对象是一个伪数组，每个元素1字节，存储字节序列，用来处理二进制数据

```js
// 创建
let buf_1 = Buffer.alloc(10)		// <Buffer 00 00 00 00 00 00 00 00 00 00>
let buf_2 = Buffer.allocUnsafe(10)	// 和上述相比，有旧数据，但是快
let buf_3 = Buffer.from('hello')	// <Buffer 68 65 6c 6c 6f>
let buf_4 = Buffer.from([105, 108, 111, 118, 101, 121, 111, 117])	// 同上

// 转string
let str_4 = buf_4.toString()		// hello

// 读写
console.log(buf_3[0])				// 读到 104
buf_3[2] = 44						// 改
console.log(buf_3.toString())		// he,lo
```

> **注意**
>
> 1. 如果修改的数值超过 255 ，则超过 8 位数据会被舍弃
> 2. 一个 utf-8 的字符一般占 3 个字节

### 模块化

**规范**

- **CommonJS 规范**是 Node.js 使用的模块化规范，是一套约定标准，不是技术。用于约定我们的代码应该是怎样的一种结构，module.exports 、exports 以及 require 这些都是 CommonJS 模块化规范中的内容。
  而 Node.js 是实现了 CommonJS 模块化规范，二者关系有点像 JavaScript 与 ECMAScript

- [**AMD规范**](https://gitee.com/link?target=https%3A%2F%2Fgithub.com%2Famdjs%2Famdjs-api)：是 **[RequireJS](https://gitee.com/link?target=http%3A%2F%2Frequirejs.org%2F)** 在推广过程中对模块化定义的规范化产出。
- **CMD规范**：是 **[SeaJS](https://gitee.com/link?target=http%3A%2F%2Fseajs.org%2F)** 在推广过程中对模块化定义的规范化产出。淘宝团队开发。

**CommonJS 规范**是 Node.js 使用的模块化规范。也就是说，Node.js 就是基于 CommonJS 这种模块化规范来编写的，规范规定：每个模块内部，module 变量代表当前模块。这个变量是一个对象，它的 exports 属性（即 module.exports）是对外的接口对象。加载某个模块，其实是加载该模块的 module.exports 对象。在 CommonJS 中，每个文件都可以当作一个模块：

- 在服务器端：模块的加载是运行时同步加载的。
- 在浏览器端: 模块需要提前编译打包处理。首先，既然同步的，很容易引起阻塞；其次，浏览器不认识`require`语法，因此，需要提前编译打包。

> **require说明**
>
> 1. 对于自己创建的模块，导入时路径建议写相对路径，且不能省略./ 和../
> 2. js 和 json 文件导入时可以不用写后缀，c/c++编写的node 扩展文件也可以不写后缀，但是一般用不到
> 3. 如果导入其他类型的文件，会以 js 文件进行处理
> 4. 如果导入的路径是个文件夹，则会首先检测该文件夹下 package.json 文件中 main 属性对应的文件，如果存在则导入，反之如果文件不存在会报错。如果 main 属性不存在，或者 package.json 不存在，则会尝试导入文件夹下的 index.js 和index.json ，如果还是没找到，就会报错
> 5. 导入 node.js 内置模块时，直接 require 模块的名字即可，无需加./ 和../
>
> **导入原理**
>
> 1. 第三方包安装好后，这个包一般会存放在当前项目的 node_modules 文件夹中。我们找到这个包的 package.json 文件，并且找到里面的main属性对应的入口模块，这个入口模块就是这个包的入口文件
> 2. 如果第三方包中没有找到package.json文件，或者package.json文件中没有main属性，则默认加载第三方包中的index.js文件
> 3. 如果在 node_modules 文件夹中没有找到这个包，或者以上所有情况都没有找到，则会向上一级父级目录下查找node_modules文件夹，查找规则如上一致
> 4. 如果一直找到该模块的磁盘根路径都没有找到，则会报错：can not find module xxx
> 5. 找到入口文件后，遇到require，将相对路径转为绝对路径，定位目标文件
>
> 2. 缓存检测（第一次被使用的时候就会缓存起来，多次引用也只会初始化一次）
> 3. 读取目标文件代码
> 4. 包裹为一个函数并执行（自执行函数）。通过 arguments.callee.toString() 查看自执行函数
> 5. 缓存模块的值
> 6. 返回 module.exports 的值
>
>  **exports 和 module.exports 的区别**
>
> - 使用exports时，只能单个设置属性 `exports.a = a;`
> - 使用module.exports时，既单个设置属性 `module.exports.a`，也可以整个赋值 `module.exports = obj`。
>
> - Node中每个模块的最后，都会执行 `return: module.exports`。
> - Node中每个模块都会把 `module.exports`指向的对象赋值给一个变量 `exports`，也就是说 `exports = module.exports`。
> - `module.exports = XXX`，表示当前模块导出一个单一成员，结果就是XXX。
> - 如果需要导出多个成员，则必须使用 `exports.add = XXX; exports.foo = XXX`。或者使用 `module.exports.add = XXX; module.export.foo = XXX`。
>
> **暴露的模块到底是谁？**
>
> 暴露的本质是`exports`对象。【重要】
>
> 比如，方式一的 `exports.a = a` 可以理解成是，**给 exports 对象添加属性**。方式二的 `module.exports = a`可以理解成是给整个 exports 对象赋值。方式二的 `module.exports.c = c`可以理解成是给 exports 对象添加属性。
>
> Node.js 中每个模块都有一个 module 对象，module 对象中的有一个 exports 属性称之为**接口对象**。我们需要把模块之间公共的方法或属性挂载在这个接口对象中，方便其他的模块使用。

**服务器端应用**

模块一

```js
// 定义模块
module.exports =  {		// 暴露一个对象
    name:'llll',
    age:1,
    eat(){
        console.log('eat')
    }
}
```

模块二

```js
// 暴露一个函数出去
module.exports = function(){
    console.log('我是 module2');
}
```

模块三

```js
// 以exports属性方式暴露多个
exports.foo1 = function(){
    console.log('module3 中的 foo1 方法');
}

exports.foo2 = function(){
    console.log('module3 中的 foo2 方法');
}

exports.arr = [1,1,2,2,3,5,11];
```

主模块

```js
//将其他模块汇集到主模块
let uniq = require('uniq'); //引入时，第三方模块要放在自定义模块的上面

let module1 = require('./modules/module1');
let module2 = require('./modules/module2');
let module3 = require('./modules/module3');

//调用module1对象的方法
module1.eat();

//调用module2的函数
module2();

//调用module3中的属性
module3.foo1();
module3.foo2();

uniq(module3.arr); //将module3中的数组进行去重操作
console.log(module3.arr); //打印数组去重后的结果
```

**浏览器端应用**

```
js
    dist //打包生成文件的目录
    src //源码所在的目录
      | module1.js
      | module2.js
      | module3.js
      | app.js //应用主源文件
index.html    //因为CommonJS是基于浏览器端，js文件要跑在浏览器的页面上，所以要有这个html页面
package.json
```

使用[Browserify](https://browserify.org/)这个工具进行编译打包

```sh
## 安装
    npm install browserify -g          //全局 --- 生成环境
    npm install browserify --save-dev  //局部 --- dev环境
```

```html
<!-- 这样是不行的 ，浏览器不认识 require -->
<script src="./js/src/app.js"></script>
```

```sh
## 把app.js通过browserify打包为bundle.js(随意)
browserify js/src/app.js -o js/dist/bundle.js
```

```html
<!-- 这样就行了 -->
<script type="text/javascript" src="js/dist/bundle.js"></script>
```



### 包管理工具

**npm**

package.json

```json
{
    "name": "1-npm", 		#包的名字，不能有中文和大写，默认为文件夹名
    "version": "1.0.0", 	#包的版本
    "description": "", 		#包的描述
    "main": "index.js", 	#包的入口文件
    "scripts": { 			#脚本配置
    	"test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "", 			#作者
    "license": "ISC" 		#开源证书
}
```

```sh
npm init 				## 将文件夹初始化为一个包，必须有package.json 
npm init -y/--yes		## 或者npm init --yes 极速创建package.json
npm s/search 			## 搜索
npm r/remove <包名> 		## 删除 npm remove -g <包名> 全局删除

## 安装
npm i/install <包名>		## 	npm i <包名@版本号> 指定包名
## 开发环境
npm i -D <包名>			## 等价于 npm i --save-dev,	在package.json 中 devDependencies 属性
## 生产环境
npm i -S <包名>			## 等价于 npm i --save,	在 package.json 中 dependencies 属性
## 全局安装
npm i -g <包名>			## 任何地方都可使用，	npm root -g查看全局安装包的位置

```

> 运行之后文件夹下会增加两个资源
>
> - node_modules 文件夹存放下载的包
> - package-lock.json 包的锁文件，用来锁定包的版本
>
> require 导入 npm 包基本流程
>
> 1. 在当前文件夹下 node_modules 中寻找同名的文件夹
> 2. 在上级目录中下的 node_modules 中寻找同名的文件夹，直至找到磁盘根目录
>
> Windows默认不允许npm全局命令执行，所以需要修改执行策略
>
> - 管理员身份运行powershell
> - `set-ExecutionPolicy remoteSigned`
> - 键入`A`

package.json

```json
{
    .
    .
    .
    "scripts": {	## 配置别名
        "server": "node server.js",	## 可直接运行 npm run server
        "start": "node index.js",	## 可直接运行 npm run start,还可直接运行npm start
    },
    .
    .
}
```

**cnpm、yarn**

cnpm -- 淘宝 --- 命令和npm基本相同

```sh
## 安装
npm install -g cnpm --registry=https://registry.npmmirror.com
## npm 配置国内镜像
npm config set registry https://registry.npmmirror.com/
```

yarn --- FaceBook

```sh
## 安装
npm i -g yarn
## 配置淘宝镜像
yarn config set registry https://registry.npmmirror.com/
```

```sh
## 使用
yarn init 			## 初始化 yarn init -y	
yarn add <包>		## 生产依赖
yarn add <包> --dev 	## 开发依赖
yarn global add <包> ## 全局安装，yarn global bin 查看全局安装包的位置
yarn remove <包> 	## 删除 yarn global remove <包> 全局删除包
yarn				## 安装整个项目依赖
yarn <别名>			## 运行命令别名，不需要添加 run
```

> 如果是公司要根据项目代码来选择，可以通过锁文件判断项目的包管理工具
>
> - npm 的锁文件为 package-lock.json
> - yarn 的锁文件为 yarn.lock
>
> 包管理工具**不要混着用**，切记，切记，切记

**各种语言的包管理工具**

PHP  ---- composer

Python --- pip

Java --- maven

Go --- go mod

JavaScript --- npm\cnpm\yarn...

Ruby --- rubyGems

**操作系统的包（软件包）管理工具**

Centos --- yum

Ubuntu --- apt

MacOS --- homebrew

Windows --- chocolatey



### 包管理发布

**创建、发布**工具包到 npm 服务上，方便自己和其他开发者使用，操作步骤如下：

1. 创建文件夹，并创建文件 index.js， 在文件中声明函数，使用 module.exports 暴露
2. npm 初始化工具包，package.json 填写包的信息 (包的名字是唯一的)
3. 注册账号 https://www.npmjs.com/signup
4. 激活账号 （ 一定要激活账号）
5. 修改为官方的官方镜像 (命令行中运行 nrm use npm )
6. 命令行下 npm login 填写相关用户信息
7. 命令行下npm publish 提交包 👌

**更新**

1. 更新包中的代码
2. 测试代码是否可用
3. 修改 package.json 中的版本号
4. 发布更新`npm publish`

**删除**

命令：`npm unpublish --force`

条件

- 你是包的作者
- 发布小于 24 小时
- 大于 24 小时后，没有其他包依赖，并且每周小于 300 下载量，并且只有一个维护者



## fs模块

fs全称 file system，是node.js 的内置模块

```js
// require 是 Node.js 环境中的'全局'变量，用来导入模块
const fs = require('fs')
```

__dirname 与require相似，都是Node.js 环境中的'全局'变量，记录着文件目录的绝对路径

```js
// 尽量使用 绝对路径 __dirname + ''
console.log(__dirname)
```



### 文件写入

**异步写入**

```js
// 覆盖
fs.writeFile('./我是文件名.txt', '我是文件内容', err => {
    if (err) return
    console.log('我是异步任务的回调函数，任务执行完毕')
})

// 追加
fs.appendFile('./我是文件名.txt', '我是要追加的内容', e => {
    if (e) return
    console.log(e)
})
```

**同步写入**

```js
try {
    // 覆盖
    fs.writeFileSync('./同步文件名.txt', 'laallalallallalalla')
    // 追加
    fs.appendFileSync('./同步文件名.txt','要追加的内容')
} catch (e) {
    console.log('粗错啦', e)
}
```

**流式写入**

类似java中的缓冲流

```js
const ws = fs.createWriteStream('./观书有感.txt')
ws.write('半亩方塘一鉴开\r\n')
ws.write('天光云影共徘徊\r\n')
ws.write('问渠那得清如许\r\n')
ws.write('为有源头活水来\r\n')
ws.end()
```

### 文件读取

**异步**

```js
fs.readFile('./观书有感.txt',(e,data)=>{
    if(e) return
    console.log(data.toString())
})
```

**同步**

```js
console.log(fs.readFileSync('./观书有感.txt','utf-8'))
console.log(fs.readFileSync('./观书有感.txt').toString())
```

**流式读取**

```js
const rs = fs.createReadStream('./观书有感.txt')
// 读取时需要绑定一个 data 事件
rs.on('data',data=>{
    console.log(data.toString())
})
// 通过绑定一个 end 事件感知结束，做结束后的处理
rs.on('end',()=>{
    console.log('读完啦~~')
})
```

### 文件移动重命名

```js
// 异步 -- 重命名
fs.rename('./观书有感.txt','./观书有感（新）.txt',err=>{
    if(err) return
    console.log('重命名完成')
})

// 同步 -- 移动
fs.renameSync('./观书有感.txt','./观书有感（新）.txt');
```

### 文件删除

```js
// 异步
fs.unlink('./我是文件名.txt',e=>{
    if(e) return
    console.log('删除成功')
})
// 同步
fs.unlinkSync('./我是文件名.txt')
```

### 文件夹操作

```js
// 异步创建 --- 同步略
fs.mkdir('./page',e=>{
    console.log('page文件夹创建成功')
})

fs.mkdir('./page/1/2/3', { recursive: true }, e => {
    console.log('递归创建成功')
})
// 异步读取 --- 同步略
fs.readdir('../',(e,data)=>{
    console.log(data)
})

// 异步删除 --- 同步略
fs.rmdir('./page', { recursive: true }, (e) => {
    console.log('递归删除成功')
})
```

### 查看资源状态

```js
fs.stat('./观书有感（新）.txt', (err, data) => {
    if (err) throw err;
    console.log(data);
});

/*
Stats {
    dev: 2696720612,
    mode: 33206,
    nlink: 1,
    uid: 0,
    gid: 0,
    rdev: 0,
    blksize: 4096,
    ino: 58828270132743070,
    size: 92,
    blocks: 0,
    atimeMs: 1682221257321.1943,
    mtimeMs: 1682220351541.7078,
    ctimeMs: 1682221247284.157,
    birthtimeMs: 1682220351540.7095,
    atime: 2023-04-23T03:40:57.321Z,
    mtime: 2023-04-23T03:25:51.542Z,
    ctime: 2023-04-23T03:40:47.284Z,
    birthtime: 2023-04-23T03:25:51.541Z
  }*/
```

## path模块

```js
const testPath = path.resolve(__dirname,'test')	// 用于拼接 绝对路径
const sep = path.sep 							// 操作系统的路径分隔符 Windows下\
let pathname = 'D:/program file/nodejs/node.exe';
const pathObj = path.parse(pathname) /*
        {
          root: 'D:/',
          dir: 'D:/program file/nodejs',
          base: 'node.exe',
          ext: '.exe',
          name: 'node'
        }*/
const pathBaseName = path.basename(pathname)
const pathDirName = path.dirname(pathname)
const pathExtName = path.extname(pathname)
```

## http模块

服务端

```js
// 引入
const http = require('http')
// 创建服务
const server = http.createServer((req, resp) => {
    resp.end('Hello node.js --- http')
})
// 启动 --- 监听
server.listen(9000, () => {
    console.log('服务启动')
})
```

客户端

```js
const http = require('http')

// http client 例子
var client = http.get('http://127.0.0.1:9000', function(clientRes){
    clientRes.pipe(process.stdout);
});
```



### request

**属性**

request.method 请求方法

request.url 请求路径

request.headers 请求头对象 -- 全转为小写

**方法**

request.on(‘data’,(c)=>{})		读取请求体中的流

request.on(‘data’,()=>{})

```js
{
  'user-agent': 'PostmanRuntime/7.32.2',
  accept: '*/*',
  'postman-token': '96133045-c428-4acb-9a2a-2e2b9e2abb51',
  host: 'localhost:9000',
  'accept-encoding': 'gzip, deflate, br',
  connection: 'keep-alive',
  cookie: 'user=123'
}
```



```js
// 引入
const http = require('http')
// 创建服务
const server = http.createServer((req, resp) => {
    if (req.url === '/login' && req.method === 'GET') {
        resp.end('欢迎登录')
    } else {
        resp.end('<h1>404 Not Fount</h1>')
    }
})
// 启动 --- 监听
server.listen(9000, () => {
    console.log('服务启动')
})
```

### response

```js
// 解决中文乱码
response.setHeader('content-type','text/html;charset=utf-8');
```

```js
// 响应体
response.wirte('xxxx')
response.end('xxx')
response.end()
// 设置响应状态码，状态描述，响应头，第三个参数可省略，或 
res.writeHead(200, 'ok', {
    'Content-Type': 'text/plain'
});
// 响应状态码
res.statusCode = 200
// 状态描述
res.statusMessage = 'ok'
// 响应头 --- 增删改查
res.setHeader('Content-Type', 'text-plain')
res.removeHeader('Content-Type')
res.getHeader('content-type')

```



## express框架

### hello express

```sh
npm init -y			## 初始化包
npm i express		## 下载
```

```js
const express = require('express')  // 引入
const app = express()               // 实例化

// 创建路由
app.get('/home',(req,resp)=>{
    resp.end('hello express~~')
})

// 监听
app.listen(9000,()=>{
    console.log('服务已启动')
})
```

路由和gin基本相同

### 请求

```js
// 获取请求头中指定的属性
app.get('/header',(req,resp)=>{
    console.log(req.get('host'))
    resp.end()
})


// 获取get表单中的参数 ---- 表单参数封装在了query对象中
app.get('/query', (req, resp) => {
    const query = req.query
    console.log(query)
    resp.end()
})

// 获取路由参数 --- 路由上的参数封装在了params对象中
app.get('/sku/:id',(req,resp)=>{
    resp.send('商品id为' + req.params.id) 
})


```

### 响应

```js
app.get('/resp',(req,resp)=>{

    resp.set('token','xascfa')  // 设置响应头
    resp.status(200)        // 响应状态码

    resp.send('中文不乱码')       // 响应字符串
    resp.json({mag:'success',data:1})   // 响应json对象
    resp.redirect('http://baidu.com')   // 重定向
    resp.sendFile(__dirname + 'index.html') // 响应文件
    resp.download('../package.json')    // 下载
    
    // 链式编程 --- 响应json
    resp.status(200).json({mag:'success',data:1})
    
})
```

### 中间件

**全局中间件** --- 和gin类似

```js
const express = require('express')  // 引入
const app = express()               // 实例化

function recordMiddleware(req,resp,next){
    console.log('中间件被执行了')
    next()
    console.log('走的时候也执行了')
}
app.use(recordMiddleware)
```

**局部中间件** --- 和gin类似，主要三个入参

```js
app.get('/hook',recordMiddleware,(req,resp,next)=>{
    console.log('业务')
    resp.send()
    next()
},(req,resp,next)=>{
    console.log('再来一个中间件')
})
```

**静态资源加载**

```js
const express = require('express');
const app = express();
//静态资源中间件的设置，将当前文件夹下的public目录作为网站的根目录
app.use(express.static('./public'));
```

**处理请求体、请求参数**

```js
// jsonParser中间件将请求体封装成了对象
const jsonParser = express.json()
// urlPasser中间件将url路径拼参封装为对象
const urlParser = express.urlencoded()
app.post('/json', urlParser, (req, resp) => {
    console.log(req.body)
    resp.json(req.body)
})
```

### 路由

一个路由文件

```js
const express = require('express')  // 引入

const r = express.Router()          // 路由实例化
r.get('/get',(req,resp)=>{
    resp.send()
})
r.post('/post',(req,resp)=>{
    resp.send()
})

module.exports = r					// 暴露
```

主文件

```js
const express = require('express')  // 引入
const app = express()
const testApp = require('./test')

app.use(testApp)

app.listen(9000,()=>{
    
})
```

会话

### 接入mysql

```sh
npm install --save mysql2
```

```js
const mysql = require('mysql2/promise')

// 通过createPool方法连接服务器
const db = mysql.createPool({
  host: '127.0.0.1', // 表示连接某个服务器上的mysql数据库
  user: 'root', // 数据库的用户名 （默认为root）
  password: '123456', // 数据库的密码 (默认为root)
  database: 'dbtest11', // 创建的本地数据库名称
})

// 测试数据库是否连接成功
db.getConnection((err, conn) => {
  conn.connect(err => {
    if (err) {
      console.log('连接失败~')
    } else {
      console.log('连接成功~')
    }
  })
})

module.exports = db
```

```js
var express = require('express')
const db = require('../config/db.config')
var router = express.Router()

// 通过nodejs获取数据库中的数据  并返回给客户端-
// 给user中添加用户名和密码
router.get('/addUser', async (req, res) => {
  const sql = 'insert into users (userid,department_id) values (?,?)' // 构建sql语句
  // 执行sql语句
  let ret = await db.query(sql, ['Mary', 2])
  console.log(ret)
  res.send({
    ok: 1,
  })
})

module.exports = router
```

### 业务分层

`app.js`

```js
var express = require('express');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
```

`router/user.js`

```js
var express = require('express')
var router = express.Router()
const userController = require('../controllers/userController')

router.get('/', userController.getUser)

router.post('/', userController.addUser)

router.put('/:id', userController.updateUser)

router.delete('/:id', userController.deleteUser)

module.exports = router
```

`controllers/userController.js`

```js
const userService = require('../services/userService')

const userController = {
  async getUser(req, res, next) {
    const { page, limit } = req.query
    let data = await userService.getUser(page, limit)
    res.send(data)
  },
  async addUser(req, res, next) {
    const { username, password, age } = req.body
    let data = await userService.addUser({ username, password, age })
    res.send(data)
  },
  async updateUser(req, res, next) {
    let data = await userService.updateUser(req.params.id)
    res.send(data)
  },
  async deleteUser(req, res, next) {
    let data = await userService.deleteUser(req.params.id)
    res.send(data)
  },
}

module.exports = userController
```

`services/userService.js`

```js
const userModel = require('../model/userModel')

const userService = {
  getUser(page, limit) {
    return userModel
      .find({}, { _id: 0 })
      .sort({
        age: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit)
  },
  addUser({ username, password, age }) {
    return userModel.create({
      username,
      password,
      age,
    })
  },
  updateUser(_id) {
    return userModel.updateOne(
      {
        _id,
      },
      {
        username: '更新',
      },
    )
  },
  deleteUser(_id) {
    return userModel.deleteOne({
      _id,
    })
  },
}

module.exports = userService
```

`model/UserModel.js`

```js
const mongoose = require('mongoose')

const userType = new mongoose.Schema({
  username: String,
  password: String,
  age: Number,
})

const UserModel = mongoose.model('UserModel', userType, 'users')

module.exports = UserModel
```

`config/db.config.js`

```js
const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/ds')
//插入集合和数据,数据库ds2会自动创建

// 监听mongodb数据库的连接状态
// 绑定数据库连接成功事件
mongoose.connection.once('open', function () {
  console.log('连接成功')
})
// 绑定数据库连接失败事件
mongoose.connection.once('close', function () {
  console.log('数据库连接已经断开')
})
```

