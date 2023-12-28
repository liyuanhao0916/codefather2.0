
import { SidebarArrayOptions } from "vuepress-theme-hope"
import defaultSideBar from "./defaultSideBar";

export default [
  ...defaultSideBar,
  {
    text: "博客搭建",
    collapsible: true,
    prefix: "/docs/项目案例/博客搭建",
    children: [
      { text: "WordPress", link: "WordPress", },
      { text: "VuePress", link: "VuePress", },
      { text: "VuePress2", link: "VuePress2", },
    ],
  },
  {
    text: "项目案例",
    collapsible: true,
    prefix: "/docs/项目案例",
    children: [
      { text: "下单支付", link: "下单支付", },
      { text: "好客租房", link: "好客租房", },
      { text: "答题系统", link: "答题系统", },
      { text: "谷粒商城", link: "谷粒商城", },

    ],
  },
] as SidebarArrayOptions;