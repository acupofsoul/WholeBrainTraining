<template>
  <div class="processing-speed-test">
    <div class="test-content">
      <div class="test-header">
        <h3>处理速度测试</h3>
        <div class="test-info">
          <span class="timer" :class="{ warning: timeRemaining < 30 }">
            剩余时间: {{ formatTime(timeRemaining) }}
          </span>
          <span class="progress-counter">完成: {{ completedItems }} / {{ totalItems }}</span>
        </div>
      </div>

      <!-- 准备阶段 -->
      <div v-if="phase === 'ready'" class="ready-phase">
        <div class="instructions">
          <h4>测试说明</h4>
          <p>您将看到一系列符号匹配任务，请尽快找出相同的符号。</p>
          <p>每个任务都有一个目标符号和多个选项，请点击与目标相同的符号。</p>
          <p>测试时间为 {{ testDuration }} 秒，请尽可能快速且准确地完成。</p>
        </div>
        <div class="demo-section">
          <h5>示例：</h5>
          <div class="demo-task">
            <div class="demo-target">
              <span class="demo-label">目标符号：</span>
              <span class="symbol">★</span>
            </div>
            <div class="demo-options">
              <span class="demo-label">选择相同的：</span>
              <div class="symbol-options">
                <button class="symbol-option">☆</button>
                <button class="symbol-option correct">★</button>
                <button class="symbol-option">✦</button>
                <button class="symbol-option">✧</button>
              </div>
            </div>
          </div>
        </div>
        <button class="btn-primary" @click="startTest">开始测试</button>
      </div>

      <!-- 测试阶段 -->
      <div v-if="phase === 'testing'" class="testing-phase">
        <div v-if="currentTask" class="task-container">
          <div class="target-section">
            <div class="target-label">目标符号：</div>
            <div class="target-symbol">{{ currentTask.target }}</div>
          </div>
          
          <div class="options-section">
            <div class="options-label">找出相同的符号：</div>
            <div class="symbol-grid">
              <button v-for="(option, index) in currentTask.options" 
                      :key="index"
                      class="symbol-option"
                      :class="{ 
                        selected: selectedOption === index,
                        correct: showFeedback && index === currentTask.correctIndex,
                        incorrect: showFeedback && selectedOption === index && index !== currentTask.correctIndex
                      }"
                      @click="selectOption(index)"
                      :disabled="showFeedback">
                {{ option }}
              </button>
            </div>
          </div>
          
          <div class="task-feedback" v-if="showFeedback">
            <div class="feedback-message" :class="{ correct: lastAnswerCorrect, incorrect: !lastAnswerCorrect }">
              {{ lastAnswerCorrect ? '正确！' : '错误！' }}
            </div>
          </div>
        </div>
        
        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="speed-indicator">
            <span class="speed-label">当前速度：</span>
            <span class="speed-value">{{ currentSpeed }} 项/分钟</span>
          </div>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="phase === 'results'" class="results-phase">
        <div class="results-container">
          <h3>处理速度测试完成</h3>
          <div class="final-stats">
            <div class="stat-card">
              <div class="stat-value">{{ completedItems }}</div>
              <div class="stat-label">完成项目</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ accuracy }}%</div>
              <div class="stat-label">准确率</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ averageSpeed }}</div>
              <div class="stat-label">平均速度(项/分钟)</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ finalScore }}</div>
              <div class="stat-label">处理得分</div>
            </div>
          </div>
          
          <div class="performance-analysis">
            <h4>表现分析</h4>
            <div class="analysis-chart">
              <div class="speed-trend">
                <h5>速度趋势</h5>
                <div class="trend-chart">
                  <div v-for="(segment, index) in speedSegments" 
                       :key="index"
                       class="trend-bar"
                       :style="{ height: (segment.speed / maxSpeed) * 100 + '%' }">
                    <div class="bar-label">{{ segment.speed }}</div>
                  </div>
                </div>
              </div>
              
              <div class="accuracy-breakdown">
                <h5>准确率分布</h5>
                <div class="accuracy-pie">
                  <div class="pie-segment correct" :style="{ '--percentage': accuracy }"></div>
                  <div class="pie-center">
                    <span class="pie-value">{{ accuracy }}%</span>
                    <span class="pie-label">正确率</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

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
const currentTaskIndex = ref(0);
const selectedOption = ref(null);
const showFeedback = ref(false);
const lastAnswerCorrect = ref(false);

// 时间相关
const testDuration = ref(120); // 2分钟
const timeRemaining = ref(120);
const startTime = ref(0);
const timer = ref(null);

// 测试数据
const tasks = ref([]);
const results = ref([]);
const totalItems = ref(100);

// 符号库
const symbolSets = {
  basic: ['★', '☆', '✦', '✧', '✩', '✪', '✫', '✬', '✭', '✮'],
  geometric: ['●', '○', '◐', '◑', '◒', '◓', '■', '□', '▲', '△'],
  arrows: ['→', '←', '↑', '↓', '↗', '↖', '↘', '↙', '⇒', '⇐'],
  math: ['+', '-', '×', '÷', '=', '≠', '≤', '≥', '∞', '∑'],
  letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
};

