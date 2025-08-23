<template>
  <div class="mindfulness-monitor">
    <!-- 注意力监测显示 -->
    <div class="attention-monitor" v-if="isActive">
      <div class="monitor-header">
        <h4>🧠 注意力监测</h4>
        <div class="attention-score">
          <span class="score-value">{{ attentionScore }}%</span>
          <div class="score-indicator" :class="attentionLevel"></div>
        </div>
      </div>
      
      <div class="attention-visual">
        <div class="attention-waves">
          <div 
            v-for="(wave, index) in attentionWaves" 
            :key="index"
            class="wave"
            :class="`wave-${index + 1}`"
            :style="{ animationDuration: wave.duration + 's', opacity: wave.opacity }"
          ></div>
        </div>
        
        <div class="focus-center" :class="{ active: isFocused }">
          <span class="focus-icon">{{ focusIcon }}</span>
        </div>
      </div>
      
      <div class="attention-feedback">
        <div class="feedback-text" :class="attentionLevel">
          {{ currentFeedback }}
        </div>
        <div class="feedback-tips">
          <span v-for="tip in activeTips" :key="tip" class="tip-item">
            {{ tip }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- 实时提醒系统 -->
    <div class="reminder-system" v-if="showReminder">
      <transition name="reminder-fade">
        <div class="reminder-card" :class="reminderType">
          <div class="reminder-icon">{{ reminderIcon }}</div>
          <div class="reminder-content">
            <p class="reminder-text">{{ reminderText }}</p>
            <div class="reminder-actions" v-if="reminderActions.length > 0">
              <button 
                v-for="action in reminderActions" 
                :key="action.text"
                class="reminder-btn"
                @click="handleReminderAction(action)"
              >
                {{ action.text }}
              </button>
            </div>
          </div>
          <button class="reminder-close" @click="dismissReminder">×</button>
        </div>
      </transition>
    </div>
    
    <!-- 情绪状态追踪 -->
    <div class="emotion-tracker" v-if="showEmotionTracker">
      <h4>💭 情绪状态</h4>
      <div class="emotion-grid">
        <button 
          v-for="emotion in emotions" 
          :key="emotion.name"
          class="emotion-btn"
          :class="{ active: selectedEmotion === emotion.name }"
          @click="selectEmotion(emotion)"
        >
          <span class="emotion-icon">{{ emotion.icon }}</span>
          <span class="emotion-name">{{ emotion.name }}</span>
        </button>
      </div>
      
      <div class="emotion-intensity" v-if="selectedEmotion">
        <label>强度：</label>
        <div class="intensity-slider">
          <input 
            type="range" 
            v-model="emotionIntensity" 
            min="1" 
            max="10" 
            class="slider"
          >
          <div class="intensity-labels">
            <span>轻微</span>
            <span>中等</span>
            <span>强烈</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 呼吸引导 -->
    <div class="breathing-guide" v-if="showBreathingGuide">
      <div class="breathing-visual">
        <div class="breathing-circle" :class="breathingPhase">
          <div class="breathing-center">
            <span class="breathing-text">{{ breathingText }}</span>
          </div>
        </div>
      </div>
      
      <div class="breathing-instructions">
        <p>{{ breathingInstruction }}</p>
        <div class="breathing-count">
          <span>第 {{ breathingCycle }} 个呼吸循环</span>
        </div>
      </div>
    </div>
    
    <!-- 进度统计 -->
    <div class="progress-stats" v-if="showStats">
      <div class="stat-item">
        <span class="stat-label">专注时间</span>
        <span class="stat-value">{{ formatTime(focusedTime) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">分心次数</span>
        <span class="stat-value">{{ distractionCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">回归次数</span>
        <span class="stat-value">{{ returnCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  showEmotionTracker: {
    type: Boolean,
    default: true
  },
  showBreathingGuide: {
    type: Boolean,
    default: false
  },
  showStats: {
    type: Boolean,
    default: true
  },
  exerciseType: {
    type: String,
    default: 'general'
  }
})

// Emits
const emit = defineEmits([
  'attention-change',
  'emotion-selected',
  'distraction-detected',
  'focus-returned'
])

// 注意力监测状态
const attentionScore = ref(85)
const isFocused = ref(true)
const focusedTime = ref(0)
const distractionCount = ref(0)
const returnCount = ref(0)

// 提醒系统状态
const showReminder = ref(false)
const reminderType = ref('gentle')
const reminderText = ref('')
const reminderIcon = ref('🔔')
const reminderActions = ref([])

// 情绪追踪状态
const selectedEmotion = ref('')
const emotionIntensity = ref(5)

// 呼吸引导状态
const breathingPhase = ref('inhale')
const breathingCycle = ref(1)
const breathingText = ref('吸气')
const breathingInstruction = ref('慢慢深吸气，感受空气进入身体')

// 定时器
let attentionTimer = null
let reminderTimer = null
let breathingTimer = null
let focusTimer = null

// 注意力波浪效果
const attentionWaves = ref([
  { duration: 3, opacity: 0.6 },
  { duration: 4, opacity: 0.4 },
  { duration: 5, opacity: 0.3 }
])

// 情绪选项
const emotions = ref([
  { name: '平静', icon: '😌', color: '#95E1D3' },
  { name: '焦虑', icon: '😰', color: '#FFB6C1' },
  { name: '快乐', icon: '😊', color: '#FFD700' },
  { name: '悲伤', icon: '😢', color: '#87CEEB' },
  { name: '愤怒', icon: '😠', color: '#FF6B6B' },
  { name: '困惑', icon: '🤔', color: '#DDA0DD' },
  { name: '感激', icon: '🙏', color: '#98FB98' },
  { name: '疲惫', icon: '😴', color: '#D3D3D3' }
])

// 计算属性
const attentionLevel = computed(() => {
  if (attentionScore.value >= 80) return 'high'
  if (attentionScore.value >= 60) return 'medium'
  return 'low'
})

const focusIcon = computed(() => {
  switch (props.exerciseType) {
    case 'breathing': return '🌬️'
    case 'body-scan': return '🫂'
    case 'emotion': return '💭'
    case 'sound': return '👂'
    default: return '🧘‍♀️'
  }
})

const currentFeedback = computed(() => {
  const feedbacks = {
    high: ['专注度很好！', '保持这种状态', '你做得很棒'],
    medium: ['注意力有些分散', '试着回到当下', '轻柔地拉回注意力'],
    low: ['注意力跑得有点远', '没关系，重新开始', '每一刻都是新的机会']
  }
  const levelFeedbacks = feedbacks[attentionLevel.value]
  return levelFeedbacks[Math.floor(Math.random() * levelFeedbacks.length)]
})

const activeTips = computed(() => {
  const tips = {
    breathing: ['专注于呼吸的感觉', '感受空气的温度', '注意胸腹的起伏'],
    'body-scan': ['从头到脚扫描', '不要试图改变什么', '只是观察和感受'],
    emotion: ['观察情绪的变化', '不要评判好坏', '接纳当下的感受'],
    sound: ['听听远近的声音', '注意声音的层次', '让声音自然来去']
  }
  return tips[props.exerciseType] || ['保持觉察', '友善对待自己', '当下就是最好的时刻']
})

// 方法
const startMonitoring = () => {
  if (!props.isActive) return
  
  // 模拟注意力监测
  attentionTimer = setInterval(() => {
    simulateAttentionChange()
  }, 3000)
  
  // 专注时间计时
  focusTimer = setInterval(() => {
    if (isFocused.value) {
      focusedTime.value++
    }
  }, 1000)
  
  // 定期提醒
  reminderTimer = setInterval(() => {
    showGentleReminder()
  }, 120000) // 每2分钟
  
  // 呼吸引导
  if (props.showBreathingGuide) {
    startBreathingGuide()
  }
}

const simulateAttentionChange = () => {
  // 模拟注意力分数变化
  const change = (Math.random() - 0.5) * 20
  attentionScore.value = Math.max(20, Math.min(100, attentionScore.value + change))
  
  const wasFocused = isFocused.value
  isFocused.value = attentionScore.value > 60
  
  // 检测分心和回归
  if (wasFocused && !isFocused.value) {
    distractionCount.value++
    emit('distraction-detected', { score: attentionScore.value })
    showDistractionReminder()
  } else if (!wasFocused && isFocused.value) {
    returnCount.value++
    emit('focus-returned', { score: attentionScore.value })
  }
  
  emit('attention-change', { 
    score: attentionScore.value, 
    level: attentionLevel.value,
    focused: isFocused.value
  })
}

const showGentleReminder = () => {
  const reminders = [
    { text: '记得保持友善的态度对待自己', icon: '💝', type: 'gentle' },
    { text: '注意力跑了很正常，轻柔地拉回来', icon: '🌸', type: 'gentle' },
    { text: '每一刻都是新的开始', icon: '🌅', type: 'gentle' },
    { text: '观察而不评判', icon: '👁️', type: 'gentle' }
  ]
  
  const reminder = reminders[Math.floor(Math.random() * reminders.length)]
  showReminderMessage(reminder.text, reminder.icon, reminder.type)
}

const showDistractionReminder = () => {
  const reminders = [
    { 
      text: '注意力分散了，要回到练习吗？', 
      icon: '🎯', 
      type: 'attention',
      actions: [{ text: '回到练习', action: 'refocus' }]
    },
    { 
      text: '发现思维在游走，这很正常', 
      icon: '🌊', 
      type: 'gentle',
      actions: [{ text: '重新开始', action: 'restart' }]
    }
  ]
  
  const reminder = reminders[Math.floor(Math.random() * reminders.length)]
  showReminderMessage(reminder.text, reminder.icon, reminder.type, reminder.actions)
}

const showReminderMessage = (text, icon, type, actions = []) => {
  reminderText.value = text
  reminderIcon.value = icon
  reminderType.value = type
  reminderActions.value = actions
  showReminder.value = true
  
  // 自动消失
  setTimeout(() => {
    showReminder.value = false
  }, 5000)
}

const handleReminderAction = (action) => {
  switch (action.action) {
    case 'refocus':
      attentionScore.value = Math.min(100, attentionScore.value + 20)
      break
    case 'restart':
      attentionScore.value = 75
      break
  }
  dismissReminder()
}

const dismissReminder = () => {
  showReminder.value = false
}

const selectEmotion = (emotion) => {
  selectedEmotion.value = emotion.name
  emit('emotion-selected', {
    emotion: emotion.name,
    intensity: emotionIntensity.value,
    timestamp: Date.now()
  })
}

const startBreathingGuide = () => {
  const breathingCycleTime = 8000 // 8秒一个完整周期
  
  breathingTimer = setInterval(() => {
    if (breathingPhase.value === 'inhale') {
      breathingPhase.value = 'hold'
      breathingText.value = '屏息'
      breathingInstruction.value = '轻轻屏住呼吸'
    } else if (breathingPhase.value === 'hold') {
      breathingPhase.value = 'exhale'
      breathingText.value = '呼气'
      breathingInstruction.value = '慢慢呼出，放松身体'
    } else {
      breathingPhase.value = 'inhale'
      breathingText.value = '吸气'
      breathingInstruction.value = '慢慢深吸气，感受空气进入身体'
      breathingCycle.value++
    }
  }, breathingCycleTime / 3)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const stopMonitoring = () => {
  if (attentionTimer) {
    clearInterval(attentionTimer)
    attentionTimer = null
  }
  if (reminderTimer) {
    clearInterval(reminderTimer)
    reminderTimer = null
  }
  if (breathingTimer) {
    clearInterval(breathingTimer)
    breathingTimer = null
  }
  if (focusTimer) {
    clearInterval(focusTimer)
    focusTimer = null
  }
}

// 监听器
watch(() => props.isActive, (newVal) => {
  if (newVal) {
    startMonitoring()
  } else {
    stopMonitoring()
  }
})

watch(emotionIntensity, (newVal) => {
  if (selectedEmotion.value) {
    emit('emotion-selected', {
      emotion: selectedEmotion.value,
      intensity: newVal,
      timestamp: Date.now()
    })
  }
})

// 生命周期
onMounted(() => {
  if (props.isActive) {
    startMonitoring()
  }
})

onUnmounted(() => {
  stopMonitoring()
})
</script>

<style scoped>
.mindfulness-monitor {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-md);
}

.attention-monitor {
  margin-bottom: 2rem;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.monitor-header h4 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.2rem;
}

.attention-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
}

.score-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.score-indicator.high {
  background: #4CAF50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.score-indicator.medium {
  background: #FF9800;
  box-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
}

.score-indicator.low {
  background: #F44336;
  box-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
}

.attention-visual {
  position: relative;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.attention-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
}

.wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(149, 225, 211, 0.3), transparent);
  animation: wave-pulse ease-in-out infinite;
}

.wave-1 {
  animation-delay: 0s;
}

.wave-2 {
  animation-delay: 1s;
}

.wave-3 {
  animation-delay: 2s;
}

@keyframes wave-pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.1;
  }
}

