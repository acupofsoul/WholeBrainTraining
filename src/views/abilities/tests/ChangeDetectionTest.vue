<template>
  <div class="change-detection-test">
    <div class="test-container">
      <!-- 测试说明阶段 -->
      <div v-if="testPhase === 'instruction'" class="instruction-phase">
        <div class="instruction-content">
          <h3>变化检测测试</h3>
          <p class="instruction-text">
            这个测试将评估您的变化检测能力。您需要观察两个相似的图像，找出它们之间的差异。
          </p>
          
          <div class="instruction-steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-text">仔细观察左右两幅图像</div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-text">找出图像之间的差异</div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-text">点击差异位置进行标记</div>
            </div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-text">在规定时间内找出所有差异</div>
            </div>
          </div>
          
          <button @click="startTest" class="btn-start">
            开始测试
          </button>
        </div>
      </div>

      <!-- 测试进行阶段 -->
      <div v-else-if="testPhase === 'testing'" class="testing-phase">
        <div class="test-header">
          <div class="test-info">
            <div class="question-counter">
              题目 {{ currentQuestionIndex + 1 }} / {{ questions.length }}
            </div>
            <div class="timer">
              ⏱️ {{ formatTime(questionTime) }}
            </div>
            <div class="found-differences">
              已找到: {{ foundDifferences.length }} / {{ currentQuestion.differences?.length || 0 }}
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>

        <div class="question-container">
          <h4>{{ currentQuestion.question }}</h4>
          
          <div class="images-container">
            <!-- 左侧图像 -->
            <div class="image-panel">
              <h5>图像 A</h5>
              <div class="image-wrapper">
                <svg 
                  width="400" 
                  height="300" 
                  class="comparison-image"
                  @click="handleImageClick($event, 'left')"
                >
                  <component 
                    :is="'g'" 
                    v-html="generateImageSVG(currentQuestion.leftImage)"
                  />
                  <!-- 显示已找到的差异标记 -->
                  <circle 
                    v-for="(diff, index) in foundDifferences"
                    :key="'left-' + index"
                    :cx="diff.x"
                    :cy="diff.y"
                    r="15"
                    fill="none"
                    stroke="#28a745"
                    stroke-width="3"
                    class="difference-marker"
                  />
                </svg>
              </div>
            </div>

            <!-- 右侧图像 -->
            <div class="image-panel">
              <h5>图像 B</h5>
              <div class="image-wrapper">
                <svg 
                  width="400" 
                  height="300" 
                  class="comparison-image"
                  @click="handleImageClick($event, 'right')"
                >
                  <component 
                    :is="'g'" 
                    v-html="generateImageSVG(currentQuestion.rightImage)"
                  />
                  <!-- 显示已找到的差异标记 -->
                  <circle 
                    v-for="(diff, index) in foundDifferences"
                    :key="'right-' + index"
                    :cx="diff.x"
                    :cy="diff.y"
                    r="15"
                    fill="none"
                    stroke="#28a745"
                    stroke-width="3"
                    class="difference-marker"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div class="question-controls">
            <button 
              @click="submitAnswer" 
              :disabled="foundDifferences.length === 0"
              class="btn-submit"
            >
              {{ foundDifferences.length === (currentQuestion.differences?.length || 0) ? '完成' : '提交当前结果' }}
            </button>
            <button 
              @click="skipQuestion" 
              class="btn-skip"
            >
              跳过此题
            </button>
          </div>
        </div>
      </div>

      <!-- 反馈阶段 -->
      <div v-else-if="testPhase === 'feedback'" class="feedback-phase">
        <div class="feedback-container">
          <div class="feedback-header">
            <div class="feedback-icon" :class="getQuestionResult()">
              {{ getQuestionResult() === 'excellent' ? '🏆' : getQuestionResult() === 'good' ? '👍' : '👌' }}
            </div>
            <div class="feedback-text">
              <div class="feedback-title">
                {{ getFeedbackTitle() }}
              </div>
              <div class="feedback-explanation">
                您找到了 {{ foundDifferences.length }} / {{ currentQuestion.differences?.length || 0 }} 个差异
              </div>
            </div>
          </div>
          
          <div class="feedback-details">
            <div class="detail-item">
              <span class="detail-label">找到差异：</span>
              <span class="detail-value">{{ foundDifferences.length }} 个</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">总差异数：</span>
              <span class="detail-value">{{ currentQuestion.differences?.length || 0 }} 个</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">准确率：</span>
              <span class="detail-value">{{ getQuestionAccuracy() }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">用时：</span>
              <span class="detail-value">{{ lastResponseTime }}秒</span>
            </div>
          </div>

          <!-- 显示所有差异位置 -->
          <div class="all-differences">
            <h5>所有差异位置：</h5>
            <div class="differences-grid">
              <div class="difference-item" v-for="(diff, index) in currentQuestion.differences" :key="index">
                <div class="difference-status">
                  {{ foundDifferences.some(found => 
                    Math.abs(found.x - diff.x) < 20 && Math.abs(found.y - diff.y) < 20
                  ) ? '✓' : '✗' }}
                </div>
                <div class="difference-description">{{ diff.description }}</div>
              </div>
            </div>
          </div>
          
          <button @click="continueTesting" class="btn-continue">
            {{ isLastQuestion ? '查看结果' : '下一题' }}
          </button>
        </div>
      </div>

      <!-- 结果展示阶段 -->
      <div v-else-if="testPhase === 'results'" class="results-phase">
        <div class="results-container">
          <h3>变化检测测试结果</h3>
          
          <!-- 总体结果 -->
          <div class="overall-results">
            <div class="result-card">
              <div class="result-icon">🎯</div>
              <div class="result-value">{{ overallAccuracy }}%</div>
              <div class="result-label">总体准确率</div>
            </div>
            <div class="result-card">
              <div class="result-icon">⏱️</div>
              <div class="result-value">{{ averageTime }}</div>
              <div class="result-label">平均用时(秒)</div>
            </div>
            <div class="result-card">
              <div class="result-icon">⭐</div>
              <div class="result-value">{{ finalScore }}</div>
              <div class="result-label">综合得分</div>
            </div>
            <div class="result-card">
              <div class="result-icon">👁️</div>
              <div class="result-value">{{ detectionScore }}</div>
              <div class="result-label">检测能力得分</div>
            </div>
          </div>

          <!-- 详细分析 -->
          <div class="detailed-analysis">
            <h4>详细分析</h4>
            <div class="analysis-grid">
              <!-- 难度表现 -->
              <div class="analysis-item">
                <h5>难度表现</h5>
                <div class="difficulty-chart">
                  <div 
                    v-for="difficulty in ['easy', 'medium', 'hard', 'expert']"
                    :key="difficulty"
                    class="difficulty-bar"
                  >
                    <div class="difficulty-label">{{ getDifficultyLabel(difficulty) }}</div>
                    <div class="bar-container">
                      <div 
                        class="bar-fill"
                        :style="{ width: getDifficultyAccuracy(difficulty) + '%' }"
                      ></div>
                    </div>
                    <div class="accuracy-value">{{ getDifficultyAccuracy(difficulty) }}%</div>
                  </div>
                </div>
              </div>

              <!-- 检测效率 -->
              <div class="analysis-item">
                <h5>检测效率</h5>
                <div class="efficiency-stats">
                  <div class="stat-row">
                    <span class="stat-label">平均检测时间：</span>
                    <span class="stat-value">{{ averageDetectionTime }}秒/个</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">最快检测：</span>
                    <span class="stat-value">{{ fastestDetection }}秒</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">检测成功率：</span>
                    <span class="stat-value">{{ detectionSuccessRate }}%</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">完全正确题目：</span>
                    <span class="stat-value">{{ perfectQuestions }} / {{ answers.length }}</span>
                  </div>
                </div>
              </div>

              <!-- 反应时间分布 -->
              <div class="analysis-item">
                <h5>反应时间分布</h5>
                <div class="time-distribution">
                  <div class="distribution-chart">
                    <div 
                      v-for="(answer, index) in answers"
                      :key="index"
                      class="time-bar"
                      :style="{ height: Math.min(answer.responseTime / 60 * 100, 100) + '%' }"
                      :title="`第${index + 1}题: ${answer.responseTime.toFixed(1)}秒`"
                    ></div>
                  </div>
                  <div class="distribution-labels">
                    <span>题目序号</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 表现评价和改进建议 -->
          <div class="performance-feedback">
            <h4>表现评价</h4>
            <div 
              class="feedback-item"
              :class="getPerformanceLevel(overallAccuracy)"
            >
              <div class="feedback-icon">{{ getPerformanceIcon(overallAccuracy) }}</div>
              <div class="feedback-text">
                <div class="feedback-title">{{ getPerformanceTitle(overallAccuracy) }}</div>
                <div class="feedback-description">{{ getPerformanceDescription(overallAccuracy) }}</div>
              </div>
            </div>
            
            <div class="improvement-suggestions">
              <h5>改进建议</h5>
              <ul>
                <li v-if="overallAccuracy < 70">加强视觉注意力训练，提高对细节变化的敏感度</li>
                <li v-if="averageTime > 45">练习快速扫描技巧，提高检测效率</li>
                <li v-if="detectionSuccessRate < 80">重点训练系统性观察方法，避免遗漏</li>
                <li v-if="perfectQuestions < answers.length / 2">加强耐心和细致度，确保找全所有差异</li>
                <li>定期进行变化检测练习，保持和提升观察能力</li>
              </ul>
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
    default: () => ({
      difficulty: 'medium',
      questionCount: 8,
      timeLimit: 480
    })
  }
});

