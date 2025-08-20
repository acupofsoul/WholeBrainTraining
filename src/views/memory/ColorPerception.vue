<template>
  <div class="color-perception-container">

    <!-- 训练模式选择 -->
    <div v-if="!isTraining" class="training-modes">
      <h2>选择训练模式</h2>
      <div class="mode-grid">
        <div 
          v-for="mode in trainingModes" 
          :key="mode.id"
          class="mode-card"
          :class="{ active: selectedMode === mode.id }"
          @click="selectMode(mode.id)"
        >
          <div class="mode-icon">{{ mode.icon }}</div>
          <h3>{{ mode.name }}</h3>
          <p>{{ mode.description }}</p>
          <div class="mode-stats">
            <span>最佳: {{ mode.bestScore || 'N/A' }}</span>
            <span>次数: {{ mode.attempts || 0 }}</span>
          </div>
        </div>
      </div>
      <button 
        class="start-btn" 
        :disabled="!selectedMode"
        @click="startTraining"
      >
        开始训练
      </button>
    </div>

    <!-- 训练界面 -->
    <div v-if="isTraining" class="training-interface">
      <!-- 训练控制栏 -->
      <div class="training-controls">
        <div class="control-group">
          <label>显示时间:</label>
          <div class="time-control">
            <button @click="adjustDisplayTime(-0.1)" :disabled="displayTime <= 0.5">-</button>
            <span>{{ displayTime.toFixed(1) }}s</span>
            <button @click="adjustDisplayTime(0.1)" :disabled="displayTime >= 5">+</button>
          </div>
        </div>
        <div class="control-group">
          <button class="control-btn" @click="pauseTraining">{{ isPaused ? '继续' : '暂停' }}</button>
          <button class="control-btn" @click="stopTraining">结束训练</button>
        </div>
        <div class="training-stats">
          <span>轮次: {{ currentRound }}/{{ totalRounds }}</span>
          <span>正确: {{ correctAnswers }}</span>
          <span>准确率: {{ accuracy }}%</span>
        </div>
      </div>

      <!-- 颜色显示区域 -->
      <div class="color-display">
        <!-- 准备阶段 -->
        <div v-if="trainingPhase === 'preparation'" class="preparation-phase">
          <div class="preparation-message">
            <h3>准备开始第 {{ currentRound }} 轮训练</h3>
            <p>请专注观察即将显示的颜色</p>
            <div class="countdown">{{ countdown }}</div>
          </div>
        </div>

        <!-- 显示阶段 -->
        <div v-if="trainingPhase === 'display'" class="display-phase">
          <div class="color-area">
            <div class="color-grid" v-if="currentMode === 'sequence'">
              <div 
                v-for="(color, index) in currentColors" 
                :key="index"
                class="color-item"
                :style="{ backgroundColor: color }"
              ></div>
            </div>
            <div class="single-color" v-else-if="currentMode === 'single'"
                 :style="{ backgroundColor: currentColors[0] }"
            ></div>
            <div class="gradient-color" v-else-if="currentMode === 'gradient'"
                 :style="{ background: currentGradient }"
            ></div>
            <div class="pattern-color" v-else-if="currentMode === 'pattern'">
              <div 
                v-for="(color, index) in currentColors" 
                :key="index"
                class="pattern-item"
                :class="getPatternClass(index)"
                :style="{ backgroundColor: color }"
              ></div>
            </div>
          </div>
          <div class="display-timer">{{ displayTimer.toFixed(1) }}s</div>
          <div class="display-instructions">
            <p>请仔细观察并记住这些颜色</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: displayProgress + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 回答阶段 -->
        <div v-if="trainingPhase === 'answer'" class="answer-phase">
          <div class="answer-area">
            <h3>请选择刚才看到的颜色</h3>
            <div class="color-options" v-if="currentMode === 'single'">
              <div 
                v-for="(color, index) in colorOptions" 
                :key="index"
                class="color-option"
                :class="{ selected: selectedColors.includes(color) }"
                :style="{ backgroundColor: color }"
                @click="selectColor(color)"
              ></div>
            </div>
            <div class="sequence-answer" v-else-if="currentMode === 'sequence'">
              <p>请按顺序选择颜色：</p>
              <div class="selected-sequence">
                <div 
                  v-for="(color, index) in selectedSequence" 
                  :key="index"
                  class="sequence-item"
                  :style="{ backgroundColor: color }"
                >
                  {{ index + 1 }}
                </div>
              </div>
              <div class="color-options">
                <div 
                  v-for="(color, index) in colorOptions" 
                  :key="index"
                  class="color-option"
                  :style="{ backgroundColor: color }"
                  @click="addToSequence(color)"
                ></div>
              </div>
              <button class="clear-btn" @click="clearSequence">清空</button>
            </div>
            <div class="gradient-answer" v-else-if="currentMode === 'gradient'">
              <p>请选择最接近的渐变色：</p>
              <div class="gradient-options">
                <div 
                  v-for="(gradient, index) in gradientOptions" 
                  :key="index"
                  class="gradient-option"
                  :class="{ selected: selectedGradient === gradient }"
                  :style="{ background: gradient }"
                  @click="selectGradient(gradient)"
                ></div>
              </div>
            </div>
            <div class="pattern-answer" v-else-if="currentMode === 'pattern'">
              <p>请重建颜色图案：</p>
              <div class="pattern-builder">
                <div 
                  v-for="(color, index) in selectedPattern" 
                  :key="index"
                  class="pattern-slot"
                  :class="getPatternClass(index)"
                  :style="{ backgroundColor: color || '#f0f0f0' }"
                  @click="selectPatternSlot(index)"
                >
                  {{ index + 1 }}
                </div>
              </div>
              <div class="color-palette">
                <div 
                  v-for="(color, index) in colorOptions" 
                  :key="index"
                  class="palette-color"
                  :style="{ backgroundColor: color }"
                  @click="fillPatternSlot(color)"
                ></div>
              </div>
              <button class="clear-btn" @click="clearPattern">清空</button>
            </div>
          </div>
          <button 
            class="submit-btn" 
            :disabled="!canSubmit"
            @click="submitAnswer"
          >
            提交答案
          </button>
        </div>

        <!-- 结果阶段 -->
        <div v-if="trainingPhase === 'result'" class="result-phase">
          <div class="result-area">
            <h3 :class="lastResult.correct ? 'correct' : 'incorrect'">
              {{ lastResult.correct ? '回答正确！' : '回答错误' }}
            </h3>
            <div class="result-comparison">
              <div class="original-colors">
                <h4>原始颜色：</h4>
                <div class="color-display-result">
                  <div 
                    v-for="(color, index) in lastResult.original" 
                    :key="index"
                    class="result-color"
                    :style="{ backgroundColor: color }"
                  ></div>
                </div>
              </div>
              <div class="user-colors">
                <h4>您的答案：</h4>
                <div class="color-display-result">
                  <div 
                    v-for="(color, index) in lastResult.answer" 
                    :key="index"
                    class="result-color"
                    :class="{ correct: lastResult.correctPositions[index], incorrect: !lastResult.correctPositions[index] }"
                    :style="{ backgroundColor: color }"
                  ></div>
                </div>
              </div>
            </div>
            <div class="result-stats">
              <p>准确度: {{ lastResult.accuracy }}%</p>
              <p>反应时间: {{ lastResult.responseTime }}s</p>
            </div>
          </div>
          <button class="next-btn" @click="nextRound">下一轮</button>
        </div>
      </div>

      <!-- 训练提示 -->
      <div class="training-tips">
        <h4>训练技巧</h4>
        <ul>
          <li>放松眼部肌肉，保持自然的观察状态</li>
          <li>注意颜色的饱和度、明度和色相</li>
          <li>尝试将颜色与熟悉的物体联系起来</li>
          <li>练习时保持专注，避免分心</li>
        </ul>
      </div>
    </div>

    <!-- 训练完成弹窗 -->
    <div v-if="showCompletionModal" class="modal-overlay" @click="closeModal">
      <div class="completion-modal" @click.stop>
        <h2>训练完成！</h2>
        <div class="completion-stats">
          <div class="stat-item">
            <span class="stat-label">总轮次:</span>
            <span class="stat-value">{{ totalRounds }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">正确数:</span>
            <span class="stat-value">{{ correctAnswers }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">准确率:</span>
            <span class="stat-value">{{ accuracy }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均反应时间:</span>
            <span class="stat-value">{{ averageResponseTime }}s</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">训练评级:</span>
            <span class="stat-value" :class="'rating-' + trainingRating.toLowerCase()">{{ trainingRating }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="primary-btn" @click="restartTraining">再次训练</button>
          <button class="secondary-btn" @click="backToModes">返回模式选择</button>
        </div>
      </div>
    </div>

    <!-- 训练设置 -->
    <div v-if="!isTraining" class="training-settings">
      <h2>训练设置</h2>
      <div class="settings-grid">
        <div class="setting-group">
          <label>初始显示时间 (秒)</label>
          <input 
            type="range" 
            v-model="settings.initialDisplayTime" 
            min="0.5" 
            max="5" 
            step="0.1"
          >
          <span>{{ settings.initialDisplayTime }}s</span>
        </div>
        <div class="setting-group">
          <label>训练轮次</label>
          <input 
            type="range" 
            v-model="settings.rounds" 
            min="5" 
            max="50" 
            step="5"
          >
          <span>{{ settings.rounds }}轮</span>
        </div>
        <div class="setting-group">
          <label>颜色数量</label>
          <select v-model="settings.colorCount">
            <option value="3">3个颜色</option>
            <option value="4">4个颜色</option>
            <option value="5">5个颜色</option>
            <option value="6">6个颜色</option>
          </select>
        </div>
        <div class="setting-group">
          <label>难度级别</label>
          <select v-model="settings.difficulty">
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
        <div class="setting-group">
          <label>音效反馈</label>
          <input type="checkbox" v-model="settings.soundEnabled">
        </div>
        <div class="setting-group">
          <label>自动下一轮</label>
          <input type="checkbox" v-model="settings.autoNext">
        </div>
      </div>
    </div>

    <!-- 训练统计 -->
    <div v-if="!isTraining" class="training-statistics">
      <h2>训练统计</h2>
      
      <!-- 总体表现 -->
      <div class="stats-section">
        <h3>总体表现</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ overallStats.totalSessions }}</div>
            <div class="stat-label">总训练次数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ overallStats.averageAccuracy }}%</div>
            <div class="stat-label">平均准确率</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ overallStats.averageResponseTime }}s</div>
            <div class="stat-label">平均反应时间</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ overallStats.bestStreak }}</div>
            <div class="stat-label">最佳连续正确</div>
          </div>
        </div>
      </div>

      <!-- 不同模式表现 -->
      <div class="stats-section">
        <h3>不同模式表现</h3>
        <div class="mode-performance">
          <div 
            v-for="mode in trainingModes" 
            :key="mode.id"
            class="performance-item"
          >
            <div class="mode-info">
              <div class="mode-name">{{ mode.name }}</div>
              <div class="mode-difficulty">{{ mode.description }}</div>
            </div>
            <div class="performance-stats">
              <div class="stat">
                <div class="stat-label">准确率</div>
                <div class="stat-value">{{ mode.accuracy || 0 }}%</div>
              </div>
              <div class="stat">
                <div class="stat-label">最佳成绩</div>
                <div class="stat-value">{{ mode.bestScore || 'N/A' }}</div>
              </div>
              <div class="stat">
                <div class="stat-label">训练次数</div>
                <div class="stat-value">{{ mode.attempts || 0 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 能力分析 -->
      <div class="stats-section">
        <h3>能力分析</h3>
        <div class="ability-radar">
          <div class="radar-chart">
            <div class="chart-placeholder">
              <p>颜色感知能力雷达图</p>
              <small>显示各项能力指标</small>
            </div>
          </div>
          <div class="ability-details">
            <div class="ability-item">
              <span class="ability-name">色彩识别</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: abilities.colorRecognition + '%' }"></div>
              </div>
              <span class="ability-score">{{ abilities.colorRecognition }}</span>
            </div>
            <div class="ability-item">
              <span class="ability-name">色彩记忆</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: abilities.colorMemory + '%' }"></div>
              </div>
              <span class="ability-score">{{ abilities.colorMemory }}</span>
            </div>
            <div class="ability-item">
              <span class="ability-name">色彩区分</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: abilities.colorDifferentiation + '%' }"></div>
              </div>
              <span class="ability-score">{{ abilities.colorDifferentiation }}</span>
            </div>
            <div class="ability-item">
              <span class="ability-name">反应速度</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: abilities.responseSpeed + '%' }"></div>
              </div>
              <span class="ability-score">{{ abilities.responseSpeed }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorPerception',
  data() {
    return {
      // 训练状态
      isTraining: false,
      isPaused: false,
      selectedMode: null,
      currentMode: null,
      trainingPhase: 'preparation', // preparation, display, answer, result
      currentRound: 1,
      totalRounds: 10,
      correctAnswers: 0,
      
      // 时间控制
      displayTime: 2.0,
      displayTimer: 0,
      countdown: 3,
      
      // 颜色数据
      currentColors: [],
      currentGradient: '',
      colorOptions: [],
      gradientOptions: [],
      selectedColors: [],
      selectedSequence: [],
      selectedGradient: '',
      selectedPattern: [],
      selectedPatternSlot: -1,
      
      // 训练结果
      lastResult: {
        correct: false,
        accuracy: 0,
        responseTime: 0,
        original: [],
        answer: [],
        correctPositions: []
      },
      
      // 弹窗控制
      showCompletionModal: false,
      
      // 训练模式
      trainingModes: [
        {
          id: 'single',
          name: '单色识别',
          description: '识别和记忆单个颜色',
          icon: '🎨',
          difficulty: 'easy',
          bestScore: null,
          attempts: 0,
          accuracy: 0
        },
        {
          id: 'sequence',
          name: '颜色序列',
          description: '按顺序记忆多个颜色',
          icon: '🌈',
          difficulty: 'medium',
          bestScore: null,
          attempts: 0,
          accuracy: 0
        },
        {
          id: 'gradient',
          name: '渐变识别',
          description: '识别和记忆渐变色彩',
          icon: '🎭',
          difficulty: 'medium',
          bestScore: null,
          attempts: 0,
          accuracy: 0
        },
        {
          id: 'pattern',
          name: '图案重建',
          description: '重建复杂的颜色图案',
          icon: '🧩',
          difficulty: 'hard',
          bestScore: null,
          attempts: 0,
          accuracy: 0
        }
      ],
      
      // 训练设置
      settings: {
        initialDisplayTime: 2.0,
        rounds: 10,
        colorCount: 4,
        difficulty: 'medium',
        soundEnabled: true,
        autoNext: false
      },
      
      // 统计数据
      overallStats: {
        totalSessions: 0,
        averageAccuracy: 0,
        averageResponseTime: 0,
        bestStreak: 0
      },
      
      // 能力评估
      abilities: {
        colorRecognition: 75,
        colorMemory: 68,
        colorDifferentiation: 82,
        responseSpeed: 71
      },
      
      // 计时器
      timers: {
        countdown: null,
        display: null,
        response: null
      },
      
      // 响应时间记录
      responseStartTime: 0,
      responseTimes: [],
      
      // 颜色库
      colorPalette: [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
        '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080', '#000000',
        '#FFFFFF', '#90EE90', '#FFB6C1', '#20B2AA', '#87CEEB', '#DDA0DD',
        '#F0E68C', '#FA8072', '#98FB98', '#F5DEB3', '#CD853F', '#D2691E'
      ]
    }
  },
  
  computed: {
    accuracy() {
      return this.totalRounds > 0 ? Math.round((this.correctAnswers / this.currentRound) * 100) : 0
    },
    
    displayProgress() {
      return this.displayTime > 0 ? ((this.displayTime - this.displayTimer) / this.displayTime) * 100 : 0
    },
    
    canSubmit() {
      switch (this.currentMode) {
        case 'single':
          return this.selectedColors.length > 0
        case 'sequence':
          return this.selectedSequence.length === this.currentColors.length
        case 'gradient':
          return this.selectedGradient !== ''
        case 'pattern':
          return this.selectedPattern.every(color => color !== null)
        default:
          return false
      }
    },
    
    averageResponseTime() {
      return this.responseTimes.length > 0 
        ? (this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length).toFixed(2)
        : 0
    },
    
    trainingRating() {
      const acc = this.accuracy
      if (acc >= 90) return 'S'
      if (acc >= 80) return 'A'
      if (acc >= 70) return 'B'
      if (acc >= 60) return 'C'
      return 'D'
    }
  },
  
  mounted() {
    this.loadTrainingData()
  },
  
  beforeUnmount() {
    this.clearAllTimers()
  },
  
  methods: {
    // 模式选择
    selectMode(modeId) {
      this.selectedMode = modeId
    },
    
    // 开始训练
    startTraining() {
      if (!this.selectedMode) return
      
      this.isTraining = true
      this.currentMode = this.selectedMode
      this.currentRound = 1
      this.correctAnswers = 0
      this.totalRounds = this.settings.rounds
      this.displayTime = this.settings.initialDisplayTime
      this.responseTimes = []
      
      this.startRound()
    },
    
    // 开始新一轮
    startRound() {
      this.trainingPhase = 'preparation'
      this.countdown = 3
      this.resetAnswers()
      
      this.timers.countdown = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.timers.countdown)
          this.showColors()
        }
      }, 1000)
    },
    
    // 显示颜色
    showColors() {
      this.generateColors()
      this.trainingPhase = 'display'
      this.displayTimer = this.displayTime
      
      this.timers.display = setInterval(() => {
        this.displayTimer -= 0.1
        if (this.displayTimer <= 0) {
          clearInterval(this.timers.display)
          this.startAnswer()
        }
      }, 100)
    },
    
    // 开始回答
    startAnswer() {
      this.trainingPhase = 'answer'
      this.generateOptions()
      this.responseStartTime = Date.now()
    },
    
    // 生成颜色
    generateColors() {
      const count = this.getColorCount()
      this.currentColors = []
      
      for (let i = 0; i < count; i++) {
        const color = this.getRandomColor()
        this.currentColors.push(color)
      }
      
      if (this.currentMode === 'gradient') {
        this.currentGradient = this.generateGradient()
      }
    },
    
    // 生成选项
    generateOptions() {
      const optionCount = this.getOptionCount()
      this.colorOptions = [...this.currentColors]
      
      // 添加干扰选项
      while (this.colorOptions.length < optionCount) {
        const color = this.getRandomColor()
        if (!this.colorOptions.includes(color)) {
          this.colorOptions.push(color)
        }
      }
      
      // 打乱顺序
      this.colorOptions = this.shuffleArray(this.colorOptions)
      
      if (this.currentMode === 'gradient') {
        this.generateGradientOptions()
      }
    },
    
    // 获取颜色数量
    getColorCount() {
      switch (this.currentMode) {
        case 'single': return 1
        case 'sequence': return parseInt(this.settings.colorCount)
        case 'gradient': return 2
        case 'pattern': return parseInt(this.settings.colorCount)
        default: return 1
      }
    },
    
    // 获取选项数量
    getOptionCount() {
      const difficulty = this.settings.difficulty
      const base = this.getColorCount()
      
      switch (difficulty) {
        case 'easy': return base + 2
        case 'medium': return base + 4
        case 'hard': return base + 6
        default: return base + 4
      }
    },
    
    // 获取随机颜色
    getRandomColor() {
      return this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)]
    },
    
    // 生成渐变
    generateGradient() {
      const color1 = this.currentColors[0]
      const color2 = this.currentColors[1]
      return `linear-gradient(45deg, ${color1}, ${color2})`
    },
    
    // 生成渐变选项
    generateGradientOptions() {
      this.gradientOptions = [this.currentGradient]
      
      // 生成干扰渐变
      for (let i = 0; i < 5; i++) {
        const color1 = this.getRandomColor()
        const color2 = this.getRandomColor()
        const gradient = `linear-gradient(45deg, ${color1}, ${color2})`
        if (!this.gradientOptions.includes(gradient)) {
          this.gradientOptions.push(gradient)
        }
      }
      
      this.gradientOptions = this.shuffleArray(this.gradientOptions)
    },
    
    // 获取图案类名
    getPatternClass(index) {
      const patterns = ['circle', 'square', 'triangle', 'diamond']
      return patterns[index % patterns.length]
    },
    
    // 选择颜色
    selectColor(color) {
      if (this.selectedColors.includes(color)) {
        this.selectedColors = this.selectedColors.filter(c => c !== color)
      } else {
        this.selectedColors.push(color)
      }
    },
    
    // 添加到序列
    addToSequence(color) {
      if (this.selectedSequence.length < this.currentColors.length) {
        this.selectedSequence.push(color)
      }
    },
    
    // 清空序列
    clearSequence() {
      this.selectedSequence = []
    },
    
    // 选择渐变
    selectGradient(gradient) {
      this.selectedGradient = gradient
    },
    
    // 选择图案槽位
    selectPatternSlot(index) {
      this.selectedPatternSlot = index
    },
    
    // 填充图案槽位
    fillPatternSlot(color) {
      if (this.selectedPatternSlot >= 0) {
        this.$set(this.selectedPattern, this.selectedPatternSlot, color)
        this.selectedPatternSlot = -1
      }
    },
    
    // 清空图案
    clearPattern() {
      this.selectedPattern = new Array(this.currentColors.length).fill(null)
      this.selectedPatternSlot = -1
    },
    
    // 提交答案
    submitAnswer() {
      const responseTime = (Date.now() - this.responseStartTime) / 1000
      this.responseTimes.push(responseTime)
      
      const result = this.checkAnswer()
      result.responseTime = responseTime
      
      this.lastResult = result
      
      if (result.correct) {
        this.correctAnswers++
        this.playSound('correct')
      } else {
        this.playSound('incorrect')
      }
      
      this.trainingPhase = 'result'
      
      if (this.settings.autoNext) {
        setTimeout(() => {
          this.nextRound()
        }, 2000)
      }
    },
    
    // 检查答案
    checkAnswer() {
      let correct = false
      let accuracy = 0
      let correctPositions = []
      let answer = []
      
      switch (this.currentMode) {
        case 'single':
          answer = this.selectedColors
          correct = this.selectedColors.length === 1 && this.selectedColors[0] === this.currentColors[0]
          accuracy = correct ? 100 : 0
          correctPositions = [correct]
          break
          
        case 'sequence':
          answer = this.selectedSequence
          correctPositions = this.selectedSequence.map((color, index) => color === this.currentColors[index])
          const correctCount = correctPositions.filter(Boolean).length
          accuracy = Math.round((correctCount / this.currentColors.length) * 100)
          correct = accuracy === 100
          break
          
        case 'gradient':
          answer = [this.selectedGradient]
          correct = this.selectedGradient === this.currentGradient
          accuracy = correct ? 100 : 0
          correctPositions = [correct]
          break
          
        case 'pattern':
          answer = this.selectedPattern
          correctPositions = this.selectedPattern.map((color, index) => color === this.currentColors[index])
          const patternCorrectCount = correctPositions.filter(Boolean).length
          accuracy = Math.round((patternCorrectCount / this.currentColors.length) * 100)
          correct = accuracy === 100
          break
      }
      
      return {
        correct,
        accuracy,
        original: [...this.currentColors],
        answer,
        correctPositions
      }
    },
    
    // 下一轮
    nextRound() {
      if (this.currentRound >= this.totalRounds) {
        this.completeTraining()
      } else {
        this.currentRound++
        this.startRound()
      }
    },
    
    // 完成训练
    completeTraining() {
      this.isTraining = false
      this.showCompletionModal = true
      this.saveTrainingData()
    },
    
    // 重置答案
    resetAnswers() {
      this.selectedColors = []
      this.selectedSequence = []
      this.selectedGradient = ''
      this.selectedPattern = new Array(this.getColorCount()).fill(null)
      this.selectedPatternSlot = -1
    },
    
    // 调整显示时间
    adjustDisplayTime(delta) {
      this.displayTime = Math.max(0.5, Math.min(5, this.displayTime + delta))
    },
    
    // 暂停训练
    pauseTraining() {
      this.isPaused = !this.isPaused
      // 实现暂停逻辑
    },
    
    // 停止训练
    stopTraining() {
      this.clearAllTimers()
      this.isTraining = false
      this.showCompletionModal = true
    },
    
    // 重新开始训练
    restartTraining() {
      this.showCompletionModal = false
      this.startTraining()
    },
    
    // 返回模式选择
    backToModes() {
      this.showCompletionModal = false
      this.isTraining = false
      this.selectedMode = null
    },
    
    // 关闭弹窗
    closeModal() {
      this.showCompletionModal = false
    },
    
    // 播放音效
    playSound(type) {
      if (!this.settings.soundEnabled) return
      
      // 实现音效播放
      const audio = new Audio()
      if (type === 'correct') {
        audio.src = '/sounds/correct.mp3'
      } else {
        audio.src = '/sounds/incorrect.mp3'
      }
      audio.play().catch(() => {})
    },
    
    // 清除所有计时器
    clearAllTimers() {
      Object.values(this.timers).forEach(timer => {
        if (timer) clearInterval(timer)
      })
    },
    
    // 打乱数组
    shuffleArray(array) {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    },
    
    // 保存训练数据
    saveTrainingData() {
      const data = {
        modes: this.trainingModes,
        settings: this.settings,
        stats: this.overallStats,
        abilities: this.abilities
      }
      localStorage.setItem('colorPerceptionData', JSON.stringify(data))
    },
    
    // 加载训练数据
    loadTrainingData() {
      const saved = localStorage.getItem('colorPerceptionData')
      if (saved) {
        const data = JSON.parse(saved)
        this.trainingModes = { ...this.trainingModes, ...data.modes }
        this.settings = { ...this.settings, ...data.settings }
        this.overallStats = { ...this.overallStats, ...data.stats }
        this.abilities = { ...this.abilities, ...data.abilities }
      }
    }
  }
}
</script>

