<template>
  <div class="healing-meditation">
    <!-- 面包屑导航 -->
    <BreadcrumbDropdown
      :main-title="'冥想训练'"
      :main-path="'/meditation'"
      :sub-title="'引导冥想'"
      :sub-path="'/meditation/guided'"
      :current-title="'疗愈冥想'"
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
        <i class="icon-healing">💚</i>
        疗愈冥想
      </h1>
      <p class="page-description">
        通过专门的疗愈冥想练习，释放内在创伤，促进身心康复，重建内在平衡
      </p>
    </div>

    <!-- 疗愈类型选择 -->
    <div class="healing-types">
      <h2>疗愈类型</h2>
      <div class="types-grid">
        <div class="type-card" :class="{ active: selectedType === 'emotional' }" @click="selectType('emotional')">
          <div class="type-icon">💙</div>
          <h4>情感疗愈</h4>
          <p>处理情感创伤，释放负面情绪</p>
        </div>
        <div class="type-card" :class="{ active: selectedType === 'physical' }" @click="selectType('physical')">
          <div class="type-icon">🌿</div>
          <h4>身体疗愈</h4>
          <p>缓解身体疼痛，促进自然康复</p>
        </div>
        <div class="type-card" :class="{ active: selectedType === 'chakra' }" @click="selectType('chakra')">
          <div class="type-icon">🌈</div>
          <h4>脉轮疗愈</h4>
          <p>平衡七大脉轮，恢复能量流动</p>
        </div>
        <div class="type-card" :class="{ active: selectedType === 'trauma' }" @click="selectType('trauma')">
          <div class="type-icon">🕊️</div>
          <h4>创伤疗愈</h4>
          <p>温和处理心理创伤，重建安全感</p>
        </div>
        <div class="type-card" :class="{ active: selectedType === 'relationship' }" @click="selectType('relationship')">
          <div class="type-icon">💕</div>
          <h4>关系疗愈</h4>
          <p>修复人际关系，增进爱与连接</p>
        </div>
        <div class="type-card" :class="{ active: selectedType === 'inner-child' }" @click="selectType('inner-child')">
          <div class="type-icon">🧸</div>
          <h4>内在小孩</h4>
          <p>疗愈童年创伤，重建自我价值</p>
        </div>
      </div>
    </div>

    <!-- 冥想播放器 -->
    <div class="meditation-player" v-if="currentMeditation">
      <div class="player-header">
        <h3>{{ currentMeditation.title }}</h3>
        <p>{{ currentMeditation.description }}</p>
        <div class="healing-focus">
          <span class="focus-tag">疗愈重点: {{ currentMeditation.healingFocus }}</span>
        </div>
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
        
        <div class="healing-settings">
          <label>疗愈强度:</label>
          <select v-model="healingIntensity" class="intensity-select">
            <option value="gentle">温和</option>
            <option value="moderate">适中</option>
            <option value="deep">深度</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 疗愈音频库 -->
    <div class="meditation-library">
      <div class="library-header">
        <h2>疗愈音频库</h2>
        <div class="filters">
          <select v-model="selectedDuration" class="filter-select">
            <option value="">所有时长</option>
            <option value="10">10分钟</option>
            <option value="20">20分钟</option>
            <option value="30">30分钟</option>
            <option value="45">45分钟</option>
            <option value="60">60分钟</option>
          </select>
          
          <select v-model="selectedLevel" class="filter-select">
            <option value="">所有级别</option>
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
              <span class="level">{{ meditation.level }}</span>
              <span class="type">{{ meditation.healingType }}</span>
            </div>
            <div class="healing-benefits">
              <span v-for="benefit in meditation.benefits" :key="benefit" class="benefit-tag">
                {{ benefit }}
              </span>
            </div>
            <div class="healing-focus-display">
              <strong>疗愈重点:</strong> {{ meditation.healingFocus }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 疗愈指导 -->
    <div class="healing-guidance">
      <h3>疗愈指导</h3>
      <div class="guidance-content">
        <div class="guidance-steps">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>创造安全空间</h4>
              <p>找一个安静舒适的地方，确保不会被打扰，让自己感到完全安全</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>设定疗愈意图</h4>
              <p>明确你希望疗愈的方面，带着爱与接纳的态度面对自己</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>深度放松</h4>
              <p>通过深呼吸和身体扫描，让身心完全放松下来</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>温柔面对</h4>
              <p>以慈悲的心态面对痛苦，允许情感自然流动</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">5</div>
            <div class="step-content">
              <h4>整合与感恩</h4>
              <p>感谢自己的勇气，将疗愈的能量整合到日常生活中</p>
            </div>
          </div>
        </div>
        
        <div class="guidance-tips">
          <h4>疗愈小贴士</h4>
          <ul>
            <li>疗愈是一个渐进的过程，要有耐心</li>
            <li>如果情绪过于强烈，可以暂停并寻求专业帮助</li>
            <li>定期练习比偶尔的长时间练习更有效</li>
            <li>记录疗愈过程中的感受和变化</li>
            <li>结合其他疗愈方式如艺术、运动等</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 疗愈进度追踪 -->
    <div class="healing-progress">
      <h3>疗愈进度</h3>
      <div class="progress-content">
        <div class="progress-chart">
          <div class="chart-item">
            <div class="chart-label">情感平衡</div>
            <div class="chart-bar">
              <div class="chart-fill" :style="{ width: emotionalBalance + '%' }"></div>
            </div>
            <span class="chart-value">{{ emotionalBalance }}%</span>
          </div>
          <div class="chart-item">
            <div class="chart-label">身体舒适</div>
            <div class="chart-bar">
              <div class="chart-fill" :style="{ width: physicalComfort + '%' }"></div>
            </div>
            <span class="chart-value">{{ physicalComfort }}%</span>
          </div>
          <div class="chart-item">
            <div class="chart-label">内在平静</div>
            <div class="chart-bar">
              <div class="chart-fill" :style="{ width: innerPeace + '%' }"></div>
            </div>
            <span class="chart-value">{{ innerPeace }}%</span>
          </div>
          <div class="chart-item">
            <div class="chart-label">自我接纳</div>
            <div class="chart-bar">
              <div class="chart-fill" :style="{ width: selfAcceptance + '%' }"></div>
            </div>
            <span class="chart-value">{{ selfAcceptance }}%</span>
          </div>
        </div>
        
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-value">{{ totalSessions }}</span>
            <span class="stat-label">总疗愈次数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalMinutes }}</span>
            <span class="stat-label">总疗愈时长(分钟)</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ streakDays }}</span>
            <span class="stat-label">连续天数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ healingScore }}</span>
            <span class="stat-label">疗愈指数</span>
          </div>
        </div>
        
        <button class="journal-btn" @click="openHealingJournal">疗愈日记</button>
      </div>
    </div>

    <!-- 疗愈日记弹窗 -->
    <div v-if="showJournal" class="journal-modal" @click="closeJournal">
      <div class="journal-content" @click.stop>
        <div class="journal-header">
          <h3>疗愈日记</h3>
          <button class="close-btn" @click="closeJournal">×</button>
        </div>
        <div class="journal-body">
          <div class="journal-entry">
            <label>今日感受:</label>
            <textarea v-model="todayFeeling" placeholder="记录你今天的感受和体验..."></textarea>
          </div>
          <div class="journal-entry">
            <label>疗愈收获:</label>
            <textarea v-model="healingGains" placeholder="分享你在疗愈过程中的收获..."></textarea>
          </div>
          <div class="journal-entry">
            <label>感恩事项:</label>
            <textarea v-model="gratitude" placeholder="写下你今天感恩的事情..."></textarea>
          </div>
          <div class="journal-actions">
            <button class="save-btn" @click="saveJournal">保存</button>
            <button class="cancel-btn" @click="closeJournal">取消</button>
          </div>
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
const volume = ref(50)
const currentMeditation = ref(null)
const selectedDuration = ref('')
const selectedLevel = ref('')
const selectedType = ref('emotional')
const healingIntensity = ref('moderate')
const showJournal = ref(false)
const todayFeeling = ref('')
const healingGains = ref('')
const gratitude = ref('')

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

