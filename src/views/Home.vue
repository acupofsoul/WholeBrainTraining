<template>
  <div class="home-container">
    <!-- 主横幅区域 -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="brain-network"></div>
      </div>
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="title-main">全脑训练</span>
            <span class="title-sub">智能训练平台</span>
          </h1>
          <p class="hero-description">
            基于科学的认知训练方法，全面提升您的大脑潜能
          </p>
          <div class="hero-features">
            <div class="feature-item">
              <span class="feature-icon">🧠</span>
              <span>科学训练</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📊</span>
              <span>数据追踪</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎯</span>
              <span>个性化</span>
            </div>
          </div>
          <div class="hero-actions">
            <router-link to="/meditation" class="btn btn-primary">
              <span class="btn-icon">🚀</span>
              开始训练之旅
            </router-link>
            <a href="#modules" class="btn btn-secondary">
              <span class="btn-icon">📖</span>
              了解更多
            </a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="brain-illustration">
            <div class="brain-core"></div>
            <div class="brain-waves">
              <div class="wave wave-1"></div>
              <div class="wave wave-2"></div>
              <div class="wave wave-3"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 训练统计概览 -->
    <section class="stats-section" v-if="hasTrainingData">
      <h2 class="section-title">您的训练概览</h2>
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-value">{{ totalTrainingSessions }}</div>
          <div class="stat-label">总训练次数</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">{{ formatTime(totalTrainingTime) }}</div>
          <div class="stat-label">总训练时间</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-value">{{ lastTrainingDate }}</div>
          <div class="stat-label">上次训练</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-value">{{ calculateConsistency }}%</div>
          <div class="stat-label">坚持度</div>
        </div>
      </div>
    </section>
    
    <!-- 训练模块 -->
    <section id="modules" class="modules-section">
      <div class="section-header">
        <h2 class="section-title">训练模块</h2>
        <p class="section-subtitle">六大核心训练体系，全面开发大脑潜能</p>
      </div>
      
      <div class="modules-grid">
        <!-- 冥想与放松训练 -->
        <div class="module-card meditation">
          <div class="module-header">
            <div class="module-icon">🧘</div>
            <div class="module-badge">基础</div>
          </div>
          <h3 class="module-title">冥想与放松训练</h3>
          <p class="module-description">通过冥想、脑波调节和节拍器训练，帮助您进入最佳学习状态</p>
          <div class="module-features">
            <span class="feature-tag">语音引导</span>
            <span class="feature-tag">脑波发生器</span>
            <span class="feature-tag">节拍器</span>
          </div>
          <router-link to="/meditation" class="module-btn">
            <span>开始训练</span>
            <span class="btn-arrow">→</span>
          </router-link>
        </div>

        <!-- 基础训练 -->
        <div class="module-card basic">
          <div class="module-header">
            <div class="module-icon">🎯</div>
            <div class="module-badge">核心</div>
          </div>
          <h3 class="module-title">基础训练</h3>
          <p class="module-description">提升整体感知、扩大视野、培养视读节奏和流畅性</p>
          <div class="module-features">
            <span class="feature-tag">整体感知</span>
            <span class="feature-tag">扩大视野</span>
            <span class="feature-tag">舒尔特表</span>
          </div>
          <router-link to="/basic-training" class="module-btn">
            <span>开始训练</span>
            <span class="btn-arrow">→</span>
          </router-link>
        </div>

        <!-- 闪视训练 -->
        <div class="module-card flash">
          <div class="module-header">
            <div class="module-icon">⚡</div>
            <div class="module-badge">进阶</div>
          </div>
          <h3 class="module-title">闪视训练</h3>
          <p class="module-description">通过快速闪现训练，提高视觉记忆和信息处理速度</p>
          <div class="module-features">
            <span class="feature-tag">基本闪视</span>
            <span class="feature-tag">文章闪视</span>
            <span class="feature-tag">图像闪视</span>
            <span class="feature-tag">自定义单词</span>
            <span class="feature-tag">自定义图片</span>
          </div>
          <router-link to="/flash-training" class="module-btn">
            <span>开始训练</span>
            <span class="btn-arrow">→</span>
          </router-link>
        </div>

        <!-- 速读训练 -->
        <div class="module-card speed">
          <div class="module-header">
            <div class="module-icon">📚</div>
            <div class="module-badge">应用</div>
          </div>
          <h3 class="module-title">速读训练</h3>
          <p class="module-description">提高阅读速度和理解力，掌握高效阅读技巧</p>
          <div class="module-features">
            <span class="feature-tag">文章阅读</span>
            <span class="feature-tag">3D图阅读</span>
          </div>
          <router-link to="/speed-reading" class="module-btn">
            <span>开始训练</span>
            <span class="btn-arrow">→</span>
          </router-link>
        </div>

        <!-- 照相记忆 -->
        <div class="module-card memory">
          <div class="module-header">
            <div class="module-icon">📸</div>
            <div class="module-badge">高级</div>
          </div>
          <h3 class="module-title">照相记忆</h3>
          <p class="module-description">开发右脑图像记忆能力，实现快速记忆和回忆</p>
          <div class="module-features">
            <span class="feature-tag">残像训练</span>
            <span class="feature-tag">颜色感知</span>
            <span class="feature-tag">3D卡片</span>
          </div>
          <router-link to="/photographic-memory" class="module-btn">
            <span>开始训练</span>
            <span class="btn-arrow">→</span>
          </router-link>
        </div>

        <!-- 能力测评 -->
        <div class="module-card assessment">
          <div class="module-header">
            <div class="module-icon">📊</div>
            <div class="module-badge">评估</div>
          </div>
          <h3 class="module-title">能力测评</h3>
          <p class="module-description">全面评估您的认知能力水平，制定个性化训练计划</p>
          <div class="module-features">
            <span class="feature-tag">综合评估</span>
            <span class="feature-tag">能力分析</span>
          </div>
          <router-link to="/abilities" class="module-btn">
            <span>开始测评</span>
            <span class="btn-arrow">→</span>
          </router-link>
        </div>
      </div>
    </section>
    
    <!-- 最近训练记录 -->
    <section class="recent-trainings-section" v-if="hasTrainingData">
      <h2 class="section-title">最近训练记录</h2>
      <div class="recent-trainings-container">
        <div class="recent-training-list">
          <div v-for="(training, index) in recentTrainings" :key="index" class="recent-training-item">
            <div class="training-type" :class="getTrainingTypeClass(training.type)">
              {{ getTrainingTypeName(training.type) }}
            </div>
            <div class="training-details">
              <div class="training-date">{{ formatTrainingDate(training.timestamp) }}</div>
              <div class="training-result">{{ getTrainingResult(training) }}</div>
            </div>
          </div>
          <div v-if="recentTrainings.length === 0" class="no-records">
            暂无训练记录
          </div>
        </div>
      </div>
    </section>
    
    <!-- 训练指南 -->
    <section id="guide" class="guide-section">
      <h2 class="section-title">训练指南</h2>
      <div class="guide-container">
        <div class="guide-card">
          <h3>新手入门</h3>
          <p>如果您是第一次使用全脑训练工具，建议从以下步骤开始：</p>
          <ol>
            <li>每天进行15-30分钟的训练</li>
            <li>从舒尔特表3×3难度开始</li>
            <li>速读训练从200字/分钟开始</li>
            <li>闪视训练从简单难度开始</li>
          </ol>
        </div>
        
        <div class="guide-card">
          <h3>推荐训练计划</h3>
          <p>根据科学研究，以下训练计划可以有效提升认知能力：</p>
          <ul>
            <li><strong>周一、三、五：</strong> 舒尔特表 + 闪视训练</li>
            <li><strong>周二、四、六：</strong> 速读训练 + 闪视训练</li>
            <li><strong>周日：</strong> 休息或轻度训练</li>
          </ul>
        </div>
        
        <div class="guide-card">
          <h3>进阶技巧</h3>
          <p>当您完成基础训练后，可以尝试以下进阶方法：</p>
          <ul>
            <li>舒尔特表训练时尝试外周视觉，不要移动眼球</li>
            <li>速读训练时尝试减少眼球停留次数</li>
            <li>闪视训练时逐渐减少显示时间</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useTrainingStore } from '../stores';