<style scoped>
.color-perception-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

/* 训练模式选择 */
.training-modes {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.training-modes h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-size: 1.8rem;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.mode-card {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.mode-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.mode-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.mode-card h3 {
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}

.mode-card p {
  margin: 0 0 15px 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.mode-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  opacity: 0.7;
}

.start-btn {
  display: block;
  margin: 0 auto;
  padding: 15px 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 训练界面 */
.training-interface {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

/* 训练控制栏 */
.training-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-group label {
  font-weight: bold;
  color: #333;
}

.time-control {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 8px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
}

.time-control button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.time-control button:hover:not(:disabled) {
  background: #764ba2;
  transform: scale(1.1);
}

.time-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.control-btn:first-of-type {
  background: #27ae60;
  color: white;
}

.control-btn:last-of-type {
  background: #e74c3c;
  color: white;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
}

.training-stats {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: #666;
}

/* 颜色显示区域 */
.color-display {
  background: #000;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 30px;
  min-height: 500px;
  position: relative;
}

/* 准备阶段 */
.preparation-phase {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preparation-message {
  text-align: center;
  color: #fff;
}

.preparation-message h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.preparation-message p {
  opacity: 0.8;
  margin-bottom: 20px;
}

.countdown {
  font-size: 4rem;
  font-weight: bold;
  color: #667eea;
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* 显示阶段 */
.display-phase {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.color-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 15px;
  max-width: 400px;
}

.color-item {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  border: 3px solid rgba(255,255,255,0.3);
  transition: all 0.3s ease;
}

.single-color {
  width: 200px;
  height: 200px;
  border-radius: 15px;
  border: 3px solid rgba(255,255,255,0.3);
  box-shadow: 0 0 30px rgba(255,255,255,0.2);
}

.gradient-color {
  width: 300px;
  height: 200px;
  border-radius: 15px;
  border: 3px solid rgba(255,255,255,0.3);
  box-shadow: 0 0 30px rgba(255,255,255,0.2);
}

.pattern-color {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 20px;
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
}

.pattern-item {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid rgba(255,255,255,0.3);
}

.pattern-item.circle {
  border-radius: 50%;
}

.pattern-item.triangle {
  width: 0;
  height: 0;
  border-left: 30px solid transparent;
  border-right: 30px solid transparent;
  border-bottom: 52px solid;
  background: none !important;
  border-radius: 0;
}

.pattern-item.diamond {
  transform: rotate(45deg);
}

.display-timer {
  font-size: 2rem;
  color: #fff;
  font-weight: bold;
  margin-bottom: 20px;
}

.display-instructions {
  text-align: center;
  color: #fff;
}

.display-instructions p {
  margin-bottom: 20px;
  opacity: 0.8;
}

.progress-bar {
  width: 300px;
  height: 6px;
  background: rgba(255,255,255,0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 回答阶段 */
.answer-phase {
  color: #333;
  padding: 20px;
}

.answer-area {
  background: #fff;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 20px;
}

.answer-area h3 {
  text-align: center;
  margin-bottom: 25px;
  color: #667eea;
}

.color-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 15px;
  max-width: 500px;
  margin: 0 auto 20px;
}

.color-option {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  border: 3px solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.color-option.selected {
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.5);
}

.color-option.selected::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

/* 序列回答 */
.sequence-answer {
  text-align: center;
}

.sequence-answer p {
  margin-bottom: 20px;
  font-weight: bold;
}

.selected-sequence {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  min-height: 70px;
  align-items: center;
}

.sequence-item {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.clear-btn {
  padding: 8px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  margin-top: 15px;
}

.clear-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

/* 渐变回答 */
.gradient-answer {
  text-align: center;
}

.gradient-answer p {
  margin-bottom: 20px;
  font-weight: bold;
}

.gradient-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.gradient-option {
  width: 150px;
  height: 100px;
  border-radius: 10px;
  border: 3px solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.gradient-option:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.gradient-option.selected {
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.5);
}

/* 图案回答 */
.pattern-answer {
  text-align: center;
}

.pattern-answer p {
  margin-bottom: 20px;
  font-weight: bold;
}

.pattern-builder {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  max-width: 200px;
  margin: 0 auto 20px;
}

.pattern-slot {
  width: 80px;
  height: 80px;
  border: 3px dashed #ddd;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #666;
}

.pattern-slot:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.pattern-slot.circle {
  border-radius: 50%;
}

.pattern-slot.triangle {
  width: 0;
  height: 0;
  border-left: 40px solid transparent;
  border-right: 40px solid transparent;
  border-bottom: 69px solid #f0f0f0;
  background: none !important;
  border-radius: 0;
  color: transparent;
}

.pattern-slot.diamond {
  transform: rotate(45deg);
}

.color-palette {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.palette-color {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.palette-color:hover {
  transform: scale(1.1);
  border-color: #667eea;
}

.submit-btn {
  display: block;
  margin: 0 auto;
  padding: 15px 40px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #2ecc71;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 结果阶段 */
.result-phase {
  color: #333;
  padding: 20px;
}

.result-area {
  background: #fff;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  margin-bottom: 20px;
}

.result-area h3 {
  font-size: 1.8rem;
  margin-bottom: 25px;
}

.result-area h3.correct {
  color: #27ae60;
}

.result-area h3.incorrect {
  color: #e74c3c;
}

.result-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 25px;
}

.original-colors h4,
.user-colors h4 {
  margin-bottom: 15px;
  color: #333;
}

.color-display-result {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.result-color {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid #ddd;
}

.result-color.correct {
  border-color: #27ae60;
  box-shadow: 0 0 10px rgba(39, 174, 96, 0.3);
}

.result-color.incorrect {
  border-color: #e74c3c;
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.3);
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
}

.result-stats p {
  margin: 0;
  font-weight: bold;
  color: #666;
}

.next-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

/* 训练提示 */
.training-tips {
  background: #e8f4fd;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.training-tips h4 {
  color: #667eea;
  margin-bottom: 15px;
}

.training-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #555;
}

.training-tips li {
  margin-bottom: 8px;
  line-height: 1.5;
}

/* 完成弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-modal {
  background: white;
  border-radius: 15px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.completion-modal h2 {
  color: #333;
  margin-bottom: 25px;
  font-size: 2rem;
}

.completion-stats {
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-weight: bold;
  color: #666;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.rating-s { color: #f39c12; }
.rating-a { color: #27ae60; }
.rating-b { color: #3498db; }
.rating-c { color: #f1c40f; }
.rating-d { color: #e74c3c; }

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.primary-btn, .secondary-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.secondary-btn {
  background: #95a5a6;
  color: white;
}

.primary-btn:hover, .secondary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* 训练设置 */
.training-settings {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.training-settings h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-group label {
  font-weight: bold;
  color: #333;
}

.setting-group input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
}

.setting-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
}

.setting-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
}

.setting-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #667eea;
}

/* 训练统计 */
.training-statistics {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.training-statistics h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.stats-section {
  margin-bottom: 40px;
}

.stats-section h3 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 不同模式表现 */
.mode-performance {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.performance-item {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mode-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.mode-name {
  font-weight: bold;
  color: #333;
  font-size: 1.1rem;
}

.mode-difficulty {
  color: #666;
  font-size: 0.9rem;
}

.performance-stats {
  display: flex;
  gap: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat .stat-label {
  font-size: 0.8rem;
  color: #666;
}

.stat .stat-value {
  font-weight: bold;
  color: #667eea;
}

/* 能力分析 */
.ability-radar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: center;
}

.radar-chart {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
}

.chart-placeholder {
  color: #666;
}

.chart-placeholder p {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.chart-placeholder small {
  opacity: 0.7;
}

.ability-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ability-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.ability-name {
  min-width: 100px;
  font-weight: bold;
  color: #333;
}

.ability-bar {
  flex: 1;
  height: 10px;
  background: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
}

.ability-progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.ability-score {
  min-width: 50px;
  text-align: right;
  font-weight: bold;
  color: #667eea;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .color-perception-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .training-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    justify-content: center;
  }
  
  .training-stats {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .mode-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ability-radar {
    grid-template-columns: 1fr;
  }
  
  .result-comparison {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .performance-item {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .performance-stats {
    justify-content: space-around;
  }
  
  .color-options {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .gradient-options {
    grid-template-columns: 1fr;
  }
  
  .single-color {
    width: 150px;
    height: 150px;
  }
  
  .gradient-color {
    width: 250px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .completion-modal {
    padding: 25px;
  }
  
  .color-options {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .color-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .single-color {
    width: 120px;
    height: 120px;
  }
  
  .gradient-color {
    width: 200px;
    height: 120px;
  }
  
  .countdown {
    font-size: 3rem;
  }
  
  .result-stats {
    flex-direction: column;
    gap: 10px;
  }
}
</style>