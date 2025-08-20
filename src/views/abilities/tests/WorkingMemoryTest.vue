<template>
  <div class="working-memory-test">
    <div class="test-container">
      <!-- 测试说明阶段 -->
      <div v-if="testPhase === 'instruction'" class="instruction-phase">
        <div class="instruction-content">
          <h3>工作记忆测试</h3>
          <p class="instruction-text">
            这个测试将评估您的工作记忆能力。您需要在执行其他任务的同时，保持和操作记忆中的信息。
          </p>
          
          <div class="instruction-steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-text">记忆阶段：记住一系列信息</div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-text">处理阶段：完成干扰任务</div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-text">回忆阶段：回忆并操作记忆信息</div>
            </div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-text">评估您的工作记忆容量和效率</div>
            </div>
          </div>
          
          <div class="test-settings">
            <h4>测试设置</h4>
            <div class="settings-grid">
              <div class="setting-item">
                <label>难度等级:</label>
                <span>{{ difficultyLabel }}</span>
              </div>
              <div class="setting-item">
                <label>题目数量:</label>
                <span>{{ difficultySettings.questionCount }}题</span>
              </div>
              <div class="setting-item">
                <label>记忆容量:</label>
                <span>{{ difficultySettings.memorySpan }}项</span>
              </div>
              <div class="setting-item">
                <label>测试类型:</label>
                <span>数字、字母、空间</span>
              </div>
            </div>
          </div>
          
          <button @click="startTest" class="btn-start">
            开始测试
          </button>
        </div>
      </div>

      <!-- 记忆阶段 -->
      <div v-if="testPhase === 'memorize'" class="memorize-phase">
        <div class="memorize-header">
          <h4>记忆阶段 - {{ currentTask.title }}</h4>
          <div class="progress-info">
            题目 {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}
          </div>
        </div>
        
        <div class="memorize-content">
          <div class="memorize-instruction">
            <p>{{ currentTask.instruction }}</p>
            <div class="memorize-timer">
              <div class="timer-circle">
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="25" fill="none" stroke="#e0e0e0" stroke-width="4"/>
                  <circle cx="30" cy="30" r="25" fill="none" stroke="var(--color-primary)" 
                          stroke-width="4" stroke-linecap="round"
                          :stroke-dasharray="`${memorizeProgress * 1.57} 157`"
                          transform="rotate(-90 30 30)"/>
                </svg>
                <div class="timer-text">{{ memorizeTimeLeft }}s</div>
              </div>
            </div>
          </div>
          
          <!-- 数字序列记忆 -->
          <div v-if="currentTask.type === 'digit'" class="digit-memorize">
            <div class="sequence-display">
              <div v-for="(digit, index) in currentTask.sequence" 
                   :key="index" 
                   class="digit-item"
                   :style="{ animationDelay: index * 0.5 + 's' }">
                {{ digit }}
              </div>
            </div>
          </div>
          
          <!-- 字母序列记忆 -->
          <div v-else-if="currentTask.type === 'letter'" class="letter-memorize">
            <div class="sequence-display">
              <div v-for="(letter, index) in currentTask.sequence" 
                   :key="index" 
                   class="letter-item"
                   :style="{ animationDelay: index * 0.5 + 's' }">
                {{ letter }}
              </div>
            </div>
          </div>
          
          <!-- 空间位置记忆 -->
          <div v-else-if="currentTask.type === 'spatial'" class="spatial-memorize">
            <div class="spatial-grid">
              <div v-for="(cell, index) in spatialGrid" 
                   :key="index" 
                   class="spatial-cell"
                   :class="{ 
                     active: cell.isActive,
                     highlighted: cell.isHighlighted 
                   }"
                   :style="{ animationDelay: cell.delay + 's' }">
              </div>
            </div>
          </div>
          
          <!-- 颜色序列记忆 -->
          <div v-else-if="currentTask.type === 'color'" class="color-memorize">
            <div class="color-sequence">
              <div v-for="(color, index) in currentTask.sequence" 
                   :key="index" 
                   class="color-item"
                   :style="{ 
                     backgroundColor: color,
                     animationDelay: index * 0.5 + 's' 
                   }">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 处理阶段 -->
      <div v-if="testPhase === 'processing'" class="processing-phase">
        <div class="processing-header">
          <h4>处理任务</h4>
          <div class="processing-timer">
            ⏱️ {{ processingTimeLeft }}秒
          </div>
        </div>
        
        <div class="processing-content">
          <div class="processing-task">
            <h5>{{ currentProcessingTask.title }}</h5>
            <p>{{ currentProcessingTask.instruction }}</p>
            
            <!-- 数学运算处理 -->
            <div v-if="currentProcessingTask.type === 'math'" class="math-processing">
              <div class="math-problem">
                <span class="problem-text">{{ currentProcessingTask.problem }}</span>
                <div class="answer-options">
                  <button v-for="option in currentProcessingTask.options" 
                          :key="option"
                          @click="submitProcessingAnswer(option)"
                          class="option-btn">
                    {{ option }}
                  </button>
                </div>
              </div>
              <div class="processing-score">
                已完成: {{ processingScore }} / {{ processingTarget }}
              </div>
            </div>
            
            <!-- 判断任务处理 -->
            <div v-else-if="currentProcessingTask.type === 'judgment'" class="judgment-processing">
              <div class="judgment-task">
                <div class="judgment-statement">
                  {{ currentProcessingTask.statement }}
                </div>
                <div class="judgment-options">
                  <button @click="submitProcessingAnswer(true)" class="judgment-btn true">
                    正确
                  </button>
                  <button @click="submitProcessingAnswer(false)" class="judgment-btn false">
                    错误
                  </button>
                </div>
              </div>
              <div class="processing-score">
                已完成: {{ processingScore }} / {{ processingTarget }}
              </div>
            </div>
            
            <!-- 分类任务处理 -->
            <div v-else-if="currentProcessingTask.type === 'categorize'" class="categorize-processing">
              <div class="categorize-task">
                <div class="item-to-categorize">
                  {{ currentProcessingTask.item }}
                </div>
                <div class="category-options">
                  <button v-for="category in currentProcessingTask.categories" 
                          :key="category"
                          @click="submitProcessingAnswer(category)"
                          class="category-btn">
                    {{ category }}
                  </button>
                </div>
              </div>
              <div class="processing-score">
                已完成: {{ processingScore }} / {{ processingTarget }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 回忆阶段 -->
      <div v-if="testPhase === 'recall'" class="recall-phase">
        <div class="recall-header">
          <h4>回忆阶段 - {{ currentTask.title }}</h4>
          <div class="recall-instruction">
            {{ currentTask.recallInstruction }}
          </div>
        </div>
        
        <div class="recall-content">
          <!-- 数字序列回忆 -->
          <div v-if="currentTask.type === 'digit'" class="digit-recall">
            <div class="recall-input-area">
              <div class="input-instruction">
                请按{{ currentTask.recallOrder === 'forward' ? '正序' : '倒序' }}输入数字序列：
              </div>
              <div class="digit-inputs">
                <input v-for="(input, index) in digitInputs" 
                       :key="index"
                       v-model="digitInputs[index]"
                       type="text"
                       maxlength="1"
                       class="digit-input"
                       @input="handleDigitInput(index, $event)"
                       @keydown="handleDigitKeydown(index, $event)">
              </div>
            </div>
          </div>
          
          <!-- 字母序列回忆 -->
          <div v-else-if="currentTask.type === 'letter'" class="letter-recall">
            <div class="recall-input-area">
              <div class="input-instruction">
                请按{{ currentTask.recallOrder === 'forward' ? '正序' : '倒序' }}输入字母序列：
              </div>
              <div class="letter-inputs">
                <input v-for="(input, index) in letterInputs" 
                       :key="index"
                       v-model="letterInputs[index]"
                       type="text"
                       maxlength="1"
                       class="letter-input"
                       @input="handleLetterInput(index, $event)"
                       @keydown="handleLetterKeydown(index, $event)">
              </div>
            </div>
          </div>
          
          <!-- 空间位置回忆 -->
          <div v-else-if="currentTask.type === 'spatial'" class="spatial-recall">
            <div class="recall-input-area">
              <div class="input-instruction">
                请按{{ currentTask.recallOrder === 'forward' ? '出现顺序' : '相反顺序' }}点击方格：
              </div>
              <div class="spatial-recall-grid">
                <div v-for="(cell, index) in spatialRecallGrid" 
                     :key="index" 
                     class="spatial-recall-cell"
                     :class="{ 
                       selected: cell.isSelected,
                       correct: cell.isCorrect,
                       incorrect: cell.isIncorrect 
                     }"
                     @click="handleSpatialClick(index)">
                  <span v-if="cell.order > 0" class="cell-order">{{ cell.order }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 颜色序列回忆 -->
          <div v-else-if="currentTask.type === 'color'" class="color-recall">
            <div class="recall-input-area">
              <div class="input-instruction">
                请按{{ currentTask.recallOrder === 'forward' ? '正序' : '倒序' }}选择颜色：
              </div>
              <div class="color-options">
                <div v-for="color in colorOptions" 
                     :key="color"
                     class="color-option"
                     :style="{ backgroundColor: color }"
                     :class="{ selected: selectedColors.includes(color) }"
                     @click="handleColorSelect(color)">
                  <span v-if="selectedColors.includes(color)" class="color-order">
                    {{ selectedColors.indexOf(color) + 1 }}
                  </span>
                </div>
              </div>
              <div class="selected-sequence">
                <div class="sequence-label">已选择的序列：</div>
                <div class="selected-colors">
                  <div v-for="(color, index) in selectedColors" 
                       :key="index"
                       class="selected-color"
                       :style="{ backgroundColor: color }">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="recall-controls">
          <button @click="submitRecall" 
                  class="btn-submit" 
                  :disabled="!canSubmitRecall">
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
                {{ lastResult.isCorrect ? '回答正确！' : '回答错误' }}
              </div>
              <div class="feedback-score">
                得分: {{ lastResult.score }} / {{ lastResult.maxScore }}
              </div>
            </div>
          </div>
          
          <div class="feedback-details">
            <div class="sequence-comparison">
              <div class="correct-sequence">
                <h5>正确序列:</h5>
                <div class="sequence-display">
                  <div v-for="(item, index) in lastResult.correctSequence" 
                       :key="index" 
                       class="sequence-item correct">
                    {{ item }}
                  </div>
                </div>
              </div>
              <div class="user-sequence">
                <h5>您的答案:</h5>
                <div class="sequence-display">
                  <div v-for="(item, index) in lastResult.userSequence" 
                       :key="index" 
                       class="sequence-item"
                       :class="{ 
                         correct: item === lastResult.correctSequence[index],
                         incorrect: item !== lastResult.correctSequence[index] && item !== '' 
                       }">
                    {{ item || '空' }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="performance-stats">
              <div class="stat-item">
                <span class="stat-label">记忆准确率:</span>
                <span class="stat-value">{{ lastResult.memoryAccuracy }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">处理任务得分:</span>
                <span class="stat-value">{{ lastResult.processingScore }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">反应时间:</span>
                <span class="stat-value">{{ lastResult.responseTime }}ms</span>
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
          <h3>工作记忆测试结果</h3>
          
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
                <div class="result-value">{{ workingMemorySpan }}</div>
                <div class="result-label">工作记忆广度</div>
              </div>
            </div>
            
            <div class="result-card">
              <div class="result-icon">🎯</div>
              <div class="result-content">
                <div class="result-value">{{ finalScore }}</div>
                <div class="result-label">综合得分</div>
              </div>
            </div>
            
            <div class="result-card">
              <div class="result-icon">⏱️</div>
              <div class="result-content">
                <div class="result-value">{{ averageResponseTime }}ms</div>
                <div class="result-label">平均反应时间</div>
              </div>
            </div>
          </div>
          
          <div class="detailed-analysis">
            <h4>详细分析</h4>
            <div class="analysis-grid">
              <div class="analysis-item">
                <h5>任务类型表现</h5>
                <div class="task-chart">
                  <div v-for="type in ['digit', 'letter', 'spatial', 'color']" :key="type" class="task-bar">
                    <span class="task-label">{{ getTaskTypeLabel(type) }}</span>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: getTaskTypeAccuracy(type) + '%' }"></div>
                    </div>
                    <span class="accuracy-value">{{ getTaskTypeAccuracy(type) }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="analysis-item">
                <h5>记忆广度分析</h5>
                <div class="span-analysis">
                  <div class="span-chart">
                    <div v-for="span in spanPerformance" :key="span.length" class="span-bar">
                      <span class="span-label">{{ span.length }}项</span>
                      <div class="bar-container">
                        <div class="bar-fill" :style="{ width: span.accuracy + '%' }"></div>
                      </div>
                      <span class="accuracy-value">{{ span.accuracy }}%</span>
                    </div>
                  </div>
                  <div class="span-summary">
                    <div class="summary-item">
                      <span class="summary-label">最大广度:</span>
                      <span class="summary-value">{{ maxSpan }}项</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">平均广度:</span>
                      <span class="summary-value">{{ averageSpan }}项</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="analysis-item">
                <h5>处理效率分析</h5>
                <div class="efficiency-analysis">
                  <div class="efficiency-metrics">
                    <div class="metric-item">
                      <span class="metric-label">双任务干扰:</span>
                      <span class="metric-value">{{ dualTaskInterference }}%</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">处理准确率:</span>
                      <span class="metric-value">{{ processingAccuracy }}%</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">认知负荷:</span>
                      <span class="metric-value">{{ cognitiveLoad }}</span>
                    </div>
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
const testPhase = ref('instruction') // instruction, memorize, processing, recall, feedback, results
const currentQuestionIndex = ref(0)
const tasks = ref([])
const results = ref([])
const lastResult = ref({})
const memorizeTimeLeft = ref(0)
const processingTimeLeft = ref(0)
const memorizeTimer = ref(null)
const processingTimer = ref(null)
const startTime = ref(0)

// 记忆阶段数据
const spatialGrid = ref([])
const spatialRecallGrid = ref([])
const digitInputs = ref([])
const letterInputs = ref([])
const selectedColors = ref([])
const colorOptions = ref(['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'])
const spatialClickOrder = ref([])

// 处理阶段数据
const currentProcessingTask = ref({})
const processingScore = ref(0)
const processingTarget = ref(5)
const processingTaskIndex = ref(0)

// 计算属性
const difficultySettings = computed(() => {
  const settings = {
    easy: { questionCount: 8, memorySpan: 4, memorizeTime: 3000, processingTime: 30 },
    medium: { questionCount: 12, memorySpan: 6, memorizeTime: 2500, processingTime: 45 },
    hard: { questionCount: 16, memorySpan: 8, memorizeTime: 2000, processingTime: 60 }
  }
  return settings[props.difficulty] || settings.medium
})

const difficultyLabel = computed(() => {
  const labels = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labels[props.difficulty] || '中等'
})

const totalQuestions = computed(() => difficultySettings.value.questionCount)

const currentTask = computed(() => tasks.value[currentQuestionIndex.value])

const memorizeProgress = computed(() => {
  if (!currentTask.value) return 0
  const totalTime = difficultySettings.value.memorizeTime / 1000
  return ((totalTime - memorizeTimeLeft.value) / totalTime) * 100
})

const canSubmitRecall = computed(() => {
  if (!currentTask.value) return false
  
  switch (currentTask.value.type) {
    case 'digit':
      return digitInputs.value.every(input => input !== '')
    case 'letter':
      return letterInputs.value.every(input => input !== '')
    case 'spatial':
      return spatialClickOrder.value.length === currentTask.value.sequence.length
    case 'color':
      return selectedColors.value.length === currentTask.value.sequence.length
    default:
      return false
  }
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value >= totalQuestions.value - 1
})

const overallAccuracy = computed(() => {
  if (results.value.length === 0) return 0
  const totalScore = results.value.reduce((sum, result) => sum + result.score, 0)
  const maxScore = results.value.reduce((sum, result) => sum + result.maxScore, 0)
  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
})

const workingMemorySpan = computed(() => {
  // 计算工作记忆广度（最大能正确回忆的序列长度）
  let maxSpan = 0
  results.value.forEach(result => {
    if (result.isCorrect && result.sequenceLength > maxSpan) {
      maxSpan = result.sequenceLength
    }
  })
  return maxSpan
})

const finalScore = computed(() => {
  const accuracyWeight = 0.4
  const spanWeight = 0.3
  const speedWeight = 0.2
  const processingWeight = 0.1
  
  const spanScore = (workingMemorySpan.value / difficultySettings.value.memorySpan) * 100
  const speedScore = Math.max(0, 100 - (averageResponseTime.value - 1000) / 50)
  const processingScore = processingAccuracy.value
  
  return Math.round(
    overallAccuracy.value * accuracyWeight +
    spanScore * spanWeight +
    speedScore * speedWeight +
    processingScore * processingWeight
  )
})

const averageResponseTime = computed(() => {
  if (results.value.length === 0) return 0
  const totalTime = results.value.reduce((sum, result) => sum + result.responseTime, 0)
  return Math.round(totalTime / results.value.length)
})

const spanPerformance = computed(() => {
  const spanData = {}
  
  results.value.forEach(result => {
    const length = result.sequenceLength
    if (!spanData[length]) {
      spanData[length] = { correct: 0, total: 0 }
    }
    spanData[length].total++
    if (result.isCorrect) {
      spanData[length].correct++
    }
  })
  
  return Object.keys(spanData).map(length => ({
    length: parseInt(length),
    accuracy: Math.round((spanData[length].correct / spanData[length].total) * 100)
  })).sort((a, b) => a.length - b.length)
})

const maxSpan = computed(() => {
  return Math.max(...spanPerformance.value.map(span => span.length))
})

const averageSpan = computed(() => {
  if (spanPerformance.value.length === 0) return 0
  const totalSpan = spanPerformance.value.reduce((sum, span) => sum + span.length, 0)
  return Math.round(totalSpan / spanPerformance.value.length * 10) / 10
})

const dualTaskInterference = computed(() => {
  // 计算双任务干扰程度（处理任务对记忆任务的影响）
  const memoryOnlyAccuracy = 95 // 假设单纯记忆任务的准确率
  return Math.max(0, memoryOnlyAccuracy - overallAccuracy.value)
})

const processingAccuracy = computed(() => {
  if (results.value.length === 0) return 0
  const totalProcessingScore = results.value.reduce((sum, result) => sum + (result.processingScore || 0), 0)
  const maxProcessingScore = results.value.length * processingTarget.value
  return maxProcessingScore > 0 ? Math.round((totalProcessingScore / maxProcessingScore) * 100) : 0
})

const cognitiveLoad = computed(() => {
  const load = Math.round((100 - overallAccuracy.value + dualTaskInterference.value) / 20)
  if (load <= 1) return '低'
  if (load <= 3) return '中'
  return '高'
})

const improvementSuggestions = computed(() => {
  const suggestions = []
  
  if (overallAccuracy.value < 70) {
    suggestions.push('建议进行更多的工作记忆训练，提高记忆容量')
  }
  
  if (workingMemorySpan.value < difficultySettings.value.memorySpan * 0.7) {
    suggestions.push('加强记忆广度训练，逐步增加记忆项目数量')
  }
  
  if (dualTaskInterference.value > 20) {
    suggestions.push('练习在干扰条件下保持注意力和记忆')
  }
  
  if (averageResponseTime.value > 3000) {
    suggestions.push('提高信息处理速度，减少反应时间')
  }
  
  if (getTaskTypeAccuracy('spatial') < 70) {
    suggestions.push('加强空间工作记忆训练')
  }
  
  if (processingAccuracy.value < 70) {
    suggestions.push('提高在记忆负荷下的信息处理能力')
  }
  
  suggestions.push('定期进行工作记忆训练，保持认知灵活性')
  
  return suggestions
})

// 方法
const startTest = () => {
  generateTasks()
  currentQuestionIndex.value = 0
  testPhase.value = 'memorize'
  startMemorizePhase()
}

const generateTasks = () => {
  const taskTypes = ['digit', 'letter', 'spatial', 'color']
  const generatedTasks = []
  
  for (let i = 0; i < totalQuestions.value; i++) {
    const taskType = taskTypes[i % taskTypes.length]
    const sequenceLength = Math.min(
      difficultySettings.value.memorySpan,
      Math.floor(i / 4) + 3 // 逐渐增加难度
    )
    
    generatedTasks.push(generateTask(taskType, sequenceLength))
  }
  
  tasks.value = generatedTasks
}

const generateTask = (type, length) => {
  const recallOrder = Math.random() > 0.5 ? 'forward' : 'backward'
  
  switch (type) {
    case 'digit':
      return {
        type: 'digit',
        title: '数字序列',
        instruction: '请记住以下数字序列',
        recallInstruction: `请${recallOrder === 'forward' ? '正序' : '倒序'}输入数字`,
        sequence: generateDigitSequence(length),
        recallOrder,
        sequenceLength: length
      }
    case 'letter':
      return {
        type: 'letter',
        title: '字母序列',
        instruction: '请记住以下字母序列',
        recallInstruction: `请${recallOrder === 'forward' ? '正序' : '倒序'}输入字母`,
        sequence: generateLetterSequence(length),
        recallOrder,
        sequenceLength: length
      }
    case 'spatial':
      return {
        type: 'spatial',
        title: '空间位置',
        instruction: '请记住方格的闪烁顺序',
        recallInstruction: `请按${recallOrder === 'forward' ? '出现顺序' : '相反顺序'}点击方格`,
        sequence: generateSpatialSequence(length),
        recallOrder,
        sequenceLength: length
      }
    case 'color':
      return {
        type: 'color',
        title: '颜色序列',
        instruction: '请记住颜色出现的顺序',
        recallInstruction: `请${recallOrder === 'forward' ? '正序' : '倒序'}选择颜色`,
        sequence: generateColorSequence(length),
        recallOrder,
        sequenceLength: length
      }
    default:
      return null
  }
}

const generateDigitSequence = (length) => {
  const sequence = []
  for (let i = 0; i < length; i++) {
    sequence.push(Math.floor(Math.random() * 10))
  }
  return sequence
}

const generateLetterSequence = (length) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const sequence = []
  for (let i = 0; i < length; i++) {
    sequence.push(letters[Math.floor(Math.random() * letters.length)])
  }
  return sequence
}

const generateSpatialSequence = (length) => {
  const positions = []
  const usedPositions = new Set()
  
  while (positions.length < length) {
    const position = Math.floor(Math.random() * 16) // 4x4网格
    if (!usedPositions.has(position)) {
      positions.push(position)
      usedPositions.add(position)
    }
  }
  
  return positions
}

const generateColorSequence = (length) => {
  const sequence = []
  for (let i = 0; i < length; i++) {
    sequence.push(colorOptions.value[Math.floor(Math.random() * colorOptions.value.length)])
  }
  return sequence
}

const startMemorizePhase = () => {
  memorizeTimeLeft.value = difficultySettings.value.memorizeTime / 1000
  
  // 初始化显示数据
  if (currentTask.value.type === 'spatial') {
    initializeSpatialGrid()
  }
  
  memorizeTimer.value = setInterval(() => {
    memorizeTimeLeft.value--
    if (memorizeTimeLeft.value <= 0) {
      endMemorizePhase()
    }
  }, 1000)
}

const initializeSpatialGrid = () => {
  spatialGrid.value = Array(16).fill(null).map((_, index) => ({
    isActive: currentTask.value.sequence.includes(index),
    isHighlighted: false,
    delay: currentTask.value.sequence.indexOf(index) * 0.5
  }))
  
  // 按顺序高亮显示
  currentTask.value.sequence.forEach((position, index) => {
    setTimeout(() => {
      if (spatialGrid.value[position]) {
        spatialGrid.value[position].isHighlighted = true
        setTimeout(() => {
          if (spatialGrid.value[position]) {
            spatialGrid.value[position].isHighlighted = false
          }
        }, 800)
      }
    }, index * 500)
  })
}

const endMemorizePhase = () => {
  if (memorizeTimer.value) {
    clearInterval(memorizeTimer.value)
  }
  testPhase.value = 'processing'
  startProcessingPhase()
}

const startProcessingPhase = () => {
  processingTimeLeft.value = difficultySettings.value.processingTime
  processingScore.value = 0
  processingTaskIndex.value = 0
  generateProcessingTask()
  
  processingTimer.value = setInterval(() => {
    processingTimeLeft.value--
    if (processingTimeLeft.value <= 0) {
      endProcessingPhase()
    }
  }, 1000)
}

const generateProcessingTask = () => {
  const taskTypes = ['math', 'judgment', 'categorize']
  const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)]
  
  switch (taskType) {
    case 'math':
      generateMathTask()
      break
    case 'judgment':
      generateJudgmentTask()
      break
    case 'categorize':
      generateCategorizeTask()
      break
  }
}

