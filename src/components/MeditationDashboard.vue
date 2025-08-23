<template>
  <div class="meditation-dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h2>🧘 欢迎回来！</h2>
        <p class="welcome-message">{{ welcomeMessage }}</p>
        <div class="quick-stats">
          <div class="quick-stat">
            <span class="stat-number">{{ todayMinutes }}</span>
            <span class="stat-label">今日训练</span>
          </div>
          <div class="quick-stat">
            <span class="stat-number">{{ currentStreak }}</span>
            <span class="stat-label">连续天数</span>
          </div>
          <div class="quick-stat">
            <span class="stat-number">{{ totalSessions }}</span>
            <span class="stat-label">总会话数</span>
          </div>
        </div>
      </div>
      <div class="welcome-illustration">
        <div class="meditation-avatar">
          <div class="avatar-circle">
            <span class="avatar-emoji">🧘‍♀️</span>
          </div>
          <div class="breathing-aura"></div>
        </div>
      </div>
    </div>

    <!-- 今日目标 -->
    <div class="daily-goal-section">
      <div class="goal-header">
        <h3>🎯 今日目标</h3>
        <button class="edit-goal-btn" @click="showGoalEditor = true">
          ✏️ 编辑
        </button>
      </div>
      <div class="goal-progress">
        <div class="progress-circle">
          <svg class="progress-svg" width="120" height="120">
            <circle
              class="progress-background"
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#e0e0e0"
              stroke-width="8"
            />
            <circle
              class="progress-bar"
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#4CAF50"
              stroke-width="8"
              :stroke-dasharray="progressCircumference"
              :stroke-dashoffset="progressOffset"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div class="progress-text">
            <span class="progress-percentage">{{ goalProgress }}%</span>
            <span class="progress-label">完成</span>
          </div>
        </div>
        <div class="goal-details">
          <div class="goal-item">
            <span class="goal-label">目标时长</span>
            <span class="goal-value">{{ dailyGoal.duration }}分钟</span>
          </div>
          <div class="goal-item">
            <span class="goal-label">已完成</span>
            <span class="goal-value">{{ todayMinutes }}分钟</span>
          </div>
          <div class="goal-item">
            <span class="goal-label">剩余</span>
            <span class="goal-value">{{ Math.max(0, dailyGoal.duration - todayMinutes) }}分钟</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐训练 -->
    <div class="recommendations-section">
      <h3>💡 为你推荐</h3>
      <div class="recommendations-grid">
        <div 
          v-for="recommendation in recommendations" 
          :key="recommendation.id"
          class="recommendation-card"
          @click="startRecommendation(recommendation)"
        >
          <div class="rec-icon">{{ recommendation.icon }}</div>
          <div class="rec-content">
            <h4>{{ recommendation.title }}</h4>
            <p>{{ recommendation.description }}</p>
            <div class="rec-meta">
              <span class="rec-duration">{{ recommendation.duration }}分钟</span>
              <span class="rec-difficulty">{{ recommendation.difficulty }}</span>
            </div>
          </div>
          <div class="rec-action">
            <button class="start-btn">开始</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activity-section">
      <div class="activity-header">
        <h3>📈 最近活动</h3>
        <router-link to="/meditation/history" class="view-all-link">
          查看全部 →
        </router-link>
      </div>
      <SessionHistory :max-items="3" :show-pagination="false" />
    </div>

    <!-- 成就展示 -->
    <div class="achievements-section">
      <h3>🏆 最新成就</h3>
      <div class="achievements-grid">
        <div 
          v-for="achievement in recentAchievements" 
          :key="achievement.id"
          class="achievement-card"
          :class="{ 'unlocked': achievement.unlocked }"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-info">
            <h4>{{ achievement.title }}</h4>
            <p>{{ achievement.description }}</p>
            <div class="achievement-progress" v-if="!achievement.unlocked">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${achievement.progress}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ achievement.progress }}%</span>
            </div>
            <div class="unlock-date" v-else>
              {{ formatDate(achievement.unlockedAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 目标编辑器模态框 -->
    <div class="modal-overlay" v-if="showGoalEditor" @click="closeGoalEditor">
      <div class="goal-editor-modal" @click.stop>
        <div class="modal-header">
          <h3>设置每日目标</h3>
          <button class="close-btn" @click="closeGoalEditor">×</button>
        </div>
        <div class="modal-content">
          <div class="goal-input-group">
            <label>每日训练时长（分钟）</label>
            <input 
              type="number" 
              v-model="editingGoal.duration" 
              min="5" 
              max="120" 
              step="5"
            >
          </div>
          <div class="goal-input-group">
            <label>训练类型偏好</label>
            <select v-model="editingGoal.preferredType">
              <option value="any">任意类型</option>
              <option value="breathing">呼吸训练</option>
              <option value="meditation">冥想训练</option>
              <option value="mindfulness">正念训练</option>
            </select>
          </div>
          <div class="goal-input-group">
            <label>提醒时间</label>
            <input type="time" v-model="editingGoal.reminderTime">
          </div>
          <div class="modal-actions">
            <button class="cancel-btn" @click="closeGoalEditor">取消</button>
            <button class="save-btn" @click="saveGoal">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SessionHistory from './SessionHistory.vue'
import meditationStorage from '@/utils/meditationStorage'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态管理
const showGoalEditor = ref(false)
const dailyGoal = ref({ duration: 20, preferredType: 'any', reminderTime: '09:00' })
const editingGoal = ref({ ...dailyGoal.value })
const sessions = ref([])
const achievements = ref([])

// 计算属性
const welcomeMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好！开始新的一天冥想练习吧'
  if (hour < 18) return '下午好！来一次放松的冥想时光'
  return '晚上好！让冥想帮你放松身心'
})

const todayMinutes = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return sessions.value
    .filter(session => {
      const sessionDate = new Date(session.startTime)
      return sessionDate >= today && sessionDate < tomorrow
    })
    .reduce((total, session) => total + Math.floor((session.duration || 0) / 60), 0)
})

