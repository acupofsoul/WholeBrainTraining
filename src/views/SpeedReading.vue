<template>
  <div class="speed-reading-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-nav" v-if="$route.path !== '/speed-reading'">
      <button class="back-arrow" @click="goBack">←</button>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item">速读训练</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">{{ getModuleTitle($route.path) }}</span>
    </div>

    <!-- 主页面内容 -->
    <div v-if="$route.path === '/speed-reading'">
      <div class="page-header">
        <h1>速读训练</h1>
        <p class="page-description">
          速读训练是全脑开发的高级阶段，通过科学的训练方法提升阅读速度和理解能力，
          培养高效的信息处理技能，为学习和工作打下坚实基础。
        </p>
      </div>

      <div class="training-modules">
        <div class="module-card" @click="navigateTo('article-reading')">
          <div class="module-icon">📚</div>
          <h3>文章阅读训练</h3>
          <p>通过各类文章的快速阅读练习，提升阅读速度和理解能力</p>
          <div class="module-level">难度：⭐⭐⭐</div>
          <div class="module-stats">
            <div class="stat-row">
              <span>当前速度：{{ articleStats.currentSpeed }} 字/分</span>
              <span>最佳速度：{{ articleStats.bestSpeed }} 字/分</span>
            </div>
            <div class="stat-row">
              <span>理解率：{{ articleStats.comprehension }}%</span>
              <span>完成文章：{{ articleStats.completed }}篇</span>
            </div>
          </div>
        </div>

        <div class="module-card" @click="navigateTo('3d-reading')">
          <div class="module-icon">🔮</div>
          <h3>3D图阅读训练</h3>
          <p>通过立体视觉训练，开发右脑空间感知能力，提升整体阅读效率</p>
          <div class="module-level">难度：⭐⭐⭐⭐</div>
          <div class="module-stats">
            <div class="stat-row">
              <span>识别准确率：{{ threeDStats.accuracy }}%</span>
              <span>平均用时：{{ threeDStats.averageTime }}秒</span>
            </div>
            <div class="stat-row">
              <span>完成训练：{{ threeDStats.completed }}次</span>
              <span>最佳记录：{{ threeDStats.bestTime }}秒</span>
            </div>
          </div>
        </div>
      </div>

    <div class="reading-goals">
      <h3>阅读目标设定</h3>
      <div class="goals-grid">
        <div class="goal-item">
          <label>目标阅读速度</label>
          <div class="goal-input">
            <input type="number" v-model="targetSpeed" min="200" max="2000" step="50">
            <span>字/分钟</span>
          </div>
        </div>
        
        <div class="goal-item">
          <label>目标理解率</label>
          <div class="goal-input">
            <input type="number" v-model="targetComprehension" min="60" max="100" step="5">
            <span>%</span>
          </div>
        </div>
        
        <div class="goal-item">
          <label>每日训练时间</label>
          <div class="goal-input">
            <input type="number" v-model="dailyTrainingTime" min="10" max="120" step="5">
            <span>分钟</span>
          </div>
        </div>
        
        <div class="goal-item">
          <label>训练周期</label>
          <select v-model="trainingCycle">
            <option value="1">1周</option>
            <option value="2">2周</option>
            <option value="4">1个月</option>
            <option value="12">3个月</option>
          </select>
        </div>
      </div>
      
      <button class="save-goals-btn" @click="saveGoals">
        <span>💾</span>
        保存目标
      </button>
    </div>

    <!-- 进度追踪组件 -->
    <SpeedReadingProgress />

    <div class="reading-techniques">
      <h3>速读技巧指导</h3>
      <div class="techniques-grid">
        <div class="technique-card">
          <div class="technique-icon">👁️</div>
          <h4>视野扩展</h4>
          <p>训练眼睛一次性捕捉更多文字，减少眼球移动次数，提高阅读效率。</p>
          <ul>
            <li>练习用余光感知文字</li>
            <li>逐步扩大视觉范围</li>
            <li>避免逐字阅读</li>
          </ul>
        </div>
        
        <div class="technique-card">
          <div class="technique-icon">🧠</div>
          <h4>整体理解</h4>
          <p>培养快速抓取文章主旨和关键信息的能力，提升理解效率。</p>
          <ul>
            <li>先浏览文章结构</li>
            <li>识别关键词句</li>
            <li>建立信息框架</li>
          </ul>
        </div>
        
        <div class="technique-card">
          <div class="technique-icon">⚡</div>
          <h4>节奏控制</h4>
          <p>掌握合适的阅读节奏，在速度和理解之间找到最佳平衡点。</p>
          <ul>
            <li>根据内容调整速度</li>
            <li>重点内容适当放慢</li>
            <li>保持稳定节奏</li>
          </ul>
        </div>
        
        <div class="technique-card">
          <div class="technique-icon">🎯</div>
          <h4>专注训练</h4>
          <p>提高注意力集中度，减少阅读过程中的干扰和回视现象。</p>
          <ul>
            <li>创造安静环境</li>
            <li>避免内心默读</li>
            <li>保持专注状态</li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="training-controls">
      <div class="form-group">
        <label class="form-label">阅读速度 (字/分钟)</label>
        <input 
          type="range" 
          v-model.number="readingSpeed" 
          min="100" 
          max="1000" 
          step="50" 
          class="form-control" 
          :disabled="isTraining"
        >
        <div class="speed-value">{{ readingSpeed }} 字/分钟</div>
      </div>
      
      <div class="form-group">
        <label class="form-label">显示模式</label>
        <select v-model="displayMode" class="form-control" :disabled="isTraining">
          <option value="word">单词模式</option>
          <option value="chunk">短语模式</option>
          <option value="line">行模式</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">文本选择</label>
        <select v-model="selectedTextIndex" class="form-control" :disabled="isTraining">
          <option v-for="(text, index) in availableTexts" :key="index" :value="index">
            {{ text.title }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="training-stats" v-if="isTraining || hasCompleted">
      <div class="stat-item">
        <div class="stat-value">{{ formatTime(elapsedTime) }}</div>
        <div class="stat-label">用时</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ Math.round(progress * 100) }}%</div>
        <div class="stat-label">进度</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ currentWordIndex }} / {{ totalWords }}</div>
        <div class="stat-label">单词</div>
      </div>
    </div>
    
    <div class="reading-actions">
      <button 
        v-if="!isTraining" 
        @click="startTraining" 
        class="btn btn-primary btn-lg"
      >
        开始训练
      </button>
      <button 
        v-else-if="!isPaused" 
        @click="pauseTraining" 
        class="btn btn-secondary btn-lg"
      >
        暂停
      </button>
      <button 
        v-else-if="isPaused && !hasCompleted" 
        @click="resumeTraining" 
        class="btn btn-primary btn-lg"
      >
        继续
      </button>
      <button 
        v-if="isTraining" 
        @click="stopTraining" 
        class="btn btn-danger btn-lg"
      >
        停止
      </button>
      <button 
        v-if="hasCompleted" 
        @click="resetTraining" 
        class="btn btn-primary btn-lg"
      >
        再次训练
      </button>
    </div>
    
    <div class="reading-display" v-if="isTraining && !hasCompleted && !isPaused">
      <div class="reading-content" :class="displayMode">
        <div v-if="displayMode === 'word'" class="word-display">
          {{ currentContent }}
        </div>
        <div v-else-if="displayMode === 'chunk'" class="chunk-display">
          {{ currentContent }}
        </div>
        <div v-else-if="displayMode === 'line'" class="line-display">
          {{ currentContent }}
        </div>
      </div>
    </div>
    
    <div class="reading-preview" v-if="!isTraining || isPaused">
      <div class="card">
        <h3 class="card-title">{{ currentText.title }}</h3>
        <div class="card-content">
          <p class="text-preview">{{ getTextPreview() }}</p>
        </div>
      </div>
    </div>
    
    <div class="comprehension-test" v-if="hasCompleted">
      <div class="card">
        <h3 class="card-title">阅读理解测试</h3>
        <div class="card-content">
          <div v-for="(question, index) in currentText.questions" :key="index" class="question-item">
            <p class="question-text">{{ index + 1 }}. {{ question.text }}</p>
            <div class="options-list">
              <div 
                v-for="(option, optIndex) in question.options" 
                :key="optIndex"
                class="option-item"
              >
                <label class="option-label">
                  <input 
                    type="radio" 
                    :name="`question-${index}`" 
                    :value="optIndex" 
                    v-model="userAnswers[index]"
                  >
                  {{ option }}
                </label>
              </div>
            </div>
          </div>
          
          <div class="test-actions">
            <button @click="checkAnswers" class="btn btn-primary" :disabled="!canSubmitAnswers">
              提交答案
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="test-results" v-if="showResults">
      <div class="card">
        <h3 class="card-title">测试结果</h3>
        <div class="card-content">
          <div class="result-summary">
            <p>正确率: {{ correctPercentage }}%</p>
            <p>阅读速度: {{ readingSpeed }} 字/分钟</p>
            <p>阅读时间: {{ formatTime(readingTime) }}</p>
            <p>有效阅读速度: {{ effectiveReadingSpeed }} 字/分钟</p>
          </div>
          
          <div class="result-details">
            <h4>详细答案</h4>
            <div v-for="(question, index) in currentText.questions" :key="index" class="answer-item">
              <p :class="{'correct': userAnswers[index] === question.correctAnswer, 'incorrect': userAnswers[index] !== question.correctAnswer}">
                {{ index + 1 }}. {{ question.text }}
              </p>
              <p class="correct-answer" v-if="userAnswers[index] !== question.correctAnswer">
                正确答案: {{ question.options[question.correctAnswer] }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="training-instructions" v-if="!isTraining && !hasCompleted">
      <div class="card">
        <h3 class="card-title">训练说明</h3>
        <div class="card-content">
          <p>速读训练是一种提高阅读速度和理解力的训练方法。</p>
          <p>训练目标：提高阅读速度的同时保持良好的理解力。</p>
          <p>训练方法：</p>
          <ol>
            <li>选择适合的阅读速度和显示模式</li>
            <li>专注于屏幕中央显示的内容</li>
            <li>尝试理解内容而不进行回读</li>
            <li>训练结束后完成理解测试</li>
          </ol>
          <p>显示模式说明：</p>
          <ul>
            <li><strong>单词模式</strong>：一次显示一个单词，适合初学者</li>
            <li><strong>短语模式</strong>：一次显示多个单词，提高阅读效率</li>
            <li><strong>行模式</strong>：一次显示一行文本，接近自然阅读</li>
          </ul>
          <p>建议：从较低速度开始，逐渐提高，每天训练15-20分钟。</p>
        </div>
      </div>
    </div>
    </div>

    <!-- 子路由内容 -->
    <router-view v-if="$route.path !== '/speed-reading'" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTrainingStore } from '../stores';
