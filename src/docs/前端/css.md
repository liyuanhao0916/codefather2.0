# css

## 基础概述

### 显示模式

- 块元素：`<h1>~<h6>、<p>、<div>、<ul>、<ol>、<li>`
  - 独占一行
  - 高度，宽度、外边距以及内边距都可以控制
  - 宽度默认是容器（父级宽度）的100%
  - 是一个容器及盒子，里面可以放行内或者块级元素
  - 文字类块元素内不能套块元素`<h1>~<h6>、<p>`

- 行内元素：`<a>、<strong>、<b>、<em>、<i>、<del>、<s>、<ins>、<u>、<span>`

  - 相邻行内元素在一行上，一行可以显示多个
  - 高、宽直接设置是无效的
  - 默认宽度就是它本身内容的宽度
  - 行内元素只能容纳文本或其他行内元素
  - 链接里面不能再放链接，特殊情况链接 `<a>` 里面可以放块级元素，但是给 `<a>` 转换一下块级模式最安全

- 行内块元素：`<img />、<input />、<td>`

  - 它们同时具有块元素和行内元素的特点。有些资料称它们为行内块元素
  - 和相邻行内元素（行内块）在一行上，但是他们之间会有空白缝隙
  - 一行可以显示多个（行内元素特点）
  - 默认宽度就是它本身内容的宽度（行内元素特点）
  - 高度，行高、外边距以及内边距都可以控制（块级元素特点）

- 元素显示模式的转换：一个模式的元素需要另外一种模式的特性，比如给 `<a> `增加宽高

  - 转换为块元素：display:block
  - 转换为行内元素：display:inline
  - 转换为行内块：display: inline-block

  ```css
  a {
      width: 20px;
      height: 30px;
      display:block;	/* 转块 */
  }
  
  div {
      width: 20px;	/* 失效 */
      height: 30px;	/* 失效 */
      display:inline; /* 转行内元素 */
  }
  
  span {
      width: 20px;
      height: 30px;
      display: inline-block;	/* 转行内块元素 */
  }
  ```

- **垂直居中：行高=高（height=line-height）**

### 三大特性

- 层叠性（覆盖）

  - 样式冲突，遵循的原则是就近原则，哪个样式离结构近，就执行哪个样式
  - 样式不冲突，不会层叠

- 继承性：子标签会继承父标签的某些样式，如文本颜色和字号

  - （text-，font-，line-这些元素开头的可以继承，以及color属性）

  - **例外：行高的继承性**

    ```css
     body {
       font:12px/1.5 Microsoft YaHei；
     }
    ```

    - 行高可以跟单位也可以**不跟单位=文字大小*1.5**
    - 如果子元素没有设置行高，则会继承父元素的行高为 1.5
    - 此时子元素的行高是：当前子元素的文字大小 * 1.5
    - body 行高 1.5  这样写法最大的优势就是里面子元素可以根据自己文字大小自动调整行高

- 优先级

  - !important  >  行内样式 >  id选择器 >  类选择器、伪类选择器 >  标签选择器 >  继承、*

    ```css
    div {
        color: red !important;
    }
    ```

  - 权重叠加：如果是复合选择器，则会有权重叠加，需要计算权重

    - div ul  li   ------>      0,0,0,3
    - .nav ul li   ------>      0,0,1,2
    - a:hover      -----—>   0,0,1,1
    - .nav a       ------>      0,0,1,1

## 选择器

### 基础选择器

- 标签选择器

  ```css
  标签名{
      属性：属性值
      ...
  }
  ```

- ID选择器：只能引用一次，标签的id属性值唯一

  ```css
  #id名 {
      属性1: 属性值1;  
      ...
  } 
  ```

- 类选择器：多类名在引用时空格隔开

  ```css
  .类名 {
      属性1: 属性值1;  
      ...
  } 
  ```

- 通配符选择器

  ```css
  * {
      属性1: 属性值1;  
      ...
  }
  ```

### 复合选择器

- 后代选择器
  - 元素1 和 元素2 中间用 **空格** 隔开
  - 元素1 是父级，元素2 是子级，最终选择的是元素2
  - 元素2 可以是儿子，也可以是孙子等，只要是元素1 的后代即可
  - 元素1 和 元素2 可以是任意基础选择器

- 亲儿子选择器

  - 元素1 和 元素2 中间用 **大于号** 隔开
  - 元素1 是父级，元素2 是子级，最终选择的是元素2
  - 元素2 必须是亲儿子，其孙子、重孙之类都不归他管

- 并集选择器

  - 元素1 和 元素2 中间用 **逗号** 隔开
  - 逗号可以理解为和的意思
  - 并集选择器通常用于集体声明

- 伪类选择器：伪类选择器书写最大的特点是用**冒号（:）**表示，比如 :hover 、 :first-child 

  - 链接伪类选择器：为了确保生效，请按照 LVHA 的循顺序声明 link、visited、hover、active

    - a:link	没有点击过的(访问过的)链接
    - a:visited	点击过的(访问过的)链接
    - a:hover	鼠标经过的那个链接**（常用）**
    - a:active	鼠标正在按下还没有弹起鼠标的那个链接
  - .ck:checked  复选框被选中
  
    > `<a>`具有默认样式，body定义的样式无法改变a标签的样式，开发中经常如下使用
    >
    > ```css
    > a {
    >     color: gray;
    > }
    > 
    > a:hover {
    >     color: red;
    > }
  > ```
  
