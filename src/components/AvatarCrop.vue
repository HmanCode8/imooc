<template>
  <el-dialog
    v-model="visible"
    title="调整头像"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :append-to-body="appendToBody"
    @closed="handleClosed"
  >
    <div class="avatar-crop-container">
      <div v-if="imageSrc" class="crop-wrapper">
        <div
          ref="cropAreaRef"
          class="crop-area"
          :style="{ height: cropAreaHeight }"
        >
          <img
            :src="imageSrc"
            ref="imageRef"
            @load="onImageLoad"
            :style="imageStyle"
          />
          <div
            class="crop-box"
            :style="cropBoxStyle"
            @mousedown="startCropDrag"
            @touchstart="startCropDrag"
          >
            <div v-for="handle in cropHandles" :key="handle" class="crop-handle" :class="handle"
              @mousedown.stop="startResize(handle, $event)"
              @touchstart.stop="startResize(handle, $event)"
            ></div>
          </div>
        </div>
        <div class="preview-wrapper">
          <div class="preview-label">预览</div>
          <div class="preview-box" :style="{ width: previewSize + 'px', height: previewSize + 'px' }">
            <canvas
              ref="previewCanvasRef"
              :width="previewSize"
              :height="previewSize"
              class="preview-canvas"
            ></canvas>
          </div>
        </div>
      </div>
      <el-empty v-else description="请上传图片" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" :disabled="!imageSrc" @click="handleConfirm">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, nextTick, watch } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  modelValue: Boolean,
  src: { type: String, default: "" },
  dialogWidth: { type: String, default: "520px" },
  cropAreaHeight: { type: String, default: "288px" },
  previewSize: { type: Number, default: 96 },
  outputSize: { type: Number, default: 400 },
  outputType: { type: String, default: "image/jpeg" },
  outputQuality: { type: Number, default: 0.9 },
  appendToBody: { type: Boolean, default: true },
  aspectRatio: { type: Number, default: 1 },
  minSize: { type: Number, default: 50 },
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel", "closed"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const imageSrc = computed({
  get: () => props.src,
  set: (val) => {},
});

const cropHandles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
const loading = ref(false);
const cropAreaRef = ref(null);
const imageRef = ref(null);
const previewCanvasRef = ref(null);

const imageData = ref({
  naturalWidth: 0,
  naturalHeight: 0,
  displayWidth: 0,
  displayHeight: 0,
  offsetX: 0,
  offsetY: 0,
});

const cropBox = ref({
  x: 0,
  y: 0,
  size: 150,
  minSize: props.minSize,
});

const imageStyle = computed(() => ({
  width: `${imageData.value.displayWidth}px`,
  height: `${imageData.value.displayHeight}px`,
  maxWidth: "none",
  maxHeight: "none",
  display: "block",
}));

const cropBoxStyle = computed(() => ({
  left: `${cropBox.value.x}px`,
  top: `${cropBox.value.y}px`,
  width: `${cropBox.value.size}px`,
  height: `${cropBox.value.size / props.aspectRatio}px`,
}));

let dragState = null;
let resizeState = null;

const onImageLoad = () => {
  nextTick(() => {
    const img = imageRef.value;
    const cropArea = cropAreaRef.value;
    if (!img || !cropArea) return;

    const containerWidth = cropArea.clientWidth;
    const containerHeight = cropArea.clientHeight;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = containerWidth / containerHeight;

    let displayWidth, displayHeight, offsetX, offsetY;

    if (imgRatio > containerRatio) {
      displayWidth = containerWidth;
      displayHeight = containerWidth / imgRatio;
      offsetX = 0;
      offsetY = (containerHeight - displayHeight) / 2;
    } else {
      displayHeight = containerHeight;
      displayWidth = containerHeight * imgRatio;
      offsetX = (containerWidth - displayWidth) / 2;
      offsetY = 0;
    }

    imageData.value = {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth,
      displayHeight,
      offsetX,
      offsetY,
    };

    const initialSize = Math.min(displayWidth, displayHeight) * 0.6;
    cropBox.value.size = initialSize;
    cropBox.value.x = offsetX + (displayWidth - initialSize) / 2;
    cropBox.value.y = offsetY + (displayHeight - initialSize / props.aspectRatio) / 2;

    updatePreview();
  });
};

