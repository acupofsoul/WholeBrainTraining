<template>
  <div class="pattern-comparison-test">
    <div class="test-container">
      <!-- 测试说明阶段 -->
      <div v-if="testPhase === 'instruction'" class="instruction-phase">
        <div class="instruction-content">
          <h3>模式比较测试</h3>
          <p class="instruction-text">
            这个测试将评估您的模式识别和比较能力。您需要观察不同的图形模式，找出它们之间的相似性和差异性。
          </p>
          
          <div class="instruction-steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-text">观察给出的参考模式</div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-text">比较候选选项中的模式</div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-text">选择最匹配的模式</div>
            </div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-text">在规定时间内完成所有题目</div>
            </div>
          </div>
          
          <button @click="startTest" class="btn-start">
            开始测试
          </button>
        </div>
      </div>

      <!-- 测试进行阶段 -->
      <div v-else-if="testPhase === 'testing'" class="testing-phase">
        <div class="test-header">
          <div class="test-info">
            <div class="question-counter">
              题目 {{ currentQuestionIndex + 1 }} / {{ questions.length }}
            </div>
            <div class="timer">
              ⏱️ {{ formatTime(questionTime) }}
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>

        <div class="question-container">
          <h4>{{ currentQuestion.question }}</h4>
          
          <!-- 参考模式 -->
          <div class="reference-pattern">
            <h5>参考模式：</h5>
            <div class="pattern-display">
              <svg width="200" height="200" class="pattern-svg">
                <component 
                  :is="'g'" 
                  v-html="generatePatternSVG(currentQuestion.referencePattern)"
                />
              </svg>
            </div>
          </div>

          <!-- 选项模式 -->
          <div class="options-container">
            <h5>请选择最匹配的模式：</h5>
            <div class="pattern-options">
              <div 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="option-pattern"
                :class="{ selected: selectedAnswer === index }"
                @click="selectAnswer(index)"
              >
                <div class="option-letter">{{ String.fromCharCode(65 + index) }}</div>
                <svg width="150" height="150" class="pattern-svg">
                  <component 
                    :is="'g'" 
                    v-html="generatePatternSVG(option.pattern)"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div class="question-controls">
            <button 
              @click="submitAnswer" 
              :disabled="selectedAnswer === null"
              class="btn-submit"
            >
              提交答案
            </button>
          </div>
        </div>
      </div>

      <!-- 反馈阶段 -->
      <div v-else-if="testPhase === 'feedback'" class="feedback-phase">
        <div class="feedback-container">
          <div class="feedback-header">
            <div class="feedback-icon" :class="lastAnswerCorrect ? 'correct' : 'incorrect'">
              {{ lastAnswerCorrect ? '✓' : '✗' }}
            </div>
            <div class="feedback-text">
              <div class="feedback-title">
                {{ lastAnswerCorrect ? '回答正确！' : '回答错误' }}
              </div>
              <div class="feedback-explanation">
                {{ currentQuestion.explanation }}
              </div>
            </div>
          </div>
          
          <div class="feedback-details">
            <div class="detail-item">
              <span class="detail-label">您的答案：</span>
              <span class="detail-value">{{ getSelectedAnswerText() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">正确答案：</span>
              <span class="detail-value">{{ getCorrectAnswerText() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">用时：</span>
              <span class="detail-value">{{ lastResponseTime }}秒</span>
            </div>
          </div>
          
          <button @click="continueTesting" class="btn-continue">
            {{ isLastQuestion ? '查看结果' : '下一题' }}
          </button>
        </div>
      </div>

      <!-- 结果展示阶段 -->
      <div v-else-if="testPhase === 'results'" class="results-phase">
        <div class="results-container">
          <h3>模式比较测试结果</h3>
          
          <!-- 总体结果 -->
          <div class="overall-results">
            <div class="result-card">
              <div class="result-icon">🎯</div>
              <div class="result-value">{{ overallAccuracy }}%</div>
              <div class="result-label">总体准确率</div>
            </div>
            <div class="result-card">
              <div class="result-icon">⏱️</div>
              <div class="result-value">{{ averageTime }}</div>
              <div class="result-label">平均用时(秒)</div>
            </div>
            <div class="result-card">
              <div class="result-icon">⭐</div>
              <div class="result-value">{{ finalScore }}</div>
              <div class="result-label">综合得分</div>
            </div>
            <div class="result-card">
              <div class="result-icon">🧩</div>
              <div class="result-value">{{ patternScore }}</div>
              <div class="result-label">模式识别得分</div>
            </div>
          </div>

          <!-- 详细分析 -->
          <div class="detailed-analysis">
            <h4>详细分析</h4>
            <div class="analysis-grid">
              <!-- 难度表现 -->
              <div class="analysis-item">
                <h5>难度表现</h5>
                <div class="difficulty-chart">
                  <div 
                    v-for="difficulty in ['easy', 'medium', 'hard', 'expert']"
                    :key="difficulty"
                    class="difficulty-bar"
                  >
                    <div class="difficulty-label">{{ getDifficultyLabel(difficulty) }}</div>
                    <div class="bar-container">
                      <div 
                        class="bar-fill"
                        :style="{ width: getDifficultyAccuracy(difficulty) + '%' }"
                      ></div>
                    </div>
                    <div class="accuracy-value">{{ getDifficultyAccuracy(difficulty) }}%</div>
                  </div>
                </div>
              </div>

              <!-- 模式类型表现 -->
              <div class="analysis-item">
                <h5>模式类型表现</h5>
                <div class="pattern-type-chart">
                  <div 
                    v-for="type in ['geometric', 'color', 'size', 'rotation']"
                    :key="type"
                    class="type-bar"
                  >
                    <div class="type-label">{{ getPatternTypeLabel(type) }}</div>
                    <div class="bar-container">
                      <div 
                        class="bar-fill"
                        :style="{ width: getPatternTypeAccuracy(type) + '%' }"
                      ></div>
                    </div>
                    <div class="accuracy-value">{{ getPatternTypeAccuracy(type) }}%</div>
                  </div>
                </div>
              </div>

              <!-- 反应时间趋势 -->
              <div class="analysis-item">
                <h5>反应时间趋势</h5>
                <div class="time-trend">
                  <div class="trend-chart">
                    <!-- 简化的时间趋势图 -->
                    <div class="trend-line">
                      <div 
                        v-for="(answer, index) in answers"
                        :key="index"
                        class="trend-point"
                        :style="{ 
                          left: (index / (answers.length - 1)) * 100 + '%',
                          bottom: Math.min(answer.responseTime / 30 * 100, 100) + '%'
                        }"
                        :title="`第${index + 1}题: ${answer.responseTime.toFixed(1)}秒`"
                      ></div>
                    </div>
                  </div>
                  <div class="trend-stats">
                    <div class="stat-item">
                      <span class="stat-label">最快：</span>
                      <span class="stat-value">{{ minTime }}秒</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">最慢：</span>
                      <span class="stat-value">{{ maxTime }}秒</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 表现评价和改进建议 -->
          <div class="performance-feedback">
            <h4>表现评价</h4>
            <div 
              class="feedback-item"
              :class="getPerformanceLevel(overallAccuracy)"
            >
              <div class="feedback-icon">{{ getPerformanceIcon(overallAccuracy) }}</div>
              <div class="feedback-text">
                <div class="feedback-title">{{ getPerformanceTitle(overallAccuracy) }}</div>
                <div class="feedback-description">{{ getPerformanceDescription(overallAccuracy) }}</div>
              </div>
            </div>
            
            <div class="improvement-suggestions">
              <h5>改进建议</h5>
              <ul>
                <li v-if="overallAccuracy < 70">加强基础图形识别训练，提高对几何形状的敏感度</li>
                <li v-if="averageTime > 20">练习快速模式识别，提高反应速度</li>
                <li v-if="getDifficultyAccuracy('hard') < 60">重点练习复杂模式的分析和比较</li>
                <li v-if="getPatternTypeAccuracy('rotation') < 70">加强空间旋转能力的训练</li>
                <li>定期进行模式识别练习，保持和提升认知能力</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

// Props
const props = defineProps({
  testData: {
    type: Object,
    default: () => ({
      difficulty: 'medium',
      questionCount: 10,
      timeLimit: 300
    })
  }
});

// Emits
const emit = defineEmits(['test-completed', 'answer-submitted']);

// 响应式数据
const testPhase = ref('instruction'); // instruction, testing, feedback, results
const currentQuestionIndex = ref(0);
const selectedAnswer = ref(null);
const answers = ref([]);
const questions = ref([]);
const startTime = ref(null);
const questionStartTime = ref(null);
const questionTime = ref(0);
const timer = ref(null);
const lastAnswerCorrect = ref(false);
const lastResponseTime = ref(0);

// 计算属性
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || {};
});

const progressPercentage = computed(() => {
  return ((currentQuestionIndex.value + 1) / questions.value.length) * 100;
});

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === questions.value.length - 1;
});

