<template>
  <div class="guided-meditation">
    <!-- 面包屑导航 -->
    <BreadcrumbDropdown
      :main-title="'冥想训练'"
      :main-path="'/meditation'"
      :current-title="'引导冥想'"
      :sibling-modules="[
        { title: '引导冥想', path: '/meditation/guided' },
        { title: '呼吸训练', path: '/meditation/breathing' },
        { title: '脑波生成器', path: '/meditation/brainwave-generator' },
        { title: '节拍器', path: '/meditation/metronome' },
        { title: '想象力训练', path: '/meditation/visualization' },
        { title: '正念训练', path: '/meditation/mindfulness' }
      ]"
    />

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="icon-guided">🎧</i>
        引导冥想
      </h1>
      <p class="page-description">
        通过专业的语音引导，帮助您进入深度冥想状态，体验不同类型的冥想练习
      </p>
    </div>

    <!-- 冥想类型网格 -->
    <div class="meditation-types">
      <h2>选择冥想类型</h2>
      <div class="types-grid">
        <router-link 
          v-for="type in meditationTypes" 
          :key="type.id"
          :to="type.path"
          class="type-card"
        >
          <div class="type-icon">{{ type.icon }}</div>
          <h3>{{ type.name }}</h3>
          <p>{{ type.description }}</p>
          <div class="type-meta">
            <span class="sessions">{{ type.sessions }}次练习</span>
            <span class="duration">{{ type.avgDuration }}分钟</span>
          </div>
          <div class="type-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: type.progress + '%' }"></div>
            </div>
            <span class="progress-text">{{ type.progress }}%</span>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 推荐练习 -->
    <div class="recommended-practice">
      <h2>今日推荐</h2>
      <div class="recommendation-card">
        <div class="recommendation-content">
          <div class="recommendation-icon">⭐</div>
          <div class="recommendation-info">
            <h3>{{ todayRecommendation.title }}</h3>
            <p>{{ todayRecommendation.description }}</p>
            <div class="recommendation-meta">
              <span class="duration">{{ todayRecommendation.duration }}分钟</span>
              <span class="difficulty">{{ todayRecommendation.difficulty }}</span>
            </div>
          </div>
        </div>
        <router-link :to="todayRecommendation.path" class="start-btn">
          开始练习
        </router-link>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <h2>练习统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ totalSessions }}</div>
          <div class="stat-label">总练习次数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalMinutes }}</div>
          <div class="stat-label">总练习时长</div>
          <div class="stat-unit">分钟</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ consecutiveDays }}</div>
          <div class="stat-label">连续练习</div>
          <div class="stat-unit">天</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ favoriteType }}</div>
          <div class="stat-label">最喜欢的类型</div>
        </div>
      </div>
    </div>

    <!-- 子页面内容 -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTrainingStore } from '@/stores'
import BreadcrumbDropdown from '@/components/BreadcrumbDropdown.vue'

// 获取训练数据存储
const trainingStore = useTrainingStore()

// 冥想类型数据
const meditationTypes = ref([
  {
    id: 'mindfulness',
    name: '正念冥想',
    description: '培养专注当下的能力，减少焦虑和压力',
    icon: '🧘‍♀️',
    path: '/meditation/guided/mindfulness',
    sessions: 15,
    avgDuration: 15,
    progress: 75
  },
  {
    id: 'relaxation',
    name: '放松冥想',
    description: '深度放松身心，释放压力和紧张',
    icon: '🌸',
    path: '/meditation/guided/relaxation',
    sessions: 12,
    avgDuration: 20,
    progress: 60
  },
  {
    id: 'focus',
    name: '专注冥想',
    description: '提升注意力集中度，增强心智稳定性',
    icon: '🎯',
    path: '/meditation/guided/focus',
    sessions: 8,
    avgDuration: 18,
    progress: 40
  },
  {
    id: 'sleep',
    name: '睡眠冥想',
    description: '改善睡眠质量，帮助快速入睡',
    icon: '🌙',
    path: '/meditation/guided/sleep',
    sessions: 20,
    avgDuration: 25,
    progress: 85
  },
  {
    id: 'healing',
    name: '疗愈冥想',
    description: '释放内在创伤，促进身心康复',
    icon: '💚',
    path: '/meditation/guided/healing',
    sessions: 6,
    avgDuration: 30,
    progress: 30
  },
  {
    id: 'creativity',
    name: '创造力冥想',
    description: '激发内在创意潜能，突破思维局限',
    icon: '🎨',
    path: '/meditation/guided/creativity',
    sessions: 4,
    avgDuration: 22,
    progress: 20
  }
])

// 今日推荐
const todayRecommendation = ref({
  title: '晨间正念冥想',
  description: '以正念呼吸开始美好的一天，提升专注力和内心平静',
  duration: 10,
  difficulty: '初级',
  path: '/meditation/guided/mindfulness'
})

// 统计数据
const totalSessions = computed(() => {
  return meditationTypes.value.reduce((sum, type) => sum + type.sessions, 0)
})

const totalMinutes = computed(() => {
  return meditationTypes.value.reduce((sum, type) => sum + (type.sessions * type.avgDuration), 0)
})

const consecutiveDays = ref(7)
const favoriteType = ref('正念冥想')

// 组件挂载时加载数据
onMounted(async () => {
  // 这里可以从 store 加载实际的统计数据
  // await trainingStore.loadMeditationData()
})
</script>

<style scoped>
.guided-meditation {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.icon-guided {
  font-size: 2.5rem;
}

.page-description {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.meditation-types {
  margin-bottom: 3rem;
}

.meditation-types h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.type-card {
  background: var(--color-bg-secondary);
  border-radius: 16px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.type-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--color-primary);
}

.type-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-align: center;
}

.type-card h3 {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.type-card p {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.type-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
}

.type-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  min-width: 35px;
}

.recommended-practice {
  margin-bottom: 3rem;
}

.recommended-practice h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.recommendation-card {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border-radius: 16px;
  padding: 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recommendation-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.recommendation-icon {
  font-size: 3rem;
}

.recommendation-info h3 {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}

.recommendation-info p {
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.recommendation-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.start-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.start-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.stats-overview h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  .guided-meditation {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .types-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendation-card {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>