import SpeedReadingProgress from '../components/SpeedReadingProgress.vue';

const router = useRouter();
const route = useRoute();
const trainingStore = useTrainingStore();

// 目标设定
const targetSpeed = ref(800);
const targetComprehension = ref(80);
const dailyTrainingTime = ref(30);
const trainingCycle = ref('4');

// 统计数据
const articleStats = ref({
  currentSpeed: 0,
  bestSpeed: 0,
  comprehension: 0,
  completed: 0
});

const threeDStats = ref({
  accuracy: 0,
  averageTime: 0,
  completed: 0,
  bestTime: 0
});

// 进度数据由SpeedReadingProgress组件处理

// 训练配置
const readingSpeed = ref(300); // 默认300字/分钟
const displayMode = ref('word'); // 默认单词模式
const selectedTextIndex = ref(0);

// 训练状态
const isTraining = ref(false);
const isPaused = ref(false);
const hasCompleted = ref(false);
const elapsedTime = ref(0);
const readingTime = ref(0);
const currentWordIndex = ref(0);
const currentContent = ref('');
const progress = ref(0);

// 测试相关
const userAnswers = ref([]);
const showResults = ref(false);
const correctAnswers = ref(0);
const correctPercentage = ref(0);
const effectiveReadingSpeed = ref(0);