const overallAccuracy = computed(() => {
  if (answers.value.length === 0) return 0;
  const correctCount = answers.value.filter(answer => answer.isCorrect).length;
  return Math.round((correctCount / answers.value.length) * 100);
});

const averageTime = computed(() => {
  if (answers.value.length === 0) return 0;
  const totalTime = answers.value.reduce((sum, answer) => sum + answer.responseTime, 0);
  return (totalTime / answers.value.length).toFixed(1);
});

const finalScore = computed(() => {
  const accuracyScore = overallAccuracy.value;
  const speedBonus = Math.max(0, 30 - parseFloat(averageTime.value)) * 2;
  return Math.min(100, Math.round(accuracyScore + speedBonus));
});

const patternScore = computed(() => {
  // 基于准确率和难度的模式识别得分
  const difficultyWeights = { easy: 1, medium: 1.2, hard: 1.5, expert: 2 };
  let weightedScore = 0;
  let totalWeight = 0;
  
  answers.value.forEach(answer => {
    const weight = difficultyWeights[answer.difficulty] || 1;
    weightedScore += answer.isCorrect ? weight * 100 : 0;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
});

const minTime = computed(() => {
  if (answers.value.length === 0) return 0;
  return Math.min(...answers.value.map(a => a.responseTime)).toFixed(1);
});

const maxTime = computed(() => {
  if (answers.value.length === 0) return 0;
  return Math.max(...answers.value.map(a => a.responseTime)).toFixed(1);
});

// 方法
const startTest = () => {
  testPhase.value = 'testing';
  startTime.value = Date.now();
  generateQuestions();
  startQuestionTimer();
};

const generateQuestions = () => {
  const { difficulty, questionCount } = props.testData;
  questions.value = [];
  
  for (let i = 0; i < questionCount; i++) {
    questions.value.push(generateQuestion(difficulty, i));
  }
};

const generateQuestion = (difficulty, index) => {
  const patternTypes = ['geometric', 'color', 'size', 'rotation'];
  const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
  
  switch (patternType) {
    case 'geometric':
      return generateGeometricQuestion(difficulty, index);
    case 'color':
      return generateColorQuestion(difficulty, index);
    case 'size':
      return generateSizeQuestion(difficulty, index);
    case 'rotation':
      return generateRotationQuestion(difficulty, index);
    default:
      return generateGeometricQuestion(difficulty, index);
  }
};

const generateGeometricQuestion = (difficulty, index) => {
  const shapes = ['circle', 'square', 'triangle', 'diamond', 'hexagon'];
  const complexities = {
    easy: 2,
    medium: 3,
    hard: 4,
    expert: 5
  };
  
  const complexity = complexities[difficulty] || 3;
  const referenceShapes = [];
  
  for (let i = 0; i < complexity; i++) {
    referenceShapes.push({
      type: shapes[Math.floor(Math.random() * shapes.length)],
      x: 50 + (i % 2) * 100,
      y: 50 + Math.floor(i / 2) * 100,
      size: 30 + Math.random() * 20,
      color: '#3498db'
    });
  }
  
  const options = [];
  const correctOption = { pattern: [...referenceShapes] };
  options.push(correctOption);
  
  // 生成错误选项
  for (let i = 0; i < 3; i++) {
    const wrongOption = { pattern: [...referenceShapes] };
    // 随机修改一个形状
    const randomIndex = Math.floor(Math.random() * wrongOption.pattern.length);
    wrongOption.pattern[randomIndex] = {
      ...wrongOption.pattern[randomIndex],
      type: shapes[Math.floor(Math.random() * shapes.length)]
    };
    options.push(wrongOption);
  }
  
  // 打乱选项顺序
  const shuffledOptions = shuffleArray(options);
  const correctAnswer = shuffledOptions.findIndex(opt => 
    JSON.stringify(opt.pattern) === JSON.stringify(correctOption.pattern)
  );
  
  return {
    id: index,
    question: '请找出与参考模式完全相同的选项',
    referencePattern: referenceShapes,
    options: shuffledOptions,
    correctAnswer,
    explanation: '正确答案应该与参考模式的形状、位置完全一致。',
    difficulty,
    patternType: 'geometric'
  };
};

const generateColorQuestion = (difficulty, index) => {
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
  const complexities = {
    easy: 3,
    medium: 4,
    hard: 5,
    expert: 6
  };
  
  const complexity = complexities[difficulty] || 4;
  const referencePattern = [];
  
  for (let i = 0; i < complexity; i++) {
    referencePattern.push({
      type: 'circle',
      x: 30 + (i % 3) * 60,
      y: 30 + Math.floor(i / 3) * 60,
      size: 25,
      color: colors[i % colors.length]
    });
  }
  
  const options = [];
  const correctOption = { pattern: [...referencePattern] };
  options.push(correctOption);
  
  // 生成错误选项
  for (let i = 0; i < 3; i++) {
    const wrongOption = { pattern: [...referencePattern] };
    // 随机修改一个颜色
    const randomIndex = Math.floor(Math.random() * wrongOption.pattern.length);
    wrongOption.pattern[randomIndex] = {
      ...wrongOption.pattern[randomIndex],
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    options.push(wrongOption);
  }
  
  const shuffledOptions = shuffleArray(options);
  const correctAnswer = shuffledOptions.findIndex(opt => 
    JSON.stringify(opt.pattern) === JSON.stringify(correctOption.pattern)
  );
  
  return {
    id: index,
    question: '请找出与参考模式颜色排列完全相同的选项',
    referencePattern,
    options: shuffledOptions,
    correctAnswer,
    explanation: '正确答案应该与参考模式的颜色排列完全一致。',
    difficulty,
    patternType: 'color'
  };
};

const generateSizeQuestion = (difficulty, index) => {
  const sizes = [20, 30, 40, 50, 60];
  const complexities = {
    easy: 3,
    medium: 4,
    hard: 5,
    expert: 6
  };
  
  const complexity = complexities[difficulty] || 4;
  const referencePattern = [];
  
  for (let i = 0; i < complexity; i++) {
    referencePattern.push({
      type: 'circle',
      x: 40 + (i % 3) * 60,
      y: 40 + Math.floor(i / 3) * 60,
      size: sizes[i % sizes.length],
      color: '#3498db'
    });
  }
  
  const options = [];
  const correctOption = { pattern: [...referencePattern] };
  options.push(correctOption);
  
  // 生成错误选项
  for (let i = 0; i < 3; i++) {
    const wrongOption = { pattern: [...referencePattern] };
    // 随机修改一个大小
    const randomIndex = Math.floor(Math.random() * wrongOption.pattern.length);
    wrongOption.pattern[randomIndex] = {
      ...wrongOption.pattern[randomIndex],
      size: sizes[Math.floor(Math.random() * sizes.length)]
    };
    options.push(wrongOption);
  }
  
  const shuffledOptions = shuffleArray(options);
  const correctAnswer = shuffledOptions.findIndex(opt => 
    JSON.stringify(opt.pattern) === JSON.stringify(correctOption.pattern)
  );
  
  return {
    id: index,
    question: '请找出与参考模式大小排列完全相同的选项',
    referencePattern,
    options: shuffledOptions,
    correctAnswer,
    explanation: '正确答案应该与参考模式的大小排列完全一致。',
    difficulty,
    patternType: 'size'
  };
};

const generateRotationQuestion = (difficulty, index) => {
  const rotations = [0, 45, 90, 135, 180, 225, 270, 315];
  const complexities = {
    easy: 2,
    medium: 3,
    hard: 4,
    expert: 5
  };
  
  const complexity = complexities[difficulty] || 3;
  const referencePattern = [];
  
  for (let i = 0; i < complexity; i++) {
    referencePattern.push({
      type: 'triangle',
      x: 50 + (i % 2) * 100,
      y: 50 + Math.floor(i / 2) * 100,
      size: 30,
      color: '#e74c3c',
      rotation: rotations[i % rotations.length]
    });
  }
  
  const options = [];
  const correctOption = { pattern: [...referencePattern] };
  options.push(correctOption);
  
  // 生成错误选项
  for (let i = 0; i < 3; i++) {
    const wrongOption = { pattern: [...referencePattern] };
    // 随机修改一个旋转角度
    const randomIndex = Math.floor(Math.random() * wrongOption.pattern.length);
    wrongOption.pattern[randomIndex] = {
      ...wrongOption.pattern[randomIndex],
      rotation: rotations[Math.floor(Math.random() * rotations.length)]
    };
    options.push(wrongOption);
  }
  
  const shuffledOptions = shuffleArray(options);
  const correctAnswer = shuffledOptions.findIndex(opt => 
    JSON.stringify(opt.pattern) === JSON.stringify(correctOption.pattern)
  );
  
  return {
    id: index,
    question: '请找出与参考模式旋转角度完全相同的选项',
    referencePattern,
    options: shuffledOptions,
    correctAnswer,
    explanation: '正确答案应该与参考模式的旋转角度完全一致。',
    difficulty,
    patternType: 'rotation'
  };
};

const generatePatternSVG = (pattern) => {
  if (!pattern || !Array.isArray(pattern)) return '';
  
  return pattern.map(shape => {
    const { type, x, y, size, color, rotation = 0 } = shape;
    const transform = rotation ? `transform="rotate(${rotation} ${x} ${y})"` : '';
    
    switch (type) {
      case 'circle':
        return `<circle cx="${x}" cy="${y}" r="${size/2}" fill="${color}" ${transform}/>`;
      case 'square':
        return `<rect x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" fill="${color}" ${transform}/>`;
      case 'triangle':
        const points = getTrianglePoints(x, y, size);
        return `<polygon points="${points}" fill="${color}" ${transform}/>`;
      case 'diamond':
        const diamondPoints = `${x},${y-size/2} ${x+size/2},${y} ${x},${y+size/2} ${x-size/2},${y}`;
        return `<polygon points="${diamondPoints}" fill="${color}" ${transform}/>`;
      case 'hexagon':
        const hexPoints = getHexagonPoints(x, y, size/2);
        return `<polygon points="${hexPoints}" fill="${color}" ${transform}/>`;
      default:
        return '';
    }
  }).join('');
};

const getTrianglePoints = (x, y, size) => {
  const height = size * Math.sqrt(3) / 2;
  return `${x},${y - height/2} ${x - size/2},${y + height/2} ${x + size/2},${y + height/2}`;
};

const getHexagonPoints = (x, y, radius) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  return points.join(' ');
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const startQuestionTimer = () => {
  questionTime.value = 0;
  questionStartTime.value = Date.now();
  timer.value = setInterval(() => {
    questionTime.value++;
  }, 1000);
};

const selectAnswer = (index) => {
  selectedAnswer.value = index;
};

const submitAnswer = () => {
  if (selectedAnswer.value === null) return;
  
  clearInterval(timer.value);
  const responseTime = (Date.now() - questionStartTime.value) / 1000;
  const isCorrect = selectedAnswer.value === currentQuestion.value.correctAnswer;
  
  lastAnswerCorrect.value = isCorrect;
  lastResponseTime.value = responseTime.toFixed(1);
  
  // 记录答案
  answers.value.push({
    questionIndex: currentQuestionIndex.value,
    selectedAnswer: selectedAnswer.value,
    correctAnswer: currentQuestion.value.correctAnswer,
    isCorrect,
    responseTime,
    difficulty: currentQuestion.value.difficulty,
    patternType: currentQuestion.value.patternType
  });
  
  emit('answer-submitted', {
    questionIndex: currentQuestionIndex.value,
    selectedAnswer: selectedAnswer.value,
    correctAnswer: currentQuestion.value.correctAnswer,
    isCorrect,
    responseTime
  });
  
  testPhase.value = 'feedback';
};

const continueTesting = () => {
  if (isLastQuestion.value) {
    completeTest();
  } else {
    currentQuestionIndex.value++;
    selectedAnswer.value = null;
    testPhase.value = 'testing';
    startQuestionTimer();
  }
};

const completeTest = () => {
  testPhase.value = 'results';
  
  emit('test-completed', {
    testType: 'pattern-comparison',
    results: {
      overallAccuracy: overallAccuracy.value,
      averageTime: parseFloat(averageTime.value),
      finalScore: finalScore.value,
      patternScore: patternScore.value,
      answers: answers.value,
      totalTime: (Date.now() - startTime.value) / 1000
    }
  });
};

const getSelectedAnswerText = () => {
  if (selectedAnswer.value === null) return '未选择';
  return String.fromCharCode(65 + selectedAnswer.value);
};

const getCorrectAnswerText = () => {
  return String.fromCharCode(65 + currentQuestion.value.correctAnswer);
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

const getDifficultyAccuracy = (difficulty) => {
  const difficultyAnswers = answers.value.filter(answer => answer.difficulty === difficulty);
  if (difficultyAnswers.length === 0) return 0;
  const correctCount = difficultyAnswers.filter(answer => answer.isCorrect).length;
  return Math.round((correctCount / difficultyAnswers.length) * 100);
};

const getPatternTypeLabel = (type) => {
  const labels = {
    geometric: '几何形状',
    color: '颜色模式',
    size: '大小模式',
    rotation: '旋转模式'
  };
  return labels[type] || type;
};

const getPatternTypeAccuracy = (type) => {
  const typeAnswers = answers.value.filter(answer => answer.patternType === type);
  if (typeAnswers.length === 0) return 0;
  const correctCount = typeAnswers.filter(answer => answer.isCorrect).length;
  return Math.round((correctCount / typeAnswers.length) * 100);
};

const getPerformanceLevel = (accuracy) => {
  if (accuracy >= 90) return 'excellent';
  if (accuracy >= 80) return 'good';
  if (accuracy >= 70) return 'average';
  return 'poor';
};

const getPerformanceIcon = (accuracy) => {
  if (accuracy >= 90) return '🏆';
  if (accuracy >= 80) return '👍';
  if (accuracy >= 70) return '👌';
  return '💪';
};

const getPerformanceTitle = (accuracy) => {
  if (accuracy >= 90) return '优秀表现';
  if (accuracy >= 80) return '良好表现';
  if (accuracy >= 70) return '一般表现';
  return '需要提高';
};

const getPerformanceDescription = (accuracy) => {
  if (accuracy >= 90) return '您的模式识别能力非常出色，能够快速准确地识别和比较各种复杂模式。';
  if (accuracy >= 80) return '您具有良好的模式识别能力，在大多数情况下能够准确识别模式特征。';
  if (accuracy >= 70) return '您的模式识别能力处于平均水平，通过练习可以进一步提高。';
  return '建议加强模式识别训练，提高对图形、颜色、大小等特征的敏感度。';
};

// 生命周期
onMounted(() => {
  // 组件挂载时的初始化
});

onUnmounted(() => {
  // 清理定时器
  if (timer.value) {
    clearInterval(timer.value);
  }
});

// 监听测试数据变化
watch(() => props.testData, (newData) => {
  if (newData && testPhase.value === 'instruction') {
    // 重置测试状态
    currentQuestionIndex.value = 0;
    answers.value = [];
    selectedAnswer.value = null;
  }
}, { deep: true });
</script>

<style scoped>
.pattern-comparison-test {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.test-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 测试说明阶段 */
.instruction-phase {
  padding: 40px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.instruction-content h3 {
  font-size: 2.5em;
  margin-bottom: 30px;
  font-weight: 300;
}

.instruction-text {
  font-size: 1.2em;
  line-height: 1.6;
  margin-bottom: 40px;
}

.instruction-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.step-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.step-number {
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-weight: bold;
}

.step-text {
  flex: 1;
  text-align: left;
}

.btn-start {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2em;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(238, 90, 36, 0.4);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(238, 90, 36, 0.6);
}

/* 测试进行阶段 */
.testing-phase {
  padding: 30px;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.test-info {
  display: flex;
  gap: 30px;
}

.question-counter {
  font-size: 1.1em;
  font-weight: 600;
  color: #495057;
}

.timer {
  font-size: 1.1em;
  font-weight: 600;
  color: #007bff;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin-left: 30px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.question-container {
  max-width: 1000px;
  margin: 0 auto;
}

.question-container h4 {
  font-size: 1.4em;
  color: #495057;
  margin-bottom: 30px;
  text-align: center;
}

/* 参考模式 */
.reference-pattern {
  text-align: center;
  margin-bottom: 40px;
}

.reference-pattern h5 {
  font-size: 1.2em;
  color: #495057;
  margin-bottom: 20px;
}

.pattern-display {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.pattern-svg {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  background: #f8f9fa;
}

/* 选项模式 */
.options-container h5 {
  font-size: 1.2em;
  color: #495057;
  margin-bottom: 20px;
  text-align: center;
}

.pattern-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.option-pattern {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.option-pattern:hover {
  border-color: #007bff;
  background: #f8f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
}

.option-pattern.selected {
  border-color: #007bff;
  background: #e3f2fd;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.option-letter {
  width: 30px;
  height: 30px;
  background: #6c757d;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  font-weight: 600;
  font-size: 1.1em;
}

.option-pattern.selected .option-letter {
  background: #007bff;
}

.question-controls {
  text-align: center;
}

.btn-submit {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1em;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* 反馈阶段 */
.feedback-phase {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
}

.feedback-container {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.feedback-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  font-weight: bold;
  color: white;
}

.feedback-icon.correct {
  background: #28a745;
}

.feedback-icon.incorrect {
  background: #dc3545;
}

.feedback-text {
  flex: 1;
}

.feedback-title {
  font-size: 1.3em;
  font-weight: 600;
  margin-bottom: 10px;
}

.feedback-explanation {
  color: #6c757d;
  line-height: 1.5;
}

.feedback-details {
  display: grid;
  gap: 15px;
  margin-bottom: 30px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background: white;
  border-radius: 6px;
}

.detail-label {
  font-weight: 600;
  color: #495057;
}

.detail-value {
  color: #6c757d;
}

.btn-continue {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1em;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-continue:hover {
  background: #1e7e34;
  transform: translateY(-1px);
}

/* 结果展示阶段 */
.results-phase {
  padding: 40px;
}

.results-container h3 {
  text-align: center;
  font-size: 2.2em;
  color: #495057;
  margin-bottom: 40px;
}

.overall-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.result-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.result-card:hover {
  transform: translateY(-5px);
}

.result-icon {
  font-size: 2.5em;
  margin-bottom: 15px;
}

.result-value {
  font-size: 2em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 5px;
}

.result-label {
  color: #6c757d;
  font-size: 0.9em;
}

.detailed-analysis {
  margin-bottom: 40px;
}

.detailed-analysis h4 {
  font-size: 1.5em;
  color: #495057;
  margin-bottom: 25px;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.analysis-item {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.analysis-item h5 {
  font-size: 1.2em;
  color: #495057;
  margin-bottom: 20px;
}

.difficulty-chart,
.pattern-type-chart {
  display: grid;
  gap: 15px;
}

.difficulty-bar,
.type-bar {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  align-items: center;
  gap: 15px;
}

.difficulty-label,
.type-label {
  font-size: 0.9em;
  color: #495057;
}

.bar-container {
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.8s ease;
}

.accuracy-value {
  font-size: 0.9em;
  font-weight: 600;
  color: #007bff;
  text-align: right;
}

.time-trend {
  position: relative;
}

.trend-chart {
  height: 120px;
  position: relative;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.trend-line {
  position: relative;
  width: 100%;
  height: 100%;
}

.trend-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  cursor: pointer;
}

.trend-point:hover {
  background: #0056b3;
  transform: translate(-50%, 50%) scale(1.2);
}

.trend-stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  gap: 5px;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9em;
}

.stat-value {
  color: #495057;
  font-weight: 600;
  font-size: 0.9em;
}

.performance-feedback {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.performance-feedback h4 {
  font-size: 1.5em;
  color: #495057;
  margin-bottom: 25px;
}

.feedback-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 25px;
  padding: 20px;
  border-radius: 8px;
}

.feedback-item.excellent {
  background: #d4edda;
  border-left: 4px solid #28a745;
}

.feedback-item.good {
  background: #d1ecf1;
  border-left: 4px solid #17a2b8;
}

.feedback-item.average {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.feedback-item.poor {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
}

.feedback-item .feedback-icon {
  font-size: 2em;
  width: auto;
  height: auto;
  background: none;
  color: inherit;
}

.feedback-item .feedback-text {
  flex: 1;
}

.feedback-item .feedback-title {
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 8px;
}

.feedback-item .feedback-description {
  line-height: 1.6;
  color: #495057;
}

.improvement-suggestions h5 {
  font-size: 1.1em;
  color: #495057;
  margin-bottom: 15px;
}

.improvement-suggestions ul {
  list-style: none;
  padding: 0;
}

.improvement-suggestions li {
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
  position: relative;
  padding-left: 25px;
}

.improvement-suggestions li:before {
  content: '💡';
  position: absolute;
  left: 0;
  top: 10px;
}

.improvement-suggestions li:last-child {
  border-bottom: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pattern-comparison-test {
    padding: 10px;
  }
  
  .instruction-phase {
    padding: 20px;
  }
  
  .instruction-content h3 {
    font-size: 2em;
  }
  
  .instruction-steps {
    grid-template-columns: 1fr;
  }
  
  .testing-phase {
    padding: 15px;
  }
  
  .test-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .progress-bar {
    margin-left: 0;
    margin-top: 15px;
  }
  
  .pattern-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pattern-svg {
    width: 120px;
    height: 120px;
  }
  
  .overall-results {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .difficulty-bar,
  .type-bar {
    grid-template-columns: 60px 1fr 50px;
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

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.test-container {
  animation: fadeIn 0.6s ease-out;
}

.option-pattern {
  animation: scaleIn 0.4s ease-out;
}

.result-card {
  animation: fadeIn 0.6s ease-out;
}

/* 主题变量 */
:root {
  --color-primary: #007bff;
  --color-success: #28a745;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  --color-info: #17a2b8;
  --color-light: #f8f9fa;
  --color-dark: #343a40;
}
</style>