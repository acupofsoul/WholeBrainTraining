<template>
  <div class="selective-attention-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase fade-in">
      <div class="instruction-container">
        <h2 class="test-title">选择性注意力测试</h2>
        <div class="instruction-content">
          <div class="test-description">
            <h3>测试目标</h3>
            <p>评估您在干扰环境中选择性关注目标信息的能力。</p>
            
            <h3>测试步骤</h3>
            <ol>
              <li>屏幕上会同时出现多个刺激（目标和干扰项）</li>
              <li>您需要快速识别并响应目标刺激</li>
              <li>忽略所有干扰刺激，只对目标做出反应</li>
              <li>保持专注，避免被干扰项误导</li>
            </ol>
            
            <h3>测试设置</h3>
            <div class="test-settings">
              <div class="setting-group">
                <label>难度等级：</label>
                <select v-model="settings.difficulty" class="setting-select">
                  <option value="easy">简单（少干扰，明显差异）</option>
                  <option value="medium">中等（中等干扰，中等差异）</option>
                  <option value="hard">困难（多干扰，细微差异）</option>
                  <option value="expert">专家（极多干扰，极细差异）</option>
                </select>
              </div>
              
              <div class="setting-group">
                <label>测试类型：</label>
                <select v-model="settings.testType" class="setting-select">
                  <option value="visual">视觉搜索</option>
                  <option value="stroop">Stroop任务</option>
                  <option value="flanker">侧抑制任务</option>
                  <option value="mixed">混合任务</option>
                </select>
              </div>
              
              <div class="setting-group">
                <label>题目数量：</label>
                <select v-model="settings.questionCount" class="setting-select">
                  <option value="20">20题（快速测试）</option>
                  <option value="30">30题（标准测试）</option>
                  <option value="40">40题（完整测试）</option>
                  <option value="50">50题（深度测试）</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div class="instruction-actions">
          <button @click="startTest" class="btn-start">开始测试</button>
        </div>
      </div>
    </div>

    <!-- 测试进行中阶段 -->
    <div v-else-if="currentPhase === 'testing'" class="testing-phase">
      <div class="testing-container">
        <!-- 测试信息栏 -->
        <div class="test-info">
          <div class="info-item">
            <span class="info-label">任务类型：</span>
            <span class="info-value">{{ getTaskTypeName(currentTask.type) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">得分：</span>
            <span class="info-value">{{ currentScore }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">进度：</span>
            <span class="info-value">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">平均时间：</span>
            <span class="info-value">{{ averageReactionTime }}ms</span>
          </div>
        </div>
        
        <!-- 进度条 -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: testProgress + '%' }"></div>
        </div>
        
        <!-- 任务指示 -->
        <div class="task-instruction">
          <div class="instruction-text">{{ currentTask.instruction }}</div>
          <div v-if="currentTask.target" class="target-display">
            目标：<span class="target-item">{{ currentTask.target }}</span>
          </div>
        </div>
        
        <!-- 刺激显示区域 -->
        <div class="stimulus-area">
          <!-- 视觉搜索任务 -->
          <div v-if="currentTask.type === 'visual'" class="visual-search-area">
            <div class="search-grid">
              <div 
                v-for="(item, index) in currentTask.stimuli" 
                :key="index"
                class="search-item"
                :class="{ 'target-item': item.isTarget, 'distractor-item': !item.isTarget }"
                @click="handleItemClick(item, index)"
              >
                {{ item.content }}
              </div>
            </div>
          </div>
          
          <!-- Stroop任务 -->
          <div v-else-if="currentTask.type === 'stroop'" class="stroop-area">
            <div class="stroop-stimulus" :style="{ color: currentTask.stimulus.color }">
              {{ currentTask.stimulus.word }}
            </div>
            <div class="stroop-options">
              <button 
                v-for="option in currentTask.options" 
                :key="option"
                class="stroop-option"
                @click="handleStroopResponse(option)"
              >
                {{ option }}
              </button>
            </div>
          </div>
          
          <!-- 侧抑制任务 -->
          <div v-else-if="currentTask.type === 'flanker'" class="flanker-area">
            <div class="flanker-stimulus">
              <span v-for="(arrow, index) in currentTask.arrows" :key="index" class="arrow">
                {{ arrow }}
              </span>
            </div>
            <div class="flanker-options">
              <button class="flanker-option" @click="handleFlankerResponse('left')">
                ← 左
              </button>
              <button class="flanker-option" @click="handleFlankerResponse('right')">
                → 右
              </button>
            </div>
          </div>
        </div>
        
        <!-- 反馈区域 -->
        <div class="feedback-area">
          <div v-if="showFeedback" class="feedback-message" :class="feedbackClass">
            {{ feedbackMessage }}
          </div>
          
          <div class="performance-stats">
            <div class="stat-item">
              <span class="stat-label">准确率：</span>
              <span class="stat-value">{{ Math.round(accuracy) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">反应时间：</span>
              <span class="stat-value">{{ lastReactionTime }}ms</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">干扰效应：</span>
              <span class="stat-value">{{ interferenceEffect }}ms</span>
            </div>
          </div>
        </div>
        
        <!-- 控制按钮 -->
        <div class="control-buttons">
          <button @click="skipQuestion" class="btn-secondary">跳过</button>
          <button @click="endTest" class="btn-danger">结束测试</button>
        </div>
      </div>
    </div>

    <!-- 结果展示阶段 -->
    <div v-else-if="currentPhase === 'results'" class="results-phase fade-in">
      <div class="results-container">
        <h2 class="results-title">选择性注意力测试结果</h2>
        
        <!-- 总体结果 -->
        <div class="overall-results">
          <div class="result-score">
            <div class="score-circle" :style="{ background: `conic-gradient(#007bff ${(finalScore / 100) * 360}deg, #e9ecef 0deg)` }">
              <div class="score-inner">
                <div class="score-number">{{ finalScore }}</div>
                <div class="score-label">总得分</div>
              </div>
            </div>
          </div>
          
          <div class="result-summary">
            <div class="summary-item">
              <span class="summary-label">总准确率：</span>
              <span class="summary-value">{{ Math.round(overallAccuracy) }}%</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">平均反应时间：</span>
              <span class="summary-value">{{ overallAverageTime }}ms</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">完成题数：</span>
              <span class="summary-value">{{ completedQuestions }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">选择性注意力得分：</span>
              <span class="summary-value">{{ selectiveAttentionScore }}</span>
            </div>
          </div>
        </div>
        
        <!-- 详细分析 -->
        <div class="detailed-analysis">
          <h3 class="analysis-title">详细分析</h3>
          
          <!-- 任务类型表现 -->
          <div class="analysis-section">
            <h4 class="section-title">任务类型表现</h4>
            <div class="task-performance-grid">
              <div v-for="taskType in taskTypes" :key="taskType.type" class="task-performance-card">
                <div class="task-header">
                  <div class="task-icon">{{ taskType.icon }}</div>
                  <div class="task-name">{{ taskType.name }}</div>
                </div>
                <div class="task-stats">
                  <div class="task-stat">
                    <span class="stat-name">准确率：</span>
                    <span class="stat-value">{{ Math.round(getTaskAccuracy(taskType.type)) }}%</span>
                  </div>
                  <div class="task-stat">
                    <span class="stat-name">平均时间：</span>
                    <span class="stat-value">{{ getTaskAverageTime(taskType.type) }}ms</span>
                  </div>
                  <div class="task-stat">
                    <span class="stat-name">干扰效应：</span>
                    <span class="stat-value">{{ getTaskInterference(taskType.type) }}ms</span>
                  </div>
                </div>
                <div class="task-performance">
                  <div class="performance-bar">
                    <div class="performance-fill" :style="{ width: getTaskAccuracy(taskType.type) + '%' }"></div>
                  </div>
                  <span class="performance-label">{{ getPerformanceLevel(getTaskAccuracy(taskType.type)) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 干扰抗性分析 -->
          <div class="analysis-section">
            <h4 class="section-title">干扰抗性分析</h4>
            <div class="interference-analysis">
              <div class="interference-metrics">
                <div class="metric-card">
                  <div class="metric-value">{{ overallInterferenceEffect }}ms</div>
                  <div class="metric-label">总体干扰效应</div>
                  <div class="metric-description">干扰条件下的反应时间增加</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">{{ interferenceResistance }}%</div>
                  <div class="metric-label">干扰抗性</div>
                  <div class="metric-description">抵抗干扰的能力指数</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">{{ selectivityIndex.toFixed(2) }}</div>
                  <div class="metric-label">选择性指数</div>
                  <div class="metric-description">选择目标信息的效率</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">{{ attentionalControl }}%</div>
                  <div class="metric-label">注意控制</div>
                  <div class="metric-description">控制注意力分配的能力</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 难度表现分析 -->
          <div class="analysis-section">
            <h4 class="section-title">难度表现分析</h4>
            <div class="difficulty-analysis">
              <div class="difficulty-chart">
                <div v-for="level in difficultyLevels" :key="level" class="difficulty-bar">
                  <div class="difficulty-label">{{ getDifficultyName(level) }}</div>
                  <div class="difficulty-progress">
                    <div class="difficulty-fill" :style="{ width: getDifficultyAccuracy(level) + '%' }"></div>
                  </div>
                  <div class="difficulty-value">{{ Math.round(getDifficultyAccuracy(level)) }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 表现评价 -->
        <div class="performance-evaluation">
          <h3 class="analysis-title">表现评价</h3>
          <div class="evaluation-content">
            <div class="evaluation-text">
              <p>{{ getPerformanceEvaluation() }}</p>
            </div>
            
            <div class="improvement-suggestions">
              <h4 class="suggestions-title">改进建议</h4>
              <ul class="suggestions-list">
                <li v-for="suggestion in getImprovementSuggestions()" :key="suggestion">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="results-actions">
          <button @click="restartTest" class="btn-primary">重新测试</button>
          <button @click="finishTest" class="btn-secondary">完成测试</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SelectiveAttentionTest',
  props: {
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      currentPhase: 'instruction', // instruction, testing, results
      
      // 测试设置
      settings: {
        difficulty: 'medium',
        testType: 'visual',
        questionCount: 30
      },
      
      // 测试状态
      isTestActive: false,
      currentQuestionIndex: 0,
      totalQuestions: 30,
      testStartTime: null,
      
      // 当前任务
      currentTask: {},
      taskStartTime: null,
      
      // 反馈相关
      showFeedback: false,
      feedbackMessage: '',
      feedbackClass: '',
      lastReactionTime: 0,
      
      // 测试数据
      questions: [],
      responses: [],
      reactionTimes: [],
      
      // 任务类型配置
      taskTypes: [
        {
          type: 'visual',
          name: '视觉搜索',
          icon: '🔍',
          description: '在多个项目中找到目标'
        },
        {
          type: 'stroop',
          name: 'Stroop任务',
          icon: '🎨',
          description: '识别颜色词的颜色'
        },
        {
          type: 'flanker',
          name: '侧抑制任务',
          icon: '➡️',
          description: '识别中央箭头方向'
        }
      ],
      
      // 刺激库
      stimulusLibrary: {
        letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
        numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        shapes: ['●', '■', '▲', '◆', '★', '♠', '♣', '♥'],
        colors: ['红', '蓝', '绿', '黄', '紫', '橙'],
        colorValues: ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
      },
      
      // 难度配置
      difficultyConfig: {
        easy: {
          gridSize: 4, // 2x2
          distractorCount: 3,
          similarity: 0.3
        },
        medium: {
          gridSize: 9, // 3x3
          distractorCount: 8,
          similarity: 0.5
        },
        hard: {
          gridSize: 16, // 4x4
          distractorCount: 15,
          similarity: 0.7
        },
        expert: {
          gridSize: 25, // 5x5
          distractorCount: 24,
          similarity: 0.9
        }
      }
    }
  },
  
  computed: {
    testProgress() {
      if (this.totalQuestions === 0) return 0
      return (this.currentQuestionIndex / this.totalQuestions) * 100
    },
    
    currentScore() {
      if (this.responses.length === 0) return 0
      const correct = this.responses.filter(r => r.correct).length
      return Math.round((correct / this.responses.length) * 100)
    },
    
    accuracy() {
      if (this.responses.length === 0) return 0
      const correct = this.responses.filter(r => r.correct).length
      return (correct / this.responses.length) * 100
    },
    
    averageReactionTime() {
      const validTimes = this.reactionTimes.filter(time => time > 0 && time < 5000)
      if (validTimes.length === 0) return 0
      return Math.round(validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length)
    },
    
    interferenceEffect() {
      // 计算干扰效应（干扰条件 vs 非干扰条件的反应时间差）
      const congruentTimes = this.responses
        .filter(r => r.congruent && r.reactionTime > 0)
        .map(r => r.reactionTime)
      const incongruentTimes = this.responses
        .filter(r => !r.congruent && r.reactionTime > 0)
        .map(r => r.reactionTime)
      
      if (congruentTimes.length === 0 || incongruentTimes.length === 0) return 0
      
      const congruentAvg = congruentTimes.reduce((sum, time) => sum + time, 0) / congruentTimes.length
      const incongruentAvg = incongruentTimes.reduce((sum, time) => sum + time, 0) / incongruentTimes.length
      
      return Math.round(incongruentAvg - congruentAvg)
    },
    
    finalScore() {
      // 综合得分计算
      const accuracyScore = this.overallAccuracy
      const speedScore = Math.max(0, 100 - (this.overallAverageTime - 500) / 10)
      const interferenceScore = Math.max(0, 100 - this.overallInterferenceEffect / 5)
      const selectivityScore = this.selectivityIndex * 25
      
      return Math.round((accuracyScore * 0.4 + speedScore * 0.2 + interferenceScore * 0.2 + selectivityScore * 0.2))
    },
    
    selectiveAttentionScore() {
      return this.finalScore
    },
    
    overallAccuracy() {
      if (this.responses.length === 0) return 0
      const correct = this.responses.filter(r => r.correct).length
      return (correct / this.responses.length) * 100
    },
    
    overallAverageTime() {
      const validTimes = this.responses
        .filter(r => r.reactionTime > 0 && r.reactionTime < 5000)
        .map(r => r.reactionTime)
      if (validTimes.length === 0) return 0
      return Math.round(validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length)
    },
    
    completedQuestions() {
      return this.responses.length
    },
    
    overallInterferenceEffect() {
      return this.interferenceEffect
    },
    
    interferenceResistance() {
      // 干扰抗性 = 100 - (干扰效应 / 基线反应时间 * 100)
      const baselineTime = this.responses
        .filter(r => r.congruent && r.reactionTime > 0)
        .map(r => r.reactionTime)
        .reduce((sum, time, _, arr) => sum + time / arr.length, 0)
      
      if (baselineTime === 0) return 100
      return Math.max(0, Math.round(100 - (this.overallInterferenceEffect / baselineTime * 100)))
    },
    
    selectivityIndex() {
      // 选择性指数 = 正确率 / (正确率 + 误报率)
      const correctResponses = this.responses.filter(r => r.correct).length
      const falseAlarms = this.responses.filter(r => !r.correct && r.responded).length
      
      if (correctResponses + falseAlarms === 0) return 0
      return correctResponses / (correctResponses + falseAlarms)
    },
    
    attentionalControl() {
      // 注意控制 = (1 - 干扰效应标准化值) * 100
      const maxInterference = 500 // 假设最大干扰效应为500ms
      return Math.max(0, Math.round((1 - this.overallInterferenceEffect / maxInterference) * 100))
    },
    
    difficultyLevels() {
      return ['easy', 'medium', 'hard', 'expert']
    }
  },
  
  mounted() {
    // 合并传入的设置
    this.settings = { ...this.settings, ...this.props.settings }
    this.totalQuestions = parseInt(this.settings.questionCount)
    
    // 添加键盘事件监听
    document.addEventListener('keydown', this.handleKeyPress)
  },
  
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress)
  },
  
  methods: {
    startTest() {
      this.currentPhase = 'testing'
      this.initializeTest()
      this.generateNextQuestion()
    },
    
    initializeTest() {
      this.isTestActive = true
      this.currentQuestionIndex = 0
      this.testStartTime = Date.now()
      
      // 重置数据
      this.questions = []
      this.responses = []
      this.reactionTimes = []
    },
    
    generateNextQuestion() {
      if (this.currentQuestionIndex >= this.totalQuestions) {
        this.endTest()
        return
      }
      
      // 根据测试类型生成问题
      let taskType = this.settings.testType
      if (taskType === 'mixed') {
        const types = ['visual', 'stroop', 'flanker']
        taskType = types[Math.floor(Math.random() * types.length)]
      }
      
      switch (taskType) {
        case 'visual':
          this.generateVisualSearchTask()
          break
        case 'stroop':
          this.generateStroopTask()
          break
        case 'flanker':
          this.generateFlankerTask()
          break
      }
      
      this.taskStartTime = Date.now()
      this.showFeedback = false
    },
    
    generateVisualSearchTask() {
      const config = this.difficultyConfig[this.settings.difficulty]
      const stimuli = this.stimulusLibrary.letters
      
      // 选择目标
      const target = stimuli[Math.floor(Math.random() * stimuli.length)]
      
      // 生成刺激数组
      const items = []
      
      // 添加目标（1个）
      items.push({
        content: target,
        isTarget: true,
        position: Math.floor(Math.random() * config.gridSize)
      })
      
      // 添加干扰项
      for (let i = 1; i < config.gridSize; i++) {
        let distractor
        do {
          distractor = stimuli[Math.floor(Math.random() * stimuli.length)]
        } while (distractor === target)
        
        items.push({
          content: distractor,
          isTarget: false,
          position: i
        })
      }
      
      // 打乱顺序
      this.shuffleArray(items)
      
      this.currentTask = {
        type: 'visual',
        instruction: '找到目标字母并点击它',
        target: target,
        stimuli: items,
        correctAnswer: target
      }
    },
    
    generateStroopTask() {
      const colors = this.stimulusLibrary.colors
      const colorValues = this.stimulusLibrary.colorValues
      
      // 随机选择词语和颜色
      const wordIndex = Math.floor(Math.random() * colors.length)
      const colorIndex = Math.floor(Math.random() * colorValues.length)
      
      const word = colors[wordIndex]
      const color = colorValues[colorIndex]
      
      // 判断是否一致
      const congruent = wordIndex === colorIndex
      
      this.currentTask = {
        type: 'stroop',
        instruction: '选择文字的颜色（不是文字内容）',
        stimulus: {
          word: word,
          color: color
        },
        options: colors,
        correctAnswer: colors[colorIndex],
        congruent: congruent
      }
    },
    
    generateFlankerTask() {
      const directions = ['←', '→']
      const targetDirection = directions[Math.floor(Math.random() * 2)]
      
      // 生成侧抑制刺激
      const congruent = Math.random() > 0.5
      const flankerDirection = congruent ? targetDirection : (targetDirection === '←' ? '→' : '←')
      
      const arrows = [
        flankerDirection,
        flankerDirection,
        targetDirection,
        flankerDirection,
        flankerDirection
      ]
      
      this.currentTask = {
        type: 'flanker',
        instruction: '判断中间箭头的方向',
        arrows: arrows,
        correctAnswer: targetDirection === '←' ? 'left' : 'right',
        congruent: congruent
      }
    },
    
    handleItemClick(item, index) {
      if (!this.isTestActive) return
      
      const reactionTime = Date.now() - this.taskStartTime
      const correct = item.isTarget
      
      this.recordResponse({
        questionIndex: this.currentQuestionIndex,
        taskType: this.currentTask.type,
        responded: true,
        correct: correct,
        reactionTime: reactionTime,
        congruent: true, // 视觉搜索任务默认为一致
        answer: item.content,
        correctAnswer: this.currentTask.correctAnswer
      })
      
      this.showResponseFeedback(correct, reactionTime)
      this.proceedToNext()
    },
    
    handleStroopResponse(selectedColor) {
      if (!this.isTestActive) return
      
      const reactionTime = Date.now() - this.taskStartTime
      const correct = selectedColor === this.currentTask.correctAnswer
      
      this.recordResponse({
        questionIndex: this.currentQuestionIndex,
        taskType: this.currentTask.type,
        responded: true,
        correct: correct,
        reactionTime: reactionTime,
        congruent: this.currentTask.congruent,
        answer: selectedColor,
        correctAnswer: this.currentTask.correctAnswer
      })
      
      this.showResponseFeedback(correct, reactionTime)
      this.proceedToNext()
    },
    
    handleFlankerResponse(direction) {
      if (!this.isTestActive) return
      
      const reactionTime = Date.now() - this.taskStartTime
      const correct = direction === this.currentTask.correctAnswer
      
      this.recordResponse({
        questionIndex: this.currentQuestionIndex,
        taskType: this.currentTask.type,
        responded: true,
        correct: correct,
        reactionTime: reactionTime,
        congruent: this.currentTask.congruent,
        answer: direction,
        correctAnswer: this.currentTask.correctAnswer
      })
      
      this.showResponseFeedback(correct, reactionTime)
      this.proceedToNext()
    },
    
    handleKeyPress(event) {
      if (this.currentPhase !== 'testing') return
      
      // 侧抑制任务的键盘响应
      if (this.currentTask.type === 'flanker') {
        if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
          event.preventDefault()
          this.handleFlankerResponse('left')
        } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
          event.preventDefault()
          this.handleFlankerResponse('right')
        }
      }
    },
    
    recordResponse(response) {
      this.responses.push(response)
      
      if (response.reactionTime > 0) {
        this.reactionTimes.push(response.reactionTime)
      }
      
      this.lastReactionTime = response.reactionTime
    },
    
    showResponseFeedback(correct, reactionTime) {
      this.showFeedback = true
      
      if (correct) {
        this.feedbackMessage = `正确！ (${reactionTime}ms)`
        this.feedbackClass = 'feedback-correct'
      } else {
        this.feedbackMessage = `错误！ (${reactionTime}ms)`
        this.feedbackClass = 'feedback-incorrect'
      }
      
      // 短暂显示反馈后隐藏
      setTimeout(() => {
        this.showFeedback = false
      }, 1000)
    },
    
    proceedToNext() {
      setTimeout(() => {
        this.currentQuestionIndex++
        this.generateNextQuestion()
      }, 1500)
    },
    
    skipQuestion() {
      this.recordResponse({
        questionIndex: this.currentQuestionIndex,
        taskType: this.currentTask.type,
        responded: false,
        correct: false,
        reactionTime: 0,
        congruent: this.currentTask.congruent || true,
        answer: null,
        correctAnswer: this.currentTask.correctAnswer
      })
      
      this.currentQuestionIndex++
      this.generateNextQuestion()
    },
    
    endTest() {
      this.isTestActive = false
      this.currentPhase = 'results'
      
      // 发送完成事件给父组件
      this.$emit('complete', {
        score: this.finalScore,
        accuracy: this.overallAccuracy,
        averageTime: this.overallAverageTime,
        completedQuestions: this.completedQuestions,
        totalQuestions: this.totalQuestions,
        correctAnswers: this.responses.filter(r => r.correct).length,
        selectiveAttentionScore: this.selectiveAttentionScore
      })
    },
    
    restartTest() {
      this.currentPhase = 'instruction'
    },
    
    finishTest() {
      this.$emit('complete', {
        score: this.finalScore,
        accuracy: this.overallAccuracy,
        averageTime: this.overallAverageTime,
        completedQuestions: this.completedQuestions,
        totalQuestions: this.totalQuestions,
        correctAnswers: this.responses.filter(r => r.correct).length,
        selectiveAttentionScore: this.selectiveAttentionScore
      })
    },
    
    // 辅助方法
    getTaskTypeName(type) {
      const taskType = this.taskTypes.find(t => t.type === type)
      return taskType ? taskType.name : type
    },
    
    getTaskAccuracy(taskType) {
      const taskResponses = this.responses.filter(r => r.taskType === taskType)
      if (taskResponses.length === 0) return 0
      const correct = taskResponses.filter(r => r.correct).length
      return (correct / taskResponses.length) * 100
    },
    
    getTaskAverageTime(taskType) {
      const taskResponses = this.responses.filter(r => r.taskType === taskType && r.reactionTime > 0)
      if (taskResponses.length === 0) return 0
      const totalTime = taskResponses.reduce((sum, r) => sum + r.reactionTime, 0)
      return Math.round(totalTime / taskResponses.length)
    },
    
    getTaskInterference(taskType) {
      const taskResponses = this.responses.filter(r => r.taskType === taskType && r.reactionTime > 0)
      const congruent = taskResponses.filter(r => r.congruent)
      const incongruent = taskResponses.filter(r => !r.congruent)
      
      if (congruent.length === 0 || incongruent.length === 0) return 0
      
      const congruentAvg = congruent.reduce((sum, r) => sum + r.reactionTime, 0) / congruent.length
      const incongruentAvg = incongruent.reduce((sum, r) => sum + r.reactionTime, 0) / incongruent.length
      
      return Math.round(incongruentAvg - congruentAvg)
    },
    
    getDifficultyName(level) {
      const names = {
        easy: '简单',
        medium: '中等',
        hard: '困难',
        expert: '专家'
      }
      return names[level] || level
    },
    
    getDifficultyAccuracy(level) {
      // 这里应该根据实际的难度级别数据计算
      // 简化处理，返回模拟数据
      const baseAccuracy = this.overallAccuracy
      const adjustments = {
        easy: 10,
        medium: 0,
        hard: -10,
        expert: -20
      }
      return Math.max(0, Math.min(100, baseAccuracy + (adjustments[level] || 0)))
    },
    
    getPerformanceLevel(score) {
      if (score >= 90) return '优秀'
      if (score >= 80) return '良好'
      if (score >= 70) return '中等'
      if (score >= 60) return '及格'
      return '需要改进'
    },
    
    getPerformanceEvaluation() {
      const score = this.finalScore
      const accuracy = this.overallAccuracy
      const interference = this.overallInterferenceEffect
      const selectivity = this.selectivityIndex
      
      let evaluation = ''
      
      if (score >= 90) {
        evaluation = '优秀！您的选择性注意力能力非常出色，能够有效地在干扰环境中专注于目标信息。'
      } else if (score >= 80) {
        evaluation = '良好！您的选择性注意力能力较强，在大多数情况下能够有效过滤干扰信息。'
      } else if (score >= 70) {
        evaluation = '中等！您的选择性注意力能力处于平均水平，在复杂环境中可能会受到一定干扰。'
      } else if (score >= 60) {
        evaluation = '一般！您的选择性注意力能力有待提升，容易被干扰信息影响。'
      } else {
        evaluation = '需要改进！建议加强选择性注意力训练，提高抗干扰能力。'
      }
      
      if (interference > 200) {
        evaluation += '您对干扰刺激比较敏感，建议练习抑制控制任务。'
      }
      
      if (selectivity < 0.7) {
        evaluation += '您的目标选择能力需要提升，建议加强视觉搜索训练。'
      }
      
      return evaluation
    },
    
    getImprovementSuggestions() {
      const suggestions = []
      
      if (this.overallAccuracy < 80) {
        suggestions.push('提高任务准确性，仔细观察目标特征')
        suggestions.push('练习视觉搜索任务，提高目标识别能力')
      }
      
      if (this.overallInterferenceEffect > 150) {
        suggestions.push('加强抑制控制训练，减少干扰影响')
        suggestions.push('练习Stroop任务，提高认知控制能力')
      }
      
      if (this.overallAverageTime > 1000) {
        suggestions.push('提高反应速度，进行快速决策训练')
      }
      
      if (this.selectivityIndex < 0.8) {
        suggestions.push('提高选择性，减少误报反应')
        suggestions.push('加强注意力集中训练')
      }
      
      if (this.interferenceResistance < 70) {
        suggestions.push('增强干扰抗性，练习在嘈杂环境中专注')
      }
      
      suggestions.push('定期进行注意力训练，保持认知灵活性')
      suggestions.push('减少多任务处理，专注于单一目标')
      
      return suggestions.slice(0, 5)
    },
    
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }
  }
}
</script>

<style scoped>
/* 基础样式 */
.selective-attention-test {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* 说明阶段样式 */
.instruction-phase {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.instruction-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.test-title {
  text-align: center;
  font-size: 2.2em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 30px;
}

.instruction-content h3 {
  color: #007bff;
  font-size: 1.3em;
  margin-top: 25px;
  margin-bottom: 15px;
}

.instruction-content p {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 15px;
}

.instruction-content ol {
  color: #495057;
  line-height: 1.6;
  padding-left: 20px;
}

.instruction-content li {
  margin-bottom: 8px;
}

.test-settings {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
}

.setting-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
}

.setting-group label {
  font-weight: 600;
  color: #495057;
  min-width: 100px;
}

.setting-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
  font-size: 1em;
}

.instruction-actions {
  text-align: center;
  margin-top: 30px;
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

.btn-start:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

/* 测试阶段样式 */
.testing-phase {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.testing-container {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 1000px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.test-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.info-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
}

.info-label {
  display: block;
  font-size: 0.9em;
  color: #6c757d;
  margin-bottom: 5px;
}

.info-value {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.task-instruction {
  text-align: center;
  margin-bottom: 30px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
}

.instruction-text {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.target-display {
  font-size: 1.1em;
  color: #007bff;
}

.target-item {
  background: #e3f2fd;
  padding: 5px 15px;
  border-radius: 8px;
  font-weight: 600;
  border: 2px solid #007bff;
}

.stimulus-area {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

/* 视觉搜索任务样式 */
.visual-search-area {
  width: 100%;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.search-item {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  font-weight: bold;
  border: 3px solid #e9ecef;
  border-radius: 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-item:hover {
  transform: scale(1.05);
  border-color: #007bff;
  background: #e3f2fd;
}

.search-item.target-item {
  animation: targetPulse 2s infinite;
}

/* Stroop任务样式 */
.stroop-area {
  text-align: center;
  width: 100%;
}

.stroop-stimulus {
  font-size: 4em;
  font-weight: bold;
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 15px;
  background: #f8f9fa;
}

.stroop-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.stroop-option {
  padding: 15px 20px;
  font-size: 1.1em;
  font-weight: 600;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stroop-option:hover {
  border-color: #007bff;
  background: #e3f2fd;
  transform: translateY(-2px);
}

/* 侧抑制任务样式 */
.flanker-area {
  text-align: center;
  width: 100%;
}

.flanker-stimulus {
  font-size: 3em;
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 15px;
  background: #f8f9fa;
  letter-spacing: 10px;
}

.arrow {
  display: inline-block;
  margin: 0 5px;
}

.flanker-options {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.flanker-option {
  padding: 15px 30px;
  font-size: 1.2em;
  font-weight: 600;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.flanker-option:hover {
  border-color: #007bff;
  background: #e3f2fd;
  transform: translateY(-2px);
}

.feedback-area {
  text-align: center;
  margin-bottom: 30px;
}

.feedback-message {
  font-size: 1.2em;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.feedback-message.feedback-correct {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.feedback-message.feedback-incorrect {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.performance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-item {
  background: #f8f9fa;
  padding: 10px 15px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9em;
  color: #6c757d;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.1em;
  font-weight: 600;
  color: #007bff;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
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

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
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

.results-title {
  text-align: center;
  font-size: 2.2em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 30px;
}

.overall-results {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 40px;
  align-items: center;
  margin-bottom: 40px;
  background: #f8f9fa;
  padding: 30px;
  border-radius: 15px;
}

.result-score {
  display: flex;
  justify-content: center;
}

.score-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-inner {
  background: white;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.score-number {
  font-size: 2.5em;
  font-weight: 600;
  color: #007bff;
}

.score-label {
  font-size: 1em;
  color: #6c757d;
  margin-top: 5px;
}

.result-summary {
  display: grid;
  gap: 15px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 20px;
  border-radius: 10px;
  border-left: 4px solid #007bff;
}

.summary-label {
  font-weight: 600;
  color: #495057;
}

.summary-value {
  font-size: 1.1em;
  font-weight: 600;
  color: #007bff;
}

.detailed-analysis {
  margin-bottom: 30px;
}

.analysis-title {
  font-size: 1.8em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 25px;
  text-align: center;
}

.analysis-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.3em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 20px;
}

.task-performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.task-performance-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.task-icon {
  font-size: 2em;
}

.task-name {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
}

.task-stats {
  margin-bottom: 15px;
}

.task-stat {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-name {
  color: #6c757d;
}

.stat-value {
  font-weight: 600;
  color: #495057;
}

.task-performance {
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

.interference-analysis {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
}

.interference-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.metric-value {
  font-size: 2em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 8px;
}

.metric-label {
  font-size: 1.1em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 5px;
}

.metric-description {
  font-size: 0.9em;
  color: #6c757d;
  line-height: 1.4;
}

.difficulty-analysis {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
}

.difficulty-chart {
  display: grid;
  gap: 15px;
}

.difficulty-bar {
  display: grid;
  grid-template-columns: 100px 1fr 80px;
  align-items: center;
  gap: 15px;
  background: white;
  padding: 15px;
  border-radius: 8px;
}

.difficulty-label {
  font-weight: 600;
  color: #495057;
}

.difficulty-progress {
  height: 10px;
  background: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
}

.difficulty-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.difficulty-value {
  font-weight: 600;
  color: #007bff;
  text-align: right;
}

.performance-evaluation {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.evaluation-content {
  display: grid;
  gap: 25px;
}

.evaluation-text {
  font-size: 1.1em;
  line-height: 1.6;
  color: #495057;
}

.suggestions-title {
  font-size: 1.2em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 15px;
}

.suggestions-list {
  list-style: none;
  padding: 0;
}

.suggestions-list li {
  background: white;
  padding: 12px 15px;
  margin-bottom: 8px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  color: #495057;
  line-height: 1.5;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .instruction-container,
  .testing-container,
  .results-container {
    padding: 20px;
    margin: 10px;
  }
  
  .test-title,
  .results-title {
    font-size: 1.8em;
  }
  
  .overall-results {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .score-circle {
    width: 150px;
    height: 150px;
  }
  
  .score-inner {
    width: 120px;
    height: 120px;
  }
  
  .score-number {
    font-size: 2em;
  }
  
  .search-grid {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
    gap: 10px;
  }
  
  .search-item {
    width: 60px;
    height: 60px;
    font-size: 1.5em;
  }
  
  .stroop-stimulus {
    font-size: 3em;
  }
  
  .flanker-stimulus {
    font-size: 2.5em;
    letter-spacing: 5px;
  }
  
  .test-info {
    grid-template-columns: 1fr;
  }
  
  .task-performance-grid {
    grid-template-columns: 1fr;
  }
  
  .interference-metrics {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .difficulty-bar {
    grid-template-columns: 80px 1fr 60px;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .selective-attention-test {
    padding: 10px;
  }
  
  .instruction-container,
  .testing-container,
  .results-container {
    padding: 15px;
  }
  
  .test-title,
  .results-title {
    font-size: 1.5em;
  }
  
  .search-item {
    width: 50px;
    height: 50px;
    font-size: 1.2em;
  }
  
  .stroop-stimulus {
    font-size: 2.5em;
  }
  
  .flanker-stimulus {
    font-size: 2em;
    letter-spacing: 3px;
  }
  
  .flanker-options {
    flex-direction: column;
    gap: 15px;
  }
  
  .control-buttons,
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

@keyframes targetPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

.slide-in {
  animation: slideIn 0.6s ease-out;
}

.scale-in {
  animation: scaleIn 0.6s ease-out;
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
  --border-radius: 8px;
  --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}
</style>