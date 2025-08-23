<template>
  <div class="visualization-guide" :class="{ active: isActive }">
    <!-- 主视觉区域 -->
    <div class="main-visual" :class="currentAnimation">
      <!-- 背景粒子效果 -->
      <div class="particle-container">
        <div 
          v-for="particle in particles" 
          :key="particle.id"
          class="particle"
          :style="{
            left: particle.x + '%',
            top: particle.y + '%',
            animationDelay: particle.delay + 's',
            animationDuration: particle.duration + 's'
          }"
        >
          {{ particle.emoji }}
        </div>
      </div>

      <!-- 中央图标 -->
      <div class="central-icon" :class="iconAnimation">
        <div class="icon-glow"></div>
        <span class="icon-text">{{ currentIcon }}</span>
        <div class="icon-ripple"></div>
      </div>

      <!-- 环形进度 -->
      <div class="progress-ring">
        <svg class="progress-svg" width="200" height="200">
          <circle
            class="progress-bg"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            stroke-width="4"
          />
          <circle
            class="progress-fill"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="url(#progressGradient)"
            stroke-width="4"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
            transform="rotate(-90 100 100)"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FF6B6B" />
              <stop offset="100%" stop-color="#4ECDC4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- 时间显示 -->
      <div class="time-display">
        <span class="time-text">{{ formatTime(timeLeft) }}</span>
      </div>
    </div>

    <!-- 步骤指示器 -->
    <div class="step-indicators">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="step-dot"
        :class="{
          active: index === currentStepIndex,
          completed: index < currentStepIndex
        }"
        @click="jumpToStep(index)"
      >
        <span class="step-icon">{{ step.icon }}</span>
        <div class="step-tooltip">{{ step.title }}</div>
      </div>
    </div>

    <!-- 交互提示 -->
    <div class="interaction-hints" v-if="showHints">
      <div class="hint-item" v-for="hint in currentHints" :key="hint.id">
        <div class="hint-icon">{{ hint.icon }}</div>
        <div class="hint-text">{{ hint.text }}</div>
      </div>
    </div>

    <!-- 情绪反馈 -->
    <div class="emotion-feedback" v-if="showEmotionFeedback">
      <h4>你现在的感受是？</h4>
      <div class="emotion-options">
        <button 
          v-for="emotion in emotions" 
          :key="emotion.id"
          class="emotion-btn"
          :class="{ selected: selectedEmotion === emotion.id }"
          @click="selectEmotion(emotion.id)"
        >
          <span class="emotion-icon">{{ emotion.icon }}</span>
          <span class="emotion-label">{{ emotion.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

// Props
const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  currentStep: {
    type: Object,
    default: null
  },
  currentStepIndex: {
    type: Number,
    default: 0
  },
  steps: {
    type: Array,
    default: () => []
  },
  timeLeft: {
    type: Number,
    default: 0
  },
  totalTime: {
    type: Number,
    default: 0
  },
  showHints: {
    type: Boolean,
    default: true
  },
  showEmotionFeedback: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits([
  'step-change',
  'emotion-selected',
  'interaction'
]);

// 响应式数据
const particles = ref([]);
const selectedEmotion = ref(null);
const iconAnimation = ref('');
const currentAnimation = ref('');

// 计算属性
const currentIcon = computed(() => {
  return props.currentStep?.icon || '✨';
});

const circumference = computed(() => {
  return 2 * Math.PI * 90; // r = 90
});

const progressOffset = computed(() => {
  if (props.totalTime === 0) return circumference.value;
  const progress = (props.totalTime - props.timeLeft) / props.totalTime;
  return circumference.value * (1 - progress);
});

const currentHints = computed(() => {
  const baseHints = [
    { id: 1, icon: '👁️', text: '闭上眼睛，让想象更清晰' },
    { id: 2, icon: '🎵', text: '听听周围的声音' },
    { id: 3, icon: '🌈', text: '想象你最喜欢的颜色' }
  ];
  
  if (props.currentStep?.hints) {
    return props.currentStep.hints.map((hint, index) => ({
      id: index + 10,
      icon: '💡',
      text: hint
    }));
  }
  
  return baseHints;
});

// 情绪选项
const emotions = ref([
  { id: 'happy', icon: '😊', label: '开心' },
  { id: 'calm', icon: '😌', label: '平静' },
  { id: 'excited', icon: '🤩', label: '兴奋' },
  { id: 'curious', icon: '🤔', label: '好奇' },
  { id: 'peaceful', icon: '😇', label: '安详' }
]);

// 方法
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const jumpToStep = (index) => {
  emit('step-change', index);
};

const selectEmotion = (emotionId) => {
  selectedEmotion.value = emotionId;
  emit('emotion-selected', emotionId);
};

const generateParticles = () => {
  const particleEmojis = ['✨', '⭐', '🌟', '💫', '🌙', '☁️', '🦋', '🌸', '🌺', '🍃'];
  particles.value = [];
  
  for (let i = 0; i < 15; i++) {
    particles.value.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      emoji: particleEmojis[Math.floor(Math.random() * particleEmojis.length)],
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4
    });
  }
};

