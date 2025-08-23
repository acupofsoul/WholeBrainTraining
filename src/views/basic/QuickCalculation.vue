<template>
  <div class="quick-calculation-container">
    <div class="header">
      <h2>快速计算训练</h2>
      <p class="description">通过快速数点训练，提升数字感知和计算能力</p>
    </div>

    <!-- 设置面板 -->
    <div class="settings-panel" v-if="!isTraining">
      <div class="setting-group">
        <label>黑点数量范围：</label>
        <div class="range-input">
          <div class="input-group">
            <label>最小值：</label>
            <input 
              type="number" 
              v-model="dotRange.min" 
              @input="validateRange"
              min="1" 
              max="1000"
              class="range-number-input"
            >
          </div>
          <div class="input-group">
            <label>最大值：</label>
            <input 
              type="number" 
              v-model="dotRange.max" 
              @input="validateRange"
              min="1" 
              max="1000"
              class="range-number-input"
            >
          </div>
        </div>
        <div class="range-info">
          <span class="current-range">当前范围：{{ dotRange.min }} - {{ dotRange.max }}</span>
          <span v-if="rangeError" class="error-message">{{ rangeError }}</span>
        </div>
      </div>

      <div class="setting-group">
        <label>黑点大小：</label>
        <div class="size-selector">
          <button 
            v-for="size in dotSizes" 
            :key="size.value"
            @click="dotSize = size.value"
            :class="{ active: dotSize === size.value }"
            class="size-btn"
          >
            {{ size.label }}
          </button>
        </div>
      </div>

      <div class="setting-group">
        <label>显示时间：</label>
        <div class="time-selector">
          <button 
            v-for="time in displayTimes" 
            :key="time.value"
            @click="displayTime = time.value"
            :class="{ active: displayTime === time.value }"
            class="time-btn"
          >
            {{ time.label }}
          </button>
        </div>
      </div>

      <button @click="startTraining" class="start-btn">开始训练</button>
    </div>

    <!-- 训练界面 -->
    <div class="training-area" v-if="isTraining">
      <!-- 倒计时 -->
      <div class="countdown" v-if="countdown > 0">
        {{ countdown }}
      </div>

      <!-- 画布区域 -->
      <div class="canvas-container" v-if="countdown === 0">
        <canvas 
          ref="canvas" 
          :width="canvasWidth" 
          :height="canvasHeight"
          @click="handleCanvasClick"
        ></canvas>
        
        <!-- 显示黑点 -->
        <div 
          v-for="(dot, index) in dots" 
          :key="index"
          class="dot"
          :style="{
            left: dot.x + 'px',
            top: dot.y + 'px',
            width: dotSize + 'px',
            height: dotSize + 'px'
          }"
          v-show="showDots"
        ></div>
      </div>

      <!-- 输入答案 -->
      <div class="answer-section" v-if="!showDots && countdown === 0">
        <h3>请输入您看到的黑点数量：</h3>
        <div class="answer-input">
          <input 
            type="number" 
            v-model="userAnswer" 
            @keyup.enter="submitAnswer"
            ref="answerInput"
            min="0"
            max="100"
          >
          <button @click="submitAnswer" :disabled="!userAnswer">确认</button>
        </div>
      </div>

      <!-- 结果显示 -->
      <div class="result-section" v-if="showResult">
        <div class="result-card" :class="{ correct: isCorrect, incorrect: !isCorrect }">
          <div class="result-icon">{{ isCorrect ? '✓' : '✗' }}</div>
          <h3>{{ isCorrect ? '回答正确！' : '回答错误' }}</h3>
          <p>正确答案：{{ dotCount }}</p>
          <p>您的答案：{{ userAnswer }}</p>
          <p v-if="!isCorrect">差值：{{ Math.abs(dotCount - userAnswer) }}</p>
        </div>
        
        <div class="action-buttons">
          <button @click="nextRound" class="next-btn">下一轮</button>
          <button @click="endTraining" class="end-btn">结束训练</button>
        </div>
      </div>
    </div>

    <!-- 训练统计 -->
    <div class="stats-panel" v-if="!isTraining && stats.totalRounds > 0">
      <h3>训练统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalRounds }}</span>
          <span class="stat-label">总轮数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.correctCount }}</span>
          <span class="stat-label">正确次数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ Math.round(stats.accuracy) }}%</span>
          <span class="stat-label">准确率</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.averageError.toFixed(1) }}</span>
          <span class="stat-label">平均误差</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'

