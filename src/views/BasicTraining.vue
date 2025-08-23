<template>
  <div class="basic-training-container">
    <!-- 面包屑导航 -->
    <BreadcrumbDropdown 
      v-if="$route.path !== '/basic-training'"
      :main-title="'基础训练'"
      :main-path="'/basic-training'"
      :current-title="getModuleTitle($route.path)"
      :sibling-modules="siblingModules"
    />

    <!-- 主页面内容 -->
    <div v-if="$route.path === '/basic-training'">
      <div class="page-header">
        <h1>基础训练</h1>
        <p class="page-description">
          基础训练是全脑开发的核心阶段，通过系统性的视觉和认知训练，
          帮助孩子建立良好的学习基础，提升整体感知能力和注意力水平。
        </p>

      </div>



        <div class="training-modules">
        <div class="module-card" @click="navigateTo('overall-perception')">
          <div class="module-icon">👁️</div>
          <h3>整体感知训练</h3>
          <p>训练大脑快速捕捉和处理整体信息的能力</p>
          <div class="module-level">难度：⭐</div>
        </div>

        <div class="module-card" @click="navigateTo('expand-vision')">
          <div class="module-icon">🔍</div>
          <h3>扩大视野训练</h3>
          <p>通过专门练习扩大视觉范围，提高信息获取效率</p>
          <div class="module-level">难度：⭐⭐</div>
        </div>

        <div class="module-card" @click="navigateTo('reading-rhythm')">
          <div class="module-icon">📖</div>
          <h3>视读节奏训练</h3>
          <p>建立良好的阅读节奏，提高阅读效率和理解力</p>
          <div class="module-level">难度：⭐⭐</div>
        </div>

        <div class="module-card" @click="navigateTo('fluency')">
          <div class="module-icon">💫</div>
          <h3>流畅度训练</h3>
          <p>提高思维和表达的流畅性，增强语言组织能力</p>
          <div class="module-level">难度：⭐⭐⭐</div>
        </div>

        <div class="module-card" @click="navigateTo('attention')">
          <div class="module-icon">🎯</div>
          <h3>注意力训练</h3>
          <p>通过多种练习提高专注力和注意力持续时间</p>
          <div class="module-level">难度：⭐⭐</div>
        </div>

        <div class="module-card" @click="navigateTo('schulte')">
          <div class="module-icon">🔢</div>
          <h3>舒尔特表训练</h3>
          <p>经典的注意力和视觉搜索能力训练工具</p>
          <div class="module-level">难度：⭐⭐⭐</div>
        </div>

        <div class="module-card" @click="navigateTo('ultra-high-speed-flash')">
          <div class="module-icon">⚫</div>
          <h3>超高速闪记训练</h3>
          <p>通过快速数点训练，提升数字感知和计算能力</p>
          <div class="module-level">难度：⭐⭐</div>
        </div>
      </div>

      <div class="training-path">
        <h3>建议训练路径</h3>
        <div class="path-steps">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>整体感知</h4>
              <p>建立基础感知能力</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>扩大视野</h4>
              <p>提升视觉范围</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>注意力训练</h4>
              <p>强化专注能力</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>舒尔特表</h4>
              <p>综合能力提升</p>
            </div>
          </div>
        </div>
      </div>

      <div class="progress-section">
        <h3>训练统计</h3>
        <div class="progress-grid">
          <div class="progress-item">
            <div class="progress-circle">
              <span>{{ Math.round(overallProgress) }}%</span>
            </div>
            <p>总体进度</p>
          </div>
          <div class="progress-item">
            <div class="progress-circle">
              <span>{{ completedSessions }}</span>
            </div>
            <p>完成训练</p>
          </div>
          <div class="progress-item">
            <div class="progress-circle">
              <span>{{ averageScore }}</span>
            </div>
            <p>平均得分</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 子路由内容 -->
    <router-view v-if="$route.path !== '/basic-training'" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTrainingStore } from '../stores';
import BreadcrumbDropdown from '../components/BreadcrumbDropdown.vue';

