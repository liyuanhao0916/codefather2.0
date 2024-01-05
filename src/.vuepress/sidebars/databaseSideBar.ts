
import { SidebarArrayOptions } from "vuepress-theme-hope"
import defaultSideBar from "./defaultSideBar";

export default [
  ...defaultSideBar,

  {
    text: "ElasticSearch",
    collapsible: false,
    prefix: "/docs/数据库/ElasticSearch",
    children: [
      { text: "4 Elasticsearch", link: "4 Elasticsearch", },
      { text: "4-1 ElasticsearchTemplate", link: "4-1 ElasticsearchTemplate", },
      { text: "4-2 ElasticSearch2", link: "4-2 ElasticSearch2", },
    ],
  },
  {
    text: "MongoDB",
    collapsible: false,
    prefix: "/docs/数据库/MongoDB",
    children: [
      { text: "5 MongoDB", link: "5 MongoDB", },
    ],
  },
  {
    text: "MySQL",
    collapsible: false,
    prefix: "/docs/数据库/MySQL",
    children: [
      { text: "2 JDBC", link: "2 JDBC", },
      { text: "2 Jdbc精华", link: "2 Jdbc精华", },
      { text: "3 Mybatis", link: "3 Mybatis", },
      { text: "4 Mybatis-Plus", link: "4 Mybatis-Plus", },
      { text: "Hibernate", link: "Hibernate", },
      { text: "mybatis的拦截器", link: "mybatis的拦截器", },
      { text: "mybatis缓存", link: "mybatis缓存", },
      { text: "MySQL基础", link: "MySQL基础", },
    ],
  },
  {
    text: "Redis",
    collapsible: false,
    prefix: "/docs/数据库/Redis",
    children: [
      { text: "3 Redis", link: "3 Redis", },
    ],
  },
  {
    text: "对象存储",
    collapsible: false,
    prefix: "/docs/数据库/对象存储",
    children: [
      { text: "minio", link: "minio", },
    ],
  },
] as SidebarArrayOptions;