// 响应式数据
const isTraining = ref(false)
const countdown = ref(0)
const dotCount = ref(10) // 当前轮次的实际黑点数量
const dotRange = reactive({ min: 10, max: 20 }) // 黑点数量范围
const rangeError = ref('') // 范围验证错误信息
const dotSize = ref(20)
const displayTime = ref(2000) // 毫秒
const showDots = ref(false)
const showResult = ref(false)
const userAnswer = ref('')
const isCorrect = ref(false)
const dots = ref([])
const canvas = ref(null)
const answerInput = ref(null)
const canvasWidth = 800
const canvasHeight = 600

// 配置选项
const dotSizes = [
  { label: '小', value: 15 },
  { label: '中', value: 20 },
  { label: '大', value: 25 }
]

const displayTimes = [
  { label: '1秒', value: 1000 },
  { label: '2秒', value: 2000 },
  { label: '3秒', value: 3000 },
  { label: '5秒', value: 5000 }
]

// 统计数据
const stats = reactive({
  totalRounds: 0,
  correctCount: 0,
  totalError: 0,
  accuracy: 0,
  averageError: 0
})

// 验证范围设置
const validateRange = () => {
  rangeError.value = ''
  
  // 检查范围是否在1-1000之间
  if (dotRange.min < 1 || dotRange.min > 1000) {
    rangeError.value = '最小值必须在1-1000之间'
    dotRange.min = Math.max(1, Math.min(1000, dotRange.min))
    return
  }
  
  if (dotRange.max < 1 || dotRange.max > 1000) {
    rangeError.value = '最大值必须在1-1000之间'
    dotRange.max = Math.max(1, Math.min(1000, dotRange.max))
    return
  }
  
  // 检查最小值是否小于等于最大值
  if (dotRange.min > dotRange.max) {
    rangeError.value = '最小值不能大于最大值'
    return
  }
  
  // 如果范围超出合理范围，给出提示
  if (dotRange.max - dotRange.min > 100) {
    rangeError.value = '建议范围跨度不要超过100，以获得更好的训练效果'
  }
}

// 生成范围内的随机黑点数量
const generateRandomDotCount = () => {
  return Math.floor(Math.random() * (dotRange.max - dotRange.min + 1)) + dotRange.min
}

// 生成随机位置的黑点
const generateDots = () => {
  dots.value = []
  const margin = dotSize.value
  
  for (let i = 0; i < dotCount.value; i++) {
    let attempts = 0
    let validPosition = false
    let newDot
    
    // 尝试找到不重叠的位置
    while (!validPosition && attempts < 100) {
      newDot = {
        x: Math.random() * (canvasWidth - 2 * margin) + margin,
        y: Math.random() * (canvasHeight - 2 * margin) + margin
      }
      
      // 检查是否与现有点重叠
      validPosition = dots.value.every(dot => {
        const distance = Math.sqrt(
          Math.pow(newDot.x - dot.x, 2) + Math.pow(newDot.y - dot.y, 2)
        )
        return distance >= dotSize.value * 1.5 // 保持一定距离
      })
      
      attempts++
    }
    
    if (validPosition) {
      dots.value.push(newDot)
    }
  }
}

// 开始训练
const startTraining = () => {
  isTraining.value = true
  showResult.value = false
  userAnswer.value = ''
  
  // 开始倒计时
  countdown.value = 3
  const countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(countdownInterval)
      startRound()
    }
  }, 1000)
}

// 开始一轮训练
const startRound = () => {
  // 验证范围设置
  validateRange()
  if (rangeError.value && !rangeError.value.includes('建议')) {
    return // 如果有严重错误，不开始训练
  }
  
  // 生成本轮的随机黑点数量
  dotCount.value = generateRandomDotCount()
  
  generateDots()
  showDots.value = true
  
  // 显示指定时间后隐藏黑点
  setTimeout(() => {
    showDots.value = false
    nextTick(() => {
      if (answerInput.value) {
        answerInput.value.focus()
      }
    })
  }, displayTime.value)
}