// 计时器和间隔器
let timer = null;
let displayInterval = null;

// 示例文本
const availableTexts = ref([
  {
    title: '人工智能的发展',
    content: `人工智能(AI)是计算机科学的一个分支，它致力于创造能够模拟人类智能的机器。自20世纪50年代人工智能概念提出以来，这一领域经历了多次起伏。早期的AI研究主要集中在解决问题和符号处理上，如专家系统和逻辑推理。

80年代至90年代，机器学习开始兴起，特别是神经网络的应用，为AI的发展注入了新的活力。进入21世纪，随着计算能力的提升和大数据的出现，深度学习技术取得了突破性进展。2012年，深度神经网络在ImageNet竞赛中的惊人表现标志着深度学习时代的到来。

如今，AI已经渗透到我们生活的方方面面，从语音助手、推荐系统到自动驾驶汽车。自然语言处理技术使机器能够理解和生成人类语言，计算机视觉让机器能够"看见"世界，强化学习则使AI能够在复杂环境中做出决策。

尽管AI取得了令人瞩目的成就，但它仍面临许多挑战，如解释性问题、伦理考量以及与人类价值观的对齐。未来，随着量子计算、神经形态计算等新技术的发展，AI有望取得更大的突破，可能最终实现通用人工智能(AGI)，即具有与人类相当或超越人类的智能水平。`,
    words: [],
    questions: [
      {
        text: '人工智能研究早期主要集中在哪些方面？',
        options: ['深度学习和神经网络', '解决问题和符号处理', '自动驾驶和语音识别', '量子计算和神经形态计算'],
        correctAnswer: 1
      },
      {
        text: '什么事件标志着深度学习时代的到来？',
        options: ['20世纪50年代人工智能概念的提出', '80年代至90年代机器学习的兴起', '2012年深度神经网络在ImageNet竞赛中的表现', '量子计算技术的发展'],
        correctAnswer: 2
      },
      {
        text: '当前AI面临的挑战包括哪些？',
        options: ['计算能力不足', '解释性问题、伦理考量和与人类价值观的对齐', '缺乏应用场景', '无法处理图像数据'],
        correctAnswer: 1
      },
      {
        text: 'AGI代表什么？',
        options: ['人工通用智能', '自动生成智能', '高级图形接口', '自适应遗传算法'],
        correctAnswer: 0
      },
      {
        text: '文章中提到的AI应用包括哪些？',
        options: ['仅语音助手', '仅自动驾驶汽车', '语音助手、推荐系统和自动驾驶汽车', '量子计算和区块链'],
        correctAnswer: 2
      }
    ]
  },
  {
    title: '健康生活方式的重要性',
    content: `在现代社会，随着生活节奏的加快和工作压力的增加，越来越多的人开始关注健康生活方式的重要性。健康的生活方式不仅能预防疾病，延长寿命，还能提高生活质量，增强幸福感。

健康生活的第一个关键要素是均衡的饮食。营养学家建议，我们应该摄入多样化的食物，包括充足的蔬菜水果、全谷物、优质蛋白质和健康脂肪。减少加工食品、糖和盐的摄入也非常重要。地中海饮食被广泛认为是最健康的饮食模式之一，它强调橄榄油、鱼类、坚果和新鲜蔬果的摄入。

规律的体育锻炼是健康生活的第二个支柱。世界卫生组织建议成年人每周至少进行150分钟中等强度或75分钟高强度的有氧运动，并进行肌肉强化训练。运动不仅能控制体重，还能改善心血管健康，增强免疫系统，甚至对心理健康有积极影响。

充足的睡眠对健康同样至关重要。大多数成年人需要7-9小时的睡眠才能保持最佳状态。良好的睡眠有助于修复身体，巩固记忆，调节情绪和荷尔蒙。建立规律的睡眠时间表，创造舒适的睡眠环境，避免睡前使用电子设备都有助于提高睡眠质量。

最后，心理健康也是整体健康不可或缺的部分。学会管理压力，培养积极的思维方式，保持社交联系，以及寻求专业帮助（如有需要）都是维护心理健康的重要策略。冥想、瑜伽和深呼吸等放松技巧也被证明对减轻压力和焦虑有效。

采纳健康的生活方式需要时间和努力，但长期坚持的回报是巨大的。通过小步骤逐渐改变，每个人都能朝着更健康、更充实的生活迈进。`,
    words: [],
    questions: [
      {
        text: '文章提到的健康生活方式的关键要素不包括哪一项？',
        options: ['均衡的饮食', '规律的体育锻炼', '充足的睡眠', '定期服用保健品'],
        correctAnswer: 3
      },
      {
        text: '世界卫生组织建议成年人每周至少进行多少分钟的中等强度有氧运动？',
        options: ['60分钟', '100分钟', '150分钟', '200分钟'],
        correctAnswer: 2
      },
      {
        text: '根据文章，大多数成年人需要多少小时的睡眠才能保持最佳状态？',
        options: ['5-6小时', '6-7小时', '7-9小时', '9-10小时'],
        correctAnswer: 2
      },
      {
        text: '文章认为哪种饮食模式是最健康的饮食模式之一？',
        options: ['素食主义饮食', '生酮饮食', '地中海饮食', '间歇性禁食'],
        correctAnswer: 2
      },
      {
        text: '根据文章，以下哪项不是维护心理健康的策略？',
        options: ['学会管理压力', '保持社交联系', '避免任何形式的压力', '冥想和瑜伽'],
        correctAnswer: 2
      }
    ]
  }
]);

