<template>
  <div class="attention-test">
    <div class="test-content">
      <div class="test-header">
        <h3>注意力测试</h3>
        <div class="test-info">
          <span class="timer" :class="{ warning: timeRemaining < 30 }">
            剩余时间: {{ formatTime(timeRemaining) }}
          </span>
          <span class="score-counter">得分: {{ currentScore }}</span>
        </div>
      </div>

      <!-- 准备阶段 -->
      <div v-if="phase === 'ready'" class="ready-phase">
        <div class="instructions">
          <h4>测试说明</h4>
          <p>这是一个注意力集中度测试，您需要在复杂的视觉环境中快速找到目标。</p>
          <p>请仔细观察屏幕，找到并点击所有的目标图形。</p>
          <p>目标会在干扰项中出现，请保持专注，尽快找到所有目标。</p>
        </div>
        
        <div class="test-types">
          <h5>测试类型：</h5>
          <div class="type-grid">
            <div class="type-card" :class="{ active: testType === 'visual' }" @click="testType = 'visual'">
              <div class="type-icon">👁️</div>
              <div class="type-name">视觉搜索</div>
              <div class="type-desc">在复杂图形中找到目标</div>
            </div>
            <div class="type-card" :class="{ active: testType === 'sustained' }" @click="testType = 'sustained'">
              <div class="type-icon">⏱️</div>
              <div class="type-name">持续注意</div>
              <div class="type-desc">长时间保持注意力集中</div>
            </div>
            <div class="type-card" :class="{ active: testType === 'selective' }" @click="testType = 'selective'">
              <div class="type-icon">🎯</div>
              <div class="type-name">选择注意</div>
              <div class="type-desc">在干扰中选择特定目标</div>
            </div>
          </div>
        </div>
        
        <button class="btn-primary" @click="startTest">开始测试</button>
      </div>

      <!-- 视觉搜索测试 -->
      <div v-if="phase === 'visual-search'" class="visual-search-phase">
        <div class="task-instruction">
          <div class="target-display">
            <span class="target-label">找到所有的：</span>
            <span class="target-symbol">{{ currentTarget }}</span>
            <span class="target-count">剩余: {{ remainingTargets }}</span>
          </div>
        </div>
        
        <div class="search-grid">
          <button v-for="(item, index) in searchItems" 
                  :key="index"
                  class="search-item"
                  :class="{ 
                    target: item.isTarget,
                    found: item.found,
                    distractor: !item.isTarget && item.clicked
                  }"
                  @click="clickSearchItem(index)"
                  :disabled="item.found || item.clicked">
            {{ item.symbol }}
          </button>
        </div>
        
        <div class="search-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: searchProgress + '%' }"></div>
          </div>
          <div class="progress-text">找到 {{ foundTargets }} / {{ totalTargets }} 个目标</div>
        </div>
      </div>

      <!-- 持续注意测试 -->
      <div v-if="phase === 'sustained-attention'" class="sustained-attention-phase">
        <div class="task-instruction">
          <p>当看到 <strong>{{ sustainedTarget }}</strong> 时，请立即点击它</p>
          <p>其他符号请忽略</p>
        </div>
        
        <div class="stimulus-area">
          <div class="stimulus-display" :class="{ active: showStimulus }">
            <span v-if="showStimulus" class="stimulus-symbol">{{ currentStimulus }}</span>
          </div>
        </div>
        
        <div class="sustained-stats">
          <div class="stat-item">
            <span class="stat-label">正确反应：</span>
            <span class="stat-value">{{ sustainedCorrect }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">错误反应：</span>
            <span class="stat-value">{{ sustainedErrors }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">遗漏：</span>
            <span class="stat-value">{{ sustainedMisses }}</span>
          </div>
        </div>
      </div>

      <!-- 选择注意测试 -->
      <div v-if="phase === 'selective-attention'" class="selective-attention-phase">
        <div class="task-instruction">
          <p>只点击 <span class="highlight-color" :style="{ color: targetColor }">{{ targetColor }}</span> 颜色的 <strong>{{ selectiveTarget }}</strong></p>
          <p>忽略其他颜色和形状</p>
        </div>
        
        <div class="selective-grid">
          <button v-for="(item, index) in selectiveItems" 
                  :key="index"
                  class="selective-item"
                  :class="{ 
                    correct: item.clicked && item.isTarget,
                    incorrect: item.clicked && !item.isTarget
                  }"
                  :style="{ color: item.color }"
                  @click="clickSelectiveItem(index)"
                  :disabled="item.clicked">
            {{ item.symbol }}
          </button>
        </div>
        
        <div class="selective-progress">
          <div class="progress-info">
            <span>正确: {{ selectiveCorrect }}</span>
            <span>错误: {{ selectiveErrors }}</span>
            <span>准确率: {{ selectiveAccuracy }}%</span>
          </div>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="phase === 'results'" class="results-phase">
        <div class="results-container">
          <h3>注意力测试完成</h3>
          <div class="final-stats">
            <div class="stat-card">
              <div class="stat-value">{{ overallScore }}</div>
              <div class="stat-label">综合得分</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ overallAccuracy }}%</div>
              <div class="stat-label">总体准确率</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ averageReactionTime }}ms</div>
              <div class="stat-label">平均反应时间</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ attentionLevel }}</div>
              <div class="stat-label">注意力水平</div>
            </div>
          </div>
          
          <div class="detailed-results">
            <h4>各项测试结果</h4>
            <div class="test-results-grid">
              <div v-for="result in testResults" :key="result.type" class="test-result-card">
                <h5>{{ result.name }}</h5>
                <div class="result-metrics">
                  <div class="metric">
                    <span class="metric-label">准确率：</span>
                    <span class="metric-value">{{ result.accuracy }}%</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">反应时间：</span>
                    <span class="metric-value">{{ result.reactionTime }}ms</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">得分：</span>
                    <span class="metric-value">{{ result.score }}</span>
                  </div>
                </div>
                <div class="result-feedback">
                  {{ result.feedback }}
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
const testType = ref('visual');
const currentScore = ref(0);
const timeRemaining = ref(180); // 3分钟
const timer = ref(null);
const startTime = ref(0);

