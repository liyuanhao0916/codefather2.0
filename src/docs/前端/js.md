# JS

## 概述

### 组成

- ECMAScript：规定了js基础语法核心知识
- Web APIs
  - DOM：操作文档，比如对页面元素进行移动、大小、添加删除等操作
  - BOM：操作浏览器，比如页面弹窗，检测窗口宽度、存储数据到浏览器

### 位置

**内部**：script标签写在body尾部

**外部**

```html
<body>
  ...
  <script src="#"></script>
</body>
```

**内联**

```html
<body>
  <button onclick="alert("hello ~~")">点我</button>
</body>
```

### 重绘和回流

**浏览器是如何进行界面渲染的**

- 解析（Parser）HTML，生成DOM树(DOM Tree)
- 同时解析（Parser） CSS，生成样式规则 (Style Rules)
- 根据DOM树和样式规则，生成渲染树(Render Tree)
- 进行布局 Layout(回流/重排):根据生成的渲染树，得到节点的几何信息（位置，大小）
- 进行绘制 Painting(重绘): 根据计算和获取的信息进行整个页面的绘制
- Display: 展示在页面上

**回流**

当 Render Tree 中部分或者全部元素的尺寸、结构、布局等发生改变时，浏览器就会重新渲染部分或全部文档的
过程称为 回流，**影响到布局了，就会有回流**

- 页面的首次刷新
- 浏览器的窗口大小发生改变
- 元素的大小或位置发生改变
- 改变字体的大小
- 内容的变化（如：input框的输入，图片的大小）
- 激活css伪类 （如：:hover）
- 脚本操作DOM（添加或者删除可见的DOM元素）

**重绘**

由于节点(元素)的样式的改变并不影响它在文档流中的位置和文档布局时(比如：color、background-color、
outline等), 称为重绘，**不影响布局的其他样式改变，就会重绘**

重绘不一定引起回流，而回流一定会引起重绘

```js
let s = document.body.style
s.padding = '2px'			// 重绘、回流
s.border = '1px solid red'	// 再次 重绘、回流
s.color = 'blue'			// 重绘
s.backgroundColor = '#ccc'	// 重绘
s.fontSize = '14px'			// 重绘、回流
```

### 执行机制

js是单线程的

异步是通过回调函数实现的，也叫事件循环

先开一个主线程执行同步任务，形成执行队列，将耗时的放到任务队列，异步执行，包括

- 事件
- 资源加载（load、error）
- 定时器（setInterval、setTimeout）

## ECMAScript

### let与var

var 的问题:

- 可以先使用在声明 (不合理)
- var 声明过的变量可以重复声明(不合理)
- 比如变量提升、全局变量、没有块级作用域等等

**变量提升**，只有var声明的会发生变量提升

```js
// 访问变量 str
console.log(str + 'world!')	// undefinedworld!

// 声明变量 str
var str = 'hello '

//-----------------实际上是这样执行的--------------
var str;
console.log(str + 'world!')
str = 'hello '
```

### 基本数据类型

**number**

- NaN 是一个不正确的或者一个未定义的数学操作所得到的结果
- 任何对 NaN 的操作都会返回 NaN

**string**

- 单引号双引号都可以，嵌套时使用  外双内单，或者外单内双
- 反引号用于模版字符串，避免变量拼接

```js
document.write(`name=${name},age=${age}`)
```

**boolean**

- ‘’、0、undefined、null、false、NaN 转换为布尔值后都是false, 其余则为 true

**undefined**

- 只声明变量，不赋值的情况下，变量的默认值为 undefined
- 检测这个变量是不是undefined，就判断用户是否有数据传递过来

**null**

- undefined  表示没有赋值，null 表示赋值了，但是内容为空

```js
let arr = [1,true,undefined,null,'aa']
console.log(arr[0])
console.log(arr[1])
console.log(arr[2])
console.log(arr[3])
console.log(arr[4])

// 输出类型两种方式 typeof 关键字 或 typeof() 函数
console.log(typeof arr)
console.log(typeof (arr[0]))
console.log(typeof arr[1])
console.log(typeof arr[2])
console.log(typeof arr[3])
console.log(typeof arr[4])
```

使用**表单、prompt 获取**过来的数据**默认是字符串**类型的，此时就不能直接简单的进行加法运算

### 类型转换

**隐式转换**

- +号两边有一个字符串，就把另一个转为字符串
- +号作为正号解析可以转换成数字型
- 其他算术运算符，会把字符串转成数字类型

```js
let a = 11 + '11'		// 1111
let b = '11' + 11		// 1111
let c = 11 - '11'		// 0
let d = '11' / 11		// 1
let e = +'11' + 11	// 22
let f = '' - 1			// -1  空字符串转为0
let g = null - 1		// -1  null 转为 0
```

**显式转换**

```js
// 转数字 --- 不是数字会转为NaN
console.log(typeof Number('11'))
console.log(parseInt('11.11'))		// 只要整数部分
console.log(parseFloat('11.11'))	// 若是小数输出为小数。保留14位，整数则输出为整数

// 转字符串
let i = 11.11
console.log(String(i))
console.log(i.toString())

// 转换为boolean
console.log(Boolean('true'))
```

### 运算符、语句

**运算符**

- = 单等是赋值
- == 是判断
- === 是全等，类型也要一样
- !==： 左右两边是否不全等
- 开发中判断是否相等，强烈推荐使用 ===、!==
- NaN不等于任何值，包括它本身
- 尽量不要比较小数，因为小数有精度问题
- 不同类型之间比较会发生隐式转换，所以用 ===
- 有三元运算符
- 展开运算符 --- 用于数组的展开

**语句**

if、switch、for、while 和java相同

### 数组

- 抽奖，抽过的人就在数组中移除
- splice可以删除，也可以新增，三个参数
  - 第一个是起始位置
  - 第二个是（删除）几个，若为0表示新增，不填表示删除到最后
  - 第三个是增加的元素

