<template>
  <div class="observation-assessment">
    <div class="assessment-container">
      <div class="assessment-header">
        <h2>观察能力测评</h2>
        <div class="assessment-info">
          <span class="info-item">
            <i class="icon-eye">👁️</i>
            视觉观察力评估
          </span>
          <span class="info-item">
            <i class="icon-time">⏱️</i>
            预计用时: 15-20分钟
          </span>
        </div>
      </div>

      <!-- 测评设置阶段 -->
      <div v-if="currentPhase === 'setup'" class="setup-phase">
        <div class="setup-content">
          <h3>测评设置</h3>
          <p class="setup-description">
            观察能力测评将从多个维度评估您的视觉观察和细节识别能力，
            包括视觉搜索、细节观察、图形比较、变化检测等方面。
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
                    <option value="short">短时测试 (10分钟)</option>
                    <option value="medium">标准测试 (15分钟)</option>
                    <option value="long">完整测试 (20分钟)</option>
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
                    <input type="checkbox" v-model="settings.enableHints">
                    启用提示功能
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="setup-actions">
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
            <span class="progress-text">{{ currentTestIndex + 1 }} / {{ totalTests }}</span>
          </div>
          
          <div class="test-timer">
            <div class="timer-display" :class="{ warning: timeRemaining < 60 }">
              {{ formatTime(timeRemaining) }}
            </div>
          </div>
        </div>
        
        <div class="current-test">
          <!-- 视觉搜索测试 -->
          <VisualSearchTest 
            v-if="currentTest?.type === 'visual-search'"
            :test-data="currentTest"
            :settings="settings"
            @test-completed="handleTestCompleted"
            @answer-submitted="handleAnswerSubmitted"
          />
          
          <!-- 细节观察测试 -->
          <DetailObservationTest 
            v-if="currentTest?.type === 'detail-observation'"
            :test-data="currentTest"
            :settings="settings"
            @test-completed="handleTestCompleted"
            @answer-submitted="handleAnswerSubmitted"
          />
          
          <!-- 图形比较测试 -->
          <PatternComparisonTest 
            v-if="currentTest?.type === 'pattern-comparison'"
            :test-data="currentTest"
            :settings="settings"
            @test-completed="handleTestCompleted"
            @answer-submitted="handleAnswerSubmitted"
          />
          
          <!-- 变化检测测试 -->
          <ChangeDetectionTest 
            v-if="currentTest?.type === 'change-detection'"
            :test-data="currentTest"
            :settings="settings"
            @test-completed="handleTestCompleted"
            @answer-submitted="handleAnswerSubmitted"
          />
        </div>
      </div>

      <!-- 结果展示阶段 -->
      <div v-if="currentPhase === 'results'" class="results-phase">
        <div class="results-container">
          <h3>观察能力测评报告</h3>
          
          <div class="overall-score">
            <div class="score-circle">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#e0e0e0" stroke-width="10"/>
                <circle cx="100" cy="100" r="90" fill="none" stroke="var(--color-primary)" 
                        stroke-width="10" stroke-linecap="round"
                        :stroke-dasharray="`${overallScore * 5.65} 565`"
                        transform="rotate(-90 100 100)"/>
              </svg>
              <div class="score-content">
                <div class="score-value">{{ overallScore }}</div>
                <div class="score-label">综合得分</div>
              </div>
            </div>
            
            <div class="score-details">
              <div class="score-item">
                <span class="label">观察等级:</span>
                <span class="value" :class="observationLevel.toLowerCase()">{{ observationLevel }}</span>
              </div>
              <div class="score-item">
                <span class="label">准确率:</span>
                <span class="value">{{ accuracy }}%</span>
              </div>
              <div class="score-item">
                <span class="label">平均反应时间:</span>
                <span class="value">{{ averageResponseTime }}秒</span>
              </div>
              <div class="score-item">
                <span class="label">完成测试数:</span>
                <span class="value">{{ completedTests }} / {{ totalTests }}</span>
              </div>
            </div>
          </div>
          
          <div class="ability-analysis">
            <h4>能力分析</h4>
            <div class="analysis-content">
              <div class="radar-chart">
                <svg width="300" height="300" viewBox="0 0 300 300">
                  <g transform="translate(150,150)">
                    <!-- 背景网格 -->
                    <g class="radar-grid">
                      <circle v-for="i in 5" :key="i" :r="i * 25" fill="none" stroke="#e0e0e0" stroke-width="1"/>
                      <line v-for="(ability, index) in observationAbilities" 
                            :key="index"
                            :x1="0" :y1="0" 
                            :x2="Math.cos((index * 2 * Math.PI / observationAbilities.length) - Math.PI/2) * 125"
                            :y2="Math.sin((index * 2 * Math.PI / observationAbilities.length) - Math.PI/2) * 125"
                            stroke="#e0e0e0" stroke-width="1"/>
                    </g>
                    
                    <!-- 数据多边形 -->
                    <polygon :points="radarPoints" fill="rgba(74, 144, 226, 0.3)" stroke="#4a90e2" stroke-width="2"/>
                    
                    <!-- 数据点 -->
                    <circle v-for="(point, index) in radarPointsArray" 
                            :key="index"
                            :cx="point.x" :cy="point.y" 
                            r="4" fill="#4a90e2"/>
                    
                    <!-- 标签 -->
                    <text v-for="(ability, index) in observationAbilities" 
                          :key="index"
                          :x="Math.cos((index * 2 * Math.PI / observationAbilities.length) - Math.PI/2) * 140"
                          :y="Math.sin((index * 2 * Math.PI / observationAbilities.length) - Math.PI/2) * 140"
                          text-anchor="middle" dominant-baseline="middle"
                          font-size="12" fill="#333">
                      {{ ability.name }}
                    </text>
                  </g>
                </svg>
              </div>
              
              <div class="ability-details">
                <div v-for="ability in observationAbilities" :key="ability.type" class="ability-item">
                  <div class="ability-header">
                    <span class="ability-icon">{{ ability.icon }}</span>
                    <span class="ability-name">{{ ability.name }}</span>
                    <span class="ability-score">{{ ability.score }}%</span>
                  </div>
                  <div class="ability-bar">
                    <div class="ability-fill" :style="{ width: ability.score + '%' }"></div>
                  </div>
                  <div class="ability-description">{{ ability.description }}</div>
                  <div class="ability-feedback">{{ ability.feedback }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="detailed-results">
            <h4>详细结果</h4>
            <div class="results-tabs">
              <button v-for="tab in resultTabs" :key="tab.id" 
                      class="tab-button" 
                      :class="{ active: activeTab === tab.id }"
                      @click="activeTab = tab.id">
                {{ tab.label }}
              </button>
            </div>
            
            <div class="tab-content">
              <!-- 模块结果 -->
              <div v-if="activeTab === 'modules'" class="module-results">
                <div v-for="module in moduleResults" :key="module.type" class="module-result">
                  <div class="module-header">
                    <span class="module-icon">{{ module.icon }}</span>
                    <span class="module-name">{{ module.name }}</span>
                    <span class="module-score">{{ module.score }}分</span>
                  </div>
                  <div class="module-stats">
                    <div class="stat-item">
                      <span class="stat-label">准确率:</span>
                      <span class="stat-value">{{ module.accuracy }}%</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">平均用时:</span>
                      <span class="stat-value">{{ module.averageTime }}秒</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">完成题数:</span>
                      <span class="stat-value">{{ module.completed }} / {{ module.total }}</span>
                    </div>
                  </div>
                  <div class="module-feedback">{{ module.feedback }}</div>
                </div>
              </div>
              
              <!-- 题目详情 -->
              <div v-if="activeTab === 'questions'" class="question-details">
                <div v-for="(result, index) in questionResults" :key="index" class="question-result">
                  <div class="question-header">
                    <span class="question-number">第 {{ index + 1 }} 题</span>
                    <span class="question-type">{{ getTestTypeName(result.type) }}</span>
                    <span class="question-status" :class="{ correct: result.correct, incorrect: !result.correct }">
                      {{ result.correct ? '✓' : '✗' }}
                    </span>
                  </div>
                  <div class="question-details-content">
                    <div class="detail-item">
                      <span class="detail-label">用时:</span>
                      <span class="detail-value">{{ result.responseTime }}秒</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">难度:</span>
                      <span class="detail-value">{{ getDifficultyLabel(result.difficulty) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">得分:</span>
                      <span class="detail-value">{{ result.score }}分</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 改进建议 -->
              <div v-if="activeTab === 'suggestions'" class="improvement-suggestions">
                <div v-for="suggestion in improvementSuggestions" :key="suggestion.id" class="suggestion-card">
                  <div class="suggestion-header">
                    <span class="suggestion-icon">{{ suggestion.icon }}</span>
                    <span class="suggestion-title">{{ suggestion.title }}</span>
                    <span class="suggestion-priority" :class="suggestion.priority">{{ suggestion.priority }}</span>
                  </div>
                  <div class="suggestion-content">
                    <p>{{ suggestion.description }}</p>
                    <div class="suggestion-actions">
                      <div class="training-methods">
                        <h5>推荐训练:</h5>
                        <div class="method-tags">
                          <span v-for="method in suggestion.methods" :key="method" class="method-tag">
                            {{ method }}
                          </span>
                        </div>
                      </div>
                      <button class="btn-start-training" @click="startTraining(suggestion.trainingPath)">
                        开始训练
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="results-actions">
            <button class="btn-export" @click="exportReport">
              <i class="icon-download">📥</i>
              导出报告
            </button>
            <button class="btn-restart" @click="restartAssessment">
              <i class="icon-restart">🔄</i>
              重新测评
            </button>
            <button class="btn-training" @click="goToTraining">
              <i class="icon-training">🎯</i>
              开始训练
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTrainingStore } from '@/stores';
import VisualSearchTest from './tests/VisualSearchTest.vue';
import DetailObservationTest from './tests/DetailObservationTest.vue';
import PatternComparisonTest from './tests/PatternComparisonTest.vue';
import ChangeDetectionTest from './tests/ChangeDetectionTest.vue';

const router = useRouter();
const trainingStore = useTrainingStore();

// 响应式数据
const currentPhase = ref('setup'); // setup, testing, results
const currentTestIndex = ref(0);
const totalTests = ref(0);
const timeRemaining = ref(1200); // 20分钟
const timer = ref(null);
const startTime = ref(0);
const questionResults = ref([]);
const activeTab = ref('modules');

// 测评设置
const settings = ref({
  difficulty: 'medium',
  selectedModules: ['visual-search', 'detail-observation', 'pattern-comparison', 'change-detection'],
  duration: 'medium',
  feedbackMode: 'delayed',
  enableHints: true
});

// 难度级别
const difficultyLevels = [
  {
    value: 'easy',
    label: '简单',
    description: '适合初学者，题目相对简单，时间充裕'
  },
  {
    value: 'medium',
    label: '中等',
    description: '标准难度，适合大多数用户'
  },
  {
    value: 'hard',
    label: '困难',
    description: '高难度挑战，适合有经验的用户'
  },
  {
    value: 'expert',
    label: '专家',
    description: '极高难度，适合专业人士'
  }
];

// 测试模块
const testModules = [
  {
    id: 'visual-search',
    name: '视觉搜索',
    icon: '🔍',
    description: '在复杂场景中快速定位目标物体'
  },
  {
    id: 'detail-observation',
    name: '细节观察',
    icon: '🔎',
    description: '观察和记忆图像中的细节信息'
  },
  {
    id: 'pattern-comparison',
    name: '图形比较',
    icon: '📊',
    description: '比较图形之间的异同点'
  },
  {
    id: 'change-detection',
    name: '变化检测',
    icon: '🔄',
    description: '检测图像中发生的变化'
  }
];

// 测试数据
const tests = ref([]);
const currentTest = computed(() => tests.value[currentTestIndex.value]);

// 计算属性
const canStart = computed(() => {
  return settings.value.selectedModules.length > 0;
});

const progressPercentage = computed(() => {
  return totalTests.value > 0 ? (currentTestIndex.value / totalTests.value) * 100 : 0;
});

const overallScore = computed(() => {
  if (questionResults.value.length === 0) return 0;
  const totalScore = questionResults.value.reduce((sum, result) => sum + result.score, 0);
  const maxPossibleScore = questionResults.value.length * 100;
  return Math.round((totalScore / maxPossibleScore) * 100);
});

const accuracy = computed(() => {
  if (questionResults.value.length === 0) return 0;
  const correctCount = questionResults.value.filter(result => result.correct).length;
  return Math.round((correctCount / questionResults.value.length) * 100);
});

const averageResponseTime = computed(() => {
  if (questionResults.value.length === 0) return 0;
  const totalTime = questionResults.value.reduce((sum, result) => sum + result.responseTime, 0);
  return (totalTime / questionResults.value.length).toFixed(1);
});

const completedTests = computed(() => questionResults.value.length);

const observationLevel = computed(() => {
  const score = overallScore.value;
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '一般';
  if (score >= 60) return '及格';
  return '需改进';
});

// 观察能力分析
const observationAbilities = computed(() => {
  const abilities = {
    'visual-search': { name: '视觉搜索', icon: '🔍', scores: [] },
    'detail-observation': { name: '细节观察', icon: '🔎', scores: [] },
    'pattern-comparison': { name: '图形比较', icon: '📊', scores: [] },
    'change-detection': { name: '变化检测', icon: '🔄', scores: [] }
  };
  
  // 按测试类型分组计算得分
  questionResults.value.forEach(result => {
    if (abilities[result.type]) {
      abilities[result.type].scores.push(result.score);
    }
  });
  
  return Object.entries(abilities).map(([type, data]) => {
    const avgScore = data.scores.length > 0 
      ? Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length)
      : 0;
    
    return {
      type,
      name: data.name,
      icon: data.icon,
      score: avgScore,
      description: getAbilityDescription(type, avgScore),
      feedback: getAbilityFeedback(type, avgScore)
    };
  });
  
  return Object.entries(abilities).map(([type, data]) => {
    const avgScore = data.scores.length > 0 
      ? Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length)
      : 0;
    
    return {
      type,
      name: data.name,
      icon: data.icon,
      score: avgScore,
      description: getAbilityDescription(type),
      feedback: generateAbilityFeedback(type, avgScore)
    };
  }).filter(ability => ability.score > 0);
});

