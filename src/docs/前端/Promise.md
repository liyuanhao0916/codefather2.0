# Promise

## 基本使用

Promise是一门新的技术 (ES6规范 )

Promise是 异步编程的 新解决方案

Promise是一个构造函数

Promise对象用来封装一个异步操作并可以获取其成功 /失败的结果值

Promise解决了回调地狱

Promise有一个构造函数，有一个参数，这个参数是一个函数，函数两个形参，resolved函数 和 rejected函数 ，用来接收成功或失败的结果，方便后面链式调用，这个函数的函数体就是要执行的异步任务

```js
// 封装
const p = new Promise((resolve, reject) => {
    setTimeout(() => {
        const time = Date.now()
        if (time % 2 === 1) {
            resolve('成功' + time)
        } else {
            reject('失败' + time)
        }
    }, 1000)
})

// 调用
p.then(
    value=>{
        console.log(value)
    },
    reason=>{
        console.log(reason)
    }
)
```

## 进化一：封装

**延时器**

```js
// 封装为函数
function doDelay(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const time = Date.now()
            if (time % 2 === 1) {
                resolve('成功' + time)
            } else {
                reject('失败' + time)
            }
        }, time)
    })
}

// 通过函数实例化
const p = doDelay(2000)
p.then(
    value => {
        console.log(value)
    },
    reason => {
        console.log(reason)
    }
)
```

**ajax请求**

```js
function get(url) {
    return new Promise((resolve, reject) => {
        const x = new XMLHttpRequest()
        x.open('get', url)
        x.send()
        x.onreadystatechange = () => {
            if (x.readyState !== 4) return

            const { status, response } = x
            if (status >= 200 && status < 300) {
                resolve(JSON.parse(response))
            } else {
                reject(new Error('请求失败：status = ' + status))
            }
        }
    })
}

get('http://www.baidu/com')
    .then(data => {
        console.log(data)
    }, err => {
        console.log(err)
    })
```

**封装fs模块**

```js
function readFile(path) {
    return new Promise((resolve, reject) => {
        require('fs').readFile(path, (err, data) => {
            if (err) reject(err)
            resolve(data)
        })
    })
}

readFile('./js/server.js').then(value => {
    console.log(value.toString())
}, reason => {
    console.log(reason)
})
```

## 进化二：util包

封装到util模块

```js
const util = require('util')
const fs = require('fs')
const readFile = util.promisify(fs.readFile)

readFile('./js/server.js').then(value=>{
    console.log(value.toString())
},reason=>{
    console.log(reason)
})
```

## 进化三：async与await

async是个关键字，作用在函数上，返回Promise对象

- 若函数返回值为非Promise，返回Promise对象，状态为成功，结果就是返回值
- 若函数返回值为Promise对象，返回Promise对象，状态和结果由返回的Promise对象决定
- 若函数抛异常，返回Promise对象，状态为失败，结果就是异常内容

await也是一个关键字，必须定义在async函数内部

- 若await后跟Promise对象，返回值为成功的值
- 若await后跟非Promise，返回啥就是啥
- 失败的情况，需要try-catch捕获

```js
// await 必须在async函数中使用
async function test(){
    const await1 = await {name:'qqq'}
    const await2 = await new Promise((resolve,reject)=>{
        resolve(11)
    })
    try {
        const await3 = await new Promise((resolve,reject)=>{
            reject(11)
        })
        console.log(await3)
    } catch (error) {
        console.log(error)
    }
}

test()
```

进化到async与await

```js
const fs = require('fs')
const util = require('util')
const readFile = util.promiseify(fs.readFile)

async function main(){
    try{
        const data = await readFile('./1.html')
        const data = await readFile('./2.html')
    }catch(e){
        console.log(e)
    }
}
mian()
```

```js
function get(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest
        xhr.responseType = 'json'
        xhr.open('get', url)
        xhr.send()
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response)
                } else {
                    reject(xhr.status)
                }
            }
        }
    })
}

const btn = document.querySelector('.test')
btn.addEventListener('click',async function(){
    const data = await get('http://www.baidu.com')
    console.log(data)
})
```



## 原理

**属性**

Promise有两个属性，PromiseState状态、PromiseResult结果

状态pending变为 resolved ---- 待定到解决 --- resolved 和 fulfilled 意思一样

状态pending变为 rejected ---- 待定到拒绝