// 预处理文本，分割成单词
const preprocessTexts = () => {
  availableTexts.value.forEach(text => {
    // 简单分割文本为单词（这里简化处理，实际应用中可能需要更复杂的分词）
    text.words = text.content.split(/\s+/);
  });
};

// 当前选中的文本
const currentText = computed(() => {
  return availableTexts.value[selectedTextIndex.value];
});

// 总单词数
const totalWords = computed(() => {
  return currentText.value.words.length;
});

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 获取文本预览
const getTextPreview = () => {
  const maxLength = 300;
  if (currentText.value.content.length <= maxLength) {
    return currentText.value.content;
  }
  return currentText.value.content.substring(0, maxLength) + '...';
};

// 开始训练
const startTraining = () => {
  isTraining.value = true;
  isPaused.value = false;
  hasCompleted.value = false;
  elapsedTime.value = 0;
  currentWordIndex.value = 0;
  progress.value = 0;
  showResults.value = false;
  userAnswers.value = new Array(currentText.value.questions.length).fill(null);
  
  // 启动计时器
  timer = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
  
  // 计算显示间隔（毫秒）
  const intervalMs = calculateInterval();
  
  // 启动显示间隔器
  displayInterval = setInterval(() => {
    updateDisplay();
  }, intervalMs);
};

