<template>
  <div class="thousand-images-container">
    <div class="header">
      <h2>1000图训练</h2>
      <p>通过快速识别和记忆大量图像，提升视觉记忆能力</p>
    </div>

    <div class="training-area">
      <div class="image-display" v-if="currentImage">
        <img :src="currentImage.url" :alt="currentImage.name" />
        <div class="image-info">
          <p>图像 {{ currentImageIndex + 1 }} / {{ totalImages }}</p>
          <p>{{ currentImage.name }}</p>
        </div>
      </div>

      <div class="controls">
        <button @click="startTraining" :disabled="isTraining" class="btn-primary">
          开始训练
        </button>
        <button @click="pauseTraining" :disabled="!isTraining" class="btn-secondary">
          暂停
        </button>
        <button @click="resetTraining" class="btn-secondary">
          重置
        </button>
      </div>

      <div class="settings">
        <div class="setting-item">
          <label>显示时间 (秒):</label>
          <input v-model.number="displayTime" type="number" min="0.1" max="5" step="0.1" />
        </div>
        <div class="setting-item">
          <label>间隔时间 (秒):</label>
          <input v-model.number="intervalTime" type="number" min="0.1" max="3" step="0.1" />
        </div>
      </div>

      <div class="progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <p>进度: {{ currentImageIndex }} / {{ totalImages }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// 响应式数据
const currentImage = ref(null)
const currentImageIndex = ref(0)
const totalImages = ref(1000)
const isTraining = ref(false)
const displayTime = ref(1.0)
const intervalTime = ref(0.5)
const trainingTimer = ref(null)

// 计算属性
const progressPercentage = computed(() => {
  return totalImages.value > 0 ? (currentImageIndex.value / totalImages.value) * 100 : 0
})

// 模拟图像数据
const generateImageData = () => {
  const images = []
  for (let i = 1; i <= totalImages.value; i++) {
    images.push({
      id: i,
      name: `图像${i}`,
      url: `https://picsum.photos/400/300?random=${i}`
    })
  }
  return images
}

const imageData = ref(generateImageData())

// 训练方法
const startTraining = () => {
  if (currentImageIndex.value >= totalImages.value) {
    currentImageIndex.value = 0
  }
  
  isTraining.value = true
  showNextImage()
}

const pauseTraining = () => {
  isTraining.value = false
  if (trainingTimer.value) {
    clearTimeout(trainingTimer.value)
    trainingTimer.value = null
  }
}

const resetTraining = () => {
  pauseTraining()
  currentImageIndex.value = 0
  currentImage.value = null
}

const showNextImage = () => {
  if (!isTraining.value || currentImageIndex.value >= totalImages.value) {
    isTraining.value = false
    return
  }

  currentImage.value = imageData.value[currentImageIndex.value]
  
  trainingTimer.value = setTimeout(() => {
    currentImage.value = null
    
    setTimeout(() => {
      currentImageIndex.value++
      showNextImage()
    }, intervalTime.value * 1000)
  }, displayTime.value * 1000)
}

// 生命周期
onMounted(() => {
  // 初始化
})

onBeforeUnmount(() => {
  pauseTraining()
})
</script>

<style scoped>
.thousand-images-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.training-area {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.image-display {
  text-align: center;
  margin-bottom: 30px;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.image-display img {
  max-width: 400px;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.image-info {
  margin-top: 15px;
}

.image-info p {
  margin: 5px 0;
  color: #666;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #7f8c8d;
}

.btn-primary:disabled, .btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.settings {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-item label {
  font-weight: bold;
  color: #2c3e50;
}

.setting-item input {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 80px;
}

.progress {
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background-color: #3498db;
  transition: width 0.3s ease;
}

.progress p {
  color: #666;
  margin: 0;
}
</style>