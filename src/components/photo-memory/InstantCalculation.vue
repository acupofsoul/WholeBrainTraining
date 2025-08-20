<template>
  <div class="instant-calculation">
    <div class="training-header">
      <h2>瞬间计算</h2>
      <p>快速计算数字，提升数学直觉</p>
    </div>

    <div class="training-content">
      <div v-if="!isTraining" class="start-screen">
        <div class="settings">
          <div class="setting-item">
            <label>难度等级：</label>
            <select v-model="settings.difficulty">
              <option value="easy">简单（1-2位数）</option>
              <option value="medium">中等（2-3位数）</option>
              <option value="hard">困难（3-4位数）</option>
            </select>
          </div>
          <div class="setting-item">
            <label>显示时间（毫秒）：</label>
            <input v-model.number="settings.displayTime" type="number" min="500" max="3000" step="100" />
          </div>
          <div class="setting-item">
            <label>题目数量：</label>
            <input v-model.number="settings.questionCount" type="number" min="5" max="20" />
          </div>
        </div>
        <button @click="startTraining" class="start-btn">开始训练</button>
      </div>

      <div v-else class="training-area">
        <div class="progress-info">
          <span>第 {{ currentQuestion }} / {{ settings.questionCount }} 题</span>
          <span>得分: {{ score }}</span>
        </div>

        <div v-if="phase === 'display'" class="display-phase">
          <div class="calculation-display">
            <div class="numbers">
              <span class="number">{{ calculation.num1 }}</span>
              <span class="operator">{{ calculation.operator }}</span>
              <span class="number">{{ calculation.num2 }}</span>
              <span class="equals">=</span>
              <span class="question-mark">?</span>
            </div>
          </div>
          <p>请快速记住这个计算题</p>
        </div>

        <div v-else-if="phase === 'answer'" class="answer-phase">
          <div class="question-reminder">
            <span>{{ calculation.num1 }} {{ calculation.operator }} {{ calculation.num2 }} = ?</span>
          </div>
          <div class="answer-input">
            <input 
              v-model="userAnswer" 
              type="number" 
              placeholder="输入答案"
              @keyup.enter="submitAnswer"
              ref="answerInput"
            />
          </div>
          <button @click="submitAnswer" :disabled="!userAnswer" class="submit-btn">提交答案</button>
        </div>

        <div v-else-if="phase === 'result'" class="result-phase">
          <div class="result-message" :class="{ correct: lastCorrect, incorrect: !lastCorrect }">
            {{ lastCorrect ? '正确！' : '错误！' }}
          </div>
          <div class="answer-info">
            <p>正确答案: {{ calculation.result }}</p>
            <p v-if="!lastCorrect">你的答案: {{ userAnswer }}</p>
            <p>用时: {{ reactionTime }}ms</p>
          </div>
          <button @click="nextQuestion" class="next-btn">下一题</button>
        </div>

        <div v-else-if="phase === 'complete'" class="complete-phase">
          <h3>训练完成！</h3>
          <div class="final-stats">
            <p>最终得分: {{ score }} / {{ settings.questionCount }}</p>
            <p>正确率: {{ Math.round((score / settings.questionCount) * 100) }}%</p>
            <p>平均用时: {{ Math.round(averageTime) }}ms</p>
            <p>计算能力: {{ getCalculationRating() }}</p>
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
          <span class="stat-label">最快速度：</span>
          <span class="stat-value">{{ stats.bestTime }}ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue';

// 训练状态
const isTraining = ref(false);
const phase = ref('display');
const currentQuestion = ref(1);
const score = ref(0);
const userAnswer = ref('');
const lastCorrect = ref(false);
const reactionTime = ref(0);
const startTime = ref(0);
const reactionTimes = ref([]);

// 训练设置
const settings = reactive({
  difficulty: 'medium',
  displayTime: 1500,
  questionCount: 10
});

// 当前计算题
const calculation = reactive({
  num1: 0,
  num2: 0,
  operator: '+',
  result: 0
});

// 训练统计
const stats = reactive({
  totalSessions: 0,
  averageAccuracy: 0,
  bestTime: Infinity,
  totalCorrect: 0,
  totalQuestions: 0,
  totalTime: 0
});

// 引用
const answerInput = ref(null);

// 计算属性
const averageTime = computed(() => {
  if (reactionTimes.value.length === 0) return 0;
  return reactionTimes.value.reduce((a, b) => a + b, 0) / reactionTimes.value.length;
});

// 难度配置
const difficultyConfig = {
  easy: { min: 1, max: 99 },
  medium: { min: 10, max: 999 },
  hard: { min: 100, max: 9999 }
};

// 运算符
const operators = ['+', '-', '×', '÷'];

// 定时器
let displayTimer = null;

