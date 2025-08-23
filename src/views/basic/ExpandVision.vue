<template>
  <div class="expand-vision-container">

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
              <span class="detail-label">训练时长:</span>
              <span class="detail-value">{{ mode.duration }}分钟</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">难度等级:</span>
              <span class="detail-value">{{ mode.difficulty }}/5</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">推荐年龄:</span>
              <span class="detail-value">{{ mode.ageRange }}</span>
            </div>
          </div>
          <div class="mode-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: mode.progress + '%' }"></div>
            </div>
            <div class="progress-text">完成度: {{ mode.progress }}%</div>
          </div>
          <button class="start-mode-btn" @click.stop="startTraining(mode.id)">
            {{ mode.progress > 0 ? '继续训练' : '开始训练' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 训练界面 -->
    <div class="training-interface" v-if="trainingManager.isTraining.value">
      <div class="training-card">
        <div class="training-header">
          <h3>{{ getCurrentMode().name }}</h3>
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

        <!-- 训练计时器 -->
        <div class="training-timer">
          <div class="timer-display">
            <div class="time-remaining">{{ trainingManager.formatDuration(timeRemaining) }}</div>
            <div class="session-info">第 {{ currentSession }}/{{ totalSessions }} 轮</div>
          </div>
          <div class="timer-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: timerProgress + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 训练内容 -->
        <div class="training-content">
          <div class="instruction">{{ getCurrentInstruction() }}</div>
          
          <!-- 点阵训练 -->
          <div v-if="selectedMode === 'dots'" class="dots-training">
            <div class="vision-field" ref="visionField">
              <div class="center-point">+</div>
              <div 
                v-for="dot in currentDots" 
                :key="dot.id"
                class="dot-item"
                :class="{ active: dot.active, clicked: dot.clicked }"
                :style="{ 
                  left: dot.x + 'px',
                  top: dot.y + 'px',
                  backgroundColor: dot.color
                }"
                @click="clickDot(dot.id)"
              ></div>
            </div>
            <div class="training-stats">
              <div class="stat-item">
                <span class="stat-label">已点击</span>
                <span class="stat-value">{{ dotsClicked }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">总数</span>
                <span class="stat-value">{{ totalDots }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">准确率</span>
                <span class="stat-value">{{ accuracy }}%</span>
              </div>
            </div>
          </div>
          
          <!-- 数字追踪训练 -->
          <div v-if="selectedMode === 'numbers'" class="numbers-training">
            <div class="vision-field" ref="visionField">
              <div class="center-point">+</div>
              <div 
                v-for="number in currentNumbers" 
                :key="number.id"
                class="number-item"
                :class="{ target: number.value === targetNumber, found: number.found }"
                :style="{
                  left: number.x + 'px',
                  top: number.y + 'px'
                }"
                @click="clickNumber(number.id)"
              >
                {{ number.value }}
              </div>
            </div>
            <div class="target-info">
              <div class="target-display">
                寻找数字: <span class="target-number">{{ targetNumber }}</span>
              </div>
              <div class="found-count">
                已找到: {{ numbersFound }}/{{ targetCount }}
              </div>
            </div>
          </div>
          
          <!-- 形状识别训练 -->
          <div v-if="selectedMode === 'shapes'" class="shapes-training">
            <div class="vision-field" ref="visionField">
              <div class="center-point">+</div>
              <div 
                v-for="shape in currentShapes" 
                :key="shape.id"
                class="shape-item"
                :class="[shape.type, { target: isTargetShape(shape), found: shape.found }]"
                :style="{
                  left: shape.x + 'px',
                  top: shape.y + 'px',
                  backgroundColor: shape.color,
                  borderColor: shape.type === 'triangle' ? shape.color : 'transparent'
                }"
                @click="clickShape(shape.id)"
              ></div>
            </div>
            <div class="target-info">
              <div class="target-display">
                寻找: <span class="target-shape">{{ targetShape.name }}</span>
              </div>
              <div class="found-count">
                已找到: {{ shapesFound }}/{{ targetCount }}
              </div>
            </div>
          </div>
          
          <!-- 文字扫描训练 -->
          <div v-if="selectedMode === 'text'" class="text-training">
            <div class="vision-field" ref="visionField">
              <div class="center-point">+</div>
              <div 
                v-for="word in currentWords" 
                :key="word.id"
                class="word-item"
                :class="{ target: word.text === targetWord, found: word.found }"
                :style="{
                  left: word.x + 'px',
                  top: word.y + 'px'
                }"
                @click="clickWord(word.id)"
              >
                {{ word.text }}
              </div>
            </div>
            <div class="target-info">
              <div class="target-display">
                寻找词汇: <span class="target-word">{{ targetWord }}</span>
              </div>
              <div class="found-count">
                已找到: {{ wordsFound }}/{{ targetCount }}
              </div>
            </div>
          </div>
          
          <!-- 动态追踪训练 -->
          <div v-if="selectedMode === 'motion'" class="motion-training">
            <div class="vision-field" ref="visionField">
              <div class="center-point">+</div>
              <div 
                v-for="target in currentMotionTargets" 
                :key="target.id"
                class="motion-target"
                :style="{
                  left: target.x + 'px',
                  top: target.y + 'px',
                  width: settingsManager.settings.targetSize + 'px',
                  height: settingsManager.settings.targetSize + 'px'
                }"
                @click="clickMotionTarget(target.id)"
              ></div>
            </div>
            <div class="target-info">
              <div class="target-display">
                追踪移动目标
              </div>
              <div class="found-count">
                已击中: {{ currentSession }}/{{ settingsManager.settings.sessionCount }}
              </div>
            </div>
          </div>
          
          <!-- 周边感知训练 -->
          <div v-if="selectedMode === 'peripheral'" class="peripheral-training">
            <div class="vision-field" ref="visionField">
              <!-- 中心任务区域 -->
              <div class="center-task-area">
                <div 
                  v-for="(number, index) in currentPeripheralData.centerTask.numbers" 
                  :key="'center-' + index"
                  class="center-number"
                >
                  {{ number }}
                </div>
              </div>
              <!-- 周边目标 -->
              <div 
                v-for="target in currentPeripheralData.peripheralTargets" 
                :key="target.id"
                class="peripheral-target"
                :class="{ active: target.active }"
                :style="{
                  left: target.x + 'px',
                  top: target.y + 'px',
                  backgroundColor: target.color
                }"
                @click="clickPeripheralTarget(target.id)"
              ></div>
            </div>
            <div class="dual-task-info">
              <div class="center-task">
                <span>中心任务: 计算数字和</span>
                <input 
                  v-model="peripheralAnswer" 
                  type="number" 
                  class="answer-input"
                  @keyup.enter="submitPeripheralAnswer"
                >
                <button @click="submitPeripheralAnswer" class="submit-btn">提交</button>
              </div>
              <div class="peripheral-task">
                <span>周边任务: 点击闪烁目标</span>
                <span>已点击: {{ peripheralTargetsClicked }}/{{ peripheralTargetsTotal }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置按钮 -->
    <SettingsButton 
      v-if="!trainingManager.isTraining.value" 
      @click="openSettings" 
    />

    <!-- 设置弹窗 -->
    <SettingsModal
      v-if="showSettingsModal"
      :sections="settingsSections"
      :settings="settings"
      @close="closeSettings"
      @save="saveSettings"
      @reset="resetSettings"
    />

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
              <span class="stat-label">平均准确率</span>
              <span class="stat-value">{{ statsManager.formattedStats.value.averageScore }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最佳成绩</span>
              <span class="stat-value">{{ statsManager.formattedStats.value.bestScore || 0 }}分</span>
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
          <h4>能力评级</h4>
          <div class="ability-ratings">
            <div class="rating-item">
              <span class="rating-label">视野范围</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= visionRangeRating }">⭐</span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">反应速度</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= reactionSpeedRating }">⭐</span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">注意力</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= attentionRating }">⭐</span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">准确性</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= accuracyRating }">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 完成弹窗 -->
    <div class="completion-overlay" v-if="showCompletionModal">
      <div class="completion-modal">
        <div class="completion-header">
          <h3>🎉 训练完成！</h3>
        </div>
        <div class="completion-content">
          <div class="completion-stats">
            <div class="stat-item">
              <span class="stat-label">准确率</span>
              <span class="stat-value">{{ completionData.accuracy }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">训练时长</span>
              <span class="stat-value">{{ trainingManager.formatDuration(completionData.duration) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">完成轮数</span>
              <span class="stat-value">{{ completionData.sessions }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均反应</span>
              <span class="stat-value">{{ Math.round(completionData.averageReaction) }}ms</span>
            </div>
          </div>
          
          <div v-if="completionData.newAchievement" class="achievement-notification">
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">
              <h4>{{ completionData.achievementTitle }}</h4>
              <p>{{ completionData.achievementDescription }}</p>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="secondary-btn" @click="closeCompletionModal">返回</button>
          <button class="primary-btn" @click="startNextTraining">继续训练</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useBasicTraining, useBasicTrainingSettings, useBasicTrainingStats } from '@/composables/useBasicTraining'
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import SettingsModal from '@/components/SettingsModal.vue'
import SettingsButton from '@/components/SettingsButton.vue'
import { useTrainingSettings } from '@/composables/useTrainingSettings'

export default {
  name: 'ExpandVision',
  components: {
    SettingsModal,
    SettingsButton
  },
  emits: ['back'],
  setup(props, { emit }) {
    // 使用统一的基础训练管理
    const trainingManager = useBasicTraining('expand_vision')
    const settingsManager = useBasicTrainingSettings(trainingManager)
    const statsManager = useBasicTrainingStats(trainingManager)
    
    // 使用新的设置管理系统
    const {
      settings,
      settingsSections,
      showSettingsModal,
      isLoading: settingsLoading,
      error: settingsError,
      saveSettings: handleSettingsSave,
      resetSettings: handleSettingsReset,
      openSettings,
      closeSettings
    } = useTrainingSettings('expandVision')
    
    // 扩大视野训练特有的状态
    const selectedMode = ref(null)
    const currentSession = ref(1)
    const totalSessions = ref(5)
    const timeRemaining = ref(0)
    const showCompletionModal = ref(false)
    const completionData = ref({})
    
    // 训练模式数据
    const trainingModes = ref([
      {
        id: 'dots',
        name: '点阵训练',
        icon: '🔴',
        description: '通过点击周边出现的彩色圆点，扩大视觉感知范围',
        level: 'beginner',
        levelText: '初级',
        duration: 5,
        difficulty: 2,
        ageRange: '6-12岁',
        progress: 0,
        features: ['基础视野扩展', '颜色识别', '反应训练', '注意力集中'],
        benefits: ['提高周边视觉', '增强反应速度', '改善注意力分配', '扩大视觉范围'],
        bestScore: 0,
        totalAttempts: 0,
        averageAccuracy: 0
      },
      {
        id: 'numbers',
        name: '数字追踪',
        icon: '🔢',
        description: '在视野范围内快速找到指定的数字，提高数字识别能力',
        level: 'intermediate',
        levelText: '中级',
        duration: 8,
        difficulty: 3,
        ageRange: '8-16岁',
        progress: 0,
        features: ['数字识别', '视觉搜索', '目标定位', '快速扫描'],
        benefits: ['提高数字敏感度', '增强搜索效率', '改善目标识别', '训练视觉扫描'],
        bestScore: 0,
        totalAttempts: 0,
        averageAccuracy: 0
      },
      {
        id: 'shapes',
        name: '形状识别',
        icon: '🔺',
        description: '识别不同形状和颜色的目标，训练形状感知和颜色辨识',
        level: 'intermediate',
        levelText: '中级',
        duration: 10,
        difficulty: 3,
        ageRange: '10-18岁',
        progress: 0,
        features: ['形状识别', '颜色辨识', '视觉分类', '特征提取'],
        benefits: ['提高形状感知', '增强颜色敏感度', '改善视觉分类', '训练特征识别'],
        bestScore: 0,
        totalAttempts: 0,
        averageAccuracy: 0
      },
      {
        id: 'text',
        name: '文字扫描',
        icon: '📝',
        description: '在视野中快速定位特定词汇，提升文字识别和阅读效率',
        level: 'advanced',
        levelText: '高级',
        duration: 12,
        difficulty: 4,
        ageRange: '12-20岁',
        progress: 0,
        features: ['文字识别', '词汇搜索', '阅读扫描', '语言处理'],
        benefits: ['提高阅读速度', '增强文字敏感度', '改善扫描技巧', '训练视觉词汇'],
        bestScore: 0,
        totalAttempts: 0,
        averageAccuracy: 0
      },
      {
        id: 'motion',
        name: '动态追踪',
        icon: '🎯',
        description: '追踪移动的目标物体，训练动态视觉和预测能力',
        level: 'advanced',
        levelText: '高级',
        duration: 10,
        difficulty: 4,
        ageRange: '12-20岁',
        progress: 0,
        features: ['动态追踪', '运动预测', '视觉跟踪', '反应协调'],
        benefits: ['提高动态视觉', '增强预测能力', '改善眼球运动', '训练视觉协调'],
        bestScore: 0,
        totalAttempts: 0,
        averageAccuracy: 0
      },
      {
        id: 'peripheral',
        name: '周边感知',
        icon: '👁️',
        description: '专注中心的同时感知周边变化，训练周边视觉敏感度',
        level: 'expert',
        levelText: '专家',
        duration: 15,
        difficulty: 5,
        ageRange: '15-25岁',
        progress: 0,
        features: ['周边视觉', '双重任务', '注意分配', '视觉监控'],
        benefits: ['增强周边感知', '提高多任务能力', '改善注意分配', '训练视觉监控'],
        bestScore: 0,
        totalAttempts: 0,
        averageAccuracy: 0
      }
    ])
    
    // 训练数据
    const currentDots = ref([])
    const dotsClicked = ref(0)
    const totalDots = ref(0)
    
    const currentNumbers = ref([])
    const targetNumber = ref(0)
    const numbersFound = ref(0)
    const targetCount = ref(5)
    
    const currentShapes = ref([])
    const targetShape = ref({ type: 'circle', color: '#ff0000', name: '红色圆形' })
    const shapesFound = ref(0)
    
    const currentWords = ref([])
    const targetWord = ref('')
    const wordsFound = ref(0)
    
    const currentMotionTargets = ref([])
    const motionAnimationId = ref(null)
    
    const currentPeripheralData = reactive({
      centerTask: {
        numbers: [],
        correctAnswer: 0
      },
      peripheralTargets: []
    })
    const peripheralAnswer = ref('')
    const peripheralTargetsClicked = ref(0)
    const peripheralTargetsTotal = ref(0)
    
    // 能力评级
    const visionRangeRating = ref(3)
    const reactionSpeedRating = ref(3)
    const attentionRating = ref(3)
    const accuracyRating = ref(3)
    
    // 计算属性
    const timerProgress = computed(() => {
      const mode = getCurrentMode()
      if (!mode) return 0
      const totalTime = mode.duration * 60
      return ((totalTime - timeRemaining.value) / totalTime) * 100
    })
    
    const accuracy = computed(() => {
      if (totalDots.value === 0) return 0
      return Math.round((dotsClicked.value / totalDots.value) * 100)
    })
    
    // 方法
    const selectMode = (modeId) => {
      selectedMode.value = modeId
    }
    
    const getCurrentMode = () => {
      return trainingModes.value.find(mode => mode.id === selectedMode.value)
    }
    
    const getCurrentInstruction = () => {
      const instructions = {
        dots: '保持注视中心十字，用余光发现并点击周边出现的彩色圆点',
        numbers: '保持注视中心十字，快速找到并点击指定的数字',
        shapes: '保持注视中心十字，识别并点击指定形状和颜色的目标',
        text: '保持注视中心十字，快速定位并点击指定的词汇',
        motion: '保持注视中心十字，追踪并点击移动的目标',
        peripheral: '专注计算中心数字的和，同时点击周边闪烁的目标'
      }
      return instructions[selectedMode.value] || '请选择训练模式'
    }
    
    const startTraining = (modeId) => {
      selectedMode.value = modeId
      const mode = getCurrentMode()
      
      currentSession.value = 1
      totalSessions.value = settingsManager.settings.sessionCount || 5
      timeRemaining.value = mode.duration * 60
      
      initializeTrainingData()
      generateTrainingContent()
      
      // 开始训练会话
      trainingManager.startTrainingSession({
        mode: modeId,
        duration: mode.duration,
        sessions: totalSessions.value
      })
      
      startTimer()
    }
    
    const pauseTraining = () => {
      trainingManager.pauseTraining()
      stopTimer()
    }
    
    const resumeTraining = () => {
      trainingManager.resumeTraining()
      startTimer()
    }
    
    const stopTraining = () => {
      trainingManager.cancelTrainingSession()
      stopTimer()
      clearTrainingData()
    }
    
    // 定时器引用
    let trainingTimer = null
    
    const startTimer = () => {
      if (trainingTimer) {
        clearInterval(trainingTimer)
      }
      
      trainingTimer = setInterval(() => {
        if (!trainingManager.isPaused.value) {
          timeRemaining.value--
          
          if (timeRemaining.value <= 0) {
            completeTraining()
          }
        }
      }, 1000)
    }
    
    const stopTimer = () => {
      if (trainingTimer) {
        clearInterval(trainingTimer)
        trainingTimer = null
      }
    }
    
    const completeTraining = () => {
      stopTimer()
      
      // 计算分数
      const score = calculateScore()
      
      // 生成完成数据
      generateCompletionData(score)
      
      // 结束训练会话
      trainingManager.endTrainingSession({
        score: score,
        completed: true,
        accuracy: accuracy.value,
        mode: selectedMode.value,
        sessions: currentSession.value
      })
      
      // 更新模式进度
      updateModeProgress()
      
      showCompletionModal.value = true
    }
    
    const calculateScore = () => {
      let baseScore = 0
      
      switch (selectedMode.value) {
        case 'dots':
          baseScore = accuracy.value
          break
        case 'numbers':
          baseScore = (numbersFound.value / targetCount.value) * 100
          break
        case 'shapes':
          baseScore = (shapesFound.value / targetCount.value) * 100
          break
        case 'text':
          baseScore = (wordsFound.value / targetCount.value) * 100
          break
        case 'motion':
          baseScore = (currentSession.value / totalSessions.value) * 100
          break
        case 'peripheral':
          baseScore = ((peripheralTargetsClicked.value / peripheralTargetsTotal.value) * 50) + 
                     (peripheralAnswer.value === currentPeripheralData.centerTask.correctAnswer ? 50 : 0)
          break
        default:
          baseScore = 50
      }
      
      return Math.round(baseScore)
    }
    
    const generateCompletionData = (score) => {
      const mode = getCurrentMode()
      completionData.value = {
        accuracy: accuracy.value,
        duration: mode.duration * 60,
        sessions: currentSession.value,
        averageReaction: 450 + Math.random() * 200,
        visionRange: settingsManager.settings.visionRange,
        newAchievement: score > 80,
        achievementTitle: '视野大师',
        achievementDescription: '在扩大视野训练中达到80%以上准确率！'
      }
    }
    
    const updateModeProgress = () => {
      const mode = getCurrentMode()
      if (mode) {
        mode.progress = Math.min(100, mode.progress + 20)
      }
    }
    
    const initializeTrainingData = () => {
      dotsClicked.value = 0
      totalDots.value = 0
      numbersFound.value = 0
      shapesFound.value = 0
      wordsFound.value = 0
      peripheralTargetsClicked.value = 0
      peripheralTargetsTotal.value = 0
      peripheralAnswer.value = ''
    }
    
    const clearTrainingData = () => {
      currentDots.value = []
      currentNumbers.value = []
      currentShapes.value = []
      currentWords.value = []
      currentMotionTargets.value = []
      
      if (motionAnimationId.value) {
        cancelAnimationFrame(motionAnimationId.value)
        motionAnimationId.value = null
      }
    }
    
    const generateTrainingContent = () => {
      switch (selectedMode.value) {
        case 'dots':
          generateDots()
          break
        case 'numbers':
          generateNumbers()
          break
        case 'shapes':
          generateShapes()
          break
        case 'text':
          generateWords()
          break
        case 'motion':
          generateMotionTargets()
          break
        case 'peripheral':
          generatePeripheralTask()
          break
      }
    }
    
    const generateDots = () => {
      const visionRange = settingsManager.settings.visionRange || 400
      const dotCount = 8 + Math.floor(Math.random() * 5)
      const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff']
      
      currentDots.value = []
      totalDots.value = dotCount
      
      for (let i = 0; i < dotCount; i++) {
        const angle = (Math.PI * 2 * i) / dotCount + Math.random() * 0.5
        const distance = 100 + Math.random() * (visionRange / 2 - 100)
        
        currentDots.value.push({
          id: i,
          x: 300 + Math.cos(angle) * distance,
          y: 200 + Math.sin(angle) * distance,
          color: colors[Math.floor(Math.random() * colors.length)],
          active: false,
          clicked: false
        })
      }
      
      // 随机激活点
      activateRandomDot()
    }
    
    const activateRandomDot = () => {
      const availableDots = currentDots.value.filter(dot => !dot.active && !dot.clicked)
      if (availableDots.length > 0) {
        const randomDot = availableDots[Math.floor(Math.random() * availableDots.length)]
        randomDot.active = true
        
        setTimeout(() => {
          if (randomDot.active) {
            randomDot.active = false
            activateRandomDot()
          }
        }, 2000 + Math.random() * 1000)
      }
    }
    
    const generateNumbers = () => {
      const visionRange = settingsManager.settings.visionRange || 400
      const numberCount = 12
      
      currentNumbers.value = []
      targetNumber.value = Math.floor(Math.random() * 9) + 1
      
      for (let i = 0; i < numberCount; i++) {
        const angle = (Math.PI * 2 * i) / numberCount
        const distance = 80 + Math.random() * (visionRange / 2 - 80)
        
        currentNumbers.value.push({
          id: i,
          x: 300 + Math.cos(angle) * distance,
          y: 200 + Math.sin(angle) * distance,
          value: Math.floor(Math.random() * 9) + 1,
          found: false
        })
      }
      
      // 确保至少有一个目标数字
      const randomIndex = Math.floor(Math.random() * numberCount)
      currentNumbers.value[randomIndex].value = targetNumber.value
    }
    
    const generateShapes = () => {
      const visionRange = settingsManager.settings.visionRange || 400
      const shapeCount = 10
      const shapes = ['circle', 'square', 'triangle']
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
      
      currentShapes.value = []
      targetShape.value = {
        type: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        name: getShapeName(shapes[Math.floor(Math.random() * shapes.length)], colors[Math.floor(Math.random() * colors.length)])
      }
      
      for (let i = 0; i < shapeCount; i++) {
        const angle = (Math.PI * 2 * i) / shapeCount
        const distance = 80 + Math.random() * (visionRange / 2 - 80)
        
        currentShapes.value.push({
          id: i,
          x: 300 + Math.cos(angle) * distance,
          y: 200 + Math.sin(angle) * distance,
          type: shapes[Math.floor(Math.random() * shapes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          found: false
        })
      }
      
      // 确保至少有一个目标形状
      const randomIndex = Math.floor(Math.random() * shapeCount)
      currentShapes.value[randomIndex].type = targetShape.value.type
      currentShapes.value[randomIndex].color = targetShape.value.color
    }
    
    const generateWords = () => {
      const visionRange = settingsManager.settings.visionRange || 400
      const wordCount = 8
      const words = ['苹果', '香蕉', '橙子', '葡萄', '草莓', '西瓜', '桃子', '梨子', '樱桃', '柠檬']
      
      currentWords.value = []
      targetWord.value = words[Math.floor(Math.random() * words.length)]
      
      for (let i = 0; i < wordCount; i++) {
        const angle = (Math.PI * 2 * i) / wordCount
        const distance = 100 + Math.random() * (visionRange / 2 - 100)
        
        currentWords.value.push({
          id: i,
          x: 300 + Math.cos(angle) * distance,
          y: 200 + Math.sin(angle) * distance,
          text: words[Math.floor(Math.random() * words.length)],
          found: false
        })
      }
      
      // 确保至少有一个目标词汇
      const randomIndex = Math.floor(Math.random() * wordCount)
      currentWords.value[randomIndex].text = targetWord.value
    }
    
    const generateMotionTargets = () => {
      const targetCount = 3
      currentMotionTargets.value = []
      
      for (let i = 0; i < targetCount; i++) {
        currentMotionTargets.value.push({
          id: i,
          x: Math.random() * 500,
          y: Math.random() * 300,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4
        })
      }
      
      animateMotionTargets()
    }
    
    const animateMotionTargets = () => {
      currentMotionTargets.value.forEach(target => {
        target.x += target.vx
        target.y += target.vy
        
        // 边界反弹
        if (target.x <= 0 || target.x >= 580) target.vx *= -1
        if (target.y <= 0 || target.y >= 380) target.vy *= -1
        
        // 保持在边界内
        target.x = Math.max(0, Math.min(580, target.x))
        target.y = Math.max(0, Math.min(380, target.y))
      })
      
      motionAnimationId.value = requestAnimationFrame(animateMotionTargets)
    }
    
    const generatePeripheralTask = () => {
      // 生成中心任务数字
      const numbers = []
      for (let i = 0; i < 5; i++) {
        numbers.push(Math.floor(Math.random() * 9) + 1)
      }
      currentPeripheralData.centerTask.numbers = numbers
      currentPeripheralData.centerTask.correctAnswer = numbers.reduce((sum, num) => sum + num, 0)
      
      // 生成周边目标
      const targetCount = 6
      peripheralTargetsTotal.value = targetCount
      currentPeripheralData.peripheralTargets = []
      
      for (let i = 0; i < targetCount; i++) {
        const angle = (Math.PI * 2 * i) / targetCount
        const distance = 150 + Math.random() * 100
        
        currentPeripheralData.peripheralTargets.push({
          id: i,
          x: 300 + Math.cos(angle) * distance,
          y: 200 + Math.sin(angle) * distance,
          color: '#ff4444',
          active: false
        })
      }
      
      // 随机激活周边目标
      activatePeripheralTarget()
    }
    
    const activatePeripheralTarget = () => {
      const availableTargets = currentPeripheralData.peripheralTargets.filter(target => !target.active)
      if (availableTargets.length > 0) {
        const randomTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)]
        randomTarget.active = true
        
        setTimeout(() => {
          randomTarget.active = false
          setTimeout(activatePeripheralTarget, 1000 + Math.random() * 2000)
        }, 1500)
      }
    }
    
    // 点击处理方法
    const clickDot = (dotId) => {
      const dot = currentDots.value.find(d => d.id === dotId)
      if (dot && dot.active) {
        dot.clicked = true
        dot.active = false
        dotsClicked.value++
        
        if (settingsManager.settings.soundEnabled) {
          playSuccessSound()
        }
        
        activateRandomDot()
      }
    }
    
    const clickNumber = (numberId) => {
      const number = currentNumbers.value.find(n => n.id === numberId)
      if (number && number.value === targetNumber.value && !number.found) {
        number.found = true
        numbersFound.value++
        
        if (settingsManager.settings.soundEnabled) {
          playSuccessSound()
        }
        
        if (numbersFound.value < targetCount.value) {
          // 生成新的目标数字
          targetNumber.value = Math.floor(Math.random() * 9) + 1
        }
      }
    }
    
    const clickShape = (shapeId) => {
      const shape = currentShapes.value.find(s => s.id === shapeId)
      if (shape && isTargetShape(shape) && !shape.found) {
        shape.found = true
        shapesFound.value++
        
        if (settingsManager.settings.soundEnabled) {
          playSuccessSound()
        }
        
        if (shapesFound.value < targetCount.value) {
          // 生成新的目标形状
          const shapes = ['circle', 'square', 'triangle']
          const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
          targetShape.value = {
            type: shapes[Math.floor(Math.random() * shapes.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            name: getShapeName(shapes[Math.floor(Math.random() * shapes.length)], colors[Math.floor(Math.random() * colors.length)])
          }
        }
      }
    }
    
    const clickWord = (wordId) => {
      const word = currentWords.value.find(w => w.id === wordId)
      if (word && word.text === targetWord.value && !word.found) {
        word.found = true
        wordsFound.value++
        
        if (settingsManager.settings.soundEnabled) {
          playSuccessSound()
        }
        
        if (wordsFound.value < targetCount.value) {
          // 生成新的目标词汇
          const words = ['苹果', '香蕉', '橙子', '葡萄', '草莓', '西瓜', '桃子', '梨子', '樱桃', '柠檬']
          targetWord.value = words[Math.floor(Math.random() * words.length)]
        }
      }
    }
    
    const clickMotionTarget = (targetId) => {
      const targetIndex = currentMotionTargets.value.findIndex(t => t.id === targetId)
      if (targetIndex !== -1) {
        currentMotionTargets.value.splice(targetIndex, 1)
        currentSession.value++
        
        if (settingsManager.settings.soundEnabled) {
          playSuccessSound()
        }
        
        if (currentSession.value >= totalSessions.value) {
          completeTraining()
        }
      }
    }
    
    const clickPeripheralTarget = (targetId) => {
      const target = currentPeripheralData.peripheralTargets.find(t => t.id === targetId)
      if (target && target.active) {
        target.active = false
        peripheralTargetsClicked.value++
        
        if (settingsManager.settings.soundEnabled) {
          playSuccessSound()
        }
      }
    }
    
    const submitPeripheralAnswer = () => {
      const isCorrect = parseInt(peripheralAnswer.value) === currentPeripheralData.centerTask.correctAnswer
      
      if (isCorrect && settingsManager.settings.soundEnabled) {
        playSuccessSound()
      }
      
      // 生成新的中心任务
      generatePeripheralTask()
      peripheralAnswer.value = ''
    }
    
    // 辅助方法
    const isTargetShape = (shape) => {
      return shape.type === targetShape.value.type && shape.color === targetShape.value.color
    }
    
    const getShapeName = (type, color) => {
      const typeNames = {
        circle: '圆形',
        square: '方形',
        triangle: '三角形'
      }
      
      const colorNames = {
        '#ff0000': '红色',
        '#00ff00': '绿色',
        '#0000ff': '蓝色',
        '#ffff00': '黄色',
        '#ff00ff': '紫色'
      }
      
      return `${colorNames[color] || ''}${typeNames[type] || ''}`
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
    
    const getTrendText = (trend) => {
      switch (trend) {
        case 'improving': return '上升'
        case 'declining': return '下降'
        default: return '稳定'
      }
    }
    
    const closeCompletionModal = () => {
      showCompletionModal.value = false
    }
    
    const startNextTraining = () => {
      showCompletionModal.value = false
      const nextModeIndex = trainingModes.value.findIndex(mode => mode.id === selectedMode.value) + 1
      if (nextModeIndex < trainingModes.value.length) {
        startTraining(trainingModes.value[nextModeIndex].id)
      } else {
        startTraining(trainingModes.value[0].id)
      }
    }
    
    // 设置应用方法
    const applySettingsToTraining = () => {
      // 应用设置到训练管理器
      if (settingsManager && settings.value) {
        Object.keys(settings.value).forEach(key => {
          if (settingsManager.settings[key] !== undefined) {
            settingsManager.settings[key] = settings.value[key]
          }
        })
      }
    }
    
    // settingsSections 现在由useTrainingSettings提供
    
    // 生命周期钩子
    onMounted(() => {
      // 设置加载现在由composable自动处理
    })
    
    // 清理函数
    onUnmounted(() => {
      stopTimer()
      clearTrainingData()
    })
    
    // 返回模板需要的所有数据和方法
    return {
      // 训练管理器
      trainingManager,
      settingsManager,
      statsManager,
      
      // 状态
      selectedMode,
      currentSession,
      totalSessions,
      timeRemaining,
      showCompletionModal,
      completionData,
      trainingModes,
      
      // 训练数据
      currentDots,
      dotsClicked,
      totalDots,
      currentNumbers,
      targetNumber,
      numbersFound,
      targetCount,
      currentShapes,
      targetShape,
      shapesFound,
      currentWords,
      targetWord,
      wordsFound,
      currentMotionTargets,
      currentPeripheralData,
      peripheralAnswer,
      peripheralTargetsClicked,
      peripheralTargetsTotal,
      
      // 能力评级
      visionRangeRating,
      reactionSpeedRating,
      attentionRating,
      accuracyRating,
      
      // 计算属性
      timerProgress,
      accuracy,
      
      // 方法
      selectMode,
      getCurrentMode,
      getCurrentInstruction,
      startTraining,
      pauseTraining,
      resumeTraining,
      stopTraining,
      clickDot,
      clickNumber,
      clickShape,
      clickWord,
      clickMotionTarget,
      clickPeripheralTarget,
      submitPeripheralAnswer,
      isTargetShape,
      getTrendText,
      closeCompletionModal,
      startNextTraining,
      
      // 设置相关
      showSettingsModal,
      settings,
      settingsSections,
      openSettings,
      closeSettings,
      saveSettings,
      resetSettings
    }
  }
}
</script>

<style scoped>
.expand-vision-container {
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
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.mode-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
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
  font-size: 1.3rem;
}

.mode-description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

.mode-details {
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.detail-label {
  color: #666;
}

.detail-value {
  font-weight: bold;
  color: #333;
}

.mode-progress {
  margin-bottom: 15px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.85rem;
  color: #666;
  text-align: center;
}

.start-mode-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-mode-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* 训练界面 */
.training-interface {
  max-width: 1000px;
  margin: 0 auto;
}

.training-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 20px;
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.training-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.training-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #667eea;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: #5a6fd8;
  transform: scale(1.1);
}

/* 训练计时器 */
.training-timer {
  margin-bottom: 25px;
}

.timer-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.time-remaining {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.session-info {
  font-size: 1.1rem;
  color: #666;
}

.timer-progress {
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.timer-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 1s ease;
}

/* 训练内容 */
.training-content {
  text-align: center;
}

.instruction {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

/* 视野区域 */
.vision-field {
  position: relative;
  width: 600px;
  height: 400px;
  margin: 20px auto;
  background: #f0f0f0;
  border: 2px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
}

.center-point {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  z-index: 10;
}

/* 点阵训练 */
.dot-item {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.3;
}

.dot-item.active {
  opacity: 1;
  animation: pulse 1s infinite;
}

.dot-item.clicked {
  opacity: 0.5;
  transform: scale(0.8);
}

/* 数字追踪 */
.number-item {
  position: absolute;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #ddd;
  border-radius: 50%;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.number-item.target {
  border-color: #ff4444;
  background: #ffe6e6;
}

.number-item.found {
  background: #e6ffe6;
  border-color: #44ff44;
}

/* 形状识别 */
.shape-item {
  position: absolute;
  width: 25px;
  height: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.shape-item.circle {
  border-radius: 50%;
}

.shape-item.square {
  border-radius: 0;
}

.shape-item.triangle {
  width: 0;
  height: 0;
  background: transparent !important;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 25px solid;
}

.shape-item.found {
  opacity: 0.5;
  transform: scale(0.8);
}

/* 文字扫描 */
.word-item {
  position: absolute;
  padding: 5px 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.word-item.target {
  border-color: #ff4444;
  background: #ffe6e6;
}

.word-item.found {
  background: #e6ffe6;
  border-color: #44ff44;
}

/* 动态追踪 */
.motion-target {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #ff4444;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.1s ease;
}

.motion-target:hover {
  transform: scale(1.2);
}

/* 周边感知 */
.center-task-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 10px;
  z-index: 5;
}

.center-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #333;
  border-radius: 5px;
  font-size: 1.2rem;
  font-weight: bold;
}

.peripheral-target {
  position: absolute;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.peripheral-target.active {
  opacity: 1;
  animation: blink 0.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* 训练统计 */
.training-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

/* 目标信息 */
.target-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.target-display {
  font-size: 1.1rem;
  font-weight: bold;
}

.target-number, .target-shape, .target-word {
  color: #ff4444;
  font-size: 1.3rem;
}

.found-count {
  font-size: 1rem;
  color: #666;
}

/* 双重任务信息 */
.dual-task-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.center-task {
  display: flex;
  align-items: center;
  gap: 10px;
}

.answer-input {
  width: 80px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.submit-btn {
  padding: 5px 15px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover {
  background: #5a6fd8;
}



/* 统计数据 */
.statistics-section {
  max-width: 1000px;
  margin: 0 auto;
}

.statistics-section h3 {
  color: white;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
}

.stats-card h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stats-grid .stat-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.stats-grid .stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.stats-grid .stat-value {
  display: block;
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
}

.stat-value.trend {
  font-size: 1rem;
}

.stat-value.trend.improving {
  color: #4CAF50;
}

.stat-value.trend.declining {
  color: #F44336;
}

.stat-value.trend.stable {
  color: #FF9800;
}

/* 能力评级 */
.ability-ratings {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rating-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.rating-label {
  font-weight: bold;
  color: #333;
}

.rating-stars {
  display: flex;
  gap: 5px;
}

.star {
  font-size: 1.2rem;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.star.active {
  opacity: 1;
}

/* 完成弹窗 */
.completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-modal {
  background: white;
  border-radius: 20px;
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

.completion-header h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.8rem;
}

.completion-content {
  margin-bottom: 30px;
}

.completion-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.completion-stats .stat-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.completion-stats .stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.completion-stats .stat-value {
  display: block;
  font-size: 1.3rem;
  font-weight: bold;
  color: #667eea;
}

.achievement-notification {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 10px;
  color: white;
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-text h4 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.achievement-text p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.primary-btn, .secondary-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.secondary-btn {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #ddd;
}

.secondary-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(102, 126, 234, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
  }
}

/* 响应式设计 */
/* 笔记本屏幕优化 (1024px-1440px) */
@media (min-width: 1024px) and (max-width: 1440px) {
  .expand-vision-container {
    padding: 18px;
  }
  
  .page-header h1 {
    font-size: 2.2rem;
  }
  
  .page-description {
    font-size: 1.05rem;
    max-width: 550px;
  }
  
  .modes-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 18px;
    max-width: 1200px;
  }
  
  .mode-card {
    padding: 22px;
  }
  
  .mode-card h4 {
    font-size: 1.2rem;
  }
  
  .mode-description {
    font-size: 0.9rem;
  }
  
  .training-interface {
    max-width: 900px;
  }
  
  .training-card {
    padding: 25px;
  }
  
  .training-header h3 {
    font-size: 1.4rem;
  }
  
  .vision-field {
    width: 550px;
    height: 380px;
  }
  
  .time-remaining {
    font-size: 1.8rem;
  }
  
  .session-info {
    font-size: 1.05rem;
  }
  
  .instruction {
    font-size: 1.05rem;
    padding: 14px;
  }
  
  .training-stats {
    gap: 18px;
  }
  
  .settings-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
  }
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .completion-modal {
    max-width: 500px;
    padding: 35px;
  }
}

/* 特定笔记本尺寸优化 (1024px-1366px) */
@media (min-width: 1024px) and (max-width: 1366px) {
  .modes-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    max-width: 1100px;
  }
  
  .vision-field {
    width: 520px;
    height: 360px;
  }
  
  .training-interface {
    max-width: 850px;
  }
  
  .completion-stats {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .expand-vision-container {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .modes-grid {
    grid-template-columns: 1fr;
  }
  
  .vision-field {
    width: 100%;
    max-width: 500px;
    height: 300px;
  }
  
  .training-stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .target-info {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .dual-task-info {
    flex-direction: column;
    gap: 15px;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-overview {
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
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .page-description {
    font-size: 1rem;
  }
  
  .mode-card {
    padding: 20px;
  }
  
  .training-card {
    padding: 20px;
  }
  
  .vision-field {
    height: 250px;
  }
  
  .time-remaining {
    font-size: 1.5rem;
  }
  
  .completion-modal {
    padding: 30px;
  }
  
  .range-container {
    flex-direction: column;
    gap: 10px;
  }
}
</style>