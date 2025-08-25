<template>
  <div class="emotion-awareness-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-background">
        <div class="emotion-waves">
          <div class="emotion-bubble" v-for="n in 5" :key="n" :class="`bubble-${n}`"></div>
        </div>
      </div>
      <h1>💭 情绪觉察</h1>
      <p class="page-description">
        学会观察和接纳自己的情绪，不被情绪控制。
        通过观察内心的情绪变化，学会以平和的心态面对各种感受。
      </p>
    </div>

    <!-- 练习说明 -->
    <div class="practice-intro">
      <div class="intro-card">
        <h2>练习指导</h2>
        <div class="instructions">
          <div class="instruction-item">
            <span class="step-number">1</span>
            <p>坐在舒适的位置，闭上眼睛</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">2</span>
            <p>注意此刻内心的感受</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">3</span>
            <p>不要评判情绪的好坏，只是观察</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">4</span>
            <p>想象情绪像云朵一样飘过天空</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">5</span>
            <p>保持友善和好奇的态度</p>
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
        
        <div class="emotion-guide" v-if="isTraining">
          <div class="current-phase">
            <div class="phase-icon">{{ currentPhase?.focusIcon }}</div>
            <div class="phase-info">
              <h3>{{ currentPhase?.title }}</h3>
              <p>{{ currentPhase?.guidance }}</p>
            </div>
          </div>
          
          <!-- 情绪识别 -->
          <div class="emotion-check" v-if="showEmotionCheck">
            <h4>此刻你感受到什么情绪？</h4>
            <div class="emotion-options">
              <button 
                v-for="emotion in emotionOptions" 
                :key="emotion.name"
                class="emotion-btn"
                :class="{ selected: selectedEmotion === emotion.name }"
                @click="selectEmotion(emotion.name)"
              >
                <span class="emotion-icon">{{ emotion.icon }}</span>
                <span class="emotion-name">{{ emotion.name }}</span>
              </button>
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
        <p>恭喜你完成了情绪觉察练习！</p>
        
        <div class="emotion-summary" v-if="emotionHistory.length > 0">
          <h3>情绪变化记录</h3>
          <div class="emotion-timeline">
            <div 
              v-for="(record, index) in emotionHistory" 
              :key="index"
              class="emotion-record"
            >
              <span class="record-time">{{ record.time }}</span>
              <span class="record-emotion">{{ record.emotion }}</span>
            </div>
          </div>
        </div>
        
        <div class="practice-stats">
          <div class="stat-item">
            <span class="stat-label">练习时长</span>
            <span class="stat-value">{{ Math.ceil(totalDuration / 60) }}分钟</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">情绪记录</span>
            <span class="stat-value">{{ emotionHistory.length }}次</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">觉察度</span>
            <span class="stat-value">{{ awarenessScore }}%</span>
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
    title: '情绪觉察',
    guidance: '注意此刻你内心的感受，是开心、紧张还是平静？',
    focusIcon: '🎭',
    duration: 90,
    showEmotionCheck: true
  },
  {
    title: '情绪接纳',
    guidance: '不要试图改变这些感受，只是友善地观察它们',
    focusIcon: '🤗',
    duration: 120,
    showEmotionCheck: false
  },
  {
    title: '情绪流动',
    guidance: '想象情绪像河水一样流动，它们会自然地来去',
    focusIcon: '🌊',
    duration: 120,
    showEmotionCheck: true
  },
  {
    title: '内心平静',
    guidance: '感受内心深处那份宁静和平和',
    focusIcon: '☮️',
    duration: 90,
    showEmotionCheck: false
  }
]);

// 情绪选项
const emotionOptions = ref([
  { name: '平静', icon: '😌' },
  { name: '开心', icon: '😊' },
  { name: '紧张', icon: '😰' },
  { name: '困惑', icon: '😕' },
  { name: '兴奋', icon: '😃' },
  { name: '疲惫', icon: '😴' },
  { name: '焦虑', icon: '😟' },
  { name: '感恩', icon: '🙏' }
]);

