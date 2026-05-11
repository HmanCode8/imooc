import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/onemap/realtime",
  },
  {
    path: "/onemap",
    name: "OneMap",
    // component: Home,
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
    path: "/quyu",
    name: "Quyu",
    // component: Home,
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
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// registerRouterHook(router)
export default router;
