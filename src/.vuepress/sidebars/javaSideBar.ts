import { SidebarArrayOptions } from "vuepress-theme-hope";

export default [
    // "",

    {
        text: "JavaSE",
        collapsible: true,
        prefix: "/docs/Java/JavaSE/",
        children: [
            { text: 'Java基础', link: '1Java' },
            { text: 'JVM', link: "2 JVM", },
            // { text:'线程补充',link: "3 线程补充",  },
            { text: '高并发', link: "3 高并发", },
        ]

    },
    {
        text: "JavaWeb",
        collapsible: true,
        prefix: "/docs/Java/JavaWeb",
        children: [

            { text: 'XML & Jsoup & Xpath', link: '3 XML & Jsoup & Xpath' },
            { text: 'Servlet & Filter & Listener', link: "4 Servlet & Filter & Listener", },
            { text: 'WebSocket', link: "5 WebSocket", },
            { text: 'jQuery & Ajax & json', link: "6 jQuery & Ajax & json", },
            { text: 'GraphQL', link: "GraphQL", },
            { text: 'NIO', link: "NIO", },
            // "JavaWeb/WebSocket",
            // "JavaWeb/jsp & EL表达式 & JSTL",
            // "JavaWeb/0 BootStrap & Vue.js & Element",
            // "JavaWeb/0.1 前端补充",
            // "JavaWeb/1 html & css",
            // "JavaWeb/2 JavaScript",

        ]

    },
    {
        text: "SSM",
        collapsible: true,
        prefix: "/docs/Java/SSM",
        children: [
            //   { text:  "1 Spring",},
            { link: "1 Spring", text: "Spring", },
            { link: "2 SpringMVC", text: "SpringMVC", },
            { link: "3 Mybatis", text: "Mybatis", },
            { link: "4 Mybatis-Plus", text: "Mybatis-Plus", },
            { link: "5 SpringBoot", text: "SpringBoot", },
            { link: "mybatis的拦截器", text: "mybatis的拦截器", },
            { link: "mybatis缓存", text: "mybatis缓存", },
            { link: "SpringMVC-二阶", text: "SpringMVC-二阶", },
        ],
    },
    {
        text: "其他",
        collapsible: true,
        prefix: "/docs/Java/其他",
        children: [
            { text: "数据结构与算法", link: "4 数据结构与算法", },
            { text: "gradle", link: "gradle", },
            { text: "jacoco", link: "jacoco", },
            { text: "Log4j && Slf4j && Logback", link: "Log4j && Slf4j && Logback", },
            { text: "Lua", link: "Lua", },
            { text: "定时任务", link: "定时任务", },
        ],
    },
    {
        text: "工具类",
        collapsible: true,
        prefix: "/docs/Java/工具类",
        children: [
            { text: "Emoji 表情转换工具", link: "Emoji 表情转换工具", },
            { text: "Excel上传OSS或返回前端的处理", link: "Excel上传OSS或返回前端的处理", },
            { text: "Excel工具类", link: "Excel工具类", },
            { text: "HTTPUtils", link: "HTTPUtils", },
            { text: "Mock单元测试", link: "Mock单元测试", },
            { text: "切片上传", link: "切片上传", },
            { text: "压缩", link: "压缩", },
            { text: "线程池工具类", link: "线程池工具类", },
        ],
    },
    {
        text: "微服务",
        collapsible: true,
        prefix: "/docs/Java/微服务",
        children: [
            { text: "Dubbo", link: "1 Dubbo & Zookeeper", },
            { text: "SpringCloud", link: "2 SpringCloud", },
            { text: "SpringCloudAlibaba", link: "3 SpringCloudAlibaba", },
            { text: "Spring Security", link: "Spring Security", },
            { text: "第三方服务", link: "第三方服务", },
        ],
    },
] as SidebarArrayOptions;