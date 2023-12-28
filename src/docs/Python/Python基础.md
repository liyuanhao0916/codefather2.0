# Python基础

## 入门知识

### 基本语法

```
1.在Python中严格区分大小写
2.Python中的每一行就是一条语句，每条语句以换行结束
3.Python中每一行语句不要过长（规范中建议每行不要超过80个字符）
    "rulers":[80],
4.一条语句可以分多行编写，多行编写时语句后边以\结尾  
5.Python是缩进严格的语言，所以在Python中不要随便写缩进  
6.在Python中使用#来表示注释
```

- 输入输出

  - print(...)
  - str = input(“提升信息”)

- 引号：和groovy用法类似，字符串单引号、双引号、三引号都可

  - 三引号相当于js的反引号，可换行

- 数据类型

  - 空 - None
  - 数值：比较长的数值可用下划线分割，java、go都支持这种写法
    - 整型、浮点型、复数

  ```python
  a, b, c, d = 20, 5.5, True, 4+3j
  # int、float、bool、complex
  ```

  

  - 布尔型：True（1）、False（0）
  - 字符串
    - +号拼接在python中不常见，一般用**占位符拼接**或**格式化字符串**
    - 字符串可以乘法运算，表示复制n份

```python
## 引号内的%s %d %f用于占位,引号外的%用于填充
## %3.5s表示字符串长度在3-5之间，不够的左侧空格填充，超过的截断
## %.2f表示保留2位小数

b = 'Hello %s'%'孙悟空'		# Hello 孙悟空
b = 'hello %s 你好 %s'%('tom','孙悟空')
b = 'hello %3.5s'%'abcdefg' 	# %3.5s字符串的长度限制在3-5之间
b = 'hello %s'%123.456
b = 'hello %.2f'%123.456	#
b = 'hello %d'%123.95
```

```python
## 以f开头表示格式化字符串，类似模板字符串的插值语法

c = f'hello {a} {b}'
print(f'a = {a}')
```

- 类型检查
  - Python：type(变量)
  - go：fmt.Printf("%T",变量)
  - java：变量.getClass().getName()
  - c：根据sizeof(变量)推断

- 类型转换

  - int()，float()，str()，bool()和go类似
    - 数字字符串可以直接用int()转

- 运算符

  - 算数运算：**表示乘方，/的运算结果为浮点型，// 的结果为整型
  - 复制运算：也有上述类似的运算
  - 比较运算
    - ==、!=比较的是对象的值
    - is、is not比较的是对象的id
    - 可连用

  ```python
  result = 1 < 2 < 3 			# 相当于 1 < 2 and 2 < 3
  result = 10 < 20 > 15
  ```

  - 逻辑运算：and、or、not 
    - and：第一个为真，返回第二个，否则返回第一个
    - or：第一个为假，返回第二个，否则返回第一个
  - 三元运算：a if 条件 else b，go没有三元运算

### 对象

每个对象都有三种数据

- id：用来标识对象的唯一性，每一个对象都有唯一的id，可以通过id()函数来查看对象的id，id是由解析器生成的，在CPython中，id就是对象的内存地址， 对象一旦创建，则它的id永远不能再改变
- type：类型用来标识当前对象所属的类型，比如：int str float bool 。。。，类型决定了对象有哪些功能，通过type()函数来查看对象的类型，Python是一门强类型的语言，对象一旦创建类型便不能修改

- value：值就是对象中存储的具体的数据，对于有些对象值是可以改变的，对象分成两大类，可变对象 不可变对象

### 流程控制

条件语句：python没有switch

```python
if True : print(1)
```

```python
if False : 		# 没有大括号，通过缩进或4个空格识别
    print(1)
    print(2)
```

```python
if age > 17 :
    print('你已经成年了~~')
else :
    print('你还未成年~~')
```

```python
if 条件表达式 :
    代码块
elif 条件表达式 :
    代码块
elif 条件表达式 :
    代码块
elif 条件表达式 :
    代码块
else :
    代码块
```

循环语句

while可和else搭配使用，也可单独使用

```python
while i < 10 :
    i += 1
    print(i,'hello')
else :
    print('else中的代码块')
```

pass：

- 在代码块中使用pass：在定义函数、类、循环、条件语句等时，如果代码块还没有实现，但语法要求必须有语句，可以使用 pass 来填充这些占位符
- 作为占位符函数或类的实现：在编写代码时，有时可能需要先定义一个函数或类的框架，但实际的实现代码尚未完成。此时，可以使用 pass 来作为占位符
- 忽略异常：在 except 块中，如果由于某种原因你希望捕获异常但不进行任何处理，可以使用 pass 来忽略异常

## 数据类型

分类

- 可变序列与不可变序列
  - 可变：list，dict、set
  - 不可变：str、tuple、range
- 有序与无序
  - 有序：list、str、tuple、range
  - 无序：dict、set

### 列表

list

**可变的序列**

类似js的数组，元素类型随意，索引可以是负数

```python
my_list = [10,'hello',True,None,[1,2,3],print]
stus = ['孙悟空','猪八戒','沙和尚','唐僧','蜘蛛精','白骨精','沙和尚','沙和尚']
## 读
print(stus[-2])			## -2表示倒数第二个
## 删
del stus[1]			## java、go的数组不能删（长度固定）
## 长度
len(my_list)
## 最值 
min(stus)
max(stus)
## 拼接
my_list = [1,2,3] + [4,5,6]
## 重复
my_list = [1,2,3] * 5
## 检查
print('牛魔王' not in stus)
print('牛魔王' in stus)
## 查索引
stus.index('沙和尚')
stus.index('沙和尚',3,7)	## 3是起始位置，7是结束位置
## 次数
stus.count('牛魔王')

```

切片：类似go的切片，左闭右开

