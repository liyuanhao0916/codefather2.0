import { SidebarArrayOptions } from "vuepress-theme-hope"
import defaultSideBar from "./defaultSideBar";

export default [
  ...defaultSideBar,

  {
    text: "Go",
    collapsible: true,
    prefix: "/docs/Go/",
    children: [
      { text: "etcd", link: "etcd", },
      { text: "gin", link: "gin", },
      { text: "goframe", link: "goframe", },
      { text: "gorm", link: "gorm", },
      { text: "go基础", link: "go基础", },
    ],
  },
] as SidebarArrayOptions;