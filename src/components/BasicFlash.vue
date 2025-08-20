<template>
  <div class="basic-flash-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <button @click="$router.go(-1)" class="back-btn">
        <i class="fas fa-arrow-left"></i>
        返回
      </button>
      <h1>闪视训练</h1>
    </div>

    <!-- 训练模式选择 -->
    <div v-if="!isTraining && !showResults" class="training-modes">
      <div class="modes-grid">
        <div 
          v-for="mode in trainingModes" 
          :key="mode.id"
          class="mode-card"
          @click="selectMode(mode)"
          :class="{ active: selectedMode?.id === mode.id }"
        >
          <div class="mode-icon">
            <i :class="mode.icon"></i>
          </div>
          <h3>{{ mode.name }}</h3>
          <p>{{ mode.description }}</p>
          <div class="mode-stats">
            <span>速度: {{ mode.speed }}ms</span>
            <span>难度: {{ mode.difficulty }}</span>
          </div>
        </div>
      </div>

      <!-- 模式详情 -->
      <div v-if="selectedMode" class="mode-details">
        <h3>{{ selectedMode.name }}</h3>
        <p>{{ selectedMode.description }}</p>
        <div class="settings-grid">
          <div class="setting-item">
            <label>闪视速度 (毫秒)</label>
            <input 
              v-model.number="selectedMode.speed" 
              type="number" 
              min="50" 
              max="2000" 
              step="50"
            >
          </div>
          <div class="setting-item">
            <label>训练轮数</label>
            <input 
              v-model.number="trainingRounds" 
              type="number" 
              min="5" 
              max="50" 
              step="1"
            >
          </div>
        </div>
        <button @click="startTraining" class="start-btn">
          开始训练
        </button>
      </div>
    </div>

    <!-- 训练界面 -->
    <div v-if="isTraining" class="training-interface">
      <div class="training-header">
        <div class="progress-info">
          <span>第 {{ currentRound }} / {{ trainingRounds }} 轮</span>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: (currentRound / trainingRounds) * 100 + '%' }"
            ></div>
          </div>
        </div>
        <div class="training-info">
          <span>准确率: {{ accuracy }}%</span>
          <span>速度: {{ selectedMode.speed }}ms</span>
        </div>
      </div>

      <!-- 闪视区域 -->
      <div class="flash-container">
        <div 
          v-if="showFlash" 
          class="flash-content"
          :class="selectedMode.type"
        >
          {{ currentContent }}
        </div>
        <div v-else class="flash-placeholder">
          {{ isWaiting ? '准备...' : '请输入答案' }}
        </div>
      </div>

      <!-- 答案输入 -->
      <div v-if="!showFlash && !isWaiting" class="answer-section">
        <div v-if="selectedMode.type === 'number'" class="answer-input">
          <input 
            v-model="userAnswer" 
            type="text" 
            placeholder="请输入看到的数字"
            @keyup.enter="submitAnswer"
            ref="answerInput"
          >
          <button @click="submitAnswer" class="submit-btn">提交</button>
        </div>
        <div v-else class="answer-options">
          <button 
            v-for="option in answerOptions" 
            :key="option"
            @click="selectAnswer(option)"
            class="option-btn"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>

    <!-- 训练结果 -->
    <div v-if="showResults" class="training-results">
      <h2>训练完成！</h2>
      <div class="results-summary">
        <div class="result-item">
          <span class="label">总轮数:</span>
          <span class="value">{{ trainingRounds }}</span>
        </div>
        <div class="result-item">
          <span class="label">正确数:</span>
          <span class="value">{{ correctAnswers }}</span>
        </div>
        <div class="result-item">
          <span class="label">准确率:</span>
          <span class="value">{{ finalAccuracy }}%</span>
        </div>
        <div class="result-item">
          <span class="label">平均反应时间:</span>
          <span class="value">{{ averageResponseTime }}ms</span>
        </div>
      </div>
      
      <div class="action-buttons">
        <button @click="restartTraining" class="restart-btn">
          重新训练
        </button>
        <button @click="backToModes" class="back-modes-btn">
          选择模式
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BasicFlash',
  data() {
    return {
      // 训练模式
      trainingModes: [
        {
          id: 'number-simple',
          name: '数字识别 - 简单',
          description: '识别1-3位数字',
          icon: 'fas fa-sort-numeric-up',
          speed: 500,
          difficulty: '简单',
          type: 'number',
          contentGenerator: () => Math.floor(Math.random() * 999) + 1
        },
        {
          id: 'number-medium',
          name: '数字识别 - 中等',
          description: '识别4-6位数字',
          icon: 'fas fa-sort-numeric-up',
          speed: 300,
          difficulty: '中等',
          type: 'number',
          contentGenerator: () => Math.floor(Math.random() * 999999) + 1000
        },
        {
          id: 'number-hard',
          name: '数字识别 - 困难',
          description: '识别7-9位数字',
          icon: 'fas fa-sort-numeric-up',
          speed: 200,
          difficulty: '困难',
          type: 'number',
          contentGenerator: () => Math.floor(Math.random() * 999999999) + 1000000
        }
      ],
      
      // 当前状态
      selectedMode: null,
      isTraining: false,
      showResults: false,
      trainingRounds: 10,
      currentRound: 0,
      
      // 闪视相关
      showFlash: false,
      isWaiting: false,
      currentContent: '',
      correctAnswer: '',
      userAnswer: '',
      answerOptions: [],
      
      // 统计数据
      correctAnswers: 0,
      responseTimes: [],
      startTime: null
    }
  },
  
  computed: {
    accuracy() {
      if (this.currentRound === 0) return 0
      return Math.round((this.correctAnswers / this.currentRound) * 100)
    },
    
    finalAccuracy() {
      return Math.round((this.correctAnswers / this.trainingRounds) * 100)
    },
    
    averageResponseTime() {
      if (this.responseTimes.length === 0) return 0
      const sum = this.responseTimes.reduce((a, b) => a + b, 0)
      return Math.round(sum / this.responseTimes.length)
    }
  },
  
  methods: {
    selectMode(mode) {
      this.selectedMode = { ...mode }
    },
    
    startTraining() {
      if (!this.selectedMode) return
      
      this.isTraining = true
      this.currentRound = 0
      this.correctAnswers = 0
      this.responseTimes = []
      this.nextRound()
    },
    
    nextRound() {
      if (this.currentRound >= this.trainingRounds) {
        this.finishTraining()
        return
      }
      
      this.currentRound++
      this.isWaiting = true
      this.userAnswer = ''
      
      // 准备阶段
      setTimeout(() => {
        this.generateContent()
        this.showFlash = true
        this.isWaiting = false
        
        // 闪视阶段
        setTimeout(() => {
          this.showFlash = false
          this.startTime = Date.now()
          this.$nextTick(() => {
            if (this.$refs.answerInput) {
              this.$refs.answerInput.focus()
            }
          })
        }, this.selectedMode.speed)
      }, 1000)
    },
    
    generateContent() {
      this.correctAnswer = this.selectedMode.contentGenerator().toString()
      this.currentContent = this.correctAnswer
      
      if (this.selectedMode.type !== 'number') {
        this.generateAnswerOptions()
      }
    },
    
    generateAnswerOptions() {
      // 为非数字类型生成选项
      this.answerOptions = [this.correctAnswer]
      
      // 生成3个错误选项
      while (this.answerOptions.length < 4) {
        const wrongAnswer = this.selectedMode.contentGenerator().toString()
        if (!this.answerOptions.includes(wrongAnswer)) {
          this.answerOptions.push(wrongAnswer)
        }
      }
      
      // 打乱选项顺序
      this.answerOptions = this.answerOptions.sort(() => Math.random() - 0.5)
    },
    
    submitAnswer() {
      if (!this.userAnswer.trim()) return
      this.checkAnswer(this.userAnswer)
    },
    
    selectAnswer(answer) {
      this.checkAnswer(answer)
    },
    
    checkAnswer(answer) {
      const responseTime = Date.now() - this.startTime
      this.responseTimes.push(responseTime)
      
      if (answer.toString() === this.correctAnswer) {
        this.correctAnswers++
      }
      
      setTimeout(() => {
        this.nextRound()
      }, 500)
    },
    
    finishTraining() {
      this.isTraining = false
      this.showResults = true
    },
    
    restartTraining() {
      this.showResults = false
      this.startTraining()
    },
    
    backToModes() {
      this.showResults = false
      this.isTraining = false
      this.selectedMode = null
    }
  }
}
</script>

