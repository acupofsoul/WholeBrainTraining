<template>
  <div class="breathing-training-container">


    <!-- 主页面内容 - 只在没有子路由时显示 -->
    <div v-if="$route.path === '/meditation/breathing'">
      <!-- 页面头部 -->
      <div class="page-header">

        <h1>🫁 呼吸训练</h1>
        <p class="page-description">
          通过有节奏的呼吸练习，帮助孩子学会调节情绪，提升专注力和放松能力。
          深呼吸是冥想的基础，也是自我调节的重要技能。
        </p>
      </div>

      <!-- 呼吸模式选择 -->
      <div class="breathing-modes">
        <h2 class="section-title">选择呼吸模式</h2>
        <div class="modes-grid">
          <div 
          v-for="mode in breathingModes" 
          :key="mode.id" 
          class="mode-card"
          :class="{ 'selected': selectedMode?.id === mode.id }"
          @click="selectMode(mode)"
        >
            <div class="mode-icon">{{ mode.icon }}</div>
            <h3>{{ mode.name }}</h3>
            <p>{{ mode.description }}</p>
            <div class="mode-pattern">
            <span class="pattern-label">呼吸节奏：</span>
            <span class="pattern-value">{{ mode.patternText }}</span>
          </div>
            <div class="mode-duration">
              <span class="duration-label">时长：</span>
              <span class="duration-value">{{ mode.duration }}分钟</span>
            </div>
            <div class="mode-age">
              <span class="age-label">年龄：</span>
              <span class="age-value">{{ mode.ageRange }}</span>
            </div>
            <button class="start-training-btn" @click.stop="startTraining(mode)">
              开始训练
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 呼吸训练弹窗 -->
    <div v-if="showTrainingModal" class="training-modal-overlay" @click="closeTraining">
      <div class="training-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <div class="mode-icon-large">{{ selectedMode?.icon }}</div>
            <h2>{{ selectedMode?.name }}</h2>
          </div>
          <button class="close-btn" @click="closeTraining">×</button>
        </div>
        

        
        <div class="modal-content">
          <BreathingGuide 
            v-if="selectedMode"
            :pattern="selectedMode.pattern"
            :session-duration="selectedMode.duration * 60"
            :auto-start="false"
            :save-progress="true"
            @phase-change="onPhaseChange"
            @cycle-complete="onCycleComplete"
            @session-start="onSessionStart"
            @session-end="onSessionEnd"
            @session-complete="onSessionComplete"
          />
        </div>
        

      </div>
    </div>

    <!-- 子路由视图 -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import BreathingGuide from '@/components/BreathingGuide.vue';
import meditationStorage from '@/utils/meditationStorage';

// 选中的模式
const selectedMode = ref(null);
const sessionData = ref(null);
const showTrainingModal = ref(false);
const isPreviewBreathing = ref(false);

// 预览呼吸动画
let previewInterval = null;

onMounted(() => {
  // 启动预览呼吸动画
  previewInterval = setInterval(() => {
    isPreviewBreathing.value = !isPreviewBreathing.value;
  }, 4000);
});

onUnmounted(() => {
  if (previewInterval) {
    clearInterval(previewInterval);
  }
});

// 事件处理方法
const onPhaseChange = (data) => {
  console.log('Phase changed:', data)
}

const onCycleComplete = (data) => {
  console.log('Cycle completed:', data)
}

const onSessionStart = (data) => {
  sessionData.value = data
  console.log('Session started:', data)
}

const onSessionEnd = (data) => {
  console.log('Session ended:', data)
  // 显示完成提示或导航到结果页面
}

const onSessionComplete = (data) => {
  console.log('Session completed:', data)
  // 可以显示成就解锁、统计更新等
}

// 选择呼吸模式
const selectMode = (mode) => {
  selectedMode.value = mode;
  console.log('选择呼吸模式:', mode.name);
};

// 开始训练
const startTraining = (mode) => {
  selectedMode.value = mode;
  showTrainingModal.value = true;
  console.log('开始呼吸训练:', mode.name);
};

// 关闭训练
const closeTraining = () => {
  showTrainingModal.value = false;
  selectedMode.value = null;
};

// 呼吸训练模式数据
const breathingModes = ref([
  {
    id: 1,
    name: '基础呼吸',
    icon: '🌱',
    description: '简单的深呼吸练习，适合初学者',
    pattern: { inhale: 4, hold: 4, exhale: 4, pause: 1 },
    patternText: '4-4-4 (吸气-保持-呼气)',
    duration: 5,
    ageRange: '3-12岁',
    route: '/meditation/breathing/basic'
  },
  {
    id: 2,
    name: '放松呼吸',
    icon: '🌙',
    description: '延长呼气时间，帮助深度放松',
    pattern: { inhale: 4, hold: 2, exhale: 6, pause: 1 },
    patternText: '4-2-6 (吸气-保持-呼气)',
    duration: 8,
    ageRange: '5-12岁',
    route: '/meditation/breathing/relaxation'
  },
  {
    id: 3,
    name: '专注呼吸',
    icon: '🎯',
    description: '提升专注力的呼吸练习',
    pattern: { inhale: 6, hold: 2, exhale: 6, pause: 1 },
    patternText: '6-2-6 (吸气-保持-呼气)',
    duration: 10,
    ageRange: '7-12岁',
    route: '/meditation/breathing/focus'
  }
]);
</script>

<style scoped>
.breathing-training-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.breathing-training-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.page-header {
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  z-index: 2;
}

.header-background {
  position: relative;
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.breathing-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  margin-bottom: 1rem;
}

.breath-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
  border: 3px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 
    0 0 30px rgba(255, 255, 255, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.2);
}

