<template>
  <div class="breathing-guide">
    <!-- 呼吸球动画 -->
    <div class="breathing-circle-container">
      <div 
        class="breathing-circle"
        :class="{ 
          'inhaling': currentPhase === 'inhale',
          'holding': currentPhase === 'hold',
          'exhaling': currentPhase === 'exhale',
          'paused': currentPhase === 'pause'
        }"
        :style="{
          '--inhale-duration': `${pattern.inhale}s`,
          '--hold-duration': `${pattern.hold}s`,
          '--exhale-duration': `${pattern.exhale}s`,
          '--pause-duration': `${pattern.pause || 1}s`
        }"
      >
        <!-- 内圈 -->
        <div class="inner-circle">
          <div class="breath-text">{{ phaseText }}</div>
          <div class="breath-counter">{{ currentCount }}</div>
        </div>
        
        <!-- 波纹效果 -->
        <div class="ripple" v-for="n in 3" :key="n" :style="{ '--delay': `${n * 0.5}s` }"></div>
      </div>
      
      <!-- 进度环 -->
      <div class="progress-ring">
        <svg class="progress-svg" width="200" height="200">
          <circle
            class="progress-background"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            stroke-width="4"
          />
          <circle
            class="progress-bar"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#4CAF50"
            stroke-width="4"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
            :style="{
              transition: isActive ? `stroke-dashoffset ${currentPhaseDuration}s linear` : 'none'
            }"
          />
        </svg>
      </div>
    </div>
    
    <!-- 呼吸指导文字 -->
    <div class="breathing-instructions">
      <h3 class="phase-title">{{ phaseTitle }}</h3>
      <p class="phase-description">{{ phaseDescription }}</p>
      <div class="breathing-stats">
        <div class="stat-item">
          <span class="stat-label">当前轮次</span>
          <span class="stat-value">{{ currentCycle }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总时长</span>
          <span class="stat-value">{{ formatTime(elapsedTime) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 控制按钮 -->
    <div class="breathing-controls">
      <button 
        class="control-btn primary"
        @click="toggleBreathing"
      >
        {{ isActive ? '暂停' : '开始' }}
      </button>
      <button 
        class="control-btn secondary"
        @click="resetBreathing"
      >
        重置
      </button>
    </div>
    
    <!-- 背景粒子效果 -->
    <div class="particles">
      <div 
        v-for="n in 20" 
        :key="n"
        class="particle"
        :style="{
          '--delay': `${Math.random() * 10}s`,
          '--duration': `${5 + Math.random() * 10}s`,
          '--x': `${Math.random() * 100}%`,
          '--y': `${Math.random() * 100}%`
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import meditationStorage from '@/utils/meditationStorage'

const props = defineProps({
  pattern: {
    type: Object,
    default: () => ({ inhale: 4, hold: 4, exhale: 4, pause: 1 })
  },
  autoStart: {
    type: Boolean,
    default: false
  },
  sessionDuration: {
    type: Number,
    default: 300 // 5分钟
  },
  saveProgress: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['phase-change', 'cycle-complete', 'session-complete', 'session-start', 'session-end'])

// 状态管理
const isActive = ref(false)
const currentPhase = ref('inhale') // inhale, hold, exhale, pause
const currentCount = ref(0)
const currentCycle = ref(0)
const elapsedTime = ref(0)
const phaseStartTime = ref(0)
const sessionStartTime = ref(null)
const sessionId = ref(null)

// 定时器
let phaseTimer = null
let elapsedTimer = null

// 进度环计算
const circumference = 2 * Math.PI * 90
const progressOffset = ref(circumference)

// 计算属性
const currentPhaseDuration = computed(() => {
  return props.pattern[currentPhase.value] || 1
})

const phaseText = computed(() => {
  const texts = {
    inhale: '吸气',
    hold: '屏息',
    exhale: '呼气',
    pause: '暂停'
  }
  return texts[currentPhase.value]
})

const phaseTitle = computed(() => {
  const titles = {
    inhale: '深深吸气',
    hold: '保持呼吸',
    exhale: '缓缓呼气',
    pause: '自然呼吸'
  }
  return titles[currentPhase.value]
})

const phaseDescription = computed(() => {
  const descriptions = {
    inhale: '通过鼻子慢慢吸气，感受空气进入肺部',
    hold: '轻松保持呼吸，不要用力',
    exhale: '通过嘴巴慢慢呼气，释放所有紧张',
    pause: '自然呼吸，准备下一轮循环'
  }
  return descriptions[currentPhase.value]
})

// 方法
const toggleBreathing = () => {
  if (isActive.value) {
    pauseBreathing()
  } else {
    startBreathing()
  }
}

const startBreathing = () => {
  isActive.value = true
  phaseStartTime.value = Date.now()
  sessionStartTime.value = Date.now()
  sessionId.value = `breathing_${Date.now()}`
  
  // 保存会话开始数据
  if (props.saveProgress) {
    const sessionData = {
      id: sessionId.value,
      type: 'breathing',
      startTime: sessionStartTime.value,
      pattern: props.pattern,
      duration: props.sessionDuration,
      status: 'active'
    }
    meditationStorage.saveSession(sessionData)
  }
  
  startPhaseTimer()
  startElapsedTimer()
  
  emit('session-start', { sessionId: sessionId.value })
}

const pauseBreathing = () => {
  isActive.value = false
  clearTimeout(phaseTimer)
  clearInterval(elapsedTimer)
}

// 停止呼吸训练
const stop = () => {
  const wasActive = isActive.value
  isActive.value = false
  clearTimeout(phaseTimer)
  clearInterval(elapsedTimer)
  phaseTimer = null
  elapsedTimer = null
  
  // 保存会话结束数据
  if (wasActive && props.saveProgress && sessionId.value) {
    const endTime = Date.now()
    const sessionData = {
      id: sessionId.value,
      type: 'breathing',
      startTime: sessionStartTime.value,
      endTime: endTime,
      duration: Math.floor((endTime - sessionStartTime.value) / 1000),
      cycles: currentCycle.value,
      pattern: props.pattern,
      status: 'completed'
    }
    meditationStorage.updateSession(sessionData)
    
    // 更新用户统计
    const stats = meditationStorage.getStatistics()
    stats.breathingSessions++
    stats.totalBreathingTime += sessionData.duration
    meditationStorage.saveStatistics(stats)
    
    emit('session-end', sessionData)
  }
  
  sessionId.value = null
  sessionStartTime.value = null
}

const resetBreathing = () => {
  pauseBreathing()
  currentPhase.value = 'inhale'
  currentCount.value = 0
  currentCycle.value = 0
  elapsedTime.value = 0
  progressOffset.value = circumference
}

const startPhaseTimer = () => {
  const duration = currentPhaseDuration.value * 1000
  
  // 开始进度动画
  progressOffset.value = 0
  
  // 倒计时
  currentCount.value = currentPhaseDuration.value
  const countdownInterval = setInterval(() => {
    currentCount.value--
    if (currentCount.value <= 0) {
      clearInterval(countdownInterval)
    }
  }, 1000)
  
  phaseTimer = setTimeout(() => {
    nextPhase()
  }, duration)
}

const nextPhase = () => {
  // 检查是否达到会话时长
  if (sessionStartTime.value && elapsedTime.value >= props.sessionDuration) {
    completeSession()
    return
  }
  
  const phases = ['inhale', 'hold', 'exhale', 'pause']
  const currentIndex = phases.indexOf(currentPhase.value)
  const nextIndex = (currentIndex + 1) % phases.length
  
  currentPhase.value = phases[nextIndex]
  progressOffset.value = circumference
  
  emit('phase-change', currentPhase.value)
  
  if (currentPhase.value === 'inhale') {
    currentCycle.value++
    emit('cycle-complete', currentCycle.value)
  }
  
  if (isActive.value) {
    startPhaseTimer()
  }
}

// 完成会话
const completeSession = () => {
  stop()
  emit('session-complete', {
    cycles: currentCycle.value,
    duration: elapsedTime.value,
    sessionId: sessionId.value
  })
}

const startElapsedTimer = () => {
  elapsedTimer = setInterval(() => {
    elapsedTime.value++
  }, 1000)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 监听器
watch(() => props.pattern, () => {
  if (isActive.value) {
    resetBreathing()
  }
}, { deep: true })

// 生命周期
onMounted(() => {
  if (props.autoStart) {
    startBreathing()
  }
})

onUnmounted(() => {
  pauseBreathing()
})
</script>

<style scoped>
.breathing-guide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  flex: 1;
}

.breathing-circle-container {
  position: relative;
  margin-bottom: 3rem;
}

.breathing-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.breathing-circle.inhaling {
  animation: inhale var(--inhale-duration) ease-in-out;
}

.breathing-circle.holding {
  animation: hold var(--hold-duration) ease-in-out;
}

.breathing-circle.exhaling {
  animation: exhale var(--exhale-duration) ease-in-out;
}

.breathing-circle.paused {
  animation: pause var(--pause-duration) ease-in-out;
}

@keyframes inhale {
  0% { transform: scale(1); box-shadow: 0 0 30px rgba(255, 255, 255, 0.3); }
  100% { transform: scale(1.3); box-shadow: 0 0 50px rgba(76, 175, 80, 0.6); }
}

@keyframes hold {
  0%, 100% { transform: scale(1.3); box-shadow: 0 0 50px rgba(76, 175, 80, 0.6); }
}

@keyframes exhale {
  0% { transform: scale(1.3); box-shadow: 0 0 50px rgba(76, 175, 80, 0.6); }
  100% { transform: scale(1); box-shadow: 0 0 30px rgba(33, 150, 243, 0.6); }
}

@keyframes pause {
  0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(255, 255, 255, 0.3); }
}

.inner-circle {
  text-align: center;
  z-index: 2;
}

.breath-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.breath-counter {
  font-size: 3.5rem;
  font-weight: 800;
  color: #4CAF50;
  text-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
  line-height: 1;
}

.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  transform: translate(-50%, -50%);
  animation: ripple 3s infinite;
  animation-delay: var(--delay);
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.progress-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.progress-svg {
  transform: rotate(-90deg);
}

.progress-bar {
  transition: stroke-dashoffset 0.3s ease;
}

.breathing-instructions {
  text-align: center;
  margin-bottom: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.phase-title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.phase-description {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
  max-width: 400px;
  line-height: 1.6;
}

.breathing-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1.5rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 40px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: white;
  opacity: 0.9;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.breathing-controls {
  display: flex;
  gap: 1rem;
}

.control-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn.primary {
  background: #4CAF50;
  color: white;
}

.control-btn.primary:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.control-btn.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.control-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  left: var(--x);
  top: var(--y);
  animation: float var(--duration) infinite linear;
  animation-delay: var(--delay);
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .breathing-guide {
    padding: 1rem;
  }
  
  .breathing-circle {
    width: 120px;
    height: 120px;
  }
  
  .breath-text {
    font-size: 1rem;
  }
  
  .breath-counter {
    font-size: 1.5rem;
  }
  
  .phase-title {
    font-size: 1.5rem;
  }
  
  .phase-description {
    font-size: 1rem;
  }
  
  .breathing-stats {
    gap: 1rem;
  }
  
  .control-btn {
    padding: 0.5rem 1.5rem;
    font-size: 0.9rem;
  }
}
</style>