```python
stus = ['孙悟空','猪八戒','沙和尚','唐僧','蜘蛛精','白骨精']
print(stus[1:])	# 索引1开始
print(stus[:3])	# 索引3结束，不含
print(stus[:])	# 副本

print(stus[1:7:2])	# 2为步长，即间隔
print(stus[::-1])	# 不能为0，负数代表反向
# 通过切片来修改列表
# 在给切片进行赋值时，只能使用序列
stus[0:2] = ['牛魔王','红孩儿'] #使用新的元素替换旧元素
stus[0:2] = ['牛魔王','红孩儿','二郎神']	# 超过的就添加
stus[0:0] = ['牛魔王'] # 向索引为0的位置插入元素
# 当设置了步长时，序列中元素的个数可以少，但是不能多（超过可替换的个数）
stus[::2] = ['牛魔王','红孩儿','二郎神']


# 通过切片来删除元素
del stus[0:2]
del stus[::2]
stus[1:3] = []
```

> go中切片（slice）是常用的数据结构，类似java的List，被切的数组是底层维护的数组，任何对切片的操作都会影响底层数组（原数组）
>
> go中的数组属于基本类型，是值传递，而java是引用类型，址传递
>
> python中没有数组

字符串也是序列，但是不可变序列，不能修改，可以先转为可变序列

```python
s = 'hello'
# s[1] = 'a' 不可变序列，无法通过索引来修改
# 可以通过 list() 函数将其他的序列转换为list
s = list(s)
print(s)
```

方法

```python
stus.append('bbb')					# 追加
stus.insert(1,'aaa')				# 索引前插
stus.extend(['唐僧','白骨精'])		# 扩展
stus += ['唐僧','白骨精']
stus.clear()					# 清空
result = stus.pop(2)			# 索引删除，无参就是删除最后一个
stus.remove('猪八戒')			# 值删除，最多删一个
stus.reverse()					# 反转
arr.sort()						# 升序
arr.sort(reverse=True)			# 降序
```

遍历

```python
for s in stus :
    print(s)
```

> go
>
> ```go
> for v:=range chan1{
> 	fmt.Println(v)
> }
> ```
>
> js
>
> ```js
> for(let k in obj){
>   console.log(k)	// 属性名
>   console.log(obj[k])	// 属性值
> }
> ```

### 范围

range

用于生成一个自然序列

```python
r = range(5) 		# 生成一个这样的序列[0,1,2,3,4]	
r = range(0,10,2)	# 规定范围，步长，步长默认为1可省略
r = range(10,0,-1)	# 倒序时，主要第一个参数是首元素
print(list(r))	

for i in range(30):
    print(i)

for s in 'hello':
    print(s)
```

### 元组

tuple

**不可变的序列**

```python
my_tuple = () # 创建了一个空元组
# print(my_tuple,type(my_tuple)) # <class 'tuple'>

my_tuple = (1,2,3,4,5) # 创建了一个5个元素的元组
## 括号可省略
my_tuple = 10,20,30,40
my_tuple = 40,
```

```python
## 解构
a,b,c,d = my_tuple
a , b = b , a
a , b , *c = my_tuple
a , *b , c = my_tuple		# 剩余元素位置任意
*a , b , c = my_tuple
a , b , *c = [1,2,3,4,5,6,7]
a , b , *c = 'hello world'
# 不能同时出现两个或以上的*变量
```

其他方法和列表基本相同

> js的解构
>
> ```js
> let [a, b, c] = [1, 2, 3]				// 批量声明并赋值变量 a b c 
> let [a,,c] = [1, 2, 3]					// 跳过
> let [a,b,...other] = [1, 2, 3, 4]		// 剩余元素
> let [a = 0, b = 0] = [1, 2]				// 默认值
> const [a, b, [c, d]] = [1, 2, [3, 4]]	// 多维数组
> let a = 1		
> let b = 2
> ;[b,a] = [a,b]							// 交换
> ```

### 字典

dict类似java的map

```python
d = {
'name':'孙悟空' , 
'age':18 , 
'gender':'男' , 
'name':'sunwukong'
}

d = dict(name='孙悟空',age=18,gender='男') 
```

双值子序列可转字典

- 双值：序列中只有两个值，[1,2] ('a',3) 'ab'
- 子序列：[[1,2],[3,4]]

```python
d = dict([('name','孙悟饭'),('age',18)])
```

```python
len(d)

# 获取
print(d['hello'])	# 不存在会报错
d[key]
d.get('name')		# 不存在抛异常
d.get('name','li')	# 指定默认值

# 校验
in
not in

# 添加
result = d.setdefault('name','猪八戒') 	# 已存在，返回原值
result = d.setdefault('hello','猪八戒')	# 不存在，添加

# 更新
d = {'a':1,'b':2,'c':3}
d2 = {'d':4,'e':5,'f':6, 'a':7}
d.update(d2)

# 删除
del d['a']
del d['b']
result = d.pop('d')
result = d.pop('z','这是默认值')

# 随机删除，一般都是最后一个
result = d.popitem()	# 删除空的抛异常

# 清空
d.clear()

# 遍历
for k in d.keys() :
    print(k , d[k])
for v in d.values():
    print(v)
for k,v in d.items() :
    print(k , '=' , v)

# 浅copy：浅复制会简单复制对象内部的值，如果值也是一个可变对象，这个可变对象不会被复制
e = d.copy()

d = {'a':{'name':'孙悟空','age':18},'b':2,'c':3}
d2 = d.copy()
d2['a']['name'] = '猪八戒'
print('d = ',d)			# d、d2都被修改了
print('d2 = ',d2)
```

### 集合

set类似java的set 无序

