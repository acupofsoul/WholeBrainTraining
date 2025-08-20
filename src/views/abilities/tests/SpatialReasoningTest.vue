<template>
  <div class="spatial-reasoning-test">
    <div class="test-content">
      <div class="test-header">
        <h3>空间推理测试</h3>
        <div class="test-info">
          <span class="timer" :class="{ warning: timeRemaining < 60 }">
            剩余时间: {{ formatTime(timeRemaining) }}
          </span>
          <span class="progress-counter">{{ currentQuestion + 1 }} / {{ totalQuestions }}</span>
        </div>
      </div>

      <!-- 准备阶段 -->
      <div v-if="phase === 'ready'" class="ready-phase">
        <div class="instructions">
          <h4>测试说明</h4>
          <p>这是一个空间推理能力测试，将评估您的三维空间想象和推理能力。</p>
          <p>测试包含图形旋转、空间折叠、立体构造等多种类型的题目。</p>
          <p>请仔细观察图形，运用空间想象力选择正确答案。</p>
        </div>
        
        <div class="test-types">
          <h5>测试类型：</h5>
          <div class="type-grid">
            <div class="type-card">
              <div class="type-icon">🔄</div>
              <div class="type-name">图形旋转</div>
              <div class="type-desc">识别旋转后的图形</div>
            </div>
            <div class="type-card">
              <div class="type-icon">📦</div>
              <div class="type-name">立体构造</div>
              <div class="type-desc">分析三维物体结构</div>
            </div>
            <div class="type-card">
              <div class="type-icon">📄</div>
              <div class="type-name">展开图</div>
              <div class="type-desc">判断立体图形展开</div>
            </div>
            <div class="type-card">
              <div class="type-icon">🧩</div>
              <div class="type-name">空间组合</div>
              <div class="type-desc">组合图形空间关系</div>
            </div>
          </div>
        </div>
        
        <button class="btn-primary" @click="startTest">开始测试</button>
      </div>

      <!-- 测试阶段 -->
      <div v-if="phase === 'testing'" class="testing-phase">
        <div class="question-container">
          <div class="question-header">
            <div class="question-type">
              <span class="type-badge" :class="currentQuestionData.type">
                {{ getTypeLabel(currentQuestionData.type) }}
              </span>
              <span class="difficulty-badge" :class="currentQuestionData.difficulty">
                {{ getDifficultyLabel(currentQuestionData.difficulty) }}
              </span>
            </div>
            <div class="question-timer">
              <div class="timer-circle" :class="{ warning: questionTimeRemaining < 10 }">
                {{ questionTimeRemaining }}
              </div>
            </div>
          </div>
          
          <div class="question-content">
            <h4>{{ currentQuestionData.question }}</h4>
            
            <!-- 图形旋转题 -->
            <div v-if="currentQuestionData.type === 'rotation'" class="rotation-question">
              <div class="original-figure">
                <h5>原图形：</h5>
                <div class="figure-container">
                  <div class="spatial-figure" v-html="currentQuestionData.originalFigure"></div>
                </div>
              </div>
              
              <div class="rotation-info">
                <span class="rotation-label">旋转操作：</span>
                <span class="rotation-desc">{{ currentQuestionData.rotationDesc }}</span>
              </div>
            </div>
            
            <!-- 立体构造题 -->
            <div v-if="currentQuestionData.type === 'construction'" class="construction-question">
              <div class="construction-parts">
                <h5>组成部分：</h5>
                <div class="parts-container">
                  <div v-for="(part, index) in currentQuestionData.parts" 
                       :key="index" 
                       class="part-item">
                    <div class="spatial-figure" v-html="part"></div>
                  </div>
                </div>
              </div>
              
              <div class="construction-hint">
                <span class="hint-label">提示：</span>
                <span class="hint-text">{{ currentQuestionData.hint }}</span>
              </div>
            </div>
            
            <!-- 展开图题 -->
            <div v-if="currentQuestionData.type === 'unfolding'" class="unfolding-question">
              <div class="solid-figure">
                <h5>立体图形：</h5>
                <div class="figure-container">
                  <div class="spatial-figure solid" v-html="currentQuestionData.solidFigure"></div>
                </div>
              </div>
              
              <div class="unfolding-instruction">
                <p>请选择该立体图形的正确展开图：</p>
              </div>
            </div>
            
            <!-- 空间组合题 -->
            <div v-if="currentQuestionData.type === 'combination'" class="combination-question">
              <div class="combination-scenario">
                <h5>空间场景：</h5>
                <div class="scenario-container">
                  <div class="spatial-figure" v-html="currentQuestionData.scenario"></div>
                </div>
              </div>
              
              <div class="combination-task">
                <p>{{ currentQuestionData.task }}</p>
              </div>
            </div>
          </div>
          
          <div class="answer-options">
            <div class="options-grid">
              <button v-for="(option, index) in currentQuestionData.options" 
                      :key="index"
                      class="option-button"
                      :class="{ 
                        selected: selectedAnswer === index,
                        correct: showResult && index === currentQuestionData.correctAnswer,
                        incorrect: showResult && selectedAnswer === index && index !== currentQuestionData.correctAnswer
                      }"
                      @click="selectAnswer(index)"
                      :disabled="showResult">
                <div class="option-label">{{ String.fromCharCode(65 + index) }}</div>
                <div class="option-figure" v-html="option"></div>
              </button>
            </div>
          </div>
          
          <div class="question-actions">
            <button class="btn-hint" @click="toggleHint" :disabled="showHint || !currentQuestionData.hint">
              💡 提示
            </button>
            <button class="btn-submit" @click="submitAnswer" :disabled="selectedAnswer === null || showResult">
              提交答案
            </button>
            <button v-if="showResult" class="btn-next" @click="nextQuestion">
              {{ currentQuestion < totalQuestions - 1 ? '下一题' : '完成测试' }}
            </button>
          </div>
          
          <!-- 提示信息 -->
          <div v-if="showHint && currentQuestionData.hint" class="hint-panel">
            <div class="hint-header">
              <span class="hint-icon">💡</span>
              <span class="hint-title">解题提示</span>
            </div>
            <div class="hint-content">
              {{ currentQuestionData.hint }}
            </div>
          </div>
          
          <!-- 答案解析 -->
          <div v-if="showResult" class="answer-explanation">
            <div class="explanation-header">
              <span class="result-icon" :class="{ correct: isCorrect, incorrect: !isCorrect }">
                {{ isCorrect ? '✓' : '✗' }}
              </span>
              <span class="result-text">
                {{ isCorrect ? '回答正确！' : '回答错误！' }}
              </span>
            </div>
            <div class="explanation-content">
              <h5>解析：</h5>
              <p>{{ currentQuestionData.explanation }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="phase === 'results'" class="results-phase">
        <div class="results-container">
          <h3>空间推理测试完成</h3>
          <div class="final-stats">
            <div class="stat-card">
              <div class="stat-value">{{ totalScore }}</div>
              <div class="stat-label">总得分</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ correctCount }} / {{ totalQuestions }}</div>
              <div class="stat-label">正确题数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ accuracy }}%</div>
              <div class="stat-label">准确率</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ spatialLevel }}</div>
              <div class="stat-label">空间能力等级</div>
            </div>
          </div>
          
          <div class="spatial-analysis">
            <h4>空间能力分析</h4>
            <div class="analysis-radar">
              <svg width="300" height="300" viewBox="0 0 300 300">
                <!-- 雷达图背景 -->
                <g transform="translate(150,150)">
                  <!-- 网格线 -->
                  <g class="radar-grid">
                    <circle v-for="i in 5" :key="i" :r="i * 20" fill="none" stroke="#e0e0e0" stroke-width="1"/>
                    <line v-for="(ability, index) in spatialAbilities" 
                          :key="index"
                          :x1="0" :y1="0" 
                          :x2="Math.cos((index * 2 * Math.PI / spatialAbilities.length) - Math.PI/2) * 100"
                          :y2="Math.sin((index * 2 * Math.PI / spatialAbilities.length) - Math.PI/2) * 100"
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
                  <text v-for="(ability, index) in spatialAbilities" 
                        :key="index"
                        :x="Math.cos((index * 2 * Math.PI / spatialAbilities.length) - Math.PI/2) * 120"
                        :y="Math.sin((index * 2 * Math.PI / spatialAbilities.length) - Math.PI/2) * 120"
                        text-anchor="middle" dominant-baseline="middle"
                        font-size="12" fill="#333">
                    {{ ability.name }}
                  </text>
                </g>
              </svg>
            </div>
            
            <div class="ability-details">
              <div v-for="ability in spatialAbilities" :key="ability.type" class="ability-item">
                <div class="ability-header">
                  <span class="ability-name">{{ ability.name }}</span>
                  <span class="ability-score">{{ ability.score }}%</span>
                </div>
                <div class="ability-bar">
                  <div class="ability-fill" :style="{ width: ability.score + '%' }"></div>
                </div>
                <div class="ability-feedback">{{ ability.feedback }}</div>
              </div>
            </div>
          </div>
          
          <div class="detailed-results">
            <h4>详细结果</h4>
            <div class="question-results">
              <div v-for="(result, index) in questionResults" :key="index" class="question-result">
                <div class="result-header">
                  <span class="question-number">第 {{ index + 1 }} 题</span>
                  <span class="question-type-label">{{ getTypeLabel(result.type) }}</span>
                  <span class="result-status" :class="{ correct: result.correct, incorrect: !result.correct }">
                    {{ result.correct ? '✓' : '✗' }}
                  </span>
                </div>
                <div class="result-details">
                  <span class="time-used">用时: {{ result.timeUsed }}s</span>
                  <span class="difficulty-level">难度: {{ getDifficultyLabel(result.difficulty) }}</span>
                  <span class="points-earned">得分: {{ result.points }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  testData: {
    type: Object,
    required: true
  },
  settings: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['answer-submitted', 'test-completed']);

