<template>
  <div class="attention-assessment">
    <!-- 测评设置阶段 -->
    <div v-if="currentPhase === 'setup'" class="setup-phase fade-in">
      <div class="setup-container">
        <div class="assessment-header">
          <h1 class="assessment-title">注意力能力测评</h1>
          <p class="assessment-description">
            全面评估您的注意力能力，包括持续注意力、选择性注意力、分配性注意力和执行注意力等多个维度。
          </p>
        </div>
        
        <div class="setup-content">
          <!-- 快速设置预览 -->
          <div class="settings-preview">
            <div class="preview-item">
              <span class="preview-label">测试模块:</span>
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
            <SettingsButton @click="openSettings" />
          </div>
        </div>
        
        <div class="setup-actions">
          <button @click="startAssessment" :disabled="!canStartAssessment" class="btn-start">
            开始测评 ({{ estimatedDuration }}分钟)
          </button>
        </div>
      </div>
    </div>
    
    <!-- 设置弹窗 -->
    <SettingsModal
      v-if="showSettingsModal"
      title="注意力测评设置"
      :sections="settingsSections"
      @close="closeSettings"
      @save="saveSettings"
      @reset="resetSettings"
    />

    <!-- 测评进行中阶段 -->
    <div v-else-if="currentPhase === 'testing'" class="testing-phase">
      <div class="testing-container">
        <!-- 测评进度 -->
        <div class="assessment-progress">
          <div class="progress-header">
            <h2 class="current-module">{{ currentModuleInfo.name }}</h2>
            <div class="progress-stats">
              <span class="module-progress">{{ currentModuleIndex + 1 }} / {{ selectedModules.length }}</span>
              <span class="time-elapsed">⏱️ {{ formatTime(totalElapsedTime) }}</span>
            </div>
          </div>
          
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: overallProgress + '%' }"></div>
          </div>
          
          <div class="module-indicator">
            <div 
              v-for="(moduleId, index) in selectedModules" 
              :key="moduleId"
              class="module-dot"
              :class="{ 
                'completed': index < currentModuleIndex,
                'current': index === currentModuleIndex,
                'pending': index > currentModuleIndex 
              }"
            >
              {{ getModuleInfo(moduleId).icon }}
            </div>
          </div>
        </div>

        <!-- 动态加载测试组件 -->
        <div class="test-component-container">
          <component 
            :is="currentTestComponent" 
            :settings="testSettings"
            @complete="onTestComplete"
            @progress="onTestProgress"
          />
        </div>
      </div>
    </div>

    <!-- 结果展示阶段 -->
    <div v-else-if="currentPhase === 'results'" class="results-phase fade-in">
      <div class="results-container">
        <div class="results-header">
          <h1 class="results-title">注意力能力测评报告</h1>
          <div class="completion-info">
            <span class="completion-time">完成时间：{{ formatTime(totalElapsedTime) }}</span>
            <span class="completion-date">{{ new Date().toLocaleDateString() }}</span>
          </div>
        </div>

        <!-- 综合得分 -->
        <div class="overall-score">
          <div class="score-circle" :style="{ background: `conic-gradient(#007bff ${(overallScore / 100) * 360}deg, #e9ecef 0deg)` }">
            <div class="score-inner">
              <div class="score-number">{{ overallScore }}</div>
              <div class="score-label">综合得分</div>
            </div>
          </div>
          
          <div class="score-breakdown">
            <div class="score-item">
              <span class="score-name">持续注意力</span>
              <span class="score-value">{{ sustainedAttentionScore }}</span>
            </div>
            <div class="score-item">
              <span class="score-name">选择性注意力</span>
              <span class="score-value">{{ selectiveAttentionScore }}</span>
            </div>
            <div class="score-item">
              <span class="score-name">分配性注意力</span>
              <span class="score-value">{{ dividedAttentionScore }}</span>
            </div>
            <div class="score-item">
              <span class="score-name">执行注意力</span>
              <span class="score-value">{{ executiveAttentionScore }}</span>
            </div>
          </div>
        </div>

        <!-- 能力分析雷达图 -->
        <div class="ability-analysis">
          <h3 class="analysis-title">能力分析</h3>
          <div class="radar-chart">
            <!-- 这里可以集成Chart.js或其他图表库 -->
            <div class="radar-placeholder">
              <div class="radar-center">注意力能力</div>
              <div class="radar-axes">
                <div class="radar-axis" v-for="(score, ability) in abilityScores" :key="ability">
                  <span class="axis-label">{{ ability }}</span>
                  <span class="axis-score">{{ score }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 模块详细结果 -->
        <div class="module-results">
          <h3 class="analysis-title">模块详细结果</h3>
          <div class="modules-grid">
            <div v-for="result in moduleResults" :key="result.moduleId" class="module-result-card">
              <div class="module-header">
                <div class="module-icon">{{ getModuleInfo(result.moduleId).icon }}</div>
                <div class="module-info">
                  <h4 class="module-name">{{ getModuleInfo(result.moduleId).name }}</h4>
                  <div class="module-score">{{ result.score }}分</div>
                </div>
              </div>
              
              <div class="module-stats">
                <div class="stat-row">
                  <span class="stat-label">准确率</span>
                  <span class="stat-value">{{ Math.round(result.accuracy) }}%</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">平均反应时间</span>
                  <span class="stat-value">{{ result.averageTime }}ms</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">完成题数</span>
                  <span class="stat-value">{{ result.completedQuestions }}</span>
                </div>
              </div>
              
              <div class="module-performance">
                <div class="performance-bar">
                  <div class="performance-fill" :style="{ width: result.score + '%' }"></div>
                </div>
                <span class="performance-label">{{ getPerformanceLevel(result.score) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 题目详情 -->
        <div class="question-details">
          <h3 class="analysis-title">题目详情</h3>
          <div class="details-summary">
            <div class="summary-stats">
              <div class="summary-item">
                <span class="summary-number">{{ totalQuestions }}</span>
                <span class="summary-label">总题数</span>
              </div>
              <div class="summary-item">
                <span class="summary-number">{{ correctAnswers }}</span>
                <span class="summary-label">正确数</span>
              </div>
              <div class="summary-item">
                <span class="summary-number">{{ Math.round(overallAccuracy) }}%</span>
                <span class="summary-label">总准确率</span>
              </div>
              <div class="summary-item">
                <span class="summary-number">{{ averageReactionTime }}ms</span>
                <span class="summary-label">平均反应时间</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 改进建议 -->
        <div class="improvement-suggestions">
          <h3 class="analysis-title">改进建议</h3>
          <div class="suggestions-content">
            <div class="evaluation-text">
              <p>{{ getOverallEvaluation() }}</p>
            </div>
            <div class="suggestions-list">
              <div v-for="suggestion in getImprovementSuggestions()" :key="suggestion" class="suggestion-item">
                <i class="suggestion-icon">💡</i>
                <span class="suggestion-text">{{ suggestion }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="results-actions">
          <button @click="restartAssessment" class="btn-primary">重新测评</button>
          <button @click="exportReport" class="btn-secondary">导出报告</button>
          <router-link to="/training/attention" class="btn-secondary">开始训练</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
// import { useUserStore } from '@/stores/user' // 暂时移除，store不存在
// import { useAssessmentStore } from '@/stores/assessment' // 暂时移除，使用localStorage代替
import { useAbilityTestSettings } from '@/composables/useAbilityTestSettings'
import SettingsModal from '@/components/SettingsModal.vue'
import SettingsButton from '@/components/SettingsButton.vue'
import AttentionTest from '@/components/tests/AttentionTest.vue'
import SustainedAttentionTest from '@/components/tests/SustainedAttentionTest.vue'
import SelectiveAttentionTest from '@/components/tests/SelectiveAttentionTest.vue'
import DividedAttentionTest from '@/components/tests/DividedAttentionTest.vue'
import ExecutiveAttentionTest from '@/components/tests/ExecutiveAttentionTest.vue'

// 组合式函数
const router = useRouter()
// const userStore = useUserStore() // 暂时移除
// const assessmentStore = useAssessmentStore() // 暂时移除
const { settings, updateSettings, resetSettings, settingsSections, estimatedDuration } = useAbilityTestSettings('attention')

// 响应式数据
const currentPhase = ref('setup') // setup, testing, results
const showSettingsModal = ref(false)

// 可用模块
const availableModules = ref([
        {
          id: 'sustained',
          name: '持续注意力测试',
          description: '评估长时间保持注意力的能力',
          icon: '🎯',
          duration: 8,
          questions: 20,
          component: 'SustainedAttentionTest'
        },
        {
          id: 'selective',
          name: '选择性注意力测试',
          description: '评估在干扰环境中集中注意力的能力',
          icon: '🔍',
          duration: 6,
          questions: 15,
          component: 'SelectiveAttentionTest'
        },
        {
          id: 'divided',
          name: '分配性注意力测试',
          description: '评估同时处理多个任务的能力',
          icon: '🔄',
          duration: 10,
          questions: 25,
          component: 'DividedAttentionTest'
        },
        {
          id: 'executive',
          name: '执行注意力测试',
          description: '评估注意力控制和冲突解决能力',
          icon: '⚡',
          duration: 7,
          questions: 18,
          component: 'ExecutiveAttentionTest'
        }
      ])

// 测试状态
const currentModuleIndex = ref(0)
const moduleResults = ref([])
const totalElapsedTime = ref(0)
const testTimer = ref(null)
const testSettings = ref({})

// 计算属性
const selectedModulesText = computed(() => {
  const modules = availableModules.value.filter(m => settings.value.selectedModules.includes(m.id))
  return modules.length > 0 ? modules.map(m => m.name).join(', ') : '未选择'
})

const difficultyText = computed(() => {
  const difficultyMap = {
    easy: '简单',
    medium: '中等', 
    hard: '困难',
    expert: '专家'
  }
  return difficultyMap[settings.value.difficulty] || '中等'
})

const canStartAssessment = computed(() => {
  return settings.value.selectedModules.length > 0
})

const currentModuleInfo = computed(() => {
  if (currentModuleIndex.value < settings.value.selectedModules.length) {
    const moduleId = settings.value.selectedModules[currentModuleIndex.value]
    return availableModules.value.find(m => m.id === moduleId)
  }
  return null
})

const currentTestComponent = computed(() => {
  if (currentModuleInfo.value) {
    return currentModuleInfo.value.component
  }
  return null
})
// 额外的计算属性
const overallProgress = computed(() => {
  if (settings.value.selectedModules.length === 0) return 0
  return ((currentModuleIndex.value + (moduleProgress.value || 0)) / settings.value.selectedModules.length) * 100
})

const moduleProgress = ref(0)

const overallScore = computed(() => {
  if (moduleResults.value.length === 0) return 0
  const totalScore = moduleResults.value.reduce((sum, result) => sum + result.score, 0)
  return Math.round(totalScore / moduleResults.value.length)
})

const sustainedAttentionScore = computed(() => {
  const result = moduleResults.value.find(r => r.moduleId === 'sustained')
  return result ? result.score : 0
})

const selectiveAttentionScore = computed(() => {
  const result = moduleResults.value.find(r => r.moduleId === 'selective')
  return result ? result.score : 0
})

const dividedAttentionScore = computed(() => {
  const result = moduleResults.value.find(r => r.moduleId === 'divided')
  return result ? result.score : 0
})

const executiveAttentionScore = computed(() => {
  const result = moduleResults.value.find(r => r.moduleId === 'executive')
  return result ? result.score : 0
})

const abilityScores = computed(() => {
  return {
    '持续注意力': sustainedAttentionScore.value,
    '选择性注意力': selectiveAttentionScore.value,
    '分配性注意力': dividedAttentionScore.value,
    '执行注意力': executiveAttentionScore.value
  }
})

const totalQuestions = computed(() => {
  return moduleResults.value.reduce((sum, result) => sum + result.totalQuestions, 0)
})

const correctAnswers = computed(() => {
  return moduleResults.value.reduce((sum, result) => sum + result.correctAnswers, 0)
})

const overallAccuracy = computed(() => {
  return totalQuestions.value > 0 ? (correctAnswers.value / totalQuestions.value) * 100 : 0
})

const averageReactionTime = computed(() => {
  if (moduleResults.value.length === 0) return 0
  const totalTime = moduleResults.value.reduce((sum, result) => sum + result.averageTime, 0)
  return Math.round(totalTime / moduleResults.value.length)
})
// 方法
const openSettings = () => {
  showSettingsModal.value = true
}

const closeSettings = () => {
  showSettingsModal.value = false
}

const saveSettings = (newSettings) => {
  updateSettings(newSettings)
  closeSettings()
}

const resetSettingsToDefault = () => {
  resetSettings()
}

const startAssessment = () => {
  if (!canStartAssessment.value) return
  
  currentPhase.value = 'testing'
  currentModuleIndex.value = 0
  moduleResults.value = []
  totalElapsedTime.value = 0
  
  // 准备测试设置
  testSettings.value = {
    difficulty: settings.value.difficulty,
    soundEnabled: settings.value.soundEnabled,
    progressHints: settings.value.progressHints
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

const onTestComplete = (result) => {
  moduleResults.value.push({
    moduleId: settings.value.selectedModules[currentModuleIndex.value],
    ...result
  })
  
  currentModuleIndex.value++
  
  if (currentModuleIndex.value >= settings.value.selectedModules.length) {
    // 所有模块完成
    finishAssessment()
  }
}

const onTestProgress = (progress) => {
  moduleProgress.value = progress
}

const finishAssessment = () => {
  stopTimer()
  currentPhase.value = 'results'
  
  // 保存结果到store
  const assessmentResult = {
    type: 'attention',
    modules: settings.value.selectedModules,
    difficulty: settings.value.difficulty,
    results: moduleResults.value,
    totalTime: totalElapsedTime.value,
    timestamp: new Date().toISOString()
  }
  
  // 使用localStorage保存测评结果
  const savedResults = JSON.parse(localStorage.getItem('attentionAssessmentResults') || '[]')
  savedResults.push(assessmentResult)
  localStorage.setItem('attentionAssessmentResults', JSON.stringify(savedResults))
}

const getModuleInfo = (moduleId) => {
  return availableModules.value.find(m => m.id === moduleId) || {}
}

const getPerformanceLevel = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '需要改进'
}

const restartAssessment = () => {
  currentPhase.value = 'setup'
  currentModuleIndex.value = 0
  moduleResults.value = []
  totalElapsedTime.value = 0
  moduleProgress.value = 0
  stopTimer()
}

const exportReport = () => {
  // 导出测评报告
  const reportData = {
    title: '注意力能力测评报告',
    date: new Date().toLocaleDateString(),
    overallScore: overallScore.value,
    abilityScores: abilityScores.value,
    moduleResults: moduleResults.value,
    totalElapsedTime: totalElapsedTime.value,
    evaluation: getOverallEvaluation(),
    suggestions: getImprovementSuggestions()
  }
  
  // 创建并下载JSON文件
  const dataStr = JSON.stringify(reportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `注意力测评报告_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const goHome = () => {
  router.push('/')
}

const getOverallEvaluation = () => {
  const score = overallScore.value
  if (score >= 90) return '您的注意力能力非常优秀，各项指标都表现出色。'
  if (score >= 80) return '您的注意力能力良好，大部分指标表现不错。'
  if (score >= 70) return '您的注意力能力中等，还有提升空间。'
  if (score >= 60) return '您的注意力能力及格，建议加强训练。'
  return '您的注意力能力需要改进，建议进行系统性训练。'
}

const getImprovementSuggestions = () => {
  const suggestions = []
  if (sustainedAttentionScore.value < 70) {
    suggestions.push('建议进行持续注意力训练，如冥想、专注练习等。')
  }
  if (selectiveAttentionScore.value < 70) {
    suggestions.push('建议进行选择性注意力训练，如视觉搜索任务。')
  }
  if (dividedAttentionScore.value < 70) {
    suggestions.push('建议进行分配性注意力训练，如多任务处理练习。')
  }
  if (executiveAttentionScore.value < 70) {
    suggestions.push('建议进行执行注意力训练，如冲突解决任务。')
  }
  return suggestions
}
// 生命周期
onMounted(() => {
  // 初始化
})

onUnmounted(() => {
  stopTimer()
})
      
      return suggestions.slice(0, 6) // 最多返回6条建议
    }
    
    const formatTime = (ms) => {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    
    return {
      // 响应式数据
      currentPhase,
      showSettingsModal,
      availableModules,
      currentModuleIndex,
      moduleResults,
      totalElapsedTime,
      testTimer,
      testSettings,
      
      // 计算属性
      selectedModulesText,
      difficultyText,
      canStartAssessment,
      currentModuleInfo,
      currentTestComponent,
      overallProgress,
      overallScore,
      sustainedAttentionScore,
      selectiveAttentionScore,
      dividedAttentionScore,
      executiveAttentionScore,
      abilityScores,
      totalQuestions,
      correctAnswers,
      overallAccuracy,
      averageReactionTime,
      
      // 方法
      openSettings,
      closeSettings,
      saveSettings,
      resetSettings,
      startAssessment,
      stopAssessment,
      startTimer,
      stopTimer,
      onTestComplete,
      onTestProgress,
      finishAssessment,
      saveResults,
      getModuleInfo,
      getPerformanceLevel,
      restartAssessment,
      exportReport,
      goHome,
      getOverallEvaluation,
      getImprovementSuggestions,
      formatTime,
      
      // 来自composable的数据和方法
      settings,
      updateSettings,
      resetToDefaults,
      getSettingsByType
    }
  }
}
</script>

<style scoped>
/* 基础样式 */
.attention-assessment {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* 设置阶段样式 */
.setup-phase {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.setup-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 1200px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.assessment-title {
  text-align: center;
  font-size: 2.5em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
}

.assessment-description {
  text-align: center;
  font-size: 1.1em;
  color: #6c757d;
  margin-bottom: 40px;
  line-height: 1.6;
}

.setup-content {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.3em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 20px;
  margin-top: 30px;
}

/* 模块选择样式 */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.module-card {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.module-card.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.module-card.selected .selection-indicator {
  opacity: 1;
  transform: scale(1);
}

.module-icon {
  font-size: 2.5em;
  text-align: center;
  margin-bottom: 15px;
}

.module-info {
  text-align: center;
}

.module-name {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.module-description {
  color: #6c757d;
  line-height: 1.5;
  margin-bottom: 15px;
}

.module-stats {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.stat-item {
  font-size: 0.9em;
  color: #007bff;
  background: white;
  padding: 5px 10px;
  border-radius: 15px;
}

.selection-indicator {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s ease;
}

/* 难度设置样式 */
.difficulty-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.difficulty-option {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.difficulty-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.difficulty-option.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.difficulty-icon {
  font-size: 2em;
  margin-bottom: 10px;
}

.difficulty-name {
  font-size: 1.1em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.difficulty-description {
  color: #6c757d;
  font-size: 0.9em;
  line-height: 1.4;
}

/* 模式设置样式 */
.mode-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.mode-option {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.mode-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.mode-option.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.mode-icon {
  font-size: 2em;
  margin-bottom: 10px;
}

.mode-name {
  font-size: 1.1em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.mode-description {
  color: #6c757d;
  font-size: 0.9em;
  line-height: 1.4;
}

/* 个性化设置样式 */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.setting-label {
  font-weight: 600;
  color: #495057;
  flex: 1;
}

.setting-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #007bff;
}

.setting-select {
  padding: 8px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
  min-width: 100px;
}

/* 开始按钮样式 */
.setup-actions {
  text-align: center;
}

.btn-start {
  background: #007bff;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2em;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-start:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
}

.btn-start:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* 测试阶段样式 */
.testing-phase {
  max-width: 1200px;
  margin: 0 auto;
}

.testing-container {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.assessment-progress {
  margin-bottom: 30px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.current-module {
  font-size: 1.5em;
  font-weight: 600;
  color: #495057;
  margin: 0;
}

.progress-stats {
  display: flex;
  gap: 20px;
  align-items: center;
}

.module-progress,
.time-elapsed {
  background: #f8f9fa;
  padding: 8px 15px;
  border-radius: 8px;
  font-weight: 600;
  color: #495057;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.module-indicator {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.module-dot {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  border: 3px solid #e9ecef;
  background: white;
  transition: all 0.3s ease;
}

.module-dot.completed {
  border-color: #28a745;
  background: #d4edda;
}

.module-dot.current {
  border-color: #007bff;
  background: #e3f2fd;
  transform: scale(1.1);
}

.module-dot.pending {
  opacity: 0.5;
}

.test-component-container {
  min-height: 400px;
}

/* 结果展示样式 */
.results-phase {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.results-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.results-header {
  text-align: center;
  margin-bottom: 40px;
}

.results-title {
  font-size: 2.5em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
}

.completion-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  color: #6c757d;
  flex-wrap: wrap;
}

/* 综合得分样式 */
.overall-score {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 40px;
  align-items: center;
  margin-bottom: 40px;
  background: #f8f9fa;
  padding: 30px;
  border-radius: 15px;
}

.score-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-inner {
  background: white;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.score-number {
  font-size: 3em;
  font-weight: 600;
  color: #007bff;
}

.score-label {
  font-size: 1.1em;
  color: #6c757d;
  margin-top: 5px;
}

.score-breakdown {
  display: grid;
  gap: 15px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 20px;
  border-radius: 10px;
  border-left: 4px solid #007bff;
}

.score-name {
  font-weight: 600;
  color: #495057;
}

.score-value {
  font-size: 1.2em;
  font-weight: 600;
  color: #007bff;
}

/* 能力分析样式 */
.ability-analysis {
  margin-bottom: 40px;
}

.analysis-title {
  font-size: 1.8em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 25px;
  text-align: center;
}

.radar-chart {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
}

.radar-placeholder {
  text-align: center;
  color: #6c757d;
}

.radar-center {
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 20px;
}

.radar-axes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.radar-axis {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 10px 15px;
  border-radius: 8px;
}

.axis-label {
  font-weight: 600;
}

.axis-score {
  color: #007bff;
  font-weight: 600;
}

/* 模块结果样式 */
.module-results {
  margin-bottom: 40px;
}

.module-result-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.module-header .module-icon {
  font-size: 2em;
}

.module-header .module-info {
  flex: 1;
  text-align: left;
}

.module-header .module-name {
  font-size: 1.2em;
  margin-bottom: 5px;
}

.module-score {
  font-size: 1.5em;
  font-weight: 600;
  color: #007bff;
}

.module-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 10px 15px;
  border-radius: 8px;
}

.stat-label {
  color: #6c757d;
}

.stat-value {
  font-weight: 600;
  color: #495057;
}

.module-performance {
  display: flex;
  align-items: center;
  gap: 15px;
}

.performance-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.performance-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.performance-label {
  font-weight: 600;
  color: #007bff;
}

/* 题目详情样式 */
.question-details {
  margin-bottom: 40px;
}

.details-summary {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.summary-item {
  text-align: center;
  background: white;
  padding: 20px;
  border-radius: 10px;
}

.summary-number {
  display: block;
  font-size: 2em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 5px;
}

.summary-label {
  color: #6c757d;
  font-size: 0.9em;
}

/* 改进建议样式 */
.improvement-suggestions {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
}

.suggestions-content {
  text-align: left;
}

.evaluation-text {
  font-size: 1.1em;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 25px;
}

.suggestions-list {
  display: grid;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.suggestion-icon {
  font-size: 1.2em;
  margin-top: 2px;
}

.suggestion-text {
  color: #495057;
  line-height: 1.5;
}

/* 操作按钮样式 */
.results-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .setup-container,
  .testing-container,
  .results-container {
    padding: 20px;
    margin: 10px;
  }
  
  .assessment-title,
  .results-title {
    font-size: 2em;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .difficulty-options,
  .mode-options {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .progress-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .progress-stats {
    justify-content: center;
  }
  
  .overall-score {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .completion-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .results-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .score-circle {
    width: 150px;
    height: 150px;
  }
  
  .score-inner {
    width: 120px;
    height: 120px;
  }
  
  .score-number {
    font-size: 2.2em;
  }
  
  .module-dot {
    width: 40px;
    height: 40px;
    font-size: 1em;
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

.fade-in {
  animation: fadeIn 0.6s ease-out;
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
  --dark-color: #495057;
  --border-radius: 8px;
  --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}
</style>