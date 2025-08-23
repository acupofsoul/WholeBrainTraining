<template>
  <div class="relaxation-breathing-container">
    <!-- 面包屑导航 -->
    <BreadcrumbDropdown
      :main-title="'冥想训练'"
      :main-path="'/meditation'"
      :sub-title="'呼吸训练'"
      :sub-path="'/meditation/breathing'"
      :current-title="'放松呼吸训练'"
      :sibling-modules="[
        { title: '引导冥想', path: '/meditation/guided' },
        { title: '呼吸训练', path: '/meditation/breathing' },
        { title: '脑波生成器', path: '/meditation/brainwave-generator' },
        { title: '节拍器', path: '/meditation/metronome' },
        { title: '想象力训练', path: '/meditation/visualization' },
        { title: '正念训练', path: '/meditation/mindfulness' }
      ]"
      :sub-sibling-modules="[
        { title: '基础呼吸训练', path: '/meditation/breathing/basic' },
        { title: '放松呼吸训练', path: '/meditation/breathing/relaxation' },
        { title: '专注呼吸训练', path: '/meditation/breathing/focus' }
      ]"
    />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-background">
        <div class="breathing-animation">
          <div class="breath-circle" :class="{ breathing: isBreathing }"></div>
        </div>
      </div>
      <h1>🌙 放松呼吸训练</h1>
      <p class="page-description">
        延长呼气时间，帮助深度放松。通过4-2-6的呼吸节奏，让身心进入平静状态。
      </p>
    </div>

    <!-- 训练准备 -->
    <div v-if="!isTraining && !trainingCompleted" class="training-setup">
      <div class="setup-card">
        <h3>准备开始：放松呼吸训练</h3>
        <div class="setup-info">
          <div class="info-item">
            <span class="info-label">呼吸节奏：</span>
            <span class="info-value">4-2-6 (吸气-保持-呼气)</span>
          </div>
          <div class="info-item">
            <span class="info-label">训练时长：</span>
            <span class="info-value">8分钟</span>
          </div>
          <div class="info-item">
            <span class="info-label">适合年龄：</span>
            <span class="info-value">5-12岁</span>
          </div>
        </div>
        <div class="setup-tips">
          <h4>💡 练习提示</h4>
          <ul>
            <li>呼气时间比吸气时间长，有助于放松</li>
            <li>想象压力随着呼气离开身体</li>
            <li>保持自然舒适的呼吸节奏</li>
            <li>不要强迫呼吸，让它自然流动</li>
          </ul>
        </div>
        <button class="start-training-btn" @click="startTraining">
          <span class="btn-icon">🌟</span>
          开始放松呼吸训练
        </button>
      </div>
    </div>

    <!-- 训练进行中 -->
    <div v-if="isTraining" class="training-active">
      <div class="training-header">
        <h2>放松呼吸训练</h2>
        <div class="training-progress">
          <span class="current-time">{{ formatTime(currentTime) }}</span>
          <span class="separator">/</span>
          <span class="total-time">{{ formatTime(480) }}</span>
        </div>
      </div>

      <!-- 呼吸引导圆圈 -->
      <div class="breathing-guide">
        <div class="guide-circle" :class="breathingPhase">
          <div class="inner-circle">
            <div class="phase-text">{{ phaseText }}</div>
            <div class="count-text">{{ breathCount }}</div>
          </div>
        </div>
      </div>

      <!-- 呼吸指示 -->
      <div class="breathing-instruction">
        <div class="instruction-text">{{ instructionText }}</div>
        <div class="phase-timer">{{ phaseTimeLeft }}秒</div>
      </div>

      <!-- 控制按钮 -->
      <div class="training-controls">
        <button class="control-btn pause" @click="pauseTraining" v-if="!isPaused">
          ⏸️ 暂停
        </button>
        <button class="control-btn resume" @click="resumeTraining" v-if="isPaused">
          ▶️ 继续
        </button>
        <button class="control-btn stop" @click="stopTraining">
          ⏹️ 结束
        </button>
      </div>
    </div>

    <!-- 训练完成 -->
    <div v-if="trainingCompleted" class="training-completed">
      <div class="completion-card">
        <div class="completion-icon">🎉</div>
        <h2>训练完成！</h2>
        <p>恭喜完成放松呼吸训练</p>
        <div class="completion-stats">
          <div class="stat-item">
            <span class="stat-label">训练时长</span>
            <span class="stat-value">8分钟</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">呼吸次数</span>
            <span class="stat-value">{{ breathCount }}次</span>
          </div>
        </div>
        <div class="completion-actions">
          <button class="action-btn primary" @click="restartTraining">
            🔄 再次训练
          </button>
          <router-link to="/meditation/breathing" class="action-btn secondary">
            🔀 选择其他模式
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 放松呼吸模式配置
const breathingConfig = {
  inhale: 4,
  hold: 2,
  exhale: 6,
  duration: 480 // 8分钟
};

