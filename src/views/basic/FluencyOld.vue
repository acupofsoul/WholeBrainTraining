<template>
  <div class="fluency-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>流畅度训练</h1>
      <p class="page-description">
        通过连续性阅读练习，提高阅读的流畅性和连贯性，
        减少回视和停顿，培养自然流畅的阅读习惯。
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
              <div class="fluency-level" :class="fluencyLevel">
                <span class="level-text">{{ fluencyLevelText }}</span>
                <div class="level-bars">
                  <div 
                    v-for="i in 5" 
                    :key="i"
                    class="level-bar"
                    :class="{ active: i <= fluencyScore }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 阅读内容 -->
        <div class="reading-content">
          <div class="text-container">
            <div class="reading-text" ref="readingText">
              <div 
                v-for="(paragraph, pIndex) in currentText.paragraphs" 
                :key="pIndex"
                class="paragraph"
                :class="{ 
                  current: pIndex === currentParagraphIndex,
                  completed: pIndex < currentParagraphIndex
                }"
              >
                <span 
                  v-for="(sentence, sIndex) in paragraph.sentences" 
                  :key="sIndex"
                  class="sentence"
                  :class="{ 
                    current: pIndex === currentParagraphIndex && sIndex === currentSentenceIndex,
                    completed: pIndex < currentParagraphIndex || (pIndex === currentParagraphIndex && sIndex < currentSentenceIndex),
                    highlight: pIndex === currentParagraphIndex && sIndex === highlightSentenceIndex
                  }"
                >
                  {{ sentence }}
                </span>
              </div>
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
              <span>段落: {{ currentParagraphIndex + 1 }}/{{ currentText.paragraphs.length }}</span>
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
            <span class="stat-value">{{ currentSpeed }} 字/分</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">流畅度评分</span>
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
        
        <!-- 语音同步模式信息 -->
        <div class="voice-sync-info" v-if="selectedMode === 'voice_sync'">
          <h4>语音同步训练</h4>
          <div class="sync-controls">
            <button class="voice-btn" @click="toggleVoiceSync">
              {{ voiceSyncData.isPlaying ? '⏸️ 暂停语音' : '▶️ 开始语音' }}
            </button>
            <div class="voice-speed">
              <label>语音速度: {{ voiceSyncData.voiceSpeed }}x</label>
              <input type="range" v-model="voiceSyncData.voiceSpeed" min="0.5" max="2.0" step="0.1">
            </div>
          </div>
          <div class="sync-status">
            <div class="current-phrase">{{ voiceSyncData.phrases[voiceSyncData.currentPhrase] }}</div>
            <div class="sync-accuracy">同步准确度: {{ Math.round(voiceSyncData.syncAccuracy) }}%</div>
          </div>
        </div>
        
        <!-- 眼动优化模式信息 -->
        <div class="eye-optimization-info" v-if="selectedMode === 'eye_optimization'">
          <h4>眼动优化训练</h4>
          <div class="eye-stats">
            <div class="eye-stat">
              <span class="eye-label">注视次数</span>
              <span class="eye-value">{{ eyeOptimizationData.fixationCount }}</span>
            </div>
            <div class="eye-stat">
              <span class="eye-label">眼跳次数</span>
              <span class="eye-value">{{ eyeOptimizationData.saccadeCount }}</span>
            </div>
            <div class="eye-stat">
              <span class="eye-label">注视时长</span>
              <span class="eye-value">{{ Math.round(eyeOptimizationData.fixationDuration) }}ms</span>
            </div>
            <div class="eye-stat">
              <span class="eye-label">运动模式</span>
              <span class="eye-value">{{ eyeOptimizationData.eyeMovementPattern }}</span>
            </div>
          </div>
        </div>
        
        <!-- 理解流畅模式信息 -->
        <div class="comprehension-fluency-info" v-if="selectedMode === 'comprehension_fluency'">
          <h4>理解流畅训练</h4>
          <div class="balance-indicator">
            <div class="balance-meter">
              <div class="balance-fill" :style="{ width: comprehensionFluencyData.balanceIndex + '%' }"></div>
            </div>
            <div class="balance-text">理解与速度平衡: {{ Math.round(comprehensionFluencyData.balanceIndex) }}%</div>
          </div>
          <div class="comprehension-stats">
            <div class="comp-stat">
              <span class="comp-label">理解得分</span>
              <span class="comp-value">{{ comprehensionFluencyData.comprehensionScore }}%</span>
            </div>
            <div class="comp-stat">
              <span class="comp-label">正确答案</span>
              <span class="comp-value">{{ comprehensionFluencyData.correctAnswers }}/{{ comprehensionFluencyData.questions.length }}</span>
            </div>
          </div>
        </div>
        
        <!-- 情境阅读模式信息 -->
        <div class="contextual-reading-info" v-if="selectedMode === 'contextual_reading'">
          <h4>情境阅读训练</h4>
          <div class="context-indicator">
            <div class="current-context" :class="contextualReadingData.currentContext">
              当前情境: {{ getContextName(contextualReadingData.currentContext) }}
            </div>
            <div class="adaptation-score">
              适应能力: {{ Math.round(contextualReadingData.adaptationScore) }}%
            </div>
          </div>
          <div class="context-progress">
            <div class="context-bar">
              <div 
                v-for="(context, index) in contextualReadingData.contextTypes" 
                :key="context"
                class="context-segment"
                :class="{ active: index === contextualReadingData.contextIndex }"
              >
                {{ getContextName(context) }}
              </div>
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
          <h4>阅读设置</h4>
          <div class="setting-item">
            <label>目标速度 (字/分)</label>
            <input 
              type="number" 
              class="number-input"
              v-model="settings.targetSpeed"
              :min="100"
              :max="1000"
            >
          </div>
          <div class="setting-item">
            <label>文本类型</label>
            <select class="select-input" v-model="settings.textType">
              <option value="narrative">叙述文</option>
              <option value="expository">说明文</option>
              <option value="argumentative">议论文</option>
              <option value="mixed">混合类型</option>
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
        </div>

        <div class="setting-card">
          <h4>训练辅助</h4>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.showGuide"
              >
              显示阅读引导
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.highlightSentence"
              >
              高亮当前句子
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.trackRegression"
              >
              检测回视行为
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.soundFeedback"
              >
              声音反馈
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
            <label>休息间隔 (分钟)</label>
            <input 
              type="number" 
              class="number-input"
              v-model="settings.breakInterval"
              :min="5"
              :max="30"
            >
          </div>
          <div class="setting-item">
            <label>难度调整</label>
            <select class="select-input" v-model="settings.difficultyAdjustment">
              <option value="manual">手动调整</option>
              <option value="auto">自动调整</option>
              <option value="adaptive">自适应调整</option>
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
              <span class="stat-icon">📚</span>
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
              <span class="stat-icon">🚀</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.averageSpeed }}</span>
                <span class="stat-label">平均速度 (字/分)</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🎯</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.averageFluency }}</span>
                <span class="stat-label">平均流畅度</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>速度趋势</h4>
          <div class="performance-chart">
            <div class="chart-bars">
              <div 
                v-for="(data, index) in statistics.speedData" 
                :key="index"
                class="chart-bar"
                :style="{ height: (data.speed / statistics.maxSpeed) * 100 + '%' }"
                :title="`第${index + 1}次: ${data.speed} 字/分`"
              >
                <span class="bar-label">{{ index + 1 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>流畅度分析</h4>
          <div class="fluency-analysis">
            <div class="analysis-item">
              <span class="analysis-label">回视频率</span>
              <div class="analysis-bar">
                <div 
                  class="analysis-fill" 
                  :style="{ width: statistics.regressionRate + '%' }"
                ></div>
              </div>
              <span class="analysis-value">{{ statistics.regressionRate }}%</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">停顿时间</span>
              <div class="analysis-bar">
                <div 
                  class="analysis-fill" 
                  :style="{ width: (statistics.pauseTime / 10) * 100 + '%' }"
                ></div>
              </div>
              <span class="analysis-value">{{ statistics.pauseTime }}s</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">阅读稳定性</span>
              <div class="analysis-bar">
                <div 
                  class="analysis-fill" 
                  :style="{ width: statistics.stability + '%' }"
                ></div>
              </div>
              <span class="analysis-value">{{ statistics.stability }}%</span>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>能力评估</h4>
          <div class="ability-ratings">
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
              <span class="rating-label">阅读速度</span>
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
              <span class="rating-label">阅读稳定性</span>
              <div class="rating-stars">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  class="star"
                  :class="{ filled: i <= statistics.stabilityRating }"
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
              :style="{ '--progress': completionData.fluencyScore * 20 }"
            >
              <div class="circle-text">
                <span class="circle-value">{{ completionData.fluencyScore }}/5</span>
                <span class="circle-label">流畅度</span>
              </div>
            </div>
          </div>
          
          <div class="completion-details">
            <div class="detail-item">
              <span class="detail-label">训练时长:</span>
              <span class="detail-value">{{ formatTime(completionData.duration) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">平均速度:</span>
              <span class="detail-value">{{ completionData.averageSpeed }} 字/分</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">阅读字数:</span>
              <span class="detail-value">{{ completionData.wordsRead }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">回视次数:</span>
              <span class="detail-value">{{ completionData.regressionCount }}</span>
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
  name: 'Fluency',
  data() {
    return {
      isTraining: false,
      isPaused: false,
      selectedMode: null,
      currentSpeed: 0,
      maxSpeed: 500,
      fluencyScore: 0,
      fluencyLevel: 'low',
      fluencyLevelText: '较低',
      currentParagraphIndex: 0,
      currentSentenceIndex: 0,
      highlightSentenceIndex: -1,
      trainingTime: 0,
      regressionCount: 0,
      pauseTime: 0,
      showCompletionModal: false,
      
      // 训练模式
      trainingModes: [
        {
          id: 'basic',
          name: '基础流畅度',
          icon: '📖',
          level: 'beginner',
          levelText: '初级',
          description: '建立基本的流畅阅读习惯，减少停顿和回视',
          textLength: '短篇',
          difficulty: '简单',
          focus: '连续性',
          progress: 80
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
          focus: '节奏感',
          progress: 55
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
          focus: '自动化',
          progress: 30
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
          focus: '适应性',
          progress: 15
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
          focus: '语音节奏',
          progress: 0
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
          focus: '眼动控制',
          progress: 0
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
          focus: '理解与速度',
          progress: 0
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
          focus: '情境适应',
          progress: 0
        }
      ],
      
      // 当前训练模式数据
      currentModeData: {},
      
      // 阅读文本
      currentText: {
        title: '',
        paragraphs: []
      },
      
      // 训练设置
      settings: {
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
      },
      
      // 统计数据
      statistics: {
        totalSessions: 32,
        totalTime: 9600, // 秒
        averageSpeed: 285,
        averageFluency: 3.8,
        maxSpeed: 450,
        regressionRate: 12,
        pauseTime: 3.2,
        stability: 85,
        fluencyRating: 4,
        speedRating: 3,
        stabilityRating: 4,
        focusRating: 4,
        speedData: [
          { speed: 180 },
          { speed: 210 },
          { speed: 245 },
          { speed: 270 },
          { speed: 285 },
          { speed: 310 },
          { speed: 295 }
        ]
      },
      
      // 完成数据
      completionData: {
        fluencyScore: 0,
        duration: 0,
        averageSpeed: 0,
        wordsRead: 0,
        regressionCount: 0,
        achievement: null
      },
      
      // 定时器
      trainingTimer: null,
      speedTimer: null,
      fluencyTimer: null,
      voiceTimer: null,
      eyeTrackingTimer: null,
      comprehensionTimer: null,
      
      // 语音同步数据
      voiceSyncData: {
        isPlaying: false,
        currentPhrase: 0,
        voiceSpeed: 1.0,
        syncAccuracy: 0,
        phrases: []
      },
      
      // 眼动优化数据
      eyeOptimizationData: {
        fixationCount: 0,
        saccadeCount: 0,
        regressionRate: 0,
        fixationDuration: 0,
        eyeMovementPattern: 'normal'
      },
      
      // 理解流畅数据
      comprehensionFluencyData: {
        comprehensionScore: 0,
        readingSpeed: 0,
        balanceIndex: 0,
        questions: [],
        currentQuestion: 0,
        correctAnswers: 0
      },
      
      // 情境阅读数据
      contextualReadingData: {
        currentContext: 'normal',
        adaptationScore: 0,
        contextTypes: ['normal', 'noisy', 'dim', 'bright', 'moving'],
        contextIndex: 0,
        performanceByContext: {}
      }
    }
  },
  
  computed: {
    readingProgress() {
      if (this.currentText.paragraphs.length === 0) return 0
      const totalParagraphs = this.currentText.paragraphs.length
      const currentProgress = this.currentParagraphIndex / totalParagraphs
      const sentenceProgress = this.currentSentenceIndex / (this.currentText.paragraphs[this.currentParagraphIndex]?.sentences.length || 1)
      return (currentProgress + sentenceProgress / totalParagraphs) * 100
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
      
      // 加载训练文本
      this.loadTrainingText()
      
      // 重置训练状态
      this.resetTrainingState()
      
      // 初始化模式特定数据
      this.initializeModeSpecificData(modeId)
      
      this.isTraining = true
      this.startTrainingTimer()
      this.startSpeedTracking()
      this.startFluencyTracking()
      
      // 启动模式特定定时器
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
      this.startTrainingTimer()
      this.startSpeedTracking()
      this.startFluencyTracking()
    },
    
    // 停止训练
    stopTraining() {
      this.clearTimers()
      this.calculateCompletionData()
      this.showCompletionModal = true
      this.isTraining = false
      this.isPaused = false
    },
    
    // 开始训练定时器
    startTrainingTimer() {
      this.trainingTimer = setInterval(() => {
        this.trainingTime++
      }, 1000)
    },
    
    // 开始速度跟踪
    startSpeedTracking() {
      this.speedTimer = setInterval(() => {
        this.updateReadingSpeed()
      }, 1000)
    },
    
    // 开始流畅度跟踪
    startFluencyTracking() {
      this.fluencyTimer = setInterval(() => {
        this.updateFluencyScore()
        this.autoAdvanceReading()
      }, 2000)
    },
    
    // 清除定时器
    clearTimers() {
      if (this.trainingTimer) {
        clearInterval(this.trainingTimer)
        this.trainingTimer = null
      }
      if (this.speedTimer) {
        clearInterval(this.speedTimer)
        this.speedTimer = null
      }
      if (this.fluencyTimer) {
        clearInterval(this.fluencyTimer)
        this.fluencyTimer = null
      }
      if (this.voiceTimer) {
        clearInterval(this.voiceTimer)
        this.voiceTimer = null
      }
      if (this.eyeTrackingTimer) {
        clearInterval(this.eyeTrackingTimer)
        this.eyeTrackingTimer = null
      }
      if (this.comprehensionTimer) {
        clearInterval(this.comprehensionTimer)
        this.comprehensionTimer = null
      }
    },
    
    // 初始化模式特定数据
    initializeModeSpecificData(modeId) {
      switch (modeId) {
        case 'voice_sync':
          this.voiceSyncData = {
            isPlaying: false,
            currentPhrase: 0,
            voiceSpeed: 1.0,
            syncAccuracy: 0,
            phrases: this.generateVoicePhrases()
          }
          break
        case 'eye_optimization':
          this.eyeOptimizationData = {
            fixationCount: 0,
            saccadeCount: 0,
            regressionRate: 0,
            fixationDuration: 0,
            eyeMovementPattern: 'normal'
          }
          break
        case 'comprehension_fluency':
          this.comprehensionFluencyData = {
            comprehensionScore: 0,
            readingSpeed: 0,
            balanceIndex: 0,
            questions: this.generateComprehensionQuestions(),
            currentQuestion: 0,
            correctAnswers: 0
          }
          break
        case 'contextual_reading':
          this.contextualReadingData = {
            currentContext: 'normal',
            adaptationScore: 0,
            contextTypes: ['normal', 'noisy', 'dim', 'bright', 'moving'],
            contextIndex: 0,
            performanceByContext: {}
          }
          break
      }
    },
    
    // 启动模式特定定时器
    startModeSpecificTimers(modeId) {
      switch (modeId) {
        case 'voice_sync':
          this.startVoiceSyncTimer()
          break
        case 'eye_optimization':
          this.startEyeTrackingTimer()
          break
        case 'comprehension_fluency':
          this.startComprehensionTimer()
          break
        case 'contextual_reading':
          this.startContextualTimer()
          break
      }
    },
    
    // 语音同步定时器
    startVoiceSyncTimer() {
      this.voiceTimer = setInterval(() => {
        if (this.voiceSyncData.isPlaying) {
          this.updateVoiceSync()
        }
      }, 1000)
    },
    
    // 眼动追踪定时器
    startEyeTrackingTimer() {
      this.eyeTrackingTimer = setInterval(() => {
        this.trackEyeMovement()
      }, 500)
    },
    
    // 理解流畅定时器
    startComprehensionTimer() {
      this.comprehensionTimer = setInterval(() => {
        this.updateComprehensionBalance()
      }, 3000)
    },
    
    // 情境阅读定时器
    startContextualTimer() {
      setInterval(() => {
        this.switchReadingContext()
      }, 30000) // 每30秒切换一次情境
    },
    
    // 生成语音短语
    generateVoicePhrases() {
      return [
        '保持稳定的阅读节奏',
        '跟随语音的引导',
        '感受文字的韵律',
        '让眼睛与声音同步',
        '建立自然的阅读流畅感'
      ]
    },
    
    // 生成理解问题
    generateComprehensionQuestions() {
      return [
        { question: '文章的主要观点是什么？', options: ['A', 'B', 'C', 'D'], answer: 0 },
        { question: '作者的态度如何？', options: ['积极', '消极', '中性', '批判'], answer: 0 },
        { question: '文中提到的关键信息是？', options: ['信息1', '信息2', '信息3', '信息4'], answer: 1 }
      ]
    },
    
    // 更新语音同步
    updateVoiceSync() {
      this.voiceSyncData.currentPhrase = (this.voiceSyncData.currentPhrase + 1) % this.voiceSyncData.phrases.length
      // 计算同步准确度
      this.voiceSyncData.syncAccuracy = Math.min(100, this.voiceSyncData.syncAccuracy + Math.random() * 5)
    },
    
    // 追踪眼动
    trackEyeMovement() {
      this.eyeOptimizationData.fixationCount++
      this.eyeOptimizationData.saccadeCount += Math.floor(Math.random() * 3)
      this.eyeOptimizationData.fixationDuration = 200 + Math.random() * 300
    },
    
    // 更新理解平衡
    updateComprehensionBalance() {
      const speedScore = Math.min(100, (this.currentSpeed / this.settings.targetSpeed) * 100)
      const comprehensionScore = this.comprehensionFluencyData.comprehensionScore
      this.comprehensionFluencyData.balanceIndex = (speedScore + comprehensionScore) / 2
    },
    
    // 切换阅读情境
    switchReadingContext() {
      this.contextualReadingData.contextIndex = (this.contextualReadingData.contextIndex + 1) % this.contextualReadingData.contextTypes.length
      this.contextualReadingData.currentContext = this.contextualReadingData.contextTypes[this.contextualReadingData.contextIndex]
    },
    
    // 切换语音同步
    toggleVoiceSync() {
      this.voiceSyncData.isPlaying = !this.voiceSyncData.isPlaying
      if (this.voiceSyncData.isPlaying) {
        // 播放语音提示音
        this.playVoicePrompt()
      }
    },
    
    // 播放语音提示
    playVoicePrompt() {
      // 模拟语音播放
      console.log('播放语音:', this.voiceSyncData.phrases[this.voiceSyncData.currentPhrase])
    },
    
    // 获取情境名称
    getContextName(context) {
      const contextNames = {
        normal: '正常',
        noisy: '嘈杂',
        dim: '昏暗',
        bright: '明亮',
        moving: '移动'
      }
      return contextNames[context] || context
    },
    
    // 更新阅读速度
    updateReadingSpeed() {
      if (this.trainingTime > 0) {
        const wordsRead = this.calculateWordsRead()
        const minutesElapsed = this.trainingTime / 60
        this.currentSpeed = Math.round(wordsRead / minutesElapsed)
      }
    },
    
    // 计算已读字数
    calculateWordsRead() {
      let wordsRead = 0
      for (let i = 0; i < this.currentParagraphIndex; i++) {
        wordsRead += this.currentText.paragraphs[i].sentences.join('').length
      }
      if (this.currentParagraphIndex < this.currentText.paragraphs.length) {
        for (let i = 0; i <= this.currentSentenceIndex; i++) {
          if (this.currentText.paragraphs[this.currentParagraphIndex].sentences[i]) {
            wordsRead += this.currentText.paragraphs[this.currentParagraphIndex].sentences[i].length
          }
        }
      }
      return wordsRead
    },
    
    // 更新流畅度评分
    updateFluencyScore() {
      // 基于速度、回视次数、停顿时间计算流畅度
      const speedFactor = Math.min(this.currentSpeed / this.settings.targetSpeed, 1)
      const regressionFactor = Math.max(1 - (this.regressionCount / 10), 0)
      const pauseFactor = Math.max(1 - (this.pauseTime / 30), 0)
      
      const rawScore = (speedFactor + regressionFactor + pauseFactor) / 3 * 5
      this.fluencyScore = Math.round(rawScore)
      
      // 更新流畅度等级
      if (this.fluencyScore >= 4) {
        this.fluencyLevel = 'high'
        this.fluencyLevelText = '优秀'
      } else if (this.fluencyScore >= 3) {
        this.fluencyLevel = 'medium'
        this.fluencyLevelText = '良好'
      } else {
        this.fluencyLevel = 'low'
        this.fluencyLevelText = '较低'
      }
    },
    
    // 自动推进阅读
    autoAdvanceReading() {
      if (this.settings.showGuide && !this.isPaused) {
        const currentParagraph = this.currentText.paragraphs[this.currentParagraphIndex]
        if (currentParagraph && this.currentSentenceIndex < currentParagraph.sentences.length - 1) {
          this.currentSentenceIndex++
          
          // 高亮当前句子
          if (this.settings.highlightSentence) {
            this.highlightSentenceIndex = this.currentSentenceIndex
            setTimeout(() => {
              this.highlightSentenceIndex = -1
            }, 1000)
          }
        } else if (this.currentParagraphIndex < this.currentText.paragraphs.length - 1) {
          this.currentParagraphIndex++
          this.currentSentenceIndex = 0
        }
      }
    },
    
    // 加载训练文本
    loadTrainingText() {
      // 根据模式和设置加载相应文本
      const textLibrary = {
        basic: {
          narrative: {
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
          }
        },
        voice_sync: {
          narrative: {
            title: '语音节奏训练',
            paragraphs: [
              {
                sentences: [
                  '跟随语音的节奏，保持稳定的阅读速度。',
                  '让眼睛与声音同步移动，建立良好的阅读习惯。',
                  '感受文字的韵律美，享受流畅阅读的乐趣。'
                ]
              },
              {
                sentences: [
                  '语音引导帮助我们建立正确的阅读节拍。',
                  '通过反复练习，形成自然的阅读流畅感。',
                  '这种训练方法能够显著提高阅读效率。'
                ]
              }
            ]
          }
        },
        eye_optimization: {
          narrative: {
            title: '眼动优化训练',
            paragraphs: [
              {
                sentences: [
                  '优化眼球运动模式是提高阅读效率的关键。',
                  '减少无效的眼动，让视线更加精准地捕捉信息。',
                  '通过科学的训练方法，改善眼动习惯。'
                ]
              },
              {
                sentences: [
                  '注视时间的控制直接影响阅读速度。',
                  '合理的眼跳距离能够提高信息获取效率。',
                  '减少回视行为，保持阅读的连续性。'
                ]
              }
            ]
          }
        },
        comprehension_fluency: {
          narrative: {
            title: '理解与流畅平衡',
            paragraphs: [
              {
                sentences: [
                  '阅读不仅要追求速度，更要保证理解质量。',
                  '在快速阅读的同时，深入理解文本内容。',
                  '平衡速度与理解是高效阅读的核心要求。'
                ]
              },
              {
                sentences: [
                  '通过训练可以同时提升阅读速度和理解能力。',
                  '理解质量的监控帮助调整阅读策略。',
                  '最终目标是实现快速而准确的阅读。'
                ]
              }
            ]
          }
        },
        contextual_reading: {
          narrative: {
            title: '情境适应训练',
            paragraphs: [
              {
                sentences: [
                  '在不同环境下保持良好的阅读状态。',
                  '适应各种光线条件和背景噪音。',
                  '培养在任何情境下都能专注阅读的能力。'
                ]
              },
              {
                sentences: [
                  '环境变化不应影响阅读的流畅性。',
                  '通过多样化训练提高适应能力。',
                  '最终实现在任何条件下的高效阅读。'
                ]
              }
            ]
          }
        }
      }
      
      const modeTexts = textLibrary[this.selectedMode] || textLibrary.basic
      const selectedText = modeTexts[this.settings.textType] || modeTexts.narrative
      
      this.currentText = {
        title: selectedText.title,
        paragraphs: selectedText.paragraphs
      }
              sentences: [
                '科学技术是第一生产力。',
                '它推动着人类社会的进步和发展。',
                '从工业革命到信息时代，科技改变了我们的生活方式。'
              ]
            },
            {
              sentences: [
                '人工智能是当今科技发展的热点。',
                '它在医疗、教育、交通等领域发挥着重要作用。',
                '机器学习和深度学习技术不断突破。'
              ]
            }
          ]
        }
      }
      
      this.currentText = sampleTexts[this.settings.textType] || sampleTexts.narrative
    },
    
    // 重置训练状态
    resetTrainingState() {
      this.currentParagraphIndex = 0
      this.currentSentenceIndex = 0
      this.highlightSentenceIndex = -1
      this.trainingTime = 0
      this.currentSpeed = 0
      this.fluencyScore = 0
      this.regressionCount = 0
      this.pauseTime = 0
    },
    
    // 计算完成数据
    calculateCompletionData() {
      this.completionData = {
        fluencyScore: this.fluencyScore,
        duration: this.trainingTime,
        averageSpeed: this.currentSpeed,
        wordsRead: this.calculateWordsRead(),
        regressionCount: this.regressionCount,
        achievement: this.getAchievement()
      }
    },
    
    // 获取成就
    getAchievement() {
      if (this.fluencyScore >= 4 && this.regressionCount <= 2) {
        return {
          title: '流畅阅读大师',
          description: '达到了极高的阅读流畅度！'
        }
      } else if (this.currentSpeed >= this.settings.targetSpeed) {
        return {
          title: '速度达人',
          description: '成功达到目标阅读速度！'
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
      localStorage.setItem('fluencySettings', JSON.stringify(this.settings))
    },
    
    // 加载设置
    loadSettings() {
      const saved = localStorage.getItem('fluencySettings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    },
    
    // 保存统计数据
    saveStatistics() {
      localStorage.setItem('fluencyStats', JSON.stringify(this.statistics))
    },
    
    // 加载统计数据
    loadStatistics() {
      const saved = localStorage.getItem('fluencyStats')
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
    this.clearTimers()
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
.fluency-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* 训练模式选择 */
.training-modes {
  margin-bottom: 30px;
}

.training-modes h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.mode-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
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
  font-size: 1.3rem;
  margin-bottom: 10px;
}

.mode-description {
  opacity: 0.9;
  margin-bottom: 15px;
  line-height: 1.5;
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
  opacity: 0.8;
}

.detail-value {
  font-weight: bold;
}

.mode-progress {
  margin-bottom: 15px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  opacity: 0.8;
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
  margin-bottom: 30px;
}

.training-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
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

/* 阅读指导 */
.reading-guide {
  margin-bottom: 25px;
}

.guide-indicator {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
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
  opacity: 0.8;
  margin-left: 5px;
}

.speed-bar {
  width: 120px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
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
  font-weight: bold;
}

.fluency-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.level-text {
  font-size: 1.1rem;
  font-weight: bold;
}

.fluency-level.low .level-text {
  color: #ef4444;
}

.fluency-level.medium .level-text {
  color: #f59e0b;
}

.fluency-level.high .level-text {
  color: #22c55e;
}

.level-bars {
  display: flex;
  gap: 3px;
}

.level-bar {
  width: 8px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.level-bar.active {
  background: #4ade80;
}

/* 阅读内容 */
.reading-content {
  margin-bottom: 25px;
}

.text-container {
  background: rgba(255, 255, 255, 0.95);
  color: #1f2937;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.reading-text {
  font-size: 18px;
  line-height: 1.8;
  font-family: 'Microsoft YaHei', sans-serif;
}

.paragraph {
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.paragraph.current {
  background: rgba(74, 222, 128, 0.1);
  border-left: 4px solid #4ade80;
}

.paragraph.completed {
  opacity: 0.6;
}

.sentence {
  margin-right: 5px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.sentence.current {
  background: rgba(74, 222, 128, 0.2);
  font-weight: bold;
}

.sentence.completed {
  opacity: 0.7;
}

.sentence.highlight {
  background: rgba(251, 191, 36, 0.3);
  animation: highlight-pulse 1s ease-in-out;
}

@keyframes highlight-pulse {
  0%, 100% { background: rgba(251, 191, 36, 0.3); }
  50% { background: rgba(251, 191, 36, 0.6); }
}

.reading-progress {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-top: 5px;
}

/* 训练统计 */
.training-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #4ade80;
}

/* 训练设置 */
.training-settings {
  margin-bottom: 30px;
}

.training-settings h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.setting-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.setting-card h4 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #4ade80;
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.number-input,
.select-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.number-input::placeholder,
.select-input option {
  color: #9ca3af;
}

.range-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-input {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  cursor: pointer;
}

.range-value {
  font-weight: bold;
  color: #4ade80;
  min-width: 50px;
}

/* 训练统计 */
.training-statistics {
  margin-bottom: 30px;
}

.training-statistics h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.stats-card h4 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #4ade80;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stats-overview .stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stats-overview .stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #4ade80;
}

.stats-overview .stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 性能图表 */
.performance-chart {
  height: 150px;
  display: flex;
  align-items: end;
  justify-content: center;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 100%;
}

.chart-bar {
  width: 20px;
  background: linear-gradient(to top, #4ade80, #22c55e);
  border-radius: 4px 4px 0 0;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 10px;
}

.chart-bar:hover {
  transform: scaleY(1.1);
  filter: brightness(1.2);
}

.bar-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  opacity: 0.8;
}

/* 流畅度分析 */
.fluency-analysis {
  display: flex;
  flex-direction: column;
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
}

.analysis-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.analysis-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  transition: width 0.3s ease;
}

.analysis-value {
  min-width: 50px;
  font-weight: bold;
  color: #4ade80;
  text-align: right;
}

/* 能力评估 */
.ability-ratings {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rating-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-label {
  font-size: 0.9rem;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.2rem;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.star.filled {
  opacity: 1;
  filter: drop-shadow(0 0 3px #fbbf24);
}

/* 完成弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-modal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  color: white;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header h3 {
  font-size: 1.5rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.completion-stats {
  display: flex;
  gap: 25px;
  margin-bottom: 25px;
  align-items: center;
}

.stat-circle {
  flex-shrink: 0;
}

.circle-progress {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(
    #4ade80 0deg,
    #4ade80 calc(var(--progress) * 3.6deg),
    rgba(255, 255, 255, 0.2) calc(var(--progress) * 3.6deg),
    rgba(255, 255, 255, 0.2) 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.circle-progress::before {
  content: '';
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: absolute;
}

.circle-text {
  position: relative;
  z-index: 1;
  text-align: center;
}

.circle-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #4ade80;
}

.circle-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.completion-details {
  flex: 1;
}

.completion-details .detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.completion-details .detail-label {
  opacity: 0.8;
}

.completion-details .detail-value {
  font-weight: bold;
  color: #4ade80;
}

.achievement {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 25px;
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-text h4 {
  margin: 0 0 5px 0;
  color: #fbbf24;
}

.achievement-text p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

/* 语音同步训练样式 */
.voice-sync-area {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 20px;
  margin: 15px 0;
  color: white;
}

.voice-phrase {
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.sync-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
}

.sync-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sync-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.sync-btn.active {
  background: #4ade80;
  box-shadow: 0 4px 15px rgba(74, 222, 128, 0.4);
}

/* 眼动优化训练样式 */
.eye-optimization-area {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 15px;
  padding: 20px;
  margin: 15px 0;
  color: white;
}

.eye-target {
  width: 20px;
  height: 20px;
  background: #fbbf24;
  border-radius: 50%;
  position: absolute;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
  animation: eyeMove 3s ease-in-out infinite;
}

@keyframes eyeMove {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(100px); }
  50% { transform: translateX(200px); }
  75% { transform: translateX(100px); }
}

.eye-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.eye-stat {
  text-align: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.eye-stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fbbf24;
}

.eye-stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-top: 5px;
}

/* 理解流畅训练样式 */
.comprehension-area {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 15px;
  padding: 20px;
  margin: 15px 0;
  color: white;
}

.comprehension-question {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
}

.question-text {
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;
}

.option-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.option-btn.correct {
  background: #4ade80;
}

.option-btn.incorrect {
  background: #ef4444;
}

.balance-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
}

.balance-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.balance-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #fbbf24, #4ade80);
  transition: width 0.3s ease;
}

/* 情境阅读训练样式 */
.contextual-area {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-radius: 15px;
  padding: 20px;
  margin: 15px 0;
  color: white;
  position: relative;
  overflow: hidden;
}

.context-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--context-bg, rgba(0, 0, 0, 0));
  transition: all 0.5s ease;
}

.context-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  position: relative;
  z-index: 1;
}

.context-name {
  font-size: 1.1rem;
  font-weight: bold;
}

.context-controls {
  display: flex;
  gap: 10px;
}

.context-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.context-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.context-btn.active {
  background: #4ade80;
}

.adaptation-progress {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  position: relative;
  z-index: 1;
}

.adaptation-level {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.level-indicator {
  display: flex;
  gap: 5px;
}

.level-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.level-dot.active {
  background: #4ade80;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.6);
}
}

.secondary-btn,
.primary-btn {
  padding: 10px 20px;
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
  
  .stats-overview {
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
  .training-stats {
    grid-template-columns: 1fr;
  }
  
  .reading-text {
    font-size: 16px;
  }
  
  .completion-modal {
    padding: 20px;
  }
}
</style>