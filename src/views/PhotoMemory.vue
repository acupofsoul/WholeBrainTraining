<template>
  <div class="photo-memory-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-nav" v-if="$route.path !== '/photographic-memory'">
      <button class="back-btn" @click="goBack">
        <span class="back-arrow">←</span>
        返回
      </button>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item">照相记忆训练</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">{{ getModuleTitle($route.path) }}</span>
    </div>

    <!-- 主页面内容 -->
    <div v-if="$route.path === '/photographic-memory'">
      <div class="page-header">
        <h1>照相记忆训练</h1>
        <p class="page-description">
          照相记忆是七田真全脑开发的核心能力之一，通过系统训练开发右脑的图像记忆功能，
          让大脑能够像照相机一样瞬间记录和回忆复杂的视觉信息。
        </p>
      </div>

    <div class="training-modules">
      <div class="module-card" @click="navigateTo('afterimage')">
        <div class="module-icon">👁️‍🗨️</div>
        <h3>残像训练</h3>
        <p>通过凝视特定图像后闭眼观察残像，训练视觉记忆的基础能力</p>
        <div class="module-level">难度：⭐</div>
        <div class="module-stats">
          <span>完成次数：{{ afterimageStats.completed }}次</span>
          <span>平均持续时间：{{ afterimageStats.averageDuration }}秒</span>
        </div>
      </div>

      <div class="module-card" @click="navigateTo('color-perception')">
        <div class="module-icon">🌈</div>
        <h3>颜色感知训练</h3>
        <p>提升对颜色的敏感度和记忆能力，为复杂图像记忆打下基础</p>
        <div class="module-level">难度：⭐⭐</div>
        <div class="module-stats">
          <span>识别准确率：{{ colorStats.accuracy }}%</span>
          <span>完成训练：{{ colorStats.completed }}次</span>
        </div>
      </div>

      <div class="module-card" @click="navigateTo('3d-cards')">
        <div class="module-icon">🃏</div>
        <h3>3D卡片训练</h3>
        <p>通过立体卡片的记忆训练，提升空间记忆和图像处理能力</p>
        <div class="module-level">难度：⭐⭐⭐</div>
        <div class="module-stats">
          <span>记忆准确率：{{ cardStats.accuracy }}%</span>
          <span>最佳记录：{{ cardStats.bestScore }}张</span>
        </div>
      </div>

      <div class="module-card" @click="navigateTo('thousand-images')">
        <div class="module-icon">🖼️</div>
        <h3>1000图训练</h3>
        <p>大量图像的快速记忆训练，全面提升图像记忆容量和速度</p>
        <div class="module-level">难度：⭐⭐⭐⭐</div>
        <div class="module-stats">
          <span>已记忆：{{ imageStats.memorized }}张</span>
          <span>识别率：{{ imageStats.recognition }}%</span>
        </div>
      </div>

      <div class="module-card" @click="navigateTo('memory-training')">
        <div class="module-icon">🧠</div>
        <h3>记忆训练</h3>
        <p>综合性的记忆能力训练，包括数字、文字、图像等多种记忆类型</p>
        <div class="module-level">难度：⭐⭐⭐</div>
        <div class="module-stats">
          <span>综合得分：{{ memoryStats.overallScore }}分</span>
          <span>完成项目：{{ memoryStats.completed }}个</span>
        </div>
      </div>

      <div class="module-card" @click="navigateTo('instant-calculation')">
        <div class="module-icon">🔢</div>
        <h3>瞬时计算</h3>
        <p>结合视觉记忆的快速计算训练，提升数字处理和运算能力</p>
        <div class="module-level">难度：⭐⭐⭐⭐</div>
        <div class="module-stats">
          <span>计算速度：{{ calcStats.speed }}题/分</span>
          <span>准确率：{{ calcStats.accuracy }}%</span>
        </div>
      </div>

      <div class="module-card progress-card" @click="navigateTo('progress')">
        <div class="module-icon">📊</div>
        <h3>训练进度分析</h3>
        <p>查看详细的训练统计、进度分析和个性化建议，全面了解训练效果</p>
        <div class="module-level special">功能：📈 数据分析</div>
        <div class="module-stats">
          <span>总训练时长：{{ totalTime }}分钟</span>
          <span>平均准确率：{{ averageAccuracy }}%</span>
        </div>
      </div>
    </div>

    <div class="training-progress">
      <h3>训练进度总览</h3>
      <div class="progress-grid">
        <div class="progress-item">
          <div class="progress-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" stroke-width="6"/>
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="var(--color-primary)" 
                stroke-width="6"
                stroke-dasharray="283"
                :stroke-dashoffset="283 - (283 * overallProgress / 100)"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div class="progress-text">
              <span class="percentage">{{ Math.round(overallProgress) }}%</span>
              <span class="label">总体进度</span>
            </div>
          </div>
        </div>
        
        <div class="stats-summary">
          <div class="stat-row">
            <div class="stat-item">
              <div class="stat-number">{{ totalSessions }}</div>
              <div class="stat-label">总训练次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ totalTime }}min</div>
              <div class="stat-label">累计训练时间</div>
            </div>
          </div>
          <div class="stat-row">
            <div class="stat-item">
              <div class="stat-number">{{ averageAccuracy }}%</div>
              <div class="stat-label">平均准确率</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ memoryCapacity }}</div>
              <div class="stat-label">记忆容量</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="training-levels">
      <h3>训练等级系统</h3>
      <div class="levels-grid">
        <div class="level-card" :class="{ active: currentLevel >= 1 }">
          <div class="level-badge">Lv.1</div>
          <h4>初学者</h4>
          <p>掌握基础残像和颜色感知</p>
          <div class="level-requirements">
            <span>✓ 残像训练 10次</span>
            <span>✓ 颜色识别 80%准确率</span>
          </div>
        </div>
        
        <div class="level-card" :class="{ active: currentLevel >= 2 }">
          <div class="level-badge">Lv.2</div>
          <h4>进阶者</h4>
          <p>能够进行3D卡片记忆</p>
          <div class="level-requirements">
            <span>✓ 3D卡片 5张连续正确</span>
            <span>✓ 记忆训练 70分以上</span>
          </div>
        </div>
        
        <div class="level-card" :class="{ active: currentLevel >= 3 }">
          <div class="level-badge">Lv.3</div>
          <h4>熟练者</h4>
          <p>掌握大量图像记忆技巧</p>
          <div class="level-requirements">
            <span>✓ 1000图训练 100张</span>
            <span>✓ 瞬时计算 20题/分</span>
          </div>
        </div>
        
        <div class="level-card" :class="{ active: currentLevel >= 4 }">
          <div class="level-badge">Lv.4</div>
          <h4>专家</h4>
          <p>具备照相记忆能力</p>
          <div class="level-requirements">
            <span>✓ 综合测试 90分以上</span>
            <span>✓ 所有模块精通</span>
          </div>
        </div>
      </div>
    </div>

    <div class="memory-techniques">
      <h3>记忆技巧指导</h3>
      <div class="techniques-grid">
        <div class="technique-item">
          <div class="technique-icon">🎯</div>
          <h4>专注凝视</h4>
          <p>训练时保持专注，凝视图像中心点，用余光感知整体信息，避免眼球快速移动。</p>
        </div>
        
        <div class="technique-item">
          <div class="technique-icon">🧘</div>
          <h4>放松状态</h4>
          <p>保持身心放松，深呼吸，让大脑处于α波状态，这是右脑记忆的最佳状态。</p>
        </div>
        
        <div class="technique-item">
          <div class="technique-icon">🔄</div>
          <h4>重复练习</h4>
          <p>每天坚持练习，从简单到复杂，循序渐进地提升记忆能力和持续时间。</p>
        </div>
        
        <div class="technique-item">
          <div class="technique-icon">🌟</div>
          <h4>想象联想</h4>
          <p>将抽象信息转化为生动的图像，运用联想和想象力增强记忆效果。</p>
        </div>
      </div>
    </div>
    </div>

    <!-- 子路由内容 -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTrainingStore } from '../stores';

