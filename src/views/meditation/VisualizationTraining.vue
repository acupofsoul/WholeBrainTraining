<template>
  <div class="visualization-training-container">

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-background">
        <div class="visualization-elements">
          <div class="floating-shape shape-1">🌟</div>
          <div class="floating-shape shape-2">🌈</div>
          <div class="floating-shape shape-3">🦋</div>
          <div class="floating-shape shape-4">🌸</div>
        </div>
      </div>
      <h1>🌈 想象力训练</h1>
      <p class="page-description">
        通过引导想象激发孩子的创造力和右脑潜能。
        想象力是创造力的源泉，也是全脑开发的重要组成部分。
      </p>
    </div>

    <!-- 想象主题选择 -->
    <div class="visualization-themes">
      <h2 class="section-title">选择想象主题</h2>
      <div class="themes-grid">
        <div 
          v-for="theme in visualizationThemes" 
          :key="theme.id"
          class="theme-card"
          :class="{ active: selectedTheme?.id === theme.id }"
          @click="selectTheme(theme)"
        >
          <div class="theme-icon">{{ theme.icon }}</div>
          <h3>{{ theme.name }}</h3>
          <p>{{ theme.description }}</p>
          <div class="theme-features">
            <span v-for="feature in theme.features" :key="feature" class="feature-tag">
              {{ feature }}
            </span>
          </div>
          <div class="theme-info">
            <div class="info-item">
              <span class="info-label">时长：</span>
              <span class="info-value">{{ theme.duration }}分钟</span>
            </div>
            <div class="info-item">
              <span class="info-label">适合年龄：</span>
              <span class="info-value">{{ theme.ageRange }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练准备 -->
    <div v-if="selectedTheme && !isTraining" class="training-setup">
      <div class="setup-card">
        <h3>准备开始：{{ selectedTheme.name }}</h3>
        <div class="setup-preview">
          <div class="preview-icon">{{ selectedTheme.icon }}</div>
          <div class="preview-text">
            <p>{{ selectedTheme.preview }}</p>
          </div>
        </div>
        <div class="setup-tips">
          <h4>💡 想象提示</h4>
          <ul>
            <li v-for="tip in selectedTheme.tips" :key="tip">{{ tip }}</li>
          </ul>
        </div>
        <button class="start-training-btn" @click="startTraining">
          <span class="btn-icon">✨</span>
          开始想象之旅
        </button>
      </div>
    </div>

    <!-- 想象训练进行中 -->
    <div v-if="isTraining" class="training-active">
      <div class="training-header">
        <h2>{{ selectedTheme.name }}</h2>
        <div class="training-info">
          <span class="step-counter">{{ currentStepIndex + 1 }}/{{ selectedTheme.steps.length }} 步骤</span>
          <span class="theme-duration">总时长: {{ selectedTheme.duration }}分钟</span>
        </div>
      </div>

      <!-- 增强的视觉引导组件 -->
      <VisualizationGuide
        :is-active="isTraining && !isPaused"
        :current-step="currentStep"
        :current-step-index="currentStepIndex"
        :steps="selectedTheme.steps"
        :time-left="stepTimeLeft"
        :total-time="currentStep?.duration || 0"
        :show-hints="true"
        :show-emotion-feedback="showEmotionFeedback"
        @step-change="jumpToStep"
        @emotion-selected="onEmotionSelected"
        @interaction="onInteraction"
      />

      <!-- 当前步骤说明 -->
      <div class="step-description">
        <h3>{{ currentStep.title }}</h3>
        <p class="step-instruction">{{ currentStep.instruction }}</p>
      </div>

      <!-- 控制按钮 -->
      <div class="training-controls">
        <button class="control-btn prev" @click="previousStep" :disabled="currentStepIndex === 0">
          ⬅️ 上一步
        </button>
        <button class="control-btn pause" @click="pauseTraining" v-if="!isPaused">
          ⏸️ 暂停
        </button>
        <button class="control-btn resume" @click="resumeTraining" v-if="isPaused">
          ▶️ 继续
        </button>
        <button class="control-btn next" @click="nextStep" :disabled="currentStepIndex === selectedTheme.steps.length - 1">
          下一步 ➡️
        </button>
        <button class="control-btn stop" @click="stopTraining">
          ⏹️ 结束
        </button>
      </div>

      <!-- 暂停状态提示 -->
      <div v-if="isPaused" class="pause-overlay">
        <div class="pause-content">
          <div class="pause-icon">⏸️</div>
          <h3>训练已暂停</h3>
          <p>点击继续按钮恢复想象之旅</p>
        </div>
      </div>
    </div>

    <!-- 训练完成 -->
    <div v-if="trainingCompleted" class="training-completed">
      <div class="completion-card">
        <div class="completion-animation">
          <div class="completion-icon">🎉</div>
          <div class="sparkles">
            <span class="sparkle">✨</span>
            <span class="sparkle">⭐</span>
            <span class="sparkle">🌟</span>
          </div>
        </div>
        <h2>想象之旅完成！</h2>
        <p>恭喜完成{{ selectedTheme.name }}训练</p>
        <div class="completion-reflection">
          <h4>🎨 创作分享</h4>
          <p>你可以把刚才想象的内容画出来或者讲给家人听！</p>
        </div>
        <div class="completion-actions">
          <button class="action-btn primary" @click="restartTraining">
            🔄 再次体验
          </button>
          <button class="action-btn secondary" @click="selectNewTheme">
            🌈 选择其他主题
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import VisualizationGuide from '@/components/VisualizationGuide.vue';
import meditationStorage from '@/utils/meditationStorage.js';

// 想象主题数据
const visualizationThemes = ref([
  {
    id: 1,
    name: '魔法花园',
    icon: '🌺',
    description: '在神奇的花园中探索，与花朵和小动物交朋友',
    duration: 8,
    ageRange: '3-8岁',
    features: ['自然探索', '动物朋友', '色彩丰富'],
    preview: '想象你走进一个充满魔法的花园，那里有会说话的花朵和友善的小动物...',
    tips: [
      '闭上眼睛，想象你最喜欢的颜色',
      '听听花园里有什么声音',
      '想象你能闻到什么香味',
      '和小动物们打招呼吧'
    ],
    steps: [
      {
        title: '进入花园',
        icon: '🚪',
        instruction: '想象你推开一扇美丽的花园门，阳光洒在你的脸上，你看到了什么？',
        duration: 60,
        animation: 'fade-in'
      },
      {
        title: '探索花朵',
        icon: '🌸',
        instruction: '走近那些五彩斑斓的花朵，它们在向你点头微笑，你最喜欢哪一朵？',
        duration: 90,
        animation: 'bloom'
      },
      {
        title: '遇见小动物',
        icon: '🐰',
        instruction: '一只可爱的小兔子蹦蹦跳跳地来到你身边，它想和你做朋友',
        duration: 90,
        animation: 'bounce'
      },
      {
        title: '魔法时刻',
        icon: '✨',
        instruction: '花园里开始下起了彩色的雨滴，每一滴都闪闪发光，感受这份魔法',
        duration: 90,
        animation: 'sparkle'
      },
      {
        title: '告别花园',
        icon: '👋',
        instruction: '是时候告别了，向花朵和小动物们挥手，记住这美好的时光',
        duration: 60,
        animation: 'wave'
      }
    ]
  },
  {
    id: 2,
    name: '太空冒险',
    icon: '🚀',
    description: '乘坐宇宙飞船探索神秘的太空世界',
    duration: 10,
    ageRange: '5-12岁',
    features: ['科幻探索', '星球旅行', '想象力飞跃'],
    preview: '穿上宇航服，登上你的专属飞船，准备开始一场激动人心的太空之旅...',
    tips: [
      '想象你在失重状态下飘浮',
      '看看窗外美丽的星空',
      '想象不同星球的样子',
      '感受宇宙的神秘和广阔'
    ],
    steps: [
      {
        title: '准备发射',
        icon: '🚀',
        instruction: '坐在飞船驾驶座上，按下发射按钮，感受飞船缓缓升空',
        duration: 60,
        animation: 'launch'
      },
      {
        title: '穿越大气层',
        icon: '🌍',
        instruction: '透过窗户看到地球越来越小，你现在在太空中了！',
        duration: 90,
        animation: 'float'
      },
      {
        title: '遇见外星朋友',
        icon: '👽',
        instruction: '一个友善的外星人向你挥手，它想带你参观它的星球',
        duration: 120,
        animation: 'alien-wave'
      },
      {
        title: '探索新星球',
        icon: '🪐',
        instruction: '降落在一个有着紫色天空和银色树木的神奇星球上',
        duration: 120,
        animation: 'planet-explore'
      },
      {
        title: '返回地球',
        icon: '🏠',
        instruction: '是时候回家了，带着美好的回忆返回温暖的地球',
        duration: 60,
        animation: 'return'
      }
    ]
  },
  {
    id: 3,
    name: '海底世界',
    icon: '🐠',
    description: '潜入深海，探索神秘的海底王国',
    duration: 12,
    ageRange: '4-10岁',
    features: ['海洋探索', '水下冒险', '生物认知'],
    preview: '戴上神奇的呼吸面罩，潜入蔚蓝的大海，发现海底的奇妙世界...',
    tips: [
      '想象水的清凉感觉',
      '听听海浪和海豚的声音',
      '看看五彩斑斓的珊瑚',
      '和海洋生物们打招呼'
    ],
    steps: [
      {
        title: '潜入大海',
        icon: '🌊',
        instruction: '慢慢潜入清澈的海水中，感受水的包围和宁静',
        duration: 60,
        animation: 'dive'
      },
      {
        title: '珊瑚花园',
        icon: '🪸',
        instruction: '游到美丽的珊瑚礁，看到各种颜色的珊瑚在水中摇摆',
        duration: 90,
        animation: 'coral-sway'
      },
      {
        title: '海豚朋友',
        icon: '🐬',
        instruction: '一群友善的海豚游过来，邀请你和它们一起游泳',
        duration: 120,
        animation: 'dolphin-swim'
      },
      {
        title: '海底宝藏',
        icon: '💎',
        instruction: '发现一个闪闪发光的宝箱，里面装满了美丽的珍珠和宝石',
        duration: 90,
        animation: 'treasure-glow'
      },
      {
        title: '浮出水面',
        icon: '☀️',
        instruction: '慢慢游向海面，感受阳光透过水面洒在你身上',
        duration: 60,
        animation: 'surface'
      }
    ]
  }
]);

// 状态管理
const selectedTheme = ref(null);
const isTraining = ref(false);
const isPaused = ref(false);
const trainingCompleted = ref(false);
const currentStepIndex = ref(0);
const stepTimeLeft = ref(0);
const showEmotionFeedback = ref(false);
const sessionData = ref(null);
const userEmotions = ref([]);
const interactionCount = ref(0);

// 定时器
let stepTimer = null;
let emotionTimer = null;

// 计算属性
const currentStep = computed(() => {
  if (!selectedTheme.value || !selectedTheme.value.steps) return null;
  return selectedTheme.value.steps[currentStepIndex.value];
});

const progressPercentage = computed(() => {
  if (!selectedTheme.value) return 0;
  return ((currentStepIndex.value + 1) / selectedTheme.value.steps.length) * 100;
});

// 方法
const selectTheme = (theme) => {
  selectedTheme.value = theme;
  trainingCompleted.value = false;
};

const startTraining = () => {
  isTraining.value = true;
  currentStepIndex.value = 0;
  resetSession();
  startSession();
  startStep();
};

const startStep = () => {
  if (!currentStep.value) return;
  
  stepTimeLeft.value = currentStep.value.duration;
  
  stepTimer = setInterval(() => {
    if (!isPaused.value) {
      stepTimeLeft.value--;
      
      if (stepTimeLeft.value <= 0) {
        nextStep();
      }
    }
  }, 1000);
};

const nextStep = () => {
  clearInterval(stepTimer);
  
  // 显示情绪反馈提示
  showEmotionPrompt();
  
  if (currentStepIndex.value < selectedTheme.value.steps.length - 1) {
    currentStepIndex.value++;
    startStep();
  } else {
    completeTraining();
  }
};

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    clearInterval(stepTimer);
    currentStepIndex.value--;
    startStep();
  }
};