// 视觉搜索测试
const searchItems = ref([]);
const currentTarget = ref('');
const totalTargets = ref(0);
const foundTargets = ref(0);
const searchResults = ref([]);

// 持续注意测试
const sustainedTarget = ref('●');
const currentStimulus = ref('');
const showStimulus = ref(false);
const sustainedCorrect = ref(0);
const sustainedErrors = ref(0);
const sustainedMisses = ref(0);
const sustainedResults = ref([]);
const stimulusTimer = ref(null);

// 选择注意测试
const selectiveItems = ref([]);
const selectiveTarget = ref('■');
const targetColor = ref('#ff0000');
const selectiveCorrect = ref(0);
const selectiveErrors = ref(0);
const selectiveResults = ref([]);

// 符号和颜色库
const symbols = ['●', '○', '■', '□', '▲', '△', '★', '☆', '♦', '♠'];
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
const colorNames = { '#ff0000': '红色', '#00ff00': '绿色', '#0000ff': '蓝色', '#ffff00': '黄色', '#ff00ff': '紫色', '#00ffff': '青色' };

// 计算属性
const remainingTargets = computed(() => totalTargets.value - foundTargets.value);

const searchProgress = computed(() => {
  return totalTargets.value > 0 ? (foundTargets.value / totalTargets.value) * 100 : 0;
});

const selectiveAccuracy = computed(() => {
  const total = selectiveCorrect.value + selectiveErrors.value;
  return total > 0 ? Math.round((selectiveCorrect.value / total) * 100) : 0;
});

