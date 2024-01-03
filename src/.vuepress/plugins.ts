import { PluginsOptions } from "vuepress-theme-hope";
import { searchPlugin } from "@vuepress/plugin-search";
import { componentsPlugin } from "vuepress-plugin-components";
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
// import { getDirname, path } from 'vuepress/utils'
import path from 'path'


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
        maxSuggestions: 10,
    }),
    registerComponentsPlugin({
        // 配置项
        components: {
            // RightBar: path.resolve(__dirname, './theme/components/RightBar.vue'),
            // test: path.resolve(__dirname, './theme/components/test.vue'),
            // PageSidebar: path.resolve(__dirname, './theme/components/ExtraSidebar.vue'),
        },
    }),
    // [
    //     'vuepress-plugin-right-anchor',
    //     {
    //         showDepth: 1,
    //         ignore: [
    //             '/',
    //             '/api/'
    //             // 更多...
    //         ],
    //         expand: {
    //             trigger: 'hover',
    //             clickModeDefaultOpen: true
    //         },
    //         customClass: 'your-customClass',
    //     }
    // ],
    componentsPlugin({
        // 插件选项
        components: [
            "VPCard",       // 卡片组件，可用于展示项目。https://plugin-components.vuejs.press/zh/guide/content/card.html
            "Share",        // 分享组件，将页面内容分享到社交媒体 https://plugin-components.vuejs.press/zh/guide/utilities/share.html
            "SiteInfo",     // 站点信息组件，可用于友情链接或项目展示。https://plugin-components.vuejs.press/zh/guide/content/site-info.html
            "VPBanner",     // 用于展示 banner https://plugin-components.vuejs.press/zh/guide/content/banner.html
            "Badge",        // 自定义颜色的徽章 https://plugin-components.vuejs.press/zh/guide/utilities/badge.html
            "FontIcon",     // 用于展示字体图标 https://plugin-components.vuejs.press/zh/guide/utilities/font-icon.html
            // "VidStack",     // 视频播放器
            // "VideoPlayer",  // 视频播放器
            // "BiliBili",     // B站视频播放器 https://plugin-components.vuejs.press/zh/guide/media/bili-bili.html
            // "XiGua",        // 西瓜视频播放器
            // "YouTube",      // YouTube播放器
            // "ArtPlayer",    // 视频播放器 https://plugin-components.vuejs.press/zh/guide/media/art-player.html
            // "AudioPlayer",  // 音频播放器 https://plugin-components.vuejs.press/zh/guide/media/audio-player.html
            // "CodePen",      // https://plugin-components.vuejs.press/zh/guide/code/code-pen.html
            // "Replit",       // https://plugin-components.vuejs.press/zh/guide/code/repl-it.html
            // "StackBlitz",   // https://plugin-components.vuejs.press/zh/guide/code/stack-blitz.html
            // "PDF",          // https://plugin-components.vuejs.press/zh/guide/media/p-d-f.html
        ]

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