- 焦点伪类选择器：`:focus`用于选取获得焦点的**表单**元素
  
    ```css
    input:focus {
        background-color: yellow;
    }
    ```

## 属性

### 字体属性

**一般对body定义全局字体属性**

```css
body {  
    font-style: normal;	/* 样式，narmal 默认，italic 斜体 */
    font-weight: bold; 	/* 粗细，100-900，narmal=400 默认不加粗，bold=700，不加单位 */
    font-size: 20px;	/* 字号，浏览器默认值不同，必须指定，标题必须单独指定大小 */ 
    font-family: Arial,"Microsoft Yahei", "微软雅黑";
}
```

> font-family：字体，使用英文名，多个字体逗号隔开，**按顺序找到第一个能加载的字体**，如果有空格隔开的多个单词组成的字体,加引号，尽量使用系统默认自带字体，保证在任何用户的浏览器中都能正确显示，最常见的几个字体：
>
> ```css
> body {
>     font-family: 'Microsoft YaHei',tahoma,arial,'Hiragino Sans GB'; 
> }
> ```

**复合属性**

- 必须按照顺序书写`font-style font-weight font-size/line-height font-family`
- 不需要设置的属性可以省略（取默认值），但**必须保留 font-size 和 font-family 属性**

```css
div {
    /* font: font-style font-weight font-size/line-height font-family; */
    font: italic 700 16px/20px "Microsoft Yahei";
}
```

### 文本属性

```css
div {  
    color: red;			/* 颜色*/
    text-align: center; /* 对齐，可选 left、right、center */
    text-decoration: underline；	/* 装饰，可选 none、underline、line-through */ 
    text-indent: 10px;	/* 缩进，可为负值 */
    text-shadow: 2px 1px 2px rgba(0,0,0,.3)	/* 文字阴影 */
    line-height: 26px;	/* 行间距 */
}
```

- color：开发最常用16进制
  - 预设
  - 16进制 #FF0000
  - RGB rgb(255,0,0) 或 rgb(100%,0%,0%)
- text-decoration：常用来去掉超链接的下划线
- text-indent：可以用em这个单位，代表1个文字大小，是相对，由font-size决定
- text-shadow：四个值分别是水平偏移、垂直偏移、模糊半径、阴影颜色

### 背景属性

```css
div {
    background-color: red;				/* 背景色，默认透明transparent */
    background-image: url(http://www);	/* 背景图，none 或 url */
    background-repeat: repeat;	/* 默认平铺，可选repeat、no-repeat、repeat-x、repeat-y */
    background-position: top center;		/* 背景图片位置 */
    background-attachment: fixed;	/* 背景图片固定与滚动，可选 fixed、scroll，默认滚动 */
    background: rgba(0,0,0,.3);	/* 最后参数为透明度0-1,0.3简写为.3 */
    background-size: 50px 50px;			/* 背景图大小 */
}
```

- background-position：背景图片位置，参数为横纵坐标

  - 参数是方位名词：top、center、bottom、left、right
    - 如果指定的两个值都是方位名词，则两个值前后顺序无关，比如 left  top 和 top  left 效果一致
    - 如果只指定了一个方位名词，另一个值省略，则第二个值默认居中对齐

  - 参数是精确单位
    - 如果参数值是精确坐标，那么第一个肯定是 x 坐标，第二个一定是 y 坐标

    - 如果只指定一个数值，那该数值一定是 x 坐标，另一个默认垂直居中

  - 参数是混合单位
    - 如果指定的两个值是精确单位和方位名词混合使用，则第一个值是 x 坐标，第二个值是 y 坐标
  - **大背景图常用 center top**

- background-size: 背景图片宽度 背景图片高度;

  - 单位： 长度|百分比|cover|contain
  - cover把背景图像扩展至足够大，以使背景图像**完全覆盖**背景区域
  - contain把图像图像扩展至最大尺寸，以使其宽度和高度完全适应内容区域，**高或宽一边适应**

**复合属性**

- 没有顺序，但是习惯background: 背景颜色 背景图片地址 背景平铺 背景图像滚动 背景图片位置;

  ```css
  div {
      background: rgba(232, 172, 172,.3) url(bg1.png) no-repeat fixed center;
  }
  ```

### 盒子属性

```css
div {
    border-width: 1px;			/* 边框粗细 */
    border-style: solid;		/* 边框样式 */
    border-color: red;			/* 边框颜色 */
    border-collapse: collapse; 	/* 边框合并 */
    border-radius: 2px;			/* 圆角边框 值为弧度半径, 写4个值就是顺时针顺序*/
    border-top-left-radius: 1px;/* 分开写的圆角边框 */
    padding: 5px 10px 20px;		/* 上中下内边距 */
    padding-left: 20px;			/* 左内边距 */
    margin: 0 auto;				/* 外边距 -- 水平居中 */
    
    box-shadow: 20px 0px 10px 0px rgba(0,0,0,.3) inset;	/* 盒子阴影 */
    
    
}
```

- border-style

  - none：没有边框即忽略所有边框的宽度（默认值）
  - solid：边框为单实线(最为常用的)
  - dashed：边框为虚线  
  - dotted：边框为点线

