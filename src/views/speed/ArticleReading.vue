<template>
  <div class="article-reading-container">

    <!-- 训练模式选择 -->
    <div class="training-modes" v-if="!isTraining">
      <h2>选择训练模式</h2>
      <div class="mode-grid">
        <div 
          class="mode-card" 
          :class="{ active: selectedMode === mode.id }"
          v-for="mode in trainingModes" 
          :key="mode.id"
          @click="selectMode(mode.id)"
        >
          <div class="mode-icon">
            <i :class="mode.icon"></i>
          </div>
          <h3>{{ mode.name }}</h3>
          <p>{{ mode.description }}</p>
          <div class="mode-stats">
            <span>难度: {{ mode.difficulty }}</span>
            <span>时长: {{ mode.duration }}分钟</span>
          </div>
        </div>
      </div>
      <button class="start-btn" @click="startTraining" :disabled="!selectedMode">
        开始训练
      </button>
    </div>

    <!-- 训练界面 -->
    <div class="training-interface" v-if="isTraining">
      <!-- 训练控制栏 -->
      <div class="training-controls">
        <div class="control-group">
          <label>阅读速度:</label>
          <div class="speed-control">
            <button @click="adjustSpeed(-50)" :disabled="isPaused">-</button>
            <span>{{ currentSpeed }} 字/分</span>
            <button @click="adjustSpeed(50)" :disabled="isPaused">+</button>
          </div>
        </div>
        <div class="control-group">
          <button class="control-btn" @click="togglePause">
            {{ isPaused ? '继续' : '暂停' }}
          </button>
          <button class="control-btn" @click="stopTraining">结束训练</button>
        </div>
        <div class="training-stats">
          <span>已读: {{ readWords }}/{{ totalWords }} 字</span>
          <span>用时: {{ formatTime(elapsedTime) }}</span>
          <span>进度: {{ Math.round((readWords / totalWords) * 100) }}%</span>
        </div>
      </div>

      <!-- 文章显示区域 -->
      <div class="article-display" :class="'bg-' + settings.backgroundColor">
        <div class="article-content" ref="articleContent" :style="{
          fontSize: getFontSize(),
          lineHeight: settings.lineHeight,
          letterSpacing: getWordSpacing()
        }">
          <h3 class="article-title">{{ currentArticle.title }}</h3>
          <div class="article-text">
            <span 
              v-for="(word, index) in articleWords" 
              :key="index"
              :class="{
                'current-word': index === currentWordIndex,
                'read-word': index < currentWordIndex,
                'highlight': index === currentWordIndex
              }"
              :style="{
                backgroundColor: index === currentWordIndex ? settings.highlightColor : 'transparent'
              }"
            >
              {{ word }}
            </span>
          </div>
        </div>
        
        <!-- 阅读指导线 -->
        <div class="reading-guide" v-if="settings.showGuide">
          <div class="guide-line" :style="{ top: guidePosition + 'px' }"></div>
        </div>
      </div>

      <!-- 理解测试 -->
      <div class="comprehension-test" v-if="showComprehensionTest">
        <h3>理解测试</h3>
        <div class="question" v-if="currentQuestion">
          <p>{{ currentQuestion.question }}</p>
          <div class="options">
            <button 
              v-for="(option, index) in currentQuestion.options" 
              :key="index"
              class="option-btn"
              :class="{ selected: selectedAnswer === index }"
              @click="selectAnswer(index)"
            >
              {{ option }}
            </button>
          </div>
          <button class="submit-btn" @click="submitAnswer" :disabled="selectedAnswer === null">
            提交答案
          </button>
        </div>
      </div>
    </div>

    <!-- 训练完成弹窗 -->
    <div class="modal-overlay" v-if="showCompletionModal">
      <div class="completion-modal">
        <h2>训练完成！</h2>
        <div class="completion-stats">
          <div class="stat-item">
            <span class="stat-label">阅读速度:</span>
            <span class="stat-value">{{ Math.round(finalSpeed) }} 字/分</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总用时:</span>
            <span class="stat-value">{{ formatTime(totalTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">理解准确率:</span>
            <span class="stat-value">{{ Math.round(comprehensionAccuracy) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">训练评级:</span>
            <span class="stat-value" :class="'rating-' + trainingRating.toLowerCase()">{{ trainingRating }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="secondary-btn" @click="restartTraining">重新训练</button>
          <button class="primary-btn" @click="finishTraining">完成</button>
        </div>
      </div>
    </div>

    <!-- 训练设置 -->
    <div class="training-settings" v-if="!isTraining">
      <h2>训练设置</h2>
      <div class="settings-grid">
        <!-- 基础设置 -->
        <div class="settings-section">
          <h3>基础设置</h3>
          <div class="setting-group">
            <label>初始速度 (字/分):</label>
            <input type="range" v-model="settings.initialSpeed" min="100" max="1000" step="50">
            <span>{{ settings.initialSpeed }}</span>
          </div>
          <div class="setting-group">
            <label>字体大小:</label>
            <select v-model="settings.fontSize">
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
              <option value="extra-large">特大</option>
            </select>
          </div>
          <div class="setting-group">
            <label>行间距:</label>
            <input type="range" v-model="settings.lineHeight" min="1.2" max="2.5" step="0.1">
            <span>{{ settings.lineHeight }}</span>
          </div>
          <div class="setting-group">
            <label>字间距:</label>
            <select v-model="settings.wordSpacing">
              <option value="tight">紧密</option>
              <option value="normal">正常</option>
              <option value="loose">宽松</option>
            </select>
          </div>
        </div>

        <!-- 视觉设置 -->
        <div class="settings-section">
          <h3>视觉设置</h3>
          <div class="setting-group">
            <label>背景颜色:</label>
            <select v-model="settings.backgroundColor">
              <option value="white">白色</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="sepia">护眼色</option>
            </select>
          </div>
          <div class="setting-group">
            <label>高亮颜色:</label>
            <input type="color" v-model="settings.highlightColor">
          </div>
          <div class="setting-group">
            <label>显示阅读指导线:</label>
            <input type="checkbox" v-model="settings.showGuide">
          </div>
          <div class="setting-group">
            <label>显示进度条:</label>
            <input type="checkbox" v-model="settings.showProgress">
          </div>
        </div>

        <!-- 训练设置 -->
        <div class="settings-section">
          <h3>训练设置</h3>
          <div class="setting-group">
            <label>启用理解测试:</label>
            <input type="checkbox" v-model="settings.enableComprehension">
          </div>
          <div class="setting-group">
            <label>自动加速:</label>
            <input type="checkbox" v-model="settings.autoSpeed">
          </div>
          <div class="setting-group" v-if="settings.autoSpeed">
            <label>加速幅度 (字/分):</label>
            <input type="range" v-model="settings.speedIncrement" min="10" max="100" step="10">
            <span>{{ settings.speedIncrement }}</span>
          </div>
          <div class="setting-group">
            <label>标点符号处暂停:</label>
            <input type="checkbox" v-model="settings.pauseOnPunctuation">
          </div>
          <div class="setting-group">
            <label>启用音效:</label>
            <input type="checkbox" v-model="settings.enableSound">
          </div>
        </div>

        <!-- 内容设置 -->
        <div class="settings-section">
          <h3>内容设置</h3>
          <div class="setting-group">
            <label>文章类型:</label>
            <select v-model="settings.articleType">
              <option value="all">全部类型</option>
              <option value="story">故事类</option>
              <option value="science">科普类</option>
              <option value="news">新闻类</option>
              <option value="literature">文学类</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练统计 -->
    <div class="training-statistics" v-if="!isTraining">
      <h2>训练统计</h2>
      
      <!-- 总体表现 -->
      <div class="stats-section">
        <h3>总体表现</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ statistics.totalSessions }}</div>
            <div class="stat-label">训练次数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ Math.round(statistics.averageSpeed) }}</div>
            <div class="stat-label">平均速度 (字/分)</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ Math.round(statistics.averageAccuracy) }}%</div>
            <div class="stat-label">平均理解率</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ formatTime(statistics.totalTime) }}</div>
            <div class="stat-label">总训练时长</div>
          </div>
        </div>
      </div>

      <!-- 速度趋势 -->
      <div class="stats-section">
        <h3>速度趋势</h3>
        <div class="trend-chart">
          <div class="chart-placeholder">
            <p>速度趋势图表</p>
            <small>显示最近10次训练的阅读速度变化</small>
          </div>
        </div>
      </div>

      <!-- 能力分析 -->
      <div class="stats-section">
        <h3>能力分析</h3>
        <div class="ability-analysis">
          <div class="ability-item">
            <span class="ability-name">阅读速度</span>
            <div class="ability-bar">
              <div class="ability-progress" :style="{ width: statistics.speedLevel + '%' }"></div>
            </div>
            <span class="ability-score">{{ statistics.speedLevel }}%</span>
          </div>
          <div class="ability-item">
            <span class="ability-name">理解能力</span>
            <div class="ability-bar">
              <div class="ability-progress" :style="{ width: statistics.comprehensionLevel + '%' }"></div>
            </div>
            <span class="ability-score">{{ statistics.comprehensionLevel }}%</span>
          </div>
          <div class="ability-item">
            <span class="ability-name">专注度</span>
            <div class="ability-bar">
              <div class="ability-progress" :style="{ width: statistics.focusLevel + '%' }"></div>
            </div>
            <span class="ability-score">{{ statistics.focusLevel }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  saveArticleReadingSettings,
  getArticleReadingSettings,
  saveArticleReadingRecord,
  getArticleReadingHistory,
  getSpeedReadingStats
} from '@/services/speedReadingStorage'

