<template>
  <div class="creative-thinking-test">
    <!-- 测试说明阶段 -->
    <div v-if="currentPhase === 'instruction'" class="instruction-phase fade-in">
      <div class="instruction-container">
        <h2 class="test-title">创造性思维测试</h2>
        <div class="test-description">
          <p>本测试将评估您的发散思维、创新能力、想象力和创造性解决问题的能力。</p>
        </div>
        
        <div class="test-info">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">测试目标</div>
              <div class="info-content">
                <ul>
                  <li>评估发散思维能力</li>
                  <li>测试创新思维水平</li>
                  <li>检验想象力和联想能力</li>
                  <li>分析创造性解决问题能力</li>
                </ul>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-label">测试步骤</div>
              <div class="info-content">
                <ol>
                  <li>仔细阅读题目要求</li>
                  <li>发挥想象力和创造力</li>
                  <li>提供多样化的答案</li>
                  <li>追求独特性和原创性</li>
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
                  <span class="type-tag">发散思维</span>
                  <span class="type-tag">创意联想</span>
                  <span class="type-tag">问题解决</span>
                  <span class="type-tag">创新设计</span>
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
              <span class="stat-label">创意度：</span>
              <span class="stat-value">{{ creativityScore }}%</span>
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
            
            <!-- 发散思维题目 -->
            <div v-if="currentQuestion.type === '发散思维'" class="divergent-question">
              <div class="stimulus-display">
                <div class="stimulus-item">{{ currentQuestion.stimulus }}</div>
              </div>
              <div class="instruction-text">{{ currentQuestion.instruction }}</div>
              
              <div class="answer-input-area">
                <div class="input-header">
                  <span class="input-label">请输入您的答案（每行一个）：</span>
                  <span class="answer-count">已输入 {{ userAnswers.length }} 个答案</span>
                </div>
                <textarea 
                  v-model="answerText"
                  @input="updateAnswers"
                  class="answer-textarea"
                  :placeholder="currentQuestion.placeholder"
                  rows="8"
                ></textarea>
                <div class="input-tips">
                  <span class="tip-item">💡 追求数量：尽可能多地提供答案</span>
                  <span class="tip-item">🎨 追求独特：提供与众不同的想法</span>
                  <span class="tip-item">🔄 追求灵活：从不同角度思考</span>
                </div>
              </div>
            </div>
            
            <!-- 创意联想题目 -->
            <div v-else-if="currentQuestion.type === '创意联想'" class="association-question">
              <div class="word-pairs">
                <div class="word-pair" v-for="(pair, index) in currentQuestion.wordPairs" :key="index">
                  <span class="word-a">{{ pair.wordA }}</span>
                  <span class="connector">+</span>
                  <span class="word-b">{{ pair.wordB }}</span>
                  <span class="equals">=</span>
                  <input 
                    v-model="associationAnswers[index]"
                    class="association-input"
                    :placeholder="'创意联想...'"
                  />
                </div>
              </div>
              <div class="association-tips">
                <p>请为每对词语创造一个有趣的联想或概念，展现您的创造力！</p>
              </div>
            </div>
            
            <!-- 问题解决题目 -->
            <div v-else-if="currentQuestion.type === '问题解决'" class="problem-solving-question">
              <div class="problem-scenario">
                <div class="scenario-title">情境描述：</div>
                <div class="scenario-content">{{ currentQuestion.scenario }}</div>
              </div>
              
              <div class="constraints" v-if="currentQuestion.constraints">
                <div class="constraints-title">限制条件：</div>
                <ul class="constraints-list">
                  <li v-for="(constraint, index) in currentQuestion.constraints" :key="index">
                    {{ constraint }}
                  </li>
                </ul>
              </div>
              
              <div class="solution-input">
                <div class="solution-label">您的创新解决方案：</div>
                <textarea 
                  v-model="solutionText"
                  class="solution-textarea"
                  placeholder="请详细描述您的创新解决方案，包括具体步骤和创新点..."
                  rows="6"
                ></textarea>
              </div>
            </div>
            
            <!-- 创新设计题目 -->
            <div v-else-if="currentQuestion.type === '创新设计'" class="design-question">
              <div class="design-brief">
                <div class="brief-title">设计要求：</div>
                <div class="brief-content">{{ currentQuestion.designBrief }}</div>
              </div>
              
              <div class="design-requirements" v-if="currentQuestion.requirements">
                <div class="requirements-title">功能要求：</div>
                <ul class="requirements-list">
                  <li v-for="(req, index) in currentQuestion.requirements" :key="index">
                    {{ req }}
                  </li>
                </ul>
              </div>
              
              <div class="design-input">
                <div class="design-sections">
                  <div class="design-section">
                    <label class="section-label">设计名称：</label>
                    <input v-model="designName" class="design-name-input" placeholder="为您的设计起个名字..." />
                  </div>
                  
                  <div class="design-section">
                    <label class="section-label">设计描述：</label>
                    <textarea 
                      v-model="designDescription"
                      class="design-description-textarea"
                      placeholder="详细描述您的设计理念、外观、功能等..."
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <div class="design-section">
                    <label class="section-label">创新亮点：</label>
                    <textarea 
                      v-model="designInnovation"
                      class="design-innovation-textarea"
                      placeholder="说明您设计的独特之处和创新点..."
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 实时反馈 -->
          <div v-if="showRealTimeFeedback" class="realtime-feedback slide-in">
            <div class="feedback-content">
              <div class="feedback-icon">💡</div>
              <div class="feedback-text">
                <div class="feedback-title">实时反馈</div>
                <div class="feedback-message">{{ realtimeFeedbackMessage }}</div>
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
              灵感提示 ({{ hintCount }}/{{ maxHints }})
            </button>
            
            <button 
              v-if="canSubmit"
              @click="submitAnswer"
              class="btn-submit"
            >
              提交答案
            </button>
            
            <button 
              v-if="showFeedback"
              @click="nextQuestion"
              class="btn-next"
            >
              {{ currentQuestionIndex < totalQuestions - 1 ? '下一题' : '完成测试' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 结果展示阶段 -->
    <div v-else-if="currentPhase === 'results'" class="results-phase fade-in">
      <div class="results-container">
        <h2 class="results-title">创造性思维测试结果</h2>
        
        <!-- 总体结果 -->
        <div class="overall-results">
          <div class="score-display">
            <div class="score-circle" :style="{ background: `conic-gradient(#ff6b6b ${(finalScore / 100) * 360}deg, #e9ecef 0deg)` }">
              <div class="score-inner">
                <div class="score-number">{{ finalScore }}</div>
                <div class="score-label">创造力指数</div>
              </div>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ totalAnswers }}</div>
              <div class="stat-label">总答案数</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ uniquenessScore }}%</div>
              <div class="stat-label">独特性</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ flexibilityScore }}%</div>
              <div class="stat-label">灵活性</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ elaborationScore }}%</div>
              <div class="stat-label">精细性</div>
            </div>
          </div>
        </div>
        
        <!-- 详细分析 -->
        <div class="detailed-analysis">
          <h3 class="analysis-title">创造力分析</h3>
          
          <!-- 创造力维度 -->
          <div class="creativity-dimensions">
            <h4 class="section-title">创造力四大维度</h4>
            <div class="dimensions-grid">
              <div class="dimension-card">
                <div class="dimension-icon">🌊</div>
                <div class="dimension-name">流畅性</div>
                <div class="dimension-score">{{ fluencyScore }}</div>
                <div class="dimension-description">产生想法的数量和速度</div>
                <div class="dimension-bar">
                  <div class="bar-fill" :style="{ width: fluencyScore + '%' }"></div>
                </div>
              </div>
              
              <div class="dimension-card">
                <div class="dimension-icon">🎨</div>
                <div class="dimension-name">独特性</div>
                <div class="dimension-score">{{ uniquenessScore }}</div>
                <div class="dimension-description">想法的新颖和原创程度</div>
                <div class="dimension-bar">
                  <div class="bar-fill" :style="{ width: uniquenessScore + '%' }"></div>
                </div>
              </div>
              
              <div class="dimension-card">
                <div class="dimension-icon">🔄</div>
                <div class="dimension-name">灵活性</div>
                <div class="dimension-score">{{ flexibilityScore }}</div>
                <div class="dimension-description">思维转换和多角度思考</div>
                <div class="dimension-bar">
                  <div class="bar-fill" :style="{ width: flexibilityScore + '%' }"></div>
                </div>
              </div>
              
              <div class="dimension-card">
                <div class="dimension-icon">✨</div>
                <div class="dimension-name">精细性</div>
                <div class="dimension-score">{{ elaborationScore }}</div>
                <div class="dimension-description">想法的详细和完善程度</div>
                <div class="dimension-bar">
                  <div class="bar-fill" :style="{ width: elaborationScore + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
          
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
                    <span class="detail-label">答案数量：</span>
                    <span class="detail-value">{{ type.answerCount }}</span>
                  </div>
                  <div class="type-detail">
                    <span class="detail-label">创意度：</span>
                    <span class="detail-value">{{ type.creativity }}%</span>
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
          
          <!-- 创造力特征分析 -->
          <div class="creativity-traits">
            <h4 class="section-title">创造力特征分析</h4>
            <div class="traits-content">
              <div class="trait-item" v-for="trait in creativityTraits" :key="trait.name">
                <div class="trait-header">
                  <span class="trait-name">{{ trait.name }}</span>
                  <span class="trait-level" :class="trait.levelClass">{{ trait.level }}</span>
                </div>
                <div class="trait-description">{{ trait.description }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 表现评价 -->
        <div class="performance-evaluation">
          <h3 class="analysis-title">创造力评价</h3>
          <div class="evaluation-content">
            <div class="evaluation-level">
              <span class="level-label">创造力水平：</span>
              <span class="level-value" :class="performanceLevel.class">{{ performanceLevel.name }}</span>
            </div>
            <div class="evaluation-description">
              {{ performanceLevel.description }}
            </div>
            <div class="evaluation-strengths">
              <h5>创造力优势：</h5>
              <ul>
                <li v-for="strength in strengths" :key="strength">{{ strength }}</li>
              </ul>
            </div>
            <div class="evaluation-improvements">
              <h5>提升方向：</h5>
              <ul>
                <li v-for="improvement in improvements" :key="improvement">{{ improvement }}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- 创造力提升建议 -->
        <div class="improvement-suggestions">
          <h3 class="analysis-title">创造力提升建议</h3>
          <div class="suggestions-grid">
            <div class="suggestion-card">
              <div class="suggestion-icon">🧠</div>
              <div class="suggestion-title">思维训练</div>
              <div class="suggestion-content">
                <ul>
                  <li>练习头脑风暴技巧</li>
                  <li>尝试思维导图方法</li>
                  <li>进行联想和类比训练</li>
                  <li>培养发散思维习惯</li>
                </ul>
              </div>
            </div>
            
            <div class="suggestion-card">
              <div class="suggestion-icon">🎭</div>
              <div class="suggestion-title">创意实践</div>
              <div class="suggestion-content">
                <ul>
                  <li>参与艺术创作活动</li>
                  <li>尝试不同的表达方式</li>
                  <li>挑战创新项目</li>
                  <li>跨领域学习和探索</li>
                </ul>
              </div>
            </div>
            
            <div class="suggestion-card">
              <div class="suggestion-icon">🌍</div>
              <div class="suggestion-title">环境营造</div>
              <div class="suggestion-content">
                <ul>
                  <li>创造开放的思考环境</li>
                  <li>接触多元化的信息</li>
                  <li>与创意人士交流</li>
                  <li>保持好奇心和探索欲</li>
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
  name: 'CreativeThinkingTest',
  
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
      totalQuestions: 15,
      currentQuestionIndex: 0,
      
      // 计时相关
      startTime: null,
      questionStartTime: null,
      totalTime: 0,
      remainingTime: 0,
      timer: null,
      
      // 得分统计
      currentScore: 0,
      creativityScore: 0,
      responses: [],
      
      // 提示系统
      hintCount: 0,
      maxHints: 3,
      
      // 实时反馈
      showRealTimeFeedback: false,
      realtimeFeedbackMessage: '',
      showFeedback: false,
      
      // 答案输入
      answerText: '',
      userAnswers: [],
      associationAnswers: [],
      solutionText: '',
      designName: '',
      designDescription: '',
      designInnovation: '',
      
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
    
    canSubmit() {
      if (!this.currentQuestion) return false
      
      switch (this.currentQuestion.type) {
        case '发散思维':
          return this.userAnswers.length > 0
        case '创意联想':
          return this.associationAnswers.some(answer => answer && answer.trim())
        case '问题解决':
          return this.solutionText.trim().length > 10
        case '创新设计':
          return this.designName.trim() && this.designDescription.trim().length > 10
        default:
          return false
      }
    },
    
    finalScore() {
      return Math.round((this.fluencyScore + this.uniquenessScore + this.flexibilityScore + this.elaborationScore) / 4)
    },
    
    totalAnswers() {
      return this.responses.reduce((total, response) => {
        if (response.questionType === '发散思维') {
          return total + (response.answers ? response.answers.length : 0)
        }
        return total + 1
      }, 0)
    },
    
    fluencyScore() {
      // 流畅性：基于答案数量
      const divergentResponses = this.responses.filter(r => r.questionType === '发散思维')
      if (divergentResponses.length === 0) return 0
      
      const totalAnswers = divergentResponses.reduce((sum, r) => sum + (r.answers ? r.answers.length : 0), 0)
      const avgAnswers = totalAnswers / divergentResponses.length
      
      // 根据平均答案数量计算分数
      return Math.min(100, Math.round((avgAnswers / 10) * 100))
    },
    
    uniquenessScore() {
      // 独特性：基于答案的原创性
      const allResponses = this.responses.filter(r => r.uniquenessScore !== undefined)
      if (allResponses.length === 0) return 0
      
      const avgUniqueness = allResponses.reduce((sum, r) => sum + r.uniquenessScore, 0) / allResponses.length
      return Math.round(avgUniqueness)
    },
    
    flexibilityScore() {
      // 灵活性：基于思维的多样性
      const allResponses = this.responses.filter(r => r.flexibilityScore !== undefined)
      if (allResponses.length === 0) return 0
      
      const avgFlexibility = allResponses.reduce((sum, r) => sum + r.flexibilityScore, 0) / allResponses.length
      return Math.round(avgFlexibility)
    },
    
    elaborationScore() {
      // 精细性：基于答案的详细程度
      const allResponses = this.responses.filter(r => r.elaborationScore !== undefined)
      if (allResponses.length === 0) return 0
      
      const avgElaboration = allResponses.reduce((sum, r) => sum + r.elaborationScore, 0) / allResponses.length
      return Math.round(avgElaboration)
    },
    
    questionTypes() {
      const types = ['发散思维', '创意联想', '问题解决', '创新设计']
      return types.map(type => {
        const typeResponses = this.responses.filter(r => r.questionType === type)
        const avgScore = typeResponses.length > 0 
          ? typeResponses.reduce((sum, r) => sum + r.score, 0) / typeResponses.length 
          : 0
        
        const answerCount = typeResponses.reduce((sum, r) => {
          if (type === '发散思维') {
            return sum + (r.answers ? r.answers.length : 0)
          }
          return sum + 1
        }, 0)
        
        const creativity = typeResponses.length > 0
          ? typeResponses.reduce((sum, r) => sum + (r.uniquenessScore || 0), 0) / typeResponses.length
          : 0
        
        return {
          name: type,
          score: Math.round(avgScore),
          answerCount,
          creativity: Math.round(creativity)
        }
      })
    },
    
    creativityTraits() {
      const traits = []
      
      // 基于各维度分数分析特征
      if (this.fluencyScore >= 80) {
        traits.push({
          name: '思维活跃',
          level: '高',
          levelClass: 'high',
          description: '能够快速产生大量想法，思维非常活跃'
        })
      }
      
      if (this.uniquenessScore >= 80) {
        traits.push({
          name: '独创性强',
          level: '高',
          levelClass: 'high',
          description: '具有很强的原创能力，想法新颖独特'
        })
      }
      
      if (this.flexibilityScore >= 80) {
        traits.push({
          name: '思维灵活',
          level: '高',
          levelClass: 'high',
          description: '能够从多个角度思考问题，思维转换灵活'
        })
      }
      
      if (this.elaborationScore >= 80) {
        traits.push({
          name: '精细化强',
          level: '高',
          levelClass: 'high',
          description: '能够深入细化想法，注重细节完善'
        })
      }
      
      // 如果没有高分特征，添加一些中等特征
      if (traits.length === 0) {
        traits.push({
          name: '创造潜力',
          level: '中等',
          levelClass: 'medium',
          description: '具有一定的创造能力，有进一步发展的潜力'
        })
      }
      
      return traits
    },
    
    performanceLevel() {
      const score = this.finalScore
      if (score >= 90) {
        return {
          name: '创造天才',
          class: 'excellent',
          description: '您具有卓越的创造力，能够产生大量原创性的想法，是真正的创意天才。'
        }
      } else if (score >= 80) {
        return {
          name: '创意达人',
          class: 'good',
          description: '您的创造力很强，能够在多个维度表现出色，具有很好的创新潜力。'
        }
      } else if (score >= 70) {
        return {
          name: '创意新手',
          class: 'average',
          description: '您具有一定的创造力，在某些方面表现不错，还有提升空间。'
        }
      } else if (score >= 60) {
        return {
          name: '创意萌芽',
          class: 'pass',
          description: '您的创造力正在发展中，需要更多练习来激发创意潜能。'
        }
      } else {
        return {
          name: '需要启发',
          class: 'needs-improvement',
          description: '您的创造力需要进一步开发，建议多进行创意思维训练。'
        }
      }
    },
    
    strengths() {
      const strengths = []
      if (this.fluencyScore >= 75) strengths.push('思维流畅，想法丰富')
      if (this.uniquenessScore >= 75) strengths.push('独创性强，想法新颖')
      if (this.flexibilityScore >= 75) strengths.push('思维灵活，角度多样')
      if (this.elaborationScore >= 75) strengths.push('精细化好，细节丰富')
      if (strengths.length === 0) strengths.push('具有基础的创造力')
      return strengths
    },
    
    improvements() {
      const improvements = []
      if (this.fluencyScore < 70) improvements.push('增加想法数量，提高思维流畅性')
      if (this.uniquenessScore < 70) improvements.push('追求原创性，避免常规思维')
      if (this.flexibilityScore < 70) improvements.push('多角度思考，增强思维灵活性')
      if (this.elaborationScore < 70) improvements.push('深化想法，提高精细化程度')
      if (improvements.length === 0) improvements.push('保持创造力，继续探索创新')
      return improvements
    }
  },
  
  watch: {
    answerText(newValue) {
      this.updateAnswers()
      this.checkRealTimeFeedback()
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
        easy: 10,
        medium: 15,
        hard: 20,
        expert: 25
      }
      
      this.totalQuestions = questionCounts[this.settings.difficulty] || 15
      this.generateQuestions()
    },
    
    generateQuestions() {
      this.questions = []
      
      // 生成不同类型的题目
      const types = ['发散思维', '创意联想', '问题解决', '创新设计']
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
        case '发散思维':
          return this.generateDivergentQuestion(difficulty)
        case '创意联想':
          return this.generateAssociationQuestion(difficulty)
        case '问题解决':
          return this.generateProblemSolvingQuestion(difficulty)
        case '创新设计':
          return this.generateDesignQuestion(difficulty)
        default:
          return this.generateDivergentQuestion(difficulty)
      }
    },
    
    generateDivergentQuestion(difficulty) {
      const questions = {
        '简单': [
          {
            stimulus: '砖头',
            instruction: '请列出砖头的所有可能用途',
            placeholder: '例如：\n建房子\n做书挡\n锻炼身体\n...'
          },
          {
            stimulus: '回形针',
            instruction: '请想出回形针的创新用法',
            placeholder: '例如：\n开锁工具\n书签\n拉链头\n...'
          },
          {
            stimulus: '报纸',
            instruction: '除了阅读，报纸还能做什么？',
            placeholder: '例如：\n包装物品\n折纸\n擦玻璃\n...'
          }
        ],
        '中等': [
          {
            stimulus: '如果重力消失了',
            instruction: '想象重力消失后会发生什么，列出所有可能的情况',
            placeholder: '例如：\n人们会飘浮\n水会悬浮\n建筑会倒塌\n...'
          },
          {
            stimulus: '时间倒流',
            instruction: '如果时间可以倒流，会产生哪些有趣的现象？',
            placeholder: '例如：\n年轻化\n知识倒退\n历史重演\n...'
          }
        ],
        '困难': [
          {
            stimulus: '第六感',
            instruction: '如果人类进化出第六感，会是什么样的能力？',
            placeholder: '例如：\n感知情绪\n预知危险\n心灵感应\n...'
          },
          {
            stimulus: '意识上传',
            instruction: '如果可以将意识上传到计算机，会带来什么影响？',
            placeholder: '例如：\n数字永生\n虚拟世界\n身份认同\n...'
          }
        ]
      }
      
      const questionData = questions[difficulty][Math.floor(Math.random() * questions[difficulty].length)]
      
      return {
        type: '发散思维',
        difficulty,
        question: questionData.instruction,
        stimulus: questionData.stimulus,
        instruction: questionData.instruction,
        placeholder: questionData.placeholder
      }
    },
    
    generateAssociationQuestion(difficulty) {
      const wordPairs = {
        '简单': [
          [{ wordA: '云朵', wordB: '音乐' }, { wordA: '时间', wordB: '颜色' }],
          [{ wordA: '梦想', wordB: '钥匙' }, { wordA: '记忆', wordB: '香味' }]
        ],
        '中等': [
          [{ wordA: '孤独', wordB: '几何' }, { wordA: '速度', wordB: '温柔' }],
          [{ wordA: '智慧', wordB: '流水' }, { wordA: '勇气', wordB: '镜子' }]
        ],
        '困难': [
          [{ wordA: '量子', wordB: '诗歌' }, { wordA: '混沌', wordB: '和谐' }],
          [{ wordA: '永恒', wordB: '瞬间' }, { wordA: '虚无', wordB: '存在' }]
        ]
      }
      
      const pairs = wordPairs[difficulty][Math.floor(Math.random() * wordPairs[difficulty].length)]
      
      return {
        type: '创意联想',
        difficulty,
        question: '请为以下词语对创造有趣的联想或概念：',
        wordPairs: pairs
      }
    },
    
    generateProblemSolvingQuestion(difficulty) {
      const problems = {
        '简单': [
          {
            scenario: '学校食堂排队时间太长，学生经常因为排队而迟到上课。',
            constraints: ['预算有限', '不能增加食堂面积', '保持食品质量']
          },
          {
            scenario: '城市停车位不足，市民找停车位很困难。',
            constraints: ['不能拆除现有建筑', '成本控制', '环保要求']
          }
        ],
        '中等': [
          {
            scenario: '老年人使用智能手机困难，无法享受数字化便利。',
            constraints: ['技术接受度低', '学习能力有限', '经济条件考虑']
          },
          {
            scenario: '远程工作导致团队协作效率下降，沟通不畅。',
            constraints: ['时区差异', '技术限制', '文化差异']
          }
        ],
        '困难': [
          {
            scenario: '气候变化导致极端天气频发，需要新的应对策略。',
            constraints: ['全球协调困难', '技术限制', '经济成本巨大']
          },
          {
            scenario: '人工智能发展可能导致大量失业，社会结构面临冲击。',
            constraints: ['技术发展不可逆', '教育体系滞后', '政策制定复杂']
          }
        ]
      }
      
      const problemData = problems[difficulty][Math.floor(Math.random() * problems[difficulty].length)]
      
      return {
        type: '问题解决',
        difficulty,
        question: '请为以下问题提出创新的解决方案：',
        scenario: problemData.scenario,
        constraints: problemData.constraints
      }
    },
    
    generateDesignQuestion(difficulty) {
      const designs = {
        '简单': [
          {
            designBrief: '为儿童设计一款有趣的学习工具',
            requirements: ['安全无害', '激发兴趣', '易于使用', '教育价值']
          },
          {
            designBrief: '设计一个帮助人们放松的产品',
            requirements: ['便携性', '有效性', '美观性', '价格合理']
          }
        ],
        '中等': [
          {
            designBrief: '为未来城市设计一种新型交通工具',
            requirements: ['环保节能', '高效便捷', '安全可靠', '成本可控']
          },
          {
            designBrief: '设计一个促进社区交流的空间或产品',
            requirements: ['包容性', '互动性', '可持续性', '文化适应性']
          }
        ],
        '困难': [
          {
            designBrief: '为火星殖民地设计生活设施',
            requirements: ['极端环境适应', '资源循环利用', '心理健康支持', '技术可行性']
          },
          {
            designBrief: '设计一个解决全球性问题的系统',
            requirements: ['可扩展性', '跨文化适用', '技术创新', '社会影响力']
          }
        ]
      }
      
      const designData = designs[difficulty][Math.floor(Math.random() * designs[difficulty].length)]
      
      return {
        type: '创新设计',
        difficulty,
        question: '请完成以下设计挑战：',
        designBrief: designData.designBrief,
        requirements: designData.requirements
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
      
      const baseTime = this.totalQuestions * 180 // 每题3分钟
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
      // 时间到，自动提交当前答案
      if (this.canSubmit) {
        this.submitAnswer()
      } else {
        this.nextQuestion()
      }
    },
    
    loadCurrentQuestion() {
      if (this.currentQuestionIndex < this.questions.length) {
        this.currentQuestion = this.questions[this.currentQuestionIndex]
        this.resetAnswerInputs()
        this.questionStartTime = Date.now()
      } else {
        this.completeTest()
      }
    },
    
    resetAnswerInputs() {
      this.answerText = ''
      this.userAnswers = []
      this.associationAnswers = []
      this.solutionText = ''
      this.designName = ''
      this.designDescription = ''
      this.designInnovation = ''
      this.showFeedback = false
      
      // 初始化联想答案数组
      if (this.currentQuestion.type === '创意联想') {
        this.associationAnswers = new Array(this.currentQuestion.wordPairs.length).fill('')
      }
    },
    
    updateAnswers() {
      if (this.currentQuestion.type === '发散思维') {
        this.userAnswers = this.answerText
          .split('\n')
          .map(answer => answer.trim())
          .filter(answer => answer.length > 0)
      }
    },
    
    checkRealTimeFeedback() {
      if (this.currentQuestion.type === '发散思维') {
        const answerCount = this.userAnswers.length
        
        if (answerCount >= 10) {
          this.showRealTimeFeedback = true
          this.realtimeFeedbackMessage = '太棒了！您已经想出了很多创意，继续保持！'
        } else if (answerCount >= 5) {
          this.showRealTimeFeedback = true
          this.realtimeFeedbackMessage = '很好！试着从不同角度思考更多可能性。'
        } else if (answerCount >= 3) {
          this.showRealTimeFeedback = true
          this.realtimeFeedbackMessage = '不错的开始！继续发挥您的想象力。'
        }
        
        // 3秒后隐藏反馈
        setTimeout(() => {
          this.showRealTimeFeedback = false
        }, 3000)
      }
    },
    
    submitAnswer() {
      if (!this.canSubmit) return
      
      const responseTime = Math.floor((Date.now() - this.questionStartTime) / 1000)
      let response = {
        questionIndex: this.currentQuestionIndex,
        questionType: this.currentQuestion.type,
        difficulty: this.currentQuestion.difficulty,
        responseTime,
        hintUsed: this.hintCount > 0
      }
      
      // 根据题目类型处理答案
      switch (this.currentQuestion.type) {
        case '发散思维':
          response.answers = [...this.userAnswers]
          response.score = this.calculateDivergentScore(this.userAnswers)
          response.uniquenessScore = this.calculateUniquenessScore(this.userAnswers)
          response.flexibilityScore = this.calculateFlexibilityScore(this.userAnswers)
          response.elaborationScore = this.calculateElaborationScore(this.userAnswers)
          break
          
        case '创意联想':
          response.associations = [...this.associationAnswers]
          response.score = this.calculateAssociationScore(this.associationAnswers)
          response.uniquenessScore = this.calculateAssociationUniqueness(this.associationAnswers)
          response.flexibilityScore = 75 // 联想题固定灵活性分数
          response.elaborationScore = this.calculateAssociationElaboration(this.associationAnswers)
          break
          
        case '问题解决':
          response.solution = this.solutionText
          response.score = this.calculateSolutionScore(this.solutionText)
          response.uniquenessScore = this.calculateSolutionUniqueness(this.solutionText)
          response.flexibilityScore = this.calculateSolutionFlexibility(this.solutionText)
          response.elaborationScore = this.calculateSolutionElaboration(this.solutionText)
          break
          
        case '创新设计':
          response.design = {
            name: this.designName,
            description: this.designDescription,
            innovation: this.designInnovation
          }
          response.score = this.calculateDesignScore(response.design)
          response.uniquenessScore = this.calculateDesignUniqueness(response.design)
          response.flexibilityScore = this.calculateDesignFlexibility(response.design)
          response.elaborationScore = this.calculateDesignElaboration(response.design)
          break
      }
      
      this.responses.push(response)
      this.currentScore += response.score
      this.updateCreativityScore()
      
      this.showFeedback = this.settings.feedbackMode === 'immediate'
      
      if (!this.showFeedback) {
        setTimeout(() => this.nextQuestion(), 1000)
      }
    },
    
    calculateDivergentScore(answers) {
      // 基于答案数量和质量计算分数
      const quantity = Math.min(answers.length, 15) // 最多15个答案
      const quality = answers.reduce((sum, answer) => {
        return sum + Math.min(answer.length / 10, 3) // 基于长度评估质量
      }, 0) / answers.length
      
      return Math.round((quantity * 4 + quality * 20))
    },
    
    calculateUniquenessScore(answers) {
      // 简化的独特性计算
      const commonWords = ['用', '做', '当', '作为', '可以', '能够']
      let uniqueCount = 0
      
      answers.forEach(answer => {
        const hasCommonWords = commonWords.some(word => answer.includes(word))
        if (!hasCommonWords && answer.length > 3) {
          uniqueCount++
        }
      })
      
      return Math.round((uniqueCount / Math.max(answers.length, 1)) * 100)
    },
    
    calculateFlexibilityScore(answers) {
      // 基于答案类别的多样性
      const categories = new Set()
      answers.forEach(answer => {
        // 简化的分类逻辑
        if (answer.includes('工具') || answer.includes('器具')) categories.add('工具')
        else if (answer.includes('装饰') || answer.includes('美化')) categories.add('装饰')
        else if (answer.includes('游戏') || answer.includes('娱乐')) categories.add('娱乐')
        else if (answer.includes('建筑') || answer.includes('建造')) categories.add('建筑')
        else categories.add('其他')
      })
      
      return Math.min(categories.size * 20, 100)
    },
    
    calculateElaborationScore(answers) {
      // 基于答案的详细程度
      const avgLength = answers.reduce((sum, answer) => sum + answer.length, 0) / answers.length
      return Math.min(Math.round(avgLength * 5), 100)
    },
    
    calculateAssociationScore(associations) {
      const validAssociations = associations.filter(a => a && a.trim().length > 0)
      return Math.round((validAssociations.length / associations.length) * 80 + 20)
    },
    
    calculateAssociationUniqueness(associations) {
      // 基于联想的创新性
      let uniqueScore = 0
      associations.forEach(association => {
        if (association && association.length > 5) {
          uniqueScore += 25
        }
      })
      return Math.min(uniqueScore, 100)
    },
    
    calculateAssociationElaboration(associations) {
      const avgLength = associations.reduce((sum, a) => sum + (a ? a.length : 0), 0) / associations.length
      return Math.min(Math.round(avgLength * 8), 100)
    },
    
    calculateSolutionScore(solution) {
      // 基于解决方案的长度和关键词
      const length = solution.length
      const keywords = ['创新', '新颖', '独特', '高效', '可行', '实用']
      const keywordCount = keywords.filter(keyword => solution.includes(keyword)).length
      
      return Math.round(Math.min(length / 10, 50) + keywordCount * 10 + 30)
    },
    
    calculateSolutionUniqueness(solution) {
      // 基于解决方案的创新性关键词
      const innovativeWords = ['创新', '革命性', '突破', '前所未有', '独创']
      const count = innovativeWords.filter(word => solution.includes(word)).length
      return Math.min(count * 20 + 40, 100)
    },
    
    calculateSolutionFlexibility(solution) {
      // 基于多角度思考的体现
      const perspectives = ['技术', '经济', '社会', '环境', '文化', '政策']
      const count = perspectives.filter(p => solution.includes(p)).length
      return Math.min(count * 15 + 40, 100)
    },
    
    calculateSolutionElaboration(solution) {
      return Math.min(Math.round(solution.length / 8), 100)
    },
    
    calculateDesignScore(design) {
      const totalLength = design.name.length + design.description.length + design.innovation.length
      return Math.round(Math.min(totalLength / 15, 80) + 20)
    },
    
    calculateDesignUniqueness(design) {
      const uniqueWords = ['独特', '创新', '革命', '前卫', '突破']
      const text = design.name + design.description + design.innovation
      const count = uniqueWords.filter(word => text.includes(word)).length
      return Math.min(count * 20 + 30, 100)
    },
    
    calculateDesignFlexibility(design) {
      const aspects = ['功能', '美观', '实用', '环保', '智能', '人性化']
      const text = design.description + design.innovation
      const count = aspects.filter(aspect => text.includes(aspect)).length
      return Math.min(count * 15 + 25, 100)
    },
    
    calculateDesignElaboration(design) {
      const totalLength = design.description.length + design.innovation.length
      return Math.min(Math.round(totalLength / 10), 100)
    },
    
    updateCreativityScore() {
      // 更新实时创造力分数
      if (this.responses.length > 0) {
        const avgScore = this.responses.reduce((sum, r) => sum + r.score, 0) / this.responses.length
        this.creativityScore = Math.round(avgScore)
      }
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
      
      const hints = {
        '发散思维': '试着从不同的使用场景、用户群体、或功能角度思考',
        '创意联想': '寻找两个词语之间的隐藏联系，可以是形状、功能、情感等',
        '问题解决': '考虑技术、社会、经济等多个维度的解决方案',
        '创新设计': '思考用户需求、使用场景、技术可行性和创新点'
      }
      
      const hint = hints[this.currentQuestion.type] || '发挥您的创造力和想象力'
      alert(`💡 灵感提示：${hint}`)
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
        fluency: this.fluencyScore,
        uniqueness: this.uniquenessScore,
        flexibility: this.flexibilityScore,
        elaboration: this.elaborationScore,
        totalAnswers: this.totalAnswers,
        responses: this.responses,
        creativityLevel: this.performanceLevel.name
      })
    },
    
    restartTest() {
      this.currentPhase = 'instruction'
      this.currentQuestionIndex = 0
      this.currentScore = 0
      this.creativityScore = 0
      this.responses = []
      this.hintCount = 0
      this.totalTime = 0
      
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      
      this.resetAnswerInputs()
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
.creative-thinking-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 测试说明阶段 */
.instruction-phase {
  text-align: center;
}

.instruction-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  color: white;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.test-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: 700;
}

