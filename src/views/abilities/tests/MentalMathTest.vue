<template>
  <div class="mental-math-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase">
      <div class="instruction-content">
        <h3>心算测试</h3>
        <p class="instruction-description">
          这是一个测试您心算能力的测试。您需要在限定时间内快速准确地进行心算，无需使用计算器或纸笔。
        </p>
        
        <div class="instruction-steps">
          <div class="step-item">
            <div class="step-icon">🧠</div>
            <div class="step-content">
              <h4>心算运算</h4>
              <p>仅使用大脑进行数学运算，不借助任何工具</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-icon">⚡</div>
            <div class="step-content">
              <h4>快速反应</h4>
              <p>在规定时间内尽快给出正确答案</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-icon">🎯</div>
            <div class="step-content">
              <h4>准确计算</h4>
              <p>确保计算结果的准确性，避免粗心错误</p>
            </div>
          </div>
        </div>
        
        <div class="test-settings">
          <div class="setting-group">
            <label>难度等级：</label>
            <select v-model="selectedDifficulty">
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label>测试时长：</label>
            <select v-model="selectedDuration">
              <option value="60">1分钟</option>
              <option value="120">2分钟</option>
              <option value="180">3分钟</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label>运算类型：</label>
            <select v-model="selectedOperationType">
              <option value="mixed">混合运算</option>
              <option value="addition">加法</option>
              <option value="subtraction">减法</option>
              <option value="multiplication">乘法</option>
              <option value="division">除法</option>
            </select>
          </div>
        </div>
        
        <button @click="startTest" class="btn-start">开始测试</button>
      </div>
    </div>
    
    <!-- 测试进行阶段 -->
    <div v-if="currentPhase === 'testing'" class="testing-phase">
      <div class="test-header">
        <div class="test-info">
          <h3>心算测试</h3>
          <div class="test-stats">
            <span class="timer" :class="{ 'warning': remainingTime <= 30, 'danger': remainingTime <= 10 }">
              ⏱️ {{ formatTime(remainingTime) }}
            </span>
            <span class="score">得分: {{ currentScore }}</span>
            <span class="completed">完成: {{ completedQuestions }}</span>
            <span class="accuracy">准确率: {{ currentAccuracy }}%</span>
          </div>
        </div>
        
        <div class="progress-info">
          <div class="time-progress">
            <div class="time-bar">
              <div 
                class="time-fill" 
                :style="{ width: timeProgressPercentage + '%' }"
                :class="{ 'warning': remainingTime <= 30, 'danger': remainingTime <= 10 }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="test-container" v-if="currentQuestion">
        <div class="question-display">
          <div class="expression">
            {{ currentQuestion.expression }}
          </div>
          
          <div class="equals-sign">=</div>
          
          <div class="answer-input">
            <input 
              ref="answerInput"
              v-model="userAnswer"
              @keyup.enter="submitAnswer"
              @input="validateInput"
              type="text"
              placeholder="?"
              :disabled="showFeedback"
              autocomplete="off"
            />
          </div>
        </div>
        
        <div v-if="showFeedback" class="feedback-section">
          <div :class="['feedback-message', isCorrect ? 'correct' : 'incorrect']">
            <div class="feedback-icon">
              {{ isCorrect ? '✅' : '❌' }}
            </div>
            <div class="feedback-text">
              <div class="feedback-title">
                {{ isCorrect ? '正确！' : '错误' }}
              </div>
              <div class="feedback-details">
                正确答案: {{ currentQuestion.answer }}
                <span v-if="!isCorrect">（您的答案: {{ userAnswer }}）</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="question-controls">
          <button 
            v-if="!showFeedback" 
            @click="submitAnswer" 
            :disabled="!userAnswer.trim()"
            class="btn-submit"
          >
            提交 (Enter)
          </button>
          
          <button 
            v-if="!showFeedback" 
            @click="skipQuestion" 
            class="btn-skip"
          >
            跳过
          </button>
          
          <button 
            v-if="showFeedback" 
            @click="nextQuestion" 
            class="btn-next"
          >
            继续
          </button>
        </div>
        
        <div class="recent-performance" v-if="recentResults.length > 0">
          <h5>最近表现</h5>
          <div class="performance-indicators">
            <div 
              v-for="(result, index) in recentResults.slice(-10)" 
              :key="index"
              :class="['performance-dot', result.isCorrect ? 'correct' : 'incorrect']"
              :title="`${result.expression} = ${result.answer} (${result.isCorrect ? '正确' : '错误'})`"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 结果展示阶段 -->
    <div v-if="currentPhase === 'results'" class="results-phase">
      <div class="results-header">
        <h3>测试完成</h3>
        <p>您的心算能力测试结果如下：</p>
      </div>
      
      <div class="overall-results">
        <div class="result-card">
          <div class="result-icon">🎯</div>
          <div class="result-value">{{ overallAccuracy }}%</div>
          <div class="result-label">总体准确率</div>
        </div>
        
        <div class="result-card">
          <div class="result-icon">⚡</div>
          <div class="result-value">{{ averageTime }}s</div>
          <div class="result-label">平均用时</div>
        </div>
        
        <div class="result-card">
          <div class="result-icon">📊</div>
          <div class="result-value">{{ completedQuestions }}</div>
          <div class="result-label">完成题数</div>
        </div>
        
        <div class="result-card">
          <div class="result-icon">⭐</div>
          <div class="result-value">{{ totalScore }}</div>
          <div class="result-label">总得分</div>
        </div>
        
        <div class="result-card">
          <div class="result-icon">🧠</div>
          <div class="result-value">{{ mentalMathScore }}</div>
          <div class="result-label">心算能力得分</div>
        </div>
      </div>
      
      <div class="detailed-analysis">
        <h4>详细分析</h4>
        
        <div class="analysis-grid">
          <div class="analysis-item">
            <h5>运算类型表现</h5>
            <div class="operation-chart">
              <div 
                v-for="operation in operationTypes" 
                :key="operation.key"
                class="operation-bar"
              >
                <span class="operation-label">{{ operation.label }}</span>
                <div class="bar-container">
                  <div 
                    class="bar-fill" 
                    :style="{ width: getOperationAccuracy(operation.key) + '%' }"
                  ></div>
                </div>
                <span class="accuracy-value">{{ getOperationAccuracy(operation.key) }}%</span>
              </div>
            </div>
          </div>
          
          <div class="analysis-item">
            <h5>难度表现</h5>
            <div class="difficulty-chart">
              <div 
                v-for="difficulty in difficulties" 
                :key="difficulty.key"
                class="difficulty-bar"
              >
                <span class="difficulty-label">{{ difficulty.label }}</span>
                <div class="bar-container">
                  <div 
                    class="bar-fill" 
                    :style="{ width: getDifficultyAccuracy(difficulty.key) + '%' }"
                  ></div>
                </div>
                <span class="accuracy-value">{{ getDifficultyAccuracy(difficulty.key) }}%</span>
              </div>
            </div>
          </div>
          
          <div class="analysis-item">
            <h5>心算统计</h5>
            <div class="mental-stats">
              <div class="stat-row">
                <span class="stat-label">最快答题时间</span>
                <span class="stat-value">{{ fastestTime }}s</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">最慢答题时间</span>
                <span class="stat-value">{{ slowestTime }}s</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">连续正确数</span>
                <span class="stat-value">{{ maxConsecutiveCorrect }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">跳过题目数</span>
                <span class="stat-value">{{ skippedQuestions }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">答题效率</span>
                <span class="stat-value">{{ answerEfficiency }}题/分钟</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="performance-trend" v-if="results.length > 5">
        <h4>表现趋势</h4>
        <div class="trend-chart">
          <div class="trend-line">
            <div 
              v-for="(result, index) in results.slice(-20)" 
              :key="index"
              class="trend-point"
              :style="{ 
                left: (index / Math.max(results.slice(-20).length - 1, 1)) * 100 + '%',
                bottom: (result.isCorrect ? 100 : 0) + '%'
              }"
              :class="{ 'correct': result.isCorrect, 'incorrect': !result.isCorrect }"
              :title="`第${index + 1}题: ${result.isCorrect ? '正确' : '错误'}`"
            ></div>
          </div>
        </div>
        <div class="trend-labels">
          <span>开始</span>
          <span>结束</span>
        </div>
      </div>
      
      <div class="performance-feedback">
        <h4>表现评价与改进建议</h4>
        
        <div 
          v-for="feedback in performanceFeedback" 
          :key="feedback.type"
          :class="['feedback-item', feedback.level]"
        >
          <div class="feedback-icon">{{ feedback.icon }}</div>
          <div class="feedback-text">
            <div class="feedback-title">{{ feedback.title }}</div>
            <div class="feedback-description">{{ feedback.description }}</div>
          </div>
        </div>
        
        <div class="improvement-suggestions">
          <h5>改进建议</h5>
          <ul>
            <li v-for="suggestion in improvementSuggestions" :key="suggestion">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
      
      <div class="results-actions">
        <button @click="exportReport" class="btn-export">导出报告</button>
        <button @click="retakeTest" class="btn-retake">重新测试</button>
        <button @click="goToTraining" class="btn-training">前往训练</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// 响应式数据
const currentPhase = ref('instruction') // instruction, testing, results
const selectedDifficulty = ref('medium')
const selectedDuration = ref(120) // 秒
const selectedOperationType = ref('mixed')
const currentQuestion = ref(null)
const userAnswer = ref('')
const showFeedback = ref(false)
const isCorrect = ref(false)
const startTime = ref(null)
const remainingTime = ref(0)
const currentScore = ref(0)
const questionStartTime = ref(null)
const results = ref([])
const recentResults = ref([])
const timer = ref(null)
const answerInput = ref(null)
const testEnded = ref(false)

// 运算类型定义
const operationTypes = [
  { key: 'addition', label: '加法', symbol: '+' },
  { key: 'subtraction', label: '减法', symbol: '-' },
  { key: 'multiplication', label: '乘法', symbol: '×' },
  { key: 'division', label: '除法', symbol: '÷' }
]

// 难度定义
const difficulties = [
  { key: 'easy', label: '简单' },
  { key: 'medium', label: '中等' },
  { key: 'hard', label: '困难' }
]

// 计算属性
const timeProgressPercentage = computed(() => {
  const totalTime = parseInt(selectedDuration.value)
  const elapsed = totalTime - remainingTime.value
  return (elapsed / totalTime) * 100
})

const completedQuestions = computed(() => {
  return results.value.length
})

const currentAccuracy = computed(() => {
  if (results.value.length === 0) return 100
  const correct = results.value.filter(r => r.isCorrect).length
  return Math.round((correct / results.value.length) * 100)
})

const overallAccuracy = computed(() => {
  if (results.value.length === 0) return 0
  const correct = results.value.filter(r => r.isCorrect).length
  return Math.round((correct / results.value.length) * 100)
})

const averageTime = computed(() => {
  if (results.value.length === 0) return 0
  const totalTime = results.value.reduce((sum, r) => sum + r.timeSpent, 0)
  return Math.round((totalTime / results.value.length) * 10) / 10
})

const totalScore = computed(() => {
  return results.value.reduce((sum, r) => sum + r.score, 0)
})

const mentalMathScore = computed(() => {
  const accuracy = overallAccuracy.value
  const efficiency = answerEfficiency.value
  const speedBonus = Math.max(0, 100 - averageTime.value * 5)
  return Math.round(accuracy * 0.5 + efficiency * 0.3 + speedBonus * 0.2)
})

const fastestTime = computed(() => {
  if (results.value.length === 0) return 0
  return Math.min(...results.value.map(r => r.timeSpent))
})

const slowestTime = computed(() => {
  if (results.value.length === 0) return 0
  return Math.max(...results.value.map(r => r.timeSpent))
})

const maxConsecutiveCorrect = computed(() => {
  let max = 0
  let current = 0
  
  for (const result of results.value) {
    if (result.isCorrect) {
      current++
      max = Math.max(max, current)
    } else {
      current = 0
    }
  }
  
  return max
})

const skippedQuestions = computed(() => {
  return results.value.filter(r => r.skipped).length
})

const answerEfficiency = computed(() => {
  if (results.value.length === 0) return 0
  const totalTime = parseInt(selectedDuration.value)
  const elapsedTime = totalTime - remainingTime.value
  return Math.round((results.value.length / (elapsedTime / 60)) * 10) / 10
})

const performanceFeedback = computed(() => {
  const feedback = []
  const accuracy = overallAccuracy.value
  const efficiency = answerEfficiency.value
  
  // 准确率反馈
  if (accuracy >= 95) {
    feedback.push({
      type: 'accuracy',
      level: 'excellent',
      icon: '🎯',
      title: '准确率优秀',
      description: '您的心算准确率非常高，计算能力出色。'
    })
  } else if (accuracy >= 80) {
    feedback.push({
      type: 'accuracy',
      level: 'good',
      icon: '👍',
      title: '准确率良好',
      description: '您的心算准确率良好，继续保持。'
    })
  } else if (accuracy >= 60) {
    feedback.push({
      type: 'accuracy',
      level: 'average',
      icon: '📈',
      title: '准确率一般',
      description: '您的心算准确率有提升空间，建议多练习基础运算。'
    })
  } else {
    feedback.push({
      type: 'accuracy',
      level: 'poor',
      icon: '📚',
      title: '需要加强练习',
      description: '建议从简单的加减法开始练习，逐步提升计算能力。'
    })
  }
  
  // 效率反馈
  if (efficiency >= 30) {
    feedback.push({
      type: 'efficiency',
      level: 'excellent',
      icon: '⚡',
      title: '计算效率优秀',
      description: '您的心算速度非常快，思维敏捷。'
    })
  } else if (efficiency >= 20) {
    feedback.push({
      type: 'efficiency',
      level: 'good',
      icon: '⏱️',
      title: '计算效率良好',
      description: '您的心算速度良好，可以尝试更复杂的运算。'
    })
  } else if (efficiency >= 10) {
    feedback.push({
      type: 'efficiency',
      level: 'average',
      icon: '🐌',
      title: '可以提升速度',
      description: '建议多练习提升计算速度。'
    })
  } else {
    feedback.push({
      type: 'efficiency',
      level: 'poor',
      icon: '⏳',
      title: '需要提升速度',
      description: '建议从简单运算开始，逐步提升计算速度。'
    })
  }
  
  return feedback
})

const improvementSuggestions = computed(() => {
  const suggestions = []
  const accuracy = overallAccuracy.value
  const efficiency = answerEfficiency.value
  
  if (accuracy < 80) {
    suggestions.push('加强基础运算练习，提升计算准确性')
    suggestions.push('学习心算技巧和速算方法')
  }
  
  if (efficiency < 20) {
    suggestions.push('练习快速心算，提升计算速度')
    suggestions.push('熟练掌握乘法口诀和基础运算规律')
  }
  
  const operationAccuracies = operationTypes.map(op => ({
    type: op.key,
    accuracy: getOperationAccuracy(op.key)
  }))
  
  const weakestOperation = operationAccuracies.reduce((min, current) => 
    current.accuracy < min.accuracy ? current : min
  )
  
  if (weakestOperation.accuracy < 70) {
    const operationLabel = operationTypes.find(op => op.key === weakestOperation.type)?.label
    suggestions.push(`重点练习${operationLabel}运算`)
  }
  
  suggestions.push('定期进行心算练习，保持计算能力')
  suggestions.push('尝试不同难度的题目，逐步提升挑战')
  
  return suggestions
})

// 方法
const generateQuestion = () => {
  const difficulty = selectedDifficulty.value
  const operationType = selectedOperationType.value
  
  let operation
  if (operationType === 'mixed') {
    operation = operationTypes[Math.floor(Math.random() * operationTypes.length)].key
  } else {
    operation = operationType
  }
  
  return generateOperationQuestion(operation, difficulty)
}

const generateOperationQuestion = (operation, difficulty) => {
  const difficultySettings = {
    easy: { min: 1, max: 20 },
    medium: { min: 10, max: 100 },
    hard: { min: 50, max: 500 }
  }
  
  const settings = difficultySettings[difficulty]
  let num1, num2, answer, expression
  
  switch (operation) {
    case 'addition':
      num1 = Math.floor(Math.random() * (settings.max - settings.min)) + settings.min
      num2 = Math.floor(Math.random() * (settings.max - settings.min)) + settings.min
      answer = num1 + num2
      expression = `${num1} + ${num2}`
      break
      
    case 'subtraction':
      num1 = Math.floor(Math.random() * (settings.max - settings.min)) + settings.min
      num2 = Math.floor(Math.random() * num1) + 1
      answer = num1 - num2
      expression = `${num1} - ${num2}`
      break
      
    case 'multiplication':
      const maxMult = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 25 : 50
      num1 = Math.floor(Math.random() * maxMult) + 1
      num2 = Math.floor(Math.random() * maxMult) + 1
      answer = num1 * num2
      expression = `${num1} × ${num2}`
      break
      
    case 'division':
      const maxDiv = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 20 : 30
      num2 = Math.floor(Math.random() * maxDiv) + 1
      answer = Math.floor(Math.random() * maxDiv) + 1
      num1 = num2 * answer
      expression = `${num1} ÷ ${num2}`
      break
      
    default:
      num1 = Math.floor(Math.random() * 20) + 1
      num2 = Math.floor(Math.random() * 20) + 1
      answer = num1 + num2
      expression = `${num1} + ${num2}`
  }
  
  return {
    operation,
    difficulty,
    expression,
    answer,
    num1,
    num2
  }
}

const startTest = () => {
  currentPhase.value = 'testing'
  currentScore.value = 0
  results.value = []
  recentResults.value = []
  remainingTime.value = parseInt(selectedDuration.value)
  testEnded.value = false
  
  generateNewQuestion()
  startTimer()
}

const startTimer = () => {
  timer.value = setInterval(() => {
    remainingTime.value--
    
    if (remainingTime.value <= 0) {
      completeTest()
    }
  }, 1000)
}

const generateNewQuestion = () => {
  currentQuestion.value = generateQuestion()
  userAnswer.value = ''
  showFeedback.value = false
  questionStartTime.value = Date.now()
  
  nextTick(() => {
    if (answerInput.value) {
      answerInput.value.focus()
    }
  })
}

const validateInput = () => {
  // 只允许数字和负号
  userAnswer.value = userAnswer.value.replace(/[^-0-9]/g, '')
}

const submitAnswer = () => {
  if (!userAnswer.value.trim() || testEnded.value) return
  
  const timeSpent = (Date.now() - questionStartTime.value) / 1000
  const userAnswerNum = parseInt(userAnswer.value)
  isCorrect.value = userAnswerNum === currentQuestion.value.answer
  
  // 计算得分
  let score = 0
  if (isCorrect.value) {
    const baseScore = 10
    const timeBonus = Math.max(0, 10 - Math.floor(timeSpent))
    const difficultyBonus = {
      easy: 0,
      medium: 5,
      hard: 10
    }[currentQuestion.value.difficulty]
    
    score = baseScore + timeBonus + difficultyBonus
    currentScore.value += score
  }
  
  // 记录结果
  const result = {
    question: currentQuestion.value,
    userAnswer: userAnswerNum,
    isCorrect: isCorrect.value,
    timeSpent: Math.round(timeSpent * 10) / 10,
    score,
    skipped: false
  }
  
  results.value.push(result)
  recentResults.value.push(result)
  
  showFeedback.value = true
  
  // 短暂显示反馈后继续下一题
  setTimeout(() => {
    if (!testEnded.value) {
      nextQuestion()
    }
  }, 1000)
}

const skipQuestion = () => {
  if (testEnded.value) return
  
  const timeSpent = (Date.now() - questionStartTime.value) / 1000
  
  const result = {
    question: currentQuestion.value,
    userAnswer: null,
    isCorrect: false,
    timeSpent: Math.round(timeSpent * 10) / 10,
    score: 0,
    skipped: true
  }
  
  results.value.push(result)
  recentResults.value.push(result)
  
  nextQuestion()
}

const nextQuestion = () => {
  if (!testEnded.value) {
    generateNewQuestion()
  }
}

const completeTest = () => {
  testEnded.value = true
  clearInterval(timer.value)
  currentPhase.value = 'results'
}

const getOperationAccuracy = (operation) => {
  const operationResults = results.value.filter(r => r.question.operation === operation)
  if (operationResults.length === 0) return 0
  const correct = operationResults.filter(r => r.isCorrect).length
  return Math.round((correct / operationResults.length) * 100)
}

const getDifficultyAccuracy = (difficulty) => {
  const difficultyResults = results.value.filter(r => r.question.difficulty === difficulty)
  if (difficultyResults.length === 0) return 0
  const correct = difficultyResults.filter(r => r.isCorrect).length
  return Math.round((correct / difficultyResults.length) * 100)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const exportReport = () => {
  // 导出测试报告逻辑
  console.log('导出心算测试报告')
}

const retakeTest = () => {
  currentPhase.value = 'instruction'
  currentScore.value = 0
  results.value = []
  recentResults.value = []
  remainingTime.value = 0
  testEnded.value = false
}

const goToTraining = () => {
  // 跳转到训练页面逻辑
  console.log('跳转到心算训练')
}

// 生命周期
onMounted(() => {
  // 组件挂载时的初始化
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.mental-math-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* 测试说明阶段样式 */
.instruction-phase {
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.instruction-content h3 {
  font-size: 2.5em;
  color: #495057;
  margin-bottom: 20px;
}

.instruction-description {
  font-size: 1.2em;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.instruction-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.step-item {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
}

.step-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.step-content h4 {
  font-size: 1.3em;
  color: #495057;
  margin-bottom: 10px;
}

.step-content p {
  color: #6c757d;
  line-height: 1.5;
}

.test-settings {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.setting-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-group label {
  font-weight: 600;
  color: #495057;
}

.setting-group select {
  padding: 8px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1em;
  background: white;
}

.btn-start {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2em;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

/* 测试进行阶段样式 */
.testing-phase {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.test-header {
  margin-bottom: 40px;
}

.test-info h3 {
  font-size: 1.8em;
  color: #495057;
  margin-bottom: 15px;
  text-align: center;
}

.test-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.test-stats span {
  background: #f8f9fa;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9em;
  color: #495057;
  font-weight: 600;
}

.timer.warning {
  background: #fff3cd;
  color: #856404;
}

.timer.danger {
  background: #f8d7da;
  color: #721c24;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.progress-info {
  max-width: 600px;
  margin: 0 auto;
}

.time-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.time-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.time-fill.warning {
  background: linear-gradient(90deg, #ffc107, #e0a800);
}

.time-fill.danger {
  background: linear-gradient(90deg, #dc3545, #c82333);
}

.test-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.question-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.expression {
  font-size: 3em;
  font-weight: 600;
  color: #495057;
  background: #f8f9fa;
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.equals-sign {
  font-size: 3em;
  font-weight: 600;
  color: #007bff;
}

.answer-input {
  position: relative;
}

.answer-input input {
  font-size: 3em;
  font-weight: 600;
  text-align: center;
  width: 200px;
  padding: 20px;
  border: 3px solid #007bff;
  border-radius: 15px;
  background: white;
  color: #495057;
  outline: none;
  transition: all 0.3s ease;
}

.answer-input input:focus {
  border-color: #0056b3;
  box-shadow: 0 0 20px rgba(0, 123, 255, 0.3);
}

.answer-input input:disabled {
  background: #f8f9fa;
  border-color: #e9ecef;
}

.feedback-section {
  margin-bottom: 30px;
}

.feedback-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  border-radius: 10px;
  margin: 0 auto;
  max-width: 500px;
}

.feedback-message.correct {
  background: #d4edda;
  border: 2px solid #28a745;
  color: #155724;
}

.feedback-message.incorrect {
  background: #f8d7da;
  border: 2px solid #dc3545;
  color: #721c24;
}

.feedback-icon {
  font-size: 2em;
}

.feedback-text {
  text-align: left;
}

.feedback-title {
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 5px;
}

.feedback-details {
  font-size: 1em;
}

.question-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.btn-submit,
.btn-skip,
.btn-next {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit {
  background: #007bff;
  color: white;
}

.btn-submit:hover {
  background: #0056b3;
}

.btn-submit:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-skip {
  background: #6c757d;
  color: white;
}

.btn-skip:hover {
  background: #545b62;
}

.btn-next {
  background: #28a745;
  color: white;
}

.btn-next:hover {
  background: #1e7e34;
}

.recent-performance {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-top: 30px;
}

.recent-performance h5 {
  font-size: 1.1em;
  color: #495057;
  margin-bottom: 15px;
  text-align: center;
}

.performance-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.performance-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.performance-dot:hover {
  transform: scale(1.3);
}

.performance-dot.correct {
  background: #28a745;
}

.performance-dot.incorrect {
  background: #dc3545;
}

/* 结果展示阶段样式 */
.results-phase {
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.results-header {
  text-align: center;
  margin-bottom: 40px;
}

.results-header h3 {
  font-size: 2.5em;
  color: #495057;
  margin-bottom: 15px;
}

.results-header p {
  font-size: 1.2em;
  color: #6c757d;
}

.overall-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

.mental-stats {
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

.performance-trend {
  margin-bottom: 40px;
}

.performance-trend h4 {
  font-size: 1.5em;
  color: #495057;
  margin-bottom: 25px;
}

.trend-chart {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  height: 100px;
  margin-bottom: 10px;
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
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.trend-point:hover {
  transform: scale(1.5);
}

.trend-point.correct {
  background: #28a745;
}

.trend-point.incorrect {
  background: #dc3545;
}

.trend-labels {
  display: flex;
  justify-content: space-between;
  color: #6c757d;
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

.results-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  flex-wrap: wrap;
}

.btn-export,
.btn-retake,
.btn-training {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
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
}

.btn-retake {
  background: #ffc107;
  color: #212529;
}

.btn-retake:hover {
  background: #e0a800;
}

.btn-training {
  background: #28a745;
  color: white;
}

.btn-training:hover {
  background: #1e7e34;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mental-math-test {
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
  
  .test-settings {
    flex-direction: column;
    align-items: center;
  }
  
  .testing-phase {
    padding: 15px;
  }
  
  .question-display {
    flex-direction: column;
    gap: 20px;
  }
  
  .expression {
    font-size: 2em;
    padding: 15px 20px;
  }
  
  .equals-sign {
    font-size: 2em;
  }
  
  .answer-input input {
    font-size: 2em;
    width: 150px;
    padding: 15px;
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
  
  .results-actions {
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

.result-card {
  animation: fadeIn 0.6s ease-out;
}

.question-display {
  animation: scaleIn 0.5s ease-out;
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