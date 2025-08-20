<template>
  <div class="word-memory-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase fade-in">
      <div class="instruction-container">
        <h2 class="instruction-title">单词记忆测试</h2>
        <div class="instruction-content">
          <div class="test-description">
            <h3>测试目标</h3>
            <p>评估您的单词记忆能力，包括短期记忆、长期记忆和语义记忆等方面。</p>
            
            <h3>测试步骤</h3>
            <ol>
              <li>根据您的需求调整测试设置</li>
              <li>仔细记忆显示的单词列表</li>
              <li>在规定时间内完成记忆任务</li>
              <li>根据题目要求进行回答</li>
              <li>查看详细的测试结果和分析</li>
            </ol>
          </div>
          
          <div class="test-settings">
            <div class="settings-grid">
              <div class="setting-item">
                <label class="setting-label">难度等级</label>
                <select v-model="settings.difficulty" class="setting-select">
                  <option value="easy">简单 (5-8个单词)</option>
                  <option value="medium">中等 (8-12个单词)</option>
                  <option value="hard">困难 (12-16个单词)</option>
                  <option value="expert">专家 (16-20个单词)</option>
                </select>
              </div>
              
              <div class="setting-item">
                <label class="setting-label">测试类型</label>
                <select v-model="settings.testType" class="setting-select">
                  <option value="sequence">顺序记忆</option>
                  <option value="recognition">识别记忆</option>
                  <option value="semantic">语义记忆</option>
                  <option value="mixed">混合模式</option>
                </select>
              </div>
              
              <div class="setting-item">
                <label class="setting-label">显示时间</label>
                <select v-model="settings.displayTime" class="setting-select">
                  <option value="2">2秒/单词</option>
                  <option value="3">3秒/单词</option>
                  <option value="4">4秒/单词</option>
                  <option value="5">5秒/单词</option>
                </select>
              </div>
              
              <div class="setting-item">
                <label class="setting-label">题目数量</label>
                <select v-model="settings.questionCount" class="setting-select">
                  <option value="10">10题</option>
                  <option value="15">15题</option>
                  <option value="20">20题</option>
                  <option value="25">25题</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div class="instruction-actions">
          <button @click="startTest" class="btn-start">开始测试</button>
        </div>
      </div>
    </div>

    <!-- 测试进行中阶段 -->
    <div v-else-if="currentPhase === 'testing'" class="testing-phase">
      <div class="test-container">
        <!-- 进度和状态 -->
        <div class="test-header">
          <div class="progress-info">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <span class="progress-text">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
          </div>
          
          <div class="test-stats">
            <div class="stat-item">
              <span class="stat-icon">⏱️</span>
              <span class="stat-value">{{ formatTime(elapsedTime) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🎯</span>
              <span class="stat-value">{{ correctAnswers }}/{{ answeredQuestions }}</span>
            </div>
          </div>
        </div>

        <!-- 记忆阶段 -->
        <div v-if="testStage === 'memorize'" class="memorize-stage">
          <div class="stage-title">请记住以下单词</div>
          <div class="word-display">
            <div class="word-list">
              <div 
                v-for="(word, index) in currentQuestion.words" 
                :key="index"
                class="word-item"
                :class="{ 'highlight': index === highlightIndex }"
              >
                {{ word }}
              </div>
            </div>
          </div>
          
          <div class="memorize-timer">
            <div class="timer-circle">
              <div class="timer-fill" :style="{ background: `conic-gradient(#007bff ${timerProgress}deg, #e9ecef 0deg)` }"></div>
              <div class="timer-text">{{ Math.ceil(memorizeTimeLeft / 1000) }}</div>
            </div>
          </div>
        </div>

        <!-- 回答阶段 -->
        <div v-else-if="testStage === 'answer'" class="answer-stage">
          <!-- 顺序记忆 -->
          <div v-if="currentQuestion.type === 'sequence'" class="sequence-test">
            <div class="question-title">请按顺序选择刚才看到的单词</div>
            <div class="sequence-input">
              <div class="selected-words">
                <div 
                  v-for="(word, index) in userSequence" 
                  :key="index"
                  class="selected-word"
                >
                  {{ word }}
                  <button @click="removeFromSequence(index)" class="remove-btn">×</button>
                </div>
              </div>
              
              <div class="word-options">
                <button 
                  v-for="word in shuffledWords" 
                  :key="word"
                  @click="addToSequence(word)"
                  :disabled="userSequence.includes(word)"
                  class="word-option"
                  :class="{ 'disabled': userSequence.includes(word) }"
                >
                  {{ word }}
                </button>
              </div>
            </div>
          </div>

          <!-- 识别记忆 -->
          <div v-else-if="currentQuestion.type === 'recognition'" class="recognition-test">
            <div class="question-title">以下哪些单词刚才出现过？</div>
            <div class="recognition-options">
              <button 
                v-for="word in currentQuestion.options" 
                :key="word"
                @click="toggleRecognition(word)"
                class="recognition-option"
                :class="{ 'selected': recognitionAnswers.includes(word) }"
              >
                {{ word }}
              </button>
            </div>
          </div>

          <!-- 语义记忆 -->
          <div v-else-if="currentQuestion.type === 'semantic'" class="semantic-test">
            <div class="question-title">{{ currentQuestion.question }}</div>
            <div class="semantic-options">
              <button 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                @click="selectSemanticAnswer(option)"
                class="semantic-option"
                :class="{ 'selected': semanticAnswer === option }"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <div class="answer-actions">
            <button @click="submitAnswer" :disabled="!canSubmit" class="btn-submit">提交答案</button>
            <button @click="skipQuestion" class="btn-skip">跳过</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 反馈阶段 -->
    <div v-else-if="currentPhase === 'feedback'" class="feedback-phase fade-in">
      <div class="feedback-container">
        <div class="feedback-result" :class="{ 'correct': lastAnswerCorrect, 'incorrect': !lastAnswerCorrect }">
          <div class="feedback-icon">{{ lastAnswerCorrect ? '✅' : '❌' }}</div>
          <div class="feedback-title">{{ lastAnswerCorrect ? '回答正确！' : '回答错误' }}</div>
          
          <div class="answer-explanation">
            <div class="correct-answer">
              <span class="label">正确答案：</span>
              <span class="answer-display">{{ getCorrectAnswerDisplay() }}</span>
            </div>
            <div class="user-answer">
              <span class="label">您的答案：</span>
              <span class="answer-display">{{ getUserAnswerDisplay() }}</span>
            </div>
          </div>
          
          <div class="feedback-stats">
            <div class="stat-item">
              <span class="stat-label">用时：</span>
              <span class="stat-value">{{ formatTime(lastQuestionTime) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">准确率：</span>
              <span class="stat-value">{{ Math.round((correctAnswers / answeredQuestions) * 100) }}%</span>
            </div>
          </div>
        </div>
        
        <div class="feedback-actions">
          <button @click="nextQuestion" class="btn-next">继续</button>
        </div>
      </div>
    </div>

    <!-- 结果展示阶段 -->
    <div v-else-if="currentPhase === 'results'" class="results-phase fade-in">
      <div class="results-container">
        <div class="overall-results">
          <h2 class="results-title">单词记忆测试结果</h2>
          
          <div class="score-display">
            <div class="score-circle" :style="{ background: `conic-gradient(#007bff ${(totalScore / 100) * 360}deg, #e9ecef 0deg)` }">
              <div class="score-inner">
                <div class="score-number">{{ totalScore }}</div>
                <div class="score-label">总分</div>
              </div>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ Math.round(accuracy) }}%</div>
              <div class="stat-title">准确率</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ formatTime(averageTime) }}</div>
              <div class="stat-title">平均用时</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ answeredQuestions }}</div>
              <div class="stat-title">完成题数</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ wordMemoryScore }}</div>
              <div class="stat-title">记忆能力</div>
            </div>
          </div>
        </div>

        <!-- 详细分析 -->
        <div class="detailed-analysis">
          <h3 class="analysis-title">详细分析</h3>
          
          <!-- 测试类型表现 -->
          <div class="analysis-section">
            <h4 class="section-title">测试类型表现</h4>
            <div class="performance-grid">
              <div v-for="(performance, type) in typePerformance" :key="type" class="performance-item">
                <span class="performance-label">{{ getTypeLabel(type) }}</span>
                <span class="performance-value">{{ Math.round(performance.accuracy) }}% ({{ performance.correct }}/{{ performance.total }})</span>
              </div>
            </div>
          </div>
          
          <!-- 难度表现 -->
          <div class="analysis-section">
            <h4 class="section-title">难度表现</h4>
            <div class="performance-grid">
              <div v-for="(performance, difficulty) in difficultyPerformance" :key="difficulty" class="performance-item">
                <span class="performance-label">{{ getDifficultyLabel(difficulty) }}</span>
                <span class="performance-value">{{ Math.round(performance.accuracy) }}% ({{ performance.correct }}/{{ performance.total }})</span>
              </div>
            </div>
          </div>
          
          <!-- 记忆统计 -->
          <div class="analysis-section">
            <h4 class="section-title">记忆统计</h4>
            <div class="memory-stats">
              <div class="stats-row">
                <span class="stats-label">最佳表现</span>
                <span class="stats-value">{{ bestPerformance.type }} - {{ Math.round(bestPerformance.accuracy) }}%</span>
              </div>
              <div class="stats-row">
                <span class="stats-label">最快回答</span>
                <span class="stats-value">{{ formatTime(fastestTime) }}</span>
              </div>
              <div class="stats-row">
                <span class="stats-label">最慢回答</span>
                <span class="stats-value">{{ formatTime(slowestTime) }}</span>
              </div>
              <div class="stats-row">
                <span class="stats-label">连续正确</span>
                <span class="stats-value">{{ maxStreak }} 题</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 表现评价 -->
        <div class="performance-feedback">
          <h3 class="analysis-title">表现评价与改进建议</h3>
          <div class="feedback-content">
            <p class="evaluation-text">{{ getPerformanceEvaluation() }}</p>
            <ul class="suggestions-list">
              <li v-for="suggestion in getImprovementSuggestions()" :key="suggestion" class="suggestion-item">
                {{ suggestion }}
              </li>
            </ul>
          </div>
        </div>
        
        <div class="results-actions">
          <button @click="$emit('restart')" class="btn-primary">重新测试</button>
          <button @click="$emit('export')" class="btn-secondary">导出报告</button>
          <router-link to="/training/memory" class="btn-secondary">开始训练</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WordMemoryTest',
  emits: ['complete', 'restart', 'export'],
  data() {
    return {
      currentPhase: 'instruction', // instruction, testing, feedback, results
      testStage: 'memorize', // memorize, answer
      
      // 测试设置
      settings: {
        difficulty: 'medium',
        testType: 'mixed',
        displayTime: 3,
        questionCount: 15
      },
      
      // 测试状态
      currentQuestionIndex: 0,
      questions: [],
      currentQuestion: null,
      
      // 计时相关
      startTime: null,
      elapsedTime: 0,
      timer: null,
      memorizeTimer: null,
      memorizeTimeLeft: 0,
      lastQuestionTime: 0,
      
      // 记忆阶段
      highlightIndex: -1,
      
      // 答题相关
      userSequence: [],
      recognitionAnswers: [],
      semanticAnswer: null,
      
      // 结果统计
      answers: [],
      correctAnswers: 0,
      answeredQuestions: 0,
      lastAnswerCorrect: false,
      
      // 单词库
      wordBank: {
        easy: ['苹果', '香蕉', '橙子', '葡萄', '草莓', '桃子', '梨子', '西瓜', '猫咪', '小狗', '兔子', '鸟儿', '鱼儿', '花朵', '树木', '太阳', '月亮', '星星', '房子', '汽车'],
        medium: ['计算机', '键盘', '鼠标', '显示器', '音响', '摄像头', '打印机', '扫描仪', '路由器', '手机', '平板', '耳机', '充电器', '数据线', '移动硬盘', '内存卡', '光盘', '软件', '系统', '网络'],
        hard: ['哲学', '心理学', '社会学', '人类学', '考古学', '历史学', '政治学', '经济学', '法学', '教育学', '文学', '语言学', '新闻学', '艺术学', '音乐学', '美术学', '建筑学', '设计学', '医学', '生物学'],
        expert: ['量子力学', '相对论', '热力学', '电磁学', '光学', '声学', '流体力学', '固体力学', '材料科学', '纳米技术', '生物技术', '基因工程', '人工智能', '机器学习', '深度学习', '神经网络', '算法设计', '数据结构', '操作系统', '数据库']
      }
    }
  },
  
  computed: {
    totalQuestions() {
      return parseInt(this.settings.questionCount)
    },
    
    progressPercentage() {
      return (this.currentQuestionIndex / this.totalQuestions) * 100
    },
    
    timerProgress() {
      const totalTime = this.getMemorizeTime()
      return ((totalTime - this.memorizeTimeLeft) / totalTime) * 360
    },
    
    shuffledWords() {
      if (!this.currentQuestion) return []
      return [...this.currentQuestion.words, ...this.currentQuestion.distractors].sort(() => Math.random() - 0.5)
    },
    
    canSubmit() {
      if (this.currentQuestion?.type === 'sequence') {
        return this.userSequence.length === this.currentQuestion.words.length
      } else if (this.currentQuestion?.type === 'recognition') {
        return this.recognitionAnswers.length > 0
      } else if (this.currentQuestion?.type === 'semantic') {
        return this.semanticAnswer !== null
      }
      return false
    },
    
    // 结果计算
    accuracy() {
      return this.answeredQuestions > 0 ? (this.correctAnswers / this.answeredQuestions) * 100 : 0
    },
    
    averageTime() {
      if (this.answers.length === 0) return 0
      const totalTime = this.answers.reduce((sum, answer) => sum + answer.time, 0)
      return totalTime / this.answers.length
    },
    
    totalScore() {
      return Math.round(this.accuracy * 0.7 + this.getSpeedScore() * 0.3)
    },
    
    wordMemoryScore() {
      return Math.round(this.accuracy * 0.8 + this.getConsistencyScore() * 0.2)
    },
    
    typePerformance() {
      const performance = {}
      this.answers.forEach(answer => {
        if (!performance[answer.type]) {
          performance[answer.type] = { correct: 0, total: 0 }
        }
        performance[answer.type].total++
        if (answer.correct) {
          performance[answer.type].correct++
        }
      })
      
      Object.keys(performance).forEach(type => {
        performance[type].accuracy = (performance[type].correct / performance[type].total) * 100
      })
      
      return performance
    },
    
    difficultyPerformance() {
      const performance = {}
      this.answers.forEach(answer => {
        const difficulty = answer.difficulty || this.settings.difficulty
        if (!performance[difficulty]) {
          performance[difficulty] = { correct: 0, total: 0 }
        }
        performance[difficulty].total++
        if (answer.correct) {
          performance[difficulty].correct++
        }
      })
      
      Object.keys(performance).forEach(difficulty => {
        performance[difficulty].accuracy = (performance[difficulty].correct / performance[difficulty].total) * 100
      })
      
      return performance
    },
    
    bestPerformance() {
      let best = { type: '', accuracy: 0 }
      Object.entries(this.typePerformance).forEach(([type, perf]) => {
        if (perf.accuracy > best.accuracy) {
          best = { type: this.getTypeLabel(type), accuracy: perf.accuracy }
        }
      })
      return best
    },
    
    fastestTime() {
      return this.answers.length > 0 ? Math.min(...this.answers.map(a => a.time)) : 0
    },
    
    slowestTime() {
      return this.answers.length > 0 ? Math.max(...this.answers.map(a => a.time)) : 0
    },
    
    maxStreak() {
      let maxStreak = 0
      let currentStreak = 0
      
      this.answers.forEach(answer => {
        if (answer.correct) {
          currentStreak++
          maxStreak = Math.max(maxStreak, currentStreak)
        } else {
          currentStreak = 0
        }
      })
      
      return maxStreak
    }
  },
  
  methods: {
    startTest() {
      this.currentPhase = 'testing'
      this.generateQuestions()
      this.startQuestion()
      this.startTimer()
    },
    
    generateQuestions() {
      this.questions = []
      const questionCount = this.totalQuestions
      
      for (let i = 0; i < questionCount; i++) {
        const question = this.generateQuestion()
        this.questions.push(question)
      }
    },
    
    generateQuestion() {
      const types = this.settings.testType === 'mixed' 
        ? ['sequence', 'recognition', 'semantic']
        : [this.settings.testType]
      
      const type = types[Math.floor(Math.random() * types.length)]
      const difficulty = this.settings.difficulty
      const wordCount = this.getWordCount(difficulty)
      
      const words = this.getRandomWords(wordCount, difficulty)
      
      if (type === 'sequence') {
        return this.generateSequenceQuestion(words, difficulty)
      } else if (type === 'recognition') {
        return this.generateRecognitionQuestion(words, difficulty)
      } else if (type === 'semantic') {
        return this.generateSemanticQuestion(words, difficulty)
      }
    },
    
    generateSequenceQuestion(words, difficulty) {
      const distractors = this.getRandomWords(Math.ceil(words.length / 2), difficulty, words)
      
      return {
        type: 'sequence',
        words: words,
        distractors: distractors,
        difficulty: difficulty,
        correctAnswer: words
      }
    },
    
    generateRecognitionQuestion(words, difficulty) {
      const distractors = this.getRandomWords(words.length, difficulty, words)
      const options = [...words, ...distractors].sort(() => Math.random() - 0.5)
      
      return {
        type: 'recognition',
        words: words,
        options: options,
        difficulty: difficulty,
        correctAnswer: words
      }
    },
    
    generateSemanticQuestion(words, difficulty) {
      const targetWord = words[Math.floor(Math.random() * words.length)]
      const category = this.getWordCategory(targetWord)
      const options = this.getRandomWords(3, difficulty, [targetWord])
      options.push(targetWord)
      options.sort(() => Math.random() - 0.5)
      
      return {
        type: 'semantic',
        words: words,
        question: `刚才的单词中，哪个属于"${category}"类别？`,
        options: options,
        difficulty: difficulty,
        correctAnswer: targetWord
      }
    },
    
    getWordCount(difficulty) {
      const counts = {
        easy: Math.floor(Math.random() * 4) + 5,    // 5-8
        medium: Math.floor(Math.random() * 5) + 8,  // 8-12
        hard: Math.floor(Math.random() * 5) + 12,   // 12-16
        expert: Math.floor(Math.random() * 5) + 16  // 16-20
      }
      return counts[difficulty] || 8
    },
    
    getRandomWords(count, difficulty, exclude = []) {
      const words = this.wordBank[difficulty] || this.wordBank.medium
      const available = words.filter(word => !exclude.includes(word))
      
      const selected = []
      for (let i = 0; i < count && i < available.length; i++) {
        const randomIndex = Math.floor(Math.random() * available.length)
        const word = available.splice(randomIndex, 1)[0]
        selected.push(word)
      }
      
      return selected
    },
    
    getWordCategory(word) {
      const categories = {
        '苹果': '水果', '香蕉': '水果', '橙子': '水果', '葡萄': '水果', '草莓': '水果',
        '猫咪': '动物', '小狗': '动物', '兔子': '动物', '鸟儿': '动物', '鱼儿': '动物',
        '计算机': '电子设备', '键盘': '电子设备', '鼠标': '电子设备', '显示器': '电子设备',
        '哲学': '学科', '心理学': '学科', '社会学': '学科', '人类学': '学科'
      }
      return categories[word] || '其他'
    },
    
    startQuestion() {
      if (this.currentQuestionIndex >= this.totalQuestions) {
        this.finishTest()
        return
      }
      
      this.currentQuestion = this.questions[this.currentQuestionIndex]
      this.testStage = 'memorize'
      this.userSequence = []
      this.recognitionAnswers = []
      this.semanticAnswer = null
      this.highlightIndex = -1
      
      this.startMemorizePhase()
    },
    
    startMemorizePhase() {
      const memorizeTime = this.getMemorizeTime()
      this.memorizeTimeLeft = memorizeTime
      
      // 高亮显示单词
      let wordIndex = 0
      const highlightInterval = memorizeTime / this.currentQuestion.words.length
      
      const highlightTimer = setInterval(() => {
        this.highlightIndex = wordIndex
        wordIndex++
        
        if (wordIndex >= this.currentQuestion.words.length) {
          clearInterval(highlightTimer)
          this.highlightIndex = -1
        }
      }, highlightInterval)
      
      // 记忆倒计时
      this.memorizeTimer = setInterval(() => {
        this.memorizeTimeLeft -= 100
        
        if (this.memorizeTimeLeft <= 0) {
          clearInterval(this.memorizeTimer)
          this.testStage = 'answer'
          this.lastQuestionTime = Date.now()
        }
      }, 100)
    },
    
    getMemorizeTime() {
      return this.currentQuestion.words.length * this.settings.displayTime * 1000
    },
    
    // 顺序记忆相关方法
    addToSequence(word) {
      if (!this.userSequence.includes(word)) {
        this.userSequence.push(word)
      }
    },
    
    removeFromSequence(index) {
      this.userSequence.splice(index, 1)
    },
    
    // 识别记忆相关方法
    toggleRecognition(word) {
      const index = this.recognitionAnswers.indexOf(word)
      if (index > -1) {
        this.recognitionAnswers.splice(index, 1)
      } else {
        this.recognitionAnswers.push(word)
      }
    },
    
    // 语义记忆相关方法
    selectSemanticAnswer(option) {
      this.semanticAnswer = option
    },
    
    submitAnswer() {
      const questionTime = Date.now() - this.lastQuestionTime
      const correct = this.checkAnswer()
      
      this.answers.push({
        questionIndex: this.currentQuestionIndex,
        type: this.currentQuestion.type,
        difficulty: this.currentQuestion.difficulty,
        correct: correct,
        time: questionTime,
        userAnswer: this.getUserAnswer(),
        correctAnswer: this.currentQuestion.correctAnswer
      })
      
      this.answeredQuestions++
      if (correct) {
        this.correctAnswers++
      }
      
      this.lastAnswerCorrect = correct
      this.lastQuestionTime = questionTime
      this.currentPhase = 'feedback'
    },
    
    checkAnswer() {
      if (this.currentQuestion.type === 'sequence') {
        return JSON.stringify(this.userSequence) === JSON.stringify(this.currentQuestion.words)
      } else if (this.currentQuestion.type === 'recognition') {
        const correct = this.currentQuestion.words.sort()
        const user = this.recognitionAnswers.sort()
        return JSON.stringify(correct) === JSON.stringify(user)
      } else if (this.currentQuestion.type === 'semantic') {
        return this.semanticAnswer === this.currentQuestion.correctAnswer
      }
      return false
    },
    
    getUserAnswer() {
      if (this.currentQuestion.type === 'sequence') {
        return this.userSequence
      } else if (this.currentQuestion.type === 'recognition') {
        return this.recognitionAnswers
      } else if (this.currentQuestion.type === 'semantic') {
        return this.semanticAnswer
      }
      return null
    },
    
    skipQuestion() {
      this.answers.push({
        questionIndex: this.currentQuestionIndex,
        type: this.currentQuestion.type,
        difficulty: this.currentQuestion.difficulty,
        correct: false,
        time: Date.now() - this.lastQuestionTime,
        userAnswer: null,
        correctAnswer: this.currentQuestion.correctAnswer,
        skipped: true
      })
      
      this.answeredQuestions++
      this.nextQuestion()
    },
    
    nextQuestion() {
      this.currentQuestionIndex++
      this.currentPhase = 'testing'
      this.startQuestion()
    },
    
    finishTest() {
      this.currentPhase = 'results'
      this.stopTimer()
      this.$emit('complete', {
        score: this.totalScore,
        accuracy: this.accuracy,
        averageTime: this.averageTime,
        answers: this.answers
      })
    },
    
    startTimer() {
      this.startTime = Date.now()
      this.timer = setInterval(() => {
        this.elapsedTime = Date.now() - this.startTime
      }, 100)
    },
    
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      if (this.memorizeTimer) {
        clearInterval(this.memorizeTimer)
        this.memorizeTimer = null
      }
    },
    
    formatTime(ms) {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    
    // 结果显示相关方法
    getCorrectAnswerDisplay() {
      if (this.currentQuestion.type === 'sequence') {
        return this.currentQuestion.words.join(' → ')
      } else if (this.currentQuestion.type === 'recognition') {
        return this.currentQuestion.words.join(', ')
      } else if (this.currentQuestion.type === 'semantic') {
        return this.currentQuestion.correctAnswer
      }
      return ''
    },
    
    getUserAnswerDisplay() {
      const userAnswer = this.getUserAnswer()
      if (this.currentQuestion.type === 'sequence') {
        return userAnswer ? userAnswer.join(' → ') : '未回答'
      } else if (this.currentQuestion.type === 'recognition') {
        return userAnswer ? userAnswer.join(', ') : '未回答'
      } else if (this.currentQuestion.type === 'semantic') {
        return userAnswer || '未回答'
      }
      return '未回答'
    },
    
    getTypeLabel(type) {
      const labels = {
        sequence: '顺序记忆',
        recognition: '识别记忆',
        semantic: '语义记忆'
      }
      return labels[type] || type
    },
    
    getDifficultyLabel(difficulty) {
      const labels = {
        easy: '简单',
        medium: '中等',
        hard: '困难',
        expert: '专家'
      }
      return labels[difficulty] || difficulty
    },
    
    getSpeedScore() {
      if (this.answers.length === 0) return 0
      const avgTime = this.averageTime
      const baseTime = 5000 // 5秒基准
      return Math.max(0, Math.min(100, 100 - (avgTime - baseTime) / 100))
    },
    
    getConsistencyScore() {
      if (this.answers.length < 3) return 100
      
      const times = this.answers.map(a => a.time)
      const mean = times.reduce((sum, time) => sum + time, 0) / times.length
      const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length
      const stdDev = Math.sqrt(variance)
      
      return Math.max(0, 100 - (stdDev / mean) * 100)
    },
    
    getPerformanceEvaluation() {
      const score = this.totalScore
      
      if (score >= 90) {
        return '优秀！您的单词记忆能力非常出色，在各种记忆任务中都表现优异。继续保持这种水平，可以尝试更高难度的挑战。'
      } else if (score >= 80) {
        return '良好！您的单词记忆能力较强，在大部分记忆任务中表现良好。通过针对性训练可以进一步提升。'
      } else if (score >= 70) {
        return '中等！您的单词记忆能力处于平均水平，还有较大的提升空间。建议加强记忆策略的学习和练习。'
      } else if (score >= 60) {
        return '需要改进！您的单词记忆能力有待提升，建议从基础的记忆技巧开始练习，逐步提高。'
      } else {
        return '需要加强！建议从简单的记忆任务开始，掌握基本的记忆方法，循序渐进地提升记忆能力。'
      }
    },
    
    getImprovementSuggestions() {
      const suggestions = []
      
      // 基于准确率的建议
      if (this.accuracy < 70) {
        suggestions.push('练习基础的记忆技巧，如联想记忆、分组记忆等')
        suggestions.push('从较少的单词数量开始练习，逐步增加难度')
      }
      
      // 基于速度的建议
      if (this.averageTime > 8000) {
        suggestions.push('提高反应速度，可以通过快速阅读训练来改善')
        suggestions.push('练习快速识别和回忆，减少犹豫时间')
      }
      
      // 基于类型表现的建议
      Object.entries(this.typePerformance).forEach(([type, perf]) => {
        if (perf.accuracy < 60) {
          if (type === 'sequence') {
            suggestions.push('加强顺序记忆训练，可以使用数字编码或故事链接法')
          } else if (type === 'recognition') {
            suggestions.push('提高识别记忆能力，多练习区分相似单词')
          } else if (type === 'semantic') {
            suggestions.push('加强语义记忆，多了解单词的含义和分类')
          }
        }
      })
      
      // 通用建议
      suggestions.push('保持规律的练习，每天进行短时间的记忆训练')
      suggestions.push('注意休息，避免疲劳对记忆能力的影响')
      
      return suggestions.slice(0, 5) // 最多返回5条建议
    }
  },
  
  beforeUnmount() {
    this.stopTimer()
  }
}
</script>