```js
let arr = [1]
// 增
let len = arr.push(1,22.1,'1',true)		// 尾部添加
let len = arr.unshift(1,1,1)					// 头部添加 [4, 5, 6, 1]
arr.splice(0,0,0)						// 在索引为0的位置添加0 [0,1]
// 删
let value = arr.pop()									// 删除尾部元素
let value = arr.shift()								// 删除头部元素
arr.splice(0,1)												// 从索引0开始删除一个
arr.splice(0)													// 从索引0开始删除到最后
// 改
arr[1] = 111
// 查
let a = arr[0]


// 展开
let arr = [2,3,4,67]
console.log(...arr)				// 2 3 4 67
console.log(Math.max(...arr))	// 用于求最值 --- max要求传入的是剩余参数的形式
arr = [...arr,...[1,2,3]]       // 数组合并


// 遍历
const arrColor = ['red','blue']
arrColor.forEach((item,index)=>{
    
})
// map处理数组 类似java中的stream
const arrNew = arrColor.map(function(ele,index){
    console.log(ele)
    console.log(index)
    return ele + '颜色'		// ['red颜色','blue颜色']
})
// filter过滤
const arrnew = arrColor.filter((item,index)=>/[b]{1}/.test(item))

// reduce 累计 --- 起始值可以省略，但是对对象数组操作时不要省，避免空指针
const count = [1, 2, 3].reduce((p, n) => p + n, 0)

// 数组转字符串  和 split 相反
const str = arrColor.join()		// 默认逗号分割
const str = arrColor.join('|')	// 指定分隔符

// find 返回第一个，没有返回undefined
arr.find(item => item.name === '小米')
// every 所有都匹配返回true
[13,22,52].every(item => item >= 20)	// false
// some 有匹配就返回true
[13,22,52].every(item => item >= 20)	// true
// concat 合并
let arr = [1, 4, 6, 9, 21].concat([1,2],[22,1])	// [ 1, 4, 6, 9, 21, 1, 2, 22, 1 ]
// sort 排序 --- 直接改变原数组
[4, 2, 3].sort()			// 小-大
[4, 2, 3].sort((a,b)=>b-a)	// 大-小
// splice 删除或新增
arr.splice(0,0,0)						// 在索引为0的位置添加0 [0,1]
arr.splice(0,1)												// 从索引0开始删除一个
arr.splice(0)													// 从索引0开始删除到最后
// reverse 翻转
const arr = [1, 2, 3]
arr.reverse()		// 或	const arr = [1, 2, 3].reverse()
// findIndex 查索引 --- 第一个满足的
[1, 4, 6, 9, 21].findIndex(a => a >= 4)
// Array.from() 伪数组转真数组
let arr2 = Array.from(arrayLike)
```

### 对象

- 对象（Object、Array、Date）一般声明为const，因为存储的是地址，属性值仍然可以改

- 属性名、方法名 可以使用 "" 或 ''，一般情况下省略，除非名称遇到特殊符号如空格、中横线等
- 有中横线、空格时获取用  对象.['属性名']，[ ]语法里面的值如果不添加引号 默认会当成变量解析

```js
// 声明
let obj1 = {
  name: 'lll',
  age: 11，
  myfunc: function(){
    
  }
}
let obj2 = new Object()

// 增
obj1.weight = 111.11
// 删
delete obj1.age
// 改
obj1.name = 'hhh'
// 查
let age = obj1.age
let name = obj1['name']		// 有中横线、空格时使用

// 遍历
for(let k in obj){
  console.log(k)	// 属性名
  console.log(obj[k])	// 属性值
}

// 构造函数

```

**构造函数**

```js
const person = new Person('a',1)	// 创建对象
// 构造函数
function Person(name,age){
    this.name = name
    this.age = age
}
```

**实例成员与静态成员**

```js
function Person(name,age){
    this.name = name        // 实例属性
    this.age = age
    this.sayHello = ()=>{   // 实例方法
        console.log('hello')
    }
}
Person.sex = 'man'      // 静态属性    
Person.sayHi = ()=>{    // 静态方法
    console.log('hi')
}
const person = new Person('a',1)
console.log(person)
console.log(person.name)
console.log(Person.sex)
person.sayHello() 
Person.sayHi()
```

**实例化**

```js
// Object构造函数实例化
const user = new Object({name: '小明', age: 15})
// 字面量实例化
let student = {name: '杜子腾', age: 21}
// 成员名和变量名相同时可省略其一
let name = 'oooo'
let people = {
    name,
    walk(){}
}
```



### 解构

数组解构 --- 一定要和索引顺序相同

对象解构 --- 属性名一一对应，可以起别名

```js
// 数组解构
let [a, b, c] = [1, 2, 3]				// 批量声明并赋值变量 a b c 
let [a,,c] = [1, 2, 3]					// 跳过
let [a,b,...other] = [1, 2, 3, 4]		// 剩余元素
let [a = 0, b = 0] = [1, 2]				// 默认值
const [a, b, [c, d]] = [1, 2, [3, 4]]	// 多维数组
let a = 1		
let b = 2
;[b,a] = [a,b]							// 交换

// 加分号的几种情况
const str = 'pink'
;[1, 2, 3].map(function (item) {
  console.log(item)
})

let a = 1
let b = 2
;[b, a] = [a, b]

(function () { })();
(function () { })();

// 对象解构
const {name, age} = {
    name: '小明',
    age: 18
}

function render({data:myData}){				// 别名
    
}(resp);

const {code,msg,data:[{id,title}]} = { 		// 复杂对象
      "code": 200,
      "msg": "获取新闻列表成功",
      "data": [
        {
          "id": 1,
          "title": "5G商用自己，三大运用商收入下降",
          "count": 58
        },
        {
          "id": 2,
          "title": "国际媒体头条速览",
          "count": 56
        },
        {
          "id": 3,
          "title": "乌克兰和俄罗斯持续冲突",
          "count": 1669
        },

      ]
    }
```



### 函数

- 命名常用动词：can、is、has、get、set、do、load、add
- 参数
  - 参数列表无类型
  - 可以设置默认值
  - 动态参数 --- 函数中有个默认属性arguments参数的伪数组，**箭头函数不支持**
  - **剩余参数** --- 类似java的可变形参 --- 是一个真数组
- **逻辑中断**，类似默认值
- **返回值**直接return，也不用定义类型，没有return默认返回 undefined
- 如果函数内部，变量没有声明，直接赋值，也当全局变量看，但是强烈不推荐
- 作用域不同可以出现**同名变量**，就近原则
- **匿名函数**可以赋值给变量，也可以直接调用，和go类似，还可以绑定事件
- 可以直接调用**多个匿名函数** --- 用括号括住，最好用逗号隔开
- 当一个函数当做参数来传递给另外一个函数的时候，这个函数就是**回调函数**
- **闭包**，和go基本相同 --- 慎用，可能导致内存泄漏
- **函数提升** --- 和var变量提升类似，但是匿名函数赋给let或const变量不会提升
- **箭头函数** --- 类似java的Lambda表达式，没有动态参数，箭头函数不会创建自己的this,它只会从自己的作用域链的上一层沿用this ---- 因此**绑定事件**的时候推荐**匿名函数**

