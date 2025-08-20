<template>
  <div class="custom-image-flash">

    <!-- 设置阶段 -->
    <div v-if="currentStage === 'setup'" class="setup-stage">
      <div class="page-header">
        <h1>自定义图片闪视训练</h1>
        <p class="page-description">
          上传您的图片，设置多组闪视参数，进行个性化的图像记忆训练
        </p>
      </div>

      <div class="setup-container">
        <!-- 图片上传区域 -->
        <div class="image-upload-section">
          <h3>图片上传</h3>
          
          <!-- 上传区域 -->
          <div class="upload-area">
            <div 
              class="upload-drop-zone" 
              @drop="handleImageDrop" 
              @dragover.prevent 
              @dragenter.prevent
              @click="$refs.imageInput.click()"
            >
              <input 
                type="file" 
                ref="imageInput" 
                @change="handleImageSelect" 
                accept="image/*"
                multiple
                style="display: none;"
              >
              <div class="upload-content">
                <div class="upload-icon">🖼️</div>
                <p>拖拽图片到此处或点击上传</p>
                <p class="upload-hint">支持 JPG、PNG、GIF 格式，可多选</p>
              </div>
            </div>
          </div>

          <!-- 图片预览 -->
          <div v-if="uploadedImages.length > 0" class="image-preview">
            <h4>已上传图片 ({{ uploadedImages.length }}张)</h4>
            <div class="image-grid">
              <div 
                v-for="(image, index) in uploadedImages" 
                :key="index" 
                class="image-item"
              >
                <img :src="image.url" :alt="image.name" class="preview-image">
                <div class="image-info">
                  <span class="image-name">{{ image.name }}</span>
                  <button @click="removeImage(index)" class="remove-btn">×</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 训练组设置 -->
        <div class="training-groups-section">
          <h3>训练组设置</h3>
          <p class="section-description">为不同的图片组设置不同的闪视参数</p>
          
          <div class="groups-container">
            <div 
              v-for="(group, groupIndex) in trainingGroups" 
              :key="groupIndex" 
              class="group-card"
            >
              <div class="group-header">
                <h4>训练组 {{ groupIndex + 1 }}</h4>
                <button 
                  v-if="trainingGroups.length > 1" 
                  @click="removeGroup(groupIndex)" 
                  class="remove-group-btn"
                >
                  删除
                </button>
              </div>

              <!-- 图片选择 -->
              <div class="group-images">
                <label>选择图片：</label>
                <div class="image-selector">
                  <div 
                    v-for="(image, imageIndex) in uploadedImages" 
                    :key="imageIndex" 
                    :class="['selectable-image', { selected: group.selectedImages.includes(imageIndex) }]"
                    @click="toggleImageSelection(groupIndex, imageIndex)"
                  >
                    <img :src="image.url" :alt="image.name">
                    <div class="selection-overlay">
                      <span class="check-icon">✓</span>
                    </div>
                  </div>
                </div>
                <div class="selection-info">
                  已选择 {{ group.selectedImages.length }} 张图片
                </div>
              </div>

              <!-- 参数设置 -->
              <div class="group-parameters">
                <div class="parameter-grid">
                  <div class="parameter-item">
                    <label>闪视速度</label>
                    <select v-model="group.params.speed">
                      <option value="2000">很慢 (2秒)</option>
                      <option value="1500">慢速 (1.5秒)</option>
                      <option value="1000">中速 (1秒)</option>
                      <option value="500">快速 (0.5秒)</option>
                      <option value="300">很快 (0.3秒)</option>
                      <option value="200">极速 (0.2秒)</option>
                    </select>
                  </div>

                  <div class="parameter-item">
                    <label>间隔时间</label>
                    <select v-model="group.params.interval">
                      <option value="500">0.5秒</option>
                      <option value="1000">1秒</option>
                      <option value="1500">1.5秒</option>
                      <option value="2000">2秒</option>
                    </select>
                  </div>

                  <div class="parameter-item">
                    <label>重复次数</label>
                    <select v-model="group.params.rounds">
                      <option value="1">1次</option>
                      <option value="2">2次</option>
                      <option value="3">3次</option>
                      <option value="5">5次</option>
                    </select>
                  </div>

                  <div class="parameter-item">
                    <label>随机顺序</label>
                    <div class="toggle-switch">
                      <input 
                        type="checkbox" 
                        v-model="group.params.randomOrder" 
                        :id="`random-toggle-${groupIndex}`"
                      >
                      <label :for="`random-toggle-${groupIndex}`" class="toggle-label"></label>
                    </div>
                  </div>
                </div>

                <!-- 组预览信息 -->
                <div class="group-preview">
                  <div class="preview-item">
                    <span>图片数量：</span>
                    <span>{{ group.selectedImages.length }}</span>
                  </div>
                  <div class="preview-item">
                    <span>预计时长：</span>
                    <span>{{ calculateGroupDuration(group) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button @click="addGroup" class="add-group-btn">
            + 添加训练组
          </button>
        </div>
      </div>

      <!-- 总体预览和开始按钮 -->
      <div class="overall-preview">
        <h3>训练总览</h3>
        <div class="overall-stats">
          <div class="stat-item">
            <span class="stat-label">总训练组数：</span>
            <span class="stat-value">{{ trainingGroups.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总图片数：</span>
            <span class="stat-value">{{ totalSelectedImages }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">预计总时长：</span>
            <span class="stat-value">{{ totalEstimatedDuration }}</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button 
            @click="startTraining" 
            :disabled="!canStartTraining"
            class="start-btn"
          >
            开始训练
          </button>
        </div>
      </div>
    </div>

    <!-- 训练阶段 -->
    <div v-if="currentStage === 'training'" class="training-stage">
      <div class="training-header">
        <div class="training-info">
          <div class="group-info">
            <span>训练组：{{ currentGroupIndex + 1 }} / {{ trainingGroups.length }}</span>
            <span>轮次：{{ currentRound }} / {{ currentGroup.params.rounds }}</span>
          </div>
          <div class="image-info">
            <span>图片：{{ currentImageIndex + 1 }} / {{ currentGroupImages.length }}</span>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: overallProgressPercentage + '%' }"></div>
        </div>
      </div>

      <div class="flash-area">
        <div v-if="showImage" class="flash-image-container" :key="currentImageUrl">
          <img :src="currentImageUrl" alt="Flash Image" class="flash-image">
        </div>
        <div v-else class="flash-placeholder">
          <div class="waiting-indicator">{{ waitingText }}</div>
        </div>
      </div>

      <div class="training-controls">
        <button @click="pauseTraining" v-if="!isPaused" class="control-btn pause-btn">
          ⏸️ 暂停
        </button>
        <button @click="resumeTraining" v-if="isPaused" class="control-btn resume-btn">
          ▶️ 继续
        </button>
        <button @click="stopTraining" class="control-btn stop-btn">
          ⏹️ 停止
        </button>
      </div>
    </div>

    <!-- 结果阶段 -->
    <div v-if="currentStage === 'result'" class="result-stage">
      <div class="result-header">
        <h2>训练完成！</h2>
        <div class="completion-icon">🎉</div>
      </div>

      <div class="result-stats">
        <div class="stat-card">
          <div class="stat-number">{{ trainingGroups.length }}</div>
          <div class="stat-label">训练组数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalTrainedImages }}</div>
          <div class="stat-label">训练图片数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ formatTime(trainingDuration) }}</div>
          <div class="stat-label">训练时长</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ averageSpeed }}ms</div>
          <div class="stat-label">平均速度</div>
        </div>
      </div>

      <div class="result-actions">
        <button @click="restartTraining" class="action-btn primary">
          重新训练
        </button>
        <button @click="backToSetup" class="action-btn secondary">
          修改设置
        </button>
        <button @click="goBack" class="action-btn secondary">
          返回主页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 当前阶段：setup, training, result
