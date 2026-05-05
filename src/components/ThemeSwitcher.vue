<script setup>
import { computed, onMounted, ref } from "vue";
import { themeColorMap } from "@/const";
import { useGlobalStore } from "@/stores/global";
import _ from "lodash";
// 主题列表
const THEME_LIST = [];
const MAIN_THEMES = ["blue-theme", "red-theme", "purple-theme"];
const DEFAULT = window.global_config.system.theme;
for (let key in themeColorMap) {
  THEME_LIST.push({
    label: themeColorMap[key].label,
    value: key,
  });
}
const themeActive = ref(DEFAULT);

//elment-plus 的css属性变量集合
const elPlusVars = {
  "--el-color-primary": "bgColor",
  "--el-color-primary-light-3": "bgColor",
  "--el-color-primary-dark-2": "bgColor",
  "--el-color-primary-light-9": "primaryColor",
};

const globalStore = useGlobalStore();
console.log(globalStore, "globalStore");
const themes = computed(() => {
  return _.map(THEME_LIST, (t) => {
    return {
      ...t,
      color: themeColorMap[t.value].bgColor,
    };
  });
});

// 监听系统主题变化
const m = matchMedia("(prefers-color-scheme: dark)");
m.addEventListener("change", (e) => {
  const theme = e.matches
    ? "hong-red-theme"
    : window.global_config.system.theme;
  changeTheme(theme);
});

onMounted(() => {
  // 监听系统主题变化
  let d = DEFAULT;
  d = m.matches ? "hong-red-theme" : window.global_config.system.theme;
  changeTheme(d);
});

const changeTheme = (theme) => {
  console.log(theme, "theme");
  const color = themeColorMap[theme];
  _.forEach(elPlusVars, (value, key) => {
    document.documentElement.style.setProperty(key, color[value]);
  });
  //保存主题背景颜色
  globalStore.setThemeColor(color["bgColor"]);
  document.documentElement.setAttribute("data-theme", theme);
  themeActive.value = theme;
  globalStore.setThemeName(
    _.includes(MAIN_THEMES, theme) ? theme : "red-theme",
  );
};
</script>

<template>
  <div class="theme mx-2">
    <el-dialog v-model="globalStore.themeVisible" title="主题切换" width="500">
      <div class="grid grid-cols-2 gap-4">
        <div
          class="w-full m-1 cursor-pointer"
          v-for="item in themes.slice(0, 4)"
          :key="item.value"
          @click="changeTheme(item.value)"
        >
          <div
            :class="`bg-img-${item.value} w-full h-14 rounded-md relative`"
            :style="{ 'background-color': item.color }"
          >
            <el-icon
              v-if="item.value === themeActive"
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl text-white"
            >
              <SuccessFilled />
            </el-icon>
          </div>
          <div class="m-auto text-center text-xs mt-1 font-medium">
            {{ item.label }}
          </div>
        </div>
      </div>
      <div :class="`grid grid-cols-4 gap-4`">
        <div
          class="w-full mx-auto m-1 cursor-pointer"
          v-for="item in themes.slice(4)"
          :key="item.value"
          @click="changeTheme(item.value)"
        >
          <div
            class="w-full h-14 rounded-md relative"
            :style="{ 'background-color': item.color }"
          >
            <el-icon
              v-if="item.value === themeActive"
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl text-white"
            >
              <SuccessFilled />
            </el-icon>
          </div>
          <div class="m-auto text-center text-xs mt-1 font-medium">
            {{ item.label }}
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <!-- <el-button @click="handleCacel">取消</el-button>
                    <el-button type="primary" @click="globalStore.setThemeVisible(false)">
                        保存
                    </el-button> -->
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
$bg-imgs: blue-theme, green-theme, red-theme, purple-theme;

@each $img in $bg-imgs {
  .bg-img-#{$img} {
    background-image: url("@/assets/main/#{$img}.png");
    background-size: 100% 100%;
  }
}
</style>