```js
// 设置默认值
function add(a = 0,b = 0){
  return a + b
}

// 动态参数
function sum(){
    let s = 0
    for(let i = 0; i < arguments.length;i++){
        s += arguments[i]
    }
}

// 剩余参数
function config(baseUrl,...other){
    console.log(baseUrl)
    console.log(other)			// 得到除baseUrl外的真数组
}

// 逻辑中断 --- 类似默认值
function sub(a, b){
  a = a || 0
  b = b || 0
  return a - b
}

// 匿名函数 --- 直接调用
let a = function(a,b){
  return a + b
}(1,2)

// 匿名函数赋给变量
let func = function(a,b){
  document.write(a+b)
}
func(1,8)

// 直接调用多个匿名函数 --- 用括号，最好用逗号隔开
(function(a,b){
    return a + b
}(1,2))

(function () {
alert('aaaa')
}())

// 闭包
function fn(){
    let n = 0
    return function(a){
        n = n + a
        return n
    }
}
let fun = fn()
console.log(typeof fun)		// function
console.log(fun(1))			// 1
console.log(fun(2))			// 3

// 箭头函数直接返回对象需要加括号
const fn = uname => ({name:uname})
console.log(fn('lalal'))	// { name: 'lalal' }
```



### 内置函数

```js
// Math对象包含的方法有：
Ø         random：生成0-1之间的随机数（包含0不包括1）
Ø         ceil：向上取整
Ø         floor：向下取整
Ø         max：找最大数
Ø         min：找最小数
Ø         pow：幂运算
Ø         abs：绝对值

// 生成 0-10 随机数
Math.floor(Math.random() * (10 + 1))
// 生成 4-10 随机数
Math.floor(Math.random() * (5 + 1)) + 4
```

```js
// Object
const obj = {name:11,sayHello(){
    console.log('hello')
}}
let newObj = {}

// 拷贝、批量新增
newObj = Object.assign(newObj,obj)	// 将obj拷贝到newObj
Object.assign(newObj,{age:11})		// 新增属性
console.log(newObj)					// { name: 11, sayHello: [Function: sayHello], age: 11 }

// 键、值 数组
const keys = Object.keys(obj)		// 获取所有成员
const vals = Object.values(obj) 	// 获取所有成员值
console.log(keys)				// [ 'name', 'sayHello' ]
console.log(vals)				// [ 11, [Function: sayHello] ]

```

```js
// 字符串
1. 实例属性 `length` 用来获取字符串的度长(重点)
2. 实例方法 `split('分隔符')` 用来将字符串拆分成数组(重点)
3. 实例方法 `substring（需要截取的第一个字符的索引[,结束的索引号]）` 用于字符串截取(重点)
4. 实例方法 `startsWith(检测字符串[, 检测位置索引号])` 检测是否以某字符开头(重点)
5. 实例方法 `includes(搜索的字符串[, 检测位置索引号])` 判断一个字符串是否包含在另一个字符串中，根据情况返回 true 或 false(重点)
6. 实例方法 `toUpperCase` 用于将字母转换成大写
7. 实例方法 `toLowerCase` 用于将就转换成小写
8. 实例方法 `indexOf`  检测是否包含某字符
9. 实例方法 `endsWith` 检测是否以某字符结尾
10. 实例方法 `replace` 用于替换字符串，支持正则匹配
11. 实例方法 `match` 用于查找字符串，支持正则匹配

注：String 也可以当做普通函数使用，这时它的作用是强制转换成字符串数据类型。
```

```js
// 数值

12.3242.toFixed(2)// toFixed 用于设置保留小数位的长度
```

### 原型对象

**面向对象**通过构造函数实现，但是每次调用对象的方法时，都会创建一个新的函数，存在内存浪费

每个构造函数都有一个prototype属性，指向原型对象，这个对象可以挂载函数，对象实例化时不会多次创建

把那些不变的方法，直接定义在 prototype 对象上，这样 所有对象的实例就可以共享这些方法

构造函数和原型对象中的 this 都指向 实例化的对象

```js
function Star(name,age){
    this.name = name
    this.age = age
}
console.log(Star.prototype)	// 原型对象	{}

// 挂载共享方法
Star.prototype.sing = ()=>{
    console.log('挂载的函数')
}
// 挂载共享属性
Star.prototype.name = '小明'

// 调用
const kaka = new Star('kaka',12)
const lala = new Star('lala',18)
kaka.sing()					// 挂载的函数
console.log(kaka.sing === lala.sing)	// true
```

原型对象还可以对内置的对象扩展一些方法

```js
// 给 数组 扩展一个最值方法
// Array.prototype.max = ()=>Math.max(...this)	// 报错，箭头函数中没有自己的this
Array.prototype.max = function () {
    return Math.max(...this)
}
console.log([11, 34, 71, 32].max())
```

每个原型对象有一个constructor（构造函数） 属性，指向原型对象的爸爸构造函数，

也就是说，每个构造函数有一个属性指向原型对象，每个原型对象有个属性指向构造函数

批量挂载时，采用的是对象声明的格式，以为生成的是一个新的类，所以constructor就不在指向我们想指向的构造函数，需要手动绑定，类似java继承中的super

```js
function Star(name, age) {
    this.name = name
    this.age = age
}
Star.prototype = {
    sing: function () { },
    dance: function () { }
}
console.log(Star.prototype.constructor)		// 指向Object [Function: Object]
Star.prototype = {
    // s手动指向
    constructor: Star,
    sing: function () { },
    dance: function () { }
}
console.log(Star.prototype.constructor)		// 指向 Star  [Function: Star]
```

**原型继承**

```js
// 父类构造函数
function Person() {
    this.eyes = 2
    this.head = 1
    this.sayHello = () => {   // 实例方法
        console.log('hello')
    }
}
// 子类构造函数
function Man() { }

// 继承 --- 通过赋值给原型实现继承
Man.prototype = new Person()
// 指向自己的构造函数
Man.prototype.constructor = Man
// 调用父类方法
new Man().sayHello()
```

**原型链**