```python
s = {10,3,5,1,2,1,2,3,1,1,1,1}
s = {'a' , 'b' , 1 , 2 , 3 , 1}
# s = {[1,2,3],[4,6,7]} TypeError: unhashable type: 'list'

s = set() # 空集合
# 可以通过set()来将序列和字典转换为集合
s = set([1,2,3,4,5,1,1,2,3,4,5])
s = set('hello')
s = set({'a':1,'b':2,'c':3}) # 使用set()将字典转换为集合时，只会包含字典中的键


in
not in
len(s)
s.clear()
s.copy()

s.add(10)
s.update(s2)
s.update((10,20,30,40,50))
s.update({10:'ab',20:'bc',100:'cd',1000:'ef'})	# 只保留k
result = s.pop()		# 随机删除
s.remove(100)			# 按值删除
```

```python
s = {1,2,3,4,5}
s2 = {3,4,5,6,7}

# & 交集运算
result = s & s2 		# {3, 4, 5}
# | 并集运算
result = s | s2 		# {1,2,3,4,5,6,7}

# - 差集
result = s - s2 		# {1, 2}

# ^ 异或集 获取只在一个集合中出现的元素
result = s ^ s2 		# {1, 2, 6, 7}
```

```python
# <= 检查一个集合是否是另一个集合的子集
a = {1,2,3}
b = {1,2,3,4,5}

result = a <= b					# True
result = {1,2,3} <= {1,2,3} 	# True
result = {1,2,3,4,5} <= {1,2,3} # False

# < 检查一个集合是否是另一个集合的真子集
# >= 检查一个集合是否是另一个的超集
# > 检查一个集合是否是另一个的真超集
```

### 推导式

**列表推导式**

```python
numbers = [1, 2, 3, 4, 5]
squares1 = [x**2 for x in numbers]					# 类似于js的map
squares2 = [x**2 for x in numbers if x % 2 == 0]	# 类似于js的map+filter
```

**集合推导式**

```python
numbers = [1, 2, 3, 4, 5]
squares_set = {x**2 for x in numbers if x % 2 == 0}
# 输出结果: {16, 4}
```

**字典推导式**

```python
numbers = [1, 2, 3, 4, 5]
squares_dict = {x: x**2 for x in numbers if x % 2 == 0}
# 输出结果: {2: 4, 4: 16}
```

**对象推导式**

```python
numbers = [1, 2, 3, 4, 5]
squares_gen = (x**2 for x in numbers if x % 2 == 0)
# 输出结果: <generator object <genexpr> at 0x7fca10255450>
```



## 函数

```python
def fn() :
    print('这是我的第一个函数！')
    print('hello')
    print('今天天气真不错！')
    
fn()
```

### 形参

```python
def fn2(a , b) :
    # print('a =',a)
    # print('b =',b)
    print(a,"+",b,"=",a + b)
```

默认值

```python
def fn(a = 5 , b = 10 , c = 20):
    print('a =',a)
    print('b =',b)
    print('c =',c)
```

关键字参数

```python
fn(b=1 , c=2 , a=3)
# 混合使用关键字和位置参数时，必须将位置参数写到前面
fn(1,c=30)
```

可变形参：本质是一个元组

```python
def sum(*nums):
    # 定义一个变量，来保存结果
    result = 0
    # 遍历元组，并将元组中的数进行累加
    for n in nums :
        result += n
    print(result)
```

可变参数不是必须写在最后，但是注意，带*的参数后的所有参数，必须以关键字参数的形式传递

```python
def fn2(a,b,*c):
    print('a =',a)
    print('b =',b)
    print('c =',c)
```

如果在形参的开头直接写一个*,则要求我们的所有的参数必须以关键字参数的形式传递

```python
def fn2(*,a,b,c):
    print('a =',a)
    print('b =',b)
    print('c =',c)
fn2(a=3,b=4,c=5)
```

*形参只能接收位置参数，而不能接收关键字参数

**形参可以接收其他的关键字参数，它会将这些参数统一保存到一个字典中

**形参只能有一个，并且必须写在所有参数的最后

```python
def fn3(b,c,**a) :
    print('a =',a,type(a))
    print('b =',b)
    print('c =',c)
    
fn3(b=1,d=2,c=3,e=10,f=20)
```

传参解包

```python
# 创建一个元组
t = (10,20,30)

# 传递实参时，也可以在序列类型的参数前添加星号，按顺序
# 这里要求序列中元素的个数必须和形参的个数的一致
fn4(*t)  

# 创建一个字典
d = {'a':100,'b':200,'c':300}
# 通过 **来对一个字典进行解包操作，按关键字
fn4(**d)
```

### 返回值

直接return即可

```python
def fn():
    # return 'Hello'
    # return [1,2,3]
    # return {'k':'v'}
    def fn2() :
        print('hello')

    return fn2 # 返回值也可以是一个函数
```

python支持多返回值

- 以逗号分割的形式返回，用一个变量接收时，是一个元组
- 以列表方式返回，可以用多个变量接收

```python
def get_values():
    value1 = 10
    value2 = "Hello"
    return value1, value2

result = get_values()
print(result)  # 输出：(10, 'Hello')

value1, value2 = get_values()
print(value1)  # 输出：10
print(value2)  # 输出：Hello
```

```python
def get_values():
    value1 = 10
    value2 = "Hello"
    return [value1, value2]

result = get_values()
print(result)  # 输出：[10, 'Hello']

value1, value2 = get_values()
print(value1)  # 输出：10
print(value2)  # 输出：Hello
```

### 文档字符串

```python
## 查看
help(print)
```

```python
## 定义
def fn():
    """ 
    这是一个测试函数
     """
    return
```

函数第一行写字符串即可，但是由于换行，常用三引号

### 命名空间

命名空间指的是变量存储的位置，每一个变量都需要存储到指定的命名空间当中

- 每一个作用域都会有一个它对应的命名空间

