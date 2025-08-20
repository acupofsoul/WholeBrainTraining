<template>
  <div class="visual-search-test">
    <div class="test-container">
      <!-- 测试说明 -->
      <div v-if="testPhase === 'instruction'" class="instruction-phase">
        <div class="instruction-content">
          <h3>视觉搜索测试</h3>
          <div class="instruction-text">
            <p>在这个测试中，您需要在复杂的视觉场景中快速找到指定的目标物体。</p>
            <div class="instruction-steps">
              <div class="step-item">
                <span class="step-number">1</span>
                <span class="step-text">仔细观察搜索目标</span>
              </div>
              <div class="step-item">
                <span class="step-number">2</span>
                <span class="step-text">在图像中找到所有相同的目标</span>
              </div>
              <div class="step-item">
                <span class="step-number">3</span>
                <span class="step-text">点击找到的目标位置</span>
              </div>
              <div class="step-item">
                <span class="step-number">4</span>
                <span class="step-text">尽可能快速且准确地完成</span>
              </div>
            </div>
          </div>
          <button class="btn-start" @click="startTest">开始测试</button>
        </div>
      </div>

      <!-- 测试进行中 -->
      <div v-if="testPhase === 'testing'" class="testing-phase">
        <div class="test-header">
          <div class="test-info">
            <span class="question-counter">第 {{ currentQuestionIndex + 1 }} / {{ questions.length }} 题</span>
            <span class="timer">{{ formatTime(questionTime) }}</span>
          </div>
          <div class="target-display">
            <span class="target-label">寻找目标:</span>
            <div class="target-item" :style="{ backgroundColor: currentQuestion.target.color }">
              {{ currentQuestion.target.shape }}
            </div>
            <span class="target-count">数量: {{ currentQuestion.targetCount }}</span>
          </div>
        </div>
        
        <div class="search-area">
          <svg 
            :width="searchAreaSize.width" 
            :height="searchAreaSize.height" 
            class="search-canvas"
            @click="handleCanvasClick"
          >
            <!-- 背景 -->
            <rect 
              width="100%" 
              height="100%" 
              fill="#f8f9fa"
            />
            
            <!-- 干扰物 -->
            <g v-for="(item, index) in currentQuestion.distractors" :key="'distractor-' + index">
              <circle 
                v-if="item.shape === '●'"
                :cx="item.x" 
                :cy="item.y" 
                :r="item.size" 
                :fill="item.color"
                class="search-item distractor"
              />
              <rect 
                v-else-if="item.shape === '■'"
                :x="item.x - item.size" 
                :y="item.y - item.size" 
                :width="item.size * 2" 
                :height="item.size * 2" 
                :fill="item.color"
                class="search-item distractor"
              />
              <polygon 
                v-else-if="item.shape === '▲'"
                :points="getTrianglePoints(item.x, item.y, item.size)"
                :fill="item.color"
                class="search-item distractor"
              />
            </g>
            
            <!-- 目标物 -->
            <g v-for="(target, index) in currentQuestion.targets" :key="'target-' + index">
              <circle 
                v-if="target.shape === '●'"
                :cx="target.x" 
                :cy="target.y" 
                :r="target.size" 
                :fill="target.color"
                :class="['search-item', 'target', { found: target.found, clicked: target.clicked }]"
                :data-target-id="index"
              />
              <rect 
                v-else-if="target.shape === '■'"
                :x="target.x - target.size" 
                :y="target.y - target.size" 
                :width="target.size * 2" 
                :height="target.size * 2" 
                :fill="target.color"
                :class="['search-item', 'target', { found: target.found, clicked: target.clicked }]"
                :data-target-id="index"
              />
              <polygon 
                v-else-if="target.shape === '▲'"
                :points="getTrianglePoints(target.x, target.y, target.size)"
                :fill="target.color"
                :class="['search-item', 'target', { found: target.found, clicked: target.clicked }]"
                :data-target-id="index"
              />
            </g>
            
            <!-- 点击标记 -->
            <g v-for="(click, index) in clickMarks" :key="'click-' + index">
              <circle 
                :cx="click.x" 
                :cy="click.y" 
                r="15" 
                fill="none" 
                :stroke="click.correct ? '#28a745' : '#dc3545'" 
                stroke-width="3"
                class="click-mark"
              />
              <text 
                :x="click.x" 
                :y="click.y + 5" 
                text-anchor="middle" 
                :fill="click.correct ? '#28a745' : '#dc3545'"
                font-weight="bold"
                font-size="16"
              >
                {{ click.correct ? '✓' : '✗' }}
              </text>
            </g>
          </svg>
        </div>
        
        <div class="test-controls">
          <div class="progress-info">
            <span>已找到: {{ foundTargets }} / {{ currentQuestion.targetCount }}</span>
            <span>准确率: {{ currentAccuracy }}%</span>
          </div>
          <button 
            class="btn-next" 
            @click="nextQuestion" 
            :disabled="!canProceed"
          >
            {{ isLastQuestion ? '完成测试' : '下一题' }}
          </button>
        </div>
      </div>

      <!-- 结果展示 -->
      <div v-if="testPhase === 'results'" class="results-phase">
        <div class="results-container">
          <h3>视觉搜索测试结果</h3>
          
          <div class="overall-results">
            <div class="result-card">
              <div class="result-icon">🎯</div>
              <div class="result-content">
                <div class="result-value">{{ overallAccuracy }}%</div>
                <div class="result-label">总体准确率</div>
              </div>
            </div>
            
            <div class="result-card">
              <div class="result-icon">⚡</div>
              <div class="result-content">
                <div class="result-value">{{ averageTime }}s</div>
                <div class="result-label">平均用时</div>
              </div>
            </div>
            
            <div class="result-card">
              <div class="result-icon">📊</div>
              <div class="result-content">
                <div class="result-value">{{ finalScore }}</div>
                <div class="result-label">综合得分</div>
              </div>
            </div>
            
            <div class="result-card">
              <div class="result-icon">🔍</div>
              <div class="result-content">
                <div class="result-value">{{ searchEfficiency }}%</div>
                <div class="result-label">搜索效率</div>
              </div>
            </div>
          </div>
          
          <div class="detailed-analysis">
            <h4>详细分析</h4>
            <div class="analysis-grid">
              <div class="analysis-item">
                <h5>难度表现</h5>
                <div class="difficulty-chart">
                  <div v-for="level in difficultyLevels" :key="level" class="difficulty-bar">
                    <span class="difficulty-label">{{ getDifficultyLabel(level) }}</span>
                    <div class="bar-container">
                      <div 
                        class="bar-fill" 
                        :style="{ width: getDifficultyAccuracy(level) + '%' }"
                      ></div>
                    </div>
                    <span class="accuracy-value">{{ getDifficultyAccuracy(level) }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="analysis-item">
                <h5>反应时间趋势</h5>
                <div class="time-trend">
                  <svg width="300" height="150" viewBox="0 0 300 150">
                    <polyline 
                      :points="timePoints" 
                      fill="none" 
                      stroke="#4a90e2" 
                      stroke-width="2"
                    />
                    <circle 
                      v-for="(point, index) in timePointsArray" 
                      :key="index"
                      :cx="point.x" 
                      :cy="point.y" 
                      r="3" 
                      fill="#4a90e2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div class="performance-feedback">
            <h4>表现评价</h4>
            <div class="feedback-content">
              <div class="feedback-item" :class="getPerformanceLevel(overallAccuracy)">
                <div class="feedback-icon">{{ getPerformanceIcon(overallAccuracy) }}</div>
                <div class="feedback-text">
                  <div class="feedback-title">{{ getPerformanceTitle(overallAccuracy) }}</div>
                  <div class="feedback-description">{{ getPerformanceDescription(overallAccuracy) }}</div>
                </div>
              </div>
              
              <div class="improvement-suggestions">
                <h5>改进建议</h5>
                <ul>
                  <li v-for="suggestion in improvementSuggestions" :key="suggestion">
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

// Props
const props = defineProps({
  testData: {
    type: Object,
    required: true
  },
  settings: {
    type: Object,
    default: () => ({})
  }
});

// Emits
const emit = defineEmits(['test-completed', 'answer-submitted']);

// 响应式数据
const testPhase = ref('instruction'); // instruction, testing, results
const currentQuestionIndex = ref(0);
const questions = ref([]);
const answers = ref([]);
const startTime = ref(0);
const questionStartTime = ref(0);
const questionTime = ref(0);
const timer = ref(null);
const clickMarks = ref([]);
const searchAreaSize = ref({ width: 800, height: 600 });

// 计算属性
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);

