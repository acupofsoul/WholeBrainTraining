<template>
  <div class="overall-perception-container">

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
              <span class="detail-label">时长:</span>
              <span class="detail-value">{{ mode.duration }}分钟</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">难度:</span>
              <div class="difficulty-stars">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  class="star"
                  :class="{ 'filled': i <= mode.difficulty }"
                >★</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-label">完成:</span>
              <span class="detail-value">{{ mode.completedCount }}次</span>
            </div>
          </div>
          <div class="mode-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: mode.progress + '%' }"></div>
            </div>
            <span class="progress-text">{{ mode.progress }}%</span>
          </div>
          <div class="mode-features">
            <span v-for="feature in mode.features" :key="feature" class="feature-tag">{{ feature }}</span>
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

      <!-- 训练计时器 -->
      <div class="training-timer">
        <div class="timer-display">
          <span class="time-remaining">{{ formatTime(timeRemaining) }}</span>
          <span class="time-label">剩余时间</span>
        </div>
        <div class="timer-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: timerProgress + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- 训练内容区域 -->
      <div class="training-content">
        <!-- 图形感知训练 -->
        <div v-if="selectedMode.id === 'shapes'" class="shapes-training">
          <div class="instruction">请观察下方图形，记住它们的位置和颜色</div>
          <div class="shapes-grid">
            <div 
              v-for="(shape, index) in currentShapes" 
              :key="index"
              class="shape-item"
              :class="shape.type"
              :style="{ 
                backgroundColor: shape.color,
                left: shape.x + '%',
                top: shape.y + '%'
              }"
            ></div>
          </div>
          <div class="training-stats">
            <div class="stat-item">
              <span class="stat-label">当前关卡:</span>
              <span class="stat-value">{{ currentLevel }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">正确率:</span>
              <span class="stat-value">{{ accuracy }}%</span>
            </div>
          </div>
        </div>

        <!-- 数字感知训练 -->
        <div v-if="selectedMode.id === 'numbers'" class="numbers-training">
          <div class="instruction">记住数字序列，然后按顺序输入</div>
          <div class="numbers-display">
            <div 
              v-for="(number, index) in currentNumbers" 
              :key="index"
              class="number-item"
              :class="{ 'highlighted': index === highlightedIndex }"
            >
              {{ number }}
            </div>
          </div>
          <div v-if="showInput" class="number-input">
            <input 
              v-model="userInput" 
              type="text" 
              placeholder="输入数字序列"
              class="input-field"
              @keyup.enter="checkNumberSequence"
            >
            <button @click="checkNumberSequence" class="check-button">确认</button>
          </div>
        </div>

        <!-- 颜色感知训练 -->
        <div v-if="selectedMode.id === 'colors'" class="colors-training">
          <div class="instruction">找出不同的颜色</div>
          <div class="colors-grid">
            <div 
              v-for="(color, index) in currentColors" 
              :key="index"
              class="color-item"
              :style="{ backgroundColor: color }"
              @click="selectColor(index)"
              :class="{ 'selected': selectedColorIndex === index }"
            ></div>
          </div>
        </div>

        <!-- 文字感知训练 -->
        <div v-if="selectedMode.id === 'words'" class="words-training">
          <div class="instruction">快速阅读下面的文字，然后回答问题</div>
          <div class="text-display" :style="{ fontSize: textSize + 'px' }">
            {{ currentText }}
          </div>
          <div v-if="showQuestions" class="questions">
            <div v-for="(question, index) in currentQuestions" :key="index" class="question-item">
              <p class="question-text">{{ question.text }}</p>
              <div class="answer-options">
                <button 
                  v-for="(option, optionIndex) in question.options" 
                  :key="optionIndex"
                  class="answer-option"
                  @click="selectAnswer(index, optionIndex)"
                >
                  {{ option }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 反馈显示 -->
        <div v-if="showFeedback" class="feedback" :class="feedbackType">
          <div class="feedback-icon">
            {{ feedbackType === 'correct' ? '✓' : '✗' }}
          </div>
          <div class="feedback-message">{{ feedbackMessage }}</div>
        </div>
      </div>

      <!-- 训练进度 -->
      <div class="training-progress">
        <div class="progress-info">
          <span>进度: {{ currentStep }}/{{ totalSteps }}</span>
          <span>得分: {{ currentScore }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (currentStep / totalSteps) * 100 + '%' }"></div>
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
            <label>整体难度:</label>
            <select v-model="settings.difficulty" class="select-input">
              <option value="1">简单</option>
              <option value="2">普通</option>
              <option value="3">困难</option>
              <option value="4">专家</option>
            </select>
          </div>
          <div class="setting-item">
            <label>显示时间:</label>
            <input 
              v-model.number="settings.displayTime" 
              type="range" 
              min="1" 
              max="10" 
              class="range-input"
            >
            <span class="range-value">{{ settings.displayTime }}秒</span>
          </div>
          <div class="setting-item">
            <label>元素数量:</label>
            <input 
              v-model.number="settings.elementCount" 
              type="range" 
              min="3" 
              max="15" 
              class="range-input"
            >
            <span class="range-value">{{ settings.elementCount }}个</span>
          </div>
        </div>

        <div class="setting-card">
          <h4>反馈设置</h4>
          <div class="setting-item">
            <label class="checkbox-label">
              <input v-model="settings.soundEnabled" type="checkbox" class="checkbox-input">
              <span class="checkbox-text">声音反馈</span>
            </label>
          </div>
          <div class="setting-item">
            <label class="checkbox-label">
              <input v-model="settings.visualFeedback" type="checkbox" class="checkbox-input">
              <span class="checkbox-text">视觉反馈</span>
            </label>
          </div>
          <div class="setting-item">
            <label class="checkbox-label">
              <input v-model="settings.showHints" type="checkbox" class="checkbox-input">
              <span class="checkbox-text">显示提示</span>
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
              <span class="stat-label">训练时长:</span>
              <span class="stat-value">{{ todayStats.totalTime }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均准确率:</span>
              <span class="stat-value">{{ todayStats.accuracy }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">进步幅度:</span>
              <span class="stat-value">+{{ todayStats.improvement }}%</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <h4>能力评级</h4>
          <div class="ability-ratings">
            <div class="rating-item">
              <span class="rating-label">图形感知:</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= abilityRatings.shapes }">★</span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">数字感知:</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= abilityRatings.numbers }">★</span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">颜色感知:</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= abilityRatings.colors }">★</span>
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
              <span class="stat-label">准确率:</span>
              <span class="stat-value">{{ completionStats.accuracy }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">用时:</span>
              <span class="stat-value">{{ formatTime(completionStats.duration) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">得分:</span>
              <span class="stat-value">{{ completionStats.score }}</span>
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
  name: 'OverallPerception',
  emits: ['back'],
  setup(props, { emit }) {
    // 使用组合式函数
    const trainingManager = useBasicTraining('overall-perception')
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
    const timeRemaining = ref(0)
    const currentStep = ref(0)
    const totalSteps = ref(10)
    const currentScore = ref(0)
    const currentLevel = ref(1)
    const accuracy = ref(0)
    const showCompletionModal = ref(false)
    const highlightedIndex = ref(-1)
    const showInput = ref(false)
    const userInput = ref('')
    const selectedColorIndex = ref(-1)
    const showFeedback = ref(false)
    const feedbackType = ref('')
    const feedbackMessage = ref('')
    const showQuestions = ref(false)
    const textSize = ref(16)
    
    // 训练模式数据
    const trainingModes = ref([
      {
        id: 'shapes',
        name: '图形感知训练',
        icon: '🔷',
        level: 'beginner',
        levelText: '初级',
        description: '通过观察和记忆各种图形的位置、颜色和形状，提升视觉整体感知能力',
        duration: 10,
        difficulty: 2,
        completedCount: 15,
        progress: 75,
        features: ['多种几何图形', '颜色识别', '位置记忆', '形状匹配'],
        benefits: ['提升视觉注意力', '增强空间感知', '改善图形识别能力']
      },
      {
        id: 'numbers',
        name: '数字感知训练',
        icon: '🔢',
        level: 'intermediate',
        levelText: '中级',
        description: '快速识别和记忆数字序列，训练数字信息的整体处理能力',
        duration: 15,
        difficulty: 3,
        completedCount: 8,
        progress: 60,
        features: ['数字序列记忆', '快速识别', '顺序重现', '数字运算'],
        benefits: ['提升数字敏感度', '增强短期记忆', '改善逻辑思维']
      },
      {
        id: 'colors',
        name: '颜色感知训练',
        icon: '🎨',
        level: 'beginner',
        levelText: '初级',
        description: '识别颜色差异和变化，提升色彩感知的敏锐度和整体观察力',
        duration: 8,
        difficulty: 1,
        completedCount: 22,
        progress: 85,
        features: ['色彩辨识', '细微差别', '颜色搭配', '色调变化'],
        benefits: ['提升色彩敏感度', '增强视觉辨别力', '改善美感认知']
      },
      {
        id: 'words',
        name: '文字感知训练',
        icon: '📝',
        level: 'advanced',
        levelText: '高级',
        description: '快速阅读和理解文字内容，培养文字信息的整体把握能力',
        duration: 20,
        difficulty: 4,
        completedCount: 5,
        progress: 40,
        features: ['快速阅读', '理解测试', '关键词提取', '语义分析'],
        benefits: ['提升阅读速度', '增强理解能力', '改善信息处理']
      }
    ])

    // 训练数据
    const currentShapes = ref([])
    const currentNumbers = ref([])
    const currentColors = ref([])
    const currentText = ref('')
    const currentQuestions = ref([])

    // 能力评级
    const abilityRatings = reactive({
      shapes: 3.5,
      numbers: 2.8,
      colors: 4.2,
      words: 2.1,
      patterns: 3.0,
      spatial: 2.5,
      memory: 3.3,
      attention: 3.8
    })

    // 完成统计
    const completionStats = reactive({
      accuracy: 0,
      duration: 0,
      score: 0,
      level: 1,
      perfectRounds: 0,
      achievement: null
    })

    // 计算属性
    const timerProgress = computed(() => {
      if (!selectedMode.value) return 0
      const totalTime = selectedMode.value.duration * 60
      return ((totalTime - timeRemaining.value) / totalTime) * 100
    })

    // 训练定时器
    let trainingTimer = null

    // 方法
    const selectMode = (mode) => {
      selectedMode.value = mode
    }

    const startTraining = (mode) => {
      selectedMode.value = mode
      isTraining.value = true
      isPaused.value = false
      timeRemaining.value = mode.duration * 60
      currentStep.value = 1
      currentScore.value = 0
      
      // 初始化训练内容
      initializeTrainingContent(mode)
      
      // 启动定时器
      startTimer()
      
      // 调用基础训练函数
      baseStartTraining(mode)
    }

    const togglePause = () => {
      if (isPaused.value) {
        resumeTraining()
        startTimer()
      } else {
        pauseTraining()
        if (trainingTimer) {
          clearInterval(trainingTimer)
        }
      }
    }

    const stopTraining = () => {
      if (trainingTimer) {
        clearInterval(trainingTimer)
      }
      
      // 计算完成统计
      const duration = (selectedMode.value.duration * 60) - timeRemaining.value
      const accuracy = Math.round((currentScore.value / (currentStep.value * 10)) * 100)
      
      completionStats.accuracy = accuracy
      completionStats.duration = duration
      completionStats.score = currentScore.value
      completionStats.level = currentLevel.value
      completionStats.perfectRounds = Math.floor(currentScore.value / 10 * 0.8)
      
      // 更新统计数据
      updateStats({
        mode: selectedMode.value.id,
        duration,
        accuracy,
        score: currentScore.value,
        completed: true
      })
      
      showCompletionModal.value = true
      baseStopTraining()
    }

    const startTimer = () => {
      trainingTimer = setInterval(() => {
        if (timeRemaining.value > 0) {
          timeRemaining.value--
        } else {
          stopTraining()
        }
      }, 1000)
    }

    const initializeTrainingContent = (mode) => {
      switch (mode.id) {
        case 'shapes':
          generateShapes()
          break
        case 'numbers':
          generateNumbers()
          break
        case 'colors':
          generateColors()
          break
        case 'words':
          generateText()
          break
      }
    }

    const generateShapes = () => {
      const shapes = []
      const types = ['circle', 'square', 'triangle']
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
      
      for (let i = 0; i < (settings.value.elementCount || settings.value.stimulusCount || 8); i++) {
        shapes.push({
          type: types[Math.floor(Math.random() * types.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          x: Math.random() * 80,
          y: Math.random() * 80
        })
      }
      
      currentShapes.value = shapes
    }

    const generateNumbers = () => {
      const numbers = []
      for (let i = 0; i < (settings.value.elementCount || settings.value.stimulusCount || 8); i++) {
        numbers.push(Math.floor(Math.random() * 100))
      }
      currentNumbers.value = numbers
      
      // 开始高亮显示
      highlightSequence()
    }

    const highlightSequence = () => {
      let index = 0
      const interval = setInterval(() => {
        highlightedIndex.value = index
        index++
        
        if (index >= currentNumbers.value.length) {
          clearInterval(interval)
          highlightedIndex.value = -1
          showInput.value = true
        }
      }, 1000)
    }

    const generateColors = () => {
      const baseColor = '#4ecdc4'
      const colors = [baseColor]
      
      // 生成相似颜色
      for (let i = 1; i < (settings.value.elementCount || settings.value.stimulusCount || 8); i++) {
        colors.push(baseColor)
      }
      
      // 插入一个不同的颜色
      const differentIndex = Math.floor(Math.random() * colors.length)
      colors[differentIndex] = '#ff6b6b'
      
      currentColors.value = colors
    }

    const generateText = () => {
      const texts = [
        '快速阅读是一种高效的阅读技巧，通过训练可以显著提升阅读速度和理解能力。',
        '整体感知训练有助于提升大脑的信息处理能力，改善学习和工作效率。',
        '视觉训练可以增强眼部肌肉的协调性，提高视觉注意力和专注度。'
      ]
      
      currentText.value = texts[Math.floor(Math.random() * texts.length)]
      
      // 延迟显示问题
      setTimeout(() => {
        generateQuestions()
        showQuestions.value = true
      }, settings.value.displayTime * 1000)
    }

    const generateQuestions = () => {
      currentQuestions.value = [
        {
          text: '文章的主要内容是什么？',
          options: ['阅读技巧', '视觉训练', '记忆方法', '注意力训练'],
          correct: 0
        }
      ]
    }

    const checkNumberSequence = () => {
      const userSequence = userInput.value.split(',').map(n => parseInt(n.trim()))
      const isCorrect = JSON.stringify(userSequence) === JSON.stringify(currentNumbers.value)
      
      if (isCorrect) {
        currentScore.value += 10
        showFeedbackMessage('正确！', 'correct')
      } else {
        showFeedbackMessage('错误，请再试一次', 'incorrect')
      }
      
      nextStep()
    }

    const selectColor = (index) => {
      selectedColorIndex.value = index
      
      // 检查是否选择了正确的颜色
      const isCorrect = currentColors.value[index] === '#ff6b6b'
      
      if (isCorrect) {
        currentScore.value += 10
        showFeedbackMessage('正确！', 'correct')
      } else {
        showFeedbackMessage('错误，请再试一次', 'incorrect')
      }
      
      nextStep()
    }

    const selectAnswer = (questionIndex, optionIndex) => {
      const question = currentQuestions.value[questionIndex]
      const isCorrect = optionIndex === question.correct
      
      if (isCorrect) {
        currentScore.value += 10
        showFeedbackMessage('正确！', 'correct')
      } else {
        showFeedbackMessage('错误，请再试一次', 'incorrect')
      }
      
      nextStep()
    }

    const showFeedbackMessage = (message, type) => {
      feedbackMessage.value = message
      feedbackType.value = type
      showFeedback.value = true
      
      setTimeout(() => {
        showFeedback.value = false
      }, 2000)
    }

    const nextStep = () => {
      currentStep.value++
      
      if (currentStep.value <= totalSteps.value) {
        // 重置状态
        userInput.value = ''
        showInput.value = false
        selectedColorIndex.value = -1
        showQuestions.value = false
        
        // 生成新内容
        setTimeout(() => {
          initializeTrainingContent(selectedMode.value)
        }, 1000)
      } else {
        stopTraining()
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
      if (trainingTimer) {
        clearInterval(trainingTimer)
      }
    })

    return {
      // 基础状态
      isTraining,
      isPaused,
      selectedMode,
      timeRemaining,
      currentStep,
      totalSteps,
      currentScore,
      currentLevel,
      accuracy,
      showCompletionModal,
      
      // 训练内容
      trainingModes,
      currentShapes,
      currentNumbers,
      currentColors,
      currentText,
      currentQuestions,
      
      // 交互状态
      highlightedIndex,
      showInput,
      userInput,
      selectedColorIndex,
      showFeedback,
      feedbackType,
      feedbackMessage,
      showQuestions,
      textSize,
      
      // 统计数据
      todayStats,
      abilityRatings,
      completionStats,
      
      // 设置
      settings,
      
      // 计算属性
      timerProgress,
      
      // 方法
      selectMode,
      startTraining,
      togglePause,
      stopTraining,
      checkNumberSequence,
      selectColor,
      selectAnswer,
      formatTime,
      closeModal,
      restartTraining
    }
  }
}
</script>

<style scoped>
.overall-perception-container {
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

.difficulty-stars {
  display: flex;
  gap: 0.1rem;
}

.star {
  color: #e2e8f0;
  font-size: 0.9rem;
}

.star.filled {
  color: #ffd700;
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

.mode-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.feature-tag {
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
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

.training-timer {
  text-align: center;
  margin-bottom: 2rem;
}

.timer-display {
  margin-bottom: 1rem;
}

.time-remaining {
  font-size: 3rem;
  font-weight: 700;
  color: #2d3748;
}

.time-label {
  display: block;
  color: #718096;
  margin-top: 0.5rem;
}

.timer-progress {
  max-width: 400px;
  margin: 0 auto;
}

.timer-progress .progress-bar {
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
}

.timer-progress .progress-fill {
  background: linear-gradient(90deg, #4299e1, #63b3ed);
}

.training-content {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.instruction {
  font-size: 1.2rem;
  color: #4a5568;
  text-align: center;
  margin-bottom: 2rem;
}

.shapes-grid {
  position: relative;
  width: 500px;
  height: 300px;
  background: #f7fafc;
  border: 2px dashed #cbd5e0;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.shape-item {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.shape-item.square {
  border-radius: 0;
}

.shape-item.triangle {
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 35px solid;
  background: transparent !important;
}

.numbers-display {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.number-item {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #edf2f7;
  border-radius: 10px;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  transition: all 0.3s ease;
}

.number-item.highlighted {
  background: #4299e1;
  color: white;
  transform: scale(1.1);
}

.number-input {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.input-field {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 200px;
}

.input-field:focus {
  outline: none;
  border-color: #4299e1;
}

.check-button {
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.color-item {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.color-item:hover {
  transform: scale(1.05);
}

.color-item.selected {
  border-color: #4299e1;
  transform: scale(1.1);
}

.text-display {
  background: #f7fafc;
  padding: 2rem;
  border-radius: 10px;
  line-height: 1.8;
  color: #2d3748;
  max-width: 600px;
  text-align: center;
  margin-bottom: 2rem;
}

.questions {
  max-width: 600px;
}

.question-item {
  margin-bottom: 1.5rem;
}

.question-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 1rem;
}

.answer-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.answer-option {
  padding: 0.75rem;
  background: #edf2f7;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.answer-option:hover {
  background: #e2e8f0;
  border-color: #4299e1;
}

.feedback {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
}

.feedback.correct {
  background: #c6f6d5;
  color: #22543d;
}

.feedback.incorrect {
  background: #fed7d7;
  color: #742a2a;
}

.feedback-icon {
  font-size: 1.5rem;
  font-weight: 700;
}

.training-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
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

.training-progress {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 10px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
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

.ability-ratings {
  space-y: 0.75rem;
}

.rating-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.rating-label {
  color: #4a5568;
  font-weight: 500;
}

.rating-stars {
  display: flex;
  gap: 0.1rem;
}

.rating-stars .star {
  color: #e2e8f0;
  font-size: 1rem;
}

.rating-stars .star.filled {
  color: #ffd700;
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
  display: flex;
  justify-content: space-around;
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
  .overall-perception-container {
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
  
  .shapes-grid {
    width: 100%;
    max-width: 400px;
  }
  
  .numbers-display {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .colors-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .answer-options {
    grid-template-columns: 1fr;
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
  
  .time-remaining {
    font-size: 2rem;
  }
  
  .number-item {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .color-item {
    width: 60px;
    height: 60px;
  }
  
  .input-field {
    min-width: auto;
    width: 100%;
  }
  
  .number-input {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>