// 暂停训练
const pauseTraining = () => {
  isPaused.value = true;
  clearInterval(displayInterval);
};

// 继续训练
const resumeTraining = () => {
  isPaused.value = false;
  
  // 重新计算显示间隔
  const intervalMs = calculateInterval();
  
  // 重启显示间隔器
  displayInterval = setInterval(() => {
    updateDisplay();
  }, intervalMs);
};

// 停止训练
const stopTraining = () => {
  isTraining.value = false;
  isPaused.value = false;
  clearInterval(timer);
  clearInterval(displayInterval);
  timer = null;
  displayInterval = null;
  
  // 如果进度超过50%，显示理解测试
  if (progress.value > 0.5) {
    hasCompleted.value = true;
    readingTime.value = elapsedTime.value;
  } else {
    // 否则重置训练
    resetTraining();
  }
};

// 重置训练
const resetTraining = () => {
  isTraining.value = false;
  isPaused.value = false;
  hasCompleted.value = false;
  elapsedTime.value = 0;
  readingTime.value = 0;
  currentWordIndex.value = 0;
  progress.value = 0;
  currentContent.value = '';
  showResults.value = false;
  userAnswers.value = [];
};

// 计算显示间隔
const calculateInterval = () => {
  // 根据阅读速度计算每分钟显示的单词数
  const wordsPerMinute = readingSpeed.value;
  
  // 转换为每毫秒显示的单词数
  const wordsPerMs = wordsPerMinute / (60 * 1000);
  
  // 计算每个单词/块的显示时间（毫秒）
  let intervalMs = 1 / wordsPerMs;
  
  // 根据显示模式调整间隔
  if (displayMode.value === 'chunk') {
    // 短语模式显示3-5个单词，所以间隔要长一些
    intervalMs = intervalMs * 4;
  } else if (displayMode.value === 'line') {
    // 行模式显示更多单词，间隔更长
    intervalMs = intervalMs * 8;
  }
  
  return Math.round(intervalMs);
};

