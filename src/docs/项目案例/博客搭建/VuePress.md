---
isOriginal: true
category: 
    - 经验
    - Linux
    - 玩机
    - 博客
tag: 
  - VuePress
---

# VuePress

## 介绍

[官网](https://vuepress.vuejs.org/zh/)

VuePress 由两部分组成：第一部分是一个[极简静态网站生成器 (opens new window)](https://github.com/vuejs/vuepress/tree/master/packages/@vuepress/core)，它包含由 Vue 驱动的[主题系统](https://vuepress.vuejs.org/zh/theme/)和[插件 API](https://vuepress.vuejs.org/zh/plugin/)，另一个部分是为书写技术文档而优化的[默认主题](https://vuepress.vuejs.org/zh/theme/default-theme-config.html)，它的诞生初衷是为了支持 Vue 及其子项目的文档需求。

每一个由 VuePress 生成的页面都带有预渲染好的 HTML，也因此具有非常好的加载性能和搜索引擎优化（SEO）。同时，一旦页面被加载，Vue 将接管这些静态内容，并将其转换成一个完整的单页应用（SPA），其他的页面则会只在用户浏览到的时候才按需加载。

## Hello World

```sh
## 创建并进入目录
mkdir vuepress-starter
cd vuepress-starter
## 初始化
yarn init 				# npm init
## 安装依赖
yarn add -D vuepress 	# npm install -D vuepress
## 创建第一篇文章
mkdir docs
echo '# Hello VuePress' > docs/README.md	## 这样创建会乱码，删了新建就行
```

在 package.json 中添加启动的scripts代码

```json
{
...,
    "scripts": {
        "docs:dev": "vuepress dev docs",
        "docs:build": "vuepress build docs"
      }
}
```

运行

```sh
yarn docs:dev 		# npm run docs:dev
```

## 目录结构

VuePress 遵循 **“约定优于配置”** 的原则，推荐的目录结构如下：

```
.
├── docs
│   ├── .vuepress (可选的)					用于存放全局的配置、组件、静态资源等。
│   │   ├── components (可选的)			该目录中的 Vue 组件将会被自动注册为全局组件。
│   │   ├── theme (可选的)					用于存放本地主题。
│   │   │   └── Layout.vue
│   │   ├── public (可选的)				静态资源目录。
│   │   ├── styles (可选的)				用于存放样式相关的文件。
│   │   │   ├── index.styl				
│   │   │   └── palette.styl			用于重写默认颜色常量，或者设置新的 stylus 颜色常量
│   │   ├── templates (可选的, 谨慎配置)	存储 HTML 模板文件。
│   │   │   ├── dev.html				用于开发环境的 HTML 模板文件。
│   │   │   └── ssr.html				构建时基于 Vue SSR 的 HTML 模板文件。
│   │   ├── config.js (可选的)				配置文件的入口文件，也可以是 YML 或 toml
│   │   └── enhanceApp.js (可选的)			客户端应用的增强。
│   │ 
│   ├── README.md
│   ├── guide
│   │   └── README.md
│   └── config.md
│ 
└── package.json
```

> - `docs/.vuepress/styles/index.styl`: 将会被自动应用的全局样式文件，会生成在最终的 CSS 文件结尾，具有比默认样式更高的优先级。
> - 当你想要去自定义 `templates/ssr.html` 或 `templates/dev.html` 时，最好基于 [默认的模板文件 ](https://github.com/vuejs/vuepress/blob/master/packages/@vuepress/core/lib/client/index.dev.html)来修改，否则可能会导致构建出错。

默认页面路由如下：

| 文件的相对路径     | 页面路由地址   |
| ------------------ | -------------- |
| `/README.md`       | `/`            |
| `/guide/README.md` | `/guide/`      |
| `/config.md`       | `/config.html` |

## 基本配置

[官网](https://vuepress.vuejs.org/zh/config)

**创建一个配置文件**

```
.
├─ docs
│  └─ .vuepress
│     └─ config.js
```

```js
module.exports = {
  title: '茜茜知道',
  description: 'Just playing around'
}
```

运行就会发现多了标题

可配置项

- title：网站的标题，它将会被用作所有页面标题的前缀

- description：网站的描述，它将会以 `<meta>` 标签渲染到当前页面的 HTML 中

- base：根路径。若是docs这层目录（docs按实际目录名为准）就设置为`/`

- head：额外的需要被注入到当前页面的 HTML `<head>` 中的标签，每个标签都可以以 `[tagName, { attrName: attrValue }, innerHTML?]` 的格式指定

  ```js
  module.exports = {
      // 增加一个自定义的 favicon
    head: [
      ['link', { rel: 'icon', href: '/logo.png' }]
    ]
  }
  ```

- host：用于指定 dev server的主机名，默认0.0.0.0

- port：用于指定dev server的端口，默认8080

- temp：指定客户端文件的临时目录，默认/path/to/@vuepress/core/.temp

- dest：指定 `vuepress build` 的输出目录，默认.vuepress/dist

- locales：提供多语言支持，具体细节请查看 [多语言支持](https://vuepress.vuejs.org/zh/guide/i18n.html)

- shouldPrefetch：参考 [shouldPrefetch](https://ssr.vuejs.org/zh/api/#shouldprefetch)



## Markdown

### anchor （# 锚）

所有的标题将会自动地应用 anchor 链接，anchor 的渲染可以通过 [`markdown.anchor`](https://vuepress.vuejs.org/zh/config/#markdown-anchor) 来配置

### 内部链接

如下层级的目录结构

```
.
├─ README.md
├─ foo
│  ├─ README.md
│  ├─ one.md
│  └─ two.md
└─ bar
   ├─ README.md
   ├─ three.md
   └─ four.md
```

内部跳转

```
[Home](/) <!-- 跳转到根部的 README.md -->
[foo](/foo/) <!-- 跳转到 foo 文件夹的 index.html -->
[foo heading](./#heading) <!-- 跳转到 foo/index.html 的特定标题位置 -->
[bar - three](../bar/three.md) <!-- 具体文件可以使用 .md 结尾（推荐） -->
[bar - four](../bar/four.html) <!-- 也可以用 .html -->
```

### 外部链接

外部的链接将会被自动地设置为 `target="_blank" rel="noopener noreferrer"`

### 支持语法

#### 表格

```text
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
```

| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |

#### Emoji

```text
:tada: :100:
```

:tada: :100:

#### 目录

```
[toc]
```

#### 自定义容器

```
::: tip [自定义标题]
这是一个提示
:::

::: warning [自定义标题]
这是一个警告
:::

::: danger [自定义标题]
这是一个危险警告
:::

::: details [自定义标题]
这是一个详情块，在 IE / Edge 中不生效
:::
```

#### 代码块

VuePress 使用了 [Prism (opens new window)](https://prismjs.com/)来为 markdown 中的代码块实现语法高亮。

支持行高亮，在语言名后指定

~~~markdown
``` js {4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
~~~

除了单行以外，你也可指定多行，行数区间，或是两者都指定。

- 行数区间: 例如 `{5-8}`, `{3-10}`, `{10-17}`
- 多个单行: 例如 `{4,7,9}`
- 行数区间与多个单行: 例如 `{4,7-13,16,23-27,40}`

显示行号，需要配置

- lineNumbers: true

#### 导入代码段

你可以通过下述的语法导入已经存在的文件中的代码段：

```md
<<< @/filepath
```

它也支持 行高亮：

```md
<<< @/filepath{highlightLines}
```

**输入**

```text
<<< @/../@vuepress/markdown/__tests__/fragments/snippet.js{2}
```

**输出**

```js
export default function () {
  // ..
}
```

> 注意
>
> 由于代码段的导入将在 webpack 编译之前执行，因此你无法使用 webpack 中的路径别名，此处的 `@` 默认值是 `process.cwd()`。

为了只导入对应部分的代码，你也可运用 VS Code region的标记区域语法。

- 你可以在文件路径后方的 `#` 紧接着提供一个自定义的区域名称（预设为 `snippet` ）

**输入**

```md
<<< @/../@vuepress/markdown/__tests__/fragments/snippet-with-region.js#snippet{1}
```

**代码文件**

```js
// #region snippet
function foo () {
  return ({
    dest: '../../vuepress',
    locales: {
      '/': {
        lang: 'en-US',
        title: 'VuePress',
        description: 'Vue-powered Static Site Generator'
      },
      '/zh/': {
        lang: 'zh-CN',
        title: 'VuePress',
        description: 'Vue 驱动的静态网站生成器'
      }
    },
    head: [
      ['link', { rel: 'icon', href: `/logo.png` }],
      ['link', { rel: 'manifest', href: '/manifest.json' }],
      ['meta', { name: 'theme-color', content: '#3eaf7c' }],
      ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
      ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
      ['link', { rel: 'apple-touch-icon', href: `/icons/apple-touch-icon-152x152.png` }],
      ['link', { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#3eaf7c' }],
      ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
      ['meta', { name: 'msapplication-TileColor', content: '#000000' }]
    ]
  })
}
// #endregion snippet

export default foo
```

**输出**

```js
function foo () {
  return ({
    dest: '../../vuepress',
    locales: {
      '/': {
        lang: 'en-US',
        title: 'VuePress',
        description: 'Vue-powered Static Site Generator'
      },
      '/zh/': {
        lang: 'zh-CN',
        title: 'VuePress',
        description: 'Vue 驱动的静态网站生成器'
      }
    },
    head: [
      ['link', { rel: 'icon', href: `/logo.png` }],
      ['link', { rel: 'manifest', href: '/manifest.json' }],
      ['meta', { name: 'theme-color', content: '#3eaf7c' }],
      ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
      ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
      ['link', { rel: 'apple-touch-icon', href: `/icons/apple-touch-icon-152x152.png` }],
      ['link', { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#3eaf7c' }],
      ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
      ['meta', { name: 'msapplication-TileColor', content: '#000000' }]
    ]
  })
}
```



## 主题

### 首页配置

根级目录中人readme.md 中

```yaml
home: true
heroImage: /hero.png
heroText:  标题
tagline:  副标题
actionText: 快速上手 →
actionLink: /zh/guide/
features:
- title: 简洁至上
  details: 以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作。
- title: Vue驱动
  details: 享受 Vue + webpack 的开发体验，在 Markdown 中使用 Vue 组件，同时可以使用 Vue 来开发自定义主题。
- title: 高性能
  details: VuePress 为每个页面预渲染生成静态的 HTML，同时在页面被加载的时候，将作为 SPA 运行。
footer: MIT Licensed | Copyright © 2018-present Evan You
```

页脚的富文本

```
::: slot footer
MIT Licensed | Copyright © 2018-present [Evan You](https://github.com/yyx990803)
:::
```

### 导航栏

在config.js中配置

禁用 navbar: false

- 单页面禁用

  ```yaml
  ---
  navbar: false
  ---
  ```

使用 nav 配置如下

```js
themeConfig: {
    logo: '/assets/img/logo.png',
    nav: [
        { text: 'Home', link: '/' },			// 内部链接
        { text: 'Guide', link: '/guide/' },
        // 外部链接, 可以配置 target、rel
        { text: 'External', link: 'https://google.com' },
        { text: 'External', link: 'https://google.com', target: '_self', rel: '' },
        { text: 'Guide', link: '/guide/', target: '_blank' },
        // 下拉菜单，三次嵌套相当于分组的下拉菜单
        {
            text: 'Languages1',
            ariaLabel: 'Language Menu',
            items: [
                { text: 'Chinese', link: '/language/chinese/' },
                { text: 'Japanese', link: '/language/japanese/' }
            ]
        },
        // 分组的下拉菜单
        {
            text: 'Languages2',
            items: [
                {
                    text: 'Group1', items: [
                        { text: 'Chinese', link: '/language/chinese/' },
                        { text: 'Japanese', link: '/language/japanese/' }]
                },
                {
                    text: 'Group2', items: [
                        { text: 'Chinese', link: '/language/chinese/' },
                        { text: 'Japanese', link: '/language/japanese/' }]
                }
            ]
        }

    ]
}
```

### 侧边栏

需要配置 `themeConfig.sidebar`，基本的配置，需要一个包含了多个链接的数组：

```js
// .vuepress/config.js
module.exports = {
  themeConfig: {
    sidebar: [
      '/',
      '/page-a',
      ['/page-b', 'Explicit link text']		// 显示地指定链接的文字
    ]
  }
}
```

你可以省略 `.md` 拓展名，同时以 `/` 结尾的路径将会被视为 `*/README.md`，这个链接的文字将会被自动获取到（无论你是声明为页面的第一个 header，还是明确地在 `YAML front matter` 中指定页面的标题）。如果你想要显示地指定链接的文字，使用一个格式为 `[link, text]` 的数组	



## 快速搭建

李某某的 [codefather](https://github.com/liyupi/codefather) 做的很不错，直接fork（感谢李某某的开源分享！！！）

### 结构

```sh
tree . /F | Out-File -Encoding UTF8 结果.txt
```



```
.
├── .vuepress
│   ├── public				静态资源目录。
│   ├── theme 				用于存放本地主题。
│   ├── config.ts			配置文件的入口文件，插件、域名、介绍等
│   ├── footer.ts				底部版权信息配置
│   ├── navbar.ts			    导航栏配置
│   ├── sidebar.ts				左侧边栏配置
│   └── extraSideBar.ts			右侧边栏配置
│ 
├─Java
│   ├── README.md
│   │  
│   ├─JavaSE
│   │   ├── 1Java.md
│   │   ├── 2 JVM.md
│   │   ├── 线程补充.md
│   │   ├── 高并发.md
│   │   └── README.md
│   │          
│   └─网络
│       ├── NIO.md
│       └── README.md        
│      
└─计算机基础
│   ├── C.md
│   ├── README.md
│   └── 操作系统.md
└── README.md					首页
```



#### navbar

**链接到文件**

```ts
{
    text: "计算机基础",
    link: "/计算机基础/",
    items: [
        {
            text: "C语言", link: "/计算机基础/C.md",    // 单层目录定位到文件名，后缀名可省略
        },
        {
            text: "操作系统", link: "/计算机基础/操作系统.md",
        },
    ]
},
```

**链接到目录**

```ts
{
    text: "Java",
    link: "/Java/",
    items: [
        {
            text: "JavaSE", link: "/Java/#JavaSE",
        },
        {
            text: "JavaWeb", link: "/Java/#JavaWeb",
        },
    ]
},
```

**分组**

```ts
 {
        text: "Java",
        link: "/Java/",
        items: [
            {
                text: "JavaSE", link: "/Java/#JavaSE",
            },
            {
                text: "JavaWeb", link: "/Java/#JavaWeb",
            },
            {
                // 分组
                text: "其他", items: [
                    {
                        text: "MQ", link: "/Java/#MQ",
                    },
                    {
                        text: "定时任务", link: "/java/其他/定时任务",
                    },
                    {
                        text: "工具类", link: "/Java/#工具类",
                    },
                ]
            },
        ]
    },
```

#### sideBar

```ts
import {SidebarConfig4Multiple} from "vuepress/config";
import computerBasicsSideBar from "./sidebars/computerBasicsSideBar";
import javaSideBar from "./sidebars/javaSideBar";
// @ts-ignore
export default {
    "/计算机基础/": computerBasicsSideBar,      // 目录名: 对应的子目录 或 文件
    "/Java/": javaSideBar,            
    // 降级，默认根据文章标题渲染侧边栏
    "/": "auto",
} as SidebarConfig4Multiple;
```

对应的是文件列表的，如 computerBasicsSideBar

```ts
export default [
  "",
  {
    title: "计算机基础知识 考研408",
    collapsable: false,
    children: [
      "操作系统.md",          // 文件名，可省略后缀名
      "数据结构",
    ],
  },
];
```

对应是目录的，如 javaSideBar

```ts
export default [
    "",

    {
        title: "JavaSE",
        collapsable: false,
        children: [
            "JavaSE/1Java.md",
            "JavaSE/2 JVM.md",
            "JavaSE/3 线程补充.md",
            "JavaSE/3 高并发.md",
        ],
    },
    {
        title: "JavaWeb",
        collapsable: false,
        children: [
            "JavaWeb/3 XML & Jsoup & Xpath.md",
            "JavaWeb/4 Servlet & Filter & Listener.md",
            "JavaWeb/5 WebSocket.md",
            "JavaWeb/6 jQuery & Ajax & json.md",
            "JavaWeb/jsp & EL表达式 & JSTL.md",
            "JavaWeb/GraphQL.md",
            "JavaWeb/NIO.md",
            "JavaWeb/WebSocket.md",
        ],
    },
  
]
```



### 注意事项

- 不要有**同名**的文件和目录（目录和文件也不要同名）
- 文档中不能包含**裸露的xml标签**，需要用着重号引起来，否则会因转html失败而无法渲染
- 左侧边栏配置中，不能出现错误的或不存在的路径，否则导致整个块的配置失效
- 文章的一级标题，相当于左侧边栏的目录的别名
- 导航栏的link都是项目的绝对路径
- `#`定位资源时，英文字符会自动转全小写，导航栏定位时需要注意

### 脚本

#### README生成器

```js
const fs = require('fs');
const path = require('path');

function deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`已删除文件: ${filePath}`);
    } else {
        console.log(`文件不存在: ${filePath}`);
    }
}

function generateReadme(directory, indent, n) {
    let flag = false;
    let fileList = '';

    const files = fs.readdirSync(directory);
    files.forEach((file, index) => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            fileList += `${indent}` + '#'.repeat(n + 1) + ` ${file}\n\n`
            fileList += generateReadme(filePath, `${indent}  `, n + 1);
        } else if (stats.isFile()) {
            if (index === 0 && n === 1) {
                flag = true;
                fileList += `${indent}# ${path.basename(directory)}\n\n`;
            }
            const fileName = file.replace(/ /g, '%20');
            if (fileName.includes('README') || fileName.charAt(0) === '.') {
                return     // 不需要Readme 和 .开头的文件, 跳过
            }
            if (!flag) {
                fileList += `${indent}[${file}](${path.basename(directory)}/${fileName})\n\n`;
            } else {
                fileList += `${indent}[${file}](${fileName})\n\n`;
            }
        }
    });

    return fileList;
}

function writeToFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
}

function generateReadmeAndWrite(directoryPath) {
    if (fs.existsSync(directoryPath) && fs.lstatSync(directoryPath).isDirectory()) {
        const readmeFilePath = path.join(directoryPath, 'README.md');

        deleteFile(readmeFilePath);
        const result = generateReadme(directoryPath, '', 1);
        writeToFile(readmeFilePath, result);
        console.log(`文件列表已生成并写入到 ${readmeFilePath}`);
    } else {
        console.log('指定的路径不是有效目录！');
    }
}


function generateBatch() {
    if (fs.existsSync('./')) {
        const fileInfo = fs.lstatSync('./')
        const ex = ['.', 'node_modules', '计算', '经验', '前端', '数据', 'Go', 'js', 'Python', '新媒体', '运维']
        if (fileInfo.isDirectory()) {
            const files = fs.readdirSync('./')

            files.forEach(file => {
                let flag = false
                ex.some(e => {

                    if (file.includes(e)) {
                        flag = true
                        return true
                    }
                    flag = false

                })
                if (!flag) {
                    const filePath = path.join('./', file);
                    const stats = fs.statSync(filePath);
                    if (stats.isDirectory()) {
                        generateReadmeAndWrite(filePath);
                    }
                }


            })
        }

    }
}
// 批量，需在项目根目录下执行
generateBatch()
// 单个
// const directoryPath = 'D:\\VSCodeProjects\\codefather\\Java\\JavaSE'; // 替换为你的目录路径
// generateReadmeAndWrite(directoryPath);

```



#### xml标签替换脚本

```js
const fs = require('fs');

function convertNonHtmlTagsToCode(file) {
    // 读取 Markdown 文件内容
    const markdown = fs.readFileSync(file, 'utf8');

    // 正则表达式匹配标签，排除已存在的 HTML 标签
    const regex = /(?<!`)<(?!\/?(?:a|font|img)\b)(?!(?:[^`]*`[^`]*`)*[^`]*`[^`]*$)[^`>]+>(?!`)/g;
    // const regex = /(?<!`)<(?!(?:[^`]*`[^`]*`)*[^`]*`[^`]*$)[^`>]+>(?!`)/g;

    // 替换非 HTML 标签为 `` 标记
    const convertedMarkdown = markdown.replace(regex, '`$&`');

    // 输出转换后的结果
    // console.log(convertedMarkdown);
    fs.writeFileSync(file, convertedMarkdown)
}
const directoryPath = 'D:\\VSCodeProjects\\codefather\\经验之谈\\4 面试.md'; // 替换为你的目录路径
convertNonHtmlTagsToCode(directoryPath);
```

#### 侧边栏生成器

```js
const fs = require('fs')
const path = require('path')

