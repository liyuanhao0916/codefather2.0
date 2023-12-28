# C语言

## 内存

### 内存单元

一个小的单元到底是多大？（1个字节）

> - 对于32位的机器，假设有32根地址线
>
> - 那么假设每根地址线在寻址的时候产生高电平（高电压）和低电平（低电压）就是（1或者0）；
>
> - 那么32根地址线产生的地址就会是：2的32次方个地址
>
>   ```
>   00000000 00000000 00000000 00000000
>   ... ...
>   11111111 11111111 11111111 11111111
>   ```
>
> - 每个地址标识一个Bit，那我们就可以给512MB的空间进行编址
>
>   ```
>   2^32Bit /8/1024/1024/1024 = 2^(-1)GB = 512MB
>   ```
>
> - 每个地址标识一个字节，那我们就可以给4G的空闲进行编址
>
>   ```
>   （2^32Byte = 2^32/1024/1024/1024GB = 4GB）
>   ```
>
> - 经过仔细的计算和权衡我们发现一个字节给一个对应的地址是比较合适的
>
> - 32个地址线 ------> 32Bit ------> 4Byte

### 整形内存

#### 原反补

- 在计算机系统中，数值一律用补码来表示和存储。原因在于，使用补码，可以将符号位和数值域统一处理
- 同时，加法和减法也可以统一处理（CPU只有加法器）此外，补码与原码相互转换，其运算过程是相同的，不需要额外的硬件电路

#### 大小端

- 小端（存储）模式，是指数据的低位保存在内存的低地址中，而数据的高位，保存在内存的高地址中

- 在计算机系统中，我们是以字节为单位的，每个地址单元都对应着一个字节，一个字节为8bit

- 但是在C语言中除了8 bit的char之外，还有16 bit的short型，32 bit的long型（要看具体的编译器）

- 另外，对于位数大于8位的处理器，例如16位或者32位的处理器，由于寄存器宽度大于一个字节，那么必然存在着一个如何将多个字节安排的问题。因此就导致了大端存储模式和小端存储模式

  > - short 型x ，在内存中的地址为0x0010，x的值为0x1122 -----> ‭0001 0001 0010 0010‬
  > - 0x11 -----> ‭0001 0001就是高位，0x22 -----> 0010 0010‬就是低位
  > - 小端：高位在高地址，低位在低地址，所以内存中为 ----> 0010 0010‬ 0001 0001 ----> 跟想象的相反
  > - 常用的X86 结构是小端模式，而KEIL C51 则为大端模式。很多的ARM，DSP都为小端模式。有些ARM处理器还可以由硬件来选择是大端模式还是小端模式

- 判断大小端存储的代码

  ```c
  // 方式一：对int变量取地址，强转为char*,截断时，从指针地址的起始处截取1Byte
  // 解引用后仍然==int变量值，即为小端存储
  int check_sys(){
      int i = 1;
      return (*(char *)&i);
  }
  // 方式二：根据联合类型的特点，联合体中所有变量引用的是同一个地址，不同类型变量的截取的大小不同
  int check_sys() {
      union {
          int i;
          char c;
      } un;
      un.i = 1;
      return un.c;
  }
  ```

#### 类型转换

- 与java区别

  ```c
  short int i = 1;
  float f = 2.2f;
  i = i+f; // 发生类型转换
  // -----  java --------
  short a = 1;
  float f = 1.1f;
  a = a + f;	// 编译失败
  short s = a + 1;	// 编译失败
  ```

- C的整型算术运算总是至少以缺省整型类型的精度来进行的，为了获得这个精度，表达式中的字符和短整型操作数在使用之前被转换为普通整型 ---- **只要发生运算就提升**

  > - 表达式的整型运算要在CPU的相应运算器件内执行，CPU内整型运算器(ALU)的操作数的字节长度一般就是int的字节长度，同时也是CPU的通用寄存器的长度，因此，即使两个char类型的相加，在CPU执行时实际上也要先转换为CPU内整型操作数的标准长度
  >
  > - 通用CPU（general-purpose CPU）是难以直接实现两个8比特字节直接相加运算（虽然机器指令
  >   中可能有这种字节相加指令）。所以，表达式中各种长度可能小于int长度的整型值，都必须先转
  >   换为int或unsigned int，然后才能送入CPU去执行运算
  >
  > - 整形提升是按照变量的数据类型的符号位来提升的
  >   - 负数提升 ---- 高位补1
  >   - 正数提升 ---- 高位补0
  >   - 无符号提升 ---- 高位补0

  ```c
  // b和c的值被提升为普通整型，然后再执行加法运算
  char a,b,c;
  ...
  // 加法运算完成之后，结果将被截断，然后再存储于a中
  a = b + c;
  ```