const updateAnimation = () => {
  if (!props.currentStep) return;
  
  const animation = props.currentStep.animation || 'default';
  currentAnimation.value = animation;
  
  // 图标动画
  switch (animation) {
    case 'bloom':
      iconAnimation.value = 'bloom-animation';
      break;
    case 'bounce':
      iconAnimation.value = 'bounce-animation';
      break;
    case 'sparkle':
      iconAnimation.value = 'sparkle-animation';
      break;
    case 'float':
      iconAnimation.value = 'float-animation';
      break;
    default:
      iconAnimation.value = 'pulse-animation';
  }
};

// 监听器
watch(() => props.currentStep, () => {
  updateAnimation();
  generateParticles();
}, { immediate: true });

watch(() => props.isActive, (newVal) => {
  if (newVal) {
    generateParticles();
  }
});

// 生命周期
onMounted(() => {
  generateParticles();
  updateAnimation();
});
</script>

<style scoped>
.visualization-guide {
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 20px;
  background: linear-gradient(135deg, 
    rgba(255, 107, 107, 0.1) 0%,
    rgba(78, 205, 196, 0.1) 50%,
    rgba(255, 159, 67, 0.1) 100%);
  overflow: hidden;
  transition: all 0.5s ease;
}

.visualization-guide.active {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transform: scale(1.02);
}

.main-visual {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.8s ease;
}

.particle-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  font-size: 1.2rem;
  animation: float-particle linear infinite;
  opacity: 0.7;
}

@keyframes float-particle {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  90% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

.central-icon {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.icon-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  background: linear-gradient(45deg, #FF6B6B, #4ECDC4, #FFE66D);
  opacity: 0.3;
  animation: glow-pulse 2s ease-in-out infinite;
}

.icon-text {
  font-size: 3rem;
  z-index: 2;
  position: relative;
}

.icon-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 107, 107, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple 2s ease-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* 图标动画 */
.pulse-animation .icon-text {
  animation: pulse 1.5s ease-in-out infinite;
}

.bloom-animation .icon-text {
  animation: bloom 2s ease-in-out infinite;
}

.bounce-animation .icon-text {
  animation: bounce 1s ease-in-out infinite;
}

.sparkle-animation .icon-text {
  animation: sparkle 1.5s ease-in-out infinite;
}

.float-animation .icon-text {
  animation: float 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes bloom {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); filter: brightness(1); }
  25% { transform: scale(1.1) rotate(90deg); filter: brightness(1.3); }
  50% { transform: scale(1.2) rotate(180deg); filter: brightness(1.5); }
  75% { transform: scale(1.1) rotate(270deg); filter: brightness(1.3); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-5px) rotate(120deg); }
  66% { transform: translateY(5px) rotate(240deg); }
}

.progress-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}

.progress-svg {
  transform: rotate(-90deg);
}

.progress-fill {
  transition: stroke-dashoffset 0.5s ease;
}

.time-display {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.time-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.step-indicators {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 10;
}

.step-dot {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.step-dot:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.5);
}

.step-dot.active {
  background: #FF6B6B;
  border-color: #fff;
  transform: scale(1.2);
}

.step-dot.completed {
  background: #4ECDC4;
  border-color: #fff;
}

.step-icon {
  font-size: 1.2rem;
}

.step-tooltip {
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.step-dot:hover .step-tooltip {
  opacity: 1;
}

.interaction-hints {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  animation: hint-fade-in 0.5s ease;
}

@keyframes hint-fade-in {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.hint-icon {
  font-size: 1rem;
}

.hint-text {
  font-size: 0.9rem;
  color: #333;
}

.emotion-feedback {
  position: absolute;
  bottom: -120px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 10;
}

.emotion-feedback h4 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.emotion-options {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.emotion-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.emotion-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.emotion-btn.selected {
  border-color: #FF6B6B;
  background: rgba(255, 107, 107, 0.1);
}

.emotion-icon {
  font-size: 1.5rem;
}

.emotion-label {
  font-size: 0.8rem;
  color: #333;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .visualization-guide {
    height: 400px;
  }
  
  .central-icon {
    width: 100px;
    height: 100px;
  }
  
  .icon-text {
    font-size: 2.5rem;
  }
  
  .step-indicators {
    bottom: -50px;
    gap: 0.5rem;
  }
  
  .step-dot {
    width: 35px;
    height: 35px;
  }
  
  .interaction-hints {
    top: 10px;
    right: 10px;
  }
  
  .emotion-options {
    flex-wrap: wrap;
    gap: 0.3rem;
  }
  
  .emotion-btn {
    padding: 0.6rem;
  }
}
</style>