const generateMathTask = () => {
  const a = Math.floor(Math.random() * 20) + 5
  const b = Math.floor(Math.random() * 20) + 5
  const operations = ['+', '-']
  const operation = operations[Math.floor(Math.random() * operations.length)]
  
  let correctAnswer
  switch (operation) {
    case '+':
      correctAnswer = a + b
      break
    case '-':
      correctAnswer = a - b
      break
  }
  
  const options = [correctAnswer]
  while (options.length < 4) {
    const wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5
    if (!options.includes(wrongAnswer) && wrongAnswer > 0) {
      options.push(wrongAnswer)
    }
  }
  
  currentProcessingTask.value = {
    type: 'math',
    title: '数学运算',
    instruction: '请选择正确答案：',
    problem: `${a} ${operation} ${b} = ?`,
    options: options.sort(() => Math.random() - 0.5),
    correctAnswer
  }
}

const generateJudgmentTask = () => {
  const statements = [
    { text: '北京是中国的首都', correct: true },
    { text: '一年有13个月', correct: false },
    { text: '太阳从东方升起', correct: true },
    { text: '鱼类生活在陆地上', correct: false },
    { text: '水的沸点是100摄氏度', correct: true },
    { text: '一周有8天', correct: false }
  ]
  
  const statement = statements[Math.floor(Math.random() * statements.length)]
  
  currentProcessingTask.value = {
    type: 'judgment',
    title: '判断任务',
    instruction: '请判断以下陈述是否正确：',
    statement: statement.text,
    correctAnswer: statement.correct
  }
}

