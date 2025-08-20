<template>
  <div class="color-perception">
    <div class="training-header">
      <h2>色彩感知训练</h2>
      <p>快速识别和记忆不同的颜色组合</p>
    </div>

    <div class="training-content">
      <div v-if="!isTraining" class="start-screen">
        <div class="settings">
          <div class="setting-item">
            <label>难度等级：</label>
            <select v-model="settings.difficulty">
              <option value="easy">简单（4色）</option>
              <option value="medium">中等（6色）</option>
              <option value="hard">困难（8色）</option>
            </select>
          </div>
          <div class="setting-item">
            <label>显示时间（毫秒）：</label>
            <input v-model.number="settings.displayTime" type="number" min="500" max="3000" step="100" />
          </div>
          <div class="setting-item">
            <label>训练轮数：</label>
            <input v-model.number="settings.rounds" type="number" min="5" max="20" />
          </div>
        </div>
        <button @click="startTraining" class="start-btn">开始训练</button>
      </div>

      <div v-else class="training-area">
        <div class="progress-info">
          <span>第 {{ currentRound }} / {{ settings.rounds }} 轮</span>
          <span>得分: {{ score }}</span>
        </div>

        <div v-if="phase === 'display'" class="display-phase">
          <div class="countdown">{{ countdown }}</div>
          <div class="color-grid">
            <div 
              v-for="(color, index) in currentColors" 
              :key="index"
              class="color-cell"
              :style="{ backgroundColor: color }"
            ></div>
          </div>
          <p>请记住这些颜色的位置</p>
        </div>

        <div v-else-if="phase === 'recall'" class="recall-phase">
          <div class="question">
            <p>请选择第 {{ targetPosition + 1 }} 个位置的颜色：</p>
            <div class="color-options">
              <div 
                v-for="(color, index) in colorOptions" 
                :key="index"
                class="color-option"
                :class="{ selected: selectedColor === color }"
                :style="{ backgroundColor: color }"
                @click="selectColor(color)"
              ></div>
            </div>
            <button @click="submitAnswer" :disabled="!selectedColor" class="submit-btn">确认</button>
          </div>
        </div>

        <div v-else-if="phase === 'result'" class="result-phase">
          <div class="result-message" :class="{ correct: lastAnswerCorrect, incorrect: !lastAnswerCorrect }">
            {{ lastAnswerCorrect ? '正确！' : '错误！' }}
          </div>
          <div class="correct-answer">
            正确答案是：
            <div class="color-sample" :style="{ backgroundColor: correctAnswer }"></div>
          </div>
          <button @click="nextRound" class="next-btn">下一轮</button>
        </div>

        <div v-else-if="phase === 'complete'" class="complete-phase">
          <h3>训练完成！</h3>
          <div class="final-score">
            <p>最终得分: {{ score }} / {{ settings.rounds }}</p>
            <p>正确率: {{ Math.round((score / settings.rounds) * 100) }}%</p>
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
          <span class="stat-label">最高得分：</span>
          <span class="stat-value">{{ stats.bestScore }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';

// 训练状态
const isTraining = ref(false);
const phase = ref('display'); // 'display' | 'recall' | 'result' | 'complete'
const currentRound = ref(1);
const score = ref(0);
const countdown = ref(3);

// 训练设置
const settings = reactive({
  difficulty: 'medium',
  displayTime: 1500,
  rounds: 10
});

// 当前训练数据
const currentColors = ref([]);
const targetPosition = ref(0);
const colorOptions = ref([]);
const selectedColor = ref('');
const correctAnswer = ref('');
const lastAnswerCorrect = ref(false);

// 训练统计
const stats = reactive({
  totalSessions: 0,
  averageAccuracy: 0,
  bestScore: 0,
  totalCorrect: 0,
  totalQuestions: 0
});

// 颜色库
const colorPalette = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
];

// 难度配置
const difficultyConfig = {
  easy: { gridSize: 4, colors: 4 },
  medium: { gridSize: 6, colors: 6 },
  hard: { gridSize: 8, colors: 8 }
};

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
  phase.value = 'display';
  countdown.value = 3;
  generateColors();
  
  // 倒计时
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      showColors();
    }
  }, 1000);
};

// 生成颜色
const generateColors = () => {
  const config = difficultyConfig[settings.difficulty];
  const shuffled = [...colorPalette].sort(() => Math.random() - 0.5);
  currentColors.value = shuffled.slice(0, config.colors);
  targetPosition.value = Math.floor(Math.random() * config.colors);
  correctAnswer.value = currentColors.value[targetPosition.value];
};

// 显示颜色
const showColors = () => {
  setTimeout(() => {
    phase.value = 'recall';
    generateOptions();
  }, settings.displayTime);
};

// 生成选项
const generateOptions = () => {
  const options = [correctAnswer.value];
  const otherColors = colorPalette.filter(color => color !== correctAnswer.value);
  
  while (options.length < 4) {
    const randomColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    if (!options.includes(randomColor)) {
      options.push(randomColor);
    }
  }
  
  colorOptions.value = options.sort(() => Math.random() - 0.5);
  selectedColor.value = '';
};

// 选择颜色
const selectColor = (color) => {
  selectedColor.value = color;
};

// 提交答案
const submitAnswer = () => {
  lastAnswerCorrect.value = selectedColor.value === correctAnswer.value;
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
  
  // 更新统计
  stats.totalSessions++;
  stats.totalCorrect += score.value;
  stats.totalQuestions += settings.rounds;
  stats.averageAccuracy = (stats.totalCorrect / stats.totalQuestions) * 100;
  stats.bestScore = Math.max(stats.bestScore, score.value);
  
  saveStats();
};

// 重置训练
const resetTraining = () => {
  isTraining.value = false;
  phase.value = 'display';
};

// 保存统计数据
const saveStats = () => {
  localStorage.setItem('color-perception-stats', JSON.stringify(stats));
};

// 加载统计数据
const loadStats = () => {
  const saved = localStorage.getItem('color-perception-stats');
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
.color-perception {
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

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 10px;
  max-width: 400px;
  margin: 0 auto 20px;
}

.color-cell {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  border: 2px solid #ddd;
}

.color-options {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;
}

.color-option {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  border: 3px solid #ddd;
  cursor: pointer;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #3498db;
  transform: scale(1.1);
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

.correct-answer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.color-sample {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  border: 2px solid #ddd;
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