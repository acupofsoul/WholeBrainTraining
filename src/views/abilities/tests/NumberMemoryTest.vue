<template>
  <div class="number-memory-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase">
      <div class="instruction-content">
        <h3>数字记忆测试</h3>
        <p class="instruction-description">
          这是一个测试您数字记忆能力的测试。您需要记住显示的数字序列，然后按正确顺序输入。
        </p>
        
        <div class="instruction-steps">
          <div class="step-item">
            <div class="step-icon">👀</div>
            <div class="step-content">
              <h4>观察记忆</h4>
              <p>仔细观察屏幕上显示的数字序列</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-icon">🧠</div>
            <div class="step-content">
              <h4>记忆保持</h4>
              <p>在数字消失后，努力记住完整的序列</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-icon">✍️</div>
            <div class="step-content">
              <h4>准确输入</h4>
              <p>按照记忆中的顺序准确输入数字</p>
            </div>
          </div>
        </div>
        
        <div class="test-settings">
          <div class="setting-group">
            <label>难度等级：</label>
            <select v-model="selectedDifficulty">
              <option value="easy">简单 (3-5位)</option>
              <option value="medium">中等 (6-8位)</option>
              <option value="hard">困难 (9-12位)</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label>显示时间：</label>
            <select v-model="selectedDisplayTime">
              <option value="1000">1秒</option>
              <option value="2000">2秒</option>
              <option value="3000">3秒</option>
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
          <h3>数字记忆测试</h3>
          <div class="test-stats">
            <span class="current-question">第 {{ currentQuestionIndex + 1 }} / {{ totalQuestions }} 题</span>
            <span class="score">得分: {{ currentScore }}</span>
            <span class="accuracy">准确率: {{ currentAccuracy }}%</span>
          </div>
        </div>
        
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>
      
      <!-- 显示数字阶段 -->
      <div v-if="testState === 'display'" class="display-phase">
        <div class="display-container">
          <div class="phase-title">请记住以下数字序列</div>
          <div class="number-display">
            <div 
              v-for="(digit, index) in currentSequence" 
              :key="index"
              class="digit"
              :style="{ animationDelay: index * 0.1 + 's' }"
            >
              {{ digit }}
            </div>
          </div>
          <div class="countdown-timer">
            <div class="timer-circle">
              <div 
                class="timer-fill" 
                :style="{ transform: `rotate(${(displayTime - remainingDisplayTime) / displayTime * 360}deg)` }"
              ></div>
              <div class="timer-text">{{ Math.ceil(remainingDisplayTime / 1000) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 输入阶段 -->
      <div v-if="testState === 'input'" class="input-phase">
        <div class="input-container">
          <div class="phase-title">请输入您记住的数字序列</div>
          <div class="input-display">
            <input 
              ref="numberInput"
              v-model="userInput"
              @input="validateInput"
              @keyup.enter="submitAnswer"
              type="text"
              placeholder="输入数字序列"
              :maxlength="currentSequence.length"
              autocomplete="off"
            />
          </div>
          
          <div class="input-hints" v-if="enableHints">
            <div class="hint-item">
              <span class="hint-icon">💡</span>
              <span>数字长度: {{ currentSequence.length }}位</span>
            </div>
            <div class="hint-item">
              <span class="hint-icon">⌨️</span>
              <span>已输入: {{ userInput.length }} / {{ currentSequence.length }}</span>
            </div>
          </div>
          
          <div class="input-actions">
            <button 
              @click="submitAnswer" 
              :disabled="userInput.length !== currentSequence.length"
              class="btn-submit"
            >
              提交答案
            </button>
            <button @click="skipQuestion" class="btn-skip">跳过</button>
          </div>
        </div>
      </div>
      
      <!-- 反馈阶段 -->
      <div v-if="testState === 'feedback'" class="feedback-phase">
        <div class="feedback-container">
          <div :class="['feedback-result', isCorrect ? 'correct' : 'incorrect']">
            <div class="feedback-icon">
              {{ isCorrect ? '✅' : '❌' }}
            </div>
            <div class="feedback-text">
              <div class="feedback-title">
                {{ isCorrect ? '回答正确！' : '回答错误' }}
              </div>
              <div class="feedback-details">
                <div class="answer-comparison">
                  <div class="correct-sequence">
                    <span class="label">正确序列:</span>
                    <div class="sequence-display">
                      <span 
                        v-for="(digit, index) in currentSequence" 
                        :key="index"
                        class="digit correct"
                      >
                        {{ digit }}
                      </span>
                    </div>
                  </div>
                  <div class="user-sequence" v-if="!isCorrect">
                    <span class="label">您的输入:</span>
                    <div class="sequence-display">
                      <span 
                        v-for="(digit, index) in userInputArray" 
                        :key="index"
                        :class="['digit', getDigitClass(digit, index)]"
                      >
                        {{ digit || '?' }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="feedback-stats">
                  <div class="stat-item">
                    <span class="stat-label">用时:</span>
                    <span class="stat-value">{{ lastQuestionTime }}秒</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">得分:</span>
                    <span class="stat-value">+{{ lastQuestionScore }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button @click="nextQuestion" class="btn-next">继续下一题</button>
        </div>
      </div>
    </div>
    
    <!-- 结果展示阶段 -->
    <div v-if="currentPhase === 'results'" class="results-phase">
      <div class="results-header">
        <h3>测试完成</h3>
        <p>您的数字记忆能力测试结果如下：</p>
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
          <div class="result-value">{{ totalScore }}</div>
          <div class="result-label">总得分</div>
        </div>
        
        <div class="result-card">
          <div class="result-icon">🧠</div>
          <div class="result-value">{{ memoryScore }}</div>
          <div class="result-label">记忆能力得分</div>
        </div>
      </div>
      
      <div class="detailed-analysis">
        <h4>详细分析</h4>
        
        <div class="analysis-grid">
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
            <h5>序列长度表现</h5>
            <div class="length-chart">
              <div 
                v-for="length in sequenceLengths" 
                :key="length"
                class="length-bar"
              >
                <span class="length-label">{{ length }}位</span>
                <div class="bar-container">
                  <div 
                    class="bar-fill" 
                    :style="{ width: getLengthAccuracy(length) + '%' }"
                  ></div>
                </div>
                <span class="accuracy-value">{{ getLengthAccuracy(length) }}%</span>
              </div>
            </div>
          </div>
          
          <div class="analysis-item">
            <h5>记忆统计</h5>
            <div class="memory-stats">
              <div class="stat-row">
                <span class="stat-label">最长记忆序列</span>
                <span class="stat-value">{{ longestCorrectSequence }}位</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">连续正确数</span>
                <span class="stat-value">{{ maxConsecutiveCorrect }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">完全匹配率</span>
                <span class="stat-value">{{ exactMatchRate }}%</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">部分匹配率</span>
                <span class="stat-value">{{ partialMatchRate }}%</span>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// Props
const props = defineProps({
  difficulty: {
    type: String,
    default: 'medium'
  },
  enableHints: {
    type: Boolean,
    default: true
  },
  enableFeedback: {
    type: Boolean,
    default: true
  },
  assessmentMode: {
    type: String,
    default: 'comprehensive'
  }
})

// Emits
const emit = defineEmits(['test-complete', 'test-progress'])

// 响应式数据
const currentPhase = ref('instruction') // instruction, testing, results
const selectedDifficulty = ref(props.difficulty)
const selectedDisplayTime = ref(2000)
const testState = ref('display') // display, input, feedback
const currentQuestionIndex = ref(0)
const totalQuestions = ref(15)
const currentSequence = ref([])
const userInput = ref('')
const userInputArray = ref([])
const isCorrect = ref(false)
const currentScore = ref(0)
const lastQuestionScore = ref(0)
const lastQuestionTime = ref(0)
const questionStartTime = ref(null)
const displayTime = ref(2000)
const remainingDisplayTime = ref(2000)
const results = ref([])
const numberInput = ref(null)
const displayTimer = ref(null)
const testCompleted = ref(false)

// 难度定义
const difficulties = [
  { key: 'easy', label: '简单', minLength: 3, maxLength: 5 },
  { key: 'medium', label: '中等', minLength: 6, maxLength: 8 },
  { key: 'hard', label: '困难', minLength: 9, maxLength: 12 }
]

// 序列长度范围
const sequenceLengths = computed(() => {
  const lengths = []
  for (let i = 3; i <= 12; i++) {
    lengths.push(i)
  }
  return lengths
})

// 计算属性
const progressPercentage = computed(() => {
  return (currentQuestionIndex.value / totalQuestions.value) * 100
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

const memoryScore = computed(() => {
  const accuracy = overallAccuracy.value
  const speedBonus = Math.max(0, 100 - averageTime.value * 10)
  const lengthBonus = longestCorrectSequence.value * 5
  return Math.round(accuracy * 0.6 + speedBonus * 0.2 + lengthBonus * 0.2)
})

const longestCorrectSequence = computed(() => {
  const correctResults = results.value.filter(r => r.isCorrect)
  if (correctResults.length === 0) return 0
  return Math.max(...correctResults.map(r => r.sequenceLength))
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

const exactMatchRate = computed(() => {
  if (results.value.length === 0) return 0
  const exactMatches = results.value.filter(r => r.isCorrect).length
  return Math.round((exactMatches / results.value.length) * 100)
})

const partialMatchRate = computed(() => {
  if (results.value.length === 0) return 0
  const partialMatches = results.value.filter(r => r.partialScore > 0 && !r.isCorrect).length
  return Math.round((partialMatches / results.value.length) * 100)
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
      title: '记忆准确率优秀',
      description: '您的数字记忆准确率非常高，记忆能力出色。'
    })
  } else if (accuracy >= 75) {
    feedback.push({
      type: 'accuracy',
      level: 'good',
      icon: '👍',
      title: '记忆准确率良好',
      description: '您的数字记忆准确率良好，继续保持。'
    })
  } else if (accuracy >= 60) {
    feedback.push({
      type: 'accuracy',
      level: 'average',
      icon: '📈',
      title: '记忆准确率一般',
      description: '您的数字记忆准确率有提升空间，建议多练习。'
    })
  } else {
    feedback.push({
      type: 'accuracy',
      level: 'poor',
      icon: '📚',
      title: '需要加强练习',
      description: '建议从短序列开始练习，逐步提升记忆能力。'
    })
  }
  
  // 速度反馈
  if (avgTime <= 3) {
    feedback.push({
      type: 'speed',
      level: 'excellent',
      icon: '⚡',
      title: '反应速度优秀',
      description: '您的记忆反应速度非常快。'
    })
  } else if (avgTime <= 5) {
    feedback.push({
      type: 'speed',
      level: 'good',
      icon: '⏱️',
      title: '反应速度良好',
      description: '您的记忆反应速度良好。'
    })
  } else {
    feedback.push({
      type: 'speed',
      level: 'average',
      icon: '🐌',
      title: '可以提升速度',
      description: '建议多练习提升记忆反应速度。'
    })
  }
  
  return feedback
})

const improvementSuggestions = computed(() => {
  const suggestions = []
  const accuracy = overallAccuracy.value
  const avgTime = averageTime.value
  
  if (accuracy < 75) {
    suggestions.push('从较短的数字序列开始练习，逐步增加长度')
    suggestions.push('使用分组记忆法，将长序列分成小段记忆')
  }
  
  if (avgTime > 5) {
    suggestions.push('练习快速记忆技巧，提升反应速度')
    suggestions.push('尝试使用数字联想法增强记忆效果')
  }
  
  if (longestCorrectSequence.value < 8) {
    suggestions.push('逐步挑战更长的数字序列')
    suggestions.push('练习数字记忆宫殿法')
  }
  
  suggestions.push('定期进行数字记忆练习，保持记忆能力')
  suggestions.push('尝试不同的记忆策略，找到最适合的方法')
  
  return suggestions
})

// 方法
const generateSequence = (difficulty) => {
  const difficultySettings = difficulties.find(d => d.key === difficulty)
  const length = Math.floor(Math.random() * (difficultySettings.maxLength - difficultySettings.minLength + 1)) + difficultySettings.minLength
  
  const sequence = []
  for (let i = 0; i < length; i++) {
    sequence.push(Math.floor(Math.random() * 10))
  }
  
  return sequence
}

const startTest = () => {
  currentPhase.value = 'testing'
  currentQuestionIndex.value = 0
  currentScore.value = 0
  results.value = []
  testCompleted.value = false
  
  // 根据测评模式调整题目数量
  if (props.assessmentMode === 'quick') {
    totalQuestions.value = 10
  } else if (props.assessmentMode === 'detailed') {
    totalQuestions.value = 20
  } else {
    totalQuestions.value = 15
  }
  
  generateNewQuestion()
}

const generateNewQuestion = () => {
  currentSequence.value = generateSequence(selectedDifficulty.value)
  userInput.value = ''
  userInputArray.value = []
  testState.value = 'display'
  displayTime.value = parseInt(selectedDisplayTime.value)
  remainingDisplayTime.value = displayTime.value
  questionStartTime.value = Date.now()
  
  startDisplayTimer()
}

const startDisplayTimer = () => {
  displayTimer.value = setInterval(() => {
    remainingDisplayTime.value -= 100
    
    if (remainingDisplayTime.value <= 0) {
      clearInterval(displayTimer.value)
      testState.value = 'input'
      
      nextTick(() => {
        if (numberInput.value) {
          numberInput.value.focus()
        }
      })
    }
  }, 100)
}

const validateInput = () => {
  // 只允许数字
  userInput.value = userInput.value.replace(/[^0-9]/g, '')
  userInputArray.value = userInput.value.split('').map(d => parseInt(d))
}

const submitAnswer = () => {
  if (userInput.value.length !== currentSequence.value.length) return
  
  const timeSpent = (Date.now() - questionStartTime.value) / 1000
  const userSequence = userInput.value.split('').map(d => parseInt(d))
  
  // 检查完全匹配
  isCorrect.value = JSON.stringify(userSequence) === JSON.stringify(currentSequence.value)
  
  // 计算部分匹配得分
  let partialScore = 0
  for (let i = 0; i < currentSequence.value.length; i++) {
    if (userSequence[i] === currentSequence.value[i]) {
      partialScore++
    }
  }
  
  // 计算得分
  let score = 0
  if (isCorrect.value) {
    const baseScore = 10
    const lengthBonus = currentSequence.value.length
    const timeBonus = Math.max(0, 10 - Math.floor(timeSpent))
    score = baseScore + lengthBonus + timeBonus
  } else {
    // 部分得分
    score = Math.floor((partialScore / currentSequence.value.length) * 5)
  }
  
  currentScore.value += score
  lastQuestionScore.value = score
  lastQuestionTime.value = Math.round(timeSpent * 10) / 10
  
  // 记录结果
  const result = {
    questionIndex: currentQuestionIndex.value,
    sequence: [...currentSequence.value],
    userInput: [...userSequence],
    isCorrect: isCorrect.value,
    partialScore,
    timeSpent: lastQuestionTime.value,
    score,
    sequenceLength: currentSequence.value.length,
    difficulty: selectedDifficulty.value
  }
  
  results.value.push(result)
  
  // 发送进度更新
  emit('test-progress', {
    currentQuestion: currentQuestionIndex.value + 1,
    totalQuestions: totalQuestions.value,
    currentScore: currentScore.value,
    accuracy: currentAccuracy.value
  })
  
  if (props.enableFeedback) {
    testState.value = 'feedback'
  } else {
    nextQuestion()
  }
}

const skipQuestion = () => {
  const timeSpent = (Date.now() - questionStartTime.value) / 1000
  
  const result = {
    questionIndex: currentQuestionIndex.value,
    sequence: [...currentSequence.value],
    userInput: [],
    isCorrect: false,
    partialScore: 0,
    timeSpent: Math.round(timeSpent * 10) / 10,
    score: 0,
    sequenceLength: currentSequence.value.length,
    difficulty: selectedDifficulty.value,
    skipped: true
  }
  
  results.value.push(result)
  nextQuestion()
}

const nextQuestion = () => {
  currentQuestionIndex.value++
  
  if (currentQuestionIndex.value >= totalQuestions.value) {
    completeTest()
  } else {
    generateNewQuestion()
  }
}

const completeTest = () => {
  testCompleted.value = true
  currentPhase.value = 'results'
  
  // 发送测试完成事件
  emit('test-complete', {
    score: memoryScore.value,
    accuracy: overallAccuracy.value,
    averageTime: averageTime.value,
    completedQuestions: results.value.length,
    questions: results.value
  })
}

const getDifficultyAccuracy = (difficulty) => {
  const difficultyResults = results.value.filter(r => r.difficulty === difficulty)
  if (difficultyResults.length === 0) return 0
  const correct = difficultyResults.filter(r => r.isCorrect).length
  return Math.round((correct / difficultyResults.length) * 100)
}

const getLengthAccuracy = (length) => {
  const lengthResults = results.value.filter(r => r.sequenceLength === length)
  if (lengthResults.length === 0) return 0
  const correct = lengthResults.filter(r => r.isCorrect).length
  return Math.round((correct / lengthResults.length) * 100)
}

const getDigitClass = (digit, index) => {
  if (index >= currentSequence.value.length) return 'extra'
  if (digit === currentSequence.value[index]) return 'correct'
  return 'incorrect'
}

const exportReport = () => {
  console.log('导出数字记忆测试报告')
}

const retakeTest = () => {
  currentPhase.value = 'instruction'
  currentQuestionIndex.value = 0
  currentScore.value = 0
  results.value = []
  testCompleted.value = false
}

const goToTraining = () => {
  console.log('跳转到数字记忆训练')
}

// 生命周期
onMounted(() => {
  if (props.difficulty !== 'medium') {
    selectedDifficulty.value = props.difficulty
  }
})

onUnmounted(() => {
  if (displayTimer.value) {
    clearInterval(displayTimer.value)
  }
})
</script>

<style scoped>
.number-memory-test {
  max-width: 1000px;
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
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.instruction-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  max-width: 600px;
  margin: 0 auto;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

/* 显示阶段样式 */
.display-phase {
  text-align: center;
}

.display-container {
  max-width: 800px;
  margin: 0 auto;
}

.phase-title {
  font-size: 1.5em;
  color: #495057;
  margin-bottom: 30px;
}

.number-display {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.digit {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5em;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  animation: digitAppear 0.5s ease-out;
}

@keyframes digitAppear {
  from {
    opacity: 0;
    transform: scale(0.5) rotateY(90deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotateY(0deg);
  }
}

.countdown-timer {
  display: flex;
  justify-content: center;
}

.timer-circle {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(#007bff 0deg, #e9ecef 0deg);
  transition: transform 0.1s linear;
}

.timer-text {
  position: relative;
  z-index: 1;
  font-size: 1.5em;
  font-weight: 600;
  color: #495057;
}

/* 输入阶段样式 */
.input-phase {
  text-align: center;
}

.input-container {
  max-width: 600px;
  margin: 0 auto;
}

.input-display {
  margin-bottom: 30px;
}

.input-display input {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  font-size: 2em;
  text-align: center;
  border: 3px solid #007bff;
  border-radius: 15px;
  background: white;
  color: #495057;
  outline: none;
  letter-spacing: 0.2em;
}

.input-display input:focus {
  border-color: #0056b3;
  box-shadow: 0 0 20px rgba(0, 123, 255, 0.3);
}

.input-hints {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  padding: 10px 15px;
  border-radius: 20px;
  color: #6c757d;
}

.hint-icon {
  font-size: 1.2em;
}

.input-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-submit,
.btn-skip {
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

.btn-submit:hover:not(:disabled) {
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

/* 反馈阶段样式 */
.feedback-phase {
  text-align: center;
}

.feedback-container {
  max-width: 800px;
  margin: 0 auto;
}

.feedback-result {
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.feedback-result.correct {
  background: #d4edda;
  border: 2px solid #28a745;
}

.feedback-result.incorrect {
  background: #f8d7da;
  border: 2px solid #dc3545;
}

.feedback-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.feedback-title {
  font-size: 1.5em;
  font-weight: 600;
  margin-bottom: 20px;
  color: #495057;
}

.answer-comparison {
  margin-bottom: 25px;
}

.correct-sequence,
.user-sequence {
  margin-bottom: 15px;
}

.label {
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.sequence-display {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sequence-display .digit {
  width: 40px;
  height: 40px;
  font-size: 1.2em;
  border-radius: 8px;
}

.sequence-display .digit.correct {
  background: #28a745;
}

.sequence-display .digit.incorrect {
  background: #dc3545;
}

.sequence-display .digit.extra {
  background: #ffc107;
  color: #212529;
}

.feedback-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: #6c757d;
}

.stat-value {
  font-weight: 600;
  color: #495057;
}

.btn-next {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 25px;
  font-size: 1em;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
.length-chart {
  display: grid;
  gap: 15px;
}

.difficulty-bar,
.length-bar {
  display: grid;
  grid-template-columns: 60px 1fr 50px;
  align-items: center;
  gap: 15px;
}

.difficulty-label,
.length-label {
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

.memory-stats {
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

.stat-row .stat-label {
  color: #6c757d;
  font-size: 0.9em;
}

.stat-row .stat-value {
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
  .number-memory-test {
    padding: 10px;
  }
  
  .instruction-phase,
  .testing-phase,
  .results-phase {
    padding: 20px;
  }
  
  .instruction-content h3,
  .results-header h3 {
    font-size: 2em;
  }
  
  .instruction-steps {
    grid-template-columns: 1fr;
  }
  
  .test-settings {
    flex-direction: column;
    align-items: center;
  }
  
  .number-display {
    gap: 10px;
  }
  
  .digit {
    width: 60px;
    height: 60px;
    font-size: 2em;
  }
  
  .input-display input {
    font-size: 1.5em;
    padding: 15px;
  }
  
  .input-hints {
    flex-direction: column;
  }
  
  .input-actions {
    flex-direction: column;
  }
  
  .overall-results {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .difficulty-bar,
  .length-bar {
    grid-template-columns: 50px 1fr 40px;
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

.display-container {
  animation: fadeIn 0.6s ease-out;
}

.input-container {
  animation: slideIn 0.6s ease-out;
}

.feedback-container {
  animation: scaleIn 0.6s ease-out;
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