const generateCategorizeTask = () => {
  const categories = {
    '动物': ['狗', '猫', '鸟', '鱼', '马'],
    '水果': ['苹果', '香蕉', '橙子', '葡萄', '梨'],
    '颜色': ['红色', '蓝色', '绿色', '黄色', '紫色']
  }
  
  const categoryNames = Object.keys(categories)
  const selectedCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)]
  const items = categories[selectedCategory]
  const selectedItem = items[Math.floor(Math.random() * items.length)]
  
  currentProcessingTask.value = {
    type: 'categorize',
    title: '分类任务',
    instruction: '请选择以下项目属于哪个类别：',
    item: selectedItem,
    categories: categoryNames,
    correctAnswer: selectedCategory
  }
}

const submitProcessingAnswer = (answer) => {
  if (answer === currentProcessingTask.value.correctAnswer) {
    processingScore.value++
  }
  
  if (processingScore.value < processingTarget.value && processingTimeLeft.value > 0) {
    generateProcessingTask()
  }
}

const endProcessingPhase = () => {
  if (processingTimer.value) {
    clearInterval(processingTimer.value)
  }
  testPhase.value = 'recall'
  initializeRecallPhase()
}

const initializeRecallPhase = () => {
  startTime.value = Date.now()
  
  // 初始化回忆输入
  switch (currentTask.value.type) {
    case 'digit':
      digitInputs.value = Array(currentTask.value.sequence.length).fill('')
      break
    case 'letter':
      letterInputs.value = Array(currentTask.value.sequence.length).fill('')
      break
    case 'spatial':
      initializeSpatialRecall()
      break
    case 'color':
      selectedColors.value = []
      break
  }
}