const updatePreview = () => {
  const canvas = previewCanvasRef.value;
  const img = imageRef.value;
  if (!canvas || !img) return;

  const ctx = canvas.getContext("2d");
  const { naturalWidth, naturalHeight, displayWidth, displayHeight, offsetX, offsetY } = imageData.value;
  const scaleX = naturalWidth / displayWidth;
  const scaleY = naturalHeight / displayHeight;

  const sx = (cropBox.value.x - offsetX) * scaleX;
  const sy = (cropBox.value.y - offsetY) * scaleY;
  const sw = cropBox.value.size * scaleX;
  const sh = (cropBox.value.size / props.aspectRatio) * scaleY;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
};

const startCropDrag = (e) => {
  e.preventDefault();
  const startX = e.clientX || e.touches[0].clientX;
  const startY = e.clientY || e.touches[0].clientY;
  dragState = {
    startX,
    startY,
    boxX: cropBox.value.x,
    boxY: cropBox.value.y,
  };

  const onMove = (e) => {
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    const dx = clientX - dragState.startX;
    const dy = clientY - dragState.startY;

    const { offsetX, offsetY, displayWidth, displayHeight } = imageData.value;
    const cropHeight = cropBox.value.size / props.aspectRatio;
    const newX = Math.max(offsetX, Math.min(offsetX + displayWidth - cropBox.value.size, dragState.boxX + dx));
    const newY = Math.max(offsetY, Math.min(offsetY + displayHeight - cropHeight, dragState.boxY + dy));

    cropBox.value.x = newX;
    cropBox.value.y = newY;
    updatePreview();
  };

  const onEnd = () => {
    dragState = null;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onEnd);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onEnd);
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onEnd);
  document.addEventListener("touchmove", onMove, { passive: false });
  document.addEventListener("touchend", onEnd);
};

const startResize = (handle, e) => {
  e.preventDefault();
  const startX = e.clientX || e.touches[0].clientX;
  const startY = e.clientY || e.touches[0].clientY;
  resizeState = {
    handle,
    startX,
    startY,
    boxX: cropBox.value.x,
    boxY: cropBox.value.y,
    boxSize: cropBox.value.size,
  };

  const onMove = (e) => {
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    const dx = clientX - resizeState.startX;
    const dy = clientY - resizeState.startY;

    const { offsetX, offsetY, displayWidth, displayHeight } = imageData.value;
    let newSize = resizeState.boxSize;
    let newX = resizeState.boxX;
    let newY = resizeState.boxY;
    const cropHeight = resizeState.boxSize / props.aspectRatio;

    switch (handle) {
      case "se":
        newSize = Math.max(cropBox.value.minSize, Math.min(displayWidth - (resizeState.boxX - offsetX), displayHeight - (resizeState.boxY - offsetY), resizeState.boxSize + Math.max(dx, dy)));
        break;
      case "nw":
        newSize = Math.max(cropBox.value.minSize, Math.min(resizeState.boxX - offsetX + resizeState.boxSize, resizeState.boxY - offsetY + cropHeight, resizeState.boxSize - Math.max(dx, dy)));
        newX = resizeState.boxX + (resizeState.boxSize - newSize);
        newY = resizeState.boxY + (cropHeight - newSize / props.aspectRatio);
        break;
      case "ne":
        newSize = Math.max(cropBox.value.minSize, Math.min(offsetX + displayWidth - resizeState.boxX, resizeState.boxY - offsetY + cropHeight, resizeState.boxSize + Math.max(dx, -dy)));
        newY = resizeState.boxY + (cropHeight - newSize / props.aspectRatio);
        break;
      case "sw":
        newSize = Math.max(cropBox.value.minSize, Math.min(resizeState.boxX - offsetX + resizeState.boxSize, offsetY + displayHeight - resizeState.boxY, resizeState.boxSize + Math.max(-dx, dy)));
        newX = resizeState.boxX + (resizeState.boxSize - newSize);
        break;
      case "n":
        newSize = Math.max(cropBox.value.minSize, Math.min(resizeState.boxY - offsetY + cropHeight, resizeState.boxSize - dy));
        newY = resizeState.boxY + (cropHeight - newSize / props.aspectRatio);
        break;
      case "s":
        newSize = Math.max(cropBox.value.minSize, Math.min(offsetY + displayHeight - resizeState.boxY, resizeState.boxSize + dy));
        break;
      case "w":
        newSize = Math.max(cropBox.value.minSize, Math.min(resizeState.boxX - offsetX + resizeState.boxSize, resizeState.boxSize - dx));
        newX = resizeState.boxX + (resizeState.boxSize - newSize);
        break;
      case "e":
        newSize = Math.max(cropBox.value.minSize, Math.min(offsetX + displayWidth - resizeState.boxX, resizeState.boxSize + dx));
        break;
    }

    cropBox.value.size = newSize;
    cropBox.value.x = newX;
    cropBox.value.y = newY;
    updatePreview();
  };

  const onEnd = () => {
    resizeState = null;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onEnd);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onEnd);
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onEnd);
  document.addEventListener("touchmove", onMove, { passive: false });
  document.addEventListener("touchend", onEnd);
};

