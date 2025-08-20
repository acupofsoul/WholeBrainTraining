<template>
  <div class="sustained-attention-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase fade-in">
      <div class="instruction-container">
        <h2 class="test-title">持续注意力测试</h2>
        <div class="instruction-content">
          <div class="test-description">
            <h3>测试目标</h3>
            <p>评估您在长时间任务中保持专注和警觉的能力。</p>
            
            <h3>测试步骤</h3>
            <ol>
              <li>屏幕上会连续出现不同的刺激（字母、数字或图形）</li>
              <li>当出现目标刺激时，请立即按空格键或点击按钮</li>
              <li>当出现非目标刺激时，请不要做任何反应</li>
              <li>保持专注，避免错过目标或误报非目标</li>
            </ol>
            
            <h3>测试设置</h3>
            <div class="test-settings">
              <div class="setting-group">
                <label>难度等级：</label>
                <select v-model="settings.difficulty" class="setting-select">
                  <option value="easy">简单（慢速，明显差异）</option>
                  <option value="medium">中等（中速，中等差异）</option>
                  <option value="hard">困难（快速，细微差异）</option>
                  <option value="expert">专家（极快，极细差异）</option>
                </select>
              </div>
              
              <div class="setting-group">
                <label>测试时长：</label>
                <select v-model="settings.duration" class="setting-select">
                  <option value="3">3分钟（快速测试）</option>
                  <option value="5">5分钟（标准测试）</option>
                  <option value="8">8分钟（完整测试）</option>
                  <option value="10">10分钟（深度测试）</option>
                </select>
              </div>
              
              <div class="setting-group">
                <label>刺激类型：</label>
                <select v-model="settings.stimulusType" class="setting-select">
                  <option value="letters">字母</option>
                  <option value="numbers">数字</option>
                  <option value="shapes">图形</option>
                  <option value="mixed">混合</option>
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
            <span class="info-label">目标：</span>
            <span class="info-value target-display">{{ currentTarget }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">时间：</span>
            <span class="info-value">{{ formatTime(remainingTime) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">得分：</span>
            <span class="info-value">{{ currentScore }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">进度：</span>
            <span class="info-value">{{ currentTrialIndex + 1 }} / {{ totalTrials }}</span>
          </div>
        </div>
        
        <!-- 进度条 -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: testProgress + '%' }"></div>
        </div>
        
        <!-- 刺激显示区域 -->
        <div class="stimulus-area">
          <div 
            class="stimulus-display"
            :class="{ 
              'target-stimulus': isCurrentTarget,
              'non-target-stimulus': !isCurrentTarget,
              'feedback-correct': showFeedback && lastResponseCorrect,
              'feedback-incorrect': showFeedback && !lastResponseCorrect
            }"
          >
            {{ currentStimulus }}
          </div>
        </div>
        
        <!-- 反应按钮 -->
        <div class="response-area">
          <button 
            @click="handleResponse" 
            class="response-button"
            :disabled="!canRespond"
          >
            检测到目标 (空格键)
          </button>
        </div>
        
        <!-- 实时反馈 -->
        <div class="feedback-area">
          <div v-if="showFeedback" class="feedback-message" :class="feedbackClass">
            {{ feedbackMessage }}
          </div>
          
          <div class="performance-stats">
            <div class="stat-item">
              <span class="stat-label">命中率：</span>
              <span class="stat-value">{{ Math.round(hitRate) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">误报率：</span>
              <span class="stat-value">{{ Math.round(falseAlarmRate) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均反应时间：</span>
              <span class="stat-value">{{ averageReactionTime }}ms</span>
            </div>
          </div>
        </div>
        
        <!-- 控制按钮 -->
        <div class="control-buttons">
          <button @click="pauseTest" v-if="!isPaused" class="btn-secondary">暂停</button>
          <button @click="resumeTest" v-if="isPaused" class="btn-primary">继续</button>
          <button @click="endTest" class="btn-danger">结束测试</button>
        </div>
      </div>
    </div>

    <!-- 结果展示阶段 -->
    <div v-else-if="currentPhase === 'results'" class="results-phase fade-in">
      <div class="results-container">
        <h2 class="results-title">持续注意力测试结果</h2>
        
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
              <span class="summary-label">总刺激数：</span>
              <span class="summary-value">{{ totalTrials }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">目标刺激数：</span>
              <span class="summary-value">{{ targetCount }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">持续注意力得分：</span>
              <span class="summary-value">{{ sustainedAttentionScore }}</span>
            </div>
          </div>
        </div>
        
        <!-- 详细分析 -->
        <div class="detailed-analysis">
          <h3 class="analysis-title">详细分析</h3>
          
          <!-- 准确性分析 -->
          <div class="analysis-section">
            <h4 class="section-title">准确性表现</h4>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">{{ Math.round(hitRate) }}%</div>
                <div class="metric-label">命中率</div>
                <div class="metric-description">正确识别目标的比例</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ Math.round(falseAlarmRate) }}%</div>
                <div class="metric-label">误报率</div>
                <div class="metric-description">错误响应非目标的比例</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ Math.round(accuracy) }}%</div>
                <div class="metric-label">总体准确率</div>
                <div class="metric-description">所有反应的正确比例</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ dPrime.toFixed(2) }}</div>
                <div class="metric-label">敏感性指数</div>
                <div class="metric-description">区分目标和非目标的能力</div>
              </div>
            </div>
          </div>
          
          <!-- 反应时间分析 -->
          <div class="analysis-section">
            <h4 class="section-title">反应时间表现</h4>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">{{ averageReactionTime }}ms</div>
                <div class="metric-label">平均反应时间</div>
                <div class="metric-description">对目标刺激的平均响应时间</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ reactionTimeStd }}ms</div>
                <div class="metric-label">反应时间标准差</div>
                <div class="metric-description">反应时间的稳定性</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ fastestReactionTime }}ms</div>
                <div class="metric-label">最快反应时间</div>
                <div class="metric-description">最快的正确响应时间</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ slowestReactionTime }}ms</div>
                <div class="metric-label">最慢反应时间</div>
                <div class="metric-description">最慢的正确响应时间</div>
              </div>
            </div>
          </div>
          
          <!-- 持续性分析 -->
          <div class="analysis-section">
            <h4 class="section-title">持续性表现</h4>
            <div class="sustainability-analysis">
              <div class="time-blocks">
                <div v-for="(block, index) in timeBlocks" :key="index" class="time-block">
                  <div class="block-header">第{{ index + 1 }}段 ({{ block.timeRange }})</div>
                  <div class="block-stats">
                    <div class="block-stat">
                      <span class="stat-name">准确率：</span>
                      <span class="stat-value">{{ Math.round(block.accuracy) }}%</span>
                    </div>
                    <div class="block-stat">
                      <span class="stat-name">反应时间：</span>
                      <span class="stat-value">{{ block.avgReactionTime }}ms</span>
                    </div>
                  </div>
                  <div class="block-performance">
                    <div class="performance-bar">
                      <div class="performance-fill" :style="{ width: block.accuracy + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="sustainability-summary">
                <div class="summary-metric">
                  <span class="metric-name">注意力衰减：</span>
                  <span class="metric-value" :class="{ 'positive': attentionDecline < 0, 'negative': attentionDecline > 0 }">
                    {{ attentionDecline > 0 ? '+' : '' }}{{ attentionDecline.toFixed(1) }}%
                  </span>
                </div>
                <div class="summary-metric">
                  <span class="metric-name">持续性评级：</span>
                  <span class="metric-value">{{ sustainabilityRating }}</span>
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
  name: 'SustainedAttentionTest',
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
        duration: 5, // 分钟
        stimulusType: 'letters'
      },
      
      // 测试状态
      isTestActive: false,
      isPaused: false,
      currentTrialIndex: 0,
      totalTrials: 0,
      testStartTime: null,
      testDuration: 0,
      remainingTime: 0,
      
      // 刺激相关
      currentStimulus: '',
      currentTarget: '',
      isCurrentTarget: false,
      stimulusStartTime: null,
      canRespond: false,
      
      // 反馈相关
      showFeedback: false,
      feedbackMessage: '',
      feedbackClass: '',
      lastResponseCorrect: false,
      
      // 测试数据
      trials: [],
      responses: [],
      reactionTimes: [],
      
      // 计时器
      testTimer: null,
      stimulusTimer: null,
      
      // 刺激库
      stimulusLibrary: {
        letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        numbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        shapes: ['●', '■', '▲', '◆', '★', '♠', '♣', '♥', '♦', '☀', '☁', '☂', '☃', '☄', '⚡', '❄', '🔥', '💧'],
        mixed: []
      },
      
      // 难度配置
      difficultyConfig: {
        easy: {
          stimulusDuration: 2000,
          interStimulusInterval: 1500,
          targetProbability: 0.3
        },
        medium: {
          stimulusDuration: 1500,
          interStimulusInterval: 1000,
          targetProbability: 0.25
        },
        hard: {
          stimulusDuration: 1000,
          interStimulusInterval: 750,
          targetProbability: 0.2
        },
        expert: {
          stimulusDuration: 750,
          interStimulusInterval: 500,
          targetProbability: 0.15
        }
      }
    }
  },
  
  computed: {
    testProgress() {
      if (this.totalTrials === 0) return 0
      return (this.currentTrialIndex / this.totalTrials) * 100
    },
    
    currentScore() {
      if (this.responses.length === 0) return 0
      const correct = this.responses.filter(r => r.correct).length
      return Math.round((correct / this.responses.length) * 100)
    },
    
    hitRate() {
      const targets = this.responses.filter(r => r.isTarget)
      if (targets.length === 0) return 0
      const hits = targets.filter(r => r.responded && r.correct).length
      return (hits / targets.length) * 100
    },
    
    falseAlarmRate() {
      const nonTargets = this.responses.filter(r => !r.isTarget)
      if (nonTargets.length === 0) return 0
      const falseAlarms = nonTargets.filter(r => r.responded && !r.correct).length
      return (falseAlarms / nonTargets.length) * 100
    },
    
    accuracy() {
      if (this.responses.length === 0) return 0
      const correct = this.responses.filter(r => r.correct).length
      return (correct / this.responses.length) * 100
    },
    
    averageReactionTime() {
      const validTimes = this.reactionTimes.filter(time => time > 0 && time < 3000)
      if (validTimes.length === 0) return 0
      return Math.round(validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length)
    },
    
    reactionTimeStd() {
      const validTimes = this.reactionTimes.filter(time => time > 0 && time < 3000)
      if (validTimes.length < 2) return 0
      const mean = this.averageReactionTime
      const variance = validTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / validTimes.length
      return Math.round(Math.sqrt(variance))
    },
    
    fastestReactionTime() {
      const validTimes = this.reactionTimes.filter(time => time > 0 && time < 3000)
      return validTimes.length > 0 ? Math.min(...validTimes) : 0
    },
    
    slowestReactionTime() {
      const validTimes = this.reactionTimes.filter(time => time > 0 && time < 3000)
      return validTimes.length > 0 ? Math.max(...validTimes) : 0
    },
    
    dPrime() {
      const hitRate = Math.max(0.01, Math.min(0.99, this.hitRate / 100))
      const falseAlarmRate = Math.max(0.01, Math.min(0.99, this.falseAlarmRate / 100))
      
      // 使用正态分布的逆函数计算d'
      const zHit = this.inverseNormal(hitRate)
      const zFA = this.inverseNormal(falseAlarmRate)
      
      return zHit - zFA
    },
    
    finalScore() {
      // 综合得分计算
      const accuracyScore = this.accuracy
      const speedScore = Math.max(0, 100 - (this.averageReactionTime - 300) / 10)
      const sustainabilityScore = Math.max(0, 100 + this.attentionDecline)
      const sensitivityScore = Math.max(0, Math.min(100, (this.dPrime + 2) * 25))
      
      return Math.round((accuracyScore * 0.4 + speedScore * 0.2 + sustainabilityScore * 0.2 + sensitivityScore * 0.2))
    },
    
    sustainedAttentionScore() {
      return this.finalScore
    },
    
    targetCount() {
      return this.responses.filter(r => r.isTarget).length
    },
    
    timeBlocks() {
      const blockSize = Math.ceil(this.responses.length / 4)
      const blocks = []
      
      for (let i = 0; i < 4; i++) {
        const start = i * blockSize
        const end = Math.min((i + 1) * blockSize, this.responses.length)
        const blockResponses = this.responses.slice(start, end)
        
        if (blockResponses.length > 0) {
          const correct = blockResponses.filter(r => r.correct).length
          const accuracy = (correct / blockResponses.length) * 100
          
          const blockReactionTimes = blockResponses
            .filter(r => r.reactionTime > 0 && r.reactionTime < 3000)
            .map(r => r.reactionTime)
          const avgReactionTime = blockReactionTimes.length > 0 
            ? Math.round(blockReactionTimes.reduce((sum, time) => sum + time, 0) / blockReactionTimes.length)
            : 0
          
          blocks.push({
            timeRange: `${Math.round(start / this.responses.length * this.settings.duration)}分-${Math.round(end / this.responses.length * this.settings.duration)}分`,
            accuracy,
            avgReactionTime
          })
        }
      }
      
      return blocks
    },
    
    attentionDecline() {
      if (this.timeBlocks.length < 2) return 0
      const firstBlock = this.timeBlocks[0]
      const lastBlock = this.timeBlocks[this.timeBlocks.length - 1]
      return lastBlock.accuracy - firstBlock.accuracy
    },
    
    sustainabilityRating() {
      const decline = Math.abs(this.attentionDecline)
      if (decline <= 5) return '优秀'
      if (decline <= 10) return '良好'
      if (decline <= 15) return '中等'
      if (decline <= 20) return '一般'
      return '需要改进'
    }
  },
  
  mounted() {
    // 合并传入的设置
    this.settings = { ...this.settings, ...this.props.settings }
    
    // 初始化混合刺激库
    this.stimulusLibrary.mixed = [
      ...this.stimulusLibrary.letters,
      ...this.stimulusLibrary.numbers,
      ...this.stimulusLibrary.shapes.slice(0, 6)
    ]
    
    // 添加键盘事件监听
    document.addEventListener('keydown', this.handleKeyPress)
  },
  
  beforeUnmount() {
    this.cleanupTimers()
    document.removeEventListener('keydown', this.handleKeyPress)
  },
  
  methods: {
    startTest() {
      this.currentPhase = 'testing'
      this.initializeTest()
      this.startTestTimer()
      this.nextStimulus()
    },
    
    initializeTest() {
      this.isTestActive = true
      this.isPaused = false
      this.currentTrialIndex = 0
      this.testStartTime = Date.now()
      this.testDuration = this.settings.duration * 60 * 1000 // 转换为毫秒
      this.remainingTime = this.testDuration
      
      // 计算总试次数
      const config = this.difficultyConfig[this.settings.difficulty]
      const trialDuration = config.stimulusDuration + config.interStimulusInterval
      this.totalTrials = Math.floor(this.testDuration / trialDuration)
      
      // 重置数据
      this.trials = []
      this.responses = []
      this.reactionTimes = []
      
      // 生成目标刺激
      this.generateTarget()
    },
    
    generateTarget() {
      const stimuli = this.stimulusLibrary[this.settings.stimulusType]
      this.currentTarget = stimuli[Math.floor(Math.random() * stimuli.length)]
    },
    
    startTestTimer() {
      this.testTimer = setInterval(() => {
        if (!this.isPaused) {
          this.remainingTime -= 1000
          if (this.remainingTime <= 0) {
            this.endTest()
          }
        }
      }, 1000)
    },
    
    nextStimulus() {
      if (!this.isTestActive || this.isPaused) return
      
      if (this.currentTrialIndex >= this.totalTrials || this.remainingTime <= 0) {
        this.endTest()
        return
      }
      
      // 生成刺激
      const config = this.difficultyConfig[this.settings.difficulty]
      const stimuli = this.stimulusLibrary[this.settings.stimulusType]
      
      // 决定是否为目标刺激
      this.isCurrentTarget = Math.random() < config.targetProbability
      
      if (this.isCurrentTarget) {
        this.currentStimulus = this.currentTarget
      } else {
        // 选择非目标刺激
        const nonTargets = stimuli.filter(s => s !== this.currentTarget)
        this.currentStimulus = nonTargets[Math.floor(Math.random() * nonTargets.length)]
      }
      
      // 记录试次
      this.trials.push({
        index: this.currentTrialIndex,
        stimulus: this.currentStimulus,
        isTarget: this.isCurrentTarget,
        timestamp: Date.now()
      })
      
      // 设置响应状态
      this.canRespond = true
      this.stimulusStartTime = Date.now()
      this.showFeedback = false
      
      // 设置刺激持续时间
      this.stimulusTimer = setTimeout(() => {
        this.processStimulusEnd()
      }, config.stimulusDuration)
    },
    
    processStimulusEnd() {
      this.canRespond = false
      
      // 如果没有响应，记录为遗漏或正确拒绝
      if (!this.responses.find(r => r.trialIndex === this.currentTrialIndex)) {
        this.recordResponse(false, 0)
      }
      
      // 准备下一个刺激
      const config = this.difficultyConfig[this.settings.difficulty]
      setTimeout(() => {
        this.currentTrialIndex++
        this.nextStimulus()
      }, config.interStimulusInterval)
    },
    
    handleResponse() {
      if (!this.canRespond) return
      
      const reactionTime = Date.now() - this.stimulusStartTime
      this.recordResponse(true, reactionTime)
    },
    
    handleKeyPress(event) {
      if (event.code === 'Space' && this.currentPhase === 'testing') {
        event.preventDefault()
        this.handleResponse()
      }
    },
    
    recordResponse(responded, reactionTime) {
      const correct = (responded && this.isCurrentTarget) || (!responded && !this.isCurrentTarget)
      
      const response = {
        trialIndex: this.currentTrialIndex,
        stimulus: this.currentStimulus,
        isTarget: this.isCurrentTarget,
        responded,
        correct,
        reactionTime,
        timestamp: Date.now()
      }
      
      this.responses.push(response)
      
      if (responded && this.isCurrentTarget && reactionTime > 0) {
        this.reactionTimes.push(reactionTime)
      }
      
      // 显示反馈
      this.showResponseFeedback(correct, responded)
    },
    
    showResponseFeedback(correct, responded) {
      this.lastResponseCorrect = correct
      this.showFeedback = true
      
      if (correct) {
        if (responded) {
          this.feedbackMessage = '正确！'
          this.feedbackClass = 'feedback-correct'
        } else {
          this.feedbackMessage = '正确拒绝'
          this.feedbackClass = 'feedback-correct'
        }
      } else {
        if (responded) {
          this.feedbackMessage = '误报！'
          this.feedbackClass = 'feedback-incorrect'
        } else {
          this.feedbackMessage = '遗漏！'
          this.feedbackClass = 'feedback-incorrect'
        }
      }
      
      // 短暂显示反馈后隐藏
      setTimeout(() => {
        this.showFeedback = false
      }, 800)
    },
    
    pauseTest() {
      this.isPaused = true
      this.canRespond = false
      if (this.stimulusTimer) {
        clearTimeout(this.stimulusTimer)
      }
    },
    
    resumeTest() {
      this.isPaused = false
      this.nextStimulus()
    },
    
    endTest() {
      this.isTestActive = false
      this.canRespond = false
      this.cleanupTimers()
      this.currentPhase = 'results'
      
      // 发送完成事件给父组件
      this.$emit('complete', {
        score: this.finalScore,
        accuracy: this.accuracy,
        averageTime: this.averageReactionTime,
        completedQuestions: this.responses.length,
        totalQuestions: this.totalTrials,
        correctAnswers: this.responses.filter(r => r.correct).length,
        testDuration: this.testDuration,
        sustainedAttentionScore: this.sustainedAttentionScore
      })
    },
    
    cleanupTimers() {
      if (this.testTimer) {
        clearInterval(this.testTimer)
        this.testTimer = null
      }
      if (this.stimulusTimer) {
        clearTimeout(this.stimulusTimer)
        this.stimulusTimer = null
      }
    },
    
    restartTest() {
      this.currentPhase = 'instruction'
      this.cleanupTimers()
    },
    
    finishTest() {
      this.$emit('complete', {
        score: this.finalScore,
        accuracy: this.accuracy,
        averageTime: this.averageReactionTime,
        completedQuestions: this.responses.length,
        totalQuestions: this.totalTrials,
        correctAnswers: this.responses.filter(r => r.correct).length,
        testDuration: this.testDuration,
        sustainedAttentionScore: this.sustainedAttentionScore
      })
    },
    
    getPerformanceEvaluation() {
      const score = this.finalScore
      const hitRate = this.hitRate
      const falseAlarmRate = this.falseAlarmRate
      const sustainability = this.sustainabilityRating
      
      let evaluation = ''
      
      if (score >= 90) {
        evaluation = '优秀！您的持续注意力能力非常出色。'
      } else if (score >= 80) {
        evaluation = '良好！您的持续注意力能力较强。'
      } else if (score >= 70) {
        evaluation = '中等！您的持续注意力能力处于平均水平。'
      } else if (score >= 60) {
        evaluation = '一般！您的持续注意力能力有待提升。'
      } else {
        evaluation = '需要改进！建议加强持续注意力训练。'
      }
      
      if (hitRate < 70) {
        evaluation += '您可能存在注意力不集中的问题，容易遗漏目标刺激。'
      }
      
      if (falseAlarmRate > 20) {
        evaluation += '您可能过于敏感，容易对非目标刺激产生错误反应。'
      }
      
      if (sustainability === '需要改进') {
        evaluation += '您的注意力持续性较差，随着时间推移表现明显下降。'
      }
      
      return evaluation
    },
    
    getImprovementSuggestions() {
      const suggestions = []
      
      if (this.hitRate < 70) {
        suggestions.push('加强专注力训练，提高对目标刺激的敏感性')
        suggestions.push('练习正念冥想，提高注意力集中能力')
      }
      
      if (this.falseAlarmRate > 20) {
        suggestions.push('练习抑制控制，减少冲动反应')
        suggestions.push('提高刺激辨别能力，仔细观察再做反应')
      }
      
      if (this.averageReactionTime > 800) {
        suggestions.push('进行反应速度训练，提高信息处理速度')
      }
      
      if (this.sustainabilityRating === '需要改进') {
        suggestions.push('增加持续性任务练习，提高注意力耐力')
        suggestions.push('保持规律作息，确保充足睡眠')
      }
      
      if (this.reactionTimeStd > 200) {
        suggestions.push('提高反应一致性，减少注意力波动')
      }
      
      suggestions.push('定期进行体育锻炼，提高大脑活力')
      suggestions.push('减少多任务处理，专注于单一任务')
      
      return suggestions.slice(0, 5)
    },
    
    inverseNormal(p) {
      // 简化的正态分布逆函数近似
      if (p <= 0.01) return -2.33
      if (p >= 0.99) return 2.33
      
      const a = -3.969683028665376e+01
      const b = 2.209460984245205e+02
      const c = -2.759285104469687e+02
      const d = 1.383577518672690e+02
      const e = -3.066479806614716e+01
      const f = 2.506628277459239e+00
      
      const q = p - 0.5
      
      if (Math.abs(q) <= 0.425) {
        const r = 0.180625 - q * q
        return q * (((((a * r + b) * r + c) * r + d) * r + e) * r + f) /
               (((((r + 1) * r + 1) * r + 1) * r + 1) * r + 1)
      }
      
      let r = p < 0.5 ? p : 1 - p
      r = Math.sqrt(-Math.log(r))
      
      const g = 1.641345311989654e+00
      const h = 3.429567803408679e+00
      const i = 1.624906493780464e+00
      const j = 1.208650973866179e-02
      const k = 2.182967834047197e-02
      const l = 5.394196021424751e-02
      const m = 4.230581357843113e-02
      const n = 3.224671290700398e-02
      const o = 2.400758277161838e-02
      const pp = 2.549732539343734e-02
      
      let result
      if (r <= 5) {
        r -= g
        result = (((((h * r + i) * r + j) * r + k) * r + l) * r + m) /
                 ((((r + n) * r + o) * r + pp) * r + 1)
      } else {
        r -= 5
        result = (((((h * r + i) * r + j) * r + k) * r + l) * r + m) /
                 ((((r + n) * r + o) * r + pp) * r + 1)
      }
      
      return p < 0.5 ? -result : result
    },
    
    formatTime(ms) {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
/* 基础样式 */
.sustained-attention-test {
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
  max-width: 900px;
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

.target-display {
  background: #e3f2fd;
  padding: 10px;
  border-radius: 8px;
  font-size: 1.5em;
  color: #007bff;
  border: 2px solid #007bff;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 30px;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.stimulus-area {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  margin-bottom: 30px;
}

.stimulus-display {
  font-size: 4em;
  font-weight: bold;
  padding: 40px;
  border-radius: 20px;
  background: #f8f9fa;
  border: 3px solid #e9ecef;
  transition: all 0.3s ease;
  min-width: 150px;
  text-align: center;
}

.stimulus-display.target-stimulus {
  background: #e8f5e8;
  border-color: #28a745;
  color: #28a745;
}

.stimulus-display.non-target-stimulus {
  background: #fff3cd;
  border-color: #ffc107;
  color: #856404;
}

.stimulus-display.feedback-correct {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
  animation: correctFeedback 0.5s ease;
}

.stimulus-display.feedback-incorrect {
  background: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
  animation: incorrectFeedback 0.5s ease;
}

.response-area {
  text-align: center;
  margin-bottom: 30px;
}

.response-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1em;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.response-button:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.response-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
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
  max-width: 1000px;
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.metric-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
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

.sustainability-analysis {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
}

.time-blocks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.time-block {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.block-header {
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
  text-align: center;
}

.block-stats {
  margin-bottom: 10px;
}

.block-stat {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.stat-name {
  color: #6c757d;
  font-size: 0.9em;
}

.stat-value {
  font-weight: 600;
  color: #495057;
}

.block-performance {
  margin-top: 10px;
}

.performance-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.performance-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.sustainability-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.summary-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-name {
  font-weight: 600;
  color: #495057;
}

.metric-value {
  font-weight: 600;
  font-size: 1.1em;
}

.metric-value.positive {
  color: #28a745;
}

.metric-value.negative {
  color: #dc3545;
}

.performance-evaluation {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.evaluation-content {
  text-align: left;
}

.evaluation-text {
  font-size: 1.1em;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 25px;
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
  border-left: 4px solid #28a745;
  color: #495057;
  line-height: 1.5;
}

.suggestions-list li:before {
  content: '💡 ';
  margin-right: 8px;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
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
  
  .stimulus-display {
    font-size: 3em;
    padding: 30px;
  }
  
  .overall-results {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .time-blocks {
    grid-template-columns: 1fr;
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
    font-size: 2em;
  }
  
  .stimulus-display {
    font-size: 2.5em;
    padding: 20px;
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

@keyframes correctFeedback {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes incorrectFeedback {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
  100% { transform: translateX(0); }
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