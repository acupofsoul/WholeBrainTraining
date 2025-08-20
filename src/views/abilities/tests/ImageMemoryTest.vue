<template>
  <div class="image-memory-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase">
      <div class="instruction-content">
        <h3>图像记忆测试</h3>
        <p class="instruction-description">
          这是一个测试您图像记忆能力的测试。您需要记住显示的图像序列，然后从选项中选择正确的图像。
        </p>
        
        <div class="instruction-steps">
          <div class="step-item">
            <div class="step-icon">👁️</div>
            <div class="step-content">
              <h4>观察记忆</h4>
              <p>仔细观察屏幕上显示的图像序列</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-icon">🧠</div>
            <div class="step-content">
              <h4>记忆保持</h4>
              <p>在图像消失后，努力记住图像的细节和顺序</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-icon">🎯</div>
            <div class="step-content">
              <h4>准确选择</h4>
              <p>从选项中选择正确的图像或顺序</p>
            </div>
          </div>
        </div>
        
        <div class="test-settings">
          <div class="setting-group">
            <label>难度等级：</label>
            <select v-model="selectedDifficulty">
              <option value="easy">简单 (2-3张图)</option>
              <option value="medium">中等 (4-5张图)</option>
              <option value="hard">困难 (6-8张图)</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label>测试类型：</label>
            <select v-model="selectedTestType">
              <option value="sequence">序列记忆</option>
              <option value="position">位置记忆</option>
              <option value="detail">细节记忆</option>
              <option value="change">变化检测</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label>显示时间：</label>
            <select v-model="selectedDisplayTime">
              <option value="2000">2秒</option>
              <option value="3000">3秒</option>
              <option value="5000">5秒</option>
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
          <h3>图像记忆测试</h3>
          <div class="test-stats">
            <span class="current-question">第 {{ currentQuestionIndex + 1 }} / {{ totalQuestions }} 题</span>
            <span class="test-type">{{ getTestTypeLabel(selectedTestType) }}</span>
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
      
      <!-- 显示图像阶段 -->
      <div v-if="testState === 'display'" class="display-phase">
        <div class="display-container">
          <div class="phase-title">请记住以下图像{{ selectedTestType === 'sequence' ? '序列' : '' }}</div>
          
          <!-- 序列记忆显示 -->
          <div v-if="selectedTestType === 'sequence'" class="sequence-display">
            <div 
              v-for="(image, index) in currentImages" 
              :key="index"
              class="image-item"
              :style="{ animationDelay: index * 0.3 + 's' }"
            >
              <div class="image-container">
                <div class="image-placeholder" :style="{ backgroundColor: image.color }">
                  <div class="image-shape" :class="image.shape"></div>
                  <div class="image-number">{{ index + 1 }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 位置记忆显示 -->
          <div v-if="selectedTestType === 'position'" class="position-display">
            <div class="grid-container">
              <div 
                v-for="(cell, index) in gridCells" 
                :key="index"
                class="grid-cell"
                :class="{ active: cell.hasImage }"
              >
                <div v-if="cell.hasImage" class="cell-image" :style="{ backgroundColor: cell.color }">
                  <div class="image-shape" :class="cell.shape"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 细节记忆显示 -->
          <div v-if="selectedTestType === 'detail'" class="detail-display">
            <div class="detail-image">
              <div class="complex-image" :style="{ backgroundColor: currentDetailImage.backgroundColor }">
                <div 
                  v-for="(element, index) in currentDetailImage.elements" 
                  :key="index"
                  class="image-element"
                  :style="{
                    backgroundColor: element.color,
                    left: element.x + '%',
                    top: element.y + '%',
                    width: element.size + 'px',
                    height: element.size + 'px'
                  }"
                  :class="element.shape"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- 变化检测显示 -->
          <div v-if="selectedTestType === 'change'" class="change-display">
            <div class="change-image">
              <div class="image-grid">
                <div 
                  v-for="(item, index) in currentChangeImage" 
                  :key="index"
                  class="change-item"
                  :style="{ backgroundColor: item.color }"
                >
                  <div class="image-shape" :class="item.shape"></div>
                </div>
              </div>
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
      
      <!-- 选择阶段 -->
      <div v-if="testState === 'selection'" class="selection-phase">
        <div class="selection-container">
          <div class="phase-title">{{ getSelectionTitle() }}</div>
          
          <!-- 序列记忆选择 -->
          <div v-if="selectedTestType === 'sequence'" class="sequence-selection">
            <div class="selection-grid">
              <div 
                v-for="(option, index) in selectionOptions" 
                :key="index"
                class="option-item"
                :class="{ selected: selectedOption === index }"
                @click="selectOption(index)"
              >
                <div class="option-sequence">
                  <div 
                    v-for="(image, imgIndex) in option" 
                    :key="imgIndex"
                    class="mini-image"
                    :style="{ backgroundColor: image.color }"
                  >
                    <div class="image-shape" :class="image.shape"></div>
                  </div>
                </div>
                <div class="option-label">选项 {{ String.fromCharCode(65 + index) }}</div>
              </div>
            </div>
          </div>
          
          <!-- 位置记忆选择 -->
          <div v-if="selectedTestType === 'position'" class="position-selection">
            <div class="selection-instruction">点击您记住的图像位置</div>
            <div class="interactive-grid">
              <div 
                v-for="(cell, index) in interactiveGrid" 
                :key="index"
                class="interactive-cell"
                :class="{ selected: cell.selected }"
                @click="toggleGridCell(index)"
              >
                <div class="cell-number">{{ index + 1 }}</div>
              </div>
            </div>
          </div>
          
          <!-- 细节记忆选择 -->
          <div v-if="selectedTestType === 'detail'" class="detail-selection">
            <div class="detail-options">
              <div 
                v-for="(option, index) in detailOptions" 
                :key="index"
                class="detail-option"
                :class="{ selected: selectedOption === index }"
                @click="selectOption(index)"
              >
                <div class="option-image" :style="{ backgroundColor: option.backgroundColor }">
                  <div 
                    v-for="(element, elemIndex) in option.elements" 
                    :key="elemIndex"
                    class="image-element"
                    :style="{
                      backgroundColor: element.color,
                      left: element.x + '%',
                      top: element.y + '%',
                      width: element.size + 'px',
                      height: element.size + 'px'
                    }"
                    :class="element.shape"
                  ></div>
                </div>
                <div class="option-label">选项 {{ String.fromCharCode(65 + index) }}</div>
              </div>
            </div>
          </div>
          
          <!-- 变化检测选择 -->
          <div v-if="selectedTestType === 'change'" class="change-selection">
            <div class="change-options">
              <div 
                v-for="(option, index) in changeOptions" 
                :key="index"
                class="change-option"
                :class="{ selected: selectedOption === index }"
                @click="selectOption(index)"
              >
                <div class="option-grid">
                  <div 
                    v-for="(item, itemIndex) in option" 
                    :key="itemIndex"
                    class="change-item"
                    :style="{ backgroundColor: item.color }"
                  >
                    <div class="image-shape" :class="item.shape"></div>
                  </div>
                </div>
                <div class="option-label">选项 {{ String.fromCharCode(65 + index) }}</div>
              </div>
            </div>
          </div>
          
          <div class="selection-actions">
            <button 
              @click="submitAnswer" 
              :disabled="!hasSelection"
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
                <div class="answer-explanation">
                  <div class="correct-answer">
                    <span class="label">正确答案:</span>
                    <div class="answer-display">
                      {{ getCorrectAnswerText() }}
                    </div>
                  </div>
                  <div class="user-answer" v-if="!isCorrect">
                    <span class="label">您的选择:</span>
                    <div class="answer-display">
                      {{ getUserAnswerText() }}
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
        <p>您的图像记忆能力测试结果如下：</p>
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
          <div class="result-icon">🖼️</div>
          <div class="result-value">{{ imageMemoryScore }}</div>
          <div class="result-label">图像记忆得分</div>
        </div>
      </div>
      
      <div class="detailed-analysis">
        <h4>详细分析</h4>
        
        <div class="analysis-grid">
          <div class="analysis-item">
            <h5>测试类型表现</h5>
            <div class="type-chart">
              <div 
                v-for="type in testTypes" 
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
            <h5>记忆统计</h5>
            <div class="memory-stats">
              <div class="stat-row">
                <span class="stat-label">最佳记忆类型</span>
                <span class="stat-value">{{ bestMemoryType }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">连续正确数</span>
                <span class="stat-value">{{ maxConsecutiveCorrect }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">视觉记忆强度</span>
                <span class="stat-value">{{ visualMemoryStrength }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">空间记忆能力</span>
                <span class="stat-value">{{ spatialMemoryAbility }}</span>
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
  testType: {
    type: String,
    default: 'sequence'
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
const selectedTestType = ref(props.testType)
const selectedDisplayTime = ref(3000)
const testState = ref('display') // display, selection, feedback
const currentQuestionIndex = ref(0)
const totalQuestions = ref(12)
const currentImages = ref([])
const gridCells = ref([])
const currentDetailImage = ref({})
const currentChangeImage = ref([])
const selectionOptions = ref([])
const detailOptions = ref([])
const changeOptions = ref([])
const interactiveGrid = ref([])
const selectedOption = ref(-1)
const isCorrect = ref(false)
const currentScore = ref(0)
const lastQuestionScore = ref(0)
const lastQuestionTime = ref(0)
const questionStartTime = ref(null)
const displayTime = ref(3000)
const remainingDisplayTime = ref(3000)
const results = ref([])
const displayTimer = ref(null)
const testCompleted = ref(false)
const correctAnswer = ref(null)

// 图像元素定义
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
const shapes = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon']

// 难度定义
const difficulties = [
  { key: 'easy', label: '简单', imageCount: 3, gridSize: 9 },
  { key: 'medium', label: '中等', imageCount: 5, gridSize: 16 },
  { key: 'hard', label: '困难', imageCount: 7, gridSize: 25 }
]

// 测试类型定义
const testTypes = [
  { key: 'sequence', label: '序列记忆' },
  { key: 'position', label: '位置记忆' },
  { key: 'detail', label: '细节记忆' },
  { key: 'change', label: '变化检测' }
]

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

const imageMemoryScore = computed(() => {
  const accuracy = overallAccuracy.value
  const speedBonus = Math.max(0, 100 - averageTime.value * 5)
  const typeBonus = getTypeVarietyBonus()
  return Math.round(accuracy * 0.6 + speedBonus * 0.2 + typeBonus * 0.2)
})

const hasSelection = computed(() => {
  if (selectedTestType.value === 'position') {
    return interactiveGrid.value.some(cell => cell.selected)
  }
  return selectedOption.value !== -1
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

const bestMemoryType = computed(() => {
  const typeAccuracies = testTypes.map(type => ({
    type: type.label,
    accuracy: getTypeAccuracy(type.key)
  }))
  
  const best = typeAccuracies.reduce((prev, current) => 
    current.accuracy > prev.accuracy ? current : prev
  )
  
  return best.type
})

const visualMemoryStrength = computed(() => {
  const detailResults = results.value.filter(r => r.testType === 'detail')
  if (detailResults.length === 0) return '未测试'
  
  const accuracy = detailResults.filter(r => r.isCorrect).length / detailResults.length * 100
  if (accuracy >= 80) return '优秀'
  if (accuracy >= 60) return '良好'
  if (accuracy >= 40) return '一般'
  return '需提升'
})

const spatialMemoryAbility = computed(() => {
  const positionResults = results.value.filter(r => r.testType === 'position')
  if (positionResults.length === 0) return '未测试'
  
  const accuracy = positionResults.filter(r => r.isCorrect).length / positionResults.length * 100
  if (accuracy >= 80) return '优秀'
  if (accuracy >= 60) return '良好'
  if (accuracy >= 40) return '一般'
  return '需提升'
})

const performanceFeedback = computed(() => {
  const feedback = []
  const accuracy = overallAccuracy.value
  const avgTime = averageTime.value
  
  // 准确率反馈
  if (accuracy >= 85) {
    feedback.push({
      type: 'accuracy',
      level: 'excellent',
      icon: '🎯',
      title: '图像记忆能力优秀',
      description: '您的图像记忆准确率非常高，视觉记忆能力出色。'
    })
  } else if (accuracy >= 70) {
    feedback.push({
      type: 'accuracy',
      level: 'good',
      icon: '👍',
      title: '图像记忆能力良好',
      description: '您的图像记忆准确率良好，继续保持。'
    })
  } else if (accuracy >= 55) {
    feedback.push({
      type: 'accuracy',
      level: 'average',
      icon: '📈',
      title: '图像记忆能力一般',
      description: '您的图像记忆能力有提升空间，建议多练习。'
    })
  } else {
    feedback.push({
      type: 'accuracy',
      level: 'poor',
      icon: '📚',
      title: '需要加强练习',
      description: '建议从简单的图像记忆开始练习，逐步提升能力。'
    })
  }
  
  // 速度反馈
  if (avgTime <= 4) {
    feedback.push({
      type: 'speed',
      level: 'excellent',
      icon: '⚡',
      title: '反应速度优秀',
      description: '您的图像识别和记忆反应速度非常快。'
    })
  } else if (avgTime <= 6) {
    feedback.push({
      type: 'speed',
      level: 'good',
      icon: '⏱️',
      title: '反应速度良好',
      description: '您的图像记忆反应速度良好。'
    })
  } else {
    feedback.push({
      type: 'speed',
      level: 'average',
      icon: '🐌',
      title: '可以提升速度',
      description: '建议多练习提升图像记忆反应速度。'
    })
  }
  
  return feedback
})

const improvementSuggestions = computed(() => {
  const suggestions = []
  const accuracy = overallAccuracy.value
  const avgTime = averageTime.value
  
  if (accuracy < 70) {
    suggestions.push('从简单的图像序列开始练习，逐步增加复杂度')
    suggestions.push('使用联想记忆法，将图像与熟悉的事物关联')
  }
  
  if (avgTime > 6) {
    suggestions.push('练习快速图像识别，提升视觉处理速度')
    suggestions.push('尝试整体记忆法，不要过分关注细节')
  }
  
  if (getTypeAccuracy('position') < 60) {
    suggestions.push('加强空间位置记忆训练')
    suggestions.push('练习使用空间记忆宫殿法')
  }
  
  if (getTypeAccuracy('detail') < 60) {
    suggestions.push('提升视觉细节观察能力')
    suggestions.push('练习图像细节分析和记忆')
  }
  
  suggestions.push('定期进行图像记忆练习，保持视觉记忆能力')
  suggestions.push('尝试不同类型的图像记忆训练，全面提升能力')
  
  return suggestions
})

// 方法
const generateImage = () => {
  return {
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: shapes[Math.floor(Math.random() * shapes.length)]
  }
}

const generateSequenceQuestion = () => {
  const difficulty = difficulties.find(d => d.key === selectedDifficulty.value)
  const imageCount = Math.floor(Math.random() * 2) + difficulty.imageCount - 1
  
  const images = []
  for (let i = 0; i < imageCount; i++) {
    images.push(generateImage())
  }
  
  currentImages.value = images
  
  // 生成选项
  const options = [images]
  
  // 生成错误选项
  for (let i = 0; i < 3; i++) {
    const wrongOption = [...images]
    
    // 随机改变一个或两个图像
    const changeCount = Math.floor(Math.random() * 2) + 1
    for (let j = 0; j < changeCount; j++) {
      const changeIndex = Math.floor(Math.random() * wrongOption.length)
      wrongOption[changeIndex] = generateImage()
    }
    
    options.push(wrongOption)
  }
  
  // 打乱选项
  selectionOptions.value = shuffleArray(options)
  correctAnswer.value = selectionOptions.value.findIndex(option => 
    JSON.stringify(option) === JSON.stringify(images)
  )
}

const generatePositionQuestion = () => {
  const difficulty = difficulties.find(d => d.key === selectedDifficulty.value)
  const gridSize = difficulty.gridSize
  const imageCount = Math.floor(Math.random() * 2) + Math.floor(difficulty.imageCount / 2)
  
  // 初始化网格
  const cells = Array(gridSize).fill().map(() => ({ hasImage: false }))
  
  // 随机放置图像
  const imagePositions = []
  for (let i = 0; i < imageCount; i++) {
    let position
    do {
      position = Math.floor(Math.random() * gridSize)
    } while (cells[position].hasImage)
    
    const image = generateImage()
    cells[position] = { hasImage: true, ...image }
    imagePositions.push(position)
  }
  
  gridCells.value = cells
  correctAnswer.value = imagePositions
  
  // 初始化交互网格
  interactiveGrid.value = Array(gridSize).fill().map(() => ({ selected: false }))
}

const generateDetailQuestion = () => {
  const elementCount = Math.floor(Math.random() * 3) + 4
  const backgroundColor = colors[Math.floor(Math.random() * colors.length)]
  
  const elements = []
  for (let i = 0; i < elementCount; i++) {
    elements.push({
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      x: Math.floor(Math.random() * 70) + 10,
      y: Math.floor(Math.random() * 70) + 10,
      size: Math.floor(Math.random() * 20) + 20
    })
  }
  
  currentDetailImage.value = { backgroundColor, elements }
  
  // 生成选项
  const options = [{ backgroundColor, elements: [...elements] }]
  
  // 生成错误选项
  for (let i = 0; i < 3; i++) {
    const wrongElements = [...elements]
    
    // 随机改变一些元素
    const changeCount = Math.floor(Math.random() * 2) + 1
    for (let j = 0; j < changeCount; j++) {
      const changeIndex = Math.floor(Math.random() * wrongElements.length)
      const changeType = Math.floor(Math.random() * 4)
      
      switch (changeType) {
        case 0: // 改变颜色
          wrongElements[changeIndex].color = colors[Math.floor(Math.random() * colors.length)]
          break
        case 1: // 改变形状
          wrongElements[changeIndex].shape = shapes[Math.floor(Math.random() * shapes.length)]
          break
        case 2: // 改变位置
          wrongElements[changeIndex].x = Math.floor(Math.random() * 70) + 10
          wrongElements[changeIndex].y = Math.floor(Math.random() * 70) + 10
          break
        case 3: // 改变大小
          wrongElements[changeIndex].size = Math.floor(Math.random() * 20) + 20
          break
      }
    }
    
    options.push({ backgroundColor, elements: wrongElements })
  }
  
  detailOptions.value = shuffleArray(options)
  correctAnswer.value = detailOptions.value.findIndex(option => 
    JSON.stringify(option) === JSON.stringify({ backgroundColor, elements })
  )
}

const generateChangeQuestion = () => {
  const itemCount = 6
  const originalItems = []
  
  for (let i = 0; i < itemCount; i++) {
    originalItems.push(generateImage())
  }
  
  currentChangeImage.value = originalItems
  
  // 生成选项（一个是原图，其他有变化）
  const options = [originalItems]
  
  // 生成变化选项
  for (let i = 0; i < 3; i++) {
    const changedItems = [...originalItems]
    const changeIndex = Math.floor(Math.random() * itemCount)
    changedItems[changeIndex] = generateImage()
    options.push(changedItems)
  }
  
  changeOptions.value = shuffleArray(options)
  correctAnswer.value = changeOptions.value.findIndex(option => 
    JSON.stringify(option) === JSON.stringify(originalItems)
  )
}

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const getTestTypeLabel = (type) => {
  const typeObj = testTypes.find(t => t.key === type)
  return typeObj ? typeObj.label : type
}

const getSelectionTitle = () => {
  switch (selectedTestType.value) {
    case 'sequence':
      return '请选择正确的图像序列'
    case 'position':
      return '请点击您记住的图像位置'
    case 'detail':
      return '请选择与原图相同的选项'
    case 'change':
      return '请选择与原图相同的选项（没有变化）'
    default:
      return '请选择正确答案'
  }
}

const startTest = () => {
  currentPhase.value = 'testing'
  currentQuestionIndex.value = 0
  currentScore.value = 0
  results.value = []
  testCompleted.value = false
  
  // 根据测评模式调整题目数量
  if (props.assessmentMode === 'quick') {
    totalQuestions.value = 8
  } else if (props.assessmentMode === 'detailed') {
    totalQuestions.value = 16
  } else {
    totalQuestions.value = 12
  }
  
  generateNewQuestion()
}

const generateNewQuestion = () => {
  selectedOption.value = -1
  testState.value = 'display'
  displayTime.value = parseInt(selectedDisplayTime.value)
  remainingDisplayTime.value = displayTime.value
  questionStartTime.value = Date.now()
  
  // 根据测试类型生成题目
  switch (selectedTestType.value) {
    case 'sequence':
      generateSequenceQuestion()
      break
    case 'position':
      generatePositionQuestion()
      break
    case 'detail':
      generateDetailQuestion()
      break
    case 'change':
      generateChangeQuestion()
      break
  }
  
  startDisplayTimer()
}

const startDisplayTimer = () => {
  displayTimer.value = setInterval(() => {
    remainingDisplayTime.value -= 100
    
    if (remainingDisplayTime.value <= 0) {
      clearInterval(displayTimer.value)
      testState.value = 'selection'
    }
  }, 100)
}

const selectOption = (index) => {
  selectedOption.value = index
}

const toggleGridCell = (index) => {
  interactiveGrid.value[index].selected = !interactiveGrid.value[index].selected
}

const submitAnswer = () => {
  if (!hasSelection.value) return
  
  const timeSpent = (Date.now() - questionStartTime.value) / 1000
  let userAnswer
  
  if (selectedTestType.value === 'position') {
    userAnswer = interactiveGrid.value
      .map((cell, index) => cell.selected ? index : -1)
      .filter(index => index !== -1)
    
    isCorrect.value = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.value.sort())
  } else {
    userAnswer = selectedOption.value
    isCorrect.value = userAnswer === correctAnswer.value
  }
  
  // 计算得分
  let score = 0
  if (isCorrect.value) {
    const baseScore = 10
    const difficultyBonus = selectedDifficulty.value === 'hard' ? 5 : selectedDifficulty.value === 'medium' ? 3 : 1
    const timeBonus = Math.max(0, 10 - Math.floor(timeSpent))
    score = baseScore + difficultyBonus + timeBonus
  }
  
  currentScore.value += score
  lastQuestionScore.value = score
  lastQuestionTime.value = Math.round(timeSpent * 10) / 10
  
  // 记录结果
  const result = {
    questionIndex: currentQuestionIndex.value,
    testType: selectedTestType.value,
    difficulty: selectedDifficulty.value,
    userAnswer,
    correctAnswer: correctAnswer.value,
    isCorrect: isCorrect.value,
    timeSpent: lastQuestionTime.value,
    score
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
    testType: selectedTestType.value,
    difficulty: selectedDifficulty.value,
    userAnswer: null,
    correctAnswer: correctAnswer.value,
    isCorrect: false,
    timeSpent: Math.round(timeSpent * 10) / 10,
    score: 0,
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
    score: imageMemoryScore.value,
    accuracy: overallAccuracy.value,
    averageTime: averageTime.value,
    completedQuestions: results.value.length,
    questions: results.value
  })
}

const getTypeAccuracy = (type) => {
  const typeResults = results.value.filter(r => r.testType === type)
  if (typeResults.length === 0) return 0
  const correct = typeResults.filter(r => r.isCorrect).length
  return Math.round((correct / typeResults.length) * 100)
}

const getDifficultyAccuracy = (difficulty) => {
  const difficultyResults = results.value.filter(r => r.difficulty === difficulty)
  if (difficultyResults.length === 0) return 0
  const correct = difficultyResults.filter(r => r.isCorrect).length
  return Math.round((correct / difficultyResults.length) * 100)
}

const getTypeVarietyBonus = () => {
  const testedTypes = [...new Set(results.value.map(r => r.testType))]
  return testedTypes.length * 5
}

const getCorrectAnswerText = () => {
  switch (selectedTestType.value) {
    case 'sequence':
      return `选项 ${String.fromCharCode(65 + correctAnswer.value)}`
    case 'position':
      return `位置: ${correctAnswer.value.map(pos => pos + 1).join(', ')}`
    case 'detail':
    case 'change':
      return `选项 ${String.fromCharCode(65 + correctAnswer.value)}`
    default:
      return '未知'
  }
}

const getUserAnswerText = () => {
  if (selectedTestType.value === 'position') {
    const userPositions = interactiveGrid.value
      .map((cell, index) => cell.selected ? index + 1 : -1)
      .filter(index => index !== -1)
    return `位置: ${userPositions.join(', ')}`
  } else {
    return `选项 ${String.fromCharCode(65 + selectedOption.value)}`
  }
}

const exportReport = () => {
  console.log('导出图像记忆测试报告')
}

const retakeTest = () => {
  currentPhase.value = 'instruction'
  currentQuestionIndex.value = 0
  currentScore.value = 0
  results.value = []
  testCompleted.value = false
}

const goToTraining = () => {
  console.log('跳转到图像记忆训练')
}

// 生命周期
onMounted(() => {
  if (props.difficulty !== 'medium') {
    selectedDifficulty.value = props.difficulty
  }
  if (props.testType !== 'sequence') {
    selectedTestType.value = props.testType
  }
})

onUnmounted(() => {
  if (displayTimer.value) {
    clearInterval(displayTimer.value)
  }
})
</script>

<style scoped>
.image-memory-test {
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
  max-width: 900px;
  margin: 0 auto;
}

.phase-title {
  font-size: 1.5em;
  color: #495057;
  margin-bottom: 30px;
}

/* 序列显示样式 */
.sequence-display {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.image-item {
  animation: imageAppear 0.6s ease-out;
}

.image-container {
  position: relative;
}

.image-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.image-shape {
  width: 60px;
  height: 60px;
}

.image-shape.circle {
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
}

.image-shape.square {
  background: rgba(255, 255, 255, 0.8);
}

.image-shape.triangle {
  width: 0;
  height: 0;
  border-left: 30px solid transparent;
  border-right: 30px solid transparent;
  border-bottom: 52px solid rgba(255, 255, 255, 0.8);
  background: none;
}

.image-shape.diamond {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.8);
  transform: rotate(45deg);
}

.image-shape.star {
  position: relative;
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 18px solid rgba(255, 255, 255, 0.8);
  transform: rotate(35deg);
}

.image-shape.star:before {
  content: '';
  position: absolute;
  left: -25px;
  top: -12px;
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 18px solid rgba(255, 255, 255, 0.8);
  transform: rotate(-70deg);
}

.image-shape.star:after {
  content: '';
  position: absolute;
  left: -25px;
  top: 3px;
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 18px solid rgba(255, 255, 255, 0.8);
  transform: rotate(70deg);
}

.image-shape.hexagon {
  width: 52px;
  height: 30px;
  background: rgba(255, 255, 255, 0.8);
  position: relative;
}

.image-shape.hexagon:before {
  content: "";
  position: absolute;
  top: -15px;
  left: 0;
  width: 0;
  height: 0;
  border-left: 26px solid transparent;
  border-right: 26px solid transparent;
  border-bottom: 15px solid rgba(255, 255, 255, 0.8);
}

.image-shape.hexagon:after {
  content: "";
  position: absolute;
  bottom: -15px;
  left: 0;
  width: 0;
  height: 0;
  border-left: 26px solid transparent;
  border-right: 26px solid transparent;
  border-top: 15px solid rgba(255, 255, 255, 0.8);
}

.image-number {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #007bff;
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  font-weight: 600;
}

/* 位置显示样式 */
.position-display {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.grid-container {
  display: grid;
  gap: 10px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 15px;
}

.grid-container {
  grid-template-columns: repeat(3, 1fr);
}

.grid-container[data-size="16"] {
  grid-template-columns: repeat(4, 1fr);
}

.grid-container[data-size="25"] {
  grid-template-columns: repeat(5, 1fr);
}

.grid-cell {
  width: 80px;
  height: 80px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.grid-cell.active {
  border-color: #007bff;
  box-shadow: 0 0 15px rgba(0, 123, 255, 0.3);
}

.cell-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 细节显示样式 */
.detail-display {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.detail-image {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.complex-image {
  width: 400px;
  height: 300px;
  position: relative;
  border-radius: 15px;
}

.image-element {
  position: absolute;
  border-radius: 50%;
}

.image-element.square {
  border-radius: 0;
}

.image-element.triangle {
  width: 0 !important;
  height: 0 !important;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 26px solid;
  background: none !important;
  border-bottom-color: inherit;
}

/* 变化检测显示样式 */
.change-display {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.change-image {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 15px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.change-item {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 计时器样式 */
.countdown-timer {
  display: flex;
  justify-content: center;
  margin-top: 30px;
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

/* 选择阶段样式 */
.selection-phase {
  text-align: center;
}

.selection-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* 序列选择样式 */
.sequence-selection {
  margin-bottom: 30px;
}

.selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.option-item {
  background: white;
  border: 3px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
}

.option-item.selected {
  border-color: #007bff;
  background: #e3f2fd;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.option-sequence {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.mini-image {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-image .image-shape {
  width: 24px;
  height: 24px;
}

.option-label {
  font-weight: 600;
  color: #495057;
}

/* 位置选择样式 */
.position-selection {
  margin-bottom: 30px;
}

.selection-instruction {
  font-size: 1.2em;
  color: #495057;
  margin-bottom: 20px;
}

.interactive-grid {
  display: grid;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
  grid-template-columns: repeat(3, 1fr);
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.interactive-cell {
  width: 80px;
  height: 80px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.interactive-cell:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.interactive-cell.selected {
  border-color: #007bff;
  background: #e3f2fd;
  box-shadow: 0 0 15px rgba(0, 123, 255, 0.3);
}

.cell-number {
  font-size: 0.8em;
  color: #6c757d;
}

/* 细节选择样式 */
.detail-selection {
  margin-bottom: 30px;
}

.detail-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.detail-option {
  background: white;
  border: 3px solid #e9ecef;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.detail-option:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.detail-option.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.option-image {
  width: 200px;
  height: 150px;
  position: relative;
  border-radius: 8px;
  margin: 0 auto 15px;
}

/* 变化检测选择样式 */
.change-selection {
  margin-bottom: 30px;
}

.change-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.change-option {
  background: white;
  border: 3px solid #e9ecef;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-option:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.change-option.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 15px;
}

.option-grid .change-item {
  width: 50px;
  height: 50px;
}

/* 选择操作样式 */
.selection-actions {
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

.answer-explanation {
  margin-bottom: 25px;
}

.correct-answer,
.user-answer {
  margin-bottom: 15px;
}

.label {
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.answer-display {
  font-size: 1.1em;
  color: #007bff;
  font-weight: 600;
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

/* 结果展示样式 */
.results-phase {
  text-align: center;
}

.results-container {
  max-width: 1200px;
  margin: 0 auto;
}

.overall-results {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.results-title {
  font-size: 2em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 30px;
}

.score-display {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

.score-circle {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: conic-gradient(#007bff 0deg, #e9ecef 0deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-inner {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-number {
  font-size: 2.5em;
  font-weight: 600;
  color: #007bff;
}

.score-label {
  font-size: 0.9em;
  color: #6c757d;
  margin-top: 5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-number {
  font-size: 1.8em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 5px;
}

.stat-title {
  color: #6c757d;
  font-size: 0.9em;
}

/* 详细分析样式 */
.detailed-analysis {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.analysis-title {
  font-size: 1.5em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 25px;
}

.analysis-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.performance-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.performance-label {
  color: #495057;
  font-weight: 500;
}

.performance-value {
  font-weight: 600;
  color: #007bff;
}

.memory-stats {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.stats-row:last-child {
  border-bottom: none;
}

.stats-label {
  color: #6c757d;
}

.stats-value {
  font-weight: 600;
  color: #495057;
}

/* 表现评价样式 */
.performance-feedback {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.feedback-content {
  text-align: left;
}

.evaluation-text {
  font-size: 1.1em;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 20px;
}

.suggestions-list {
  list-style: none;
  padding: 0;
}

.suggestion-item {
  background: #e3f2fd;
  border-left: 4px solid #007bff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 0 8px 8px 0;
}

.suggestion-item:last-child {
  margin-bottom: 0;
}

/* 操作按钮样式 */
.results-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 30px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-container {
    padding: 15px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .image-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .selection-grid {
    grid-template-columns: 1fr;
  }

  .detail-options {
    grid-template-columns: 1fr;
  }

  .change-options {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .performance-grid {
    grid-template-columns: 1fr;
  }

  .results-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-primary,
  .btn-secondary {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .image-grid {
    grid-template-columns: 1fr;
  }

  .interactive-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 200px;
  }

  .interactive-cell {
    width: 60px;
    height: 60px;
  }

  .score-circle {
    width: 120px;
    height: 120px;
  }

  .score-inner {
    width: 100px;
    height: 100px;
  }

  .score-number {
    font-size: 2em;
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

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.slide-in {
  animation: slideIn 0.5s ease-out;
}

.scale-in {
  animation: scaleIn 0.3s ease-out;
}

/* 主题变量 */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --border-color: #e9ecef;
  --text-color: #495057;
  --muted-color: #6c757d;
}
</style>