> **为啥可以访问原型对象挂载的属性和方法？**
>
> ```txt
> 对象都会有一个属性__proto__ 指向 构造函数的 prototype 原型对象，之所以 我们对象可以使用构造函数 prototype 原型对象的属性和方法，就是因为 对象有 __proto__ 原型 的存在。
> 注意：
> 	-	__proto__ 是JS非标准属性，浏览器中[[prototype]]和__proto__意义相同
> 	- 	__proto__ 用来表明当前实例对象指向哪个原型对象prototype
> 	- 	__proto__ 对象原型里面也有一个 constructor属性，指向创建该实例对象的构造函数
> ```
>
> **内置的函数是怎么访问的？**
>
> ```
> 以上述的Man构造函数为例
>   	- Man中有protopyte属性，指向原型对象，Man通过new关键字，实例化对象man
>   	- man中有__proto__属性，指向原型对象
>   	- 原型对象有 constructor 指向Man
>   	
>   	- 每个原型对象本身就是一个对象，所以也有__proto__属性，指向他的原型对象,通过 __proto__ 连接父级就是原型链
>   	- 即man的__proto__ 指向 Man.prototype,
>   	- Man.prototype.__proto__指向Object.prototype,
>   	- Object..prototype.__proto__指向 null
>   	
> 以 Array的map 为例
> 	- Array 中没有定义map等方法，会通过对象的__proto__属性，找到原型对象，
>     - 原型对象 Array.prototype,map方法就定义在原型对象中，
>     - 若还没有就会通过 __proto__ 再找父级 Object.prototype 中是否定义
>     
> 即：
> 	① 当访问一个对象的属性（包括方法）时，首先查找这个对象自身有没有该属性。
> 	② 如果没有就查找它的原型（也就是 __proto__指向的 prototype 原型对象）
> 	③ 如果还没有就查找原型对象的原型（Object的原型对象）
> 	④ 依此类推一直找到 Object 为止（null）
> 	⑤ __proto__对象原型的意义就在于为对象成员查找机制提供一个方向，或者说一条路线
> ```
>

**instanceof** 运算符和java中的意义相同，用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上

```html
<body>
  <script>
    // function Objetc() {}
    console.log(Object.prototype)
    console.log(Object.prototype.__proto__)

    function Person() {

    }
    const ldh = new Person()
    // console.log(ldh.__proto__ === Person.prototype)
    // console.log(Person.prototype.__proto__ === Object.prototype)
    console.log(ldh instanceof Person)
    console.log(ldh instanceof Object)
    console.log(ldh instanceof Array)
    console.log([1, 2, 3] instanceof Array)
    console.log(Array instanceof Object)
  </script>
</body>
```

### 深拷贝

简单的引用数据类型可以用Object.assign(newObj,oldObj)，复杂的对象套对象或数组这种就不行

- 可以通过**递归函数**

```js
function deepCopy(newObj, oldObj) {
  for (let k in oldObj) {
    if (oldObj[k] instanceof Array) {	// 先处理数组
      newObj[k] = []
      deepCopy(newObj[k], oldObj[k])	// 递归调用
    } else if (oldObj[k] instanceof Object) {	// 处理对象
      newObj[k] = {}
      deepCopy(newObj[k], oldObj[k])	// 递归调用
    } else {
      newObj[k] = oldObj[k]
    }
  }
}
```

- 可以用 **JSON** 序列化`const o = JSON.parse(JSON.stringify(obj))`
- 可以引用 **lodash 库**的 cloneDeep

```html
<body>
  <!-- 先引用 -->
  <script src="./lodash.min.js"></script>
  <script>
    const obj = {
      uname: 'pink',
      age: 18,
      hobby: ['乒乓球', '足球'],
      family: {
        baby: '小pink'
      }
    }
    const o = _.cloneDeep(obj)
    console.log(o)
    o.family.baby = '老pink'
    console.log(obj)
  </script>
</body>
```

### 异常

和java相同

```js
function counter(x, y) {
  if(!x || !y) {
    // throw '参数不能为空!';
    throw new Error('参数不能为空!')
  }
  return x + y
}
```

### this

普通函数中this就是当前对象，和java相同

箭头函数没有自己的this，指向的是上层的this

**改变this指向**

```js
const  obj= {
  name: '小明',
  age: 18
}
function sayHi(x,y) {
  console.log(this);
  return x+y
}
sayHi()		// 直接调用 this 指向的是 window

// call 改变指向，立即调用，分别传参
const rel = sayHi.call(obj,1,2)
// apply 改变指向，立即调用，数组传参
const rel = sayHi.apply(obj,[1,2])
// bind 仅改变指向
const rel = sayHi.bind(obj)
```



## DOM

DOM包括**元素节点**、**属性节点**、**文本节点**、其他（如注释节点）

### 获取元素

document.documentElemen  获取HTML标签

document.body		获取body标签

**querySelector**

querySelectorAll()得到一个伪数组，有长度有索引号，但没有pop()   push() 等数组方法

```js
// 获取对象
const info = document.querySelector('.info') 			// 获取匹配的第一个对象
const li = document.querySelectorAll('ul li')	// 获取匹配的所有对象，只能通过遍历给里面的元素做修改
```

### 获取文本

```js
// 添加、更新文本内容
info.innerText = 'hahah'
info.innerHTML = `哈喽，<b>liyuanhao</b>`
```

### 获取属性

```js
// 比如img的属性
const img = document.querySelector('img') 
img.src = './pic1.png'

// 修改style样式 --- 柱形图
for(let i = 0;i<4;i++){
    const j = prompt(`第 ${i+1} 季度`)
    const b = document.querySelector(`.a .b${i+1}`)
    b.innerHTML = j
    b.style.height = j + 'px'
}
```

### 修改样式

- 如果修改的样式比较多，直接通过style属性修改比较繁琐，可以直接定义类名
- 由于class是关键字, 所以使用className去代替
- className是使用新值换旧值, 如果需要添加一个类,需要保留之前的类名
- classList属性解决新值换旧值的问题

```js
// 带 - 的用小驼峰命名
div.style.paddingLeft = '200px'

div.className = 'active'					// 覆盖
div.classList.add('active')				// 追加
div.classList.remove('active')		// 移除
div.classList.toggle('active')		// 切换，有就移除，没有就添加
div.classList.contains('active')	// 包含吗
```

### 操作表单

- 表单属性中添加就有效果,移除就没有效果,一律使用布尔值表示 如果为true 代表添加了该属性 如果是false 代表移除了该属性

```js
userName.value = '用户名'
password.type = 'password'

btn.disabled = true
select.selected = false
checkbox.checked = true
```

### 操作自定义属性

在html5中推出来了专门的data-自定义属性，在标签上一律以data-开头，在DOM对象上一律以dataset对象方式获取

```html
<body>
  <div class="box" data-id='10'>
    盒子
  </div>
  <script>
  	const box = document.querySelector('.box')
    box.dataset.id = 20
  </script>
</body>
```

### 事件

```html
<body>
  <button>按钮</button>
  <script>
    // 获取元素
  	const button = document.querySelector('button')
    // 绑定点击事件
		button.addEventListener('click',function(){
    	alert('aaa')
		})
  </script>
</body>
```

**事件监听版本**

DOM L0
事件源.on事件 = function() { }

DOM L2
事件源.addEventListener(事件， 事件处理函数)

区别：on方式会被覆盖，addEventListener方式可绑定多次，拥有事件更多特性，推荐使用

