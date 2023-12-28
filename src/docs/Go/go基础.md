# Go基础

## 基本操作

- 包名:尽量保持package的名字和目录保持一致，和标准库不要冲突，main所在的包建议为
- 包名是从$GOPATH/src/后开始计算，使用/分割，与路径一致，GOPATH设置为环境变量
- 导包用路径
- 声明包建议和文件夹同名，用于引用时方法的定位
- **可以给包起别名，但是原来的包名就不能使用了**

```go
// 如：在 $GOPATH/src/aaa/bb/c/dbutils 目录下声明一个包
package dddddd
```

```go
// 引用
import(
	"fmt"
    "aaa/bb/c/dbutils"
    test "aaa/bb/c/redisUtils"
)

func main(){
    dddddd.Add()
    test.Set()
}
```

- 方法名首字母大写 ---- 相当于public，小写相当于private

- 标准输入

```go
package main
import "fmt"

func main(){
	var age int
	fmt.Println("请输入age：")
	fmt.Scanln(&age)
	fmt.Println("age =",age)

	var name string
	var score float32
	var isVIP bool
	fmt.Printf("请依次输入，name,age,score,isVIP(空格隔开):")
	fmt.Scanf("%s %d %f %t",&name,&age,&score,&isVIP)
	fmt.Printf("name = %s, age = %d, score = %f, isVIP = %t",name,age,score,isVIP)
}
```

## 变量

- 引入的包不使用会报错
- 声明的变量不使用会报错
- 短变量只能用于声明局部变量
- 全局跨包变量名首字母大写即可

```go
package main
import "fmt"

// 全局变量
var n1 = 100
var n2 = 20.12

var (
	n3 = 500
	n4 = 34.12
)

func main(){
    // 局部变量
    var age int	// 先声明
	age = 18	// 再赋值
    
    var num int = 22		// 声明并赋值
    var num1 int			// 只声明，不赋值，有默认值
    var num2 = "tom"		// 没有定义类型，自动推断
    sex := "nan"			// 省略var
    
    // 多变量
    var a,b,c int				// 声明
    var m,n,l = 10,"ha",1.9		// 声明并赋值
    m1,n1,l1 := 20,"la",2.9		// 简写
    
	m,n,l = 30,"ba",3.9			// 多变量赋值

	fmt.Println(age)		
    fmt.Println(num,num1,num2)
	fmt.Println(sex)
	fmt.Println(a,b,c)
	fmt.Println(m1,n1,l1)
	fmt.Println(m,n,l)
}
```

## 基本数据类型

**go体系 --- 字节数 --- java体系 --- 无符号 --- go体系其他**

int8 ----------- 1字节 ------  byte ---- uint8 ------- 与byte等价

int16 ---------- 2字节 ------ short ---- uint16

int32 ---------- 4字节 -------- int ----- uint32 ---- 32位系统int默认是int32 --- 还有rune与int32等价

int64 ---------- 8字节 ------- long ---- uint64 ---- 64位系统int默认是int64

float32 -------- 4字节 ------- float

float64 -------- 8字节 ------- double

byte ------------ 1字节 ------ byte --------------------- 与uint8等价

bool ------------ 1字节 ------- boolean

string ----------- 

默认值都是0值

整型默认为int型，浮点型默认为float64

查看字节数 --- unsafe.Sizeof(num)

```go
package main
import(
	"fmt"
	"unsafe"
)

func main(){
	var num1 int8 = 120
	fmt.Println(unsafe.Sizeof(num1))		// 1

	num2:=120
    
	fmt.Printf("类型为：%T",num2)			// int  整型默认为int型
	fmt.Println()							
	fmt.Println(unsafe.Sizeof(num2))		// 8  64位操作系统int等价于int64
    
	num3:=3.14E+2							// 类似科学计数法
	fmt.Printf("类型为：%T\n",num3)			// float64
	fmt.Println(num3)						// 314
    
    c1:='n'
	var c2 byte = 'm'
	fmt.Println(c1)							// 直接输出显示编码
	fmt.Printf("c1类型是：%T\n",c1)			// 默认类型为int32
	fmt.Printf("c1是：%c\n",c1)				// 显示字符必须格式化输出

	fmt.Println(c2)							// 显示编码
	fmt.Printf("c2类型是：%T\n",c2)			// 定义的类型为uint8 等价于 byte
	fmt.Printf("c2是：%c\n",c2)				// 显示字符必须格式化输出

	c3:="bbbbb" + "ddddd"
	c3+="ccccc"
	c3 = c3 + "eeeee" +						// 拼接换行时 + 号放行末, 否则不知道在那结束会报错
		"fffff"
	fmt.Printf("c3是：%s\n",c3)				// 格式化输出
	fmt.Println(c3)							// 可以直接输出
}
```

## 类型转换

隐式转换 --- 基本和java相同

强制转换 --- 类型(变量)	----  java中（类型）变量

基本数据类型转string 与 string转基本数据类型

```go
package main
import (
	"fmt"
	"strconv"
)

func main(){
	// 转string方式一：推荐
	i := 18
	f := 19.9
	b := false
	c := 'a'

	si := fmt.Sprintf("%d",i)
	sf := fmt.Sprintf("%f",f)
	sb := fmt.Sprintf("%t",b)
	sc := fmt.Sprintf("%c",c)

	fmt.Println(si)
	fmt.Println(sf)
	fmt.Println(sb)
	fmt.Println(sc)

	fmt.Println()

	// 转string方式二
	si1 := strconv.FormatInt(int64(i),10)		// 强转为int64，进制
	sf1 := strconv.FormatFloat(f,'f',9,64)		// 待转变量，格式，保留小数位，float64还是32
	sb1 := strconv.FormatBool(b)
	fmt.Println(si1)
	fmt.Println(sf1)
	fmt.Println(sb1)

	fmt.Println()

	// 转基本数据类型

	i1,_ := strconv.ParseInt(si,10,64)		// 由于i声明时默认用int接收，string转int64与i匹配不上，重新声明新变量i1
	f,_ = strconv.ParseFloat(sf,64)
	b,_ = strconv.ParseBool(sb)

	fmt.Println(i1)
	fmt.Println(f)
	fmt.Println(b)
}
```

## 指针

|          | go                             | c          |
| -------- | ------------------------------ | ---------- |
| 声明     | var p  *int                    | int *p     |
| 内存分配 | new(int)、make()               | malloc     |
| 数组名   | 整个数组的首地址               | 首元素地址 |
| 指针运算 | 不支持，需要用unsafe包操作地址 | 支持       |