const testResults = computed(() => {
  const results = [];
  
  if (searchResults.value.length > 0) {
    const searchAccuracy = Math.round((foundTargets.value / totalTargets.value) * 100);
    const avgSearchTime = searchResults.value.reduce((sum, r) => sum + r.reactionTime, 0) / searchResults.value.length;
    results.push({
      type: 'visual',
      name: '视觉搜索',
      accuracy: searchAccuracy,
      reactionTime: Math.round(avgSearchTime),
      score: Math.round(searchAccuracy * 0.8 + Math.max(0, 50 - avgSearchTime / 100) * 0.2),
      feedback: generateVisualFeedback(searchAccuracy, avgSearchTime)
    });
  }
  
  if (sustainedResults.value.length > 0) {
    const sustainedAccuracy = Math.round((sustainedCorrect.value / (sustainedCorrect.value + sustainedErrors.value + sustainedMisses.value)) * 100);
    const avgSustainedTime = sustainedResults.value.filter(r => r.correct).reduce((sum, r) => sum + r.reactionTime, 0) / sustainedCorrect.value || 0;
    results.push({
      type: 'sustained',
      name: '持续注意',
      accuracy: sustainedAccuracy,
      reactionTime: Math.round(avgSustainedTime),
      score: Math.round(sustainedAccuracy * 0.7 + Math.max(0, 30 - sustainedErrors.value) * 0.3),
      feedback: generateSustainedFeedback(sustainedAccuracy, sustainedErrors.value)
    });
  }
  
  if (selectiveResults.value.length > 0) {
    const avgSelectiveTime = selectiveResults.value.filter(r => r.correct).reduce((sum, r) => sum + r.reactionTime, 0) / selectiveCorrect.value || 0;
    results.push({
      type: 'selective',
      name: '选择注意',
      accuracy: selectiveAccuracy.value,
      reactionTime: Math.round(avgSelectiveTime),
      score: Math.round(selectiveAccuracy.value * 0.8 + Math.max(0, 40 - selectiveErrors.value) * 0.2),
      feedback: generateSelectiveFeedback(selectiveAccuracy.value, selectiveErrors.value)
    });
  }
  
  return results;
});

const overallScore = computed(() => {
  if (testResults.value.length === 0) return 0;
  return Math.round(testResults.value.reduce((sum, r) => sum + r.score, 0) / testResults.value.length);
});

const overallAccuracy = computed(() => {
  if (testResults.value.length === 0) return 0;
  return Math.round(testResults.value.reduce((sum, r) => sum + r.accuracy, 0) / testResults.value.length);
});

const averageReactionTime = computed(() => {
  if (testResults.value.length === 0) return 0;
  return Math.round(testResults.value.reduce((sum, r) => sum + r.reactionTime, 0) / testResults.value.length);
});

const attentionLevel = computed(() => {
  const score = overallScore.value;
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '一般';
  return '需改进';
});

// 方法
const startTest = () => {
  startTime.value = Date.now();
  startTimer();
  
  if (testType.value === 'visual') {
    startVisualSearch();
  } else if (testType.value === 'sustained') {
    startSustainedAttention();
  } else if (testType.value === 'selective') {
    startSelectiveAttention();
  }
};

const startTimer = () => {
  timer.value = setInterval(() => {
    timeRemaining.value--;
    if (timeRemaining.value <= 0) {
      endCurrentTest();
    }
  }, 1000);
};

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

// 视觉搜索测试
const startVisualSearch = () => {
  phase.value = 'visual-search';
  generateSearchTask();
};

