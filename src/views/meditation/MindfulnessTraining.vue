<template>
  <div class="mindfulness-training-container">
    <!-- 主页面内容 -->
    <div v-if="$route.path === '/meditation/mindfulness'">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-background">
          <div class="mindfulness-waves">
            <div class="wave wave-1"></div>
            <div class="wave wave-2"></div>
            <div class="wave wave-3"></div>
          </div>
        </div>
        <h1>🧘‍♀️ 正念训练</h1>
        <p class="page-description">
          培养孩子的当下觉察能力，提升情绪管理技能。
          正念是一种专注于当下的能力，帮助孩子更好地理解自己的感受和想法。
        </p>
      </div>

      <!-- 正念练习选择 -->
      <div class="mindfulness-exercises">
        <h2 class="section-title">选择正念练习</h2>
        <div class="exercises-grid">
          <div 
            v-for="exercise in mindfulnessExercises" 
            :key="exercise.id"
            class="exercise-card"
            @click="navigateTo(exercise.path)"
          >
            <div class="exercise-icon">{{ exercise.icon }}</div>
            <h3>{{ exercise.name }}</h3>
            <p>{{ exercise.description }}</p>
            <div class="exercise-benefits">
              <span v-for="benefit in exercise.benefits" :key="benefit" class="benefit-tag">
                {{ benefit }}
              </span>
            </div>
            <div class="exercise-info">
              <div class="info-row">
                <span class="info-label">时长：</span>
                <span class="info-value">{{ exercise.duration }}分钟</span>
              </div>
              <div class="info-row">
                <span class="info-label">难度：</span>
                <span class="info-value">{{ exercise.difficulty }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">适合年龄：</span>
                <span class="info-value">{{ exercise.ageRange }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 子路由内容 -->
    <router-view v-else />

    <!-- 训练准备 -->
    <div v-if="selectedExercise && !isTraining" class="training-setup">
      <div class="setup-card">
        <h3>准备开始：{{ selectedExercise.name }}</h3>
        <div class="setup-overview">
          <div class="overview-icon">{{ selectedExercise.icon }}</div>
          <div class="overview-content">
            <p>{{ selectedExercise.overview }}</p>
          </div>
        </div>
        <div class="setup-instructions">
          <h4>🎯 练习要点</h4>
          <ul>
            <li v-for="instruction in selectedExercise.instructions" :key="instruction">
              {{ instruction }}
            </li>
          </ul>
        </div>
        <div class="setup-posture">
          <h4>🪑 建议姿势</h4>
          <p>{{ selectedExercise.posture }}</p>
        </div>
        <button class="start-training-btn" @click="startTraining">
          <span class="btn-icon">🌟</span>
          开始正念练习
        </button>
      </div>
    </div>

    <!-- 正念训练进行中 -->
    <div v-if="isTraining" class="training-active">
      <div class="training-header">
        <h2>{{ selectedExercise.name }}</h2>
        <div class="training-timer">
          <div class="timer-display">
            <span class="time-remaining">{{ formatTime(timeRemaining) }}</span>
            <span class="time-total">/ {{ formatTime(selectedExercise.duration * 60) }}</span>
          </div>
          <div class="timer-progress">
            <div class="progress-circle">
              <svg class="progress-ring" width="120" height="120">
                <circle
                  class="progress-ring-circle"
                  stroke="#95E1D3"
                  stroke-width="4"
                  fill="transparent"
                  r="52"
                  cx="60"
                  cy="60"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="progressOffset"
                />
              </svg>
              <div class="timer-center">
                <span class="timer-icon">{{ selectedExercise.icon }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 正念监测组件 -->
      <MindfulnessMonitor
        :is-active="isTraining && !isPaused"
        :exercise-type="getExerciseType(selectedExercise.id)"
        :show-breathing-guide="selectedExercise.id === 1"
        @attention-change="onAttentionChange"
        @emotion-selected="onEmotionSelected"
        @distraction-detected="onDistractionDetected"
        @focus-returned="onFocusReturned"
      />

      <!-- 当前练习阶段 -->
      <div class="current-phase">
        <div class="phase-content">
          <h3>{{ currentPhase.title }}</h3>
          <p class="phase-guidance">{{ currentPhase.guidance }}</p>
          <div class="phase-focus">
            <div class="focus-point" :class="{ active: isFocusing }">
              <span class="focus-icon">{{ currentPhase.focusIcon }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 正念提醒 -->
      <div class="mindfulness-reminders">
        <div class="reminder-card" v-for="reminder in currentReminders" :key="reminder">
          <span class="reminder-text">{{ reminder }}</span>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="training-controls">
        <button class="control-btn pause" @click="pauseTraining" v-if="!isPaused">
          ⏸️ 暂停
        </button>
        <button class="control-btn resume" @click="resumeTraining" v-if="isPaused">
          ▶️ 继续
        </button>
        <button class="control-btn extend" @click="extendTime">
          ⏰ 延长5分钟
        </button>
        <button class="control-btn stop" @click="stopTraining">
          ⏹️ 结束
        </button>
      </div>
    </div>

    <!-- 训练完成 -->
    <div v-if="trainingCompleted" class="training-completed">
      <div class="completion-card">
        <div class="completion-header">
          <div class="completion-icon">🎉</div>
          <h2>正念练习完成！</h2>
          <p>恭喜完成{{ selectedExercise.name }}练习</p>
        </div>
        
        <div class="completion-reflection">
          <h4>🤔 练习反思</h4>
          <div class="reflection-questions">
            <div class="question-item">
              <p class="question">你在练习中注意到了什么？</p>
              <div class="reflection-options">
                <button 
                  v-for="option in reflectionOptions.noticed" 
                  :key="option"
                  class="reflection-btn"
                  :class="{ selected: selectedReflections.noticed === option }"
                  @click="selectReflection('noticed', option)"
                >
                  {{ option }}
                </button>
              </div>
            </div>
            
            <div class="question-item">
              <p class="question">现在的感受如何？</p>
              <div class="reflection-options">
                <button 
                  v-for="option in reflectionOptions.feeling" 
                  :key="option"
                  class="reflection-btn"
                  :class="{ selected: selectedReflections.feeling === option }"
                  @click="selectReflection('feeling', option)"
                >
                  {{ option }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="completion-stats">
          <div class="stat-item">
            <span class="stat-label">练习时长</span>
            <span class="stat-value">{{ Math.ceil(totalTrainingTime / 60) }}分钟</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">专注度</span>
            <span class="stat-value">{{ focusScore }}%</span>
          </div>
        </div>
        
        <div class="completion-actions">
          <button class="action-btn primary" @click="restartTraining">
            🔄 再次练习
          </button>
          <button class="action-btn secondary" @click="selectNewExercise">
            🔀 选择其他练习
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import MindfulnessMonitor from '@/components/meditation/MindfulnessMonitor.vue';
import meditationStorage from '@/utils/meditationStorage.js';

// 路由
const router = useRouter();

/**
 * 导航到指定的正念练习页面
 * @param {string} path - 练习页面路径
 */
const navigateTo = (path) => {
  router.push(`/meditation/mindfulness/${path}`);
};

// 正念练习数据
const mindfulnessExercises = ref([
  {
    id: 1,
    name: '呼吸觉察',
    icon: '🌬️',
    description: '专注于呼吸的节奏，培养当下觉察能力',
    duration: 5,
    difficulty: '初级',
    ageRange: '4-12岁',
    benefits: ['专注力', '情绪调节', '放松身心'],
    path: 'breathing-awareness'
  },
  {
    id: 2,
    name: '身体扫描',
    icon: '🫂',
    description: '从头到脚感受身体的每个部位，培养身体觉察力',
    duration: 8,
    difficulty: '初级',
    ageRange: '5-12岁',
    benefits: ['身体觉察', '放松肌肉', '专注训练'],
    path: 'body-scan',
    overview: '通过有序地关注身体各个部位，学会觉察身体的感受和状态。',
    instructions: [
      '找一个舒适的姿势躺下或坐着',
      '闭上眼睛，深呼吸几次',
      '从头顶开始，慢慢感受身体的每个部位',
      '不要试图改变什么，只是观察和感受',
      '如果注意力跑了，轻柔地拉回到身体上'
    ],
    posture: '可以躺下或舒适地坐着，保持脊背挺直但不紧张',
    phases: [
      {
        title: '准备阶段',
        guidance: '闭上眼睛，深呼吸三次，让身体放松下来',
        focusIcon: '😌',
        duration: 60
      },
      {
        title: '头部扫描',
        guidance: '感受你的头顶、额头、眼睛、鼻子和嘴巴',
        focusIcon: '🧠',
        duration: 120
      },
      {
        title: '上身扫描',
        guidance: '注意你的脖子、肩膀、手臂和胸部的感觉',
        focusIcon: '💪',
        duration: 180
      },
      {
        title: '下身扫描',
        guidance: '感受你的腹部、腰部、臀部和腿部',
        focusIcon: '🦵',
        duration: 120
      },
      {
        title: '整体感受',
        guidance: '感受整个身体作为一个整体的感觉',
        focusIcon: '🫂',
        duration: 60
      }
    ]
  },
  {
    id: 3,
    name: '情绪觉察',
    icon: '💭',
    description: '学会观察和接纳自己的情绪，不被情绪控制',
    duration: 6,
    difficulty: '中级',
    ageRange: '7-12岁',
    benefits: ['情绪管理', '自我认知', '心理平衡'],
    path: 'emotion-awareness',
    overview: '通过观察内心的情绪变化，学会以平和的心态面对各种感受。',
    instructions: [
      '坐在舒适的位置，闭上眼睛',
      '注意此刻内心的感受',
      '不要评判情绪的好坏，只是观察',
      '想象情绪像云朵一样飘过天空',
      '保持友善和好奇的态度'
    ],
    posture: '舒适地坐着，双脚平放在地上，双手自然放在腿上',
    phases: [
      {
        title: '情绪觉察',
        guidance: '注意此刻你内心的感受，是开心、紧张还是平静？',
        focusIcon: '🎭',
        duration: 90
      },
      {
        title: '情绪接纳',
        guidance: '不要试图改变这些感受，只是友善地观察它们',
        focusIcon: '🤗',
        duration: 120
      },
      {
        title: '情绪流动',
        guidance: '想象情绪像河水一样流动，它们会自然地来去',
        focusIcon: '🌊',
        duration: 120
      },
      {
        title: '内心平静',
        guidance: '感受内心深处那份宁静和平和',
        focusIcon: '☮️',
        duration: 90
      }
    ]
  },
  {
    id: 4,
    name: '正念行走',
    icon: '🚶‍♀️',
    description: '在行走中保持觉察，感受每一步的体验',
    duration: 10,
    difficulty: '中级',
    ageRange: '6-12岁',
    benefits: ['身体协调', '动态觉察', '专注训练'],
    path: 'mindful-walking'
  },
  {
    id: 5,
    name: '感恩练习',
    icon: '🙏',
    description: '培养感恩的心态，增强积极情绪',
    duration: 7,
    difficulty: '初级',
    ageRange: '5-12岁',
    benefits: ['积极情绪', '感恩心态', '幸福感'],
    path: 'gratitude-practice'
  }
]);

// 反思选项
const reflectionOptions = ref({
  noticed: ['身体的感觉', '呼吸的变化', '内心的平静', '思维的活动', '情绪的流动'],
  feeling: ['很放松', '更平静', '有点困倦', '精神焕发', '内心安定']
});

// 状态管理
const selectedExercise = ref(null);
const isTraining = ref(false);
const isPaused = ref(false);
const trainingCompleted = ref(false);
const timeRemaining = ref(0);
const totalTrainingTime = ref(0);
const currentPhaseIndex = ref(0);
const phaseTimeElapsed = ref(0);
const isFocusing = ref(false);
const selectedReflections = ref({ noticed: '', feeling: '' });
const focusScore = ref(85);

// 新增监测相关状态
const sessionData = ref(null);
const attentionHistory = ref([]);
const emotionHistory = ref([]);
const distractionEvents = ref([]);
const sessionStartTime = ref(null);
const sessionId = ref(null);

// 定时器
let trainingTimer = null;
let focusTimer = null;

// 计算属性
const currentPhase = computed(() => {
  if (!selectedExercise.value || !selectedExercise.value.phases) return null;
  return selectedExercise.value.phases[currentPhaseIndex.value] || selectedExercise.value.phases[0];
});

const currentReminders = computed(() => {
  const reminders = [
    '保持友善和好奇的态度',
    '不要评判，只是观察',
    '注意力跑了很正常，轻柔地拉回来',
    '每一刻都是新的开始'
  ];
  return [reminders[Math.floor(Math.random() * reminders.length)]];
});

const circumference = computed(() => 2 * Math.PI * 52);

const progressOffset = computed(() => {
  if (!selectedExercise.value) return circumference.value;
  const progress = (selectedExercise.value.duration * 60 - timeRemaining.value) / (selectedExercise.value.duration * 60);
  return circumference.value - (progress * circumference.value);
});

// 方法
const selectExercise = (exercise) => {
  selectedExercise.value = exercise;
  trainingCompleted.value = false;
  selectedReflections.value = { noticed: '', feeling: '' };
};

const startTraining = () => {
  isTraining.value = true;
  timeRemaining.value = selectedExercise.value.duration * 60;
  totalTrainingTime.value = 0;
  currentPhaseIndex.value = 0;
  phaseTimeElapsed.value = 0;
  
  // 初始化会话数据
  initializeSession();
  
  startTrainingTimer();
  startFocusAnimation();
};

const initializeSession = () => {
  sessionStartTime.value = Date.now();
  sessionId.value = `mindfulness_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  attentionHistory.value = [];
  emotionHistory.value = [];
  distractionEvents.value = [];
  
  sessionData.value = {
    id: sessionId.value,
    type: 'mindfulness',
    exercise: selectedExercise.value.name,
    exerciseId: selectedExercise.value.id,
    startTime: sessionStartTime.value,
    duration: selectedExercise.value.duration * 60,
    status: 'active'
  };
};

const startTrainingTimer = () => {
  trainingTimer = setInterval(() => {
    if (!isPaused.value) {
      timeRemaining.value--;
      totalTrainingTime.value++;
      phaseTimeElapsed.value++;
      
      // 检查是否需要切换阶段
      if (currentPhase.value && phaseTimeElapsed.value >= currentPhase.value.duration) {
        nextPhase();
      }
      
      if (timeRemaining.value <= 0) {
        completeTraining();
      }
    }
  }, 1000);
};

const startFocusAnimation = () => {
  focusTimer = setInterval(() => {
    isFocusing.value = !isFocusing.value;
  }, 2000);
};

const nextPhase = () => {
  if (currentPhaseIndex.value < selectedExercise.value.phases.length - 1) {
    currentPhaseIndex.value++;
    phaseTimeElapsed.value = 0;
  }
};

const pauseTraining = () => {
  isPaused.value = true;
};

const resumeTraining = () => {
  isPaused.value = false;
};

const extendTime = () => {
  timeRemaining.value += 300; // 5分钟
};

const stopTraining = () => {
  isTraining.value = false;
  isPaused.value = false;
  
  // 保存会话数据（即使是提前停止）
  if (sessionData.value) {
    sessionData.value.status = 'stopped';
    saveSessionData();
  }
  
  clearTimers();
};

const completeTraining = () => {
  isTraining.value = false;
  trainingCompleted.value = true;
  
  // 保存会话数据
  saveSessionData();
  
  clearTimers();
};

// 新增事件处理方法
const onAttentionChange = (data) => {
  attentionHistory.value.push({
    timestamp: Date.now(),
    score: data.score,
    level: data.level,
    focused: data.focused
  });
  
  // 更新当前专注分数
  focusScore.value = data.score;
};

const onEmotionSelected = (data) => {
  emotionHistory.value.push({
    timestamp: data.timestamp,
    emotion: data.emotion,
    intensity: data.intensity
  });
};

const onDistractionDetected = (data) => {
  distractionEvents.value.push({
    timestamp: Date.now(),
    score: data.score,
    phase: currentPhase.value?.title || 'unknown'
  });
};

const onFocusReturned = (data) => {
  // 记录专注力恢复事件
  attentionHistory.value.push({
    timestamp: Date.now(),
    score: data.score,
    level: data.level,
    focused: true,
    event: 'focus_returned'
  });
};

const getExerciseType = (exerciseId) => {
  const typeMap = {
    1: 'body-scan',
    2: 'emotion',
    3: 'sound',
    4: 'breathing'
  };
  return typeMap[exerciseId] || 'general';
};

const saveSessionData = () => {
  if (!sessionData.value) return;
  
  const endTime = Date.now();
  const actualDuration = Math.floor((endTime - sessionStartTime.value) / 1000);
  
  const completedSession = {
    ...sessionData.value,
    endTime,
    actualDuration,
    status: 'completed',
    attentionHistory: attentionHistory.value,
    emotionHistory: emotionHistory.value,
    distractionEvents: distractionEvents.value,
    finalScore: focusScore.value,
    reflections: selectedReflections.value,
    phases: selectedExercise.value.phases.map((phase, index) => ({
      ...phase,
      completed: index <= currentPhaseIndex.value
    }))
  };
  
  // 保存到本地存储
  meditationStorage.saveSession(completedSession);
  
  // 更新统计数据
  const stats = meditationStorage.getStatistics();
  stats.totalMindfulnessSessions = (stats.totalMindfulnessSessions || 0) + 1;
  stats.totalMindfulnessTime = (stats.totalMindfulnessTime || 0) + actualDuration;
  meditationStorage.updateStatistics(stats);
};

const restartTraining = () => {
  trainingCompleted.value = false;
  selectedReflections.value = { noticed: '', feeling: '' };
  startTraining();
};

const selectNewExercise = () => {
  selectedExercise.value = null;
  trainingCompleted.value = false;
  isTraining.value = false;
};

const selectReflection = (type, option) => {
  selectedReflections.value[type] = option;
};

const clearTimers = () => {
  if (trainingTimer) {
    clearInterval(trainingTimer);
    trainingTimer = null;
  }
  if (focusTimer) {
    clearInterval(focusTimer);
    focusTimer = null;
  }
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 生命周期
onUnmounted(() => {
  clearTimers();
});
</script>

<style scoped>
.mindfulness-training-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  padding: 3rem 0;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(149, 225, 211, 0.1) 0%, 
    rgba(149, 225, 211, 0.05) 100%);
  border-radius: 20px;
  overflow: hidden;
}

.mindfulness-waves {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.wave {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(149, 225, 211, 0.1), transparent);
  border-radius: 50%;
  animation: wave 6s ease-in-out infinite;
}

.wave-1 {
  animation-delay: 0s;
}

.wave-2 {
  animation-delay: 2s;
}

.wave-3 {
  animation-delay: 4s;
}

@keyframes wave {
  0%, 100% { transform: scale(0.8); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.1; }
}

.page-header h1 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 2.5rem;
  position: relative;
  z-index: 1;
}

.page-description {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.section-title {
  color: var(--color-primary);
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

.exercises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.exercise-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: center;
}

.exercise-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(149, 225, 211, 0.3);
}

.exercise-card.active {
  border-color: #95E1D3;
  background: rgba(149, 225, 211, 0.05);
}

.exercise-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.exercise-card h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.exercise-card p {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.exercise-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.benefit-tag {
  background: rgba(149, 225, 211, 0.1);
  color: #95E1D3;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.exercise-info {
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.info-label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.info-value {
  color: #95E1D3;
  font-weight: 600;
}

.training-setup {
  max-width: 600px;
  margin: 0 auto 3rem;
}

.setup-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  text-align: center;
}

.setup-card h3 {
  color: var(--color-primary);
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.setup-overview {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(149, 225, 211, 0.05);
  border-radius: 12px;
}

.overview-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.overview-content {
  flex: 1;
  text-align: left;
}

.overview-content p {
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.setup-instructions, .setup-posture {
  text-align: left;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(149, 225, 211, 0.05);
  border-radius: 12px;
}

.setup-instructions h4, .setup-posture h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.setup-instructions ul {
  list-style: none;
  padding: 0;
}

.setup-instructions li {
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.setup-instructions li::before {
  content: '•';
  color: #95E1D3;
  position: absolute;
  left: 0;
}

.setup-posture p {
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.start-training-btn {
  background: linear-gradient(135deg, #95E1D3, #7ECECA);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.start-training-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.training-active {
  max-width: 800px;
  margin: 0 auto;
}

.training-header {
  text-align: center;
  margin-bottom: 3rem;
}

.training-header h2 {
  color: var(--color-primary);
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.training-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}

.time-remaining {
  color: #95E1D3;
  font-weight: 600;
  font-size: 1.5rem;
}

.time-total {
  color: var(--color-text-secondary);
}

.timer-progress {
  position: relative;
}

.progress-circle {
  position: relative;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-circle {
  transition: stroke-dashoffset 1s ease-in-out;
}

.timer-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-icon {
  font-size: 2rem;
}

.current-phase {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: var(--shadow-md);
  text-align: center;
  margin-bottom: 2rem;
}

.phase-content h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.phase-guidance {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.phase-focus {
  display: flex;
  justify-content: center;
}

.focus-point {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(149, 225, 211, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 2s ease-in-out;
}

.focus-point.active {
  background: rgba(149, 225, 211, 0.4);
  transform: scale(1.1);
}

.focus-icon {
  font-size: 2rem;
}

.mindfulness-reminders {
  margin-bottom: 2rem;
}

.reminder-card {
  background: rgba(149, 225, 211, 0.1);
  border-left: 4px solid #95E1D3;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.reminder-text {
  color: var(--color-text-secondary);
  font-style: italic;
}

.training-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-btn {
  background: var(--color-card-bg);
  border: 2px solid rgba(var(--color-primary-rgb), 0.2);
  color: var(--color-primary);
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.control-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.1);
  transform: translateY(-2px);
}

.control-btn.stop {
  border-color: rgba(220, 53, 69, 0.3);
  color: #dc3545;
}

.control-btn.stop:hover {
  background: rgba(220, 53, 69, 0.1);
}

.training-completed {
  max-width: 600px;
  margin: 0 auto;
}

.completion-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.completion-header {
  margin-bottom: 2rem;
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.completion-header h2 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 2rem;
}

.completion-header p {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.completion-reflection {
  background: rgba(149, 225, 211, 0.05);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: left;
}

.completion-reflection h4 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.question-item {
  margin-bottom: 2rem;
}

.question {
  color: var(--color-text-primary);
  font-weight: 600;
  margin-bottom: 1rem;
}

.reflection-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.reflection-btn {
  background: var(--color-card-bg);
  border: 2px solid rgba(149, 225, 211, 0.3);
  color: var(--color-text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.reflection-btn:hover {
  border-color: #95E1D3;
  color: #95E1D3;
}

.reflection-btn.selected {
  background: #95E1D3;
  color: white;
  border-color: #95E1D3;
}

.completion-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: rgba(149, 225, 211, 0.05);
  padding: 1rem;
  border-radius: 12px;
}

.stat-label {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  color: #95E1D3;
  font-size: 1.5rem;
  font-weight: 600;
}

.completion-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #95E1D3, #7ECECA);
  color: white;
}

.action-btn.secondary {
  background: var(--color-card-bg);
  border: 2px solid rgba(var(--color-primary-rgb), 0.2);
  color: var(--color-primary);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 平板设备优化 */
@media (max-width: 1024px) {
  .mindfulness-training-container {
    padding: 1rem;
  }
  
  .exercises-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }
  
  .exercise-card {
    padding: 1.5rem;
  }
  
  .training-active {
    max-width: 100%;
  }
  
  .current-phase {
    padding: 2rem 1.5rem;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .mindfulness-training-container {
    padding: 0.5rem;
  }
  
  .page-header {
    padding: 2rem 0;
    margin-bottom: 2rem;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .page-description {
    font-size: 0.95rem;
    padding: 0 1rem;
  }
  
  .exercises-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .exercise-card {
    padding: 1.5rem;
    margin: 0;
    border-radius: 12px;
    /* 增强触控反馈 */
    -webkit-tap-highlight-color: rgba(149, 225, 211, 0.2);
    touch-action: manipulation;
  }
  
  .exercise-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  .exercise-icon {
    font-size: 2.5rem;
  }
  
  .setup-overview {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .setup-instructions, .setup-posture {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .start-training-btn {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    width: 100%;
    max-width: 300px;
    /* 触控优化 */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  .start-training-btn:active {
    transform: scale(0.98);
  }
  
  .training-header {
    margin-bottom: 2rem;
  }
  
  .training-header h2 {
    font-size: 1.5rem;
  }
  
  .timer-display {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .time-remaining {
    font-size: 2rem;
  }
  
  .current-phase {
    padding: 2rem 1rem;
    margin-bottom: 1.5rem;
  }
  
  .phase-content h3 {
    font-size: 1.3rem;
  }
  
  .phase-guidance {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .focus-point {
    width: 100px;
    height: 100px;
  }
  
  .focus-icon {
    font-size: 2.5rem;
  }
  
  .training-controls {
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
  }
  
  .control-btn {
    padding: 1rem 2rem;
    font-size: 1rem;
    width: 100%;
    max-width: 200px;
    /* 触控优化 */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  .control-btn:active {
    transform: scale(0.98);
  }
  
  .completion-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat-item {
    padding: 1.5rem;
    text-align: center;
  }
  
  .stat-value {
    font-size: 2rem;
  }
  
  .completion-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .action-btn {
    padding: 1rem 2rem;
    width: 100%;
    max-width: 250px;
    /* 触控优化 */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  .action-btn:active {
    transform: scale(0.98);
  }
  
  .reflection-options {
    justify-content: center;
    gap: 0.8rem;
  }
  
  .reflection-btn {
    padding: 0.8rem 1.2rem;
    font-size: 0.95rem;
    /* 触控优化 */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    min-height: 44px; /* iOS推荐的最小触控目标 */
  }
  
  .reflection-btn:active {
    transform: scale(0.95);
  }
  
  .reminder-card {
    margin: 0.5rem;
    padding: 1rem;
    border-radius: 12px;
  }
}

/* 小屏手机优化 */
@media (max-width: 480px) {
  .mindfulness-training-container {
    padding: 0.25rem;
  }
  
  .page-header {
    padding: 1.5rem 0;
  }
  
  .page-header h1 {
    font-size: 1.6rem;
  }
  
  .page-description {
    font-size: 0.9rem;
  }
  
  .exercise-card {
    padding: 1rem;
  }
  
  .exercise-icon {
    font-size: 2rem;
  }
  
  .current-phase {
    padding: 1.5rem 0.8rem;
  }
  
  .phase-content h3 {
    font-size: 1.2rem;
  }
  
  .phase-guidance {
    font-size: 0.95rem;
  }
  
  .focus-point {
    width: 80px;
    height: 80px;
  }
  
  .focus-icon {
    font-size: 2rem;
  }
  
  .time-remaining {
    font-size: 1.8rem;
  }
  
  .completion-card {
    padding: 2rem 1rem;
  }
  
  .completion-icon {
    font-size: 3rem;
  }
  
  .completion-header h2 {
    font-size: 1.6rem;
  }
  
  .stat-value {
    font-size: 1.6rem;
  }
}

/* 横屏模式优化 */
@media (max-height: 600px) and (orientation: landscape) {
  .page-header {
    padding: 1rem 0;
    margin-bottom: 1rem;
  }
  
  .current-phase {
    padding: 1rem;
  }
  
  .focus-point {
    width: 60px;
    height: 60px;
  }
  
  .focus-icon {
    font-size: 1.5rem;
  }
  
  .completion-card {
    padding: 1.5rem;
  }
  
  .completion-icon {
    font-size: 2.5rem;
  }
}

/* 触控设备通用优化 */
@media (hover: none) and (pointer: coarse) {
  .exercise-card,
  .control-btn,
  .action-btn,
  .reflection-btn,
  .start-training-btn {
    /* 增加触控目标大小 */
    min-height: 44px;
    /* 移除悬停效果 */
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }
  
  .exercise-card:hover,
  .control-btn:hover,
  .action-btn:hover,
  .reflection-btn:hover,
  .start-training-btn:hover {
    transform: none;
  }
  
  /* 添加触控反馈 */
  .exercise-card:active,
  .control-btn:active,
  .action-btn:active,
  .reflection-btn:active,
  .start-training-btn:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-sm);
  }
}
</style>