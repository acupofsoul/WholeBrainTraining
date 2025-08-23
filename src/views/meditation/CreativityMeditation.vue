<template>
  <div class="creativity-meditation">
    <!-- 面包屑导航 -->
    <BreadcrumbDropdown
      :main-title="'冥想训练'"
      :main-path="'/meditation'"
      :sub-title="'引导冥想'"
       :sub-path="'/meditation/guided'"
      :current-title="'创造力冥想'"
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
        <i class="icon-creativity">🎨</i>
        创造力冥想
      </h1>
      <p class="page-description">
        通过专门的创造力冥想练习，激发内在创意潜能，突破思维局限，开启无限可能
      </p>
    </div>

    <!-- 创造力模式选择 -->
    <div class="creativity-modes">
      <h2>创造力模式</h2>
      <div class="modes-grid">
        <div class="mode-card" :class="{ active: selectedMode === 'inspiration' }" @click="selectMode('inspiration')">
          <div class="mode-icon">💡</div>
          <h4>灵感激发</h4>
          <p>打开直觉通道，接收创意灵感</p>
        </div>
        <div class="mode-card" :class="{ active: selectedMode === 'visualization' }" @click="selectMode('visualization')">
          <div class="mode-icon">👁️</div>
          <h4>创意可视化</h4>
          <p>通过想象力构建创意蓝图</p>
        </div>
        <div class="mode-card" :class="{ active: selectedMode === 'flow' }" @click="selectMode('flow')">
          <div class="mode-icon">🌊</div>
          <h4>心流状态</h4>
          <p>进入专注创作的心流体验</p>
        </div>
        <div class="mode-card" :class="{ active: selectedMode === 'breakthrough' }" @click="selectMode('breakthrough')">
          <div class="mode-icon">🚀</div>
          <h4>突破瓶颈</h4>
          <p>打破思维限制，突破创作瓶颈</p>
        </div>
        <div class="mode-card" :class="{ active: selectedMode === 'artistic' }" @click="selectMode('artistic')">
          <div class="mode-icon">🎭</div>
          <h4>艺术感知</h4>
          <p>提升美感和艺术敏感度</p>
        </div>
        <div class="mode-card" :class="{ active: selectedMode === 'innovation' }" @click="selectMode('innovation')">
          <div class="mode-icon">⚡</div>
          <h4>创新思维</h4>
          <p>培养跳出框架的创新能力</p>
        </div>
      </div>
    </div>

    <!-- 冥想播放器 -->
    <div class="meditation-player" v-if="currentMeditation">
      <div class="player-header">
        <h3>{{ currentMeditation.title }}</h3>
        <p>{{ currentMeditation.description }}</p>
        <div class="creativity-focus">
          <span class="focus-tag">创造力重点: {{ currentMeditation.creativityFocus }}</span>
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
        
        <div class="creativity-settings">
          <label>创意强度:</label>
          <select v-model="creativityIntensity" class="intensity-select">
            <option value="gentle">温和启发</option>
            <option value="moderate">适中激发</option>
            <option value="intense">强烈刺激</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 创造力音频库 -->
    <div class="meditation-library">
      <div class="library-header">
        <h2>创造力音频库</h2>
        <div class="filters">
          <select v-model="selectedDuration" class="filter-select">
            <option value="">所有时长</option>
            <option value="10">10分钟</option>
            <option value="20">20分钟</option>
            <option value="30">30分钟</option>
            <option value="45">45分钟</option>
            <option value="60">60分钟</option>
          </select>
          
          <select v-model="selectedCategory" class="filter-select">
            <option value="">所有分类</option>
            <option value="灵感激发">灵感激发</option>
            <option value="创意可视化">创意可视化</option>
            <option value="心流训练">心流训练</option>
            <option value="突破练习">突破练习</option>
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
              <span class="level">{{ meditation.level }}</span>
            </div>
            <div class="creativity-benefits">
              <span v-for="benefit in meditation.benefits" :key="benefit" class="benefit-tag">
                {{ benefit }}
              </span>
            </div>
            <div class="creativity-focus-display">
              <strong>创造力重点:</strong> {{ meditation.creativityFocus }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创造力练习工具 -->
    <div class="creativity-tools">
      <h3>创造力练习工具</h3>
      <div class="tools-grid">
        <div class="tool-card" @click="openRandomPrompt">
          <div class="tool-icon">🎲</div>
          <h4>随机创意提示</h4>
          <p>获取随机的创意启发词汇和概念</p>
        </div>
        <div class="tool-card" @click="openColorMeditation">
          <div class="tool-icon">🌈</div>
          <h4>色彩冥想</h4>
          <p>通过色彩感知激发创意灵感</p>
        </div>
        <div class="tool-card" @click="openSoundscape">
          <div class="tool-icon">🎵</div>
          <h4>创意音景</h4>
          <p>沉浸式音景环境激发创造力</p>
        </div>
        <div class="tool-card" @click="openMindMapping">
          <div class="tool-icon">🧠</div>
          <h4>思维导图</h4>
          <p>可视化思维连接和创意发散</p>
        </div>
      </div>
    </div>

    <!-- 创造力进度追踪 -->
    <div class="creativity-progress">
      <h3>创造力发展</h3>
      <div class="progress-content">
        <div class="progress-chart">
          <div class="chart-item">
            <div class="chart-label">想象力</div>
            <div class="chart-bar">
              <div class="chart-fill" :style="{ width: imagination + '%' }"></div>
            </div>
            <span class="chart-value">{{ imagination }}%</span>
          </div>
          <div class="chart-item">
            <div class="chart-label">原创性</div>
            <div class="chart-bar">
              <div class="chart-fill" :style="{ width: originality + '%' }"></div>
            </div>
            <span class="chart-value">{{ originality }}%</span>
          </div>
          <div class="chart-item">
            <div class="chart-label">灵活性</div>
            <div class="chart-bar">
              <div class="chart-fill" :style="{ width: flexibility + '%' }"></div>
            </div>
            <span class="chart-value">{{ flexibility }}%</span>
          </div>
          <div class="chart-item">
            <div class="chart-label">流畅性</div>
            <div class="chart-bar">
              <div class="chart-fill" :style="{ width: fluency + '%' }"></div>
            </div>
            <span class="chart-value">{{ fluency }}%</span>
          </div>
        </div>
        
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-value">{{ totalSessions }}</span>
            <span class="stat-label">创意会话</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalIdeas }}</span>
            <span class="stat-label">产生想法</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ streakDays }}</span>
            <span class="stat-label">连续天数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ creativityScore }}</span>
            <span class="stat-label">创造力指数</span>
          </div>
        </div>
        
        <button class="ideas-btn" @click="openIdeasJournal">创意日记</button>
      </div>
    </div>

    <!-- 随机创意提示弹窗 -->
    <div v-if="showRandomPrompt" class="prompt-modal" @click="closeRandomPrompt">
      <div class="prompt-content" @click.stop>
        <div class="prompt-header">
          <h3>随机创意提示</h3>
          <button class="close-btn" @click="closeRandomPrompt">×</button>
        </div>
        <div class="prompt-body">
          <div class="prompt-display">
            <div class="prompt-item">
              <label>主题词:</label>
              <span class="prompt-word">{{ randomPrompt.theme }}</span>
            </div>
            <div class="prompt-item">
              <label>情感:</label>
              <span class="prompt-word">{{ randomPrompt.emotion }}</span>
            </div>
            <div class="prompt-item">
              <label>元素:</label>
              <span class="prompt-word">{{ randomPrompt.element }}</span>
            </div>
            <div class="prompt-item">
              <label>风格:</label>
              <span class="prompt-word">{{ randomPrompt.style }}</span>
            </div>
          </div>
          <div class="prompt-actions">
            <button class="generate-btn" @click="generateNewPrompt">重新生成</button>
            <button class="save-prompt-btn" @click="savePrompt">保存提示</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创意日记弹窗 -->
    <div v-if="showIdeasJournal" class="journal-modal" @click="closeIdeasJournal">
      <div class="journal-content" @click.stop>
        <div class="journal-header">
          <h3>创意日记</h3>
          <button class="close-btn" @click="closeIdeasJournal">×</button>
        </div>
        <div class="journal-body">
          <div class="journal-entry">
            <label>今日创意:</label>
            <textarea v-model="todayIdeas" placeholder="记录你今天的创意想法..."></textarea>
          </div>
          <div class="journal-entry">
            <label>灵感来源:</label>
            <textarea v-model="inspirationSource" placeholder="分享你的灵感来源..."></textarea>
          </div>
          <div class="journal-entry">
            <label>创作计划:</label>
            <textarea v-model="creationPlan" placeholder="制定你的创作计划..."></textarea>
          </div>
          <div class="journal-actions">
            <button class="save-btn" @click="saveIdeasJournal">保存</button>
            <button class="cancel-btn" @click="closeIdeasJournal">取消</button>
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
const selectedCategory = ref('')
const selectedMode = ref('inspiration')
const creativityIntensity = ref('moderate')
const showRandomPrompt = ref(false)
const showIdeasJournal = ref(false)
const todayIdeas = ref('')
const inspirationSource = ref('')
const creationPlan = ref('')

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