- 全局命名空间，用来保存全局变量。函数命名空间用来保存函数中的变量

- 命名空间实际上就是一个字典，是一个专门用来存储变量的字典

```python
scope = locals()        # 当前命名空间
print(type(scope))      # <class 'dict'>


scope['c'] = 1000 # 向字典中添加key-value就相当于在全局中创建了一个变量（一般不建议这么做）
```

```python
# globals() 函数可以用来在任意位置获取全局命名空间
global_scope = globals()
global_scope['a'] = 30
```

### 匿名函数

```python
(lambda a,b : a + b)(10,20)
```

### 高阶函数

即回调函数

```python
l = [1,2,3,4,5,6,7,8,9,0]
r = filter(lambda i : i > 5 , l)
r = map(lambda i : i ** 2 , l)
print(list(r))

l = ['bb','aaaa','c','ddddddddd','fff']
l.sort(key=len)

l = [2,5,'1',3,'6','4']
l.sort(key=int)

## sorted用法同上，且可对任意的序列进行排序并返回新的对象
print(sorted(l,key=int))
```

### 闭包

```python
def make_averager():
    # 创建一个列表，用来保存数值
    nums = []

    # 创建一个函数，用来计算平均值
    def averager(n) :
        # 将n添加到列表中
        nums.append(n)
        # 求平均值
        return sum(nums)/len(nums)

    return averager

averager = make_averager()

print(averager(10))
print(averager(20))
print(averager(30))
print(averager(40))
```

### 装饰器

```python
def begin_end(old):
    '''
        用来对其他函数进行扩展，使其他函数可以在执行前打印开始执行，执行后打印执行结束

        参数：
            old 要扩展的函数对象
    '''
    # 创建一个新函数
    def new_function(*args , **kwargs):
        print('开始执行~~~~')
        # 调用被扩展的函数
        result = old(*args , **kwargs)
        print('执行结束~~~~')
        # 返回函数的执行结果
        return result

    # 返回新函数        
    return new_function

f = begin_end(fn)
f2 = begin_end(add)
f3 = begin_end(mul)
```

```python
@begin_end
def say_hello():
    print('大家好~~~')

say_hello()
```

## 对象

### 类

```python
class MyClass():
    pass
```

```python
# 使用类来创建对象，就像调用一个函数一样
mc = MyClass() # mc就是通过MyClass创建的对象，mc是MyClass的实例
mc_2 = MyClass()
```

```python
# isinstance()用来检查一个对象是否是一个类的实例
result = isinstance(mc_2,MyClass)
```

```python
# 现在我们通过MyClass这个类创建的对象都是一个空对象
# 也就是对象中实际上什么都没有，就相当于是一个空的盒子
# 可以向对象中添加变量，对象中的变量称为属性
# 语法：对象.属性名 = 属性值
mc.name = '孙悟空'
mc_2.name = '猪八戒'
```

属性与方法

```python
class Person :
    name = 'swk' # 公共属性，所有实例都可以访问

    # 类中的定义的函数，我们称为方法
    def say_hello(self) :
        # 方法每次被调用时，解析器都会自动传递第一个实参
        # 第一个参数，就是调用方法的对象本身，
        #   如果是p1调的，则第一个参数就是p1对象
        #   如果是p2调的，则第一个参数就是p2对象
        # 一般我们都会将这个参数命名为self

        # say_hello()这个方法，可以显示如下格式的数据：
        #   你好！我是 xxx
        #   在方法中不能直接访问类中的属性
        print('你好！我是 %s' %self.name)

# 创建Person的实例
p1 = Person()
p2 = Person()
```

> go
>
> ```go
> type Person struct{
>     Name string
>     Age  int
> }
> 
> p:=Person{
>     Name:"li",
>     age:18,
> }
> ```
>
> c
>
> ```c
> struct Person{
>     char name[5];
>     int age;
> }
> 
> struct Person p = {"li",18};
> ```

### 特殊方法

初始化方法`__init__`类似java的构造器

```python
def __init__(self,name):
    # print(self)
    # 通过self向新建的对象中初始化属性
    self.name = name
```

```python
# del是一个特殊方法，它会在对象被垃圾回收前调用  
def __del__(self):
	print('A()对象被删除了~~~',self)
```

```python
# __str__（）这个特殊方法会在尝试将对象转换为字符串的时候调用
# 它的作用可以用来指定对象转换为字符串的结果  （print函数）  
def __str__(self):
    return 'Person [name=%s , age=%d]'%(self.name,self.age)
```

> go
>
> ```go
> // 提供工厂方法
> func NewPerson(name string,age int) *person{
> 	return &person{name,age}
> }
> 
> // String方法
> func (t *Tc) String() string{
> 	return fmt.Sprintf("Name = %s , age = %d , School = %s",t.Name,t.age,t.School)
> }
> ```

### 封装性

属性隐藏在init方法中

```python
class Dog:
    '''
        表示狗的类
    '''
    def __init__(self , name , age):
        self.hidden_name = name
        self.hidden_age = age

    def say_hello(self):
        print('大家好，我是 %s'%self.hidden_name) 

    def get_name(self):
        '''
            get_name()用来获取对象的name属性
        '''    
        return self.hidden_name

    def set_name(self , name):
        self.hidden_name = name

    def get_age(self):
        return self.hidden_age

    def set_age(self , age):
        if age > 0 :
            self.hidden_age = age    
```

```python
# 可以为对象的属性使用双下划线开头，__xxx
# 双下划线开头的属性，是对象的隐藏属性，隐藏属性只能在类的内部访问，无法通过对象访问
# 其实隐藏属性只不过是Python自动为属性改了一个名字
#   实际上是将名字修改为了，_类名__属性名 比如 __name -> _Person__name

# 使用__开头的属性，实际上依然可以在外部访问，所以这种方式我们一般不用
```