- border-collapse：两个盒子边框出现叠加的情况，collapse表示合并在一起

- box-shadow：六个值分别是水平偏移、垂直偏移、模糊半径、阴影半径、阴影颜色、内外阴影

  - 默认的是外阴影(outset), 但是不可以写这个单词,否则造成阴影无效
  - 盒子阴影不占用空间，不会影响其他盒子排列

- **边框会撑大盒子**

- **内边距会撑大盒子**：*前提 --- 盒子有宽度或高度*

- 外边距

  - **水平居中** -- 三种方法

    ```css
    1、 margin-left: auto;   margin-right: auto;
    2、 margin: auto;
    3、 margin: 0 auto;
    ```

  - **兄弟垂直外边距合并** -- 相邻的兄弟盒子，上面的下外边距 和 下面的上外边距，两个垂直间距不累加，取大值 --- 开发中，只设置一个盒子的外边距即可

  - **嵌套垂直外边距塌陷** -- 嵌套的父子盒子，父子俩同时有上外边距，父盒子的上外边距=取大值，子盒子上外边距变成0 --- 解决方案有三种

    - 父元素定义上边框 --- 颜色可设为透明
    - 父盒子定义上内边距
    - 父盒子添加`overflow:hidden`

- 清除内外边距 --- 浏览器默认值不一致，需要先行清除

  ```css
  * {
      padding:0;   /* 清除内边距 */
      margin:0;    /* 清除外边距 */
    }
  ```

- **行内元素**为了照顾兼容性，尽量**只设置左右内外边距**，不要设置上下内外边距。但是转换为块级和行内块元素就可以了

**复合属性**

```css
div {
    border: 1px solid red;
    border-top: 1px solid red;
    margin: 0 auto;
}
```

### 特殊属性

```css
/* 去掉小圆点 */
li {
    list-style: none;	/* 去掉小圆点 */
}

/* 隐藏元素 */
div {
    display: none;				/* 元素隐藏 */
    visibility: hidden;			/* 元素隐藏 */
    overflow: hidden;			/* 溢出隐藏 */
}

/* 鼠标样式 */
a {
    cursor: pointer; 
}

/* 轮廓线 */
input {
    outline: none; 
}

/* 防止拖拽文本域 resize */
textarea {
    resize: none;
}

/* 元素的对齐方式 */
div {
    vertical-align: middle;		/* 垂直对齐 --- 行中的元素基于中线对齐 */
}
img {
    vertical-align: bottom;		/*  解决图片底部默认空白缝隙问题, 也可以转为块级元素 */
}
```

- display：显示模式，可选none(隐藏)、block(块级元素)、inline(行内元素)、inline-block(行内块元素)
- visibility：可见性，可选visible（可见）、hidden（隐藏）
- overflow：溢出选项，可选visible（溢出可见）、hidden（溢出隐藏）、scroll（必带滚动条）、auto（自适应滚动条）
- vertical-align：行中的元素对齐方式，可选baseline(基线)、top(顶线)、middle(中线)、bottom(底线)
- cursor：鼠标样式，可选pointer(小手)、move（可移动）、text（文本）
  - url()(自定义)，使用时，必须跟一个鼠标样式
- 隐藏
  - display：none，隐藏元素后，**不再占**有原来的位置
  - visibility：hidden，隐藏元素后，继续占有原来的位置
  - overflow：hidden

### 书写顺序

建议遵循以下顺序：

1. **布局定位属性**：display / position / float / clear / visibility / overflow（建议 display 第一个写，毕竟关系到模式）

2. **自身属性**：width / height / margin / padding / border / background

3. **文本属性**：color / font / text-decoration / text-align / vertical-align / white- space / break-word

4. **其他属性（CSS3）**：content / cursor / border-radius / box-shadow / text-shadow / background:linear-gradient …

   ```css
    .jdc {
       display: block;
       position: relative;
       float: left;
       width: 100px;
       height: 100px;
       margin: 0 10px;
       padding: 20px 0;
       font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
       color: #333;
       background: rgba(0,0,0,.5);
       border-radius: 10px;
    } 
   ```

## 布局

### 标准流

所谓的标准流:  就是标签按照规定好默认方式排列

1. 块级元素会独占一行，从上向下顺序排列。常用元素：div、hr、p、h1~h6、ul、ol、dl、form、table
2. 行内元素会按照顺序，从左到右顺序排列，碰到父元素边缘则自动换行。常用元素：span、a、i、em 等 

### 浮动

**多个块级元素纵向排列找标准流，多个块级元素横向排列找浮动**

**先设置盒子的大小, 之后设置盒子的位置**

```css
div {
    float: left;	/* 左浮动 */
}
```

**特性：**

- 浮动元素会脱离标准流(脱标：浮动的盒子**不再保留原先的位置**)
- 浮动的元素会**一行显示**并且元素**顶部对齐**，如果父级装不下这些浮动的盒子，多出的另起一行对齐
- 浮动的元素会具有行内块元素的特性
  - 浮动元素的**大小根据内容来决定**
  - 浮动的盒子中间是**没有缝隙**的

