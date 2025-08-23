<template>
  <div class="session-history">
    <div class="history-header">
      <h3>📊 训练历史</h3>
      <div class="filter-controls">
        <select v-model="selectedFilter" @change="filterSessions">
          <option value="all">全部</option>
          <option value="breathing">呼吸训练</option>
          <option value="meditation">冥想训练</option>
          <option value="mindfulness">正念训练</option>
        </select>
        <select v-model="sortOrder" @change="sortSessions">
          <option value="newest">最新优先</option>
          <option value="oldest">最早优先</option>
          <option value="longest">时长最长</option>
        </select>
      </div>
    </div>

    <div class="statistics-summary">
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <div class="stat-value">{{ totalSessions }}</div>
          <div class="stat-label">总会话数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-info">
          <div class="stat-value">{{ formatDuration(totalTime) }}</div>
          <div class="stat-label">总时长</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-info">
          <div class="stat-value">{{ currentStreak }}</div>
          <div class="stat-label">连续天数</div>
        </div>
      </div>
    </div>

    <div class="sessions-list" v-if="filteredSessions.length > 0">
      <div 
        v-for="session in paginatedSessions" 
        :key="session.id" 
        class="session-item"
        @click="viewSessionDetails(session)"
      >
        <div class="session-icon">
          {{ getSessionIcon(session.type) }}
        </div>
        <div class="session-info">
          <div class="session-title">{{ getSessionTitle(session.type) }}</div>
          <div class="session-meta">
            <span class="session-date">{{ formatDate(session.startTime) }}</span>
            <span class="session-duration">{{ formatDuration(session.duration) }}</span>
          </div>
          <div class="session-details" v-if="session.cycles">
            <span class="detail-item">{{ session.cycles }} 个周期</span>
            <span class="detail-item" v-if="session.pattern">
              {{ formatPattern(session.pattern) }}
            </span>
          </div>
        </div>
        <div class="session-status">
          <div class="status-badge" :class="session.status">
            {{ getStatusText(session.status) }}
          </div>
          <div class="session-score" v-if="session.score">
            {{ session.score }}%
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-icon">📝</div>
      <h4>暂无训练记录</h4>
      <p>开始你的第一次冥想训练吧！</p>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        ← 上一页
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        class="page-btn" 
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        下一页 →
      </button>
    </div>

    <!-- 会话详情模态框 -->
    <div class="modal-overlay" v-if="selectedSession" @click="closeModal">
      <div class="session-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ getSessionTitle(selectedSession.type) }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-content">
          <div class="session-detail-grid">
            <div class="detail-item">
              <label>开始时间</label>
              <span>{{ formatDateTime(selectedSession.startTime) }}</span>
            </div>
            <div class="detail-item">
              <label>结束时间</label>
              <span>{{ formatDateTime(selectedSession.endTime) }}</span>
            </div>
            <div class="detail-item">
              <label>训练时长</label>
              <span>{{ formatDuration(selectedSession.duration) }}</span>
            </div>
            <div class="detail-item" v-if="selectedSession.cycles">
              <label>完成周期</label>
              <span>{{ selectedSession.cycles }} 个</span>
            </div>
            <div class="detail-item" v-if="selectedSession.pattern">
              <label>呼吸模式</label>
              <span>{{ formatPattern(selectedSession.pattern) }}</span>
            </div>
            <div class="detail-item">
              <label>完成状态</label>
              <span class="status-badge" :class="selectedSession.status">
                {{ getStatusText(selectedSession.status) }}
              </span>
            </div>
          </div>
          <div class="session-notes" v-if="selectedSession.notes">
            <label>训练笔记</label>
            <p>{{ selectedSession.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import meditationStorage from '@/utils/meditationStorage'

const props = defineProps({
  maxItems: {
    type: Number,
    default: 10
  },
  showPagination: {
    type: Boolean,
    default: true
  }
})

// 状态管理
const sessions = ref([])
const selectedFilter = ref('all')
const sortOrder = ref('newest')
const currentPage = ref(1)
const itemsPerPage = ref(props.maxItems)
const selectedSession = ref(null)

// 计算属性
const filteredSessions = computed(() => {
  let filtered = sessions.value
  
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(session => session.type === selectedFilter.value)
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortOrder.value) {
      case 'newest':
        return new Date(b.startTime) - new Date(a.startTime)
      case 'oldest':
        return new Date(a.startTime) - new Date(b.startTime)
      case 'longest':
        return b.duration - a.duration
      default:
        return 0
    }
  })
  
  return filtered
})