只有这 2种 , 且一个 promise对象只能改变一次，无论变为成功还是失败 , 都会有一个结果数据，成功的结果数据一般称为 value, 失败的结果数据一般称为 reason

```js
const p = new Promise((resolve, reject) => {
    if (1 === 1) {
        resolve(2)
        reject('xxxxx')
    }
})
// 上述程序的PromiseState为 fulfilled ，PromiseResult为2,说明状态只能改变一次
```

**原型方法**

then是Promise的原型对象的方法`Promise.prototype.then`，两个回调函数，

- onResolved 监听成功的返回信息	(value)=>{}
- onRejected 监听失败的返回信息    (reason)=>{}

catch也是Promise原型对象的方法，一个回调函数，等价于 then(undefined, onRejected)，用于捕获失败信息

**方法**

resolve 和 reject 是 Promise 的静态方法

- Promise.resolve() 中传入的是 非Promise对象，返回一个Promise对象，状态为成功，结果为传入的内容
- Promise.resolve() 中传入的是 Promise对象，返回的Promise对象状态和结果都由传入的决定
- Promise.reject() 也是相同道理 

 Promise 还有两个静态方法 all 和 race

- 参数是一个Promise对象数组
- all 在都返回成功的情况下 才能拿到成功的结果，否则在失败的结果中列出失败的结果
- race 第一个执行完的，即Promise的状态最先改变的那个对象的结果为准

```js
const pAll = Promise.all([p1, p3, p5])
const pRace = Promise.race([p5, p1, p4])
```

**其他问题**

当执行了resolve方法，对象的状态就会从pending变为resolved

当执行了reject方法 或 抛出了异常，对象的状态就会从pending变为reject

正常情况下是先指定回调再改变状态 , 但也可以先改状态再指定回调

- 直接调用resolve或reject或抛异常或延迟调用then，会在状态改变后再指定回调
- 如果先指定回调，当状态发生改变时，回调函数才调用，拿到数据
- 如果先改变状态，当指定回调时，回调函数就会调用，拿到数据

```js
let p = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('OK');
    }, 1000);
});

p.then(value => {
    console.log(value);
},reason=>{
    
})

// 延迟调用then
setTimeout(() => {
    p.then(value => {
    	console.log(value);
	},reason=>{})
}, 2000);
```

promise.then()返回的新 promise，状态由then回调函数执行的结果决定

- 如果抛出异常 , 新 promise变为 rejected, 结果为抛出的异常
- 如果返回的是非 promise的任意值 , 新 promise变为 resolved, 结果为返回的值
- 如果返回的是另一个新 promise, 此 promise的结果就会成为新 promise的结果

链式编程是由于then调用后返回新的Promise对象

- 成功或失败的结果，在下层then中得到处理
- 任何一层出现的异常，都会**穿透**到最后，在最后统一捕获

手动**中断** --- 可以在回调函数中返回一个pending状态的Promise对象`new Promise(()=>{})`

```js
let p = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('OK');
    }, 1000);
});

p.then(value => {
    console.log(111);
    //有且只有一个方式
    return new Promise(() => {});
}).then(value => {
    console.log(222);
}).then(value => {
    console.log(333);
}).catch(reason => {
    console.warn(reason);
});
```

多个回调都可以拿到结果

```js
const p = new Promise((resolve, reject) => {
    // resolve('OK')
})

///指定回调 - 1
p.then(value => {
    console.log(value)
})

//指定回调 - 2
p.then(value => {
    alert(value)
})
```

then调用后没有返回，下层再获取到的是 undefined

## 手写

第一步，提供一个构造函数new Promise（func），一个原型方法then

```js
function Promise(excutor){

}

Promise.prototype.then = function(onResolved,onRejected){
    
}
```

第二步，观察`new Promise((resolve, reject) => resolve("success"))`

excutor是一个函数，有两个参数，resolve和reject是两个函数，参数是结果

```js
function Promise(excutor){

    // 两个方法 -- 参数是结果
    function resolve(data){}    
    function reject(data){ }

    // 执行
    excutor(resolve,reject)
}
```

第三步，实现resolve和reject方法，达到执行了状态改变

```js
function Promise(excutor) {
    //添加属性
    this.PromiseState = 'pending'
    this.PromiseResult = null
    const self = this               // 由于箭头函数的原因，resolve和reject没有this

    // 两个方法
    function resolve(data) {
        self.PromiseState = 'fulfilled'
        self.PromiseResult = data
    }

    function reject(data) {
        self.PromiseState = 'rejected'
        self.PromiseResult = data
    }

    // 执行
    excutor(resolve, reject)
}
```

