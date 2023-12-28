
import { SidebarArrayOptions } from "vuepress-theme-hope"
import defaultSideBar from "./defaultSideBar";

export default [
  ...defaultSideBar,

  {
    text: "数据库",
    collapsible: true,
    prefix: "/docs/数据库",
    children: [
      { text: "1 MySQL", link: "1 MySQL", },
      { text: "2 JDBC", link: "2 JDBC", },
      { text: "2 Jdbc精华", link: "2 Jdbc精华", },
      { text: "3 Redis", link: "3 Redis", },
      { text: "4 Elasticsearch", link: "4 Elasticsearch", },
      { text: "4-1 ElasticsearchTemplate", link: "4-1 ElasticsearchTemplate", },
      { text: "4-2 ElasticSearch2", link: "4-2 ElasticSearch2", },
      { text: "5 MongoDB", link: "5 MongoDB", },
      { text: "对象存储", link: "对象存储", },
    ],
  },
] as SidebarArrayOptions;