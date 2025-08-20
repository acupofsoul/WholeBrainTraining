<template>
  <div class="critical-thinking-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase fade-in">
      <div class="instruction-container">
        <h2 class="test-title">批判性思维测试</h2>
        <div class="instruction-content">
          <div class="test-overview">
            <h3>测试目标</h3>
            <p>评估您的批判性思维能力，包括逻辑分析、论证评估、假设识别和推理判断等核心技能。</p>
          </div>
          
          <div class="test-steps">
            <h3>测试步骤</h3>
            <ol>
              <li>仔细阅读每道题目的材料和问题</li>
              <li>运用批判性思维技能进行分析</li>
              <li>选择最合适的答案</li>
              <li>可以使用提示功能获得帮助</li>
              <li>完成所有题目后查看详细分析</li>
            </ol>
          </div>
          
          <div class="test-settings">
            <div class="info-grid">
              <div class="info-card">
                <h4>难度设置</h4>
                <select v-model="settings.difficulty" class="setting-select">
                  <option value="easy">简单 (基础分析)</option>
                  <option value="medium">中等 (综合推理)</option>
                  <option value="hard">困难 (复杂论证)</option>
                </select>
              </div>
              
              <div class="info-card">
                <h4>题目类型</h4>
                <div class="checkbox-group">
                  <label><input type="checkbox" v-model="settings.types" value="argument"> 论证分析</label>
                  <label><input type="checkbox" v-model="settings.types" value="assumption"> 假设识别</label>
                  <label><input type="checkbox" v-model="settings.types" value="inference"> 推理判断</label>
                  <label><input type="checkbox" v-model="settings.types" value="evaluation"> 评估批判</label>
                </div>
              </div>
              
              <div class="info-card">
                <h4>题目数量</h4>
                <select v-model="settings.questionCount" class="setting-select">
                  <option value="10">10题 (快速测试)</option>
                  <option value="20">20题 (标准测试)</option>
                  <option value="30">30题 (完整测试)</option>
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
    
    <!-- 测试进行阶段 -->
    <div v-if="currentPhase === 'testing'" class="testing-phase fade-in">
      <div class="test-header">
        <div class="progress-section">
          <div class="progress-info">
            <span>题目 {{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
            <span>得分: {{ currentScore }}</span>
            <span>正确率: {{ accuracy }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>
        
        <div class="timer-section" v-if="settings.timeLimit">
          <div class="timer">
            <i class="fas fa-clock"></i>
            <span>{{ formatTime(remainingTime) }}</span>
          </div>
        </div>
      </div>
      
      <div class="question-container" v-if="currentQuestion">
        <div class="question-content">
          <div class="question-type-badge" :class="currentQuestion.type">
            {{ getTypeLabel(currentQuestion.type) }}
          </div>
          
          <div class="question-material" v-if="currentQuestion.material">
            <h4>阅读材料</h4>
            <div class="material-content" v-html="currentQuestion.material"></div>
          </div>
          
          <div class="question-text">
            <h4>问题</h4>
            <p v-html="currentQuestion.question"></p>
          </div>
          
          <div class="question-options">
            <div 
              v-for="(option, index) in currentQuestion.options" 
              :key="index"
              class="option-item"
              :class="{ 
                'selected': selectedAnswer === index,
                'correct': showFeedback && index === currentQuestion.correctAnswer,
                'incorrect': showFeedback && selectedAnswer === index && index !== currentQuestion.correctAnswer
              }"
              @click="selectAnswer(index)"
            >
              <span class="option-label">{{ String.fromCharCode(65 + index) }}</span>
              <span class="option-text">{{ option }}</span>
            </div>
          </div>
          
          <div class="question-explanation" v-if="currentQuestion.explanation && showFeedback">
            <h5>解析</h5>
            <p>{{ currentQuestion.explanation }}</p>
          </div>
        </div>
        
        <div class="feedback-section" v-if="feedback.show">
          <div class="feedback-message" :class="feedback.type">
            <i :class="feedback.icon"></i>
            <span>{{ feedback.message }}</span>
          </div>
        </div>
        
        <div class="question-actions">
          <button @click="showHint" class="btn-hint" :disabled="hintUsed">
            <i class="fas fa-lightbulb"></i>
            {{ hintUsed ? '已使用提示' : '获取提示' }}
          </button>
          
          <div class="action-buttons">
            <button @click="previousQuestion" class="btn-prev" :disabled="currentQuestionIndex === 0">
              上一题
            </button>
            <button @click="submitAnswer" class="btn-submit" :disabled="selectedAnswer === null">
              {{ currentQuestionIndex === questions.length - 1 ? '完成测试' : '下一题' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 结果展示阶段 -->
    <div v-if="currentPhase === 'results'" class="results-phase fade-in">
      <div class="results-container">
        <h2 class="results-title">批判性思维测试结果</h2>
        
        <!-- 总体结果 -->
        <div class="overall-results">
          <div class="score-display">
            <div class="score-circle" :style="{ background: getScoreGradient(totalScore) }">
              <div class="score-inner">
                <div class="score-number">{{ totalScore }}</div>
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
              <div class="stat-number">{{ accuracy }}%</div>
              <div class="stat-label">准确率</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ averageTime }}s</div>
              <div class="stat-label">平均用时</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ hintsUsed }}</div>
              <div class="stat-label">使用提示</div>
            </div>
          </div>
        </div>
        
        <!-- 详细分析 -->
        <div class="detailed-analysis">
          <h3 class="analysis-title">详细分析</h3>
          
          <!-- 批判性思维能力分析 -->
          <div class="thinking-skills">
            <h4 class="section-title">批判性思维能力</h4>
            <div class="skills-grid">
              <div v-for="skill in thinkingSkills" :key="skill.name" class="skill-card">
                <div class="skill-header">
                  <span class="skill-icon">{{ skill.icon }}</span>
                  <span class="skill-name">{{ skill.name }}</span>
                  <span class="skill-score">{{ skill.score }}</span>
                </div>
                <div class="skill-description">{{ skill.description }}</div>
                <div class="skill-bar">
                  <div class="bar-fill" :style="{ width: skill.score + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 题目类型表现 -->
          <div class="type-performance">
            <h4 class="section-title">题目类型表现</h4>
            <div class="type-stats">
              <div v-for="type in typePerformance" :key="type.type" class="type-stat-card">
                <div class="type-header">
                  <span class="type-name">{{ type.name }}</span>
                  <span class="type-score">{{ type.score }}%</span>
                </div>
                <div class="type-details">
                  <div class="type-detail">
                    <span class="detail-label">正确数</span>
                    <span class="detail-value">{{ type.correct }}/{{ type.total }}</span>
                  </div>
                  <div class="type-detail">
                    <span class="detail-label">平均用时</span>
                    <span class="detail-value">{{ type.avgTime }}s</span>
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
          
          <!-- 难度表现分析 -->
          <div class="difficulty-analysis">
            <h4 class="section-title">难度表现分析</h4>
            <div class="difficulty-stats">
              <div v-for="diff in difficultyPerformance" :key="diff.level" class="difficulty-card">
                <div class="difficulty-header">
                  <span class="difficulty-name">{{ diff.name }}</span>
                  <span class="difficulty-score">{{ diff.score }}%</span>
                </div>
                <div class="difficulty-details">
                  <div>正确率: {{ diff.accuracy }}%</div>
                  <div>平均用时: {{ diff.avgTime }}s</div>
                  <div>题目数量: {{ diff.count }}</div>
                </div>
                <div class="difficulty-bar">
                  <div class="bar-fill" :style="{ width: diff.score + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 表现评价 -->
        <div class="performance-evaluation">
          <h3 class="analysis-title">表现评价</h3>
          <div class="evaluation-content">
            <div class="evaluation-level">
              <span class="level-label">批判性思维水平:</span>
              <span class="level-value" :class="performanceLevel.class">{{ performanceLevel.label }}</span>
            </div>
            <p class="evaluation-description">{{ performanceLevel.description }}</p>
            
            <div class="evaluation-strengths" v-if="strengths.length > 0">
              <h5>优势能力</h5>
              <ul>
                <li v-for="strength in strengths" :key="strength">{{ strength }}</li>
              </ul>
            </div>
            
            <div class="evaluation-improvements" v-if="improvements.length > 0">
              <h5>改进方向</h5>
              <ul>
                <li v-for="improvement in improvements" :key="improvement">{{ improvement }}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- 提升建议 -->
        <div class="improvement-suggestions">
          <h3 class="analysis-title">批判性思维提升建议</h3>
          <div class="suggestions-grid">
            <div v-for="suggestion in suggestions" :key="suggestion.title" class="suggestion-card">
              <div class="suggestion-icon">{{ suggestion.icon }}</div>
              <h4 class="suggestion-title">{{ suggestion.title }}</h4>
              <div class="suggestion-content">
                <ul>
                  <li v-for="item in suggestion.items" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div class="results-actions">
          <button @click="exportReport" class="btn-secondary">
            <i class="fas fa-download"></i>
            导出报告
          </button>
          <button @click="retakeTest" class="btn-primary">
            <i class="fas fa-redo"></i>
            重新测试
          </button>
          <button @click="goToTraining" class="btn-primary">
            <i class="fas fa-graduation-cap"></i>
            开始训练
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CriticalThinkingTest',
  data() {
    return {
      currentPhase: 'instruction', // instruction, testing, results
      settings: {
        difficulty: 'medium',
        types: ['argument', 'assumption', 'inference', 'evaluation'],
        questionCount: 20,
        timeLimit: true
      },
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswer: null,
      answers: [],
      startTime: null,
      questionStartTime: null,
      remainingTime: 1800, // 30分钟
      timer: null,
      showFeedback: false,
      hintUsed: false,
      feedback: {
        show: false,
        type: '',
        message: '',
        icon: ''
      }
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] || null
    },
    progressPercentage() {
      return (this.currentQuestionIndex / this.questions.length) * 100
    },
    currentScore() {
      return this.answers.reduce((score, answer) => {
        return score + (answer.correct ? this.getQuestionScore(answer.question) : 0)
      }, 0)
    },
    totalScore() {
      return Math.round(this.currentScore)
    },
    correctAnswers() {
      return this.answers.filter(answer => answer.correct).length
    },
    accuracy() {
      return this.answers.length > 0 ? Math.round((this.correctAnswers / this.answers.length) * 100) : 0
    },
    averageTime() {
      if (this.answers.length === 0) return 0
      const totalTime = this.answers.reduce((sum, answer) => sum + answer.timeSpent, 0)
      return Math.round(totalTime / this.answers.length)
    },
    hintsUsed() {
      return this.answers.filter(answer => answer.hintUsed).length
    },
    thinkingSkills() {
      return [
        {
          name: '逻辑分析',
          icon: '🧠',
          score: this.calculateSkillScore('logic'),
          description: '识别论证结构和逻辑关系的能力'
        },
        {
          name: '假设识别',
          icon: '🔍',
          score: this.calculateSkillScore('assumption'),
          description: '发现隐含假设和前提条件的能力'
        },
        {
          name: '推理判断',
          icon: '⚖️',
          score: this.calculateSkillScore('inference'),
          description: '基于证据进行合理推理的能力'
        },
        {
          name: '评估批判',
          icon: '🎯',
          score: this.calculateSkillScore('evaluation'),
          description: '评价论证有效性和可信度的能力'
        }
      ]
    },
    typePerformance() {
      const types = {
        argument: { name: '论证分析', type: 'argument' },
        assumption: { name: '假设识别', type: 'assumption' },
        inference: { name: '推理判断', type: 'inference' },
        evaluation: { name: '评估批判', type: 'evaluation' }
      }
      
      return Object.keys(types).map(type => {
        const typeAnswers = this.answers.filter(answer => answer.question.type === type)
        const correct = typeAnswers.filter(answer => answer.correct).length
        const total = typeAnswers.length
        const avgTime = total > 0 ? Math.round(typeAnswers.reduce((sum, answer) => sum + answer.timeSpent, 0) / total) : 0
        
        return {
          ...types[type],
          correct,
          total,
          score: total > 0 ? Math.round((correct / total) * 100) : 0,
          avgTime
        }
      }).filter(type => type.total > 0)
    },
    difficultyPerformance() {
      const difficulties = {
        easy: { name: '简单', level: 'easy' },
        medium: { name: '中等', level: 'medium' },
        hard: { name: '困难', level: 'hard' }
      }
      
      return Object.keys(difficulties).map(level => {
        const levelAnswers = this.answers.filter(answer => answer.question.difficulty === level)
        const correct = levelAnswers.filter(answer => answer.correct).length
        const count = levelAnswers.length
        const avgTime = count > 0 ? Math.round(levelAnswers.reduce((sum, answer) => sum + answer.timeSpent, 0) / count) : 0
        
        return {
          ...difficulties[level],
          count,
          accuracy: count > 0 ? Math.round((correct / count) * 100) : 0,
          score: count > 0 ? Math.round((correct / count) * 100) : 0,
          avgTime
        }
      }).filter(diff => diff.count > 0)
    },
    performanceLevel() {
      const score = this.accuracy
      if (score >= 90) {
        return {
          class: 'excellent',
          label: '优秀',
          description: '您展现出了卓越的批判性思维能力，能够准确分析复杂问题，识别逻辑漏洞，并做出合理判断。'
        }
      } else if (score >= 80) {
        return {
          class: 'good',
          label: '良好',
          description: '您具备良好的批判性思维基础，在大多数情况下能够进行有效的逻辑分析和推理判断。'
        }
      } else if (score >= 70) {
        return {
          class: 'average',
          label: '中等',
          description: '您的批判性思维能力处于平均水平，在某些方面表现良好，但仍有提升空间。'
        }
      } else if (score >= 60) {
        return {
          class: 'pass',
          label: '及格',
          description: '您的批判性思维能力达到基本要求，但需要加强练习以提高分析和推理能力。'
        }
      } else {
        return {
          class: 'needs-improvement',
          label: '需要提高',
          description: '建议您加强批判性思维的基础训练，重点提升逻辑分析和推理判断能力。'
        }
      }
    },
    strengths() {
      const strengths = []
      if (this.accuracy >= 85) strengths.push('整体表现优秀，思维敏锐')
      if (this.averageTime <= 60) strengths.push('思维反应迅速，决策效率高')
      if (this.hintsUsed <= 2) strengths.push('独立思考能力强，很少依赖提示')
      
      // 检查各技能表现
      this.thinkingSkills.forEach(skill => {
        if (skill.score >= 85) {
          strengths.push(`${skill.name}能力突出`)
        }
      })
      
      return strengths
    },
    improvements() {
      const improvements = []
      if (this.accuracy < 70) improvements.push('需要加强整体批判性思维训练')
      if (this.averageTime > 120) improvements.push('可以提高思维速度和决策效率')
      if (this.hintsUsed > 5) improvements.push('应该培养独立分析问题的能力')
      
      // 检查各技能薄弱环节
      this.thinkingSkills.forEach(skill => {
        if (skill.score < 70) {
          improvements.push(`需要重点提升${skill.name}能力`)
        }
      })
      
      return improvements
    },
    suggestions() {
      return [
        {
          icon: '📚',
          title: '逻辑思维训练',
          items: [
            '学习基本逻辑原理和推理规则',
            '练习识别论证结构和逻辑关系',
            '分析日常生活中的逻辑问题',
            '阅读逻辑学相关书籍和资料'
          ]
        },
        {
          icon: '🔍',
          title: '批判性阅读',
          items: [
            '质疑文章的观点和论据',
            '识别作者的隐含假设',
            '评估证据的可靠性和相关性',
            '练习从多角度分析问题'
          ]
        },
        {
          icon: '💭',
          title: '思维技巧',
          items: [
            '学会提出有效的问题',
            '练习换位思考和多元视角',
            '培养怀疑精神和开放心态',
            '训练归纳和演绎推理能力'
          ]
        },
        {
          icon: '🎯',
          title: '实践应用',
          items: [
            '参与辩论和讨论活动',
            '分析新闻和时事评论',
            '解决实际问题和案例',
            '反思自己的思维过程'
          ]
        }
      ]
    }
  },
  methods: {
    startTest() {
      this.generateQuestions()
      this.currentPhase = 'testing'
      this.startTime = Date.now()
      this.questionStartTime = Date.now()
      if (this.settings.timeLimit) {
        this.startTimer()
      }
    },
    generateQuestions() {
      // 根据设置生成题目
      const questionTypes = this.settings.types
      const questionCount = parseInt(this.settings.questionCount)
      const difficulty = this.settings.difficulty
      
      this.questions = []
      
      for (let i = 0; i < questionCount; i++) {
        const type = questionTypes[i % questionTypes.length]
        this.questions.push(this.createQuestion(type, difficulty, i + 1))
      }
      
      // 打乱题目顺序
      this.questions = this.shuffleArray(this.questions)
    },
    createQuestion(type, difficulty, index) {
      const questionTemplates = {
        argument: this.createArgumentQuestion,
        assumption: this.createAssumptionQuestion,
        inference: this.createInferenceQuestion,
        evaluation: this.createEvaluationQuestion
      }
      
      return questionTemplates[type](difficulty, index)
    },
    createArgumentQuestion(difficulty, index) {
      const templates = {
        easy: {
          material: "小明每天早上都会跑步锻炼。今天早上小明没有跑步。",
          question: "根据以上信息，以下哪个结论最合理？",
          options: [
            "小明今天生病了",
            "小明今天可能有特殊情况",
            "小明不喜欢跑步了",
            "小明改变了锻炼时间"
          ],
          correctAnswer: 1,
          explanation: "根据给定信息，我们只能确定小明今天没有跑步，但不能确定具体原因。选项B最为合理，因为它承认可能存在特殊情况，而不做过度推断。"
        },
        medium: {
          material: "研究显示，经常使用社交媒体的青少年更容易出现焦虑症状。专家建议限制青少年使用社交媒体的时间。",
          question: "这个论证的主要假设是什么？",
          options: [
            "所有青少年都使用社交媒体",
            "社交媒体是导致焦虑的唯一原因",
            "限制使用时间能够减少焦虑症状",
            "焦虑症状对青少年有害"
          ],
          correctAnswer: 2,
          explanation: "专家建议限制使用时间，这个建议基于一个假设：减少社交媒体使用时间能够减少焦虑症状。这是连接问题和解决方案的关键假设。"
        },
        hard: {
          material: "某公司实施弹性工作制后，员工满意度提高了20%，但同时发现项目完成率下降了15%。管理层认为弹性工作制降低了工作效率，决定取消这一制度。",
          question: "管理层的推理存在什么问题？",
          options: [
            "没有考虑其他可能影响项目完成率的因素",
            "过分重视员工满意度而忽视工作效率",
            "没有给弹性工作制足够的试行时间",
            "以上所有问题都存在"
          ],
          correctAnswer: 0,
          explanation: "管理层直接将项目完成率下降归因于弹性工作制，但没有考虑其他可能的因素，如项目难度增加、人员变动、市场环境变化等。这是典型的因果关系推理错误。"
        }
      }
      
      const template = templates[difficulty]
      return {
        id: index,
        type: 'argument',
        difficulty,
        material: template.material,
        question: template.question,
        options: template.options,
        correctAnswer: template.correctAnswer,
        explanation: template.explanation,
        hint: "仔细分析论证的逻辑结构，注意前提和结论之间的关系。"
      }
    },
    createAssumptionQuestion(difficulty, index) {
      const templates = {
        easy: {
          material: "为了减少交通拥堵，市政府决定提高停车费。",
          question: "这个决策基于什么假设？",
          options: [
            "停车费过低是交通拥堵的原因",
            "提高停车费会减少开车出行",
            "公共交通系统足够完善",
            "市民有足够的经济能力支付更高的停车费"
          ],
          correctAnswer: 1,
          explanation: "市政府的决策逻辑是：提高停车费→减少开车出行→减少交通拥堵。这个逻辑链的关键假设是提高停车费会减少开车出行。"
        },
        medium: {
          material: "某学校为了提高学生的学习成绩，决定延长每天的上课时间。校长认为这样可以让学生学到更多知识。",
          question: "校长的想法隐含了哪个假设？",
          options: [
            "学生目前的学习时间不够充分",
            "更多的上课时间等于更好的学习效果",
            "学生有足够的精力应对更长的上课时间",
            "以上所有假设都存在"
          ],
          correctAnswer: 3,
          explanation: "校长的决策基于多个假设：学生需要更多学习时间、时间长度与学习效果成正比、学生能够承受更长的学习时间。所有这些假设都是必要的。"
        },
        hard: {
          material: "一项研究发现，在实施严格环保政策的地区，经济增长率普遍较低。因此，有人认为环保政策阻碍了经济发展，建议放松环保限制以促进经济增长。",
          question: "这个建议基于什么有问题的假设？",
          options: [
            "环保政策是经济增长率低的直接原因",
            "经济增长比环境保护更重要",
            "放松环保限制一定能促进经济增长",
            "短期经济效益比长期可持续发展更重要"
          ],
          correctAnswer: 0,
          explanation: "这个建议的主要问题是假设了因果关系：认为环保政策直接导致经济增长率低。但相关性不等于因果性，可能存在其他因素影响经济增长。"
        }
      }
      
      const template = templates[difficulty]
      return {
        id: index,
        type: 'assumption',
        difficulty,
        material: template.material,
        question: template.question,
        options: template.options,
        correctAnswer: template.correctAnswer,
        explanation: template.explanation,
        hint: "寻找论证中没有明确表达但必须为真的前提条件。"
      }
    },
    createInferenceQuestion(difficulty, index) {
      const templates = {
        easy: {
          material: "图书馆的借阅记录显示：小说类图书的借阅量比去年同期增加了30%，而学术类图书的借阅量减少了20%。",
          question: "根据这些数据，可以合理推断出什么？",
          options: [
            "人们不再重视学术研究",
            "小说的质量比以前提高了",
            "读者的阅读偏好可能发生了变化",
            "图书馆应该减少学术类图书的采购"
          ],
          correctAnswer: 2,
          explanation: "数据显示借阅模式的变化，最合理的推断是读者偏好可能发生了变化。其他选项都是过度推断或没有足够证据支持。"
        },
        medium: {
          material: "某公司的销售数据显示：在推出新的客户服务系统后的三个月内，客户投诉率下降了40%，同时客户满意度调查显示满意度提高了25%。",
          question: "基于这些信息，最合理的推论是什么？",
          options: [
            "新的客户服务系统完全解决了客户问题",
            "新系统可能改善了客户服务质量",
            "客户投诉率下降是因为客户放弃了投诉",
            "公司应该继续投资客户服务系统"
          ],
          correctAnswer: 1,
          explanation: "投诉率下降和满意度提高的数据支持新系统改善了服务质量的推论。选项A过于绝对，选项C是负面推测，选项D是建议而非推论。"
        },
        hard: {
          material: "研究发现，在过去十年中，全球平均气温上升了0.8°C，同时极端天气事件的频率增加了35%。科学家观察到北极冰川融化速度加快，海平面上升了3.2毫米。",
          question: "根据这些观察结果，可以得出什么结论？",
          options: [
            "气候变化的影响正在加速显现",
            "人类活动是气候变化的唯一原因",
            "极端天气事件将继续增加",
            "海平面上升将威胁所有沿海城市"
          ],
          correctAnswer: 0,
          explanation: "多项指标（气温上升、极端天气增加、冰川融化、海平面上升）都指向同一个结论：气候变化的影响正在显现。其他选项要么过于绝对，要么超出了现有证据的支持范围。"
        }
      }
      
      const template = templates[difficulty]
      return {
        id: index,
        type: 'inference',
        difficulty,
        material: template.material,
        question: template.question,
        options: template.options,
        correctAnswer: template.correctAnswer,
        explanation: template.explanation,
        hint: "基于给定的事实和证据，寻找最合理、最有支持的结论。"
      }
    },
    createEvaluationQuestion(difficulty, index) {
      const templates = {
        easy: {
          material: "某品牌声称其产品'获得了90%用户好评'。调查发现，该品牌只调查了购买产品后一周内的100名用户。",
          question: "这个声称存在什么问题？",
          options: [
            "样本数量太少",
            "调查时间太短，无法反映长期使用效果",
            "没有包含未购买产品的用户意见",
            "以上问题都存在"
          ],
          correctAnswer: 3,
          explanation: "这个调查存在多个问题：样本量小、时间短、存在选择偏差（只调查购买者）。这些都影响了结论的可靠性。"
        },
        medium: {
          material: "专家A认为：'减税政策能刺激经济增长，因为历史上每次减税后GDP都有所增长。'专家B反驳：'相关性不等于因果性，GDP增长可能由其他因素导致。'",
          question: "专家B的反驳指出了专家A论证的什么问题？",
          options: [
            "缺乏足够的历史数据支持",
            "混淆了相关关系和因果关系",
            "忽略了减税政策的负面影响",
            "没有考虑不同经济环境的差异"
          ],
          correctAnswer: 1,
          explanation: "专家B正确指出了专家A的逻辑错误：仅仅因为两个事件同时发生（减税和GDP增长），不能证明一个是另一个的原因。这是混淆相关性和因果性的典型错误。"
        },
        hard: {
          material: "某研究声称'每天喝咖啡的人比不喝咖啡的人寿命更长'。研究跟踪了10万人15年，发现喝咖啡组的平均寿命比对照组长2.3年。但研究也发现，喝咖啡组的人普遍收入更高，教育水平更高，更注重健康饮食。",
          question: "这个研究结论的可信度如何？",
          options: [
            "非常可信，因为样本量大且跟踪时间长",
            "不太可信，因为存在混淆变量影响结果",
            "部分可信，但需要控制其他变量后再验证",
            "完全不可信，因为咖啡不可能影响寿命"
          ],
          correctAnswer: 2,
          explanation: "虽然研究设计较好（大样本、长期跟踪），但存在明显的混淆变量（收入、教育、生活方式）。这些因素可能是真正影响寿命的原因。需要控制这些变量后才能得出可靠结论。"
        }
      }
      
      const template = templates[difficulty]
      return {
        id: index,
        type: 'evaluation',
        difficulty,
        material: template.material,
        question: template.question,
        options: template.options,
        correctAnswer: template.correctAnswer,
        explanation: template.explanation,
        hint: "评估论证的强度时，要考虑证据的质量、逻辑的严密性和可能的反驳。"
      }
    },
    selectAnswer(index) {
      if (this.showFeedback) return
      this.selectedAnswer = index
    },
    submitAnswer() {
      if (this.selectedAnswer === null) return
      
      const timeSpent = Math.round((Date.now() - this.questionStartTime) / 1000)
      const isCorrect = this.selectedAnswer === this.currentQuestion.correctAnswer
      
      this.answers.push({
        questionId: this.currentQuestion.id,
        question: this.currentQuestion,
        selectedAnswer: this.selectedAnswer,
        correct: isCorrect,
        timeSpent,
        hintUsed: this.hintUsed
      })
      
      this.showFeedback = true
      this.showAnswerFeedback(isCorrect)
      
      setTimeout(() => {
        this.nextQuestion()
      }, 2000)
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++
        this.selectedAnswer = null
        this.showFeedback = false
        this.hintUsed = false
        this.questionStartTime = Date.now()
        this.hideFeedback()
      } else {
        this.completeTest()
      }
    },
    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
        this.selectedAnswer = null
        this.showFeedback = false
        this.hintUsed = false
        this.hideFeedback()
      }
    },
    showHint() {
      if (this.hintUsed) return
      this.hintUsed = true
      this.showFeedbackMessage('info', this.currentQuestion.hint, 'fas fa-lightbulb')
    },
    showAnswerFeedback(isCorrect) {
      const message = isCorrect ? '回答正确！' : '回答错误，请查看解析。'
      const type = isCorrect ? 'success' : 'error'
      const icon = isCorrect ? 'fas fa-check-circle' : 'fas fa-times-circle'
      this.showFeedbackMessage(type, message, icon)
    },
    showFeedbackMessage(type, message, icon) {
      this.feedback = {
        show: true,
        type,
        message,
        icon
      }
    },
    hideFeedback() {
      this.feedback.show = false
    },
    startTimer() {
      this.timer = setInterval(() => {
        this.remainingTime--
        if (this.remainingTime <= 0) {
          this.completeTest()
        }
      }, 1000)
    },
    completeTest() {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.currentPhase = 'results'
    },
    getQuestionScore(question) {
      const baseScore = 10
      const difficultyMultiplier = {
        easy: 1,
        medium: 1.2,
        hard: 1.5
      }
      return baseScore * difficultyMultiplier[question.difficulty]
    },
    calculateSkillScore(skillType) {
      const skillQuestions = this.answers.filter(answer => {
        return this.getSkillType(answer.question.type) === skillType
      })
      
      if (skillQuestions.length === 0) return 0
      
      const correctCount = skillQuestions.filter(answer => answer.correct).length
      return Math.round((correctCount / skillQuestions.length) * 100)
    },
    getSkillType(questionType) {
      const mapping = {
        argument: 'logic',
        assumption: 'assumption',
        inference: 'inference',
        evaluation: 'evaluation'
      }
      return mapping[questionType] || 'logic'
    },
    getTypeLabel(type) {
      const labels = {
        argument: '论证分析',
        assumption: '假设识别',
        inference: '推理判断',
        evaluation: '评估批判'
      }
      return labels[type] || type
    },
    getScoreGradient(score) {
      if (score >= 90) return 'linear-gradient(135deg, #28a745, #20c997)'
      if (score >= 80) return 'linear-gradient(135deg, #17a2b8, #6f42c1)'
      if (score >= 70) return 'linear-gradient(135deg, #ffc107, #fd7e14)'
      if (score >= 60) return 'linear-gradient(135deg, #6c757d, #495057)'
      return 'linear-gradient(135deg, #dc3545, #c82333)'
    },
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
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    exportReport() {
      // 导出测试报告
      console.log('导出报告功能')
    },
    retakeTest() {
      // 重新开始测试
      this.currentPhase = 'instruction'
      this.currentQuestionIndex = 0
      this.selectedAnswer = null
      this.answers = []
      this.questions = []
      this.showFeedback = false
      this.hintUsed = false
      this.hideFeedback()
      if (this.timer) {
        clearInterval(this.timer)
      }
    },
    goToTraining() {
      // 跳转到训练模块
      this.$router.push('/training/thinking')
    }
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style scoped>
.critical-thinking-test {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 测试说明阶段 */
.instruction-phase {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.instruction-container {
  background: white;
  border-radius: 20px;
  padding: 50px;
  max-width: 900px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.test-title {
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 700;
}

.instruction-content {
  margin-bottom: 40px;
}

.test-overview,
.test-steps {
  margin-bottom: 30px;
}

.test-overview h3,
.test-steps h3 {
  color: #495057;
  font-size: 1.5rem;
  margin-bottom: 15px;
  font-weight: 600;
}

.test-overview p {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
}

.test-steps ol {
  color: #666;
  font-size: 1rem;
  line-height: 1.8;
  padding-left: 20px;
}

.test-steps li {
  margin-bottom: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.info-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  border-left: 5px solid #667eea;
}

.info-card h4 {
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 15px;
  font-weight: 600;
}

.setting-select {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;
}

.setting-select:focus {
  outline: none;
  border-color: #667eea;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #495057;
  cursor: pointer;
  transition: color 0.3s ease;
}

.checkbox-group label:hover {
  color: #667eea;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
}

.instruction-actions {
  text-align: center;
}

.btn-start {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* 测试进行阶段 */
.testing-phase {
  max-width: 1000px;
  margin: 0 auto;
}

.test-header {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.progress-section {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 600;
  color: #495057;
}

.progress-bar {
  background: #e9ecef;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #667eea, #764ba2);
  height: 100%;
  transition: width 0.5s ease;
}

.timer-section {
  text-align: center;
}

.timer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  color: #495057;
}

.question-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.question-type-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: white;
}

.question-type-badge.argument {
  background: linear-gradient(45deg, #e74c3c, #c0392b);
}

.question-type-badge.assumption {
  background: linear-gradient(45deg, #f39c12, #e67e22);
}

.question-type-badge.inference {
  background: linear-gradient(45deg, #3498db, #2980b9);
}

.question-type-badge.evaluation {
  background: linear-gradient(45deg, #9b59b6, #8e44ad);
}

.question-material {
  background: #f8f9fa;
  border-left: 4px solid #667eea;
  padding: 20px;
  margin-bottom: 25px;
  border-radius: 8px;
}

.question-material h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.material-content {
  color: #495057;
  line-height: 1.6;
  font-size: 1rem;
}

.question-text {
  margin-bottom: 30px;
}

.question-text h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.question-text p {
  color: #495057;
  font-size: 1.1rem;
  line-height: 1.6;
}

.question-options {
  margin-bottom: 30px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  margin-bottom: 12px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.option-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.option-item.selected {
  border-color: #667eea;
  background: #e3f2fd;
}

.option-item.correct {
  border-color: #28a745;
  background: #d4edda;
}

.option-item.incorrect {
  border-color: #dc3545;
  background: #f8d7da;
}

.option-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  flex-shrink: 0;
}

.option-item.correct .option-label {
  background: #28a745;
}

.option-item.incorrect .option-label {
  background: #dc3545;
}

.option-text {
  flex: 1;
  color: #495057;
  font-size: 1rem;
  line-height: 1.5;
}

.question-explanation {
  background: #e8f5e8;
  border-left: 4px solid #28a745;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.question-explanation h5 {
  color: #155724;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.question-explanation p {
  color: #155724;
  line-height: 1.6;
  margin: 0;
}

.feedback-section {
  margin: 20px 0;
}

.feedback-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  border-radius: 10px;
  font-weight: 500;
}

.feedback-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.feedback-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.feedback-message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.question-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
}

.btn-hint {
  background: linear-gradient(45deg, #ffc107, #fd7e14);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-hint:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 193, 7, 0.3);
}

.btn-hint:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.btn-prev,
.btn-submit {
  padding: 12px 25px;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-prev {
  background: #6c757d;
  color: white;
}

.btn-prev:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-prev:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 结果展示阶段 */
.results-phase {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.results-container {
  max-width: 1000px;
  margin: 0 auto;
}

.results-title {
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 40px;
  font-weight: 700;
}

/* 总体结果 */
.overall-results {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 40px;
  align-items: center;
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
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
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
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
  box-shadow: inset 0 5px 15px rgba(0,0,0,0.1);
}

.score-number {
  font-size: 3rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 5px;
}

.score-label {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* 详细分析 */
.detailed-analysis {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.analysis-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 600;
  text-align: center;
}

.section-title {
  font-size: 1.5rem;
  color: #495057;
  margin-bottom: 20px;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

/* 批判性思维能力 */
.thinking-skills {
  margin-bottom: 40px;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.skill-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.skill-card:hover {
  transform: translateY(-5px);
  border-color: #667eea;
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.2);
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.skill-icon {
  font-size: 2rem;
}

.skill-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
  text-align: left;
  margin-left: 15px;
}

.skill-score {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.skill-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.4;
}

.skill-bar {
  background: #e9ecef;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  background: linear-gradient(90deg, #667eea, #764ba2);
  height: 100%;
  transition: width 0.8s ease;
}

/* 题目类型表现 */
.type-performance {
  margin-bottom: 40px;
}

.type-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.type-stat-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  border-left: 5px solid #667eea;
  transition: all 0.3s ease;
}

.type-stat-card:hover {
  transform: translateX(5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.type-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.type-score {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.type-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.type-detail {
  display: flex;
  justify-content: space-between;
}

.detail-label {
  color: #666;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 600;
  color: #2c3e50;
}

.type-progress {
  margin-top: 15px;
}

.progress-bar {
  background: #e9ecef;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #667eea, #764ba2);
  height: 100%;
  transition: width 0.8s ease;
}

/* 难度表现分析 */
.difficulty-analysis {
  margin-bottom: 40px;
}

.difficulty-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.difficulty-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.difficulty-card:hover {
  transform: translateY(-3px);
  border-color: #667eea;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.2);
}

.difficulty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.difficulty-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.difficulty-score {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.difficulty-details {
  text-align: left;
  margin-bottom: 15px;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
}

.difficulty-bar {
  background: #e9ecef;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
}

/* 表现评价 */
.performance-evaluation {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.evaluation-content {
  max-width: 800px;
  margin: 0 auto;
}

.evaluation-level {
  text-align: center;
  margin-bottom: 20px;
}

.level-label {
  font-size: 1.2rem;
  color: #666;
  margin-right: 10px;
}

.level-value {
  font-size: 1.8rem;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 25px;
}

.level-value.excellent {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
}

.level-value.good {
  background: linear-gradient(45deg, #17a2b8, #6f42c1);
  color: white;
}

.level-value.average {
  background: linear-gradient(45deg, #ffc107, #fd7e14);
  color: white;
}

.level-value.pass {
  background: linear-gradient(45deg, #6c757d, #495057);
  color: white;
}

.level-value.needs-improvement {
  background: linear-gradient(45deg, #dc3545, #c82333);
  color: white;
}

.evaluation-description {
  font-size: 1.1rem;
  color: #495057;
  text-align: center;
  margin-bottom: 30px;
  line-height: 1.6;
}

.evaluation-strengths,
.evaluation-improvements {
  margin-bottom: 25px;
}

.evaluation-strengths h5,
.evaluation-improvements h5 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.evaluation-strengths ul,
.evaluation-improvements ul {
  list-style: none;
  padding: 0;
}

.evaluation-strengths li,
.evaluation-improvements li {
  background: #f8f9fa;
  padding: 10px 15px;
  margin-bottom: 8px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  color: #495057;
}

.evaluation-improvements li {
  border-left-color: #ffc107;
}

/* 提升建议 */
.improvement-suggestions {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.suggestion-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.suggestion-card:hover {
  transform: translateY(-5px);
  border-color: #667eea;
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.2);
}

.suggestion-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.suggestion-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
}

.suggestion-content ul {
  list-style: none;
  padding: 0;
  text-align: left;
}

.suggestion-content li {
  background: white;
  padding: 12px 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  color: #495057;
  border-left: 3px solid #667eea;
  transition: all 0.3s ease;
}

.suggestion-content li:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* 结果操作按钮 */
.results-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
}

.btn-secondary {
  background: linear-gradient(45deg, #6c757d, #495057);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(108, 117, 125, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(108, 117, 125, 0.4);
}

.btn-primary {
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 123, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .critical-thinking-test {
    padding: 15px;
  }
  
  .instruction-container {
    padding: 30px 20px;
  }
  
  .test-title {
    font-size: 2rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .overall-results {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .skills-grid {
    grid-template-columns: 1fr;
  }
  
  .type-stats {
    grid-template-columns: 1fr;
  }
  
  .difficulty-stats {
    grid-template-columns: 1fr;
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
  
  .question-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .action-buttons {
    justify-content: center;
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
  animation: slideIn 0.5s ease-out;
}

.scale-in {
  animation: scaleIn 0.4s ease-out;
}

/* 主题变量 */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --border-radius: 10px;
  --box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  --transition: all 0.3s ease;
}
</style>