import photoMemoryStorage from '../services/photoMemoryStorage.js';

const router = useRouter();
const route = useRoute();
const trainingStore = useTrainingStore();

// 各模块统计数据
const afterimageStats = ref({ completed: 0, averageDuration: 0 });
const colorStats = ref({ accuracy: 0, completed: 0 });
const cardStats = ref({ accuracy: 0, bestScore: 0 });
const imageStats = ref({ memorized: 0, recognition: 0 });
const memoryStats = ref({ overallScore: 0, completed: 0 });
const calcStats = ref({ speed: 0, accuracy: 0 });

// 总体统计
const overallProgress = ref(0);
const totalSessions = ref(0);
const totalTime = ref(0);
const averageAccuracy = ref(0);
const memoryCapacity = ref(0);
const currentLevel = ref(1);

// 模块标题映射
const moduleTitles = {
  '/photographic-memory/afterimage': '残像训练',
  '/photographic-memory/color-perception': '颜色感知训练',
  '/photographic-memory/3d-cards': '3D卡片训练',
  '/photographic-memory/thousand-images': '1000图训练',
  '/photographic-memory/memory-training': '记忆训练',
  '/photographic-memory/instant-calculation': '瞬时计算',
  '/photographic-memory/progress': '训练进度分析'
};

// 导航到指定模块
const navigateTo = (module) => {
  router.push(`/photographic-memory/${module}`);
};

// 返回主页面
const goBack = () => {
  router.push('/photographic-memory');
};

// 获取模块标题
const getModuleTitle = (path) => {
  return moduleTitles[path] || '';
};