> 开发中，标准流用于纵向布局，每个标准流中浮动布局，**一浮全浮**
>
> - 先用标准流的父元素排列上下位置, 之后内部子元素采取浮动排列左右位置
> - 浮动的盒子**只会影响浮动盒子后面的标准流，不会影响前面的标准流**

**清除浮动**

- 由于父级盒子很多情况下，不方便给高度，但是子盒子浮动又不占有位置，最后父级盒子高度为 0 时，就会影响下面的标准流盒子

- 清除浮动的本质 ---- 清除浮动元素造成的影响：浮动的子标签无法撑开父盒子的高度

- 清除浮动的策略 ---- 闭合浮动，只让浮动在父盒子内部影响,不影响父盒子外面的其他盒子

  > 注意：
  >
  > - 如果父盒子本身**有高度**，则**不需要清除浮动**
  > - 清除浮动之后，父级就会根据浮动的子盒子自动检测高度
  > - 父级有了高度，就不会影响下面的标准流了

- 方法一 --- 额外标签法（了解），浮动元素的末尾增加空的块级标签（`<div>、<br/>`等），但结构差

  ```html
  <div>
      <div style="float:left">1</div>
      <div style="float:left">2</div>
      <div style="float:left">3</div>
      ...
      <div style=”clear:both”></div>
  </div>
  ```

- 方法二 --- 父级添加 overflow，将其属性值设置为 hidden或 auto 或 scroll，但无法显示溢出的部分

  ```css
  <div style="overflow:hidden">
      <div style="float:left">1</div>
      <div style="float:left">2</div>
      <div style="float:left">3</div>
      ...
  </div>
  ```

- 方法三 --- :after 伪元素法 --- 最后面闭合浮动

  ```css
  .clearfix:after {
      content: "";
      display: block;
      height: 0;
      clear: both;
      visibility: hidden;
  }
  .clearfix { /* IE6、7 专有 */
  	*zoom: 1;
  }
  ```

- 方法四 --- 双伪元素清除浮动 --- 前后都闭合浮动

  ```css
  .clearfix:before,.clearfix:after {
      content:"";
      display:table;
  }
  .clearfix:after {
  	clear:both;
  }
  .clearfix {
  	*zoom:1;
  }
  ```

### 定位

某个元素可以**自由**的在一个盒子内移动位置，并且**压住**其他盒子

当我们滚动窗口的时候，盒子是**固定**屏幕某个位置的

**定位 = 定位模式 + 边偏移**  

- **定位模式** --- position --- 用于指定一个元素在文档中的定位方式
- **边偏移** --- top、bottom、left、right --- 则决定了该元素的最终位置

```css
div {
    position: relative; 	/* 相对定位 */
    top: 80px;				/* top、bottom不能同时出现 */
    left: 80px;				/* left、right不能同时出现 */
    z-index: 1; 			/* 堆叠顺序, 数值越大越靠前, 值相同, 后来居上*/
}
```

***静态定位*** --- static --- 无定位，按照标准流特性摆放位置，它没有边偏移（了解）

***相对定位*** --- relative

- **相对于它自己原来的位置**
- **原来位置继续占有**，**并没有脱标**
- 它最典型的应用是**给绝对定位当爹**

***绝对定位*** --- absolute

- **完全脱标** ---- 完全不占位置
- 找定位的爹定位 ---- **根据最近的已定位的祖先容器定位**（爹没有找爷，**都没有**就是相对**浏览器**定位）
- **谁定位了谁就是爹** --- 爹只要定位即可，可以是relative、absolute、fixed
- **子绝父相** --- **子级是绝对定位的话，父级要用相对定位**
  - 子绝 --- 不能占兄弟盒子的位置，所以要绝对定位
  - 父定位 --- 父盒子要限制子盒子，所以要定位，否则子盒子就会去找爷爷或浏览器定位
  - 父相 --- 父盒子加定位后还得占据原来的位置，所以要相对定位

***固定定位*** --- fixed

- 固定于浏览器可视区，以浏览器的可视窗口为参照点移动元素
  - 跟父元素没有任何关系
  - 不随滚动条滚动
- **不在占有原先的位置**
- 固定定位也可以看做是一种**特殊的绝对定位**

***粘性定位*** --- sticky --- 兼具相对定位和固定定位的特点

- 以浏览器的可视窗口为参照点移动元素 --- 固定定位
- 占有原先的位置 --- 相对定位特点
- 必须添加 top 、left、right、bottom **其中一个**才有效

