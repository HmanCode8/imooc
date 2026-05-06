const menuList = [
  {
    id: "onemap",
    path: "/onemap",
    name: "车辆动态一张图",
    icon: "icon-cheliangyizhangtu",
    children: [
      {
        id: "1",
        name: "车辆管理",
        icon: "icon-cheliangyizhangtu",
        path: "/onemap/realtime",
      },
      {
        id: "2",
        name: "综合数据",
        icon: "icon-zongheshujufenxi",
        path: "/onemap/comprehensive",
      },
      // { id: '6', name: '车辆轨迹分析', icon: 'icon-cheliangyizhangtu', path: '/onemap/trajectory' },
    ],
  },
  {
    id: "quyu",
    path: "/quyu",
    name: "道路测试路段区域管理",
    icon: "icon-quyuguanli",
    children: [
      {
        id: "1",
        name: "路段流程审核",
        icon: "icon-liuchengshenhe",
        path: "/quyu/processAuditForLine",
      },
      {
        id: "2",
        name: "区域流程审核",
        icon: "icon-liuchengshenhe",
        path: "/quyu/processAuditForArea",
      },
        {
        id: "3",
        name: "停车场流程审核",
        icon: "icon-liuchengshenhe",
        path: "/quyu/processAuditForParking",
      },
      // {
      //   id: "4",
      //   name: "空间实体在线编辑",
      //   icon: "icon-cheliangyizhangtu",
      //   path: "/quyu/spaceEdit",
      // },
      // {
      //   id: "5",
      //   name: "行政辖区及路段信息动态获取",
      //   icon: "icon-cheliangyizhangtu",
      //   path: "/quyu/areaInfo",
      // },
      // {
      //   id: "6",
      //   name: "台账查询",
      //   icon: "icon-cheliangyizhangtu",
      //   path: "/quyu/recordQuery",
      // },
    ],
  },
];

export { menuList };
