
import { SidebarArrayOptions } from "vuepress-theme-hope"
import defaultSideBar from "./defaultSideBar";

export default [
  ...defaultSideBar,

  {
    text: "运维",
    collapsible: true,
    prefix: "/docs/运维",
    children: [
      { text: "Git", link: "1 Git", },
      { text: "Tomcat", link: "1 Tomcat", },
      { text: "Maven", link: "2 Maven", },
      { text: "Docker", link: "3 Docker", },
      { text: "Linux", link: "4 Linux", },
      { text: "软件安装", link: "5 软件安装", },
      { text: "frp内网穿透", link: "6 frp内网穿透", },
      { text: "Nginx", link: "7 Nginx", },
      { text: "Homebrew", link: "Homebrew", },
      { text: "Jenkins", link: "Jenkins", },
      { text: "Jmeter压力测试", link: "Jmeter压力测试", },
    ],
  },
] as SidebarArrayOptions;