<template>
  <div class="threed-card">
    <div class="training-header">
      <h2>3D卡片训练</h2>
      <p>观察立体卡片的空间位置和旋转状态</p>
    </div>

    <div class="training-content">
      <div v-if="!isTraining" class="start-screen">
        <div class="settings">
          <div class="setting-item">
            <label>卡片数量：</label>
            <select v-model="settings.cardCount">
              <option value="3">3张</option>
              <option value="4">4张</option>
              <option value="5">5张</option>
              <option value="6">6张</option>
            </select>
          </div>
          <div class="setting-item">
            <label>观察时间（秒）：</label>
            <input v-model.number="settings.observeTime" type="number" min="3" max="10" />
          </div>
          <div class="setting-item">
            <label>训练轮数：</label>
            <input v-model.number="settings.rounds" type="number" min="5" max="15" />
          </div>
        </div>
        <button @click="startTraining" class="start-btn">开始训练</button>
      </div>

      <div v-else class="training-area">
        <div class="progress-info">
          <span>第 {{ currentRound }} / {{ settings.rounds }} 轮</span>
          <span>得分: {{ score }}</span>
        </div>

        <div v-if="phase === 'observe'" class="observe-phase">
          <div class="countdown">{{ countdown }}</div>
          <div class="cards-container">
            <div 
              v-for="(card, index) in currentCards" 
              :key="index"
              class="card-3d"
              :class="card.type"
              :style="{
                transform: `rotateX(${card.rotateX}deg) rotateY(${card.rotateY}deg) rotateZ(${card.rotateZ}deg)`,
                backgroundColor: card.color,
                left: card.x + 'px',
                top: card.y + 'px'
              }"
            >
              <div class="card-face front">{{ card.symbol }}</div>
              <div class="card-face back"></div>
            </div>
          </div>
          <p>请仔细观察卡片的位置、颜色和符号</p>
        </div>

        <div v-else-if="phase === 'question'" class="question-phase">
          <div class="question">
            <p>{{ currentQuestion.text }}</p>
            <div class="options">
              <button 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="option-btn"
                :class="{ selected: selectedAnswer === option }"
                @click="selectAnswer(option)"
              >
                {{ option }}
              </button>
            </div>
            <button @click="submitAnswer" :disabled="!selectedAnswer" class="submit-btn">确认答案</button>
          </div>
        </div>

        <div v-else-if="phase === 'result'" class="result-phase">
          <div class="result-message" :class="{ correct: lastAnswerCorrect, incorrect: !lastAnswerCorrect }">
            {{ lastAnswerCorrect ? '正确！' : '错误！' }}
          </div>
          <div class="correct-info">
            <p>正确答案: {{ currentQuestion.correct }}</p>
          </div>
          <button @click="nextRound" class="next-btn">下一轮</button>
        </div>

        <div v-else-if="phase === 'complete'" class="complete-phase">
          <h3>训练完成！</h3>
          <div class="final-score">
            <p>最终得分: {{ score }} / {{ settings.rounds }}</p>
            <p>正确率: {{ Math.round((score / settings.rounds) * 100) }}%</p>
            <p>空间感知能力: {{ getSpatialRating() }}</p>
          </div>
          <button @click="resetTraining" class="restart-btn">重新开始</button>
        </div>
      </div>
    </div>

    <div class="training-stats" v-if="stats.totalSessions > 0">
      <h3>训练统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">总训练次数：</span>
          <span class="stat-value">{{ stats.totalSessions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均正确率：</span>
          <span class="stat-value">{{ Math.round(stats.averageAccuracy) }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">最佳表现：</span>
          <span class="stat-value">{{ stats.bestAccuracy }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';

// 训练状态
const isTraining = ref(false);
const phase = ref('observe'); // 'observe' | 'question' | 'result' | 'complete'
const currentRound = ref(1);
const score = ref(0);
const countdown = ref(3);

// 训练设置
const settings = reactive({
  cardCount: 4,
  observeTime: 5,
  rounds: 10
});

// 当前训练数据
const currentCards = ref([]);
const currentQuestion = ref({});
const selectedAnswer = ref('');
const lastAnswerCorrect = ref(false);

// 训练统计
const stats = reactive({
  totalSessions: 0,
  averageAccuracy: 0,
  bestAccuracy: 0,
  totalCorrect: 0,
  totalQuestions: 0
});

// 卡片配置
const cardColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
const cardSymbols = ['♠', '♥', '♦', '♣', '★', '●', '▲', '■'];
const cardTypes = ['square', 'circle', 'triangle'];

// 定时器
let timer = null;

// 开始训练
const startTraining = () => {
  isTraining.value = true;
  currentRound.value = 1;
  score.value = 0;
  startRound();
};

// 开始新一轮
const startRound = () => {
  phase.value = 'observe';
  countdown.value = 3;
  generateCards();
  
  // 倒计时
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      showCards();
    }
  }, 1000);
};

// 生成卡片
const generateCards = () => {
  currentCards.value = [];
  
  for (let i = 0; i < settings.cardCount; i++) {
    const card = {
      id: i,
      color: cardColors[Math.floor(Math.random() * cardColors.length)],
      symbol: cardSymbols[Math.floor(Math.random() * cardSymbols.length)],
      type: cardTypes[Math.floor(Math.random() * cardTypes.length)],
      rotateX: Math.random() * 360,
      rotateY: Math.random() * 360,
      rotateZ: Math.random() * 360,
      x: Math.random() * 300,
      y: Math.random() * 200
    };
    currentCards.value.push(card);
  }
};

// 显示卡片
const showCards = () => {
  setTimeout(() => {
    phase.value = 'question';
    generateQuestion();
  }, settings.observeTime * 1000);
};

// 生成问题
const generateQuestion = () => {
  const questionTypes = [
    'color', 'symbol', 'position', 'rotation', 'count'
  ];
  
  const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  
  switch (questionType) {
    case 'color':
      generateColorQuestion();
      break;
    case 'symbol':
      generateSymbolQuestion();
      break;
    case 'position':
      generatePositionQuestion();
      break;
    case 'rotation':
      generateRotationQuestion();
      break;
    case 'count':
      generateCountQuestion();
      break;
  }
  
  selectedAnswer.value = '';
};

// 生成颜色问题
const generateColorQuestion = () => {
  const targetCard = currentCards.value[Math.floor(Math.random() * currentCards.value.length)];
  const options = [targetCard.color];
  
  while (options.length < 4) {
    const randomColor = cardColors[Math.floor(Math.random() * cardColors.length)];
    if (!options.includes(randomColor)) {
      options.push(randomColor);
    }
  }
  
  currentQuestion.value = {
    text: `第${targetCard.id + 1}张卡片是什么颜色？`,
    options: options.sort(() => Math.random() - 0.5),
    correct: targetCard.color
  };
};

// 生成符号问题
const generateSymbolQuestion = () => {
  const targetCard = currentCards.value[Math.floor(Math.random() * currentCards.value.length)];
  const options = [targetCard.symbol];
  
  while (options.length < 4) {
    const randomSymbol = cardSymbols[Math.floor(Math.random() * cardSymbols.length)];
    if (!options.includes(randomSymbol)) {
      options.push(randomSymbol);
    }
  }
  
  currentQuestion.value = {
    text: `第${targetCard.id + 1}张卡片上的符号是什么？`,
    options: options.sort(() => Math.random() - 0.5),
    correct: targetCard.symbol
  };
};

// 生成位置问题
const generatePositionQuestion = () => {
  const positions = ['左上', '右上', '左下', '右下', '中央'];
  const targetCard = currentCards.value[Math.floor(Math.random() * currentCards.value.length)];
  
  let position;
  if (targetCard.x < 150 && targetCard.y < 100) position = '左上';
  else if (targetCard.x >= 150 && targetCard.y < 100) position = '右上';
  else if (targetCard.x < 150 && targetCard.y >= 100) position = '左下';
  else if (targetCard.x >= 150 && targetCard.y >= 100) position = '右下';
  else position = '中央';
  
  const options = [position];
  while (options.length < 4) {
    const randomPos = positions[Math.floor(Math.random() * positions.length)];
    if (!options.includes(randomPos)) {
      options.push(randomPos);
    }
  }
  
  currentQuestion.value = {
    text: `${targetCard.symbol}符号的卡片在什么位置？`,
    options: options.sort(() => Math.random() - 0.5),
    correct: position
  };
};

// 生成旋转问题
const generateRotationQuestion = () => {
  const rotations = ['向左倾斜', '向右倾斜', '正立', '倒立'];
  const targetCard = currentCards.value[Math.floor(Math.random() * currentCards.value.length)];
  
  let rotation;
  if (targetCard.rotateZ > 315 || targetCard.rotateZ <= 45) rotation = '正立';
  else if (targetCard.rotateZ > 45 && targetCard.rotateZ <= 135) rotation = '向右倾斜';
  else if (targetCard.rotateZ > 135 && targetCard.rotateZ <= 225) rotation = '倒立';
  else rotation = '向左倾斜';
  
  currentQuestion.value = {
    text: `${targetCard.color}颜色的卡片是什么旋转状态？`,
    options: rotations,
    correct: rotation
  };
};

// 生成计数问题
const generateCountQuestion = () => {
  const targetColor = cardColors[Math.floor(Math.random() * cardColors.length)];
  const count = currentCards.value.filter(card => card.color === targetColor).length;
  
  const options = [count.toString()];
  for (let i = 0; i < 3; i++) {
    let randomCount;
    do {
      randomCount = Math.floor(Math.random() * settings.cardCount) + 1;
    } while (options.includes(randomCount.toString()));
    options.push(randomCount.toString());
  }
  
  currentQuestion.value = {
    text: `有多少张${targetColor}颜色的卡片？`,
    options: options.sort(() => Math.random() - 0.5),
    correct: count.toString()
  };
};

// 选择答案
const selectAnswer = (answer) => {
  selectedAnswer.value = answer;
};

// 提交答案
const submitAnswer = () => {
  lastAnswerCorrect.value = selectedAnswer.value === currentQuestion.value.correct;
  if (lastAnswerCorrect.value) {
    score.value++;
  }
  phase.value = 'result';
};

// 下一轮
const nextRound = () => {
  if (currentRound.value < settings.rounds) {
    currentRound.value++;
    startRound();
  } else {
    completeTraining();
  }
};

// 完成训练
const completeTraining = () => {
  phase.value = 'complete';
  
  const accuracy = (score.value / settings.rounds) * 100;
  
  // 更新统计
  stats.totalSessions++;
  stats.totalCorrect += score.value;
  stats.totalQuestions += settings.rounds;
  stats.averageAccuracy = (stats.totalCorrect / stats.totalQuestions) * 100;
  stats.bestAccuracy = Math.max(stats.bestAccuracy, accuracy);
  
  saveStats();
};

// 获取空间感知评级
const getSpatialRating = () => {
  const accuracy = (score.value / settings.rounds) * 100;
  if (accuracy >= 90) return '优秀';
  if (accuracy >= 80) return '良好';
  if (accuracy >= 70) return '中等';
  if (accuracy >= 60) return '及格';
  return '需要提高';
};

// 重置训练
const resetTraining = () => {
  isTraining.value = false;
  phase.value = 'observe';
};

// 保存统计数据
const saveStats = () => {
  localStorage.setItem('threed-card-stats', JSON.stringify(stats));
};

// 加载统计数据
const loadStats = () => {
  const saved = localStorage.getItem('threed-card-stats');
  if (saved) {
    Object.assign(stats, JSON.parse(saved));
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadStats();
});
</script>

<style scoped>
.threed-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.training-header {
  text-align: center;
  margin-bottom: 30px;
}

.training-header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.training-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.start-screen {
  text-align: center;
}

.settings {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.setting-item label {
  font-weight: 500;
  color: #2c3e50;
}

.setting-item input,
.setting-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.start-btn:hover {
  transform: translateY(-2px);
}

.training-area {
  text-align: center;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-weight: 500;
  color: #2c3e50;
}

.countdown {
  font-size: 48px;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 20px;
}

.cards-container {
  position: relative;
  width: 400px;
  height: 300px;
  margin: 0 auto 20px;
  perspective: 1000px;
  border: 2px dashed #ddd;
  border-radius: 10px;
}

.card-3d {
  position: absolute;
  width: 60px;
  height: 80px;
  transform-style: preserve-3d;
  transition: transform 0.5s;
  cursor: pointer;
}

.card-3d.square {
  border-radius: 5px;
}

.card-3d.circle {
  border-radius: 50%;
}

.card-3d.triangle {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.card-face.back {
  transform: rotateY(180deg);
  background: #34495e;
}

.options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

.option-btn {
  background: #ecf0f1;
  border: 2px solid #bdc3c7;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.option-btn:hover {
  background: #d5dbdb;
}

.option-btn.selected {
  background: #3498db;
  color: white;
  border-color: #2980b9;
}

.submit-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #219a52;
}

.submit-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.result-message {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
}

.result-message.correct {
  color: #27ae60;
}

.result-message.incorrect {
  color: #e74c3c;
}

.correct-info {
  margin-bottom: 20px;
  color: #7f8c8d;
}

.next-btn,
.restart-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.next-btn:hover,
.restart-btn:hover {
  background: #2980b9;
}

.final-score {
  margin: 20px 0;
}

.final-score p {
  font-size: 18px;
  margin: 10px 0;
}

.training-stats {
  margin-top: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.training-stats h3 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 5px;
}

.stat-label {
  color: #7f8c8d;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
}
</style>