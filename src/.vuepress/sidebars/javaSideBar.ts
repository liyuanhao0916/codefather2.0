
import { SidebarArrayOptions } from "vuepress-theme-hope"
import defaultSideBar from "./defaultSideBar";

export default [
    ...defaultSideBar,

    {
        text: "JavaSE",
        collapsible: false,
        prefix: "/docs/Java/JavaSE",
        children: [
            { text: "Java基础", link: "1Java", },
            { text: "2 JVM", link: "2 JVM", },
            { text: "3 线程补充", link: "3 线程补充", },
            { text: "3 高并发", link: "3 高并发", },
        ],
    },
    {
        text: "JavaWeb",
        collapsible: false,
        prefix: "/docs/Java/JavaWeb",
        children: [
            { text: "0 BootStrap & Vue", link: "0 BootStrap & Vue", },
            { text: "0", link: "0", },
            { text: "3 XML & Jsoup & Xpath", link: "3 XML & Jsoup & Xpath", },
            { text: "4 Servlet & Filter & Listener", link: "4 Servlet & Filter & Listener", },
            { text: "5 WebSocket", link: "5 WebSocket", },
            { text: "6 jQuery & Ajax & json", link: "6 jQuery & Ajax & json", },
            { text: "GraphQL", link: "GraphQL", },
            { text: "jsp & EL表达式 & JSTL", link: "jsp & EL表达式 & JSTL", },
            { text: "NIO", link: "NIO", },
            { text: "WebSocket", link: "WebSocket", },
        ],
    },
    {
        text: "MQ",
        collapsible: false,
        prefix: "/docs/Java/MQ",
        children: [
            { text: "1 RocketMQ", link: "1 RocketMQ", },
            { text: "2 RabbitMQ & SpringAMQP", link: "2 RabbitMQ & SpringAMQP", },
        ],
    },
    {
        text: "Spring",
        collapsible: false,
        prefix: "/docs/Java/Spring",
        children: [
            { text: "2 SpringMVC", link: "2 SpringMVC", },
            { text: "5 SpringBoot", link: "5 SpringBoot", },
            { text: "Spring Data JPA", link: "Spring Data JPA", },
            { text: "SpringFramework ", link: "SpringFramework ", },
            { text: "SpringMVC-二阶", link: "SpringMVC-二阶", },
            { text: "Spring问题", link: "Spring问题", },
        ],
    },
    {
        text: "其他",
        collapsible: false,
        prefix: "/docs/Java/其他",
        children: [
            { text: "4 数据结构与算法", link: "4 数据结构与算法", },
            { text: "gradle", link: "gradle", },
            { text: "jacoco", link: "jacoco", },
            { text: "Log4j && Slf4j && Logback", link: "Log4j && Slf4j && Logback", },
            { text: "Lua", link: "Lua", },
            { text: "定时任务", link: "定时任务", },
        ],
    },
    {
        text: "工具类",
        collapsible: false,
        prefix: "/docs/Java/工具类",
        children: [
            { text: "Emoji 表情转换工具", link: "Emoji 表情转换工具", },
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
        collapsible: false,
        prefix: "/docs/Java/微服务",
        children: [
            { text: "1 Dubbo & Zookeeper", link: "1 Dubbo & Zookeeper", },
            { text: "2 SpringCloud", link: "2 SpringCloud", },
            { text: "3 SpringCloudAlibaba", link: "3 SpringCloudAlibaba", },
            { text: "Spring Security", link: "Spring Security", },
            { text: "第三方服务", link: "第三方服务", },
        ],
    },
] as SidebarArrayOptions;