const initializeSpatialRecall = () => {
  spatialRecallGrid.value = Array(16).fill(null).map(() => ({
    isSelected: false,
    isCorrect: false,
    isIncorrect: false,
    order: 0
  }))
  spatialClickOrder.value = []
}

const handleDigitInput = (index, event) => {
  const value = event.target.value
  if (/^[0-9]$/.test(value)) {
    digitInputs.value[index] = value
    // 自动跳转到下一个输入框
    if (index < digitInputs.value.length - 1) {
      const nextInput = event.target.parentElement.children[index + 1]
      if (nextInput) nextInput.focus()
    }
  } else {
    event.target.value = ''
  }
}

const handleDigitKeydown = (index, event) => {
  if (event.key === 'Backspace' && digitInputs.value[index] === '' && index > 0) {
    const prevInput = event.target.parentElement.children[index - 1]
    if (prevInput) prevInput.focus()
  }
}

const handleLetterInput = (index, event) => {
  const value = event.target.value.toUpperCase()
  if (/^[A-Z]$/.test(value)) {
    letterInputs.value[index] = value
    // 自动跳转到下一个输入框
    if (index < letterInputs.value.length - 1) {
      const nextInput = event.target.parentElement.children[index + 1]
      if (nextInput) nextInput.focus()
    }
  } else {
    event.target.value = ''
  }
}

