<template>
  <div class="afterimage-training">
    <div class="training-header">
      <h2>残像训练</h2>
      <p>专注凝视图像，然后闭眼观察残像效果</p>
    </div>

    <div class="training-content">
      <div v-if="!isTraining" class="start-screen">
        <div class="settings">
          <div class="setting-item">
            <label>凝视时间（秒）：</label>
            <input v-model.number="settings.gazeTime" type="number" min="5" max="30" />
          </div>
          <div class="setting-item">
            <label>图像类型：</label>
            <select v-model="settings.imageType">
              <option value="circle">圆形</option>
              <option value="square">方形</option>
              <option value="triangle">三角形</option>
              <option value="star">星形</option>
            </select>
          </div>
          <div class="setting-item">
            <label>图像颜色：</label>
            <select v-model="settings.imageColor">
              <option value="red">红色</option>
              <option value="blue">蓝色</option>
              <option value="green">绿色</option>
              <option value="yellow">黄色</option>
            </select>
          </div>
        </div>
        <button @click="startTraining" class="start-btn">开始训练</button>
      </div>

      <div v-else class="training-area">
        <div v-if="phase === 'gaze'" class="gaze-phase">
          <div class="countdown">{{ countdown }}</div>
          <div class="image-container">
            <div 
              :class="['training-image', settings.imageType]"
              :style="{ backgroundColor: settings.imageColor }"
            ></div>
          </div>
          <p>请专注凝视中央图像</p>
        </div>

        <div v-else-if="phase === 'afterimage'" class="afterimage-phase">
          <div class="white-screen"></div>
          <p>闭上眼睛，观察残像效果</p>
          <button @click="completeTraining" class="complete-btn">完成训练</button>
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
          <span class="stat-label">总训练时间：</span>
          <span class="stat-value">{{ Math.round(stats.totalTime / 60) }} 分钟</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均凝视时间：</span>
          <span class="stat-value">{{ Math.round(stats.averageGazeTime) }} 秒</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';

// 训练状态
const isTraining = ref(false);
const phase = ref('gaze'); // 'gaze' | 'afterimage'
const countdown = ref(0);

// 训练设置
const settings = reactive({
  gazeTime: 15,
  imageType: 'circle',
  imageColor: 'red'
});

// 训练统计
const stats = reactive({
  totalSessions: 0,
  totalTime: 0,
  averageGazeTime: 0
});

// 定时器
let timer = null;

// 开始训练
const startTraining = () => {
  isTraining.value = true;
  phase.value = 'gaze';
  countdown.value = settings.gazeTime;
  
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      phase.value = 'afterimage';
    }
  }, 1000);
};

// 完成训练
const completeTraining = () => {
  isTraining.value = false;
  phase.value = 'gaze';
  
  // 更新统计
  stats.totalSessions++;
  stats.totalTime += settings.gazeTime;
  stats.averageGazeTime = stats.totalTime / stats.totalSessions;
  
  // 保存统计数据
  saveStats();
};

// 保存统计数据
const saveStats = () => {
  localStorage.setItem('afterimage-training-stats', JSON.stringify(stats));
};

// 加载统计数据
const loadStats = () => {
  const saved = localStorage.getItem('afterimage-training-stats');
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
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.afterimage-training {
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

.gaze-phase {
  padding: 40px;
}

.countdown {
  font-size: 48px;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 30px;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  margin-bottom: 20px;
}

.training-image {
  transition: all 0.3s ease;
}

.training-image.circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
}

.training-image.square {
  width: 150px;
  height: 150px;
}

.training-image.triangle {
  width: 0;
  height: 0;
  border-left: 75px solid transparent;
  border-right: 75px solid transparent;
  border-bottom: 130px solid;
  background: transparent !important;
}

.training-image.star {
  width: 150px;
  height: 150px;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.afterimage-phase {
  padding: 40px;
}

.white-screen {
  width: 100%;
  height: 300px;
  background: white;
  border: 2px solid #ddd;
  margin-bottom: 20px;
}

.complete-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.complete-btn:hover {
  background: #219a52;
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