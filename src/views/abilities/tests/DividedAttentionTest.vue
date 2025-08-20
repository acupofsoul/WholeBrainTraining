<template>
  <div class="divided-attention-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase fade-in">
      <div class="instruction-container">
        <h2 class="test-title">分散注意力测试</h2>
        <div class="instruction-content">
          <div class="test-description">
            <h3>测试目标</h3>
            <p>评估您同时处理多个任务和信息源的能力。</p>
            
            <h3>测试步骤</h3>
            <ol>
              <li>屏幕上会同时出现多个任务</li>
              <li>您需要同时关注并响应所有任务</li>
              <li>保持对多个信息源的监控</li>
              <li>在任务间快速切换注意力</li>
            </ol>
            
            <h3>测试设置</h3>
            <div class="test-settings">
              <div class="setting-group">
                <label>难度等级：</label>
                <select v-model="settings.difficulty" class="setting-select">
                  <option value="easy">简单（2个任务，慢速）</option>
                  <option value="medium">中等（3个任务，中速）</option>
                  <option value="hard">困难（4个任务，快速）</option>
                  <option value="expert">专家（5个任务，极快）</option>
                </select>
              </div>
              
              <div class="setting-group">
                <label>任务类型：</label>
                <select v-model="settings.taskType" class="setting-select">
                  <option value="dual">双任务</option>
                  <option value="multi">多任务</option>
                  <option value="tracking">追踪任务</option>
                  <option value="mixed">混合任务</option>
                </select>
              </div>
              
              <div class="setting-group">
                <label>测试时长：</label>
                <select v-model="settings.duration" class="setting-select">
                  <option value="60">1分钟（快速测试）</option>
                  <option value="120">2分钟（标准测试）</option>
                  <option value="180">3分钟（完整测试）</option>
                  <option value="300">5分钟（深度测试）</option>
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
            <span class="info-label">剩余时间：</span>
            <span class="info-value">{{ formatTime(remainingTime) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">总得分：</span>
            <span class="info-value">{{ totalScore }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">任务数：</span>
            <span class="info-value">{{ activeTasks.length }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">准确率：</span>
            <span class="info-value">{{ Math.round(overallAccuracy) }}%</span>
          </div>
        </div>
        
        <!-- 进度条 -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: testProgress + '%' }"></div>
        </div>
        
        <!-- 多任务区域 -->
        <div class="multi-task-area">
          <!-- 主任务区域 -->
          <div class="primary-task-area">
            <!-- 数字计算任务 -->
            <div v-if="primaryTask.type === 'calculation'" class="calculation-task task-panel">
              <div class="task-header">
                <h4 class="task-title">数字计算</h4>
                <div class="task-score">得分: {{ primaryTask.score }}</div>
              </div>
              <div class="calculation-content">
                <div class="calculation-problem">{{ primaryTask.problem }}</div>
                <div class="calculation-input">
                  <input 
                    v-model="primaryTask.userAnswer" 
                    @keyup.enter="submitCalculation"
                    type="number" 
                    placeholder="输入答案"
                    class="answer-input"
                  >
                  <button @click="submitCalculation" class="submit-btn">提交</button>
                </div>
              </div>
            </div>
            
            <!-- 文字识别任务 -->
            <div v-else-if="primaryTask.type === 'word'" class="word-task task-panel">
              <div class="task-header">
                <h4 class="task-title">文字识别</h4>
                <div class="task-score">得分: {{ primaryTask.score }}</div>
              </div>
              <div class="word-content">
                <div class="word-display">{{ primaryTask.word }}</div>
                <div class="word-question">这个词是什么颜色？</div>
                <div class="word-options">
                  <button 
                    v-for="color in primaryTask.options" 
                    :key="color"
                    @click="submitWordAnswer(color)"
                    class="color-option"
                    :style="{ backgroundColor: getColorValue(color) }"
                  >
                    {{ color }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 次要任务区域 -->
          <div class="secondary-tasks-area">
            <!-- 追踪任务 -->
            <div v-for="task in secondaryTasks" :key="task.id" class="secondary-task task-panel">
              <!-- 移动目标追踪 -->
              <div v-if="task.type === 'tracking'" class="tracking-task">
                <div class="task-header">
                  <h5 class="task-title">目标追踪</h5>
                  <div class="task-score">{{ task.score }}</div>
                </div>
                <div class="tracking-area" @click="handleTrackingClick($event, task)">
                  <div 
                    v-for="target in task.targets" 
                    :key="target.id"
                    class="tracking-target"
                    :class="{ 'target-active': target.isTarget, 'target-distractor': !target.isTarget }"
                    :style="{ left: target.x + 'px', top: target.y + 'px' }"
                  >
                    {{ target.symbol }}
                  </div>
                </div>
              </div>
              
              <!-- 计数任务 -->
              <div v-else-if="task.type === 'counting'" class="counting-task">
                <div class="task-header">
                  <h5 class="task-title">计数任务</h5>
                  <div class="task-score">{{ task.score }}</div>
                </div>
                <div class="counting-content">
                  <div class="counting-display">
                    <div v-for="item in task.items" :key="item.id" class="counting-item">
                      {{ item.symbol }}
                    </div>
                  </div>
                  <div class="counting-question">红色圆圈有几个？</div>
                  <div class="counting-input">
                    <input 
                      v-model="task.userCount" 
                      @keyup.enter="submitCount(task)"
                      type="number" 
                      min="0" 
                      max="20"
                      class="count-input"
                    >
                    <button @click="submitCount(task)" class="submit-btn">确认</button>
                  </div>
                </div>
              </div>
              
              <!-- 监控任务 -->
              <div v-else-if="task.type === 'monitoring'" class="monitoring-task">
                <div class="task-header">
                  <h5 class="task-title">信号监控</h5>
                  <div class="task-score">{{ task.score }}</div>
                </div>
                <div class="monitoring-content">
                  <div class="signal-display">
                    <div 
                      v-for="signal in task.signals" 
                      :key="signal.id"
                      class="signal-indicator"
                      :class="{ 'signal-active': signal.active, 'signal-target': signal.isTarget }"
                      @click="handleSignalClick(signal, task)"
                    >
                      {{ signal.value }}
                    </div>
                  </div>
                  <div class="monitoring-instruction">点击红色信号</div>
                </div>
              </div>
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
              <span class="stat-label">主任务准确率：</span>
              <span class="stat-value">{{ Math.round(primaryTaskAccuracy) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">次要任务准确率：</span>
              <span class="stat-value">{{ Math.round(secondaryTaskAccuracy) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">任务切换次数：</span>
              <span class="stat-value">{{ taskSwitches }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">多任务效率：</span>
              <span class="stat-value">{{ Math.round(multitaskingEfficiency) }}%</span>
            </div>
          </div>
        </div>
        
        <!-- 控制按钮 -->
        <div class="control-buttons">
          <button @click="pauseTest" class="btn-secondary">{{ isPaused ? '继续' : '暂停' }}</button>
          <button @click="endTest" class="btn-danger">结束测试</button>
        </div>
      </div>
    </div>

    <!-- 结果展示阶段 -->
    <div v-else-if="currentPhase === 'results'" class="results-phase fade-in">
      <div class="results-container">
        <h2 class="results-title">分散注意力测试结果</h2>
        
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
              <span class="summary-label">测试时长：</span>
              <span class="summary-value">{{ formatTime(testDuration) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">总体准确率：</span>
              <span class="summary-value">{{ Math.round(finalAccuracy) }}%</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">完成任务数：</span>
              <span class="summary-value">{{ completedTasks }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">分散注意力得分：</span>
              <span class="summary-value">{{ dividedAttentionScore }}</span>
            </div>
          </div>
        </div>
        
        <!-- 详细分析 -->
        <div class="detailed-analysis">
          <h3 class="analysis-title">详细分析</h3>
          
          <!-- 任务表现分析 -->
          <div class="analysis-section">
            <h4 class="section-title">任务表现分析</h4>
            <div class="task-performance-grid">
              <div class="task-performance-card">
                <div class="task-header">
                  <div class="task-icon">🎯</div>
                  <div class="task-name">主任务表现</div>
                </div>
                <div class="task-stats">
                  <div class="task-stat">
                    <span class="stat-name">准确率：</span>
                    <span class="stat-value">{{ Math.round(finalPrimaryAccuracy) }}%</span>
                  </div>
                  <div class="task-stat">
                    <span class="stat-name">完成数：</span>
                    <span class="stat-value">{{ primaryTaskCompleted }}</span>
                  </div>
                  <div class="task-stat">
                    <span class="stat-name">平均时间：</span>
                    <span class="stat-value">{{ primaryTaskAverageTime }}ms</span>
                  </div>
                </div>
                <div class="task-performance">
                  <div class="performance-bar">
                    <div class="performance-fill" :style="{ width: finalPrimaryAccuracy + '%' }"></div>
                  </div>
                  <span class="performance-label">{{ getPerformanceLevel(finalPrimaryAccuracy) }}</span>
                </div>
              </div>
              
              <div class="task-performance-card">
                <div class="task-header">
                  <div class="task-icon">🔄</div>
                  <div class="task-name">次要任务表现</div>
                </div>
                <div class="task-stats">
                  <div class="task-stat">
                    <span class="stat-name">准确率：</span>
                    <span class="stat-value">{{ Math.round(finalSecondaryAccuracy) }}%</span>
                  </div>
                  <div class="task-stat">
                    <span class="stat-name">完成数：</span>
                    <span class="stat-value">{{ secondaryTaskCompleted }}</span>
                  </div>
                  <div class="task-stat">
                    <span class="stat-name">平均时间：</span>
                    <span class="stat-value">{{ secondaryTaskAverageTime }}ms</span>
                  </div>
                </div>
                <div class="task-performance">
                  <div class="performance-bar">
                    <div class="performance-fill" :style="{ width: finalSecondaryAccuracy + '%' }"></div>
                  </div>
                  <span class="performance-label">{{ getPerformanceLevel(finalSecondaryAccuracy) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 多任务能力分析 -->
          <div class="analysis-section">
            <h4 class="section-title">多任务能力分析</h4>
            <div class="multitask-analysis">
              <div class="multitask-metrics">
                <div class="metric-card">
                  <div class="metric-value">{{ Math.round(finalMultitaskingEfficiency) }}%</div>
                  <div class="metric-label">多任务效率</div>
                  <div class="metric-description">同时处理多个任务的效率</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">{{ finalTaskSwitches }}</div>
                  <div class="metric-label">任务切换次数</div>
                  <div class="metric-description">注意力在任务间的转换频率</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">{{ attentionDistribution.toFixed(2) }}</div>
                  <div class="metric-label">注意力分配</div>
                  <div class="metric-description">注意力资源的分配均衡性</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">{{ cognitiveLoad }}%</div>
                  <div class="metric-label">认知负荷</div>
                  <div class="metric-description">处理多任务时的认知压力</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 时间分析 -->
          <div class="analysis-section">
            <h4 class="section-title">时间表现分析</h4>
            <div class="time-analysis">
              <div class="time-chart">
                <div class="time-metric">
                  <div class="time-label">主任务平均时间</div>
                  <div class="time-bar">
                    <div class="time-fill" :style="{ width: getTimePercentage(primaryTaskAverageTime) + '%' }"></div>
                  </div>
                  <div class="time-value">{{ primaryTaskAverageTime }}ms</div>
                </div>
                <div class="time-metric">
                  <div class="time-label">次要任务平均时间</div>
                  <div class="time-bar">
                    <div class="time-fill" :style="{ width: getTimePercentage(secondaryTaskAverageTime) + '%' }"></div>
                  </div>
                  <div class="time-value">{{ secondaryTaskAverageTime }}ms</div>
                </div>
                <div class="time-metric">
                  <div class="time-label">任务切换时间</div>
                  <div class="time-bar">
                    <div class="time-fill" :style="{ width: getTimePercentage(taskSwitchTime) + '%' }"></div>
                  </div>
                  <div class="time-value">{{ taskSwitchTime }}ms</div>
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
  name: 'DividedAttentionTest',
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
        taskType: 'dual',
        duration: 120
      },
      
      // 测试状态
      isTestActive: false,
      isPaused: false,
      testStartTime: null,
      remainingTime: 120,
      testTimer: null,
      
      // 任务数据
      primaryTask: {},
      secondaryTasks: [],
      activeTasks: [],
      
      // 得分和统计
      totalScore: 0,
      taskSwitches: 0,
      lastActiveTask: null,
      
      // 反馈相关
      showFeedback: false,
      feedbackMessage: '',
      feedbackClass: '',
      
      // 测试数据记录
      responses: [],
      taskPerformance: {
        primary: {
          correct: 0,
          total: 0,
          times: []
        },
        secondary: {
          correct: 0,
          total: 0,
          times: []
        }
      },
      
      // 任务生成器
      taskGenerators: {
        calculation: this.generateCalculationTask,
        word: this.generateWordTask,
        tracking: this.generateTrackingTask,
        counting: this.generateCountingTask,
        monitoring: this.generateMonitoringTask
      },
      
      // 刺激库
      stimulusLibrary: {
        colors: ['红', '蓝', '绿', '黄', '紫', '橙'],
        colorValues: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
        symbols: ['●', '■', '▲', '◆', '★', '♠', '♣', '♥'],
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      },
      
      // 难度配置
      difficultyConfig: {
        easy: {
          taskCount: 2,
          updateInterval: 3000,
          complexity: 1
        },
        medium: {
          taskCount: 3,
          updateInterval: 2000,
          complexity: 2
        },
        hard: {
          taskCount: 4,
          updateInterval: 1500,
          complexity: 3
        },
        expert: {
          taskCount: 5,
          updateInterval: 1000,
          complexity: 4
        }
      }
    }
  },
  
  computed: {
    testProgress() {
      const totalTime = parseInt(this.settings.duration)
      return ((totalTime - this.remainingTime) / totalTime) * 100
    },
    
    overallAccuracy() {
      const totalCorrect = this.taskPerformance.primary.correct + this.taskPerformance.secondary.correct
      const totalAttempts = this.taskPerformance.primary.total + this.taskPerformance.secondary.total
      return totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0
    },
    
    primaryTaskAccuracy() {
      const { correct, total } = this.taskPerformance.primary
      return total > 0 ? (correct / total) * 100 : 0
    },
    
    secondaryTaskAccuracy() {
      const { correct, total } = this.taskPerformance.secondary
      return total > 0 ? (correct / total) * 100 : 0
    },
    
    multitaskingEfficiency() {
      // 多任务效率 = (主任务准确率 + 次要任务准确率) / 2 * (1 - 任务切换惩罚)
      const avgAccuracy = (this.primaryTaskAccuracy + this.secondaryTaskAccuracy) / 2
      const switchPenalty = Math.min(this.taskSwitches / 100, 0.3) // 最大30%惩罚
      return Math.max(0, avgAccuracy * (1 - switchPenalty))
    },
    
    finalScore() {
      // 综合得分计算
      const accuracyScore = this.overallAccuracy
      const efficiencyScore = this.multitaskingEfficiency
      const timeScore = Math.max(0, 100 - (this.averageResponseTime - 1000) / 20)
      
      return Math.round((accuracyScore * 0.4 + efficiencyScore * 0.4 + timeScore * 0.2))
    },
    
    dividedAttentionScore() {
      return this.finalScore
    },
    
    testDuration() {
      return parseInt(this.settings.duration) - this.remainingTime
    },
    
    finalAccuracy() {
      return this.overallAccuracy
    },
    
    completedTasks() {
      return this.taskPerformance.primary.total + this.taskPerformance.secondary.total
    },
    
    finalPrimaryAccuracy() {
      return this.primaryTaskAccuracy
    },
    
    finalSecondaryAccuracy() {
      return this.secondaryTaskAccuracy
    },
    
    primaryTaskCompleted() {
      return this.taskPerformance.primary.total
    },
    
    secondaryTaskCompleted() {
      return this.taskPerformance.secondary.total
    },
    
    primaryTaskAverageTime() {
      const times = this.taskPerformance.primary.times
      return times.length > 0 ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : 0
    },
    
    secondaryTaskAverageTime() {
      const times = this.taskPerformance.secondary.times
      return times.length > 0 ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : 0
    },
    
    averageResponseTime() {
      const allTimes = [...this.taskPerformance.primary.times, ...this.taskPerformance.secondary.times]
      return allTimes.length > 0 ? allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length : 0
    },
    
    finalMultitaskingEfficiency() {
      return this.multitaskingEfficiency
    },
    
    finalTaskSwitches() {
      return this.taskSwitches
    },
    
    attentionDistribution() {
      // 注意力分配均衡性（越接近1越均衡）
      const primaryRatio = this.taskPerformance.primary.total / this.completedTasks
      const secondaryRatio = this.taskPerformance.secondary.total / this.completedTasks
      return 1 - Math.abs(primaryRatio - secondaryRatio)
    },
    
    cognitiveLoad() {
      // 认知负荷估算
      const taskComplexity = this.difficultyConfig[this.settings.difficulty].complexity
      const switchFrequency = this.taskSwitches / (this.testDuration / 60) // 每分钟切换次数
      const baseLoad = taskComplexity * 20
      const switchLoad = Math.min(switchFrequency * 5, 30)
      return Math.min(100, Math.round(baseLoad + switchLoad))
    },
    
    taskSwitchTime() {
      // 任务切换时间（模拟计算）
      return Math.round(200 + this.taskSwitches * 10)
    }
  },
  
  mounted() {
    // 合并传入的设置
    this.settings = { ...this.settings, ...this.props.settings }
    this.remainingTime = parseInt(this.settings.duration)
  },
  
  beforeUnmount() {
    if (this.testTimer) {
      clearInterval(this.testTimer)
    }
  },
  
  methods: {
    startTest() {
      this.currentPhase = 'testing'
      this.initializeTest()
      this.startTimer()
      this.generateTasks()
    },
    
    initializeTest() {
      this.isTestActive = true
      this.testStartTime = Date.now()
      this.remainingTime = parseInt(this.settings.duration)
      
      // 重置数据
      this.totalScore = 0
      this.taskSwitches = 0
      this.lastActiveTask = null
      this.responses = []
      this.taskPerformance = {
        primary: { correct: 0, total: 0, times: [] },
        secondary: { correct: 0, total: 0, times: [] }
      }
    },
    
    startTimer() {
      this.testTimer = setInterval(() => {
        if (!this.isPaused && this.remainingTime > 0) {
          this.remainingTime--
        } else if (this.remainingTime <= 0) {
          this.endTest()
        }
      }, 1000)
    },
    
    generateTasks() {
      const config = this.difficultyConfig[this.settings.difficulty]
      
      // 生成主任务
      this.generatePrimaryTask()
      
      // 生成次要任务
      this.generateSecondaryTasks(config.taskCount - 1)
      
      // 设置任务更新定时器
      this.setupTaskUpdates(config.updateInterval)
    },
    
    generatePrimaryTask() {
      const taskTypes = ['calculation', 'word']
      const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)]
      
      this.primaryTask = this.taskGenerators[taskType]()
      this.primaryTask.isPrimary = true
      this.primaryTask.startTime = Date.now()
    },
    
    generateSecondaryTasks(count) {
      const taskTypes = ['tracking', 'counting', 'monitoring']
      this.secondaryTasks = []
      
      for (let i = 0; i < count; i++) {
        const taskType = taskTypes[i % taskTypes.length]
        const task = this.taskGenerators[taskType]()
        task.id = `secondary_${i}`
        task.isPrimary = false
        task.startTime = Date.now()
        this.secondaryTasks.push(task)
      }
    },
    
    generateCalculationTask() {
      const operators = ['+', '-', '*']
      const operator = operators[Math.floor(Math.random() * operators.length)]
      
      let a, b, answer
      
      switch (operator) {
        case '+':
          a = Math.floor(Math.random() * 50) + 1
          b = Math.floor(Math.random() * 50) + 1
          answer = a + b
          break
        case '-':
          a = Math.floor(Math.random() * 50) + 25
          b = Math.floor(Math.random() * 25) + 1
          answer = a - b
          break
        case '*':
          a = Math.floor(Math.random() * 12) + 1
          b = Math.floor(Math.random() * 12) + 1
          answer = a * b
          break
      }
      
      return {
        type: 'calculation',
        problem: `${a} ${operator} ${b} = ?`,
        answer: answer,
        userAnswer: '',
        score: 0
      }
    },
    
    generateWordTask() {
      const colors = this.stimulusLibrary.colors
      const colorValues = this.stimulusLibrary.colorValues
      
      const wordIndex = Math.floor(Math.random() * colors.length)
      const colorIndex = Math.floor(Math.random() * colorValues.length)
      
      return {
        type: 'word',
        word: colors[wordIndex],
        wordColor: colorValues[colorIndex],
        correctAnswer: colors[colorIndex],
        options: colors.slice(),
        score: 0
      }
    },
    
    generateTrackingTask() {
      const targets = []
      const targetCount = 3
      const distractorCount = 5
      
      // 生成目标
      for (let i = 0; i < targetCount; i++) {
        targets.push({
          id: `target_${i}`,
          x: Math.random() * 200,
          y: Math.random() * 150,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          symbol: '●',
          isTarget: true
        })
      }
      
      // 生成干扰项
      for (let i = 0; i < distractorCount; i++) {
        targets.push({
          id: `distractor_${i}`,
          x: Math.random() * 200,
          y: Math.random() * 150,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          symbol: '○',
          isTarget: false
        })
      }
      
      return {
        type: 'tracking',
        targets: targets,
        score: 0
      }
    },
    
    generateCountingTask() {
      const items = []
      const targetCount = Math.floor(Math.random() * 8) + 3 // 3-10个目标
      const distractorCount = Math.floor(Math.random() * 15) + 5 // 5-20个干扰项
      
      // 生成目标项（红色圆圈）
      for (let i = 0; i < targetCount; i++) {
        items.push({
          id: `target_${i}`,
          symbol: '●',
          color: 'red',
          isTarget: true
        })
      }
      
      // 生成干扰项
      const distractorSymbols = ['■', '▲', '◆']
      const distractorColors = ['blue', 'green', 'yellow']
      
      for (let i = 0; i < distractorCount; i++) {
        items.push({
          id: `distractor_${i}`,
          symbol: distractorSymbols[Math.floor(Math.random() * distractorSymbols.length)],
          color: distractorColors[Math.floor(Math.random() * distractorColors.length)],
          isTarget: false
        })
      }
      
      // 打乱顺序
      this.shuffleArray(items)
      
      return {
        type: 'counting',
        items: items,
        correctCount: targetCount,
        userCount: '',
        score: 0
      }
    },
    
    generateMonitoringTask() {
      const signals = []
      const signalCount = 6
      
      for (let i = 0; i < signalCount; i++) {
        const isTarget = Math.random() < 0.3 // 30%概率为目标
        signals.push({
          id: `signal_${i}`,
          value: Math.floor(Math.random() * 9) + 1,
          active: Math.random() < 0.5,
          isTarget: isTarget,
          color: isTarget ? 'red' : 'gray'
        })
      }
      
      return {
        type: 'monitoring',
        signals: signals,
        score: 0
      }
    },
    
    setupTaskUpdates(interval) {
      setInterval(() => {
        if (this.isTestActive && !this.isPaused) {
          // 更新追踪任务的目标位置
          this.updateTrackingTasks()
          
          // 随机更新其他任务
          if (Math.random() < 0.3) {
            this.generatePrimaryTask()
          }
          
          if (Math.random() < 0.4) {
            this.updateSecondaryTasks()
          }
        }
      }, interval)
    },
    
    updateTrackingTasks() {
      this.secondaryTasks.forEach(task => {
        if (task.type === 'tracking') {
          task.targets.forEach(target => {
            target.x += target.vx
            target.y += target.vy
            
            // 边界反弹
            if (target.x <= 0 || target.x >= 200) target.vx *= -1
            if (target.y <= 0 || target.y >= 150) target.vy *= -1
            
            // 确保在边界内
            target.x = Math.max(0, Math.min(200, target.x))
            target.y = Math.max(0, Math.min(150, target.y))
          })
        }
      })
    },
    
    updateSecondaryTasks() {
      this.secondaryTasks.forEach((task, index) => {
        if (Math.random() < 0.5) {
          const newTask = this.taskGenerators[task.type]()
          newTask.id = task.id
          newTask.isPrimary = false
          newTask.startTime = Date.now()
          this.secondaryTasks[index] = newTask
        }
      })
    },
    
    // 任务响应处理
    submitCalculation() {
      if (!this.primaryTask.userAnswer) return
      
      const startTime = this.primaryTask.startTime
      const reactionTime = Date.now() - startTime
      const correct = parseInt(this.primaryTask.userAnswer) === this.primaryTask.answer
      
      this.recordTaskResponse('primary', correct, reactionTime)
      
      if (correct) {
        this.primaryTask.score += 10
        this.totalScore += 10
        this.showTaskFeedback('正确！', 'feedback-correct')
      } else {
        this.showTaskFeedback('错误！', 'feedback-incorrect')
      }
      
      // 生成新的计算任务
      setTimeout(() => {
        this.generatePrimaryTask()
      }, 1000)
    },
    
    submitWordAnswer(selectedColor) {
      const startTime = this.primaryTask.startTime
      const reactionTime = Date.now() - startTime
      const correct = selectedColor === this.primaryTask.correctAnswer
      
      this.recordTaskResponse('primary', correct, reactionTime)
      
      if (correct) {
        this.primaryTask.score += 10
        this.totalScore += 10
        this.showTaskFeedback('正确！', 'feedback-correct')
      } else {
        this.showTaskFeedback('错误！', 'feedback-incorrect')
      }
      
      // 生成新的文字任务
      setTimeout(() => {
        this.generatePrimaryTask()
      }, 1000)
    },
    
    handleTrackingClick(event, task) {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // 检查是否点击到目标
      const clickedTarget = task.targets.find(target => {
        const distance = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2)
        return distance < 15 // 15px的点击范围
      })
      
      if (clickedTarget) {
        const startTime = task.startTime
        const reactionTime = Date.now() - startTime
        const correct = clickedTarget.isTarget
        
        this.recordTaskResponse('secondary', correct, reactionTime)
        
        if (correct) {
          task.score += 5
          this.totalScore += 5
          this.showTaskFeedback('追踪正确！', 'feedback-correct')
        } else {
          this.showTaskFeedback('追踪错误！', 'feedback-incorrect')
        }
      }
    },
    
    submitCount(task) {
      if (!task.userCount) return
      
      const startTime = task.startTime
      const reactionTime = Date.now() - startTime
      const correct = parseInt(task.userCount) === task.correctCount
      
      this.recordTaskResponse('secondary', correct, reactionTime)
      
      if (correct) {
        task.score += 8
        this.totalScore += 8
        this.showTaskFeedback('计数正确！', 'feedback-correct')
      } else {
        this.showTaskFeedback('计数错误！', 'feedback-incorrect')
      }
      
      // 生成新的计数任务
      setTimeout(() => {
        const index = this.secondaryTasks.findIndex(t => t.id === task.id)
        if (index !== -1) {
          const newTask = this.generateCountingTask()
          newTask.id = task.id
          newTask.isPrimary = false
          newTask.startTime = Date.now()
          this.secondaryTasks[index] = newTask
        }
      }, 1500)
    },
    
    handleSignalClick(signal, task) {
      if (!signal.active) return
      
      const startTime = task.startTime
      const reactionTime = Date.now() - startTime
      const correct = signal.isTarget
      
      this.recordTaskResponse('secondary', correct, reactionTime)
      
      if (correct) {
        task.score += 6
        this.totalScore += 6
        this.showTaskFeedback('监控正确！', 'feedback-correct')
      } else {
        this.showTaskFeedback('监控错误！', 'feedback-incorrect')
      }
      
      // 重新生成信号
      signal.active = false
      setTimeout(() => {
        signal.active = Math.random() < 0.5
        signal.isTarget = Math.random() < 0.3
        signal.color = signal.isTarget ? 'red' : 'gray'
      }, 2000)
    },
    
    recordTaskResponse(taskType, correct, reactionTime) {
      // 记录任务切换
      if (this.lastActiveTask && this.lastActiveTask !== taskType) {
        this.taskSwitches++
      }
      this.lastActiveTask = taskType
      
      // 记录表现数据
      this.taskPerformance[taskType].total++
      if (correct) {
        this.taskPerformance[taskType].correct++
      }
      this.taskPerformance[taskType].times.push(reactionTime)
      
      // 记录详细响应
      this.responses.push({
        taskType,
        correct,
        reactionTime,
        timestamp: Date.now()
      })
    },
    
    showTaskFeedback(message, className) {
      this.feedbackMessage = message
      this.feedbackClass = className
      this.showFeedback = true
      
      setTimeout(() => {
        this.showFeedback = false
      }, 1500)
    },
    
    pauseTest() {
      this.isPaused = !this.isPaused
    },
    
    endTest() {
      this.isTestActive = false
      this.currentPhase = 'results'
      
      if (this.testTimer) {
        clearInterval(this.testTimer)
      }
      
      // 发送完成事件给父组件
      this.$emit('complete', {
        score: this.finalScore,
        accuracy: this.finalAccuracy,
        duration: this.testDuration,
        completedTasks: this.completedTasks,
        primaryAccuracy: this.finalPrimaryAccuracy,
        secondaryAccuracy: this.finalSecondaryAccuracy,
        multitaskingEfficiency: this.finalMultitaskingEfficiency,
        taskSwitches: this.finalTaskSwitches,
        dividedAttentionScore: this.dividedAttentionScore
      })
    },
    
    restartTest() {
      this.currentPhase = 'instruction'
    },
    
    finishTest() {
      this.$emit('complete', {
        score: this.finalScore,
        accuracy: this.finalAccuracy,
        duration: this.testDuration,
        completedTasks: this.completedTasks,
        primaryAccuracy: this.finalPrimaryAccuracy,
        secondaryAccuracy: this.finalSecondaryAccuracy,
        multitaskingEfficiency: this.finalMultitaskingEfficiency,
        taskSwitches: this.finalTaskSwitches,
        dividedAttentionScore: this.dividedAttentionScore
      })
    },
    
    // 辅助方法
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    getColorValue(colorName) {
      const colorMap = {
        '红': 'red',
        '蓝': 'blue',
        '绿': 'green',
        '黄': 'yellow',
        '紫': 'purple',
        '橙': 'orange'
      }
      return colorMap[colorName] || colorName
    },
    
    getPerformanceLevel(score) {
      if (score >= 90) return '优秀'
      if (score >= 80) return '良好'
      if (score >= 70) return '中等'
      if (score >= 60) return '及格'
      return '需要改进'
    },
    
    getTimePercentage(time) {
      // 将时间转换为百分比（基于3000ms为100%）
      return Math.min(100, (time / 3000) * 100)
    },
    
    getPerformanceEvaluation() {
      const score = this.finalScore
      const efficiency = this.finalMultitaskingEfficiency
      const switches = this.finalTaskSwitches
      
      let evaluation = ''
      
      if (score >= 90) {
        evaluation = '优秀！您的分散注意力能力非常出色，能够有效地同时处理多个任务。'
      } else if (score >= 80) {
        evaluation = '良好！您的分散注意力能力较强，在多任务环境中表现良好。'
      } else if (score >= 70) {
        evaluation = '中等！您的分散注意力能力处于平均水平，在复杂多任务中可能会有些困难。'
      } else if (score >= 60) {
        evaluation = '一般！您的分散注意力能力有待提升，建议加强多任务训练。'
      } else {
        evaluation = '需要改进！建议进行系统的分散注意力训练，提高多任务处理能力。'
      }
      
      if (efficiency < 70) {
        evaluation += '您的多任务效率较低，建议练习任务优先级管理。'
      }
      
      if (switches > 50) {
        evaluation += '您的任务切换过于频繁，建议提高专注持续性。'
      }
      
      return evaluation
    },
    
    getImprovementSuggestions() {
      const suggestions = []
      
      if (this.finalPrimaryAccuracy < 80) {
        suggestions.push('提高主任务的专注度，确保核心任务的完成质量')
      }
      
      if (this.finalSecondaryAccuracy < 70) {
        suggestions.push('加强对次要任务的监控，提高外围注意力')
      }
      
      if (this.finalMultitaskingEfficiency < 75) {
        suggestions.push('练习多任务协调，提高任务间的切换效率')
      }
      
      if (this.finalTaskSwitches > 40) {
        suggestions.push('减少不必要的任务切换，提高注意力稳定性')
      }
      
      if (this.attentionDistribution < 0.7) {
        suggestions.push('平衡注意力分配，避免过度偏向某一任务')
      }
      
      if (this.cognitiveLoad > 80) {
        suggestions.push('降低认知负荷，学会任务优先级管理')
      }
      
      suggestions.push('定期进行多任务训练，提高认知灵活性')
      suggestions.push('练习时间管理技巧，提高工作效率')
      
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
.divided-attention-test {
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
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 20px;
}

.testing-container {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 1400px;
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

.multi-task-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
  min-height: 400px;
}

.primary-task-area {
  display: flex;
  flex-direction: column;
}

.secondary-tasks-area {
  display: grid;
  gap: 20px;
}

.task-panel {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  padding: 20px;
  transition: all 0.3s ease;
}

.task-panel:hover {
  border-color: #007bff;
  box-shadow: 0 5px 15px rgba(0, 123, 255, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.task-title {
  font-size: 1.1em;
  font-weight: 600;
  color: #495057;
  margin: 0;
}

.task-score {
  font-weight: 600;
  color: #007bff;
  background: #e3f2fd;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.9em;
}

/* 计算任务样式 */
.calculation-task {
  min-height: 200px;
}

.calculation-problem {
  font-size: 2em;
  font-weight: 600;
  text-align: center;
  color: #495057;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  border: 2px solid #007bff;
}

.calculation-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.answer-input {
  flex: 1;
  padding: 12px;
  font-size: 1.1em;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

/* 文字任务样式 */
.word-task {
  min-height: 200px;
}

.word-display {
  font-size: 2.5em;
  font-weight: 600;
  text-align: center;
  padding: 30px;
  background: white;
  border-radius: 10px;
  border: 2px solid #28a745;
  margin-bottom: 15px;
}

.word-question {
  text-align: center;
  font-size: 1.1em;
  color: #495057;
  margin-bottom: 15px;
}

.word-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.color-option {
  padding: 10px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-option:hover {
  transform: scale(1.05);
  border-color: #495057;
}

/* 追踪任务样式 */
.tracking-task {
  height: 250px;
}

.tracking-area {
  position: relative;
  width: 100%;
  height: 180px;
  background: white;
  border: 2px solid #ffc107;
  border-radius: 10px;
  overflow: hidden;
  cursor: crosshair;
}

.tracking-target {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.1s ease;
  cursor: pointer;
}

.target-active {
  background: #dc3545;
  color: white;
  border: 2px solid #a71e2a;
}

.target-distractor {
  background: #6c757d;
  color: white;
  border: 2px solid #495057;
}

.tracking-target:hover {
  transform: scale(1.2);
}

/* 计数任务样式 */
.counting-task {
  height: 250px;
}

.counting-display {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  background: white;
  padding: 15px;
  border-radius: 10px;
  border: 2px solid #17a2b8;
  margin-bottom: 15px;
  max-height: 120px;
  overflow-y: auto;
}

.counting-item {
  font-size: 1.5em;
  text-align: center;
  padding: 5px;
  border-radius: 4px;
}

.counting-question {
  text-align: center;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.counting-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.count-input {
  flex: 1;
  padding: 8px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  text-align: center;
  font-size: 1em;
}

.count-input:focus {
  border-color: #17a2b8;
  outline: none;
}

/* 监控任务样式 */
.monitoring-task {
  height: 250px;
}

.signal-display {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  background: white;
  padding: 15px;
  border-radius: 10px;
  border: 2px solid #6f42c1;
  margin-bottom: 15px;
}

.signal-indicator {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
}

.signal-active {
  background: #28a745;
  color: white;
  border-color: #1e7e34;
}

.signal-target {
  background: #dc3545 !important;
  color: white;
  border-color: #a71e2a !important;
  animation: targetPulse 1s infinite;
}

.signal-indicator:hover {
  transform: scale(1.1);
}

.monitoring-instruction {
  text-align: center;
  font-weight: 600;
  color: #495057;
}

/* 反馈区域样式 */
.feedback-area {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.feedback-message {
  text-align: center;
  font-size: 1.1em;
  font-weight: 600;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.feedback-correct {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.feedback-incorrect {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.performance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-item {
  background: white;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.stat-label {
  display: block;
  font-size: 0.9em;
  color: #6c757d;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.2em;
  font-weight: 600;
  color: #007bff;
}

/* 控制按钮样式 */
.control-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #545b62;
  transform: translateY(-1px);
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: #a71e2a;
  transform: translateY(-1px);
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
  font-size: 2.2em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 30px;
}

.overall-results {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 40px;
  margin-bottom: 40px;
  align-items: center;
}

.result-score {
  display: flex;
  justify-content: center;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-inner {
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.score-number {
  font-size: 2.5em;
  font-weight: 700;
  color: #007bff;
}

.score-label {
  font-size: 0.9em;
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
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #007bff;
}

.summary-label {
  font-weight: 600;
  color: #495057;
}

.summary-value {
  font-weight: 600;
  color: #007bff;
}

/* 详细分析样式 */
.detailed-analysis {
  margin-bottom: 40px;
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
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

.task-performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.task-performance-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.task-icon {
  font-size: 1.5em;
}

.task-name {
  font-size: 1.1em;
  font-weight: 600;
  color: #495057;
}

.task-stats {
  display: grid;
  gap: 8px;
  margin-bottom: 15px;
}

.task-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-name {
  color: #6c757d;
  font-size: 0.9em;
}

.task-performance {
  display: flex;
  align-items: center;
  gap: 10px;
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
  background: linear-gradient(90deg, #007bff, #28a745);
  transition: width 0.3s ease;
}

.performance-label {
  font-size: 0.8em;
  font-weight: 600;
  color: #495057;
}

/* 多任务能力分析样式 */
.multitask-analysis {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
}

.multitask-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.metric-value {
  font-size: 2em;
  font-weight: 700;
  color: #007bff;
  margin-bottom: 5px;
}

.metric-label {
  font-size: 1em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.metric-description {
  font-size: 0.8em;
  color: #6c757d;
  line-height: 1.4;
}

/* 时间分析样式 */
.time-analysis {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
}

.time-chart {
  display: grid;
  gap: 15px;
}

.time-metric {
  display: grid;
  grid-template-columns: 150px 1fr 80px;
  gap: 15px;
  align-items: center;
}

.time-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9em;
}

.time-bar {
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.time-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #17a2b8);
  transition: width 0.3s ease;
}

.time-value {
  font-weight: 600;
  color: #007bff;
  text-align: right;
  font-size: 0.9em;
}

/* 表现评价样式 */
.performance-evaluation {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
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
  text-align: center;
}

.improvement-suggestions {
  background: white;
  border-radius: 12px;
  padding: 20px;
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
  margin: 0;
}

.suggestions-list li {
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
  color: #495057;
  line-height: 1.5;
}

.suggestions-list li:last-child {
  border-bottom: none;
}

.suggestions-list li:before {
  content: '💡';
  margin-right: 10px;
}

/* 结果操作按钮 */
.results-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1em;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .multi-task-area {
    grid-template-columns: 1fr;
  }
  
  .overall-results {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .task-performance-grid {
    grid-template-columns: 1fr;
  }
  
  .multitask-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .time-metric {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .time-label {
    text-align: center;
  }
  
  .time-value {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .multitask-metrics {
    grid-template-columns: 1fr;
  }
  
  .test-info {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .word-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .counting-display {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .signal-display {
    grid-template-columns: repeat(2, 1fr);
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
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
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
  --dark-color: #495057;
  --border-radius: 8px;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}
</style>;
  text-align: center;
}

.answer-input:focus {
  border-color: #007bff;
  outline: none;
}

.submit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px