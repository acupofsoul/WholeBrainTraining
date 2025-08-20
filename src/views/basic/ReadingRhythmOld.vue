<template>
  <div class="reading-rhythm-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>视读节奏训练</h1>
      <p class="page-description">
        通过有节奏的阅读练习，培养稳定的阅读速度和流畅度，
        提高文字处理的自动化程度，为快速阅读打下坚实基础。
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
              <div 
                class="progress-fill" 
                :style="{ width: mode.progress + '%' }"
              ></div>
            </div>
            <div class="progress-text">完成度: {{ mode.progress }}%</div>
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
          <div class="training-controls">
            <button class="control-btn" @click="pauseTraining" v-if="!isPaused">
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
              class="bpm-slider"
              :min="currentModeData.minBPM"
              :max="currentModeData.maxBPM"
              v-model="currentBPM"
            >
            <button class="bpm-btn" @click="adjustBPM(1)">+1</button>
            <button class="bpm-btn" @click="adjustBPM(5)">+5</button>
          </div>
        </div>

        <!-- 阅读内容 -->
        <div class="reading-content">
          <div class="text-display">
            <div class="reading-text" ref="readingText">
              <span 
                v-for="(word, index) in currentText.words" 
                :key="index"
                class="word-item"
                :class="{ 
                  current: index === currentWordIndex,
                  read: index < currentWordIndex,
                  highlight: index === highlightIndex
                }"
              >
                {{ word }}
              </span>
            </div>
          </div>
          
          <div class="reading-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: readingProgress + '%' }"
              ></div>
            </div>
            <div class="progress-info">
              <span>进度: {{ currentWordIndex }}/{{ currentText.words.length }}</span>
              <span>{{ Math.round(readingProgress) }}%</span>
            </div>
          </div>
        </div>

        <!-- 训练统计 -->
        <div class="training-stats">
          <div class="stat-item">
            <span class="stat-label">训练时间</span>
            <span class="stat-value">{{ formatTime(trainingTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">阅读速度</span>
            <span class="stat-value">{{ readingSpeed }} 字/分</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">节拍准确度</span>
            <span class="stat-value">{{ beatAccuracy }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">完成段落</span>
            <span class="stat-value">{{ completedParagraphs }}</span>
          </div>
        </div>
        
        <!-- 渐进式节拍特定信息 -->
        <div class="mode-specific-info" v-if="selectedMode === 'progressive'">
          <h4>渐进式训练进度</h4>
          <div class="progressive-phases">
            <div 
              v-for="(phase, index) in progressiveData.phases" 
              :key="index"
              class="phase-item"
              :class="{ 
                active: index === progressiveData.currentPhase,
                completed: index < progressiveData.currentPhase 
              }"
            >
              <span class="phase-bpm">{{ phase.bpm }} BPM</span>
              <span class="phase-duration">{{ Math.floor(phase.duration / 60) }}分钟</span>
            </div>
          </div>
        </div>
        
        <!-- 复合节拍特定信息 -->
        <div class="mode-specific-info" v-if="selectedMode === 'compound'">
          <h4>复合节拍模式</h4>
          <div class="compound-pattern">
            <div class="pattern-name">
              当前模式: {{ compoundData.patterns[compoundData.currentPattern].name }}
            </div>
            <div class="beat-pattern">
              <span 
                v-for="(beat, index) in compoundData.patterns[compoundData.currentPattern].beats"
                :key="index"
                class="beat-dot"
                :class="{ 
                  strong: beat === 1,
                  weak: beat === 0,
                  current: index === compoundData.currentBeatIndex 
                }"
              >
                {{ beat === 1 ? '●' : '○' }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 同步阅读特定信息 -->
        <div class="mode-specific-info" v-if="selectedMode === 'synchronized'">
          <h4>同步阅读状态</h4>
          <div class="sync-stats">
            <div class="sync-item">
              <span class="sync-label">同步准确度</span>
              <span class="sync-value">{{ synchronizedData.syncAccuracy }}%</span>
            </div>
            <div class="sync-item">
              <span class="sync-label">完美同步</span>
              <span class="sync-value">{{ synchronizedData.perfectSyncs }}</span>
            </div>
            <div class="sync-item">
              <span class="sync-label">错过节拍</span>
              <span class="sync-value">{{ synchronizedData.missedBeats }}</span>
            </div>
          </div>
          <div class="sync-instruction">
            <p>💡 按空格键与节拍同步</p>
          </div>
        </div>
        
        <!-- 自适应节拍特定信息 -->
        <div class="mode-specific-info" v-if="selectedMode === 'adaptive'">
          <h4>自适应训练状态</h4>
          <div class="adaptive-stats">
            <div class="adaptive-item">
              <span class="adaptive-label">理解得分</span>
              <span class="adaptive-value">{{ adaptiveData.comprehensionScore }}%</span>
            </div>
            <div class="adaptive-item">
              <span class="adaptive-label">调整次数</span>
              <span class="adaptive-value">{{ adaptiveData.adjustmentHistory.length }}</span>
            </div>
          </div>
          <div class="adjustment-history" v-if="adaptiveData.adjustmentHistory.length > 0">
            <div class="last-adjustment">
              最近调整: {{ adaptiveData.adjustmentHistory[adaptiveData.adjustmentHistory.length - 1].reason }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练设置 -->
    <div class="training-settings" v-if="!isTraining">
      <h3>训练设置</h3>
      <div class="settings-grid">
        <div class="setting-card">
          <h4>节拍设置</h4>
          <div class="setting-item">
            <label>起始BPM</label>
            <input 
              type="number" 
              class="number-input"
              v-model="settings.startBPM"
              :min="60"
              :max="200"
            >
          </div>
          <div class="setting-item">
            <label>目标BPM</label>
            <input 
              type="number" 
              class="number-input"
              v-model="settings.targetBPM"
              :min="60"
              :max="300"
            >
          </div>
          <div class="setting-item">
            <label>每小节拍数</label>
            <select class="select-input" v-model="settings.beatsPerMeasure">
              <option value="2">2拍</option>
              <option value="3">3拍</option>
              <option value="4">4拍</option>
              <option value="6">6拍</option>
            </select>
          </div>
        </div>

        <div class="setting-card">
          <h4>阅读设置</h4>
          <div class="setting-item">
            <label>文本难度</label>
            <select class="select-input" v-model="settings.textDifficulty">
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
          <div class="setting-item">
            <label>字体大小</label>
            <div class="range-container">
              <input 
                type="range" 
                class="range-input"
                v-model="settings.fontSize"
                min="14"
                max="24"
              >
              <span class="range-value">{{ settings.fontSize }}px</span>
            </div>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.showHighlight"
              >
              显示当前词高亮
            </label>
          </div>
        </div>

        <div class="setting-card">
          <h4>训练计划</h4>
          <div class="setting-item">
            <label>训练时长 (分钟)</label>
            <input 
              type="number" 
              class="number-input"
              v-model="settings.duration"
              :min="5"
              :max="60"
            >
          </div>
          <div class="setting-item">
            <label>自动调速</label>
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.autoAdjustBPM"
              >
              根据准确度自动调整BPM
            </label>
          </div>
          <div class="setting-item">
            <label>声音提示</label>
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.soundEnabled"
              >
              启用节拍声音
            </label>
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
              <span class="stat-icon">📊</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.totalSessions }}</span>
                <span class="stat-label">总训练次数</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⏱️</span>
              <div class="stat-info">
                <span class="stat-value">{{ formatTime(statistics.totalTime) }}</span>
                <span class="stat-label">总训练时间</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🎯</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.averageAccuracy }}%</span>
                <span class="stat-label">平均准确度</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🚀</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.maxBPM }}</span>
                <span class="stat-label">最高BPM</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>进步趋势</h4>
          <div class="performance-chart">
            <div class="chart-bars">
              <div 
                v-for="(data, index) in statistics.progressData" 
                :key="index"
                class="chart-bar"
                :style="{ height: (data.accuracy / 100) * 100 + '%' }"
                :title="`第${index + 1}次: ${data.accuracy}%`"
              >
                <span class="bar-label">{{ index + 1 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>能力评估</h4>
          <div class="ability-ratings">
            <div class="rating-item">
              <span class="rating-label">节拍感知</span>
              <div class="rating-stars">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  class="star"
                  :class="{ filled: i <= statistics.rhythmRating }"
                >
                  ⭐
                </span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">阅读流畅度</span>
              <div class="rating-stars">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  class="star"
                  :class="{ filled: i <= statistics.fluencyRating }"
                >
                  ⭐
                </span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">速度控制</span>
              <div class="rating-stars">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  class="star"
                  :class="{ filled: i <= statistics.speedRating }"
                >
                  ⭐
                </span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">专注力</span>
              <div class="rating-stars">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  class="star"
                  :class="{ filled: i <= statistics.focusRating }"
                >
                  ⭐
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练完成弹窗 -->
    <div class="modal-overlay" v-if="showCompletionModal" @click="closeModal">
      <div class="completion-modal" @click.stop>
        <div class="modal-header">
          <h3>训练完成</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div class="completion-stats">
          <div class="stat-circle">
            <div 
              class="circle-progress" 
              :style="{ '--progress': completionData.accuracy }"
            >
              <div class="circle-text">
                <span class="circle-value">{{ completionData.accuracy }}%</span>
                <span class="circle-label">准确度</span>
              </div>
            </div>
          </div>
          
          <div class="completion-details">
            <div class="detail-item">
              <span class="detail-label">训练时长:</span>
              <span class="detail-value">{{ formatTime(completionData.duration) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">平均BPM:</span>
              <span class="detail-value">{{ completionData.averageBPM }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">阅读字数:</span>
              <span class="detail-value">{{ completionData.wordsRead }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">节拍准确度:</span>
              <span class="detail-value">{{ completionData.beatAccuracy }}%</span>
            </div>
          </div>
        </div>

        <div class="achievement" v-if="completionData.achievement">
          <span class="achievement-icon">🏆</span>
          <div class="achievement-text">
            <h4>{{ completionData.achievement.title }}</h4>
            <p>{{ completionData.achievement.description }}</p>
          </div>
        </div>

        <div class="modal-actions">
          <button class="secondary-btn" @click="closeModal">返回</button>
          <button class="primary-btn" @click="restartTraining">再次训练</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReadingRhythm',
  data() {
    return {
      isTraining: false,
      isPaused: false,
      selectedMode: null,
      currentBPM: 120,
      currentBeat: 1,
      beatsPerMeasure: 4,
      beatActive: false,
      currentWordIndex: 0,
      highlightIndex: -1,
      trainingTime: 0,
      readingSpeed: 0,
      beatAccuracy: 100,
      completedParagraphs: 0,
      showCompletionModal: false,
      
      // 训练模式
      trainingModes: [
        {
          id: 'basic',
          name: '基础节拍',
          icon: '🎵',
          level: 'beginner',
          levelText: '初级',
          description: '建立基本的节拍感知，培养稳定的阅读节奏',
          bpmRange: '60-120',
          textType: '简单文章',
          duration: '10分钟',
          progress: 75,
          minBPM: 60,
          maxBPM: 120
        },
        {
          id: 'intermediate',
          name: '进阶节拍',
          icon: '🎼',
          level: 'intermediate',
          levelText: '中级',
          description: '提高节拍控制能力，适应不同速度的阅读',
          bpmRange: '80-160',
          textType: '中等文章',
          duration: '15分钟',
          progress: 45,
          minBPM: 80,
          maxBPM: 160
        },
        {
          id: 'advanced',
          name: '高速节拍',
          icon: '🚀',
          level: 'advanced',
          levelText: '高级',
          description: '挑战高速阅读节拍，提升快速阅读能力',
          bpmRange: '120-240',
          textType: '复杂文章',
          duration: '20分钟',
          progress: 20,
          minBPM: 120,
          maxBPM: 240
        },
        {
          id: 'variable',
          name: '变速节拍',
          icon: '🌊',
          level: 'advanced',
          levelText: '高级',
          description: '练习节拍变化适应，提高阅读灵活性',
          bpmRange: '60-200',
          textType: '混合文章',
          duration: '25分钟',
          progress: 10,
          minBPM: 60,
          maxBPM: 200
        },
        {
          id: 'progressive',
          name: '渐进式节拍',
          icon: '📈',
          level: 'intermediate',
          levelText: '中级',
          description: '从慢速开始逐渐加快，循序渐进提升阅读速度',
          bpmRange: '60-180',
          textType: '渐进文章',
          duration: '18分钟',
          progress: 30,
          minBPM: 60,
          maxBPM: 180
        },
        {
          id: 'compound',
          name: '复合节拍',
          icon: '🎭',
          level: 'advanced',
          levelText: '高级',
          description: '练习复杂节拍模式，提高节奏适应能力',
          bpmRange: '80-160',
          textType: '复合文章',
          duration: '22分钟',
          progress: 15,
          minBPM: 80,
          maxBPM: 160
        },
        {
          id: 'synchronized',
          name: '同步阅读',
          icon: '🔄',
          level: 'intermediate',
          levelText: '中级',
          description: '眼动与节拍完全同步，建立精确的阅读节奏',
          bpmRange: '90-150',
          textType: '同步文章',
          duration: '16分钟',
          progress: 40,
          minBPM: 90,
          maxBPM: 150
        },
        {
          id: 'adaptive',
          name: '自适应节拍',
          icon: '🧠',
          level: 'advanced',
          levelText: '高级',
          description: '根据理解程度自动调整节拍，智能化训练',
          bpmRange: '70-200',
          textType: '智能文章',
          duration: '20分钟',
          progress: 25,
          minBPM: 70,
          maxBPM: 200
        }
      ],
      
      // 当前训练模式数据
      currentModeData: {},
      
      // 阅读文本
      currentText: {
        title: '',
        words: []
      },
      
      // 训练设置
      settings: {
        startBPM: 100,
        targetBPM: 150,
        beatsPerMeasure: 4,
        textDifficulty: 'medium',
        fontSize: 18,
        showHighlight: true,
        duration: 15,
        autoAdjustBPM: true,
        soundEnabled: true
      },
      
      // 统计数据
      statistics: {
        totalSessions: 24,
        totalTime: 7200, // 秒
        averageAccuracy: 87,
        maxBPM: 180,
        rhythmRating: 4,
        fluencyRating: 3,
        speedRating: 4,
        focusRating: 3,
        progressData: [
          { accuracy: 65 },
          { accuracy: 72 },
          { accuracy: 78 },
          { accuracy: 85 },
          { accuracy: 89 },
          { accuracy: 87 },
          { accuracy: 92 }
        ]
      },
      
      // 完成数据
      completionData: {
        accuracy: 0,
        duration: 0,
        averageBPM: 0,
        wordsRead: 0,
        beatAccuracy: 0,
        achievement: null
      },
      
      // 定时器
      trainingTimer: null,
      beatTimer: null,
      readingTimer: null,
      progressiveTimer: null,
      
      // 新增训练模式数据
      progressiveData: {
        currentPhase: 0,
        phases: [
          { bpm: 60, duration: 300 }, // 5分钟
          { bpm: 90, duration: 300 },
          { bpm: 120, duration: 300 },
          { bpm: 150, duration: 300 },
          { bpm: 180, duration: 180 }  // 3分钟
        ]
      },
      
      compoundData: {
        currentPattern: 0,
        patterns: [
          { beats: [1, 0, 1, 0], name: '二拍' },
          { beats: [1, 0, 0, 1, 0, 0], name: '三拍' },
          { beats: [1, 0, 1, 1, 0, 1, 0, 0], name: '复合拍' },
          { beats: [1, 1, 0, 1, 0, 1, 1, 0], name: '切分拍' }
        ],
        currentBeatIndex: 0
      },
      
      synchronizedData: {
        eyeTrackingEnabled: false,
        syncAccuracy: 100,
        missedBeats: 0,
        perfectSyncs: 0
      },
      
      adaptiveData: {
        comprehensionScore: 0,
        adjustmentHistory: [],
        lastAdjustment: 0,
        comprehensionQuestions: [],
        currentQuestion: null
      }
    }
  },
  
  computed: {
    readingProgress() {
      if (this.currentText.words.length === 0) return 0
      return (this.currentWordIndex / this.currentText.words.length) * 100
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
      this.currentBPM = this.settings.startBPM
      this.beatsPerMeasure = this.settings.beatsPerMeasure
      
      // 加载训练文本
      this.loadTrainingText()
      
      // 重置训练状态
      this.resetTrainingState()
      
      // 根据模式初始化特定数据
      this.initializeModeSpecificData(modeId)
      
      this.isTraining = true
      this.startBeatTimer()
      this.startTrainingTimer()
      this.startReadingTimer()
      
      // 启动模式特定的定时器
      this.startModeSpecificTimers(modeId)
    },
    
    // 暂停训练
    pauseTraining() {
      this.isPaused = true
      this.clearTimers()
    },
    
    // 恢复训练
    resumeTraining() {
      this.isPaused = false
      this.startBeatTimer()
      this.startTrainingTimer()
      this.startReadingTimer()
    },
    
    // 停止训练
    stopTraining() {
      this.clearTimers()
      this.calculateCompletionData()
      this.showCompletionModal = true
      this.isTraining = false
      this.isPaused = false
    },
    
    // 调整BPM
    adjustBPM(delta) {
      const newBPM = this.currentBPM + delta
      if (newBPM >= this.currentModeData.minBPM && newBPM <= this.currentModeData.maxBPM) {
        this.currentBPM = newBPM
        if (this.isTraining && !this.isPaused) {
          this.restartBeatTimer()
        }
      }
    },
    
    // 开始节拍定时器
    startBeatTimer() {
      const interval = 60000 / this.currentBPM // 毫秒
      this.beatTimer = setInterval(() => {
        this.beatActive = true
        setTimeout(() => {
          this.beatActive = false
        }, 100)
        
        this.currentBeat = (this.currentBeat % this.beatsPerMeasure) + 1
        
        if (this.settings.soundEnabled) {
          this.playBeatSound()
        }
      }, interval)
    },
    
    // 重启节拍定时器
    restartBeatTimer() {
      if (this.beatTimer) {
        clearInterval(this.beatTimer)
      }
      this.startBeatTimer()
    },
    
    // 开始训练定时器
    startTrainingTimer() {
      this.trainingTimer = setInterval(() => {
        this.trainingTime++
        this.updateReadingSpeed()
      }, 1000)
    },
    
    // 开始阅读定时器
    startReadingTimer() {
      const wordsPerBeat = 1 // 每拍一个词
      const interval = (60000 / this.currentBPM) * wordsPerBeat
      
      this.readingTimer = setInterval(() => {
        if (this.currentWordIndex < this.currentText.words.length - 1) {
          this.currentWordIndex++
          
          // 高亮显示
          if (this.settings.showHighlight) {
            this.highlightIndex = this.currentWordIndex
            setTimeout(() => {
              this.highlightIndex = -1
            }, 200)
          }
        } else {
          // 完成当前段落
          this.completedParagraphs++
          this.loadNextParagraph()
        }
      }, interval)
    },
    
    // 清除定时器
    clearTimers() {
      if (this.trainingTimer) {
        clearInterval(this.trainingTimer)
        this.trainingTimer = null
      }
      if (this.beatTimer) {
        clearInterval(this.beatTimer)
        this.beatTimer = null
      }
      if (this.readingTimer) {
        clearInterval(this.readingTimer)
        this.readingTimer = null
      }
      if (this.progressiveTimer) {
        clearTimeout(this.progressiveTimer)
        this.progressiveTimer = null
      }
      
      // 移除事件监听器
      document.removeEventListener('keydown', this.handleSyncKeyPress)
    },
    
    // 播放节拍声音
    playBeatSound() {
      // 这里可以添加音频播放逻辑
      // 使用Web Audio API或HTML5 Audio
    },
    
    // 加载训练文本
    loadTrainingText() {
      // 根据难度和模式加载相应文本
      const textLibrary = {
        basic: {
          easy: '春天来了，花儿开了。小鸟在枝头歌唱，蝴蝶在花丛中飞舞。孩子们在草地上快乐地玩耍。',
          medium: '阅读是获取知识的重要途径。通过阅读，我们可以了解世界，增长见识，提高思维能力。',
          hard: '人工智能技术的快速发展正在改变我们的生活方式。机器学习算法能够处理大量数据，为各行各业提供智能化解决方案。'
        },
        progressive: {
          easy: '慢慢地读每一个字。感受文字的节奏。让眼睛跟随节拍移动。保持稳定的速度。',
          medium: '渐进式阅读训练帮助建立稳定的阅读节奏。从慢速开始，逐步提高速度，让大脑适应不同的阅读节拍。',
          hard: '神经科学研究表明，有节奏的阅读训练能够优化大脑的信息处理机制，提高阅读效率和理解能力。'
        },
        compound: {
          easy: '复合节拍训练。强拍弱拍交替。感受节奏变化。适应复杂模式。',
          medium: '复合节拍模式训练大脑处理复杂节奏信息的能力。不同的节拍组合挑战我们的节奏感知。',
          hard: '音乐理论中的复合拍子概念应用于阅读训练，能够提高大脑对复杂时间模式的适应性和处理能力。'
        },
        synchronized: {
          easy: '同步阅读需要精确配合。眼动与节拍完全一致。按空格键保持同步。',
          medium: '同步阅读训练要求眼球运动与节拍器完美配合。这种训练能够提高阅读的精确性和流畅度。',
          hard: '眼动追踪研究显示，同步阅读训练能够优化眼球运动模式，减少回视次数，提高阅读效率。'
        },
        adaptive: {
          easy: '自适应训练会根据你的理解程度调整速度。专注阅读内容，系统会智能优化。',
          medium: '自适应阅读系统通过监测理解程度自动调整训练参数。这种个性化方法能够最大化训练效果。',
          hard: '认知负荷理论指导下的自适应阅读训练系统，能够根据个体差异动态调整训练强度，实现最优学习效果。'
        },
        variable: {
          easy: '变速训练挑战适应能力。速度时快时慢。保持专注和灵活性。',
          medium: '变速节拍训练提高阅读的灵活性和适应性。在不同速度间切换，锻炼大脑的调节能力。',
          hard: '变速阅读训练基于认知灵活性理论，通过频繁的速度变化提高大脑的执行控制能力。'
        }
      }
      
      const modeTexts = textLibrary[this.selectedMode] || textLibrary.basic
      const text = modeTexts[this.settings.textDifficulty] || modeTexts.medium
      
      this.currentText = {
        title: `${this.currentModeData.name} - ${this.settings.textDifficulty}`,
        words: text.split('')
      }
    },
    
    // 加载下一段落
    loadNextParagraph() {
      this.currentWordIndex = 0
      this.loadTrainingText() // 重新加载文本
    },
    
    // 重置训练状态
    resetTrainingState() {
      this.currentWordIndex = 0
      this.highlightIndex = -1
      this.trainingTime = 0
      this.readingSpeed = 0
      this.beatAccuracy = 100
      this.completedParagraphs = 0
      this.currentBeat = 1
    },
    
    // 更新阅读速度
    updateReadingSpeed() {
      if (this.trainingTime > 0) {
        const wordsPerSecond = this.currentWordIndex / this.trainingTime
        this.readingSpeed = Math.round(wordsPerSecond * 60)
      }
    },
    
    // 计算完成数据
    calculateCompletionData() {
      this.completionData = {
        accuracy: Math.round(this.beatAccuracy),
        duration: this.trainingTime,
        averageBPM: this.currentBPM,
        wordsRead: this.currentWordIndex,
        beatAccuracy: this.beatAccuracy,
        achievement: this.getAchievement()
      }
    },
    
    // 获取成就
    getAchievement() {
      if (this.beatAccuracy >= 95) {
        return {
          title: '节拍大师',
          description: '保持了极高的节拍准确度！'
        }
      } else if (this.completedParagraphs >= 5) {
        return {
          title: '阅读达人',
          description: '完成了多个段落的训练！'
        }
      }
      return null
    },
    
    // 格式化时间
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    // 关闭弹窗
    closeModal() {
      this.showCompletionModal = false
    },
    
    // 重新开始训练
    restartTraining() {
      this.closeModal()
      this.startTraining(this.selectedMode)
    },
    
    // 保存设置
    saveSettings() {
      localStorage.setItem('readingRhythmSettings', JSON.stringify(this.settings))
    },
    
    // 加载设置
    loadSettings() {
      const saved = localStorage.getItem('readingRhythmSettings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    },
    
    // 保存统计数据
    saveStatistics() {
      localStorage.setItem('readingRhythmStats', JSON.stringify(this.statistics))
    },
    
    // 加载统计数据
    loadStatistics() {
      const saved = localStorage.getItem('readingRhythmStats')
      if (saved) {
        this.statistics = { ...this.statistics, ...JSON.parse(saved) }
      }
    },
    
    // 初始化模式特定数据
    initializeModeSpecificData(modeId) {
      switch (modeId) {
        case 'progressive':
          this.progressiveData.currentPhase = 0
          this.currentBPM = this.progressiveData.phases[0].bpm
          break
        case 'compound':
          this.compoundData.currentPattern = 0
          this.compoundData.currentBeatIndex = 0
          break
        case 'synchronized':
          this.synchronizedData.syncAccuracy = 100
          this.synchronizedData.missedBeats = 0
          this.synchronizedData.perfectSyncs = 0
          break
        case 'adaptive':
          this.adaptiveData.comprehensionScore = 0
          this.adaptiveData.adjustmentHistory = []
          this.generateComprehensionQuestions()
          break
      }
    },
    
    // 启动模式特定定时器
    startModeSpecificTimers(modeId) {
      switch (modeId) {
        case 'progressive':
          this.startProgressiveTimer()
          break
        case 'compound':
          this.startCompoundBeatTimer()
          break
        case 'synchronized':
          this.startSynchronizedTracking()
          break
        case 'adaptive':
          this.startAdaptiveMonitoring()
          break
      }
    },
    
    // 渐进式节拍定时器
    startProgressiveTimer() {
      const currentPhase = this.progressiveData.phases[this.progressiveData.currentPhase]
      this.progressiveTimer = setTimeout(() => {
        if (this.progressiveData.currentPhase < this.progressiveData.phases.length - 1) {
          this.progressiveData.currentPhase++
          const nextPhase = this.progressiveData.phases[this.progressiveData.currentPhase]
          this.currentBPM = nextPhase.bpm
          this.startProgressiveTimer() // 递归启动下一阶段
        }
      }, currentPhase.duration * 1000)
    },
    
    // 复合节拍定时器
    startCompoundBeatTimer() {
      const pattern = this.compoundData.patterns[this.compoundData.currentPattern]
      const interval = 60000 / this.currentBPM
      
      this.beatTimer = setInterval(() => {
        const currentBeat = pattern.beats[this.compoundData.currentBeatIndex]
        
        if (currentBeat === 1) {
          this.beatActive = true
          setTimeout(() => {
            this.beatActive = false
          }, 100)
          
          if (this.settings.soundEnabled) {
            this.playBeatSound()
          }
        }
        
        this.compoundData.currentBeatIndex = 
          (this.compoundData.currentBeatIndex + 1) % pattern.beats.length
      }, interval)
    },
    
    // 同步阅读跟踪
    startSynchronizedTracking() {
      // 监听用户的阅读行为，计算同步准确度
      document.addEventListener('keydown', this.handleSyncKeyPress)
    },
    
    // 处理同步按键
    handleSyncKeyPress(event) {
      if (event.code === 'Space' && this.selectedMode === 'synchronized') {
        const timeDiff = Math.abs(Date.now() - this.lastBeatTime)
        const tolerance = 200 // 200ms容差
        
        if (timeDiff <= tolerance) {
          this.synchronizedData.perfectSyncs++
          this.synchronizedData.syncAccuracy = Math.min(100, 
            this.synchronizedData.syncAccuracy + 1)
        } else {
          this.synchronizedData.missedBeats++
          this.synchronizedData.syncAccuracy = Math.max(0, 
            this.synchronizedData.syncAccuracy - 2)
        }
      }
    },
    
    // 自适应监控
    startAdaptiveMonitoring() {
      // 每30秒检查一次理解程度
      setInterval(() => {
        if (this.selectedMode === 'adaptive') {
          this.checkComprehension()
        }
      }, 30000)
    },
    
    // 检查理解程度
    checkComprehension() {
      if (this.adaptiveData.comprehensionQuestions.length > 0) {
        this.adaptiveData.currentQuestion = 
          this.adaptiveData.comprehensionQuestions.shift()
        // 这里可以显示理解问题的弹窗
      }
    },
    
    // 生成理解问题
    generateComprehensionQuestions() {
      this.adaptiveData.comprehensionQuestions = [
        {
          question: '刚才阅读的内容主要讲述了什么？',
          options: ['科技发展', '自然现象', '人文历史', '其他'],
          correct: 0
        },
        {
          question: '文中提到的关键词是什么？',
          options: ['发展', '变化', '影响', '以上都是'],
          correct: 3
        }
      ]
    },
    
    // 调整自适应BPM
    adjustAdaptiveBPM(comprehensionScore) {
      const adjustment = comprehensionScore > 80 ? 10 : -5
      const newBPM = Math.max(this.currentModeData.minBPM, 
        Math.min(this.currentModeData.maxBPM, this.currentBPM + adjustment))
      
      if (newBPM !== this.currentBPM) {
        this.adaptiveData.adjustmentHistory.push({
          time: Date.now(),
          oldBPM: this.currentBPM,
          newBPM: newBPM,
          reason: comprehensionScore > 80 ? '理解良好，加速' : '理解困难，减速'
        })
        this.currentBPM = newBPM
      }
    }
  },
  
  mounted() {
    this.loadSettings()
    this.loadStatistics()
  },
  
  beforeUnmount() {
    this.clearTimers()
  },
  
  watch: {
    settings: {
      handler() {
        this.saveSettings()
      },
      deep: true
    },
    
    currentBPM() {
      if (this.isTraining && !this.isPaused) {
        this.restartBeatTimer()
        if (this.readingTimer) {
          clearInterval(this.readingTimer)
          this.startReadingTimer()
        }
      }
    }
  }
}
</script>

<style scoped>
.reading-rhythm-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  color: var(--color-primary);
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.page-description {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

.training-modes {
  margin-bottom: 3rem;
}

.training-modes h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.mode-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  border: 2px solid transparent;
}

.mode-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.mode-card.active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.mode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.mode-icon {
  font-size: 2rem;
}

.mode-level {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.mode-level.beginner {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.mode-level.intermediate {
  background: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning);
}

.mode-level.advanced {
  background: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
}

.mode-card h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.mode-description {
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.mode-details {
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  font-size: 0.85rem;
}

.detail-label {
  color: var(--color-text-secondary);
}

.detail-value {
  color: var(--color-primary);
  font-weight: 600;
}

.mode-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.start-mode-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 100%;
}

.start-mode-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.training-interface {
  margin-bottom: 3rem;
}

.training-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  border: 2px solid rgba(var(--color-primary-rgb), 0.1);
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.training-header h3 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.5rem;
}

.training-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.metronome-section {
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.metronome-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.bpm-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 50%;
  background: rgba(var(--color-primary-rgb), 0.1);
  transition: all var(--transition-normal);
  min-width: 100px;
  min-height: 100px;
  justify-content: center;
}

.bpm-indicator.active {
  background: var(--color-primary);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.5);
}

.bpm-value {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
}

.bpm-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.beat-counter {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
}

.beat-number {
  font-size: 3rem;
  font-weight: bold;
  color: var(--color-primary);
}

.beat-total {
  font-size: 1.5rem;
  color: var(--color-text-secondary);
}

.bpm-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.bpm-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  min-width: 50px;
}

.bpm-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.bpm-slider {
  flex: 1;
  max-width: 300px;
  margin: 0 1rem;
}

.reading-content {
  margin-bottom: 2rem;
}

.text-display {
  background: rgba(var(--color-bg-rgb), 0.5);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1rem;
  min-height: 200px;
}

.reading-text {
  line-height: 2;
  font-size: var(--font-size, 18px);
  text-align: justify;
}

.word-item {
  display: inline;
  padding: 0.1rem 0.2rem;
  margin: 0.1rem;
  border-radius: 3px;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.word-item.current {
  background: rgba(var(--color-primary-rgb), 0.2);
  color: var(--color-primary);
  font-weight: bold;
}

.word-item.read {
  opacity: 0.6;
  color: var(--color-text-secondary);
}

.word-item.highlight {
  background: var(--color-warning);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(var(--color-warning-rgb), 0.5);
}

.reading-progress {
  background: rgba(var(--color-primary-rgb), 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.training-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.3rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

.training-settings {
  margin-bottom: 3rem;
}

.training-settings h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.setting-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.setting-card h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.setting-item {
  margin-bottom: 1rem;
}

.setting-item label {
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  cursor: pointer;
}

.number-input, .select-input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
  width: 100%;
}

.range-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.range-input {
  flex: 1;
}

.range-value {
  color: var(--color-primary);
  font-weight: 600;
  min-width: 60px;
}

.training-statistics {
  margin-bottom: 3rem;
}

.training-statistics h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.stats-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.stats-card h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.stats-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stats-overview .stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
}

.stat-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-info .stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.2rem;
}

.stat-info .stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.performance-chart {
  height: 200px;
  position: relative;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 100%;
  padding: 1rem 0;
}

.chart-bar {
  background: var(--color-primary);
  width: 25px;
  min-height: 10px;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all var(--transition-normal);
  cursor: pointer;
}

.chart-bar:hover {
  background: var(--color-primary-dark);
}

.bar-label {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.6rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.ability-ratings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rating-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-label {
  color: var(--color-text);
  font-size: 0.9rem;
}

.rating-stars {
  display: flex;
  gap: 0.2rem;
}

.star {
  font-size: 1rem;
  opacity: 0.3;
  transition: opacity var(--transition-normal);
}

.star.filled {
  opacity: 1;
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
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.completion-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: center;
}

.stat-circle {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.circle-progress {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    var(--color-primary) calc(var(--progress) * 1%),
    rgba(var(--color-primary-rgb), 0.1) 0
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle-progress::before {
  content: '';
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background: var(--color-card-bg);
  position: absolute;
}

.circle-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1;
}

.circle-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

.circle-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.completion-details {
  flex: 1;
}

.completion-details .detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
}

.completion-details .detail-label {
  color: var(--color-text-secondary);
}

.completion-details .detail-value {
  color: var(--color-primary);
  font-weight: 600;
}

.achievement {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(var(--color-warning-rgb), 0.1);
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.achievement-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.achievement-text h4 {
  color: var(--color-warning);
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.achievement-text p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 0.8rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.primary-btn, .secondary-btn {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.primary-btn {
  background: var(--color-primary);
  color: white;
}

.primary-btn:hover {
  background: var(--color-primary-dark);
}

.secondary-btn {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.secondary-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.2);
}

/* 新增训练模式特定样式 */
.mode-specific-info {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.mode-specific-info h4 {
  color: var(--color-primary);
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

/* 渐进式节拍样式 */
.progressive-phases {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.phase-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border-radius: 6px;
  background: rgba(var(--color-text-rgb), 0.1);
  min-width: 80px;
  transition: all var(--transition-normal);
}

.phase-item.active {
  background: var(--color-primary);
  color: white;
  transform: scale(1.05);
}

.phase-item.completed {
  background: rgba(var(--color-success-rgb), 0.2);
  color: var(--color-success);
}

.phase-bpm {
  font-weight: bold;
  font-size: 0.9rem;
}

.phase-duration {
  font-size: 0.7rem;
  opacity: 0.8;
}

/* 复合节拍样式 */
.compound-pattern {
  text-align: center;
}

.pattern-name {
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--color-primary);
}

.beat-pattern {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}

.beat-dot {
  transition: all var(--transition-normal);
  padding: 0.2rem;
  border-radius: 50%;
}

.beat-dot.strong {
  color: var(--color-primary);
  font-weight: bold;
}

.beat-dot.weak {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.beat-dot.current {
  background: var(--color-primary);
  color: white;
  transform: scale(1.2);
}

/* 同步阅读样式 */
.sync-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.sync-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.8rem;
  background: rgba(var(--color-text-rgb), 0.05);
  border-radius: 6px;
}

.sync-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.3rem;
}

.sync-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-primary);
}

.sync-instruction {
  text-align: center;
  padding: 0.8rem;
  background: rgba(var(--color-info-rgb), 0.1);
  border-radius: 6px;
  border: 1px dashed var(--color-info);
}

.sync-instruction p {
  margin: 0;
  color: var(--color-info);
  font-size: 0.9rem;
}

/* 自适应节拍样式 */
.adaptive-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.adaptive-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.8rem;
  background: rgba(var(--color-text-rgb), 0.05);
  border-radius: 6px;
}

.adaptive-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.3rem;
}

.adaptive-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-primary);
}

.adjustment-history {
  padding: 0.8rem;
  background: rgba(var(--color-warning-rgb), 0.1);
  border-radius: 6px;
  border-left: 3px solid var(--color-warning);
}

.last-adjustment {
  font-size: 0.9rem;
  color: var(--color-warning);
  font-weight: 500;
}

.primary-btn {
  background: var(--color-primary);
  color: white;
}

.primary-btn:hover {
  background: var(--color-primary-dark);
}

.secondary-btn {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.secondary-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.2);
}

@media (max-width: 768px) {
  .reading-rhythm-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .modes-grid {
    grid-template-columns: 1fr;
  }
  
  .metronome-display {
    flex-direction: column;
    gap: 1rem;
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
    flex-direction: column;
    gap: 1rem;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .completion-stats {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .range-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .range-value {
    text-align: center;
    min-width: auto;
  }
  
  .reading-text {
    font-size: 16px;
  }
}
</style>