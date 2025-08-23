<template>
  <div class="image-flash-container">
    <!-- 设置按钮 -->
    <SettingsButton 
      v-if="!isTraining"
      :floating="true"
      :compact="true"
      @click="showSettingsModal = true"
    />
    
    <!-- 设置弹窗 -->
    <SettingsModal
      v-if="showSettingsModal"
      title="图像闪视训练设置"
      :sections="settingsSections"
      @close="showSettingsModal = false"
      @save="handleSettingsSave"
      @reset="handleSettingsReset"
    />

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
              <span class="detail-label">闪视速度:</span>
              <span class="detail-value">{{ mode.flashSpeed }}ms</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">图像类型:</span>
              <span class="detail-value">{{ mode.imageType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">难度等级:</span>
              <span class="detail-value">{{ mode.difficulty }}</span>
            </div>
          </div>

          <div class="mode-stats">
            <div class="stat-item">
              <span class="stat-label">最高识别率</span>
              <span class="stat-value">{{ mode.bestRecognition }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均识别率</span>
              <span class="stat-value">{{ mode.averageRecognition }}%</span>
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
              <span class="info-label">轮次:</span>
              <span class="info-value">{{ currentRound }}/{{ totalRounds }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">识别正确:</span>
              <span class="info-value correct">{{ correctCount }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">识别错误:</span>
              <span class="info-value error">{{ errorCount }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">识别率:</span>
              <span class="info-value">{{ recognitionRate }}%</span>
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

        <!-- 闪视显示区域 -->
        <div class="flash-display-area">
          <div class="flash-container" :class="{ flashing: isFlashing }">
            <div class="flash-content" 
                 :class="{ animated: settings.animationEffects }"
                 v-if="isFlashing">
              <div class="image-display">
                <img 
                  v-if="currentFlashImage.type === 'image'"
                  :src="currentFlashImage.src" 
                  :alt="currentFlashImage.alt"
                  class="flash-image"
                  :style="{ width: settings.imageSize + 'px', height: settings.imageSize + 'px' }"
                >
                <div 
                  v-else-if="currentFlashImage.type === 'shape'"
                  class="flash-shape"
                  :class="currentFlashImage.shape"
                  :style="{ 
                    width: settings.imageSize + 'px', 
                    height: settings.imageSize + 'px',
                    backgroundColor: currentFlashImage.color
                  }"
                ></div>
                <div 
                  v-else-if="currentFlashImage.type === 'symbol'"
                  class="flash-symbol"
                  :style="{ fontSize: settings.imageSize / 2 + 'px', color: currentFlashImage.color }"
                >
                  {{ currentFlashImage.symbol }}
                </div>
                <div 
                  v-else-if="currentFlashImage.type === 'pattern'"
                  class="flash-pattern"
                  :style="{ width: settings.imageSize + 'px', height: settings.imageSize + 'px' }"
                >
                  <div 
                    v-for="(dot, index) in currentFlashImage.pattern" 
                    :key="index"
                    class="pattern-dot"
                    :style="{ 
                      left: dot.x + '%', 
                      top: dot.y + '%',
                      backgroundColor: dot.color || '#333',
                      '--dot-index': index
                    }"
                  ></div>
                </div>
              </div>
            </div>
            <div class="ready-indicator" v-else-if="!isCompleted && !isPaused">
              <span class="ready-text">准备观察...</span>
              <div class="countdown-circle">
                <span class="countdown-number">{{ countdown }}</span>
              </div>
            </div>
            <div class="pause-indicator" v-else-if="isPaused">
              <span class="pause-text">已暂停</span>
              <p>点击继续按钮恢复训练</p>
            </div>
          </div>
        </div>

        <!-- 识别测试区域 -->
        <div class="recognition-area" v-if="showRecognitionTest && !isCompleted">
          <div class="recognition-prompt">
            <h4>识别测试</h4>
            <p class="recognition-hint">{{ recognitionQuestion.question }}</p>
          </div>
          
          <!-- 选择题模式 -->
          <div class="recognition-options" v-if="recognitionQuestion.type === 'choice'">
            <div 
              v-for="(option, index) in recognitionQuestion.options" 
              :key="index"
              class="recognition-option"
              :class="{ 
                selected: selectedAnswer === option.id,
                correct: showResult && option.id === recognitionQuestion.correctAnswer,
                wrong: showResult && selectedAnswer === option.id && option.id !== recognitionQuestion.correctAnswer
              }"
              @click="selectAnswer(option.id)"
            >
              <img 
                v-if="option.type === 'image'"
                :src="option.src" 
                :alt="option.alt"
                class="option-image"
              >
              <div 
                v-else-if="option.type === 'shape'"
                class="option-shape"
                :class="option.shape"
                :style="{ backgroundColor: option.color }"
              ></div>
              <div 
                v-else-if="option.type === 'symbol'"
                class="option-symbol"
                :style="{ color: option.color }"
              >
                {{ option.symbol }}
              </div>
              <div 
                v-else-if="option.type === 'pattern'"
                class="option-pattern"
              >
                <div 
                  v-for="(dot, dotIndex) in option.pattern" 
                  :key="dotIndex"
                  class="pattern-dot small"
                  :style="{ 
                    left: dot.x + '%', 
                    top: dot.y + '%',
                    backgroundColor: dot.color || '#333',
                    '--dot-index': dotIndex
                  }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- 判断题模式 -->
          <div class="judgment-options" v-else-if="recognitionQuestion.type === 'judgment'">
            <button 
              class="judgment-option"
              :class="{ 
                selected: selectedAnswer === true,
                correct: showResult && recognitionQuestion.correctAnswer === true,
                wrong: showResult && selectedAnswer === true && recognitionQuestion.correctAnswer !== true
              }"
              @click="selectAnswer(true)"
              :disabled="showResult"
            >
              ✓ 是
            </button>
            <button 
              class="judgment-option"
              :class="{ 
                selected: selectedAnswer === false,
                correct: showResult && recognitionQuestion.correctAnswer === false,
                wrong: showResult && selectedAnswer === false && recognitionQuestion.correctAnswer !== false
              }"
              @click="selectAnswer(false)"
              :disabled="showResult"
            >
              ✗ 否
            </button>
          </div>
          
          <!-- 计数题模式 -->
          <div class="count-input" v-else>
            <input 
              type="number" 
              class="input-field"
              v-model.number="userCount"
              :placeholder="'请输入数量...'"
              @keyup.enter="submitAnswer"
              :disabled="showResult"
              ref="countInput"
              min="0"
              max="20"
            >
            <button class="submit-btn" @click="submitAnswer" :disabled="userCount === null || showResult">
              提交答案
            </button>
          </div>

          <!-- 结果显示 -->
          <div class="answer-result" v-if="showResult">
            <div class="result-message" :class="{ correct: isAnswerCorrect, wrong: !isAnswerCorrect }">
              <span class="result-icon">{{ isAnswerCorrect ? '✅' : '❌' }}</span>
              <span class="result-text">
                {{ isAnswerCorrect ? '识别正确！' : '识别有误' }}
              </span>
            </div>
            <div class="correct-answer" v-if="!isAnswerCorrect">
              正确答案: <strong>{{ getCorrectAnswerText() }}</strong>
            </div>
            <div class="explanation" v-if="recognitionQuestion.explanation">
              <strong>解析:</strong> {{ recognitionQuestion.explanation }}
            </div>
            <button class="next-btn" @click="nextRound">
              {{ currentRound >= totalRounds ? '查看结果' : '下一张' }}
            </button>
          </div>
        </div>

        <!-- 完成状态 -->
        <div class="completion-status" v-if="isCompleted">
          <div class="completion-header">
            <span class="completion-icon">🎉</span>
            <h4>训练完成！</h4>
            <p>恭喜你完成了 {{ totalRounds }} 轮图像闪视训练</p>
          </div>
          
          <!-- 鼓励消息 -->
          <div class="encouragement-message" v-if="settings.showEncouragement">
            <div class="encouragement-content">
              <span class="encouragement-text">{{ getEncouragementMessage() }}</span>
            </div>
          </div>
          
          <div class="completion-stats">
            <div class="stat-item">
              <span class="stat-label">总轮次</span>
              <span class="stat-value">{{ totalRounds }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">识别正确</span>
              <span class="stat-value correct">{{ correctCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">识别错误</span>
              <span class="stat-value error">{{ errorCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">识别率</span>
              <span class="stat-value">{{ recognitionRate }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均反应时间</span>
              <span class="stat-value">{{ averageReactionTime }}ms</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">等级评价</span>
              <span class="stat-value" :class="performanceLevel.class">{{ performanceLevel.text }}</span>
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
            <label>闪视速度 (毫秒)</label>
            <div class="range-container">
              <input 
                type="range" 
                class="range-input"
                v-model="settings.flashDuration"
                min="200"
                max="2000"
                step="100"
              >
              <span class="range-value">{{ settings.flashDuration }}ms</span>
            </div>
          </div>
          <div class="setting-item">
            <label>间隔时间 (秒)</label>
            <div class="range-container">
              <input 
                type="range" 
                class="range-input"
                v-model="settings.intervalTime"
                min="1"
                max="5"
                step="1"
              >
              <span class="range-value">{{ settings.intervalTime }}s</span>
            </div>
          </div>
          <div class="setting-item">
            <label>训练轮次</label>
            <select class="select-input" v-model="settings.rounds">
              <option value="5">5轮</option>
              <option value="10">10轮</option>
              <option value="15">15轮</option>
              <option value="20">20轮</option>
            </select>
          </div>
          <div class="setting-item">
            <label>图像类型</label>
            <select class="select-input" v-model="settings.imageType">
              <option value="shapes">几何图形</option>
              <option value="symbols">符号标记</option>
              <option value="patterns">点阵图案</option>
              <option value="mixed">混合类型</option>
            </select>
          </div>
        </div>

        <div class="setting-card">
          <h4>显示设置</h4>
          <div class="setting-item">
            <label>图像大小</label>
            <div class="range-container">
              <input 
                type="range" 
                class="range-input"
                v-model="settings.imageSize"
                min="100"
                max="300"
                step="20"
              >
              <span class="range-value">{{ settings.imageSize }}px</span>
            </div>
          </div>
          <div class="setting-item">
            <label>背景颜色</label>
            <select class="select-input" v-model="settings.backgroundColor">
              <option value="white">白色</option>
              <option value="black">黑色</option>
              <option value="gray">灰色</option>
              <option value="blue">蓝色</option>
            </select>
          </div>
          <div class="setting-item">
            <label>颜色模式</label>
            <select class="select-input" v-model="settings.colorMode">
              <option value="colorful">彩色</option>
              <option value="monochrome">单色</option>
              <option value="grayscale">灰度</option>
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
                v-model="settings.randomOrder"
              >
              随机顺序
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.autoNext"
              >
              自动下一题
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.showHints"
              >
              提示显示
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.adaptiveDifficulty"
              >
              自适应难度
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.showEncouragement"
              >
              鼓励消息
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.showGuide"
              >
              阅读指南
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.progressSound"
              >
              进度音效
            </label>
          </div>
        </div>
        
        <div class="setting-card">
          <h4>高级设置</h4>
          <div class="setting-item">
            <label>难度等级</label>
            <select class="select-input" v-model="settings.difficulty">
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
              <option value="all">全部</option>
            </select>
          </div>
          <div class="setting-item">
            <label>内容过滤</label>
            <select class="select-input" v-model="settings.contentFilter">
              <option value="all">全部类型</option>
              <option value="shapes">几何图形</option>
              <option value="symbols">符号标记</option>
              <option value="patterns">点阵图案</option>
              <option value="numbers">数字</option>
              <option value="letters">字母</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.animationEffects"
              >
              动画效果
            </label>
          </div>
          <div class="setting-item">
            <label>高亮颜色</label>
            <select class="select-input" v-model="settings.highlightColor">
              <option value="#FFD700">金色</option>
              <option value="#FF6B6B">红色</option>
              <option value="#4ECDC4">青色</option>
              <option value="#45B7D1">蓝色</option>
              <option value="#96CEB4">绿色</option>
            </select>
          </div>
          <div class="setting-item">
            <label>识别模式</label>
            <select class="select-input" v-model="settings.recognitionMode">
              <option value="instant">即时识别</option>
              <option value="delayed">延时识别</option>
              <option value="choice">选择识别</option>
            </select>
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
              <span class="stat-icon">👁️</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.totalSessions }}</span>
                <span class="stat-label">总训练次数</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🎯</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.bestRecognition }}%</span>
                <span class="stat-label">最高识别率</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📊</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.averageRecognition }}%</span>
                <span class="stat-label">平均识别率</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⚡</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.averageReactionTime }}ms</span>
                <span class="stat-label">平均反应时间</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>不同模式表现</h4>
          <div class="mode-performance">
            <div 
              v-for="mode in statistics.modePerformance" 
              :key="mode.id"
              class="mode-stat"
            >
              <div class="mode-header">
                <span class="mode-name">{{ mode.name }}</span>
                <span class="mode-level">{{ mode.level }}</span>
              </div>
              <div class="mode-details">
                <div class="detail-row">
                  <span class="detail-label">最高:</span>
                  <span class="detail-value">{{ mode.bestRecognition }}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">平均:</span>
                  <span class="detail-value">{{ mode.averageRecognition }}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">次数:</span>
                  <span class="detail-value">{{ mode.attempts }}</span>
                </div>
              </div>
              <div class="mode-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: mode.mastery + '%' }"
                  ></div>
                </div>
                <span class="progress-text">熟练度: {{ mode.mastery }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>识别率趋势</h4>
          <div class="recognition-chart">
            <div class="chart-container">
              <div class="chart-line">
                <div 
                  v-for="(data, index) in statistics.recognitionTrend" 
                  :key="index"
                  class="chart-point"
                  :style="{ 
                    left: (index / (statistics.recognitionTrend.length - 1)) * 100 + '%',
                    bottom: data.recognition + '%'
                  }"
                  :title="`第${index + 1}次: ${data.recognition}%`"
                ></div>
                <svg class="chart-svg">
                  <polyline 
                    :points="getChartPoints()"
                    fill="none"
                    stroke="#2196F3"
                    stroke-width="2"
                  />
                </svg>
              </div>
              <div class="chart-axis">
                <span class="axis-label">训练次数</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>视觉能力分析</h4>
          <div class="ability-analysis">
            <div class="ability-item">
              <div class="ability-header">
                <span class="ability-name">图像识别</span>
                <span class="ability-score">{{ abilityScores.imageRecognition }}/100</span>
              </div>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: abilityScores.imageRecognition + '%' }"></div>
              </div>
            </div>
            <div class="ability-item">
              <div class="ability-header">
                <span class="ability-name">形状感知</span>
                <span class="ability-score">{{ abilityScores.shapePerception }}/100</span>
              </div>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: abilityScores.shapePerception + '%' }"></div>
              </div>
            </div>
            <div class="ability-item">
              <div class="ability-header">
                <span class="ability-name">颜色辨识</span>
                <span class="ability-score">{{ abilityScores.colorDiscrimination }}/100</span>
              </div>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: abilityScores.colorDiscrimination + '%' }"></div>
              </div>
            </div>
            <div class="ability-item">
              <div class="ability-header">
                <span class="ability-name">视觉记忆</span>
                <span class="ability-score">{{ abilityScores.visualMemory }}/100</span>
              </div>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: abilityScores.visualMemory + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SettingsModal from '@/components/SettingsModal.vue'