```go
package main

import "fmt"

func main(){
	age := 18

	var p1 *int = &age
	p2 := &age
	fmt.Println(p1)
	fmt.Println(p2)
	fmt.Println(&p1,&p2)

	age2 := *p1
	*p1 = 20			// 改值
	fmt.Println(age2)
	fmt.Printf("p2指向的值为：%v\n",*p2)

}
```

## 流程控制

if ---- （）（）不用写，必须有{}

switch ---- 没有break关键字，天生break，穿透一个case（反break）用fallthrough

```go
package main
import "fmt"

func main(){
	score := 83
	switch score/10 {
		case 12,11,10:
			fmt.Println("优秀")
		case 9,8,7:
			fmt.Println("不错")
			fallthrough				// 本来只执行“不错”，fallthrough下穿到“及格”
		case 6:
			fmt.Println("及格")
		case 5,4,3,2,1,0:
			fmt.Println("差劲")
		default:
			fmt.Println("输入有误")
	}
}
```

循环结构中有break，同样有标签，还有goto，但一般不用

for ---- 省略（），变量声明不能用var，只能用 `:=`

键值对循环 ---- for-range

```go
package main
import "fmt"

func main(){
	str := "hello golang 你好啊！"

	for key ,value := range str {
		fmt.Printf("%d位置上的字符为 %c\n",key,value)
	}
}
```

## 函数

形参 参数名在前，类型在后

没有重载

支持可变形参（args...int）

函数也是一种数据类型

> ```go
> func 函数名 （形参列表）（返回值类型）{			// 返回值类型就一个的话，那么()是可以省略不写的
> }
> ```

```go
package main
import "fmt"

type ex func(*int,*int)			// 别名，但是编译时不识别为相同类型，需要强转
func main(){
	num1:=10
	num2:=20
	exchange(&num1,&num2)
	fmt.Println(num1,num2)

	func1 := exchange
	fmt.Printf("exchange函数的类型为：%T\n",func1)		// func(*int, *int)
	fmt.Printf("exchange函数的类型为：%T\n",exchange)	// func(*int, *int)

	func1(&num1,&num2)
	fmt.Println(num1,num2)

	callbake(func1)
	callbake2(exchange)
}

func callbake(exchange func(*int,*int)){
	fmt.Println("####### callbake")
}

func callbake2(exchange ex){
	fmt.Println("xxxxxxxxxxxxxx")
}

func exchange(num1 *int,num2 *int){
	t:=*num1
	*num1 = *num2
	*num2 = t
	fmt.Println("####### exchage")
}

func sumAndSub1(m int,n int)(int,int){			// 多返回值
	sum := m + n
	sub := m - n
	return sum,sub
}

func sumAndSub(m int,n int)(sum int,sub int){	// 返回值命名
	sum = m + n
	sub = m - n
	return
}
```

### init函数

init函数函数比main函数优先执行，全局变量赋值时调用的函数比init先执行，引入的包中的init方法比当前包先执行

```go
package main
import (
    "fmt"
	"other"					// 1、被引用的包中的 全局变量初始化引用的方法 和 init方法先执行
)

var num int= test()			// 2、当前包中，全局变量初始化引用的方法再执行

func main(){				// 4、main方法执行
	fmt.Println("main 执行了")
}

func test() int {			// 
	fmt.Println("test 执行了")
	return 20
}

func init(){				// 3、当前包的init方法执行
	fmt.Println("init 执行了")
}
```

### 匿名函数

```go
package main
import "fmt"

// 匿名函数赋给全局变量
var fun = func(m int,n int)(max int){
	if m > n {
		max = m
	} else {
		max = n
	}
	return
}

func main(){

	// 匿名函数
	res := func (m int,n int) (sum int){
		sum = m + n
		return
	}(1,2)

	fmt.Println(res)

	// 匿名函数赋给变量
	f := func (m int,n int) (sub int){
		sub = m - n
		return
	}
	fmt.Println(f(5,3))
	fmt.Println(fun(8,99))
}
```

### 闭包

闭包对内存消耗比较大

```go
package main
import "fmt"

// 全局变量
var n int

func main(){
	f:=getSum()
	
	fmt.Println(f(1))
	fmt.Println(f(2))

	fmt.Println("-------------")
	fmt.Println(getSum2(1))
	fmt.Println(getSum2(2))


}

// 闭包返回值为一个函数
func getSum() (func (int) int){
	sum := 0						// 对于闭包来说，sum类似全局变量
	return func (num int) int{
		sum = sum + num
		return sum
	}
}

// 共享变量
func getSum2(m int) int{
	n = m + n
	return n
}
```

### defer关键字

释放资源原理：遇到defer关键字会压入栈中不执行，遇到return时，从栈中弹出，并且不会改变原值，常用于资源释放

```go
package main
import "fmt"

func main(){
	fmt.Println(add(1,2))		// 第四步
}

func add(m int,n int) int{
	defer fmt.Println(m)		// 第三步
	defer fmt.Println(n)		// 第二步

	sum := m + n
	fmt.Println(sum)			// 第一步
	return sum
}
```

### 字符串相关

```go
len(str)

r:=[]rune(str)					//切片
for i:=0; i < len(str) ;i++{
    fmt.Println("%c \n",r[i])
}

n, err := strconv.Atoi("66") 	// 转整数	性能比ParseInt略差
str = strconv.Itoa(6887)		// 转字符串

strings.Contains("javaandgolang", "go")	// 是否包含
strings.Count("javaandgolang","a") 		// 包含个数
strings.EqualFold("go" , "Go")			// 不区分大小写比较	，区分直接用==
strings.lndex("javaandgolang" , "a") 	// 第一次出现的位置
strings.Replace("goandjavagogo", "go", "golang", -1) 	// 替换，-1表示全部替换
strings.Split("go-python-java", "-")	// 切割
strings.ToLower("Go")					// 转小写 
strings.ToUpper"go")					// 转大写

strings.TrimSpace("     go and java    ")	// 去空格
strings.Trim("~golang~ ", " ~")  			// 去指定
strings.TrimLeft("~golang~", "~")			// 去左
strings.TrimRight("~golang~", "~")			// 去右

strings.HasPrefix("http://java.sun.com/fmt", "http")	// 是否是指定开头
strings.HasSuffix("demo.png", ".png")					// 是否是指定结尾
```