const pauseTraining = () => {
  isPaused.value = true;
};

const resumeTraining = () => {
  isPaused.value = false;
};

const stopTraining = () => {
  isTraining.value = false;
  isPaused.value = false;
  clearInterval(stepTimer);
  endSession();
};

const completeTraining = () => {
  isTraining.value = false;
  trainingCompleted.value = true;
  clearInterval(stepTimer);
  endSession();
};

const restartTraining = () => {
  trainingCompleted.value = false;
  startTraining();
};

const selectNewTheme = () => {
  selectedTheme.value = null;
  trainingCompleted.value = false;
  isTraining.value = false;
  resetSession();
};

// 新增的交互方法
const jumpToStep = (stepIndex) => {
  if (stepIndex >= 0 && stepIndex < selectedTheme.value.steps.length) {
    clearInterval(stepTimer);
    currentStepIndex.value = stepIndex;
    startStep();
    interactionCount.value++;
  }
};

const onEmotionSelected = (emotionId) => {
  const emotion = {
    id: emotionId,
    stepIndex: currentStepIndex.value,
    timestamp: Date.now()
  };
  userEmotions.value.push(emotion);
  
  // 保存情绪数据
  if (sessionData.value) {
    sessionData.value.emotions = userEmotions.value;
    meditationStorage.updateSession(sessionData.value.id, sessionData.value);
  }
  
  // 隐藏情绪反馈界面
  showEmotionFeedback.value = false;
};

