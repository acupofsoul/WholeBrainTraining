<template>
  <div class="detail-observation-test">
    <div class="test-container">
      <!-- 测试说明 -->
      <div v-if="testPhase === 'instruction'" class="instruction-phase">
        <div class="instruction-content">
          <h3>细节观察测试</h3>
          <div class="instruction-text">
            <p>在这个测试中，您需要仔细观察图像并记住其中的细节信息。</p>
            <div class="instruction-steps">
              <div class="step-item">
                <span class="step-number">1</span>
                <span class="step-text">仔细观察展示的图像</span>
              </div>
              <div class="step-item">
                <span class="step-number">2</span>
                <span class="step-text">记住图像中的重要细节</span>
              </div>
              <div class="step-item">
                <span class="step-number">3</span>
                <span class="step-text">回答关于图像细节的问题</span>
              </div>
              <div class="step-item">
                <span class="step-number">4</span>
                <span class="step-text">尽可能准确地回答每个问题</span>
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
          <div class="phase-indicator">
            <span class="phase-label">当前阶段:</span>
            <span class="phase-name">{{ currentPhaseLabel }}</span>
          </div>
        </div>
        
        <!-- 观察阶段 -->
        <div v-if="questionPhase === 'observation'" class="observation-phase">
          <div class="observation-header">
            <h4>请仔细观察下面的图像</h4>
            <div class="observation-timer">
              <div class="timer-circle">
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="25" fill="none" stroke="#e0e0e0" stroke-width="4"/>
                  <circle cx="30" cy="30" r="25" fill="none" stroke="var(--color-primary)" 
                          stroke-width="4" stroke-linecap="round"
                          :stroke-dasharray="`${observationProgress * 1.57} 157`"
                          transform="rotate(-90 30 30)"/>
                </svg>
                <div class="timer-text">{{ observationTimeLeft }}s</div>
              </div>
            </div>
          </div>
          
          <div class="image-container">
            <div class="detail-image" :style="{ backgroundImage: `url(${currentQuestion.imageUrl})` }">
              <!-- 图像内容 -->
              <div class="image-content">
                <svg width="100%" height="100%" viewBox="0 0 400 300">
                  <!-- 背景 -->
                  <rect width="400" height="300" :fill="currentQuestion.background"/>
                  
                  <!-- 图像元素 -->
                  <g v-for="(element, index) in currentQuestion.elements" :key="index">
                    <!-- 形状元素 -->
                    <circle 
                      v-if="element.type === 'circle'"
                      :cx="element.x" 
                      :cy="element.y" 
                      :r="element.size" 
                      :fill="element.color"
                      :stroke="element.border || 'none'"
                      :stroke-width="element.borderWidth || 0"
                    />
                    <rect 
                      v-else-if="element.type === 'rectangle'"
                      :x="element.x - element.width/2" 
                      :y="element.y - element.height/2" 
                      :width="element.width" 
                      :height="element.height" 
                      :fill="element.color"
                      :stroke="element.border || 'none'"
                      :stroke-width="element.borderWidth || 0"
                    />
                    <polygon 
                      v-else-if="element.type === 'triangle'"
                      :points="getTrianglePoints(element.x, element.y, element.size)"
                      :fill="element.color"
                      :stroke="element.border || 'none'"
                      :stroke-width="element.borderWidth || 0"
                    />
                    
                    <!-- 文字元素 -->
                    <text 
                      v-if="element.type === 'text'"
                      :x="element.x" 
                      :y="element.y" 
                      :font-size="element.fontSize || 16"
                      :fill="element.color"
                      :font-weight="element.fontWeight || 'normal'"
                      text-anchor="middle"
                      dominant-baseline="middle"
                    >
                      {{ element.text }}
                    </text>
                    
                    <!-- 线条元素 -->
                    <line 
                      v-if="element.type === 'line'"
                      :x1="element.x1" 
                      :y1="element.y1" 
                      :x2="element.x2" 
                      :y2="element.y2" 
                      :stroke="element.color"
                      :stroke-width="element.width || 2"
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 问答阶段 -->
        <div v-if="questionPhase === 'questioning'" class="questioning-phase">
          <div class="question-container">
            <h4>{{ currentDetailQuestion.question }}</h4>
            
            <div class="question-options">
              <div 
                v-for="(option, index) in currentDetailQuestion.options" 
                :key="index"
                class="option-item"
                :class="{ selected: selectedAnswer === index }"
                @click="selectAnswer(index)"
              >
                <div class="option-letter">{{ String.fromCharCode(65 + index) }}</div>
                <div class="option-content">
                  <div v-if="option.type === 'text'" class="option-text">
                    {{ option.text }}
                  </div>
                  <div v-else-if="option.type === 'color'" class="option-color">
                    <div class="color-sample" :style="{ backgroundColor: option.color }"></div>
                    <span>{{ option.label }}</span>
                  </div>
                  <div v-else-if="option.type === 'number'" class="option-number">
                    {{ option.value }}
                  </div>
                  <div v-else-if="option.type === 'shape'" class="option-shape">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <circle v-if="option.shape === 'circle'" cx="20" cy="20" r="15" :fill="option.color || '#333'"/>
                      <rect v-else-if="option.shape === 'rectangle'" x="5" y="10" width="30" height="20" :fill="option.color || '#333'"/>
                      <polygon v-else-if="option.shape === 'triangle'" points="20,5 35,35 5,35" :fill="option.color || '#333'"/>
                    </svg>
                    <span>{{ option.label }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="question-controls">
              <button 
                class="btn-submit" 
                @click="submitAnswer" 
                :disabled="selectedAnswer === null"
              >
                {{ isLastDetailQuestion ? '下一题' : '下一个问题' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- 反馈阶段 -->
        <div v-if="questionPhase === 'feedback'" class="feedback-phase">
          <div class="feedback-container">
            <div class="feedback-header">
              <div class="feedback-icon" :class="{ correct: lastAnswerCorrect, incorrect: !lastAnswerCorrect }">
                {{ lastAnswerCorrect ? '✓' : '✗' }}
              </div>
              <div class="feedback-text">
                <div class="feedback-title">
                  {{ lastAnswerCorrect ? '回答正确！' : '回答错误' }}
                </div>
                <div class="feedback-explanation">
                  {{ currentDetailQuestion.explanation }}
                </div>
              </div>
            </div>
            
            <div class="feedback-details">
              <div class="detail-item">
                <span class="detail-label">正确答案:</span>
                <span class="detail-value">{{ getCorrectAnswerText() }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">您的答案:</span>
                <span class="detail-value">{{ getSelectedAnswerText() }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">用时:</span>
                <span class="detail-value">{{ lastResponseTime }}秒</span>
              </div>
            </div>
            
            <button class="btn-continue" @click="continueTesting">
              {{ isLastQuestion ? '查看结果' : '继续测试' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 结果展示 -->
      <div v-if="testPhase === 'results'" class="results-phase">
        <div class="results-container">
          <h3>细节观察测试结果</h3>
          
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
              <div class="result-icon">👁️</div>
              <div class="result-content">
                <div class="result-value">{{ observationScore }}%</div>
                <div class="result-label">观察能力</div>
              </div>
            </div>
          </div>
          
          <div class="detailed-analysis">
            <h4>详细分析</h4>
            <div class="analysis-grid">
              <div class="analysis-item">
                <h5>题型表现</h5>
                <div class="category-chart">
                  <div v-for="category in questionCategories" :key="category" class="category-bar">
                    <span class="category-label">{{ getCategoryLabel(category) }}</span>
                    <div class="bar-container">
                      <div 
                        class="bar-fill" 
                        :style="{ width: getCategoryAccuracy(category) + '%' }"
                      ></div>
                    </div>
                    <span class="accuracy-value">{{ getCategoryAccuracy(category) }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="analysis-item">
                <h5>反应时间分布</h5>
                <div class="time-distribution">
                  <svg width="300" height="150" viewBox="0 0 300 150">
                    <g v-for="(bar, index) in timeDistributionBars" :key="index">
                      <rect 
                        :x="bar.x" 
                        :y="bar.y" 
                        :width="bar.width" 
                        :height="bar.height" 
                        fill="var(--color-primary)"
                        opacity="0.7"
                      />
                      <text 
                        :x="bar.x + bar.width/2" 
                        :y="145" 
                        text-anchor="middle" 
                        font-size="10" 
                        fill="#666"
                      >
                        {{ bar.label }}
                      </text>
                    </g>
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
const questionPhase = ref('observation'); // observation, questioning, feedback
const currentQuestionIndex = ref(0);
const currentDetailQuestionIndex = ref(0);
const questions = ref([]);
const answers = ref([]);
const startTime = ref(0);
const questionStartTime = ref(0);
const questionTime = ref(0);
const observationTime = ref(0);
const observationTimeLeft = ref(10);
const timer = ref(null);
const observationTimer = ref(null);
const selectedAnswer = ref(null);
const lastAnswerCorrect = ref(false);
const lastResponseTime = ref(0);

// 计算属性
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
const currentDetailQuestion = computed(() => {
  if (!currentQuestion.value) return null;
  return currentQuestion.value.detailQuestions[currentDetailQuestionIndex.value];
});

const currentPhaseLabel = computed(() => {
  const labels = {
    observation: '观察图像',
    questioning: '回答问题',
    feedback: '查看反馈'
  };
  return labels[questionPhase.value] || '';
});

const observationProgress = computed(() => {
  const totalTime = getDifficultyObservationTime(currentQuestion.value?.difficulty || 'medium');
  return ((totalTime - observationTimeLeft.value) / totalTime) * 100;
});

const isLastDetailQuestion = computed(() => {
  if (!currentQuestion.value) return true;
  return currentDetailQuestionIndex.value === currentQuestion.value.detailQuestions.length - 1;
});

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === questions.value.length - 1;
});

const overallAccuracy = computed(() => {
  if (answers.value.length === 0) return 0;
  const totalCorrect = answers.value.reduce((sum, answer) => sum + answer.correctCount, 0);
  const totalQuestions = answers.value.reduce((sum, answer) => sum + answer.totalQuestions, 0);
  return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
});

const averageTime = computed(() => {
  if (answers.value.length === 0) return 0;
  const totalTime = answers.value.reduce((sum, answer) => sum + answer.totalTime, 0);
  return (totalTime / answers.value.length).toFixed(1);
});

const finalScore = computed(() => {
  const accuracyWeight = 0.7;
  const speedWeight = 0.3;
  const maxTime = 30; // 最大时间30秒
  
  const accuracyScore = overallAccuracy.value;
  const speedScore = Math.max(0, 100 - (parseFloat(averageTime.value) / maxTime) * 100);
  
  return Math.round(accuracyScore * accuracyWeight + speedScore * speedWeight);
});

const observationScore = computed(() => {
  // 基于准确率和观察时间计算观察能力得分
  const baseScore = overallAccuracy.value;
  const timeBonus = answers.value.reduce((sum, answer) => {
    const efficiency = Math.max(0, 100 - (answer.averageTime / 20) * 100);
    return sum + efficiency;
  }, 0) / answers.value.length;
  
  return Math.round(baseScore * 0.8 + timeBonus * 0.2);
});

const questionCategories = computed(() => {
  const categories = new Set();
  answers.value.forEach(answer => {
    answer.detailAnswers.forEach(detail => {
      categories.add(detail.category);
    });
  });
  return Array.from(categories);
});

const timeDistributionBars = computed(() => {
  const times = [];
  answers.value.forEach(answer => {
    answer.detailAnswers.forEach(detail => {
      times.push(detail.responseTime);
    });
  });
  
  // 创建时间分布直方图
  const bins = [0, 5, 10, 15, 20, 30];
  const counts = new Array(bins.length - 1).fill(0);
  
  times.forEach(time => {
    for (let i = 0; i < bins.length - 1; i++) {
      if (time >= bins[i] && time < bins[i + 1]) {
        counts[i]++;
        break;
      }
    }
  });
  
  const maxCount = Math.max(...counts);
  const barWidth = 40;
  const maxHeight = 100;
  
  return counts.map((count, index) => ({
    x: index * 50 + 25,
    y: 130 - (count / maxCount) * maxHeight,
    width: barWidth,
    height: (count / maxCount) * maxHeight,
    label: `${bins[index]}-${bins[index + 1]}s`
  }));
});

const improvementSuggestions = computed(() => {
  const suggestions = [];
  
  if (overallAccuracy.value < 70) {
    suggestions.push('建议提高观察的仔细程度，注意图像中的细节信息');
  }
  
  if (parseFloat(averageTime.value) > 20) {
    suggestions.push('可以通过练习提高观察和记忆的效率');
  }
  
  const colorAccuracy = getCategoryAccuracy('color');
  if (colorAccuracy < 70) {
    suggestions.push('加强对颜色细节的观察和记忆训练');
  }
  
  const shapeAccuracy = getCategoryAccuracy('shape');
  if (shapeAccuracy < 70) {
    suggestions.push('提高对形状和几何特征的识别能力');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('表现优秀，继续保持细致的观察能力！');
  }
  
  return suggestions;
});

// 方法
const startTest = () => {
  testPhase.value = 'testing';
  generateQuestions();
  startObservation();
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
    easy: 6,
    medium: 8,
    hard: 10,
    expert: 12
  };
  return counts[difficulty] || 8;
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
    easy: { elementCount: 5, questionCount: 3, observationTime: 15 },
    medium: { elementCount: 8, questionCount: 4, observationTime: 12 },
    hard: { elementCount: 12, questionCount: 5, observationTime: 10 },
    expert: { elementCount: 15, questionCount: 6, observationTime: 8 }
  };
  
  const config = configs[difficulty];
  const elements = generateImageElements(config.elementCount, difficulty);
  const detailQuestions = generateDetailQuestions(elements, config.questionCount, difficulty);
  
  return {
    difficulty,
    background: getRandomColor(['#f0f8ff', '#f5f5dc', '#f0fff0', '#fff8dc']),
    elements,
    detailQuestions,
    observationTime: config.observationTime
  };
};

const generateImageElements = (count, difficulty) => {
  const elements = [];
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a0e7e5', '#ffeaa7'];
  const shapes = ['circle', 'rectangle', 'triangle'];
  const texts = ['A', 'B', 'C', '1', '2', '3', '★', '♦', '♠'];
  
  for (let i = 0; i < count; i++) {
    const elementType = Math.random() < 0.7 ? 'shape' : 'text';
    
    if (elementType === 'shape') {
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
      const element = {
        type: shapeType,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 20 + 10
      };
      
      if (shapeType === 'rectangle') {
        element.width = Math.random() * 40 + 20;
        element.height = Math.random() * 30 + 15;
      }
      
      // 添加边框（部分元素）
      if (Math.random() < 0.3) {
        element.border = '#333';
        element.borderWidth = 2;
      }
      
      elements.push(element);
    } else {
      elements.push({
        type: 'text',
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        text: texts[Math.floor(Math.random() * texts.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        fontSize: Math.random() * 10 + 16,
        fontWeight: Math.random() < 0.5 ? 'normal' : 'bold'
      });
    }
  }
  
  // 添加一些线条
  if (difficulty !== 'easy') {
    const lineCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < lineCount; i++) {
      elements.push({
        type: 'line',
        x1: Math.random() * 400,
        y1: Math.random() * 300,
        x2: Math.random() * 400,
        y2: Math.random() * 300,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: Math.random() * 3 + 1
      });
    }
  }
  
  return elements;
};

const generateDetailQuestions = (elements, count, difficulty) => {
  const questions = [];
  const questionTypes = ['color', 'shape', 'count', 'position', 'size', 'text'];
  
  for (let i = 0; i < count; i++) {
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const question = generateQuestionByType(elements, questionType, difficulty);
    if (question) {
      questions.push(question);
    }
  }
  
  return questions;
};

const generateQuestionByType = (elements, type, difficulty) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a0e7e5', '#ffeaa7'];
  const colorNames = ['红色', '青色', '蓝色', '黄色', '紫色', '浅青', '浅黄'];
  
  switch (type) {
    case 'color':
      const colorElements = elements.filter(el => el.color);
      if (colorElements.length === 0) return null;
      
      const targetColor = colorElements[Math.floor(Math.random() * colorElements.length)].color;
      const colorIndex = colors.indexOf(targetColor);
      const correctColorName = colorNames[colorIndex] || '未知';
      
      const colorOptions = [
        { type: 'color', color: targetColor, label: correctColorName },
        { type: 'color', color: colors[(colorIndex + 1) % colors.length], label: colorNames[(colorIndex + 1) % colorNames.length] },
        { type: 'color', color: colors[(colorIndex + 2) % colors.length], label: colorNames[(colorIndex + 2) % colorNames.length] },
        { type: 'color', color: colors[(colorIndex + 3) % colors.length], label: colorNames[(colorIndex + 3) % colorNames.length] }
      ];
      
      return {
        category: 'color',
        question: '图像中出现了哪种颜色的元素？',
        options: shuffleArray(colorOptions),
        correctAnswer: colorOptions.findIndex(opt => opt.color === targetColor),
        explanation: `图像中确实包含${correctColorName}的元素。`
      };
      
    case 'shape':
      const shapeElements = elements.filter(el => ['circle', 'rectangle', 'triangle'].includes(el.type));
      if (shapeElements.length === 0) return null;
      
      const targetShape = shapeElements[Math.floor(Math.random() * shapeElements.length)].type;
      const shapeNames = { circle: '圆形', rectangle: '矩形', triangle: '三角形' };
      
      const shapeOptions = [
        { type: 'shape', shape: 'circle', label: '圆形', color: '#666' },
        { type: 'shape', shape: 'rectangle', label: '矩形', color: '#666' },
        { type: 'shape', shape: 'triangle', label: '三角形', color: '#666' }
      ];
      
      return {
        category: 'shape',
        question: '图像中包含以下哪种形状？',
        options: shapeOptions,
        correctAnswer: shapeOptions.findIndex(opt => opt.shape === targetShape),
        explanation: `图像中确实包含${shapeNames[targetShape]}。`
      };
      
    case 'count':
      const countableElements = elements.filter(el => el.type === 'circle');
      const actualCount = countableElements.length;
      
      const countOptions = [
        { type: 'number', value: actualCount },
        { type: 'number', value: Math.max(0, actualCount - 1) },
        { type: 'number', value: actualCount + 1 },
        { type: 'number', value: actualCount + 2 }
      ].filter(opt => opt.value >= 0);
      
      return {
        category: 'count',
        question: '图像中有多少个圆形？',
        options: shuffleArray(countOptions),
        correctAnswer: countOptions.findIndex(opt => opt.value === actualCount),
        explanation: `图像中共有${actualCount}个圆形。`
      };
      
    case 'text':
      const textElements = elements.filter(el => el.type === 'text');
      if (textElements.length === 0) return null;
      
      const targetText = textElements[Math.floor(Math.random() * textElements.length)].text;
      const allTexts = ['A', 'B', 'C', '1', '2', '3', '★', '♦', '♠'];
      const otherTexts = allTexts.filter(t => t !== targetText);
      
      const textOptions = [
        { type: 'text', text: targetText },
        { type: 'text', text: otherTexts[0] },
        { type: 'text', text: otherTexts[1] },
        { type: 'text', text: otherTexts[2] }
      ];
      
      return {
        category: 'text',
        question: '图像中包含以下哪个文字或符号？',
        options: shuffleArray(textOptions),
        correctAnswer: textOptions.findIndex(opt => opt.text === targetText),
        explanation: `图像中确实包含文字或符号${targetText}。`
      };
      
    default:
      return null;
  }
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getRandomColor = (colors) => {
  return colors[Math.floor(Math.random() * colors.length)];
};

const getDifficultyObservationTime = (difficulty) => {
  const times = {
    easy: 15,
    medium: 12,
    hard: 10,
    expert: 8
  };
  return times[difficulty] || 12;
};

const startObservation = () => {
  questionPhase.value = 'observation';
  observationTime.value = getDifficultyObservationTime(currentQuestion.value.difficulty);
  observationTimeLeft.value = observationTime.value;
  
  observationTimer.value = setInterval(() => {
    observationTimeLeft.value--;
    if (observationTimeLeft.value <= 0) {
      clearInterval(observationTimer.value);
      startQuestioning();
    }
  }, 1000);
};

const startQuestioning = () => {
  questionPhase.value = 'questioning';
  currentDetailQuestionIndex.value = 0;
  selectedAnswer.value = null;
  questionStartTime.value = Date.now();
  startQuestionTimer();
};

const startQuestionTimer = () => {
  questionTime.value = 0;
  timer.value = setInterval(() => {
    questionTime.value++;
  }, 1000);
};

const selectAnswer = (index) => {
  selectedAnswer.value = index;
};

const submitAnswer = () => {
  if (selectedAnswer.value === null) return;
  
  clearInterval(timer.value);
  const responseTime = (Date.now() - questionStartTime.value) / 1000;
  const isCorrect = selectedAnswer.value === currentDetailQuestion.value.correctAnswer;
  
  lastAnswerCorrect.value = isCorrect;
  lastResponseTime.value = responseTime.toFixed(1);
  
  // 记录答案
  if (!answers.value[currentQuestionIndex.value]) {
    answers.value[currentQuestionIndex.value] = {
      questionIndex: currentQuestionIndex.value,
      detailAnswers: [],
      correctCount: 0,
      totalQuestions: currentQuestion.value.detailQuestions.length,
      totalTime: 0
    };
  }
  
  answers.value[currentQuestionIndex.value].detailAnswers.push({
    questionIndex: currentDetailQuestionIndex.value,
    selectedAnswer: selectedAnswer.value,
    correctAnswer: currentDetailQuestion.value.correctAnswer,
    isCorrect,
    responseTime,
    category: currentDetailQuestion.value.category
  });
  
  if (isCorrect) {
    answers.value[currentQuestionIndex.value].correctCount++;
  }
  
  answers.value[currentQuestionIndex.value].totalTime += responseTime;
  
  emit('answer-submitted', {
    questionIndex: currentQuestionIndex.value,
    detailQuestionIndex: currentDetailQuestionIndex.value,
    selectedAnswer: selectedAnswer.value,
    correctAnswer: currentDetailQuestion.value.correctAnswer,
    isCorrect,
    responseTime
  });
  
  questionPhase.value = 'feedback';
};

const continueTesting = () => {
  if (isLastDetailQuestion.value) {
    // 当前题目的所有细节问题都完成了
    if (isLastQuestion.value) {
      // 所有题目都完成了
      completeTest();
    } else {
      // 进入下一题
      currentQuestionIndex.value++;
      startObservation();
    }
  } else {
    // 继续当前题目的下一个细节问题
    currentDetailQuestionIndex.value++;
    selectedAnswer.value = null;
    questionStartTime.value = Date.now();
    questionPhase.value = 'questioning';
    startQuestionTimer();
  }
};

const completeTest = () => {
  testPhase.value = 'results';
  
  // 计算平均时间
  answers.value.forEach(answer => {
    answer.averageTime = answer.totalTime / answer.totalQuestions;
  });
  
  emit('test-completed', {
    testType: 'detail-observation',
    results: {
      overallAccuracy: overallAccuracy.value,
      averageTime: parseFloat(averageTime.value),
      finalScore: finalScore.value,
      observationScore: observationScore.value,
      answers: answers.value,
      totalTime: (Date.now() - startTime.value) / 1000
    }
  });
};

const getTrianglePoints = (x, y, size) => {
  const height = size * Math.sqrt(3) / 2;
  return `${x},${y - height/2} ${x - size/2},${y + height/2} ${x + size/2},${y + height/2}`;
};

const getCorrectAnswerText = () => {
  const option = currentDetailQuestion.value.options[currentDetailQuestion.value.correctAnswer];
  if (option.type === 'text') return option.text;
  if (option.type === 'color') return option.label;
  if (option.type === 'number') return option.value.toString();
  if (option.type === 'shape') return option.label;
  return '';
};

const getSelectedAnswerText = () => {
  if (selectedAnswer.value === null) return '未选择';
  const option = currentDetailQuestion.value.options[selectedAnswer.value];
  if (option.type === 'text') return option.text;
  if (option.type === 'color') return option.label;
  if (option.type === 'number') return option.value.toString();
  if (option.type === 'shape') return option.label;
  return '';
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getCategoryLabel = (category) => {
  const labels = {
    color: '颜色识别',
    shape: '形状识别',
    count: '数量统计',
    position: '位置记忆',
    size: '大小比较',
    text: '文字识别'
  };
  return labels[category] || category;
};

const getCategoryAccuracy = (category) => {
  const categoryAnswers = [];
  answers.value.forEach(answer => {
    answer.detailAnswers.forEach(detail => {
      if (detail.category === category) {
        categoryAnswers.push(detail);
      }
    });
  });
  
  if (categoryAnswers.length === 0) return 0;
  const correctCount = categoryAnswers.filter(answer => answer.isCorrect).length;
  return Math.round((correctCount / categoryAnswers.length) * 100);
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
  if (accuracy >= 90) return '您的细节观察能力非常出色，能够准确捕捉和记忆图像中的各种细节信息。';
  if (accuracy >= 80) return '您具有良好的细节观察能力，在大多数情况下能够准确识别图像细节。';
  if (accuracy >= 70) return '您的细节观察能力处于平均水平，通过练习可以进一步提高。';
  return '建议加强细节观察训练，提高对图像信息的敏感度和记忆能力。';
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
  if (observationTimer.value) {
    clearInterval(observationTimer.value);
  }
});

// 监听测试数据变化
watch(() => props.testData, (newData) => {
  if (newData && testPhase.value === 'instruction') {
    // 重置测试状态
    currentQuestionIndex.value = 0;
    currentDetailQuestionIndex.value = 0;
    answers.value = [];
    selectedAnswer.value = null;
  }
}, { deep: true });
</script>

<style scoped>
.detail-observation-test {
  width: 100%;
  max-width: 1200px;
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

.phase-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.phase-label {
  color: #6c757d;
}

.phase-name {
  font-weight: 600;
  color: #495057;
}

/* 观察阶段 */
.observation-phase {
  text-align: center;
}

.observation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.observation-header h4 {
  font-size: 1.5em;
  color: #495057;
  margin: 0;
}

.observation-timer {
  display: flex;
  align-items: center;
}

.timer-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-text {
  position: absolute;
  font-size: 1.2em;
  font-weight: 600;
  color: var(--color-primary, #007bff);
}

.image-container {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.detail-image {
  width: 500px;
  height: 375px;
  border: 3px solid #dee2e6;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.image-content {
  width: 100%;
  height: 100%;
}

/* 问答阶段 */
.questioning-phase {
  max-width: 800px;
  margin: 0 auto;
}

.question-container h4 {
  font-size: 1.4em;
  color: #495057;
  margin-bottom: 30px;
  text-align: center;
}

.question-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.option-item:hover {
  border-color: #007bff;
  background: #f8f9ff;
}

.option-item.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.option-letter {
  width: 30px;
  height: 30px;
  background: #6c757d;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-weight: 600;
}

.option-item.selected .option-letter {
  background: #007bff;
}

.option-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-text {
  font-size: 1.1em;
}

.option-color {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-sample {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.option-number {
  font-size: 1.2em;
  font-weight: 600;
}

.option-shape {
  display: flex;
  align-items: center;
  gap: 10px;
}

.question-controls {
  text-align: center;
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

/* 反馈阶段 */
.feedback-phase {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.feedback-container {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
}

.feedback-header {
  display: flex;
  align-items: center;
  justify-content: center;
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

.feedback-icon.correct {
  background: #28a745;
}

.feedback-icon.incorrect {
  background: #dc3545;
}

.feedback-text {
  text-align: left;
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
  text-align: left;
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

.btn-continue {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1em;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
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
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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

.category-chart {
  display: grid;
  gap: 15px;
}

.category-bar {
  display: grid;
  grid-template-columns: 100px 1fr 60px;
  align-items: center;
  gap: 15px;
}

.category-label {
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

.time-distribution {
  display: flex;
  justify-content: center;
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
  .detail-observation-test {
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
  
  .detail-image {
    width: 100%;
    max-width: 400px;
    height: 300px;
  }
  
  .question-options {
    grid-template-columns: 1fr;
  }
  
  .overall-results {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .category-bar {
    grid-template-columns: 80px 1fr 50px;
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

.test-container {
  animation: fadeIn 0.6s ease-out;
}

.option-item {
  animation: slideIn 0.4s ease-out;
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