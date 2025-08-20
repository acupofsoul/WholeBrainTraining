<template>
  <div class="logic-reasoning-test">
    <div class="test-container">
      <!-- 测试说明阶段 -->
      <div v-if="testPhase === 'instruction'" class="instruction-phase">
        <div class="instruction-content">
          <h3>逻辑推理测试</h3>
          <p class="instruction-text">
            这个测试将评估您的逻辑推理能力，包括数列推理、图形推理、逻辑判断和条件推理。
            请仔细分析题目中的规律和逻辑关系。
          </p>
          
          <div class="instruction-steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-text">仔细观察题目中的模式</div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-text">分析其中的逻辑规律</div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-text">根据规律选择答案</div>
            </div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-text">如遇困难可查看提示</div>
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
            <div class="score-display">
              得分: {{ currentScore }}
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>

        <div class="question-container">
          <div class="question-display">
            <div class="question-type">
              {{ getQuestionTypeLabel(currentQuestion.type) }}
            </div>
            <div class="question-content">
              <!-- 数列推理 -->
              <div v-if="currentQuestion.type === 'sequence'" class="sequence-question">
                <div class="sequence-title">找出数列的规律，选择下一个数字：</div>
                <div class="sequence-display">
                  <span 
                    v-for="(num, index) in currentQuestion.sequence"
                    :key="index"
                    class="sequence-number"
                  >
                    {{ num }}
                  </span>
                  <span class="sequence-question-mark">?</span>
                </div>
              </div>
              
              <!-- 图形推理 -->
              <div v-else-if="currentQuestion.type === 'pattern'" class="pattern-question">
                <div class="pattern-title">观察图形规律，选择下一个图形：</div>
                <div class="pattern-display">
                  <div 
                    v-for="(pattern, index) in currentQuestion.patterns"
                    :key="index"
                    class="pattern-item"
                    v-html="pattern"
                  ></div>
                  <div class="pattern-question-mark">?</div>
                </div>
              </div>
              
              <!-- 逻辑判断 -->
              <div v-else-if="currentQuestion.type === 'logic'" class="logic-question">
                <div class="logic-statement">{{ currentQuestion.statement }}</div>
                <div class="logic-question-text">{{ currentQuestion.question }}</div>
              </div>
              
              <!-- 条件推理 -->
              <div v-else-if="currentQuestion.type === 'conditional'" class="conditional-question">
                <div class="conditional-title">根据给定条件进行推理：</div>
                <div class="conditions-list">
                  <div 
                    v-for="(condition, index) in currentQuestion.conditions"
                    :key="index"
                    class="condition-item"
                  >
                    {{ index + 1 }}. {{ condition }}
                  </div>
                </div>
                <div class="conditional-question">{{ currentQuestion.question }}</div>
              </div>
            </div>
            
            <div class="question-difficulty">
              难度: {{ getDifficultyLabel(currentQuestion.difficulty) }}
            </div>
          </div>
          
          <!-- 答案选项 -->
          <div class="answer-choices">
            <button 
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="choice-button"
              :class="{ selected: selectedAnswer === option }"
              @click="selectAnswer(option)"
            >
              <span v-if="currentQuestion.type === 'pattern'" v-html="option"></span>
              <span v-else>{{ option }}</span>
            </button>
          </div>
          
          <!-- 提示信息 -->
          <div v-if="showHints && currentQuestion.hint" class="hint-section">
            <div class="hint-toggle" @click="showHint = !showHint">
              <i class="fas fa-lightbulb"></i>
              {{ showHint ? '隐藏提示' : '显示提示' }}
            </div>
            <div v-if="showHint" class="hint-content">
              {{ currentQuestion.hint }}
            </div>
          </div>
          
          <div class="question-controls">
            <button 
              @click="submitAnswer" 
              :disabled="!canSubmit"
              class="btn-submit"
            >
              提交答案
            </button>
            <button 
              @click="skipQuestion" 
              class="btn-skip"
            >
              跳过此题
            </button>
          </div>
        </div>
      </div>

      <!-- 反馈阶段 -->
      <div v-else-if="testPhase === 'feedback'" class="feedback-phase">
        <div class="feedback-container">
          <div class="feedback-header">
            <div class="feedback-icon" :class="lastAnswer.isCorrect ? 'correct' : 'incorrect'">
              {{ lastAnswer.isCorrect ? '✓' : '✗' }}
            </div>
            <div class="feedback-text">
              <div class="feedback-title">
                {{ lastAnswer.isCorrect ? '推理正确！' : '推理错误' }}
              </div>
              <div class="feedback-explanation">
                {{ getFeedbackExplanation() }}
              </div>
            </div>
          </div>
          
          <div class="feedback-details">
            <div class="detail-item">
              <span class="detail-label">题目类型：</span>
              <span class="detail-value">{{ getQuestionTypeLabel(lastAnswer.questionType) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">正确答案：</span>
              <span class="detail-value">{{ lastAnswer.correctAnswer }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">您的答案：</span>
              <span class="detail-value">{{ lastAnswer.userAnswer || '未作答' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">推理过程：</span>
              <span class="detail-value">{{ lastAnswer.explanation }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">用时：</span>
              <span class="detail-value">{{ lastAnswer.responseTime.toFixed(1) }}秒</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">得分：</span>
              <span class="detail-value">+{{ lastAnswer.points }}分</span>
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
          <h3>逻辑推理测试结果</h3>
          
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
              <div class="result-label">总得分</div>
            </div>
            <div class="result-card">
              <div class="result-icon">🧠</div>
              <div class="result-value">{{ logicScore }}</div>
              <div class="result-label">逻辑推理得分</div>
            </div>
          </div>

          <!-- 详细分析 -->
          <div class="detailed-analysis">
            <h4>详细分析</h4>
            <div class="analysis-grid">
              <!-- 推理类型表现 -->
              <div class="analysis-item">
                <h5>推理类型表现</h5>
                <div class="type-chart">
                  <div 
                    v-for="type in ['sequence', 'pattern', 'logic', 'conditional']"
                    :key="type"
                    class="type-bar"
                  >
                    <div class="type-label">{{ getQuestionTypeLabel(type) }}</div>
                    <div class="bar-container">
                      <div 
                        class="bar-fill"
                        :style="{ width: getTypeAccuracy(type) + '%' }"
                      ></div>
                    </div>
                    <div class="accuracy-value">{{ getTypeAccuracy(type) }}%</div>
                  </div>
                </div>
              </div>

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

              <!-- 推理能力分析 -->
              <div class="analysis-item">
                <h5>推理能力分析</h5>
                <div class="reasoning-stats">
                  <div class="stat-row">
                    <span class="stat-label">抽象思维：</span>
                    <span class="stat-value">{{ abstractThinking }}%</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">逻辑分析：</span>
                    <span class="stat-value">{{ logicalAnalysis }}%</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">模式识别：</span>
                    <span class="stat-value">{{ patternRecognition }}%</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">条件推理：</span>
                    <span class="stat-value">{{ conditionalReasoning }}%</span>
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
                <li v-if="overallAccuracy < 70">加强逻辑思维训练，多做推理练习</li>
                <li v-if="getTypeAccuracy('sequence') < 70">重点练习数列规律识别</li>
                <li v-if="getTypeAccuracy('pattern') < 70">加强图形推理能力训练</li>
                <li v-if="getTypeAccuracy('logic') < 70">提高逻辑判断和分析能力</li>
                <li v-if="getTypeAccuracy('conditional') < 70">练习条件推理和假设验证</li>
                <li v-if="averageTime > 60">提高推理速度，培养快速分析能力</li>
                <li>定期进行逻辑推理练习，保持思维敏锐</li>
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
      questionCount: 15,
      timeLimit: 900,
      showHints: true
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
const currentScore = ref(0);
const lastAnswer = ref({});
const showHint = ref(false);

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

const canSubmit = computed(() => {
  return selectedAnswer.value !== null;
});

const showHints = computed(() => {
  return props.testData.showHints;
});

const overallAccuracy = computed(() => {
  if (answers.value.length === 0) return 0;
  const correctAnswers = answers.value.filter(answer => answer.isCorrect).length;
  return Math.round((correctAnswers / answers.value.length) * 100);
});

const averageTime = computed(() => {
  if (answers.value.length === 0) return 0;
  const totalTime = answers.value.reduce((sum, answer) => sum + answer.responseTime, 0);
  return (totalTime / answers.value.length).toFixed(1);
});

const finalScore = computed(() => {
  return currentScore.value;
});

const logicScore = computed(() => {
  // 基于准确率和推理复杂度的综合得分
  const accuracyScore = overallAccuracy.value;
  const complexityBonus = getComplexityBonus();
  return Math.min(100, Math.round(accuracyScore + complexityBonus));
});

const abstractThinking = computed(() => {
  return getTypeAccuracy('pattern');
});

const logicalAnalysis = computed(() => {
  return getTypeAccuracy('logic');
});

const patternRecognition = computed(() => {
  return getTypeAccuracy('sequence');
});

const conditionalReasoning = computed(() => {
  return getTypeAccuracy('conditional');
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
  
  const types = ['sequence', 'pattern', 'logic', 'conditional'];
  
  for (let i = 0; i < questionCount; i++) {
    const type = types[i % types.length]; // 均匀分布各种类型
    questions.value.push(generateQuestion(type, difficulty, i));
  }
  
  // 打乱题目顺序
  questions.value = shuffleArray(questions.value);
};

const generateQuestion = (type, difficulty, index) => {
  switch (type) {
    case 'sequence':
      return generateSequenceQuestion(difficulty, index);
    case 'pattern':
      return generatePatternQuestion(difficulty, index);
    case 'logic':
      return generateLogicQuestion(difficulty, index);
    case 'conditional':
      return generateConditionalQuestion(difficulty, index);
    default:
      return generateSequenceQuestion(difficulty, index);
  }
};

const generateSequenceQuestion = (difficulty, index) => {
  const sequences = {
    easy: [
      { sequence: [2, 4, 6, 8], answer: 10, rule: '等差数列，公差为2', hint: '观察相邻数字的差值' },
      { sequence: [1, 3, 5, 7], answer: 9, rule: '奇数数列', hint: '都是奇数，每次加2' },
      { sequence: [5, 10, 15, 20], answer: 25, rule: '5的倍数', hint: '每个数都是5的倍数' },
      { sequence: [1, 4, 7, 10], answer: 13, rule: '等差数列，公差为3', hint: '每次增加3' }
    ],
    medium: [
      { sequence: [2, 6, 18, 54], answer: 162, rule: '每次乘以3', hint: '观察倍数关系' },
      { sequence: [1, 1, 2, 3, 5], answer: 8, rule: '斐波那契数列', hint: '前两个数的和等于第三个数' },
      { sequence: [1, 4, 9, 16], answer: 25, rule: '平方数列', hint: '1², 2², 3², 4²...' },
      { sequence: [3, 7, 15, 31], answer: 63, rule: '每次乘以2再加1', hint: '找到递推关系' }
    ],
    hard: [
      { sequence: [2, 3, 5, 8, 13], answer: 21, rule: '斐波那契数列变形', hint: '相邻两数之和' },
      { sequence: [1, 8, 27, 64], answer: 125, rule: '立方数列', hint: '1³, 2³, 3³, 4³...' },
      { sequence: [2, 6, 12, 20, 30], answer: 42, rule: 'n(n+1)', hint: '观察与连续整数的关系' },
      { sequence: [1, 3, 6, 10, 15], answer: 21, rule: '三角数列', hint: '累加自然数' }
    ],
    expert: [
      { sequence: [1, 4, 13, 40, 121], answer: 364, rule: '3^n + 1', hint: '与3的幂次有关' },
      { sequence: [2, 5, 11, 23, 47], answer: 95, rule: '每次乘以2再加1', hint: '复杂的递推关系' },
      { sequence: [1, 2, 6, 24, 120], answer: 720, rule: '阶乘数列', hint: '1!, 2!, 3!, 4!...' },
      { sequence: [3, 8, 15, 24, 35], answer: 48, rule: 'n² + 2n', hint: '二次函数规律' }
    ]
  };
  
  const levelSequences = sequences[difficulty] || sequences.medium;
  const selected = levelSequences[Math.floor(Math.random() * levelSequences.length)];
  
  // 生成错误选项
  const options = [selected.answer];
  for (let i = 0; i < 3; i++) {
    let wrongAnswer;
    do {
      const variation = Math.floor(Math.random() * 20) - 10; // -10到+10的变化
      wrongAnswer = selected.answer + variation;
    } while (options.includes(wrongAnswer) || wrongAnswer <= 0);
    options.push(wrongAnswer);
  }
  
  return {
    id: index,
    type: 'sequence',
    sequence: selected.sequence,
    answer: selected.answer,
    options: shuffleArray(options),
    difficulty,
    explanation: selected.rule,
    hint: selected.hint
  };
};

const generatePatternQuestion = (difficulty, index) => {
  const patterns = {
    easy: [
      {
        patterns: [
          '<div class="shape circle"></div>',
          '<div class="shape square"></div>',
          '<div class="shape circle"></div>'
        ],
        answer: '<div class="shape square"></div>',
        rule: '圆形和正方形交替出现',
        hint: '观察形状的交替规律'
      }
    ],
    medium: [
      {
        patterns: [
          '<div class="shape triangle red"></div>',
          '<div class="shape triangle blue"></div>',
          '<div class="shape triangle red"></div>'
        ],
        answer: '<div class="shape triangle blue"></div>',
        rule: '三角形颜色交替',
        hint: '注意颜色的变化规律'
      }
    ],
    hard: [
      {
        patterns: [
          '<div class="shape-group"><div class="shape circle small"></div></div>',
          '<div class="shape-group"><div class="shape circle medium"></div></div>',
          '<div class="shape-group"><div class="shape circle large"></div></div>'
        ],
        answer: '<div class="shape-group"><div class="shape circle extra-large"></div></div>',
        rule: '圆形逐渐变大',
        hint: '观察大小的变化'
      }
    ],
    expert: [
      {
        patterns: [
          '<div class="complex-pattern"><div class="shape circle"></div><div class="shape square"></div></div>',
          '<div class="complex-pattern"><div class="shape square"></div><div class="shape triangle"></div></div>',
          '<div class="complex-pattern"><div class="shape triangle"></div><div class="shape circle"></div></div>'
        ],
        answer: '<div class="complex-pattern"><div class="shape circle"></div><div class="shape square"></div></div>',
        rule: '复合图形循环',
        hint: '观察图形组合的循环规律'
      }
    ]
  };
  
  const levelPatterns = patterns[difficulty] || patterns.medium;
  const selected = levelPatterns[Math.floor(Math.random() * levelPatterns.length)];
  
  // 生成错误选项
  const wrongOptions = [
    '<div class="shape circle"></div>',
    '<div class="shape square red"></div>',
    '<div class="shape triangle blue"></div>'
  ];
  
  const options = [selected.answer, ...wrongOptions.slice(0, 3)];
  
  return {
    id: index,
    type: 'pattern',
    patterns: selected.patterns,
    answer: selected.answer,
    options: shuffleArray(options),
    difficulty,
    explanation: selected.rule,
    hint: selected.hint
  };
};

const generateLogicQuestion = (difficulty, index) => {
  const logicQuestions = {
    easy: [
      {
        statement: '所有的猫都是动物。小花是一只猫。',
        question: '小花是动物吗？',
        answer: '是',
        options: ['是', '不是', '无法确定', '题目有误'],
        explanation: '根据三段论，小花是猫，猫是动物，所以小花是动物',
        hint: '使用三段论推理'
      }
    ],
    medium: [
      {
        statement: '如果下雨，那么地面会湿。现在地面是湿的。',
        question: '现在一定在下雨吗？',
        answer: '不一定',
        options: ['一定', '不一定', '一定不是', '无法判断'],
        explanation: '地面湿可能有其他原因，不能反推一定在下雨',
        hint: '注意逻辑推理的方向性'
      }
    ],
    hard: [
      {
        statement: '在一个班级中，如果学生喜欢数学，那么他们也喜欢物理。小明不喜欢物理。',
        question: '小明喜欢数学吗？',
        answer: '不喜欢',
        options: ['喜欢', '不喜欢', '可能喜欢', '无法确定'],
        explanation: '使用逆否命题：不喜欢物理则不喜欢数学',
        hint: '考虑逆否命题'
      }
    ],
    expert: [
      {
        statement: '在一个逻辑谜题中：A说B在撒谎，B说C在撒谎，C说A和B都在撒谎。',
        question: '如果只有一个人说真话，那么谁在说真话？',
        answer: 'C',
        options: ['A', 'B', 'C', '无人说真话'],
        explanation: '假设C说真话，则A和B都撒谎，符合条件',
        hint: '使用假设验证法'
      }
    ]
  };
  
  const levelQuestions = logicQuestions[difficulty] || logicQuestions.medium;
  const selected = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
  
  return {
    id: index,
    type: 'logic',
    statement: selected.statement,
    question: selected.question,
    answer: selected.answer,
    options: shuffleArray(selected.options),
    difficulty,
    explanation: selected.explanation,
    hint: selected.hint
  };
};

const generateConditionalQuestion = (difficulty, index) => {
  const conditionalQuestions = {
    easy: [
      {
        conditions: [
          '红球比蓝球重',
          '蓝球比绿球重',
          '绿球比黄球重'
        ],
        question: '哪个球最重？',
        answer: '红球',
        options: ['红球', '蓝球', '绿球', '黄球'],
        explanation: '根据传递性：红>蓝>绿>黄',
        hint: '利用传递性进行比较'
      }
    ],
    medium: [
      {
        conditions: [
          '如果今天是星期一，那么小李上班',
          '如果小李上班，那么他会坐地铁',
          '小李今天没有坐地铁'
        ],
        question: '今天是星期一吗？',
        answer: '不是',
        options: ['是', '不是', '可能是', '无法确定'],
        explanation: '使用逆否推理：没坐地铁→没上班→不是星期一',
        hint: '使用逆否推理'
      }
    ],
    hard: [
      {
        conditions: [
          '在一次聚会中，每个人都至少认识3个人',
          '总共有6个人参加聚会',
          '小王认识的人数是偶数'
        ],
        question: '小王最少认识几个人？',
        answer: '4',
        options: ['3', '4', '5', '6'],
        explanation: '至少3人，且是偶数，所以最少4人',
        hint: '同时满足多个条件'
      }
    ],
    expert: [
      {
        conditions: [
          '有5个盒子，每个盒子里有不同颜色的球',
          '红球不在第1个盒子里',
          '蓝球在红球的右边',
          '绿球在蓝球和黄球之间',
          '白球在第5个盒子里'
        ],
        question: '红球在第几个盒子里？',
        answer: '2',
        options: ['2', '3', '4', '无法确定'],
        explanation: '根据位置约束逐步推导',
        hint: '画图分析位置关系'
      }
    ]
  };
  
  const levelQuestions = conditionalQuestions[difficulty] || conditionalQuestions.medium;
  const selected = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
  
  return {
    id: index,
    type: 'conditional',
    conditions: selected.conditions,
    question: selected.question,
    answer: selected.answer,
    options: shuffleArray(selected.options),
    difficulty,
    explanation: selected.explanation,
    hint: selected.hint
  };
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

const selectAnswer = (option) => {
  selectedAnswer.value = option;
};

const submitAnswer = () => {
  clearInterval(timer.value);
  const responseTime = (Date.now() - questionStartTime.value) / 1000;
  
  const isCorrect = selectedAnswer.value === currentQuestion.value.answer;
  
  // 计算得分
  let points = 0;
  if (isCorrect) {
    const basePoints = getDifficultyPoints(currentQuestion.value.difficulty);
    const speedBonus = Math.max(0, 30 - responseTime) * 0.5; // 速度奖励
    points = Math.round(basePoints + speedBonus);
    currentScore.value += points;
  }
  
  const answerData = {
    questionIndex: currentQuestionIndex.value,
    questionType: currentQuestion.value.type,
    correctAnswer: currentQuestion.value.answer,
    userAnswer: selectedAnswer.value,
    isCorrect,
    isSkipped: false,
    responseTime,
    points,
    difficulty: currentQuestion.value.difficulty,
    explanation: currentQuestion.value.explanation
  };
  
  answers.value.push(answerData);
  lastAnswer.value = answerData;
  
  emit('answer-submitted', answerData);
  
  testPhase.value = 'feedback';
};

const skipQuestion = () => {
  clearInterval(timer.value);
  const responseTime = (Date.now() - questionStartTime.value) / 1000;
  
  const answerData = {
    questionIndex: currentQuestionIndex.value,
    questionType: currentQuestion.value.type,
    correctAnswer: currentQuestion.value.answer,
    userAnswer: null,
    isCorrect: false,
    isSkipped: true,
    responseTime,
    points: 0,
    difficulty: currentQuestion.value.difficulty,
    explanation: currentQuestion.value.explanation
  };
  
  answers.value.push(answerData);
  lastAnswer.value = answerData;
  
  emit('answer-submitted', answerData);
  
  testPhase.value = 'feedback';
};

const continueTesting = () => {
  if (isLastQuestion.value) {
    completeTest();
  } else {
    currentQuestionIndex.value++;
    selectedAnswer.value = null;
    showHint.value = false;
    testPhase.value = 'testing';
    startQuestionTimer();
  }
};

const completeTest = () => {
  testPhase.value = 'results';
  
  emit('test-completed', {
    testType: 'logic-reasoning',
    results: {
      score: finalScore.value,
      accuracy: overallAccuracy.value,
      averageTime: parseFloat(averageTime.value),
      completed: answers.value.filter(a => !a.isSkipped).length,
      total: answers.value.length,
      answers: answers.value,
      totalTime: (Date.now() - startTime.value) / 1000
    }
  });
};

const getDifficultyPoints = (difficulty) => {
  const points = {
    easy: 8,
    medium: 12,
    hard: 18,
    expert: 25
  };
  return points[difficulty] || 12;
};

const getComplexityBonus = () => {
  // 基于题目类型复杂度的奖励分
  const typeComplexity = {
    sequence: 5,
    pattern: 8,
    logic: 10,
    conditional: 12
  };
  
  let bonus = 0;
  answers.value.forEach(answer => {
    if (answer.isCorrect) {
      bonus += typeComplexity[answer.questionType] || 0;
    }
  });
  
  return Math.min(20, bonus / answers.value.length);
};

const getFeedbackExplanation = () => {
  if (lastAnswer.value.isSkipped) {
    return '您跳过了这道题目。';
  }
  
  if (lastAnswer.value.isCorrect) {
    const speed = lastAnswer.value.responseTime < 15 ? '很快' : 
                 lastAnswer.value.responseTime < 30 ? '较快' : '正常';
    return `您${speed}地完成了推理，获得了${lastAnswer.value.points}分！`;
  } else {
    return `推理过程：${lastAnswer.value.explanation}`;
  }
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

const getQuestionTypeLabel = (type) => {
  const labels = {
    sequence: '数列推理',
    pattern: '图形推理',
    logic: '逻辑判断',
    conditional: '条件推理'
  };
  return labels[type] || type;
};

const getTypeAccuracy = (type) => {
  const typeAnswers = answers.value.filter(answer => answer.questionType === type);
  if (typeAnswers.length === 0) return 0;
  const correctAnswers = typeAnswers.filter(answer => answer.isCorrect).length;
  return Math.round((correctAnswers / typeAnswers.length) * 100);
};

const getDifficultyAccuracy = (difficulty) => {
  const difficultyAnswers = answers.value.filter(answer => answer.difficulty === difficulty);
  if (difficultyAnswers.length === 0) return 0;
  const correctAnswers = difficultyAnswers.filter(answer => answer.isCorrect).length;
  return Math.round((correctAnswers / difficultyAnswers.length) * 100);
};

const getPerformanceLevel = (accuracy) => {
  if (accuracy >= 85) return 'excellent';
  if (accuracy >= 75) return 'good';
  if (accuracy >= 65) return 'average';
  return 'poor';
};

const getPerformanceIcon = (accuracy) => {
  if (accuracy >= 85) return '🏆';
  if (accuracy >= 75) return '👍';
  if (accuracy >= 65) return '👌';
  return '💪';
};

const getPerformanceTitle = (accuracy) => {
  if (accuracy >= 85) return '优秀表现';
  if (accuracy >= 75) return '良好表现';
  if (accuracy >= 65) return '一般表现';
  return '需要提高';
};

const getPerformanceDescription = (accuracy) => {
  if (accuracy >= 85) return '您的逻辑推理能力非常出色，能够快速准确地分析复杂问题。';
  if (accuracy >= 75) return '您具有良好的逻辑推理能力，在大多数情况下能够正确分析问题。';
  if (accuracy >= 65) return '您的逻辑推理能力处于平均水平，通过练习可以进一步提高。';
  return '建议加强逻辑思维训练，提高分析和推理能力。';
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
    selectedAnswer.value = null;
    answers.value = [];
    currentScore.value = 0;
  }
}, { deep: true });
</script>

<style scoped>
.logic-reasoning-test {
  width: 100%;
  max-width: 1000px;
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

.score-display {
  font-size: 1.1em;
  font-weight: 600;
  color: #28a745;
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
  max-width: 800px;
  margin: 0 auto;
}

.question-display {
  margin-bottom: 40px;
  text-align: center;
}

.question-type {
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
  margin-bottom: 20px;
}

.question-content {
  margin-bottom: 20px;
}

/* 数列推理 */
.sequence-question {
  text-align: center;
}

.sequence-title {
  font-size: 1.2em;
  color: #495057;
  margin-bottom: 20px;
}

.sequence-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
}

.sequence-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  font-size: 1.3em;
  font-weight: 600;
}

.sequence-question-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #ffc107;
  color: white;
  border-radius: 50%;
  font-size: 2em;
  font-weight: 600;
}

/* 图形推理 */
.pattern-question {
  text-align: center;
}

.pattern-title {
  font-size: 1.2em;
  color: #495057;
  margin-bottom: 20px;
}

.pattern-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
}

.pattern-item {
  width: 80px;
  height: 80px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pattern-question-mark {
  width: 80px;
  height: 80px;
  background: #ffc107;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  font-weight: 600;
}

/* 逻辑判断 */
.logic-question {
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
}

.logic-statement {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  margin-bottom: 20px;
  font-size: 1.1em;
  line-height: 1.6;
}

.logic-question-text {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
  text-align: center;
}

/* 条件推理 */
.conditional-question {
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
}

.conditional-title {
  font-size: 1.2em;
  color: #495057;
  margin-bottom: 20px;
  text-align: center;
}

.conditions-list {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.condition-item {
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  line-height: 1.5;
}

.condition-item:last-child {
  border-bottom: none;
}

.conditional-question {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
  text-align: center;
}

.question-difficulty {
  font-size: 1em;
  color: #6c757d;
  background: #f8f9fa;
  padding: 5px 15px;
  border-radius: 15px;
  display: inline-block;
}

/* 答案选项 */
.answer-choices {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.choice-button {
  padding: 20px;
  font-size: 1.1em;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.choice-button:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.choice-button.selected {
  border-color: #007bff;
  background: #e3f2fd;
  color: #1976d2;
}

/* 图形样式 */
.shape {
  width: 40px;
  height: 40px;
  margin: 5px;
}

.circle {
  border-radius: 50%;
  background: #007bff;
}

.square {
  background: #28a745;
}

.triangle {
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 35px solid #dc3545;
  background: none;
}

.red {
  background: #dc3545 !important;
}

.blue {
  background: #007bff !important;
}

.small {
  width: 20px;
  height: 20px;
}

.medium {
  width: 30px;
  height: 30px;
}

.large {
  width: 40px;
  height: 40px;
}

.extra-large {
  width: 50px;
  height: 50px;
}

.shape-group {
  display: flex;
  align-items: center;
  justify-content: center;
}

.complex-pattern {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

/* 提示部分 */
.hint-section {
  margin-bottom: 30px;
  text-align: center;
}

.hint-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  cursor: pointer;
  color: #856404;
  font-size: 0.9em;
  transition: all 0.3s ease;
}

.hint-toggle:hover {
  background: #ffeaa7;
}

.hint-content {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  color: #6c757d;
  font-style: italic;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.question-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
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

.btn-skip {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1em;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-skip:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* 反馈阶段 */
.feedback-phase {
  max-width: 700px;
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
  text-align: right;
  max-width: 60%;
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

.type-chart,
.difficulty-chart {
  display: grid;
  gap: 15px;
}

.type-bar,
.difficulty-bar {
  display: grid;
  grid-template-columns: 100px 1fr 60px;
  align-items: center;
  gap: 15px;
}

.type-label,
.difficulty-label {
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

.reasoning-stats {
  display: grid;
  gap: 15px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.stat-row:last-child {
  border-bottom: none;
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
  .logic-reasoning-test {
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
  
  .sequence-display {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .sequence-number,
  .sequence-question-mark {
    width: 50px;
    height: 50px;
    font-size: 1.1em;
  }
  
  .pattern-display {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .pattern-item,
  .pattern-question-mark {
    width: 60px;
    height: 60px;
  }
  
  .answer-choices {
    grid-template-columns: 1fr;
  }
  
  .question-controls {
    flex-direction: column;
  }
  
  .overall-results {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .type-bar,
  .difficulty-bar {
    grid-template-columns: 80px 1fr 50px;
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

.choice-button {
  animation: scaleIn 0.4s ease-out;
}

.result-card {
  animation: fadeIn 0.6s ease-out;
}

.sequence-number {
  animation: scaleIn 0.5s ease-out;
}

.pattern-item {
  animation: fadeIn 0.5s ease-out;
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