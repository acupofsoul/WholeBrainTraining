<template>
  <div class="memory-training-container">
    <div class="header">
      <h2>记忆训练</h2>
      <p>通过多种记忆练习，提升短期记忆、长期记忆和工作记忆能力</p>
    </div>

    <div class="training-modes">
      <div class="mode-card" 
           v-for="mode in trainingModes" 
           :key="mode.id"
           @click="selectMode(mode)"
           :class="{ active: selectedMode?.id === mode.id }">
        <h3>{{ mode.name }}</h3>
        <p>{{ mode.description }}</p>
        <div class="difficulty">
          <span>难度: {{ mode.difficulty }}</span>
        </div>
      </div>
    </div>

    <div class="training-area" v-if="selectedMode && !isTraining">
      <div class="mode-settings">
        <h3>{{ selectedMode.name }} 设置</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label>项目数量:</label>
            <select v-model="settings.itemCount">
              <option value="5">5个</option>
              <option value="8">8个</option>
              <option value="12">12个</option>
              <option value="16">16个</option>
            </select>
          </div>
          <div class="setting-item">
            <label>显示时间 (秒):</label>
            <input v-model.number="settings.displayTime" type="number" min="1" max="10" step="1" />
          </div>
          <div class="setting-item">
            <label>记忆时间 (秒):</label>
            <input v-model.number="settings.memoryTime" type="number" min="5" max="30" step="1" />
          </div>
        </div>
        <button @click="startTraining" class="btn-primary">开始训练</button>
      </div>
    </div>

    <div class="game-area" v-if="isTraining">
      <!-- 显示阶段 -->
      <div v-if="gamePhase === 'display'" class="display-phase">
        <h3>请记住以下内容</h3>
        <div class="countdown">{{ countdown }}</div>
        <div class="items-grid" :class="selectedMode.gridClass">
          <div v-for="(item, index) in currentItems" 
               :key="index" 
               class="memory-item"
               :class="selectedMode.itemClass">
            <span v-if="selectedMode.type === 'number'">{{ item }}</span>
            <div v-else-if="selectedMode.type === 'color'" 
                 :style="{ backgroundColor: item }"
                 class="color-block"></div>
            <span v-else-if="selectedMode.type === 'word'">{{ item }}</span>
            <img v-else-if="selectedMode.type === 'image'" :src="item" alt="记忆图片" />
          </div>
        </div>
      </div>

      <!-- 记忆阶段 -->
      <div v-if="gamePhase === 'memory'" class="memory-phase">
        <h3>请回忆刚才看到的内容</h3>
        <div class="countdown">思考时间: {{ countdown }}</div>
        <div class="memory-hint">
          <p>{{ selectedMode.memoryHint }}</p>
        </div>
      </div>

      <!-- 回答阶段 -->
      <div v-if="gamePhase === 'answer'" class="answer-phase">
        <h3>请选择正确的答案</h3>
        <div class="answer-grid" :class="selectedMode.gridClass">
          <div v-for="(option, index) in answerOptions" 
               :key="index" 
               class="answer-option"
               :class="{ 
                 selected: selectedAnswers.includes(index),
                 correct: showResults && correctAnswers.includes(index),
                 wrong: showResults && selectedAnswers.includes(index) && !correctAnswers.includes(index)
               }"
               @click="selectAnswer(index)">
            <span v-if="selectedMode.type === 'number'">{{ option }}</span>
            <div v-else-if="selectedMode.type === 'color'" 
                 :style="{ backgroundColor: option }"
                 class="color-block"></div>
            <span v-else-if="selectedMode.type === 'word'">{{ option }}</span>
            <img v-else-if="selectedMode.type === 'image'" :src="option" alt="选项图片" />
          </div>
        </div>
        
        <div class="answer-controls">
          <button @click="submitAnswer" :disabled="selectedAnswers.length === 0" class="btn-primary">
            提交答案
          </button>
          <button @click="resetGame" class="btn-secondary">重新开始</button>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="gamePhase === 'result'" class="result-phase">
        <h3>训练结果</h3>
        <div class="score-display">
          <div class="score-circle">
            <span class="score-number">{{ score }}</span>
            <span class="score-total">/ {{ settings.itemCount }}</span>
          </div>
          <p class="score-percentage">准确率: {{ Math.round((score / settings.itemCount) * 100) }}%</p>
        </div>
        
        <div class="result-actions">
          <button @click="resetGame" class="btn-primary">再次训练</button>
          <button @click="selectMode(null)" class="btn-secondary">选择其他模式</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// 响应式数据
const selectedMode = ref(null)
const isTraining = ref(false)
const gamePhase = ref('display') // display, memory, answer, result
const countdown = ref(0)
const currentItems = ref([])
const answerOptions = ref([])
const selectedAnswers = ref([])
const correctAnswers = ref([])
const showResults = ref(false)
const score = ref(0)
const timer = ref(null)

// 设置
const settings = ref({
  itemCount: 8,
  displayTime: 3,
  memoryTime: 10
})

// 训练模式
const trainingModes = ref([
  {
    id: 'number',
    name: '数字记忆',
    description: '记住一系列随机数字的顺序',
    difficulty: '★★☆',
    type: 'number',
    gridClass: 'numbers-grid',
    itemClass: 'number-item',
    memoryHint: '请回忆数字的顺序和位置'
  },
  {
    id: 'color',
    name: '颜色记忆',
    description: '记住不同颜色方块的位置',
    difficulty: '★★★',
    type: 'color',
    gridClass: 'colors-grid',
    itemClass: 'color-item',
    memoryHint: '请回忆颜色方块的位置'
  },
  {
    id: 'word',
    name: '词汇记忆',
    description: '记住一系列词汇的顺序',
    difficulty: '★★☆',
    type: 'word',
    gridClass: 'words-grid',
    itemClass: 'word-item',
    memoryHint: '请回忆词汇的顺序'
  },
  {
    id: 'image',
    name: '图像记忆',
    description: '记住不同图像的位置和内容',
    difficulty: '★★★',
    type: 'image',
    gridClass: 'images-grid',
    itemClass: 'image-item',
    memoryHint: '请回忆图像的位置和内容'
  }
])