```python
# 一般情况下，使用_开头的属性都是私有属性，没有特殊需要不要修改私有属性
class Person:
    def __init__(self,name):
        self._name = name

    def get_name(self):
        return self._name

    def set_name(self , name):
        self._name = name   

p = Person('孙悟空')

print(p._name)
```

```python
class Person:
    def __init__(self,name,age):
        self._name = name
        self._age = age

    # property装饰器，用来将一个get方法，转换为对象的属性
    # 添加为property装饰器以后，我们就可以像调用属性一样使用get方法
    # 使用property装饰的方法，必须和属性名是一样的
    @property    
    def name(self):
        print('get方法执行了~~~')
        return self._name

    # setter方法的装饰器：@属性名.setter
    @name.setter    
    def name(self , name):
        print('setter方法调用了')
        self._name = name        

    @property
    def age(self):
        return self._age

    @age.setter    
    def age(self , age):
        self._age = age   
```

> go
>
> ```go
> func main() {
> 
> 	p := NewPerson()
> 	p.SetName("li")
> 	name := p.GetName()
> 	fmt.Println(name)
> }
> 
> type Person struct{
>     name string
>     age  int
> }
> 
> func (p *Person)SetName(name string){
>     p.name = name
> }
> func (p Person)GetName() string{
>     return p.name
> }
> 
> func NewPerson() *Person{
> 	return &Person{}
> }
> ```

### 继承性

```python
class Dog(Animal):
    pass
```

> go
>
> ```go
> // 组合
> type A struct{
>     age int
>     other B
> }
> ```

重写同java，也有super

```python
# 父类中的所有方法都会被子类继承，包括特殊方法，也可以重写特殊方法
class Dog(Animal):

    def __init__(self,name,age):
        # 希望可以直接调用父类的__init__来初始化父类中定义的属性
        # super() 可以用来获取当前类的父类，
        #   并且通过super()返回对象调用父类方法时，不需要传递self
        super().__init__(name)
        self._age = age

    def bark(self):
        print('汪汪汪~~~') 

    def run(self):
        print('狗跑~~~~')   

    @property
    def age(self):
        return self._age

    @age.setter    
    def age(self,age):
        self._age = name  
```

多继承 --- 尽量避免使用

```python
class C(A,B):
    pass
```

```python
# 类名.__bases__ 这个属性可以用来获取当前类的所有父类 
print(C.__bases__) # (<class '__main__.A'>, <class '__main__.B'>)
```

### 多态性

正式因为函数的参数没有类型，所以天然具有多态性

```python
class Animal:
    def sound(self):
        pass

class Dog(Animal):
    def sound(self):
        return "汪汪汪"

class Cat(Animal):
    def sound(self):
        return "喵喵喵"

class Cow(Animal):
    def sound(self):
        return "哞哞哞"

def make_sound(animal):
    print(animal.sound())

dog = Dog()
cat = Cat()
cow = Cow()

make_sound(dog)  # 输出："汪汪汪"
make_sound(cat)  # 输出："喵喵喵"
make_sound(cow)  # 输出："哞哞哞"
```

> go
>
> ```go
> type Animal interface {		// 需要使用interface关键字定义接口
>     Sound() string
> }
> 
> type Dog struct{}			// 实现结构体，没有implement
> 
> func (d Dog) Sound() string {	// 针对的是方法，绑定同名方法
>     return "汪汪汪"
> }
> 
> type Cat struct{}
> 
> func (c Cat) Sound() string {
>     return "喵喵喵"
> }
> 
> func MakeSound(a Animal) {		// 这里就和python类似了，提供一个方法，这里就相当于implement
>     fmt.Println(a.Sound())
> }
> 
> func main() {
>     dog := Dog{}
>     cat := Cat{}
> 
>     MakeSound(dog) // 输出："汪汪汪"
>     MakeSound(cat) // 输出："喵喵喵"
> }
> ```

### 类的成员

```python
# 定义一个类
class A(object):

    # 类属性
    # 实例属性
    # 类方法
    # 实例方法
    # 静态方法

    # 类属性，直接在类中定义的属性是类属性
    #   类属性可以通过类或类的实例访问到
    #   但是类属性只能通过类对象来修改，无法通过实例对象修改
    count = 0

    def __init__(self):
        # 实例属性，通过实例对象添加的属性属于实例属性
        #   实例属性只能通过实例对象来访问和修改，类对象无法访问修改
        self.name = '孙悟空'

    # 实例方法
    #   在类中定义，以self为第一个参数的方法都是实例方法
    #   实例方法在调用时，Python会将调用对象作为self传入  
    #   实例方法可以通过实例和类去调用
    #       当通过实例调用时，会自动将当前调用对象作为self传入
    #       当通过类调用时，不会自动传递self，此时我们必须手动传递self
    def test(self):
        print('这是test方法~~~ ' , self)    

    # 类方法    
    # 在类内部使用 @classmethod 来修饰的方法属于类方法
    # 类方法的第一个参数是cls，也会被自动传递，cls就是当前的类对象
    #   类方法和实例方法的区别，实例方法的第一个参数是self，而类方法的第一个参数是cls
    #   类方法可以通过类去调用，也可以通过实例调用，没有区别
    @classmethod
    def test_2(cls):
        print('这是test_2方法，他是一个类方法~~~ ',cls)
        print(cls.count)

    # 静态方法
    # 在类中使用 @staticmethod 来修饰的方法属于静态方法  
    # 静态方法不需要指定任何的默认参数，静态方法可以通过类和实例去调用  
    # 静态方法，基本上是一个和当前类无关的方法，它只是一个保存到当前类中的函数
    # 静态方法一般都是一些工具方法，和当前类无关
    @staticmethod
    def test_3():
        print('test_3执行了~~~')


a = A()
# 实例属性，通过实例对象添加的属性属于实例属性
# a.count = 10
# A.count = 100
# print('A ,',A.count) 
# print('a ,',a.count) 
# print('A ,',A.name) 
# print('a ,',a.name)   

# a.test() 等价于 A.test(a)

# A.test_2() 等价于 a.test_2()

A.test_3()
a.test_3()
```

