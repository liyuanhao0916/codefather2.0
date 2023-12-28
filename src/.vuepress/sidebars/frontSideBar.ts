
import { SidebarArrayOptions } from "vuepress-theme-hope"
import defaultSideBar from "./defaultSideBar";

export default [
  ...defaultSideBar,

  {
    text: "前端",
    collapsible: true,
    prefix: "/docs/前端",
    children: [
      { text: "Ajax", link: "Ajax", },
      { text: "css", link: "css", },
      { text: "emmet语法", link: "emmet语法", },
      { text: "html", link: "html", },
      { text: "js", link: "js", },
      { text: "nodejs", link: "nodejs", },
      { text: "Promise", link: "Promise", },
      { text: "vue", link: "vue", },
      { text: "web前端规范", link: "web前端规范", },
      { text: "微信小程序", link: "微信小程序", },
      { text: "移动端", link: "移动端", },
    ],
  },
] as SidebarArrayOptions;