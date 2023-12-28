# Drools规则引擎

## 概述

### 规则引擎

**规则引擎**，全称为**业务规则管理系统**，英文名为BRMS(即Business Rule Management System)。规则引擎的主要思想是将应用程序中的业务决策部分分离出来，并使用预定义的语义模块编写业务决策（业务规则），由用户或开发者在需要时进行配置、管理。

规则引擎并不是一个具体的技术框架，而是指的一类系统，即业务规则管理系统。目前市面上具体的规则引擎产品有：drools、VisualRules、iLog等。

规则引擎实现了将业务决策从应用程序代码中分离出来，接收数据输入，解释业务规则，并根据业务规则做出业务决策。规则引擎其实就是一个输入输出平台。

上面的申请信用卡业务场景使用规则引擎后效果如下：

<img src="http://minio.botuer.com/study-node/imgs/规则引擎Drools/4.png" alt="4" style="zoom: 67%;" />

系统中引入规则引擎后，业务规则不再以程序代码的形式驻留在系统中，取而代之的是处理规则的规则引擎，业务规则存储在规则库中，完全独立于程序。业务人员可以像管理数据一样对业务规则进行管理，比如查询、添加、更新、统计、提交业务规则等。业务规则被加载到规则引擎中供应用系统调用。

**优势**

使用规则引擎的优势如下：

1、业务规则与系统代码分离，实现业务规则的集中管理

2、在不重启服务的情况下可随时对业务规则进行扩展和维护

3、可以动态修改业务规则，从而快速响应需求变更

4、规则引擎是相对独立的，只关心业务规则，使得业务分析人员也可以参与编辑、维护系统的业务规则

5、减少了硬编码业务规则的成本和风险

6、使用规则引擎提供的规则编辑工具，使复杂的业务规则实现变得的简单



**应用场景**

对于一些存在比较复杂的业务规则并且业务规则会频繁变动的系统比较适合使用规则引擎，如下：

1、风险控制系统----风险贷款、风险评估

2、反欺诈项目----银行贷款、征信验证

3、决策平台系统----财务计算

4、促销平台系统----满减、打折、加价购

### Drools概述

drools是一款由JBoss组织提供的基于Java语言开发的开源规则引擎，可以将复杂且多变的业务规则从硬编码中解放出来，以规则脚本的形式存放在文件或特定的存储介质中(例如存放在数据库中)，使得业务规则的变更不需要修改项目代码、重启服务器就可以在线上环境立即生效。

drools官网地址：https://drools.org/

drools源码下载地址：https://github.com/kiegroup/drools

**组成**

- Working Memory（工作内存）：drools规则引擎会从Working Memory中获取数据并和规则文件中定义的规则进行模式匹配，所以我们开发的应用程序只需要将我们的数据插入到Working Memory中即可，即调用kieSession.insert(order)就是将order对象插入到了工作内存中。
  - Fact：事实，是指在drools 规则应用当中，将一个**普通的JavaBean插入到Working Memory后的对象**就是Fact对象。Fact对象是我们的应用和规则引擎进行数据交互的桥梁或通道。
- Rule Base（规则库）：在规则文件中定义的规则都会被加载到规则库中
- Inference Engine（推理引擎）
  - Pattern Matcher（匹配器） ：将Rule Base中的所有规则与Working Memory中的Fact对象进行模式匹配，匹配成功的规则将被激活并放入Agenda中
  - Agenda(议程)：用于存放通过匹配器进行模式匹配后被激活的规则
  - Execution Engine（执行引擎）：执行Agenda中被激活的规则

**执行过程**

- 将初始数据(fact)输入到工作内存(Working Memory)
- 使用匹配器(Pattern Matcher)将规则库中的规则(rule)和数据(data)比较
- 如果执行规则存在冲突（conflict），即同时激活了多个规则，将冲突的规则放入冲突集合
- 解决冲突，将激活的规则按顺序放入议程（Agenda）
- 执行议程（Agenda）中的规则，重复（2-4步骤）直到执行完Agenda中的所有规则

**KIE介绍**

Drools常用api依赖

```
KieServices
	- KieRepository
	- KieSession
	- KieContainder
		- KieBase
		- KieProject
			- ClasspathKieProject
```

通过上面的核心API可以发现，大部分类名都是以Kie开头。**Kie全称为Knowledge Is Everything**，即"知识就是一切"的缩写，是Jboss一系列项目的总称

如下图所示，Kie的主要模块有OptaPlanner、Drools、UberFire、jBPM，Drools是整个KIE项目中的一个组件，Drools中还包括一个Drools-WB的模块，它是一个可视化的规则编辑器