// 更新显示内容
const updateDisplay = () => {
  if (currentWordIndex.value >= totalWords.value) {
    // 训练完成
    completeTraining();
    return;
  }
  
  // 根据显示模式获取当前内容
  if (displayMode.value === 'word') {
    // 单词模式：显示单个单词
    currentContent.value = currentText.value.words[currentWordIndex.value];
    currentWordIndex.value++;
  } else if (displayMode.value === 'chunk') {
    // 短语模式：显示3-5个单词
    const chunkSize = Math.min(4, totalWords.value - currentWordIndex.value);
    const chunk = currentText.value.words.slice(
      currentWordIndex.value, 
      currentWordIndex.value + chunkSize
    ).join(' ');
    currentContent.value = chunk;
    currentWordIndex.value += chunkSize;
  } else if (displayMode.value === 'line') {
    // 行模式：显示一行（约8-12个单词）
    const lineSize = Math.min(10, totalWords.value - currentWordIndex.value);
    const line = currentText.value.words.slice(
      currentWordIndex.value, 
      currentWordIndex.value + lineSize
    ).join(' ');
    currentContent.value = line;
    currentWordIndex.value += lineSize;
  }
  
  // 更新进度
  progress.value = currentWordIndex.value / totalWords.value;
};

// 完成训练
const completeTraining = () => {
  hasCompleted.value = true;
  readingTime.value = elapsedTime.value;
  clearInterval(timer);
  clearInterval(displayInterval);
  timer = null;
  displayInterval = null;
  
  // 初始化答案数组
  userAnswers.value = new Array(currentText.value.questions.length).fill(null);
};

// 检查是否可以提交答案
const canSubmitAnswers = computed(() => {
  return userAnswers.value.every(answer => answer !== null);
});

// 检查答案
const checkAnswers = () => {
  correctAnswers.value = 0;
  
  // 计算正确答案数
  currentText.value.questions.forEach((question, index) => {
    if (userAnswers.value[index] === question.correctAnswer) {
      correctAnswers.value++;
    }
  });
  
  // 计算正确率
  correctPercentage.value = Math.round(
    (correctAnswers.value / currentText.value.questions.length) * 100
  );
  
  // 计算有效阅读速度（考虑理解率）
  effectiveReadingSpeed.value = Math.round(
    readingSpeed.value * (correctPercentage.value / 100)
  );
  
  // 显示结果
  showResults.value = true;
  
  // 保存训练结果到本地存储
  // 这部分将在实现本地存储功能时完成
};

// 监听显示模式变化，重新计算间隔
watch(displayMode, () => {
  if (isTraining.value && !isPaused.value) {
    clearInterval(displayInterval);
    const intervalMs = calculateInterval();
    displayInterval = setInterval(() => {
      updateDisplay();
    }, intervalMs);
  }
});

// 监听阅读速度变化，重新计算间隔
watch(readingSpeed, () => {
  if (isTraining.value && !isPaused.value) {
    clearInterval(displayInterval);
    const intervalMs = calculateInterval();
    displayInterval = setInterval(() => {
      updateDisplay();
    }, intervalMs);
  }
});

// maxSpeed计算已移至SpeedReadingProgress组件

// 导航到指定模块
const navigateTo = (viewName) => {
  router.push(`/speed-reading/${viewName}`);
};

// 返回主页面
const goBack = () => {
  router.push('/speed-reading');
};

// 模块标题映射
const moduleTitles = {
  '/speed-reading/article-reading': '文章阅读训练',
  '/speed-reading/3d-reading': '3D图阅读训练'
};

// 获取模块标题
const getModuleTitle = (path) => {
  return moduleTitles[path] || '速读训练';
};

// 保存目标
const saveGoals = () => {
  const goals = {
    targetSpeed: targetSpeed.value,
    targetComprehension: targetComprehension.value,
    dailyTrainingTime: dailyTrainingTime.value,
    trainingCycle: trainingCycle.value
  };
  localStorage.setItem('speedReadingGoals', JSON.stringify(goals));
  
  // 显示保存成功提示
  alert('目标设定已保存！');
};

// 加载目标设定
const loadGoals = () => {
  const saved = localStorage.getItem('speedReadingGoals');
  if (saved) {
    const goals = JSON.parse(saved);
    targetSpeed.value = goals.targetSpeed || 800;
    targetComprehension.value = goals.targetComprehension || 80;
    dailyTrainingTime.value = goals.dailyTrainingTime || 30;
    trainingCycle.value = goals.trainingCycle || '4';
  }
};

