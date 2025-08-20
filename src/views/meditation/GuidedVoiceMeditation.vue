<template>
  <div class="guided-voice-meditation">
    <!-- 模块头部 -->
    <div class="module-header">
      <h2>🎧 语音引导冥想</h2>
      <p class="module-description">通过专业的语音引导，帮助您进入深度冥想状态</p>
    </div>

    <!-- 冥想类型选择 -->
    <div class="meditation-types">
      <h3>选择冥想类型</h3>
      <div class="types-grid">
        <div 
          v-for="type in meditationTypes" 
          :key="type.id"
          class="type-card"
          :class="{ active: selectedType?.id === type.id }"
          @click="selectType(type)"
        >
          <div class="type-icon">{{ type.icon }}</div>
          <h4>{{ type.name }}</h4>
          <p>{{ type.description }}</p>
          <div class="type-meta">
            <span class="duration">{{ type.duration }}分钟</span>
            <span class="difficulty">{{ type.difficulty }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 冥想控制面板 -->
    <div class="meditation-controls" v-if="selectedType">
      <h3>开始冥想</h3>
      <div class="control-panel">
        <div class="meditation-info">
          <h4>{{ selectedType.name }}</h4>
          <p>{{ selectedType.fullDescription }}</p>
          <div class="session-settings">
            <div class="setting-item">
              <label>时长设置</label>
              <select v-model="sessionDuration">
                <option v-for="duration in selectedType.durations" :key="duration" :value="duration">
                  {{ duration }}分钟
                </option>
              </select>
            </div>
            <div class="setting-item">
              <label>背景音乐</label>
              <select v-model="backgroundMusic">
                <option value="nature">自然音效</option>
                <option value="ocean">海浪声</option>
                <option value="forest">森林音效</option>
                <option value="silence">无背景音</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="control-buttons">
          <button 
            @click="startMeditation" 
            class="start-btn"
            :disabled="isSessionActive"
          >
            {{ isSessionActive ? '冥想进行中...' : '开始冥想' }}
          </button>
          <button 
            v-if="isSessionActive" 
            @click="pauseMeditation" 
            class="pause-btn"
          >
            {{ isPaused ? '继续' : '暂停' }}
          </button>
          <button 
            v-if="isSessionActive" 
            @click="stopMeditation" 
            class="stop-btn"
          >
            结束
          </button>
        </div>
      </div>
    </div>

    <!-- 冥想进度显示 -->
    <div class="meditation-progress" v-if="isSessionActive">
      <div class="progress-circle">
        <svg class="progress-ring" width="120" height="120">
          <circle
            class="progress-ring-circle"
            stroke="var(--color-primary)"
            stroke-width="4"
            fill="transparent"
            r="52"
            cx="60"
            cy="60"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
          />
        </svg>
        <div class="progress-text">
          <span class="time-remaining">{{ formatTime(timeRemaining) }}</span>
          <span class="progress-label">剩余时间</span>
        </div>
      </div>
      
      <div class="session-info">
        <h4>{{ selectedType.name }}</h4>
        <p class="current-phase">{{ currentPhase }}</p>
        <div class="breathing-guide" v-if="showBreathingGuide">
          <div class="breathing-circle" :class="{ inhale: isInhaling, exhale: !isInhaling }"></div>
          <p class="breathing-text">{{ isInhaling ? '吸气' : '呼气' }}</p>
        </div>
      </div>
    </div>

    <!-- 历史记录 -->
    <div class="meditation-history">
      <h3>冥想记录</h3>
      <div class="history-stats">
        <div class="stat-item">
          <span class="stat-value">{{ totalSessions }}</span>
          <span class="stat-label">总次数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalMinutes }}</span>
          <span class="stat-label">总时长(分钟)</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ averageRating }}</span>
          <span class="stat-label">平均评分</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTrainingStore } from '../../stores';

const emit = defineEmits(['back']);
const trainingStore = useTrainingStore();

// 冥想类型数据
const meditationTypes = ref([
  {
    id: 'mindfulness',
    name: '正念冥想',
    icon: '🧘',
    description: '专注当下，观察思绪',
    fullDescription: '通过专注呼吸和身体感受，培养正念意识，减少焦虑和压力',
    duration: 15,
    durations: [5, 10, 15, 20, 30],
    difficulty: '初级'
  },
  {
    id: 'body-scan',
    name: '身体扫描',
    icon: '🌊',
    description: '放松身体各个部位',
    fullDescription: '从头到脚逐步放松身体各个部位，释放紧张和压力',
    duration: 20,
    durations: [10, 15, 20, 25, 30],
    difficulty: '初级'
  },
  {
    id: 'loving-kindness',
    name: '慈心冥想',
    icon: '💝',
    description: '培养慈悲和爱心',
    fullDescription: '通过祝福自己和他人，培养慈悲心和积极情感',
    duration: 15,
    durations: [10, 15, 20, 25],
    difficulty: '中级'
  },
  {
    id: 'visualization',
    name: '观想冥想',
    icon: '🌈',
    description: '通过想象进入平静状态',
    fullDescription: '运用想象力创造平静美好的场景，深度放松身心',
    duration: 25,
    durations: [15, 20, 25, 30],
    difficulty: '中级'
  }
]);

