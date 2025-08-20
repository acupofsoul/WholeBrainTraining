<template>
  <div class="spatial-assessment">
    <div class="assessment-container">
      <div class="assessment-header">
        <h2>空间能力测评</h2>
        <div class="assessment-info">
          <span class="info-item">
            <i class="icon-cube">🔮</i>
            空间想象力评估
          </span>
          <span class="info-item">
            <i class="icon-time">⏱️</i>
            预计用时: 20-25分钟
          </span>
        </div>
      </div>

      <!-- 测评设置阶段 -->
      <div v-if="currentPhase === 'setup'" class="setup-phase">
        <div class="setup-content">
          <h3>测评设置</h3>
          <p class="setup-description">
            空间能力测评将评估您的三维空间想象、立体几何理解、
            图形旋转、空间定位等多项空间认知能力。
          </p>
          
          <div class="settings-grid">
            <div class="setting-group">
              <h4>难度设置</h4>
              <div class="difficulty-options">
                <label v-for="level in difficultyLevels" :key="level.value" class="difficulty-option">
                  <input type="radio" v-model="settings.difficulty" :value="level.value">
                  <div class="option-content">
                    <div class="option-title">{{ level.label }}</div>
                    <div class="option-desc">{{ level.description }}</div>
                  </div>
                </label>
              </div>
            </div>
            
            <div class="setting-group">
              <h4>测试模块</h4>
              <div class="module-options">
                <label v-for="module in testModules" :key="module.id" class="module-option">
                  <input type="checkbox" v-model="settings.selectedModules" :value="module.id">
                  <div class="option-content">
                    <div class="option-title">
                      <span class="module-icon">{{ module.icon }}</span>
                      {{ module.name }}
                    </div>
                    <div class="option-desc">{{ module.description }}</div>
                  </div>
                </label>
              </div>
            </div>
            
            <div class="setting-group">
              <h4>个性化设置</h4>
              <div class="personal-settings">
                <div class="setting-item">
                  <label>测试时长:</label>
                  <select v-model="settings.duration">
                    <option value="short">短时测试 (15分钟)</option>
                    <option value="medium">标准测试 (20分钟)</option>
                    <option value="long">完整测试 (25分钟)</option>
                  </select>
                </div>
                <div class="setting-item">
                  <label>反馈模式:</label>
                  <select v-model="settings.feedbackMode">
                    <option value="immediate">即时反馈</option>
                    <option value="delayed">延迟反馈</option>
                    <option value="final">最终反馈</option>
                  </select>
                </div>
                <div class="setting-item">
                  <label>
                    <input type="checkbox" v-model="settings.enable3DView">
                    启用3D视图辅助
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="setup-actions">
            <button class="btn-secondary" @click="$emit('go-back')">返回</button>
            <button class="btn-start" @click="startAssessment" :disabled="!canStart">
              开始测评
            </button>
          </div>
        </div>
      </div>

      <!-- 测评进行阶段 -->
      <div v-if="currentPhase === 'testing'" class="testing-phase">
        <div class="test-header">
          <div class="test-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <div class="progress-text">
              {{ currentTestIndex + 1 }} / {{ totalTests }} - {{ currentTest.name }}
            </div>
          </div>
          <div class="test-timer" :class="{ warning: timeRemaining < 60 }">
            {{ formatTime(timeRemaining) }}
          </div>
        </div>

        <!-- 动态测试组件 -->
        <component 
          :is="currentTestComponent" 
          :test-data="currentTestData"
          :settings="settings"
          @answer-submitted="handleAnswer"
          @test-completed="nextTest"
        />
      </div>

      <!-- 结果展示阶段 -->
      <div v-if="currentPhase === 'results'" class="results-phase">
        <div class="results-header">
          <h3>空间能力测评结果</h3>
          <div class="overall-score">
            <div class="score-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" stroke-width="8"/>
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="var(--color-primary)" 
                  stroke-width="8"
                  stroke-dasharray="283"
                  :stroke-dashoffset="283 - (283 * overallScore / 100)"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div class="score-text">
                <span class="score-number">{{ overallScore }}</span>
                <span class="score-label">空间指数</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detailed-results">
          <div class="results-grid">
            <div v-for="result in testResults" :key="result.moduleId" class="result-card">
              <div class="result-header">
                <span class="result-icon">{{ result.icon }}</span>
                <h4>{{ result.name }}</h4>
                <span class="result-score" :class="getScoreClass(result.score)">{{ result.score }}分</span>
              </div>
              <div class="result-details">
                <div class="detail-item">
                  <span class="detail-label">准确率：</span>
                  <span class="detail-value">{{ result.accuracy }}%</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">平均用时：</span>
                  <span class="detail-value">{{ result.avgTime }}秒</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">难度等级：</span>
                  <span class="detail-value">{{ result.difficulty }}</span>
                </div>
              </div>
              <div class="result-feedback">
                <p>{{ result.feedback }}</p>
              </div>
            </div>
          </div>

          <div class="spatial-analysis">
            <h4>空间能力分析</h4>
            <div class="analysis-chart">
              <div class="radar-container">
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
                    <line v-for="(ability, index) in spatialAbilities" 
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
                    fill="rgba(16, 185, 129, 0.3)" 
                    stroke="#10b981" 
                    stroke-width="2"
                  />
                  
                  <!-- 数据点 -->
                  <circle 
                    v-for="(ability, index) in spatialAbilities" 
                    :key="index"
                    :cx="getDataPointX(index, ability.score)"
                    :cy="getDataPointY(index, ability.score)"
                    r="4" 
                    fill="#10b981"
                  />
                  
                  <!-- 标签 -->
                  <text 
                    v-for="(ability, index) in spatialAbilities" 
                    :key="index"
                    :x="getLabelX(index)" 
                    :y="getLabelY(index)"
                    text-anchor="middle" 
                    dominant-baseline="middle"
                    font-size="12" 
                    fill="#666"
                  >
                    {{ ability.name }}
                  </text>
                </svg>
              </div>
            </div>
          </div>

          <div class="improvement-suggestions">
            <h4>改进建议</h4>
            <div class="suggestions-list">
              <div v-for="suggestion in improvementSuggestions" :key="suggestion.area" class="suggestion-item">
                <div class="suggestion-header">
                  <span class="suggestion-icon">{{ suggestion.icon }}</span>
                  <h5>{{ suggestion.title }}</h5>
                  <span class="suggestion-priority" :class="suggestion.priority">
                    {{ getPriorityText(suggestion.priority) }}
                  </span>
                </div>
                <p class="suggestion-desc">{{ suggestion.description }}</p>
                <div class="suggestion-actions">
                  <button class="btn-small" @click="startTraining(suggestion.trainingPath)">
                    开始训练
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="results-actions">
          <button class="btn-secondary" @click="restartAssessment">重新测评</button>
          <button class="btn-secondary" @click="exportResults">导出报告</button>
          <button class="btn-primary" @click="$emit('go-back')">返回主页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import SpatialReasoningTest from './tests/SpatialReasoningTest.vue';
