<template>
  <div class="sequence-memory-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase fade-in">
      <div class="instruction-container">
        <h2 class="instruction-title">序列记忆测试</h2>
        <div class="instruction-content">
          <div class="test-description">
            <h3>测试目标</h3>
            <p>评估您的序列记忆能力，包括顺序记忆、模式识别和序列重现等方面。</p>
            
            <h3>测试步骤</h3>
            <ol>
              <li>根据您的需求调整测试设置</li>
              <li>仔细观察显示的序列模式</li>
              <li>在规定时间内记住序列的顺序</li>
              <li>根据要求重现或识别序列</li>
              <li>查看详细的测试结果和分析</li>
            </ol>
          </div>
          
          <div class="test-settings">
            <div class="settings-grid">
              <div class="setting-item">
                <label class="setting-label">难度等级</label>
                <select v-model="settings.difficulty" class="setting-select">
                  <option value="easy">简单 (3-5个元素)</option>
                  <option value="medium">中等 (5-7个元素)</option>
                  <option value="hard">困难 (7-9个元素)</option>
                  <option value="expert">专家 (9-12个元素)</option>
                </select>
              </div>
              
              <div class="setting-item">
                <label class="setting-label">序列类型</label>
                <select v-model="settings.sequenceType" class="setting-select">
                  <option value="color">颜色序列</option>
                  <option value="number">数字序列</option>
                  <option value="shape">形状序列</option>
                  <option value="mixed">混合模式</option>
                </select>
              </div>
              
              <div class="setting-item">
                <label class="setting-label">显示速度</label>
                <select v-model="settings.displaySpeed" class="setting-select">
                  <option value="slow">慢速 (1.5秒/元素)</option>
                  <option value="medium">中速 (1秒/元素)</option>
                  <option value="fast">快速 (0.7秒/元素)</option>
                  <option value="very-fast">极快 (0.5秒/元素)</option>
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

        <!-- 序列展示阶段 -->
        <div v-if="testStage === 'display'" class="display-stage">
          <div class="stage-title">请记住以下序列</div>
          <div class="sequence-display">
            <div class="sequence-container">
              <div 
                v-for="(item, index) in currentQuestion.sequence" 
                :key="index"
                class="sequence-item"
                :class="{ 
                  'active': index === activeIndex,
                  'completed': index < activeIndex,
                  [item.type]: true 
                }"
                :style="getItemStyle(item)"
              >
                <div v-if="item.type === 'color'" class="color-item" :style="{ backgroundColor: item.value }"></div>
                <div v-else-if="item.type === 'number'" class="number-item">{{ item.value }}</div>
                <div v-else-if="item.type === 'shape'" class="shape-item">
                  <div class="shape" :class="item.value"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="display-timer">
            <div class="timer-circle">
              <div class="timer-fill" :style="{ background: `conic-gradient(#007bff ${timerProgress}deg, #e9ecef 0deg)` }"></div>
              <div class="timer-text">{{ Math.ceil(displayTimeLeft / 1000) }}</div>
            </div>
          </div>
        </div>

        <!-- 回答阶段 -->
        <div v-else-if="testStage === 'answer'" class="answer-stage">
          <div class="question-title">请按顺序重现刚才看到的序列</div>
          
          <!-- 用户选择的序列 -->
          <div class="user-sequence">
            <div class="sequence-title">您的选择：</div>
            <div class="selected-sequence">
              <div 
                v-for="(item, index) in userSequence" 
                :key="index"
                class="selected-item"
                :class="item.type"
                :style="getItemStyle(item)"
                @click="removeFromSequence(index)"
              >
                <div v-if="item.type === 'color'" class="color-item" :style="{ backgroundColor: item.value }"></div>
                <div v-else-if="item.type === 'number'" class="number-item">{{ item.value }}</div>
                <div v-else-if="item.type === 'shape'" class="shape-item">
                  <div class="shape" :class="item.value"></div>
                </div>
                <button class="remove-btn">×</button>
              </div>
            </div>
          </div>
          
          <!-- 选项区域 -->
          <div class="options-area">
            <div class="options-title">可选项：</div>
            <div class="sequence-options">
              <div 
                v-for="(item, index) in shuffledOptions" 
                :key="index"
                class="option-item"
                :class="{ 
                  'disabled': isItemSelected(item),
                  [item.type]: true 
                }"
                :style="getItemStyle(item)"
                @click="addToSequence(item)"
              >
                <div v-if="item.type === 'color'" class="color-item" :style="{ backgroundColor: item.value }"></div>
                <div v-else-if="item.type === 'number'" class="number-item">{{ item.value }}</div>
                <div v-else-if="item.type === 'shape'" class="shape-item">
                  <div class="shape" :class="item.value"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="answer-actions">
            <button @click="submitAnswer" :disabled="!canSubmit" class="btn-submit">提交答案</button>
            <button @click="skipQuestion" class="btn-skip">跳过</button>
            <button @click="clearSequence" class="btn-clear">清空</button>
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
          
          <div class="sequence-comparison">
            <div class="correct-sequence">
              <span class="label">正确序列：</span>
              <div class="sequence-display-small">
                <div 
                  v-for="(item, index) in currentQuestion.sequence" 
                  :key="index"
                  class="sequence-item-small"
                  :class="item.type"
                  :style="getItemStyle(item)"
                >
                  <div v-if="item.type === 'color'" class="color-item-small" :style="{ backgroundColor: item.value }"></div>
                  <div v-else-if="item.type === 'number'" class="number-item-small">{{ item.value }}</div>
                  <div v-else-if="item.type === 'shape'" class="shape-item-small">
                    <div class="shape-small" :class="item.value"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="user-sequence-feedback">
              <span class="label">您的答案：</span>
              <div class="sequence-display-small">
                <div 
                  v-for="(item, index) in userSequence" 
                  :key="index"
                  class="sequence-item-small"
                  :class="{ 
                    'correct': isItemCorrect(item, index),
                    'incorrect': !isItemCorrect(item, index),
                    [item.type]: true 
                  }"
                  :style="getItemStyle(item)"
                >
                  <div v-if="item.type === 'color'" class="color-item-small" :style="{ backgroundColor: item.value }"></div>
                  <div v-else-if="item.type === 'number'" class="number-item-small">{{ item.value }}</div>
                  <div v-else-if="item.type === 'shape'" class="shape-item-small">
                    <div class="shape-small" :class="item.value"></div>
                  </div>
                </div>
              </div>
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
            <div class="stat-item">
              <span class="stat-label">序列长度：</span>
              <span class="stat-value">{{ currentQuestion.sequence.length }}</span>
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
          <h2 class="results-title">序列记忆测试结果</h2>
          
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
              <div class="stat-number">{{ sequenceMemoryScore }}</div>
              <div class="stat-title">序列记忆</div>
            </div>
          </div>
        </div>

        <!-- 详细分析 -->
        <div class="detailed-analysis">
          <h3 class="analysis-title">详细分析</h3>
          
          <!-- 序列类型表现 -->
          <div class="analysis-section">
            <h4 class="section-title">序列类型表现</h4>
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
          
          <!-- 序列长度表现 -->
          <div class="analysis-section">
            <h4 class="section-title">序列长度表现</h4>
            <div class="performance-grid">
              <div v-for="(performance, length) in lengthPerformance" :key="length" class="performance-item">
                <span class="performance-label">{{ length }}个元素</span>
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
              <div class="stats-row">
                <span class="stats-label">平均序列长度</span>
                <span class="stats-value">{{ averageSequenceLength.toFixed(1) }} 个元素</span>
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
  name: 'SequenceMemoryTest',
  emits: ['complete', 'restart', 'export'],
  data() {
    return {
      currentPhase: 'instruction', // instruction, testing, feedback, results
      testStage: 'display', // display, answer
      
      // 测试设置
      settings: {
        difficulty: 'medium',
        sequenceType: 'mixed',
        displaySpeed: 'medium',
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
      displayTimer: null,
      displayTimeLeft: 0,
      lastQuestionTime: 0,
      
      // 显示阶段
      activeIndex: -1,
      
      // 答题相关
      userSequence: [],
      shuffledOptions: [],
      
      // 结果统计
      answers: [],
      correctAnswers: 0,
      answeredQuestions: 0,
      lastAnswerCorrect: false,
      
      // 序列元素库
      elementBank: {
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'],
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        shapes: ['circle', 'square', 'triangle', 'diamond', 'star', 'heart', 'hexagon', 'pentagon']
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
      const totalTime = this.getDisplayTime()
      return ((totalTime - this.displayTimeLeft) / totalTime) * 360
    },
    
    canSubmit() {
      return this.userSequence.length === this.currentQuestion.sequence.length
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
      return Math.round(this.accuracy * 0.7 + this.getSpeedScore() * 0.2 + this.getConsistencyScore() * 0.1)
    },
    
    sequenceMemoryScore() {
      return Math.round(this.accuracy * 0.8 + this.getLengthScore() * 0.2)
    },
    
    typePerformance() {
      const performance = {}
      this.answers.forEach(answer => {
        const type = answer.sequenceType
        if (!performance[type]) {
          performance[type] = { correct: 0, total: 0 }
        }
        performance[type].total++
        if (answer.correct) {
          performance[type].correct++
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
        const difficulty = answer.difficulty
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
    
    lengthPerformance() {
      const performance = {}
      this.answers.forEach(answer => {
        const length = answer.sequenceLength
        if (!performance[length]) {
          performance[length] = { correct: 0, total: 0 }
        }
        performance[length].total++
        if (answer.correct) {
          performance[length].correct++
        }
      })
      
      Object.keys(performance).forEach(length => {
        performance[length].accuracy = (performance[length].correct / performance[length].total) * 100
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
    },
    
    averageSequenceLength() {
      if (this.answers.length === 0) return 0
      const totalLength = this.answers.reduce((sum, answer) => sum + answer.sequenceLength, 0)
      return totalLength / this.answers.length
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
      const types = this.settings.sequenceType === 'mixed' 
        ? ['color', 'number', 'shape']
        : [this.settings.sequenceType]
      
      const type = types[Math.floor(Math.random() * types.length)]
      const difficulty = this.settings.difficulty
      const sequenceLength = this.getSequenceLength(difficulty)
      
      const sequence = this.generateSequence(type, sequenceLength)
      const distractors = this.generateDistractors(type, sequence)
      
      return {
        sequence: sequence,
        distractors: distractors,
        type: type,
        difficulty: difficulty,
        length: sequenceLength
      }
    },
    
    getSequenceLength(difficulty) {
      const lengths = {
        easy: Math.floor(Math.random() * 3) + 3,    // 3-5
        medium: Math.floor(Math.random() * 3) + 5,  // 5-7
        hard: Math.floor(Math.random() * 3) + 7,    // 7-9
        expert: Math.floor(Math.random() * 4) + 9   // 9-12
      }
      return lengths[difficulty] || 5
    },
    
    generateSequence(type, length) {
      const sequence = []
      const available = [...this.elementBank[type + 's']]
      
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * available.length)
        const value = available[randomIndex]
        
        sequence.push({
          type: type,
          value: value,
          id: `${type}_${value}_${i}`
        })
        
        // 移除已选择的元素，避免重复
        available.splice(randomIndex, 1)
        
        // 如果可用元素用完了，重新填充
        if (available.length === 0) {
          available.push(...this.elementBank[type + 's'])
        }
      }
      
      return sequence
    },
    
    generateDistractors(type, sequence) {
      const distractors = []
      const sequenceValues = sequence.map(item => item.value)
      const available = this.elementBank[type + 's'].filter(value => !sequenceValues.includes(value))
      
      const distractorCount = Math.min(sequence.length, available.length)
      
      for (let i = 0; i < distractorCount; i++) {
        const randomIndex = Math.floor(Math.random() * available.length)
        const value = available.splice(randomIndex, 1)[0]
        
        distractors.push({
          type: type,
          value: value,
          id: `${type}_${value}_distractor_${i}`
        })
      }
      
      return distractors
    },
    
    startQuestion() {
      if (this.currentQuestionIndex >= this.totalQuestions) {
        this.finishTest()
        return
      }
      
      this.currentQuestion = this.questions[this.currentQuestionIndex]
      this.testStage = 'display'
      this.userSequence = []
      this.activeIndex = -1
      
      this.startDisplayPhase()
    },
    
    startDisplayPhase() {
      const displayTime = this.getDisplayTime()
      this.displayTimeLeft = displayTime
      
      // 逐个显示序列元素
      let itemIndex = 0
      const itemDisplayTime = this.getItemDisplayTime()
      
      const displayInterval = setInterval(() => {
        this.activeIndex = itemIndex
        itemIndex++
        
        if (itemIndex > this.currentQuestion.sequence.length) {
          clearInterval(displayInterval)
          this.activeIndex = -1
        }
      }, itemDisplayTime)
      
      // 总体倒计时
      this.displayTimer = setInterval(() => {
        this.displayTimeLeft -= 100
        
        if (this.displayTimeLeft <= 0) {
          clearInterval(this.displayTimer)
          this.testStage = 'answer'
          this.prepareAnswerPhase()
          this.lastQuestionTime = Date.now()
        }
      }, 100)
    },
    
    getDisplayTime() {
      return this.currentQuestion.sequence.length * this.getItemDisplayTime() + 1000 // 额外1秒缓冲
    },
    
    getItemDisplayTime() {
      const speeds = {
        'slow': 1500,
        'medium': 1000,
        'fast': 700,
        'very-fast': 500
      }
      return speeds[this.settings.displaySpeed] || 1000
    },
    
    prepareAnswerPhase() {
      // 准备选项（序列元素 + 干扰项）
      this.shuffledOptions = [...this.currentQuestion.sequence, ...this.currentQuestion.distractors]
        .sort(() => Math.random() - 0.5)
    },
    
    addToSequence(item) {
      if (!this.isItemSelected(item) && this.userSequence.length < this.currentQuestion.sequence.length) {
        this.userSequence.push(item)
      }
    },
    
    removeFromSequence(index) {
      this.userSequence.splice(index, 1)
    },
    
    clearSequence() {
      this.userSequence = []
    },
    
    isItemSelected(item) {
      return this.userSequence.some(selected => selected.id === item.id)
    },
    
    submitAnswer() {
      const questionTime = Date.now() - this.lastQuestionTime
      const correct = this.checkAnswer()
      
      this.answers.push({
        questionIndex: this.currentQuestionIndex,
        sequenceType: this.currentQuestion.type,
        difficulty: this.currentQuestion.difficulty,
        sequenceLength: this.currentQuestion.length,
        correct: correct,
        time: questionTime,
        userAnswer: this.userSequence.map(item => item.value),
        correctAnswer: this.currentQuestion.sequence.map(item => item.value)
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
      if (this.userSequence.length !== this.currentQuestion.sequence.length) {
        return false
      }
      
      for (let i = 0; i < this.userSequence.length; i++) {
        if (this.userSequence[i].value !== this.currentQuestion.sequence[i].value) {
          return false
        }
      }
      
      return true
    },
    
    isItemCorrect(item, index) {
      if (index >= this.currentQuestion.sequence.length) {
        return false
      }
      return item.value === this.currentQuestion.sequence[index].value
    },
    
    skipQuestion() {
      this.answers.push({
        questionIndex: this.currentQuestionIndex,
        sequenceType: this.currentQuestion.type,
        difficulty: this.currentQuestion.difficulty,
        sequenceLength: this.currentQuestion.length,
        correct: false,
        time: Date.now() - this.lastQuestionTime,
        userAnswer: null,
        correctAnswer: this.currentQuestion.sequence.map(item => item.value),
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
      if (this.displayTimer) {
        clearInterval(this.displayTimer)
        this.displayTimer = null
      }
    },
    
    formatTime(ms) {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    
    getItemStyle(item) {
      return {
        transition: 'all 0.3s ease'
      }
    },
    
    getTypeLabel(type) {
      const labels = {
        color: '颜色序列',
        number: '数字序列',
        shape: '形状序列'
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
      const baseTime = 3000 // 3秒基准
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
    
    getLengthScore() {
      if (this.answers.length === 0) return 0
      
      const avgLength = this.averageSequenceLength
      const maxLength = 12
      return (avgLength / maxLength) * 100
    },
    
    getPerformanceEvaluation() {
      const score = this.totalScore
      
      if (score >= 90) {
        return '优秀！您的序列记忆能力非常出色，能够准确记住复杂的序列模式。继续保持这种水平，可以尝试更长的序列挑战。'
      } else if (score >= 80) {
        return '良好！您的序列记忆能力较强，在大部分序列任务中表现良好。通过针对性训练可以进一步提升。'
      } else if (score >= 70) {
        return '中等！您的序列记忆能力处于平均水平，还有较大的提升空间。建议加强序列记忆策略的学习和练习。'
      } else if (score >= 60) {
        return '需要改进！您的序列记忆能力有待提升，建议从较短的序列开始练习，逐步提高。'
      } else {
        return '需要加强！建议从简单的序列记忆任务开始，掌握基本的记忆方法，循序渐进地提升能力。'
      }
    },
    
    getImprovementSuggestions() {
      const suggestions = []
      
      // 基于准确率的建议
      if (this.accuracy < 70) {
        suggestions.push('练习基础的序列记忆技巧，如分组记忆、节奏记忆等')
        suggestions.push('从较短的序列开始练习，逐步增加长度')
      }
      
      // 基于速度的建议
      if (this.averageTime > 5000) {
        suggestions.push('提高反应速度，可以通过快速识别训练来改善')
        suggestions.push('练习快速序列识别，减少犹豫时间')
      }
      
      // 基于类型表现的建议
      Object.entries(this.typePerformance).forEach(([type, perf]) => {
        if (perf.accuracy < 60) {
          if (type === 'color') {
            suggestions.push('加强颜色序列记忆，可以使用颜色联想法')
          } else if (type === 'number') {
            suggestions.push('提高数字序列记忆，可以使用数字编码技巧')
          } else if (type === 'shape') {
            suggestions.push('加强形状序列记忆，可以使用形状故事法')
          }
        }
      })
      
      // 基于序列长度的建议
      const avgLength = this.averageSequenceLength
      if (avgLength < 6) {
        suggestions.push('逐步挑战更长的序列，提高记忆容量')
      }
      
      // 通用建议
      suggestions.push('保持规律的练习，每天进行短时间的序列记忆训练')
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
.sequence-memory-test {
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

/* 序列展示阶段样式 */
.display-stage {
  text-align: center;
}

.stage-title {
  font-size: 1.5em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 30px;
}

.sequence-display {
  margin-bottom: 40px;
}

.sequence-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
  min-height: 120px;
}

.sequence-item {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #e9ecef;
  background: white;
  transition: all 0.3s ease;
  opacity: 0.3;
}

.sequence-item.active {
  opacity: 1;
  border-color: #007bff;
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.sequence-item.completed {
  opacity: 0.8;
  border-color: #28a745;
}

.color-item {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.number-item {
  font-size: 2em;
  font-weight: 600;
  color: #495057;
}

.shape-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.shape {
  width: 50px;
  height: 50px;
}

.shape.circle {
  border-radius: 50%;
  background: #007bff;
}

.shape.square {
  background: #28a745;
}

.shape.triangle {
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 43px solid #dc3545;
  background: transparent;
}

.shape.diamond {
  width: 35px;
  height: 35px;
  background: #ffc107;
  transform: rotate(45deg);
}

.shape.star {
  position: relative;
  background: #17a2b8;
  width: 50px;
  height: 50px;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.shape.heart {
  position: relative;
  width: 50px;
  height: 45px;
  background: #e83e8c;
  transform: rotate(-45deg);
  border-radius: 50px 50px 0 0;
}

.shape.heart:before {
  content: '';
  width: 26px;
  height: 40px;
  position: absolute;
  left: 25px;
  top: -12px;
  background: #e83e8c;
  border-radius: 25px 25px 0 0;
  transform: rotate(-45deg);
  transform-origin: 0 100%;
}

.shape.heart:after {
  content: '';
  width: 26px;
  height: 40px;
  position: absolute;
  left: 0;
  top: -12px;
  background: #e83e8c;
  border-radius: 25px 25px 0 0;
  transform: rotate(45deg);
  transform-origin: 100% 100%;
}

.shape.hexagon {
  width: 50px;
  height: 43px;
  background: #6f42c1;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.shape.pentagon {
  width: 50px;
  height: 50px;
  background: #fd7e14;
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

.display-timer {
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

.user-sequence {
  margin-bottom: 30px;
}

.sequence-title {
  font-size: 1.1em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
}

.selected-sequence {
  min-height: 100px;
  background: #f8f9fa;
  border: 2px dashed #007bff;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.selected-item {
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #007bff;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.selected-item:hover {
  transform: scale(1.05);
}

.selected-item .color-item {
  width: 40px;
  height: 40px;
}

.selected-item .number-item {
  font-size: 1.5em;
}

.selected-item .shape {
  width: 40px;
  height: 40px;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

.options-area {
  margin-bottom: 30px;
}

.options-title {
  font-size: 1.1em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
}

.sequence-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
}

.option-item {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #e9ecef;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:hover:not(.disabled) {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
}

.option-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f9fa;
}

.option-item .color-item {
  width: 50px;
  height: 50px;
}

.option-item .number-item {
  font-size: 2em;
}

.option-item .shape {
  width: 50px;
  height: 50px;
}

.answer-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-submit,
.btn-skip,
.btn-clear {
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

.btn-clear {
  background: #ffc107;
  color: #212529;
}

.btn-clear:hover {
  background: #e0a800;
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
  max-width: 800px;
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

.sequence-comparison {
  margin-bottom: 25px;
}

.correct-sequence,
.user-sequence-feedback {
  margin-bottom: 20px;
  text-align: left;
}

.label {
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.sequence-display-small {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sequence-item-small {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e9ecef;
  background: white;
}

.sequence-item-small.correct {
  border-color: #28a745;
  background: #d4edda;
}

.sequence-item-small.incorrect {
  border-color: #dc3545;
  background: #f8d7da;
}

.color-item-small {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #fff;
}

.number-item-small {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
}

.shape-item-small {
  display: flex;
  align-items: center;
  justify-content: center;
}

.shape-small {
  width: 30px;
  height: 30px;
}

.shape-small.circle {
  border-radius: 50%;
  background: #007bff;
}

.shape-small.square {
  background: #28a745;
}

.shape-small.triangle {
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 26px solid #dc3545;
  background: transparent;
}

.shape-small.diamond {
  width: 21px;
  height: 21px;
  background: #ffc107;
  transform: rotate(45deg);
}

.shape-small.star {
  position: relative;
  background: #17a2b8;
  width: 30px;
  height: 30px;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.shape-small.heart {
  position: relative;
  width: 30px;
  height: 27px;
  background: #e83e8c;
  transform: rotate(-45deg);
  border-radius: 30px 30px 0 0;
}

.shape-small.heart:before {
  content: '';
  width: 15px;
  height: 24px;
  position: absolute;
  left: 15px;
  top: -7px;
  background: #e83e8c;
  border-radius: 15px 15px 0 0;
  transform: rotate(-45deg);
  transform-origin: 0 100%;
}

.shape-small.heart:after {
  content: '';
  width: 15px;
  height: 24px;
  position: absolute;
  left: 0;
  top: -7px;
  background: #e83e8c;
  border-radius: 15px 15px 0 0;
  transform: rotate(45deg);
  transform-origin: 100% 100%;
}

.shape-small.hexagon {
  width: 30px;
  height: 26px;
  background: #6f42c1;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.shape-small.pentagon {
  width: 30px;
  height: 30px;
  background: #fd7e14;
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

.feedback-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.feedback-stats .stat-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.feedback-stats .stat-label {
  display: block;
  font-size: 0.9em;
  color: #6c757d;
  margin-bottom: 5px;
}

.feedback-stats .stat-value {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
}

.feedback-actions {
  text-align: center;
}

.btn-next {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1em;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-next:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

/* 结果展示阶段样式 */
.results-phase {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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
  margin-bottom: 40px;
}

.score-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-inner {
  background: white;
  width: 160px;
  height: 160px;
  border-radius: 50%;
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
  font-size: 1.1em;
  color: #6c757d;
  margin-top: 5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.2em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 10px;
}

.stat-title {
  font-size: 1.1em;
  color: #6c757d;
}

/* 详细分析样式 */
.detailed-analysis {
  margin-bottom: 40px;
}

.analysis-title {
  font-size: 1.8em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 25px;
  text-align: center;
}

.analysis-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
}

.section-title {
  font-size: 1.3em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 20px;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.performance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.performance-label {
  font-weight: 600;
  color: #495057;
}

.performance-value {
  color: #007bff;
  font-weight: 600;
}

.memory-stats {
  background: white;
  border-radius: 10px;
  padding: 20px;
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
  font-weight: 600;
  color: #495057;
}

.stats-value {
  color: #007bff;
  font-weight: 600;
}

/* 表现评价样式 */
.performance-feedback {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
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
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  border-left: 4px solid #28a745;
  color: #495057;
  line-height: 1.5;
}

.suggestion-item:before {
  content: '💡';
  margin-right: 10px;
}

/* 操作按钮样式 */
.results-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .instruction-container,
  .test-container,
  .feedback-container,
  .results-container {
    padding: 20px;
    margin: 10px;
  }
  
  .instruction-title,
  .results-title {
    font-size: 2em;
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
  
  .sequence-container {
    gap: 10px;
  }
  
  .sequence-item {
    width: 60px;
    height: 60px;
  }
  
  .sequence-options {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  }
  
  .option-item {
    width: 60px;
    height: 60px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .sequence-item {
    width: 50px;
    height: 50px;
  }
  
  .option-item {
    width: 50px;
    height: 50px;
  }
  
  .color-item {
    width: 30px;
    height: 30px;
  }
  
  .number-item {
    font-size: 1.5em;
  }
  
  .shape {
    width: 30px;
    height: 30px;
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
    font-size: 2.2em;
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
  animation: fadeIn 0.6s ease-out;
}

.slide-in {
  animation: slideIn 0.6s ease-out;
}

.scale-in {
  animation: scaleIn 0.6s ease-out;
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
  --dark-color: #495057;
  --border-radius: 8px;
  --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}
</style>