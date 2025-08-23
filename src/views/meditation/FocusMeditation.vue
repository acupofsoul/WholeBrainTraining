<template>
  <div class="focus-meditation">
    <!-- 面包屑导航 -->
    <BreadcrumbDropdown
      :main-title="'冥想训练'"
      :main-path="'/meditation'"
      :sub-title="'引导冥想'"
       :sub-path="'/meditation/guided'"
      :current-title="'专注冥想'"
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
        <i class="icon-focus">🎯</i>
        专注冥想
      </h1>
      <p class="page-description">
        通过专注力训练，提升注意力集中度，增强心智的稳定性和清晰度
      </p>
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
      </div>
    </div>

    <!-- 专注训练工具 -->
    <div class="focus-tools">
      <h2>专注训练工具</h2>
      <div class="tools-grid">
        <div class="tool-card" @click="startBreathingExercise">
          <div class="tool-icon">💨</div>
          <h4>呼吸专注</h4>
          <p>跟随呼吸节奏，训练专注力</p>
          <button class="tool-btn">开始练习</button>
        </div>
        <div class="tool-card" @click="startVisualizationExercise">
          <div class="tool-icon">👁️</div>
          <h4>视觉专注</h4>
          <p>专注于特定的视觉对象</p>
          <button class="tool-btn">开始练习</button>
        </div>
        <div class="tool-card" @click="startSoundExercise">
          <div class="tool-icon">🔔</div>
          <h4>声音专注</h4>
          <p>专注于特定的声音或音频</p>
          <button class="tool-btn">开始练习</button>
        </div>
        <div class="tool-card" @click="startCountingExercise">
          <div class="tool-icon">🔢</div>
          <h4>数息专注</h4>
          <p>通过数息来训练专注力</p>
          <button class="tool-btn">开始练习</button>
        </div>
      </div>
    </div>

    <!-- 冥想音频库 -->
    <div class="meditation-library">
      <div class="library-header">
        <h2>专注冥想音频库</h2>
        <div class="filters">
          <select v-model="selectedDuration" class="filter-select">
            <option value="">所有时长</option>
            <option value="5">5分钟</option>
            <option value="10">10分钟</option>
            <option value="15">15分钟</option>
            <option value="20">20分钟</option>
            <option value="30">30分钟</option>
          </select>
          
          <select v-model="selectedLevel" class="filter-select">
            <option value="">所有级别</option>
            <option value="入门">入门级</option>
            <option value="进阶">进阶级</option>
            <option value="高级">高级</option>
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
              <span class="level">{{ meditation.level }}</span>
              <span class="completed">已完成 {{ meditation.completedCount }} 次</span>
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

    <!-- 专注力测试 -->
    <div class="focus-test">
      <h3>专注力测试</h3>
      <div class="test-content">
        <div class="test-description">
          <p>通过简单的专注力测试，了解你当前的专注水平，并获得个性化的训练建议。</p>
        </div>
        <div class="test-stats">
          <div class="stat-item">
            <span class="stat-label">当前专注度</span>
            <span class="stat-value">{{ focusLevel }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最佳记录</span>
            <span class="stat-value">{{ bestFocusLevel }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均专注时长</span>
            <span class="stat-value">{{ avgFocusTime }}分钟</span>
          </div>
        </div>
        <button class="test-btn" @click="startFocusTest">开始测试</button>
      </div>
    </div>

    <!-- 练习统计 -->
    <div class="practice-stats">
      <h3>专注练习统计</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ todayMinutes }}</div>
          <div class="stat-label">今日专注</div>
          <div class="stat-unit">分钟</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalSessions }}</div>
          <div class="stat-label">总会话数</div>
          <div class="stat-unit">次</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ focusImprovement }}</div>
          <div class="stat-label">专注提升</div>
          <div class="stat-unit">%</div>
        </div>
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
const volume = ref(70)
const currentMeditation = ref(null)
const selectedDuration = ref('')
const selectedLevel = ref('')

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