import PatternComparisonTest from './tests/PatternComparisonTest.vue';

const emit = defineEmits(['go-back']);

// 当前阶段
const currentPhase = ref('setup');

// 测评设置
const settings = ref({
  difficulty: 'medium',
  duration: 'medium',
  selectedModules: ['spatial-reasoning', 'pattern-comparison', '3d-rotation', 'spatial-memory'],
  feedbackMode: 'delayed',
  enable3DView: true
});

// 难度级别
const difficultyLevels = ref([
  {
    value: 'easy',
    label: '简单',
    description: '基础空间概念，适合初学者'
  },
  {
    value: 'medium',
    label: '中等',
    description: '标准空间推理，适合一般用户'
  },
  {
    value: 'hard',
    label: '困难',
    description: '复杂空间变换，适合高水平用户'
  },
  {
    value: 'expert',
    label: '专家',
    description: '极具挑战性的空间问题'
  }
]);

// 测试模块
const testModules = ref([
  {
    id: 'spatial-reasoning',
    name: '空间推理',
    icon: '🧩',
    description: '评估三维空间中的逻辑推理能力',
    component: SpatialReasoningTest
  },
  {
    id: 'pattern-comparison',
    name: '图形比较',
    icon: '🔍',
    description: '测试图形识别和比较能力',
    component: PatternComparisonTest
  },
  {
    id: '3d-rotation',
    name: '3D旋转',
    icon: '🔄',
    description: '评估三维图形的心理旋转能力',
    component: null // 待实现
  },
  {
    id: 'spatial-memory',
    name: '空间记忆',
    icon: '🗺️',
    description: '测试空间位置的记忆能力',
    component: null // 待实现
  }
]);

// 测试状态
const currentTestIndex = ref(0);
const currentTest = ref(null);
const currentTestComponent = ref(null);
const currentTestData = ref(null);
const testResults = ref([]);
const startTime = ref(null);
const timeRemaining = ref(0);
const timer = ref(null);

// 空间能力维度
const spatialAbilities = ref([
  { name: '空间推理', score: 0 },
  { name: '图形识别', score: 0 },
  { name: '3D旋转', score: 0 },
  { name: '空间记忆', score: 0 },
  { name: '立体感知', score: 0 }
]);