// Emits
const emit = defineEmits(['test-completed', 'answer-submitted']);

// 响应式数据
const testPhase = ref('instruction'); // instruction, testing, feedback, results
const currentQuestionIndex = ref(0);
const foundDifferences = ref([]);
const answers = ref([]);
const questions = ref([]);
const startTime = ref(null);
const questionStartTime = ref(null);
const questionTime = ref(0);
const timer = ref(null);
const lastResponseTime = ref(0);

// 计算属性
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || {};
});

const progressPercentage = computed(() => {
  return ((currentQuestionIndex.value + 1) / questions.value.length) * 100;
});

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === questions.value.length - 1;
});

const overallAccuracy = computed(() => {
  if (answers.value.length === 0) return 0;
  const totalDifferences = answers.value.reduce((sum, answer) => sum + answer.totalDifferences, 0);
  const foundDifferences = answers.value.reduce((sum, answer) => sum + answer.foundDifferences, 0);
  return totalDifferences > 0 ? Math.round((foundDifferences / totalDifferences) * 100) : 0;
});

const averageTime = computed(() => {
  if (answers.value.length === 0) return 0;
  const totalTime = answers.value.reduce((sum, answer) => sum + answer.responseTime, 0);
  return (totalTime / answers.value.length).toFixed(1);
});

