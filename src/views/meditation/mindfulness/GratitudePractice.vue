<template>
  <div class="gratitude-practice-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-background">
        <div class="gratitude-hearts">
          <div class="heart" v-for="n in 6" :key="n" :class="`heart-${n}`">💖</div>
        </div>
      </div>
      <h1>🙏 感恩练习</h1>
      <p class="page-description">
        通过感恩练习，培养积极的心态和对生活的感激之情。
        学会发现生活中的美好，让内心充满温暖和喜悦。
      </p>
    </div>

    <!-- 练习说明 -->
    <div class="practice-intro">
      <div class="intro-card">
        <h2>练习指导</h2>
        <div class="instructions">
          <div class="instruction-item">
            <span class="step-number">1</span>
            <p>找一个安静舒适的地方坐下</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">2</span>
            <p>闭上眼睛，深呼吸几次放松身心</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">3</span>
            <p>回想今天或最近值得感恩的事情</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">4</span>
            <p>感受内心涌起的温暖和感激</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">5</span>
            <p>将这份感恩之情传递给身边的人</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 练习控制 -->
    <div class="practice-controls">
      <div class="control-panel">
        <div class="timer-display">
          <div class="time-remaining">{{ formatTime(timeRemaining) }}</div>
          <div class="total-time">/ {{ formatTime(totalDuration) }}</div>
        </div>
        
        <div class="gratitude-guide" v-if="isTraining">
          <div class="current-phase">
            <div class="phase-icon">{{ currentPhase?.focusIcon }}</div>
            <div class="phase-info">
              <h3>{{ currentPhase?.title }}</h3>
              <p>{{ currentPhase?.guidance }}</p>
            </div>
          </div>
          
          <!-- 感恩主题 -->
          <div class="gratitude-theme" v-if="showTheme">
            <div class="theme-card">
              <h4>{{ currentTheme?.title }}</h4>
              <p>{{ currentTheme?.description }}</p>
              <div class="theme-examples">
                <span 
                  v-for="example in currentTheme?.examples" 
                  :key="example"
                  class="example-tag"
                >
                  {{ example }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 感恩记录 -->
          <div class="gratitude-input" v-if="showInput">
            <h4>此刻你最感恩什么？</h4>
            <div class="input-section">
              <textarea 
                v-model="currentGratitude"
                placeholder="写下你的感恩..."
                class="gratitude-textarea"
                @keyup.enter="addGratitude"
              ></textarea>
              <button 
                class="add-btn"
                @click="addGratitude"
                :disabled="!currentGratitude.trim()"
              >
                💖 添加感恩
              </button>
            </div>
          </div>
          
          <!-- 感恩列表 -->
          <div class="gratitude-list" v-if="gratitudeItems.length > 0">
            <h4>感恩清单</h4>
            <div class="gratitude-items">
              <div 
                v-for="(item, index) in gratitudeItems" 
                :key="index"
                class="gratitude-item"
              >
                <span class="item-icon">🌟</span>
                <span class="item-text">{{ item.text }}</span>
                <span class="item-time">{{ item.time }}</span>
              </div>
            </div>
          </div>
          
          <div class="phase-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: phaseProgress + '%' }"
              ></div>
            </div>
            <div class="phase-time">{{ formatTime(phaseTimeRemaining) }}</div>
          </div>
        </div>

        <div class="control-buttons">
          <button 
            v-if="!isTraining" 
            class="start-btn"
            @click="startPractice"
          >
            🙏 开始感恩
          </button>
          
          <template v-else>
            <button 
              class="pause-btn"
              @click="togglePause"
            >
              {{ isPaused ? '▶️ 继续' : '⏸️ 暂停' }}
            </button>
            <button 
              class="stop-btn"
              @click="stopPractice"
            >
              ⏹️ 结束
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- 练习完成 -->
    <div v-if="practiceCompleted" class="completion-section">
      <div class="completion-card">
        <h2>🎉 练习完成</h2>
        <p>恭喜你完成了感恩练习！愿这份感恩之心伴随你每一天。</p>
        
        <div class="gratitude-summary">
          <h3>今日感恩</h3>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-icon">💖</span>
              <div class="stat-info">
                <span class="stat-value">{{ gratitudeItems.length }}</span>
                <span class="stat-label">感恩事项</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⏱️</span>
              <div class="stat-info">
                <span class="stat-value">{{ Math.ceil(totalDuration / 60) }}</span>
                <span class="stat-label">分钟</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🌟</span>
              <div class="stat-info">
                <span class="stat-value">{{ happinessLevel }}</span>
                <span class="stat-label">幸福指数</span>
              </div>
            </div>
          </div>
          
          <div class="final-gratitude-list" v-if="gratitudeItems.length > 0">
            <h4>你的感恩清单</h4>
            <div class="final-items">
              <div 
                v-for="(item, index) in gratitudeItems" 
                :key="index"
                class="final-item"
              >
                <span class="final-icon">✨</span>
                <span class="final-text">{{ item.text }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="gratitude-affirmation">
          <div class="affirmation-card">
            <h4>感恩宣言</h4>
            <p class="affirmation-text">{{ selectedAffirmation }}</p>
            <button class="change-affirmation" @click="changeAffirmation">
              🔄 换一句
            </button>
          </div>
        </div>

        <div class="completion-actions">
          <button class="action-btn primary" @click="restartPractice">
            🔄 再次练习
          </button>
          <button class="action-btn secondary" @click="goBack">
            🔙 返回选择
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

// 路由
const router = useRouter();

// 练习阶段
const phases = ref([
  {
    title: '内心准备',
    guidance: '深呼吸，让心情平静下来，准备开始感恩之旅',
    focusIcon: '🧘‍♀️',
    duration: 60,
    showTheme: false,
    showInput: false
  },
  {
    title: '感恩家人',
    guidance: '想想你的家人，他们给你带来的温暖和支持',
    focusIcon: '👨‍👩‍👧‍👦',
    duration: 120,
    showTheme: true,
    showInput: true,
    themeIndex: 0
  },
  {
    title: '感恩朋友',
    guidance: '回想朋友们的陪伴，那些美好的时光和真挚的友谊',
    focusIcon: '👫',
    duration: 120,
    showTheme: true,
    showInput: true,
    themeIndex: 1
  },
  {
    title: '感恩生活',
    guidance: '感受生活中的小确幸，那些平凡却珍贵的瞬间',
    focusIcon: '🌈',
    duration: 120,
    showTheme: true,
    showInput: true,
    themeIndex: 2
  },
  {
    title: '感恩自己',
    guidance: '感谢自己的努力和成长，接纳并爱护自己',
    focusIcon: '💝',
    duration: 90,
    showTheme: true,
    showInput: true,
    themeIndex: 3
  },
  {
    title: '传递感恩',
    guidance: '将这份感恩之心传递出去，让爱与温暖延续',
    focusIcon: '🌟',
    duration: 90,
    showTheme: false,
    showInput: false
  }
]);

// 感恩主题
const gratitudeThemes = ref([
  {
    title: '感恩家人',
    description: '家人是我们最坚实的后盾，给予我们无条件的爱与支持',
    examples: ['父母的关爱', '伴侣的理解', '孩子的纯真', '兄弟姐妹的陪伴']
  },
  {
    title: '感恩朋友',
    description: '朋友让我们的生活更加丰富多彩，在困难时给予帮助',
    examples: ['真诚的友谊', '患难见真情', '快乐的分享', '心灵的慰藉']
  },
  {
    title: '感恩生活',
    description: '生活中处处有美好，每一个平凡的日子都值得珍惜',
    examples: ['健康的身体', '温暖的家', '美味的食物', '美丽的风景']
  },
  {
    title: '感恩自己',
    description: '感谢自己的坚持和努力，每一次成长都值得庆祝',
    examples: ['不懈的努力', '勇敢的选择', '善良的心', '成长的足迹']
  }
]);

// 感恩宣言
const affirmations = ref([
  '我心怀感恩，生活因此更加美好',
  '感恩让我的心充满温暖和喜悦',
  '我感谢生命中的每一个美好瞬间',
  '感恩之心让我看到世界的美丽',
  '我用感恩的心拥抱每一天',
  '感恩让我的生活充满正能量',
  '我感谢所有帮助过我的人',
  '感恩之心是我最珍贵的财富'
]);

// 练习状态
const isTraining = ref(false);
const isPaused = ref(false);
const practiceCompleted = ref(false);
const currentPhaseIndex = ref(0);
const phaseTimeElapsed = ref(0);
const timeRemaining = ref(0);
const totalDuration = ref(0);
const currentGratitude = ref('');
const gratitudeItems = ref([]);
const selectedAffirmation = ref('');
const happinessLevel = ref('95%');

// 定时器
let practiceTimer = null;

// 计算属性
const currentPhase = computed(() => {
  return phases.value[currentPhaseIndex.value] || phases.value[0];
});

const currentTheme = computed(() => {
  const themeIndex = currentPhase.value.themeIndex;
  return themeIndex !== undefined ? gratitudeThemes.value[themeIndex] : null;
});

const phaseTimeRemaining = computed(() => {
  return currentPhase.value.duration - phaseTimeElapsed.value;
});

const phaseProgress = computed(() => {
  return (phaseTimeElapsed.value / currentPhase.value.duration) * 100;
});

const showTheme = computed(() => {
  return currentPhase.value.showTheme && isTraining.value && !isPaused.value;
});

const showInput = computed(() => {
  return currentPhase.value.showInput && isTraining.value && !isPaused.value;
});

/**
 * 格式化时间显示
 * @param {number} seconds - 秒数
 * @returns {string} 格式化的时间字符串
 */
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 计算总时长
 */
const calculateTotalDuration = () => {
  return phases.value.reduce((total, phase) => total + phase.duration, 0);
};

/**
 * 开始练习
 */
const startPractice = () => {
  isTraining.value = true;
  practiceCompleted.value = false;
  currentPhaseIndex.value = 0;
  phaseTimeElapsed.value = 0;
  totalDuration.value = calculateTotalDuration();
  timeRemaining.value = totalDuration.value;
  gratitudeItems.value = [];
  currentGratitude.value = '';
  
  // 随机选择一个感恩宣言
  const randomIndex = Math.floor(Math.random() * affirmations.value.length);
  selectedAffirmation.value = affirmations.value[randomIndex];
  
  startTimer();
};

/**
 * 开始计时器
 */
const startTimer = () => {
  practiceTimer = setInterval(() => {
    if (!isPaused.value) {
      phaseTimeElapsed.value++;
      timeRemaining.value--;
      
      // 检查当前阶段是否完成
      if (phaseTimeElapsed.value >= currentPhase.value.duration) {
        nextPhase();
      }
      
      // 检查整个练习是否完成
      if (timeRemaining.value <= 0) {
        completePractice();
      }
    }
  }, 1000);
};

/**
 * 进入下一阶段
 */
const nextPhase = () => {
  if (currentPhaseIndex.value < phases.value.length - 1) {
    currentPhaseIndex.value++;
    phaseTimeElapsed.value = 0;
    currentGratitude.value = '';
  }
};

/**
 * 添加感恩事项
 */
const addGratitude = () => {
  if (currentGratitude.value.trim()) {
    const currentTime = formatTime(totalDuration.value - timeRemaining.value);
    gratitudeItems.value.push({
      text: currentGratitude.value.trim(),
      time: currentTime,
      phase: currentPhase.value.title
    });
    currentGratitude.value = '';
  }
};

/**
 * 更换感恩宣言
 */
const changeAffirmation = () => {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * affirmations.value.length);
  } while (affirmations.value[newIndex] === selectedAffirmation.value && affirmations.value.length > 1);
  
  selectedAffirmation.value = affirmations.value[newIndex];
};