const handleLetterKeydown = (index, event) => {
  if (event.key === 'Backspace' && letterInputs.value[index] === '' && index > 0) {
    const prevInput = event.target.parentElement.children[index - 1]
    if (prevInput) prevInput.focus()
  }
}

const handleSpatialClick = (index) => {
  if (spatialRecallGrid.value[index].isSelected) return
  
  spatialClickOrder.value.push(index)
  spatialRecallGrid.value[index].isSelected = true
  spatialRecallGrid.value[index].order = spatialClickOrder.value.length
}

const handleColorSelect = (color) => {
  if (selectedColors.value.includes(color)) {
    // 移除颜色
    const index = selectedColors.value.indexOf(color)
    selectedColors.value.splice(index, 1)
  } else if (selectedColors.value.length < currentTask.value.sequence.length) {
    // 添加颜色
    selectedColors.value.push(color)
  }
}

const submitRecall = () => {
  const responseTime = Date.now() - startTime.value
  const result = calculateResult(responseTime)
  results.value.push(result)
  lastResult.value = result
  
  emit('test-progress', {
    currentQuestion: currentQuestionIndex.value + 1,
    totalQuestions: totalQuestions.value,
    result
  })
  
  testPhase.value = 'feedback'
}

const calculateResult = (responseTime) => {
  const task = currentTask.value
  let userSequence = []
  let correctSequence = [...task.sequence]
  
  // 获取用户输入
  switch (task.type) {
    case 'digit':
      userSequence = digitInputs.value.map(input => parseInt(input) || '')
      break
    case 'letter':
      userSequence = [...letterInputs.value]
      break
    case 'spatial':
      userSequence = [...spatialClickOrder.value]
      break
    case 'color':
      userSequence = [...selectedColors.value]
      break
  }
  
  // 如果是倒序回忆，需要反转正确答案
  if (task.recallOrder === 'backward') {
    correctSequence.reverse()
  }
  
  // 计算准确性
  let correctCount = 0
  const maxLength = Math.max(userSequence.length, correctSequence.length)
  
  for (let i = 0; i < maxLength; i++) {
    if (userSequence[i] === correctSequence[i]) {
      correctCount++
    }
  }
  
  const isCorrect = correctCount === correctSequence.length && userSequence.length === correctSequence.length
  const memoryAccuracy = Math.round((correctCount / correctSequence.length) * 100)
  const score = Math.round((correctCount / correctSequence.length) * 10)
  
  return {
    score,
    maxScore: 10,
    isCorrect,
    userSequence,
    correctSequence,
    memoryAccuracy,
    processingScore: processingScore.value,
    responseTime,
    sequenceLength: task.sequenceLength,
    taskType: task.type
  }
}

