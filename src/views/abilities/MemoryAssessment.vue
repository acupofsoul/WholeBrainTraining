<template>
  <div class="memory-assessment">
    <!-- 测评设置阶段 -->
    <div v-if="currentPhase === 'setup'" class="setup-phase">
      <div class="setup-content">
        <h2>记忆能力测评</h2>
        <p class="assessment-description">
          全面评估您的记忆能力，包括数字记忆、图像记忆、单词记忆和序列记忆等多个维度。
        </p>
        
        <!-- 快速设置预览 -->
        <div class="quick-settings-preview">
          <div class="preview-item">
            <span class="preview-label">已选模块:</span>
            <span class="preview-value">{{ selectedModulesText }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">难度等级:</span>
            <span class="preview-value">{{ difficultyText }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">预计时长:</span>
            <span class="preview-value">{{ estimatedDuration }}分钟</span>
          </div>
        </div>
        
        <!-- 设置按钮 -->
        <div class="settings-actions">
          <SettingsButton 
            text="配置测评参数"
            @click="openSettings"
          />
        </div>
            
        
        <!-- 开始按钮 -->
        <div class="setup-actions">
          <button 
            @click="startAssessment" 
            :disabled="!canStartAssessment"
            class="btn-start"
          >
            开始测评
          </button>
        </div>
      </div>
    </div>
    
    <!-- 设置弹窗 -->
    <SettingsModal
      v-if="showSettingsModal"
      :visible="showSettingsModal"
      title="记忆能力测评设置"
      :settings="settings"
      :available-modules="availableModules"
      :difficulty-levels="difficultyLevels"
      :assessment-modes="assessmentModes"
      @close="closeSettings"
      @save="saveSettings"
      @reset="resetSettings"
    />
    
    <!-- 测评进行阶段 -->
    <div v-if="currentPhase === 'testing'" class="testing-phase">
      <div class="testing-header">
        <div class="progress-section">
          <h3>记忆能力测评进行中</h3>
          <div class="overall-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: overallProgress + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ currentModuleIndex + 1 }} / {{ settings.selectedModules?.length || 0 }}</span>
          </div>
        </div>
        
        <div class="current-module-info">
          <div class="module-name">
            <span class="module-icon">{{ currentModuleInfo?.icon }}</span>
            <span>{{ currentModuleInfo?.name }}</span>
          </div>
          <div class="timer" v-if="settings.enableProgress">
            <span class="timer-icon">⏱️</span>
            <span>{{ formatTime(totalElapsedTime) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 动态测试内容 -->
      <div class="test-content">
        <component 
          :is="currentTestComponent"
          :difficulty="selectedDifficulty"
          :enable-hints="enableHints"
          :enable-feedback="enableFeedback"
          :assessment-mode="assessmentMode"
          @test-complete="handleTestComplete"
          @test-progress="handleTestProgress"
        />
      </div>
    </div>
    
    <!-- 结果展示阶段 -->
    <div v-if="currentPhase === 'results'" class="results-phase">
      <div class="results-header">
        <h2>记忆能力测评报告</h2>
        <p class="completion-time">完成时间: {{ formatDate(completionTime) }}</p>
      </div>
      
      <!-- 综合得分 -->
      <div class="overall-score">
        <div class="score-circle">
          <div class="score-value">{{ overallScore }}</div>
          <div class="score-label">综合得分</div>
        </div>
        <div class="score-level">
          <div class="level-badge" :class="getScoreLevel(overallScore).class">
            {{ getScoreLevel(overallScore).label }}
          </div>
          <p class="level-description">{{ getScoreLevel(overallScore).description }}</p>
        </div>
      </div>
      
      <!-- 能力分析雷达图 -->
      <div class="ability-radar">
        <h3>记忆能力分析</h3>
        <div class="radar-container">
          <div class="radar-chart">
            <!-- 简化的雷达图实现 -->
            <div class="radar-grid">
              <div class="radar-axis" v-for="(ability, index) in memoryAbilities" :key="ability.key">
                <div 
                  class="axis-line" 
                  :style="{ transform: `rotate(${index * (360 / memoryAbilities.length)}deg)` }"
                ></div>
                <div 
                  class="axis-label"
                  :style="{ 
                    transform: `rotate(${index * (360 / memoryAbilities.length)}deg) translate(120px) rotate(-${index * (360 / memoryAbilities.length)}deg)` 
                  }"
                >
                  {{ ability.name }}
                </div>
              </div>
            </div>
            <div class="radar-data">
              <div 
                v-for="(ability, index) in memoryAbilities" 
                :key="ability.key"
                class="data-point"
                :style="{ 
                  transform: `rotate(${index * (360 / memoryAbilities.length)}deg) translate(${ability.score}px)`,
                  backgroundColor: ability.color
                }"
              ></div>
            </div>
          </div>
          <div class="radar-legend">
            <div 
              v-for="ability in memoryAbilities" 
              :key="ability.key"
              class="legend-item"
            >
              <div class="legend-color" :style="{ backgroundColor: ability.color }"></div>
              <span class="legend-label">{{ ability.name }}</span>
              <span class="legend-score">{{ ability.score }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 模块详细结果 -->
      <div class="module-results">
        <h3>模块详细结果</h3>
        <div class="results-grid">
          <div 
            v-for="result in moduleResults" 
            :key="result.moduleKey"
            class="result-card"
          >
            <div class="result-header">
              <div class="result-icon">{{ getModuleIcon(result.moduleKey) }}</div>
              <div class="result-title">
                <h4>{{ getModuleName(result.moduleKey) }}</h4>
                <div class="result-score">{{ result.score }}分</div>
              </div>
            </div>
            
            <div class="result-metrics">
              <div class="metric-item">
                <span class="metric-label">准确率</span>
                <span class="metric-value">{{ result.accuracy }}%</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">平均用时</span>
                <span class="metric-value">{{ result.averageTime }}s</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">完成题数</span>
                <span class="metric-value">{{ result.completedQuestions }}</span>
              </div>
            </div>
            
            <div class="result-performance">
              <div class="performance-bar">
                <div 
                  class="performance-fill" 
                  :style="{ width: result.score + '%' }"
                  :class="getPerformanceClass(result.score)"
                ></div>
              </div>
              <div class="performance-label">{{ getPerformanceLabel(result.score) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 题目详情 -->
      <div class="question-details" v-if="showQuestionDetails">
        <h3>题目详情</h3>
        <div class="details-tabs">
          <button 
            v-for="result in moduleResults" 
            :key="result.moduleKey"
            :class="['tab-button', { 'active': activeDetailTab === result.moduleKey }]"
            @click="activeDetailTab = result.moduleKey"
          >
            {{ getModuleName(result.moduleKey) }}
          </button>
        </div>
        
        <div class="details-content">
          <div 
            v-for="result in moduleResults" 
            :key="result.moduleKey"
            v-show="activeDetailTab === result.moduleKey"
            class="detail-panel"
          >
            <div class="question-list">
              <div 
                v-for="(question, index) in result.questions" 
                :key="index"
                :class="['question-item', { 'correct': question.isCorrect, 'incorrect': !question.isCorrect }]"
              >
                <div class="question-number">{{ index + 1 }}</div>
                <div class="question-content">
                  <div class="question-text">{{ question.question }}</div>
                  <div class="question-answer">
                    <span class="user-answer">您的答案: {{ question.userAnswer || '未作答' }}</span>
                    <span class="correct-answer">正确答案: {{ question.correctAnswer }}</span>
                  </div>
                </div>
                <div class="question-result">
                  <div class="result-icon">{{ question.isCorrect ? '✅' : '❌' }}</div>
                  <div class="result-time">{{ question.timeSpent }}s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 改进建议 -->
      <div class="improvement-suggestions">
        <h3>改进建议</h3>
        <div class="suggestions-grid">
          <div 
            v-for="suggestion in improvementSuggestions" 
            :key="suggestion.type"
            :class="['suggestion-card', suggestion.priority]"
          >
            <div class="suggestion-icon">{{ suggestion.icon }}</div>
            <div class="suggestion-content">
              <h4>{{ suggestion.title }}</h4>
              <p>{{ suggestion.description }}</p>
              <div class="suggestion-actions">
                <button 
                  v-for="action in suggestion.actions" 
                  :key="action.label"
                  @click="handleSuggestionAction(action)"
                  class="suggestion-action"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="results-actions">
        <button @click="exportReport" class="btn-export">
          <span class="btn-icon">📊</span>
          导出报告
        </button>
        <button @click="retakeAssessment" class="btn-retake">
          <span class="btn-icon">🔄</span>
          重新测评
        </button>
        <button @click="goToTraining" class="btn-training">
          <span class="btn-icon">🎯</span>
          前往训练
        </button>
        <button @click="toggleQuestionDetails" class="btn-details">
          <span class="btn-icon">📋</span>
          {{ showQuestionDetails ? '隐藏' : '显示' }}题目详情
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAbilityTestSettings } from '@/composables/useAbilityTestSettings'
// import { useAbilityTestStore } from '@/stores/abilityTestStore' // 暂时移除，使用localStorage代替
import { useRouter } from 'vue-router'
import NumberMemoryTest from './tests/NumberMemoryTest.vue'
import ImageMemoryTest from './tests/ImageMemoryTest.vue'
import WordMemoryTest from './tests/WordMemoryTest.vue'
import SequenceMemoryTest from './tests/SequenceMemoryTest.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import SettingsButton from '@/components/SettingsButton.vue'

// 路由和存储
const router = useRouter()
// const abilityTestStore = useAbilityTestStore() // 暂时移除

// 设置管理
const {
  settings,
  showSettingsModal,
  openSettings,
  closeSettings,
  saveSettings,
  resetSettings
} = useAbilityTestSettings('memory')

// 响应式数据
const currentPhase = ref('setup') // setup, testing, results
const currentModuleIndex = ref(0)
const moduleResults = ref([])
const totalElapsedTime = ref(0)
const testTimer = ref(null)
const showQuestionDetails = ref(false)
const activeDetailTab = ref('')
const testSettings = ref({})

// 可用模块定义
const availableModules = [
  {
    key: 'number',
    name: '数字记忆',
    description: '测试对数字序列的记忆能力',
    icon: '🔢',
    questionCount: 15,
    duration: 8,
    component: 'NumberMemoryTest'
  },
  {
    key: 'image',
    name: '图像记忆',
    description: '测试对图像内容的记忆能力',
    icon: '🖼️',
    questionCount: 12,
    duration: 10,
    component: 'ImageMemoryTest'
  },
  {
    key: 'word',
    name: '单词记忆',
    description: '测试对词汇的记忆能力',
    icon: '📝',
    questionCount: 20,
    duration: 12,
    component: 'WordMemoryTest'
  },
  {
    key: 'sequence',
    name: '序列记忆',
    description: '测试对序列模式的记忆能力',
    icon: '🔗',
    questionCount: 10,
    duration: 6,
    component: 'SequenceMemoryTest'
  }
]

// 记忆能力维度
const memoryAbilities = ref([
  { key: 'number', name: '数字记忆', score: 0, color: '#007bff' },
  { key: 'image', name: '图像记忆', score: 0, color: '#28a745' },
  { key: 'word', name: '单词记忆', score: 0, color: '#ffc107' },
  { key: 'sequence', name: '序列记忆', score: 0, color: '#dc3545' }
])

// 难度等级定义
const difficultyLevels = [
  { value: 'easy', label: '简单', description: '适合初学者' },
  { value: 'medium', label: '中等', description: '适合有一定基础的用户' },
  { value: 'hard', label: '困难', description: '适合高级用户挑战' }
]

// 测评模式定义
const assessmentModes = [
  { value: 'comprehensive', label: '综合测评', description: '全面评估记忆能力' },
  { value: 'quick', label: '快速测评', description: '快速了解记忆水平' },
  { value: 'detailed', label: '详细测评', description: '深入分析记忆表现' }
]

// 计算属性
const selectedModulesText = computed(() => {
  if (!settings.value.selectedModules?.length) return '未选择'
  return settings.value.selectedModules.map(key => {
    const module = availableModules.find(m => m.key === key)
    return module?.name || key
  }).join('、')
})

const difficultyText = computed(() => {
  const difficulty = difficultyLevels.find(d => d.value === settings.value.difficulty)
  return difficulty?.label || '中等'
})

const estimatedDuration = computed(() => {
  if (!settings.value.selectedModules?.length) return 0
  return settings.value.selectedModules.reduce((total, moduleKey) => {
    const module = availableModules.find(m => m.key === moduleKey)
    return total + (module?.duration || 0)
  }, 0)
})

const canStartAssessment = computed(() => {
  return settings.value.selectedModules?.length > 0
})

const overallProgress = computed(() => {
  if (!settings.value.selectedModules?.length) return 0
  return (currentModuleIndex.value / settings.value.selectedModules.length) * 100
})

const currentModuleInfo = computed(() => {
  if (currentModuleIndex.value >= settings.value.selectedModules?.length) return null
  const moduleKey = settings.value.selectedModules[currentModuleIndex.value]
  return availableModules.find(m => m.key === moduleKey)
})

const currentTestComponent = computed(() => {
  const componentMap = {
    'number': NumberMemoryTest,
    'image': ImageMemoryTest,
    'word': WordMemoryTest,
    'sequence': SequenceMemoryTest
  }
  return componentMap[currentModuleInfo.value?.key] || null
})

// 记忆能力分数计算
const numberMemoryScore = computed(() => {
  const result = moduleResults.value.find(r => r.moduleKey === 'number')
  return result?.score || 0
})

const imageMemoryScore = computed(() => {
  const result = moduleResults.value.find(r => r.moduleKey === 'image')
  return result?.score || 0
})

const wordMemoryScore = computed(() => {
  const result = moduleResults.value.find(r => r.moduleKey === 'word')
  return result?.score || 0
})

const sequenceMemoryScore = computed(() => {
  const result = moduleResults.value.find(r => r.moduleKey === 'sequence')
  return result?.score || 0
})

const abilityScores = computed(() => [
  { name: '数字记忆', score: numberMemoryScore.value, color: '#007bff' },
  { name: '图像记忆', score: imageMemoryScore.value, color: '#28a745' },
  { name: '单词记忆', score: wordMemoryScore.value, color: '#ffc107' },
  { name: '序列记忆', score: sequenceMemoryScore.value, color: '#dc3545' }
])

const totalQuestions = computed(() => {
  return moduleResults.value.reduce((total, result) => total + (result.totalQuestions || 0), 0)
})

const correctAnswers = computed(() => {
  return moduleResults.value.reduce((total, result) => total + (result.correctAnswers || 0), 0)
})

const overallAccuracy = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((correctAnswers.value / totalQuestions.value) * 100)
})

const averageReactionTime = computed(() => {
  if (moduleResults.value.length === 0) return 0
  const totalTime = moduleResults.value.reduce((total, result) => total + (result.averageTime || 0), 0)
  return Math.round(totalTime / moduleResults.value.length)
})

const overallScore = computed(() => {
  if (moduleResults.value.length === 0) return 0
  const totalScore = moduleResults.value.reduce((sum, result) => sum + result.score, 0)
  return Math.round(totalScore / moduleResults.value.length)
})

const improvementSuggestions = computed(() => {
  const suggestions = []
  
  // 基于整体表现的建议
  if (overallScore.value < 60) {
    suggestions.push({
      type: 'overall',
      priority: 'high',
      icon: '🎯',
      title: '加强基础记忆训练',
      description: '您的整体记忆能力有较大提升空间，建议从基础记忆训练开始。',
      actions: [
        { label: '开始基础训练', action: 'basic-training' },
        { label: '查看训练计划', action: 'training-plan' }
      ]
    })
  }
  
  // 基于模块表现的建议
  moduleResults.value.forEach(result => {
    if (result.score < 70) {
      const moduleName = getModuleName(result.moduleKey)
      suggestions.push({
        type: result.moduleKey,
        priority: 'medium',
        icon: getModuleIcon(result.moduleKey),
        title: `提升${moduleName}能力`,
        description: `您在${moduleName}方面的表现需要加强，建议进行针对性训练。`,
        actions: [
          { label: '专项训练', action: `${result.moduleKey}-training` },
          { label: '学习技巧', action: `${result.moduleKey}-tips` }
        ]
      })
    }
  })
  
  // 通用建议
  suggestions.push({
    type: 'general',
    priority: 'low',
    icon: '💡',
    title: '保持规律练习',
    description: '记忆能力需要持续练习来维持和提升，建议制定规律的训练计划。',
    actions: [
      { label: '制定计划', action: 'create-plan' },
      { label: '设置提醒', action: 'set-reminder' }
    ]
  })
  
  return suggestions
})

// 方法
const startAssessment = () => {
  if (!canStartAssessment.value) return
  
  currentPhase.value = 'testing'
  currentModuleIndex.value = 0
  moduleResults.value = []
  totalElapsedTime.value = 0
  
  // 准备测试设置
  testSettings.value = {
    difficulty: settings.value.difficulty,
    mode: settings.value.mode,
    enableHints: settings.value.enableHints,
    enableFeedback: settings.value.enableFeedback,
    enableProgress: settings.value.enableProgress
  }
  
  startTimer()
}

const startTimer = () => {
  const startTime = Date.now()
  testTimer.value = setInterval(() => {
    totalElapsedTime.value = Math.floor((Date.now() - startTime) / 1000)
  }, 1000)
}

const stopTimer = () => {
  if (testTimer.value) {
    clearInterval(testTimer.value)
    testTimer.value = null
  }
}

const getCurrentModule = () => {
  return currentModuleInfo.value
}

const handleTestComplete = (result) => {
  // 保存当前模块结果
  const moduleKey = settings.value.selectedModules[currentModuleIndex.value]
  moduleResults.value.push({
    moduleKey,
    ...result
  })
  
  // 进入下一个模块或完成测评
  currentModuleIndex.value++
  if (currentModuleIndex.value >= settings.value.selectedModules.length) {
    finishAssessment()
  }
}

const handleTestProgress = (progress) => {
  // 处理测试进度更新
  console.log('Test progress:', progress)
}

const finishAssessment = () => {
  currentPhase.value = 'results'
  stopTimer()
  
  // 保存结果到store
  const assessmentResult = {
    type: 'memory',
    timestamp: new Date().toISOString(),
    settings: { ...testSettings.value },
    results: moduleResults.value,
    overallScore: overallScore.value,
    totalTime: totalElapsedTime.value,
    abilityScores: abilityScores.value
  }
  
  // 使用localStorage保存测评结果
  const savedResults = JSON.parse(localStorage.getItem('memoryAssessmentResults') || '[]')
  savedResults.push(assessmentResult)
  localStorage.setItem('memoryAssessmentResults', JSON.stringify(savedResults))
  
  // 设置默认详情标签
  if (moduleResults.value.length > 0) {
    activeDetailTab.value = moduleResults.value[0].moduleKey
  }
}

const getModuleName = (moduleKey) => {
  const module = availableModules.find(m => m.key === moduleKey)
  return module?.name || '未知模块'
}

const getModuleIcon = (moduleKey) => {
  const module = availableModules.find(m => m.key === moduleKey)
  return module?.icon || '❓'
}

const getScoreLevel = (score) => {
  if (score >= 90) {
    return { class: 'excellent', label: '优秀', description: '您的记忆能力非常出色！' }
  } else if (score >= 80) {
    return { class: 'good', label: '良好', description: '您的记忆能力表现良好。' }
  } else if (score >= 70) {
    return { class: 'average', label: '一般', description: '您的记忆能力处于平均水平。' }
  } else if (score >= 60) {
    return { class: 'below-average', label: '偏低', description: '您的记忆能力有提升空间。' }
  } else {
    return { class: 'poor', label: '较差', description: '建议加强记忆训练。' }
  }
}

const getPerformanceClass = (score) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'average'
  if (score >= 60) return 'below-average'
  return 'poor'
}

const getPerformanceLabel = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '一般'
  if (score >= 60) return '偏低'
  return '较差'
}

