<template>
  <div class="meditation-container">
    <!-- 面包屑导航 -->
    <BreadcrumbDropdown 
      v-if="$route.path !== '/meditation'"
      :main-title="'冥想训练'"
      :main-path="'/meditation'"
      :current-title="getModuleTitle($route.path)"
      :sibling-modules="siblingModules"
    />

    <!-- 页面头部 -->
    <div class="page-header" v-if="$route.path === '/meditation'">
      <h1>冥想训练</h1>
      <p class="page-description">
        通过冥想训练帮助放松身心，提高专注力
      </p>
    </div>

    <!-- 专项训练 -->
    <div class="sub-modules-section" v-if="$route.path === '/meditation'">
      <h2 class="section-title">专项训练</h2>
      <div class="sub-modules-grid">
        <div class="sub-module-card" @click="navigateTo('/meditation/breathing')">
          <div class="sub-module-icon">🫁</div>
          <h4>呼吸训练</h4>
          <p>通过呼吸节奏训练提升专注力</p>
        </div>

        <div class="sub-module-card" @click="navigateTo('/meditation/visualization')">
          <div class="sub-module-icon">🌈</div>
          <h4>想象力训练</h4>
          <p>通过引导想象激发创造力</p>
        </div>

        <div class="sub-module-card" @click="navigateTo('/meditation/mindfulness')">
          <div class="sub-module-icon">🧘‍♀️</div>
          <h4>正念训练</h4>
          <p>培养当下觉察能力</p>
        </div>
      </div>
    </div>

    <!-- 训练模块 -->
    <div class="modules-section" v-if="$route.path === '/meditation'">
      <h2 class="section-title">训练模块</h2>
      <div class="training-modules">
        <div class="module-card" @click="navigateTo('/meditation/guided')">
          <div class="module-icon">🎧</div>
          <h3>引导冥想</h3>
          <p>通过语音引导学会放松和集中注意力</p>
        </div>

        <div class="module-card" @click="navigateTo('/meditation/brainwave-generator')">
          <div class="module-icon">🧠</div>
          <h3>脑波发生器</h3>
          <p>使用特定频率音频帮助大脑进入最佳状态</p>
        </div>

        <div class="module-card" @click="navigateTo('/meditation/metronome')">
          <div class="module-icon">⏱️</div>
          <h3>节拍器训练</h3>
          <p>通过节奏训练提高专注力和时间感知</p>
        </div>
      </div>
    </div>



    <!-- 子路由内容 -->
    <router-view v-if="$route.path !== '/meditation'" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BreadcrumbDropdown from '../components/BreadcrumbDropdown.vue';

const router = useRouter();
const route = useRoute();

// 同级模块列表
const siblingModules = [
  { path: '/meditation/guided', title: '引导冥想' },
  { path: '/meditation/brainwave-generator', title: '脑波发生器' },
  { path: '/meditation/metronome', title: '节拍器训练' },
  { path: '/meditation/breathing', title: '呼吸训练' },
  { path: '/meditation/visualization', title: '想象力训练' },
  { path: '/meditation/mindfulness', title: '正念训练' }
];

// 模块标题映射
const moduleTitles = {
  '/meditation/guided': '引导冥想',
  '/meditation/brainwave-generator': '脑波发生器',
  '/meditation/metronome': '节拍器训练',
  '/meditation/breathing': '呼吸训练',
  '/meditation/breathing/basic': '基础呼吸训练',
  '/meditation/breathing/relaxation': '放松呼吸训练',
  '/meditation/breathing/focus': '专注呼吸训练',
  '/meditation/visualization': '想象力训练',
  '/meditation/mindfulness': '正念训练',
  '/meditation/guided/mindfulness': '正念冥想',
  '/meditation/guided/relaxation': '放松冥想',
  '/meditation/guided/focus': '专注冥想',
  '/meditation/guided/sleep': '睡眠冥想',
  '/meditation/guided/healing': '疗愈冥想',
  '/meditation/guided/creativity': '创造力冥想'
};

// 获取模块标题
const getModuleTitle = (path) => {
  return moduleTitles[path] || '冥想训练';
};

// 方法
const navigateTo = (path) => {
  router.push(path);
};


</script>

<style scoped>
.meditation-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 面包屑导航样式 - 菜单栏下方小字显示 */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 400;
  text-decoration: none;
  transition: color 0.2s ease;
  border: none;
  background: none;
}

.breadcrumb-item:hover {
  color: var(--color-primary);
}

.breadcrumb-separator {
  color: #666;
  font-size: 0.8rem;
  margin: 0;
}

