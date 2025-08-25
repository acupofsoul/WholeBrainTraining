<template>
  <div class="mindful-walking-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-background">
        <div class="walking-path">
          <div class="footstep" v-for="n in 8" :key="n" :class="`step-${n}`"></div>
        </div>
      </div>
      <h1>🚶‍♀️ 正念行走</h1>
      <p class="page-description">
        将正念融入日常行走中，感受每一步的踏实与当下的美好。
        通过专注于行走的感受，培养身心合一的觉察力。
      </p>
    </div>

    <!-- 练习说明 -->
    <div class="practice-intro">
      <div class="intro-card">
        <h2>练习指导</h2>
        <div class="instructions">
          <div class="instruction-item">
            <span class="step-number">1</span>
            <p>选择一个安静的地方，可以是室内或户外</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">2</span>
            <p>开始缓慢地行走，感受脚与地面的接触</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">3</span>
            <p>注意每一步的抬起、移动和落下</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">4</span>
            <p>保持对身体平衡和重心转移的觉察</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">5</span>
            <p>当思绪飘散时，温和地回到行走的感受</p>
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
        
        <div class="walking-guide" v-if="isTraining">
          <div class="current-phase">
            <div class="phase-icon">{{ currentPhase?.focusIcon }}</div>
            <div class="phase-info">
              <h3>{{ currentPhase?.title }}</h3>
              <p>{{ currentPhase?.guidance }}</p>
            </div>
          </div>
          
          <!-- 步伐节拍器 -->
          <div class="step-metronome" v-if="showMetronome">
            <div class="metronome-display">
              <div class="step-indicator" :class="{ active: stepBeat }">
                <span class="foot-icon">👣</span>
                <div class="beat-circle"></div>
              </div>
              <div class="step-count">
                <span class="count-number">{{ stepCount }}</span>
                <span class="count-label">步数</span>
              </div>
            </div>
            <div class="pace-control">
              <label>步伐节奏：</label>
              <select v-model="selectedPace" @change="updatePace">
                <option value="slow">缓慢 (1步/2秒)</option>
                <option value="normal">正常 (1步/1.5秒)</option>
                <option value="fast">较快 (1步/1秒)</option>
              </select>
            </div>
          </div>
          
          <!-- 觉察提醒 -->
          <div class="awareness-reminder" v-if="showReminder">
            <div class="reminder-content">
              <span class="reminder-icon">💡</span>
              <p>{{ currentReminder }}</p>
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
            🚶‍♀️ 开始行走
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
        <p>恭喜你完成了正念行走练习！</p>
        
        <div class="walking-summary">
          <h3>行走记录</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-icon">👣</span>
              <div class="summary-info">
                <span class="summary-value">{{ stepCount }}</span>
                <span class="summary-label">总步数</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-icon">⏱️</span>
              <div class="summary-info">
                <span class="summary-value">{{ Math.ceil(totalDuration / 60) }}</span>
                <span class="summary-label">分钟</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-icon">🎯</span>
              <div class="summary-info">
                <span class="summary-value">{{ focusScore }}</span>
                <span class="summary-label">专注度</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-icon">🌟</span>
              <div class="summary-info">
                <span class="summary-value">{{ awarenessLevel }}</span>
                <span class="summary-label">觉察等级</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="reflection-section">
          <h3>练习感受</h3>
          <div class="reflection-options">
            <button 
              v-for="feeling in reflectionFeelings" 
              :key="feeling.name"
              class="feeling-btn"
              :class="{ selected: selectedFeeling === feeling.name }"
              @click="selectFeeling(feeling.name)"
            >
              <span class="feeling-icon">{{ feeling.icon }}</span>
              <span class="feeling-name">{{ feeling.name }}</span>
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
    title: '准备阶段',
    guidance: '站立片刻，感受身体的重量和平衡',
    focusIcon: '🧘‍♀️',
    duration: 60,
    showMetronome: false,
    showReminder: false
  },
  {
    title: '缓慢起步',
    guidance: '开始缓慢行走，专注于脚部的感受',
    focusIcon: '👣',
    duration: 120,
    showMetronome: true,
    showReminder: true
  },
  {
    title: '深度觉察',
    guidance: '感受每一步的细节：抬起、移动、落下',
    focusIcon: '🎯',
    duration: 180,
    showMetronome: true,
    showReminder: true
  },
  {
    title: '身心合一',
    guidance: '让呼吸与步伐协调，感受身心的统一',
    focusIcon: '🌟',
    duration: 120,
    showMetronome: false,
    showReminder: true
  },
  {
    title: '回归静止',
    guidance: '慢慢停下，静立片刻，感受刚才的体验',
    focusIcon: '🕯️',
    duration: 60,
    showMetronome: false,
    showReminder: false
  }
]);

