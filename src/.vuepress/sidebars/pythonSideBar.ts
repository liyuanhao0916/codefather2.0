
import { SidebarArrayOptions } from "vuepress-theme-hope"
import defaultSideBar from "./defaultSideBar";

export default [
  ...defaultSideBar,

  {
    text: "Python",
    collapsible: true,
    prefix: "/docs/Python",
    children: [
      { text: "django", link: "django", },
      { text: "Python基础", link: "Python基础", },
      { text: "爬虫", link: "爬虫", },
    ],
  },
] as SidebarArrayOptions;