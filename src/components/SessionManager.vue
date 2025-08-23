<template>
  <div class="session-manager">
    <!-- 会话控制面板 -->
    <div class="session-controls" v-if="!isSessionActive">
      <div class="session-setup">
        <h3>开始新的训练会话</h3>
        <div class="setup-options">
          <div class="option-group">
            <label>训练时长</label>
            <select v-model="sessionConfig.duration">
              <option :value="300">5分钟</option>
              <option :value="600">10分钟</option>
              <option :value="900">15分钟</option>
              <option :value="1200">20分钟</option>
              <option :value="1800">30分钟</option>
            </select>
          </div>
          
          <div class="option-group">
            <label>训练模块</label>
            <select v-model="sessionConfig.module">
              <option value="breathing">呼吸训练</option>
              <option value="brainwave">脑波生成器</option>
              <option value="metronome">节拍器</option>
              <option value="visualization">想象力训练</option>
              <option value="mindfulness">正念训练</option>
            </select>
          </div>
          
          <div class="option-group">
            <label>训练目标</label>
            <select v-model="sessionConfig.goal">
              <option value="relaxation">放松</option>
              <option value="focus">专注</option>
              <option value="stress-relief">减压</option>
              <option value="sleep">助眠</option>
              <option value="energy">提神</option>
            </select>
          </div>
        </div>
        
        <button class="start-session-btn" @click="startSession">
          <span class="btn-icon">🎯</span>
          开始训练会话
        </button>
      </div>
    </div>
    
    <!-- 活跃会话显示 -->
    <div class="active-session" v-if="isSessionActive">
      <div class="session-header">
        <h3>{{ getModuleName(currentSession.module) }}训练中</h3>
        <div class="session-timer">
          <span class="time-display">{{ formatTime(elapsedTime) }}</span>
          <span class="time-total">/ {{ formatTime(currentSession.duration) }}</span>
        </div>
      </div>
      
      <div class="session-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${sessionProgress}%` }"
          ></div>
        </div>
        <span class="progress-text">{{ Math.round(sessionProgress) }}%</span>
      </div>
      
      <div class="session-stats">
        <div class="stat-item">
          <span class="stat-label">目标</span>
          <span class="stat-value">{{ getGoalName(currentSession.goal) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">状态</span>
          <span class="stat-value">{{ isPaused ? '已暂停' : '进行中' }}</span>
        </div>
      </div>
      
      <div class="session-controls">
        <button 
          class="control-btn"
          :class="{ 'pause': !isPaused, 'resume': isPaused }"
          @click="togglePause"
        >
          {{ isPaused ? '继续' : '暂停' }}
        </button>
        <button class="control-btn stop" @click="stopSession">
          结束会话
        </button>
      </div>
    </div>
    
    <!-- 会话完成模态框 -->
    <div class="session-complete-modal" v-if="showCompleteModal">
      <div class="modal-content">
        <div class="completion-header">
          <h3>🎉 训练完成！</h3>
          <p>恭喜你完成了这次{{ getModuleName(completedSession.module) }}训练</p>
        </div>
        
        <div class="completion-stats">
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-info">
              <span class="stat-label">训练时长</span>
              <span class="stat-value">{{ formatTime(completedSession.actualDuration) }}</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
              <span class="stat-label">训练目标</span>
              <span class="stat-value">{{ getGoalName(completedSession.goal) }}</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-info">
              <span class="stat-label">完成度</span>
              <span class="stat-value">{{ Math.round(completedSession.completionRate) }}%</span>
            </div>
          </div>
        </div>
        
        <!-- 心情和专注度评价 -->
        <div class="feedback-section">
          <div class="feedback-group">
            <label>训练后的心情</label>
            <div class="mood-options">
              <button 
                v-for="mood in moodOptions" 
                :key="mood.value"
                class="mood-btn"
                :class="{ 'selected': feedback.mood === mood.value }"
                @click="feedback.mood = mood.value"
              >
                {{ mood.emoji }} {{ mood.label }}
              </button>
            </div>
          </div>
          
          <div class="feedback-group">
            <label>专注度评分</label>
            <div class="focus-rating">
              <button 
                v-for="n in 5" 
                :key="n"
                class="star-btn"
                :class="{ 'active': feedback.focusLevel >= n }"
                @click="feedback.focusLevel = n"
              >
                ⭐
              </button>
            </div>
          </div>
          
          <div class="feedback-group">
            <label>训练笔记（可选）</label>
            <textarea 
              v-model="feedback.notes"
              placeholder="记录你的感受或想法..."
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="action-btn primary" @click="saveSessionData">
            保存并继续
          </button>
          <button class="action-btn secondary" @click="closeModal">
            跳过保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import meditationStorage from '@/utils/meditationStorage'

const emit = defineEmits(['session-start', 'session-pause', 'session-resume', 'session-complete', 'session-stop'])

// 会话状态
const isSessionActive = ref(false)
const isPaused = ref(false)
const elapsedTime = ref(0)
const showCompleteModal = ref(false)

// 会话配置
const sessionConfig = ref({
  duration: 300, // 5分钟
  module: 'breathing',
  goal: 'relaxation'
})

// 当前会话数据
const currentSession = ref(null)
const completedSession = ref(null)

// 用户反馈
const feedback = ref({
  mood: null,
  focusLevel: 0,
  notes: ''
})

// 定时器
let sessionTimer = null

// 心情选项
const moodOptions = [
  { value: 'very-happy', emoji: '😄', label: '非常开心' },
  { value: 'happy', emoji: '😊', label: '开心' },
  { value: 'neutral', emoji: '😐', label: '一般' },
  { value: 'sad', emoji: '😔', label: '有点累' },
  { value: 'very-sad', emoji: '😞', label: '很累' }
]

// 计算属性
const sessionProgress = computed(() => {
  if (!currentSession.value) return 0
  return Math.min((elapsedTime.value / currentSession.value.duration) * 100, 100)
})

// 方法
const startSession = () => {
  currentSession.value = {
    id: Date.now(),
    startTime: new Date().toISOString(),
    ...sessionConfig.value
  }
  
  isSessionActive.value = true
  isPaused.value = false
  elapsedTime.value = 0
  
  startTimer()
  emit('session-start', currentSession.value)
  
  // 保存会话开始记录
  meditationStorage.addSessionRecord({
    ...currentSession.value,
    status: 'started'
  })
}

const togglePause = () => {
  isPaused.value = !isPaused.value
  
  if (isPaused.value) {
    clearInterval(sessionTimer)
    emit('session-pause', currentSession.value)
  } else {
    startTimer()
    emit('session-resume', currentSession.value)
  }
}

const stopSession = () => {
  const actualDuration = elapsedTime.value
  const completionRate = (actualDuration / currentSession.value.duration) * 100
  
  completedSession.value = {
    ...currentSession.value,
    endTime: new Date().toISOString(),
    actualDuration,
    completionRate,
    status: 'stopped'
  }
  
  clearInterval(sessionTimer)
  isSessionActive.value = false
  isPaused.value = false
  
  // 重置反馈
  feedback.value = {
    mood: null,
    focusLevel: 0,
    notes: ''
  }
  
  showCompleteModal.value = true
  emit('session-stop', completedSession.value)
}

const completeSession = () => {
  const actualDuration = elapsedTime.value
  const completionRate = 100
  
  completedSession.value = {
    ...currentSession.value,
    endTime: new Date().toISOString(),
    actualDuration,
    completionRate,
    status: 'completed'
  }
  
  clearInterval(sessionTimer)
  isSessionActive.value = false
  isPaused.value = false
  
  // 重置反馈
  feedback.value = {
    mood: null,
    focusLevel: 0,
    notes: ''
  }
  
  showCompleteModal.value = true
  emit('session-complete', completedSession.value)
}

const startTimer = () => {
  sessionTimer = setInterval(() => {
    if (!isPaused.value) {
      elapsedTime.value++
      
      // 检查是否完成
      if (elapsedTime.value >= currentSession.value.duration) {
        completeSession()
      }
    }
  }, 1000)
}

const saveSessionData = async () => {
  if (!completedSession.value) return
  
  // 保存会话记录
  const sessionRecord = {
    ...completedSession.value,
    feedback: feedback.value
  }
  
  meditationStorage.addSessionRecord(sessionRecord)
  
  // 更新用户进度
  meditationStorage.updateSessionComplete(
    completedSession.value.module,
    completedSession.value.actualDuration,
    {
      goal: completedSession.value.goal,
      completionRate: completedSession.value.completionRate
    }
  )
  
  // 保存心情和专注度记录
  if (feedback.value.mood) {
    meditationStorage.addMoodRecord(feedback.value.mood, feedback.value.notes)
  }
  
  if (feedback.value.focusLevel > 0) {
    meditationStorage.addFocusRecord(feedback.value.focusLevel, completedSession.value.module)
  }
  
  closeModal()
}

const closeModal = () => {
  showCompleteModal.value = false
  completedSession.value = null
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const getModuleName = (module) => {
  const names = {
    breathing: '呼吸',
    brainwave: '脑波',
    metronome: '节拍器',
    visualization: '想象力',
    mindfulness: '正念'
  }
  return names[module] || module
}

const getGoalName = (goal) => {
  const names = {
    relaxation: '放松',
    focus: '专注',
    'stress-relief': '减压',
    sleep: '助眠',
    energy: '提神'
  }
  return names[goal] || goal
}

// 加载用户偏好
onMounted(() => {
  const preferences = meditationStorage.getPreferences()
  if (preferences.defaultSessionDuration) {
    sessionConfig.value.duration = preferences.defaultSessionDuration
  }
})

// 清理定时器
onUnmounted(() => {
  if (sessionTimer) {
    clearInterval(sessionTimer)
  }
})

// 监听页面离开
watch(() => isSessionActive.value, (newValue) => {
  if (newValue) {
    // 页面离开时保存会话状态
    window.addEventListener('beforeunload', handleBeforeUnload)
  } else {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
})

const handleBeforeUnload = (event) => {
  if (isSessionActive.value) {
    event.preventDefault()
    event.returnValue = '你有一个正在进行的训练会话，确定要离开吗？'
  }
}
</script>

<style scoped>
.session-manager {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.session-setup {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.session-setup h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.setup-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.option-group {
  text-align: left;
}

.option-group label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
}

.option-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;
}

.option-group select:focus {
  outline: none;
  border-color: #667eea;
}

.start-session-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.start-session-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.active-session {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.session-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.session-header h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.session-timer {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.time-total {
  font-size: 1.2rem;
  color: #999;
  font-weight: 400;
}

.session-progress {
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  display: block;
}

.session-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.session-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.control-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn.pause,
.control-btn.resume {
  background: #4CAF50;
  color: white;
}

.control-btn.stop {
  background: #f44336;
  color: white;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.session-complete-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.completion-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.completion-header h3 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.completion-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1rem;
  text-align: center;
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.feedback-section {
  margin-bottom: 2rem;
}

.feedback-group {
  margin-bottom: 1.5rem;
}

.feedback-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
}

.mood-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mood-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.mood-btn.selected {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.focus-rating {
  display: flex;
  gap: 0.25rem;
}

.star-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.star-btn.active {
  opacity: 1;
}

.feedback-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
}

.feedback-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.secondary {
  background: #e0e0e0;
  color: #666;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .session-manager {
    padding: 1rem;
  }
  
  .setup-options {
    grid-template-columns: 1fr;
  }
  
  .session-controls {
    flex-direction: column;
  }
  
  .completion-stats {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>