// 雷达图数据
const radarPoints = computed(() => {
  return observationAbilities.value.map((ability, index) => {
    const angle = (index * 2 * Math.PI / observationAbilities.value.length) - Math.PI/2;
    const radius = (ability.score / 100) * 125;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return `${x},${y}`;
  }).join(' ');
});

const radarPointsArray = computed(() => {
  return observationAbilities.value.map((ability, index) => {
    const angle = (index * 2 * Math.PI / observationAbilities.value.length) - Math.PI/2;
    const radius = (ability.score / 100) * 125;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  });
});

// 模块结果
const moduleResults = computed(() => {
  const modules = {};
  
  questionResults.value.forEach(result => {
    if (!modules[result.type]) {
      modules[result.type] = {
        type: result.type,
        name: getTestTypeName(result.type),
        icon: getTestTypeIcon(result.type),
        scores: [],
        times: [],
        correct: 0,
        total: 0
      };
    }
    
    modules[result.type].scores.push(result.score);
    modules[result.type].times.push(result.responseTime);
    modules[result.type].total++;
    if (result.correct) {
      modules[result.type].correct++;
    }
  });
  
  return Object.values(modules).map(module => ({
    ...module,
    score: Math.round(module.scores.reduce((sum, score) => sum + score, 0) / module.scores.length),
    accuracy: Math.round((module.correct / module.total) * 100),
    averageTime: (module.times.reduce((sum, time) => sum + time, 0) / module.times.length).toFixed(1),
    completed: module.total,
    feedback: generateModuleFeedback(module.type, module.correct / module.total)
  }));
});

