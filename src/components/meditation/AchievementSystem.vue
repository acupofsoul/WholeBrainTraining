<template>
  <div class="achievement-system">
    <!-- 成就通知弹窗 -->
    <transition name="achievement-popup">
      <div v-if="showAchievementPopup" class="achievement-popup-overlay" @click="closeAchievementPopup">
        <div class="achievement-popup" @click.stop>
          <div class="achievement-popup-header">
            <div class="achievement-popup-icon">🏆</div>
            <h3>恭喜解锁新成就！</h3>
          </div>
          <div class="achievement-popup-content">
            <div class="achievement-popup-badge">
              <div class="achievement-badge-icon">{{ newAchievement?.icon }}</div>
              <div class="achievement-badge-info">
                <h4>{{ newAchievement?.title }}</h4>
                <p>{{ newAchievement?.description }}</p>
                <div class="achievement-badge-reward" v-if="newAchievement?.reward">
                  <span class="reward-icon">💎</span>
                  <span>{{ newAchievement.reward }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="achievement-popup-actions">
            <button class="achievement-close-btn" @click="closeAchievementPopup">
              继续训练
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 成就展示区域 -->
    <div class="achievements-display" v-if="showAchievements">
      <div class="achievements-header">
        <h3>🏆 成就系统</h3>
        <div class="achievements-stats">
          <span class="unlocked-count">{{ unlockedAchievements.length }}/{{ totalAchievements }}</span>
          <span class="completion-rate">{{ completionRate }}% 完成</span>
        </div>
      </div>

      <!-- 成就分类 -->
      <div class="achievement-categories">
        <button 
          v-for="category in categories" 
          :key="category.id"
          class="category-btn"
          :class="{ active: selectedCategory === category.id }"
          @click="selectedCategory = category.id"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-name">{{ category.name }}</span>
          <span class="category-count">{{ getCategoryProgress(category.id) }}</span>
        </button>
      </div>

      <!-- 成就列表 -->
      <div class="achievements-grid">
        <div 
          v-for="achievement in filteredAchievements" 
          :key="achievement.id"
          class="achievement-card"
          :class="{ 
            unlocked: isUnlocked(achievement.id),
            locked: !isUnlocked(achievement.id),
            recent: isRecentlyUnlocked(achievement.id)
          }"
        >
          <div class="achievement-card-icon">
            {{ isUnlocked(achievement.id) ? achievement.icon : '🔒' }}
          </div>
          <div class="achievement-card-content">
            <h4 class="achievement-title">
              {{ isUnlocked(achievement.id) ? achievement.title : '???' }}
            </h4>
            <p class="achievement-description">
              {{ isUnlocked(achievement.id) ? achievement.description : achievement.hint }}
            </p>
            <div class="achievement-progress" v-if="achievement.progress !== undefined">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getProgressPercentage(achievement) + '%' }"
                ></div>
              </div>
              <span class="progress-text">
                {{ achievement.progress }}/{{ achievement.target }}
              </span>
            </div>
            <div class="achievement-meta" v-if="isUnlocked(achievement.id)">
              <span class="achievement-date">
                {{ formatUnlockDate(achievement.id) }}
              </span>
              <span class="achievement-reward" v-if="achievement.reward">
                💎 {{ achievement.reward }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import meditationStorage from '@/utils/meditationStorage'

// Props
const props = defineProps({
  showAchievements: {
    type: Boolean,
    default: true
  },
  sessionData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['achievement-unlocked'])

// 响应式数据
const showAchievementPopup = ref(false)
const newAchievement = ref(null)
const selectedCategory = ref('training')
const unlockedAchievements = ref([])

// 成就分类
const categories = [
  { id: 'training', name: '训练成就', icon: '🎯' },
  { id: 'streak', name: '坚持成就', icon: '🔥' },
  { id: 'time', name: '时长成就', icon: '⏰' },
  { id: 'special', name: '特殊成就', icon: '⭐' }
]

// 成就定义
const achievements = [
  // 训练成就
  {
    id: 'first_session',
    title: '初次体验',
    description: '完成第一次冥想练习',
    hint: '完成一次冥想训练',
    icon: '🌟',
    category: 'training',
    reward: '经验值 +10',
    checkCondition: (stats) => stats.totalSessions >= 1
  },
  {
    id: 'session_10',
    title: '入门修行者',
    description: '完成10次冥想练习',
    hint: '完成10次冥想训练',
    icon: '🧘',
    category: 'training',
    reward: '经验值 +50',
    progress: 0,
    target: 10,
    checkCondition: (stats) => stats.totalSessions >= 10
  },
  {
    id: 'session_50',
    title: '专注行者',
    description: '完成50次冥想练习',
    hint: '完成50次冥想训练',
    icon: '🎯',
    category: 'training',
    reward: '经验值 +200',
    progress: 0,
    target: 50,
    checkCondition: (stats) => stats.totalSessions >= 50
  },
  {
    id: 'session_100',
    title: '冥想大师',
    description: '完成100次冥想练习',
    hint: '完成100次冥想训练',
    icon: '🏆',
    category: 'training',
    reward: '经验值 +500',
    progress: 0,
    target: 100,
    checkCondition: (stats) => stats.totalSessions >= 100
  },

  // 坚持成就
  {
    id: 'streak_3',
    title: '坚持不懈',
    description: '连续训练3天',
    hint: '连续多天进行冥想训练',
    icon: '🔥',
    category: 'streak',
    reward: '经验值 +30',
    progress: 0,
    target: 3,
    checkCondition: (stats) => stats.currentStreak >= 3
  },
  {
    id: 'streak_7',
    title: '一周坚持',
    description: '连续训练7天',
    hint: '连续一周进行冥想训练',
    icon: '📅',
    category: 'streak',
    reward: '经验值 +100',
    progress: 0,
    target: 7,
    checkCondition: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'streak_30',
    title: '月度坚持',
    description: '连续训练30天',
    hint: '连续一个月进行冥想训练',
    icon: '🌙',
    category: 'streak',
    reward: '经验值 +500',
    progress: 0,
    target: 30,
    checkCondition: (stats) => stats.currentStreak >= 30
  },

  // 时长成就
  {
    id: 'time_1hour',
    title: '时间投入者',
    description: '累计训练1小时',
    hint: '累计训练时长达到一定程度',
    icon: '⏰',
    category: 'time',
    reward: '经验值 +50',
    progress: 0,
    target: 3600, // 秒
    checkCondition: (stats) => stats.totalDuration >= 3600
  },
  {
    id: 'time_10hours',
    title: '专注修行者',
    description: '累计训练10小时',
    hint: '累计训练时长达到更高程度',
    icon: '🕐',
    category: 'time',
    reward: '经验值 +200',
    progress: 0,
    target: 36000,
    checkCondition: (stats) => stats.totalDuration >= 36000
  },
  {
    id: 'time_50hours',
    title: '冥想专家',
    description: '累计训练50小时',
    hint: '累计训练时长达到专家级别',
    icon: '⏳',
    category: 'time',
    reward: '经验值 +1000',
    progress: 0,
    target: 180000,
    checkCondition: (stats) => stats.totalDuration >= 180000
  },

  // 特殊成就
  {
    id: 'long_session',
    title: '深度冥想',
    description: '单次训练超过30分钟',
    hint: '进行一次长时间的深度冥想',
    icon: '🌊',
    category: 'special',
    reward: '经验值 +100',
    checkCondition: (stats, sessionData) => sessionData?.duration >= 1800
  },
  {
    id: 'early_bird',
    title: '晨间修行者',
    description: '在早上6点前完成冥想',
    hint: '在清晨时分进行冥想练习',
    icon: '🌅',
    category: 'special',
    reward: '经验值 +50',
    checkCondition: (stats, sessionData) => {
      if (!sessionData?.startTime) return false
      const hour = new Date(sessionData.startTime).getHours()
      return hour < 6
    }
  },
  {
    id: 'night_owl',
    title: '夜间修行者',
    description: '在晚上10点后完成冥想',
    hint: '在夜深人静时进行冥想练习',
    icon: '🌙',
    category: 'special',
    reward: '经验值 +50',
    checkCondition: (stats, sessionData) => {
      if (!sessionData?.startTime) return false
      const hour = new Date(sessionData.startTime).getHours()
      return hour >= 22
    }
  },
  {
    id: 'perfect_focus',
    title: '完美专注',
    description: '单次训练中注意力保持在90%以上',
    hint: '在训练中保持极高的专注度',
    icon: '💎',
    category: 'special',
    reward: '经验值 +200',
    checkCondition: (stats, sessionData) => {
      if (!sessionData?.attentionHistory?.length) return false
      const avgAttention = sessionData.attentionHistory.reduce((sum, score) => sum + score, 0) / sessionData.attentionHistory.length
      return avgAttention >= 90
    }
  }
]

// 计算属性
const totalAchievements = computed(() => achievements.length)

const completionRate = computed(() => {
  if (totalAchievements.value === 0) return 0
  return Math.round((unlockedAchievements.value.length / totalAchievements.value) * 100)
})

const filteredAchievements = computed(() => {
  return achievements.filter(achievement => achievement.category === selectedCategory.value)
})

// 方法
const loadUnlockedAchievements = () => {
  unlockedAchievements.value = meditationStorage.getAchievements()
}

const isUnlocked = (achievementId) => {
  return unlockedAchievements.value.some(a => a.id === achievementId)
}

const isRecentlyUnlocked = (achievementId) => {
  const achievement = unlockedAchievements.value.find(a => a.id === achievementId)
  if (!achievement) return false
  const unlockTime = new Date(achievement.unlockedAt)
  const now = new Date()
  return (now - unlockTime) < 24 * 60 * 60 * 1000 // 24小时内
}

const getCategoryProgress = (categoryId) => {
  const categoryAchievements = achievements.filter(a => a.category === categoryId)
  const unlockedCount = categoryAchievements.filter(a => isUnlocked(a.id)).length
  return `${unlockedCount}/${categoryAchievements.length}`
}

const getProgressPercentage = (achievement) => {
  if (!achievement.progress || !achievement.target) return 0
  return Math.min((achievement.progress / achievement.target) * 100, 100)
}

const formatUnlockDate = (achievementId) => {
  const achievement = unlockedAchievements.value.find(a => a.id === achievementId)
  if (!achievement) return ''
  const date = new Date(achievement.unlockedAt)
  return date.toLocaleDateString('zh-CN')
}

const updateAchievementProgress = () => {
  const stats = meditationStorage.getProgress()
  
  achievements.forEach(achievement => {
    if (achievement.target && achievement.progress !== undefined) {
      if (achievement.category === 'training') {
        achievement.progress = Math.min(stats.totalSessions, achievement.target)
      } else if (achievement.category === 'streak') {
        achievement.progress = Math.min(stats.currentStreak, achievement.target)
      } else if (achievement.category === 'time') {
        achievement.progress = Math.min(stats.totalDuration, achievement.target)
      }
    }
  })
}

const checkAchievements = (sessionData = {}) => {
  const stats = meditationStorage.getProgress()
  const newlyUnlocked = []
  
  achievements.forEach(achievement => {
    if (!isUnlocked(achievement.id) && achievement.checkCondition(stats, sessionData)) {
      const unlocked = meditationStorage.unlockAchievement(achievement.id)
      if (unlocked) {
        newlyUnlocked.push(achievement)
      }
    }
  })
  
  if (newlyUnlocked.length > 0) {
    // 显示第一个新解锁的成就
    showAchievementNotification(newlyUnlocked[0])
    
    // 重新加载已解锁成就
    loadUnlockedAchievements()
    
    // 发出事件
    emit('achievement-unlocked', newlyUnlocked)
  }
}

const showAchievementNotification = (achievement) => {
  newAchievement.value = achievement
  showAchievementPopup.value = true
  
  // 3秒后自动关闭
  setTimeout(() => {
    if (showAchievementPopup.value) {
      closeAchievementPopup()
    }
  }, 3000)
}

const closeAchievementPopup = () => {
  showAchievementPopup.value = false
  newAchievement.value = null
}

// 监听会话数据变化
watch(() => props.sessionData, (newSessionData) => {
  if (newSessionData && Object.keys(newSessionData).length > 0) {
    checkAchievements(newSessionData)
  }
}, { deep: true })

// 生命周期
onMounted(() => {
  loadUnlockedAchievements()
  updateAchievementProgress()
  
  // 检查基础成就
  checkAchievements()
})

// 暴露方法给父组件
defineExpose({
  checkAchievements,
  updateAchievementProgress
})
</script>

<style scoped>
.achievement-system {
  position: relative;
}

/* 成就弹窗 */
.achievement-popup-overlay {
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
  backdrop-filter: blur(4px);
}

.achievement-popup {
  background: var(--color-card-bg);
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow-lg);
  border: 2px solid var(--color-primary);
  animation: achievement-bounce 0.6s ease-out;
}

@keyframes achievement-bounce {
  0% {
    transform: scale(0.3) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.achievement-popup-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.achievement-popup-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  animation: achievement-glow 2s ease-in-out infinite;
}

@keyframes achievement-glow {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.1);
    filter: brightness(1.2);
  }
}