// 开始训练
const startTraining = () => {
  isTraining.value = true;
  currentQuestion.value = 1;
  score.value = 0;
  reactionTimes.value = [];
  generateQuestion();
};

// 生成题目
const generateQuestion = () => {
  phase.value = 'display';
  
  const config = difficultyConfig[settings.difficulty];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let num1, num2, result;
  
  switch (operator) {
    case '+':
      num1 = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
      num2 = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
      result = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
      num2 = Math.floor(Math.random() * num1) + 1; // 确保结果为正
      result = num1 - num2;
      break;
    case '×':
      const maxMul = Math.sqrt(config.max);
      num1 = Math.floor(Math.random() * maxMul) + 1;
      num2 = Math.floor(Math.random() * maxMul) + 1;
      result = num1 * num2;
      break;
    case '÷':
      result = Math.floor(Math.random() * 100) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      num1 = result * num2;
      break;
  }
  
  calculation.num1 = num1;
  calculation.num2 = num2;
  calculation.operator = operator;
  calculation.result = result;
  
  // 显示题目一段时间后进入答题阶段
  displayTimer = setTimeout(() => {
    showAnswerPhase();
  }, settings.displayTime);
};

// 显示答题阶段
const showAnswerPhase = () => {
  phase.value = 'answer';
  userAnswer.value = '';
  startTime.value = Date.now();
  
  // 聚焦输入框
  nextTick(() => {
    if (answerInput.value) {
      answerInput.value.focus();
    }
  });
};

// 提交答案
const submitAnswer = () => {
  if (!userAnswer.value) return;
  
  reactionTime.value = Date.now() - startTime.value;
  reactionTimes.value.push(reactionTime.value);
  
  lastCorrect.value = parseInt(userAnswer.value) === calculation.result;
  if (lastCorrect.value) {
    score.value++;
  }
  
  phase.value = 'result';
};

// 下一题
const nextQuestion = () => {
  if (currentQuestion.value < settings.questionCount) {
    currentQuestion.value++;
    generateQuestion();
  } else {
    completeTraining();
  }
};

// 完成训练
const completeTraining = () => {
  phase.value = 'complete';
  
  // 更新统计
  stats.totalSessions++;
  stats.totalCorrect += score.value;
  stats.totalQuestions += settings.questionCount;
  stats.totalTime += reactionTimes.value.reduce((a, b) => a + b, 0);
  stats.averageAccuracy = (stats.totalCorrect / stats.totalQuestions) * 100;
  
  const minTime = Math.min(...reactionTimes.value);
  if (minTime < stats.bestTime) {
    stats.bestTime = minTime;
  }
  
  saveStats();
};

// 获取计算能力评级
const getCalculationRating = () => {
  const accuracy = (score.value / settings.questionCount) * 100;
  const avgTime = averageTime.value;
  
  if (accuracy >= 90 && avgTime < 2000) return '优秀';
  if (accuracy >= 80 && avgTime < 3000) return '良好';
  if (accuracy >= 70 && avgTime < 4000) return '中等';
  if (accuracy >= 60) return '及格';
  return '需要提高';
};

// 重置训练
const resetTraining = () => {
  isTraining.value = false;
  phase.value = 'display';
  if (displayTimer) {
    clearTimeout(displayTimer);
  }
};

// 保存统计数据
const saveStats = () => {
  localStorage.setItem('instant-calculation-stats', JSON.stringify(stats));
};

// 加载统计数据
const loadStats = () => {
  const saved = localStorage.getItem('instant-calculation-stats');
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
.instant-calculation {
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
  margin-bottom: 30px;
  font-weight: 500;
  color: #2c3e50;
}

.calculation-display {
  margin: 40px 0;
}

.numbers {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  font-size: 48px;
  font-weight: bold;
  color: #2c3e50;
}

.operator {
  color: #e74c3c;
}

.equals {
  color: #27ae60;
}

.question-mark {
  color: #f39c12;
}

.question-reminder {
  font-size: 24px;
  font-weight: bold;
  color: #7f8c8d;
  margin-bottom: 30px;
}

.answer-input {
  margin: 30px 0;
}

.answer-input input {
  font-size: 24px;
  padding: 15px 20px;
  border: 2px solid #ddd;
  border-radius: 10px;
  text-align: center;
  width: 200px;
}

.answer-input input:focus {
  outline: none;
  border-color: #3498db;
}

.submit-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 16px;
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
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
}

.result-message.correct {
  color: #27ae60;
}

.result-message.incorrect {
  color: #e74c3c;
}

.answer-info {
  margin: 20px 0;
}

.answer-info p {
  font-size: 18px;
  margin: 10px 0;
  color: #7f8c8d;
}

.next-btn,
.restart-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.next-btn:hover,
.restart-btn:hover {
  background: #2980b9;
}

.final-stats {
  margin: 30px 0;
}

.final-stats p {
  font-size: 18px;
  margin: 15px 0;
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