### 日期时间

```go
package main
import (
        "fmt"
        "time"
)
func main(){
        //时间和日期的函数，需要到入time包，所以你获取当前时间，就要调用函数Now函数：
        now := time.Now()
        //Now()返回值是一个结构体，类型是：time.Time
        fmt.Printf("%v ~~~ 对应的类型为：%T\n",now,now)
        //2021-02-08 17:47:21.7600788 +0800 CST m=+0.005983901 ~~~ 对应的类型为：time.Time
        //调用结构体中的方法：
        fmt.Printf("年：%v \n",now.Year())
        fmt.Printf("月：%v \n",now.Month())//月：February
        fmt.Printf("月：%v \n",int(now.Month()))//月：2
        fmt.Printf("日：%v \n",now.Day())
        fmt.Printf("时：%v \n",now.Hour())
        fmt.Printf("分：%v \n",now.Minute())
        fmt.Printf("秒：%v \n",now.Second())
    
    	//这个参数字符串的各个数字必须是固定的，必须这样写 
        datestr2 := now.Format("2006/01/02 15/04/05")
        fmt.Println(datestr2)
        //选择任意的组合都是可以的，根据需求自己选择就可以（自己任意组合）。
        datestr3 := now.Format("2006 15:04")
        fmt.Println(datestr3)
}
```

### 内置函数

--- builtin包下

```go
len(arr) 				// 
new(int) 				// 主要用来分配值类型（int系列, float系列, bool, string、数组和结构体struct）
make([]int, 0, 10)		// 主要用来分配引用类型（指针、slice切片、map、管道chan、interface 等）
```

## 异常

defer遇到return和异常开始从栈中弹出，异常和return后的方法不再执行

**异常捕获**

```go
package main
import "fmt"

func main(){

	defer func(){
		err := recover()
		if err != nil {
			fmt.Println("异常被捕获",err)
            
		}
	}()

	test()
	fmt.Println("继续执行")						// 未执行
}

func test(){

	// defer func(){
	// 	err := recover()
	// 	if err != nil {
	// 		fmt.Println("异常被捕获",err)
	// 	}
	// }()
	
	// result := 10 / 0		// 编译报错
	m := 10
	n := 0
	result := m / n
	fmt.Println("除法执行了",result)				// 未执行
}
```

**自定义异常1 ---- 抛出error不能被捕获**

```go
package main
import (
	"fmt"
	"errors"
)

func main(){
	err := test()
	if err != nil {
		fmt.Println("出现异常",err)
	}
	fmt.Println("继续执行")
}

func test() (err error){
	m := 10
	n := 0

	if n == 0 {
		return errors.New("除数不能为0")
	} else {
		result := m / n
		fmt.Println("除法执行了",result)
		return nil
	}
	
}
```

**自定义异常2 ---- 抛出panic可以捕获**

```go
package main
import (
	"fmt"
	"errors"
)

func main(){

	defer func(){
		err := recover()
		if err != nil {
			fmt.Println("异常被捕获",err)
		}
	}()

	err := test()
	if err != nil {
		fmt.Println("出现异常",err)
		panic(err)
	}
	fmt.Println("继续执行")
}

func test() (err error){
	m := 10
	n := 0

	if n == 0 {
		return errors.New("除数不能为0")
	} else {
		result := m / n
		fmt.Println("除法执行了",result)
		return nil
	}
	
}
```

## 数组

数组是传值，和java不同

```go
package main
import (
	"fmt"
)

func main(){

	var arr [3]int			// 先声明，后赋值
	arr[2] = 3
	fmt.Println(arr)  

	scores := [2]int{1,2}	// 声明并赋值
	arr2 := [3]string{1:"a",2:"哈"}	
	var arr3 = [2]byte{'a','b'}
	arr4 := [...]float32{11.1,2}
	fmt.Println(scores)
	fmt.Println(arr2)		// [ a 哈]
	fmt.Println(arr3)
	fmt.Println(arr4)
	fmt.Printf("类型为 %T \n",arr4)	// 类型为 [2]float32, 长度属于类型的一部分

	fmt.Println("----------")
	for _,v := range arr2{
		fmt.Println(v)
	}
	fmt.Println("----------")

	change(arr)
	fmt.Println(arr[2])		// 传值不传址

	// 二维数组
	arr5 := [2][3]int{{1,2,3},{4,5,6}}
	fmt.Println(arr5)
	
}

func change(arr [3]int){
	arr[2] = 5
}
```

```java
public class TestArr {
    public static void main(String[] args) {

        int[] arr = { 1, 2, 3 };
        change(arr);
        System.out.println(arr[1]);			// 4
    }

    public static void change(int[] arr) {
        arr[1] = 4;
    }

}
```

## 切片

类似java中的List

数组有特定的用处，但是却有一些呆板(数组长度固定不可变)，所以在 Go 语言的代码里并不是特别常见。相对的切片却是随处可见的，切片是一种建立在数组类型之上的抽象，它构建在数组之上并且提供更强大的能力和便捷

切片(slice)是对数组一个连续片段的**引用**，所以切片是一个引用类型。这个片段可以是整个数组，或者是由起始和终止索引标识的一些项的子集。需要注意的是，终止索引标识的项不包括在切片内。切片提供了一个相关数组的动态窗口

```go
package main
import (
	"fmt"
)

func main(){
    var slice0 []int		// 定义	[]
	arr := [5]int{1,2,3,4,5}
	slice := arr[1:4]		// 左闭右开
	fmt.Println(slice)		// [2 3 4]

	slice[1] = 9
	fmt.Println(arr)		// [1 2 9 4 5]
	sliceNew := slice[:1]	// 简写 arr[:end],	arr[start:]	,	arr[:]
	fmt.Println(sliceNew)	// [2]
	sliceNew[0] = 0
	fmt.Println(arr)		// [1 0 9 4 5]

	// 容量 和 长度不同
	fmt.Println(cap(slice))	// 4
	fmt.Println(len(slice))	// 3
	fmt.Println(cap(sliceNew))	// 4
	fmt.Println(len(sliceNew))	// 1

    // make底层创建一个数组，对外不可见，所以不可以直接操作这个数组，要通过slice去间接的访问各个元素，不可以直接对数组进行维护/操作
	sliceFromMake := make([]int,4,10)	// 类型 长度 容量
	fmt.Println(sliceFromMake)			// [0 0 0 0]
	sliceFromMake2 := []int{1,2,3,4}
	fmt.Println(sliceFromMake2)			// [1 2 3 4]
    // 追加后会重新维护一个数组
    sliceFromMake2 = append(sliceFromMake2,sliceFromMake...)	// 追加切片,注意...
	sliceFromMake2 = append(sliceFromMake2,88,50)				// 追加元素
	fmt.Println(sliceFromMake2)			// [1 2 3 4 0 0 0 0 88 50]
    
     //拷贝 -- 覆盖
     var a []int = []int{1,4,7,3,6,9}	// 定义切片
     var b []int = make([]int,10)		// 再定义一个切片
     copy(b,a) 			// 将a中对应数组中元素内容复制到b中对应下标的中
     fmt.Println(b)		// [1 4 7 3 6 9 0 0 0 0]
}
```

