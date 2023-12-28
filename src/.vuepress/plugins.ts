import { PluginsOptions } from "vuepress-theme-hope";
import { searchPlugin } from "@vuepress/plugin-search";


export const pluginsExt = [

    // 全局搜索 https://plugin-search-pro.vuejs.press/zh/config.html
    // searchProPlugin({
    //     indexContent: true, // 允许搜索正文
    //     autoSuggestions: true,   // 自动提示搜索建议
    //     searchDelay: 1000    // 结束输入到开始搜索的延时
    // }),

    searchPlugin({
        // ...
        locales: {
            "/zh/": {
                placeholder: "搜索",
            },
        },
        maxSuggestions:10,
    }),

];



export const plugins = {
    // You should generate and use your own comment service
    // comment: {
    //     provider: "Giscus",
    //     repo: "vuepress-theme-hope/giscus-discussions",
    //     repoId: "R_kgDOG_Pt2A",
    //     category: "Announcements",
    //     categoryId: "DIC_kwDOG_Pt2M4COD69",
    // },

    comment: {
        provider: "Twikoo",
        envId: "https://twikoo.botuer.com", // your server url 必须是https
        // envId: "http://codefather.botuer.com/twikoo/", // your server url
    },
    // 复制加版权  https://theme-hope.vuejs.press/zh/config/plugins/copyright.html
    copyright: {
        global: true,
        triggerLength: 100,  // 触发附加版权的最小字数
    },
    //代码块主题 https://theme-hope.vuejs.press/zh/guide/interface/code-theme.html#%E5%8F%AF%E7%94%A8%E7%9A%84%E4%B8%BB%E9%A2%98
    // prismjs: false,
    prismjs: {
        // light: "z-touch",
        light: "tomorrow",
        // dark: "vs",
    },

    autoCatalog: {

    },

    // markdown 支持 https://plugin-md-enhance.vuejs.press/zh/config.html
    mdEnhance: {
        align: true,
        attrs: true,
        codetabs: true,
        component: true,
        demo: true,
        figure: true,
        imgLazyload: true,
        imgSize: true,
        include: true,
        mark: true,
        stylize: [
            {
                matcher: "Recommended",
                replacer: ({ tag }) => {
                    if (tag === "em")
                        return {
                            tag: "Badge",
                            attrs: { type: "tip" },
                            content: "Recommended",
                        };
                },
            },
        ],
        sub: true,
        sup: true,
        tabs: true,
        vPre: true,
    },

    // https://plugin-pwa2.vuejs.press/zh/config.html
    // pwa: {
    //   favicon: "/favicon.ico",
    //   cacheHTML: true,
    //   cachePic: true,
    //   appendBase: true,
    //   apple: {
    //     icon: "/assets/icon/apple-icon-152.png",
    //     statusBarColor: "black",
    //   },
    //   msTile: {
    //     image: "/assets/icon/ms-icon-144.png",
    //     color: "#ffffff",
    //   },
    //   manifest: {
    //     icons: [
    //       {
    //         src: "/assets/icon/chrome-mask-512.png",
    //         sizes: "512x512",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-mask-192.png",
    //         sizes: "192x192",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //     ],
    //     shortcuts: [
    //       {
    //         name: "Demo",
    //         short_name: "Demo",
    //         url: "/demo/",
    //         icons: [
    //           {
    //             src: "/assets/icon/guide-maskable.png",
    //             sizes: "192x192",
    //             purpose: "maskable",
    //             type: "image/png",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // },
} as PluginsOptions;