<template>
  <div class="ability-assessment-container">
    <!-- 面包屑导航 -->
    <BreadcrumbDropdown 
      v-if="$route.path !== '/ability-assessment' && $route.path !== '/abilities'"
      :main-title="'能力测评'"
      :main-path="'/ability-assessment'"
      :current-title="getModuleTitle($route.path)"
      :sibling-modules="siblingModules"
    />

    <!-- 主页面内容 -->
    <div v-if="$route.path === '/ability-assessment' || $route.path === '/abilities'">
      <div class="page-header">
        <h1>能力测评</h1>
        <p class="page-description">
          能力测评是全脑开发训练的重要环节，通过科学的测试方法全面评估各项认知能力，
          为个性化训练提供数据支持，帮助了解自己的优势和需要改进的方面。
        </p>
      </div>

    <div class="assessment-modules">
      <div class="module-card" @click="navigateTo('comprehensive')">
        <div class="module-icon">🎯</div>
        <h3>综合能力测评</h3>
        <p>全面评估认知能力、学习能力和思维能力的综合测试</p>
        <div class="module-level">时长：30分钟</div>
        <div class="module-stats">
          <div class="stat-item">
            <span class="stat-label">最近得分：</span>
            <span class="stat-value">{{ comprehensiveStats.latestScore }}分</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">测试次数：</span>
            <span class="stat-value">{{ comprehensiveStats.testCount }}次</span>
          </div>
        </div>
      </div>

      <div class="module-card" @click="navigateTo('spatial')">
        <div class="module-icon">🔮</div>
        <h3>空间能力测评</h3>
        <p>评估空间想象、立体思维和几何认知能力</p>
        <div class="module-level">时长：20分钟</div>
        <div class="module-stats">
          <div class="stat-item">
            <span class="stat-label">空间指数：</span>
            <span class="stat-value">{{ spatialStats.spatialIndex }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">准确率：</span>
            <span class="stat-value">{{ spatialStats.accuracy }}%</span>
          </div>
        </div>
      </div>

      <div class="module-card" @click="navigateTo('observation')">
        <div class="module-icon">👁️</div>
        <h3>观察能力测评</h3>
        <p>测试视觉注意力、细节识别和信息捕捉能力</p>
        <div class="module-level">时长：15分钟</div>
        <div class="module-stats">
          <div class="stat-item">
            <span class="stat-label">观察敏锐度：</span>
            <span class="stat-value">{{ observationStats.acuity }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">反应速度：</span>
            <span class="stat-value">{{ observationStats.reactionTime }}ms</span>
          </div>
        </div>
      </div>

      <div class="module-card" @click="navigateTo('calculation')">
        <div class="module-icon">🔢</div>
        <h3>计算能力测评</h3>
        <p>评估数学运算、逻辑推理和数字处理能力</p>
        <div class="module-level">时长：25分钟</div>
        <div class="module-stats">
          <div class="stat-item">
            <span class="stat-label">计算速度：</span>
            <span class="stat-value">{{ calculationStats.speed }}题/分</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">正确率：</span>
            <span class="stat-value">{{ calculationStats.accuracy }}%</span>
          </div>
        </div>
      </div>

      <div class="module-card" @click="navigateTo('memory')">
        <div class="module-icon">🧠</div>
        <h3>记忆能力测评</h3>
        <p>测试短期记忆、长期记忆和工作记忆能力</p>
        <div class="module-level">时长：20分钟</div>
        <div class="module-stats">
          <div class="stat-item">
            <span class="stat-label">记忆容量：</span>
            <span class="stat-value">{{ memoryStats.capacity }}项</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">保持率：</span>
            <span class="stat-value">{{ memoryStats.retention }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="ability-radar">
      <h3>能力雷达图</h3>
      <div class="radar-container">
        <div class="radar-chart">
          <svg viewBox="0 0 300 300" class="radar-svg">
            <!-- 背景网格 -->
            <g class="radar-grid">
              <polygon 
                v-for="level in 5" 
                :key="level"
                :points="getPolygonPoints(level * 20)"
                fill="none" 
                stroke="#e0e0e0" 
                stroke-width="1"
              />
              <!-- 轴线 -->
              <line v-for="(ability, index) in abilities" 
                :key="index"
                x1="150" y1="150" 
                :x2="getAxisEndX(index)" 
                :y2="getAxisEndY(index)"
                stroke="#e0e0e0" 
                stroke-width="1"
              />
            </g>
            
            <!-- 数据多边形 -->
            <polygon 
              :points="getDataPolygonPoints()"
              fill="rgba(var(--color-primary-rgb), 0.3)" 
              stroke="var(--color-primary)" 
              stroke-width="2"
            />
            
            <!-- 数据点 -->
            <circle 
              v-for="(ability, index) in abilities" 
              :key="index"
              :cx="getDataPointX(index, ability.score)"
              :cy="getDataPointY(index, ability.score)"
              r="4" 
              fill="var(--color-primary)"
            />
            
            <!-- 标签 -->
            <text 
              v-for="(ability, index) in abilities" 
              :key="index"
              :x="getLabelX(index)"
              :y="getLabelY(index)"
              text-anchor="middle"
              dominant-baseline="middle"
              class="radar-label"
            >
              {{ ability.name }}
            </text>
          </svg>
        </div>
        
        <div class="radar-legend">
          <h4>能力评分</h4>
          <div class="legend-items">
            <div v-for="ability in abilities" :key="ability.name" class="legend-item">
              <span class="legend-color"></span>
              <span class="legend-name">{{ ability.name }}</span>
              <span class="legend-score">{{ ability.score }}分</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="assessment-history">
      <h3>测评历史</h3>
      <div class="history-chart">
        <div class="chart-header">
          <h4>能力发展趋势</h4>
          <div class="chart-controls">
            <select v-model="selectedPeriod">
              <option value="week">最近一周</option>
              <option value="month">最近一月</option>
              <option value="quarter">最近三月</option>
            </select>
          </div>
        </div>
        
        <div class="trend-chart">
          <div class="chart-grid">
            <div v-for="i in 5" :key="i" class="grid-line" :style="{ bottom: (i * 20) + '%' }">
              <span class="grid-label">{{ i * 20 }}</span>
            </div>
          </div>
          
          <div class="chart-lines">
            <svg class="trend-svg" viewBox="0 0 400 200">
              <polyline 
                v-for="(trend, index) in trendData" 
                :key="index"
                :points="getTrendPoints(trend.data)"
                fill="none" 
                :stroke="trend.color" 
                stroke-width="2"
              />
            </svg>
          </div>
        </div>
        
        <div class="chart-legend">
          <div v-for="trend in trendData" :key="trend.name" class="trend-legend-item">
            <span class="trend-color" :style="{ backgroundColor: trend.color }"></span>
            <span>{{ trend.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="improvement-suggestions">
      <h3>改进建议</h3>
      <div class="suggestions-grid">
        <div v-for="suggestion in improvementSuggestions" :key="suggestion.area" class="suggestion-card">
          <div class="suggestion-header">
            <div class="suggestion-icon">{{ suggestion.icon }}</div>
            <h4>{{ suggestion.area }}</h4>
            <div class="suggestion-priority" :class="suggestion.priority">
              {{ getPriorityText(suggestion.priority) }}
            </div>
          </div>
          
          <p class="suggestion-description">{{ suggestion.description }}</p>
          
          <div class="suggestion-actions">
            <h5>推荐训练：</h5>
            <ul>
              <li v-for="action in suggestion.actions" :key="action">{{ action }}</li>
            </ul>
          </div>
          
          <button class="start-training-btn" @click="startTraining(suggestion.trainingPath)">
            开始训练
          </button>
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
import BreadcrumbDropdown from '../components/BreadcrumbDropdown.vue';



const router = useRouter();
const route = useRoute();
const trainingStore = useTrainingStore();

// 同级模块列表
const siblingModules = [
  { path: '/ability-assessment/comprehensive', title: '综合能力测评' },
  { path: '/ability-assessment/spatial', title: '空间能力测评' },
  { path: '/ability-assessment/observation', title: '观察能力测评' },
  { path: '/ability-assessment/calculation', title: '计算能力测评' },
  { path: '/ability-assessment/memory', title: '记忆能力测评' }
];

// 各模块统计数据
const comprehensiveStats = ref({ latestScore: 0, testCount: 0 });
const spatialStats = ref({ spatialIndex: 0, accuracy: 0 });
const observationStats = ref({ acuity: 0, reactionTime: 0 });
const calculationStats = ref({ speed: 0, accuracy: 0 });
const memoryStats = ref({ capacity: 0, retention: 0 });

// 能力雷达图数据
const abilities = ref([
  { name: '综合能力', score: 0 },
  { name: '空间能力', score: 0 },
  { name: '观察能力', score: 0 },
  { name: '计算能力', score: 0 },
  { name: '记忆能力', score: 0 }
]);

// 趋势图数据
const selectedPeriod = ref('month');
const trendData = ref([
  { name: '综合能力', color: '#3b82f6', data: [] },
  { name: '空间能力', color: '#10b981', data: [] },
  { name: '观察能力', color: '#f59e0b', data: [] },
  { name: '计算能力', color: '#ef4444', data: [] },
  { name: '记忆能力', color: '#8b5cf6', data: [] }
]);

// 改进建议
const improvementSuggestions = ref([]);

// 模块标题映射
const moduleTitles = {
  '/ability-assessment/comprehensive': '综合能力测评',
  '/ability-assessment/spatial': '空间能力测评',
  '/ability-assessment/observation': '观察能力测评',
  '/ability-assessment/calculation': '计算能力测评',
  '/ability-assessment/memory': '记忆能力测评'
};

// 导航到指定模块
const navigateTo = (module) => {
  router.push(`/ability-assessment/${module}`);
};

// 返回主页面
const goBack = () => {
  router.push('/ability-assessment');
};

// 获取模块标题
const getModuleTitle = (path) => {
  return moduleTitles[path] || '';
};

// 开始训练
const startTraining = (path) => {
  router.push(path);
};

// 获取优先级文本
const getPriorityText = (priority) => {
  const priorityMap = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  };
  return priorityMap[priority] || '中优先级';
};

// 雷达图相关计算函数
const getPolygonPoints = (radius) => {
  const points = [];
  const angleStep = (2 * Math.PI) / 5;
  for (let i = 0; i < 5; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = 150 + radius * Math.cos(angle);
    const y = 150 + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
};

const getAxisEndX = (index) => {
  const angle = index * (2 * Math.PI) / 5 - Math.PI / 2;
  return 150 + 100 * Math.cos(angle);
};

const getAxisEndY = (index) => {
  const angle = index * (2 * Math.PI) / 5 - Math.PI / 2;
  return 150 + 100 * Math.sin(angle);
};

const getDataPolygonPoints = () => {
  const points = [];
  const angleStep = (2 * Math.PI) / 5;
  abilities.value.forEach((ability, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const radius = ability.score;
    const x = 150 + radius * Math.cos(angle);
    const y = 150 + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  });
  return points.join(' ');
};

const getDataPointX = (index, score) => {
  const angle = index * (2 * Math.PI) / 5 - Math.PI / 2;
  return 150 + score * Math.cos(angle);
};

const getDataPointY = (index, score) => {
  const angle = index * (2 * Math.PI) / 5 - Math.PI / 2;
  return 150 + score * Math.sin(angle);
};

const getLabelX = (index) => {
  const angle = index * (2 * Math.PI) / 5 - Math.PI / 2;
  return 150 + 120 * Math.cos(angle);
};

const getLabelY = (index) => {
  const angle = index * (2 * Math.PI) / 5 - Math.PI / 2;
  return 150 + 120 * Math.sin(angle);
};

// 趋势图点计算
const getTrendPoints = (data) => {
  const points = [];
  data.forEach((value, index) => {
    const x = (index / (data.length - 1)) * 400;
    const y = 200 - (value / 100) * 200;
    points.push(`${x},${y}`);
  });
  return points.join(' ');
};

// 生成改进建议
const generateSuggestions = () => {
  const suggestions = [];
  
  abilities.value.forEach(ability => {
    if (ability.score < 60) {
      let suggestion = {
        area: ability.name,
        priority: 'high',
        icon: getAbilityIcon(ability.name),
        description: `您的${ability.name}得分较低，建议加强相关训练。`,
        actions: getTrainingActions(ability.name),
        trainingPath: getTrainingPath(ability.name)
      };
      suggestions.push(suggestion);
    } else if (ability.score < 80) {
      let suggestion = {
        area: ability.name,
        priority: 'medium',
        icon: getAbilityIcon(ability.name),
        description: `您的${ability.name}有提升空间，可以进行针对性训练。`,
        actions: getTrainingActions(ability.name),
        trainingPath: getTrainingPath(ability.name)
      };
      suggestions.push(suggestion);
    }
  });
  
  improvementSuggestions.value = suggestions;
};

const getAbilityIcon = (abilityName) => {
  const iconMap = {
    '综合能力': '🎯',
    '空间能力': '🔮',
    '观察能力': '👁️',
    '计算能力': '🔢',
    '记忆能力': '🧠'
  };
  return iconMap[abilityName] || '📊';
};

const getTrainingActions = (abilityName) => {
  const actionsMap = {
    '综合能力': ['多元化训练', '综合测试练习', '跨领域思维训练'],
    '空间能力': ['3D图形训练', '立体几何练习', '空间想象训练'],
    '观察能力': ['细节识别训练', '视觉搜索练习', '注意力集中训练'],
    '计算能力': ['数学运算练习', '逻辑推理训练', '速算技巧学习'],
    '记忆能力': ['记忆宫殿法', '联想记忆训练', '重复记忆练习']
  };
  return actionsMap[abilityName] || ['基础训练'];
};

const getTrainingPath = (abilityName) => {
  const pathMap = {
    '综合能力': '/ability-assessment/comprehensive',
    '空间能力': '/ability-assessment/spatial',
    '观察能力': '/ability-assessment/observation',
    '计算能力': '/ability-assessment/calculation',
    '记忆能力': '/ability-assessment/memory'
  };
  return pathMap[abilityName] || '/ability-assessment';
};

// 生成模拟趋势数据
const generateTrendData = () => {
  trendData.value.forEach(trend => {
    trend.data = [];
    let baseValue = 50 + Math.random() * 30;
    for (let i = 0; i < 10; i++) {
      baseValue += (Math.random() - 0.5) * 10;
      baseValue = Math.max(0, Math.min(100, baseValue));
      trend.data.push(Math.round(baseValue));
    }
  });
};

// 加载测评数据
const loadAssessmentData = () => {
  // 从本地存储加载能力测评数据
  const saved = localStorage.getItem('abilityAssessmentStats');
  let assessmentStats = {};
  
  if (saved) {
    assessmentStats = JSON.parse(saved);
  }
  
  // 各模块数据
  comprehensiveStats.value = {
    latestScore: assessmentStats.comprehensive?.latestScore || 0,
    testCount: assessmentStats.comprehensive?.testCount || 0
  };
  
  spatialStats.value = {
    spatialIndex: assessmentStats.spatial?.spatialIndex || 0,
    accuracy: assessmentStats.spatial?.accuracy || 0
  };
  
  observationStats.value = {
    acuity: assessmentStats.observation?.acuity || 0,
    reactionTime: assessmentStats.observation?.reactionTime || 0
  };
  
  calculationStats.value = {
    speed: assessmentStats.calculation?.speed || 0,
    accuracy: assessmentStats.calculation?.accuracy || 0
  };
  
  memoryStats.value = {
    capacity: assessmentStats.memory?.capacity || 0,
    retention: assessmentStats.memory?.retention || 0
  };
  
  // 更新雷达图数据
  abilities.value = [
    { name: '综合能力', score: comprehensiveStats.value.latestScore || 50 },
    { name: '空间能力', score: spatialStats.value.spatialIndex || 45 },
    { name: '观察能力', score: observationStats.value.acuity || 60 },
    { name: '计算能力', score: calculationStats.value.accuracy || 55 },
    { name: '记忆能力', score: memoryStats.value.retention || 65 }
  ];
  
  // 生成趋势数据和建议
  generateTrendData();
  generateSuggestions();
};

onMounted(() => {
  loadAssessmentData();
});
</script>

<style scoped>
.ability-assessment-container {
  max-width: 1500px;
  width: 90%;
  margin: 0 auto;
  padding: 2rem;
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

.assessment-modules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
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
  background: rgba(var(--color-info-rgb), 0.1);
  color: var(--color-info);
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1rem;
}

.module-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.stat-label {
  color: var(--color-text-secondary);
}

.stat-value {
  color: var(--color-primary);
  font-weight: 600;
}

.ability-radar {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.ability-radar h3 {
  color: var(--color-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.radar-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: center;
}

.radar-chart {
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

.radar-svg {
  width: 100%;
  height: 100%;
}

.radar-label {
  font-size: 12px;
  fill: var(--color-text);
  font-weight: 600;
}

.radar-legend h4 {
  color: var(--color-text);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: 50%;
}

.legend-name {
  flex: 1;
  color: var(--color-text);
  font-size: 0.9rem;
}

.legend-score {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.assessment-history {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.assessment-history h3 {
  color: var(--color-primary);
  margin-bottom: 2rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h4 {
  color: var(--color-text);
  margin: 0;
}

.chart-controls select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
}

.trend-chart {
  position: relative;
  height: 200px;
  margin-bottom: 1rem;
}

.chart-grid {
  position: absolute;
  width: 100%;
  height: 100%;
}

.grid-line {
  position: absolute;
  width: 100%;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
}

.grid-label {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  margin-right: 0.5rem;
}

.chart-lines {
  position: absolute;
  width: 100%;
  height: 100%;
}

.trend-svg {
  width: 100%;
  height: 100%;
}

.chart-legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.trend-legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.trend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.improvement-suggestions {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.improvement-suggestions h3 {
  color: var(--color-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.suggestion-card {
  padding: 1.5rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.suggestion-icon {
  font-size: 1.5rem;
}

.suggestion-header h4 {
  flex: 1;
  color: var(--color-primary);
  margin: 0;
  font-size: 1.1rem;
}

.suggestion-priority {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.suggestion-priority.high {
  background: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
}

.suggestion-priority.medium {
  background: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning);
}

.suggestion-priority.low {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.suggestion-description {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.4;
  font-size: 0.9rem;
}

.suggestion-actions h5 {
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.suggestion-actions ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.suggestion-actions li {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  padding: 0.2rem 0;
  position: relative;
  padding-left: 1rem;
}

.suggestion-actions li::before {
  content: '•';
  color: var(--color-primary);
  position: absolute;
  left: 0;
}

.start-training-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 100%;
}

.start-training-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
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



.breadcrumb-separator {
  color: #666;
  font-size: 0.8rem;
  margin: 0;
}

.breadcrumb-item {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  font-weight: 400;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-item:hover {
  color: var(--color-primary);
}

.breadcrumb-current {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.8rem;
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

@media (max-width: 768px) {
  .ability-assessment-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .assessment-modules {
    grid-template-columns: 1fr;
  }
  
  .radar-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
  
  .breadcrumb-nav {
    padding: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  .back-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>