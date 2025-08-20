<template>
  <div class="arithmetic-test">
    <div class="test-container">
      <!-- 测试说明阶段 -->
      <div v-if="testPhase === 'instruction'" class="instruction-phase">
        <div class="instruction-content">
          <h3>基础运算测试</h3>
          <p class="instruction-text">
            这个测试将评估您的基础数学运算能力，包括加法、减法、乘法和除法。
            请在规定时间内完成尽可能多的题目。
          </p>
          
          <div class="instruction-steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-text">仔细阅读每道题目</div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-text">快速准确地计算结果</div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-text">选择正确答案或输入结果</div>
            </div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-text">如遇困难可跳过题目</div>
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
            <div class="question-text">{{ currentQuestion.expression }}</div>
            <div class="question-difficulty">
              难度: {{ getDifficultyLabel(currentQuestion.difficulty) }}
            </div>
          </div>
          
          <!-- 选择题模式 -->
          <div v-if="currentQuestion.type === 'choice'" class="answer-choices">
            <button 
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="choice-button"
              :class="{ selected: selectedAnswer === option }"
              @click="selectAnswer(option)"
            >
              {{ option }}
            </button>
          </div>
          
          <!-- 输入题模式 -->
          <div v-else class="answer-input">
            <input 
              type="number"
              v-model="inputAnswer"
              @keyup.enter="submitAnswer"
              placeholder="请输入答案"
              class="answer-field"
              ref="answerInput"
            />
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
                {{ lastAnswer.isCorrect ? '回答正确！' : '回答错误' }}
              </div>
              <div class="feedback-explanation">
                {{ getFeedbackExplanation() }}
              </div>
            </div>
          </div>
          
          <div class="feedback-details">
            <div class="detail-item">
              <span class="detail-label">题目：</span>
              <span class="detail-value">{{ lastAnswer.question }}</span>
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
          <h3>基础运算测试结果</h3>
          
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
              <div class="result-icon">🧮</div>
              <div class="result-value">{{ calculationScore }}</div>
              <div class="result-label">运算能力得分</div>
            </div>
          </div>

          <!-- 详细分析 -->
          <div class="detailed-analysis">
            <h4>详细分析</h4>
            <div class="analysis-grid">
              <!-- 运算类型表现 -->
              <div class="analysis-item">
                <h5>运算类型表现</h5>
                <div class="operation-chart">
                  <div 
                    v-for="operation in ['addition', 'subtraction', 'multiplication', 'division']"
                    :key="operation"
                    class="operation-bar"
                  >
                    <div class="operation-label">{{ getOperationLabel(operation) }}</div>
                    <div class="bar-container">
                      <div 
                        class="bar-fill"
                        :style="{ width: getOperationAccuracy(operation) + '%' }"
                      ></div>
                    </div>
                    <div class="accuracy-value">{{ getOperationAccuracy(operation) }}%</div>
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

              <!-- 速度分析 -->
              <div class="analysis-item">
                <h5>速度分析</h5>
                <div class="speed-stats">
                  <div class="stat-row">
                    <span class="stat-label">最快答题：</span>
                    <span class="stat-value">{{ fastestTime }}秒</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">最慢答题：</span>
                    <span class="stat-value">{{ slowestTime }}秒</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">速度稳定性：</span>
                    <span class="stat-value">{{ speedConsistency }}%</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">完成率：</span>
                    <span class="stat-value">{{ completionRate }}%</span>
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
                <li v-if="overallAccuracy < 70">加强基础运算练习，重点提高计算准确性</li>
                <li v-if="averageTime > 15">练习快速心算技巧，提高计算速度</li>
                <li v-if="getOperationAccuracy('multiplication') < 70">重点练习乘法运算</li>
                <li v-if="getOperationAccuracy('division') < 70">加强除法运算训练</li>
                <li v-if="speedConsistency < 70">保持稳定的答题节奏，避免过快或过慢</li>
                <li>定期进行基础运算练习，保持计算能力</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

