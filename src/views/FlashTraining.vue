<template>
  <div class="flash-training-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-nav" v-if="$route.path !== '/flash-training'">
      <span class="breadcrumb-item" @click="goBack">
        <span class="back-arrow">←</span>
        闪视训练
      </span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-current">{{ getModuleTitle($route.path) }}</span>
    </div>

    <!-- 主页面内容 -->
    <div v-if="$route.path === '/flash-training'">
      <div class="page-header">
        <h1>闪视训练</h1>
        <p class="page-description">
          闪视训练是七田真全脑开发的重要组成部分，通过快速闪现的视觉刺激，
          激活右脑的图像处理能力，提升瞬间记忆和信息处理速度。
        </p>
      </div>

      <div class="training-modules">
        <div class="module-card" @click="navigateTo('basic-flash')">
          <div class="module-icon">⚡</div>
          <h3>基本闪视训练</h3>
          <p>通过基础图形、数字、字母的快速闪现，建立闪视感知基础</p>
          <div class="module-level">难度：⭐</div>
          <div class="module-stats">
            <span>已完成：{{ basicFlashStats.completed }}次</span>
            <span>最佳成绩：{{ basicFlashStats.bestScore }}%</span>
          </div>
        </div>

        <div class="module-card" @click="navigateTo('article-flash')">
          <div class="module-icon">📄</div>
          <h3>文章闪视训练</h3>
          <p>快速闪现文章段落，训练文字信息的瞬间捕捉和理解能力</p>
          <div class="module-level">难度：⭐⭐⭐</div>
          <div class="module-stats">
            <span>已完成：{{ articleFlashStats.completed }}次</span>
            <span>最佳成绩：{{ articleFlashStats.bestScore }}%</span>
          </div>
        </div>

        <div class="module-card" @click="navigateTo('image-flash')">
          <div class="module-icon">🖼️</div>
          <h3>图像闪视训练</h3>
          <p>通过复杂图像的快速闪现，提升视觉记忆和图像识别能力</p>
          <div class="module-level">难度：⭐⭐</div>
          <div class="module-stats">
            <span>已完成：{{ imageFlashStats.completed }}次</span>
            <span>最佳成绩：{{ imageFlashStats.bestScore }}%</span>
          </div>
        </div>

        <div class="module-card" @click="navigateTo('custom-word-flash')">
          <div class="module-icon">📝</div>
          <h3>自定义单词闪视</h3>
          <p>自定义单词列表进行闪视训练，支持个性化学习内容</p>
          <div class="module-level special">自定义</div>
          <div class="module-stats">
            <span>已完成：{{ customWordStats.completed }}次</span>
            <span>最佳成绩：{{ customWordStats.bestScore }}%</span>
          </div>
        </div>

        <div class="module-card" @click="navigateTo('custom-image-flash')">
          <div class="module-icon">🎨</div>
          <h3>自定义图片闪视</h3>
          <p>上传自定义图片进行闪视训练，支持多组图片批量设置</p>
          <div class="module-level special">自定义</div>
          <div class="module-stats">
            <span>已完成：{{ customImageStats.completed }}次</span>
            <span>最佳成绩：{{ customImageStats.bestScore }}%</span>
          </div>
        </div>
      </div>

    <div class="training-settings">
      <h3>训练设置</h3>
      <div class="settings-grid">
        <div class="setting-item">
          <label>闪现速度</label>
          <select v-model="flashSpeed">
            <option value="slow">慢速 (1000ms)</option>
            <option value="medium">中速 (500ms)</option>
            <option value="fast">快速 (200ms)</option>
            <option value="ultra">极速 (100ms)</option>
          </select>
        </div>
        
        <div class="setting-item">
          <label>训练轮数</label>
          <select v-model="trainingRounds">
            <option value="5">5轮</option>
            <option value="10">10轮</option>
            <option value="15">15轮</option>
            <option value="20">20轮</option>
          </select>
        </div>
        
        <div class="setting-item">
          <label>难度等级</label>
          <select v-model="difficultyLevel">
            <option value="beginner">初级</option>
            <option value="intermediate">中级</option>
            <option value="advanced">高级</option>
          </select>
        </div>
        
        <div class="setting-item">
          <label>声音提示</label>
          <div class="toggle-switch">
            <input type="checkbox" v-model="soundEnabled" id="sound-toggle">
            <label for="sound-toggle" class="toggle-label"></label>
          </div>
        </div>
      </div>
    </div>

    <div class="progress-overview">
      <h3>训练进度概览</h3>
      <div class="progress-charts">
        <div class="chart-item">
          <div class="chart-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" stroke-width="8"/>
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="var(--color-primary)" 
                stroke-width="8"
                stroke-dasharray="283"
                :stroke-dashoffset="283 - (283 * overallProgress / 100)"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div class="chart-text">
              <span class="percentage">{{ Math.round(overallProgress) }}%</span>
              <span class="label">总体进度</span>
            </div>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ totalSessions }}</div>
            <div class="stat-label">总训练次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ averageAccuracy }}%</div>
            <div class="stat-label">平均准确率</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ bestStreak }}</div>
            <div class="stat-label">最佳连击</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ totalTime }}min</div>
            <div class="stat-label">累计训练时间</div>
          </div>
        </div>
      </div>
    </div>

    <div class="training-tips">
      <h3>训练小贴士</h3>
      <div class="tips-grid">
        <div class="tip-item">
          <div class="tip-icon">💡</div>
          <h4>放松状态</h4>
          <p>保持身心放松，不要过度紧张，让大脑自然接收信息</p>
        </div>
        <div class="tip-item">
          <div class="tip-icon">👁️</div>
          <h4>专注中心</h4>
          <p>视线集中在屏幕中央，用余光感知整体信息</p>
        </div>
        <div class="tip-item">
          <div class="tip-icon">🎯</div>
          <h4>循序渐进</h4>
          <p>从慢速开始，逐步提高闪现速度和难度</p>
        </div>
        <div class="tip-item">
          <div class="tip-icon">⏰</div>
          <h4>定期练习</h4>
          <p>每天坚持练习15-20分钟，效果更佳</p>
        </div>
      </div>
    </div>

    </div>

    <!-- 子路由内容 -->
    <router-view v-if="$route.path !== '/flash-training'" />
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
  '/flash-training/basic-flash': '基本闪视训练',
  '/flash-training/article-flash': '文章闪视训练',
  '/flash-training/image-flash': '图像闪视训练',
  '/flash-training/custom-word-flash': '自定义单词闪视',
  '/flash-training/custom-image-flash': '自定义图片闪视'
};