const router = useRouter();
const route = useRoute();
const trainingStore = useTrainingStore();

// 模块标题映射
const moduleTitles = {
  '/basic-training/overall-perception': '整体感知训练',
  '/basic-training/expand-vision': '扩大视野训练',
  '/basic-training/reading-rhythm': '视读节奏训练',
  '/basic-training/fluency': '流畅度训练',
  '/basic-training/attention': '注意力训练',
  '/basic-training/schulte': '舒尔特表训练',
  '/basic-training/ultra-high-speed-flash': '超高速闪记训练'
};

// 同级模块列表
const siblingModules = [
  { path: '/basic-training/overall-perception', title: '整体感知训练' },
  { path: '/basic-training/expand-vision', title: '扩大视野训练' },
  { path: '/basic-training/reading-rhythm', title: '视读节奏训练' },
  { path: '/basic-training/fluency', title: '流畅度训练' },
  { path: '/basic-training/attention', title: '注意力训练' },
  { path: '/basic-training/schulte', title: '舒尔特表训练' },
  { path: '/basic-training/ultra-high-speed-flash', title: '超高速闪记训练' }
];

// 获取模块标题
const getModuleTitle = (path) => {
  return moduleTitles[path] || '基础训练';
};

// 训练统计数据
const overallProgress = ref(0);
const completedSessions = ref(0);
const averageScore = ref(0);

// 导航到指定模块
const navigateTo = (moduleKey) => {
  router.push(`/basic-training/${moduleKey}`);
};

// 返回主视图
const goBack = () => {
  router.push('/basic-training');
};

// 加载训练数据
const loadTrainingData = () => {
  // 使用现有的训练统计数据
  overallProgress.value = trainingStore.schulteStats?.averageAccuracy || 0;
  completedSessions.value = trainingStore.totalSessions || 0;
  averageScore.value = trainingStore.schulteStats?.bestTime ? Math.round(100 - trainingStore.schulteStats.bestTime / 10) : 0;
};



onMounted(() => {
  loadTrainingData();
});
</script>

<style scoped>
.basic-training-container {
  max-width: 1500px;
  margin: 0 auto;
  padding: 2rem;
  width: 90%;
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
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.module-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
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
}

.training-path {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.training-path h3 {
  color: var(--color-primary);
  text-align: center;
  margin-bottom: 2rem;
}

.path-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  padding: 1rem;
  border-radius: 8px;
  min-width: 150px;
}

.step-number {
  width: 30px;
  height: 30px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 0.3rem 0;
  color: var(--color-primary);
  font-size: 0.95rem;
}

.step-content p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.step-arrow {
  color: var(--color-primary);
  font-size: 1.5rem;
  font-weight: bold;
}

.progress-section {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.progress-section h3 {
  color: var(--color-primary);
  text-align: center;
  margin-bottom: 2rem;
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
}

.progress-item {
  text-align: center;
}

.progress-circle {
  width: 80px;
  height: 80px;
  border: 4px solid var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-weight: 600;
  color: var(--color-primary);
  font-size: 1.1rem;
}

.progress-item p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 0.9rem;
}

/* 面包屑导航样式 - 菜单栏下方小字显示 */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.breadcrumb-item {
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 400;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-item:hover {
  color: var(--color-primary);
}

.breadcrumb-separator {
  color: #666;
  font-size: 0.8rem;
  margin: 0;
}

.breadcrumb-current {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.8rem;
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

@media (max-width: 768px) {
  .basic-training-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .training-modules {
    grid-template-columns: 1fr;
  }
  
  .path-steps {
    flex-direction: column;
  }
  
  .step-arrow {
    transform: rotate(90deg);
  }
  
  .step-item {
    min-width: auto;
    width: 100%;
  }
  
  .breadcrumb-nav {
    font-size: 0.75rem;
  }
  
  .breadcrumb-item {
    font-size: 0.75rem;
  }
  
  .breadcrumb-current {
    font-size: 0.75rem;
  }
}
</style>