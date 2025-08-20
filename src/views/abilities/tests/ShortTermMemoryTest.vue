<template>
  <div class="short-term-memory-test">
    <div class="test-container">
      <!-- 测试说明阶段 -->
      <div v-if="testPhase === 'instruction'" class="instruction-phase">
        <div class="instruction-content">
          <h3>短期记忆测试</h3>
          <p class="instruction-text">
            这个测试将评估您的短期记忆能力。您需要记住一系列信息，然后在短时间内准确回忆。
          </p>
          
          <div class="instruction-steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-text">仔细观察展示的信息</div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-text">在规定时间内记住内容</div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-text">等待一段时间后回答问题</div>
            </div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-text">尽可能准确地回忆信息</div>
            </div>
          </div>
          
          <button @click="startTest" class="btn-start">
            开始测试
          </button>
        </div>
      </div>

      <!-- 记忆阶段 -->
      <div v-if="testPhase === 'memorizing'" class="memorizing-phase">
        <div class="memorizing-header">
          <h4>请记住以下内容</h4>
          <div class="memorizing-timer">
            <div class="timer-circle">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#e0e0e0" stroke-width="6"/>
                <circle cx="40" cy="40" r="35" fill="none" stroke="var(--color-primary)" 
                        stroke-width="6" stroke-linecap="round"
                        :stroke-dasharray="`${memoryProgress * 2.2} 220`"
                        transform="rotate(-90 40 40)"/>
              </svg>
              <div class="timer-text">{{ memoryTimeLeft }}s</div>
            </div>
          </div>
        </div>
        
        <div class="memory-content">
          <!-- 数字序列记忆 -->
          <div v-if="currentQuestion.type === 'numbers'" class="number-memory">
            <div class="number-sequence">
              <span 
                v-for="(number, index) in currentQuestion.sequence" 
                :key="index"
                class="memory-number"
                :style="{ animationDelay: index * 0.1 + 's' }"
              >
                {{ number }}
              </span>
            </div>
          </div>
          
          <!-- 单词记忆 -->
          <div v-else-if="currentQuestion.type === 'words'" class="word-memory">
            <div class="word-list">
              <span 
                v-for="(word, index) in currentQuestion.words" 
                :key="index"
                class="memory-word"
                :style="{ animationDelay: index * 0.2 + 's' }"
              >
                {{ word }}
              </span>
            </div>
          </div>
          
          <!-- 颜色序列记忆 -->
          <div v-else-if="currentQuestion.type === 'colors'" class="color-memory">
            <div class="color-sequence">
              <div 
                v-for="(color, index) in currentQuestion.colors" 
                :key="index"
                class="memory-color"
                :style="{ 
                  backgroundColor: color,
                  animationDelay: index * 0.15 + 's' 
                }"
              ></div>
            </div>
          </div>
          
          <!-- 图形记忆 -->
          <div v-else-if="currentQuestion.type === 'shapes'" class="shape-memory">
            <div class="shape-grid">
              <div 
                v-for="(shape, index) in currentQuestion.shapes" 
                :key="index"
                class="memory-shape"
                :style="{ animationDelay: index * 0.1 + 's' }"
              >
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle v-if="shape.type === 'circle'" cx="30" cy="30" r="20" :fill="shape.color"/>
                  <rect v-else-if="shape.type === 'square'" x="10" y="10" width="40" height="40" :fill="shape.color"/>
                  <polygon v-else-if="shape.type === 'triangle'" points="30,10 50,50 10,50" :fill="shape.color"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 等待阶段 -->
      <div v-if="testPhase === 'waiting'" class="waiting-phase">
        <div class="waiting-content">
          <div class="waiting-icon">
            <div class="spinner"></div>
          </div>
          <h4>请稍等...</h4>
          <p>正在准备回忆测试</p>
          <div class="waiting-timer">{{ waitTimeLeft }}秒</div>
        </div>
      </div>

      <!-- 回忆阶段 -->
      <div v-if="testPhase === 'recalling'" class="recalling-phase">
        <div class="recalling-header">
          <h4>{{ getRecallPrompt() }}</h4>
          <div class="recall-timer">
            ⏱️ {{ formatTime(recallTimeLeft) }}
          </div>
        </div>
        
        <div class="recall-content">
          <!-- 数字序列回忆 -->
          <div v-if="currentQuestion.type === 'numbers'" class="number-recall">
            <div class="input-sequence">
              <input 
                v-for="(_, index) in currentQuestion.sequence" 
                :key="index"
                type="number"
                v-model="userAnswers[index]"
                class="number-input"
                :placeholder="index + 1"
                maxlength="3"
              />
            </div>
          </div>
          
          <!-- 单词回忆 -->
          <div v-else-if="currentQuestion.type === 'words'" class="word-recall">
            <div class="word-inputs">
              <input 
                v-for="(_, index) in currentQuestion.words" 
                :key="index"
                type="text"
                v-model="userAnswers[index]"
                class="word-input"
                :placeholder="`单词 ${index + 1}`"
              />
            </div>
          </div>
          
          <!-- 颜色序列回忆 -->
          <div v-else-if="currentQuestion.type === 'colors'" class="color-recall">
            <div class="color-options">
              <div 
                v-for="color in colorOptions" 
                :key="color"
                class="color-option"
                :style="{ backgroundColor: color }"
                @click="selectColor(color)"
              ></div>
            </div>
            <div class="selected-colors">
              <div 
                v-for="(color, index) in userAnswers" 
                :key="index"
                class="selected-color"
                :style="{ backgroundColor: color || '#f0f0f0' }"
                @click="removeColor(index)"
              >
                {{ index + 1 }}
              </div>
            </div>
          </div>
          
          <!-- 图形回忆 -->
          <div v-else-if="currentQuestion.type === 'shapes'" class="shape-recall">
            <div class="shape-options">
              <div 
                v-for="shape in shapeOptions" 
                :key="shape.id"
                class="shape-option"
                @click="selectShape(shape)"
              >
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle v-if="shape.type === 'circle'" cx="20" cy="20" r="15" :fill="shape.color"/>
                  <rect v-else-if="shape.type === 'square'" x="5" y="5" width="30" height="30" :fill="shape.color"/>
                  <polygon v-else-if="shape.type === 'triangle'" points="20,5 35,35 5,35" :fill="shape.color"/>
                </svg>
              </div>
            </div>
            <div class="selected-shapes">
              <div 
                v-for="(shape, index) in userAnswers" 
                :key="index"
                class="selected-shape"
                @click="removeShape(index)"
              >
                <svg width="40" height="40" viewBox="0 0 40 40" v-if="shape">
                  <circle v-if="shape.type === 'circle'" cx="20" cy="20" r="15" :fill="shape.color"/>
                  <rect v-else-if="shape.type === 'square'" x="5" y="5" width="30" height="30" :fill="shape.color"/>
                  <polygon v-else-if="shape.type === 'triangle'" points="20,5 35,35 5,35" :fill="shape.color"/>
                </svg>
                <div v-else class="empty-slot">{{ index + 1 }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="recall-controls">
          <button @click="submitRecall" class="btn-submit" :disabled="!canSubmit">
            提交答案
          </button>
          <button @click="skipQuestion" class="btn-skip">
            跳过此题
          </button>
        </div>
      </div>

      <!-- 反馈阶段 -->
      <div v-if="testPhase === 'feedback'" class="feedback-phase">
        <div class="feedback-container">
          <div class="feedback-header">
            <div class="feedback-icon" :class="{ correct: lastResult.isCorrect, incorrect: !lastResult.isCorrect }">
              {{ lastResult.isCorrect ? '✓' : '✗' }}
            </div>
            <div class="feedback-text">
              <div class="feedback-title">
                {{ lastResult.isCorrect ? '回答正确！' : '部分正确' }}
              </div>
              <div class="feedback-score">
                得分: {{ lastResult.score }} / {{ lastResult.maxScore }}
              </div>
            </div>
          </div>
          
          <div class="feedback-details">
            <div class="comparison-section">
              <div class="comparison-item">
                <h5>正确答案:</h5>
                <div class="correct-answer">
                  <span v-if="currentQuestion.type === 'numbers'" 
                        v-for="(num, index) in currentQuestion.sequence" 
                        :key="index" class="answer-item">
                    {{ num }}
                  </span>
                  <span v-else-if="currentQuestion.type === 'words'" 
                        v-for="(word, index) in currentQuestion.words" 
                        :key="index" class="answer-item">
                    {{ word }}
                  </span>
                  <div v-else-if="currentQuestion.type === 'colors'" 
                       v-for="(color, index) in currentQuestion.colors" 
                       :key="index" class="color-item" 
                       :style="{ backgroundColor: color }">
                  </div>
                </div>
              </div>
              
              <div class="comparison-item">
                <h5>您的答案:</h5>
                <div class="user-answer">
                  <span v-if="currentQuestion.type === 'numbers'" 
                        v-for="(answer, index) in userAnswers" 
                        :key="index" class="answer-item"
                        :class="{ correct: answer == currentQuestion.sequence[index], incorrect: answer != currentQuestion.sequence[index] }">
                    {{ answer || '?' }}
                  </span>
                  <span v-else-if="currentQuestion.type === 'words'" 
                        v-for="(answer, index) in userAnswers" 
                        :key="index" class="answer-item"
                        :class="{ correct: answer?.toLowerCase() === currentQuestion.words[index]?.toLowerCase(), incorrect: answer?.toLowerCase() !== currentQuestion.words[index]?.toLowerCase() }">
                    {{ answer || '?' }}
                  </span>
                  <div v-else-if="currentQuestion.type === 'colors'" 
                       v-for="(color, index) in userAnswers" 
                       :key="index" class="color-item" 
                       :style="{ backgroundColor: color || '#f0f0f0' }"
                       :class="{ correct: color === currentQuestion.colors[index], incorrect: color !== currentQuestion.colors[index] }">
                  </div>
                </div>
              </div>
            </div>
            
            <div class="performance-stats">
              <div class="stat-item">
                <span class="stat-label">准确率:</span>
                <span class="stat-value">{{ lastResult.accuracy }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">记忆时间:</span>
                <span class="stat-value">{{ lastResult.memoryTime }}秒</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">回忆时间:</span>
                <span class="stat-value">{{ lastResult.recallTime }}秒</span>
              </div>
            </div>
          </div>
          
          <button @click="nextQuestion" class="btn-continue">
            {{ isLastQuestion ? '查看结果' : '下一题' }}
          </button>
        </div>
      </div>

      <!-- 结果展示阶段 -->
      <div v-if="testPhase === 'results'" class="results-phase">
        <div class="results-container">
          <h3>短期记忆测试结果</h3>
          
          <div class="overall-results">
            <div class="result-card">
              <div class="result-icon">🧠</div>
              <div class="result-content">
                <div class="result-value">{{ overallAccuracy }}%</div>
                <div class="result-label">总体准确率</div>
              </div>
            </div>
            
            <div class="result-card">
              <div class="result-icon">⚡</div>
              <div class="result-content">
                <div class="result-value">{{ averageRecallTime }}s</div>
                <div class="result-label">平均回忆时间</div>
              </div>
            </div>
            
            <div class="result-card">
              <div class="result-icon">📊</div>
              <div class="result-content">
                <div class="result-value">{{ finalScore }}</div>
                <div class="result-label">综合得分</div>
              </div>
            </div>
            
            <div class="result-card">
              <div class="result-icon">🎯</div>
              <div class="result-content">
                <div class="result-value">{{ memoryCapacity }}</div>
                <div class="result-label">记忆容量</div>
              </div>
            </div>
          </div>
          
          <div class="detailed-analysis">
            <h4>详细分析</h4>
            <div class="analysis-grid">
              <div class="analysis-item">
                <h5>记忆类型表现</h5>
                <div class="type-chart">
                  <div v-for="type in ['numbers', 'words', 'colors', 'shapes']" :key="type" class="type-bar">
                    <span class="type-label">{{ getTypeLabel(type) }}</span>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: getTypeAccuracy(type) + '%' }"></div>
                    </div>
                    <span class="accuracy-value">{{ getTypeAccuracy(type) }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="analysis-item">
                <h5>记忆容量分析</h5>
                <div class="capacity-analysis">
                  <div class="capacity-stat">
                    <span class="stat-label">数字记忆:</span>
                    <span class="stat-value">{{ getMemorySpan('numbers') }} 位</span>
                  </div>
                  <div class="capacity-stat">
                    <span class="stat-label">单词记忆:</span>
                    <span class="stat-value">{{ getMemorySpan('words') }} 个</span>
                  </div>
                  <div class="capacity-stat">
                    <span class="stat-label">颜色记忆:</span>
                    <span class="stat-value">{{ getMemorySpan('colors') }} 个</span>
                  </div>
                  <div class="capacity-stat">
                    <span class="stat-label">图形记忆:</span>
                    <span class="stat-value">{{ getMemorySpan('shapes') }} 个</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="performance-feedback">
            <h4>表现评价</h4>
            <div class="feedback-content">
              <div class="feedback-item" :class="getPerformanceLevel(overallAccuracy)">
                <div class="feedback-icon">{{ getPerformanceIcon(overallAccuracy) }}</div>
                <div class="feedback-text">
                  <div class="feedback-title">{{ getPerformanceTitle(overallAccuracy) }}</div>
                  <div class="feedback-description">{{ getPerformanceDescription(overallAccuracy) }}</div>
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

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
  }
})

