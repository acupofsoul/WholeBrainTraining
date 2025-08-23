<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">全脑训练工具</h1>
      <nav class="main-nav">
        <router-link to="/" class="nav-link">首页</router-link>
        
        <!-- 冥想训练 -->
        <div class="nav-item">
          <router-link to="/meditation" class="nav-link">冥想训练</router-link>
          <div class="dropdown-menu">
            <router-link to="/meditation/breathing" class="dropdown-item">呼吸训练</router-link>
            <router-link to="/meditation/visualization" class="dropdown-item">想象力训练</router-link>
            <router-link to="/meditation/mindfulness" class="dropdown-item">正念训练</router-link>
            <div class="dropdown-item has-submenu">
              <span class="submenu-title">引导冥想</span>
              <div class="submenu">
                <router-link to="/meditation/mindfulness" class="submenu-item">正念冥想</router-link>
                <router-link to="/meditation/relaxation" class="submenu-item">放松冥想</router-link>
                <router-link to="/meditation/focus" class="submenu-item">专注冥想</router-link>
                <router-link to="/meditation/sleep" class="submenu-item">睡眠冥想</router-link>
                <router-link to="/meditation/healing" class="submenu-item">疗愈冥想</router-link>
                <router-link to="/meditation/creativity" class="submenu-item">创造力冥想</router-link>
              </div>
            </div>
            <router-link to="/meditation/brainwave-generator" class="dropdown-item">脑波生成器</router-link>
            <router-link to="/meditation/metronome" class="dropdown-item">节拍器</router-link>
          </div>
        </div>
        
        <!-- 基础训练 -->
        <div class="nav-item">
          <router-link to="/basic-training" class="nav-link">基础训练</router-link>
          <div class="dropdown-menu">
            <router-link to="/basic-training/overall-perception" class="dropdown-item">整体感知</router-link>
            <router-link to="/basic-training/expand-vision" class="dropdown-item">视野扩展</router-link>
            <router-link to="/basic-training/reading-rhythm" class="dropdown-item">阅读节奏</router-link>
            <router-link to="/basic-training/fluency" class="dropdown-item">流畅性训练</router-link>
            <router-link to="/basic-training/attention" class="dropdown-item">注意力训练</router-link>
            <router-link to="/basic-training/schulte" class="dropdown-item">舒尔特表</router-link>
            <router-link to="/basic-training/ultra-high-speed-flash" class="dropdown-item">超高速闪记</router-link>
          </div>
        </div>
        
        <!-- 闪视训练 -->
        <div class="nav-item">
          <router-link to="/flash-training" class="nav-link">闪视训练</router-link>
          <div class="dropdown-menu">
            <router-link to="/flash-training/basic-flash" class="dropdown-item">基础闪视</router-link>
            <router-link to="/flash-training/article-flash" class="dropdown-item">文章闪视</router-link>
            <router-link to="/flash-training/image-flash" class="dropdown-item">图像闪视</router-link>
            <router-link to="/flash-training/custom-word-flash" class="dropdown-item">自定义单词</router-link>
            <router-link to="/flash-training/custom-image-flash" class="dropdown-item">自定义图片</router-link>
          </div>
        </div>
        
        <!-- 速读训练 -->
        <div class="nav-item">
          <router-link to="/speed-reading" class="nav-link">速读训练</router-link>
          <div class="dropdown-menu">
            <router-link to="/speed-reading/article-reading" class="dropdown-item">文章速读</router-link>
            <router-link to="/speed-reading/3d-reading" class="dropdown-item">3D速读</router-link>
          </div>
        </div>
        
        <!-- 照相记忆 -->
        <div class="nav-item">
          <router-link to="/photographic-memory" class="nav-link">照相记忆</router-link>
          <div class="dropdown-menu">
            <router-link to="/photographic-memory/afterimage" class="dropdown-item">残像训练</router-link>
            <router-link to="/photographic-memory/color-perception" class="dropdown-item">色彩感知</router-link>
            <router-link to="/photographic-memory/3d-cards" class="dropdown-item">3D卡片</router-link>
            <router-link to="/photographic-memory/thousand-images" class="dropdown-item">1000图训练</router-link>
            <router-link to="/photographic-memory/memory-training" class="dropdown-item">记忆训练</router-link>
            <router-link to="/photographic-memory/instant-calculation" class="dropdown-item">瞬时计算</router-link>
            
            <router-link to="/photographic-memory/progress" class="dropdown-item">训练进度分析</router-link>
          </div>
        </div>
        
        <!-- 能力测评 -->
        <div class="nav-item">
          <router-link to="/abilities" class="nav-link">能力测评</router-link>
          <div class="dropdown-menu">
            <router-link to="/abilities/comprehensive" class="dropdown-item">综合能力</router-link>
            <router-link to="/abilities/spatial" class="dropdown-item">空间能力</router-link>
            <router-link to="/abilities/observation" class="dropdown-item">观察能力</router-link>
            <router-link to="/abilities/calculation" class="dropdown-item">计算能力</router-link>
            <router-link to="/abilities/memory" class="dropdown-item">记忆能力</router-link>
          </div>
        </div>
        
        <router-link to="/settings" class="nav-link">设置</router-link>
      </nav>
    </header>
    
    <main class="app-content">
      <router-view />
    </main>
    
    <footer class="app-footer">
      <p>全脑训练工具 &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useSettingsStore, useTrainingStore } from './stores';