export default {
  name: 'ArticleReading',
  emits: ['go-back'],
  data() {
    return {
      // 训练状态
      isTraining: false,
      isPaused: false,
      selectedMode: null,
      
      // 训练模式
      trainingModes: [
        {
          id: 'beginner',
          name: '初级阅读',
          description: '适合初学者的基础文章阅读',
          icon: 'fas fa-seedling',
          difficulty: '简单',
          duration: 10
        },
        {
          id: 'intermediate',
          name: '中级阅读',
          description: '中等难度的文章阅读训练',
          icon: 'fas fa-book',
          difficulty: '中等',
          duration: 15
        },
        {
          id: 'advanced',
          name: '高级阅读',
          description: '高难度的专业文章阅读',
          icon: 'fas fa-graduation-cap',
          difficulty: '困难',
          duration: 20
        },
        {
          id: 'speed',
          name: '极速阅读',
          description: '挑战极限阅读速度',
          icon: 'fas fa-bolt',
          difficulty: '极难',
          duration: 25
        }
      ],
      
      // 文章库
      articleLibrary: {
        beginner: [
          {
            id: 1,
            title: '春天的故事',
            content: '春天来了，万物复苏。小草从地里探出头来，嫩绿嫩绿的。柳树发芽了，长长的柳条在春风中轻轻摆动。桃花开了，粉红粉红的，像小姑娘的脸蛋。燕子从南方飞回来了，在屋檐下筑巢。孩子们脱下厚厚的棉衣，在公园里放风筝。春天真美啊！到处都是生机勃勃的景象。',
            questions: [
              { question: '春天来了，什么从地里探出头来？', options: ['小草', '小花', '小树', '小鸟'], answer: 0 },
              { question: '桃花是什么颜色的？', options: ['白色', '红色', '粉红色', '黄色'], answer: 2 },
              { question: '燕子从哪里飞回来？', options: ['北方', '南方', '东方', '西方'], answer: 1 }
            ]
          },
          {
            id: 2,
            title: '小猫钓鱼',
            content: '小猫和妈妈一起去钓鱼。小猫刚开始很专心，但是看到蝴蝶飞来就去追蝴蝶，看到蜻蜓飞来就去追蜻蜓。妈妈一直专心钓鱼，钓到了很多鱼。小猫什么也没钓到，很着急。妈妈告诉小猫："做事要专心，不能三心二意。"小猫听了妈妈的话，开始专心钓鱼，终于也钓到了一条大鱼。',
            questions: [
              { question: '小猫和谁一起去钓鱼？', options: ['爸爸', '妈妈', '奶奶', '朋友'], answer: 1 },
              { question: '小猫为什么没钓到鱼？', options: ['不会钓', '三心二意', '鱼太少', '运气不好'], answer: 1 },
              { question: '最后小猫钓到鱼了吗？', options: ['没有', '钓到了', '不知道', '钓到很多'], answer: 1 }
            ]
          }
        ],
        intermediate: [
          {
            id: 3,
            title: '科技改变生活',
            content: '随着科技的快速发展，我们的生活发生了翻天覆地的变化。智能手机让我们随时随地都能与世界保持联系，网络购物让我们足不出户就能买到心仪的商品，移动支付让我们出门不再需要携带现金。人工智能技术正在各个领域发挥着重要作用，从医疗诊断到自动驾驶，从语音识别到机器翻译，科技正在让我们的生活变得更加便利和高效。然而，我们也要理性看待科技发展，既要享受科技带来的便利，也要注意避免过度依赖科技而忽视了人与人之间的真实交流。',
            questions: [
              { question: '文章主要讲述了什么？', options: ['科技的发展历程', '科技对生活的影响', '科技的负面作用', '科技的未来趋势'], answer: 1 },
              { question: '人工智能技术应用于哪些领域？', options: ['只有医疗', '只有交通', '多个领域', '只有通信'], answer: 2 },
              { question: '对待科技发展应该持什么态度？', options: ['完全拒绝', '盲目崇拜', '理性看待', '无所谓'], answer: 2 }
            ]
          },
          {
            id: 4,
            title: '环保从我做起',
            content: '环境保护是当今世界面临的重大挑战之一。全球气候变暖、空气污染、水资源短缺等问题日益严重，需要我们每个人都行动起来。环保不是遥不可及的大事，而是从身边的小事做起。我们可以选择绿色出行，多步行、骑自行车或乘坐公共交通工具；我们可以节约用水用电，随手关灯、关水龙头；我们可以减少使用一次性用品，自带购物袋、水杯等；我们还可以进行垃圾分类，让资源得到更好的回收利用。只要每个人都从自己做起，从小事做起，就能为保护地球环境贡献一份力量。',
            questions: [
              { question: '文章提到了哪些环境问题？', options: ['只有气候变暖', '只有空气污染', '多种环境问题', '只有水资源问题'], answer: 2 },
              { question: '环保应该从什么做起？', options: ['大事', '小事', '政府行为', '企业行为'], answer: 1 },
              { question: '绿色出行包括哪些方式？', options: ['只有步行', '只有骑车', '多种方式', '只有公交'], answer: 2 }
            ]
          }
        ],
        advanced: [
          {
            id: 5,
            title: '人工智能的发展与挑战',
            content: '人工智能作为21世纪最具革命性的技术之一，正在深刻地改变着人类社会的方方面面。从机器学习到深度学习，从自然语言处理到计算机视觉，人工智能技术的突破为各行各业带来了前所未有的机遇。在医疗领域，AI辅助诊断系统能够帮助医生更准确地识别疾病；在金融领域，智能风控系统大大提高了风险识别的效率；在教育领域，个性化学习系统为每个学生提供定制化的学习方案。然而，人工智能的快速发展也带来了诸多挑战。就业结构的变化、数据隐私的保护、算法偏见的消除、人机关系的重新定义等问题都需要我们深入思考和妥善解决。我们需要在推动技术进步的同时，确保人工智能的发展能够真正造福人类，实现技术与人文的和谐统一。',
            questions: [
              { question: '人工智能在医疗领域的应用是什么？', options: ['治疗疾病', '辅助诊断', '制造药物', '手术操作'], answer: 1 },
              { question: '人工智能发展面临哪些挑战？', options: ['技术难题', '社会问题', '资金不足', '人才缺乏'], answer: 1 },
              { question: '文章认为应该如何发展人工智能？', options: ['快速发展', '谨慎发展', '技术与人文和谐', '停止发展'], answer: 2 }
            ]
          }
        ],
        speed: [
          {
            id: 6,
            title: '量子计算的前沿探索',
            content: '量子计算作为下一代计算技术的重要代表，正在引领着计算科学的革命性变革。与传统的二进制计算不同，量子计算利用量子力学的叠加态和纠缠态等特性，能够实现指数级的计算能力提升。量子比特作为量子信息的基本单位，可以同时处于0和1的叠加态，这使得量子计算机在处理特定类型的问题时具有巨大的优势。在密码学领域，量子算法能够破解现有的RSA加密体系；在优化问题中，量子退火算法展现出了超越经典算法的潜力；在机器学习领域，量子机器学习算法有望实现计算复杂度的根本性突破。然而，量子计算的实用化仍面临着量子退相干、错误率控制、量子纠错等技术挑战。目前，IBM、Google、微软等科技巨头都在量子计算领域投入巨资进行研发，量子霸权的实现标志着量子计算从理论走向实践的重要里程碑。未来，随着量子计算技术的不断成熟，它将在药物发现、材料科学、金融建模等领域发挥革命性的作用。',
            questions: [
              { question: '量子计算的核心优势是什么？', options: ['速度快', '指数级计算能力', '成本低', '易操作'], answer: 1 },
              { question: '量子计算面临的主要挑战是什么？', options: ['资金问题', '技术挑战', '人才不足', '市场需求'], answer: 1 },
              { question: '量子霸权的意义是什么？', options: ['技术垄断', '理论突破', '从理论到实践', '商业成功'], answer: 2 }
            ]
          }
        ]
      },
      
      // 当前文章
      currentArticle: {
        title: '',
        content: '',
        questions: []
      },
      articleWords: [],
      currentWordIndex: 0,
      
      // 训练参数
      currentSpeed: 300,
      readWords: 0,
      totalWords: 0,
      elapsedTime: 0,
      totalTime: 0,
      
      // 理解测试
      showComprehensionTest: false,
      currentQuestion: null,
      selectedAnswer: null,
      comprehensionScore: 0,
      comprehensionAccuracy: 0,
      
      // 完成状态
      showCompletionModal: false,
      finalSpeed: 0,
      trainingRating: 'B',
      
      // 阅读指导
      guidePosition: 0,
      
      // 定时器
      readingTimer: null,
      timeTimer: null,
      
      // 设置
      settings: {
        initialSpeed: 300,
        fontSize: 'medium',
        showGuide: true,
        enableComprehension: true,
        backgroundColor: 'white',
        lineHeight: 1.6,
        wordSpacing: 'normal',
        highlightColor: '#ffeb3b',
        autoSpeed: false,
        speedIncrement: 50,
        pauseOnPunctuation: false,
        showProgress: true,
        enableSound: false,
        articleType: 'all'
      },
      
      // 统计数据
      statistics: {
        totalSessions: 0,
        averageSpeed: 0,
        averageAccuracy: 0,
        totalTime: 0,
        speedLevel: 0,
        comprehensionLevel: 0,
        focusLevel: 0
      }
    }
  },
  
  async mounted() {
    await this.loadSettings()
    await this.loadStatistics()
    this.loadSampleArticle()
  },
  
  beforeUnmount() {
    this.clearTimers()
  },
  
  methods: {
    // 选择训练模式
    selectMode(modeId) {
      this.selectedMode = modeId
    },
    
    // 开始训练
    startTraining() {
      if (!this.selectedMode) return
      
      this.isTraining = true
      this.isPaused = false
      this.currentSpeed = this.settings.initialSpeed
      this.currentWordIndex = 0
      this.readWords = 0
      this.elapsedTime = 0
      this.comprehensionScore = 0
      
      this.loadArticleByMode(this.selectedMode)
      this.startReading()
      this.startTimer()
    },
    
    // 开始阅读
    startReading() {
      this.readingTimer = setInterval(() => {
        if (!this.isPaused && this.currentWordIndex < this.articleWords.length) {
          this.currentWordIndex++
          this.readWords++
          this.updateGuidePosition()
          
          if (this.currentWordIndex >= this.articleWords.length) {
            this.completeReading()
          }
        }
      }, 60000 / this.currentSpeed) // 根据速度计算间隔
    },
    
    // 开始计时
    startTimer() {
      this.timeTimer = setInterval(() => {
        if (!this.isPaused) {
          this.elapsedTime++
        }
      }, 1000)
    },
    
    // 调整速度
    adjustSpeed(delta) {
      this.currentSpeed = Math.max(100, Math.min(1000, this.currentSpeed + delta))
      if (this.readingTimer) {
        clearInterval(this.readingTimer)
        this.startReading()
      }
    },
    
    // 暂停/继续
    togglePause() {
      this.isPaused = !this.isPaused
    },
    
    // 停止训练
    stopTraining() {
      this.clearTimers()
      this.isTraining = false
      this.showCompletionModal = false
    },
    
    // 完成阅读
    completeReading() {
      this.clearTimers()
      this.totalTime = this.elapsedTime
      this.finalSpeed = (this.readWords / this.elapsedTime) * 60
      
      if (this.settings.enableComprehension) {
        this.startComprehensionTest()
      } else {
        this.showResults()
      }
    },
    
    // 开始理解测试
    startComprehensionTest() {
      this.showComprehensionTest = true
      this.currentQuestion = this.currentArticle.questions[0]
      this.selectedAnswer = null
    },
    
    // 选择答案
    selectAnswer(index) {
      this.selectedAnswer = index
    },
    
    // 提交答案
    submitAnswer() {
      if (this.selectedAnswer === this.currentQuestion.correct) {
        this.comprehensionScore++
      }
      
      // 检查是否还有更多问题
      const nextQuestionIndex = this.currentArticle.questions.indexOf(this.currentQuestion) + 1
      if (nextQuestionIndex < this.currentArticle.questions.length) {
        this.currentQuestion = this.currentArticle.questions[nextQuestionIndex]
        this.selectedAnswer = null
      } else {
        this.comprehensionAccuracy = (this.comprehensionScore / this.currentArticle.questions.length) * 100
        this.showComprehensionTest = false
        this.showResults()
      }
    },
    
    // 显示结果
    showResults() {
      this.calculateRating()
      this.showCompletionModal = true
      this.saveTrainingData()
    },
    
    // 计算评级
    calculateRating() {
      const speedScore = Math.min(100, (this.finalSpeed / 500) * 100)
      const accuracyScore = this.comprehensionAccuracy
      const overallScore = (speedScore + accuracyScore) / 2
      
      if (overallScore >= 90) this.trainingRating = 'S'
      else if (overallScore >= 80) this.trainingRating = 'A'
      else if (overallScore >= 70) this.trainingRating = 'B'
      else if (overallScore >= 60) this.trainingRating = 'C'
      else this.trainingRating = 'D'
    },
    
    // 重新训练
    restartTraining() {
      this.showCompletionModal = false
      this.startTraining()
    },
    
    // 完成训练
    finishTraining() {
      this.showCompletionModal = false
      this.isTraining = false
    },
    
    // 更新指导线位置
    updateGuidePosition() {
      // 简化的指导线位置计算
      this.guidePosition = Math.min(300, this.currentWordIndex * 2)
    },
    
    // 清除定时器
    clearTimers() {
      if (this.readingTimer) {
        clearInterval(this.readingTimer)
        this.readingTimer = null
      }
      if (this.timeTimer) {
        clearInterval(this.timeTimer)
        this.timeTimer = null
      }
    },
    
    // 格式化时间
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    // 加载文章
    loadArticleByMode(mode) {
      const modeArticles = this.articleLibrary[mode] || this.articleLibrary.beginner
      // 随机选择一篇文章
      const randomIndex = Math.floor(Math.random() * modeArticles.length)
      this.currentArticle = { ...modeArticles[randomIndex] }
      
      // 将文章内容分割为字符数组用于逐字显示
      this.articleWords = this.currentArticle.content.split('')
      this.totalWords = this.articleWords.length
      
      // 重置阅读进度
      this.currentWordIndex = 0
      this.readWords = 0
    },
    
    // 加载示例文章
    loadSampleArticle() {
      this.loadArticleByMode('beginner')
    },
    
    // 保存训练数据
    async saveTrainingData() {
      const data = {
        articleId: this.currentArticle.id,
        articleTitle: this.currentArticle.title,
        mode: this.selectedMode,
        speed: this.finalSpeed,
        accuracy: this.comprehensionAccuracy,
        time: this.totalTime,
        rating: this.trainingRating,
        date: new Date().toISOString()
      }
      
      // 使用统一存储服务保存记录
      await saveArticleReadingRecord(data)
      
      this.updateStatistics()
    },
    
    // 更新统计数据
    async updateStatistics() {
      try {
        const stats = await getSpeedReadingStats()
        const articleStats = stats.articleReading
        
        this.statistics.totalSessions = articleStats.totalSessions
        this.statistics.averageSpeed = articleStats.averageSpeed
        this.statistics.averageAccuracy = articleStats.averageAccuracy
        this.statistics.totalTime = articleStats.totalTime
        
        // 计算能力等级
        this.statistics.speedLevel = Math.min(100, (this.statistics.averageSpeed / 500) * 100)
        this.statistics.comprehensionLevel = this.statistics.averageAccuracy
        this.statistics.focusLevel = Math.min(100, (this.statistics.totalSessions / 50) * 100)
      } catch (error) {
        console.error('更新统计数据失败:', error)
      }
    },
    
    // 加载设置
    async loadSettings() {
      try {
        const settings = await getArticleReadingSettings()
        this.settings = { ...this.settings, ...settings }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    },
    
    // 保存设置
    async saveSettings() {
      try {
        await saveArticleReadingSettings(this.settings)
      } catch (error) {
        console.error('保存设置失败:', error)
      }
    },
    
    // 加载统计数据
    async loadStatistics() {
      await this.updateStatistics()
    },
    
    // 返回上级页面
    goBack() {
      this.$emit('go-back')
    },

    // 获取字体大小
    getFontSize() {
      const sizes = {
        small: '14px',
        medium: '16px',
        large: '18px',
        'extra-large': '22px'
      }
      return sizes[this.settings.fontSize] || '16px'
    },

    // 获取字间距
    getWordSpacing() {
      const spacings = {
        tight: '-0.5px',
        normal: '0px',
        loose: '1px'
      }
      return spacings[this.settings.wordSpacing] || '0px'
    }
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
.article-reading-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
}

/* 页面头部 */
.page-header {
  position: relative;
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) translateX(-2px);
}

.back-arrow {
  font-size: 16px;
  font-weight: bold;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

/* 训练模式选择 */
.training-modes {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.training-modes h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-size: 1.8rem;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.mode-card {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.mode-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.mode-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: #667eea;
}

.mode-card.active .mode-icon {
  color: white;
}

.mode-card h3 {
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}

.mode-card p {
  margin: 0 0 15px 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.mode-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  opacity: 0.7;
}

.start-btn {
  display: block;
  margin: 0 auto;
  padding: 15px 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 训练界面 */
.training-interface {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

/* 训练控制栏 */
.training-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-group label {
  font-weight: bold;
  color: #333;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 8px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
}

.speed-control button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.speed-control button:hover:not(:disabled) {
  background: #5a6fd8;
  transform: scale(1.1);
}

.speed-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.control-btn:first-of-type {
  background: #28a745;
  color: white;
}

.control-btn:last-of-type {
  background: #dc3545;
  color: white;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
}

.training-stats {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: #666;
}

/* 文章显示区域 */
.article-display {
  position: relative;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 30px;
  min-height: 400px;
  transition: all 0.3s ease;
}

.article-display.bg-white {
  background: white;
  color: #333;
}

.article-display.bg-light {
  background: #f8f9fa;
  color: #495057;
}

.article-display.bg-dark {
  background: #343a40;
  color: #f8f9fa;
}

.article-display.bg-sepia {
  background: #f4f3e8;
  color: #5d4e37;
}

.article-content {
  position: relative;
  z-index: 2;
}

.article-title {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-size: 1.5rem;
}

.article-text {
  line-height: 2;
  font-size: 1.1rem;
  text-align: justify;
}

.article-text span {
  transition: all 0.2s ease;
  padding: 2px;
  border-radius: 3px;
}

.current-word {
  background: #667eea;
  color: white;
  font-weight: bold;
  animation: highlight 0.5s ease;
}

.read-word {
  opacity: 0.6;
  color: #666;
}

.highlight {
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

@keyframes highlight {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 阅读指导线 */
.reading-guide {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.guide-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  transition: top 0.3s ease;
  opacity: 0.7;
}

/* 理解测试 */
.comprehension-test {
  background: #e3f2fd;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 20px;
}

.comprehension-test h3 {
  text-align: center;
  margin-bottom: 20px;
  color: #1976d2;
}

.question p {
  font-size: 1.1rem;
  margin-bottom: 20px;
  font-weight: bold;
}

.options {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.option-btn {
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;
}

.option-btn:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.option-btn.selected {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.submit-btn {
  display: block;
  margin: 0 auto;
  padding: 12px 30px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 完成弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-modal {
  background: white;
  border-radius: 15px;
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

.completion-modal h2 {
  color: #333;
  margin-bottom: 25px;
  font-size: 2rem;
}

.completion-stats {
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-weight: bold;
  color: #666;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.rating-s { color: #ffd700; }
.rating-a { color: #28a745; }
.rating-b { color: #17a2b8; }
.rating-c { color: #ffc107; }
.rating-d { color: #dc3545; }

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.primary-btn, .secondary-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.secondary-btn {
  background: #6c757d;
  color: white;
}

.primary-btn:hover, .secondary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* 训练设置 */
.training-settings {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.training-settings h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.settings-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.settings-section h3 {
  margin-bottom: 20px;
  color: #495057;
  font-size: 1.1rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-group label {
  font-weight: bold;
  color: #333;
}

.setting-group input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
}

.setting-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
}

.setting-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
}

.setting-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #667eea;
}

.setting-group input[type="color"] {
  width: 50px;
  height: 35px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 0;
}

/* 训练统计 */
.training-statistics {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.training-statistics h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.stats-section {
  margin-bottom: 40px;
}

.stats-section h3 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 趋势图表 */
.trend-chart {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
}

.chart-placeholder {
  color: #666;
}

.chart-placeholder p {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.chart-placeholder small {
  opacity: 0.7;
}

/* 能力分析 */
.ability-analysis {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ability-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.ability-name {
  min-width: 100px;
  font-weight: bold;
  color: #333;
}

.ability-bar {
  flex: 1;
  height: 10px;
  background: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
}

.ability-progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.ability-score {
  min-width: 50px;
  text-align: right;
  font-weight: bold;
  color: #667eea;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-reading-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .training-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    justify-content: center;
  }
  
  .training-stats {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .mode-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ability-item {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .ability-name {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .completion-modal {
    padding: 25px;
  }
}
</style>