### type()

`type()` 函数用于获取对象的类型或创建新的类。它可以以不同的方式使用，具体取决于所传递的参数。

1. 获取对象的类型： 当 `type()` 函数只接收一个参数时，它返回该参数的类型信息。例如：

   ```python
   pythonCopy Codex = 10
   print(type(x))  # <class 'int'>
   
   y = "Hello"
   print(type(y))  # <class 'str'>
   ```

2. 创建新的类（动态类）： 当 `type()` 函数接收三个参数时，它可以用于动态地创建一个新的类。这三个参数分别是类名、基类元组和属性字典。例如：

   ```python
   pythonCopy CodeMyClass = type('MyClass', (), {'attribute': 'value'})
   
   obj = MyClass()
   print(obj.attribute)  # value
   ```

   如果需要指定基类，可以将其作为第二个参数传递给 `type()` 函数，如：`type('MyClass', (BaseClass,), {'attribute': 'value'})`

## 模块与包

### 模块

```python
# 在一个模块中引入外部模块
# ① import 模块名 （模块名，就是python文件的名字，注意不要py）
# ② import 模块名 as 模块别名
#   - 在每一个模块内部都有一个__name__属性，通过这个属性可以获取到模块的名字
#   - __name__属性值为 __main__的模块是主模块(调用者)，一个程序中只会有一个主模块
#       主模块就是我们直接通过 python 执行的模块
import test_module as test

print(test.__name__)	## 输出文件名 test_module
print(__name__)			## 输出 __main__ （主模块）
```



```python
import m

# # 访问模块中的变量：模块名.变量名
print(m.a , m.b)
m.test2()
p = m.Person()
print(p.name)

def test2():
    print('这是主模块中的test2')


# 也可以只引入模块中的部分内容，无需通过模块名即可直接调用
# 语法 from 模块名 import 变量,变量....
from m import Person
from m import test
from m import Person,test
from m import * # 引入到模块中所有内容，一般不会使用
p1 = Person()
print(p1)
test()
test2()

# 也可以为引入的变量使用别名
# 语法：from 模块名 import 变量 as 别名
from m import test2 as new_test2

test2()			# 调用的是自己的
new_test2()		# 调用的是模块的
```

### 包

```python
# 包 Package
# 包也是一个模块
# 当我们模块中代码过多时，或者一个模块需要被分解为多个模块时，这时就需要使用到包
# 普通的模块就是一个py文件，而包是一个文件夹
#   包中必须要一个一个 __init__.py 这个文件，这个文件中可以包含有包中的主要内容
from hello import a , b

print(a.c)
print(b.d)

# __pycache__ 是模块的缓存文件
# py代码在执行前，需要被解析器先转换为机器码，然后再执行
#   所以我们在使用模块（包）时，也需要将模块的代码先转换为机器码然后再交由计算机执行
#   而为了提高程序运行的性能，python会在编译过一次以后，将代码保存到一个缓存文件中
#   这样在下次加载这个模块（包）时，就可以不再重新编译而是直接加载缓存中编译好的代码即可
```

`__init__.py`

- 标识目录为一个包：将一个目录作为包来使用，需要在该目录中添加一个空的 `__init__.py` 文件。这样，Python 解释器就能够识别该目录为一个包，我们才可以通过 `import` 语句导入这个包。
- 执行包的初始化操作：`__init__.py` 文件会在导入包时自动执行，允许我们在其中编写一些初始化代码和设置操作。例如，我们可以在 `__init__.py` 中导入其他模块、定义全局变量、执行一些必要的设置等。
- 控制包的导入行为：`__init__.py` 文件还可以影响包导入时的行为。我们可以在 `__init__.py` 中定义导入时需要执行的操作，或者通过设置 `__all__` 变量控制哪些模块和符号可以导出给外部使用。

```
my_package/
    __init__.py
    module1.py
    module2.py
```



```python
# __init__.py

print("Initializing my_package...")

from . import module1
from . import module2

__all__ = ['module1', 'module2']
```



### 标准库

- `os`：提供与操作系统交互的功能，例如文件和目录操作、进程管理等。
- `sys`：提供对 Python 解释器的访问和控制。
- `math`：提供数学运算相关的函数和常量。
- `random`：用于生成伪随机数。
- `datetime`：处理日期和时间的模块。
- `json`：用于 JSON 数据的编码和解码。
- `csv`：读写 CSV 文件的模块。
- `urllib`：用于进行网络请求和处理 URL。
- `http`：提供 HTTP 客户端和服务器的功能。
- `sqlite3`：用于连接和操作 SQLite 数据库。
- `logging`：用于实现日志记录功能。
- `re`：提供正则表达式操作的功能。
- `collections`：提供额外的数据类型，如 `deque`、`Counter` 等。
- `multiprocessing`：用于实现多进程并发执行的功能。
- `threading`：用于实现多线程编程的功能。

### 虚拟环境

- 在开发Python应用程序的时候，系统安装的Python3只有一个版本：3.4。所有第三方的包都会被pip安装到Python3的site-packages目录下
-  如果我们要同时开发多个应用程序，那这些应用程序都会共用一个Python，就是安装在系统的Python 3。如果应用A需要jinja 2.7，而应用B需要jinja 2.6怎么办？

- 这种情况下，每个应用可能需要各自拥有一套“独立”的Python运行环境。virtualenv就是用来为一个应用创建一套“隔离”的Python运行环境

