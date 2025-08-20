<template>
  <div class="instant-calculation-container">
    <div class="header">
      <h2>瞬时计算</h2>
      <p>通过快速心算训练，提升数字处理和计算能力</p>
    </div>

    <div class="difficulty-selection" v-if="!isTraining">
      <h3>选择难度</h3>
      <div class="difficulty-cards">
        <div class="difficulty-card" 
             v-for="level in difficultyLevels" 
             :key="level.id"
             @click="selectDifficulty(level)"
             :class="{ active: selectedDifficulty?.id === level.id }">
          <h4>{{ level.name }}</h4>
          <p>{{ level.description }}</p>
          <div class="level-info">
            <span class="difficulty-stars">{{ level.stars }}</span>
            <span class="time-limit">{{ level.timeLimit }}秒</span>
          </div>
        </div>
      </div>
      
      <div class="training-settings" v-if="selectedDifficulty">
        <div class="settings-row">
          <div class="setting-item">
            <label>题目数量:</label>
            <select v-model="settings.questionCount">
              <option value="10">10题</option>
              <option value="20">20题</option>
              <option value="30">30题</option>
              <option value="50">50题</option>
            </select>
          </div>
          <div class="setting-item">
            <label>答题时间:</label>
            <input v-model.number="settings.timeLimit" type="number" min="3" max="30" step="1" />
            <span>秒</span>
          </div>
        </div>
        <button @click="startTraining" class="btn-primary">开始训练</button>
      </div>
    </div>

    <div class="training-area" v-if="isTraining">
      <!-- 准备阶段 -->
      <div v-if="gamePhase === 'ready'" class="ready-phase">
        <h3>准备开始</h3>
        <div class="countdown-circle">
          <span class="countdown-number">{{ countdown }}</span>
        </div>
        <p>请准备好进行快速计算</p>
      </div>

      <!-- 计算阶段 -->
      <div v-if="gamePhase === 'calculating'" class="calculation-phase">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          <span class="progress-text">{{ currentQuestionIndex + 1 }} / {{ settings.questionCount }}</span>
        </div>
        
        <div class="question-display">
          <div class="expression">{{ currentQuestion.expression }}</div>
          <div class="timer-circle">
            <svg class="timer-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" class="timer-bg"></circle>
              <circle cx="50" cy="50" r="45" class="timer-progress" 
                      :style="{ strokeDashoffset: timerOffset }"></circle>
            </svg>
            <span class="timer-text">{{ questionTimeLeft }}</span>
          </div>
        </div>
        
        <div class="answer-input">
          <input v-model="userAnswer" 
                 @keyup.enter="submitAnswer"
                 @input="validateInput"
                 type="number" 
                 placeholder="输入答案"
                 ref="answerInput"
                 :disabled="questionTimeLeft <= 0" />
          <button @click="submitAnswer" 
                  :disabled="!userAnswer || questionTimeLeft <= 0"
                  class="btn-submit">提交</button>
        </div>
        
        <div class="quick-feedback" v-if="showQuickFeedback">
          <span :class="lastAnswerCorrect ? 'correct' : 'incorrect'">
            {{ lastAnswerCorrect ? '✓ 正确!' : '✗ 错误!' }}
          </span>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="gamePhase === 'result'" class="result-phase">
        <h3>训练完成!</h3>
        
        <div class="score-summary">
          <div class="score-circle">
            <span class="score-number">{{ correctAnswers }}</span>
            <span class="score-total">/ {{ settings.questionCount }}</span>
          </div>
          <div class="accuracy">准确率: {{ Math.round((correctAnswers / settings.questionCount) * 100) }}%</div>
        </div>
        
        <div class="performance-stats">
          <div class="stat-item">
            <span class="stat-label">平均用时:</span>
            <span class="stat-value">{{ averageTime.toFixed(1) }}秒</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最快用时:</span>
            <span class="stat-value">{{ fastestTime.toFixed(1) }}秒</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总用时:</span>
            <span class="stat-value">{{ totalTime.toFixed(1) }}秒</span>
          </div>
        </div>
        
        <div class="performance-level">
          <h4>表现评级</h4>
          <div class="level-badge" :class="performanceLevel.class">
            {{ performanceLevel.name }}
          </div>
          <p>{{ performanceLevel.description }}</p>
        </div>
        
        <div class="result-actions">
          <button @click="restartTraining" class="btn-primary">再次训练</button>
          <button @click="backToSelection" class="btn-secondary">返回选择</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

// 响应式数据
const selectedDifficulty = ref(null)
const isTraining = ref(false)
const gamePhase = ref('ready') // ready, calculating, result
const countdown = ref(3)
const currentQuestionIndex = ref(0)
const currentQuestion = ref(null)
const userAnswer = ref('')
const questionTimeLeft = ref(0)
const correctAnswers = ref(0)
const answerTimes = ref([])
const showQuickFeedback = ref(false)
const lastAnswerCorrect = ref(false)
const timer = ref(null)
const questionTimer = ref(null)
const answerInput = ref(null)

