<template>
  <div class="basic-breathing-container">
    <!-- 面包屑导航 -->
    <BreadcrumbDropdown
      :main-title="'冥想训练'"
      :main-path="'/meditation'"
      :sub-title="'呼吸训练'"
      :sub-path="'/meditation/breathing'"
      :current-title="'基础呼吸训练'"
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
      <h1>🌱 基础呼吸训练</h1>
      <p class="page-description">
        简单的深呼吸练习，适合初学者。通过4-4-4的呼吸节奏，帮助孩子建立正确的呼吸习惯。
      </p>
    </div>

    <!-- 训练准备 -->
    <div v-if="!isTraining && !trainingCompleted" class="training-setup">
      <div class="setup-card">
        <h3>准备开始：基础呼吸训练</h3>
        <div class="setup-info">
          <div class="info-item">
            <span class="info-label">呼吸节奏：</span>
            <span class="info-value">4-4-4 (吸气-保持-呼气)</span>
          </div>
          <div class="info-item">
            <span class="info-label">训练时长：</span>
            <span class="info-value">5分钟</span>
          </div>
          <div class="info-item">
            <span class="info-label">适合年龄：</span>
            <span class="info-value">3-12岁</span>
          </div>
        </div>
        <div class="setup-tips">
          <h4>💡 练习提示</h4>
          <ul>
            <li>找一个舒适的坐姿或躺姿</li>
            <li>闭上眼睛，专注于呼吸</li>
            <li>跟随圆圈的节奏进行呼吸</li>
            <li>如果分心了，轻柔地把注意力拉回呼吸上</li>
          </ul>
        </div>
        <button class="start-training-btn" @click="startTraining">
          <span class="btn-icon">🌟</span>
          开始基础呼吸训练
        </button>
      </div>
    </div>

    <!-- 训练进行中 -->
    <div v-if="isTraining" class="training-active">
      <div class="training-header">
        <h2>基础呼吸训练</h2>
        <div class="training-progress">
          <span class="current-time">{{ formatTime(currentTime) }}</span>
          <span class="separator">/</span>
          <span class="total-time">{{ formatTime(300) }}</span>
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
        <p>恭喜完成基础呼吸训练</p>
        <div class="completion-stats">
          <div class="stat-item">
            <span class="stat-label">训练时长</span>
            <span class="stat-value">5分钟</span>
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

// 基础呼吸模式配置
const breathingConfig = {
  inhale: 4,
  hold: 4,
  exhale: 4,
  duration: 300 // 5分钟
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
    case 'inhale': return '慢慢吸气，让腹部鼓起';
    case 'hold': return '轻柔地保持呼吸';
    case 'exhale': return '缓缓呼气，让身体放松';
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
.basic-breathing-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #4CAF50 0%, #81C784 50%, #A5D6A7 100%);
  background-size: 400% 400%;
  animation: gradientShift 12s ease infinite;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.basic-breathing-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 25% 75%, rgba(76, 175, 80, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 75% 25%, rgba(129, 199, 132, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(165, 214, 167, 0.2) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.page-header {
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  z-index: 2;
}

.header-background {
  position: relative;
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 30px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.breathing-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  margin-bottom: 1rem;
}

.breath-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2));
  border: 3px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 
    0 0 30px rgba(76, 175, 80, 0.4),
    inset 0 0 20px rgba(255, 255, 255, 0.3);
}

.breath-circle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.6) 0%, transparent 70%);
  animation: innerPulse 4s ease-in-out infinite;
}

.breath-circle.breathing {
  animation: breathe 4s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.8;
    box-shadow: 
      0 0 30px rgba(76, 175, 80, 0.4),
      inset 0 0 20px rgba(255, 255, 255, 0.3);
  }
  50% { 
    transform: scale(1.3); 
    opacity: 1;
    box-shadow: 
      0 0 50px rgba(76, 175, 80, 0.6),
      inset 0 0 30px rgba(255, 255, 255, 0.4);
  }
}

@keyframes innerPulse {
  0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.8); }
  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
}

.page-header h1 {
  font-size: 3rem;
  color: white;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.page-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.95);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.7;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-weight: 300;
}

.training-setup {
  max-width: 700px;
  margin: 0 auto 4rem;
  position: relative;
  z-index: 2;
}

.setup-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  padding: 3rem 2.5rem;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 32px rgba(76, 175, 80, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.setup-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4CAF50, #81C784, #A5D6A7);
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.setup-card h3 {
  color: #2E7D32;
  margin-bottom: 2.5rem;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  position: relative;
}

.setup-card h3::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #4CAF50, #81C784);
  border-radius: 2px;
}

.setup-info {
  margin-bottom: 2.5rem;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 20px;
  padding: 2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  border: 1px solid rgba(76, 175, 80, 0.1);
  transition: all 0.3s ease;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.1);
}

