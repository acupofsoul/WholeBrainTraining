<template>
  <div class="mindfulness-meditation">
    <!-- 面包屑导航 -->
    <BreadcrumbDropdown
      :main-title="'冥想训练'"
      :main-path="'/meditation'"
      :sub-title="'引导冥想'"
      :sub-path="'/meditation/guided'"
      :current-title="'正念冥想'"
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
        <i class="icon-mindfulness">🧘‍♀️</i>
        正念冥想
      </h1>
      <p class="page-description">
        通过正念练习，培养专注当下的能力，减少焦虑和压力，提升内心平静
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

    <!-- 冥想音频库 -->
    <div class="meditation-library">
      <div class="library-header">
        <h2>正念冥想音频库</h2>
        <div class="filters">
          <select v-model="selectedDuration" class="filter-select">
            <option value="">所有时长</option>
            <option value="5">5分钟</option>
            <option value="10">10分钟</option>
            <option value="15">15分钟</option>
            <option value="20">20分钟</option>
            <option value="30">30分钟</option>
          </select>
          
          <select v-model="selectedDifficulty" class="filter-select">
            <option value="">所有难度</option>
            <option value="初级">初级</option>
            <option value="中级">中级</option>
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
              <span class="difficulty">{{ meditation.difficulty }}</span>
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

    <!-- 练习统计 -->
    <div class="practice-stats">
      <h3>练习统计</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ todayMinutes }}</div>
          <div class="stat-label">今日练习</div>
          <div class="stat-unit">分钟</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalSessions }}</div>
          <div class="stat-label">总会话数</div>
          <div class="stat-unit">次</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ streakDays }}</div>
          <div class="stat-label">连续天数</div>
          <div class="stat-unit">天</div>
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
const selectedDifficulty = ref('')

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

// 正念冥想音频数据
const mindfulnessMeditations = [
  {
    id: 'mindfulness-1',
    title: '基础正念呼吸',
    description: '专注于呼吸的基础正念练习，适合初学者',
    duration: 10,
    difficulty: '初级',
    icon: '🌬️',
    audioUrl: '/audio/mindfulness/basic-breathing.mp3',
    completedCount: 15,
    lastPracticed: '2024-01-15',
    benefits: ['减压', '专注力', '情绪调节'],
    instructor: '李老师',
    tags: ['呼吸', '基础', '入门']
  },
  {
    id: 'mindfulness-2',
    title: '身体扫描冥想',
    description: '系统性地觉察身体各部位的感受',
    duration: 20,
    difficulty: '中级',
    icon: '🧘‍♀️',
    audioUrl: '/audio/mindfulness/body-scan.mp3',
    completedCount: 8,
    lastPracticed: '2024-01-14',
    benefits: ['身心连接', '放松', '自我觉察'],
    instructor: '王老师',
    tags: ['身体', '扫描', '觉察']
  },
  {
    id: 'mindfulness-3',
    title: '行走冥想',
    description: '在缓慢行走中保持正念觉察',
    duration: 15,
    difficulty: '中级',
    icon: '🚶‍♀️',
    audioUrl: '/audio/mindfulness/walking-meditation.mp3',
    completedCount: 5,
    lastPracticed: '2024-01-13',
    benefits: ['动态正念', '平衡', '专注'],
    instructor: '张老师',
    tags: ['行走', '动态', '户外']
  },
  {
    id: 'mindfulness-4',
    title: '慈心冥想',
    description: '培养对自己和他人的慈悲心',
    duration: 25,
    difficulty: '高级',
    icon: '💝',
    audioUrl: '/audio/mindfulness/loving-kindness.mp3',
    completedCount: 3,
    lastPracticed: '2024-01-12',
    benefits: ['慈悲心', '人际关系', '内心平静'],
    instructor: '陈老师',
    tags: ['慈心', '慈悲', '爱心']
  },
  {
    id: 'mindfulness-5',
    title: '观察思维冥想',
    description: '学会观察思维而不被思维控制',
    duration: 30,
    difficulty: '高级',
    icon: '🧠',
    audioUrl: '/audio/mindfulness/thought-observation.mp3',
    completedCount: 2,
    lastPracticed: '2024-01-11',
    benefits: ['思维清晰', '情绪稳定', '自我认知'],
    instructor: '刘老师',
    tags: ['思维', '观察', '认知']
  },
  {
    id: 'mindfulness-6',
    title: '正念饮食',
    description: '在进食过程中保持正念觉察',
    duration: 5,
    difficulty: '初级',
    icon: '🍎',
    audioUrl: '/audio/mindfulness/mindful-eating.mp3',
    completedCount: 12,
    lastPracticed: '2024-01-15',
    benefits: ['饮食健康', '感官觉察', '当下体验'],
    instructor: '赵老师',
    tags: ['饮食', '感官', '体验']
  }
]

// 练习统计数据
const todayMinutes = ref(25)
const totalSessions = ref(43)
const streakDays = ref(7)

// 计算属性
const progressPercentage = computed(() => {
  if (totalTime.value === 0) return 0
  return (currentTime.value / totalTime.value) * 100
})

const filteredMeditations = computed(() => {
  return mindfulnessMeditations.filter(meditation => {
    const durationMatch = !selectedDuration.value || meditation.duration === parseInt(selectedDuration.value)
    const difficultyMatch = !selectedDifficulty.value || meditation.difficulty === selectedDifficulty.value
    return durationMatch && difficultyMatch
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
  const currentIndex = mindfulnessMeditations.findIndex(m => m.id === currentMeditation.value?.id)
  if (currentIndex > 0) {
    selectMeditation(mindfulnessMeditations[currentIndex - 1])
  }
}

const nextTrack = () => {
  const currentIndex = mindfulnessMeditations.findIndex(m => m.id === currentMeditation.value?.id)
  if (currentIndex < mindfulnessMeditations.length - 1) {
    selectMeditation(mindfulnessMeditations[currentIndex + 1])
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

// 生命周期
onMounted(() => {
  // 默认选择第一个冥想
  if (mindfulnessMeditations.length > 0) {
    selectMeditation(mindfulnessMeditations[0])
  }
})
</script>

<style scoped>
.mindfulness-meditation {
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

.icon-mindfulness {
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
</style>