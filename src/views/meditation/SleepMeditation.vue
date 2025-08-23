<template>
  <div class="sleep-meditation">
    <!-- 面包屑导航 -->
    <BreadcrumbDropdown
      :main-title="'冥想训练'"
      :main-path="'/meditation'"
      :sub-title="'引导冥想'"
       :sub-path="'/meditation/guided'"
      :current-title="'睡眠冥想'"
      :sibling-modules="[
        { title: '引导冥想', path: '/meditation/guided' },
        { title: '呼吸训练', path: '/meditation/breathing' },
        { title: '脑波生成器', path: '/meditation/brainwave-generator' },
        { title: '节拍器', path: '/meditation/metronome' },
        { title: '想象力训练', path: '/meditation/visualization' },
        { title: '正念训练', path: '/meditation/mindfulness' }
      ]"
      :sub-sibling-modules="[
        { title: '正念冥想', path: '/meditation/guided/mindfulness' },
        { title: '放松冥想', path: '/meditation/guided/relaxation' },
        { title: '专注冥想', path: '/meditation/guided/focus' },
        { title: '睡眠冥想', path: '/meditation/guided/sleep' },
        { title: '疗愈冥想', path: '/meditation/guided/healing' },
        { title: '创造力冥想', path: '/meditation/guided/creativity' }
      ]"
    />

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="icon-sleep">🌙</i>
        睡眠冥想
      </h1>
      <p class="page-description">
        通过专门的睡眠冥想练习，改善睡眠质量，帮助快速入睡和深度休息
      </p>
    </div>

    <!-- 睡眠模式选择 -->
    <div class="sleep-modes">
      <h2>睡眠模式</h2>
      <div class="modes-grid">
        <div class="mode-card" :class="{ active: selectedMode === 'quick' }" @click="selectMode('quick')">
          <div class="mode-icon">⚡</div>
          <h4>快速入睡</h4>
          <p>5-15分钟快速放松技巧</p>
        </div>
        <div class="mode-card" :class="{ active: selectedMode === 'deep' }" @click="selectMode('deep')">
          <div class="mode-icon">🌊</div>
          <h4>深度睡眠</h4>
          <p>30-60分钟深度放松引导</p>
        </div>
        <div class="mode-card" :class="{ active: selectedMode === 'story' }" @click="selectMode('story')">
          <div class="mode-icon">📖</div>
          <h4>睡前故事</h4>
          <p>舒缓的睡前故事和音景</p>
        </div>
        <div class="mode-card" :class="{ active: selectedMode === 'nature' }" @click="selectMode('nature')">
          <div class="mode-icon">🌿</div>
          <h4>自然声音</h4>
          <p>雨声、海浪等自然白噪音</p>
        </div>
      </div>
    </div>

    <!-- 冥想播放器 -->
    <div class="meditation-player" v-if="currentMeditation">
      <div class="player-header">
        <h3>{{ currentMeditation.title }}</h3>
        <p>{{ currentMeditation.description }}</p>
      </div>
      
      <div class="player-controls">
        <div class="progress-section">
          <div class="time-display">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(totalTime) }}</span>
          </div>
          <div class="progress-bar" @click="seekTo">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>
        
        <div class="control-buttons">
          <button class="control-btn" @click="previousTrack">
            <i class="icon-previous">⏮</i>
          </button>
          <button class="play-btn" @click="togglePlay">
            <i :class="isPlaying ? 'icon-pause' : 'icon-play'">{{ isPlaying ? '⏸' : '▶' }}</i>
          </button>
          <button class="control-btn" @click="nextTrack">
            <i class="icon-next">⏭</i>
          </button>
        </div>
        
        <div class="volume-control">
          <i class="icon-volume">🔊</i>
          <input type="range" v-model="volume" min="0" max="100" class="volume-slider">
        </div>
        
        <div class="sleep-timer">
          <label>睡眠定时器:</label>
          <select v-model="sleepTimer" class="timer-select">
            <option value="0">关闭</option>
            <option value="15">15分钟</option>
            <option value="30">30分钟</option>
            <option value="45">45分钟</option>
            <option value="60">60分钟</option>
            <option value="90">90分钟</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 睡眠音频库 -->
    <div class="meditation-library">
      <div class="library-header">
        <h2>睡眠音频库</h2>
        <div class="filters">
          <select v-model="selectedDuration" class="filter-select">
            <option value="">所有时长</option>
            <option value="5">5分钟</option>
            <option value="15">15分钟</option>
            <option value="30">30分钟</option>
            <option value="60">60分钟</option>
            <option value="120">2小时</option>
          </select>
          
          <select v-model="selectedCategory" class="filter-select">
            <option value="">所有分类</option>
            <option value="引导冥想">引导冥想</option>
            <option value="自然声音">自然声音</option>
            <option value="白噪音">白噪音</option>
            <option value="睡前故事">睡前故事</option>
          </select>
        </div>
      </div>
      
      <div class="meditation-grid">
        <div 
          v-for="meditation in filteredMeditations" 
          :key="meditation.id"
          class="meditation-card"
          :class="{ active: currentMeditation?.id === meditation.id }"
          @click="selectMeditation(meditation)"
        >
          <div class="card-icon">
            <i>{{ meditation.icon }}</i>
          </div>
          <div class="card-content">
            <h4>{{ meditation.title }}</h4>
            <p class="card-description">{{ meditation.description }}</p>
            <div class="card-meta">
              <span class="duration">{{ meditation.duration }}分钟</span>
              <span class="category">{{ meditation.category }}</span>
              <span class="rating">⭐ {{ meditation.rating }}</span>
            </div>
            <div class="card-benefits">
              <span v-for="benefit in meditation.benefits" :key="benefit" class="benefit-tag">
                {{ benefit }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 睡眠建议 -->
    <div class="sleep-tips">
      <h3>睡眠改善建议</h3>
      <div class="tips-grid">
        <div class="tip-card">
          <div class="tip-icon">🕘</div>
          <h4>规律作息</h4>
          <p>每天在相同时间入睡和起床，建立稳定的生物钟</p>
        </div>
        <div class="tip-card">
          <div class="tip-icon">📱</div>
          <h4>睡前数字排毒</h4>
          <p>睡前1小时避免使用电子设备，减少蓝光刺激</p>
        </div>
        <div class="tip-card">
          <div class="tip-icon">🌡️</div>
          <h4>舒适环境</h4>
          <p>保持卧室温度在18-22°C，确保安静和黑暗</p>
        </div>
        <div class="tip-card">
          <div class="tip-icon">🧘‍♀️</div>
          <h4>放松练习</h4>
          <p>睡前进行深呼吸或渐进式肌肉放松练习</p>
        </div>
      </div>
    </div>

    <!-- 睡眠质量追踪 -->
    <div class="sleep-tracking">
      <h3>睡眠质量追踪</h3>
      <div class="tracking-content">
        <div class="sleep-score">
          <div class="score-circle">
            <span class="score-value">{{ sleepScore }}</span>
            <span class="score-label">睡眠评分</span>
          </div>
        </div>
        <div class="sleep-metrics">
          <div class="metric-item">
            <span class="metric-label">入睡时间</span>
            <span class="metric-value">{{ fallAsleepTime }}分钟</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">深度睡眠</span>
            <span class="metric-value">{{ deepSleepTime }}小时</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">睡眠效率</span>
            <span class="metric-value">{{ sleepEfficiency }}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">连续使用</span>
            <span class="metric-value">{{ streakDays }}天</span>
          </div>
        </div>
        <button class="track-btn" @click="startSleepTracking">开始今晚追踪</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTrainingStore } from '@/stores'