// 设置
const settings = ref({
  questionCount: 20,
  timeLimit: 10
})

// 难度级别
const difficultyLevels = ref([
  {
    id: 'easy',
    name: '简单',
    description: '单位数加减法',
    stars: '★☆☆',
    timeLimit: 15,
    operations: ['+', '-'],
    numberRange: [1, 9]
  },
  {
    id: 'medium',
    name: '中等',
    description: '两位数四则运算',
    stars: '★★☆',
    timeLimit: 10,
    operations: ['+', '-', '×'],
    numberRange: [10, 99]
  },
  {
    id: 'hard',
    name: '困难',
    description: '三位数混合运算',
    stars: '★★★',
    timeLimit: 8,
    operations: ['+', '-', '×', '÷'],
    numberRange: [100, 999]
  },
  {
    id: 'expert',
    name: '专家',
    description: '复杂多步运算',
    stars: '★★★',
    timeLimit: 6,
    operations: ['+', '-', '×', '÷'],
    numberRange: [10, 999],
    multiStep: true
  }
])

// 计算属性
const progressPercentage = computed(() => {
  return settings.value.questionCount > 0 ? 
    (currentQuestionIndex.value / settings.value.questionCount) * 100 : 0
})

const timerOffset = computed(() => {
  const circumference = 2 * Math.PI * 45
  const progress = questionTimeLeft.value / settings.value.timeLimit
  return circumference * (1 - progress)
})

const averageTime = computed(() => {
  return answerTimes.value.length > 0 ? 
    answerTimes.value.reduce((a, b) => a + b, 0) / answerTimes.value.length : 0
})

const fastestTime = computed(() => {
  return answerTimes.value.length > 0 ? Math.min(...answerTimes.value) : 0
})

const totalTime = computed(() => {
  return answerTimes.value.reduce((a, b) => a + b, 0)
})

const performanceLevel = computed(() => {
  const accuracy = (correctAnswers.value / settings.value.questionCount) * 100
  const avgTime = averageTime.value
  
  if (accuracy >= 90 && avgTime <= 3) {
    return { name: '数学天才', class: 'genius', description: '计算速度和准确率都非常出色!' }
  } else if (accuracy >= 80 && avgTime <= 5) {
    return { name: '计算高手', class: 'expert', description: '计算能力很强，继续保持!' }
  } else if (accuracy >= 70 && avgTime <= 8) {
    return { name: '计算能手', class: 'good', description: '计算能力不错，还有提升空间。' }
  } else if (accuracy >= 60) {
    return { name: '努力练习', class: 'average', description: '需要多加练习提高计算速度。' }
  } else {
    return { name: '加油努力', class: 'beginner', description: '多练习基础计算，循序渐进。' }
  }
})

// 方法
const selectDifficulty = (level) => {
  selectedDifficulty.value = level
  settings.value.timeLimit = level.timeLimit
}

const startTraining = () => {
  isTraining.value = true
  gamePhase.value = 'ready'
  currentQuestionIndex.value = 0
  correctAnswers.value = 0
  answerTimes.value = []
  
  startCountdown()
}

const startCountdown = () => {
  countdown.value = 3
  timer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer.value)
      gamePhase.value = 'calculating'
      nextQuestion()
    }
  }, 1000)
}

const nextQuestion = () => {
  if (currentQuestionIndex.value >= settings.value.questionCount) {
    gamePhase.value = 'result'
    return
  }
  
  currentQuestion.value = generateQuestion()
  userAnswer.value = ''
  questionTimeLeft.value = settings.value.timeLimit
  showQuickFeedback.value = false
  
  nextTick(() => {
    if (answerInput.value) {
      answerInput.value.focus()
    }
  })
  
  startQuestionTimer()
}

const generateQuestion = () => {
  const difficulty = selectedDifficulty.value
  const operations = difficulty.operations
  const [min, max] = difficulty.numberRange
  
  if (difficulty.multiStep) {
    // 多步运算
    const num1 = Math.floor(Math.random() * (max - min + 1)) + min
    const num2 = Math.floor(Math.random() * (max - min + 1)) + min
    const num3 = Math.floor(Math.random() * (max - min + 1)) + min
    const op1 = operations[Math.floor(Math.random() * operations.length)]
    const op2 = operations[Math.floor(Math.random() * operations.length)]
    
    let expression, answer
    
    if (op1 === '×' || op1 === '÷') {
      expression = `${num1} ${op1} ${num2} ${op2} ${num3}`
      const intermediate = op1 === '×' ? num1 * num2 : Math.floor(num1 / num2)
      answer = op2 === '+' ? intermediate + num3 :
               op2 === '-' ? intermediate - num3 :
               op2 === '×' ? intermediate * num3 :
               Math.floor(intermediate / num3)
    } else {
      expression = `${num1} ${op1} ${num2} ${op2} ${num3}`
      const intermediate = op1 === '+' ? num1 + num2 : num1 - num2
      answer = op2 === '+' ? intermediate + num3 :
               op2 === '-' ? intermediate - num3 :
               op2 === '×' ? intermediate * num3 :
               Math.floor(intermediate / num3)
    }
    
    return { expression, answer }
  } else {
    // 单步运算
    let num1 = Math.floor(Math.random() * (max - min + 1)) + min
    let num2 = Math.floor(Math.random() * (max - min + 1)) + min
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    // 确保除法结果为整数
    if (operation === '÷') {
      num2 = Math.floor(Math.random() * 9) + 1
      num1 = num2 * (Math.floor(Math.random() * 20) + 1)
    }
    
    const expression = `${num1} ${operation} ${num2}`
    let answer
    
    switch (operation) {
      case '+':
        answer = num1 + num2
        break
      case '-':
        answer = num1 - num2
        break
      case '×':
        answer = num1 * num2
        break
      case '÷':
        answer = Math.floor(num1 / num2)
        break
    }
    
    return { expression, answer }
  }
}

