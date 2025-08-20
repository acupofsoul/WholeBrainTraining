<template>
  <div class="flash-vision-container training-container">
    <h1 class="training-title">闪视训练</h1>
    
    <div class="training-controls">
      <div class="form-group">
        <label class="form-label">显示时间 (毫秒)</label>
        <input 
          type="range" 
          v-model.number="displayTime" 
          min="50" 
          max="1000" 
          step="50" 
          class="form-control" 
          :disabled="isTraining"
        >
        <div class="time-value">{{ displayTime }} 毫秒</div>
      </div>
      
      <div class="form-group">
        <label class="form-label">内容类型</label>
        <select v-model="contentType" class="form-control" :disabled="isTraining">
          <option value="numbers">数字</option>
          <option value="letters">字母</option>
          <option value="words">单词</option>
          <option value="shapes">图形</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">难度级别</label>
        <select v-model="difficultyLevel" class="form-control" :disabled="isTraining">
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>
    </div>
    
    <div class="training-stats" v-if="isTraining || isAnswering || hasCompleted">
      <div class="stat-item">
        <div class="stat-value">{{ currentRound }} / {{ totalRounds }}</div>
        <div class="stat-label">回合</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ correctAnswers }}</div>
        <div class="stat-label">正确</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ Math.round(correctPercentage) }}%</div>
        <div class="stat-label">正确率</div>
      </div>
    </div>
    
    <div class="flash-actions">
      <button 
        v-if="!isTraining && !isAnswering && !hasCompleted" 
        @click="startTraining" 
        class="btn btn-primary btn-lg"
      >
        开始训练
      </button>
      <button 
        v-if="hasCompleted" 
        @click="resetTraining" 
        class="btn btn-primary btn-lg"
      >
        再次训练
      </button>
    </div>
    
    <div class="flash-display" v-if="isTraining && !isAnswering">
      <div class="flash-content" :class="contentType">
        <div v-if="contentType === 'numbers' || contentType === 'letters'" class="number-letter-display">
          {{ currentContent }}
        </div>
        <div v-else-if="contentType === 'words'" class="word-display">
          {{ currentContent }}
        </div>
        <div v-else-if="contentType === 'shapes'" class="shape-display">
          <div 
            v-for="(shape, index) in currentShapes" 
            :key="index"
            class="shape"
            :class="shape.type"
            :style="{
              backgroundColor: shape.color,
              top: `${shape.top}%`,
              left: `${shape.left}%`,
              transform: `rotate(${shape.rotation}deg)`
            }"
          ></div>
        </div>
      </div>
      <div class="countdown-timer" v-if="showCountdown">
        {{ countdownValue }}
      </div>
    </div>
    
    <div class="answer-section" v-if="isAnswering">
      <div class="answer-prompt">
        <h3>请输入您看到的内容</h3>
        
        <div v-if="contentType === 'numbers' || contentType === 'letters' || contentType === 'words'">
          <input 
            type="text" 
            v-model="userAnswer" 
            class="form-control answer-input" 
            placeholder="输入您看到的内容"
            ref="answerInput"
            @keyup.enter="submitAnswer"
          >
        </div>
        
        <div v-else-if="contentType === 'shapes'" class="shapes-answer">
          <div class="shape-options">
            <div 
              v-for="(shapeType, index) in shapeTypes" 
              :key="index"
              class="shape-option"
              @click="toggleShapeSelection(shapeType)"
            >
              <div class="shape" :class="shapeType"></div>
              <div class="shape-count">
                {{ getSelectedShapeCount(shapeType) }} / {{ getActualShapeCount(shapeType) }}
              </div>
              <div class="shape-controls">
                <button @click.stop="decrementShape(shapeType)" class="btn btn-sm">-</button>
                <button @click.stop="incrementShape(shapeType)" class="btn btn-sm">+</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="answer-actions">
          <button @click="submitAnswer" class="btn btn-primary">提交答案</button>
        </div>
      </div>
    </div>
    
    <div class="result-feedback" v-if="showFeedback">
      <div class="feedback-card" :class="{ 'correct-feedback': isCorrect, 'incorrect-feedback': !isCorrect }">
        <h3>{{ isCorrect ? '回答正确！' : '回答错误' }}</h3>
        <div v-if="!isCorrect" class="correct-answer-display">
          <p>正确答案: <span class="correct-value">{{ correctValue }}</span></p>
          <p>您的答案: <span class="user-value">{{ userAnswer }}</span></p>
        </div>
        <div class="feedback-actions">
          <button @click="nextRound" class="btn btn-primary">继续</button>
        </div>
      </div>
    </div>
    
    <div class="training-results" v-if="hasCompleted">
      <div class="results-card">
        <h3>训练结果</h3>
        <div class="results-summary">
          <p>总回合数: {{ totalRounds }}</p>
          <p>正确回答: {{ correctAnswers }}</p>
          <p>正确率: {{ Math.round(correctPercentage) }}%</p>
          <p>平均反应时间: {{ averageResponseTime }} 毫秒</p>
        </div>
        <div class="results-chart">
          <!-- 这里可以添加图表展示训练结果 -->
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${correctPercentage}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="training-instructions" v-if="!isTraining && !isAnswering && !hasCompleted">
      <div class="card">
        <h3 class="card-title">训练说明</h3>
        <div class="card-content">
          <p>闪视训练是一种提高视觉记忆力和信息处理速度的训练方法。</p>
          <p>训练目标：在短时间内准确记忆屏幕上显示的内容。</p>
          <p>训练方法：</p>
          <ol>
            <li>屏幕将在短时间内显示内容（数字、字母、单词或图形）</li>
            <li>内容消失后，您需要输入或选择您看到的内容</li>
            <li>系统会立即给出反馈，并记录您的表现</li>
          </ol>
          <p>内容类型说明：</p>
          <ul>
            <li><strong>数字</strong>：随机数字序列</li>
            <li><strong>字母</strong>：随机字母序列</li>
            <li><strong>单词</strong>：随机单词</li>
            <li><strong>图形</strong>：不同形状、颜色和位置的图形组合</li>
          </ul>
          <p>建议：从较长显示时间和简单难度开始，逐渐提高难度和减少显示时间。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';