// 测试状态
const phase = ref('ready');
const currentQuestion = ref(0);
const totalQuestions = ref(15);
const timeRemaining = ref(900); // 15分钟
const questionTimeRemaining = ref(90);
const timer = ref(null);
const questionTimer = ref(null);
const startTime = ref(0);
const questionStartTime = ref(0);

// 答题状态
const selectedAnswer = ref(null);
const showResult = ref(false);
const showHint = ref(false);
const isCorrect = ref(false);
const questionResults = ref([]);
const usedHints = ref(0);

// 题目数据
const questions = ref([]);
const currentQuestionData = computed(() => questions.value[currentQuestion.value] || {});

// 统计数据
const correctCount = computed(() => questionResults.value.filter(r => r.correct).length);
const accuracy = computed(() => {
  return questionResults.value.length > 0 ? Math.round((correctCount.value / questionResults.value.length) * 100) : 0;
});
const totalScore = computed(() => questionResults.value.reduce((sum, r) => sum + r.points, 0));

const spatialLevel = computed(() => {
  const score = accuracy.value;
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '一般';
  return '需改进';
});

// 空间能力分析
const spatialAbilities = computed(() => {
  const typeStats = {
    rotation: { correct: 0, total: 0, name: '旋转能力' },
    construction: { correct: 0, total: 0, name: '构造能力' },
    unfolding: { correct: 0, total: 0, name: '展开能力' },
    combination: { correct: 0, total: 0, name: '组合能力' }
  };
  
  questionResults.value.forEach(result => {
    if (typeStats[result.type]) {
      typeStats[result.type].total++;
      if (result.correct) {
        typeStats[result.type].correct++;
      }
    }
  });
  
  return Object.entries(typeStats).map(([type, stats]) => {
    const score = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return {
      type,
      name: stats.name,
      score,
      feedback: generateAbilityFeedback(type, score)
    };
  }).filter(ability => ability.score > 0);
});