const currentStage = ref('setup');

// 上传的图片
const uploadedImages = ref([]);

// 训练组
const trainingGroups = ref([
  {
    selectedImages: [],
    params: {
      speed: 1000,
      interval: 1000,
      rounds: 1,
      randomOrder: false
    }
  }
]);

// 训练状态
const currentGroupIndex = ref(0);
const currentImageIndex = ref(0);
const currentRound = ref(1);
const currentImageUrl = ref('');
const showImage = ref(false);
const isPaused = ref(false);
const currentGroupImages = ref([]);
const waitingText = ref('准备中...');
const trainingStartTime = ref(0);
const trainingDuration = ref(0);
const totalTrainedImages = ref(0);

// 定时器
let flashTimer = null;
let intervalTimer = null;

// 当前训练组
const currentGroup = computed(() => {
  return trainingGroups.value[currentGroupIndex.value] || trainingGroups.value[0];
});

// 总选中图片数
const totalSelectedImages = computed(() => {
  return trainingGroups.value.reduce((total, group) => {
    return total + group.selectedImages.length;
  }, 0);
});

// 总预计时长
const totalEstimatedDuration = computed(() => {
  const totalMs = trainingGroups.value.reduce((total, group) => {
    const groupDuration = group.selectedImages.length * 
      (parseInt(group.params.speed) + parseInt(group.params.interval)) * 
      group.params.rounds;
    return total + groupDuration;
  }, 0);
  
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  return `${minutes}分${seconds}秒`;
});