// 训练配置
const displayTime = ref(300); // 默认300毫秒
const contentType = ref('numbers'); // 默认数字
const difficultyLevel = ref('easy'); // 默认简单难度

// 训练状态
const isTraining = ref(false);
const isAnswering = ref(false);
const hasCompleted = ref(false);
const showCountdown = ref(false);
const countdownValue = ref(3);
const currentRound = ref(0);
const totalRounds = ref(10);
const correctAnswers = ref(0);
const currentContent = ref('');
const currentShapes = ref([]);
const userAnswer = ref('');
const selectedShapes = ref({});
const showFeedback = ref(false);
const isCorrect = ref(false);
const correctValue = ref('');
const responseTimes = ref([]);

// 图形类型
const shapeTypes = ['circle', 'square', 'triangle', 'diamond'];

// 计算属性
const correctPercentage = computed(() => {
  if (currentRound.value === 0) return 0;
  return (correctAnswers.value / currentRound.value) * 100;
});

const averageResponseTime = computed(() => {
  if (responseTimes.value.length === 0) return 0;
  const sum = responseTimes.value.reduce((acc, time) => acc + time, 0);
  return Math.round(sum / responseTimes.value.length);
});

// 计时器和超时处理
let displayTimer = null;
let countdownTimer = null;
let responseStartTime = 0;

// 开始训练
const startTraining = () => {
  isTraining.value = true;
  isAnswering.value = false;
  hasCompleted.value = false;
  currentRound.value = 0;
  correctAnswers.value = 0;
  responseTimes.value = [];
  showFeedback.value = false;
  
  // 开始倒计时
  startCountdown();
};

// 开始倒计时
const startCountdown = () => {
  showCountdown.value = true;
  countdownValue.value = 3;
  
  countdownTimer = setInterval(() => {
    countdownValue.value--;
    
    if (countdownValue.value <= 0) {
      clearInterval(countdownTimer);
      showCountdown.value = false;
      startRound();
    }
  }, 1000);
};

// 开始回合
const startRound = () => {
  currentRound.value++;
  
  // 生成内容
  generateContent();
  
  // 显示内容一段时间后隐藏
  displayTimer = setTimeout(() => {
    isTraining.value = false;
    isAnswering.value = true;
    responseStartTime = Date.now();
    
    // 自动聚焦到输入框
    nextTick(() => {
      if (contentType.value !== 'shapes' && document.querySelector('.answer-input')) {
        document.querySelector('.answer-input').focus();
      }
    });
  }, displayTime.value);
};

// 生成内容
const generateContent = () => {
  if (contentType.value === 'numbers') {
    generateNumbers();
  } else if (contentType.value === 'letters') {
    generateLetters();
  } else if (contentType.value === 'words') {
    generateWords();
  } else if (contentType.value === 'shapes') {
    generateShapes();
  }
};

