<template>
  <div class="schulte-container">

    <!-- 加载状态 -->
    <div v-if="trainingManager.isLoading.value" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载训练数据...</p>
    </div>

    <!-- 训练模式选择 -->
    <div class="training-modes" v-else-if="!trainingManager.isTraining.value">
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
    <div class="training-interface" v-else>
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
              <span class="info-value">{{ trainingManager.formatDuration(trainingManager.sessionProgress.value) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">进度:</span>
              <span class="info-value">{{ foundCount }}/{{ totalCount }}</span>
            </div>
          </div>
          <div class="training-controls">
            <button class="control-btn" @click="pauseTraining" v-if="trainingManager.canPauseTraining.value">
              ⏸️
            </button>
            <button class="control-btn" @click="resumeTraining" v-if="trainingManager.canResumeTraining.value">
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
          'reverse-mode': currentModeData.id === 'reverse4x4',
          'random-mode': currentModeData.id === 'random4x4',
          'colorful-mode': currentModeData.id === 'colorful3x3'
        }">
          <!-- 限时模式时间显示 -->
          <div v-if="currentModeData.id === 'timed3x3'" class="timed-info">
            <div class="time-remaining">剩余时间: {{ timedData.timeRemaining }}s</div>
            <div class="pressure-indicator" :class="'level-' + timedData.pressureLevel"></div>
          </div>

          <div 
            class="schulte-grid" 
            :style="{ 
              gridTemplateColumns: `repeat(${currentModeData.gridSize}, 1fr)`,
              fontSize: settingsManager.settings.fontSize + 'px'
            }"
          >
            <div
              v-for="(cell, index) in gridCells"
              :key="index"
              class="grid-cell"
              :class="{
                found: cell.found,
                target: cell.value === currentTarget && !cell.found,
                error: cell.error,
                'colorful-cell': currentModeData.id === 'colorful3x3',
                'timed-cell': currentModeData.id === 'timed3x3',
                'reverse-cell': currentModeData.id === 'reverse4x4',
                'random-cell': currentModeData.id === 'random4x4'
              }"
              :style="{
                backgroundColor: currentModeData.id === 'colorful3x3' ? cell.color : '',
                fontSize: currentModeData.id === 'timed3x3' ? (settingsManager.settings.fontSize * 1.2) + 'px' : ''
              }"
              @click="handleCellClick(cell, index)"
            >
              {{ cell.display }}
            </div>
          </div>

          <!-- 模式特定信息 -->
          <div v-if="currentModeData.id === 'reverse4x4'" class="mode-info reverse-info">
            <p>🔄 倒序模式：从 {{ reverseData.maxNumber }} 开始，按倒序寻找数字</p>
          </div>
          
          <div v-if="currentModeData.id === 'random4x4'" class="mode-info random-info">
            <p>🎲 随机模式：按照指定序列寻找数字</p>
            <div class="target-sequence">
              目标序列: {{ randomData.targetSequence.slice(0, 5).join(' → ') }}
              <span v-if="randomData.targetSequence.length > 5">...</span>
            </div>
          </div>
          
          <div v-if="currentModeData.id === 'timed3x3'" class="mode-info timed-info">
            <p>⏰ 限时模式：在时间压力下快速完成挑战</p>
            <div class="pressure-tips">
              <span v-if="timedData.pressureLevel === 1">💚 保持冷静</span>
              <span v-else-if="timedData.pressureLevel === 2">💛 加快速度</span>
              <span v-else-if="timedData.pressureLevel === 3">🧡 时间紧迫</span>
              <span v-else>❤️ 最后冲刺</span>
            </div>
          </div>
          
          <div v-if="currentModeData.id === 'colorful3x3'" class="mode-info colorful-info">
            <p>🌈 彩色模式：在彩色背景中寻找数字，训练视觉识别能力</p>
          </div>
        </div>

        <!-- 训练提示 -->
        <div class="training-hints" v-if="settingsManager.settings.showProgress">
          <button class="hint-btn" @click="toggleHint">
            {{ showHint ? '关闭提示' : '显示提示' }}
          </button>
          <div v-if="showHint" class="hint-content">
            <p>{{ getTrainingHint() }}</p>
          </div>
          <button class="restart-btn" @click="restartTraining">
            重新开始
          </button>
        </div>
      </div>

      <!-- 训练完成 -->
      <div class="completion-overlay" v-if="isCompleted">
        <div class="completion-card">
          <h3>🎉 训练完成！</h3>
          <div class="completion-stats">
            <div class="stat-item">
              <span class="stat-label">总用时</span>
              <span class="stat-value">{{ trainingManager.formatDuration(completionTime) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均时间</span>
              <span class="stat-value">{{ averageTimePerCell }}s/格</span>
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
    <div class="training-settings" v-if="!trainingManager.isTraining.value">
      <h3>训练设置</h3>
      <div class="settings-grid">
        <!-- 基础设置 -->
        <div class="settings-group">
          <h4>基础设置</h4>
          <div class="setting-item">
            <label>声音效果</label>
            <button 
              class="toggle-btn" 
              :class="{ active: settingsManager.settings.soundEffects }"
              @click="settingsManager.toggleSoundEffects()"
            >
              {{ settingsManager.settings.soundEffects ? '开启' : '关闭' }}
            </button>
          </div>
          <div class="setting-item">
            <label>震动反馈</label>
            <button 
              class="toggle-btn" 
              :class="{ active: settingsManager.settings.vibration }"
              @click="settingsManager.toggleVibration()"
            >
              {{ settingsManager.settings.vibration ? '开启' : '关闭' }}
            </button>
          </div>
          <div class="setting-item">
            <label>显示进度</label>
            <button 
              class="toggle-btn" 
              :class="{ active: settingsManager.settings.showProgress }"
              @click="settingsManager.toggleShowProgress()"
            >
              {{ settingsManager.settings.showProgress ? '开启' : '关闭' }}
            </button>
          </div>
        </div>

        <!-- 训练辅助 -->
        <div class="settings-group">
          <h4>训练辅助</h4>
          <div class="setting-item">
            <label>自动下一关</label>
            <button 
              class="toggle-btn" 
              :class="{ active: settingsManager.settings.autoNext }"
              @click="settingsManager.toggleAutoNext()"
            >
              {{ settingsManager.settings.autoNext ? '开启' : '关闭' }}
            </button>
          </div>
          <div class="setting-item">
            <label>主题颜色</label>
            <select 
              v-model="settingsManager.settings.theme" 
              @change="settingsManager.setTheme(settingsManager.settings.theme)"
              class="theme-select"
            >
              <option value="blue">蓝色</option>
              <option value="green">绿色</option>
              <option value="purple">紫色</option>
              <option value="orange">橙色</option>
              <option value="red">红色</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计数据 -->
    <div class="statistics-section" v-if="!trainingManager.isTraining.value">
      <h3>训练统计</h3>
      <div class="stats-overview">
        <div class="stats-card">
          <h4>总体表现</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">总训练次数</span>
              <span class="stat-value">{{ statsManager.formattedStats.value.totalSessions }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">累计训练时间</span>
              <span class="stat-value">{{ statsManager.formattedStats.value.totalTimeFormatted }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最佳成绩</span>
              <span class="stat-value">{{ statsManager.formattedStats.value.bestScore || 0 }}分</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均成绩</span>
              <span class="stat-value">{{ statsManager.formattedStats.value.averageScore }}分</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">完成率</span>
              <span class="stat-value">{{ statsManager.formattedStats.value.completionRate }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">进步趋势</span>
              <span class="stat-value trend" :class="statsManager.formattedStats.value.recentTrend">
                {{ getTrendText(statsManager.formattedStats.value.recentTrend) }}
              </span>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>成就系统</h4>
          <div class="achievements-grid">
            <div 
              v-for="achievement in statsManager.formattedStats.value.achievements" 
              :key="achievement.id"
              class="achievement-item unlocked"
            >
              <span class="achievement-icon">🏆</span>
              <div class="achievement-info">
                <h5>{{ achievement.name }}</h5>
                <p>{{ achievement.description }}</p>
                <small>解锁时间: {{ formatDate(achievement.unlockedAt) }}</small>
              </div>
            </div>
            <div v-if="statsManager.formattedStats.value.achievements.length === 0" class="no-achievements">
              <p>暂无解锁成就，继续训练获得更多成就！</p>
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
  emits: ['back'],
  setup(props, { emit }) {
    // 使用统一的基础训练管理
    const trainingManager = useBasicTraining('schulte_table')
    const settingsManager = useBasicTrainingSettings(trainingManager)
    const statsManager = useBasicTrainingStats(trainingManager)
    
    // 解构训练管理器的方法和状态
    const {
      isTraining,
      isPaused,
      sessionProgress,
      canPauseTraining,
      canResumeTraining,
      startTrainingSession,
      pauseTraining: basePauseTraining,
      resumeTraining: baseResumeTraining,
      cancelTrainingSession,
      endTrainingSession,
      addError,
      formatDuration
    } = trainingManager
    
    // 解构设置管理器
    const {
      settings,
      toggleSoundEffects,
      toggleVibration,
      toggleShowProgress,
      toggleAutoNext,
      setTheme
    } = settingsManager
    
    // 解构统计管理器
    const {
      formattedStats
    } = statsManager
    
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
    const isCompleted = ref(false)
    
    // 训练模式数据
    const trainingModes = ref([
      {
        id: 'basic3x3',
        name: '基础舒尔特表',
        icon: '🔢',
        level: 'beginner',
        levelText: '初级',
        description: '3×3基础数字表格，适合初学者练习',
        gridSize: 3,
        contentType: '数字',
        difficulty: '简单',
        bestTime: 18.5,
        averageTime: 24.3
      },
      {
        id: 'standard4x4',
        name: '标准舒尔特表',
        icon: '📊',
        level: 'intermediate',
        levelText: '中级',
        description: '4×4标准数字表格，经典训练模式',
        gridSize: 4,
        contentType: '数字',
        difficulty: '中等',
        bestTime: 35.2,
        averageTime: 42.8
      },
      {
        id: 'advanced5x5',
        name: '高级舒尔特表',
        icon: '🎯',
        level: 'advanced',
        levelText: '高级',
        description: '5×5高级数字表格，挑战专注力极限',
        gridSize: 5,
        contentType: '数字',
        difficulty: '困难',
        bestTime: 68.9,
        averageTime: 78.5
      },
      {
        id: 'colorful3x3',
        name: '彩色舒尔特表',
        icon: '🌈',
        level: 'intermediate',
        levelText: '中级',
        description: '3×3彩色数字表格，增加视觉识别难度',
        gridSize: 3,
        contentType: '彩色数字',
        difficulty: '中等',
        bestTime: 25.6,
        averageTime: 32.1
      },
      {
        id: 'reverse4x4',
        name: '倒序舒尔特表',
        icon: '🔄',
        level: 'advanced',
        levelText: '高级',
        description: '4×4倒序数字表格，从大到小寻找数字',
        gridSize: 4,
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
    ])
    
    // 新训练模式数据
    const colorfulData = reactive({
      colors: ['#FF5722', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#795548'],
      currentColorIndex: 0
    })
    
    const reverseData = reactive({
      isReverse: false,
      maxNumber: 25
    })
    
    const randomData = reactive({
      randomNumbers: [],
      targetSequence: []
    })
    
    const timedData = reactive({
      timeLimit: 30,
      timeRemaining: 30,
      pressureLevel: 1,
      bonusTime: 0,
      pressureTimer: null
    })
    
    // 计算属性
    const averageTimePerCell = computed(() => {
      return totalCount.value > 0 ? (completionTime.value / totalCount.value).toFixed(1) : 0
    })
    
    const accuracy = computed(() => {
      const totalClicks = foundCount.value + errorCount.value
      return totalClicks > 0 ? Math.round((foundCount.value / totalClicks) * 100) : 100
    })
    
    // 方法
    const selectMode = (modeId) => {
      selectedMode.value = modeId
    }
    
    const startTraining = (modeId) => {
      selectedMode.value = modeId
      currentModeData.value = trainingModes.value.find(mode => mode.id === modeId)
      
      resetTrainingState()
      generateGrid()
      
      // 开始训练会话
      trainingManager.startTrainingSession({
        mode: modeId,
        gridSize: currentModeData.value.gridSize
      })
    }
    
    const pauseTraining = () => {
      trainingManager.pauseTraining()
    }
    
    const resumeTraining = () => {
      trainingManager.resumeTraining()
    }
    
    const stopTraining = () => {
      trainingManager.cancelTrainingSession()
      isCompleted.value = false
    }
    
    const restartTraining = () => {
      resetTrainingState()
      generateGrid()
      trainingManager.startTrainingSession({
        mode: selectedMode.value,
        gridSize: currentModeData.value.gridSize
      })
    }
    
    const resetTrainingState = () => {
      currentTarget.value = 1
      foundCount.value = 0
      completionTime.value = 0
      errorCount.value = 0
      isCompleted.value = false
      showHint.value = false
      
      // 重置模式特定数据
      if (currentModeData.value.id === 'timed3x3') {
        timedData.timeRemaining = timedData.timeLimit
        timedData.pressureLevel = 1
        timedData.bonusTime = 0
      }
    }
    
    const generateGrid = () => {
      const size = currentModeData.value.gridSize
      totalCount.value = size * size
      
      switch (currentModeData.value.id) {
        case 'colorful3x3':
          generateColorfulGrid()
          break
        case 'reverse4x4':
          generateReverseGrid()
          break
        case 'random4x4':
          generateRandomGrid()
          break
        case 'timed3x3':
          generateTimedGrid()
          break
        default:
          generateStandardGrid()
      }
    }
    
    const generateStandardGrid = () => {
      const size = currentModeData.value.gridSize
      const numbers = Array.from({ length: size * size }, (_, i) => i + 1)
      const shuffled = shuffleArray(numbers)
      
      gridCells.value = shuffled.map(num => ({
        value: num,
        display: num,
        found: false,
        error: false
      }))
    }
    
    const generateColorfulGrid = () => {
      const size = currentModeData.value.gridSize
      const numbers = Array.from({ length: size * size }, (_, i) => i + 1)
      const shuffled = shuffleArray(numbers)
      
      gridCells.value = shuffled.map(num => ({
        value: num,
        display: num,
        found: false,
        error: false,
        color: colorfulData.colors[Math.floor(Math.random() * colorfulData.colors.length)]
      }))
    }
    
    const generateReverseGrid = () => {
      const size = currentModeData.value.gridSize
      const numbers = Array.from({ length: size * size }, (_, i) => i + 1)
      const shuffled = shuffleArray(numbers)
      
      reverseData.maxNumber = size * size
      currentTarget.value = reverseData.maxNumber
      
      gridCells.value = shuffled.map(num => ({
        value: num,
        display: num,
        found: false,
        error: false
      }))
    }
    
    const generateRandomGrid = () => {
      const size = currentModeData.value.gridSize
      const numbers = Array.from({ length: size * size }, (_, i) => i + 1)
      const shuffled = shuffleArray(numbers)
      
      // 生成随机目标序列
      randomData.targetSequence = shuffleArray([...numbers])
      currentTarget.value = randomData.targetSequence[0]
      
      gridCells.value = shuffled.map(num => ({
        value: num,
        display: num,
        found: false,
        error: false
      }))
    }
    
    const generateTimedGrid = () => {
      const size = currentModeData.value.gridSize
      const numbers = Array.from({ length: size * size }, (_, i) => i + 1)
      const shuffled = shuffleArray(numbers)
      
      timedData.timeRemaining = timedData.timeLimit
      timedData.pressureLevel = 1
      startTimedMode()
      
      gridCells.value = shuffled.map(num => ({
        value: num,
        display: num,
        found: false,
        error: false
      }))
    }
    
    const handleCellClick = (cell, index) => {
      if (cell.found || trainingManager.isPaused.value) return
      
      switch (currentModeData.value.id) {
        case 'reverse4x4':
          handleReverseClick(cell, index)
          break
        case 'random4x4':
          handleRandomClick(cell, index)
          break
        case 'timed3x3':
          handleTimedClick(cell, index)
          break
        default:
          handleStandardClick(cell, index)
      }
    }
    
    const handleStandardClick = (cell, index) => {
      if (cell.value === currentTarget.value) {
        cell.found = true
        foundCount.value++
        currentTarget.value++
        
        if (settingsManager.settings.soundEffects) {
          playSuccessSound()
        }
        
        if (settingsManager.settings.vibration && navigator.vibrate) {
          navigator.vibrate(50)
        }
        
        if (foundCount.value === totalCount.value) {
          completeTraining()
        }
      } else {
        cell.error = true
        errorCount.value++
        trainingManager.addError(1)
        
        if (settingsManager.settings.soundEffects) {
          playErrorSound()
        }
        
        setTimeout(() => {
          cell.error = false
        }, 500)
      }
    }
    
    const handleReverseClick = (cell, index) => {
      if (cell.value === currentTarget.value) {
        cell.found = true
        foundCount.value++
        currentTarget.value--
        
        if (settingsManager.settings.soundEffects) {
          playSuccessSound()
        }
        
        if (foundCount.value === totalCount.value) {
          completeTraining()
        }
      } else {
        cell.error = true
        errorCount.value++
        trainingManager.addError(1)
        
        if (settingsManager.settings.soundEffects) {
          playErrorSound()
        }
        
        setTimeout(() => {
          cell.error = false
        }, 500)
      }
    }
    
    const handleRandomClick = (cell, index) => {
      const targetValue = randomData.targetSequence[foundCount.value]
      
      if (cell.value === targetValue) {
        cell.found = true
        foundCount.value++
        
        if (foundCount.value < randomData.targetSequence.length) {
          currentTarget.value = randomData.targetSequence[foundCount.value]
        }
        
        if (settingsManager.settings.soundEffects) {
          playSuccessSound()
        }
        
        if (foundCount.value === totalCount.value) {
          completeTraining()
        }
      } else {
        cell.error = true
        errorCount.value++
        trainingManager.addError(1)
        
        if (settingsManager.settings.soundEffects) {
          playErrorSound()
        }
        
        setTimeout(() => {
          cell.error = false
        }, 500)
      }
    }
    
    const handleTimedClick = (cell, index) => {
      if (cell.value === currentTarget.value) {
        cell.found = true
        foundCount.value++
        currentTarget.value++
        
        // 限时模式奖励时间
        timedData.bonusTime += 0.5
        timedData.timeRemaining += 0.5
        
        if (settingsManager.settings.soundEffects) {
          playSuccessSound()
        }
        
        if (foundCount.value === totalCount.value) {
          completeTraining()
        }
      } else {
        cell.error = true
        errorCount.value++
        trainingManager.addError(1)
        
        // 限时模式时间惩罚
        timedData.timeRemaining -= 2
        
        if (settingsManager.settings.soundEffects) {
          playErrorSound()
        }
        
        setTimeout(() => {
          cell.error = false
        }, 500)
      }
    }
    
    const startTimedMode = () => {
      timedData.pressureTimer = setInterval(() => {
        timedData.timeRemaining--
        
        // 更新压力等级
        const progress = 1 - (timedData.timeRemaining / timedData.timeLimit)
        if (progress > 0.75) {
          timedData.pressureLevel = 4
        } else if (progress > 0.5) {
          timedData.pressureLevel = 3
        } else if (progress > 0.25) {
          timedData.pressureLevel = 2
        } else {
          timedData.pressureLevel = 1
        }
        
        if (timedData.timeRemaining <= 0) {
          completeTraining(false)
        }
      }, 1000)
    }
    
    const stopTimedMode = () => {
      if (timedData.pressureTimer) {
        clearInterval(timedData.pressureTimer)
        timedData.pressureTimer = null
      }
    }
    
    const completeTraining = (completed = true) => {
      isCompleted.value = true
      completionTime.value = trainingManager.sessionProgress.value
      
      // 停止限时模式
      if (currentModeData.value.id === 'timed3x3') {
        stopTimedMode()
      }
      
      // 计算分数
      let score = 0
      if (completed) {
        const baseScore = 100
        const timeBonus = Math.max(0, 60 - completionTime.value) // 时间奖励
        const accuracyBonus = (accuracy.value - 80) * 0.5 // 准确率奖励
        score = Math.round(baseScore + timeBonus + accuracyBonus)
      }
      
      // 结束训练会话
      trainingManager.endTrainingSession({
        score: score,
        completed: completed,
        errors: errorCount.value,
        mode: currentModeData.value.id,
        gridSize: currentModeData.value.gridSize
      })
      
      if (settingsManager.settings.soundEffects) {
        playCompletionSound()
      }
    }
    
    const toggleHint = () => {
      showHint.value = !showHint.value
    }
    
    const getTrainingHint = () => {
      const hints = [
        '保持眼球快速移动，不要停留在一个位置太久',
        '用余光扫描整个表格，寻找目标数字',
        '建立有序的搜索模式，避免重复查看',
        '放松心态，保持稳定的节奏',
        '专注于当前目标，不要被其他数字干扰'
      ]
      return hints[Math.floor(Math.random() * hints.length)]
    }
    
    const playSuccessSound = () => {
      try {
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
      } catch (error) {
        console.log('音效播放失败:', error)
      }
    }
    
    const playErrorSound = () => {
      try {
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
      } catch (error) {
        console.log('音效播放失败:', error)
      }
    }
    
    const playCompletionSound = () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        
        const frequencies = [523, 659, 784, 1047]
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
      } catch (error) {
        console.log('音效播放失败:', error)
      }
    }
    
    const shuffleArray = (array) => {
      const newArray = [...array]
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
      }
      return newArray
    }
    
    const getTrendText = (trend) => {
      switch (trend) {
        case 'improving': return '上升'
        case 'declining': return '下降'
        default: return '稳定'
      }
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('zh-CN')
    }
    
    // 清理函数
    onUnmounted(() => {
      stopTimedMode()
    })
    
    // 返回模板需要的所有数据和方法
    return {
      // 训练管理器
      trainingManager,
      settingsManager,
      statsManager,
      
      // 状态
      selectedMode,
      currentTarget,
      foundCount,
      totalCount,
      completionTime,
      errorCount,
      showHint,
      gridCells,
      currentModeData,
      isCompleted,
      trainingModes,
      
      // 模式数据
      colorfulData,
      reverseData,
      randomData,
      timedData,
      
      // 计算属性
      averageTimePerCell,
      accuracy,
      
      // 方法
      selectMode,
      startTraining,
      pauseTraining,
      resumeTraining,
      stopTraining,
      restartTraining,
      handleCellClick,
      toggleHint,
      getTrainingHint,
      getTrendText,
      formatDate
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
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.mode-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.mode-card.active {
  border-color: #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
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
  color: white;
}

.mode-level.beginner { background: #4CAF50; }
.mode-level.intermediate { background: #FF9800; }
.mode-level.advanced { background: #F44336; }
.mode-level.expert { background: #9C27B0; }

.mode-card h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2rem;
}

.mode-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 15px;
}

.mode-details {
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.detail-label {
  color: #666;
}

.detail-value {
  font-weight: bold;
  color: #333;
}

.mode-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 2px;
}

.stat-value {
  font-weight: bold;
  color: #333;
}

.start-mode-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-mode-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* 训练界面 */
.training-interface {
  max-width: 800px;
  margin: 0 auto;
}

.training-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
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
  margin-bottom: 2px;
}

.info-value {
  font-weight: bold;
  color: #333;
  font-size: 1.1rem;
}

.current-target {
  color: #667eea;
  font-size: 1.5rem;
}

.training-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 8px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: #e0e0e0;
  transform: scale(1.05);
}

/* 舒尔特表格 */
.schulte-grid-container {
  text-align: center;
  margin-bottom: 30px;
}

.timed-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.time-remaining {
  font-weight: bold;
  color: #333;
}

.pressure-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.pressure-indicator.level-1 { background: #4CAF50; }
.pressure-indicator.level-2 { background: #FFEB3B; }
.pressure-indicator.level-3 { background: #FF9800; }
.pressure-indicator.level-4 { background: #F44336; }

.schulte-grid {
  display: grid;
  gap: 8px;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 15px;
}

.grid-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.grid-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.grid-cell.target {
  border-color: #667eea;
  background: #e3f2fd;
  animation: pulse 1.5s infinite;
}

.grid-cell.found {
  background: #c8e6c9;
  border-color: #4caf50;
  color: #2e7d32;
}

.grid-cell.error {
  background: #ffcdd2;
  border-color: #f44336;
  animation: shake 0.5s;
}

/* 彩色舒尔特表样式 */
.colorful-mode .grid-cell {
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.colorful-mode .grid-cell.target {
  border: 3px solid #fff;
  box-shadow: 0 0 15px rgba(255,255,255,0.8);
}

/* 倒序舒尔特表样式 */
.reverse-mode .grid-cell {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  border-color: #ff6b9d;
}

.reverse-mode .grid-cell.target {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

/* 随机舒尔特表样式 */
.random-mode .grid-cell {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  border-color: #48cae4;
}

.random-mode .grid-cell.target {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-color: #f093fb;
}

/* 限时舒尔特表样式 */
.timed-mode .grid-cell {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-color: #ff8a80;
  font-size: 1.8rem;
}

.timed-mode .grid-cell.target {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border-color: #ff6b6b;
  animation: glow 1s infinite alternate;
}

/* 模式信息 */
.mode-info {
  margin-top: 15px;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.reverse-info {
  background: #fce4ec;
  color: #880e4f;
}

.random-info {
  background: #e0f2f1;
  color: #004d40;
}

.timed-info {
  background: #fff3e0;
  color: #e65100;
}

.colorful-info {
  background: #f3e5f5;
  color: #4a148c;
}

.target-sequence {
  margin-top: 5px;
  font-weight: bold;
}

.pressure-tips {
  margin-top: 5px;
  font-weight: bold;
}

/* 训练提示 */
.training-hints {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.hint-btn, .restart-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.hint-btn {
  background: #e3f2fd;
  color: #1976d2;
}

.restart-btn {
  background: #fff3e0;
  color: #f57c00;
}

.hint-btn:hover, .restart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.hint-content {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  max-width: 300px;
  z-index: 10;
}

/* 完成覆盖层 */
.completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 500px;
  width: 90%;
}

.completion-card h3 {
  margin: 0 0 30px 0;
  color: #333;
  font-size: 2rem;
}

.completion-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.completion-stats .stat-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
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
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.action-btn.secondary {
  background: #f0f0f0;
  color: #333;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* 训练设置 */
.training-settings {
  max-width: 800px;
  margin: 0 auto 40px;
}

.training-settings h3 {
  color: white;
  text-align: center;
  margin-bottom: 20px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.settings-group {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 15px;
}

.settings-group h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.setting-item label {
  color: #666;
  font-weight: 500;
}

.toggle-btn {
  padding: 6px 12px;
  border: 2px solid #ddd;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.toggle-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.theme-select {
  padding: 6px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

/* 统计数据 */
.statistics-section {
  max-width: 1200px;
  margin: 0 auto;
}

.statistics-section h3 {
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
}

.stats-card h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stats-grid .stat-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.stats-grid .stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.stats-grid .stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.trend.improving {
  color: #4caf50;
}

.trend.declining {
  color: #f44336;
}

.trend.stable {
  color: #ff9800;
}

.achievements-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #4caf50;
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-info h5 {
  margin: 0 0 5px 0;
  color: #333;
}

.achievement-info p {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 0.9rem;
}

.achievement-info small {
  color: #999;
  font-size: 0.8rem;
}

.no-achievements {
  text-align: center;
  padding: 40px 20px;
  color: #666;
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
  0% { box-shadow: 0 0 5px rgba(255, 107, 107, 0.5); }
  100% { box-shadow: 0 0 20px rgba(255, 107, 107, 0.8); }
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
  
  .schulte-grid {
    max-width: 300px;
    gap: 6px;
  }
  
  .grid-cell {
    font-size: 1.2rem;
  }
  
  .completion-stats {
    grid-template-columns: 1fr;
  }
  
  .completion-actions {
    flex-direction: column;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .schulte-container {
    padding: 10px;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .training-card {
    padding: 20px;
  }
  
  .schulte-grid {
    max-width: 250px;
    gap: 4px;
  }
  
  .grid-cell {
    font-size: 1rem;
  }
  
  .completion-card {
    padding: 30px 20px;
  }
}
</style>