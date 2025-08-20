<template>
  <div class="meditation-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-nav" v-if="$route.path !== '/meditation'">
      <button @click="goBack" class="breadcrumb-item">
        <i class="icon-arrow-left"></i>
        冥想训练
      </button>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-current">{{ getModuleTitle($route.path) }}</span>
    </div>

    <!-- 页面头部 -->
    <div class="page-header" v-if="$route.path === '/meditation'">
      <div class="header-background">
        <div class="floating-elements">
          <div class="floating-circle circle-1"></div>
          <div class="floating-circle circle-2"></div>
          <div class="floating-circle circle-3"></div>
        </div>
      </div>
      <h1>冥想与放松训练</h1>
      <p class="page-description">
        通过冥想训练帮助孩子放松身心，提高专注力，为后续的全脑开发训练打下良好基础。
        这是七田真全脑开发的第一阶段，也是最重要的基础训练。
      </p>
      
      <!-- 快速开始按钮 -->
      <div class="quick-start-section">
        <button class="quick-start-btn" @click="startQuickSession">
          <span class="btn-icon">⚡</span>
          <span>快速开始 5分钟冥想</span>
        </button>
        <p class="quick-start-hint">基于您的偏好推荐最适合的冥想练习</p>
      </div>
    </div>

    <!-- 今日推荐 -->
    <div class="daily-recommendation" v-if="dailyRecommendation && $route.path === '/meditation'">
      <div class="recommendation-header">
        <h3>🌟 今日推荐</h3>
        <span class="recommendation-badge">个性化</span>
      </div>
      <div class="recommendation-content">
        <div class="recommendation-info">
          <h4>{{ dailyRecommendation.title }}</h4>
          <p>{{ dailyRecommendation.description }}</p>
          <div class="recommendation-meta">
            <span class="duration">⏱️ {{ dailyRecommendation.duration }}分钟</span>
            <span class="type">🎯 {{ dailyRecommendation.type }}</span>
          </div>
        </div>
        <button class="start-recommendation-btn" @click="startRecommendation">
          开始练习
        </button>
      </div>
    </div>

    <!-- 训练模块 -->
    <div class="modules-section" v-if="currentView === 'main'">
      <h2 class="section-title">训练模块</h2>
      <div class="training-modules">
        <div class="module-card guided-meditation" @click="navigateTo('/meditation/guided-voice')">
          <div class="module-header">
            <div class="module-icon">🎧</div>
            <div class="module-status" :class="{ active: moduleProgress.guidedMeditation > 0 }">
              {{ moduleProgress.guidedMeditation > 0 ? '进行中' : '未开始' }}
            </div>
          </div>
          <h3>语音引导冥想</h3>
          <p>通过温和的语音引导，帮助孩子学会放松和集中注意力</p>
          <div class="module-features">
            <span class="feature-tag">🧘 深度放松</span>
            <span class="feature-tag">🎵 背景音乐</span>
            <span class="feature-tag">👶 适合初学者</span>
          </div>
          <div class="module-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: moduleProgress.guidedMeditation + '%' }"></div>
            </div>
            <span class="progress-text">{{ moduleProgress.guidedMeditation }}% 完成</span>
          </div>
          <div class="module-level">适合年龄：3-12岁</div>
        </div>

        <div class="module-card brainwave" @click="navigateTo('/meditation/brainwave-generator')">
          <div class="module-header">
            <div class="module-icon">🧠</div>
            <div class="module-status" :class="{ active: moduleProgress.brainwave > 0 }">
              {{ moduleProgress.brainwave > 0 ? '进行中' : '未开始' }}
            </div>
          </div>
          <h3>脑波发生器</h3>
          <p>使用特定频率的音频帮助大脑进入最佳学习状态</p>
          <div class="module-features">
            <span class="feature-tag">🌊 Alpha波</span>
            <span class="feature-tag">⚡ Beta波</span>
            <span class="feature-tag">🎯 专注训练</span>
          </div>
          <div class="module-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: moduleProgress.brainwave + '%' }"></div>
            </div>
            <span class="progress-text">{{ moduleProgress.brainwave }}% 完成</span>
          </div>
          <div class="module-level">适合年龄：5-12岁</div>
        </div>

        <div class="module-card metronome" @click="navigateTo('/meditation/metronome')">
          <div class="module-header">
            <div class="module-icon">⏱️</div>
            <div class="module-status" :class="{ active: moduleProgress.metronome > 0 }">
              {{ moduleProgress.metronome > 0 ? '进行中' : '未开始' }}
            </div>
          </div>
          <h3>节拍器训练</h3>
          <p>通过有节奏的声音训练，提高专注力和时间感知能力</p>
          <div class="module-features">
            <span class="feature-tag">🎵 节奏感</span>
            <span class="feature-tag">⏰ 时间感知</span>
            <span class="feature-tag">🎯 专注力</span>
          </div>
          <div class="module-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: moduleProgress.metronome + '%' }"></div>
            </div>
            <span class="progress-text">{{ moduleProgress.metronome }}% 完成</span>
          </div>
          <div class="module-level">适合年龄：4-12岁</div>
        </div>
      </div>
    </div>

    <!-- 进度统计 -->
    <div class="progress-section" v-if="$route.path === '/meditation'">
      <div class="section-header">
        <h3>训练进度</h3>
        <button class="view-details-btn" @click="showDetailedStats = !showDetailedStats">
          {{ showDetailedStats ? '收起详情' : '查看详情' }}
        </button>
      </div>
      
      <div class="progress-overview">
        <div class="stat-card primary">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <span class="stat-value">{{ totalTrainingTime }}</span>
            <span class="stat-label">总训练时长（分钟）</span>
            <div class="stat-trend positive">+{{ todayTrainingTime }}分钟 今日</div>
          </div>
        </div>
        
        <div class="stat-card secondary">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <span class="stat-value">{{ consecutiveDays }}</span>
            <span class="stat-label">连续训练天数</span>
            <div class="stat-trend" :class="{ positive: consecutiveDays > 0 }">
              {{ consecutiveDays > 0 ? '保持连续' : '开始训练' }}
            </div>
          </div>
        </div>
        
        <div class="stat-card tertiary">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <span class="stat-value">{{ completedModules }}/3</span>
            <span class="stat-label">完成模块</span>
            <div class="stat-trend" :class="{ positive: completedModules > 0 }">
              {{ Math.round((completedModules / 3) * 100) }}% 完成
            </div>
          </div>
        </div>
        
        <div class="stat-card quaternary">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <span class="stat-value">{{ achievements.length }}</span>
            <span class="stat-label">获得成就</span>
            <div class="stat-trend positive">{{ latestAchievement || '继续努力' }}</div>
          </div>
        </div>
      </div>
      
      <!-- 详细统计 -->
      <div v-if="showDetailedStats" class="detailed-stats">
        <div class="stats-grid">
          <div class="detail-stat">
            <h4>本周目标</h4>
            <div class="goal-progress">
              <div class="goal-bar">
                <div class="goal-fill" :style="{ width: weeklyProgress + '%' }"></div>
              </div>
              <span class="goal-text">{{ weeklyTrainingTime }}/{{ weeklyGoal }}分钟</span>
            </div>
          </div>
          
          <div class="detail-stat">
            <h4>最佳连续记录</h4>
            <div class="best-streak">
              <span class="streak-number">{{ bestStreak }}</span>
              <span class="streak-unit">天</span>
            </div>
          </div>
          
          <div class="detail-stat">
            <h4>平均会话时长</h4>
            <div class="average-session">
              <span class="session-number">{{ averageSessionLength }}</span>
              <span class="session-unit">分钟</span>
            </div>
          </div>
          
          <div class="detail-stat">
            <h4>最喜欢的模块</h4>
            <div class="favorite-module">
              <span class="module-name">{{ favoriteModule }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 成就系统 -->
    <div class="achievements-section" v-if="achievements.length > 0 && $route.path === '/meditation'">
      <h3>🏆 最近成就</h3>
      <div class="achievements-list">
        <div v-for="achievement in recentAchievements" :key="achievement.id" class="achievement-item">
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-info">
            <h4>{{ achievement.title }}</h4>
            <p>{{ achievement.description }}</p>
            <span class="achievement-date">{{ formatDate(achievement.date) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 子路由内容 -->
    <router-view v-if="$route.path !== '/meditation'" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTrainingStore } from '../stores';

const router = useRouter();
const route = useRoute();
const trainingStore = useTrainingStore();

// 模块标题映射
const moduleTitles = {
  '/meditation/guided-voice': '语音引导冥想',
  '/meditation/brainwave-generator': '脑波发生器',
  '/meditation/metronome': '节拍器训练'
};

// 获取模块标题
const getModuleTitle = (path) => {
  return moduleTitles[path] || '冥想训练';
};

// 基础统计数据
const totalTrainingTime = ref(0);
const consecutiveDays = ref(0);
const completedModules = ref(0);
const todayTrainingTime = ref(0);
const showDetailedStats = ref(false);

// 详细统计数据
const weeklyTrainingTime = ref(0);
const weeklyGoal = ref(150);
const bestStreak = ref(0);
const averageSessionLength = ref(0);
const favoriteModule = ref('语音引导冥想');

// 模块进度
const moduleProgress = ref({
  guidedMeditation: 0,
  brainwave: 0,
  metronome: 0
});

// 今日推荐
const dailyRecommendation = ref({
  title: '晨间唤醒冥想',
  description: '以轻柔的引导和自然音效开始美好的一天',
  duration: 10,
  type: '语音引导'
});

// 成就系统
const achievements = ref([
  {
    id: 1,
    title: '初次体验',
    description: '完成第一次冥想练习',
    icon: '🌟',
    date: new Date(Date.now() - 86400000) // 昨天
  },
  {
    id: 2,
    title: '坚持不懈',
    description: '连续训练3天',
    icon: '🔥',
    date: new Date(Date.now() - 172800000) // 前天
  }
]);

// 计算属性
const weeklyProgress = computed(() => {
  return Math.min((weeklyTrainingTime.value / weeklyGoal.value) * 100, 100);
});

const recentAchievements = computed(() => {
  return achievements.value.slice(-3).reverse();
});

const latestAchievement = computed(() => {
  return achievements.value.length > 0 ? achievements.value[achievements.value.length - 1].title : null;
});

// 方法
const navigateTo = (path) => {
  router.push(path);
};

const goBack = () => {
  router.push('/meditation');
};

const startQuickSession = () => {
  // 根据用户偏好选择最适合的快速冥想
  navigateTo('/meditation/guided-voice');
};

const startRecommendation = () => {
  navigateTo('/meditation/guided-voice');
};

const formatDate = (date) => {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '昨天';
  if (diffDays === 2) return '前天';
  if (diffDays <= 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN');
};

// 加载训练数据
const loadTrainingData = async () => {
  try {
    // 从本地存储加载冥想训练数据
    const saved = localStorage.getItem('meditationStats');
    if (saved) {
      const meditationStats = JSON.parse(saved);
      totalTrainingTime.value = meditationStats.totalTime || 0;
      consecutiveDays.value = meditationStats.consecutiveDays || 0;
      completedModules.value = meditationStats.completedModules || 0;
    } else {
      // 初始化默认数据
      totalTrainingTime.value = 0;
      consecutiveDays.value = 0;
      completedModules.value = 0;
    }
    
    // 模拟加载详细数据
    todayTrainingTime.value = Math.floor(Math.random() * 30) + 5;
    weeklyTrainingTime.value = Math.floor(Math.random() * 120) + 30;
    bestStreak.value = Math.max(consecutiveDays.value, Math.floor(Math.random() * 15) + 5);
    averageSessionLength.value = Math.floor(Math.random() * 10) + 10;
    
    // 从本地存储加载模块进度数据
    const moduleData = localStorage.getItem('meditationModuleProgress');
    if (moduleData) {
      const progress = JSON.parse(moduleData);
      moduleProgress.value.guidedMeditation = progress.guidedMeditation || 0;
      moduleProgress.value.brainwave = progress.brainwave || 0;
      moduleProgress.value.metronome = progress.metronome || 0;
    } else {
      // 初始化默认进度
      moduleProgress.value.guidedMeditation = 0;
      moduleProgress.value.brainwave = 0;
      moduleProgress.value.metronome = 0;
    }
    
  } catch (error) {
    console.error('加载训练数据失败:', error);
  }
};

onMounted(() => {
  loadTrainingData();
});
</script>

<style scoped>
.meditation-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 面包屑导航样式 */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.breadcrumb-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
}

.breadcrumb-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.breadcrumb-item:hover::before {
  left: 100%;
}

.breadcrumb-item:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.breadcrumb-item:active {
  transform: translateY(0);
}

.breadcrumb-separator {
  color: #94a3b8;
  font-size: 1.2rem;
  font-weight: 300;
  opacity: 0.7;
  margin: 0;
}

.breadcrumb-current {
  color: #1e40af;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  position: relative;
}

.breadcrumb-current::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(29, 78, 216, 0.05) 100%);
  border-radius: 10px;
  z-index: -1;
}

