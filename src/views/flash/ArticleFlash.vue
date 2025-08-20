<template>
  <div class="article-flash-container">

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
              <span class="detail-label">内容长度:</span>
              <span class="detail-value">{{ mode.contentLength }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">难度等级:</span>
              <span class="detail-value">{{ mode.difficulty }}</span>
            </div>
          </div>

          <div class="mode-stats">
            <div class="stat-item">
              <span class="stat-label">最高理解率</span>
              <span class="stat-value">{{ mode.bestComprehension }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均理解率</span>
              <span class="stat-value">{{ mode.averageComprehension }}%</span>
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
              <span class="info-label">理解正确:</span>
              <span class="info-value correct">{{ correctCount }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">理解错误:</span>
              <span class="info-value error">{{ errorCount }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">理解率:</span>
              <span class="info-value">{{ comprehensionRate }}%</span>
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
            <div class="flash-content" v-if="isFlashing">
              <div class="article-text" :style="{ fontSize: settings.fontSize + 'px' }">
                {{ currentFlashContent }}
              </div>
            </div>
            <div class="ready-indicator" v-else-if="!isCompleted && !isPaused">
              <span class="ready-text">准备阅读...</span>
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

        <!-- 理解测试区域 -->
        <div class="comprehension-area" v-if="showComprehensionTest && !isCompleted">
          <div class="comprehension-prompt">
            <h4>理解测试</h4>
            <p class="comprehension-hint">{{ comprehensionQuestion.question }}</p>
          </div>
          
          <!-- 选择题模式 -->
          <div class="comprehension-options" v-if="comprehensionQuestion.type === 'choice'">
            <button 
              v-for="(option, index) in comprehensionQuestion.options" 
              :key="index"
              class="comprehension-option"
              :class="{ 
                selected: selectedAnswer === option,
                correct: showResult && option === comprehensionQuestion.correctAnswer,
                wrong: showResult && selectedAnswer === option && option !== comprehensionQuestion.correctAnswer
              }"
              @click="selectAnswer(option)"
              :disabled="showResult"
            >
              {{ option }}
            </button>
          </div>
          
          <!-- 判断题模式 -->
          <div class="judgment-options" v-else-if="comprehensionQuestion.type === 'judgment'">
            <button 
              class="judgment-option"
              :class="{ 
                selected: selectedAnswer === true,
                correct: showResult && comprehensionQuestion.correctAnswer === true,
                wrong: showResult && selectedAnswer === true && comprehensionQuestion.correctAnswer !== true
              }"
              @click="selectAnswer(true)"
              :disabled="showResult"
            >
              ✓ 正确
            </button>
            <button 
              class="judgment-option"
              :class="{ 
                selected: selectedAnswer === false,
                correct: showResult && comprehensionQuestion.correctAnswer === false,
                wrong: showResult && selectedAnswer === false && comprehensionQuestion.correctAnswer !== false
              }"
              @click="selectAnswer(false)"
              :disabled="showResult"
            >
              ✗ 错误
            </button>
          </div>
          
          <!-- 填空题模式 -->
          <div class="fill-blank-input" v-else>
            <input 
              type="text" 
              class="input-field"
              v-model="userInput"
              :placeholder="'请填入关键词...'"
              @keyup.enter="submitAnswer"
              :disabled="showResult"
              ref="answerInput"
            >
            <button class="submit-btn" @click="submitAnswer" :disabled="!userInput.trim() || showResult">
              提交答案
            </button>
          </div>

          <!-- 结果显示 -->
          <div class="answer-result" v-if="showResult">
            <div class="result-message" :class="{ correct: isAnswerCorrect, wrong: !isAnswerCorrect }">
              <span class="result-icon">{{ isAnswerCorrect ? '✅' : '❌' }}</span>
              <span class="result-text">
                {{ isAnswerCorrect ? '理解正确！' : '理解有误' }}
              </span>
            </div>
            <div class="correct-answer" v-if="!isAnswerCorrect">
              正确答案: <strong>{{ comprehensionQuestion.correctAnswer }}</strong>
            </div>
            <div class="explanation" v-if="comprehensionQuestion.explanation">
              <strong>解析:</strong> {{ comprehensionQuestion.explanation }}
            </div>
            <button class="next-btn" @click="nextRound">
              {{ currentRound >= totalRounds ? '查看结果' : '下一篇' }}
            </button>
          </div>
        </div>

        <!-- 完成状态 -->
        <div class="completion-status" v-if="isCompleted">
          <div class="completion-message">
            <span class="completion-icon">🎉</span>
            <h4>训练完成！</h4>
            <p>恭喜你完成了 {{ totalRounds }} 轮文章闪视训练</p>
            <div class="encouragement-message" v-if="settings.showEncouragement">
              <span class="encouragement-text">{{ getEncouragementMessage() }}</span>
            </div>
          </div>
          
          <div class="completion-stats">
            <div class="stat-item">
              <span class="stat-label">总轮次</span>
              <span class="stat-value">{{ totalRounds }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">理解正确</span>
              <span class="stat-value correct">{{ correctCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">理解错误</span>
              <span class="stat-value error">{{ errorCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">理解率</span>
              <span class="stat-value">{{ comprehensionRate }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均阅读时间</span>
              <span class="stat-value">{{ averageReadingTime }}ms</span>
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
                min="500"
                max="3000"
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
                min="2"
                max="8"
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
            <label>文章类型</label>
            <select class="select-input" v-model="settings.articleType">
              <option value="story">故事类</option>
              <option value="news">新闻类</option>
              <option value="science">科普类</option>
              <option value="mixed">混合类型</option>
            </select>
          </div>
        </div>

        <div class="setting-card">
          <h4>显示设置</h4>
          <div class="setting-item">
            <label>字体大小</label>
            <div class="range-container">
              <input 
                type="range" 
                class="range-input"
                v-model="settings.fontSize"
                min="16"
                max="32"
                step="2"
              >
              <span class="range-value">{{ settings.fontSize }}px</span>
            </div>
          </div>
          <div class="setting-item">
            <label>行间距</label>
            <div class="range-container">
              <input 
                type="range" 
                class="range-input"
                v-model="settings.lineHeight"
                min="1.2"
                max="2.0"
                step="0.1"
              >
              <span class="range-value">{{ settings.lineHeight }}</span>
            </div>
          </div>
          <div class="setting-item">
            <label>背景颜色</label>
            <select class="select-input" v-model="settings.backgroundColor">
              <option value="white">白色</option>
              <option value="cream">米色</option>
              <option value="light-gray">浅灰</option>
              <option value="light-blue">浅蓝</option>
            </select>
          </div>
          <div class="setting-item">
            <label>文本颜色</label>
            <select class="select-input" v-model="settings.textColor">
              <option value="black">黑色</option>
              <option value="dark-gray">深灰</option>
              <option value="blue">蓝色</option>
              <option value="green">绿色</option>
            </select>
          </div>
          <div class="setting-item">
            <label>主题</label>
            <select class="select-input" v-model="settings.theme">
              <option value="default">默认</option>
              <option value="dark">深色</option>
              <option value="nature">自然</option>
              <option value="ocean">海洋</option>
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
                v-model="settings.highlightKeywords"
              >
              关键词高亮
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
                v-model="settings.showReadingGuide"
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
              <option value="expert">专家</option>
            </select>
          </div>
          <div class="setting-item">
            <label>内容过滤</label>
            <select class="select-input" v-model="settings.contentFilter">
              <option value="all">全部内容</option>
              <option value="beginner">初学者</option>
              <option value="intermediate">中级</option>
              <option value="advanced">高级</option>
            </select>
          </div>
          <div class="setting-item">
            <label>动画效果</label>
            <select class="select-input" v-model="settings.animationEffect">
              <option value="none">无动画</option>
              <option value="fade">淡入淡出</option>
              <option value="slide">滑动</option>
              <option value="zoom">缩放</option>
            </select>
          </div>
          <div class="setting-item">
            <label>关键词高亮颜色</label>
            <select class="select-input" v-model="settings.highlightColor">
              <option value="yellow">黄色</option>
              <option value="blue">蓝色</option>
              <option value="green">绿色</option>
              <option value="red">红色</option>
            </select>
          </div>
          <div class="setting-item">
            <label>理解模式</label>
            <select class="select-input" v-model="settings.comprehensionMode">
              <option value="multiple">选择题</option>
              <option value="fill">填空题</option>
              <option value="judge">判断题</option>
              <option value="mixed">混合模式</option>
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
              <span class="stat-icon">🎯</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.bestComprehension }}%</span>
                <span class="stat-label">最高理解率</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📊</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.averageComprehension }}%</span>
                <span class="stat-label">平均理解率</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⚡</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.averageReadingSpeed }}</span>
                <span class="stat-label">平均阅读速度</span>
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
                  <span class="detail-value">{{ mode.bestComprehension }}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">平均:</span>
                  <span class="detail-value">{{ mode.averageComprehension }}%</span>
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
          <h4>理解率趋势</h4>
          <div class="comprehension-chart">
            <div class="chart-container">
              <div class="chart-line">
                <div 
                  v-for="(data, index) in statistics.comprehensionTrend" 
                  :key="index"
                  class="chart-point"
                  :style="{ 
                    left: (index / (statistics.comprehensionTrend.length - 1)) * 100 + '%',
                    bottom: data.comprehension + '%'
                  }"
                  :title="`第${index + 1}次: ${data.comprehension}%`"
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
          <h4>阅读能力分析</h4>
          <div class="ability-analysis">
            <div class="ability-item">
              <div class="ability-header">
                <span class="ability-name">快速理解</span>
                <span class="ability-score">{{ abilityScores.quickComprehension }}/100</span>
              </div>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: abilityScores.quickComprehension + '%' }"></div>
              </div>
            </div>
            <div class="ability-item">
              <div class="ability-header">
                <span class="ability-name">信息提取</span>
                <span class="ability-score">{{ abilityScores.informationExtraction }}/100</span>
              </div>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: abilityScores.informationExtraction + '%' }"></div>
              </div>
            </div>
            <div class="ability-item">
              <div class="ability-header">
                <span class="ability-name">逻辑推理</span>
                <span class="ability-score">{{ abilityScores.logicalReasoning }}/100</span>
              </div>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: abilityScores.logicalReasoning + '%' }"></div>
              </div>
            </div>
            <div class="ability-item">
              <div class="ability-header">
                <span class="ability-name">记忆保持</span>
                <span class="ability-score">{{ abilityScores.memoryRetention }}/100</span>
              </div>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: abilityScores.memoryRetention + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArticleFlash',
  emits: ['go-back'],
  data() {
    return {
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
      currentFlashContent: '',
      showComprehensionTest: false,
      showResult: false,
      isAnswerCorrect: false,
      countdown: 3,
      
      // 理解测试相关
      comprehensionQuestion: {},
      selectedAnswer: null,
      userInput: '',
      readingTimes: [],
      roundStartTime: null,
      
      // 训练模式
      trainingModes: [
        {
          id: 'short_sentences',
          name: '短句理解',
          icon: '📝',
          level: 'beginner',
          levelText: '初级',
          description: '短句快速闪视，训练基础理解能力',
          flashSpeed: 1500,
          contentLength: '10-20字',
          difficulty: '简单',
          bestComprehension: 92,
          averageComprehension: 85
        },
        {
          id: 'medium_paragraphs',
          name: '段落理解',
          icon: '📄',
          level: 'intermediate',
          levelText: '中级',
          description: '中等段落闪视，提升理解深度',
          flashSpeed: 2000,
          contentLength: '50-100字',
          difficulty: '中等',
          bestComprehension: 78,
          averageComprehension: 71
        },
        {
          id: 'long_articles',
          name: '长文理解',
          icon: '📰',
          level: 'advanced',
          levelText: '高级',
          description: '长文章闪视，挑战理解极限',
          flashSpeed: 2500,
          contentLength: '150-300字',
          difficulty: '困难',
          bestComprehension: 65,
          averageComprehension: 58
        },
        {
          id: 'story_comprehension',
          name: '故事理解',
          icon: '📚',
          level: 'intermediate',
          levelText: '中级',
          description: '故事情节闪视，训练情境理解',
          flashSpeed: 2200,
          contentLength: '80-150字',
          difficulty: '中等',
          bestComprehension: 73,
          averageComprehension: 66
        },
        {
          id: 'news_analysis',
          name: '新闻分析',
          icon: '📺',
          level: 'advanced',
          levelText: '高级',
          description: '新闻内容闪视，训练信息提取',
          flashSpeed: 1800,
          contentLength: '100-200字',
          difficulty: '困难',
          bestComprehension: 69,
          averageComprehension: 62
        },
        {
          id: 'science_reading',
          name: '科普阅读',
          icon: '🔬',
          level: 'advanced',
          levelText: '高级',
          description: '科普文章闪视，训练逻辑理解',
          flashSpeed: 2800,
          contentLength: '120-250字',
          difficulty: '困难',
          bestComprehension: 61,
          averageComprehension: 54
        }
      ],
      
      // 当前训练数据
      currentModeData: {},
      
      // 文章内容库
      articleLibrary: {
        short_sentences: [
          {
            content: '春天来了，花儿开了，鸟儿在枝头歌唱。',
            difficulty: 'easy',
            category: '自然',
            keywords: ['春天', '花儿', '鸟儿'],
            questions: [
              {
                type: 'choice',
                question: '这句话描述的是什么季节？',
                options: ['春天', '夏天', '秋天', '冬天'],
                correctAnswer: '春天',
                explanation: '文中明确提到"春天来了"'
              }
            ]
          },
          {
            content: '小明每天早上六点起床，然后去公园跑步。',
            difficulty: 'easy',
            category: '生活',
            keywords: ['早上', '起床', '跑步'],
            questions: [
              {
                type: 'judgment',
                question: '小明是在晚上跑步的。',
                correctAnswer: false,
                explanation: '文中说的是"早上六点起床，然后去公园跑步"'
              }
            ]
          },
          {
            content: '图书馆里安静极了，只能听到翻书的声音。',
            difficulty: 'easy',
            category: '学习',
            keywords: ['图书馆', '安静', '翻书'],
            questions: [
              {
                type: 'choice',
                question: '图书馆里能听到什么声音？',
                options: ['说话声', '翻书声', '音乐声', '脚步声'],
                correctAnswer: '翻书声',
                explanation: '文中提到"只能听到翻书的声音"'
              }
            ]
          },
          {
            content: '妈妈在厨房里忙碌着，准备丰盛的晚餐。',
            difficulty: 'easy',
            category: '家庭',
            keywords: ['妈妈', '厨房', '晚餐'],
            questions: [
              {
                type: 'fill',
                question: '妈妈在___里准备晚餐。',
                correctAnswer: '厨房',
                explanation: '文中明确提到"妈妈在厨房里忙碌着"'
              }
            ]
          },
          {
            content: '雨后的空气格外清新，彩虹挂在天边。',
            difficulty: 'medium',
            category: '自然',
            keywords: ['雨后', '空气', '彩虹'],
            questions: [
              {
                type: 'judgment',
                question: '彩虹出现在雨前。',
                correctAnswer: false,
                explanation: '文中说的是"雨后的空气格外清新，彩虹挂在天边"'
              }
            ]
          }
        ],
        medium_paragraphs: [
          {
            content: '图书馆是一个安静的地方，人们在这里阅读、学习和思考。书架上摆满了各种各样的书籍，从文学作品到科学研究，应有尽有。许多学生喜欢在这里度过他们的课余时间，因为这里的环境有助于集中注意力。',
            difficulty: 'medium',
            category: '学习',
            keywords: ['图书馆', '阅读', '学习', '书籍'],
            questions: [
              {
                type: 'choice',
                question: '根据文章，学生喜欢在图书馆学习的主要原因是什么？',
                options: ['书籍种类丰富', '环境安静有助集中注意力', '离家近', '免费开放'],
                correctAnswer: '环境安静有助集中注意力',
                explanation: '文中明确提到"这里的环境有助于集中注意力"'
              }
            ]
          },
          {
            content: '健康的生活方式对每个人都很重要。规律的作息时间、均衡的饮食、适量的运动和良好的心态是保持健康的四大要素。现代人工作压力大，经常熬夜加班，饮食不规律，缺乏运动，这些都会对身体健康造成负面影响。我们应该重视健康，从改变不良习惯开始，逐步建立健康的生活模式。',
            difficulty: 'medium',
            category: '健康',
            keywords: ['健康', '生活方式', '作息', '饮食', '运动'],
            questions: [
              {
                type: 'fill',
                question: '保持健康的四大要素包括规律的作息时间、均衡的饮食、适量的运动和___。',
                correctAnswer: '良好的心态',
                explanation: '文中提到"规律的作息时间、均衡的饮食、适量的运动和良好的心态是保持健康的四大要素"'
              },
              {
                type: 'judgment',
                question: '现代人的工作压力对健康没有影响。',
                correctAnswer: false,
                explanation: '文中明确提到"现代人工作压力大...这些都会对身体健康造成负面影响"'
              }
            ]
          }
        ],
        long_articles: [
          {
            content: '人工智能技术的发展正在改变我们的生活方式。从智能手机的语音助手到自动驾驶汽车，AI技术已经渗透到我们日常生活的各个方面。在医疗领域，AI可以帮助医生更准确地诊断疾病；在教育领域，个性化学习系统可以根据学生的学习进度调整教学内容；在交通领域，智能交通系统可以优化路线，减少拥堵。然而，AI技术的发展也带来了一些挑战，比如就业问题和隐私保护问题。我们需要在享受AI带来便利的同时，也要思考如何应对这些挑战。',
            difficulty: 'hard',
            category: '科技',
            keywords: ['人工智能', 'AI技术', '医疗', '教育', '交通'],
            questions: [
              {
                type: 'choice',
                question: '文章提到AI技术在哪些领域有应用？',
                options: ['医疗、教育、交通', '医疗、金融、娱乐', '教育、农业、工业', '交通、通信、能源'],
                correctAnswer: '医疗、教育、交通',
                explanation: '文中明确提到了医疗、教育、交通三个领域的AI应用'
              }
            ]
          },
          {
            content: '阅读是人类获取知识和信息的重要途径之一。在数字化时代，我们的阅读方式发生了巨大变化。传统的纸质书籍阅读逐渐被电子阅读所补充，甚至在某些情况下被替代。电子阅读具有便携性强、存储量大、搜索功能强大等优势，但也存在对眼睛伤害较大、缺乏纸质书籍的触感体验等缺点。无论采用哪种阅读方式，培养良好的阅读习惯都是至关重要的。这包括选择适合的阅读环境、保持专注的阅读状态、定期总结阅读心得，以及根据个人兴趣和需求选择合适的读物。',
            difficulty: 'hard',
            category: '教育',
            keywords: ['阅读', '数字化', '电子阅读', '纸质书籍', '阅读习惯'],
            questions: [
              {
                type: 'judgment',
                question: '电子阅读完全替代了纸质书籍阅读。',
                correctAnswer: false,
                explanation: '文中说"传统的纸质书籍阅读逐渐被电子阅读所补充，甚至在某些情况下被替代"，并非完全替代'
              },
              {
                type: 'choice',
                question: '根据文章，电子阅读的优势不包括哪一项？',
                options: ['便携性强', '存储量大', '搜索功能强大', '触感体验好'],
                correctAnswer: '触感体验好',
                explanation: '文中提到电子阅读"缺乏纸质书籍的触感体验"，所以触感体验好不是电子阅读的优势'
              }
            ]
          }
        ]
      },
      
      // 训练设置
      settings: {
        flashDuration: 2000,
        intervalTime: 3,
        rounds: 10,
        articleType: 'mixed',
        fontSize: 20,
        lineHeight: 1.6,
        backgroundColor: 'white',
        textColor: '#333',
        showProgress: true,
        soundEffects: true,
        highlightKeywords: false,
        autoNext: false,
        // 新增设置
        difficulty: 'medium',
        contentFilter: 'all',
        showHints: true,
        adaptiveDifficulty: false,
        customArticles: [],
        theme: 'default',
        animationEffects: true,
        progressSound: true,
        encouragementMessages: true,
        readingGuide: true,
        keywordHighlightColor: '#ffeb3b',
        comprehensionMode: 'mixed'
      },
      
      // 统计数据
      statistics: {
        totalSessions: 45,
        bestComprehension: 92,
        averageComprehension: 73,
        averageReadingSpeed: '280字/分钟',
        modePerformance: [
          {
            id: 'short_sentences',
            name: '短句理解',
            level: '初级',
            bestComprehension: 92,
            averageComprehension: 85,
            attempts: 15,
            mastery: 88
          },
          {
            id: 'medium_paragraphs',
            name: '段落理解',
            level: '中级',
            bestComprehension: 78,
            averageComprehension: 71,
            attempts: 12,
            mastery: 75
          },
          {
            id: 'long_articles',
            name: '长文理解',
            level: '高级',
            bestComprehension: 65,
            averageComprehension: 58,
            attempts: 8,
            mastery: 62
          }
        ],
        comprehensionTrend: [
          { comprehension: 60 },
          { comprehension: 65 },
          { comprehension: 68 },
          { comprehension: 72 },
          { comprehension: 75 },
          { comprehension: 73 },
          { comprehension: 78 },
          { comprehension: 80 },
          { comprehension: 82 },
          { comprehension: 85 }
        ]
      },
      
      // 定时器
      flashTimer: null,
      countdownTimer: null
    }
  },
  
  computed: {
    comprehensionRate() {
      const total = this.correctCount + this.errorCount
      return total > 0 ? Math.round((this.correctCount / total) * 100) : 0
    },
    
    averageReadingTime() {
      if (this.readingTimes.length === 0) return 0
      const sum = this.readingTimes.reduce((a, b) => a + b, 0)
      return Math.round(sum / this.readingTimes.length)
    },
    
    performanceLevel() {
      const rate = this.comprehensionRate
      if (rate >= 85) return { text: '优秀', class: 'excellent' }
      if (rate >= 75) return { text: '良好', class: 'good' }
      if (rate >= 65) return { text: '一般', class: 'average' }
      return { text: '需要提高', class: 'poor' }
    },
    
    abilityScores() {
      return {
        quickComprehension: Math.min(100, this.comprehensionRate + 10),
        informationExtraction: Math.min(100, this.comprehensionRate + 5),
        logicalReasoning: Math.min(100, this.comprehensionRate),
        memoryRetention: Math.min(100, this.comprehensionRate - 5)
      }
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
      if (this.showComprehensionTest) {
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
      this.generateFlashContent()
      this.isFlashing = true
      this.roundStartTime = Date.now()
      
      // 播放开始音效
      if (this.settings.soundEffects) {
        this.playFlashSound()
      }
      
      this.flashTimer = setTimeout(() => {
        this.isFlashing = false
        this.showComprehensionTest = true
        
        // 记录阅读时间
        const readingTime = Date.now() - this.roundStartTime
        this.readingTimes.push(readingTime)
        
        // 自动聚焦输入框
        if (this.comprehensionQuestion.type === 'fill') {
          this.$nextTick(() => {
            if (this.$refs.answerInput) {
              this.$refs.answerInput.focus()
            }
          })
        }
      }, this.settings.flashDuration)
    },
    
    // 生成闪视内容
    generateFlashContent() {
      const mode = this.currentModeData.id
      const articles = this.getFilteredArticles(mode)
      
      // 随机选择文章
      const randomArticle = articles[Math.floor(Math.random() * articles.length)]
      this.currentFlashContent = randomArticle.content
      
      // 随机选择问题
      const randomQuestion = randomArticle.questions[Math.floor(Math.random() * randomArticle.questions.length)]
      this.comprehensionQuestion = randomQuestion
    },
    
    // 根据设置筛选文章
    getFilteredArticles(mode) {
      let articles = this.articleLibrary[mode] || this.articleLibrary.short_sentences
      
      // 根据难度筛选
      if (this.settings.difficulty !== 'medium') {
        articles = articles.filter(article => article.difficulty === this.settings.difficulty)
      }
      
      // 根据内容类别筛选
      if (this.settings.contentFilter !== 'all') {
        articles = articles.filter(article => article.category === this.settings.contentFilter)
      }
      
      // 如果筛选后没有文章，返回原始列表
      return articles.length > 0 ? articles : this.articleLibrary[mode] || this.articleLibrary.short_sentences
    },
    
    // 获取鼓励消息
    getEncouragementMessage() {
      const messages = [
        '太棒了！你的理解能力在不断提升！',
        '继续保持，你正在变得更强！',
        '出色的表现！你的专注力令人印象深刻！',
        '很好！你的阅读速度和理解力都在进步！',
        '优秀！你已经掌握了快速阅读的技巧！',
        '了不起！你的大脑正在变得更加敏锐！',
        '精彩！你的学习能力让人惊叹！',
        '卓越！你正在成为阅读高手！'
      ]
      return messages[Math.floor(Math.random() * messages.length)]
    },
    
    // 选择答案
    selectAnswer(answer) {
      if (this.showResult) return
      
      this.selectedAnswer = answer
      this.checkAnswer(answer)
    },
    
    // 提交答案
    submitAnswer() {
      if (!this.userInput.trim() || this.showResult) return
      
      this.checkAnswer(this.userInput.trim())
    },
    
    // 检查答案
    checkAnswer(answer) {
      let isCorrect = false
      
      if (this.comprehensionQuestion.type === 'choice') {
        isCorrect = answer === this.comprehensionQuestion.correctAnswer
      } else if (this.comprehensionQuestion.type === 'judgment') {
        isCorrect = answer === this.comprehensionQuestion.correctAnswer
      } else {
        // 填空题，检查关键词
        const correctAnswer = this.comprehensionQuestion.correctAnswer.toLowerCase()
        const userAnswer = answer.toLowerCase()
        isCorrect = correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer)
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
      this.showComprehensionTest = false
      this.selectedAnswer = null
      this.userInput = ''
      
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
    
    // 重置训练状态
    resetTrainingState() {
      this.currentRound = 0
      this.correctCount = 0
      this.errorCount = 0
      this.isCompleted = false
      this.isFlashing = false
      this.showComprehensionTest = false
      this.showResult = false
      this.selectedAnswer = null
      this.userInput = ''
      this.readingTimes = []
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
    
    // 播放音效
    playFlashSound() {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
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
      
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
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
      
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
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
    
    // 保存结果
    saveResult() {
      const result = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        mode: this.currentModeData.id,
        modeName: this.currentModeData.name,
        comprehensionRate: this.comprehensionRate,
        correctCount: this.correctCount,
        errorCount: this.errorCount,
        totalQuestions: this.currentModeData.questions?.length || 0,
        averageReadingTime: this.averageReadingTime,
        readingTimes: [...(this.readingTimes || [])],
        settings: { ...this.settings },
        timestamp: Date.now(),
        date: new Date().toISOString()
      }
      
      const results = JSON.parse(localStorage.getItem('articleFlashResults') || '[]')
      results.push(result)
      
      // 限制历史记录为最近1000条
      if (results.length > 1000) {
        results.splice(0, results.length - 1000)
      }
      
      localStorage.setItem('articleFlashResults', JSON.stringify(results))
      
      this.updateStatistics(result)
    },
    
    // 更新统计数据
    updateStatistics(result) {
      if (result.comprehensionRate > this.statistics.bestComprehension) {
        this.statistics.bestComprehension = result.comprehensionRate
      }
      
      this.statistics.totalSessions++
      this.saveStatistics()
    },
    
    // 获取图表点坐标
    getChartPoints() {
      return this.statistics.comprehensionTrend.map((data, index) => {
        const x = (index / (this.statistics.comprehensionTrend.length - 1)) * 100
        const y = 100 - data.comprehension
        return `${x},${y}`
      }).join(' ')
    },
    
    // 保存设置
    saveSettings() {
      localStorage.setItem('articleFlashSettings', JSON.stringify(this.settings))
    },
    
    // 加载设置
    loadSettings() {
      const saved = localStorage.getItem('articleFlashSettings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    },
    
    // 保存统计数据
    saveStatistics() {
      localStorage.setItem('articleFlashStats', JSON.stringify(this.statistics))
    },
    
    // 加载统计数据
    loadStatistics() {
      const saved = localStorage.getItem('articleFlashStats')
      if (saved) {
        this.statistics = { ...this.statistics, ...JSON.parse(saved) }
      }
    },
    
    // 获取训练历史
    getTrainingHistory(limit = 50) {
      const results = JSON.parse(localStorage.getItem('articleFlashResults') || '[]')
      return results.slice(-limit).reverse()
    },

    // 获取详细统计分析
    getDetailedAnalysis() {
      const results = JSON.parse(localStorage.getItem('articleFlashResults') || '[]')
      if (results.length === 0) return null

      const analysis = {
        totalSessions: results.length,
        averageComprehension: results.reduce((sum, r) => sum + r.comprehensionRate, 0) / results.length,
        bestComprehension: Math.max(...results.map(r => r.comprehensionRate)),
        worstComprehension: Math.min(...results.map(r => r.comprehensionRate)),
        averageReadingTime: results.reduce((sum, r) => sum + r.averageReadingTime, 0) / results.length,
        fastestReadingTime: Math.min(...results.map(r => r.averageReadingTime)),
        slowestReadingTime: Math.max(...results.map(r => r.averageReadingTime)),
        modeBreakdown: {},
        weeklyProgress: this.calculateWeeklyProgress(results),
        improvementTrend: this.calculateImprovementTrend(results)
      }

      // 按模式分析
      results.forEach(result => {
        if (!analysis.modeBreakdown[result.mode]) {
          analysis.modeBreakdown[result.mode] = {
            sessions: 0,
            totalComprehension: 0,
            bestComprehension: 0,
            averageReadingTime: 0
          }
        }
        const mode = analysis.modeBreakdown[result.mode]
        mode.sessions++
        mode.totalComprehension += result.comprehensionRate
        mode.bestComprehension = Math.max(mode.bestComprehension, result.comprehensionRate)
        mode.averageReadingTime += result.averageReadingTime
      })

      // 计算平均值
      Object.keys(analysis.modeBreakdown).forEach(mode => {
        const data = analysis.modeBreakdown[mode]
        data.averageComprehension = data.totalComprehension / data.sessions
        data.averageReadingTime = data.averageReadingTime / data.sessions
      })

      return analysis
    },

    // 计算每周进度
    calculateWeeklyProgress(results) {
      const weeklyData = {}
      
      results.forEach(result => {
        const date = new Date(result.date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekKey = weekStart.toISOString().split('T')[0]
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            sessions: 0,
            totalComprehension: 0,
            totalReadingTime: 0
          }
        }
        
        weeklyData[weekKey].sessions++
        weeklyData[weekKey].totalComprehension += result.comprehensionRate
        weeklyData[weekKey].totalReadingTime += result.averageReadingTime
      })
      
      return Object.keys(weeklyData).map(week => ({
        week,
        sessions: weeklyData[week].sessions,
        averageComprehension: weeklyData[week].totalComprehension / weeklyData[week].sessions,
        averageReadingTime: weeklyData[week].totalReadingTime / weeklyData[week].sessions
      })).sort((a, b) => new Date(a.week) - new Date(b.week))
    },

    // 导出训练数据
    exportTrainingData() {
      const data = {
        results: JSON.parse(localStorage.getItem('articleFlashResults') || '[]'),
        statistics: JSON.parse(localStorage.getItem('articleFlashStats') || '{}'),
        settings: JSON.parse(localStorage.getItem('articleFlashSettings') || '{}'),
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `article-flash-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    // 导入训练数据
    async importTrainingData(file) {
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        
        if (data.version && data.results) {
          // 合并现有数据
          const existingResults = JSON.parse(localStorage.getItem('articleFlashResults') || '[]')
          const mergedResults = [...existingResults, ...data.results]
          
          // 去重并限制数量
          const uniqueResults = mergedResults.filter((result, index, arr) => 
            arr.findIndex(r => r.id === result.id) === index
          ).slice(-1000)
          
          localStorage.setItem('articleFlashResults', JSON.stringify(uniqueResults))
          
          if (data.statistics) {
            localStorage.setItem('articleFlashStats', JSON.stringify(data.statistics))
            this.loadStatistics()
          }
          
          return { success: true, message: `成功导入 ${data.results.length} 条训练记录` }
        } else {
          return { success: false, message: '无效的数据格式' }
        }
      } catch (error) {
        return { success: false, message: '导入失败：' + error.message }
      }
    },

    // 创建数据备份
    createBackup() {
      const backup = {
        articleFlashResults: localStorage.getItem('articleFlashResults'),
        articleFlashStats: localStorage.getItem('articleFlashStats'),
        articleFlashSettings: localStorage.getItem('articleFlashSettings'),
        backupDate: new Date().toISOString()
      }
      
      return JSON.stringify(backup)
    },

    // 恢复数据备份
    restoreBackup(backupData) {
      try {
        const backup = JSON.parse(backupData)
        
        if (backup.articleFlashResults) {
          localStorage.setItem('articleFlashResults', backup.articleFlashResults)
        }
        if (backup.articleFlashStats) {
          localStorage.setItem('articleFlashStats', backup.articleFlashStats)
          this.loadStatistics()
        }
        if (backup.articleFlashSettings) {
          localStorage.setItem('articleFlashSettings', backup.articleFlashSettings)
          this.loadSettings()
        }
        
        return { success: true, message: '数据恢复成功' }
      } catch (error) {
        return { success: false, message: '恢复失败：' + error.message }
      }
    },

    // 清除训练数据
    clearTrainingData(type = 'all') {
      if (type === 'all' || type === 'results') {
        localStorage.removeItem('articleFlashResults')
      }
      if (type === 'all' || type === 'statistics') {
        localStorage.removeItem('articleFlashStats')
        this.statistics = {
          totalSessions: 0,
          bestComprehension: 0,
          averageComprehension: 0,
          averageReadingTime: 0,
          modePerformance: [],
          comprehensionTrend: []
        }
      }
      if (type === 'all' || type === 'settings') {
        localStorage.removeItem('articleFlashSettings')
        this.resetSettings()
      }
    },

    // 获取存储使用情况
    getStorageUsage() {
      const results = localStorage.getItem('articleFlashResults') || ''
      const stats = localStorage.getItem('articleFlashStats') || ''
      const settings = localStorage.getItem('articleFlashSettings') || ''
      
      return {
        results: {
          size: new Blob([results]).size,
          count: JSON.parse(results || '[]').length
        },
        statistics: {
          size: new Blob([stats]).size
        },
        settings: {
          size: new Blob([settings]).size
        },
        total: new Blob([results + stats + settings]).size
      }
    },

    // 返回父组件
    goBack() {
      this.$emit('go-back')
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
.article-flash-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
}

.back-btn {
  position: absolute;
  left: 20px;
  top: 20px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 2px solid rgba(102, 126, 234, 0.3);
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
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.5);
  transform: translateX(-2px);
}

.back-arrow {
  font-size: 1.2rem;
  font-weight: bold;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

/* 训练模式选择 */
.training-modes {
  margin-bottom: 30px;
}

.training-modes h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.mode-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  position: relative;
  overflow: hidden;
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.mode-card.active {
  border-color: #667eea;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
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

.mode-level.beginner {
  background: #4CAF50;
}

.mode-level.intermediate {
  background: #FF9800;
}

.mode-level.advanced {
  background: #F44336;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
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
  color: #667eea;
}

.start-mode-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(45deg, #667eea, #764ba2);
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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.training-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.training-header h3 {
  font-size: 1.5rem;
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
  gap: 5px;
}

.info-label {
  font-size: 0.8rem;
  color: #666;
}

.info-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.info-value.correct {
  color: #4CAF50;
}

.info-value.error {
  color: #F44336;
}

.training-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: #e9ecef;
  transform: scale(1.05);
}

/* 闪视显示区域 */
.flash-display-area {
  margin-bottom: 30px;
}

.flash-container {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
  border-radius: 15px;
  border: 3px solid #e9ecef;
  position: relative;
  overflow: hidden;
}

.flash-container.flashing {
  background: white;
  border-color: #667eea;
  animation: flashPulse 0.5s ease-in-out;
}

@keyframes flashPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.flash-content {
  text-align: center;
  padding: 40px;
  max-width: 90%;
}

.article-text {
  line-height: 1.8;
  color: #333;
  font-weight: 500;
  text-align: justify;
  max-width: 600px;
  margin: 0 auto;
}

.ready-indicator {
  text-align: center;
  color: #666;
}

.ready-text {
  font-size: 1.2rem;
  margin-bottom: 20px;
  display: block;
}

.countdown-circle {
  width: 80px;
  height: 80px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.countdown-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
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

/* 理解测试区域 */
.comprehension-area {
  margin-bottom: 30px;
}

.comprehension-prompt {
  text-align: center;
  margin-bottom: 25px;
}

.comprehension-prompt h4 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 10px;
}

.comprehension-hint {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.5;
}

.comprehension-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.comprehension-option {
  padding: 15px 20px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  text-align: center;
}

.comprehension-option:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.comprehension-option.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.comprehension-option.correct {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.comprehension-option.wrong {
  background: #F44336;
  color: white;
  border-color: #F44336;
}

.judgment-options {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.judgment-option {
  padding: 15px 30px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  font-weight: bold;
}

.judgment-option:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.judgment-option.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.judgment-option.correct {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.judgment-option.wrong {
  background: #F44336;
  color: white;
  border-color: #F44336;
}

.fill-blank-input {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.input-field {
  padding: 12px 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 200px;
  flex: 1;
  max-width: 300px;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-btn {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-2px);
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
  border-radius: 10px;
}

.result-message {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.result-message.correct {
  color: #4CAF50;
}

.result-message.wrong {
  color: #F44336;
}

.result-icon {
  font-size: 1.5rem;
}

.correct-answer {
  margin-bottom: 15px;
  font-size: 1rem;
  color: #666;
}

.explanation {
  margin-bottom: 20px;
  padding: 15px;
  background: #e3f2fd;
  border-radius: 8px;
  text-align: left;
  color: #333;
  line-height: 1.5;
}

.next-btn {
  padding: 12px 30px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
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
}

.completion-message {
  margin-bottom: 30px;
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  display: block;
}

.completion-message h4 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
}

.completion-message p {
  font-size: 1.1rem;
  color: #666;
}

.encouragement-message {
  margin-top: 15px;
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
}

.completion-stats .stat-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.completion-stats .stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.completion-stats .stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.completion-stats .stat-value.correct {
  color: #4CAF50;
}

.completion-stats .stat-value.error {
  color: #F44336;
}

.completion-stats .stat-value.excellent {
  color: #4CAF50;
}

.completion-stats .stat-value.good {
  color: #2196F3;
}

.completion-stats .stat-value.average {
  color: #FF9800;
}

.completion-stats .stat-value.poor {
  color: #F44336;
}

.completion-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.primary:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e9ecef;
}

.action-btn.secondary:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

/* 训练设置 */
.training-settings {
  margin-bottom: 30px;
}

.training-settings h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.setting-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
}

.setting-card h4 {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
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
  background: #e9ecef;
  outline: none;
  -webkit-appearance: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
}

.range-input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: none;
}

.range-value {
  min-width: 60px;
  text-align: right;
  font-weight: bold;
  color: #667eea;
}

.select-input {
  width: 100%;
  padding: 10px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
}

.select-input:focus {
  outline: none;
  border-color: #667eea;
}

/* 训练统计 */
.training-statistics {
  margin-bottom: 30px;
}

.training-statistics h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
}

.stats-card h4 {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

/* 总体表现 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.stats-overview .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
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
  font-size: 1.3rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stats-overview .stat-label {
  font-size: 0.8rem;
  color: #666;
}

/* 模式表现 */
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

.mode-stat .mode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.mode-name {
  font-weight: bold;
  color: #333;
}

.mode-stat .mode-level {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  color: white;
  background: #667eea;
}

.mode-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.mode-progress {
  margin-top: 10px;
}

.progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #666;
}

/* 理解率趋势图 */
.comprehension-chart {
  height: 200px;
  position: relative;
}

.chart-container {
  height: 100%;
  position: relative;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
}

.chart-line {
  height: 100%;
  position: relative;
}

.chart-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  cursor: pointer;
  z-index: 2;
}

.chart-point:hover {
  background: #5a6fd8;
  transform: translate(-50%, 50%) scale(1.2);
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
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
}

.axis-label {
  font-size: 0.9rem;
  color: #666;
}

/* 能力分析 */
.ability-analysis {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ability-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.ability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.ability-name {
  font-weight: bold;
  color: #333;
}

.ability-score {
  font-weight: bold;
  color: #667eea;
}

.ability-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.ability-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-flash-container {
    padding: 15px;
  }
  
  .page-header {
    padding: 20px;
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
  
  .flash-container {
    min-height: 250px;
  }
  
  .flash-content {
    padding: 20px;
  }
  
  .comprehension-options {
    grid-template-columns: 1fr;
  }
  
  .judgment-options {
    flex-direction: column;
  }
  
  .fill-blank-input {
    flex-direction: column;
  }
  
  .input-field {
    max-width: none;
  }
  
  .completion-stats {
    grid-template-columns: repeat(2, 1fr);
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
  
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mode-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .training-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .completion-stats {
    grid-template-columns: 1fr;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
}
</style>