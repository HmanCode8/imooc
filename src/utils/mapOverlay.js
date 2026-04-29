import { Overlay } from "ol";
import { createApp } from "vue";

export default class Popup {
    constructor(map) {
        if (!map) {
            throw new Error('map 实例不能为空！');
        }
        this.map = map;

        // 创建一个 div 来容纳弹窗内容
        this.popupElement = document.createElement('div');
        this.popupElement.className = 'ol-popup';

        // 在地图中添加 Overlay
        this.popup = new Overlay({
            element: this.popupElement,
            positioning: 'bottom-center',  // 定位方式
            stopEvent: false,  // 不阻止事件
        });

        // 添加 Overlay 到地图
        map.addOverlay(this.popup);

        // 在弹窗内插入关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'ol-popup-closer';
        closeButton.innerHTML = '×';
        closeButton.onclick = this.close.bind(this); // 绑定关闭事件

        this.popupElement.appendChild(closeButton);

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
        // 移除 Overlay 和 Vue 组件
        // this.popup.setPosition(undefined); // 设置位置为空，关闭弹窗

        // 销毁 Vue 组件实例
        if (this.vueApp) {
            this.vueApp.unmount();
            this.vueApp = null;
        }
    }
}