import SettingsButton from '@/components/SettingsButton.vue'
import { useTrainingSettings } from '@/composables/useTrainingSettings'
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ImageFlash',
  components: {
    SettingsModal,
    SettingsButton
  },
  emits: ['go-back'],
  setup() {
    // 使用训练设置 composable
    const {
      settings,
      isLoading: settingsLoading,
      error: settingsError,
      updateSettings,
      resetSettings: resetTrainingSettings,
      settingsSections
    } = useTrainingSettings('imageFlash')

    // 设置弹窗状态
    const showSettingsModal = ref(false)

    // 设置处理方法
    const handleSettingsSave = async (newSettings) => {
      try {
        await updateSettings(newSettings, { immediate: true })
        showSettingsModal.value = false
      } catch (error) {
        console.error('保存设置失败:', error)
      }
    }

    const handleSettingsReset = async () => {
      try {
        await resetTrainingSettings()
        showSettingsModal.value = false
      } catch (error) {
        console.error('重置设置失败:', error)
      }
    }

    return {
      settings,
      settingsLoading,
      settingsError,
      settingsSections,
      showSettingsModal,
      handleSettingsSave,
      handleSettingsReset
    }
  },
  data() {
    return {
      // 训练状态
      isTraining: false,
      isPaused: false,
      isCompleted: false,
      selectedMode: null,
      currentRound: 0,
      totalRounds: 10,
      correctCount: 0,
      errorCount: 0,
      
      // 闪视相关
      isFlashing: false,
      currentFlashImage: {},
      showRecognitionTest: false,
      showResult: false,
      isAnswerCorrect: false,
      countdown: 3,
      
      // 识别测试相关
      recognitionQuestion: {},
      selectedAnswer: null,
      userCount: null,
      reactionTimes: [],
      roundStartTime: null,
      
      // 训练模式
      trainingModes: [
        {
          id: 'simple_shapes',
          name: '基础图形',
          icon: '🔷',
          level: 'beginner',
          levelText: '初级',
          description: '简单几何图形闪视，训练基础识别能力',
          flashSpeed: 800,
          imageType: '几何图形',
          difficulty: '简单',
          bestRecognition: 95,
          averageRecognition: 88
        },
        {
          id: 'color_shapes',
          name: '彩色图形',
          icon: '🌈',
          level: 'intermediate',
          levelText: '中级',
          description: '彩色几何图形闪视，训练颜色识别',
          flashSpeed: 600,
          imageType: '彩色图形',
          difficulty: '中等',
          bestRecognition: 82,
          averageRecognition: 75
        },
        {
          id: 'complex_patterns',
          name: '复杂图案',
          icon: '🔸',
          level: 'advanced',
          levelText: '高级',
          description: '复杂图案闪视，挑战视觉识别极限',
          flashSpeed: 400,
          imageType: '复杂图案',
          difficulty: '困难',
          bestRecognition: 68,
          averageRecognition: 61
        },
        {
          id: 'symbol_recognition',
          name: '符号识别',
          icon: '🔣',
          level: 'intermediate',
          levelText: '中级',
          description: '各种符号闪视，训练符号记忆',
          flashSpeed: 700,
          imageType: '符号标记',
          difficulty: '中等',
          bestRecognition: 79,
          averageRecognition: 72
        },
        {
          id: 'dot_patterns',
          name: '点阵图案',
          icon: '⚫',
          level: 'advanced',
          levelText: '高级',
          description: '点阵图案闪视，训练空间记忆',
          flashSpeed: 500,
          imageType: '点阵图案',
          difficulty: '困难',
          bestRecognition: 71,
          averageRecognition: 64
        },
        {
          id: 'mixed_challenge',
          name: '综合挑战',
          icon: '🎯',
          level: 'expert',
          levelText: '专家',
          description: '混合类型闪视，全面挑战视觉能力',
          flashSpeed: 300,
          imageType: '混合类型',
          difficulty: '极难',
          bestRecognition: 59,
          averageRecognition: 52
        }
      ],
      
      // 当前训练数据
      currentModeData: {},
      
      // 图像库
      imageLibrary: {
        shapes: [
          { type: 'shape', shape: 'circle', color: '#FF5722', difficulty: 'easy', category: 'basic' },
          { type: 'shape', shape: 'square', color: '#2196F3', difficulty: 'easy', category: 'basic' },
          { type: 'shape', shape: 'triangle', color: '#4CAF50', difficulty: 'easy', category: 'basic' },
          { type: 'shape', shape: 'diamond', color: '#FF9800', difficulty: 'medium', category: 'basic' },
          { type: 'shape', shape: 'hexagon', color: '#9C27B0', difficulty: 'medium', category: 'basic' },
          { type: 'shape', shape: 'pentagon', color: '#E91E63', difficulty: 'medium', category: 'basic' },
          { type: 'shape', shape: 'octagon', color: '#795548', difficulty: 'hard', category: 'basic' },
          { type: 'shape', shape: 'star', color: '#FFC107', difficulty: 'hard', category: 'basic' },
          { type: 'shape', shape: 'oval', color: '#607D8B', difficulty: 'medium', category: 'basic' },
          { type: 'shape', shape: 'rhombus', color: '#3F51B5', difficulty: 'hard', category: 'basic' }
        ],
        symbols: [
          { type: 'symbol', symbol: '★', color: '#FFD700', difficulty: 'easy', category: 'symbols' },
          { type: 'symbol', symbol: '♦', color: '#FF5722', difficulty: 'easy', category: 'symbols' },
          { type: 'symbol', symbol: '♠', color: '#333', difficulty: 'easy', category: 'symbols' },
          { type: 'symbol', symbol: '♥', color: '#E91E63', difficulty: 'easy', category: 'symbols' },
          { type: 'symbol', symbol: '♣', color: '#4CAF50', difficulty: 'easy', category: 'symbols' },
          { type: 'symbol', symbol: '◆', color: '#2196F3', difficulty: 'medium', category: 'symbols' },
          { type: 'symbol', symbol: '▲', color: '#FF9800', difficulty: 'medium', category: 'symbols' },
          { type: 'symbol', symbol: '●', color: '#9C27B0', difficulty: 'medium', category: 'symbols' },
          { type: 'symbol', symbol: '◎', color: '#00BCD4', difficulty: 'hard', category: 'symbols' },
          { type: 'symbol', symbol: '※', color: '#FF5722', difficulty: 'hard', category: 'symbols' },
          { type: 'symbol', symbol: '☆', color: '#FFEB3B', difficulty: 'medium', category: 'symbols' },
          { type: 'symbol', symbol: '◇', color: '#8BC34A', difficulty: 'hard', category: 'symbols' }
        ],
        patterns: [
          {
            type: 'pattern',
            difficulty: 'medium',
            category: 'patterns',
            pattern: [
              { x: 20, y: 20, color: '#FF5722' },
              { x: 50, y: 30, color: '#2196F3' },
              { x: 80, y: 40, color: '#4CAF50' }
            ]
          },
          {
            type: 'pattern',
            difficulty: 'medium',
            category: 'patterns',
            pattern: [
              { x: 30, y: 30, color: '#FF9800' },
              { x: 70, y: 30, color: '#9C27B0' },
              { x: 50, y: 70, color: '#FFD700' }
            ]
          },
          {
            type: 'pattern',
            difficulty: 'hard',
            category: 'patterns',
            pattern: [
              { x: 15, y: 15, color: '#E91E63' },
              { x: 45, y: 25, color: '#3F51B5' },
              { x: 75, y: 35, color: '#00BCD4' },
              { x: 25, y: 65, color: '#8BC34A' },
              { x: 65, y: 75, color: '#FF5722' }
            ]
          },
          {
            type: 'pattern',
            difficulty: 'easy',
            category: 'patterns',
            pattern: [
              { x: 40, y: 40, color: '#2196F3' },
              { x: 60, y: 60, color: '#4CAF50' }
            ]
          }
        ],
        numbers: [
          { type: 'number', value: '1', color: '#FF5722', difficulty: 'easy', category: 'numbers' },
          { type: 'number', value: '2', color: '#2196F3', difficulty: 'easy', category: 'numbers' },
          { type: 'number', value: '3', color: '#4CAF50', difficulty: 'easy', category: 'numbers' },
          { type: 'number', value: '4', color: '#FF9800', difficulty: 'easy', category: 'numbers' },
          { type: 'number', value: '5', color: '#9C27B0', difficulty: 'easy', category: 'numbers' },
          { type: 'number', value: '12', color: '#E91E63', difficulty: 'medium', category: 'numbers' },
          { type: 'number', value: '25', color: '#795548', difficulty: 'medium', category: 'numbers' },
          { type: 'number', value: '67', color: '#607D8B', difficulty: 'medium', category: 'numbers' },
          { type: 'number', value: '123', color: '#3F51B5', difficulty: 'hard', category: 'numbers' },
          { type: 'number', value: '456', color: '#00BCD4', difficulty: 'hard', category: 'numbers' }
        ],
        letters: [
          { type: 'letter', value: 'A', color: '#FF5722', difficulty: 'easy', category: 'letters' },
          { type: 'letter', value: 'B', color: '#2196F3', difficulty: 'easy', category: 'letters' },
          { type: 'letter', value: 'C', color: '#4CAF50', difficulty: 'easy', category: 'letters' },
          { type: 'letter', value: 'X', color: '#FF9800', difficulty: 'medium', category: 'letters' },
          { type: 'letter', value: 'Y', color: '#9C27B0', difficulty: 'medium', category: 'letters' },
          { type: 'letter', value: 'Z', color: '#E91E63', difficulty: 'medium', category: 'letters' },
          { type: 'letter', value: 'AB', color: '#795548', difficulty: 'hard', category: 'letters' },
          { type: 'letter', value: 'XY', color: '#607D8B', difficulty: 'hard', category: 'letters' }
        ]
      },
      
      // 训练设置（从配置服务获取）
      settings: {},
      
      // 统计数据
      statistics: {
        totalSessions: 38,
        bestRecognition: 95,
        averageRecognition: 76,
        averageReactionTime: 850,
        modePerformance: [
          {
            id: 'simple_shapes',
            name: '基础图形',
            level: '初级',
            bestRecognition: 95,
            averageRecognition: 88,
            attempts: 12,
            mastery: 92
          },
          {
            id: 'color_shapes',
            name: '彩色图形',
            level: '中级',
            bestRecognition: 82,
            averageRecognition: 75,
            attempts: 10,
            mastery: 78
          },
          {
            id: 'complex_patterns',
            name: '复杂图案',
            level: '高级',
            bestRecognition: 68,
            averageRecognition: 61,
            attempts: 8,
            mastery: 65
          }
        ],
        recognitionTrend: [
          { recognition: 65 },
          { recognition: 70 },
          { recognition: 68 },
          { recognition: 75 },
          { recognition: 78 },
          { recognition: 76 },
          { recognition: 82 },
          { recognition: 85 },
          { recognition: 83 },
          { recognition: 88 }
        ]
      },
      
      // 定时器
      flashTimer: null,
      countdownTimer: null
    }
  },
  
  // 设置初始化已移至 composable 中自动处理
  
  computed: {
    recognitionRate() {
      const total = this.correctCount + this.errorCount
      return total > 0 ? Math.round((this.correctCount / total) * 100) : 0
    },
    
    averageReactionTime() {
      if (this.reactionTimes.length === 0) return 0
      const sum = this.reactionTimes.reduce((a, b) => a + b, 0)
      return Math.round(sum / this.reactionTimes.length)
    },
    
    performanceLevel() {
      const rate = this.recognitionRate
      if (rate >= 90) return { text: '优秀', class: 'excellent' }
      if (rate >= 80) return { text: '良好', class: 'good' }
      if (rate >= 70) return { text: '一般', class: 'average' }
      return { text: '需要提高', class: 'poor' }
    },
    
    abilityScores() {
      return {
        imageRecognition: Math.min(100, this.recognitionRate + 5),
        shapePerception: Math.min(100, this.recognitionRate),
        colorDiscrimination: Math.min(100, this.recognitionRate - 5),
        visualMemory: Math.min(100, this.recognitionRate - 10)
      }
    },
    
    // 设置弹窗配置
    settingsSections() {
      return [
        {
          title: '基础设置',
          items: [
            {
              key: 'flashDuration',
              label: '闪现时长',
              type: 'range',
              value: this.settings.flashDuration,
              min: 100,
              max: 3000,
              step: 100,
              unit: 'ms',
              description: '图像显示的时间长度'
            },
            {
              key: 'intervalDuration',
              label: '间隔时长',
              type: 'range',
              value: this.settings.intervalDuration,
              min: 0,
              max: 3000,
              step: 100,
              unit: 'ms',
              description: '图像之间的间隔时间'
            },
            {
              key: 'imageCount',
              label: '图片数量',
              type: 'range',
              value: this.settings.imageCount,
              min: 5,
              max: 50,
              step: 5,
              description: '每轮训练的图片数量'
            },
            {
              key: 'imageSize',
              label: '图片尺寸',
              type: 'select',
              value: this.settings.imageSize,
              options: [
                { value: 'small', label: '小 (150px)' },
                { value: 'medium', label: '中 (200px)' },
                { value: 'large', label: '大 (300px)' }
              ],
              description: '闪现图片的显示尺寸'
            }
          ]
        },
        {
          title: '训练模式',
          items: [
            {
              key: 'mode',
              label: '训练模式',
              type: 'select',
              value: this.settings.mode,
              options: [
                { value: 'sequence', label: '顺序模式' },
                { value: 'random', label: '随机模式' },
                { value: 'adaptive', label: '自适应模式' }
              ],
              description: '图片显示的顺序方式'
            },
            {
              key: 'difficulty',
              label: '难度等级',
              type: 'select',
              value: this.settings.difficulty,
              options: [
                { value: 'easy', label: '简单' },
                { value: 'normal', label: '普通' },
                { value: 'hard', label: '困难' }
              ],
              description: '训练的难度级别'
            }
          ]
        },
        {
          title: '显示设置',
          items: [
            {
              key: 'showProgress',
              label: '显示进度',
              type: 'switch',
              value: this.settings.showProgress,
              description: '是否显示训练进度'
            },
            {
              key: 'showTimer',
              label: '显示计时器',
              type: 'switch',
              value: this.settings.showTimer,
              description: '是否显示计时器'
            },
            {
              key: 'showScore',
              label: '显示分数',
              type: 'switch',
              value: this.settings.showScore,
              description: '是否显示实时分数'
            }
          ]
        },
        {
          title: '反馈设置',
          items: [
            {
              key: 'enableSound',
              label: '启用声音',
              type: 'switch',
              value: this.settings.enableSound,
              description: '是否播放音效反馈'
            },
            {
              key: 'showCorrectAnswer',
              label: '显示正确答案',
              type: 'switch',
              value: this.settings.showCorrectAnswer,
              description: '答错时是否显示正确答案'
            }
          ]
        },
        {
          title: '高级设置',
          items: [
            {
              key: 'autoStart',
              label: '自动开始',
              type: 'switch',
              value: this.settings.autoStart,
              description: '是否自动开始下一轮'
            },
            {
              key: 'adaptiveDifficulty',
              label: '自适应难度',
              type: 'switch',
              value: this.settings.adaptiveDifficulty,
              description: '根据表现自动调整难度'
            }
          ]
        }
      ]
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
      this.isTraining = true
      this.totalRounds = parseInt(this.settings.rounds)
      this.startCountdown()
    },
    
    // 暂停训练
    pauseTraining() {
      this.isPaused = true
      this.clearTimers()
    },
    
    // 恢复训练
    resumeTraining() {
      this.isPaused = false
      if (this.showRecognitionTest) {
        return
      }
      this.startCountdown()
    },
    
    // 停止训练
    stopTraining() {
      this.clearTimers()
      this.isTraining = false
      this.isPaused = false
      this.isCompleted = false
    },
    
    // 重新开始训练
    restartTraining() {
      this.resetTrainingState()
      this.startCountdown()
    },
    
    // 开始倒计时
    startCountdown() {
      this.countdown = 3
      this.countdownTimer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer)
          this.startFlash()
        }
      }, 1000)
    },
    
    // 开始闪视
    startFlash() {
      this.currentRound++
      this.generateFlashImage()
      this.isFlashing = true
      this.roundStartTime = Date.now()
      
      // 播放开始音效
      if (this.settings.soundEffects) {
        this.playFlashSound()
      }
      
      this.flashTimer = setTimeout(() => {
        this.isFlashing = false
        this.showRecognitionTest = true
        
        // 记录反应时间
        const reactionTime = Date.now() - this.roundStartTime
        this.reactionTimes.push(reactionTime)
        
        // 自动聚焦输入框
        if (this.recognitionQuestion.type === 'count') {
          this.$nextTick(() => {
            if (this.$refs.countInput) {
              this.$refs.countInput.focus()
            }
          })
        }
      }, this.settings.flashDuration)
    },
    
    // 生成闪视图像
    generateFlashImage() {
      const mode = this.currentModeData.id
      const filteredImages = this.getFilteredImages(mode)
      
      // 随机选择图像
      const randomImage = filteredImages[Math.floor(Math.random() * filteredImages.length)]
      this.currentFlashImage = randomImage
      this.generateRecognitionQuestion(randomImage)
    },
    
    // 获取筛选后的图像
    getFilteredImages(mode) {
      let allImages = []
      
      // 根据模式和设置筛选图像
      if (mode === 'simple_shapes' || mode === 'color_shapes') {
        allImages = [...this.imageLibrary.shapes]
      } else if (mode === 'symbol_recognition') {
        allImages = [...this.imageLibrary.symbols]
      } else if (mode === 'dot_patterns') {
        allImages = [...this.imageLibrary.patterns]
      } else if (mode === 'number_flash') {
        allImages = [...this.imageLibrary.numbers]
      } else if (mode === 'letter_flash') {
        allImages = [...this.imageLibrary.letters]
      } else {
        // 混合模式 - 包含所有类型
        allImages = [
          ...this.imageLibrary.shapes,
          ...this.imageLibrary.symbols,
          ...this.imageLibrary.patterns,
          ...this.imageLibrary.numbers,
          ...this.imageLibrary.letters
        ]
      }
      
      // 应用难度筛选
      if (this.settings.difficulty !== 'all') {
        allImages = allImages.filter(image => image.difficulty === this.settings.difficulty)
      }
      
      // 应用内容筛选
      if (this.settings.contentFilter !== 'all') {
        allImages = allImages.filter(image => image.category === this.settings.contentFilter)
      }
      
      // 如果筛选后没有图像，返回所有图像
      if (allImages.length === 0) {
        allImages = [
          ...this.imageLibrary.shapes,
          ...this.imageLibrary.symbols,
          ...this.imageLibrary.patterns,
          ...this.imageLibrary.numbers,
          ...this.imageLibrary.letters
        ]
      }
      
      return allImages
    },
    
    // 生成图形图像
    generateShapeImage() {
      const shapes = this.imageLibrary.shapes
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)]
      return { ...randomShape }
    },
    
    // 生成符号图像
    generateSymbolImage() {
      const symbols = this.imageLibrary.symbols
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
      return { ...randomSymbol }
    },
    
    // 生成图案图像
    generatePatternImage() {
      const patterns = this.imageLibrary.patterns
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)]
      return { ...randomPattern }
    },
    
    // 生成识别问题
    generateRecognitionQuestion(imageData) {
      const questionTypes = ['choice', 'judgment', 'count']
      const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)]
      
      if (randomType === 'choice') {
        this.generateChoiceQuestion(imageData)
      } else if (randomType === 'judgment') {
        this.generateJudgmentQuestion(imageData)
      } else {
        this.generateCountQuestion(imageData)
      }
    },
    
    // 生成选择题
    generateChoiceQuestion(imageData) {
      const options = []
      
      // 添加正确答案
      options.push({
        id: 'correct',
        ...imageData
      })
      
      // 添加错误选项
      for (let i = 0; i < 3; i++) {
        let wrongOption
        if (imageData.type === 'shape') {
          wrongOption = this.generateShapeImage()
        } else if (imageData.type === 'symbol') {
          wrongOption = this.generateSymbolImage()
        } else {
          wrongOption = this.generatePatternImage()
        }
        
        options.push({
          id: `wrong_${i}`,
          ...wrongOption
        })
      }
      
      // 随机排序
      if (this.settings.randomOrder) {
        this.shuffleArray(options)
      }
      
      this.recognitionQuestion = {
        type: 'choice',
        question: '请选择刚才看到的图像：',
        options: options,
        correctAnswer: 'correct'
      }
    },
    
    // 生成判断题
    generateJudgmentQuestion(imageData) {
      const isCorrect = Math.random() > 0.5
      let testImage
      
      if (isCorrect) {
        testImage = { ...imageData }
      } else {
        if (imageData.type === 'shape') {
          testImage = this.generateShapeImage()
        } else if (imageData.type === 'symbol') {
          testImage = this.generateSymbolImage()
        } else {
          testImage = this.generatePatternImage()
        }
      }
      
      this.recognitionQuestion = {
        type: 'judgment',
        question: '这是刚才看到的图像吗？',
        testImage: testImage,
        correctAnswer: isCorrect
      }
    },
    
    // 生成计数题
    generateCountQuestion(imageData) {
      if (imageData.type === 'pattern') {
        this.recognitionQuestion = {
          type: 'count',
          question: '刚才看到的图案中有多少个点？',
          correctAnswer: imageData.pattern.length
        }
      } else {
        // 对于非图案类型，生成随机计数题
        const count = Math.floor(Math.random() * 5) + 1
        this.recognitionQuestion = {
          type: 'count',
          question: '如果刚才的图像重复出现，总共会有多少个？',
          correctAnswer: count
        }
      }
    },
    
    // 选择答案
    selectAnswer(answer) {
      if (this.showResult) return
      
      this.selectedAnswer = answer
      this.checkAnswer(answer)
    },
    
    // 提交答案
    submitAnswer() {
      if (this.userCount === null || this.showResult) return
      
      this.checkAnswer(this.userCount)
    },
    
    // 检查答案
    checkAnswer(answer) {
      let isCorrect = false
      
      if (this.recognitionQuestion.type === 'choice') {
        isCorrect = answer === this.recognitionQuestion.correctAnswer
      } else if (this.recognitionQuestion.type === 'judgment') {
        isCorrect = answer === this.recognitionQuestion.correctAnswer
      } else {
        isCorrect = answer === this.recognitionQuestion.correctAnswer
      }
      
      this.isAnswerCorrect = isCorrect
      
      if (isCorrect) {
        this.correctCount++
        if (this.settings.soundEffects) {
          this.playSuccessSound()
        }
      } else {
        this.errorCount++
        if (this.settings.soundEffects) {
          this.playErrorSound()
        }
      }
      
      this.showResult = true
      
      // 自动下一题
      if (this.settings.autoNext) {
        setTimeout(() => {
          this.nextRound()
        }, 2000)
      }
    },
    
    // 下一轮
    nextRound() {
      this.showResult = false
      this.showRecognitionTest = false
      this.selectedAnswer = null
      this.userCount = null
      
      if (this.currentRound >= this.totalRounds) {
        this.completeTraining()
      } else {
        this.startCountdown()
      }
    },
    
    // 完成训练
    completeTraining() {
      this.isCompleted = true
      
      // 播放完成音效
      if (this.settings.soundEffects) {
        this.playCompletionSound()
      }
      
      // 保存成绩
      this.saveResult()
    },
    
    // 获取正确答案文本
    getCorrectAnswerText() {
      if (this.recognitionQuestion.type === 'choice') {
        const correctOption = this.recognitionQuestion.options.find(
          option => option.id === this.recognitionQuestion.correctAnswer
        )
        if (correctOption) {
          if (correctOption.type === 'shape') {
            return `${correctOption.color} ${correctOption.shape}`
          } else if (correctOption.type === 'symbol') {
            return correctOption.symbol
          } else {
            return '对应的图案'
          }
        }
      } else if (this.recognitionQuestion.type === 'judgment') {
        return this.recognitionQuestion.correctAnswer ? '是' : '否'
      } else {
        return this.recognitionQuestion.correctAnswer
      }
      return ''
    },
    
    // 重置训练状态
    resetTrainingState() {
      this.currentRound = 0
      this.correctCount = 0
      this.errorCount = 0
      this.isCompleted = false
      this.isFlashing = false
      this.showRecognitionTest = false
      this.showResult = false
      this.selectedAnswer = null
      this.userCount = null
      this.reactionTimes = []
      this.clearTimers()
    },
    
    // 清除定时器
    clearTimers() {
      if (this.flashTimer) {
        clearTimeout(this.flashTimer)
        this.flashTimer = null
      }
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    },
    
    // 数组随机排序
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
    },
    
    // 播放音效
    playFlashSound() {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    },
    
    playSuccessSound() {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    },
    
    playErrorSound() {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.4)
    },
    
    playCompletionSound() {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      const frequencies = [523, 659, 784, 1047]
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        const startTime = audioContext.currentTime + index * 0.2
        oscillator.frequency.setValueAtTime(freq, startTime)
        gainNode.gain.setValueAtTime(0.1, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + 0.4)
      })
    },
    
    // 获取鼓励消息
    getEncouragementMessage() {
      if (!this.settings.showEncouragement) return ''
      
      const recognitionRate = this.recognitionRate
      let messageType
      
      if (recognitionRate >= 90) {
        messageType = 'excellent'
      } else if (recognitionRate >= 80) {
        messageType = 'good'
      } else if (recognitionRate >= 60) {
        messageType = 'average'
      } else {
        messageType = 'poor'
      }
      
      const messages = {
        excellent: [
          '太棒了！你的视觉识别能力非常出色！',
          '完美的表现！继续保持这种专注力！',
          '惊人的识别速度！你的大脑反应很敏锐！',
          '卓越的成绩！你的视觉训练效果显著！'
        ],
        good: [
          '很好！你的识别能力在稳步提升！',
          '不错的表现！继续练习会更好！',
          '良好的进步！保持这种训练节奏！',
          '做得很好！你的专注力在增强！'
        ],
        average: [
          '继续努力！你正在进步中！',
          '不要气馁，多练习会有提升！',
          '保持练习，你会看到明显改善！',
          '坚持训练，成功就在前方！'
        ],
        poor: [
          '没关系，每个人都有起步阶段！',
          '坚持练习，你一定会进步的！',
          '不要放弃，持续训练是关键！',
          '相信自己，下次会更好！'
        ]
      }
      
      const messageArray = messages[messageType]
      return messageArray[Math.floor(Math.random() * messageArray.length)]
    },
    
    // 保存结果
    saveResult() {
      const result = {
        id: Date.now().toString(),
        mode: this.currentModeData.id,
        modeName: this.currentModeData.name,
        recognitionRate: this.recognitionRate,
        correctCount: this.correctCount,
        errorCount: this.errorCount,
        totalRounds: this.totalRounds,
        averageReactionTime: this.averageReactionTime,
        reactionTimes: [...this.reactionTimes],
        settings: {
          flashDuration: this.settings.flashDuration,
          intervalTime: this.settings.intervalTime,
          imageSize: this.settings.imageSize,
          imageType: this.settings.imageType
        },
        date: new Date().toISOString(),
        timestamp: Date.now()
      }
      
      const results = JSON.parse(localStorage.getItem('imageFlashResults') || '[]')
      results.push(result)
      
      // 保持最近1000条记录
      if (results.length > 1000) {
        results.splice(0, results.length - 1000)
      }
      
      localStorage.setItem('imageFlashResults', JSON.stringify(results))
      this.updateStatistics(result)
    },
    
    // 更新统计数据
    updateStatistics(result) {
      if (result.recognitionRate > this.statistics.bestRecognition) {
        this.statistics.bestRecognition = result.recognitionRate
      }
      
      this.statistics.totalSessions++
      this.saveStatistics()
    },
    
    // 获取图表点坐标
    getChartPoints() {
      return this.statistics.recognitionTrend.map((data, index) => {
        const x = (index / (this.statistics.recognitionTrend.length - 1)) * 100
        const y = 100 - data.recognition
        return `${x},${y}`
      }).join(' ')
    },
    
    // 保存设置（已移至设置相关方法中）
    
    // 设置加载已移至 composable 中自动处理
    
    // 保存统计数据
    saveStatistics() {
      localStorage.setItem('imageFlashStats', JSON.stringify(this.statistics))
    },
    
    // 加载统计数据
    loadStatistics() {
      const saved = localStorage.getItem('imageFlashStats')
      if (saved) {
        this.statistics = { ...this.statistics, ...JSON.parse(saved) }
      }
    },
    
    // 获取训练历史
    getTrainingHistory(days = 30) {
      const results = JSON.parse(localStorage.getItem('imageFlashResults') || '[]')
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      return results.filter(result => new Date(result.date) >= cutoffDate)
    },
    
    // 获取详细统计分析
    getDetailedAnalysis() {
      const results = JSON.parse(localStorage.getItem('imageFlashResults') || '[]')
      
      if (results.length === 0) {
        return {
          totalSessions: 0,
          averageRecognition: 0,
          bestRecognition: 0,
          worstRecognition: 0,
          improvementTrend: 0,
          modePerformance: {},
          weeklyProgress: []
        }
      }
      
      const analysis = {
        totalSessions: results.length,
        averageRecognition: results.reduce((sum, r) => sum + r.recognitionRate, 0) / results.length,
        bestRecognition: Math.max(...results.map(r => r.recognitionRate)),
        worstRecognition: Math.min(...results.map(r => r.recognitionRate)),
        averageReactionTime: results.reduce((sum, r) => sum + (r.averageReactionTime || 0), 0) / results.length
      }
      
      // 计算改进趋势
      if (results.length >= 10) {
        const recent = results.slice(-10)
        const earlier = results.slice(-20, -10)
        const recentAvg = recent.reduce((sum, r) => sum + r.recognitionRate, 0) / recent.length
        const earlierAvg = earlier.reduce((sum, r) => sum + r.recognitionRate, 0) / earlier.length
        analysis.improvementTrend = recentAvg - earlierAvg
      } else {
        analysis.improvementTrend = 0
      }
      
      // 按模式分析表现
      analysis.modePerformance = {}
      results.forEach(result => {
        if (!analysis.modePerformance[result.mode]) {
          analysis.modePerformance[result.mode] = {
            sessions: 0,
            totalRecognition: 0,
            bestRecognition: 0,
            averageReactionTime: 0,
            totalReactionTime: 0
          }
        }
        
        const mode = analysis.modePerformance[result.mode]
        mode.sessions++
        mode.totalRecognition += result.recognitionRate
        mode.bestRecognition = Math.max(mode.bestRecognition, result.recognitionRate)
        mode.totalReactionTime += (result.averageReactionTime || 0)
      })
      
      // 计算平均值
      Object.keys(analysis.modePerformance).forEach(mode => {
        const perf = analysis.modePerformance[mode]
        perf.averageRecognition = perf.totalRecognition / perf.sessions
        perf.averageReactionTime = perf.totalReactionTime / perf.sessions
      })
      
      // 计算每周进度
      analysis.weeklyProgress = this.calculateWeeklyProgress(results)
      
      return analysis
    },
    
    // 计算每周进度
    calculateWeeklyProgress(results) {
      const weeks = {}
      
      results.forEach(result => {
        const date = new Date(result.date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekKey = weekStart.toISOString().split('T')[0]
        
        if (!weeks[weekKey]) {
          weeks[weekKey] = {
            week: weekKey,
            sessions: 0,
            totalRecognition: 0,
            bestRecognition: 0
          }
        }
        
        weeks[weekKey].sessions++
        weeks[weekKey].totalRecognition += result.recognitionRate
        weeks[weekKey].bestRecognition = Math.max(weeks[weekKey].bestRecognition, result.recognitionRate)
      })
      
      return Object.values(weeks)
        .map(week => ({
          ...week,
          averageRecognition: week.totalRecognition / week.sessions
        }))
        .sort((a, b) => new Date(a.week) - new Date(b.week))
        .slice(-12) // 最近12周
    },
    
    // 导出训练数据
    exportTrainingData() {
      const results = JSON.parse(localStorage.getItem('imageFlashResults') || '[]')
      const settings = JSON.parse(localStorage.getItem('imageFlashSettings') || '{}')
      const statistics = JSON.parse(localStorage.getItem('imageFlashStats') || '{}')
      
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        type: 'imageFlashTraining',
        data: {
          results,
          settings,
          statistics,
          analysis: this.getDetailedAnalysis()
        }
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `image-flash-training-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      return true
    },
    
    // 导入训练数据
    importTrainingData(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        
        reader.onload = (e) => {
          try {
            const importData = JSON.parse(e.target.result)
            
            if (importData.type !== 'imageFlashTraining') {
              reject(new Error('无效的数据文件类型'))
              return
            }
            
            // 备份当前数据
            this.createBackup()
            
            // 导入数据
            if (importData.data.results) {
              const existingResults = JSON.parse(localStorage.getItem('imageFlashResults') || '[]')
              const mergedResults = [...existingResults, ...importData.data.results]
              
              // 去重并排序
              const uniqueResults = mergedResults.filter((result, index, arr) => 
                arr.findIndex(r => r.id === result.id) === index
              ).sort((a, b) => new Date(a.date) - new Date(b.date))
              
              localStorage.setItem('imageFlashResults', JSON.stringify(uniqueResults))
            }
            
            if (importData.data.settings) {
              localStorage.setItem('imageFlashSettings', JSON.stringify(importData.data.settings))
              this.loadSettings()
            }
            
            if (importData.data.statistics) {
              localStorage.setItem('imageFlashStats', JSON.stringify(importData.data.statistics))
              this.loadStatistics()
            }
            
            resolve({
              success: true,
              message: '数据导入成功',
              importedRecords: importData.data.results?.length || 0
            })
          } catch (error) {
            reject(new Error('数据文件格式错误: ' + error.message))
          }
        }
        
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsText(file)
      })
    },
    
    // 创建数据备份
    createBackup() {
      const backupData = {
        results: localStorage.getItem('imageFlashResults'),
        settings: localStorage.getItem('imageFlashSettings'),
        statistics: localStorage.getItem('imageFlashStats'),
        timestamp: Date.now()
      }
      
      const backups = JSON.parse(localStorage.getItem('imageFlashBackups') || '[]')
      backups.push(backupData)
      
      // 保持最近10个备份
      if (backups.length > 10) {
        backups.splice(0, backups.length - 10)
      }
      
      localStorage.setItem('imageFlashBackups', JSON.stringify(backups))
    },
    
    // 恢复数据备份
    restoreBackup(backupIndex) {
      const backups = JSON.parse(localStorage.getItem('imageFlashBackups') || '[]')
      
      if (backupIndex < 0 || backupIndex >= backups.length) {
        throw new Error('无效的备份索引')
      }
      
      const backup = backups[backupIndex]
      
      if (backup.results) {
        localStorage.setItem('imageFlashResults', backup.results)
      }
      if (backup.settings) {
        localStorage.setItem('imageFlashSettings', backup.settings)
        this.loadSettings()
      }
      if (backup.statistics) {
        localStorage.setItem('imageFlashStats', backup.statistics)
        this.loadStatistics()
      }
      
      return true
    },
    
    // 清除训练数据
    clearTrainingData(type = 'all') {
      this.createBackup() // 清除前先备份
      
      switch (type) {
        case 'results':
          localStorage.removeItem('imageFlashResults')
          break
        case 'settings':
          localStorage.removeItem('imageFlashSettings')
          this.loadSettings() // 重新加载默认设置
          break
        case 'statistics':
          localStorage.removeItem('imageFlashStats')
          this.loadStatistics() // 重新加载默认统计
          break
        case 'all':
          localStorage.removeItem('imageFlashResults')
          localStorage.removeItem('imageFlashSettings')
          localStorage.removeItem('imageFlashStats')
          this.loadSettings()
          this.loadStatistics()
          break
      }
      
      return true
    },
    
    // 获取存储使用情况
    getStorageUsage() {
      const results = localStorage.getItem('imageFlashResults') || ''
      const settings = localStorage.getItem('imageFlashSettings') || ''
      const statistics = localStorage.getItem('imageFlashStats') || ''
      const backups = localStorage.getItem('imageFlashBackups') || ''
      
      const usage = {
        results: {
          size: new Blob([results]).size,
          records: JSON.parse(results || '[]').length
        },
        settings: {
          size: new Blob([settings]).size
        },
        statistics: {
          size: new Blob([statistics]).size
        },
        backups: {
          size: new Blob([backups]).size,
          count: JSON.parse(backups || '[]').length
        }
      }
      
      usage.total = usage.results.size + usage.settings.size + usage.statistics.size + usage.backups.size
      
      return usage
    },
    
    // 返回父组件
    goBack() {
      this.$emit('go-back')
    },
    
    // 设置相关方法
    openSettings() {
      this.showSettingsModal = true
    },
    
    closeSettings() {
      this.showSettingsModal = false
    },
    
    // 设置相关方法已移至 setup() 中
    
    applySettingsToTraining() {
      // 应用设置到当前训练
      if (this.settings.flashDuration !== this.currentFlashDuration) {
        this.currentFlashDuration = this.settings.flashDuration
      }
      if (this.settings.intervalDuration !== this.currentIntervalDuration) {
        this.currentIntervalDuration = this.settings.intervalDuration
      }
    }
  },
  
  mounted() {
    this.loadStatistics()
  },
  
  beforeUnmount() {
    this.clearTimers()
  },
  
  watch: {
    // 设置现在通过配置服务管理，不需要监听
  }
}
</script>

<style scoped>
/* 页面容器 */
.image-flash-container {
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
  position: relative;
}

.back-btn {
  position: absolute;
  left: 20px;
  top: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  padding: 10px 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateX(-2px);
}

.back-arrow {
  font-size: 1.2rem;
  font-weight: bold;
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
  border: 3px solid #667eea;
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
  background: #e8f5e8;
  color: #4caf50;
}

.mode-level.intermediate {
  background: #fff3e0;
  color: #ff9800;
}

.mode-level.advanced {
  background: #ffebee;
  color: #f44336;
}

.mode-level.expert {
  background: #f3e5f5;
  color: #9c27b0;
}

.mode-card h4 {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #333;
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
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
}

.start-mode-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
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
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.training-header h3 {
  color: #333;
  margin: 0;
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
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 10px;
  min-width: 80px;
}

.info-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
}

.info-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.info-value.correct {
  color: #4caf50;
}

.info-value.error {
  color: #f44336;
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
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: buttonPulse 0.6s ease-in-out;
}

@keyframes buttonPulse {
  0% { transform: scale(1.1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1.1); }
}

/* 闪视显示区域 */
.flash-display-area {
  margin-bottom: 30px;
}

.flash-container {
  width: 100%;
  height: 400px;
  background: #f8f9fa;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 3px solid #e0e0e0;
  transition: all 0.3s ease;
}

.flash-container.flashing {
  background: white;
  border-color: #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
  animation: flashPulse 0.5s ease-in-out;
}

@keyframes flashPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.flash-content {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  animation: flashIn 0.3s ease-out forwards;
}

.flash-content.animated {
  animation: flashInAnimated 0.5s ease-out forwards;
}

@keyframes flashIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes flashInAnimated {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(-10deg);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.image-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flash-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.flash-image:hover {
  transform: scale(1.05);
}

.flash-shape {
  border-radius: 10px;
  transition: all 0.3s ease;
  animation: shapeAppear 0.4s ease-out;
}

@keyframes shapeAppear {
  0% {
    opacity: 0;
    transform: scale(0) rotate(180deg);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2) rotate(90deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.flash-shape.circle {
  border-radius: 50%;
}

.flash-shape.triangle {
  width: 0 !important;
  height: 0 !important;
  border-left: 100px solid transparent;
  border-right: 100px solid transparent;
  border-bottom: 173px solid;
  background: transparent !important;
}

.flash-shape.diamond {
  transform: rotate(45deg);
}

.flash-shape.hexagon {
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

.flash-symbol {
  font-weight: bold;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: symbolBounce 0.6s ease-out;
}

@keyframes symbolBounce {
  0% {
    opacity: 0;
    transform: scale(0) translateY(-50px);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.3) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.flash-pattern {
  position: relative;
  border: 2px solid #ddd;
  border-radius: 10px;
  animation: patternFade 0.8s ease-out;
}

@keyframes patternFade {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.pattern-dot {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: dotPop 0.4s ease-out;
  animation-delay: calc(var(--dot-index) * 0.1s);
}

@keyframes dotPop {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes optionAppear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes optionHover {
  0% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-3px) scale(1.08);
  }
  100% {
    transform: translateY(-2px) scale(1.05);
  }
}

@keyframes optionSelect {
  0% {
    transform: scale(1);
    background: white;
  }
  50% {
    transform: scale(1.1);
    background: #e8f0ff;
  }
  100% {
    transform: scale(1.02);
    background: #f0f4ff;
  }
}

@keyframes correctPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0.3);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

@keyframes wrongShake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

@keyframes buttonGlow {
  0% {
    box-shadow: 0 2px 5px rgba(90, 111, 216, 0.2);
  }
  50% {
    box-shadow: 0 8px 25px rgba(90, 111, 216, 0.6);
  }
  100% {
    box-shadow: 0 5px 15px rgba(90, 111, 216, 0.4);
  }
}

.pattern-dot.small {
  width: 10px;
  height: 10px;
}

.ready-indicator {
  text-align: center;
}

.ready-text {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 20px;
  display: block;
}

.countdown-circle {
  width: 80px;
  height: 80px;
  border: 4px solid #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: pulse 1s infinite;
}

.countdown-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.pause-indicator {
  text-align: center;
  color: #666;
}

.pause-text {
  font-size: 1.5rem;
  margin-bottom: 10px;
  display: block;
}

/* 识别测试区域 */
.recognition-area {
  margin-bottom: 30px;
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.recognition-prompt {
  text-align: center;
  margin-bottom: 25px;
}

.recognition-prompt h4 {
  color: #333;
  margin-bottom: 10px;
}

.recognition-hint {
  color: #666;
  font-size: 1.1rem;
}

.recognition-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.recognition-option {
  aspect-ratio: 1;
  border: 3px solid #e0e0e0;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  position: relative;
  animation: optionAppear 0.5s ease-out;
}

.recognition-option:hover {
  border-color: #667eea;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  animation: optionHover 0.3s ease-out;
}

.recognition-option.selected {
  border-color: #667eea;
  background: #f0f4ff;
  transform: scale(1.02);
  animation: optionSelect 0.4s ease-out;
}

.recognition-option.correct {
  border-color: #4caf50;
  background: #e8f5e8;
  animation: correctPulse 0.6s ease-out;
}

.recognition-option.wrong {
  border-color: #f44336;
  background: #ffebee;
  animation: wrongShake 0.5s ease-out;
}

.option-image {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}

.option-shape {
  width: 60px;
  height: 60px;
  border-radius: 10px;
}

.option-shape.circle {
  border-radius: 50%;
}

.option-shape.triangle {
  width: 0 !important;
  height: 0 !important;
  border-left: 30px solid transparent;
  border-right: 30px solid transparent;
  border-bottom: 52px solid;
  background: transparent !important;
}

.option-shape.diamond {
  transform: rotate(45deg);
}

.option-shape.hexagon {
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

.option-symbol {
  font-size: 2rem;
  font-weight: bold;
}

.option-pattern {
  position: relative;
  width: 80px;
  height: 80px;
  border: 2px solid #ddd;
  border-radius: 10px;
}

.judgment-options {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
}

.judgment-option {
  padding: 15px 30px;
  border: 3px solid #e0e0e0;
  border-radius: 15px;
  background: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.judgment-option:hover:not(:disabled) {
  border-color: #667eea;
  transform: translateY(-2px);
}

.judgment-option.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.judgment-option.correct {
  border-color: #4caf50;
  background: #e8f5e8;
  color: #4caf50;
}

.judgment-option.wrong {
  border-color: #f44336;
  background: #ffebee;
  color: #f44336;
}

.judgment-option:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.count-input {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.input-field {
  padding: 12px 20px;
  border: 3px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1.2rem;
  text-align: center;
  width: 150px;
  transition: border-color 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
}

.submit-btn {
  padding: 12px 25px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(90, 111, 216, 0.4);
  animation: buttonGlow 0.3s ease-out;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 答案结果 */
.answer-result {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 15px;
}

.result-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 1.3rem;
  font-weight: bold;
}

.result-message.correct {
  color: #4caf50;
}

.result-message.wrong {
  color: #f44336;
}

.result-icon {
  font-size: 1.5rem;
}

.correct-answer {
  margin-bottom: 15px;
  color: #666;
  font-size: 1.1rem;
}

.explanation {
  margin-bottom: 20px;
  color: #666;
  font-style: italic;
  line-height: 1.5;
}

.next-btn {
  padding: 12px 30px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-btn:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

/* 完成状态 */
.completion-status {
  text-align: center;
  animation: completionAppear 0.8s ease-out;
}

@keyframes completionAppear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05) translateY(5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.completion-message {
  margin-bottom: 30px;
}

.completion-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  display: block;
}

.completion-message h4 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.completion-message p {
  color: #666;
  font-size: 1.1rem;
}

.encouragement-message {
  margin: 20px 0;
  padding: 15px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 10px;
  color: white;
}

.encouragement-text {
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  display: block;
}

.completion-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 15px;
}

.completion-stats .stat-item {
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 10px;
}

.completion-stats .stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.completion-stats .stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #333;
}

.completion-stats .stat-value.correct {
  color: #4caf50;
}

.completion-stats .stat-value.error {
  color: #f44336;
}

.completion-stats .stat-value.excellent {
  color: #4caf50;
}

.completion-stats .stat-value.good {
  color: #2196f3;
}

.completion-stats .stat-value.average {
  color: #ff9800;
}

.completion-stats .stat-value.poor {
  color: #f44336;
}

.completion-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.action-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.primary:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(90, 111, 216, 0.4);
  animation: buttonGlow 0.3s ease-out;
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e0e0e0;
}

.action-btn.secondary:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

/* 训练设置 */
.training-settings {
  margin-bottom: 40px;
}

.training-settings h3 {
  color: white;
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  max-width: 1200px;
  margin: 0 auto;
}

.setting-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.setting-card h4 {
  color: #333;
  margin-bottom: 20px;
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
  color: #333;
  font-weight: 500;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
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
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.range-input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.range-value {
  min-width: 60px;
  text-align: center;
  font-weight: bold;
  color: #667eea;
}

.select-input {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.select-input:focus {
  outline: none;
  border-color: #667eea;
}

/* 训练统计 */
.training-statistics {
  margin-bottom: 40px;
}

.training-statistics h3 {
  color: white;
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  max-width: 1400px;
  margin: 0 auto;
}

.stats-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.stats-card h4 {
  color: #333;
  margin-bottom: 20px;
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
  flex-direction: column;
  align-items: center;
  padding: 20px 15px;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: center;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-overview .stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stats-overview .stat-label {
  font-size: 0.9rem;
  color: #666;
}

.mode-performance {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mode-stat {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.mode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.mode-name {
  font-weight: bold;
  color: #333;
}

.mode-level {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: #e0e0e0;
  color: #666;
}

.mode-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 2px;
}

.detail-value {
  font-weight: bold;
  color: #333;
}

.mode-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
}

.recognition-chart {
  height: 200px;
  position: relative;
}

.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
}

.chart-line {
  width: 100%;
  height: calc(100% - 30px);
  position: relative;
}

.chart-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  z-index: 2;
}

.chart-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.chart-axis {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.axis-label {
  font-size: 0.8rem;
  color: #666;
}

.ability-analysis {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ability-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ability-name {
  font-weight: 500;
  color: #333;
}

.ability-score {
  font-weight: bold;
  color: #667eea;
}

.ability-bar {
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.ability-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

/* 响应式设计 */
/* 笔记本屏幕优化 (1024px-1440px) */
@media (min-width: 1024px) and (max-width: 1440px) {
  .image-flash-container {
    padding: 25px;
  }
  
  .training-interface {
    max-width: 900px;
  }
  
  .training-card {
    padding: 25px;
  }
  
  .flash-container {
    height: 350px;
  }
  
  .modes-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 18px;
  }
  
  .mode-card {
    padding: 22px;
  }
  
  .page-header h1 {
    font-size: 2.2rem;
  }
  
  .training-header h3 {
    font-size: 1.3rem;
  }
  
  .info-item {
    padding: 8px 12px;
    min-width: 70px;
  }
  
  .recognition-options {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .settings-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
}

/* 小笔记本屏幕优化 (1024px-1366px) */
@media (min-width: 1024px) and (max-width: 1366px) {
  .training-interface {
    max-width: 850px;
  }
  
  .flash-container {
    height: 320px;
  }
  
  .page-header h1 {
    font-size: 2.1rem;
  }
  
  .mode-card {
    padding: 20px;
  }
  
  .training-card {
    padding: 22px;
  }
}

@media (max-width: 768px) {
  .image-flash-container {
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
    gap: 15px;
    align-items: stretch;
  }
  
  .training-info {
    justify-content: center;
  }
  
  .flash-container {
    height: 300px;
  }
  
  .recognition-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .judgment-options {
    flex-direction: column;
    align-items: center;
  }
  
  .count-input {
    flex-direction: column;
    align-items: center;
  }
  
  .completion-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mode-details {
    flex-direction: column;
    gap: 5px;
  }
  
  .detail-row {
    flex-direction: row;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .training-card {
    padding: 20px;
  }
  
  .flash-container {
    height: 250px;
  }
  
  .recognition-options {
    grid-template-columns: 1fr;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .completion-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>