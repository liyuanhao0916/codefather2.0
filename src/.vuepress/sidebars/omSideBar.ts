
import { SidebarArrayOptions } from "vuepress-theme-hope"
import defaultSideBar from "./defaultSideBar";

export default [
  ...defaultSideBar,

  {
    text: "Git",
    collapsible: true,
    prefix: "/docs/运维/Git",
    children: [
      { text: "Git 基础", link: "Git基础", },
      { text: "巧用 stash", link: "巧用stash", },
      { text: "如何同时推送到GitHub和Gitee", link: "如何同时推送到GitHub和Gitee", },
    ],
  },
  {
    text: "Nginx",
    collapsible: true,
    prefix: "/docs/运维/Nginx",
    children: [
      { text: "Nginx 基础", link: "Nginx基础", },
      { text: "Nginx 高级", link: "Nginx高级", },
      { text: "Nginx 缓存", link: "Nginx缓存", },
      // { text: "Nginx 进阶", link: "Nginx进阶", },
    ],
  },
  {
    text: "Maven",
    collapsible: true,
    prefix: "/docs/运维/Maven",
    children: [
      { text: "Maven 基础", link: "Maven基础", },
      { text: "Maven 高级", link: "Maven高级", },
      { text: "Maven 插件", link: "Maven插件", },
      { text: "Maven 私服", link: "Maven私服", },
    ],
  },
  {
    text: "Linux",
    collapsible: true,
    prefix: "/docs/运维/Linux",
    children: [
      { text: "Linux 基础", link: "Linux基础", },
      { text: "Shell 脚本", link: "Shell脚本", },
      { text: "Ubuntu 玩机", link: "Ubuntu玩机", },
    ],
  },
  {
    text: "软件安装",
    collapsible: true,
    prefix: "/docs/运维/软件安装",
    children: [
      { text: "Linux 软件安装", link: "Linux软件", },
      { text: "Mac 软件", link: "Mac软件", },
    ],
  },
  {
    text: "内网穿透",
    collapsible: true,
    prefix: "/docs/运维/内网穿透",
    children: [
      { text: "自建 frp", link: "自建frp", },
    ],
  },
  {
    text: "云原生",
    collapsible: true,
    prefix: "/docs/运维/云原生",
    children: [
      { text: "Docker", link: "Docker", },
      { text: "Jenkins", link: "Jenkins", },
    ],
  },
  {
    text: "其他",
    collapsible: true,
    prefix: "/docs/运维/其他",
    children: [
      { text: "Tomcat", link: "1 Tomcat", },
      { text: "Jmeter压力测试", link: "Jmeter压力测试", },
    ],
  },
] as SidebarArrayOptions;