const finalScore = computed(() => {
  const accuracyScore = overallAccuracy.value;
  const speedBonus = Math.max(0, 60 - parseFloat(averageTime.value)) * 1;
  const efficiencyBonus = detectionSuccessRate.value * 0.5;
  return Math.min(100, Math.round(accuracyScore + speedBonus + efficiencyBonus));
});

const detectionScore = computed(() => {
  // 基于准确率和检测效率的综合得分
  const accuracy = overallAccuracy.value;
  const efficiency = detectionSuccessRate.value;
  return Math.round((accuracy * 0.7 + efficiency * 0.3));
});

const averageDetectionTime = computed(() => {
  if (answers.value.length === 0) return 0;
  const totalDetections = answers.value.reduce((sum, answer) => sum + answer.foundDifferences, 0);
  const totalTime = answers.value.reduce((sum, answer) => sum + answer.responseTime, 0);
  return totalDetections > 0 ? (totalTime / totalDetections).toFixed(1) : 0;
});

const fastestDetection = computed(() => {
  if (answers.value.length === 0) return 0;
  const times = answers.value.map(answer => 
    answer.foundDifferences > 0 ? answer.responseTime / answer.foundDifferences : Infinity
  ).filter(time => time !== Infinity);
  return times.length > 0 ? Math.min(...times).toFixed(1) : 0;
});

const detectionSuccessRate = computed(() => {
  if (answers.value.length === 0) return 0;
  const successfulQuestions = answers.value.filter(answer => 
    answer.foundDifferences === answer.totalDifferences
  ).length;
  return Math.round((successfulQuestions / answers.value.length) * 100);
});

const perfectQuestions = computed(() => {
  return answers.value.filter(answer => 
    answer.foundDifferences === answer.totalDifferences
  ).length;
});

// 方法
const startTest = () => {
  testPhase.value = 'testing';
  startTime.value = Date.now();
  generateQuestions();
  startQuestionTimer();
};

const generateQuestions = () => {
  const { difficulty, questionCount } = props.testData;
  questions.value = [];
  
  for (let i = 0; i < questionCount; i++) {
    questions.value.push(generateQuestion(difficulty, i));
  }
};