const getCroppedImage = () => {
  const canvas = document.createElement("canvas");
  const img = imageRef.value;
  if (!img) return null;

  const { naturalWidth, naturalHeight, displayWidth, displayHeight, offsetX, offsetY } = imageData.value;
  const scaleX = naturalWidth / displayWidth;
  const scaleY = naturalHeight / displayHeight;

  const sx = (cropBox.value.x - offsetX) * scaleX;
  const sy = (cropBox.value.y - offsetY) * scaleY;
  const sw = cropBox.value.size * scaleX;
  const sh = (cropBox.value.size / props.aspectRatio) * scaleY;

  canvas.width = props.outputSize;
  canvas.height = props.outputSize / props.aspectRatio;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(new File([blob], "avatar.jpg", { type: props.outputType }));
      },
      props.outputType,
      props.outputQuality
    );
  });
};

const getCroppedImageDataUrl = () => {
  const canvas = document.createElement("canvas");
  const img = imageRef.value;
  if (!img) return null;

  const { naturalWidth, naturalHeight, displayWidth, displayHeight, offsetX, offsetY } = imageData.value;
  const scaleX = naturalWidth / displayWidth;
  const scaleY = naturalHeight / displayHeight;

  const sx = (cropBox.value.x - offsetX) * scaleX;
  const sy = (cropBox.value.y - offsetY) * scaleY;
  const sw = cropBox.value.size * scaleX;
  const sh = (cropBox.value.size / props.aspectRatio) * scaleY;

  canvas.width = props.outputSize;
  canvas.height = props.outputSize / props.aspectRatio;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL(props.outputType, props.outputQuality);
};

const handleConfirm = async () => {
  if (!imageSrc.value) return;

  loading.value = true;
  try {
    const file = await getCroppedImage();
    const dataUrl = getCroppedImageDataUrl();
    if (file) {
      emit("confirm", { file, dataUrl });
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("生成图片失败");
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  emit("cancel");
  visible.value = false;
};

const handleClosed = () => {
  reset();
  emit("closed");
};

const reset = () => {
  cropBox.value = { x: 0, y: 0, size: 150, minSize: props.minSize };
};

watch(
  () => props.src,
  (newSrc) => {
    if (newSrc) {
      nextTick(() => {
        if (imageRef.value && imageRef.value.complete) {
          onImageLoad();
        }
      });
    }
  }
);

defineExpose({
  getCroppedImage,
  getCroppedImageDataUrl,
  reset,
});
</script>

<style scoped>
.avatar-crop-container {
  min-height: 200px;
}

.crop-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.crop-area {
  position: relative;
  overflow: hidden;
  background: #f5f7fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e4e7ed;
}

.crop-box {
  position: absolute;
  border: 2px solid #409eff;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  cursor: move;
  box-sizing: border-box;
}

.crop-handle {
  position: absolute;
  width: 14px;
  height: 14px;
  background: #409eff;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.crop-handle.nw {
  top: -7px;
  left: -7px;
  cursor: nw-resize;
}
.crop-handle.n {
  top: -7px;
  left: 50%;
  transform: translateX(-50%);
  cursor: n-resize;
}
.crop-handle.ne {
  top: -7px;
  right: -7px;
  cursor: ne-resize;
}
.crop-handle.e {
  right: -7px;
  top: 50%;
  transform: translateY(-50%);
  cursor: e-resize;
}
.crop-handle.se {
  bottom: -7px;
  right: -7px;
  cursor: se-resize;
}
.crop-handle.s {
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
  cursor: s-resize;
}
.crop-handle.sw {
  bottom: -7px;
  left: -7px;
  cursor: sw-resize;
}
.crop-handle.w {
  left: -7px;
  top: 50%;
  transform: translateY(-50%);
  cursor: w-resize;
}

.preview-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.preview-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.preview-box {
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e4e7ed;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
