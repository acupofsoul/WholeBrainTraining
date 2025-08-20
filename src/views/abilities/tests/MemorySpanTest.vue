<template>
  <div class="memory-span-test">
    <div class="test-content">
      <div class="test-header">
        <h3>工作记忆测试</h3>
        <div class="test-info">
          <span class="current-span">当前长度: {{ currentSpan }}</span>
          <span class="trial-counter">第 {{ currentTrial + 1 }} / {{ totalTrials }} 轮</span>
        </div>
      </div>

      <!-- 准备阶段 -->
      <div v-if="phase === 'ready'" class="ready-phase">
        <div class="instructions">
          <h4>测试说明</h4>
          <p>您将看到一系列数字按顺序出现，请记住它们的顺序。</p>
          <p>数字消失后，请按照相同的顺序点击数字。</p>
          <p>测试将从 {{ startSpan }} 位数字开始，逐渐增加难度。</p>
        </div>
        <button class="btn-primary" @click="startTest">开始测试</button>
      </div>

      <!-- 展示阶段 -->
      <div v-if="phase === 'display'" class="display-phase">
        <div class="sequence-container">
          <div class="instruction-text">请记住数字出现的顺序</div>
          <div class="number-grid">
            <div v-for="(number, index) in displayNumbers" 
                 :key="index"
                 class="number-cell"
                 :class="{ 
                   active: index === currentDisplayIndex,
                   shown: index < currentDisplayIndex 
                 }">
              {{ number }}
            </div>
          </div>
          <div class="progress-indicator">
            <div class="progress-bar">
              <div class="progress-fill" 
                   :style="{ width: (currentDisplayIndex / displayNumbers.length) * 100 + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 回忆阶段 -->
      <div v-if="phase === 'recall'" class="recall-phase">
        <div class="recall-container">
          <div class="instruction-text">请按照刚才看到的顺序点击数字</div>
          <div class="number-grid">
            <button v-for="number in shuffledNumbers" 
                    :key="number"
                    class="number-button"
                    :class="{ 
                      selected: selectedSequence.includes(number),
                      correct: isCorrectPosition(number),
                      incorrect: isIncorrectPosition(number)
                    }"
                    @click="selectNumber(number)"
                    :disabled="showFeedback">
              {{ number }}
            </button>
          </div>
          <div class="selected-sequence">
            <div class="sequence-label">您的选择:</div>
            <div class="sequence-display">
              <span v-for="(number, index) in selectedSequence" 
                    :key="index"
                    class="selected-number"
                    :class="{ 
                      correct: number === originalSequence[index],
                      incorrect: number !== originalSequence[index]
                    }">
                {{ number }}
              </span>
              <span v-if="selectedSequence.length < currentSpan" class="placeholder">_</span>
            </div>
          </div>
          <div class="recall-actions">
            <button class="btn-secondary" @click="clearSelection" :disabled="showFeedback">清除</button>
            <button class="btn-primary" 
                    @click="submitAnswer" 
                    :disabled="selectedSequence.length !== currentSpan || showFeedback">
              确认
            </button>
          </div>
        </div>
      </div>

      <!-- 反馈阶段 -->
      <div v-if="phase === 'feedback'" class="feedback-phase">
        <div class="feedback-container">
          <div class="feedback-result" :class="{ correct: lastTrialCorrect, incorrect: !lastTrialCorrect }">
            <div class="result-icon">
              {{ lastTrialCorrect ? '✓' : '✗' }}
            </div>
            <div class="result-text">
              {{ lastTrialCorrect ? '正确！' : '错误！' }}
            </div>
          </div>
          <div class="sequence-comparison">
            <div class="comparison-row">
              <span class="label">正确顺序:</span>
              <div class="sequence">
                <span v-for="number in originalSequence" :key="number" class="number correct">
                  {{ number }}
                </span>
              </div>
            </div>
            <div class="comparison-row">
              <span class="label">您的回答:</span>
              <div class="sequence">
                <span v-for="(number, index) in selectedSequence" 
                      :key="index" 
                      class="number"
                      :class="{ 
                        correct: number === originalSequence[index],
                        incorrect: number !== originalSequence[index]
                      }">
                  {{ number }}
                </span>
              </div>
            </div>
          </div>
          <button class="btn-primary" @click="nextTrial">{{ isTestComplete ? '查看结果' : '下一轮' }}</button>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="phase === 'results'" class="results-phase">
        <div class="results-container">
          <h3>工作记忆测试完成</h3>
          <div class="final-stats">
            <div class="stat-card">
              <div class="stat-value">{{ maxSpanReached }}</div>
              <div class="stat-label">最大记忆长度</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ accuracy }}%</div>
              <div class="stat-label">总体准确率</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ finalScore }}</div>
              <div class="stat-label">记忆得分</div>
            </div>
          </div>
          <div class="performance-chart">
            <h4>表现趋势</h4>
            <div class="chart-container">
              <div v-for="(result, index) in trialResults" 
                   :key="index"
                   class="chart-bar"
                   :style="{ height: (result.span / maxSpanReached) * 100 + '%' }"
                   :class="{ correct: result.correct, incorrect: !result.correct }">
                <div class="bar-label">{{ result.span }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  testData: {
    type: Object,
    required: true
  },
  settings: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['answer-submitted', 'test-completed']);

