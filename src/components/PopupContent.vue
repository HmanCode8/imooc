<template>
    <div class="text-black p-3 bg-white">
        <h3>{{ title }}</h3>
        <p>经度: {{ coordinates[0] }}</p>
        <p>纬度: {{ coordinates[1] }}</p>
        <button @click="onClose">关闭</button>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        default: '点击位置',
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
})
</script>

<style scoped></style>