// 练习状态
const isTraining = ref(false);
const isPaused = ref(false);
const practiceCompleted = ref(false);
const currentPhaseIndex = ref(0);
const phaseTimeElapsed = ref(0);
const timeRemaining = ref(0);
const totalDuration = ref(0);
const selectedEmotion = ref('');
const emotionHistory = ref([]);
const awarenessScore = ref(92);

// 定时器
let practiceTimer = null;

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

const showEmotionCheck = computed(() => {
  return currentPhase.value.showEmotionCheck && isTraining.value && !isPaused.value;
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
  emotionHistory.value = [];
  selectedEmotion.value = '';
  
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
    selectedEmotion.value = '';
  }
};

/**
 * 选择情绪
 * @param {string} emotion - 选择的情绪
 */
const selectEmotion = (emotion) => {
  selectedEmotion.value = emotion;
  
  // 记录情绪变化
  const currentTime = formatTime(totalDuration.value - timeRemaining.value);
  emotionHistory.value.push({
    time: currentTime,
    emotion: emotion,
    phase: currentPhase.value.title
  });
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

// 组件卸载时清理定时器
onUnmounted(() => {
  stopPractice();
});
</script>

<style scoped>
.emotion-awareness-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff3e0 0%, #f3e5f5 100%);
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
  background: linear-gradient(45deg, #ffb74d, #ce93d8);
  opacity: 0.1;
}

.emotion-waves {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.emotion-bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #ffb74d, #ce93d8);
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}

.bubble-1 {
  width: 20px;
  height: 20px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.bubble-2 {
  width: 15px;
  height: 15px;
  top: 60%;
  left: 80%;
  animation-delay: 1s;
}

.bubble-3 {
  width: 25px;
  height: 25px;
  top: 40%;
  left: 60%;
  animation-delay: 2s;
}

.bubble-4 {
  width: 18px;
  height: 18px;
  top: 80%;
  left: 30%;
  animation-delay: 3s;
}

.bubble-5 {
  width: 22px;
  height: 22px;
  top: 30%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.page-header h1 {
  font-size: 2.5rem;
  color: #e65100;
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
  color: #e65100;
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
  background: #ffb74d;
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
  color: #e65100;
}

.total-time {
  font-size: 1.2rem;
  color: #666;
  margin-top: 5px;
}

.emotion-guide {
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
  color: #e65100;
  font-size: 1.2rem;
}

.phase-info p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.emotion-check {
  margin: 20px 0;
  padding: 15px;
  background: white;
  border-radius: 10px;
  border: 2px solid #ffb74d;
}

.emotion-check h4 {
  margin: 0 0 15px 0;
  color: #e65100;
  text-align: center;
}

.emotion-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
}

.emotion-btn {
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

.emotion-btn:hover {
  border-color: #ffb74d;
  transform: translateY(-2px);
}

.emotion-btn.selected {
  border-color: #e65100;
  background: #fff3e0;
}

.emotion-icon {
  font-size: 1.5rem;
}

.emotion-name {
  font-size: 0.8rem;
  color: #555;
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
  background: linear-gradient(90deg, #ffb74d, #ce93d8);
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
  background: #ffb74d;
  color: white;
}

.start-btn:hover {
  background: #ffa726;
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
  color: #e65100;
  margin-bottom: 15px;
}

.emotion-summary {
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 10px;
}

.emotion-summary h3 {
  margin: 0 0 15px 0;
  color: #e65100;
}

.emotion-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.emotion-record {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #ffb74d;
}

.record-time {
  font-size: 0.9rem;
  color: #666;
}

.record-emotion {
  font-weight: bold;
  color: #e65100;
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
  color: #e65100;
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
  background: #ffb74d;
  color: white;
}

.action-btn.primary:hover {
  background: #ffa726;
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
  .emotion-awareness-container {
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
  
  .emotion-options {
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