// 获取训练数据存储
const trainingStore = useTrainingStore();

// 基本训练数据计算属性
const hasTrainingData = computed(() => {
  return trainingStore.isLoaded && trainingStore.stats.totalSessions > 0;
});

const totalTrainingSessions = computed(() => {
  return trainingStore.stats.totalSessions || 0;
});

const totalTrainingTime = computed(() => {
  return trainingStore.stats.totalTime || 0;
});

const lastTrainingDate = computed(() => {
  if (!trainingStore.stats.lastSession) return '无记录';
  return new Date(trainingStore.stats.lastSession).toLocaleDateString('zh-CN');
});

// 各模块训练数据计算属性
const schulteStats = computed(() => {
  return trainingStore.stats.moduleStats.schulte;
});

const speedReadingStats = computed(() => {
  return trainingStore.stats.moduleStats.speedReading;
});

const flashVisionStats = computed(() => {
  return trainingStore.stats.moduleStats.flashVision;
});

const hasSchulteData = computed(() => {
  return schulteStats.value.sessions > 0;
});

const hasSpeedReadingData = computed(() => {
  return speedReadingStats.value.sessions > 0;
});

const hasFlashVisionData = computed(() => {
  return flashVisionStats.value.sessions > 0;
});

// 计算坚持度（根据训练频率和连续性）
const calculateConsistency = computed(() => {
  if (!hasTrainingData.value) return 0;
  
  // 简单计算：如果有训练记录，基础分为60分
  let score = 60;
  
  // 根据训练次数增加分数，最多增加20分
  const sessionScore = Math.min(trainingStore.stats.totalSessions / 10 * 20, 20);
  
  // 根据最近是否有训练增加分数，最多增加20分
  let recencyScore = 0;
  if (trainingStore.stats.lastSession) {
    const lastTraining = new Date(trainingStore.stats.lastSession);
    const now = new Date();
    const daysSinceLastTraining = Math.floor((now - lastTraining) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastTraining <= 1) {
      recencyScore = 20; // 1天内训练
    } else if (daysSinceLastTraining <= 3) {
      recencyScore = 15; // 3天内训练
    } else if (daysSinceLastTraining <= 7) {
      recencyScore = 10; // 一周内训练
    } else if (daysSinceLastTraining <= 14) {
      recencyScore = 5;  // 两周内训练
    }
  }
  
  return Math.min(Math.round(score + sessionScore + recencyScore), 100);
});