// 测试状态
const phase = ref('ready');
const currentSpan = ref(4);
const currentTrial = ref(0);
const totalTrials = ref(12);
const startSpan = ref(4);
const maxSpan = ref(12);

// 当前试验数据
const originalSequence = ref([]);
const displayNumbers = ref([]);
const shuffledNumbers = ref([]);
const selectedSequence = ref([]);
const currentDisplayIndex = ref(0);
const showFeedback = ref(false);
const lastTrialCorrect = ref(false);

// 测试结果
const trialResults = ref([]);
const consecutiveCorrect = ref(0);
const consecutiveIncorrect = ref(0);
const startTime = ref(0);

// 计算属性
const maxSpanReached = computed(() => {
  const correctTrials = trialResults.value.filter(t => t.correct);
  return correctTrials.length > 0 ? Math.max(...correctTrials.map(t => t.span)) : startSpan.value;
});

const accuracy = computed(() => {
  if (trialResults.value.length === 0) return 0;
  const correct = trialResults.value.filter(t => t.correct).length;
  return Math.round((correct / trialResults.value.length) * 100);
});

const finalScore = computed(() => {
  const spanScore = (maxSpanReached.value - startSpan.value + 1) * 10;
  const accuracyBonus = Math.floor(accuracy.value / 10) * 5;
  return Math.min(100, spanScore + accuracyBonus);
});

const isTestComplete = computed(() => {
  return consecutiveIncorrect.value >= 2 || currentSpan.value > maxSpan.value || currentTrial.value >= totalTrials.value;
});

// 方法
const startTest = () => {
  phase.value = 'display';
  startTime.value = Date.now();
  generateSequence();
  displaySequence();
};

const generateSequence = () => {
  const numbers = [];
  const availableNumbers = Array.from({ length: 9 }, (_, i) => i + 1);
  
  for (let i = 0; i < currentSpan.value; i++) {
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    numbers.push(availableNumbers.splice(randomIndex, 1)[0]);
  }
  
  originalSequence.value = numbers;
  displayNumbers.value = [...numbers];
  shuffledNumbers.value = [...numbers].sort(() => Math.random() - 0.5);
};

const displaySequence = () => {
  currentDisplayIndex.value = 0;
  const interval = setInterval(() => {
    currentDisplayIndex.value++;
    if (currentDisplayIndex.value >= displayNumbers.value.length) {
      clearInterval(interval);
      setTimeout(() => {
        phase.value = 'recall';
        selectedSequence.value = [];
        showFeedback.value = false;
      }, 500);
    }
  }, 1000);
};

const selectNumber = (number) => {
  if (selectedSequence.value.length < currentSpan.value && !selectedSequence.value.includes(number)) {
    selectedSequence.value.push(number);
  }
};

const clearSelection = () => {
  selectedSequence.value = [];
};

const submitAnswer = () => {
  showFeedback.value = true;
  const isCorrect = JSON.stringify(selectedSequence.value) === JSON.stringify(originalSequence.value);
  lastTrialCorrect.value = isCorrect;
  
  // 记录结果
  const trialTime = Date.now() - startTime.value;
  trialResults.value.push({
    span: currentSpan.value,
    correct: isCorrect,
    timeSpent: trialTime,
    userSequence: [...selectedSequence.value],
    correctSequence: [...originalSequence.value]
  });
  
  emit('answer-submitted', {
    span: currentSpan.value,
    correct: isCorrect,
    timeSpent: trialTime
  });
  
  // 更新连续正确/错误计数
  if (isCorrect) {
    consecutiveCorrect.value++;
    consecutiveIncorrect.value = 0;
  } else {
    consecutiveIncorrect.value++;
    consecutiveCorrect.value = 0;
  }
  
  setTimeout(() => {
    phase.value = 'feedback';
  }, 1000);
};

const nextTrial = () => {
  currentTrial.value++;
  
  if (isTestComplete.value) {
    completeTest();
    return;
  }
  
  // 自适应难度调整
  if (consecutiveCorrect.value >= 2) {
    currentSpan.value++;
    consecutiveCorrect.value = 0;
  } else if (consecutiveIncorrect.value >= 2) {
    currentSpan.value = Math.max(startSpan.value, currentSpan.value - 1);
    consecutiveIncorrect.value = 0;
  }
  
  phase.value = 'display';
  generateSequence();
  displaySequence();
  startTime.value = Date.now();
};

const completeTest = () => {
  phase.value = 'results';
  
  const result = {
    score: finalScore.value,
    accuracy: accuracy.value,
    maxSpan: maxSpanReached.value,
    timeUsed: Math.round((Date.now() - startTime.value) / 1000),
    difficulty: props.settings.difficulty,
    trials: trialResults.value,
    feedback: generateFeedback()
  };
  
  setTimeout(() => {
    emit('test-completed', result);
  }, 3000);
};

