
import { SidebarArrayOptions } from "vuepress-theme-hope"
import defaultSideBar from "./defaultSideBar";

export default [
  ...defaultSideBar,
 
  {
    text: "经验之谈",
    collapsible: true,
    prefix: "/docs/经验之谈",
    children: [
      { text: "Spring", link: "2 Spring", },
      { text: "VS Code", link: "3 VS Code", },
      { text: "面试", link: "4 面试", },
      { text: "Ubuntu", link: "5 Ubuntu", },
      { text: "Postman", link: "6 Postman", },
      { text: "Facebook开发", link: "7 Facebook开发", },
      { text: "Idea", link: "8 Idea", },
      { text: "公众号官方文档梳理", link: "公众号官方文档梳理", },
    ],
  },
] as SidebarArrayOptions;