const onInteraction = (type) => {
  interactionCount.value++;
  console.log('用户交互:', type);
};

const showEmotionPrompt = () => {
  // 在特定步骤显示情绪反馈
  const emotionSteps = [1, 3, 4]; // 在第2、4、5步显示情绪反馈
  if (emotionSteps.includes(currentStepIndex.value)) {
    showEmotionFeedback.value = true;
    
    // 5秒后自动隐藏
    emotionTimer = setTimeout(() => {
      showEmotionFeedback.value = false;
    }, 5000);
  }
};

const startSession = () => {
  sessionData.value = {
    id: Date.now().toString(),
    type: 'visualization',
    theme: selectedTheme.value.name,
    startTime: Date.now(),
    duration: selectedTheme.value.duration * 60, // 转换为秒
    steps: selectedTheme.value.steps.length,
    emotions: [],
    interactions: 0,
    completed: false
  };
  
  meditationStorage.saveSession(sessionData.value);
};

const endSession = () => {
  if (sessionData.value) {
    sessionData.value.endTime = Date.now();
    sessionData.value.actualDuration = Math.floor((sessionData.value.endTime - sessionData.value.startTime) / 1000);
    sessionData.value.interactions = interactionCount.value;
    sessionData.value.completed = trainingCompleted.value;
    
    meditationStorage.updateSession(sessionData.value.id, sessionData.value);
    
    // 更新统计数据
    const stats = meditationStorage.getStatistics();
    stats.totalVisualizationSessions = (stats.totalVisualizationSessions || 0) + 1;
    stats.totalVisualizationTime = (stats.totalVisualizationTime || 0) + sessionData.value.actualDuration;
    meditationStorage.updateStatistics(stats);
  }
};