**事件类型**

- 鼠标事件
  - click 点击
  - dblclick 双击
  - mouseenter 经过（mouseover会冒泡，不推荐）
- mouseleave 离开（mouseout会冒泡，不推荐）
- 表单事件
  - focus 表单获得焦点
  - blur 表单失去焦点
  - input 表单输入文本
  - change 值被修改并失去焦点时触发
  - submit 提交事件   `e.preventDefault()阻止提交`、`this.reset()重置表单`
- 键盘事件
  - Keydown 按下
  - Keyup 抬起
- M端事件
  - touchstart 接触时触发
  - touchend  移开时触发
  - touchmove 滑动时触发

```js
const div = document.querySelector('div')
// 1. 触摸
div.addEventListener('touchstart', function () {
  console.log('开始摸我了')
})
// 2. 离开
div.addEventListener('touchend', function () {
  console.log('离开了')
})
// 3. 移动
div.addEventListener('touchmove', function () {
  console.log('一直摸，移动')
})
```



- 其他
  - 页面加载  `window.addEventListener('load', function() {})`  
  - HTML文档加载  `window.addEventListener('DOMContentLoaded', function() {})`  
  - 元素滚动 `window.addEventListener('scroll', function() {})`  用于固定导航栏
  - 页面尺寸 `window.addEventListener('resize', function() {})`

**事件对象**

这个对象里有事件触发时的相关信息，例如：鼠标点击事件中，事件对象就存了鼠标点在哪个位置等信息

可以判断用户按下哪个键，比如按下回车键发送
可以判断鼠标点击了哪个元素，从而做相应的操作

常用属性

- type  当前事件的类型
- clientX/Y  光标相对浏览器窗口的位置
- offsetX/Y  光标相于当前 DOM 元素的位置

```js
const search = document.querySelector('input')
console.log(search)
search.addEventListener('keyup',function(e){
    if(e.key === 'Enter'){
        console.log('发送')
    }
})
```

**环境对象**

谁调用，谁就是this，代表着当前函数运行时所处的环境

**事件流**

事件流是事件在执行时的底层机制，主要体现在父子盒子之间事件的执行上

任意事件被触发时总会经历两个阶段：【捕获阶段】和【冒泡阶段】

捕获阶段是【从父到子】的传导过程，冒泡阶段是【从子向父】的传导过程

1. `addEventListener` 第3个参数决定了事件是在捕获阶段触发还是在冒泡阶段触发
2. `addEventListener` 第3个参数为  `true` 表示捕获阶段触发，`false` 表示冒泡阶段触发，默认值为 `false`
3. 事件流只会在父子元素具有相同事件类型时才会产生影响
4. 绝大部分场景都采用默认的冒泡模式

**阻止冒泡**

阻止冒泡是指阻断事件的流动，保证事件只在当前元素被执行，而不再去影响到其对应的祖先元素

通过事件对象的stopPropagation()方法阻止冒泡

```js
// 获取嵌套的3个节点
const outer = document.querySelector('.outer')
const inner = document.querySelector('.inner')
const child = document.querySelector('.child')

// 外层的盒子
outer.addEventListener('click', function () {
  console.log('outer...')
})

// 中间的盒子
inner.addEventListener('click', function (ev) {
  console.log('inner...')

  // 阻止事件冒泡
  ev.stopPropagation()
})

// 内层的盒子
child.addEventListener('click', function (ev) {
  console.log('child...')

  // 借助事件对象，阻止事件向上冒泡
  ev.stopPropagation()
})
```

**事件委托**

若子元素很多，我们可以委托父元素来感知事件的触发

事件对象的target属性是被触发的真实元素，target.tagName全大写

```js
// 假设页面中有 10000 个 button 元素 --- 循环添加事件性能太差
// const buttons = document.querySelectorAll('table button')

// 假设上述的 10000 个 buttom 元素共同的祖先元素是 table
const parents = document.querySelector('table')
parents.addEventListener('click', function (ev) {
  // console.log(ev.target);
  // 只有 button 元素才会真正去执行逻辑
  if(ev.target.tagName === 'BUTTON') {
    // 执行的逻辑
  }
})
```

**事件解绑**

```js
// L0 --- 只有冒泡，没有捕获
btn.onclick = function(){}		// 绑定
btn.onclick = null				// 解绑

// L2 --- 匿名函数无法解绑
function fn(){}
btn.addEventListener('click',fn)	// 绑定
btn.removeEventListener('click',fn)	// 解绑
```

### 滚动与尺寸

| 属性                        | 作用                                     | 说明                                                   |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| scrollLeft和scrollTop       | 被卷去的头部和左侧                       | 配合页面滚动来用，可读写                               |
| clientWidth 和 clientHeight | 获得元素宽度和高度                       | 不包含border,margin，滚动条 用于获取元素大小，只读属性 |
| offsetWidth和offsetHeight   | 获得元素宽度和高度                       | 包含border、padding，滚动条等，只读                    |
| offsetLeft和offsetTop       | 获取元素距离自己定位父级元素的左、上距离 | 获取元素位置的时候使用，只读属性                       |

### 日期时间

```js
// 1. 实例化
// const date = new Date(); // 系统默认时间
const date = new Date('2020-05-01') // 指定时间

console.log(date.getFullYear()) // 4位数 年
console.log(date.getMonth())    // 月 0开始
console.log(date.getDate())     // 天 1开始
console.log(date.getDay())      // 星期 0开始-6
console.log(date.getHours())    // 时
console.log(date.getMinutes())  // 分
console.log(date.getSeconds())  // 秒
console.log(date.getTime())     // 时间戳
console.log(Date.now())         // 时间戳
console.log(+ new Date)         // 时间戳
console.log(new Date().toLocaleString)	// 得到这种格式 2099/9/9 09:09:09
```

### 操作节点

cloneNode参数为true，则会复制所有子节点

```js
const btn = document.querySelector('.btn')

// 增删
btn.addEventListener('click',function(){
    // 创建一个新的
    const p = document.createElement('p')
    p.innerHTML='刚刚创建的小p'
    p.className = 'info'
    // 赋值一份
    const p2 = p.cloneNode(true)
    p2.style.color = 'red'
    // 给盒子添加
    document.querySelector('.box').appendChild(p)
    document.querySelector('.box').appendChild(p2)
    
    
    const relative = document.querySelector('ul li:nth-child(2)')
    const li = document.createElement('li')
    li.innerHTML = '新加一个小li'
    li.style.color = 'red'
    // 在 relative 之前添加 li
    document.querySelector('ul').insertBefore(li,relative)
    
    
    let lis = document.querySelectorAll('li')
    // 删除节点
    document.querySelector('ul').removeChild(lis[0]) 
})

// 查儿子
const ul = document.querySelector('ul')		// 父节点
console.log(ul.childNodes)					// 所有子节点
console.log(ul.children)					// 只获取元素类型节点
console.log(ul.parentNode)					// 获取父节点 -- 以相对位置查找节点，实际应用中非常灵活

// 查兄弟
const lis = document.querySelectorAll('ul li')
for(let i = 0; i < lis.length; i++) {		// 对所有的 li 节点添加事件监听
  lis[i].addEventListener('click', function () {
      console.log(this.previousElementSibling)		// 前一个节点
      console.log(this.nextElementSibling)			// 下一下节点
  })
}
```

 