// 状态管理
const selectedType = ref(null);
const sessionDuration = ref(15);
const backgroundMusic = ref('nature');
const isSessionActive = ref(false);
const isPaused = ref(false);
const timeRemaining = ref(0);
const currentPhase = ref('');
const showBreathingGuide = ref(false);
const isInhaling = ref(true);

// 统计数据
const totalSessions = ref(0);
const totalMinutes = ref(0);
const averageRating = ref(0);

// 定时器
let sessionTimer = null;
let breathingTimer = null;

// 计算属性
const circumference = computed(() => 2 * Math.PI * 52);
const progressOffset = computed(() => {
  if (!selectedType.value || timeRemaining.value === 0) return circumference.value;
  const progress = timeRemaining.value / (sessionDuration.value * 60);
  return circumference.value * (1 - progress);
});

// 方法
const selectType = (type) => {
  selectedType.value = type;
  sessionDuration.value = type.duration;
};

const startMeditation = () => {
  isSessionActive.value = true;
  isPaused.value = false;
  timeRemaining.value = sessionDuration.value * 60;
  currentPhase.value = '准备阶段';
  
  // 开始呼吸引导
  if (selectedType.value.id === 'mindfulness') {
    showBreathingGuide.value = true;
    startBreathingGuide();
  }
  
  // 开始倒计时
  sessionTimer = setInterval(() => {
    if (!isPaused.value) {
      timeRemaining.value--;
      updatePhase();
      
      if (timeRemaining.value <= 0) {
        completeMeditation();
      }
    }
  }, 1000);
};

const pauseMeditation = () => {
  isPaused.value = !isPaused.value;
};

const stopMeditation = () => {
  clearInterval(sessionTimer);
  clearInterval(breathingTimer);
  isSessionActive.value = false;
  isPaused.value = false;
  showBreathingGuide.value = false;
  currentPhase.value = '';
};

const completeMeditation = () => {
  stopMeditation();
  
  // 记录冥想数据
  const sessionData = {
    type: selectedType.value.id,
    duration: sessionDuration.value,
    completedAt: new Date(),
    backgroundMusic: backgroundMusic.value
  };
  
  trainingStore.recordMeditationSession('guidedMeditation', sessionData);
  loadStats();
  
  // 显示完成提示
  alert('冥想完成！感谢您的练习。');
};

const startBreathingGuide = () => {
  breathingTimer = setInterval(() => {
    isInhaling.value = !isInhaling.value;
  }, 4000); // 4秒一个呼吸周期
};

const updatePhase = () => {
  const elapsed = (sessionDuration.value * 60) - timeRemaining.value;
  const totalDuration = sessionDuration.value * 60;
  
  if (elapsed < 60) {
    currentPhase.value = '准备阶段';
  } else if (elapsed < totalDuration - 60) {
    currentPhase.value = '深度冥想';
  } else {
    currentPhase.value = '结束阶段';
  }
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const loadStats = () => {
  const data = trainingStore.getMeditationModuleData('guidedMeditation');
  if (data?.progress) {
    totalSessions.value = data.progress.totalSessions || 0;
    totalMinutes.value = data.progress.totalMinutes || 0;
    averageRating.value = data.progress.averageRating || 0;
  }
};

onMounted(() => {
  loadStats();
});

onUnmounted(() => {
  if (sessionTimer) clearInterval(sessionTimer);
  if (breathingTimer) clearInterval(breathingTimer);
});
</script>

<style scoped>
.guided-voice-meditation {
  padding: 2rem 0;
}

.module-header {
  text-align: center;
  margin-bottom: 3rem;
}

.module-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.module-description {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.meditation-types {
  margin-bottom: 3rem;
}

.meditation-types h3 {
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.type-card {
  background: var(--color-background-secondary);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.type-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.type-card.active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.type-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.type-card h4 {
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.type-card p {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.type-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.duration {
  color: var(--color-primary);
  font-weight: 500;
}

.difficulty {
  color: var(--color-text-secondary);
}

.meditation-controls {
  background: var(--color-background-secondary);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
}

.control-panel {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: start;
}

.meditation-info h4 {
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.session-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.setting-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.setting-item select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text-primary);
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-buttons button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.start-btn {
  background: var(--color-primary);
  color: white;
}

.start-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pause-btn {
  background: var(--color-warning);
  color: white;
}

.stop-btn {
  background: var(--color-danger);
  color: white;
}

.meditation-progress {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  align-items: center;
  background: var(--color-background-secondary);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
}

.progress-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.3s ease;
}

.progress-text {
  position: absolute;
  text-align: center;
}

.time-remaining {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

.progress-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.session-info h4 {
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.current-phase {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.breathing-guide {
  text-align: center;
}

.breathing-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-primary);
  margin: 0 auto 1rem;
  transition: transform 4s ease-in-out;
}

.breathing-circle.inhale {
  transform: scale(1.2);
}

.breathing-circle.exhale {
  transform: scale(0.8);
}

.breathing-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-primary);
}

.meditation-history {
  background: var(--color-background-secondary);
  border-radius: 12px;
  padding: 2rem;
}

.meditation-history h3 {
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.history-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 8px;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .control-panel {
    grid-template-columns: 1fr;
  }
  
  .meditation-progress {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .session-settings {
    grid-template-columns: 1fr;
  }
}
</style>