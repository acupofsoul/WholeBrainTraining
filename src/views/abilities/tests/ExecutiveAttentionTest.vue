<template>
  <div class="executive-attention-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase fade-in">
      <div class="instruction-container">
        <h2 class="test-title">执行注意力测试</h2>
        <div class="instruction-content">
          <div class="test-description">
            <h3>测试目标</h3>
            <p>评估您的认知控制能力，包括抑制控制、工作记忆和认知灵活性。</p>
            
            <h3>测试步骤</h3>
            <ol>
              <li>根据指示执行不同的认知任务</li>
              <li>抑制干扰信息，专注于目标任务</li>
              <li>在不同任务规则间灵活切换</li>
              <li>保持工作记忆中的信息并进行操作</li>
            </ol>
            
            <h3>测试设置</h3>
            <div class="test-settings">
              <div class="setting-group">
                <label>难度等级：</label>
                <select v-model="settings.difficulty" class="setting-select">
                  <option value="easy">简单（基础任务，慢速）</option>
                  <option value="medium">中等（混合任务，中速）</option>
                  <option value="hard">困难（复杂任务，快速）</option>
                  <option value="expert">专家（高级任务，极快）</option>
                </select>
              </div>
              
              <div class="setting-group">
                <label>测试类型：</label>
                <select v-model="settings.testType" class="setting-select">
                  <option value="stroop">Stroop任务</option>
                  <option value="flanker">侧抑制任务</option>
                  <option value="nback">N-back任务</option>
                  <option value="taskswitch">任务切换</option>
                  <option value="mixed">混合测试</option>
                </select>
              </div>
              
              <div class="setting-group">
                <label>题目数量：</label>
                <select v-model="settings.trialCount" class="setting-select">
                  <option value="30">30题（快速测试）</option>
                  <option value="60">60题（标准测试）</option>
                  <option value="90">90题（完整测试）</option>
                  <option value="120">120题（深度测试）</option>
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
            <span class="info-label">当前任务：</span>
            <span class="info-value">{{ currentTaskName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">进度：</span>
            <span class="info-value">{{ currentTrial }}/{{ totalTrials }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">得分：</span>
            <span class="info-value">{{ totalScore }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">准确率：</span>
            <span class="info-value">{{ Math.round(overallAccuracy) }}%</span>
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
          <div class="instruction-text">{{ currentInstruction }}</div>
          <div v-if="showTaskSwitch" class="task-switch-notice">
            任务切换！新规则：{{ newTaskRule }}
          </div>
        </div>
        
        <!-- 刺激显示区域 -->
        <div class="stimulus-area">
          <!-- Stroop任务 -->
          <div v-if="currentTask.type === 'stroop'" class="stroop-task">
            <div class="stroop-stimulus" :style="{ color: currentTask.stimulus.color }">
              {{ currentTask.stimulus.word }}
            </div>
            <div class="stroop-options">
              <button 
                v-for="color in currentTask.options" 
                :key="color"
                @click="submitResponse(color)"
                class="stroop-option"
                :style="{ backgroundColor: getColorValue(color) }"
              >
                {{ color }}
              </button>
            </div>
          </div>
          
          <!-- 侧抑制任务 -->
          <div v-else-if="currentTask.type === 'flanker'" class="flanker-task">
            <div class="flanker-stimulus">
              <span 
                v-for="(arrow, index) in currentTask.stimulus.arrows" 
                :key="index"
                class="flanker-arrow"
                :class="{ 'target-arrow': index === 2, 'flanker-arrow-item': true }"
              >
                {{ arrow }}
              </span>
            </div>
            <div class="flanker-options">
              <button @click="submitResponse('left')" class="flanker-option">
                ← 左
              </button>
              <button @click="submitResponse('right')" class="flanker-option">
                右 →
              </button>
            </div>
          </div>
          
          <!-- N-back任务 -->
          <div v-else-if="currentTask.type === 'nback'" class="nback-task">
            <div class="nback-grid">
              <div 
                v-for="(cell, index) in nbackGrid" 
                :key="index"
                class="nback-cell"
                :class="{ 'nback-active': cell.active }"
              >
                {{ cell.value }}
              </div>
            </div>
            <div class="nback-options">
              <button @click="submitResponse('match')" class="nback-option match">
                匹配
              </button>
              <button @click="submitResponse('nomatch')" class="nback-option nomatch">
                不匹配
              </button>
            </div>
          </div>
          
          <!-- 任务切换 -->
          <div v-else-if="currentTask.type === 'taskswitch'" class="taskswitch-task">
            <div class="taskswitch-cue">
              <div class="cue-text">{{ currentTask.cue }}</div>
            </div>
            <div class="taskswitch-stimulus">
              <div class="stimulus-number">{{ currentTask.stimulus.number }}</div>
              <div class="stimulus-letter">{{ currentTask.stimulus.letter }}</div>
            </div>
            <div class="taskswitch-options">
              <button 
                v-for="option in currentTask.options" 
                :key="option.value"
                @click="submitResponse(option.value)"
                class="taskswitch-option"
              >
                {{ option.label }}
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
              <span class="stat-label">抑制控制：</span>
              <span class="stat-value">{{ Math.round(inhibitionScore) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">工作记忆：</span>
              <span class="stat-value">{{ Math.round(workingMemoryScore) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">认知灵活性：</span>
              <span class="stat-value">{{ Math.round(cognitiveFlexibilityScore) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">冲突解决：</span>
              <span class="stat-value">{{ Math.round(conflictResolutionScore) }}%</span>
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
        <h2 class="results-title">执行注意力测试结果</h2>
        
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
              <span class="summary-label">完成题目：</span>
              <span class="summary-value">{{ completedTrials }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">总体准确率：</span>
              <span class="summary-value">{{ Math.round(finalAccuracy) }}%</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">平均反应时间：</span>
              <span class="summary-value">{{ finalAverageTime }}ms</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">执行注意力得分：</span>
              <span class="summary-value">{{ executiveAttentionScore }}</span>
            </div>
          </div>
        </div>
        
        <!-- 详细分析 -->
        <div class="detailed-analysis">
          <h3 class="analysis-title">详细分析</h3>
          
          <!-- 认知能力分析 -->
          <div class="analysis-section">
            <h4 class="section-title">认知能力分析</h4>
            <div class="cognitive-abilities">
              <div class="ability-card">
                <div class="ability-header">
                  <div class="ability-icon">🛡️</div>
                  <div class="ability-name">抑制控制</div>
                </div>
                <div class="ability-score">{{ Math.round(finalInhibitionScore) }}%</div>
                <div class="ability-description">抑制干扰信息和冲动反应的能力</div>
                <div class="ability-performance">
                  <div class="performance-bar">
                    <div class="performance-fill" :style="{ width: finalInhibitionScore + '%' }"></div>
                  </div>
                  <span class="performance-label">{{ getPerformanceLevel(finalInhibitionScore) }}</span>
                </div>
              </div>
              
              <div class="ability-card">
                <div class="ability-header">
                  <div class="ability-icon">🧠</div>
                  <div class="ability-name">工作记忆</div>
                </div>
                <div class="ability-score">{{ Math.round(finalWorkingMemoryScore) }}%</div>
                <div class="ability-description">保持和操作信息的能力</div>
                <div class="ability-performance">
                  <div class="performance-bar">
                    <div class="performance-fill" :style="{ width: finalWorkingMemoryScore + '%' }"></div>
                  </div>
                  <span class="performance-label">{{ getPerformanceLevel(finalWorkingMemoryScore) }}</span>
                </div>
              </div>
              
              <div class="ability-card">
                <div class="ability-header">
                  <div class="ability-icon">🔄</div>
                  <div class="ability-name">认知灵活性</div>
                </div>
                <div class="ability-score">{{ Math.round(finalCognitiveFlexibilityScore) }}%</div>
                <div class="ability-description">在不同任务间切换的能力</div>
                <div class="ability-performance">
                  <div class="performance-bar">
                    <div class="performance-fill" :style="{ width: finalCognitiveFlexibilityScore + '%' }"></div>
                  </div>
                  <span class="performance-label">{{ getPerformanceLevel(finalCognitiveFlexibilityScore) }}</span>
                </div>
              </div>
              
              <div class="ability-card">
                <div class="ability-header">
                  <div class="ability-icon">⚡</div>
                  <div class="ability-name">冲突解决</div>
                </div>
                <div class="ability-score">{{ Math.round(finalConflictResolutionScore) }}%</div>
                <div class="ability-description">解决认知冲突的能力</div>
                <div class="ability-performance">
                  <div class="performance-bar">
                    <div class="performance-fill" :style="{ width: finalConflictResolutionScore + '%' }"></div>
                  </div>
                  <span class="performance-label">{{ getPerformanceLevel(finalConflictResolutionScore) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 任务类型表现分析 -->
          <div class="analysis-section">
            <h4 class="section-title">任务类型表现分析</h4>
            <div class="task-type-analysis">
              <div class="task-type-grid">
                <div v-for="(performance, taskType) in taskTypePerformance" :key="taskType" class="task-type-card">
                  <div class="task-type-header">
                    <div class="task-type-name">{{ getTaskTypeName(taskType) }}</div>
                    <div class="task-type-score">{{ Math.round(performance.accuracy) }}%</div>
                  </div>
                  <div class="task-type-stats">
                    <div class="task-stat">
                      <span class="stat-name">完成数：</span>
                      <span class="stat-value">{{ performance.completed }}</span>
                    </div>
                    <div class="task-stat">
                      <span class="stat-name">平均时间：</span>
                      <span class="stat-value">{{ performance.averageTime }}ms</span>
                    </div>
                    <div class="task-stat">
                      <span class="stat-name">错误率：</span>
                      <span class="stat-value">{{ Math.round(100 - performance.accuracy) }}%</span>
                    </div>
                  </div>
                  <div class="task-type-performance">
                    <div class="performance-bar">
                      <div class="performance-fill" :style="{ width: performance.accuracy + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 反应时间分析 -->
          <div class="analysis-section">
            <h4 class="section-title">反应时间分析</h4>
            <div class="reaction-time-analysis">
              <div class="time-metrics">
                <div class="time-metric-card">
                  <div class="metric-value">{{ finalAverageTime }}ms</div>
                  <div class="metric-label">平均反应时间</div>
                  <div class="metric-description">所有任务的平均响应速度</div>
                </div>
                <div class="time-metric-card">
                  <div class="metric-value">{{ fastestTime }}ms</div>
                  <div class="metric-label">最快反应时间</div>
                  <div class="metric-description">单次任务的最快响应</div>
                </div>
                <div class="time-metric-card">
                  <div class="metric-value">{{ slowestTime }}ms</div>
                  <div class="metric-label">最慢反应时间</div>
                  <div class="metric-description">单次任务的最慢响应</div>
                </div>
                <div class="time-metric-card">
                  <div class="metric-value">{{ timeVariability }}ms</div>
                  <div class="metric-label">时间变异性</div>
                  <div class="metric-description">反应时间的稳定性</div>
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
  name: 'ExecutiveAttentionTest',
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
        testType: 'mixed',
        trialCount: 60
      },
      
      // 测试状态
      isTestActive: false,
      isPaused: false,
      currentTrial: 0,
      totalTrials: 60,
      testStartTime: null,
      
      // 当前任务
      currentTask: {},
      currentTaskName: '',
      currentInstruction: '',
      showTaskSwitch: false,
      newTaskRule: '',
      
      // 得分和统计
      totalScore: 0,
      responses: [],
      
      // 反馈相关
      showFeedback: false,
      feedbackMessage: '',
      feedbackClass: '',
      
      // N-back任务相关
      nbackGrid: [],
      nbackSequence: [],
      nbackLevel: 2,
      
      // 任务类型配置
      taskTypes: {
        stroop: {
          name: 'Stroop任务',
          instruction: '选择文字的颜色，忽略文字内容',
          weight: 0.25
        },
        flanker: {
          name: '侧抑制任务',
          instruction: '判断中间箭头的方向，忽略两边的箭头',
          weight: 0.25
        },
        nback: {
          name: 'N-back任务',
          instruction: '判断当前刺激是否与N步之前的刺激相同',
          weight: 0.25
        },
        taskswitch: {
          name: '任务切换',
          instruction: '根据提示执行不同的判断任务',
          weight: 0.25
        }
      },
      
      // 刺激库
      stimulusLibrary: {
        colors: ['红', '蓝', '绿', '黄'],
        colorValues: ['red', 'blue', 'green', 'yellow'],
        arrows: ['←', '→'],
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
      },
      
      // 难度配置
      difficultyConfig: {
        easy: {
          stimulusDuration: 2000,
          iti: 1500,
          conflictRatio: 0.3
        },
        medium: {
          stimulusDuration: 1500,
          iti: 1000,
          conflictRatio: 0.5
        },
        hard: {
          stimulusDuration: 1000,
          iti: 750,
          conflictRatio: 0.7
        },
        expert: {
          stimulusDuration: 750,
          iti: 500,
          conflictRatio: 0.8
        }
      }
    }
  },
  
  computed: {
    testProgress() {
      return (this.currentTrial / this.totalTrials) * 100
    },
    
    overallAccuracy() {
      if (this.responses.length === 0) return 0
      const correct = this.responses.filter(r => r.correct).length
      return (correct / this.responses.length) * 100
    },
    
    averageReactionTime() {
      if (this.responses.length === 0) return 0
      const totalTime = this.responses.reduce((sum, r) => sum + r.reactionTime, 0)
      return Math.round(totalTime / this.responses.length)
    },
    
    inhibitionScore() {
      // 基于Stroop和Flanker任务的冲突条件表现
      const conflictTrials = this.responses.filter(r => r.isConflict)
      if (conflictTrials.length === 0) return 0
      const correct = conflictTrials.filter(r => r.correct).length
      return (correct / conflictTrials.length) * 100
    },
    
    workingMemoryScore() {
      // 基于N-back任务表现
      const nbackTrials = this.responses.filter(r => r.taskType === 'nback')
      if (nbackTrials.length === 0) return 0
      const correct = nbackTrials.filter(r => r.correct).length
      return (correct / nbackTrials.length) * 100
    },
    
    cognitiveFlexibilityScore() {
      // 基于任务切换的切换成本
      const switchTrials = this.responses.filter(r => r.isSwitch)
      if (switchTrials.length === 0) return 0
      const correct = switchTrials.filter(r => r.correct).length
      return (correct / switchTrials.length) * 100
    },
    
    conflictResolutionScore() {
      // 综合冲突解决能力
      return (this.inhibitionScore + this.cognitiveFlexibilityScore) / 2
    },
    
    finalScore() {
      // 综合得分计算
      const accuracyScore = this.overallAccuracy
      const speedScore = Math.max(0, 100 - (this.averageReactionTime - 500) / 20)
      const executiveScore = (this.inhibitionScore + this.workingMemoryScore + this.cognitiveFlexibilityScore) / 3
      
      return Math.round((accuracyScore * 0.4 + speedScore * 0.2 + executiveScore * 0.4))
    },
    
    executiveAttentionScore() {
      return this.finalScore
    },
    
    completedTrials() {
      return this.responses.length
    },
    
    finalAccuracy() {
      return this.overallAccuracy
    },
    
    finalAverageTime() {
      return this.averageReactionTime
    },
    
    finalInhibitionScore() {
      return this.inhibitionScore
    },
    
    finalWorkingMemoryScore() {
      return this.workingMemoryScore
    },
    
    finalCognitiveFlexibilityScore() {
      return this.cognitiveFlexibilityScore
    },
    
    finalConflictResolutionScore() {
      return this.conflictResolutionScore
    },
    
    taskTypePerformance() {
      const performance = {}
      
      Object.keys(this.taskTypes).forEach(taskType => {
        const trials = this.responses.filter(r => r.taskType === taskType)
        if (trials.length > 0) {
          const correct = trials.filter(r => r.correct).length
          const totalTime = trials.reduce((sum, r) => sum + r.reactionTime, 0)
          
          performance[taskType] = {
            accuracy: (correct / trials.length) * 100,
            completed: trials.length,
            averageTime: Math.round(totalTime / trials.length)
          }
        } else {
          performance[taskType] = {
            accuracy: 0,
            completed: 0,
            averageTime: 0
          }
        }
      })
      
      return performance
    },
    
    fastestTime() {
      if (this.responses.length === 0) return 0
      return Math.min(...this.responses.map(r => r.reactionTime))
    },
    
    slowestTime() {
      if (this.responses.length === 0) return 0
      return Math.max(...this.responses.map(r => r.reactionTime))
    },
    
    timeVariability() {
      if (this.responses.length === 0) return 0
      const times = this.responses.map(r => r.reactionTime)
      const mean = times.reduce((sum, time) => sum + time, 0) / times.length
      const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length
      return Math.round(Math.sqrt(variance))
    }
  },
  
  mounted() {
    // 合并传入的设置
    this.settings = { ...this.settings, ...this.props.settings }
    this.totalTrials = parseInt(this.settings.trialCount)
    this.initializeNbackGrid()
  },
  
  methods: {
    startTest() {
      this.currentPhase = 'testing'
      this.initializeTest()
      this.generateNextTask()
    },
    
    initializeTest() {
      this.isTestActive = true
      this.testStartTime = Date.now()
      this.currentTrial = 0
      
      // 重置数据
      this.totalScore = 0
      this.responses = []
      this.nbackSequence = []
    },
    
    generateNextTask() {
      if (this.currentTrial >= this.totalTrials) {
        this.endTest()
        return
      }
      
      this.currentTrial++
      
      // 根据测试类型选择任务
      let taskType
      if (this.settings.testType === 'mixed') {
        const types = Object.keys(this.taskTypes)
        taskType = types[Math.floor(Math.random() * types.length)]
      } else {
        taskType = this.settings.testType
      }
      
      // 生成任务
      this.currentTask = this.generateTask(taskType)
      this.currentTaskName = this.taskTypes[taskType].name
      this.currentInstruction = this.taskTypes[taskType].instruction
      
      // 检查是否需要显示任务切换提示
      this.checkTaskSwitch(taskType)
    },
    
    generateTask(taskType) {
      const generators = {
        stroop: this.generateStroopTask,
        flanker: this.generateFlankerTask,
        nback: this.generateNbackTask,
        taskswitch: this.generateTaskSwitchTask
      }
      
      const task = generators[taskType]()
      task.type = taskType
      task.startTime = Date.now()
      
      return task
    },
    
    generateStroopTask() {
      const colors = this.stimulusLibrary.colors
      const config = this.difficultyConfig[this.settings.difficulty]
      
      const wordIndex = Math.floor(Math.random() * colors.length)
      const colorIndex = Math.floor(Math.random() * colors.length)
      
      // 根据难度决定是否为冲突条件
      const isConflict = Math.random() < config.conflictRatio
      const finalColorIndex = isConflict ? (colorIndex + 1) % colors.length : colorIndex
      
      return {
        stimulus: {
          word: colors[wordIndex],
          color: this.stimulusLibrary.colorValues[finalColorIndex]
        },
        correctAnswer: colors[finalColorIndex],
        options: colors.slice(),
        isConflict: isConflict
      }
    },
    
    generateFlankerTask() {
      const arrows = this.stimulusLibrary.arrows
      const config = this.difficultyConfig[this.settings.difficulty]
      
      const targetArrow = arrows[Math.floor(Math.random() * arrows.length)]
      const isConflict = Math.random() < config.conflictRatio
      const flankerArrow = isConflict ? (targetArrow === '←' ? '→' : '←') : targetArrow
      
      return {
        stimulus: {
          arrows: [flankerArrow, flankerArrow, targetArrow, flankerArrow, flankerArrow]
        },
        correctAnswer: targetArrow === '←' ? 'left' : 'right',
        isConflict: isConflict
      }
    },
    
    generateNbackTask() {
      const letters = this.stimulusLibrary.letters
      const currentLetter = letters[Math.floor(Math.random() * letters.length)]
      
      // 添加到序列
      this.nbackSequence.push(currentLetter)
      
      // 更新网格显示
      this.updateNbackGrid(currentLetter)
      
      // 判断是否匹配
      let isMatch = false
      if (this.nbackSequence.length > this.nbackLevel) {
        const nStepsBack = this.nbackSequence[this.nbackSequence.length - this.nbackLevel - 1]
        isMatch = currentLetter === nStepsBack
      }
      
      return {
        stimulus: {
          letter: currentLetter,
          position: Math.floor(Math.random() * 9)
        },
        correctAnswer: isMatch ? 'match' : 'nomatch',
        isMatch: isMatch
      }
    },
    
    generateTaskSwitchTask() {
      const numbers = this.stimulusLibrary.numbers
      const letters = this.stimulusLibrary.letters
      
      const number = numbers[Math.floor(Math.random() * numbers.length)]
      const letter = letters[Math.floor(Math.random() * letters.length)]
      
      // 随机选择任务类型
      const taskTypes = ['number', 'letter']
      const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)]
      
      let cue, correctAnswer, options
      
      if (taskType === 'number') {
        cue = '数字：奇数还是偶数？'
        correctAnswer = number % 2 === 0 ? 'even' : 'odd'
        options = [
          { value: 'odd', label: '奇数' },
          { value: 'even', label: '偶数' }
        ]
      } else {
        cue = '字母：元音还是辅音？'
        const vowels = ['A', 'E', 'I']
        correctAnswer = vowels.includes(letter) ? 'vowel' : 'consonant'
        options = [
          { value: 'vowel', label: '元音' },
          { value: 'consonant', label: '辅音' }
        ]
      }
      
      return {
        cue: cue,
        stimulus: {
          number: number,
          letter: letter
        },
        correctAnswer: correctAnswer,
        options: options,
        taskType: taskType
      }
    },
    
    checkTaskSwitch(currentTaskType) {
      const lastResponse = this.responses[this.responses.length - 1]
      if (lastResponse && lastResponse.taskType !== currentTaskType) {
        this.showTaskSwitch = true
        this.newTaskRule = this.taskTypes[currentTaskType].instruction
        
        setTimeout(() => {
          this.showTaskSwitch = false
        }, 2000)
      }
    },
    
    initializeNbackGrid() {
      this.nbackGrid = Array(9).fill().map((_, index) => ({
        value: '',
        active: false,
        index: index
      }))
    },
    
    updateNbackGrid(letter) {
      // 重置网格
      this.nbackGrid.forEach(cell => {
        cell.value = ''
        cell.active = false
      })
      
      // 在随机位置显示字母
      const position = Math.floor(Math.random() * 9)
      this.nbackGrid[position].value = letter
      this.nbackGrid[position].active = true
    },
    
    submitResponse(response) {
      if (!this.isTestActive || this.isPaused) return
      
      const reactionTime = Date.now() - this.currentTask.startTime
      const correct = response === this.currentTask.correctAnswer
      
      // 记录响应
      const responseData = {
        trial: this.currentTrial,
        taskType: this.currentTask.type,
        response: response,
        correctAnswer: this.currentTask.correctAnswer,
        correct: correct,
        reactionTime: reactionTime,
        isConflict: this.currentTask.isConflict || false,
        isSwitch: this.checkIfSwitch(),
        timestamp: Date.now()
      }
      
      this.responses.push(responseData)
      
      // 更新得分
      if (correct) {
        this.totalScore += this.calculateScore(reactionTime, this.currentTask.type)
      }
      
      // 显示反馈
      this.showTaskFeedback(correct, reactionTime)
      
      // 生成下一个任务
      setTimeout(() => {
        this.generateNextTask()
      }, this.difficultyConfig[this.settings.difficulty].iti)
    },
    
    checkIfSwitch() {
      if (this.responses.length === 0) return false
      const lastResponse = this.responses[this.responses.length - 1]
      return lastResponse.taskType !== this.currentTask.type
    },
    
    calculateScore(reactionTime, taskType) {
      const baseScore = 10
      const timeBonus = Math.max(0, (2000 - reactionTime) / 100)
      const taskBonus = this.taskTypes[taskType].weight * 10
      
      return Math.round(baseScore + timeBonus + taskBonus)
    },
    
    showTaskFeedback(correct, reactionTime) {
      if (correct) {
        this.feedbackMessage = `正确！ ${reactionTime}ms`
        this.feedbackClass = 'feedback-correct'
      } else {
        this.feedbackMessage = `错误！ ${reactionTime}ms`
        this.feedbackClass = 'feedback-incorrect'
      }
      
      this.showFeedback = true
      
      setTimeout(() => {
        this.showFeedback = false
      }, 1000)
    },
    
    pauseTest() {
      this.isPaused = !this.isPaused
    },
    
    endTest() {
      this.isTestActive = false
      this.currentPhase = 'results'
      
      // 发送完成事件给父组件
      this.$emit('complete', {
        score: this.finalScore,
        accuracy: this.finalAccuracy,
        averageTime: this.finalAverageTime,
        completedTrials: this.completedTrials,
        inhibitionScore: this.finalInhibitionScore,
        workingMemoryScore: this.finalWorkingMemoryScore,
        cognitiveFlexibilityScore: this.finalCognitiveFlexibilityScore,
        conflictResolutionScore: this.finalConflictResolutionScore,
        executiveAttentionScore: this.executiveAttentionScore
      })
    },
    
    restartTest() {
      this.currentPhase = 'instruction'
    },
    
    finishTest() {
      this.$emit('complete', {
        score: this.finalScore,
        accuracy: this.finalAccuracy,
        averageTime: this.finalAverageTime,
        completedTrials: this.completedTrials,
        inhibitionScore: this.finalInhibitionScore,
        workingMemoryScore: this.finalWorkingMemoryScore,
        cognitiveFlexibilityScore: this.finalCognitiveFlexibilityScore,
        conflictResolutionScore: this.finalConflictResolutionScore,
        executiveAttentionScore: this.executiveAttentionScore
      })
    },
    
    // 辅助方法
    getColorValue(colorName) {
      const colorMap = {
        '红': 'red',
        '蓝': 'blue',
        '绿': 'green',
        '黄': 'yellow'
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
    
    getTaskTypeName(taskType) {
      const names = {
        stroop: 'Stroop任务',
        flanker: '侧抑制任务',
        nback: 'N-back任务',
        taskswitch: '任务切换'
      }
      return names[taskType] || taskType
    },
    
    getPerformanceEvaluation() {
      const score = this.finalScore
      const inhibition = this.finalInhibitionScore
      const workingMemory = this.finalWorkingMemoryScore
      const flexibility = this.finalCognitiveFlexibilityScore
      
      let evaluation = ''
      
      if (score >= 90) {
        evaluation = '优秀！您的执行注意力能力非常出色，具有良好的认知控制能力。'
      } else if (score >= 80) {
        evaluation = '良好！您的执行注意力能力较强，在认知控制方面表现良好。'
      } else if (score >= 70) {
        evaluation = '中等！您的执行注意力能力处于平均水平，在复杂认知任务中可能会有些困难。'
      } else if (score >= 60) {
        evaluation = '一般！您的执行注意力能力有待提升，建议加强认知控制训练。'
      } else {
        evaluation = '需要改进！建议进行系统的执行注意力训练，提高认知控制能力。'
      }
      
      if (inhibition < 70) {
        evaluation += '您的抑制控制能力较弱，建议练习抗干扰任务。'
      }
      
      if (workingMemory < 70) {
        evaluation += '您的工作记忆能力需要提升，建议进行记忆训练。'
      }
      
      if (flexibility < 70) {
        evaluation += '您的认知灵活性有待改善，建议练习任务切换。'
      }
      
      return evaluation
    },
    
    getImprovementSuggestions() {
      const suggestions = []
      
      if (this.finalInhibitionScore < 80) {
        suggestions.push('练习Stroop任务和侧抑制任务，提高抑制控制能力')
      }
      
      if (this.finalWorkingMemoryScore < 80) {
        suggestions.push('进行N-back训练，增强工作记忆容量')
      }
      
      if (this.finalCognitiveFlexibilityScore < 80) {
        suggestions.push('练习任务切换，提高认知灵活性')
      }
      
      if (this.finalAverageTime > 1500) {
        suggestions.push('提高反应速度，减少决策时间')
      }
      
      if (this.timeVariability > 500) {
        suggestions.push('保持注意力稳定，减少反应时间的变异性')
      }
      
      suggestions.push('定期进行冥想练习，提高注意力控制')
      suggestions.push('保持充足睡眠，维护认知功能')
      
      return suggestions.slice(0, 5)
    }
  }
}
</script>

<style scoped>
/* 基础样式 */
.executive-attention-test {
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
  background: #e3f2fd;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
}

.instruction-text {
  font-size: 1.1em;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 10px;
}

.task-switch-notice {
  background: #fff3cd;
  color: #856404;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  border: 1px solid #ffeaa7;
  animation: pulse 1s infinite;
}

.stimulus-area {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 30px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Stroop任务样式 */
.stroop-task {
  text-align: center;
  width: 100%;
}

.stroop-stimulus {
  font-size: 4em;
  font-weight: 700;
  margin-bottom: 30px;
  text-transform: uppercase;
}

.stroop-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.stroop-option {
  padding: 15px 25px;
  border: 3px solid #e9ecef;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stroop-option:hover {
  transform: scale(1.05);
  border-color: #495057;
}

/* 侧抑制任务样式 */
.flanker-task {
  text-align: center;
  width: 100%;
}

.flanker-stimulus {
  font-size: 3em;
  margin-bottom: 30px;
  letter-spacing: 10px;
}

.flanker-arrow {
  display: inline-block;
  transition: all 0.3s ease;
}

.target-arrow {
  color: #007bff;
  font-weight: 700;
  transform: scale(1.2);
}

.flanker-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.flanker-option {
  padding: 15px 25px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.flanker-option:hover {
  background: #0056b3;
  transform: scale(1.05);
}

/* N-back任务样式 */
.nback-task {
  text-align: center;
  width: 100%;
}

.nback-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-width: 300px;
  margin: 0 auto 30px;
}

.nback-cell {
  aspect-ratio: 1;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  font-weight: 600;
  background: white;
  transition: all 0.3s ease;
}

.nback-active {
  background: #007bff;
  color: white;
  border-color: #0056b3;
  transform: scale(1.1);
}

.nback-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.nback-option {
  padding: 15px 25px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nback-option.match {
  background: #28a745;
  color: white;
}

.nback-option.nomatch {
  background: #dc3545;
  color: white;
}

.nback-option:hover {
  transform: scale(1.05);
}

/* 任务切换样式 */
.taskswitch-task {
  text-align: center;
  width: 100%;
}

.taskswitch-cue {
  background: #fff3cd;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid #ffeaa7;
}

.cue-text {
  font-size: 1.2em;
  font-weight: 600;
  color: #856404;
}

.taskswitch-stimulus {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-bottom: 30px;
}

.stimulus-number,
.stimulus-letter {
  font-size: 4em;
  font-weight: 700;
  padding: 20px;
  border-radius: 15px;
  min-width: 100px;
  text-align: center;
}

.stimulus-number {
  background: #e3f2fd;
  color: #1976d2;
  border: 3px solid #1976d2;
}

.stimulus-letter {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 3px solid #7b1fa2;
}

.taskswitch-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.taskswitch-option {
  padding: 15px 25px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.taskswitch-option:hover {
  background: #545b62;
  transform: scale(1.05);
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
  background: #c82333;
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

/* 总体结果样式 */
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
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 0.9em;
  color: #6c757d;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 1.4em;
  font-weight: 600;
  color: #495057;
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
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.3em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 20px;
}

/* 认知能力分析样式 */
.cognitive-abilities {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.ability-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.ability-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.ability-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.ability-icon {
  font-size: 2em;
}

.ability-name {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
}

.ability-score {
  font-size: 2em;
  font-weight: 700;
  color: #007bff;
  text-align: center;
  margin-bottom: 10px;
}

.ability-description {
  color: #6c757d;
  font-size: 0.9em;
  text-align: center;
  margin-bottom: 15px;
  line-height: 1.4;
}

.ability-performance {
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
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.5s ease;
}

.performance-label {
  font-size: 0.8em;
  font-weight: 600;
  color: #495057;
  min-width: 60px;
  text-align: right;
}

/* 任务类型分析样式 */
.task-type-analysis {
  margin-top: 20px;
}

.task-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.task-type-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.task-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.task-type-name {
  font-weight: 600;
  color: #495057;
}

.task-type-score {
  font-size: 1.3em;
  font-weight: 700;
  color: #007bff;
}

.task-type-stats {
  margin-bottom: 15px;
}

.task-stat {
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

.task-type-performance {
  margin-top: 10px;
}

/* 反应时间分析样式 */
.reaction-time-analysis {
  margin-top: 20px;
}

.time-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.time-metric-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.metric-value {
  font-size: 2em;
  font-weight: 700;
  color: #007bff;
  margin-bottom: 10px;
}

.metric-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.metric-description {
  color: #6c757d;
  font-size: 0.85em;
  line-height: 1.4;
}

/* 表现评价样式 */
.performance-evaluation {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
}

.evaluation-content {
  margin-top: 20px;
}

.evaluation-text {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  border-left: 4px solid #007bff;
}

.evaluation-text p {
  color: #495057;
  line-height: 1.6;
  margin: 0;
}

.improvement-suggestions {
  background: white;
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid #28a745;
}

.suggestions-title {
  color: #28a745;
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 15px;
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions-list li {
  color: #495057;
  line-height: 1.5;
  margin-bottom: 10px;
  padding-left: 20px;
  position: relative;
}

.suggestions-list li:before {
  content: '💡';
  position: absolute;
  left: 0;
}

/* 结果操作按钮样式 */
.results-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
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
  .instruction-container,
  .testing-container,
  .results-container {
    padding: 20px;
    margin: 10px;
  }
  
  .test-info {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .overall-results {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .cognitive-abilities {
    grid-template-columns: 1fr;
  }
  
  .task-type-grid {
    grid-template-columns: 1fr;
  }
  
  .time-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .results-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .stroop-options,
  .flanker-options,
  .nback-options,
  .taskswitch-options {
    grid-template-columns: 1fr;
  }
  
  .taskswitch-stimulus {
    flex-direction: column;
    gap: 20px;
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

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.slide-in {
  animation: slideIn 0.5s ease-out;
}

.scale-in {
  animation: scaleIn 0.5s ease-out;
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