// 改进建议
const improvementSuggestions = ref([]);

// 计算属性
const canStart = computed(() => {
  return settings.value.selectedModules.length > 0;
});

const totalTests = computed(() => {
  return settings.value.selectedModules.length;
});

const progressPercentage = computed(() => {
  if (totalTests.value === 0) return 0;
  return (currentTestIndex.value / totalTests.value) * 100;
});

const overallScore = computed(() => {
  if (testResults.value.length === 0) return 0;
  const totalScore = testResults.value.reduce((sum, result) => sum + result.score, 0);
  return Math.round(totalScore / testResults.value.length);
});

// 方法
const startAssessment = () => {
  currentPhase.value = 'testing';
  currentTestIndex.value = 0;
  testResults.value = [];
  startTime.value = Date.now();
  
  // 设置总时长
  const durationMap = {
    short: 15 * 60,
    medium: 20 * 60,
    long: 25 * 60
  };
  timeRemaining.value = durationMap[settings.value.duration];
  
  startTimer();
  loadNextTest();
};

const loadNextTest = () => {
  if (currentTestIndex.value >= settings.value.selectedModules.length) {
    completeAssessment();
    return;
  }
  
  const moduleId = settings.value.selectedModules[currentTestIndex.value];
  const module = testModules.value.find(m => m.id === moduleId);
  
  if (module && module.component) {
    currentTest.value = module;
    currentTestComponent.value = module.component;
    currentTestData.value = generateTestData(module.id);
  } else {
    // 如果组件不存在，跳到下一个测试
    currentTestIndex.value++;
    loadNextTest();
  }
};

const generateTestData = (moduleId) => {
  // 根据模块ID生成测试数据
  const dataGenerators = {
    'spatial-reasoning': generateSpatialReasoningData,
    'pattern-comparison': generatePatternComparisonData,
    '3d-rotation': generate3DRotationData,
    'spatial-memory': generateSpatialMemoryData
  };
  
  const generator = dataGenerators[moduleId];
  return generator ? generator() : null;
};

const generateSpatialReasoningData = () => {
  // 生成空间推理测试数据
  return {
    questions: [
      {
        id: 1,
        type: 'spatial-reasoning',
        question: '下面哪个图形是左侧立体图形的正确展开图？',
        stimulus: '3d-cube',
        options: ['option1', 'option2', 'option3', 'option4'],
        correct: 2,
        difficulty: settings.value.difficulty
      }
      // 更多题目...
    ]
  };
};

const generatePatternComparisonData = () => {
  // 生成图形比较测试数据
  return {
    questions: [
      {
        id: 1,
        type: 'pattern-comparison',
        question: '找出与左侧图形完全相同的选项',
        stimulus: 'complex-pattern',
        options: ['pattern1', 'pattern2', 'pattern3', 'pattern4'],
        correct: 1,
        difficulty: settings.value.difficulty
      }
      // 更多题目...
    ]
  };
};

const generate3DRotationData = () => {
  // 生成3D旋转测试数据
  return {
    questions: [
      {
        id: 1,
        type: '3d-rotation',
        question: '将左侧图形顺时针旋转90度后，应该是什么样子？',
        stimulus: '3d-object',
        options: ['rotated1', 'rotated2', 'rotated3', 'rotated4'],
        correct: 3,
        difficulty: settings.value.difficulty
      }
      // 更多题目...
    ]
  };
};

const generateSpatialMemoryData = () => {
  // 生成空间记忆测试数据
  return {
    questions: [
      {
        id: 1,
        type: 'spatial-memory',
        question: '记住下面图形中各个元素的位置，然后选择正确的重现',
        stimulus: 'spatial-layout',
        memoryTime: 5000,
        options: ['layout1', 'layout2', 'layout3', 'layout4'],
        correct: 0,
        difficulty: settings.value.difficulty
      }
      // 更多题目...
    ]
  };
};

const handleAnswer = (answerData) => {
  // 处理答案提交
  console.log('Answer submitted:', answerData);
};

const nextTest = () => {
  // 保存当前测试结果
  const result = {
    moduleId: currentTest.value.id,
    name: currentTest.value.name,
    icon: currentTest.value.icon,
    score: Math.floor(Math.random() * 40) + 60, // 模拟得分
    accuracy: Math.floor(Math.random() * 30) + 70, // 模拟准确率
    avgTime: Math.floor(Math.random() * 10) + 15, // 模拟平均用时
    difficulty: settings.value.difficulty,
    feedback: generateFeedback(currentTest.value.id)
  };
  
  testResults.value.push(result);
  currentTestIndex.value++;
  loadNextTest();
};

