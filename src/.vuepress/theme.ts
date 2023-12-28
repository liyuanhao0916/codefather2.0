import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar.js";
import sidebar from "./sidebar.js";
import encrypt from "./encrypt";
import { plugins } from "./plugins";

export default hopeTheme({
  hostname: "http://codefather.botuer.com", // 网站部署域名
  print: false,   // 打印按钮

  author: {       // 全局默认作者
    name: "程序员李某某",
    url: "https://mister-hope.com",
  },
  darkmode: "disable",     // 禁用深色
  iconAssets: "fontawesome-with-brands",    // 字体图标资源链接

  logo: "/logo.png",

  repo: "liyuanhao0916/codefather",     // github 仓库链接
  docsRepo: 'liyuanhao0916/codefather',  // 文档和文章不在一个仓库时配置
  docsDir: "src/docs",      // 文档在仓库中的目录
  // pure: true,   // 纯净模式

  navbar,         // 导航栏配置
  // navbarAutoHide: "always", // 下滚动隐藏导航栏
  navbarLayout: {
    start: ["Brand"],
    center: [],
    end: ["Search", "Links", "Repo",]
  },


  // sidebar: "heading",
  sidebar,  // 侧边栏配置
  headerDepth: 5, // 目录深度

  footer: "默认页脚字符串",   // 默认页脚字符串


  breadcrumb: false,

  displayFooter: true,    // 是否默认显示页脚
  pageInfo: ["Author", "Original", "Date", "Category", "Tag", "ReadingTime"],

  editLink: false,  // 是否展示编辑此页链接


  encrypt,    // 加密配置

  // page meta
  metaLocales: {
    editLink: "在 GitHub 上编辑此页",
  },
  plugins,

});