.info-label {
  color: #666;
  font-weight: 600;
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-label::before {
  content: '●';
  color: #4CAF50;
  font-size: 0.8rem;
}

.info-value {
  color: #2E7D32;
  font-weight: 700;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.setup-tips {
  text-align: left;
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.08));
  border-radius: 20px;
  border: 1px solid rgba(76, 175, 80, 0.2);
  position: relative;
  overflow: hidden;
}

.setup-tips::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #4CAF50, #81C784);
}

.setup-tips h4 {
  color: #2E7D32;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.setup-tips ul {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.setup-tips li {
  color: #555;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  position: relative;
  padding-left: 3rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.setup-tips li:hover {
  transform: translateX(5px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 10px rgba(76, 175, 80, 0.1);
}

.setup-tips li::before {
  content: '✓';
  color: #4CAF50;
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  font-size: 1.1rem;
  width: 20px;
  height: 20px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-training-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  padding: 1.5rem 3rem;
  border-radius: 30px;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
  letter-spacing: 0.5px;
}

.start-training-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.start-training-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 15px 40px rgba(76, 175, 80, 0.4);
}

.start-training-btn:hover::before {
  left: 100%;
}

.start-training-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.btn-icon {
  font-size: 1.5rem;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(5deg); }
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
  color: #C8E6C9;
  font-weight: 600;
}

.breathing-guide {
  margin-bottom: 4rem;
  position: relative;
  z-index: 2;
}

.guide-circle {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 60px rgba(76, 175, 80, 0.3);
}

.guide-circle::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, rgba(76, 175, 80, 0.2), rgba(129, 199, 132, 0.3), rgba(165, 214, 167, 0.2), rgba(76, 175, 80, 0.2));
  animation: rotate 8s linear infinite;
  z-index: -1;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.guide-circle.inhale {
  background: radial-gradient(circle, rgba(76, 175, 80, 0.6), rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.05));
  transform: scale(1.3);
  box-shadow: 
    0 0 80px rgba(76, 175, 80, 0.5),
    inset 0 0 40px rgba(255, 255, 255, 0.2);
}

.guide-circle.hold {
  background: radial-gradient(circle, rgba(255, 193, 7, 0.6), rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.05));
  transform: scale(1.3);
  box-shadow: 
    0 0 80px rgba(255, 193, 7, 0.5),
    inset 0 0 40px rgba(255, 255, 255, 0.2);
}

.guide-circle.exhale {
  background: radial-gradient(circle, rgba(46, 125, 50, 0.6), rgba(46, 125, 50, 0.2), rgba(46, 125, 50, 0.05));
  transform: scale(0.7);
  box-shadow: 
    0 0 60px rgba(46, 125, 50, 0.4),
    inset 0 0 30px rgba(255, 255, 255, 0.2);
}

.inner-circle {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.92));
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 2px 8px rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.inner-circle::before {
  content: '';
  position: absolute;
  top: 10%;
  left: 10%;
  width: 30%;
  height: 30%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.6), transparent);
  border-radius: 50%;
  filter: blur(8px);
}

.phase-text {
  color: #2E7D32;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
  z-index: 1;
}

.count-text {
  color: #4CAF50;
  font-size: 2.8rem;
  font-weight: 800;
  text-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  z-index: 1;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.breathing-instruction {
  margin-bottom: 4rem;
  text-align: center;
  position: relative;
  z-index: 2;
}

.instruction-text {
  color: white;
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  font-weight: 500;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.instruction-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmerText 3s ease-in-out infinite;
}

@keyframes shimmerText {
  0% { left: -100%; }
  100% { left: 100%; }
}

.phase-timer {
  color: #E8F5E8;
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.15);
  padding: 1rem 2rem;
  border-radius: 20px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: inline-block;
  letter-spacing: 1px;
  min-width: 120px;
}

.training-controls {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
}

.control-btn {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(76, 175, 80, 0.4);
  color: #2E7D32;
  padding: 1.2rem 2rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
  min-width: 120px;
}

.control-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.1), transparent);
  transition: left 0.5s;
}

.control-btn:hover {
  background: rgba(76, 175, 80, 0.15);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 35px rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.6);
}

.control-btn:hover::before {
  left: 100%;
}

.control-btn:active {
  transform: translateY(-1px) scale(1.02);
}

.control-btn.stop {
  border-color: rgba(244, 67, 54, 0.4);
  color: #d32f2f;
}

.control-btn.stop::before {
  background: linear-gradient(90deg, transparent, rgba(244, 67, 54, 0.1), transparent);
}

.control-btn.stop:hover {
  background: rgba(244, 67, 54, 0.15);
  border-color: rgba(244, 67, 54, 0.6);
  box-shadow: 0 12px 35px rgba(244, 67, 54, 0.2);
}

.training-completed {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.completion-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 35px;
  padding: 4rem 3rem;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.15),
    0 10px 40px rgba(76, 175, 80, 0.1);
  backdrop-filter: blur(25px);
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
}

.completion-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #4CAF50, #81C784, #A5D6A7, #4CAF50);
  background-size: 300% 100%;
  animation: celebrationGradient 4s ease-in-out infinite;
}

