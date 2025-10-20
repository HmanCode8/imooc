<template>
  <div ref="rootEl" :style="wrapperStyle" class="draggable-slot" @mousedown="onMouseDown"
    @touchstart.passive="onTouchStart">
    <slot />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  zIndex: { type: Number, default: 1000 },
  disabled: { type: Boolean, default: false },
  // 可选：限定拖拽手柄，传入选择器（例如 '.header'）
  handle: { type: String, default: '' },
  // 可选：是否限制在窗口内
  constrainToWindow: { type: Boolean, default: true }
})

const emit = defineEmits(['update:x', 'update:y', 'drag-start', 'dragging', 'drag-end'])

const rootEl = ref(null)
const pos = ref({ x: props.x, y: props.y })
let dragging = false
let start = { x: 0, y: 0 }
let startPos = { x: 0, y: 0 }

watch(() => props.x, v => { if (!dragging) pos.value.x = v })
watch(() => props.y, v => { if (!dragging) pos.value.y = v })

const wrapperStyle = computed(() => ({
  position: 'absolute',
  left: pos.value.x + 'px',
  top: pos.value.y + 'px',
  zIndex: String(props.zIndex),
  cursor: props.disabled ? 'default' : 'move',
  userSelect: dragging ? 'none' : ''
}))

function getHandleTarget(e) {
  if (!props.handle) return rootEl.value
  const target = rootEl.value?.querySelector(props.handle)
  return target || rootEl.value
}

function withinWindowBounds(nx, ny) {
  if (!props.constrainToWindow || !rootEl.value) return { x: nx, y: ny }
  const el = rootEl.value
  const rect = el.getBoundingClientRect()
  const w = window.innerWidth
  const h = window.innerHeight
  const width = rect.width
  const height = rect.height
  const xMin = 0
  const yMin = 0
  const xMax = Math.max(0, w - width)
  const yMax = Math.max(0, h - height)
  return { x: Math.min(Math.max(nx, xMin), xMax), y: Math.min(Math.max(ny, yMin), yMax) }
}

function startDrag(clientX, clientY, targetEl) {
  if (props.disabled) return
  const handleEl = getHandleTarget()
  if (handleEl && targetEl && props.handle && !handleEl.contains(targetEl)) return
  dragging = true
  start = { x: clientX, y: clientY }
  startPos = { ...pos.value }
  emit('drag-start', { x: pos.value.x, y: pos.value.y })
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd)
}

function onMouseDown(e) {
  startDrag(e.clientX, e.clientY, e.target)
}

function onMouseMove(e) {
  if (!dragging) return
  e.preventDefault()
  const dx = e.clientX - start.x
  const dy = e.clientY - start.y
  const next = withinWindowBounds(startPos.x + dx, startPos.y + dy)
  pos.value = next
  emit('dragging', next)
}

function onMouseUp() {
  if (!dragging) return
  dragging = false
  emit('update:x', pos.value.x)
  emit('update:y', pos.value.y)
  emit('drag-end', { x: pos.value.x, y: pos.value.y })
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
}

function onTouchStart(e) {
  const t = e.touches[0]
  if (!t) return
  startDrag(t.clientX, t.clientY, e.target)
}

function onTouchMove(e) {
  if (!dragging) return
  e.preventDefault()
  const t = e.touches[0]
  if (!t) return
  const dx = t.clientX - start.x
  const dy = t.clientY - start.y
  const next = withinWindowBounds(startPos.x + dx, startPos.y + dy)
  pos.value = next
  emit('dragging', next)
}

function onTouchEnd() {
  onMouseUp()
}

onMounted(() => {
  // 初始约束一次，避免初始位置超出窗口
  const next = withinWindowBounds(pos.value.x, pos.value.y)
  pos.value = next
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
})

defineExpose({
  setPosition: (x, y) => { pos.value = withinWindowBounds(x, y) },
  getPosition: () => ({ ...pos.value })
})
</script>

<style scoped>
.draggable-slot {
  /* 让内部元素可以自定义 pointer 事件 */
}
</style>