import BreadcrumbDropdown from '@/components/BreadcrumbDropdown.vue'

const trainingStore = useTrainingStore()

// 响应式数据
const isPlaying = ref(false)
const currentTime = ref(0)
const totalTime = ref(0)
const volume = ref(50)
const currentMeditation = ref(null)
const selectedDuration = ref('')
const selectedCategory = ref('')
const selectedMode = ref('quick')
const sleepTimer = ref(30)

// 兄弟模块
const siblingModules = [
  { name: '正念冥想', path: '/meditation/guided/mindfulness' },
  { name: '放松冥想', path: '/meditation/guided/relaxation' },
  { name: '专注冥想', path: '/meditation/guided/focus' },
  { name: '睡眠冥想', path: '/meditation/guided/sleep' },
  { name: '疗愈冥想', path: '/meditation/guided/healing' },
  { name: '创造力冥想', path: '/meditation/guided/creativity' },
  { name: '脑波发生器', path: '/meditation/brainwave-generator' },
  { name: '节拍器', path: '/meditation/metronome' }
]

// 睡眠冥想音频数据
const sleepMeditations = [
  {
    id: 'sleep-1',
    title: '快速入睡引导',
    description: '通过渐进式放松技巧，帮助你在15分钟内快速入睡',
    duration: 15,
    category: '引导冥想',
    icon: '⚡',
    audioUrl: '/audio/sleep/quick-sleep.mp3',
    rating: 4.8,
    benefits: ['快速入睡', '放松身心', '缓解焦虑'],
    instructor: '李老师',
    tags: ['快速', '入睡', '放松']
  },
  {
    id: 'sleep-2',
    title: '深度睡眠冥想',
    description: '60分钟的深度放松引导，帮助进入深层睡眠状态',
    duration: 60,
    category: '引导冥想',
    icon: '🌊',
    audioUrl: '/audio/sleep/deep-sleep.mp3',
    rating: 4.9,
    benefits: ['深度睡眠', '身心恢复', '提升睡眠质量'],
    instructor: '王老师',
    tags: ['深度', '恢复', '质量']
  },
  {
    id: 'sleep-3',
    title: '雨夜安眠',
    description: '轻柔的雨声伴随着舒缓的引导，营造完美的睡眠氛围',
    duration: 120,
    category: '自然声音',
    icon: '🌧️',
    audioUrl: '/audio/sleep/rain-sleep.mp3',
    rating: 4.7,
    benefits: ['自然声音', '深度放松', '持续睡眠'],
    instructor: '张老师',
    tags: ['雨声', '自然', '氛围']
  },
  {
    id: 'sleep-4',
    title: '森林夜曲',
    description: '森林中的夜晚声音，虫鸣鸟叫，带来宁静的睡眠体验',
    duration: 90,
    category: '自然声音',
    icon: '🌲',
    audioUrl: '/audio/sleep/forest-night.mp3',
    rating: 4.6,
    benefits: ['自然疗愈', '心灵平静', '环境音'],
    instructor: '陈老师',
    tags: ['森林', '夜晚', '宁静']
  },
  {
    id: 'sleep-5',
    title: '海浪摇篮曲',
    description: '温柔的海浪声，如同大自然的摇篮曲，带来深度安眠',
    duration: 120,
    category: '自然声音',
    icon: '🌊',
    audioUrl: '/audio/sleep/ocean-waves.mp3',
    rating: 4.8,
    benefits: ['海浪声', '深度安眠', '自然节奏'],
    instructor: '刘老师',
    tags: ['海浪', '摇篮曲', '节奏']
  },
  {
    id: 'sleep-6',
    title: '粉红噪音',
    description: '科学证明有助于深度睡眠的粉红噪音，改善睡眠质量',
    duration: 60,
    category: '白噪音',
    icon: '🎵',
    audioUrl: '/audio/sleep/pink-noise.mp3',
    rating: 4.5,
    benefits: ['科学助眠', '深度睡眠', '噪音屏蔽'],
    instructor: '赵老师',
    tags: ['粉红噪音', '科学', '屏蔽']
  },
  {
    id: 'sleep-7',
    title: '星空物语',
    description: '温柔的睡前故事，带你遨游星空，在美妙的想象中入睡',
    duration: 30,
    category: '睡前故事',
    icon: '⭐',
    audioUrl: '/audio/sleep/starry-story.mp3',
    rating: 4.7,
    benefits: ['睡前故事', '想象力', '温柔引导'],
    instructor: '孙老师',
    tags: ['星空', '故事', '想象']
  },
  {
    id: 'sleep-8',
    title: '身体扫描放松',
    description: '系统性的身体扫描练习，释放一天的疲劳和紧张',
    duration: 25,
    category: '引导冥想',
    icon: '🧘‍♀️',
    audioUrl: '/audio/sleep/body-scan-sleep.mp3',
    rating: 4.6,
    benefits: ['身体扫描', '疲劳释放', '肌肉放松'],
    instructor: '周老师',
    tags: ['扫描', '疲劳', '释放']
  }
]