.achievement-popup-header h3 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.5rem;
}

.achievement-popup-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.achievement-badge-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.achievement-badge-info h4 {
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.achievement-badge-info p {
  color: var(--color-text-secondary);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.achievement-badge-reward {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--color-success);
  font-weight: 600;
  font-size: 0.9rem;
}

.achievement-close-btn {
  width: 100%;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.achievement-close-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

/* 成就展示区域 */
.achievements-display {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.achievements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.achievements-header h3 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.5rem;
}

.achievements-stats {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.unlocked-count {
  background: var(--color-primary);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
}

.completion-rate {
  color: var(--color-text-secondary);
  font-weight: 600;
}

/* 成就分类 */
.achievement-categories {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-bg-secondary);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 0.9rem;
}

.category-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.1);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.category-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.category-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.category-btn.active .category-count {
  background: rgba(255, 255, 255, 0.3);
}

/* 成就网格 */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.achievement-card {
  background: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid transparent;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.achievement-card.unlocked {
  background: rgba(var(--color-success-rgb), 0.1);
  border-color: rgba(var(--color-success-rgb), 0.3);
}

.achievement-card.recent {
  animation: achievement-highlight 2s ease-in-out;
}

@keyframes achievement-highlight {
  0%, 100% {
    box-shadow: var(--shadow-sm);
  }
  50% {
    box-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.5);
  }
}

.achievement-card.locked {
  opacity: 0.6;
}

.achievement-card-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.achievement-title {
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  text-align: center;
}

.achievement-description {
  color: var(--color-text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.4;
  text-align: center;
  font-size: 0.9rem;
}

.achievement-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  background: rgba(var(--color-primary-rgb), 0.2);
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  background: var(--color-primary);
  height: 100%;
  border-radius: 3px;
  transition: width var(--transition-normal);
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: center;
  display: block;
}

.achievement-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.achievement-reward {
  color: var(--color-success);
  font-weight: 600;
}

/* 弹窗动画 */
.achievement-popup-enter-active {
  transition: all 0.6s ease-out;
}

.achievement-popup-leave-active {
  transition: all 0.3s ease-in;
}

.achievement-popup-enter-from {
  opacity: 0;
  transform: scale(0.3) rotate(-10deg);
}

.achievement-popup-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .achievements-display {
    padding: 1rem;
  }
  
  .achievements-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .achievement-categories {
    justify-content: center;
  }
  
  .category-btn {
    flex: 1;
    min-width: 0;
    justify-content: center;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .achievement-popup {
    margin: 1rem;
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .achievement-popup-badge {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .achievement-badge-icon {
    font-size: 2rem;
  }
}
</style>