const foundTargets = computed(() => {
  if (!currentQuestion.value) return 0;
  return currentQuestion.value.targets.filter(target => target.found).length;
});

const currentAccuracy = computed(() => {
  if (!currentQuestion.value) return 0;
  const totalClicks = clickMarks.value.length;
  if (totalClicks === 0) return 100;
  const correctClicks = clickMarks.value.filter(click => click.correct).length;
  return Math.round((correctClicks / totalClicks) * 100);
});

const canProceed = computed(() => {
  return foundTargets.value === currentQuestion.value?.targetCount || questionTime.value >= 60;
});

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === questions.value.length - 1;
});

const overallAccuracy = computed(() => {
  if (answers.value.length === 0) return 0;
  const totalCorrect = answers.value.reduce((sum, answer) => sum + answer.correctClicks, 0);
  const totalClicks = answers.value.reduce((sum, answer) => sum + answer.totalClicks, 0);
  return totalClicks > 0 ? Math.round((totalCorrect / totalClicks) * 100) : 0;
});

const averageTime = computed(() => {
  if (answers.value.length === 0) return 0;
  const totalTime = answers.value.reduce((sum, answer) => sum + answer.responseTime, 0);
  return (totalTime / answers.value.length).toFixed(1);
});

const finalScore = computed(() => {
  const accuracyWeight = 0.6;
  const speedWeight = 0.4;
  const maxTime = 60; // 最大时间60秒
  
  const accuracyScore = overallAccuracy.value;
  const speedScore = Math.max(0, 100 - (parseFloat(averageTime.value) / maxTime) * 100);
  
  return Math.round(accuracyScore * accuracyWeight + speedScore * speedWeight);
});