第四步，throw异常改变状态 --- 抛异常就要捕获

```js
function Promise(executor){

    this.PromiseState = 'pending'
    this.PromiseResult = null
    //保存实例对象的 this 的值
    const self = this

    function resolve(data){
        self.PromiseState = 'fulfilled'
        self.PromiseResult = data
    }

    function reject(data){
        self.PromiseState = 'rejected'
        self.PromiseResult = data
    }
    try{
        //同步调用『执行器函数』
        executor(resolve, reject)
    }catch(e){
        //修改 promise 对象状态为『失败』
        reject(e)
    }
}
```

第五步，状态只能改一次

```js
function resolve(data){
    if(self.PromiseState !== 'pending') return;
    self.PromiseState = 'fulfilled'
    self.PromiseResult = data
}
```

第六步，then执行回调

```js
Promise.prototype.then = function(onResolved, onRejected){
    //调用回调函数  PromiseState
    if(this.PromiseState === 'fulfilled'){
        onResolved(this.PromiseResult)
    }
    if(this.PromiseState === 'rejected'){
        onRejected(this.PromiseResult)
    }
}
```

第七步，异步任务then执行回调，构造器中声明callback属性 --- then中处理pendding状态

```js
this.callback = {}
function resolve(data){
    if(self.PromiseState !== 'pending') return
    self.PromiseState = 'fulfilled'
    self.PromiseResult = data;
    //调用成功的回调函数
    if(self.callback.onResolved){
        // 执行回调函数
        self.callback.onResolved(data);
    }
}

function reject(data){
    if(self.PromiseState !== 'pending') return;
    self.PromiseState = 'rejected'
    self.PromiseResult = data
    //执行回调
    if(self.callback.onResolved){
        self.callback.onResolved(data)
    }
}
```

```js
Promise.prototype.then = function(onResolved, onRejected){
    if(this.PromiseState === 'fulfilled'){
        onResolved(this.PromiseResult)
    }
    if(this.PromiseState === 'rejected'){
        onRejected(this.PromiseResult)
    }
    //判断 pending 状态
    if(this.PromiseState === 'pending'){
        //保存回调函数
        this.callback = {
            onResolved: onResolved,
            onRejected: onRejected
        }
    }
}
```

第八步，指定多个回调的情形 --- 将callback属性改为数组

```js
this.callbacks = []
function resolve(data){
    if(self.PromiseState !== 'pending') return
    self.PromiseState = 'fulfilled'
    self.PromiseResult = data
    // 执行回调函数
    self.callbacks.forEach(item => {
        item.onResolved(data)
    })
}
```

```js
Promise.prototype.then = function(onResolved, onRejected){
    if(this.PromiseState === 'fulfilled'){
        onResolved(this.PromiseResult)
    }
    if(this.PromiseState === 'rejected'){
        onRejected(this.PromiseResult)
    }
    //判断 pending 状态
    if(this.PromiseState === 'pending'){
        //追加到callback
        this.callbacks.push({
            onResolved: onResolved,
            onRejected: onRejected
        })
    }
}
```

第九步，then方法返回值

```js
Promise.prototype.then = function(onResolved, onRejected){
    return new Promise((resolve, reject) => {
        //调用回调函数  PromiseState
        if(this.PromiseState === 'fulfilled'){
            try{
                //获取回调函数的执行结果
                let result = onResolved(this.PromiseResult);
                //判断
                if(result instanceof Promise){
                    //如果是 Promise 类型的对象
                    result.then(v => {
                        resolve(v);
                    }, r=>{
                        reject(r);
                    })
                }else{
                    //结果的对象状态为『成功』
                    resolve(result);
                }
            }catch(e){
                reject(e);
            }
        }
        if(this.PromiseState === 'rejected'){
            onRejected(this.PromiseResult);
        }
        //判断 pending 状态
        if(this.PromiseState === 'pending'){
            //保存回调函数
            this.callbacks.push({
                onResolved: onResolved,
                onRejected: onRejected
            });
        }
    })
}
```

第十步，异步then返回值 --- then中处理pendding状态