const emit = defineEmits(['test-complete', 'test-progress'])

// 响应式数据
const testPhase = ref('instruction') // instruction, memorizing, waiting, recalling, feedback, results
const currentQuestionIndex = ref(0)
const questions = ref([])
const userAnswers = ref([])
const results = ref([])
const lastResult = ref({})
const memoryTimeLeft = ref(0)
const waitTimeLeft = ref(0)
const recallTimeLeft = ref(0)
const memoryTimer = ref(null)
const waitTimer = ref(null)
const recallTimer = ref(null)
const startTime = ref(0)
const memoryStartTime = ref(0)
const recallStartTime = ref(0)

// 选项数据
const colorOptions = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd']
const shapeOptions = ref([])

// 计算属性
const difficultySettings = computed(() => {
  const settings = {
    easy: { memoryTime: 8, waitTime: 2, recallTime: 30, maxItems: 5 },
    medium: { memoryTime: 6, waitTime: 3, recallTime: 25, maxItems: 7 },
    hard: { memoryTime: 4, waitTime: 4, recallTime: 20, maxItems: 9 }
  }
  return settings[props.difficulty] || settings.medium
})

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

const memoryProgress = computed(() => {
  const totalTime = difficultySettings.value.memoryTime
  return ((totalTime - memoryTimeLeft.value) / totalTime) * 100
})

