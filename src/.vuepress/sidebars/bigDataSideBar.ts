
import { SidebarArrayOptions } from "vuepress-theme-hope"
import defaultSideBar from "./defaultSideBar";

export default [
  ...defaultSideBar,

  {
    text: "大数据",
    collapsible: true,
    prefix: "/docs/大数据",
    children: [
      { text: "Hbase", link: "Hbase", },
      { text: "规则引擎Drools", link: "规则引擎Drools", },
    ],
  },
] as SidebarArrayOptions;