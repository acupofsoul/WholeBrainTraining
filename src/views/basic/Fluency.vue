<template>
  <div class="fluency-container">

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
              <span class="detail-label">文本长度:</span>
              <span class="detail-value">{{ mode.textLength }}</span>
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
              <div 
                class="progress-fill" 
                :style="{ width: trainingProgress[mode.id] + '%' }"
              ></div>
            </div>
            <div class="progress-text">完成度: {{ trainingProgress[mode.id] }}%</div>
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

        <!-- 训练计时器 -->
        <div class="training-timer">
          <div class="timer-display">
            <span class="time-value">{{ formatTime(trainingTime) }}</span>
            <span class="time-label">训练时间</span>
          </div>
          <div class="timer-progress">
            <div 
              class="progress-fill" 
              :style="{ width: (trainingTime / (settings.duration * 60)) * 100 + '%' }"
            ></div>
          </div>
        </div>

        <!-- 阅读指导 -->
        <div class="reading-guide">
          <div class="guide-indicator">
            <div class="speed-meter">
              <div class="meter-display">
                <span class="speed-value">{{ currentSpeed }}</span>
                <span class="speed-unit">字/分</span>
              </div>
              <div class="speed-bar">
                <div 
                  class="speed-fill" 
                  :style="{ width: (currentSpeed / maxSpeed) * 100 + '%' }"
                ></div>
              </div>
            </div>
            
            <div class="fluency-indicator">
              <span class="indicator-label">流畅度</span>
              <div class="fluency-stars">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  class="star"
                  :class="{ active: i <= fluencyScore }"
                >
                  ⭐
                </span>
              </div>
              <span class="fluency-level" :class="fluencyLevel">{{ fluencyLevelText }}</span>
            </div>
          </div>
        </div>

        <!-- 阅读内容 -->
        <div class="reading-content">
          <div class="text-container">
            <h4 class="text-title">{{ currentText.title }}</h4>
            <div class="text-body">
              <div 
                v-for="(paragraph, pIndex) in currentText.paragraphs" 
                :key="pIndex"
                class="paragraph"
                :class="{ current: pIndex === currentParagraphIndex }"
              >
                <span 
                  v-for="(sentence, sIndex) in paragraph.sentences" 
                  :key="sIndex"
                  class="sentence"
                  :class="{ 
                    current: pIndex === currentParagraphIndex && sIndex === currentSentenceIndex,
                    highlight: pIndex === currentParagraphIndex && sIndex === highlightSentenceIndex
                  }"
                >
                  {{ sentence }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 训练统计 -->
        <div class="training-stats">
          <div class="stat-item">
            <span class="stat-label">当前速度</span>
            <span class="stat-value">{{ currentSpeed }} 字/分</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">流畅度</span>
            <span class="stat-value">{{ fluencyScore }}/5</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">回视次数</span>
            <span class="stat-value">{{ regressionCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">停顿时间</span>
            <span class="stat-value">{{ pauseTime }}s</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练设置 -->
    <div class="training-settings" v-if="!isTraining">
      <h3>训练设置</h3>
      <div class="settings-grid">
        <div class="setting-item">
          <label>目标速度 (字/分)</label>
          <input 
            type="range" 
            v-model="settings.targetSpeed" 
            min="100" 
            max="800" 
            step="10"
          >
          <span class="setting-value">{{ settings.targetSpeed }}</span>
        </div>
        
        <div class="setting-item">
          <label>训练时长 (分钟)</label>
          <input 
            type="range" 
            v-model="settings.duration" 
            min="5" 
            max="60" 
            step="5"
          >
          <span class="setting-value">{{ settings.duration }}</span>
        </div>
        
        <div class="setting-item">
          <label>字体大小</label>
          <input 
            type="range" 
            v-model="settings.fontSize" 
            min="12" 
            max="24" 
            step="1"
          >
          <span class="setting-value">{{ settings.fontSize }}px</span>
        </div>
        
        <div class="setting-item">
          <label>文本类型</label>
          <select v-model="settings.textType">
            <option value="narrative">叙述文</option>
            <option value="expository">说明文</option>
            <option value="argumentative">议论文</option>
            <option value="poetry">诗歌</option>
          </select>
        </div>
        
        <div class="setting-item">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settings.showGuide">
            显示阅读引导
          </label>
        </div>
        
        <div class="setting-item">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settings.highlightSentence">
            高亮当前句子
          </label>
        </div>
        
        <div class="setting-item">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settings.trackRegression">
            追踪回视行为
          </label>
        </div>
        
        <div class="setting-item">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settings.soundFeedback">
            声音反馈
          </label>
        </div>
      </div>
    </div>

    <!-- 统计数据 -->
    <div class="stats-section" v-if="!isTraining">
      <h3>训练统计</h3>
      <div class="stats-overview">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <span class="stat-number">{{ stats?.totalSessions || 0 }}</span>
              <span class="stat-label">总训练次数</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-info">
              <span class="stat-number">{{ formatTime(stats?.totalTime || 0) }}</span>
              <span class="stat-label">总训练时间</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🚀</div>
            <div class="stat-info">
              <span class="stat-number">{{ stats?.averageSpeed || 0 }}</span>
              <span class="stat-label">平均速度</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <span class="stat-number">{{ (stats?.averageFluency || 0).toFixed(1) }}</span>
              <span class="stat-label">平均流畅度</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 完成弹窗 -->
    <div class="completion-modal" v-if="showCompletionModal">
      <div class="modal-content">
        <h3>训练完成！</h3>
        <div class="completion-stats">
          <div class="completion-item">
            <span class="completion-label">流畅度评分</span>
            <span class="completion-value">{{ completionData.fluencyScore }}/5</span>
          </div>
          <div class="completion-item">
            <span class="completion-label">训练时长</span>
            <span class="completion-value">{{ formatTime(completionData.duration) }}</span>
          </div>
          <div class="completion-item">
            <span class="completion-label">平均速度</span>
            <span class="completion-value">{{ completionData.averageSpeed }} 字/分</span>
          </div>
          <div class="completion-item">
            <span class="completion-label">阅读字数</span>
            <span class="completion-value">{{ completionData.wordsRead }} 字</span>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="secondary-btn" @click="closeCompletionModal">
            关闭
          </button>
          <button class="primary-btn" @click="restartTraining">
            再次训练
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useBasicTraining, useBasicTrainingSettings, useBasicTrainingStats } from '@/composables/useBasicTraining'

export default {
  name: 'Fluency',
  emits: ['back'],
  setup(props, { emit }) {
    // 使用组合式函数
    const trainingManager = useBasicTraining('fluency', {
      targetSpeed: 300,
      textType: 'narrative',
      fontSize: 18,
      showGuide: true,
      highlightSentence: true,
      trackRegression: true,
      soundFeedback: false,
      duration: 20,
      breakInterval: 10,
      difficultyAdjustment: 'auto'
    })
    const {
      isTraining,
      isPaused,
      trainingTime,
      selectedMode,
      trainingProgress,
      startTraining: baseStartTraining,
      pauseTraining,
      resumeTraining,
      stopTraining: baseStopTraining,
      completeTraining,
      initializeModule
    } = trainingManager

    const { settings, updateSettings } = useBasicTrainingSettings(trainingManager)

    const { stats, formattedStats } = useBasicTrainingStats(trainingManager)

    // 默认统计数据结构
    const defaultStats = {
      totalSessions: 0,
      totalTime: 0,
      averageSpeed: 0,
      averageFluency: 0,
      maxSpeed: 0,
      regressionRate: 0,
      pauseTime: 0,
      stability: 0,
      fluencyRating: 0,
      speedRating: 0,
      stabilityRating: 0,
      focusRating: 0,
      speedData: []
    }

    // 训练状态
    const currentSpeed = ref(0)
    const maxSpeed = ref(500)
    const fluencyScore = ref(0)
    const fluencyLevel = ref('low')
    const fluencyLevelText = ref('较低')
    const currentParagraphIndex = ref(0)
    const currentSentenceIndex = ref(0)
    const highlightSentenceIndex = ref(-1)
    const regressionCount = ref(0)
    const pauseTime = ref(0)
    const showCompletionModal = ref(false)

    // 训练模式
    const trainingModes = ref([
      {
        id: 'basic',
        name: '基础流畅度',
        icon: '📖',
        level: 'beginner',
        levelText: '初级',
        description: '建立基本的流畅阅读习惯，减少停顿和回视',
        textLength: '短篇',
        difficulty: '简单',
        focus: '连续性'
      },
      {
        id: 'intermediate',
        name: '进阶流畅度',
        icon: '📚',
        level: 'intermediate',
        levelText: '中级',
        description: '提高阅读的自然流畅性，培养良好的阅读节奏',
        textLength: '中篇',
        difficulty: '中等',
        focus: '节奏感'
      },
      {
        id: 'advanced',
        name: '高级流畅度',
        icon: '🚀',
        level: 'advanced',
        levelText: '高级',
        description: '达到自动化阅读水平，实现高速流畅阅读',
        textLength: '长篇',
        difficulty: '困难',
        focus: '自动化'
      },
      {
        id: 'comprehensive',
        name: '综合流畅度',
        icon: '🎯',
        level: 'expert',
        levelText: '专家',
        description: '综合训练各种文体的流畅阅读能力',
        textLength: '混合',
        difficulty: '综合',
        focus: '适应性'
      },
      {
        id: 'voice_sync',
        name: '语音同步',
        icon: '🎵',
        level: 'intermediate',
        levelText: '中级',
        description: '通过语音引导同步阅读，提高阅读的节奏感和流畅性',
        textLength: '中篇',
        difficulty: '中等',
        focus: '语音节奏'
      },
      {
        id: 'eye_optimization',
        name: '眼动优化',
        icon: '👁️',
        level: 'advanced',
        levelText: '高级',
        description: '优化眼球运动模式，减少无效眼动，提高阅读效率',
        textLength: '长篇',
        difficulty: '困难',
        focus: '眼动控制'
      },
      {
        id: 'comprehension_fluency',
        name: '理解流畅',
        icon: '🧠',
        level: 'expert',
        levelText: '专家',
        description: '在保持理解质量的前提下提高阅读流畅度',
        textLength: '长篇',
        difficulty: '综合',
        focus: '理解与速度'
      },
      {
        id: 'contextual_reading',
        name: '情境阅读',
        icon: '🌟',
        level: 'expert',
        levelText: '专家',
        description: '在不同情境下保持流畅阅读，适应各种阅读环境',
        textLength: '混合',
        difficulty: '综合',
        focus: '情境适应'
      }
    ])

    // 当前训练模式数据
    const currentModeData = computed(() => {
      return trainingModes.value.find(mode => mode.id === selectedMode.value) || {}
    })

    // 阅读文本
    const currentText = reactive({
      title: '',
      paragraphs: []
    })

    // 完成数据
    const completionData = reactive({
      fluencyScore: 0,
      duration: 0,
      averageSpeed: 0,
      wordsRead: 0,
      regressionCount: 0,
      achievement: null
    })

    // 定时器
    let trainingTimer = null
    let speedTimer = null
    let fluencyTimer = null

    // 选择模式
    const selectMode = (modeId) => {
      selectedMode.value = modeId
    }

    // 开始训练
    const startTraining = (modeId) => {
      baseStartTraining(modeId)
      loadTrainingText()
      startTimers()
    }

    // 停止训练
    const stopTraining = () => {
      clearTimers()
      calculateCompletionData()
      baseStopTraining()
      showCompletionModal.value = true
    }

    // 启动定时器
    const startTimers = () => {
      // 速度更新定时器
      speedTimer = setInterval(() => {
        updateReadingSpeed()
      }, 1000)
      
      // 流畅度更新定时器
      fluencyTimer = setInterval(() => {
        updateFluencyScore()
      }, 2000)
      
      // 自动推进定时器
      if (settings.value.showGuide) {
        trainingTimer = setInterval(() => {
          autoAdvanceReading()
        }, 3000)
      }
    }

    // 清除定时器
    const clearTimers = () => {
      if (trainingTimer) {
        clearInterval(trainingTimer)
        trainingTimer = null
      }
      if (speedTimer) {
        clearInterval(speedTimer)
        speedTimer = null
      }
      if (fluencyTimer) {
        clearInterval(fluencyTimer)
        fluencyTimer = null
      }
    }

    // 文本库
    const textLibrary = reactive({
      basic: {
        title: '春天的故事',
        paragraphs: [
          {
            sentences: [
              '春天来了，万物复苏。',
              '小草从土地里探出头来，嫩绿嫩绿的。',
              '花儿们也竞相开放，红的、黄的、紫的，五彩斑斓。'
            ]
          },
          {
            sentences: [
              '鸟儿们在枝头欢快地歌唱。',
              '它们的歌声清脆悦耳，仿佛在庆祝春天的到来。',
              '微风轻拂，带来了花香和泥土的芬芳。'
            ]
          }
        ]
      },
      intermediate: {
        title: '科技与生活',
        paragraphs: [
          {
            sentences: [
              '现代科技正在深刻地改变着我们的生活方式。',
              '从智能手机到人工智能，从云计算到物联网，技术的发展日新月异。',
              '这些创新不仅提高了工作效率，也丰富了我们的日常体验。'
            ]
          }
        ]
      }
    })

    // 加载训练文本
    const loadTrainingText = () => {
      const modeText = textLibrary[selectedMode.value] || textLibrary.basic
      currentText.title = modeText.title
      currentText.paragraphs = modeText.paragraphs
    }

    // 更新阅读速度
    const updateReadingSpeed = () => {
      if (trainingTime.value > 0) {
        const wordsRead = calculateWordsRead()
        const minutesElapsed = trainingTime.value / 60
        currentSpeed.value = Math.round(wordsRead / minutesElapsed)
      }
    }

    // 计算已读字数
    const calculateWordsRead = () => {
      let wordsRead = 0
      for (let i = 0; i < currentParagraphIndex.value; i++) {
        wordsRead += currentText.paragraphs[i].sentences.join('').length
      }
      if (currentParagraphIndex.value < currentText.paragraphs.length) {
        for (let i = 0; i <= currentSentenceIndex.value; i++) {
          if (currentText.paragraphs[currentParagraphIndex.value].sentences[i]) {
            wordsRead += currentText.paragraphs[currentParagraphIndex.value].sentences[i].length
          }
        }
      }
      return wordsRead
    }

    // 更新流畅度评分
    const updateFluencyScore = () => {
      const speedFactor = Math.min(currentSpeed.value / settings.value.targetSpeed, 1)
      const regressionFactor = Math.max(1 - (regressionCount.value / 10), 0)
      const pauseFactor = Math.max(1 - (pauseTime.value / 30), 0)
      
      const rawScore = (speedFactor + regressionFactor + pauseFactor) / 3 * 5
      fluencyScore.value = Math.round(rawScore)
      
      if (fluencyScore.value >= 4) {
        fluencyLevel.value = 'high'
        fluencyLevelText.value = '优秀'
      } else if (fluencyScore.value >= 3) {
        fluencyLevel.value = 'medium'
        fluencyLevelText.value = '良好'
      } else {
        fluencyLevel.value = 'low'
        fluencyLevelText.value = '较低'
      }
    }

    // 自动推进阅读
    const autoAdvanceReading = () => {
      if (settings.value.showGuide && !isPaused.value) {
        const currentParagraph = currentText.paragraphs[currentParagraphIndex.value]
        if (currentParagraph && currentSentenceIndex.value < currentParagraph.sentences.length - 1) {
          currentSentenceIndex.value++
          
          if (settings.value.highlightSentence) {
            highlightSentenceIndex.value = currentSentenceIndex.value
            setTimeout(() => {
              highlightSentenceIndex.value = -1
            }, 1000)
          }
        } else if (currentParagraphIndex.value < currentText.paragraphs.length - 1) {
          currentParagraphIndex.value++
          currentSentenceIndex.value = 0
        }
      }
    }

    // 计算完成数据
    const calculateCompletionData = () => {
      completionData.fluencyScore = fluencyScore.value
      completionData.duration = trainingTime.value
      completionData.averageSpeed = currentSpeed.value
      completionData.wordsRead = calculateWordsRead()
      completionData.regressionCount = regressionCount.value
      
      // 更新统计数据
      updateStats({
        totalSessions: stats.value.totalSessions + 1,
        totalTime: stats.value.totalTime + trainingTime.value,
        averageSpeed: Math.round((stats.value.averageSpeed * stats.value.totalSessions + currentSpeed.value) / (stats.value.totalSessions + 1)),
        averageFluency: ((stats.value.averageFluency * stats.value.totalSessions + fluencyScore.value) / (stats.value.totalSessions + 1)),
        maxSpeed: Math.max(stats.value.maxSpeed, currentSpeed.value),
        speedData: [...stats.value.speedData.slice(-6), { speed: currentSpeed.value }]
      })
    }

    // 关闭完成弹窗
    const closeCompletionModal = () => {
      showCompletionModal.value = false
      resetTrainingState()
    }

    // 重新开始训练
    const restartTraining = () => {
      showCompletionModal.value = false
      resetTrainingState()
      startTraining(selectedMode.value)
    }

    // 重置训练状态
    const resetTrainingState = () => {
      currentSpeed.value = 0
      fluencyScore.value = 0
      currentParagraphIndex.value = 0
      currentSentenceIndex.value = 0
      highlightSentenceIndex.value = -1
      regressionCount.value = 0
      pauseTime.value = 0
    }

    // 格式化时间
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // 生命周期
    onMounted(async () => {
      // 初始化模块数据
      await initializeModule()
      
      // 初始化文本内容
      if (selectedMode.value) {
        loadTrainingText()
      } else {
        // 如果没有选择模式，默认选择基础模式
        selectedMode.value = 'basic'
        loadTrainingText()
      }
    })

    onUnmounted(() => {
      clearTimers()
    })

    return {
      // 训练状态
      isTraining,
      isPaused,
      trainingTime,
      selectedMode,
      trainingProgress,
      currentSpeed,
      maxSpeed,
      fluencyScore,
      fluencyLevel,
      fluencyLevelText,
      currentParagraphIndex,
      currentSentenceIndex,
      highlightSentenceIndex,
      regressionCount,
      pauseTime,
      showCompletionModal,
      
      // 训练数据
      trainingModes,
      currentModeData,
      currentText,
      completionData,
      
      // 设置和统计
      settings,
      stats,
      
      // 方法
      selectMode,
      startTraining,
      pauseTraining,
      resumeTraining,
      stopTraining,
      closeCompletionModal,
      restartTraining,
      formatTime
    }
  }
}
</script>

<style scoped>
.fluency-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
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
  margin-bottom: 30px;
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
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.mode-card.active {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.2);
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
  background: #22c55e;
  color: white;
}

.mode-level.intermediate {
  background: #f59e0b;
  color: white;
}

.mode-level.advanced {
  background: #ef4444;
  color: white;
}

.mode-level.expert {
  background: #8b5cf6;
  color: white;
}

.mode-card h4 {
  color: white;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.mode-description {
  color: rgba(255, 255, 255, 0.8);
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
  font-size: 0.9rem;
}

.detail-label {
  color: rgba(255, 255, 255, 0.7);
}

.detail-value {
  color: white;
  font-weight: bold;
}

.mode-progress {
  margin-bottom: 20px;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.start-mode-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(45deg, #4ade80, #22c55e);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-mode-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(74, 222, 128, 0.4);
}

/* 训练界面 */
.training-interface {
  max-width: 1000px;
  margin: 0 auto;
}

.training-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  color: white;
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.training-header h3 {
  font-size: 1.5rem;
  margin: 0;
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
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 训练计时器 */
.training-timer {
  text-align: center;
  margin-bottom: 30px;
}

.timer-display {
  margin-bottom: 15px;
}

.time-value {
  font-size: 3rem;
  font-weight: bold;
  color: #4ade80;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.time-label {
  display: block;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 5px;
}

.timer-progress {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  max-width: 300px;
  margin: 0 auto;
}

/* 阅读指导 */
.reading-guide {
  margin-bottom: 30px;
}

.guide-indicator {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 30px;
}

.speed-meter {
  text-align: center;
}

.meter-display {
  margin-bottom: 10px;
}

.speed-value {
  font-size: 2rem;
  font-weight: bold;
  color: #4ade80;
}

.speed-unit {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 5px;
}

.speed-bar {
  width: 150px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto;
}

.speed-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  transition: width 0.3s ease;
}

.fluency-indicator {
  text-align: center;
}

.indicator-label {
  display: block;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.fluency-stars {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-bottom: 10px;
}

.star {
  font-size: 1.5rem;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.star.active {
  opacity: 1;
}

.fluency-level {
  display: block;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
}

.fluency-level.high {
  background: #22c55e;
  color: white;
}

.fluency-level.medium {
  background: #f59e0b;
  color: white;
}

.fluency-level.low {
  background: #ef4444;
  color: white;
}

/* 阅读内容 */
.reading-content {
  margin-bottom: 30px;
}

.text-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 25px;
  max-height: 400px;
  overflow-y: auto;
}

.text-title {
  text-align: center;
  margin-bottom: 20px;
  color: #4ade80;
  font-size: 1.3rem;
}

.text-body {
  line-height: 1.8;
  font-size: 1.1rem;
}

.paragraph {
  margin-bottom: 20px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.paragraph.current {
  opacity: 1;
}

.sentence {
  margin-right: 5px;
  transition: all 0.3s ease;
}

.sentence.current {
  background: rgba(74, 222, 128, 0.3);
  padding: 2px 4px;
  border-radius: 4px;
}

.sentence.highlight {
  background: rgba(245, 158, 11, 0.5);
  padding: 2px 4px;
  border-radius: 4px;
}

/* 训练统计 */
.training-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #4ade80;
}

/* 训练设置 */
.training-settings {
  max-width: 800px;
  margin: 0 auto 40px;
}

.training-settings h3 {
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-item label {
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.setting-item input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  cursor: pointer;
}

.setting-item input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4ade80;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.setting-item select {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.9rem;
}

.setting-item select option {
  background: #333;
  color: white;
}

.setting-value {
  color: #4ade80;
  font-weight: bold;
  text-align: center;
}

.checkbox-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 10px !important;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #4ade80;
}

/* 统计数据 */
.stats-section {
  max-width: 1000px;
  margin: 0 auto 40px;
}

.stats-section h3 {
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.5rem;
}

.stats-overview {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #4ade80;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* 完成弹窗 */
.completion-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  color: white;
}

.modal-content h3 {
  font-size: 2rem;
  margin-bottom: 30px;
  color: #4ade80;
}

.completion-stats {
  margin-bottom: 30px;
}

.completion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.completion-item:last-child {
  border-bottom: none;
}

.completion-label {
  color: rgba(255, 255, 255, 0.8);
}

.completion-value {
  font-weight: bold;
  color: #4ade80;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.secondary-btn,
.primary-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.primary-btn {
  background: linear-gradient(45deg, #4ade80, #22c55e);
  color: white;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(74, 222, 128, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .fluency-container {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .modes-grid,
  .settings-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .guide-indicator {
    flex-direction: column;
    gap: 20px;
  }
  
  .training-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .training-stats {
    grid-template-columns: 1fr;
  }
  
  .text-body {
    font-size: 1rem;
  }
  
  .modal-content {
    padding: 20px;
  }
}
</style>