## BOM

BOM模型中最重要的是window对象

- window对象属性包含了navigator、location、document、history、screen，所以BOM模型包含DOM

- window对象是一个全局对象，也可以说是JavaScript中的顶级对象
- 像document、alert()、console.log()这些都是window的属性，基本BOM的属性和方法都是window的
- 所有通过var定义在全局作用域中的变量、函数都会变成window对象的属性和方法
- window对象下的属性和方法调用的时候可以省略window

### 输入输出

alert() 和 prompt() 它们会跳过页面渲染先被执行

```js
// 输出
document.write('输出内容') //  写入页面
alert('输出内容')					// 弹窗
console.log('nnnnn')		// 控制台输出
// 输入 --- 弹出对话框，输入
prompt('请输入')
```

```js
// 获取姓名并打印
let name = prompt('请输入姓名')
document.write(name)
```

### 定时器

**间歇定时器**

```js
// 启动 ---- 参数为 函数名，间隔时间 ---- 返回值为定时器id用来关闭
const timer = setInterval(function(){
  console.log('hahahaha')
},1000)

// 关闭
clearInterval(timer)
```

**延时定时器**

```js
// 启动
const timer = setTimeout(function(){
	console.log('lalal')
},1000)

// 清除 --- 用于递归调用中
clearTimeout(timer)
```

### location

```js
// href属性
console.log(location.href)					// 获取完整url
location.href = 'http://www.baidu.com'		// 跳转

// search属性
 console.log(location.search)  				// 获取路径上的参数		?search=笔记本

// hash属性  
console.log(location.hash)					// 获取桩		得到 # 后面的地址

// reload 方法  刷新页面
const btn = document.querySelector('.reload')
btn.addEventListener('click', function () {
    // location.reload() 					// 页面刷新
    location.reload(true) 					// 强制页面刷新 ctrl+f5
})
```

### navigator

获取浏览器信息

```js
// 检测 userAgent（浏览器信息）
(function () {
  const userAgent = navigator.userAgent
  // 验证是否为Android或iPhone
  const android = userAgent.match(/(Android);?[\s\/]+([\d.]+)?/)
  const iphone = userAgent.match(/(iPhone\sOS)\s([\d_]+)/)
  // 如果是Android或iPhone，则跳转至移动站点
  if (android || iphone) {
    location.href = 'http://m.itcast.cn'
  }})();
```

### histroy

```js
// 1.前进
const forward = document.querySelector('.forward')
forward.addEventListener('click', function () {
  // history.forward() 		// 前进
  history.go(1)				// 前进1步
})
// 2.后退
const back = document.querySelector('.back')
back.addEventListener('click', function () {
  // history.back()			// 后退
  history.go(-1)			// 后退1步
})
```

### 本地存储

1、页面刷新或者关闭不丢失数据，实现数据持久化

2、容量较大，sessionStorage和 localStorage 约 5M 左右

**sessionStorage**（了解）：当页面浏览器被关闭时，存储在 sessionStorage 的数据会被清除，使用方式同下

**localStorage**（重点）：数据可以长期保留在本地浏览器中，刷新页面和关闭页面，数据也不会丢失，以键值对的形式存储，并且存储的是字符串， 省略了window，只要不跨域，都可以获取到

```js
// 本地存储 - localstorage 存储的是字符串 
// 1. 存储、更改
localStorage.setItem('age', 18)

// 2. 获取
console.log(localStorage.getItem('age'))
console.log(typeof localStorage.getItem('age'))		// string

// 3. 删除
localStorage.removeItem('age')
```

对象存json

```js
// 本地存储复杂数据类型
const goods = {
  name: '小米',
  price: 1999
}

// 1. 把对象转换为JSON字符串  JSON.stringify
localStorage.setItem('goods', JSON.stringify(goods))

// 2. 把JSON字符串转换为对象  JSON.parse
console.log(JSON.parse(localStorage.getItem('goods')))
```

## 正则表达式

```js
// 格式  const reg = /表达式/
const reg = /web/
const isWeb = reg.test('web开发')		// true
```

**边界符**

^ $

**量词**

| 量词  | 说明     |
| ----- | -------- |
| *     | 任意次数 |
| +     | 至少一次 |
| ？    | 最多一次 |
| `{n}`   | n次      |
| `{n,}`  | 至少n次  |
| `{n,m}` | n-m次    |

**范围**

[abc] ---- abc中的一个

[a-z] ---- 小写字母中的一个

[^abc]  ---- 除了abc其他的一个

**预定义**

| 字符 | 说明                                      |
| ---- | ----------------------------------------- |
| \d   | 0-9中的一个，= [0-9]                      |
| \D   | 非\d                                      |
| \w   | 数字、字母、下划线，=[A-Za-z0-9_]         |
| \W   | 非\w                                      |
| \s   | 匹配空格，包括换行、制表符，=[\t\r\n\v\f] |
| \S   | 非\s                                      |

**替换**

```js
const str = '欢迎大家学习前端，相信大家一定能学好前端，都成为前端大神'
const strEnd = str.replace(/前端/, 'web') 	// 只能替换一个

const strEnd = str.replace(/前端/g, 'web')	// 修饰符g全部替换

const str1 = 'Weblalalla-Web--WEB'
const strEnd2 = str1.replace(/web/i, '哈哈')	// 修饰符i不区分大小写 -- 只替换一个
const strEnd2 = str1.replace(/web/ig, '哈哈')	// 修饰符i不区分大小写 -- 全部替换
```



## 案例分析

### 随机点名