// 生成数字
const generateNumbers = () => {
  let length = 0;
  
  // 根据难度确定数字长度
  if (difficultyLevel.value === 'easy') {
    length = 4 + Math.floor(Math.random() * 2); // 4-5位
  } else if (difficultyLevel.value === 'medium') {
    length = 6 + Math.floor(Math.random() * 2); // 6-7位
  } else {
    length = 8 + Math.floor(Math.random() * 3); // 8-10位
  }
  
  let numbers = '';
  for (let i = 0; i < length; i++) {
    numbers += Math.floor(Math.random() * 10);
  }
  
  currentContent.value = numbers;
  correctValue.value = numbers;
};

// 生成字母
const generateLetters = () => {
  let length = 0;
  
  // 根据难度确定字母长度
  if (difficultyLevel.value === 'easy') {
    length = 3 + Math.floor(Math.random() * 2); // 3-4位
  } else if (difficultyLevel.value === 'medium') {
    length = 5 + Math.floor(Math.random() * 2); // 5-6位
  } else {
    length = 7 + Math.floor(Math.random() * 3); // 7-9位
  }
  
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  currentContent.value = result;
  correctValue.value = result;
};

// 生成单词
const generateWords = () => {
  // 简单的单词列表
  const easyWords = ['苹果', '香蕉', '橙子', '西瓜', '草莓', '蓝莓', '葡萄', '柠檬', '桃子', '梨子'];
  const mediumWords = ['电脑', '手机', '键盘', '鼠标', '显示器', '耳机', '相机', '打印机', '路由器', '充电器'];
  const hardWords = ['算法', '编程', '数据库', '网络', '服务器', '云计算', '人工智能', '机器学习', '区块链', '虚拟现实'];
  
  let wordCount = 0;
  let wordList = [];
  
  // 根据难度选择单词数量和列表
  if (difficultyLevel.value === 'easy') {
    wordCount = 1;
    wordList = easyWords;
  } else if (difficultyLevel.value === 'medium') {
    wordCount = 2;
    wordList = mediumWords;
  } else {
    wordCount = 3;
    wordList = hardWords;
  }
  
  // 随机选择单词
  let selectedWords = [];
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    selectedWords.push(wordList[randomIndex]);
  }
  
  currentContent.value = selectedWords.join(' ');
  correctValue.value = currentContent.value;
};

// 生成图形
const generateShapes = () => {
  let shapeCount = 0;
  
  // 根据难度确定图形数量
  if (difficultyLevel.value === 'easy') {
    shapeCount = 3;
  } else if (difficultyLevel.value === 'medium') {
    shapeCount = 5;
  } else {
    shapeCount = 7;
  }
  
  const shapes = [];
  const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#00BCD4'];
  
  // 重置已选择的图形
  selectedShapes.value = {
    circle: 0,
    square: 0,
    triangle: 0,
    diamond: 0
  };
  
  // 生成随机图形
  for (let i = 0; i < shapeCount; i++) {
    const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const top = 10 + Math.floor(Math.random() * 80); // 10%-90%的范围
    const left = 10 + Math.floor(Math.random() * 80); // 10%-90%的范围
    const rotation = Math.floor(Math.random() * 360); // 0-359度旋转
    
    shapes.push({
      type: shapeType,
      color,
      top,
      left,
      rotation
    });
  }
  
  currentShapes.value = shapes;
  
  // 计算每种图形的数量，用于验证答案
  const shapeCounts = {
    circle: 0,
    square: 0,
    triangle: 0,
    diamond: 0
  };
  
  shapes.forEach(shape => {
    shapeCounts[shape.type]++;
  });
  
  correctValue.value = JSON.stringify(shapeCounts);
};

// 切换图形选择
const toggleShapeSelection = (shapeType) => {
  // 图形模式下的选择逻辑
};

// 增加图形数量
const incrementShape = (shapeType) => {
  selectedShapes.value[shapeType]++;
};

// 减少图形数量
const decrementShape = (shapeType) => {
  if (selectedShapes.value[shapeType] > 0) {
    selectedShapes.value[shapeType]--;
  }
};

// 获取已选择的图形数量
const getSelectedShapeCount = (shapeType) => {
  return selectedShapes.value[shapeType] || 0;
};

// 获取实际的图形数量
const getActualShapeCount = (shapeType) => {
  if (!currentShapes.value.length) return 0;
  return currentShapes.value.filter(shape => shape.type === shapeType).length;
};

