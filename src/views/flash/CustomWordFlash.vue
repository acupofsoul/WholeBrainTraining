<template>
  <div class="custom-word-flash">

    <!-- 设置阶段 -->
    <div v-if="currentStage === 'setup'" class="setup-stage">
      <div class="page-header">
        <h1>自定义单词闪视训练</h1>
        <p class="page-description">
          输入您想要训练的单词列表，设置闪视参数，开始个性化的单词记忆训练
        </p>
      </div>

      <div class="setup-container">
        <!-- 单词输入区域 -->
        <div class="word-input-section">
          <h3>单词列表设置</h3>
          <div class="input-methods">
            <button 
              :class="['method-btn', { active: inputMethod === 'manual' }]"
              @click="inputMethod = 'manual'"
            >
              手动输入
            </button>
            <button 
              :class="['method-btn', { active: inputMethod === 'file' }]"
              @click="inputMethod = 'file'"
            >
              文件导入
            </button>
          </div>

          <!-- 手动输入 -->
          <div v-if="inputMethod === 'manual'" class="manual-input">
            <textarea 
              v-model="wordListText"
              placeholder="请输入单词列表，每行一个单词或用逗号分隔\n例如：\napple\nbanana\norange"
              class="word-textarea"
            ></textarea>
            <div class="input-tips">
              <span>💡 支持每行一个单词或用逗号分隔</span>
              <span>当前单词数：{{ parsedWords.length }}</span>
            </div>
          </div>

          <!-- 文件导入 -->
          <div v-if="inputMethod === 'file'" class="file-input">
            <div class="file-drop-zone" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent>
              <input 
                type="file" 
                ref="fileInput" 
                @change="handleFileSelect" 
                accept=".txt,.csv"
                style="display: none;"
              >
              <div class="drop-content">
                <div class="drop-icon">📁</div>
                <p>拖拽文件到此处或 <button @click="$refs.fileInput.click()" class="browse-btn">浏览文件</button></p>
                <p class="file-hint">支持 .txt 和 .csv 格式</p>
              </div>
            </div>
          </div>

          <!-- 单词预览 -->
          <div v-if="parsedWords.length > 0" class="word-preview">
            <h4>单词预览 ({{ parsedWords.length }}个)</h4>
            <div class="word-tags">
              <span v-for="(word, index) in parsedWords.slice(0, 20)" :key="index" class="word-tag">
                {{ word }}
              </span>
              <span v-if="parsedWords.length > 20" class="more-words">
                +{{ parsedWords.length - 20 }}个更多...
              </span>
            </div>
          </div>
        </div>

        <!-- 训练参数设置 -->
        <div class="parameter-section">
          <h3>训练参数设置</h3>
          <div class="parameter-grid">
            <div class="parameter-item">
              <label>闪视速度</label>
              <select v-model="flashParams.speed">
                <option value="2000">很慢 (2秒)</option>
                <option value="1500">慢速 (1.5秒)</option>
                <option value="1000">中速 (1秒)</option>
                <option value="500">快速 (0.5秒)</option>
                <option value="300">很快 (0.3秒)</option>
                <option value="200">极速 (0.2秒)</option>
              </select>
            </div>

            <div class="parameter-item">
              <label>间隔时间</label>
              <select v-model="flashParams.interval">
                <option value="500">0.5秒</option>
                <option value="1000">1秒</option>
                <option value="1500">1.5秒</option>
                <option value="2000">2秒</option>
              </select>
            </div>

            <div class="parameter-item">
              <label>重复次数</label>
              <select v-model="flashParams.rounds">
                <option value="1">1次</option>
                <option value="2">2次</option>
                <option value="3">3次</option>
                <option value="5">5次</option>
              </select>
            </div>

            <div class="parameter-item">
              <label>随机顺序</label>
              <div class="toggle-switch">
                <input type="checkbox" v-model="flashParams.randomOrder" id="random-toggle">
                <label for="random-toggle" class="toggle-label"></label>
              </div>
            </div>
          </div>

          <div class="preview-section">
            <h4>训练预览</h4>
            <div class="preview-info">
              <div class="info-item">
                <span class="info-label">总单词数：</span>
                <span class="info-value">{{ parsedWords.length }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">预计时长：</span>
                <span class="info-value">{{ estimatedDuration }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">闪视速度：</span>
                <span class="info-value">{{ flashParams.speed }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button 
          @click="startTraining" 
          :disabled="parsedWords.length === 0"
          class="start-btn"
        >
          开始训练
        </button>
      </div>
    </div>

    <!-- 训练阶段 -->
    <div v-if="currentStage === 'training'" class="training-stage">
      <div class="training-header">
        <div class="progress-info">
          <span>进度：{{ currentWordIndex + 1 }} / {{ totalWords }}</span>
          <span>轮次：{{ currentRound }} / {{ flashParams.rounds }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>

      <div class="flash-area">
        <div v-if="showWord" class="flash-word" :key="currentWord">
          {{ currentWord }}
        </div>
        <div v-else class="flash-placeholder">
          <div class="waiting-indicator">准备中...</div>
        </div>
      </div>

      <div class="training-controls">
        <button @click="pauseTraining" v-if="!isPaused" class="control-btn pause-btn">
          ⏸️ 暂停
        </button>
        <button @click="resumeTraining" v-if="isPaused" class="control-btn resume-btn">
          ▶️ 继续
        </button>
        <button @click="stopTraining" class="control-btn stop-btn">
          ⏹️ 停止
        </button>
      </div>
    </div>

    <!-- 结果阶段 -->
    <div v-if="currentStage === 'result'" class="result-stage">
      <div class="result-header">
        <h2>训练完成！</h2>
        <div class="completion-icon">🎉</div>
      </div>

      <div class="result-stats">
        <div class="stat-card">
          <div class="stat-number">{{ totalWords }}</div>
          <div class="stat-label">训练单词数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ flashParams.rounds }}</div>
          <div class="stat-label">完成轮次</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ formatTime(trainingDuration) }}</div>
          <div class="stat-label">训练时长</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ flashParams.speed }}ms</div>
          <div class="stat-label">闪视速度</div>
        </div>
      </div>

      <div class="result-actions">
        <button @click="restartTraining" class="action-btn primary">
          重新训练
        </button>
        <button @click="backToSetup" class="action-btn secondary">
          修改设置
        </button>
        <button @click="goBack" class="action-btn secondary">
          返回主页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 当前阶段：setup, training, result