// 计算当前等级
const calculateLevel = () => {
  let level = 1;
  
  // Lv.2 条件
  if (afterimageStats.value.completed >= 10 && colorStats.value.accuracy >= 80) {
    level = 2;
  }
  
  // Lv.3 条件
  if (level >= 2 && cardStats.value.bestScore >= 5 && memoryStats.value.overallScore >= 70) {
    level = 3;
  }
  
  // Lv.4 条件
  if (level >= 3 && imageStats.value.memorized >= 100 && calcStats.value.speed >= 20) {
    level = 4;
  }
  
  // 专家级条件
  if (level >= 4 && memoryStats.value.overallScore >= 90 && averageAccuracy.value >= 85) {
    level = 4;
  }
  
  currentLevel.value = level;
};

// 加载训练数据
const loadTrainingData = () => {
  // 从本地存储加载照相记忆训练数据
  const saved = localStorage.getItem('photoMemoryStats');
  let photoData = {};
  
  if (saved) {
    photoData = JSON.parse(saved);
  }
  
  // 各模块数据
  afterimageStats.value = {
    completed: photoData.afterimage?.totalSessions || 0,
    averageDuration: photoData.afterimage?.averageGazeDuration || 0
  };
  
  colorStats.value = {
    accuracy: photoData.colorPerception?.averageAccuracy || 0,
    completed: photoData.colorPerception?.totalSessions || 0
  };
  
  cardStats.value = {
    accuracy: photoData.threeDCards?.averageAccuracy || 0,
    bestScore: photoData.threeDCards?.bestScore || 0
  };
  
  imageStats.value = {
    memorized: photoData.thousandImages?.totalImagesMemorized || 0,
    recognition: photoData.thousandImages?.averageAccuracy || 0
  };
  
  memoryStats.value = {
    overallScore: photoData.memoryTraining?.averageScore || 0,
    completed: photoData.memoryTraining?.totalSessions || 0
  };
  
  calcStats.value = {
    speed: photoData.instantCalculation?.averageSpeed || 0,
    accuracy: photoData.instantCalculation?.averageAccuracy || 0
  };
  
  // 总体统计
  overallProgress.value = photoData.overall?.overallProgress || 0;
  totalSessions.value = photoData.overall?.totalSessions || 0;
  totalTime.value = Math.round((photoData.overall?.totalTrainingTime || 0) / 60); // 转换为分钟
  averageAccuracy.value = photoData.overall?.averageAccuracy || 0;
  memoryCapacity.value = photoData.overall?.memoryCapacity || 0;
  
  // 计算等级
  calculateLevel();
};

onMounted(() => {
  loadTrainingData();
});
</script>

<style scoped>
.photo-memory-container {
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

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
}

.back-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.back-btn:hover::before {
  left: 100%;
}

.back-btn:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.back-btn:active {
  transform: translateY(0);
}

.back-arrow {
  font-size: 1.2rem;
  font-weight: bold;
}

.breadcrumb-separator {
  color: #94a3b8;
  font-size: 1.2rem;
  font-weight: 300;
  opacity: 0.7;
  margin: 0;
}

.breadcrumb-item {
  color: #64748b;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.breadcrumb-item:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
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

/* 模块内容样式 */
.module-content {
  min-height: 400px;
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
  background: rgba(var(--color-info-rgb), 0.1);
  color: var(--color-info);
}

.progress-card {
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05), rgba(var(--color-info-rgb), 0.05));
  border: 2px solid rgba(var(--color-primary-rgb), 0.2);
}

.progress-card:hover {
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1), rgba(var(--color-info-rgb), 0.1));
  border-color: var(--color-primary);
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

.training-progress {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.training-progress h3 {
  color: var(--color-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.progress-grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  align-items: center;
}

.progress-circle {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.progress-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-circle circle {
  transition: stroke-dashoffset 1s ease;
}

.progress-text {
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

.stats-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.3rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.training-levels {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.training-levels h3 {
  color: var(--color-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.level-card {
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  background: rgba(var(--color-text-secondary), 0.1);
  border: 2px solid transparent;
  transition: all var(--transition-normal);
}

.level-card.active {
  background: rgba(var(--color-primary-rgb), 0.1);
  border-color: var(--color-primary);
}

.level-badge {
  display: inline-block;
  background: var(--color-primary);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.level-card h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.level-card p {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.level-requirements {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.level-requirements span {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: left;
}

.memory-techniques {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.memory-techniques h3 {
  color: var(--color-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.techniques-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.technique-item {
  padding: 1.5rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
  text-align: center;
}

.technique-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.technique-item h4 {
  color: var(--color-primary);
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.technique-item p {
  color: var(--color-text-secondary);
  line-height: 1.4;
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 768px) {
  .photo-memory-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .training-modules {
    grid-template-columns: 1fr;
  }
  
  .progress-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .stat-row {
    grid-template-columns: 1fr;
  }
  
  .levels-grid {
    grid-template-columns: 1fr;
  }
  
  .techniques-grid {
    grid-template-columns: 1fr;
  }
}
</style>