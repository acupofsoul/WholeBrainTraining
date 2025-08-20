<template>
  <div class="comprehensive-assessment">
    <!-- 测评设置面板 -->
    <div v-if="currentPhase === 'settings'" class="settings-panel">
      <div class="settings-header">
        <h2>综合能力测评设置</h2>
        <p>请根据您的需要调整测评参数，系统将根据设置生成个性化测试</p>
      </div>

      <div class="settings-grid">
        <div class="setting-group">
          <h3>测试难度</h3>
          <div class="difficulty-options">
            <label v-for="level in difficultyLevels" :key="level.value" class="difficulty-option">
              <input type="radio" v-model="settings.difficulty" :value="level.value">
              <span class="option-content">
                <span class="option-title">{{ level.name }}</span>
                <span class="option-desc">{{ level.description }}</span>
              </span>
            </label>
          </div>
        </div>

        <div class="setting-group">
          <h3>测试时长</h3>
          <div class="duration-slider">
            <input type="range" v-model="settings.duration" min="15" max="60" step="5">
            <div class="duration-display">{{ settings.duration }} 分钟</div>
          </div>
        </div>

        <div class="setting-group">
          <h3>测试模块</h3>
          <div class="modules-grid">
            <label v-for="module in testModules" :key="module.id" class="module-option">
              <input type="checkbox" v-model="settings.selectedModules" :value="module.id">
              <span class="module-content">
                <span class="module-icon">{{ module.icon }}</span>
                <span class="module-name">{{ module.name }}</span>
                <span class="module-time">{{ module.estimatedTime }}分钟</span>
              </span>
            </label>
          </div>
        </div>

        <div class="setting-group">
          <h3>个性化设置</h3>
          <div class="custom-settings">
            <label class="custom-option">
              <input type="checkbox" v-model="settings.adaptiveDifficulty">
              <span>自适应难度调整</span>
            </label>
            <label class="custom-option">
              <input type="checkbox" v-model="settings.detailedFeedback">
              <span>详细反馈报告</span>
            </label>
            <label class="custom-option">
              <input type="checkbox" v-model="settings.timeWarning">
              <span>时间提醒</span>
            </label>
          </div>
        </div>
      </div>

      <div class="settings-actions">
        <button class="btn-secondary" @click="$emit('go-back')">返回</button>
        <button class="btn-primary" @click="startAssessment" :disabled="!canStartAssessment">开始测评</button>
      </div>
    </div>

    <!-- 测评进行中 -->
    <div v-if="currentPhase === 'testing'" class="testing-panel">
      <div class="test-header">
        <div class="progress-info">
          <div class="current-module">{{ currentTest.name }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: testProgress + '%' }"></div>
          </div>
          <div class="progress-text">{{ currentTestIndex + 1 }} / {{ totalTests }}</div>
        </div>
        <div class="timer" :class="{ warning: timeRemaining < 60 }">
          {{ formatTime(timeRemaining) }}
        </div>
      </div>

      <!-- 动态测试内容 -->
      <component 
        :is="currentTestComponent" 
        :test-data="currentTestData"
        :settings="settings"
        @answer-submitted="handleAnswer"
        @test-completed="nextTest"
      />
    </div>

    <!-- 结果展示 -->
    <div v-if="currentPhase === 'results'" class="results-panel">
      <div class="results-header">
        <h2>测评结果</h2>
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
              <span class="score-label">综合得分</span>
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
                <span class="detail-label">用时：</span>
                <span class="detail-value">{{ result.timeUsed }}秒</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">难度：</span>
                <span class="detail-value">{{ result.difficulty }}</span>
              </div>
            </div>
            <div class="result-feedback">
              <p>{{ result.feedback }}</p>
            </div>
          </div>
        </div>

        <div class="improvement-analysis">
          <h3>能力分析</h3>
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
                  <line v-for="(ability, index) in abilityScores" 
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
                  fill="rgba(59, 130, 246, 0.3)" 
                  stroke="#3b82f6" 
                  stroke-width="2"
                />
                
                <!-- 数据点 -->
                <circle 
                  v-for="(ability, index) in abilityScores" 
                  :key="index"
                  :cx="getDataPointX(index, ability.score)"
                  :cy="getDataPointY(index, ability.score)"
                  r="4" 
                  fill="#3b82f6"
                />
                
                <!-- 标签 -->
                <text 
                  v-for="(ability, index) in abilityScores" 
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
      </div>

      <div class="results-actions">
        <button class="btn-secondary" @click="restartAssessment">重新测评</button>
        <button class="btn-secondary" @click="exportResults">导出报告</button>
        <button class="btn-primary" @click="$emit('go-back')">返回主页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import LogicalReasoningTest from './tests/LogicalReasoningTest.vue';