.test-description {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.test-info {
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 30px;
  margin: 30px 0;
  backdrop-filter: blur(10px);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  text-align: left;
}

.info-label {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #ffd700;
}

.info-content ul, .info-content ol {
  margin: 0;
  padding-left: 20px;
}

.info-content li {
  margin-bottom: 5px;
}

.difficulty-info, .questions-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.difficulty-label, .questions-label {
  margin-right: 10px;
}

.difficulty-value, .questions-value {
  font-weight: 600;
  color: #ffd700;
}

.type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.type-tag {
  background: rgba(255,255,255,0.2);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  border: 1px solid rgba(255,255,255,0.3);
}

.instruction-actions {
  margin-top: 30px;
}

.btn-start {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(238, 90, 36, 0.3);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(238, 90, 36, 0.4);
}

/* 测试进行中阶段 */
.testing-phase {
  min-height: 600px;
}

.testing-container {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  overflow: hidden;
}

.test-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
}

.test-progress {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: 500;
}

.progress-bar {
  background: rgba(255,255,255,0.2);
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  height: 100%;
  transition: width 0.3s ease;
}

.test-stats {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-label {
  margin-right: 8px;
  opacity: 0.9;
}

.stat-value {
  font-weight: 600;
  font-size: 1.1rem;
  color: #ffd700;
}

/* 题目容器 */
.question-container {
  padding: 30px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.question-type {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
}

.question-difficulty {
  background: #f8f9fa;
  color: #495057;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
}

.question-content {
  margin-bottom: 30px;
}

.question-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 25px;
  line-height: 1.6;
}

/* 发散思维题目 */
.divergent-question {
  background: #f8f9ff;
  border-radius: 15px;
  padding: 25px;
  border-left: 5px solid #667eea;
}

.stimulus-display {
  text-align: center;
  margin-bottom: 20px;
}

.stimulus-item {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 20px 40px;
  border-radius: 50px;
  font-size: 1.5rem;
  font-weight: 600;
  display: inline-block;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.instruction-text {
  font-size: 1.1rem;
  color: #495057;
  margin-bottom: 20px;
  text-align: center;
}

.answer-input-area {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.input-label {
  font-weight: 600;
  color: #2c3e50;
}

.answer-count {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
}

.answer-textarea {
  width: 100%;
  min-height: 200px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 15px;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.answer-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-tips {
  display: flex;
  gap: 15px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.tip-item {
  background: #fff3cd;
  color: #856404;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  border: 1px solid #ffeaa7;
}

/* 创意联想题目 */
.association-question {
  background: #fff8e1;
  border-radius: 15px;
  padding: 25px;
  border-left: 5px solid #ffa726;
}

.word-pairs {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.word-pair {
  display: flex;
  align-items: center;
  gap: 15px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.word-a, .word-b {
  background: linear-gradient(45deg, #ffa726, #ff9800);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  min-width: 100px;
  text-align: center;
}

.connector, .equals {
  font-size: 1.5rem;
  font-weight: 600;
  color: #666;
}

.association-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.association-input:focus {
  outline: none;
  border-color: #ffa726;
  box-shadow: 0 0 0 3px rgba(255, 167, 38, 0.1);
}

.association-tips {
  background: white;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  color: #666;
  font-style: italic;
}

/* 问题解决题目 */
.problem-solving-question {
  background: #f3e5f5;
  border-radius: 15px;
  padding: 25px;
  border-left: 5px solid #9c27b0;
}

.problem-scenario {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.scenario-title {
  font-weight: 600;
  color: #9c27b0;
  margin-bottom: 10px;
}

.scenario-content {
  color: #333;
  line-height: 1.6;
}

.constraints {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.constraints-title {
  font-weight: 600;
  color: #9c27b0;
  margin-bottom: 10px;
}

.constraints-list {
  margin: 0;
  padding-left: 20px;
}

.constraints-list li {
  margin-bottom: 5px;
  color: #666;
}

.solution-input {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.solution-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
  display: block;
}

.solution-textarea {
  width: 100%;
  min-height: 150px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 15px;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.solution-textarea:focus {
  outline: none;
  border-color: #9c27b0;
  box-shadow: 0 0 0 3px rgba(156, 39, 176, 0.1);
}

/* 创新设计题目 */
.design-question {
  background: #e8f5e8;
  border-radius: 15px;
  padding: 25px;
  border-left: 5px solid #4caf50;
}

.design-brief {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.brief-title {
  font-weight: 600;
  color: #4caf50;
  margin-bottom: 10px;
}

.brief-content {
  color: #333;
  line-height: 1.6;
}

.design-requirements {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.requirements-title {
  font-weight: 600;
  color: #4caf50;
  margin-bottom: 10px;
}

.requirements-list {
  margin: 0;
  padding-left: 20px;
}

.requirements-list li {
  margin-bottom: 5px;
  color: #666;
}

.design-input {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.design-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.design-section {
  display: flex;
  flex-direction: column;
}

.section-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.design-name-input {
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.design-name-input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.design-description-textarea,
.design-innovation-textarea {
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.design-description-textarea:focus,
.design-innovation-textarea:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

/* 实时反馈 */
.realtime-feedback {
  background: linear-gradient(45deg, #00c851, #007e33);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  margin: 20px 0;
  box-shadow: 0 5px 15px rgba(0, 200, 81, 0.3);
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.feedback-icon {
  font-size: 1.5rem;
}

.feedback-text {
  flex: 1;
}

.feedback-title {
  font-weight: 600;
  margin-bottom: 5px;
}

.feedback-message {
  opacity: 0.9;
}

/* 控制按钮 */
.question-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-hint {
  background: linear-gradient(45deg, #ffa726, #ff9800);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(255, 167, 38, 0.3);
}

.btn-hint:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 167, 38, 0.4);
}

.btn-submit {
  background: linear-gradient(45deg, #4caf50, #45a049);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
}

.btn-next {
  background: linear-gradient(45deg, #2196f3, #1976d2);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(33, 150, 243, 0.3);
}

.btn-next:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(33, 150, 243, 0.4);
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
  color: #ff6b6b;
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

/* 创造力维度 */
.creativity-dimensions {
  margin-bottom: 40px;
}

.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.dimension-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dimension-card:hover {
  transform: translateY(-5px);
  border-color: #667eea;
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.2);
}

.dimension-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.dimension-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.dimension-score {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 10px;
}

.dimension-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.4;
}

.dimension-bar {
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

/* 创造力特征分析 */
.creativity-traits {
  margin-bottom: 40px;
}

.traits-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.trait-item {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  border-left: 4px solid #28a745;
}

.trait-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.trait-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.trait-level {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
}

.trait-level.high {
  background: #d4edda;
  color: #155724;
}

.trait-level.medium {
  background: #fff3cd;
  color: #856404;
}

.trait-level.low {
  background: #f8d7da;
  color: #721c24;
}

.trait-description {
  color: #666;
  line-height: 1.5;
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

/* 创造力提升建议 */
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
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .creative-thinking-test {
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
  
  .dimensions-grid {
    grid-template-columns: 1fr;
  }
  
  .type-stats {
    grid-template-columns: 1fr;
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
  
  .word-pair {
    flex-direction: column;
    gap: 10px;
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