<template>
  <div class="after-image-container">

    <!-- 训练模式选择 -->
    <div v-if="!isTraining" class="training-modes">
      <h2>选择训练模式</h2>
      <div class="mode-grid">
        <div 
          v-for="mode in trainingModes" 
          :key="mode.id"
          class="mode-card"
          :class="{ active: selectedMode?.id === mode.id }"
          @click="selectMode(mode)"
        >
          <div class="mode-icon">{{ mode.icon }}</div>
          <h3>{{ mode.name }}</h3>
          <p>{{ mode.description }}</p>
          <div class="mode-stats">
            <span>难度: {{ mode.difficulty }}</span>
            <span>时长: {{ mode.duration }}s</span>
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
          <label>凝视时间:</label>
          <div class="time-control">
            <button @click="adjustGazeTime(-1)" :disabled="gazeTime <= 5">-</button>
            <span>{{ gazeTime }}s</span>
            <button @click="adjustGazeTime(1)" :disabled="gazeTime >= 30">+</button>
          </div>
        </div>
        <div class="control-group">
          <button class="control-btn" @click="pauseTraining" v-if="!isPaused">暂停</button>
          <button class="control-btn" @click="resumeTraining" v-else>继续</button>
          <button class="control-btn" @click="stopTraining">结束</button>
        </div>
        <div class="training-stats">
          <span>当前轮次: {{ currentRound }}/{{ totalRounds }}</span>
          <span>总用时: {{ formatTime(totalTime) }}</span>
          <span>成功率: {{ successRate }}%</span>
        </div>
      </div>

      <!-- 残像显示区域 -->
      <div class="afterimage-display">
        <!-- 准备阶段 -->
        <div v-if="trainingPhase === 'prepare'" class="preparation-phase">
          <div class="preparation-message">
            <h3>准备开始</h3>
            <p>请保持放松，准备凝视图像</p>
            <div class="countdown">{{ prepareCountdown }}</div>
          </div>
        </div>

        <!-- 凝视阶段 -->
        <div v-if="trainingPhase === 'gaze'" class="gaze-phase">
          <div class="gaze-area">
            <div class="focus-point"></div>
            <div class="target-image" :style="{ backgroundColor: currentImage.color }">
              <div v-if="currentImage.shape" class="image-shape" :class="currentImage.shape"></div>
              <div v-if="currentImage.text" class="image-text">{{ currentImage.text }}</div>
              <div v-if="currentImage.pattern" class="image-pattern" :class="currentImage.pattern"></div>
            </div>
            <div class="gaze-timer">{{ gazeCountdown }}</div>
          </div>
          <div class="gaze-instructions">
            <p>请专注凝视中央图像，不要眨眼</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: gazeProgress + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 残像观察阶段 -->
        <div v-if="trainingPhase === 'afterimage'" class="afterimage-phase">
          <div class="afterimage-area">
            <div class="blank-screen"></div>
            <div class="afterimage-timer">{{ afterimageCountdown }}</div>
          </div>
          <div class="afterimage-instructions">
            <p>现在请观察残像，描述你看到的内容</p>
            <div class="observation-controls">
              <button class="observation-btn" @click="recordObservation('clear')">清晰可见</button>
              <button class="observation-btn" @click="recordObservation('partial')">部分可见</button>
              <button class="observation-btn" @click="recordObservation('none')">无残像</button>
            </div>
          </div>
        </div>

        <!-- 描述阶段 -->
        <div v-if="trainingPhase === 'describe'" class="describe-phase">
          <div class="description-area">
            <h3>描述残像内容</h3>
            <div class="description-questions">
              <div class="question-item">
                <label>残像颜色:</label>
                <div class="color-options">
                  <button 
                    v-for="color in colorOptions" 
                    :key="color.name"
                    class="color-btn"
                    :class="{ selected: selectedColor === color.name }"
                    :style="{ backgroundColor: color.value }"
                    @click="selectedColor = color.name"
                  ></button>
                </div>
              </div>
              <div class="question-item">
                <label>残像形状:</label>
                <div class="shape-options">
                  <button 
                    v-for="shape in shapeOptions" 
                    :key="shape"
                    class="shape-btn"
                    :class="{ selected: selectedShape === shape }"
                    @click="selectedShape = shape"
                  >
                    {{ shape }}
                  </button>
                </div>
              </div>
              <div class="question-item">
                <label>残像清晰度:</label>
                <div class="clarity-slider">
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    v-model="clarityRating"
                  >
                  <span>{{ clarityRating }}/10</span>
                </div>
              </div>
              <div class="question-item">
                <label>其他观察:</label>
                <textarea 
                  v-model="additionalNotes"
                  placeholder="请描述其他观察到的细节..."
                  rows="3"
                ></textarea>
              </div>
            </div>
            <button class="submit-btn" @click="submitDescription">提交描述</button>
          </div>
        </div>
      </div>

      <!-- 训练提示 -->
      <div class="training-tips">
        <h4>训练技巧</h4>
        <ul>
          <li>保持眼睛放松，避免过度用力</li>
          <li>凝视时尽量不要眨眼，但不要强迫</li>
          <li>观察残像时保持平静，不要急躁</li>
          <li>记录真实感受，有助于提高训练效果</li>
        </ul>
      </div>
    </div>

    <!-- 训练完成弹窗 -->
    <div v-if="showCompletionModal" class="modal-overlay" @click="closeCompletionModal">
      <div class="completion-modal" @click.stop>
        <h2>训练完成！</h2>
        <div class="completion-stats">
          <div class="stat-item">
            <span class="stat-label">总轮次:</span>
            <span class="stat-value">{{ totalRounds }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总用时:</span>
            <span class="stat-value">{{ formatTime(totalTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">成功率:</span>
            <span class="stat-value">{{ successRate }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均清晰度:</span>
            <span class="stat-value">{{ averageClarity }}/10</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">训练评级:</span>
            <span class="stat-value" :class="'rating-' + trainingRating.toLowerCase()">{{ trainingRating }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="primary-btn" @click="restartTraining">再次训练</button>
          <button class="secondary-btn" @click="closeCompletionModal">返回选择</button>
        </div>
      </div>
    </div>

    <!-- 训练设置 -->
    <div v-if="!isTraining" class="training-settings">
      <h2>训练设置</h2>
      <div class="settings-grid">
        <div class="setting-group">
          <label>默认凝视时间 (秒)</label>
          <input type="range" min="5" max="30" v-model="settings.defaultGazeTime">
          <span>{{ settings.defaultGazeTime }}s</span>
        </div>
        <div class="setting-group">
          <label>残像观察时间 (秒)</label>
          <input type="range" min="10" max="60" v-model="settings.afterimageTime">
          <span>{{ settings.afterimageTime }}s</span>
        </div>
        <div class="setting-group">
          <label>训练轮次</label>
          <select v-model="settings.rounds">
            <option value="5">5轮</option>
            <option value="10">10轮</option>
            <option value="15">15轮</option>
            <option value="20">20轮</option>
          </select>
        </div>
        <div class="setting-group">
          <label>背景颜色</label>
          <select v-model="settings.backgroundColor">
            <option value="white">白色</option>
            <option value="black">黑色</option>
            <option value="gray">灰色</option>
          </select>
        </div>
        <div class="setting-group">
          <label>音效提示</label>
          <input type="checkbox" v-model="settings.soundEnabled">
        </div>
        <div class="setting-group">
          <label>自动进入下一轮</label>
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
            <div class="stat-number">{{ overallStats.totalTime }}</div>
            <div class="stat-label">总训练时长(分钟)</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ overallStats.averageSuccess }}%</div>
            <div class="stat-label">平均成功率</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ overallStats.bestClarity }}</div>
            <div class="stat-label">最佳清晰度</div>
          </div>
        </div>
      </div>

      <!-- 不同模式表现 -->
      <div class="stats-section">
        <h3>不同模式表现</h3>
        <div class="mode-performance">
          <div v-for="mode in trainingModes" :key="mode.id" class="performance-item">
            <div class="mode-info">
              <div class="mode-name">{{ mode.name }}</div>
              <div class="mode-difficulty">{{ mode.difficulty }}</div>
            </div>
            <div class="performance-stats">
              <div class="stat">
                <div class="stat-label">次数</div>
                <div class="stat-value">{{ getModeStats(mode.id).count }}</div>
              </div>
              <div class="stat">
                <div class="stat-label">成功率</div>
                <div class="stat-value">{{ getModeStats(mode.id).successRate }}%</div>
              </div>
              <div class="stat">
                <div class="stat-label">平均清晰度</div>
                <div class="stat-value">{{ getModeStats(mode.id).avgClarity }}</div>
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
              <p>残像能力雷达图</p>
              <small>显示各项能力指标</small>
            </div>
          </div>
          <div class="ability-details">
            <div class="ability-item">
              <span class="ability-name">视觉记忆</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: abilityScores.visualMemory + '%' }"></div>
              </div>
              <span class="ability-score">{{ abilityScores.visualMemory }}</span>
            </div>
            <div class="ability-item">
              <span class="ability-name">图像保持</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: abilityScores.imageRetention + '%' }"></div>
              </div>
              <span class="ability-score">{{ abilityScores.imageRetention }}</span>
            </div>
            <div class="ability-item">
              <span class="ability-name">专注力</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: abilityScores.concentration + '%' }"></div>
              </div>
              <span class="ability-score">{{ abilityScores.concentration }}</span>
            </div>
            <div class="ability-item">
              <span class="ability-name">观察力</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: abilityScores.observation + '%' }"></div>
              </div>
              <span class="ability-score">{{ abilityScores.observation }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AfterImage',
  data() {
    return {
      // 训练状态
      isTraining: false,
      isPaused: false,
      trainingPhase: 'prepare', // prepare, gaze, afterimage, describe
      currentRound: 0,
      totalRounds: 10,
      
      // 时间控制
      gazeTime: 15,
      prepareCountdown: 3,
      gazeCountdown: 15,
      afterimageCountdown: 30,
      totalTime: 0,
      
      // 训练数据
      selectedMode: null,
      currentImage: {},
      observations: [],
      
      // 用户输入
      selectedColor: '',
      selectedShape: '',
      clarityRating: 5,
      additionalNotes: '',
      
      // 弹窗控制
      showCompletionModal: false,
      
      // 训练模式
      trainingModes: [
        {
          id: 'basic-color',
          name: '基础色彩',
          description: '使用纯色图形进行残像训练',
          icon: '🎨',
          difficulty: '初级',
          duration: 15,
          type: 'color'
        },
        {
          id: 'geometric-shapes',
          name: '几何图形',
          description: '使用几何图形进行残像训练',
          icon: '🔷',
          difficulty: '初级',
          duration: 20,
          type: 'shape'
        },
        {
          id: 'text-symbols',
          name: '文字符号',
          description: '使用文字和符号进行残像训练',
          icon: '📝',
          difficulty: '中级',
          duration: 25,
          type: 'text'
        },
        {
          id: 'complex-patterns',
          name: '复杂图案',
          description: '使用复杂图案进行残像训练',
          icon: '🌀',
          difficulty: '高级',
          duration: 30,
          type: 'pattern'
        }
      ],
      
      // 颜色选项
      colorOptions: [
        { name: '红色', value: '#ff0000' },
        { name: '绿色', value: '#00ff00' },
        { name: '蓝色', value: '#0000ff' },
        { name: '黄色', value: '#ffff00' },
        { name: '紫色', value: '#ff00ff' },
        { name: '青色', value: '#00ffff' },
        { name: '橙色', value: '#ff8000' },
        { name: '粉色', value: '#ff80ff' }
      ],
      
      // 形状选项
      shapeOptions: ['圆形', '方形', '三角形', '菱形', '星形', '十字形'],
      
      // 训练设置
      settings: {
        defaultGazeTime: 15,
        afterimageTime: 30,
        rounds: 10,
        backgroundColor: 'white',
        soundEnabled: true,
        autoNext: false
      },
      
      // 统计数据
      overallStats: {
        totalSessions: 0,
        totalTime: 0,
        averageSuccess: 0,
        bestClarity: 0
      },
      
      // 能力评分
      abilityScores: {
        visualMemory: 75,
        imageRetention: 68,
        concentration: 82,
        observation: 71
      },
      
      // 定时器
      timers: {
        prepare: null,
        gaze: null,
        afterimage: null,
        total: null
      }
    }
  },
  
  computed: {
    gazeProgress() {
      return ((this.gazeTime - this.gazeCountdown) / this.gazeTime) * 100
    },
    
    successRate() {
      if (this.observations.length === 0) return 0
      const successful = this.observations.filter(obs => obs.clarity >= 5).length
      return Math.round((successful / this.observations.length) * 100)
    },
    
    averageClarity() {
      if (this.observations.length === 0) return 0
      const total = this.observations.reduce((sum, obs) => sum + obs.clarity, 0)
      return (total / this.observations.length).toFixed(1)
    },
    
    trainingRating() {
      const rate = this.successRate
      if (rate >= 90) return 'S'
      if (rate >= 80) return 'A'
      if (rate >= 70) return 'B'
      if (rate >= 60) return 'C'
      return 'D'
    }
  },
  
  methods: {
    // 选择训练模式
    selectMode(mode) {
      this.selectedMode = mode
      this.gazeTime = mode.duration
      this.totalRounds = parseInt(this.settings.rounds)
    },
    
    // 开始训练
    startTraining() {
      if (!this.selectedMode) return
      
      this.isTraining = true
      this.currentRound = 0
      this.observations = []
      this.totalTime = 0
      this.startTotalTimer()
      this.nextRound()
    },
    
    // 下一轮训练
    nextRound() {
      if (this.currentRound >= this.totalRounds) {
        this.completeTraining()
        return
      }
      
      this.currentRound++
      this.generateImage()
      this.startPreparePhase()
    },
    
    // 生成训练图像
    generateImage() {
      const mode = this.selectedMode
      this.currentImage = {}
      
      switch (mode.type) {
        case 'color':
          this.currentImage.color = this.getRandomColor()
          break
        case 'shape':
          this.currentImage.color = this.getRandomColor()
          this.currentImage.shape = this.getRandomShape()
          break
        case 'text':
          this.currentImage.color = this.getRandomColor()
          this.currentImage.text = this.getRandomText()
          break
        case 'pattern':
          this.currentImage.color = this.getRandomColor()
          this.currentImage.pattern = this.getRandomPattern()
          break
      }
    },
    
    // 获取随机颜色
    getRandomColor() {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
      return colors[Math.floor(Math.random() * colors.length)]
    },
    
    // 获取随机形状
    getRandomShape() {
      const shapes = ['circle', 'square', 'triangle', 'diamond']
      return shapes[Math.floor(Math.random() * shapes.length)]
    },
    
    // 获取随机文字
    getRandomText() {
      const texts = ['A', 'B', 'C', '1', '2', '3', '★', '♦', '♠', '♣']
      return texts[Math.floor(Math.random() * texts.length)]
    },
    
    // 获取随机图案
    getRandomPattern() {
      const patterns = ['stripes', 'dots', 'waves', 'grid']
      return patterns[Math.floor(Math.random() * patterns.length)]
    },
    
    // 准备阶段
    startPreparePhase() {
      this.trainingPhase = 'prepare'
      this.prepareCountdown = 3
      
      this.timers.prepare = setInterval(() => {
        this.prepareCountdown--
        if (this.prepareCountdown <= 0) {
          clearInterval(this.timers.prepare)
          this.startGazePhase()
        }
      }, 1000)
    },
    
    // 凝视阶段
    startGazePhase() {
      this.trainingPhase = 'gaze'
      this.gazeCountdown = this.gazeTime
      
      this.timers.gaze = setInterval(() => {
        this.gazeCountdown--
        if (this.gazeCountdown <= 0) {
          clearInterval(this.timers.gaze)
          this.startAfterimagePhase()
        }
      }, 1000)
    },
    
    // 残像观察阶段
    startAfterimagePhase() {
      this.trainingPhase = 'afterimage'
      this.afterimageCountdown = this.settings.afterimageTime
      
      this.timers.afterimage = setInterval(() => {
        this.afterimageCountdown--
        if (this.afterimageCountdown <= 0) {
          clearInterval(this.timers.afterimage)
          this.startDescribePhase()
        }
      }, 1000)
    },
    
    // 描述阶段
    startDescribePhase() {
      this.trainingPhase = 'describe'
      this.resetInputs()
    },
    
    // 重置输入
    resetInputs() {
      this.selectedColor = ''
      this.selectedShape = ''
      this.clarityRating = 5
      this.additionalNotes = ''
    },
    
    // 记录观察结果
    recordObservation(type) {
      // 快速记录观察结果
      const observation = {
        round: this.currentRound,
        type: type,
        clarity: type === 'clear' ? 8 : type === 'partial' ? 5 : 2,
        timestamp: Date.now()
      }
      
      this.observations.push(observation)
      
      if (this.settings.autoNext) {
        setTimeout(() => this.nextRound(), 1000)
      } else {
        this.startDescribePhase()
      }
    },
    
    // 提交描述
    submitDescription() {
      const observation = {
        round: this.currentRound,
        image: { ...this.currentImage },
        response: {
          color: this.selectedColor,
          shape: this.selectedShape,
          clarity: parseInt(this.clarityRating),
          notes: this.additionalNotes
        },
        timestamp: Date.now()
      }
      
      this.observations.push(observation)
      this.nextRound()
    },
    
    // 调整凝视时间
    adjustGazeTime(delta) {
      this.gazeTime = Math.max(5, Math.min(30, this.gazeTime + delta))
    },
    
    // 暂停训练
    pauseTraining() {
      this.isPaused = true
      this.clearAllTimers()
    },
    
    // 继续训练
    resumeTraining() {
      this.isPaused = false
      // 根据当前阶段恢复对应的计时器
      switch (this.trainingPhase) {
        case 'prepare':
          this.startPreparePhase()
          break
        case 'gaze':
          this.startGazePhase()
          break
        case 'afterimage':
          this.startAfterimagePhase()
          break
      }
    },
    
    // 停止训练
    stopTraining() {
      this.clearAllTimers()
      this.completeTraining()
    },
    
    // 完成训练
    completeTraining() {
      this.clearAllTimers()
      this.showCompletionModal = true
      this.saveTrainingData()
    },
    
    // 重新开始训练
    restartTraining() {
      this.closeCompletionModal()
      this.startTraining()
    },
    
    // 关闭完成弹窗
    closeCompletionModal() {
      this.showCompletionModal = false
      this.isTraining = false
      this.trainingPhase = 'prepare'
    },
    
    // 清除所有定时器
    clearAllTimers() {
      Object.values(this.timers).forEach(timer => {
        if (timer) clearInterval(timer)
      })
    },
    
    // 开始总计时器
    startTotalTimer() {
      this.timers.total = setInterval(() => {
        this.totalTime++
      }, 1000)
    },
    
    // 格式化时间
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    // 获取模式统计
    getModeStats(modeId) {
      // 模拟数据，实际应从本地存储获取
      const stats = {
        'basic-color': { count: 15, successRate: 85, avgClarity: 7.2 },
        'geometric-shapes': { count: 12, successRate: 78, avgClarity: 6.8 },
        'text-symbols': { count: 8, successRate: 72, avgClarity: 6.5 },
        'complex-patterns': { count: 5, successRate: 65, avgClarity: 6.0 }
      }
      return stats[modeId] || { count: 0, successRate: 0, avgClarity: 0 }
    },
    
    // 保存训练数据
    saveTrainingData() {
      const trainingData = {
        mode: this.selectedMode.id,
        date: new Date().toISOString(),
        rounds: this.totalRounds,
        observations: this.observations,
        totalTime: this.totalTime,
        successRate: this.successRate,
        averageClarity: this.averageClarity,
        settings: { ...this.settings }
      }
      
      // 保存到本地存储
      const existingData = JSON.parse(localStorage.getItem('afterimage-training') || '[]')
      existingData.push(trainingData)
      localStorage.setItem('afterimage-training', JSON.stringify(existingData))
      
      // 更新统计数据
      this.updateOverallStats()
    },
    
    // 更新总体统计
    updateOverallStats() {
      const data = JSON.parse(localStorage.getItem('afterimage-training') || '[]')
      
      this.overallStats.totalSessions = data.length
      this.overallStats.totalTime = Math.round(data.reduce((sum, session) => sum + session.totalTime, 0) / 60)
      this.overallStats.averageSuccess = Math.round(data.reduce((sum, session) => sum + session.successRate, 0) / data.length) || 0
      this.overallStats.bestClarity = Math.max(...data.map(session => parseFloat(session.averageClarity))) || 0
    },
    
    // 加载训练数据
    loadTrainingData() {
      this.updateOverallStats()
    }
  },
  
  mounted() {
    this.loadTrainingData()
  },
  
  beforeUnmount() {
    this.clearAllTimers()
  }
}
</script>

