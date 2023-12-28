import { defineClientConfig } from "@vuepress/client";
import { onMounted } from 'vue'
import cursorEffects from './myPlugins/cursorEffects'

interface Options {
    size?: number;
    shape?: 'star' | 'circle';
    zIndex?: number;
}


export default defineClientConfig({
    // 全局注册
    setup() {
        onMounted(() => {
            // 鼠标点击碎片 https://moefy-canvas.nyakku.moe
            cursorEffects({
                size: 2,
                shape: 'star',
            });
        })
    },
});