// 获取模块标题
const getModuleTitle = (path) => {
  return moduleTitles[path] || '闪视训练';
};

// 训练设置
const flashSpeed = ref('medium');
const trainingRounds = ref('10');
const difficultyLevel = ref('beginner');
const soundEnabled = ref(true);

// 统计数据
const overallProgress = ref(0);
const totalSessions = ref(0);
const averageAccuracy = ref(0);
const bestStreak = ref(0);
const totalTime = ref(0);

// 各模块统计
const basicFlashStats = ref({ completed: 0, bestScore: 0 });
const articleFlashStats = ref({ completed: 0, bestScore: 0 });
const imageFlashStats = ref({ completed: 0, bestScore: 0 });
const customWordStats = ref({ completed: 0, bestScore: 0 });
const customImageStats = ref({ completed: 0, bestScore: 0 });

// 导航到指定模块
const navigateTo = (moduleKey) => {
  // 保存当前设置
  saveSettings();
  router.push(`/flash-training/${moduleKey}`);
};

// 返回主视图
const goBack = () => {
  router.push('/flash-training');
};

// 保存设置
const saveSettings = () => {
  const settings = {
    flashSpeed: flashSpeed.value,
    trainingRounds: trainingRounds.value,
    difficultyLevel: difficultyLevel.value,
    soundEnabled: soundEnabled.value
  };
  localStorage.setItem('flashTrainingSettings', JSON.stringify(settings));
};

// 加载设置
const loadSettings = () => {
  const saved = localStorage.getItem('flashTrainingSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    flashSpeed.value = settings.flashSpeed || 'medium';
    trainingRounds.value = settings.trainingRounds || '10';
    difficultyLevel.value = settings.difficultyLevel || 'beginner';
    soundEnabled.value = settings.soundEnabled !== false;
  }
};

