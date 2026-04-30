import { Overlay } from "ol";
import { createApp } from "vue";

export default class Popup {
    constructor(map) {
        if (!map) {
            throw new Error('map 实例不能为空！');
        }
        this.map = map || mapInstanceManager.getMapInstance();

        // 创建一个 div 来容纳弹窗内容
        this.popupElement = document.createElement('div');
        this.popupElement.className = 'ol-popup';

        // 在地图中添加 Overlay
        this.popup = new Overlay({
            element: this.popupElement,
            positioning: 'left-center',  // 定位方式
            stopEvent: true,  // 阻止事件冒泡到地图
        });

        // 添加 Overlay 到地图
        map.addOverlay(this.popup);

        // 用于保存 Vue 应用实例
        this.vueApp = null;
    }

    // 显示弹窗，传递 Vue 组件作为内容
    show(component, coordinates, props = {}) {
        // 清除旧的 Vue 组件
        if (this.vueApp) {
            this.vueApp.unmount();  // 销毁之前的 Vue 实例
            this.vueApp = null;
        }

        // 清空内容容器
        this.popupElement.innerHTML = '';

        // 创建 Vue 应用并挂载到临时 DOM 元素
        const container = document.createElement('div');
        this.popupElement.appendChild(container);

        // 创建 Vue 实例并传递坐标和其他 props
        this.vueApp = createApp(component, {
            ...props,
            coordinates, // 将坐标传递给 Vue 组件
            onClose: this.close.bind(this),  // 传递关闭弹窗的回调
        });

        // 将组件渲染到容器中
        this.vueApp.mount(container);

        // 设置弹窗位置
        this.popup.setPosition(coordinates);
    }

    // 关闭弹窗
    close() {
        // 设置位置为空，关闭弹窗
        this.popup.setPosition(undefined);

        // 销毁 Vue 组件实例
        if (this.vueApp) {
            this.vueApp.unmount();
            this.vueApp = null;
        }
    }
}