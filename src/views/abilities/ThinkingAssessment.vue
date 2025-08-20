<template>
  <div class="thinking-assessment">
    <!-- 测评设置阶段 -->
    <div v-if="currentPhase === 'setup'" class="setup-phase fade-in">
      <div class="setup-container">
        <h2 class="assessment-title">思维能力测评</h2>
        <div class="assessment-description">
          <p>全面评估您的逻辑思维、创造性思维、批判性思维和问题解决能力。</p>
        </div>
        
        <!-- 模块选择 -->
        <div class="module-selection">
          <h3 class="section-title">选择测评模块</h3>
          <div class="module-grid">
            <div 
              v-for="module in availableModules" 
              :key="module.id"
              class="module-card"
              :class="{ 'selected': selectedModules.includes(module.id) }"
              @click="toggleModule(module.id)"
            >
              <div class="module-icon">{{ module.icon }}</div>
              <div class="module-name">{{ module.name }}</div>
              <div class="module-description">{{ module.description }}</div>
              <div class="module-duration">预计时间：{{ module.duration }}分钟</div>
            </div>
          </div>
        </div>
        
        <!-- 难度设置 -->
        <div class="difficulty-setting">
          <h3 class="section-title">难度等级</h3>
          <div class="difficulty-options">
            <label 
              v-for="level in difficultyLevels" 
              :key="level.value"
              class="difficulty-option"
              :class="{ 'selected': settings.difficulty === level.value }"
            >
              <input 
                type="radio" 
                :value="level.value" 
                v-model="settings.difficulty"
                class="difficulty-radio"
              >
              <div class="difficulty-content">
                <div class="difficulty-name">{{ level.name }}</div>
                <div class="difficulty-description">{{ level.description }}</div>
              </div>
            </label>
          </div>
        </div>
        
        <!-- 测评模式 -->
        <div class="mode-setting">
          <h3 class="section-title">测评模式</h3>
          <div class="mode-options">
            <label 
              v-for="mode in assessmentModes" 
              :key="mode.value"
              class="mode-option"
              :class="{ 'selected': settings.mode === mode.value }"
            >
              <input 
                type="radio" 
                :value="mode.value" 
                v-model="settings.mode"
                class="mode-radio"
              >
              <div class="mode-content">
                <div class="mode-name">{{ mode.name }}</div>
                <div class="mode-description">{{ mode.description }}</div>
              </div>
            </label>
          </div>
        </div>
        
        <!-- 个性化设置 -->
        <div class="personal-settings">
          <h3 class="section-title">个性化设置</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <label class="setting-label">时间限制：</label>
              <select v-model="settings.timeLimit" class="setting-select">
                <option value="strict">严格限时</option>
                <option value="normal">标准限时</option>
                <option value="relaxed">宽松限时</option>
                <option value="unlimited">不限时</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">题目顺序：</label>
              <select v-model="settings.questionOrder" class="setting-select">
                <option value="sequential">按顺序</option>
                <option value="random">随机顺序</option>
                <option value="adaptive">自适应</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">反馈模式：</label>
              <select v-model="settings.feedbackMode" class="setting-select">
                <option value="immediate">即时反馈</option>
                <option value="delayed">延迟反馈</option>
                <option value="final">最终反馈</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">提示功能：</label>
              <select v-model="settings.hintMode" class="setting-select">
                <option value="enabled">启用提示</option>
                <option value="limited">限制提示</option>
                <option value="disabled">禁用提示</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="setup-actions">
          <button @click="startAssessment" class="btn-start" :disabled="selectedModules.length === 0">
            开始测评（{{ estimatedDuration }}分钟）
          </button>
        </div>
      </div>
    </div>

    <!-- 测评进行中阶段 -->
    <div v-else-if="currentPhase === 'testing'" class="testing-phase">
      <div class="testing-container">
        <!-- 进度信息 -->
        <div class="progress-info">
          <div class="progress-header">
            <div class="current-module">{{ currentModuleName }}</div>
            <div class="progress-text">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: overallProgress + '%' }"></div>
          </div>
          <div class="time-info">
            <div class="elapsed-time">已用时：{{ formatTime(elapsedTime) }}</div>
            <div class="remaining-time" v-if="settings.timeLimit !== 'unlimited'">
              剩余时间：{{ formatTime(remainingTime) }}
            </div>
          </div>
        </div>
        
        <!-- 动态加载测试组件 -->
        <div class="test-component-container">
          <component 
            :is="currentTestComponent"
            :settings="currentTestSettings"
            @complete="handleTestComplete"
            @progress="handleTestProgress"
            ref="currentTest"
          />
        </div>
      </div>
    </div>

    <!-- 结果展示阶段 -->
    <div v-else-if="currentPhase === 'results'" class="results-phase fade-in">
      <div class="results-container">
        <h2 class="results-title">思维能力测评报告</h2>
        
        <!-- 综合得分 -->
        <div class="overall-score">
          <div class="score-display">
            <div class="score-circle" :style="{ background: `conic-gradient(#007bff ${(overallScore / 100) * 360}deg, #e9ecef 0deg)` }">
              <div class="score-inner">
                <div class="score-number">{{ overallScore }}</div>
                <div class="score-label">综合得分</div>
              </div>
            </div>
          </div>
          
          <div class="score-breakdown">
            <div class="breakdown-item">
              <span class="breakdown-label">逻辑思维：</span>
              <span class="breakdown-value">{{ logicalThinkingScore }}</span>
            </div>
            <div class="breakdown-item">
              <span class="breakdown-label">创造思维：</span>
              <span class="breakdown-value">{{ creativeThinkingScore }}</span>
            </div>
            <div class="breakdown-item">
              <span class="breakdown-label">批判思维：</span>
              <span class="breakdown-value">{{ criticalThinkingScore }}</span>
            </div>
            <div class="breakdown-item">
              <span class="breakdown-label">问题解决：</span>
              <span class="breakdown-value">{{ problemSolvingScore }}</span>
            </div>
          </div>
        </div>
        
        <!-- 能力分析雷达图 -->
        <div class="ability-radar">
          <h3 class="analysis-title">能力分析</h3>
          <div class="radar-container">
            <canvas ref="radarChart" width="400" height="400"></canvas>
          </div>
        </div>
        
        <!-- 模块详细结果 -->
        <div class="module-results">
          <h3 class="analysis-title">模块详细结果</h3>
          <div class="module-results-grid">
            <div 
              v-for="result in moduleResults" 
              :key="result.moduleId"
              class="module-result-card"
            >
              <div class="module-result-header">
                <div class="module-result-icon">{{ result.icon }}</div>
                <div class="module-result-name">{{ result.name }}</div>
                <div class="module-result-score">{{ result.score }}</div>
              </div>
              
              <div class="module-result-details">
                <div class="detail-item">
                  <span class="detail-label">完成题目：</span>
                  <span class="detail-value">{{ result.completedQuestions }}/{{ result.totalQuestions }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">准确率：</span>
                  <span class="detail-value">{{ result.accuracy }}%</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">平均用时：</span>
                  <span class="detail-value">{{ result.averageTime }}s</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">难度适应：</span>
                  <span class="detail-value">{{ result.difficultyAdaptation }}</span>
                </div>
              </div>
              
              <div class="module-result-performance">
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
          <h3 class="analysis-title">题目详情分析</h3>
          <div class="question-categories">
            <div 
              v-for="category in questionCategories" 
              :key="category.name"
              class="category-card"
            >
              <div class="category-header">
                <div class="category-name">{{ category.name }}</div>
                <div class="category-score">{{ category.score }}%</div>
              </div>
              
              <div class="category-stats">
                <div class="stat-row">
                  <span class="stat-name">正确率：</span>
                  <span class="stat-value">{{ category.accuracy }}%</span>
                </div>
                <div class="stat-row">
                  <span class="stat-name">题目数：</span>
                  <span class="stat-value">{{ category.questionCount }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-name">平均时间：</span>
                  <span class="stat-value">{{ category.averageTime }}s</span>
                </div>
              </div>
              
              <div class="category-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: category.score + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 改进建议 -->
        <div class="improvement-suggestions">
          <h3 class="analysis-title">改进建议</h3>
          <div class="suggestions-container">
            <div class="suggestion-category" v-for="suggestion in improvementSuggestions" :key="suggestion.category">
              <div class="suggestion-header">
                <div class="suggestion-icon">{{ suggestion.icon }}</div>
                <div class="suggestion-title">{{ suggestion.title }}</div>
              </div>
              <div class="suggestion-content">
                <ul class="suggestion-list">
                  <li v-for="item in suggestion.items" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div class="results-actions">
          <button @click="exportReport" class="btn-secondary">导出报告</button>
          <button @click="restartAssessment" class="btn-primary">重新测评</button>
          <button @click="goToTraining" class="btn-success">开始训练</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LogicalThinkingTest from './tests/LogicalThinkingTest.vue'
import CreativeThinkingTest from './tests/CreativeThinkingTest.vue'
import CriticalThinkingTest from './tests/CriticalThinkingTest.vue'
import ProblemSolvingTest from './tests/ProblemSolvingTest.vue'

export default {
  name: 'ThinkingAssessment',
  
  components: {
    LogicalThinkingTest,
    CreativeThinkingTest,
    CriticalThinkingTest,
    ProblemSolvingTest
  },
  
  data() {
    return {
      currentPhase: 'setup', // setup, testing, results
      
      // 可用模块
      availableModules: [
        {
          id: 'logical',
          name: '逻辑思维测试',
          description: '评估逻辑推理、演绎归纳能力',
          icon: '🧠',
          duration: 15,
          component: 'LogicalThinkingTest'
        },
        {
          id: 'creative',
          name: '创造思维测试',
          description: '评估创新思维、发散思维能力',
          icon: '💡',
          duration: 20,
          component: 'CreativeThinkingTest'
        },
        {
          id: 'critical',
          name: '批判思维测试',
          description: '评估分析判断、质疑评价能力',
          icon: '🔍',
          duration: 18,
          component: 'CriticalThinkingTest'
        },
        {
          id: 'problem',
          name: '问题解决测试',
          description: '评估问题分析、解决策略能力',
          icon: '🎯',
          duration: 25,
          component: 'ProblemSolvingTest'
        }
      ],
      
      // 选中的模块
      selectedModules: ['logical', 'creative', 'critical', 'problem'],
      
      // 难度等级
      difficultyLevels: [
        {
          value: 'easy',
          name: '简单',
          description: '基础题目，适合初学者'
        },
        {
          value: 'medium',
          name: '中等',
          description: '标准难度，适合大多数人'
        },
        {
          value: 'hard',
          name: '困难',
          description: '挑战性题目，适合高水平用户'
        },
        {
          value: 'expert',
          name: '专家',
          description: '极具挑战性，适合专业人士'
        }
      ],
      
      // 测评模式
      assessmentModes: [
        {
          value: 'comprehensive',
          name: '综合测评',
          description: '全面评估各项思维能力'
        },
        {
          value: 'focused',
          name: '专项测评',
          description: '重点评估特定思维能力'
        },
        {
          value: 'adaptive',
          name: '自适应测评',
          description: '根据表现动态调整难度'
        }
      ],
      
      // 测评设置
      settings: {
        difficulty: 'medium',
        mode: 'comprehensive',
        timeLimit: 'normal',
        questionOrder: 'sequential',
        feedbackMode: 'delayed',
        hintMode: 'limited'
      },
      
      // 测试状态
      currentModuleIndex: 0,
      currentQuestionIndex: 0,
      totalQuestions: 0,
      startTime: null,
      elapsedTime: 0,
      
      // 测试结果
      moduleResults: [],
      testResponses: [],
      
      // 定时器
      timer: null
    }
  },
  
  computed: {
    estimatedDuration() {
      return this.selectedModules.reduce((total, moduleId) => {
        const module = this.availableModules.find(m => m.id === moduleId)
        return total + (module ? module.duration : 0)
      }, 0)
    },
    
    currentModule() {
      if (this.currentModuleIndex >= this.selectedModules.length) return null
      const moduleId = this.selectedModules[this.currentModuleIndex]
      return this.availableModules.find(m => m.id === moduleId)
    },
    
    currentModuleName() {
      return this.currentModule ? this.currentModule.name : ''
    },
    
    currentTestComponent() {
      return this.currentModule ? this.currentModule.component : null
    },
    
    currentTestSettings() {
      return {
        ...this.settings,
        moduleId: this.currentModule?.id
      }
    },
    
    overallProgress() {
      if (this.totalQuestions === 0) return 0
      const completedQuestions = this.moduleResults.reduce((sum, result) => sum + result.completedQuestions, 0)
      return (completedQuestions / this.totalQuestions) * 100
    },
    
    remainingTime() {
      // 根据时间限制设置计算剩余时间
      const timeMultiplier = {
        strict: 0.8,
        normal: 1.0,
        relaxed: 1.5
      }
      
      const totalAllowedTime = this.estimatedDuration * 60 * (timeMultiplier[this.settings.timeLimit] || 1)
      return Math.max(0, totalAllowedTime - this.elapsedTime)
    },
    
    overallScore() {
      if (this.moduleResults.length === 0) return 0
      const totalScore = this.moduleResults.reduce((sum, result) => sum + result.score, 0)
      return Math.round(totalScore / this.moduleResults.length)
    },
    
    logicalThinkingScore() {
      const result = this.moduleResults.find(r => r.moduleId === 'logical')
      return result ? result.score : 0
    },
    
    creativeThinkingScore() {
      const result = this.moduleResults.find(r => r.moduleId === 'creative')
      return result ? result.score : 0
    },
    
    criticalThinkingScore() {
      const result = this.moduleResults.find(r => r.moduleId === 'critical')
      return result ? result.score : 0
    },
    
    problemSolvingScore() {
      const result = this.moduleResults.find(r => r.moduleId === 'problem')
      return result ? result.score : 0
    },
    
    questionCategories() {
      // 根据测试结果分析题目类别表现
      const categories = [
        { name: '逻辑推理', score: this.logicalThinkingScore, accuracy: 85, questionCount: 12, averageTime: 45 },
        { name: '创新思维', score: this.creativeThinkingScore, accuracy: 78, questionCount: 10, averageTime: 60 },
        { name: '批判分析', score: this.criticalThinkingScore, accuracy: 82, questionCount: 15, averageTime: 50 },
        { name: '问题解决', score: this.problemSolvingScore, accuracy: 80, questionCount: 18, averageTime: 75 }
      ]
      
      return categories.filter(cat => cat.score > 0)
    },
    
    improvementSuggestions() {
      const suggestions = []
      
      if (this.logicalThinkingScore < 70) {
        suggestions.push({
          category: 'logical',
          icon: '🧠',
          title: '逻辑思维提升',
          items: [
            '练习逻辑推理题目，提高演绎归纳能力',
            '学习形式逻辑和数理逻辑基础知识',
            '多做数学证明和逻辑游戏',
            '培养系统性思考习惯'
          ]
        })
      }
      
      if (this.creativeThinkingScore < 70) {
        suggestions.push({
          category: 'creative',
          icon: '💡',
          title: '创造思维提升',
          items: [
            '练习头脑风暴和发散思维技巧',
            '尝试不同的创意方法和工具',
            '培养好奇心和想象力',
            '多接触艺术和创新领域'
          ]
        })
      }
      
      if (this.criticalThinkingScore < 70) {
        suggestions.push({
          category: 'critical',
          icon: '🔍',
          title: '批判思维提升',
          items: [
            '学习批判性思维的基本原则',
            '练习质疑和评价信息的真实性',
            '培养独立思考和判断能力',
            '多角度分析问题和观点'
          ]
        })
      }
      
      if (this.problemSolvingScore < 70) {
        suggestions.push({
          category: 'problem',
          icon: '🎯',
          title: '问题解决提升',
          items: [
            '学习系统性问题解决方法',
            '练习分解复杂问题的技巧',
            '培养多种解决方案的思维',
            '提高执行和验证解决方案的能力'
          ]
        })
      }
      
      // 通用建议
      suggestions.push({
        category: 'general',
        icon: '📚',
        title: '综合提升建议',
        items: [
          '保持持续学习和思考的习惯',
          '多参与讨论和辩论活动',
          '阅读不同领域的书籍和文章',
          '定期进行思维训练和测评'
        ]
      })
      
      return suggestions
    }
  },
  
  mounted() {
    this.calculateTotalQuestions()
  },
  
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
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
      this.calculateTotalQuestions()
    },
    
    calculateTotalQuestions() {
      // 根据选中的模块和难度计算总题目数
      const questionsPerModule = {
        easy: 15,
        medium: 20,
        hard: 25,
        expert: 30
      }
      
      this.totalQuestions = this.selectedModules.length * (questionsPerModule[this.settings.difficulty] || 20)
    },
    
    startAssessment() {
      this.currentPhase = 'testing'
      this.currentModuleIndex = 0
      this.currentQuestionIndex = 0
      this.startTime = Date.now()
      this.moduleResults = []
      this.testResponses = []
      
      this.startTimer()
    },
    
    startTimer() {
      this.timer = setInterval(() => {
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000)
        
        // 检查时间限制
        if (this.settings.timeLimit !== 'unlimited' && this.remainingTime <= 0) {
          this.handleTimeUp()
        }
      }, 1000)
    },
    
    handleTimeUp() {
      // 时间到，强制结束测试
      if (this.$refs.currentTest) {
        this.$refs.currentTest.forceComplete()
      }
    },
    
    handleTestComplete(result) {
      // 保存当前模块结果
      const moduleResult = {
        moduleId: this.currentModule.id,
        name: this.currentModule.name,
        icon: this.currentModule.icon,
        score: result.score,
        accuracy: result.accuracy,
        completedQuestions: result.completedQuestions,
        totalQuestions: result.totalQuestions,
        averageTime: result.averageTime,
        difficultyAdaptation: result.difficultyAdaptation || '良好',
        responses: result.responses || []
      }
      
      this.moduleResults.push(moduleResult)
      this.testResponses.push(...(result.responses || []))
      
      // 检查是否还有更多模块
      this.currentModuleIndex++
      if (this.currentModuleIndex < this.selectedModules.length) {
        // 继续下一个模块
        this.$nextTick(() => {
          // 组件会自动重新渲染
        })
      } else {
        // 所有模块完成，显示结果
        this.completeAssessment()
      }
    },
    
    handleTestProgress(progress) {
      this.currentQuestionIndex = progress.currentQuestion || 0
    },
    
    completeAssessment() {
      this.currentPhase = 'results'
      
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      
      // 绘制雷达图
      this.$nextTick(() => {
        this.drawRadarChart()
      })
      
      // 发送完成事件给父组件
      this.$emit('complete', {
        overallScore: this.overallScore,
        moduleResults: this.moduleResults,
        logicalThinkingScore: this.logicalThinkingScore,
        creativeThinkingScore: this.creativeThinkingScore,
        criticalThinkingScore: this.criticalThinkingScore,
        problemSolvingScore: this.problemSolvingScore,
        elapsedTime: this.elapsedTime,
        testResponses: this.testResponses
      })
    },
    
    drawRadarChart() {
      const canvas = this.$refs.radarChart
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = 150
      
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 数据点
      const data = [
        { label: '逻辑思维', value: this.logicalThinkingScore },
        { label: '创造思维', value: this.creativeThinkingScore },
        { label: '批判思维', value: this.criticalThinkingScore },
        { label: '问题解决', value: this.problemSolvingScore }
      ]
      
      const angleStep = (2 * Math.PI) / data.length
      
      // 绘制网格
      ctx.strokeStyle = '#e9ecef'
      ctx.lineWidth = 1
      
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath()
        const r = (radius * i) / 5
        for (let j = 0; j < data.length; j++) {
          const angle = j * angleStep - Math.PI / 2
          const x = centerX + r * Math.cos(angle)
          const y = centerY + r * Math.sin(angle)
          
          if (j === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.stroke()
      }
      
      // 绘制轴线
      for (let i = 0; i < data.length; i++) {
        ctx.beginPath()
        const angle = i * angleStep - Math.PI / 2
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
      
      // 绘制数据区域
      ctx.fillStyle = 'rgba(0, 123, 255, 0.2)'
      ctx.strokeStyle = '#007bff'
      ctx.lineWidth = 2
      
      ctx.beginPath()
      for (let i = 0; i < data.length; i++) {
        const angle = i * angleStep - Math.PI / 2
        const value = data[i].value / 100
        const x = centerX + radius * value * Math.cos(angle)
        const y = centerY + radius * value * Math.sin(angle)
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      // 绘制数据点
      ctx.fillStyle = '#007bff'
      for (let i = 0; i < data.length; i++) {
        const angle = i * angleStep - Math.PI / 2
        const value = data[i].value / 100
        const x = centerX + radius * value * Math.cos(angle)
        const y = centerY + radius * value * Math.sin(angle)
        
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
      }
      
      // 绘制标签
      ctx.fillStyle = '#495057'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      
      for (let i = 0; i < data.length; i++) {
        const angle = i * angleStep - Math.PI / 2
        const labelRadius = radius + 30
        const x = centerX + labelRadius * Math.cos(angle)
        const y = centerY + labelRadius * Math.sin(angle)
        
        ctx.fillText(data[i].label, x, y + 5)
        ctx.fillText(data[i].value.toString(), x, y + 20)
      }
    },
    
    restartAssessment() {
      this.currentPhase = 'setup'
      this.currentModuleIndex = 0
      this.currentQuestionIndex = 0
      this.moduleResults = []
      this.testResponses = []
      this.elapsedTime = 0
      
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    
    exportReport() {
      // 导出测评报告
      const reportData = {
        timestamp: new Date().toISOString(),
        overallScore: this.overallScore,
        moduleResults: this.moduleResults,
        settings: this.settings,
        elapsedTime: this.elapsedTime,
        improvementSuggestions: this.improvementSuggestions
      }
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `thinking-assessment-report-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
    
    goToTraining() {
      // 跳转到思维训练模块
      this.$router.push('/training/thinking')
    },
    
    // 辅助方法
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    
    getPerformanceLevel(score) {
      if (score >= 90) return '优秀'
      if (score >= 80) return '良好'
      if (score >= 70) return '中等'
      if (score >= 60) return '及格'
      return '需要改进'
    }
  }
}
</script>

<style scoped>
/* 基础样式 */
.thinking-assessment {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* 设置阶段样式 */
.setup-phase {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 20px;
}

.setup-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 1000px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.assessment-title {
  text-align: center;
  font-size: 2.5em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 20px;
}

.assessment-description {
  text-align: center;
  color: #6c757d;
  font-size: 1.1em;
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.4em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 20px;
  margin-top: 30px;
}

/* 模块选择样式 */
.module-selection {
  margin-bottom: 30px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.module-card {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.module-card.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.module-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.module-name {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.module-description {
  color: #6c757d;
  font-size: 0.9em;
  line-height: 1.4;
  margin-bottom: 10px;
}

.module-duration {
  color: #007bff;
  font-weight: 600;
  font-size: 0.9em;
}

/* 难度设置样式 */
.difficulty-setting {
  margin-bottom: 30px;
}

.difficulty-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.difficulty-option {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.difficulty-option:hover {
  border-color: #007bff;
}

.difficulty-option.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.difficulty-radio {
  margin-right: 15px;
}

.difficulty-content {
  flex: 1;
}

.difficulty-name {
  font-weight: 600;
  color: #495057;
  margin-bottom: 5px;
}

.difficulty-description {
  color: #6c757d;
  font-size: 0.9em;
}

/* 模式设置样式 */
.mode-setting {
  margin-bottom: 30px;
}

.mode-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.mode-option {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-option:hover {
  border-color: #007bff;
}

.mode-option.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.mode-radio {
  margin-right: 15px;
}

.mode-content {
  flex: 1;
}

.mode-name {
  font-weight: 600;
  color: #495057;
  margin-bottom: 5px;
}

.mode-description {
  color: #6c757d;
  font-size: 0.9em;
}

/* 个性化设置样式 */
.personal-settings {
  margin-bottom: 30px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.setting-label {
  font-weight: 600;
  color: #495057;
  min-width: 100px;
}

.setting-select {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  font-size: 1em;
}

/* 开始按钮样式 */
.setup-actions {
  text-align: center;
  margin-top: 40px;
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
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 20px;
}

.testing-container {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 1200px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.progress-info {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.current-module {
  font-size: 1.3em;
  font-weight: 600;
  color: #007bff;
}

.progress-text {
  font-size: 1.1em;
  color: #495057;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.5s ease;
}

.time-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.elapsed-time,
.remaining-time {
  font-weight: 600;
  color: #495057;
}

.test-component-container {
  min-height: 500px;
}

/* 结果阶段样式 */
.results-phase {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 20px;
}

.results-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 1200px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.results-title {
  text-align: center;
  font-size: 2.5em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 40px;
}

/* 综合得分样式 */
.overall-score {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 40px;
  margin-bottom: 40px;
  align-items: center;
}

.score-display {
  display: flex;
  justify-content: center;
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
  width: 160px;
  height: 160px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.score-number {
  font-size: 3em;
  font-weight: 700;
  color: #007bff;
}

.score-label {
  font-size: 1em;
  color: #6c757d;
  margin-top: 5px;
}

.score-breakdown {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.breakdown-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breakdown-label {
  font-weight: 600;
  color: #495057;
}

.breakdown-value {
  font-size: 1.3em;
  font-weight: 700;
  color: #007bff;
}

/* 雷达图样式 */
.ability-radar {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 40px;
  text-align: center;
}

.analysis-title {
  font-size: 1.8em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 25px;
  text-align: center;
}

.radar-container {
  display: flex;
  justify-content: center;
}

/* 模块结果样式 */
.module-results {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 40px;
}

.module-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.module-result-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.module-result-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.module-result-icon {
  font-size: 2.5em;
}

.module-result-name {
  flex: 1;
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
}

.module-result-score {
  font-size: 2em;
  font-weight: 700;
  color: #007bff;
}

.module-result-details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.detail-label {
  color: #6c757d;
}

.detail-value {
  font-weight: 600;
  color: #495057;
}

.module-result-performance {
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
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.5s ease;
}

.performance-label {
  font-weight: 600;
  color: #495057;
  min-width: 60px;
  text-align: right;
}

/* 题目详情样式 */
.question-details {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 40px;
}

.question-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.category-name {
  font-weight: 600;
  color: #495057;
}

.category-score {
  font-size: 1.3em;
  font-weight: 700;
  color: #007bff;
}

.category-stats {
  margin-bottom: 15px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-name {
  color: #6c757d;
  font-size: 0.9em;
}

.stat-value {
  font-weight: 600;
  color: #495057;
}

.category-progress {
  margin-top: 10px;
}

/* 改进建议样式 */
.improvement-suggestions {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 40px;
}

.suggestions-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.suggestion-category {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.suggestion-icon {
  font-size: 2em;
}

.suggestion-title {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
}

.suggestion-content {
  color: #6c757d;
  line-height: 1.6;
}

.suggestion-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-list li {
  margin-bottom: 10px;
  padding-left: 20px;
  position: relative;
}

.suggestion-list li:before {
  content: '•';
  color: #007bff;
  font-weight: bold;
  position: absolute;
  left: 0;
}

/* 操作按钮样式 */
.results-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
}

.btn-primary,
.btn-secondary,
.btn-success {
  border: none;
  padding: 15px 30px;
  font-size: 1.1em;
  border-radius: 10px;
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

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #1e7e34;
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
  
  .module-grid {
    grid-template-columns: 1fr;
  }
  
  .difficulty-options,
  .mode-options {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .overall-score {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .score-breakdown {
    grid-template-columns: 1fr;
  }
  
  .module-results-grid,
  .question-categories,
  .suggestions-container {
    grid-template-columns: 1fr;
  }
  
  .results-actions {
    flex-direction: column;
    align-items: center;
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
  animation: fadeIn 0.5s ease-out;
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
  --box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}
</style>