## 映射

类似java中的Map

```go
package main
import (
	"fmt"
)

func main(){
	// map1 := map[string]string	// 仅声明

	map1 := make(map[string]string,10)
	map2 := make(map[int]string)
	map3 := map[int]string{
		111:"liyuanhao",
		222:"liusisi",
	}
	map1["name"] = "liyuanhao"
	map1["age"] = "18"	// 增
	map1["age"] = "27"	// 改
	fmt.Println(map1)
	fmt.Println(map2)
	fmt.Println(map3)

	delete(map3,111)	// 删
	fmt.Println(map3)
	
	v,b := map3[111]	// 查
	fmt.Println(v,b)	//  false

	a:=map[int]map[string]string{
		1:map[string]string{
			"001":"li",
			"002":"ni",
		},
		2:map[string]string{
			"001":"ll",
			"002":"mm",
		},
	}
	fmt.Println(a)
}
```

## 结构体

**结构体传值，和java的对象不同**

强转时，需要有完全相同的字段(名字、个数和类型)

结构体进行type重新定义(相当于取别名)，Golang认为是新的数据类型，但是相互间可以强转

**在方法中**，底层编译器做了优化，底层会自动帮我们加上 &  * ，函数不行，形参是什么就必须传什么

自定义类型，都可以有方法，而不仅仅是struct，比如int , float32等都可以有方法，起个别名就行

如果一个类型实现了String()这个方法，那么fmt.Println默认会调用这个变量的String()进行输出，类似java的toString

```go
package main
import (
	"fmt"
)

type Tc Teacher			// 别名

func main(){

	var teacher Teacher
	fmt.Println(teacher)	// { 0 }

	t1 := Teacher{
		"liyuanhao",
		18,
		"娃哈哈幼儿园",
	}
	t2 := Teacher{
		Name:"li",
		age:18,
		School:"lallala",
	}
	fmt.Println(t1)
	fmt.Println(t2)

	// --------------
	t3 := new(Teacher)
	fmt.Println(t3)			// &{ 0 }
	(*t3).Name = "liu"
	fmt.Println(t3)			// &{liu 0 }
	fmt.Println(*t3)		// {liu 0 }

	var t4 Tc = Tc{age:19}
	fmt.Println(t4)
	t5 := Teacher(t4)
	fmt.Println(t5)

	// --------------
	t :=new(Tc)
	(*t).Name = "叭叭叭"
	(*t).setTeacherName()		// t传值，非传址
	t.setTeacherAge()			// 指针传址
	fmt.Println(t)				// 调用String方法

	// 跨包创建实例
	// s := model.Student{"",0}

	// 工厂测试
	p := NewPerson("kakak",20)
	fmt.Println(p)

}

// 结构体
type Teacher struct{
	Name string
	age int
	School string
}

// 结构体绑定方法 ---- 传址
func (t Tc)setTeacherName(){
	t.Name = "拉阿拉"
}
// 结构体绑定方法 ---- 传值
func (t *Tc)setTeacherAge(){
	t.age = 999
}

// String方法
func (t *Tc) String() string{
	return fmt.Sprintf("Name = %s , age = %d , School = %s",t.Name,t.age,t.School)
}

// 工厂模式 --- 使私有结构体在其他包也能创建实例
type person struct{
	name string
	age int
}
func NewPerson(name string,age int) *person{
	return &person{name,age}
}
```

## 封装性

1) 建议将结构体、字段(属性)的首字母小写(其它包不能使用，类似private，实际开发不小写也可能，因为封装没有那么严格)
2) 给结构体所在包提供一个**工厂模式的函数**，首字母大写（类似一个构造函数）
3) 提供一个首字母大写的**Set方法**(类似其它语言的public)，用于对属性判断并赋值
4) 提供一个首字母大写的**Get方法**(类似其它语言的public)，用于获取属性的值

```go
package main

import "fmt"

func main() {

	p := NewPerson()
	p.SetName("li")
	name := p.GetName()
	fmt.Println(name)
}


type Person struct{
    name string
    age  int
}
// set方法需要绑定对象指针 - 需要改变属性的都要绑定对象指针
func (p *Person)SetName(name string){
    p.name = name
}
// get方法可以直接绑定对象，指针也可
func (p Person)GetName() string{
    return p.name
}

func NewPerson() *Person{
	return &Person{}
}
```



## 继承性

java中多组合少继承，在go中继承就是通过组合的形式实现的

```go
package main
import (
	"fmt"
)


func main(){

	cat := Cat{
		Animal{Age:2,
		Weight:10.2,
	}}
	cat2 := new(Cat)
	// cat2.Age = 3			// 有名的结构体用名调
	cat2.animal.Weight = 999.9
	fmt.Println(cat)		// {{2 10.2}}
	fmt.Println(cat2)		// &{{3 999.9}}
	cat.Shout()				// 喵喵喵---

}

type Animal struct{
	Age int
	Weight float32
}

func (animal *Animal)Shout(){
	fmt.Println("我会叫---")
}

type Cat struct{
    // Animal		// 匿名结构体
	animal Animal
}

func (cat *Cat)Shout(){
	fmt.Println("喵喵喵---")
}
```

父体可以是匿名结构体，匿名字段也可以是基本数据类型

```
type C struct{
	A		// 匿名结构体，父类
	int		// 匿名字段，基本数据类型
}
func main(){
	c := C{A{10,"ss"},333}
}
```

在有匿名结构体时，同名字段、方法，就近原则，先找本体字段，再找父体字段

