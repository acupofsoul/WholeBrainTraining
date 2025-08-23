<template>
  <div class="fairy-tale-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-background">
        <div class="fairy-elements">
          <div class="floating-shape shape-1">🧚‍♀️</div>
          <div class="floating-shape shape-2">🏰</div>
          <div class="floating-shape shape-3">🌟</div>
          <div class="floating-shape shape-4">🦄</div>
        </div>
      </div>
      <h1>🏰 童话世界</h1>
      <p class="page-description">
        踏进神奇的童话书，成为故事的主角，体验奇妙的冒险旅程。
      </p>
    </div>

    <!-- 训练准备 -->
    <div v-if="!isTraining && !isCompleted" class="training-setup">
      <div class="setup-card">
        <h3>准备开始：童话世界冒险</h3>
        <div class="setup-preview">
          <div class="preview-icon">🏰</div>
          <div class="preview-text">
            <p>踏进神奇的童话书，成为故事的主角，体验奇妙的冒险旅程...</p>
          </div>
        </div>
        <div class="setup-tips">
          <h4>💡 想象提示</h4>
          <ul>
            <li>想象自己是勇敢的小英雄</li>
            <li>看看美丽的城堡和花园</li>
            <li>和善良的仙女交朋友</li>
            <li>骑着独角兽在云朵上飞翔</li>
          </ul>
        </div>
        <div class="setup-options">
          <div class="option-item">
            <label>训练时长：</label>
            <select v-model="trainingDuration">
              <option value="5">5分钟</option>
              <option value="10">10分钟</option>
              <option value="15">15分钟</option>
            </select>
          </div>
          <div class="option-item">
            <label>引导语速度：</label>
            <select v-model="guideSpeed">
              <option value="slow">慢速</option>
              <option value="normal">正常</option>
              <option value="fast">快速</option>
            </select>
          </div>
        </div>
        <button class="start-training-btn" @click="startTraining">
          <span class="btn-icon">🏰</span>
          开始童话冒险
        </button>
      </div>
    </div>

    <!-- 想象训练进行中 -->
    <div v-if="isTraining" class="training-active">
      <div class="training-header">
        <h2>童话世界</h2>
        <div class="training-info">
          <span class="step-counter">{{ currentStepIndex + 1 }}/{{ trainingSteps.length }} 步骤</span>
          <span class="time-left">剩余: {{ formatTime(stepTimeLeft) }}</span>
        </div>
      </div>

      <!-- 当前步骤显示 -->
      <div class="step-display">
        <div class="step-visual">
          <div class="step-icon">{{ currentStep.icon }}</div>
          <div class="step-animation" :class="currentStep.animation"></div>
        </div>
        <div class="step-content">
          <h3>{{ currentStep.title }}</h3>
          <p class="step-instruction">{{ currentStep.instruction }}</p>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span class="progress-text">{{ Math.round(progressPercentage) }}%</span>
      </div>

      <!-- 控制按钮 -->
      <div class="training-controls">
        <button 
          class="control-btn prev" 
          @click="previousStep" 
          :disabled="currentStepIndex === 0"
        >
          ⬅️ 上一步
        </button>
        <button 
          class="control-btn pause" 
          @click="togglePause"
        >
          {{ isPaused ? '▶️ 继续' : '⏸️ 暂停' }}
        </button>
        <button 
          class="control-btn next" 
          @click="nextStep" 
          :disabled="currentStepIndex === trainingSteps.length - 1"
        >
          下一步 ➡️
        </button>
        <button class="control-btn stop" @click="stopTraining">
          ⏹️ 结束
        </button>
      </div>

      <!-- 暂停状态提示 -->
      <div v-if="isPaused" class="pause-overlay">
        <div class="pause-content">
          <div class="pause-icon">⏸️</div>
          <h3>训练已暂停</h3>
          <p>点击继续按钮恢复童话冒险</p>
        </div>
      </div>
    </div>

    <!-- 训练完成 -->
    <div v-if="isCompleted" class="training-completed">
      <div class="completion-card">
        <div class="completion-animation">
          <div class="completion-icon">🎉</div>
          <div class="sparkles">
            <span class="sparkle">✨</span>
            <span class="sparkle">⭐</span>
            <span class="sparkle">🌟</span>
          </div>
        </div>
        <h2>童话冒险完成！</h2>
        <p>恭喜完成童话世界的想象训练</p>
        <div class="completion-reflection">
          <h4>🎨 创作分享</h4>
          <p>你可以把刚才想象的童话故事画出来或者讲给家人听！</p>
        </div>
        <div class="completion-actions">
          <button class="action-btn primary" @click="restartTraining">
            🔄 再次体验
          </button>
          <button class="action-btn secondary" @click="goBack">
            🌈 选择其他主题
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 训练步骤数据
const trainingSteps = ref([
  {
    id: 1,
    title: '魔法之门',
    icon: '🚪',
    instruction: '推开一扇闪闪发光的魔法门，踏进美丽的童话世界',
    duration: 60,
    animation: 'magic-door'
  },
  {
    id: 2,
    title: '彩虹城堡',
    icon: '🏰',
    instruction: '看到远处有一座美丽的彩虹城堡，城堡周围开满了鲜花',
    duration: 90,
    animation: 'castle-glow'
  },
  {
    id: 3,
    title: '仙女朋友',
    icon: '🧚‍♀️',
    instruction: '遇到一位善良的小仙女，她邀请你一起去探险',
    duration: 120,
    animation: 'fairy-dance'
  },
  {
    id: 4,
    title: '独角兽飞行',
    icon: '🦄',
    instruction: '骑上美丽的独角兽，在彩虹桥上飞翔，俯瞰整个童话王国',
    duration: 90,
    animation: 'unicorn-fly'
  },
  {
    id: 5,
    title: '许愿星星',
    icon: '⭐',
    instruction: '在夜空中找到最亮的星星，许下一个美好的愿望',
    duration: 60,
    animation: 'star-twinkle'
  }
])