// 创造力冥想音频数据
const creativityMeditations = [
  {
    id: 'creativity-1',
    title: '灵感之泉',
    description: '打开内在的灵感通道，让创意如泉水般涌现',
    duration: 20,
    category: '灵感激发',
    level: '初级',
    creativityFocus: '直觉开发、灵感接收、创意流动',
    icon: '💡',
    audioUrl: '/audio/creativity/inspiration-spring.mp3',
    benefits: ['激发灵感', '开发直觉', '创意流动', '突破瓶颈'],
    instructor: '李创意师',
    tags: ['灵感', '直觉', '流动']
  },
  {
    id: 'creativity-2',
    title: '创意可视化之旅',
    description: '通过引导想象，在心灵画布上描绘无限可能',
    duration: 30,
    category: '创意可视化',
    level: '中级',
    creativityFocus: '想象力训练、视觉化技巧、创意构建',
    icon: '👁️',
    audioUrl: '/audio/creativity/visualization-journey.mp3',
    benefits: ['想象力提升', '视觉化能力', '创意构建', '空间思维'],
    instructor: '王艺术家',
    tags: ['可视化', '想象', '构建']
  },
  {
    id: 'creativity-3',
    title: '心流创作状态',
    description: '进入专注而轻松的心流状态，让创作自然发生',
    duration: 25,
    category: '心流训练',
    level: '中级',
    creativityFocus: '专注力培养、心流体验、创作状态',
    icon: '🌊',
    audioUrl: '/audio/creativity/flow-state.mp3',
    benefits: ['心流体验', '专注创作', '状态调节', '效率提升'],
    instructor: '张心理师',
    tags: ['心流', '专注', '创作']
  },
  {
    id: 'creativity-4',
    title: '突破思维边界',
    description: '打破固有思维模式，探索无限创意可能',
    duration: 35,
    category: '突破练习',
    level: '高级',
    creativityFocus: '思维突破、创新思考、边界拓展',
    icon: '🚀',
    audioUrl: '/audio/creativity/breakthrough-boundaries.mp3',
    benefits: ['思维突破', '创新能力', '边界拓展', '原创思考'],
    instructor: '陈创新师',
    tags: ['突破', '创新', '边界']
  },
  {
    id: 'creativity-5',
    title: '艺术感知觉醒',
    description: '唤醒内在的艺术感知力，提升美感和创意敏感度',
    duration: 40,
    category: '艺术感知',
    level: '中级',
    creativityFocus: '美感培养、艺术感知、感官开发',
    icon: '🎭',
    audioUrl: '/audio/creativity/artistic-awakening.mp3',
    benefits: ['美感提升', '艺术感知', '感官开发', '审美能力'],
    instructor: '刘美学家',
    tags: ['艺术', '美感', '感知']
  },
  {
    id: 'creativity-6',
    title: '创新思维激活',
    description: '激活大脑的创新回路，培养跳出框架的思考能力',
    duration: 30,
    category: '创新思维',
    level: '高级',
    creativityFocus: '创新思维、跳跃思考、框架突破',
    icon: '⚡',
    audioUrl: '/audio/creativity/innovation-activation.mp3',
    benefits: ['创新思维', '跳跃思考', '框架突破', '原创能力'],
    instructor: '赵创新家',
    tags: ['创新', '思维', '突破']
  },
  {
    id: 'creativity-7',
    title: '色彩与创意',
    description: '通过色彩冥想激发视觉创意和情感表达',
    duration: 20,
    category: '艺术感知',
    level: '初级',
    creativityFocus: '色彩感知、视觉创意、情感表达',
    icon: '🌈',
    audioUrl: '/audio/creativity/color-creativity.mp3',
    benefits: ['色彩感知', '视觉创意', '情感表达', '艺术灵感'],
    instructor: '孙色彩师',
    tags: ['色彩', '视觉', '表达']
  },
  {
    id: 'creativity-8',
    title: '音乐与创造',
    description: '在音乐的引导下，让创意在节拍中自由舞蹈',
    duration: 45,
    category: '灵感激发',
    level: '中级',
    creativityFocus: '音乐感知、节奏创意、听觉创造',
    icon: '🎵',
    audioUrl: '/audio/creativity/music-creation.mp3',
    benefits: ['音乐感知', '节奏创意', '听觉创造', '韵律美感'],
    instructor: '周音乐家',
    tags: ['音乐', '节奏', '韵律']
  }
]