const generateSearchTask = () => {
  const difficulty = props.settings.difficulty;
  const config = {
    easy: { gridSize: 36, targetCount: 3, distractorSimilarity: 0.3 },
    medium: { gridSize: 64, targetCount: 5, distractorSimilarity: 0.5 },
    hard: { gridSize: 100, targetCount: 8, distractorSimilarity: 0.7 },
    expert: { gridSize: 144, targetCount: 12, distractorSimilarity: 0.9 }
  };
  
  const difficultyConfig = config[difficulty] || config.medium;
  currentTarget.value = symbols[Math.floor(Math.random() * symbols.length)];
  totalTargets.value = difficultyConfig.targetCount;
  foundTargets.value = 0;
  
  searchItems.value = [];
  
  // 添加目标
  for (let i = 0; i < difficultyConfig.targetCount; i++) {
    searchItems.value.push({
      symbol: currentTarget.value,
      isTarget: true,
      found: false,
      clicked: false
    });
  }
  
  // 添加干扰项
  while (searchItems.value.length < difficultyConfig.gridSize) {
    let distractor;
    if (Math.random() < difficultyConfig.distractorSimilarity) {
      // 相似干扰项
      const similarSymbols = symbols.filter(s => s !== currentTarget.value);
      distractor = similarSymbols[Math.floor(Math.random() * similarSymbols.length)];
    } else {
      // 不同干扰项
      distractor = symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    searchItems.value.push({
      symbol: distractor,
      isTarget: false,
      found: false,
      clicked: false
    });
  }
  
  // 打乱顺序
  searchItems.value = searchItems.value.sort(() => Math.random() - 0.5);
};

const clickSearchItem = (index) => {
  const item = searchItems.value[index];
  const reactionTime = Date.now() - startTime.value;
  
  item.clicked = true;
  
  if (item.isTarget) {
    item.found = true;
    foundTargets.value++;
    currentScore.value += 10;
    
    searchResults.value.push({
      correct: true,
      reactionTime,
      targetFound: true
    });
    
    if (foundTargets.value >= totalTargets.value) {
      setTimeout(() => {
        nextTestPhase();
      }, 500);
    }
  } else {
    currentScore.value = Math.max(0, currentScore.value - 2);
    
    searchResults.value.push({
      correct: false,
      reactionTime,
      falseAlarm: true
    });
  }
  
  emit('answer-submitted', {
    type: 'visual-search',
    correct: item.isTarget,
    reactionTime
  });
};

// 持续注意测试
const startSustainedAttention = () => {
  phase.value = 'sustained-attention';
  sustainedTarget.value = symbols[Math.floor(Math.random() * symbols.length)];
  startStimulusSequence();
};

const startStimulusSequence = () => {
  const presentStimulus = () => {
    if (phase.value !== 'sustained-attention') return;
    
    const isTarget = Math.random() < 0.3; // 30% 概率出现目标
    currentStimulus.value = isTarget ? sustainedTarget.value : symbols[Math.floor(Math.random() * symbols.length)];
    showStimulus.value = true;
    
    const stimulusStartTime = Date.now();
    let responded = false;
    
    const hideStimulus = () => {
      showStimulus.value = false;
      
      if (isTarget && !responded) {
        sustainedMisses.value++;
        sustainedResults.value.push({
          correct: false,
          missed: true,
          reactionTime: 0
        });
      }
      
      // 下一个刺激
      setTimeout(() => {
        if (phase.value === 'sustained-attention') {
          presentStimulus();
        }
      }, Math.random() * 2000 + 1000); // 1-3秒间隔
    };
    
    // 点击处理
    const handleClick = () => {
      if (!showStimulus.value || responded) return;
      
      responded = true;
      const reactionTime = Date.now() - stimulusStartTime;
      
      if (isTarget) {
        sustainedCorrect.value++;
        currentScore.value += 5;
        sustainedResults.value.push({
          correct: true,
          reactionTime
        });
      } else {
        sustainedErrors.value++;
        currentScore.value = Math.max(0, currentScore.value - 3);
        sustainedResults.value.push({
          correct: false,
          falseAlarm: true,
          reactionTime
        });
      }
      
      emit('answer-submitted', {
        type: 'sustained-attention',
        correct: isTarget,
        reactionTime
      });
    };
    
    // 添加点击监听
    const stimulusArea = document.querySelector('.stimulus-area');
    if (stimulusArea) {
      stimulusArea.onclick = handleClick;
    }
    
    // 1.5秒后隐藏刺激
    setTimeout(hideStimulus, 1500);
  };
  
  presentStimulus();
};

// 选择注意测试
const startSelectiveAttention = () => {
  phase.value = 'selective-attention';
  generateSelectiveTask();
};

const generateSelectiveTask = () => {
  selectiveTarget.value = symbols[Math.floor(Math.random() * symbols.length)];
  targetColor.value = colors[Math.floor(Math.random() * colors.length)];
  
  const difficulty = props.settings.difficulty;
  const config = {
    easy: { itemCount: 20, targetRatio: 0.3 },
    medium: { itemCount: 36, targetRatio: 0.25 },
    hard: { itemCount: 64, targetRatio: 0.2 },
    expert: { itemCount: 100, targetRatio: 0.15 }
  };
  
  const difficultyConfig = config[difficulty] || config.medium;
  const targetCount = Math.floor(difficultyConfig.itemCount * difficultyConfig.targetRatio);
  
  selectiveItems.value = [];
  
  // 添加目标项
  for (let i = 0; i < targetCount; i++) {
    selectiveItems.value.push({
      symbol: selectiveTarget.value,
      color: targetColor.value,
      isTarget: true,
      clicked: false
    });
  }
  
  // 添加干扰项
  while (selectiveItems.value.length < difficultyConfig.itemCount) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // 确保不是目标组合
    if (!(symbol === selectiveTarget.value && color === targetColor.value)) {
      selectiveItems.value.push({
        symbol,
        color,
        isTarget: false,
        clicked: false
      });
    }
  }
  
  // 打乱顺序
  selectiveItems.value = selectiveItems.value.sort(() => Math.random() - 0.5);
};