const startQuestionTimer = () => {
  const startTime = Date.now()
  
  questionTimer.value = setInterval(() => {
    questionTimeLeft.value--
    if (questionTimeLeft.value <= 0) {
      clearInterval(questionTimer.value)
      // 时间到，自动提交空答案
      submitAnswer(true)
    }
  }, 1000)
}

const submitAnswer = (timeUp = false) => {
  if (questionTimer.value) {
    clearInterval(questionTimer.value)
  }
  
  const answerTime = settings.value.timeLimit - questionTimeLeft.value
  answerTimes.value.push(answerTime)
  
  const isCorrect = !timeUp && parseInt(userAnswer.value) === currentQuestion.value.answer
  if (isCorrect) {
    correctAnswers.value++
  }
  
  lastAnswerCorrect.value = isCorrect
  showQuickFeedback.value = true
  
  setTimeout(() => {
    currentQuestionIndex.value++
    nextQuestion()
  }, 1000)
}

const validateInput = () => {
  // 只允许数字和负号
  userAnswer.value = userAnswer.value.replace(/[^-0-9]/g, '')
}

const restartTraining = () => {
  startTraining()
}

const backToSelection = () => {
  isTraining.value = false
  selectedDifficulty.value = null
}

// 生命周期
onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  if (questionTimer.value) {
    clearInterval(questionTimer.value)
  }
})
</script>

<style scoped>
.instant-calculation-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.difficulty-selection {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.difficulty-selection h3 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

.difficulty-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.difficulty-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  text-align: center;
}

.difficulty-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.difficulty-card.active {
  border-color: #3498db;
  background-color: #e3f2fd;
}

.difficulty-card h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.difficulty-card p {
  color: #666;
  margin-bottom: 15px;
}

.level-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.difficulty-stars {
  color: #f39c12;
  font-weight: bold;
}

.time-limit {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.training-settings {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.settings-row {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-item label {
  font-weight: bold;
  color: #2c3e50;
}

.setting-item input, .setting-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.training-area {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.ready-phase {
  padding: 50px 0;
}

.countdown-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30px auto;
  box-shadow: 0 4px 20px rgba(52, 152, 219, 0.3);
}

.countdown-number {
  font-size: 48px;
  font-weight: bold;
}

.calculation-phase {
  padding: 20px 0;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background-color: #ecf0f1;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 30px;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2980b9);
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.question-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 40px 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.expression {
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
  flex: 1;
}

.timer-circle {
  position: relative;
  width: 80px;
  height: 80px;
}

.timer-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer-bg {
  fill: none;
  stroke: #ecf0f1;
  stroke-width: 8;
}

.timer-progress {
  fill: none;
  stroke: #e74c3c;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283;
  transition: stroke-dashoffset 1s linear;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
}

.answer-input {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 30px 0;
}

.answer-input input {
  padding: 15px 20px;
  font-size: 24px;
  border: 2px solid #ddd;
  border-radius: 8px;
  width: 200px;
  text-align: center;
}

.answer-input input:focus {
  outline: none;
  border-color: #3498db;
}

.btn-submit {
  padding: 15px 30px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background-color: #229954;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-feedback {
  margin: 20px 0;
  font-size: 20px;
  font-weight: bold;
}

.quick-feedback .correct {
  color: #27ae60;
}

.quick-feedback .incorrect {
  color: #e74c3c;
}

.result-phase {
  padding: 30px 0;
}

.score-summary {
  margin: 30px 0;
}

.score-circle {
  display: inline-block;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(52, 152, 219, 0.3);
}

.score-number {
  font-size: 42px;
  font-weight: bold;
}

.score-total {
  font-size: 20px;
}

.accuracy {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.performance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.stat-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  display: block;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.performance-level {
  margin: 30px 0;
}

.level-badge {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: bold;
  margin: 10px 0;
}

.level-badge.genius {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.level-badge.expert {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.level-badge.good {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.level-badge.average {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

.level-badge.beginner {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}
</style>