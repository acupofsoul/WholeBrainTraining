<template>
  <div class="attention-assessment">
    <!-- 测评设置阶段 -->
    <div v-if="currentPhase === 'setup'" class="setup-phase fade-in">
      <div class="setup-container">
        <h1 class="assessment-title">注意力能力测评</h1>
        <p class="assessment-description">
          全面评估您的注意力能力，包括持续注意力、选择性注意力、分配性注意力和执行注意力等多个维度。
        </p>
        
        <div class="setup-content">
          <!-- 测评模块选择 -->
          <div class="module-selection">
            <h3 class="section-title">选择测评模块</h3>
            <div class="modules-grid">
              <div 
                v-for="module in availableModules" 
                :key="module.id"
                class="module-card"
                :class="{ 'selected': selectedModules.includes(module.id) }"
                @click="toggleModule(module.id)"
              >
                <div class="module-icon">{{ module.icon }}</div>
                <div class="module-info">
                  <h4 class="module-name">{{ module.name }}</h4>
                  <p class="module-description">{{ module.description }}</p>
                  <div class="module-stats">
                    <span class="stat-item">⏱️ {{ module.duration }}分钟</span>
                    <span class="stat-item">📊 {{ module.questions }}题</span>
                  </div>
                </div>
                <div class="selection-indicator">
                  <i class="fas fa-check"></i>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 难度设置 -->
          <div class="difficulty-setting">
            <h3 class="section-title">难度设置</h3>
            <div class="difficulty-options">
              <div 
                v-for="level in difficultyLevels" 
                :key="level.value"
                class="difficulty-option"
                :class="{ 'selected': selectedDifficulty === level.value }"
                @click="selectedDifficulty = level.value"
              >
                <div class="difficulty-icon">{{ level.icon }}</div>
                <div class="difficulty-info">
                  <h4 class="difficulty-name">{{ level.name }}</h4>
                  <p class="difficulty-description">{{ level.description }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 测评模式 -->
          <div class="mode-setting">
            <h3 class="section-title">测评模式</h3>
            <div class="mode-options">
              <div 
                v-for="mode in assessmentModes" 
                :key="mode.value"
                class="mode-option"
                :class="{ 'selected': selectedMode === mode.value }"
                @click="selectedMode = mode.value"
              >
                <div class="mode-icon">{{ mode.icon }}</div>
                <div class="mode-info">
                  <h4 class="mode-name">{{ mode.name }}</h4>
                  <p class="mode-description">{{ mode.description }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 个性化设置 -->
          <div class="personal-settings">
            <h3 class="section-title">个性化设置</h3>
            <div class="settings-grid">
              <div class="setting-item">
                <label class="setting-label">启用音效提示</label>
                <input type="checkbox" v-model="settings.soundEnabled" class="setting-checkbox">
              </div>
              <div class="setting-item">
                <label class="setting-label">显示进度提示</label>
                <input type="checkbox" v-model="settings.progressHints" class="setting-checkbox">
              </div>
              <div class="setting-item">
                <label class="setting-label">自动保存结果</label>
                <input type="checkbox" v-model="settings.autoSave" class="setting-checkbox">
              </div>
              <div class="setting-item">
                <label class="setting-label">休息间隔（分钟）</label>
                <select v-model="settings.breakInterval" class="setting-select">
                  <option value="0">无休息</option>
                  <option value="5">5分钟</option>
                  <option value="10">10分钟</option>
                  <option value="15">15分钟</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div class="setup-actions">
          <button @click="startAssessment" :disabled="!canStartAssessment" class="btn-start">
            开始测评 ({{ estimatedDuration }}分钟)
          </button>
        </div>
      </div>
    </div>

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

<script>
export default {
  name: 'AttentionAssessment',
  data() {
    return {
      currentPhase: 'setup', // setup, testing, results
      
      // 可用模块
      availableModules: [
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
      ],
      
      // 难度等级
      difficultyLevels: [
        {
          value: 'easy',
          name: '简单',
          description: '适合初学者，较慢的节奏和简单的任务',
          icon: '🟢'
        },
        {
          value: 'medium',
          name: '中等',
          description: '适合有一定基础的用户，中等难度',
          icon: '🟡'
        },
        {
          value: 'hard',
          name: '困难',
          description: '适合有经验的用户，快节奏和复杂任务',
          icon: '🔴'
        },
        {
          value: 'expert',
          name: '专家',
          description: '最高难度，适合专业人士',
          icon: '🟣'
        }
      ],
      
      // 测评模式
      assessmentModes: [
        {
          value: 'comprehensive',
          name: '综合测评',
          description: '完整的注意力能力评估，包含所有维度',
          icon: '📊'
        },
        {
          value: 'quick',
          name: '快速测评',
          description: '简化版测评，用时较短',
          icon: '⚡'
        },
        {
          value: 'custom',
          name: '自定义测评',
          description: '根据个人需求选择特定模块',
          icon: '⚙️'
        }
      ],
      
      // 用户选择
      selectedModules: ['sustained', 'selective'],
      selectedDifficulty: 'medium',
      selectedMode: 'comprehensive',
      
      // 个性化设置
      settings: {
        soundEnabled: true,
        progressHints: true,
        autoSave: true,
        breakInterval: 10
      },
      
      // 测试状态
      currentModuleIndex: 0,
      moduleResults: [],
      totalElapsedTime: 0,
      testTimer: null,
      
      // 测试设置
      testSettings: {}
    }
  },
  
  computed: {
    canStartAssessment() {
      return this.selectedModules.length > 0
    },
    
    estimatedDuration() {
      return this.selectedModules.reduce((total, moduleId) => {
        const module = this.availableModules.find(m => m.id === moduleId)
        return total + (module ? module.duration : 0)
      }, 0)
    },
    
    currentModuleInfo() {
      if (this.currentModuleIndex < this.selectedModules.length) {
        const moduleId = this.selectedModules[this.currentModuleIndex]
        return this.getModuleInfo(moduleId)
      }
      return {}
    },
    
    currentTestComponent() {
      return this.currentModuleInfo.component
    },
    
    overallProgress() {
      if (this.selectedModules.length === 0) return 0
      return ((this.currentModuleIndex + this.currentModuleProgress) / this.selectedModules.length) * 100
    },
    
    currentModuleProgress() {
      // 这个值会从子组件传递过来
      return this.moduleProgress || 0
    },
    
    // 结果计算
    overallScore() {
      if (this.moduleResults.length === 0) return 0
      const totalScore = this.moduleResults.reduce((sum, result) => sum + result.score, 0)
      return Math.round(totalScore / this.moduleResults.length)
    },
    
    sustainedAttentionScore() {
      const result = this.moduleResults.find(r => r.moduleId === 'sustained')
      return result ? result.score : 0
    },
    
    selectiveAttentionScore() {
      const result = this.moduleResults.find(r => r.moduleId === 'selective')
      return result ? result.score : 0
    },
    
    dividedAttentionScore() {
      const result = this.moduleResults.find(r => r.moduleId === 'divided')
      return result ? result.score : 0
    },
    
    executiveAttentionScore() {
      const result = this.moduleResults.find(r => r.moduleId === 'executive')
      return result ? result.score : 0
    },
    
    abilityScores() {
      return {
        '持续注意力': this.sustainedAttentionScore,
        '选择性注意力': this.selectiveAttentionScore,
        '分配性注意力': this.dividedAttentionScore,
        '执行注意力': this.executiveAttentionScore
      }
    },
    
    totalQuestions() {
      return this.moduleResults.reduce((sum, result) => sum + result.totalQuestions, 0)
    },
    
    correctAnswers() {
      return this.moduleResults.reduce((sum, result) => sum + result.correctAnswers, 0)
    },
    
    overallAccuracy() {
      return this.totalQuestions > 0 ? (this.correctAnswers / this.totalQuestions) * 100 : 0
    },
    
    averageReactionTime() {
      if (this.moduleResults.length === 0) return 0
      const totalTime = this.moduleResults.reduce((sum, result) => sum + result.averageTime, 0)
      return Math.round(totalTime / this.moduleResults.length)
    }
  },
  
  methods: {
    toggleModule(moduleId) {
      const index = this.selectedModules.indexOf(moduleId)
      if (index > -1) {
        this.selectedModules.splice(index, 1)
      } else {
        this.selectedModules.push(moduleId)
      }
    },
    
    startAssessment() {
      this.currentPhase = 'testing'
      this.currentModuleIndex = 0
      this.moduleResults = []
      this.totalElapsedTime = 0
      this.startTimer()
      this.prepareTestSettings()
    },
    
    prepareTestSettings() {
      this.testSettings = {
        difficulty: this.selectedDifficulty,
        mode: this.selectedMode,
        ...this.settings
      }
    },
    
    startTimer() {
      this.testTimer = setInterval(() => {
        this.totalElapsedTime += 1000
      }, 1000)
    },
    
    stopTimer() {
      if (this.testTimer) {
        clearInterval(this.testTimer)
        this.testTimer = null
      }
    },
    
    onTestComplete(result) {
      // 保存当前模块结果
      this.moduleResults.push({
        moduleId: this.selectedModules[this.currentModuleIndex],
        ...result
      })
      
      // 进入下一个模块或完成测评
      this.currentModuleIndex++
      if (this.currentModuleIndex >= this.selectedModules.length) {
        this.finishAssessment()
      } else {
        // 可以在这里添加模块间的休息时间
        this.prepareTestSettings()
      }
    },
    
    onTestProgress(progress) {
      this.moduleProgress = progress
    },
    
    finishAssessment() {
      this.currentPhase = 'results'
      this.stopTimer()
      
      // 保存结果到本地存储
      if (this.settings.autoSave) {
        this.saveResults()
      }
    },
    
    saveResults() {
      const results = {
        timestamp: new Date().toISOString(),
        overallScore: this.overallScore,
        moduleResults: this.moduleResults,
        totalElapsedTime: this.totalElapsedTime,
        settings: this.testSettings
      }
      
      // 保存到localStorage
      const savedResults = JSON.parse(localStorage.getItem('attentionAssessmentResults') || '[]')
      savedResults.push(results)
      localStorage.setItem('attentionAssessmentResults', JSON.stringify(savedResults))
    },
    
    restartAssessment() {
      this.currentPhase = 'setup'
      this.currentModuleIndex = 0
      this.moduleResults = []
      this.totalElapsedTime = 0
      this.moduleProgress = 0
    },
    
    exportReport() {
      // 导出测评报告
      const reportData = {
        title: '注意力能力测评报告',
        date: new Date().toLocaleDateString(),
        overallScore: this.overallScore,
        abilityScores: this.abilityScores,
        moduleResults: this.moduleResults,
        totalElapsedTime: this.totalElapsedTime,
        evaluation: this.getOverallEvaluation(),
        suggestions: this.getImprovementSuggestions()
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
    },
    
    getModuleInfo(moduleId) {
      return this.availableModules.find(m => m.id === moduleId) || {}
    },
    
    getPerformanceLevel(score) {
      if (score >= 90) return '优秀'
      if (score >= 80) return '良好'
      if (score >= 70) return '中等'
      if (score >= 60) return '及格'
      return '需要改进'
    },
    
    getOverallEvaluation() {
      const score = this.overallScore
      
      if (score >= 90) {
        return '优秀！您的注意力能力非常出色，在各个维度都表现优异。继续保持这种专注状态，可以尝试更具挑战性的任务。'
      } else if (score >= 80) {
        return '良好！您的注意力能力较强，在大部分任务中都能保持良好的专注度。通过针对性训练可以进一步提升。'
      } else if (score >= 70) {
        return '中等！您的注意力能力处于平均水平，还有较大的提升空间。建议加强注意力训练，特别是在薄弱环节。'
      } else if (score >= 60) {
        return '需要改进！您的注意力能力有待提升，建议从基础训练开始，逐步提高专注度和持续性。'
      } else {
        return '需要加强！建议进行系统性的注意力训练，从简单任务开始，循序渐进地提升注意力能力。'
      }
    },
    
    getImprovementSuggestions() {
      const suggestions = []
      
      // 基于整体得分的建议
      if (this.overallScore < 70) {
        suggestions.push('建议每天进行15-20分钟的专注力训练')
        suggestions.push('尝试冥想或正念练习来提高注意力控制能力')
      }
      
      // 基于各模块表现的建议
      if (this.sustainedAttentionScore < 70) {
        suggestions.push('加强持续注意力训练，可以尝试长时间的专注任务')
      }
      
      if (this.selectiveAttentionScore < 70) {
        suggestions.push('练习在嘈杂环境中保持专注，提高抗干扰能力')
      }
      
      if (this.dividedAttentionScore < 70) {
        suggestions.push('训练多任务处理能力，从简单的双任务开始')
      }
      
      if (this.executiveAttentionScore < 70) {
        suggestions.push('加强认知控制训练，如Stroop任务和冲突监控练习')
      }
      
      // 基于反应时间的建议
      if (this.averageReactionTime > 800) {
        suggestions.push('提高反应速度，可以进行快速决策训练')
      }
      
      // 通用建议
      suggestions.push('保持规律的作息，充足的睡眠有助于注意力恢复')
      suggestions.push('适当的体育锻炼可以提高大脑的注意力水平')
      
      return suggestions.slice(0, 6) // 最多返回6条建议
    },
    
    formatTime(ms) {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  },
  
  beforeUnmount() {
    this.stopTimer()
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