// 雷达图数据
const radarPoints = computed(() => {
  return spatialAbilities.value.map((ability, index) => {
    const angle = (index * 2 * Math.PI / spatialAbilities.value.length) - Math.PI/2;
    const radius = (ability.score / 100) * 100;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return `${x},${y}`;
  }).join(' ');
});

const radarPointsArray = computed(() => {
  return spatialAbilities.value.map((ability, index) => {
    const angle = (index * 2 * Math.PI / spatialAbilities.value.length) - Math.PI/2;
    const radius = (ability.score / 100) * 100;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  });
});

// 题目库
const questionBank = {
  rotation: [
    {
      question: "下面哪个图形是原图形顺时针旋转90度后的结果？",
      originalFigure: '<div style="width:60px;height:60px;background:linear-gradient(45deg, #4a90e2 50%, transparent 50%);border:2px solid #333;"></div>',
      rotationDesc: "顺时针旋转90度",
      options: [
        '<div style="width:60px;height:60px;background:linear-gradient(135deg, #4a90e2 50%, transparent 50%);border:2px solid #333;"></div>',
        '<div style="width:60px;height:60px;background:linear-gradient(-45deg, #4a90e2 50%, transparent 50%);border:2px solid #333;"></div>',
        '<div style="width:60px;height:60px;background:linear-gradient(225deg, #4a90e2 50%, transparent 50%);border:2px solid #333;"></div>',
        '<div style="width:60px;height:60px;background:linear-gradient(315deg, #4a90e2 50%, transparent 50%);border:2px solid #333;"></div>'
      ],
      correctAnswer: 1,
      explanation: "原图形的对角线从左上到右下，顺时针旋转90度后变为从右上到左下。",
      hint: "想象图形绕中心点顺时针转动90度的样子。",
      difficulty: 'easy'
    },
    {
      question: "下面哪个图形是原图形逆时针旋转180度后的结果？",
      originalFigure: '<div style="width:60px;height:60px;background:#4a90e2;clip-path:polygon(0 0, 100% 0, 50% 100%);border:2px solid #333;"></div>',
      rotationDesc: "逆时针旋转180度",
      options: [
        '<div style="width:60px;height:60px;background:#4a90e2;clip-path:polygon(50% 0, 0 100%, 100% 100%);border:2px solid #333;"></div>',
        '<div style="width:60px;height:60px;background:#4a90e2;clip-path:polygon(0 0, 100% 50%, 0 100%);border:2px solid #333;"></div>',
        '<div style="width:60px;height:60px;background:#4a90e2;clip-path:polygon(0 50%, 100% 0, 100% 100%);border:2px solid #333;"></div>',
        '<div style="width:60px;height:60px;background:#4a90e2;clip-path:polygon(0 0, 100% 0, 50% 100%);border:2px solid #333;"></div>'
      ],
      correctAnswer: 0,
      explanation: "三角形顶点向上，旋转180度后顶点向下。",
      hint: "180度旋转相当于上下颠倒。",
      difficulty: 'medium'
    }
  ],
  construction: [
    {
      question: "用下面的部件能组成什么立体图形？",
      parts: [
        '<div style="width:40px;height:40px;background:#ff6b6b;border:2px solid #333;"></div>',
        '<div style="width:40px;height:40px;background:#4ecdc4;border:2px solid #333;"></div>',
        '<div style="width:40px;height:40px;background:#45b7d1;border:2px solid #333;"></div>',
        '<div style="width:40px;height:40px;background:#96ceb4;border:2px solid #333;"></div>'
      ],
      options: [
        '<div style="width:80px;height:80px;background:linear-gradient(45deg, #ff6b6b 25%, #4ecdc4 25%, #4ecdc4 50%, #45b7d1 50%, #45b7d1 75%, #96ceb4 75%);border:2px solid #333;"></div>',
        '<div style="width:80px;height:40px;background:linear-gradient(to right, #ff6b6b 25%, #4ecdc4 25%, #4ecdc4 50%, #45b7d1 50%, #45b7d1 75%, #96ceb4 75%);border:2px solid #333;"></div>',
        '<div style="width:40px;height:80px;background:linear-gradient(to bottom, #ff6b6b 25%, #4ecdc4 25%, #4ecdc4 50%, #45b7d1 50%, #45b7d1 75%, #96ceb4 75%);border:2px solid #333;"></div>',
        '<div style="width:60px;height:60px;background:radial-gradient(circle, #ff6b6b 20%, #4ecdc4 20%, #4ecdc4 40%, #45b7d1 40%, #45b7d1 60%, #96ceb4 60%);border:2px solid #333;"></div>'
      ],
      correctAnswer: 0,
      explanation: "四个正方形可以组成一个2×2的大正方形。",
      hint: "考虑如何将四个相同大小的正方形拼接在一起。",
      difficulty: 'easy'
    }
  ],
  unfolding: [
    {
      question: "下面哪个是正方体的正确展开图？",
      solidFigure: '<div style="width:60px;height:60px;background:linear-gradient(135deg, #4a90e2 50%, #357abd 50%);border:2px solid #333;position:relative;"><div style="position:absolute;top:-10px;left:10px;width:40px;height:10px;background:#2c5aa0;transform:skewX(-45deg);"></div><div style="position:absolute;top:10px;right:-10px;width:10px;height:40px;background:#1e3a5f;transform:skewY(-45deg);"></div></div>',
      options: [
        '<div style="display:grid;grid-template-columns:repeat(4,20px);grid-template-rows:repeat(3,20px);gap:1px;"><div style="grid-column:2;grid-row:1;background:#4a90e2;border:1px solid #333;"></div><div style="grid-column:1/5;grid-row:2;background:#4a90e2;border:1px solid #333;"></div><div style="grid-column:2;grid-row:3;background:#4a90e2;border:1px solid #333;"></div></div>',
        '<div style="display:grid;grid-template-columns:repeat(3,20px);grid-template-rows:repeat(4,20px);gap:1px;"><div style="grid-column:1;grid-row:2;background:#4a90e2;border:1px solid #333;"></div><div style="grid-column:2;grid-row:1/5;background:#4a90e2;border:1px solid #333;"></div><div style="grid-column:3;grid-row:2;background:#4a90e2;border:1px solid #333;"></div></div>',
        '<div style="display:grid;grid-template-columns:repeat(3,20px);grid-template-rows:repeat(3,20px);gap:1px;"><div style="grid-column:1/4;grid-row:1;background:#4a90e2;border:1px solid #333;"></div><div style="grid-column:1/4;grid-row:2;background:#4a90e2;border:1px solid #333;"></div></div>',
        '<div style="display:grid;grid-template-columns:repeat(2,20px);grid-template-rows:repeat(3,20px);gap:1px;"><div style="grid-column:1/3;grid-row:1/4;background:#4a90e2;border:1px solid #333;"></div></div>'
      ],
      correctAnswer: 0,
      explanation: "正方体有6个面，展开图应该是十字形，包含一个中心面和四个相邻面，以及一个对面。",
      hint: "正方体展开图通常呈十字形或T字形。",
      difficulty: 'medium'
    }
  ],
  combination: [
    {
      question: "如果将图形A放在图形B的上方，会形成什么样的组合？",
      scenario: '<div style="display:flex;gap:20px;align-items:center;"><div style="text-align:center;"><div style="margin-bottom:5px;">图形A</div><div style="width:40px;height:40px;background:#ff6b6b;border-radius:50%;border:2px solid #333;"></div></div><div style="font-size:20px;">+</div><div style="text-align:center;"><div style="margin-bottom:5px;">图形B</div><div style="width:40px;height:40px;background:#4ecdc4;border:2px solid #333;"></div></div></div>',
      task: "选择正确的组合结果：",
      options: [
        '<div style="position:relative;width:40px;height:60px;"><div style="position:absolute;bottom:0;width:40px;height:40px;background:#4ecdc4;border:2px solid #333;"></div><div style="position:absolute;top:0;left:0;width:40px;height:40px;background:#ff6b6b;border-radius:50%;border:2px solid #333;"></div></div>',
        '<div style="position:relative;width:60px;height:40px;"><div style="position:absolute;left:0;width:40px;height:40px;background:#4ecdc4;border:2px solid #333;"></div><div style="position:absolute;right:0;width:40px;height:40px;background:#ff6b6b;border-radius:50%;border:2px solid #333;"></div></div>',
        '<div style="position:relative;width:40px;height:40px;"><div style="position:absolute;width:40px;height:40px;background:#4ecdc4;border:2px solid #333;"></div><div style="position:absolute;width:40px;height:40px;background:#ff6b6b;border-radius:50%;border:2px solid #333;opacity:0.7;"></div></div>',
        '<div style="display:flex;gap:5px;"><div style="width:40px;height:40px;background:#ff6b6b;border-radius:50%;border:2px solid #333;"></div><div style="width:40px;height:40px;background:#4ecdc4;border:2px solid #333;"></div></div>'
      ],
      correctAnswer: 0,
      explanation: "圆形A放在正方形B的上方，形成垂直叠加的组合。",
      hint: "注意题目说的是'上方'，不是'旁边'或'重叠'。",
      difficulty: 'easy'
    }
  ]
};