// 状态管理
const isTraining = ref(false)
const isPaused = ref(false)
const isCompleted = ref(false)
const currentStepIndex = ref(0)
const stepTimeLeft = ref(0)
const trainingDuration = ref(10)
const guideSpeed = ref('normal')

// 定时器
let stepTimer = null

// 计算属性
const currentStep = computed(() => {
  return trainingSteps.value[currentStepIndex.value]
})

const progressPercentage = computed(() => {
  return ((currentStepIndex.value + 1) / trainingSteps.value.length) * 100
})

// 方法
const startTraining = () => {
  isTraining.value = true
  currentStepIndex.value = 0
  startStep()
}

const startStep = () => {
  if (!currentStep.value) return
  
  stepTimeLeft.value = currentStep.value.duration
  
  stepTimer = setInterval(() => {
    if (!isPaused.value) {
      stepTimeLeft.value--
      
      if (stepTimeLeft.value <= 0) {
        nextStep()
      }
    }
  }, 1000)
}

const nextStep = () => {
  clearInterval(stepTimer)
  
  if (currentStepIndex.value < trainingSteps.value.length - 1) {
    currentStepIndex.value++
    startStep()
  } else {
    completeTraining()
  }
}

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    clearInterval(stepTimer)
    currentStepIndex.value--
    startStep()
  }
}

const togglePause = () => {
  isPaused.value = !isPaused.value
}

const stopTraining = () => {
  isTraining.value = false
  isPaused.value = false
  clearInterval(stepTimer)
}

const completeTraining = () => {
  isTraining.value = false
  isCompleted.value = true
  clearInterval(stepTimer)
}

const restartTraining = () => {
  isCompleted.value = false
  startTraining()
}

const goBack = () => {
  router.push('/meditation/visualization')
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 生命周期
onUnmounted(() => {
  if (stepTimer) {
    clearInterval(stepTimer)
  }
})
</script>

<style scoped>
.fairy-tale-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  position: relative;
  text-align: center;
  padding: 40px 20px;
  margin-bottom: 30px;
  border-radius: 20px;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
  opacity: 0.1;
}

.fairy-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.floating-shape {
  position: absolute;
  font-size: 2rem;
  animation: float 6s ease-in-out infinite;
}

.shape-1 { top: 20%; left: 10%; animation-delay: 0s; }
.shape-2 { top: 30%; right: 15%; animation-delay: 1s; }
.shape-3 { bottom: 30%; left: 20%; animation-delay: 2s; }
.shape-4 { bottom: 20%; right: 10%; animation-delay: 3s; }

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.page-header h1 {
  position: relative;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 15px;
  z-index: 1;
}

.page-description {
  position: relative;
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  z-index: 1;
}

.training-setup {
  margin-bottom: 30px;
}

.setup-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border: 2px solid #fd79a8;
}