// 加载训练数据
const loadTrainingData = () => {
  // 从本地存储加载速读训练数据
  const saved = localStorage.getItem('speedReadingStats');
  let speedStats = {};
  
  if (saved) {
    speedStats = JSON.parse(saved);
  }
  
  // 文章阅读统计
  articleStats.value = {
    currentSpeed: speedStats.articleReading?.currentSpeed || 0,
    bestSpeed: speedStats.articleReading?.bestSpeed || 0,
    comprehension: speedStats.articleReading?.comprehension || 0,
    completed: speedStats.articleReading?.completed || 0
  };
  
  // 3D阅读统计
  threeDStats.value = {
    accuracy: speedStats.threeDReading?.accuracy || 0,
    averageTime: speedStats.threeDReading?.averageTime || 0,
    completed: speedStats.threeDReading?.completed || 0,
    bestTime: speedStats.threeDReading?.bestTime || 0
  };
  
  // 进度数据由SpeedReadingProgress组件处理
};

// 模拟趋势数据生成已移至SpeedReadingProgress组件



// 组件挂载时预处理文本
onMounted(() => {
  preprocessTexts();
  loadGoals();
  loadTrainingData();
});

// 组件卸载前清理计时器
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (displayInterval) {
    clearInterval(displayInterval);
    displayInterval = null;
  }
});
</script>

<style scoped>
.speed-reading-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--color-bg);
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: var(--color-card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.page-header h1 {
  color: var(--color-primary);
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.page-description {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

/* 训练模块网格 */
.training-modules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.module-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark));
  transform: scaleX(0);
  transition: transform var(--transition-normal) ease;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(var(--color-primary-rgb), 0.2);
}

.module-card:hover::before {
  transform: scaleX(1);
}

.module-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
  display: block;
}

.module-card h3 {
  color: var(--color-primary);
  font-size: 1.4rem;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 600;
}

.module-card p {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: center;
}

.module-level {
  background: linear-gradient(135deg, var(--color-warning), #ffb347);
  color: white;
  text-align: center;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1rem;
}

.module-stats {
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.stat-row:last-child {
  margin-bottom: 0;
}

.stat-row span {
  color: var(--color-text-secondary);
}

/* 阅读目标设定样式 */
.reading-goals {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
}

.reading-goals h3 {
  color: var(--color-primary);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.goal-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.goal-item label {
  color: var(--color-text-primary);
  font-weight: 500;
  font-size: 0.95rem;
}

.goal-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-input-bg);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem;
  transition: all var(--transition-normal) ease;
}

.goal-input:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.goal-input input,
.goal-input select {
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 1rem;
  flex: 1;
}

.goal-input span {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  white-space: nowrap;
}

.save-goals-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  margin: 0 auto;
  display: flex;
}

.save-goals-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.save-goals-btn:active {
  transform: translateY(0);
}

/* 面包屑导航样式 */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.breadcrumb-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
}

.back-arrow {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  width: auto;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1.1rem;
  font-weight: bold;
  margin-right: 0;
  padding: 0.75rem 1.25rem;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
}

.back-arrow::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.back-arrow:hover::before {
  left: 100%;
}

.back-arrow:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.back-arrow:active {
  transform: translateY(0);
}

.breadcrumb-separator {
  color: #94a3b8;
  font-size: 1.2rem;
  font-weight: 300;
  opacity: 0.7;
  margin: 0;
}

.breadcrumb-item {
  color: #64748b;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.breadcrumb-item:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

.breadcrumb-current {
  color: #1e40af;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  position: relative;
}

.breadcrumb-current::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(29, 78, 216, 0.05) 100%);
  border-radius: 10px;
  z-index: -1;
}