安装

```sh
 pip install virtualenv
 
 ## 创建一个目录并进入
 mkdir myproject
 cd myproject
 ## 创建一个独立的Python运行环境，命名为venv ，，参数--no-site-packages，已经安装到系统Python环境中的所有第三方包都不会复制过来
 virtualenv --no-site-packages venv
 
 ## 进入环境
 source venv/bin/activate
 ## 安装pip依赖
 ## 运行python文件
 
 ## 退出环境
 deactivate
```



## 异常

### 抓

```python
try:
    print(10/0)
except NameError:
    print('出现 NameError 异常')
except ZeroDivisionError:
    print('出现 ZeroDivisionError 异常')
except IndexError:
    print('出现 IndexError 异常')
# Exception 是所有异常类的父类，所以如果except后跟的是Exception，他也会捕获到所有的异常
# 可以在异常类后边跟着一个 as xx 此时xx就是异常对象
except Exception as e :
    print(e,type(e))
finally :
    print('无论是否出现异常，该子句都会执行')
```

### 抛

```python
def add(a,b):
    # 如果a和b中有负数，就向调用处抛出异常
    if a < 0 or b < 0:
        raise Exception('两个参数中不能有负数！')  
    r = a + b
    return r
```



```python
# 也可以自定义异常类，只需要创建一个类继承Exception即可
class MyError(Exception):
    pass

def add(a,b):
    # 如果a和b中有负数，就向调用处抛出异常
    if a < 0 or b < 0:
        raise MyError('自定义的异常')
        
        # 也可以通过if else来代替异常的处理
        # return None
    r = a + b
    return r
```

## IO

### 文件

open的参数`open(file, mode='r', buffering=-1, encoding_=None, errors=None, newline=None, closefd=True, opener=None)`

- 文件路径
- mode模式（操作模式+读取模式）
  - r只读、w可写，自动创建、a追加、x新建，存在会报错，和w区别是防覆盖、r+可读可写，但不存在会报错
  - t文本文件、b字节文件

```python
file_name = 'demo.txt'
file_name = 'hello\\demo.txt'
file_name = r'hello\demo.txt'	# # 使用原始字符串 -- r开头
file_obj = open(file_name) # 打开 file_name 对应的文件

file_obj.close()

# with ... as 语句
try:
    with open(file_name) as file_obj :
        # 在with语句中可以直接使用file_obj来做文件操作
		# 此时这个文件只能在with中使用，一旦with结束则文件会自动close()
        print(file_obj.read())
except FileNotFoundError:
    print(f'{file_name} 文件不存在~~')
```

> go
>
> ```go
> file,err := os.Open("./fileTest.go")
> 
> err2 := file.Close()
> 
> // 通过defer确保关闭
> defer file.Close()
> ```

### 读

读取文本必须指定字符集

```python
file_name = '19-长安漏洞治理'
file = open(file_name,encoding="utf-8")
string =file.read()
print(string)
```

read直接使用可能导致内存泄漏

```python
try:
    with open(file_name,encoding='utf-8') as file_obj:
        # 定义一个变量，来保存文件的内容
        file_content = ''
        # 定义一个变量，来指定每次读取的大小
        chunk = 100
        # 创建一个循环来读取文件内容
        while True:
            # 读取chunk大小的内容
            content = file_obj.read(chunk)
            # 检查是否读取到了内容
            if not content:
                break
            file_content += content

except FileNotFoundError :
    print(f'{file_name} 这个文件不存在！')

print(file_content)
```

```python
with open(file_name , encoding='utf-8') as file_obj:
    # readline()
    # 该方法可以用来读取一行内容
    # print(file_obj.readline(),end='')
    # print(file_obj.readline())
    # print(file_obj.readline())

    # readlines()
    # 该方法用于一行一行的读取内容，它会一次性将读取到的内容封装到一个列表中返回
    # r = file_obj.readlines()
    # pprint.pprint(r[0])
    # pprint.pprint(r[1])
    # pprint.pprint(r[2])

    file_content = ''
    for t in file_obj:
        file_content += t
    print(file_content)
```

### 写

写操作在打开文件时必须指定操作类型（open的第二个参数）

```python
with open(file_name , 'x' , encoding='utf-8') as file_obj:
    # write()来向文件中写入内容，
    # 如果操作的是一个文本文件的话，则write()需要传递一个字符串作为参数
    # 该方法会可以分多次向文件中写入内容
    # 写入完成以后，该方法会返回写入的字符的个数
    file_obj.write('aaa\n')
    file_obj.write('bbb\n')
    file_obj.write('ccc\n')
    r = file_obj.write(str(123)+'123123\n')
    r = file_obj.write('今天天气真不错')
    print(r)
```

操作二进制文件必须指定读取模式

```python
with open(file_name , 'rb') as file_obj:
    # 读取文本文件时，size是以字符为单位的
    # 读取二进制文件时，size是以字节为单位
    # print(file_obj.read(100))

    # 将读取到的内容写出来
    # 定义一个新的文件
    new_name = 'aa.flac'

    with open(new_name , 'wb') as new_obj:

        # 定义每次读取的大小
        chunk = 1024 * 100

        while True :
            # 从已有的对象中读取数据
            content = file_obj.read(chunk)

            # 内容读取完毕，终止循环
            if not content :
                break

            # 将读取到的数据写入到新对象中
            new_obj.write(content)
```

### 读取位置

```python
with open('demo.txt','rt' , encoding='utf-8') as file_obj:
    # seek() 可以修改当前读取的位置
    file_obj.seek(9)
    # seek()需要两个参数
    #   第一个 是要切换到的位置
    #   第二个 计算位置方式
    #       可选值：
    #           0 从头计算，默认值
    #           1 从当前位置计算		当取1或2时，第一个参数只能为0
    #           2 从最后位置开始计算

    print(file_obj.read(100))

    # tell() 方法用来查看当前读取的位置
    print('当前读取到了 -->',file_obj.tell())
```