function generateFileList(directory) {
    const result = []

    const files = fs.readdirSync(directory)
    files.forEach((file) => {
        const filePath = path.join(directory, file)
        const stats = fs.statSync(filePath)

        if (stats.isDirectory()) {
            const children = generateFileList(filePath)
            result.push({
                title: file,
                collapsable: false,
                children
            })
        } else if (stats.isFile()) {
            const fileName = path.basename(filePath) // 获取文件名
            if (fileName.includes('README') || fileName.charAt(0) === '.') {
                return     // 不需要Readme 和 .开头的文件, 跳过
            }
            const parentDirName = path.basename(path.dirname(filePath)) // 获取父目录名称
            result.push(parentDirName + '/' + fileName)
        }
    })

    return result
}

function generateSideBar(directoryPath) {
    if (fs.existsSync(directoryPath) && fs.lstatSync(directoryPath).isDirectory()) {
        const fileList = generateFileList(directoryPath)

        let result = `
export default [
    "",
            `
        fileList.forEach((item, index) => {
            if (typeof item === 'string') {
                result += `  "${item}",\n`
            } else {
                result += `  {\n`
                result += `    title: "${item.title}",\n`
                result += `    collapsable: false,\n`
                result += `    children: [\n`
                item.children.forEach((child) => {
                    result += `      "${child}",\n`
                })
                result += `    ],\n`
                result += `  },\n`
            }

            if (index === fileList.length - 1) {
                result += ']'
            }
        })

        return result
    } else {
        console.log('指定的路径不是有效目录！')
    }

}

function writeToFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
}

function generateSideBarAndWrite(directoryPath) {
    if (fs.existsSync(directoryPath) && fs.lstatSync(directoryPath).isDirectory()) {
        const readmeFilePath = path.join('./', 'testSideBar.js');

        const result = generateSideBar(directoryPath, '');
        writeToFile(readmeFilePath, result);
        console.log(`文件列表已生成并写入到 ${readmeFilePath}`);
    } else {
        console.log('指定的路径不是有效目录！');
    }
}

const directoryPath = 'D:\\VSCodeProjects\\codefather\\Java' // 替换为你的目录路径
generateSideBarAndWrite(directoryPath)
```

## 插件

置顶

["@vuepress/back-to-top"],

  ['go-top'],



['@vuepress/nprogress'],//进度条

### 网页计数器

[不蒜子 - 极简网页计数器](https://busuanzi.ibruce.info/)

安装

```sh
yarn add busuanzi.pure.js
```

修改meta

```ts
['meta', {name: 'referrer', content: 'no-referrer-when-downgrade'}],
```

修改.vuepress\theme\components\Footer.vue  添加

```html
<span class="post-meta-divider">&nbsp; |  &nbsp;</span>
  	<span id="busuanzi_container_site_pv" style="display: none">
		总访问量
	<span id="busuanzi_value_site_pv"></span>次
