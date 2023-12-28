# Java基础

## 补充

### E-R模型

**ER模型**，全称为**实体联系模型实体关系模型**或**实体联系模式图（ERD）**（英语：Entity-relationship model），是[概念数据模型](https://baike.baidu.com/item/概念数据模型)的高层描述所使用的[数据模型](https://baike.baidu.com/item/数据模型)或[模式图](https://baike.baidu.com/item/模式图)。

- 矩形：实体
- 椭圆：属性
- 菱形：联系
- 实体之间，连线上标明联系的类型，即1—1、1—N或M—N

![img](http://minio.botuer.com/study-node/old/typora202207311435265.png)

### UML类图

![image-20220729194012814](http://minio.botuer.com/study-node/old/typora202207291941328.png)

### MVC设计模式

![image-20220731143340139](http://minio.botuer.com/study-node/old/typora202207311433312.png)

### Lambda表达式

- 只有一个抽象方法的接口，叫**函数式接口**

- Lambda表达式和方法引用仅在函数式接口适用

- 四大函数式接口

  ```java
  @FunctionalInterface
  interface Consumer<T>{		//消费型：有参无反
    void accept(T t);
  }
  
  @FunctionalInterface
  interface Supplier<T> {		//供给型：无参有返
      T get();
  }
  
  @FunctionalInterface			//函数型：有参有返
  public interface Function<T, R> {
      R apply(T t);
  }
  
  @FunctionalInterface			//判断型：有参判断
  public interface Predicate<T> {
      boolean test(T t);
  }
  
  ```

- 其他函数式接口

  ```java
  BiFunction<T, U, R>   //两参一返
    R apply(T t, U u);   
  UnaryOperator<T>			//参返同型
    T apply(T t);
  BinaryOperator<T>			//两参一返三同型
    T apply(T t1, T t2);
  BiConsumer<T, U>			//两参无返
    void accept(T t, U u)
    
  //传 T 返 int、long、double
  ToIntFunction<T> 
    int applyAsInt(T value);
  ToLongFunction<T> 
    long applyAsLong(T value);
  ToDoubleFunction<T>
    double applyAsDouble(T value);
  //传 int、long、double 返 R
  IntFunction<R> 
    R apply(int value);
  LongFunction<R> 
    R apply(long value);
  DoubleFunction<R>
    R apply(double value);
  ```

- 方法引用

  - 对象::实例方法名    ：参数列表和返回值类型完全一致
  - 类::静态方法名        ：参数列表和返回值类型完全一致
  - 类::实例方法名        ：参数列表的第一个参数  对应 方法调用者

- 构造器引用

  - ClassName::new    ：参数列表完全一致

- 数组引用

  - type[] :: new

## 概述

### 常用的DOS命令 

dir : 列出当前目录下的文件以及文件夹

md : 创建目录

rd : 删除目录

cd : 进入指定目录

cd.. : 退回到上一级目录

cd: 退回到根目录

del : 删除文件

exit : 退出 dos 命令行

补充：echo javase>1.doc  常用快捷键

← →：移动光标

↑ ↓：调阅历史操作命令

### Java简史

JDK1.5=JDK5.0

1.6=6.0

......

常用的是1.8（8.0）即Java8

### Java技术体系平台

Java SE 是标准版 支持面向桌面的 应用程序 逐渐退出

Java EE 是企业版 主要是面向后台开发

JavaME 是小型版 主要面向手机、Mp3等 逐渐退出

> 但是Java SE中一部分是EE中用到的，这一部分通常称为Java基础

应用于企业后台、安卓应用、大数据平台开发

### Java特点

1.类c语言

> 舍弃了c语言指针引用容易错误

2.纯粹面向对象

> 两要素 类、对象
>
> 三特征 封装、继承、多态

3.增加了垃圾回收器

> Java程序还会出现内存泄漏和内存溢出问题吗？Yes!

4.跨平台性 是由JVM实现的

> 不同的操作系统JVM不同，JVM是一个虚拟机

5.两大核心机制 Java虚拟机 垃圾收集机制

### Java语言的环境搭建

JDK 开发工具包 包括了JRE

> 开发工具:编译工具Javac.exe 打包工具java.exe
>
> JRE Java运行环境 包括JVM
>
> **JDK=JRE+开发工具集**
>
> **JRE=JVM+Java SE标准类库**
>
> **JVM=一个虚拟机**

path环境变量 系统执行命令时搜寻的路径

不配置的话只能在文件所在目录执行

配置后可在任意路径下执行

> DOS执行命令时，首先在当前路径搜寻并执行，当前路径没有，就去path中搜寻并执行

### 配置环境变量

方法1:bin路径添加到path

方法2:bin上一级路径添加到新建变量 JAVA_HOME，在path中添加%JAVA_HOME%bin（相当于给函数赋值）

注意:把添加的变量上移到最上边

### 开发步骤

编写源文件.java

编译源文件（通过javac.exe 命令：javac *.java）变成字节码文件.class（以源文件中类命名）

运行字节码文件（通过java.exe 命令：java 类）

## 关于变量

### 分类

- 全局变量（成员变量）
  - 静态变量（类变量）
  - 实例变量
- 局部变量
  - 方法变量（含构造器变量）
  - 代码块变量
  - 形参变量

### 内存存储方式

实例变量：存储在堆中

局部变量：存储在栈中

> 引用数据类型的变量 通过地址、指针赋值，
>
> **1.引用类型的变量，在栈中只可能存储两类值：null 或 地址值（含变量的类型）**
>
> 基本数据类型的变量 在栈中直接赋值
>
> **某一方法调用完，变量出栈，堆中销毁**

### 变量数据类型

| 基本数据类型 | 位数 | 默认初始化值 |            取值范围            |
| :----------: | :--: | :----------: | :----------------------------: |
|     byte     |  8   |      0       | -2^7 ~ 2^7-1   **(-128 ~127)** |
|    short     |  16  |      0       |         -2^15 ~ 2^15-1         |
|     int      |  32  |      0       |         -2^31 ~ 2^31-1         |
|     long     |  64  |      0       | -2^63 ~ 2^63-1   **(约21亿)**  |
|    float     |  32  |     0.0      |      -3.403e38 ~ 3.403e38      |
|    double    |  64  |     0.0      |     -1.798e308 ~ 1.798e308     |
|     char     |  16  |      0       |           0 ~ 2^16-1           |
|   boolean    |  8   |    false     |           false,true           |

基本数据类型：整型，浮点型，char，Boolean

引用数据类型：类，数组，接口

全局变量（成员变量）初始值：基本数据类型如上，引用数据类型为null

**局部变量：没有默认初始化值。**

### 自动类型提升

> 前提：这里讨论只是7种基本数据类型变量间的运算。不包含boolean类型的。
>
> （byte 、char 、short） --> int --> long --> float --> double
>
> 特别的：当byte、char、short三种类型的变量做运算时，结果为int型
>
> 强制类型转换，可能导致精度损失。

### 注意

**局部变量：必须先声明，才能引用，必须先初始化(形参除外)，才能引用**

声明long型变量，必须以"l"或"L"结尾

定义float类型变量时，变量要以"f"或"F"结尾

常量默认int型、double型

## 关于运算符

### 算术运算符 

**+正 - +加 - * / % (前)++ (后)++ (前)-- (后)-- +连接**

### 比较运算符

 **== != > `< >`= `<= instanceof**

### 逻辑运算符 

**& && | || ! ^（异或：相同为f，不同为t）**

### 位运算符

- **位运算符操作的都是整型的数据**

- &:全1为1  **与运算能起到取模的效果**(和2^n - 1进行与运算)

- | :有1为1

- << ：在一定范围内，每向左移1位，相当于 * 2

- \>`> :在一定范围内，每向右移1位，相当于 / 2
- 公式
  - ① a ^ b ^ a = a，a ^b ^ b = b，即出现两次相互抵消；
  -  ② a=~ ~a

```
以模数7为例：

1 = 001
7 = 111
1 & 7 = 1
2 & 7 = 2
3 & 7 = 3
4 & 7 = 4
5 & 7 = 5
...

但是若模数为8，则与运算达不到效果
8 = 1000
求与结果只有0、8两种
故完全达到求模效果的数只有2^n-1
```

### 赋值运算符 

**=, +=, -=, *=, /=, %=**

- a += .............. 即a = a + ....................

```java
int n = 10;
n += (n++) + (++n);//n = n + (n++) + (++n);
System.out.println(n);//32
```

- 实现+2的操作num += 2; (推荐)

```java
short s = 3;
s = s+2; //① 编译无效 常量默认int/float
s += 2; //② 不改变变量类型
```

### 三元运算符 

**（条件表达式）？表达式1：表达式2；**

**表达式1 和表达式2类型是一致的。**

不一致时能自动提升的编译时会自动提升**（含包装类）**

```java
//获取三个数的最大值
int n1 = 12;
int n2 = 30;
int n3 = -43;
int max1 = (n1 > n2)? n1 : n2;
int max2 = (max1 > n3)? max1 : n3;
System.out.println("三个数中的最大值为：" + max2);
```



### 优先级

| 高   |      | . () {} ; ,          |
| ---- | ---- | -------------------- |
|      | R—>L | ++ -- ~ !(data type) |
|      | L—>R | * / %                |
|      | L—>R | + -                  |
|      | L—>R | `<< >`> >>>            |
|      | L—>R | `< >` `<= >`= instanceof |
|      | L—>R | == !=                |
|      | L—>R | &                    |
|      | L—>R | ^                    |
|      | L—>R | Ⅰ                    |
|      | L—>R | &&                   |
|      | L—>R | Ⅱ                    |
|      | R—>L | ? :                  |
|      | R—>L | = *= /= %=           |
|      |      | += -= `<<= >`>=        |
| 低   |      | >>>= &= ^Ⅰ=          |



## 关于流程控制

### if...else

> 只有一个执行语句时，{}可以省略，换句话说，没有大括号，只能执行一个语句
>
> 注意先写小范围，再写大范围，否则后面的不会被执行，在多态性[instanceof](#instanceof关键字)中也有体现，先写子类，再写父类
>
> else都是可选

### switch-case

> **switch的表达式中只能是6种类型：byte、short、char、int、枚举、String**
>
> case子句中的值必须是常量
>
> default子句是可任选的，位置也是灵活的。当没有匹配的case时执行default
>
> **（但default后面的case还会执行）**
>
> **情况多时可除一个数**
>
> 执行语句相同时，case可合并
>
> case 0:
> case 1:
>
> Case 2:
>
> 执行语句

case的各种情况呈现三角形，且后面的case都用到前面的数据，可以考虑倒着写

### break与continue

> break结束当前;break用于switch语句和循环语句中
>
> continue 结束当次;多层嵌套可定义标签;continue 用于循环语句中
>
> **break、continue之后不能有其他的语句**
>
> 嵌套时可定义标签，标号语句必须紧接在循环的头部。
>
> - lable1：for循环
>
> - break lable1;

## 关于数组

**引用类型打印输出的都是地址值，char[]除外，直接输出字符串**

### 内存结构（集合同）

![image-20220807031545627](http://minio.botuer.com/study-node/old/typora202208070315023.png)

### 数组反转

```java
public void testReverse(){
	int[] ints = new int[]{-10,14,4,24,-9,-1,15,19,4};
	int temp = ints[0];
	for (int i = 0,j = ints.length - 1; i <= j; i++,j--) {
		temp = ints[j];
		ints[j] = ints[i];
		ints[i] = temp;
	}
	System.out.println(Arrays.toString(ints));
}
```

### 数组复制

```java
public void testCopy(){
	int[] ints = new int[]{-10,14,4,24,-9,-1,15,19,4};
	int[] ints2 = new int[ints.length];
	for (int i = 0; i < ints.length; i++) {
		ints2[i] = ints[i];
	}
	System.out.println(Arrays.toString(ints2));
}
```

## 面向对象

### 对象

含参[方法](#方法method的声明)中参数类型，可以是引用类型：

没有对象就new 一个，形参列表中的也同理，可以给实参new 一个匿名对象，

也可以在调用方法前new 一个对象

```java
//定义类
class Animal{
  public void eat(Animal animal){
  }
}
//测试类
public class AnimalTest{
  public static void main(String[] args) {
  Animal an = new Animal();
  an.eat(an); // new一个匿名对象 
  //an.eat(new Animal);
  }
}
```

#### 匿名对象和匿名类

```java
//非匿名类、非匿名对象
A a = new A();
B b = new B();
a.method(b);
```

```java
//非匿名类、匿名对象
A a = new A();
a.method(new B);
```

```java
//匿名类、非匿名对象
C c = new C{
	方法;
}
a.method(c);
```

```java
//匿名类、匿名对象
a.method({
	方法;
});
```

### `<----- 五个组成 ----->`

### 属性

属性：成员变量（静态变量、实例变量）

成员变量与局部变量异同：

- 相同点：
  - 格式类似
  - 都有作用域
  - 先声明，后使用
- 不同点
  - 修饰符
  - 声明的位置
  - 默认初始化
  - 内存中的位置

#### 属性赋值的先后顺序

① 默认初始化

② 显式初始化/⑤在代码块中赋值

③ 构造器中初始化

④ 通过"对象.方法" 或 "对象.属性"的方式，赋值

以上操作的先后顺序：① - ②/ ⑤ - ③ - ④ （**②/ ⑤由声明顺序决定**）

### 方法（method）

```java
权限修饰符 返回值类型 方法名(形参列表){
	方法体；
}
```

- 权限修饰符 private（类中）、缺省（包中）、protected（不同包的子类）、public（同工程内）

- 返回值类型 void、各种变量类型（必须有return）

- 形参列表 可以多个/多类型的形参/[`<span class="underline">`可变个数形参`</span>`](#可变个数形参)

- 方法体 可以递归，但是不可以再定义方法

【注】形参：方法定义时，声明的小括号内的参数

​			实参：方法调用时，实际传递给形参的数据

#### 权限修饰符

|          private           |                缺省                |         protected          |               public               |
| :------------------------: | :--------------------------------: | :------------------------: | :--------------------------------: |
|           同类内           |               同包内               |         不同包子类         |              同工程内              |
| 属性、方法、构造器、内部类 | 属性、方法、构造器、内部类、**类** | 属性、方法、构造器、内部类 | 属性、方法、构造器、内部类、**类** |

#### 可变个数形参

```java
（数据类型 ... 变量名）

（数据类型1 变量名；数据类型2 变量名；数据类型3... 变量名）
```

**一个方法只能声明一个，且在末尾**

**等价于数组**

#### 方法的重载（overload）

**同类同方法，参数个数不同，参数类型不同**

**同方法，同类型可变个数形参和数组不是重载。换句话说，二者不能共存。**

可变个数形参与其他构成重载时，其他可确定个数的优先调用

#### 方法形参的值传递与赋值

基本数据类型：直接传 数据值，直接赋值 数据值，

引用数据类型：传 地址值，赋值 地址值，来调用 数据值

注意：

**1.调用方法，通过形参传递交换改变基本数据类型的数据值时，要小心**

**2.String类型的值传递，虽严格遵循引用数据类型传递地址值，但是String类型数据存放在方法区的字符串常量池中，变量指向常量池中地址值，形参也指向这个地址值，但是重新赋值时不会抹掉原来的字符串，而是重新生成一个字符串（本质上是一个char[]）,形参指向新的地址，而原变量依然指向原来的地址**

```java
public class StringTest{
  public static void main(string[] args){
    String s = "Hello";
    change(s);
    System.out.println(s);  //Hello(未改变)
  }
  
  public static void change(String s){
    s = "Hi~~~~";
  }
}
```

### 构造器（constructor）

- 作用：**创建对象；给对象进行初始化**

- 默认空参

```java
权限修饰符 类名(){

}
```

- 带形参列表

```java
权限修饰符 类名(属性的形参列表){
	属性的形参列表；
}
```

- 构造器的重载 和方法的重载基本相同

- 显示定义后，就不会再提供默认空参的构造器

- 显示定义含参构造器，实例化时就必须赋值

- **构造器中一定含有[this](#this关键字)关键字或者[super](#super关键字)关键字，空参默认是super**

### 代码块

**代码块用于初始化**，只能被static修饰，可以有输出语句

静态代码块的执行，优先非静态代码块

同类型多个代码块，从上到下执行（但没必要，写在一起就行）

**非静态代码块的执行，优先构造器**

静态代码块随着类的加载而**执行**，且只执行一次。详见 [`<span class="underline">`static`</span>`](#static关键字) 关键字

**``非静态代码块，随着对象的加载而加载，每new一次对象，都会执行一次，父类也是``**

**``由父及子 静态先行``**

```java
class Root{
   static{
      System.out.println("Root的静态初始化块");
   }
   {
      System.out.println("Root的普通初始化块");
   }
   public Root(){
      System.out.println("Root的无参数的构造器");
   }
}
class Mid extends Root{
   static{
      System.out.println("Mid的静态初始化块");
   }
   {
      System.out.println("Mid的普通初始化块");
   }
   public Mid(){
      System.out.println("Mid的无参数的构造器");
   }
   public Mid(String msg){
      //通过this调用同一类中重载的构造器
      this();
      System.out.println("Mid的带参数构造器，其参数值："
         + msg);
   }
}
class Leaf extends Mid{
   static{
      System.out.println("Leaf的静态初始化块");
   }
   {
      System.out.println("Leaf的普通初始化块");
   }  
   public Leaf(){
      //通过super调用父类中有一个字符串参数的构造器
      super("尚硅谷");
      System.out.println("Leaf的构造器");
   }
}
public class LeafTest{
   public static void main(String[] args){
      new Leaf(); //静态代码块父--子，(代码块--构造器)(父--子)
      new Leaf();
   }
}
```

```java
public class Son extends Father {

  static {
 		 	System.out.println("44444444444");
  }

  {
  		System.out.println("55555555555");
  }

  public Son() {
    System.out.println("66666666666");
  }

  public static void main(String[] args) {

  	// 由父及子 静态先行
    System.out.println("77777777777");
    System.out.println("******************");//147
    new Son();
    System.out.println("******************");//2356
    new Son();
    System.out.println("******************");//2356
    new Father();
     System.out.println("******************");//23
  }
}

class Father {

  static {
  		System.out.println("11111111111");
  }

  {
  		System.out.println("22222222222");
  }

  public Father() {
  		System.out.println("33333333333");
  }
}
```

### 内部类

- 成员内部类：在方法、代码块、构造器外

  - 作为类，外部类有的都有，但内部类有static静态内部类，外部类没有

    > 可以final，不能被继承
    >
    > 可以abstract，不能实例化

  - 作为外部类的成员

    > 可以调用外部类的属性，方法，这时**省略的是 外部类.this** ，
    >
    > 可以被权限修饰符修饰，
    >
    > 还可以static（外部类不行），只能调用static

  - 实例化：外部类A 内部类B

    > 静态内部类的实例化：
    >
    > ```java
    > A.B b = new A.B();
    > ```
    >
    > 非静态内部类实例化：先造外部类 再造内部类
    >
    > ```java
    > A a = new A();
    > A.B b = a.new B(); //相当于调外部类的构造器
    > ```

  - 内部类属性、外部类属性、形参的重名调用：a

    ```java
    System.out.println(a); //形参
    System.out.println(this.a); //内部类
    System.out.println(A.this.a); //外部类
    ```

- 局部内部类：在方法内，代码块内，构造器内

  - 用于实现返回某个接口的实现类的对象 接口A 实用类定义为B

    ```java
    public A getA(){
    	class B implements A{ //内部类
    		重写方法;
    	}
    	return new B();
    }
    ```

  - 局部内部类  调用方法中  局部变量，这个局部变量需要被final修饰，即变为常量（final默认省略）

### `<----- 三大特征 ----->`

### 关于封装性

- 属性、方法、构造器前有权限修饰符修饰，多体现为private

- 高内聚，类的内部数据操作细节自己完成，不允许外部干涉

- 低耦合，禁止对象之间的不良交互，提高模块化

- 隐藏对象内部的复杂性，只对外公开简单的接口。便于外界调用，从而提高系统的可扩展性、可维护性。

  - 该隐藏的隐藏，该暴露的暴露

  - 隐藏信息，主要是属性和供内部调用的方法，保护对象内部的状态，然后通过set和get方法维护

  - 暴露细节，构造器和实现某些功能的方法

**属性的封装：**

```java
private 数据类型 变量名；

public void set属性（数据类型 变量名）{
	this.变量名 = 形参变量名；
}
public 数据类型 get属性（）{
	return 属性；
}
```

方法的封装：如单例模式

### 关于继承性

- 通过extends关键字实现
- 减少代码冗余，提高复用性
- 有利于功能扩展（直接让子类继承父类）
- 使类一类之间产生了关联，为多态性提供了前提

**类和接口都可继承，类只能单继承，接口可以多继承**

继承的属性可以和自有属性同名，默认调用自有属性

```java
age=18;//即this.age=18
super.age=48;
```

方法同名可能构成重写（形参列表相同）/重载（形参列表不同）

每个类都有默认根父类object

子类不能直接访问父类private的属性和方法，只能通过getter、setter调用

#### 方法的重写（overwrite）

子类对父类方法的重置、覆盖

- **权限修饰符变大（注意private）**

- **返回值类型变小**

- **方法名、形参列表必须相同**

- **可变个数形参和数组构成重写**

- **抛异常变小**

- **静态（static）方法不能重写（或者说不叫重写，就近调用）**

- **私有（private）方法不能被重写**（或者说不叫重写，是子类自有的方法）

#### extends关键字

```
权限修饰符 class 子类名 extends 父类名{
}

interface 接口1 extends 接口2，接口3{
}
```

用来继承属性和方法

#### this关键字

理解：

- 在方法中表示当前对象的[属性/方法] 
- 在构造器中表示当前正在创建的对象的[属性/方法] 

**this.属性、this.方法**

> 在方法或构造器中使用
>
> 访问本类中的方法，**如果本类没有此方法则从父类中继续查找**
>
> 当形参和属性相同时，必须用this
>
> 当形参和属性不同时，可省略this
>
> ```java
> pubic class ThisTest{
> private String name;
> 	private int age;
> 
> 	public void testThis(String name,int a){
> 	this.name = name;
> 	age = a;
> 	}
> }
> ```

**this（形参列表）**

> 调用本类的其他构造器
>
> 必须声明在构造器首行，且只能调用一个
>
> - this（）、super（）不能共存，且至少有一个，默认super（）省略
>
> - 避免闭环调用
>
> - 如果有n个构造器，那最多有n-1个this（形参列表）；至少1个super（形参列表）

#### super关键字

理解为：父类的

- 继承并重写父类方法后，子类调用的都是重写后的方法，要想掉父类就用super

- 子父类属性同名时，子类调用的也是子类自有属性，要想掉父类就用super

  - 调用未被重写的方法或父类属性时，this和super等效

    ```java
    class Person{
    	String name;
    	public void eat(String s){
    		System.out.println(s);
    	}
    }
    
    class Woman extends Person{
    	boolean isBeautiful;
    	public Woman(String name, boolean isBeautiful){
    		this.name = name;
    		this.isBeautiful = isBeautiful;
    	}
    	public String info(){
    		this.eat("能吃");  //this.eat == super.eat
    		return "姓名：" + super.name + ",颜值：" + this.isBeautiful;  //super.name == this.name
    	}
    }
    ```

- 加载类时，先加载父类再加载子类，故必定需要调用父类构造器，super()

**子类构造器中调用父类构造器**

- 默认省略super()
  - 空参构造器默认省略super（）
  - this（）、super（）不能共存，且至少有一个，默认super（）省略


- super可追溯到祖宗

- **父类没有空参时，子类构造器必须显式调用this(参数列表)或者super(参数列表)，否则编译出错**

​		**这也正是Java Bean需要空参构造器的原因**

```java
class Person{
  String name；
  public Persion(String name){
  }
  public void eat(){
  }
}

class Woman extends Person{  //Woman报错
  boolean isBeautiful；
  /*
  public Woman(String name){
   super(name);
  }
  */
}
```

### 关于多态性

多态性（即向上转型）：父类的引用指向子类的对象，应用于抽样类和接口

```java
父类类型 变量 = new 子类类型（）；
```

条件：**有继承关系；方法被重写**（未被重写不叫多态）

**不适用于属性：属性的编译和执行都是父类**的

作用：父类能够调用子类重写父类的方法，指向的子类不是唯一的，重写的方法也不相同，编译时无法确定调用的到底是哪个重写方法，实现了一种动态绑定



在多态性中，调用重写的方法叫**虚拟方法调用：**

- 被重写的方法被调用时，编译时看左边父类（虚拟方法），运行时看右边子类

- 不能运行子类特有方法（未被重写）（编译看父类，父类没有，编译出错）

- 内存结构中仍然有子类特有方法的

**重载在编译时，对于编译器而言，将方法名+不同形参对应的修饰生成调用地址，调用地址在编译期就绑定了，是一种“早绑定”或“静态绑定”**

**重写只有等到方法调用的那一刻，解释运行器才会确定所要调用的具体方法，是一种“晚绑定”或“动态绑定”**

#### instanceof关键字

x instanceof A：**检验x是否为类A的对象**，返回值为boolean型。

是继承关系，才可执行

**若是A的对象，则必定是A父类的对象（多态性）**

```java
if（x instanceof A）{
  强转；
  ......
}
```

#### 向下转型

多态性导致只能调用重写的方法，需要调用子类特有方法就需要强转

![image-20220731164435769](http://minio.botuer.com/study-node/old/typora202207311644157.png)

使用强转时，可能存在类型转换异常，为了避免异常，先进行[`<span class="underline">`instanceof`</span>`](#instanceof关键字)的判断

```java
if（x instanceof A）{
  强转；
  ......
}
```

**强转的几种情况：**

1.  父类 = new子类 --------> 子类 = （子类）父类 如上，编译通过，运行通过

2.  **爷类 = new子类 --------> 父类 = （父类）爷类 编译通过，运行通过**

3.  父类 = new父类 --------> 子类 = （子类）父类 编译通过，运行不过

4.  父类 = new子类1 --------> 子类2 = （子类2）父类 编译通过，运行不过

5.  子类2 = new子类1（相当于String s = new int[ ]） 编译不过，运行不过

> 说明：情况1中，内存有两辈信息，可以调用子辈特有
>
> 情况2中，内存有三辈信息，可以调用父辈特有
>
> 情况3中，内存只父辈信息，不可调用子辈特有
>
> 情况4中，内存虽有两辈信息，但没有同支子辈特有信息，不可强转

**多态（向上转型）与强转（向下转型）**

多态：子类赋值给父类，子类赋值给抽象类，实现类赋值给父类，实现类赋值给接口

多体现在形参中 A.method(Object obj);可以放任何类型

> A.method(父类);可以放子类
>
> A.method(抽象类);可以放子类
>
> A.method(接口);可以放实现类

向下转型：父类赋值给子类 子类对象 = （强转）父类对象；

#### 包装类（Wrapper）

![image-20220731213545240](http://minio.botuer.com/study-node/old/typora202207312135485.png)

![image-20220731213844806](http://minio.botuer.com/study-node/old/typora202207312138924.png)

把基本数据类型 包装成 引用数据类型，变成类

**装箱：基本类型 ---> 包装类：调用包装类的构造器---方便在多态中给形参赋值/传递参数**

```java
int num = 10;
Integer in1 = new Integer(num); //有很多构造器可以选择
syso(in1.toString());
```

**拆箱：包装类 --------> 基本类型：调用包装类的xxxValue（）---------------用于基本运算**

```java
int i1 = in1.intValue();
syso(i1 + 1);
```

JDK 5.0后可实现自动装箱，自动拆箱

**基本类型、包装类 -------> String**

方式1：String类型用连接字符 + 基本型/包装类

方式2：**String.valueOf(obj)**

```java
float f1 = 12.36f;
String.valueOf(f1); //有很多重载的方法可供选择

Double d1 = new Double(12.4);
String.valueOf(d1);
```

**String ----------> 基本类型、包装类：调用包装类的方法XXX.parseXXX(String 类型的变量)**

```java
String s = "123";
Integer.parseInt(s);
```

### 抽象类

- **含有抽象方法的类必须被声明为抽象类**
  - 抽象类不能被实例化。
  - 抽象类是用来被继承的
  - 抽象类的子类必须重写父类的抽象方法，并提供方法体
  - 若没有**重写全部**的抽象方法，仍为抽象类
- 不能用abstract修饰变量、代码块、构造器（都不能被重写）；


- 不能用abstract修饰私有方法、静态方法、final的方法、final的类（都不能被重写/继承）
- 抽象类中有构造器，供子类继承时调用
- 归根结底，和普通类相比，就两个特点，其他并无区别
  - 一般都定义抽象方法
  - 不能实例化

#### abstract关键字

**修饰类：抽象类**

> 抽象类不能创建对象，只能通过子类创建（多态），
>
> 一定有构造器（屁话），方便子类调用

**修饰方法：抽象方法**

> 只有声明，没有方法体 权限修饰符 abstract 返回值类型 方法名();
>
> 抽象方法一定在抽象类中
>
> 子类重写抽象方法，才可实例化
>
> 子类没有重写（继承），子类必须加上abstract（抽象方法一定在抽象类中）

### 接口（interface）

```java
interface 接口名{
}
```

**不能定义构造器，即不能实例化**

可以被多个类实现，**可以继承多个接口**

#### 组成

**全局常量**：public static final 但是书写时，可以省略不写，

> 实现类的对象来调用
>
> 实现类来调用
>
> 接口名来调用

**抽象方法**：public abstract void方法名(); 书写时public abstract可以省略

> 实现类实现了接口中所有的方法，则此实现类不再是abstract，
>
> 否则此类仍是抽象类，需要加abstract

**静态方法**：public static void方法名(){} **只能接口名来调用，不能被重写，常用来定义工具方法**

**默认方法**：public default void方法名(){} 不能通过实现类调用，可以被重写

接口的继承性和多态性：

> 接口类似父类、抽象类（抽象类只要实例化便是一个父类），
>
> 接口可作为形参出现，此时只能用实现类（子类）赋值

#### 类优先与接口冲突

**类优先原则**：父类和接口中，声明了同名同参数的方法，子类在没有重写此方法的情况下，默认调用的是父类中的同名同参数的方法

- 父类（普通类/抽象类）中的任意方法 与接口中方法冲突时，一般是类优先
  - 父类静态方法，接口抽象方法/默认方法，编译报错，接口静态方法时，依然类优先
  - 父类抽象方法，无论接口何种同名方法，子类必须重写（这也体现了类优先，只关心父类，重写所有抽象方法，否则声明为抽象类）
- 父类任意变量 与 接口全局变量冲突时，调用时必须指明具体的类或接口

**接口冲突**：两接口同名方法可能出现接口冲突，实现类在没有重写此方法的情况下，编译报错，这就需要我们必须在实现类中重写方法（不用管重写了哪个）

- 默认方法 -- 默认方法：必须重写
- **默认方法 -- 静态方法：执行默认**
- 默认方法 -- 抽象方法：必须重写
- 抽象方法 -- 静态方法：必须重写
- 抽象方法 -- 抽象方法：必须重写
- **静态方法 -- 静态方法：接口.方法调用**

- 重写后，调用重写后方法，可用**super.调父类**，用   **接口.super. 方法  调具体接口的方法**

```java
interface Filial {// 孝顺的 
    default void help() {
    		System.out.println("老妈，我来救你了"); 
    }
}
interface Spoony {// 痴情的 
    default void help() {
    		System.out.println("媳妇，别怕，我来了"); 
    }
}
class Man implements Filial,Spoony { 
    @Override
    public void help() {
        System.out.println("我该怎么办呢？");
        Filial.super.help();
        Spoony.super.help();
    }
}
```

#### **面试纠错题**

```java
interface A { 
		int x = 0;
}

class B { 
		int x = 1;
}

class C extends B implements A { 
    public void pX() {
    		System.out.println(x); 				//x歧义，冲突
      	System.out.println(super.x);	//调用父类的
      	System.out.println(A.x);			//调用接口的
    }
    public static void main(String[] args) { 
    		new C().pX();
    } 
}
```

```java
interface Playable { 
		void play();
}
interface Bounceable { 
		void play();
}
interface Rollable extends Playable,Bounceable {
		Ball ball = new Ball("PingPang"); //常量，省略了public static final
}

class Ball implements Rollable { 
    private String name;
    public String getName() { 
    		return name;
    }
    public Ball(String name) { 
    		this.name = name;
    }
    public void play() {
      	ball = new Ball("Football"); //此处ball是Rollable中声明多全局常量，不能再被修改
				System.out.println(ball.getName());
    }
}
```

#### implements关键字

先写extends，后写implements

```java
class 子类 extends 父类 implements 接口1,接口2{
}
```

【注】实现类对抽象类、接口中抽象方法的重写我们叫实现，

​			   实现类和接口之间叫实现，实现类和抽象类之间叫实现，

​			   子类和父类之间叫继承，接口之间叫继承

#### default关键字

- switch_case的结束语句

- 接口中默认方法的关键字，可以有方法体了，就会出现方法体重写及调用的问题

## 其他关键字

### package关键字

声明包 在源文件首行

同包下，不能命名同名的类、接口

### import关键字

- 导入指定包中的类、接口

- 声明在包和类之间

- 导入包下所有类、接口 import xxx.*

  - **但是 xxx子包下的结构，则仍需要显式导入**


  - 不同包下的同名的类，则必须至少有一个类需要以全类名的方式显示


- java.lang包下定义的，可省略import结构

- **import static:导入指定类或接口中的静态结构:属性或方法**

  - 调用时可省略类名

    ```java
    System.out.println();  //out.println();
    Math.random();  //random();
    ```

### static关键字

可以修饰 属性、方法、代码块、内部类

**修饰属性：**

> **实例变量**：未被static修饰的变量（又叫实例属性，非静态变量）
>
> **静态变量**：被static修饰的变量（又叫静态属性，类变量）
>
> 多对象共享一套属性，改变一个对象的属性，其他对象的属性也会改变
>
> 内存中，静态变量随着类的加载而加载
>
> 类相对于对象先加载，故静态变量的加载早于对象的创建，
>
> 在对象创建前，可以通过 **类 . 静态变量** 的方式调用
>
> 类只加载一次，故静态变量也只加载一次，**存放在方法区的静态域中**

**修饰方法：**

> **静态方法**：随着类的加载而执行，可以通过类调用方法 **类 . 静态方法**
>
> 静态方法中，只能调用静态方法和静态属性，也**不能使用this和super关键字**（非静态、this、super都依赖于对象，静态方法加载时，对象可能未被创建）
>
> **静态方法不能被重写**，不叫重写，没有多态性，**调用的是父类的方法**⭐️
>
> ```java
> public class WomanTest {
> 	public static void main(String[] args) {
> 		Person wom = new Woman();
> 		wom.sleep();		//我想睡觉（调用的是父类的方法）
> 		Woman.sleep();	//我也想睡觉觉
> 		Person.sleep();	//我想睡觉
> 	}
> 
> }
> class Person{
> 	
> 	public static void sleep(){
> 		System.out.println("我想睡觉");
> 	}
> }
> 
> class Woman extends Person{
>   
> 	public static void sleep() {
> 		System.out.println("我也想睡觉觉");
> 	}
> }
> ```
>
> **调用静态属性或方法时，省略的不是this，而是类**（类 . 静态变量 或 类 . 静态方法）
>
> 非静态方法，静态、非静态都可以调用

**修饰代码块**

> 静态代码块随着类的加载而**执行**，且只执行一次。
>
> 非静态代码块，随着对象的加载而加载，每new一次对象，都会执行一次。

**static的应用：**

- 共享的属性，都一样的，要变都变的属性，需要静态

- 常量（如PI）需要静态

- 需要操作静态属性的方法，需要静态

- 工具类中的方法（Math、Arrays等），需要静态（不需要创建对象，可以直接调方法）

**计数器/自动编号原理**

```java
class Number{
    各种属性；
    //用于计数，静态的，影响全局
    private static int total;
    //用于编号
    private static int init = 1001;
    public Number(){
        //只要创建对象，就会计数
        total++;
        //只要创建对象，就会往后编号
        init++;
    }
    public static int getTotal(){
    		return total;
    }
    public static int getInit(){
    		return init;
    }
}
```

### final关键字

**修饰类**：不能再被继承

**修饰方法**：不可以再被重写

**修饰变量**：变成常量，不可再修改，变量名改为全大写

- **修饰属性**时，可以赋值的位置：显示初始化，代码块初始化，构造器中初始化
  - 每个**对象常量共用，显示初始化**或代码块初始化
    - 初始化需要**调用方法，就用代码块初始化**
  - 每个**对象常量不同，构造器初始化**

- **修饰形参**时，方法体内此变量不能再被重新赋值
- **修饰引用数据类型时，只是限制地址值，不限制对象属性变化**

```java
public class Something {
    public int addOne(final int x) { 
        return ++x;//编译异常
        // return x + 1;编译通过
    } 
}
```

```java
public class Something {
    public static void main(String[] args) { 
        Other o = new Other();
        new Something().addOne(o); 
    }
    public void addOne(final Other o) { 
        // o = new Other();编译报错
        o.i++; //编译通过
    }
}
class Other { 
		public int i;
}
```

### native关键字

`native`关键字是java编程语言用来调用底层C语言库的

```java
//Object类中
public final native Class<?> getClass();
public native int hashCode();
protected native Object clone();
public final native void notify();
public final native void notifyAll();
public final native void wait(long timeout);
```

### transient关键字

修饰成员变量，不可序列化

## 异常处理

### 关于异常

**java.lang.Throwable**

- |-----java.lang.**Error**:一般不编写针对性的代码进行处理。

  - StackOverflowError //栈溢出

  - OutOfMemoryError //堆溢出

- |-----java.lang.**Exception**:可以进行异常的处理

  - |------编译时异常(checked)
    - |-----IOException	//IO异常
      - |-----FileNotFoundException	//文件未找到异常
    - |-----ClassNotFoundException    //类未找到异常

  - |------运行时异常(unchecked,RuntimeException)

    - |-----NullPointerException	//空指针异常
    - |-----ArrayIndexOutOfBoundsException   //数组角标越界

    - |-----ClassCastException   //类型转换异常

    - |-----NumberFormatException  //数字格式异常

    - |-----InputMismatchException   //输入不匹配异常

    - |-----ArithmeticException   //计算异常

**Error：**Java虚拟机无法解决的严重问题，只能重写代码

**Exception：**

- 编译时异常（受检异常）

- 运行时异常（非受检异常）

**抓抛模型：**

- **"抛"：**异常是一个类，出现异常就会在异常代码处生成一个对应异常类的对象，并将此对象抛出，一旦抛出对象以后，其后的代码就不再执行。

  **异常对象的产生**：

  ① 系统自动生成的异常对象

  ② 手动的生成一个异常对象，并抛出（throw）

- **"抓"：**可以理解为异常的处理方式：① try-catch-finally ② throws

### try-catch-finally

```java
try{ 
  //**可能**出现异常的代码
}catch(异常类型1 变量名1){ 
  //处理异常的方式1
}catch(异常类型2 变量名2){ 
  //处理异常的方式2
}....
finally{ 
  //一定会执行的代码
}
```

- **不出异常就执行try**，出了异常依次在catch中匹配；进入并处理后，就不会再往下进行处理异常（finally除外）

- **异常类型**就是异常所属的类，一般要写具体到子类，方便写具体的处理方式

- **变量名**一般用"e"表示，只在一个catch内有效，所以都可以命名为"e"

- **处理的方式**： ① System.out.println(e.getMessage()); ② e.printStackTrace();**(包含①)**

- **finally是可选的**，有返回值时，先执行finally再try/catch/finally的返回值或手动抛异常

  像数据库连接、输入输出流、网络编程Socket等资源，JVM是不能自动的回收的，此时的**手动资源释放(close)**，就需要声明在finally中。

- **finally防止程序中途终止**
  - return/throw，整个异常代码所属的方法会中止，不会再往下执行
  - 又有新的异常，而没有处理，也会中止

**说明：**

> 在try结构中声明的变量，再出了try结构以后，就不能再被调用，可以在try外声明；
>
> try-catch-finally只能保证编译不报错，运行时仍可能报错。把编译时可能出现的异常，延迟到运行时出现。
>
> 开发中，我们通常不针对运行时异常编写try-catch-finally（没有实质作用）
>
> 针对于编译时异常，一定要考虑异常的处理（保证编译通过）。

### throws

```java
方法 throws 异常类型1，异常类型2{

}
```

方法体执行时，出现异常，生成异常类的对象，匹配异常类型，**抛给方法的调用代码**，用try-catch-finally解决，此方法内，**异常代码后续的代码，就不再执行**！本质上throws并没解决，try-catch-finally:真正的将异常给处理掉了。

**try-catch-finally 与throws的选择：**

> 如果父类中被重写的方法没有throws方式处理异常，则子类重写的方法也不能使用throws，
>
> 意味着不能throws的子类，重写的方法有异常时，必须使用try-catch-finally方式处理。
>
> 执行方法中，调用了几个**环环相扣**的可能出现异常的方法，使用throws的方式进行处理。
>
> 而执行的方法用try-catch-finally方式进行处理。（**如果每个都try-catch处理完，返回的数据可能不是想要的，环环相扣能够执行也不再有意义**）

### throw手动抛异常

```java
throw new 异常类型();
```

> 异常类型是RuntimeException时，不需要处理
>
> 异常类型是其他时，可选择throws或 try-catch-finally 处理
>
> **throw的地位和return类似，先执行finally再抛异常**

### 自定义异常类

继承现有异常结构

```java
public class 异常类型 extends RuntimeException{

}

public class 异常类型 extends Exception{
  //提供异常标识全局常量serialVersionUID
	static final long serialVersionUID = 号码;
	
  //实际生产中一般 定义很多 全局常量
  private String message;
	//提供重载的构造器
	构造器(String message){
    this.message = message;
  }
}
```

## 线程

### 基本概念

**程序**：为完成特定任务、用某种语言编写的一组指令的集合。即指一段静态的代码

**进程**：正在运行的程序

**线程**：进程的细化，同时间并行，线程中栈和程序计数器是独立的，堆和方法区是共享的

**并行**：多个cpu，不同线程做不同事情

**并发**：一个cpu，不同线程抢共享资源

**生命周期**

![image-20220804184201455](http://minio.botuer.com/study-node/old/typora202208041842587.png)

**死锁**：线程同步过程中，两线程分别占用对方的资源不放，多出现在嵌套同步中，如线程一先拿a锁，后需要b锁，线程二先拿b锁，后需要a锁

```java
package com.botuer.thread;

public class DeadLockTest {
	public static void main(String[] args) {
		final StringBuffer s1 = new StringBuffer();
		final StringBuffer s2 = new StringBuffer();
		new Thread() {
			public void run() {
				synchronized (s1) {
					s2.append("A");
					synchronized (s2) {
						s2.append("B");
						System.out.println("线程一  s1   " + s1);
						System.out.println("线程一  s2   " + s2);
					}
				}
			}
		}.start();
		new Thread() {
			public void run() {
				synchronized (s2) {
					s2.append("C");
					synchronized (s1) {
						s1.append("D");
						System.out.println("线程二  s1   " + s1);
						System.out.println("线程二  s2   " + s2);
					}
				}
			}
		}.start();
	}
}
```

```
情况1:  线程一完成 ---> 线程二
  线程一  s1   
	线程一  s2   AB
	线程二  s1   D
	线程二  s2   ABC
情况2:  线程二完成 ---> 线程一
  线程二  s1   D
  线程二  s2   C
  线程一  s1   D
  线程一  s2   CAB
情况3:死锁 线程二（给s2赋值为AC/CA时出现死锁）
	线程一完成第一步 ---> 线程二完成第一步 ---> 死锁
	线程二完成第一步 ---> 线程一完成第一步 ---> 死锁
```



```java
class A {
	public synchronized void foo(B b) {
		System.out.println("当前线程名: " + Thread.currentThread().getName()
				+ " 进入了A实例的foo方法"); // ①
		try {
			Thread.sleep(200);
		} catch (InterruptedException ex) {
			ex.printStackTrace();
		}
		System.out.println("当前线程名: " + Thread.currentThread().getName()
				+ " 企图调用B实例的last方法"); // ③
		b.last();
	}

	public synchronized void last() {
		System.out.println("进入了A类的last方法内部");
	}
}

class B {
	public synchronized void bar(A a) {
		System.out.println("当前线程名: " + Thread.currentThread().getName()
				+ " 进入了B实例的bar方法"); // ②
		try {
			Thread.sleep(200);
		} catch (InterruptedException ex) {
			ex.printStackTrace();
		}
		System.out.println("当前线程名: " + Thread.currentThread().getName()
				+ " 企图调用A实例的last方法"); // ④
		a.last();
	}

	public synchronized void last() {
		System.out.println("进入了B类的last方法内部");
	}
}

public class DeadLock implements Runnable {
	A a = new A();
	B b = new B();

	public void init() {
		Thread.currentThread().setName("主线程");
		// 调用a对象的foo方法
		a.foo(b);
		System.out.println("进入了主线程之后");
	}

	public void run() {
		Thread.currentThread().setName("副线程");
		// 调用b对象的bar方法
		b.bar(a);
		System.out.println("进入了副线程之后");
	}

	public static void main(String[] args) {
		DeadLock dl = new DeadLock();
		new Thread(dl).start();
		dl.init();
	}
}
```

**[通信](#线程通信)：**线程之间的交互

**对于线程问题的思路：**

是否是多线程

是否有共享数据

是否存在线程安全问题

如何解决线程安全问题

### Thread类

#### **构造器**

```java
Thread() //创建线程对象
Thread(String threadname) //创建线程对象并命名
Thread(Runnable target) //创建线程对象，该对象实现了Runnable接口中的run
Thread(Runnable target,String name) //创建对象，实现Runnable，并命名
```

#### **常用方法**

```java
start(): 启动当前线程；调用当前线程的run() 
run(): 线程中要执行的方法（需要重写）
currentThread():静态方法，返回当前线程，Thread.currentThread().getName()
getName():获取当前线程的名字
setName():设置当前线程的名字
  
yield():释放当前cpu的执行权
join(): a.join()，a线程加入，原线程阻塞
stop():已过时。当执行此方法时，强制结束当前线程
sleep(long millitime):让当前线程"睡眠"指定的millitime毫秒。指定时间内阻塞

isAlive():判断当前线程是否存活
```

#### **线程优先级**

**优先级大只是抢占cpu执行权的概率高，并不绝对**

```java
MAX_PRIORITY = 10
MIN_PRIORITY = 1
NORM_PRIORITY = 5 //默认优先级*

getPriority()			//:获取当期线程优先级
setPriority(int p)//:设置线程优先级
```

### 创建1：继承Thread类

- 子类继承Thread类
- 子类重写Thread类中的run方法
- 创建Thread子类对象，即创建了线程对象
- 调用线程对象start方法

```java
class A extends Thread{ //定义Thread继承类
		重写run方法 //重写的就是线程要执行的代码
}

class ATest{ //测试类
    public static void main(String[] args){
        A a = new A(); //创建线程对象
        A b = new A();
        a.start(); //启动线程，并调用run方法
        b.start();
    }
}
```

**匿名子类的方式：**

```java
class ATest{

    public static void main(String[] args){
        new Thread(){
            重写run方法；
        }.start();
    }	
}
```

**关于start方法**

- a.run();不能启动线程，只是单线程调用重写后的方法

- 一个线程对象只能调用一次start方法，重复调用抛出异常"IllegalThreadStateException"
- run()方法由JVM调用，什么时候调用，执行的过程控制都有操作系统的CPU调度决定

### 创建2：实现Runnable接口（推荐）

- 子类实现Runnable接口
- 子类重写Runnable接口中的run方法
- 将Runnable接口的子类对象作为实际参数传递给Thread类的构造器中
- start方法

```java
class A impelments Runnable{ //定义Runnable的实现类
		重写run方法 //
}

class ATest{
    public static void main(String[] args){
        A a = new A(); //创建实现类对象
        Thread thread1 = new Thread(a); //把这个对象作为形参，创建线程对象
        Thread thread2 = new Thread(a);
        thread1.start(); //启动线程，并调用run方法
        thread2.start();
    }
}
```

**继承Thread与实现Runnable比较：**

- 实现接口避免了单继承的局限，多线程可以共享实现类的对象

- 实际上Thread也实现了Runnable接口

### 创建3：实现Callable接口

- 实现Callable接口
- 创建实现类对象
- 创建FutureTask对象，传入实体类对象
- 创建Thread对象，传入FutureTask对象
- 调用start()

**Future接口**

- 可以对具体Runnable、Callable任务的执行结果进行取消、查询是否完成、获取结果等
- FutrueTask是Futrue接口的唯一的实现类
- FutureTask 同时实现了Runnable, Future接口。它既可以作为Runnable被线程执行，又可以作为Future得到Callable的返回值

```java
class A implements Callable{ //1.创建Callable实现类
    public Object call() throws Exception{ //2.实现call方法---可以抛异常
    		......
    		return obj; //有返回值
    }
}

public class ATest{

    public static void main(String[] args){

        A a = new A(); //3.创建实现类对象
        //4.作为形参传递到FutureTask构造器
        FutureTask futureTask = new FutureTask (a);
        //5.futureTask作为形参，传递到Thread构造器，并调用start方法
        new Thread(futureTask).start();

        //返回值有用，可执行如下代码
        //获取call方法的返回值
        //get()返回值即FutureTask构造器参数中，重写call方法的返回值
        Object obj = futureTask.get();
        System.out.println(obj);
    }
}
```

**与继承Thread、实现Runnable比较：**有返回值，可抛异常，支持泛型

### 创建4：线程池（推荐）

```java
public class ThreadPool{

    public static void main(String[] args){

      //指定线程池中线程数量
      ExecutorService service = Executors.newFixedThreadPool(10);

      ThreadPoolExecutor service1 = (ThreadPoolExecutor) service;
      //设置线程池的属性 
      service1.setCorePoolSize(15); //线程数量
      service1.setKeepAliveTime();	//维持时间

      //2.执行指定的线程的操作。需要提供实现类的对象
      service.execute(Runnable runnable);//适合适用于Runnable 这里没写实现类
      service.submit(Callable callable);//适合使用于Callable 这里没写实现类
      //3.关闭连接池
      service.shutdown();
		}
}
```

**ExecutorService**

- 真正的线程池接口。常见子类ThreadPoolExecutor
  - 要设置属性需要强转到子类
  - corePoolSize：核心池的大小
  - maximumPoolSize：最大线程数
  - keepAliveTime：线程没有任务时最多保持多长时间后会终止

- void execute(Runnable command) ：执行任务/命令，没有返回值，一般用来执行 
  Runnable
- `<T>` Future`<T>` submit(Callable`<T>` task)：执行任务，有返回值，一般用来执行 
  Callable
- void shutdown() ：关闭连接池

**Executors**

- 工具类、线程池的工厂类，用于创建并返回不同类型的线程池
- Executors.newCachedThreadPool()：创建一个可根据需要创建新线程的线程池
- Executors.newFixedThreadPool(n); 创建一个可重用固定线程数的线程池
- Executors.newSingleThreadExecutor() ：创建一个只有一个线程的线程池
- Executors.newScheduledThreadPool(n)：创建一个线程池，它可安排在给定延迟后运行命令或者定期地执行。

**线程池好处：**
1.提高响应速度（减少了创建新线程的时间）

2.降低资源消耗（重复利用线程池中线程，不需要每次都创建）

3.便于线程管理

### 同步1：同步代码块

```java
synchronized (同步监视器){
	// 需要被同步的代码；
}
```

- 实现需要被同步的代码要恰到好处，多了可能会变成单线程，少了可能解决不了安全问题

- 同步监视器，俗称锁，

- **锁只能有一个，共用一把锁，可以用任何对象充当（Object型）**

- 可以慎用this，尤其是继承创建的多线程，每个线程new一个新对象

- **继承方式创建多线程时，可以考虑用当前类充当对象**，确保每个线程拿到的锁是同一个对象

- 本质上，把锁内变成了单线程

### 同步2：同步方法

```java
public synchronized void 方法名 (){
	....
}
```

仍有同步监视器，不显式声明，**非静态的方法省略了this，静态的省略了当前类**

由于非静态省略this，在继承创建的多线程中，this指代不明，我们必须声明为静态方法

**同步代码块与同步方法对比**：

- **同步代码块**

  - **继承类时，共享资源需要static，锁用当前类**

  - **实现接口时，不需static，锁用this即可**

- **同步方法**

  - **继承类时，同步方法需要static，隐式的锁是当前类**
  - **实现接口时，不需static，隐式的锁是this即可**

- 需要被同步的代码分布在多个方法中时，我们选择同步方法，
- 每个方法都synchronized一般我们选择同步代码块，更有针对性，效率稍高

### 同步3：锁（Lock）

```java
class A{
  private ReentrantLock lock = new ReentrantLock(); //实例化ReentrantLock
	
  @Override
  public void run(){ //重写run方法
  	......
  	lock.lock(); //上锁
  	try{
      ...... //需要同步的代码
    }finally{
     	lock.unlock(); //解锁 
    }
  }
}
```

**与synchronized对比**：

synchronized执行完自动释放锁，lock手动解锁，lock只有代码块锁，无方法锁

lock：锁JVM将花费较少时间来调度线程，性能更好，具有更好扩展性（提供更多的子类）

### 线程通信

wait(); 挂起当前线程，并释放锁，等待唤醒

notify(); 唤醒优先级最高的线程

notifyAll(); 唤醒所有wait的线程

> 都只能用在synchronized方法、代码块中，否则报异常IllegalMonitorStateException
>
> 都必须拿到锁才能被调用
>
> 都定义在Object类中
>
> **与sleep对比**：同：都使线程阻塞
>
> 异：声明位置不同 Object/Thread
>
> 调用要求不同 拿到锁/无要求
>
> sleep不会释放锁，wait释放锁
>
> sleep时间到唤醒，wait等notify、notifyAll唤醒

```java
package com.botuer.thread;

class Clerk { // 售货员
	private int product = 0;
	public synchronized void addProduct() {
		if (product >= 20) {
			try {
				wait();
			} catch (InterruptedException e)
			{
				e.printStackTrace();
			}
		} else {
			product++;
			System.out.println("生产者生产了第" + product + "个产品");
					notifyAll();
		}
	}
	public synchronized void getProduct() {
		if (this.product <= 0) {
			try {
				wait();
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		} else {
			System.out.println("消费者取走了第" +
					product + "个产品");
			product--;
			notifyAll();
		}
	}
}
class Consumer implements Runnable { // 消费者
	Clerk clerk;
	public Consumer(Clerk clerk) {
		this.clerk = clerk;
	}
	public void run() {
		System.out.println("消费者开始取走产品");
		while (true) {
			try {
				Thread.sleep((int) Math.random() * 1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			clerk.getProduct();
		}
	}
}
class Productor implements Runnable { // 生产者
	Clerk clerk;
	public Productor(Clerk clerk) {
		this.clerk = clerk;
	}
	public void run() {
		System.out.println("生产者开始生产产品");
		while (true) {
			try {
				Thread.sleep((int) Math.random() * 1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			clerk.addProduct();
		}
	}
}
public class ProductTest {
	public static void main(String[] args) {
		Clerk clerk = new Clerk();
		Thread productorThread = new Thread(new Productor(clerk));
		Thread consumerThread = new Thread(new Consumer(clerk));
		productorThread.start();
		consumerThread.start();
	}
}
```

## 常用类

### Object

Object类是所有Java类的根父类

如果在类的声明中未使用extends关键字指明其父类，则默认父类为java.lang.Object类

**无属性；一个空参构造器**

#### **equals 与 ==**

- ==适用于基本数据类型和引用数据类型
  - 基本数据类型比较数据值
  - 引用数据类型比较地址值
- equals仅仅适用于引用数据类型
  - 未被重写时，默认等同于 ==，
  - 重写equals，比较相应属性是否相等
  - 默认重写的类，如String、Date、File、包装类等

```java
public boolean equals( Object obj ){

  if (this == obj) { //地址都相同，属性肯定相同
  	return true;
  }
	//此处有bug，需要确保两个对象是同一个类，单纯用instanceof，可能混进父类对象if(this.getClass().getName() == obj.getClass().getName())
  if(obj instanceof 类){
  	类 o = (类)obj; //强转，否则可能没有对应的属性
    return this.属性 == o.属性 && ......; //也可以用equals（equals默认就是==）
  }
	return false;
}
```

#### **toString**

- 当我们输出一个对象的引用时，实际上就是调用当前对象的toString()

  - 一般情况下两者相同

    ```java
    System.out.println(obj)
    System.out.println(obj.toString())
    ```

  - 特别注意null

    ```java
    obj=null;
    System.out.println(obj);						//null
    System.out.println(obj.toString());	//空指针异常
    ```

- 未被重写时，输出地址值，
- 重写后，输出属性信息，
- 默认重写的类，String、Date、File、包装类等
- **特别注意char[]**,其他数组未被重写

```java
public String toString(){
	return "属性" + this.属性 + ...；
}
```

#### hashCode

**被native关键字修饰，调用的是底层C\C++库**

```java
public native int hashCode();
```

**重写时，用Objects工具类调用了Arrays重写的hashCode(Object[] a) **

- 将传入的每一个属性值

- 进行调用底层C/C++来计算hashCode

  result = 31 * result + element.hashCode()

- 元素为null，则 result = 31 * result + 0

**为什么 * 31**

- 选择系数的时候要选择尽量大的系数。因为如果计算出来的hash地址越大，所谓的“冲突”就越少，查找起来效率也会提高。（减少冲突）
- 并且31只占用5bits,相乘造成数据溢出的概率较小。
- 31可以由i*31== (i<<5)-1来表示,现在很多虚拟机里面都有做相关优化。（提高算法效率）
- 31是一个素数，素数作用就是如果我用一个数字来乘以这个素数，那么最终出来的结果只能被素数本身和被乘数还有1来整除！(减少冲突)

```java
//Objects工具类
public static int hash(Object... values) {
    return Arrays.hashCode(values);
}
//Arrays工具类
public static int hashCode(Object a[]){
      if (a == null)
          return 0;

      int result = 1;

      for (Object element : a)
          result = 31 * result + (element == null ? 0 : element.hashCode());

      return result;
  }
```

#### **finalize**

当垃圾回收确定没有更多对对象的引用时，由对象上的垃圾回收器调用。

#### **wait与  notify和  notifyAll**

被native关键字修饰，调用的是底层C\C++库

```java
public final native void notify();
public final native void notifyAll();
public final native void wait(long timeout);

public final void wait(long timeout, int nanos) throws InterruptedException {
    if (timeout < 0) {
        throw new IllegalArgumentException("timeout value is negative");
    }
    if (nanos < 0 || nanos > 999999) {
        throw new IllegalArgumentException(
                            "nanosecond timeout value out of range");
    }
    if (nanos > 0) {
        timeout++;
    }
    wait(timeout);
}

public final void wait() throws InterruptedException {
    wait(0);
}
```

**wait()**

- 放弃CPU，释放锁

- 当前线程必须具有对该对象的监控权（加锁）

**notify()**

- 唤醒优先级高的wait()
- 当前线程必须具有对该对象的监控权（加锁）

**notifyAll()**

- 唤醒所有wait()
- 当前线程必须具有对该对象的监控权（加锁）

> 这三个方法只有在synchronized方法或synchronized代码块中才能使用，否则会报 java.lang.IllegalMonitorStateException异常。

### String相关

#### String

- 实现了Serializable接口，支持序列化； 
- 实现了Comparable接口，可比较大小

- Java 程序中的所有字符串字面值（如 "abc" ）都作为此类的实例实现，字面量区别于new

  - 字面值方式产生的字符串是个常量，地址都指向方法区中的字符串常量池中
  - new出来的字符串都在堆中，然后再指向字符串常量池
  - 字面值拼接地址直接指向常量池，变量参与的拼接先指向堆
  - final修饰的变量变成了常量，再与字面量拼接也直接指向常量池
  - new String()，产生了两个对象，一个是String的，一个是char[]的

  ```java
  String s1 = "javaEE";
  String s2 = "hadoop";
  final String s0 = "javaEE";
  
  String s3 = "javaEEhadoop";
  String s4 = "javaEE" + "hadoop";
  String s5 = s1 + "hadoop";
  
  String s6 = s0 + "hadoop";
  String s7 = s1 + s2;
  
  System.out.println(s3 == s4);//true
  System.out.println(s3 == s5);//false
  System.out.println(s3 == s7);//false
  System.out.println(s5 == s7);//false
  System.out.println(s3 == s6);//true
  
  String s8 = s5.intern();//返回值得到的s8使用的常量值中已经存在的"javaEEhadoop"
  System.out.println(s3 == s8);//true
  ```

- String是一个final类，不可被继承，

- 对象的字符内容是存储在一个char数组value[]中，**final的，即不可变性**

**方法**

```java
intern();	//方法返回值得到的是常量池的地址

//类型转换
String.valueOf(xxx);	//转字符串
s.toCharArray();				//转char数组
s.toBytes();						//转字节数组
String(xxx);					//char[]、byte[]转字符串
XXX.parseXXX(s);			//字符串转包装类

//增删改查
concat(s);   		//同 + “”
toLowerCase();	//小写
toUpperCase();	//大写
trim();					//收尾空格
subString(int begin);		//字串
subString(int begin,int end);

endsWith(String suffix)			//结尾否
startsWith(String prefix); //开头否
stratsWith(String prefix,int toffset) //

indexOf(String str)			//首次出现
indexOf(String str, int fromIndex)
lastIndexOf(String str);	//最后出现
lastIndexOf(String str, int fromIndex);	//

split(String regex);	//正则切片

//String、StringBuffer、StringBuilder是CharSequence的实现类
replace(char oldChar, char newChar)	//替换
replace(CharSequence target, CharSequence replacement) //替换
replaceAll(String regex, String replacement)
replaceFirst(String regex, String replacement)

compareTo();		//
compareToIgnoreCase(String str)
equals(Object anObject)
equalsIgnoreCase(String anotherString)
isEmpty()
contains(CharSequence s)
```

#### StringBuffer、StringBuilder

> **String与StringBuffer、StringBuilder对比**
>
> String：不可变，
>
> StringBuffer：可变，线程安全
>
> StringBuilder：可变，线程不安全
>
> 底层都是char[]存储
>
> 可变：提前开辟16位空间，不够了就用位运算扩容，扩一次是原来2倍+2
>
> - new对象时创建长度为16 + 字符串size的数组
> - 扩容至2倍+2，还够就用size大小代替

**常用方法：**

```java
append(obj) //支持所有数据类型
delete(int start,int end)
charAt(int n)
setCharAt(int n ,char ch)
replace(int start, int end, String str)
subString()
insert(int offset, xxx)
indexOf()
reverse() //逆转
for() + charAt() //遍历
```

一个面试题：

```java
public void testStringBuffer(){
String str = null;
StringBuffer sb = new StringBuffer();
sb.append(str);
System.out.println(sb.length());//4 (底层结构把null当成了四个字符)
System.out.println(sb);//"null"
StringBuffer sb1 = new StringBuffer(str);
System.out.println(sb1);//抛异常NullPointerException
```

```java
@Test
public void testString(){
	String a = "abc";
	String b = "abc";
	String c = new String("abc");
	String d = new String("abc");
	System.out.println(a.equals(b)); //t
	System.out.println(a == b); //t
	System.out.println(c.equals(d)); //t
	System.out.println(c == d); //f
	System.out.println(a.equals(c)); //t
	System.out.println(a == c); //f
}
```

### 日期时间

#### Date

**java.util.Date类
     |---java.sql.Date类**

**util中的Date**

```java
//构造器
new Date();	//Sun Apr 17 12:43:26 CST 2022
new Date(1650170606897L);	//Sun Apr 17 12:43:26 CST 2022

//方法
toString(); //显示当前 年月日时分秒
getTime();	// 获取当前时间戳 
```

**sql中的Date**

```java
//构造器
Date sqlDate = new Date(1650170606897L);	//2022-4-17

//sql的转util的:多态性
java.util.Date utilDate = sqlDate;	//2022-4-17

//util转sql：通过getTime()  
java.util.Date utilDate2 = new java.util.Date();
Long time = utilDate2.getTime(); 
date sqlDate2 = new Date(time);
```

#### LocalDateTime等

LocalDate、LocalTime、LocalDateTime

jdk1.8新日期API：

> 可变（Date中需要新造），
>
> 无偏移（Date中从1900开始，月从0开始），
>
> 格式化（Calendar不能格式化），

LocalDateTime最常用，包含时间和日期，用法和Calendar相似

常用方法：

```java
now() //静态方法，创建当前时间对象，可指定时区LocalDate date= LocalDate.now();
of() //静态方法，创建指定日期时间对象 LocalDate date= LocalDate.of(2020,5,6);
getDayOfMonth()//等等 获取年/月/日/时/分/秒 dateTime.getDayOfMonth()
withDayOfMonth()//等等 把年/月/日修改为指定值 date.withDayOfMonth(22)
plusDays()//等等 当前对象添加年/月/日/时 dateTime.plusMonths(3)
minusDays()//等等 当前对象减去年/月/日/时 dateTime.minusDays(6)
```

#### **SimpleDateFormat**

```java
//构造器
new SimlpeDateFormat();	//创建默认模式语言的对象
SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy/MM/dd hh:mm:ss");	//创建指定格式

//方法
String formatDate = simpleDateFormat.format(date);//格式化
Date date = simpleDateFormat.parse(string);//解析
```

#### **DateTimeFormatter**

**（格式化）：类似于SimpleDateFormat**

预定义标准格式：

本地化相关格式：

自定义格式：ofPattern("yyyy-MM-dd hh:mm:ss")

```java
//定义格式，静态方法ofPattern(string),返回DateTimeFoematter对象
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm:ss");
//格式化
String str = formatter.format(LocalDateTime.now()); //格式化2022-04-17 03:05:15
//解析
TemporalAccessor accessor = formatter.parse("2019-02-18 03:52:09");

//TemporalAccessor是一个接口
//解析{MicroOfSecond=0, SecondOfMinute=9, MinuteOfHour=52, NanoOfSecond=0, HourOfAmPm=3, MilliOfSecond=0},ISO resolved to 2019-02-18
```

#### **Instant**

> （瞬时）：类似于java.util.Date

```java
now() //静态方法，返回本初子午线时间 Instant instant = Instant.now();
atOffset() //添加时区偏移量，创建OffsetDateTime对象
OffsetDateTime offsetDateTime = instant.atOffset(ZoneOffset.ofHours(8));
toEpochMilli() //静态方法，获取时间戳 long milli = instant.toEpochMilli();
ofEpochMilli() //时间戳 ------> 日期时间
```

#### **Calendar**

日历类（抽象类）

```java
//实例化
Calendar calender = new GregorianCalender();
Calendar calender = Canlender.getInstance();

//方法
get() //返回年的第几天，第几个月等等calendar.get(Calendar.DAY_OF_MONTH)
set() //设置为当月的第几天，等等
add() //加减
getTime() //日历类 ------>Date
setTime() //Date ------>日历类
```

> **注意**：获取月份时：一月是0 ；获取星期时：周日是1，周二是2

### 比较器

#### Comparable

- **Comparable自然排序**

- String、包装类实现了Comparable接口，重写了compareTo(obj)方法；调用排序方法就要重写compareTo()
- 实现Compareble接口，重写compareTo()

```java
Arrays.sort(arr); //这里调用的sort方法源码中调用了compareTo方法，下面重写
```

```java
/*
* 
*		if（xxx instanceof Xxx）{
*			强转；
*			比较；
*		}else{
*			抛异常；
*		}
* ******************************************
* 比较
*   单条件：String类型调用重写方法  this.xxx.compareTo(xxxx.xxx)
*					基本数据类型调用包装类的静态方法  Xxxx.compare(this.xxx,xxxx.xxx)
*		多条件：
*					if(xxxx.xxx.equals(xxxx.xxx)){
*						return 第二条件比较
*					}
*					else{
*						return 第一条件比较
*					}
*/

@Override
public int compareTo(Object o) {
    if(o instanceof Goods){
    		Goods goods = (Goods)o; //Object类强转为自定义类
    		//方式一：
    		if(this.price > goods.price){
    				return 1;
    		}else if(this.price < goods.price){
    				return -1;
    		}else{
    				// return 0; //只按价格排序，返回0
    				return -this.name.compareTo(goods.name); //价格同，再按其他属性排续
    		}
   			//方式二：
    		// return Double.compare(this.price,goods.price);
    }
    throw new RuntimeException("传入的数据类型不一致！");
}
```

#### Comparator

**Comparator定制排序**

- 自然排序不能满足临时的排序要求
- 直接在调用排序方法时创建Comparator的匿名实现类，重写compare方法

```java
Arrays.sort(arr, new Comparator() { //匿名的接口实现类
//指明商品比较大小的方式:按照产品名称从低到高排序,再按照价格从高到低排序
@Override
public int compare(Object o1, Object o2) {
    if(o1 instanceof Goods && o2 instanceof Goods){
      Goods g1 = (Goods)o1;
      Goods g2 = (Goods)o2;
    	if(g1.getName().equals(g2.getName())){ //名称同的，按价格排序
    			return -Double.compare(g1.getPrice(),g2.getPrice());
    	}else{ //名称不同的，按名称排序
    			return g1.getName().compareTo(g2.getName());
    	}
    }else{
    	throw new RuntimeException("输入的数据类型不一致");
    }
});
```

### System

```java
//String成员变量：
in	//（输入流）
out	//（输出流）
err	//（错误输出流）

//成员方法：
native long currentTimeMillis() //返回时间戳
void exit(int status) //退出程序。status为0正常退出，非零异常退出,可用于图形界面实现退出程序
void gc() 请求垃圾回收（但是不一定马上回收）
String getProperty(String key) 返回key指定的属性

key = "java.version" 运行环境版本
key = "java.home" java安装目录
key = "os.name" 操作系统名称
key = "os.version" 操作系统版本
key = "user.name" 用户账户名称
key = "user.home" 用户的主目录
key = "user.dir" 用户当前工作目录
```

### Math

java.lang.Math提供了一系列静态方法用于科学计算。参数和返回值类型一般为double型。

```java
abs //绝对值
sqrt //平方根
pow(double a,doble b) //a的b次幂
log //自然对数
exp //e为底指数
max(double a,double b) //
min(double a,double b) //
random() //返回0.0到1.0的随机数

long round(double a) //double型数据a转换为long型（四舍五入）
acos,asin,atan,cos,sin,tan //三角函数
toDegrees(double angrad) //弧度--->角度
toRadians(double angdeg) //角度--->弧度
```

### Scanner

**键盘获取**

```java
导入包 import java.util.Scanner; 

创建对象 scanner scan = new Scanner(System.in);

指定变形类型
String name = scan.next();
int age = scan.nextInt();
double weight = scan.nextDouble();
boolean isLove = scan.nextBoolean();

无char，用string代替
```

### BigInteger、BigDecimal

```java
//构造器
BigInteger(String val)

//方法
BigInteger abs()	//返回此 BigInteger 的绝对值的 BigInteger。
BigInteger add(BigInteger val) //返回其值为 (this + val) 的 BigIntege
BigInteger subtract(BigInteger val)//返回其值为 (this - val) 的 BigInteger
BigInteger multiply(BigInteger val)//返回其值为 (this * val) 的BigInteger
BigInteger divide(BigInteger val) //返回其值为 (this / val) 的BigInteger整数相除只保留整数部分。
BigInteger remainder(BigInteger val)//返回其值为 (this % val) 的BigInteger
BigInteger[] divideAndRemainder(BigInteger val)//返回包含 (this / val) 后跟(this % val) 的两个 BigInteger 的数组。
BigInteger pow(int exponent) //返回其值为 (thisexponent) 的 BigInteger。
```

```java
//构造器
BigDecimal(double val)
BigDecimal(String val)

//常用方法
BigDecimal add(BigDecimal augend)
BigDecimal subtract(BigDecimal subtrahend)
BigDecimal multiply(BigDecimal multiplicand)
BigDecimal divide(BigDecimal divisor, int scale, int roundingMode)
```

### Optional

- java- 8

- 解决空指针问题

  ```java
  //实例化
  Optional.of(T t) 					//创建一个Optional实例，t必须非空；
  Optional.empty() 					//创建一个空的Optional实例
  Optional.ofNullable(T t)	//t可以为null
    
  //判断是否有对象
  boolean isPresent() 			//判断是否包含对象
  void ifPresent(Consumer<? super T> consumer) //如果有值，就执行Consumer接口的实现代码，并且该值会作为参数传给它
  
  //获取Optional容器的对象
  T get()						//如果调用对象包含值，返回该值，否则抛异常
  T orElse(T other) //如果有值则将其返回，否则返回指定的other对象。
  T orElseGet(Supplier<? extends T> other) 	//如果有值则将其返回，否则返回由Supplier接口实现提供的对象
  T orElseThrow(Supplier<? extends X> exceptionSupplier) //如果有值则将其返回，否则抛出由Supplier接口实现提供的异常
  ```

  ```java
  @Test
  public void test1() { 
      Boy b = new Boy("张三");
      Optional<Girl> opt = Optional.ofNullable(b.getGrilFriend()); 
      // 如果女朋友存在就打印女朋友的信息
      opt.ifPresent(System.out::println); 
  }
  @Test
  public void test2() { 
      Boy b = new Boy("张三");
      Optional<Girl> opt = Optional.ofNullable(b.getGrilFriend()); 
      // 如果有女朋友就返回他的女朋友，否则只能欣赏“嫦娥”了
      Girl girl = opt.orElse(new Girl("嫦娥"));
      System.out.println("他的女朋友是：" + girl.getName()); 
  }
  ```

  ```java
  @Test
  public void test3(){
      Optional<Employee> opt = Optional.of(new Employee("张三", 8888)); 
      //判断opt中员工对象是否满足条件，如果满足就保留，否则返回空
      Optional<Employee> emp = opt.filter(e -> e.getSalary()>10000); 
      System.out.println(emp);
  }
  @Test
  public void test4(){
  Optional<Employee> opt = Optional.of(new Employee("张三", 8888)); 
      //如果opt中员工对象不为空，就涨薪10%
      Optional<Employee> emp = opt.map(e -> {e.setSalary(e.getSalary()%1.1);return e;});
      System.out.println(emp); 
  }
  ```

  

## 枚举类

定义的类对象个数有限，确定，用枚举类

定义一组常量，用枚举类

枚举类中对象只有一个，用单例模式实现

### 枚举类定义方法（旧版）

1.  声明属性用private final修饰 私有常量

2.  私有化含参构造器，并给对象属性赋值

3.  以属性方式提供多个对象，用public static final修饰

4.  其他诉求：如get方法，toString方法

```java
class Season{
    private final String seasonName;
    private final String seasonDesc;
    private Season(String seasonName,String seasonDesc){
      this.seasonName = seasonName;
      this.seasonDesc = seasonDesc;
    }
    public static final Season SPRING = new Season("春天","春暖花开");
    public static final Season SUMMER = new Season("夏天","夏日炎炎");
    public static final Season AUTUMN = new Season("秋天","秋高气爽");
    public static final Season WINTER = new Season("冬天","冰天雪地");
}
```

### 枚举类定义方法（新版）：enum

**定义的枚举类默认继承于Enum类，不能再继承他类**

1.  提供枚举类对象，**以逗号隔开，以分号结束**

**枚举对象必须在类首，可以直接用于switch-case，不用声明类型**

**（2.3.4都可省）**

2.  声明对象属性，用private final修饰 私有常量

3.  私有化含参构造器，并给对象属性赋值

4.  其他诉求：如get方法，toString方法

5.  实现接口时，抽象方法**可统一重写，也可逐个重写**

```java
//最简
enum Season{

	SPRING,
	SUMMER,
	AUTUMN,
	WINTER;
}
```

```java
enum Season1 implements Info{

	SPRING("春天","春暖花开"){
		@Override
		public void show() {
			
		}
	},
	SUMMER("夏天","夏日炎炎"){
		@Override
		public void show() {
			
		}
	},
	WINTER("冬天","冰天雪地") {
		@Override
		public void show() {
			
		}
	},
	AUTUMN("秋天","秋高气爽") {
		@Override
		public void show() {
			
		}
	};

	private final String seasonName;
	private final String seasonDesc;

	private Season1(String seasonName,String seasonDesc){
		this.seasonName = seasonName;
		this.seasonDesc = seasonDesc;
	}
}
```

```java
//Enum类主要方法：
toString() //返回枚举类对象常量名称
values() //返回对象数组，遍历枚举值
valueOf(objName) //返回枚举类中对象名是objName的对象，
```

> *如果没有objName的枚举类对象，则抛异常：IllegalArgumentException*

## 注解(Annotation) 

**Annocation的使用示例**

- 示例一：生成文档相关的注解

  - @author 标明开发该类模块的作者，多个作者之间使用,分割 

  - @version 标明该类模块的版本

  - @see 参考转向，也就是相关主题 

  - @since 从哪个版本开始增加的

  - @param 对方法中某参数的说明，如果没有参数就不能写

  - @return 对方法返回值的说明，如果方法的返回值类型是void就不能写

  - @exception 对方法可能抛出的异常进行说明 ，如果方法没有用throws显式抛出的异常就不能写 
    - @param @return 和 @exception 这三个标记都是只用于方法的。 
    - @param的格式要求：@param 形参名 形参类型   形参说明 
    - @return 的格式要求：@return 返回值类型 返回值说明
    - @exception的格式要求：@exception 异常类型 异常说明 
    - @param和@exception可以并列多个

- 示例二：在编译时进行格式检查(JDK内置的三个基本注解)

  - @Override: 限定重写父类方法, 该注解只能用于方法

  - @Deprecated: 用于表示所修饰的元素(类, 方法等)已过时。

  - @SuppressWarnings: 抑制编译器警告（比如未使用的变量编译器会提示）

- 示例三：跟踪代码依赖性，实现替代配置文件功能
  - Servlet3.0提供了注解(annotation),使得不再需要在web.xml文件中进行Servlet的部署
  - spring框架中关于“事务”的管理

### 自定义注解

**参照@SuppressWarnings定义**

* 注解声明为：@interface

* 内部定义成员，通常使用value表示

* 可以指定成员的默认值，使用default定义

  - value类型只能是  基本数据类型、String类型、Class类型、enum类型、Annotation类型、以上所有类型的数组。

  - 注解定义时含有配置参数，使用时必须指定参数值，除非它有默认值

  - 使用格式是"参数名 = 参数值"

  - 如果只有一个参数成员，且名称为value，可以省略"value="

  - 如果只有一个参数成员，建议使用**参数名为value**

* 如果自定义注解没有成员，表明是一个标识作用。

```java
public @interface MyAnnotation {
	String value() default "hello";  //定义成员变量
}
```

自定义注解必须配上注解的信息处理流程(使用反射)才有意义。

架构 = 注解 + 反射 + 设计模式

自定义注解通常都会指明两个元注解：Retention、Target

### 四种元注解 

**（元注解：注解的注解----对现有的注解进行解释说明的注解）**

- **Retention**：指定所修饰的 Annotation 的生命周期：

  - **SOURCE**------只存在于编译前（源文件保留）

  - **CLASS**（默认行为）------处在于编译文件（字节码文件保留）

  - **RUNTIME**------运行后依然存在（运行时保留）
    - 只有声明为RUNTIME生命周期的注解，才能通过反射获取

- **Target**:修饰哪些程序元素（构造器/方法/属性等等）

- **Documented**:表示所修饰的注解在被javadoc解析时，保留下来
  - 定义为Documented的注解必须设置Retention值为RUNTIME

- **Inherited**:被它修饰的 Annotation 将具有继承性
  - 父类有注解，子类自动有父类的注解

### 重复注解

① 自定义Annotation上声明@Repeatable，成员值为自定义Annotations.class

② 自定义Annotation元注解与自定义Annotations相同

```java
//jdk8之前：定义一个新注解，把原来的注解封装到数组中
public @interface MyAnnotations {
		MyAnnotation[] value();
}

@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target({TYPE, FIEL, METHOD, PARAMETER, CONSTRUCTOR, LOCAL_VARIABLE})
public @interface MyAnnotation {
		String value() default "hello";
}

//jdk 8之前的写法：
@MyAnnotations({@MyAnnotation(value="hi"),@MyAnnotation(value="abc")})
class Person{
}
```

```java
//jdk8开始
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target({TYPE, FIEL, METHOD, PARAMETER, CONSTRUCTOR, LOCAL_VARIABLE})
public @interface MyAnnotations {
		MyAnnotation[] value();
}

@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target({TYPE, FIEL, METHOD, PARAMETER, CONSTRUCTOR, LOCAL_VARIABLE})
@Repeatable(MyAnnotations.class)
public @interface MyAnnotation {
		String value() default "hello";
}

//jdk 8 之后写法
@MyAnnotation(value="hi")
@MyAnnotation(value="abc")
class Person{
}
```

### 类型注解

Java 8之前，注解只能在声明的地方使用，Java8开始，注解可以应用在任何地方。

JDK1.8之后，关于元注解@Target的参数类型ElementType枚举值多了两个：

```java
ElementType.TYPE_PARAMETER //表示该注解能写在类型变量的声明语句中（如：泛型声明）。

ElementType.TYPE_USE //表示该注解能写在使用类型的任何语句中。

class Generic<@MyAnnotation T>{
  public void show() throws @MyAnnotation RuntimeException{
    ArrayList<@MyAnnotation String> list = new ArrayList<>();
    int num = (@MyAnnotation int) 10L;
  }
}
```

## 集合

### 集合框架

* |----Collection接口：单列集合，用来存储一个一个的对象
  - |----List接口：存储有序的、可重复的数据。 -->"动态"数组
    - |----ArrayList、LinkedList、Vector
  - |----Set接口：存储无序的、不可重复的数据 -->高中讲的"集合"
    - |----HashSet
      - LinkedHashSet
    - SortedSet ---- TreeSet

* |----Map接口：双列集合，用来存储一对(key - value)一对的数据 -->高中函数：y = f(x)
  - |----HashMap、LinkedHashMap、TreeMap、Hashtable、Properties

### Iterator

- 迭代器接口

- 设计模式的一种，用于遍历集合，是Colleation接口的父接口

- 不具有容器功能，必须配合集合使用

**实例化**

- 通过iterator()方法创建迭代器对象

- 每次调用iterator()方法都会得到一个新的迭代器对象

**方法**

- hasNext()：调用next()方法之前，必须先调hasNext()方法进行检测，若不调用，且无下一条元素时，抛出异常NoSuchElementException
- next()：调用后：指针下移，返回下移后对应的元素
- remove()：移除
  - 如果还未调用next(),直接调用remove 报IllegalStateException
  - next 方法之后两次调用remove 报IllegalStateException

```java
Iterator iter = coll.iterator();//创建迭代器对象，回到起点
while(iter.hasNext()){
  Object obj = iter.next();
  if(obj.equals("Tom")){
      //这里的remove是迭代器中的，不是Collection中的
      iter.remove();
  }
}
```

### forEach

```java
for(集合中元素类型 局部变量 ： 集合对象){}
  for(Object obj : coll){
  System.out.println(obj);
}
```

```java
//遍历赋值

//方式一：普通for赋值
for(int i = 0;i < arr.length;i++){
	arr[i] = "GG";
}
//方式二：增强for循环
for(String s : arr){
	s = "GG";
}
```

### Collection

- 集合

```java
add(Object obj) //添加
size() //返回元素个数
addAll(Collection coll) //把coll集合中元素添加到
clear() //清空  注意：清空 不等于 删除
isEmpty() //是否为空
contains() //通过equals方法判断是否包含元素
containsAll() //通过equals方法判断是否包含所有
remove() //移除
removeAll() //移除所有
retainAll() //取交集，并返回给当前对象，不改变形参中的集合
equals()
hashCode() //返回哈希值
  
toArray() //转为数组

iterator() //迭代器遍历
//Collection无直接实现类，需要调用子接口实现类
```

```java
//Arrays中的方法，转为集合
Arrays.asList() 
  //注意
  Arrays.asList(new int[]{1,2,3,4}) //得到的List长度为1
  Arrays.asList(new Integer[]{1,2,3,4}) //得到的List长度为4
```

#### List接口

- 列表

**List接口框架**

* |----Collection接口：单列集合，用来存储一个一个的对象

  * |----List接口：存储有序的、可重复的数据。 -->"动态"数组,替换原有的数组

    * |----ArrayList：作为List接口的主要实现类；线程不安全的，效率高；底层使用Object[] elementData存储

    * |----LinkedList：对于频繁的插入、删除操作，使用此类效率比ArrayList高；底层使用双向链表存储

    * |----Vector：作为List接口的古老实现类；线程安全的，效率低；底层使用Object[] elementData存储

##### ArrayList

- （数组列表）

- **源码分析：**

  - **jdk1.7 **
    - **空参构造器创建长度为10的Object[]数组 elementData**
    - **添加元素，容量不够，扩容为1.5倍**，不够时直接用需要的+现有的代替
    - 开发中，我们可以用带参构造器

  - **jdk1.8**
    - **创建时，初始化为{ }，没有定义长度**
    - **调用add时，创建长度为10的数组，节省内存**，类似懒汉式，

**常用方法**：

```java
add
addAll
get //查，返回指定位置元素
set //改
indexOf //返回首次出现位置
lastIndexOf //返回末次出现位置
subList //返回[ , )子集合
size //长度

//区分remove(int index)和remove(Object obj)
//默认使用索引，使用元素需要装箱
list.remove(2)
list.remove(new Integer(2))
```

##### LinkedList（链式列表）

**源码分析：**定义了next，内部类定义了Node类型的frist和last属性

添加时，把元素封装到Node中，创建Node对象（即每个元素都是Node对象）

Node体现了LinkedList的双向列表

```java
//内部类
private static class Node<E> {
    E item;   			//添加的元素
    Node<E> next;		//下一个
    Node<E> prev;		//上一个

    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}

//add方法
public boolean add(E e) {
    linkLast(e);
    return true;
}

//linkLast()方法
void linkLast(E e) {
    final Node<E> l = last;
    final Node<E> newNode = new Node<>(l, e, null);
    last = newNode;
    if (l == null)	//没有元素last就是null
        first = newNode;	//添加的元素赋给first
    else
        l.next = newNode;	//添加的元素赋给last
    size++;
    modCount++;
}
```

##### Vector（向量）

> **源码分析：**创建对象时，创建长度为10的数组
>
> 扩容时变成原来2倍

```java
Vector v=new Vector();
v.addElement(Object obj);		//增
v.removeElement(Object obj);//删
v.setElementAt(Object obj,int index);//改
Object obj=v.elementAt(0);	//查
v.insertElementAt(Object obj,int index);	//插
v.size();
```

#### Set接口

**Set接口的框架：**

* |----Collection接口：单列集合，用来存储一个一个的对象

  * |----Set接口：存储无序的、不可重复的数据 -->高中讲的"集合"

    * |----HashSet：作为Set接口主要实现类；线程不安全的；**可以存储null值**
      * |----LinkedHashSet：作为HashSet的子类；遍历按照添加的顺序遍历，对于频繁的遍历操作，LinkedHashSet效率高于HashSet.

    * |SortedSet ----TreeSet：可以按照添加对象的指定属性，进行排序。

- Set接口中没有额外定义新的方法，使用的都是Collection中声明过的方法。

**无序性与不可重复性：**

- **向Set实现类中添加数据时，一定要重写hashCode()和equals()**

- 且两方法保持一致性，相等对象的哈希值必须相等

- 对象中用作equals方法比较的Field都应该用来计算hashCode的值

##### HashSet

**底层是HashMap**

- Set是单列集合，所以只是存储了key的数据
- value存储了一个new Object()，并没有实质意义，仅是为了避免空指针，所以把重写的这个方法被static修饰，变成静态的方法，不用再new Object()

```java
public HashSet() {
    map = new HashMap<>();
}
```

**一个Bug：重复添加**

```java
@Test
public void testList() {
	HashSet set = new HashSet();
	Person p1 = new Person(1001, "AA");
	Person p2 = new Person(1002, "BB");
	set.add(p1);
	set.add(p2);
	p1.name = "CC";
	set.remove(p1);
	System.out.println(set); //[Person{name='BB', id=1002}, Person{name='CC', id=1001}]
	set.add(new Person(1001, "CC"));
	System.out.println(set); //[Person{name='BB', id=1002}, Person{name='CC', id=1001}, Person{name='CC', id=1001}]
	set.add(new Person(1001, "AA"));
	System.out.println(set); //[Person{name='BB', id=1002}, Person{name='CC', id=1001}, Person{name='CC', id=1001}, Person{name='AA', id=1001}]
}
```

##### LinkedHashSet

**LinkedHashSet（HashSet的子类）**

- 遍历按照添加的顺序遍历（添加元素时，**每个元素还维护两个引用，记录先后顺序**）

- LinkedHashSet插入性能略低于HashSet
- 对于频繁的遍历操作，LinkedHashSet效率高于HashSet

##### TreeSet

- **顺序存储**

- 添加的数据必须是**相同类的对象**

- 底层源码为红黑树

- **不可重复性不是通过equals方法实现的，而是红黑树的特性实现的，或者说是由compareTo返回0决定的**

  - 在自然排序中，通过comparable中的compareTo方法，返回0，插入失败

  - 在定制排序中，通过comparator中的compare方法，返回值为0，元素相同，添加失败

    ```java
    //构造器
    TreeSet set = new TreeSet() //按自然排序方式创建对象，添加元素
    TreeSet set = new TreeSet(com)// 按定制排序方式创建对象，添加元素
    ```

**List去重**

```java
public List duplicateList(List list) { 
    HashSet set = new HashSet();
    set.addAll(list);
    return new ArrayList(set); 
}
```

### Map接口

Map的实现类的结构：

* |----Map:双列数据，存储key-value对的数据 ---类似于高中的函数：y = f(x)

  * |----HashMap:作为Map的主要实现类；线程不安全的，效率高；存储null的key和value
    * |----LinkedHashMap:保证在遍历map元素时，可以按照添加的顺序实现遍历。对于频繁的遍历操作，此类执行效率高于HashMap。

  * |SortedMap----TreeMap:保证按照添加的key-value进行排序，实现排序遍历。考虑key的自然排序或定制排序,底层使用红黑树

  * |----Hashtable:作为古老的实现类；线程安全的，效率低；不能存null的key和value
    * |----Properties:常用来处理配置文件。key和value都是String类型

- Map是双列集合，在Entry（Node）中存储了key和value，一对key-value构成Entry对象

- key是无序，不可重复的，使用Set存储，key所在的类需要重写equals和hashCode

- value是无序的，可重复的，使用Collection存储，value所在类需要重写equals

- entry是无序，不可重复的，使用Set存储

```java
//常用方法

put 		//既可以加，也可以改
putAll	//
remove	//
clear 	//
get(Object key) //
containsKey
containsValue
size
isEmpty
equals
//元视图操作方法：

Set keySet 				//返回key的集合
Collection values //返回value的集合
Set entrySet 			//返回键值对的集合

//遍历
Set set = map.keySet(); //遍历key
Iterator iterator = set.iterator();
while(iterator.hasNext()){
	System.out.println(iterator.next());
}

Collection values = map.values(); //遍历value
Iterator iterator1 = values.iterator();
while(iterator1.hasNext()){
	System.out.println(iterator.next());
}

Set entrySet = map.enteySet(); //遍历键值对
for(Object obj : entrySet){
	Map.Entry entry = (Map.Entry)obj;
	System.out.println(entry.getKey() + "------ >" + entry.getValue());
}

Set keySet = map.keySet(); //遍历键值对
Iterator iterator2 = keySet.iterator();
while(iterator2.forNext()){
	Object key = iterator2.next();
  Object value = map.get(key);
	System.out.println(key + "--------" + value);
}

//其实在遍历键值对时可以直接调输出语句即可System.out.println(map);
//上述方式中理解取的思路，在数据库中用得到
```

#### HashMap

**源码分析（数组 + 链表）jdk1.7**

- 实例化后，创建长度为16的Entry[] table数组
- 添加元素a时，调用a所在类的hashCode方法，计算哈希值

- 通过某种算法(与运算，相当于取模)计算出HashSet底层数组存放的位置，判断是否已有元素

  - 没有元素，添加成功

  - 有元素b，或有链表形式存放的多个元素，比较哈希值，

    - 哈希值不同，添加成功，

    - 哈希值相同，调用a所在类的equals方法
      - 不同，添加成功
      - 相同添加失败，但value1替换原有元素

- 元素越来越多的时候 ，hash冲突的几率也就越来越高，需要扩容

- 到达 临界值 = 负载因子0.75 * 旧容量 ，开始扩容

  - 扩容至2倍小于最大容量，且旧容量不小于16，扩容至2倍
  - 大于最大容量，旧临界值改为int的最大值

**需要链表存储的情况下，七上八下**

- jdk1.7中，a直接放在数组中，以链表方式指向其他元素

- jdk1.8中，原来元素依然在数组中，向下指向元素a

**jdk1.8数组 + 链表 + 红黑树**

- 实例化的时候，没有创建长度16的Entry[]

- 首次调用put方法时，创建长度16的Node[]

- 先形成链表（七上八下）

- 索引位置上的链表上元素个数 > 8 ,且数组长度 > 64时，此索引上数据改为红黑树

**全局常量和重要变量**

- DEFAULT_INITIAL_CAPACITY : 默认初始容量，16
- DEFAULT_LOAD_FACTOR：默认负载因子：0.75
- TREEIFY_THRESHOLD：树化临界值8
- MIN_TREEIFY_CAPACITY：树化容量:64
- table：存储元素的数组，总是2的n次幂 
- entrySet：存储具体元素的集
- size：HashMap中存储的键值对的数量 
- modCount：HashMap扩容和结构改变的次数。 
- threshold：扩容的临界值，=容量*负载因子 
- loadFactor：负载因子

**负载因子的大小**

- 负载因子的大小决定了HashMap的数据密度。
- 负载因子越大密度越大，发生碰撞的几率越高，数组中的链表越容易长, 造成查询或插入时的比较次数增多，性能会下降。
- 负载因子越小，就越容易触发扩容，数据密度也越小，意味着发生碰撞的几率越小，数组中的链表也就越短，查询和插入时比较的次数也越小，性能会更高。但是会浪费一定的内容空间。而且经常扩容也会影响性能，建议初始化预设大一点的空间。
- 按照其他语言的参考及研究经验，会考虑将负载因子设置为0.7~0.75，此时平均检索长度接近于常数。

```java
static final float DEFAULT_LOAD_FACTOR = 0.75f;//默认负载因子
final float loadFactor; //负载因子
public HashMap() {
    this.loadFactor = DEFAULT_LOAD_FACTOR; // all other fields defaulted
}

//键值对封装到Node中，Node实现了Entry内部接口
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    V value;
    Node<K,V> next;

    Node(int hash, K key, V value, Node<K,V> next) {
        this.hash = hash;
        this.key = key;
        this.value = value;
        this.next = next;
    }

    public final K getKey()        { return key; }
    public final V getValue()      { return value; }
    public final String toString() { return key + "=" + value; }

    public final int hashCode() {
        return Objects.hashCode(key) ^ Objects.hashCode(value);
    }

    public final V setValue(V newValue) {
        V oldValue = value;
        value = newValue;
        return oldValue;
    }

    public final boolean equals(Object o) {
        if (o == this)
            return true;
        if (o instanceof Map.Entry) {
            Map.Entry<?,?> e = (Map.Entry<?,?>)o;
            if (Objects.equals(key, e.getKey()) &&
                Objects.equals(value, e.getValue()))
                return true;
        }
        return false;
    }
}

//添加元素
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}
```

```java
//putVal()方法
transient Node<K,V>[] table;  //底层的数组
static final int TREEIFY_THRESHOLD = 8;		//链表的元素个数的临界值

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
               boolean evict) {
    Node<K,V>[] tab;
  	Node<K,V> p;
  	int n, i;
    if ((tab = table) == null || (n = tab.length) == 0)//数组为空/长度为0，初始化
        n = (tab = resize()).length; //调用resize方法进行初始化或扩容
    if ((p = tab[i = (n - 1) & hash]) == null) //与运算相当于求模，找位置，并把此位置上元素赋为p
        tab[i] = newNode(hash, key, value, null);	//此位置为空，直接放上去
    else {
        Node<K,V> e; K k;
      	//比较此位置上key的hash值，然后比较key的地址值，再比较内容，都相同，就是重复元素
      	//不相同，判断是否是TreeNode的对象，是，就调用putTreeVal方法，放进去
      	//不是TreeNode就是链表，循环遍历，直到链表上没有下个节点 或 节点上有相同元素时停止
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))	//同元素
            e = p;//把此位置上的元素赋给e
        else if (p instanceof TreeNode)	//红黑树
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        else {	//链表
            for (int binCount = 0; ; ++binCount) { 
                if ((e = p.next) == null) {
                  	//没有下个节点了，开始造节点对象，放到链表上
                    p.next = newNode(hash, key, value, null);
                  	//链表上超过8个了，准备树化
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        treeifyBin(tab, hash);
                    break;
                }
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
        if (e != null) { // existing mapping for key
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
            afterNodeAccess(e);
            return oldValue;
        }
    }
    ++modCount;
    if (++size > threshold)
        resize();
    afterNodeInsertion(evict);
    return null;
}
```

```java
//resize()初始化与扩容

int threshold;		//临界值
static final int MAXIMUM_CAPACITY = 1 << 30;				//最大容量  10 7374 1824
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4;	//默认初始容量 16
static final float DEFAULT_LOAD_FACTOR = 0.75f；			//默认加载因子 0.75
//@Native public static final int MAX_VALUE = 0x7fffffff; //int的最大值  2^31-1

final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;	//旧容量
    int oldThr = threshold;	//旧临界值
    int newCap, newThr = 0;	//新容量、新临界值
    //扩容
  	if (oldCap > 0) {
      	//大于最大容量，旧临界值改为int的最大值，返回旧数组
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
      	//扩容至2倍小于最大容量，且旧容量不小于16，扩容至2倍
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // double threshold
    }
  	//初始化
    else if (oldThr > 0) // 初始容量为临界值
        newCap = oldThr;
    else {               
        newCap = DEFAULT_INITIAL_CAPACITY;	//临界值未初始化时，使用默认容量
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY); //初始化临界值 = 默认容量 * 0.75
    }
  	//如果新的临界值=0，则，ft 和 新容量 都小于 最大容量时，新临界值=ft，否则=int最大值
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor; //ft = 新容量*负载因子
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                  (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;	//新临界值赋给旧临界值，准备下次调用
    @SuppressWarnings({"rawtypes","unchecked"})
    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];	//造底层数组
    table = newTab;
  	//复制到扩容后到数组
    if (oldTab != null) {
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;	//把每个元素赋给e，方便操作
          	//把每个元素赋给e，然后清空该位置，通过next属性判断有无链表或红黑树
          	//如果没有，此时把e赋给哈希值添加到指定位置
          	//判断e是否是TreeNode的对象，通过split方法拆分安排到新位置
          	//都不符合那就是链表，对链表进行重新安排（preserve order 维持秩序？）
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                if (e.next == null)	//空
                    newTab[e.hash & (newCap - 1)] = e;
                else if (e instanceof TreeNode)	//红黑树
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                else { //链表			// preserve order
                    Node<K,V> loHead = null, loTail = null;
                    Node<K,V> hiHead = null, hiTail = null;
                    Node<K,V> next;
                    do {
                        next = e.next;
                        if ((e.hash & oldCap) == 0) {
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        }
                        else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead;
                    }
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead;
                    }
                }
            }
        }
    }
    return newTab;
}
```

```java
//链表转红黑树准备工作：树化存储器
static final int MIN_TREEIFY_CAPACITY = 64;		//最小转化为树的数组容量

final void treeifyBin(Node<K,V>[] tab, int hash) {
    int n, index; Node<K,V> e;
  	//若传过来的数组为null,进行容量初始化， 或者数组容量 < 64,进行扩容
    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
        resize();
  	//转化为树
    else if ((e = tab[index = (n - 1) & hash]) != null) {
      	//hd是头，tl是树的节点，p是链表转为树的节点，e是数组上当前位置下的链表节点
        TreeNode<K,V> hd = null, tl = null;
        do {
            TreeNode<K,V> p = replacementTreeNode(e, null);	//把当前位置替换为树节点，赋值给p
            if (tl == null)
                hd = p;	//首次把树节点赋给hd
            else {			
                p.prev = tl;	//上次循环产生的tl的值已经是过去式了，赋给p.prev,代表过去
                tl.next = p;	//这次新造的树节点赋给树上的树节点
            }
            tl = p;			//为这个新造的节点成为过去式做准备
        } while ((e = e.next) != null);
        if ((tab[index] = hd) != null)	//树化
            hd.treeify(tab);
    }
}
```

```java
//树化
final void treeify(Node<K,V>[] tab) {
    TreeNode<K,V> root = null;
    for (TreeNode<K,V> x = this, next; x != null; x = next) {
        next = (TreeNode<K,V>)x.next;
        x.left = x.right = null;
        if (root == null) {
            x.parent = null;
            x.red = false;
            root = x;
        }
        else {
            K k = x.key;
            int h = x.hash;
            Class<?> kc = null;
            for (TreeNode<K,V> p = root;;) {
                int dir, ph;
                K pk = p.key;
                if ((ph = p.hash) > h)
                    dir = -1;
                else if (ph < h)
                    dir = 1;
                else if ((kc == null &&
                          (kc = comparableClassFor(k)) == null) ||
                         (dir = compareComparables(kc, k, pk)) == 0)
                    dir = tieBreakOrder(k, pk);

                TreeNode<K,V> xp = p;
                if ((p = (dir <= 0) ? p.left : p.right) == null) {
                    x.parent = xp;
                    if (dir <= 0)
                        xp.left = x;
                    else
                        xp.right = x;
                    root = balanceInsertion(root, x);
                    break;
                }
            }
        }
    }
    moveRootToFront(tab, root);
}
```

#### LinkedHashMap

底层源码，相较于HashMap，Node中**多了两个引用（before，after），记录先后顺序**

```java
//HashMap内部类
static class Node<K,V> implements Map.Entry<K,V> { 
  final int hash;
  final K key; 
  V value;
  Node<K,V> next; 
}

//LinkedHashMap内部类：多了两个属性
static class Entry<K,V> extends HashMap.Node<K,V> {
  Entry<K,V> before, after;//能够记录添加的元素的先后顺序
  Entry(int hash, K key, V value, Node<K,V> next) {
  	super(hash, key, value, next);
  }
}
```

#### TreeMap 

按照key排序，要求key是同一个类的对象，其他的和TreeSet基本相同

### Properties

是Map子接口中Hashtable实现类的子类，用来处理配置文件，key，value都是String型

Idea中新建文件（file）需要把后缀名格式改为.propreties或直接新建Resource Bundle

配置文件中符号前后不要加空格，避免歧义

```java
//下面以名为 jdbc.properties 的配置文件为例

public class PropertiesTest {
	//Properties:常用来处理配置文件。key和value都是String类型
	public static void main(String[] args) {
		FileInputStream fis = null;
		try {
			Properties pros = new Properties();
			fis = new FileInputStream("jdbc.properties");
			pros.load(fis);//加载流对应的文件
			//读取配置文件中的数据
			String name = pros.getProperty("name");
			String password = pros.getProperty("password");
			System.out.println("name = " + name + ", password = " + password);
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (fis != null) {
				try {
					fis.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
	}
}
```

### Collections（工具类）

Collections是操作Collection（Set、List）、Map等集合的工具类

```java
reverse(List) //反转
shuffle(List) //随机排序
sort(List) //自然排序
sort(List,Comparator) //定制排序
swap(List,int,int) //交换指定位置元素
max(Collection) //返回自然排序下最大值
max(Collection,Comparator) //返回定制排序下最大值
min//同
frequency(Collection,Object) //返回指定集合中指定元素出现的次数
copy(List dest,List src) //将src内容复制到dest中
replaceAll(List list,Object oldVal,Object newVal) //新值替换旧值
synchronizedXxxxx() //返回的集合就是线程安全的集合
```

**copy使用时注意dest的长度要和src长度相同**

```java
//错误1：
List dest = new ArrayList() //报异常：IndexOutOfBoundsException

//错误2：
List dest = new ArrayList(list.size()) //dest中没有内容，size为0，不等于list的长度

//正确：
List dest = Arrays.asList(new Object[list.size()]); //此时dest是由长度和list一样的，元素为null的数组，转换得到的
```

### 强大的Stream

- 集合讲的是数据，Stream讲的是计算

- Stream 自己不会存储元素

- Stream 不会改变源对象。相反，他们会返回一个持有结果的新Stream

- Stream 操作是延迟执行的。这意味着他们会等到需要结果的时候才执行

- 创建

  - 通过Collection的默认方法获取

    ```java
    default Stream<E> stream() 						//返回一个顺序流
    default Stream<E> parallelStream() 		//返回一个并行流
    ```

  - 通过数组获取

    ```java
    static <T> Stream<T> stream(T[] array)	 //返回一个流
    static IntStream stream(int[] array)
    static LongStream stream(long[] array)
    static DoubleStream stream(double[] array)
    ```

  - 通过Stream的of()

    ```java
    static<T> Stream<T> of(T... values) 		//返回一个流
    ```

  - 创建无限流

    ```java
    //迭代  seed开始，UnaryOperator一元运算符（seed + 1）
    static<T> Stream<T> iterate(final T seed, final UnaryOperator<T> f) 
    //生成
    static<T> Stream<T> generate(Supplier<T> s) 
    ```

- 操作

  - 筛选与切片

    ```java
    filter(Predicate p)  //接收Lambda ，从流中排除某些元素
    distinct()		//去重，通过流所生成元素的hashCode()和equals()去除重复元素
    limit(long maxSize)	//截断流，使其元素不超过给定数量
    skip(long n)		//跳过n个元素，与limit(n)互补
    ```

  - 映射

    ```java
    map(Function f)				//
    flatMap(Function f)		//内层打散映射
    ```

  - 排序

    ```java
    sorted()				//自然顺序排序
    sorted(Comparator com)		//定制排序
    ```

- 终止

  - 匹配与查找

    ```java
    allMatch(Predicate p)				//检查是否匹配所有
    noneMatch(Predicate  p)			//检查是否没有匹配所有
    anyMatch(Predicate p)				//检查是否有一个以上匹配
    findFirst()									//返回第一个元素
    findAny()										//返回随机元素
      
    count()											//返回元素总数
    max(Comparator c)						//返回最大值
    min(Comparator c)						//返回最小值
    forEach(Consumer c)					//内部迭代
    ```

  - 规约

    ```java
    reduce(T iden, BinaryOperator b)	//反复结合起来，得到一个值，返回 T
    reduce(BinaryOperator b)			//反复结合起来，得到一个值，返回Optional<T>
    ```

  - 收集

    ```java
    //将流转换为其他形式。接收一个 Collector接口的实现，用于给Stream中元素做汇总的方法
    collect(Collector c)
      
    //Collectors 实用类提供了很多静态方法，可以方便地创建常见收集器实例
    List<Employee> emps= list.stream().collect(Collectors.toList());
    Set<Employee> emps= list.stream().collect(Collectors.toSet());
    Collection<Employee> emps =list.stream().collect(Collectors.toCollection(ArrayList::new));
    //计数
    long count = list.stream().collect(Collectors.counting());
    //求和
    int total=list.stream().collect(Collectors.summingInt(Employee::getSalary));
    //平均
    double avg = list.stream().collect(Collectors.averagingInt(Employee::getSalary));
    //
    int SummaryStatisticsiss= list.stream().collect(Collectors.summarizingInt(Employee::getSalary));
    //连接
    String str= list.stream().map(Employee::getName).collect(Collectors.joining());
    //最大值
    Optional<Emp>max= list.stream().collect(Collectors.maxBy(comparingInt(Employee::getSalary)));
    //最小值
    Optional<Emp>min= list.stream().collect(Collectors.minBy(comparingInt(Employee::getSalary)));
    //从一个作为累加器的初始值开始，利用BinaryOperator与流中元素逐个结合，归约成单个值
    int total=list.stream().collect(Collectors.reducing(0, Employee::getSalar, Integer::sum));
    //包裹另一个收集器，对其结果转换函数
    int how= list.stream().collect(Collectors.collectingAndThen(Collectors.toList(), List::size));
    //根据某属性值对流分组，属性为K，结果为V
    Map<Emp.Status, List<Emp>> map= list.stream()
    .collect(Collectors.groupingBy(Employee::getStatus));
    //根据true或false进行分区
    Map<Boolean,List<Emp>> vd = list.stream().collect(Collectors.partitioningBy(Employee::getManage));
    ```

    

## 泛型（generics）

没有泛型之前存在的问题：**类型不安全；强转时报异常**

### 自定义泛型类、接口

- 定义：常用KTVE

```java
public class Order<T>{
  int age;
  T orderT;
  //构造器不加泛型
  public GenericClass(){} 
  public GenericClass(int age,T orderT){
    this.age = age;
    this.orderT = orderT;
  } 
} 
```

- 异常类不能是泛型的，catch异常类型也不能使用泛型

- 泛型不能是基本数据类型

- **子类继承带泛型的父类时，可以指明，可以保留，也可以擦除，还可以自己添加**

  - 子类可以不是泛型类
    - 指明public class SubOrder extends Order`<Integer>`{ }
    - 擦除public class SubOrder extends Order{ } 相当于父类泛型是Object

  - 子类可以全部保留继承的父类泛型，也可以保留部分，子类是泛型类
    - 保留public class SubOrder`<T,V>` extends Order`<T,V>`{ }
    - 部分保留public class SubOrder`<V>` extends Order`<String,V>`{ }

  - 子类可以添加自己的泛型
    - public class SubOrder`<A,B>` extends Order{ }
    - public class SubOrder`<A,B>` extends Order`<Integer>`{ }
    - public class SubOrder`<T,V,A,B>` extends Order`<T,V>`{ }

- 泛型类中，内部结构可使用泛型
  - 方法的返回值类型，形参类型，属性的类型，构造器形参类型

- **静态方法中，不能声明泛型**（泛型类型实例化时才能被确定）

- 实例化：没有指明泛型类型，默认Object类型，但又不完全是Object，

- 用泛型就指明，内部结构都要指明，不用就一路不要用

- 泛型数组不能new 

  ```java
  //错误
  T[] arr = new T[10]; 
  //应为
  T[] arr = (T[]) new Object[10];
  ```

- 泛型引用不同不能相互赋值，但泛型类型存在继承关系，有可能可以

### 自定义泛型方法

- **泛型方法与所属类是不是泛型类无关**

- **泛型方法可以是静态方法：调用时泛型已经确定**

```java
//权限修饰符 <泛型> 返回类型 方法名（泛型标识 参数名）抛异常

pubic <E> E get(int a,E e) throws Exception{}
pubic static <E> List<E> get(int a,E e) throws Exception{}
```

### 泛型的继承与通配符

- 若，A是B的父类

  - G`<A>`和G`<B>`无关，仅是并列关系，共同父类为G`<?>`,

  - A`<G>`是B`<G>`的父类

- 通配符，不能用在泛型方法 和 泛型类的声明上

  ```java
  //注意点1：编译错误：不能用在泛型方法声明上，返回值类型前面<>不能使用? 
  public static <?> void test(ArrayList<?> list){
  }
  
  //注意点2：编译错误：不能用在泛型类的声明上 
  class GenericTypeClass<?>{
  }
  ```

- 通配符，不能用在创建对象的右边

  ```java
  //错误
  ArrayList<?> list2 = new ArrayList<?>();
  //正确
  ArrayList<?> list2 = new ArrayList<>();
  ```

  - 比如：List`<?>`是List`<String>`、List`<Object>`等各种泛型List的父类。

- **通配符list`<?>`，添加不安全，故不能添加，只可读取，但允许赋值，可以添加null**

```java
List<String> list3 = new ArrayList<>();
list3.add("AA");
list3.add("BB");
list3.add("CC");

List<?> list = new ArrayList<>(); 
list = list3; //赋值
list.add("DD"); //添加时编译错误
Object o = list.get(0);//读取
```

**有限制条件的通配符：**

```java
<? extends A>	//（即小于等于）
<? super A>		//（即大于等于）

list<? extends A>		//不可添加，读取时用A类型接
list<? super A>		//可添加小于等于A的，读取时用Object类接
```

## IO流

### File类

创建文件、文件夹，作为参数传递到IO流构造器中

- 构造器

```java
//构造器1 (path)
//相对路径：测试方法中相对于当前module，在mian方法中相对于整个工程
File file1 = new File("hello.txt"); 
File file2 = new File("D:workspace_idea1JavaSeniorday08he.txt");
File file3 = new File("D:workspace_idea1"); //文件夹

//构造器2(parent,child):文件夹中创建文件夹
File file3 = new File("D:workspace_idea1","JavaSenior");

//构造器3(file parent,child)：文件夹中创建文件
File file4 = new File(file3,"hi.txt");
```

- 方法

```java
getAbsolutePath()		//获取绝对路径
getPath() 					//获取路径
getName() 					//获取名称
getParent()					//获取上层文件目录路径。若无，返回null
length() 						//获取文件长度（即：字节数）。不能获取目录的长度。
lastModified() 			//获取最后一次的修改时间，毫秒值
renameTo(File dest)	//把文件重命名为指定的文件路径（即剪切）

//如下的两个方法适用于文件目录：
list() 							//获取指定目录下的所有文件或者文件目录的名称数组
listFiles() 				//获取指定目录下的所有文件或者文件目录的File数组
  
isDirectory()				//判断是否是文件目录
isFile() 						//判断是否是文件
exists() 						//判断是否存在
canRead() 					//判断是否可读
canWrite() 					//判断是否可写
isHidden() 					//判断是否隐藏

createNewFile() 		//创建文件。若文件存在，则不创建，返回false
mkdir() 						//不存在则创建
mkdirs() 						//不存在则递归创建
delete()						//若无字文件（夹），则删除，不走回收站
  
//属性
File.separator			//路径分隔符
File file2 = new File("d:" + File.separator 
                        + "atguigu" + File.separator 
                        + "info.txt");
```

### 流

**流的分类：**

- 操作数据单位：字节流、字符流

- 数据的流向：输入流、输出流

- 流的角色：节点流、处理流

**流的体系结构**

|        |   抽象基类   |               节点流`<br>`主要方法               |   处理流 之 缓冲流 `<br>`主要方法   |
| :----: | :----------: | :--------------------------------------------: | :-------------------------------: |
| 字符流 |    Reader    |        FileReader`<br>` read(char[] cbuf)        |   BufferedReader`<br>`readLine()    |
| 字符流 |    Writer    |     FileWriter`<br>` write(char[] cbuf,0,len     |     BufferedWriter`<br>`flush()     |
| 字节流 | InputStream  |    FileInputStream`<br>` read(byte[] buffer)     |        BufferedInputStream        |
| 字节流 | OutputStream | FileOutputStream`<br>`write(byte[] buffer,0,len) | BufferedOutputStream `<br>` flush() |

![image-20220808175104194](http://minio.botuer.com/study-node/old/typora202208081751510.png)

### 节点流（文件流）

**字符流：FileReader与FileWriter**

- 用于处理字符文件，大多为文本文件

- read()方法，返回一个字符，**到达末尾返回-1**

- 读入文件不存在，报异常，

- 输出操作，对应的File可以不存在的，并不会报异常
  - File对应的硬盘中的文件如果不存在，在输出的过程中，会自动创建此文件
  - File对应的硬盘中的文件如果存在
    - 构造器是：FileWriter(file,false) / FileWriter(file):对原有文件的覆盖
    - 构造器是：FileWriter(file,true):不覆盖，而是在原有文件基础上追加内容

- 读入步骤

  ```java
  //1.实例化File类对象，指明文件
  File file = new File("hello.txt");
  //2.提供具体流
  fr = new FileReader(file);
  //3.数据读入
  char[] cbuf = new char[1024];
  int len;
  while((len = fr.read(cbuf)) != -1){
  	String str = new String(cbuf,0,len);
  	System.out.print(str);
  }
  //4.关闭流，放在finally中
  if(fr != null){
    try {
    	fr.close();
    } catch (IOException e) {
    	e.printStackTrace();} 
  }
  ```

- 写出步骤

  ```java
  //1.实例化File类对象，指明文件
  File file = new File("hello.txt");
  //2.提供具体流
  fw = new FileWriter(file,false);
  //3.数据写出，用try-catch包住
  fw.write("I have a dream!\n");
  fw.write("you need to have a dream!");
  //4.关闭流，放在finally中
  if(fr != null){
    try {
    	fw.close();
    } catch (IOException e) {
    	e.printStackTrace();}
  }
  ```

- 复制步骤

  ```java
  public void testCopy() {
    FileReader reader = null;
    FileWriter writer = null;
    try {
      File file1 = new File("hello.txt");
      File file2 = new File("helloWorld.txt");
      reader = new FileReader(file1);
      writer = new FileWriter(file2);
      char[] cbuf = new char[1024];
      int len;
      while ((len = reader.read(cbuf)) != -1){
      	writer.write(cbuf,0,len);
      }
    } catch (IOException e) {
    	e.printStackTrace();
    }finally {
      try {
        if (reader != null)
        reader.close();
      } catch (IOException e) {
      	e.printStackTrace();
      }
      try {
        if (writer != null)
        writer.close();
      } catch (IOException e) {
      	e.printStackTrace();
      }
    }
  }
  ```

**字节流：FileInputStream与FileOutputStream**

方法与字符流相同，用来处理字节文件（图片，视频），构造器可指明编码方式

### 处理流

#### 缓冲流

- **提供一个缓冲区，将硬盘数据读到内存进行缓存，提高读写速度**
- **readLine方法**:复制文本文件时可用String代替char数组
- **加密**

**提供一个缓冲区，提高读写速度**

```java
public void copy(){
  FileInputStream fis = null;
  FileOutputStream fos = null;
  BufferedInputStream bis = null;
  BufferedOutputStream bos = null;
  try {
    File file1 = new File("G:电影解说1千与千寻7合成芃芃1.mp4");
    File file2 = new File("复制品.mp4");

    fis = new FileInputStream(file1);
    fos = new FileOutputStream(file2);

    bis = new BufferedInputStream(fis);
    bos = new BufferedOutputStream(fos);

    byte[] buff = new byte[1024];
    int len;
    while ((len = bis.read(buff)) != -1) {
      bos.write(buff,0,len);
      bos.flush(); //刷新缓冲区，
    }
  } catch (IOException e) {
  	e.printStackTrace();
  } finally {
    try {
      if (bos !=null)
      bos.close(); //关闭缓冲流会自动关闭内层流
    } catch (IOException e) {
    	e.printStackTrace();
    }
    try {
      if (bis !=null)
      bis.close();
    } catch (IOException e) {
    	e.printStackTrace();}
  }
}
```

**readLine方法**

- 复制文本文件时可用String代替char数组

```java
String data;
while((data = br.readLine()) != null){ //readLine()读一行
  bw.write(data); //
  bw.newLine(); //换行
}
```

**加密与解密**

```java
//写入时可进行加密
while ((len = bis.read(buff)) != -1) {
  for(int I = 0;I < len;i++){
  	buff[i] = (byte)(buff[i] ^ 5); //位运算加密
	}
  bos.write(buff,0,len);
  bos.flush();
}

//解密，只需再进行一次上述操作（a ^ b ^ b = a）
```

#### 转换流

（InputStreamReader、OutputStreamWriter）

- 转换流属于字符流，
- InputStreamReader把字节流转换为字符流，OutputStreamWriter把字符流转换为字节流

- 字节流中的数据都是字符时，转换为字符流更高效

- 转换流可以处理乱码问题，实现编码和解码

```java
//读入
FileInputStream fis = new FileInputStream("dbcp.txt");
// InputStreamReader isr = new InputStreamReader(fis);//使用系统默认的字符集
//参数2指明了字符集，具体使用哪个字符集，取决于文件dbcp.txt保存时使用的字符集
InputStreamReader isr = new InputStreamReader(fis,"UTF-8");//使用系统默认的字符集
char[] cbuf = new char[20];
int len;
while((len = isr.read(cbuf)) != -1){
    String str = new String(cbuf,0,len); //读
    System.out.print(str);
}

//写出
File file2 = new File("dbcp_gbk.txt");
FileOutputStream fos = new FileOutputStream(file2);
OutputStreamWriter osw = new OutputStreamWriter(fos,"gbk");
char[] cbuf = new char[20];
int len;
while((len = isr.read(cbuf)) != -1){
	osw.write(cbuf,0,len); //写
}
isr.close();
osw.close();
```

#### 打印流

（PrintStream、PrintWriter）

- 基本数据类型转字符串输出 
- 换行时自动flush 
- 提供了重载的print()和println()

```java
FileOutputStream fos = new FileOutputStream(new File("D:IOtext.txt"));
PrintStream ps = new PrintStream(fos, true);
if (ps != null) {// 
		System.setOut(ps);//设置输出流的输出方式，把输出到控制台改成输出到文件
}
for (int i = 0; i <= 255; i++) { // 输出ASCII字符
    System.out.print((char) i);
    if (i % 50 == 0) { // 每50个数据一行
    		System.*out*.println(); // 换行
    }
}
ps.close;
```

#### 数据流

DataInputStream、DataOutputStream

- 只能处理基本类型和String类型，对象流可取代
- 读取时只能按写入顺序读取

#### 对象流

（ObjectInputStream、ObjectOutStream）

**用于存储、读取基本数据类型和对象的处理流**

**序列化作用**

- 将对象持久化到磁盘或者进行网络传输时需要转化为二进制流
- 序列化后才能进行持久化或者进行网络传输

**序列化过程**

- 可序列化

  - **除基本数据类型和String外的其他类型，必须可序列化才可使用对象流：**

  - **实现了Serializable接口，**

  - **提供全局常量serialVersionUID**
    - serialVersionUID是反序列化到钥匙，不指定会**自动生成**
    - 自动生成的算法**和属性有关**，一旦属性修改，serialVersionUID就会改变，之前序列化后的将无法再进行反序列化
    - 故**一定要显式指明**

  - **内部所有属性可序列化**

- 序列化：用ObjectOutputStream加密

  - 方法：writeObject()

- 反序列化：用ObjectInputStream解密
  - 方法：readObject()

- 不能序列化**static**和**transient**修饰的成员变量

**序列化**

```java
ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("object.dat"));
oos.writeObject(new String("我爱北京天安门"));
oos.flush();//刷新操作，写出一次就要flush一次
//Person类、Account类都要可序列化
oos.writeObject(new Person("张学良",23,1001,new Account(5000)));
oos.flush();
```

**反序列化**

```java
ObjectInputStream ois = new ObjectInputStream(new FileInputStream("object.dat"));
Object obj = ois.readObject();
String str = (String) obj;
Person p = (Person) ois.readObject();
System.out.println(str);
System.out.println(p);
```

#### 数组流

ByteArrayInputStream、ByteArrayOutputStream、CharArrayReader、CharArrayWriter

> 底层是个数组，可以直接存储
>
> ByteArrayOutputStream不需要创建目标文件，直接存在底层数组中
>
> 缓冲区会随着数据的不断写入而自动增长，此类中的方法在关闭此流后仍可被调用

### 标准流

（System.in、System.out）

**属性**

- in、out、err都是打印流类型，调用println都是打印流的方法
- 默认是在控制台输入输出，可以通过setIn(),setOut(),setErr()改变输入的源、输出的目的地

```java
public final static PrintStream in = null;
public final static PrintStream out = null;
public final static PrintStream err = null;
```

**System.in达到和Scanner相同的作用，键盘中读数据**

- System.in ----> 转换流 ----> 缓冲流（BufferedReader 的 readLine方法）
- readLine方法读字符串，返回值类型为String
- 其他类型，通过包装类转换

```java
//从键盘输入字符串，要求将读取到的整行字符串转成大写输出。然后继续进行输入操作，直至当输入“e”或者“exit”时，退出程序。

//将System.in通过转换流转换为字符流
InputStreamReader isr = new InputStreamReader(System.in);
//字符流
BufferedReader br = new BufferedReader(isr);
while (true) {
  System.out.println("请输入字符串：");
  String data = br.readLine();
  if ("e".equalsIgnoreCase(data) || "exit".equalsIgnoreCase(data)) {
    System.out.println("程序结束");
    break;
  }
  String upperCase = data.toUpperCase();
  System.out.println(upperCase);
}
br.close;
```

### RandomAccessFile

- **可以直接进入到文件内部，重要方法：seek(long pos):控制指针位置**
- 直接继承于java.lang.Object类，实现了DataInput和DataOutput接口

- RandomAccessFile既可以作为一个输入流，又可以作为一个输出流

- 如果RandomAccessFile作为输出流时，写出到的文件如果不存在，则在执行过程中自动创建

- 如果写出到的文件存在，则会对原有文件内容进行覆盖。（默认情况下，从头覆盖）
- 应用于**多线程断点下载**
  - 下载前都会建立两个临时文件
  - 一个是与被下载文件大小相同的空文件
  - 另一个是记录文件指针的位置文件
  - 每次暂停的时候，都会保存上一次的指针
  - 然后断点下载的时候，会继续从上一次的地方下载，从而实现断点下载或上传的功能，

```java
//构造器
RandomAccessFile(File file, String mode) 	//mode,模式，r只读，rw可写
RandomAccessFile(String name, String mode)
```

```java
//复制:从头覆盖
RandomAccessFile raf1 = new RandomAccessFile(new File("爱情与友情.jpg"),"r");
RandomAccessFile raf2 = new RandomAccessFile(new File("爱情与友情1.jpg"),"rw");

byte[] buffer = new byte[1024];
int len;
while((len = raf1.read(buffer)) != -1){
		raf2.write(buffer,0,len);
}

//指定位置开始覆盖
RandomAccessFile raf1 = new RandomAccessFile("hello.txt","rw");
raf1.seek(3);//将指针调到角标为3的位置
raf1.write("xyz".getBytes());
raf1.close();

//插入效果
RandomAccessFile raf1 = new RandomAccessFile("hello.txt","rw");
raf1.seek(3);//将指针调到角标为3的位置
//保存指针3后面的所有数据到StringBuilder中
StringBuilder builder = new StringBuilder((int) new File("hello.txt").length());
byte[] buffer = new byte[20];
int len;
while((len = raf1.read(buffer)) != -1){
		builder.append(new String(buffer,0,len)) ;
}
//调回指针，写入"xyz"
raf1.seek(3);
raf1.write("xyz".getBytes());
//将StringBuilder中的数据写入到文件中
raf1.write(builder.toString().getBytes());
raf1.close();
```

### NIO

- Java NIO (New IO，Non-Blocking IO)是从Java 1.4版本开始引入的一套新的IO API，可以替代标准的Java IO API
- NIO与原来的IO有同样的作用和目的，但是使用的方式完全不同
- NIO支持面向缓冲区的(IO是面向流的)、基于通道的IO操作
- NIO将以更加高效的方式进行文件的读写操作
- Java API中提供了两套NIO
  - 一套是针对标准输入输出NIO
  - 另一套就是网络编程NIO
- 通道--java.nio.channels.Channel  (**通道就相当于流，Channel等价于Stream**)
  - |-----FileChannel:处理本地文件
  - |-----SocketChannel：TCP网络编程的客户端的Channel
  - |-----ServerSocketChannel:TCP网络编程的服务器端的Channel
  - |-----DatagramChannel：UDP网络编程中发送端和接收端的Channel
- **NIO.2**：随着 JDK 7 的发布，Java对NIO进行了极大的扩展，增强了对文件处理和文件系统特性的支持，以至于我们称他们为 NIO.2。因为 NIO 提供的一些功能，NIO已经成为文件处理中越来越重要的部分

#### Path与Paths

- Path接口

  - File类的升级

  - 在java.nio.file包下

- Paths工具类

```java
//Paths方法：用于Path的实例化
Path path1 = Paths.get("d:\\niohello.txt");
Path path2 = Paths.get("d:", "niohello.txt");//拼接
Path path3 = Paths.get(uri)		//返回指定uri对应的Path路径
//对比
  File file = new File("index.html");
	Path path = Paths.get("index.html");

//Path常用方法
toString() 	//返回调用 Path 对象的字符串表示形式
startsWith(String path) 	//判断是否以 path 路径开始
endsWith(String path) 		//判断是否以 path 路径结束
isAbsolute() 							//判断是否是绝对路径
getParent()								//返回Path对象包含整个路径，不包含 Path 对象指定的文件路径
getRoot()									//返回调用 Path 对象的根路径
getFileName()							//返回与调用 Path 对象关联的文件名
getNameCount() 						//返回Path 根目录后面元素的数量
getName(int idx) 					//返回指定索引位置 idx 的路径名称
toAbsolutePath() 					//作为绝对路径返回调用 Path 对象
resolve(Path p) 					//合并两个路径，返回合并后的路径对应的Path对象
toFile()									//将Path转化为File类的对象
  
  toPath()								//File转化为Path类对象
```

#### Files工具类

```java
Path copy(Path src, Path dest, CopyOption ... how) //文件的复制
Path createDirectory(Path path, FileAttribute<?> ... attr) //创建一个目录
Path createFile(Path path, FileAttribute<?> ... arr) //创建一个文件
void delete(Path path) //删除一个文件/目录，如果不存在，执行报错
void deleteIfExists(Path path) //Path对应的文件/目录如果存在，执行删除
Path move(Path src, Path dest, CopyOption...how) 	//将 src 移动到 dest 位置
long size(Path path) 	//返回 path 指定文件的大小
exists(Path path, LinkOption ... opts) 				//判断文件是否存在
isDirectory(Path path, LinkOption ... opts) 	//判断是否是目录 不要求文件存在
isRegularFile(Path path, LinkOption ... opts) //判断是否是文件
isHidden(Path path) 													//判断是否是隐藏文件 文件需要存在
isReadable(Path path) 												//判断文件是否可读
isWritable(Path path) 												//判断文件是否可写
notExists(Path path, LinkOption ... opts) 		//判断文件是否不存在
```

```java
//Files常用方法：用于操作内容
SeekableByteChannel newByteChannel(Path path, OpenOption...how)	//获取与指定文件的连接
DirectoryStream<Path> newDirectoryStream(Path path) //打开 path 指定的目录
InputStream newInputStream(Path path, OpenOption...how)	//获取 InputStream 对象
OutputStream newOutputStream(Path path, OpenOption...how)	//获取 OutputStream 对象

//how打开方式：
StandardOpenOption.READ		//表示对应的Channel是可读的。
StandardOpenOption.WRITE	//表示对应的Channel是可写的。
StandardOpenOption.CREATE	//如果要写出的文件不存在，则创建。如果存在，忽略
StandardOpenOption.CREATE_NEW	//如果要写出的文件不存在，则创建。如果存在，抛异常
```

## 网络编程

- 两个问题

  - 定位：定位主机（IP/域名），定位应用（port端口号）

  - 传输：可靠高效的传输

    ![image-20220809180236552](http://minio.botuer.com/study-node/old/typora202208091802886.png)

- 本地回路地址：127.0.0.1 即localhost

- TCP/IP协议簇
  - 两个非常重要的协议
    - 传输控制协议TCP(Transmission Control Protocol)
    - 用户数据报协议UDP(User Datagram Protocol)
  - TCP/IP 以其两个主要协议：传输控制协议(TCP)和网络互联协议(IP)而得名，实际上是一组协议，包括多个具有不同功能且互为关联的协议
  - IP(Internet Protocol)协议是网络层的主要协议，支持网间互连的数据通信
  - TCP/IP协议模型从更实用的角度出发，形成了高效的四层体系结构
    - 物理链路层
    - IP层
    - 传输层
    - 应用层

### 相关类

#### InetAddress

- 表示IP

```java
//InetAddress实例化
InetAddress.getByName(host)
InetAddress.getLocalHost()

//方法
getHostName()
getHostAddress()
```

#### Socket

- IP和端口号组合而成的套接字

```java
//构造器
Socket(String IP,int port);
Socket(InetAddress inet,int port);
  
//方法
getInputStream()	//返回此套接字的输入流。可以用于接收网络消息
getOutputStream()	//返回此套接字的输出流。可以用于发送网络消息
  
getInetAddress()	//此套接字连接到的远程IP地址；如果套接字是未连接的，则返回null
getLocalAddress()	//获取套接字绑定的本地地址。 即本端的IP地址
  
getPort()					//此套接字连接到的远程端口号；如果尚未连接套接字，则返回 0
getLocalPort()		//返回本端的端口号。 如果尚未绑定套接字，则返回 -1
  
shutdownInput()		//不能接收任何数据，多用于TCP解除阻塞
shutdownOutput()	//不能发送任何数据，多用于TCP解除阻塞
```

#### ServerSocket

- 服务器的套接字：用于获取客户端发送的套接字

```java
ServerSocket ss = new ServerSocket(8899); //服务器端口号
Socket socket = ss.accept(); //接收套接字
```

#### DatagramSocket

- UDP协议下的**数据报套接字**

```java
//构造器
DatagramSocket()						//用于发送端，指定端口、ip可在数据报包中指明
DatagramSocket(int port)		//用于接收端，指定端口
DatagramSocket(int port,InetAddress laddr)
  
close()//关闭此数据报套接字。
send(DatagramPacket p)			//从此套接字发送数据报包
receive(DatagramPacket p)		//从此套接字接收数据报包。当此方法返回时，DatagramPacket的缓冲区填充了接收的数据。数据报包也包含发送方的 IP 地址和发送方机器上的端口号。此方法在接收到数据报前一直阻塞。数据报包对象的 length 字段包含所接收信息的长度。如果信息比包的长度长，该信息将被截短。

getLocalAddress()						//返回此套接字绑定的地址。
getLocalPort()							//返回此套接字绑定的的端口号。
getInetAddress()						//返回此套接字连接的地址。如果套接字未连接，则返回 null。
getPort()										//返回此套接字的端口。如果套接字未连接，则返回 -1。
```

#### DatagramPacket

- 数据报包

```java
//构造器
DatagramPacket(byte[] buf,int length,InetAddress address,int port) 	//用于发送
DatagramPacket(byte[] buf,int length)		//用于接收

//方法
getData()//接收到的数据，返回byte[] 数据缓冲区
getLength()//返回数据报内容的长度
getPort()//返回数据报绑定的端口号
InetAddress getAddress() //返回数据报绑定的 IP 地址
```

#### URL

- URL:统一资源定位符，对应着互联网的某一资源地址

- 格式  

  ```java
  "http://localhost:8080/examples/beauty.jpg?username=Tom"
  	协议 			主机名 端口号 	文件名 #片段名	？	参数列表
  ```

```java
//构造器
URL url = new URL ("http://www. atguigu.com/")
URL url = new URL(url, "download.html")//通过基URL和相对URL构造一个URL对象
URL url = new URL("http","www.atguigu.com", "download. html")
URL url = new URL("http", "www.atguigu.com", 80, "download.html");

方法：
public String getProtocol( ) 	//获取该URL的协议名
public String getHost( ) 			//获取该URL的主机名
public String getPort( )			//获取该URL的端口
public String getPath( )			// 获取该URL的文件路径
public String getFile( )			//获取该URL的文件名
public String getQuery( ) 		//获取该URL的查询名
  
public InputStream openStream()
public URLConnection openConnection()
```

#### URLConnection

- 抽象类
- 若希望输出数据，例如向服务器端的CGI程序发送一些数据，则必须先与URL建立连接，然后才能对其进行读写，此时需要使用URLConnection
  - CGI公共网关接口-Common Gateway Interface-的简称，是用户浏览器和服务器端的应用程序进行连接的接口
- HttpURLConnectonn实现类

```java
//实例化
URLConnectonn u = url.openConnection(); 		//通过URL对象实例化

//方法
public Object getContent( ) throws IOException
public int getContentLength( )
public String getContentType( )
public long getDate( )
public long getLastModified( )
public InputStream getInputStream( )throws IOException
public OutputSteram getOutputStream( )throws IOException
```

### TCP网络编程

- 使用TCP协议前，须先建立TCP连接，形成传输数据通道

- 传输前，采用“三次握手”方式，点对点通信，是可靠的

  ![image-20220809181300628](http://minio.botuer.com/study-node/old/typora202208091813892.png)

- TCP协议进行通信的两个应用进程：客户端、服务端

- 在连接中可进行大数据量的传输

- 传输完毕，需释放已建立的连接，效率低

- 四次挥手

  ![image-20220809181417244](http://minio.botuer.com/study-node/old/typora202208091814667.png)

**客户端**

1.  创建Socket对象，指明服务器的ip和端口号

2.  获取输出流，用于输出数据

3.  写出

4.  关流

**服务器**

1.  创建服务器的ServerSocket，指明自己的端口号

2.  调用accept方法，表示接收客户端的socket

3.  获取输入流

4.  读入

5.  关流

```java
//客户端
Socket socket = new Socket("127.0.0.1", 8899); //服务器的ip和端口号
OutputStream os = socket.getOutputStream(); //套接字获取字节输出流
os.write("你好".getBytes()); //String转字节
os.close();
socket.close();

//服务器
ServerSocket ss = new ServerSocket(8899); //服务器端口号
Socket socket = ss.accept(); //接收套接字

InputStream is = socket.getInputStream(); //套接字获取输入流
ByteArrayOutputStream baos = new ByteArrayOutputStream();
byte[] buff = new byte[5];
int len;
while ((len = is.read(buff)) != -1){
	baos.write(buff,0,len);
}
System.out.println(baos.toString());
System.out.println("收到了来自："
                   +socket.getInetAddress().getHostAddress() 
                   + "的信息");
baos.close();
is.close();
socket.close();
ss.close();
```

**文件传输**

```java
//客户端
public void client() throws IOException {
  Socket socket = new Socket(InetAddress.getByName("127.0.0.1"),9090);
  OutputStream os = socket.getOutputStream();
  FileInputStream fis = new FileInputStream(new File("beauty.jpg"));
  byte[] buffer = new byte[1024];
  int len;
  while((len = fis.read(buffer)) != -1){
      os.write(buffer,0,len);
  }
  fis.close();
  os.close();
  socket.close();
}

//服务器
public void server() throws IOException {
  ServerSocket ss = new ServerSocket(9090);
  Socket socket = ss.accept();
  
  InputStream is = socket.getInputStream();
  FileOutputStream fos = new FileOutputStream(new File("beauty1.jpg"));
  byte[] buffer = new byte[1024];
  int len;
  while((len = is.read(buffer)) != -1){
      fos.write(buffer,0,len);
  }
  fos.close();
  is.close();
  socket.close();
  ss.close();
}
```

**发送文件给服务端，服务端保存到本地。并返回"发送成功"给客户端**

`<div style="color:red;">` 
  `<p>`客户端等待服务器回复，服务器不知道客户端有没有传输完成，造成阻塞
  `<P>`当socket调用shutdownInput()、shutdownOutput()时，解除阻塞

```java
public void client() throws IOException {
    Socket socket = new Socket(InetAddress.getByName("127.0.0.1"),9090);
    OutputStream os = socket.getOutputStream();
    FileInputStream fis = new FileInputStream(new File("beauty.jpg"));
    byte[] buffer = new byte[1024];
    int len;
    while((len = fis.read(buffer)) != -1){
    		os.write(buffer,0,len);
    }
    //关闭数据的输出
    socket.shutdownOutput();

    //5.接收来自于服务器端的数据，并显示到控制台上
    InputStream is = socket.getInputStream();
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    byte[] bufferr = new byte[20];
    int len1;
    while((len1 = is.read(buffer)) != -1){
    		baos.write(buffer,0,len1);
    }
    System.out.println(baos.toString());
  
    fis.close();
    os.close();
    socket.close();
    baos.close();
}

public void server() throws IOException {
    ServerSocket ss = new ServerSocket(9090);
    Socket socket = ss.accept();
    InputStream is = socket.getInputStream();
    FileOutputStream fos = new FileOutputStream(new File("beauty2.jpg"));
    byte[] buffer = new byte[1024];
    int len;
    while((len = is.read(buffer)) != -1){
        fos.write(buffer,0,len);
    }
  	socket.shutdownInput();	//不再接收，解除阻塞
    System.out.println("图片传输完成");
  
    //6.服务器端给予客户端反馈
    OutputStream os = socket.getOutputStream();
    os.write("你好，美女，照片我已收到，非常漂亮！".getBytes());
  
    fos.close();
  	is.close();
  	socket.close();
  	ss.close();
  	os.close();
}
```

### UDP网络编程

- 将数据、源、目的封装成数据包，不需要建立连接
- 每个数据报的大小限制在64K内
- 发送不管对方是否准备好，接收方收到也不确认，故是不可靠的
- 可以广播发送
- 发送数据结束时无需释放资源，开销小，速度快

**流程**

1.  建立发送端，接收端
2.  建立数据包
3.  调用DatagramSocket的发送、接收方法
4.  关闭DatagramSocket

```java
public void sender() throws IOException {
    DatagramSocket socket = new DatagramSocket();
  
    String str = "我是UDP方式发送的导弹";
    byte[] data = str.getBytes();
    InetAddress inet = InetAddress.getLocalHost();
  
    DatagramPacket packet = new DatagramPacket(data,0,data.length,inet,9090);
    socket.send(packet);
    socket.close();
}
//接收端
public void receiver() throws IOException {
    DatagramSocket socket = new DatagramSocket(9090);

    byte[] buffer = new byte[100];
  
    DatagramPacket packet = new DatagramPacket(buffer,0,buffer.length);
    socket.receive(packet);
  	//此处的packet.gatData()得到的就是存入字节数组的数据
    System.out.println(new String(packet.getData(),0,packet.getLength()));
  //System.out.println(new String(buffer,0,packet.getLength()));
    socket.close();
}
```

### URL网络编程

**URI、URL和URN的区别**

![Image From 尚硅谷_宋红康_第14章_网络编程](http://minio.botuer.com/study-node/old/typora202208092314887.png)

- URI，是uniform resource identifier，统一资源标识符，用来唯一的标识一个资源

- URL是uniform resource locator，统一资源定位符，它是一种具体的URI，即URL可以用来标识一个资源，而且还指明了如何定位这个资源

- URN，uniform resource name，统一资源命名，是通过名字来标识资源，比如mailto:java-net@java.sun.com
- 也就是说，**URI是以一种抽象的，高层次概念定义统一资源标识，而URL和URN则是具体的资源标识的方式。URL和URN都是一种URI**

- 在Java的URI中，一个URI实例可以代表绝对的，也可以是相对的，只要它符合URI的语法规则。而URL类则不仅符合语义，还包含了定位该资源的信息，因此它不能是相对的

  

```java
URL url = new URL("http://localhost:8080/examples/beauty.jpg");
HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
urlConnection.connect();
InputStream is = urlConnection.getInputStream();
FileOutputStream fos = new FileOutputStream("day10beauty3.jpg");
byte[] buffer = new byte[1024];
int len;
while((len = is.read(buffer)) != -1){
		fos.write(buffer,0,len);
}
System.out.println("下载完成");

//关闭资源
is.close();
fos.close();
urlConnection.disconnect();
```

## 反射

### Class类的理解

- 类的加载过程：
  - 程序经过javac.exe命令以后，会生成一个或多个字节码文件(.class结尾)
  - 接着我们使用java.exe命令对某个字节码文件进行解释运行。相当于将某个字节码文件加载到内存中。此过程就称为类的加载。加载到内存中的类，我们就称为运行时类，此运行时类，就作为Class的一个实例
  - 换句话说，Class的实例就对应着一个运行时类
  - 加载到内存中的运行时类，会缓存一定的时间。在此时间之内，我们可以通过不同的方式来获取此运行时类

### Class类的实例

```java
Class<Person> clazz = Person.class;		//通过类
Class<Person> clazz = person.getClass(); //通过对象
Class<Person> clazz3 = Class.forName("com.java.Person"); //调用Class的静态方法
Class<Person> clazz3 = this.getClass().getClassLoader().loadClass("com.java.Person"); //类加载器加载

Class c1 = Object.class; 			//外部类 
Class c2 = Comparable.class; 	//接口
Class c3 = String[].class; 		//数组 
Class c4 = int[][].class; 		//二维数组
Class c5 = ElementType.class; //枚举类 
Class c6 = Override.class; 		//注解
Class c7 = int.class; 				//基本数据类型
Class c8 = void.class; 				//返回值类型 
Class c9 = Class.class; 			//Class类

int[] a = new int[10];
int[] b = new int[100];
Class c10 = a.getClass(); Class c11 = b.getClass();
System.out.println(c10 == c11);	//true 只要元素类型与维度一样，就是同一个Class
```

### 反射获取内部结构

#### Class

```java
Class clazz = Class.forName(String name) 	//返回一个Class对象，内存中仅一个

newInstance() 							//返回一个具体的Class对象
  
getName() 									//返回类名（类、接口、数组类、基本类型或void等等）

getSuperclass() 						//返回表示此Class所表示的实体的父类的Class
getInterfaces() 						//获取当前Class实现的接口
getClassLoader() 						//返回该类的类加载器
getGenericSuperclass()			//返回带泛型的父类
getGenericInterfaces()			//返回带泛型的实现接口
getActualTypeArguments()		//返回实际类型参数数组
getPackage()								//返回所在的包
getDeclaredAnnotations()   	//返回声明的注解
getConstructors() 					//返回一个包含某些Constructor对象的数组
getDeclaredFields() 				//返回本类声明的成员变量
getFields()									//返回本类public的成员变量（包括父类）
getDeclaredMethods()				//返回本类声明的方法
getMethods()								//返回本类public的方法（包括父类）

getMethod(String name,Class ... paramTypes)//返回一个Method对象
```

#### Field

```java
getAnnotations()	//注解
getModifiers()		//权限修饰符
getType()					//数据类型
getName()					//变量名
```

#### Constructor

```java
getModifiers()		//权限修饰符
getName()					//方法名
getParameterTypes().getName()	//形参列表
```

#### Method

```java
getAnnotations()	//注解
getModifiers()		//权限修饰符
getReturnType().getName()			//返回值类型
getName()					//方法名
getParameterTypes().getName()	//形参列表
getExceptionTypes().getName()	//异常类型
```

### 反射调用指定结构

```java
class Person {
	public String name;
	private int age;		//私有属性

	public Person(){}
	private Person(String name){	//私有构造器
		this.name = name;
	}
	public Person(String name,int age) {
		this.name = name;
		this.age = age;
	}

	public void show(){
		System.out.println("my name is " + this.getName() 
                       + " , I'm " + this.age + ".");
	}
	private void show(String name,int age){	//私有方法
		System.out.println("my wife is " + name 
                       + " , he is " + age +" years old.");
	}
	public String show(String food){		//有返回值方法
		return "my favorite food is " + food + ".";
	}
  public static void showId(){				//静态方法
		System.out.println(id++);
	}
	//getter/setter/toString方法
}
```

![image-20220810172401106](http://minio.botuer.com/study-node/old/typora202208101724471.png)

#### **类对象（常用）**

```java
Class<Person> clazz = Person.class;		//通过类
Class<Person> clazz = Class.forName("com.java.Person"); //调用Class的静态方法
```

#### 创建对象

```java
Class<Person> clazz = Person.class;
Person person = clazz.newInstance();  //clazz直接创建

Constructor<Person> constructor1 = clazz.getConstructor(String.class,int.class);
Person tom = constructor1.newInstance("Tom", 18);  //拿到构造器创建

Constructor<Person> constructor2 = clazz.getDeclaredConstructor(String.class);
constructor2.setAccessible(true);
Person jerry = constructor2.newInstance("Jerry");  //拿到私有构造器创建
```

#### 设置属性

```java
Field name = clazz.getDeclaredField("name");
name.set(person,"李某某");

Field age = clazz.getDeclaredField("age"); //设置私有属性
age.setAccessible(true);
age.set(person,20);
```

#### 调用方法

```java
Method show = clazz.getDeclaredMethod("show");
show.invoke(tom);

Method show1 = clazz.getDeclaredMethod("show", String.class, int.class);
show1.setAccessible(true);
show1.invoke(jerry,"李梅",18);	//调用私有方法

Method show2 = clazz.getDeclaredMethod("show", String.class);
Object pizza = show2.invoke(person, "pizza");		//调用含有返回值的方法
System.out.println(pizza);

Method showId = clazz.getDeclaredMethod("showId");	//调用静态方法
for (int i = 0; i < 10; i++) {
	showId.invoke(tom);						//即可通过对象调用
	showId.invoke(Person.class);	//也可通过类来调用
}
```

### 通过反射创建运行时对象

newInstance():调用此方法，创建对应的运行时类的对象。内部调用了运行时类的空参的构造器。

要想此方法正常的创建运行时类的对象，要求：

1.运行时类必须提供空参的构造器

2.空参的构造器的访问权限得够。通常，设置为public。

```java
/*
创建一个指定类的对象。
classPath:指定类的全类名
*/
public Object getInstance(String classPath) throws Exception {
    Class clazz = Class.forName(classPath); //以传入的全类名创建对象
    return clazz.newInstance();
}

//体会反射的动态性
@Test
public void test2(){
    for(int i = 0;i < 100;i++){
        int num = new Random().nextInt(3);//随机数 0,1,2
        String classPath = ""; //初始化classPath
        switch(num){ //classPath赋值
          case 0:
          	classPath = "java.util.Date";
          	break;
          case 1:
          	classPath = "java.lang.Object";
          	break;
          case 2:
          	classPath = "com.atguigu.java.Person";
          	break;
        }

        try {
            Object obj = getInstance(classPath); //调用getInstance方法，创建对象
            System.out.println(obj); //输出对象
        } catch (Exception e) {
        		e.printStackTrace();
        }
    }
}
```
