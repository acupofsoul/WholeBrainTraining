<template>
  <div class="basic-flash-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>基础闪视训练</h1>
      <p>通过快速闪现的内容提升视觉处理速度和注意力</p>
    </div>

    <!-- 训练模式选择 -->
    <div v-if="!isTraining && !showResults" class="training-modes">
      <h2>选择训练模式</h2>
      <div class="modes-grid">
        <div 
          v-for="mode in trainingModes" 
          :key="mode.id"
          class="mode-card"
          :class="{ active: selectedMode?.id === mode.id }"
          @click="selectMode(mode)"
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

      <!-- 训练设置 -->
      <div v-if="selectedMode" class="training-settings">
        <h3>训练设置</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label>闪视速度 (毫秒)</label>
            <input 
              v-model.number="settings.flashDuration" 
              type="range" 
              min="50" 
              max="2000" 
              step="50"
            >
            <span>{{ settings.flashDuration }}ms</span>
          </div>
          <div class="setting-item">
            <label>间隔时间 (毫秒)</label>
            <input 
              v-model.number="settings.intervalDuration" 
              type="range" 
              min="500" 
              max="3000" 
              step="100"
            >
            <span>{{ settings.intervalDuration }}ms</span>
          </div>
          <div class="setting-item">
            <label>训练轮数</label>
            <input 
              v-model.number="settings.rounds" 
              type="range" 
              min="5" 
              max="50" 
              step="5"
            >
            <span>{{ settings.rounds }}轮</span>
          </div>
        </div>
        <button @click="startTraining" class="start-btn">
          <i class="fas fa-play"></i>
          开始训练
        </button>
      </div>
    </div>

    <!-- 训练界面 -->
    <div v-if="isTraining" class="training-interface">
      <div class="training-header">
        <div class="training-info">
          <span>模式: {{ selectedMode.name }}</span>
          <span>进度: {{ currentRound }}/{{ settings.rounds }}</span>
          <span>正确率: {{ accuracy }}%</span>
        </div>
        <button @click="stopTraining" class="stop-btn">
          <i class="fas fa-stop"></i>
          停止训练
        </button>
      </div>

      <!-- 闪视区域 -->
      <div class="flash-container" :class="{ flashing: isFlashing }">
        <div v-if="isFlashing" class="flash-content">
          {{ currentContent }}
        </div>
        <div v-else-if="waitingForAnswer" class="answer-prompt">
          <p>请输入刚才看到的内容:</p>
        </div>
        <div v-else class="ready-prompt">
          <p>准备好了吗？</p>
          <button @click="nextFlash" class="next-btn">下一个</button>
        </div>
      </div>

      <!-- 答题区域 -->
      <div v-if="waitingForAnswer" class="answer-section">
        <div v-if="selectedMode.type === 'choice'" class="answer-options">
          <button 
            v-for="(option, index) in currentOptions" 
            :key="index"
            @click="submitAnswer(option)"
            class="option-btn"
          >
            {{ option }}
          </button>
        </div>
        <div v-else class="answer-input">
          <input 
            v-model="userAnswer" 
            @keyup.enter="submitAnswer(userAnswer)"
            placeholder="输入答案"
            ref="answerInput"
          >
          <button @click="submitAnswer(userAnswer)" class="submit-btn">
            提交
          </button>
        </div>
      </div>

      <!-- 反馈区域 -->
      <div v-if="showFeedback" class="feedback" :class="feedbackType">
        <i :class="feedbackType === 'correct' ? 'fas fa-check' : 'fas fa-times'"></i>
        <span>{{ feedbackMessage }}</span>
      </div>
    </div>

    <!-- 训练结果 -->
    <div v-if="showResults" class="training-results">
      <h2>训练完成</h2>
      <div class="results-summary">
        <div class="result-card">
          <h3>总体表现</h3>
          <div class="score">{{ finalScore }}分</div>
          <div class="accuracy">正确率: {{ finalAccuracy }}%</div>
        </div>
        <div class="result-card">
          <h3>反应时间</h3>
          <div class="time">平均: {{ averageResponseTime }}ms</div>
          <div class="time">最快: {{ fastestTime }}ms</div>
        </div>
      </div>
      
      <div class="detailed-stats">
        <h3>详细统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span>总题数</span>
            <span>{{ results.length }}</span>
          </div>
          <div class="stat-item">
            <span>正确数</span>
            <span>{{ correctCount }}</span>
          </div>
          <div class="stat-item">
            <span>错误数</span>
            <span>{{ results.length - correctCount }}</span>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button @click="restartTraining" class="restart-btn">
          <i class="fas fa-redo"></i>
          重新训练
        </button>
        <button @click="backToModes" class="back-modes-btn">
          <i class="fas fa-list"></i>
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
      selectedMode: null,
      isTraining: false,
      showResults: false,
      currentRound: 0,
      currentContent: '',
      currentOptions: [],
      correctAnswer: '',
      userAnswer: '',
      isFlashing: false,
      waitingForAnswer: false,
      showFeedback: false,
      feedbackType: '',
      feedbackMessage: '',
      results: [],
      startTime: 0,
      settings: {
        flashDuration: 500,
        intervalDuration: 1000,
        rounds: 10
      },
      trainingModes: [
        {
          id: 'numbers',
          name: '数字识别',
          description: '快速识别闪现的数字序列',
          icon: 'fas fa-hashtag',
          speed: 500,
          difficulty: '简单',
          type: 'input',
          generator: this.generateNumbers
        },
        {
          id: 'letters',
          name: '字母识别',
          description: '快速识别闪现的字母组合',
          icon: 'fas fa-font',
          speed: 600,
          difficulty: '中等',
          type: 'input',
          generator: this.generateLetters
        },
        {
          id: 'words',
          name: '词汇识别',
          description: '快速识别闪现的中文词汇',
          icon: 'fas fa-language',
          speed: 800,
          difficulty: '困难',
          type: 'choice',
          generator: this.generateWords
        },
        {
          id: 'colors',
          name: '颜色识别',
          description: '快速识别闪现的颜色名称',
          icon: 'fas fa-palette',
          speed: 400,
          difficulty: '简单',
          type: 'choice',
          generator: this.generateColors
        }
      ]
    }
  },
  computed: {
    accuracy() {
      if (this.results.length === 0) return 0
      const correct = this.results.filter(r => r.correct).length
      return Math.round((correct / this.results.length) * 100)
    },
    finalScore() {
      return Math.round(this.finalAccuracy * 10)
    },
    finalAccuracy() {
      if (this.results.length === 0) return 0
      const correct = this.results.filter(r => r.correct).length
      return Math.round((correct / this.results.length) * 100)
    },
    correctCount() {
      return this.results.filter(r => r.correct).length
    },
    averageResponseTime() {
      if (this.results.length === 0) return 0
      const total = this.results.reduce((sum, r) => sum + r.responseTime, 0)
      return Math.round(total / this.results.length)
    },
    fastestTime() {
      if (this.results.length === 0) return 0
      return Math.min(...this.results.map(r => r.responseTime))
    }
  },
  methods: {
    selectMode(mode) {
      this.selectedMode = mode
      this.settings.flashDuration = mode.speed
    },
    startTraining() {
      this.isTraining = true
      this.currentRound = 0
      this.results = []
      this.nextFlash()
    },
    stopTraining() {
      this.isTraining = false
      this.showResults = true
    },
    nextFlash() {
      if (this.currentRound >= this.settings.rounds) {
        this.completeTraining()
        return
      }
      
      this.currentRound++
      this.generateContent()
      this.startTime = Date.now()
      
      // 开始闪视
      this.isFlashing = true
      this.waitingForAnswer = false
      this.showFeedback = false
      
      setTimeout(() => {
        this.isFlashing = false
        this.waitingForAnswer = true
        this.$nextTick(() => {
          if (this.$refs.answerInput) {
            this.$refs.answerInput.focus()
          }
        })
      }, this.settings.flashDuration)
    },
    generateContent() {
      const result = this.selectedMode.generator()
      this.currentContent = result.content
      this.correctAnswer = result.answer
      this.currentOptions = result.options || []
    },
    generateNumbers() {
      const length = Math.floor(Math.random() * 4) + 3 // 3-6位数字
      const numbers = Array.from({length}, () => Math.floor(Math.random() * 10)).join('')
      return {
        content: numbers,
        answer: numbers
      }
    },
    generateLetters() {
      const length = Math.floor(Math.random() * 3) + 3 // 3-5个字母
      const letters = Array.from({length}, () => 
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
      ).join('')
      return {
        content: letters,
        answer: letters
      }
    },
    generateWords() {
      const words = ['苹果', '香蕉', '橙子', '葡萄', '草莓', '西瓜', '桃子', '梨子', '柠檬', '樱桃']
      const correct = words[Math.floor(Math.random() * words.length)]
      const options = [correct]
      
      while (options.length < 4) {
        const option = words[Math.floor(Math.random() * words.length)]
        if (!options.includes(option)) {
          options.push(option)
        }
      }
      
      // 打乱选项顺序
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[options[i], options[j]] = [options[j], options[i]]
      }
      
      return {
        content: correct,
        answer: correct,
        options: options
      }
    },
    generateColors() {
      const colors = ['红色', '蓝色', '绿色', '黄色', '紫色', '橙色', '粉色', '黑色', '白色', '灰色']
      const correct = colors[Math.floor(Math.random() * colors.length)]
      const options = [correct]
      
      while (options.length < 4) {
        const option = colors[Math.floor(Math.random() * colors.length)]
        if (!options.includes(option)) {
          options.push(option)
        }
      }
      
      // 打乱选项顺序
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[options[i], options[j]] = [options[j], options[i]]
      }
      
      return {
        content: correct,
        answer: correct,
        options: options
      }
    },
    submitAnswer(answer) {
      const responseTime = Date.now() - this.startTime
      const correct = answer.toString().toLowerCase() === this.correctAnswer.toString().toLowerCase()
      
      this.results.push({
        round: this.currentRound,
        content: this.currentContent,
        userAnswer: answer,
        correctAnswer: this.correctAnswer,
        correct: correct,
        responseTime: responseTime
      })
      
      this.showFeedback = true
      this.feedbackType = correct ? 'correct' : 'incorrect'
      this.feedbackMessage = correct ? '正确！' : `错误，正确答案是: ${this.correctAnswer}`
      
      this.userAnswer = ''
      this.waitingForAnswer = false
      
      setTimeout(() => {
        this.nextFlash()
      }, 1500)
    },
    completeTraining() {
      this.isTraining = false
      this.showResults = true
    },
    restartTraining() {
      this.showResults = false
      this.startTraining()
    },
    backToModes() {
      this.showResults = false
      this.selectedMode = null
    }
  }
}
</script>