/* 模块内容样式 */
.module-content {
  width: 100%;
  min-height: 80vh;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.speed-value {
  text-align: center;
  margin-top: 0.5rem;
  font-weight: bold;
  color: var(--color-primary);
  font-size: 1.1rem;
}

/* 训练控制按钮 */
.reading-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.reading-actions button {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  min-width: 120px;
}

.reading-actions button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.reading-actions button:disabled {
  background: var(--color-text-muted);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 阅读显示区域 */
.reading-display {
  width: 100%;
  max-width: 800px;
  height: 200px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  border: 2px solid var(--color-border);
  transition: all var(--transition-normal) ease;
}

.reading-display:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.reading-content {
  text-align: center;
  padding: 2rem;
  width: 100%;
}

.word-display {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-primary);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chunk-display {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary);
  max-width: 80%;
  line-height: 1.4;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.line-display {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--color-primary);
  max-width: 90%;
  line-height: 1.4;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 阅读预览区域 */
.reading-preview {
  width: 100%;
  max-width: 800px;
  margin: 0 auto 2rem;
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 2px solid var(--color-border);
}

.text-preview {
  white-space: pre-line;
  line-height: 1.8;
  color: var(--color-text-primary);
  font-size: 1.1rem;
}

/* 理解测试样式 */
.comprehension-test {
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.question-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.question-text {
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  font-size: 1.1rem;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-left: 0;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 6px;
  transition: all var(--transition-normal) ease;
  background: var(--color-card-bg);
  border: 2px solid var(--color-border);
}

.option-label:hover {
  background: rgba(var(--color-primary-rgb), 0.1);
  border-color: var(--color-primary);
}

.option-label input[type="radio"] {
  accent-color: var(--color-primary);
}

/* 测试操作按钮 */
.test-actions {
  margin-top: 2rem;
  text-align: center;
}

.test-actions button {
  background: linear-gradient(135deg, var(--color-success), var(--color-success-dark));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
}

.test-actions button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* 测试结果样式 */
.test-results {
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.result-summary {
  background: linear-gradient(135deg, rgba(var(--color-success-rgb), 0.1), rgba(var(--color-info-rgb), 0.1));
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 2px solid rgba(var(--color-success-rgb), 0.2);
  text-align: center;
}

.result-summary h3 {
  color: var(--color-success);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.result-details {
  margin-top: 2rem;
}

.result-details h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.answer-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(var(--color-primary-rgb), 0.05);
}

.correct {
  color: var(--color-success);
  font-weight: bold;
}

.incorrect {
  color: var(--color-danger);
  font-weight: bold;
}

.correct-answer {
  color: var(--color-success);
  margin-left: 1.5rem;
  font-style: italic;
  font-weight: 500;
}

/* 训练说明样式 */
.training-instructions {
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border-left: 4px solid var(--color-info);
}

.training-instructions h3 {
  color: var(--color-info);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.training-instructions p {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.training-instructions ul {
  color: var(--color-text-secondary);
  padding-left: 1.5rem;
}

.training-instructions li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .speed-reading-container {
    padding: 1rem;
  }
  
  .page-header {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .training-modules {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .module-card {
    padding: 1.5rem;
  }
  
  .goals-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .reading-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .reading-actions button {
    min-width: auto;
    width: 100%;
  }
  
  .reading-display {
    height: 150px;
    margin-bottom: 1.5rem;
  }
  
  .reading-content {
    padding: 1rem;
  }
  
  .word-display {
    font-size: 2rem;
  }
  
  .chunk-display {
    font-size: 1.6rem;
  }
  
  .line-display {
    font-size: 1.4rem;
  }
  
  .breadcrumb-nav {
    padding: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  .back-arrow {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
  
  .question-item {
    padding: 1rem;
  }
  
  .option-label {
    padding: 0.5rem;
  }
  
  .reading-preview,
  .comprehension-test,
  .test-results,
  .training-instructions {
    padding: 1.5rem;
    margin: 1.5rem auto;
  }
}

@media (max-width: 480px) {
  .speed-reading-container {
    padding: 0.5rem;
  }
  
  .page-header {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .module-card {
    padding: 1rem;
  }
  
  .module-icon {
    font-size: 2.5rem;
  }
  
  .word-display {
    font-size: 1.8rem;
  }
  
  .chunk-display {
    font-size: 1.4rem;
  }
  
  .line-display {
    font-size: 1.2rem;
  }
  
  .reading-display {
    height: 120px;
  }
}

/* 额外的动画效果 */
.module-card {
  animation: fadeInUp 0.6s ease-out;
}

.module-card:nth-child(1) { animation-delay: 0.1s; }
.module-card:nth-child(2) { animation-delay: 0.2s; }
.module-card:nth-child(3) { animation-delay: 0.3s; }
.module-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 加载状态样式 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.loading::after {
  content: '';
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-primary);
  border-top: 2px solid transparent;
  border-radius: 50%;
  margin-left: 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>