const paginatedSessions = computed(() => {
  if (!props.showPagination) {
    return filteredSessions.value.slice(0, props.maxItems)
  }
  
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredSessions.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredSessions.value.length / itemsPerPage.value)
})

const totalSessions = computed(() => sessions.value.length)

const totalTime = computed(() => {
  return sessions.value.reduce((total, session) => total + (session.duration || 0), 0)
})

const currentStreak = computed(() => {
  // 计算连续训练天数
  const today = new Date()
  let streak = 0
  let currentDate = new Date(today)
  
  while (true) {
    const dayStart = new Date(currentDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(currentDate)
    dayEnd.setHours(23, 59, 59, 999)
    
    const hasSessionOnDay = sessions.value.some(session => {
      const sessionDate = new Date(session.startTime)
      return sessionDate >= dayStart && sessionDate <= dayEnd
    })
    
    if (hasSessionOnDay) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
})

// 方法
const loadSessions = () => {
  sessions.value = meditationStorage.getSessionHistory()
}

const filterSessions = () => {
  currentPage.value = 1
}

const sortSessions = () => {
  currentPage.value = 1
}

const viewSessionDetails = (session) => {
  selectedSession.value = session
}

const closeModal = () => {
  selectedSession.value = null
}

const getSessionIcon = (type) => {
  const icons = {
    breathing: '🫁',
    meditation: '🧘',
    mindfulness: '🌸',
    visualization: '🎨',
    brainwave: '🧠'
  }
  return icons[type] || '🎯'
}

const getSessionTitle = (type) => {
  const titles = {
    breathing: '呼吸训练',
    meditation: '冥想训练',
    mindfulness: '正念训练',
    visualization: '想象力训练',
    brainwave: '脑波训练'
  }
  return titles[type] || '训练会话'
}

const getStatusText = (status) => {
  const statusTexts = {
    completed: '已完成',
    interrupted: '中断',
    active: '进行中'
  }
  return statusTexts[status] || status
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${minutes}分钟`
  }
}

const formatPattern = (pattern) => {
  if (typeof pattern === 'object') {
    return `${pattern.inhale}-${pattern.hold || 0}-${pattern.exhale}-${pattern.pause || 0}`
  }
  return pattern
}

// 生命周期
onMounted(() => {
  loadSessions()
})
</script>

<style scoped>
.session-history {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.history-header h3 {
  color: #333;
  margin: 0;
  font-size: 1.5rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
}

.filter-controls select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
}

.statistics-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  text-align: left;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.sessions-list {
  max-height: 400px;
  overflow-y: auto;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 12px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.session-item:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.session-icon {
  font-size: 2rem;
  width: 60px;
  text-align: center;
}

.session-info {
  flex: 1;
}

.session-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.session-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.session-details {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #888;
}

.session-status {
  text-align: right;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.completed {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.interrupted {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge.active {
  background: #e3f2fd;
  color: #1976d2;
}

.session-score {
  font-weight: bold;
  color: #4caf50;
  margin-top: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.session-modal {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.session-detail-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item label {
  font-weight: 600;
  color: #555;
}

.session-notes {
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.session-notes label {
  font-weight: 600;
  color: #555;
  display: block;
  margin-bottom: 0.5rem;
}

.session-notes p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .session-history {
    padding: 1rem;
  }
  
  .history-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filter-controls {
    justify-content: center;
  }
  
  .statistics-summary {
    grid-template-columns: 1fr;
  }
  
  .session-item {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .session-meta {
    justify-content: center;
  }
  
  .session-details {
    justify-content: center;
  }
}
</style>