const canSubmit = computed(() => {
  if (!currentQuestion.value) return false
  return userAnswers.value.some(answer => answer !== null && answer !== undefined && answer !== '')
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value >= questions.value.length - 1
})

const overallAccuracy = computed(() => {
  if (results.value.length === 0) return 0
  const totalScore = results.value.reduce((sum, result) => sum + result.score, 0)
  const maxScore = results.value.reduce((sum, result) => sum + result.maxScore, 0)
  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
})

const averageRecallTime = computed(() => {
  if (results.value.length === 0) return 0
  const totalTime = results.value.reduce((sum, result) => sum + result.recallTime, 0)
  return (totalTime / results.value.length).toFixed(1)
})

const finalScore = computed(() => {
  const accuracyWeight = 0.7
  const speedWeight = 0.3
  const maxTime = 30
  
  const accuracyScore = overallAccuracy.value
  const speedScore = Math.max(0, 100 - (parseFloat(averageRecallTime.value) / maxTime) * 100)
  
  return Math.round(accuracyScore * accuracyWeight + speedScore * speedWeight)
})

const memoryCapacity = computed(() => {
  const spans = ['numbers', 'words', 'colors', 'shapes'].map(type => getMemorySpan(type))
  return Math.round(spans.reduce((sum, span) => sum + span, 0) / spans.length)
})