const searchEfficiency = computed(() => {
  if (answers.value.length === 0) return 0;
  const totalTargets = answers.value.reduce((sum, answer) => sum + answer.targetCount, 0);
  const totalFound = answers.value.reduce((sum, answer) => sum + answer.foundTargets, 0);
  return totalTargets > 0 ? Math.round((totalFound / totalTargets) * 100) : 0;
});

const difficultyLevels = computed(() => {
  return [...new Set(questions.value.map(q => q.difficulty))];
});

const timePoints = computed(() => {
  return answers.value.map((answer, index) => {
    const x = (index / (answers.value.length - 1)) * 280 + 10;
    const y = 140 - (answer.responseTime / 60) * 120;
    return `${x},${y}`;
  }).join(' ');
});

const timePointsArray = computed(() => {
  return answers.value.map((answer, index) => {
    const x = (index / (answers.value.length - 1)) * 280 + 10;
    const y = 140 - (answer.responseTime / 60) * 120;
    return { x, y };
  });
});

const improvementSuggestions = computed(() => {
  const suggestions = [];
  
  if (overallAccuracy.value < 70) {
    suggestions.push('建议放慢速度，提高点击准确性');
  }
  
  if (parseFloat(averageTime.value) > 30) {
    suggestions.push('可以通过练习提高搜索速度');
  }
  
  if (searchEfficiency.value < 80) {
    suggestions.push('注意系统性搜索，避免遗漏目标');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('表现优秀，继续保持！');
  }
  
  return suggestions;
});

// 方法
const startTest = () => {
  testPhase.value = 'testing';
  generateQuestions();
  startQuestionTimer();
  startTime.value = Date.now();
};

