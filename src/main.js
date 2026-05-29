import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import router from "./router";
import "./theme/styles.scss";
import { createPinia } from "pinia";
import { useVehicleStore } from "@/stores/vehicle";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(router);
const pinia = createPinia();
app.use(pinia);
app.use(ElementPlus);
useVehicleStore(pinia).init();
app.mount("#app");