// 获取最近训练记录
const recentTrainings = computed(() => {
  // 合并所有训练记录并按时间排序
  const allTrainings = [];
  
  // 添加舒尔特表训练记录
  trainingStore.schulteHistory.slice(0, 3).forEach(record => {
    allTrainings.push({
      ...record,
      type: 'schulte'
    });
  });
  
  // 添加速读训练记录
  trainingStore.speedReadingHistory.slice(0, 3).forEach(record => {
    allTrainings.push({
      ...record,
      type: 'speedReading'
    });
  });
  
  // 添加闪视训练记录
  trainingStore.flashVisionHistory.slice(0, 3).forEach(record => {
    allTrainings.push({
      ...record,
      type: 'flashVision'
    });
  });
  
  // 按时间排序（最新的在前）
  return allTrainings.sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  }).slice(0, 5); // 只显示最近5条
});

// 格式化函数
const formatTime = (seconds) => {
  if (!seconds) return '0:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatBestTime = (seconds) => {
  if (!seconds) return '无记录';
  return `${seconds.toFixed(1)}秒`;
};

const formatPercentage = (value) => {
  if (!value && value !== 0) return '无记录';
  return `${(value * 100).toFixed(0)}%`;
};

const formatResponseTime = (ms) => {
  if (!ms) return '无记录';
  return `${ms.toFixed(0)}毫秒`;
};

const formatTrainingDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取训练类型样式类
const getTrainingTypeClass = (type) => {
  switch (type) {
    case 'schulte': return 'type-schulte';
    case 'speedReading': return 'type-speed-reading';
    case 'flashVision': return 'type-flash-vision';
    default: return '';
  }
};

// 获取训练类型名称
const getTrainingTypeName = (type) => {
  switch (type) {
    case 'schulte': return '舒尔特表';
    case 'speedReading': return '速读训练';
    case 'flashVision': return '闪视训练';
    default: return '未知训练';
  }
};