### 其他

```python
import os
from pprint import pprint		# 格式化输出

# os.listdir() 获取指定目录的目录结构
r = os.listdir()	# 可传一个文件夹，默认为当前文件夹

# os.getcwd() 获取当前所在的目录
r = os.getcwd()

# os.chdir() 切换当前所在的目录 作用相当于 cd
os.chdir('c:/')

# 创建目录
os.mkdir("aaa") # 在当前目录下创建一个名字为 aaa 的目录
# 删除目录
os.rmdir('abc')

# 删除文件
os.remove('aa.txt')
# 移动或重命名	os.rename('aa.txt','bb.txt')
os.rename('旧名字','新名字') # 可以对一个文件进行重命名，也可以用来移动一个文件
os.rename('bb.txt','c:/users/lilichao/desktop/bb.txt')

pprint(r)
```

## JSON序列化

```python
import json
string = json.dumps(obj)

# 序列化并写入文件
file = open(file_name,'w')
json.dump(obj,file)
```

```python
obj = json.loads(string)

# 将文件的内容加到为对象
file = open(file_name,'r')
json.load(file)
```

## yield

类似return的关键字，用于定义生成器函数。生成器函数可以用来创建迭代器，使得函数可以暂停执行，并返回一个值给调用者，然后继续从停止的地方恢复执行

- 生成器函数：`yield`通常与`def`关键字一起使用来定义生成器函数。生成器函数在执行时会返回一个生成器对象，通过调用生成器对象的`__next__()`或者`next()`方法，可以依次获取生成器函数中`yield`语句返回的值

  ```python
  def count_up_to(n):
      i = 0
      while i <= n:
          yield i
          i += 1
  
  # 使用生成器函数创建一个生成器对象
  counter = count_up_to(5)
  print(type(counter))			## <class 'generator'>，迭代器中的数据只能被读取一次
  
  print(next(counter))			## 取出第一个  0
  for i in counter:
      print(i)					## 依次输出剩下的 1-5
  ```

## 反射

```python
class Person:
    def __init__(self, name):
        self.name = name
        
    def greet(self):
        print(f"Hello, my name is {self.name}!")

# 使用getattr获取对象的属性值
person = Person("Alice")
name = getattr(person, "name")
print(name)  # 输出: Alice

# 使用hasattr检查对象是否具有指定的属性
if hasattr(person, "age"):
    age = getattr(person, "age")

# 使用setattr设置对象的属性值
setattr(person, "age", 25)

# 使用getattr调用对象的方法
greet_method = getattr(person, "greet")
greet_method()  # 输出: Hello, my name is Alice!

# 使用dir获取对象的所有属性和方法名
attributes = dir(person)
print(attributes)  # 输出: ['__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', 'greet', 'name']

# 通过__dict__访问和修改对象的属性
person.__dict__["name"] = "Bob"
print(person.name)  # 输出: Bob

```

## 装饰器

相当于java的注解

- 装饰器是一个可调用对象，用于修改函数或类的行为。
- 装饰器可以在不修改原始函数/类源代码的情况下，扩展或修改其功能。
- 装饰器通常通过定义一个嵌套函数来实现，内部函数包装了原始函数，并执行额外的操作。
- 使用 `@` 符号将装饰器应用到目标函数/类上。
- 可以使用多个装饰器修饰一个函数/类，按照从上到下的顺序依次执行。
- 为了保留原始函数的元信息，通常使用 `functools.wraps` 装饰器来装饰内部函数。

```python
def decorator_func(func):
    def wrapper(*args, **kwargs):
        # 在调用被装饰函数之前的逻辑
        # ...
        result = func(*args, **kwargs)  # 调用被装饰函数
        # 在调用被装饰函数之后的逻辑
        # ...
        return result
    return wrapper
```

```python
@decorator_func
def target_func():
    # 原始函数的逻辑
    pass
```

## 泛型

- Python 3.5 版本引入了对泛型的支持。
- 泛型通过 `typing` 模块来实现，提供了一系列用于类型提示和泛型编程的工具和功能。
- 泛型允许在函数、类或方法中使用类型参数，以实现类型的参数化和重用性。
- 使用 `typing.List` 和 `typing.Tuple` 可以声明具有特定类型元素的列表和元组。
- 使用 `typing.TypeVar` 可以创建类型变量，代表任意类型。
- 泛型在 Python 中是一种静态类型提示机制，运行时并不会对类型进行强制检查。

```python
from typing import List, Tuple, TypeVar

T = TypeVar('T')  # 创建一个类型变量 T

def reverse(items: List[T]) -> List[T]:
    return items[::-1]

# 使用泛型函数 reverse
names = ['Alice', 'Bob', 'Charlie']
reversed_names = reverse(names)  # 类型推断为 List[str]
print(reversed_names)  # 输出: ['Charlie', 'Bob', 'Alice']

numbers = [1, 2, 3, 4, 5]
reversed_numbers = reverse(numbers)  # 类型推断为 List[int]
print(reversed_numbers)  # 输出: [5, 4, 3, 2, 1]

# 使用泛型类
class Pair(Generic[T]):
    def __init__(self, first: T, second: T):
        self.first = first
        self.second = second

pair = Pair("hello", "world")  # 类型推断为 Pair[str]
print(pair.first)  # 输出: hello
print(pair.second)  # 输出: world
```



## 注解

类型注解：提示参数或返回值的类型

- :str指定参数类型
- -> str指定返回值类型
- :str=默认值

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

def calculate_discount(price: float, discount: float = 0.1) -> float:
    return price * (1 - discount)
```