import { checkAndCreateAutoBackup } from './services/storage';

// 获取存储实例
const settingsStore = useSettingsStore();
const trainingStore = useTrainingStore();

// 在应用挂载时初始化数据
onMounted(async () => {
  // 初始化用户设置
  await settingsStore.initSettings();
  
  // 初始化训练数据
  await trainingStore.initTrainingData();
  
  // 检查是否需要创建自动备份
  const settings = settingsStore.settings;
  if (settings && settings.dataManagement && settings.dataManagement.autoBackupEnabled) {
    await checkAndCreateAutoBackup(settings.dataManagement.backupInterval);
  }
});
</script>

<style>
/* Base styles for the app container */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: var(--color-card-bg);
  padding: 0.8rem 1.5rem;
  box-shadow: var(--shadow-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  transition: all var(--transition-normal) ease;
}

.app-title {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.8rem;
  transition: all var(--transition-normal) ease;
}

.main-nav {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  align-items: center;
}

.nav-item {
  position: relative;
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 0.4rem 0.7rem;
  border-radius: 4px;
  transition: all var(--transition-normal) ease;
  position: relative;
  overflow: hidden;
  display: block;
  font-size: 0.9rem;
}

.nav-link:hover {
  color: var(--color-primary);
  background-color: rgba(var(--color-primary-rgb), 0.1);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  font-weight: 600;
  background-color: rgba(var(--color-primary-rgb), 0.15);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--color-card-bg);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-normal) ease;
  min-width: 180px;
  z-index: 1000;
  border: 1px solid var(--color-border);
  padding: 0.5rem 0;
}

.nav-item:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 0.75rem 1rem;
  display: block;
  transition: all var(--transition-normal) ease;
  border-radius: 0;
  position: relative;
}

.dropdown-item.has-submenu {
  cursor: pointer;
}

.submenu-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.submenu-title::after {
  content: '▶';
  font-size: 0.8rem;
  transition: transform var(--transition-normal) ease;
}

.dropdown-item.has-submenu:hover .submenu-title::after {
  transform: rotate(90deg);
}

.submenu {
  position: absolute;
  top: 0;
  left: 100%;
  background-color: var(--color-card-bg);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  opacity: 0;
  visibility: hidden;
  transform: translateX(-10px);
  transition: all var(--transition-normal) ease;
  min-width: 160px;
  z-index: 1001;
  border: 1px solid var(--color-border);
  padding: 0.5rem 0;
  margin-left: 5px;
}

.dropdown-item.has-submenu:hover .submenu {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.submenu-item {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 0.6rem 1rem;
  display: block;
  transition: all var(--transition-normal) ease;
  border-radius: 0;
  font-size: 0.9rem;
}

.submenu-item:hover {
  color: var(--color-primary);
  background-color: rgba(var(--color-primary-rgb), 0.1);
  transform: translateX(5px);
}

.submenu-item.router-link-active {
  color: var(--color-primary);
  background-color: rgba(var(--color-primary-rgb), 0.15);
  font-weight: 600;
}

.dropdown-item:hover {
  color: var(--color-primary);
  background-color: rgba(var(--color-primary-rgb), 0.1);
  transform: translateX(5px);
}

.dropdown-item.router-link-active {
  color: var(--color-primary);
  background-color: rgba(var(--color-primary-rgb), 0.15);
  font-weight: 600;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: var(--color-primary);
  transition: all var(--transition-normal) ease;
  transform: translateX(-50%);
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 80%;
}

.app-content {
  flex: 1;
  padding: 2rem;
  max-width: 1600px;
  width: 90%;
  margin: 0 auto;
  box-sizing: border-box;
}

.app-footer {
  background-color: var(--color-card-bg);
  padding: 1rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  box-shadow: var(--shadow-md);
}

/* 主流笔记本屏幕优化 (1366px - 1920px) */
@media (min-width: 1366px) and (max-width: 1920px) {
  .app-content {
    max-width: 1500px;
    width: 88%;
    padding: 1.8rem;
  }
  
  .app-header {
    padding: 0.8rem 2rem;
  }
  
  .app-title {
    font-size: 1.9rem;
  }
  
  .main-nav {
    gap: 1rem;
  }
  
  .nav-link {
    padding: 0.5rem 0.8rem;
    font-size: 0.95rem;
  }
}

/* 高分辨率笔记本屏幕 (1920px+) */
@media (min-width: 1920px) {
  .app-content {
    max-width: 1600px;
    width: 85%;
    padding: 2rem;
  }
  
  .app-header {
    padding: 1rem 2.5rem;
  }
  
  .app-title {
    font-size: 2rem;
  }
  
  .main-nav {
    gap: 1.2rem;
  }
  
  .nav-link {
    padding: 0.5rem 0.9rem;
    font-size: 1rem;
  }
}

/* 平板和手机屏幕 */
@media (max-width: 768px) {
  .main-nav {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .app-content {
    padding: 1rem;
  }
}
</style>