// 疗愈冥想音频数据
const healingMeditations = [
  {
    id: 'healing-1',
    title: '内在小孩疗愈',
    description: '温柔地连接和疗愈你的内在小孩，重建自我价值和安全感',
    duration: 30,
    level: '中级',
    healingType: '内在小孩',
    healingFocus: '童年创伤、自我价值、安全感',
    icon: '🧸',
    audioUrl: '/audio/healing/inner-child.mp3',
    benefits: ['疗愈童年创伤', '重建自我价值', '增强安全感', '释放恐惧'],
    instructor: '李心理师',
    tags: ['内在小孩', '童年', '安全感']
  },
  {
    id: 'healing-2',
    title: '情感释放冥想',
    description: '安全地释放压抑的情感，让情绪能量自然流动',
    duration: 25,
    level: '初级',
    healingType: '情感疗愈',
    healingFocus: '情感释放、情绪平衡、内在清理',
    icon: '💙',
    audioUrl: '/audio/healing/emotional-release.mp3',
    benefits: ['释放负面情绪', '情感平衡', '内在清理', '心灵净化'],
    instructor: '王老师',
    tags: ['情感', '释放', '平衡']
  },
  {
    id: 'healing-3',
    title: '身体疼痛缓解',
    description: '通过意识和呼吸缓解身体疼痛，促进自然康复',
    duration: 20,
    level: '初级',
    healingType: '身体疗愈',
    healingFocus: '疼痛缓解、身体康复、能量流动',
    icon: '🌿',
    audioUrl: '/audio/healing/pain-relief.mp3',
    benefits: ['缓解疼痛', '促进康复', '放松肌肉', '改善循环'],
    instructor: '张医师',
    tags: ['疼痛', '康复', '身体']
  },
  {
    id: 'healing-4',
    title: '七脉轮平衡',
    description: '平衡和激活七大脉轮，恢复身心能量的和谐流动',
    duration: 45,
    level: '高级',
    healingType: '脉轮疗愈',
    healingFocus: '脉轮平衡、能量流动、整体和谐',
    icon: '🌈',
    audioUrl: '/audio/healing/chakra-balance.mp3',
    benefits: ['平衡脉轮', '能量流动', '整体和谐', '灵性成长'],
    instructor: '陈大师',
    tags: ['脉轮', '能量', '平衡']
  },
  {
    id: 'healing-5',
    title: '创伤后成长',
    description: '温和地处理创伤记忆，将痛苦转化为成长的力量',
    duration: 40,
    level: '高级',
    healingType: '创伤疗愈',
    healingFocus: '创伤处理、后创伤成长、内在力量',
    icon: '🕊️',
    audioUrl: '/audio/healing/trauma-growth.mp3',
    benefits: ['处理创伤', '后创伤成长', '内在力量', '心理韧性'],
    instructor: '刘心理师',
    tags: ['创伤', '成长', '韧性']
  },
  {
    id: 'healing-6',
    title: '关系疗愈冥想',
    description: '疗愈人际关系中的伤痛，重建爱与信任的能力',
    duration: 35,
    level: '中级',
    healingType: '关系疗愈',
    healingFocus: '关系修复、爱的能力、信任重建',
    icon: '💕',
    audioUrl: '/audio/healing/relationship-healing.mp3',
    benefits: ['修复关系', '增进爱心', '重建信任', '情感连接'],
    instructor: '赵老师',
    tags: ['关系', '爱', '信任']
  },
  {
    id: 'healing-7',
    title: '自我宽恕练习',
    description: '学会宽恕自己的过错，释放内疚和羞耻感',
    duration: 25,
    level: '中级',
    healingType: '情感疗愈',
    healingFocus: '自我宽恕、内疚释放、自我接纳',
    icon: '🤗',
    audioUrl: '/audio/healing/self-forgiveness.mp3',
    benefits: ['自我宽恕', '释放内疚', '自我接纳', '内在和平'],
    instructor: '孙老师',
    tags: ['宽恕', '接纳', '和平']
  },
  {
    id: 'healing-8',
    title: '能量清理净化',
    description: '清理负面能量，净化身心灵，恢复自然的光明状态',
    duration: 30,
    level: '中级',
    healingType: '能量疗愈',
    healingFocus: '能量清理、负面净化、光明恢复',
    icon: '✨',
    audioUrl: '/audio/healing/energy-cleansing.mp3',
    benefits: ['能量清理', '负面净化', '光明恢复', '振动提升'],
    instructor: '周大师',
    tags: ['能量', '净化', '光明']
  }
]