有名的结构体必须用名调

支持多继承，建议大家尽量不使用多重继承

```go
package main
import (
        "fmt"
)
type A struct{
        a int
        b string
}
type B struct{
        c int
        d string
}
type C struct{
        A
        B
}
func main(){
        //构建C结构体实例：
        c := C{A{10,"aaa"},B{20,"ccc"}}
        fmt.Println(c)
}
```

```go
package main
import (
        "fmt"
)
type A struct{
        a int
        b string
}
type B struct{
        c int
        d string
        a int
}
type C struct{
        A
        B
}
func main(){
        //构建C结构体实例：
        c := C{A{10,"aaa"},B{20,"ccc",50}}
    	// 如嵌入的匿名结构体有相同的字段名或者方法名，则在访问时，需要通过匿名结构体类型名来区分
        fmt.Println(c.b)
        fmt.Println(c.d)
        fmt.Println(c.A.a)
        fmt.Println(c.B.a)
}
```

## 接口 -- 多态性

实现接口要实现**所有的方法**才是实现

接口中不能包含任何变量

不需要显式的实现接口。Golang中没有implement关键字

> （Golang中实现接口是基于方法的，不是基于接口的）
>
> 例如：
> A接口 a,b方法
> B接口 a,b方法
> C结构体 实现了  a,b方法 ，那么C实现了A接口，也可以说实现了B接口

接口本身不能创建实例，但是可以指向一个实现了该接口的自定义类型的变量 ---- 和java相同

只要是自定义数据类型，就可以实现接口，不仅仅是结构体类型，基本数据类型起别名就行

一个自定义类型可以实现多个接口 --- 和java相同

一个接口可以继承多个别的接口，这时如果要实现接口,也必须将继承的接口的方法也全部实现 --- 和java相同

interface类型默认是一个指针(引用类型)，如果没有对interface初始化就使用,那么会输出nil

空接口没有任何方法,所以可以理解为所有类型都实现了空接口，也可以理解为我们可以把任何一个变量赋给空接口

**断言** --- 类似java的instanceof --- 变量名.(类型)

```go
func greet1(s SayHello){
    s.sayHello()
    //断言：
    var ch Chinese = s.(Chinese)//看s是否能转成Chinese类型并且赋给ch变量
    ch.niuYangGe()
}

func greet2(s SayHello){
    s.sayHello()
    //断言：
    ch,flag := s.(Chinese)//看s是否能转成Chinese类型并且赋给ch变量,flag是判断是否转成功
    if flag == true{
        ch.niuYangGe()
    }else{
        fmt.Println("美国人不会扭秧歌")
    }
    fmt.Println("打招呼。。。")
}
```

```go
func greet2easy(s SayHello){
    s.sayHello()
    //断言：
    if ch,flag := s.(Chinese);flag{
        ch.niuYangGe()
    }else{
        fmt.Println("美国人不会扭秧歌")
    }
    fmt.Println("打招呼。。。")
}
```

特殊的switch

```go
switch s.(type){//type属于go中的一个关键字，固定写法
    case Chinese:
        ch := s.(Chinese)
        ch.niuYangGe()
    case American:
        am := s.(American)
        am.disco()
}
```

## IO

**文件**

os.Open("./fileTest.go")

> os.OpenFile("d:/Demo.txt",os.O_RDWR | os.O_APPEND | os.O_CREATE,0666)
>
> - 参数一：打开或新建的文件
> - 参数二：打开模式
>   - O_RDWR 读写、O_RDONLY 只读、O_WRONLY 只写
>   - O_APPEND 追加到尾部、O_CREATE 没有就创建
>   - 。。。
> - 参数三：权限控制 --- （linux/unix系统下才生效，windows下设置无效）

```go
package main
import (
	"fmt"
	"os"
)


func main(){
	file,err := os.Open("./fileTest.go")
	if err!= nil{
		fmt.Println("xxxxxxxxxxx ",err)
	} else{
		fmt.Printf("文件=%v",file)
	}

	err2 := file.Close()
	if err2 != nil {
		fmt.Println("关闭失败")
	}

}
```

**读 --- 输入流**

```go
package main
import (
	"fmt"
	"io/ioutil"
	"io"
	"os"
	"bufio"
)


func main(){
	text,err := ioutil.ReadFile("./fileTest.go")

	if err != nil {
		fmt.Println("xxxxxxxxxxxxxx ",err)
	} else {
		// fmt.Printf("%v",text)		// 输出阿斯科马
		fmt.Printf("%v",string(text))
	}

	fmt.Println("--------缓冲读-------")
	BufferRead()
}

func BufferRead(){
	file,err := os.Open("./fileTest.go")	// 开
	defer file.Close()						// 关

	if err!= nil{
		fmt.Println("xxxxxxxxxxx ",err)
	} else{
		reader := bufio.NewReader(file)
		for{
			str,err := reader.ReadString('\n')	// 读一行
			if err == io.EOF{	// //io.EOF 表示已经读取到文件的结尾
				break
			} 
			fmt.Println(str)
		}
		fmt.Println("vvvvvvvvvvvvvvv")
	}

}
```

**写 --- 输出流**

```go
package main
import (
	"fmt"
	"os"
	"io"
	"bufio"
	"io/ioutil"
)

func main(){
	file,err1 := os.Open("./fileTest.go")	// 开
	newFile,err2 := os.OpenFile("./test.txt",os.O_RDWR | os.O_APPEND | os.O_CREATE,0666)
	if err1 != nil || err2 != nil{
		fmt.Println("文件打开失败",err1,err2)
		return
	}

	defer file.Close()
	defer newFile.Close()

	reader := bufio.NewReader(file)
	writer := bufio.NewWriter(newFile)
	BufferCopy(reader,writer)
	simpleCopy()
}

// 利用 bufio包实现 文件复制
func BufferCopy(reader *bufio.Reader,writer *bufio.Writer){
	
	for{
		str,err1 := reader.ReadString('\n')	// 读一行
		if err1 == io.EOF{	// //io.EOF 表示已经读取到文件的结尾
			break
		} 
		_,err2 := writer.WriteString(str)	// 写到缓冲区
		if err2 != nil {
			fmt.Println("xxxxxxxxxxxxxxx ",err2)
		}
	}
	writer.Flush()						// 刷新缓冲区，真正写入
	s :=os.FileMode(0666).String()		// 查看权限
	fmt.Println(s)
	fmt.Println("vvvvvvvvvvvvvvv")
	
}

// 利用ioutil包实现 文件复制
func simpleCopy(){
	if content,err := ioutil.ReadFile("./test.txt") ;err != nil{
		fmt.Println("读取有问题!")
		return
	} else {
		err = ioutil.WriteFile("./test2.txt",content,0666)
        if err != nil {
			fmt.Println("写出失败！")
        }
	}
}
```

