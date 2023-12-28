# HTML

## `<img>`

- src：url路径
- alt：不能正常显示时的地址
- title：鼠标放上去的提示文本
- width，height：宽高，单位不用填（px），一般防止变形，二选一
- border：边框粗细，一般用css设置

## `<a>`

- href：跳转url
- target：在哪打开，默认`_self`，本窗口打开，可选`_blank`，新窗口打开
- 链接的分类
  - 外部链接：` < a href="http:// www.baidu.com "> 百度</a >`
  - 内部页面：`< a href="index.html"> 首页 </a >`
  - 空连接：`< a href="#"> 首页 </a >`
  - 下载链接：文件会直接下载
  - 元素链接：css，js，img等文件的路径或链接
  - 锚点链接：`<a href="#two"> 第2集 </a>`
    - 被跳转的地方`<h3 id="two">第2集介绍</h3>`

## `<table>`

> 属性一般都通过css设置

- `<thead>`、`<tbody>`：结构标签，指明表头，表体，建议不要省略

- `<tr>`：一行
- `<td>`：单元格，必须在`<tr>`中
- `<th>`：表头单元格，必须在`<tr>`中
- align：表格对齐方式，可选left、center、right
- border：边框，可选“”、1
- cellpadding：单元格内容内边距，默认1（px）
- cellspacing：单元格之间空隙，默认2（px）
- width：表格宽度，像素 或 百分比

> **合并单元格**
>
> - 分析是跨行合并还是跨列合并，是`<th>、<td>`标签的属性
>   - rowspan="合并单元格的个数"：跨行合并
>   - colspan="合并单元格的个数"：跨列合并
> - 找到目标单元格
>   - 跨行合并时，上单元格为目标单元格，需要加rowspan属性
>   - 跨列合并时，左单元格为目标单元格，需要加colspan属性
> - 删除多余的单元格

## `<ul>、<ol>、<dl>`

> 无须列表、有序列表、自定义列表

- `<li>`：列表项，`<li> `与 `</li> `之间相当于一个容器，可以容纳所有元素

- 无序列表的各个列表项之间没有顺序级别之分，是并列的

- `<ul>、<ol>` 中只能嵌套 `<li>`，直接在`<ul>、<ol>` 标签中输入其他标签或者文字的做法是不被允许的

- 样式属性使用 CSS 来设置

- 自定义列表`<dl>`中只能嵌套`<dt>、<dd>`

  - `<dt>`：定义父项目

  - `<dd>`：定义子项目

    > **示例：**
    >
    > `<dl>`
    >     `<dt>`父项目`</dt>`
    >     `<dd>`子项目1`</dd>`
    >     `<dd>`子项目2`</dd>`
    >     `<dd>`子项目3`</dd>`
    > `</dl>`

## `<form>`

- 表单由 **表单域**、**表单控件**、**提示信息** 组成，`<form>`：定义表单域

- action：url地址，指定接收并处理表单数据的服务器程序的url

- method：请求方式，可选get、post

- name：表单名称，用来区分多个表单域

- `<input>`：定义表单控件

  - type：控件类型
    - text：单行输入
    - password：密码
    - radio：单选按钮
    - checkbox：复选框
    - reset：重置按钮
    - submit：提交按钮
    - button：普通的点击按钮，和js搭配使用
    - flie：输入字段和“浏览”按钮，供文件上传
    - hidden：隐藏的输入字段
    - image：图像提交按钮
  - name：控件名称，单选或复选时name必须相同
  - value：控件的值，用于提交数据 或 显示在按钮上
  - checked：默认选中
  - maxlength：规定输入字段的最大长度

- `<label>`：标注，聚焦，本不属于表单标签，但常常和表单搭配使用，，当点击标注标签中的内容时，相当于点击了for指定的控件

  - for：当点击的时候去哪，对应`<input>`的id属性

    > **示例：**
    >
    >  `<label for="sex">`男`</label>`
`<input type="radio" name="sex"  id="sex" />`

- `<select>`：定义下拉列表

  - `<option>`：列表元素，至少有一个

    - selected：默认选中

    > **示例：**
    >
    > `<select>`
    >    `<option>`选项1`</option>`
    >    `<option>`选项2`</option>`
    >    `<option>`选项3`</option>`
    >    ...
    >  `</select>`

- `<textarea>`：定义文本域，下列属性用css设置

  - rows：默认行数
  - cols：默认每行字符数

## [特殊字符：参考W3C](https://www.w3school.com.cn/charsets/ref_html_entities_4.asp)

## 练习代码

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <title>Document</title>
</head>