const currentStage = ref('setup');

// 输入方式
const inputMethod = ref('manual');

// 单词列表
const wordListText = ref('');
const parsedWords = computed(() => {
  if (!wordListText.value.trim()) return [];
  
  // 支持换行符和逗号分隔
  return wordListText.value
    .split(/[\n,]+/)
    .map(word => word.trim())
    .filter(word => word.length > 0);
});

// 训练参数
const flashParams = ref({
  speed: 1000,
  interval: 1000,
  rounds: 1,
  randomOrder: false
});

// 预计训练时长
const estimatedDuration = computed(() => {
  const totalTime = parsedWords.value.length * (parseInt(flashParams.value.speed) + parseInt(flashParams.value.interval)) * flashParams.value.rounds;
  const minutes = Math.floor(totalTime / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);
  return `${minutes}分${seconds}秒`;
});

// 训练状态
const currentWordIndex = ref(0);
const currentRound = ref(1);
const currentWord = ref('');
const showWord = ref(false);
const isPaused = ref(false);
const trainingWords = ref([]);
const totalWords = ref(0);
const trainingStartTime = ref(0);
const trainingDuration = ref(0);

// 定时器
let flashTimer = null;
let intervalTimer = null;

// 进度百分比
const progressPercentage = computed(() => {
  if (totalWords.value === 0) return 0;
  const totalProgress = (currentRound.value - 1) * totalWords.value + currentWordIndex.value;
  const maxProgress = flashParams.value.rounds * totalWords.value;
  return Math.round((totalProgress / maxProgress) * 100);
});

// 文件处理
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    readFile(file);
  }
};

const handleFileDrop = (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) {
    readFile(file);
  }
};

const readFile = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    wordListText.value = e.target.result;
  };
  reader.readAsText(file);
};

// 开始训练
const startTraining = () => {
  if (parsedWords.value.length === 0) return;
  
  currentStage.value = 'training';
  trainingWords.value = flashParams.value.randomOrder 
    ? [...parsedWords.value].sort(() => Math.random() - 0.5)
    : [...parsedWords.value];
  
  totalWords.value = trainingWords.value.length;
  currentWordIndex.value = 0;
  currentRound.value = 1;
  trainingStartTime.value = Date.now();
  
  nextWord();
};

// 下一个单词
const nextWord = () => {
  if (isPaused.value) return;
  
  if (currentWordIndex.value >= trainingWords.value.length) {
    // 当前轮次结束
    if (currentRound.value >= flashParams.value.rounds) {
      // 所有轮次结束
      finishTraining();
      return;
    } else {
      // 开始下一轮
      currentRound.value++;
      currentWordIndex.value = 0;
      if (flashParams.value.randomOrder) {
        trainingWords.value = [...parsedWords.value].sort(() => Math.random() - 0.5);
      }
    }
  }
  
  currentWord.value = trainingWords.value[currentWordIndex.value];
  showWord.value = true;
  
  // 闪视时间
  flashTimer = setTimeout(() => {
    showWord.value = false;
    
    // 间隔时间
    intervalTimer = setTimeout(() => {
      currentWordIndex.value++;
      nextWord();
    }, parseInt(flashParams.value.interval));
  }, parseInt(flashParams.value.speed));
};

// 暂停训练
const pauseTraining = () => {
  isPaused.value = true;
  clearTimeout(flashTimer);
  clearTimeout(intervalTimer);
};

// 继续训练
const resumeTraining = () => {
  isPaused.value = false;
  nextWord();
};

// 停止训练
const stopTraining = () => {
  clearTimeout(flashTimer);
  clearTimeout(intervalTimer);
  currentStage.value = 'setup';
  isPaused.value = false;
};