const formatDate = (date) => {
  if (!date) return ''
  return date.toLocaleString('zh-CN')
}

const restartAssessment = () => {
  currentPhase.value = 'setup'
  currentModuleIndex.value = 0
  moduleResults.value = []
  totalElapsedTime.value = 0
  showQuestionDetails.value = false
  stopTimer()
}

const exportReport = () => {
  // 导出测评报告逻辑
  const reportData = {
    type: 'memory-assessment',
    timestamp: new Date().toISOString(),
    overallScore: overallScore.value,
    moduleResults: moduleResults.value,
    settings: testSettings.value
  }
  
  const dataStr = JSON.stringify(reportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `记忆能力测评报告_${new Date().toLocaleDateString()}.json`
  link.click()
  URL.revokeObjectURL(url)
  console.log('导出记忆能力测评报告')
}

const retakeAssessment = () => {
  restartAssessment()
}

const goToTraining = () => {
  router.push('/training/memory')
}

const goHome = () => {
  router.push('/abilities')
}

const toggleQuestionDetails = () => {
  showQuestionDetails.value = !showQuestionDetails.value
}

const handleSuggestionAction = (action) => {
  // 处理建议操作
  console.log('执行建议操作:', action)
}

const getOverallEvaluation = () => {
  const score = overallScore.value
  if (score >= 90) return '您的记忆能力非常出色，继续保持！'
  if (score >= 80) return '您的记忆能力表现良好，可以尝试更高难度的挑战。'
  if (score >= 70) return '您的记忆能力处于平均水平，通过训练可以进一步提升。'
  if (score >= 60) return '您的记忆能力有提升空间，建议进行系统性训练。'
  return '建议从基础记忆训练开始，循序渐进地提升能力。'
}

const getImprovementSuggestions = () => {
  const suggestions = []
  
  if (numberMemoryScore.value < 70) {
    suggestions.push('加强数字记忆训练，可以尝试记忆电话号码、日期等')
  }
  if (imageMemoryScore.value < 70) {
    suggestions.push('提升图像记忆能力，可以练习观察和回忆图片细节')
  }
  if (wordMemoryScore.value < 70) {
    suggestions.push('增强词汇记忆，可以通过阅读和词汇练习来改善')
  }
  if (sequenceMemoryScore.value < 70) {
    suggestions.push('训练序列记忆，可以练习记忆数字序列、字母序列等')
  }
  
  return suggestions
}

// 生命周期
onMounted(() => {
  // 组件挂载时的初始化
})

onUnmounted(() => {
  stopTimer()
})

// 在 <script setup> 中，所有的变量和函数都会自动暴露给模板，无需 return 语句
</script>

<style scoped>
.memory-assessment {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* 测评设置阶段样式 */
.setup-phase {
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.setup-content h2 {
  font-size: 2.5em;
  color: #495057;
  text-align: center;
  margin-bottom: 20px;
}

.assessment-description {
  font-size: 1.2em;
  color: #6c757d;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.assessment-modules h3,
.assessment-settings h3 {
  font-size: 1.5em;
  color: #495057;
  margin-bottom: 25px;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.module-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.module-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
}

.module-card.selected {
  border-color: #007bff;
  background: #f8f9ff;
}

.module-icon {
  font-size: 2.5em;
  width: 60px;
  text-align: center;
}

.module-info {
  flex: 1;
}

.module-info h4 {
  font-size: 1.2em;
  color: #495057;
  margin-bottom: 8px;
}

.module-info p {
  color: #6c757d;
  line-height: 1.5;
  margin-bottom: 10px;
}

.module-stats {
  display: flex;
  gap: 15px;
  font-size: 0.9em;
  color: #6c757d;
}

.module-checkbox {
  width: 30px;
  height: 30px;
}

.checkbox {
  width: 100%;
  height: 100%;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 0.3s ease;
}

.checkbox.checked {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-group label {
  font-weight: 600;
  color: #495057;
}

.setting-group select {
  padding: 10px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1em;
  background: white;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.estimated-time {
  text-align: center;
  margin-bottom: 40px;
}

.time-info {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
  padding: 15px 25px;
  border-radius: 25px;
  font-size: 1.1em;
  color: #495057;
}

.time-icon {
  font-size: 1.2em;
}

.setup-actions {
  text-align: center;
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

.btn-start:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

.btn-start:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 测评进行阶段样式 */
.testing-phase {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.testing-header {
  margin-bottom: 30px;
}

.progress-section h3 {
  font-size: 1.8em;
  color: #495057;
  text-align: center;
  margin-bottom: 20px;
}

.overall-progress {
  display: flex;
  align-items: center;
  gap: 15px;
  max-width: 600px;
  margin: 0 auto 20px;
}

.progress-bar {
  flex: 1;
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.5s ease;
}

.progress-text {
  font-weight: 600;
  color: #495057;
  min-width: 60px;
  text-align: center;
}

.current-module-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
}

.module-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
}

.timer {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
}

.test-content {
  min-height: 400px;
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

.results-header h2 {
  font-size: 2.5em;
  color: #495057;
  margin-bottom: 10px;
}

.completion-time {
  color: #6c757d;
  font-size: 1.1em;
}

.overall-score {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff, #0056b3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
}

.score-value {
  font-size: 3em;
  font-weight: 600;
}

.score-label {
  font-size: 1em;
  margin-top: 5px;
}

.score-level {
  text-align: center;
}

.level-badge {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 10px;
}

.level-badge.excellent {
  background: #d4edda;
  color: #155724;
}

.level-badge.good {
  background: #d1ecf1;
  color: #0c5460;
}

.level-badge.average {
  background: #fff3cd;
  color: #856404;
}

.level-badge.below-average {
  background: #f8d7da;
  color: #721c24;
}

.level-badge.poor {
  background: #f5c6cb;
  color: #721c24;
}

.level-description {
  color: #6c757d;
  font-size: 1.1em;
  line-height: 1.5;
}

.ability-radar {
  margin-bottom: 50px;
}

.ability-radar h3 {
  font-size: 1.8em;
  color: #495057;
  text-align: center;
  margin-bottom: 30px;
}

.radar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}

.radar-chart {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

.radar-grid {
  position: absolute;
  width: 100%;
  height: 100%;
}

.radar-axis {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.axis-line {
  position: absolute;
  width: 2px;
  height: 50%;
  background: #e9ecef;
  left: 50%;
  top: 0;
  transform-origin: bottom;
}

.axis-label {
  position: absolute;
  font-size: 0.9em;
  color: #495057;
  font-weight: 600;
  white-space: nowrap;
  transform-origin: center;
}

.radar-data {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.data-point {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform-origin: center;
}

.radar-legend {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.legend-label {
  flex: 1;
  color: #495057;
}

.legend-score {
  font-weight: 600;
  color: #007bff;
}

.module-results {
  margin-bottom: 50px;
}

.module-results h3 {
  font-size: 1.8em;
  color: #495057;
  margin-bottom: 30px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.result-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.result-card:hover {
  transform: translateY(-5px);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.result-icon {
  font-size: 2em;
  width: 50px;
  text-align: center;
}

.result-title {
  flex: 1;
}

.result-title h4 {
  font-size: 1.3em;
  color: #495057;
  margin-bottom: 5px;
}

.result-score {
  font-size: 1.5em;
  font-weight: 600;
  color: #007bff;
}

.result-metrics {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.metric-item:last-child {
  border-bottom: none;
}

.metric-label {
  color: #6c757d;
  font-size: 0.9em;
}

.metric-value {
  font-weight: 600;
  color: #495057;
}

.result-performance {
  text-align: center;
}

.performance-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.performance-fill {
  height: 100%;
  transition: width 0.8s ease;
}

.performance-fill.excellent {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.performance-fill.good {
  background: linear-gradient(90deg, #17a2b8, #20c997);
}

.performance-fill.average {
  background: linear-gradient(90deg, #ffc107, #fd7e14);
}

.performance-fill.below-average {
  background: linear-gradient(90deg, #fd7e14, #dc3545);
}

.performance-fill.poor {
  background: linear-gradient(90deg, #dc3545, #c82333);
}

.performance-label {
  font-size: 0.9em;
  font-weight: 600;
  color: #495057;
}

.question-details {
  margin-bottom: 50px;
}

.question-details h3 {
  font-size: 1.8em;
  color: #495057;
  margin-bottom: 25px;
}

.details-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.tab-button {
  padding: 10px 20px;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #495057;
}

.tab-button:hover {
  border-color: #007bff;
}

.tab-button.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.details-content {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 25px;
}

.question-list {
  display: grid;
  gap: 15px;
}

.question-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #e9ecef;
}

.question-item.correct {
  border-left-color: #28a745;
}

.question-item.incorrect {
  border-left-color: #dc3545;
}

.question-number {
  width: 30px;
  height: 30px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.question-content {
  flex: 1;
}

.question-text {
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.question-answer {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.9em;
}

.user-answer {
  color: #6c757d;
}

.correct-answer {
  color: #28a745;
  font-weight: 600;
}

.question-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.question-result .result-icon {
  font-size: 1.5em;
}

.result-time {
  font-size: 0.8em;
  color: #6c757d;
}

.improvement-suggestions {
  margin-bottom: 50px;
}

.improvement-suggestions h3 {
  font-size: 1.8em;
  color: #495057;
  margin-bottom: 30px;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
}

.suggestion-card {
  display: flex;
  gap: 20px;
  padding: 25px;
  border-radius: 12px;
  border-left: 4px solid;
}

.suggestion-card.high {
  background: #f8d7da;
  border-left-color: #dc3545;
}

.suggestion-card.medium {
  background: #fff3cd;
  border-left-color: #ffc107;
}

.suggestion-card.low {
  background: #d1ecf1;
  border-left-color: #17a2b8;
}

.suggestion-icon {
  font-size: 2em;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
}

.suggestion-content h4 {
  font-size: 1.2em;
  color: #495057;
  margin-bottom: 10px;
}

.suggestion-content p {
  color: #6c757d;
  line-height: 1.5;
  margin-bottom: 15px;
}

.suggestion-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.suggestion-action {
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background 0.3s ease;
}

.suggestion-action:hover {
  background: #0056b3;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.btn-export,
.btn-retake,
.btn-training,
.btn-details {
  display: flex;
  align-items: center;
  gap: 8px;
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

.btn-details {
  background: #6c757d;
  color: white;
}

.btn-details:hover {
  background: #545b62;
}

.btn-icon {
  font-size: 1.1em;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .memory-assessment {
    padding: 10px;
  }
  
  .setup-phase,
  .testing-phase,
  .results-phase {
    padding: 20px;
  }
  
  .setup-content h2,
  .results-header h2 {
    font-size: 2em;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .overall-score {
    flex-direction: column;
    gap: 20px;
  }
  
  .radar-container {
    flex-direction: column;
  }
  
  .radar-chart {
    width: 250px;
    height: 250px;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
  
  .results-actions {
    flex-direction: column;
  }
  
  .details-tabs {
    flex-direction: column;
  }
  
  .question-item {
    flex-direction: column;
    gap: 10px;
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

.module-card {
  animation: fadeIn 0.6s ease-out;
}

.result-card {
  animation: slideIn 0.6s ease-out;
}

.score-circle {
  animation: scaleIn 0.8s ease-out;
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