.breath-circle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
  animation: innerPulse 4s ease-in-out infinite;
}

.breath-circle.breathing {
  animation: breathe 4s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.8;
    box-shadow: 
      0 0 30px rgba(255, 255, 255, 0.3),
      inset 0 0 20px rgba(255, 255, 255, 0.2);
  }
  50% { 
    transform: scale(1.3); 
    opacity: 1;
    box-shadow: 
      0 0 50px rgba(255, 255, 255, 0.5),
      inset 0 0 30px rgba(255, 255, 255, 0.3);
  }
}

@keyframes innerPulse {
  0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.8); }
  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
}

.page-header h1 {
  font-size: 3rem;
  color: white;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.page-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.95);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.7;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-weight: 300;
}

.breathing-modes {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.section-title {
  font-size: 2.2rem;
  color: white;
  text-align: center;
  margin-bottom: 3rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  font-weight: 600;
  letter-spacing: -0.01em;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  border-radius: 2px;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
  margin-bottom: 2rem;
}

.mode-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 2.5rem;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.mode-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.mode-card:hover::before {
  left: 100%;
}

.mode-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 10px 25px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
}

.mode-card.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: white;
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 25px 50px rgba(102, 126, 234, 0.4),
    0 10px 25px rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.mode-card.selected::after {
  content: '';
  position: absolute;
  top: 15px;
  right: 15px;
  width: 25px;
  height: 25px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-card.selected::after {
  content: '✓';
  color: #667eea;
  font-weight: bold;
  font-size: 14px;
}

.mode-card.selected h3,
.mode-card.selected p,
.mode-card.selected .pattern-label,
.mode-card.selected .duration-label,
.mode-card.selected .age-label {
  color: rgba(255, 255, 255, 0.9);
}

.mode-card.selected .pattern-value,
.mode-card.selected .duration-value,
.mode-card.selected .age-value {
  color: white;
  font-weight: 600;
}

.mode-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.mode-card:hover .mode-icon {
  transform: scale(1.1) rotate(5deg);
}

.mode-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c3e50;
  transition: color 0.3s ease;
}

.mode-card p {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  transition: color 0.3s ease;
}

.mode-pattern,
.mode-duration,
.mode-age {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.pattern-label,
.duration-label,
.age-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
  transition: color 0.3s ease;
}

.pattern-value,
.duration-value,
.age-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
  transition: color 0.3s ease;
}

.start-training-btn {
  width: 100%;
  padding: 1rem 2rem;
  margin-top: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.start-training-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.start-training-btn:hover::before {
  left: 100%;
}

.start-training-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.start-training-btn:active {
  transform: translateY(0);
  box-shadow: 0 6px 15px rgba(102, 126, 234, 0.3);
}

/* 弹窗样式 */
.training-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.training-modal {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  width: 90vw;
  max-width: 800px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  line-height: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.modal-content {
  padding: 0;
  overflow: hidden;
  flex: 1;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

/* 弹窗标题区域样式 */
.modal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mode-icon-large {
  font-size: 2.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* 指导说明样式 */






@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .training-modal {
    width: 95vw;
    margin: 1rem;
  }
  
  .modal-header {
    padding: 1.5rem 2rem 1rem;
  }
  
  .modal-header h2 {
    font-size: 1.5rem;
  }
  
  .mode-icon-large {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }
  

  
  .start-training-btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
}

/* 浮动粒子效果 */
.breathing-training-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255, 255, 255, 0.2), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(255, 255, 255, 0.4), transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(2px 2px at 160px 30px, rgba(255, 255, 255, 0.2), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: floatParticles 20s linear infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes floatParticles {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-100px); }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .modes-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }
  
  .mode-card {
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .breathing-training-container {
    padding: 1.5rem;
  }
  
  .page-header {
    margin-bottom: 3rem;
  }
  
  .header-background {
    padding: 1.5rem;
    border-radius: 20px;
  }
  
  .page-header h1 {
    font-size: 2.5rem;
  }
  
  .page-description {
    font-size: 1.1rem;
  }
  
  .section-title {
    font-size: 1.8rem;
    margin-bottom: 2rem;
  }
  
  .modes-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .mode-card {
    padding: 1.8rem;
  }
  
  .mode-icon {
    font-size: 3.5rem;
  }
  
  .mode-card h3 {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .breathing-training-container {
    padding: 1rem;
  }
  
  .header-background {
    padding: 1rem;
    border-radius: 15px;
  }
  
  .breathing-animation {
    height: 120px;
  }
  
  .breath-circle {
    width: 80px;
    height: 80px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-description {
    font-size: 1rem;
    line-height: 1.6;
  }
  
  .section-title {
    font-size: 1.6rem;
  }
  
  .mode-card {
    padding: 1.5rem;
    border-radius: 20px;
  }
  
  .mode-icon {
    font-size: 3rem;
  }
  
  .mode-card h3 {
    font-size: 1.4rem;
  }
  
  .mode-pattern,
  .mode-duration,
  .mode-age {
    padding: 0.6rem 0.8rem;
    margin-bottom: 0.6rem;
  }
  
  .pattern-value,
  .duration-value,
  .age-value {
    padding: 0.2rem 0.6rem;
    font-size: 0.9rem;
  }
}

/* 加载动画 */
.breathing-training-container {
  animation: fadeInUp 0.8s ease-out;
}

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

/* 卡片进入动画 */
.mode-card {
  animation: slideInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.mode-card:nth-child(1) { animation-delay: 0.1s; }
.mode-card:nth-child(2) { animation-delay: 0.2s; }
.mode-card:nth-child(3) { animation-delay: 0.3s; }

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>