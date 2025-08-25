<template>
  <div class="body-scan-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-background">
        <div class="body-outline">
          <div class="scan-indicator" :style="{ top: scanPosition + '%' }"></div>
        </div>
      </div>
      <h1>🫂 身体扫描</h1>
      <p class="page-description">
        从头到脚感受身体的每个部位，培养身体觉察力。
        通过有序地关注身体各个部位，学会觉察身体的感受和状态。
      </p>
    </div>

    <!-- 练习说明 -->
    <div class="practice-intro">
      <div class="intro-card">
        <h2>练习指导</h2>
        <div class="instructions">
          <div class="instruction-item">
            <span class="step-number">1</span>
            <p>找一个舒适的姿势躺下或坐着，保持脊背挺直</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">2</span>
            <p>闭上眼睛，深呼吸几次，让身体放松下来</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">3</span>
            <p>从头顶开始，慢慢感受身体的每个部位</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">4</span>
            <p>不要试图改变什么，只是观察和感受</p>
          </div>
          <div class="instruction-item">
            <span class="step-number">5</span>
            <p>如果注意力跑了，轻柔地拉回到身体上</p>
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
        
        <div class="scan-guide" v-if="isTraining">
          <div class="current-phase">
            <div class="phase-icon">{{ currentPhase?.focusIcon }}</div>
            <div class="phase-info">
              <h3>{{ currentPhase?.title }}</h3>
              <p>{{ currentPhase?.guidance }}</p>
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
        <p>恭喜你完成了身体扫描练习！</p>
        
        <div class="practice-stats">
          <div class="stat-item">
            <span class="stat-label">练习时长</span>
            <span class="stat-value">{{ Math.ceil(totalDuration / 60) }}分钟</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">扫描阶段</span>
            <span class="stat-value">{{ phases.length }}个</span>
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

// 练习阶段
const phases = ref([
  {
    title: '准备阶段',
    guidance: '闭上眼睛，深呼吸三次，让身体放松下来',
    focusIcon: '😌',
    duration: 60,
    scanPosition: 0
  },
  {
    title: '头部扫描',
    guidance: '感受你的头顶、额头、眼睛、鼻子和嘴巴',
    focusIcon: '🧠',
    duration: 120,
    scanPosition: 10
  },
  {
    title: '颈部肩膀',
    guidance: '注意你的脖子和肩膀的感觉，是紧张还是放松？',
    focusIcon: '💪',
    duration: 90,
    scanPosition: 25
  },
  {
    title: '手臂手掌',
    guidance: '感受你的手臂、手肘、手腕和手掌',
    focusIcon: '🤲',
    duration: 90,
    scanPosition: 40
  },
  {
    title: '胸部腹部',
    guidance: '注意你的胸部和腹部，感受呼吸的起伏',
    focusIcon: '❤️',
    duration: 120,
    scanPosition: 55
  },
  {
    title: '腰部臀部',
    guidance: '感受你的腰部和臀部，注意与椅子或地面的接触',
    focusIcon: '🪑',
    duration: 90,
    scanPosition: 70
  },
  {
    title: '腿部脚部',
    guidance: '感受你的大腿、小腿、脚踝和脚掌',
    focusIcon: '🦵',
    duration: 120,
    scanPosition: 90
  },
  {
    title: '整体感受',
    guidance: '感受整个身体作为一个整体的感觉',
    focusIcon: '🫂',
    duration: 60,
    scanPosition: 100
  }
]);

// 练习状态
const isTraining = ref(false);
const isPaused = ref(false);
const practiceCompleted = ref(false);
const currentPhaseIndex = ref(0);
const phaseTimeElapsed = ref(0);
const timeRemaining = ref(0);
const totalDuration = ref(0);
const focusScore = ref(88);

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

const scanPosition = computed(() => {
  return currentPhase.value.scanPosition || 0;
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
  }
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
.body-scan-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f3e5f5 0%, #e8f5e8 100%);
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
  background: linear-gradient(45deg, #ce93d8, #a5d6a7);
  opacity: 0.1;
}

.body-outline {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 200px;
  background: linear-gradient(to bottom, #ce93d8, #a5d6a7);
  border-radius: 40px 40px 20px 20px;
  opacity: 0.3;
  position: relative;
}

.scan-indicator {
  position: absolute;
  left: -10px;
  right: -10px;
  height: 4px;
  background: #ff6b6b;
  border-radius: 2px;
  transition: top 1s ease;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}

.page-header h1 {
  font-size: 2.5rem;
  color: #6a1b9a;
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
  color: #6a1b9a;
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
  background: #ce93d8;
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
  color: #6a1b9a;
}

.total-time {
  font-size: 1.2rem;
  color: #666;
  margin-top: 5px;
}

.scan-guide {
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
  color: #6a1b9a;
  font-size: 1.2rem;
}

.phase-info p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.phase-progress {
  display: flex;
  align-items: center;
  gap: 10px;
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
  background: linear-gradient(90deg, #ce93d8, #a5d6a7);
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
  background: #ce93d8;
  color: white;
}

.start-btn:hover {
  background: #ba68c8;
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
  color: #6a1b9a;
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
  color: #6a1b9a;
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
  background: #ce93d8;
  color: white;
}

.action-btn.primary:hover {
  background: #ba68c8;
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
  .body-scan-container {
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
  
  .control-buttons, .completion-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .start-btn, .pause-btn, .stop-btn, .action-btn {
    width: 200px;
  }
}
</style>