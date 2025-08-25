<template>
  <div class="photo-memory-progress-container">
    <div class="header">
      <h2>训练进度分析</h2>
      <p>查看您的照相记忆训练进度和成绩统计</p>
    </div>

    <div class="progress-overview">
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <h3>总训练次数</h3>
            <div class="card-value">{{ totalSessions }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">⏱️</div>
          <div class="card-content">
            <h3>总训练时长</h3>
            <div class="card-value">{{ formatTime(totalTime) }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">🎯</div>
          <div class="card-content">
            <h3>平均准确率</h3>
            <div class="card-value">{{ averageAccuracy }}%</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">🏆</div>
          <div class="card-content">
            <h3>最高分数</h3>
            <div class="card-value">{{ highestScore }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="module-progress">
      <h3>各模块训练进度</h3>
      <div class="modules-grid">
        <div class="module-card" v-for="module in moduleProgress" :key="module.id">
          <div class="module-header">
            <h4>{{ module.name }}</h4>
            <span class="module-level">{{ module.level }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: module.progress + '%' }"></div>
            <span class="progress-text">{{ module.progress }}%</span>
          </div>
          <div class="module-stats">
            <div class="stat">
              <span class="stat-label">训练次数:</span>
              <span class="stat-value">{{ module.sessions }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">最佳成绩:</span>
              <span class="stat-value">{{ module.bestScore }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">平均用时:</span>
              <span class="stat-value">{{ module.averageTime }}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-container">
        <h3>训练趋势图</h3>
        <div class="chart-placeholder">
          <canvas ref="trendChart" width="600" height="300"></canvas>
        </div>
      </div>
      
      <div class="chart-container">
        <h3>能力雷达图</h3>
        <div class="chart-placeholder">
          <canvas ref="radarChart" width="400" height="400"></canvas>
        </div>
      </div>
    </div>

    <div class="recent-sessions">
      <h3>最近训练记录</h3>
      <div class="sessions-table">
        <div class="table-header">
          <div class="header-cell">日期</div>
          <div class="header-cell">训练模块</div>
          <div class="header-cell">训练时长</div>
          <div class="header-cell">准确率</div>
          <div class="header-cell">得分</div>
          <div class="header-cell">等级</div>
        </div>
        <div class="table-body">
          <div class="table-row" v-for="session in recentSessions" :key="session.id">
            <div class="table-cell">{{ formatDate(session.date) }}</div>
            <div class="table-cell">{{ session.module }}</div>
            <div class="table-cell">{{ formatTime(session.duration) }}</div>
            <div class="table-cell">
              <span class="accuracy-badge" :class="getAccuracyClass(session.accuracy)">
                {{ session.accuracy }}%
              </span>
            </div>
            <div class="table-cell">{{ session.score }}</div>
            <div class="table-cell">
              <span class="level-badge" :class="session.levelClass">
                {{ session.level }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="achievements">
      <h3>成就徽章</h3>
      <div class="achievements-grid">
        <div class="achievement-card" 
             v-for="achievement in achievements" 
             :key="achievement.id"
             :class="{ unlocked: achievement.unlocked }">
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-content">
            <h4>{{ achievement.name }}</h4>
            <p>{{ achievement.description }}</p>
            <div class="achievement-progress" v-if="!achievement.unlocked">
              <div class="progress-bar small">
                <div class="progress-fill" :style="{ width: achievement.progress + '%' }"></div>
              </div>
              <span class="progress-text">{{ achievement.current }}/{{ achievement.target }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="export-section">
      <h3>数据导出</h3>
      <div class="export-buttons">
        <button @click="exportData('csv')" class="btn-export">
          <span class="export-icon">📊</span>
          导出CSV
        </button>
        <button @click="exportData('pdf')" class="btn-export">
          <span class="export-icon">📄</span>
          导出PDF报告
        </button>
        <button @click="exportData('json')" class="btn-export">
          <span class="export-icon">💾</span>
          导出JSON
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

// 响应式数据
const totalSessions = ref(156)
const totalTime = ref(18720) // 秒
const averageAccuracy = ref(78)
const highestScore = ref(2450)
const trendChart = ref(null)
const radarChart = ref(null)

// 模块进度数据
const moduleProgress = ref([
  {
    id: 'afterimage',
    name: '残像训练',
    level: '中级',
    progress: 75,
    sessions: 32,
    bestScore: 1850,
    averageTime: 45
  },
  {
    id: 'color-perception',
    name: '色彩感知',
    level: '高级',
    progress: 88,
    sessions: 28,
    bestScore: 2100,
    averageTime: 38
  },
  {
    id: '3d-cards',
    name: '3D卡片',
    level: '初级',
    progress: 45,
    sessions: 18,
    bestScore: 1200,
    averageTime: 52
  },
  {
    id: 'thousand-images',
    name: '1000图训练',
    level: '中级',
    progress: 62,
    sessions: 24,
    bestScore: 1650,
    averageTime: 48
  },
  {
    id: 'memory-training',
    name: '记忆训练',
    level: '高级',
    progress: 82,
    sessions: 35,
    bestScore: 2250,
    averageTime: 42
  },
  {
    id: 'instant-calculation',
    name: '超高速自动处理',
    level: '专家',
    progress: 95,
    sessions: 19,
    bestScore: 2450,
    averageTime: 35
  }
])

// 最近训练记录
const recentSessions = ref([
  {
    id: 1,
    date: new Date('2024-01-15'),
    module: '超高速自动处理',
    duration: 420,
    accuracy: 92,
    score: 2350,
    level: '专家',
    levelClass: 'expert'
  },
  {
    id: 2,
    date: new Date('2024-01-14'),
    module: '记忆训练',
    duration: 380,
    accuracy: 85,
    score: 2100,
    level: '高级',
    levelClass: 'advanced'
  },
  {
    id: 3,
    date: new Date('2024-01-13'),
    module: '色彩感知',
    duration: 450,
    accuracy: 78,
    score: 1950,
    level: '中级',
    levelClass: 'intermediate'
  },
  {
    id: 4,
    date: new Date('2024-01-12'),
    module: '1000图训练',
    duration: 520,
    accuracy: 72,
    score: 1680,
    level: '中级',
    levelClass: 'intermediate'
  },
  {
    id: 5,
    date: new Date('2024-01-11'),
    module: '残像训练',
    duration: 480,
    accuracy: 68,
    score: 1520,
    level: '初级',
    levelClass: 'beginner'
  }
])

// 成就数据
const achievements = ref([
  {
    id: 1,
    name: '初学者',
    description: '完成第一次训练',
    icon: '🎯',
    unlocked: true,
    progress: 100,
    current: 1,
    target: 1
  },
  {
    id: 2,
    name: '坚持不懈',
    description: '连续训练7天',
    icon: '🔥',
    unlocked: true,
    progress: 100,
    current: 7,
    target: 7
  },
  {
    id: 3,
    name: '百发百中',
    description: '单次训练准确率达到100%',
    icon: '🎪',
    unlocked: false,
    progress: 92,
    current: 92,
    target: 100
  },
  {
    id: 4,
    name: '速度之王',
    description: '平均反应时间低于30秒',
    icon: '⚡',
    unlocked: true,
    progress: 100,
    current: 28,
    target: 30
  },
  {
    id: 5,
    name: '全能选手',
    description: '所有模块都达到中级水平',
    icon: '🏆',
    unlocked: false,
    progress: 83,
    current: 5,
    target: 6
  },
  {
    id: 6,
    name: '记忆大师',
    description: '累计训练时间超过50小时',
    icon: '🧠',
    unlocked: false,
    progress: 62,
    current: 31,
    target: 50
  }
])

// 方法
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const getAccuracyClass = (accuracy) => {
  if (accuracy >= 90) return 'excellent'
  if (accuracy >= 80) return 'good'
  if (accuracy >= 70) return 'average'
  return 'poor'
}

const drawTrendChart = () => {
  const canvas = trendChart.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  
  // 清空画布
  ctx.clearRect(0, 0, width, height)
  
  // 模拟数据
  const data = [65, 68, 72, 75, 78, 82, 85, 88, 85, 87, 90, 92]
  const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  
  // 绘制坐标轴
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  
  // Y轴
  ctx.beginPath()
  ctx.moveTo(50, 20)
  ctx.lineTo(50, height - 40)
  ctx.stroke()
  
  // X轴
  ctx.beginPath()
  ctx.moveTo(50, height - 40)
  ctx.lineTo(width - 20, height - 40)
  ctx.stroke()
  
  // 绘制数据线
  ctx.strokeStyle = '#3498db'
  ctx.lineWidth = 3
  ctx.beginPath()
  
  const stepX = (width - 70) / (data.length - 1)
  const stepY = (height - 60) / 100
  
  data.forEach((value, index) => {
    const x = 50 + index * stepX
    const y = height - 40 - value * stepY
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    
    // 绘制数据点
    ctx.fillStyle = '#3498db'
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2 * Math.PI)
    ctx.fill()
  })
  
  ctx.stroke()
  
  // 绘制标签
  ctx.fillStyle = '#666'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  
  labels.forEach((label, index) => {
    if (index % 2 === 0) { // 只显示偶数月份
      const x = 50 + index * stepX
      ctx.fillText(label, x, height - 20)
    }
  })
}

const drawRadarChart = () => {
  const canvas = radarChart.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 40
  
  // 清空画布
  ctx.clearRect(0, 0, width, height)
  
  const abilities = [
    { name: '视觉记忆', value: 85 },
    { name: '空间感知', value: 78 },
    { name: '色彩识别', value: 92 },
    { name: '图像处理', value: 88 },
    { name: '反应速度', value: 95 },
    { name: '注意力', value: 82 }
  ]
  
  const angleStep = (2 * Math.PI) / abilities.length
  
  // 绘制网格
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  
  for (let i = 1; i <= 5; i++) {
    const r = (radius * i) / 5
    ctx.beginPath()
    ctx.arc(centerX, centerY, r, 0, 2 * Math.PI)
    ctx.stroke()
  }
  
  // 绘制轴线
  abilities.forEach((_, index) => {
    const angle = index * angleStep - Math.PI / 2
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(x, y)
    ctx.stroke()
  })
  
  // 绘制数据区域
  ctx.fillStyle = 'rgba(52, 152, 219, 0.3)'
  ctx.strokeStyle = '#3498db'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  abilities.forEach((ability, index) => {
    const angle = index * angleStep - Math.PI / 2
    const value = ability.value / 100
    const x = centerX + Math.cos(angle) * radius * value
    const y = centerY + Math.sin(angle) * radius * value
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  
  // 绘制标签
  ctx.fillStyle = '#333'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  
  abilities.forEach((ability, index) => {
    const angle = index * angleStep - Math.PI / 2
    const labelRadius = radius + 20
    const x = centerX + Math.cos(angle) * labelRadius
    const y = centerY + Math.sin(angle) * labelRadius
    
    ctx.fillText(ability.name, x, y)
  })
}

const exportData = (format) => {
  // 模拟数据导出
  const data = {
    overview: {
      totalSessions: totalSessions.value,
      totalTime: totalTime.value,
      averageAccuracy: averageAccuracy.value,
      highestScore: highestScore.value
    },
    moduleProgress: moduleProgress.value,
    recentSessions: recentSessions.value,
    achievements: achievements.value
  }
  
  switch (format) {
    case 'csv':
      downloadCSV(data)
      break
    case 'pdf':
      downloadPDF(data)
      break
    case 'json':
      downloadJSON(data)
      break
  }
}

const downloadCSV = (data) => {
  let csv = '模块,训练次数,最佳成绩,平均用时,进度\n'
  data.moduleProgress.forEach(module => {
    csv += `${module.name},${module.sessions},${module.bestScore},${module.averageTime},${module.progress}%\n`
  })
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '训练进度.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const downloadJSON = (data) => {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '训练数据.json'
  a.click()
  URL.revokeObjectURL(url)
}

const downloadPDF = (data) => {
  // 这里应该使用PDF生成库，如jsPDF
  alert('PDF导出功能需要集成PDF生成库')
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    drawTrendChart()
    drawRadarChart()
  })
})
</script>

<style scoped>
.photo-memory-progress-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.progress-overview {
  margin-bottom: 40px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.overview-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.card-icon {
  font-size: 36px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 50%;
}

.card-content h3 {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
}

.module-progress {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.module-progress h3 {
  color: #2c3e50;
  margin-bottom: 25px;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.module-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.module-header h4 {
  color: #2c3e50;
  margin: 0;
}

.module-level {
  background: #3498db;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.progress-bar {
  background: #e9ecef;
  border-radius: 10px;
  height: 20px;
  position: relative;
  margin-bottom: 15px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #3498db, #2980b9);
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.module-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

.chart-container {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-container h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.chart-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
}

.recent-sessions {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.recent-sessions h3 {
  color: #2c3e50;
  margin-bottom: 25px;
}

.sessions-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1fr;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 2px solid #e9ecef;
  font-weight: bold;
  color: #2c3e50;
}

.table-body {
  max-height: 300px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1fr;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #f1f3f4;
  align-items: center;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-cell {
  color: #666;
}

.accuracy-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.accuracy-badge.excellent {
  background: #d5f4e6;
  color: #27ae60;
}

.accuracy-badge.good {
  background: #e3f2fd;
  color: #3498db;
}

.accuracy-badge.average {
  background: #fff3cd;
  color: #f39c12;
}

.accuracy-badge.poor {
  background: #fdeaea;
  color: #e74c3c;
}

.level-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.level-badge.expert {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.level-badge.advanced {
  background: linear-gradient(135deg, #27ae60, #229954);
}

.level-badge.intermediate {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.level-badge.beginner {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
}

.achievements {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.achievements h3 {
  color: #2c3e50;
  margin-bottom: 25px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.achievement-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.achievement-card.unlocked {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border-color: #f39c12;
}

.achievement-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.achievement-content {
  flex: 1;
}

.achievement-content h4 {
  color: #2c3e50;
  margin-bottom: 5px;
}

.achievement-content p {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar.small {
  height: 8px;
  flex: 1;
}

.export-section {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.export-section h3 {
  color: #2c3e50;
  margin-bottom: 25px;
}

.export-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.3s;
}

.btn-export:hover {
  transform: translateY(-2px);
}

.export-icon {
  font-size: 18px;
}
</style>