## 协程

是一种用户态的轻量级线程

> **本质上是单线程时间片轮询**
>
> 对于单线程下，我们不可避免程序中出现io操作，但如果我们能在自己的程序中(即用户程序级别，而非操作系统级别)控制单线程下的多个任务能在一个任务遇到io阻塞时就将寄存器上下文和栈保存到某个其他地方，然后切换到另外一个任务去计算。在任务切回来的时候，恢复先前保存的寄存器上下文和栈，这样就保证了该线程能够最大限度地处于就绪态，即随时都可以被cpu执行的状态，相当于我们在用户程序级别将自己的io操作最大限度地隐藏起来，从而可以迷惑操作系统，让其看到：该线程好像是一直在计算，io比较少，从而会更多的将cpu的执行权限分配给我们的线程（注意:线程是CPU控制的，而协程是程序自身控制的，属于程序级别的切换，操作系统完全感知不到，因而更加轻量级)

```go
package main
import (
	"fmt"
	"time"
)

func main(){

	go test()		// 开启一个协程

	for i:=0;i<10;i++{
		fmt.Println("---------------- ",i)
		time.Sleep(time.Second)
	}
}

func test(){
	for i:=0;i<10;i++{
		fmt.Println("###### ",i)
		time.Sleep(time.Second)
	}
}
```

**主死从随** --- 解决方案1 --- sync.WaitGroup中的三个方法Add(int)、Done()、Wait()

```go
package main
import (
	"fmt"
	"time"
	"sync"
)

var wg sync.WaitGroup
func main(){
	wg.Add(1)
	go test()		// 开启一个协程

	for i:=0;i<10;i++{
		fmt.Println("---------------- ",i)
	}
	wg.Wait()
}

func test(){
	for i:=0;i<10;i++{
		fmt.Println("###### ",i)
		time.Sleep(time.Second)
	}
	wg.Done()
}
```

**处理Panic** --- 在协程的内部函数中用defer-recover捕获

```go
func main(){
        //启动两个协程：
        go printNum()
        go devide()
        time.Sleep(time.Second * 5)
}

func devide(){
        defer func(){
                err := recover()
                if err != nil{
                        fmt.Println("devide()出现错误：",err)
                }
        }()
        num1 := 10
        num2 := 0
        result := num1 / num2
        fmt.Println(result)
}
```

## 管道

**数据结构**

```go
type hchan struct {
  gcount   uint  // 环形队列剩余元素个数
  dataqsiz uint // 环形队列长度
  buf      unsafe.Pointer // 环形队列指针
  elemsize uint16  // 每个元素大小
  closed   uint32  // 标识关闭状态
  elemtype *_type  // 元素类型
  sendx    uint   // 下一个元素写入时的下标
  recvx    uint   // 下一个元素读取时的下标
  recvq    waitq  //  等待读消息的队列
  sendq    waitq  // 等待写消息的队列
  lock     mutex  // 互斥锁， 保障管道无法并发读写
}
```

> 写的时候，会对recvq判空
>
> - 非空，则取出一个读协程，写入数据，唤醒
> - 空，则判断buf空间是否足够，足够就在尾部追加
>   - 不够就把当前的写协程写入sendq，阻塞
>
> 读的时候，会对sendq判空
>
> - 非空，判断buf是否为空，为空则取出sendq一个写协程，读数据，唤醒
>   - buf不为空，直接从buf中读，在sendq取出一个协程放到buf，唤醒
> - 空，判断gcount（buf中的数据数）是否大于0，是，从buf中取数据
>   - 小于0，buf中无数据，则放到recvq阻塞

```go
package main
import (
	"fmt"
)

func main(){
	chan1 := make(chan int,3)
	chan1<-10
	chan1<-20
	chan1<-30
	n1:=<-chan1
	fmt.Println(n1)
	chan1<-40
	close(chan1)			// 关闭后只能读，不能写
	fmt.Println(<-chan1)

	// 遍历
	for v:=range chan1{
		fmt.Println(v)
	}

	var chanInt chan int	// 可读可写
	var chanInt1 chan<- int	// 只写
	var chanInt2 <-chan int	// 只读
	chanInt = make(chan int,4)
	chanInt1 = make(chan<- int,5)
	chanInt2 = make(<-chan int,6)
	fmt.Println(chanInt,chanInt1,chanInt2)
}
```

## Json序列化

> 引入"encoding/json"包
>
> 序列化时，一般传结构体即可，但本质上应该传指针，做了优化
>
> 反序列化时，必须传指针
>
> 结构体的属性必须大写，可以指定tag返回给前端
>
> 序列化返回的是字节数组，需要强转为string，反序列化同理，需要转回[]byte才能反序列化

```go
package main
import(
	"fmt"
	"encoding/json"
)
type Person struct{
	Name string `json:"name"`	// tag 修改序列化后的字段名称，方便前端使用
	Age int
}
func main(){
	testStrut()
	testMap()
	testSlice()
}

func testStrut(){
	person:=Person{Name:"牛魔王",Age:11}
	data,err:=json.Marshal(person)
	if err!=nil{
		fmt.Println(err)
	}else{
		fmt.Println(string(data))
	}

	person2:=Person{}
	str := "{\"name\":\"牛魔王\",\"Age\":11}"
	json.Unmarshal([]byte(str),&person2)		// 必须传地址
	fmt.Println("##### ",person2)
}

func testMap(){
	map1 := make(map[string]interface{},3)
	map1["name"] = "孙悟空"
	map1["age"] = 11

	map2 := map[string]interface{}{
		"name":"玉皇大帝",
		"age":11,
	}
	data1,err:=json.Marshal(map1)
	data2,_:=json.Marshal(map2)
	if err!=nil{
		fmt.Println(err)
	}else{
		fmt.Println(string(data1))
	}
	fmt.Println(string(data2))

	map3 := map[string]interface{}{}
	str:="{\"age\":11,\"name\":\"孙悟空\"}"
	json.Unmarshal([]byte(str),&map3)
	fmt.Println("##### ",map3)
}

func testSlice(){
	map1 := make(map[string]interface{},3)
	map1["name"] = []string{"孙悟空","美猴王"}
	map1["age"] = 11

	map2 := map[string]interface{}{
		"name":"玉皇大帝",
		"age":11,
	}
	var s []map[string]interface{}
	s = append(s,map2,map1)
	data,_:=json.Marshal(s)
	fmt.Println(string(data))

	str := "[{\"age\":11,\"name\":\"玉皇大帝\"},{\"age\":11,\"name\":[\"孙悟空\",\"美猴王\"]}]"
	var s2 []map[string]interface{}
	json.Unmarshal([]byte(str),&s2)
	fmt.Println("##### ",s2)
}
```