const improvementSuggestions = computed(() => {
  const suggestions = []
  
  if (overallAccuracy.value < 70) {
    suggestions.push('建议进行更多的记忆训练，提高记忆准确性')
  }
  
  if (parseFloat(averageRecallTime.value) > 20) {
    suggestions.push('练习快速回忆技巧，提高记忆检索速度')
  }
  
  if (getTypeAccuracy('numbers') < 70) {
    suggestions.push('加强数字记忆训练，可以尝试分组记忆法')
  }
  
  if (getTypeAccuracy('words') < 70) {
    suggestions.push('提高单词记忆能力，可以使用联想记忆法')
  }
  
  suggestions.push('定期进行记忆训练，保持记忆能力')
  
  return suggestions
})

// 方法
const startTest = () => {
  generateQuestions()
  testPhase.value = 'memorizing'
  startMemoryPhase()
}

const generateQuestions = () => {
  const questionTypes = ['numbers', 'words', 'colors', 'shapes']
  const questionCount = 12
  const generatedQuestions = []
  
  for (let i = 0; i < questionCount; i++) {
    const type = questionTypes[i % questionTypes.length]
    const difficulty = props.difficulty
    const itemCount = Math.min(difficultySettings.value.maxItems, 3 + Math.floor(i / 2))
    
    generatedQuestions.push(generateQuestion(type, difficulty, itemCount))
  }
  
  questions.value = generatedQuestions
  generateShapeOptions()
}