// 觉察提醒
const awarenessReminders = ref([
  '感受脚底与地面的接触',
  '注意身体重心的转移',
  '观察腿部肌肉的收缩与放松',
  '感受空气在身体周围的流动',
  '注意呼吸与步伐的自然节奏',
  '观察周围环境的声音和气味',
  '感受身体的平衡与协调',
  '注意思绪的来去，温和地回到当下'
]);

// 练习感受选项
const reflectionFeelings = ref([
  { name: '平静', icon: '😌' },
  { name: '专注', icon: '🎯' },
  { name: '放松', icon: '😊' },
  { name: '清醒', icon: '✨' },
  { name: '连接', icon: '🌿' },
  { name: '感恩', icon: '🙏' }
]);

// 步伐节奏选项
const paceOptions = ref({
  slow: { interval: 2000, label: '缓慢' },
  normal: { interval: 1500, label: '正常' },
  fast: { interval: 1000, label: '较快' }
});

// 练习状态
const isTraining = ref(false);
const isPaused = ref(false);
const practiceCompleted = ref(false);
const currentPhaseIndex = ref(0);
const phaseTimeElapsed = ref(0);
const timeRemaining = ref(0);
const totalDuration = ref(0);
const stepCount = ref(0);
const stepBeat = ref(false);
const selectedPace = ref('normal');
const currentReminder = ref('');
const selectedFeeling = ref('');
const focusScore = ref('85%');
const awarenessLevel = ref('高级');

// 定时器
let practiceTimer = null;
let stepTimer = null;
let reminderTimer = null;

// 计算属性
const currentPhase = computed(() => {
  return phases.value[currentPhaseIndex.value] || phases.value[0];
});

const phaseTimeRemaining = computed(() => {
  return currentPhase.value.duration - phaseTimeElapsed.value;
});

const phaseProgress = computed(() => {
  return (phaseTimeElapsed.value / currentPhase.value.duration) * 100;
});

const showMetronome = computed(() => {
  return currentPhase.value.showMetronome && isTraining.value && !isPaused.value;
});

