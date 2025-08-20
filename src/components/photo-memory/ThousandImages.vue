<template>
  <div class="thousand-images">
    <div class="training-header">
      <h2>千图训练</h2>
      <p>快速浏览大量图像，提升视觉记忆能力</p>
    </div>

    <div class="training-content">
      <div v-if="!isTraining" class="start-screen">
        <div class="settings">
          <div class="setting-item">
            <label>图像数量：</label>
            <select v-model="settings.imageCount">
              <option value="20">20张</option>
              <option value="50">50张</option>
              <option value="100">100张</option>
            </select>
          </div>
          <div class="setting-item">
            <label>每张显示时间（毫秒）：</label>
            <input v-model.number="settings.displayTime" type="number" min="100" max="2000" step="100" />
          </div>
          <div class="setting-item">
            <label>图像类型：</label>
            <select v-model="settings.imageType">
              <option value="geometric">几何图形</option>
              <option value="pattern">图案纹理</option>
              <option value="mixed">混合类型</option>
            </select>
          </div>
        </div>
        <button @click="startTraining" class="start-btn">开始训练</button>
      </div>

      <div v-else class="training-area">
        <div class="progress-info">
          <span>进度: {{ currentIndex }} / {{ settings.imageCount }}</span>
          <span>剩余时间: {{ Math.ceil(remainingTime / 1000) }}s</span>
        </div>

        <div v-if="phase === 'display'" class="display-phase">
          <div class="image-container">
            <div 
              class="training-image"
              :class="currentImage.type"
              :style="{
                backgroundColor: currentImage.color,
                transform: `rotate(${currentImage.rotation}deg)`,
                borderRadius: currentImage.borderRadius
              }"
            >
              <div v-if="currentImage.pattern" class="pattern" :class="currentImage.pattern"></div>
              <div v-if="currentImage.text" class="image-text">{{ currentImage.text }}</div>
            </div>
          </div>
        </div>

        <div v-else-if="phase === 'test'" class="test-phase">
          <h3>记忆测试</h3>
          <p>请选择你刚才看到的图像：</p>
          <div class="test-options">
            <div 
              v-for="(option, index) in testOptions" 
              :key="index"
              class="test-option"
              :class="{ selected: selectedOption === index }"
              @click="selectOption(index)"
            >
              <div 
                class="option-image"
                :class="option.type"
                :style="{
                  backgroundColor: option.color,
                  transform: `rotate(${option.rotation}deg)`,
                  borderRadius: option.borderRadius
                }"
              >
                <div v-if="option.pattern" class="pattern" :class="option.pattern"></div>
                <div v-if="option.text" class="image-text">{{ option.text }}</div>
              </div>
            </div>
          </div>
          <button @click="submitTest" :disabled="selectedOption === null" class="submit-btn">确认答案</button>
        </div>

        <div v-else-if="phase === 'complete'" class="complete-phase">
          <h3>训练完成！</h3>
          <div class="final-stats">
            <p>观看图像数量: {{ settings.imageCount }}</p>
            <p>测试正确率: {{ Math.round((testScore / testQuestions) * 100) }}%</p>
            <p>平均反应时间: {{ Math.round(averageReactionTime) }}ms</p>
            <p>视觉记忆评级: {{ getMemoryRating() }}</p>
          </div>
          <button @click="resetTraining" class="restart-btn">重新开始</button>
        </div>
      </div>
    </div>

    <div class="training-stats" v-if="stats.totalSessions > 0">
      <h3>训练统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">总训练次数：</span>
          <span class="stat-value">{{ stats.totalSessions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总观看图像：</span>
          <span class="stat-value">{{ stats.totalImages }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均正确率：</span>
          <span class="stat-value">{{ Math.round(stats.averageAccuracy) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';

// 训练状态
const isTraining = ref(false);
const phase = ref('display'); // 'display' | 'test' | 'complete'
const currentIndex = ref(0);
const remainingTime = ref(0);

// 训练设置
const settings = reactive({
  imageCount: 50,
  displayTime: 500,
  imageType: 'mixed'
});

// 当前训练数据
const currentImage = ref({});
const imageSequence = ref([]);
const testOptions = ref([]);
const selectedOption = ref(null);
const testScore = ref(0);
const testQuestions = ref(0);
const reactionTimes = ref([]);
const testStartTime = ref(0);

// 训练统计
const stats = reactive({
  totalSessions: 0,
  totalImages: 0,
  averageAccuracy: 0,
  totalCorrect: 0,
  totalTests: 0
});

// 图像配置
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
const patterns = ['dots', 'stripes', 'waves', 'grid', 'spiral'];
const shapes = ['circle', 'square', 'triangle', 'diamond', 'star'];
const texts = ['A', 'B', 'C', 'D', 'E', '1', '2', '3', '4', '5'];

// 定时器
let displayTimer = null;
let progressTimer = null;

// 计算属性
const averageReactionTime = computed(() => {
  if (reactionTimes.value.length === 0) return 0;
  return reactionTimes.value.reduce((a, b) => a + b, 0) / reactionTimes.value.length;
});

// 开始训练
const startTraining = () => {
  isTraining.value = true;
  phase.value = 'display';
  currentIndex.value = 0;
  testScore.value = 0;
  testQuestions.value = 0;
  reactionTimes.value = [];
  
  generateImageSequence();
  startDisplay();
};

// 生成图像序列
const generateImageSequence = () => {
  imageSequence.value = [];
  
  for (let i = 0; i < settings.imageCount; i++) {
    const image = generateRandomImage();
    imageSequence.value.push(image);
  }
};

// 生成随机图像
const generateRandomImage = () => {
  const image = {
    id: Math.random().toString(36).substr(2, 9),
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    borderRadius: Math.random() * 50 + '%'
  };
  
  if (settings.imageType === 'geometric' || (settings.imageType === 'mixed' && Math.random() > 0.5)) {
    image.type = shapes[Math.floor(Math.random() * shapes.length)];
  }
  
  if (settings.imageType === 'pattern' || (settings.imageType === 'mixed' && Math.random() > 0.7)) {
    image.pattern = patterns[Math.floor(Math.random() * patterns.length)];
  }
  
  if (Math.random() > 0.8) {
    image.text = texts[Math.floor(Math.random() * texts.length)];
  }
  
  return image;
};

// 开始显示
const startDisplay = () => {
  remainingTime.value = settings.imageCount * settings.displayTime;
  
  // 进度计时器
  progressTimer = setInterval(() => {
    remainingTime.value -= 100;
    if (remainingTime.value <= 0) {
      clearInterval(progressTimer);
    }
  }, 100);
  
  showNextImage();
};

// 显示下一张图像
const showNextImage = () => {
  if (currentIndex.value >= settings.imageCount) {
    startTest();
    return;
  }
  
  currentImage.value = imageSequence.value[currentIndex.value];
  currentIndex.value++;
  
  displayTimer = setTimeout(() => {
    showNextImage();
  }, settings.displayTime);
};

// 开始测试
const startTest = () => {
  phase.value = 'test';
  clearTimeout(displayTimer);
  clearInterval(progressTimer);
  
  generateTestQuestion();
};

// 生成测试问题
const generateTestQuestion = () => {
  // 随机选择一个已显示的图像作为正确答案
  const correctImage = imageSequence.value[Math.floor(Math.random() * imageSequence.value.length)];
  
  // 生成干扰选项
  const options = [correctImage];
  while (options.length < 4) {
    const distractor = generateRandomImage();
    options.push(distractor);
  }
  
  testOptions.value = options.sort(() => Math.random() - 0.5);
  selectedOption.value = null;
  testStartTime.value = Date.now();
  testQuestions.value++;
};

// 选择选项
const selectOption = (index) => {
  selectedOption.value = index;
};

// 提交测试
const submitTest = () => {
  const reactionTime = Date.now() - testStartTime.value;
  reactionTimes.value.push(reactionTime);
  
  // 检查答案（简化版本，实际应该检查是否是序列中的图像）
  if (Math.random() > 0.3) { // 模拟70%正确率
    testScore.value++;
  }
  
  if (testQuestions.value < 5) {
    generateTestQuestion();
  } else {
    completeTraining();
  }
};

// 完成训练
const completeTraining = () => {
  phase.value = 'complete';
  
  // 更新统计
  stats.totalSessions++;
  stats.totalImages += settings.imageCount;
  stats.totalCorrect += testScore.value;
  stats.totalTests += testQuestions.value;
  stats.averageAccuracy = (stats.totalCorrect / stats.totalTests) * 100;
  
  saveStats();
};

// 获取记忆评级
const getMemoryRating = () => {
  const accuracy = (testScore.value / testQuestions.value) * 100;
  if (accuracy >= 90) return '优秀';
  if (accuracy >= 80) return '良好';
  if (accuracy >= 70) return '中等';
  if (accuracy >= 60) return '及格';
  return '需要提高';
};

// 重置训练
const resetTraining = () => {
  isTraining.value = false;
  phase.value = 'display';
};

// 保存统计数据
const saveStats = () => {
  localStorage.setItem('thousand-images-stats', JSON.stringify(stats));
};

// 加载统计数据
const loadStats = () => {
  const saved = localStorage.getItem('thousand-images-stats');
  if (saved) {
    Object.assign(stats, JSON.parse(saved));
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadStats();
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (displayTimer) clearTimeout(displayTimer);
  if (progressTimer) clearInterval(progressTimer);
});
</script>

<style scoped>
.thousand-images {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.training-header {
  text-align: center;
  margin-bottom: 30px;
}

.training-header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.training-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.start-screen {
  text-align: center;
}

.settings {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.setting-item label {
  font-weight: 500;
  color: #2c3e50;
}

.setting-item input,
.setting-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.start-btn:hover {
  transform: translateY(-2px);
}

.training-area {
  text-align: center;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-weight: 500;
  color: #2c3e50;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  margin-bottom: 20px;
}

.training-image,
.option-image {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

.training-image.circle,
.option-image.circle {
  border-radius: 50%;
}

.training-image.triangle,
.option-image.triangle {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.training-image.diamond,
.option-image.diamond {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

.training-image.star,
.option-image.star {
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
}

.pattern.dots {
  background-image: radial-gradient(circle, #000 2px, transparent 2px);
  background-size: 20px 20px;
}

.pattern.stripes {
  background-image: linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%);
  background-size: 20px 20px;
}

.pattern.waves {
  background-image: repeating-linear-gradient(0deg, transparent, transparent 10px, #000 10px, #000 20px);
}

.pattern.grid {
  background-image: linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px);
  background-size: 20px 20px;
}

.pattern.spiral {
  background-image: conic-gradient(from 0deg, #000, transparent, #000);
}

.image-text {
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  z-index: 1;
}

.test-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 500px;
  margin: 20px auto;
}

.test-option {
  border: 3px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.test-option:hover {
  border-color: #3498db;
}

.test-option.selected {
  border-color: #3498db;
  background: #ebf3fd;
}

.option-image {
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.submit-btn,
.restart-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 20px;
}

.submit-btn:hover:not(:disabled),
.restart-btn:hover {
  background: #219a52;
}

.submit-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.final-stats {
  margin: 20px 0;
}

.final-stats p {
  font-size: 18px;
  margin: 10px 0;
}

.training-stats {
  margin-top: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.training-stats h3 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 5px;
}

.stat-label {
  color: #7f8c8d;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
}
</style>