const clickSelectiveItem = (index) => {
  const item = selectiveItems.value[index];
  const reactionTime = Date.now() - startTime.value;
  
  item.clicked = true;
  
  if (item.isTarget) {
    selectiveCorrect.value++;
    currentScore.value += 8;
  } else {
    selectiveErrors.value++;
    currentScore.value = Math.max(0, currentScore.value - 4);
  }
  
  selectiveResults.value.push({
    correct: item.isTarget,
    reactionTime
  });
  
  emit('answer-submitted', {
    type: 'selective-attention',
    correct: item.isTarget,
    reactionTime
  });
  
  // 检查是否完成所有目标
  const allTargetsFound = selectiveItems.value.filter(item => item.isTarget).every(item => item.clicked);
  if (allTargetsFound) {
    setTimeout(() => {
      endCurrentTest();
    }, 500);
  }
};

const nextTestPhase = () => {
  if (testType.value === 'visual') {
    testType.value = 'sustained';
    startSustainedAttention();
  } else if (testType.value === 'sustained') {
    testType.value = 'selective';
    startSelectiveAttention();
  } else {
    endCurrentTest();
  }
};

const endCurrentTest = () => {
  stopTimer();
  if (stimulusTimer.value) {
    clearInterval(stimulusTimer.value);
  }
  
  phase.value = 'results';
  
  const result = {
    score: overallScore.value,
    accuracy: overallAccuracy.value,
    reactionTime: averageReactionTime.value,
    attentionLevel: attentionLevel.value,
    timeUsed: 180 - timeRemaining.value,
    difficulty: props.settings.difficulty,
    testResults: testResults.value,
    feedback: generateOverallFeedback()
  };
  
  setTimeout(() => {
    emit('test-completed', result);
  }, 3000);
};

const generateVisualFeedback = (accuracy, reactionTime) => {
  if (accuracy >= 90 && reactionTime < 2000) {
    return '优秀的视觉搜索能力，能够快速准确地定位目标。';
  } else if (accuracy >= 80) {
    return '良好的视觉搜索能力，大部分情况下能准确找到目标。';
  } else {
    return '视觉搜索能力需要提高，建议多做相关训练。';
  }
};

const generateSustainedFeedback = (accuracy, errors) => {
  if (accuracy >= 85 && errors < 5) {
    return '优秀的持续注意力，能够长时间保持专注。';
  } else if (accuracy >= 70) {
    return '良好的持续注意力，大部分时间能保持专注。';
  } else {
    return '持续注意力需要改善，建议进行专注力训练。';
  }
};

