<template>
  <div class="photo-memory-progress">
    <div class="progress-header">
      <h2>照相记忆训练进度</h2>
      <p>全面分析您的照相记忆训练表现</p>
    </div>

    <!-- 总体概览 -->
    <div class="overview-section">
      <h3>训练概览</h3>
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <div class="card-number">{{ overallStats.totalSessions }}</div>
            <div class="card-label">总训练次数</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">⏱️</div>
          <div class="card-content">
            <div class="card-number">{{ formatTime(overallStats.totalTime) }}</div>
            <div class="card-label">总训练时间</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">🎯</div>
          <div class="card-content">
            <div class="card-number">{{ Math.round(overallStats.averageAccuracy) }}%</div>
            <div class="card-label">平均准确率</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">🏆</div>
          <div class="card-content">
            <div class="card-number">{{ overallStats.modulesCompleted?.length || 0 }}</div>
            <div class="card-label">完成模块</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模块选择 -->
    <div class="module-selection">
      <h3>选择训练模块</h3>
      <div class="module-tabs">
        <button 
          v-for="module in modules" 
          :key="module.key"
          :class="['module-tab', { active: selectedModule === module.key }]"
          @click="selectedModule = module.key"
        >
          <span class="tab-icon">{{ module.icon }}</span>
          <span class="tab-name">{{ module.name }}</span>
        </button>
      </div>
    </div>

    <!-- 详细统计 -->
    <div class="detailed-stats" v-if="selectedModuleStats">
      <h3>{{ getModuleName(selectedModule) }} - 详细统计</h3>
      
      <!-- 基础统计 -->
      <div class="stats-grid">
        <div class="stat-card">
          <h4>训练次数</h4>
          <div class="stat-value">{{ selectedModuleStats.totalSessions }}</div>
        </div>
        <div class="stat-card">
          <h4>训练时间</h4>
          <div class="stat-value">{{ formatTime(selectedModuleStats.totalTime) }}</div>
        </div>
        <div class="stat-card">
          <h4>平均准确率</h4>
          <div class="stat-value">{{ Math.round(selectedModuleStats.averageAccuracy) }}%</div>
        </div>
        <div class="stat-card">
          <h4>最佳成绩</h4>
          <div class="stat-value">{{ selectedModuleStats.bestScore }}</div>
        </div>
        <div class="stat-card">
          <h4>连续训练</h4>
          <div class="stat-value">{{ selectedModuleStats.currentStreak }} 天</div>
        </div>
        <div class="stat-card">
          <h4>最长连续</h4>
          <div class="stat-value">{{ selectedModuleStats.longestStreak }} 天</div>
        </div>
      </div>

      <!-- 模块特定统计 -->
      <div class="module-specific-stats" v-if="hasModuleSpecificStats">
        <!-- 记忆训练特定统计 -->
        <div v-if="selectedModule === 'memoryTraining'" class="memory-training-stats">
          <h4>各模式表现</h4>
          <div class="mode-stats-grid">
            <div 
              v-for="(stats, mode) in selectedModuleStats.modeStats" 
              :key="mode"
              class="mode-stat-card"
            >
              <div class="mode-name">{{ getModeDisplayName(mode) }}</div>
              <div class="mode-metrics">
                <div class="metric">
                  <span class="metric-label">训练次数:</span>
                  <span class="metric-value">{{ stats.sessions }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">准确率:</span>
                  <span class="metric-value">{{ Math.round(stats.accuracy) }}%</span>
                </div>
                <div class="metric">
                  <span class="metric-label">最佳成绩:</span>
                  <span class="metric-value">{{ stats.bestScore }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 颜色感知特定统计 -->
        <div v-if="selectedModule === 'colorPerception'" class="color-perception-stats">
          <h4>难度进度</h4>
          <div class="difficulty-progress">
            <div 
              v-for="(progress, difficulty) in selectedModuleStats.difficultyProgress" 
              :key="difficulty"
              class="difficulty-item"
            >
              <div class="difficulty-name">{{ getDifficultyDisplayName(difficulty) }}</div>
              <div class="difficulty-metrics">
                <div class="metric">
                  <span class="metric-label">完成次数:</span>
                  <span class="metric-value">{{ progress.completed }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">准确率:</span>
                  <span class="metric-value">{{ Math.round(progress.accuracy) }}%</span>
                </div>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: Math.min(progress.accuracy, 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 残像训练特定统计 -->
        <div v-if="selectedModule === 'afterimage'" class="afterimage-stats">
          <h4>训练偏好</h4>
          <div class="preference-stats">
            <div class="preference-item">
              <span class="preference-label">偏好图形:</span>
              <span class="preference-value">{{ getImageTypeDisplayName(selectedModuleStats.preferredImageType) }}</span>
            </div>
            <div class="preference-item">
              <span class="preference-label">偏好颜色:</span>
              <span class="preference-value">{{ getColorDisplayName(selectedModuleStats.preferredColor) }}</span>
            </div>
            <div class="preference-item">
              <span class="preference-label">平均凝视时间:</span>
              <span class="preference-value">{{ Math.round(selectedModuleStats.averageGazeTime) }} 秒</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 进度分析 -->
    <div class="progress-analysis" v-if="progressAnalysis">
      <h3>进度分析</h3>
      <div class="analysis-content">
        <div class="analysis-metrics">
          <div class="metric-item">
            <div class="metric-title">改进程度</div>
            <div class="metric-bar">
              <div 
                class="metric-fill improvement"
                :style="{ width: progressAnalysis.improvement + '%' }"
              ></div>
            </div>
            <div class="metric-percentage">{{ Math.round(progressAnalysis.improvement) }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-title">训练一致性</div>
            <div class="metric-bar">
              <div 
                class="metric-fill consistency"
                :style="{ width: progressAnalysis.consistency + '%' }"
              ></div>
            </div>
            <div class="metric-percentage">{{ Math.round(progressAnalysis.consistency) }}%</div>
          </div>
        </div>

        <div class="analysis-insights">
          <div class="insights-section" v-if="progressAnalysis.strengths.length > 0">
            <h4>💪 优势</h4>
            <ul class="insights-list strengths">
              <li v-for="strength in progressAnalysis.strengths" :key="strength">
                {{ strength }}
              </li>
            </ul>
          </div>

          <div class="insights-section" v-if="progressAnalysis.weaknesses.length > 0">
            <h4>📈 改进空间</h4>
            <ul class="insights-list weaknesses">
              <li v-for="weakness in progressAnalysis.weaknesses" :key="weakness">
                {{ weakness }}
              </li>
            </ul>
          </div>

          <div class="insights-section" v-if="progressAnalysis.recommendations.length > 0">
            <h4>💡 建议</h4>
            <ul class="insights-list recommendations">
              <li v-for="recommendation in progressAnalysis.recommendations" :key="recommendation">
                {{ recommendation }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="data-management">
      <h3>数据管理</h3>
      <div class="management-actions">
        <button @click="exportData" class="action-btn export">
          <span class="btn-icon">📤</span>
          导出数据
        </button>
        <button @click="importData" class="action-btn import">
          <span class="btn-icon">📥</span>
          导入数据
        </button>
        <button @click="clearData" class="action-btn clear">
          <span class="btn-icon">🗑️</span>
          清除数据
        </button>
      </div>
    </div>

    <!-- 导入文件输入 -->
    <input 
      ref="fileInput" 
      type="file" 
      accept=".json" 
      @change="handleFileImport" 
      style="display: none;"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import photoMemoryStorage from '../../services/photoMemoryStorage.js';

// 响应式数据
const selectedModule = ref('memoryTraining');
const overallStats = reactive({});
const moduleStats = reactive({});
const fileInput = ref(null);

// 模块配置
const modules = [
  { key: 'afterimage', name: '残像训练', icon: '👁️' },
  { key: 'colorPerception', name: '色彩感知', icon: '🌈' },
  { key: 'threeDCard', name: '3D卡片', icon: '🃏' },
  { key: 'thousandImages', name: '千图训练', icon: '🖼️' },
  { key: 'memoryTraining', name: '记忆训练', icon: '🧠' },
  { key: 'instantCalculation', name: '超高速自动处理', icon: '🔢' }
];

// 计算属性
const selectedModuleStats = computed(() => {
  return moduleStats[selectedModule.value] || null;
});

const hasModuleSpecificStats = computed(() => {
  const stats = selectedModuleStats.value;
  if (!stats) return false;
  
  return (
    (selectedModule.value === 'memoryTraining' && stats.modeStats) ||
    (selectedModule.value === 'colorPerception' && stats.difficultyProgress) ||
    (selectedModule.value === 'afterimage' && stats.preferredImageType)
  );
});

const progressAnalysis = computed(() => {
  if (!selectedModuleStats.value) return null;
  return photoMemoryStorage.getProgressAnalysis(selectedModule.value);
});

// 方法
const loadAllStats = () => {
  // 加载总体统计
  Object.assign(overallStats, photoMemoryStorage.getOverallStats());
  
  // 加载各模块统计
  modules.forEach(module => {
    moduleStats[module.key] = photoMemoryStorage.getStats(module.key);
  });
};

const getModuleName = (moduleKey) => {
  const module = modules.find(m => m.key === moduleKey);
  return module ? module.name : moduleKey;
};

const getModeDisplayName = (mode) => {
  const modeNames = {
    numbers: '数字记忆',
    images: '图像记忆',
    words: '单词记忆',
    colors: '颜色记忆',
    shapes: '形状记忆',
    faces: '人脸记忆'
  };
  return modeNames[mode] || mode;
};

const getDifficultyDisplayName = (difficulty) => {
  const difficultyNames = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };
  return difficultyNames[difficulty] || difficulty;
};

const getImageTypeDisplayName = (type) => {
  const typeNames = {
    circle: '圆形',
    square: '方形',
    triangle: '三角形',
    star: '星形'
  };
  return typeNames[type] || type;
};

const getColorDisplayName = (color) => {
  const colorNames = {
    red: '红色',
    blue: '蓝色',
    green: '绿色',
    yellow: '黄色'
  };
  return colorNames[color] || color;
};

const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${Math.round(seconds)}秒`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}分钟`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours}小时${minutes}分钟`;
  }
};

const exportData = () => {
  try {
    const data = photoMemoryStorage.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photo-memory-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('数据导出成功！');
  } catch (error) {
    console.error('Export error:', error);
    alert('导出失败，请重试。');
  }
};

const importData = () => {
  fileInput.value?.click();
};

const handleFileImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (photoMemoryStorage.importData(data)) {
        loadAllStats();
        alert('数据导入成功！');
      } else {
        alert('导入失败，请检查文件格式。');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('导入失败，文件格式不正确。');
    }
  };
  reader.readAsText(file);
  
  // 清空文件输入
  event.target.value = '';
};

const clearData = () => {
  if (confirm('确定要清除所有训练数据吗？此操作不可恢复。')) {
    if (photoMemoryStorage.clearAllData()) {
      loadAllStats();
      alert('数据清除成功！');
    } else {
      alert('清除失败，请重试。');
    }
  }
};

// 监听模块切换
watch(selectedModule, () => {
  // 可以在这里添加模块切换时的逻辑
});

// 组件挂载时加载数据
onMounted(() => {
  loadAllStats();
});
</script>

<style scoped>
.photo-memory-progress {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.progress-header {
  text-align: center;
  margin-bottom: 40px;
}

.progress-header h2 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.progress-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* 总体概览 */
.overview-section {
  margin-bottom: 40px;
}

.overview-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.overview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: transform 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-5px);
}

.card-icon {
  font-size: 2.5rem;
}

.card-content {
  flex: 1;
}

.card-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.card-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 模块选择 */
.module-selection {
  margin-bottom: 40px;
}

.module-selection h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.module-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.module-tab {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
}

.module-tab:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.module-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.tab-icon {
  font-size: 1.2rem;
}

/* 详细统计 */
.detailed-stats {
  margin-bottom: 40px;
}

.detailed-stats h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
}

.stat-card h4 {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 10px;
  font-weight: 500;
}

.stat-value {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: bold;
}

/* 模块特定统计 */
.module-specific-stats {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.module-specific-stats h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.mode-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.mode-stat-card {
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.mode-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

.mode-metrics,
.difficulty-metrics {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.metric {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.metric-label {
  color: #7f8c8d;
}

.metric-value {
  color: #2c3e50;
  font-weight: 500;
}

.difficulty-progress {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.difficulty-item {
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.difficulty-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.preference-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.preference-label {
  color: #7f8c8d;
  font-weight: 500;
}

.preference-value {
  color: #2c3e50;
  font-weight: 600;
}

/* 进度分析 */
.progress-analysis {
  margin-bottom: 40px;
}

.progress-analysis h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.analysis-content {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
}

.analysis-metrics {
  margin-bottom: 30px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.metric-title {
  min-width: 100px;
  color: #2c3e50;
  font-weight: 500;
}

.metric-bar {
  flex: 1;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.metric-fill.improvement {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
}

.metric-fill.consistency {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.metric-percentage {
  min-width: 50px;
  text-align: right;
  color: #2c3e50;
  font-weight: 600;
}

.analysis-insights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.insights-section h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.insights-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.insights-list li {
  padding: 8px 12px;
  margin-bottom: 5px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.insights-list.strengths li {
  background: #d5f4e6;
  color: #27ae60;
  border-left: 4px solid #27ae60;
}

.insights-list.weaknesses li {
  background: #fadbd8;
  color: #e74c3c;
  border-left: 4px solid #e74c3c;
}

.insights-list.recommendations li {
  background: #e3f2fd;
  color: #3498db;
  border-left: 4px solid #3498db;
}

/* 数据管理 */
.data-management h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.management-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.export {
  background: #3498db;
  color: white;
}

.action-btn.export:hover {
  background: #2980b9;
}

.action-btn.import {
  background: #27ae60;
  color: white;
}

.action-btn.import:hover {
  background: #219a52;
}

.action-btn.clear {
  background: #e74c3c;
  color: white;
}

.action-btn.clear:hover {
  background: #c0392b;
}

.btn-icon {
  font-size: 1.1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .photo-memory-progress {
    padding: 15px;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .module-tabs {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mode-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .analysis-insights {
    grid-template-columns: 1fr;
  }
  
  .management-actions {
    flex-direction: column;
  }
  
  .metric-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .metric-title {
    min-width: auto;
  }
}
</style>