</span>
```

```js
 mounted() {
    script = require("busuanzi.pure.js");
  },
  // 监听,当路由发生变化的时候执行
  watch: {
    $route(to, from) {
      if (to.path != from.path) {
        script.fetch();
      }
    },
  },
```

### 鼠标点击特效

#### 爱心

.vuepress\public\js添加heart.js或words.js

```js
// heart.js
!function (e, t, a) {
    function r() {
        for (var e = 0; e < s.length; e++) s[e].alpha <= 0 ? (t.body.removeChild(s[e].el), s.splice(e, 1)) : (s[e].y--, s[e].scale += .004, s[e].alpha -= .013, s[e].el.style.cssText = "left:" + s[e].x + "px;top:" + s[e].y + "px;opacity:" + s[e].alpha + ";transform:scale(" + s[e].scale + "," + s[e].scale + ") rotate(45deg);background:" + s[e].color + ";z-index:99999");
        requestAnimationFrame(r)
    }
    function n() {
        var t = "function" == typeof e.onclick && e.onclick;
        e.onclick = function (e) {
            t && t(),
                o(e)
        }
    }
    function o(e) {
        var a = t.createElement("div");
        a.className = "heart",
            s.push({
                el: a,
                x: e.clientX - 5,
                y: e.clientY - 5,
                scale: 1,
                alpha: 1,
                color: c()
            }),
            t.body.appendChild(a)
    }
    function i(e) {
        var a = t.createElement("style");
        a.type = "text/css";
        try {
            a.appendChild(t.createTextNode(e))
        } catch (t) {
            a.styleSheet.cssText = e
        }
        t.getElementsByTagName("head")[0].appendChild(a)
    }
    function c() {
        return "rgb(" + ~~(255 * Math.random()) + "," + ~~(255 * Math.random()) + "," + ~~(255 * Math.random()) + ")"
    }
    var s = [];
    e.requestAnimationFrame = e.requestAnimationFrame || e.webkitRequestAnimationFrame || e.mozRequestAnimationFrame || e.oRequestAnimationFrame || e.msRequestAnimationFrame ||
        function (e) {
            setTimeout(e, 1e3 / 60)
        },
        i(".heart{width: 10px;height: 10px;position: fixed;background: #f00;transform: rotate(45deg);-webkit-transform: rotate(45deg);-moz-transform: rotate(45deg);}.heart:after,.heart:before{content: '';width: inherit;height: inherit;background: inherit;border-radius: 50%;-webkit-border-radius: 50%;-moz-border-radius: 50%;position: fixed;}.heart:after{top: -5px;}.heart:before{left: -5px;}"),
        n(),
        r()
}(window, document);
```



```js
// words.js
var arr = new Array("♥你好棒♥", "♥加油♥", "♥爱你♥", "♥奥利给♥", "♥好好学习♥", "♥早睡早起♥", "♥热爱生活♥", "♥爱护自己♥", "♥再接再厉♥", "♥你可以♥", "♥一定行♥");
!function (e, t, a) {
    function r() {
        for (var e = 0; e < s.length; e++) s[e].alpha <= 0 ? (t.body.removeChild(s[e].el), s.splice(e, 1)) : (s[e].y--, s[e].scale += .004, s[e].alpha -= .013, s[e].el.style.cssText = "left:" + s[e].x + "px;top:" + s[e].y + "px;opacity:" + s[e].alpha + ";transform:scale(" + s[e].scale + "," + s[e].scale + ");color:" + s[e].color + ";z-index:99999");
        requestAnimationFrame(r)
    }
    function n() {
        var t = "function" == typeof e.onclick && e.onclick;
        e.onclick = function (e) {
            t && t(),
                o(e)
        }
    }
    function o(e) {
        var a = t.createElement("div");
        a.className = "heart",
            a.innerText = arr[parseInt(arr.length * Math.random())];
        s.push({
            el: a,
            x: e.clientX + 5,
            y: e.clientY - 10,
            scale: 1,
            alpha: 1,
            color: c()
        }),
            t.body.appendChild(a)
    }
    function i(e) {
        var a = t.createElement("style");
        a.type = "text/css";
        try {
            a.appendChild(t.createTextNode(e))
        } catch (t) {
            a.styleSheet.cssText = e
        }
        t.getElementsByTagName("head")[0].appendChild(a)
    }
    function c() {
        return "rgb(" + ~~(255 * Math.random()) + "," + ~~(255 * Math.random()) + "," + ~~(255 * Math.random()) + ")"
    }
    var s = [];
    e.requestAnimationFrame = e.requestAnimationFrame || e.webkitRequestAnimationFrame || e.mozRequestAnimationFrame || e.oRequestAnimationFrame || e.msRequestAnimationFrame ||
        function (e) {
            setTimeout(e, 1e3 / 60)
        },
        i(".heart{position: fixed;}"),
        n(),
        r()
}(window, document);
```



config.ts中引入

```ts
// 点击爱心
[
  "script",
  {},
  `
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "/js/heart.js";
      var s = document.getElementsByTagName("script")[0]; 
      s.parentNode.insertBefore(hm, s);
    })();
  `,
],
```

#### 碎片

安装

```sh
npm i vuepress-plugin-cursor-effects
## or 
yarn add vuepress-plugin-cursor-effects
```

更多[配置参考](https://www.npmjs.com/package/vuepress-plugin-cursor-effects)

```js
[
      "vuepress-plugin-cursor-effects",
      {
        size: 2,                    // size of the particle, default: 2
        shape: 'circle',  // shape of the particle, default: 'star'
        zIndex: 999999999           // z-index property of the canvas, default: 999999999
      }
    ],