@keyframes celebrationGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.completion-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #4CAF50, #81C784);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.completion-card h2 {
  color: #2E7D32;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 4px rgba(46, 125, 50, 0.1);
}

.completion-card p {
  color: #555;
  margin-bottom: 3rem;
  font-size: 1.3rem;
  line-height: 1.6;
  font-weight: 400;
}

.completion-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-item {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.08));
  padding: 2rem 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(76, 175, 80, 0.2);
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #4CAF50, #81C784);
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.15);
}

.stat-label {
  display: block;
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  color: #4CAF50;
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.completion-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 1.2rem 2.5rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
  min-width: 160px;
  justify-content: center;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(76, 175, 80, 0.4);
  color: #2E7D32;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-3px) scale(1.02);
  text-decoration: none;
  color: inherit;
}

.action-btn.primary:hover {
  box-shadow: 0 12px 35px rgba(76, 175, 80, 0.4);
}

.action-btn.secondary:hover {
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.6);
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:active {
  transform: translateY(-1px) scale(1.01);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .basic-breathing-container {
    padding: 1.5rem;
  }
  
  .page-header h1 {
    font-size: 2.5rem;
  }
  
  .guide-circle {
    width: 240px;
    height: 240px;
  }
  
  .inner-circle {
    width: 140px;
    height: 140px;
  }
  
  .setup-card {
    padding: 2.5rem 2rem;
  }
}

@media (max-width: 768px) {
  .basic-breathing-container {
    padding: 1rem;
  }
  
  .page-header {
    margin-bottom: 3rem;
  }
  
  .page-header h1 {
    font-size: 2.2rem;
  }
  
  .page-description {
    font-size: 1.1rem;
    padding: 0 1rem;
  }
  
  .header-background {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .breathing-animation {
    height: 120px;
  }
  
  .breath-circle {
    width: 80px;
    height: 80px;
  }
  
  .guide-circle {
    width: 200px;
    height: 200px;
  }
  
  .inner-circle {
    width: 120px;
    height: 120px;
  }
  
  .phase-text {
    font-size: 1.2rem;
  }
  
  .count-text {
    font-size: 2.2rem;
  }
  
  .setup-card {
    padding: 2rem 1.5rem;
  }
  
  .setup-card h2,
  .setup-card h3 {
    font-size: 1.8rem;
  }
  
  .instruction-text {
    font-size: 1.4rem;
    padding: 1.2rem 1.5rem;
  }
  
  .phase-timer {
    font-size: 1.6rem;
    padding: 0.8rem 1.5rem;
  }
  
  .training-controls {
    gap: 1rem;
  }
  
  .control-btn {
    padding: 1rem 1.5rem;
    font-size: 1rem;
    min-width: 100px;
  }
  
  .completion-card {
    padding: 3rem 2rem;
  }
  
  .completion-card h2 {
    font-size: 2rem;
  }
  
  .completion-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat-item {
    padding: 1.5rem 1rem;
  }
  
  .completion-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .action-btn {
    padding: 1rem 2rem;
    min-width: 140px;
  }
}

@media (max-width: 480px) {
  .basic-breathing-container {
    padding: 0.8rem;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .page-description {
    font-size: 1rem;
    line-height: 1.5;
  }
  
  .header-background {
    padding: 1rem;
    border-radius: 20px;
  }
  
  .breathing-animation {
    height: 100px;
  }
  
  .breath-circle {
    width: 60px;
    height: 60px;
  }
  
  .guide-circle {
    width: 160px;
    height: 160px;
  }
  
  .inner-circle {
    width: 100px;
    height: 100px;
  }
  
  .phase-text {
    font-size: 1rem;
  }
  
  .count-text {
    font-size: 1.8rem;
  }
  
  .setup-card {
    padding: 1.5rem 1rem;
    border-radius: 20px;
  }
  
  .setup-card h2,
  .setup-card h3 {
    font-size: 1.5rem;
  }
  
  .form-group input,
  .form-group select {
    padding: 0.8rem 1rem;
    font-size: 1rem;
  }
  
  .start-btn,
  .start-training-btn {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
  
  .instruction-text {
    font-size: 1.2rem;
    padding: 1rem;
  }
  
  .phase-timer {
    font-size: 1.4rem;
    padding: 0.8rem 1.2rem;
  }
  
  .control-btn {
    padding: 0.8rem 1.2rem;
    font-size: 0.9rem;
    min-width: 80px;
  }
  
  .completion-card {
    padding: 2rem 1rem;
    border-radius: 25px;
  }
  
  .completion-icon {
    font-size: 3.5rem;
  }
  
  .completion-card h2 {
    font-size: 1.8rem;
  }
  
  .completion-card p {
    font-size: 1.1rem;
  }
  
  .stat-item {
    padding: 1.2rem 0.8rem;
  }
  
  .stat-value {
    font-size: 1.6rem;
  }
  
  .action-btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    min-width: 120px;
  }
  
  .setup-tips {
    padding: 1.5rem;
  }
  
  .setup-tips li {
    padding: 0.8rem 1rem;
    padding-left: 2.5rem;
  }
}
</style>