// 提交答案
const submitAnswer = () => {
  // 计算响应时间
  const responseTime = Date.now() - responseStartTime;
  responseTimes.value.push(responseTime);
  
  isAnswering.value = false;
  showFeedback.value = true;
  
  // 检查答案是否正确
  if (contentType.value === 'shapes') {
    // 图形模式下的验证
    const actualCounts = {
      circle: getActualShapeCount('circle'),
      square: getActualShapeCount('square'),
      triangle: getActualShapeCount('triangle'),
      diamond: getActualShapeCount('diamond')
    };
    
    isCorrect.value = 
      selectedShapes.value.circle === actualCounts.circle &&
      selectedShapes.value.square === actualCounts.square &&
      selectedShapes.value.triangle === actualCounts.triangle &&
      selectedShapes.value.diamond === actualCounts.diamond;
  } else {
    // 文本模式下的验证
    isCorrect.value = userAnswer.value.trim().toUpperCase() === correctValue.value.toUpperCase();
  }
  
  // 更新正确答案计数
  if (isCorrect.value) {
    correctAnswers.value++;
  }
};

// 下一回合
const nextRound = () => {
  showFeedback.value = false;
  userAnswer.value = '';
  
  // 检查是否完成所有回合
  if (currentRound.value >= totalRounds.value) {
    completeTraining();
  } else {
    // 开始下一回合
    isTraining.value = true;
    startRound();
  }
};

// 完成训练
const completeTraining = () => {
  hasCompleted.value = true;
  isTraining.value = false;
  isAnswering.value = false;
  
  // 保存训练结果到本地存储
  // 这部分将在实现本地存储功能时完成
};

// 重置训练
const resetTraining = () => {
  isTraining.value = false;
  isAnswering.value = false;
  hasCompleted.value = false;
  showFeedback.value = false;
  currentRound.value = 0;
  correctAnswers.value = 0;
  responseTimes.value = [];
  userAnswer.value = '';
};

// 组件卸载前清理计时器
onBeforeUnmount(() => {
  if (displayTimer) {
    clearTimeout(displayTimer);
    displayTimer = null;
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
});
</script>

<style scoped>
.flash-vision-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-value {
  text-align: center;
  margin-top: 0.5rem;
  font-weight: bold;
  color: #4a6fa5;
}

.flash-actions {
  margin-bottom: 2rem;
}

.flash-display {
  width: 100%;
  max-width: 600px;
  height: 300px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.flash-content {
  text-align: center;
  padding: 2rem;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.number-letter-display {
  font-size: 3rem;
  font-weight: bold;
  color: #2c3e50;
  letter-spacing: 0.1em;
}

.word-display {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.shape-display {
  width: 100%;
  height: 100%;
  position: relative;
}

.shape {
  position: absolute;
  width: 40px;
  height: 40px;
}

.circle {
  border-radius: 50%;
}

.square {
  border-radius: 0;
}

.triangle {
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 40px solid currentColor;
  background-color: transparent !important;
}

.diamond {
  transform: rotate(45deg);
  border-radius: 0;
}

.countdown-timer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 5rem;
  font-weight: bold;
  color: #4a6fa5;
  z-index: 10;
}

.answer-section {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.answer-prompt {
  text-align: center;
  margin-bottom: 1.5rem;
}

.answer-input {
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
}

.shapes-answer {
  margin-top: 1.5rem;
}

.shape-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.shape-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.shape-option .shape {
  position: static;
  margin-bottom: 0.5rem;
  background-color: #4a6fa5;
}

.shape-count {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.shape-controls {
  display: flex;
  gap: 0.5rem;
}

.answer-actions {
  margin-top: 1.5rem;
}

.result-feedback {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.feedback-card {
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.correct-feedback {
  background-color: rgba(40, 167, 69, 0.2);
}

.incorrect-feedback {
  background-color: rgba(220, 53, 69, 0.2);
}

.correct-answer-display {
  margin: 1rem 0;
}

.correct-value {
  font-weight: bold;
  color: #28a745;
}

.user-value {
  font-weight: bold;
  color: #dc3545;
}

.feedback-actions {
  margin-top: 1.5rem;
}

.training-results {
  width: 100%;
  max-width: 600px;
  margin: 2rem auto;
}

.results-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.results-summary {
  margin-bottom: 1.5rem;
}

.progress-bar {
  height: 20px;
  background-color: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-fill {
  height: 100%;
  background-color: #4a6fa5;
  border-radius: 10px;
  transition: width 0.5s;
}

.training-instructions {
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
}

@media (max-width: 768px) {
  .training-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .number-letter-display {
    font-size: 2.5rem;
  }
  
  .word-display {
    font-size: 2rem;
  }
  
  .shape-options {
    gap: 1rem;
  }
  
  .shape {
    width: 30px;
    height: 30px;
  }
  
  .triangle {
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-bottom: 30px solid currentColor;
  }
}
</style>