.setup-card h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.setup-preview {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.preview-icon {
  font-size: 3rem;
  margin-right: 20px;
}

.preview-text p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.setup-tips {
  margin-bottom: 25px;
}

.setup-tips h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.setup-tips ul {
  list-style: none;
  padding: 0;
}

.setup-tips li {
  padding: 8px 0;
  color: #666;
  position: relative;
  padding-left: 25px;
}

.setup-tips li:before {
  content: '🏰';
  position: absolute;
  left: 0;
}

.setup-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.option-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item label {
  font-weight: 600;
  color: #2c3e50;
}

.option-item select {
  padding: 10px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
}

.start-training-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #fd79a8, #e84393);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.start-training-btn:hover {
  transform: translateY(-2px);
}

.training-active {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f8f9fa;
}

.training-header h2 {
  color: #2c3e50;
  margin: 0;
}

.training-info {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: #666;
}

.step-display {
  text-align: center;
  margin-bottom: 30px;
}

.step-visual {
  position: relative;
  margin-bottom: 20px;
}

.step-icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

.step-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  pointer-events: none;
}

.step-animation.magic-door {
  background: radial-gradient(circle, rgba(253,121,168,0.3) 0%, transparent 70%);
  animation: magicDoor 2s ease-in-out infinite;
}

.step-animation.castle-glow {
  background: radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%);
  animation: castleGlow 3s ease-in-out infinite;
}

.step-animation.fairy-dance {
  background: radial-gradient(circle, rgba(255,182,193,0.4) 0%, transparent 70%);
  animation: fairyDance 2s ease-in-out infinite;
}

.step-animation.unicorn-fly {
  background: radial-gradient(circle, rgba(138,43,226,0.3) 0%, transparent 70%);
  animation: unicornFly 2.5s ease-in-out infinite;
}

.step-animation.star-twinkle {
  background: radial-gradient(circle, rgba(255,255,0,0.4) 0%, transparent 70%);
  animation: starTwinkle 1.5s ease-in-out infinite;
}

@keyframes magicDoor {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
}

@keyframes castleGlow {
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
  50% { transform: translate(-50%, -50%) rotate(10deg); }
}

@keyframes fairyDance {
  0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(0deg); }
  25% { transform: translate(-50%, -50%) translateY(-10px) rotate(90deg); }
  50% { transform: translate(-50%, -50%) translateY(0) rotate(180deg); }
  75% { transform: translate(-50%, -50%) translateY(-10px) rotate(270deg); }
}

@keyframes unicornFly {
  0%, 100% { transform: translate(-50%, -50%) translateX(0) translateY(0); }
  25% { transform: translate(-50%, -50%) translateX(-20px) translateY(-10px); }
  50% { transform: translate(-50%, -50%) translateX(0) translateY(-20px); }
  75% { transform: translate(-50%, -50%) translateX(20px) translateY(-10px); }
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
}

.step-content h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.step-instruction {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fd79a8, #e84393);
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  color: #2c3e50;
  min-width: 50px;
}

.training-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.control-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.control-btn.prev {
  background: #6c757d;
  color: white;
}

.control-btn.pause {
  background: #ffc107;
  color: #212529;
}

.control-btn.next {
  background: #28a745;
  color: white;
}

.control-btn.stop {
  background: #dc3545;
  color: white;
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pause-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.pause-content {
  background: white;
  padding: 40px;
  border-radius: 15px;
  text-align: center;
  max-width: 400px;
}

.pause-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.pause-content h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.pause-content p {
  color: #666;
  margin-bottom: 25px;
}

.training-completed {
  text-align: center;
}

.completion-card {
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.completion-animation {
  position: relative;
  margin-bottom: 30px;
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.sparkles {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.sparkle {
  font-size: 1.5rem;
  animation: sparkleFloat 2s ease-in-out infinite;
}

.sparkle:nth-child(2) { animation-delay: 0.5s; }
.sparkle:nth-child(3) { animation-delay: 1s; }

@keyframes sparkleFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(180deg); }
}

.completion-card h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.completion-card p {
  color: #666;
  margin-bottom: 25px;
}

.completion-reflection {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 25px;
}

.completion-reflection h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.completion-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  min-width: 150px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #fd79a8, #e84393);
  color: white;
}

.action-btn.secondary {
  background: #6c757d;
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .fairy-tale-container {
    padding: 15px;
  }
  
  .setup-options {
    grid-template-columns: 1fr;
  }
  
  .training-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .control-btn {
    width: 100%;
    max-width: 200px;
  }
  
  .completion-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>