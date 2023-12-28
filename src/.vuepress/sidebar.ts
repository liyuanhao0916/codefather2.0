import { sidebar } from "vuepress-theme-hope";
import codeNavSideBar from "./sidebars/codeNavSideBar";
import knowledgeSideBar from "./sidebars/knowledgeSideBar";
import roadmapSideBar from "./sidebars/roadmapSideBar";
import projectSideBar from "./sidebars/projectSideBar";
import productSideBar from "./sidebars/productSideBar";
import experienceSideBar from "./sidebars/experienceSideBar";
import bigDataSideBar from "./sidebars/bigDataSideBar";
import omSideBar from "./sidebars/omSideBar";
import computerBasicsSideBar from "./sidebars/computerBasicsSideBar";
import javaSideBar from "./sidebars/javaSideBar";
import goSideBar from "./sidebars/goSideBar";
import pythonSideBar from "./sidebars/pythonSideBar";
import databaseSideBar from "./sidebars/databaseSideBar";
import frontSideBar from "./sidebars/frontSideBar";

export default sidebar({
  "/docs/计算机基础/": computerBasicsSideBar,      // 目录名: 对应的子目录 或 文件
  // "/docs/计算机基础/": "heading",      // 目录名: 对应的子目录 或 文件
  "/docs/Java/": javaSideBar,
  // javaSideBar,
  "/docs/Go/": goSideBar,
  // ""
  "/docs/Python/": pythonSideBar,
  "/docs/数据库/": databaseSideBar,
  "/docs/运维/": omSideBar,
  "/docs/前端/": frontSideBar,
  "/docs/大数据/": bigDataSideBar,
  "/docs/经验之谈/": experienceSideBar,
  "/docs/项目案例/": projectSideBar,
  // "": "structure",
});