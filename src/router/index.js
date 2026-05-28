import { createRouter, createWebHashHistory } from "vue-router";
import registerRouterHook from "./routerPermission.js";
import Home from "@/pages/Home.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/login/Login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/pages/login/Register.vue"),
  },
  {
    path: "/",
    component: Home,
    redirect: "/onemap/realtime",
    children: [
      {
        path: "onemap",
        name: "OneMap",
        children: [
          {
            path: "realtime",
            name: "Realtime",
            component: () => import("@/pages/onemap/CarQuery.vue"),
          },
          {
            path: "comprehensive",
            name: "Comprehensive",
            component: () => import("@/pages/onemap/Comprehensive.vue"),
          },
          {
            path: "trajectory",
            name: "Trajectory",
            component: () => import("@/pages/onemap/Trajectory.vue"),
          },
        ],
      },
      {
        path: "quyu",
        name: "Quyu",
        children: [
          {
            path: "processAuditForLine",
            name: "ProcessAuditForLine",
            component: () => import("@/pages/quyu/ProcessAuditForLine.vue"),
          },
          {
            path: "processAuditForResLine",
            name: "processAuditForResLine",
            component: () => import("@/pages/quyu/ProcessAuditForLine.vue"),
          },
          {
            path: "processAuditForArea",
            name: "ProcessAuditForArea",
            component: () => import("@/pages/quyu/ProcessAuditForArea.vue"),
          },
          {
            path: "processAuditForParking",
            name: "ProcessAuditForParking",
            component: () => import("@/pages/quyu/ProcessAuditForParking.vue"),
          },
          {
            path: "spaceEdit",
            name: "SpaceEdit",
            component: () => import("@/pages/quyu/SpaceEdit.vue"),
          },
          {
            path: "areaInfo",
            name: "AreaInfo",
            component: () => import("@/pages/quyu/AreaInfo.vue"),
          },
          {
            path: "recordQuery",
            name: "RecordQuery",
            component: () => import("@/pages/quyu/RecordQuery.vue"),
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// registerRouterHook(router)
export default router;