const generateFeedback = (moduleId) => {
  const feedbacks = {
    'spatial-reasoning': '您的空间推理能力表现良好，能够较好地理解三维空间中的逻辑关系。',
    'pattern-comparison': '您在图形识别方面有不错的表现，对细节的观察比较敏锐。',
    '3d-rotation': '您的心理旋转能力需要进一步提升，建议多做相关练习。',
    'spatial-memory': '您的空间记忆能力中等，可以通过训练得到改善。'
  };
  return feedbacks[moduleId] || '测试完成，感谢您的参与。';
};

const completeAssessment = () => {
  currentPhase.value = 'results';
  stopTimer();
  calculateSpatialAbilities();
  generateImprovementSuggestions();
  saveResults();
};

const calculateSpatialAbilities = () => {
  // 根据测试结果计算各项空间能力得分
  spatialAbilities.value.forEach(ability => {
    ability.score = Math.floor(Math.random() * 40) + 50; // 模拟计算
  });
};

const generateImprovementSuggestions = () => {
  improvementSuggestions.value = [
    {
      area: 'spatial-reasoning',
      title: '空间推理训练',
      icon: '🧩',
      description: '通过立体几何和空间变换练习提升空间推理能力',
      priority: 'high',
      trainingPath: '/basic-training/expand-vision'
    },
    {
      area: '3d-rotation',
      title: '3D旋转练习',
      icon: '🔄',
      description: '加强心理旋转训练，提升三维图形的想象能力',
      priority: 'medium',
      trainingPath: '/basic-training/spatial'
    }
  ];
};

const saveResults = () => {
  const results = {
    timestamp: Date.now(),
    settings: settings.value,
    testResults: testResults.value,
    overallScore: overallScore.value,
    spatialAbilities: spatialAbilities.value,
    duration: startTime.value ? Date.now() - startTime.value : 0
  };
  
  // 保存到本地存储
  const saved = localStorage.getItem('spatialAssessmentHistory') || '[]';
  const history = JSON.parse(saved);
  history.push(results);
  localStorage.setItem('spatialAssessmentHistory', JSON.stringify(history));
  
  // 更新统计数据
  const stats = {
    spatialIndex: overallScore.value,
    accuracy: testResults.value.reduce((sum, r) => sum + r.accuracy, 0) / testResults.value.length,
    lastTestDate: Date.now()
  };
  localStorage.setItem('spatialAssessmentStats', JSON.stringify(stats));
};

const startTimer = () => {
  timer.value = setInterval(() => {
    timeRemaining.value--;
    if (timeRemaining.value <= 0) {
      completeAssessment();
    }
  }, 1000);
};

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const restartAssessment = () => {
  currentPhase.value = 'setup';
  currentTestIndex.value = 0;
  testResults.value = [];
  stopTimer();
};

const exportResults = () => {
  const data = {
    timestamp: new Date().toISOString(),
    overallScore: overallScore.value,
    testResults: testResults.value,
    spatialAbilities: spatialAbilities.value
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spatial-assessment-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const startTraining = (path) => {
  // 跳转到训练页面
  window.location.href = path;
};

const getScoreClass = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 60) return 'average';
  return 'poor';
};

const getPriorityText = (priority) => {
  const map = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  };
  return map[priority] || '中优先级';
};