// 改进建议
const improvementSuggestions = computed(() => {
  const suggestions = [];
  
  observationAbilities.value.forEach(ability => {
    if (ability.score < 70) {
      suggestions.push({
        id: ability.type,
        icon: ability.icon,
        title: `提升${ability.name}能力`,
        priority: ability.score < 50 ? '高' : '中',
        description: `您的${ability.name}能力得分为${ability.score}%，建议通过针对性训练来提升。`,
        methods: getTrainingMethods(ability.type),
        trainingPath: `/training/observation/${ability.type}`
      });
    }
  });
  
  return suggestions;
});

// 结果标签页
const resultTabs = [
  { id: 'modules', label: '模块结果' },
  { id: 'questions', label: '题目详情' },
  { id: 'suggestions', label: '改进建议' }
];

// 方法
const startAssessment = () => {
  currentPhase.value = 'testing';
  generateTests();
  startTimer();
  startTime.value = Date.now();
};

const generateTests = () => {
  tests.value = [];
  const selectedModules = settings.value.selectedModules;
  const difficulty = settings.value.difficulty;
  
  // 根据难度和时长确定题目数量
  const testCounts = {
    short: { easy: 15, medium: 12, hard: 10, expert: 8 },
    medium: { easy: 20, medium: 16, hard: 14, expert: 12 },
    long: { easy: 25, medium: 20, hard: 18, expert: 15 }
  };
  
  const totalCount = testCounts[settings.value.duration][difficulty];
  const countPerModule = Math.floor(totalCount / selectedModules.length);
  
  selectedModules.forEach(moduleType => {
    for (let i = 0; i < countPerModule; i++) {
      tests.value.push({
        type: moduleType,
        difficulty,
        id: `${moduleType}-${i}`,
        data: generateTestData(moduleType, difficulty)
      });
    }
  });
  
  // 打乱测试顺序
  tests.value = tests.value.sort(() => Math.random() - 0.5);
  totalTests.value = tests.value.length;
};

