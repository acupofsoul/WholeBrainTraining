<template>
  <div class="logical-reasoning-test">
    <div class="test-content">
      <div class="question-header">
        <h3>逻辑推理测试</h3>
        <div class="question-counter">
          题目 {{ currentQuestionIndex + 1 }} / {{ questions.length }}
        </div>
      </div>

      <div v-if="currentQuestion" class="question-container">
        <div class="question-text">
          {{ currentQuestion.question }}
        </div>

        <div class="question-visual" v-if="currentQuestion.visual">
          <div class="pattern-container">
            <div v-for="(item, index) in currentQuestion.pattern" 
                 :key="index" 
                 class="pattern-item"
                 :class="{ missing: item === '?' }">
              <span v-if="item !== '?'">{{ item }}</span>
              <span v-else class="question-mark">?</span>
            </div>
          </div>
        </div>

        <div class="options-container">
          <button v-for="(option, index) in currentQuestion.options" 
                  :key="index"
                  class="option-button"
                  :class="{ selected: selectedAnswer === index }"
                  @click="selectAnswer(index)">
            {{ option }}
          </button>
        </div>

        <div class="question-actions">
          <button class="btn-secondary" 
                  @click="previousQuestion" 
                  :disabled="currentQuestionIndex === 0">
            上一题
          </button>
          <button class="btn-primary" 
                  @click="nextQuestion" 
                  :disabled="selectedAnswer === null">
            {{ currentQuestionIndex === questions.length - 1 ? '完成测试' : '下一题' }}
          </button>
        </div>
      </div>

      <div v-if="showResults" class="results-summary">
        <h3>逻辑推理测试完成</h3>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-label">正确率：</span>
            <span class="stat-value">{{ accuracy }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">用时：</span>
            <span class="stat-value">{{ formatTime(totalTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">得分：</span>
            <span class="stat-value">{{ finalScore }}分</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

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
const currentQuestionIndex = ref(0);
const selectedAnswer = ref(null);
const answers = ref([]);
const startTime = ref(Date.now());
const questionStartTime = ref(Date.now());
const showResults = ref(false);

// 测试数据
const questions = ref([]);

// 计算属性
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value];
});

const accuracy = computed(() => {
  if (answers.value.length === 0) return 0;
  const correct = answers.value.filter(answer => answer.isCorrect).length;
  return Math.round((correct / answers.value.length) * 100);
});

const totalTime = computed(() => {
  return Math.round((Date.now() - startTime.value) / 1000);
});

const finalScore = computed(() => {
  const baseScore = accuracy.value;
  const timeBonus = Math.max(0, 20 - Math.floor(totalTime.value / 30));
  return Math.min(100, baseScore + timeBonus);
});

// 方法
const selectAnswer = (index) => {
  selectedAnswer.value = index;
};

const nextQuestion = () => {
  if (selectedAnswer.value === null) return;
  
  // 记录答案
  const questionTime = Date.now() - questionStartTime.value;
  const isCorrect = selectedAnswer.value === currentQuestion.value.correctAnswer;
  
  answers.value.push({
    questionIndex: currentQuestionIndex.value,
    selectedAnswer: selectedAnswer.value,
    correctAnswer: currentQuestion.value.correctAnswer,
    isCorrect,
    timeSpent: questionTime
  });
  
  emit('answer-submitted', {
    questionIndex: currentQuestionIndex.value,
    answer: selectedAnswer.value,
    isCorrect,
    timeSpent: questionTime
  });
  
  if (currentQuestionIndex.value === questions.value.length - 1) {
    // 测试完成
    completeTest();
  } else {
    // 下一题
    currentQuestionIndex.value++;
    selectedAnswer.value = null;
    questionStartTime.value = Date.now();
  }
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    selectedAnswer.value = answers.value[currentQuestionIndex.value]?.selectedAnswer || null;
  }
};