> **绝对定位、固定定位的注意点**
>
> - 加了**绝对定位/固定定位的盒子**不能通过设置 `margin: auto` 设置**水平居中**
> - 绝对定位和固定定位也**和浮动类似**
>   - 行内元素添加绝对或者固定定位，可以直接设置高度和宽度
>   - 块级元素添加绝对或者固定定位，如果不给宽度或者高度，默认大小是内容的大小
> - 脱标的盒子不会触发外边距塌陷 --- **浮动元素**、**绝对定位(固定定位）**元素的都不会触发外边距合并的问题
> - 绝对定位（固定定位）会完全压住盒子，**浮动元素**不同，**只压标准流盒子**，**但是不会压标准流盒子里面的文字**
> - 
>
> **改变显示模式有以下方式**
>
> - display：inline-block  转换为行内块
> - float 默认转换为行内块（类似，并不完全一样，因为浮动是脱标的）
> - 绝对定位和固定定位也和浮动类似， 默认转换的特性 转换为行内块
>
> 故，一个行内的盒子，如果加了**浮动**、**固定定位**和**绝对定位**，不用转换，就可以给这个盒子直接设置宽度和高度等



> ***定位到版心右侧固定位置***
>
> ```css
> /* 版心 */
> .w {
>     width: 800px;
>     height: 1400px;
>     background-color: pink;
>     margin: 0 auto;
> }
> /* 版心旁右侧固定位置 */
> .fixed {
>     position: fixed;
>     /* 1. 走浏览器宽度的一半 */
>     left: 50%;
>     /* 2. 利用margin 走版心盒子宽度的一半距离 */
>     margin-left: 405px;
>     width: 50px;
>     height: 150px;
>     background-color: skyblue;
> }
> ```
>
> ***绝对定位、固定定位的水平居中***
>
> ```css
> .center {
>     position: fixed;
>     /* 1. 让盒子的左侧移动到父级元素的水平中心位置 */
>     left: 50%;
>     /* 2. 利用margin 让盒子向左移动自身宽度的一半 */
>     margin-left: -100px;
>     width: 50px;
>     height: 150px;
>     background-color: skyblue;
> }
> ```

### 布局分析

为了提高网页制作的效率，布局时通常有以下的布局流程

- 必须确定页面的版心（可视区），我们测量可得知
- 分析页面中的行模块，以及每个行模块中的列模块
- 制作 HTML 结构。我们还是遵循，先有结构，后有样式的原则。结构永远最重要
- 开始运用盒子模型的原理，通过 DIV+CSS 布局来控制网页的各个模块

```css
/* 版心 */
.w {
    width: 1200px;
    margin: auto;
}
```

## 实战技巧

### 精灵图

[背景图片位置](#背景属性)

```css
div {
    background-position: -20px -30px;
}
```

1. 精灵技术主要针对于背景图片使用。就是把多个小背景图片整合到一张大图片中
2. 这个大图片也称为 sprites  精灵图  或者 雪碧图
3. 移动背景图片位置， 此时可以使用 background-position 
4. 移动的距离就是这个目标图片的 x 和 y 坐标。注意网页中的坐标有所不同
5. 因为一般情况下都是往上往左移动，所以**数值是负值**
6. 使用精灵图的时候需要精确测量，每个小背景图片的大小和位置

### 字体图标

- 下载字库 --- 不要删，追加字体的时候还要用

  - [阿里 iconfont 字库](http://www.iconfont.cn/)
  - [icomoon 字库](http://icomoon.io)

- **字体文件格式**

  不同浏览器所支持的字体格式是不一样的，字体图标之所以兼容，就是因为包含了主流浏览器支持的字体文件

  > 1).TureType(  **.ttf**  )格式.ttf字体是Windows和Mac的最常见的字体，支持这种字体的浏览器有IE9+、Firefox3.5+、Chrome4+、Safari3+、Opera10+、iOS Mobile、Safari4.2+；
  >
  > 2).Web Open Font Format( **.woff** )格式woff字体，支持这种字体的浏览器有IE9+、Firefox3.5+、Chrome6+、Safari3.6+、Opera11.1+；
  >
  > 3).Embedded Open Type( **.eot** )格式.eot字体是IE专用字体，支持这种字体的浏览器有IE4+；
  >
  > 4).SVG(  .**svg**  )格式.svg字体是基于SVG字体渲染的一种格式，支持这种字体的浏览器有Chrome4+、Safari3.1+、Opera10.0+、iOS Mobile Safari3.2+；

- 字体图标定位到指定位置步骤

  - 结构中定义div盒子
  - 在style中先申明字体  @font-face
  - 在style中定义after伪元素 div::after{...}
  - 在after伪元素中 设置content属性，属性的值就是字体编码
  - 在after伪元素中 设置font-family的属性
  - 利用定位的方式，让伪元素定位到相应的位置；记住定位口诀：子绝父相

  ```html
  <head>
      ...
      <style>
          @font-face {
              font-family: 'icomoon';
              src: url('fonts/icomoon.eot?1lv3na');
              src: url('fonts/icomoon.eot?1lv3na#iefix') format('embedded-opentype'),
                  url('fonts/icomoon.ttf?1lv3na') format('truetype'),
                  url('fonts/icomoon.woff?1lv3na') format('woff'),
                  url('fonts/icomoon.svg?1lv3na#icomoon') format('svg');
              font-weight: normal;
              font-style: normal;
              font-display: block;
          }
          div {
              position: relative;
              width: 200px;
              height: 35px;
              border: 1px solid red;
          }
  
          div::after {
              position: absolute;
              top: 10px;
              right: 10px;
              font-family: 'icomoon';
              /* content: ''; */
              content: '\e91e';
              color: red;
              font-size: 18px;
          }
      </style>
  </head>
  <body>
      <div></div>
  </body>
  ```

  

### CSS三角

```css
div {
 	width: 0; 
    height: 0;
    border: 50px solid transparent;
	border-color: red green blue black;
    /* 下面是照顾低版本浏览器加的 */
	line-height:0;
    font-size: 0;
 }
```

- 原理
  - 宽高都是0，加外边框就会显示一个由四个等腰直拼成的正方形
  - 只保留需要的一个，其他改为透明
  - 普通的直角三角形，只需将边框大小不要相同就会出现普通的直角三角形