const generateQuestion = (difficulty, index) => {
  const difficultySettings = {
    easy: { differences: 3, complexity: 2 },
    medium: { differences: 4, complexity: 3 },
    hard: { differences: 5, complexity: 4 },
    expert: { differences: 6, complexity: 5 }
  };
  
  const settings = difficultySettings[difficulty] || difficultySettings.medium;
  const baseElements = generateBaseElements(settings.complexity);
  const differences = generateDifferences(baseElements, settings.differences);
  
  return {
    id: index,
    question: `请找出两幅图像之间的 ${settings.differences} 个差异`,
    leftImage: baseElements,
    rightImage: applyDifferences(baseElements, differences),
    differences: differences,
    difficulty
  };
};

const generateBaseElements = (complexity) => {
  const elements = [];
  const shapes = ['circle', 'square', 'triangle', 'diamond'];
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
  
  for (let i = 0; i < complexity * 3; i++) {
    elements.push({
      id: i,
      type: shapes[Math.floor(Math.random() * shapes.length)],
      x: 50 + Math.random() * 300,
      y: 50 + Math.random() * 200,
      size: 20 + Math.random() * 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360
    });
  }
  
  return elements;
};

const generateDifferences = (baseElements, count) => {
  const differences = [];
  const usedElements = new Set();
  
  for (let i = 0; i < count; i++) {
    let elementIndex;
    do {
      elementIndex = Math.floor(Math.random() * baseElements.length);
    } while (usedElements.has(elementIndex));
    
    usedElements.add(elementIndex);
    const element = baseElements[elementIndex];
    const changeType = Math.random();
    
    let description = '';
    if (changeType < 0.25) {
      description = '颜色变化';
    } else if (changeType < 0.5) {
      description = '大小变化';
    } else if (changeType < 0.75) {
      description = '形状变化';
    } else {
      description = '位置变化';
    }
    
    differences.push({
      elementIndex,
      type: changeType < 0.25 ? 'color' : 
            changeType < 0.5 ? 'size' : 
            changeType < 0.75 ? 'shape' : 'position',
      x: element.x,
      y: element.y,
      description
    });
  }
  
  return differences;
};

const applyDifferences = (baseElements, differences) => {
  const modifiedElements = JSON.parse(JSON.stringify(baseElements));
  const shapes = ['circle', 'square', 'triangle', 'diamond'];
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
  
  differences.forEach(diff => {
    const element = modifiedElements[diff.elementIndex];
    
    switch (diff.type) {
      case 'color':
        do {
          element.color = colors[Math.floor(Math.random() * colors.length)];
        } while (element.color === baseElements[diff.elementIndex].color);
        break;
      case 'size':
        element.size = element.size > 30 ? element.size - 15 : element.size + 15;
        break;
      case 'shape':
        do {
          element.type = shapes[Math.floor(Math.random() * shapes.length)];
        } while (element.type === baseElements[diff.elementIndex].type);
        break;
      case 'position':
        element.x = Math.max(30, Math.min(370, element.x + (Math.random() - 0.5) * 100));
        element.y = Math.max(30, Math.min(270, element.y + (Math.random() - 0.5) * 80));
        diff.x = element.x; // 更新差异位置
        diff.y = element.y;
        break;
    }
  });
  
  return modifiedElements;
};

const generateImageSVG = (elements) => {
  if (!elements || !Array.isArray(elements)) return '';
  
  return elements.map(element => {
    const { type, x, y, size, color, rotation = 0 } = element;
    const transform = rotation ? `transform="rotate(${rotation} ${x} ${y})"` : '';
    
    switch (type) {
      case 'circle':
        return `<circle cx="${x}" cy="${y}" r="${size/2}" fill="${color}" ${transform}/>`;
      case 'square':
        return `<rect x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" fill="${color}" ${transform}/>`;
      case 'triangle':
        const points = getTrianglePoints(x, y, size);
        return `<polygon points="${points}" fill="${color}" ${transform}/>`;
      case 'diamond':
        const diamondPoints = `${x},${y-size/2} ${x+size/2},${y} ${x},${y+size/2} ${x-size/2},${y}`;
        return `<polygon points="${diamondPoints}" fill="${color}" ${transform}/>`;
      default:
        return '';
    }
  }).join('');
};

