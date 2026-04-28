const PROPERTY_TYPE = [
  { name: '点选', key: 'Point' },
  { name: '框选', key: 'Box' },
  { name: '多边形', key: 'Polygon' },
];
/**
 * isActivate: 工具栏中是否具有激活效果
 */
const MAP_TOOLS = [
  {
    name: 'full-extent',
    icon: 'icon-quantu',
    title: '全图',
    isActivate: false,
  },
  {
    name: 'property-info',
    icon: 'icon-shuxing',
    title: '属性',
    isActivate: true,
  },
  { name: 'distance', icon: 'icon-ceju', title: '测距', isActivate: true },
  {
    name: 'draw-polygon',
    icon: 'icon-cemian',
    title: '画面',
    isActivate: true,
  },
  { name: 'fresh', icon: 'icon-shuaxin', title: '刷新', isActivate: false },
  { name: 'clear', icon: 'icon-qingchu', title: '清除', isActivate: false },
  { name: 'scale', icon: 'icon-bili', title: '比例尺', isActivate: false },
];

const SCALE_LEVEL = window.Map2DConfig.scaleLevel;

export { PROPERTY_TYPE, MAP_TOOLS, SCALE_LEVEL };