// 是否可以开始训练
const canStartTraining = computed(() => {
  return trainingGroups.value.some(group => group.selectedImages.length > 0);
});

// 整体进度百分比
const overallProgressPercentage = computed(() => {
  let totalProgress = 0;
  let maxProgress = 0;
  
  for (let i = 0; i < trainingGroups.value.length; i++) {
    const group = trainingGroups.value[i];
    const groupMax = group.selectedImages.length * group.params.rounds;
    maxProgress += groupMax;
    
    if (i < currentGroupIndex.value) {
      // 已完成的组
      totalProgress += groupMax;
    } else if (i === currentGroupIndex.value) {
      // 当前组
      const currentGroupProgress = (currentRound.value - 1) * group.selectedImages.length + currentImageIndex.value;
      totalProgress += currentGroupProgress;
    }
  }
  
  return maxProgress > 0 ? Math.round((totalProgress / maxProgress) * 100) : 0;
});

// 平均速度
const averageSpeed = computed(() => {
  if (trainingGroups.value.length === 0) return 0;
  
  const totalSpeed = trainingGroups.value.reduce((sum, group) => {
    return sum + parseInt(group.params.speed);
  }, 0);
  
  return Math.round(totalSpeed / trainingGroups.value.length);
});

// 图片处理
const handleImageSelect = (event) => {
  const files = Array.from(event.target.files);
  processImageFiles(files);
};

const handleImageDrop = (event) => {
  event.preventDefault();
  const files = Array.from(event.dataTransfer.files);
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  processImageFiles(imageFiles);
};

const processImageFiles = (files) => {
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImages.value.push({
        name: file.name,
        url: e.target.result,
        file: file
      });
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1);
  
  // 更新所有训练组的选中图片索引
  trainingGroups.value.forEach(group => {
    group.selectedImages = group.selectedImages
      .filter(imgIndex => imgIndex !== index)
      .map(imgIndex => imgIndex > index ? imgIndex - 1 : imgIndex);
  });
};

// 训练组管理
const addGroup = () => {
  trainingGroups.value.push({
    selectedImages: [],
    params: {
      speed: 1000,
      interval: 1000,
      rounds: 1,
      randomOrder: false
    }
  });
};

const removeGroup = (index) => {
  trainingGroups.value.splice(index, 1);
};

// 图片选择
const toggleImageSelection = (groupIndex, imageIndex) => {
  const group = trainingGroups.value[groupIndex];
  const selectedIndex = group.selectedImages.indexOf(imageIndex);
  
  if (selectedIndex > -1) {
    group.selectedImages.splice(selectedIndex, 1);
  } else {
    group.selectedImages.push(imageIndex);
  }
};

// 计算组时长
const calculateGroupDuration = (group) => {
  const totalMs = group.selectedImages.length * 
    (parseInt(group.params.speed) + parseInt(group.params.interval)) * 
    group.params.rounds;
  
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  return `${minutes}分${seconds}秒`;
};

// 开始训练
const startTraining = () => {
  if (!canStartTraining.value) return;
  
  // 过滤掉没有选中图片的组
  const validGroups = trainingGroups.value.filter(group => group.selectedImages.length > 0);
  if (validGroups.length === 0) return;
  
  currentStage.value = 'training';
  currentGroupIndex.value = 0;
  currentImageIndex.value = 0;
  currentRound.value = 1;
  trainingStartTime.value = Date.now();
  totalTrainedImages.value = totalSelectedImages.value;
  
  prepareCurrentGroup();
  nextImage();
};