const generateQuestion = (type, difficulty, itemCount) => {
  switch (type) {
    case 'numbers':
      return {
        type: 'numbers',
        sequence: generateNumberSequence(itemCount),
        difficulty
      }
    case 'words':
      return {
        type: 'words',
        words: generateWordList(itemCount),
        difficulty
      }
    case 'colors':
      return {
        type: 'colors',
        colors: generateColorSequence(itemCount),
        difficulty
      }
    case 'shapes':
      return {
        type: 'shapes',
        shapes: generateShapeSequence(itemCount),
        difficulty
      }
    default:
      return generateQuestion('numbers', difficulty, itemCount)
  }
}

const generateNumberSequence = (count) => {
  const sequence = []
  for (let i = 0; i < count; i++) {
    sequence.push(Math.floor(Math.random() * 100))
  }
  return sequence
}

const generateWordList = (count) => {
  const words = ['苹果', '香蕉', '橙子', '葡萄', '草莓', '桃子', '梨子', '西瓜', '猫咪', '小狗', '兔子', '鸟儿', '鱼儿', '蝴蝶', '花朵', '树木', '太阳', '月亮', '星星', '云朵']
  const selectedWords = []
  const usedIndices = new Set()
  
  while (selectedWords.length < count && selectedWords.length < words.length) {
    const index = Math.floor(Math.random() * words.length)
    if (!usedIndices.has(index)) {
      usedIndices.add(index)
      selectedWords.push(words[index])
    }
  }
  
  return selectedWords
}

const generateColorSequence = (count) => {
  const sequence = []
  for (let i = 0; i < count; i++) {
    sequence.push(colorOptions[Math.floor(Math.random() * colorOptions.length)])
  }
  return sequence
}

const generateShapeSequence = (count) => {
  const shapes = ['circle', 'square', 'triangle']
  const sequence = []
  
  for (let i = 0; i < count; i++) {
    sequence.push({
      type: shapes[Math.floor(Math.random() * shapes.length)],
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)]
    })
  }
  
  return sequence
}

const generateShapeOptions = () => {
  const shapes = ['circle', 'square', 'triangle']
  const options = []
  
  shapes.forEach(shape => {
    colorOptions.forEach(color => {
      options.push({
        id: `${shape}-${color}`,
        type: shape,
        color: color
      })
    })
  })
  
  shapeOptions.value = options
}

const startMemoryPhase = () => {
  userAnswers.value = new Array(getCurrentItemCount()).fill(null)
  memoryTimeLeft.value = difficultySettings.value.memoryTime
  memoryStartTime.value = Date.now()
  
  memoryTimer.value = setInterval(() => {
    memoryTimeLeft.value--
    if (memoryTimeLeft.value <= 0) {
      endMemoryPhase()
    }
  }, 1000)
}

const endMemoryPhase = () => {
  if (memoryTimer.value) {
    clearInterval(memoryTimer.value)
  }
  testPhase.value = 'waiting'
  startWaitPhase()
}

const startWaitPhase = () => {
  waitTimeLeft.value = difficultySettings.value.waitTime
  
  waitTimer.value = setInterval(() => {
    waitTimeLeft.value--
    if (waitTimeLeft.value <= 0) {
      endWaitPhase()
    }
  }, 1000)
}

const endWaitPhase = () => {
  if (waitTimer.value) {
    clearInterval(waitTimer.value)
  }
  testPhase.value = 'recalling'
  startRecallPhase()
}

const startRecallPhase = () => {
  recallTimeLeft.value = difficultySettings.value.recallTime
  recallStartTime.value = Date.now()
  
  recallTimer.value = setInterval(() => {
    recallTimeLeft.value--
    if (recallTimeLeft.value <= 0) {
      submitRecall()
    }
  }, 1000)
}

const getCurrentItemCount = () => {
  if (!currentQuestion.value) return 0
  
  switch (currentQuestion.value.type) {
    case 'numbers':
      return currentQuestion.value.sequence.length
    case 'words':
      return currentQuestion.value.words.length
    case 'colors':
      return currentQuestion.value.colors.length
    case 'shapes':
      return currentQuestion.value.shapes.length
    default:
      return 0
  }
}