<style scoped>
.basic-flash-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  color: white;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 20px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
}

/* 训练模式选择 */
.training-modes {
  max-width: 1200px;
  margin: 0 auto;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.mode-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.mode-card.active {
  border: 3px solid #667eea;
  transform: translateY(-5px);
}

.mode-icon {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 15px;
}

.mode-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.mode-card p {
  color: #666;
  margin-bottom: 15px;
}

.mode-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #888;
}

/* 模式详情 */
.mode-details {
  background: white;
  border-radius: 15px;
  padding: 30px;
  text-align: center;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.setting-item {
  text-align: left;
}

.setting-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.setting-item input {
  width: 100%;
  padding: 10px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
}

.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* 训练界面 */
.training-interface {
  max-width: 800px;
  margin: 0 auto;
}

.training-header {
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
}

.progress-info {
  margin-bottom: 15px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e1e5e9;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.training-info {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: #333;
}

/* 闪视区域 */
.flash-container {
  background: white;
  border-radius: 15px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.flash-content {
  font-size: 4rem;
  font-weight: bold;
  color: #333;
  animation: flash-appear 0.1s ease-in;
}

.flash-placeholder {
  font-size: 1.5rem;
  color: #888;
}

@keyframes flash-appear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 答案输入 */
.answer-section {
  background: white;
  border-radius: 15px;
  padding: 30px;
  text-align: center;
}

.answer-input {
  display: flex;
  gap: 15px;
  max-width: 400px;
  margin: 0 auto;
}

.answer-input input {
  flex: 1;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1.2rem;
  text-align: center;
}

.submit-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: #5a6fd8;
}

.answer-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  max-width: 400px;
  margin: 0 auto;
}

.option-btn {
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  padding: 20px;
  border-radius: 10px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 训练结果 */
.training-results {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  padding: 40px;
  text-align: center;
}

.training-results h2 {
  color: #333;
  margin-bottom: 30px;
}

.results-summary {
  margin-bottom: 30px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #e1e5e9;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item .label {
  font-weight: 600;
  color: #666;
}

.result-item .value {
  font-weight: bold;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.restart-btn, .back-modes-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.restart-btn {
  background: #667eea;
  color: white;
}

.restart-btn:hover {
  background: #5a6fd8;
}

.back-modes-btn {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e1e5e9;
}

.back-modes-btn:hover {
  background: #e9ecef;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .basic-flash-container {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .modes-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .flash-content {
    font-size: 2.5rem;
  }
  
  .answer-input {
    flex-direction: column;
  }
  
  .answer-options {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>