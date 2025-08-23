<template>
  <div class="attention-container">
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
              <span class="detail-label">训练类型:</span>
              <span class="detail-value">{{ mode.type }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">难度等级:</span>
              <span class="detail-value">{{ mode.difficulty }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">训练重点:</span>
              <span class="detail-value">{{ mode.focus }}</span>
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

      <!-- 专注力测试 -->
      <div v-if="selectedMode.id === 'focus'" class="focus-test">
        <div class="test-area">
          <div class="focus-target" 
               :class="{ 
                 active: targetActive, 
                 correct: showCorrect, 
                 wrong: showWrong 
               }"
               @click="handleTargetClick">
            <div class="target-content">
              <span v-if="currentTask.type === 'color'" 
                    class="color-circle" 
                    :style="{ backgroundColor: currentTask.color }"></span>
              <span v-if="currentTask.type === 'number'" 
                    class="number-display">{{ currentTask.number }}</span>
              <span v-if="currentTask.type === 'shape'" 
                    class="shape-display">{{ currentTask.shape }}</span>
            </div>
          </div>
          
          <div class="task-instruction">
            <p>{{ currentTask.instruction }}</p>
          </div>
        </div>
      </div>

      <!-- 抗干扰训练 -->
      <div v-if="selectedMode.id === 'interference'" class="interference-test">
        <div class="test-area">
          <div class="main-task">
            <h4>主要任务</h4>
            <div class="task-display">
              <div class="target-item" 
                   :class="{ highlighted: item.isTarget }"
                   v-for="(item, index) in interferenceItems" 
                   :key="index"
                   @click="selectInterferenceItem(index)">
                {{ item.content }}
              </div>
            </div>
          </div>
          
          <div class="interference-elements">
            <div class="distractor" 
                 v-for="(distractor, index) in distractors" 
                 :key="index"
                 :style="distractor.style">
              {{ distractor.content }}
            </div>
          </div>
          
          <div class="task-instruction">
            <p>{{ interferenceInstruction }}</p>
          </div>
        </div>
      </div>

      <!-- 认知灵活性训练 -->
      <div v-if="selectedMode.id === 'flexibility'" class="flexibility-test">
        <div class="test-area">
          <div class="rule-display">
            <h4>当前规则: {{ currentRule }}</h4>
          </div>
          
          <div class="stimulus-display">
            <div class="stimulus-item"
                 v-for="(stimulus, index) in flexibilityStimuli"
                 :key="index"
                 @click="respondToStimulus(index)">
              <div class="stimulus-content" :style="stimulus.style">
                {{ stimulus.content }}
              </div>
            </div>
          </div>
          
          <div class="response-options">
            <button v-for="(option, index) in responseOptions"
                    :key="index"
                    class="response-btn"
                    @click="makeResponse(option)">
              {{ option.label }}
            </button>
          </div>
          
          <div class="task-instruction">
            <p>{{ flexibilityInstruction }}</p>
          </div>
        </div>
      </div>

      <!-- 工作记忆训练 -->
      <div v-if="selectedMode.id === 'memory'" class="memory-test">
        <div class="test-area">
          <div class="memory-phase" v-if="memoryPhase === 'encoding'">
            <h4>记忆阶段</h4>
            <div class="memory-items">
              <div class="memory-item"
                   v-for="(item, index) in memoryItems"
                   :key="index"
                   :class="{ active: item.active }">
                {{ item.content }}
              </div>
            </div>
          </div>
          
          <div class="memory-phase" v-if="memoryPhase === 'delay'">
            <h4>保持阶段</h4>
            <div class="delay-task">
              <p>请保持注意力，准备回忆...</p>
              <div class="countdown">{{ delayCountdown }}</div>
            </div>
          </div>
          
          <div class="memory-phase" v-if="memoryPhase === 'recall'">
            <h4>回忆阶段</h4>
            <div class="recall-options">
              <button v-for="(option, index) in recallOptions"
                      :key="index"
                      class="recall-btn"
                      :class="{ selected: option.selected }"
                      @click="selectRecallOption(index)">
                {{ option.content }}
              </button>
            </div>
            <button class="confirm-btn" @click="confirmRecall">确认</button>
          </div>
          
          <div class="task-instruction">
            <p>{{ memoryInstruction }}</p>
          </div>
        </div>
      </div>

      <!-- 元认知监控训练 -->
      <div v-if="selectedMode.id === 'metacognition'" class="metacognition-test">
        <div class="test-area">
          <div class="confidence-rating">
            <h4>信心评级</h4>
            <div class="confidence-scale">
              <button v-for="level in confidenceLevels"
                      :key="level.value"
                      class="confidence-btn"
                      :class="{ selected: selectedConfidence === level.value }"
                      @click="setConfidence(level.value)">
                {{ level.label }}
              </button>
            </div>
          </div>
          
          <div class="metacognition-task">
            <div class="task-question">
              <p>{{ metacognitionQuestion }}</p>
            </div>
            
            <div class="task-options">
              <button v-for="(option, index) in metacognitionOptions"
                      :key="index"
                      class="option-btn"
                      @click="selectMetacognitionOption(index)">
                {{ option }}
              </button>
            </div>
          </div>
          
          <div class="performance-feedback">
            <h4>表现反馈</h4>
            <div class="feedback-content">
              <div class="accuracy-display">
                <span class="accuracy-label">准确率:</span>
                <span class="accuracy-value">{{ metacognitionAccuracy }}%</span>
              </div>
              <div class="confidence-accuracy">
                <span class="confidence-label">信心-准确率匹配:</span>
                <span class="match-value">{{ confidenceAccuracyMatch }}%</span>
              </div>
            </div>
          </div>
          
          <div class="task-instruction">
            <p>{{ metacognitionInstruction }}</p>
          </div>
        </div>
      </div>

      <!-- 训练统计 -->
      <div class="training-stats">
        <div class="stat-item">
          <span class="stat-label">已训练时间:</span>
          <span class="stat-value">{{ formatTime(elapsedTime) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">当前准确率:</span>
          <span class="stat-value">{{ currentAccuracy }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">反应时间:</span>
          <span class="stat-value">{{ averageReactionTime }}ms</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">完成题目:</span>
          <span class="stat-value">{{ completedTasks }}/{{ totalTasks }}</span>
        </div>
      </div>
    </div>

    <!-- 训练设置 -->
    <SettingsButton @click="openSettings" />
    
    <SettingsModal
      v-if="showSettingsModal"
      :sections="settingsSections"
      @close="closeSettings"
      @save="saveSettings"
      @reset="resetSettings"
    />

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
              <span class="stat-label">平均准确率:</span>
              <span class="stat-value">{{ todayStats.averageAccuracy }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最佳准确率:</span>
              <span class="stat-value">{{ todayStats.bestAccuracy }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均反应时间:</span>
              <span class="stat-value">{{ todayStats.averageReactionTime }}ms</span>
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
                    bottom: (point.accuracy / 100) * 100 + '%'
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
              <span class="stat-label">平均准确率:</span>
              <span class="stat-value">{{ completionStats.averageAccuracy }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最佳准确率:</span>
              <span class="stat-value">{{ completionStats.bestAccuracy }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均反应时间:</span>
              <span class="stat-value">{{ completionStats.averageReactionTime }}ms</span>
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
import SettingsModal from '@/components/SettingsModal.vue'
import SettingsButton from '@/components/SettingsButton.vue'
import { useTrainingSettings } from '@/composables/useTrainingSettings'

export default {
  name: 'Attention',
  components: {
    SettingsModal,
    SettingsButton
  },
  emits: ['back'],
  setup(props, { emit }) {
    // 使用组合式函数
    const trainingManager = useBasicTraining('attention')
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
      updateSettings
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

    // 使用新的设置管理系统
    const {
      settings: trainingSettings,
      settingsSections,
      showSettingsModal,
      isLoading: settingsLoading,
      error: settingsError,
      saveSettings: handleSettingsSave,
      resetSettings: handleSettingsReset,
      openSettings,
      closeSettings
    } = useTrainingSettings('attention')

    // 本地状态
    const targetActive = ref(false)
    const showCorrect = ref(false)
    const showWrong = ref(false)
    const currentAccuracy = ref(0)
    const averageReactionTime = ref(0)
    const completedTasks = ref(0)
    const totalTasks = ref(50)
    const showCompletionModal = ref(false)

    // 训练任务状态
    const currentTask = reactive({
      type: 'color',
      color: '#ff0000',
      number: 5,
      shape: '●',
      instruction: '点击红色圆圈'
    })

    // 抗干扰训练状态
    const interferenceItems = ref([])
    const distractors = ref([])
    const interferenceInstruction = ref('找到目标项目，忽略干扰元素')

    // 认知灵活性训练状态
    const currentRule = ref('按颜色分类')
    const flexibilityStimuli = ref([])
    const responseOptions = ref([])
    const flexibilityInstruction = ref('根据当前规则进行分类')

    // 工作记忆训练状态
    const memoryPhase = ref('encoding') // encoding, delay, recall
    const memoryItems = ref([])
    const delayCountdown = ref(3)
    const recallOptions = ref([])
    const memoryInstruction = ref('记住显示的项目')

    // 元认知监控训练状态
    const selectedConfidence = ref(3)
    const confidenceLevels = ref([
      { value: 1, label: '很不确定' },
      { value: 2, label: '不确定' },
      { value: 3, label: '一般' },
      { value: 4, label: '确定' },
      { value: 5, label: '很确定' }
    ])
    const metacognitionQuestion = ref('')
    const metacognitionOptions = ref([])
    const metacognitionAccuracy = ref(0)
    const confidenceAccuracyMatch = ref(0)
    const metacognitionInstruction = ref('评估你的信心水平，然后回答问题')

    // 训练模式数据
    const trainingModes = ref([
      {
        id: 'focus',
        name: '专注力测试',
        icon: '🎯',
        level: 'beginner',
        levelText: '初级',
        description: '通过目标检测任务训练持续注意力和选择性注意力',
        type: '目标检测',
        difficulty: '简单',
        focus: '持续注意',
        progress: 80,
        features: ['目标检测', '反应时间', '准确率统计'],
        benefits: ['提升专注力', '增强反应速度']
      },
      {
        id: 'interference',
        name: '抗干扰训练',
        icon: '🛡️',
        level: 'intermediate',
        levelText: '中级',
        description: '在干扰环境中保持注意力，训练抗干扰能力',
        type: '干扰抑制',
        difficulty: '中等',
        focus: '抗干扰',
        progress: 65,
        features: ['干扰抑制', '选择性注意', '认知控制'],
        benefits: ['增强抗干扰能力', '提升认知控制']
      },
      {
        id: 'flexibility',
        name: '认知灵活性',
        icon: '🔄',
        level: 'intermediate',
        levelText: '中级',
        description: '训练在不同任务规则间灵活切换的能力',
        type: '任务切换',
        difficulty: '中等',
        focus: '认知灵活性',
        progress: 55,
        features: ['任务切换', '规则学习', '认知灵活性'],
        benefits: ['提升适应能力', '增强思维灵活性']
      },
      {
        id: 'memory',
        name: '工作记忆训练',
        icon: '🧠',
        level: 'advanced',
        levelText: '高级',
        description: '训练工作记忆容量和操作能力',
        type: '记忆训练',
        difficulty: '困难',
        focus: '工作记忆',
        progress: 40,
        features: ['记忆容量', '信息操作', '认知负荷'],
        benefits: ['增强记忆能力', '提升认知容量']
      },
      {
        id: 'metacognition',
        name: '元认知监控',
        icon: '🤔',
        level: 'expert',
        levelText: '专家',
        description: '训练对自己认知过程的监控和调节能力',
        type: '元认知',
        difficulty: '很困难',
        focus: '自我监控',
        progress: 25,
        features: ['自我监控', '信心评估', '策略调节'],
        benefits: ['提升自我认知', '增强学习效率']
      }
    ])

    // 进度数据
    const progressData = ref([
      { accuracy: 75 },
      { accuracy: 78 },
      { accuracy: 82 },
      { accuracy: 85 },
      { accuracy: 88 },
      { accuracy: 90 },
      { accuracy: 92 }
    ])

    // 完成统计
    const completionStats = reactive({
      averageAccuracy: 0,
      bestAccuracy: 0,
      averageReactionTime: 0,
      duration: 0,
      achievement: null
    })

    // 定时器
    let taskTimer = null
    let reactionTimer = null
    let delayTimer = null

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
      
      // 启动训练
      startTrainingSession()
      
      // 调用基础训练函数
      baseStartTraining(mode)
    }

    const togglePause = () => {
      if (isPaused.value) {
        resumeTraining()
        resumeTrainingSession()
      } else {
        pauseTraining()
        pauseTrainingSession()
      }
    }

    const stopTraining = () => {
      stopTrainingSession()
      
      // 计算完成统计
      completionStats.averageAccuracy = currentAccuracy.value
      completionStats.bestAccuracy = Math.max(currentAccuracy.value, completionStats.bestAccuracy)
      completionStats.averageReactionTime = averageReactionTime.value
      completionStats.duration = elapsedTime.value
      
      // 更新统计数据
      updateStats({
        mode: selectedMode.value.id,
        duration: elapsedTime.value,
        accuracy: currentAccuracy.value,
        reactionTime: averageReactionTime.value,
        completed: true
      })
      
      showCompletionModal.value = true
      baseStopTraining()
    }

    const initializeTrainingData = (mode) => {
      // 重置状态
      completedTasks.value = 0
      currentAccuracy.value = 0
      averageReactionTime.value = 0
      
      // 根据模式初始化特定数据
      switch (mode.id) {
        case 'focus':
          initializeFocusTest()
          break
        case 'interference':
          initializeInterferenceTest()
          break
        case 'flexibility':
          initializeFlexibilityTest()
          break
        case 'memory':
          initializeMemoryTest()
          break
        case 'metacognition':
          initializeMetacognitionTest()
          break
      }
    }

    const initializeFocusTest = () => {
      generateFocusTask()
    }

    const generateFocusTask = () => {
      const taskTypes = ['color', 'number', 'shape']
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      const shapes = ['●', '■', '▲', '♦', '★']
      
      const type = taskTypes[Math.floor(Math.random() * taskTypes.length)]
      
      switch (type) {
        case 'color':
          currentTask.type = 'color'
          currentTask.color = colors[Math.floor(Math.random() * colors.length)]
          currentTask.instruction = `点击${getColorName(currentTask.color)}圆圈`
          break
        case 'number':
          currentTask.type = 'number'
          currentTask.number = numbers[Math.floor(Math.random() * numbers.length)]
          currentTask.instruction = `点击数字${currentTask.number}`
          break
        case 'shape':
          currentTask.type = 'shape'
          currentTask.shape = shapes[Math.floor(Math.random() * shapes.length)]
          currentTask.instruction = `点击${getShapeName(currentTask.shape)}`
          break
      }
      
      // 设置目标激活状态
      targetActive.value = Math.random() < (settings.value.targetFrequency / 100)
    }

    const getColorName = (color) => {
      const colorNames = {
        '#ff0000': '红色',
        '#00ff00': '绿色',
        '#0000ff': '蓝色',
        '#ffff00': '黄色',
        '#ff00ff': '紫色'
      }
      return colorNames[color] || '未知'
    }

    const getShapeName = (shape) => {
      const shapeNames = {
        '●': '圆形',
        '■': '方形',
        '▲': '三角形',
        '♦': '菱形',
        '★': '星形'
      }
      return shapeNames[shape] || '未知'
    }

    const handleTargetClick = () => {
      const reactionTime = Date.now() - (reactionTimer || Date.now())
      
      if (targetActive.value) {
        // 正确点击
        showCorrect.value = true
        updateAccuracy(true)
        updateReactionTime(reactionTime)
        
        setTimeout(() => {
          showCorrect.value = false
          nextTask()
        }, 500)
      } else {
        // 错误点击
        showWrong.value = true
        updateAccuracy(false)
        
        setTimeout(() => {
          showWrong.value = false
          nextTask()
        }, 500)
      }
    }

    const nextTask = () => {
      completedTasks.value++
      
      if (completedTasks.value >= totalTasks.value) {
        stopTraining()
      } else {
        generateFocusTask()
        reactionTimer = Date.now()
      }
    }

    const updateAccuracy = (correct) => {
      const totalAttempts = completedTasks.value + 1
      const correctCount = correct ? 
        Math.round(currentAccuracy.value * completedTasks.value / 100) + 1 :
        Math.round(currentAccuracy.value * completedTasks.value / 100)
      
      currentAccuracy.value = Math.round((correctCount / totalAttempts) * 100)
    }

    const updateReactionTime = (time) => {
      const totalTimes = completedTasks.value
      averageReactionTime.value = Math.round(
        (averageReactionTime.value * (totalTimes - 1) + time) / totalTimes
      )
    }

    const initializeInterferenceTest = () => {
      // 生成干扰测试项目
      interferenceItems.value = [
        { content: 'A', isTarget: true },
        { content: 'B', isTarget: false },
        { content: 'C', isTarget: false },
        { content: 'D', isTarget: false }
      ]
      
      // 生成干扰元素
      distractors.value = [
        { content: '×', style: { position: 'absolute', top: '20%', left: '10%' } },
        { content: '○', style: { position: 'absolute', top: '60%', right: '15%' } },
        { content: '△', style: { position: 'absolute', bottom: '30%', left: '20%' } }
      ]
    }

    const selectInterferenceItem = (index) => {
      const item = interferenceItems.value[index]
      const correct = item.isTarget
      updateAccuracy(correct)
      
      if (correct) {
        showCorrect.value = true
      } else {
        showWrong.value = true
      }
      
      setTimeout(() => {
        showCorrect.value = false
        showWrong.value = false
        nextInterferenceTask()
      }, 500)
    }

    const nextInterferenceTask = () => {
      completedTasks.value++
      
      if (completedTasks.value >= totalTasks.value) {
        stopTraining()
      } else {
        initializeInterferenceTest()
      }
    }

    const initializeFlexibilityTest = () => {
      const rules = ['按颜色分类', '按形状分类', '按大小分类']
      currentRule.value = rules[Math.floor(Math.random() * rules.length)]
      
      flexibilityStimuli.value = [
        { content: '●', style: { color: 'red', fontSize: '20px' } },
        { content: '■', style: { color: 'blue', fontSize: '24px' } },
        { content: '▲', style: { color: 'green', fontSize: '18px' } }
      ]
      
      responseOptions.value = [
        { label: '选项A' },
        { label: '选项B' },
        { label: '选项C' }
      ]
    }

    const respondToStimulus = (index) => {
      // 处理刺激响应
      updateAccuracy(Math.random() > 0.3) // 模拟准确率
      nextFlexibilityTask()
    }

    const makeResponse = (option) => {
      // 处理响应选择
      updateAccuracy(Math.random() > 0.3) // 模拟准确率
      nextFlexibilityTask()
    }

    const nextFlexibilityTask = () => {
      completedTasks.value++
      
      if (completedTasks.value >= totalTasks.value) {
        stopTraining()
      } else {
        initializeFlexibilityTest()
      }
    }

    const initializeMemoryTest = () => {
      memoryPhase.value = 'encoding'
      
      // 生成记忆项目
      const items = ['A', 'B', 'C', 'D', 'E']
      memoryItems.value = items.slice(0, 3 + Math.floor(Math.random() * 3)).map(item => ({
        content: item,
        active: true
      }))
      
      // 开始编码阶段
      setTimeout(() => {
        startDelayPhase()
      }, 2000)
    }

    const startDelayPhase = () => {
      memoryPhase.value = 'delay'
      delayCountdown.value = 3
      
      delayTimer = setInterval(() => {
        delayCountdown.value--
        if (delayCountdown.value <= 0) {
          clearInterval(delayTimer)
          startRecallPhase()
        }
      }, 1000)
    }

    const startRecallPhase = () => {
      memoryPhase.value = 'recall'
      
      // 生成回忆选项
      const allItems = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
      recallOptions.value = allItems.map(item => ({
        content: item,
        selected: false
      }))
    }

    const selectRecallOption = (index) => {
      recallOptions.value[index].selected = !recallOptions.value[index].selected
    }

    const confirmRecall = () => {
      // 检查回忆准确性
      const selectedItems = recallOptions.value.filter(option => option.selected)
      const correctItems = memoryItems.value.map(item => item.content)
      
      const correct = selectedItems.length === correctItems.length &&
        selectedItems.every(item => correctItems.includes(item.content))
      
      updateAccuracy(correct)
      nextMemoryTask()
    }

    const nextMemoryTask = () => {
      completedTasks.value++
      
      if (completedTasks.value >= totalTasks.value) {
        stopTraining()
      } else {
        initializeMemoryTest()
      }
    }

    const initializeMetacognitionTest = () => {
      const questions = [
        '这个问题的答案是什么？',
        '哪个选项是正确的？',
        '你认为这个判断对吗？'
      ]
      
      metacognitionQuestion.value = questions[Math.floor(Math.random() * questions.length)]
      metacognitionOptions.value = ['选项A', '选项B', '选项C', '选项D']
    }

    const setConfidence = (level) => {
      selectedConfidence.value = level
    }

    const selectMetacognitionOption = (index) => {
      // 处理元认知选择
      const correct = Math.random() > 0.4 // 模拟准确率
      updateAccuracy(correct)
      
      // 更新信心-准确率匹配度
      updateConfidenceAccuracyMatch(correct)
      
      nextMetacognitionTask()
    }

    const updateConfidenceAccuracyMatch = (correct) => {
      // 计算信心水平与实际表现的匹配度
      const confidenceScore = selectedConfidence.value / 5 * 100
      const actualScore = correct ? 100 : 0
      const match = 100 - Math.abs(confidenceScore - actualScore)
      
      confidenceAccuracyMatch.value = Math.round(match)
    }

    const nextMetacognitionTask = () => {
      completedTasks.value++
      
      if (completedTasks.value >= totalTasks.value) {
        stopTraining()
      } else {
        initializeMetacognitionTest()
      }
    }

    const startTrainingSession = () => {
      reactionTimer = Date.now()
    }

    const pauseTrainingSession = () => {
      if (taskTimer) clearInterval(taskTimer)
      if (delayTimer) clearInterval(delayTimer)
    }

    const resumeTrainingSession = () => {
      reactionTimer = Date.now()
    }

    const stopTrainingSession = () => {
      if (taskTimer) clearInterval(taskTimer)
      if (delayTimer) clearInterval(delayTimer)
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

    // 设置相关方法现在由 useTrainingSettings 提供
    // settingsSections 现在由 useTrainingSettings 提供

    // 生命周期
    onMounted(() => {
      // 数据已通过组合式函数自动加载
      // 设置加载现在由 useTrainingSettings 自动处理
    })

    onUnmounted(() => {
      stopTrainingSession()
    })

    return {
      // 基础状态
      isTraining,
      isPaused,
      selectedMode,
      elapsedTime,
      showCompletionModal,
      
      // 训练状态
      targetActive,
      showCorrect,
      showWrong,
      currentAccuracy,
      averageReactionTime,
      completedTasks,
      totalTasks,
      
      // 任务状态
      currentTask,
      interferenceItems,
      distractors,
      interferenceInstruction,
      currentRule,
      flexibilityStimuli,
      responseOptions,
      flexibilityInstruction,
      memoryPhase,
      memoryItems,
      delayCountdown,
      recallOptions,
      memoryInstruction,
      selectedConfidence,
      confidenceLevels,
      metacognitionQuestion,
      metacognitionOptions,
      metacognitionAccuracy,
      confidenceAccuracyMatch,
      metacognitionInstruction,
      
      // 训练数据
      trainingModes,
      progressData,
      completionStats,
      
      // 统计数据
      todayStats,
      achievements,
      
      // 设置
      showSettingsModal,
      settingsSections,
      
      // 方法
      selectMode,
      startTraining,
      togglePause,
      stopTraining,
      handleTargetClick,
      selectInterferenceItem,
      respondToStimulus,
      makeResponse,
      selectRecallOption,
      confirmRecall,
      setConfidence,
      selectMetacognitionOption,
      formatTime,
      closeModal,
      restartTraining,
      openSettings,
      closeSettings,
      saveSettings: handleSettingsSave,
      resetSettings: handleSettingsReset
    }
  }
}
</script>

<style scoped>
.attention-container {
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

.focus-test,
.interference-test,
.flexibility-test,
.memory-test,
.metacognition-test {
  background: #f7fafc;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.test-area {
  max-width: 600px;
  margin: 0 auto;
}

.focus-target {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem auto;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 4px solid transparent;
}

.focus-target.active {
  background: #4299e1;
  border-color: #2b6cb0;
  transform: scale(1.1);
}

.focus-target.correct {
  background: #48bb78;
  border-color: #2f855a;
}

.focus-target.wrong {
  background: #f56565;
  border-color: #c53030;
}

.target-content {
  font-size: 3rem;
  color: white;
}

.color-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-block;
}

.number-display,
.shape-display {
  font-size: 4rem;
  font-weight: bold;
}

.task-instruction {
  font-size: 1.2rem;
  color: #4a5568;
  margin-top: 1rem;
}

.main-task {
  margin-bottom: 2rem;
}

.task-display {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
}

.target-item {
  padding: 1rem 2rem;
  background: #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.5rem;
  font-weight: 600;
}

.target-item:hover {
  background: #cbd5e0;
}

.target-item.highlighted {
  background: #4299e1;
  color: white;
}

.interference-elements {
  position: relative;
  height: 200px;
  margin: 2rem 0;
}

.distractor {
  font-size: 2rem;
  color: #a0aec0;
  pointer-events: none;
  user-select: none;
}

.rule-display {
  background: #edf2f7;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.rule-display h4 {
  color: #2d3748;
  margin: 0;
  font-size: 1.3rem;
}

.stimulus-display {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
}

.stimulus-item {
  padding: 1.5rem;
  background: #e2e8f0;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stimulus-item:hover {
  background: #cbd5e0;
  transform: translateY(-2px);
}

.stimulus-content {
  font-size: 2rem;
  font-weight: bold;
}

.response-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.response-btn {
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.response-btn:hover {
  background: #3182ce;
  transform: translateY(-2px);
}

.memory-phase {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.memory-items {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.memory-item {
  width: 80px;
  height: 80px;
  background: #e2e8f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: #2d3748;
  transition: all 0.3s ease;
}

.memory-item.active {
  background: #4299e1;
  color: white;
  transform: scale(1.1);
}

.delay-task {
  text-align: center;
}

.countdown {
  font-size: 3rem;
  font-weight: bold;
  color: #4299e1;
  margin: 1rem 0;
}

.recall-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 2rem 0;
}

.recall-btn {
  padding: 1rem;
  background: #e2e8f0;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.recall-btn:hover {
  background: #cbd5e0;
}

.recall-btn.selected {
  background: #4299e1;
  color: white;
  border-color: #2b6cb0;
}

.confirm-btn {
  padding: 0.75rem 2rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.confirm-btn:hover {
  background: #38a169;
}

.confidence-rating {
  margin-bottom: 2rem;
}

.confidence-scale {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
}

.confidence-btn {
  padding: 0.5rem 1rem;
  background: #e2e8f0;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.confidence-btn:hover {
  background: #cbd5e0;
}

.confidence-btn.selected {
  background: #4299e1;
  color: white;
  border-color: #2b6cb0;
}

.metacognition-task {
  margin: 2rem 0;
}

.task-question {
  background: #edf2f7;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.task-question p {
  font-size: 1.2rem;
  color: #2d3748;
  margin: 0;
}

.task-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.option-btn {
  padding: 1rem;
  background: #e2e8f0;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.option-btn:hover {
  background: #cbd5e0;
  transform: translateY(-2px);
}

.performance-feedback {
  background: #f0fff4;
  border: 2px solid #9ae6b4;
  border-radius: 10px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.performance-feedback h4 {
  color: #22543d;
  margin: 0 0 1rem 0;
}

.feedback-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.accuracy-display,
.confidence-accuracy {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.accuracy-label,
.confidence-label {
  color: #2d3748;
  font-weight: 500;
}

.accuracy-value,
.match-value {
  font-weight: 700;
  color: #22543d;
}

.training-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  background: #edf2f7;
  padding: 1.5rem;
  border-radius: 15px;
  margin-top: 2rem;
}

.training-stats .stat-item {
  text-align: center;
}

.training-stats .stat-label {
  display: block;
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.training-stats .stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}



.statistics-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.statistics-section h3 {
  color: #2d3748;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #f7fafc;
  border-radius: 15px;
  padding: 1.5rem;
}

.stat-card h4 {
  color: #2d3748;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.stat-content .stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-content .stat-item:last-child {
  margin-bottom: 0;
}

.stat-content .stat-label {
  color: #718096;
  font-weight: 500;
}

.stat-content .stat-value {
  font-weight: 700;
  color: #2d3748;
}

.progress-chart {
  height: 200px;
  position: relative;
  background: #edf2f7;
  border-radius: 10px;
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
  border-radius: 10px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.achievement-item:last-child {
  margin-bottom: 0;
}

.achievement-item.unlocked {
  background: #c6f6d5;
}

.achievement-item:not(.unlocked) {
  background: #f7fafc;
  opacity: 0.6;
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
  border-radius: 20px;
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
  color: #a0aec0;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #718096;
}

.modal-content {
  margin-bottom: 2rem;
}

.completion-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.completion-stats .stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
}

.completion-stats .stat-label {
  color: #718096;
  font-weight: 500;
}

.completion-stats .stat-value {
  font-weight: 700;
  color: #2d3748;
}

.achievement {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #c6f6d5;
  border-radius: 10px;
  border: 2px solid #9ae6b4;
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-text {
  font-weight: 600;
  color: #22543d;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.primary-button {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(66, 153, 225, 0.4);
}

.secondary-button {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-button:hover {
  background: #cbd5e0;
}

/* 响应式设计 */
/* 笔记本屏幕优化 (1024px-1440px) */
@media (min-width: 1024px) and (max-width: 1440px) {
  .attention-container {
    padding: 1.8rem;
  }
  
  .page-header {
    padding: 1.8rem;
  }
  
  .title-section .page-title {
    font-size: 2.2rem;
  }
  
  .page-description {
    font-size: 1.05rem;
  }
  
  .header-stats {
    gap: 1.8rem;
  }
  
  .header-stats .stat-value {
    font-size: 1.8rem;
  }
  
  .mode-selection h2 {
    font-size: 1.6rem;
  }
  
  .modes-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.3rem;
  }
  
  .mode-card {
    padding: 1.3rem;
  }
  
  .mode-name {
    font-size: 1.2rem;
  }
  
  .mode-description {
    font-size: 0.95rem;
  }
  
  .training-interface {
    padding: 1.8rem;
  }
  
  .training-header .mode-name {
    font-size: 1.4rem;
  }
  
  .test-area {
    padding: 1.5rem;
  }
  
  .focus-target {
    width: 120px;
    height: 120px;
  }
  
  .training-stats {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1.2rem;
  }
  
  .settings-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.3rem;
  }
  
  .setting-card {
    padding: 1.3rem;
  }
  
  .completion-modal {
    max-width: 500px;
    padding: 2rem;
  }
}

/* 特定笔记本尺寸优化 (1024px-1366px) */
@media (min-width: 1024px) and (max-width: 1366px) {
  .modes-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.2rem;
  }
  
  .mode-card {
    padding: 1.2rem;
  }
  
  .training-stats {
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 1rem;
  }
  
  .completion-stats {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
  }
  
  .focus-target {
    width: 110px;
    height: 110px;
  }
}

@media (max-width: 768px) {
  .attention-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-stats {
    justify-content: center;
  }
  
  .modes-grid {
    grid-template-columns: 1fr;
  }
  
  .mode-details {
    grid-template-columns: 1fr;
  }
  
  .training-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .training-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .settings-grid,
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
</style>