<style scoped>
/* 基础样式 */
.word-memory-test {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* 说明阶段样式 */
.instruction-phase {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.instruction-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.instruction-title {
  text-align: center;
  font-size: 2.5em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 30px;
}

.instruction-content {
  margin-bottom: 40px;
}

.test-description h3 {
  color: #007bff;
  font-size: 1.3em;
  margin-bottom: 15px;
  margin-top: 25px;
}

.test-description p,
.test-description ol {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 20px;
}

.test-description ol {
  padding-left: 20px;
}

.test-settings {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  margin-top: 30px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
}

.setting-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.setting-select {
  padding: 10px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1em;
  background: white;
  transition: border-color 0.3s ease;
}

.setting-select:focus {
  outline: none;
  border-color: #007bff;
}

.instruction-actions {
  text-align: center;
}

.btn-start {
  background: #007bff;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2em;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-start:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

/* 测试阶段样式 */
.testing-phase {
  max-width: 1200px;
  margin: 0 auto;
}

.test-container {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.progress-info {
  flex: 1;
  min-width: 200px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  color: #495057;
}

.test-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  padding: 10px 15px;
  border-radius: 8px;
}

.stat-icon {
  font-size: 1.2em;
}

.stat-value {
  font-weight: 600;
  color: #495057;
}

/* 记忆阶段样式 */
.memorize-stage {
  text-align: center;
}

.stage-title {
  font-size: 1.5em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 30px;
}

.word-display {
  margin-bottom: 40px;
}

.word-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.word-item {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 15px 20px;
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
  transition: all 0.3s ease;
}

.word-item.highlight {
  background: #007bff;
  color: white;
  border-color: #007bff;
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.memorize-timer {
  display: flex;
  justify-content: center;
}

.timer-circle {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: background 0.1s linear;
}

.timer-text {
  position: relative;
  z-index: 1;
  font-size: 1.8em;
  font-weight: 600;
  color: #495057;
}

/* 答题阶段样式 */
.answer-stage {
  text-align: center;
}

.question-title {
  font-size: 1.3em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 30px;
}

/* 顺序记忆样式 */
.sequence-test {
  margin-bottom: 30px;
}

.sequence-input {
  max-width: 800px;
  margin: 0 auto;
}

.selected-words {
  min-height: 60px;
  background: #f8f9fa;
  border: 2px dashed #007bff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.selected-word {
  background: #007bff;
  color: white;
  padding: 8px 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.remove-btn {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
}

.remove-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.word-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.word-option {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.word-option:hover:not(.disabled) {
  border-color: #007bff;
  background: #e3f2fd;
}

.word-option.disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 识别记忆样式 */
.recognition-test {
  margin-bottom: 30px;
}

.recognition-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
}

.recognition-option {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.recognition-option:hover {
  border-color: #007bff;
  background: #e3f2fd;
}

.recognition-option.selected {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* 语义记忆样式 */
.semantic-test {
  margin-bottom: 30px;
}

.semantic-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.semantic-option {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.semantic-option:hover {
  border-color: #007bff;
  background: #e3f2fd;
}

.semantic-option.selected {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* 答题操作样式 */
.answer-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-submit,
.btn-skip {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit {
  background: #007bff;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #0056b3;
}

.btn-submit:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-skip {
  background: #6c757d;
  color: white;
}

.btn-skip:hover {
  background: #545b62;
}

/* 反馈阶段样式 */
.feedback-phase {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.feedback-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.feedback-result {
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.feedback-result.correct {
  background: #d4edda;
  border: 2px solid #28a745;
}

.feedback-result.incorrect {
  background: #f8d7da;
  border: 2px solid #dc3545;
}

.feedback-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.feedback-title {
  font-size: 1.5em;
  font-weight: 600;
  margin-bottom: 20px;
  color: #495057;
}

.answer-explanation {
  margin-bottom: 25px;
  text-align: left;
}

.correct-answer,
.user-answer {
  margin-bottom: 15px;
}

.label {
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 5px;
}

.answer-display {
  font-size: 1.1em;
  color: #007bff;
  font-weight: 600;
}

.feedback-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.feedback-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: #6c757d;
}

.feedback-actions {
  text-align: center;
}

.btn-next {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 25px;
  font-size: 1em;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-next:hover {
  background: #1e7e34;
}

/* 结果展示样式 */
.results-phase {
  max-width: 1200px;
  margin: 0 auto;
}

.results-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.overall-results {
  text-align: center;
  margin-bottom: 40px;
}

.results-title {
  font-size: 2.5em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 30px;
}

.score-display {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
}

.score-circle {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-inner {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.score-number {
  font-size: 3em;
  font-weight: 600;
  color: #007bff;
}

.score-label {
  font-size: 1em;
  color: #6c757d;
  margin-top: 5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
}

.stat-number {
  font-size: 2em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 10px;
}

.stat-title {
  color: #6c757d;
  font-size: 1em;
}

/* 详细分析样式 */
.detailed-analysis {
  margin-bottom: 40px;
}

.analysis-title {
  font-size: 1.8em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 30px;
  text-align: center;
}

.analysis-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.3em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 20px;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.performance-item {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.performance-label {
  color: #495057;
  font-weight: 500;
}

.performance-value {
  font-weight: 600;
  color: #007bff;
}

.memory-stats {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.stats-row:last-child {
  border-bottom: none;
}

.stats-label {
  color: #6c757d;
}

.stats-value {
  font-weight: 600;
  color: #495057;
}

/* 表现评价样式 */
.performance-feedback {
  margin-bottom: 40px;
}

.feedback-content {
  text-align: left;
}

.evaluation-text {
  font-size: 1.1em;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 20px;
}

.suggestions-list {
  list-style: none;
  padding: 0;
}

.suggestion-item {
  background: #e3f2fd;
  border-left: 4px solid #007bff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 0 8px 8px 0;
}

.suggestion-item:last-child {
  margin-bottom: 0;
}

/* 操作按钮样式 */
.results-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 30px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .instruction-container,
  .test-container,
  .feedback-container,
  .results-container {
    padding: 20px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .test-header {
    flex-direction: column;
    align-items: stretch;
  }

  .test-stats {
    justify-content: center;
  }

  .word-list {
    gap: 10px;
  }

  .word-item {
    padding: 10px 15px;
    font-size: 1em;
  }

  .word-options {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .recognition-options,
  .semantic-options {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .performance-grid {
    grid-template-columns: 1fr;
  }

  .results-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-primary,
  .btn-secondary {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .instruction-title {
    font-size: 2em;
  }

  .results-title {
    font-size: 2em;
  }

  .score-circle {
    width: 150px;
    height: 150px;
  }

  .score-inner {
    width: 120px;
    height: 120px;
  }

  .score-number {
    font-size: 2.5em;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .word-options {
    grid-template-columns: 1fr;
  }

  .timer-circle {
    width: 100px;
    height: 100px;
  }

  .timer-text {
    font-size: 1.5em;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.slide-in {
  animation: slideIn 0.5s ease-out;
}

.scale-in {
  animation: scaleIn 0.3s ease-out;
}

/* 主题变量 */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --border-color: #e9ecef;
  --text-color: #495057;
  --muted-color: #6c757d;
}
</style>