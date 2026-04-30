<template>
  <div class="text-black rounded-md p-3 bg-white min-w-[200px]">
    <div class="flex items-center justify-between border-b border-gray-200">
      <h3>{{ title }}</h3>
      <div class="hover:cursor-pointer" @click="onClose">X</div>
    </div>
    <div class="px-1">
      <p>经度: {{ coordinates[0].toFixed(2) }}</p>
      <p
        class="hover-pointer text-blue-500"
        @click.stop="copyToClipboard(coordinates[1].toFixed(2))"
      >
        纬度: {{ coordinates[1].toFixed(2) }}
      </p>

      <div class="demo-collapse">
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item title="Consistency" name="1">
        <div>
          Consistent with real life: in line with the process and logic of real
          life, and comply with languages and habits that the users are used to;
        </div>
        <div>
          Consistent within interface: all elements should be consistent, such
          as: design style, icons and texts, position of elements, etc.
        </div>
      </el-collapse-item>
      <el-collapse-item title="Feedback" name="2">
        <div>
          Operation feedback: enable the users to clearly perceive their
          operations by style updates and interactive effects;
        </div>
        <div>
          Visual feedback: reflect current state by updating or rearranging
          elements of the page.
        </div>
      </el-collapse-item>
      <el-collapse-item title="Efficiency" name="3">
        <div>
          Simplify the process: keep operating process simple and intuitive;
        </div>
        <div>
          Definite and clear: enunciate your intentions clearly so that the
          users can quickly understand and make decisions;
        </div>
        <div>
          Easy to identify: the interface should be straightforward, which helps
          the users to identify and frees them from memorizing and recalling.
        </div>
      </el-collapse-item>
      <el-collapse-item title="Controllability" name="4">
        <div>
          Decision making: giving advice about operations is acceptable, but do
          not make decisions for the users;
        </div>
        <div>
          Controlled consequences: users should be granted the freedom to
          operate, including canceling, aborting or terminating current
          operation.
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const activeNames = ref(['1'])
const handleChange = (val) => {
  console.log(val)
}
const copyToClipboard = (text) => {
  const input = document.createElement("input");
  alert("1212");
};
defineProps({
  title: {
    type: String,
    default: "点击位置",
  },
  coordinates: {
    type: Array,
    required: true,
  },
  openPopup: {
    type: Boolean,
  },
  onClose: {
    type: Function,
    required: true,
  },
});
</script>

<style scoped></style>