```html
<body>
  <div>
    <h2>姓名：xxxx</h2>
    <button>开始</button>
    <button>结束</button>
  </div>
  <script>
     	const nameArr = ['李某某','刘思思','刘亦菲','李一玓','范仲淹']          // 名字数组
      let i                                                              // 存随机数
      const start = document.querySelector('div button:nth-of-type(1)')  // 开始按钮
      const name1 = document.querySelector('div h2:first-child')         // 姓名展示
      const end = document.querySelector('div button:nth-of-type(2)')    // 结束按钮
      let timer                                                          // 存放定时器id
      start.addEventListener('click',function(){
          if(nameArr.length === 1){                               // 剩下最后一个
              name1.innerHTML = '就剩一个人了，别点啦～'              // 提示信息
              start.disabled = true                               // 禁用
              return
          }
          timer = setInterval(function(){                        // 定时器
              i = Math.floor(Math.random() * nameArr.length)      // 随机数
              name1.innerHTML = `姓名：${nameArr[i]}`             // 展示姓名

          })
      })
      end.addEventListener('click',function(){
          clearInterval(timer)                                // 停止定时器
          nameArr.splice(i,1)                                 // 移除被选中的
          console.log(nameArr)                                // 
      })
      console.log(end)
  </script>
</body>
```

### Tab栏切换

- 给a的父级 注册点击事件，采取事件委托方式
- 如果点击的是A , 则进行排他思想，删除添加类
- 注意判断的方式 利用 e.target.tagName
- 因为没有索引号了，所以这里我们可以自定义属性，给5个链接添加序号
- 下面大盒子获取索引号的方式 e.target.dataset.id 号， 然后进行排他思想

```js
// 1. a 模块制作 要给 5个链接绑定鼠标经过事件
// 1.1 获取 a 元素 
const as = document.querySelectorAll('.tab-nav a')
// console.log(as) 
for (let i = 0; i < as.length; i++) {
  // console.log(as[i])
  // 要给 5个链接绑定鼠标经过事件
  as[i].addEventListener('mouseenter', function () {
    // console.log('鼠标经过')
    // 排他思想  
    // 干掉别人 移除类active
    document.querySelector('.tab-nav .active').classList.remove('active')
    // 我登基 我添加类 active  this 当前的那个 a 
    this.classList.add('active')

    // 下面5个大盒子 一一对应  .item 
    // 干掉别人
    document.querySelector('.tab-content .active').classList.remove('active')
    // 对应序号的那个 item 显示 添加 active 类
    document.querySelector(`.tab-content .item:nth-child(${i + 1})`).classList.add('active')

  })
}
```

### 滑块跟随

```js
// 1. 事件委托的方法 获取父元素 tabs-list
const list = document.querySelector('.tabs-list')
const line = document.querySelector('.line')
// 2. 注册点击事件
list.addEventListener('click', function (e) {
  // 只有点击了A 才有触发效果
  if (e.target.tagName === 'A') {
    // console.log(11)
    // 当前元素是谁 ？  e.target
    // 得到当前点击元素的位置
    // console.log(e.target.offsetLeft)
    // line.style.transform = 'translateX(100px)'
    // 把我们点击的a链接盒子的位置  然后移动
    line.style.transform = `translateX(${e.target.offsetLeft}px)`
  }
})
```

### 电梯导航

```js
// 第一大模块，页面滑动可以显示和隐藏
(function () {
  // 获取元素
  const entry = document.querySelector('.xtx_entry')
  const elevator = document.querySelector('.xtx-elevator')
  // 1. 当页面滚动大于 300像素，就显示 电梯导航
  // 2. 给页面添加滚动事件
  window.addEventListener('scroll', function () {
    // 被卷去的头部大于 300 
    const n = document.documentElement.scrollTop
    elevator.style.opacity = n >= entry.offsetTop ? 1 : 0
  })

  // 点击返回页面顶部
  const backTop = document.querySelector('#backTop')
  backTop.addEventListener('click', function () {
    // 可读写
    // document.documentElement.scrollTop = 0
    // window.scrollTo(x, y)
    window.scrollTo(0, 0)
  })
})();

// 第二第三都放到另外一个执行函数里面
(function () {
  // 2. 点击页面可以滑动 
  const list = document.querySelector('.xtx-elevator-list')
  list.addEventListener('click', function (e) {
    // console.log(11)
    if (e.target.tagName === 'A' && e.target.dataset.name) {
      // 排他思想  
      // 先移除原来的类active 
      // 先获取这个active的对象
      const old = document.querySelector('.xtx-elevator-list .active')
      // console.log(old)
      // 判断 如果原来有active类的对象，就移除类，如果开始就没有对象，就不删除，所以不报错
      if (old) old.classList.remove('active')
      // 当前元素添加 active 
      e.target.classList.add('active')
      // 获得自定义属性  new   topic 
      // console.log(e.target.dataset.name)
      // 根据小盒子的自定义属性值 去选择 对应的大盒子
      // console.log(document.querySelector(`.xtx_goods_${e.target.dataset.name}`).offsetTop)
      // 获得对应大盒子的 offsetTop
      const top = document.querySelector(`.xtx_goods_${e.target.dataset.name}`).offsetTop
      // 让页面滚动到对应的位置
      document.documentElement.scrollTop = top

    }
  })


  // 3. 页面滚动，可以根据大盒子选 小盒子 添加 active 类
  window.addEventListener('scroll', function () {
    //  3.1  先移除类 
    // 先获取这个active的对象
    const old = document.querySelector('.xtx-elevator-list .active')
    // console.log(old)
    // 判断 如果原来有active类的对象，就移除类，如果开始就没有对象，就不删除，所以不报错
    if (old) old.classList.remove('active')
    // 3.2 判断页面当前滑动的位置，选择小盒子

    // 获取4个大盒子
    const news = document.querySelector('.xtx_goods_new')
    const popular = document.querySelector('.xtx_goods_popular')
    const brand = document.querySelector('.xtx_goods_brand')
    const topic = document.querySelector('.xtx_goods_topic')
    const n = document.documentElement.scrollTop
    if (n >= news.offsetTop && n < popular.offsetTop) {
      // 选择第一个小盒子
      document.querySelector('[data-name=new]').classList.add('active')
    } else if (n >= popular.offsetTop && n < brand.offsetTop) {
      document.querySelector('[data-name=popular]').classList.add('active')
    } else if (n >= brand.offsetTop && n < topic.offsetTop) {
      document.querySelector('[data-name=brand]').classList.add('active')
    } else if (n >= topic.offsetTop) {
      document.querySelector('[data-name=topic]').classList.add('active')
    }
  })

})();
```

### map、join渲染

