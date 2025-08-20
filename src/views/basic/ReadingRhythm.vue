<template>
  <div class="reading-rhythm-container">
    <!-- 训练模式选择 -->
    <div v-if="!isTraining" class="mode-selection">
      <h2>选择训练模式</h2>
      <div class="modes-grid">
        <div 
          v-for="mode in trainingModes" 
          :key="mode.id"
          class="mode-card"
          :class="{ 'selected': selectedMode?.id === mode.id }"
          @click="selectMode(mode)"
        >
          <div class="mode-header">
            <div class="mode-icon">{{ mode.icon }}</div>
            <div class="mode-info">
              <h3 class="mode-name">{{ mode.name }}</h3>
              <span class="mode-level" :class="mode.level">{{ mode.levelText }}</span>
            </div>
          </div>
          <p class="mode-description">{{ mode.description }}</p>
          <div class="mode-details">
            <div class="detail-item">
              <span class="detail-label">节拍范围:</span>
              <span class="detail-value">{{ mode.bpmRange }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">文本类型:</span>
              <span class="detail-value">{{ mode.textType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">训练时长:</span>
              <span class="detail-value">{{ mode.duration }}</span>
            </div>
          </div>
          <div class="mode-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: mode.progress + '%' }"></div>
            </div>
            <span class="progress-text">{{ mode.progress }}%</span>
          </div>
          <button 
            class="start-button"
            @click.stop="startTraining(mode)"
          >
            开始训练
          </button>
        </div>
      </div>
    </div>

    <!-- 训练界面 -->
    <div v-if="isTraining" class="training-interface">
      <!-- 训练头部 -->
      <div class="training-header">
        <div class="mode-info">
          <span class="mode-icon">{{ selectedMode.icon }}</span>
          <span class="mode-name">{{ selectedMode.name }}</span>
        </div>
        <div class="training-controls">
          <button 
            class="control-button"
            :class="{ 'paused': isPaused }"
            @click="togglePause"
          >
            {{ isPaused ? '继续' : '暂停' }}
          </button>
          <button class="control-button stop" @click="stopTraining">结束</button>
        </div>
      </div>

      <!-- 节拍器控制 -->
      <div class="metronome-section">
        <div class="metronome-display">
          <div class="bpm-indicator" :class="{ active: beatActive }">
            <span class="bpm-value">{{ currentBPM }}</span>
            <span class="bpm-label">BPM</span>
          </div>
          <div class="beat-counter">
            <span class="beat-number">{{ currentBeat }}</span>
            <span class="beat-total">/{{ beatsPerMeasure }}</span>
          </div>
        </div>
        
        <div class="bpm-controls">
          <button class="bpm-btn" @click="adjustBPM(-5)">-5</button>
          <button class="bpm-btn" @click="adjustBPM(-1)">-1</button>
          <input 
            type="range" 
            v-model="currentBPM" 
            :min="minBPM" 
            :max="maxBPM" 
            class="bpm-slider"
          >
          <button class="bpm-btn" @click="adjustBPM(1)">+1</button>
          <button class="bpm-btn" @click="adjustBPM(5)">+5</button>
        </div>

        <div class="metronome-controls">
          <button 
            class="metronome-btn"
            :class="{ active: metronomeActive }"
            @click="toggleMetronome"
          >
            {{ metronomeActive ? '停止节拍' : '开始节拍' }}
          </button>
          <button class="reset-btn" @click="resetMetronome">重置</button>
        </div>
      </div>

      <!-- 阅读内容区域 -->
      <div class="reading-content">
        <div class="text-display">
          <div class="reading-text" :style="{ fontSize: settings.fontSize + 'px' }">
            <span 
              v-for="(word, index) in currentWords" 
              :key="index"
              class="word"
              :class="{ 
                'current': index === currentWordIndex,
                'read': index < currentWordIndex,
                'highlighted': index === highlightedWordIndex
              }"
            >
              {{ word }}
            </span>
          </div>
        </div>

        <!-- 进度指示器 -->
        <div class="reading-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: readingProgress + '%' }"
            ></div>
          </div>
          <div class="progress-info">
            <span>进度: {{ currentWordIndex }}/{{ currentWords.length }}</span>
            <span>速度: {{ currentSpeed }} 字/分钟</span>
          </div>
        </div>
      </div>

      <!-- 训练统计 -->
      <div class="training-stats">
        <div class="stat-item">
          <span class="stat-label">已读时间:</span>
          <span class="stat-value">{{ formatTime(elapsedTime) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">当前速度:</span>
          <span class="stat-value">{{ currentSpeed }} 字/分</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">目标速度:</span>
          <span class="stat-value">{{ targetSpeed }} 字/分</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">节拍同步:</span>
          <span class="stat-value">{{ syncAccuracy }}%</span>
        </div>
      </div>
    </div>

    <!-- 训练设置 -->
    <div class="training-settings">
      <h3>训练设置</h3>
      <div class="settings-grid">
        <div class="setting-card">
          <h4>基础设置</h4>
          <div class="setting-item">
            <label>字体大小:</label>
            <input 
              v-model.number="settings.fontSize" 
              type="range" 
              min="12" 
              max="24" 
              class="range-input"
            >
            <span class="range-value">{{ settings.fontSize }}px</span>
          </div>
          <div class="setting-item">
            <label>行间距:</label>
            <input 
              v-model.number="settings.lineHeight" 
              type="range" 
              min="1.2" 
              max="2.0" 
              step="0.1" 
              class="range-input"
            >
            <span class="range-value">{{ settings.lineHeight }}</span>
          </div>
          <div class="setting-item">
            <label>文本宽度:</label>
            <input 
              v-model.number="settings.textWidth" 
              type="range" 
              min="60" 
              max="100" 
              class="range-input"
            >
            <span class="range-value">{{ settings.textWidth }}%</span>
          </div>
        </div>

        <div class="setting-card">
          <h4>节拍设置</h4>
          <div class="setting-item">
            <label>起始BPM:</label>
            <input 
              v-model.number="settings.startBPM" 
              type="range" 
              min="60" 
              max="200" 
              class="range-input"
            >
            <span class="range-value">{{ settings.startBPM }}</span>
          </div>
          <div class="setting-item">
            <label>每小节拍数:</label>
            <select v-model="settings.beatsPerMeasure" class="select-input">
              <option value="2">2拍</option>
              <option value="3">3拍</option>
              <option value="4">4拍</option>
              <option value="6">6拍</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="checkbox-label">
              <input v-model="settings.soundEnabled" type="checkbox" class="checkbox-input">
              <span class="checkbox-text">节拍音效</span>
            </label>
          </div>
        </div>

        <div class="setting-card">
          <h4>高级设置</h4>
          <div class="setting-item">
            <label class="checkbox-label">
              <input v-model="settings.autoProgress" type="checkbox" class="checkbox-input">
              <span class="checkbox-text">自动进度</span>
            </label>
          </div>
          <div class="setting-item">
            <label class="checkbox-label">
              <input v-model="settings.highlightWords" type="checkbox" class="checkbox-input">
              <span class="checkbox-text">高亮当前词</span>
            </label>
          </div>
          <div class="setting-item">
            <label class="checkbox-label">
              <input v-model="settings.showProgress" type="checkbox" class="checkbox-input">
              <span class="checkbox-text">显示进度</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计数据 -->
    <div class="statistics-section">
      <h3>训练统计</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <h4>今日表现</h4>
          <div class="stat-content">
            <div class="stat-item">
              <span class="stat-label">训练次数:</span>
              <span class="stat-value">{{ todayStats.sessionsCompleted }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均速度:</span>
              <span class="stat-value">{{ todayStats.averageSpeed }} 字/分</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最高速度:</span>
              <span class="stat-value">{{ todayStats.maxSpeed }} 字/分</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">节拍同步:</span>
              <span class="stat-value">{{ todayStats.averageSync }}%</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <h4>进步趋势</h4>
          <div class="progress-chart">
            <div class="chart-placeholder">
              <div class="trend-line">
                <div 
                  v-for="(point, index) in progressData" 
                  :key="index"
                  class="data-point"
                  :style="{ 
                    left: (index / (progressData.length - 1)) * 100 + '%',
                    bottom: (point.speed / 500) * 100 + '%'
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <h4>成就系统</h4>
          <div class="achievements">
            <div 
              v-for="achievement in achievements" 
              :key="achievement.id"
              class="achievement-item"
              :class="{ 'unlocked': achievement.unlocked }"
            >
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-info">
                <div class="achievement-name">{{ achievement.name }}</div>
                <div class="achievement-desc">{{ achievement.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 完成弹窗 -->
    <div v-if="showCompletionModal" class="modal-overlay" @click="closeModal">
      <div class="completion-modal" @click.stop>
        <div class="modal-header">
          <h3>训练完成！</h3>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <div class="modal-content">
          <div class="completion-stats">
            <div class="stat-item">
              <span class="stat-label">平均速度:</span>
              <span class="stat-value">{{ completionStats.averageSpeed }} 字/分</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最高速度:</span>
              <span class="stat-value">{{ completionStats.maxSpeed }} 字/分</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">节拍同步:</span>
              <span class="stat-value">{{ completionStats.syncAccuracy }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">训练时长:</span>
              <span class="stat-value">{{ formatTime(completionStats.duration) }}</span>
            </div>
          </div>
          <div class="achievement" v-if="completionStats.achievement">
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">{{ completionStats.achievement }}</div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="primary-button" @click="restartTraining">再次训练</button>
          <button class="secondary-button" @click="closeModal">返回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useBasicTraining, useBasicTrainingSettings, useBasicTrainingStats } from '@/composables/useBasicTraining'

export default {
  name: 'ReadingRhythm',
  emits: ['back'],
  setup(props, { emit }) {
    // 使用组合式函数
    const trainingManager = useBasicTraining('reading-rhythm')
    const {
      isTraining,
      isPaused,
      isCompleted,
      selectedMode,
      currentTarget,
      foundCount,
      totalCount,
      elapsedTime,
      completionTime,
      errorCount,
      showHint,
      startTraining: baseStartTraining,
      pauseTraining,
      resumeTraining,
      stopTraining: baseStopTraining,
      completeTraining,
      updateProgress,
      resetTraining
    } = trainingManager

    const {
      settings,
      updateSettings,
      resetSettings
    } = useBasicTrainingSettings(trainingManager)

    const {
      stats,
      formattedStats,
      getChartData,
      getAchievementProgress
    } = useBasicTrainingStats(trainingManager)

    // 兼容性别名
    const todayStats = computed(() => formattedStats.value)
    const weeklyStats = computed(() => getChartData.value.weekly)
    const monthlyStats = computed(() => getChartData.value.monthly)
    const allTimeStats = computed(() => stats)
    const recentSessions = computed(() => stats.recentSessions || [])
    const achievements = computed(() => stats.achievements || [])

    // 本地状态
    const currentBPM = ref(120)
    const minBPM = ref(60)
    const maxBPM = ref(200)
    const currentBeat = ref(1)
    const beatsPerMeasure = ref(4)
    const beatActive = ref(false)
    const metronomeActive = ref(false)
    const currentWords = ref([])
    const currentWordIndex = ref(0)
    const highlightedWordIndex = ref(-1)
    const currentSpeed = ref(0)
    const targetSpeed = ref(200)
    const syncAccuracy = ref(100)
    const showCompletionModal = ref(false)

    // 训练模式数据
    const trainingModes = ref([
      {
        id: 'basic',
        name: '基础节拍训练',
        icon: '🎵',
        level: 'beginner',
        levelText: '初级',
        description: '跟随固定节拍进行阅读，建立稳定的阅读节奏',
        bpmRange: '60-120',
        textType: '简单文章',
        duration: '10分钟',
        progress: 75,
        features: ['固定节拍', '基础文本', '节奏训练'],
        benefits: ['建立阅读节奏', '提升阅读稳定性']
      },
      {
        id: 'progressive',
        name: '渐进式训练',
        icon: '📈',
        level: 'intermediate',
        levelText: '中级',
        description: '节拍速度逐渐加快，循序渐进提升阅读速度',
        bpmRange: '80-160',
        textType: '中等文章',
        duration: '15分钟',
        progress: 60,
        features: ['渐进加速', '适应性训练', '速度提升'],
        benefits: ['逐步提速', '适应性强']
      },
      {
        id: 'variable',
        name: '变速节拍训练',
        icon: '🎭',
        level: 'advanced',
        levelText: '高级',
        description: '节拍速度随机变化，训练阅读适应性和灵活性',
        bpmRange: '60-180',
        textType: '复杂文章',
        duration: '20分钟',
        progress: 40,
        features: ['变速训练', '适应性强', '灵活性训练'],
        benefits: ['提升适应性', '增强灵活性']
      },
      {
        id: 'compound',
        name: '复合节拍训练',
        icon: '🎼',
        level: 'expert',
        levelText: '专家',
        description: '使用复杂节拍模式，训练高级阅读节奏控制',
        bpmRange: '90-200',
        textType: '专业文章',
        duration: '25分钟',
        progress: 25,
        features: ['复合节拍', '高级训练', '专业文本'],
        benefits: ['高级节奏控制', '专业阅读能力']
      }
    ])

    // 进度数据
    const progressData = ref([
      { speed: 180 },
      { speed: 195 },
      { speed: 210 },
      { speed: 225 },
      { speed: 240 },
      { speed: 255 },
      { speed: 270 }
    ])

    // 完成统计
    const completionStats = reactive({
      averageSpeed: 0,
      maxSpeed: 0,
      syncAccuracy: 0,
      duration: 0,
      achievement: null
    })

    // 计算属性
    const readingProgress = computed(() => {
      if (currentWords.value.length === 0) return 0
      return (currentWordIndex.value / currentWords.value.length) * 100
    })

    // 定时器
    let metronomeTimer = null
    let readingTimer = null
    let speedCalculationTimer = null

    // 方法
    const selectMode = (mode) => {
      selectedMode.value = mode
    }

    const startTraining = (mode) => {
      selectedMode.value = mode
      isTraining.value = true
      isPaused.value = false
      
      // 初始化训练数据
      initializeTrainingData(mode)
      
      // 启动定时器
      startTimers()
      
      // 调用基础训练函数
      baseStartTraining(mode)
    }

    const togglePause = () => {
      if (isPaused.value) {
        resumeTraining()
        startTimers()
      } else {
        pauseTraining()
        stopTimers()
      }
    }

    const stopTraining = () => {
      stopTimers()
      
      // 计算完成统计
      completionStats.averageSpeed = currentSpeed.value
      completionStats.maxSpeed = Math.max(currentSpeed.value, completionStats.maxSpeed)
      completionStats.syncAccuracy = syncAccuracy.value
      completionStats.duration = elapsedTime.value
      
      // 更新统计数据
      updateStats({
        mode: selectedMode.value.id,
        duration: elapsedTime.value,
        speed: currentSpeed.value,
        syncAccuracy: syncAccuracy.value,
        completed: true
      })
      
      showCompletionModal.value = true
      baseStopTraining()
    }

    const initializeTrainingData = (mode) => {
      // 根据模式设置初始参数
      switch (mode.id) {
        case 'basic':
          currentBPM.value = 80
          targetSpeed.value = 200
          break
        case 'progressive':
          currentBPM.value = 100
          targetSpeed.value = 250
          break
        case 'variable':
          currentBPM.value = 120
          targetSpeed.value = 300
          break
        case 'compound':
          currentBPM.value = 140
          targetSpeed.value = 350
          break
      }
      
      // 加载文本内容
      loadTextContent(mode)
      
      // 重置状态
      currentWordIndex.value = 0
      currentBeat.value = 1
      syncAccuracy.value = 100
    }

    const loadTextContent = (mode) => {
      // 示例文本，实际应用中可以从API或文件加载
      const sampleTexts = {
        basic: '这是一个基础的阅读训练文本。通过跟随节拍进行阅读，我们可以建立稳定的阅读节奏。节拍器会帮助我们保持一致的阅读速度，从而提高阅读的流畅性和效率。',
        progressive: '渐进式训练是一种科学的学习方法。它通过逐步增加难度和速度，让学习者能够循序渐进地提升自己的能力。在阅读训练中，我们从较慢的速度开始，然后逐渐加快，直到达到目标速度。',
        variable: '变速训练能够提高我们的适应能力。在实际阅读中，我们经常需要根据文本的难度和重要性来调整阅读速度。通过变速节拍训练，我们可以学会灵活地控制阅读节奏，提高阅读的效率和理解力。',
        compound: '复合节拍训练是高级阅读技能的重要组成部分。它结合了多种节拍模式，要求读者具备高度的注意力和协调能力。这种训练方法能够显著提升阅读的专业性和精确性，是成为高效阅读者的必经之路。'
      }
      
      const text = sampleTexts[mode.id] || sampleTexts.basic
      currentWords.value = text.split('')
    }

    const startTimers = () => {
      // 启动节拍器
      if (metronomeActive.value) {
        startMetronome()
      }
      
      // 启动阅读计时器
      readingTimer = setInterval(() => {
        if (currentWordIndex.value < currentWords.value.length) {
          currentWordIndex.value++
        } else {
          stopTraining()
        }
      }, 60000 / currentBPM.value) // 根据BPM计算间隔
      
      // 启动速度计算器
      speedCalculationTimer = setInterval(() => {
        calculateCurrentSpeed()
      }, 1000)
    }

    const stopTimers = () => {
      if (metronomeTimer) {
        clearInterval(metronomeTimer)
      }
      if (readingTimer) {
        clearInterval(readingTimer)
      }
      if (speedCalculationTimer) {
        clearInterval(speedCalculationTimer)
      }
    }

    const startMetronome = () => {
      metronomeTimer = setInterval(() => {
        beatActive.value = true
        currentBeat.value = (currentBeat.value % beatsPerMeasure.value) + 1
        
        // 播放节拍音效
        if (settings.value.soundEnabled) {
          playBeatSound()
        }
        
        setTimeout(() => {
          beatActive.value = false
        }, 100)
      }, 60000 / currentBPM.value)
    }

    const toggleMetronome = () => {
      metronomeActive.value = !metronomeActive.value
      
      if (metronomeActive.value) {
        startMetronome()
      } else {
        if (metronomeTimer) {
          clearInterval(metronomeTimer)
        }
      }
    }

    const resetMetronome = () => {
      currentBeat.value = 1
      beatActive.value = false
    }

    const adjustBPM = (delta) => {
      const newBPM = currentBPM.value + delta
      if (newBPM >= minBPM.value && newBPM <= maxBPM.value) {
        currentBPM.value = newBPM
        
        // 重新启动定时器以应用新的BPM
        if (isTraining.value && !isPaused.value) {
          stopTimers()
          startTimers()
        }
      }
    }

    const calculateCurrentSpeed = () => {
      if (elapsedTime.value > 0) {
        currentSpeed.value = Math.round((currentWordIndex.value / elapsedTime.value) * 60)
      }
    }

    const playBeatSound = () => {
      // 创建音频上下文播放节拍音
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = currentBeat.value === 1 ? 800 : 400
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      } catch (error) {
        console.warn('无法播放节拍音效:', error)
      }
    }

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const closeModal = () => {
      showCompletionModal.value = false
      isTraining.value = false
      selectedMode.value = null
    }

    const restartTraining = () => {
      closeModal()
      startTraining(selectedMode.value)
    }

    // 生命周期
    onMounted(() => {
      // 数据已通过组合式函数自动加载
    })

    onUnmounted(() => {
      stopTimers()
    })

    return {
      // 基础状态
      isTraining,
      isPaused,
      selectedMode,
      elapsedTime,
      showCompletionModal,
      
      // 节拍器状态
      currentBPM,
      minBPM,
      maxBPM,
      currentBeat,
      beatsPerMeasure,
      beatActive,
      metronomeActive,
      
      // 阅读状态
      currentWords,
      currentWordIndex,
      highlightedWordIndex,
      currentSpeed,
      targetSpeed,
      syncAccuracy,
      
      // 训练数据
      trainingModes,
      progressData,
      completionStats,
      
      // 统计数据
      todayStats,
      achievements,
      
      // 设置
      settings,
      
      // 计算属性
      readingProgress,
      
      // 方法
      selectMode,
      startTraining,
      togglePause,
      stopTraining,
      toggleMetronome,
      resetMetronome,
      adjustBPM,
      formatTime,
      closeModal,
      restartTraining
    }
  }
}
</script>

<style scoped>
.reading-rhythm-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section .page-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.title-section .icon {
  font-size: 3rem;
}

.page-description {
  color: #718096;
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
  line-height: 1.6;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.header-stats .stat-item {
  text-align: center;
}

.header-stats .stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #4299e1;
}

.header-stats .stat-label {
  color: #718096;
  font-size: 0.9rem;
}

.mode-selection {
  margin-bottom: 2rem;
}

.mode-selection h2 {
  color: white;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.mode-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.mode-card.selected {
  border-color: #4299e1;
  box-shadow: 0 0 20px rgba(66, 153, 225, 0.3);
}

.mode-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.mode-icon {
  font-size: 2.5rem;
}

.mode-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.mode-level {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.mode-level.beginner {
  background: #c6f6d5;
  color: #22543d;
}

.mode-level.intermediate {
  background: #fed7d7;
  color: #742a2a;
}

.mode-level.advanced {
  background: #fbb6ce;
  color: #702459;
}

.mode-level.expert {
  background: #d6f5d6;
  color: #22543d;
}

.mode-description {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.mode-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.detail-label {
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-weight: 600;
  color: #2d3748;
}

.mode-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4299e1, #63b3ed);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4299e1;
}

.start-button {
  width: 100%;
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(66, 153, 225, 0.4);
}

.training-interface {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.training-header .mode-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.training-header .mode-icon {
  font-size: 2rem;
}

.training-header .mode-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.training-controls {
  display: flex;
  gap: 1rem;
}

.control-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-button:not(.stop) {
  background: #4299e1;
  color: white;
}

.control-button.paused {
  background: #48bb78;
}

.control-button.stop {
  background: #f56565;
  color: white;
}

.metronome-section {
  background: #f7fafc;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.metronome-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  margin-bottom: 2rem;
}

.bpm-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border-radius: 50%;
  background: #e2e8f0;
  transition: all 0.3s ease;
  min-width: 120px;
  min-height: 120px;
  justify-content: center;
}

.bpm-indicator.active {
  background: #4299e1;
  color: white;
  transform: scale(1.1);
}

.bpm-value {
  font-size: 2.5rem;
  font-weight: 700;
}

.bpm-label {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.beat-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.beat-number {
  font-size: 3rem;
  font-weight: 700;
  color: #2d3748;
}

.beat-total {
  font-size: 1.2rem;
  color: #718096;
}

.bpm-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.bpm-btn {
  padding: 0.5rem 1rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.bpm-btn:hover {
  background: #3182ce;
}

.bpm-slider {
  flex: 1;
  max-width: 300px;
  margin: 0 1rem;
}

.metronome-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.metronome-btn {
  padding: 0.75rem 1.5rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.metronome-btn.active {
  background: #f56565;
}

.reset-btn {
  padding: 0.75rem 1.5rem;
  background: #718096;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reading-content {
  background: #f7fafc;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.text-display {
  margin-bottom: 2rem;
}

.reading-text {
  line-height: 2;
  text-align: justify;
  max-width: 800px;
  margin: 0 auto;
}

.word {
  margin-right: 0.2rem;
  padding: 0.1rem 0.2rem;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.word.current {
  background: #4299e1;
  color: white;
  font-weight: 600;
}

.word.read {
  color: #718096;
}

.word.highlighted {
  background: #fed7d7;
}

.reading-progress {
  text-align: center;
}

.reading-progress .progress-bar {
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  margin-bottom: 1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.reading-progress .progress-fill {
  background: linear-gradient(90deg, #4299e1, #63b3ed);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  max-width: 600px;
  margin: 0 auto;
  color: #4a5568;
  font-weight: 500;
}

.training-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  background: #edf2f7;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.training-stats .stat-item {
  text-align: center;
}

.training-stats .stat-label {
  display: block;
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.training-stats .stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.training-settings {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.training-settings h3 {
  color: #2d3748;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.setting-card {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 10px;
}

.setting-card h4 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.setting-item label {
  color: #4a5568;
  font-weight: 500;
}

.select-input {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
}

.range-input {
  flex: 1;
  margin: 0 1rem;
}

.range-value {
  color: #4299e1;
  font-weight: 600;
  min-width: 60px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
}

.statistics-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
}

.statistics-section h3 {
  color: #2d3748;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 10px;
}

.stat-card h4 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.stat-content .stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-content .stat-label {
  color: #718096;
}

.stat-content .stat-value {
  font-weight: 600;
  color: #2d3748;
}

.progress-chart {
  height: 150px;
  position: relative;
  background: #edf2f7;
  border-radius: 8px;
  overflow: hidden;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
}

.trend-line {
  position: relative;
  width: 100%;
  height: 100%;
}

.data-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #4299e1;
  border-radius: 50%;
  transform: translate(-50%, 50%);
}

.achievements {
  max-height: 200px;
  overflow-y: auto;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  background: #edf2f7;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.achievement-item.unlocked {
  opacity: 1;
  background: #c6f6d5;
}

.achievement-icon {
  font-size: 1.5rem;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.achievement-desc {
  font-size: 0.9rem;
  color: #718096;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-modal {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.modal-header h3 {
  color: #2d3748;
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.completion-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.completion-stats .stat-item {
  flex-direction: column;
}

.completion-stats .stat-label {
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.completion-stats .stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4299e1;
}

.achievement {
  text-align: center;
  padding: 1rem;
  background: #fff5b7;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.achievement-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.achievement-text {
  color: #744210;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.primary-button {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(66, 153, 225, 0.4);
}

.secondary-button {
  background: #edf2f7;
  color: #4a5568;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-button:hover {
  background: #e2e8f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .reading-rhythm-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-stats {
    justify-content: center;
  }
  
  .modes-grid {
    grid-template-columns: 1fr;
  }
  
  .mode-details {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .training-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .metronome-display {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .bpm-controls {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .bpm-slider {
    order: -1;
    width: 100%;
    margin: 0;
  }
  
  .training-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .completion-stats {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .title-section .page-title {
    font-size: 2rem;
  }
  
  .title-section .icon {
    font-size: 2.5rem;
  }
  
  .header-stats .stat-value {
    font-size: 1.5rem;
  }
  
  .bpm-indicator {
    min-width: 100px;
    min-height: 100px;
  }
  
  .bpm-value {
    font-size: 2rem;
  }
  
  .beat-number {
    font-size: 2.5rem;
  }
  
  .training-stats {
    grid-template-columns: 1fr;
  }
  
  .reading-text {
    font-size: 1rem;
  }
}
</style>