// 方法
const startTest = () => {
  phase.value = 'testing';
  generateQuestions();
  startTime.value = Date.now();
  startTimer();
  startQuestionTimer();
};

const generateQuestions = () => {
  const difficulty = props.settings.difficulty;
  const config = {
    easy: { total: 12, distribution: { easy: 0.7, medium: 0.3, hard: 0 } },
    medium: { total: 15, distribution: { easy: 0.4, medium: 0.5, hard: 0.1 } },
    hard: { total: 18, distribution: { easy: 0.2, medium: 0.5, hard: 0.3 } },
    expert: { total: 20, distribution: { easy: 0.1, medium: 0.4, hard: 0.5 } }
  };
  
  const difficultyConfig = config[difficulty] || config.medium;
  totalQuestions.value = difficultyConfig.total;
  
  questions.value = [];
  const types = ['rotation', 'construction', 'unfolding', 'combination'];
  
  for (let i = 0; i < totalQuestions.value; i++) {
    const type = types[i % types.length];
    const typeQuestions = questionBank[type];
    const randomQuestion = typeQuestions[Math.floor(Math.random() * typeQuestions.length)];
    
    questions.value.push({
      ...randomQuestion,
      type,
      id: i
    });
  }
  
  // 打乱题目顺序
  questions.value = questions.value.sort(() => Math.random() - 0.5);
};