// 准备当前组
const prepareCurrentGroup = () => {
  const group = trainingGroups.value[currentGroupIndex.value];
  const selectedImageUrls = group.selectedImages.map(index => uploadedImages.value[index].url);
  
  currentGroupImages.value = group.params.randomOrder 
    ? [...selectedImageUrls].sort(() => Math.random() - 0.5)
    : [...selectedImageUrls];
};

// 下一张图片
const nextImage = () => {
  if (isPaused.value) return;
  
  // 检查当前组是否完成
  if (currentImageIndex.value >= currentGroupImages.value.length) {
    // 检查当前组的轮次是否完成
    if (currentRound.value >= currentGroup.value.params.rounds) {
      // 当前组完成，移动到下一组
      currentGroupIndex.value++;
      
      if (currentGroupIndex.value >= trainingGroups.value.length) {
        // 所有组完成
        finishTraining();
        return;
      } else {
        // 开始下一组
        currentImageIndex.value = 0;
        currentRound.value = 1;
        prepareCurrentGroup();
      }
    } else {
      // 开始下一轮
      currentRound.value++;
      currentImageIndex.value = 0;
      if (currentGroup.value.params.randomOrder) {
        prepareCurrentGroup();
      }
    }
  }
  
  // 显示当前图片
  currentImageUrl.value = currentGroupImages.value[currentImageIndex.value];
  showImage.value = true;
  waitingText.value = '准备中...';
  
  // 闪视时间
  flashTimer = setTimeout(() => {
    showImage.value = false;
    waitingText.value = '间隔中...';
    
    // 间隔时间
    intervalTimer = setTimeout(() => {
      currentImageIndex.value++;
      nextImage();
    }, parseInt(currentGroup.value.params.interval));
  }, parseInt(currentGroup.value.params.speed));
};

// 暂停训练
const pauseTraining = () => {
  isPaused.value = true;
  clearTimeout(flashTimer);
  clearTimeout(intervalTimer);
  waitingText.value = '已暂停';
};

// 继续训练
const resumeTraining = () => {
  isPaused.value = false;
  nextImage();
};

// 停止训练
const stopTraining = () => {
  clearTimeout(flashTimer);
  clearTimeout(intervalTimer);
  currentStage.value = 'setup';
  isPaused.value = false;
};

// 完成训练
const finishTraining = () => {
  clearTimeout(flashTimer);
  clearTimeout(intervalTimer);
  trainingDuration.value = Date.now() - trainingStartTime.value;
  currentStage.value = 'result';
  
  // 保存训练记录
  saveTrainingRecord();
};

// 重新开始训练
const restartTraining = () => {
  startTraining();
};

// 返回设置
const backToSetup = () => {
  currentStage.value = 'setup';
};

// 返回主页
const goBack = () => {
  router.push('/flash-training');
};