### 溢出省略号

单行溢出

```css
/*1. 先强制一行内显示文本*/
white-space: nowrap;  （ 默认 normal 自动换行）
   
/*2. 超出的部分隐藏*/
overflow: hidden;
   
/*3. 文字用省略号替代超出的部分*/
text-overflow: ellipsis;
```

多行溢出

```css
/*1. 超出的部分隐藏 */
overflow: hidden;

/*2. 文字用省略号替代超出的部分 */
text-overflow: ellipsis;

/* 3. 弹性伸缩盒子模型显示 */
display: -webkit-box;

/* 4. 限制在一个块元素显示的文本的行数 */
-webkit-line-clamp: 2;

/* 5. 设置或检索伸缩盒对象的子元素的排列方式 */
-webkit-box-orient: vertical;
```

### 压边框

让每个盒子margin 往左侧移动 -1px 正好压住相邻盒子边框

鼠标经过某个盒子的时候，提高当前盒子的层级即可（如果没有有定位，则加相对定位（保留位置），如果有定位，则加z-index）

### 文字环绕

**巧妙运用浮动元素不会压住文字的特性**

### 页码居中

页码在页面中间显示:

1. 把这些链接盒子转换为行内块， 之后给父级指定  text-align:center;
2. 利用行内块元素中间有缝隙，并且给父级添加 text-align:center; 行内块元素会水平会居中

### CSS初始化

```css
* {
    margin: 0;
    padding: 0
}

em,
i {
    font-style: normal
}

li {
    list-style: none
}

img {
    border: 0;
    vertical-align: middle
}

button {
    cursor: pointer
}

a {
    color: #666;
    text-decoration: none
}

a:hover {
    color: #c81623
}

button,
input {
    font-family: Microsoft YaHei, Heiti SC, tahoma, arial, Hiragino Sans GB, "\5B8B\4F53", sans-serif
}

body {
    -webkit-font-smoothing: antialiased;	/* 抗拒出性 */
    background-color: #fff;
    font: 12px/1.5 Microsoft YaHei, Heiti SC, tahoma, arial, Hiragino Sans GB, "\5B8B\4F53", sans-serif;
    color: #666
}

.hide,
.none {
    display: none
}

.clearfix:after {
    visibility: hidden;
    clear: both;
    display: block;
    content: ".";
    height: 0
}

.clearfix {
    *zoom: 1
}
```

- 字体
  - 黑体 \9ED1\4F53
  - 宋体 \5B8B\4F53
  - 微软雅黑 \5FAE\8F6F\96C5\9ED1

## CSS3新特性

### 属性选择器

```css
 /* 只选择 type =text 文本框的input 选取出来 */
input[type=text] {
    color: pink;
}
/* 选择首先是div 然后 具有class属性 并且属性值 必须是 icon开头的这些元素 */
div[class^=icon] {
    color: red;
}
/* 选择首先是section 然后 具有class属性 并且属性值 必须是 data结尾的这些元素 */
section[class$=data] {
    color: blue;
}
```

- 属性选择器可以根据元素特定属性的来选择元素。 这样就可以不用借助于类或者id选择器
- 属性选择器也可以选择出来自定义的属性
- **注意：**类选择器、属性选择器、伪类选择器，权重为 10
- E[att]
- E[att=val]
- E[att^=val]
- E[att$=val]
- E[att*=val]

### 结构伪类选择器

```css
ul li:first-child{
  background-color: red;
}
```

- E:first-child
- E:last-child
- E:nth-child(n)
  - `ul li:nth-child(2){}`
  - `ul li:nth-child(odd){}`    **odd** 是关键字  奇数的意思（3个字母 ）
  - `ul li:nth-child(even){}`   **even**（4个字母 ）
  - `ul li:nth-child(-n+3){}`    **匹配到父元素的前3个子元素**(n从0开始)
- E:first-of-type、E:last-of-type、E:nth-of-type(n) 使用同上
- E:nth-child(n)与E:nth-of-type(n)区别
  - child 会对所有子标签排序，先找第几个，再看匹不匹配标签
  - type 仅对指定标签排序，先找标签，在找第几个

### 伪元素选择器

可以帮助我们利用CSS创建新标签元素，而不需要HTML标签，从而简化HTML结构

```html
<style>
    div {
        width: 200px;
        height: 200px;
        background-color: pink;
    }
    /* div::before 权重是2 */
    div::before {
        /* 这个content是必须要写的 */
        content: '我';
    }
    div::after {
        content: '小猪佩奇';
    }
</style>
<body>
    <div>
        是
    </div>
</body>
```

- 用 : 或 :: 都可以，推荐双冒号

- before 和 after 创建一个元素，但是属于行内元素

- 新创建的这个元素在文档树中是找不到的，所以我们称为伪元素

- before 和 after 必须有 content 属性 

- before 在父元素内容的前面创建元素，after 在父元素内容的后面插入元素

- 伪元素选择器和标签选择器一样，权重为 1