const getTrianglePoints = (x, y, size) => {
  const height = size * Math.sqrt(3) / 2;
  return `${x},${y - height/2} ${x - size/2},${y + height/2} ${x + size/2},${y + height/2}`;
};

const handleImageClick = (event, side) => {
  const rect = event.target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // 检查是否点击了差异位置
  const tolerance = 25;
  const clickedDifference = currentQuestion.value.differences?.find(diff => 
    Math.abs(diff.x - x) < tolerance && Math.abs(diff.y - y) < tolerance
  );
  
  if (clickedDifference) {
    // 检查是否已经找到过这个差异
    const alreadyFound = foundDifferences.value.some(found => 
      Math.abs(found.x - clickedDifference.x) < tolerance && 
      Math.abs(found.y - clickedDifference.y) < tolerance
    );
    
    if (!alreadyFound) {
      foundDifferences.value.push({
        x: clickedDifference.x,
        y: clickedDifference.y,
        type: clickedDifference.type,
        description: clickedDifference.description
      });
      
      // 如果找到了所有差异，自动提交
      if (foundDifferences.value.length === currentQuestion.value.differences?.length) {
        setTimeout(() => {
          submitAnswer();
        }, 500);
      }
    }
  }
};

const startQuestionTimer = () => {
  questionTime.value = 0;
  questionStartTime.value = Date.now();
  timer.value = setInterval(() => {
    questionTime.value++;
  }, 1000);
};

const submitAnswer = () => {
  clearInterval(timer.value);
  const responseTime = (Date.now() - questionStartTime.value) / 1000;
  lastResponseTime.value = responseTime.toFixed(1);
  
  // 记录答案
  answers.value.push({
    questionIndex: currentQuestionIndex.value,
    foundDifferences: foundDifferences.value.length,
    totalDifferences: currentQuestion.value.differences?.length || 0,
    responseTime,
    difficulty: currentQuestion.value.difficulty,
    differences: [...foundDifferences.value]
  });
  
  emit('answer-submitted', {
    questionIndex: currentQuestionIndex.value,
    foundDifferences: foundDifferences.value.length,
    totalDifferences: currentQuestion.value.differences?.length || 0,
    responseTime
  });
  
  testPhase.value = 'feedback';
};

const skipQuestion = () => {
  submitAnswer();
};

const continueTesting = () => {
  if (isLastQuestion.value) {
    completeTest();
  } else {
    currentQuestionIndex.value++;
    foundDifferences.value = [];
    testPhase.value = 'testing';
    startQuestionTimer();
  }
};

const completeTest = () => {
  testPhase.value = 'results';
  
  emit('test-completed', {
    testType: 'change-detection',
    results: {
      overallAccuracy: overallAccuracy.value,
      averageTime: parseFloat(averageTime.value),
      finalScore: finalScore.value,
      detectionScore: detectionScore.value,
      answers: answers.value,
      totalTime: (Date.now() - startTime.value) / 1000
    }
  });
};

const getQuestionResult = () => {
  const accuracy = getQuestionAccuracy();
  if (accuracy === 100) return 'excellent';
  if (accuracy >= 75) return 'good';
  return 'average';
};

const getQuestionAccuracy = () => {
  const total = currentQuestion.value.differences?.length || 0;
  return total > 0 ? Math.round((foundDifferences.value.length / total) * 100) : 0;
};

const getFeedbackTitle = () => {
  const accuracy = getQuestionAccuracy();
  if (accuracy === 100) return '完美表现！';
  if (accuracy >= 75) return '表现良好！';
  if (accuracy >= 50) return '还不错！';
  return '继续努力！';
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
  const totalDifferences = difficultyAnswers.reduce((sum, answer) => sum + answer.totalDifferences, 0);
  const foundDifferences = difficultyAnswers.reduce((sum, answer) => sum + answer.foundDifferences, 0);
  return totalDifferences > 0 ? Math.round((foundDifferences / totalDifferences) * 100) : 0;
};

const getPerformanceLevel = (accuracy) => {
  if (accuracy >= 90) return 'excellent';
  if (accuracy >= 80) return 'good';
  if (accuracy >= 70) return 'average';
  return 'poor';
};

const getPerformanceIcon = (accuracy) => {
  if (accuracy >= 90) return '🏆';
  if (accuracy >= 80) return '👍';
  if (accuracy >= 70) return '👌';
  return '💪';
};