const showReminder = computed(() => {
  return currentPhase.value.showReminder && isTraining.value && !isPaused.value;
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
  stepCount.value = 0;
  selectedFeeling.value = '';
  
  startTimer();
  startReminderTimer();
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
 * 开始步伐计时器
 */
const startStepTimer = () => {
  if (stepTimer) {
    clearInterval(stepTimer);
  }
  
  const interval = paceOptions.value[selectedPace.value].interval;
  stepTimer = setInterval(() => {
    if (!isPaused.value && showMetronome.value) {
      stepBeat.value = true;
      stepCount.value++;
      
      setTimeout(() => {
        stepBeat.value = false;
      }, 200);
    }
  }, interval);
};

/**
 * 开始提醒计时器
 */
const startReminderTimer = () => {
  reminderTimer = setInterval(() => {
    if (!isPaused.value && showReminder.value) {
      const randomIndex = Math.floor(Math.random() * awarenessReminders.value.length);
      currentReminder.value = awarenessReminders.value[randomIndex];
    }
  }, 15000); // 每15秒显示一个提醒
};

/**
 * 进入下一阶段
 */
const nextPhase = () => {
  if (currentPhaseIndex.value < phases.value.length - 1) {
    currentPhaseIndex.value++;
    phaseTimeElapsed.value = 0;
    
    // 根据新阶段更新计时器
    if (currentPhase.value.showMetronome) {
      startStepTimer();
    } else {
      if (stepTimer) {
        clearInterval(stepTimer);
        stepTimer = null;
      }
    }
  }
};

/**
 * 更新步伐节奏
 */
const updatePace = () => {
  if (showMetronome.value) {
    startStepTimer();
  }
};

/**
 * 选择练习感受
 * @param {string} feeling - 选择的感受
 */
const selectFeeling = (feeling) => {
  selectedFeeling.value = feeling;
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
  
  if (stepTimer) {
    clearInterval(stepTimer);
    stepTimer = null;
  }
  
  if (reminderTimer) {
    clearInterval(reminderTimer);
    reminderTimer = null;
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

// 监听阶段变化，启动步伐计时器
const watchPhaseChange = () => {
  if (currentPhase.value.showMetronome && isTraining.value) {
    startStepTimer();
  }
};

// 组件挂载时初始化
onMounted(() => {
  // 初始化提醒
  if (awarenessReminders.value.length > 0) {
    currentReminder.value = awarenessReminders.value[0];
  }
});

// 组件卸载时清理定时器
onUnmounted(() => {
  stopPractice();
});
</script>

<style scoped>
.mindful-walking-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%);
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
  background: linear-gradient(45deg, #81c784, #64b5f6);
  opacity: 0.1;
}

.walking-path {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 60px;
}

.footstep {
  position: absolute;
  width: 12px;
  height: 20px;
  background: #81c784;
  border-radius: 6px;
  opacity: 0.3;
  animation: walkPath 8s ease-in-out infinite;
}

.step-1 { left: 0%; animation-delay: 0s; }
.step-2 { left: 12%; animation-delay: 0.5s; }
.step-3 { left: 24%; animation-delay: 1s; }
.step-4 { left: 36%; animation-delay: 1.5s; }
.step-5 { left: 48%; animation-delay: 2s; }
.step-6 { left: 60%; animation-delay: 2.5s; }
.step-7 { left: 72%; animation-delay: 3s; }
.step-8 { left: 84%; animation-delay: 3.5s; }

@keyframes walkPath {
  0%, 100% { 
    transform: translateY(0px) scale(1);
    opacity: 0.3;
  }
  50% { 
    transform: translateY(-10px) scale(1.2);
    opacity: 0.6;
  }
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2e7d32;
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
  color: #2e7d32;
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
  background: #81c784;
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
  color: #2e7d32;
}

.total-time {
  font-size: 1.2rem;
  color: #666;
  margin-top: 5px;
}

.walking-guide {
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
  color: #2e7d32;
  font-size: 1.2rem;
}

.phase-info p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.step-metronome {
  margin: 20px 0;
  padding: 15px;
  background: white;
  border-radius: 10px;
  border: 2px solid #81c784;
}

.metronome-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
}

.step-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
}

.foot-icon {
  font-size: 2rem;
  z-index: 2;
}

.beat-circle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3px solid #81c784;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.step-indicator.active .beat-circle {
  opacity: 1;
  transform: scale(1.1);
  background: rgba(129, 199, 132, 0.2);
}

.step-count {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.count-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2e7d32;
}

.count-label {
  font-size: 0.9rem;
  color: #666;
}

.pace-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.pace-control label {
  color: #555;
  font-weight: bold;
}

.pace-control select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
  color: #555;
}

.awareness-reminder {
  margin: 20px 0;
  padding: 15px;
  background: #e8f5e8;
  border-radius: 10px;
  border-left: 4px solid #81c784;
}

.reminder-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reminder-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.reminder-content p {
  margin: 0;
  color: #2e7d32;
  font-weight: 500;
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
  background: linear-gradient(90deg, #81c784, #64b5f6);
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
  background: #81c784;
  color: white;
}

.start-btn:hover {
  background: #66bb6a;
  transform: translateY(-2px);
}

.pause-btn {
  background: #ffb74d;
  color: white;
}

.pause-btn:hover {
  background: #ffa726;
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
  color: #2e7d32;
  margin-bottom: 15px;
}

.walking-summary {
  margin: 20px 0;
}

.walking-summary h3 {
  margin: 0 0 15px 0;
  color: #2e7d32;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 10px;
}

.summary-icon {
  font-size: 1.5rem;
}

.summary-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2e7d32;
}

.summary-label {
  font-size: 0.8rem;
  color: #666;
}

.reflection-section {
  margin: 20px 0;
}

.reflection-section h3 {
  margin: 0 0 15px 0;
  color: #2e7d32;
}

.reflection-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
}

.feeling-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feeling-btn:hover {
  border-color: #81c784;
  transform: translateY(-2px);
}

.feeling-btn.selected {
  border-color: #2e7d32;
  background: #e8f5e8;
}

.feeling-icon {
  font-size: 1.5rem;
}

.feeling-name {
  font-size: 0.8rem;
  color: #555;
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
  background: #81c784;
  color: white;
}

.action-btn.primary:hover {
  background: #66bb6a;
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
  .mindful-walking-container {
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
  
  .metronome-display {
    flex-direction: column;
    gap: 15px;
  }
  
  .pace-control {
    flex-direction: column;
    gap: 5px;
  }
  
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .reflection-options {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
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