<template>
  <div class="long-term-memory-test">
    <div class="test-container">
      <!-- 测试说明阶段 -->
      <div v-if="testPhase === 'instruction'" class="instruction-phase">
        <div class="instruction-content">
          <h3>长期记忆测试</h3>
          <p class="instruction-text">
            这个测试将评估您的长期记忆能力。您需要学习一些信息，然后在较长时间间隔后进行回忆测试。
          </p>
          
          <div class="instruction-steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-text">学习阶段：仔细学习展示的信息</div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-text">干扰阶段：完成一些干扰任务</div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-text">回忆阶段：回答关于学习内容的问题</div>
            </div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-text">评估您的长期记忆保持能力</div>
            </div>
          </div>
          
          <div class="test-settings">
            <h4>测试设置</h4>
            <div class="settings-grid">
              <div class="setting-item">
                <label>学习时间:</label>
                <span>{{ difficultySettings.studyTime }}秒</span>
              </div>
              <div class="setting-item">
                <label>干扰时间:</label>
                <span>{{ difficultySettings.interferenceTime }}秒</span>
              </div>
              <div class="setting-item">
                <label>内容类型:</label>
                <span>故事、图片、词汇</span>
              </div>
            </div>
          </div>
          
          <button @click="startTest" class="btn-start">
            开始测试
          </button>
        </div>
      </div>

      <!-- 学习阶段 -->
      <div v-if="testPhase === 'learning'" class="learning-phase">
        <div class="learning-header">
          <h4>学习阶段 - {{ currentMaterial.title }}</h4>
          <div class="learning-timer">
            <div class="timer-circle">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#e0e0e0" stroke-width="6"/>
                <circle cx="40" cy="40" r="35" fill="none" stroke="var(--color-primary)" 
                        stroke-width="6" stroke-linecap="round"
                        :stroke-dasharray="`${learningProgress * 2.2} 220`"
                        transform="rotate(-90 40 40)"/>
              </svg>
              <div class="timer-text">{{ learningTimeLeft }}s</div>
            </div>
          </div>
        </div>
        
        <div class="learning-content">
          <!-- 故事学习 -->
          <div v-if="currentMaterial.type === 'story'" class="story-learning">
            <div class="story-container">
              <h5>{{ currentMaterial.story.title }}</h5>
              <div class="story-text">
                <p v-for="(paragraph, index) in currentMaterial.story.content" :key="index">
                  {{ paragraph }}
                </p>
              </div>
              <div class="story-details">
                <div class="detail-item">
                  <strong>主要人物:</strong>
                  <span v-for="(character, index) in currentMaterial.story.characters" :key="index">
                    {{ character }}<span v-if="index < currentMaterial.story.characters.length - 1">, </span>
                  </span>
                </div>
                <div class="detail-item">
                  <strong>地点:</strong> {{ currentMaterial.story.location }}
                </div>
                <div class="detail-item">
                  <strong>时间:</strong> {{ currentMaterial.story.time }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- 图片学习 -->
          <div v-else-if="currentMaterial.type === 'image'" class="image-learning">
            <div class="image-container">
              <div class="image-placeholder">
                <div class="image-content">
                  <div class="image-elements">
                    <div v-for="(element, index) in currentMaterial.image.elements" 
                         :key="index" 
                         class="image-element"
                         :style="{ 
                           left: element.x + '%', 
                           top: element.y + '%',
                           color: element.color 
                         }">
                      {{ element.name }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="image-description">
                <h5>{{ currentMaterial.image.title }}</h5>
                <p>{{ currentMaterial.image.description }}</p>
                <div class="image-details">
                  <div class="detail-item">
                    <strong>场景:</strong> {{ currentMaterial.image.scene }}
                  </div>
                  <div class="detail-item">
                    <strong>主要元素:</strong>
                    <span v-for="(element, index) in currentMaterial.image.elements" :key="index">
                      {{ element.name }}<span v-if="index < currentMaterial.image.elements.length - 1">, </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 词汇学习 -->
          <div v-else-if="currentMaterial.type === 'vocabulary'" class="vocabulary-learning">
            <div class="vocabulary-container">
              <h5>{{ currentMaterial.vocabulary.category }}</h5>
              <div class="word-pairs">
                <div v-for="(pair, index) in currentMaterial.vocabulary.pairs" 
                     :key="index" 
                     class="word-pair"
                     :style="{ animationDelay: index * 0.2 + 's' }">
                  <div class="word">
                    <span class="word-text">{{ pair.word }}</span>
                    <span class="word-pronunciation">{{ pair.pronunciation }}</span>
                  </div>
                  <div class="definition">
                    <span class="definition-text">{{ pair.definition }}</span>
                    <span class="example-text">{{ pair.example }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="learning-tips">
          <div class="tip-icon">💡</div>
          <div class="tip-text">请仔细阅读并尽量记住所有细节，稍后会有相关问题。</div>
        </div>
      </div>

      <!-- 干扰阶段 -->
      <div v-if="testPhase === 'interference'" class="interference-phase">
        <div class="interference-header">
          <h4>干扰任务</h4>
          <div class="interference-timer">
            ⏱️ {{ interferenceTimeLeft }}秒
          </div>
        </div>
        
        <div class="interference-content">
          <div class="interference-task">
            <h5>{{ currentInterferenceTask.title }}</h5>
            <p>{{ currentInterferenceTask.instruction }}</p>
            
            <!-- 数学计算干扰 -->
            <div v-if="currentInterferenceTask.type === 'math'" class="math-interference">
              <div class="math-problem">
                <span class="problem-text">{{ currentInterferenceTask.problem }}</span>
                <input v-model="interferenceAnswer" type="number" class="answer-input" placeholder="答案">
                <button @click="submitInterferenceAnswer" class="btn-submit-interference">
                  提交
                </button>
              </div>
              <div class="interference-score">
                已完成: {{ interferenceScore }} / {{ interferenceTarget }}
              </div>
            </div>
            
            <!-- 颜色识别干扰 -->
            <div v-else-if="currentInterferenceTask.type === 'color'" class="color-interference">
              <div class="color-task">
                <div class="color-word" :style="{ color: currentInterferenceTask.textColor }">
                  {{ currentInterferenceTask.colorName }}
                </div>
                <div class="color-options">
                  <button v-for="option in currentInterferenceTask.options" 
                          :key="option"
                          @click="submitColorAnswer(option)"
                          class="color-option-btn"
                          :style="{ backgroundColor: option }">
                  </button>
                </div>
              </div>
              <div class="interference-score">
                已完成: {{ interferenceScore }} / {{ interferenceTarget }}
              </div>
            </div>
            
            <!-- 字母序列干扰 -->
            <div v-else-if="currentInterferenceTask.type === 'sequence'" class="sequence-interference">
              <div class="sequence-task">
                <div class="sequence-display">
                  {{ currentInterferenceTask.sequence }}
                </div>
                <div class="sequence-question">
                  下一个字母是什么？
                </div>
                <div class="sequence-options">
                  <button v-for="option in currentInterferenceTask.options" 
                          :key="option"
                          @click="submitSequenceAnswer(option)"
                          class="sequence-option-btn">
                    {{ option }}
                  </button>
                </div>
              </div>
              <div class="interference-score">
                已完成: {{ interferenceScore }} / {{ interferenceTarget }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 回忆测试阶段 -->
      <div v-if="testPhase === 'recall'" class="recall-phase">
        <div class="recall-header">
          <h4>回忆测试</h4>
          <div class="recall-progress">
            问题 {{ currentQuestionIndex + 1 }} / {{ recallQuestions.length }}
          </div>
        </div>
        
        <div class="recall-content">
          <div class="question-container">
            <div class="question-text">
              {{ currentRecallQuestion.question }}
            </div>
            
            <!-- 选择题 -->
            <div v-if="currentRecallQuestion.type === 'choice'" class="choice-question">
              <div class="choice-options">
                <label v-for="(option, index) in currentRecallQuestion.options" 
                       :key="index" 
                       class="choice-option">
                  <input type="radio" 
                         :value="option" 
                         v-model="currentAnswer" 
                         name="recall-choice">
                  <span class="option-text">{{ option }}</span>
                </label>
              </div>
            </div>
            
            <!-- 填空题 -->
            <div v-else-if="currentRecallQuestion.type === 'fill'" class="fill-question">
              <input v-model="currentAnswer" 
                     type="text" 
                     class="fill-input" 
                     :placeholder="currentRecallQuestion.placeholder">
            </div>
            
            <!-- 排序题 -->
            <div v-else-if="currentRecallQuestion.type === 'order'" class="order-question">
              <div class="order-instruction">
                请将以下选项按正确顺序排列：
              </div>
              <div class="order-items">
                <div v-for="(item, index) in shuffledOrderItems" 
                     :key="item.id"
                     class="order-item"
                     :class="{ selected: selectedOrderItems.includes(item) }"
                     @click="toggleOrderItem(item)">
                  <span class="order-number" v-if="selectedOrderItems.includes(item)">
                    {{ selectedOrderItems.indexOf(item) + 1 }}
                  </span>
                  <span class="item-text">{{ item.text }}</span>
                </div>
              </div>
            </div>
            
            <!-- 匹配题 -->
            <div v-else-if="currentRecallQuestion.type === 'match'" class="match-question">
              <div class="match-instruction">
                请将左侧内容与右侧内容进行匹配：
              </div>
              <div class="match-container">
                <div class="match-left">
                  <div v-for="(item, index) in currentRecallQuestion.leftItems" 
                       :key="index"
                       class="match-item"
                       :class="{ selected: selectedLeftItem === item }"
                       @click="selectLeftItem(item)">
                    {{ item }}
                  </div>
                </div>
                <div class="match-connections">
                  <div v-for="(connection, index) in matchConnections" 
                       :key="index"
                       class="connection-line">
                    {{ connection.left }} → {{ connection.right }}
                    <button @click="removeConnection(index)" class="remove-connection">×</button>
                  </div>
                </div>
                <div class="match-right">
                  <div v-for="(item, index) in currentRecallQuestion.rightItems" 
                       :key="index"
                       class="match-item"
                       :class="{ selected: selectedRightItem === item }"
                       @click="selectRightItem(item)">
                    {{ item }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="recall-controls">
          <button @click="submitRecallAnswer" 
                  class="btn-submit" 
                  :disabled="!canSubmitRecall">
            提交答案
          </button>
          <button @click="skipRecallQuestion" class="btn-skip">
            跳过此题
          </button>
        </div>
      </div>

      <!-- 反馈阶段 -->
      <div v-if="testPhase === 'feedback'" class="feedback-phase">
        <div class="feedback-container">
          <div class="feedback-header">
            <div class="feedback-icon" :class="{ correct: lastRecallResult.isCorrect, incorrect: !lastRecallResult.isCorrect }">
              {{ lastRecallResult.isCorrect ? '✓' : '✗' }}
            </div>
            <div class="feedback-text">
              <div class="feedback-title">
                {{ lastRecallResult.isCorrect ? '回答正确！' : '回答错误' }}
              </div>
              <div class="feedback-score">
                得分: {{ lastRecallResult.score }} / {{ lastRecallResult.maxScore }}
              </div>
            </div>
          </div>
          
          <div class="feedback-details">
            <div class="answer-comparison">
              <div class="correct-answer">
                <h5>正确答案:</h5>
                <div class="answer-content">{{ lastRecallResult.correctAnswer }}</div>
              </div>
              <div class="user-answer">
                <h5>您的答案:</h5>
                <div class="answer-content" :class="{ correct: lastRecallResult.isCorrect, incorrect: !lastRecallResult.isCorrect }">
                  {{ lastRecallResult.userAnswer || '未回答' }}
                </div>
              </div>
            </div>
            
            <div class="explanation" v-if="lastRecallResult.explanation">
              <h5>解释:</h5>
              <p>{{ lastRecallResult.explanation }}</p>
            </div>
          </div>
          
          <button @click="nextRecallQuestion" class="btn-continue">
            {{ isLastRecallQuestion ? '查看结果' : '下一题' }}
          </button>
        </div>
      </div>

      <!-- 结果展示阶段 -->
      <div v-if="testPhase === 'results'" class="results-phase">
        <div class="results-container">
          <h3>长期记忆测试结果</h3>
          
          <div class="overall-results">
            <div class="result-card">
              <div class="result-icon">🧠</div>
              <div class="result-content">
                <div class="result-value">{{ overallAccuracy }}%</div>
                <div class="result-label">总体准确率</div>
              </div>
            </div>
            
            <div class="result-card">
              <div class="result-icon">⏰</div>
              <div class="result-content">
                <div class="result-value">{{ retentionRate }}%</div>
                <div class="result-label">记忆保持率</div>
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
                <div class="result-value">{{ memoryStrength }}</div>
                <div class="result-label">记忆强度</div>
              </div>
            </div>
          </div>
          
          <div class="detailed-analysis">
            <h4>详细分析</h4>
            <div class="analysis-grid">
              <div class="analysis-item">
                <h5>内容类型表现</h5>
                <div class="type-chart">
                  <div v-for="type in ['story', 'image', 'vocabulary']" :key="type" class="type-bar">
                    <span class="type-label">{{ getContentTypeLabel(type) }}</span>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: getContentTypeAccuracy(type) + '%' }"></div>
                    </div>
                    <span class="accuracy-value">{{ getContentTypeAccuracy(type) }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="analysis-item">
                <h5>问题类型表现</h5>
                <div class="question-type-chart">
                  <div v-for="type in ['choice', 'fill', 'order', 'match']" :key="type" class="type-bar">
                    <span class="type-label">{{ getQuestionTypeLabel(type) }}</span>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: getQuestionTypeAccuracy(type) + '%' }"></div>
                    </div>
                    <span class="accuracy-value">{{ getQuestionTypeAccuracy(type) }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="analysis-item">
                <h5>记忆衰减分析</h5>
                <div class="decay-analysis">
                  <div class="decay-chart">
                    <div class="decay-bar">
                      <span class="decay-label">即时回忆</span>
                      <div class="bar-container">
                        <div class="bar-fill" :style="{ width: immediateRecall + '%' }"></div>
                      </div>
                      <span class="accuracy-value">{{ immediateRecall }}%</span>
                    </div>
                    <div class="decay-bar">
                      <span class="decay-label">延迟回忆</span>
                      <div class="bar-container">
                        <div class="bar-fill" :style="{ width: delayedRecall + '%' }"></div>
                      </div>
                      <span class="accuracy-value">{{ delayedRecall }}%</span>
                    </div>
                  </div>
                  <div class="decay-rate">
                    <span class="decay-label">遗忘率:</span>
                    <span class="decay-value">{{ forgettingRate }}%</span>
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
const testPhase = ref('instruction') // instruction, learning, interference, recall, feedback, results
const currentMaterialIndex = ref(0)
const currentQuestionIndex = ref(0)
const learningMaterials = ref([])
const recallQuestions = ref([])
const recallResults = ref([])
const lastRecallResult = ref({})
const learningTimeLeft = ref(0)
const interferenceTimeLeft = ref(0)
const learningTimer = ref(null)
const interferenceTimer = ref(null)

// 学习阶段数据
const currentAnswer = ref('')
const selectedOrderItems = ref([])
const shuffledOrderItems = ref([])
const selectedLeftItem = ref(null)
const selectedRightItem = ref(null)
const matchConnections = ref([])

// 干扰任务数据
const currentInterferenceTask = ref({})
const interferenceAnswer = ref('')
const interferenceScore = ref(0)
const interferenceTarget = ref(10)
const interferenceTaskIndex = ref(0)

// 计算属性
const difficultySettings = computed(() => {
  const settings = {
    easy: { studyTime: 120, interferenceTime: 60, materialCount: 2 },
    medium: { studyTime: 90, interferenceTime: 90, materialCount: 3 },
    hard: { studyTime: 60, interferenceTime: 120, materialCount: 4 }
  }
  return settings[props.difficulty] || settings.medium
})

const currentMaterial = computed(() => learningMaterials.value[currentMaterialIndex.value])

const currentRecallQuestion = computed(() => recallQuestions.value[currentQuestionIndex.value])

const learningProgress = computed(() => {
  const totalTime = difficultySettings.value.studyTime
  return ((totalTime - learningTimeLeft.value) / totalTime) * 100
})

const canSubmitRecall = computed(() => {
  if (!currentRecallQuestion.value) return false
  
  switch (currentRecallQuestion.value.type) {
    case 'choice':
    case 'fill':
      return currentAnswer.value !== ''
    case 'order':
      return selectedOrderItems.value.length === currentRecallQuestion.value.items.length
    case 'match':
      return matchConnections.value.length === currentRecallQuestion.value.leftItems.length
    default:
      return false
  }
})

const isLastRecallQuestion = computed(() => {
  return currentQuestionIndex.value >= recallQuestions.value.length - 1
})

const overallAccuracy = computed(() => {
  if (recallResults.value.length === 0) return 0
  const totalScore = recallResults.value.reduce((sum, result) => sum + result.score, 0)
  const maxScore = recallResults.value.reduce((sum, result) => sum + result.maxScore, 0)
  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
})

const retentionRate = computed(() => {
  // 计算记忆保持率（相对于即时记忆的保持程度）
  return Math.max(0, overallAccuracy.value - 10) // 假设有10%的自然衰减
})

const finalScore = computed(() => {
  const accuracyWeight = 0.6
  const retentionWeight = 0.4
  
  return Math.round(overallAccuracy.value * accuracyWeight + retentionRate.value * retentionWeight)
})

const memoryStrength = computed(() => {
  if (finalScore.value >= 90) return '优秀'
  if (finalScore.value >= 80) return '良好'
  if (finalScore.value >= 70) return '一般'
  return '需要提高'
})

const immediateRecall = computed(() => {
  // 模拟即时回忆成绩（通常比延迟回忆高）
  return Math.min(100, overallAccuracy.value + 15)
})

const delayedRecall = computed(() => {
  return overallAccuracy.value
})

const forgettingRate = computed(() => {
  return Math.max(0, immediateRecall.value - delayedRecall.value)
})

const improvementSuggestions = computed(() => {
  const suggestions = []
  
  if (overallAccuracy.value < 70) {
    suggestions.push('建议使用多种记忆策略，如联想记忆、故事记忆等')
  }
  
  if (forgettingRate.value > 20) {
    suggestions.push('加强复习和巩固，建立长期记忆连接')
  }
  
  if (getContentTypeAccuracy('story') < 70) {
    suggestions.push('提高故事记忆能力，注意情节和细节的关联')
  }
  
  if (getContentTypeAccuracy('image') < 70) {
    suggestions.push('加强视觉记忆训练，注意空间位置和视觉特征')
  }
  
  if (getContentTypeAccuracy('vocabulary') < 70) {
    suggestions.push('改进词汇记忆方法，使用词根词缀和语境记忆')
  }
  
  suggestions.push('定期进行长期记忆训练，保持记忆能力')
  
  return suggestions
})

// 方法
const startTest = () => {
  generateLearningMaterials()
  testPhase.value = 'learning'
  startLearningPhase()
}

const generateLearningMaterials = () => {
  const materials = []
  const materialCount = difficultySettings.value.materialCount
  
  // 生成故事材料
  materials.push(generateStoryMaterial())
  
  // 生成图片材料
  materials.push(generateImageMaterial())
  
  // 生成词汇材料
  materials.push(generateVocabularyMaterial())
  
  // 根据难度添加更多材料
  if (materialCount > 3) {
    materials.push(generateStoryMaterial())
  }
  
  learningMaterials.value = materials.slice(0, materialCount)
  generateRecallQuestions()
}

const generateStoryMaterial = () => {
  const stories = [
    {
      title: '小镇的秘密',
      content: [
        '在一个名叫绿谷的小镇上，住着一位名叫艾米的年轻图书管理员。',
        '每天傍晚，她都会在镇中心的古老橡树下读书。',
        '有一天，她发现了一本神秘的日记，里面记录着小镇的历史秘密。',
        '日记的作者是100年前的镇长约翰·史密斯，他在日记中提到了一个隐藏的宝藏。'
      ],
      characters: ['艾米', '约翰·史密斯'],
      location: '绿谷小镇',
      time: '傍晚'
    }
  ]
  
  return {
    type: 'story',
    title: '故事记忆',
    story: stories[0]
  }
}

const generateImageMaterial = () => {
  return {
    type: 'image',
    title: '场景记忆',
    image: {
      title: '公园场景',
      description: '一个阳光明媚的下午，公园里有很多人在活动',
      scene: '城市公园',
      elements: [
        { name: '红色气球', x: 20, y: 30, color: '#ff6b6b' },
        { name: '蓝色长椅', x: 60, y: 70, color: '#4ecdc4' },
        { name: '黄色花朵', x: 80, y: 20, color: '#feca57' },
        { name: '绿色大树', x: 10, y: 60, color: '#26de81' },
        { name: '白色小狗', x: 45, y: 50, color: '#ffffff' }
      ]
    }
  }
}

const generateVocabularyMaterial = () => {
  return {
    type: 'vocabulary',
    title: '词汇记忆',
    vocabulary: {
      category: '科学术语',
      pairs: [
        {
          word: 'Photosynthesis',
          pronunciation: '/ˌfoʊtoʊˈsɪnθəsɪs/',
          definition: '光合作用',
          example: '植物通过光合作用制造食物'
        },
        {
          word: 'Ecosystem',
          pronunciation: '/ˈiːkoʊsɪstəm/',
          definition: '生态系统',
          example: '森林是一个复杂的生态系统'
        },
        {
          word: 'Biodiversity',
          pronunciation: '/ˌbaɪoʊdaɪˈvɜːrsəti/',
          definition: '生物多样性',
          example: '保护生物多样性很重要'
        }
      ]
    }
  }
}

const generateRecallQuestions = () => {
  const questions = []
  
  learningMaterials.value.forEach((material, materialIndex) => {
    if (material.type === 'story') {
      questions.push({
        materialIndex,
        type: 'choice',
        question: '故事的主人公是谁？',
        options: ['艾米', '约翰', '史密斯', '玛丽'],
        correctAnswer: '艾米',
        explanation: '故事中明确提到主人公是图书管理员艾米。'
      })
      
      questions.push({
        materialIndex,
        type: 'fill',
        question: '小镇的名字是什么？',
        placeholder: '请输入小镇名称',
        correctAnswer: '绿谷',
        explanation: '故事开头提到小镇名叫绿谷。'
      })
    }
    
    if (material.type === 'image') {
      questions.push({
        materialIndex,
        type: 'choice',
        question: '场景中有什么颜色的气球？',
        options: ['红色', '蓝色', '黄色', '绿色'],
        correctAnswer: '红色',
        explanation: '图片中显示的是红色气球。'
      })
      
      questions.push({
        materialIndex,
        type: 'match',
        question: '请将物品与其颜色进行匹配：',
        leftItems: ['气球', '长椅', '花朵'],
        rightItems: ['红色', '蓝色', '黄色'],
        correctMatches: [['气球', '红色'], ['长椅', '蓝色'], ['花朵', '黄色']],
        explanation: '根据图片中各物品的颜色进行匹配。'
      })
    }
    
    if (material.type === 'vocabulary') {
      questions.push({
        materialIndex,
        type: 'choice',
        question: 'Photosynthesis的中文意思是什么？',
        options: ['光合作用', '呼吸作用', '消化作用', '循环作用'],
        correctAnswer: '光合作用',
        explanation: 'Photosynthesis的中文翻译是光合作用。'
      })
      
      questions.push({
        materialIndex,
        type: 'order',
        question: '请按照词汇学习的顺序排列：',
        items: [
          { id: 1, text: 'Photosynthesis' },
          { id: 2, text: 'Ecosystem' },
          { id: 3, text: 'Biodiversity' }
        ],
        correctOrder: [1, 2, 3],
        explanation: '按照材料中出现的顺序排列。'
      })
    }
  })
  
  recallQuestions.value = questions
}

const startLearningPhase = () => {
  learningTimeLeft.value = difficultySettings.value.studyTime
  
  learningTimer.value = setInterval(() => {
    learningTimeLeft.value--
    if (learningTimeLeft.value <= 0) {
      endLearningPhase()
    }
  }, 1000)
}

const endLearningPhase = () => {
  if (learningTimer.value) {
    clearInterval(learningTimer.value)
  }
  testPhase.value = 'interference'
  startInterferencePhase()
}

const startInterferencePhase = () => {
  interferenceTimeLeft.value = difficultySettings.value.interferenceTime
  interferenceScore.value = 0
  interferenceTaskIndex.value = 0
  generateInterferenceTask()
  
  interferenceTimer.value = setInterval(() => {
    interferenceTimeLeft.value--
    if (interferenceTimeLeft.value <= 0) {
      endInterferencePhase()
    }
  }, 1000)
}

const generateInterferenceTask = () => {
  const taskTypes = ['math', 'color', 'sequence']
  const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)]
  
  switch (taskType) {
    case 'math':
      generateMathTask()
      break
    case 'color':
      generateColorTask()
      break
    case 'sequence':
      generateSequenceTask()
      break
  }
}

const generateMathTask = () => {
  const a = Math.floor(Math.random() * 50) + 10
  const b = Math.floor(Math.random() * 50) + 10
  const operations = ['+', '-', '*']
  const operation = operations[Math.floor(Math.random() * operations.length)]
  
  let answer
  switch (operation) {
    case '+':
      answer = a + b
      break
    case '-':
      answer = a - b
      break
    case '*':
      answer = a * b
      break
  }
  
  currentInterferenceTask.value = {
    type: 'math',
    title: '数学计算',
    instruction: '请超高速自动处理下面的数学题：',
    problem: `${a} ${operation} ${b} = ?`,
    correctAnswer: answer
  }
}

const generateColorTask = () => {
  const colors = ['红色', '蓝色', '绿色', '黄色', '紫色']
  const colorValues = ['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#800080']
  
  const colorName = colors[Math.floor(Math.random() * colors.length)]
  const textColor = colorValues[Math.floor(Math.random() * colorValues.length)]
  
  currentInterferenceTask.value = {
    type: 'color',
    title: '颜色识别',
    instruction: '请选择文字的颜色（不是文字内容）：',
    colorName,
    textColor,
    options: colorValues,
    correctAnswer: textColor
  }
}

const generateSequenceTask = () => {
  const sequences = [
    { sequence: 'A, C, E, G', next: 'I', options: ['H', 'I', 'J', 'K'] },
    { sequence: 'B, D, F, H', next: 'J', options: ['I', 'J', 'K', 'L'] },
    { sequence: 'Z, X, V, T', next: 'R', options: ['Q', 'R', 'S', 'U'] }
  ]
  
  const selectedSequence = sequences[Math.floor(Math.random() * sequences.length)]
  
  currentInterferenceTask.value = {
    type: 'sequence',
    title: '字母序列',
    instruction: '找出字母序列的规律：',
    sequence: selectedSequence.sequence,
    options: selectedSequence.options,
    correctAnswer: selectedSequence.next
  }
}

const submitInterferenceAnswer = () => {
  if (interferenceAnswer.value == currentInterferenceTask.value.correctAnswer) {
    interferenceScore.value++
  }
  
  interferenceAnswer.value = ''
  
  if (interferenceScore.value < interferenceTarget.value && interferenceTimeLeft.value > 0) {
    generateInterferenceTask()
  }
}

const submitColorAnswer = (color) => {
  if (color === currentInterferenceTask.value.correctAnswer) {
    interferenceScore.value++
  }
  
  if (interferenceScore.value < interferenceTarget.value && interferenceTimeLeft.value > 0) {
    generateInterferenceTask()
  }
}

const submitSequenceAnswer = (answer) => {
  if (answer === currentInterferenceTask.value.correctAnswer) {
    interferenceScore.value++
  }
  
  if (interferenceScore.value < interferenceTarget.value && interferenceTimeLeft.value > 0) {
    generateInterferenceTask()
  }
}

const endInterferencePhase = () => {
  if (interferenceTimer.value) {
    clearInterval(interferenceTimer.value)
  }
  testPhase.value = 'recall'
  currentQuestionIndex.value = 0
}

const toggleOrderItem = (item) => {
  const index = selectedOrderItems.value.indexOf(item)
  if (index > -1) {
    selectedOrderItems.value.splice(index, 1)
  } else {
    selectedOrderItems.value.push(item)
  }
}

const selectLeftItem = (item) => {
  selectedLeftItem.value = item
  if (selectedRightItem.value) {
    addConnection()
  }
}

const selectRightItem = (item) => {
  selectedRightItem.value = item
  if (selectedLeftItem.value) {
    addConnection()
  }
}

const addConnection = () => {
  if (selectedLeftItem.value && selectedRightItem.value) {
    // 检查是否已存在连接
    const existingConnection = matchConnections.value.find(
      conn => conn.left === selectedLeftItem.value || conn.right === selectedRightItem.value
    )
    
    if (!existingConnection) {
      matchConnections.value.push({
        left: selectedLeftItem.value,
        right: selectedRightItem.value
      })
    }
    
    selectedLeftItem.value = null
    selectedRightItem.value = null
  }
}

const removeConnection = (index) => {
  matchConnections.value.splice(index, 1)
}

const submitRecallAnswer = () => {
  const result = calculateRecallResult()
  recallResults.value.push(result)
  lastRecallResult.value = result
  
  emit('test-progress', {
    currentQuestion: currentQuestionIndex.value + 1,
    totalQuestions: recallQuestions.value.length,
    result
  })
  
  testPhase.value = 'feedback'
}

const calculateRecallResult = () => {
  const question = currentRecallQuestion.value
  let isCorrect = false
  let score = 0
  const maxScore = 10
  let userAnswer = ''
  
  switch (question.type) {
    case 'choice':
    case 'fill':
      userAnswer = currentAnswer.value
      isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()
      score = isCorrect ? maxScore : 0
      break
    case 'order':
      userAnswer = selectedOrderItems.value.map(item => item.text).join(', ')
      const correctOrder = question.items.sort((a, b) => 
        question.correctOrder.indexOf(a.id) - question.correctOrder.indexOf(b.id)
      )
      isCorrect = selectedOrderItems.value.every((item, index) => 
        item.id === correctOrder[index].id
      )
      score = isCorrect ? maxScore : Math.floor((selectedOrderItems.value.length / question.items.length) * maxScore)
      break
    case 'match':
      userAnswer = matchConnections.value.map(conn => `${conn.left}-${conn.right}`).join(', ')
      let correctMatches = 0
      matchConnections.value.forEach(conn => {
        const isMatch = question.correctMatches.some(match => 
          match[0] === conn.left && match[1] === conn.right
        )
        if (isMatch) correctMatches++
      })
      isCorrect = correctMatches === question.correctMatches.length
      score = Math.floor((correctMatches / question.correctMatches.length) * maxScore)
      break
  }
  
  return {
    score,
    maxScore,
    isCorrect,
    userAnswer,
    correctAnswer: getCorrectAnswerText(question),
    explanation: question.explanation
  }
}

const getCorrectAnswerText = (question) => {
  switch (question.type) {
    case 'choice':
    case 'fill':
      return question.correctAnswer
    case 'order':
      const correctOrder = question.items.sort((a, b) => 
        question.correctOrder.indexOf(a.id) - question.correctOrder.indexOf(b.id)
      )
      return correctOrder.map(item => item.text).join(', ')
    case 'match':
      return question.correctMatches.map(match => `${match[0]}-${match[1]}`).join(', ')
    default:
      return ''
  }
}

const skipRecallQuestion = () => {
  const result = {
    score: 0,
    maxScore: 10,
    isCorrect: false,
    userAnswer: '未回答',
    correctAnswer: getCorrectAnswerText(currentRecallQuestion.value),
    explanation: currentRecallQuestion.value.explanation,
    skipped: true
  }
  
  recallResults.value.push(result)
  lastRecallResult.value = result
  
  nextRecallQuestion()
}

const nextRecallQuestion = () => {
  // 重置答案
  currentAnswer.value = ''
  selectedOrderItems.value = []
  matchConnections.value = []
  selectedLeftItem.value = null
  selectedRightItem.value = null
  
  if (isLastRecallQuestion.value) {
    completeTest()
  } else {
    currentQuestionIndex.value++
    
    // 为排序题准备打乱的选项
    if (currentRecallQuestion.value.type === 'order') {
      shuffledOrderItems.value = [...currentRecallQuestion.value.items].sort(() => Math.random() - 0.5)
    }
    
    testPhase.value = 'recall'
  }
}

const completeTest = () => {
  testPhase.value = 'results'
  
  emit('test-complete', {
    type: 'long-term-memory',
    results: {
      score: finalScore.value,
      accuracy: overallAccuracy.value,
      retentionRate: retentionRate.value,
      completedQuestions: recallResults.value.length,
      memoryStrength: memoryStrength.value,
      questions: recallResults.value
    }
  })
}

const getContentTypeLabel = (type) => {
  const labels = {
    story: '故事',
    image: '图片',
    vocabulary: '词汇'
  }
  return labels[type] || type
}

const getQuestionTypeLabel = (type) => {
  const labels = {
    choice: '选择题',
    fill: '填空题',
    order: '排序题',
    match: '匹配题'
  }
  return labels[type] || type
}

const getContentTypeAccuracy = (type) => {
  const typeResults = recallResults.value.filter((_, index) => {
    const question = recallQuestions.value[index]
    const material = learningMaterials.value[question.materialIndex]
    return material.type === type
  })
  
  if (typeResults.length === 0) return 0
  
  const totalScore = typeResults.reduce((sum, result) => sum + result.score, 0)
  const maxScore = typeResults.reduce((sum, result) => sum + result.maxScore, 0)
  
  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
}

const getQuestionTypeAccuracy = (type) => {
  const typeResults = recallResults.value.filter((_, index) => {
    const question = recallQuestions.value[index]
    return question.type === type
  })
  
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
  if (accuracy >= 90) return '您的长期记忆能力非常出色，能够很好地保持和回忆信息。'
  if (accuracy >= 80) return '您的长期记忆能力良好，大部分信息都能准确回忆。'
  if (accuracy >= 70) return '您的长期记忆能力一般，还有提升的空间。'
  return '您的长期记忆能力需要加强，建议进行更多的记忆训练。'
}

// 生命周期
onMounted(() => {
  // 初始化
})

onUnmounted(() => {
  if (learningTimer.value) clearInterval(learningTimer.value)
  if (interferenceTimer.value) clearInterval(interferenceTimer.value)
})

// 监听难度变化
watch(() => props.difficulty, () => {
  if (testPhase.value === 'instruction') {
    // 重新生成测试数据
  }
})

// 监听当前问题变化，为排序题准备数据
watch(currentRecallQuestion, (newQuestion) => {
  if (newQuestion && newQuestion.type === 'order') {
    shuffledOrderItems.value = [...newQuestion.items].sort(() => Math.random() - 0.5)
  }
}, { immediate: true })
</script>

<style scoped>
.long-term-memory-test {
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

.learning-phase {
  padding: 2rem;
}

.learning-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.learning-header h4 {
  color: var(--color-primary);
}

.learning-timer {
  display: flex;
  align-items: center;
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

.learning-content {
  margin-bottom: 2rem;
}

.story-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
}

.story-container h5 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.story-text {
  margin-bottom: 1.5rem;
}

.story-text p {
  margin-bottom: 1rem;
  line-height: 1.8;
  color: #333;
}

.story-details {
  border-top: 1px solid #ddd;
  padding-top: 1rem;
}

.detail-item {
  margin-bottom: 0.5rem;
  color: #666;
}

.detail-item strong {
  color: #333;
}

.image-container {
  display: grid;
  gap: 2rem;
}

.image-placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  height: 300px;
  position: relative;
  overflow: hidden;
}

.image-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-elements {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-element {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translate(-50%, -50%);
}

.image-description {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.image-description h5 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.vocabulary-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
}

.vocabulary-container h5 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.word-pairs {
  display: grid;
  gap: 1.5rem;
}

.word-pair {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.5s ease forwards;
}

.word {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.word-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-primary);
}

.word-pronunciation {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.definition {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.definition-text {
  font-weight: bold;
  color: #333;
}

.example-text {
  color: #666;
  font-style: italic;
}

.learning-tips {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.tip-icon {
  font-size: 1.5rem;
}

.tip-text {
  color: #333;
  font-weight: 500;
}

.interference-phase {
  padding: 2rem;
}

.interference-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.interference-header h4 {
  color: var(--color-primary);
}

.interference-timer {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ff6b6b;
}

.interference-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
}

.interference-task h5 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.math-interference {
  text-align: center;
}

.math-problem {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.problem-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.answer-input {
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1.2rem;
  text-align: center;
  width: 100px;
}

.answer-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.btn-submit-interference {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-submit-interference:hover {
  background: var(--color-primary-dark);
}

.interference-score {
  margin-top: 1rem;
  font-weight: bold;
  color: #333;
}

.color-interference {
  text-align: center;
}

.color-task {
  margin-bottom: 1rem;
}

.color-word {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.color-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.color-option-btn {
  width: 60px;
  height: 60px;
  border: 3px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-option-btn:hover {
  transform: scale(1.1);
  border-color: var(--color-primary);
}

.sequence-interference {
  text-align: center;
}

.sequence-display {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
  letter-spacing: 2px;
}

.sequence-question {
  margin-bottom: 1rem;
  color: #666;
}

.sequence-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.sequence-option-btn {
  width: 50px;
  height: 50px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sequence-option-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.recall-phase {
  padding: 2rem;
}

.recall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.recall-header h4 {
  color: var(--color-primary);
}

.recall-progress {
  background: #e3f2fd;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  color: var(--color-primary);
}

.recall-content {
  margin-bottom: 2rem;
}

.question-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
}

.question-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.choice-question {
  margin-top: 1rem;
}

.choice-options {
  display: grid;
  gap: 1rem;
}

.choice-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.choice-option:hover {
  border-color: var(--color-primary);
  background: #f0f8ff;
}

.choice-option input[type="radio"] {
  margin: 0;
}

.option-text {
  font-weight: 500;
  color: #333;
}

.fill-question {
  margin-top: 1rem;
}

.fill-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1.1rem;
}

.fill-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.order-question {
  margin-top: 1rem;
}

.order-instruction {
  margin-bottom: 1rem;
  color: #666;
  font-weight: 500;
}

.order-items {
  display: grid;
  gap: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.order-item:hover {
  border-color: var(--color-primary);
  background: #f0f8ff;
}

.order-item.selected {
  border-color: var(--color-primary);
  background: #e3f2fd;
}

.order-number {
  width: 30px;
  height: 30px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.item-text {
  font-weight: 500;
  color: #333;
}

.match-question {
  margin-top: 1rem;
}

.match-instruction {
  margin-bottom: 1rem;
  color: #666;
  font-weight: 500;
}

.match-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: start;
}

.match-left,
.match-right {
  display: grid;
  gap: 1rem;
}

.match-item {
  padding: 1rem;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  font-weight: 500;
}

.match-item:hover {
  border-color: var(--color-primary);
  background: #f0f8ff;
}

.match-item.selected {
  border-color: var(--color-primary);
  background: #e3f2fd;
}

.match-connections {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.connection-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: #e3f2fd;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #333;
}

.remove-connection {
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recall-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-submit,
.btn-skip {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
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
  background: #ccc;
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
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
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
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.feedback-score {
  color: #666;
  font-weight: 500;
}

.feedback-details {
  margin-bottom: 2rem;
  text-align: left;
}

.answer-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.correct-answer,
.user-answer {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
}

.correct-answer h5,
.user-answer h5 {
  margin-bottom: 1rem;
  color: #333;
}

.answer-content {
  padding: 1rem;
  border-radius: 4px;
  font-weight: 500;
}

.answer-content.correct {
  background: #d4edda;
  color: #155724;
}

.answer-content.incorrect {
  background: #f8d7da;
  color: #721c24;
}

.explanation {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
}

.explanation h5 {
  margin-bottom: 1rem;
  color: #333;
}

.explanation p {
  color: #666;
  line-height: 1.6;
}

.btn-continue {
  padding: 1rem 2rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
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
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.result-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.result-card:hover {
  transform: translateY(-2px);
}

.result-icon {
  font-size: 2.5rem;
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
  font-weight: 500;
}

.detailed-analysis {
  margin-bottom: 3rem;
}

.detailed-analysis h4 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
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
  text-align: center;
}

.type-chart,
.question-type-chart {
  display: grid;
  gap: 1rem;
}

.type-bar {
  display: grid;
  grid-template-columns: 100px 1fr 60px;
  gap: 1rem;
  align-items: center;
}

.type-label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.bar-container {
  background: #e0e0e0;
  border-radius: 10px;
  height: 20px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  border-radius: 10px;
  transition: width 0.5s ease;
}

.accuracy-value {
  font-weight: bold;
  color: var(--color-primary);
  font-size: 0.9rem;
  text-align: right;
}

.decay-analysis {
  display: grid;
  gap: 1rem;
}

.decay-chart {
  display: grid;
  gap: 1rem;
}

.decay-bar {
  display: grid;
  grid-template-columns: 100px 1fr 60px;
  gap: 1rem;
  align-items: center;
}

.decay-label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.decay-rate {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.decay-value {
  font-weight: bold;
  color: #ff6b6b;
}

.performance-feedback {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.performance-feedback h4 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.feedback-content {
  display: grid;
  gap: 2rem;
}

.feedback-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
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
  font-size: 2rem;
  width: auto;
  height: auto;
  background: none;
}

.feedback-item .feedback-text {
  flex: 1;
}

.feedback-item .feedback-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.feedback-item .feedback-description {
  color: #666;
  line-height: 1.6;
}

.improvement-suggestions {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.improvement-suggestions h5 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.improvement-suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.improvement-suggestions li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
  line-height: 1.6;
}

.improvement-suggestions li:last-child {
  border-bottom: none;
}

.improvement-suggestions li:before {
  content: "💡";
  margin-right: 0.5rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@media (max-width: 768px) {
  .long-term-memory-test {
    padding: 0.5rem;
  }
  
  .instruction-phase,
  .learning-phase,
  .interference-phase,
  .recall-phase,
  .feedback-phase,
  .results-phase {
    padding: 1rem;
  }
  
  .learning-header,
  .interference-header,
  .recall-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .overall-results {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .result-card {
    padding: 1rem;
  }
  
  .result-icon {
    font-size: 2rem;
  }
  
  .result-value {
    font-size: 1.5rem;
  }
  
  .analysis-grid {
    gap: 1rem;
  }
  
  .answer-comparison {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .match-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .type-bar,
  .decay-bar {
    grid-template-columns: 80px 1fr 50px;
    gap: 0.5rem;
  }
  
  .type-label,
  .decay-label {
    font-size: 0.8rem;
  }
  
  .accuracy-value {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .instruction-steps {
    gap: 0.5rem;
  }
  
  .step-item {
    padding: 0.75rem;
    gap: 0.75rem;
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
    gap: 0.25rem;
  }
  
  .word-pair {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .color-options,
  .sequence-options {
    gap: 0.5rem;
  }
  
  .color-option-btn {
    width: 50px;
    height: 50px;
  }
  
  .sequence-option-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .recall-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-submit,
  .btn-skip,
  .btn-continue {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
  
  .feedback-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .feedback-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .feedback-title {
    font-size: 1.1rem;
  }
}
</style>