<body>
    <div>
        <h5>青春不常在，抓紧谈恋爱</h5>
    </div>
    <div></div>
    <form>
        <table cellspacing="10" width="500" border="1">
            <tbody>
                <!-- 第1行 -->
                <tr>
                    <td>性别</td>
                    <td>
                        <input type="radio" name="sex" value="man" id="man" />
                        <img src="#" alt="" width="" />
                        <label for="man">男</label>
                        <input type="radio" name="sex" value="woman" id="woman" checked />
                        <img src="#" alt="" width="" />
                        <label for="woman">女</label>
                    </td>
                </tr>
                <!-- 第2行 -->
                <tr>
                    <td>生日</td>
                    <td>
                        <select>
                            <option selected>--请选择年--</option>
                            <option>2022</option>
                            <option>2023</option>
                        </select>
                        <select>
                            <option selected>--请选择月--</option>
                            <option>1</option>
                            <option>2</option>
                        </select>
                        <select>
                            <option selected>--请选择日--</option>
                            <option>20</option>
                            <option>10</option>
                        </select>
                    </td>
                </tr>
                <!-- 第3行 -->
                <tr>
                    <td>婚姻状况</td>
                    <td>
                        <input type="radio" name="hunyin" id="n" value="no" checked />
                        <label for="n">未婚</label>
                        <input type="radio" name="hunyin" id="y" value="no" />
                        <label for="y">已婚</label>
                        <input type="radio" name="hunyin" id="dotknow" value="no" />
                        <label for="dotknow">不知道</label>
                    </td>
                </tr>
                <!-- 第4行 -->
                <tr>
                    <td>学历</td>
                    <td>
                        <input type="text" name="xueli" value="幼儿园" /><br />
                    </td>
                </tr>
                <!-- 第5行 -->
                <tr>
                    <td>喜欢类型</td>
                    <td>
                        <input type="checkbox" name="like" value="wumei" id="w" />
                        <label for="w">妩媚的</label>
                        <input type="checkbox" name="like" value="keai" id="k" />
                        <label for="k">可爱的</label>
                        <input type="checkbox" name="like" value="all" id="a" checked />
                        <label for="a">都喜欢</label>
                    </td>
                </tr>
                <!-- 第6行 -->
                <tr>
                    <td>自我介绍</td>
                    <td>
                        <textarea>请填写自我介绍</textarea><br />
                    </td>
                </tr>
                <!-- 第7行 -->
                <tr>
                    <td rowspan="4"></td>
                    <td>
                        <input type="submit" name="zhuce" value="免费注册" /><br />
                    </td>
                </tr>
                <!-- 第8行 -->
                <tr>
                    <td>
                        <input type="checkbox" name="tiaokuan" value="tiaokuan1" id="tiaokuan1" checked />
                        <label for="tiaokuan1">我同意xxxxxxxxxx</label><br>
                    </td>
                </tr>
                <!-- 第9行 -->
                <tr>
                    <td>
                        <a href="#">立即登录</a><br>
                    </td>
                </tr>
                <!-- 第10行 -->
                <tr>
                    <td>
                        <h4>我承诺</h4>
                        <ul>
                            <li>18了</li>
                            <li>认真的</li>
                            <li>严肃的</li>
                            <li>真诚的</li>
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>
    </form>
    </div>

</body>

</html>
```

### HTML5新特性

## 语义化标签

- `<header>` 头部标签
- `<nav>` 导航标签
- `<article>` 内容标签
- `<section>` 定义文档某个区域，语义上比`<div>`大些
- `<aside>` 侧边栏标签
- `<footer>` 尾部标签

## 多媒体标签

 **`<video>`**

```html
<video src="media/mi.mp4"></video>
```
- 支持三种视频格式：mp4、ogg、webM ，尽量使用 **mp4格式**

- 兼容写法 --- 浏览器会匹配video标签中的source，如果支持就播放，如果不支持往下匹配，直到没有匹配的格式，就提示文

  ```html
  <video  controls="controls"  width="300">
      <source src="move.ogg" type="video/ogg" >
      <source src="move.mp4" type="video/mp4" >
      您的浏览器暂不支持 <video> 标签播放视频
  </ video >
  ```

- `src`  播放源

- `autoplay`  自动播放 --- 谷歌浏览器不能自动播放，加上静音会自动播放

- `width`  宽度

- `height`  高度

- `loop`  循环播放

- `muted` 静音播放

- `controls` 向用户显示播放插件 --- **一般用js实现**

- `preload` 允许预加载，与`autoplay`互斥

- `poster` 预先加载的图片 --- 没网时先加载这个友好的图片

**`<audio>`** 

```html
<audio src="media/music.mp3" autoplay="autoplay" controls="controls"></audio>
```

- 支持三种视频格式：mp3、Ogg、Wav， 尽量使用 **mp3格式**

- 兼容写法 --- 浏览器会匹配video标签中的source，如果支持就播放，如果不支持往下匹配，直到没有匹配的格式，就提示文

  ```html
  < audio controls="controls"  >
      <source src="happy.mp3" type="audio/mpeg" >
      <source src="happy.ogg" type="audio/ogg" >
      您的浏览器暂不支持 <audio> 标签。
  </ audio>
  ```

- `src`  播放源

- 音频静音需要js解决

## 新表单标签

```html
<!-- 我们验证的时候必须添加form表单域 -->
<form action="">
    <ul>
        <li>邮箱: <input type="email" /></li>
        <li>网址: <input type="url" /></li>
        <li>日期: <input type="date" /></li>
        <li>时间: <input type="time" /></li>
        <li>数量: <input type="number" /></li>
        <li>手机号码: <input type="tel" /></li>
        <li>搜索: <input type="search" /></li>
        <li>颜色: <input type="color" /></li>
        <!-- 当我们点击提交按钮就可以验证表单了 -->
        <li> <input type="submit" value="提交"></li>
    </ul>
</form>
```

- required：内容必须填写
- placeholder：提示信息
- autofocus：自动聚焦
- multiple：可多选文件提交，用于 file 类型的表单
- autocomplete：下拉框显示出填写过的值。默认为on，关闭为off