<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { themeColorMap } from "@/const";
import { useGlobalStore } from "@/stores/global";
import { userApi } from "@/services/user";
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
let settingsLoaded = false;

const getUsername = () => {
  const raw = sessionStorage.getItem("userName");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const isLoggedIn = () =>
  !!sessionStorage.getItem("casToken") && !!getUsername();

// 仅应用主题样式，不调用更新接口
const applyTheme = (theme) => {
  const themeKey = themeColorMap[theme] ? theme : DEFAULT;
  const color = themeColorMap[themeKey];
  _.forEach(elPlusVars, (value, key) => {
    document.documentElement.style.setProperty(key, color[value]);
  });
  globalStore.setThemeColor(color.bgColor);
  document.documentElement.setAttribute("data-theme", themeKey);
  themeActive.value = themeKey;
  globalStore.setThemeName(
    _.includes(MAIN_THEMES, themeKey) ? themeKey : "red-theme",
  );
};

// 整个会话只拉取一次用户主题设置
const loadUserSettingOnce = async () => {
  if (settingsLoaded || !isLoggedIn()) return;
  settingsLoaded = true;

  const username = getUsername();
  try {
    const res = await userApi.getUserSetting({ username });
    applyTheme(res?.theme || DEFAULT);
  } catch (e) {
    console.warn("获取用户主题设置失败，使用默认主题", e);
    applyTheme(DEFAULT);
  }
};

// 用户手动切换时：保存到服务端
const updateUserSetting = async (theme) => {
  if (!isLoggedIn()) return;

  const username = getUsername();
  try {
    const res = await userApi.updateUserSetting({ username, theme });
    if (res.code === 200) {
      globalStore.setThemeName(theme);
    }
  } catch (e) {
    console.warn("保存用户主题设置失败", e);
  }
};

const themes = computed(() => {
  return _.map(THEME_LIST, (t) => {
    return {
      ...t,
      color: themeColorMap[t.value].bgColor,
    };
  });
});

const onUserLogin = () => {
  loadUserSettingOnce();
};

const onUserLogout = () => {
  settingsLoaded = false;
  applyTheme(DEFAULT);
};

onMounted(() => {
  loadUserSettingOnce();
  window.addEventListener("user-login", onUserLogin);
  window.addEventListener("user-logout", onUserLogout);
});

onUnmounted(() => {
  window.removeEventListener("user-login", onUserLogin);
  window.removeEventListener("user-logout", onUserLogout);
});

// 用户点击切换主题时才更新
const changeTheme = (theme) => {
  applyTheme(theme);
  updateUserSetting(theme);
};
</script>

<template>
  <div class="theme mx-2">
    <el-dialog v-model="globalStore.themeVisible" title="主题切换" width="500">
      <div class="grid grid-cols-2 gap-4">
        <div class="w-full m-1 cursor-pointer" v-for="item in themes.slice(0, 4)" :key="item.value"
          @click="changeTheme(item.value)">
          <div :class="`bg-img-${item.value} w-full h-14 rounded-md relative`"
            :style="{ 'background-color': item.color }">
            <el-icon v-if="item.value === themeActive"
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl text-white">
              <SuccessFilled />
            </el-icon>
          </div>
          <div class="m-auto text-center text-xs mt-1 font-medium">
            {{ item.label }}
          </div>
        </div>
      </div>
      <div :class="`grid grid-cols-4 gap-4`">
        <div class="w-full mx-auto m-1 cursor-pointer" v-for="item in themes.slice(4)" :key="item.value"
          @click="changeTheme(item.value)">
          <div class="w-full h-14 rounded-md relative" :style="{ 'background-color': item.color }">
            <el-icon v-if="item.value === themeActive"
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl text-white">
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