// 雷达图计算函数
const getPolygonPoints = (radius) => {
  const points = [];
  const angleStep = (2 * Math.PI) / spatialAbilities.value.length;
  for (let i = 0; i < spatialAbilities.value.length; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = 150 + radius * Math.cos(angle);
    const y = 150 + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
};

const getAxisEndX = (index) => {
  const angle = index * (2 * Math.PI) / spatialAbilities.value.length - Math.PI / 2;
  return 150 + 100 * Math.cos(angle);
};

const getAxisEndY = (index) => {
  const angle = index * (2 * Math.PI) / spatialAbilities.value.length - Math.PI / 2;
  return 150 + 100 * Math.sin(angle);
};

const getDataPolygonPoints = () => {
  const points = [];
  const angleStep = (2 * Math.PI) / spatialAbilities.value.length;
  spatialAbilities.value.forEach((ability, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const radius = ability.score;
    const x = 150 + radius * Math.cos(angle);
    const y = 150 + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  });
  return points.join(' ');
};

const getDataPointX = (index, score) => {
  const angle = index * (2 * Math.PI) / spatialAbilities.value.length - Math.PI / 2;
  return 150 + score * Math.cos(angle);
};

const getDataPointY = (index, score) => {
  const angle = index * (2 * Math.PI) / spatialAbilities.value.length - Math.PI / 2;
  return 150 + score * Math.sin(angle);
};

const getLabelX = (index) => {
  const angle = index * (2 * Math.PI) / spatialAbilities.value.length - Math.PI / 2;
  return 150 + 120 * Math.cos(angle);
};

const getLabelY = (index) => {
  const angle = index * (2 * Math.PI) / spatialAbilities.value.length - Math.PI / 2;
  return 150 + 120 * Math.sin(angle);
};

onMounted(() => {
  // 组件挂载时的初始化
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped>
.spatial-assessment {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.assessment-container {
  background: var(--color-card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.assessment-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
  padding: 2rem;
  text-align: center;
}

.assessment-header h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 600;
}

.assessment-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 设置阶段样式 */
.setup-phase {
  padding: 2rem;
}

.setup-content h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.setup-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.settings-grid {
  display: grid;
  gap: 2rem;
  margin-bottom: 2rem;
}

.setting-group h4 {
  color: var(--color-text);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.difficulty-options,
.module-options {
  display: grid;
  gap: 1rem;
}

.difficulty-option,
.module-option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.difficulty-option:hover,
.module-option:hover {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.difficulty-option input:checked + .option-content,
.module-option input:checked + .option-content {
  color: var(--color-primary);
}

.option-content {
  flex: 1;
}

.option-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.option-desc {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.module-icon {
  font-size: 1.2rem;
}

.personal-settings {
  display: grid;
  gap: 1rem;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.setting-item label {
  min-width: 100px;
  font-weight: 500;
}

.setting-item select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
}

.setup-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

/* 测试阶段样式 */
.testing-phase {
  min-height: 600px;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.test-progress {
  flex: 1;
  max-width: 400px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width var(--transition-normal);
}

.progress-text {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.test-timer {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-primary);
  padding: 0.5rem 1rem;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 6px;
}

.test-timer.warning {
  color: var(--color-danger);
  background: rgba(var(--color-danger-rgb), 0.1);
  animation: pulse 1s infinite;
}

/* 结果阶段样式 */
.results-phase {
  padding: 2rem;
}

.results-header {
  text-align: center;
  margin-bottom: 3rem;
}

.results-header h3 {
  color: var(--color-primary);
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.overall-score {
  display: flex;
  justify-content: center;
}

.score-circle {
  position: relative;
  width: 150px;
  height: 150px;
}

.score-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.score-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.detailed-results {
  margin-bottom: 3rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.result-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.result-icon {
  font-size: 1.5rem;
}

.result-header h4 {
  flex: 1;
  margin: 0;
  color: var(--color-text);
}

.result-score {
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
}

.result-score.excellent {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.result-score.good {
  background: rgba(var(--color-info-rgb), 0.1);
  color: var(--color-info);
}

.result-score.average {
  background: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning);
}

.result-score.poor {
  background: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
}

.result-details {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.detail-label {
  color: var(--color-text-secondary);
}

.detail-value {
  font-weight: 500;
  color: var(--color-text);
}

.result-feedback {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.spatial-analysis {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.spatial-analysis h4 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.radar-container {
  display: flex;
  justify-content: center;
}

.radar-svg {
  width: 300px;
  height: 300px;
}

.improvement-suggestions {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
}

.improvement-suggestions h4 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.suggestions-list {
  display: grid;
  gap: 1rem;
}

.suggestion-item {
  padding: 1rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.suggestion-icon {
  font-size: 1.2rem;
}

.suggestion-header h5 {
  flex: 1;
  margin: 0;
  color: var(--color-text);
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

.suggestion-desc {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin-bottom: 1rem;
}

.suggestion-actions {
  display: flex;
  gap: 0.5rem;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* 按钮样式 */
.btn-primary,
.btn-secondary,
.btn-start,
.btn-small {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-border);
}

.btn-start {
  background: linear-gradient(135deg, var(--color-success), var(--color-success-dark));
  color: white;
  font-size: 1rem;
  padding: 1rem 2rem;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-start:disabled {
  background: var(--color-border);
  color: var(--color-text-secondary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  background: var(--color-primary);
  color: white;
}

.btn-small:hover {
  background: var(--color-primary-dark);
}

/* 动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .spatial-assessment {
    padding: 1rem;
  }
  
  .assessment-header {
    padding: 1.5rem;
  }
  
  .assessment-header h2 {
    font-size: 1.5rem;
  }
  
  .assessment-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .setup-phase,
  .results-phase {
    padding: 1.5rem;
  }
  
  .test-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .results-actions {
    flex-direction: column;
  }
  
  .setup-actions {
    flex-direction: column;
  }
}
</style>