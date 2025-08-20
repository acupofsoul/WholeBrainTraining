<template>
  <div class="verbal-reasoning-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase">
      <div class="instruction-content">
        <h2>语言推理测试</h2>
        <div class="test-description">
          <p>语言推理测试评估您的语言理解、逻辑分析和推理能力。</p>
          <div class="test-features">
            <div class="feature-item">
              <div class="feature-icon">📖</div>
              <div class="feature-text">
                <h4>阅读理解</h4>
                <p>理解文本内容，提取关键信息</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🧩</div>
              <div class="feature-text">
                <h4>逻辑推理</h4>
                <p>基于给定条件进行逻辑推断</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">💭</div>
              <div class="feature-text">
                <h4>语言分析</h4>
                <p>分析词汇关系和语义结构</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="test-steps">
          <h3>测试步骤</h3>
          <ol>
            <li>仔细阅读题目内容</li>
            <li>分析题目中的逻辑关系</li>
            <li>选择最符合逻辑的答案</li>
            <li>在规定时间内完成作答</li>
          </ol>
        </div>
        
        <div class="test-settings">
          <div class="setting-group">
            <label>难度等级：</label>
            <select v-model="settings.difficulty">
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
          <div class="setting-group">
            <label>题目数量：</label>
            <select v-model="settings.questionCount">
              <option value="10">10题</option>
              <option value="15">15题</option>
              <option value="20">20题</option>
            </select>
          </div>
          <div class="setting-group">
            <label>测试类型：</label>
            <select v-model="settings.testType">
              <option value="mixed">综合测试</option>
              <option value="reading">阅读理解</option>
              <option value="analogy">类比推理</option>
              <option value="logic">逻辑推理</option>
            </select>
          </div>
        </div>
        
        <button class="start-btn" @click="startTest">开始测试</button>
      </div>
    </div>

    <!-- 测试进行阶段 -->
    <div v-if="currentPhase === 'testing'" class="testing-phase">
      <div class="test-header">
        <div class="progress-info">
          <span class="question-counter">{{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
          <div class="timer">⏱️ {{ formatTime(timeRemaining) }}</div>
        </div>
        <div class="score-info">
          <span class="current-score">得分: {{ currentScore }}</span>
        </div>
      </div>
      
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      
      <div class="question-container">
        <div class="question-content">
          <div class="question-type">{{ getQuestionTypeLabel(currentQuestion.type) }}</div>
          <div class="question-text" v-html="currentQuestion.question"></div>
          
          <!-- 阅读理解题型 -->
          <div v-if="currentQuestion.type === 'reading'" class="reading-question">
            <div class="passage" v-html="currentQuestion.passage"></div>
            <div class="question-prompt">{{ currentQuestion.prompt }}</div>
          </div>
          
          <!-- 类比推理题型 -->
          <div v-if="currentQuestion.type === 'analogy'" class="analogy-question">
            <div class="analogy-format">
              <span class="analogy-pair">{{ currentQuestion.pair1[0] }} : {{ currentQuestion.pair1[1] }}</span>
              <span class="analogy-separator">=</span>
              <span class="analogy-pair">{{ currentQuestion.pair2[0] }} : ?</span>
            </div>
          </div>
          
          <!-- 逻辑推理题型 -->
          <div v-if="currentQuestion.type === 'logic'" class="logic-question">
            <div class="premises">
              <div v-for="(premise, index) in currentQuestion.premises" :key="index" class="premise">
                {{ premise }}
              </div>
            </div>
            <div class="conclusion-prompt">基于以上条件，可以得出：</div>
          </div>
          
          <div class="difficulty-indicator">
            <span class="difficulty-label">难度:</span>
            <div class="difficulty-stars">
              <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= currentQuestion.difficulty }">★</span>
            </div>
          </div>
        </div>
        
        <div class="answer-options">
          <div v-for="(option, index) in currentQuestion.options" :key="index" 
               class="option-item" 
               :class="{ selected: selectedAnswer === index }"
               @click="selectAnswer(index)">
            <div class="option-label">{{ String.fromCharCode(65 + index) }}</div>
            <div class="option-text">{{ option }}</div>
          </div>
        </div>
        
        <div class="hint-section" v-if="showHint">
          <div class="hint-content">
            <div class="hint-icon">💡</div>
            <div class="hint-text">{{ currentQuestion.hint }}</div>
          </div>
        </div>
      </div>
      
      <div class="question-controls">
        <button class="hint-btn" @click="toggleHint" :disabled="hintUsed">
          {{ showHint ? '隐藏提示' : '显示提示' }}
        </button>
        <button class="submit-btn" @click="submitAnswer" :disabled="selectedAnswer === null">提交答案</button>
        <button class="skip-btn" @click="skipQuestion">跳过此题</button>
      </div>
    </div>

    <!-- 反馈阶段 -->
    <div v-if="currentPhase === 'feedback'" class="feedback-phase">
      <div class="feedback-content">
        <div class="feedback-result" :class="{ correct: lastAnswerCorrect, incorrect: !lastAnswerCorrect }">
          <div class="result-icon">{{ lastAnswerCorrect ? '✅' : '❌' }}</div>
          <div class="result-text">{{ lastAnswerCorrect ? '回答正确！' : '回答错误' }}</div>
        </div>
        
        <div class="answer-details">
          <div class="detail-item">
            <span class="detail-label">题目类型：</span>
            <span class="detail-value">{{ getQuestionTypeLabel(lastQuestion.type) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">正确答案：</span>
            <span class="detail-value">{{ String.fromCharCode(65 + lastQuestion.correctAnswer) }}. {{ lastQuestion.options[lastQuestion.correctAnswer] }}</span>
          </div>
          <div class="detail-item" v-if="userAnswer !== null">
            <span class="detail-label">您的答案：</span>
            <span class="detail-value">{{ String.fromCharCode(65 + userAnswer) }}. {{ lastQuestion.options[userAnswer] }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">用时：</span>
            <span class="detail-value">{{ formatTime(lastQuestionTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">得分：</span>
            <span class="detail-value">+{{ lastQuestionScore }}分</span>
          </div>
        </div>
        
        <div class="explanation">
          <h4>解析：</h4>
          <p>{{ lastQuestion.explanation }}</p>
        </div>
        
        <button class="continue-btn" @click="nextQuestion">{{ isLastQuestion ? '查看结果' : '下一题' }}</button>
      </div>
    </div>

    <!-- 结果展示阶段 -->
    <div v-if="currentPhase === 'results'" class="results-phase">
      <div class="results-content">
        <h2>测试完成</h2>
        
        <div class="overall-score">
          <div class="score-circle">
            <div class="score-value">{{ overallAccuracy }}%</div>
            <div class="score-label">总体准确率</div>
          </div>
        </div>
        
        <div class="performance-stats">
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value">{{ formatTime(averageTime) }}</div>
            <div class="stat-label">平均用时</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-value">{{ totalScore }}</div>
            <div class="stat-label">总得分</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🧠</div>
            <div class="stat-value">{{ verbalReasoningScore }}</div>
            <div class="stat-label">语言推理得分</div>
          </div>
        </div>
        
        <div class="type-performance">
          <h3>题型表现</h3>
          <div class="type-stats">
            <div v-for="type in questionTypes" :key="type" class="type-stat">
              <div class="type-label">{{ getQuestionTypeLabel(type) }}</div>
              <div class="type-accuracy">{{ getTypeAccuracy(type) }}%</div>
              <div class="type-bar">
                <div class="type-fill" :style="{ width: getTypeAccuracy(type) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="difficulty-analysis">
          <h3>难度分析</h3>
          <div class="difficulty-stats">
            <div v-for="level in [1, 2, 3, 4, 5]" :key="level" class="difficulty-stat">
              <div class="difficulty-label">
                <span v-for="i in level" :key="i" class="star">★</span>
              </div>
              <div class="difficulty-accuracy">{{ getDifficultyAccuracy(level) }}%</div>
              <div class="difficulty-bar">
                <div class="difficulty-fill" :style="{ width: getDifficultyAccuracy(level) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="performance-analysis">
          <h3>能力分析</h3>
          <div class="analysis-item" :class="getPerformanceLevel(overallAccuracy)">
            <div class="analysis-icon">{{ getPerformanceIcon(overallAccuracy) }}</div>
            <div class="analysis-content">
              <h4>{{ getPerformanceTitle(overallAccuracy) }}</h4>
              <p>{{ getPerformanceDescription(overallAccuracy) }}</p>
            </div>
          </div>
        </div>
        
        <div class="improvement-suggestions">
          <h3>改进建议</h3>
          <ul>
            <li v-for="suggestion in getImprovementSuggestions()" :key="suggestion">{{ suggestion }}</li>
          </ul>
        </div>
        
        <div class="action-buttons">
          <button class="retry-btn" @click="restartTest">重新测试</button>
          <button class="back-btn" @click="$emit('go-back')">返回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['go-back']);

// 当前阶段
const currentPhase = ref('instruction');

// 测试设置
const settings = ref({
  difficulty: 'medium',
  questionCount: 15,
  testType: 'mixed'
});

// 测试状态
const currentQuestionIndex = ref(0);
const selectedAnswer = ref(null);
const currentScore = ref(0);
const timeRemaining = ref(0);
const questionStartTime = ref(0);
const showHint = ref(false);
const hintUsed = ref(false);

// 测试数据
const questions = ref([]);
const answers = ref([]);
const questionTimes = ref([]);
const questionScores = ref([]);

// 反馈数据
const lastAnswerCorrect = ref(false);
const lastQuestion = ref({});
const lastQuestionTime = ref(0);
const lastQuestionScore = ref(0);
const userAnswer = ref(null);

// 计时器
let timer = null;

// 计算属性
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || {});
const progressPercentage = computed(() => ((currentQuestionIndex.value + 1) / questions.value.length) * 100);
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1);

// 结果统计
const overallAccuracy = computed(() => {
  if (answers.value.length === 0) return 0;
  const correct = answers.value.filter(answer => answer.correct).length;
  return Math.round((correct / answers.value.length) * 100);
});

const averageTime = computed(() => {
  if (questionTimes.value.length === 0) return 0;
  const total = questionTimes.value.reduce((sum, time) => sum + time, 0);
  return Math.round(total / questionTimes.value.length);
});

const totalScore = computed(() => {
  return questionScores.value.reduce((sum, score) => sum + score, 0);
});

const verbalReasoningScore = computed(() => {
  return Math.round(overallAccuracy.value * 0.8 + (averageTime.value < 30000 ? 20 : 10));
});

const questionTypes = computed(() => {
  return [...new Set(questions.value.map(q => q.type))];
});

// 方法
const startTest = () => {
  generateQuestions();
  currentPhase.value = 'testing';
  startQuestion();
};

const generateQuestions = () => {
  const questionPool = {
    reading: [
      {
        type: 'reading',
        passage: '人工智能技术的发展正在改变我们的生活方式。从智能手机到自动驾驶汽车，AI技术已经渗透到各个领域。然而，随着AI技术的普及，也带来了一些挑战，如就业问题、隐私保护等。',
        question: '根据文章内容，以下哪个说法是正确的？',
        prompt: '请选择最符合文章内容的选项：',
        options: [
          'AI技术只应用于智能手机领域',
          'AI技术的发展没有任何负面影响',
          'AI技术在改变生活的同时也带来了挑战',
          'AI技术的发展已经停滞不前'
        ],
        correctAnswer: 2,
        difficulty: 2,
        hint: '注意文章中提到的AI技术的双面性',
        explanation: 'AI技术在改变生活方式的同时，也确实带来了就业和隐私等方面的挑战。'
      }
    ],
    analogy: [
      {
        type: 'analogy',
        question: '请完成以下类比关系：',
        pair1: ['书籍', '知识'],
        pair2: ['食物', '?'],
        options: ['营养', '美味', '饥饿', '餐厅'],
        correctAnswer: 0,
        difficulty: 2,
        hint: '思考书籍与知识的关系，食物能提供什么？',
        explanation: '书籍提供知识，食物提供营养，都是提供某种必需品的关系。'
      }
    ],
    logic: [
      {
        type: 'logic',
        question: '逻辑推理题：',
        premises: [
          '所有的鸟都有羽毛',
          '企鹅是鸟',
          '企鹅不会飞'
        ],
        options: [
          '企鹅没有羽毛',
          '企鹅有羽毛',
          '会飞的动物都是鸟',
          '有羽毛的动物都会飞'
        ],
        correctAnswer: 1,
        difficulty: 3,
        hint: '根据前两个条件可以直接推出结论',
        explanation: '根据"所有的鸟都有羽毛"和"企鹅是鸟"，可以推出企鹅有羽毛。'
      }
    ]
  };
  
  const selectedTypes = settings.value.testType === 'mixed' ? 
    ['reading', 'analogy', 'logic'] : [settings.value.testType];
  
  questions.value = [];
  for (let i = 0; i < settings.value.questionCount; i++) {
    const type = selectedTypes[i % selectedTypes.length];
    const typeQuestions = questionPool[type] || [];
    if (typeQuestions.length > 0) {
      const question = { ...typeQuestions[Math.floor(Math.random() * typeQuestions.length)] };
      // 根据难度设置调整题目难度
      if (settings.value.difficulty === 'easy') {
        question.difficulty = Math.max(1, question.difficulty - 1);
      } else if (settings.value.difficulty === 'hard') {
        question.difficulty = Math.min(5, question.difficulty + 1);
      }
      questions.value.push(question);
    }
  }
};

const startQuestion = () => {
  selectedAnswer.value = null;
  showHint.value = false;
  hintUsed.value = false;
  questionStartTime.value = Date.now();
  timeRemaining.value = 60000; // 60秒
  
  timer = setInterval(() => {
    timeRemaining.value -= 1000;
    if (timeRemaining.value <= 0) {
      submitAnswer();
    }
  }, 1000);
};

const selectAnswer = (index) => {
  selectedAnswer.value = index;
};

const toggleHint = () => {
  showHint.value = !showHint.value;
  if (showHint.value) {
    hintUsed.value = true;
  }
};

const submitAnswer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  
  const questionTime = Date.now() - questionStartTime.value;
  const correct = selectedAnswer.value === currentQuestion.value.correctAnswer;
  let score = 0;
  
  if (correct) {
    score = Math.max(10, 100 - Math.floor(questionTime / 1000) * 2);
    if (hintUsed.value) score = Math.floor(score * 0.8);
  }
  
  // 记录答案
  answers.value.push({
    questionIndex: currentQuestionIndex.value,
    userAnswer: selectedAnswer.value,
    correct: correct,
    time: questionTime,
    score: score,
    hintUsed: hintUsed.value
  });
  
  questionTimes.value.push(questionTime);
  questionScores.value.push(score);
  currentScore.value += score;
  
  // 设置反馈数据
  lastAnswerCorrect.value = correct;
  lastQuestion.value = { ...currentQuestion.value };
  lastQuestionTime.value = questionTime;
  lastQuestionScore.value = score;
  userAnswer.value = selectedAnswer.value;
  
  currentPhase.value = 'feedback';
};

const skipQuestion = () => {
  selectedAnswer.value = null;
  submitAnswer();
};

const nextQuestion = () => {
  if (isLastQuestion.value) {
    currentPhase.value = 'results';
  } else {
    currentQuestionIndex.value++;
    currentPhase.value = 'testing';
    startQuestion();
  }
};

const restartTest = () => {
  currentPhase.value = 'instruction';
  currentQuestionIndex.value = 0;
  currentScore.value = 0;
  answers.value = [];
  questionTimes.value = [];
  questionScores.value = [];
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

// 辅助方法
const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getQuestionTypeLabel = (type) => {
  const labels = {
    reading: '阅读理解',
    analogy: '类比推理',
    logic: '逻辑推理'
  };
  return labels[type] || type;
};

const getTypeAccuracy = (type) => {
  const typeAnswers = answers.value.filter((_, index) => questions.value[index]?.type === type);
  if (typeAnswers.length === 0) return 0;
  const correct = typeAnswers.filter(answer => answer.correct).length;
  return Math.round((correct / typeAnswers.length) * 100);
};

const getDifficultyAccuracy = (level) => {
  const difficultyAnswers = answers.value.filter((_, index) => questions.value[index]?.difficulty === level);
  if (difficultyAnswers.length === 0) return 0;
  const correct = difficultyAnswers.filter(answer => answer.correct).length;
  return Math.round((correct / difficultyAnswers.length) * 100);
};

const getPerformanceLevel = (accuracy) => {
  if (accuracy >= 90) return 'excellent';
  if (accuracy >= 80) return 'good';
  if (accuracy >= 70) return 'average';
  return 'needs-improvement';
};

const getPerformanceIcon = (accuracy) => {
  if (accuracy >= 90) return '🏆';
  if (accuracy >= 80) return '👍';
  if (accuracy >= 70) return '👌';
  return '💪';
};

const getPerformanceTitle = (accuracy) => {
  if (accuracy >= 90) return '优秀';
  if (accuracy >= 80) return '良好';
  if (accuracy >= 70) return '一般';
  return '需要提高';
};

const getPerformanceDescription = (accuracy) => {
  if (accuracy >= 90) return '您的语言推理能力非常出色，能够准确理解和分析复杂的语言信息。';
  if (accuracy >= 80) return '您的语言推理能力良好，在大多数情况下能够正确理解和推理。';
  if (accuracy >= 70) return '您的语言推理能力一般，在某些复杂情况下可能需要更多时间思考。';
  return '您的语言推理能力有待提高，建议多练习阅读理解和逻辑推理。';
};

const getImprovementSuggestions = () => {
  const suggestions = [];
  
  if (overallAccuracy.value < 70) {
    suggestions.push('多阅读不同类型的文章，提高阅读理解能力');
    suggestions.push('练习逻辑推理题，培养逻辑思维能力');
  }
  
  if (averageTime.value > 45000) {
    suggestions.push('提高阅读速度，练习快速抓取关键信息');
  }
  
  const readingAccuracy = getTypeAccuracy('reading');
  if (readingAccuracy < 70) {
    suggestions.push('加强阅读理解训练，注意理解文章的主旨和细节');
  }
  
  const analogyAccuracy = getTypeAccuracy('analogy');
  if (analogyAccuracy < 70) {
    suggestions.push('多练习类比推理，培养发现事物间关系的能力');
  }
  
  const logicAccuracy = getTypeAccuracy('logic');
  if (logicAccuracy < 70) {
    suggestions.push('加强逻辑推理训练，学习基本的逻辑推理规则');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('继续保持良好的语言推理能力，可以尝试更高难度的挑战');
  }
  
  return suggestions;
};

// 生命周期
onMounted(() => {
  // 组件挂载时的初始化
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.verbal-reasoning-test {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 测试说明阶段样式 */
.instruction-phase {
  text-align: center;
}

.instruction-content h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 2.5em;
}

.test-description {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.test-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  text-align: left;
}

.feature-icon {
  font-size: 2em;
  margin-right: 15px;
}

.feature-text h4 {
  margin: 0 0 5px 0;
  font-size: 1.1em;
}

.feature-text p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9em;
}

.test-steps {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 30px;
  text-align: left;
}

.test-steps h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  text-align: center;
}

.test-steps ol {
  font-size: 1.1em;
  line-height: 1.6;
}

.test-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.setting-group {
  text-align: left;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.setting-group select {
  width: 100%;
  padding: 10px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1em;
  background: white;
}

.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2em;
  border-radius: 25px;
  cursor: pointer;
  transition: transform 0.2s;
}

.start-btn:hover {
  transform: translateY(-2px);
}

/* 测试进行阶段样式 */
.testing-phase {
  animation: fadeInUp 0.5s ease-out;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.question-counter {
  font-weight: 600;
  color: #2c3e50;
}

.timer {
  color: #e74c3c;
  font-weight: 600;
}

.score-info {
  color: #27ae60;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e1e8ed;
  border-radius: 4px;
  margin-bottom: 30px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.question-container {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.question-content {
  margin-bottom: 25px;
}

.question-type {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9em;
  margin-bottom: 15px;
}

.question-text {
  font-size: 1.2em;
  color: #2c3e50;
  margin-bottom: 20px;
  line-height: 1.6;
}

.reading-question .passage {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 15px;
  line-height: 1.6;
  border-left: 4px solid #667eea;
}

.question-prompt {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
}

.analogy-question {
  text-align: center;
  margin: 20px 0;
}

.analogy-format {
  font-size: 1.5em;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.analogy-pair {
  font-weight: 600;
}

.analogy-separator {
  color: #667eea;
  font-weight: bold;
}

.logic-question .premises {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 15px;
}

.premise {
  padding: 8px 0;
  border-bottom: 1px solid #e1e8ed;
}

.premise:last-child {
  border-bottom: none;
}

.conclusion-prompt {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
}

.difficulty-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
}

.difficulty-label {
  font-weight: 600;
  color: #2c3e50;
}

.difficulty-stars .star {
  color: #ddd;
  margin-right: 2px;
}

.difficulty-stars .star.active {
  color: #f39c12;
}

.answer-options {
  display: grid;
  gap: 15px;
  margin-bottom: 25px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.option-item.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.option-label {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 15px;
  flex-shrink: 0;
}

.option-item.selected .option-label {
  background: white;
  color: #667eea;
}

.option-text {
  flex: 1;
  line-height: 1.4;
}

.hint-section {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
}

.hint-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.hint-icon {
  font-size: 1.2em;
}

.hint-text {
  flex: 1;
  color: #856404;
  line-height: 1.4;
}

.question-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.question-controls button {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.2s;
}

.hint-btn {
  background: #f39c12;
  color: white;
}

.hint-btn:hover:not(:disabled) {
  background: #e67e22;
}

.hint-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.submit-btn {
  background: #27ae60;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #229954;
}

.submit-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.skip-btn {
  background: #95a5a6;
  color: white;
}

.skip-btn:hover {
  background: #7f8c8d;
}

/* 反馈阶段样式 */
.feedback-phase {
  animation: fadeInScale 0.5s ease-out;
}

.feedback-content {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
}

.feedback-result {
  margin-bottom: 25px;
}

.feedback-result.correct .result-icon {
  font-size: 3em;
  margin-bottom: 10px;
}

.feedback-result.incorrect .result-icon {
  font-size: 3em;
  margin-bottom: 10px;
}

.result-text {
  font-size: 1.5em;
  font-weight: 600;
  margin-bottom: 20px;
}

.feedback-result.correct .result-text {
  color: #27ae60;
}

.feedback-result.incorrect .result-text {
  color: #e74c3c;
}

.answer-details {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e1e8ed;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #2c3e50;
}

.detail-value {
  color: #7f8c8d;
}

.explanation {
  background: #e8f4fd;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 25px;
  text-align: left;
}

.explanation h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.explanation p {
  color: #5a6c7d;
  line-height: 1.6;
  margin: 0;
}

.continue-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1em;
  border-radius: 25px;
  cursor: pointer;
  transition: transform 0.2s;
}

.continue-btn:hover {
  transform: translateY(-2px);
}

/* 结果展示阶段样式 */
.results-phase {
  animation: fadeInUp 0.5s ease-out;
}

.results-content {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.results-content h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2.2em;
}

.overall-score {
  text-align: center;
  margin-bottom: 40px;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.score-value {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 5px;
}

.score-label {
  font-size: 0.9em;
  opacity: 0.9;
}

.performance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: #667eea;
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5em;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 1.8em;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9em;
}

.type-performance,
.difficulty-analysis {
  margin-bottom: 30px;
}

.type-performance h3,
.difficulty-analysis h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3em;
}

.type-stats,
.difficulty-stats {
  display: grid;
  gap: 15px;
}

.type-stat,
.difficulty-stat {
  display: grid;
  grid-template-columns: 120px 60px 1fr;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.type-label,
.difficulty-label {
  font-weight: 600;
  color: #2c3e50;
}

.type-accuracy,
.difficulty-accuracy {
  font-weight: 600;
  color: #667eea;
}

.type-bar,
.difficulty-bar {
  height: 8px;
  background: #e1e8ed;
  border-radius: 4px;
  overflow: hidden;
}

.type-fill,
.difficulty-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.5s ease;
}

.performance-analysis {
  margin-bottom: 30px;
}

.performance-analysis h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3em;
}

.analysis-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #e1e8ed;
}

.analysis-item.excellent {
  border-color: #27ae60;
  background: #d5f4e6;
}

.analysis-item.good {
  border-color: #f39c12;
  background: #fef9e7;
}

.analysis-item.average {
  border-color: #3498db;
  background: #ebf3fd;
}

.analysis-item.needs-improvement {
  border-color: #e74c3c;
  background: #fdf2f2;
}

.analysis-icon {
  font-size: 2em;
}

.analysis-content h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.analysis-content p {
  margin: 0;
  color: #5a6c7d;
  line-height: 1.5;
}

.improvement-suggestions {
  margin-bottom: 30px;
}

.improvement-suggestions h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.3em;
}

.improvement-suggestions ul {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.improvement-suggestions li {
  margin-bottom: 10px;
  color: #5a6c7d;
  line-height: 1.5;
}

.improvement-suggestions li:last-child {
  margin-bottom: 0;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-buttons button {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn {
  background: #667eea;
  color: white;
}

.retry-btn:hover {
  background: #5a67d8;
}

.back-btn {
  background: #95a5a6;
  color: white;
}

.back-btn:hover {
  background: #7f8c8d;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .verbal-reasoning-test {
    padding: 15px;
  }
  
  .test-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .progress-info {
    justify-content: center;
  }
  
  .question-container {
    padding: 20px;
  }
  
  .analogy-format {
    flex-direction: column;
    gap: 10px;
  }
  
  .question-controls {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .instruction-content h2 {
    font-size: 2em;
  }
  
  .test-features {
    grid-template-columns: 1fr;
  }
  
  .test-settings {
    grid-template-columns: 1fr;
  }
  
  .performance-stats {
    grid-template-columns: 1fr;
  }
  
  .type-stat,
  .difficulty-stat {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
</style>