import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { pluginsExt } from "./plugins";


export default defineUserConfig({
  base: `/`,
  lang: "zh-CN",
  title: "茜茜知道-编程笔记",
  description: "贴心的编程学习路线，全面的编程知识百科",

  theme,  // 主题配置

  plugins: pluginsExt,  // 插件配置
  // extendsPage: (page) => {
  //   // 在 routeMeta 中设置目录信息
  //   page.routeMeta = {
  //     // 目录标题
  //     title: page.title,
  //     // ... 其他信息
  //   };
  // },

  head: [
    // 站点图标
    ["link", { rel: "icon", href: "/favicon.ico" }],
    // ['meta', { name: 'referrer', content: 'no-referrer-when-downgrade' }],

    // SEO
    [
      "meta",
      {
        name: "keywords",
        content:
          "程序员鱼皮, 编程学习路线, 编程知识百科, Java, 编程导航, 前端, 开发, 编程分享, 项目, IT, 求职, 面经",
      },
    ],
    // 百度统计
    // [
    //   "script",
    //   {},
    //   `
    //     var _hmt = _hmt || [];
    //     (function() {
    //       var hm = document.createElement("script");
    //       hm.src = "https://hm.baidu.com/hm.js?2675818a983a3131404cee835018f016";
    //       var s = document.getElementsByTagName("script")[0]; 
    //       s.parentNode.insertBefore(hm, s);
    //     })();
    //   `,
    // ],
  ],
  // themeConfig: {
  //   sidebarDepth: 3, // 设置侧边栏显示的层级数，这里设置为3级
  // },

  markdown: {
    headers: {
      level: [2, 3, 4, 5, 6],
    }
  },
});