// 状态管理
const isTraining = ref(false);
const isPaused = ref(false);
const trainingCompleted = ref(false);
const currentTime = ref(0);
const breathCount = ref(0);
const breathingPhase = ref('inhale');
const phaseTimeLeft = ref(0);
const isBreathing = ref(false);

// 定时器
let trainingTimer = null;
let phaseTimer = null;
let breathingAnimationTimer = null;

// 计算属性
const phaseText = computed(() => {
  switch (breathingPhase.value) {
    case 'inhale': return '吸气';
    case 'hold': return '保持';
    case 'exhale': return '呼气';
    default: return '';
  }
});

const instructionText = computed(() => {
  switch (breathingPhase.value) {
    case 'inhale': return '慢慢吸气，感受空气进入身体';
    case 'hold': return '轻柔地保持呼吸';
    case 'exhale': return '缓缓呼气，释放所有紧张';
    default: return '';
  }
});

// 方法
const startTraining = () => {
  isTraining.value = true;
  currentTime.value = 0;
  breathCount.value = 0;
  breathingPhase.value = 'inhale';
  phaseTimeLeft.value = breathingConfig.inhale;
  
  startBreathingCycle();
  startTrainingTimer();
};

const startBreathingCycle = () => {
  let currentPhase = 'inhale';
  let phaseTime = breathingConfig.inhale;
  
  const runPhase = () => {
    if (!isTraining.value || isPaused.value) return;
    
    breathingPhase.value = currentPhase;
    phaseTimeLeft.value = phaseTime;
    
    const phaseInterval = setInterval(() => {
      if (!isTraining.value || isPaused.value) {
        clearInterval(phaseInterval);
        return;
      }
      
      phaseTimeLeft.value--;
      
      if (phaseTimeLeft.value <= 0) {
        clearInterval(phaseInterval);
        
        // 切换到下一个阶段
        if (currentPhase === 'inhale') {
          currentPhase = 'hold';
          phaseTime = breathingConfig.hold;
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          phaseTime = breathingConfig.exhale;
        } else {
          // 完成一个呼吸周期
          breathCount.value++;
          currentPhase = 'inhale';
          phaseTime = breathingConfig.inhale;
        }
        
        runPhase();
      }
    }, 1000);
  };
  
  runPhase();
};

const startTrainingTimer = () => {
  trainingTimer = setInterval(() => {
    if (!isPaused.value) {
      currentTime.value++;
      
      if (currentTime.value >= breathingConfig.duration) {
        completeTraining();
      }
    }
  }, 1000);
};

const pauseTraining = () => {
  isPaused.value = true;
};

const resumeTraining = () => {
  isPaused.value = false;
  startBreathingCycle();
};

const stopTraining = () => {
  isTraining.value = false;
  isPaused.value = false;
  clearTimers();
};

const completeTraining = () => {
  isTraining.value = false;
  trainingCompleted.value = true;
  clearTimers();
};

const restartTraining = () => {
  trainingCompleted.value = false;
  startTraining();
};