const generateTestData = (type, difficulty) => {
  // 这里应该根据测试类型和难度生成具体的测试数据
  // 实际实现中会调用各个测试组件的数据生成函数
  return {
    type,
    difficulty,
    // 具体数据由各个测试组件生成
  };
};

const startTimer = () => {
  const durations = {
    short: 600,  // 10分钟
    medium: 900, // 15分钟
    long: 1200   // 20分钟
  };
  
  timeRemaining.value = durations[settings.value.duration];
  
  timer.value = setInterval(() => {
    timeRemaining.value--;
    if (timeRemaining.value <= 0) {
      endAssessment();
    }
  }, 1000);
};

const handleAnswerSubmitted = (result) => {
  questionResults.value.push({
    ...result,
    testIndex: currentTestIndex.value,
    timestamp: Date.now()
  });
};

const handleTestCompleted = (result) => {
  // 处理单个测试完成
  if (currentTestIndex.value < totalTests.value - 1) {
    currentTestIndex.value++;
  } else {
    endAssessment();
  }
};

const endAssessment = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
  
  currentPhase.value = 'results';
  
  // 保存结果到store
  const assessmentResult = {
    type: 'observation',
    timestamp: Date.now(),
    settings: settings.value,
    overallScore: overallScore.value,
    accuracy: accuracy.value,
    averageResponseTime: averageResponseTime.value,
    observationLevel: observationLevel.value,
    abilities: observationAbilities.value,
    moduleResults: moduleResults.value,
    questionResults: questionResults.value,
    timeUsed: (Date.now() - startTime.value) / 1000
  };
  
  trainingStore.saveAssessmentResult(assessmentResult);
};

