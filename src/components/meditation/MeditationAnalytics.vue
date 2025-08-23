<template>
  <div class="meditation-analytics">
    <!-- 分析报告弹窗 -->
    <div v-if="showAnalytics" class="analytics-modal" @click.self="closeAnalytics">
      <div class="analytics-content">
        <div class="analytics-header">
          <h2>冥想训练分析报告</h2>
          <button class="close-btn" @click="closeAnalytics">×</button>
        </div>
        
        <div class="analytics-body">
          <!-- 总体概览 -->
          <div class="overview-section">
            <h3>训练概览</h3>
            <div class="overview-grid">
              <div class="overview-card">
                <div class="card-icon">📊</div>
                <div class="card-content">
                  <span class="card-value">{{ totalSessions }}</span>
                  <span class="card-label">总训练次数</span>
                </div>
              </div>
              <div class="overview-card">
                <div class="card-icon">⏱️</div>
                <div class="card-content">
                  <span class="card-value">{{ formatDuration(totalDuration) }}</span>
                  <span class="card-label">总训练时长</span>
                </div>
              </div>
              <div class="overview-card">
                <div class="card-icon">🔥</div>
                <div class="card-content">
                  <span class="card-value">{{ currentStreak }}</span>
                  <span class="card-label">连续天数</span>
                </div>
              </div>
              <div class="overview-card">
                <div class="card-icon">📈</div>
                <div class="card-content">
                  <span class="card-value">{{ averageScore }}%</span>
                  <span class="card-label">平均评分</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 训练趋势 -->
          <div class="trend-section">
            <h3>训练趋势</h3>
            <div class="trend-chart">
              <div class="chart-container">
                <canvas ref="trendChart" width="400" height="200"></canvas>
              </div>
              <div class="trend-insights">
                <div class="insight-item" v-for="insight in trendInsights" :key="insight.type">
                  <div class="insight-icon" :class="insight.type">{{ insight.icon }}</div>
                  <div class="insight-content">
                    <h4>{{ insight.title }}</h4>
                    <p>{{ insight.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 模块分析 -->
          <div class="modules-section">
            <h3>模块表现</h3>
            <div class="modules-grid">
              <div class="module-card" v-for="module in moduleAnalysis" :key="module.name">
                <div class="module-header">
                  <span class="module-icon">{{ module.icon }}</span>
                  <span class="module-name">{{ module.name }}</span>
                </div>
                <div class="module-stats">
                  <div class="stat-row">
                    <span class="stat-label">训练次数</span>
                    <span class="stat-value">{{ module.sessions }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">总时长</span>
                    <span class="stat-value">{{ formatDuration(module.duration) }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">平均评分</span>
                    <span class="stat-value">{{ module.averageScore }}%</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">进步幅度</span>
                    <span class="stat-value" :class="{ positive: module.improvement > 0, negative: module.improvement < 0 }">
                      {{ module.improvement > 0 ? '+' : '' }}{{ module.improvement }}%
                    </span>
                  </div>
                </div>
                <div class="module-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: module.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ module.progress }}% 完成</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 个性化建议 -->
          <div class="recommendations-section">
            <h3>个性化建议</h3>
            <div class="recommendations-list">
              <div class="recommendation-item" v-for="rec in personalizedRecommendations" :key="rec.id">
                <div class="rec-priority" :class="rec.priority">{{ rec.priority === 'high' ? '重要' : rec.priority === 'medium' ? '建议' : '可选' }}</div>
                <div class="rec-content">
                  <h4>{{ rec.title }}</h4>
                  <p>{{ rec.description }}</p>
                  <div class="rec-actions">
                    <button class="rec-btn primary" @click="applyRecommendation(rec)">立即尝试</button>
                    <button class="rec-btn secondary" @click="dismissRecommendation(rec)">稍后提醒</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 目标设定 -->
          <div class="goals-section">
            <h3>训练目标</h3>
            <div class="goals-grid">
              <div class="goal-card">
                <h4>每日目标</h4>
                <div class="goal-input">
                  <input type="number" v-model="dailyGoal" min="5" max="120" step="5">
                  <span class="goal-unit">分钟</span>
                </div>
                <div class="goal-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: dailyProgress + '%' }"></div>
                  </div>
                  <span class="progress-text">今日完成 {{ todayMinutes }}/{{ dailyGoal }} 分钟</span>
                </div>
              </div>
              
              <div class="goal-card">
                <h4>每周目标</h4>
                <div class="goal-input">
                  <input type="number" v-model="weeklyGoal" min="30" max="840" step="30">
                  <span class="goal-unit">分钟</span>
                </div>
                <div class="goal-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: weeklyProgress + '%' }"></div>
                  </div>
                  <span class="progress-text">本周完成 {{ weeklyMinutes }}/{{ weeklyGoal }} 分钟</span>
                </div>
              </div>
            </div>
            <button class="save-goals-btn" @click="saveGoals">保存目标</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快速统计卡片 -->
    <div class="quick-stats" v-if="!showAnalytics">
      <div class="stats-header">
        <h3>训练统计</h3>
        <button class="view-analytics-btn" @click="openAnalytics">查看详细分析</button>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-icon">📅</span>
          <div class="stat-content">
            <span class="stat-value">{{ todayMinutes }}</span>
            <span class="stat-label">今日训练（分钟）</span>
          </div>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🎯</span>
          <div class="stat-content">
            <span class="stat-value">{{ Math.round(dailyProgress) }}%</span>
            <span class="stat-label">目标完成度</span>
          </div>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🔥</span>
          <div class="stat-content">
            <span class="stat-value">{{ currentStreak }}</span>
            <span class="stat-label">连续天数</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import meditationStorage from '@/utils/meditationStorage'

// Props
const props = defineProps({
  showAnalytics: {
    type: Boolean,
    default: false
  },
  sessionData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['close', 'recommendation-applied'])

// 响应式数据
const trendChart = ref(null)
const dailyGoal = ref(20)
const weeklyGoal = ref(150)
const todayMinutes = ref(0)
const weeklyMinutes = ref(0)

// 统计数据
const totalSessions = ref(0)
const totalDuration = ref(0)
const currentStreak = ref(0)
const averageScore = ref(0)

// 模块分析数据
const moduleAnalysis = ref([
  {
    name: '呼吸训练',
    icon: '🫁',
    sessions: 0,
    duration: 0,
    averageScore: 0,
    improvement: 0,
    progress: 0
  },
  {
    name: '正念冥想',
    icon: '🧘‍♀️',
    sessions: 0,
    duration: 0,
    averageScore: 0,
    improvement: 0,
    progress: 0
  },
  {
    name: '想象训练',
    icon: '🌟',
    sessions: 0,
    duration: 0,
    averageScore: 0,
    improvement: 0,
    progress: 0
  },
  {
    name: '脑波生成',
    icon: '🧠',
    sessions: 0,
    duration: 0,
    averageScore: 0,
    improvement: 0,
    progress: 0
  }
])

// 趋势洞察
const trendInsights = ref([
  {
    type: 'positive',
    icon: '📈',
    title: '训练频率提升',
    description: '相比上周，您的训练频率提升了25%，保持这个节奏！'
  },
  {
    type: 'neutral',
    icon: '⏰',
    title: '最佳训练时间',
    description: '数据显示您在晚上8-9点的训练效果最佳'
  },
  {
    type: 'suggestion',
    icon: '💡',
    title: '建议尝试新模块',
    description: '您在呼吸训练方面表现优秀，建议尝试进阶的正念冥想'
  }
])

// 个性化建议
const personalizedRecommendations = ref([
  {
    id: 'breathing-advanced',
    priority: 'high',
    title: '尝试进阶呼吸训练',
    description: '基于您的训练数据，建议尝试4-7-8呼吸法来进一步提升放松效果',
    action: 'breathing-478'
  },
  {
    id: 'consistency-improvement',
    priority: 'medium',
    title: '提升训练一致性',
    description: '设置每日提醒，建议在固定时间进行训练以建立习惯',
    action: 'set-reminder'
  },
  {
    id: 'mindfulness-intro',
    priority: 'low',
    title: '探索正念冥想',
    description: '您在专注力方面有很好的基础，正念冥想可以进一步提升觉察能力',
    action: 'mindfulness-basic'
  }
])

// 计算属性
const dailyProgress = computed(() => {
  return dailyGoal.value > 0 ? (todayMinutes.value / dailyGoal.value) * 100 : 0
})

const weeklyProgress = computed(() => {
  return weeklyGoal.value > 0 ? (weeklyMinutes.value / weeklyGoal.value) * 100 : 0
})

// 方法
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

const loadAnalyticsData = () => {
  try {
    // 加载用户进度数据
    const progress = meditationStorage.getProgress()
    const statistics = meditationStorage.getStatistics()
    const sessions = meditationStorage.getSessionHistory()
    
    // 更新基础统计
    totalSessions.value = progress.totalSessions || 0
    totalDuration.value = progress.totalDuration || 0
    currentStreak.value = progress.currentStreak || 0
    
    // 计算平均评分
    if (sessions.length > 0) {
      const totalScore = sessions.reduce((sum, session) => sum + (session.rating || 0), 0)
      averageScore.value = Math.round(totalScore / sessions.length)
    }
    
    // 更新模块分析数据
    updateModuleAnalysis(progress)
    
    // 计算今日和本周训练时长
    calculateTimeStats(sessions)
    
    // 生成个性化建议
    generatePersonalizedRecommendations(progress, statistics, sessions)
    
  } catch (error) {
    console.error('加载分析数据失败:', error)
  }
}

const updateModuleAnalysis = (progress) => {
  const modules = ['breathing', 'mindfulness', 'visualization', 'brainwave']
  const moduleNames = ['呼吸训练', '正念冥想', '想象训练', '脑波生成']
  const moduleIcons = ['🫁', '🧘‍♀️', '🌟', '🧠']
  
  modules.forEach((module, index) => {
    const moduleData = progress[module] || {}
    moduleAnalysis.value[index] = {
      name: moduleNames[index],
      icon: moduleIcons[index],
      sessions: moduleData.sessions || 0,
      duration: moduleData.duration || 0,
      averageScore: Math.round(Math.random() * 20 + 70), // 模拟评分
      improvement: Math.round((Math.random() - 0.5) * 20), // 模拟进步幅度
      progress: Math.min((moduleData.sessions || 0) * 10, 100) // 基于训练次数计算进度
    }
  })
}

const calculateTimeStats = (sessions) => {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  
  todayMinutes.value = 0
  weeklyMinutes.value = 0
  
  sessions.forEach(session => {
    const sessionDate = new Date(session.date)
    const sessionMinutes = Math.round((session.duration || 0) / 60)
    
    // 今日训练时长
    if (sessionDate.toDateString() === today.toDateString()) {
      todayMinutes.value += sessionMinutes
    }
    
    // 本周训练时长
    if (sessionDate >= startOfWeek) {
      weeklyMinutes.value += sessionMinutes
    }
  })
}

const generatePersonalizedRecommendations = (progress, statistics, sessions) => {
  const recommendations = []
  
  // 基于训练频率的建议
  if (currentStreak.value < 3) {
    recommendations.push({
      id: 'consistency-improvement',
      priority: 'high',
      title: '建立训练习惯',
      description: '连续训练可以显著提升效果，建议设置每日提醒',
      action: 'set-reminder'
    })
  }
  
  // 基于模块表现的建议
  const breathingProgress = progress.breathing || {}
  if (breathingProgress.sessions > 5 && breathingProgress.sessions < 15) {
    recommendations.push({
      id: 'breathing-advanced',
      priority: 'medium',
      title: '尝试进阶呼吸训练',
      description: '您在基础呼吸训练方面表现良好，可以尝试更高级的技巧',
      action: 'breathing-advanced'
    })
  }
  
  // 基于训练时长的建议
  if (todayMinutes.value < dailyGoal.value * 0.5) {
    recommendations.push({
      id: 'increase-duration',
      priority: 'medium',
      title: '增加训练时长',
      description: '适当延长训练时间可以获得更好的效果',
      action: 'extend-session'
    })
  }
  
  personalizedRecommendations.value = recommendations.slice(0, 3)
}

const drawTrendChart = () => {
  if (!trendChart.value) return
  
  const canvas = trendChart.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  
  // 清空画布
  ctx.clearRect(0, 0, width, height)
  
  // 模拟7天的训练数据
  const data = [15, 20, 18, 25, 22, 30, 28]
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  
  // 绘制网格
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  
  for (let i = 0; i <= 4; i++) {
    const y = (height - 40) * i / 4 + 20
    ctx.beginPath()
    ctx.moveTo(40, y)
    ctx.lineTo(width - 20, y)
    ctx.stroke()
  }
  
  // 绘制数据线
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = 3
  ctx.beginPath()
  
  data.forEach((value, index) => {
    const x = 40 + (width - 60) * index / (data.length - 1)
    const y = height - 40 - (value / 35) * (height - 60)
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // 绘制数据点
  ctx.fillStyle = '#10b981'
  data.forEach((value, index) => {
    const x = 40 + (width - 60) * index / (data.length - 1)
    const y = height - 40 - (value / 35) * (height - 60)
    
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2 * Math.PI)
    ctx.fill()
  })
  
  // 绘制标签
  ctx.fillStyle = '#6b7280'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  
  labels.forEach((label, index) => {
    const x = 40 + (width - 60) * index / (labels.length - 1)
    ctx.fillText(label, x, height - 10)
  })
}

const openAnalytics = () => {
  loadAnalyticsData()
  emit('open')
  
  nextTick(() => {
    drawTrendChart()
  })
}

const closeAnalytics = () => {
  emit('close')
}

const applyRecommendation = (recommendation) => {
  emit('recommendation-applied', recommendation)
  // 这里可以添加具体的推荐应用逻辑
}

const dismissRecommendation = (recommendation) => {
  const index = personalizedRecommendations.value.findIndex(r => r.id === recommendation.id)
  if (index > -1) {
    personalizedRecommendations.value.splice(index, 1)
  }
}

const saveGoals = () => {
  try {
    const preferences = meditationStorage.getPreferences()
    preferences.dailyGoal = dailyGoal.value
    preferences.weeklyGoal = weeklyGoal.value
    meditationStorage.savePreferences(preferences)
    
    // 显示保存成功提示
    alert('目标设置已保存！')
  } catch (error) {
    console.error('保存目标失败:', error)
    alert('保存失败，请重试')
  }
}

// 监听props变化
watch(() => props.showAnalytics, (newValue) => {
  if (newValue) {
    openAnalytics()
  }
})

// 组件挂载时加载数据
onMounted(() => {
  loadAnalyticsData()
  
  // 加载用户目标设置
  const preferences = meditationStorage.getPreferences()
  dailyGoal.value = preferences.dailyGoal || 20
  weeklyGoal.value = preferences.weeklyGoal || 150
})
</script>

<style scoped>
.meditation-analytics {
  position: relative;
}

/* 分析报告弹窗 */
.analytics-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.analytics-content {
  background: var(--color-card-bg);
  border-radius: 20px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.analytics-header h2 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.8rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.close-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text);
}

.analytics-body {
  padding: 2rem;
}

/* 概览部分 */
.overview-section {
  margin-bottom: 3rem;
}

.overview-section h3 {
  color: var(--color-text);
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.overview-card {
  background: var(--color-bg-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--color-border);
  transition: all var(--transition-normal);
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.card-content {
  flex: 1;
}

.card-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.card-label {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* 趋势部分 */
.trend-section {
  margin-bottom: 3rem;
}

.trend-section h3 {
  color: var(--color-text);
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

.trend-chart {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: start;
}

.chart-container {
  background: var(--color-bg-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
}

.trend-insights {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.insight-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insight-icon.positive {
  background: rgba(16, 185, 129, 0.1);
}

.insight-icon.neutral {
  background: rgba(59, 130, 246, 0.1);
}

.insight-icon.suggestion {
  background: rgba(245, 158, 11, 0.1);
}

.insight-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
  font-size: 1rem;
}

.insight-content p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

/* 模块分析 */
.modules-section {
  margin-bottom: 3rem;
}

.modules-section h3 {
  color: var(--color-text);
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.module-card {
  background: var(--color-bg-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  transition: all var(--transition-normal);
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.module-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.module-icon {
  font-size: 1.5rem;
}

.module-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 1.1rem;
}

.module-stats {
  margin-bottom: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.stat-value {
  color: var(--color-text);
  font-weight: 600;
}

.stat-value.positive {
  color: var(--color-success);
}

.stat-value.negative {
  color: var(--color-error);
}

.module-progress {
  margin-top: 1rem;
}

.progress-bar {
  background: var(--color-bg);
  border-radius: 10px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  height: 100%;
  border-radius: 10px;
  transition: width var(--transition-normal);
}

.progress-text {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

/* 个性化建议 */
.recommendations-section {
  margin-bottom: 3rem;
}

.recommendations-section h3 {
  color: var(--color-text);
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  transition: all var(--transition-normal);
}

.recommendation-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.rec-priority {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.rec-priority.high {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.rec-priority.medium {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.rec-priority.low {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-info);
}

.rec-content {
  flex: 1;
}

.rec-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
  font-size: 1.1rem;
}

.rec-content p {
  margin: 0 0 1rem 0;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.rec-actions {
  display: flex;
  gap: 0.75rem;
}

.rec-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.rec-btn.primary {
  background: var(--color-primary);
  color: white;
}

.rec-btn.primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.rec-btn.secondary {
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.rec-btn.secondary:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text);
}

/* 目标设定 */
.goals-section h3 {
  color: var(--color-text);
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.goal-card {
  background: var(--color-bg-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
}

.goal-card h4 {
  margin: 0 0 1rem 0;
  color: var(--color-text);
  font-size: 1.1rem;
}

.goal-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.goal-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 1rem;
}

.goal-input input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.goal-unit {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.save-goals-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.save-goals-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 快速统计卡片 */
.quick-stats {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.stats-header h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.2rem;
}

.view-analytics-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.view-analytics-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.stat-icon {
  font-size: 1.5rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .analytics-modal {
    padding: 1rem;
  }
  
  .analytics-content {
    max-height: 95vh;
  }
  
  .trend-chart {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .overview-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

@media (max-width: 768px) {
  .analytics-header {
    padding: 1.5rem 1.5rem 1rem;
  }
  
  .analytics-header h2 {
    font-size: 1.5rem;
  }
  
  .analytics-body {
    padding: 1.5rem;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .goals-grid {
    grid-template-columns: 1fr;
  }
  
  .rec-actions {
    flex-direction: column;
  }
  
  .rec-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .analytics-modal {
    padding: 0.5rem;
  }
  
  .analytics-content {
    border-radius: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .overview-card {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .card-icon {
    font-size: 2rem;
  }
}
</style>