// 随机创意提示数据
const promptThemes = ['自然', '科技', '情感', '时间', '空间', '梦境', '记忆', '未来', '过去', '光影']
const promptEmotions = ['喜悦', '宁静', '神秘', '激情', '温暖', '清新', '深沉', '轻盈', '强烈', '柔和']
const promptElements = ['水', '火', '风', '土', '光', '影', '声音', '色彩', '线条', '形状']
const promptStyles = ['抽象', '写实', '超现实', '极简', '复杂', '古典', '现代', '未来', '复古', '原始']

const randomPrompt = ref({
  theme: '',
  emotion: '',
  element: '',
  style: ''
})

// 创造力进度数据
const imagination = ref(78)
const originality = ref(72)
const flexibility = ref(85)
const fluency = ref(69)
const totalSessions = ref(32)
const totalIdeas = ref(156)
const streakDays = ref(8)
const creativityScore = ref(76)

// 计算属性
const progressPercentage = computed(() => {
  if (totalTime.value === 0) return 0
  return (currentTime.value / totalTime.value) * 100
})

const filteredMeditations = computed(() => {
  return creativityMeditations.filter(meditation => {
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
  const currentIndex = creativityMeditations.findIndex(m => m.id === currentMeditation.value?.id)
  if (currentIndex > 0) {
    selectMeditation(creativityMeditations[currentIndex - 1])
  }
}

const nextTrack = () => {
  const currentIndex = creativityMeditations.findIndex(m => m.id === currentMeditation.value?.id)
  if (currentIndex < creativityMeditations.length - 1) {
    selectMeditation(creativityMeditations[currentIndex + 1])
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
  const modeMap = {
    inspiration: '灵感激发',
    visualization: '创意可视化',
    flow: '心流训练',
    breakthrough: '突破练习',
    artistic: '艺术感知',
    innovation: '创新思维'
  }
  
  const filtered = creativityMeditations.filter(meditation => 
    meditation.category === modeMap[mode]
  )
  
  if (filtered.length > 0) {
    selectMeditation(filtered[0])
  }
}

const openRandomPrompt = () => {
  generateNewPrompt()
  showRandomPrompt.value = true
}

const closeRandomPrompt = () => {
  showRandomPrompt.value = false
}

const generateNewPrompt = () => {
  randomPrompt.value = {
    theme: promptThemes[Math.floor(Math.random() * promptThemes.length)],
    emotion: promptEmotions[Math.floor(Math.random() * promptEmotions.length)],
    element: promptElements[Math.floor(Math.random() * promptElements.length)],
    style: promptStyles[Math.floor(Math.random() * promptStyles.length)]
  }
}

const savePrompt = () => {
  // 保存创意提示逻辑
  console.log('保存创意提示', randomPrompt.value)
  closeRandomPrompt()
}

const openColorMeditation = () => {
  console.log('打开色彩冥想')
}

const openSoundscape = () => {
  console.log('打开创意音景')
}

const openMindMapping = () => {
  console.log('打开思维导图')
}

const openIdeasJournal = () => {
  showIdeasJournal.value = true
}

const closeIdeasJournal = () => {
  showIdeasJournal.value = false
}

const saveIdeasJournal = () => {
  // 保存创意日记逻辑
  console.log('保存创意日记', {
    ideas: todayIdeas.value,
    source: inspirationSource.value,
    plan: creationPlan.value
  })
  closeIdeasJournal()
}

// 生命周期
onMounted(() => {
  // 默认选择第一个冥想
  if (creativityMeditations.length > 0) {
    selectMeditation(creativityMeditations[0])
  }
})
</script>

<style scoped>
.creativity-meditation {
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

.icon-creativity {
  font-size: 3rem;
}

.page-description {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.creativity-modes {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.creativity-modes h2 {
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
  margin-bottom: 1rem;
}

.creativity-focus {
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

.creativity-settings {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.creativity-settings label {
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

.creativity-benefits {
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

.creativity-focus-display {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

.creativity-tools {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.creativity-tools h3 {
  color: var(--color-text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  margin-bottom: 1rem;
}

.tool-card p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.creativity-progress {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.creativity-progress h3 {
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

.ideas-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all var(--transition-normal) ease;
}

.ideas-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.prompt-modal, .journal-modal {
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

.prompt-content, .journal-content {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.prompt-header, .journal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.prompt-header h3, .journal-header h3 {
  color: var(--color-text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.prompt-display {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.prompt-item {
  text-align: center;
}

.prompt-item label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.prompt-word {
  display: block;
  background: var(--color-primary);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
}

.prompt-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.generate-btn, .save-prompt-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
}

.generate-btn {
  background: var(--color-border);
  color: var(--color-text-primary);
}

.save-prompt-btn {
  background: var(--color-primary);
  color: white;
}

.generate-btn:hover {
  background: var(--color-text-secondary);
  color: white;
}

.save-prompt-btn:hover {
  background: var(--color-primary-dark);
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
  .progress-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1.5rem;
  }
  
  .progress-stats {
    flex-direction: row;
    justify-content: space-around;
  }
  
  .prompt-display {
    grid-template-columns: 1fr;
  }
}
</style>