// 睡眠追踪数据
const sleepScore = ref(82)
const fallAsleepTime = ref(12)
const deepSleepTime = ref(6.5)
const sleepEfficiency = ref(88)
const streakDays = ref(14)

// 计算属性
const progressPercentage = computed(() => {
  if (totalTime.value === 0) return 0
  return (currentTime.value / totalTime.value) * 100
})

const filteredMeditations = computed(() => {
  return sleepMeditations.filter(meditation => {
    const durationMatch = !selectedDuration.value || meditation.duration === parseInt(selectedDuration.value)
    const categoryMatch = !selectedCategory.value || meditation.category === selectedCategory.value
    return durationMatch && categoryMatch
  })
})

// 方法
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  // 这里可以添加实际的音频播放逻辑
}

const previousTrack = () => {
  const currentIndex = sleepMeditations.findIndex(m => m.id === currentMeditation.value?.id)
  if (currentIndex > 0) {
    selectMeditation(sleepMeditations[currentIndex - 1])
  }
}

const nextTrack = () => {
  const currentIndex = sleepMeditations.findIndex(m => m.id === currentMeditation.value?.id)
  if (currentIndex < sleepMeditations.length - 1) {
    selectMeditation(sleepMeditations[currentIndex + 1])
  }
}

const seekTo = (event) => {
  const rect = event.target.getBoundingClientRect()
  const percentage = (event.clientX - rect.left) / rect.width
  currentTime.value = Math.floor(totalTime.value * percentage)
}

