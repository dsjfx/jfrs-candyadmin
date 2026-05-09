import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import '@/index.scss';
import '@/styles/responsive.scss' // 导入响应式样式
// 导入 Quill 样式
// import '@vueup/vue-quill/dist/vue-quill.snow.css'

import App from './App.vue';
import router from '@/router';
import { zhCn } from 'element-plus/es/locales.mjs';

const app = createApp(App);
const pinia = createPinia();

app.use(ElementPlus, {
  locale: zhCn,
});

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(pinia);
app.use(router);

app.mount('#app');