const getTestTypeName = (type) => {
  const names = {
    'visual-search': '视觉搜索',
    'detail-observation': '细节观察',
    'pattern-comparison': '图形比较',
    'change-detection': '变化检测'
  };
  return names[type] || type;
};

const getTestTypeIcon = (type) => {
  const icons = {
    'visual-search': '🔍',
    'detail-observation': '🔎',
    'pattern-comparison': '📊',
    'change-detection': '🔄'
  };
  return icons[type] || '📝';
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

const getAbilityDescription = (type) => {
  const descriptions = {
    'visual-search': '在复杂视觉环境中快速定位和识别目标对象的能力',
    'detail-observation': '观察、记忆和识别图像细节信息的能力',
    'pattern-comparison': '比较和分析不同图形模式异同的能力',
    'change-detection': '检测和识别视觉场景中变化的能力'
  };
  return descriptions[type] || '';
};

const generateAbilityFeedback = (type, score) => {
  const feedbacks = {
    'visual-search': {
      high: '视觉搜索能力优秀，能够快速准确地定位目标。',
      medium: '视觉搜索能力良好，可以进一步提高搜索效率。',
      low: '视觉搜索能力需要加强，建议多做搜索练习。'
    },
    'detail-observation': {
      high: '细节观察能力出色，对图像细节有很好的感知力。',
      medium: '细节观察能力不错，继续保持观察的敏锐度。',
      low: '细节观察能力有待提升，建议加强细节训练。'
    },
    'pattern-comparison': {
      high: '图形比较能力优秀，能够准确识别图形差异。',
      medium: '图形比较能力良好，分析能力比较强。',
      low: '图形比较能力需要改善，建议多练习图形分析。'
    },
    'change-detection': {
      high: '变化检测能力优秀，对环境变化非常敏感。',
      medium: '变化检测能力良好，观察力比较敏锐。',
      low: '变化检测能力需要提高，建议加强变化感知训练。'
    }
  };
  
  const level = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
  return feedbacks[type]?.[level] || '需要更多练习来提高能力。';
};

const generateModuleFeedback = (type, accuracy) => {
  const score = accuracy * 100;
  return generateAbilityFeedback(type, score);
};

const getTrainingMethods = (type) => {
  const methods = {
    'visual-search': ['视觉搜索游戏', '注意力训练', '反应速度练习'],
    'detail-observation': ['细节记忆训练', '图像观察练习', '专注力提升'],
    'pattern-comparison': ['图形分析训练', '逻辑推理练习', '模式识别游戏'],
    'change-detection': ['变化感知训练', '对比观察练习', '动态视觉训练']
  };
  return methods[type] || ['基础观察训练'];
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const exportReport = () => {
  // 导出测评报告
  const reportData = {
    title: '观察能力测评报告',
    timestamp: new Date().toLocaleString(),
    overallScore: overallScore.value,
    observationLevel: observationLevel.value,
    accuracy: accuracy.value,
    averageResponseTime: averageResponseTime.value,
    abilities: observationAbilities.value,
    moduleResults: moduleResults.value,
    suggestions: improvementSuggestions.value
  };
  
  const dataStr = JSON.stringify(reportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `观察能力测评报告_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};

const restartAssessment = () => {
  currentPhase.value = 'setup';
  currentTestIndex.value = 0;
  questionResults.value = [];
  tests.value = [];
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

const goToTraining = () => {
  router.push('/training/observation');
};

const startTraining = (path) => {
  router.push(path);
};

// 生命周期
onMounted(() => {
  // 初始化设置
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<style scoped>
.observation-assessment {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.assessment-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.assessment-header {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.assessment-header h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: bold;
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
  font-size: 1rem;
  opacity: 0.9;
}

/* 设置阶段 */
.setup-phase {
  padding: 2rem;
}

.setup-content h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  text-align: center;
}

.setup-description {
  text-align: center;
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.setting-group {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--color-primary);
}

.setting-group h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.difficulty-options,
.module-options {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.difficulty-option,
.module-option {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.difficulty-option:hover,
.module-option:hover {
  border-color: var(--color-primary);
  background: #f8f9ff;
}

.difficulty-option input:checked + .option-content,
.module-option input:checked + .option-content {
  color: var(--color-primary);
}

.option-content {
  flex: 1;
}

.option-title {
  font-weight: bold;
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.module-icon {
  font-size: 1.2rem;
}

.option-desc {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.personal-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.setting-item label {
  font-weight: 500;
  color: #333;
  min-width: 80px;
}

.setting-item select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
}

.setting-item input[type="checkbox"] {
  margin-right: 0.5rem;
}

.setup-actions {
  text-align: center;
  margin-top: 2rem;
}

.btn-start {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-start:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.btn-start:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 测试阶段 */
.testing-phase {
  padding: 2rem;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.test-progress {
  flex: 1;
  max-width: 300px;
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
  font-weight: 500;
}

.test-timer {
  display: flex;
  align-items: center;
}

.timer-display {
  background: #f8f9fa;
  padding: 0.8rem 1.2rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.timer-display.warning {
  background: #fff5f5;
  color: #dc3545;
  border-color: #dc3545;
}

.current-test {
  min-height: 400px;
}

/* 结果阶段 */
.results-phase {
  padding: 2rem;
}

.results-container h3 {
  text-align: center;
  color: var(--color-primary);
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.overall-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  margin: 2rem 0;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 16px;
}

.score-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-content {
  position: absolute;
  text-align: center;
}

.score-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

.score-label {
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

.score-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.2rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
  min-width: 250px;
}

.score-item .label {
  font-weight: 500;
  color: #333;
}

.score-item .value {
  font-weight: bold;
  color: var(--color-primary);
}

.score-item .value.优秀 {
  color: #28a745;
}

.score-item .value.良好 {
  color: #17a2b8;
}

.score-item .value.一般 {
  color: #ffc107;
}

.score-item .value.需改进 {
  color: #dc3545;
}

.ability-analysis {
  margin: 2rem 0;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 16px;
}

.ability-analysis h4 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.4rem;
}

.analysis-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: start;
}

.radar-chart {
  display: flex;
  justify-content: center;
}

.radar-grid {
  opacity: 0.3;
}

.ability-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ability-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--color-primary);
}

.ability-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.ability-icon {
  font-size: 1.5rem;
  margin-right: 0.8rem;
}

.ability-name {
  flex: 1;
  font-weight: bold;
  color: #333;
}

.ability-score {
  font-weight: bold;
  color: var(--color-primary);
  font-size: 1.1rem;
}

.ability-bar {
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.ability-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  transition: width 0.8s ease;
}

.ability-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  margin-bottom: 0.8rem;
}

.ability-feedback {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
  font-style: italic;
}

.detailed-results {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.detailed-results h4 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.4rem;
}

.results-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.tab-button {
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
}

.tab-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tab-button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.tab-content {
  min-height: 300px;
}

/* 模块结果 */
.module-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.module-result {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.module-icon {
  font-size: 1.5rem;
  margin-right: 0.8rem;
}

.module-name {
  flex: 1;
  font-weight: bold;
  color: #333;
}

.module-score {
  font-weight: bold;
  color: var(--color-primary);
  font-size: 1.2rem;
}

.module-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
  padding: 0.8rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.stat-value {
  display: block;
  font-weight: bold;
  color: var(--color-primary);
  font-size: 1.1rem;
}

.module-feedback {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
  font-style: italic;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid var(--color-primary);
}

/* 题目详情 */
.question-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.question-result {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.question-number {
  font-weight: bold;
  color: #333;
}

.question-type {
  font-size: 0.8rem;
  background: #f0f0f0;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  color: #666;
}

.question-status {
  font-weight: bold;
  font-size: 1.2rem;
}

.question-status.correct {
  color: #28a745;
}

.question-status.incorrect {
  color: #dc3545;
}

.question-details-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.detail-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.2rem;
}

.detail-value {
  font-weight: bold;
  color: #333;
}

/* 改进建议 */
.improvement-suggestions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.suggestion-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.suggestion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.suggestion-icon {
  font-size: 1.5rem;
  margin-right: 0.8rem;
}

.suggestion-title {
  flex: 1;
  font-weight: bold;
  color: #333;
  font-size: 1.1rem;
}

.suggestion-priority {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.suggestion-priority.高 {
  background: #dc3545;
  color: white;
}

.suggestion-priority.中 {
  background: #ffc107;
  color: #333;
}

.suggestion-priority.低 {
  background: #28a745;
  color: white;
}

.suggestion-content p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.suggestion-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.training-methods {
  flex: 1;
}

.training-methods h5 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 0.9rem;
}

.method-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.method-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.btn-start-training {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-start-training:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* 结果操作 */
.results-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.btn-export,
.btn-restart,
.btn-training {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-export {
  background: #17a2b8;
  color: white;
}

.btn-export:hover {
  background: #138496;
}

.btn-restart {
  background: #6c757d;
  color: white;
}

.btn-restart:hover {
  background: #545b62;
}

.btn-training {
  background: var(--color-primary);
  color: white;
}

.btn-training:hover {
  background: var(--color-primary-dark);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .observation-assessment {
    padding: 1rem;
  }
  
  .assessment-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .overall-score {
    flex-direction: column;
    gap: 2rem;
  }
  
  .analysis-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .module-results {
    grid-template-columns: 1fr;
  }
  
  .question-details {
    grid-template-columns: 1fr;
  }
  
  .results-actions {
    flex-direction: column;
  }
  
  .suggestion-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-start-training {
    width: 100%;
    margin-top: 1rem;
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

.setup-phase,
.testing-phase,
.results-phase {
  animation: fadeIn 0.5s ease-out;
}

.ability-item,
.module-result,
.suggestion-card {
  animation: slideIn 0.3s ease-out;
}

.ability-item:nth-child(2) {
  animation-delay: 0.1s;
}

.ability-item:nth-child(3) {
  animation-delay: 0.2s;
}

.ability-item:nth-child(4) {
  animation-delay: 0.3s;
}

/* 主题变量 */
:root {
  --color-primary: #4a90e2;
  --color-primary-dark: #357abd;
  --color-success: #28a745;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  --color-info: #17a2b8;
  --color-light: #f8f9fa;
  --color-dark: #343a40;
  --border-radius: 8px;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* 滚动条样式 */
.tab-content::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary-dark);
}
</style>