## 单元测试

待测代码 --- 不需要main函数，随便一个包都可以

```go
package test
import(
	_"fmt"
)

func num(n int) int{
	return n
}
```

测试代码 --- 以xxx_test.go命名

```go
package test
import(
	_"fmt"
	"testing"
)

func TestNum(t *testing.T) {
	res := num(1)
	if res != 1{
		t.Fatalf("Num执行错误 \n")
	}
	t.Logf("Num执行正确 \n")
}
```

启动测试

```sh
## -v 参数可以打印详细的日志
## -cover 覆盖率
## -run regexp 只运行 regexp 匹配的函数，例如 -run=Array 那么就执行包含有 Array 开头的函数
go test -v -cover
```



## 并发

**并发** --- 互斥锁 与 读写锁

```go
package main
import (
	"fmt"
	"sync"
	"time"
)

var wg sync.WaitGroup
var totalNum int			// 共享变量
var lock sync.Mutex			// 互斥锁
var rwLock sync.RWMutex		// 读写锁
func main(){
	wg.Add(2)
	//启动协程
	go add()
	go sub()

	fmt.Println("##### 读写锁 ######")
	wg.Add(6)
	//启动协程 ---> 场合：读多写少
	for i := 0;i < 5;i++ {
		go read()
	}
	go write()
	
	wg.Wait()
	fmt.Println(totalNum)

}

func add(){
	defer wg.Done()
	for i := 0 ;i < 100000;i++{
		lock.Lock()
		totalNum++
		lock.Unlock()
	}
}
func sub(){
	defer wg.Done()
	for i := 0 ;i < 100000;i++{
		lock.Lock()
		totalNum--
		lock.Unlock()
	}
}

func read(){
	defer wg.Done()
	rwLock.RLock()//如果只是读数据，那么这个锁不产生影响，但是读写同时发生的时候，就会有影响
	fmt.Println("开始读取数据")
	time.Sleep(time.Second)
	fmt.Println("读取数据成功")
	rwLock.RUnlock()
}
func write(){
	defer wg.Done()
	rwLock.Lock()
	fmt.Println("开始修改数据")
	time.Sleep(time.Second * 10)
	fmt.Println("修改数据成功")
	rwLock.Unlock()
}
```

**并发** --- 管道

```go
package main
import (
	"fmt"
	_"time"
)

func main(){
	
	productChan := make(chan int ,100)
	exitChan := make(chan bool,4)
	fmt.Println("____")

	for i:=0;i<3;i++{
		go write(productChan,100)
	}

	go read(productChan,exitChan,300)

	for ;<-exitChan;{
		continue
	}
}

func read(productChan <-chan int,exitChan chan<- bool,count int){
	for i:=0;i<count;i++{
		fmt.Println("取出",<-productChan)	
	}
	exitChan<-true
}

func write(productChan chan<- int,count int){
	for i:=0;i<count;i++{
		productChan<-i
		// fmt.Println("存入",i)
	}
}
```

**生产消费模型**

```go
package main
import (
	"fmt"
	"strconv"
)

func main(){
	
	productChan := make(chan Product ,100)
	shopChan := make(chan Product ,100)
	exitChan := make(chan bool,1)

	// 10个生产
	for  i:=0;i<10;i++{
		go producer(productChan,100,i)
	}
	// 1个运输
	go storage(productChan,shopChan)
	// 1个消费
	go cousumer(shopChan,1000,exitChan)
	
	for ;<-exitChan;{
		continue
	}
}
type Product struct{
	name string
}
func producer(productChan chan<- Product, count,i int){
	for{
		product := Product{name:"生产线"+strconv.Itoa(i)+"\t商品"+strconv.Itoa(count)}
		productChan<-product
		count--
		if count < 1{
			return
		}
	}
}

func storage(productChan <-chan Product, shopChan chan<- Product){
	for{
		product:=<-productChan
		shopChan<-product
		// fmt.Println("运输",product.name)
	}
}

func cousumer(shopChan <-chan Product, count int, exitChan chan<- bool){
	for{
		product:=<-shopChan
		fmt.Println("消费了",product.name)
		
		count--
		if count < 1{
			exitChan<-true
			return
		}
	}
}
```

**阻塞死锁**

- 没有缓冲区时，只写不读
- 有缓冲区，但不够大
- 循环判断，读到空或没有主动关闭，都会阻塞死锁

```go
func test1(){
	// 无缓冲,只写不读会死锁
	chan1 := make(chan int)
	chan1<-10
	fmt.Println("########")
}
```

```go
func test3(){
	// 缓存区太小，仍然出现死锁
	chan1 := make(chan int,1)
	chan1<-10
	chan1<-10
	fmt.Println("#######")
}
```

```go
package main
import (
	"fmt"
	"time"
)

func main(){
	chan1:=make(chan int ,10)
	for i:=0;i<4;i++{
		go write(chan1)
	}

	// ---- 以下两种循环判断，读到空，都会阻塞死锁 ----
	for v := range chan1{
		fmt.Println(v)		
	}

	for{
		if v,ok := <-chan1;!ok{
			break
		}else{
			fmt.Println(v)
		}
	}
	// ---- 以上两种循环判断，读到空，都会阻塞死锁 ----
}

func write(chan1 chan<- int){
	time.Sleep(time.Second)
	chan1<-10
}
```

**解决阻塞死锁**

- sync.WaitGroup计数器，适用于管道需要关闭
- select-case-default多路复用，适用于管道不关闭

```go
for {
    select {
        case i := <-ch: // select会一直等待，直到某个case的通信操作完成时，就会执行case分支对应的语句
        	println(i)
        default:		//  防止阻塞
        	time.Sleep(time.Second)
        	fmt.Println("无数据")
    }
}
```