const selectMeditation = (meditation) => {
  currentMeditation.value = meditation
  totalTime.value = meditation.duration * 60 // 转换为秒
  currentTime.value = 0
  isPlaying.value = false
}

const selectMode = (mode) => {
  selectedMode.value = mode
  // 根据模式筛选相应的冥想内容
  const modeFilters = {
    quick: { category: '引导冥想', maxDuration: 20 },
    deep: { category: '引导冥想', minDuration: 30 },
    story: { category: '睡前故事' },
    nature: { category: '自然声音' }
  }
  
  const filter = modeFilters[mode]
  const filtered = sleepMeditations.filter(meditation => {
    if (filter.category && meditation.category !== filter.category) return false
    if (filter.maxDuration && meditation.duration > filter.maxDuration) return false
    if (filter.minDuration && meditation.duration < filter.minDuration) return false
    return true
  })
  
  if (filtered.length > 0) {
    selectMeditation(filtered[0])
  }
}

const startSleepTracking = () => {
  // 启动睡眠追踪
  console.log('开始睡眠追踪')
}

// 生命周期
onMounted(() => {
  // 默认选择第一个冥想
  if (sleepMeditations.length > 0) {
    selectMeditation(sleepMeditations[0])
  }
})
</script>

<style scoped>
.sleep-meditation {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.icon-sleep {
  font-size: 3rem;
}

.page-description {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.sleep-modes {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.sleep-modes h2 {
  color: var(--color-text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.mode-card {
  background: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  border: 2px solid transparent;
}

.mode-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.mode-card.active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.1);
}

.mode-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.mode-card h4 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.mode-card p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.meditation-player {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.player-header {
  text-align: center;
  margin-bottom: 2rem;
}

.player-header h3 {
  font-size: 1.5rem;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.player-header p {
  color: var(--color-text-secondary);
}

.progress-section {
  margin-bottom: 2rem;
}

.time-display {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.progress-bar {
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.control-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.control-btn, .play-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
}

.play-btn {
  width: 60px;
  height: 60px;
  font-size: 1.2rem;
}

.control-btn:hover, .play-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.volume-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.volume-slider {
  width: 100px;
}

.sleep-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.sleep-timer label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.timer-select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-card-bg);
  color: var(--color-text-primary);
}

.meditation-library {
  margin-bottom: 3rem;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.library-header h2 {
  color: var(--color-text-primary);
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-card-bg);
  color: var(--color-text-primary);
}

.meditation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.meditation-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  border: 2px solid transparent;
}

.meditation-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.meditation-card.active {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
}

.card-icon {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 1rem;
}

.card-content h4 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.card-description {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.card-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
}

.card-meta span {
  background: var(--color-bg-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: var(--color-text-secondary);
}

.card-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.benefit-tag {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.sleep-tips {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.sleep-tips h3 {
  color: var(--color-text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tip-card {
  background: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.tip-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.tip-card h4 {
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.tip-card p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.sleep-tracking {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.sleep-tracking h3 {
  color: var(--color-text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.tracking-content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(var(--color-primary) 0deg, var(--color-primary) calc(var(--score, 82) * 3.6deg), var(--color-border) calc(var(--score, 82) * 3.6deg));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-circle::before {
  content: '';
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: var(--color-card-bg);
}

.score-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--color-primary);
  z-index: 1;
}

.score-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  z-index: 1;
}

.sleep-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.metric-value {
  color: var(--color-primary);
  font-weight: bold;
}

.track-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all var(--transition-normal) ease;
}

.track-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .tracking-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1.5rem;
  }
  
  .sleep-metrics {
    max-width: 300px;
    margin: 0 auto;
  }
}
</style>