// 专注冥想音频数据
const focusMeditations = [
  {
    id: 'focus-1',
    title: '单点专注训练',
    description: '专注于单一对象，训练注意力的稳定性',
    duration: 10,
    level: '入门',
    icon: '🎯',
    audioUrl: '/audio/focus/single-point.mp3',
    completedCount: 20,
    lastPracticed: '2024-01-15',
    benefits: ['注意力', '专注力', '心智稳定'],
    instructor: '李老师',
    tags: ['单点', '基础', '稳定']
  },
  {
    id: 'focus-2',
    title: '呼吸计数冥想',
    description: '通过数息来训练专注力和觉察力',
    duration: 15,
    level: '入门',
    icon: '💨',
    audioUrl: '/audio/focus/breath-counting.mp3',
    completedCount: 16,
    lastPracticed: '2024-01-15',
    benefits: ['数息', '专注', '觉察'],
    instructor: '王老师',
    tags: ['呼吸', '计数', '觉察']
  },
  {
    id: 'focus-3',
    title: '声音专注冥想',
    description: '专注于特定的声音，提升听觉专注力',
    duration: 20,
    level: '进阶',
    icon: '🔔',
    audioUrl: '/audio/focus/sound-focus.mp3',
    completedCount: 12,
    lastPracticed: '2024-01-14',
    benefits: ['听觉专注', '感官训练', '注意力'],
    instructor: '张老师',
    tags: ['声音', '听觉', '感官']
  },
  {
    id: 'focus-4',
    title: '视觉专注训练',
    description: '通过视觉对象训练专注力和视觉稳定性',
    duration: 25,
    level: '进阶',
    icon: '👁️',
    audioUrl: '/audio/focus/visual-focus.mp3',
    completedCount: 8,
    lastPracticed: '2024-01-13',
    benefits: ['视觉专注', '眼部训练', '稳定性'],
    instructor: '陈老师',
    tags: ['视觉', '眼部', '稳定']
  },
  {
    id: 'focus-5',
    title: '开放监控冥想',
    description: '保持开放的觉察，不执着于任何特定对象',
    duration: 30,
    level: '高级',
    icon: '🌐',
    audioUrl: '/audio/focus/open-monitoring.mp3',
    completedCount: 5,
    lastPracticed: '2024-01-12',
    benefits: ['开放觉察', '不执着', '高级专注'],
    instructor: '刘老师',
    tags: ['开放', '监控', '觉察']
  },
  {
    id: 'focus-6',
    title: '集中专注强化',
    description: '高强度的专注力训练，适合有经验的练习者',
    duration: 5,
    level: '高级',
    icon: '⚡',
    audioUrl: '/audio/focus/intensive-focus.mp3',
    completedCount: 3,
    lastPracticed: '2024-01-11',
    benefits: ['强化训练', '高级技巧', '深度专注'],
    instructor: '赵老师',
    tags: ['强化', '高级', '深度']
  }
]

// 专注力测试数据
const focusLevel = ref(75)
const bestFocusLevel = ref(88)
const avgFocusTime = ref(18)

// 练习统计数据
const todayMinutes = ref(30)
const totalSessions = ref(65)
const focusImprovement = ref(42)

// 计算属性
const progressPercentage = computed(() => {
  if (totalTime.value === 0) return 0
  return (currentTime.value / totalTime.value) * 100
})

const filteredMeditations = computed(() => {
  return focusMeditations.filter(meditation => {
    const durationMatch = !selectedDuration.value || meditation.duration === parseInt(selectedDuration.value)
    const levelMatch = !selectedLevel.value || meditation.level === selectedLevel.value
    return durationMatch && levelMatch
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
  const currentIndex = focusMeditations.findIndex(m => m.id === currentMeditation.value?.id)
  if (currentIndex > 0) {
    selectMeditation(focusMeditations[currentIndex - 1])
  }
}

const nextTrack = () => {
  const currentIndex = focusMeditations.findIndex(m => m.id === currentMeditation.value?.id)
  if (currentIndex < focusMeditations.length - 1) {
    selectMeditation(focusMeditations[currentIndex + 1])
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

// 专注训练工具方法
const startBreathingExercise = () => {
  // 启动呼吸专注练习
  console.log('开始呼吸专注练习')
}

const startVisualizationExercise = () => {
  // 启动视觉专注练习
  console.log('开始视觉专注练习')
}

const startSoundExercise = () => {
  // 启动声音专注练习
  console.log('开始声音专注练习')
}

const startCountingExercise = () => {
  // 启动数息专注练习
  console.log('开始数息专注练习')
}

const startFocusTest = () => {
  // 启动专注力测试
  console.log('开始专注力测试')
}

// 生命周期
onMounted(() => {
  // 默认选择第一个冥想
  if (focusMeditations.length > 0) {
    selectMeditation(focusMeditations[0])
  }
})
</script>

<style scoped>
.focus-meditation {
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

.icon-focus {
  font-size: 3rem;
}

.page-description {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
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
}

.volume-slider {
  width: 100px;
}

.focus-tools {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.focus-tools h2 {
  color: var(--color-text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.tool-card {
  background: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.tool-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.tool-card h4 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.tool-card p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.tool-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
}

.tool-btn:hover {
  background: var(--color-primary-dark);
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

.focus-test {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.focus-test h3 {
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.test-content {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 2rem;
  align-items: center;
}

.test-description p {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.test-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.stat-value {
  color: var(--color-primary);
  font-weight: bold;
  font-size: 1.1rem;
}

.test-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all var(--transition-normal) ease;
}

.test-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.practice-stats {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.practice-stats h3 {
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  border-radius: 12px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.stat-unit {
  color: var(--color-text-tertiary);
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .test-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .test-stats {
    flex-direction: row;
    justify-content: space-around;
  }
}
</style>