- 应用

  - [字体图标](字体图标)都是用伪元素实现的，好处在于我们不需要在结构中额外去定义字体图标的标签，通过content属性来设置字体图标的编码
  - 清楚浮动
  - 伪元素实现遮罩

  ```html
  <head>
      ...
      <style>
          .tudou {
              position: relative;
              width: 444px;
              height: 320px;
              background-color: pink;
              margin: 30px auto;
          }
  
          .tudou img {
              width: 100%;
              height: 100%;
          }
  
          .tudou::before {
              content: '';
              /* 隐藏遮罩层 */
              display: none;
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, .4) url(images/arr.png) no-repeat center;
          }
  
          /* 当我们鼠标经过了 土豆这个盒子，就让里面before遮罩层显示出来 */
          .tudou:hover::before {
              /* 而是显示元素 */
              display: block;
          }
      </style>
  </head>
  
  <body>
      <div class="tudou">
          <img src="images/tudou.jpg" alt="">
      </div>
      <div class="tudou">
          <img src="images/tudou.jpg" alt="">
      </div>
      <div class="tudou">
          <img src="images/tudou.jpg" alt="">
      </div>
      <div class="tudou">
          <img src="images/tudou.jpg" alt="">
      </div>
  </body>
  ```

### 新盒子属性

旧盒子属性 ：box-sizing: content-box  盒子大小为 width + padding + border ，边框、外边距会撑大盒子

新盒子属性 ：box-sizing: border-box  盒子大小为 width，不对撑大（前提：padding和border不会超过width宽度）

### 图标模糊

```css
img {
    filter: blur(15px);		/* blur 高斯模糊函数 */
}
```

### 计算盒子宽度

```css
div {
    width: calc(100% - 80px);
}
```

### 过渡

```css
div {
    width: 100px;
    height: 20px;
    transition: width .5s, height .5s;
}

div:hover {
    width: 200px;
    height: 10px;
}
```

- 属性 ： 想要变化的 css 属性， 宽度高度 背景颜色 内外边距都可以 

  - 如果想要所有的属性都变化过渡， 写一个**all** 就可以 或者 **省略**
  - 写多个属性，必须写一行**逗号**隔开

- 花费时间： 单位是 秒（必须写单位） 比如 0.5s 

- 运动曲线： 默认是 ease （可以省略）

- 何时开始：单位是 秒（必须写单位）可以设置延迟触发时间  默认是 0s  （可以省略）

- **后面两个属性可以省略**

- **记住过渡的使用口诀： 谁做过渡给谁加**

- 进度条

  ```html
  <head>
      ...
      <style>
          .bar {
              width: 150px;
              height: 15px;
              border: 1px solid red;
              border-radius: 7px;
              padding: 1px;
          }
          .bar_in {
              width: 50%;
              height: 100%;
              background-color: red;
              /* 谁做过渡给谁加 */
              transition: all .7s;
          }
          .bar:hover .bar_in {
              width: 100%;
          }
      </style>
  </head>
  <body>
      <div class="bar">
          <div class="bar_in"></div>
      </div>
  </body>
  ```

### 2D转换

```css
div {
    /* 移动 */
    transform: translate(20px,20px); /*或者分开写*/
	transform: translateX(20px);
	transform: translateY(20px);
    
    /* 旋转 */
    transform:rotate(45deg);
    transform-origin: 0 0;
    
    /* 缩放 */
    transform:scale(1,.5);	/* 宽扩大一倍，高缩小一倍 */
}
```

- :black_medium_small_square: transform： translate(x,y) --- 移动
  - :black_medium_small_square: ​不会影响到其他元素的位置
  - :black_medium_small_square: 百分比单位是相对于自身元素的 translate:(50%,50%)
  - :black_medium_small_square:  对行内标签没有效果
- transform-origin: 定义中心点，可以%，可以px，可以方位词（top bottom left right center）
- transform:scale --- 缩放 --- 可以设置转换中心点缩放，默认以中心点缩放的，而且不影响其他盒子

**复合属性**

```css
div {
    transform: translate() rotate() scale();
}
```

其顺序会影转换的效果。（先旋转会改变坐标轴方向）

当我们同时有位移和其他属性的时候，记得要将**位移放到最前**

### 3D转换

```css
div {
    /* 移动 */
    transform: translate3d(20px,20px,20px); /*或者分开写*/
	transform: translateX(20px);
	transform: translateY(20px);
    transform: translateZ(20px);	/* 多了z轴 */
    
    /* 旋转 */
    transform:rotateX(45deg);		/* 沿着x轴正方向旋转 45度 */
    transform:rotateY(45deg);		/* 沿着y轴正方向旋转 45度 */
    transform:rotateZ(45deg);		/* 沿着z轴正方向旋转 45度 */
    transform:rotate3d(1,0,0,45deg)： 	/*沿着x(自定义)轴旋转 deg为角度（了解即可）*/
    
    /* 呈现 */
    transform-style: preserve-3d;	/* 子元素子元素开启立体空间 默认flat不开启 */
    
    /* 缩放 */
    translateZ: 200px;				/* 必须和透视搭配使用 */
}
```

- 旋转 --- 左手准则 --- 大拇指指向轴正方向，其他手指就是旋转的正方向
- 透视（缩放） --- `perspective:800px ` ---- **只能设置在元素的父级中**
  - 800px，视距，人眼到浏览器的距离
  - `translateZ:200px`  --- **设置在子元素中**，div真实的地方，加上透视就是投影到浏览器
    - 200px，div到浏览器的距离
    - translateZ：近大远小，往外是正值，往里是负值

