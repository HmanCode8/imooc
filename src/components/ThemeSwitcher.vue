<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { themeColorMap } from "@/const";
import { useGlobalStore } from "@/stores/global";
import { userApi } from "@/services/user";
import _ from "lodash";
import { useRoute } from 'vue-router'
const route = useRoute()
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

//获取用户设置
const getUserSetting = async () => {
const username = JSON.parse(sessionStorage.getItem('userName'))

  const res = await userApi.getUserSetting({
    username
  })
  console.log(res, "res");

    changeTheme(res.theme)
    // themeActive.value = res.theme
    // globalStore.setThemeName(res.theme)
}

//更新用户设置
const updateUserSetting = async (theme) => {
const username = JSON.parse(sessionStorage.getItem('userName'))
  const res = await userApi.updateUserSetting({
    username,
    theme
  })
  if (res.code === 200) {
    globalStore.setThemeName(theme)
  }
}

const themes = computed(() => {
  return _.map(THEME_LIST, (t) => {
    return {
      ...t,
      color: themeColorMap[t.value].bgColor,
    };
  });
});

watch(route, (to, from) => {
  getUserSetting()
}, { immediate: true })
onMounted(() => {
  // getUserSetting()

  // changeTheme(window.global_config.system.theme);
});

const changeTheme = (theme) => {
  console.log(theme, "theme");
  updateUserSetting(theme)
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