// 格式化时间
const formatTime = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}分${seconds}秒`;
};

// 保存训练记录
const saveTrainingRecord = () => {
  const record = {
    date: new Date().toISOString(),
    groupCount: trainingGroups.value.length,
    imageCount: totalTrainedImages.value,
    duration: trainingDuration.value,
    averageSpeed: averageSpeed.value
  };
  
  // 保存到本地存储
  const saved = localStorage.getItem('customImageFlashRecords') || '[]';
  const records = JSON.parse(saved);
  records.push(record);
  localStorage.setItem('customImageFlashRecords', JSON.stringify(records));
  
  // 更新统计数据
  updateStats();
};

// 更新统计数据
const updateStats = () => {
  const flashStats = JSON.parse(localStorage.getItem('flashTrainingStats') || '{}');
  
  if (!flashStats.customImage) {
    flashStats.customImage = { completed: 0, bestScore: 0 };
  }
  
  flashStats.customImage.completed++;
  // 这里可以根据需要计算分数
  
  localStorage.setItem('flashTrainingStats', JSON.stringify(flashStats));
};

// 清理定时器
onUnmounted(() => {
  clearTimeout(flashTimer);
  clearTimeout(intervalTimer);
});
</script>

<style scoped>
.custom-image-flash {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}



/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  color: var(--color-primary);
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.page-description {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

/* 设置容器 */
.setup-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* 图片上传区域 */
.image-upload-section {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.image-upload-section h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.upload-drop-zone {
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  background: var(--color-bg);
}

.upload-drop-zone:hover {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.upload-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.upload-hint {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

/* 图片预览 */
.image-preview {
  margin-top: 2rem;
}

.image-preview h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  transition: all var(--transition-normal);
}

.image-item:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.preview-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
  display: block;
}

.image-info {
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-name {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.remove-btn {
  background: var(--color-danger);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 训练组设置 */
.training-groups-section {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.training-groups-section h3 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.section-description {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.groups-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.group-card {
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  background: var(--color-bg);
  transition: all var(--transition-normal);
}

.group-card:hover {
  border-color: var(--color-primary);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.group-header h4 {
  color: var(--color-primary);
  margin: 0;
}

.remove-group-btn {
  background: var(--color-danger);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}

/* 图片选择器 */
.group-images {
  margin-bottom: 1.5rem;
}

.group-images label {
  display: block;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.8rem;
}

.image-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.selectable-image {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid var(--color-border);
  transition: all var(--transition-normal);
}

.selectable-image:hover {
  border-color: var(--color-primary);
}

.selectable-image.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.3);
}

.selectable-image img {
  width: 100%;
  height: 60px;
  object-fit: cover;
  display: block;
}

.selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--color-primary-rgb), 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.selectable-image.selected .selection-overlay {
  opacity: 1;
}

.check-icon {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

.selection-info {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* 组参数设置 */
.group-parameters {
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
}

.parameter-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.parameter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.parameter-item label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.85rem;
}

.parameter-item select {
  padding: 0.6rem;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.85rem;
  transition: border-color var(--transition-normal);
}

.parameter-item select:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* 切换开关 */
.toggle-switch {
  position: relative;
  display: inline-block;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  display: block;
  width: 40px;
  height: 20px;
  background: var(--color-border);
  border-radius: 10px;
  cursor: pointer;
  transition: background var(--transition-normal);
  position: relative;
}

.toggle-label::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: transform var(--transition-normal);
}

.toggle-switch input:checked + .toggle-label {
  background: var(--color-primary);
}

.toggle-switch input:checked + .toggle-label::after {
  transform: translateX(20px);
}

/* 组预览 */
.group-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.preview-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.preview-item span:first-child {
  color: var(--color-text-secondary);
}

.preview-item span:last-child {
  color: var(--color-primary);
  font-weight: 600;
}

/* 添加组按钮 */
.add-group-btn {
  width: 100%;
  padding: 1rem;
  border: 2px dashed var(--color-border);
  background: transparent;
  color: var(--color-primary);
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.add-group-btn:hover {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

/* 总体预览 */
.overall-preview {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  text-align: center;
}

.overall-preview h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.overall-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-primary);
}

/* 开始按钮 */
.start-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.4);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 训练阶段样式 */
.training-stage {
  text-align: center;
}

.training-header {
  margin-bottom: 3rem;
}

.training-info {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: var(--color-text);
}

.group-info, .image-info {
  display: flex;
  gap: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, #1d4ed8 100%);
  transition: width 0.3s ease;
}

.flash-area {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
  background: var(--color-card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.flash-image-container {
  max-width: 90%;
  max-height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flash-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  animation: flashIn 0.2s ease;
}

@keyframes flashIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.flash-placeholder {
  color: var(--color-text-secondary);
  font-size: 1.2rem;
}

.waiting-indicator {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.training-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.control-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.pause-btn, .resume-btn {
  background: var(--color-warning);
  color: white;
}

.stop-btn {
  background: var(--color-danger);
  color: white;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 结果阶段样式 */
.result-stage {
  text-align: center;
}

.result-header {
  margin-bottom: 3rem;
}

.result-header h2 {
  color: var(--color-primary);
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.completion-icon {
  font-size: 4rem;
  animation: bounce 1s ease;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 2px solid transparent;
  transition: all var(--transition-normal);
}

.stat-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-3px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}

.action-btn.secondary {
  background: var(--color-card-bg);
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn.primary:hover {
  box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.4);
}

.action-btn.secondary:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .setup-container {
    grid-template-columns: 1fr;
  }
  
  .overall-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .training-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .group-info, .image-info {
    justify-content: center;
  }
  
  .parameter-grid {
    grid-template-columns: 1fr;
  }
  
  .group-preview {
    grid-template-columns: 1fr;
  }
  
  .result-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>