const getRecallPrompt = () => {
  if (!currentQuestion.value) return ''
  
  switch (currentQuestion.value.type) {
    case 'numbers':
      return '请按顺序输入刚才看到的数字:'
    case 'words':
      return '请按顺序输入刚才看到的单词:'
    case 'colors':
      return '请按顺序选择刚才看到的颜色:'
    case 'shapes':
      return '请按顺序选择刚才看到的图形:'
    default:
      return '请回忆刚才看到的内容:'
  }
}

const selectColor = (color) => {
  const emptyIndex = userAnswers.value.findIndex(answer => !answer)
  if (emptyIndex !== -1) {
    userAnswers.value[emptyIndex] = color
  }
}

const removeColor = (index) => {
  userAnswers.value[index] = null
}

const selectShape = (shape) => {
  const emptyIndex = userAnswers.value.findIndex(answer => !answer)
  if (emptyIndex !== -1) {
    userAnswers.value[emptyIndex] = shape
  }
}

const removeShape = (index) => {
  userAnswers.value[index] = null
}

const submitRecall = () => {
  if (recallTimer.value) {
    clearInterval(recallTimer.value)
  }
  
  const memoryTime = (Date.now() - memoryStartTime.value) / 1000
  const recallTime = (Date.now() - recallStartTime.value) / 1000
  
  const result = calculateResult()
  result.memoryTime = memoryTime
  result.recallTime = recallTime
  
  results.value.push(result)
  lastResult.value = result
  
  emit('test-progress', {
    currentQuestion: currentQuestionIndex.value + 1,
    totalQuestions: questions.value.length,
    result
  })
  
  testPhase.value = 'feedback'
}

const calculateResult = () => {
  if (!currentQuestion.value) return { score: 0, maxScore: 0, accuracy: 0, isCorrect: false }
  
  let correctCount = 0
  let totalCount = 0
  
  switch (currentQuestion.value.type) {
    case 'numbers':
      totalCount = currentQuestion.value.sequence.length
      correctCount = userAnswers.value.filter((answer, index) => 
        answer == currentQuestion.value.sequence[index]
      ).length
      break
    case 'words':
      totalCount = currentQuestion.value.words.length
      correctCount = userAnswers.value.filter((answer, index) => 
        answer?.toLowerCase() === currentQuestion.value.words[index]?.toLowerCase()
      ).length
      break
    case 'colors':
      totalCount = currentQuestion.value.colors.length
      correctCount = userAnswers.value.filter((answer, index) => 
        answer === currentQuestion.value.colors[index]
      ).length
      break
    case 'shapes':
      totalCount = currentQuestion.value.shapes.length
      correctCount = userAnswers.value.filter((answer, index) => {
        const correct = currentQuestion.value.shapes[index]
        return answer && answer.type === correct.type && answer.color === correct.color
      }).length
      break
  }
  
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  const score = correctCount * 10
  const maxScore = totalCount * 10
  
  return {
    score,
    maxScore,
    accuracy,
    correctCount,
    totalCount,
    isCorrect: correctCount === totalCount
  }
}

const skipQuestion = () => {
  if (recallTimer.value) {
    clearInterval(recallTimer.value)
  }
  
  const result = {
    score: 0,
    maxScore: getCurrentItemCount() * 10,
    accuracy: 0,
    correctCount: 0,
    totalCount: getCurrentItemCount(),
    isCorrect: false,
    skipped: true,
    memoryTime: 0,
    recallTime: 0
  }
  
  results.value.push(result)
  lastResult.value = result
  
  nextQuestion()
}

const nextQuestion = () => {
  if (isLastQuestion.value) {
    completeTest()
  } else {
    currentQuestionIndex.value++
    testPhase.value = 'memorizing'
    startMemoryPhase()
  }
}

const completeTest = () => {
  testPhase.value = 'results'
  
  emit('test-complete', {
    type: 'short-term-memory',
    results: {
      score: finalScore.value,
      accuracy: overallAccuracy.value,
      averageTime: parseFloat(averageRecallTime.value),
      completedQuestions: results.value.length,
      memoryCapacity: memoryCapacity.value,
      questions: results.value
    }
  })
}

const getTypeLabel = (type) => {
  const labels = {
    numbers: '数字',
    words: '单词',
    colors: '颜色',
    shapes: '图形'
  }
  return labels[type] || type
}