// 方法
const selectMode = (mode) => {
  selectedMode.value = mode
  resetGame()
}

const startTraining = () => {
  isTraining.value = true
  gamePhase.value = 'display'
  generateItems()
  startCountdown(settings.value.displayTime, () => {
    gamePhase.value = 'memory'
    startCountdown(settings.value.memoryTime, () => {
      gamePhase.value = 'answer'
      generateAnswerOptions()
    })
  })
}

const generateItems = () => {
  const items = []
  const count = parseInt(settings.value.itemCount)
  
  switch (selectedMode.value.type) {
    case 'number':
      for (let i = 0; i < count; i++) {
        items.push(Math.floor(Math.random() * 100))
      }
      break
    case 'color':
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
      for (let i = 0; i < count; i++) {
        items.push(colors[Math.floor(Math.random() * colors.length)])
      }
      break
    case 'word':
      const words = ['苹果', '汽车', '房子', '书本', '电脑', '花朵', '音乐', '阳光', '海洋', '山峰', '星星', '月亮']
      for (let i = 0; i < count; i++) {
        items.push(words[Math.floor(Math.random() * words.length)])
      }
      break
    case 'image':
      for (let i = 0; i < count; i++) {
        items.push(`https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`)
      }
      break
  }
  
  currentItems.value = items
  correctAnswers.value = Array.from({ length: count }, (_, i) => i)
}

const generateAnswerOptions = () => {
  const options = [...currentItems.value]
  const extraCount = Math.max(4, Math.floor(settings.value.itemCount / 2))
  
  // 添加干扰项
  for (let i = 0; i < extraCount; i++) {
    switch (selectedMode.value.type) {
      case 'number':
        options.push(Math.floor(Math.random() * 100))
        break
      case 'color':
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
        options.push(colors[Math.floor(Math.random() * colors.length)])
        break
      case 'word':
        const words = ['苹果', '汽车', '房子', '书本', '电脑', '花朵', '音乐', '阳光', '海洋', '山峰', '星星', '月亮']
        options.push(words[Math.floor(Math.random() * words.length)])
        break
      case 'image':
        options.push(`https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`)
        break
    }
  }
  
  // 打乱顺序
  answerOptions.value = options.sort(() => Math.random() - 0.5)
}

const selectAnswer = (index) => {
  if (showResults.value) return
  
  const answerIndex = selectedAnswers.value.indexOf(index)
  if (answerIndex > -1) {
    selectedAnswers.value.splice(answerIndex, 1)
  } else {
    selectedAnswers.value.push(index)
  }
}

const submitAnswer = () => {
  showResults.value = true
  
  // 计算得分
  let correctCount = 0
  selectedAnswers.value.forEach(answerIndex => {
    const selectedItem = answerOptions.value[answerIndex]
    if (currentItems.value.includes(selectedItem)) {
      correctCount++
    }
  })
  
  score.value = correctCount
  
  setTimeout(() => {
    gamePhase.value = 'result'
  }, 2000)
}

const startCountdown = (seconds, callback) => {
  countdown.value = seconds
  timer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer.value)
      callback()
    }
  }, 1000)
}

const resetGame = () => {
  isTraining.value = false
  gamePhase.value = 'display'
  currentItems.value = []
  answerOptions.value = []
  selectedAnswers.value = []
  correctAnswers.value = []
  showResults.value = false
  score.value = 0
  if (timer.value) {
    clearInterval(timer.value)
  }
}

// 生命周期
onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.memory-training-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.training-modes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.mode-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.mode-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.mode-card.active {
  border-color: #3498db;
  background-color: #f8f9fa;
}

.mode-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.mode-card p {
  color: #666;
  margin-bottom: 15px;
}

.difficulty {
  color: #e74c3c;
  font-weight: bold;
}

.training-area {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-item label {
  font-weight: bold;
  color: #2c3e50;
  min-width: 100px;
}

.setting-item input, .setting-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
}

.game-area {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.countdown {
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
  margin: 20px 0;
}

.items-grid {
  display: grid;
  gap: 15px;
  margin: 30px 0;
  justify-content: center;
}

.numbers-grid, .words-grid {
  grid-template-columns: repeat(4, 1fr);
  max-width: 400px;
  margin: 0 auto;
}

.colors-grid, .images-grid {
  grid-template-columns: repeat(4, 1fr);
  max-width: 500px;
  margin: 0 auto;
}

.memory-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-block {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid #ddd;
}

.memory-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.answer-grid {
  display: grid;
  gap: 10px;
  margin: 30px 0;
  justify-content: center;
}

.answer-option {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-option:hover {
  background-color: #e9ecef;
}

.answer-option.selected {
  border-color: #3498db;
  background-color: #e3f2fd;
}

.answer-option.correct {
  border-color: #27ae60;
  background-color: #d5f4e6;
}

.answer-option.wrong {
  border-color: #e74c3c;
  background-color: #fdeaea;
}

.answer-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.score-display {
  margin: 30px 0;
}

.score-circle {
  display: inline-block;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.score-number {
  font-size: 36px;
  font-weight: bold;
}

.score-total {
  font-size: 18px;
}

.score-percentage {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.memory-hint {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.memory-hint p {
  color: #666;
  margin: 0;
  font-style: italic;
}
</style>