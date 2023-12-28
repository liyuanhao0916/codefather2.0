import { SidebarArrayOptions } from "vuepress-theme-hope";


export default [
  // "",
  {
    text: "计算机基础知识 考研408",
    collapsible: true,
    prefix: "/docs/计算机基础/",
    children: [
      {
        text: "C语言", children: [
          {
            text: "C语言基础",
            link: "C",
          },
        ]
      },
      {
        text: "操作系统", children: [
          {
            text: "操作系统基础",
            link: '操作系统',
          },
        ]
      },
      {
        text: "数据结构", children: [
          {
            text: "数据结构基础",
            link: '数据结构',
          },
        ]
      },
      {
        text: "计算机组成原理", children: [
          {
            text: "计算机组成原理基础",
            link: '计算机组成原理'
          },
        ]
      },
      {
        text: "计算机网络", children: [
          {
            text: "计算机网络自顶向下",
            link: '计算机网络自顶向下'
          },
        ]
      },
      {
        text: "设计模式", children: [
          {
            text: "设计模式基础",
            link: '设计模式'
          },
        ] },
    ],
  },
] as SidebarArrayOptions;