const getPerformanceTitle = (accuracy) => {
  if (accuracy >= 90) return '优秀表现';
  if (accuracy >= 80) return '良好表现';
  if (accuracy >= 70) return '一般表现';
  return '需要提高';
};

const getPerformanceDescription = (accuracy) => {
  if (accuracy >= 90) return '您的变化检测能力非常出色，能够快速准确地发现图像中的细微差异。';
  if (accuracy >= 80) return '您具有良好的变化检测能力，在大多数情况下能够准确识别差异。';
  if (accuracy >= 70) return '您的变化检测能力处于平均水平，通过练习可以进一步提高。';
  return '建议加强变化检测训练，提高对视觉信息变化的敏感度和观察能力。';
};

// 生命周期
onMounted(() => {
  // 组件挂载时的初始化
});

onUnmounted(() => {
  // 清理定时器
  if (timer.value) {
    clearInterval(timer.value);
  }
});

// 监听测试数据变化
watch(() => props.testData, (newData) => {
  if (newData && testPhase.value === 'instruction') {
    // 重置测试状态
    currentQuestionIndex.value = 0;
    foundDifferences.value = [];
    answers.value = [];
  }
}, { deep: true });
</script>

<style scoped>
.change-detection-test {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.test-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 测试说明阶段 */
.instruction-phase {
  padding: 40px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.instruction-content h3 {
  font-size: 2.5em;
  margin-bottom: 30px;
  font-weight: 300;
}

.instruction-text {
  font-size: 1.2em;
  line-height: 1.6;
  margin-bottom: 40px;
}

.instruction-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.step-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.step-number {
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-weight: bold;
}

.step-text {
  flex: 1;
  text-align: left;
}

.btn-start {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2em;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(238, 90, 36, 0.4);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(238, 90, 36, 0.6);
}

/* 测试进行阶段 */
.testing-phase {
  padding: 30px;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.test-info {
  display: flex;
  gap: 30px;
}

.question-counter {
  font-size: 1.1em;
  font-weight: 600;
  color: #495057;
}

.timer {
  font-size: 1.1em;
  font-weight: 600;
  color: #007bff;
}

.found-differences {
  font-size: 1.1em;
  font-weight: 600;
  color: #28a745;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin-left: 30px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.question-container {
  max-width: 1200px;
  margin: 0 auto;
}

.question-container h4 {
  font-size: 1.4em;
  color: #495057;
  margin-bottom: 30px;
  text-align: center;
}

/* 图像容器 */
.images-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.image-panel {
  text-align: center;
}

.image-panel h5 {
  font-size: 1.2em;
  color: #495057;
  margin-bottom: 15px;
}

.image-wrapper {
  display: flex;
  justify-content: center;
}

.comparison-image {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: crosshair;
  transition: border-color 0.3s ease;
}

.comparison-image:hover {
  border-color: #007bff;
}

.difference-marker {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.question-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn-submit {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1em;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-skip {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1em;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-skip:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* 反馈阶段 */
.feedback-phase {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
}

.feedback-container {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.feedback-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  font-weight: bold;
  color: white;
}

.feedback-icon.excellent {
  background: #28a745;
}

.feedback-icon.good {
  background: #17a2b8;
}

.feedback-icon.average {
  background: #ffc107;
  color: #212529;
}

.feedback-text {
  flex: 1;
}

.feedback-title {
  font-size: 1.3em;
  font-weight: 600;
  margin-bottom: 10px;
}

.feedback-explanation {
  color: #6c757d;
  line-height: 1.5;
}

.feedback-details {
  display: grid;
  gap: 15px;
  margin-bottom: 30px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background: white;
  border-radius: 6px;
}

.detail-label {
  font-weight: 600;
  color: #495057;
}

.detail-value {
  color: #6c757d;
}

.all-differences {
  margin-bottom: 30px;
}

.all-differences h5 {
  font-size: 1.1em;
  color: #495057;
  margin-bottom: 15px;
}

.differences-grid {
  display: grid;
  gap: 10px;
}

.difference-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 15px;
  background: white;
  border-radius: 6px;
}

.difference-status {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.difference-item .difference-status:has-text('✓') {
  background: #28a745;
}

.difference-item .difference-status:has-text('✗') {
  background: #dc3545;
}

.difference-description {
  flex: 1;
  color: #495057;
}

.btn-continue {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1em;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-continue:hover {
  background: #1e7e34;
  transform: translateY(-1px);
}

/* 结果展示阶段 */
.results-phase {
  padding: 40px;
}

.results-container h3 {
  text-align: center;
  font-size: 2.2em;
  color: #495057;
  margin-bottom: 40px;
}

.overall-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.result-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.result-card:hover {
  transform: translateY(-5px);
}

.result-icon {
  font-size: 2.5em;
  margin-bottom: 15px;
}

.result-value {
  font-size: 2em;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 5px;
}

.result-label {
  color: #6c757d;
  font-size: 0.9em;
}

.detailed-analysis {
  margin-bottom: 40px;
}

.detailed-analysis h4 {
  font-size: 1.5em;
  color: #495057;
  margin-bottom: 25px;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.analysis-item {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.analysis-item h5 {
  font-size: 1.2em;
  color: #495057;
  margin-bottom: 20px;
}

.difficulty-chart {
  display: grid;
  gap: 15px;
}

.difficulty-bar {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  align-items: center;
  gap: 15px;
}

.difficulty-label {
  font-size: 0.9em;
  color: #495057;
}

.bar-container {
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.8s ease;
}

.accuracy-value {
  font-size: 0.9em;
  font-weight: 600;
  color: #007bff;
  text-align: right;
}

.efficiency-stats {
  display: grid;
  gap: 15px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9em;
}

.stat-value {
  color: #495057;
  font-weight: 600;
  font-size: 0.9em;
}

.time-distribution {
  text-align: center;
}

.distribution-chart {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 5px;
  height: 120px;
  margin-bottom: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.time-bar {
  width: 20px;
  background: linear-gradient(to top, #007bff, #0056b3);
  border-radius: 2px 2px 0 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-bar:hover {
  background: linear-gradient(to top, #0056b3, #004085);
  transform: scaleY(1.1);
}

.distribution-labels {
  font-size: 0.9em;
  color: #6c757d;
}

.performance-feedback {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.performance-feedback h4 {
  font-size: 1.5em;
  color: #495057;
  margin-bottom: 25px;
}

.feedback-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 25px;
  padding: 20px;
  border-radius: 8px;
}

.feedback-item.excellent {
  background: #d4edda;
  border-left: 4px solid #28a745;
}

.feedback-item.good {
  background: #d1ecf1;
  border-left: 4px solid #17a2b8;
}

.feedback-item.average {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.feedback-item.poor {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
}

.feedback-item .feedback-icon {
  font-size: 2em;
  width: auto;
  height: auto;
  background: none;
  color: inherit;
}

.feedback-item .feedback-text {
  flex: 1;
}

.feedback-item .feedback-title {
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 8px;
}

.feedback-item .feedback-description {
  line-height: 1.6;
  color: #495057;
}

.improvement-suggestions h5 {
  font-size: 1.1em;
  color: #495057;
  margin-bottom: 15px;
}

.improvement-suggestions ul {
  list-style: none;
  padding: 0;
}

.improvement-suggestions li {
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
  position: relative;
  padding-left: 25px;
}

.improvement-suggestions li:before {
  content: '💡';
  position: absolute;
  left: 0;
  top: 10px;
}

.improvement-suggestions li:last-child {
  border-bottom: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .change-detection-test {
    padding: 10px;
  }
  
  .instruction-phase {
    padding: 20px;
  }
  
  .instruction-content h3 {
    font-size: 2em;
  }
  
  .instruction-steps {
    grid-template-columns: 1fr;
  }
  
  .testing-phase {
    padding: 15px;
  }
  
  .test-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .progress-bar {
    margin-left: 0;
    margin-top: 15px;
  }
  
  .images-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .comparison-image {
    width: 100%;
    max-width: 350px;
    height: 250px;
  }
  
  .question-controls {
    flex-direction: column;
  }
  
  .overall-results {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .difficulty-bar {
    grid-template-columns: 60px 1fr 50px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.test-container {
  animation: fadeIn 0.6s ease-out;
}

.image-panel {
  animation: scaleIn 0.4s ease-out;
}

.result-card {
  animation: fadeIn 0.6s ease-out;
}

/* 主题变量 */
:root {
  --color-primary: #007bff;
  --color-success: #28a745;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  --color-info: #17a2b8;
  --color-light: #f8f9fa;
  --color-dark: #343a40;
}
</style>