```js
Promise.prototype.then = function(onResolved, onRejected){
    const self = this;
    return new Promise((resolve, reject) => {
        //调用回调函数  PromiseState
        if(this.PromiseState === 'fulfilled'){
            try{
                //获取回调函数的执行结果
                let result = onResolved(this.PromiseResult);
                //判断
                if(result instanceof Promise){
                    //如果是 Promise 类型的对象
                    result.then(v => {
                        resolve(v);
                    }, r=>{
                        reject(r);
                    })
                }else{
                    //结果的对象状态为『成功』
                    resolve(result);
                }
            }catch(e){
                reject(e);
            }
        }
        if(this.PromiseState === 'rejected'){
            onRejected(this.PromiseResult);
        }
        //判断 pending 状态
        if(this.PromiseState === 'pending'){
            //保存回调函数
            this.callbacks.push({
                onResolved: function(){
                    try{
                        //执行成功回调函数
                        let result = onResolved(self.PromiseResult);
                        //判断
                        if(result instanceof Promise){
                            result.then(v => {
                                resolve(v);
                            }, r=>{
                                reject(r);
                            })
                        }else{
                            resolve(result);
                        }
                    }catch(e){
                        reject(e);
                    }
                },
                onRejected: function(){
                    try{
                        //执行成功回调函数
                        let result = onRejected(self.PromiseResult);
                        //判断
                        if(result instanceof Promise){
                            result.then(v => {
                                resolve(v);
                            }, r=>{
                                reject(r);
                            })
                        }else{
                            resolve(result);
                        }
                    }catch(e){
                        reject(e);
                    }
                }
            });
        }
    })
}
```

优化then  --- 封装

```js
Promise.prototype.then = function(onResolved, onRejected){
    const self = this;
    return new Promise((resolve, reject) => {
        //封装函数
        function callback(type){
            try{
                //获取回调函数的执行结果
                let result = type(self.PromiseResult);
                //判断
                if(result instanceof Promise){
                    //如果是 Promise 类型的对象
                    result.then(v => {
                        resolve(v);
                    }, r=>{
                        reject(r);
                    })
                }else{
                    //结果的对象状态为『成功』
                    resolve(result);
                }
            }catch(e){
                reject(e);
            }
        }
        //调用回调函数  PromiseState
        if(this.PromiseState === 'fulfilled'){
            callback(onResolved);
        }
        if(this.PromiseState === 'rejected'){
            callback(onRejected);
        }
        //判断 pending 状态
        if(this.PromiseState === 'pending'){
            //保存回调函数
            this.callbacks.push({
                onResolved: function(){
                    callback(onResolved);
                },
                onRejected: function(){
                    callback(onRejected);
                }
            });
        }
    })
}
```

第11步，catch穿透

```js
Promise.prototype.catch = function(onRejected){
    return this.then(undefined, onRejected);
}

Promise.prototype.then = function(onResolved, onRejected){
    const self = this;
    //判断回调函数参数
    if(typeof onRejected !== 'function'){
        onRejected = reason => {
            throw reason;
        }
    }
    if(typeof onResolved !== 'function'){
        onResolved = value => value;
        //value => { return value};
    }
	...
}
```

第12步，实现 resolve 和 reject

```js
Promise.resolve = function(value){
    //返回promise对象
    return new Promise((resolve, reject) => {
        if(value instanceof Promise){
            value.then(v=>{
                resolve(v);
            }, r=>{
                reject(r);
            })
        }else{
            //状态设置为成功
            resolve(value);
        }
    });
}

Promise.reject = function(reason){
    return new Promise((resolve, reject)=>{
        reject(reason);
    });
}
```

第13步，实现all 和 race 

```js
Promise.all = function(promises){
    //返回结果为promise对象
    return new Promise((resolve, reject) => {
        //声明变量
        let count = 0;
        let arr = [];
        //遍历
        for(let i=0;i<promises.length;i++){
            //
            promises[i].then(v => {
                //得知对象的状态是成功
                //每个promise对象 都成功
                count++;
                //将当前promise对象成功的结果 存入到数组中
                arr[i] = v;
                //判断
                if(count === promises.length){
                    //修改状态
                    resolve(arr);
                }
            }, r => {
                reject(r);
            });
        }
    });
}

Promise.race = function(promises){
    return new Promise((resolve, reject) => {
        for(let i=0;i<promises.length;i++){
            promises[i].then(v => {
                //修改返回对象的状态为 『成功』
                resolve(v);
            },r=>{
                //修改返回对象的状态为 『失败』
                reject(r);
            })
        }
    });
}
```