// 提交答案
const submitAnswer = () => {
  if (!userAnswer.value) return
  
  const answer = parseInt(userAnswer.value)
  isCorrect.value = answer === dotCount.value
  
  // 更新统计
  stats.totalRounds++
  if (isCorrect.value) {
    stats.correctCount++
  }
  stats.totalError += Math.abs(answer - dotCount.value)
  stats.accuracy = (stats.correctCount / stats.totalRounds) * 100
  stats.averageError = stats.totalError / stats.totalRounds
  
  showResult.value = true
  saveStats()
}

// 下一轮
const nextRound = () => {
  showResult.value = false
  userAnswer.value = ''
  startRound()
}

// 结束训练
const endTraining = () => {
  isTraining.value = false
  showResult.value = false
  showDots.value = false
  countdown.value = 0
}

// 处理画布点击（可选功能）
const handleCanvasClick = (event) => {
  // 可以添加点击计数功能
}

// 保存统计数据
const saveStats = () => {
  try {
    const data = {
      totalRounds: stats.totalRounds,
      correctCount: stats.correctCount,
      totalError: stats.totalError,
      accuracy: stats.accuracy,
      averageError: stats.averageError,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem('quickCalculationStats', JSON.stringify(data))
  } catch (error) {
    console.error('保存统计数据失败:', error)
  }
}

// 加载统计数据
const loadStats = () => {
  try {
    const saved = localStorage.getItem('quickCalculationStats')
    if (saved) {
      const data = JSON.parse(saved)
      Object.assign(stats, data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadStats()
  validateRange() // 初始化时验证默认范围
})
</script>

<style scoped>
.quick-calculation-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.description {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.settings-panel {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.number-input {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.number-input button {
  width: 40px;
  height: 40px;
  border: 2px solid #3498db;
  background: white;
  color: #3498db;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.number-input button:hover:not(:disabled) {
  background: #3498db;
  color: white;
}

.number-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.count-display {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  min-width: 3rem;
  text-align: center;
}

.range-input {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.input-group label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0;
}

.range-number-input {
  width: 80px;
  padding: 0.5rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  text-align: center;
  transition: border-color 0.3s ease;
}

.range-number-input:focus {
  outline: none;
  border-color: #3498db;
}

.range-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.current-range {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

.error-message {
  font-size: 0.85rem;
  color: #e74c3c;
  font-weight: 500;
}

.size-selector,
.time-selector {
  display: flex;
  gap: 0.5rem;
}

.size-btn,
.time-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.size-btn.active,
.time-btn.active {
  border-color: #3498db;
  background: #3498db;
  color: white;
}

.start-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.start-btn:hover {
  transform: translateY(-2px);
}

.training-area {
  text-align: center;
}

.countdown {
  font-size: 4rem;
  font-weight: bold;
  color: #e74c3c;
  margin: 2rem 0;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.canvas-container {
  position: relative;
  display: inline-block;
  border: 2px solid #bdc3c7;
  border-radius: 12px;
  margin: 2rem 0;
  background: white;
}

.dot {
  position: absolute;
  background: #2c3e50;
  border-radius: 50%;
  pointer-events: none;
}

.answer-section {
  margin: 2rem 0;
}

.answer-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.answer-input {
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}

.answer-input input {
  width: 120px;
  padding: 0.8rem;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  font-size: 1.2rem;
  text-align: center;
}

.answer-input input:focus {
  outline: none;
  border-color: #3498db;
}

.answer-input button {
  padding: 0.8rem 2rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.answer-input button:hover:not(:disabled) {
  background: #229954;
}

.answer-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-section {
  margin: 2rem 0;
}

.result-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.result-card.correct {
  border-left: 5px solid #27ae60;
}

.result-card.incorrect {
  border-left: 5px solid #e74c3c;
}

.result-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.result-card.correct .result-icon {
  color: #27ae60;
}

.result-card.incorrect .result-icon {
  color: #e74c3c;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.next-btn,
.end-btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-btn {
  background: #3498db;
  color: white;
}

.next-btn:hover {
  background: #2980b9;
}

.end-btn {
  background: #95a5a6;
  color: white;
}

.end-btn:hover {
  background: #7f8c8d;
}

.stats-panel {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
}

.stats-panel h3 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .quick-calculation-container {
    padding: 1rem;
  }
  
  .canvas-container {
    transform: scale(0.8);
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>