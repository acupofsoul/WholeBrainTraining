<template>
  <div class="problem-solving-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase fade-in">
      <div class="instruction-container">
        <h2 class="test-title">🧩 问题解决能力测试</h2>
        
        <div class="test-description">
          <div class="description-card">
            <h3>📋 测试目标</h3>
            <p>评估您的问题分析、策略制定、逻辑推理和解决方案实施能力，全面测评问题解决的综合水平。</p>
          </div>
          
          <div class="description-card">
            <h3>📝 测试步骤</h3>
            <ol>
              <li>仔细阅读问题描述和背景信息</li>
              <li>分析问题的关键要素和约束条件</li>
              <li>制定解决策略并选择最佳方案</li>
              <li>在规定时间内完成所有题目</li>
            </ol>
          </div>
        </div>
        
        <div class="test-settings">
          <div class="settings-grid">
            <div class="setting-card">
              <h4>🎯 难度等级</h4>
              <select v-model="settings.difficulty" class="setting-select">
                <option value="easy">简单 (基础问题)</option>
                <option value="medium">中等 (综合问题)</option>
                <option value="hard">困难 (复杂问题)</option>
              </select>
            </div>
            
            <div class="setting-card">
              <h4>📊 题目类型</h4>
              <div class="type-options">
                <label class="type-option">
                  <input type="checkbox" v-model="settings.types" value="logic">
                  <span>逻辑推理</span>
                </label>
                <label class="type-option">
                  <input type="checkbox" v-model="settings.types" value="math">
                  <span>数学问题</span>
                </label>
                <label class="type-option">
                  <input type="checkbox" v-model="settings.types" value="strategy">
                  <span>策略规划</span>
                </label>
                <label class="type-option">
                  <input type="checkbox" v-model="settings.types" value="practical">
                  <span>实际应用</span>
                </label>
              </div>
            </div>
            
            <div class="setting-card">
              <h4>🔢 题目数量</h4>
              <select v-model="settings.questionCount" class="setting-select">
                <option value="10">10题 (快速测试)</option>
                <option value="15">15题 (标准测试)</option>
                <option value="20">20题 (完整测试)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="start-section">
          <button @click="startTest" class="btn-start">
            <i class="fas fa-play"></i>
            开始测试
          </button>
        </div>
      </div>
    </div>
    
    <!-- 测试进行中阶段 -->
    <div v-if="currentPhase === 'testing'" class="testing-phase fade-in">
      <div class="test-container">
        <!-- 测试头部 -->
        <div class="test-header">
          <div class="progress-section">
            <div class="progress-info">
              <span class="progress-text">进度: {{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
              </div>
            </div>
          </div>
          
          <div class="stats-section">
            <div class="stat-item">
              <span class="stat-label">得分</span>
              <span class="stat-value">{{ currentScore }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">正确率</span>
              <span class="stat-value">{{ accuracyRate }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">剩余时间</span>
              <span class="stat-value">{{ formatTime(remainingTime) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 题目内容 -->
        <div class="question-content" v-if="currentQuestion">
          <div class="question-header">
            <div class="question-type">
              <i :class="getTypeIcon(currentQuestion.type)"></i>
              {{ getTypeName(currentQuestion.type) }}
            </div>
            <div class="question-difficulty">
              <span class="difficulty-badge" :class="currentQuestion.difficulty">
                {{ getDifficultyName(currentQuestion.difficulty) }}
              </span>
            </div>
          </div>
          
          <div class="question-body">
            <h3 class="question-title">{{ currentQuestion.title }}</h3>
            <div class="question-description" v-html="currentQuestion.description"></div>
            
            <!-- 问题背景信息 -->
            <div v-if="currentQuestion.background" class="question-background">
              <h4>📋 背景信息</h4>
              <div v-html="currentQuestion.background"></div>
            </div>
            
            <!-- 约束条件 -->
            <div v-if="currentQuestion.constraints" class="question-constraints">
              <h4>⚠️ 约束条件</h4>
              <ul>
                <li v-for="constraint in currentQuestion.constraints" :key="constraint">{{ constraint }}</li>
              </ul>
            </div>
            
            <!-- 选择题选项 -->
            <div v-if="currentQuestion.type !== 'open'" class="question-options">
              <div 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="option-item"
                :class="{ selected: selectedAnswer === index }"
                @click="selectAnswer(index)"
              >
                <div class="option-label">{{ String.fromCharCode(65 + index) }}</div>
                <div class="option-content">{{ option }}</div>
              </div>
            </div>
            
            <!-- 开放题输入 -->
            <div v-if="currentQuestion.type === 'open'" class="open-answer">
              <h4>💭 请详细描述您的解决方案</h4>
              <textarea 
                v-model="openAnswer"
                placeholder="请在此输入您的解决思路和具体方案..."
                class="answer-textarea"
                rows="8"
              ></textarea>
              <div class="answer-tips">
                <p>💡 建议包含以下要素：</p>
                <ul>
                  <li>问题分析和关键要素识别</li>
                  <li>解决策略和方法选择</li>
                  <li>具体实施步骤</li>
                  <li>预期结果和风险评估</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 反馈区域 -->
        <div v-if="showFeedback" class="feedback-section" :class="feedbackType">
          <div class="feedback-content">
            <i :class="feedbackType === 'correct' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
            <span>{{ feedbackMessage }}</span>
          </div>
        </div>
        
        <!-- 控制按钮 -->
        <div class="question-actions">
          <button 
            @click="previousQuestion" 
            :disabled="currentQuestionIndex === 0"
            class="btn btn-prev"
          >
            <i class="fas fa-chevron-left"></i>
            上一题
          </button>
          
          <div class="action-buttons">
            <button @click="showHint" class="btn btn-hint" :disabled="hintUsed">
              <i class="fas fa-lightbulb"></i>
              提示
            </button>
            <button @click="skipQuestion" class="btn btn-skip">
              <i class="fas fa-forward"></i>
              跳过
            </button>
          </div>
          
          <button 
            @click="nextQuestion" 
            :disabled="!canProceed"
            class="btn btn-next"
          >
            {{ isLastQuestion ? '完成测试' : '下一题' }}
            <i :class="isLastQuestion ? 'fas fa-flag-checkered' : 'fas fa-chevron-right'"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 结果展示阶段 -->
    <div v-if="currentPhase === 'results'" class="results-phase fade-in">
      <div class="results-container">
        <h2 class="results-title">🎯 问题解决能力测试结果</h2>
        
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
              <div class="stat-number">{{ accuracyRate }}%</div>
              <div class="stat-label">正确率</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ formatTime(averageTime) }}</div>
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
          <h3 class="analysis-title">📊 详细分析</h3>
          
          <!-- 问题解决能力 -->
          <div class="solving-skills">
            <h4 class="section-title">🧠 问题解决能力分析</h4>
            <div class="skills-grid">
              <div class="skill-card" v-for="skill in solvingSkills" :key="skill.name">
                <div class="skill-header">
                  <i :class="skill.icon"></i>
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
            <h4 class="section-title">📋 题目类型表现</h4>
            <div class="type-stats">
              <div class="type-stat-card" v-for="type in typePerformance" :key="type.type">
                <div class="type-header">
                  <span class="type-name">{{ type.name }}</span>
                  <span class="type-score">{{ type.score }}%</span>
                </div>
                <div class="type-details">
                  <div class="type-detail">
                    <span class="detail-label">答对</span>
                    <span class="detail-value">{{ type.correct }}/{{ type.total }}</span>
                  </div>
                  <div class="type-detail">
                    <span class="detail-label">平均用时</span>
                    <span class="detail-value">{{ formatTime(type.avgTime) }}</span>
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
            <h4 class="section-title">⭐ 难度表现分析</h4>
            <div class="difficulty-stats">
              <div class="difficulty-card" v-for="diff in difficultyPerformance" :key="diff.level">
                <div class="difficulty-header">
                  <span class="difficulty-name">{{ diff.name }}</span>
                  <span class="difficulty-score">{{ diff.score }}%</span>
                </div>
                <div class="difficulty-details">
                  正确率: {{ diff.accuracy }}% | 平均用时: {{ formatTime(diff.avgTime) }}
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
          <h3 class="analysis-title">🏆 表现评价</h3>
          <div class="evaluation-content">
            <div class="evaluation-level">
              <span class="level-label">综合水平:</span>
              <span class="level-value" :class="performanceLevel.class">{{ performanceLevel.label }}</span>
            </div>
            <p class="evaluation-description">{{ performanceLevel.description }}</p>
            
            <div class="evaluation-strengths" v-if="strengths.length > 0">
              <h5>💪 优势能力</h5>
              <ul>
                <li v-for="strength in strengths" :key="strength">{{ strength }}</li>
              </ul>
            </div>
            
            <div class="evaluation-improvements" v-if="improvements.length > 0">
              <h5>📈 提升空间</h5>
              <ul>
                <li v-for="improvement in improvements" :key="improvement">{{ improvement }}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- 提升建议 -->
        <div class="improvement-suggestions">
          <h3 class="analysis-title">💡 能力提升建议</h3>
          <div class="suggestions-grid">
            <div class="suggestion-card" v-for="suggestion in suggestions" :key="suggestion.title">
              <i :class="suggestion.icon"></i>
              <h4 class="suggestion-title">{{ suggestion.title }}</h4>
              <div class="suggestion-content">
                <ul>
                  <li v-for="tip in suggestion.tips" :key="tip">{{ tip }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 结果操作 -->
        <div class="results-actions">
          <button @click="exportReport" class="btn btn-secondary">
            <i class="fas fa-download"></i>
            导出报告
          </button>
          <button @click="retakeTest" class="btn btn-primary">
            <i class="fas fa-redo"></i>
            重新测试
          </button>
          <button @click="goToTraining" class="btn btn-primary">
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
  name: 'ProblemSolvingTest',
  data() {
    return {
      currentPhase: 'instruction', // instruction, testing, results
      
      // 测试设置
      settings: {
        difficulty: 'medium',
        types: ['logic', 'math', 'strategy', 'practical'],
        questionCount: 15
      },
      
      // 测试状态
      currentQuestionIndex: 0,
      selectedAnswer: null,
      openAnswer: '',
      questions: [],
      answers: [],
      startTime: null,
      questionStartTime: null,
      remainingTime: 1800, // 30分钟
      timer: null,
      
      // 反馈
      showFeedback: false,
      feedbackType: '',
      feedbackMessage: '',
      hintUsed: false,
      hintsUsed: 0,
      
      // 结果数据
      totalScore: 0,
      correctAnswers: 0,
      questionTimes: [],
      typePerformance: [],
      difficultyPerformance: [],
      solvingSkills: []
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
      return this.answers.reduce((sum, answer) => sum + (answer.score || 0), 0)
    },
    
    accuracyRate() {
      if (this.answers.length === 0) return 0
      const correct = this.answers.filter(a => a.correct).length
      return Math.round((correct / this.answers.length) * 100)
    },
    
    averageTime() {
      if (this.questionTimes.length === 0) return 0
      return this.questionTimes.reduce((sum, time) => sum + time, 0) / this.questionTimes.length
    },
    
    canProceed() {
      if (this.currentQuestion?.type === 'open') {
        return this.openAnswer.trim().length > 0
      }
      return this.selectedAnswer !== null
    },
    
    isLastQuestion() {
      return this.currentQuestionIndex === this.questions.length - 1
    },
    
    performanceLevel() {
      const score = this.totalScore
      if (score >= 90) {
        return {
          class: 'excellent',
          label: '优秀',
          description: '您的问题解决能力非常出色，能够快速准确地分析和解决各种复杂问题。'
        }
      } else if (score >= 80) {
        return {
          class: 'good',
          label: '良好',
          description: '您具备良好的问题解决能力，在大多数情况下能够有效地处理问题。'
        }
      } else if (score >= 70) {
        return {
          class: 'average',
          label: '中等',
          description: '您的问题解决能力处于平均水平，在某些方面还有提升空间。'
        }
      } else if (score >= 60) {
        return {
          class: 'pass',
          label: '及格',
          description: '您的问题解决能力基本达标，但需要更多练习来提高。'
        }
      } else {
        return {
          class: 'needs-improvement',
          label: '待提高',
          description: '建议加强问题解决技能的训练，提高分析和解决问题的能力。'
        }
      }
    },
    
    strengths() {
      const strengths = []
      if (this.accuracyRate >= 80) strengths.push('答题准确率高')
      if (this.averageTime <= 60) strengths.push('解题速度快')
      if (this.hintsUsed <= 2) strengths.push('独立思考能力强')
      
      // 根据类型表现添加优势
      this.typePerformance.forEach(type => {
        if (type.score >= 85) {
          strengths.push(`${type.name}能力突出`)
        }
      })
      
      return strengths
    },
    
    improvements() {
      const improvements = []
      if (this.accuracyRate < 70) improvements.push('提高答题准确率')
      if (this.averageTime > 120) improvements.push('提升解题效率')
      if (this.hintsUsed > 5) improvements.push('增强独立分析能力')
      
      // 根据类型表现添加改进建议
      this.typePerformance.forEach(type => {
        if (type.score < 60) {
          improvements.push(`加强${type.name}训练`)
        }
      })
      
      return improvements
    },
    
    suggestions() {
      return [
        {
          icon: 'fas fa-brain',
          title: '逻辑思维训练',
          tips: [
            '练习逻辑推理题目',
            '学习结构化思维方法',
            '培养批判性思维',
            '多角度分析问题'
          ]
        },
        {
          icon: 'fas fa-chess',
          title: '策略规划能力',
          tips: [
            '学习系统性分析方法',
            '练习制定解决方案',
            '培养全局思维',
            '提高决策能力'
          ]
        },
        {
          icon: 'fas fa-tools',
          title: '实践应用技能',
          tips: [
            '多做实际案例分析',
            '参与项目实践',
            '学习专业工具使用',
            '积累解决经验'
          ]
        },
        {
          icon: 'fas fa-users',
          title: '协作解决问题',
          tips: [
            '参与团队讨论',
            '学习沟通技巧',
            '分享解决思路',
            '借鉴他人经验'
          ]
        }
      ]
    }
  },
  
  methods: {
    // 开始测试
    startTest() {
      this.generateQuestions()
      this.currentPhase = 'testing'
      this.startTime = Date.now()
      this.questionStartTime = Date.now()
      this.startTimer()
    },
    
    // 生成题目
    generateQuestions() {
      const questions = []
      const types = this.settings.types
      const count = parseInt(this.settings.questionCount)
      
      for (let i = 0; i < count; i++) {
        const type = types[i % types.length]
        const difficulty = this.settings.difficulty
        questions.push(this.generateQuestion(type, difficulty, i + 1))
      }
      
      this.questions = questions
    },
    
    // 生成单个题目
    generateQuestion(type, difficulty, index) {
      const questionTemplates = {
        logic: {
          easy: [
            {
              title: '逻辑推理题',
              description: '如果所有的A都是B，所有的B都是C，那么所有的A都是C。这个推理是否正确？',
              options: ['正确', '错误', '无法确定', '需要更多信息'],
              correct: 0,
              explanation: '这是一个有效的三段论推理，结论正确。'
            }
          ],
          medium: [
            {
              title: '复杂逻辑推理',
              description: '在一个小镇上，理发师只给那些不给自己理发的人理发。请问：理发师给自己理发吗？',
              options: ['给自己理发', '不给自己理发', '这是一个悖论', '无法判断'],
              correct: 2,
              explanation: '这是著名的理发师悖论，是一个逻辑悖论。'
            }
          ],
          hard: [
            {
              title: '高级逻辑分析',
              description: '有三个盒子，每个盒子上都有一个标签。已知所有标签都是错误的。盒子A标签："这个盒子里有金币"，盒子B标签："盒子A里没有金币"，盒子C标签："只有一个盒子里有金币"。请问金币在哪个盒子里？',
              options: ['盒子A', '盒子B', '盒子C', '无法确定'],
              correct: 1,
              explanation: '通过逻辑推理，金币在盒子B中。'
            }
          ]
        },
        math: {
          easy: [
            {
              title: '数学应用题',
              description: '一个水池有两个进水管和一个出水管。甲管每小时进水10立方米，乙管每小时进水15立方米，出水管每小时出水8立方米。如果同时开启所有管道，多长时间能装满容量为340立方米的水池？',
              options: ['15小时', '20小时', '25小时', '30小时'],
              correct: 1,
              explanation: '净进水速度为10+15-8=17立方米/小时，340÷17=20小时。'
            }
          ],
          medium: [
            {
              title: '优化问题',
              description: '一个农场主有120米的篱笆，要围成一个矩形菜园。如果菜园的一边靠墙（不需要篱笆），如何设计能使菜园面积最大？',
              options: ['长60米，宽30米', '长40米，宽40米', '长80米，宽20米', '长90米，宽15米'],
              correct: 0,
              explanation: '设垂直于墙的边长为x，则面积S=x(120-2x)，当x=30时面积最大。'
            }
          ],
          hard: [
            {
              title: '复杂数学建模',
              description: '一家公司的利润P与投资额I的关系为P=100I-I²。如果公司有资金限制，最多只能投资80万元，且希望利润至少达到1500万元，投资额的取值范围是多少？',
              options: ['20-80万元', '30-70万元', '25-75万元', '15-85万元'],
              correct: 2,
              explanation: '解不等式100I-I²≥1500，得到25≤I≤75。'
            }
          ]
        },
        strategy: {
          easy: [
            {
              title: '简单策略规划',
              description: '你需要在有限的时间内完成多个任务。任务A需要2小时，重要性8分；任务B需要3小时，重要性6分；任务C需要1小时，重要性9分。你只有4小时时间，应该如何安排？',
              options: ['先做A再做C', '先做B再做C', '先做C再做A', '先做C再做B'],
              correct: 2,
              explanation: '按重要性/时间比排序，C最高，然后是A。'
            }
          ],
          medium: [
            {
              title: '资源分配策略',
              description: '一个项目团队有5个成员，需要完成3个子项目。每个成员的技能水平不同，每个子项目的难度也不同。如何分配人员能够最大化整体效率？',
              background: '成员技能：A(高级)、B(中级)、C(高级)、D(初级)、E(中级)\n项目难度：项目1(高难度)、项目2(中难度)、项目3(低难度)',
              constraints: ['每个项目至少需要1人', '高难度项目需要高级成员参与', '总工期不能超过预算'],
              options: [
                '项目1:A,B; 项目2:C,E; 项目3:D',
                '项目1:A,C; 项目2:B,E; 项目3:D',
                '项目1:A,E; 项目2:C,B; 项目3:D',
                '项目1:C,B; 项目2:A,E; 项目3:D'
              ],
              correct: 1,
              explanation: '高难度项目分配两个高级成员，中难度项目分配中级成员，低难度项目分配初级成员。'
            }
          ],
          hard: [
            {
              title: '复杂战略决策',
              description: '一家科技公司面临市场变化，需要制定未来3年的发展策略。',
              background: '当前状况：公司在传统业务领域处于领先地位，但新兴技术正在冲击市场。\n资源状况：研发资金充足，但人才储备不足。\n市场环境：竞争激烈，客户需求快速变化。',
              constraints: [
                '研发投入不能超过年收入的30%',
                '人员扩张受到预算限制',
                '必须保持现有业务的稳定性',
                '新技术投入存在风险'
              ],
              type: 'open',
              scoring: {
                analysis: 25,    // 问题分析
                strategy: 30,    // 策略制定
                implementation: 25, // 实施计划
                risk: 20         // 风险评估
              }
            }
          ]
        },
        practical: {
          easy: [
            {
              title: '日常问题解决',
              description: '你的手机突然无法连接WiFi，但其他设备都能正常连接。你会采取什么步骤来解决这个问题？',
              options: [
                '重启手机',
                '忘记WiFi网络后重新连接',
                '检查手机WiFi设置',
                '以上所有步骤都尝试'
              ],
              correct: 3,
              explanation: '系统性的故障排除方法最有效。'
            }
          ],
          medium: [
            {
              title: '工作场景问题',
              description: '你负责一个重要项目，但发现团队成员之间存在沟通问题，导致进度延迟。你会如何处理？',
              background: '项目截止日期临近，客户期望很高，团队士气低落。',
              constraints: ['不能更换团队成员', '预算已经确定', '时间紧迫'],
              options: [
                '增加会议频率，加强沟通',
                '重新分配任务，明确责任',
                '引入项目管理工具',
                '综合采用多种措施'
              ],
              correct: 3,
              explanation: '复杂问题需要综合解决方案。'
            }
          ],
          hard: [
            {
              title: '复杂实际问题',
              description: '作为一家中小企业的管理者，你面临以下挑战：销售下滑、员工流失、资金紧张。请制定一个综合解决方案。',
              background: '公司成立5年，主要业务是软件开发服务。\n近6个月销售额下降30%，核心员工离职率达到20%。\n现金流紧张，只能维持3个月运营。',
              constraints: [
                '不能大幅裁员',
                '银行贷款困难',
                '市场竞争激烈',
                '客户要求越来越高'
              ],
              type: 'open',
              scoring: {
                urgency: 20,     // 紧急问题处理
                strategy: 25,    // 长期策略
                resources: 25,   // 资源利用
                feasibility: 30  // 可行性
              }
            }
          ]
        }
      }
      
      const templates = questionTemplates[type][difficulty]
      const template = templates[Math.floor(Math.random() * templates.length)]
      
      return {
        id: index,
        type,
        difficulty,
        ...template
      }
    },
    
    // 选择答案
    selectAnswer(index) {
      this.selectedAnswer = index
      this.hintUsed = false
    },
    
    // 下一题
    nextQuestion() {
      this.submitAnswer()
      
      if (this.isLastQuestion) {
        this.completeTest()
      } else {
        this.currentQuestionIndex++
        this.resetQuestionState()
      }
    },
    
    // 上一题
    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
        this.loadPreviousAnswer()
      }
    },
    
    // 提交答案
    submitAnswer() {
      const question = this.currentQuestion
      const timeSpent = Date.now() - this.questionStartTime
      
      let answer = {
        questionId: question.id,
        timeSpent,
        hintUsed: this.hintUsed
      }
      
      if (question.type === 'open') {
        answer.answer = this.openAnswer
        answer.score = this.scoreOpenAnswer(this.openAnswer, question)
        answer.correct = answer.score >= 60
      } else {
        answer.answer = this.selectedAnswer
        answer.correct = this.selectedAnswer === question.correct
        answer.score = answer.correct ? (this.hintUsed ? 80 : 100) : 0
      }
      
      this.answers[this.currentQuestionIndex] = answer
      this.questionTimes.push(timeSpent)
      
      // 显示反馈
      this.showAnswerFeedback(answer.correct, question)
    },
    
    // 评分开放题
    scoreOpenAnswer(answer, question) {
      if (!answer || answer.trim().length < 50) return 0
      
      let score = 0
      const content = answer.toLowerCase()
      
      if (question.scoring) {
        // 根据评分标准评分
        if (content.includes('分析') || content.includes('问题')) score += question.scoring.analysis || 20
        if (content.includes('策略') || content.includes('方案')) score += question.scoring.strategy || 20
        if (content.includes('实施') || content.includes('步骤')) score += question.scoring.implementation || 20
        if (content.includes('风险') || content.includes('评估')) score += question.scoring.risk || 20
      } else {
        // 基础评分
        if (answer.length > 100) score += 20
        if (answer.length > 200) score += 20
        if (content.includes('分析')) score += 15
        if (content.includes('解决')) score += 15
        if (content.includes('步骤') || content.includes('方法')) score += 15
        if (content.includes('结果') || content.includes('效果')) score += 15
      }
      
      return Math.min(score, 100)
    },
    
    // 显示答案反馈
    showAnswerFeedback(correct, question) {
      this.showFeedback = true
      this.feedbackType = correct ? 'correct' : 'incorrect'
      
      if (correct) {
        this.feedbackMessage = '回答正确！'
      } else {
        this.feedbackMessage = `回答错误。${question.explanation || ''}`
      }
      
      setTimeout(() => {
        this.showFeedback = false
      }, 3000)
    },
    
    // 显示提示
    showHint() {
      if (this.hintUsed) return
      
      const question = this.currentQuestion
      let hint = ''
      
      switch (question.type) {
        case 'logic':
          hint = '仔细分析逻辑关系，注意前提和结论之间的联系。'
          break
        case 'math':
          hint = '列出已知条件，建立数学模型，逐步求解。'
          break
        case 'strategy':
          hint = '考虑所有约束条件，权衡不同方案的优缺点。'
          break
        case 'practical':
          hint = '从实际角度出发，考虑可操作性和效果。'
          break
        default:
          hint = '仔细阅读题目，分析关键信息。'
      }
      
      alert(`💡 提示：${hint}`)
      this.hintUsed = true
      this.hintsUsed++
    },
    
    // 跳过题目
    skipQuestion() {
      const timeSpent = Date.now() - this.questionStartTime
      
      this.answers[this.currentQuestionIndex] = {
        questionId: this.currentQuestion.id,
        answer: null,
        correct: false,
        score: 0,
        timeSpent,
        skipped: true
      }
      
      this.questionTimes.push(timeSpent)
      
      if (this.isLastQuestion) {
        this.completeTest()
      } else {
        this.currentQuestionIndex++
        this.resetQuestionState()
      }
    },
    
    // 重置题目状态
    resetQuestionState() {
      this.selectedAnswer = null
      this.openAnswer = ''
      this.hintUsed = false
      this.showFeedback = false
      this.questionStartTime = Date.now()
    },
    
    // 加载上一题答案
    loadPreviousAnswer() {
      const answer = this.answers[this.currentQuestionIndex]
      if (answer) {
        if (this.currentQuestion.type === 'open') {
          this.openAnswer = answer.answer || ''
        } else {
          this.selectedAnswer = answer.answer
        }
      } else {
        this.resetQuestionState()
      }
    },
    
    // 完成测试
    completeTest() {
      clearInterval(this.timer)
      this.calculateResults()
      this.currentPhase = 'results'
    },
    
    // 计算结果
    calculateResults() {
      // 基础统计
      this.correctAnswers = this.answers.filter(a => a.correct).length
      this.totalScore = Math.round(this.answers.reduce((sum, a) => sum + a.score, 0) / this.answers.length)
      
      // 计算各类型表现
      this.calculateTypePerformance()
      
      // 计算难度表现
      this.calculateDifficultyPerformance()
      
      // 计算解决技能
      this.calculateSolvingSkills()
    },
    
    // 计算类型表现
    calculateTypePerformance() {
      const types = ['logic', 'math', 'strategy', 'practical']
      const typeNames = {
        logic: '逻辑推理',
        math: '数学问题',
        strategy: '策略规划',
        practical: '实际应用'
      }
      
      this.typePerformance = types.map(type => {
        const typeQuestions = this.questions.filter(q => q.type === type)
        const typeAnswers = typeQuestions.map(q => this.answers.find(a => a.questionId === q.id))
        
        const correct = typeAnswers.filter(a => a && a.correct).length
        const total = typeQuestions.length
        const score = total > 0 ? Math.round((correct / total) * 100) : 0
        const avgTime = typeAnswers.length > 0 ? 
          typeAnswers.reduce((sum, a) => sum + (a?.timeSpent || 0), 0) / typeAnswers.length : 0
        
        return {
          type,
          name: typeNames[type],
          correct,
          total,
          score,
          avgTime
        }
      }).filter(t => t.total > 0)
    },
    
    // 计算难度表现
    calculateDifficultyPerformance() {
      const difficulties = ['easy', 'medium', 'hard']
      const diffNames = {
        easy: '简单',
        medium: '中等',
        hard: '困难'
      }
      
      this.difficultyPerformance = difficulties.map(level => {
        const diffQuestions = this.questions.filter(q => q.difficulty === level)
        const diffAnswers = diffQuestions.map(q => this.answers.find(a => a.questionId === q.id))
        
        const correct = diffAnswers.filter(a => a && a.correct).length
        const total = diffQuestions.length
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
        const avgTime = diffAnswers.length > 0 ? 
          diffAnswers.reduce((sum, a) => sum + (a?.timeSpent || 0), 0) / diffAnswers.length : 0
        
        return {
          level,
          name: diffNames[level],
          score: accuracy,
          accuracy,
          avgTime
        }
      }).filter(d => d.accuracy > 0)
    },
    
    // 计算解决技能
    calculateSolvingSkills() {
      this.solvingSkills = [
        {
          name: '问题分析',
          icon: 'fas fa-search',
          score: Math.min(100, this.totalScore + (this.hintsUsed <= 2 ? 10 : -10)),
          description: '识别和分析问题核心要素的能力'
        },
        {
          name: '逻辑推理',
          icon: 'fas fa-brain',
          score: this.getTypeScore('logic'),
          description: '运用逻辑思维进行推理的能力'
        },
        {
          name: '策略制定',
          icon: 'fas fa-chess',
          score: this.getTypeScore('strategy'),
          description: '制定有效解决方案的能力'
        },
        {
          name: '实施执行',
          icon: 'fas fa-cogs',
          score: Math.min(100, this.totalScore + (this.averageTime <= 90 ? 15 : -5)),
          description: '将解决方案付诸实践的能力'
        }
      ]
    },
    
    // 获取类型得分
    getTypeScore(type) {
      const typePerf = this.typePerformance.find(t => t.type === type)
      return typePerf ? typePerf.score : this.totalScore
    },
    
    // 开始计时器
    startTimer() {
      this.timer = setInterval(() => {
        this.remainingTime--
        if (this.remainingTime <= 0) {
          this.completeTest()
        }
      }, 1000)
    },
    
    // 格式化时间
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    // 获取类型图标
    getTypeIcon(type) {
      const icons = {
        logic: 'fas fa-brain',
        math: 'fas fa-calculator',
        strategy: 'fas fa-chess',
        practical: 'fas fa-tools'
      }
      return icons[type] || 'fas fa-question'
    },
    
    // 获取类型名称
    getTypeName(type) {
      const names = {
        logic: '逻辑推理',
        math: '数学问题',
        strategy: '策略规划',
        practical: '实际应用'
      }
      return names[type] || '未知类型'
    },
    
    // 获取难度名称
    getDifficultyName(difficulty) {
      const names = {
        easy: '简单',
        medium: '中等',
        hard: '困难'
      }
      return names[difficulty] || '未知'
    },
    
    // 获取分数渐变色
    getScoreGradient(score) {
      if (score >= 90) return 'linear-gradient(45deg, #28a745, #20c997)'
      if (score >= 80) return 'linear-gradient(45deg, #17a2b8, #6f42c1)'
      if (score >= 70) return 'linear-gradient(45deg, #ffc107, #fd7e14)'
      if (score >= 60) return 'linear-gradient(45deg, #6c757d, #495057)'
      return 'linear-gradient(45deg, #dc3545, #c82333)'
    },
    
    // 导出报告
    exportReport() {
      const report = {
        testType: '问题解决能力测试',
        date: new Date().toLocaleDateString(),
        settings: this.settings,
        results: {
          totalScore: this.totalScore,
          correctAnswers: this.correctAnswers,
          accuracyRate: this.accuracyRate,
          averageTime: this.averageTime,
          hintsUsed: this.hintsUsed
        },
        performance: {
          level: this.performanceLevel,
          typePerformance: this.typePerformance,
          difficultyPerformance: this.difficultyPerformance,
          solvingSkills: this.solvingSkills
        },
        suggestions: this.suggestions
      }
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `问题解决能力测试报告_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
    
    // 重新测试
    retakeTest() {
      // 重置所有数据
      this.currentPhase = 'instruction'
      this.currentQuestionIndex = 0
      this.selectedAnswer = null
      this.openAnswer = ''
      this.questions = []
      this.answers = []
      this.questionTimes = []
      this.remainingTime = 1800
      this.hintsUsed = 0
      this.totalScore = 0
      this.correctAnswers = 0
      
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    
    // 跳转到训练
    goToTraining() {
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
/* 基础样式 */
.problem-solving-test {
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
  padding: 40px;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.test-title {
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 700;
}

.test-description {
  margin-bottom: 40px;
}

.description-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
  border-left: 5px solid #667eea;
}

.description-card h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.description-card p {
  color: #495057;
  line-height: 1.6;
  margin-bottom: 0;
}

.description-card ol {
  color: #495057;
  line-height: 1.8;
  padding-left: 20px;
}

.test-settings {
  margin-bottom: 40px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.setting-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
}

.setting-card h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.setting-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;
}

.setting-select:focus {
  outline: none;
  border-color: #667eea;
}

.type-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.type-option:hover {
  background: #e9ecef;
}

.type-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
}

.start-section {
  text-align: center;
}

.btn-start {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 18px 40px;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btn-start:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
}

/* 测试进行中阶段 */
.testing-phase {
  max-width: 1000px;
  margin: 0 auto;
}

.test-container {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.test-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 30px;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.progress-section {
  flex: 1;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-text {
  font-size: 1.1rem;
  color: #495057;
  font-weight: 600;
}

.progress-bar {
  background: #e9ecef;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #667eea, #764ba2);
  height: 100%;
  transition: width 0.5s ease;
}

.stats-section {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 10px;
  min-width: 80px;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
}

/* 题目内容 */
.question-content {
  margin-bottom: 30px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.question-type {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  color: #667eea;
  font-weight: 600;
}

.question-type i {
  font-size: 1.3rem;
}

.difficulty-badge {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.difficulty-badge.easy {
  background: linear-gradient(45deg, #28a745, #20c997);
}

.difficulty-badge.medium {
  background: linear-gradient(45deg, #ffc107, #fd7e14);
}

.difficulty-badge.hard {
  background: linear-gradient(45deg, #dc3545, #c82333);
}

.question-body {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
}

.question-title {
  font-size: 1.4rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
}

.question-description {
  font-size: 1.1rem;
  color: #495057;
  line-height: 1.6;
  margin-bottom: 20px;
}

.question-background {
  background: #e3f2fd;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #2196f3;
}

.question-background h4 {
  color: #1976d2;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.question-constraints {
  background: #fff3e0;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #ff9800;
}

.question-constraints h4 {
  color: #f57c00;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.question-constraints ul {
  margin: 0;
  padding-left: 20px;
  color: #495057;
}

.question-constraints li {
  margin-bottom: 8px;
  line-height: 1.5;
}

/* 选择题选项 */
.question-options {
  display: grid;
  gap: 15px;
  margin-top: 25px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: #667eea;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.option-item.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.option-label {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.option-item.selected .option-label {
  background: linear-gradient(45deg, #28a745, #20c997);
}

.option-content {
  flex: 1;
  font-size: 1rem;
  color: #2c3e50;
  line-height: 1.5;
}

/* 开放题输入 */
.open-answer {
  margin-top: 25px;
}

.open-answer h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.answer-textarea {
  width: 100%;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.answer-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.answer-tips {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-top: 15px;
  border-left: 4px solid #17a2b8;
}

.answer-tips p {
  color: #495057;
  margin-bottom: 10px;
  font-weight: 600;
}

.answer-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
}

.answer-tips li {
  margin-bottom: 5px;
  line-height: 1.4;
}

/* 反馈区域 */
.feedback-section {
  margin: 20px 0;
  padding: 15px 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  animation: slideIn 0.3s ease;
}

.feedback-section.correct {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  border: 1px solid #c3e6cb;
}

.feedback-section.incorrect {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.feedback-content i {
  font-size: 1.2rem;
}

/* 控制按钮 */
.question-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-prev {
  background: linear-gradient(45deg, #6c757d, #495057);
  color: white;
}

.btn-next {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-hint {
  background: linear-gradient(45deg, #ffc107, #fd7e14);
  color: white;
}

.btn-skip {
  background: linear-gradient(45deg, #17a2b8, #138496);
  color: white;
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

/* 问题解决能力 */
.solving-skills {
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

.skill-header i {
  font-size: 2rem;
  color: #667eea;
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

.difficulty-fill {
  background: linear-gradient(90deg, #667eea, #764ba2);
  height: 100%;
  transition: width 0.8s ease;
}

/* 表现评价 */
.performance-evaluation {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  text-align: center;
}

.evaluation-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 600;
}

.evaluation-level {
  display: inline-block;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.evaluation-level.excellent {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
}

.evaluation-level.good {
  background: linear-gradient(45deg, #17a2b8, #138496);
  color: white;
}

.evaluation-level.average {
  background: linear-gradient(45deg, #ffc107, #fd7e14);
  color: white;
}

.evaluation-level.below-average {
  background: linear-gradient(45deg, #dc3545, #c82333);
  color: white;
}

.evaluation-description {
  font-size: 1.1rem;
  color: #495057;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* 提升建议 */
.improvement-suggestions {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.suggestions-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 600;
  text-align: center;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.suggestion-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  padding: 25px;
  border-left: 5px solid #667eea;
  transition: all 0.3s ease;
}

.suggestion-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.suggestion-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.suggestion-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
}

.suggestion-content {
  color: #495057;
  line-height: 1.6;
  margin-bottom: 15px;
}

.suggestion-tips {
  background: #e3f2fd;
  border-radius: 10px;
  padding: 15px;
  border-left: 3px solid #2196f3;
}

.suggestion-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #1976d2;
}

.suggestion-tips li {
  margin-bottom: 8px;
  line-height: 1.4;
}

/* 结果操作按钮 */
.results-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  text-decoration: none;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}

.btn-export {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
}

.btn-retry {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-training {
  background: linear-gradient(45deg, #ffc107, #fd7e14);
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-container {
    padding: 20px;
  }

  .test-header {
    padding: 30px 20px;
  }

  .test-title {
    font-size: 2rem;
  }

  .progress-info {
    flex-direction: column;
    gap: 15px;
  }

  .stats-info {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .question-content {
    padding: 30px 20px;
  }

  .question-actions {
    flex-direction: column;
    gap: 15px;
  }

  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .overall-results {
    grid-template-columns: 1fr;
    gap: 30px;
    text-align: center;
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
    font-size: 2.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .skills-grid,
  .type-stats,
  .difficulty-stats,
  .suggestions-grid {
    grid-template-columns: 1fr;
  }

  .results-actions {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .test-container {
    padding: 15px;
  }

  .test-header {
    padding: 20px 15px;
  }

  .test-title {
    font-size: 1.8rem;
  }

  .question-content {
    padding: 20px 15px;
  }

  .option-item {
    padding: 15px;
  }

  .results-phase {
    padding: 20px;
  }

  .detailed-analysis,
  .performance-evaluation,
  .improvement-suggestions {
    padding: 20px;
  }

  .results-title,
  .analysis-title,
  .evaluation-title,
  .suggestions-title {
    font-size: 1.8rem;
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

.fadeIn {
  animation: fadeIn 0.6s ease;
}

.slideIn {
  animation: slideIn 0.6s ease;
}

.scaleIn {
  animation: scaleIn 0.6s ease;
}

/* 主题变量 */
:root {
  --primary-color: #667eea;
  --primary-dark: #764ba2;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;
  --light-bg: #f8f9fa;
  --white: #ffffff;
  --text-dark: #2c3e50;
  --text-muted: #6c757d;
  --border-color: #e9ecef;
  --shadow: 0 2px 10px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.15);
  --border-radius: 10px;
  --border-radius-lg: 20px;
  --transition: all 0.3s ease;
}
</style>