```



### 复制

#### 代码块复制


#### 复制限制

- 与代码块复制冲突，即不会被禁用或限制

- 达到 minLength 时，触发 noCopy 或 自定义限制提示组件
  - 想触发 noCopy,必须开启 noCopy
  - 想触发 自定义组件，必须关闭 noCopy
  安装

```sh
npm install -D vuepress-plugin-copyright
```

[配置参考](https://vuepress-community.netlify.app/zh/plugins/copyright)

```js
 [
      'copyright',
      {
        noCopy: true, // 选中的文字将无法被复制
        minLength: 100, // 如果长度超过 100 个字符
        authorName: {
              "en-US": "Author",
              "zh-CN": "作者"
         },
          clipboardComponent: '.vuepress/theme/components/clipboardComponent.vue'
      },
    ],
```

- clipboardComponent: 基于base目录，默认项目根目录

```vue
<template>
  <div>
    <div v-html="html" />
    <p>
      <br />___________________________________________________<br />
      -------- 著作权归 程序员李某某 所有。 链接：<a :href="location"
        >{{ location }}</a
      >
    </p>
  </div>
</template>

<script>
export default {
  props: ["html"],

  created() {
    this.location = window.location;
  },
};
</script>
```



### 音乐播放器(不好使)

安装

```sh
npm i @vuepress-reco/vuepress-plugin-bgm-player
## or
yarn add @vuepress-reco/vuepress-plugin-bgm-player
```

配置，更多[配置参考](https://www.npmjs.com/package/@vuepress-reco/vuepress-plugin-bgm-player)

```js
[
      "@vuepress-reco/vuepress-plugin-bgm-player",{
        audios: [
          // 本地文件示例
          // {
          //   name: '장가갈 수 있을까',
          //   artist: '咖啡少年',
          //   url: '/bgm/1.mp3',
          //   cover: '/bgm/1.jpg'
          // },
          // 网络文件示例
          {
            name: '강남역 4번 출구',
            artist: 'Plastic / Fallin` Dild',
            url: 'https://assets.smallsunnyfox.com/music/2.mp3',
            cover: 'https://assets.smallsunnyfox.com/music/2.jpg'
          },
          {
            name: '用胳膊当枕头',
            artist: '최낙타',
            url: 'https://assets.smallsunnyfox.com/music/3.mp3',
            cover: 'https://assets.smallsunnyfox.com/music/3.jpg'
          }
        ]  
      }
    ],