/**
 * 切换暂停状态
 */
const togglePause = () => {
  isPaused.value = !isPaused.value;
};

/**
 * 停止练习
 */
const stopPractice = () => {
  isTraining.value = false;
  isPaused.value = false;
  
  if (practiceTimer) {
    clearInterval(practiceTimer);
    practiceTimer = null;
  }
};

/**
 * 完成练习
 */
const completePractice = () => {
  stopPractice();
  practiceCompleted.value = true;
};

/**
 * 重新开始练习
 */
const restartPractice = () => {
  practiceCompleted.value = false;
  startPractice();
};

/**
 * 返回上级页面
 */
const goBack = () => {
  router.push('/meditation/mindfulness');
};

// 组件挂载时初始化
onMounted(() => {
  // 初始化感恩宣言
  if (affirmations.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * affirmations.value.length);
    selectedAffirmation.value = affirmations.value[randomIndex];
  }
});

// 组件卸载时清理定时器
onUnmounted(() => {
  stopPractice();
});
</script>

<style scoped>
.gratitude-practice-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff8e1 0%, #fce4ec 100%);
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(45deg, #ffcc80, #f8bbd9);
  opacity: 0.1;
}

.gratitude-hearts {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.heart {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.4;
  animation: heartFloat 8s ease-in-out infinite;
}

.heart-1 {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.heart-2 {
  top: 60%;
  left: 80%;
  animation-delay: 1s;
}

.heart-3 {
  top: 40%;
  left: 70%;
  animation-delay: 2s;
}

.heart-4 {
  top: 80%;
  left: 25%;
  animation-delay: 3s;
}

.heart-5 {
  top: 30%;
  left: 10%;
  animation-delay: 4s;
}

.heart-6 {
  top: 70%;
  left: 60%;
  animation-delay: 5s;
}

@keyframes heartFloat {
  0%, 100% { 
    transform: translateY(0px) scale(1);
    opacity: 0.4;
  }
  50% { 
    transform: translateY(-15px) scale(1.1);
    opacity: 0.7;
  }
}

.page-header h1 {
  font-size: 2.5rem;
  color: #d84315;
  margin: 20px 0;
  position: relative;
  z-index: 1;
}

.page-description {
  font-size: 1.1rem;
  color: #555;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.practice-intro {
  max-width: 800px;
  margin: 0 auto 40px;
}

.intro-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.intro-card h2 {
  color: #d84315;
  margin-bottom: 20px;
  text-align: center;
}

.instructions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ffcc80;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.instruction-item p {
  margin: 0;
  color: #555;
  line-height: 1.5;
}

.practice-controls {
  max-width: 600px;
  margin: 0 auto 40px;
}

.control-panel {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
}

.timer-display {
  margin-bottom: 20px;
}

.time-remaining {
  font-size: 3rem;
  font-weight: bold;
  color: #d84315;
}

.total-time {
  font-size: 1.2rem;
  color: #666;
  margin-top: 5px;
}

.gratitude-guide {
  margin: 20px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 10px;
}

.current-phase {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.phase-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.phase-info h3 {
  margin: 0 0 5px 0;
  color: #d84315;
  font-size: 1.2rem;
}

.phase-info p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.gratitude-theme {
  margin: 20px 0;
}

.theme-card {
  padding: 15px;
  background: white;
  border-radius: 10px;
  border: 2px solid #ffcc80;
}

.theme-card h4 {
  margin: 0 0 10px 0;
  color: #d84315;
  text-align: center;
}

.theme-card p {
  margin: 0 0 15px 0;
  color: #666;
  text-align: center;
  font-size: 0.9rem;
}

.theme-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.example-tag {
  padding: 4px 8px;
  background: #fff3e0;
  border: 1px solid #ffcc80;
  border-radius: 15px;
  font-size: 0.8rem;
  color: #d84315;
}

.gratitude-input {
  margin: 20px 0;
}

.gratitude-input h4 {
  margin: 0 0 15px 0;
  color: #d84315;
  text-align: center;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gratitude-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 2px solid #ffcc80;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.gratitude-textarea:focus {
  outline: none;
  border-color: #d84315;
}

.add-btn {
  padding: 10px 20px;
  background: #ffcc80;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: center;
}

.add-btn:hover:not(:disabled) {
  background: #ffb74d;
  transform: translateY(-2px);
}

.add-btn:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
}

.gratitude-list {
  margin: 20px 0;
}

.gratitude-list h4 {
  margin: 0 0 15px 0;
  color: #d84315;
  text-align: center;
}

.gratitude-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
}

.gratitude-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #ffcc80;
}