```js
// 1. 读取本地存储的数据   student-data  本地存储的命名
const data = localStorage.getItem('student-data')
// 2. 如果有就返回对象，没有就声明一个空的数组  arr 一会渲染的时候用的
const arr = data ? JSON.parse(data) : []
// 获取 tbody
const tbody = document.querySelector('tbody')
// 3. 渲染模块函数 --- 增删改都需要重新渲染，所以单独写一个函数
function render() {
  // 遍历数组 arr，有几个对象就生成几个 tr，然后追击给tbody
  // map 返回的是个数组  [tr, tr]
  const trArr = arr.map(function (item, i) {		// i索引号作为自定义属性，用于删除
    // console.log(item)
    // console.log(item.uname)  // 欧阳霸天
    return `
    <tr>
      <td>${item.stuId}</td>
      <td>${item.uname}</td>
      <td>${item.age}</td>
      <td>${item.gender}</td>
      <td>${item.salary}</td>
      <td>${item.city}</td>
      <td>
        <a href="javascript:" data-id=${i}>删除</a>
      </td>
    </tr> 
    `
  })
  // 追加给tbody
  // 因为 trArr 是个数组， 我们不要数组，我们要的是 tr的字符串 join()
  tbody.innerHTML = trArr.join('')
}

render()

 // 4. 录入模块
const info = document.querySelector('.info')
// 获取表单form 里面带有 name属性的元素
const items = info.querySelectorAll('[name]')
// console.log(items)
info.addEventListener('submit', function (e) {
  // 阻止提交
  e.preventDefault()
  // 声明空的对象
  const obj = {}
  // obj.stuId = arr.length + 1
  // 加入有2条数据   2 
  obj.stuId = arr.length ? arr[arr.length - 1].stuId + 1 : 1
  // 非空判断
  for (let i = 0; i < items.length; i++) {
    // console.log(items) // 数组里面包含 5个表单  name
    // console.log(items[i]) //  每一个表单 对象
    // console.log(items[i].name) //  
    // item 是每一个表单
    const item = items[i]
    if (items[i].value === '') {
      return alert('输入内容不能为空')
    }
    // console.log(item.name)  uname  age gender
    // obj[item.name]   === obj.uname  obj.age 
    obj[item.name] = item.value
  }
  // console.log(obj)
  // 追加给数组
  arr.push(obj)
  //  把数组 arr 存储到本地存储里面
  localStorage.setItem('student-data', JSON.stringify(arr))
  // 渲染页面
  render()
  // 重置表单
  this.reset()
})


// 5. 删除模块
tbody.addEventListener('click', function (e) {
  if (e.target.tagName === 'A') {
    // alert(1)
    // console.log(e.target.dataset.id)
    // 删除数组对应的这个数据
    arr.splice(e.target.dataset.id, 1)
    // 写入本地存储
    localStorage.setItem('student-data', JSON.stringify(arr))
    // 重新渲染
    render()
  }
})
```

### 节流与防抖

**防抖**（debounce）：指触发事件后在 n 秒内函数只能执行一次，如果在 n 秒内又触发了事件，则会打断重新执行，主要适用于 搜索框输入，设定每次输入完毕 n 秒后发送请求，如果期间还有输入，则从新计算时间

```html
<body>
  <div class="box"></div>
  <script>
    const box = document.querySelector('.box')
    let i = 1  // 让这个变量++
    // 鼠标移动函数
    function mouseMove() {
      box.innerHTML = ++i
      // 如果里面存在大量操作 dom 的情况，可能会卡顿
    }
    // 防抖函数
    function debounce(fn, t) {
      let timeId
      return function () {
        // 如果有定时器就清除
        if (timeId) clearTimeout(timeId)
        // 开启定时器 200
        timeId = setTimeout(function () {
          fn()
        }, t)
      }
    }
    // box.addEventListener('mousemove', mouseMove)
    box.addEventListener('mousemove', debounce(mouseMove, 200))

  </script>
</body>
```

**节流**（throttle）：指连续触发事件但是在 n 秒中只执行一次函数，主要适用于  鼠标移动，页面尺寸发生变化，滚动条滚动等开销比较大的情况下

```html
<body>
  <div class="box"></div>
  <script>
    const box = document.querySelector('.box')
    let i = 1  // 让这个变量++
    // 鼠标移动函数
    function mouseMove() {
      box.innerHTML = ++i
      // 如果里面存在大量操作 dom 的情况，可能会卡顿
    }
    // 节流函数 throttle 
    function throttle(fn, t) {
      // 起始时间
      let startTime = 0
      return function () {
        // 得到当前的时间
        let now = Date.now()
        // 判断如果大于等于 500 采取调用函数
        if (now - startTime >= t) {
          // 调用函数
          fn()
          // 起始的时间 = 现在的时间   写在调用函数的下面 
          startTime = now
        }
      }
    }
    box.addEventListener('mousemove', throttle(mouseMove, 500))
  </script>
</body>
```

**lodash库实现节流与防抖**

```html
<body>
  <div class="box"></div>
  <script src="./lodash.min.js"></script>
  <script>
    const box = document.querySelector('.box')
    let i = 1  // 让这个变量++
    // 鼠标移动函数
    function mouseMove() {
      box.innerHTML = ++i
      // 如果里面存在大量操作 dom 的情况，可能会卡顿
    }

    // box.addEventListener('mousemove', mouseMove)
    // lodash 节流写法
    // box.addEventListener('mousemove', _.throttle(mouseMove, 500))
    // lodash 防抖的写法
    box.addEventListener('mousemove', _.debounce(mouseMove, 500))

  </script>
</body>
```

### 自定义插件

插件是通过面向对象实现的

- 定义构造函数，公共的属性（如：入参），公共的方法（如：元素的创建）
- 方法挂载到原型对象（如：事件的回调函数）
- 实例化，调用方法

```html
<body>
    <button id="delete">删除</button>
    <button id="login">登录</button>
    <script>
        // 1.  模态框的构造函数
        function Modal(title = '', message = '') {
            this.title = title
            this.message = message
            this.modalBox = document.createElement('div')
            this.modalBox.className = 'modal'
            this.modalBox.innerHTML = `
                <div class="header">${this.title} <i>x</i></div>
                <div class="body">${this.message}</div>
            `
        }
        // 2. open 方法 挂载 到 模态框的构造函数原型身上
        Modal.prototype.open = function () {
            if (!document.querySelector('.modal')) {
                document.body.appendChild(this.modalBox)
                // 获取 x  调用关闭方法
                this.modalBox.querySelector('i').addEventListener('click', () => {
                    // 箭头函数没有this 上一级作用域的this，即 modal 对象
                    this.close()
                })
            }
        }
        // 3. close 方法 挂载 到 模态框的构造函数原型身上
        Modal.prototype.close = function () {
            document.body.removeChild(this.modalBox)
        }

        // 4. 按钮点击
        document.querySelector('#delete').addEventListener('click', () => {
            const m = new Modal('温馨提示', '您没有权限删除')
            m.open()
        })

    </script>
</body>
```