// 获取训练结果描述
const getTrainingResult = (training) => {
  switch (training.type) {
    case 'schulte':
      return `完成时间: ${formatBestTime(training.completionTime)}`;
    case 'speedReading':
      return `速度: ${training.readingSpeed}字/分钟, 理解度: ${formatPercentage(training.comprehension)}`;
    case 'flashVision':
      return `准确率: ${formatPercentage(training.accuracy)}, 反应时间: ${formatResponseTime(training.averageResponseTime)}`;
    default:
      return '';
  }
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 主横幅区域样式 */
.hero-section {
  position: relative;
  padding: 80px 40px;
  margin-bottom: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  overflow: hidden;
  color: white;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
}

.brain-network {
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="brain" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="10" cy="10" r="1" fill="%23ffffff" opacity="0.3"/></pattern></defs><rect width="100" height="100" fill="url(%23brain)"/></svg>') repeat;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 60px;
}

.hero-text {
  flex: 1;
  text-align: left;
}

.hero-title {
  margin-bottom: 20px;
}

.title-main {
  display: block;
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.title-sub {
  display: block;
  font-size: 1.8rem;
  font-weight: 400;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.3rem;
  line-height: 1.6;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-features {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 20px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
}

.feature-icon {
  font-size: 1.5rem;
}

.hero-actions {
  display: flex;
  gap: 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.btn-icon {
  font-size: 1.2rem;
}

.hero-visual {
  flex: 0 0 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.brain-illustration {
  position: relative;
  width: 200px;
  height: 200px;
}

.brain-core {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 70%);
  border-radius: 50%;
  position: relative;
  animation: pulse 3s ease-in-out infinite;
}

.brain-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wave {
  position: absolute;
  border: 2px solid rgba(255,255,255,0.4);
  border-radius: 50%;
  animation: wave-expand 2s ease-out infinite;
}

.wave-1 {
  width: 100px;
  height: 100px;
  margin: -50px 0 0 -50px;
  animation-delay: 0s;
}

.wave-2 {
  width: 140px;
  height: 140px;
  margin: -70px 0 0 -70px;
  animation-delay: 0.7s;
}

.wave-3 {
  width: 180px;
  height: 180px;
  margin: -90px 0 0 -90px;
  animation-delay: 1.4s;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes wave-expand {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* 统计概览样式 */
.stats-section {
  margin-bottom: 60px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 30px 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
  display: block;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

/* 训练模块样式 */
.modules-section {
  margin-bottom: 60px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 15px;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.module-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--module-color), var(--module-color-light));
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  border-color: var(--module-color);
}

.module-card.meditation {
  --module-color: #9b59b6;
  --module-color-light: #bb7bd1;
  --module-color-rgb: 155, 89, 182;
}

.module-card.basic {
  --module-color: #3498db;
  --module-color-light: #5dade2;
  --module-color-rgb: 52, 152, 219;
}

.module-card.flash {
  --module-color: #f39c12;
  --module-color-light: #f7c52d;
  --module-color-rgb: 243, 156, 18;
}

.module-card.speed {
  --module-color: #e74c3c;
  --module-color-light: #ec7063;
  --module-color-rgb: 231, 76, 60;
}

.module-card.memory {
  --module-color: #1abc9c;
  --module-color-light: #48c9b0;
  --module-color-rgb: 26, 188, 156;
}

.module-card.assessment {
  --module-color: #34495e;
  --module-color-light: #5d6d7e;
  --module-color-rgb: 52, 73, 94;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.module-icon {
  font-size: 3rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.module-badge {
  background: var(--module-color);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.module-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 15px 0;
}

.module-description {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.module-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 25px;
}

.feature-tag {
  background: rgba(var(--module-color-rgb), 0.1);
  color: var(--module-color);
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(var(--module-color-rgb), 0.2);
}

.module-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 15px 20px;
  background: var(--module-color);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.module-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.module-btn:hover::before {
  left: 100%;
}

.module-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.btn-arrow {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.module-btn:hover .btn-arrow {
  transform: translateX(5px);
}

/* 最近训练记录样式 */
.recent-trainings-section {
  margin-bottom: 60px;
}

.recent-trainings-container {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.recent-training-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.recent-training-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.recent-training-item:hover {
  background: #e9ecef;
}

.training-type {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  min-width: 80px;
  text-align: center;
}

.training-type.type-schulte {
  background: #3498db;
}

.training-type.type-speed-reading {
  background: #e74c3c;
}

.training-type.type-flash-vision {
  background: #f39c12;
}

.training-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.training-date {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.training-result {
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.no-records {
  text-align: center;
  color: #7f8c8d;
  padding: 40px;
  font-style: italic;
}

/* 训练指南样式 */
.guide-section {
  margin-bottom: 60px;
}

.guide-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.guide-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.guide-card:hover {
  transform: translateY(-5px);
}

.guide-card h3 {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.guide-card p {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 20px;
}

.guide-card ol,
.guide-card ul {
  color: #2c3e50;
  line-height: 1.8;
  padding-left: 20px;
}

.guide-card li {
  margin-bottom: 8px;
}

.guide-card strong {
  color: #2c3e50;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 10px;
  }
  
  .hero-section {
    padding: 40px 20px;
    margin-bottom: 40px;
  }
  
  .hero-content {
    flex-direction: column;
    gap: 30px;
    text-align: center;
  }
  
  .hero-text {
    text-align: center;
  }
  
  .title-main {
    font-size: 2.5rem;
  }
  
  .title-sub {
    font-size: 1.3rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .hero-features {
    flex-direction: column;
    gap: 15px;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-visual {
    flex: none;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .module-card {
    padding: 25px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .guide-container {
    grid-template-columns: 1fr;
  }
  
  .recent-training-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .training-details {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>