import MemorySpanTest from './tests/MemorySpanTest.vue';
import ProcessingSpeedTest from './tests/ProcessingSpeedTest.vue';
import AttentionTest from './tests/AttentionTest.vue';
import VerbalReasoningTest from './tests/VerbalReasoningTest.vue';

const emit = defineEmits(['go-back']);

// 当前阶段
const currentPhase = ref('settings');

// 测评设置
const settings = ref({
  difficulty: 'medium',
  duration: 30,
  selectedModules: ['logical', 'memory', 'processing', 'attention', 'verbal'],
  adaptiveDifficulty: true,
  detailedFeedback: true,
  timeWarning: true
});

// 难度级别
const difficultyLevels = ref([
  {
    value: 'easy',
    name: '简单',
    description: '适合初学者，题目相对简单，时间充裕'
  },
  {
    value: 'medium',
    name: '中等',
    description: '适合一般用户，难度适中，时间合理'
  },
  {
    value: 'hard',
    name: '困难',
    description: '适合高水平用户，题目复杂，时间紧张'
  },
  {
    value: 'expert',
    name: '专家',
    description: '适合专业人士，极具挑战性'
  }
]);

// 测试模块
const testModules = ref([
  {
    id: 'logical',
    name: '逻辑推理',
    icon: '🧩',
    estimatedTime: 8,
    component: LogicalReasoningTest
  },
  {
    id: 'memory',
    name: '工作记忆',
    icon: '🧠',
    estimatedTime: 6,
    component: MemorySpanTest
  },
  {
    id: 'processing',
    name: '处理速度',
    icon: '⚡',
    estimatedTime: 5,
    component: ProcessingSpeedTest
  },
  {
    id: 'attention',
    name: '注意力',
    icon: '👁️',
    estimatedTime: 7,
    component: AttentionTest
  },
  {
    id: 'verbal',
    name: '语言理解',
    icon: '📝',
    estimatedTime: 9,
    component: VerbalReasoningTest
  }
]);

// 测试状态
const currentTestIndex = ref(0);
const testResults = ref([]);
const timeRemaining = ref(0);
const timer = ref(null);

// 计算属性
const canStartAssessment = computed(() => {
  return settings.value.selectedModules.length > 0;
});

const selectedTests = computed(() => {
  return testModules.value.filter(module => 
    settings.value.selectedModules.includes(module.id)
  );
});

const totalTests = computed(() => selectedTests.value.length);

const currentTest = computed(() => {
  return selectedTests.value[currentTestIndex.value] || {};
});

const currentTestComponent = computed(() => {
  return currentTest.value.component;
});

const currentTestData = computed(() => {
  return generateTestData(currentTest.value.id);
});

const testProgress = computed(() => {
  return totalTests.value > 0 ? (currentTestIndex.value / totalTests.value) * 100 : 0;
});

const overallScore = computed(() => {
  if (testResults.value.length === 0) return 0;
  const totalScore = testResults.value.reduce((sum, result) => sum + result.score, 0);
  return Math.round(totalScore / testResults.value.length);
});

const abilityScores = computed(() => {
  return testResults.value.map(result => ({
    name: result.name,
    score: result.score
  }));
});

// 开始测评
const startAssessment = () => {
  currentPhase.value = 'testing';
  currentTestIndex.value = 0;
  testResults.value = [];
  timeRemaining.value = settings.value.duration * 60;
  startTimer();
};

// 计时器
const startTimer = () => {
  timer.value = setInterval(() => {
    timeRemaining.value--;
    if (timeRemaining.value <= 0) {
      endAssessment();
    }
  }, 1000);
};

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

// 处理答案
const handleAnswer = (answer) => {
  // 处理单个答案的逻辑
  console.log('Answer received:', answer);
};

// 下一个测试
const nextTest = (result) => {
  testResults.value.push({
    moduleId: currentTest.value.id,
    name: currentTest.value.name,
    icon: currentTest.value.icon,
    ...result
  });
  
  currentTestIndex.value++;
  
  if (currentTestIndex.value >= totalTests.value) {
    endAssessment();
  }
};