- [练习](#类型)

### 浮点型内存

- 根据国际标准IEEE（电气和电子工程协会） 754，二进制浮点数V表示为：`(-1)^S * M * 2^E`

  - (-1)^S表示符号位，当S=0，V为正数；当S=1，V为负数
  - M表示有效数字，大于等于1，小于2
    - 由于有效数字M都是1开头，存的时候只存小数部分，用的时候再加上
  - 2^E表示指数位
    - 指数E可能是负数，所以为了方便，存的时候统一加上中间数（127、1023），用的时候再减去
    - **全为0时，指数为-127（或-1023），此时M不加1，代表无穷小**
    - 全为1时，指数很大，代表正负无穷大
  - 32位的浮点数，S占1位，E占8位，M占23位
  - 64位的浮点数，S占1位，E占11位，M占52位

  > 101.0 ----> 1.01 × 2 ^ 2  -----> S = 0，M = 1.01，E = 2
  >
  > 0.5（1/2） ----> 0.1 ----> S = 0，M = 1，E = -1   ----> 0 01111110 00000000000000000000000
  >
  > - S存储的是0
  > - M存储的是0，补齐23位
  > - E存储的是-1+127=126，01111110

  ```c
  int main() {
      int n = 9;
      float *pFloat = (float *) &n;
      // 00000000 00000000 00000000 00001001
      // S = 0,E = 00000000,M = 0000000 00000000 00001001
      // E为全0，无穷小
      printf("n的值为：%d\n", n);             // n的值为：9
      printf("*pFloat的值为：%f\n", *pFloat); // *pFloat的值为：0.000000
      
      *pFloat = 9.0;	// 1.001*10^3
      // S = 0,E = 3+127 = 10000010‬,M = 0010000 00000000 00000000
      // 01000001 00010000 00000000 00000000 ----> 1091567616
      printf("num的值为：%d\n", n);           // num的值为：1091567616
      printf("*pFloat的值为：%f\n", *pFloat); // *pFloat的值为：9.000000
      return 0;
  }
  ```

### 内存分配

1. 栈区（stack）：在执行函数时，函数内局部变量的存储单元都可以在栈上创建，函数执行结束时这些存储单元自动被释放。栈内存分配运算内置于处理器的指令集中，效率很高，但是分配的内存容量有限。 栈区主要存放运行函数而分配的局部变量、函数参数、返回数据、返回地址等
2. 堆区（heap）：一般由程序员分配释放， 若程序员不释放，程序结束时可能由OS回收 。分配方式类似于链表
3. 数据段（静态区）（static）存放全局变量、静态数据。程序结束后由系统释放
4. 代码段：存放函数体（类成员函数和全局函数）的二进制代码

![image-20230120140458393](http://minio.botuer.com/study-node/old/image-20230120140458393.png)

## 编译链接

源文件  ---> 通过编译器 ---> 目标文件 ---> 通过链接器 + 链接库 ---> 可执行程序

- 组成一个程序的每个源文件通过编译过程分别转换成目标代码（object code）
- 每个目标文件由链接器（linker）捆绑在一起，形成一个单一而完整的可执行程序
- 链接器同时也会引入标准C函数库中任何被该程序所用到的函数，而且它可以搜索程序员个人的程序库，将其需要的函数也链接到程序中

### 编译

- 预处理（预编译） 选项gcc -E test.c  --------- 预处理完成之后就停下来，预处理之后产生的结果都放在test.i文件中

  > 处理`#include` --- 引入用到的函数信息
  >
  > 处理`#define` --- 替换为值
  >
  > 删除注释 ---- 使用空格替换

- 编译 选项 gcc -S test.c  ------------ 编译完成之后就停下来，结果保存在test.s中

  > 翻译为汇编代码
  >
  > - 语法分析
  > - 词法分析
  > - 语义分析
  > - 符号汇总 --- 函数名、全局变量

- 汇编 gcc -c test.c  ------------- 汇编完成之后就停下来，结果保存在test.o中

  > 翻译为二进制语言
  >
  > - 形成符号表
  > - 符号表的合并、符号表的重定位
  >   - 多个源文件，符号在别处定义，此处引用
  >   - 引用处的在符号表的地址无意义，找不到定义
  >   - 需要合并为一张表，并且进行重定位，才能找到定义的地方

### 预编译

#### 预定义符号

```c
__FILE__ //进行编译的源文件
__LINE__ //文件当前的行号
__DATE__ //文件被编译的日期
__TIME__ //文件被编译的时间
__FUNCTION__ //当前函数名
__STDC__ //如果编译器遵循ANSI C，其值为1，否则未定义
    
printf("file:%s line:%d\n", __FILE__, __LINE__);
```

#### #define

> **结尾不要加分号**，会带着分号替换，导致某些情况无法执行

```c
#define name stuff
```

```c
#define MAX 1000
#define reg register 		//为register这个关键字，创建一个简短的名字
#define do_forever for(;;) 	//用更形象的符号来替换一种实现
#define CASE break;case 	//在写case语句的时候自动把 break写上。
// 如果定义的 stuff过长，可以分成几行写，除了最后一行外，每行的后面都加一个反斜杠(续行符)
#define DEBUG_PRINT printf("file:%s\tline:%d\t \
        date:%s\ttime:%s\n" ,\
        __FILE__,__LINE__ , \
        __DATE__,__TIME__ )
```

#### 条件编译

```c
//常量表达式由预处理器求值
#define __DEBUG__ 1
#if __DEBUG__
	//..
#endif


// 多个分支的条件编译
#if 常量表达式
	//...
#elif 常量表达式
	//...
#else
	//...
#endif

// 判断是否被定义
#if defined(symbol)
#ifdef symbol			// 与上等价

#if !defined(symbol)
#ifndef symbol			// 与上等价

// 嵌套指令
#if defined(OS_UNIX)
    #ifdef OPTION1
    	unix_version_option1();
    #endif
    #ifdef OPTION2
    	unix_version_option2();
    #endif
#elif defined(OS_MSDOS)
    #ifdef OPTION2
    	msdos_version_option2();
    #endif
#endif
```

#### #include

- 预处理器先删除这条指令，并用包含文件的内容替换

- 这样一个源文件被包含10次，那就实际被编译10次

- 头文件被包含的方式

  - 本地文件`#include "filename"`

    > 先在源文件所在目录下查找，如果该头文件未找到，编译器就像查找库函数头文件一样在标准位置查找头文件，如果找不到就提示编译错误
    >
    > Linux环境的标准头文件的路径：`/usr/include`
    >
    > VS环境的标准头文件的路径：`C:\Program Files (x86)\Microsoft Visual Studio 12.0\VC\include`

  - 库文件包含`#include <filename.h>` --- “”查找范围大，用“”也可以，就是慢

- 嵌套文件包含问题的解决 --- 条件编译

  ```c
  #ifndef __TEST_H__
  #define __TEST_H__
  
  //头文件的内容
  #endif
  ```

  或者

  ```c
  #pragma once
  ```

### 运行

程序执行的过程：

- 程序必须载入内存中。在有操作系统的环境中：一般这个由操作系统完成。在独立的环境中，程序的载入必须由手工安排，也可能是通过可执行代码置入只读内存来完成

- 程序的执行便开始。接着便调用main函数

- 开始执行程序代码。这个时候程序将使用一个运行时堆栈（stack），存储函数的局部变量和返回地址。程序同时也可以使用静态（static）内存，存储于静态内存中的变量在程序的整个执行过程一直保留他们的值
- 终止程序。正常终止main函数；也有可能是意外终止

## 变量

### 数据类型

```c
char //字符数据类型
    unsigned char
short //短整型
    unsigned short
int //整形
    unsigned int
long //长整型
    unsigned long
long long //更长的整形
float //单精度浮点数
double //双精度浮点数
    
> 数组类型
> 结构体类型 struct
> 枚举类型 enum
> 联合类型 union

// 指针类型
int *pi;
char *pc;
float* pf;
void* pv;

// 空类型
void 表示空类型（无类型） ---- 通常应用于函数的返回类型、函数的参数、指针类型
```

### 分类

> 当局部变量和全局变量**同名**的时候，**局部变量优先使用**

```c
#include <stdio.h>

int global = 2019;//全局变量
int main()
{
    int local = 2018;//局部变量
    //下面定义的global会不会有问题？
    int global = 2020;//局部变量
    printf("global = %d\n", global);
    return 0;
}
```

### 常量

- 字面常量

- const 修饰的**常变量**

  > const 修饰的常变量在C语言中只是在语法层面限制了，变量pai 不能直接被改变，但是本质上还是一个变量，所以叫常变量

- #define 定义的标识符常量

- 枚举常量

  > 枚举常量的默认是从0开始，依次向下递增1的

```c
#include <stdio.h>

//括号中的MALE,FEMALE,SECRET是枚举常量
enum Sex {
    MALE,
    FEMALE,
    SECRET
};


int main() {
    3.14;//字面常量
    const float pai = 3.14f; //const 修饰的常变量
#define MAX 100 // #define的标识符常量
    
    //枚举常量：枚举常量的默认是从0开始，依次向下递增1的
    printf("%d\n", MALE);
    printf("%d\n", FEMALE);
    printf("%d\n", SECRET);
    return 0;
}
```

### 字符串

> 注意：
>
> - \0
> - 转义字符"c:\test\628\test.c" --- >  c:      est28   est.c    ---> len = 14

```c
#include <stdio.h>
//突出'\0'的重要性
int main()
{
    char arr1[] = "bit";
    char arr2[] = {'b', 'i', 't'};
    char arr3[] = {'b', 'i', 't', '\0'};
    printf("%s\n", arr1);	// bit
    printf("%s\n", arr2);	// bitbit 【第一个bit是自己的，第二个bit是arr3的】
    printf("%s\n", arr3);	// bit
    return 0;
}
```

## 关键字

### extern

引入别处定义的函数

### typedef

 --- 类型重命名

```c
typedef unsigned int uint_32;
```

### static

- 修饰局部变量-称为静态局部变量

  > static修饰局部变量改变了变量的生命周期，让静态局部变量出了作用域依然存在，直到程序结束

- 修饰全局变量-称为静态全局变量

- 修饰函数-称为静态函数

  > 一个**全局变量或函数**，被static修饰，使这个全局变量只能在本源文件内使用，不能在其他源文件内使用

### #define 

定义常量和宏

```c
//define定义标识符常量
#define MAX 1000
//define定义宏
#define ADD(x, y) ((x)+(y))
```

### const

const修饰指针变量的时候：
- const如果放在*的左边`const int* p = &n`，修饰的是指针指向的内容，保证指针指向的内容不能通过指针来改变。但是指针变量本身的内容可变

- const如果放在*的右边`int *const p = &n`，修饰的是指针变量本身，保证了指针变量的内容不能修改，但是指针指向的内容，可以通过指针改变
- 都有时，指针和变量本身都不能再被修改，`const int *const p = &n`

## 数组

- 数组创建，在C99标准之前， [] 中要给一个常量才可以，不能使用变量
- **在C99标准支持了变长数组的概念，可以不写数组大小，也可以使用变量**
  - gcc只存C99标准
  - 但是一些编译器仍不支持
  - 跨平台时不要使用
- 二维数组如果有初始化，行可以省略，列不能省略

- 数组元素个数`sizeof(arr)/sizeof(arr[0])`
- 数组名
  - 数组名一般是首元素的地址
  - `sizeof(arr)`，`&arr` 时，代表整个数组

## 错误

- strerror ---  把错误码对应的错误信息的字符串地址返回
- perror ---- 把指定的信息 + ": " + 错误码对应的错误信息

## 函数

### 字符串

```c
size_t strlen ( const char * str );	// 长度 ----- 串必须以\0结尾，返回长度不含\0，返回值是无符号的
char* strcpy(char * destination, const char * source );	// 复制 -- 目标空间必须可变，足够大
char * strcat ( char * destination, const char * source );	// 将source追加到destination
int strcmp ( const char * str1, const char * str2 );	// 比较 -- 第一个串大于第二个串，返回>0的数字

char * strncpy ( char * destination, const char * source, size_t num );	// 复制n个到目标
char * strncat ( char * destination, const char * source, size_t num );
int strncmp ( const char * str1, const char * str2, size_t num );	// 比较直到不一样、结束或num为止
char * strstr ( const char *str1, const char * str2);	// 比较第一次出现子串的指针
char * strtok ( char * str, const char * sep );	// str用sep切割（多个字符是或的关系），切分后剩下的会临时拷贝，供继续切割，str不为null，返回第一个，为null，返回下一个
char * strerror ( int errnum );	// 返回错误码，所对应的错误信息

is...;
int tolower ( int c );
int toupper ( int c );
```

```c
int main(){
    char *p = "zhangpengwei@bitedu.tech";
    const char* sep = ".@";
    char arr[30];
    char *str = NULL;
    strcpy(arr, p);//将数据拷贝一份，处理arr数组的内容
    
    for(str=strtok(arr, sep); str != NULL; str=strtok(NULL, sep)){
    	printf("%s\n", str);	// zhangpengwei	bitedu	tech
    }
}
```

### 内存

```c
void * memcpy ( void * destination, const void * source, size_t num );	// 复制，内存复制，遇\0不停，有重复的地址，返回未定义
void * memmove ( void * destination, const void * source, size_t num );	// 移动，可以有重复地址
int memcmp ( const void * ptr1, const void * ptr2, size_t num );	// 比较
```

## 宏

### offsetof

返回结构体的成员相对结构体的偏移量

### 声明

> #define 机制包括了一个规定，允许把参数替换到文本中，这种实现通常称为（macro）或定义宏（define macro）
>
> ```c
> #define name( parament-list ) stuff
> // 其中的parament-list 是一个由逗号隔开的符号表（参数），替换成stuff
> ```

```c
#define SQUARE( x ) x * x
int a = 5;
printf("%d\n" ,SQUARE( a + 1) );	// 不是36，而是11
```

> **宏是替换，而不是传参**，定义时加括号
>
> ```c
> int a = 5;
> 
> #define SQUARE(x) (x) * (x)
> printf ("%d\n",(a + 1) * (a + 1) );	 // 36
> 
> #define DOUBLE(x) (x) + (x)
> printf("%d\n" ,10 * DOUBLE(a));		// 55 --- 不是预想的
> #define DOUBLE(x) ((x) + (x))		// 改后
> ```
>
> **定义宏时多加括号**

### 替换规则

- 在调用宏时，首先对参数进行检查，看看是否包含任何由#define定义的符号。如果是，它们首先被替换
- 替换文本随后被插入到程序中原来文本的位置。对于宏，参数名被他们的值替换
- 最后，再次对结果文件进行扫描，看看它是否包含任何由#define定义的符号。如果是，就重复上述处理过程

> 宏参数和#define 定义中**可以出现其他**#define定义的变量。但是对于宏，**不能出现递归**
>
> 当预处理器搜索#define定义的符号的时候，字符串常量的内容并不被搜索，那怎么替换呢？
>
> - #VALUE会以**字符串**的形式被替换
>
> ```c
> int i = 10;
> #define PRINT(FORMAT, VALUE)\
> 	printf("the value of " #VALUE "is "FORMAT "\n", VALUE);
> ...
> PRINT("%d",i+3);	// the value of i+3 is 13
> ```
>
> - ##可以把位于它两边的符号合成一个符号。它允许宏定义从分离的文本片段创建**标识符**
>
> ```c
> #define CAT(X,Y) X##Y
> 
> int class84 = 2023;
> printf("%d\n",CAT(class,84)); // class##84 --> class84 --> 2023
> 
> 
> #define ADD_TO_SUM(num, value) \
> 	sum##num += value;
> ADD_TO_SUM(5, 10);	//sum##5 += 10 --> sum5 += 10 --> sum5增加10
> ```

### 参数副作用

> 当宏参数在宏的定义中出现超过一次的时候，如果参数带有副作用，那么你在使用这个宏的时候就可能出现危险，导致不可预测的后果。副作用就是表达式求值的时候出现的永久性效果
>
> ```c
> x+1;//不带副作用
> x++;//带有副作用
> ```

MAX宏可以证明具有副作用的参数所引起的问题

```c
#define MAX(a, b) ( (a) > (b) ? (a) : (b) )
...
x = 5;
y = 8;
z = MAX(x++, y++);	//((x++)>(y++)?(x++):(y++))
printf("x=%d y=%d z=%d\n", x, y, z); // 6 10 9
```

### 与函数

- 优点
  - 用于调用函数和从函数返回的代码可能比实际执行这个小型计算工作所需要的时间更多。所以宏比函数在程序的**规模和速度方面更胜一筹**
  - 更为重要的是函数的参数必须声明为特定的类型。所以函数只能在类型合适的表达式上使用。反之这个宏可以适用于整形、长整型、浮点型等可以用于>来比较的类型。宏是**类型无关**的

- 缺点

  - 每次使用宏的时候，一份宏定义的代码将插入到程序中。除非宏比较短，否则可能大幅度增加程序的长度 --- **冗余**
  - 宏是没法调试的
  - 宏由于类型无关，也就不够严谨
  - 宏可能会带来运算符优先级的问题，导致程容易出现错

- 特点 -- 宏的参数可以出现类型，但是函数做不到

  ```c
  #define MALLOC(num, type)\
  	(type *)malloc(num * sizeof(type))
  ...
  //使用
  MALLOC(10, int);//类型作为参数 ---> (int *)malloc(10 * sizeof(int))
  ```

### #undef

- 用于移除一个宏定义

```c
#undef NAME
//如果现存的一个名字需要被重新定义，那么它的旧名字首先要被移除。
```

### 命令定义

```c
#include <stdio.h>
int main(){
    int array [ARRAY_SIZE];
    int i = 0;
    for(i = 0; i< ARRAY_SIZE; i ++){
    	array[i] = i;
    }
    for(i = 0; i< ARRAY_SIZE; i ++){
    	printf("%d " ,array[i]);
    }
    printf("\n" );
    return 0;
}
```

```sh
gcc -D ARRAY_SIZE=10 test.c
```



## 指针

### 指针运算

- 指针+-整数 ---- 数组元素赋值

  ```c
  #define N_VALUES 5
  float values[N_VALUES];
  float *vp;
  //指针+-整数；指针的关系运算
  for (vp = &values[0]; vp < &values[N_VALUES];) {
      *vp++ = 0;
  }
  ```

- 指针-指针 ---- 字符串长度

  ```c
  int my_strlen(char *s){
      char *p = s;
      while(*p != '\0' )
      p++;
      return p-s;
  }
  ```

- 指针的关系运算

  ```c
  // 数组元素赋值  --- 可以运行，但是不好
  for(vp = &values[N_VALUES-1]; vp >= &values[0];vp--){
  	*vp = 0;
  }
  ```

  **标准规定：**
  允许指向数组元素的指针与指向数组**最后一个元素后面的那个内存位置的指针**比较，但是不允许与指向第一个元素之前的那个内存位置的指针进行比较 ---- 前面可能超出了整块内存，后面则只能是内存的尾部

### 指针类型

- 指针的类型决定了指针向前或者向后走一步有多大（距离） ---- 指针+-整数

- 指针的类型决定了，对指针解引用的时候有多大的权限（能操作几个字节）

  > char* 的指针解引用就只能访问一个字节，而int* 的指针的解引用就能访问四个字节

#### 野指针

- 野指针就是指针指向的位置是不可知的（随机的、不正确的、没有明确限制的）
  - 指针未初始化 --- 局部变量指针未初始化，默认为随机值
  - 指针越界访问 --- 当指针指向的范围超出数组arr的范围时，p就是野指针
  - 指针指向的空间释放 --- 
- 避免
  - 指针初始化
  - 小心指针越界
  - 指针指向空间释放即使置NULL
  - 避免返回局部变量的地址
  - 指针使用之前检查有效性 --- if(p != NULL)

#### void 指针

- void 指针可以指向任意类型的数据，就是说可以用任意类型的指针对 void 指针对 void 指针赋值 --- 使用时强转
  - 赋值给void*时不用强转，使用时需要强转
-  在 ANSI C 标准中，不允许对 void 指针进行一些算术运算 --- 无类型，不知道操作几个字节
  - 但在 GNU 中则允许，因为在默认情况下，GNU 认为 **void \*** 和 **char \*** 一样

#### 字符指针

```c
int main() {
    char ch = 'w';
    char *pc = &ch;
    *pc = 'w';
    return 0;
}
```

```c
int main() {
    const char *pstr = "hello bit.";// 把字符串首字符的地址放到了pstr中
    printf("%s\n", pstr);
    return 0;
}
```

> 和java不同，每个**普通串**，尽管相同，在**栈**中也会重新开辟空间存放重复的串
>
> 但**常量串**会存储到单独的一个内存区域，当几个指针指向同一个字符串的时，地址相同
>
> 常量串初始化：直接将字面量赋值给char *变量

```c
int main() {
    char str1[] = "hello bit.";	// str1存的是串1的首字符地址
    char str2[] = "hello bit.";	// str2存的是串2的首字符地址
    char *str3 = "hello bit.";	// str3存的是一个常量串的地址
    char *str4 = "hello bit.";	// str4存的是一个常量串的地址
    if (str1 == str2)
        printf("str1 and str2 are same\n");	// 不输出
    if (str3 == str4)
        printf("str3 and str4 are same\n");	// 输出
    return 0;
}
```

#### 指针数组

存放指针的数组

```c
int* arr1[5]; 	// arr1是一个数组，有5个元素，每个元素是一个整形指针
char* arr2[6];	// arr2是一个数组，有6个元素，每个元素是一个char指针
char** arr3[5];	// arr3是一个数组，有5个元素，每个元素是一个二级字符指针
```

#### 数组指针

```c
int (*p)[10];
//解释：p先和*结合，说明p是一个指针变量，然后指着指向的是一个大小为10个整型的数组。所以p是一个指针，指向一个数组，叫数组指针
//这里要注意：[]的优先级要高于*号的，所以必须加上（）来保证p先和*结合
```

```c
int arr[5];				// arr是一个存放int的数组，5个元素，元素类型为int
int *parr1[10];			// parr1是一个存放指针的数组，10个元素，元素类型为int*
int (*parr2)[10];		// parr2是一个指向数组的指针，数组有10个元素，元素类型为int
int (*parr3[10])[5];	// parr3是一个存放指针的数组，5个元素，存放数组的指针，10个元素，元素类型为int
```

- 第一步：判断指针 or 数组：（*p） ---- 括且仅括住了\*和变量名，则为指针
- 第二步
  - 指针：指向 ---- 去掉*、变量名
  - 数组：元素 ---- 去掉[]、变量名

> int arr[10];
>
> - arr：一般是首元素地址，&arr、sizeof(arr)例外
>
> - &arr：数组的地址，体现在大小和步长
>
>   - arr == &arr
>   - 32位下&arr+1 和&arr 的差值是40
>
>   ```c
>   int (*p)[10] = &arr;
>   ```

使用：当入参为**一维**数组时，函数形参可用**指针**接收，那么，当传**二维**数组时，可用**数组指针**接收

- **二维数组的首元素**是二维数组的**第一行**
- 传二维数组，相当于第一行的地址，是**一维数组的地址**

```c
void print_arr2(int (*arr)[5], int row, int col) {
    int i, j;
    for (i = 0; i < row; i++) {
        for (j = 0; j < col; j++) {
            printf("%d ", arr[i][j]);
        }
        printf("\n");
    }
}
```

#### 函数指针

函数指针和数组指针比较类似，但`&函数名`等价于`函数名`，`*函数名`等价于`函数名`

- `&数组名`代表整个数组地址，`数组名`代表首元素地址
- `sizeof(数组名)`代表整个数组的大小
- `sizeof(函数名)`在**标准中是不允许**的，返回结果恒为1 ----- sizeof不可用于void和函数名

```c
int Add(int x,int y){}
int main(){
    printf("%p",Add);
    printf("%p",&Add);	// 结果相同
    
    printf("%p\n",Add+1);
    printf("%p\n",&Add+1); // 依然相同
    
    pAdd(1, 2);
    (*pAdd)(1, 2);
    (*****pAdd)(1, 2);		// 结果相同
    return 0;
}
```

```c
	void (*pfun1)();	 int (*parr1)[5];
//	pfun1是一个函数指针，无参，返回值类型void
//	parr1是一个数组指针，5个元素，元素类型int

	void *pfun2();		 int *parr2[5];
//	pfun2是一个函数，无参，返回值为viod*
//	parr2是一个数组，5个元素，元素类型int*
```

```c
(*(void (*)())0)();
// void (*)()			函数指针类型
// (void (*)())0		0强转为地址
// *(void (*)())0		解引用
// (*(void (*)())0)()	调用函数
```

```c
void (*signal(int , void(*)(int)))(int);
// signal挨着括号，signal(int , void(*)(int)) ---- signal是个函数，一个变量是int，一个变量是函数指针
// 		--- 这个函数指针指向的函数参数是int，返回值是void
// 剩下void (*)(int) ---- 是signal函数的返回值类型，返回一个函数指针
//		--- 这个函数指针指向的函数参数是int，返回值是void
```

#### 函数指针数组

```c
int *arr[10];	// 数组的每个元素是int*

int (*parr1[10])();	// parr1挨着[],所以是数组，10个元素，剩下int (*)(),表示每个元素是函数指针
int *parr2[10]();	// 错误写法，parr2挨着[],所以是数组，10个元素，剩下int *(),没有意义
int (*)() parr3[10];	// 错误写法
```

```c
// 转移表
#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int sub(int a, int b) {
    return a - b;
}

int mul(int a, int b) {
    return a * b;
}

int div(int a, int b) {
    return a / b;
}

int main() {
    int x, y;
    int input = 1;
    int ret = 0;
    int (*p[5])(int x, int y) = {0, add, sub, mul, div}; //转移表
    while (input) {
        printf("*************************\n");
        printf(" 1:add 2:sub \n");
        printf(" 3:mul 4:div \n");
        printf("*************************\n");
        printf("请选择：");
        scanf("%d", &input);
        if ((input <= 4 && input >= 1)) {
            printf("输入操作数：");
            scanf("%d %d", &x, &y);
            ret = (*p[input])(x, y);
        } else
            printf("输入有误\n");
        printf("ret = %d\n", ret);
    }
    return 0;
}
```

#### 函数指针数组指针

```c
#include <stdio.h>

void test(const char *str) {
    printf("%s\n", str);
}

int main() {
    //函数指针pfun
    void (*pfun)(const char *) = test;
    //函数指针的数组pfunArr
    void (*pfunArr[5])(const char *str);
    pfunArr[0] = test;
    //指向函数指针数组pfunArr的指针ppfunArr
    void (*(*ppfunArr)[5])(const char *) = &pfunArr;
    return 0;
}
```

#### 回调函数

> - 回调函数就是一个通过函数指针调用的函数
>
> - 如果把函数的指针作为参数传递给另一个函数
> - 当这个指针被用来调用其所指向的函数时，就说这是回调函数

```c
// 冒泡排序
#include <stdio.h>

// int型的比较 --- 不同类型的排序需要定制不同类型的比较函数，入参为void *是为了回调函数时统一入参
int int_cmp(const void *p1, const void *p2) {
    return (*(int *) p1 - *(int *) p2);
}
// 浮点型的比较
// 字符串的比较

// 交换
void _swap(void *p1, void *p2, int size) {
    int i = 0;
    for (i = 0; i < size; i++) {
        char tmp = *((char *) p1 + i);
        *((char *) p1 + i) = *((char *) p2 + i);
        *((char *) p2 + i) = tmp;
    }
}

// 冒泡排序 --- cmp回调函数，cmp是不同类型定制的比较函数
void bubble(void *base, int count, int size, int(*cmp )(const void *, const void *)) {
    int i = 0;
    int j = 0;
    for (i = 0; i < count - 1; i++) {			// 趟数
        for (j = 0; j < count - i - 1; j++) {	// 交换次数
            if (cmp((char *) base + j * size, (char *) base + (j + 1) * size) > 0) {
                _swap((char *) base + j * size, (char *) base + (j + 1) * size, size);
            }
        }
    }
}

int main() {
    int arr[] = {1, 3, 5, 7, 9, 2, 4, 6, 8, 0};
    //char *arr[] = {"aaaa","dddd","cccc","bbbb"};
    int i = 0;
    bubble(arr, sizeof(arr) / sizeof(arr[0]), sizeof(int), int_cmp);
    for (i = 0; i < sizeof(arr) / sizeof(arr[0]); i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
    return 0;
}
```

### 指针和数组

```c
int *p = arr;// p存放的是数组首元素的地址
*(p + i) ; // 循环中可以直接通过指针访问数组
```

#### 一维数组传参

```c
int arr[10] = {0};
int *arr2[20] = {0};

void test(int arr[]) {}     // 数组接收一维数组
void test0(int arr[10]) {}  // 数组接收一维数组
void test1(int *arr) {}     // 指针接收一维数组
void test2(int *arr[20]) {} // 指针数组接收指针数组
void test3(int **arr) {}    // 二级指针接收指针数组
```

#### 二维数组传参

```c
void test(int arr[3][5]){}  // ok
void test(int arr[][]){}    // no
void test(int arr[][5]){}   // ok

// 传过来的是首元素地址，即第一行的地址，即数组指针
void test(int *arr){}       // no
void test(int *arr[5]){}    // no
void test(int (*arr)[5]){}  // ok
void test(int **arr){}      // no
```

#### 一级指针传参

```c
// 接收一级指针、数组首元素地址
void test1(int *p){}
void test2(char* p){}	
```

#### 二级指针传参

```c
void test(char **p){}

int main() {
    char c = 'b';
    char *pc = &c;
    char **ppc = &pc;
    char *arr[10];
    test(&pc);	// 一级指针取地址
    test(ppc);	// 二级指针
    test(arr);	// 指针数组 ---- 首元素地址即指针的地址
    return 0;
}
```

## 自定义类型

### 结构体

#### 声明定义初始化

```c
// 类型声明
struct Stu{
    char name[15];//名字
    int age; //年龄
};

// 定义结构体变量（类似java对象）
struct Point p2; 

// 声明和定义变量（类似java对象）在一起
struct Point{
    int x;
    int y;
} p1; //声明类型的同时定义变量p1

// 初始化：定义变量的同时赋初值
struct Point p3 = {1, 3};

// 声明、定义、初始化在一起
struct Node{
    int data;
    struct Point p;
    struct Node* next;
}n1 = {10, {4,5}, NULL};

// 访问成员
p1.x = 1;
(&p1)->y = 3;

// 结构体传参 --- print2节省内存
void print1(struct S s){}
void print2(struct S* ps){}
```

#### 匿名

```c
// 匿名结构体
struct{
    int a;
    char b;
    float c;
}x;

// 匿名结构体数组、匿名结构体指针
struct{
    int a;
    char b;
    float c;
}a[20], *p;

p = &x;		// 编译器会把上面的两个声明当成完全不同的两个类型,所以是非法的
```

#### 自引用

```c
// 错误
struct Node{
    int data;
    struct Node next;
};

// 正确
struct Node{
    int data;
    struct Node* next;
};
```

#### 别名

```c
// 错误
typedef struct{
    int data;
    Node* next;
}Node;

typedef struct Node{
    int data;
    struct Node* next;
}Node;
```

#### 内存对齐

- 规则

  - 第一个成员：在偏移量为0的位置
  - 其他成员：在对齐数的整数倍
    - 对齐数 = min(编译器默认对齐数，成员大小)
    - 数组成员大小：对齐数是数组**元素类型的大小**
    - VS编译器默认对齐数8
    - gcc编译器无默认对齐数，直接取成员大小
  - 嵌套结构体：位置在自己最大对齐数的整数倍
  - 总大小：最大对齐数的整数倍（包含嵌套结构体的对齐数）

- 原因

  - 移植 --- 不是所有的硬件平台都能访问任意地址上的任意数据的
  - 性能 --- 对应32位机器每次访问4个字节，紧挨着可能将一个int型的分两次度才能访问到

- **设计技巧：让占用空间小的成员尽量集中在一起**

- 修改默认对齐数

  ```c
  #pragma pack(8)//设置默认对齐数为1
  struct S2{
      char c1;
      int i;
      char c2;
  };
  #pragma pack()//取消设置的默认对齐数，还原为默认
  ```

#### 结构体传参

与java不同，传结构体也只能改变拷贝变量的成员，无法改变传进去的变量的成员

- 直接传结构体只能进行访问 --- 写入无意义
- 改变原结构体参数时，必须传结构体指针
- 要想只能访问，用const修饰

### 位段

- **位段是为了在一定程度上节省内存空间**

- 位段的声明和结构是类似的，有两个不同：
  - 位段的成员必须是int、unsigned int 或signed int 或char

  - 位段的成员名后边有一个冒号和一个数字 ---- 代表所占的比特位

    ```c
    struct A{
        int _a:2;
        int _b:5;
        int _c:10;
        int _d:30;
    };
    ```

- 内存分配
  - 位段的成员可以是int unsigned int signed int 或者是char （属于整形家族）类型

  - 位段的空间上是按照需要以4个字节（ int ）或者1个字节（ char ）的方式来开辟的

  - 位段涉及很多不确定因素，位段是**不跨平台**的，注重**可移植的程序应该避免使用位段**

    - int 位段被当成有符号数还是无符号数是不确定的
    - 位段中最大位的数目不能确定，16位机器最大16，32位机器最大32，写成27，在16位机器会出问题
    - 位段中的成员在内存中从左向右分配，还是从右向左分配标准尚未定义
    - 当一个结构包含两个位段，第二个位段成员比较大，无法容纳于第一个位段剩余的位时，是舍弃剩余的位还是利用，这是不确定的

    > 对应VS编译器，开辟出4个字节（或1个字节）后，从右向左使用，不够了再开辟，剩下的浪费

- 位段的应用：数据传输 --- 网络传输的时候除了真实的数据外，还包含20字节的头信息

  - 4字节 ---- 32位源IP地址
  - 4字节 ---- 32位目标IP地址
  - 4字节 ---- 8位生存时间TTL（time to live）、8位协议（protocol）、16位首部校验和（checksum）
  - 4字节 ---- 16位标识符（identifier）、3位标志、13位片偏移（offset）
  - 4字节 ---- 4位版本号、4位首部长度、8位服务类型（TOS）、16位总长度（total length）
  - 4字节可选项（若有）
  - 数据

### 联合

```c
//联合类型的声明
union Un{
    char c;
    int i;
};
//联合变量的定义
union Un un;
//计算连个变量的大小
printf("%d\n", sizeof(un));	// 4
```

- 联合的成员是共用同一块内存空间的，这样一个联合变量的大小，至少是最大成员的大小（因为联
  合至少得有能力保存最大的那个成员）

- 当最大成员大小不是最大对齐数的整数倍的时候，就要对齐到最大对齐数的整数倍

  ```c
  union Un{
      int i;
      char c;
  };
  int main(){
      union Un un;
      printf("%d\n", &un);		// 输出结果完全相同
      printf("%d\n", &(un.i));
      printf("%d\n", &(un.c));
      //下面输出的结果是什么？
      un.i = 0x11223344;
      un.c = 0x55;
      printf("%x\n", un.i);		// 11223355 ---- 小端存储 44 33 22 11只改了1个字节 55 33 22 11
      return 0;
  }
  ```

  ```c
  union Un1{
      char c[5];
      int i;
  };
  union Un2{
      short c[7];
      int i;
  };
  int main(){
      printf("%d\n", sizeof(union Un1));	// 8
  	printf("%d\n", sizeof(union Un2));	// 16
      return 0;
  }
  ```

  

### 枚举

```c
enum Color{
    RED,
    GREEN,
    BLUE
};
```

- enum Color就是枚举类型

- RED,GREEN,BLUE是枚举常量

- 默认值从0开始，递增

- 有初始值时，从有初始值的枚举常量开始自增

  ```c
  enum Color{
      RED,
      GREEN = 9,
      BLUE
  };
  
  int main(){
      // 使用
      enum Color clr = GREEN;//只能拿枚举常量给枚举变量赋值，才不会出现类型的差异。
  	printf("%d %d %d",RED,GREEN,BLUE);	// 0 9 10
      return 0;
  }
  ```

- 枚举的优点 ----- 使用#define 定义常量，为什么非要使用枚举？
  1. 增加代码的可读性和可维护性
  2. 和#define定义的标识符比较枚举有类型检查，更加严谨。
  3. 防止了命名污染（封装）
  4. 便于调试
  5. 使用方便，一次可以定义多个常量

## 动态内存分配

```c
int val = 20;//在栈空间上开辟四个字节
char arr[10] = {0};//在栈空间上开辟10个字节的连续空间
```

- 开辟多了内存浪费，开辟少了不够用，需要动态分配
- C99支持了数组大小的动态分配，但是一些编译器不支持C99标准，可移植性差

### malloc和free

```c
void* malloc (size_t size);
```

- 这个函数向内存申请一块连续可用的空间，并返回指向这块空间的指针
- 如果开辟成功，则返回一个指向开辟好空间的指针
- 如果开辟失败，则返回一个NULL指针，因此malloc的返回值一定要做检查
- 返回值的类型是void* ，所以malloc函数并不知道开辟空间的类型，具体在使用的时候使用者自己来决定
- 如果参数size 为0，malloc的行为是标准是未定义的，取决于编译器

```c
void free (void* ptr);
```

- free函数用来释放动态开辟的内存
- 如果参数ptr 指向的空间不是动态开辟的，那free函数的行为是未定义的
- 如果参数ptr 是NULL指针，则函数什么事都不做
- malloc和free都声明在stdlib.h 头文件中

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    int num = 0;
    scanf("%d", &num);
    int *ptr = NULL;
    ptr = (int *) malloc(num * sizeof(int));
    if (NULL != ptr) {  // 判断ptr指针是否为空
        int i = 0;
        for (i = 0; i < num; i++) {
            *(ptr + i) = 0;
        }
    } else {
        printf("%s\n", strerror(errno));
    }
    free(ptr);		// 释放ptr所指向的动态内存
    ptr = NULL;		// 内存释放后，指针仍然存在，防止野指针的出现需要置为NULL
    return 0;
}
```

### calloc

```c
void* calloc (size_t num, size_t size);
```

- 为num 个大小为size 的元素开辟一块空间，并且把空间的每个字节初始化为0
- 与函数malloc 的区别只在于calloc 会在返回地址之前把申请的空间的每个字节初始化为全0

```c
int main(){
    int *p = (int*)calloc(10, sizeof(int));
    if(NULL != p){
		//使用空间
    }
    free(p);
    p = NULL;
    return 0;
}
```

### realloc

```c
void* realloc (void* ptr, size_t size);
```

- 有时会我们发现过去申请的空间太小了，有时候我们又会觉得申请的空间过大了，那为了合理的时候内存，我们一定会对内存的大小做灵活的调整。那realloc 函数就可以做到对动态开辟内存大小的**调整**
- ptr 是要调整的内存地址，size 调整之后新大小
- 返回值为调整之后的内存起始位置
- 这个函数调整原内存空间大小的基础上，还会将原来内存中的数据移动到新的空间
- realloc在调整内存空间的是存在两种情况：
  - 原有空间之后有足够大的空间 --- 直接追加，返回原地址
  - 原有空间之后没有足够大的空间 --- 重新开辟，拷贝原数据，释放原内存，返回新地址
- **使用时不要将返回的新地址直接赋给原指针，因为可能调整失败，会将NULL赋给原指针，造成数据丢失**

```c
int main(){
    int *ptr = (int*)malloc(100);
    if(ptr != NULL){
    	//业务处理
    }else{
    	exit(EXIT_FAILURE);
    }
    //扩展容量
    //代码1
    ptr = (int*)realloc(ptr, 1000);// 调整失败，ptr为NULL，数据丢失
    //代码2
    int*p = NULL;
    p = realloc(ptr, 1000);
    if(p != NULL){
    	ptr = p;
    }
    //业务处理
    free(ptr);
    return 0;
}
```

### 注意事项

- 对NULL指针的解引用操作

- 对动态开辟空间的越界访问

- 对非动态开辟内存使用free释放

- 使用free释放一块动态开辟内存的一部分

  ```c
  void test(){
      int *p = (int *)malloc(100);
      p++;
      free(p);//p不再指向动态内存的起始位置 --- 程序假死
  }
  ```

- 对同一块动态内存多次释放

  ```c
  void test(){
      int *p = (int *)malloc(100);
      free(p);
      free(p);//重复释放 --- 程序假死
      //-------------
      free(p);
      p = NULL;	// 很关键很关键
      free(p);//重复释放 --- 无影响
  }
  ```

- 动态开辟内存忘记释放（内存泄漏）

[练习](#动态内存)

### 柔性数组

```c
typedef struct st_type{
    int i;
    int a[0];//柔性数组成员	---- 也可写作int a[]
}type_a;
```

- C99 中，**结构体**中的**最后一个成员**允许是**未知大小的数组**，这就叫做『柔性数组』成员

- 结构中的柔性数组成员前面必须至少一个其他成员

- sizeof 返回的这种结构大小不包括柔性数组的内存

  ```c
  printf("%d\n", sizeof(type_a));	//输出的是4
  ```

- 包含柔性数组成员的结构用malloc ()函数进行内存的动态分配，并且分配的内存应该大于结构的大小，以适应柔性数组的预期大小

  ```c
  int i = 0;
  type_a *p = (type_a*)malloc(sizeof(type_a)+100*sizeof(int));
  p->i = 100;
  for(i=0; i<100; i++){
  	p->a[i] = i;
  }
  free(p);
  ```

- 方法二（不推荐）

  > 方法1 的实现有两个好处：
  >
  > - 第一个好处是：方便内存释放 --- 只释放一次即可
  > - 第二个好处是：这样有利于访问速度 --- 其实差距不是很大

  ```c
  typedef struct st_type{
  	int i;
  	int *p_a;
  }type_a;
  
  type_a *p = (type_a *)malloc(sizeof(type_a));
  p->i = 100;
  p->p_a = (int *)malloc(p->i*sizeof(int));
  //业务处理
  for(i=0; i<100; i++)
  {
  p->p_a[i] = i;
  }
  //释放空间
  free(p->p_a);
  p->p_a = NULL;
  free(p);
  p = NULL;
  ```

## 文件操作

### 文件指针

```c
struct _iobuf {
    char *_ptr;
    int _cnt;
    char *_base;
    int _flag;
    int _file;
    int _charbuf;
    int _bufsiz;
    char *_tmpfname;
};
typedef struct _iobuf FILE;

FILE* pf;//文件指针变量
```

- 每个被使用的文件都在内存中开辟了一个相应的文件信息区，用来存放文件的相关信息（如文件的名字，文件状态及文件当前的位置等）
- 这些信息是保存在一个结构体变量中的。该结构体类型是有系统声明的，取名FILE
- 不同的C编译器的FILE类型包含的内容不完全相同，但是大同小异
- 每当打开一个文件的时候，系统会根据文件的情况自动创建一个FILE结构的变量，并填充其中的信息
- 定义pf是一个指向FILE类型数据的指针变量。可以使pf指向某个文件的文件信息区（是一个结构体变
  量）。通过该文件信息区中的信息就能够访问该文件。也就是说，通过文件指针变量能够找到与它关联
  的文件

### 打开/关闭

```c
//打开文件
FILE * fopen ( const char * filename, const char * mode );
//关闭文件
int fclose ( FILE * stream );
```

- filename文件路径，mode打开方式

  文件使用方式  -------------------------- 含义 -------------------------- 如果指定文件不存在
  “r”（只读） 	为了输入数据，打开一个已经存在的文本文件		出错
  “w”（只写） 	为了输出数据，打开一个文本文件								建立一个新的文件
  “a”（追加） 	向文本文件尾添加数据															建立一个新的文件
  “rb”（只读） 	为了输入数据，打开一个二进制文件							出错
  “wb”（只写） 	为了输出数据，打开一个二进制文件						建立一个新的文件
  “ab”（追加）	 向一个二进制文件尾添加数据										出错
  “r+”（读写） 	为了读和写，打开一个文本文件									出错
  “w+”（读写） 	为了读和写，建议一个新的文件									建立一个新的文件
  “a+”（读写） 	打开一个文件，在文件尾进行读写								建立一个新的文件
  “rb+”（读写） 	为了读和写打开一个二进制文件								出错
  “wb+”（读写） 	为了读和写，新建一个新的二进制文件				建立一个新的文件
  “ab+”（读写） 	打开一个二进制文件，在文件尾进行读和写		建立一个新的文件

```c
/* fopen fclose example */
#include <stdio.h>
int main (){
    FILE * pFile;
    //打开文件
    pFile = fopen ("myfile.txt","w");
    //文件操作
    if (pFile!=NULL){
    	fputs ("fopen example",pFile);
        //关闭文件
        fclose (pFile);
    }
    return 0;
}
```

### 顺序读写

功能										函数名								适用于
**字符**输入函数					fgetc 								所有输入流
**字符**输出函数					fputc 								所有输出流
文本**行**输入函数				fgets 								所有输入流
文本**行**输出函数				fputs 								所有输出流
**格式化**输入函数				fscanf 							所有输入流
**格式化**输出函数				fprintf 							所有输出流
**二进制**输入							fread 								文件
**二进制**输出							fwrite 								文件

> 去掉f即代表从标准输入流（键盘）中读，在标准输出流（显示器）中写
>
> - 标准输入stdin
> - 标准输出stdout
>
> ```c
> fgets(buf,1024,stdin);	// 从标准输入读————键盘
> fputs(buf,stdout);		// 在标准输出写————屏幕
> gets(buf);			// 等价于fgets标准输入
> puts(buf);			// 等价于fputs标准输出
> ```
>
> sprintf ---- 将结构体中的数据格式化后输出到buf
>
> sscanf ---- 将buf中的数据通过格式化读到结构体
>
> ```c
> sprintf(buf,"%d %f %s",s.a,s.b,s.c);	
> sscanf(buf,"%d %f %s",&(tmp.a),&(tmp.b),&(tmp.c));
> ```

```c
char buf[1024] = {0};
struct S s = {1,1.2,"nihao"};
struct S tmp = {0};

FILE* pfw = fopen("testW.txt","w");
FILE* pfr = fopen("testR.txt","r");
FILE* pfwb = fopen("testW.txt","wb");
FILE* pfrb = fopen("testR.txt","rb");
if(pf == NULL){
    return 0;
}

fgetc(pfr);
fputc("b",pfw);
fputc("i",pfw);
fputc("t",pfw);

fgets(buf,1024,pfr);
fputs(buf,pfw);

fprintf(pfw,"%d %f %s",1,1.2,"nihao");	
fscanf(pfr,"%d %f %s",&(s.a),&(s.b),&(s.c));

fwrite(&s,sizeof(struct S),1,pfwb);
fread(&tmp,sizeof(struct S),1,pfrb);

fclose(pfw);
fclose(pfr);
pfw = pfr = NULL;
return 0;
```

### 随机读写

#### fseek

```c
int fseek ( FILE * stream, long int offset, int origin );
```

- 根据文件指针的位置和偏移量来定位文件指针

  ```c
  int main (){
      FILE * pFile;
      pFile = fopen ( "example.txt" , "wb" );
      fputs ( "This is an apple." , pFile );
      fseek ( pFile , 9 , SEEK_SET );
      fputs ( " sam" , pFile );
      fclose ( pFile );
      return 0;
  }
  ```

#### ftell

```c
long int ftell ( FILE * stream );
```

- 返回文件指针相对于起始位置的偏移量

  ```c
  int main (){
      FILE * pFile;
      long size;
      pFile = fopen ("myfile.txt","rb");
      if (pFile==NULL) perror ("Error opening file");
      else{
          fseek (pFile, 0, SEEK_END); // non-portable
          size=ftell (pFile);
          fclose (pFile);
          printf ("Size of myfile.txt: %ld bytes.\n",size);
      }
      return 0;
  }
  ```

#### rewind

```c
void rewind ( FILE * stream );
```

- 让文件指针回到起始位置

  ```c
  int main (){
      int n;
      FILE * pFile;
      char buffer [27];
      pFile = fopen ("myfile.txt","w+");
      for ( n='A' ; n<='Z' ; n++)
      	fputc ( n, pFile);
      rewind (pFile);
      fread (buffer,1,26,pFile);
      fclose (pFile);
      buffer[26]='\0';
      puts (buffer);
      return 0;
  }
  ```

### 判定结束

- 文件读取结束的原因有很多，可能是读取失败导致的，可能是遇到结束标志结束的，不能用feof函数的返回值直接判断文件结束

- 判定结束 ---- 循环条件

  - 文本文件
    - fgetc判断是否为EOF
    - fgets判断是否为NULL
  - 二进制文件：判断fread返回值是否小于想读取的个数

- feof是用来分析文件结束原因的，ferror也是判因的

  ```c
  int main(void){
      int c; // 注意：int，非char，要求处理EOF
      FILE* fp = fopen("test.txt", "r");
      if(!fp) {
          perror("File opening failed");
          return EXIT_FAILURE;
      }
      //fgetc 当读取失败的时候或者遇到文件结束的时候，都会返回EOF
      // 标准C I/O读取文件循环
      while ((c = fgetc(fp)) != EOF) {
      	putchar(c);
      }
      //判断是什么原因结束的
      if (ferror(fp))
      	puts("I/O error when reading");
      else if (feof(fp))
      	puts("End of file reached successfully");
      fclose(fp);
  }
  ```

### 文件缓冲区

> ANSIC 标准采用“缓冲文件系统”处理的数据文件的，所谓缓冲文件系统是指系统自动地在内存中为程序中每一个正在使用的文件开辟一块“文件缓冲区”。从内存向磁盘输出数据会先送到内存中的缓冲区，装满缓冲区后才一起送到磁盘上。如果从磁盘向计算机读入数据，则从磁盘文件中读取数据输入到内存缓冲区（充满缓冲区），然后再从缓冲区逐个地将数据送到程序数据区（程序变量等）。缓冲区的大小根据C编译系统决定的

```c
#include <stdio.h>
#include <windows.h>
//VS2013 WIN10环境测试
int main(){
    FILE*pf = fopen("test.txt", "w");
    fputs("abcdef", pf);//先将代码放在输出缓冲区
    printf("睡眠10秒-已经写数据了，打开test.txt文件，发现文件没有内容\n");
    Sleep(10000);
    printf("刷新缓冲区\n");
    fflush(pf);//刷新缓冲区时，才将输出缓冲区的数据写到文件（磁盘）
    //注：fflush 在高版本的VS上不能使用了
    printf("再睡眠10秒-此时，再次打开test.txt文件，文件有内容了\n");
    Sleep(10000);
    fclose(pf);
    //注：fclose在关闭文件的时候，也会刷新缓冲区
    pf = NULL;
    return 0;
}
```

> 因为有缓冲区的存在，C语言在操作文件的时候，需要做刷新缓冲区或者在文件操作结束的时候关闭文
> 件。如果不做，可能导致读写文件的问题

## 练习

### 循环

```c
//请问循环要循环多少次？ ---- 死循环，k=0是赋值，值作为条件
#include <stdio.h>
int main(){
int i = 0;
int k = 0;
for(i =0,k=0; k=0; i++,k++)
	k++;
	return 0;
}
```

### 操作符

```c
num & (num - 1)
// 判断num是否是2的指数 ---- 2的指数的二进制表示为1000，该值减一为0111，两者相与必为0。
// 计算num二进制表达中1的个数
```

### 类型

```c
// 运算中的转换
int main() {
    char d = 1;
    printf("%u\n", sizeof(d));	// 1
    printf("%u\n", sizeof(+d));	// 4/8
    printf("%u\n", sizeof(-d));	// 4/8
    
    char a = 0xb6;
    short b = 0xb600;
    int c = 0xb6000000;
    // a提升 ‭10110110‬ ---> 11111111 11111111 11111111 ‭10110110
    if (a == 0xb6) 
        printf("a");
    // b提升 ‭10110110 00000000‬ ---> 11111111 11111111 ‭10110110 00000000
    if (b == 0xb600) 
        printf("b");
    // c不用提升
    if (c == 0xb6000000)
        printf("c");
    return 0;
}
```

```c
// 隐式转换
int main() {
    char a = -1;
    signed char b = -1;
    // 10000001
    // 11111110
    // 11111111 ----> 正数直接就是原码 
    unsigned char c = -1;
    printf("a=%d,b=%d,c=%d", a, b, c);	// -1,-1,255
    return 0;
}

int main(){
    char a = -128;
    // 10000000‬ ---> 11111111 11111111 11111111 10000000 ----> 4294967168
    printf("%u\n",a);	// %u无符号十进制
    
    // 越界 128 ---> -128
    char b = -128;
    printf("%u\n",b);	// 还是4294967168
    return 0;
}
```

```c
// 按照补码的形式进行运算，最后格式化成为有符号整数
int main(){
    int i= -20;
	unsigned int j = 10;
    // 10000000 00000000 00000000 00010100	i 原
   	// 11111111 11111111 11111111 11101011	i 反
    // 11111111 11111111 11111111 11101100	i 补
    // 00000000 00000000 00000000 00001010	j 补
    // 11111111 11111111 11111111 11110110	和 补
    // 11111111 11111111 11111111 11110101	和 反
    // 10000000 00000000 00000000 00001010	和 原 ---> -10
	printf("%d\n", i+j);
}
```

```c
int main() {
    unsigned int i;
    for (i = 9; i >= 0; i--) {
        printf("%u\n", i);  // 死循环 9 8 7 6 5 4 3 2 1  0 ---> 4294967295
    }
    return 0;
}
```

```c
int main() {
    char a[1000];
    int i;
    for (i = 0; i < 1000; i++) {
        a[i] = -1 - i;
    }
    // {-1,-2,-3, ... ,-128,127, ... ,0} ----> 0就是\0,字符串结束标志
    printf("%d", strlen(a));    // 255
    return 0;
}
```

### 指针

```c
int main() {
    int a[5] = { 1, 2, 3, 4, 5 };
    int *ptr = (int *)(&a + 1);	// 数组结束的地址强转为int指针
    // 首元素地址+1 = 第二个元素地址，数组结束的地址-1 = 尾元素地址
    printf( "%d,%d", *(a + 1), *(ptr - 1));	// 2,5
    return 0;
}
```

```c
struct Test {
    int Num;
    char *pcName;
    short sDate;
    char cha[2];
    short sBa[4];
} *p;

//假设p 的值为0x100000。 如下表表达式的值分别为多少？
//已知，结构体Test类型的变量大小是20个字节
int main() {
    printf("%p\n", p + 0x1);
    printf("%p\n", (unsigned long) p + 0x1);
    printf("%p\n", (unsigned int *) p + 0x1);
    return 0;
}
```

```c
int main(){
    int a[4] = { 1, 2, 3, 4 };
    int *ptr1 = (int *)(&a + 1);
    int *ptr2 = (int *)((int)a + 1);
    printf( "%x,%x", ptr1[-1], *ptr2);
    return 0;
}
```

```c
int main(){
    int a[3][2] = { (0, 1), (2, 3), (4, 5) };
    int *p;
    p = a[0];
    printf( "%d", p[0]);
    return 0;
}
```

```c
int main(){
    int a[5][5];
    int(*p)[4];
    p = a;
    printf( "%p,%d\n", &p[4][2] - &a[4][2], &p[4][2] - &a[4][2]);
    return 0;
}
```

```c
int main(){
    int aa[2][5] = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    int *ptr1 = (int *)(&aa + 1);
    int *ptr2 = (int *)(*(aa + 1));
    printf( "%d,%d", *(ptr1 - 1), *(ptr2 - 1));
    return 0;
}
```

```c
int main(){
    char *a[] = {"work","at","alibaba"};
    char**pa = a;
    pa++;
    printf("%s\n", *pa);
    return 0;
}
```

```c
int main(){
    char *c[] = {"ENTER","NEW","POINT","FIRST"};
    char**cp[] = {c+3,c+2,c+1,c};
    char***cpp = cp;
    printf("%s\n", **++cpp);
    printf("%s\n", *--*++cpp+3);
    printf("%s\n", *cpp[-2]+3);
    printf("%s\n", cpp[-1][-1]+1);
    return 0;
}
```

### 动态内存

```c
void GetMemory(char *p){
	p = (char *)malloc(100);	// 没有NULL判断，没有释放，内存泄漏
}
void Test(void){
    char *str = NULL;
    GetMemory(str);				// str仍未NULL ---- p只在函数内部有效 --- 传str的地址才可以
    strcpy(str, "hello world");	// 程序崩溃 --- strcpy内部对NULL解引用遍历赋值
    printf(str);
}
```

```c
char *GetMemory(void){
    char p[] = "hello world";
    return p;			// 返回栈空间地址，内存释放
}
char *GetMemory(void){
    char *p = (char *)malloc(100);
    return p;			// 返回堆空间地址，内存没有释放
}
char *GetMemory(void){
    static char p[] = "hello world";
    return p;			// 返回静态区地址，内存没有释放
}


void Test(void){
    char *str = NULL;
    str = GetMemory();	// 非法访问 ---- p的值内部有效，执行完函数内存释放
    printf(str);
}
```

```c
void GetMemory(char **p, int num){
	*p = (char *)malloc(num);	// 内存泄漏
}
void Test(void){
    char *str = NULL;
    GetMemory(&str, 100);
    strcpy(str, "hello");		// hello
    printf(str);
}
```

```c
void Test(void){
    char *str = (char *) malloc(100);
    strcpy(str, "hello");
    free(str);					// free释放后并不会将str置空
    if(str != NULL){
        strcpy(str, "world");	
        printf(str);			// world,但仍然是非法访问
    }
}
```