// 计算属性
const currentTask = computed(() => {
  return tasks.value[currentTaskIndex.value];
});

const completedItems = computed(() => {
  return results.value.length;
});

const progressPercentage = computed(() => {
  return totalItems.value > 0 ? (completedItems.value / totalItems.value) * 100 : 0;
});

const accuracy = computed(() => {
  if (results.value.length === 0) return 0;
  const correct = results.value.filter(r => r.correct).length;
  return Math.round((correct / results.value.length) * 100);
});

const currentSpeed = computed(() => {
  if (results.value.length === 0) return 0;
  const timeElapsed = (Date.now() - startTime.value) / 1000 / 60; // 分钟
  return Math.round(results.value.length / timeElapsed);
});

const averageSpeed = computed(() => {
  if (results.value.length === 0) return 0;
  const totalTime = testDuration.value / 60; // 分钟
  return Math.round(completedItems.value / totalTime);
});

const finalScore = computed(() => {
  const speedScore = Math.min(50, averageSpeed.value);
  const accuracyScore = accuracy.value / 2;
  return Math.round(speedScore + accuracyScore);
});

const speedSegments = computed(() => {
  const segmentSize = Math.ceil(results.value.length / 10);
  const segments = [];
  
  for (let i = 0; i < results.value.length; i += segmentSize) {
    const segment = results.value.slice(i, i + segmentSize);
    const segmentTime = segment.reduce((sum, r) => sum + r.responseTime, 0) / 1000 / 60;
    const speed = Math.round(segment.length / segmentTime);
    segments.push({ speed, count: segment.length });
  }
  
  return segments;
});

const maxSpeed = computed(() => {
  return speedSegments.value.length > 0 ? Math.max(...speedSegments.value.map(s => s.speed)) : 0;
});

// 方法
const startTest = () => {
  phase.value = 'testing';
  startTime.value = Date.now();
  generateTasks();
  startTimer();
};

const startTimer = () => {
  timer.value = setInterval(() => {
    timeRemaining.value--;
    if (timeRemaining.value <= 0) {
      endTest();
    }
  }, 1000);
};

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

const generateTasks = () => {
  const difficulty = props.settings.difficulty;
  const config = {
    easy: { symbolCount: 4, distractorSimilarity: 0.3 },
    medium: { symbolCount: 6, distractorSimilarity: 0.5 },
    hard: { symbolCount: 8, distractorSimilarity: 0.7 },
    expert: { symbolCount: 10, distractorSimilarity: 0.9 }
  };
  
  const difficultyConfig = config[difficulty] || config.medium;
  tasks.value = [];
  
  for (let i = 0; i < totalItems.value; i++) {
    tasks.value.push(generateTask(difficultyConfig));
  }
};

const generateTask = (config) => {
  // 随机选择符号集
  const symbolSetKeys = Object.keys(symbolSets);
  const selectedSet = symbolSets[symbolSetKeys[Math.floor(Math.random() * symbolSetKeys.length)]];
  
  // 选择目标符号
  const target = selectedSet[Math.floor(Math.random() * selectedSet.length)];
  
  // 生成选项
  const options = [target]; // 确保有正确答案
  
  // 添加干扰项
  while (options.length < config.symbolCount) {
    let distractor;
    if (Math.random() < config.distractorSimilarity) {
      // 相似干扰项（同一符号集）
      distractor = selectedSet[Math.floor(Math.random() * selectedSet.length)];
    } else {
      // 不同符号集的干扰项
      const otherSets = symbolSetKeys.filter(key => symbolSets[key] !== selectedSet);
      const otherSet = symbolSets[otherSets[Math.floor(Math.random() * otherSets.length)]];
      distractor = otherSet[Math.floor(Math.random() * otherSet.length)];
    }
    
    if (!options.includes(distractor)) {
      options.push(distractor);
    }
  }
  
  // 打乱选项顺序
  const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
  const correctIndex = shuffledOptions.indexOf(target);
  
  return {
    target,
    options: shuffledOptions,
    correctIndex
  };
};

const selectOption = (index) => {
  if (showFeedback.value) return;
  
  selectedOption.value = index;
  const responseTime = Date.now() - startTime.value - (results.value.length * 100); // 估算单题开始时间
  const isCorrect = index === currentTask.value.correctIndex;
  
  lastAnswerCorrect.value = isCorrect;
  showFeedback.value = true;
  
  // 记录结果
  results.value.push({
    taskIndex: currentTaskIndex.value,
    selectedOption: index,
    correctOption: currentTask.value.correctIndex,
    correct: isCorrect,
    responseTime,
    target: currentTask.value.target
  });
  
  emit('answer-submitted', {
    taskIndex: currentTaskIndex.value,
    correct: isCorrect,
    responseTime
  });
  
  // 短暂显示反馈后继续下一题
  setTimeout(() => {
    nextTask();
  }, 300);
};