const totalSessions = computed(() => sessions.value.length)

const currentStreak = computed(() => {
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

const goalProgress = computed(() => {
  return Math.min(100, Math.round((todayMinutes.value / dailyGoal.value.duration) * 100))
})

const progressCircumference = computed(() => {
  return 2 * Math.PI * 50 // radius = 50
})

const progressOffset = computed(() => {
  const progress = goalProgress.value / 100
  return progressCircumference.value * (1 - progress)
})

const recommendations = computed(() => {
  const baseRecommendations = [
    {
      id: 'breathing-basic',
      title: '基础呼吸训练',
      description: '适合初学者的简单呼吸练习',
      icon: '🫁',
      duration: 5,
      difficulty: '简单',
      route: '/meditation/breathing/basic'
    },
    {
      id: 'meditation-focus',
      title: '专注力冥想',
      description: '提升注意力和专注能力',
      icon: '🎯',
      duration: 10,
      difficulty: '中等',
      route: '/meditation/guided/focus'
    },
    {
      id: 'mindfulness-present',
      title: '正念当下',
      description: '感受当下，放松身心',
      icon: '🌸',
      duration: 8,
      difficulty: '简单',
      route: '/meditation/mindfulness/present'
    }
  ]
  
  // 根据用户历史和偏好调整推荐
  return baseRecommendations.slice(0, 3)
})

const recentAchievements = computed(() => {
  return achievements.value
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, 3)
})

// 方法
const loadData = () => {
  sessions.value = meditationStorage.getSessionHistory()
  const preferences = meditationStorage.getPreferences()
  dailyGoal.value = { ...dailyGoal.value, ...preferences.dailyGoal }
  achievements.value = meditationStorage.getAchievements()
}

const startRecommendation = (recommendation) => {
  router.push(recommendation.route)
}

const closeGoalEditor = () => {
  showGoalEditor.value = false
  editingGoal.value = { ...dailyGoal.value }
}

const saveGoal = () => {
  dailyGoal.value = { ...editingGoal.value }
  const preferences = meditationStorage.getPreferences()
  preferences.dailyGoal = dailyGoal.value
  meditationStorage.savePreferences(preferences)
  showGoalEditor.value = false
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.meditation-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  gap: 2rem;
}

.welcome-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  color: white;
  align-items: center;
}

.welcome-content h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.welcome-message {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.quick-stats {
  display: flex;
  gap: 2rem;
}

.quick-stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.welcome-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
}

.meditation-avatar {
  position: relative;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.breathing-aura {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: breathe 4s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.daily-goal-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.goal-header h3 {
  margin: 0;
  color: #333;
}

.edit-goal-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-goal-btn:hover {
  background: #f0f0f0;
}

.goal-progress {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  align-items: center;
}

.progress-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-svg {
  transform: rotate(-90deg);
}

.progress-bar {
  transition: stroke-dashoffset 0.5s ease;
}

.progress-text {
  position: absolute;
  text-align: center;
}

.progress-percentage {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #4CAF50;
}

.progress-label {
  font-size: 0.9rem;
  color: #666;
}

.goal-details {
  display: grid;
  gap: 1rem;
}

.goal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.goal-label {
  color: #666;
  font-weight: 500;
}

.goal-value {
  color: #333;
  font-weight: 600;
}

.recommendations-section,
.recent-activity-section,
.achievements-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.recommendations-section h3,
.recent-activity-section h3,
.achievements-section h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.recommendation-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  align-items: center;
}

.recommendation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.rec-icon {
  font-size: 2.5rem;
}

.rec-content h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.rec-content p {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.rec-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #888;
}

.start-btn {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.view-all-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.view-all-link:hover {
  color: #764ba2;
}

.achievements-grid {
  display: grid;
  gap: 1rem;
}

.achievement-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 12px;
  align-items: center;
  transition: all 0.3s ease;
}

.achievement-card.unlocked {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
  border-color: #FFD700;
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.achievement-info p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.achievement-progress .progress-bar {
  flex: 1;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
}

.achievement-progress .progress-text {
  font-size: 0.8rem;
  color: #666;
}

.unlock-date {
  font-size: 0.8rem;
  opacity: 0.8;
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

.goal-editor-modal {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
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

.goal-input-group {
  margin-bottom: 1.5rem;
}

.goal-input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.goal-input-group input,
.goal-input-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn,
.save-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.save-btn {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .meditation-dashboard {
    padding: 1rem;
    gap: 1.5rem;
  }
  
  .welcome-section {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .quick-stats {
    justify-content: center;
  }
  
  .goal-progress {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendation-card {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
</style>