const generateFeedback = () => {
  const maxSpan = maxSpanReached.value;
  if (maxSpan >= 8) {
    return '优秀！您的工作记忆能力非常强，能够同时处理大量信息。';
  } else if (maxSpan >= 6) {
    return '良好！您的工作记忆能力较强，在大多数任务中表现良好。';
  } else if (maxSpan >= 5) {
    return '一般！您的工作记忆能力处于平均水平，建议多做记忆训练。';
  } else {
    return '需要改进！建议加强工作记忆训练，提高信息处理能力。';
  }
};

const isCorrectPosition = (number) => {
  if (!showFeedback.value) return false;
  const index = selectedSequence.value.indexOf(number);
  return index !== -1 && originalSequence.value[index] === number;
};

const isIncorrectPosition = (number) => {
  if (!showFeedback.value) return false;
  const index = selectedSequence.value.indexOf(number);
  return index !== -1 && originalSequence.value[index] !== number;
};

// 初始化
onMounted(() => {
  const difficulty = props.settings.difficulty;
  const config = {
    easy: { start: 3, max: 8, trials: 10 },
    medium: { start: 4, max: 10, trials: 12 },
    hard: { start: 5, max: 12, trials: 15 },
    expert: { start: 6, max: 15, trials: 18 }
  };
  
  const difficultyConfig = config[difficulty] || config.medium;
  startSpan.value = difficultyConfig.start;
  currentSpan.value = difficultyConfig.start;
  maxSpan.value = difficultyConfig.max;
  totalTrials.value = difficultyConfig.trials;
});
</script>

<style scoped>
.memory-span-test {
  max-width: 800px;
  margin: 0 auto;
}

.test-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.test-header h3 {
  color: var(--color-primary);
  margin: 0;
}

.test-info {
  display: flex;
  gap: 1rem;
}

.current-span, .trial-counter {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  color: #666;
  font-size: 0.9rem;
}

/* 准备阶段 */
.ready-phase {
  text-align: center;
  padding: 2rem;
}

.instructions {
  margin-bottom: 2rem;
}

.instructions h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.instructions p {
  margin-bottom: 0.5rem;
  line-height: 1.6;
  color: #666;
}

/* 展示阶段 */
.display-phase {
  text-align: center;
  padding: 2rem;
}

.instruction-text {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: #333;
}

.number-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.number-cell {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 2rem;
  font-weight: bold;
  color: #ccc;
  transition: all 0.3s ease;
}

.number-cell.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  transform: scale(1.1);
}

.number-cell.shown {
  color: #666;
}

.progress-indicator {
  margin-top: 2rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

/* 回忆阶段 */
.recall-phase {
  padding: 2rem;
}

.recall-container {
  text-align: center;
}

.number-button {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.number-button:hover {
  border-color: var(--color-primary);
  background: #f8f9ff;
}

.number-button.selected {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.number-button.correct {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.number-button.incorrect {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
}

.selected-sequence {
  margin: 2rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.sequence-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #666;
}

.sequence-display {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.selected-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-weight: bold;
}

.selected-number.correct {
  border-color: #28a745;
  color: #28a745;
}

.selected-number.incorrect {
  border-color: #dc3545;
  color: #dc3545;
}

.placeholder {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc;
  border-radius: 8px;
  color: #ccc;
  font-size: 1.5rem;
}

.recall-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

/* 反馈阶段 */
.feedback-phase {
  padding: 2rem;
  text-align: center;
}

.feedback-result {
  margin-bottom: 2rem;
}

.result-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.feedback-result.correct .result-icon {
  color: #28a745;
}

.feedback-result.incorrect .result-icon {
  color: #dc3545;
}

.result-text {
  font-size: 1.5rem;
  font-weight: bold;
}

.feedback-result.correct .result-text {
  color: #28a745;
}

.feedback-result.incorrect .result-text {
  color: #dc3545;
}

.sequence-comparison {
  margin: 2rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.comparison-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.comparison-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: bold;
  min-width: 100px;
  text-align: right;
}

.sequence {
  display: flex;
  gap: 0.5rem;
}

.sequence .number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: bold;
}

.sequence .number.correct {
  background: #d4edda;
  color: #155724;
}

.sequence .number.incorrect {
  background: #f8d7da;
  color: #721c24;
}

/* 结果阶段 */
.results-phase {
  padding: 2rem;
  text-align: center;
}

.results-container h3 {
  color: var(--color-primary);
  margin-bottom: 2rem;
}

.final-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 2rem 0;
}

.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--color-primary);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.performance-chart {
  margin-top: 2rem;
}

.performance-chart h4 {
  margin-bottom: 1rem;
  color: #333;
}

.chart-container {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 0.5rem;
  height: 200px;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.chart-bar {
  width: 30px;
  background: #ddd;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all 0.3s ease;
  min-height: 20px;
}

.chart-bar.correct {
  background: #28a745;
}

.chart-bar.incorrect {
  background: #dc3545;
}

.bar-label {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  font-weight: bold;
  color: #666;
}

/* 按钮样式 */
.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-secondary:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>