const startTimer = () => {
  timer.value = setInterval(() => {
    timeRemaining.value--;
    if (timeRemaining.value <= 0) {
      endTest();
    }
  }, 1000);
};

const startQuestionTimer = () => {
  questionStartTime.value = Date.now();
  questionTimeRemaining.value = getQuestionTimeLimit();
  
  questionTimer.value = setInterval(() => {
    questionTimeRemaining.value--;
    if (questionTimeRemaining.value <= 0) {
      // 时间到，自动提交
      if (selectedAnswer.value === null) {
        selectedAnswer.value = -1; // 标记为超时
      }
      submitAnswer();
    }
  }, 1000);
};

const stopTimers = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
  if (questionTimer.value) {
    clearInterval(questionTimer.value);
    questionTimer.value = null;
  }
};

const getQuestionTimeLimit = () => {
  const difficulty = currentQuestionData.value.difficulty;
  const limits = { easy: 90, medium: 120, hard: 150 };
  return limits[difficulty] || 120;
};

const selectAnswer = (index) => {
  if (!showResult.value) {
    selectedAnswer.value = index;
  }
};

const toggleHint = () => {
  showHint.value = true;
  usedHints.value++;
};

const submitAnswer = () => {
  if (questionTimer.value) {
    clearInterval(questionTimer.value);
  }
  
  const timeUsed = Math.round((Date.now() - questionStartTime.value) / 1000);
  const correct = selectedAnswer.value === currentQuestionData.value.correctAnswer;
  isCorrect.value = correct;
  
  let points = 0;
  if (correct) {
    const basePoints = { easy: 6, medium: 10, hard: 15 };
    points = basePoints[currentQuestionData.value.difficulty] || 10;
    
    // 时间奖励
    const timeBonus = Math.max(0, (questionTimeRemaining.value / getQuestionTimeLimit()) * 3);
    points += Math.round(timeBonus);
    
    // 提示惩罚
    if (showHint.value) {
      points = Math.round(points * 0.7);
    }
  }
  
  const result = {
    questionId: currentQuestionData.value.id,
    type: currentQuestionData.value.type,
    difficulty: currentQuestionData.value.difficulty,
    correct,
    selectedAnswer: selectedAnswer.value,
    correctAnswer: currentQuestionData.value.correctAnswer,
    timeUsed,
    points,
    usedHint: showHint.value
  };
  
  questionResults.value.push(result);
  showResult.value = true;
  
  emit('answer-submitted', result);
};