const completeTest = () => {
  showResults.value = true;
  
  const result = {
    score: finalScore.value,
    accuracy: accuracy.value,
    timeUsed: totalTime.value,
    difficulty: props.settings.difficulty,
    answers: answers.value,
    feedback: generateFeedback()
  };
  
  setTimeout(() => {
    emit('test-completed', result);
  }, 3000);
};

const generateFeedback = () => {
  const acc = accuracy.value;
  if (acc >= 90) {
    return '优秀！您的逻辑推理能力非常强，能够快速识别复杂的模式和规律。';
  } else if (acc >= 80) {
    return '良好！您具备较强的逻辑推理能力，在大多数情况下能够正确分析问题。';
  } else if (acc >= 70) {
    return '一般！您的逻辑推理能力处于平均水平，建议多练习提高分析能力。';
  } else {
    return '需要改进！建议加强逻辑思维训练，多做相关练习题。';
  }
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}分${remainingSeconds}秒`;
};

// 生成测试题目
const generateQuestions = () => {
  const difficulty = props.settings.difficulty;
  const questionCount = props.testData.questions?.length || 10;
  
  questions.value = [];
  
  for (let i = 0; i < questionCount; i++) {
    questions.value.push(generateQuestion(i, difficulty));
  }
};

const generateQuestion = (index, difficulty) => {
  const questionTypes = ['sequence', 'pattern', 'analogy', 'logic'];
  const type = questionTypes[index % questionTypes.length];
  
  switch (type) {
    case 'sequence':
      return generateSequenceQuestion(difficulty);
    case 'pattern':
      return generatePatternQuestion(difficulty);
    case 'analogy':
      return generateAnalogyQuestion(difficulty);
    case 'logic':
      return generateLogicQuestion(difficulty);
    default:
      return generateSequenceQuestion(difficulty);
  }
};

const generateSequenceQuestion = (difficulty) => {
  const sequences = {
    easy: [
      { pattern: [2, 4, 6, 8, '?'], answer: 10, options: ['9', '10', '11', '12'] },
      { pattern: [1, 3, 5, 7, '?'], answer: 9, options: ['8', '9', '10', '11'] },
      { pattern: [10, 8, 6, 4, '?'], answer: 2, options: ['1', '2', '3', '4'] }
    ],
    medium: [
      { pattern: [1, 4, 9, 16, '?'], answer: 25, options: ['20', '25', '30', '36'] },
      { pattern: [2, 6, 18, 54, '?'], answer: 162, options: ['108', '162', '216', '324'] },
      { pattern: [1, 1, 2, 3, 5, '?'], answer: 8, options: ['6', '7', '8', '9'] }
    ],
    hard: [
      { pattern: [1, 4, 13, 40, '?'], answer: 121, options: ['100', '121', '144', '169'] },
      { pattern: [2, 3, 5, 8, 13, '?'], answer: 21, options: ['18', '20', '21', '23'] },
      { pattern: [1, 8, 27, 64, '?'], answer: 125, options: ['100', '125', '150', '216'] }
    ],
    expert: [
      { pattern: [1, 11, 21, 1211, '?'], answer: '111221', options: ['111221', '112211', '121121', '211211'] },
      { pattern: [2, 12, 1112, 3112, '?'], answer: '211213', options: ['211213', '311213', '211312', '312211'] },
      { pattern: [1, 2, 6, 24, 120, '?'], answer: 720, options: ['600', '720', '840', '1000'] }
    ]
  };
  
  const sequenceList = sequences[difficulty] || sequences.medium;
  const selected = sequenceList[Math.floor(Math.random() * sequenceList.length)];
  const correctIndex = selected.options.findIndex(opt => opt == selected.answer);
  
  return {
    type: 'sequence',
    question: '找出数列规律，选择正确答案：',
    pattern: selected.pattern,
    visual: true,
    options: selected.options,
    correctAnswer: correctIndex >= 0 ? correctIndex : 0
  };
};

const generatePatternQuestion = (difficulty) => {
  const patterns = {
    easy: [
      {
        question: '下列哪个图形与其他不同？',
        options: ['○', '△', '□', '○'],
        correctAnswer: 2
      }
    ],
    medium: [
      {
        question: '按照规律，下一个应该是什么？',
        pattern: ['●', '○', '●', '○', '?'],
        options: ['●', '○', '◐', '◑'],
        correctAnswer: 0
      }
    ],
    hard: [
      {
        question: '找出图形变化规律：',
        pattern: ['▲', '▼', '◀', '▶', '?'],
        options: ['▲', '▼', '◀', '▶'],
        correctAnswer: 0
      }
    ]
  };
  
  const patternList = patterns[difficulty] || patterns.medium;
  return patternList[Math.floor(Math.random() * patternList.length)];
};

const generateAnalogyQuestion = (difficulty) => {
  const analogies = {
    easy: [
      {
        question: '鸟 对于 飞翔，正如 鱼 对于 ？',
        options: ['游泳', '呼吸', '觅食', '繁殖'],
        correctAnswer: 0
      },
      {
        question: '书 对于 阅读，正如 音乐 对于 ？',
        options: ['创作', '聆听', '演奏', '录制'],
        correctAnswer: 1
      }
    ],
    medium: [
      {
        question: '医生 对于 治疗，正如 教师 对于 ？',
        options: ['学习', '教育', '研究', '管理'],
        correctAnswer: 1
      },
      {
        question: '钥匙 对于 锁，正如 密码 对于 ？',
        options: ['电脑', '安全', '保险箱', '手机'],
        correctAnswer: 2
      }
    ],
    hard: [
      {
        question: '根 对于 树，正如 基础 对于 ？',
        options: ['房屋', '知识', '建筑', '理论'],
        correctAnswer: 2
      }
    ]
  };
  
  const analogyList = analogies[difficulty] || analogies.medium;
  return analogyList[Math.floor(Math.random() * analogyList.length)];
};

const generateLogicQuestion = (difficulty) => {
  const logicQuestions = {
    easy: [
      {
        question: '如果所有的猫都是动物，而小花是猫，那么：',
        options: ['小花是动物', '小花不是动物', '无法确定', '以上都不对'],
        correctAnswer: 0
      }
    ],
    medium: [
      {
        question: '在一个班级中，如果学数学的学生都学物理，小明学数学，那么：',
        options: ['小明一定学物理', '小明可能学物理', '小明不学物理', '无法确定'],
        correctAnswer: 0
      }
    ],
    hard: [
      {
        question: '如果A>B，B>C，C>D，那么下列哪个结论一定正确？',
        options: ['A>D', 'A=D', 'A<D', 'A≤D'],
        correctAnswer: 0
      }
    ]
  };
  
  const logicList = logicQuestions[difficulty] || logicQuestions.medium;
  return logicList[Math.floor(Math.random() * logicList.length)];
};

// 监听测试数据变化
watch(() => props.testData, () => {
  generateQuestions();
}, { immediate: true });

// 生命周期
onMounted(() => {
  startTime.value = Date.now();
  questionStartTime.value = Date.now();
});
</script>

<style scoped>
.logical-reasoning-test {
  max-width: 800px;
  margin: 0 auto;
}

.test-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.question-header h3 {
  color: var(--color-primary);
  margin: 0;
}

.question-counter {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  color: #666;
}

.question-container {
  margin-bottom: 2rem;
}

.question-text {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: #333;
}

.question-visual {
  margin: 2rem 0;
}

.pattern-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.pattern-item {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.pattern-item.missing {
  border-color: var(--color-primary);
  border-style: dashed;
}

.question-mark {
  color: var(--color-primary);
  font-size: 2rem;
}

.options-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.option-button {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  text-align: center;
}

.option-button:hover {
  border-color: var(--color-primary);
  background: #f8f9ff;
}

.option-button.selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.question-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.results-summary {
  text-align: center;
  padding: 2rem;
}

.results-summary h3 {
  color: var(--color-primary);
  margin-bottom: 2rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 2rem 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

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