.focus-center {
  position: relative;
  z-index: 2;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(149, 225, 211, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
}

.focus-center.active {
  background: rgba(149, 225, 211, 0.4);
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(149, 225, 211, 0.3);
}

.focus-icon {
  font-size: 1.5rem;
}

.attention-feedback {
  text-align: center;
}

.feedback-text {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  padding: 0.8rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.feedback-text.high {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.feedback-text.medium {
  background: rgba(255, 152, 0, 0.1);
  color: #FF9800;
}

.feedback-text.low {
  background: rgba(244, 67, 54, 0.1);
  color: #F44336;
}

.feedback-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.tip-item {
  background: rgba(149, 225, 211, 0.1);
  color: #95E1D3;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.reminder-system {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 300px;
}

.reminder-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #95E1D3;
  position: relative;
  display: flex;
  gap: 1rem;
}

.reminder-card.attention {
  border-left-color: #FF9800;
}

.reminder-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.reminder-content {
  flex: 1;
}

.reminder-text {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
  font-size: 0.9rem;
}

.reminder-actions {
  display: flex;
  gap: 0.5rem;
}

.reminder-btn {
  background: #95E1D3;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reminder-btn:hover {
  background: #7ECECA;
}

.reminder-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reminder-fade-enter-active,
.reminder-fade-leave-active {
  transition: all 0.3s ease;
}

.reminder-fade-enter-from,
.reminder-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.emotion-tracker {
  margin-bottom: 2rem;
}

.emotion-tracker h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.emotion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.emotion-btn {
  background: var(--color-card-bg);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 0.8rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.emotion-btn:hover {
  border-color: rgba(149, 225, 211, 0.3);
}

.emotion-btn.active {
  border-color: #95E1D3;
  background: rgba(149, 225, 211, 0.1);
}

.emotion-icon {
  font-size: 1.5rem;
}

.emotion-name {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.emotion-intensity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.emotion-intensity label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.intensity-slider {
  flex: 1;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #95E1D3;
  cursor: pointer;
}

.intensity-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.3rem;
}

.breathing-guide {
  text-align: center;
  margin-bottom: 2rem;
}

.breathing-visual {
  margin-bottom: 1rem;
}

.breathing-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(149, 225, 211, 0.3), rgba(149, 225, 211, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  transition: all 2s ease-in-out;
}

.breathing-circle.inhale {
  transform: scale(1.3);
}

.breathing-circle.hold {
  transform: scale(1.3);
}

.breathing-circle.exhale {
  transform: scale(1);
}

.breathing-center {
  color: #95E1D3;
  font-weight: 600;
}

.breathing-text {
  font-size: 1.2rem;
}

.breathing-instructions p {
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.breathing-count {
  color: var(--color-primary);
  font-size: 0.9rem;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(149, 225, 211, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
}

.stat-value {
  display: block;
  color: var(--color-primary);
  font-size: 1.2rem;
  font-weight: 600;
}
</style>