第14步，then中的回调函数异步执行

```js
//声明构造函数
function Promise(executor){
    //添加属性
    this.PromiseState = 'pending';
    this.PromiseResult = null;
    //声明属性
    this.callbacks = [];
    //保存实例对象的 this 的值
    const self = this;// self _this that
    //resolve 函数
    function resolve(data){
        //判断状态
        if(self.PromiseState !== 'pending') return;
        //1. 修改对象的状态 (promiseState)
        self.PromiseState = 'fulfilled';// resolved
        //2. 设置对象结果值 (promiseResult)
        self.PromiseResult = data;
        //调用成功的回调函数
        setTimeout(() => {
            self.callbacks.forEach(item => {
                item.onResolved(data);
            });
        });
    }
    //reject 函数
    function reject(data){
        //判断状态
        if(self.PromiseState !== 'pending') return;
        //1. 修改对象的状态 (promiseState)
        self.PromiseState = 'rejected';// 
        //2. 设置对象结果值 (promiseResult)
        self.PromiseResult = data;
        //执行失败的回调
        setTimeout(() => {
            self.callbacks.forEach(item => {
                item.onRejected(data);
            });
        });
    }
    try{
        //同步调用『执行器函数』
        executor(resolve, reject);
    }catch(e){
        //修改 promise 对象状态为『失败』
        reject(e);
    }
}

//添加 then 方法
Promise.prototype.then = function(onResolved, onRejected){
    const self = this;
    //判断回调函数参数
    if(typeof onRejected !== 'function'){
        onRejected = reason => {
            throw reason;
        }
    }
    if(typeof onResolved !== 'function'){
        onResolved = value => value;
        //value => { return value};
    }
    return new Promise((resolve, reject) => {
        //封装函数
        function callback(type){
            try{
                //获取回调函数的执行结果
                let result = type(self.PromiseResult);
                //判断
                if(result instanceof Promise){
                    //如果是 Promise 类型的对象
                    result.then(v => {
                        resolve(v);
                    }, r=>{
                        reject(r);
                    })
                }else{
                    //结果的对象状态为『成功』
                    resolve(result);
                }
            }catch(e){
                reject(e);
            }
        }
        //调用回调函数  PromiseState
        if(this.PromiseState === 'fulfilled'){
            setTimeout(() => {
                callback(onResolved);
            });
        }
        if(this.PromiseState === 'rejected'){
            setTimeout(() => {
                callback(onRejected);
            });
        }
        //判断 pending 状态
        if(this.PromiseState === 'pending'){
            //保存回调函数
            this.callbacks.push({
                onResolved: function(){
                    callback(onResolved);
                },
                onRejected: function(){
                    callback(onRejected);
                }
            });
        }
    })
}

//添加 catch 方法
Promise.prototype.catch = function(onRejected){
    return this.then(undefined, onRejected);
}

//添加 resolve 方法
Promise.resolve = function(value){
    //返回promise对象
    return new Promise((resolve, reject) => {
        if(value instanceof Promise){
            value.then(v=>{
                resolve(v);
            }, r=>{
                reject(r);
            })
        }else{
            //状态设置为成功
            resolve(value);
        }
    });
}

//添加 reject 方法
Promise.reject = function(reason){
    return new Promise((resolve, reject)=>{
        reject(reason);
    });
}

//添加 all 方法
Promise.all = function(promises){
    //返回结果为promise对象
    return new Promise((resolve, reject) => {
        //声明变量
        let count = 0;
        let arr = [];
        //遍历
        for(let i=0;i<promises.length;i++){
            //
            promises[i].then(v => {
                //得知对象的状态是成功
                //每个promise对象 都成功
                count++;
                //将当前promise对象成功的结果 存入到数组中
                arr[i] = v;
                //判断
                if(count === promises.length){
                    //修改状态
                    resolve(arr);
                }
            }, r => {
                reject(r);
            });
        }
    });
}

//添加 race 方法
Promise.race = function(promises){
    return new Promise((resolve, reject) => {
        for(let i=0;i<promises.length;i++){
            promises[i].then(v => {
                //修改返回对象的状态为 『成功』
                resolve(v);
            },r=>{
                //修改返回对象的状态为 『失败』
                reject(r);
            })
        }
    });
}
```