const resetSession = () => {
  sessionData.value = null;
  userEmotions.value = [];
  interactionCount.value = 0;
  showEmotionFeedback.value = false;
};

// 生命周期
onUnmounted(() => {
  if (stepTimer) {
    clearInterval(stepTimer);
  }
  if (emotionTimer) {
    clearTimeout(emotionTimer);
  }
  
  // 保存会话数据
  if (sessionData.value && isTraining.value) {
    endSession();
  }
});
</script>

<style scoped>
.visualization-training-container {
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
    rgba(255, 107, 107, 0.1) 0%, 
    rgba(255, 107, 107, 0.05) 100%);
  border-radius: 20px;
  overflow: hidden;
}

.visualization-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.floating-shape {
  position: absolute;
  font-size: 2rem;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  top: 30%;
  right: 15%;
  animation-delay: 1.5s;
}

.shape-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: 3s;
}

.shape-4 {
  bottom: 20%;
  right: 10%;
  animation-delay: 4.5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
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

.themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.theme-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: center;
}

.theme-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(255, 107, 107, 0.3);
}

.theme-card.active {
  border-color: #FF6B6B;
  background: rgba(255, 107, 107, 0.05);
}

.theme-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.theme-card h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.theme-card p {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.theme-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.feature-tag {
  background: rgba(255, 107, 107, 0.1);
  color: #FF6B6B;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.theme-info {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.info-item {
  flex: 1;
}

.info-label {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.info-value {
  color: #FF6B6B;
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

.setup-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 107, 107, 0.05);
  border-radius: 12px;
}

.preview-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.preview-text {
  flex: 1;
  text-align: left;
}

.preview-text p {
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.setup-tips {
  text-align: left;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 107, 107, 0.05);
  border-radius: 12px;
}

.setup-tips h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.setup-tips ul {
  list-style: none;
  padding: 0;
}

.setup-tips li {
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.setup-tips li::before {
  content: '✨';
  position: absolute;
  left: 0;
}

.start-training-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
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
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
}

.training-header {
  text-align: center;
  margin-bottom: 2rem;
}

.training-header h2 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.training-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.step-counter,
.theme-duration {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 20px;
  font-weight: 500;
}

.step-description {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: var(--shadow-md);
  text-align: center;
}

.step-description h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.step-instruction {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.pause-content {
  text-align: center;
  color: white;
  padding: 2rem;
}

.pause-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

.pause-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: white;
}

.pause-content p {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* 旧的current-step样式已被VisualizationGuide组件替代 */

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

.control-btn:hover:not(:disabled) {
  background: rgba(var(--color-primary-rgb), 0.1);
  transform: translateY(-2px);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.stop {
  border-color: rgba(220, 53, 69, 0.3);
  color: #dc3545;
}

.control-btn.stop:hover {
  background: rgba(220, 53, 69, 0.1);
}

.training-completed {
  max-width: 500px;
  margin: 0 auto;
}

.completion-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.completion-animation {
  position: relative;
  margin-bottom: 2rem;
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.sparkles {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
}

.sparkle {
  position: absolute;
  font-size: 1.5rem;
  animation: sparkleFloat 3s ease-in-out infinite;
}

.sparkle:nth-child(1) {
  left: 20%;
  animation-delay: 0s;
}

.sparkle:nth-child(2) {
  left: 50%;
  animation-delay: 1s;
}

.sparkle:nth-child(3) {
  left: 80%;
  animation-delay: 2s;
}

@keyframes sparkleFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
}

.completion-card h2 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 2rem;
}

.completion-card p {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.completion-reflection {
  background: rgba(255, 107, 107, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.completion-reflection h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.completion-reflection p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 1rem;
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
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
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
  .visualization-training-container {
    padding: 1rem;
  }
  
  .themes-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }
  
  .theme-card {
    padding: 1.5rem;
  }
  
  .training-active {
    max-width: 100%;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .visualization-training-container {
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
  
  .themes-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .theme-card {
    padding: 1.5rem;
    margin: 0;
    border-radius: 12px;
    /* 增强触控反馈 */
    -webkit-tap-highlight-color: rgba(149, 225, 211, 0.2);
    touch-action: manipulation;
  }
  
  .theme-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  .theme-icon {
    font-size: 2.5rem;
  }
  
  .setup-preview {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .setup-info {
    padding: 1rem;
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
  
  .training-info {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .step-description {
    padding: 1.5rem 1rem;
    margin-bottom: 1.5rem;
  }
  
  .step-instruction {
    font-size: 1rem;
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
  
  .pause-overlay {
    padding: 2rem 1rem;
  }
  
  .pause-content h3 {
    font-size: 1.3rem;
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
}

/* 小屏手机优化 */
@media (max-width: 480px) {
  .visualization-training-container {
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
  
  .theme-card {
    padding: 1rem;
  }
  
  .theme-icon {
    font-size: 2rem;
  }
  
  .step-description {
    padding: 1rem 0.8rem;
  }
  
  .step-instruction {
    font-size: 0.95rem;
  }
  
  .completion-card {
    padding: 1.5rem 0.8rem;
  }
  
  .completion-icon {
    font-size: 2.5rem;
  }
  
  .completion-header h2 {
    font-size: 1.4rem;
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
  
  .step-description {
    padding: 1rem;
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
  .theme-card,
  .control-btn,
  .action-btn,
  .start-training-btn {
    /* 增加触控目标大小 */
    min-height: 44px;
    /* 移除悬停效果 */
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }
  
  .theme-card:hover,
  .control-btn:hover,
  .action-btn:hover,
  .start-training-btn:hover {
    transform: none;
  }
  
  /* 添加触控反馈 */
  .theme-card:active,
  .control-btn:active,
  .action-btn:active,
  .start-training-btn:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-sm);
  }
}
</style>