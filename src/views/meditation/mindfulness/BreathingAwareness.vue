<template>
  <div class="breathing-awareness-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-background">
        <div class="breathing-animation">
          <div class="breath-circle" :class="{ inhaling: isInhaling, exhaling: isExhaling }"></div>
        </div>
      </div>
      <h1>🌬️ 呼吸觉察</h1>
      <p class="page-description">
        专注于呼吸的节奏，培养当下觉察能力。
        呼吸是连接身心的桥梁，通过观察呼吸来安定内心。
      </p>
    </div>

    <!-- 练习说明 -->
    <div class="practice-intro">
      <div class="intro-card">
        <h2>练习指导</h2>
        <div class="instructions">
          <div class="instruction-item">
            <span class="step-number">1</span>
            <p>找一个舒适的坐姿，背部挺直但不紧张</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">2</span>
            <p>轻轻闭上眼睛，或者柔和地注视前方</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">3</span>
            <p>自然呼吸，不要刻意改变呼吸的节奏</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">4</span>
            <p>专注感受空气进出鼻孔的感觉</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">5</span>
            <p>当注意力跑开时，温柔地拉回到呼吸上</p>
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
        
        <div class="breath-guide" v-if="isTraining">
          <div class="breath-instruction">
            <span v-if="isInhaling">🌬️ 吸气</span>
            <span v-else-if="isExhaling">💨 呼气</span>
            <span v-else>😌 自然呼吸</span>
          </div>
          <div class="breath-count">第 {{ breathCount }} 次呼吸</div>
        </div>

        <div class="control-buttons">
          <button 
            v-if="!isTraining" 
            class="start-btn"
            @click="startPractice"
          >
            🧘‍♀️ 开始练习
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
        <p>恭喜你完成了呼吸觉察练习！</p>
        
        <div class="practice-stats">
          <div class="stat-item">
            <span class="stat-label">练习时长</span>
            <span class="stat-value">{{ Math.ceil(totalDuration / 60) }}分钟</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">呼吸次数</span>
            <span class="stat-value">{{ breathCount }}次</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">专注度</span>
            <span class="stat-value">{{ focusScore }}%</span>
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

// 练习状态
const isTraining = ref(false);
const isPaused = ref(false);
const practiceCompleted = ref(false);
const timeRemaining = ref(300); // 5分钟
const totalDuration = ref(300);
const breathCount = ref(0);
const focusScore = ref(85);

// 呼吸动画状态
const isInhaling = ref(false);
const isExhaling = ref(false);

// 定时器
let practiceTimer = null;
let breathTimer = null;

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
 * 开始练习
 */
const startPractice = () => {
  isTraining.value = true;
  practiceCompleted.value = false;
  timeRemaining.value = totalDuration.value;
  breathCount.value = 0;
  
  startTimer();
  startBreathGuide();
};

/**
 * 开始计时器
 */
const startTimer = () => {
  practiceTimer = setInterval(() => {
    if (!isPaused.value) {
      timeRemaining.value--;
      if (timeRemaining.value <= 0) {
        completePractice();
      }
    }
  }, 1000);
};

/**
 * 开始呼吸引导
 */
const startBreathGuide = () => {
  const breathCycle = () => {
    if (!isTraining.value || isPaused.value) return;
    
    // 吸气阶段 (4秒)
    isInhaling.value = true;
    isExhaling.value = false;
    
    setTimeout(() => {
      if (!isTraining.value || isPaused.value) return;
      
      // 屏息阶段 (1秒)
      isInhaling.value = false;
      isExhaling.value = false;
      
      setTimeout(() => {
        if (!isTraining.value || isPaused.value) return;
        
        // 呼气阶段 (4秒)
        isInhaling.value = false;
        isExhaling.value = true;
        breathCount.value++;
        
        setTimeout(() => {
          if (!isTraining.value || isPaused.value) return;
          
          // 暂停阶段 (1秒)
          isInhaling.value = false;
          isExhaling.value = false;
          
          setTimeout(() => {
            if (isTraining.value && !isPaused.value) {
              breathCycle();
            }
          }, 1000);
        }, 4000);
      }, 1000);
    }, 4000);
  };
  
  breathCycle();
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
  isInhaling.value = false;
  isExhaling.value = false;
  
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

// 组件卸载时清理定时器
onUnmounted(() => {
  stopPractice();
});
</script>

<style scoped>
.breathing-awareness-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
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

.breathing-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.breath-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, #81c784, #4fc3f7);
  transition: all 0.3s ease;
}

.breath-circle.inhaling {
  transform: scale(1.3);
  opacity: 0.8;
}

.breath-circle.exhaling {
  transform: scale(0.7);
  opacity: 0.4;
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

.breath-guide {
  margin: 20px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 10px;
}

.breath-instruction {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 10px;
}

.breath-count {
  font-size: 1rem;
  color: #666;
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

.practice-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2e7d32;
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
  .breathing-awareness-container {
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
  
  .control-buttons, .completion-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .start-btn, .pause-btn, .stop-btn, .action-btn {
    width: 200px;
  }
}
</style>