.breadcrumb-current {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.8rem;
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

.icon-arrow-left::before {
  content: '←';
  font-size: 1rem;
}

/* 模块内容样式 */
.module-content {
  min-height: 60vh;
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

.page-header {
  position: relative;
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 0;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05) 0%, rgba(var(--color-secondary-rgb), 0.05) 100%);
  border-radius: 20px;
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(var(--color-primary-rgb), 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 60px;
  height: 60px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 40px;
  height: 40px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.page-header h1 {
  position: relative;
  z-index: 2;
  color: var(--color-primary);
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.page-description {
  position: relative;
  z-index: 2;
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto 2rem;
}

.quick-start-section {
  position: relative;
  z-index: 2;
  margin-top: 2rem;
}

.quick-start-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 15px rgba(var(--color-primary-rgb), 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.4);
}

.btn-icon {
  font-size: 1.2rem;
}

.quick-start-hint {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  opacity: 0.8;
}

/* 今日推荐 */
.daily-recommendation {
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05) 0%, rgba(var(--color-secondary-rgb), 0.05) 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.recommendation-header h3 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.3rem;
}

.recommendation-badge {
  background: var(--color-primary);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.recommendation-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.recommendation-info h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.recommendation-info p {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.recommendation-meta {
  display: flex;
  gap: 1rem;
}

.recommendation-meta span {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.start-recommendation-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.start-recommendation-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* 模块部分 */
.modules-section {
  margin-bottom: 3rem;
}

.section-title {
  color: var(--color-primary);
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

.training-modules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.module-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  box-shadow: var(--shadow-md);
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
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transform: scaleX(0);
  transition: transform var(--transition-normal);
}

.module-card:hover::before {
  transform: scaleX(1);
}

.module-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(var(--color-primary-rgb), 0.2);
}

.module-card.guided-meditation:hover {
  border-color: #4CAF50;
}

.module-card.brainwave:hover {
  border-color: #2196F3;
}

.module-card.metronome:hover {
  border-color: #FF9800;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.module-icon {
  font-size: 3rem;
  margin-bottom: 0;
}

.module-status {
  background: rgba(var(--color-text-secondary-rgb), 0.1);
  color: var(--color-text-secondary);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.module-status.active {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.module-card h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.3rem;
  text-align: left;
}

.module-card p {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
  text-align: left;
}

.module-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.feature-tag {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.module-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  background: rgba(var(--color-primary-rgb), 0.1);
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  height: 100%;
  border-radius: 3px;
  transition: width var(--transition-normal);
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.module-level {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
  margin-top: 1rem;
}

.progress-section {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h3 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.view-details-btn {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.view-details-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.2);
}

.view-analytics-btn {
  background: var(--color-secondary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-analytics-btn:hover {
  background: var(--color-secondary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.progress-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
}

.stat-card.primary::before {
  background: linear-gradient(90deg, #4CAF50, #45a049);
}

.stat-card.secondary::before {
  background: linear-gradient(90deg, #FF5722, #f4511e);
}

.stat-card.tertiary::before {
  background: linear-gradient(90deg, #2196F3, #1976d2);
}

.stat-card.quaternary::before {
  background: linear-gradient(90deg, #FF9800, #f57c00);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: rgba(var(--color-primary-rgb), 0.2);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  line-height: 1;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-align: center;
}

.stat-trend {
  font-size: 0.8rem;
  color: var(--color-success);
  font-weight: 600;
}

.stat-trend.positive {
  color: var(--color-success);
}

.stat-trend.negative {
  color: var(--color-warning);
}

/* 详细统计 */
.detailed-stats {
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.1);
  padding-top: 2rem;
  margin-top: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.detail-stat {
  text-align: center;
  padding: 1.5rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 12px;
}

.detail-stat h4 {
  color: var(--color-primary);
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.goal-progress {
  margin-top: 0.5rem;
}

.goal-bar {
  background: rgba(var(--color-primary-rgb), 0.2);
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.goal-fill {
  background: var(--color-success);
  height: 100%;
  border-radius: 3px;
  transition: width var(--transition-normal);
}

.goal-text {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.best-streak, .average-session {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.3rem;
}

.streak-number, .session-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.streak-unit, .session-unit {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.favorite-module .module-name {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 1.1rem;
}

/* 旧的成就系统样式已移除，现在使用AchievementSystem组件 */

/* 平板设备优化 */
@media (max-width: 1024px) {
  .meditation-container {
    padding: 1.5rem;
  }
  
  .training-modules {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .module-card {
    padding: 1.8rem;
  }
  
  .sub-modules-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .meditation-container {
    padding: 1rem;
  }
  
  .page-header {
    padding: 2rem 0;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-description {
    font-size: 1rem;
    padding: 0 1rem;
  }
  
  .quick-start-btn {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    width: 100%;
    max-width: 300px;
    /* 触控优化 */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  .quick-start-btn:active {
    transform: scale(0.98);
  }
  
  .recommendation-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .start-recommendation-btn {
    align-self: center;
    padding: 0.8rem 1.5rem;
    width: 100%;
    max-width: 200px;
    /* 触控优化 */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  .start-recommendation-btn:active {
    transform: scale(0.98);
  }
  
  .training-modules {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .module-card {
    padding: 1.5rem;
    margin: 0;
    /* 增强触控反馈 */
    -webkit-tap-highlight-color: rgba(149, 225, 211, 0.2);
    touch-action: manipulation;
  }
  
  .module-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  .module-icon {
    font-size: 2.5rem;
  }
  
  .sub-modules-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .sub-module-card {
    padding: 1.5rem;
    /* 增强触控反馈 */
    -webkit-tap-highlight-color: rgba(149, 225, 211, 0.2);
    touch-action: manipulation;
  }
  
  .sub-module-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  .sub-module-icon {
    font-size: 2rem;
  }
  
  .progress-overview {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1.5rem;
    text-align: center;
  }
  
  .stat-value {
    font-size: 1.8rem;
  }
  
  .achievement-item {
    padding: 1rem;
    /* 触控优化 */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  .achievement-item:active {
    transform: scale(0.98);
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .achievements-list {
    grid-template-columns: 1fr;
  }
  
  .achievement-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .meditation-container {
    padding: 0.5rem;
  }
  
  .page-header {
    padding: 1.5rem 0;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .daily-recommendation {
    padding: 1.5rem;
  }
  
  .recommendation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .module-card {
    padding: 1rem;
  }
  
  .module-features {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .progress-overview {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    font-size: 2rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .detail-stat {
    padding: 1rem;
  }
  
  .streak-number, .session-number {
    font-size: 1.5rem;
  }
  
  .sub-modules-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .sub-module-card {
    padding: 1.5rem;
  }
}

/* 触控设备优化 */
@media (hover: none) and (pointer: coarse) {
  .module-card,
  .sub-module-card,
  .quick-start-btn,
  .start-recommendation-btn {
    /* 增加触控目标大小 */
    min-height: 44px;
    /* 移除悬停效果 */
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }
  
  .module-card:hover,
  .sub-module-card:hover,
  .quick-start-btn:hover,
  .start-recommendation-btn:hover {
    transform: none;
  }
  
  /* 添加触控反馈 */
  .module-card:active,
  .sub-module-card:active,
  .quick-start-btn:active,
  .start-recommendation-btn:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-sm);
  }
}

@media (max-width: 480px) {
  .meditation-container {
    padding: 0.5rem;
  }
  
  .page-header {
    padding: 1.5rem 0;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .daily-recommendation {
    padding: 1.5rem;
  }
  
  .recommendation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .module-card {
    padding: 1rem;
  }
  
  .module-features {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .progress-overview {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    font-size: 2rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .detail-stat {
    padding: 1rem;
  }
  
  .streak-number, .session-number {
    font-size: 1.5rem;
  }
  
  .sub-modules-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .sub-module-card {
    padding: 1.5rem;
  }
}

/* 子模块样式 */
.sub-modules-section {
  margin-bottom: 3rem;
}

.sub-modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.sub-module-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.sub-module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(var(--color-primary-rgb), 0.05) 0%, 
    rgba(var(--color-secondary-rgb), 0.05) 100%);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.sub-module-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(var(--color-primary-rgb), 0.2);
}

.sub-module-card:hover::before {
  opacity: 1;
}

.sub-module-card.breathing {
  border-left: 4px solid #4ECDC4;
}

.sub-module-card.visualization {
  border-left: 4px solid #FF6B6B;
}

.sub-module-card.mindfulness {
  border-left: 4px solid #95E1D3;
}

.sub-module-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.sub-module-card h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.sub-module-card p {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
  font-size: 0.95rem;
}

.sub-module-features {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sub-feature-tag {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.sub-module-card.breathing .sub-feature-tag {
  background: rgba(78, 205, 196, 0.1);
  color: #4ECDC4;
}

.sub-module-card.visualization .sub-feature-tag {
  background: rgba(255, 107, 107, 0.1);
  color: #FF6B6B;
}

.sub-module-card.mindfulness .sub-feature-tag {
  background: rgba(149, 225, 211, 0.1);
  color: #95E1D3;
}
</style>