const generateSelectiveFeedback = (accuracy, errors) => {
  if (accuracy >= 90 && errors < 3) {
    return '优秀的选择注意力，能够有效过滤干扰信息。';
  } else if (accuracy >= 75) {
    return '良好的选择注意力，能够较好地专注于目标。';
  } else {
    return '选择注意力需要提高，建议加强抗干扰训练。';
  }
};

const generateOverallFeedback = () => {
  const score = overallScore.value;
  if (score >= 90) {
    return '优秀！您的注意力水平非常高，各项指标都表现出色。';
  } else if (score >= 80) {
    return '良好！您的注意力水平较高，在大多数任务中表现良好。';
  } else if (score >= 70) {
    return '一般！您的注意力水平处于平均水平，建议针对性训练。';
  } else {
    return '需要改进！建议加强注意力训练，提高专注度和抗干扰能力。';
  }
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 生命周期
onMounted(() => {
  const difficulty = props.settings.difficulty;
  const config = {
    easy: { duration: 240 },
    medium: { duration: 180 },
    hard: { duration: 120 },
    expert: { duration: 90 }
  };
  
  const difficultyConfig = config[difficulty] || config.medium;
  timeRemaining.value = difficultyConfig.duration;
});

onUnmounted(() => {
  stopTimer();
  if (stimulusTimer.value) {
    clearInterval(stimulusTimer.value);
  }
});
</script>

<style scoped>
.attention-test {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem;
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

.score-counter {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  color: #28a745;
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

.test-types {
  margin: 2rem 0;
}

.test-types h5 {
  margin-bottom: 1rem;
  color: #333;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.type-card {
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.type-card:hover {
  border-color: var(--color-primary);
  background: #f8f9ff;
}

.type-card.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.type-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.type-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.type-desc {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 视觉搜索阶段 */
.visual-search-phase {
  padding: 1rem;
}

.task-instruction {
  text-align: center;
  margin-bottom: 2rem;
}

.target-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid var(--color-primary);
}

.target-label {
  font-weight: bold;
  color: #333;
}

.target-symbol {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary);
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
}

.target-count {
  font-weight: bold;
  color: #666;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 0.5rem;
  margin: 2rem 0;
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.search-item {
  width: 60px;
  height: 60px;
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

.search-item:hover {
  border-color: var(--color-primary);
  background: #f8f9ff;
}

.search-item.found {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.search-item.distractor {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
}

.search-progress {
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: bold;
  color: #666;
}

/* 持续注意阶段 */
.sustained-attention-phase {
  padding: 2rem;
  text-align: center;
}

.stimulus-area {
  margin: 3rem 0;
}

.stimulus-display {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  border: 3px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stimulus-display.active {
  border-color: var(--color-primary);
  background: white;
}

.stimulus-symbol {
  font-size: 4rem;
  font-weight: bold;
  color: var(--color-primary);
}

.sustained-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

.stat-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

/* 选择注意阶段 */
.selective-attention-phase {
  padding: 1rem;
}

.highlight-color {
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.8);
}

.selective-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.selective-item {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.selective-item:hover {
  border-color: var(--color-primary);
  background: #f8f9ff;
}

.selective-item.correct {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.selective-item.incorrect {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
}

.selective-progress {
  text-align: center;
  margin-top: 1rem;
}

.progress-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-weight: bold;
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

.detailed-results {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.detailed-results h4 {
  margin-bottom: 1.5rem;
  color: #333;
}

.test-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.test-result-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--color-primary);
  text-align: left;
}

.test-result-card h5 {
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.result-metrics {
  margin-bottom: 1rem;
}

.metric {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.metric-label {
  color: #666;
}

.metric-value {
  font-weight: bold;
  color: #333;
}

.result-feedback {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
  font-style: italic;
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

/* 大笔记本屏幕优化 (1367px - 1600px) */
@media (min-width: 1367px) and (max-width: 1600px) {
  .attention-test {
    max-width: 1150px;
    padding: 2rem;
  }
  
  .test-content {
    padding: 2rem;
  }
  
  .test-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
  }
  
  .type-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    max-width: 750px;
  }
  
  .type-card {
    padding: 1.5rem;
  }
  
  .search-grid {
    grid-template-columns: repeat(auto-fit, minmax(58px, 1fr));
    gap: 0.5rem;
    max-height: 500px;
    padding: 1rem;
  }
  
  .search-item {
    width: 58px;
    height: 58px;
    font-size: 1.5rem;
  }
  
  .selective-grid {
    grid-template-columns: repeat(auto-fit, minmax(78px, 1fr));
    gap: 1rem;
    max-height: 500px;
    padding: 1rem;
  }
  
  .selective-item {
    width: 78px;
    height: 78px;
    font-size: 1.9rem;
  }
  
  .stimulus-display {
    width: 200px;
    height: 200px;
  }
  
  .stimulus-symbol {
    font-size: 4rem;
  }
  
  .sustained-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  
  .final-stats {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
  
  .stat-card {
    padding: 1.5rem;
  }
  
  .test-results-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .test-result-card {
    padding: 1.5rem;
  }
}

/* 中等笔记本屏幕优化 (1281px - 1366px) */
@media (min-width: 1281px) and (max-width: 1366px) {
  .attention-test {
    max-width: 1100px;
    padding: 1.8rem;
  }
  
  .test-content {
    padding: 1.8rem;
  }
  
  .test-header {
    margin-bottom: 1.8rem;
    padding-bottom: 0.8rem;
  }
  
  .type-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
    max-width: 700px;
  }
  
  .type-card {
    padding: 1.2rem;
  }
  
  .search-grid {
    grid-template-columns: repeat(auto-fit, minmax(55px, 1fr));
    gap: 0.4rem;
    max-height: 450px;
    padding: 0.8rem;
  }
  
  .search-item {
    width: 55px;
    height: 55px;
    font-size: 1.4rem;
  }
  
  .selective-grid {
    grid-template-columns: repeat(auto-fit, minmax(75px, 1fr));
    gap: 0.8rem;
    max-height: 450px;
    padding: 0.8rem;
  }
  
  .selective-item {
    width: 75px;
    height: 75px;
    font-size: 1.8rem;
  }
  
  .stimulus-display {
    width: 180px;
    height: 180px;
  }
  
  .stimulus-symbol {
    font-size: 3.5rem;
  }
  
  .sustained-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
  }
  
  .final-stats {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.2rem;
  }
  
  .stat-card {
    padding: 1.2rem;
  }
  
  .test-results-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.2rem;
  }
  
  .test-result-card {
    padding: 1.2rem;
  }
}

/* 小笔记本屏幕优化 (1024px - 1280px) */
@media (min-width: 1024px) and (max-width: 1280px) {
  .attention-test {
    max-width: 1000px;
    padding: 1.5rem;
  }
  
  .test-content {
    padding: 1.5rem;
  }
  
  .test-header {
    margin-bottom: 1.5rem;
    padding-bottom: 0.6rem;
  }
  
  .type-grid {
    max-width: 650px;
    gap: 1rem;
  }
  
  .type-card {
    padding: 1rem;
  }
  
  .search-grid {
    grid-template-columns: repeat(auto-fit, minmax(48px, 1fr));
    gap: 0.3rem;
    max-height: 380px;
    padding: 0.6rem;
  }
  
  .search-item {
    width: 48px;
    height: 48px;
    font-size: 1.2rem;
  }
  
  .selective-grid {
    grid-template-columns: repeat(auto-fit, minmax(68px, 1fr));
    gap: 0.6rem;
    max-height: 380px;
    padding: 0.6rem;
  }
  
  .selective-item {
    width: 68px;
    height: 68px;
    font-size: 1.6rem;
  }
  
  .stimulus-display {
    width: 160px;
    height: 160px;
  }
  
  .stimulus-symbol {
    font-size: 3rem;
  }
  
  .sustained-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  
  .final-stats {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .test-results-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
  }
  
  .test-result-card {
    padding: 1rem;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .type-grid {
    grid-template-columns: 1fr;
  }
  
  .final-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .test-results-grid {
    grid-template-columns: 1fr;
  }
  
  .search-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .selective-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>