// 疗愈进度数据
const emotionalBalance = ref(75)
const physicalComfort = ref(68)
const innerPeace = ref(82)
const selfAcceptance = ref(71)
const totalSessions = ref(45)
const totalMinutes = ref(1350)
const streakDays = ref(12)
const healingScore = ref(74)

// 计算属性
const progressPercentage = computed(() => {
  if (totalTime.value === 0) return 0
  return (currentTime.value / totalTime.value) * 100
})

const filteredMeditations = computed(() => {
  return healingMeditations.filter(meditation => {
    const durationMatch = !selectedDuration.value || meditation.duration === parseInt(selectedDuration.value)
    const levelMatch = !selectedLevel.value || meditation.level === selectedLevel.value
    const typeMatch = !selectedType.value || meditation.healingType === selectedType.value
    return durationMatch && levelMatch && typeMatch
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
  const currentIndex = healingMeditations.findIndex(m => m.id === currentMeditation.value?.id)
  if (currentIndex > 0) {
    selectMeditation(healingMeditations[currentIndex - 1])
  }
}

const nextTrack = () => {
  const currentIndex = healingMeditations.findIndex(m => m.id === currentMeditation.value?.id)
  if (currentIndex < healingMeditations.length - 1) {
    selectMeditation(healingMeditations[currentIndex + 1])
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

const selectType = (type) => {
  selectedType.value = type
  // 根据类型筛选相应的冥想内容
  const typeMap = {
    emotional: '情感疗愈',
    physical: '身体疗愈',
    chakra: '脉轮疗愈',
    trauma: '创伤疗愈',
    relationship: '关系疗愈',
    'inner-child': '内在小孩'
  }
  
  const filtered = healingMeditations.filter(meditation => 
    meditation.healingType === typeMap[type]
  )
  
  if (filtered.length > 0) {
    selectMeditation(filtered[0])
  }
}

const openHealingJournal = () => {
  showJournal.value = true
}

const closeJournal = () => {
  showJournal.value = false
}

const saveJournal = () => {
  // 保存日记逻辑
  console.log('保存疗愈日记', {
    feeling: todayFeeling.value,
    gains: healingGains.value,
    gratitude: gratitude.value
  })
  closeJournal()
}

// 生命周期
onMounted(() => {
  // 默认选择第一个冥想
  if (healingMeditations.length > 0) {
    selectMeditation(healingMeditations[0])
  }
})
</script>

<style scoped>
.healing-meditation {
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

.icon-healing {
  font-size: 3rem;
}

.page-description {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.healing-types {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.healing-types h2 {
  color: var(--color-text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.type-card {
  background: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  border: 2px solid transparent;
}

.type-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.type-card.active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.1);
}

.type-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.type-card h4 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.type-card p {
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
  margin-bottom: 1rem;
}

.healing-focus {
  margin-top: 1rem;
}

.focus-tag {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
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

.healing-settings {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.healing-settings label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.intensity-select {
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

.healing-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.benefit-tag {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.healing-focus-display {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

.healing-guidance {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.healing-guidance h3 {
  color: var(--color-text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.guidance-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
}

.guidance-steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-number {
  background: var(--color-primary);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.step-content p {
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.guidance-tips {
  background: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
}

.guidance-tips h4 {
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.guidance-tips ul {
  list-style: none;
  padding: 0;
}

.guidance-tips li {
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.guidance-tips li::before {
  content: '•';
  color: var(--color-primary);
  position: absolute;
  left: 0;
}

.healing-progress {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.healing-progress h3 {
  color: var(--color-text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.progress-content {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 2rem;
  align-items: center;
}

.progress-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chart-label {
  width: 80px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.chart-bar {
  flex: 1;
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.chart-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.5s ease;
}

.chart-value {
  width: 40px;
  text-align: right;
  font-size: 0.8rem;
  color: var(--color-primary);
  font-weight: bold;
}

.progress-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.journal-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all var(--transition-normal) ease;
}

.journal-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.journal-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.journal-content {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.journal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.journal-header h3 {
  color: var(--color-text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.journal-entry {
  margin-bottom: 1.5rem;
}

.journal-entry label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
  font-weight: bold;
}

.journal-entry textarea {
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  resize: vertical;
}

.journal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.save-btn, .cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
}

.save-btn {
  background: var(--color-primary);
  color: white;
}

.cancel-btn {
  background: var(--color-border);
  color: var(--color-text-secondary);
}

.save-btn:hover {
  background: var(--color-primary-dark);
}

.cancel-btn:hover {
  background: var(--color-text-secondary);
  color: white;
}

@media (max-width: 768px) {
  .guidance-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .progress-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1.5rem;
  }
  
  .progress-stats {
    flex-direction: row;
    justify-content: space-around;
  }
}
</style>