const skipQuestion = () => {
  const result = {
    score: 0,
    maxScore: 10,
    isCorrect: false,
    userSequence: [],
    correctSequence: [...currentTask.value.sequence],
    memoryAccuracy: 0,
    processingScore: processingScore.value,
    responseTime: 0,
    sequenceLength: currentTask.value.sequenceLength,
    taskType: currentTask.value.type,
    skipped: true
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
    testPhase.value = 'memorize'
    startMemorizePhase()
  }
}

const completeTest = () => {
  testPhase.value = 'results'
  
  emit('test-complete', {
    type: 'working-memory',
    results: {
      score: finalScore.value,
      accuracy: overallAccuracy.value,
      memorySpan: workingMemorySpan.value,
      averageResponseTime: averageResponseTime.value,
      completedQuestions: results.value.length,
      questions: results.value
    }
  })
}

const getTaskTypeLabel = (type) => {
  const labels = {
    digit: '数字',
    letter: '字母',
    spatial: '空间',
    color: '颜色'
  }
  return labels[type] || type
}

const getTaskTypeAccuracy = (type) => {
  const typeResults = results.value.filter(result => result.taskType === type)
  if (typeResults.length === 0) return 0
  
  const totalScore = typeResults.reduce((sum, result) => sum + result.score, 0)
  const maxScore = typeResults.reduce((sum, result) => sum + result.maxScore, 0)
  
  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
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
  if (accuracy >= 90) return '您的工作记忆能力非常出色，能够在干扰条件下很好地保持和操作信息。'
  if (accuracy >= 80) return '您的工作记忆能力良好，大部分情况下都能有效处理多任务。'
  if (accuracy >= 70) return '您的工作记忆能力一般，在复杂任务中还有提升空间。'
  return '您的工作记忆能力需要加强，建议进行更多的认知训练。'
}

