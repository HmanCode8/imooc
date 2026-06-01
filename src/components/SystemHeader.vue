<template>
  <div class="relative h-full w-full theme-bg flex justify-between items-center px-2 text-white overflow-visible">
    <div class="flex items-center shrink-0">
      <div class="pl-4 text-3xl font-bold">
        {{ systemTitle }}
      </div>
    </div>

    <div ref="navRef" class="nav-menu relative flex items-stretch h-full gap-2">
      <!-- 全宽固定路面 -->
      <div class="nav-road" :class="{
        'nav-road--ready': indicatorReady,
        'nav-road--driving': isDriving,
      }">
        <div class="nav-road__surface">
          <span class="nav-road__edge"></span>
          <div class="nav-road__lane">
            <div class="nav-road__dash"></div>
          </div>
          <span class="nav-road__edge"></span>
        </div>
        <!-- 与路面同容器，bottom 对齐路面顶沿 -->
        <div class="nav-car" :class="{
          'nav-car--ready': indicatorReady,
          'nav-car--driving': isDriving,
        }" :style="carPosStyle">
          <div class="nav-car__body">
            <div class="nav-car__flip" :style="carFaceStyle">
              <i class="iconfont icon-ceshicheliang-copy nav-car__icon"></i>
            </div>
          </div>
        </div>
      </div>

      <div v-for="m in menuList" :key="m.id" :ref="(el) => setMenuItemRef(m.id, el)" class="nav-item"
        @click.stop="onMenuChange(m)">
        <span class="nav-label" :class="{ 'nav-label--active': activeMenu === m.id }">
          {{ m.name }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-4 text-white/85 shrink-0">
      <div class="cursor-pointer hover:text-white transition-colors" title="首页" @click="goHome">
        <el-icon size="18">
          <HomeFilled />
        </el-icon>
      </div>
      <div class="cursor-pointer hover:text-white transition-colors" title="设置" @click="openSettings">
        <el-icon size="18">
          <Setting />
        </el-icon>
      </div>
      <div class="cursor-pointer hover:text-white transition-colors" title="通知" @click="openNotifications">
        <el-icon size="18">
          <Bell />
        </el-icon>
      </div>
      <div class="h-5 w-px bg-white/20"></div>
      <div class="flex items-center gap-2">
        <el-icon size="18" class="text-white/70">
          <User />
        </el-icon>
        <span class="text-sm text-white/90">欢迎您！{{ userName }}</span>
      </div>
      <div class="h-5 w-px bg-white/20"></div>
      <div class="cursor-pointer hover:text-white transition-colors flex items-center gap-1" title="退出登录"
        @click="handleLogout">
        <el-icon size="18">
          <SwitchButton />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useGlobalStore } from "@/stores/global";
import { menuList } from "../mock/menu";

const router = useRouter();
const route = useRoute();
const systemTitle = ref(
  window.global_config?.system?.title || "大数据可视化展平台",
);
const activeMenu = ref("onemap");

const parseUserName = () => {
  const raw = sessionStorage.getItem("userName");
  if (!raw) return "admin";
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};
const userName = ref(parseUserName());
const globalStore = useGlobalStore();

const navRef = ref(null);
const menuItemRefs = ref({});
const carLeft = ref(0);
const indicatorReady = ref(false);
const isDriving = ref(false);
const carFacingRight = ref(true);
let driveTimer = null;

const setMenuItemRef = (id, el) => {
  if (el) menuItemRefs.value[id] = el;
  else delete menuItemRefs.value[id];
};

const carPosStyle = computed(() => ({
  left: `${carLeft.value}px`,
}));

const DRIVE_MS = 780;

const carFaceStyle = computed(() => ({
  transform: `scaleX(${carFacingRight.value ? 1 : -1})`,
}));

const updateCarPosition = (menuId, animate = true) => {
  const nav = navRef.value;
  const item = menuItemRefs.value[menuId];
  if (!nav || !item) return;

  const navRect = nav.getBoundingClientRect();
  const labelEl = item.querySelector(".nav-label");
  const targetRect = labelEl
    ? labelEl.getBoundingClientRect()
    : item.getBoundingClientRect();
  const nextCenter =
    targetRect.left - navRect.left + targetRect.width / 2;

  if (animate && indicatorReady.value) {
    carFacingRight.value = nextCenter >= carLeft.value;
    isDriving.value = true;
    if (driveTimer) clearTimeout(driveTimer);
    driveTimer = setTimeout(() => {
      isDriving.value = false;
    }, DRIVE_MS);
  }

  carLeft.value = nextCenter;
  indicatorReady.value = true;
};

const activateMenu = (m, { navigate = true, animate = true } = {}) => {
  if (!m) return;
  activeMenu.value = m.id;
  globalStore.setMenuBarList(m.children || []);
  if (navigate && m.children?.length > 0) {
    router.push(m.children[0].path);
  }
  nextTick(() => updateCarPosition(m.id, animate));
};