// 加载训练数据
const loadTrainingData = () => {
  // 从本地存储加载闪视训练数据
  const saved = localStorage.getItem('flashTrainingStats');
  if (saved) {
    const flashStats = JSON.parse(saved);
    overallProgress.value = flashStats.overallProgress || 0;
    totalSessions.value = flashStats.totalSessions || 0;
    averageAccuracy.value = flashStats.averageAccuracy || 0;
    bestStreak.value = flashStats.bestStreak || 0;
    totalTime.value = flashStats.totalTime || 0;
    
    // 加载各模块数据
    basicFlashStats.value = flashStats.basicFlash || { completed: 0, bestScore: 0 };
    articleFlashStats.value = flashStats.articleFlash || { completed: 0, bestScore: 0 };
    imageFlashStats.value = flashStats.imageFlash || { completed: 0, bestScore: 0 };
    customWordStats.value = flashStats.customWord || { completed: 0, bestScore: 0 };
    customImageStats.value = flashStats.customImage || { completed: 0, bestScore: 0 };
  } else {
    // 初始化默认数据
    overallProgress.value = 0;
    totalSessions.value = 0;
    averageAccuracy.value = 0;
    bestStreak.value = 0;
    totalTime.value = 0;
    basicFlashStats.value = { completed: 0, bestScore: 0 };
    articleFlashStats.value = { completed: 0, bestScore: 0 };
    imageFlashStats.value = { completed: 0, bestScore: 0 };
    customWordStats.value = { completed: 0, bestScore: 0 };
    customImageStats.value = { completed: 0, bestScore: 0 };
  }
};



onMounted(() => {
  loadSettings();
  loadTrainingData();
});
</script>

<style scoped>
.flash-training-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 面包屑导航样式 - 紧凑设计 */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  font-size: 0.875rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
}

.breadcrumb-item:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
}

.back-arrow {
  font-size: 0.9rem;
  font-weight: bold;
}

.breadcrumb-separator {
  color: #94a3b8;
  font-size: 0.9rem;
  opacity: 0.6;
  margin: 0 0.1rem;
}

.breadcrumb-current {
  color: #1e40af;
  font-weight: 600;
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 6px;
}

/* 模块内容样式 */
.module-content {
  min-height: 60vh;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  color: var(--color-primary);
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.page-description {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

.training-modules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.module-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  box-shadow: var(--shadow-md);
  border: 2px solid transparent;
}

.module-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.module-icon {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.module-card h3 {
  color: var(--color-primary);
  margin-bottom: 0.8rem;
  font-size: 1.2rem;
}

.module-card p {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.4;
  font-size: 0.95rem;
}

.module-level {
  background: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning);
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1rem;
}

.module-level.special {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(160, 82, 45, 0.1) 100%);
  color: #8b4513;
  border: 1px solid rgba(139, 69, 19, 0.2);
  position: relative;
  overflow: hidden;
}

.module-level.special::before {
  content: '✨';
  margin-right: 0.3rem;
}

.module-stats {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.module-stats span {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.training-settings {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.training-settings h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-item label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}

.setting-item select {
  padding: 0.8rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.9rem;
  transition: border-color var(--transition-normal);
}

.setting-item select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.toggle-switch {
  position: relative;
  display: inline-block;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  display: block;
  width: 50px;
  height: 24px;
  background: var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: background var(--transition-normal);
  position: relative;
}

.toggle-label::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: transform var(--transition-normal);
}

.toggle-switch input:checked + .toggle-label {
  background: var(--color-primary);
}

.toggle-switch input:checked + .toggle-label::after {
  transform: translateX(26px);
}

.progress-overview {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.progress-overview h3 {
  color: var(--color-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.progress-charts {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  align-items: center;
}

.chart-circle {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.chart-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.chart-circle circle {
  transition: stroke-dashoffset 1s ease;
}

.chart-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.percentage {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
}

.label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.training-tips {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.training-tips h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tip-item {
  text-align: center;
  padding: 1.5rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
}

.tip-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.tip-item h4 {
  color: var(--color-primary);
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.tip-item p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

@media (max-width: 768px) {
  .flash-training-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .training-modules {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .progress-charts {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .tips-grid {
    grid-template-columns: 1fr;
  }
}
</style>