<script setup>
import { onMounted, ref } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: window.global_config.map.mapType,
  },
});
const emits = defineEmits(["update:modelValue"]);

const mapTypes = ref(window.mapList);
const typeTo = ref("leave");

const onMouse = (type) => {
  typeTo.value = type === "enter" ? "leave" : "enter";
  const item1 = document.querySelector(".wrap-item-0");

  const width1 = item1.offsetWidth;
  item1.style.right = `${type === "enter" ? width1 * 1 : 10}px`;
 
};

/**
 * 为了适配浏览器的仿真模式的hover事件效果，生产需要去掉
 */
const onMapTypeClick = () => {
  onMouse(typeTo.value);
};

onMounted(() => {
  onMouse("leave");
});
</script>

<template>
  <div class="">
    <div
      class="map-type relative bg-1 w-20 h-14 flex"
      @mouseenter="onMouse('enter')"
      @mouseleave="onMouse('leave')"
      @click="onMapTypeClick"
    >
      <div
        :class="`wrap-item-${index} group absolute duration-300 ease-in-out px-1 rounded-sm w-20 h-14 ${modelValue === type.value ? 'active' : ''}`"
        @click="emits('update:modelValue', type.value)"
        v-for="(type, index) in mapTypes"
        :key="type.value"
      >
        <div
          :class="`map-type-item-${index}  rounded-sm w-full h-full p-5 border-2 relative hover:cursor-pointer`"
        >
          <div
            :class="`absolute ${modelValue === type.value ? 'theme-bg' : ''} group-hover:theme-active text-sm p-1 ${type.value === 'imageswmts' ? 'text-white' : ''} text-center bottom-0 right-0`"
          >
            {{ type.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.map-type {
  .map-type-item-0 {
    background-image: url("@/assets/maps/vec_map.png");
    background-size: 100% 100%;
    border-color: #FFF;
  }


  .map-type-item-1 {
    background-image: url("@/assets/maps/img_map.png");
    background-size: 100% 100%;
    border-color: #FFF;

  }
}
</style>