const nextQuestion = () => {
  if (currentQuestion.value < totalQuestions.value - 1) {
    currentQuestion.value++;
    selectedAnswer.value = null;
    showResult.value = false;
    showHint.value = false;
    startQuestionTimer();
  } else {
    endTest();
  }
};

const endTest = () => {
  stopTimers();
  phase.value = 'results';
  
  const result = {
    totalScore: totalScore.value,
    correctCount: correctCount.value,
    totalQuestions: totalQuestions.value,
    accuracy: accuracy.value,
    spatialLevel: spatialLevel.value,
    timeUsed: 900 - timeRemaining.value,
    usedHints: usedHints.value,
    difficulty: props.settings.difficulty,
    spatialAbilities: spatialAbilities.value,
    questionResults: questionResults.value
  };
  
  setTimeout(() => {
    emit('test-completed', result);
  }, 3000);
};

const getTypeLabel = (type) => {
  const labels = {
    rotation: '图形旋转',
    construction: '立体构造',
    unfolding: '展开图',
    combination: '空间组合'
  };
  return labels[type] || type;
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

const generateAbilityFeedback = (type, score) => {
  const feedbacks = {
    rotation: {
      high: '图形旋转能力优秀，空间想象力强。',
      medium: '图形旋转能力良好，可以进一步提高。',
      low: '图形旋转能力需要加强，建议多做旋转练习。'
    },
    construction: {
      high: '立体构造能力优秀，三维思维清晰。',
      medium: '立体构造能力良好，继续保持。',
      low: '立体构造能力需要提高，建议加强空间训练。'
    },
    unfolding: {
      high: '展开图理解能力优秀，空间转换能力强。',
      medium: '展开图理解能力良好，思路比较清晰。',
      low: '展开图理解能力需要改善，建议多练习立体图形。'
    },
    combination: {
      high: '空间组合能力优秀，能够准确理解空间关系。',
      medium: '空间组合能力良好，空间感知力不错。',
      low: '空间组合能力需要提升，建议多做组合练习。'
    }
  };
  
  const level = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
  return feedbacks[type]?.[level] || '需要更多练习来提高能力。';
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 生命周期
onMounted(() => {
  const difficulty = props.settings.difficulty;
  const config = {
    easy: { duration: 720 },   // 12分钟
    medium: { duration: 900 }, // 15分钟
    hard: { duration: 1080 },  // 18分钟
    expert: { duration: 1200 } // 20分钟
  };
  
  const difficultyConfig = config[difficulty] || config.medium;
  timeRemaining.value = difficultyConfig.duration;
});

onUnmounted(() => {
  stopTimers();
});
</script>

<style scoped>
.spatial-reasoning-test {
  max-width: 1000px;
  margin: 0 auto;
}

.test-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.test-header h3 {
  color: var(--color-primary);
  margin: 0;
}

.test-info {
  display: flex;
  gap: 1rem;
}

.timer {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  color: var(--color-primary);
}

.timer.warning {
  background: #fff5f5;
  color: #dc3545;
}

.progress-counter {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  color: #666;
}

/* 准备阶段 */
.ready-phase {
  text-align: center;
  padding: 2rem;
}

.instructions {
  margin-bottom: 2rem;
}

.instructions h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.instructions p {
  margin-bottom: 0.5rem;
  line-height: 1.6;
  color: #666;
}

.test-types {
  margin: 2rem 0;
}

.test-types h5 {
  margin-bottom: 1rem;
  color: #333;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.type-card {
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
}

.type-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.type-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
}

.type-desc {
  font-size: 0.9rem;
  color: #666;
}

/* 测试阶段 */
.testing-phase {
  padding: 1rem;
}

.question-container {
  max-width: 800px;
  margin: 0 auto;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.question-type {
  display: flex;
  gap: 0.5rem;
}

.type-badge {
  background: var(--color-primary);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.difficulty-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.difficulty-badge.easy {
  background: #28a745;
  color: white;
}

.difficulty-badge.medium {
  background: #ffc107;
  color: #333;
}

.difficulty-badge.hard {
  background: #dc3545;
  color: white;
}

.question-timer {
  display: flex;
  align-items: center;
}

.timer-circle {
  width: 60px;
  height: 60px;
  border: 4px solid var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-primary);
  background: white;
}

.timer-circle.warning {
  border-color: #dc3545;
  color: #dc3545;
  background: #fff5f5;
}

.question-content {
  margin: 2rem 0;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid var(--color-primary);
}

.question-content h4 {
  margin-bottom: 1.5rem;
  color: #333;
}

/* 图形旋转题 */
.rotation-question {
  text-align: center;
}

.original-figure {
  margin-bottom: 2rem;
}

.original-figure h5 {
  margin-bottom: 1rem;
  color: #333;
}

.figure-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.spatial-figure {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rotation-info {
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 3px solid #2196f3;
}

.rotation-label {
  font-weight: bold;
  color: #1565c0;
  margin-right: 0.5rem;
}

.rotation-desc {
  color: #1976d2;
}

/* 立体构造题 */
.construction-question {
  text-align: center;
}

.construction-parts h5 {
  margin-bottom: 1rem;
  color: #333;
}

.parts-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0;
}

.part-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.construction-hint {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fff3cd;
  border-radius: 8px;
  border-left: 3px solid #ffc107;
}

.hint-label {
  font-weight: bold;
  color: #856404;
  margin-right: 0.5rem;
}

.hint-text {
  color: #856404;
}

/* 展开图题 */
.unfolding-question {
  text-align: center;
}

.solid-figure h5 {
  margin-bottom: 1rem;
  color: #333;
}

.spatial-figure.solid {
  margin: 1rem 0;
}

.unfolding-instruction {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #e8f5e8;
  border-radius: 8px;
  border-left: 3px solid #28a745;
}

.unfolding-instruction p {
  margin: 0;
  color: #155724;
  font-weight: 500;
}

/* 空间组合题 */
.combination-question {
  text-align: center;
}

.combination-scenario h5 {
  margin-bottom: 1rem;
  color: #333;
}

.scenario-container {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.combination-task {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f3e5f5;
  border-radius: 8px;
  border-left: 3px solid #9c27b0;
}

.combination-task p {
  margin: 0;
  color: #4a148c;
  font-weight: 500;
}

/* 答案选项 */
.answer-options {
  margin: 2rem 0;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.option-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border: 2px solid #ddd;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
}

.option-button:hover {
  border-color: var(--color-primary);
  background: #f8f9ff;
}

.option-button.selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.option-button.correct {
  border-color: #28a745;
  background: #28a745;
  color: white;
}

.option-button.incorrect {
  border-color: #dc3545;
  background: #dc3545;
  color: white;
}

.option-label {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.option-figure {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 操作按钮 */
.question-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.btn-hint {
  background: #ffc107;
  color: #333;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-hint:hover:not(:disabled) {
  background: #e0a800;
}

.btn-hint:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-next {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-next:hover {
  background: #218838;
}

/* 提示面板 */
.hint-panel {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #fff3cd;
  border-radius: 12px;
  border-left: 4px solid #ffc107;
}

.hint-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.hint-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.hint-title {
  font-weight: bold;
  color: #856404;
}

.hint-content {
  color: #856404;
  line-height: 1.6;
}

/* 答案解析 */
.answer-explanation {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #17a2b8;
}

.explanation-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.result-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 0.8rem;
}

.result-icon.correct {
  background: #28a745;
  color: white;
}

.result-icon.incorrect {
  background: #dc3545;
  color: white;
}

.result-text {
  font-weight: bold;
  font-size: 1.1rem;
}

.explanation-content h5 {
  margin-bottom: 0.8rem;
  color: #333;
}

.explanation-content p {
  line-height: 1.6;
  color: #555;
}

/* 结果阶段 */
.results-phase {
  padding: 2rem;
  text-align: center;
}

.results-container h3 {
  color: var(--color-primary);
  margin-bottom: 2rem;
}

.final-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--color-primary);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.spatial-analysis {
  margin: 2rem 0;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: left;
}

.spatial-analysis h4 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.analysis-radar {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.radar-grid {
  opacity: 0.3;
}

.ability-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.ability-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.ability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.ability-name {
  font-weight: bold;
  color: #333;
}

.ability-score {
  font-weight: bold;
  color: var(--color-primary);
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
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.ability-feedback {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.detailed-results {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
  text-align: left;
}

.detailed-results h4 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.question-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.question-result {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ddd;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.question-number {
  font-weight: bold;
  color: #333;
}

.question-type-label {
  font-size: 0.8rem;
  background: #f0f0f0;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  color: #666;
}

.result-status {
  font-weight: bold;
  font-size: 1.2rem;
}

.result-status.correct {
  color: #28a745;
}

.result-status.incorrect {
  color: #dc3545;
}

.result-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
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
  font-size: 1rem;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .type-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .final-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .ability-details {
    grid-template-columns: 1fr;
  }
  
  .question-results {
    grid-template-columns: 1fr;
  }
}
</style>