const getTypeAccuracy = (type) => {
  const typeResults = results.value.filter((_, index) => questions.value[index]?.type === type)
  if (typeResults.length === 0) return 0
  
  const totalScore = typeResults.reduce((sum, result) => sum + result.score, 0)
  const maxScore = typeResults.reduce((sum, result) => sum + result.maxScore, 0)
  
  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
}

const getMemorySpan = (type) => {
  const typeResults = results.value.filter((_, index) => questions.value[index]?.type === type)
  if (typeResults.length === 0) return 0
  
  let maxCorrect = 0
  typeResults.forEach((result, index) => {
    if (result.accuracy === 100) {
      maxCorrect = Math.max(maxCorrect, result.totalCount)
    }
  })
  
  return maxCorrect
}

const getPerformanceLevel = (accuracy) => {
  if (accuracy >= 90) return 'excellent'
  if (accuracy >= 80) return 'good'
  if (accuracy >= 70) return 'average'
  return 'poor'
}

const getPerformanceIcon = (accuracy) => {
  if (accuracy >= 90) return '🌟'
  if (accuracy >= 80) return '👍'
  if (accuracy >= 70) return '👌'
  return '💪'
}

const getPerformanceTitle = (accuracy) => {
  if (accuracy >= 90) return '优秀'
  if (accuracy >= 80) return '良好'
  if (accuracy >= 70) return '一般'
  return '需要提高'
}

const getPerformanceDescription = (accuracy) => {
  if (accuracy >= 90) return '您的短期记忆能力非常出色，能够准确记住大量信息。'
  if (accuracy >= 80) return '您的短期记忆能力良好，在大多数情况下能够准确回忆信息。'
  if (accuracy >= 70) return '您的短期记忆能力一般，还有提升的空间。'
  return '您的短期记忆能力需要加强，建议进行更多的记忆训练。'
}

const formatTime = (seconds) => {
  return `${seconds}s`
}

// 生命周期
onMounted(() => {
  // 初始化
})

onUnmounted(() => {
  if (memoryTimer.value) clearInterval(memoryTimer.value)
  if (waitTimer.value) clearInterval(waitTimer.value)
  if (recallTimer.value) clearInterval(recallTimer.value)
})

// 监听难度变化
watch(() => props.difficulty, () => {
  if (testPhase.value === 'instruction') {
    // 重新生成测试数据
  }
})
</script>

