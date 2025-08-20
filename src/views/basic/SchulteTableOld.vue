<template>
  <div class="schulte-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>舒尔特表训练</h1>
      <p class="page-description">
        舒尔特表是一种经典的注意力训练工具，通过按顺序寻找数字或字母，
        有效提升专注力、视觉搜索能力和眼球运动协调性。
      </p>
    </div>

    <!-- 训练模式选择 -->
    <div class="training-modes" v-if="!isTraining">
      <h3>选择训练模式</h3>
      <div class="modes-grid">
        <div 
          v-for="mode in trainingModes" 
          :key="mode.id"
          class="mode-card"
          :class="{ active: selectedMode === mode.id }"
          @click="selectMode(mode.id)"
        >
          <div class="mode-header">
            <span class="mode-icon">{{ mode.icon }}</span>
            <span class="mode-level" :class="mode.level">{{ mode.levelText }}</span>
          </div>
          <h4>{{ mode.name }}</h4>
          <p class="mode-description">{{ mode.description }}</p>
          
          <div class="mode-details">
            <div class="detail-item">
              <span class="detail-label">表格大小:</span>
              <span class="detail-value">{{ mode.gridSize }}×{{ mode.gridSize }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">内容类型:</span>
              <span class="detail-value">{{ mode.contentType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">难度等级:</span>
              <span class="detail-value">{{ mode.difficulty }}</span>
            </div>
          </div>

          <div class="mode-stats">
            <div class="stat-item">
              <span class="stat-label">最佳时间</span>
              <span class="stat-value">{{ mode.bestTime }}s</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均时间</span>
              <span class="stat-value">{{ mode.averageTime }}s</span>
            </div>
          </div>

          <button 
            class="start-mode-btn"
            @click.stop="startTraining(mode.id)"
          >
            开始训练
          </button>
        </div>
      </div>
    </div>

    <!-- 训练界面 -->
    <div class="training-interface" v-if="isTraining">
      <div class="training-card">
        <div class="training-header">
          <h3>{{ currentModeData.name }}</h3>
          <div class="training-info">
            <div class="info-item">
              <span class="info-label">当前目标:</span>
              <span class="info-value current-target">{{ currentTarget }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">用时:</span>
              <span class="info-value">{{ formatTime(elapsedTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">进度:</span>
              <span class="info-value">{{ foundCount }}/{{ totalCount }}</span>
            </div>
          </div>
          <div class="training-controls">
            <button class="control-btn" @click="pauseTraining" v-if="!isPaused && !isCompleted">
              ⏸️
            </button>
            <button class="control-btn" @click="resumeTraining" v-if="isPaused">
              ▶️
            </button>
            <button class="control-btn" @click="stopTraining">
              ⏹️
            </button>
          </div>
        </div>

        <!-- 舒尔特表格 -->
        <div class="schulte-grid-container" :class="{
          'timed-mode': currentModeData.id === 'timed3x3',
          'reverse-mode': currentModeData.id === 'reverse5x5',
          'random-mode': currentModeData.id === 'random4x4'
        }">
          <!-- 限时模式时间显示 -->
          <div v-if="currentModeData.id === 'timed3x3'" class="time-remaining" :class="{ 'time-warning': timedData.timeRemaining <= 10 }">
            ⏰ {{ timedData.timeRemaining }}s
          </div>
          
          <!-- 压力指示器 -->
          <div v-if="currentModeData.id === 'timed3x3'" class="time-pressure-indicator" :class="`pressure-level-${timedData.pressureLevel}`"></div>
          
          <div 
            class="schulte-grid"
            :class="`grid-${currentModeData.gridSize}x${currentModeData.gridSize}`"
          >
            <div 
              v-for="(cell, index) in gridCells" 
              :key="index"
              class="grid-cell"
              :class="{
                found: cell.found,
                current: cell.value === currentTarget,
                error: cell.error,
                hint: showHint && cell.value === currentTarget,
                'colorful-cell': currentModeData.id === 'colorful4x4' && cell.color
              }"
              :style="currentModeData.id === 'colorful4x4' && cell.color ? { backgroundColor: cell.color } : {}"
              @click="handleCellClick(cell, index)"
            >
              <span class="cell-content">{{ cell.display }}</span>
              <div class="cell-order" v-if="cell.found">{{ cell.order }}</div>
            </div>
          </div>
          
          <!-- 模式特定信息 -->
          <div v-if="currentModeData.id === 'reverse5x5'" class="mode-specific-info reverse-info">
            💡 倒序模式：从 {{ totalCount }} 开始，按倒序点击到 1
          </div>
          
          <div v-if="currentModeData.id === 'random4x4'" class="mode-specific-info random-info">
            💡 随机模式：按数字从小到大的顺序点击
          </div>
          
          <div v-if="currentModeData.id === 'timed3x3'" class="mode-specific-info timed-info">
            💡 限时模式：正确点击+2秒，错误点击-3秒
          </div>
          
          <div v-if="currentModeData.id === 'colorful4x4'" class="mode-specific-info colorful-info">
            💡 彩色模式：在彩色背景中找到正确的数字顺序
          </div>
        </div>

        <!-- 训练提示 -->
        <div class="training-hints" v-if="!isCompleted">
          <div class="hint-item">
            <span class="hint-icon">💡</span>
            <span class="hint-text">{{ getTrainingHint() }}</span>
          </div>
          <div class="hint-actions">
            <button class="hint-btn" @click="toggleHint" :class="{ active: showHint }">
              {{ showHint ? '关闭提示' : '显示提示' }}
            </button>
            <button class="hint-btn" @click="resetGrid">
              重新开始
            </button>
          </div>
        </div>

        <!-- 完成状态 -->
        <div class="completion-status" v-if="isCompleted">
          <div class="completion-message">
            <span class="completion-icon">🎉</span>
            <h4>训练完成！</h4>
            <p>用时: {{ formatTime(completionTime) }}</p>
          </div>
          
          <div class="completion-stats">
            <div class="stat-item">
              <span class="stat-label">总用时</span>
              <span class="stat-value">{{ formatTime(completionTime) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均每个</span>
              <span class="stat-value">{{ averageTimePerCell }}s</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">错误次数</span>
              <span class="stat-value">{{ errorCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">准确率</span>
              <span class="stat-value">{{ accuracy }}%</span>
            </div>
          </div>

          <div class="completion-actions">
            <button class="action-btn secondary" @click="stopTraining">
              返回选择
            </button>
            <button class="action-btn primary" @click="restartTraining">
              再次训练
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练设置 -->
    <div class="training-settings" v-if="!isTraining">
      <h3>训练设置</h3>
      <div class="settings-grid">
        <div class="setting-card">
          <h4>基础设置</h4>
          <div class="setting-item">
            <label>表格大小</label>
            <select class="select-input" v-model="settings.gridSize">
              <option value="3">3×3 (初级)</option>
              <option value="4">4×4 (中级)</option>
              <option value="5">5×5 (高级)</option>
              <option value="6">6×6 (专家)</option>
              <option value="7">7×7 (大师)</option>
            </select>
          </div>
          <div class="setting-item">
            <label>内容类型</label>
            <select class="select-input" v-model="settings.contentType">
              <option value="numbers">数字</option>
              <option value="letters">字母</option>
              <option value="mixed">数字+字母</option>
              <option value="chinese">中文数字</option>
            </select>
          </div>
          <div class="setting-item">
            <label>颜色模式</label>
            <select class="select-input" v-model="settings.colorMode">
              <option value="monochrome">单色</option>
              <option value="colorful">彩色</option>
              <option value="gradient">渐变</option>
            </select>
          </div>
        </div>

        <div class="setting-card">
          <h4>训练辅助</h4>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.showProgress"
              >
              显示进度
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.soundEffects"
              >
              声音效果
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.vibration"
              >
              震动反馈
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.autoNext"
              >
              自动下一关
            </label>
          </div>
        </div>

        <div class="setting-card">
          <h4>个性化</h4>
          <div class="setting-item">
            <label>字体大小</label>
            <div class="range-container">
              <input 
                type="range" 
                class="range-input"
                v-model="settings.fontSize"
                min="12"
                max="24"
              >
              <span class="range-value">{{ settings.fontSize }}px</span>
            </div>
          </div>
          <div class="setting-item">
            <label>动画速度</label>
            <div class="range-container">
              <input 
                type="range" 
                class="range-input"
                v-model="settings.animationSpeed"
                min="0.1"
                max="1"
                step="0.1"
              >
              <span class="range-value">{{ settings.animationSpeed }}x</span>
            </div>
          </div>
          <div class="setting-item">
            <label>主题色彩</label>
            <div class="color-options">
              <div 
                v-for="color in colorThemes" 
                :key="color.name"
                class="color-option"
                :class="{ active: settings.theme === color.name }"
                :style="{ backgroundColor: color.primary }"
                @click="settings.theme = color.name"
              >
                <span class="color-name">{{ color.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练统计 -->
    <div class="training-statistics" v-if="!isTraining">
      <h3>训练统计</h3>
      <div class="stats-grid">
        <div class="stats-card">
          <h4>总体表现</h4>
          <div class="stats-overview">
            <div class="stat-item">
              <span class="stat-icon">🎯</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.totalGames }}</span>
                <span class="stat-label">总训练次数</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⏱️</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.bestTime }}s</span>
                <span class="stat-label">最佳时间</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📊</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.averageTime }}s</span>
                <span class="stat-label">平均时间</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">✅</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.averageAccuracy }}%</span>
                <span class="stat-label">平均准确率</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>不同规格表现</h4>
          <div class="grid-performance">
            <div 
              v-for="grid in statistics.gridPerformance" 
              :key="grid.size"
              class="grid-stat"
            >
              <div class="grid-header">
                <span class="grid-size">{{ grid.size }}×{{ grid.size }}</span>
                <span class="grid-level">{{ grid.level }}</span>
              </div>
              <div class="grid-details">
                <div class="detail-row">
                  <span class="detail-label">最佳:</span>
                  <span class="detail-value">{{ grid.bestTime }}s</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">平均:</span>
                  <span class="detail-value">{{ grid.averageTime }}s</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">次数:</span>
                  <span class="detail-value">{{ grid.attempts }}</span>
                </div>
              </div>
              <div class="grid-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: grid.mastery + '%' }"
                  ></div>
                </div>
                <span class="progress-text">熟练度: {{ grid.mastery }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>进步趋势</h4>
          <div class="progress-chart">
            <div class="chart-container">
              <div class="chart-bars">
                <div 
                  v-for="(data, index) in statistics.progressData" 
                  :key="index"
                  class="chart-bar"
                  :style="{ height: (100 - data.time / statistics.maxTime * 100) + '%' }"
                  :title="`第${index + 1}次: ${data.time}s`"
                >
                  <span class="bar-label">{{ index + 1 }}</span>
                </div>
              </div>
              <div class="chart-axis">
                <span class="axis-label">训练次数</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>能力分析</h4>
          <div class="ability-analysis">
            <div class="analysis-item">
              <span class="analysis-label">视觉搜索</span>
              <div class="analysis-bar">
                <div 
                  class="analysis-fill" 
                  :style="{ width: statistics.visualSearch + '%' }"
                ></div>
              </div>
              <span class="analysis-value">{{ statistics.visualSearch }}%</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">专注力</span>
              <div class="analysis-bar">
                <div 
                  class="analysis-fill" 
                  :style="{ width: statistics.concentration + '%' }"
                ></div>
              </div>
              <span class="analysis-value">{{ statistics.concentration }}%</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">反应速度</span>
              <div class="analysis-bar">
                <div 
                  class="analysis-fill" 
                  :style="{ width: statistics.reactionSpeed + '%' }"
                ></div>
              </div>
              <span class="analysis-value">{{ statistics.reactionSpeed }}%</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">准确性</span>
              <div class="analysis-bar">
                <div 
                  class="analysis-fill" 
                  :style="{ width: statistics.accuracy + '%' }"
                ></div>
              </div>
              <span class="analysis-value">{{ statistics.accuracy }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useBasicTraining, useBasicTrainingSettings, useBasicTrainingStats } from '@/composables/useBasicTraining'
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'SchulteTable',
  setup() {
    // 使用统一的基础训练管理
    const trainingManager = useBasicTraining('schulte_table')
    const settingsManager = useBasicTrainingSettings(trainingManager)
    const statsManager = useBasicTrainingStats(trainingManager)
    
    // 舒尔特表特有的状态
    const selectedMode = ref(null)
    const currentTarget = ref(1)
    const foundCount = ref(0)
    const totalCount = ref(0)
    const completionTime = ref(0)
    const errorCount = ref(0)
    const showHint = ref(false)
    const gridCells = ref([])
    const currentModeData = ref({})
      
      // 训练模式
      trainingModes: [
        {
          id: 'basic3x3',
          name: '基础训练',
          icon: '🔢',
          level: 'beginner',
          levelText: '初级',
          description: '3×3数字表格，适合初学者建立基础',
          gridSize: 3,
          contentType: '数字',
          difficulty: '简单',
          bestTime: 25.6,
          averageTime: 32.4
        },
        {
          id: 'standard4x4',
          name: '标准训练',
          icon: '📊',
          level: 'intermediate',
          levelText: '中级',
          description: '4×4数字表格，标准的舒尔特表训练',
          gridSize: 4,
          contentType: '数字',
          difficulty: '中等',
          bestTime: 45.2,
          averageTime: 58.7
        },
        {
          id: 'advanced5x5',
          name: '进阶训练',
          icon: '🎯',
          level: 'advanced',
          levelText: '高级',
          description: '5×5数字表格，挑战更高难度',
          gridSize: 5,
          contentType: '数字',
          difficulty: '困难',
          bestTime: 78.9,
          averageTime: 95.3
        },
        {
          id: 'letters4x4',
          name: '字母训练',
          icon: '🔤',
          level: 'intermediate',
          levelText: '中级',
          description: '4×4字母表格，训练字母识别能力',
          gridSize: 4,
          contentType: '字母',
          difficulty: '中等',
          bestTime: 52.1,
          averageTime: 64.8
        },
        {
          id: 'mixed5x5',
          name: '混合训练',
          icon: '🔀',
          level: 'advanced',
          levelText: '高级',
          description: '5×5数字字母混合，综合训练',
          gridSize: 5,
          contentType: '混合',
          difficulty: '困难',
          bestTime: 89.7,
          averageTime: 108.2
        },
        {
          id: 'expert6x6',
          name: '专家训练',
          icon: '🏆',
          level: 'expert',
          levelText: '专家',
          description: '6×6数字表格，专家级挑战',
          gridSize: 6,
          contentType: '数字',
          difficulty: '极难',
          bestTime: 125.4,
          averageTime: 156.8
        },
        {
          id: 'colorful4x4',
          name: '彩色舒尔特表',
          icon: '🌈',
          level: 'intermediate',
          levelText: '中级',
          description: '4×4彩色数字表格，训练颜色识别与数字搜索',
          gridSize: 4,
          contentType: '彩色数字',
          difficulty: '中等',
          bestTime: 48.3,
          averageTime: 58.7
        },
        {
          id: 'reverse5x5',
          name: '倒序舒尔特表',
          icon: '🔄',
          level: 'advanced',
          levelText: '高级',
          description: '5×5倒序数字表格，从大到小寻找数字',
          gridSize: 5,
          contentType: '倒序数字',
          difficulty: '困难',
          bestTime: 92.1,
          averageTime: 112.5
        },
        {
          id: 'random4x4',
          name: '随机舒尔特表',
          icon: '🎲',
          level: 'advanced',
          levelText: '高级',
          description: '4×4随机数字表格，数字随机分布无规律',
          gridSize: 4,
          contentType: '随机数字',
          difficulty: '困难',
          bestTime: 56.8,
          averageTime: 69.3
        },
        {
          id: 'timed3x3',
          name: '时间压力舒尔特表',
          icon: '⏰',
          level: 'expert',
          levelText: '专家',
          description: '3×3限时数字表格，在时间压力下完成挑战',
          gridSize: 3,
          contentType: '限时数字',
          difficulty: '极难',
          bestTime: 15.2,
          averageTime: 22.8
        }
      ],
      
      // 当前训练数据
      currentModeData: {},
      gridCells: [],
      
      // 新训练模式数据
      colorfulData: {
        colors: ['#FF5722', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#795548'],
        currentColorIndex: 0
      },
      
      reverseData: {
        isReverse: false,
        maxNumber: 25
      },
      
      randomData: {
        randomNumbers: [],
        targetSequence: []
      },
      
      timedData: {
        timeLimit: 30,
        timeRemaining: 30,
        pressureLevel: 1,
        bonusTime: 0
      },
      
      // 训练设置
      settings: {
        gridSize: 4,
        contentType: 'numbers',
        colorMode: 'monochrome',
        showProgress: true,
        soundEffects: true,
        vibration: false,
        autoNext: false,
        fontSize: 16,
        animationSpeed: 0.5,
        theme: 'blue'
      },
      
      // 颜色主题
      colorThemes: [
        { name: 'blue', primary: '#2196F3' },
        { name: 'green', primary: '#4CAF50' },
        { name: 'purple', primary: '#9C27B0' },
        { name: 'orange', primary: '#FF9800' },
        { name: 'red', primary: '#F44336' }
      ],
      
      // 统计数据
      statistics: {
        totalGames: 156,
        bestTime: 23.8,
        averageTime: 45.6,
        averageAccuracy: 94,
        maxTime: 120,
        visualSearch: 88,
        concentration: 85,
        reactionSpeed: 82,
        accuracy: 94,
        gridPerformance: [
          {
            size: 3,
            level: '初级',
            bestTime: 18.5,
            averageTime: 24.3,
            attempts: 45,
            mastery: 95
          },
          {
            size: 4,
            level: '中级',
            bestTime: 35.2,
            averageTime: 42.8,
            attempts: 67,
            mastery: 88
          },
          {
            size: 5,
            level: '高级',
            bestTime: 68.9,
            averageTime: 78.5,
            attempts: 34,
            mastery: 75
          },
          {
            size: 6,
            level: '专家',
            bestTime: 125.4,
            averageTime: 145.2,
            attempts: 10,
            mastery: 45
          }
        ],
        progressData: [
          { time: 65.2 },
          { time: 58.7 },
          { time: 52.3 },
          { time: 48.9 },
          { time: 45.6 },
          { time: 42.1 },
          { time: 38.8 },
          { time: 36.5 },
          { time: 34.2 },
          { time: 32.8 }
        ]
      },
      
      // 定时器
      gameTimer: null,
      startTime: null
    }
  },
  
  computed: {
    averageTimePerCell() {
      return this.totalCount > 0 ? (this.completionTime / this.totalCount).toFixed(1) : 0
    },
    
    accuracy() {
      const totalClicks = this.foundCount + this.errorCount
      return totalClicks > 0 ? Math.round((this.foundCount / totalClicks) * 100) : 100
    }
  },
  
  methods: {
    // 选择训练模式
    selectMode(modeId) {
      this.selectedMode = modeId
    },
    
    // 开始训练
    startTraining(modeId) {
      this.selectedMode = modeId
      this.currentModeData = this.trainingModes.find(mode => mode.id === modeId)
      
      this.resetTrainingState()
      this.generateGrid()
      this.isTraining = true
      this.startTimer()
    },
    
    // 暂停训练
    pauseTraining() {
      this.isPaused = true
      this.stopTimer()
    },
    
    // 恢复训练
    resumeTraining() {
      this.isPaused = false
      this.startTimer()
    },
    
    // 停止训练
    stopTraining() {
      this.stopTimer()
      this.isTraining = false
      this.isPaused = false
      this.isCompleted = false
    },
    
    // 重新开始训练
    restartTraining() {
      this.resetTrainingState()
      this.generateGrid()
      this.startTimer()
    },
    
    // 重置网格
    resetGrid() {
      this.resetTrainingState()
      this.generateGrid()
      this.startTimer()
    },
    
    // 生成网格
    generateGrid() {
      const size = this.currentModeData.gridSize
      this.totalCount = size * size
      this.gridCells = []
      
      // 根据训练模式生成不同内容
      switch (this.currentModeData.id) {
        case 'colorful4x4':
          this.generateColorfulGrid()
          break
        case 'reverse5x5':
          this.generateReverseGrid()
          break
        case 'random4x4':
          this.generateRandomGrid()
          break
        case 'timed3x3':
          this.generateTimedGrid()
          break
        default:
          this.generateStandardGrid()
          break
      }
    },
    
    // 生成标准网格
    generateStandardGrid() {
      // 生成内容数组
      let content = []
      if (this.currentModeData.contentType === '数字') {
        content = Array.from({ length: this.totalCount }, (_, i) => i + 1)
      } else if (this.currentModeData.contentType === '字母') {
        content = Array.from({ length: this.totalCount }, (_, i) => 
          String.fromCharCode(65 + i) // A, B, C...
        )
      } else if (this.currentModeData.contentType === '混合') {
        const half = Math.floor(this.totalCount / 2)
        const numbers = Array.from({ length: half }, (_, i) => i + 1)
        const letters = Array.from({ length: this.totalCount - half }, (_, i) => 
          String.fromCharCode(65 + i)
        )
        content = [...numbers, ...letters]
      }
      
      // 打乱顺序
      content = this.shuffleArray(content)
      
      // 创建网格单元
      for (let i = 0; i < this.totalCount; i++) {
        this.gridCells.push({
          value: i + 1, // 实际值（用于排序）
          display: content[i], // 显示值
          found: false,
          error: false,
          order: null,
          color: null
        })
      }
      
      // 设置当前目标
      this.currentTarget = 1
    },
    
    // 生成彩色网格
    generateColorfulGrid() {
      let content = []
      for (let i = 1; i <= this.totalCount; i++) {
        content.push(i.toString())
      }
      
      content = this.shuffleArray(content)
      
      for (let i = 0; i < this.totalCount; i++) {
        const colorIndex = Math.floor(Math.random() * this.colorfulData.colors.length)
        this.gridCells.push({
          value: i + 1,
          display: content[i],
          found: false,
          error: false,
          order: null,
          color: this.colorfulData.colors[colorIndex]
        })
      }
      
      this.currentTarget = 1
    },
    
    // 生成倒序网格
    generateReverseGrid() {
      this.reverseData.isReverse = true
      this.reverseData.maxNumber = this.totalCount
      
      let content = []
      for (let i = 1; i <= this.totalCount; i++) {
        content.push(i.toString())
      }
      
      content = this.shuffleArray(content)
      
      for (let i = 0; i < this.totalCount; i++) {
        this.gridCells.push({
          value: this.totalCount - i, // 倒序值
          display: content[i],
          found: false,
          error: false,
          order: null,
          color: null
        })
      }
      
      this.currentTarget = this.totalCount // 从最大数开始
    },
    
    // 生成随机网格
    generateRandomGrid() {
      // 生成随机数字序列
      const randomNums = []
      const usedNums = new Set()
      
      while (randomNums.length < this.totalCount) {
        const num = Math.floor(Math.random() * 50) + 1
        if (!usedNums.has(num)) {
          randomNums.push(num)
          usedNums.add(num)
        }
      }
      
      this.randomData.randomNumbers = [...randomNums]
      this.randomData.targetSequence = randomNums.sort((a, b) => a - b)
      
      const shuffledNums = this.shuffleArray([...randomNums])
      
      for (let i = 0; i < this.totalCount; i++) {
        this.gridCells.push({
          value: this.randomData.targetSequence.indexOf(randomNums[i]) + 1,
          display: shuffledNums[i].toString(),
          found: false,
          error: false,
          order: null,
          color: null,
          actualNumber: randomNums[i]
        })
      }
      
      this.currentTarget = 1
    },
    
    // 生成限时网格
    generateTimedGrid() {
      this.timedData.timeRemaining = this.timedData.timeLimit
      this.timedData.pressureLevel = 1
      
      let content = []
      for (let i = 1; i <= this.totalCount; i++) {
        content.push(i.toString())
      }
      
      content = this.shuffleArray(content)
      
      for (let i = 0; i < this.totalCount; i++) {
        this.gridCells.push({
          value: i + 1,
          display: content[i],
          found: false,
          error: false,
          order: null,
          color: null
        })
      }
      
      this.currentTarget = 1
      this.startTimedMode()
    },
    
    // 处理单元格点击
    handleCellClick(cell, index) {
      if (this.isPaused || this.isCompleted || cell.found) return
      
      // 根据训练模式处理点击
      switch (this.currentModeData.id) {
        case 'reverse5x5':
          this.handleReverseClick(cell)
          break
        case 'random4x4':
          this.handleRandomClick(cell)
          break
        case 'timed3x3':
          this.handleTimedClick(cell)
          break
        default:
          this.handleStandardClick(cell)
          break
      }
    },
    
    // 处理标准模式点击
    handleStandardClick(cell) {
      if (cell.value === this.currentTarget) {
        // 正确点击
        cell.found = true
        cell.order = this.foundCount + 1
        this.foundCount++
        this.currentTarget++
        
        // 播放成功音效
        if (this.settings.soundEffects) {
          this.playSuccessSound()
        }
        
        // 震动反馈
        if (this.settings.vibration && navigator.vibrate) {
          navigator.vibrate(50)
        }
        
        // 检查是否完成
        if (this.foundCount === this.totalCount) {
          this.completeTraining()
        }
      } else {
        // 错误点击
        this.errorCount++
        cell.error = true
        
        // 播放错误音效
        if (this.settings.soundEffects) {
          this.playErrorSound()
        }
        
        // 清除错误状态
        setTimeout(() => {
          cell.error = false
        }, 500)
      }
    },
    
    // 处理倒序模式点击
    handleReverseClick(cell) {
      if (cell.value === this.currentTarget) {
        cell.found = true
        cell.order = this.foundCount + 1
        this.foundCount++
        this.currentTarget--
        
        if (this.settings.soundEffects) {
          this.playSuccessSound()
        }
        
        if (this.settings.vibration && navigator.vibrate) {
          navigator.vibrate(50)
        }
        
        if (this.foundCount === this.totalCount) {
          this.completeTraining()
        }
      } else {
        this.errorCount++
        cell.error = true
        
        if (this.settings.soundEffects) {
          this.playErrorSound()
        }
        
        setTimeout(() => {
          cell.error = false
        }, 500)
      }
    },
    
    // 处理随机模式点击
    handleRandomClick(cell) {
      const expectedNumber = this.randomData.targetSequence[this.foundCount]
      if (cell.actualNumber === expectedNumber) {
        cell.found = true
        cell.order = this.foundCount + 1
        this.foundCount++
        
        if (this.settings.soundEffects) {
          this.playSuccessSound()
        }
        
        if (this.settings.vibration && navigator.vibrate) {
          navigator.vibrate(50)
        }
        
        if (this.foundCount === this.totalCount) {
          this.completeTraining()
        }
      } else {
        this.errorCount++
        cell.error = true
        
        if (this.settings.soundEffects) {
          this.playErrorSound()
        }
        
        setTimeout(() => {
          cell.error = false
        }, 500)
      }
    },
    
    // 处理限时模式点击
    handleTimedClick(cell) {
      if (cell.value === this.currentTarget) {
        cell.found = true
        cell.order = this.foundCount + 1
        this.foundCount++
        this.currentTarget++
        
        // 时间奖励
        this.timedData.timeRemaining += 2
        
        if (this.settings.soundEffects) {
          this.playSuccessSound()
        }
        
        if (this.settings.vibration && navigator.vibrate) {
          navigator.vibrate(50)
        }
        
        if (this.foundCount === this.totalCount) {
          this.completeTraining()
        }
      } else {
        this.errorCount++
        cell.error = true
        
        // 时间惩罚
        this.timedData.timeRemaining -= 3
        
        if (this.settings.soundEffects) {
          this.playErrorSound()
        }
        
        setTimeout(() => {
          cell.error = false
        }, 500)
      }
    },
    
    // 完成训练
    completeTraining() {
      this.stopTimer()
      this.completionTime = this.elapsedTime
      this.isCompleted = true
      
      // 播放完成音效
      if (this.settings.soundEffects) {
        this.playCompletionSound()
      }
      
      // 保存成绩
      this.saveResult()
    },
    
    // 开始计时
    startTimer() {
      this.startTime = Date.now() - this.elapsedTime * 1000
      this.gameTimer = setInterval(() => {
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000)
      }, 100)
    },
    
    // 停止计时
    stopTimer() {
      if (this.gameTimer) {
        clearInterval(this.gameTimer)
        this.gameTimer = null
      }
      this.stopTimedMode()
    },
    
    // 开始限时模式
    startTimedMode() {
      this.timedData.pressureTimer = setInterval(() => {
        this.timedData.timeRemaining--
        
        // 更新压力等级
        const progress = (this.timedData.timeLimit - this.timedData.timeRemaining) / this.timedData.timeLimit
        if (progress > 0.8) {
          this.timedData.pressureLevel = 3
        } else if (progress > 0.5) {
          this.timedData.pressureLevel = 2
        }
        
        // 时间用完
        if (this.timedData.timeRemaining <= 0) {
          this.stopTraining()
        }
      }, 1000)
    },
    
    // 停止限时模式
    stopTimedMode() {
      if (this.timedData.pressureTimer) {
        clearInterval(this.timedData.pressureTimer)
        this.timedData.pressureTimer = null
      }
    },
    
    // 重置训练状态
    resetTrainingState() {
      this.currentTarget = 1
      this.foundCount = 0
      this.elapsedTime = 0
      this.completionTime = 0
      this.errorCount = 0
      this.isCompleted = false
      this.showHint = false
      this.stopTimer()
    },
    
    // 切换提示
    toggleHint() {
      this.showHint = !this.showHint
    },
    
    // 获取训练提示
    getTrainingHint() {
      const hints = [
        '保持眼球快速移动，不要停留在一个位置太久',
        '用余光扫描整个表格，寻找目标数字',
        '建立有序的搜索模式，避免重复查看',
        '放松心态，保持稳定的节奏',
        '专注于当前目标，不要被其他数字干扰'
      ]
      return hints[Math.floor(Math.random() * hints.length)]
    },
    
    // 播放音效
    playSuccessSound() {
      // 简单的音效实现
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    },
    
    playErrorSound() {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    },
    
    playCompletionSound() {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // 播放一系列上升音调
      const frequencies = [523, 659, 784, 1047] // C, E, G, C
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        const startTime = audioContext.currentTime + index * 0.15
        oscillator.frequency.setValueAtTime(freq, startTime)
        gainNode.gain.setValueAtTime(0.1, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + 0.3)
      })
    },
    
    // 保存结果
    saveResult() {
      const result = {
        mode: this.currentModeData.id,
        gridSize: this.currentModeData.gridSize,
        time: this.completionTime,
        accuracy: this.accuracy,
        errors: this.errorCount,
        date: new Date().toISOString()
      }
      
      // 保存到本地存储
      const results = JSON.parse(localStorage.getItem('schulteResults') || '[]')
      results.push(result)
      localStorage.setItem('schulteResults', JSON.stringify(results))
      
      // 更新统计数据
      this.updateStatistics(result)
    },
    
    // 更新统计数据
    updateStatistics(result) {
      // 这里可以实现更复杂的统计逻辑
      if (result.time < this.statistics.bestTime) {
        this.statistics.bestTime = result.time
      }
      
      this.statistics.totalGames++
      this.saveStatistics()
    },
    
    // 工具函数
    shuffleArray(array) {
      const newArray = [...array]
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
      }
      return newArray
    },
    
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = (seconds % 60).toFixed(1)
      return mins > 0 ? `${mins}:${secs.padStart(4, '0')}` : `${secs}s`
    },
    
    // 保存设置
    saveSettings() {
      localStorage.setItem('schulteSettings', JSON.stringify(this.settings))
    },
    
    // 加载设置
    loadSettings() {
      const saved = localStorage.getItem('schulteSettings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    },
    
    // 保存统计数据
    saveStatistics() {
      localStorage.setItem('schulteStats', JSON.stringify(this.statistics))
    },
    
    // 加载统计数据
    loadStatistics() {
      const saved = localStorage.getItem('schulteStats')
      if (saved) {
        this.statistics = { ...this.statistics, ...JSON.parse(saved) }
      }
    }
  },
  
  mounted() {
    this.loadSettings()
    this.loadStatistics()
  },
  
  beforeUnmount() {
    this.stopTimer()
  },
  
  watch: {
    settings: {
      handler() {
        this.saveSettings()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.schulte-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 训练模式选择 */
.training-modes {
  margin-bottom: 40px;
}

.training-modes h3 {
  color: white;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.mode-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
}

.mode-card.active {
  border: 3px solid #4CAF50;
  transform: translateY(-3px);
}

.mode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.mode-icon {
  font-size: 2rem;
}

.mode-level {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.mode-level.beginner {
  background: #E8F5E8;
  color: #4CAF50;
}

.mode-level.intermediate {
  background: #FFF3E0;
  color: #FF9800;
}

.mode-level.advanced {
  background: #FCE4EC;
  color: #E91E63;
}

.mode-level.expert {
  background: #F3E5F5;
  color: #9C27B0;
}

.mode-card h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.3rem;
}

.mode-description {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.mode-details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-label {
  color: #888;
  font-size: 0.9rem;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.mode-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.start-mode-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-mode-btn:hover {
  background: linear-gradient(45deg, #45a049, #4CAF50);
  transform: translateY(-2px);
}

/* 训练界面 */
.training-interface {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.training-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  max-width: 800px;
  width: 100%;
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.training-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.training-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
}

.info-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.current-target {
  color: #4CAF50;
  font-size: 1.3rem;
}

.training-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.control-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

/* 舒尔特表格 */
.schulte-grid-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.schulte-grid {
  display: grid;
  gap: 8px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 15px;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
}

.grid-3x3 {
  grid-template-columns: repeat(3, 80px);
  grid-template-rows: repeat(3, 80px);
}

.grid-4x4 {
  grid-template-columns: repeat(4, 70px);
  grid-template-rows: repeat(4, 70px);
}

.grid-5x5 {
  grid-template-columns: repeat(5, 60px);
  grid-template-rows: repeat(5, 60px);
}

.grid-6x6 {
  grid-template-columns: repeat(6, 50px);
  grid-template-rows: repeat(6, 50px);
}

.grid-7x7 {
  grid-template-columns: repeat(7, 45px);
  grid-template-rows: repeat(7, 45px);
}

.grid-cell {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  user-select: none;
}

.grid-cell:hover {
  border-color: #4CAF50;
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.grid-cell.found {
  background: #E8F5E8;
  border-color: #4CAF50;
  color: #4CAF50;
}

.grid-cell.current {
  border-color: #2196F3;
  background: #E3F2FD;
  animation: pulse 1s infinite;
}

.grid-cell.error {
  background: #FFEBEE;
  border-color: #F44336;
  animation: shake 0.5s;
}

.grid-cell.hint {
  background: #FFF3E0;
  border-color: #FF9800;
  animation: glow 1s infinite alternate;
}

.cell-content {
  font-size: 1.2rem;
  font-weight: bold;
}

.cell-order {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

/* 训练提示 */
.training-hints {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.hint-icon {
  font-size: 1.2rem;
}

.hint-text {
  color: #666;
  line-height: 1.5;
}

.hint-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.hint-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hint-btn:hover {
  background: #f0f0f0;
}

.hint-btn.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

/* 完成状态 */
.completion-status {
  text-align: center;
}

.completion-message {
  margin-bottom: 25px;
}

.completion-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  display: block;
}

.completion-message h4 {
  margin: 0 0 10px 0;
  color: #4CAF50;
  font-size: 1.5rem;
}

.completion-message p {
  color: #666;
  font-size: 1.1rem;
}

.completion-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.completion-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #4CAF50;
  color: white;
}

.action-btn.secondary {
  background: #f0f0f0;
  color: #333;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

/* 训练设置 */
.training-settings {
  margin-bottom: 40px;
}

.training-settings h3 {
  color: white;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.setting-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.setting-card h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.select-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.range-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.range-input {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
}

.range-value {
  min-width: 50px;
  text-align: center;
  font-weight: bold;
  color: #333;
}

.color-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-option.active {
  border-color: #333;
  transform: scale(1.1);
}

.color-name {
  font-size: 0.7rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

/* 训练统计 */
.training-statistics {
  margin-bottom: 40px;
}

.training-statistics h3 {
  color: white;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.stats-card h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.stats-overview .stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.grid-performance {
  display: grid;
  gap: 15px;
}

.grid-stat {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.grid-size {
  font-weight: bold;
  color: #333;
}

.grid-level {
  padding: 2px 8px;
  background: #e0e0e0;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #666;
}

.grid-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grid-progress {
  margin-top: 10px;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #666;
}

.progress-chart {
  height: 200px;
  position: relative;
}

.chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: end;
  gap: 5px;
  padding: 10px 0;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #4CAF50, #81C784);
  border-radius: 3px 3px 0 0;
  min-height: 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-bar:hover {
  background: linear-gradient(to top, #45a049, #66BB6A);
}

.bar-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: #666;
}

.chart-axis {
  text-align: center;
  padding-top: 10px;
  border-top: 1px solid #e0e0e0;
}

.axis-label {
  font-size: 0.8rem;
  color: #666;
}

.ability-analysis {
  display: grid;
  gap: 15px;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.analysis-label {
  min-width: 80px;
  font-size: 0.9rem;
  color: #666;
}

.analysis-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.analysis-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
}

.analysis-value {
  min-width: 40px;
  text-align: right;
  font-weight: bold;
  color: #333;
}

/* 动画效果 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(255, 152, 0, 0.5); }
  100% { box-shadow: 0 0 20px rgba(255, 152, 0, 0.8); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .schulte-container {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .modes-grid {
    grid-template-columns: 1fr;
  }
  
  .training-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .training-info {
    justify-content: space-around;
  }
  
  .grid-3x3 {
    grid-template-columns: repeat(3, 60px);
    grid-template-rows: repeat(3, 60px);
  }
  
  .grid-4x4 {
    grid-template-columns: repeat(4, 50px);
    grid-template-rows: repeat(4, 50px);
  }
  
  .grid-5x5 {
    grid-template-columns: repeat(5, 45px);
    grid-template-rows: repeat(5, 45px);
  }
  
  .grid-6x6 {
    grid-template-columns: repeat(6, 35px);
    grid-template-rows: repeat(6, 35px);
  }
  
  .grid-7x7 {
    grid-template-columns: repeat(7, 30px);
    grid-template-rows: repeat(7, 30px);
  }
  
  .settings-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .completion-actions {
    flex-direction: column;
  }
  
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 新训练模式样式 */
.colorful-cell {
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.reverse-mode .current-target {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
}

.random-mode .grid-cell {
  font-size: 0.9rem;
}

.random-mode .current-target {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
}

.timed-mode {
  position: relative;
}

.time-pressure-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4CAF50, #FFC107, #F44336);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.pressure-level-1 {
  background: #4CAF50;
}

.pressure-level-2 {
  background: #FFC107;
  animation: pulse 1s infinite;
}

.pressure-level-3 {
  background: #F44336;
  animation: pulse 0.5s infinite;
}

.time-remaining {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-weight: bold;
  font-size: 0.9rem;
}

.time-warning {
  color: #F44336;
  animation: shake 0.5s infinite;
}

.mode-specific-info {
  margin-top: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;
}

.reverse-info {
  background: rgba(255, 107, 107, 0.1);
  border-left: 3px solid #ff6b6b;
}

.random-info {
  background: rgba(78, 205, 196, 0.1);
  border-left: 3px solid #4ecdc4;
}

.timed-info {
  background: rgba(255, 193, 7, 0.1);
  border-left: 3px solid #FFC107;
}

.colorful-info {
   background: linear-gradient(45deg, rgba(255, 0, 150, 0.1), rgba(0, 204, 255, 0.1));
   border-left: 3px solid #ff0096;
 }

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .training-card {
    padding: 20px;
  }
  
  .grid-3x3 {
    grid-template-columns: repeat(3, 50px);
    grid-template-rows: repeat(3, 50px);
  }
  
  .grid-4x4 {
    grid-template-columns: repeat(4, 40px);
    grid-template-rows: repeat(4, 40px);
  }
  
  .grid-5x5 {
    grid-template-columns: repeat(5, 35px);
    grid-template-rows: repeat(5, 35px);
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
}
</style>