使用`select`语句能提高代码的可读性。

- 可处理一个或多个channel的发送/接收操作
- 如果多个`case`同时满足，`select`会随机选择一个
- 对于没有`case`的`select{}`会一直等待，可用于阻塞main函数

```go
select{
    case <-ch1:
        ...
    case data := <-ch2:
        ...
    case ch3<-data:
        ...
    default:
        默认操作
}
```

## 网络

### 客户端

```go
package main
import(
	"fmt"
	"net"
	"bufio"
	"os"
)

func main(){
	// 客户端启动
	fmt.Println("客户端启动")
	conn,err := net.Dial("tcp","127.0.0.1:8888")
	if err!=nil{
		fmt.Println("连接失败")
		return
	}

	for{
		//通过客户端发送单行数据
		reader := bufio.NewReader(os.Stdin)//os.Stdin代表终端标准输入
		//从终端读取一行用户输入的信息：
		str,err := reader.ReadString('\n')
		if err != nil {
			fmt.Println("终端输入失败，err:",err)
		}
		//将str数据发送给服务器：
        n,err := conn.Write([]byte(str))
        if err != nil{
                fmt.Println("连接失败，err:",err)
        }
        fmt.Printf("终端数据通过客户端发送成功，一共发送了%d字节的数据\n",n)
	}

}
```

### 服务端

```go
package main
import(
	"fmt"
	"net"
)

func main(){
	// 服务端启动
	fmt.Println("服务端启动")
	listen,err := net.Listen("tcp","127.0.0.1:8888")
	if err!=nil{
		fmt.Println("监听失败",err)
		return
	}
	for{
		conn,err2:=listen.Accept()
		if err2!=nil{
			fmt.Println("等待接收失败",err2)
		}else{
			fmt.Println("收到了",conn,conn.RemoteAddr().String())
			go read(conn)
		}
	}
}

func read(conn net.Conn){
	defer conn.Close()

	for{
		text := make([]byte ,1024)
		n,err:=conn.Read(text)
		if err!=nil{
			return
		}
		fmt.Println(string(text[0:n]))
	}
}
```

## 反射

reflect.TypeOf(num)、reflect.ValueOf(num)

```go
func testTypeAndValue(){
	num := 100
	reType := reflect.TypeOf(num)
	reValue:=reflect.ValueOf(num)
	fmt.Println(reType)		// int
	fmt.Println(reValue)	// 100
	fmt.Printf("reType的类型：%T,reValue的类型：%T \n",reType,reValue)	// *reflect.rtype  reflect.Value
	// 所以不能直接对 reValue 进行操作,需要转换
	num = int(reValue.Int() + 8)	// 转换后是int,而8 是int64，自动提升，需要用int64接收
	fmt.Println(num)

	// 类型断言
	// num2 := reValue.Interface()
	// num3 := num2.(string)	// panic: interface conversion: interface {} is int, not string
	// fmt.Println(num3)
}
```

reType.Kind()、reValue.Kind()

```go
func testKind(){
	num := 100
	reType := reflect.TypeOf(num)
	reValue:=reflect.ValueOf(num)
	// 获取类别
	k1:=reType.Kind()
	fmt.Println(k1)		// int
	k2:=reValue.Kind()
	fmt.Println(k2)		// int
}
```

结构体

```go
func testStruct(){
	person:=Person{Name:"li",age:18}
	reType:=reflect.TypeOf(person)
	reValue:=reflect.ValueOf(person)
	fmt.Println(reType)		// main.Person
	fmt.Println(reValue)	// {li 18}

    // 传指针 --- 用于改属性值
    reValue1:=reflect.ValueOf(&person)
    reValue2 := reValue1.Elem()  //拿到 reflect.Value
    
	// 类型断言
	i2 := reValue.Interface()
	//类型断言：
	n,flag := i2.(Person)
	if flag {//断言成功
		fmt.Printf("名字是：%v,年龄是：%v \n",n.Name,n.age)
	}
	fmt.Println("--- 结构体类别 ---")
	k1:=reType.Kind()
	fmt.Println(k1)		// int
	k2:=reValue.Kind()
	fmt.Println(k2)		// int
}
```

拿结构体字段

```go
func GetField(){
    person:=Person{Name:"li",age:18}
	// 属性值的获取
	reValue := reflect.ValueOf(person)
	fmt.Println(reValue)
	// 根据索引（按声明的顺序）
	nf:=reValue.NumField()
	for i:=0;i<nf;i++{
		fmt.Printf("第%d个字段的值为%v \n",i,reValue.Field(i))	
	}
	// 根据属性名
	fmt.Printf("%v \n",reValue.FieldByName("Name"))
}
```

拿结构体方法 ---  只能获取到**公共方法**，传结构体对象，只能拿到对象绑定的方法。**传指针**，能拿到所有方法

```go
func testGetMethod(){
	person:=Person{Name:"li",age:18}
    // reValue := reflect.ValueOf(person)
	reValue := reflect.ValueOf(&person)
	nm := reValue.NumMethod()	// 获取有几个方法,必须是公共方法
	fmt.Println(nm)
}
```

修改 --- **必须传指针** --- 结构体的字段必须是**公共字段**才能修改

```go
func testChange(){
	// 修改基本类型的值,ValueOf 必须传指针
	num5 := 100
	reValue5:=reflect.ValueOf(&num5)
	reValue5.Elem().SetInt(200)
	fmt.Println(num5)
    
    // 属性值的修改
    person:=Person{Name:"li",age:18}
	reValue1 := reflect.ValueOf(&person)
	reValue1.Elem().Field(0).SetString("bibibi")
	fmt.Println(person)
}
```

调用结构体方法

```go
func InvokeMethod(){
    person:=Person{Name:"li",age:18}
	reValue := reflect.ValueOf(&person)
	// 按索引获取（索引为通过ASCCLL排序后的顺序）
	rel:=reValue.Method(0).Call(nil)
	fmt.Printf("%T \n",rel)		// 返回值类型是 []reflect.Value 
	fmt.Println(rel[0].Int())	// 18

    // 构建入参
	params := []reflect.Value{reflect.ValueOf("uuuu")}
    // 按照方法名调用
	reValue.MethodByName("SetName").Call(params)
	fmt.Println(person)			// {uuuu 18}
}
```