```

### 背景

#### 整屏

修改首页readme，资源放在public目录下

```
# 原来的配置内容
# heroImage: /hero.png
# heroImageStyle: {
#   maxWidth: '600px',
#   width: '100%',
#   display: block,
#   margin: '9rem auto 2rem',
#   background: '#fff',
#   borderRadius: '1rem',
# }
bgImageStyle: {
  height: '450px'
}
##############################
#修改之后
heroImageStyle: {
  maxWidth: '600px',
  width: '100%',
  display: block,
  margin: '9rem auto 2rem',
  background: '#fff',
  borderRadius: '1rem',
}
bgImage: back1.gif
bgImageStyle: {
  height: '1000px'
}
```

#### 彩带（不好使）

安装

```sh
npm i vuepress-plugin-ribbon-animation
## or
yarn add -D vuepress-plugin-ribbon-animation
```

配置[参考](https://www.npmjs.com/package/vuepress-plugin-ribbon-animation)

```js
["ribbon-animation", {      // 彩带
    size: 90,       // 默认数据
    opacity: 0.3,   //  透明度
    zIndex: 10,     //  层级
    opt: {
        colorSaturation: "80%", // 色带HSL饱和度
        colorBrightness: "60%", // 色带HSL亮度量
        colorAlpha: 0.65,       // 带状颜色不透明度
        colorCycleSpeed: 6,     // 在HSL颜色空间中循环显示颜色的速度有多快
        verticalPosition: "center",  // 从哪一侧开始Y轴 (top|min, middle|center, bottom|max, random)
        horizontalSpeed: 200,   // 到达屏幕另一侧的速度有多快
        ribbonCount: 2,         // 在任何给定时间，屏幕上会保留多少条带
        strokeSize: 0,          // 添加笔划以及色带填充颜色
        parallaxAmount: -0.5,   // 通过页面滚动上的因子垂直移动色带
        animateSections: true   // 随着时间的推移，为每个功能区添加动画效果
    },
    ribbonShow: false, //  点击彩带  true显示  false为不显示
    ribbonAnimationShow: true,  // 滑动彩带
}],
```

如果不能正常显示，先尝试调整 `z-index` 属性，如果无论如何调整都不能有合适的效果，请使用 CSS 为你的主题添加样式覆盖

### 动态标题（不好使）

安装

```sh
yarn add vuepress-plugin-dynamic-title -D
```

配置

```js
[
         "dynamic-title",
         {
            showIcon: "/favicon.ico",
            showText: "(/≧▽≦/)咦！又好了！",
            hideIcon: "/failure.ico",
            hideText: "(●—●)喔哟，崩溃啦！",
            recoverTime: 2000
         }
      ],
```



https://wiki.eryajf.net/pages/b7eb8c/#_1-valine
## 部署

### 报错

报错：Error: error:0308010C:digital envelope routines::unsupported

因为 node.js V17版本中最近发布的OpenSSL3.0, 而OpenSSL3.0对允许算法和密钥大小增加了严格的限制
```
(undefined) assets/js/161.b8599132.js from Terser
Error: error:0308010C:digital envelope routines::unsupported
    at new Hash (node:internal/crypto/hash:71:19)
    at Object.createHash (node:crypto:133:10)
    at /var/lib/jenkins/workspace/test-vue/node_modules/terser-webpack-plugin/dist/index.js:217:37
    at Array.forEach (<anonymous>)
```
```sh 
## Linux & Mac OS：
export NODE_OPTIONS=--openssl-legacy-provider
## Windows：
set NODE_OPTIONS=--openssl-legacy-provider
```


或**直接安装低版本的 18以下**