// Props
const props = defineProps({
  testData: {
    type: Object,
    default: () => ({
      difficulty: 'medium',
      questionCount: 20,
      timeLimit: 600,
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
const inputAnswer = ref('');
const answers = ref([]);
const questions = ref([]);
const startTime = ref(null);
const questionStartTime = ref(null);
const questionTime = ref(0);
const timer = ref(null);
const currentScore = ref(0);
const lastAnswer = ref({});
const showHint = ref(false);
const answerInput = ref(null);

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
  if (currentQuestion.value.type === 'choice') {
    return selectedAnswer.value !== null;
  } else {
    return inputAnswer.value !== '' && !isNaN(inputAnswer.value);
  }
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

const calculationScore = computed(() => {
  // 基于准确率和速度的综合得分
  const accuracyScore = overallAccuracy.value;
  const speedBonus = Math.max(0, 20 - parseFloat(averageTime.value)) * 2;
  return Math.min(100, Math.round(accuracyScore + speedBonus));
});

const fastestTime = computed(() => {
  if (answers.value.length === 0) return 0;
  const times = answers.value.map(answer => answer.responseTime);
  return Math.min(...times).toFixed(1);
});

const slowestTime = computed(() => {
  if (answers.value.length === 0) return 0;
  const times = answers.value.map(answer => answer.responseTime);
  return Math.max(...times).toFixed(1);
});

const speedConsistency = computed(() => {
  if (answers.value.length === 0) return 0;
  const times = answers.value.map(answer => answer.responseTime);
  const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, 100 - (stdDev / avgTime) * 100);
  return Math.round(consistency);
});

const completionRate = computed(() => {
  if (questions.value.length === 0) return 0;
  const completedQuestions = answers.value.filter(answer => !answer.isSkipped).length;
  return Math.round((completedQuestions / questions.value.length) * 100);
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
  const operations = ['addition', 'subtraction', 'multiplication', 'division'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  const difficultySettings = {
    easy: { min: 1, max: 20, decimals: false },
    medium: { min: 1, max: 100, decimals: false },
    hard: { min: 1, max: 500, decimals: true },
    expert: { min: 1, max: 1000, decimals: true }
  };
  
  const settings = difficultySettings[difficulty] || difficultySettings.medium;
  
  let num1, num2, answer, expression, hint;
  
  switch (operation) {
    case 'addition':
      num1 = getRandomNumber(settings.min, settings.max, settings.decimals);
      num2 = getRandomNumber(settings.min, settings.max, settings.decimals);
      answer = num1 + num2;
      expression = `${num1} + ${num2} = ?`;
      hint = '可以先计算整数部分，再计算小数部分';
      break;
      
    case 'subtraction':
      num1 = getRandomNumber(settings.min, settings.max, settings.decimals);
      num2 = getRandomNumber(settings.min, Math.min(num1, settings.max), settings.decimals);
      answer = num1 - num2;
      expression = `${num1} - ${num2} = ?`;
      hint = '确保被减数大于减数，避免负数结果';
      break;
      
    case 'multiplication':
      const maxMult = Math.sqrt(settings.max);
      num1 = getRandomNumber(settings.min, maxMult, settings.decimals);
      num2 = getRandomNumber(settings.min, maxMult, settings.decimals);
      answer = num1 * num2;
      expression = `${num1} × ${num2} = ?`;
      hint = '可以使用分配律简化计算';
      break;
      
    case 'division':
      num2 = getRandomNumber(2, Math.sqrt(settings.max), false); // 除数不为小数
      answer = getRandomNumber(settings.min, settings.max / num2, settings.decimals);
      num1 = answer * num2;
      expression = `${num1} ÷ ${num2} = ?`;
      hint = '检查除法是否能整除，注意小数位数';
      break;
  }
  
  // 决定是选择题还是输入题
  const isChoice = Math.random() < 0.7; // 70%概率是选择题
  
  let options = [];
  if (isChoice) {
    options = generateOptions(answer, operation);
  }
  
  return {
    id: index,
    expression,
    answer: settings.decimals ? parseFloat(answer.toFixed(2)) : Math.round(answer),
    operation,
    difficulty,
    type: isChoice ? 'choice' : 'input',
    options,
    hint
  };
};

const getRandomNumber = (min, max, allowDecimals) => {
  const num = Math.random() * (max - min) + min;
  return allowDecimals ? parseFloat(num.toFixed(2)) : Math.round(num);
};

const generateOptions = (correctAnswer, operation) => {
  const options = [correctAnswer];
  
  // 生成3个错误选项
  for (let i = 0; i < 3; i++) {
    let wrongAnswer;
    do {
      const variation = correctAnswer * (0.1 + Math.random() * 0.4); // 10%-50%的变化
      wrongAnswer = Math.random() < 0.5 ? 
        correctAnswer + variation : 
        correctAnswer - variation;
      
      // 根据运算类型调整错误答案
      if (operation === 'division' && wrongAnswer < 0) {
        wrongAnswer = Math.abs(wrongAnswer);
      }
      
      wrongAnswer = parseFloat(wrongAnswer.toFixed(2));
    } while (options.includes(wrongAnswer) || wrongAnswer <= 0);
    
    options.push(wrongAnswer);
  }
  
  // 打乱选项顺序
  return shuffleArray(options);
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
  
  let userAnswer, isCorrect;
  
  if (currentQuestion.value.type === 'choice') {
    userAnswer = selectedAnswer.value;
    isCorrect = userAnswer === currentQuestion.value.answer;
  } else {
    userAnswer = parseFloat(inputAnswer.value);
    isCorrect = Math.abs(userAnswer - currentQuestion.value.answer) < 0.01; // 允许小的浮点误差
  }
  
  // 计算得分
  let points = 0;
  if (isCorrect) {
    const basePoints = getDifficultyPoints(currentQuestion.value.difficulty);
    const speedBonus = Math.max(0, 10 - responseTime) * 0.5; // 速度奖励
    points = Math.round(basePoints + speedBonus);
    currentScore.value += points;
  }
  
  const answerData = {
    questionIndex: currentQuestionIndex.value,
    question: currentQuestion.value.expression,
    correctAnswer: currentQuestion.value.answer,
    userAnswer,
    isCorrect,
    isSkipped: false,
    responseTime,
    points,
    operation: currentQuestion.value.operation,
    difficulty: currentQuestion.value.difficulty
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
    question: currentQuestion.value.expression,
    correctAnswer: currentQuestion.value.answer,
    userAnswer: null,
    isCorrect: false,
    isSkipped: true,
    responseTime,
    points: 0,
    operation: currentQuestion.value.operation,
    difficulty: currentQuestion.value.difficulty
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
    inputAnswer.value = '';
    showHint.value = false;
    testPhase.value = 'testing';
    startQuestionTimer();
    
    // 自动聚焦输入框
    if (currentQuestion.value.type === 'input') {
      nextTick(() => {
        if (answerInput.value) {
          answerInput.value.focus();
        }
      });
    }
  }
};

const completeTest = () => {
  testPhase.value = 'results';
  
  emit('test-completed', {
    testType: 'arithmetic',
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
    easy: 5,
    medium: 10,
    hard: 15,
    expert: 20
  };
  return points[difficulty] || 10;
};

const getFeedbackExplanation = () => {
  if (lastAnswer.value.isSkipped) {
    return '您跳过了这道题目。';
  }
  
  if (lastAnswer.value.isCorrect) {
    const speed = lastAnswer.value.responseTime < 5 ? '很快' : 
                 lastAnswer.value.responseTime < 10 ? '较快' : '正常';
    return `您${speed}地给出了正确答案，获得了${lastAnswer.value.points}分！`;
  } else {
    return `正确答案是${lastAnswer.value.correctAnswer}，请注意计算过程。`;
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

const getOperationLabel = (operation) => {
  const labels = {
    addition: '加法',
    subtraction: '减法',
    multiplication: '乘法',
    division: '除法'
  };
  return labels[operation] || operation;
};

const getOperationAccuracy = (operation) => {
  const operationAnswers = answers.value.filter(answer => answer.operation === operation);
  if (operationAnswers.length === 0) return 0;
  const correctAnswers = operationAnswers.filter(answer => answer.isCorrect).length;
  return Math.round((correctAnswers / operationAnswers.length) * 100);
};

const getDifficultyAccuracy = (difficulty) => {
  const difficultyAnswers = answers.value.filter(answer => answer.difficulty === difficulty);
  if (difficultyAnswers.length === 0) return 0;
  const correctAnswers = difficultyAnswers.filter(answer => answer.isCorrect).length;
  return Math.round((correctAnswers / difficultyAnswers.length) * 100);
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
  if (accuracy >= 90) return '您的基础运算能力非常出色，计算准确且快速。';
  if (accuracy >= 80) return '您具有良好的基础运算能力，在大多数情况下能够准确计算。';
  if (accuracy >= 70) return '您的基础运算能力处于平均水平，通过练习可以进一步提高。';
  return '建议加强基础运算训练，提高计算的准确性和速度。';
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
    inputAnswer.value = '';
    answers.value = [];
    currentScore.value = 0;
  }
}, { deep: true });
</script>

<style scoped>
.arithmetic-test {
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
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.question-display {
  margin-bottom: 40px;
}

.question-text {
  font-size: 2.5em;
  font-weight: 300;
  color: #2c3e50;
  margin-bottom: 15px;
  font-family: 'Courier New', monospace;
}

.question-difficulty {
  font-size: 1em;
  color: #6c757d;
  background: #f8f9fa;
  padding: 5px 15px;
  border-radius: 15px;
  display: inline-block;
}

/* 选择题 */
.answer-choices {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.choice-button {
  padding: 20px;
  font-size: 1.3em;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
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

/* 输入题 */
.answer-input {
  margin-bottom: 30px;
}

.answer-field {
  width: 200px;
  padding: 15px;
  font-size: 1.5em;
  text-align: center;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  transition: border-color 0.3s ease;
}

.answer-field:focus {
  outline: none;
  border-color: #007bff;
}

/* 提示部分 */
.hint-section {
  margin-bottom: 30px;
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
  font-family: 'Courier New', monospace;
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

.operation-chart,
.difficulty-chart {
  display: grid;
  gap: 15px;
}

.operation-bar,
.difficulty-bar {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  align-items: center;
  gap: 15px;
}

.operation-label,
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

.speed-stats {
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
  .arithmetic-test {
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
  
  .question-text {
    font-size: 2em;
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
  
  .operation-bar,
  .difficulty-bar {
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

.choice-button {
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