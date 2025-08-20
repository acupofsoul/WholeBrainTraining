<template>
  <div class="logical-thinking-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase fade-in">
      <div class="instruction-container">
        <h2 class="test-title">逻辑思维测试</h2>
        <div class="test-description">
          <p>本测试将评估您的逻辑推理、演绎归纳、模式识别和逻辑分析能力。</p>
        </div>
        
        <div class="test-info">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">测试目标</div>
              <div class="info-content">
                <ul>
                  <li>评估逻辑推理能力</li>
                  <li>测试演绎归纳思维</li>
                  <li>检验模式识别能力</li>
                  <li>分析逻辑关系理解</li>
                </ul>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-label">测试步骤</div>
              <div class="info-content">
                <ol>
                  <li>仔细阅读题目和选项</li>
                  <li>分析逻辑关系和模式</li>
                  <li>运用推理方法求解</li>
                  <li>选择最合适的答案</li>
                </ol>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-label">难度设置</div>
              <div class="info-content">
                <div class="difficulty-info">
                  <span class="difficulty-label">当前难度：</span>
                  <span class="difficulty-value">{{ difficultyName }}</span>
                </div>
                <div class="questions-info">
                  <span class="questions-label">题目数量：</span>
                  <span class="questions-value">{{ totalQuestions }}题</span>
                </div>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-label">题目类型</div>
              <div class="info-content">
                <div class="type-tags">
                  <span class="type-tag">数列推理</span>
                  <span class="type-tag">图形逻辑</span>
                  <span class="type-tag">逻辑判断</span>
                  <span class="type-tag">关系推理</span>
                </div>
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
      <div class="testing-container">
        <!-- 测试头部信息 -->
        <div class="test-header">
          <div class="test-progress">
            <div class="progress-info">
              <span class="current-question">第 {{ currentQuestionIndex + 1 }} 题</span>
              <span class="total-questions">共 {{ totalQuestions }} 题</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
          
          <div class="test-stats">
            <div class="stat-item">
              <span class="stat-label">得分：</span>
              <span class="stat-value">{{ currentScore }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">正确率：</span>
              <span class="stat-value">{{ accuracyPercentage }}%</span>
            </div>
            <div class="stat-item" v-if="settings.timeLimit !== 'unlimited'">
              <span class="stat-label">剩余时间：</span>
              <span class="stat-value">{{ formatTime(remainingTime) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 当前题目 -->
        <div class="question-container" v-if="currentQuestion">
          <div class="question-header">
            <div class="question-type">{{ currentQuestion.type }}</div>
            <div class="question-difficulty">{{ currentQuestion.difficulty }}</div>
          </div>
          
          <div class="question-content">
            <div class="question-text">{{ currentQuestion.question }}</div>
            
            <!-- 数列推理题目 -->
            <div v-if="currentQuestion.type === '数列推理'" class="sequence-question">
              <div class="sequence-display">
                <span 
                  v-for="(item, index) in currentQuestion.sequence" 
                  :key="index"
                  class="sequence-item"
                  :class="{ 'missing': item === '?' }"
                >
                  {{ item }}
                </span>
              </div>
            </div>
            
            <!-- 图形逻辑题目 -->
            <div v-else-if="currentQuestion.type === '图形逻辑'" class="pattern-question">
              <div class="pattern-display">
                <div 
                  v-for="(row, rowIndex) in currentQuestion.pattern" 
                  :key="rowIndex"
                  class="pattern-row"
                >
                  <div 
                    v-for="(cell, cellIndex) in row" 
                    :key="cellIndex"
                    class="pattern-cell"
                    :class="cell"
                  >
                    <span v-if="cell === 'question'">?</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 逻辑判断题目 -->
            <div v-else-if="currentQuestion.type === '逻辑判断'" class="logic-question">
              <div class="premises">
                <div class="premise-title">已知条件：</div>
                <ul class="premise-list">
                  <li v-for="(premise, index) in currentQuestion.premises" :key="index">
                    {{ premise }}
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- 关系推理题目 -->
            <div v-else-if="currentQuestion.type === '关系推理'" class="relation-question">
              <div class="relation-display">
                <div class="relation-items">
                  <div 
                    v-for="(item, index) in currentQuestion.items" 
                    :key="index"
                    class="relation-item"
                  >
                    {{ item }}
                  </div>
                </div>
                <div class="relation-rules">
                  <div class="rule-title">关系规则：</div>
                  <ul class="rule-list">
                    <li v-for="(rule, index) in currentQuestion.rules" :key="index">
                      {{ rule }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 选项 -->
          <div class="options-container">
            <div class="options-title">请选择正确答案：</div>
            <div class="options-grid">
              <button 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="option-button"
                :class="{ 
                  'selected': selectedOption === index,
                  'correct': showFeedback && index === currentQuestion.correctAnswer,
                  'incorrect': showFeedback && selectedOption === index && index !== currentQuestion.correctAnswer
                }"
                @click="selectOption(index)"
                :disabled="showFeedback"
              >
                <span class="option-label">{{ String.fromCharCode(65 + index) }}</span>
                <span class="option-text">{{ option }}</span>
              </button>
            </div>
          </div>
          
          <!-- 反馈区域 -->
          <div v-if="showFeedback" class="feedback-container slide-in">
            <div class="feedback-content" :class="{ 'correct': isCorrect, 'incorrect': !isCorrect }">
              <div class="feedback-icon">{{ isCorrect ? '✓' : '✗' }}</div>
              <div class="feedback-text">
                <div class="feedback-result">{{ isCorrect ? '回答正确！' : '回答错误！' }}</div>
                <div class="feedback-explanation">{{ currentQuestion.explanation }}</div>
              </div>
            </div>
          </div>
          
          <!-- 控制按钮 -->
          <div class="question-actions">
            <button 
              v-if="settings.hintMode !== 'disabled' && !showFeedback && hintCount < maxHints"
              @click="showHint"
              class="btn-hint"
            >
              提示 ({{ hintCount }}/{{ maxHints }})
            </button>
            
            <button 
              v-if="showFeedback"
              @click="nextQuestion"
              class="btn-next"
            >
              {{ currentQuestionIndex < totalQuestions - 1 ? '下一题' : '完成测试' }}
            </button>
            
            <button 
              v-if="!showFeedback && selectedOption !== null"
              @click="submitAnswer"
              class="btn-submit"
            >
              提交答案
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 结果展示阶段 -->
    <div v-else-if="currentPhase === 'results'" class="results-phase fade-in">
      <div class="results-container">
        <h2 class="results-title">逻辑思维测试结果</h2>
        
        <!-- 总体结果 -->
        <div class="overall-results">
          <div class="score-display">
            <div class="score-circle" :style="{ background: `conic-gradient(#007bff ${(finalScore / 100) * 360}deg, #e9ecef 0deg)` }">
              <div class="score-inner">
                <div class="score-number">{{ finalScore }}</div>
                <div class="score-label">总分</div>
              </div>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ correctAnswers }}</div>
              <div class="stat-label">正确题数</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ accuracyPercentage }}%</div>
              <div class="stat-label">准确率</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ formatTime(totalTime) }}</div>
              <div class="stat-label">总用时</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ averageTime }}s</div>
              <div class="stat-label">平均用时</div>
            </div>
          </div>
        </div>
        
        <!-- 详细分析 -->
        <div class="detailed-analysis">
          <h3 class="analysis-title">详细分析</h3>
          
          <!-- 题目类型表现 -->
          <div class="type-performance">
            <h4 class="section-title">题目类型表现</h4>
            <div class="type-stats">
              <div 
                v-for="type in questionTypes" 
                :key="type.name"
                class="type-stat-card"
              >
                <div class="type-header">
                  <span class="type-name">{{ type.name }}</span>
                  <span class="type-score">{{ type.score }}%</span>
                </div>
                <div class="type-details">
                  <div class="type-detail">
                    <span class="detail-label">正确率：</span>
                    <span class="detail-value">{{ type.accuracy }}%</span>
                  </div>
                  <div class="type-detail">
                    <span class="detail-label">平均时间：</span>
                    <span class="detail-value">{{ type.averageTime }}s</span>
                  </div>
                </div>
                <div class="type-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: type.score + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 难度表现 -->
          <div class="difficulty-performance">
            <h4 class="section-title">难度表现分析</h4>
            <div class="difficulty-chart">
              <div 
                v-for="level in difficultyLevels" 
                :key="level.name"
                class="difficulty-bar"
              >
                <div class="difficulty-label">{{ level.name }}</div>
                <div class="difficulty-bar-container">
                  <div class="difficulty-bar-fill" :style="{ width: level.performance + '%' }"></div>
                  <span class="difficulty-percentage">{{ level.performance }}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 逻辑能力分析 -->
          <div class="logic-abilities">
            <h4 class="section-title">逻辑能力分析</h4>
            <div class="abilities-grid">
              <div class="ability-card">
                <div class="ability-name">演绎推理</div>
                <div class="ability-score">{{ deductiveReasoning }}</div>
                <div class="ability-description">从一般到特殊的推理能力</div>
              </div>
              <div class="ability-card">
                <div class="ability-name">归纳推理</div>
                <div class="ability-score">{{ inductiveReasoning }}</div>
                <div class="ability-description">从特殊到一般的推理能力</div>
              </div>
              <div class="ability-card">
                <div class="ability-name">模式识别</div>
                <div class="ability-score">{{ patternRecognition }}</div>
                <div class="ability-description">识别规律和模式的能力</div>
              </div>
              <div class="ability-card">
                <div class="ability-name">逻辑分析</div>
                <div class="ability-score">{{ logicalAnalysis }}</div>
                <div class="ability-description">分析逻辑关系的能力</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 表现评价 -->
        <div class="performance-evaluation">
          <h3 class="analysis-title">表现评价</h3>
          <div class="evaluation-content">
            <div class="evaluation-level">
              <span class="level-label">整体水平：</span>
              <span class="level-value" :class="performanceLevel.class">{{ performanceLevel.name }}</span>
            </div>
            <div class="evaluation-description">
              {{ performanceLevel.description }}
            </div>
            <div class="evaluation-strengths">
              <h5>优势领域：</h5>
              <ul>
                <li v-for="strength in strengths" :key="strength">{{ strength }}</li>
              </ul>
            </div>
            <div class="evaluation-improvements">
              <h5>改进方向：</h5>
              <ul>
                <li v-for="improvement in improvements" :key="improvement">{{ improvement }}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- 改进建议 -->
        <div class="improvement-suggestions">
          <h3 class="analysis-title">改进建议</h3>
          <div class="suggestions-grid">
            <div class="suggestion-card">
              <div class="suggestion-icon">📚</div>
              <div class="suggestion-title">学习建议</div>
              <div class="suggestion-content">
                <ul>
                  <li>学习形式逻辑和数理逻辑基础</li>
                  <li>练习逻辑推理的基本方法</li>
                  <li>掌握常见的逻辑谬误类型</li>
                </ul>
              </div>
            </div>
            
            <div class="suggestion-card">
              <div class="suggestion-icon">🎯</div>
              <div class="suggestion-title">练习建议</div>
              <div class="suggestion-content">
                <ul>
                  <li>多做数列推理和图形逻辑题</li>
                  <li>练习逻辑判断和关系推理</li>
                  <li>参与逻辑游戏和智力竞赛</li>
                </ul>
              </div>
            </div>
            
            <div class="suggestion-card">
              <div class="suggestion-icon">💡</div>
              <div class="suggestion-title">思维建议</div>
              <div class="suggestion-content">
                <ul>
                  <li>培养系统性思考习惯</li>
                  <li>学会分解复杂问题</li>
                  <li>提高抽象思维能力</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div class="results-actions">
          <button @click="restartTest" class="btn-secondary">重新测试</button>
          <button @click="completeTest" class="btn-primary">完成测试</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LogicalThinkingTest',
  
  props: {
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      currentPhase: 'instruction', // instruction, testing, results
      
      // 测试配置
      totalQuestions: 20,
      currentQuestionIndex: 0,
      selectedOption: null,
      showFeedback: false,
      isCorrect: false,
      
      // 计时相关
      startTime: null,
      questionStartTime: null,
      totalTime: 0,
      remainingTime: 0,
      timer: null,
      
      // 得分统计
      currentScore: 0,
      correctAnswers: 0,
      responses: [],
      
      // 提示系统
      hintCount: 0,
      maxHints: 3,
      
      // 题目数据
      questions: [],
      currentQuestion: null
    }
  },
  
  computed: {
    difficultyName() {
      const names = {
        easy: '简单',
        medium: '中等', 
        hard: '困难',
        expert: '专家'
      }
      return names[this.settings.difficulty] || '中等'
    },
    
    progressPercentage() {
      return ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100
    },
    
    accuracyPercentage() {
      if (this.currentQuestionIndex === 0) return 0
      return Math.round((this.correctAnswers / (this.currentQuestionIndex + 1)) * 100)
    },
    
    finalScore() {
      return Math.round((this.correctAnswers / this.totalQuestions) * 100)
    },
    
    averageTime() {
      if (this.responses.length === 0) return 0
      const totalResponseTime = this.responses.reduce((sum, response) => sum + response.responseTime, 0)
      return Math.round(totalResponseTime / this.responses.length)
    },
    
    questionTypes() {
      const types = ['数列推理', '图形逻辑', '逻辑判断', '关系推理']
      return types.map(type => {
        const typeResponses = this.responses.filter(r => r.questionType === type)
        const correct = typeResponses.filter(r => r.isCorrect).length
        const total = typeResponses.length
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
        const avgTime = total > 0 ? Math.round(typeResponses.reduce((sum, r) => sum + r.responseTime, 0) / total) : 0
        
        return {
          name: type,
          score: accuracy,
          accuracy,
          averageTime: avgTime,
          correct,
          total
        }
      })
    },
    
    difficultyLevels() {
      const levels = ['简单', '中等', '困难']
      return levels.map(level => {
        const levelResponses = this.responses.filter(r => r.difficulty === level)
        const correct = levelResponses.filter(r => r.isCorrect).length
        const total = levelResponses.length
        const performance = total > 0 ? Math.round((correct / total) * 100) : 0
        
        return {
          name: level,
          performance,
          correct,
          total
        }
      })
    },
    
    deductiveReasoning() {
      const deductiveQuestions = this.responses.filter(r => 
        r.questionType === '逻辑判断' || r.questionType === '关系推理'
      )
      const correct = deductiveQuestions.filter(r => r.isCorrect).length
      const total = deductiveQuestions.length
      return total > 0 ? Math.round((correct / total) * 100) : 0
    },
    
    inductiveReasoning() {
      const inductiveQuestions = this.responses.filter(r => 
        r.questionType === '数列推理'
      )
      const correct = inductiveQuestions.filter(r => r.isCorrect).length
      const total = inductiveQuestions.length
      return total > 0 ? Math.round((correct / total) * 100) : 0
    },
    
    patternRecognition() {
      const patternQuestions = this.responses.filter(r => 
        r.questionType === '图形逻辑' || r.questionType === '数列推理'
      )
      const correct = patternQuestions.filter(r => r.isCorrect).length
      const total = patternQuestions.length
      return total > 0 ? Math.round((correct / total) * 100) : 0
    },
    
    logicalAnalysis() {
      const analysisQuestions = this.responses.filter(r => 
        r.questionType === '逻辑判断' || r.questionType === '关系推理'
      )
      const correct = analysisQuestions.filter(r => r.isCorrect).length
      const total = analysisQuestions.length
      return total > 0 ? Math.round((correct / total) * 100) : 0
    },
    
    performanceLevel() {
      const score = this.finalScore
      if (score >= 90) {
        return {
          name: '优秀',
          class: 'excellent',
          description: '您的逻辑思维能力非常出色，能够熟练运用各种推理方法解决复杂问题。'
        }
      } else if (score >= 80) {
        return {
          name: '良好',
          class: 'good',
          description: '您具有较强的逻辑思维能力，在大多数逻辑推理任务中表现良好。'
        }
      } else if (score >= 70) {
        return {
          name: '中等',
          class: 'average',
          description: '您的逻辑思维能力处于中等水平，还有进一步提升的空间。'
        }
      } else if (score >= 60) {
        return {
          name: '及格',
          class: 'pass',
          description: '您的逻辑思维能力达到基本要求，建议加强练习。'
        }
      } else {
        return {
          name: '需要改进',
          class: 'needs-improvement',
          description: '您的逻辑思维能力需要显著提升，建议系统学习逻辑推理方法。'
        }
      }
    },
    
    strengths() {
      const strengths = []
      if (this.deductiveReasoning >= 80) strengths.push('演绎推理能力强')
      if (this.inductiveReasoning >= 80) strengths.push('归纳推理能力强')
      if (this.patternRecognition >= 80) strengths.push('模式识别能力强')
      if (this.logicalAnalysis >= 80) strengths.push('逻辑分析能力强')
      if (strengths.length === 0) strengths.push('基础逻辑思维能力')
      return strengths
    },
    
    improvements() {
      const improvements = []
      if (this.deductiveReasoning < 70) improvements.push('加强演绎推理训练')
      if (this.inductiveReasoning < 70) improvements.push('提高归纳推理能力')
      if (this.patternRecognition < 70) improvements.push('增强模式识别能力')
      if (this.logicalAnalysis < 70) improvements.push('改进逻辑分析技巧')
      if (improvements.length === 0) improvements.push('保持当前水平，继续练习')
      return improvements
    }
  },
  
  mounted() {
    this.initializeTest()
  },
  
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  
  methods: {
    initializeTest() {
      // 根据难度设置题目数量
      const questionCounts = {
        easy: 15,
        medium: 20,
        hard: 25,
        expert: 30
      }
      
      this.totalQuestions = questionCounts[this.settings.difficulty] || 20
      this.generateQuestions()
    },
    
    generateQuestions() {
      this.questions = []
      
      // 生成不同类型的题目
      const types = ['数列推理', '图形逻辑', '逻辑判断', '关系推理']
      const questionsPerType = Math.ceil(this.totalQuestions / types.length)
      
      types.forEach(type => {
        for (let i = 0; i < questionsPerType && this.questions.length < this.totalQuestions; i++) {
          this.questions.push(this.generateQuestion(type))
        }
      })
      
      // 随机打乱题目顺序
      if (this.settings.questionOrder === 'random') {
        this.questions = this.shuffleArray(this.questions)
      }
    },
    
    generateQuestion(type) {
      const difficulties = ['简单', '中等', '困难']
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
      
      switch (type) {
        case '数列推理':
          return this.generateSequenceQuestion(difficulty)
        case '图形逻辑':
          return this.generatePatternQuestion(difficulty)
        case '逻辑判断':
          return this.generateLogicQuestion(difficulty)
        case '关系推理':
          return this.generateRelationQuestion(difficulty)
        default:
          return this.generateSequenceQuestion(difficulty)
      }
    },
    
    generateSequenceQuestion(difficulty) {
      const sequences = {
        '简单': [
          { sequence: [2, 4, 6, 8, '?'], answer: 10, rule: '等差数列，公差为2' },
          { sequence: [1, 3, 5, 7, '?'], answer: 9, rule: '奇数数列' },
          { sequence: [2, 4, 8, 16, '?'], answer: 32, rule: '等比数列，公比为2' }
        ],
        '中等': [
          { sequence: [1, 4, 9, 16, '?'], answer: 25, rule: '平方数列' },
          { sequence: [2, 6, 12, 20, '?'], answer: 30, rule: 'n(n+1)数列' },
          { sequence: [1, 1, 2, 3, 5, '?'], answer: 8, rule: '斐波那契数列' }
        ],
        '困难': [
          { sequence: [1, 8, 27, 64, '?'], answer: 125, rule: '立方数列' },
          { sequence: [2, 3, 5, 8, 13, '?'], answer: 21, rule: '斐波那契变形' },
          { sequence: [1, 4, 13, 40, '?'], answer: 121, rule: '递推关系：3n+1' }
        ]
      }
      
      const seqData = sequences[difficulty][Math.floor(Math.random() * sequences[difficulty].length)]
      const options = this.generateSequenceOptions(seqData.answer)
      
      return {
        type: '数列推理',
        difficulty,
        question: '请找出数列的规律，选择正确的下一项：',
        sequence: seqData.sequence,
        options,
        correctAnswer: options.indexOf(seqData.answer),
        explanation: `规律：${seqData.rule}，答案是${seqData.answer}`
      }
    },
    
    generateSequenceOptions(correctAnswer) {
      const options = [correctAnswer]
      
      // 生成干扰项
      while (options.length < 4) {
        const distractor = correctAnswer + Math.floor(Math.random() * 20) - 10
        if (distractor > 0 && !options.includes(distractor)) {
          options.push(distractor)
        }
      }
      
      return this.shuffleArray(options)
    },
    
    generatePatternQuestion(difficulty) {
      // 简化的图形逻辑题目
      const patterns = {
        '简单': [
          {
            pattern: [['filled', 'empty', 'filled'], ['empty', 'filled', 'empty'], ['filled', 'empty', 'question']],
            answer: 'filled',
            rule: '交替填充模式'
          }
        ],
        '中等': [
          {
            pattern: [['circle', 'square', 'triangle'], ['square', 'triangle', 'circle'], ['triangle', 'circle', 'question']],
            answer: 'square',
            rule: '循环移位模式'
          }
        ],
        '困难': [
          {
            pattern: [['A', 'B', 'C'], ['B', 'C', 'D'], ['C', 'D', 'question']],
            answer: 'E',
            rule: '字母递增模式'
          }
        ]
      }
      
      const patternData = patterns[difficulty][0] // 简化处理
      const options = this.generatePatternOptions(patternData.answer)
      
      return {
        type: '图形逻辑',
        difficulty,
        question: '请观察图形规律，选择正确的图形：',
        pattern: patternData.pattern,
        options,
        correctAnswer: options.indexOf(patternData.answer),
        explanation: `规律：${patternData.rule}，答案是${patternData.answer}`
      }
    },
    
    generatePatternOptions(correctAnswer) {
      const allOptions = ['filled', 'empty', 'circle', 'square', 'triangle', 'A', 'B', 'C', 'D', 'E']
      const options = [correctAnswer]
      
      while (options.length < 4) {
        const option = allOptions[Math.floor(Math.random() * allOptions.length)]
        if (!options.includes(option)) {
          options.push(option)
        }
      }
      
      return this.shuffleArray(options)
    },
    
    generateLogicQuestion(difficulty) {
      const questions = {
        '简单': [
          {
            premises: ['所有的鸟都会飞', '企鹅是鸟'],
            question: '根据以上条件，可以得出什么结论？',
            options: ['企鹅会飞', '企鹅不会飞', '无法确定', '条件矛盾'],
            correct: 3,
            explanation: '前提存在矛盾，因为企鹅是鸟但不会飞'
          }
        ],
        '中等': [
          {
            premises: ['如果下雨，那么地面会湿', '地面是湿的'],
            question: '根据以上条件，可以得出什么结论？',
            options: ['一定下雨了', '可能下雨了', '没有下雨', '无法确定'],
            correct: 1,
            explanation: '地面湿可能是下雨导致的，也可能有其他原因'
          }
        ],
        '困难': [
          {
            premises: ['只有努力学习，才能取得好成绩', '小明取得了好成绩'],
            question: '根据以上条件，可以得出什么结论？',
            options: ['小明努力学习了', '小明可能努力学习了', '小明没有努力学习', '无法确定'],
            correct: 1,
            explanation: '这是肯定后件的逻辑谬误，不能确定小明一定努力学习了'
          }
        ]
      }
      
      const questionData = questions[difficulty][0]
      
      return {
        type: '逻辑判断',
        difficulty,
        question: questionData.question,
        premises: questionData.premises,
        options: questionData.options,
        correctAnswer: questionData.correct,
        explanation: questionData.explanation
      }
    },
    
    generateRelationQuestion(difficulty) {
      const questions = {
        '简单': [
          {
            items: ['张三', '李四', '王五'],
            rules: ['张三比李四高', '李四比王五高'],
            question: '根据以上关系，谁最高？',
            options: ['张三', '李四', '王五', '无法确定'],
            correct: 0,
            explanation: '根据传递性，张三 > 李四 > 王五，所以张三最高'
          }
        ],
        '中等': [
          {
            items: ['A', 'B', 'C', 'D'],
            rules: ['A在B的左边', 'C在D的右边', 'B在C的左边'],
            question: '根据以上关系，正确的排列顺序是？',
            options: ['A-B-C-D', 'A-B-D-C', 'B-A-C-D', 'A-C-B-D'],
            correct: 0,
            explanation: '根据位置关系推导：A < B < C < D'
          }
        ],
        '困难': [
          {
            items: ['红', '蓝', '绿', '黄'],
            rules: ['红色不在第一位', '蓝色在绿色前面', '黄色不在最后一位'],
            question: '如果绿色在第三位，可能的排列是？',
            options: ['蓝红绿黄', '黄蓝绿红', '蓝黄绿红', '以上都可能'],
            correct: 3,
            explanation: '根据约束条件，多种排列都符合要求'
          }
        ]
      }
      
      const questionData = questions[difficulty][0]
      
      return {
        type: '关系推理',
        difficulty,
        question: questionData.question,
        items: questionData.items,
        rules: questionData.rules,
        options: questionData.options,
        correctAnswer: questionData.correct,
        explanation: questionData.explanation
      }
    },
    
    startTest() {
      this.currentPhase = 'testing'
      this.startTime = Date.now()
      this.currentQuestionIndex = 0
      this.loadCurrentQuestion()
      this.startTimer()
    },
    
    startTimer() {
      if (this.settings.timeLimit === 'unlimited') return
      
      const timeMultipliers = {
        strict: 0.8,
        normal: 1.0,
        relaxed: 1.5
      }
      
      const baseTime = this.totalQuestions * 60 // 每题1分钟
      const totalTime = baseTime * (timeMultipliers[this.settings.timeLimit] || 1)
      this.remainingTime = totalTime
      
      this.timer = setInterval(() => {
        this.remainingTime--
        if (this.remainingTime <= 0) {
          this.timeUp()
        }
      }, 1000)
    },
    
    timeUp() {
      // 时间到，自动提交当前答案或跳过
      if (this.selectedOption !== null) {
        this.submitAnswer()
      } else {
        this.nextQuestion()
      }
    },
    
    loadCurrentQuestion() {
      if (this.currentQuestionIndex < this.questions.length) {
        this.currentQuestion = this.questions[this.currentQuestionIndex]
        this.selectedOption = null
        this.showFeedback = false
        this.questionStartTime = Date.now()
      } else {
        this.completeTest()
      }
    },
    
    selectOption(index) {
      if (this.showFeedback) return
      this.selectedOption = index
    },
    
    submitAnswer() {
      if (this.selectedOption === null) return
      
      const responseTime = Math.floor((Date.now() - this.questionStartTime) / 1000)
      this.isCorrect = this.selectedOption === this.currentQuestion.correctAnswer
      
      if (this.isCorrect) {
        this.correctAnswers++
        this.currentScore += this.calculateQuestionScore()
      }
      
      // 记录回答
      this.responses.push({
        questionIndex: this.currentQuestionIndex,
        questionType: this.currentQuestion.type,
        difficulty: this.currentQuestion.difficulty,
        selectedOption: this.selectedOption,
        correctAnswer: this.currentQuestion.correctAnswer,
        isCorrect: this.isCorrect,
        responseTime,
        hintUsed: this.hintCount > 0
      })
      
      this.showFeedback = this.settings.feedbackMode === 'immediate'
      
      if (!this.showFeedback) {
        setTimeout(() => this.nextQuestion(), 500)
      }
    },
    
    calculateQuestionScore() {
      let baseScore = 100 / this.totalQuestions
      
      // 难度加成
      const difficultyMultiplier = {
        '简单': 1.0,
        '中等': 1.2,
        '困难': 1.5
      }
      
      baseScore *= difficultyMultiplier[this.currentQuestion.difficulty] || 1.0
      
      // 时间加成
      const responseTime = Math.floor((Date.now() - this.questionStartTime) / 1000)
      if (responseTime < 30) {
        baseScore *= 1.2
      } else if (responseTime < 60) {
        baseScore *= 1.1
      }
      
      // 提示惩罚
      if (this.hintCount > 0) {
        baseScore *= 0.9
      }
      
      return Math.round(baseScore)
    },
    
    nextQuestion() {
      this.currentQuestionIndex++
      this.hintCount = 0
      
      if (this.currentQuestionIndex < this.totalQuestions) {
        this.loadCurrentQuestion()
      } else {
        this.completeTest()
      }
    },
    
    showHint() {
      if (this.hintCount >= this.maxHints) return
      
      this.hintCount++
      
      // 显示提示信息
      const hints = {
        '数列推理': '观察相邻数字之间的关系，寻找规律',
        '图形逻辑': '注意图形的形状、位置、颜色等属性变化',
        '逻辑判断': '仔细分析前提条件，避免逻辑谬误',
        '关系推理': '建立关系图，利用传递性进行推理'
      }
      
      const hint = hints[this.currentQuestion.type] || '仔细思考题目要求'
      alert(`提示：${hint}`)
    },
    
    completeTest() {
      this.currentPhase = 'results'
      this.totalTime = Math.floor((Date.now() - this.startTime) / 1000)
      
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      
      // 发送完成事件
      this.$emit('complete', {
        score: this.finalScore,
        accuracy: this.accuracyPercentage,
        completedQuestions: this.responses.length,
        totalQuestions: this.totalQuestions,
        averageTime: this.averageTime,
        responses: this.responses,
        difficultyAdaptation: this.getDifficultyAdaptation()
      })
    },
    
    getDifficultyAdaptation() {
      const accuracy = this.accuracyPercentage
      if (accuracy >= 90) return '优秀'
      if (accuracy >= 80) return '良好'
      if (accuracy >= 70) return '中等'
      if (accuracy >= 60) return '及格'
      return '需要改进'
    },
    
    restartTest() {
      this.currentPhase = 'instruction'
      this.currentQuestionIndex = 0
      this.selectedOption = null
      this.showFeedback = false
      this.currentScore = 0
      this.correctAnswers = 0
      this.responses = []
      this.hintCount = 0
      this.totalTime = 0
      
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      
      this.generateQuestions()
    },
    
    // 辅助方法
    shuffleArray(array) {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    },
    
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
/* 基础样式 */
.logical-thinking-test {
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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.test-title {
  text-align: center;
  font-size: 2.5em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 20px;
}

.test-description {
  text-align: center;
  color: #6c757d;
  font-size: 1.1em;
  margin-bottom: 30px;
}

.test-info {
  margin-bottom: 30px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.info-label {
  font-size: 1.2em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 15px;
}

.info-content ul,
.info-content ol {
  margin: 0;
  padding-left: 20px;
  color: #495057;
}

.info-content li {
  margin-bottom: 8px;
}

.difficulty-info,
.questions-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.difficulty-label,
.questions-label {
  color: #6c757d;
}

.difficulty-value,
.questions-value {
  font-weight: 600;
  color: #007bff;
}

.type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-tag {
  background: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9em;
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
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 20px;
}

.testing-container {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 1000px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.test-header {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
}

.test-progress {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.current-question {
  font-size: 1.2em;
  font-weight: 600;
  color: #007bff;
}

.total-questions {
  color: #6c757d;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.5s ease;
}

.test-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  text-align: center;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9em;
}

.stat-value {
  font-size: 1.3em;
  font-weight: 600;
  color: #007bff;
  display: block;
}

/* 题目容器样式 */
.question-container {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.question-type {
  background: #007bff;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
}

.question-difficulty {
  background: #6c757d;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
}

.question-content {
  margin-bottom: 30px;
}

.question-text {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 20px;
}

/* 数列推理样式 */
.sequence-question {
  text-align: center;
}

.sequence-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
}

.sequence-item {
  width: 60px;
  height: 60px;
  background: white;
  border: 2px solid #007bff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  font-weight: 600;
  color: #007bff;
}

.sequence-item.missing {
  background: #ffc107;
  border-color: #ffc107;
  color: white;
}

/* 图形逻辑样式 */
.pattern-question {
  text-align: center;
}

.pattern-display {
  display: inline-block;
  border: 2px solid #007bff;
  border-radius: 10px;
  padding: 20px;
  background: white;
}

.pattern-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.pattern-row:last-child {
  margin-bottom: 0;
}

.pattern-cell {
  width: 50px;
  height: 50px;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.pattern-cell.filled {
  background: #007bff;
}

.pattern-cell.empty {
  background: white;
}

.pattern-cell.circle {
  background: #28a745;
  border-radius: 50%;
}

.pattern-cell.square {
  background: #dc3545;
}

.pattern-cell.triangle {
  background: #ffc107;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.pattern-cell.question {
  background: #ffc107;
  color: white;
  font-size: 1.5em;
}

/* 逻辑判断样式 */
.logic-question {
  background: white;
  border-radius: 10px;
  padding: 20px;
}

.premise-title {
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.premise-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.premise-list li {
  background: #e3f2fd;
  padding: 10px 15px;
  margin-bottom: 8px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

/* 关系推理样式 */
.relation-question {
  background: white;
  border-radius: 10px;
  padding: 20px;
}

.relation-items {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.relation-item {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
}

.relation-rules {
  margin-top: 20px;
}

.rule-title {
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rule-list li {
  background: #fff3cd;
  padding: 10px 15px;
  margin-bottom: 8px;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

/* 选项样式 */
.options-container {
  margin-bottom: 30px;
}

.options-title {
  font-size: 1.1em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.option-button {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 15px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-button:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.option-button.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.option-button.correct {
  border-color: #28a745;
  background: #d4edda;
}

.option-button.incorrect {
  border-color: #dc3545;
  background: #f8d7da;
}

.option-button:disabled {
  cursor: not-allowed;
}

.option-label {
  background: #007bff;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  color: #495057;
}

/* 反馈样式 */
.feedback-container {
  margin-bottom: 20px;
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid;
}

.feedback-content.correct {
  background: #d4edda;
  border-color: #28a745;
}

.feedback-content.incorrect {
  background: #f8d7da;
  border-color: #dc3545;
}

.feedback-icon {
  font-size: 2em;
  font-weight: 600;
}

.feedback-content.correct .feedback-icon {
  color: #28a745;
}

.feedback-content.incorrect .feedback-icon {
  color: #dc3545;
}

.feedback-text {
  flex: 1;
}

.feedback-result {
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 5px;
}

.feedback-content.correct .feedback-result {
  color: #28a745;
}

.feedback-content.incorrect .feedback-result {
  color: #dc3545;
}

.feedback-explanation {
  color: #495057;
  line-height: 1.5;
}

/* 控制按钮样式 */
.question-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn-hint,
.btn-next,
.btn-submit {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-hint {
  background: #ffc107;
  color: #212529;
}

.btn-hint:hover {
  background: #e0a800;
}

.btn-next {
  background: #28a745;
  color: white;
}

.btn-next:hover {
  background: #218838;
}

.btn-submit {
  background: #007bff;
  color: white;
}

.btn-submit:hover {
  background: #0056b3;
}

/* 结果阶段样式 */
.results-phase {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 20px;
}

.results-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 1200px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.results-title {
  text-align: center;
  font-size: 2.5em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 40px;
}

/* 总体结果样式 */
.overall-results {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 40px;
  margin-bottom: 40px;
  align-items: center;
}

.score-display {
  display: flex;
  justify-content: center;
}

.score-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-inner {
  width: 160px;
  height: 160px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.score-number {
  font-size: 3em;
  font-weight: 700;
  color: #007bff;
}

.score-label {
  font-size: 1.2em;
  color: #6c757d;
  margin-top: 5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
}

.stat-card .stat-number {
  font-size: 2.5em;
  font-weight: 700;
  color: #007bff;
  display: block;
  margin-bottom: 10px;
}

.stat-card .stat-label {
  color: #6c757d;
  font-size: 1.1em;
}

/* 详细分析样式 */
.detailed-analysis {
  margin-bottom: 40px;
}

.analysis-title {
  font-size: 2em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 30px;
  text-align: center;
}

.section-title {
  font-size: 1.5em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 20px;
}

/* 题目类型表现 */
.type-performance {
  margin-bottom: 40px;
}

.type-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.type-stat-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.type-name {
  font-weight: 600;
  color: #495057;
}

.type-score {
  font-size: 1.5em;
  font-weight: 700;
  color: #007bff;
}

.type-details {
  margin-bottom: 15px;
}

.type-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-label {
  color: #6c757d;
}

.detail-value {
  font-weight: 600;
  color: #495057;
}

.type-progress {
  margin-top: 10px;
}

.type-progress .progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.type-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.5s ease;
}

/* 难度表现 */
.difficulty-performance {
  margin-bottom: 40px;
}

.difficulty-chart {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
}

.difficulty-bar {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.difficulty-bar:last-child {
  margin-bottom: 0;
}

.difficulty-label {
  width: 80px;
  font-weight: 600;
  color: #495057;
}

.difficulty-bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  margin-left: 20px;
}

.difficulty-bar-fill {
  height: 20px;
  background: linear-gradient(90deg, #28a745, #20c997);
  border-radius: 10px;
  transition: width 0.5s ease;
  min-width: 20px;
}

.difficulty-percentage {
  margin-left: 15px;
  font-weight: 600;
  color: #495057;
  min-width: 40px;
}

/* 逻辑能力分析 */
.logic-abilities {
  margin-bottom: 40px;
}

.abilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.ability-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
}

.ability-name {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.ability-score {
  font-size: 2em;
  font-weight: 700;
  color: #007bff;
  margin-bottom: 10px;
}

.ability-description {
  color: #6c757d;
  font-size: 0.9em;
  line-height: 1.4;
}

/* 表现评价样式 */
.performance-evaluation {
  margin-bottom: 40px;
}

.evaluation-content {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
}

.evaluation-level {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.level-label {
  font-size: 1.2em;
  font-weight: 600;
  color: #495057;
}

.level-value {
  font-size: 1.5em;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 20px;
}

.level-value.excellent {
  background: #d4edda;
  color: #155724;
}

.level-value.good {
  background: #cce5ff;
  color: #004085;
}

.level-value.average {
  background: #fff3cd;
  color: #856404;
}

.level-value.pass {
  background: #f8d7da;
  color: #721c24;
}

.level-value.needs-improvement {
  background: #f5c6cb;
  color: #721c24;
}

.evaluation-description {
  color: #495057;
  line-height: 1.6;
  margin-bottom: 20px;
}

.evaluation-strengths,
.evaluation-improvements {
  margin-bottom: 20px;
}

.evaluation-strengths h5,
.evaluation-improvements h5 {
  color: #007bff;
  margin-bottom: 10px;
}

.evaluation-strengths ul,
.evaluation-improvements ul {
  margin: 0;
  padding-left: 20px;
}

.evaluation-strengths li,
.evaluation-improvements li {
  color: #495057;
  margin-bottom: 5px;
}

/* 改进建议样式 */
.improvement-suggestions {
  margin-bottom: 40px;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.suggestion-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
}

.suggestion-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.suggestion-title {
  font-size: 1.3em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
}

.suggestion-content ul {
  text-align: left;
  margin: 0;
  padding-left: 20px;
}

.suggestion-content li {
  color: #495057;
  margin-bottom: 8px;
  line-height: 1.5;
}

/* 结果操作按钮 */
.results-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn-secondary,
.btn-primary {
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .instruction-container,
  .testing-container,
  .results-container {
    padding: 20px;
    margin: 10px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .test-stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .overall-results {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .sequence-display {
    flex-wrap: wrap;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .question-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .results-actions {
    flex-direction: column;
    align-items: center;
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
  animation: slideIn 0.4s ease-out;
}

.scale-in {
  animation: scaleIn 0.4s ease-out;
}

/* 主题变量 */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #495057;
  --border-radius: 10px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}
</style>