.icon-arrow-left::before {
  content: '←';
  font-size: 1rem;
}

/* 模块内容样式 */
.module-content {
  min-height: 60vh;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.page-header {
  position: relative;
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 0;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05) 0%, rgba(var(--color-secondary-rgb), 0.05) 100%);
  border-radius: 20px;
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(var(--color-primary-rgb), 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 60px;
  height: 60px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 40px;
  height: 40px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.page-header h1 {
  position: relative;
  z-index: 2;
  color: var(--color-primary);
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.page-description {
  position: relative;
  z-index: 2;
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto 2rem;
}

.quick-start-section {
  position: relative;
  z-index: 2;
  margin-top: 2rem;
}

.quick-start-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 15px rgba(var(--color-primary-rgb), 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.4);
}

.btn-icon {
  font-size: 1.2rem;
}

.quick-start-hint {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  opacity: 0.8;
}

/* 今日推荐 */
.daily-recommendation {
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05) 0%, rgba(var(--color-secondary-rgb), 0.05) 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.recommendation-header h3 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.3rem;
}

.recommendation-badge {
  background: var(--color-primary);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.recommendation-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.recommendation-info h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.recommendation-info p {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.recommendation-meta {
  display: flex;
  gap: 1rem;
}

.recommendation-meta span {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.start-recommendation-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.start-recommendation-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* 模块部分 */
.modules-section {
  margin-bottom: 3rem;
}

.section-title {
  color: var(--color-primary);
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

.training-modules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.module-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  box-shadow: var(--shadow-md);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transform: scaleX(0);
  transition: transform var(--transition-normal);
}

.module-card:hover::before {
  transform: scaleX(1);
}

.module-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(var(--color-primary-rgb), 0.2);
}

.module-card.guided-meditation:hover {
  border-color: #4CAF50;
}

.module-card.brainwave:hover {
  border-color: #2196F3;
}

.module-card.metronome:hover {
  border-color: #FF9800;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.module-icon {
  font-size: 3rem;
  margin-bottom: 0;
}

.module-status {
  background: rgba(var(--color-text-secondary-rgb), 0.1);
  color: var(--color-text-secondary);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.module-status.active {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.module-card h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.3rem;
  text-align: left;
}

.module-card p {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
  text-align: left;
}

.module-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.feature-tag {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.module-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  background: rgba(var(--color-primary-rgb), 0.1);
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  height: 100%;
  border-radius: 3px;
  transition: width var(--transition-normal);
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.module-level {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
  margin-top: 1rem;
}

.progress-section {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h3 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.5rem;
}

.view-details-btn {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.view-details-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.2);
}

.progress-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
}

.stat-card.primary::before {
  background: linear-gradient(90deg, #4CAF50, #45a049);
}

.stat-card.secondary::before {
  background: linear-gradient(90deg, #FF5722, #f4511e);
}

.stat-card.tertiary::before {
  background: linear-gradient(90deg, #2196F3, #1976d2);
}

.stat-card.quaternary::before {
  background: linear-gradient(90deg, #FF9800, #f57c00);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: rgba(var(--color-primary-rgb), 0.2);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  line-height: 1;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-align: center;
}

.stat-trend {
  font-size: 0.8rem;
  color: var(--color-success);
  font-weight: 600;
}

.stat-trend.positive {
  color: var(--color-success);
}

.stat-trend.negative {
  color: var(--color-warning);
}

/* 详细统计 */
.detailed-stats {
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.1);
  padding-top: 2rem;
  margin-top: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.detail-stat {
  text-align: center;
  padding: 1.5rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 12px;
}

.detail-stat h4 {
  color: var(--color-primary);
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.goal-progress {
  margin-top: 0.5rem;
}

.goal-bar {
  background: rgba(var(--color-primary-rgb), 0.2);
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.goal-fill {
  background: var(--color-success);
  height: 100%;
  border-radius: 3px;
  transition: width var(--transition-normal);
}

.goal-text {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.best-streak, .average-session {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.3rem;
}

.streak-number, .session-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.streak-unit, .session-unit {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.favorite-module .module-name {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 1.1rem;
}

/* 成就系统 */
.achievements-section {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  margin-bottom: 3rem;
}

.achievements-section h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.achievements-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.achievement-item {
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.achievement-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: rgba(var(--color-primary-rgb), 0.2);
}

.achievement-icon {
  font-size: 2.5rem;
  opacity: 0.8;
  flex-shrink: 0;
}

.achievement-info {
  flex: 1;
}

.achievement-info h4 {
  color: var(--color-primary);
  margin: 0 0 0.3rem 0;
  font-size: 1.1rem;
}

.achievement-info p {
  color: var(--color-text-secondary);
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.achievement-date {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .meditation-container {
    padding: 1rem;
  }
  
  .page-header {
    padding: 2rem 0;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-description {
    font-size: 1rem;
  }
  
  .quick-start-btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
  
  .recommendation-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .start-recommendation-btn {
    align-self: center;
  }
  
  .training-modules {
    grid-template-columns: 1fr;
  }
  
  .module-card {
    padding: 1.5rem;
  }
  
  .progress-overview {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.8rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .achievements-list {
    grid-template-columns: 1fr;
  }
  
  .achievement-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .meditation-container {
    padding: 0.5rem;
  }
  
  .page-header {
    padding: 1.5rem 0;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .daily-recommendation {
    padding: 1.5rem;
  }
  
  .recommendation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .module-card {
    padding: 1rem;
  }
  
  .module-features {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .progress-overview {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    font-size: 2rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .detail-stat {
    padding: 1rem;
  }
  
  .streak-number, .session-number {
    font-size: 1.5rem;
  }
}
</style>