const syncActiveFromRoute = () => {
  const path = route.path;
  const top = menuList.find((m) => path.startsWith(m.path));
  if (!top) return;

  const menuChanged = top.id !== activeMenu.value;
  activeMenu.value = top.id;
  globalStore.setMenuBarList(top.children || []);
  nextTick(() => updateCarPosition(top.id, menuChanged));
};

const onMenuChange = (m) => {
  activateMenu(m, { navigate: true, animate: true });
};

const goHome = () => {
  activateMenu(menuList[0], { navigate: true, animate: true });
};

const openSettings = () => {
  globalStore.setThemeVisible(true);
};
const openNotifications = () => {
  ElMessage.info("暂无通知");
};

const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    sessionStorage.removeItem("casToken");
    sessionStorage.removeItem("userName");
    window.dispatchEvent(new Event("user-logout"));
    ElMessage.success("已退出登录");
    router.push("/login");
  });
};

let resizeObserver = null;

onMounted(() => {
  syncActiveFromRoute();

  resizeObserver = new ResizeObserver(() => {
    updateCarPosition(activeMenu.value, false);
  });
  if (navRef.value) resizeObserver.observe(navRef.value);
  window.addEventListener("resize", onWindowResize);
});

const onWindowResize = () => {
  updateCarPosition(activeMenu.value, false);
};

onUnmounted(() => {
  resizeObserver?.disconnect();
  window.removeEventListener("resize", onWindowResize);
  if (driveTimer) clearTimeout(driveTimer);
});

watch(
  () => route.path,
  () => {
    syncActiveFromRoute();
  },
);
</script>

<style scoped>
.nav-menu {
  min-width: 0;
  align-items: stretch;
  padding-bottom: 0;
}

.nav-item {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 0 1.75rem 1.65rem;
  cursor: pointer;
}

.nav-label {
  font-size: 1.15rem;
  font-weight: 700;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.72);
  transition: color 0.25s ease;
}

.nav-item:hover .nav-label {
  color: rgba(255, 255, 255, 0.92);
}

.nav-label--active {
  color: #fff;
}

/* 全宽路面：车在虚线车道中央行驶 */
.nav-road {
  --road-h: 14px;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--road-h);
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.nav-road--ready {
  opacity: 1;
}

.nav-road__surface {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: stretch;
  border-radius: 2px;
  overflow: visible;
  background: linear-gradient(180deg,
      rgba(0, 0, 0, 0.06) 0%,
      rgba(0, 0, 0, 0.2) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 0 6px rgba(255, 255, 255, 0.1);
}

.nav-road__edge {
  flex-shrink: 0;
  width: 3px;
  background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 255, 255, 0.55) 100%);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.45);
}

.nav-road__lane {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 6px;
}

.nav-road__dash {
  width: 100%;
  height: 2px;
  border-radius: 1px;
  background: repeating-linear-gradient(90deg,
      rgba(255, 255, 255, 0.85) 0,
      rgba(255, 255, 255, 0.85) 10px,
      transparent 10px,
      transparent 20px);
  background-size: 20px 2px;
  opacity: 0.75;
}

/* 车压在路面虚线上（垂直居中于车道） */
.nav-car {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%);
  transform-origin: center center;
  pointer-events: none;
  opacity: 0;
  will-change: left;
  transition:
    left 0.78s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.35s ease;
}

.nav-car--ready {
  opacity: 1;
}

.nav-car__body {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.nav-car__flip {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-car__body::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 55%;
  width: 26px;
  height: 12px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(ellipse,
      rgba(255, 255, 255, 0.4) 0%,
      transparent 72%);
  z-index: -1;
}

.nav-car__icon {
  font-size: 1.35rem;
  line-height: 1;
  color: #fff;
  display: block;
  filter:
    drop-shadow(0 0 2px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.65)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
}

.nav-road--driving .nav-road__dash {
  animation: road-dash-scroll 0.5s linear infinite;
  opacity: 1;
}

.nav-car--driving .nav-car__body {
  animation: car-on-road 0.45s ease-in-out infinite alternate;
}

.nav-car--driving .nav-car__icon {
  filter:
    drop-shadow(0 0 3px rgba(255, 255, 255, 1)) drop-shadow(0 0 12px rgba(255, 255, 255, 0.85)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
}

.nav-car--ready:not(.nav-car--driving) .nav-car__body::before {
  animation: car-idle-glow 2.8s ease-in-out infinite;
}

@keyframes road-dash-scroll {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 20px 0;
  }
}

@keyframes car-on-road {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-1px);
  }
}

@keyframes car-idle-glow {

  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 0.9;
  }
}
</style>