const clearTimers = () => {
  if (trainingTimer) {
    clearInterval(trainingTimer);
    trainingTimer = null;
  }
  if (phaseTimer) {
    clearInterval(phaseTimer);
    phaseTimer = null;
  }
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 呼吸动画
const startBreathingAnimation = () => {
  breathingAnimationTimer = setInterval(() => {
    isBreathing.value = !isBreathing.value;
  }, 3000);
};

// 生命周期
onMounted(() => {
  startBreathingAnimation();
});

onUnmounted(() => {
  clearTimers();
  if (breathingAnimationTimer) {
    clearInterval(breathingAnimationTimer);
  }
});
</script>

<style scoped>
.relaxation-breathing-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #3F51B5 0%, #7986CB 100%);
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.header-background {
  position: relative;
  margin-bottom: 2rem;
}

.breathing-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
}

.breath-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.breath-circle.breathing {
  animation: breathe 6s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  33% { transform: scale(1.1); opacity: 0.9; }
  50% { transform: scale(1.1); opacity: 0.9; }
  83% { transform: scale(0.8); opacity: 1; }
}

.page-header h1 {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.training-setup {
  max-width: 600px;
  margin: 0 auto 3rem;
}

.setup-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  text-align: center;
}

.setup-card h3 {
  color: #283593;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.setup-info {
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.info-label {
  color: #666;
  font-weight: 500;
}

.info-value {
  color: #283593;
  font-weight: 600;
}

.setup-tips {
  text-align: left;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(63, 81, 181, 0.1);
  border-radius: 12px;
}

.setup-tips h4 {
  color: #283593;
  margin-bottom: 1rem;
}

.setup-tips ul {
  list-style: none;
  padding: 0;
}

.setup-tips li {
  color: #666;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.setup-tips li::before {
  content: '•';
  color: #3F51B5;
  position: absolute;
  left: 0;
}

.start-training-btn {
  background: linear-gradient(135deg, #3F51B5, #283593);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.start-training-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(63, 81, 181, 0.3);
}

.training-active {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.training-header {
  margin-bottom: 3rem;
}

.training-header h2 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.8rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.training-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
}

.current-time {
  color: #C5CAE9;
  font-weight: 600;
}

.breathing-guide {
  margin-bottom: 3rem;
}

.guide-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 1s ease-in-out;
}

.guide-circle.inhale {
  background: radial-gradient(circle, rgba(63, 81, 181, 0.4), rgba(63, 81, 181, 0.1));
  transform: scale(1.1);
}

.guide-circle.hold {
  background: radial-gradient(circle, rgba(255, 193, 7, 0.4), rgba(255, 193, 7, 0.1));
  transform: scale(1.1);
}

.guide-circle.exhale {
  background: radial-gradient(circle, rgba(40, 53, 147, 0.4), rgba(40, 53, 147, 0.1));
  transform: scale(0.8);
}

.inner-circle {
  background: rgba(255, 255, 255, 0.95);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.phase-text {
  color: #283593;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.count-text {
  color: #3F51B5;
  font-size: 2rem;
  font-weight: 700;
}

.breathing-instruction {
  margin-bottom: 3rem;
}

.instruction-text {
  color: white;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.phase-timer {
  color: #C5CAE9;
  font-size: 1.5rem;
  font-weight: 600;
}

.training-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.control-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(63, 81, 181, 0.3);
  color: #283593;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(63, 81, 181, 0.1);
  transform: translateY(-2px);
}

.control-btn.stop {
  border-color: rgba(244, 67, 54, 0.3);
  color: #d32f2f;
}

.control-btn.stop:hover {
  background: rgba(244, 67, 54, 0.1);
}

.training-completed {
  max-width: 500px;
  margin: 0 auto;
}

.completion-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  text-align: center;
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.completion-card h2 {
  color: #283593;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.completion-card p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.completion-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: rgba(63, 81, 181, 0.1);
  padding: 1rem;
  border-radius: 12px;
}

.stat-label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  color: #3F51B5;
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
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3F51B5, #283593);
  color: white;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(63, 81, 181, 0.3);
  color: #283593;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .relaxation-breathing-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .guide-circle {
    width: 150px;
    height: 150px;
  }
  
  .inner-circle {
    width: 90px;
    height: 90px;
  }
  
  .completion-stats {
    grid-template-columns: 1fr;
  }
  
  .completion-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .page-description {
    font-size: 1rem;
  }
  
  .setup-card {
    padding: 1.5rem;
  }
}
</style>