<style scoped>
.basic-flash-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}



.page-header h1 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 2.5rem;
}

.page-header p {
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0;
}

.training-modes {
  margin-bottom: 30px;
}

.training-modes h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.mode-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.mode-card:hover {
  border-color: #007bff;
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,123,255,0.2);
}

.mode-card.active {
  border-color: #007bff;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
}

.mode-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #007bff;
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
}

.mode-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  opacity: 0.7;
}

.training-settings {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.training-settings h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-item label {
  font-weight: 600;
  color: #495057;
}

.setting-item input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e9ecef;
  outline: none;
}

.setting-item span {
  font-weight: 600;
  color: #007bff;
  text-align: center;
}

.start-btn {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(40,167,69,0.3);
}

.training-interface {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.training-info {
  display: flex;
  gap: 20px;
  font-weight: 600;
}

.training-info span {
  color: #495057;
}

.stop-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.stop-btn:hover {
  background: #c82333;
  transform: translateY(-2px);
}

.flash-container {
  height: 300px;
  border: 3px solid #e9ecef;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.flash-container.flashing {
  border-color: #007bff;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  animation: flash-pulse 0.5s ease-in-out;
}

@keyframes flash-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.flash-content {
  font-size: 4rem;
  font-weight: bold;
  text-align: center;
  animation: content-appear 0.3s ease-out;
}

@keyframes content-appear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.answer-prompt, .ready-prompt {
  text-align: center;
  color: #6c757d;
}

.answer-prompt p, .ready-prompt p {
  font-size: 1.3rem;
  margin-bottom: 20px;
}

.next-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

.answer-section {
  margin-bottom: 20px;
}

.answer-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.option-btn {
  background: white;
  border: 2px solid #e9ecef;
  padding: 15px 20px;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-btn:hover {
  border-color: #007bff;
  background: #f8f9fa;
  transform: translateY(-2px);
}

.answer-input {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
}

.answer-input input {
  flex: 1;
  max-width: 300px;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1.1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.answer-input input:focus {
  border-color: #007bff;
}

.submit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

.feedback {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  animation: feedback-appear 0.3s ease-out;
}

@keyframes feedback-appear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feedback.correct {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.feedback.incorrect {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.training-results {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
}

.training-results h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2rem;
}

.results-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.result-card {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,123,255,0.3);
}

.result-card h3 {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  opacity: 0.9;
}

.score {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.accuracy, .time {
  font-size: 1.1rem;
  opacity: 0.9;
}

.detailed-stats {
  margin-bottom: 30px;
}

.detailed-stats h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  max-width: 400px;
  margin: 0 auto;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 8px;
  font-weight: 600;
}

.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.restart-btn, .back-modes-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.restart-btn {
  background: #28a745;
  color: white;
}

.restart-btn:hover {
  background: #218838;
  transform: translateY(-2px);
}

.back-modes-btn {
  background: #6c757d;
  color: white;
}

.back-modes-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .basic-flash-container {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .modes-grid {
    grid-template-columns: 1fr;
  }
  
  .training-card {
    padding: 20px;
  }
  
  .training-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .training-info {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .flash-container {
    height: 250px;
  }
  
  .answer-options {
    grid-template-columns: 1fr;
  }
  
  .answer-input {
    flex-direction: column;
  }
  
  .results-summary {
    grid-template-columns: 1fr;
  }
  
  .result-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .mode-card {
    padding: 20px;
  }
  
  .training-card {
    padding: 15px;
  }
  
  .flash-container {
    height: 200px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>