<style scoped>
.after-image-container {
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

/* 残像显示区域 */
.afterimage-display {
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

/* 凝视阶段 */
.gaze-phase {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gaze-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.focus-point {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  z-index: 10;
}

.target-image {
  width: 300px;
  height: 300px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 20px rgba(255,255,255,0.3);
}

.image-shape {
  width: 150px;
  height: 150px;
  transition: all 0.3s ease;
}

.image-shape.circle {
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
}

.image-shape.square {
  background: rgba(255,255,255,0.9);
}

.image-shape.triangle {
  width: 0;
  height: 0;
  border-left: 75px solid transparent;
  border-right: 75px solid transparent;
  border-bottom: 130px solid rgba(255,255,255,0.9);
  background: none;
}

.image-shape.diamond {
  transform: rotate(45deg);
  background: rgba(255,255,255,0.9);
}

.image-text {
  font-size: 6rem;
  font-weight: bold;
  color: rgba(255,255,255,0.9);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.image-pattern {
  width: 200px;
  height: 200px;
  background: rgba(255,255,255,0.9);
}

.image-pattern.stripes {
  background: repeating-linear-gradient(
    45deg,
    rgba(255,255,255,0.9),
    rgba(255,255,255,0.9) 10px,
    transparent 10px,
    transparent 20px
  );
}

.image-pattern.dots {
  background: radial-gradient(circle, rgba(255,255,255,0.9) 20%, transparent 20%);
  background-size: 20px 20px;
}

.image-pattern.waves {
  background: repeating-linear-gradient(
    0deg,
    rgba(255,255,255,0.9),
    rgba(255,255,255,0.9) 5px,
    transparent 5px,
    transparent 15px
  );
}

.image-pattern.grid {
  background: 
    linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px);
  background-size: 20px 20px;
}

.gaze-timer {
  font-size: 2rem;
  color: #fff;
  font-weight: bold;
}

.gaze-instructions {
  text-align: center;
  color: #fff;
  margin-top: 20px;
}

.gaze-instructions p {
  margin-bottom: 15px;
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

/* 残像观察阶段 */
.afterimage-phase {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.afterimage-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.blank-screen {
  width: 300px;
  height: 300px;
  background: #fff;
  border-radius: 10px;
  border: 2px solid #333;
}

.afterimage-timer {
  font-size: 2rem;
  color: #fff;
  font-weight: bold;
}

.afterimage-instructions {
  text-align: center;
  color: #fff;
  margin-top: 20px;
}

.afterimage-instructions p {
  margin-bottom: 20px;
  opacity: 0.8;
}

.observation-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.observation-btn {
  padding: 12px 20px;
  border: 2px solid #fff;
  border-radius: 20px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.observation-btn:hover {
  background: #fff;
  color: #333;
}

/* 描述阶段 */
.describe-phase {
  color: #333;
}

.description-area {
  background: #fff;
  border-radius: 10px;
  padding: 30px;
}

.description-area h3 {
  text-align: center;
  margin-bottom: 25px;
  color: #667eea;
}

.description-questions {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 30px;
}

.question-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-item label {
  font-weight: bold;
  color: #333;
}

.color-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-btn {
  width: 40px;
  height: 40px;
  border: 3px solid #ddd;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.selected {
  border-color: #667eea;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.shape-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.shape-btn {
  padding: 10px 15px;
  border: 2px solid #ddd;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.shape-btn:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.shape-btn.selected {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.clarity-slider {
  display: flex;
  align-items: center;
  gap: 15px;
}

.clarity-slider input[type="range"] {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.clarity-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
}

.clarity-slider span {
  font-weight: bold;
  color: #667eea;
  min-width: 50px;
}

.question-item textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.question-item textarea:focus {
  outline: none;
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
  appearance: none;
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
  .after-image-container {
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
  
  .performance-item {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .performance-stats {
    justify-content: space-around;
  }
  
  .target-image {
    width: 250px;
    height: 250px;
  }
  
  .blank-screen {
    width: 250px;
    height: 250px;
  }
  
  .observation-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .color-options {
    justify-content: center;
  }
  
  .shape-options {
    justify-content: center;
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
  
  .target-image {
    width: 200px;
    height: 200px;
  }
  
  .blank-screen {
    width: 200px;
    height: 200px;
  }
  
  .countdown {
    font-size: 3rem;
  }
  
  .image-text {
    font-size: 4rem;
  }
}
</style>