.item-icon {
  flex-shrink: 0;
}

.item-text {
  flex: 1;
  color: #555;
  font-size: 0.9rem;
}

.item-time {
  font-size: 0.8rem;
  color: #999;
  flex-shrink: 0;
}

.phase-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffcc80, #f8bbd9);
  transition: width 0.3s ease;
}

.phase-time {
  font-size: 0.9rem;
  color: #666;
  min-width: 40px;
}

.control-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.start-btn, .pause-btn, .stop-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn {
  background: #ffcc80;
  color: white;
}

.start-btn:hover {
  background: #ffb74d;
  transform: translateY(-2px);
}

.pause-btn {
  background: #81c784;
  color: white;
}

.pause-btn:hover {
  background: #66bb6a;
}

.stop-btn {
  background: #e57373;
  color: white;
}

.stop-btn:hover {
  background: #ef5350;
}

.completion-section {
  max-width: 600px;
  margin: 0 auto;
}

.completion-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
}

.completion-card h2 {
  color: #d84315;
  margin-bottom: 15px;
}

.gratitude-summary {
  margin: 20px 0;
}

.gratitude-summary h3 {
  margin: 0 0 15px 0;
  color: #d84315;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 10px;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #d84315;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
}

.final-gratitude-list {
  margin: 20px 0;
  padding: 15px;
  background: #fff3e0;
  border-radius: 10px;
}

