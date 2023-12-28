# Lua

## 基础

### 安装

[官网](https://www.lua.org/download.html)

```sh
curl -R -O http://www.lua.org/ftp/lua-5.4.6.tar.gz
tar zxf lua-5.4.6.tar.gz
cd lua-5.4.6
make all test

## 安装环境变量
make all install
## 如果报错“Permission denied”，则用sudo 尝试
sudo make all install
## 验证
lua -v
```

[Windows安装](https://github.com/rjpcomputing/luaforwindows/releases)

中文乱码

- 修改cmd字符集，仅当前控制台生效

  ```sh
  chcp 65001
  ```

  

### hello world

**交互式**

```sh
lua -i

print('hello word')

## 退出交互
os.exit()
```

**脚本式**

hello.lua

```lua
print('hello world')
```

```sh
lua hello.lua
```

### 注释

```lua
-- 单行注释

--[[
	多行注释
--]]

---[[
	快捷解多行注释，加一个-即可
--]]

--[[
	多行注释
]]
```

### 数据类型

Lua 是动态类型语言，变量不要类型定义,只需要为变量赋值。 值可以存储在变量中，作为参数传递或结果返回。

Lua 中有 8 个基本类型分别为：nil、boolean、number、string、userdata、function、thread 和 table。

| 数据类型 | 描述                                                         |
| :------- | :----------------------------------------------------------- |
| nil      | 这个最简单，只有值nil属于该类，表示一个无效值（在条件表达式中相当于false）。 |
| boolean  | 包含两个值：false和true。                                    |
| number   | 表示双精度类型的实浮点数                                     |
| string   | 字符串由一对双引号或单引号来表示                             |
| function | 由 C 或 Lua 编写的函数                                       |
| userdata | 表示任意存储在变量中的C数据结构                              |
| thread   | 表示执行的独立线路，用于执行协同程序                         |
| table    | Lua 中的表（table）其实是一个"关联数组"（associative arrays），数组的索引可以是数字、字符串或表类型。在 Lua 里，table 的创建是通过"构造表达式"来完成，最简单构造表达式是{}，用来创建一个空表。 |

```lua
print(type("Hello world"))      --> string
print(type(10.4*3))             --> number
print(type(print))              --> function
print(type(type))               --> function
print(type(true))               --> boolean
print(type(nil))                --> nil
print(type(type(X)))            --> string
```

- nil：没有定义的变量的默认值都为nil，类似js的undefined

- boolean：false和nil为false，其余都为true，0也是true

- string：字符串，单引号或双引号

  - 字符块用[[]]，类似js的\``` ```
  - 拼接用..，不能用+
  - 算术运算都会发生类型转换，不能转为number的会报错
  - #可以计算字符串长度

  ```lua
  print([[
    sjjs
    ]])
  -- 字符串拼接用..
  print('sss'..'aa')
  -- 类型转换
  print(1+'1','1'-1,'2' * '3','2'^3)
  -- 长度
  print(#'12345')
  ```

- table：表，可以用来存kv，也可以当作数组

  - 当作数组使用时，索引从1开始，但是也可以给索引0赋值，甚至可以给负索引赋值，本质上还是kv结构
  - 当v置为nil时相当于删除操作，但是不改变索引，即后面元素不会迁移，还是因为本质上是kv结构

  ```lua
  -- 创建空表
  table1 = {}
  -- 键值对结构
  table2 = {k1='a',k2=1}
  table2.k3 = '111'
  table2['key3'] = 'value3'
  print(table2,table2.k1,table2['k2'],table2.k3,table2.key3)
  
  -- 值结构
  table3 = {'sss',1,false,{1,2,3}}
  table3[-1] = -1
  table3[0] = 0
  table3[-2] = -2
  table3[1] = nil
  -- 遍历
  for k,v in pairs(table3) do
      print(k,v,type(v))
  end
  ```

- function：函数

  - 多返回值
  - 匿名函数

  ```lua
  function test1(i)
      if i == 1 then
          print('is 1')
      elseif i == 2 then
          print('is 2')
      else
          print('啥也不是')
      end
  end
  
  test1(3)
  
  
  -- 匿名函数
  function test2(m,n,sum)
      sum(m,n)
  end
  
  test2(1,2,function (m,n)
      print(m,n,m+n)
  end
  )
  ```

- thread：在 Lua 里，最主要的线程是协同程序（coroutine）。它跟线程（thread）差不多，拥有自己独立的栈、局部变量和指令指针，可以跟其他协同程序共享全局变量和其他大部分东西。

  线程跟协程的区别：线程可以同时多个运行，而协程任意时刻只能运行一个，并且处于运行状态的协程只有被挂起（suspend）时才会暂停。

- userdata：userdata 是一种用户自定义数据，用于表示一种由应用程序或 C/C++ 语言库所创建的类型，可以将任意 C/C++ 的任意数据类型的数据（通常是 struct 和 指针）存储到 Lua 变量中调用。

### 变量

- 局部变量生命周期在其作用域内

```lua
a = 1 					-- 全局变量
local b = 2 		    -- 局部变量

function test()
  c = 3					-- 全局变量
  local d = 4		    -- 局部变量
end

function change()
    d = '变成全局变量了'
    local c = '变成局部变量了'
end

print(a,b)              -- 1    2
print(c,d)              -- nil  nil , 因为函数未调用
test()
print(c,d)              -- 3    nil , 局部变量也被销毁
change()                -- c变为局部变量出了作用域就销毁了，就近原则剩下了全局变量的值为3，d变为全局变量不再被销毁
print(c,d)              -- 3    变成全局变量了
```

- 赋值

```lua
a = "hello" .. "world"
t.n = t.n + 1
a, b = 10, 2*x  -- 批量赋值

x, y = y, x                     -- 互换 'x' for 'y'
a[i], a[j] = a[j], a[i]         -- 互换 'a[i]' for 'a[j]'

a, b, c = 0, 1
print(a,b,c)             --> 0   1   nil
a, b = a+1, b+1, b+2     -- value of b+2 is ignored
print(a,b)               --> 1   2
a, b, c = 0
print(a,b,c)             --> 0   nil   nil


```

### 流程控制

**条件**

**循环**

```lua
-- while循环
i = 1
while true do
    print(i)
    i = i+1
    if i > 100 then
        break
    end
end

-- 数值for循环，开始，结束，步长
for i=1,10,2 do
    print(i)
end

-- 泛型for循环
a = {"one", "two", "three"}
for i, v in ipairs(a) do
    print(i, v)
end 

-- repeat循环，相当于do-while
a = 10
repeat
   print("a的值为:", a)
   a = a + 1
until( a > 15 )
```

### 函数

```lua
-- 局部函数
local function test()
end

-- 多返回值
function maximum (a)
    local mi = 1             -- 最大值索引
    local m = a[mi]          -- 最大值
    for i,val in ipairs(a) do
       if val > m then
           mi = i
           m = val
       end
    end
    return m, mi
end

print(maximum({8,10,23,12,5}))

-- 可变参数
function add(...)  
local s = 0  
  for i, v in ipairs{...} do   --> {...} 表示一个由所有变长参数构成的数组  
    s = s + v  
  end  
  return s  
end  
print(add(3,4,5,6,7))  --->25

function average(...)
   result = 0
   local arg={...}    --> arg 为一个表，局部变量
   for i,v in ipairs(arg) do
      result = result + v
   end
   print("总共传入 " .. #arg .. " 个数")
   return result/#arg -- select('#', ...)也可以获取参数个数
end

print("平均值为",average(10,5,3,4,5,6))
```

> **select (index, ···)**
>
> If index is a number, returns all arguments after argument number index;
>
> a negative number indexes from the end (-1 is the last argument).
>
> Otherwise, index must be the string "#", and select returns the total number of extra arguments it received.

```lua
-- 典型情况
function add()
    return 1,0
end
local b,c,d,e,f,g = add(),add(),add()
-- 第一次add只接收了一个返回值
print(b) -- 1
-- 第二次add只接收了一个返回值
print(c) -- 1
-- 第三次add接收了两个返回值
print(d) -- 1
print(e) -- 0
print(f) -- nil
print(g) -- nil
```

### 运算符

**算术运算符**

| 操作符 | 描述                 | 实例                |
| :----- | :------------------- | :------------------ |
| +      | 加法                 | A + B 输出结果 30   |
| -      | 减法                 | A - B 输出结果 -10  |
| *      | 乘法                 | A * B 输出结果 200  |
| /      | 除法                 | B / A 输出结果 2    |
| %      | 取余                 | B % A 输出结果 0    |
| ^      | 乘幂                 | A^2 输出结果 100    |
| -      | 负号                 | -A 输出结果 -10     |
| //     | 整除运算符(>=lua5.3) | **5//2** 输出结果 2 |

**关系运算符**

| 操作符 | 描述                                                         | 实例                  |
| :----- | :----------------------------------------------------------- | :-------------------- |
| ==     | 等于，检测两个值是否相等，相等返回 true，否则返回 false      | (A == B) 为 false。   |
| **~=** | **不等于**，检测两个值是否相等，不相等返回 true，否则返回 false | (A ~= B) 为 true。    |
| >      | 大于，如果左边的值大于右边的值，返回 true，否则返回 false    | (A > B) 为 false。    |
| <      | 小于，如果左边的值大于右边的值，返回 false，否则返回 true    | (A < B) 为 true。     |
| >=     | 大于等于，如果左边的值大于等于右边的值，返回 true，否则返回 false | (A >= B) 返回 false。 |
| <=     | 小于等于， 如果左边的值小于等于右边的值，返回 true，否则返回 false | (A <= B) 返回 true。  |

**逻辑运算符**

| 操作符 | 描述                                                         | 实例                   |
| :----- | :----------------------------------------------------------- | :--------------------- |
| and    | 逻辑与操作符。 若 A 为 false，则返回 A，否则返回 B。         | (A and B) 为 false。   |
| or     | 逻辑或操作符。 若 A 为 true，则返回 A，否则返回 B。          | (A or B) 为 true。     |
| not    | 逻辑非操作符。与逻辑运算结果相反，如果条件为 true，逻辑非为 false。 | not(A and B) 为 true。 |

**其他运算符**

| 操作符 | 描述                               | 实例                                                         |
| :----- | :--------------------------------- | :----------------------------------------------------------- |
| ..     | 连接两个字符串                     | a..b ，其中 a 为 "Hello " ， b 为 "World", 输出结果为 "Hello World"。 |
| #      | 一元运算符，返回字符串或表的长度。 | #"Hello" 返回 5                                              |

**运算符优先级**

从高到低的顺序：

```
^
not    - (unary)
*      /       %
+      -
..
<      >      <=     >=     ~=     ==
and
or
```

除了 **^** 和 **..** 外所有的二元运算符都是左连接的。

```lua
a+i < b/2+1          <-->       (a+i) < ((b/2)+1)
5+x^2*8              <-->       5+((x^2)*8)
a < y and y <= z     <-->       (a < y) and (y <= z)
-x^2                 <-->       -(x^2)
x^y^z                <-->       x^(y^z)
```

### 字符串

```lua
-- 计算字符串的长度（字符个数）
local length = string.len(myString)
-- 计算字符串的长度（字符个数）-含中文的用utf8的方法
local length1 = utf8.len(myString)

string.upper(argument) -- 转大写字母
string.lower(argument) -- 转小写字母

-- mainString 为要操作的字符串， findString 为被替换的字符，replaceString 要替换的字符，num 替换次数（可以忽略，则全部替换）
string.gsub(mainString,findString,replaceString,num) 

string.reverse(arg)	-- 反转

-- 格式化
string.format(...)
string.format("the value is:%d",4)
-- char 将整型数字转成字符并连接， byte 转换字符为整数值(可以指定某个字符，默认第一个字符)。
string.char(arg) 
string.byte(arg[,int])

string.len(arg) -- 长度
string.rep(string, n) 	-- 拷贝

-- 返回一个迭代器函数，每一次调用这个函数，返回一个在字符串 str 找到的下一个符合 pattern 描述的子串。如果参数 pattern 描述的字符串没有找到，迭代函数返回nil。
string.gmatch(str, pattern)
for word in string.gmatch("Hello Lua user", "%a+") do
  print(word) 
end
```

```lua
--[[
在一个指定的目标字符串 str 中搜索指定的内容 substr，如果找到了一个匹配的子串，就会返回这个子串的起始索引和结束索引，不存在则返回 nil。

init 指定了搜索的起始位置，默认为 1，可以一个负数，表示从后往前数的字符个数。

plain 表示是否使用简单模式，默认为 false，true 只做简单的查找子串的操作，false 表示使用使用正则模式匹配。
--]]
string.find (str, substr, [init, [plain]])
string.find("Hello Lua user", "Lua", 1) 
```

```lua
-- 字符串截取，s：要截取的字符串。i：截取开始位置。j：截取结束位置，默认为 -1，最后一个字符。
string.sub(s, i [, j])
```

### 表

```lua
-- 删除第三个元素
table.remove(myArray, 3)

-- 返回 table 连接后的字符串
print("连接后的字符串 ",table.concat(fruits))
-- 指定连接字符
print("连接后的字符串 ",table.concat(fruits,", "))
-- 指定索引来连接 table
print("连接后的字符串 ",table.concat(fruits,", ", 2,3))

-- 在末尾插入
table.insert(fruits,"mango")
-- 在索引为 2 的键处插入
table.insert(fruits,2,"grapes")

-- 排序
table.sort(fruits)
```

### 迭代器

**泛型for循环的in后面的表达式，应该返回泛型 for 需要的三个值：迭代函数、状态常量、控制变量**；与多值赋值一样，如果表达式返回的结果个数不足三个会自动用 nil 补足，多出部分会被忽略。

在Lua中我们常常使用函数来描述迭代器，每次调用该函数就返回集合的下一个元素。Lua 的迭代器包含以下两种类型：

- 无状态的迭代器
- 多状态的迭代器

**无状态迭代器**

无状态的迭代器是指不保留任何状态的迭代器，因此在循环中我们可以利用无状态迭代器避免创建闭包花费额外的代价。

每一次迭代，迭代函数都是用两个变量（状态常量和控制变量）的值作为参数被调用，一个无状态的迭代器只利用这两个值可以获取下一个元素。

这种无状态迭代器的典型的简单的例子是 ipairs，它遍历数组的每一个元素，元素的索引需要是数值。

以下实例我们使用了一个简单的函数来实现迭代器，实现 数字 n 的平方：

```lua
function square(iteratorMaxCount,currentNumber)
   if currentNumber<iteratorMaxCount
   then
      currentNumber = currentNumber+1
   return currentNumber, currentNumber*currentNumber
   end
end

for i,n in square,3,0
do
   print(i,n)
end
```

> 表达式函数两个入参即状态常量、控制变量
>
> - 状态常量故名思义，不会再改变
> - 控制变量会随循环每次调用而重新赋值
>
> 表达式的两个返回值，控制变量的新值、对应的value，
>
> - 控制变量的新值、对应的value被in前面的变量接收
> - 控制变量的新值会再次传进表达式

**多状态迭代器**

很多情况下，迭代器需要保存多个状态信息而不是简单的状态常量和控制变量，最简单的方法是使用闭包，还有一种方法就是将所有的状态信息封装到 table 内，将 table 作为迭代器的状态常量，因为这种情况下可以将所有的信息存放在 table 内，所以迭代函数通常不需要第二个参数。



以下实例我们创建了自己的迭代器：elementIterator 内使用了闭包函数，实现计算集合大小并输出各个元素。

```lua
array = {"Google", "Runoob"}

function elementIterator (collection)
   local index = 0
   local count = #collection
   -- 闭包函数
   return function ()
      index = index + 1
      if index <= count
      then
         --  返回迭代器的当前元素
         return collection[index]
      end
   end
end

for element in elementIterator(array)
do
   print(element)
end
```

**pairs 和 ipairs区别**

- pairs: 迭代 table，可以遍历表中所有的 key 可以返回 nil
-  ipairs: 迭代数组，不能返回 nil,如果遇到 nil 则退出

### 模块、包

以下为创建自定义模块 module.lua，文件代码格式如下：

```lua
-- 文件名为 module.lua
-- 定义一个名为 module 的模块
module = {}
 
-- 定义一个常量
module.constant = "这是一个常量"
 
-- 定义一个函数
function module.func1()
    io.write("这是一个公有函数！\n")
end
 
local function func2()
    print("这是一个私有函数！")
end
 
function module.func3()
    func2()
end
 
return module
```

**引用**

```lua
-- test_module.lua 文件
-- module 模块为上文提到到 module.lua
require("module")
 
print(module.constant)
 
module.func3()
```

**加载机制**

对于自定义的模块，模块文件不是放在哪个文件目录都行，函数 require 有它自己的文件路径加载策略，它会尝试从 Lua 文件或 C 程序库中加载模块。

require 用于搜索 Lua 文件的路径是存放在全局变量 package.path 中，当 Lua 启动后，会以环境变量 LUA_PATH 的值来初始这个环境变量。如果没有找到该环境变量，则使用一个编译时定义的默认路径来初始化。

当然，如果没有 LUA_PATH 这个环境变量，也可以自定义设置，在当前用户根目录下打开 .profile 文件（没有则创建，打开 .bashrc 文件也可以），例如把 "~/lua/" 路径加入 LUA_PATH 环境变量里：

```sh
#LUA_PATH
export LUA_PATH="~/lua/?.lua;;"
```

文件路径以 ";" 号分隔，最后的 2 个 ";;" 表示新加的路径后面加上原来的默认路径。

接着，更新环境变量参数，使之立即生效。

```sh
source ~/.profile
```

这时假设 package.path 的值是：

```sh
/Users/dengjoe/lua/?.lua;./?.lua;/usr/local/share/lua/5.1/?.lua;/usr/local/share/lua/5.1/?/init.lua;/usr/local/lib/lua/5.1/?.lua;/usr/local/lib/lua/5.1/?/init.lua
```

那么调用 require("module") 时就会尝试打开以下文件目录去搜索目标。

```sh
/Users/dengjoe/lua/module.lua;
./module.lua
/usr/local/share/lua/5.1/module.lua
/usr/local/share/lua/5.1/module/init.lua
/usr/local/lib/lua/5.1/module.lua
/usr/local/lib/lua/5.1/module/init.lua
```

如果找过目标文件，则会调用 package.loadfile 来加载模块。否则，就会去找 C 程序库。

搜索的文件路径是从全局变量 package.cpath 获取，而这个变量则是通过环境变量 LUA_CPATH 来初始。

搜索的策略跟上面的一样，只不过现在换成搜索的是 so 或 dll 类型的文件。如果找得到，那么 require 就会通过 package.loadlib 来加载它。



### 元表

Lua中的元表（metatable）是一个用于定义表（table）行为的特殊表。元表可以用于改变表的行为，例如定义表的加法、减法、乘法等操作。每个行为关联了对应的元方法。

- 元表就是一个表

- Lua语言中的每一个值（所有类型）都可以有元表

- 每个表(table)和用户数据类型(userdata)都具有各自独立的元表

- 其他类型共享同类型所属的同一个元表（所有字符串string共用一个元表）

- 新创建的表没有元表

- 字符串都有一个默认的统一元表，其他类型默认没有元表

- 在Lua代码中我们仅能为表（table）添加元表，其他类型可通过c或调试库
- **一个表还可以成为他自己的元表**

有两个很重要的函数来处理元表：

- **setmetatable(table,metatable):** 对指定 table 设置元表(metatable)，如果元表(metatable)中存在 __metatable 键值，setmetatable 会失败。
- **getmetatable(table):** 返回对象的元表(metatable)。

```lua
mytable = {}                          -- 普通表 
mymetatable = {}                      -- 元表
setmetatable(mytable,mymetatable)     -- 把 mymetatable 设为 mytable 的元表


-- 简写
mytable = setmetatable({},{})


getmetatable(mytable)                 -- 这会返回 mymetatable
```

**预定义的元方法**

元表包含一些预定义的字段，可以用来覆盖表的默认行为。以下是一些常用的元表字段：

1. `__add(a, b)`: 用于加法操作的函数，返回两个参数相加的结果。
2. `__sub(a, b)`: 用于减法操作的函数，返回两个参数相减的结果。
3. `__mul(a, b)`: 用于乘法操作的函数，返回两个参数相乘的结果。
4. `__div(a, b)`: 用于除法操作的函数，返回两个参数相除的结果。
5. `__mod(a, b)`: 用于取模操作的函数，返回两个参数取模的结果。
6. `__pow(a, b)`: 用于幂运算的函数，返回第一个参数的第二个参数次幂的结果。
7. `__unm(a)`: 用于取反操作的函数，返回一个参数的相反数。
8. `__concat(a, b)`: 用于连接操作的函数，返回两个参数连接后的结果。
9. `__len(a)`: 用于获取长度操作的函数，返回一个参数的长度。
10. `__eq(a, b)`: 用于相等性判断的函数，返回两个参数是否相等的布尔值。
11. `__lt(a, b)`: 用于小于性判断的函数，返回第一个参数是否小于第二个参数的布尔值。
12. `__le(a, b)`: 用于小于等于性判断的函数，返回第一个参数是否小于等于第二个参数的布尔值。

这些字段可以在元表中定义相应的函数来覆盖默认行为

> **__add**
>
> 使用元表我们可以定义 Lua 如何计算两个 table 的相加操作 a+b。
>
> 当 Lua 试图对两个表进行相加时，先检查两者之一是否有元表，之后检查是否有一个叫 **__add** 的字段，若找到，则调用对应的值。 **__add** 等即时字段，其对应的值（往往是一个函数或是 table）就是"元方法"。
>
> ```lua
> a = setmetatable({},{})
> table.insert(a,1)
> table.insert(a,2)
> table.insert(a,3)
> getmetatable(a).__add = function (a,b)
>     local add = {}
>     for k,v in ipairs(a) do
>         if b[k] == nil then break end
>         add[k] = a[k] + b[k]
>     end
>     return add
> end
> 
> b = {9,8,6}
> for k,v in pairs(a + b) do
>     print(k,v)
> end
> ```

除了上述预定义的字段外，元表还包含一些其他的方法和字段，用于更复杂的操作和配置

- `__newindex(t, k, v)`: 用于设置表的新索引值的函数，当对表字段进行赋值操作时调用。可以用来拦截对表的赋值操作。在 Lua 5.1 版本引入的。在 Lua 5.0 版本中，对应的方法是set。
- `__index(t, k)`: 用于获取表中不存在的索引值的函数，当访问表中不存在的索引时调用。可以用来拦截对表中不存在索引的访问。在 Lua 5.1 版本引入的。在 Lua 5.0 版本中，对应的方法是get。
- `__call(t, ...)`: 用于调用表的函数，当对表进行函数调用操作时调用。可以用来拦截对表的函数调用。
- `__metatable`: 用于获取表的元表的字段。可以用来获取或设置表的元表。
- `__mode`: 用于设置表的垃圾回收模式的字段。可以设置为`"k"`、`"v"`或`"kv"`，分别表示只回收键、只回收值或同时回收键和值。
- `__gc(a)`: 用于垃圾回收时调用的函数，当表被垃圾回收时调用。可以用来执行一些清理操作或资源释放。

> **__index **
>
> 可以给不存在的键赋默认值
>
> ```lua
> setmetatable(t, {  
>   __index = function(t, k)  
>     return k .. ' not found'  -- 如果键 'k' 不存在，返回 'k not found'  
>   end  
> })
> ```
>
> **__newindex**
>
> ```lua
> setmetatable(t, {  
>   __newindex = function(t, k, v)  
>     rawset(t, k, v .. ' added')  -- 添加新的键值对到表中，值为 'v added'  
>   end  
> })
> ```
>
> **__call**
>
> ```lua
> meta3 =
> {
> --当子表被当作一个函数来使用时 会默认调用这个__call中的方法
>    --当希望传参数时 一定要记住 默认第一个参数 是调用者本身
>    __call = function(a, b)
>        print(a)
>        print(b)
>        print("i love u")
>    end
> }
> myTable3 =
> {
>    name = "hhc3"
> }
> setmetatable(myTable3, meta3)
> --把子表当作函数使用 就会调用元表的__call方法
> myTable3(1)
> ```
>
> **__tostring**
>
> ```lua
> mytable = setmetatable({ 10, 20, 30 }, {
>   __tostring = function(mytable)
>     sum = 0
>     for k, v in pairs(mytable) do
>                 sum = sum + v
>         end
>     return "表所有元素的和为 " .. sum
>   end
> })
> print(mytable)
> ```
>
> 

### 协程

Lua 协同程序(coroutine)与线程比较类似：拥有独立的堆栈，独立的局部变量，独立的指令指针，同时又与其它协同程序共享全局变量和其它大部分东西。

协同程序可以理解为一种特殊的线程，可以暂停和恢复其执行，从而允许非抢占式的多任务处理。

由 **coroutine** 模块提供支持。

- coroutine.create()  ：创建 coroutine，返回 coroutine， 参数是一个函数，相当于java的run方法
- coroutine.resume()  重启 coroutine，和 create 、yield配合使用
  - 第一个参数为执行的协程，第二个参数将传递给执行的参数或yield函数
  - 第一个返回值为boolean型表示有没错误，第二次返回值为yield的入参
  - 当协程调用的函数结束时，再调用resume会返回一个错误

- coroutine.yield()  ：挂起 coroutine，将 coroutine 设置为挂起状态，这个和 resume 配合使用能有很多有用的效果，参数将作为resume 的返回值

- coroutine.status()  ：查看 coroutine 的状态 --- 状态有三种：dead，suspended，running：结束，挂起，运行
- coroutine.wrap()： 创建 coroutine，返回一个函数（包装为可直接调用的函数，相当于给执行函数赋值给了协程），一旦调用返回的这个函数，就进入 coroutine，和 create 功能重复
- coroutine.running()：  返回正在跑的 coroutine，一个 coroutine 就是一个线程，当使用running的时候，就是返回一个 coroutine 的线程号

```lua
-- 协程执行的函数
function foo()
    print("协同程序 foo 开始执行")
    local value = coroutine.yield("暂停 foo 的执行")
    print("协同程序 foo 恢复执行，传入的值为: " .. tostring(value))
    print("协同程序 foo 结束执行")
end


-- 创建协同程序
local co = coroutine.create(foo)

-- 启动协同程序
local status, result = coroutine.resume(co)
print(result) -- yield的入参作为result输出: 暂停 foo 的执行
-- 恢复协同程序的执行，并传入一个值, 传递给yield
status, result = coroutine.resume(co, 42)
print(result) -- 函数的返回值，没有就是nil
```

```lua
-- 使用 coroutine.wrap 创建了一个协同程序包装器，将协同程序函数转换为一个可直接调用的函数对象
co = coroutine.wrap(
    function(i)
        print(i);
    end
)
 
co(1)
```



> **线程和协同程序区别**
>
> 线程与协同程序的主要区别在于，一个具有多个线程的程序可以同时运行几个线程，而协同程序却需要彼此协作的运行。
>
> 在任一指定时刻只有一个协同程序在运行，并且这个正在运行的协同程序只有在明确的被要求挂起的时候才会被挂起。
>
> 协同程序有点类似同步的多线程，在等待同一个线程锁的几个线程有点类似协同。
>
> 主要区别归纳如下：
>
> - 调度方式：线程通常由操作系统的调度器进行抢占式调度，操作系统会在不同线程之间切换执行权。而协同程序是非抢占式调度的，它们由程序员显式地控制执行权的转移。
> - 并发性：线程是并发执行的，多个线程可以同时运行在多个处理器核心上，或者通过时间片轮转在单个核心上切换执行。协同程序则是协作式的，只有一个协同程序处于运行状态，其他协同程序必须等待当前协同程序主动放弃执行权。
> - 内存占用：线程通常需要独立的堆栈和上下文环境，因此线程的创建和销毁会带来额外的开销。而协同程序可以共享相同的堆栈和上下文，因此创建和销毁协同程序的开销较小。
> - 数据共享：线程之间可以共享内存空间，但需要注意线程安全性和同步问题。协同程序通常通过参数传递和返回值来进行数据共享，不同协同程序之间的数据隔离性较好。
> - 调试和错误处理：线程通常在调试和错误处理方面更复杂，因为多个线程之间的交互和并发执行可能导致难以调试的问题。协同程序则在调试和错误处理方面相对简单，因为它们是由程序员显式地控制执行流程的。
>
> 总体而言，线程适用于需要并发执行的场景，例如在多核处理器上利用并行性加快任务的执行速度。而协同程序适用于需要协作和协调的场景，例如状态机、事件驱动编程或协作式任务处理。选择使用线程还是协同程序取决于具体的应用需求和编程模型。

**生成消费问题**

```lua
local newProductor

function productor()
     local i = 0
     while true do
          i = i + 1
          send(i)     -- 将生产的物品发送给消费者
     end
end

function consumer()
     while true do
          local i = receive()     -- 从生产者那里得到物品
          print(i)
     end
end

function receive()
     local status, value = coroutine.resume(newProductor)
     return value
end

function send(x)
     coroutine.yield(x)     -- x表示需要发送的值，值返回以后，就挂起该协同程序
end

-- 启动程序
newProductor = coroutine.create(productor)
consumer()
```

### 文件IO

```lua
-- 打开文件
file = io.open(filename[,mode])
```

mode 的值有：

| 模式 | 描述                                                         |
| :--- | :----------------------------------------------------------- |
| r    | 以只读方式打开文件，该文件必须存在。                         |
| w    | 打开只写文件，若文件存在则文件长度清为0，即该文件内容会消失。若文件不存在则建立该文件。 |
| a    | 以附加的方式打开只写文件。若文件不存在，则会建立该文件，如果文件存在，写入的数据会被加到文件尾，即文件原先的内容会被保留。（EOF符保留） |
| r+   | 以可读写方式打开文件，该文件必须存在。                       |
| w+   | 打开可读写文件，若文件存在则文件长度清为零，即该文件内容会消失。若文件不存在则建立该文件。 |
| a+   | 与a类似，但此文件可读可写                                    |
| b    | 二进制模式，如果文件是二进制文件，可以加上b                  |
| +    | 表示对文件既可以读也可以写                                   |

**简单模式**

```lua
testfile = './test1.lua'

-- 以只读方式打开文件
file = io.open(testfile, "r")

-- 设置默认输入文件为 test.lua
io.input(file)

-- 输出文件第一行
print(io.read())

-- 关闭打开的文件
io.close(file)

-- 以附加的方式打开只写文件
file = io.open(testfile, "a")

-- 设置默认输出文件为 test.lua
io.output(file)

-- 在文件最后一行添加 Lua 注释
io.write("--  test.lua 文件末尾注释")

-- 关闭打开的文件
io.close(file)
```

> **read方法的参数**
>
> | 模式         | 描述                                                         |
> | :----------- | :----------------------------------------------------------- |
> | "*n"         | 读取一个数字并返回它。例：file.read("*n")                    |
> | "*a"         | 从当前位置读取整个文件。例：file.read("*a")                  |
> | "*l"（默认） | 读取下一行，在文件尾 (EOF) 处返回 nil。例：file.read("*l")   |
> | number       | 返回一个指定字符个数的字符串，或在 EOF 时返回 nil。例：file.read(5) |

其他方法

- **io.flush():** 向文件写入缓冲中的所有数据
- **io.lines(optional file name):** 返回一个迭代函数，每次调用将获得文件中的一行内容，当到文件尾时，将返回 nil，但不关闭文件。

**完全模式**

通常我们需要在同一时间处理多个文件。我们需要使用 file:function_name 来代替 io.function_name 方法。以下实例演示了如何同时处理同一个文件:

```lua
-- 以只读方式打开文件
file = io.open("test.lua", "r")

-- 输出文件第一行
print(file:read())

-- 关闭打开的文件
file:close()

-- 以附加的方式打开只写文件
file = io.open("test.lua", "a")

-- 在文件最后一行添加 Lua 注释
file:write("--test")

-- 关闭打开的文件
file:close()
```

其他方法

- **file:seek(optional whence, optional offset):** 设置和获取当前文件位置,成功则返回最终的文件位置(按字节),失败则返回nil加错误信息。

  - 参数 whence 值可以是:
    - "set": 从文件头开始
    - "cur": 从当前位置开始[默认]
    - "end": 从文件尾开始
  - offset:默认为0

  - 不带参数file:seek()则返回当前位置,file:seek("set")则定位到文件头,file:seek("end")则定位到文件尾并返回文件大小

  ```lua
  -- 以只读方式打开文件
  file = io.open("test.lua", "r")
  
  file:seek("end",-25)
  print(file:read("*a"))
  
  -- 关闭打开的文件
  file:close()
  ```

- **file:flush():** 向文件写入缓冲中的所有数据

- **io.lines(optional file name):** 打开指定的文件 filename 为读模式并返回一个迭代函数，每次调用将获得文件中的一行内容，当到文件尾时，将返回 nil，并自动关闭文件。
  若不带参数时io.lines() <=> io.input():lines(); 读取默认输入设备的内容，但结束时不关闭文件，如：

  ```lua
  for line in io.lines("main.lua") do
  　　print(line)
  end
  ```

### 异常

**断言**

```lua
local function add(a,b)
   assert(type(a) == "number", "a 不是一个数字")
   assert(type(b) == "number", "b 不是一个数字")
   return a+b
end
add(10)
```

```
lua: test.lua:3: b 不是一个数字
stack traceback:
    [C]: in function 'assert'
    test.lua:3: in local 'add'
    test.lua:6: in main chunk
    [C]: in ?
```

**抛异常**

语法格式：`error (message [, level])`

功能：终止正在执行的函数，并返回message的内容作为错误信息(error函数永远都不会返回)

Level参数指示获得错误的位置:

- Level=1[默认]：为调用error位置(文件+行号)
- Level=2：指出哪个调用error的函数的函数
- Level=0:不添加错误位置信息

**捕获**

- 用pcall函数包装，将需要捕获异常的函数作为第一个参数，执行函数的参数作为后面的参数

  ```lua
  function test(a)
      if a > 1 then 
          print(a)
      else
          error('小于等于1的抛异常')
      end
  end
  
  r,m = pcall(test,1)
  if not r then
     print(m)  
  end
  ```

> 通常在错误发生时，希望落得更多的调试信息，而不只是发生错误的位置。但pcall返回时，它已经销毁了调用桟的部分内容。

- xpcall函数，xpcall接收第二个参数是一个错误处理函数，当错误发生时，Lua会在调用桟展开（unwind）前调用错误处理函数，于是就可以在这个函数中使用debug库来获取关于错误的额外信息了。

  ```lua
  function test ()
     n = n/nil
  end
  
  function handle(err)
     print("ERROR:", err)
  end
  
  r,m = xpcall(test,handle)
  if not r then
     print(m)  
  end
  ```

- xpcall 函数本身不支持直接传递参数给目标函数。如果你需要传递参数，你可以使用一个匿名函数或者闭包来封装你的函数调用。

  ```lua
  function myfunction (a, b)
     print(a + b)
     n = n/nil
  end
  
  function myerrorhandler(err)
     print("ERROR:", err)
  end
  
  local status = xpcall(function() myfunction(1, 2) end, myerrorhandler)
  print(status)
  ```

- debug库提供了两个通用的错误处理函数:

  - debug.debug：提供一个Lua提示符，让用户来检查错误的原因，命令交互的方式

  - debug.traceback：根据调用桟来构建一个扩展的错误消息

  ```lua
  function myfunction ()
     error("An error occurred.")
  end
  
  status, result = xpcall(myfunction, debug.traceback)
  print(status) -- Outputs: false
  print(result) -- Outputs: stack traceback
  ```

### 垃圾回收

### 面向对象

冒号 `:` 和点 `.` 都可以用来调用表的函数，但它们在使用上有一个重要的区别：

- 使用 `.` 调用函数时，需要显式地将表作为第一个参数传递给函数。例如：

  ```lua
  myTable.myFunction(myTable, arg1, arg2)
  ```

- 使用 `:` 调用函数时，Lua会自动地将表作为第一个参数传递给函数。这个自动传递的参数通常被称为 `self`。例如：

  ```lua
  myTable:myFunction(arg1, arg2)
  ```

  这等价于 `myTable.myFunction(myTable, arg1, arg2)`。

> 1、使用":"来声明方法，那么在接收参数时会默认去接收一个参数self，这个接收位置是隐藏的
>
> 2、使用"."来声明方法，在参数内的第一位会默认去接收self参数，这个参数不隐藏
>
> 3、使用":"来调用方法，在传递参数的时候，会默认传递一个self，这个self隐藏并置于所有参数之前
>
> 4、使用"."来调用方法，在传递参数的时候，第一位参数默认会被作为self传递过去，这个参数不会被隐藏

在面向对象编程中，`:` 通常用于调用对象的方法，因为方法需要访问对象的状态，而对象的状态通常存储在表中。而 `.` 则通常用于调用不需要访问对象状态的函数。

**封装性**

```lua
Student = {}

function Student:new()
    local o = {}
    self.__index = self
    setmetatable(o,self)
    return o
end

function Student:study()
    print("I am studying.")
end

local tom = Student:new("aa",19)
tom:study()  -- 输出 "I am studying."
```

**继承性**

```lua
-- 定义父类
Person = {}

function Person:new(name)
    self.__index = self
    local instance = setmetatable({}, self)
    instance.name = name
    return instance
end

function Person:speak()
    print("Hi, my name is " .. self.name)
end

-- 定义子类 Student
Student = setmetatable({}, Person)

function Student:new(name, grade)
    local instance = Person.new(self, name)
    self.__index = self
    setmetatable(instance, Student)
    instance.grade = grade
    return instance
end

function Student:study()
    print(self.name .. " is studying. Grade: " .. self.grade)
end

-- 创建 Person 和 Student 实例
local john = Person:new("John")
john:speak()  -- 输出 "Hi, my name is John"

local tom = Student:new("Tom", "9th")
tom:speak()  -- 输出 "Hi, my name is Tom"
tom:study()  -- 输出 "Tom is studying. Grade: 9th"
```

**多态性**

```lua
-- 定义基类 Animal
Animal = {}

function Animal:new(name)
    local instance = setmetatable({}, self)
    self.__index = self
    instance.name = name
    return instance
end

function Animal:sound()
    -- 在基类中，这个方法不做任何事情，子类将覆盖这个方法
end

-- 定义子类 Dog
Dog = setmetatable({}, Animal)
Dog.__index = Dog

function Dog:sound()
    print(self.name .. " says: Woof!")
end

-- 定义子类 Cat
Cat = setmetatable({}, Animal)
Cat.__index = Cat

function Cat:sound()
    print(self.name .. " says: Meow!")
end

-- 创建 Dog 和 Cat 实例
local tom = Dog:new("Tom")
local jerry = Cat:new("Jerry")

-- 通过基类的引用调用子类的方法
local function makeSound(animal)
    animal:sound()
end

makeSound(tom)  -- 输出 "Tom says: Woof!"
makeSound(jerry)  -- 输出 "Jerry says: Meow!"
```

## 数据库连接

[LuaSQL](http://luaforge.net/projects/luasql/)。他是开源的，支持的数据库有：ODBC, ADO, Oracle, MySQL, SQLite 和 PostgreSQL。

本文为大家介绍MySQL的数据库连接。

LuaSQL 可以使用 [LuaRocks](https://luarocks.org/) 来安装可以根据需要安装你需要的数据库驱动。

LuaRocks 安装方法：

```sh
wget http://luarocks.org/releases/luarocks-2.2.1.tar.gz
tar zxpf luarocks-2.2.1.tar.gz
cd luarocks-2.2.1
./configure; sudo make bootstrap
sudo luarocks install luasocket
lua
Lua 5.3.0 Copyright (C) 1994-2015 Lua.org, PUC-Rio
> require "socket"
```

Window 下安装 LuaRocks：https://github.com/keplerproject/luarocks/wiki/Installation-instructions-for-Windows

安装不同数据库驱动：

```sh
luarocks install luasql-sqlite3
luarocks install luasql-postgres
luarocks install luasql-mysql
luarocks install luasql-sqlite
luarocks install luasql-odbc
```

你也可以使用源码安装方式，Lua Github 源码地址：https://github.com/keplerproject/luasql

**连接数据库**

> 5.2 版本之后，require 不再定义全局变量，需要保存其返回值。

```lua
local luasql = require "luasql.mysql"

--创建环境对象
env = luasql.mysql()

--连接数据库
conn = env:connect("数据库名","用户名","密码","IP地址",端口)

--设置数据库的编码格式
conn:execute"SET NAMES UTF8"

--执行数据库操作
cur = conn:execute("select * from role")

row = cur:fetch({},"a")

--文件对象的创建
file = io.open("role.txt","w+");

while row do
    var = string.format("%d %s\n", row.id, row.name)

    print(var)

    file:write(var)

    row = cur:fetch(row,"a")
end


file:close()  --关闭文件对象
conn:close()  --关闭数据库连接
env:close()   --关闭数据库环境
```

