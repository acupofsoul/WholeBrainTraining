<template>
  <div class="relaxation-meditation">
    <!-- 面包屑导航 -->
    <BreadcrumbDropdown
      :main-title="'冥想训练'"
      :main-path="'/meditation'"
      :sub-title="'引导冥想'"
      :sub-path="'/meditation/guided'"
      :current-title="'放松冥想'"
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
        <i class="icon-relaxation">🌸</i>
        放松冥想
      </h1>
      <p class="page-description">
        通过深度放松练习，释放身心压力，恢复内在平衡与宁静
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
        <h2>放松冥想音频库</h2>
        <div class="filters">
          <select v-model="selectedDuration" class="filter-select">
            <option value="">所有时长</option>
            <option value="10">10分钟</option>
            <option value="15">15分钟</option>
            <option value="20">20分钟</option>
            <option value="30">30分钟</option>
            <option value="45">45分钟</option>
          </select>
          
          <select v-model="selectedType" class="filter-select">
            <option value="">所有类型</option>
            <option value="肌肉放松">肌肉放松</option>
            <option value="呼吸放松">呼吸放松</option>
            <option value="想象放松">想象放松</option>
            <option value="音乐放松">音乐放松</option>
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
              <span class="type">{{ meditation.type }}</span>
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

    <!-- 放松技巧指南 -->
    <div class="relaxation-guide">
      <h3>放松技巧指南</h3>
      <div class="guide-grid">
        <div class="guide-card">
          <div class="guide-icon">💨</div>
          <h4>深呼吸技巧</h4>
          <p>通过控制呼吸节奏，激活副交感神经系统，快速进入放松状态</p>
        </div>
        <div class="guide-card">
          <div class="guide-icon">💪</div>
          <h4>渐进式肌肉放松</h4>
          <p>依次紧张和放松各个肌肉群，学会识别和释放身体紧张</p>
        </div>
        <div class="guide-card">
          <div class="guide-icon">🌅</div>
          <h4>想象放松</h4>
          <p>运用想象力创造宁静的心理画面，帮助身心进入深度放松</p>
        </div>
        <div class="guide-card">
          <div class="guide-icon">🎵</div>
          <h4>音乐疗法</h4>
          <p>利用特定频率的音乐和自然声音，促进大脑释放放松激素</p>
        </div>
      </div>
    </div>

    <!-- 练习统计 -->
    <div class="practice-stats">
      <h3>放松练习统计</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ todayMinutes }}</div>
          <div class="stat-label">今日放松</div>
          <div class="stat-unit">分钟</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalSessions }}</div>
          <div class="stat-label">总会话数</div>
          <div class="stat-unit">次</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stressReduction }}</div>
          <div class="stat-label">压力减少</div>
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
const selectedType = ref('')

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

// 放松冥想音频数据
const relaxationMeditations = [
  {
    id: 'relaxation-1',
    title: '全身肌肉放松',
    description: '系统性地放松全身各个肌肉群，释放身体紧张',
    duration: 20,
    type: '肌肉放松',
    icon: '💪',
    audioUrl: '/audio/relaxation/muscle-relaxation.mp3',
    completedCount: 12,
    lastPracticed: '2024-01-15',
    benefits: ['肌肉放松', '压力释放', '身体觉察'],
    instructor: '李老师',
    tags: ['肌肉', '紧张', '放松']
  },
  {
    id: 'relaxation-2',
    title: '深度呼吸放松',
    description: '通过特殊的呼吸技巧达到深度放松状态',
    duration: 15,
    type: '呼吸放松',
    icon: '💨',
    audioUrl: '/audio/relaxation/deep-breathing.mp3',
    completedCount: 18,
    lastPracticed: '2024-01-15',
    benefits: ['呼吸调节', '心率平稳', '焦虑缓解'],
    instructor: '王老师',
    tags: ['呼吸', '深度', '平静']
  },
  {
    id: 'relaxation-3',
    title: '海滩想象放松',
    description: '想象自己在宁静的海滩上，感受海浪的节奏',
    duration: 25,
    type: '想象放松',
    icon: '🏖️',
    audioUrl: '/audio/relaxation/beach-visualization.mp3',
    completedCount: 8,
    lastPracticed: '2024-01-14',
    benefits: ['想象力', '心理放松', '情绪平衡'],
    instructor: '张老师',
    tags: ['海滩', '想象', '自然']
  },
  {
    id: 'relaxation-4',
    title: '森林浴放松',
    description: '沉浸在森林的自然声音中，感受大自然的治愈力',
    duration: 30,
    type: '音乐放松',
    icon: '🌲',
    audioUrl: '/audio/relaxation/forest-bath.mp3',
    completedCount: 6,
    lastPracticed: '2024-01-13',
    benefits: ['自然疗愈', '心灵净化', '压力缓解'],
    instructor: '陈老师',
    tags: ['森林', '自然', '声音']
  },
  {
    id: 'relaxation-5',
    title: '温泉想象放松',
    description: '想象浸泡在温暖的温泉中，感受身心的完全放松',
    duration: 45,
    type: '想象放松',
    icon: '♨️',
    audioUrl: '/audio/relaxation/hot-spring.mp3',
    completedCount: 4,
    lastPracticed: '2024-01-12',
    benefits: ['深度放松', '身心恢复', '能量补充'],
    instructor: '刘老师',
    tags: ['温泉', '温暖', '恢复']
  },
  {
    id: 'relaxation-6',
    title: '雨声放松冥想',
    description: '聆听轻柔的雨声，让心灵回归宁静',
    duration: 10,
    type: '音乐放松',
    icon: '🌧️',
    audioUrl: '/audio/relaxation/rain-sounds.mp3',
    completedCount: 15,
    lastPracticed: '2024-01-15',
    benefits: ['心灵平静', '睡眠改善', '情绪稳定'],
    instructor: '赵老师',
    tags: ['雨声', '自然', '宁静']
  }
]

// 练习统计数据
const todayMinutes = ref(35)
const totalSessions = ref(58)
const stressReduction = ref(68)

// 计算属性
const progressPercentage = computed(() => {
  if (totalTime.value === 0) return 0
  return (currentTime.value / totalTime.value) * 100
})

const filteredMeditations = computed(() => {
  return relaxationMeditations.filter(meditation => {
    const durationMatch = !selectedDuration.value || meditation.duration === parseInt(selectedDuration.value)
    const typeMatch = !selectedType.value || meditation.type === selectedType.value
    return durationMatch && typeMatch
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
  const currentIndex = relaxationMeditations.findIndex(m => m.id === currentMeditation.value?.id)
  if (currentIndex > 0) {
    selectMeditation(relaxationMeditations[currentIndex - 1])
  }
}

const nextTrack = () => {
  const currentIndex = relaxationMeditations.findIndex(m => m.id === currentMeditation.value?.id)
  if (currentIndex < relaxationMeditations.length - 1) {
    selectMeditation(relaxationMeditations[currentIndex + 1])
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
  if (relaxationMeditations.length > 0) {
    selectMeditation(relaxationMeditations[0])
  }
})
</script>

<style scoped>
.relaxation-meditation {
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

.icon-relaxation {
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

.relaxation-guide {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.relaxation-guide h3 {
  color: var(--color-text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.guide-card {
  background: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all var(--transition-normal) ease;
}

.guide-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.guide-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.guide-card h4 {
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.guide-card p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
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