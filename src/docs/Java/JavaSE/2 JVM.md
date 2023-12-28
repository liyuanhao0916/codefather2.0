# JVM

## 概述

### JVM的位置

![image-20220731175208522](http://minio.botuer.com/study-node/old/typora202208021707763.png)

### java体系结构

![image-20220731175221692](http://minio.botuer.com/study-node/old/typora202208021707854.png)

### JVM整体结构

- 简图

![image-20220731175324098](http://minio.botuer.com/study-node/old/typora202208021707975.png)

- 完整图

![image-20220802171116070](http://minio.botuer.com/study-node/old/typora202208021711129.png)

### Java代码执行流程

![image-20220731175734777](http://minio.botuer.com/study-node/old/typora202208021707081.png)

### JVM编译器

Java编译器输入的指令集架构有两种：基于栈式，基于寄存器

- 基于栈式指令集架构的特点**（HotSpotVM采用栈式）**

  - 设计和实现更简单，适用于资源受限的系统；

  - 避开了寄存器的分配难题：使用零地址指令方式分配。

  - 指令流中的指令大部分是零地址指令，其执行过程依赖于操作栈。**指令集更小**，编译器容易实现。
  - 指令多（与指令集成反比）

  - 不需要硬件支持，可移植性更好，更好实现**跨平台**
  - 执行性能比寄存器差


- 基于寄存器指令集架构的特点

  - 典型的应用是x86的二进制指令集：比如传统的PC以及Android的Davlik虚拟机。

  - 指令集架构则完全依赖硬件，可移植性差

  - 性能优秀和执行更高效

  - 花费更少的指令去完成一项操作。

  - 在大部分情况下，基于寄存器架构的指令集往往都以一地址指令、二地址指令和三地址指令为主，而基于栈式架构的指令集却是以零地址指令为主方水洋

```sh
#基于栈 执行2+3
iconst_2 //常量2入栈
istore_1
iconst_3 // 常量3入栈
istore_2
iload_1
iload_2
iadd //常量2/3出栈，执行相加
istore_0 // 结果5入栈
#基于寄存器 执行2+3
mov eax,2 //将eax寄存器的值设为1
add eax,3 //使eax寄存器的值加3
```

### 字节码反编译

```java
public class StackStruTest {
    public static void main(String[] args) {
        int i = 2 + 3;
    }
}
```

```sh
javap -v StackStruTest.class
==========================
  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=4, args_size=1
         0: iconst_2
         1: istore_1
         2: iconst_3
         3: istore_2
         4: iload_1
         5: iload_2
         6: iadd
         7: istore_3
         8: return
      LineNumberTable:
        line 9: 0
        line 10: 2
        line 11: 4
        line 12: 8
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       9     0  args   [Ljava/lang/String;
            2       7     1     i   I
            4       5     2     j   I
            8       1     3     k   I
```

### JVM生命周期

- 启动

  > 启动是通过引导类加载器（bootstrap class loader）创建一个初始类（initial class）来完成的，这个类是由虚拟机的具体实现指定的

- 执行

  > - 一个运行中的Java虚拟机有着一个清晰的任务：执行Java程序。
  > - 程序开始执行时他才运行，程序结束时他就停止。
  > - 执行一个所谓的Java程序的时候，真真正正在执行的是一个叫做Java虚拟机的进程。

- 退出

  > - 程序正常执行结束
  >
  > - 程序在执行过程中遇到了异常或错误而异常终止
  > - 由于操作系统用现错误而导致Java虚拟机进程终止
  > - 某线程调用Runtime类或system类的exit方法，或Runtime类的halt方法，并且Java安全管理器也允许这次exit或halt操作。
  > - 除此之外，JNI（Java Native Interface）规范描述了用JNI Invocation API来加载或卸载 Java虚拟机时，Java虚拟机的退出情况

## 1类加载子系统

- JVM整体结构

![image-20220731182001296](http://minio.botuer.com/study-node/old/typora202208021707256.png)

### 作用

- 从文件系统或者网络中加载Class文件

  - class文件在文件开头有特定的文件标识

- ClassLoader只负责class文件的加载，至于它是否可以运行，则由Execution Engine决定

- 加载的类信息存放于一块称为方法区的内存空间。除了类的信息外，方法区中还会存放运行时常量池信息，可能还包括字符串字面量和数字常量（这部分常量信息是Class文件中常量池部分的内存映射）

- class file在硬盘中，通过类加载器加载到JVM中，被称为DNA元数据模板，放在方法区

- 在.class文件->JVM->最终成为元数据模板，此过程就要一个运输工具（类装载器Class Loader），扮演一个快递员的角色。

  ![image-20220731183027627](http://minio.botuer.com/study-node/old/typora202208021707276.png)

### 类加载过程

![image-20220731182116072](http://minio.botuer.com/study-node/old/typora202208021707363.png)

#### 加载

> 通过一个类的全类名，获取定义此类的二进制字节流
>
> 将这个字节流所代表的静态存储结构转化为方法区的运行时数据结构
>
> 在内存中**生成一个代表这个类的java.lang.Class对象**，作为方法区这个类的各种数据的访问入口

- 类加载器
  - Bootstrap Class Loader：虚拟机自带的加载器
  - 自定义加载器：继承了ClassLoader的加载器
    - Extension ClassLoader
    - AppClassLoader
    - 用户自定义类加载器

![image-20220802203124563](http://minio.botuer.com/study-node/old/typora202208022031766.png)

![image-20220802203817034](http://minio.botuer.com/study-node/old/typora202208022038110.png)

```java
//获取系统类加载器
ClassLoader systemClassLoder = ClassLoader.getSystemClassLoader();
//获取上层，扩展类加载器
ClassLoader extClassLoader = systemClassLoader.getParent();
//获取上层，引导类加载器，获取不到,null
ClassLoader bootStrapClassLoader = extClassLoader.getParent();

//自定义类的类加载器默认为，系统类加载器，与直接获取系统类加载器是一样的
ClassLoader classLoader = XXXX.class.getClassLoader();
```



##### Bootstrap ClassLoader

- 引导类加载器，也叫启动类加载器

- 这个类加载使用C/C++语言实现的，嵌套在JVM内部。
- 它用来加载Java的核心库（**rt.jar、resources.jar**或sun.boot.class.path路径下的内容），用于提供JVM自身需要的类
- 并不继承自Java.lang.ClassLoader，没有父加载器。
- 加载扩展类和应用程序类加载器，并指定为他们的父类加载器。
- 出于安全考虑，Bootstrap启动类加载器只加载包名为java、javax、sun等开头的类

##### Extension ClassLoader

- 扩展类加载器
- Java语言编写，由sun.misc.Launcher$ExtClassLoader实现。
- 派生于ClassLoader类
- 父类加载器为启动类加载器
- 从**java.ext.dirs**系统属性所指定的目录中加载类库，或从JDK的安装目录的jre/lib/ext子目录（扩展目录）下加载类库。如果用户创建的JAR放在此目录下，也会自动由扩展类加载器加载

##### AppClassLoader

- 应用程序类加载器，也叫系统类加载器
- javI语言编写，由sun.misc.Launcher$AppClassLoader实现
- 派生于ClassLoader类
- 父类加载器为扩展类加载器
- 它负责加载环境变量classpath或系统属性java.class.path指定路径下的类库
- 该类加载是程序中默认的类加载器，一般来说，Java应用的类都是由它来完成加载
- 通过classLoader#getSystemclassLoader（）方法可以获取到该类加载器

##### 自定义类加载器

在Java的日常应用程序开发中，类的加载几乎是由上述3种类加载器相互配合执行的，在必要时，我们还可以自定义类加载器，来定制类的加载方式。

为什么要自定义类加载器？

- 隔离加载类：路径相同，类名一样，就需要隔离，避免冲突
- 修改类加载的方式
- 扩展加载源
- 防止源码泄漏

用户自定义类加载器实现步骤：

- 继承抽象类ava.lang.ClassLoader类的方式
- 在JDK1.2之前，重写loadClass（）方法
- 在JDK1.2之后，重写findclass（）方法
- 没有太过于复杂的需求，可以直接继承URIClassLoader，不需重写

#### 链接

##### 验证Verify

> 确保Class文件的字节流中包含信息符合当前虚拟机要求，保证被加载类的正确性，不会危害虚拟机自身安全。
>
> 包括：文件格式验证，元数据验证，字节码验证，符号引用验证。
>
> 文件格式验证：十六进制文件以cafe babe开头

##### 准备Prepare

> 为**类变量**分配内存并且设置该类变量的默认初始值
>
> 不包含用final修饰的static，因为final在编译的时候就会分配了，准备阶段会显式初始化，而不是默认初始化
>
> 不会为实例变量分配初始化，**类变量**会分配在**方法区**中，而**实例变量**是会随着对象一起分配到**堆**中

##### 解析 Resolve

> - 将常量池内的符号引用转换为直接引用的过程
>
>   - 符号引用就是一组符号来描述所引用的目标
>
>   - 符号引用的字面量形式明确定义在《java虚拟机规范》的class文件格式中
>
>   - 直接引用就是直接指向目标的指针、相对偏移量或一个间接定位到目标的句柄
>
> - 解析操作往往会伴随着JVM在执行完初始化之后再执行
>
> - 解析动作主要针对类或接口、字段、类方法、接口方法、方法类型等
>   - 对应常量池中的CONSTANT Class info、CONSTANT Fieldref info、CONSTANT Methodref info等

#### 初始化

执行类构造器方法`<clinit>`的过程

- clinit即class init，类初始化
- 此方法不需定义，是javac编译器自动收集类中的所有**static变量的赋值动作** 和 **静态代码块中的赋值语句**合并而来

- 只要包含static变量，就会有clinit方法

- `<clinit>`不同于类的构造器

  - 构造器是虚拟机视角下的`<init>`

- 若该类具有父类，JVM会保证子类的`<clinit>`执行前，父类的`<clinit>`已经执行完毕

  ```java
  public class ClinitTest1 {
      static class Father {
          public static int A = 1;
          static {
              A = 2;
          }
      }
  
      static class Son extends Father {
          public static int b = A;
      }
  
      public static void main(String[] args) {
          System.out.println(Son.b);  //A=0 -> A=1 -> A=2 -> b=2
      }
  }
  ```

- 虚拟机必须保证一个类的`<clinit>`方法在多线程下被同步加锁

  ```java
  public class DeadThreadTest {
      public static void main(String[] args) {
          new Thread(() -> {
              System.out.println(Thread.currentThread().getName() + "\t 线程t1开始");
              new DeadThread();
          }, "t1").start();
  
          new Thread(() -> {
              System.out.println(Thread.currentThread().getName() + "\t 线程t2开始");
              new DeadThread();
          }, "t2").start();
      }
  }
  class DeadThread {
      static {
          if (true) {
              System.out.println(Thread.currentThread().getName() + "\t 初始化当前类");
              while(true) {
  
              }
          }
      }
  }
  ```

  ```tex
  //输出结果
  t1	 线程t1开始
  t2	 线程t2开始
  t1	 初始化当前类
  
  从上面可以看出初始化后，只能够执行一次初始化，这也就是同步加锁的过程
  ```

#### 补充

##### 查看根加载器所能加载的目录

刚刚我们通过概念了解到了，根加载器只能够加载 java /lib目录下的class，我们通过下面代码验证一下

```java
public class ClassLoaderTest1 {
    public static void main(String[] args) {
        System.out.println("*********启动类加载器************");
        // 获取BootstrapClassLoader 能够加载的API的路径
        URL[] urls = sun.misc.Launcher.getBootstrapClassPath().getURLs();
        for (URL url : urls) {
            System.out.println(url.toExternalForm());
        }

        // 从上面路径中，随意选择一个类，来看看他的类加载器是什么：得到的是null，说明是  根加载器
        ClassLoader classLoader = Provider.class.getClassLoader();
    }
}
```

得到的结果

```
*********启动类加载器************
file:/E:/Software/JDK1.8/Java/jre/lib/resources.jar
file:/E:/Software/JDK1.8/Java/jre/lib/rt.jar
file:/E:/Software/JDK1.8/Java/jre/lib/sunrsasign.jar
file:/E:/Software/JDK1.8/Java/jre/lib/jsse.jar
file:/E:/Software/JDK1.8/Java/jre/lib/jce.jar
file:/E:/Software/JDK1.8/Java/jre/lib/charsets.jar
file:/E:/Software/JDK1.8/Java/jre/lib/jfr.jar
file:/E:/Software/JDK1.8/Java/jre/classes
null
```

##### 关于ClassLoader

ClassLoader类，它是一个抽象类，其后所有的类加载器都继承自ClassLoader（不包括启动类加载器）

![image-20200705103516138](http://minio.botuer.com/study-node/old/typora202208022137235.png)

sun.misc.Launcher 它是一个java虚拟机的入口应用

![image-20200705103636003](http://minio.botuer.com/study-node/old/typora202208022137244.png)

**获取ClassLoader的途径**

- 获取当前ClassLoader：clazz.getClassLoader()
- 获取当前线程上下文的ClassLoader：Thread.currentThread().getContextClassLoader()
- 获取系统的ClassLoader：ClassLoader.getSystemClassLoader()
- 获取调用者的ClassLoader：DriverManager.getCallerClassLoader()

##### 双亲委派机制举例

- 类加载器收到类加载请求，并不加载，委托给父类加载器，一步步向上委托，直到引导类加载器

- 父类加载器可以加载这个类就加载（属于加载的范围才能加载），否则交给子类，层层下放，直到能够完成请求

  ![image-20220802215124837](http://minio.botuer.com/study-node/old/typora202208022151897.png)

  当我们加载jdbc.jar 用于实现数据库连接的时候，首先我们需要知道的是 jdbc.jar是基于SPI接口进行实现的，所以在加载的时候，会进行双亲委派，最终从根加载器中加载 SPI核心类，然后在加载SPI接口类，接着在进行反向委派，通过线程上下文类加载器进行实现类 jdbc.jar的加载。

![image-20200705105810107](http://minio.botuer.com/study-node/old/typora202208022138485.png)

##### 沙箱安全机制

自定义string类，但是在加载自定义String类的时候会率先使用引导类加载器加载，而引导类加载器在加载的过程中会先加载jdk自带的文件（rt.jar包中java\lang\String.class），报错信息说没有main方法，就是因为加载的是rt.jar包中的string类。这样可以保证对java核心源代码的保护，这就是沙箱安全机制

##### 双亲委派机制的优势

通过上面的例子，我们可以知道，双亲机制可以

- 避免类的重复加载
- 保护程序安全，防止核心API被随意篡改
  - 自定义类：java.lang.String
  - 自定义类：java.lang.ShkStart（报错：阻止创建 java.lang开头的类）

#####  如何判断两个class对象是否相同

在JVM中表示两个class对象是否为同一个类存在两个必要条件：

- 类的完整类名必须一致，包括包名。
- 加载这个类的ClassLoader（指ClassLoader实例对象）必须相同。

换句话说，在JvM中，即使这两个类对象（class对象）来源同一个Class文件，被同一个虚拟机所加载，但只要加载它们的ClassLoader实例对象不同，那么这两个类对象也是不相等的。

JVM必须知道一个类型是由启动加载器加载的还是由用户类加载器加载的。如果一个类型是由用户类加载器加载的，那么JVM会将这个类加载器的一个引用作为类型信息的一部分保存在方法区中。当解析一个类型到另一个类型的引用的时候，JVM需要保证这两个类型的类加载器是相同的。

##### 类的主动使用和被动使用

Java程序对类的使用方式分为：主动使用和被动使用。
主动使用，又分为七种情况：

- 创建类的实例
- 访问某个类或接口的静态变量，或者对该静态变量赋值
- 调用类的静态方法I
- 反射（比如：Class.forName（"com.atguigu.Test"））
- 初始化一个类的子类
- Java虚拟机启动时被标明为启动类的类
- JDK7开始提供的动态语言支持：
- java.lang.invoke.MethodHandle实例的解析结果REF getStatic、REF putStatic、REF invokeStatic句柄对应的类没有初始化，则初始化

除了以上七种情况，其他使用Java类的方式都被看作是对类的被动使用，都不会导致类的初始化。

## 2运行时数据区

### 概述

- 运行时数据区包括：

  - 程序计数器、虚拟机栈、本地方法栈、堆区、方法区（元数据区、代码缓存区）

- 堆和方法区是线程共享，其他都是线程私有

- 图示

  ![image-20220811163143991](http://minio.botuer.com/study-node/old/typora202208111631161.png)

- 线程是一个程序里的运行单元。JVM允许一个应用有多个线程并行的执行。在Hotspot JVM里，每个线程都与操作系统的本地线程直接映射
  - 当一个Java线程准备好执行以后，此时一个操作系统的本地线程也同时创建
  - Java线程执行终止后，本地线程也会回收
  - 操作系统负责所有线程的安排调度到任何一个可用的CPU上
  - 一旦本地线程初始化成功，它就会调用Java线程中的run（）方法
- JVM系统线程
  - 使用调试工具可以查看后台线程，不包括main线程及main方法中创建的线程
  - Hotspot JVM中主要有
    - 虚拟机线程
      - 这种线程的操作是需要JVM达到安全点才会出现
      - 这些操作必须在不同的线程中发生的原因是他们都需要JVM达到安全点，这样堆才不会变化
      - 这种线程的执行类型包括"stop-the-world"的垃圾收集，线程栈收集，线程挂起以及偏向锁撤销
    - 周期任务线程
      - 这种线程是时间周期事件的体现（比如中断）
      - 他们一般用于周期性操作的调度执行
    - GC线程：这种线程对在JVM里不同种类的垃圾收集行为提供了支持
    - 编译线程：这种线程在运行时会将字节码编译成到本地代码
    - 信号调度线程：这种线程接收信号并发送给JVM，在它内部通过调用适当的方法进行处理

- CPU时间片
  - CPU时间片即CPU分配给各个程序的时间，每个线程被分配一个时间段，称作它的时间片
  - 在宏观上：可以同时打开多个应用程序，每个程序并行不悖，同时运行
  - 但在微观上：由于只有一个CPU，一次只能处理程序要求的一部分，如何处理公平，一种方法就是引入时间片，每个程序轮流执行

### 1程序计数器



- 程序计数寄存器（Program Counter Register）--程序计数器--PC寄存器
- Register的命名源于CPU的寄存器，寄存器存储指令相关的现场信息，CPU只有把数据装载到寄存器才能够运行
- 这里，并非是广义上所指的物理寄存器，或许将其翻译为PC计数器（或指令计数器）会更加贴切（也称为程序钩子），并且也不容易引起一些不必要的误会。JVM中的PC寄存器是对物理PC寄存器的一种抽象模拟
- **空间很小，速度最快**的存储区域
- 在JVM规范中，每个线程都有它自己的程序计数器，是线程私有的，生命周期与线程的生命周期保持一致（**线程私有的生命周期都和线程的生命周期一致**）
- 任何时间一个线程都只有一个方法在执行，也就是所谓的**当前方法**。程序计数器会存储当前线程正在执行的Java方法的JVM指令地址；或者，如果是在执行native方法，则是未指定值（undefned）
- 它是程序控制流的指示器，分支、循环、跳转、异常处理、线程恢复等基础功能都需要依赖这个计数器来完成。字节码解释器工作时就是通过改变这个计数器的值来选取下一条需要执行的字节码指令
- **它是唯一一个在Java虚拟机规范中没有规定任何OutOfMemoryError（OOM--内存溢出）情况的区域**
- PC寄存器用来存储指向下一条指令的地址，即将要执行的指令代码。由执行引擎读取下一条指令

​	![image-20220818174355933](http://minio.botuer.com/study-node/old/typora202208181743198.png)

```java
public class PCRegisterTest {
    public static void main(String[] args) {
        int i = 10;
        int j = 20;
        int k = i + j;
    }
}
```

```java
//最左边的数字就是程序计数器记录的指令地址

0: bipush        10
2: istore_1
3: bipush        20
5: istore_2
6: iload_1
7: iload_2
8: iadd
9: istore_3
10: return
```

![image-20220818174648672](http://minio.botuer.com/study-node/old/typora202208181746758.png)



- 线程切换时能够准确知道程序执行到的位置，从哪里继续执行
- JVM的字节码解释器就需要通过改变PC寄存器的值来明确下一条应该执行什么样的字节码指令
- 私有的程序计数器保证了切换线程时不会影响到自己线程下一步指令地址

### 2虚拟机栈

#### 介绍

- 由于跨平台性的设计，Java的指令都是根据栈来设计的。不同平台CPU架构不同，所以不能设计为基于寄存器的

  - 优点是跨平台，指令集小，编译器容易实现
  - 缺点是性能下降，实现同样的功能需要更多的指令

- 栈是运行时的单位，而堆是存储的单位

  - 栈解决程序的运行问题，即程序如何执行，或者说如何处理数据
  - 堆解决的是数据存储的问题，即数据怎么放，放哪里

- Java虚拟机栈（Java Virtual Machine Stack），早期也叫Java栈

- 每个线程在创建时都会创建一个虚拟机栈

- 其内部保存一个个的栈帧（Stack Frame），对应着一次次的Java方法调用

- 主管Java程序的运行，它保存方法的局部变量、部分结果，并参与方法的调用和返回

- 栈是一种快速有效的分配存储方式，访问速度仅次于程序计数器。JVM直接对Java栈的操作只有两个：方法  对应  栈帧的  入栈和出栈

- 对于栈来说不存在垃圾回收问题（栈存在溢出的情况）

- 栈中可能出现的异常

  - Java 虚拟机规范允许Java**栈的大小是动态的或者是固定不变的**
  - 固定大小，超过最大容量时报StackoverflowError 异常
  - 动态扩展，没有内存可以分配给栈时报 OutOfMemoryError 异常

- 可以使用参数 -Xss选项来设置线程的最大栈空间，栈的大小直接决定了函数调用的最大可达深度

  ```bash
  -Xss1m
  -Xss1k
  ```

#### 栈帧

- 栈帧是一个内存区块，是一个数据集，维系着方法执行过程中的各种数据信息
- 在一条活动线程中，一个时间点上，只会有一个活动的栈帧。即只有当前正在执行的方法的栈帧（**栈顶栈帧**）是有效的，这个栈帧被称为**当前栈帧**（Current Frame），与当前栈帧相对应的方法就是**当前方法**（Current Method），定义这个方法的类就是**当前类**（Current Class）
- 执行引擎运行的所有字节码指令只针对当前栈帧进行操作

**执行原理**

- 不同线程中所包含的栈帧是不允许存在相互引用的，即不可能在一个栈帧之中引用另外一个线程的栈帧（栈是私有的，栈帧更是私有的）

- 当前方法调用了其他方法，方法返回之际，当前栈帧会传回此方法的**执行结果给前一个栈帧**，接着，虚拟机会丢弃当前栈帧，使得前一个栈帧重新成为当前栈帧

- Java方法有两种返回函数的方式，不管使用哪种方式，都会导致栈帧被弹出
  - 一种是正常的函数返回，使用return指令
  - 另外一种是抛出异常

**栈帧的内部结构**

`<div style = "color:red">`栈帧的大小主要由局部变量表和操作数栈决定`</div>`

- 局部变量表（Local Variables）（或本地变量表）
- 操作数栈（operand Stack）（或表达式栈）
- 动态链接（DynamicLinking）（或指向运行时常量池的方法引用）
- 方法返回地址（Return Address）（或方法正常退出或者异常退出的定义）
- 其他附加信息

##### 局部变量表

- 定义为一个数字数组，主要用于存储形参、局部变量类型包括各类基本数据类型、对象引用（reference），以及returnAddress类型
- 不存在线程安全问题
- 局部变量表容量大小在编译期确定，并保存在方法的Code属性的maximum local variables数据项中，在方法运行期间是不会改变局部变量表的大小的
- 方法嵌套调用次数由栈大小决定（**栈越大，容纳栈帧越多**）
  - 参数、局部变量越多，局部变量表越大，栈帧就越大，嵌套调用大次数越少
- 局部变量表中的变量只在当前方法调用中有效。在方法执行时，虚拟机通过使用局部变量表完成参数值到参数变量列表的传递过程。当方法调用结束后，随着方法栈帧的销毁，局部变量表也会随之销毁

```java
public void test(){
		int i = 15;
		byte j = 8;
		boolean b = true;
		long l = 10000L;
		int k = i + j;
}
```

```sh
#Start 声明的位置
#Length 作用长度
#Slot	变量槽，记录索引
#Name	变量名
#Signature	变量类型
LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      19     0  this   Lcom/botuer/jvm/Test2;
            3      16     1     i   I
            6      13     2     j   B
            8      11     3     b   Z
           13       6     4     l   J
           18       1     6     k   I
```

###### Slot

![image-20220819145410978](http://minio.botuer.com/study-node/old/typora202208191454165.png)

- 参数值的存放在局部变量数组中
- 局部变量表，最基本的存储单元是Slot（变量槽），局部变量表中存放编译期可知的各种基本数据类型（8种），引用类型（reference），returnAddress类型的变量
- 在局部变量表里，32位以内的类型只占用一个slot（包括returnAddress类型），64位的类型（long和double）占用两个slot
  - byte、short、char 在存储前被转换为int
  - boolean也被转换为int，0表示false，非0表示true
  - long和double则占据两个slot
- JVM会为局部变量表中的每一个Slot都分配一个访问索引，通过这个索引即可成功访问到局部变量表中指定的局部变量值
- 方法被调用的时，形参和局部变量将会按照顺序被复制到局部变量表中的每一个slot上
- 如果访问long、double，使用第一个索引
- 如果当前帧是由构造方法或者实例方法创建的，那么该对象引用this将会存放在index为0的slot处，其余的参数按照参数表顺序继续排列
  - 静态方法无this
- 栈帧中的局部变量表中的槽位是可以重用的，如果一个局部变量过了其作用域，那么在其作用域之后申明的新的局部变就很有可能会复用过期局部变量的槽位，从而达到节省资源的目的

###### 变量

- 类变量：linking的paper阶段，给类变量默认赋值，init阶段给类变量显示赋值即静态代码块
- 实例变量：随着对象创建，会在堆空间中分配实例变量空间，并进行默认赋值
- 局部变量：在使用前必须进行显式赋值，不然编译不通过

> 参数表分配完毕之后，再根据方法体内定义的变量的顺序和作用域分配。
>
> 我们知道类变量表有两次初始化的机会，第一次是在“准备阶段”，执行系统初始化，对类变量设置零值，另一次则是在“初始化”阶段，赋予程序员在代码中定义的初始值。
>
> 和类变量初始化不同的是，局部变量表不存在系统初始化的过程，这意味着一旦定义了局部变量则必须人为的初始化，否则无法使用。
>
> 在栈帧中，与性能调优关系最为密切的部分就是前面提到的局部变量表。在方法执行时，虚拟机使用局部变量表完成方法的传递。
>
> 局部变量表中的变量也是重要的垃圾回收根节点，只要被局部变量表中直接或间接引用的对象都不会被回收

##### 操作数栈

- 操作数栈：Operand Stack
- 方法执行时，根据字节码指令写入（入栈）、读取（出栈）
- 操作数栈，主要用于保存计算过程的中间结果，同时作为计算过程中变量临时的存储空间
- 方法调用时，随着栈帧的创建，会创建一个固定长度的空的操作数栈（数组）
  - 最大深度编译期确定，保存在方法的Code属性中，为maxstack的值
- 栈中的任何一个元素都是可以任意的Java数据类型

  - 32bit的类型占用一个栈单位深度
  - 64bit的类型占用两个栈单位深度


- 操作数栈并非采用访问索引的方式来进行数据访问的，而是只能通过标准的入栈和出栈操作来完成一次数据访问
- 调用的方法有返回值，其返回值将会被压入当前栈帧的操作数栈中，并更新PC寄存器中下一条需要执行的字节码指令
- 操作数栈中元素的数据类型必须与字节码指令的序列严格匹配，这由编译器在编译器期间进行验证，同时在类加载过程中的类检验阶段的数据流分析阶段要再次验证

- 另外，我们说Java虚拟机的解释引擎是基于栈的执行引擎，其中的栈指的就是操作数栈，（指令集小，指令多）

```java
public void test() {
    byte i = 15;
    int j = 8;
    int k = i + j;
}
```

```sh
#byte、short、int 在操作数栈中按byte存储，不够用依次提升
#但存储在局部变量表中时都按int存储（含char、boolean）
public void test();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=2, locals=4, args_size=1
         0: bipush        15
         2: istore_1
         3: bipush        8
         5: istore_2
         6: iload_1
         7: iload_2
         8: iadd
         9: istore_3
        10: return
```

**执行流程**

<img src="http://minio.botuer.com/study-node/old/typora202208191540143.png" alt="image-20220819154010983" style="zoom:50%;" />

<img src="http://minio.botuer.com/study-node/old/typora202208191540853.png" alt="image-20220819154026775" style="zoom:50%;" />

<img src="http://minio.botuer.com/study-node/old/typora202208191540360.png" alt="image-20220819154055268" style="zoom:50%;" />

<img src="http://minio.botuer.com/study-node/old/typora202208191541936.png" alt="image-20220819154118847" style="zoom:50%;" />

<img src="http://minio.botuer.com/study-node/old/typora202208191541426.png" alt="image-20220819154150352" style="zoom:50%;" />

<img src="http://minio.botuer.com/study-node/old/typora202208191542204.png" alt="image-20220819154212122" style="zoom:50%;" />

###### 栈顶缓存技术

栈顶缓存技术：Top Of Stack Cashing

前面提过，基于栈式架构的虚拟机所使用的零地址指令更加紧凑，但完成一项操作的时候必然需要使用更多的入栈和出栈指令，这同时也就意味着将需要更多的指令分派（instruction dispatch）次数和内存读/写次数。

由于操作数是存储在内存中的，因此频繁地执行内存读/写操作必然会影响执行速度。为了解决这个问题，HotSpot JVM的设计者们提出了栈顶缓存（Tos，Top-of-Stack Cashing）技术，将栈顶元素全部缓存在物理CPU的寄存器中，以此降低对内存的读/写次数，提升执行引擎的执行效率。

> 寄存器：指令更少，执行速度快

##### 动态链接

> 动态链接、方法返回地址、附加信息 ： 有些地方被称为帧数据区

- 动态链接：Dynamic Linking
- 每一个栈帧内部都包含一个指向**运行时常量池**中该栈帧所属方法的引用包含这个引用的目的就是为了支持当前方法的代码能够实现动态链接（Dynamic Linking）。比如：invokedynamic指令
  - 在Java源文件被编译到字节码文件中时，所有的变量和方法引用都作为符号引用（symbolic Reference）保存在class文件的常量池里

```sh
public void test();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=2, locals=3, args_size=1
      #									符号引用			直接引用
         0: ldc           #2     // String hello!
         2: astore_1
         3: new           #3     // class java/util/Date
         6: dup
         7: invokespecial #4     // Method java/util/Date."<init>":()V
        10: astore_2
        11: return
```

```sh
Constant pool:
   #1 = Methodref          #6.#21         // java/lang/Object."<init>":()V
   #2 = String             #22            // hello!
   #3 = Class              #23            // java/util/Date
   #4 = Methodref          #3.#21         // java/util/Date."<init>":()V
   #5 = Class              #24            // com/botuer/jvm/Test2
   #6 = Class              #25            // java/lang/Object
   #7 = Utf8               <init>
   #8 = Utf8               ()V
   #9 = Utf8               Code
  #10 = Utf8               LineNumberTable
  #11 = Utf8               LocalVariableTable
  #12 = Utf8               this
  #13 = Utf8               Lcom/botuer/jvm/Test2;
  #14 = Utf8               test
  #15 = Utf8               s
  #16 = Utf8               Ljava/lang/String;
  #17 = Utf8               date
  #18 = Utf8               Ljava/util/Date;
  #19 = Utf8               SourceFile
  #20 = Utf8               Test2.java
  #21 = NameAndType        #7:#8          // "<init>":()V
  #22 = Utf8               hello!
  #23 = Utf8               java/util/Date
  #24 = Utf8               com/botuer/jvm/Test2
  #25 = Utf8               java/lang/Object
```

###### 为什么需要运行时常量池

- 在不同的方法，都可能调用常量或者方法，所以只需要存储一份即可，节省了空间

- 常量池的作用：就是为了提供一些符号和常量，便于指令的识别

###### 方法调用：解析与分配

**链接**

- 静态链接

> 当一个字节码文件被装载进JVM内部时，如果被调用的目标方法在编译期克制，且运行期保持不变时，这种情况下降调用方法的符号引用转换为直接引用的过程称之为静态链接
>

- 动态链接

> 如果被调用的方法在编译期无法被确定下来，也就是说，只能够在程序运行期将调用的方法的符号转换为直接引用，由于这种引用转换过程具备动态性，因此也被称之为动态链接。
>

**绑定机制**

对应的方法的绑定机制为：早期绑定（Early Binding）和晚期绑定（Late Binding）。绑定是一个字段、方法或者类在符号引用被替换为直接引用的过程，这仅仅发生一次。

- 早期绑定

> 早期绑定就是指被调用的目标方法如果在编译期可知，且运行期保持不变时，即可将这个方法与所属的类型进行绑定，这样一来，由于明确了被调用的目标方法究竟是哪一个，因此也就可以使用静态链接的方式将符号引用转换为直接引用。
>

- 晚期绑定

> 如果被调用的方法在编译期无法被确定下来，只能够在程序运行期根据实际的类型绑定相关的方法，这种绑定方式也就被称之为晚期绑定。
>

**早晚期绑定的发展历史**

随着高级语言的横空出世，类似于Java一样的基于面向对象的编程语言如今越来越多，尽管这类编程语言在语法风格上存在一定的差别，但是它们彼此之间始终保持着一个共性，那就是都支持封装、继承和多态等面向对象特性，既然这一类的编程语言具备多态特性，那么自然也就具备早期绑定和晚期绑定两种绑定方式。

Java中任何一个普通的方法其实都具备虚函数的特征，它们相当于C++语言中的虚函数（C++中则需要使用关键字virtual来显式定义）。如果在Java程序中不希望某个方法拥有虚函数的特征时，则可以使用关键字final来标记这个方法。

**虚方法和非虚方法**

- 如果方法在编译期就确定了具体的调用版本，这个版本在运行时是不可变的。这样的方法称为非虚方法。
- 静态方法、私有方法、final方法、实例构造器、父类方法都是非虚方法。
- 其他方法称为虚方法。

> 子类对象的多态的使用前提
>
> - 类的继承关系
> - 方法的重写



虚拟机中提供了以下几条方法调用指令：

**普通调用指令**

- invokestatic：调用静态方法，解析阶段确定唯一方法版本
- invokespecial：调用`<init>`方法、私有及父类方法，解析阶段确定唯一方法版本
- invokevirtual：调用所有虚方法
- invokeinterface：调用接口方法

**动态调用指令**

- invokedynamic：动态解析出需要调用的方法，然后执行

> 前四条指令固化在虚拟机内部，方法的调用执行不可人为干预，而invokedynamic指令则支持由用户确定方法版本。其中invokestatic指令和invokespecial指令调用的方法称为非虚方法，其余的（final修饰的除外）称为虚方法
>
> **final方法用的是invokevirtual指令，但是是非虚方法**

**invokednamic指令**

> JVM字节码指令集一直比较稳定，一直到Java7中才增加了一个invokedynamic指令，这是Java为了实现动态类型语言支持而做的一种改进。
>
> 但是在Java7中并没有提供直接生成invokedynamic指令的方法，需要借助ASM这种底层字节码工具来产生invokedynamic指令。直到Java8的Lambda表达式的出现，invokedynamic指令的生成，在Java中才有了直接的生成方式。
>
> Java7中增加的动态语言类型支持的本质是对Java虚拟机规范的修改，而不是对Java语言规则的修改，这一块相对来讲比较复杂，增加了虚拟机中的方法调用，最直接的受益者就是运行在Java平台的动态语言的编译器。
>

**动态类型语言和静态类型语言**

动态类型语言和静态类型语言两者的区别就在于对类型的检查是在编译期还是在运行期，满足前者就是静态类型语言，反之是动态类型语言。

- 静态类型语言的类型由变量名决定
- 动态类型语言的类型由变量值决定

**方法重写的本质**

- 找到操作数栈顶的第一个元素所执行的对象的实际类型，记作C。
- 如果在类型C中找到与常量中的描述符合简单名称都相符的方法，则进行访问权限校验，如果通过则返回这个方法的直接引用，查找过程结束；如果不通过，则返回java.lang.IllegalAccessError 异常。
- 否则，按照继承关系从下往上依次对C的各个父类进行第2步的搜索和验证过程。
- 如果始终没有找到合适的方法，则抛出java.lang.AbstractMethodsrror异常。

**IllegalAccessError介绍**

> 程序试图访问或修改一个属性或调用一个方法，这个属性或方法，你没有权限访问。一般的，这个会引起编译器异常。这个错误如果发生在运行时，就说明一个类发生了不兼容的改变。
>

**方法的调用：虚方法表**

- 在面向对象的编程中，会很频繁的使用到动态分派，如果在每次动态分派的过程中都要重新在类的方法元数据中搜索合适的目标的话就可能影响到执行效率。因此，为了提高性能，JVM采用在类的方法区建立一个虚方法表（virtual method table）（非虚方法不会出现在表中）来实现。使用索引表来代替查找。

- 每个类中都有一个虚方法表，表中存放着各个方法的实际入口。

**虚方法表是什么时候被创建的**

- 虚方法表会在类加载的**链接阶段**被创建并开始初始化，类的变量初始值准备完成之后，JVM会把该类的方法表也初始化完毕。

<img src="http://minio.botuer.com/study-node/old/typora202208191558317.png" alt="image-20200706144954070" style="zoom:50%;" />

- 如果类中重写了方法，那么调用的时候，就会直接在虚方法表中查找，否则将会直接连接到Object的方法中

##### 方法返回地址

**存放调用该方法的pc寄存器的值**。一个方法的结束，有两种方式：

- 正常执行完成

  - 执行引擎遇到任意一个方法返回的字节码指令（return），会有返回值传递给上层的方法调用者，简称正常完成出口；

  - 一个方法在正常调用完成之后，究竟需要使用哪一个返回指令，还需要根据方法返回值的实际数据类型而定
  - 在字节码指令中，返回指令包含ireturn（当返回值是boolean，byte，char，short和int类型时使用），lreturn（Long类型），freturn（Float类型），dreturn（Double类型），areturn。另外还有一个return指令声明为void的方法，实例初始化方法，类和接口的初始化方法使用
  - 方法正常退出时，调用者的pc计数器的值作为返回地址，即调用该方法的指令的下一条指令的地址

- 出现未处理的异常，非正常退出

  - 在方法执行过程中遇到异常（Exception），并且这个异常没有在方法内进行处理，也就是只要在本方法的异常表中没有搜索到匹配的异常处理器，就会导致方法退出，简称异常完成出口


  - 方法执行过程中，抛出异常时的异常处理，存储在一个异常处理表，方便在发生异常的时候找到处理异常的代码

  - 通过异常退出的，返回地址是要通过异常表来确定，栈帧中一般不会保存这部分信息

    ![image-20200706154554604](http://minio.botuer.com/study-node/old/typora202208191618113.png)


- 方法的退出就是当前栈帧出栈的过程。此时，需要恢复上层方法的局部变量表、操作数栈、将返回值压入调用者栈帧的操作数栈、设置PC寄存器值等，让调用者方法继续执行下去。

- 正常完成出口和异常完成出口的区别在于：通过异常完成出口退出的不会给他的上层调用者产生任何的返回值

##### 一些附加信息

> 栈帧中还允许携带与Java虚拟机实现相关的一些附加信息。例如：对程序调试提供支持的信息

##### 其他问题

- 举例栈溢出的情况？（StackOverflowError）
  - 通过 -Xss设置栈的大小
- 调整栈大小，就能保证不出现溢出么？
  - 不能保证不溢出
- 分配的栈内存越大越好么？
  - 不是，一定时间内降低了OOM概率，但是会挤占其它的线程空间，因为整个空间是有限的
- 垃圾回收是否涉及到虚拟机栈？
  - 不会
- **方法中定义的局部变量是否线程安全**？
  - 具体问题具体分析
  - 如果只有一个线程才可以操作此数据，则必是线程安全的
    - 方法内部产生，内部消亡的，线程安全
  - 如果有多个线程操作，则此数据是共享数据，如果不考虑共享机制，则为线程不安全
    - 作为形参传进来的，或作为返回值传出去的，线程不安全

### 3本地方法栈

Java虚拟机栈用于管理Java方法的调用，而**本地方法栈用于管理本地方法的调用**。

本地方法栈，也是线程私有的。

允许被实现成固定或者是可动态扩展的内存大小。（在内存溢出方面和虚拟机栈是相同的）

- 如果线程请求分配的栈容量超过本地方法栈允许的最大容量，Java虚拟机将会抛出一个stackoverflowError 异常。
- 如果本地方法栈可以动态扩展，并且在尝试扩展的时候无法申请到足够的内存，或者在创建新的线程时没有足够的内存去创建对应的本地方法栈，那么Java虚拟机将会抛出一个outofMemoryError异常。

本地方法是使用C语言实现的

它的具体做法是Native Method Stack中登记native方法，在Execution Engine 执行时加载本地方法库。

![image-20200706174708418](http://minio.botuer.com/study-node/old/typora202208191643988.png)

当某个线程调用一个本地方法时，它就进入了一个全新的并且不再受虚拟机限制的世界。它和虚拟机拥有同样的权限

- 本地方法可以通过本地方法接口来访问虚拟机内部的运行时数据区。
- 它甚至可以直接使用本地处理器中的寄存器
- 直接从本地内存的堆中分配任意数量的内存。

并不是所有的JVM都支持本地方法。因为Java虚拟机规范并没有明确要求本地方法栈的使用语言、具体实现方式、数据结构等。如果JVM产品不打算支持native方法，也可以无需实现本地方法栈。

在Hotspot JVM中，直接将本地方法栈和虚拟机栈合二为一

### 4堆

- 进程唯一，线程共享

- 一个JVM实例只存在一个堆内存，堆也是Java内存管理的核心区域

- Java堆区在JVM启动的时候即被创建，其空间大小也就确定了。是JVM管理的最大一块内存空间。

- 堆内存的大小是可以调节的

  > -Xms10m：最小堆内存
  >
  > -Xmx10m：最大堆内存

- 物理上不连续，逻辑上连续

- 并不是整个堆都是共享的，堆中还划分了线程私有的缓冲区（Thread Local Allocation Buffer，TLAB）

- 所有的对象实例以及数组都应当在运行时分配在堆上。（The heap is the run-time data area from which memory for all class instances and arrays is allocated）

- 方法结束后，堆中的对象不会马上被移除，仅仅在垃圾收集的时候才会被移除

  - 触发GC，才会回收
  - 回收对象时，发生STW（stop the world），用户线程受影响

- 堆，是GC（Garbage Collection，垃圾收集器）执行垃圾回收的重点区域

#### 堆内存细分

- Java 7及之前堆内存逻辑上分为三部分：新生区+养老区+永久区
  - Young Generation Space 新生区  Young/New   又被划分为Eden区和Survivor区
  - Tenure generation space 养老区 Old/Tenure
  - Permanent Space永久区   Perm
- Java 8及之后堆内存逻辑上分为三部分：新生区养老区+元空间
  - Young Generation Space新生区  Young/New  又被划分为Eden区和Survivor区
  - Tenure generation space 养老区  Old/Tenure
  - Meta Space  元空间   Meta

#### 设置堆内存大小

- “-Xms"用于表示堆区的起始内存，等价于-xx:InitialHeapSize
- “-Xmx"则用于表示堆区的最大内存，等价于-XX:MaxHeapSize

- 一旦堆区中的内存大小超过“-xmx"所指定的最大内存时，将会抛出outofMemoryError异常
- 通常会将-Xms和-Xmx两个参数**配置相同的值**，其目的是**为了能够在Java垃圾回收机制清理完堆区后不需要重新分隔计算堆区的大小，从而提高性能**
- 默认情况下

  - 初始内存大小：物理电脑内存大小/64

  - 最大内存大小：物理电脑内存大小/4

```java
/**
 * -Xms 用来设置堆空间（年轻代+老年代）的初始内存大小
 *  -X：是jvm运行参数
 *  ms：memory start
 * -Xmx：用来设置堆空间（年轻代+老年代）的最大内存大小
 */
public class HeapSpaceInitial {
    public static void main(String[] args) {
        // 返回Java虚拟机中的堆内存总量
        long initialMemory = Runtime.getRuntime().totalMemory() / 1024 / 1024;
        // 返回Java虚拟机试图使用的最大堆内存
        long maxMemory = Runtime.getRuntime().maxMemory() / 1024 / 1024;
        System.out.println("-Xms:" + initialMemory + "M");
        System.out.println("-Xmx:" + maxMemory + "M");
    }
}
```

- 命令行查看

```
#查看内存分配情况

jps  #查看进程id
jstat -gc 进程id   
```

```sh
#s0总	s1总		s0使用	s1使用		Eden总		Eden使用	old总			old使用		
S0C    S1C    S0U    S1U      EC       EU        OC         OU       MC     MU    CCSC   CCSU   YGC     YGCT    FGC    FGCT     GCT
10752.0 9216.0  0.0   8620.8 15872.0  11460.1   75264.0    40770.1   52480.0 48587.2 8192.0 7232.7    117    0.982   6      0.255    1.237
```

- -XX:+PrintGCDetails查看

```
Heap
 PSYoungGen      total 38400K, used 3344K [0x0000000795580000, 0x0000000798000000, 0x00000007c0000000)
  eden space 33280K, 10% used [0x0000000795580000,0x00000007958c41a8,0x0000000797600000)
  from space 5120K, 0% used [0x0000000797b00000,0x0000000797b00000,0x0000000798000000)
  to   space 5120K, 0% used [0x0000000797600000,0x0000000797600000,0x0000000797b00000)
 ParOldGen       total 87552K, used 0K [0x0000000740000000, 0x0000000745580000, 0x0000000795580000)
  object space 87552K, 0% used [0x0000000740000000,0x0000000740000000,0x0000000745580000)
 Metaspace       used 3039K, capacity 4496K, committed 4864K, reserved 1056768K
  class space    used 333K, capacity 388K, committed 512K, reserved 1048576K
```

#### jvisualvm

**报错**：You are running VisualVM using Java Runtime Environment (JRE).

Please use Java Development Kit (JDK)to run VisualVM.For information about requirements and setup visit https://visualvm.github.io.



```sh
vim /Applications/VisualVM.app/Contents/Resources/visualvm/etc/visaulvm.conf


#visualvm_jdkhome="/Library/Java/JavaVirtualMachines/jdk1.8.0_181.jdk/Contents/Home"
```

#### 年轻代、老年代

- 年轻代，生命周期极短

  - 伊甸园区（Eden），幸存者区（Survivor 0、Survivor1）
    - 幸存者区又叫from-to区
    - to区总为空

- 老年代，生命周期长，甚至有的和JVM声明周期一致

- 大小

  - Eden：From：To默认比例 = 8:1:1
    - 修改-XX:SurvivorRatio=
  - 新生代：老年代默认比例 = 1:2
    - 修改-XX:NewRatio=

- 几乎所有的Java对象都是在Eden区被new出来的。绝大部分的Java对象的销毁都在新生代进行了。（有些大的对象在Eden区无法存储时候，将直接进入老年代）

  >IBM公司的专门研究表明，新生代中80%的对象都是“朝生夕死”的。
  >
  >可以使用选项"-Xmn"设置新生代最大内存大小
  >
  >这个参数一般使用默认值就可以了

  ![image-20220825162313447](http://minio.botuer.com/study-node/old/typora202208251623607.png)

#### 对象分配过程

JM的设计者们不仅需要考虑内存如何分配、在哪里分配等问题，并且由于内存分配算法与内存回收算法密切相关，所以还需要考虑GC执行完内存回收后是否会在内存空间中产生内存碎片。

- new的对象先放伊甸园区。此区有大小限制
- 当伊甸园的空间填满时，程序又需要创建对象，JVM的垃圾回收器将对伊甸园区进行垃圾回收（MinorGC），将伊甸园区中的不再被其他对象所引用的对象进行销毁。再加载新的对象放到伊甸园区
- 然后将伊甸园中的剩余对象移动到幸存者0区-----**每次MinorGC后Eden清空，没用的回收，有用的进幸存者区**
- 如果再次触发垃圾回收，此时上次幸存下来的放到幸存者0区的，如果没有回收，就会放到幸存者1区
  - **每次Eden区触发GC时，幸存者区被动回收没用的对象-----幸存者区不能主动触发GC进行回收**

- 如果再次经历垃圾回收，此时会重新放回幸存者0区，接着再去幸存者1区
- 啥时候能去养老区呢？可以设置次数。默认是15次
- 在养老区，相对悠闲。当养老区内存不足时，再次触发GC：Major GC，进行养老区的内存清理
- 若养老区执行了Major GC之后，发现依然无法进行对象的保存，就会产生OOM异常
- 特殊规则
  - survivor满了，不执行GC进行回收，新的对象直接进Old
  - Eden进行GC后，还是放不下大对象，直接进Old
  - Old放不下，报OOM

- 针对幸存者s0，s1区的总结：复制之后有交换，谁空谁是to
- 关于垃圾回收：频繁在新生区收集，很少在老年代收集，几乎不再永久代和元空间进行收集
- 新生代采用复制算法的目的：是为了减少内碎片

可以设置参数：-Xx:MaxTenuringThreshold= N进行设置

![image-20220825162331587](http://minio.botuer.com/study-node/old/typora202208251623637.png)

- 测试

  ```java
  public class HeapInstanceTest {
      byte [] buffer = new byte[new Random().nextInt(1024 * 200)];
      public static void main(String[] args) throws InterruptedException {
          ArrayList<HeapInstanceTest> list = new ArrayList<>();
          while (true) {
              list.add(new HeapInstanceTest());
              Thread.sleep(10);
          }
      }
  }
  ```

  设置JVM参数

  ```bash
  -Xms600m -Xmx600m
  ```

  然后cmd输入下面命令，打开VisualVM图形化界面

  ```
  jvisualvm
  ```

  然后通过执行上面代码，通过VisualGC进行动态化查看

  ![image-20220825164407105](http://minio.botuer.com/study-node/old/typora202208251644839.gif)

  最终，在老年代和新生代都满了，就出现OOM

#### GC

- Minor GC：新生代的GC
- Major GC：老年代的GC
- Full GC：整堆收集，收集整个Java堆和方法区的垃圾收集

>我们都知道，JVM的调优的一个环节，也就是垃圾收集，我们需要尽量的避免垃圾回收，因为在垃圾回收的过程中，容易出现STW的问题
>
>而 Major GC 和 Full GC出现STW的时间，是Minor GC的10倍以上

- 部分收集：不是完整收集整个Java堆的垃圾收集

  - 新生代收集（MinorGC/YoungGC）：只是新生代的垃圾收集
  - 老年代收集（MajorGC/OldGC）：只是老年代的圾收集
    - 目前，只有CMSGC会有单独收集老年代的行为
    - 注意，很多时候Major GC会和Full GC混淆使用，需要具体分辨是老年代回收还是整堆回收
  - 混合收集（MixedGC）：收集整个新生代以及部分老年代的垃圾收集
    - 目前，只有G1 GC会有这种行为

- 整堆收集（FullGC）：收集整个java堆和方法区的垃圾收集

##### Minor GC

当年轻代空间不足时，就会触发MinorGC，这里的年轻代满指的是Eden代满，Survivor满不会引发GC。（每次Minor GC会清理年轻代的内存。）

因为Java对象大多都具备 **朝生夕灭** 的特性，所以Minor GC非常频繁，一般回收速度也比较快

Minor GC会引发STW，暂停其它用户的线程，等垃圾回收结束，用户线程才恢复运行

> STW：stop the word

![image-20200707095606813](http://minio.botuer.com/study-node/old/typora202208251650291.png)

##### Major GC

指发生在老年代的GC，对象从老年代消失时，我们说 “Major Gc” 或 “Full GC” 发生了

出现了MajorGc，经常会伴随至少一次的Minor GC（但非绝对的，在Paralle1 Scavenge收集器的收集策略里就有直接进行MajorGC的策略选择过程）

- 也就是在老年代空间不足时，会先尝试触发MinorGc。如果之后空间还不足，则触发Major GC

Major GC的速度一般会比MinorGc慢10倍以上，STW的时间更长，如果Major GC后，内存还不足，就报OOM了

##### Full GC

触发Full GC执行的情况有如下五种：

- 调用System.gc（）时，系统建议执行Full GC，但是不必然执行
- 老年代空间不足
- 方法区空间不足
- 通过Minor GC后进入老年代的平均大小大于老年代的可用内存
- 由Eden区、survivor spacee（From Space）区向survivor spacel（To Space）区复制时，对象大小大于To Space可用内存，则把该对象转存到老年代，且老年代的可用内存小于该对象大小

- 说明：Full GC 是开发或调优中尽量要避免的。这样暂时时间会短一些

#### 堆空间分代思想

- 不分代也可以
- 分代提升了GC的效率，朝生夕死的放在Eden，经过Survivor的过滤，进入到Old区，主要经历都花在MinorGC，减少了遍历用时，Survivor跟着Eden被动GC，Old不满不GC

#### 内存分配策略

如果对象在Eden出生并经过第一次Minor GC后仍然存活，并且能被Survivor容纳的话，将被移动到survivor空间中，并将对象年龄设为1。对象在survivor区中每熬过一次MinorGC，年龄就增加1岁，当它的年龄增加到一定程度（默认为15岁，其实每个JVM、每个GC都有所不同）时，就会被晋升到老年代

对象晋升老年代的年龄阀值，可以通过选项-xx:MaxTenuringThreshold来设置

针对不同年龄段的对象分配原则如下所示：

- 优先分配到Eden
  - 开发中比较长的字符串或者数组，会直接存在老年代，但是因为新创建的对象 都是 朝生夕死的，所以这个大对象可能也很快被回收，但是因为老年代触发Major GC的次数比 Minor GC要更少，因此可能回收起来就会比较慢
- 大对象直接分配到老年代
  - 尽量避免程序中出现过多的大对象
- 长期存活的对象分配到老年代
- 动态对象年龄判断
  - 如果survivor区中相同年龄的所有对象大小的总和大于Survivor空间的一半，年龄大于或等于该年龄的对象可以直接进入老年代，无须等到MaxTenuringThreshold 中要求的年龄。

#### 空间分配担保

 -Xx:HandlePromotionFailure

- 在发生**Minor GC之前**，虚拟机会检查**老年代最大可用**的连续空间是否**大于**新生代**所有对象**的总空间

  - 如果大于，则此次Minor GC是安全的
  - 如果小于，则虚拟机会查看-xx:HandlePromotionFailure设置值是否允担保失败。
    - 如果HandlePromotionFailure=true，那么会继续检查老年代最大可用连续空间是否大于历次**晋升**到老年代的**对象的平均大小**
    - 如果大于，则尝试进行一次Minor GC，但这次Minor GC依然是有风险的
    - 如果小于，则改为进行一次FullGC
    - 如果HandlePromotionFailure=false，则改为进行一次Full Gc（现在版本false失效）

  在JDK6 Update24之后，HandlePromotionFailure参数不会再影响到虚拟机的空间分配担保策略，观察openJDK中的源码变化，虽然源码中还定义了HandlePromotionFailure参数，但是在代码中已经不会再使用它。JDK6 Update 24之后的规则变为**只要老年代的连续空间 大于 新生代对象总大小  或者  历次晋升的平均大小就会进行Minor GC，否则将进行FullGC**

#### TLAB

- TLAB：Thread Local Allocation Buffer，也就是为每个线程单独分配了一个缓冲区
- 包含在Eden中
- **对象首先是通过TLAB开辟空间，如果不能放入，那么需要通过Eden来进行分配**

![image-20220825171542411](http://minio.botuer.com/study-node/old/typora202208251715476.png)

- 提升内存分配的吞吐量，因此这种内存分配方式称之为快速分配策略

  ![image-20220825171218356](http://minio.botuer.com/study-node/old/typora202208251712471.png)

- “-Xx:UseTLAB”设置是否开启TLAB空间。

  - 默认情况下，TLAB空间的内存非常小，仅占有整个Eden空间的1%

  - “-Xx:TLABWasteTargetPercent”设置TLAB空间所占用Eden空间的百分比大小

- **一旦对象在TLAB空间分配内存失败时，JVM就会尝试着通过使用加锁机制确保数据操作的原子性，从而直接在Eden空间中分配内存**

#### 逃逸分析

- 一个对象并没有逃逸出方法的话，那么就可能被优化成栈上分配。这样就无需在堆上分配内存，也无须进行垃圾回收了。这也是最常见的堆外存储技术

- 这是一种可以有效减少Java程序中同步负载和内存堆分配压力的跨函数全局数据流分析算法

- 通过逃逸分析，Java Hotspot编译器能够分析出一个新的对象的引用的使用范围从而决定是否要将这个对象分配到堆上

- 逃逸分析的基本行为就是  分析对象动态作用域

  - 对象只在方法内部使用，则没有发生逃逸
  - 被外部方法所引用，则发生逃逸。例如作为调用参数传递到其他地方中

- 开发中能使用局部变量的，就不要使用在方法外定义

  使用逃逸分析，编译器可以对代码做如下优化：

  - 栈上分配：将堆分配转化为栈分配。如果一个对象在子程序中被分配，要使指向该对象的指针永远不会发生逃逸，对象可能是栈上分配的候选，而不是堆上分配，分配完成后，继续在调用栈内执行，最后线程结束，栈空间被回收，局部变量对象也被回收。这样就无须进行垃圾回收了

    > 栈上分配的场景：给成员变量赋值、方法返回值、实例引用传递

  - 同步省略：如果一个对象被发现只有一个线程被访问到，那么对于这个对象的操作可以不考虑同步

  - 分离对象或标量替换：有的对象可能不需要作为一个连续的内存结构存在也可以被访问到，那么对象的部分（或全部）可以不存储在内存，而是存储在CPU寄存器中

    - 标量（scalar）是指一个无法再分解成更小的数据的数据

      > Java中的原始**基本数据类型就是标量**

    - 可以分解的数据叫做聚合量（Aggregate）

      > Java中的**对象就是聚合量**，因为他可以分解成其他聚合量和标量

    - 在JIT阶段，如果经过逃逸分析，发现一个对象不会被外界访问的话，那么经过JIT优化，就会把这个对象拆解成若干个其中包含的若干个成员变量来代替。这个过程就是标量替换

      ```java
      public static void main(String args[]) {
          alloc();
      }
      class Point {
          private int x;
          private int y;
      }
      private static void alloc() {
          Point point = new Point(1,2);
          System.out.println("point.x" + point.x + ";point.y" + point.y);
      }
      
      //标量替换后
      private static void alloc() {
          int x = 1;
          int y = 2;
          System.out.println("point.x = " + x + "; point.y=" + y);
      }
      //Point这个聚合量经过逃逸分析后，发现他并没有逃逸，就被替换成两个标量了。那么标量替换有什么好处呢？就是可以大大减少堆内存的占用。因为一旦不需要创建对象了，那么就不再需要分配堆内存了
      ```

    - **标量替换  为  栈上分配  提供了很好的基础**

- 几种情况：给成员变量赋值、方法返回值、实例引用传递

```java
//发生逃逸
public static StringBuffer createStringBuffer(String s1, String s2) {
    StringBuffer sb = new StringBuffer();
    sb.append(s1);
    sb.append(s2);
    return sb;
}
//未发生逃逸
public static String createStringBuffer(String s1, String s2) {
    StringBuffer sb = new StringBuffer();
    sb.append(s1);
    sb.append(s2);
    return sb.toString();
}
```

```java
/**
 * 如何快速的判断是否发生了逃逸分析，大家就看new的对象是否在方法外被调用
 */
public class EscapeAnalysis {

    public EscapeAnalysis obj;
  

  	//方法中new的对象可能被返回，被外部调用，发生逃逸
    public EscapeAnalysis getInstance() {
        return obj == null ? new EscapeAnalysis():obj;
    }

   	//new的对象作为属性值可能被外部调用，发生逃逸
    public void setObj() {
        this.obj = new EscapeAnalysis();
    }

  	//对象的作用于仅在当前方法中有效，没有发生逃逸
    public void useEscapeAnalysis() {
        EscapeAnalysis e = new EscapeAnalysis();
    }

    //引用的方法发生了逃逸，发生逃逸
    public void useEscapeAnalysis2() {
        EscapeAnalysis e = getInstance();
        // getInstance().XXX  发生逃逸
    }
}
```

- 逃逸分析的不足

  - 无法保证逃逸分析的性能消耗一定能高于他的消耗

  - 虽然经过逃逸分析可以做标量替换、栈上分配、和锁消除。但是逃逸分析自身也是需要进行一系列复杂的分析的，这其实也是一个相对耗时的过程

  - 一个极端的例子，就是经过逃逸分析之后，发现没有一个对象是不逃逸的。那这个逃逸分析的过程就白白浪费掉了

  - oracle Hotspot JVM中明确，**所有的对象实例都是创建在堆上**

    > intern字符串的缓存和静态变量曾经都被分配在永久代上，而永久代已经被元数据区取代。但是，intern字符串缓存和静态变量并不是被转移到元数据区，而是直接在堆上分配，所以这一点同样符合前面一点的结论：对象实例都是分配在堆上

#### 参数小结

- -XX：+PrintFlagsInitial：查看所有的参数的默认初始值
- -XX：+PrintFlagsFinal：查看所有的参数的最终值（可能会存在修改，不再是初始值）
- -Xms：初始堆空间内存（默认为物理内存的1/64）
- -Xmx：最大堆空间内存（默认为物理内存的1/4）
- -Xmn：设置新生代的大小。（初始值及最大值）
- -XX:NewRatio：配置新生代与老年代在堆结构的占比

- -XX:SurvivorRatio：设置新生代中Eden和S0/S1空间的比例
- -XX:MaxTenuringThreshold：设置新生代垃圾的最大年龄
- -XX：+PrintGCDetails：输出详细的GC处理日志
  - 打印gc简要信息：①-Xx：+PrintGC  ② - verbose:gc
- -XX:HandlePromotionFalilure：是否设置空间分配担保
- 选项“-xx：+DoEscapeAnalysis"显式开启逃逸分析（1.7 版本之后，HotSpot中默认开启）
- 通过选项“-xx：+PrintEscapeAnalysis"查看逃逸分析的筛选结果

### 5方法区

方法区主要存放的是 Class，而堆中主要存放的是 实例化的对象

![image-20220828185627384](http://minio.botuer.com/study-node/old/typora202208281856452.png)

- 线程共享
- 方法区在JVM启动的时候被创建，并且它的实际的物理内存空间中和Java堆区一样都可以是不连续的。
- 方法区的大小，跟堆空间一样，可以选择固定大小或者可扩展
- 方法区的大小决定了系统可以保存多少个类，如果系统定义了太多的类，导致方法区溢出，虚拟机同样会抛出内存溢出错误：ava.lang.OutofMemoryError：PermGen space 或者java.lang.OutOfMemoryError:Metaspace
  - 加载大量的第三方的jar包
  - Tomcat部署的工程过多（30~50个）
  - 大量动态的生成反射类
- 关闭JVM就会释放这个区域的内存

- 栈、堆、方法区的交互关系
  - Person：存放在元空间，也可以说方法区
  - person：存放在Java栈的局部变量表中
  - new Person()：存放在Java堆中

![image-20220828143401448](http://minio.botuer.com/study-node/old/typora202208281434655.png)

#### HotSpot演进

- jdk6之前，**静态变量** 和 运行时常量池中的**字符串常量池**在永久带

- jdk7时，常量池和静态变量放到堆中，准备放弃永久带

  > - 为永久代设置空间大小是很难确定的，导致Java程序更容易oom（超过-XX:MaxPermsize上限）默认情况下，元空间的大小仅受本地内存限制
  >
  > - 对永久代进行调优是很困难的，主要是为了降低Full GC，方法区的垃圾收集主要回收两部分内容：常量池中废弃的常量和不在使用的类型

- JDK 1.8后，完全废弃了永久代的概念，改用与JRockit、J9一样在本地内存中实现的元空间（Metaspace）来代替，**元空间存放在堆外内存中**

- 仅对HotSpot而言，永久带和元空间都是方法区的实现，《Java虚拟机规范》对如何实现方法区，不做统一要求。例如：BEAJRockit / IBM J9 中不存在永久代的概念

- 设置方法区大小

  - jdk7之前
    - -xx:Permsize来设置永久代初始分配空间。默认值是20.75M
    - -XX:MaxPermsize来设定永久代最大可分配空间。32位机器默认是64M，64位机器模式是82M
    - 当JVM加载的类信息容量超过了这个值，会报异常OutofMemoryError:PermGen space

  - jdk8之后

    - 元空间大小可以使用参数 -XX:MetaspaceSize 和 -XX:MaxMetaspaceSize指定

    - 默认值依赖于平台

      - windows下，-XX:MetaspaceSize是21M，-XX:MaxMetaspaceSize的值是-1，即没有限制

    - 默认情况下，耗尽系统内存时报OOM

    - 初始的元空间大小就是初始的高位线，一旦触及这个水位线，Full GC将会被触发并卸载没用的类，然后这个高水位线将会重置。新的高水位线的值取决于GC后释放了多少元空间。如果释放的空间不足，那么在不超过MaxMetaspaceSize时，适当提高该值。如果释放空间过多，则适当降低该值

      > 如果初始化的高水位线设置过低，上述高水位线调整情况会发生很多次。通过垃圾回收器的日志可以观察到Full GC多次调用。为了避免频繁地GC，建议将-XX:MetaspaceSize设置为一个相对较高的值

- OOM

  - 解决OOM先搞清

    - 内存的对象是否是必要的

    - 内存泄露还是内存溢出

      > 内存泄漏就是 有大量的引用指向某些对象，但是这些对象以后不会使用了，但是因为它们还和GC ROOT有关联，所以导致以后这些对象也不会被回收，这就是内存泄漏的问题

  - 如果是内存泄漏，可进一步通过工具查看泄漏对象到GC Roots的引用链。于是就能找到泄漏对象是通过怎样的路径与GCRoots相关联并导致垃圾收集器无法自动回收它们的。掌握了泄漏对象的类型信息，以及GCRoots引用链的信息，就可以比较准确地定位出泄漏代码的位置

  - 如果不存在内存泄漏，换句话说就是内存中的对象确实都还必须存活着，那就应当检查虚拟机的堆参数（-Xmx与-Xms），与机器物理内存对比看是否还可以调大，从代码上检查是否存在某些对象生命周期过长、持有状态时间过长的情况，尝试减少程序运行期的内存消耗

#### 内部结构

- 类型信息、常量、静态变量、即时编译器编译后的代码缓存等

- 类型信息

  > 对每个加载的类型（类class、接口interface、枚举enum、注解annotation），JVm必须在方法区中存储以下类型信息
  >

  - 这个类型的完整有效名称（全名=包名.类名）
  - 这个类型直接父类的完整有效名（对于interface或是java.lang.object，都没有父类）
  - 这个类型的修饰符（public，abstract，final的某个子集）
  - 这个类型直接接口的一个有序列表

- 域（属性）信息

  > JVM必须在方法区中  保存类型的所有属性的相关信息以及属性的声明顺序

  - 包括：域名称、域类型、域修饰符（public，private，protected，static，final，volatile，transient的某个子集）

- 方法（Method）信息

  - 方法的修饰符（public，private，protected，static，final，synchronized，native，abstract的一个子集）
  - 方法的返回类型（或void）
  - 方法名称
  - 方法参数的数量和类型（按顺序）
  - 异常表（abstract和native方法除外）
  - 方法的字节码（bytecodes）、操作数栈、局部变量表及大小（abstract和native方法除外）

  >每个异常处理的开始位置、结束位置、代码处理在程序计数器中的偏移地址、被捕获的异常类的常量池索引

- non-final的类变量

  - 静态变量和类 关联在一起，随着类的加载而加载，他们成为类数据在逻辑上的一部分

  - 类变量被类的所有实例共享，即使没有类实例时，你也可以访问它

  ```java
  /**
   * non-final的类变量
   * 如下代码所示，即使我们把order设置为null，也不会出现空指针异常
   */
  public class MethodAreaTest {
      public static void main(String[] args) {
          Order order = new Order();
          order.hello();
          System.out.println(order.count);
      }
  }
  class Order {
      public static int count = 1;
      public static final int number = 2;
      public static void hello() {
          System.out.println("hello!");
      }
  }
  ```

- 全局常量

  - 被声明为final的类变量的处理方法则不同，每个全局常量在编译的时候就会被分配了

- 运行时常量池

  - 加载类的信息都在方法区

  - 加载类的信息都在字节码文件的常量池中，通过类加载器加载时，加载到方法区到运行时常量池，在链接的解析阶段，把字节码的符号引用转为直接引用

  - 常量池

    - 需要常量池的原因

      > 一个java源文件中的类、接口，编译后产生一个字节码文件。而Java中的字节码需要数据支持，通常这种数据会很大以至于不能直接存到字节码里，换另一种方式，可以存到常量池，这个字节码包含了指向常量池的引用。在动态链接的时候会用到运行时常量池

    - 常量池包含

      - 数量值
      - 字符串值
      - 类引用
      - 字段引用
      - 方法引用

    - 常量池可以看做是一张表，虚拟机指令根据这张常量表找到要执行的类名、方法名、参数类型、字面量等类型

    - JVM为每个已加载的类型（类或接口）都维护一个常量池。池中的数据项像数组项一样，是通过索引访问的

  - 运行时常量池

    - 运行时常量池中包含多种不同的常量
      - 包括编译期就已经明确的数值字面量
      - 包括到运行期解析后才能够获得的方法引用或者字段引用
    - 此时不再是常量池中的符号地址了，这里换为真实地址
    - 相对于Class文件常量池的另一重要特征是：具备动态性
    - 运行时常量池类似于传统编程语言中的符号表（symboltable），但是它所包含的数据却比符号表要更加丰富一些
    - 当创建类或接口的运行时常量池时，如果构造运行时常量池所需的内存空间超过了方法区所能提供的最大值，则JVM会抛outofMemoryError异常

#### 方法区图示

```java
public class MethodAreaDemo {
    public static void main(String args[]) {
        int x = 500;
        int y = 100;
        int a = x / y;
        int b = 50;
        System.out.println(a+b);
    }
}
```

- 将操作数500放入到操作数栈中
- 存储到局部变量表中
- 把100放入到操作数栈中
- 存储到局部变量表中
- 将变量表中的500 和 100 取出
- 进行除法操作，并放到操作数栈
- 把结果入栈
- 把50放入到操作数栈中
- 存储到局部变量表中
- 输出流，需要调用运行时常量池的常量：获取类型的值并放到操作数栈
- 将变量表中的5和50取出
- 进行加法操作
- 调用invokevirtual（虚方法调用）：调用静态方法
  - jvm根据这个方法的描述，创建新栈帧，方法的参数从操作数栈中弹出，压入到虚拟机栈，然后虚拟机执行顶部栈帧，执行完毕后，再执行main方法对应的栈帧
- 返回

![6309d83fb67ea](http://minio.botuer.com/study-node/old/typora202208271640650.gif)

#### StringTable

- jdk7中将StringTable放到了堆空间中

  > 因为永久代的回收效率很低，在full gc的时候才会触发。而full gc是老年代的空间不足、永久代不足时才会触发，这就导致stringTable回收效率不高。而我们开发中会有大量的字符串被创建，回收效率低，导致永久代内存不足。放到堆里，能及时回收内存

- string在jdk8及以前内部定义了final char[] value用于存储字符串数据

- JDK9时改为byte[]，同时基于String的数据结构，例如StringBuffer和StringBuilder也同样做了修改

  > String类的当前实现将字符存储在char数组中，每个字符使用两个字节(16位)。从许多不同的应用程序收集的数据表明
  >
  > - 字符串是堆使用的主要组成部分
  > - 大多数字符串对象只包含拉丁字符。这些字符只需要一个字节的存储空间，因此这些字符串对象的内部char数组中有一半的空间将不会使用
  >
  > 我们建议改变字符串的内部表示class从utf - 16字符数组到字节数组加一个encoding-flag字段。新的String类将根据字符串的内容存储编码为ISO-8859-1/Latin-1(每个字符一个字节)或UTF-16(每个字符两个字节)的字符。编码标志将指示使用哪种编码
  >
  > **结论：String再也不用char[] 来存储了，改成了byte [] 加上编码标记，节约了一些空间**

#### 静态变量

- **静态引用 对应的对象实体 始终都存在堆空间**

- 可以使用 jhsdb.ext，需要在jdk9的时候才引入的

- staticobj随着Test的类型信息存放在方法区，instanceobj随着Test的对象实例存放在Java堆，localobject则是存放在foo（）方法栈帧的局部变量表中

![image-20200708215025527](http://minio.botuer.com/study-node/old/typora202208281824724.png)

- 测试发现：三个对象的数据在内存中的地址都落在Eden区范围内，所以结论：只要是对象实例必然会在Java堆中分配

- 接着，找到了一个引用该staticobj对象的地方，是在一个java.lang.Class的实例里，并且给出了这个实例的地址，通过Inspector查看该对象实例，可以清楚看到这确实是一个java.lang.Class类型的对象实例，里面有一个名为staticobj的实例字段

![image-20200708215218078](http://minio.botuer.com/study-node/old/typora202208281824730.png)

> 从《Java虚拟机规范》所定义的概念模型来看，所有Class相关的信息都应该存放在方法区之中，但方法区该如何实现，《Java虚拟机规范》并未做出规定，这就成了一件允许不同虚拟机自己灵活把握的事情。**JDK7及其以后版本的HotSpot虚拟机选择   把静态变量与类型  在Java语言一端的映射class对象存放在一起，存储于Java堆之中**，从我们的实验中也明确验证了这一点

#### 垃圾回收

- 方法区的垃圾收集主要回收两部分内容：废弃的常量  和  不再使用的类型
  - 常量池之中主要存放的两大类常量：字面量和符号引用
    - 字面量比较接近Java语言层次的常量概念，如文本字符串、被声明为final的常量值等
    - 符号引用则属于编译原理方面的概念，包括下面三类常量

      - 类和接口的全限定名
      - 字段的名称和描述符
      - 方法的名称和描述符
- 对常量对回收：只要常量池中的常量没有被任何地方引用，就可以被回收
  - 回收废弃常量与回收Java堆中的对象非常类似（关于常量的回收比较简单，重点是类的回收）
  - 判断废弃简单
- 对类型的回收，判断不再使用的类型比较苛刻
  - 该类所有的实例都已经被回收，也就是Java堆中不存在该类及其任何派生子类的实例。
  - 加载该类的类加载器已经被回收，这个条件除非是经过精心设计的可替换类加载器的场景，如osGi、JSP的重加载等，否则通常是很难达成的
  - 该类对应的java.lang.Class对象没有在任何地方被引用，无法在任何地方通过反射访问该类的方法
- Java虚拟机被允许对满足上述三个条件的无用类进行回收，这里说的仅仅是“被允许”，而并不是和对象一样，没有引用了就必然会回收。关于是否要对类型进行回收，HotSpot虚拟机提供了-Xnoclassgc参数进行控制，还可以使用-verbose:class 以及 -XX：+TraceClass-Loading、-XX：+TraceClassUnLoading查看类加载和卸载信息
- 在大量使用反射、动态代理、CGLib等字节码框架，动态生成JSP以及oSGi这类频繁自定义类加载器的场景中，通常都需要Java虚拟机具备类型卸载的能力，以保证不会对方法区造成过大的内存压力

#### 直接内存

- Direct Memory

- 不是虚拟机运行时数据区的一部分，也不是《Java虚拟机规范》中定义的内存区域

- 直接内存是在Java堆外的、直接向系统申请的内存区间

- 来源于NIO，通过存在堆中的DirectByteBuffer操作Native内存

- 通常，访问直接内存的速度会优于Java堆。即读写性能高

  - 因此出于性能考虑，读写频繁的场合可能会考虑使用直接内存
  - Java的NIO库允许Java程序使用直接内存，用于数据缓冲区

  ```java
  //使用下列代码，直接分配本地内存空间
  int BUFFER = 1024*1024*1024; // 1GB
  ByteBuffer byteBuffer = ByteBuffer.allocateDirect(BUFFER);
  ```

- 非直接缓存区和缓存区

  原来采用BIO的架构，我们需要从用户态切换成内核态

  ![image-20200709170907611](http://minio.botuer.com/study-node/old/typora202208291443337.png)

  NIO的方式使用了缓存区的概念

- 存在的问题：也可能导致outofMemoryError异常

  - 由于直接内存在Java堆外，因此它的大小不会直接受限于-xmx指定的最大堆大小，但是系统内存是有限的，Java堆和直接内存的总和依然受限于操作系统能给出的最大内存

  - 缺点

    - 分配回收成本较高

    - 不受JVM内存回收管理

  - 直接内存大小可以通过MaxDirectMemorySize设置

  - 如果不指定，默认与堆的最大值-xmx参数值一致

### 对象实例化内存布局与访问定位

#### 对象实例化

##### 对象创建方式

- new：最常见的方式、单例类中调用getInstance的静态类方法，XXXFactory的静态方法
- 反射
  - Class的newInstance（）：在JDK9里面被标记为过时的方法，因为只能调用空参构造器
  - Constructor的newInstance（）：可以调用空参的，或者带参的构造器
- 使用clone（）：不调用任何的构造器，要求当前的类需要实现Cloneable接口中的clone接口
- 使用反序列化：序列化一般用于Socket的网络传输
- 第三方库：如Objenesis

##### 创建对象的步骤

- 判断对象对应的类是否加载、链接、初始化，加载类元信息

  > 虚拟机遇到一条new指令，首先去检查这个指令的参数能否在Metaspace的常量池中定位到一个类的符号引用，并且检查这个符号引用代表的类是否已经被加载，解析和初始化。（即判断类元信息是否存在）。如果没有，那么在双亲委派模式下，使用当前类加载器以ClassLoader + 包名 + 类名为key进行查找对应的 .class文件，如果没有找到文件，则抛出ClassNotFoundException异常，如果找到，则进行类加载，并生成对应的Class对象

- 为对象分配内存

  > 首先计算对象占用空间的大小，接着在堆中划分一块内存给新对象。如果实例成员变量是引用变量，仅分配引用变量空间即可，即4个字节大小
  >
  > 选择哪种分配方式由Java堆是否规整所决定，而Java堆是否规整又由所采用的垃圾收集器是否带有压缩整理功能决定

  - 如果内存规整：指针碰撞

    > 用过的内存在一边，空闲的内存放另外一边，中间放着一个指针作为分界点的指示器，分配内存就仅仅是把指针指向空闲那边挪动一段与对象大小相等的距离罢了。如果垃圾收集器选择的是Serial ，ParNew这种基于压缩算法的，虚拟机采用这种分配方式。一般使用带Compact（整理）过程的收集器时，使用指针碰撞

  - 如果内存不规整

    - 虚拟表需要维护一个列表

    - 空闲列表分配

      > 如果内存不是规整的，已使用的内存和未使用的内存相互交错，那么虚拟机将采用的是空闲列表来为对象分配内存。意思是虚拟机维护了一个列表，记录上那些内存块是可用的，再分配的时候从列表中找到一块足够大的空间划分给对象实例，并更新列表上的内容。这种分配方式成为了 “空闲列表（Free List）”

- 处理并发问题

  - 采用CAS配上失败重试保证更新的原子性
  - 每个线程预先分配TLAB - 通过设置 -XX:+UseTLAB参数来设置（区域加锁机制）
    - 在Eden区给每个线程分配一块区域

- 初始化分配到的内存：默认初始化

- 设置对象的对象头

  > 将对象的所属类（即类的元数据信息）、对象的HashCode和对象的GC信息、锁信息等数据存储在对象的对象头中。这个过程的具体设置方式取决于JVM实现

- 执行init方法进行初始化：属性的显示初始化、代码块中初始化、构造器中初始化

  > 在Java程序的视角看来，初始化才正式开始。初始化成员变量，执行实例化代码块，调用类的构造方法，并把堆内对象的首地址赋值给引用变量
  >
  > 因此一般来说（由字节码中跟随invokespecial指令所决定），new指令之后会接着就是执行方法，把对象按照程序员的意愿进行初始化，这样一个真正可用的对象才算完成创建出来

#### 对象内存布局

- 对象头
  - 运行时元数据（Mark Word）
    - 哈希值（HashCode）
    - GC分代年龄
    - 锁状态标志
    - 线程持有的锁
    - 偏向线程ID
    - 翩向时间戳
  - 类型指针：指向类元数据InstanceKlass，确定该对象所属的类型。指向的其实是方法区中存放的类元信息
  - 如果是数组，还需要记录数组的长度
- 实例数据（Instance Data）
  - 他是对象真正存储的有效信息，包括程序代码中定义的各种类型的字段，包括父类继承下来的和本身的字段
  - 规则
    - 相同宽度的字段分配在一起（4个字节、8个字节）
    - 父类中定义的变量对出现在子类之前
    - 如果CompactFields参数为true（默认为true），子类的窄变量可能插入到父类变量的空隙
- 对齐填充：不是必须的，也没有特别的含义，仅仅起到占位符的作用

![image-20220828193322481](http://minio.botuer.com/study-node/old/typora202208281933622.png)

#### 对象访问定位

![image-20220829143225995](http://minio.botuer.com/study-node/old/typora202208291432082.png)

##### 句柄访问

- 句柄访问就是说栈的局部变量表中，记录的对象的引用，然后在堆空间中开辟了一块空间，也就是句柄池
- 优点：reference中存储稳定句柄地址，对象被移动（垃圾收集时移动对象很普遍）时只会改变句柄中实例数据指针即可，reference本身不需要被修改

![image-20220829143304069](http://minio.botuer.com/study-node/old/typora202208291433217.png)

##### 直接指针访问

- （HotSpot采用）
- 直接指针是局部变量表中的引用，直接指向堆中的实例，在对象实例中有类型指针，指向的是方法区中的对象类型数据

![image-20220829143330341](http://minio.botuer.com/study-node/old/typora202208291433406.png)

## 3执行引擎

### 概述

- 虚拟机与物理机

  - 两种机器都有代码执行能力

  - 物理机的执行引擎是直接建立在处理器、缓存、指令集和操作系统层面上的

  - 而虚拟机的执行引擎则是由软件自行实现的，

    > 因此可以不受物理条件制约地定制指令集与执行引擎的结构体系
    >
    > 能够执行那些不被硬件直接支持的指令集格式

- JVM的主要任务是负责装载字节码到其内部，但字节码并不能够直接运行在操作系统之上，因为字节码指令并非等价于本地机器指令，它内部包含的仅仅只是一些能够被JVM所识别的字节码指令、符号表，以及其他辅助信息

- 执行引擎（Execution Engine）的任务就是将字节码指令解释/编译为对应平台上的本地机器指令才可以

  > 简单来说，JVM中的执行引擎充当了将高级语言翻译为机器语言的译者

- 执行引擎的工作流程

  - 执行引擎在执行的过程中究竟需要执行什么样的字节码指令完全依赖于PC寄存器
  - 每当执行完一项指令操作后，PC寄存器就会更新下一条需要被执行的指令地址
  - 当然方法在执行的过程中，执行引擎有可能会通过存储在局部变量表中的对象引用准确定位到存储在Java堆区中的对象实例信息，以及通过对象头中的元数据指针定位到目标对象的类型信息

### Java代码编译和执行过程

大部分的程序代码转换成物理机的目标代码或虚拟机能执行的指令集之前，都需要经过上图中的各个步骤

- 前面橙色部分是生成字节码文件的过程，和JVM无关
- 后面蓝色和绿色才是JVM需要考虑的过程

![image-20200710082141643](http://minio.botuer.com/study-node/old/typora202208291513254.png)

- Java代码编译是由Java源码编译器来完成，流程图如下所示：

![image-20200710082433146](http://minio.botuer.com/study-node/old/typora202208291513266.png)

- Java字节码的执行是由JVM执行引擎来完成，流程图 如下所示

![image-20200710083036258](http://minio.botuer.com/study-node/old/typora202208291513270.png)

- 我们用一个总的图，来说说 解释器和编译器

![image-20200710083656277](http://minio.botuer.com/study-node/old/typora202208291513272.png)

- 解释器

  - （Interpreter）

  - 当Java虚拟机启动时会根据预定义的规范对字节码采用逐行解释的方式执行，将每条字节码文件中的内容“翻译”为对应平台的本地机器指令执行

- JIT编译器
  - JIT（Just In Time Compiler）编译器：就是虚拟机将源代码直接编译成和本地机器平台相关的机器语言

- 半编译半解释型语言
  - JDK1.0时代，将Java语言定位为“解释执行”还是比较准确的
  - 再后来，Java也发展出可以直接生成本地代码的编译器
  - 现在JVM在执行Java代码的时候，通常都会将解释执行与编译执行二者结合起来进行
  - 翻译成本地代码后，就可以做一个缓存操作，存储在方法区中

### 机器码、指令、汇编语言

- 机器码

  - 各种用二进制编码方式表示的指令，叫做机器指令码。开始，人们就用它采编写程序，这就是机器语言。

  - 机器语言虽然能够被计算机理解和接受，但和人们的语言差别太大，不易被人们理解和记忆，并且用它编程容易出差错。

  - 用它编写的程序一经输入计算机，CPU直接读取运行，因此和其他语言编的程序相比，执行速度最快。

  - 机器指令与CPU紧密相关，所以不同种类的CPU所对应的机器指令也就不同。

- 指令

  - 由于机器码是有0和1组成的二进制序列，可读性实在太差，于是人们发明了指令。

  - 指令就是把机器码中特定的0和1序列，简化成对应的指令（一般为英文简写，如mov，inc等），可读性稍好

  - 由于不同的硬件平台，执行同一个操作，对应的机器码可能不同，所以不同的硬件平台的同一种指令（比如mov），对应的机器码也可能不同。

- 指令集

  - 不同的硬件平台，各自支持的指令，是有差别的。因此每个平台所支持的指令，称之为对应平台的指令集。如常见的

    - x86指令集，对应的是x86架构的平台

    - ARM指令集，对应的是ARM架构的平台


- 汇编语言

  - 由于指令的可读性还是太差，于是人们又发明了汇编语言。

  - 在汇编语言中，用助记符（Mnemonics）代替机器指令的操作码，用地址符号（Symbol）或标号（Label）代替指令或操作数的地址。在不同的硬件平台，汇编语言对应着不同的机器语言指令集，通过汇编过程转换成机器指令。

    > 由于计算机只认识指令码，所以用汇编语言编写的程序还必须翻译成机器指令码，计算机才能识别和执行。

- 高级语言

  - 为了使计算机用户编程序更容易些，后来就出现了各种高级计算机语言。

  - 高级语言比机器语言、汇编语言更接近人的语言当计算机执行高级语言编写的程序时，仍然需要把程序解释和编译成机器的指令码。完成这个过程的程序就叫做解释程序或编译程序
  - 高级语言也不是直接翻译成 机器指令，而是翻译成汇编语言吗，如下面说的C和C++

![image-20200710085323733](http://minio.botuer.com/study-node/old/typora202208291519591.png)

- C、C++源程序执行过程

  - 编译过程又可以分成两个阶段：编译和汇编。

    - 编译过程：是读取源程序（字符流），对之进行词法和语法的分析，将高级语言指令转换为功能等效的汇编代码

    - 汇编过程：实际上指把汇编语言代码翻译成目标机器指令的过程。

![image-20200710085553258](http://minio.botuer.com/study-node/old/typora202208291519603.png)

- 字节码

  - 字节码是一种中间状态（中间码）的二进制代码（文件），它比机器码更抽象，需要直译器转译后才能成为机器码

  - 字节码主要为了实现特定软件运行和软件环境、与硬件环境无关。

  - 字节码的实现方式是通过编译器和虚拟机器。编译器将源码编译成字节码，特定平台上的虚拟机器将字节码转译为可以直接执行的指令。

  - 字节码典型的应用为：Java bytecode


### 解释器

- JVM设计者们的初衷仅仅只是单纯地为了满足Java程序实现跨平台特性，因此避免采用静态编译的方式直接生成本地机器指令，从而诞生了实现解释器在运行时采用逐行解释字节码执行程序的想法

- 为什么Java源文件不直接翻译成JMV，而是翻译成字节码文件？可能是因为直接翻译的代码是比较大的

- 解释器真正意义上所承担的角色就是一个运行时“翻译者”，将字节码文件中的内容“翻译”为对应平台的本地机器指令执行

- 当一条字节码指令被解释执行完成后，接着再根据PC寄存器中记录的下一条需要被执行的字节码指令执行解释操作

- 分类

  - 在Java的发展历史里，一共有两套解释执行器，即古老的**字节码解释器**、现在普遍使用的**模板解释器**
  - 字节码解释器在执行时通过纯软件代码模拟字节码的执行，效率非常低下
  - 而模板解释器将每一条字节码和一个模板函数相关联，模板函数中直接产生这条字节码执行时的机器码，从而很大程度上提高了解释器的性能
  - 在HotSpot VM中，解释器主要由Interpreter模块和Code模块构成。
    - Interpreter模块：实现了解释器的核心功能
    - Code模块：用于管理HotSpot VM在运行时生成的本地机器指令

- 现状

  - 由于解释器在设计和实现上非常简单，因此除了Java语言之外，还有许多高级语言同样也是基于解释器执行的，比如Python、Perl、Ruby等。但是在今天，基于解释器执行已经沦落为低效的代名词，并且时常被一些C/C++程序员所调侃

  - 为了解决这个问题，JVM平台支持一种叫作即时编译的技术。即时编译的目的是避免函数被解释执行，而是将整个函数体编译成为机器码，每次函数执行时，只执行编译后的机器码即可，这种方式可以使执行效率大幅度提升

  - 不过无论如何，基于解释器的执行模式仍然为中间语言的发展做出了不可磨灭的贡献

### JIT编译器

- Java代码的执行分类

  - 源代码  编译成  字节码文件，然后在运行时  通过解释器  将字节码文件转为  机器码执行

  - 编译执行（直接编译成机器码），现代虚拟机为了提高执行效率，会使用即时编译技术（JIT，Just In Time）将方法编译成机器码后再执行

- HotSpot VM是目前市面上高性能虚拟机的代表作之一。它采用解释器与即时编译器并存的架构。在Java虚拟机运行时，解释器和即时编译器能够相互协作，各自取长补短，尽力去选择最合适的方式来权衡编译本地代码的时间和直接解释执行代码的时间

- 问题来了

  - 有些开发人员会感觉到诧异，既然HotSpot VM中已经内置JIT编译器了，那么为什么还需要再使用解释器来“拖累”程序的执行性能呢？比如JRockit VM内部就不包含解释器，字节码全部都依靠即时编译器编译后执行

  - JRockit虚拟机是砍掉了解释器，也就是只采及时编译器。那是因为呢JRockit只部署在服务器上，一般已经有时间让他进行指令编译的过程了，对于响应来说要求不高，等及时编译器的编译完成后，就会提供更好的性能

  - 首先明确：
    - 当程序启动后，解释器可以马上发挥作用，省去编译的时间，立即执行；
    - 编译器要想发挥作用，把代码编译成本地代码，需要一定的执行时间。但编译为本地代码后，执行效率高

  - 所以：
    - 尽管JRockit VM中程序的执行性能会非常高效，但程序在启动时必然需要花费更长的时间来进行编译
    - 对于服务端应用来说，启动时间并非是关注重点，但对于那些看中启动时间的应用场景而言，或许就需要采用解释器与即时编译器并存的架构来换取一个平衡点

  - 在此模式下，当Java虚拟器启动时，解释器可以首先发挥作用，而不必等待即时编译器全部编译完成后再执行，这样可以省去许多不必要的编译时间。随着时间的推移，编译器发挥作用，把越来越多的代码编译成本地代码，获得更高的执行效率

  - 同时，解释执行在编译器进行激进优化不成立的时候，作为编译器的“逃生门”

- HotSpot JVM执行方式
  - 当虚拟机启动的时候，解释器可以首先发挥作用，而不必等待即时编译器全部编译完成再执行，这样可以省去许多不必要的编译时间。
  - 并且随着程序运行时间的推移，即时编译器逐渐发挥作用，根据热点探测功能，将有价值的字节码编译为本地机器指令，以换取更高的程序执行效率。

- 案例

  - 注意解释执行与编译执行在线上环境微妙的辩证关系。机器在热机状态可以承受的负载要大于冷机状态。如果以热机状态时的流量进行切流，可能使处于冷机状态的服务器因无法承载流量而假死。

  - 在生产环境发布过程中，以分批的方式进行发布，根据机器数量划分成多个批次，每个批次的机器数至多占到整个集群的1/8。曾经有这样的故障案例：某程序员在发布平台进行分批发布，在输入发布总批数时，误填写成分为两批发布。如果是热机状态，在正常情况下一半的机器可以勉强承载流量，但由于刚启动的JVM均是解释执行，还没有进行热点代码统计和JIT动态编译，导致机器启动之后，当前1/2发布成功的服务器马上全部宕机，此故障说明了JIT的存在。—阿里团队

![image-20200710095417462](http://minio.botuer.com/study-node/old/typora202208291618122.png)

- 概念解释

  - Java 语言的“编译期”其实是一段“不确定”的操作过程，因为它可能是指一个前端编译器（其实叫“编译器的前端”更准确一些）把.java文件转变成.class文件的过程；也可能是指虚拟机的后端运行期编译器（JIT编译器，Just In Time Compiler）把字节码转变成机器码的过程；还可能是指使用静态提前编译器（AOT编译器，Ahead of Time Compiler）直接把.java文件编译成本地机器代码的过程

  - 前端编译器：Sun的Javac、Eclipse JDT中的增量式编译器（ECJ）

  - JIT编译器：HotSpot VM的C1、C2编译器

  - AOT 编译器：GNU Compiler for the Java（GCJ）、Excelsior JET

- 热点探测技术

  - 一个被多次调用的方法，或者是一个方法体内部循环次数较多的循环体都可以被称之为“热点代码”，因此都可以通过JIT编译器编译为本地机器指令
  - 由于这种编译方式发生在方法的执行过程中，因此被称之为**栈上替换**，或简称为OSR（On Stack Replacement）编译

  - 一个方法究竟要被调用多少次，或者一个循环体究竟需要执行多少次循环才可以达到这个标准？必然需要一个明确的阈值，JIT编译器才会将这些“热点代码”编译为本地机器指令执行。这里主要依靠热点探测功能

  - 目前HotSpot VM所采用的热点探测方式是基于计数器的热点探测

    > 采用基于计数器的热点探测，HotSpot V将会为每一个方法都建立2个不同类型的计数器，分别为方法调用计数器（Invocation Counter）和回边计数器（Back Edge Counter）
    >
    > - 方法调用计数器用于统计方法的调用次数
    > - 回边计数器则用于统计循环体执行的循环次数

- 方法调用计数器

  - 这个计数器就用于统计方法被调用的次数
  - 它的默认阀值在Client模式下是1500次，在Server模式下是10000次。超过这个阈值，就会触发JIT编译

  - 这个阀值可以通过虚拟机参数 -XX:CompileThreshold 来人为设定

  - 当一个方法被调用时，会先检查该方法是否存在被JIT编译过的版本，如果存在，则优先使用编译后的本地代码来执行。如果不存在已被编译过的版本，则将此方法的调用计数器值加1，然后判断方法调用计数器与回边计数器值之和是否超过方法调用计数器的阀值。如果已超过阈值，那么将会向即时编译器提交一个该方法的代码编译请求。

![image-20200710101829934](http://minio.botuer.com/study-node/old/typora202208291618134.png)

- 热点衰减

  -  如果不做任何设置，方法调用计数器统计的并不是方法被调用的绝对次数，而是一个相对的执行频率，即一段时间之内方法被调用的次数。当超过一定的时间限度，如果方法的调用次数仍然不足以让它提交给即时编译器编译，那这个方法的调用计数器就会被减少一半，这个过程称为方法调用计数器热度的衰减（Counter Decay），而这段时间就称为此方法统计的半衰周期（Counter Half Life Time）

  - 半衰周期是化学中的概念，比如出土的文物通过查看C60来获得文物的年龄

  - 进行热度衰减的动作是在虚拟机进行垃圾收集时顺便进行的，可以使用虚拟机参数
    -XX:-UseCounterDecay 来关闭热度衰减，让方法计数器统计方法调用的绝对次数，这样，只要系统运行时间足够长，绝大部分方法都会被编译成本地代码。

  - 另外，可以使用-XX:CounterHalfLifeTime参数设置半衰周期的时间，单位是秒。

- 回边计数器
  - 它的作用是统计一个方法中循环体代码执行的次数，在字节码中遇到控制流向后跳转的指令称为“回边”（Back Edge）。显然，建立回边计数器统计的目的就是为了触发OSR编译。

![image-20200710103103869](http://minio.botuer.com/study-node/old/typora202208291618133.png)

- HotSpotVM 可以设置程序执行方法

  - 缺省情况下HotSpot VM是采用解释器与即时编译器并存的架构，当然开发人员可以根据具体的应用场景，通过命令显式地为Java虚拟机指定在运行时到底是完全采用解释器执行，还是完全采用即时编译器执行。如下所示：

    - -Xint：完全采用解释器模式执行程序；

    - -Xcomp：完全采用即时编译器模式执行程序。如果即时编译出现问题，解释器会介入执行

    - -Xmixed：采用解释器+即时编译器的混合模式共同执行程序。


![image-20200710103340273](http://minio.botuer.com/study-node/old/typora202208291618135.png)



- HotSpotVM中 JIT 分类

  > JIT的编译器还分为了两种，分别是C1和C2，在HotSpot VM中内嵌有两个JIT编译器，分别为Client Compiler和Server Compiler，但大多数情况下我们简称为C1编译器 和 C2编译器。开发人员可以通过如下命令显式指定Java虚拟机在运行时到底使用哪一种即时编译器，如下所示：

  - -client：指定Java虚拟机运行在Client模式下，并使用C1编译器；
    - C1编译器会对字节码进行简单和可靠的优化，耗时短。以达到更快的编译速度。


  - -server：指定Java虚拟机运行在server模式下，并使用C2编译器。
    - C2进行耗时较长的优化，以及激进优化。但优化的代码执行效率更高。（使用C++）

- C1 和 C2编译器不同的优化策略

  - 在不同的编译器上有不同的优化策略，C1编译器上主要有方法内联，去虚拟化、元余消除

    - 方法内联：将引用的函数代码编译到引用点处，这样可以减少栈帧的生成，减少参数传递以及跳转过程

    - 方法内联：对唯一的实现樊进行内联

    - 冗余消除：在运行期间把一些不会执行的代码折叠掉


  - C2的优化主要是在全局层面，逃逸分析是优化的基础。基于逃逸分析在C2上有如下几种优化：

    - 标量替换：用标量值代替聚合对象的属性值

    - 栈上分配：对于未逃逸的对象分配对象在栈而不是堆

    - 同步消除：清除同步操作，通常指synchronized


- 分层编译策略

  - 分层编译（Tiered Compilation）策略：程序解释执行（不开启性能监控）可以触发C1编译，将字节码编译成机器码，可以进行简单优化，也可以加上性能监控，C2编译会根据性能监控信息进行激进优化。

  - 不过在Java7版本之后，一旦开发人员在程序中显式指定命令“-server"时，默认将会开启分层编译策略，由C1编译器和C2编译器相互协作共同来执行编译任务。

  - 一般来讲，JIT编译出来的机器码性能比解释器高

  - C2编译器启动时长比C1慢，系统稳定执行以后，C2编译器执行速度远快于C1编译器


- Graal编译器

  - **是JIT的一种**，在Graal虚拟机中应用（一种未来可期的java虚拟机）
  - 自JDK10起，HotSpot又加入了一个全新的及时编译器：Graal编译器

  - 编译效果短短几年时间就追评了G2编译器，未来可期

  - 目前，带着实验状态标签，需要使用开关参数去激活才能使用

    ```
    -XX:+UnlockExperimentalvMOptions -XX:+UseJVMCICompiler
    ```


- AOT编译器

  - **和JIT是并列**的概念
  - jdk9引入了AOT编译器（静态提前编译器，Ahead of Time Compiler）

  - Java 9引入了实验性AOT编译工具jaotc。它借助了Graal编译器，将所输入的Java类文件转换为机器码，并存放至生成的动态共享库之中

  - 所谓AOT编译，是与即时编译相对立的一个概念。我们知道，即时编译指的是在程序的运行过程中，将字节码转换为可在硬件上直接运行的机器码，并部署至托管环境中的过程。而AOT编译指的则是，在程序运行之前，便将字节码转换为机器码的过程

    ```
    .java -> .class -> (使用jaotc) -> .so
    ```

  - 最大的好处：Java虚拟机加载已经预编译成二进制库，可以直接执行。不必等待及时编译器的预热，减少Java应用给人带来“第一次运行慢” 的不良体验

  - 缺点

    - 破坏了 java  “ 一次编译，到处运行”，必须为每个不同的硬件，OS编译对应的发行包

    - 降低了Java链接过程的动态性，加载的代码在编译器就必须全部已知

    - 还需要继续优化中，最初只支持Linux X64 java base

## 4本地方法接口

### 本地方法

个Native Methodt是一个Java调用非Java代码的接囗。一个Native Method是这样一个Java方法：该方法的实现由非Java语言实现，比如C。这个特征并非Java所特有，很多其它的编程语言都有这一机制，比如在C++中，你可以用extern "c" 告知c++编译器去调用一个c的函数。

"A native method is a Java method whose implementation is provided by non-java code."（本地方法是一个非Java的方法，它的具体实现是非Java代码的实现）

在定义一个native method时，并不提供实现体（有些像定义一个Java interface），因为其实现体是由非java语言在外面实现的。

本地接口的作用是融合不同的编程语言为Java所用，它的初衷是融合C/C++程序。

需要注意的是：标识符native可以与其它java标识符连用，但是abstract除外

![image-20200706164139252](http://minio.botuer.com/study-node/old/typora202208191637925.png)

### 为什么使用Native Method？

Java使用起来非常方便，然而有些层次的任务用Java实现起来不容易，或者我们对程序的效率很在意时，问题就来了。

#### 与Java环境的交互

有时Java应用需要与Java外面的环境交互，这是本地方法存在的主要原因。你可以想想Java需要与一些底层系统，如操作系统或某些硬件交换信息时的情况。本地方法正是这样一种交流机制：它为我们提供了一个非常简洁的接口，而且我们无需去了解Java应用之外的繁琐的细节。

#### 与操作系统的交互

- 操作系统底层是C、C++实现的

JVM支持着Java语言本身和运行时库，它是Java程序赖以生存的平台，它由一个解释器（解释字节码）和一些连接到本地代码的库组成。然而不管怎样，它毕竟不是一个完整的系统，它经常依赖于一底层系统的支持。这些底层系统常常是强大的操作系统。通过使用本地方法，我们得以用Java实现了jre的与底层系统的交互，甚至JVM的一些部分就是用c写的。还有，如果我们要使用一些Java语言本身没有提供封装的操作系统的特性时，我们也需要使用本地方法。

#### Sun's Java

- Sun的解释器是用C实现的

这使得它能像一些普通的C一样与外部交互。jre大部分是用Java实现的，它也通过一些本地方法与外界交互。例如：类java.lang.Thread的setpriority（）方法是用Java实现的，但是它实现调用的是该类里的本地方法setpriorityo（）。这个本地方法是用C实现的，并被植入JVM内部，在Windows 95的平台上，这个本地方法最终将调用Win32 setpriority（）ApI。这是一个本地方法的具体实现由JVM直接提供，更多的情况是本地方法由外部的动态链接库（external dynamic link library）提供，然后被JVw调用。

### 现状

目前该方法使用的越来越少了，除非是与硬件有关的应用，比如通过Java程序驱动打印机或者Java系统管理生产设备，在企业级应用中已经比较少见。因为现在的异构领域间的通信很发达，比如可以使用Socket通信，也可以使用Web Service等等，不多做介绍

## StringTable

### 版本变化

- 位置

  - jdk7中将StringTable放到了堆空间中


  > 因为永久代的回收效率很低，在full gc的时候才会触发。而full gc是老年代的空间不足、永久代不足时才会触发，这就导致stringTable回收效率不高。而我们开发中会有大量的字符串被创建，回收效率低，导致永久代内存不足。放到堆里，能及时回收内存

- 底层数组

  - string在jdk8及以前内部定义了final char[] value用于存储字符串数据

  - JDK9时改为byte[]，同时基于String的数据结构，例如StringBuffer和StringBuilder也同样做了修改


  > String类的当前实现将字符存储在char数组中，每个字符使用两个字节(16位)。从许多不同的应用程序收集的数据表明
  >
  > - 字符串是堆使用的主要组成部分
  > - 大多数字符串对象只包含拉丁字符。这些字符只需要一个字节的存储空间，因此这些字符串对象的内部char数组中有一半的空间将不会使用
  >
  > 我们建议改变字符串的内部表示class从utf - 16字符数组到字节数组加一个encoding-flag字段。新的String类将根据字符串的内容存储编码为ISO-8859-1/Latin-1(每个字符一个字节)或UTF-16(每个字符两个字节)的字符。编码标志将指示使用哪种编码
  >
  > **结论：String再也不用char[] 来存储了，改成了byte [] 加上编码标记，节约了一些空间**

- 常量池大小

  - String的string Pool是一个固定大小的Hashtable，默认值大小长度是1009。如果放进string Pool的string非常多，就会造成Hash冲突严重，从而导致链表会很长，而链表长了后直接会造成的影响就是当调用string.intern时性能会大幅下降
    - 使用-XX:StringTablesize可设置stringTable的长度
    - 在jdk6中stringTable是固定的，就是1009的长度，所以如果常量池中的字符串过多就会导致效率下降很快。stringTablesize设置没有要求
    - 在jdk7中，stringTable的长度默认值是60013
    - 在JDK8中，StringTable可以设置的**最小值为1009**

- intern()的返回地址


### 不可变性

![image-20220906165342434](http://minio.botuer.com/study-node/old/typora202209061653650.png)

### 字符串拼接

- 常量与常量的拼接结果在常量池，直接指向常量池，原理是**编译期优化**

- 只要其中有一个是变量，结果就在堆中，相当于在堆空间中new String()，变量拼接的原理是**StringBuilder**

- **intern()方法，返回常量池中的地址（没有就创建一个String对象）**

- 底层原理

  - 拼接操作的底层其实使用了StringBuilder

    ![image-20200711102231129](http://minio.botuer.com/study-node/old/typora202209061708659.png)

    ```java
    //s1 + s2的执行细节
    StringBuilder s = new StringBuilder();
    s.append(s1);
    s.append(s2);
    s.toString();  //-> 类似于new String("ab");
    ```

  - 在JDK5之后，使用的是StringBuilder，在JDK5之前使用的是StringBuffer

  - 加号左右两边如果是变量的话，就是需要new StringBuilder进行拼接，但是如果使用的是final修饰，则是从常量池中获取（常量拼接--编译期优化）

  - **在开发中，能够使用final的时候，建议使用上**

    ```java
    public static void test4() {
        final String s1 = "a";
        final String s2 = "b";
        String s3 = "ab";
        String s4 = s1 + s2;
        System.out.println(s3 == s4);	//true
    }
    ```

- 拼接与append性能对比

  - 通过StringBuilder的append()方式添加字符串的效率，要远远高于String的字符串拼接方法

  - StringBuilder的append的方式，自始至终只创建一个StringBuilder的对象
  - 对于字符串拼接的方式，还需要创建很多StringBuilder对象和调用toString时候创建的String对象
  - 内存中由于创建了较多的StringBuilder和String对象，内存占用过大，如果进行GC那么将会耗费更多的时间

  - 我们使用的是**StringBuilder的空参构造器，默认的字符串容量是16**，然后将原来的字符串拷贝到新的字符串中， 我们也可以默认初始化更大的长度，减少扩容的次数
  - 因此在实际开发中，我们能够确定，前前后后需要添加的字符串不高于某个限定值，那么建议**使用构造器创建一个阈值的长度**

  ```java
      public static void method1(int highLevel) {
          String src = "";
          for (int i = 0; i < highLevel; i++) {
              src += "a"; // 每次循环都会创建一个StringBuilder对象
          }
      }
  
      public static void method2(int highLevel) {
          StringBuilder sb = new StringBuilder();
          for (int i = 0; i < highLevel; i++) {
              sb.append("a");
          }
      }
  ```


### intern()

- intern是一个native方法，调用的是底层C的方法

- 字符串池最初是空的，由String类私有地维护。在调用intern方法时，如果池中已经包含了由equals(object)方法确定的与该字符串对象相等的字符串，则返回池中的字符串。否则，该字符串对象将被添加到池中，并返回对该字符串对象的引用。

- 如果不是用双引号声明的string对象，可以使用string提供的intern方法：intern方法会从字符串常量池中查询当前字符串是否存在，若不存在就会将当前字符串放入常量池中。

- 在任意字符串上调用string.intern方法，其返回结果所指向的那个类实例，必须和直接以常量形式出现的字符串实例完全相同。因此，下列表达式的值必定是true

  ```java
  （"a"+"b"+"c"）.intern（）=="abc"
  ```

- Interned string就是确保字符串在内存里只有一份拷贝，这样可以节约内存空间，加快字符串操作任务的执行速度。注意，这个值会被存放在字符串内部池（String Intern Pool）

- 空间效率测试

  ```java
  public class StringIntern2 {
      static final int MAX_COUNT = 1000 * 10000;
      static final String[] arr = new String[MAX_COUNT];
  
      public static void main(String[] args) {
          Integer [] data = new Integer[]{1,2,3,4,5,6,7,8,9,10};
          long start = System.currentTimeMillis();
          for (int i = 0; i < MAX_COUNT; i++) {
              arr[i] = new String(String.valueOf(data[i%data.length])).intern();
          }
          long end = System.currentTimeMillis();
          System.out.println("花费的时间为：" + (end - start));
  
          try {
              Thread.sleep(1000000);
          } catch (Exception e) {
              e.getStackTrace();
          }
      }
  }
  ```

  - 对于程序中大量使用存在的字符串时，尤其存在很多已经重复的字符串时，使用intern()方法能够节省内存空间

  - 大的网站平台，需要内存中存储大量的字符串。比如社交网站，很多人都存储：北京市、海淀区等信息。这时候如果字符串都调用intern() 方法，就会很明显降低内存的大小

- 面试题

  - new String("ab")会创建几个对象

    ```java
    public class StringNewTest {
        public static void main(String[] args) {
            String str = new String("ab");
        }
    }
    ```

    ```sh
     #字节码文件
     
     0 new #2 <java/lang/String>
     3 dup
     4 ldc #3 <ab>
     6 invokespecial #4 <java/lang/String.<init>>
     9 astore_1
    10 return
    ```

    - 这里面就是两个对象

      - 一个对象是：new关键字在堆空间中创建

      - 另一个对象：字符串常量池中的对象


  - new String("a") + new String("b") 会创建几个对象

    ```java
    public class StringNewTest {
        public static void main(String[] args) {
            String str = new String("a") + new String("b");
        }
    }
    ```

    ```sh
     #字节码文件
     
     0 new #2 <java/lang/StringBuilder>
     3 dup
     4 invokespecial #3 <java/lang/StringBuilder.<init>>
     7 new #4 <java/lang/String>
    10 dup
    11 ldc #5 <a>
    13 invokespecial #6 <java/lang/String.<init>>
    16 invokevirtual #7 <java/lang/StringBuilder.append>
    19 new #4 <java/lang/String>
    22 dup
    23 ldc #8 <b>
    25 invokespecial #6 <java/lang/String.<init>>
    28 invokevirtual #7 <java/lang/StringBuilder.append>
    31 invokevirtual #9 <java/lang/StringBuilder.toString>
    34 astore_1
    35 return
    ```

    - 创建了6个对象

      - 对象1：new StringBuilder()

      - 对象2：new String("a")
      - 对象3：常量池的 ldc a
      - 对象4：new String("b")

      - 对象5：常量池的 ldc b

      - 对象6：toString中会创建一个 new String("ab")
        - **调用toString方法，不会在常量池中生成ab**

- intern的使用：JDK6和JDK7

  - JDK6中

    ```java
    String s = new String("1");
    s.intern(); // 无任何作用，除非返回值被接收
    //s1 = s.intern(); 
    String s2 = "1";
    System.out.println(s == s2); // false
    //System.out.println(s1 == s2); // true
    
    String s3 = new String("1") + new String("1");
    s3.intern();
    String s4 = "11";
    System.out.println(s3 == s4); // false
    ```

  - JDK7中

    ```java
    String s = new String("1");
    s.intern();
    String s2 = "1";
    System.out.println(s == s2); // false
    
    String s3 = new String("1") + new String("1");
    s3.intern();
    String s4 = "11";		//在JDK7中，并没有创新一个新对象，而是指向常量池中的新对象
    System.out.println(s3 == s4); // true
    ```

    ![image-20220907100718891](http://minio.botuer.com/study-node/old/typora202209071007061.png)

  - 扩展

    ```java
    String s3 = new String("1") + new String("1");
    String s4 = "11";
    s3.intern();
    System.out.println(s3 == s4);	//jdk6 false ; jdk7 true
    ```

    ```java
    String s4 = "11";
    String s3 = new String("1") + new String("1");
    s3.intern();
    System.out.println(s3 == s4);	//jdk6 false ; jdk7 false
    ```

  - intern()总结

    - jdk6

      - 常量池中有，仅返回常量池中对象的地址
      - 常量池中无，对象复制一份，在常量池中创建一个对象，返回常量池中对象的地址

    - jdk7

      - 常量池中有，仅返回常量池中对象的地址

        > 可能是字面量产生的 
        >
        > - 先有字面量，后有变量拼接 ---- false
        >
        > - 先有变量拼接，后有字面量 ---- true
        >
        > 可能是intern()产生的
        >
        > - 变量拼接后调用 ---- true
        > - 字面量拼接后调用 ---- false

      - 常量池中无，地址复制一份，在常量池中引用这个地址，返回常量池中对象的地址

### 垃圾回收

- G1中的String去重操作
  - 注意这里说的重复，指的是在堆中的数据，而不是常量池中的，因为常量池中的本身就不会重复

- 背景：对许多Java应用（有大的也有小的）做的测试得出以下结果：

  - 堆存活数据集合里面string对象占了25%

  - 堆存活数据集合里面重复的string对象有13.5%


  - string对象的平均长度是45


- 许多大规模的Java应用的瓶颈在于内存，测试表明，在这些类型的应用里面，Java堆中存活的数据集合差不多25%是string对象。更进一步，这里面差不多一半string对象是重复的，重复的意思是说：
  stringl.equals（string2）= true。堆上存在重复的string对象必然是一种内存的浪费。这个项目将在G1垃圾收集器中实现自动持续对重复的string对象进行去重，这样就能避免浪费内存。

- 实现

  - 当垃圾收集器工作的时候，会访问堆上存活的对象。对每一个访问的对象都会检查是否是候选的要去重的string对象

  - 如果是，把这个对象的一个引用插入到队列中等待后续的处理。一个去重的线程在后台运行，处理这个队列。处理队列的一个元素意味着从队列删除这个元素，然后尝试去重它引用的string对象。

  - 使用一个hashtable来记录所有的被string对象使用的不重复的char数组。当去重的时候，会查这个hashtable，来看堆上是否已经存在一个一模一样的char数组。

  - 如果存在，string对象会被调整引用那个数组，释放对原来的数组的引用，最终会被垃圾收集器回收掉。

  - 如果查找失败，char数组会被插入到hashtable，这样以后的时候就可以共享这个数组了。


- 开启

  - 命令行选项

    > UsestringDeduplication（bool）：开启string去重，默认是不开启的，需要手动开启
    > Printstringbeduplicationstatistics（bool）：打印详细的去重统计信息
    > stringpeduplicationAgeThreshold（uintx）：达到这个年龄的string对象被认为是去重的候选对象

## 垃圾回收

### 概述

- Java 和 C++语言的区别，就在于垃圾收集技术和内存动态分配上

  C语言没有垃圾收集技术，需要我们手动的收集

- 什么是垃圾

  > 在运行程序中没有任何指针指向的对象，这个对象就是需要被回收的垃圾

- 为什么回收垃圾

  > 如果不进行垃圾回收，内存迟早都会被消耗完
  >
  > 垃圾回收不仅释放没用的对象，还清除内存里的记录碎片
  >
  > - 碎片整理将所占用的堆内存移到堆的一端，以便JVM将整理出的内存分配给新的对象。

- 随着应用程序所应付的业务越来越庞大、复杂，用户越来越多，没有GC就不能保证应用程序的正常进行，而经常造成STW的GC又跟不上实际的需求，所以才会不断地尝试对GC进行优化

- 早期垃圾回收

  - 在早期的C/C++时代，垃圾回收基本上是手工进行的。开发人员可以使用new关键字进行内存申请，并使用delete关键字进行内存释放。比如以下代码：

    ```c++
    MibBridge pBridge = new cmBaseGroupBridge();
    //如果注册失败，使用Delete释放该对象所占内存区域
    if(pBridge -> Register(kDestroy)!= NO ERROR)
    	delete pBridge;
    ```


  - 这种方式可以灵活控制内存释放的时间，但是会给开发人员带来频繁申请和释放内存的管理负担。倘若有一处内存区间由于程序员编码的问题忘记被回收，那么就会产生内存泄漏，垃圾对象永远无法被清除，随着系统运行时间的不断增长，垃圾对象所耗内存可能持续上升，直到出现内存溢出并造成应用程序崩溃。 

  - 有了垃圾回收机制后，上述代码极有可能变成这样

    ```c++
    MibBridge pBridge = new cmBaseGroupBridge(); 
    pBridge -> Register(kDestroy);
    ```

  - 现在，除了Java以外，C#、Python、Ruby等语言都使用了自动垃圾回收的思想，也是未来发展趋势，可以说这种自动化的内存分配和来及回收方式已经成为了线代开发语言必备的标准

- java的垃圾回收

  - 优点

    - 自动内存管理，无需开发人员手动参与内存的分配与回收，这样降低内存泄漏和内存溢出的风险

    - 自动内存管理机制，将程序员从繁重的内存管理中释放出来，可以更专心地专注于业务开发

  - 垃圾收集器可以对年轻代回收，也可以对老年代回收，甚至是全栈和方法区的回收

    - Java堆是垃圾收集器的工作重点

      > 频繁收集Young区
      >
      > 较少收集Old区
      >
      > 基本不收集Perm区（元空间）

### 相关算法

#### 标记阶段

- 在堆里存放着几乎所有的Java对象实例，在GC执行垃圾回收之前，首先需要区分出内存中哪些是存活对象，哪些是已经死亡的对象。只有被标记为己经死亡的对象，GC才会在执行垃圾回收时，释放掉其所占用的内存空间，因此这个过程我们可以称为垃圾标记阶段。

- 判断对象存活一般有两种方式：**引用计数算法**和**可达性分析算法。**

##### 引用计数算法

- 引用计数算法（Reference Counting）比较简单，对每个对象保存一个整型的引用计数器属性。用于记录对象被引用的情况

- 对于一个对象A，只要有任何一个对象引用了A，则A的引用计数器就加1；当引用失效时，引用计数器就减1，只要对象A的引用计数器的值为0，即表示对象A不可能再被使用，可进行回收

- 优点：实现简单，垃圾对象便于辨识；判定效率高，回收没有延迟性。

- 缺点

  - 需要单独的字段存储计数器，这样的做法增加了存储空间的开销

  - 每次赋值都需要更新计数器，伴随着加法和减法操作，这增加了时间开销
  - 引用计数器有一个严重的问题，即**无法处理循环引用**的情况。这是一条致命缺陷，导致在Java的垃圾回收器中没有使用这类算法

- 循环引用

  - 当p的指针断开的时候，内部的引用形成一个循环，这就是循环引用，从而造成内存泄漏

    ![image-20200712102205795](http://minio.botuer.com/study-node/old/typora202209071624448.png)

- 引用计数算法，是很多语言的资源回收选择，例如的Python，同时支持引用计数和垃圾收集机制

  - 具体哪种最优是要看场景的，业界有大规模实践中仅保留引用计数机制，以提高吞吐量的尝试

  - Java并没有选择引用计数，是因为其存在一个基本的难题，也就是很难处理循环引用关系

  - Python如何解决循环引用？

    > 手动解除：很好理解，就是在合适的时机，解除引用关系
    > 使用弱引用weakref，weakref是Python提供的标准库，旨在解决循环引用

##### 可达性分析算法

- 又叫 根搜索算法、追踪性垃圾收集
- 相对于引用计数算法而言，可达性分析算法不仅同样具备实现简单和执行高效等特点，更重要的是该算法可以有效地解决在引用计数算法中循环引用的问题，防止内存泄漏的发生
- 相较于引用计数算法，这里的可达性分析就是Java、C#选择的，这种类型的垃圾收集通常也叫作追踪性垃圾收集（Tracing Garbage Collection）
- GCRoot --- "GCRoots”根集合就是一组必须活跃的引用
  - 根对象集合（GCRoots）为起始点，按照从上至下的方式搜索被根对象集合所连接的目标对象是否可达
  - 内存中的存活对象都会被根对象集合直接或间接连接着，搜索所走过的路径称为引用链（Reference Chain）
  - 没有任何引用链相连，则是不可达的，就意味着该对象己经死亡，可以标记为垃圾对象
  - GCRoot包括
    - 堆外结构（ 虚拟机栈、本地方法栈、方法区、字符串常量池 等）对堆内对象的引用
      - 虚拟机栈中引用的对象 --- 局部变量表中的参数、局部变量等
      - 本地方法栈内JNI（通常说的本地方法）引用的对象方法区中类**静态属性引用的对象** --- 静态变量
      - 方法区中常量引用 --- 字符串常量池中的引用
      - 被同步锁synchronized持有的对象
      - Java虚拟机内部的引用
        - 基本数据类型对应的Class对象
        - 常驻的异常对象（如：NullPointerException、outofMemoryError）
        - 系统类加载器
      - 反映java虚拟机内部情况的JMXBean、JVMTI中注册的回调、本地代码缓存等
    - 分代收集、局部回收时，被回收的区域之外的空间对被回收区域内对象的引用
      - 新生代被回收，老年代的对象可能是GCRoot
  - 判断内存是否可回收，必须在一致性的快照中进行，就必须STW

##### finalization机制

- 对象终止（finalization）机制来允许开发人员提供对象被销毁之前的自定义处理逻辑
- 垃圾回收此对象之前，总会先调用这个对象的finalize()方法
- 重写finalize() ，用于在对象被回收时进行资源释放。通常在这个方法中进行一些资源释放和清理的工作，比如关闭文件、套接字和数据库连接等
- 永远不要主动调用某个对象的finalize（）方法，应该交给垃圾回收机制调用
  - 可能会导致对象复活 --- 重新被引用 （obj=null，在重写的finalize中obj=this）
  - 优先级比较低，即使主动调用该方法，也不会因此就直接进行回收，方法的执行时间是没有保障的，不发生GC，则finalize（）方法将没有执行机会
  - 一个糟糕的finalize（）会严重影响Gc的性能
- 对象的三种状态
  - 可触及的：从根节点开始，可以到达这个对象
  - 可复活的：对象的所有引用都被释放，但是对象有可能在finalize（）中复活
  - 不可触及的：对象的finalize（）被调用，并且没有复活，那么就会进入不可触及状态。不可触及的对象不可能被复活，因为**finalize()只会被调用一次**

##### 标记过程

- 是否可回收，至少要经历两次标记过程

  - 对象obj到GC Roots没有引用链，则进行第一次标记
  - 进行筛选，判断此对象是否有必要执行finalize（）方法
    - 没有重写finalize（）方法，或者finalize（）方法已经被虚拟机调用过，则虚拟机视为“没有必要执行”，obj被判定为不可触及的
    - 重写了finalize（）方法，且还未执行过，那么obj会被插入到F-Queue队列中，由一个虚拟机自动创建的、低优先级的Finalizer线程触发其finalize（）方法执行
  - finalize（）方法是对象逃脱死亡的最后机会，稍后GC会对F-Queue队列中的对象进行第二次标记
    - 如果objA在finalize（）方法中与引用链上的任何一个对象建立了联系，那么在第二次标记时，objA会被移出“即将回收”集合
    - 之后，对象会再次出现没有引用存在的情况，finalize方法不会被再次调用，对象会直接变成不可触及的状态

  ```java
  public class CanReliveObj {
      // 类变量，属于GC Roots的一部分
      public static CanReliveObj canReliveObj;
  
      @Override
      protected void finalize() throws Throwable {
          super.finalize();
          System.out.println("调用当前类重写的finalize()方法");
          canReliveObj = this;		//重写引用，对象被复活
      }
  
      public static void main(String[] args) throws InterruptedException {
          canReliveObj = new CanReliveObj();
          canReliveObj = null;
          System.gc();
          System.out.println("-----------------第一次gc操作------------");
          // 因为Finalizer线程的优先级比较低，暂停2秒，以等待它
          Thread.sleep(2000);
          if (canReliveObj == null) {
              System.out.println("obj is dead");
          } else {
              System.out.println("obj is still alive");
          }
  
          System.out.println("-----------------第二次gc操作------------");
          canReliveObj = null;
          System.gc();
          // 下面代码和上面代码是一样的，但是 canReliveObj却自救失败了
          Thread.sleep(2000);
          if (canReliveObj == null) {
              System.out.println("obj is dead");
          } else {
              System.out.println("obj is still alive");
          }
  
      }
  }
  /*运行结果
  -----------------第一次gc操作------------
  调用当前类重写的finalize()方法
  obj is still alive
  -----------------第二次gc操作------------
  obj is dead
  */
  ```

MAT与JProfiler的GC Roots溯源

- MAT是Memory Analyzer的简称，它是一款功能强大的Java堆内存分析器。用于查找内存泄漏以及查看内存消耗情况

- MAT是基于Eclipse开发的，是一款免费的性能分析工具

- 下载地址http://www.eclipse.org/mat/

- 命令行使用 jmap获取dump文件

  ```sh
  Jps		#获取进程号
  
  jmap -dump:format=b,live,file=test1.bin 进程号
  ```

- 使用JVisualVM获取dump

  - 捕获的heap dump文件是一个临时文件，关闭JVisualVM后自动删除，若要保留，需要将其另存为文件
  - 在左侧“Application"（应用程序）子窗口中右击相应的应用程序，选择Heap Dump（堆Dump）
  - 在Monitor（监视）子标签页中点击Heap Dump（堆Dump）按钮
  - 本地应用程序的Heap dumps作为应用程序标签页的一个子标签页打开。同时，heap dump在左侧的Application（应用程序）栏中对应一个含有时间戳的节点
  - 右击这个节点选择save as（另存为）即可将heap dump保存到本地

- 使用MAT打开Dump文件，打开后，我们就可以看到有哪些可以作为GC Roots的对象

- 使用JProfiler查找某个对象的GCRoot链路

  ![image-20220909164221405](http://minio.botuer.com/study-node/old/typora202209091642631.png)

- dump判断什么原因造成OOM

  ```java
  public class HeapOOM {
      // 创建1M的文件
      byte [] buffer = new byte[1 * 1024 * 1024];
  
      public static void main(String[] args) {
          ArrayList<HeapOOM> list = new ArrayList<>();
          int count = 0;
          try {
              while (true) {
                  list.add(new HeapOOM());
                  count++;
              }
          } catch (Exception e) {
              e.getStackTrace();
              System.out.println("count:" + count);
          }
      }
  }
  ```

  - 使用HeapDumpOnOutOfMemoryError将出错时候的dump文件输出

    ```sh
    -Xms8m -Xmx8m -XX:HeapDumpOnOutOfMemoryError  #测试时限制下内存
    ```

  - 我们将生成的dump文件打开，然后点击Biggest Objects就能够看到超大对象

    ![image-20220909164521131](http://minio.botuer.com/study-node/old/typora202209091645301.png)

  - 然后我们通过线程，还能够定位到哪里出现OOM

    ![image-20220909164547270](http://minio.botuer.com/study-node/old/typora202209091645438.png)

#### 清除阶段

##### 标记清除算法

- 执行过程

  - 标记：Collector从引用根节点开始遍历，标记所有被引用的对象

    > 一般是在对象的Header中记录为可达对象
    >
    > 标记的是引用的对象，不是垃圾

  - 清除：Collector对堆内存从头到尾进行线性的遍历，如果发现某个对象在其Header中没有标记为可达对象，则将其回收

    > 这里所谓的清除并不是真的置空，而是把需要清除的对象地址保存在空闲的地址列表里。下次有新对象需要加载时，判断垃圾的位置空间是否够，如果够，就存放覆盖原有的地址
    >
    > 关于空闲列表是在为对象分配内存的时候 提过
    >
    > - 如果内存规整
    >   - 采用指针碰撞的方式进行内存分配
    > - 如果内存不规整
    >   - 虚拟机需要维护一个列表
    >   - 空闲列表分配

- 缺点

  - 标记清除算法的效率不算高
  - 在进行GC的时候，需要停止整个应用程序，用户体验较差
  - 这种方式清理出来的空闲内存是不连续的，产生内碎片，需要维护一个空闲列表

##### 复制算法

- 执行过程
  - **无标记阶段**
  - 将活着的内存空间分为两块，每次只使用其中一块
  - 在垃圾回收时将正在使用的内存中的存活对象复制到未被使用的内存块中
  - 之后清除正在使用的内存块中的所有对象
  - 交换两个内存的角色，最后完成垃圾回收

- 优点
  - 没有标记和清除过程，实现简单，运行高效
  - 复制过去以后保证空间的连续性，不会出现“碎片”问题。

- 缺点
  - 此算法的缺点也是很明显的，就是需要两倍的内存空间。
  - 对于G1这种分拆成为大量region的GC，复制而不是移动，意味着GC需要维护region之间对象引用关系，不管是内存占用或者时间开销也不小

- 如果系统中的垃圾对象很多，复制算法需要复制的存活对象数量并不会太大，或者说非常低才行

  > 老年代大量的对象存活，那么复制的对象将会有很多，效率会很低
  >
  > 在新生代，对常规应用的垃圾回收，一次通常可以回收70% - 99% 的内存空间。回收性价比很高。所以现在的商业虚拟机都是用**复制算法 回收新生代**

##### 标记压缩算法

- 又叫标记整理算法

- 执行过程

  - 标记：同标记清除算法
  - 将所有的存活对象压缩到内存的一端，按顺序排放。之后，清理边界外所有的空间

- 与标记清除的区别

  - 标记-压缩算法的最终效果等同于标记-清除算法执行完成后，再进行一次内存碎片整理，因此，也可以把它称为标记-清除-压缩（Mark-Sweep-Compact）算法
  - 本质差异在于标记-清除算法是一种非移动式的回收算法，标记-压缩是移动式的
  - 是否移动回收后的存活对象是一项优缺点并存的风险决策
  - 可以看到，标记的存活对象将会被整理，按照内存地址依次排列，而未被标记的内存会被清理掉。如此一来，当我们需要给新对象分配内存时，JVM只需要持有一个内存的起始地址即可，这比维护一个空闲列表显然少了许多开销

- 优点

  - 相较于标记清除算法，整理碎片
  - 相较于复制算法，减少内存开销

- 缺点

  - 从效率上来说，标记-整理算法要低于复制算法。

  - 移动对象的同时，如果对象被其他对象引用，则还需要调整引用的地址

    > 因为jvm采用的是直接指针访问，而不是句柄访问

  - 移动过程中，需要全程暂停用户应用程序。即：STW

- 对比

  |              | 标记清除           | 标记压缩         | 复制                                  |
  | ------------ | ------------------ | ---------------- | ------------------------------------- |
  | **速率**     | 中等               | 最慢             | 最快                                  |
  | **空间开销** | 少（但会堆积碎片） | 少（不堆积碎片） | 通常需要活对象的2倍空间（不堆积碎片） |
  | **移动对象** | 否                 | 是               | 是                                    |

##### 分代收集算法

- 背景

  - 没有一种算法可以完全替代其他算法，它们都具有自己独特的优势和特点

  - 不同的对象的生命周期不一样，可以采取不同的收集方式，以便提高回收效率

- 年轻代（Young Gen）

  - 年轻代特点：区域相对老年代较小，对象生命周期短、存活率低，回收频繁

    > 这种情况复制算法的回收整理，速度是最快的。复制算法的效率只和当前存活对象大小有关，因此很适用于年轻代的回收。而复制算法内存利用率不高的问题，通过hotspot中的两个survivor的设计得到缓解

  - 老年代特点：区域较大，对象生命周期长、存活率高，回收不及年轻代频繁

    > 这种情况存在大量存活率高的对象，复制算法明显变得不合适。一般是由标记-清除或者是标记-清除与标记-压缩的混合实现
    >
    > - Mark（标记）阶段的开销  与存活对象的数量成正比
    > - Sweep（清除）阶段的开销  与所管理区域的大小成正相关
    > - compact（压缩）阶段的开销  与存活对象的数据成正比

##### 增量收集算法

- 背景
  - 解决STW时间久的问题
- 执行过程
  - 垃圾收集线程和应用程序线程交替执行
  - 每次，垃圾收集线程只收集一小片区域的内存空间，接着切换到应用程序线程
  - 依次反复，直到垃圾收集完成
- 增量收集算法的基础仍是传统的标记-清除和复制算法。**增量收集算法通过对线程间冲突的妥善处理**，允许垃圾收集线程以分阶段的方式完成标记、清理或复制工作
- 优缺点
  - 使用这种方式，由于在垃圾回收过程中，间断性地还执行了应用程序代码，所以能减少系统的停顿时间
  - 但是，线程切换和上下文转换的消耗，会使得垃圾回收的总体成本上升，造成系统吞吐量的下降

##### 分区算法

- 堆空间越大，一次Gc时所需要的时间就越长，STW也越长
- 将一块大的内存区域分割成多个小块，根据目标的停顿时间，每次合理地回收若干个小区间，而不是整个堆空间，从而减少一次GC所产生的停顿
- 分代算法将按照对象的生命周期长短划分成两个部分，分区算法将整个堆空间划分成连续的不同小区间
- 每一个小区间都独立使用，独立回收。这种算法的好处是可以控制一次回收多少个小区间

### 相关概念

#### System.gc()

- 在默认情况下，通过system.gc（）者Runtime.getRuntime().gc() 的调用，会显式触发FullGC，同时对老年代和新生代进行回收，尝试释放被丢弃对象占用的内存

- 然而system.gc() )调用附带一个免责声明，无法保证对垃圾收集器的调用。(不能确保立即生效)

- JVM实现者可以通过system.gc() 调用来决定JVM的GC行为。而一般情况下，垃圾回收应该是自动进行的，无须手动触发，否则就太过于麻烦了。在一些特殊情况下，如我们正在编写一个性能基准，我们可以在运行之间调用System.gc() 
- **对下面代码中localVarGC3和localVarGC4的说明**
  - 栈帧的局部表量表的Slot槽是可复用的
  - Slot1-->this , Slot2-->buffer
  - localVarGC3中，当代码块代码执行完后，Slot2并没有被覆盖，buffer对象还在被引用，不能回收
  - localVarGC4中，当代码块代码执行完后，Slot2-->value，buffer对象不再引用，进行回收

```java
public class LocalVarGC {
  	/**
     * main方法依次调用localVarGC1-localVarGC5
     */
  	public static void main(String[] args) {
        LocalVarGC localVarGC = new LocalVarGC();
        localVarGC.localvarGC1();	
    }
    /**
     * 触发Minor GC没有回收对象，然后在触发Full GC将该对象存入old区
     */
    public void localvarGC1() {
        byte[] buffer = new byte[10*1024*1024];
        System.gc();
    }
    /**
     * 触发YoungGC的时候，已经被回收了
     */
    public void localvarGC2() {
        byte[] buffer = new byte[10*1024*1024];
        buffer = null;
        System.gc();
    }
    /**
     * 不会被回收，因为它还存放在局部变量表索引为1的槽中
     */
    public void localvarGC3() {
        {
            byte[] buffer = new byte[10*1024*1024];
        }
        System.gc();
    }
    /**
     * 会被回收，因为它还存放在局部变量表索引为1的槽中，但是后面定义的value把这个槽给替换了
     */
    public void localvarGC4() {
        {
            byte[] buffer = new byte[10*1024*1024];
        }
        int value = 10;
        System.gc();
    }
    /**
     * localvarGC5中的数组已经被回收
     */
    public void localvarGC5() {
        localvarGC1();
        System.gc();
    }
}
```

#### 内存溢出

- 一般情况下，除非应用程序占用的内存增长速度非常快，造成垃圾回收已经跟不上内存消耗的速度，否则不太容易出现OOM的情况

- 大多数情况下，GC会进行各种年龄段的垃圾回收，实在不行了就放大招，来一次独占式的FullGC操作，这时候会回收大量的内存，供应用程序继续使用

- Javadoc中对OutOfMemoryError的解释是

  - **没有空闲内存**

    - Java虚拟机的堆内存设置不够

      > 可能存在内存泄漏问题；也很有可能就是堆的大小不合理，可以通过参数-Xms 、-Xmx来调整

    - 代码中创建了大量大对象，并且长时间不能被垃圾收集器收集（存在被引用）

  - **垃圾收集器也无法提供更多内存**

    - 对于老版本的Oracle JDK，因为永久代的大小是有限的，并且JVM对永久代垃圾回收（如，常量池回收、卸载不再需要的类型）非常不积极，所以当我们不断添加新类型的时候，永久代出现OutOfMemoryError也非常多见，尤其是在运行时存在大量动态类型生成的场合；类似intern字符串缓存占用太多空间，也会导致OOM问题。对应的异常信息，会标记出来和永久代相关：“java.lang.OutOfMemoryError:PermGen space"
    - 随着元数据区的引入，方法区内存已经不再那么窘迫，所以相应的ooM有所改观，出现OOM，异常信息则变成了：“java.lang.OutOfMemoryError:Metaspace"。直接内存不足，也会导致OOM

- 在抛出OutofMemoryError之前，通常垃圾收集器会被触发，尽其所能去清理出空间

  > 例如：在引用机制分析中，涉及到JVM会去尝试回收软引用指向的对象等
  > 在java.nio.BIts.reserveMemory（）方法中，我们能清楚的看到，System.gc（）会被调用，以清理空间

- 也不是在任何情况下垃圾收集器都会被触发的

  > 比如，我们去分配一个超大对象，类似一个超大数组超过堆的最大值，JVM可以判断出垃圾收集并不能解决这个问题，所以直接抛出OutOfMemoryError

#### 内存泄露

- 也称作“存储渗漏”

- 狭义定义：对象不会再被程序用到了，但是GC又不能回收

- 广义定义：一些不太好的实践（或疏忽）会导致对象的生命周期变得很长甚至导致OOM

- 内存泄漏并不会立刻引起程序崩溃，但是一旦发生内存泄漏，程序中的可用内存就会被逐步蚕食，直至耗尽所有内存，最终出现OutOfMemory异常，导致程序崩溃

  > 这里的存储空间并不是指物理内存，是指虚拟内存大小，这个虚拟内存大小取决于磁盘交换区设定的大小

- Java使用可达性分析算法，最上面的数据不可达，就是需要被回收的。后期有一些对象不用了，按道理应该断开引用，但是存在一些链没有断开，从而导致没有办法被回收

![image-20220910134808789](http://minio.botuer.com/study-node/old/typora202209101348997.png)

- 举例

  - 单例模式

    > 单例的生命周期和应用程序是一样长的，所以单例程序中，如果持有对外部对象的引用的话，那么这个外部对象是不能被回收的，则会导致内存泄漏的产生

  - 一些提供close的资源未关闭导致内存泄漏

    > 数据库连接（dataSourse.getConnection() ），网络连接（socket）和io连接必须手动close，否则是不能被回收的

#### STW

- 停顿产生时整个应用程序线程都会被暂停，没有任何响应，有点像卡死的感觉

- 可达性分析算法中枚举根节点（GC Roots）会导致所有Java执行线程停顿

  - 分析工作必须在一个能确保一致性的快照中进行
  - 一致性指整个分析期间整个执行系统看起来像被冻结在某个时间点上

  - 如果出现分析过程中对象引用关系还在不断变化，则分析结果的准确性无法保证

- STW事件和采用哪款GC无关所有的GC都有这个事件

  - 哪怕是G1也不能完全避免Stop-the-world情况发生，只能说垃圾回收器越来越优秀，回收效率越来越高，尽可能地缩短了暂停时间

  - STW是JVM在后台自动发起和自动完成的。在用户不可见的情况下，把用户正常的工作线程全部停掉

  - 开发中不要用system.gc() 会导致stop-the-world的发生

#### 垃圾回收的并行与并发

- 并行

  - 当系统有一个以上CPU时，当一个CPU执行一个进程时，另一个CPU可以执行另一个进程，两个进程互不抢占CPU资源，可以同时进行，我们称之为并行（Parallel）

  - 其实决定并行的因素不是CPU的数量，而是CPU的核心数量，比如一个CPU多个核也可以并行

  - 适合科学计算，后台处理等弱交互场景

- 并发 ----> 宏观并行，微观串行

  - 在操作系统中，是指一个时间段中有几个程序都处于已启动运行到运行完毕之间，且这几个程序都是在同一个处理器上运行

  - 并发不是真正意义上的“同时进行”，只是CPU把一个时间段划分成几个时间片段（时间区间），然后在这几个时间区间之间来回切换，由于CPU处理的速度非常快，只要时间间隔处理得当，即可让用户感觉是多个应用程序同时在进行

- 垃圾回收的并行与并发

  - 并行（Parallel）
    - **多条垃圾收集线程并行工作**，但此时**用户线程仍处于等待状态**

    - 如ParNew、Parallel Scavenge、Parallel old

  - 串行（Serial）
    - 相较于并行的概念，单线程执行
    - 如果内存不够，则程序暂停，启动JM垃圾回收器进行垃圾回收。回收完，再启动程序的线程
  - 并发（Concurrent）
    - **用户线程与垃圾收集线程同时执行（但不一定是并行的，可能会交替执行）**
    - 垃圾回收线程在执行时不会停顿用户程序的运行
    - 用户程序在继续运行，而垃圾收集程序线程运行于另一个CPU上
    - 如：CMS、G1

#### 安全点与安全区域

- 安全点 --- Safe Point

  - 程序执行时并非在所有地方都能停顿下来开始GC，只有在特定的位置才能停顿下来开始GC，这些位置称为“安全点“

  - Safe Point的选择很重要

    - 如果太少可能导致GC等待的时间太长

    - 如果太频繁可能导致运行时的性能问题

    - 大部分指令的执行时间都非常短暂，通常会根据“是否具有让程序长时间执行的特征”为标准

      > 比如：选择一些执行时间较长的指令作为Safe Point，如方法调用、循环跳转和异常跳转等

  - 如何在GC发生时，检查所有线程都跑到最近的安全点停顿下来呢？

    - **抢先式中断**：（目前没有虚拟机采用了）首先中断所有线程。如果还有线程不在安全点，就恢复线程，让线程跑到安全点

    - **主动式中断**：设置一个中断标志，各个线程运行到Safe Point的时候主动轮询这个标志，如果中断标志为真，则将自己进行中断挂起。（有轮询的机制）

- 安全区域 --- Safe Region

  - Safe Point 机制保证了程序执行时，在不太长的时间内就会遇到可进入GC的Safe Point。但是，程序“不执行”的时候呢？例如线程处于sleep状态或Blocked 状态，这时候线程无法响应JVM的中断请求，“走”到安全点去中断挂起，JVM也不太可能等待线程被唤醒。这种情况，就需要安全区域（Safe Region）来解决


  - 安全区域是指在一段代码片段中，对象的引用关系不会发生变化，在这个区域中的任何位置开始GC都是安全的。我们也可以把Safe Region看做是被扩展了的Safepoint

  - **执行流程**
- 当线程运行到Safe Region的代码时，首先标识已经进入了Safe Relgion，如果这段时间内发生GC，JVM会忽略标识为Safe Region状态的线程
    
- 当线程即将离开Safe Region时，会检查JVM是否已经完成GC，如果完成了，则继续运行，否则线程必须等待直到收到可以安全离开Safe Region的信号为止

#### 强引用

- 当内存空间还足够时，则能保留在内存中；如果内存空间在进行垃圾收集后还是很紧张，则可以抛弃这些对象

- 在JDK1.2版之后，Java对引用的概念进行了扩充，将引用分为

  - 强引用（Strong Reference）
  - 软引用（Soft Reference）
  - 弱引用（Weak Reference）
  - 虚引用（Phantom Reference）

- 这4种引用强度依次逐渐减弱。除强引用外，其他3种引用均在java.lang.ref包中，**（jdk1.8继承关系发生改变）**

  - ---｜Object
    - ---｜Reference（抽象类）
      - ---｜SoftReference（软引用）
      - ---｜WeakReference（弱引用）
      - ---｜PhantomReference（虚引用）
      - ---｜FinalReference（终结器引用 -- 缺省，包内可见）

- 在Java程序中，最常见的引用类型是强引用（普通系统99%以上都是强引用），也就是我们最常见的普通对象引用，也是默认的引用类型

- 当在Java语言中使用new操作符创建一个新的对象，并将其赋值给一个变量的时候，这个变量就成为指向该对象的一个强引用

- 强引用的对象是可触及的，垃圾收集器就永远不会回收掉被引用的对象

- 对于一个普通的对象，如果没有其他的引用关系，只要超过了引用的作用域或者显式地将相应（强）引用赋值为null，就是可以当做垃圾被收集了，当然具体回收时机还是要看垃圾收集策略

- 相对的，软引用、弱引用和虚引用的对象是软可触及、弱可触及和虚可触及的，在一定条件下，都是可以被回收的。所以，**强引用是造成Java内存泄漏的主要原因之一**

  ```java
  StringBuffer str = new StringBuffer("hello mogublog");
  StringBuffer str1 = str;
  str = null;
  //原来堆中的对象也不会被回收，因为str1对象引用
  ```

- 特点

  - 强引用可以直接访问目标对象
  - 强引用所指向的对象在任何时候都不会被系统回收，虚拟机宁愿抛出OOM异常，也不会回收强引用所指向对象
  - 强引用可能导致内存泄漏

#### 软引用

- 软引用是用来描述一些还有用，但非必需的对象
- 只被软引用关联着的对象，在系统将要发生内存溢出异常前，会把这些对象列进回收范围之中进行第二次回收，如果这次回收还没有足够的内存，才会抛出内存溢出异常

> 注意，这里的第一次回收是不可达的对象

- 软引用通常用来实现内存敏感的**缓存**

  > 高速缓存就有用到软引用。如果还有空闲内存，就可以暂时保留缓存，当内存不足时清理掉，这样就保证了使用缓存的同时，不会耗尽内存

- 垃圾回收器在某个时刻决定回收软可达的对象的时候，会清理软引用，并可选地把引用存放到一个引用队列（Reference Queue）

- 类似弱引用，只不过Java虚拟机会尽量让软引用的存活时间长一些，迫不得已才清理
- 一句话概括：**当内存足够时，不会回收软引用可达的对象。内存不够时，会回收软引用的可达对象**

- 在JDK1.2版之后提供了SoftReference类来实现软引用

  ```java
  // 声明强引用
  Object obj = new Object();
  // 创建一个软引用
  SoftReference<Object> sf1 = new SoftReference<>(obj);
  obj = null; //销毁强引用，这是必须的，不然会存在强引用和软引用
  
  //也可以在构造器传入匿名强引用对象
  SoftReference<Object> sf2 = new SoftReference<>(new Object());
  ```

#### 弱引用

- 弱引用也是用来描述那些非必需对象，被弱引用关联的对象只能生存到下一次垃圾收集发生为止。在系统GC时，只要发现弱引用，不管系统堆空间使用是否充足，都会回收掉只被弱引用关联的对象

- 但是，由于垃圾回收器的线程通常优先级很低，因此，并不一定能很快地发现持有弱引用的对象。在这种情况下，弱引用对象可以存在较长的时间。

- 弱引用和软引用一样，在构造弱引用时，也可以指定一个引用队列，当弱引用对象被回收时，就会加入指定的引用队列，通过这个队列可以跟踪对象的回收情况

- 软引用、弱引用都非常适合来保存那些可有可无的缓存数据。如果这么做，当系统内存不足时，这些缓存数据会被回收，不会导致内存溢出。而当内存资源充足时，这些缓存数据又可以存在相当长的时间，从而起到加速系统的作用

- 一句话概括：**发现即回收**

- 在JDK1.2版之后提供了WeakReference类来实现弱引用

  ```java
  // 声明强引用
  Object obj = new Object();
  // 创建一个弱引用
  WeakReference<Object> sf1 = new WeakReference<>(obj);
  obj = null; //销毁强引用，这是必须的，不然会存在强引用和弱引用
  ```


- 弱引用对象与软引用对象的最大不同就在于，当GC在进行回收时，需要通过算法检查是否回收软引用对象，而对于弱引用对象，GC总是进行回收。弱引用对象更容易、更快被GC回收。

- 面试题：你开发中使用过WeakHashMap吗？

- WeakHashMap用来存储图片信息，可以在内存不足的时候，及时回收，避免了OOM

#### 虚引用

- 也称为“幽灵引用”或者“幻影引用”，是所有引用类型中最弱的一个

- 一个对象是否有虚引用的存在，完全不会决定对象的生命周期。如果一个对象仅持有虚引用，那么它和没有引用几乎是一样的，随时都可能被垃圾回收器回收

- 它不能单独使用，也无法通过虚引用来获取被引用的对象。当试图通过虚引用的get（）方法取得对象时，总是null

- 为一个对象设置虚引用关联的唯一目的在于跟踪垃圾回收过程。比如：能在这个对象被收集器回收时收到一个系统通知

- 虚引用必须和引用队列一起使用。虚引用在创建时必须提供一个引用队列作为参数。当垃圾回收器准备回收一个对象时，如果发现它还有虚引用，就会在回收对象后，将这个虚引用加入引用队列，以通知应用程序对象的回收情况

- 由于虚引用可以跟踪对象的回收时间，因此，也可以将一些资源释放操作放置在虚引用中执行和记录

  > 虚引用无法获取到我们的数据

- 在JDK1.2版之后提供了PhantomReference类来实现虚引用

  ```java
  // 声明强引用
  Object obj = new Object();
  // 声明引用队列
  ReferenceQueue phantomQueue = new ReferenceQueue();
  // 声明虚引用（还需要传入引用队列）
  PhantomReference<Object> sf = new PhantomReference<>(obj, phantomQueue);
  obj = null; 
  ```

- 案例

  ```java
  public class PhantomReferenceTest {
      // 当前类对象的声明
      public static PhantomReferenceTest obj;
      // 引用队列
      static ReferenceQueue<PhantomReferenceTest> phantomQueue = null;
  
      @Override
      protected void finalize() throws Throwable {
          super.finalize();
          System.out.println("调用当前类的finalize方法");
          obj = this;
      }
  
      public static void main(String[] args) {
          Thread thread = new Thread(() -> {
              while(true) {
                  if (phantomQueue != null) {
                      PhantomReference<PhantomReferenceTest> objt = null;
                      try {
                          objt = (PhantomReference<PhantomReferenceTest>) phantomQueue.remove();
                      } catch (Exception e) {
                          e.getStackTrace();
                      }
                      if (objt != null) {
                          System.out.println("追踪垃圾回收过程：PhantomReferenceTest实例被GC了");
                      }
                  }
              }
          }, "t1");
          thread.setDaemon(true);
          thread.start();
  
          phantomQueue = new ReferenceQueue<>();
          obj = new PhantomReferenceTest();
          // 构造了PhantomReferenceTest对象的虚引用，并指定了引用队列
          PhantomReference<PhantomReferenceTest> phantomReference = new PhantomReference<>(obj, phantomQueue);
          try {
              System.out.println(phantomReference.get());
              // 去除强引用
              obj = null;
              // 第一次进行GC，由于对象可复活，GC无法回收该对象
              System.out.println("第一次GC操作");
              System.gc();
              Thread.sleep(1000);
              if (obj == null) {
                  System.out.println("obj 是 null");
              } else {
                  System.out.println("obj 不是 null");
              }
              System.out.println("第二次GC操作");
              obj = null;
              System.gc();
              Thread.sleep(1000);
              if (obj == null) {
                  System.out.println("obj 是 null");
              } else {
                  System.out.println("obj 不是 null");
              }
          } catch (Exception e) {
              e.printStackTrace();
          } finally {
  
          }
      }
  }
  ```

  ```
  null
  第一次GC操作
  调用当前类的finalize方法
  obj 不是 null
  第二次GC操作
  追踪垃圾回收过程：PhantomReferenceTest实例被GC了
  obj 是 null
  ```

  从上述运行结果我们知道，第一次尝试获取虚引用的值，发现无法获取的，这是因为虚引用是无法直接获取对象的值，然后进行第一次gc，因为会调用finalize方法，将对象复活了，所以对象没有被回收，但是调用第二次gc操作的时候，因为finalize方法只能执行一次，所以就触发了GC操作，将对象回收了，同时将会触发第二个操作就是 将回收的值存入到引用队列中

#### 终结器引用

- 它用于实现对象的finalize() 方法，也可以称为终结器引用

- 无需手动编码，其内部配合引用队列使用

- 在GC时，终结器引用入队。由Finalizer线程通过终结器引用找到被引用对象调用它的finalize()方法，第二次GC时才回收被引用的对象

### 垃圾回收器

#### GC分类、性能指标、发展史

- 垃圾收集器没有在规范中进行过多的规定，可以由不同的厂商、不同版本的JVM来实现

  由于JDK的版本处于高速迭代过程中，因此Java发展至今已经衍生了众多的GC版本

  从不同角度分析垃圾收集器，可以将GC分为不同的类型


- 分类

  - **按垃圾回收线程数分**，可以分为串行垃圾回收器和并行垃圾回收器

    - 串行回收指的是在同一时间段内只允许有一个CPU用于执行垃圾回收操作，此时工作线程被暂停，直至垃圾收集工作结束
      - 在诸如单CPU处理器或者较小的应用内存等硬件平台不是特别优越的场合，串行回收器的性能表现可以超过并行回收器和并发回收器
      - 串行回收默认被应用在客户端的Client模式下的JVM中
      - 在并发能力比较强的CPU上，并行回收器产生的停顿时间要短于串行回收器

    - 并行回收相反，可以运用多个CPU同时执行垃圾回收，因此提升了应用的吞吐量，不过并行回收仍然与串行回收一样，采用独占式，使用了“stop-the-world”机制

    ![image-20220910212824801](http://minio.botuer.com/study-node/old/typora202209102128962.png)

  - 按照工作模式分，可以分为并发式垃圾回收器和独占式垃圾回收器

    - 并发式垃圾回收器与应用程序线程交替工作，以尽可能减少应用程序的停顿时间
    - 独占式垃圾回收器（Stop the world）一旦运行，就停止应用程序中的所有用户线程，直到垃圾回收过程完全结束

    ![image-20220910212836491](http://minio.botuer.com/study-node/old/typora202209102128734.png)

  - 按碎片处理方式分，可分为压缩式垃圾回收器和非压缩式垃圾回收器

    - 压缩式垃圾回收器会在回收完成后，对存活对象进行压缩整理，消除回收后的碎片。
    - 非压缩式的垃圾回收器不进行这步操作

  - 按工作的内存区间分，又可分为年轻代垃圾回收器和老年代垃圾回收器

- 性能指标

  - **吞吐量**：运行用户代码的时间占总运行时间的比例（总运行时间 = 程序的运行时间 + GC的时间）

  - **暂停时间**：执行垃圾收集时，程序的工作线程被暂停的时间

  - **内存占用**：Java堆区所占的内存大小

  - 垃圾收集开销：吞吐量的补数，GC所用时间与总运行时间的比例，与吞吐量和为1

  - 收集频率：相对于应用程序的执行，收集操作发生的频率

  - 快速：一个对象从诞生到被回收所经历的时间

    ```java
    吞吐量、暂停时间、内存占用 这三者共同构成一个"不可能三角"
    
    - 三者总体的表现会随着技术进步而越来越好
    - 一款优秀的收集器通常最多同时满足其中的两项
    - 这三项里，"暂停时间的重要性日益凸"，因为随着硬件发展，内存占用多些越来越能容忍，硬件性能的提升也有助于降低收集器运行时对应用程序的影响，即提高了吞吐量。而内存的扩大，对延迟反而带来负面效果
    - 简单来说，主要抓住两点
      - 吞吐量
      - 暂停时间
      
    "吞吐量优先"，意味着在"单位时间内（或总的）STW的时间最短"，单位时间响应的更多，直觉上，程序运行越快，但降低内存回收的执行频率，GC暂停时间长，多应用于"后端服务器"
      
    "低延迟优先"，意味着尽可能让"单次STW的时间最短"，暂停时间少，直觉是不卡，但GC频率提升，年轻代内存的缩减、导致程序吞吐量的下降，多应用于"交互式应用程序"
      
    在设计（或使用）GC算法时，我们必须确定我们的目标：一个GC算法只可能针对两个目标之一（即只专注于较大吞吐量或最小暂停时间），或尝试找到一个二者的折衷
      - 现在标准："在最大吞吐量优先的情况下，降低停顿时间"
    ```

    ![image-20220910214257298](http://minio.botuer.com/study-node/old/typora202209102142398.png)

    ![image-20220910214305752](http://minio.botuer.com/study-node/old/typora202209102143010.png)

- 发展史

  > 垃圾回收机制Garbage Collection，对应的产品我们称为垃圾回收器Garbage Collector
  >

  - 1999年随JDK1.3.1一起来的是串行方式的serialGc，它是第一款GC。ParNew垃圾收集器是Serial收集器的多线程版本
  - 2002年2月26日，Parallel GC和Concurrent Mark Sweep GC跟随JDK1.4.2一起发布·
  - Parallel GC在JDK6之后成为HotSpot默认GC
  - 2012年，在JDK1.7u4版本中，G1可用
  - 2017年，JDK9中G1变成默认的垃圾收集器，以替代CMS
  - 2018年3月，JDK10中G1垃圾回收器的并行完整垃圾回收，实现并行性来改善最坏情况下的延迟
  - 2018年9月，JDK11发布。引入Epsilon 垃圾回收器，又被称为 "No-Op(无操作)“ 回收器。同时，引入ZGC：可伸缩的低延迟垃圾回收器（Experimental）
  - 2019年3月，JDK12发布。增强G1，自动返回未用堆内存给操作系统。同时，引入Shenandoah GC：低停顿时间的GC（Experimental）。2019年9月，JDK13发布。增强zGC，自动返回未用堆内存给操作系统
  - 2020年3月，JDK14发布。删除cMs垃圾回收器。扩展zGC在macos和Windows上的应用

#### Serial与Serial Old

```sh
-XX:+PrintCommandLineFlags		#查看命令行相关参数（包含使用的垃圾收集器）

jinfo -flag  相关垃圾回收器参数  进程ID		#使用命令行指令查看使用的垃圾收集器
```

- 串行回收
- Serial收集器是最基本、历史最悠久的垃圾收集器了。JDK1.3之前回收新生代唯一的选择
- Serial收集器作为HotSpot中client模式下的默认新生代垃圾收集器
- **Serial**收集器采用**复制算法**、**串行回收**和**"stop-the-World"机制**的方式执行内存回收
- 除了年轻代之外，Serial收集器还提供用于执行老年代垃圾收集的Serial old收集器
- **Serial old**收集器同样也采用了**串行回收**和**"stop the World"机制**，只不过内存回收算法使用的是**标记-压缩算法**
  
  - Serial old是运行在Client模式下默认的老年代的垃圾回收器
  - Serial old在Server模式下主要有两个用途：
    - 与新生代的Parallel scavenge配合使用
    - 作为老年代CMS收集器的后备垃圾收集方案
  
- 这个收集器是一个单线程的收集器，但它的“单线程”的意义并不仅仅说明它只会使用一个CPU或一条收集线程去完成垃圾收集工作，更重要的是在它进行垃圾收集时，必须暂停其他所有的工作线程，直到它收集结束

- 优势：简单而高效（与其他收集器的单线程比），对于限定单个cPU的环境来说，Serial收集器由于没有线程交互的开销，专心做垃圾收集自然可以获得最高的单线程收集效率

  - 运行在client模式下的虚拟机是个不错的选择

  - 在用户的桌面应用场景中，可用内存一般不大（几十MB至一两百MB），可以在较短时间内完成垃圾收集（几十ms至一百多ms），只要不频繁发生，使用串行回收器是可以接受的

- 在HotSpot虚拟机中，使用-XX：+UseSerialGC参数可以指定年轻代和老年代都使用串行收集器

  > 等价于新生代用Serial GC，且老年代用Serial old GC

- 对于交互较强的应用而言，这种垃圾收集器是不能接受的。一般在Java web应用程序中是不会采用串行垃圾收集器的

![image-20220910221141825](http://minio.botuer.com/study-node/old/typora202209102211094.png)

#### ParNew

- 并行回收

- 如果说serialGC是年轻代中的单线程垃圾收集器，那么ParNew收集器则是serial收集器的多线程版本

- Par是Parallel的缩写，New：只能处理的是新生代

- ParNew 收集器除了采用并行回收的方式执行内存回收外，两款垃圾收集器之间几乎没有任何区别

  > ParNew收集器在年轻代中同样也是采用复制算法、"stop-the-World"机制

- ParNew 是很多JVM运行在Server模式下新生代的默认垃圾收集器
- 对于新生代，回收次数频繁，使用并行方式高效
- 对于老年代，回收次数少，使用串行方式节省资源。（CPU并行需要切换线程，串行可以省去切换线程的资源），搭配Serial old使用

-  除Serial外，目前只有ParNew GC能与CMS收集器配合工作

- 使用"-XX：+UseParNewGC"手动指定使用ParNew收集器执行内存回收任务。它表示年轻代使用并行收集器，不影响老年代

- -XX:ParallelGCThreads限制线程数量，默认开启和CPU数据相同的线程数

  ![image-20220910222351857](http://minio.botuer.com/study-node/old/typora202209102223967.png)

#### Parallel Scavenge与Paeallel Old

- 并行回收
- **吞吐量优先**
- 同样也采用了复制算法、并行回收和"Stop the World"机制
- **自适应调节策略**也是Parallel Scavenge与ParNew一个重要区别

- 高吞吐量则可以高效率地利用CPU时间，尽快完成程序的运算任务，主要适合在后台运算而不需要太多交互的任务。因此，常见在服务器环境中使用。例如，那些执行批量处理、订单处理、工资支付、科学计算的应用程序

- Parallel收集器在JDK1.6时提供了用于执行老年代垃圾收集的Paralle1o1d收集器，用来代替老年代的serialold收集器

- **Parallel old**收集器采用了**标记-压缩算法**，但同样也是基于并行回收和"stop-the-World"机制

- 在程序吞吐量优先的应用场景中，Parallel收集器和Parallel old收集器的组合，在server模式下的内存回收性能很不错。在Java8中，默认是此垃圾收集器

  ![image-20220910223040259](http://minio.botuer.com/study-node/old/typora202209102230386.png)

- 参数设置

  - -XX：+UseParallelGC 手动指定年轻代使用Paralle1并行收集器执行内存回收任务

  - -XX：+UseParalleloldGC 手动指定老年代都是使用并行回收收集器

    - 分别适用于新生代和老年代。默认jdk8是开启的
    - 上面两个参数，默认开启一个，另一个也会被开启（互相激活）

  - -XX:ParallelGcrhreads设置年轻代并行收集器的线程数。一般地，最好与CPU数量相等，以避免过多的线程数影响垃圾收集性能

    - 在默认情况下，当CPU数量小于8个，ParallelGcThreads的值等于CPU数量。

    - 当CPU数量大于8个，ParallelGCThreads的值等于3+[5*CPU Count]/8]

  - -XX:MaxGCPauseMillis 设置垃圾收集器最大停顿时间（即STW的时间）。单位是毫秒

    - 为了尽可能地把停顿时间控制在MaxGCPauseMills以内，收集器在工作时会调整Java堆大小或者其他一些参数
    - 对于用户来讲，停顿时间越短体验越好。但是在服务器端，我们注重高并发，整体的吞吐量。所以服务器端适合Parallel，进行控制。该参数使用需谨慎

  - -XX:GCTimeRatio垃圾收集时间占总时间的比例（=1/（N+1））。用于衡量吞吐量的大小

    - 取值范围（0，100）。默认值99，也就是垃圾回收时间不超过1。

    - 与前一个-xx:MaxGCPauseMillis参数有一定矛盾性。暂停时间越长，Radio参数就容易超过设定的比例

  - -XX:+UseAdaptivesizepplicy 设置Parallel scavenge收集器具有自适应调节策略

    - 在这种模式下，年轻代的大小、Eden和Survivor的比例、晋升老年代的对象年龄等参数会被自动调整，已达到在堆大小、吞吐量和停顿时间之间的平衡点

    - 在手动调优比较困难的场合，可以直接使用这种自适应的方式，仅指定虚拟机的最大堆、目标的吞吐量（GCTimeRatio）和停顿时间（MaxGCPauseMil1s），让虚拟机自己完成调优工作

#### CMS

- Concurrent-Mark-Sweep 并发标记清除

- **低延迟**

- jdk1.5发布CMS收集器，这款收集器是HotSpot虚拟机中第一款真正意义上的并发收集器，**它第一次实现了让垃圾收集线程与用户线程同时工作**

- CMS收集器的关注点是尽可能缩短垃圾收集时用户线程的停顿时间。停顿时间越短（低延迟）就越适合与用户交互的程序，良好的响应速度能提升用户体验

- 目前很大一部分的Java应用集中在互联网站或者B/S系统的服务端上，这类应用尤其重视服务的响应速度，希望系统停顿时间最短，以给用户带来较好的体验。CMS收集器就非常符合这类应用的需求

- CMS的垃圾收集算法采用标记-清除算法，并且也会"stop-the-world"

- 不幸的是，CMS作为老年代的收集器，却无法与JDK1.4中已经存在的新生代收集器Parallel Scavenge配合工作，所以在JDK1.5中使用CMS来收集老年代的时候，新生代只能选择ParNew或者Serial收集器中的一个

- 在G1出现之前，CMS使用还是非常广泛的。一直到今天，仍然有很多系统使用CMS GC

- CMS整个过程比之前的收集器要复杂，整个过程分为4个主要阶段，即初始标记阶段、并发标记阶段、重新标记阶段和并发清除阶段(**涉及STW的阶段主要是：初始标记 和 重新标记**)

  - **初始标记**（Initial-Mark）阶段：在这个阶段中，程序中所有的工作线程都将会因为“stop-the-world”机制而出现短暂的暂停，这个阶段的主要任务仅仅只是**标记出GCRoots能直接关联到的对象**。一旦标记完成之后就会恢复之前被暂停的所有应用线程。由于直接关联对象比较小，所以这里的速度非常快
  - **并发标记**（Concurrent-Mark）阶段：从Gc Roots的直接关联对象开始遍历整个对象图的过程，这个过程耗时较长但是不需要停顿用户线程，可以与垃圾收集线程一起并发运行
  - **重新标记**（Remark）阶段：由于在并发标记阶段中，程序的工作线程会和垃圾收集线程同时运行或者交叉运行，因此为了修正并发标记期间，因用户程序继续运作而导致标记产生变动的那一部分对象的标记记录，这个阶段的停顿时间通常会比初始标记阶段稍长一些，但也远比并发标记阶段的时间短
  - **并发清除**（Concurrent-Sweep）阶段：此阶段清理删除掉标记阶段判断的已经死亡的对象，释放内存空间。由于不需要移动存活对象，所以这个阶段也是可以与用户线程同时并发的

  ![image-20220910223056203](http://minio.botuer.com/study-node/old/typora202209102230306.png)

- 尽管CMS收集器采用的是并发回收（非独占式），但是在其初始化标记和再次标记这两个阶段中仍然需要执行“Stop-the-World”机制暂停程序中的工作线程，不过暂停时间并不会太长，因此可以说明目前所有的垃圾收集器都做不到完全不需要“stop-the-World”，只是尽可能地缩短暂停时间，由于最耗费时间的并发标记与并发清除阶段都不需要暂停工作，所以整体的回收是低停顿的。

- 另外，由于在垃圾收集阶段用户线程没有中断，所以在CMS回收过程中，还应该确保应用程序用户线程有足够的内存可用。因此，CMS收集器不能像其他收集器那样等到老年代几乎完全被填满了再进行收集，而是当堆内存使用率达到某一阈值时，便开始进行回收，以确保应用程序在CMS工作过程中依然有足够的空间支持应用程序运行。要是CMS运行期间预留的内存无法满足程序需要，就会出现一次“Concurrent Mode Failure”
  失败，这时虚拟机将启动后备预案：临时启用Serial old收集器来重新进行老年代的垃圾收集，这样停顿时间就很长了

- CMS收集器的垃圾收集算法采用的是**标记清除算法**，这意味着每次执行完内存回收后，由于被执行内存回收的无用对象所占用的内存空间极有可能是不连续的一些内存块，不可避免地将会产生一些内存碎片。那么CMS在为新对象分配内存空间时，将无法使用指针碰撞（Bump the Pointer）技术，而只能够选择空闲列表（Free List）执行内存分配

- 不采用标记压缩算法，因为当并发清除的时候，用Compact整理内存的话，原来的用户线程使用的内存还怎么用呢？要保证用户线程能继续执行，前提的它运行的资源不受影响

- 缺点

  - 会产生内存碎片，导致并发清除后，用户线程可用的空间不足。在无法分配大对象的情况下，不得不提前触发FullGC
  - CMS收集器对CPU资源非常敏感。在并发阶段，它虽然不会导致用户停顿，但是会因为占用了一部分线程而导致应用程序变慢，总吞吐量会降低
  - CMS收集器无法处理浮动垃圾。可能出现“Concurrent Mode Failure"失败而导致另一次Full GC的产生。在并发标记阶段由于程序的工作线程和垃圾收集线程是同时运行或者交叉运行的，那么在**并发标记阶段产生新的垃圾对象（就是浮动垃圾）**，CMS将无法对这些垃圾对象进行标记，最终会导致这些新产生的垃圾对象没有被及时回收，从而只能在下一次执行GC时释放这些之前未被回收的内存空间

- 参数设置

  - -XX：+UseConcMarkSweepGC手动指定使用CMS收集器执行内存回收任务

    > 开启该参数后会自动将-xx：+UseParNewGC打开。即：ParNew（Young区用）+CMS（01d区用）+Serial old的组合

  - -XX:CMSInitiatingoccupanyFraction 设置堆内存使用率的阈值，一旦达到该阈值，便开始进行回收

    > JDK5及以前版本的默认值为68，即当老年代的空间使用率达到68%时，会执行一次CMS回收。JDK6及以上版本默认值为92%
    >
    > 如果内存增长缓慢，则可以设置一个稍大的值，大的阀值可以有效降低CMS的触发频率，减少老年代回收的次数可以较为明显地改善应用程序性能。反之，如果应用程序内存使用率增长很快，则应该降低这个阈值，以避免频繁触发老年代串行收集器。因此通过该选项便可以有效降低Ful1Gc的执行次数

  - -XX：+UseCMSCompactAtFullCollection用于指定在执行完Full

    > GC后对内存空间进行压缩整理，以此避免内存碎片的产生。不过由于内存压缩整理过程无法并发执行，所带来的问题就是停顿时间变得更长了

  - -XX:CMSFullGCsBeforecompaction 设置在执行多少次FullGC后对内存空间进行压缩整理

  - -XX:ParallelcMSThreads 设置CMS的线程数量

    > CMS默认启动的线程数是（Paralle1GCThreads+3）/4，ParallelGCThreads是年轻代并行收集器的线程数。当CPU资源比较紧张时，受到CMS收集器线程的影响，应用程序的性能在垃圾回收阶段可能会非常糟糕

#### G1

##### 概述

- Garbage First

- 为了适应现在不断扩大的内存和不断增加的处理器数量，进一步降低暂停时间（pause time），同时兼顾良好的吞吐量，在延迟可控的情况下获得尽可能高的吞吐量

- 侧重点在于回收垃圾最大量的区间（Region）-- 垃圾优先（Garbage First）

- 堆内存分割为很多不相关的区域（Region）（物理上不连续的），使用不同的Region来表示Eden、幸存者0区，幸存者1区，老年代等

- G1（Garbage-First）是一款面向服务端应用的垃圾收集器，主要针对配备多核CPU及大容量内存的机器，以极高概率满足GC停顿时间的同时，还兼具高吞吐量的性能特征

- 取代了CMS回收器以及Parallel+Parallel old组合。被oracle官方称为“全功能的垃圾收集器”

- 在jdk8中还不是默认的垃圾回收器，需要使用-xx:+UseG1GC来启用

- 优点

  - **并行与并发**
    - 并行性：G1在回收期间，可以有多个GC线程同时工作，有效利用多核计算能力。此时用户线程STW
    - 并发性：G1拥有与应用程序交替执行的能力，部分工作可以和应用程序同时执行，因此，一般来说，不会在整个回收阶段发生完全阻塞应用程序的情况
    
  - **分代收集**
  
    - 从分代上看，G1依然属于分代型垃圾回收器，它会区分年轻代和老年代，年轻代依然有Eden区和Survivor区。但从堆的结构上看，它不要求整个Eden区、年轻代或者老年代都是连续的，也不再坚持固定大小和固定数量
    - 将堆空间分为若干个区域（Region），这些区域中包含了逻辑上的年轻代和老年代
    - 和之前的各类回收器不同，它同时兼顾年轻代和老年代。对比其他回收器，或者工作在年轻代，或者工作在老年代
  
  - **空间整合**
  
    - CMS：“标记-清除”算法、内存碎片、若干次GC后进行一次碎片整理
    - G1将内存划分为一个个的region。内存的回收是以region作为基本单位的
    - Region之间是**复制算法**，但**整体上**实际可看作是**标记-压缩**（Mark-Compact）算法，两种算法都可以避免内存碎片。这种特性有利于程序长时间运行，分配大对象时不会因为无法找到连续内存空间而提前触发下一次GC。尤其是当Java堆非常大的时候，G1的优势更加明显
  
  - **可预测的停顿时间模型（即：软实时soft real-time）**
    - G1除了追求低停顿外，还能建立可预测的停顿时间模型，能让使用者明确指定在一个长度为M毫秒的时间片段内，消耗在垃圾收集上的时间不得超过N毫秒
    
    - 由于分区的原因，G1可以只选取部分区域进行内存回收，这样缩小了回收的范围，因此对于全局停顿情况的发生也能得到较好的控制
    - G1跟踪各个Region里面的垃圾堆积的价值大小（回收所获得的空间大小以及回收所需时间的经验值），在后台维护一个优先列表，每次根据允许的收集时间，优先回收价值最大的Region。保证了G1收集器在有限的时间内可以获取尽可能高的收集效率
    - 相比于CMSGC，G1未必能做到CMS在最好情况下的延时停顿，但是最差情况要好很多
  
- 缺点

  - 相较于CMS，G1还不具备全方位、压倒性优势。比如在用户程序运行过程中，G1无论是为了垃圾收集产生的**内存占用**（Footprint）还是程序运行时的**额外执行负载**（overload）都要比CMS要高

    > 从经验上来说，在小内存应用上CMS的表现大概率会优于G1，而G1在大内存应用上则发挥其优势。平衡点在6-8GB之间

- 参数设置

  - -XX:+UseG1GC：手动指定使用G1垃圾收集器执行内存回收任务
  - -XX:G1HeapRegionSize设置每个Region的大小。值是2的幂，范围是1MB到32MB之间，目标是根据最小的Java堆大小划分出约2048个区域。默认是堆内存的1/2000
  - -XX:MaxGCPauseMillis 设置期望达到的最大Gc停顿时间指标（JVM会尽力实现，但不保证达到）。默认值是200ms
  - -XX:+ParallelGcThread 设置STW工作线程数的值。最多设置为8
  - -XX:ConcGCThreads 设置并发标记的线程数。将n设置为并行垃圾回收线程数（ParallelGcThreads）的1/4左右
  - -XX:InitiatingHeapoccupancyPercent 设置触发并发Gc周期的Java堆占用率阈值。超过此值，就触发GC，默认值是45

- 步骤

  - 第一步：开启G1垃圾收集器
  - 第二步：设置堆的最大内存
  - 第三步：设置最大的停顿时间

  > G1中提供了三种垃圾回收模式：YoungGC、Mixed GC和FullGC，在不同的条件下被触发

- 适用场景

  - 面向服务端应用，针对具有大内存、多处理器的机器。（在普通大小的堆里表现并不惊喜）
  
  
    - 最主要的应用是低GC延迟，并具有大堆的应用程序提供解决方案
  
      > 如：在堆大小约6GB或更大时，可预测的暂停时间可以低于0.5秒；（G1通过每次只清理一部分而不是全部的Region的增量式清理来保证每次Gc停顿时间不会过长）
  
  
    - 用来替换掉JDK1.5中的CMS收集器；在下面的情况时，使用G1可能比CMS好
  
      - 超过50%的Java堆被活动数据占用
      - 对象分配频率或年代提升频率变化很大
      - GC停顿时间过长（长于0.5至1秒）
  
  
    - HotSpot垃圾收集器里，除了G1以外，其他的垃圾收集器使用内置的JVM线程执行GC的多线程操作，而G1GC可以采用应用线程承担后台运行的GC工作，即当JVM的GC线程处理速度慢时，系统会调用应用程序线程帮助加速垃圾回收过程
  


- 分区Region：化整为零

  - 使用G1收集器时，它将整个Java堆划分成约2048个大小相同的独立Region块，每个Region块大小根据堆空间的实际大小而定，整体被控制在1MB到32MB之间，且为2的N次幂，即1MB，2MB，4MB，8MB，16MB，32MB。可以通过XX:G1HeapRegionsize设定。所有的Region大小相同，且在JVM生命周期内不会被改变

  - 虽然还保留有新生代和老年代的概念，但新生代和老年代不再物理隔离，它们都是一部分Region（不需要连续）的集合。通过Region的动态分配方式实现逻辑上的连续
  - 一个region有可能属于Eden，Survivor或者old/Tenured内存区域。但是一个region只可能属于一个角色。E表示该region属于Eden内存区域，s表示属于survivor内存区域，o表示属于old内存区域，空白的表示未使用的内存空间
  - G1垃圾收集器还增加了一种新的内存区域，叫做Humongous内存区域，H块，主要用于存储大对象，如果超过1.5个region，就放到H

  - **设置H的原因：**对于堆中的大对象，默认直接会被分配到老年代，但是如果它是一个短期存在的大对象就会对垃圾收集器造成负面影响。为了解决这个问题，G1划分了一个Humongous区，它用来专门存放大对象。如果一个H区装不下一个大对象，那么G1会寻找连续的H区来存储。为了能找到连续的H区，有时候不得不启动FullGC。G1的大多数行为都把H区作为老年代的一部分来看待

  - 每个Region都是通过指针碰撞来分配空间

- Remembered Set（记忆集）---> 解决一个对象被不同区域引用的问题

  - 一个Region不可能是孤立的，一个Region中的对象可能被其他任意Region中对象引用，判断对象存活时，是否需要扫描整个Java堆才能保证准确？

  - 在其他的分代收集器，也存在这样的问题（而G1更突出）

    > 回收eden时，老年代中对象可能作为GCRoot
    >
    > 回收新生代也不得不同时扫描老年代？
    >
    > 这样的话会降低MinorGC的效率

  **解决方法：**

  - 无论G1还是其他分代收集器，JVM都是使用Remembered Set来避免全局扫描

  - 每个Region都有一个对应的Remembered Set；每次Reference类型数据写操作时，都会产生一个Write Barrier“写入屏障”暂时中断操作

  - 然后检查将要写入的引用指向的对象是否和该Reference类型数据在不同的Region（其他收集器：检查老年代对象是否引用了新生代对象），如果不同，通过cardTable把相关引用信息记录到引用指向对象的所在Region对应的Remembered Set中；当进行垃圾收集时，在GC根节点的枚举范围加入Remembered Set；就可以保证不进行全局扫描，也不会有遗漏

    ![image-20220911000050894](http://minio.botuer.com/study-node/old/typora202209110000998.png)

##### 回收过程

![image-20220910233608958](http://minio.botuer.com/study-node/old/typora202209110006925.png)

- 年轻代GC（Young GC）

  - JVM启动时，G1先准备好Eden区，程序在运行过程中不断创建对象到Eden区，当Eden空间耗尽时，G1会启动一次年轻代垃圾回收过程

  - YGC时，首先G1停止应用程序的执行（stop-The-World），G1创建回收集（Collection Set），回收集是指需要被回收的内存分段的集合，年轻代回收过程的回收集包含年轻代Eden区和Survivor区所有的内存分段

  - 开始回收

    - 扫描根

      > 根是指static变量指向的对象，正在执行的方法调用链条上的局部变量等。根引用连同RSet记录的外部引用作为扫描存活对象的入口

    - 更新RSet

      > 处理dirty card queue“脏卡队列”中的card，更新RSet。此阶段完成后，RSet可以准确的反映老年代对所在的内存分段中对象的引用

    - 处理RSet

      > 识别被老年代对象指向的Eden中的对象，这些被指向的Eden中的对象被认为是存活的对象

    - 复制对象

      > 此阶段，对象树被遍历，Eden区内存段中存活的对象会被复制到Survivor区中空的内存分段，Survivor区内存段中存活的对象如果年龄未达阈值，年龄会加1，达到阀值会被会被复制到old区中空的内存分段。如果Survivor空间不够，Eden空间的部分数据会直接晋升到老年代空间

    - 处理引用

      > 处理Soft，Weak，Phantom，Final，JNI Weak 等引用。最终Eden空间的数据为空，GC停止工作，而目标内存中的对象都是连续存储的，没有碎片，所以复制过程可以达到内存整理的效果，减少碎片

    ![](http://minio.botuer.com/study-node/old/typora202209110006780.png)

- 老年代并发标记过程（Concurrent Marking）

  - 初始标记阶段

    > 标记从根节点直接可达的对象。这个阶段是STW的，并且会触发一次年轻代GC

  - 根区域扫描（Root Region Scanning）

    > G1 GC扫描survivor区直接可达的老年代区域对象，并标记被引用的对象。这一过程必须在youngGC之前完成，否则可能会产生浮动垃圾

  - 并发标记（Concurrent Marking）

    > 在整个堆中进行并发标记（和应用程序并发执行），此过程可能被youngGC中断。在并发标记阶段，若发现区域对象中的**所有对象都是垃圾**，那这个**区域会被立即回收**。同时，并发标记过程中，会计算每个区域的对象活性（区域中存活对象的比例）

  - 再次标记（Remark）

    > 由于应用程序持续进行，需要修正上一次的标记结果。是STW的。G1中采用了比CMS更快的初始快照算法：snapshot-at-the-beginning（SATB）

  - 独占清理（cleanup，STW）

    > 计算各个区域的存活对象和GC回收比例，并进行排序，识别可以混合回收的区域。为下阶段做铺垫。会STW，这个阶段并不会实际上去做垃圾的收集

  - 并发清理阶段

    > 识别并清理完全空闲的区域

- 混合回收（Mixed GC）

  - 当越来越多的对象晋升到老年代old region时，为了避免堆内存被耗尽，虚拟机会触发一个混合的垃圾收集器，即Mixed GC

  - 该算法并不是一个old GC，除了回收整个Young Region，还会回收一部分的old Region

  - 这里需要注意：**是一部分老年代，而不是全部老年代**。可以选择哪些old Region进行收集，从而可以对垃圾回收的耗时时间进行控制。也要注意的是Mixed GC并不是Full GC

  - 并发标记结束以后，老年代中百分百为垃圾的内存分段被回收了，部分为垃圾的内存分段被计算了出来。默认情况下，这些老年代的内存分段会分8次被回收（可以通过-XX:G1MixedGCCountTarget设置）

  - 混合回收的回收集（Collection Set）包括八分之一的老年代内存分段，Eden区内存分段，Survivor区内存分段。**混合回收的算法和年轻代回收的算法完全一样**，**只是回收集多了老年代的内存分段**。具体过程请参考上面的年轻代回收过程

  - 由于老年代中的内存分段默认分8次回收，G1会优先回收垃圾多的内存分段。垃圾占内存分段比例越高的，越会被先回收。并且有一个阈值会决定内存分段是否被回收

    - XX:G1MixedGCLiveThresholdPercent，默认为65%，意思是垃圾占内存分段比例要达到65%才会被回收。如果垃圾占比太低，意味着存活的对象占比高，在复制的时候会花费更多的时间

    - 混合回收并不一定要进行8次。有一个阈值-XX:G1HeapWastePercent，默认值为10%，意思是允许整个堆内存中有10%的空间被浪费，意味着如果发现可以回收的垃圾占堆内存的比例低于10%，则不再进行混合回收。因为GC会花费很多的时间但是回收到的内存却很少

  ![image-20220911001225875](http://minio.botuer.com/study-node/old/typora202209110012980.png)

- 可选的过程 -- Full GC

  > 如果需要，单线程、独占式、高强度的FullGC还是继续存在的。它针对GC的评估失败提供了一种失败保护机制，即强力回收

  - G1的初衷就是要避免FullGC的出现。但是如果上述方式不能正常工作，G1会停止应用程序的执行（stop-The-world），使用单线程的内存回收算法进行垃圾回收，性能会非常差，应用程序停顿时间会很长
  - 要避免FullGC的发生，一旦发生需要进行调整。什么时候会发生FullGC呢？比如堆内存太小，当G1在复制存活对象的时候没有空的内存分段可用，则会回退到fullgc，这种情况可以通过增大内存解决
    导致FullGC的原因可能有两个
    - Evacuation的时候没有足够的to-space来存放晋升的对象
    - 并发处理过程完成之前空间耗尽

- 优化

  - 从oracle官方透露出来的信息可获知，回收阶段（Evacuation）其实本也有想过设计成与用户程序一起并发执行，但这件事情做起来比较复杂，考虑到G1只是回一部分Region，停顿时间是用户可控制的，所以并不迫切去实现，而选择把这个特性放到了G1之后出现的低延迟垃圾收集器（即ZGC）中。另外，还考虑到G1不是仅仅面向低延迟，停顿用户线程能够最大幅度提高垃圾收集效率，为了保证吞吐量所以才选择了完全暂停用户线程的实现方案

  - 年轻代大小

    - 避免使用-Xmn或-XX:NewRatio等相关选项显式设置年轻代大小

    - 固定年轻代的大小会覆盖


  - 暂停时间目标暂停时间目标不要太过严苛

    - G1 GC的吞吐量目标是90%的应用程序时间和10%的垃圾回收时间

    - 评估G1GC的吞吐量时，暂停时间目标不要太严苛。目标太过严苛表示你愿意承受更多的垃圾回收开销，而这些会直接影响到吞吐量

#### 垃圾回收器总结

- 垃圾收集器的组合关系
  - 两个收集器间有连线，表明它们可以搭配使用：Serial/Serial old、Serial/CMS、ParNew/Serial old、ParNew/CMS、Parallel Scavenge/Serial Old、Parallel Scavenge/Parallel Old、G1；
  - 其中Serial o1d作为CMs出现"Concurrent Mode Failure"失败的后备预案。
  - （红色虚线）由于维护和兼容性测试的成本，在JDK 8时将Serial+CMS、ParNew+Serial Old这两个组合声明为废弃（JEP173），并在JDK9中完全取消了这些组合的支持（JEP214），即：移除。
  - （绿色虚线）JDK14中：弃用Paralle1 Scavenge和Serialold GC组合（JEP366）
  - （青色虚线）JDK14中：删除CMs垃圾回收器（JEP363）

![image-20220910224821279](http://minio.botuer.com/study-node/old/typora202209102248383.png)

- 特点

  - 最小化地使用内存和并行开销，请选Serial GC

  - 最大化应用程序的吞吐量，请选Parallel GC

  - 最小化GC的中断或停顿时间，请选CMS GC

  - 官方推荐G1，性能高。现在互联网的项目，基本都是使用G1

    > - 优先调整堆的大小让JVM自适应完成
    > - 如果内存小于100M，使用串行收集器
    > - 如果是单核、单机程序，并且没有停顿时间的要求，串行收集器
    > - 如果是多CPU、需要高吞吐量、允许停顿时间超过1秒，选择并行或者JVM自己选择
    > - 如果是多CPU、追求低停顿时间，需快速响应（比如延迟不能超过1秒，如互联网应用），使用并发收集器

![image-20220911002402294](http://minio.botuer.com/study-node/old/typora202209110024533.png)

#### 新发展

- G1串行的FullGC、Card Table扫描的低效等，都已经被大幅改进，例如，JDK10以后，FullGC已经是并行运行，在很多场景下，其表现还略优于ParallelGC的并行FullGC实现

- 即使是SerialGC，虽然比较古老，但是简单的设计和实现未必就是过时的，它本身的开销，不管是GC相关数据结构的开销，还是线程的开销，都是非常小的，所以随着云计算的兴起，在serverless等新的应用场景下，Serial Gc找到了新的舞台

- 比较不幸的是CMSGC，因为其算法的理论缺陷等原因，虽然现在还有非常大的用户群体，但在JDK9中已经被标记为废弃，并在JDK14版本中移除

- Epsilon:A No-Op GarbageCollector（Epsilon垃圾回收器，"No-Op（无操作）"回收器）

- ZGC:A Scalable Low-Latency Garbage Collector（Experimental）（ZGC：可伸缩的低延迟垃圾回收器，处于实验性阶段）

- 现在G1回收器已成为默认回收器好几年了。我们还看到了引入了两个新的收集器：ZGC（JDK11出现）和Shenandoah（Open JDK12）

##### Shenandoash GC

- Open JDK12的shenandoash GC：低停顿时间的GC（实验性）

- Shenandoah，无疑是众多GC中最孤独的一个。是第一款不由oracle公司团队领导开发的Hotspot垃圾收集器。不可避免的受到官方的排挤。比如号称openJDK和OracleJDk没有区别的Oracle公司仍拒绝在oracleJDK12中支持Shenandoah

- Shenandoah垃圾回收器最初由RedHat进行的一项垃圾收集器研究项目Pauseless GC的实现，旨在针对JVM上的内存回收实现低停顿的需求。在2014年贡献给OpenJDK

- Red Hat研发Shenandoah团队对外宣称，Shenandoah垃圾回收器的暂停时间与堆大小无关，这意味着无论将堆设置为200MB还是200GB，99.9%的目标都可以把垃圾收集的停顿时间限制在十毫秒以内（在吹牛）。不过实际使用性能将取决于实际工作堆的大小和工作负载

  ![image-20220911015009695](http://minio.botuer.com/study-node/old/typora202209110150940.png)

  这是RedHat在2016年发表的论文数据，测试内容是使用Es对200GB的维基百科数据进行索引。从结果看：

  >停顿时间比其他几款收集器确实有了质的飞跃，但也未实现最大停顿时间控制在十毫秒以内的目标
  >而吞吐量方面出现了明显的下降，总运行时间是所有测试收集器里最长的

- 总结

  - shenandoah Gc的弱项：高运行负担下的吞吐量下降
  - shenandoah GC的强项：低延迟时间

##### 革命性的ZGC

ZGC与shenandoah目标高度相似，在尽可能对吞吐量影响不大的前提下，实现在任意堆内存大小下都可以把垃圾收集的停颇时间限制在十毫秒以内的低延迟

《深入理解Java虚拟机》一书中这样定义ZGC：ZGC收集器是一款基于Region内存布局的，（暂时）不设分代的，使用了读屏障、染色指针和内存多重映射等技术来实现可并发的标记-压缩算法的，以低延迟为首要目标的一款垃圾收集器

ZGC的工作过程可以分为4个阶段：**并发标记 - 并发预备重分配 - 并发重分配 - 并发重映射** 等

ZGC几乎在所有地方并发执行的，除了初始标记的是STW的。所以停顿时间几乎就耗费在初始标记上，这部分的实际时间是非常少的

JDK14之前，ZGC仅Linux才支持

尽管许多使用zGc的用户都使用类Linux的环境，但在Windows和macos上，人们也需要zGC进行开发部署和测试。许多桌面应用也可以从ZGC中受益。因此，ZGC特性被移植到了Windows和macos上

现在mac或Windows上也能使用ZGC了，示例如下：

```bash
-XX:+UnlockExperimentalVMOptions-XX：+UseZGC
```

### 日志分析

- 通过阅读GC日志，我们可以了解Java虚拟机内存分配与回收策略
  - -XX:+PrintGc输出GC日志。类似：-verbose:gc
  - -XX:+PrintGcDetails输出Gc的详细日志
  - -XX:+PrintGcTimestamps 输出Gc的时间戳（以基准时间的形式）
  - -XX:+PrintGCDatestamps 输出Gc的时间戳（以日期的形式，如2013-05-04T21：53：59.234+0800）
  - -XX:+PrintHeapAtGC在进行Gc的前后打印出堆的信息
  - -Xloggc:../logs/gc.1og日志文件的输出路径

#### PrintGC

> -XX:+PrintGc 同 -verbose:gc

![image-20220911002929339](http://minio.botuer.com/study-node/old/typora202209110029581.png)

![image-20220911002941544](http://minio.botuer.com/study-node/old/typora202209110029779.png)

#### PrintGCDetails

![image-20220911003107667](http://minio.botuer.com/study-node/old/typora202209110031900.png)

![image-20220911003116300](http://minio.botuer.com/study-node/old/typora202209110031537.png)

- [GC"和"[FullGC"说明了这次垃圾收集的停顿类型，如果有"Full"则说明GC发生了"stop The World"
- 使用Serial收集器在新生代的名字是Default New Generation，因此显示的是"[DefNew"
- 使用ParNew收集器在新生代的名字会变成"[ParNew"，意思是"Parallel New Generation"
- 使用Paralle1 scavenge收集器在新生代的名字是”[PSYoungGen"
- 老年代的收集和新生代道理一样，名字也是收集器决定的
- 使用G1收集器的话，会显示为"garbage-first heap"

- Allocation Failure"分配失败"表明本次引起GC的原因是因为在年轻代中没有足够的空间能够存储新的数据了

- [PSYoungGen：5986K->696K（8704K）]5986K->704K（9216K）中括号内：GC回收前年轻代大小，回收后大小，（年轻代总大小）括号外：GC回收前年轻代和老年代大小，回收后大小，（年轻代和老年代总大小）

- user代表用户态回收耗时，sys内核态回收耗时，rea实际耗时。由于多核的原因，时间总和可能会超过rea1时间

- YGC

  ![image-20220911003419599](http://minio.botuer.com/study-node/old/typora202209110034699.png)

- Full GC

  ![image-20220911003444179](http://minio.botuer.com/study-node/old/typora202209110034423.png)

```java
public class GCUseTest {
    static final Integer _1MB = 1024 * 1024;
    public static void main(String[] args) {
        byte [] allocation1, allocation2, allocation3, allocation4;
        allocation1 = new byte[2 *_1MB];
        allocation2 = new byte[2 *_1MB];
        allocation3 = new byte[2 *_1MB];
        allocation4 = new byte[4 *_1MB];
    }
}
```

```sh
-Xms20m -Xmx20m -Xmn10m -XX:+PrintGCDetails -XX:+UseSerialGC
```

```sh
1. "首先我们会将3个2M的数组存放到Eden区，然后后面4M的数组来了后，将无法存储，因为Eden区只剩下2M的剩余空间
2. "那么将会进行一次Young GC操作，将原来Eden区的内容，存放到Survivor区，但是Survivor区也存放不下
3. "那么就会直接晋级存入Old 区,然后我们将4M对象存入到Eden区中

[GC (Allocation Failure) [DefNew: 7855K->367K(9216K), 0.0075236 secs] 7855K->6511K(19456K), 0.0075520 secs] [Times: user=0.00 sys=0.01, real=0.00 secs] 
Heap
 def new generation   total 9216K, used 4786K [0x00000007bec00000, 0x00000007bf600000, 0x00000007bf600000)
  eden space 8192K,  53% used [0x00000007bec00000, 0x00000007bf050ba8, 0x00000007bf400000)
  from space 1024K,  35% used [0x00000007bf500000, 0x00000007bf55bdc0, 0x00000007bf600000)
  to   space 1024K,   0% used [0x00000007bf400000, 0x00000007bf400000, 0x00000007bf500000)
 tenured generation   total 10240K, used 6144K [0x00000007bf600000, 0x00000007c0000000, 0x00000007c0000000)
   the space 10240K,  60% used [0x00000007bf600000, 0x00000007bfc00030, 0x00000007bfc00200, 0x00000007c0000000)
 Metaspace       used 3160K, capacity 4496K, committed 4864K, reserved 1056768K
  class space    used 348K, capacity 388K, committed 512K, reserved 1048576K
```

#### 日志分析工具

> GCViewer、GCEasy、GCHisto、GCLogViewer、Hpjmeter、garbagecat等

**GCViewer**

![image-20220911014411084](http://imgs-1253920081.cos.ap-beijing.myqcloud.com/old/typora202209110144163.png)

**GC easy**

![image-20220911014501811](http://minio.botuer.com/study-node/old/typora202209110145208.png)

### 面试题

##### 蚂蚁金服

- 你知道哪几种垃圾回收器，各自的优缺点，重点讲一下CMS和G1？
- JVM GC算法有哪些，目前的JDK版本采用什么回收算法？
- G1回收器讲下回收过程GC是什么？为什么要有GC？
- GC的两种判定方法？CMS收集器与G1收集器的特点

##### 百度

- 说一下GC算法，分代回收说下
- 垃圾收集策略和算法

##### 天猫

- JVM GC原理，JVM怎么回收内存
- CMS特点，垃圾回收算法有哪些？各自的优缺点，他们共同的缺点是什么？

##### 滴滴

Java的垃圾回收器都有哪些，说下g1的应用场景，平时你是如何搭配使用垃圾回收器的

##### 京东

- 你知道哪几种垃圾收集器，各自的优缺点，重点讲下cms和G1，
- 包括原理，流程，优缺点。垃圾回收算法的实现原理

##### 阿里

- 讲一讲垃圾回收算法。
- 什么情况下触发垃圾回收？
- 如何选择合适的垃圾收集算法？
- JVM有哪三种垃圾回收器？

##### 字节跳动

- 常见的垃圾回收器算法有哪些，各有什么优劣？
- System.gc（）和Runtime.gc（）会做什么事情？
- Java GC机制？GC Roots有哪些？
- Java对象的回收方式，回收算法。
- CMS和G1了解么，CMS解决什么问题，说一下回收的过程。
- CMS回收停顿了几次，为什么要停顿两次?

## 指令手册

### 一、栈和局部变量操作

#### 将常量压入栈的指令

aconst_null 将null对象引用压入栈
iconst_m1 将int类型常量-1压入栈
iconst_0 将int类型常量0压入栈
iconst_1 将int类型常量1压入栈
iconst_2 将int类型常量2压入栈
iconst_3 将int类型常量3压入栈
iconst_4 将int类型常量4压入栈
iconst_5 将int类型常量5压入栈
lconst_0 将long类型常量0压入栈
lconst_1 将long类型常量1压入栈
fconst_0 将float类型常量0压入栈
fconst_1 将float类型常量1压入栈
dconst_0 将double类型常量0压入栈
dconst_1 将double类型常量1压入栈
bipush 将一个8位带符号整数压入栈
sipush 将16位带符号整数压入栈
ldc 把常量池中的项压入栈
ldc_w 把常量池中的项压入栈（使用宽索引）
ldc2_w 把常量池中long类型或者double类型的项压入栈（使用宽索引）

#### 从栈中的局部变量中装载值的指令

iload 从局部变量中装载int类型值
lload 从局部变量中装载long类型值
fload 从局部变量中装载float类型值
dload 从局部变量中装载double类型值
aload 从局部变量中装载引用类型值（refernce）
iload_0 从局部变量0中装载int类型值
iload_1 从局部变量1中装载int类型值
iload_2 从局部变量2中装载int类型值
iload_3 从局部变量3中装载int类型值
lload_0 从局部变量0中装载long类型值
lload_1 从局部变量1中装载long类型值
lload_2 从局部变量2中装载long类型值
lload_3 从局部变量3中装载long类型值
fload_0 从局部变量0中装载float类型值
fload_1 从局部变量1中装载float类型值
fload_2 从局部变量2中装载float类型值
fload_3 从局部变量3中装载float类型值
dload_0 从局部变量0中装载double类型值
dload_1 从局部变量1中装载double类型值
dload_2 从局部变量2中装载double类型值
dload_3 从局部变量3中装载double类型值
aload_0 从局部变量0中装载引用类型值
aload_1 从局部变量1中装载引用类型值
aload_2 从局部变量2中装载引用类型值
aload_3 从局部变量3中装载引用类型值
iaload 从数组中装载int类型值
laload 从数组中装载long类型值
faload 从数组中装载float类型值
daload 从数组中装载double类型值
aaload 从数组中装载引用类型值
baload 从数组中装载byte类型或boolean类型值
caload 从数组中装载char类型值
saload 从数组中装载short类型值

#### 将栈中的值存入局部变量的指令

istore 将int类型值存入局部变量
lstore 将long类型值存入局部变量
fstore 将float类型值存入局部变量
dstore 将double类型值存入局部变量
astore 将将引用类型或returnAddress类型值存入局部变量
istore_0 将int类型值存入局部变量0
istore_1 将int类型值存入局部变量1
istore_2 将int类型值存入局部变量2
istore_3 将int类型值存入局部变量3
lstore_0 将long类型值存入局部变量0
lstore_1 将long类型值存入局部变量1
lstore_2 将long类型值存入局部变量2
lstore_3 将long类型值存入局部变量3
fstore_0 将float类型值存入局部变量0
fstore_1 将float类型值存入局部变量1
fstore_2 将float类型值存入局部变量2
fstore_3 将float类型值存入局部变量3
dstore_0 将double类型值存入局部变量0
dstore_1 将double类型值存入局部变量1
dstore_2 将double类型值存入局部变量2
dstore_3 将double类型值存入局部变量3
astore_0 将引用类型或returnAddress类型值存入局部变量0
astore_1 将引用类型或returnAddress类型值存入局部变量1
astore_2 将引用类型或returnAddress类型值存入局部变量2
astore_3 将引用类型或returnAddress类型值存入局部变量3
iastore 将int类型值存入数组中
lastore 将long类型值存入数组中
fastore 将float类型值存入数组中
dastore 将double类型值存入数组中
aastore 将引用类型值存入数组中
bastore 将byte类型或者boolean类型值存入数组中
castore 将char类型值存入数组中
sastore 将short类型值存入数组中
wide指令
wide 使用附加字节扩展局部变量索引

#### 通用(无类型）栈操作

nop 不做任何操作
pop 弹出栈顶端一个字长的内容
pop2 弹出栈顶端两个字长的内容
dup 复制栈顶部一个字长内容
dup_x1 复制栈顶部一个字长的内容，然后将复制内容及原来弹出的两个字长的内容压入栈
dup_x2 复制栈顶部一个字长的内容，然后将复制内容及原来弹出的三个字长的内容压入栈
dup2 复制栈顶部两个字长内容
dup2_x1 复制栈顶部两个字长的内容，然后将复制内容及原来弹出的三个字长的内容压入栈
dup2_x2 复制栈顶部两个字长的内容，然后将复制内容及原来弹出的四个字长的内容压入栈
swap 交换栈顶部两个字长内容

### 二、类型转换

i2l 把int类型的数据转化为long类型
i2f 把int类型的数据转化为float类型
i2d 把int类型的数据转化为double类型
l2i 把long类型的数据转化为int类型
l2f 把long类型的数据转化为float类型
l2d 把long类型的数据转化为double类型
f2i 把float类型的数据转化为int类型
f2l 把float类型的数据转化为long类型
f2d 把float类型的数据转化为double类型
d2i 把double类型的数据转化为int类型
d2l 把double类型的数据转化为long类型
d2f 把double类型的数据转化为float类型
i2b 把int类型的数据转化为byte类型
i2c 把int类型的数据转化为char类型
i2s 把int类型的数据转化为short类型

### 三、整数运算

iadd 执行int类型的加法
ladd 执行long类型的加法
isub 执行int类型的减法
lsub 执行long类型的减法
imul 执行int类型的乘法
lmul 执行long类型的乘法
idiv 执行int类型的除法
ldiv 执行long类型的除法
irem 计算int类型除法的余数
lrem 计算long类型除法的余数
ineg 对一个int类型值进行取反操作
lneg 对一个long类型值进行取反操作
iinc 把一个常量值加到一个int类型的局部变量上

### 四、逻辑运算

#### 移位操作

ishl 执行int类型的向左移位操作
lshl 执行long类型的向左移位操作
ishr 执行int类型的向右移位操作
lshr 执行long类型的向右移位操作
iushr 执行int类型的向右逻辑移位操作
lushr 执行long类型的向右逻辑移位操作

#### 按位布尔运算

iand 对int类型值进行“逻辑与”操作
land 对long类型值进行“逻辑与”操作
ior 对int类型值进行“逻辑或”操作
lor 对long类型值进行“逻辑或”操作
ixor 对int类型值进行“逻辑异或”操作
lxor 对long类型值进行“逻辑异或”操作

#### 浮点运算

fadd 执行float类型的加法
dadd 执行double类型的加法
fsub 执行float类型的减法
dsub 执行double类型的减法
fmul 执行float类型的乘法
dmul 执行double类型的乘法
fdiv 执行float类型的除法
ddiv 执行double类型的除法
frem 计算float类型除法的余数
drem 计算double类型除法的余数
fneg 将一个float类型的数值取反
dneg 将一个double类型的数值取反

### 五、对象和数组

#### 对象操作指令

new 创建一个新对象
checkcast 确定对象为所给定的类型。后跟目标类，判断栈顶元素是否为目标类 / 接口的实例。如果不是便抛出异常
getfield 从对象中获取字段
putfield 设置对象中字段的值
getstatic 从类中获取静态字段
putstatic 设置类中静态字段的值
instanceof 判断对象是否为给定的类型。后跟目标类，判断栈顶元素是否为目标类 / 接口的实例。是则压入 1，否则压入 0

#### 数组操作指令

newarray 分配数据成员类型为基本上数据类型的新数组
anewarray 分配数据成员类型为引用类型的新数组
arraylength 获取数组长度
multianewarray 分配新的多维数组

### 六、控制流

#### 条件分支指令

ifeq 如果等于0，则跳转
ifne 如果不等于0，则跳转
iflt 如果小于0，则跳转
ifge 如果大于等于0，则跳转
ifgt 如果大于0，则跳转
ifle 如果小于等于0，则跳转
if_icmpcq 如果两个int值相等，则跳转
if_icmpne 如果两个int类型值不相等，则跳转
if_icmplt 如果一个int类型值小于另外一个int类型值，则跳转
if_icmpge 如果一个int类型值大于或者等于另外一个int类型值，则跳转
if_icmpgt 如果一个int类型值大于另外一个int类型值，则跳转
if_icmple 如果一个int类型值小于或者等于另外一个int类型值，则跳转
ifnull 如果等于null，则跳转
ifnonnull 如果不等于null，则跳转
if_acmpeq 如果两个对象引用相等，则跳转
if_acmpnc 如果两个对象引用不相等，则跳转

#### 比较指令

lcmp 比较long类型值
fcmpl 比较float类型值（当遇到NaN时，返回-1）
fcmpg 比较float类型值（当遇到NaN时，返回1）
dcmpl 比较double类型值（当遇到NaN时，返回-1）
dcmpg 比较double类型值（当遇到NaN时，返回1）

#### 无条件转移指令

goto 无条件跳转
goto_w 无条件跳转（宽索引）

#### 表跳转指令

tableswitch 通过索引访问跳转表，并跳转
lookupswitch 通过键值匹配访问跳转表，并执行跳转操作

#### 异常

athrow 抛出异常或错误。将栈顶异常抛出
finally子句
jsr 跳转到子例程
jsr_w 跳转到子例程（宽索引）
rct 从子例程返回

### 七、方法调用与返回

#### 方法调用指令

invokcvirtual 运行时按照对象的类来调用实例方法
invokespecial 根据编译时类型来调用实例方法
invokestatic 调用类（静态）方法
invokcinterface 调用接口方法

#### 方法返回指令

ireturn 从方法中返回int类型的数据
lreturn 从方法中返回long类型的数据
freturn 从方法中返回float类型的数据
dreturn 从方法中返回double类型的数据
areturn 从方法中返回引用类型的数据
return 从方法中返回，返回值为void

#### 线程同步

montiorenter 进入并获取对象监视器。即：为栈顶对象加锁
monitorexit 释放并退出对象监视器。即：为栈顶对象解锁

### 八、JVM指令助记符

变量到操作数栈：iload,iload_,lload,lload_,fload,fload_,dload,dload_,aload,aload_
操作数栈到变量：istore,istore_,lstore,lstore_,fstore,fstore_,dstore,dstor_,astore,astore_
常数到操作数栈：bipush,sipush,ldc,ldc_w,ldc2_w,aconst_null,iconst_ml,iconst_,lconst_,fconst_,dconst_
加：iadd,ladd,fadd,dadd
减：isub,lsub,fsub,dsub
乘：imul,lmul,fmul,dmul
除：idiv,ldiv,fdiv,ddiv
余数：irem,lrem,frem,drem
取负：ineg,lneg,fneg,dneg
移位：ishl,lshr,iushr,lshl,lshr,lushr
按位或：ior,lor
按位与：iand,land
按位异或：ixor,lxor
类型转换：i2l,i2f,i2d,l2f,l2d,f2d(放宽数值转换)
i2b,i2c,i2s,l2i,f2i,f2l,d2i,d2l,d2f(缩窄数值转换)
创建类实便：new
创建新数组：newarray,anewarray,multianwarray
访问类的域和类实例域：getfield,putfield,getstatic,putstatic
把数据装载到操作数栈：baload,caload,saload,iaload,laload,faload,daload,aaload
从操作数栈存存储到数组：bastore,castore,sastore,iastore,lastore,fastore,dastore,aastore
获取数组长度：arraylength
检相类实例或数组属性：instanceof,checkcast
操作数栈管理：pop,pop2,dup,dup2,dup_xl,dup2_xl,dup_x2,dup2_x2,swap
有条件转移：ifeq,iflt,ifle,ifne,ifgt,ifge,ifnull,ifnonnull,if_icmpeq,if_icmpene,
if_icmplt,if_icmpgt,if_icmple,if_icmpge,if_acmpeq,if_acmpne,lcmp,fcmpl
fcmpg,dcmpl,dcmpg
复合条件转移：tableswitch,lookupswitch
无条件转移：goto,goto_w,jsr,jsr_w,ret
调度对象的实便方法：invokevirtual
调用由接口实现的方法：invokeinterface
调用需要特殊处理的实例方法：invokespecial
调用命名类中的静态方法：invokestatic
方法返回：ireturn,lreturn,freturn,dreturn,areturn,return
异常：athrow
finally关键字的实现使用：jsr,jsr_w,ret

## Class字节码文件结构

### class字节码文件结构

| 类型           | 名称                | 说明                   | 长度    | 数量                  |
| -------------- | ------------------- | ---------------------- | ------- | --------------------- |
| u4             | magic               | 魔数,识别Class文件格式 | 4个字节 | 1                     |
| u2             | minor_version       | 副版本号(小版本)       | 2个字节 | 1                     |
| u2             | major_version       | 主版本号(大版本)       | 2个字节 | 1                     |
| u2             | constant_pool_count | 常量池计数器           | 2个字节 | 1                     |
| cp_info        | constant_pool       | 常量池表               | n个字节 | constant_pool_count-1 |
| u2             | access_flags        | 访问标识               | 2个字节 | 1                     |
| u2             | this_class          | 类索引                 | 2个字节 | 1                     |
| u2             | super_class         | 父类索引               | 2个字节 | 1                     |
| u2             | interfaces_count    | 接口计数器             | 2个字节 | 1                     |
| u2             | interfaces          | 接口索引集合           | 2个字节 | interfaces_count      |
| u2             | fields_count        | 字段计数器             | 2个字节 | 1                     |
| field_info     | fields              | 字段表                 | n个字节 | fields_count          |
| u2             | methods_count       | 方法计数器             | 2个字节 | 1                     |
| method_info    | methods             | 方法表                 | n个字节 | methods_count         |
| u2             | attributes_count    | 属性计数器             | 2个字节 | 1                     |
| attribute_info | attributes          | 属性表                 | n个字节 | attributes_count      |

### Class文件版本号和平台的对应

| 主版本（十进制） | 副版本（十进制） | 编译器版本 |
| ---------------- | ---------------- | ---------- |
| 45               | 3                | 1.1        |
| 46               | 0                | 1.2        |
| 47               | 0                | 1.3        |
| 48               | 0                | 1.4        |
| 49               | 0                | 1.5        |
| 50               | 0                | 1.6        |
| 51               | 0                | 1.7        |
| 52               | 0                | 1.8        |
| 53               | 0                | 1.9        |
| 54               | 0                | 1.10       |
| 55               | 0                | 1.11       |



### class文件数据类型

| 数据类型 | 定义                                                         | 说明                                                         |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 无符号数 | 无符号数可以用来描述数字、索引引用、数量值或按照utf-8编码构成的字符串值。 | 其中无符号数属于基本的数据类型。 以u1、u2、u4、u8来分别代表1个字节、2个字节、4个字节和8个字节 |
| 表       | 表是由多个无符号数或其他表构成的复合数据结构。               | 所有的表都以“_info”结尾。 由于表没有固定长度，所以通常会在其前面加上个数说明。 |

### 类型描述符

| 标志符 | 含义                                                 |
| ------ | ---------------------------------------------------- |
| B      | 基本数据类型byte                                     |
| C      | 基本数据类型char                                     |
| D      | 基本数据类型double                                   |
| F      | 基本数据类型float                                    |
| I      | 基本数据类型int                                      |
| J      | 基本数据类型long                                     |
| S      | 基本数据类型short                                    |
| Z      | 基本数据类型boolean                                  |
| V      | 代表void类型                                         |
| L      | 对象类型，比如：`Ljava/lang/Object;`                 |
| [      | 数组类型，代表一维数组。比如：`double[][][] is [[[D` |

### 常量类型和结构

| 类型                             | 标志(或标识) | 描述                   |
| -------------------------------- | ------------ | ---------------------- |
| CONSTANT_utf8_info               | 1            | UTF-8编码的字符串      |
| CONSTANT_Integer_info            | 3            | 整型字面量             |
| CONSTANT_Float_info              | 4            | 浮点型字面量           |
| CONSTANT_Long_info               | 5            | 长整型字面量           |
| CONSTANT_Double_info             | 6            | 双精度浮点型字面量     |
| CONSTANT_Class_info              | 7            | 类或接口的符号引用     |
| CONSTANT_String_info             | 8            | 字符串类型字面量       |
| CONSTANT_Fieldref_info           | 9            | 字段的符号引用         |
| CONSTANT_Methodref_info          | 10           | 类中方法的符号引用     |
| CONSTANT_InterfaceMethodref_info | 11           | 接口中方法的符号引用   |
| CONSTANT_NameAndType_info        | 12           | 字段或方法的符号引用   |
| CONSTANT_MethodHandle_info       | 15           | 表示方法句柄           |
| CONSTANT_MethodType_info         | 16           | 标志方法类型           |
| CONSTANT_InvokeDynamic_info      | 18           | 表示一个动态方法调用点 |

### 常量类型和结构细节

![1598773300484](http://minio.botuer.com/study-node/old/typora202209210945008.png)

![1598773308492](http://minio.botuer.com/study-node/old/typora202209210945036.png)

### 访问标志

| 标志名称       | 标志值 | 含义                                                         |
| -------------- | ------ | ------------------------------------------------------------ |
| ACC_PUBLIC     | 0x0001 | 标志为public类型                                             |
| ACC_FINAL      | 0x0010 | 标志被声明为final，只有类可以设置                            |
| ACC_SUPER      | 0x0020 | 标志允许使用invokespecial字节码指令的新语义，JDK1.0.2之后编译出来的类的这个标志默认为真。（使用增强的方法调用父类方法） |
| ACC_INTERFACE  | 0x0200 | 标志这是一个接口                                             |
| ACC_ABSTRACT   | 0x0400 | 是否为abstract类型，对于接口或者抽象类来说，次标志值为真，其他类型为假 |
| ACC_SYNTHETIC  | 0x1000 | 标志此类并非由用户代码产生（即：由编译器产生的类，没有源码对应） |
| ACC_ANNOTATION | 0x2000 | 标志这是一个注解                                             |
| ACC_ENUM       | 0x4000 | 标志这是一个枚举                                             |



### 字段表访问标志

| 标志名称      | 标志值 | 含义                       |
| ------------- | ------ | -------------------------- |
| ACC_PUBLIC    | 0x0001 | 字段是否为public           |
| ACC_PRIVATE   | 0x0002 | 字段是否为private          |
| ACC_PROTECTED | 0x0004 | 字段是否为protected        |
| ACC_STATIC    | 0x0008 | 字段是否为static           |
| ACC_FINAL     | 0x0010 | 字段是否为final            |
| ACC_VOLATILE  | 0x0040 | 字段是否为volatile         |
| ACC_TRANSTENT | 0x0080 | 字段是否为transient        |
| ACC_SYNCHETIC | 0x1000 | 字段是否为由编译器自动产生 |
| ACC_ENUM      | 0x4000 | 字段是否为enum             |

### 类索引、父类索引、接口索引

| 长度 | 含义                         |
| ---- | ---------------------------- |
| u2   | this_class                   |
| u2   | super_class                  |
| u2   | interfaces_count             |
| u2   | interfaces[interfaces_count] |



### 属性的通用格式

| 类型 | 名称                 | 数量             | 含义       |
| ---- | -------------------- | ---------------- | ---------- |
| u2   | attribute_name_index | 1                | 属性名索引 |
| u4   | attribute_length     | 1                | 属性长度   |
| u1   | info                 | attribute_length | 属性表     |



### 数据类型和默认初始值

| 类型      | 默认初始值 |
| --------- | ---------- |
| byte      | (byte)0    |
| short     | (short)0   |
| int       | 0          |
| long      | 0L         |
| float     | 0.0f       |
| double    | 0.0        |
| char      | \u0000     |
| boolean   | false      |
| reference | null       |