### 浏览器私有前缀

```css
-moz-：代表 firefox 浏览器私有属性
-ms-：代表 ie 浏览器私有属性
-webkit-：代表 safari、chrome 私有属性
-o-：代表 Opera 私有属性

/* 提倡写法 */
div {
    -moz-border-radius: 10px;
	-webkit-border-radius: 10px;
	-o-border-radius: 10px;
	border-radius: 10px;
}
```

### 动画

- 定义动画 --- 用 keyframes 定义动画（类似定义类选择器）
  - **动画序列**：0% 是动画的开始，100% 是动画的完成，或用关键词 "from" 和 "to"，等同于 0% 和 100%
  - 在 @keyframes 中规定某项 CSS 样式，就能创建由当前样式逐渐改为新样式的动画效果

```css
@keyframes 动画名称 {
    0%{
    	width:100px;
    }
    100%{
    	width:200px;
    }
}
```

- 使用动画

```css
div {
    width: 200px;
    height: 200px;
    background-color: aqua;
    margin: 100px auto;
    /* 调用动画 */
    animation-name: 动画名称;
    /* 持续时间 */
    animation-duration: 持续时间;
}
```

- `@keyframes` 规定动画
- `animation` 所有动画属性的复合属性，除了`animation-play-state`属性
  - **复合属性** --- `animation: myfirst 5s linear 2s infinite alternate;`
- `animation-name` 规定`@keyframes`动画的名称。（必须的）
- `animation-duration` 规定动画完成一个周期所花费的秒或毫秒，默认是0。（必须的）
- `animation-timing-function` 规定动画的速度曲线，默认是“ease”
  - linear 动画从头到尾的速度是相同的。匀速
  - ease 默认。动画以低速开始，然后加快，在结束前变慢
  - ease-in 动画以低速开始
  - ease-out 动画以低速结束
  - ease-in-out 动画以低速开始和结束
  - steps() 指定了时间函数中的间隔数量（步长）
- `animation-delay` 规定动画何时开始，默认是0
- `animation-iteration-count` 规定动画被播放的次数，默认是1，还有infinite
- `animation-direction` 规定动画是否在下一周期逆向播放，默认是“normal“,alternate逆播放
  - 想要动画走回来 ，而不是直接跳回来：animation-direction ： alternate
- `animation-play-state` 规定动画是否正在运行或暂停。默认是"running",还有"paused"
  - 暂停动画：animation-play-state: puased; 经常和鼠标经过等其他配合使用
- `animation-fill-mode` 规定动画结束后状态，保持forwards回到起始backwards
  - 盒子动画结束后，停在结束位置： animation-fill-mode ： forwards

### 媒体查询

```css
@media mediatype and|not|only (media feature) {
	CSS-Code;
}
```

- @media 
- mediatype :媒体类型
  - all 用于所有设备
  - print 用于打印机和打印预览
  - scree 用于电脑屏幕，平板电脑，智能手机等
- and|not|only 
  - and：可以将多个媒体特性连接到一起，相当于“且”的意思
  - not：排除某个媒体类型，相当于“非”的意思，可以省略
  - only：指定某个特定的媒体类型，可以省略
- (media feature):媒体特性 必须有小括号包含
  - width 定义输出设备中页面可见区域的宽度
  - min-width 定义输出设备中页面最小可见区域宽度
  - max-width 定义输出设备中页面最大可见区域宽度

**案例：根据页面宽度改变背景变色**

- 按照从大到小的或者从小到大的思路 --- **从小到大来写，代码更简洁**
- 注意我们有最大值 max-width 和最小值 min-width都是**包含等于**
- 当屏幕小于540像素， 背景颜色变为蓝色 （x `<= 539）
- 当屏幕大于等于540像素 并且小于等于 969像素的时候 背景颜色为 绿色 ( 540=<x <= 969）
- 当屏幕大于等于 970像素的时候，背景颜色为红色 （ x >`= 970）

- - 

```css
/* 这句话的意思就是： 在我们屏幕上 并且 最大的宽度是 800像素 设置我们想要的样式 */
/* max-width 小于等于800 */
/* 媒体查询可以根据不同的屏幕尺寸在改变不同的样式 */

@media screen and (max-width: 800px) {
    body {
        background-color: pink;
    }
}

@media screen and (max-width: 500px) {
    body {
        background-color: purple;
    }
}
```

**案例：根据页面宽度改变背景变色**

- 按照从大到小的或者从小到大的思路 --- **从小到大来写，代码更简洁**
- 注意我们有最大值 max-width 和最小值 min-width都是**包含等于**
- 当屏幕小于540像素， 背景颜色变为蓝色 （x `<= 539）
- 当屏幕大于等于540像素 并且小于等于 969像素的时候 背景颜色为 绿色 ( 540=<x <= 969）
- 当屏幕大于等于 970像素的时候，背景颜色为红色 （ x >`= 970）

**媒体查询 + rem**

```css
@media screen and (max-width: 500px) {
    html {
        font-size: 50px;
    }
}

div {
    width: 1rem
}
```

不同设备样式很多时，引入不同资源

```html
<link rel="stylesheet" href="styleA.css" media="screen and (min-width: 400px)">
```