// 完成训练
const finishTraining = () => {
  clearTimeout(flashTimer);
  clearTimeout(intervalTimer);
  trainingDuration.value = Date.now() - trainingStartTime.value;
  currentStage.value = 'result';
  
  // 保存训练记录
  saveTrainingRecord();
};

// 重新开始训练
const restartTraining = () => {
  startTraining();
};

// 返回设置
const backToSetup = () => {
  currentStage.value = 'setup';
};

// 返回主页
const goBack = () => {
  router.push('/flash-training');
};

// 格式化时间
const formatTime = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}分${seconds}秒`;
};

// 保存训练记录
const saveTrainingRecord = () => {
  const record = {
    date: new Date().toISOString(),
    wordCount: totalWords.value,
    rounds: flashParams.value.rounds,
    duration: trainingDuration.value,
    speed: flashParams.value.speed
  };
  
  // 保存到本地存储
  const saved = localStorage.getItem('customWordFlashRecords') || '[]';
  const records = JSON.parse(saved);
  records.push(record);
  localStorage.setItem('customWordFlashRecords', JSON.stringify(records));
  
  // 更新统计数据
  updateStats();
};

// 更新统计数据
const updateStats = () => {
  const flashStats = JSON.parse(localStorage.getItem('flashTrainingStats') || '{}');
  
  if (!flashStats.customWord) {
    flashStats.customWord = { completed: 0, bestScore: 0 };
  }
  
  flashStats.customWord.completed++;
  // 这里可以根据需要计算分数
  
  localStorage.setItem('flashTrainingStats', JSON.stringify(flashStats));
};

// 清理定时器
onUnmounted(() => {
  clearTimeout(flashTimer);
  clearTimeout(intervalTimer);
});
</script>

<style scoped>
.custom-word-flash {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 面包屑导航样式 */


/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  color: var(--color-primary);
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.page-description {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

/* 设置容器 */
.setup-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* 单词输入区域 */
.word-input-section {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.word-input-section h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.input-methods {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.method-btn {
  padding: 0.5rem 1rem;
  border: 2px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.method-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.word-textarea {
  width: 100%;
  height: 200px;
  padding: 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: monospace;
  font-size: 0.9rem;
  resize: vertical;
  transition: border-color var(--transition-normal);
}

.word-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.input-tips {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* 文件输入 */
.file-drop-zone {
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all var(--transition-normal);
  cursor: pointer;
}

.file-drop-zone:hover {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.drop-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.browse-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
}

.file-hint {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

/* 单词预览 */
.word-preview {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.word-preview h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.word-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.word-tag {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  font-size: 0.85rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
}

.more-words {
  background: var(--color-border);
  color: var(--color-text-secondary);
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  font-size: 0.85rem;
}

/* 参数设置区域 */
.parameter-section {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.parameter-section h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.parameter-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.parameter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.parameter-item label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}

.parameter-item select {
  padding: 0.8rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.9rem;
  transition: border-color var(--transition-normal);
}

.parameter-item select:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* 切换开关 */
.toggle-switch {
  position: relative;
  display: inline-block;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  display: block;
  width: 50px;
  height: 24px;
  background: var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: background var(--transition-normal);
  position: relative;
}

.toggle-label::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: transform var(--transition-normal);
}

.toggle-switch input:checked + .toggle-label {
  background: var(--color-primary);
}

.toggle-switch input:checked + .toggle-label::after {
  transform: translateX(26px);
}

/* 预览信息 */
.preview-section {
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.preview-section h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.preview-info {
  display: grid;
  gap: 0.8rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.info-value {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

/* 操作按钮 */
.action-buttons {
  text-align: center;
}

.start-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.4);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 训练阶段样式 */
.training-stage {
  text-align: center;
}

.training-header {
  margin-bottom: 3rem;
}

.progress-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--color-text);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, #1d4ed8 100%);
  transition: width 0.3s ease;
}

.flash-area {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
  background: var(--color-card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.flash-word {
  font-size: 4rem;
  font-weight: 600;
  color: var(--color-primary);
  animation: flashIn 0.2s ease;
}

@keyframes flashIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.flash-placeholder {
  color: var(--color-text-secondary);
  font-size: 1.2rem;
}

.waiting-indicator {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.training-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.control-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.pause-btn, .resume-btn {
  background: var(--color-warning);
  color: white;
}

.stop-btn {
  background: var(--color-danger);
  color: white;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 结果阶段样式 */
.result-stage {
  text-align: center;
}

.result-header {
  margin-bottom: 3rem;
}

.result-header h2 {
  color: var(--color-primary);
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.completion-icon {
  font-size: 4rem;
  animation: bounce 1s ease;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 2px solid transparent;
  transition: all var(--transition-normal);
}

.stat-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-3px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}

.action-btn.secondary {
  background: var(--color-card-bg);
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn.primary:hover {
  box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.4);
}

.action-btn.secondary:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .setup-container {
    grid-template-columns: 1fr;
  }
  
  .progress-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .flash-word {
    font-size: 2.5rem;
  }
  
  .result-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>