<style scoped>
.short-term-memory-test {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.test-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.instruction-phase {
  padding: 2rem;
  text-align: center;
}

.instruction-content h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.instruction-text {
  margin-bottom: 2rem;
  color: #666;
  line-height: 1.6;
}

.instruction-steps {
  display: grid;
  gap: 1rem;
  margin: 2rem 0;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
}

.step-number {
  width: 30px;
  height: 30px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.btn-start {
  padding: 1rem 2rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-start:hover {
  background: var(--color-primary-dark);
}

.memorizing-phase {
  padding: 2rem;
}

.memorizing-header {
  text-align: center;
  margin-bottom: 2rem;
}

.memorizing-header h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.memorizing-timer {
  display: flex;
  justify-content: center;
}

.timer-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-text {
  position: absolute;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-primary);
}

.memory-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.number-sequence {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.memory-number {
  width: 60px;
  height: 60px;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  animation: fadeInScale 0.5s ease-out;
}

.word-list {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.memory-word {
  padding: 1rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  animation: fadeInScale 0.5s ease-out;
}

.color-sequence {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.memory-color {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeInScale 0.5s ease-out;
}

.shape-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.memory-shape {
  animation: fadeInScale 0.5s ease-out;
}

.waiting-phase {
  padding: 3rem;
  text-align: center;
}

.waiting-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.waiting-icon {
  margin-bottom: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.waiting-timer {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary);
}

.recalling-phase {
  padding: 2rem;
}

.recalling-header {
  text-align: center;
  margin-bottom: 2rem;
}

.recalling-header h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.recall-timer {
  font-size: 1.2rem;
  font-weight: bold;
  color: #dc3545;
}

.recall-content {
  margin-bottom: 2rem;
}

.input-sequence {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.number-input {
  width: 60px;
  height: 60px;
  border: 2px solid #ddd;
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
}

.number-input:focus {
  border-color: var(--color-primary);
  outline: none;
}

.word-inputs {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.word-input {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 120px;
}

.word-input:focus {
  border-color: var(--color-primary);
  outline: none;
}

.color-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2rem;
}

.color-option {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.selected-colors {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.selected-color {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 3px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.shape-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2rem;
}

.shape-option {
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shape-option:hover {
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.selected-shapes {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.selected-shape {
  padding: 0.5rem;
  border: 2px solid #333;
  border-radius: 8px;
  cursor: pointer;
  min-width: 50px;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-slot {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #999;
}

.recall-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-submit,
.btn-skip {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-submit {
  background: var(--color-primary);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-skip {
  background: #6c757d;
  color: white;
}

.btn-skip:hover {
  background: #5a6268;
}

.feedback-phase {
  padding: 2rem;
}

.feedback-container {
  text-align: center;
}

.feedback-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.feedback-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.feedback-icon.correct {
  background: #28a745;
  color: white;
}

.feedback-icon.incorrect {
  background: #dc3545;
  color: white;
}

.feedback-text {
  text-align: left;
}

.feedback-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.feedback-score {
  font-size: 1.2rem;
  color: #666;
}

.feedback-details {
  margin-bottom: 2rem;
}

.comparison-section {
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
}

.comparison-item h5 {
  margin-bottom: 0.5rem;
  color: #333;
}

.correct-answer,
.user-answer {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.answer-item {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.answer-item.correct {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.answer-item.incorrect {
  background: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.color-item {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 2px solid #333;
}

.color-item.correct {
  border-color: #28a745;
  border-width: 3px;
}

.color-item.incorrect {
  border-color: #dc3545;
  border-width: 3px;
}

.performance-stats {
  display: grid;
  gap: 0.5rem;
  max-width: 300px;
  margin: 0 auto;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.stat-label {
  font-weight: bold;
  color: #666;
}

.stat-value {
  font-weight: bold;
  color: var(--color-primary);
}

.btn-continue {
  padding: 1rem 2rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-continue:hover {
  background: var(--color-primary-dark);
}

.results-phase {
  padding: 2rem;
}

.results-container h3 {
  text-align: center;
  color: var(--color-primary);
  margin-bottom: 2rem;
}

.overall-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.result-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.result-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary);
}

.result-label {
  color: #666;
  font-size: 0.9rem;
}

.detailed-analysis {
  margin-bottom: 2rem;
}

.detailed-analysis h4 {
  color: #333;
  margin-bottom: 1rem;
}

.analysis-grid {
  display: grid;
  gap: 2rem;
}

.analysis-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.analysis-item h5 {
  color: #333;
  margin-bottom: 1rem;
}

.type-chart {
  display: grid;
  gap: 1rem;
}

.type-bar {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  align-items: center;
  gap: 1rem;
}

.type-label {
  font-weight: bold;
  color: #666;
}

.bar-container {
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  transition: width 0.3s ease;
}

.accuracy-value {
  font-weight: bold;
  color: var(--color-primary);
  text-align: right;
}

.capacity-analysis {
  display: grid;
  gap: 1rem;
}

.capacity-stat {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: white;
  border-radius: 4px;
}

.performance-feedback {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.performance-feedback h4 {
  color: #333;
  margin-bottom: 1rem;
}

.feedback-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.feedback-item.excellent {
  background: #d4edda;
  border: 1px solid #28a745;
}

.feedback-item.good {
  background: #d1ecf1;
  border: 1px solid #17a2b8;
}

.feedback-item.average {
  background: #fff3cd;
  border: 1px solid #ffc107;
}

.feedback-item.poor {
  background: #f8d7da;
  border: 1px solid #dc3545;
}

.improvement-suggestions h5 {
  color: #333;
  margin-bottom: 1rem;
}

.improvement-suggestions ul {
  list-style: none;
  padding: 0;
}

.improvement-suggestions li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.improvement-suggestions li:before {
  content: '💡 ';
  margin-right: 0.5rem;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .short-term-memory-test {
    padding: 0.5rem;
  }
  
  .instruction-phase,
  .memorizing-phase,
  .recalling-phase,
  .feedback-phase,
  .results-phase {
    padding: 1rem;
  }
  
  .overall-results {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .number-sequence,
  .word-list,
  .color-sequence,
  .shape-grid {
    gap: 0.5rem;
  }
  
  .memory-number {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .memory-word {
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }
  
  .memory-color {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .step-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .feedback-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .recall-controls {
    flex-direction: column;
  }
  
  .input-sequence,
  .word-inputs {
    gap: 0.5rem;
  }
  
  .number-input {
    width: 50px;
    height: 50px;
  }
  
  .word-input {
    min-width: 100px;
  }
}
</style>