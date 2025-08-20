<template>
  <div class="number-sequence-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase">
      <div class="instruction-content">
        <h3>数字序列测试</h3>
        <p class="instruction-description">
          这是一个测试您数字序列识别和推理能力的测试。您需要观察数字序列的规律，并选择正确的下一个数字。
        </p>
        
        <div class="instruction-steps">
          <div class="step-item">
            <div class="step-icon">📊</div>
            <div class="step-content">
              <h4>观察序列</h4>
              <p>仔细观察给出的数字序列，寻找其中的规律</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-icon">🧮</div>
            <div class="step-content">
              <h4>分析规律</h4>
              <p>分析数字之间的关系，可能是加减乘除、平方、斐波那契等</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-icon">✅</div>
            <div class="step-content">
              <h4>选择答案</h4>
              <p>根据发现的规律，选择正确的下一个数字</p>
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
            <label>题目数量：</label>
            <select v-model="selectedQuestionCount">
              <option value="10">10题</option>
              <option value="15">15题</option>
              <option value="20">20题</option>
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
          <h3>数字序列测试</h3>
          <div class="test-stats">
            <span class="timer">⏱️ {{ formatTime(elapsedTime) }}</span>
            <span class="score">得分: {{ currentScore }}</span>
            <span class="progress">进度: {{ currentQuestionIndex + 1 }}/{{ questions.length }}</span>
          </div>
        </div>
        
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
      
      <div class="test-container" v-if="currentQuestion">
        <div class="question-content">
          <h4>找出下一个数字</h4>
          
          <div class="sequence-display">
            <div 
              v-for="(number, index) in currentQuestion.sequence" 
              :key="index"
              class="sequence-number"
            >
              {{ number }}
            </div>
            <div class="sequence-question-mark">?</div>
          </div>
          
          <div class="sequence-info">
            <p class="sequence-hint">{{ currentQuestion.hint }}</p>
            <p class="sequence-type">类型: {{ getSequenceTypeLabel(currentQuestion.type) }}</p>
          </div>
        </div>
        
        <div class="answer-section">
          <div class="answer-choices">
            <button 
              v-for="(choice, index) in currentQuestion.choices" 
              :key="index"
              @click="selectAnswer(choice)"
              :class="[
                'choice-button',
                { 
                  'selected': selectedAnswer === choice,
                  'correct': showFeedback && choice === currentQuestion.answer,
                  'incorrect': showFeedback && selectedAnswer === choice && choice !== currentQuestion.answer
                }
              ]"
              :disabled="showFeedback"
            >
              {{ choice }}
            </button>
          </div>
          
          <div v-if="showFeedback" class="feedback-section">
            <div :class="['feedback-message', isCorrect ? 'correct' : 'incorrect']">
              <div class="feedback-icon">
                {{ isCorrect ? '✅' : '❌' }}
              </div>
              <div class="feedback-text">
                <div class="feedback-title">
                  {{ isCorrect ? '回答正确！' : '回答错误' }}
                </div>
                <div class="feedback-explanation">
                  {{ currentQuestion.explanation }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="question-controls">
            <button 
              v-if="!showFeedback" 
              @click="submitAnswer" 
              :disabled="!selectedAnswer"
              class="btn-submit"
            >
              提交答案
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
              {{ currentQuestionIndex < questions.length - 1 ? '下一题' : '完成测试' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 结果展示阶段 -->
    <div v-if="currentPhase === 'results'" class="results-phase">
      <div class="results-header">
        <h3>测试完成</h3>
        <p>您的数字序列识别能力测试结果如下：</p>
      </div>
      
      <div class="overall-results">
        <div class="result-card">
          <div class="result-icon">🎯</div>
          <div class="result-value">{{ overallAccuracy }}%</div>
          <div class="result-label">总体准确率</div>
        </div>
        
        <div class="result-card">
          <div class="result-icon">⏱️</div>
          <div class="result-value">{{ averageTime }}s</div>
          <div class="result-label">平均用时</div>
        </div>
        
        <div class="result-card">
          <div class="result-icon">⭐</div>
          <div class="result-value">{{ totalScore }}</div>
          <div class="result-label">总得分</div>
        </div>
        
        <div class="result-card">
          <div class="result-icon">🧮</div>
          <div class="result-value">{{ sequenceAbilityScore }}</div>
          <div class="result-label">序列能力得分</div>
        </div>
      </div>
      
      <div class="detailed-analysis">
        <h4>详细分析</h4>
        
        <div class="analysis-grid">
          <div class="analysis-item">
            <h5>序列类型表现</h5>
            <div class="type-chart">
              <div 
                v-for="type in sequenceTypes" 
                :key="type.key"
                class="type-bar"
              >
                <span class="type-label">{{ type.label }}</span>
                <div class="bar-container">
                  <div 
                    class="bar-fill" 
                    :style="{ width: getTypeAccuracy(type.key) + '%' }"
                  ></div>
                </div>
                <span class="accuracy-value">{{ getTypeAccuracy(type.key) }}%</span>
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
            <h5>序列识别统计</h5>
            <div class="sequence-stats">
              <div class="stat-row">
                <span class="stat-label">最快识别时间</span>
                <span class="stat-value">{{ fastestTime }}s</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">最慢识别时间</span>
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
            </div>
          </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 响应式数据
const currentPhase = ref('instruction') // instruction, testing, results
const selectedDifficulty = ref('medium')
const selectedQuestionCount = ref(15)
const questions = ref([])
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const showFeedback = ref(false)
const isCorrect = ref(false)
const startTime = ref(null)
const elapsedTime = ref(0)
const currentScore = ref(0)
const questionStartTime = ref(null)
const results = ref([])
const timer = ref(null)

// 序列类型定义
const sequenceTypes = [
  { key: 'arithmetic', label: '等差数列' },
  { key: 'geometric', label: '等比数列' },
  { key: 'fibonacci', label: '斐波那契' },
  { key: 'square', label: '平方数列' },
  { key: 'prime', label: '质数数列' },
  { key: 'custom', label: '自定义规律' }
]

// 难度定义
const difficulties = [
  { key: 'easy', label: '简单' },
  { key: 'medium', label: '中等' },
  { key: 'hard', label: '困难' }
]

// 计算属性
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || null
})

const progressPercentage = computed(() => {
  if (questions.value.length === 0) return 0
  return ((currentQuestionIndex.value + 1) / questions.value.length) * 100
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

const sequenceAbilityScore = computed(() => {
  const accuracy = overallAccuracy.value
  const avgTime = averageTime.value
  const timeBonus = Math.max(0, 100 - avgTime * 2)
  return Math.round(accuracy * 0.7 + timeBonus * 0.3)
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

const performanceFeedback = computed(() => {
  const feedback = []
  const accuracy = overallAccuracy.value
  const avgTime = averageTime.value
  
  // 准确率反馈
  if (accuracy >= 90) {
    feedback.push({
      type: 'accuracy',
      level: 'excellent',
      icon: '🎯',
      title: '准确率优秀',
      description: '您的数字序列识别准确率非常高，展现出优秀的逻辑推理能力。'
    })
  } else if (accuracy >= 70) {
    feedback.push({
      type: 'accuracy',
      level: 'good',
      icon: '👍',
      title: '准确率良好',
      description: '您的数字序列识别准确率良好，继续练习可以进一步提升。'
    })
  } else if (accuracy >= 50) {
    feedback.push({
      type: 'accuracy',
      level: 'average',
      icon: '📈',
      title: '准确率一般',
      description: '您的数字序列识别准确率有待提升，建议多练习不同类型的序列。'
    })
  } else {
    feedback.push({
      type: 'accuracy',
      level: 'poor',
      icon: '📚',
      title: '需要加强练习',
      description: '建议从简单的等差、等比数列开始练习，逐步提升序列识别能力。'
    })
  }
  
  // 速度反馈
  if (avgTime <= 10) {
    feedback.push({
      type: 'speed',
      level: 'excellent',
      icon: '⚡',
      title: '反应速度优秀',
      description: '您的序列识别速度非常快，思维敏捷。'
    })
  } else if (avgTime <= 20) {
    feedback.push({
      type: 'speed',
      level: 'good',
      icon: '⏱️',
      title: '反应速度良好',
      description: '您的序列识别速度良好，可以尝试挑战更复杂的序列。'
    })
  } else {
    feedback.push({
      type: 'speed',
      level: 'average',
      icon: '🐌',
      title: '可以提升速度',
      description: '建议多练习熟悉的序列类型，提升识别速度。'
    })
  }
  
  return feedback
})

const improvementSuggestions = computed(() => {
  const suggestions = []
  const accuracy = overallAccuracy.value
  
  if (accuracy < 70) {
    suggestions.push('从基础的等差数列和等比数列开始练习')
    suggestions.push('学习常见的数字序列规律和公式')
  }
  
  if (averageTime.value > 15) {
    suggestions.push('提升心算能力，加快数字运算速度')
    suggestions.push('练习快速识别数字之间的关系')
  }
  
  const typeAccuracies = sequenceTypes.map(type => ({
    type: type.key,
    accuracy: getTypeAccuracy(type.key)
  }))
  
  const weakestType = typeAccuracies.reduce((min, current) => 
    current.accuracy < min.accuracy ? current : min
  )
  
  if (weakestType.accuracy < 60) {
    const typeLabel = sequenceTypes.find(t => t.key === weakestType.type)?.label
    suggestions.push(`重点练习${typeLabel}类型的序列识别`)
  }
  
  suggestions.push('定期进行数字序列练习，保持思维敏锐')
  suggestions.push('尝试不同难度的序列，逐步提升挑战')
  
  return suggestions
})

// 方法
const generateQuestions = () => {
  const count = parseInt(selectedQuestionCount.value)
  const difficulty = selectedDifficulty.value
  const generatedQuestions = []
  
  for (let i = 0; i < count; i++) {
    const questionType = sequenceTypes[Math.floor(Math.random() * sequenceTypes.length)].key
    const question = generateSequenceQuestion(questionType, difficulty)
    generatedQuestions.push(question)
  }
  
  questions.value = generatedQuestions
}

const generateSequenceQuestion = (type, difficulty) => {
  switch (type) {
    case 'arithmetic':
      return generateArithmeticSequence(difficulty)
    case 'geometric':
      return generateGeometricSequence(difficulty)
    case 'fibonacci':
      return generateFibonacciSequence(difficulty)
    case 'square':
      return generateSquareSequence(difficulty)
    case 'prime':
      return generatePrimeSequence(difficulty)
    case 'custom':
      return generateCustomSequence(difficulty)
    default:
      return generateArithmeticSequence(difficulty)
  }
}

const generateArithmeticSequence = (difficulty) => {
  const difficultySettings = {
    easy: { start: 1, maxDiff: 5, length: 4 },
    medium: { start: 1, maxDiff: 10, length: 5 },
    hard: { start: 1, maxDiff: 20, length: 6 }
  }
  
  const settings = difficultySettings[difficulty]
  const start = Math.floor(Math.random() * 20) + settings.start
  const diff = Math.floor(Math.random() * settings.maxDiff) + 1
  
  const sequence = []
  for (let i = 0; i < settings.length; i++) {
    sequence.push(start + i * diff)
  }
  
  const answer = start + settings.length * diff
  const choices = generateChoices(answer, 'arithmetic')
  
  return {
    type: 'arithmetic',
    difficulty,
    sequence,
    answer,
    choices,
    hint: '观察相邻数字的差值',
    explanation: `这是等差数列，公差为${diff}，下一个数字是${answer}`
  }
}

const generateGeometricSequence = (difficulty) => {
  const difficultySettings = {
    easy: { start: 1, maxRatio: 3, length: 4 },
    medium: { start: 1, maxRatio: 4, length: 5 },
    hard: { start: 1, maxRatio: 5, length: 5 }
  }
  
  const settings = difficultySettings[difficulty]
  const start = Math.floor(Math.random() * 5) + settings.start
  const ratio = Math.floor(Math.random() * settings.maxRatio) + 2
  
  const sequence = []
  for (let i = 0; i < settings.length; i++) {
    sequence.push(start * Math.pow(ratio, i))
  }
  
  const answer = start * Math.pow(ratio, settings.length)
  const choices = generateChoices(answer, 'geometric')
  
  return {
    type: 'geometric',
    difficulty,
    sequence,
    answer,
    choices,
    hint: '观察相邻数字的比值',
    explanation: `这是等比数列，公比为${ratio}，下一个数字是${answer}`
  }
}

const generateFibonacciSequence = (difficulty) => {
  const difficultySettings = {
    easy: { length: 5 },
    medium: { length: 6 },
    hard: { length: 7 }
  }
  
  const settings = difficultySettings[difficulty]
  const sequence = [1, 1]
  
  for (let i = 2; i < settings.length; i++) {
    sequence.push(sequence[i-1] + sequence[i-2])
  }
  
  const answer = sequence[sequence.length-1] + sequence[sequence.length-2]
  const choices = generateChoices(answer, 'fibonacci')
  
  return {
    type: 'fibonacci',
    difficulty,
    sequence,
    answer,
    choices,
    hint: '每个数字是前两个数字的和',
    explanation: `这是斐波那契数列，下一个数字是${answer}`
  }
}

const generateSquareSequence = (difficulty) => {
  const difficultySettings = {
    easy: { start: 1, length: 4 },
    medium: { start: 1, length: 5 },
    hard: { start: 2, length: 5 }
  }
  
  const settings = difficultySettings[difficulty]
  const sequence = []
  
  for (let i = settings.start; i < settings.start + settings.length; i++) {
    sequence.push(i * i)
  }
  
  const nextIndex = settings.start + settings.length
  const answer = nextIndex * nextIndex
  const choices = generateChoices(answer, 'square')
  
  return {
    type: 'square',
    difficulty,
    sequence,
    answer,
    choices,
    hint: '观察每个数字与其位置的关系',
    explanation: `这是平方数列，下一个数字是${nextIndex}²=${answer}`
  }
}

const generatePrimeSequence = (difficulty) => {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
  
  const difficultySettings = {
    easy: { length: 4 },
    medium: { length: 5 },
    hard: { length: 6 }
  }
  
  const settings = difficultySettings[difficulty]
  const sequence = primes.slice(0, settings.length)
  const answer = primes[settings.length]
  const choices = generateChoices(answer, 'prime')
  
  return {
    type: 'prime',
    difficulty,
    sequence,
    answer,
    choices,
    hint: '这些都是质数',
    explanation: `这是质数数列，下一个质数是${answer}`
  }
}

const generateCustomSequence = (difficulty) => {
  // 生成自定义规律的序列
  const patterns = [
    // 交替加减
    () => {
      const start = Math.floor(Math.random() * 10) + 1
      const add = Math.floor(Math.random() * 5) + 2
      const sub = Math.floor(Math.random() * 3) + 1
      const sequence = [start]
      
      for (let i = 1; i < 5; i++) {
        if (i % 2 === 1) {
          sequence.push(sequence[i-1] + add)
        } else {
          sequence.push(sequence[i-1] - sub)
        }
      }
      
      const answer = sequence[4] + add
      return {
        sequence,
        answer,
        explanation: `交替加${add}减${sub}的规律，下一个数字是${answer}`
      }
    },
    // 乘法加常数
    () => {
      const start = Math.floor(Math.random() * 5) + 1
      const multiplier = 2
      const constant = Math.floor(Math.random() * 3) + 1
      const sequence = [start]
      
      for (let i = 1; i < 5; i++) {
        sequence.push(sequence[i-1] * multiplier + constant)
      }
      
      const answer = sequence[4] * multiplier + constant
      return {
        sequence,
        answer,
        explanation: `每次乘以${multiplier}再加${constant}，下一个数字是${answer}`
      }
    }
  ]
  
  const pattern = patterns[Math.floor(Math.random() * patterns.length)]()
  const choices = generateChoices(pattern.answer, 'custom')
  
  return {
    type: 'custom',
    difficulty,
    sequence: pattern.sequence,
    answer: pattern.answer,
    choices,
    hint: '寻找特殊的数学规律',
    explanation: pattern.explanation
  }
}

const generateChoices = (correctAnswer, type) => {
  const choices = [correctAnswer]
  
  // 根据类型生成干扰选项
  while (choices.length < 4) {
    let wrongAnswer
    
    switch (type) {
      case 'arithmetic':
      case 'geometric':
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10
        break
      case 'fibonacci':
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5
        break
      case 'square':
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 30) - 15
        break
      case 'prime':
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 8) - 4
        break
      default:
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 15) - 7
    }
    
    if (wrongAnswer > 0 && !choices.includes(wrongAnswer)) {
      choices.push(wrongAnswer)
    }
  }
  
  return shuffleArray(choices)
}

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const startTest = () => {
  generateQuestions()
  currentPhase.value = 'testing'
  currentQuestionIndex.value = 0
  currentScore.value = 0
  results.value = []
  startTime.value = Date.now()
  questionStartTime.value = Date.now()
  startTimer()
}

const startTimer = () => {
  timer.value = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
}

const selectAnswer = (choice) => {
  if (!showFeedback.value) {
    selectedAnswer.value = choice
  }
}

const submitAnswer = () => {
  if (!selectedAnswer.value) return
  
  const timeSpent = (Date.now() - questionStartTime.value) / 1000
  isCorrect.value = selectedAnswer.value === currentQuestion.value.answer
  
  // 计算得分
  let score = 0
  if (isCorrect.value) {
    const baseScore = 10
    const timeBonus = Math.max(0, 10 - Math.floor(timeSpent / 2))
    const difficultyBonus = {
      easy: 0,
      medium: 5,
      hard: 10
    }[currentQuestion.value.difficulty]
    
    score = baseScore + timeBonus + difficultyBonus
    currentScore.value += score
  }
  
  // 记录结果
  results.value.push({
    questionIndex: currentQuestionIndex.value,
    question: currentQuestion.value,
    selectedAnswer: selectedAnswer.value,
    isCorrect: isCorrect.value,
    timeSpent: Math.round(timeSpent * 10) / 10,
    score,
    skipped: false
  })
  
  showFeedback.value = true
}

const skipQuestion = () => {
  const timeSpent = (Date.now() - questionStartTime.value) / 1000
  
  results.value.push({
    questionIndex: currentQuestionIndex.value,
    question: currentQuestion.value,
    selectedAnswer: null,
    isCorrect: false,
    timeSpent: Math.round(timeSpent * 10) / 10,
    score: 0,
    skipped: true
  })
  
  nextQuestion()
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    selectedAnswer.value = null
    showFeedback.value = false
    questionStartTime.value = Date.now()
  } else {
    completeTest()
  }
}

const completeTest = () => {
  clearInterval(timer.value)
  currentPhase.value = 'results'
}

const getSequenceTypeLabel = (type) => {
  return sequenceTypes.find(t => t.key === type)?.label || type
}

const getTypeAccuracy = (type) => {
  const typeResults = results.value.filter(r => r.question.type === type)
  if (typeResults.length === 0) return 0
  const correct = typeResults.filter(r => r.isCorrect).length
  return Math.round((correct / typeResults.length) * 100)
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
  console.log('导出数字序列测试报告')
}

const retakeTest = () => {
  currentPhase.value = 'instruction'
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  showFeedback.value = false
  currentScore.value = 0
  results.value = []
  elapsedTime.value = 0
}

const goToTraining = () => {
  // 跳转到训练页面逻辑
  console.log('跳转到数字序列训练')
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
.number-sequence-test {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.test-info h3 {
  font-size: 1.8em;
  color: #495057;
  margin-bottom: 10px;
}

.test-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.test-stats span {
  background: #f8f9fa;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9em;
  color: #495057;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-left: 20px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.test-container {
  display: grid;
  gap: 30px;
}

.question-content {
  text-align: center;
}

.question-content h4 {
  font-size: 1.5em;
  color: #495057;
  margin-bottom: 30px;
}

.sequence-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.sequence-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3em;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.sequence-question-mark {
  width: 60px;
  height: 60px;
  background: #ffc107;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}

.sequence-info {
  margin-bottom: 30px;
}

.sequence-hint {
  font-size: 1.1em;
  color: #17a2b8;
  margin-bottom: 10px;
  font-style: italic;
}

.sequence-type {
  font-size: 0.9em;
  color: #6c757d;
}

.answer-section {
  max-width: 600px;
  margin: 0 auto;
}

.answer-choices {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.choice-button {
  padding: 15px 20px;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 10px;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.choice-button:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.choice-button.selected {
  border-color: #007bff;
  background: #e3f2fd;
  color: #007bff;
}

.choice-button.correct {
  border-color: #28a745;
  background: #d4edda;
  color: #28a745;
}

.choice-button.incorrect {
  border-color: #dc3545;
  background: #f8d7da;
  color: #dc3545;
}

.choice-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.feedback-section {
  margin-bottom: 30px;
}

.feedback-message {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.feedback-message.correct {
  background: #d4edda;
  border-left: 4px solid #28a745;
}

.feedback-message.incorrect {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
}

.feedback-icon {
  font-size: 1.5em;
}

.feedback-text {
  flex: 1;
}

.feedback-title {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 5px;
}

.feedback-explanation {
  color: #495057;
  line-height: 1.5;
}

.question-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
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

.sequence-stats {
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
  .number-sequence-test {
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

.choice-button {
  animation: scaleIn 0.4s ease-out;
}

.result-card {
  animation: fadeIn 0.6s ease-out;
}

.sequence-number {
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