// 结束测评
const endAssessment = () => {
  stopTimer();
  currentPhase.value = 'results';
};

// 重新开始测评
const restartAssessment = () => {
  currentPhase.value = 'settings';
  currentTestIndex.value = 0;
  testResults.value = [];
  stopTimer();
};

// 导出结果
const exportResults = () => {
  const data = {
    timestamp: new Date().toISOString(),
    settings: settings.value,
    results: testResults.value,
    overallScore: overallScore.value
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comprehensive-assessment-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// 生成测试数据
const generateTestData = (moduleId) => {
  const difficulty = settings.value.difficulty;
  
  switch (moduleId) {
    case 'logical':
      return generateLogicalReasoningData(difficulty);
    case 'memory':
      return generateMemorySpanData(difficulty);
    case 'processing':
      return generateProcessingSpeedData(difficulty);
    case 'attention':
      return generateAttentionData(difficulty);
    case 'verbal':
      return generateVerbalReasoningData(difficulty);
    default:
      return {};
  }
};

// 生成逻辑推理测试数据
const generateLogicalReasoningData = (difficulty) => {
  const difficultyConfig = {
    easy: { questionCount: 8, timeLimit: 480 },
    medium: { questionCount: 10, timeLimit: 420 },
    hard: { questionCount: 12, timeLimit: 360 },
    expert: { questionCount: 15, timeLimit: 300 }
  };
  
  const config = difficultyConfig[difficulty];
  const questions = [];
  
  for (let i = 0; i < config.questionCount; i++) {
    questions.push({
      id: i + 1,
      type: 'sequence',
      question: `找出数列规律：${generateSequence(difficulty)}`,
      options: generateSequenceOptions(difficulty),
      correctAnswer: 0
    });
  }
  
  return {
    questions,
    timeLimit: config.timeLimit
  };
};

// 生成数列
const generateSequence = (difficulty) => {
  const sequences = {
    easy: ['2, 4, 6, 8, ?', '1, 3, 5, 7, ?', '10, 8, 6, 4, ?'],
    medium: ['1, 4, 9, 16, ?', '2, 6, 18, 54, ?', '1, 1, 2, 3, 5, ?'],
    hard: ['1, 4, 13, 40, ?', '2, 3, 5, 8, 13, ?', '1, 8, 27, 64, ?'],
    expert: ['1, 11, 21, 1211, ?', '2, 12, 1112, 3112, ?', '1, 2, 6, 24, 120, ?']
  };
  
  const sequenceList = sequences[difficulty];
  return sequenceList[Math.floor(Math.random() * sequenceList.length)];
};

// 生成选项
const generateSequenceOptions = (difficulty) => {
  // 简化实现，实际应该根据题目生成正确答案和干扰项
  return ['10', '12', '14', '16'];
};

// 其他测试数据生成函数（简化实现）
const generateMemorySpanData = (difficulty) => {
  const config = {
    easy: { spanLength: 4, trials: 6 },
    medium: { spanLength: 6, trials: 8 },
    hard: { spanLength: 8, trials: 10 },
    expert: { spanLength: 10, trials: 12 }
  };
  
  return config[difficulty];
};

const generateProcessingSpeedData = (difficulty) => {
  const config = {
    easy: { itemCount: 30, timeLimit: 120 },
    medium: { itemCount: 50, timeLimit: 120 },
    hard: { itemCount: 80, timeLimit: 120 },
    expert: { itemCount: 120, timeLimit: 120 }
  };
  
  return config[difficulty];
};

const generateAttentionData = (difficulty) => {
  const config = {
    easy: { targetCount: 20, distractorCount: 40 },
    medium: { targetCount: 25, distractorCount: 75 },
    hard: { targetCount: 30, distractorCount: 120 },
    expert: { targetCount: 40, distractorCount: 200 }
  };
  
  return config[difficulty];
};

const generateVerbalReasoningData = (difficulty) => {
  const config = {
    easy: { questionCount: 8, complexity: 'simple' },
    medium: { questionCount: 10, complexity: 'moderate' },
    hard: { questionCount: 12, complexity: 'complex' },
    expert: { questionCount: 15, complexity: 'expert' }
  };
  
  return config[difficulty];
};

// 工具函数
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getScoreClass = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'average';
  return 'below-average';
};

// 雷达图计算函数
const getPolygonPoints = (radius) => {
  const points = [];
  const angleStep = (2 * Math.PI) / abilityScores.value.length;
  for (let i = 0; i < abilityScores.value.length; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = 150 + radius * Math.cos(angle);
    const y = 150 + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
};

const getAxisEndX = (index) => {
  const angle = index * (2 * Math.PI) / abilityScores.value.length - Math.PI / 2;
  return 150 + 100 * Math.cos(angle);
};

const getAxisEndY = (index) => {
  const angle = index * (2 * Math.PI) / abilityScores.value.length - Math.PI / 2;
  return 150 + 100 * Math.sin(angle);
};

const getDataPolygonPoints = () => {
  const points = [];
  const angleStep = (2 * Math.PI) / abilityScores.value.length;
  abilityScores.value.forEach((ability, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const radius = ability.score;
    const x = 150 + radius * Math.cos(angle);
    const y = 150 + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  });
  return points.join(' ');
};

const getDataPointX = (index, score) => {
  const angle = index * (2 * Math.PI) / abilityScores.value.length - Math.PI / 2;
  return 150 + score * Math.cos(angle);
};

const getDataPointY = (index, score) => {
  const angle = index * (2 * Math.PI) / abilityScores.value.length - Math.PI / 2;
  return 150 + score * Math.sin(angle);
};

const getLabelX = (index) => {
  const angle = index * (2 * Math.PI) / abilityScores.value.length - Math.PI / 2;
  return 150 + 120 * Math.cos(angle);
};

const getLabelY = (index) => {
  const angle = index * (2 * Math.PI) / abilityScores.value.length - Math.PI / 2;
  return 150 + 120 * Math.sin(angle);
};

// 生命周期
onMounted(() => {
  // 初始化逻辑
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped>
.comprehensive-assessment {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 设置面板样式 */
.settings-panel {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.settings-header {
  text-align: center;
  margin-bottom: 2rem;
}

.settings-header h2 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.settings-grid {
  display: grid;
  gap: 2rem;
  margin-bottom: 2rem;
}

.setting-group h3 {
  margin-bottom: 1rem;
  color: #333;
}

.difficulty-options {
  display: grid;
  gap: 1rem;
}

.difficulty-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.difficulty-option:hover {
  border-color: var(--color-primary);
}

.difficulty-option input[type="radio"]:checked + .option-content {
  color: var(--color-primary);
}

.option-content {
  margin-left: 1rem;
}

.option-title {
  font-weight: bold;
  display: block;
}

.option-desc {
  font-size: 0.9rem;
  color: #666;
}

.duration-slider {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.duration-slider input[type="range"] {
  flex: 1;
}

.duration-display {
  font-weight: bold;
  color: var(--color-primary);
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.module-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.module-option:hover {
  border-color: var(--color-primary);
}

.module-option input[type="checkbox"]:checked + .module-content {
  color: var(--color-primary);
}

.module-content {
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.module-icon {
  font-size: 1.5rem;
}

.module-name {
  font-weight: bold;
}

.module-time {
  font-size: 0.8rem;
  color: #666;
}

.custom-settings {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.custom-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.settings-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

/* 测试面板样式 */
.testing-panel {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.progress-info {
  flex: 1;
}

.current-module {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #666;
}

.timer {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.timer.warning {
  color: #dc3545;
  background: #fff5f5;
}

/* 结果面板样式 */
.results-panel {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.results-header {
  text-align: center;
  margin-bottom: 2rem;
}

.overall-score {
  margin: 2rem 0;
}

.score-circle {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
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
  font-weight: bold;
  color: var(--color-primary);
}

.score-label {
  font-size: 0.9rem;
  color: #666;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.result-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid var(--color-primary);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.result-icon {
  font-size: 1.5rem;
}

.result-score {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.result-score.excellent {
  background: #d4edda;
  color: #155724;
}

.result-score.good {
  background: #cce5ff;
  color: #004085;
}

.result-score.average {
  background: #fff3cd;
  color: #856404;
}

.result-score.below-average {
  background: #f8d7da;
  color: #721c24;
}

.result-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.8rem;
  color: #666;
}

.detail-value {
  font-weight: bold;
}

.result-feedback {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
}

.improvement-analysis {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.analysis-chart {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.radar-container {
  width: 300px;
  height: 300px;
}

.radar-svg {
  width: 100%;
  height: 100%;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

/* 按钮样式 */
.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #5a6268;
}
</style>