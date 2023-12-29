import { navbar } from "vuepress-theme-hope";

export default navbar([
  // "/",
  {
    text: "计算机基础",
    children: [
      {
        text: "C语言", link: "/docs/计算机基础/C.md",
      },
      {
        text: "操作系统", link: "/docs/计算机基础/操作系统.md",
      },
      {
        text: "数据结构", link: "/docs/计算机基础/数据结构.md",
      },
      {
        text: "计算机组成原理", link: "/docs/计算机基础/计算机组成原理.md",
      },
      {
        text: "计算机网络自顶向下", link: "/docs/计算机基础/计算机网络自顶向下.md",
      },
      {
        text: "设计模式", link: "/docs/计算机基础/设计模式.md",
      },
    ]
  },

  {
    text: "Java",
    children: [
      {
        text: "JavaSE", link: "/docs/Java/#javase",
      },
      {
        text: "JavaWeb", link: "/docs/Java/#javaweb",
      },
      {
        text: "SSM", link: "/docs/Java/#ssm",
      },
      {
        text: "微服务", link: "/docs/Java/#微服务",
      },
      {
        text: "其他", children: [
          {
            text: "MQ", link: "/docs/Java/#mq",
          },
          {
            text: "定时任务", link: "/docs/java/其他/定时任务",
          },
          {
            text: "工具类", link: "/docs/Java/#工具类",
          },
        ]
      },
    ]
  },
  {
    text: "Go",
    children: [
      {
        text: "go基础", link: "/docs/Go/go基础.md",
      },
      {
        text: "gin", link: "/docs/Go/gin.md",
      },

      {
        text: "gorm", link: "/docs/Go/gorm.md",
      },

      {
        text: "goframe", link: "/docs/Go/goframe.md",
      },

      {
        text: "etcd", link: "/docs/Go/etcd",
      },
    ]
  },
  {
    text: "Python",
    children: [
      {
        text: "Python基础", link: "/docs/Python/Python基础.md",
      },
      {
        text: "django", link: "/docs/Python/django.md",
      },
      {
        text: "爬虫", link: "/docs/Python/爬虫.md",
      },
    ]
  },
  {
    text: "数据库",
    children: [
      {
        text: "MySQL", link: "/docs/数据库/1 MySQL.md",
      },
      {
        text: "JDBC", link: "/docs/数据库/2 JDBC.md",
      },
      {
        text: "Redis", link: "/docs/数据库/3 Redis.md",
      },
      {
        text: "Elasticsearch", link: "/docs/数据库/4 Elasticsearch.md",
      },
      {
        text: "MongoDB", link: "/docs/数据库/5 MongoDB.md",
      },
      {
        text: "Minio对象存储", link: "/docs/数据库/对象存储/minio.md",
      },
    ]
  },
  {
    text: "运维",
    children: [
      {
        text: "Git", link: "/docs/运维/Git",
      }, {
        text: "Tomcat", link: "/docs/运维/其他",
      }, {
        text: "Maven", link: "/docs/运维/Maven",
      }, {
        text: "Docker", link: "/docs/运维/云原生",
      }, {
        text: "Linux", link: "/docs/运维/Linux",
      }, {
        text: "软件安装", link: "/docs/运维/软件安装",
      }, {
        text: "内网穿透", link: "/docs/运维/内网穿透",
      }, {
        text: "Nginx", link: "/docs/运维/Nginx",
      },
    ]
  },

  {
    text: "前端",
    children: [
      {
        text: "HTML", link: "/docs/前端/html",
      },
      {
        text: "CSS", link: "/docs/前端/css",
      },
      {
        text: "JS", link: "/docs/前端/js",
      },
      {
        text: "Nodejs", link: "/docs/前端/nodejs",
      },
      {
        text: "Promise", link: "/docs/前端/Promise",
      },
      {
        text: "Vue", link: "/docs/前端/vue",
      },
      {
        text: "微信小程序", link: "/docs/前端/微信小程序",
      },

    ]
  },

  {
    text: "大数据",
    children: [
      {
        text: "Drools规则引擎", link: "/docs/大数据/规则引擎Drools",
      },
      {
        text: "HBase", link: "/docs/大数据/Hbase",
      },

    ]
  },
  {
    text: "经验之谈",
    children: [
      // {
      //   text: "博客搭建", link: "/docs/经验之谈/1 WordPress博客",
      // },
      {
        text: "Spring", link: "/docs/经验之谈/2 Spring",
      },
      {
        text: "VSCode", link: "/docs/经验之谈/3 VS Code",
      },
      {
        text: "面试", link: "/docs/经验之谈/4 面试",
      },
      // {
      //   text: "Ubuntu", link: "/docs/经验之谈/5 Ubuntu",
      // },
      {
        text: "Postman", link: "/docs/经验之谈/6 Postman",
      },
      {
        text: "Facebook开发", link: "/docs/经验之谈/7 Facebook开发",
      },
      {
        text: "Idea", link: "/docs/经验之谈/8 Idea",
      },

    ]
  },
  {
    text: "项目案例",
    children: [
      {
        text: "博客搭建", link: "/docs/项目案例/博客搭建",
      },
      {
        text: "答题系统", link: "/docs/项目案例/答题系统",
      },
      {
        text: "谷粒商城", link: "/docs/项目案例/谷粒商城",
      },
      {
        text: "好客租房", link: "/docs/项目案例/好客租房",
      },
      {
        text: "下单支付", link: "/docs/项目案例/下单支付",
      },

    ]
  },

]);