const nextTask = () => {
  currentTaskIndex.value++;
  selectedOption.value = null;
  showFeedback.value = false;
  
  if (currentTaskIndex.value >= tasks.value.length || timeRemaining.value <= 0) {
    endTest();
  }
};

const endTest = () => {
  stopTimer();
  phase.value = 'results';
  
  const result = {
    score: finalScore.value,
    accuracy: accuracy.value,
    speed: averageSpeed.value,
    completedItems: completedItems.value,
    timeUsed: testDuration.value - timeRemaining.value,
    difficulty: props.settings.difficulty,
    results: results.value,
    feedback: generateFeedback()
  };
  
  setTimeout(() => {
    emit('test-completed', result);
  }, 3000);
};

const generateFeedback = () => {
  const speed = averageSpeed.value;
  const acc = accuracy.value;
  
  if (speed >= 40 && acc >= 90) {
    return '优秀！您的处理速度非常快，且准确率很高，信息处理能力出色。';
  } else if (speed >= 30 && acc >= 80) {
    return '良好！您的处理速度较快，准确率也不错，继续保持。';
  } else if (speed >= 20 && acc >= 70) {
    return '一般！您的处理速度和准确率处于平均水平，可以通过练习提高。';
  } else {
    return '需要改进！建议多做反应速度训练，提高信息处理的速度和准确性。';
  }
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 初始化
onMounted(() => {
  const difficulty = props.settings.difficulty;
  const config = {
    easy: { duration: 150, items: 80 },
    medium: { duration: 120, items: 100 },
    hard: { duration: 90, items: 120 },
    expert: { duration: 60, items: 150 }
  };
  
  const difficultyConfig = config[difficulty] || config.medium;
  testDuration.value = difficultyConfig.duration;
  timeRemaining.value = difficultyConfig.duration;
  totalItems.value = difficultyConfig.items;
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped>
.processing-speed-test {
  max-width: 900px;
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

.timer {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  color: var(--color-primary);
}

.timer.warning {
  background: #fff5f5;
  color: #dc3545;
}

.progress-counter {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  color: #666;
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

.demo-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.demo-section h5 {
  margin-bottom: 1rem;
  color: #333;
}

.demo-task {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.demo-target, .demo-options {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.demo-label {
  font-weight: bold;
  color: #666;
}

.symbol {
  font-size: 2rem;
  padding: 0.5rem;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.symbol-options {
  display: flex;
  gap: 0.5rem;
}

.symbol-option {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.symbol-option:hover {
  border-color: var(--color-primary);
  background: #f8f9ff;
}

.symbol-option.correct {
  border-color: #28a745;
  background: #d4edda;
}

/* 测试阶段 */
.testing-phase {
  padding: 2rem;
}

.task-container {
  margin-bottom: 2rem;
}

.target-section {
  text-align: center;
  margin-bottom: 2rem;
}

.target-label {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.target-symbol {
  font-size: 3rem;
  padding: 1rem;
  background: #f8f9fa;
  border: 3px solid var(--color-primary);
  border-radius: 12px;
  display: inline-block;
  min-width: 100px;
}

.options-section {
  text-align: center;
}

.options-label {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.symbol-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.testing-phase .symbol-option {
  width: 80px;
  height: 80px;
  font-size: 2rem;
}

.symbol-option.selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.symbol-option.correct {
  border-color: #28a745;
  background: #28a745;
  color: white;
}

.symbol-option.incorrect {
  border-color: #dc3545;
  background: #dc3545;
  color: white;
}

.task-feedback {
  text-align: center;
  margin-top: 1rem;
}

.feedback-message {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: inline-block;
}

.feedback-message.correct {
  background: #d4edda;
  color: #155724;
}

.feedback-message.incorrect {
  background: #f8d7da;
  color: #721c24;
}

.progress-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid #f0f0f0;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), #4facfe);
  transition: width 0.3s ease;
}

.speed-indicator {
  text-align: center;
}

.speed-label {
  color: #666;
  margin-right: 0.5rem;
}

.speed-value {
  font-weight: bold;
  color: var(--color-primary);
  font-size: 1.1rem;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--color-primary);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.performance-analysis {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.performance-analysis h4 {
  margin-bottom: 1.5rem;
  color: #333;
}

.analysis-chart {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

.speed-trend h5, .accuracy-breakdown h5 {
  margin-bottom: 1rem;
  color: #666;
}

.trend-chart {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 0.5rem;
  height: 150px;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.trend-bar {
  width: 20px;
  background: var(--color-primary);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 10px;
  transition: all 0.3s ease;
}

.bar-label {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: bold;
  color: #666;
}

.accuracy-pie {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: 50%;
  background: conic-gradient(
    #28a745 0deg calc(var(--percentage) * 3.6deg),
    #e0e0e0 calc(var(--percentage) * 3.6deg) 360deg
  );
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pie-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-primary);
}

.pie-label {
  font-size: 0.8rem;
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
  font-size: 1rem;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .final-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .analysis-chart {
    grid-template-columns: 1fr;
  }
  
  .symbol-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>