![11](http://minio.botuer.com/study-node/imgs/规则引擎Drools/11.png)

## Hello World

### 依赖

```xml
<dependency>
    <groupId>org.drools</groupId>
    <artifactId>drools-compiler</artifactId>
    <version>7.6.0.Final</version>
</dependency>
```

### 配置文件

创建resources/META-INF/kmodule.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<kmodule xmlns="http://www.drools.org/xsd/kmodule">
    <!--
        name:指定kbase的名称，可以任意，但是需要唯一
        packages:指定规则文件的目录，需要根据实际情况填写，否则无法加载到规则文件
        default:指定当前kbase是否为默认
    -->
    <kbase name="myKbase1" packages="rules" default="true">
        <!--
            name:指定ksession名称，可以任意，但是需要唯一
            default:指定当前session是否为默认
        -->
        <ksession name="ksession-rule" default="true"/>
    </kbase>
</kmodule>
```

### 实体类

```java
package com.itheima.drools.entity;

/**
 * 订单
 */
@Data
public class Order {
    private Double originalPrice;//订单原始价格，即优惠前价格
    private Double realPrice;//订单真实价格，即优惠后价格
}
```

### 规则文件

创建resources/rules/bookDiscount.drl

```java
//图书优惠规则
package book.discount
import com.itheima.drools.entity.Order

//规则一：所购图书总价在100元以下的没有优惠
rule "book_discount_1"
    when
        $order:Order(originalPrice < 100)
    then
        $order.setRealPrice($order.getOriginalPrice());
        System.out.println("成功匹配到规则一：所购图书总价在100元以下的没有优惠");
end

//规则二：所购图书总价在100到200元的优惠20元
rule "book_discount_2"
    when
        $order:Order(originalPrice < 200 && originalPrice >= 100)
    then
        $order.setRealPrice($order.getOriginalPrice() - 20);
        System.out.println("成功匹配到规则二：所购图书总价在100到200元的优惠20元");
end

//规则三：所购图书总价在200到300元的优惠50元
rule "book_discount_3"
    when
        $order:Order(originalPrice <= 300 && originalPrice >= 200)
    then
        $order.setRealPrice($order.getOriginalPrice() - 50);
        System.out.println("成功匹配到规则三：所购图书总价在200到300元的优惠50元");
end

//规则四：所购图书总价在300元以上的优惠100元
rule "book_discount_4"
    when
        $order:Order(originalPrice >= 300)
    then
        $order.setRealPrice($order.getOriginalPrice() - 100);
        System.out.println("成功匹配到规则四：所购图书总价在300元以上的优惠100元");
end
```

### 单元测试

```java
@Test
public void test1(){
    KieServices kieServices = KieServices.Factory.get();
    KieContainer kieClasspathContainer = kieServices.getKieClasspathContainer();
    //会话对象，用于和规则引擎交互
    KieSession kieSession = kieClasspathContainer.newKieSession();

    //构造订单对象，设置原始价格，由规则引擎根据优惠规则计算优惠后的价格
    Order order = new Order();
    order.setOriginalPrice(210D);

    //将数据提供给规则引擎，规则引擎会根据提供的数据进行规则匹配
    kieSession.insert(order);

    //激活规则引擎，如果规则匹配成功则执行规则
    kieSession.fireAllRules();
    //关闭会话
    kieSession.dispose();

    System.out.println("优惠前原始价格：" + order.getOriginalPrice() +
                       "，优惠后价格：" + order.getRealPrice());
}
```

## 基础语法

### 文件构成

在使用Drools时非常重要的一个工作就是编写规则文件，通常规则文件的后缀为.drl。

**drl是Drools Rule Language的缩写**。在规则文件中编写具体的规则内容。

一套完整的规则文件内容构成如下：

| 关键字   | 描述                                                         |
| -------- | ------------------------------------------------------------ |
| package  | 包名，只限于逻辑上的管理，同一个包名下的查询或者函数可以直接调用 |
| import   | 用于导入类或者静态方法                                       |
| global   | 全局变量                                                     |
| function | 自定义函数                                                   |
| query    | 查询                                                         |
| rule end | 规则体                                                       |

Drools支持的规则文件，除了drl形式，还有Excel文件类型的。

### 规则体

**rule**：关键字，表示规则开始，参数为规则的唯一名称。

**attributes**：规则属性，是rule与when之间的参数，为可选项。

**when**：关键字，后面跟规则的条件部分。

**LHS**(Left Hand Side)：是规则的条件部分的通用名称。它由零个或多个条件元素组成。**如果LHS为空，则它将被视为始终为true的条件元素**。 （左手边）

**then**：关键字，后面跟规则的结果部分。

**RHS**(Right Hand Side)：是规则的后果或行动部分的通用名称。 （右手边）

**end**：关键字，表示一个规则结束。

```java
rule "ruleName"
    attributes
    when
        LHS 
    then
        RHS
end
//规则rule1的注释，这是一个单行注释
    
/*
规则rule2的注释，
这是一个多行注释
*/
```

### Pattern模式匹配

LHS部分由一个或者多个条件组成，条件又称为pattern

**pattern的语法结构**：绑定变量名:Object(Field约束)

- 绑定变量名可省略
- 通常建议以$开头，不是必须
- 在RHS中可以用绑定变量名操作Fact对象

**类型约束和属性约束**

```java
//规则二：所购图书总价在100到200元的优惠20元
rule "book_discount_2"
    when
        //Order为类型约束，originalPrice为属性约束
        $order:Order(originalPrice < 200 && originalPrice >= 100)
    then
        $order.setRealPrice($order.getOriginalPrice() - 20);
        System.out.println("成功匹配到规则二：所购图书总价在100到200元的优惠20元");
end
```

通过上面的例子我们可以知道，匹配的条件为：

1、工作内存中必须存在Order这种类型的Fact对象-----类型约束

2、Fact对象的originalPrice属性值必须小于200------属性约束

3、Fact对象的originalPrice属性值必须大于等于100------属性约束

以上条件必须同时满足当前规则才有可能被激活。

**绑定变量既可以用在对象上，也可以用在对象的属性上**。例如上面的例子可以改为：

```java
//规则二：所购图书总价在100到200元的优惠20元
rule "book_discount_2"
    when
        $order:Order($op:originalPrice < 200 && originalPrice >= 100)
    then
        System.out.println("$op=" + $op);
        $order.setRealPrice($order.getOriginalPrice() - 20);
        System.out.println("成功匹配到规则二：所购图书总价在100到200元的优惠20元");
end
```

**多个Pattern**：可以使用and或者or进行连接，也可以不写，默认连接为and

```java
//规则二：所购图书总价在100到200元的优惠20元
rule "book_discount_2"
    when
        $order:Order($op:originalPrice < 200 && originalPrice >= 100) and
        $customer:Customer(age > 20 && gender=='male')
    then
        System.out.println("$op=" + $op);
        $order.setRealPrice($order.getOriginalPrice() - 20);
        System.out.println("成功匹配到规则二：所购图书总价在100到200元的优惠20元");
end
```

### 比较操作符

| 符号         | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| >            | 大于                                                         |
| <            | 小于                                                         |
| >=           | 大于等于                                                     |
| <=           | 小于等于                                                     |
| ==           | 等于                                                         |
| !=           | 不等于                                                       |
| contains     | 检查一个Fact对象的某个属性值是否包含一个指定的对象值         |
| not contains | 检查一个Fact对象的某个属性值是否不包含一个指定的对象值       |
| memberOf     | 判断一个Fact对象的某个属性是否在一个或多个集合中             |
| not memberOf | 判断一个Fact对象的某个属性是否不在一个或多个集合中           |
| matches      | 判断一个Fact对象的属性是否与提供的标准的Java正则表达式进行匹配 |
| not matches  | 判断一个Fact对象的属性是否不与提供的标准的Java正则表达式进行匹配 |

**准备一个实体类**

```java
@Data
public class ComparisonOperatorEntity {
    private String names;
    private List<String> list;
}
```

**contains、not contains**

```java
package comparisonOperator
import com.itheima.drools.entity.ComparisonOperatorEntity

//测试比较操作符contains
rule "rule_comparison_contains"
    when
        ComparisonOperatorEntity(names contains "张三")
        ComparisonOperatorEntity(list contains names)
    then
        System.out.println("规则rule_comparison_contains触发");
end
    
//测试比较操作符memberOf    
rule "rule_comparison_memberOf"
    when
        ComparisonOperatorEntity(names memberOf list)
    then
        System.out.println("规则rule_comparison_memberOf触发");
end
    
//测试比较操作符matches
rule "rule_comparison_matches"
    when
        ComparisonOperatorEntity(names matches "张.*")
    then
        System.out.println("规则rule_comparison_matches触发");
end
```

**测试**

```java
//测试比较操作符
@Test
public void test3(){
    KieServices kieServices = KieServices.Factory.get();
    KieContainer kieClasspathContainer = kieServices.getKieClasspathContainer();
    KieSession kieSession = kieClasspathContainer.newKieSession();

    ComparisonOperatorEntity comparisonOperatorEntity = new ComparisonOperatorEntity();
    comparisonOperatorEntity.setNames("张三");
    List<String> list = new ArrayList<String>();
    list.add("张三");
    list.add("李四");
    comparisonOperatorEntity.setList(list);

    //将数据提供给规则引擎，规则引擎会根据提供的数据进行规则匹配，如果规则匹配成功则执行规则
    kieSession.insert(comparisonOperatorEntity);

    kieSession.fireAllRules();
    kieSession.dispose();
}
```

### 指定规则

通过规则过滤器来实现执行指定规则。对于规则文件不用做任何修改，只需要修改Java代码即可，如下：

```java
KieServices kieServices = KieServices.Factory.get();
KieContainer kieClasspathContainer = kieServices.getKieClasspathContainer();
KieSession kieSession = kieClasspathContainer.newKieSession();

ComparisonOperatorEntity comparisonOperatorEntity = new ComparisonOperatorEntity();
comparisonOperatorEntity.setNames("张三");
List<String> list = new ArrayList<String>();
list.add("张三");
list.add("李四");
comparisonOperatorEntity.setList(list);
kieSession.insert(comparisonOperatorEntity);

//通过规则过滤器实现只执行指定规则
kieSession.fireAllRules(new RuleNameEqualsAgendaFilter("rule_comparison_memberOf"));

kieSession.dispose();
```

### 关键字

Drools的关键字分为：硬关键字(Hard keywords)和软关键字(Soft keywords)。

**硬关键字是我们在规则文件中定义包名或者规则名时明确不能使用的，否则程序会报错**。软关键字虽然可以使用，但是不建议使用。

硬关键字包括：true false null

软关键字包括：lock-on-active date-effective date-expires no-loop auto-focus activation-group agenda-group ruleflow-group entry-point duration package import dialect salience enabled attributes rule extend when then template query declare function global eval not in or and exists forall accumulate collect from action reverse result end over init

```java
比如：
rule true  //不可以
rule "true"  //可以
```

## 内置方法

Drools提供了一些方法可以用来操作工作内存中的数据，**操作完成后规则引擎会重新进行相关规则的匹配，**原来没有匹配成功的规则在我们修改数据完成后有可能就会匹配成功了。

**实体类**

```java
@Data
public class Student {
    private int id;
    private String name;
    private int age;
}
```

### update

**update方法**：将修改后的fact更新到工作内存，并让相关的规则重新匹配。 （要避免死循环）

```java
package student
import com.itheima.drools.entity.Student

rule "rule_student_age小于10岁"
    when
        $s:Student(age < 10)
    then
        $s.setAge(15);
        update($s);//更新数据，导致相关的规则会重新匹配
        System.out.println("规则rule_student_age小于10岁触发");
end

rule "rule_student_age小于20岁同时大于10岁"
    when
        $s:Student(age < 20 && age > 10)
    then
        $s.setAge(25);
        System.out.println("规则rule_student_age小于20岁同时大于10岁触发");
end
```

### insert

**insert方法**：向工作内存中插入数据，并让相关的规则重新匹配

```java
package student
import com.itheima.drools.entity.Student

rule "rule_student_age等于10岁"
    when
        $s:Student(age == 10)
    then
        Student student = new Student();
        student.setAge(5);
        insert(student);//插入数据，导致相关的规则会重新匹配
        System.out.println("规则rule_student_age等于10岁触发");
end

rule "rule_student_age小于10岁"
    when
        $s:Student(age < 10)
    then
        $s.setAge(15);
        System.out.println("规则rule_student_age小于10岁触发");
end
```

### retract

**retract方法**：删除工作内存中的数据，并让相关的规则重新匹配

```java
package student
import com.itheima.drools.entity.Student

rule "rule_student_age等于10岁时删除数据"
    /*
    salience：设置当前规则的执行优先级，数值越大越优先执行，默认值为0.
    因为当前规则的匹配条件和下面规则的匹配条件相同，为了保证先执行当前规则，需要设置优先级
    */
    salience 100 
    when
        $s:Student(age == 10)
    then
        retract($s);//retract方法的作用是删除工作内存中的数据，并让相关的规则重新匹配。
        System.out.println("规则rule_student_age等于10岁时删除数据触发");
end

rule "rule_student_age等于10岁"
    when
        $s:Student(age == 10)
    then
        Student student = new Student();
        student.setAge(5);
        insert(student);
        System.out.println("规则rule_student_age等于10岁触发");
end
```

## 规则属性

| 属性名           | 说明                                                         | 默认值 |
| ---------------- | ------------------------------------------------------------ | ------ |
| salience         | 指定规则执行优先级                                           | 0      |
| dialect          | 指定规则使用的语言类型，取值为java和mvel                     | java   |
| enabled          | 指定规则是否启用                                             | true   |
| date-effective   | 指定规则生效时间                                             |        |
| date-expires     | 指定规则失效时间                                             |        |
| activation-group | 激活分组，具有相同分组名称的规则只能有一个规则触发，具体哪一个最终能够被触发可以通过salience属性确定 |        |
| agenda-group     | 议程分组，只有获取焦点的组中的规则才有可能触发               |        |
| timer            | 定时器，指定规则触发的时间                                   |        |
| auto-focus       | 自动获取焦点，一般结合agenda-group一起使用                   | false  |
| no-loop          | 防止死循环                                                   | false  |

### activation-group

```java
package testactivationgroup

rule "rule_activationgroup_1"
    activation-group "mygroup"
    when
    then
        System.out.println("规则rule_activationgroup_1触发");
end

rule "rule_activationgroup_2"
    activation-group "mygroup"
    when
    then
        System.out.println("规则rule_activationgroup_2触发");
end
```

### agenda-group

议程分组，属于另一种可控的规则执行方式。用户可以通过设置agenda-group来控制规则的执行，只有获取焦点的组中的规则才会被触发。

```java
package testagendagroup

rule "rule_agendagroup_1"
    agenda-group "myagendagroup_1"
    when
    then
        System.out.println("规则rule_agendagroup_1触发");
end

rule "rule_agendagroup_2"
    agenda-group "myagendagroup_1"
    when
    then
        System.out.println("规则rule_agendagroup_2触发");
end
//========================================================
rule "rule_agendagroup_3"
    agenda-group "myagendagroup_2"
    when
    then
        System.out.println("规则rule_agendagroup_3触发");
end

rule "rule_agendagroup_4"
    agenda-group "myagendagroup_2"
    when
    then
        System.out.println("规则rule_agendagroup_4触发");
end
```

只有获取焦点的分组中的规则才会触发。与activation-group不同的是，activation-group定义的分组中只能够有一个规则可以被触发，而agenda-group分组中的多个规则都可以被触发

```java
KieServices kieServices = KieServices.Factory.get();
KieContainer kieClasspathContainer = kieServices.getKieClasspathContainer();
KieSession kieSession = kieClasspathContainer.newKieSession();

//设置焦点，对应agenda-group分组中的规则才可能被触发
kieSession.getAgenda().getAgendaGroup("myagendagroup_1").setFocus();

kieSession.fireAllRules();
kieSession.dispose();
```

### auto-focus

自动获取焦点，一般结合agenda-group属性使用，当一个议程分组未获取焦点时，可以设置auto-focus属性来控制

```java
package testagendagroup

rule "rule_agendagroup_1"
    agenda-group "myagendagroup_1"
    when
    then
        System.out.println("规则rule_agendagroup_1触发");
end

rule "rule_agendagroup_2"
    agenda-group "myagendagroup_1"
    when
    then
        System.out.println("规则rule_agendagroup_2触发");
end
//========================================================
rule "rule_agendagroup_3"
    agenda-group "myagendagroup_2"
    auto-focus true //自动获取焦点
    when
    then
        System.out.println("规则rule_agendagroup_3触发");
end

rule "rule_agendagroup_4"
    agenda-group "myagendagroup_2"
    auto-focus true //自动获取焦点
    when
    then
        System.out.println("规则rule_agendagroup_4触发");
end
```

设置auto-focus属性为true的规则都触发了。

注意：同一个组，只要有个设置auto-focus true 其他的设置不设置都无所谓啦。都会起作用的。

```java
KieServices kieServices = KieServices.Factory.get();
KieContainer kieClasspathContainer = kieServices.getKieClasspathContainer();
KieSession kieSession = kieClasspathContainer.newKieSession();
kieSession.fireAllRules();
kieSession.dispose();
```

### timer

**方式一**：timer (int: ?)

此种方式遵循java.util.Timer对象的使用方式，第一个参数表示几秒后执行，第二个参数表示每隔几秒执行一次，第二个参数为可选。

**方式二**：timer(cron: )

此种方式使用标准的unix cron表达式的使用方式来定义规则执行的时间。

第一步：创建规则文件/resources/rules/timer.drl

```java
package testtimer
import java.text.SimpleDateFormat
import java.util.Date

rule "rule_timer_1"
    timer (5s 2s) //含义：5秒后触发，然后每隔2秒触发一次
    when
    then
        System.out.println("规则rule_timer_1触发，触发时间为：" + 
                         new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
end

rule "rule_timer_2"
    timer (cron:0/1 * * * * ?) //含义：每隔1秒触发一次
    when
    then
        System.out.println("规则rule_timer_2触发，触发时间为：" + 
                         new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
end
```

### date-effective、date-expires

生效时间：大于等于

失效时间：小于

默认日期格式为：dd-MM-yyyy。用户也可以自定义日期格式。

第一步：编写规则文件/resources/rules/dateeffective.drl

```java
package testdateeffective

rule "rule_dateeffective_1"
    date-effective "2020-10-01 10:00"	// 生效时间
    date-expires "2021-10-01 10:00"		// 失效时间
    when
    then
        System.out.println("规则rule_dateeffective_1触发");
endCopy to clipboardErrorCopied
```

第二步：编写单元测试

```java
//设置日期格式
System.setProperty("drools.dateformat","yyyy-MM-dd HH:mm");
KieServices kieServices = KieServices.Factory.get();
KieContainer kieClasspathContainer = kieServices.getKieClasspathContainer();
KieSession kieSession = kieClasspathContainer.newKieSession();
kieSession.fireAllRules();
kieSession.dispose();Copy to clipboardErrorCopied
```

注意：上面的代码需要设置日期格式，否则我们在规则文件中写的日期格式和默认的日期格式不匹配程序会报错。

## 高级语法

### global全局变量

- 如果对象类型为**包装类型**时，在一个规则中改变了global的值，那么**只针对当前规则有效**，对其他规则中的global不会有影响。可以理解为它是当前规则代码中的global副本，规则内部修改不会影响全局的使用。

- 如果对象类型为**集合类型或JavaBean**时，在一个规则中改变了global的值，对java代码和所有规则都有效。

**JavaBean**

```java
public class UserService {
    public void save(){
        System.out.println("UserService.save()...");
    }
}
```

**drl**

```java
package testglobal

global java.lang.Integer count 								//定义一个包装类型的全局变量
global com.itheima.drools.service.UserService userService 	//定义一个JavaBean类型的全局变量
global java.util.List gList 								//定义一个集合类型的全局变量

rule "rule_global_1"
    when
    then
        count += 10; 			//全局变量计算，只对当前规则有效，其他规则不受影响
        userService.save();		//调用全局变量的方法
        gList.add("itcast");	//向集合类型的全局变量中添加元素，Java代码和所有规则都受影响
        gList.add("itheima");
        System.out.println("count=" + count);
        System.out.println("gList.size=" + gList.size());
end

rule "rule_global_2"
    when
    then
        userService.save();
        System.out.println("count=" + count);
        System.out.println("gList.size=" + gList.size());
end
```

**test**

```java
KieServices kieServices = KieServices.Factory.get();
KieContainer kieClasspathContainer = kieServices.getKieClasspathContainer();
KieSession kieSession = kieClasspathContainer.newKieSession();

//设置全局变量，名称和类型必须和规则文件中定义的全局变量名称对应
kieSession.setGlobal("userService",new UserService());
kieSession.setGlobal("count",5);
List list = new ArrayList();//size为0
kieSession.setGlobal("gList",list);

kieSession.fireAllRules();
kieSession.dispose();

//因为在规则中为全局变量添加了两个元素，所以现在的size为2
System.out.println(list.size());
```

### query查询

query查询提供了一种**查询working memory中符合约束条件的Fact对象**的简单方法。它仅包含规则文件中的LHS部分，不用指定“when”和“then”部分并且以end结束。

```java
package testquery
import com.itheima.drools.entity.Student

//不带参数的查询
//当前query用于查询Working Memory中age>10的Student对象
query "query_1"
    $student:Student(age > 10)
end

//带有参数的查询
//当前query用于查询Working Memory中age>10同时name需要和传递的参数name相同的Student对象
query "query_2"(String sname)
    $student:Student(age > 20 && name == sname)
end
```

**test**

```java
KieServices kieServices = KieServices.Factory.get();
KieContainer kieClasspathContainer = kieServices.getKieClasspathContainer();
KieSession kieSession = kieClasspathContainer.newKieSession();

Student student1 = new Student();
student1.setName("张三");
student1.setAge(12);

Student student2 = new Student();
student2.setName("李四");
student2.setAge(8);

Student student3 = new Student();
student3.setName("王五");
student3.setAge(22);

//将对象插入Working Memory中
kieSession.insert(student1);
kieSession.insert(student2);
kieSession.insert(student3);

//调用规则文件中的查询
QueryResults results1 = kieSession.getQueryResults("query_1");
int size = results1.size();
System.out.println("size=" + size);
for (QueryResultsRow row : results1) {
    Student student = (Student) row.get("$student");
    System.out.println(student);
}

//调用规则文件中的查询
QueryResults results2 = kieSession.getQueryResults("query_2","王五");
size = results2.size();
System.out.println("size=" + size);
for (QueryResultsRow row : results2) {
    Student student = (Student) row.get("$student");
    System.out.println(student);
}
//kieSession.fireAllRules();
kieSession.dispose();
```

### function函数

用于在规则文件中定义函数，就相当于java类中的方法一样。可以在规则体中调用定义的函数。使用函数的好处是可以将业务逻辑集中放置在一个地方，根据需要可以对函数进行修改

```java
package testfunction
import com.itheima.drools.entity.Student

//定义一个函数
function String sayHello(String name){
    return "hello " + name;
}

rule "rule_function_1"
    when
        $student:Student(name != null)
    then
        //调用上面定义的函数
        String ret = sayHello($student.getName());
        System.out.println(ret);
end
```

**test**

```java
KieServices kieServices = KieServices.Factory.get();
KieContainer kieClasspathContainer = kieServices.getKieClasspathContainer();
KieSession kieSession = kieClasspathContainer.newKieSession();

Student student = new Student();
student.setName("小明");

kieSession.insert(student);

kieSession.fireAllRules();
kieSession.dispose();
```

### LHS加强

#### in、not in

复合值限制是指超过一种匹配值的限制条件，类似于SQL语句中的in关键字。Drools规则体中的LHS部分可以使用in或者not in进行复合值的匹配。具体语法结构如下：

**Object(field in (比较值1,比较值2...))**

举例：

```java
$s:Student(name in ("张三","李四","王五"))
$s:Student(name not in ("张三","李四","王五"))
```

#### eval

eval用于规则体的LHS部分，并返回一个Boolean类型的值。语法结构如下：

**eval(表达式)**

举例：

```java
eval(true)
eval(false)
eval(1 == 1)
```

#### not

用于判断Working Memory中是否存在某个Fact对象，如果不存在则返回true，如果存在则返回false。语法结构如下：

**not Object(可选属性约束)**

举例：

```java
not Student()
not Student(age < 10)
```

#### exists

与not相反，用于判断Working Memory中是否存在某个Fact对象，如果存在则返回true，不存在则返回false。语法结构如下：

**exists Object(可选属性约束)**

举例：

```java
exists Student()
exists Student(age < 10 && name != null)Copy to clipboardErrorCopied
```

> 可能有人会有疑问，我们前面在LHS部分进行条件编写时并没有使用exists也可以达到判断Working Memory中是否存在某个符合条件的Fact元素的目的，那么我们使用exists还有什么意义？
>
> 两者的区别：当向Working Memory中加入多个满足条件的Fact对象时，使用了exists的规则执行一次，不使用exists的规则会执行多次
>
> 例如：
>
> 规则文件(只有规则体)：
>
> ```java
> rule "使用exists的规则"
>     when
>         exists Student()
>     then
>         System.out.println("规则：使用exists的规则触发");
> end
> 
> rule "没有使用exists的规则"
>     when
>         Student()
>     then
>         System.out.println("规则：没有使用exists的规则触发");
> endCopy to clipboardErrorCopied
> ```
>
> Java代码：
>
> ```java
> kieSession.insert(new Student());
> kieSession.insert(new Student());
> kieSession.fireAllRules();Copy to clipboardErrorCopied
> ```
>
> 上面第一个规则只会执行一次，因为Working Memory中存在两个满足条件的Fact对象，第二个规则会执行两次

#### 继承

```java
rule "rule_1"
    when
        Student(age > 10)
    then
        System.out.println("规则：rule_1触发");
end

rule "rule_2" extends "rule_1" //继承上面的规则
    when
        /*
        此处的条件虽然只写了一个，但是从上面的规则继承了一个条件，
        所以当前规则存在两个条件，即Student(age < 20)和Student(age > 10)
        */
        Student(age < 20) 
    then
        System.out.println("规则：rule_2触发");
end
```

### RHS加强

#### halt

**立即终止后面所有规则的执行**。

```java
package testhalt
rule "rule_halt_1"
    when
    then
        System.out.println("规则：rule_halt_1触发");
        drools.halt();//立即终止后面所有规则执行
end

//当前规则并不会触发，因为上面的规则调用了halt方法导致后面所有规则都不会执行
rule "rule_halt_2"
    when
    then
        System.out.println("规则：rule_halt_2触发");
end
```

#### getWorkingMemory

返回工作内存对象。

```java
package testgetWorkingMemory
rule "rule_getWorkingMemory"
    when
    then
        System.out.println(drools.getWorkingMemory());
end
```

#### getRule

返回规则对象。

```java
package testgetRule
rule "rule_getRule"
    when
    then
        System.out.println(drools.getRule());
end
```

### 编码规范

- 所有的规则文件(.drl)应统一放在一个规定的文件夹中，如：/rules文件夹
- 书写的每个规则应尽量加上注释。注释要清晰明了，言简意赅
- 同一类型的对象尽量放在一个规则文件中，如所有Student类型的对象尽量放在一个规则文件中
- 规则结果部分(RHS)尽量不要有条件语句，如if(...)，尽量不要有复杂的逻辑和深层次的嵌套语句
- 每个规则最好都加上salience属性，明确执行顺序
- Drools默认dialect为"Java"，尽量避免使用dialect "mvel"

### 决策表

Drools除了支持drl形式的文件外还支持xls格式的文件（即Excel文件）。这种xls格式的文件通常称为决策表（decision table）。

决策表（decision table）是一个“精确而紧凑的”表示条件逻辑的方式，非常适合商业级别的规则。决策表与现有的drl文件可以无缝替换。Drools提供了相应的API可以将xls文件编译为drl格式的字符串。

**依赖**

```xml
<dependency>
    <groupId>org.drools</groupId>
    <artifactId>drools-decisiontables</artifactId>
    <version>7.10.0.Final</version>
</dependency>
```

**表说明**

| 关键字       | 说明                                                         | 是否必须                                                     |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| RuleSet      | 相当于drl文件中的package                                     | 必须，只能有一个。如果没有设置RuleSet对应的值则使用默认值rule_table |
| Sequential   | 取值为Boolean类型。true表示规则按照表格自上到下的顺序执行，false表示乱序 | 可选                                                         |
| Import       | 相当于drl文件中的import，如果引入多个类则类之间用逗号分隔    | 可选                                                         |
| Variables    | 相当于drl文件中的global，用于定义全局变量，如果有多个全局变量则中间用逗号分隔 | 可选                                                         |
| RuleTable    | 它指示了后面将会有一批rule，RuleTable的名称将会作为以后生成rule的前缀 | 必须                                                         |
| CONDITION    | 规则条件关键字，相当于drl文件中的when。下面两行则表示 LHS 部分，第三行则为注释行，不计为规则部分，从第四行开始，每一行表示一条规则 | 每个规则表至少有一个                                         |
| ACTION       | 规则结果关键字，相当于drl文件中的then                        | 每个规则表至少有一个                                         |
| NO-LOOP      | 相当于drl文件中的no-loop                                     | 可选                                                         |
| AGENDA-GROUP | 相当于drl文件中的agenda-group                                | 可选                                                         |

![img](http://minio.botuer.com/study-node/imgs/规则引擎Drools/87dbc63044204e9b9acf3b97e5fa17da.jpeg)

上表转为drl为

```java
package rules.decision.tables;
//generated from Decision Table
import java.lang.StringBuilder;
import com.ppl.demo.entity.Student;
global java.lang.StringBuilder resultsInfo;



// rule values at B15, header at B10
rule "student-score-name-1"
/* 1、姓名为张三的特殊处理
2、自定义规则的名字 */
	salience 65535
	activation-group "score"
	when
		$stu: Student(name == "张三")
	then
		resultsInfo.append("张三特殊处理：");
System.out.println("规则:" + drools.getRule().getName() + " 执行了.");
		resultsInfo.append("优");
System.out.println("规则:" + drools.getRule().getName() + " 执行了.");
end

// rule values at B16, header at B10
rule "student-score_16"
	salience 65534
	activation-group "score"
	when
		$stu: Student(name == "李四", score > 0 && score < 60)
	then
		resultsInfo.append("李四部分特殊处理：");
System.out.println("规则:" + drools.getRule().getName() + " 执行了.");
		resultsInfo.append("一般");
System.out.println("规则:" + drools.getRule().getName() + " 执行了.");
end

// rule values at B17, header at B10
rule "student-score_17"
	salience 65533
	activation-group "score"
	when
		$stu: Student(score > 0 && score < 60)
	then
		resultsInfo.append("不及格");
System.out.println("规则:" + drools.getRule().getName() + " 执行了.");
end

// rule values at B18, header at B10
rule "student-score_18"
	salience 65532
	activation-group "score"
	when
		$stu: Student(score > 60 && score < 70)
	then
		resultsInfo.append("一般");
System.out.println("规则:" + drools.getRule().getName() + " 执行了.");
end

// rule values at B19, header at B10
rule "student-score_19"
	salience 65531
	activation-group "score"
	when
		$stu: Student(score > 70 && score < 90)
	then
		resultsInfo.append("良好");
System.out.println("规则:" + drools.getRule().getName() + " 执行了.");
end

// rule values at B20, header at B10
rule "student-score_20"
	salience 65530
	activation-group "score"
	when
		$stu: Student(score > 90 && score < 100)
	then
		resultsInfo.append("优");
System.out.println("规则:" + drools.getRule().getName() + " 执行了.");
end
```

**转drl**

```java
String realPath = "C:\\testRule.xls";//指定决策表xls文件的磁盘路径
File file = new File(realPath);
InputStream is = new FileInputStream(file);
SpreadsheetCompiler compiler = new SpreadsheetCompiler();
String drl = compiler.compile(is, InputType.XLS);

// 创建 KieSession
KieHelper kieHelper = new KieHelper();
kieHelper.addContent(drl, ResourceType.DRL);
KieSession kieSession = kieHelper.build().newKieSession();
```



## 整合

### Spring+Drools

**依赖**

```xml
<properties>
    <drools.version>7.10.0.Final</drools.version>
    <spring.version>5.0.5.RELEASE</spring.version>
</properties>
<dependencies>
    <dependency>
        <groupId>org.drools</groupId>
        <artifactId>drools-compiler</artifactId>
        <version>${drools.version}</version>
    </dependency>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.12</version>
    </dependency>
    <dependency>
        <groupId>org.kie</groupId>
        <artifactId>kie-spring</artifactId>
        <version>${drools.version}</version>
        <!--注意：此处必须排除传递过来的依赖，否则会跟我们自己导入的Spring jar包产生冲突-->
        <exclusions>
            <exclusion>
                <groupId>org.springframework</groupId>
                <artifactId>spring-tx</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.springframework</groupId>
                <artifactId>spring-beans</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.springframework</groupId>
                <artifactId>spring-core</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.springframework</groupId>
                <artifactId>spring-context</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context-support</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-test</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-tx</artifactId>
        <version>${spring.version}</version>
    </dependency>
</dependencies>
```

**配置文件**

创建Spring配置文件/resources/spring.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:kie="http://drools.org/schema/kie-spring"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                            http://www.springframework.org/schema/beans/spring-beans.xsd
                            http://drools.org/schema/kie-spring
                            http://drools.org/schema/kie-spring.xsd">
    <kie:kmodule id="kmodule">
        <kie:kbase name="kbase" packages="rules">
            <kie:ksession name="ksession"></kie:ksession>
        </kie:kbase>
    </kie:kmodule>
    <bean class="org.kie.spring.annotations.KModuleAnnotationPostProcessor"></bean>
</beans>
```

**规则文件**

/resources/rules，中rules目录中创建规则文件helloworld.drl

```java
package helloworld

rule "rule_helloworld"
    when
        eval(true)
    then
        System.out.println("规则：rule_helloworld触发...");
end
```

**测试**

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath:spring.xml")
public class DroolsSpringTest {
    @KBase("kbase")
    private KieBase kieBase;//注入KieBase对象
    @Test
    public void test1(){
        KieSession kieSession = kieBase.newKieSession();
        kieSession.fireAllRules();
        kieSession.dispose();
    }
}
```

### SpringMVC+Drools

**依赖**

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
    <drools.version>7.10.0.Final</drools.version>
    <spring.version>5.0.5.RELEASE</spring.version>
</properties>
<dependencies>
    <dependency>
      <groupId>org.drools</groupId>
      <artifactId>drools-compiler</artifactId>
      <version>${drools.version}</version>
    </dependency>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>4.12</version>
    </dependency>
    <dependency>
      <groupId>org.kie</groupId>
      <artifactId>kie-spring</artifactId>
      <version>${drools.version}</version>
      <!--注意：此处必须排除传递过来的依赖，否则会跟我们自己导入的Spring jar包产生冲突-->
      <exclusions>
        <exclusion>
          <groupId>org.springframework</groupId>
          <artifactId>spring-tx</artifactId>
        </exclusion>
        <exclusion>
          <groupId>org.springframework</groupId>
          <artifactId>spring-beans</artifactId>
        </exclusion>
        <exclusion>
          <groupId>org.springframework</groupId>
          <artifactId>spring-core</artifactId>
        </exclusion>
        <exclusion>
          <groupId>org.springframework</groupId>
          <artifactId>spring-context</artifactId>
        </exclusion>
      </exclusions>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-context</artifactId>
      <version>${spring.version}</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-context-support</artifactId>
      <version>${spring.version}</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-test</artifactId>
      <version>${spring.version}</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-tx</artifactId>
      <version>${spring.version}</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-web</artifactId>
      <version>${spring.version}</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-webmvc</artifactId>
      <version>${spring.version}</version>
    </dependency>
</dependencies>
```

**web.xml**

```xml
<!DOCTYPE web-app PUBLIC
 "-//Sun Microsystems, Inc.//DTD Web Application 2.3//EN"
 "http://java.sun.com/dtd/web-app_2_3.dtd" >
<web-app>
  <display-name>Archetype Created Web Application</display-name>
  <servlet>
    <servlet-name>springmvc</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <!-- 指定加载的配置文件 ，通过参数contextConfigLocation加载 -->
    <init-param>
      <param-name>contextConfigLocation</param-name>
      <param-value>classpath:springmvc.xml</param-value>
    </init-param>
    <load-on-startup>1</load-on-startup>
  </servlet>
  <servlet-mapping>
    <servlet-name>springmvc</servlet-name>
    <url-pattern>*.do</url-pattern>
  </servlet-mapping>
</web-app>
```

**配置文件**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xmlns:kie="http://drools.org/schema/kie-spring"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://drools.org/schema/kie-spring
       http://drools.org/schema/kie-spring.xsd
       http://www.springframework.org/schema/mvc
       http://www.springframework.org/schema/mvc/spring-mvc.xsd
       http://www.springframework.org/schema/context
       http://www.springframework.org/schema/context/spring-context.xsd">

    <kie:kmodule id="kmodule">
        <kie:kbase name="kbase" packages="rules">
            <kie:ksession name="ksession"></kie:ksession>
        </kie:kbase>
    </kie:kmodule>

    <bean class="org.kie.spring.annotations.KModuleAnnotationPostProcessor"/>

    <!--spring批量扫描-->
    <context:component-scan base-package="com.itheima" />
    <context:annotation-config/>
    <!--springMVC注解驱动-->
    <mvc:annotation-driven/>
</beans>
```

drl、service、controller略

### SpringBoot+Drools

**依赖**

```xml
<dependency>
    <groupId>org.drools</groupId>
    <artifactId>drools-core</artifactId>
    <version>7.6.0.Final</version>
</dependency>
<dependency>
    <groupId>org.drools</groupId>
    <artifactId>drools-compiler</artifactId>
    <version>7.6.0.Final</version>
</dependency>
<dependency>
    <groupId>org.drools</groupId>
    <artifactId>drools-templates</artifactId>
    <version>7.6.0.Final</version>
</dependency>
<dependency>
    <groupId>org.kie</groupId>
    <artifactId>kie-api</artifactId>
    <version>7.6.0.Final</version>
</dependency>
<dependency>
    <groupId>org.kie</groupId>
    <artifactId>kie-spring</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-tx</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-beans</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
        </exclusion>
    </exclusions>
    <version>7.6.0.Final</version>
</dependency>
```

**配置类**

```java
@Configuration
public class DroolsConfig {
    //指定规则文件存放的目录
    private static final String RULES_PATH = "rules/";
    private final KieServices kieServices = KieServices.Factory.get();
    @Bean
    @ConditionalOnMissingBean
    public KieFileSystem kieFileSystem() throws IOException {
        KieFileSystem kieFileSystem = kieServices.newKieFileSystem();
        ResourcePatternResolver resourcePatternResolver = 
            new PathMatchingResourcePatternResolver();
        Resource[] files = 
            resourcePatternResolver.getResources("classpath*:" + RULES_PATH + "*.*");
        String path = null;
        for (Resource file : files) {
            path = RULES_PATH + file.getFilename();
            kieFileSystem.write(ResourceFactory.newClassPathResource(path, "UTF-8"));
        }
        return kieFileSystem;
    }
    @Bean
    @ConditionalOnMissingBean
    public KieContainer kieContainer() throws IOException {
        KieRepository kieRepository = kieServices.getRepository();
        kieRepository.addKieModule(kieRepository::getDefaultReleaseId);
        KieBuilder kieBuilder = kieServices.newKieBuilder(kieFileSystem());
        kieBuilder.buildAll();
        return kieServices.newKieContainer(kieRepository.getDefaultReleaseId());
    }
    @Bean
    @ConditionalOnMissingBean
    public KieBase kieBase() throws IOException {
        return kieContainer().getKieBase();
    }
    @Bean
    @ConditionalOnMissingBean
    public KModuleBeanFactoryPostProcessor kiePostProcessor() {
        return new KModuleBeanFactoryPostProcessor();
    }
}
```

drl、service、controller略

### 整合WorkBench

WorkBench是KIE组件中的元素，也称为KIE-WB，是Drools-WB与JBPM-WB的结合体。它是一个**可视化的规则编辑器**。WorkBench其实就是一个war包，安装到tomcat中就可以运行。使用WorkBench可以在浏览器中创建数据对象、创建规则文件、创建测试场景并将规则部署到maven仓库供其他应用使用。

下载地址：https://download.jboss.org/drools/release/7.6.0.Final/kie-drools-wb-7.6.0.Final-tomcat8.war

注意：下载的war包需要安装到tomcat8中。

整个流程就是咔咔咔一顿操作，通过web页面生成规则代码，并打包上传到远程仓库

java代码中只需要保证三点即可：

- 依赖

  ```xml
  <dependency>
      <groupId>org.drools</groupId>
      <artifactId>drools-compiler</artifactId>
      <version>7.10.0.Final</version>
  </dependency>
  ```

- JavaBean --- 需要和WorkBench中创建的JavaBean包名、类名完全相同，属性也需要对应

- 使用远程仓库的jar包

  ```java
  @Test
  public void test1() throws Exception{
      //通过此URL可以访问到maven仓库中的jar包
      //URL地址构成：http://ip地址:Tomcat端口号/WorkBench工程名/maven2/坐标/版本号/xxx.jar
      String url = 
      "http://localhost:8080/kie-drools-wb/maven2/com/itheima/pro1/1.0.0/pro1-1.0.0.jar";
      
      KieServices kieServices = KieServices.Factory.get();
      
      //通过Resource资源对象加载jar包
      UrlResource resource = (UrlResource) kieServices.getResources().newUrlResource(url);
      //通过Workbench提供的服务来访问maven仓库中的jar包资源，需要先进行Workbench的认证
      resource.setUsername("kie");
      resource.setPassword("kie");
      resource.setBasicAuthentication("enabled");
      
      //将资源转换为输入流，通过此输入流可以读取jar包数据
      InputStream inputStream = resource.getInputStream();
      
      //创建仓库对象，仓库对象中保存Drools的规则信息
      KieRepository repository = kieServices.getRepository();
      
      //通过输入流读取maven仓库中的jar包数据，包装成KieModule模块添加到仓库中
      KieModule kieModule = 
      repository.
          addKieModule(kieServices.getResources().newInputStreamResource(inputStream));
      
      //基于KieModule模块创建容器对象，从容器中可以获取session会话
      KieContainer kieContainer = kieServices.newKieContainer(kieModule.getReleaseId());
      KieSession session = kieContainer.newKieSession();
  
      Person person = new Person();
      person.setAge(10);
      session.insert(person);
  
      session.fireAllRules();
      session.dispose();
  }
  ```

## 模板使用案例（待整理）

### 模板

规则模板文件以template header开头，以end template结尾。

然后其中：age,className代表的是xls中的列映射名称。如第一列映射的名称为age。

template “cheesefans””为模板名称，是唯一的，关键字template表示一个规则模板的开始，一个规则模板中可以有多个模板。

@{row.rowNumber}”是模板中的一个函数，用来让规则名唯一。

“@{age}”““@{className}””是对应age、className的，是最终获取数据源中参数值的。

其中@{className}加了引号，是因为setClassName()方法需要的类型为字符串。

```java
template header
age
className

package rules.isDrt

import com.domain.Person

template "cheesefans"

rule "cheese fans_@{row.rowNumber}"
no-loop true
when
    $p:Person(age==@{age})
then
    $p.setClassName("@{className}");
    update($p);
    System.out.println($p);
end
end template
```

规则表

```sql
CREATE TABLE `iot_rules` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(30) NOT NULL COMMENT '规则名称',
  `data_format` varchar(45) NOT NULL COMMENT '数据格式JSON/二进制',
  `fields` varchar(256) NOT NULL COMMENT '规则字段',
  `product_key` varchar(32) NOT NULL COMMENT '产品key',
  `rule_property` int(2) NOT NULL DEFAULT '0' COMMENT '0:产品规则；1:设备规则',
  `device_id` bigint(20) DEFAULT NULL COMMENT '设备ID',
  `topic` varchar(64) NOT NULL COMMENT '设备topic',
  `rule_con` varchar(64) DEFAULT NULL COMMENT '规则条件',
  `target_source_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '数据源 ID',
  `target_source` varchar(64) NOT NULL COMMENT '数据源',
  `status` varchar(45) DEFAULT '0' COMMENT '0:新建 1:启用：2:暂停,3:删除',
  `rule_des` varchar(100) DEFAULT NULL COMMENT '规则描述',
  `del_flag` bigint(20) NOT NULL DEFAULT '0' COMMENT '删除标记0正常 id删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_rule_name` (`name`,`del_flag`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8 COMMENT='规则表';
```

spring 启动时，将规则引擎初始化，加载规则

```xml
<bean id="rulesInit" class="com.jd.iot.jpt.rulesengine.init.IotRulesInit" init-method="init"/>
```

```java
public void init() {
	logger.info("RulesEngine init begin.");
	// add rules from db
    if (!rulesService.loadRules()) {
		logger.error("load rules error.");
		return;
	}
	// init kie runtime env
	IotKieContext iotKieContext = IotKieContext.getIotKieContext();
	try {
		iotKieContext.initIotKieContext(false);
	} catch (Exception e) {
		logger.error("RulesEngine init kie runtime env error,system will be exit.");
		System.exit(-1);
	}
	//message thread
	executor.execute(new MessageRunnable(MessageCache.getDataCache()));
	logger.info("RulesEngine init end.");
}
```

loadRules

```java
// 查询数据库 -- 略
List<IotRule> rules = iotRuleService.query(params);
for (IotRule rule : rules) {
    // 拼接规则名
    // 通过模板编译
    String drl = KieUtils.templatize(seq,groupId,ruleId,topicPattern,deviceName);
}
```

```java
public static String templatize(String seq,long groupId,long ruleId,String topicPattern,String deviceName) throws Exception {
   Map<String, Object> data = new HashMap<>(8);
   ObjectDataCompiler objectDataCompiler = new ObjectDataCompiler();
   ResourcePatternResolver resourcePatternResolver = new PathMatchingResourcePatternResolver();
   Resource resource = resourcePatternResolver.getResource("rules/rule-template.drl");
   InputStream ruleFile = resource.getInputStream();
   data.put("ruleSeq", seq);
   data.put("groupId", groupId);
   data.put("ruleId", ruleId);
   data.put("topicPattern", topicPattern);
   data.put("deviceName", deviceName);
   System.out.println("ruleFile=" + ruleFile);
   return objectDataCompiler.compile(Arrays.asList(data), ruleFile);
}
```





initIotKieContext

```java

```