const generateQuestions = () => {
  const difficulty = props.testData.difficulty || 'medium';
  const questionCount = getQuestionCount(difficulty);
  
  questions.value = [];
  
  for (let i = 0; i < questionCount; i++) {
    const questionDifficulty = getQuestionDifficulty(i, questionCount, difficulty);
    questions.value.push(generateQuestion(questionDifficulty));
  }
};

const getQuestionCount = (difficulty) => {
  const counts = {
    easy: 8,
    medium: 10,
    hard: 12,
    expert: 15
  };
  return counts[difficulty] || 10;
};

const getQuestionDifficulty = (index, total, baseDifficulty) => {
  const progress = index / total;
  
  if (baseDifficulty === 'easy') {
    return progress < 0.7 ? 'easy' : 'medium';
  } else if (baseDifficulty === 'medium') {
    if (progress < 0.3) return 'easy';
    if (progress < 0.8) return 'medium';
    return 'hard';
  } else if (baseDifficulty === 'hard') {
    if (progress < 0.2) return 'medium';
    if (progress < 0.7) return 'hard';
    return 'expert';
  } else {
    return progress < 0.3 ? 'hard' : 'expert';
  }
};

const generateQuestion = (difficulty) => {
  const configs = {
    easy: { distractorCount: 20, targetCount: 2, shapes: ['●'], colors: ['#ff6b6b', '#4ecdc4'] },
    medium: { distractorCount: 40, targetCount: 3, shapes: ['●', '■'], colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'] },
    hard: { distractorCount: 60, targetCount: 4, shapes: ['●', '■', '▲'], colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'] },
    expert: { distractorCount: 80, targetCount: 5, shapes: ['●', '■', '▲'], colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'] }
  };
  
  const config = configs[difficulty];
  const targetShape = config.shapes[Math.floor(Math.random() * config.shapes.length)];
  const targetColor = config.colors[Math.floor(Math.random() * config.colors.length)];
  
  // 生成目标物
  const targets = [];
  for (let i = 0; i < config.targetCount; i++) {
    targets.push({
      x: Math.random() * (searchAreaSize.value.width - 60) + 30,
      y: Math.random() * (searchAreaSize.value.height - 60) + 30,
      shape: targetShape,
      color: targetColor,
      size: 15,
      found: false,
      clicked: false
    });
  }
  
  // 生成干扰物
  const distractors = [];
  for (let i = 0; i < config.distractorCount; i++) {
    let shape, color;
    do {
      shape = config.shapes[Math.floor(Math.random() * config.shapes.length)];
      color = config.colors[Math.floor(Math.random() * config.colors.length)];
    } while (shape === targetShape && color === targetColor);
    
    distractors.push({
      x: Math.random() * (searchAreaSize.value.width - 60) + 30,
      y: Math.random() * (searchAreaSize.value.height - 60) + 30,
      shape,
      color,
      size: 15
    });
  }
  
  return {
    difficulty,
    target: { shape: targetShape, color: targetColor },
    targetCount: config.targetCount,
    targets,
    distractors
  };
};

const startQuestionTimer = () => {
  questionStartTime.value = Date.now();
  questionTime.value = 0;
  
  timer.value = setInterval(() => {
    questionTime.value = Math.floor((Date.now() - questionStartTime.value) / 1000);
  }, 1000);
};

const handleCanvasClick = (event) => {
  const rect = event.target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // 检查是否点击了目标
  let hitTarget = false;
  currentQuestion.value.targets.forEach((target, index) => {
    const distance = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
    if (distance <= target.size + 10 && !target.found) {
      target.found = true;
      target.clicked = true;
      hitTarget = true;
      
      clickMarks.value.push({
        x,
        y,
        correct: true,
        timestamp: Date.now()
      });
    }
  });
  
  // 如果没有击中目标，记录错误点击
  if (!hitTarget) {
    clickMarks.value.push({
      x,
      y,
      correct: false,
      timestamp: Date.now()
    });
  }
};

const nextQuestion = () => {
  // 记录答案
  const responseTime = (Date.now() - questionStartTime.value) / 1000;
  const correctClicks = clickMarks.value.filter(click => click.correct).length;
  const totalClicks = clickMarks.value.length;
  
  const answer = {
    questionIndex: currentQuestionIndex.value,
    difficulty: currentQuestion.value.difficulty,
    targetCount: currentQuestion.value.targetCount,
    foundTargets: foundTargets.value,
    correctClicks,
    totalClicks,
    responseTime,
    accuracy: totalClicks > 0 ? (correctClicks / totalClicks) * 100 : 0,
    completed: foundTargets.value === currentQuestion.value.targetCount
  };
  
  answers.value.push(answer);
  
  // 发送答案事件
  emit('answer-submitted', {
    type: 'visual-search',
    questionIndex: currentQuestionIndex.value,
    correct: answer.completed,
    responseTime: answer.responseTime,
    score: calculateQuestionScore(answer),
    difficulty: answer.difficulty
  });
  
  // 清理当前题目状态
  clickMarks.value = [];
  
  if (isLastQuestion.value) {
    completeTest();
  } else {
    currentQuestionIndex.value++;
    startQuestionTimer();
  }
};

const calculateQuestionScore = (answer) => {
  const accuracyScore = answer.accuracy;
  const speedBonus = Math.max(0, 100 - answer.responseTime * 2);
  const completionBonus = answer.completed ? 20 : 0;
  
  return Math.min(100, Math.round(accuracyScore * 0.6 + speedBonus * 0.2 + completionBonus * 0.2));
};

const completeTest = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
  
  testPhase.value = 'results';
  
  // 发送测试完成事件
  emit('test-completed', {
    type: 'visual-search',
    overallScore: finalScore.value,
    accuracy: overallAccuracy.value,
    averageTime: parseFloat(averageTime.value),
    searchEfficiency: searchEfficiency.value,
    answers: answers.value,
    totalTime: (Date.now() - startTime.value) / 1000
  });
};

const getTrianglePoints = (x, y, size) => {
  return `${x},${y - size} ${x - size},${y + size} ${x + size},${y + size}`;
};

const getDifficultyLabel = (difficulty) => {
  const labels = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    expert: '专家'
  };
  return labels[difficulty] || difficulty;
};

const getDifficultyAccuracy = (difficulty) => {
  const difficultyAnswers = answers.value.filter(answer => answer.difficulty === difficulty);
  if (difficultyAnswers.length === 0) return 0;
  
  const totalCorrect = difficultyAnswers.reduce((sum, answer) => sum + answer.correctClicks, 0);
  const totalClicks = difficultyAnswers.reduce((sum, answer) => sum + answer.totalClicks, 0);
  
  return totalClicks > 0 ? Math.round((totalCorrect / totalClicks) * 100) : 0;
};

const getPerformanceLevel = (accuracy) => {
  if (accuracy >= 90) return 'excellent';
  if (accuracy >= 80) return 'good';
  if (accuracy >= 70) return 'average';
  return 'needs-improvement';
};

const getPerformanceIcon = (accuracy) => {
  if (accuracy >= 90) return '🌟';
  if (accuracy >= 80) return '👍';
  if (accuracy >= 70) return '👌';
  return '💪';
};

const getPerformanceTitle = (accuracy) => {
  if (accuracy >= 90) return '优秀表现';
  if (accuracy >= 80) return '良好表现';
  if (accuracy >= 70) return '一般表现';
  return '需要改进';
};

const getPerformanceDescription = (accuracy) => {
  if (accuracy >= 90) return '您的视觉搜索能力非常出色，能够快速准确地定位目标。';
  if (accuracy >= 80) return '您的视觉搜索能力良好，在大多数情况下能够有效找到目标。';
  if (accuracy >= 70) return '您的视觉搜索能力一般，还有提升空间。';
  return '建议多进行视觉搜索练习，提高观察和定位能力。';
};

const formatTime = (seconds) => {
  return `${seconds}s`;
};

// 监听测试数据变化
watch(() => props.testData, () => {
  if (testPhase.value === 'instruction') {
    // 重置测试状态
    currentQuestionIndex.value = 0;
    answers.value = [];
    clickMarks.value = [];
  }
}, { deep: true });

// 生命周期
onMounted(() => {
  // 初始化
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<style scoped>
.visual-search-test {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.test-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 说明阶段 */
.instruction-phase {
  padding: 2rem;
  text-align: center;
}

.instruction-content h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.instruction-text {
  max-width: 600px;
  margin: 0 auto 2rem auto;
}

.instruction-text p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.instruction-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.step-number {
  background: var(--color-primary);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-text {
  color: #333;
  font-weight: 500;
}

.btn-start {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-start:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

/* 测试阶段 */
.testing-phase {
  padding: 1.5rem;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.test-info {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.question-counter {
  font-weight: bold;
  color: #333;
}

.timer {
  background: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
}

.target-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.target-label {
  font-weight: 500;
  color: #333;
}

.target-item {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  border: 2px solid #333;
}

.target-count {
  font-weight: bold;
  color: var(--color-primary);
}

.search-area {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.search-canvas {
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: crosshair;
  background: #f8f9fa;
}

.search-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-item:hover {
  opacity: 0.8;
}

.search-item.target.found {
  stroke: #28a745;
  stroke-width: 3;
}

.click-mark {
  animation: clickPulse 0.5s ease-out;
}

@keyframes clickPulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.test-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.progress-info {
  display: flex;
  gap: 2rem;
  color: #666;
  font-weight: 500;
}

.btn-next {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-next:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-next:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 结果阶段 */
.results-phase {
  padding: 2rem;
}

.results-container h3 {
  text-align: center;
  color: var(--color-primary);
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.overall-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.result-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border-left: 4px solid var(--color-primary);
}

.result-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.result-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.3rem;
}

.result-label {
  color: #666;
  font-size: 0.9rem;
}

.detailed-analysis {
  margin-bottom: 2rem;
}

.detailed-analysis h4 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.analysis-item {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
}

.analysis-item h5 {
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
}

.difficulty-chart {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.difficulty-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.difficulty-label {
  min-width: 60px;
  font-size: 0.9rem;
  color: #666;
}

.bar-container {
  flex: 1;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  transition: width 0.8s ease;
}

.accuracy-value {
  min-width: 40px;
  font-weight: bold;
  color: var(--color-primary);
  font-size: 0.9rem;
}

.time-trend {
  display: flex;
  justify-content: center;
}

.performance-feedback {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
}

.performance-feedback h4 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.feedback-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.feedback-item.excellent {
  border-left: 4px solid #28a745;
}

.feedback-item.good {
  border-left: 4px solid #17a2b8;
}

.feedback-item.average {
  border-left: 4px solid #ffc107;
}

.feedback-item.needs-improvement {
  border-left: 4px solid #dc3545;
}

.feedback-icon {
  font-size: 2rem;
}

.feedback-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.feedback-description {
  color: #666;
  line-height: 1.5;
}

.improvement-suggestions h5 {
  color: #333;
  margin-bottom: 1rem;
}

.improvement-suggestions ul {
  list-style: none;
  padding: 0;
}

.improvement-suggestions li {
  padding: 0.5rem 0;
  color: #666;
  line-height: 1.5;
  position: relative;
  padding-left: 1.5rem;
}

.improvement-suggestions li::before {
  content: '💡';
  position: absolute;
  left: 0;
  top: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .test-info {
    gap: 1rem;
  }
  
  .target-display {
    gap: 0.5rem;
  }
  
  .search-canvas {
    width: 100%;
    height: auto;
  }
  
  .test-controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .progress-info {
    gap: 1rem;
  }
  
  .overall-results {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
}

/* 主题变量 */
:root {
  --color-primary: #4a90e2;
  --color-primary-dark: #357abd;
}
</style>