// 生命周期
onMounted(() => {
  // 初始化
})

onUnmounted(() => {
  if (memorizeTimer.value) clearInterval(memorizeTimer.value)
  if (processingTimer.value) clearInterval(processingTimer.value)
})

// 监听难度变化
watch(() => props.difficulty, () => {
  if (testPhase.value === 'instruction') {
    // 重新生成测试数据
  }
})
</script>

<style scoped>
.working-memory-test {
  max-width: 1000px;
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

.test-settings {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
}

.test-settings h4 {
  color: #333;
  margin-bottom: 1rem;
}

.settings-grid {
  display: grid;
  gap: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
}

.setting-item label {
  font-weight: bold;
  color: #666;
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

.memorize-phase {
  padding: 2rem;
}

.memorize-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.memorize-header h4 {
  color: var(--color-primary);
}

.progress-info {
  background: #e3f2fd;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  color: var(--color-primary);
}

.memorize-content {
  text-align: center;
}

.memorize-instruction {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.memorize-instruction p {
  color: #333;
  font-weight: 500;
  margin: 0;
}

.timer-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-text {
  position: absolute;
  font-size: 1rem;
  font-weight: bold;
  color: var(--color-primary);
}

.sequence-display {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.digit-item,
.letter-item {
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
  animation: fadeInScale 0.5s ease forwards;
}

.spatial-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  max-width: 300px;
  margin: 0 auto;
}

.spatial-cell {
  width: 60px;
  height: 60px;
  background: #e0e0e0;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.spatial-cell.highlighted {
  background: var(--color-primary);
  animation: pulse 0.8s ease;
}

.color-sequence {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.color-item {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeInScale 0.5s ease forwards;
}

.processing-phase {
  padding: 2rem;
}

.processing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.processing-header h4 {
  color: var(--color-primary);
}

.processing-timer {
  background: #fff3cd;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  color: #856404;
}

.processing-content {
  text-align: center;
}

.processing-task {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
}

.processing-task h5 {
  color: #333;
  margin-bottom: 1rem;
}

.processing-task p {
  color: #666;
  margin-bottom: 2rem;
}

.math-problem {
  margin-bottom: 1rem;
}

.problem-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
  display: block;
}

.answer-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.option-btn {
  padding: 0.8rem 1.5rem;
  background: white;
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  color: var(--color-primary);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover {
  background: var(--color-primary);
  color: white;
}

.judgment-task {
  margin-bottom: 1rem;
}

.judgment-statement {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.judgment-options {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.judgment-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.judgment-btn.true {
  background: #d4edda;
  color: #155724;
}

.judgment-btn.true:hover {
  background: #c3e6cb;
}

.judgment-btn.false {
  background: #f8d7da;
  color: #721c24;
}

.judgment-btn.false:hover {
  background: #f5c6cb;
}

.categorize-task {
  margin-bottom: 1rem;
}

.item-to-categorize {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 2px solid var(--color-primary);
}

.category-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.8rem 1.5rem;
  background: white;
  border: 2px solid #6c757d;
  border-radius: 8px;
  color: #6c757d;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn:hover {
  background: #6c757d;
  color: white;
}

.processing-score {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #e3f2fd;
  border-radius: 20px;
  color: var(--color-primary);
  font-weight: bold;
  display: inline-block;
}

.recall-phase {
  padding: 2rem;
}

.recall-header {
  text-align: center;
  margin-bottom: 2rem;
}

.recall-header h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.recall-instruction {
  color: #666;
  font-size: 1.1rem;
}

.recall-content {
  margin-bottom: 2rem;
}

.recall-input-area {
  text-align: center;
}

.input-instruction {
  margin-bottom: 2rem;
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
}

.digit-inputs,
.letter-inputs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.digit-input,
.letter-input {
  width: 50px;
  height: 50px;
  border: 2px solid #ddd;
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  transition: border-color 0.2s ease;
}

.digit-input:focus,
.letter-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.spatial-recall-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  max-width: 300px;
  margin: 0 auto;
}

.spatial-recall-cell {
  width: 60px;
  height: 60px;
  background: #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.spatial-recall-cell:hover {
  background: #d0d0d0;
}

.spatial-recall-cell.selected {
  background: var(--color-primary);
  color: white;
}

.spatial-recall-cell.correct {
  background: #28a745;
}

.spatial-recall-cell.incorrect {
  background: #dc3545;
}

.cell-order {
  font-weight: bold;
  font-size: 0.9rem;
}

.color-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.color-option {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 3px solid #ddd;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.color-option:hover {
  border-color: #999;
  transform: scale(1.05);
}

.color-option.selected {
  border-color: var(--color-primary);
  border-width: 4px;
}

.color-order {
  background: white;
  color: #333;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

.selected-sequence {
  text-align: center;
}

.sequence-label {
  margin-bottom: 1rem;
  color: #666;
  font-weight: 500;
}

.selected-colors {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.selected-color {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 2px solid #ddd;
}

.recall-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-submit {
  padding: 1rem 2rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-skip {
  padding: 1rem 2rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-skip:hover {
  background: #5a6268;
}

.feedback-phase {
  padding: 2rem;
  text-align: center;
}

.feedback-container {
  max-width: 600px;
  margin: 0 auto;
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
  background: #d4edda;
  color: #155724;
}

.feedback-icon.incorrect {
  background: #f8d7da;
  color: #721c24;
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
  color: #666;
  font-size: 1.1rem;
}

.feedback-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.sequence-comparison {
  margin-bottom: 1.5rem;
}

.correct-sequence,
.user-sequence {
  margin-bottom: 1rem;
}

.correct-sequence h5,
.user-sequence h5 {
  color: #333;
  margin-bottom: 0.5rem;
  text-align: left;
}

.sequence-display {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sequence-item {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 2px solid #ddd;
}

.sequence-item.correct {
  background: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.sequence-item.incorrect {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

.performance-stats {
  display: grid;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
}

.stat-label {
  color: #666;
  font-weight: 500;
}

.stat-value {
  color: var(--color-primary);
  font-weight: bold;
}

.btn-continue {
  padding: 1rem 2rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
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

.results-container {
  max-width: 800px;
  margin: 0 auto;
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
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.result-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.result-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
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
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.analysis-item h5 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.task-chart,
.span-chart {
  display: grid;
  gap: 0.5rem;
}

.task-bar,
.span-bar {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  align-items: center;
  gap: 1rem;
}

.task-label,
.span-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.bar-container {
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  border-radius: 10px;
  transition: width 0.5s ease;
}

.accuracy-value {
  font-size: 0.9rem;
  color: var(--color-primary);
  font-weight: bold;
  text-align: right;
}

.span-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.summary-label {
  color: #666;
  font-weight: 500;
}

.summary-value {
  color: var(--color-primary);
  font-weight: bold;
}

.efficiency-metrics {
  display: grid;
  gap: 1rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.metric-label {
  color: #666;
  font-weight: 500;
}

.metric-value {
  color: var(--color-primary);
  font-weight: bold;
}

.performance-feedback {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
}

.feedback-item.good {
  background: #d1ecf1;
}

.feedback-item.average {
  background: #fff3cd;
}

.feedback-item.poor {
  background: #f8d7da;
}

.feedback-item .feedback-icon {
  font-size: 2rem;
}

.feedback-item .feedback-text {
  flex: 1;
}

.feedback-item .feedback-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.feedback-item .feedback-description {
  color: #666;
  line-height: 1.4;
}

.improvement-suggestions {
  margin-top: 1rem;
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
  border-bottom: 1px solid #e0e0e0;
  color: #666;
  line-height: 1.4;
}

.improvement-suggestions li:last-child {
  border-bottom: none;
}

.improvement-suggestions li:before {
  content: '💡';
  margin-right: 0.5rem;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@media (max-width: 768px) {
  .working-memory-test {
    padding: 0.5rem;
  }
  
  .instruction-phase,
  .memorize-phase,
  .processing-phase,
  .recall-phase,
  .feedback-phase,
  .results-phase {
    padding: 1rem;
  }
  
  .overall-results {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .result-card {
    padding: 1rem;
  }
  
  .result-value {
    font-size: 1.5rem;
  }
  
  .analysis-grid {
    gap: 1rem;
  }
  
  .task-bar,
  .span-bar {
    grid-template-columns: 60px 1fr 50px;
    gap: 0.5rem;
  }
  
  .spatial-grid,
  .spatial-recall-grid {
    max-width: 250px;
  }
  
  .spatial-cell,
  .spatial-recall-cell {
    width: 50px;
    height: 50px;
  }
  
  .digit-item,
  .letter-item {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .color-item,
  .color-option {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .instruction-steps {
    gap: 0.5rem;
  }
  
  .step-item {
    padding: 0.8rem;
    gap: 0.8rem;
  }
  
  .step-number {
    width: 25px;
    height: 25px;
    font-size: 0.9rem;
  }
  
  .settings-grid {
    gap: 0.5rem;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .overall-results {
    grid-template-columns: 1fr;
  }
  
  .feedback-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .feedback-text {
    text-align: center;
  }
  
  .sequence-display {
    gap: 0.3rem;
  }
  
  .sequence-item {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
  
  .digit-inputs,
  .letter-inputs {
    gap: 0.3rem;
  }
  
  .digit-input,
  .letter-input {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .spatial-grid,
  .spatial-recall-grid {
    max-width: 200px;
    gap: 0.3rem;
  }
  
  .spatial-cell,
  .spatial-recall-cell {
    width: 40px;
    height: 40px;
  }
  
  .color-options {
    gap: 0.5rem;
  }
  
  .color-option {
    width: 45px;
    height: 45px;
  }
  
  .selected-colors {
    gap: 0.3rem;
  }
  
  .selected-color {
    width: 35px;
    height: 35px;
  }
}
</style>