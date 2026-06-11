<template>
  <el-dialog
    v-model="visible"
    title="上传头像"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="avatar-uploader">
      <div v-if="!imageSrc" class="upload-placeholder">
        <el-upload
          class="upload-demo"
          drag
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          accept="image/*"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将图片拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 jpg/png 文件，且不超过 5MB
            </div>
          </template>
        </el-upload>
      </div>
      <div v-else class="crop-container">
        <div class="crop-area" ref="cropAreaRef">
          <img :src="imageSrc" ref="imageRef" @load="onImageLoad" />
          <div
            class="crop-box"
            :style="cropBoxStyle"
            @mousedown="startCropDrag"
            @touchstart="startCropDrag"
          >
            <div class="crop-handle nw" @mousedown.stop="startResize('nw', $event)" @touchstart.stop="startResize('nw', $event)"></div>
            <div class="crop-handle n" @mousedown.stop="startResize('n', $event)" @touchstart.stop="startResize('n', $event)"></div>
            <div class="crop-handle ne" @mousedown.stop="startResize('ne', $event)" @touchstart.stop="startResize('ne', $event)"></div>
            <div class="crop-handle e" @mousedown.stop="startResize('e', $event)" @touchstart.stop="startResize('e', $event)"></div>
            <div class="crop-handle se" @mousedown.stop="startResize('se', $event)" @touchstart.stop="startResize('se', $event)"></div>
            <div class="crop-handle s" @mousedown.stop="startResize('s', $event)" @touchstart.stop="startResize('s', $event)"></div>
            <div class="crop-handle sw" @mousedown.stop="startResize('sw', $event)" @touchstart.stop="startResize('sw', $event)"></div>
            <div class="crop-handle w" @mousedown.stop="startResize('w', $event)" @touchstart.stop="startResize('w', $event)"></div>
          </div>
        </div>
        <div class="preview-area">
          <div class="preview-title">预览</div>
          <div class="preview-box">
            <canvas ref="previewCanvasRef" width="200" height="200"></canvas>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="imageSrc" @click="handleReset">重新选择</el-button>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :disabled="!imageSrc" :loading="uploading" @click="handleConfirm">
          确认上传
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { UploadFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  modelValue: Boolean,
  username: String,
});

const emit = defineEmits(["update:modelValue", "success"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const imageSrc = ref("");
const uploading = ref(false);
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
  minSize: 50,
});

const cropBoxStyle = computed(() => ({
  left: `${cropBox.value.x}px`,
  top: `${cropBox.value.y}px`,
  width: `${cropBox.value.size}px`,
  height: `${cropBox.value.size}px`,
}));

let dragState = null;
let resizeState = null;

const handleFileChange = (file) => {
  const rawFile = file.raw;
  if (!rawFile) return;

  if (!rawFile.type.startsWith("image/")) {
    ElMessage.error("只能上传图片文件");
    return;
  }

  if (rawFile.size > 5 * 1024 * 1024) {
    ElMessage.error("图片大小不能超过 5MB");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    imageSrc.value = e.target.result;
  };
  reader.readAsDataURL(rawFile);
};

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

    cropBox.value.size = Math.min(displayWidth, displayHeight) * 0.6;
    cropBox.value.x = offsetX + (displayWidth - cropBox.value.size) / 2;
    cropBox.value.y = offsetY + (displayHeight - cropBox.value.size) / 2;

    updatePreview();
  });
};

const updatePreview = () => {
  const canvas = previewCanvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const img = imageRef.value;
  if (!img) return;

  const { naturalWidth, naturalHeight, displayWidth, displayHeight, offsetX, offsetY } = imageData.value;
  const scaleX = naturalWidth / displayWidth;
  const scaleY = naturalHeight / displayHeight;

  const sx = (cropBox.value.x - offsetX) * scaleX;
  const sy = (cropBox.value.y - offsetY) * scaleY;
  const sw = cropBox.value.size * scaleX;
  const sh = cropBox.value.size * scaleY;

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
    const newX = Math.max(offsetX, Math.min(offsetX + displayWidth - cropBox.value.size, dragState.boxX + dx));
    const newY = Math.max(offsetY, Math.min(offsetY + displayHeight - cropBox.value.size, dragState.boxY + dy));

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

    const delta = Math.max(dx, dy);

    switch (handle) {
      case "se":
        newSize = Math.max(cropBox.value.minSize, Math.min(displayWidth - (resizeState.boxX - offsetX), displayHeight - (resizeState.boxY - offsetY), resizeState.boxSize + delta));
        break;
      case "nw":
        newSize = Math.max(cropBox.value.minSize, Math.min(resizeState.boxX - offsetX + resizeState.boxSize, resizeState.boxY - offsetY + resizeState.boxSize, resizeState.boxSize - delta));
        newX = resizeState.boxX + (resizeState.boxSize - newSize);
        newY = resizeState.boxY + (resizeState.boxSize - newSize);
        break;
      case "ne":
        newSize = Math.max(cropBox.value.minSize, Math.min(offsetX + displayWidth - resizeState.boxX, resizeState.boxY - offsetY + resizeState.boxSize, resizeState.boxSize + dx));
        newY = resizeState.boxY + (resizeState.boxSize - newSize);
        break;
      case "sw":
        newSize = Math.max(cropBox.value.minSize, Math.min(resizeState.boxX - offsetX + resizeState.boxSize, offsetY + displayHeight - resizeState.boxY, resizeState.boxSize + dy));
        newX = resizeState.boxX + (resizeState.boxSize - newSize);
        break;
      case "n":
        newSize = Math.max(cropBox.value.minSize, Math.min(resizeState.boxY - offsetY + resizeState.boxSize, resizeState.boxSize - dy));
        newY = resizeState.boxY + (resizeState.boxSize - newSize);
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
  const sh = cropBox.value.size * scaleY;

  const outputSize = 400;
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputSize, outputSize);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  });
};

const handleConfirm = async () => {
  if (!imageSrc.value) return;

  const file = await getCroppedImage();
  if (!file) return;

  emit("success", file);
};

const handleReset = () => {
  imageSrc.value = "";
  cropBox.value = { x: 0, y: 0, size: 150, minSize: 50 };
};

const handleClose = () => {
  visible.value = false;
  handleReset();
};
</script>

<style scoped>
.avatar-uploader {
  min-height: 300px;
}

.upload-placeholder {
  width: 100%;
}

.crop-container {
  display: flex;
  gap: 24px;
  height: 350px;
}

.crop-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crop-area img {
  max-width: 100%;
  max-height: 100%;
  display: block;
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
  width: 12px;
  height: 12px;
  background: #409eff;
  border: 2px solid #fff;
  border-radius: 50%;
}

.crop-handle.nw { top: -6px; left: -6px; cursor: nw-resize; }
.crop-handle.n { top: -6px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
.crop-handle.ne { top: -6px; right: -6px; cursor: ne-resize; }
.crop-handle.e { right: -6px; top: 50%; transform: translateY(-50%); cursor: e-resize; }
.crop-handle.se { bottom: -6px; right: -6px; cursor: se-resize; }
.crop-handle.s { bottom: -6px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
.crop-handle.sw { bottom: -6px; left: -6px; cursor: sw-resize; }
.crop-handle.w { left: -6px; top: 50%; transform: translateY(-50%); cursor: w-resize; }

.preview-area {
  width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.preview-box {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e4e7ed;
}

.preview-box canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