.final-gratitude-list h4 {
  margin: 0 0 15px 0;
  color: #d84315;
}

.final-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.final-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  text-align: left;
}

.final-icon {
  flex-shrink: 0;
}

.final-text {
  color: #555;
  font-size: 0.9rem;
}

.gratitude-affirmation {
  margin: 20px 0;
}

.affirmation-card {
  padding: 20px;
  background: linear-gradient(135deg, #fff3e0, #fce4ec);
  border-radius: 15px;
  border: 2px solid #ffcc80;
}

.affirmation-card h4 {
  margin: 0 0 15px 0;
  color: #d84315;
}

.affirmation-text {
  font-size: 1.1rem;
  color: #555;
  font-style: italic;
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.change-affirmation {
  padding: 8px 16px;
  background: #ffcc80;
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-affirmation:hover {
  background: #ffb74d;
}

.completion-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #ffcc80;
  color: white;
}

.action-btn.primary:hover {
  background: #ffb74d;
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: #e0e0e0;
  color: #555;
}

.action-btn.secondary:hover {
  background: #d5d5d5;
}

@media (max-width: 768px) {
  .gratitude-practice-container {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .intro-card, .control-panel, .completion-card {
    padding: 20px;
  }
  
  .time-remaining {
    font-size: 2.5rem;
  }
  
  .current-phase {
    flex-direction: column;
    text-align: center;
  }
  
  .theme-examples {
    flex-direction: column;
    align-items: center;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .control-buttons, .completion-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .start-btn, .pause-btn, .stop-btn, .action-btn {
    width: 200px;
  }
}
</style>