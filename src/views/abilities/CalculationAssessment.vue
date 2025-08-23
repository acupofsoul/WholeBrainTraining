<template>
  <div class="calculation-assessment">
    <div class="assessment-container">
      <!-- 测评设置阶段 -->
      <div v-if="assessmentPhase === 'setup'" class="setup-phase">
        <div class="setup-content">
          <h2>计算能力测评</h2>
          <p class="assessment-description">
            本测评将全面评估您的数学计算能力、逻辑推理能力和数字处理能力。
            通过多种类型的测试，为您提供详细的能力分析报告。
          </p>
          
          <!-- 难度设置 -->
          <div class="setting-group">
            <h3>选择难度等级</h3>
            <div class="difficulty-options">
              <div 
                v-for="level in difficultyLevels"
                :key="level.value"
                class="difficulty-option"
                :class="{ active: selectedDifficulty === level.value }"
                @click="selectedDifficulty = level.value"
              >
                <div class="difficulty-icon">{{ level.icon }}</div>
                <div class="difficulty-info">
                  <div class="difficulty-name">{{ level.name }}</div>
                  <div class="difficulty-desc">{{ level.description }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 测试模块选择 -->
          <div class="setting-group">
            <h3>选择测试模块</h3>
            <div class="module-options">
              <div 
                v-for="module in testModules"
                :key="module.key"
                class="module-option"
                :class="{ active: selectedModules.includes(module.key) }"
                @click="toggleModule(module.key)"
              >
                <div class="module-icon">{{ module.icon }}</div>
                <div class="module-info">
                  <div class="module-name">{{ module.name }}</div>
                  <div class="module-desc">{{ module.description }}</div>
                  <div class="module-time">预计用时: {{ module.estimatedTime }}分钟</div>
                </div>
                <div class="module-checkbox">
                  <i class="fas fa-check" v-if="selectedModules.includes(module.key)"></i>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 个性化设置 -->
          <div class="setting-group">
            <h3>个性化设置</h3>
            <div class="personal-settings">
              <div class="setting-item">
                <label>题目数量</label>
                <select v-model="questionCount">
                  <option value="10">10题 (快速测评)</option>
                  <option value="20">20题 (标准测评)</option>
                  <option value="30">30题 (深度测评)</option>
                </select>
              </div>
              <div class="setting-item">
                <label>时间限制</label>
                <select v-model="timeLimit">
                  <option value="300">5分钟</option>
                  <option value="600">10分钟</option>
                  <option value="900">15分钟</option>
                  <option value="0">无限制</option>
                </select>
              </div>
              <div class="setting-item">
                <label>显示提示</label>
                <input type="checkbox" v-model="showHints" />
                <span class="checkbox-label">在困难题目中显示解题提示</span>
              </div>
            </div>
          </div>
          
          <div class="setup-actions">
            <button @click="startAssessment" class="btn-start" :disabled="selectedModules.length === 0">
              开始测评
            </button>
          </div>
        </div>
      </div>

      <!-- 测评进行阶段 -->
      <div v-else-if="assessmentPhase === 'testing'" class="testing-phase">
        <div class="test-header">
          <div class="test-progress">
            <div class="progress-info">
              <span class="current-module">{{ getCurrentModuleName() }}</span>
              <span class="question-counter">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
          <div class="test-timer" v-if="timeLimit > 0">
            <i class="fas fa-clock"></i>
            <span>{{ formatTime(remainingTime) }}</span>
          </div>
        </div>

        <!-- 动态测试内容 -->
        <div class="test-content">
          <component 
            :is="currentTestComponent"
            :test-data="currentTestData"
            @answer-submitted="handleAnswerSubmitted"
            @test-completed="handleTestCompleted"
          />
        </div>
      </div>

      <!-- 结果展示阶段 -->
      <div v-else-if="assessmentPhase === 'results'" class="results-phase">
        <div class="results-container">
          <h2>计算能力测评报告</h2>
          
          <!-- 综合得分 -->
          <div class="overall-score">
            <div class="score-circle">
              <div class="score-value">{{ overallScore }}</div>
              <div class="score-label">综合得分</div>
            </div>
            <div class="score-description">
              <h3>{{ getScoreLevel(overallScore) }}</h3>
              <p>{{ getScoreDescription(overallScore) }}</p>
            </div>
          </div>
          
          <!-- 能力分析雷达图 -->
          <div class="ability-radar">
            <h3>能力分析</h3>
            <div class="radar-chart">
              <canvas ref="radarCanvas" width="400" height="400"></canvas>
            </div>
            <div class="radar-legend">
              <div 
                v-for="ability in abilityScores"
                :key="ability.name"
                class="legend-item"
              >
                <div class="legend-color" :style="{ backgroundColor: ability.color }"></div>
                <span class="legend-name">{{ ability.name }}</span>
                <span class="legend-score">{{ ability.score }}</span>
              </div>
            </div>
          </div>
          
          <!-- 模块详细结果 -->
          <div class="module-results">
            <h3>模块详细结果</h3>
            <div class="module-cards">
              <div 
                v-for="result in moduleResults"
                :key="result.module"
                class="module-card"
              >
                <div class="module-header">
                  <div class="module-icon">{{ getModuleIcon(result.module) }}</div>
                  <div class="module-title">
                    <h4>{{ getModuleName(result.module) }}</h4>
                    <div class="module-score">{{ result.score }}分</div>
                  </div>
                </div>
                <div class="module-stats">
                  <div class="stat-item">
                    <span class="stat-label">准确率</span>
                    <span class="stat-value">{{ result.accuracy }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">平均用时</span>
                    <span class="stat-value">{{ result.averageTime }}秒</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">完成题数</span>
                    <span class="stat-value">{{ result.completed }} / {{ result.total }}</span>
                  </div>
                </div>
                <div class="module-performance">
                  <div class="performance-bar">
                    <div 
                      class="performance-fill"
                      :style="{ width: result.accuracy + '%', backgroundColor: getPerformanceColor(result.accuracy) }"
                    ></div>
                  </div>
                  <div class="performance-label">{{ getPerformanceLabel(result.accuracy) }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 题目详情 -->
          <div class="question-details">
            <h3>题目详情</h3>
            <div class="details-summary">
              <div class="summary-stats">
                <div class="summary-item">
                  <div class="summary-icon correct">✓</div>
                  <div class="summary-text">
                    <div class="summary-number">{{ correctAnswers }}</div>
                    <div class="summary-label">答对题数</div>
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-icon incorrect">✗</div>
                  <div class="summary-text">
                    <div class="summary-number">{{ incorrectAnswers }}</div>
                    <div class="summary-label">答错题数</div>
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-icon skipped">⏭</div>
                  <div class="summary-text">
                    <div class="summary-number">{{ skippedAnswers }}</div>
                    <div class="summary-label">跳过题数</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="question-list">
              <div 
                v-for="(answer, index) in allAnswers"
                :key="index"
                class="question-item"
                :class="getQuestionStatus(answer)"
              >
                <div class="question-number">{{ index + 1 }}</div>
                <div class="question-content">
                  <div class="question-text">{{ answer.question }}</div>
                  <div class="question-info">
                    <span class="question-module">{{ getModuleName(answer.module) }}</span>
                    <span class="question-difficulty">{{ getDifficultyLabel(answer.difficulty) }}</span>
                    <span class="question-time">{{ answer.responseTime.toFixed(1) }}秒</span>
                  </div>
                </div>
                <div class="question-result">
                  <div class="result-icon">{{ getResultIcon(answer) }}</div>
                  <div class="result-text">{{ getResultText(answer) }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 改进建议 -->
          <div class="improvement-suggestions">
            <h3>改进建议</h3>
            <div class="suggestions-list">
              <div 
                v-for="suggestion in improvementSuggestions"
                :key="suggestion.type"
                class="suggestion-item"
              >
                <div class="suggestion-icon">{{ suggestion.icon }}</div>
                <div class="suggestion-content">
                  <h4>{{ suggestion.title }}</h4>
                  <p>{{ suggestion.description }}</p>
                  <div class="suggestion-actions">
                    <button 
                      v-for="action in suggestion.actions"
                      :key="action.text"
                      class="suggestion-action"
                      @click="handleSuggestionAction(action)"
                    >
                      {{ action.text }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="result-actions">
            <button @click="exportReport" class="btn-export">
              <i class="fas fa-download"></i>
              导出报告
            </button>
            <button @click="retakeAssessment" class="btn-retake">
              <i class="fas fa-redo"></i>
              重新测评
            </button>
            <button @click="goToTraining" class="btn-training">
              <i class="fas fa-dumbbell"></i>
              开始训练
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

// 导入测试组件
import ArithmeticTest from './tests/ArithmeticTest.vue';
import LogicReasoningTest from './tests/LogicReasoningTest.vue';
import NumberSequenceTest from './tests/NumberSequenceTest.vue';
import MentalMathTest from './tests/MentalMathTest.vue';

// Props
const props = defineProps({
  initialSettings: {
    type: Object,
    default: () => ({})
  }
});

// Emits
const emit = defineEmits(['assessment-completed', 'go-to-training']);

// 响应式数据
const assessmentPhase = ref('setup'); // setup, testing, results
const selectedDifficulty = ref('medium');
const selectedModules = ref(['arithmetic', 'logic']);
const questionCount = ref(20);
const timeLimit = ref(600);
const showHints = ref(true);

const currentModuleIndex = ref(0);
const currentQuestionIndex = ref(0);
const totalQuestions = ref(0);
const remainingTime = ref(0);
const timer = ref(null);

const allAnswers = ref([]);
const moduleResults = ref([]);
const startTime = ref(null);
const radarCanvas = ref(null);

// 配置数据
const difficultyLevels = ref([
  {
    value: 'easy',
    name: '简单',
    icon: '🟢',
    description: '基础计算，适合初学者'
  },
  {
    value: 'medium',
    name: '中等',
    icon: '🟡',
    description: '中等难度，适合大多数人'
  },
  {
    value: 'hard',
    name: '困难',
    icon: '🟠',
    description: '高难度计算，需要较强基础'
  },
  {
    value: 'expert',
    name: '专家',
    icon: '🔴',
    description: '专家级别，极具挑战性'
  }
]);

const testModules = ref([
  {
    key: 'arithmetic',
    name: '基础运算',
    icon: '➕',
    description: '加减乘除等基础数学运算',
    estimatedTime: 5,
    component: 'ArithmeticTest'
  },
  {
    key: 'logic',
    name: '逻辑推理',
    icon: '🧠',
    description: '数学逻辑和推理能力测试',
    estimatedTime: 8,
    component: 'LogicReasoningTest'
  },
  {
    key: 'sequence',
    name: '数字序列',
    icon: '🔢',
    description: '数字规律识别和序列推理',
    estimatedTime: 6,
    component: 'NumberSequenceTest'
  },
  {
    key: 'mental',
    name: '心算能力',
    icon: '⚡',
    description: '快速心算和数字处理能力',
    estimatedTime: 7,
    component: 'MentalMathTest'
  }
]);

// 计算属性
const progressPercentage = computed(() => {
  return totalQuestions.value > 0 ? ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100 : 0;
});

const currentTestComponent = computed(() => {
  const currentModule = selectedModules.value[currentModuleIndex.value];
  const module = testModules.value.find(m => m.key === currentModule);
  return module?.component || 'ArithmeticTest';
});

const currentTestData = computed(() => {
  return {
    difficulty: selectedDifficulty.value,
    questionCount: Math.ceil(questionCount.value / selectedModules.value.length),
    timeLimit: timeLimit.value,
    showHints: showHints.value,
    module: selectedModules.value[currentModuleIndex.value]
  };
});

const overallScore = computed(() => {
  if (moduleResults.value.length === 0) return 0;
  const totalScore = moduleResults.value.reduce((sum, result) => sum + result.score, 0);
  return Math.round(totalScore / moduleResults.value.length);
});

const abilityScores = computed(() => {
  const abilities = [
    { name: '计算速度', key: 'speed', color: '#ff6b6b' },
    { name: '计算准确性', key: 'accuracy', color: '#4ecdc4' },
    { name: '逻辑推理', key: 'logic', color: '#45b7d1' },
    { name: '数字敏感度', key: 'sensitivity', color: '#96ceb4' },
    { name: '问题解决', key: 'problem_solving', color: '#feca57' },
    { name: '抽象思维', key: 'abstract', color: '#ff9ff3' }
  ];
  
  return abilities.map(ability => ({
    ...ability,
    score: calculateAbilityScore(ability.key)
  }));
});

const correctAnswers = computed(() => {
  return allAnswers.value.filter(answer => answer.isCorrect).length;
});

const incorrectAnswers = computed(() => {
  return allAnswers.value.filter(answer => !answer.isCorrect && !answer.isSkipped).length;
});

const skippedAnswers = computed(() => {
  return allAnswers.value.filter(answer => answer.isSkipped).length;
});

const improvementSuggestions = computed(() => {
  const suggestions = [];
  
  // 基于表现生成建议
  if (overallScore.value < 70) {
    suggestions.push({
      type: 'basic_training',
      icon: '📚',
      title: '基础能力提升',
      description: '建议从基础计算开始，逐步提高计算速度和准确性。',
      actions: [
        { text: '基础训练', action: 'basic_training' },
        { text: '查看教程', action: 'view_tutorial' }
      ]
    });
  }
  
  if (getModuleScore('arithmetic') < 75) {
    suggestions.push({
      type: 'arithmetic_practice',
      icon: '➕',
      title: '加强基础运算',
      description: '基础运算能力需要提升，建议多练习四则运算。',
      actions: [
        { text: '运算练习', action: 'arithmetic_practice' }
      ]
    });
  }
  
  if (getModuleScore('logic') < 75) {
    suggestions.push({
      type: 'logic_training',
      icon: '🧠',
      title: '逻辑思维训练',
      description: '逻辑推理能力有待提高，建议进行专项训练。',
      actions: [
        { text: '逻辑训练', action: 'logic_training' }
      ]
    });
  }
  
  return suggestions;
});

// 方法
const toggleModule = (moduleKey) => {
  const index = selectedModules.value.indexOf(moduleKey);
  if (index > -1) {
    selectedModules.value.splice(index, 1);
  } else {
    selectedModules.value.push(moduleKey);
  }
};

const startAssessment = () => {
  assessmentPhase.value = 'testing';
  startTime.value = Date.now();
  currentModuleIndex.value = 0;
  currentQuestionIndex.value = 0;
  totalQuestions.value = questionCount.value;
  remainingTime.value = timeLimit.value;
  allAnswers.value = [];
  moduleResults.value = [];
  
  if (timeLimit.value > 0) {
    startTimer();
  }
};

const startTimer = () => {
  timer.value = setInterval(() => {
    remainingTime.value--;
    if (remainingTime.value <= 0) {
      handleTimeUp();
    }
  }, 1000);
};

const handleTimeUp = () => {
  clearInterval(timer.value);
  completeAssessment();
};

const getCurrentModuleName = () => {
  const currentModule = selectedModules.value[currentModuleIndex.value];
  const module = testModules.value.find(m => m.key === currentModule);
  return module?.name || '';
};

const handleAnswerSubmitted = (answerData) => {
  allAnswers.value.push({
    ...answerData,
    module: selectedModules.value[currentModuleIndex.value],
    timestamp: Date.now()
  });
  
  currentQuestionIndex.value++;
};

const handleTestCompleted = (testResults) => {
  // 记录模块结果
  moduleResults.value.push({
    module: selectedModules.value[currentModuleIndex.value],
    ...testResults.results
  });
  
  // 检查是否还有其他模块
  if (currentModuleIndex.value < selectedModules.value.length - 1) {
    currentModuleIndex.value++;
    // 继续下一个模块的测试
  } else {
    // 所有模块完成，显示结果
    completeAssessment();
  }
};

const completeAssessment = () => {
  clearInterval(timer.value);
  assessmentPhase.value = 'results';
  
  // 绘制雷达图
  nextTick(() => {
    drawRadarChart();
  });
  
  emit('assessment-completed', {
    overallScore: overallScore.value,
    moduleResults: moduleResults.value,
    allAnswers: allAnswers.value,
    totalTime: (Date.now() - startTime.value) / 1000
  });
};

const calculateAbilityScore = (abilityKey) => {
  // 根据不同能力维度计算得分
  switch (abilityKey) {
    case 'speed':
      return calculateSpeedScore();
    case 'accuracy':
      return calculateAccuracyScore();
    case 'logic':
      return getModuleScore('logic') || 0;
    case 'sensitivity':
      return getModuleScore('sequence') || 0;
    case 'problem_solving':
      return calculateProblemSolvingScore();
    case 'abstract':
      return calculateAbstractScore();
    default:
      return 0;
  }
};

const calculateSpeedScore = () => {
  if (allAnswers.value.length === 0) return 0;
  const avgTime = allAnswers.value.reduce((sum, answer) => sum + answer.responseTime, 0) / allAnswers.value.length;
  // 基于平均响应时间计算速度得分
  return Math.max(0, Math.min(100, 100 - (avgTime - 10) * 2));
};

const calculateAccuracyScore = () => {
  if (allAnswers.value.length === 0) return 0;
  return Math.round((correctAnswers.value / allAnswers.value.length) * 100);
};

const calculateProblemSolvingScore = () => {
  // 综合多个模块的表现
  const scores = moduleResults.value.map(result => result.score);
  return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
};

const calculateAbstractScore = () => {
  // 基于逻辑推理和数字序列的表现
  const logicScore = getModuleScore('logic') || 0;
  const sequenceScore = getModuleScore('sequence') || 0;
  return Math.round((logicScore + sequenceScore) / 2);
};

const getModuleScore = (moduleKey) => {
  const result = moduleResults.value.find(r => r.module === moduleKey);
  return result?.score || 0;
};

const drawRadarChart = () => {
  if (!radarCanvas.value) return;
  
  const canvas = radarCanvas.value;
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 150;
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制网格
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, (radius / 5) * i, 0, 2 * Math.PI);
    ctx.stroke();
  }
  
  // 绘制轴线
  const angleStep = (2 * Math.PI) / abilityScores.value.length;
  
  abilityScores.value.forEach((ability, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // 绘制标签
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    const labelX = centerX + Math.cos(angle) * (radius + 20);
    const labelY = centerY + Math.sin(angle) * (radius + 20);
    ctx.fillText(ability.name, labelX, labelY);
  });
  
  // 绘制数据多边形
  ctx.beginPath();
  ctx.fillStyle = 'rgba(74, 144, 226, 0.3)';
  ctx.strokeStyle = '#4a90e2';
  ctx.lineWidth = 2;
  
  abilityScores.value.forEach((ability, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const distance = (ability.score / 100) * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // 绘制数据点
  abilityScores.value.forEach((ability, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const distance = (ability.score / 100) * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = ability.color;
    ctx.fill();
  });
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getScoreLevel = (score) => {
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '中等';
  if (score >= 60) return '及格';
  return '需要提高';
};

const getScoreDescription = (score) => {
  if (score >= 90) return '您的计算能力非常出色，在各个方面都表现优异。';
  if (score >= 80) return '您具有良好的计算能力，在大多数方面表现良好。';
  if (score >= 70) return '您的计算能力处于中等水平，还有提升空间。';
  if (score >= 60) return '您的计算能力达到基本要求，建议加强练习。';
  return '您的计算能力需要显著提高，建议从基础开始系统学习。';
};

const getModuleIcon = (moduleKey) => {
  const module = testModules.value.find(m => m.key === moduleKey);
  return module?.icon || '📊';
};

const getModuleName = (moduleKey) => {
  const module = testModules.value.find(m => m.key === moduleKey);
  return module?.name || moduleKey;
};

const getPerformanceColor = (accuracy) => {
  if (accuracy >= 90) return '#28a745';
  if (accuracy >= 80) return '#17a2b8';
  if (accuracy >= 70) return '#ffc107';
  return '#dc3545';
};

const getPerformanceLabel = (accuracy) => {
  if (accuracy >= 90) return '优秀';
  if (accuracy >= 80) return '良好';
  if (accuracy >= 70) return '中等';
  return '需要提高';
};

const getQuestionStatus = (answer) => {
  if (answer.isSkipped) return 'skipped';
  return answer.isCorrect ? 'correct' : 'incorrect';
};

const getDifficultyLabel = (difficulty) => {
  const labels = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    expert: '专家'
  };
  return labels[difficulty] || difficulty;
};

const getResultIcon = (answer) => {
  if (answer.isSkipped) return '⏭';
  return answer.isCorrect ? '✓' : '✗';
};

const getResultText = (answer) => {
  if (answer.isSkipped) return '跳过';
  return answer.isCorrect ? '正确' : '错误';
};

const exportReport = () => {
  // 导出测评报告
  const reportData = {
    timestamp: new Date().toISOString(),
    overallScore: overallScore.value,
    abilityScores: abilityScores.value,
    moduleResults: moduleResults.value,
    allAnswers: allAnswers.value,
    settings: {
      difficulty: selectedDifficulty.value,
      modules: selectedModules.value,
      questionCount: questionCount.value,
      timeLimit: timeLimit.value
    }
  };
  
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calculation-assessment-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const retakeAssessment = () => {
  assessmentPhase.value = 'setup';
  currentModuleIndex.value = 0;
  currentQuestionIndex.value = 0;
  allAnswers.value = [];
  moduleResults.value = [];
  clearInterval(timer.value);
};

const goToTraining = () => {
  emit('go-to-training', {
    recommendedModules: selectedModules.value,
    difficulty: selectedDifficulty.value,
    weakAreas: getWeakAreas()
  });
};

const getWeakAreas = () => {
  return moduleResults.value
    .filter(result => result.score < 75)
    .map(result => result.module);
};

const handleSuggestionAction = (action) => {
  switch (action.action) {
    case 'basic_training':
      goToTraining();
      break;
    case 'arithmetic_practice':
      emit('go-to-training', { focus: 'arithmetic' });
      break;
    case 'logic_training':
      emit('go-to-training', { focus: 'logic' });
      break;
    case 'view_tutorial':
      // 打开教程
      break;
  }
};

// 生命周期
onMounted(() => {
  // 应用初始设置
  if (props.initialSettings) {
    Object.assign({
      selectedDifficulty: selectedDifficulty.value,
      selectedModules: selectedModules.value,
      questionCount: questionCount.value,
      timeLimit: timeLimit.value,
      showHints: showHints.value
    }, props.initialSettings);
  }
});

onUnmounted(() => {
  // 清理定时器
  if (timer.value) {
    clearInterval(timer.value);
  }
});

// 监听数据变化
watch(() => props.initialSettings, (newSettings) => {
  if (newSettings && assessmentPhase.value === 'setup') {
    Object.assign({
      selectedDifficulty: selectedDifficulty.value,
      selectedModules: selectedModules.value,
      questionCount: questionCount.value,
      timeLimit: timeLimit.value,
      showHints: showHints.value
    }, newSettings);
  }
}, { deep: true });
</script>

<style scoped>
.calculation-assessment {
  width: 90%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.assessment-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 设置阶段 */
.setup-phase {
  padding: 40px;
}

.setup-content h2 {
  font-size: 2.5em;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.assessment-description {
  font-size: 1.1em;
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 40px;
  line-height: 1.6;
}

.setting-group {
  margin-bottom: 40px;
}

.setting-group h3 {
  font-size: 1.3em;
  color: #34495e;
  margin-bottom: 20px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

/* 难度选择 */
.difficulty-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.difficulty-option {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.difficulty-option:hover {
  border-color: #3498db;
  transform: translateY(-2px);
}

.difficulty-option.active {
  border-color: #3498db;
  background: #ebf3fd;
}

.difficulty-icon {
  font-size: 2em;
  margin-right: 15px;
}

.difficulty-info {
  flex: 1;
}

.difficulty-name {
  font-size: 1.1em;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.difficulty-desc {
  font-size: 0.9em;
  color: #7f8c8d;
}

/* 模块选择 */
.module-options {
  display: grid;
  gap: 15px;
}

.module-option {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.module-option:hover {
  border-color: #3498db;
  transform: translateY(-2px);
}

.module-option.active {
  border-color: #27ae60;
  background: #eafaf1;
}

.module-icon {
  font-size: 2em;
  margin-right: 15px;
}

.module-info {
  flex: 1;
}

.module-name {
  font-size: 1.1em;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.module-desc {
  font-size: 0.9em;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.module-time {
  font-size: 0.8em;
  color: #95a5a6;
}

.module-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #bdc3c7;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #27ae60;
  font-weight: bold;
}

.module-option.active .module-checkbox {
  border-color: #27ae60;
  background: #27ae60;
  color: white;
}

/* 个性化设置 */
.personal-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item label {
  font-weight: 600;
  color: #34495e;
}

.setting-item select {
  padding: 10px;
  border: 2px solid #ecf0f1;
  border-radius: 6px;
  font-size: 1em;
  transition: border-color 0.3s ease;
}

.setting-item select:focus {
  outline: none;
  border-color: #3498db;
}

.setting-item input[type="checkbox"] {
  margin-right: 8px;
}

.checkbox-label {
  color: #7f8c8d;
  font-size: 0.9em;
}

.setup-actions {
  text-align: center;
  margin-top: 40px;
}

.btn-start {
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2em;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
}

.btn-start:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.6);
}

.btn-start:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  box-shadow: none;
}

/* 测试进行阶段 */
.testing-phase {
  min-height: 600px;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.test-progress {
  flex: 1;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: 600;
  color: #495057;
}

.current-module {
  color: #007bff;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.test-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1em;
  font-weight: 600;
  color: #dc3545;
}

.test-content {
  padding: 30px;
}

/* 结果展示阶段 */
.results-phase {
  padding: 40px;
}

.results-container h2 {
  text-align: center;
  font-size: 2.2em;
  color: #2c3e50;
  margin-bottom: 40px;
}

/* 综合得分 */
.overall-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin-bottom: 50px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.score-circle {
  width: 150px;
  height: 150px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.score-value {
  font-size: 3em;
  font-weight: bold;
  margin-bottom: 5px;
}

.score-label {
  font-size: 1em;
  opacity: 0.9;
}

.score-description {
  flex: 1;
  max-width: 400px;
}

.score-description h3 {
  font-size: 1.8em;
  margin-bottom: 15px;
}

.score-description p {
  font-size: 1.1em;
  line-height: 1.6;
  opacity: 0.9;
}

/* 能力雷达图 */
.ability-radar {
  margin-bottom: 50px;
  text-align: center;
}

.ability-radar h3 {
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 30px;
}

.radar-chart {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.radar-legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.legend-name {
  flex: 1;
  font-weight: 600;
  color: #495057;
}

.legend-score {
  font-weight: bold;
  color: #007bff;
}

/* 模块结果 */
.module-results {
  margin-bottom: 50px;
}

.module-results h3 {
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 30px;
}

.module-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.module-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.module-card:hover {
  transform: translateY(-5px);
}

.module-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.module-card .module-icon {
  font-size: 2em;
}

.module-title {
  flex: 1;
}

.module-title h4 {
  font-size: 1.2em;
  color: #2c3e50;
  margin-bottom: 5px;
}

.module-score {
  font-size: 1.5em;
  font-weight: bold;
  color: #007bff;
}

.module-stats {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9em;
}

.stat-value {
  font-weight: 600;
  color: #495057;
}

.module-performance {
  text-align: center;
}

.performance-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.performance-fill {
  height: 100%;
  transition: width 0.8s ease;
}

.performance-label {
  font-size: 0.9em;
  font-weight: 600;
}

/* 题目详情 */
.question-details {
  margin-bottom: 50px;
}

.question-details h3 {
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 30px;
}

.details-summary {
  margin-bottom: 30px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  font-weight: bold;
  color: white;
}

.summary-icon.correct {
  background: #28a745;
}

.summary-icon.incorrect {
  background: #dc3545;
}

.summary-icon.skipped {
  background: #6c757d;
}

.summary-text {
  flex: 1;
}

.summary-number {
  font-size: 1.5em;
  font-weight: bold;
  color: #2c3e50;
}

.summary-label {
  font-size: 0.9em;
  color: #6c757d;
}

.question-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.question-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.3s ease;
}

.question-item:last-child {
  border-bottom: none;
}

.question-item:hover {
  background: #f8f9fa;
}

.question-item.correct {
  border-left: 4px solid #28a745;
}

.question-item.incorrect {
  border-left: 4px solid #dc3545;
}

.question-item.skipped {
  border-left: 4px solid #6c757d;
}

.question-number {
  width: 30px;
  height: 30px;
  background: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #495057;
}

.question-content {
  flex: 1;
}

.question-text {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.question-info {
  display: flex;
  gap: 15px;
  font-size: 0.8em;
  color: #6c757d;
}

.question-result {
  text-align: center;
}

.result-icon {
  font-size: 1.2em;
  margin-bottom: 5px;
}

.result-text {
  font-size: 0.8em;
  font-weight: 600;
}

/* 改进建议 */
.improvement-suggestions {
  margin-bottom: 50px;
}

.improvement-suggestions h3 {
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 30px;
}

.suggestions-list {
  display: grid;
  gap: 20px;
}

.suggestion-item {
  display: flex;
  gap: 20px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.suggestion-icon {
  font-size: 2em;
}

.suggestion-content {
  flex: 1;
}

.suggestion-content h4 {
  font-size: 1.2em;
  color: #2c3e50;
  margin-bottom: 10px;
}

.suggestion-content p {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 15px;
}

.suggestion-actions {
  display: flex;
  gap: 10px;
}

.suggestion-action {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease;
}

.suggestion-action:hover {
  background: #2980b9;
}

/* 操作按钮 */
.result-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.result-actions button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-export {
  background: #17a2b8;
  color: white;
}

.btn-export:hover {
  background: #138496;
  transform: translateY(-2px);
}

.btn-retake {
  background: #6c757d;
  color: white;
}

.btn-retake:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-training {
  background: #28a745;
  color: white;
}

.btn-training:hover {
  background: #218838;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .calculation-assessment {
    padding: 10px;
  }
  
  .setup-phase {
    padding: 20px;
  }
  
  .setup-content h2 {
    font-size: 2em;
  }
  
  .difficulty-options {
    grid-template-columns: 1fr;
  }
  
  .personal-settings {
    grid-template-columns: 1fr;
  }
  
  .test-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .overall-score {
    flex-direction: column;
    text-align: center;
  }
  
  .radar-legend {
    grid-template-columns: 1fr;
  }
  
  .module-cards {
    grid-template-columns: 1fr;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .result-actions {
    flex-direction: column;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.assessment-container {
  animation: fadeIn 0.6s ease-out;
}

.module-card {
  animation: slideIn 0.4s ease-out;
}

.question-item {
  animation: fadeIn 0.3s ease-out;
}

/* 主题变量 */
:root {
  --color-primary: #3498db;
  --color-success: #27ae60;
  --color-warning: #f39c12;
  --color-danger: #e74c3c;
  --color-info: #17a2b8;
  --color-light: #ecf0f1;
  --color-dark: #2c3e50;
}
</style>