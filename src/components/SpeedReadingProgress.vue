<template>
  <div class="speed-reading-progress">
    <!-- 进度概览 -->>
    <div class="progress-overview">
      <h2>训练进度概览</h2>
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon">
            <i class="fas fa-calendar-week"></i>
          </div>
          <div class="card-content">
            <div class="card-number">{{ weeklyProgress.sessions }}</div>
            <div class="card-label">本周训练次数</div>
            <div class="card-trend" :class="weeklyTrend.class">
              <i :class="weeklyTrend.icon"></i>
              {{ weeklyTrend.text }}
            </div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="card-content">
            <div class="card-number">{{ formatTime(weeklyProgress.totalTime) }}</div>
            <div class="card-label">本周训练时长</div>
            <div class="card-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: weeklyProgressPercent + '%' }"></div>
              </div>
              <span class="progress-text">{{ weeklyProgressPercent }}% 完成</span>
            </div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <div class="card-content">
            <div class="card-number">{{ overallStats.totalSessions }}</div>
            <div class="card-label">总训练次数</div>
            <div class="card-subtitle">{{ formatTime(overallStats.totalTrainingTime) }} 总时长</div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="card-content">
            <div class="card-number">{{ Math.round(progressData.averageSessionsPerWeek) }}</div>
            <div class="card-label">平均周训练次数</div>
            <div class="card-subtitle">最近30天数据</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练趋势图表 -->>
    <div class="progress-charts">
      <div class="chart-section">
        <h3>速度趋势</h3>
        <div class="chart-container">
          <div class="chart-placeholder" v-if="progressData.speedTrend.length === 0">
            <p>暂无数据</p>
            <small>开始训练后将显示速度趋势</small>
          </div>
          <div class="trend-chart" v-else>
            <div class="chart-grid">
              <div 
                class="chart-bar" 
                v-for="(item, index) in progressData.speedTrend.slice(-14)" 
                :key="index"
                :style="{ height: (item.speed / maxSpeed * 100) + '%' }"
                :title="`${item.date}: ${item.speed} 字/分钟`"
              >
                <div class="bar-value">{{ item.speed }}</div>
              </div>
            </div>
            <div class="chart-labels">
              <span 
                v-for="(item, index) in progressData.speedTrend.slice(-14)" 
                :key="index"
                class="chart-label"
              >
                {{ formatDate(item.date) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chart-section">
        <h3>准确率趋势</h3>
        <div class="chart-container">
          <div class="chart-placeholder" v-if="progressData.accuracyTrend.length === 0">
            <p>暂无数据</p>
            <small>开始训练后将显示准确率趋势</small>
          </div>
          <div class="trend-chart" v-else>
            <div class="chart-grid">
              <div 
                class="chart-bar accuracy-bar" 
                v-for="(item, index) in progressData.accuracyTrend.slice(-14)" 
                :key="index"
                :style="{ height: item.accuracy + '%' }"
                :title="`${item.date}: ${item.accuracy}% 准确率`"
              >
                <div class="bar-value">{{ item.accuracy }}%</div>
              </div>
            </div>
            <div class="chart-labels">
              <span 
                v-for="(item, index) in progressData.accuracyTrend.slice(-14)" 
                :key="index"
                class="chart-label"
              >
                {{ formatDate(item.date) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练频率热力图 -->>
    <div class="frequency-heatmap">
      <h3>训练频率热力图</h3>
      <div class="heatmap-container">
        <div class="heatmap-grid">
          <div 
            class="heatmap-cell" 
            v-for="(day, index) in progressData.trainingFrequency" 
            :key="index"
            :class="getHeatmapClass(day.sessions)"
            :title="`${day.date}: ${day.sessions} 次训练, ${formatTime(day.totalTime)}`"
          >
            <span class="cell-date">{{ formatDateShort(day.date) }}</span>
            <span class="cell-sessions">{{ day.sessions }}</span>
          </div>
        </div>
        <div class="heatmap-legend">
          <span>少</span>
          <div class="legend-scale">
            <div class="legend-item level-0"></div>
            <div class="legend-item level-1"></div>
            <div class="legend-item level-2"></div>
            <div class="legend-item level-3"></div>
            <div class="legend-item level-4"></div>
          </div>
          <span>多</span>
        </div>
      </div>
    </div>

    <!-- 成绩分析 -->>
    <div class="performance-analysis">
      <h3>成绩分析</h3>
      <div class="analysis-grid">
        <!-- 文章阅读分析 -->>
        <div class="analysis-card">
          <h4>文章阅读表现</h4>
          <div class="performance-metrics">
            <div class="metric">
              <span class="metric-label">平均速度:</span>
              <span class="metric-value">{{ Math.round(articleStats.averageSpeed) }} 字/分钟</span>
              <div class="metric-level" :class="getSpeedLevel(articleStats.averageSpeed)">
                {{ getSpeedLevelText(articleStats.averageSpeed) }}
              </div>
            </div>
            <div class="metric">
              <span class="metric-label">平均准确率:</span>
              <span class="metric-value">{{ Math.round(articleStats.averageAccuracy) }}%</span>
              <div class="metric-level" :class="getAccuracyLevel(articleStats.averageAccuracy)">
                {{ getAccuracyLevelText(articleStats.averageAccuracy) }}
              </div>
            </div>
            <div class="metric">
              <span class="metric-label">最佳速度:</span>
              <span class="metric-value">{{ Math.round(articleStats.bestSpeed) }} 字/分钟</span>
            </div>
          </div>
          <div class="ability-radar">
            <div class="radar-item">
              <span class="ability-name">速度能力</span>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: articleStats.speedLevel + '%' }"></div>
              </div>
              <span class="ability-score">{{ Math.round(articleStats.speedLevel) }}%</span>
            </div>
            <div class="radar-item">
              <span class="ability-name">理解能力</span>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: articleStats.comprehensionLevel + '%' }"></div>
              </div>
              <span class="ability-score">{{ Math.round(articleStats.comprehensionLevel) }}%</span>
            </div>
            <div class="radar-item">
              <span class="ability-name">专注能力</span>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: articleStats.focusLevel + '%' }"></div>
              </div>
              <span class="ability-score">{{ Math.round(articleStats.focusLevel) }}%</span>
            </div>
          </div>
        </div>
        
        <!-- 3D阅读分析 -->>
        <div class="analysis-card">
          <h4>3D阅读表现</h4>
          <div class="performance-metrics">
            <div class="metric">
              <span class="metric-label">平均准确率:</span>
              <span class="metric-value">{{ Math.round(threeDStats.averageAccuracy) }}%</span>
              <div class="metric-level" :class="getAccuracyLevel(threeDStats.averageAccuracy)">
                {{ getAccuracyLevelText(threeDStats.averageAccuracy) }}
              </div>
            </div>
            <div class="metric">
              <span class="metric-label">平均识别时间:</span>
              <span class="metric-value">{{ Math.round(threeDStats.averageTime) }} 秒</span>
              <div class="metric-level" :class="getTimeLevel(threeDStats.averageTime)">
                {{ getTimeLevelText(threeDStats.averageTime) }}
              </div>
            </div>
            <div class="metric">
              <span class="metric-label">训练次数:</span>
              <span class="metric-value">{{ threeDStats.totalSessions }} 次</span>
            </div>
          </div>
          <div class="ability-radar">
            <div class="radar-item">
              <span class="ability-name">立体视觉</span>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: threeDStats.stereoVision + '%' }"></div>
              </div>
              <span class="ability-score">{{ Math.round(threeDStats.stereoVision) }}%</span>
            </div>
            <div class="radar-item">
              <span class="ability-name">空间感知</span>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: threeDStats.spatialPerception + '%' }"></div>
              </div>
              <span class="ability-score">{{ Math.round(threeDStats.spatialPerception) }}%</span>
            </div>
            <div class="radar-item">
              <span class="ability-name">深度判断</span>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: threeDStats.depthPerception + '%' }"></div>
              </div>
              <span class="ability-score">{{ Math.round(threeDStats.depthPerception) }}%</span>
            </div>
            <div class="radar-item">
              <span class="ability-name">视觉专注</span>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: threeDStats.visualFocus + '%' }"></div>
              </div>
              <span class="ability-score">{{ Math.round(threeDStats.visualFocus) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 目标设定和建议 -->>
    <div class="goals-suggestions">
      <div class="goals-section">
        <h3>训练目标</h3>
        <div class="goal-item">
          <label>周训练目标 (分钟):</label>
          <input 
            type="number" 
            v-model="goals.weeklyGoal" 
            @change="saveGoals"
            min="60" 
            max="1440" 
            step="30"
          >
          <div class="goal-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: weeklyProgressPercent + '%' }"></div>
            </div>
            <span>{{ weeklyProgress.totalTime }}/{{ goals.weeklyGoal }} 分钟</span>
          </div>
        </div>
        
        <div class="goal-item">
          <label>月训练目标 (分钟):</label>
          <input 
            type="number" 
            v-model="goals.monthlyGoal" 
            @change="saveGoals"
            min="240" 
            max="4320" 
            step="60"
          >
          <div class="goal-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: monthlyProgressPercent + '%' }"></div>
            </div>
            <span>{{ monthlyProgress.totalTime }}/{{ goals.monthlyGoal }} 分钟</span>
          </div>
        </div>
      </div>
      
      <div class="suggestions-section">
        <h3>训练建议</h3>
        <div class="suggestion-list">
          <div class="suggestion-item" v-for="suggestion in suggestions" :key="suggestion.id">
            <div class="suggestion-icon">
              <i :class="suggestion.icon"></i>
            </div>
            <div class="suggestion-content">
              <div class="suggestion-title">{{ suggestion.title }}</div>
              <div class="suggestion-description">{{ suggestion.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  getSpeedReadingStats, 
  getTrainingProgress,
  saveSpeedReadingStats
} from '@/services/speedReadingStorage'

export default {
  name: 'SpeedReadingProgress',
  data() {
    return {
      // 统计数据
      articleStats: {
        totalSessions: 0,
        averageSpeed: 0,
        averageAccuracy: 0,
        totalTime: 0,
        bestSpeed: 0,
        speedLevel: 0,
        comprehensionLevel: 0,
        focusLevel: 0
      },
      threeDStats: {
        totalSessions: 0,
        averageAccuracy: 0,
        averageTime: 0,
        totalTime: 0,
        stereoVision: 0,
        spatialPerception: 0,
        depthPerception: 0,
        visualFocus: 0
      },
      overallStats: {
        totalTrainingTime: 0,
        totalSessions: 0,
        lastTrainingDate: null
      },
      
      // 进度数据
      progressData: {
        speedTrend: [],
        accuracyTrend: [],
        trainingFrequency: [],
        totalSessions: 0,
        averageSessionsPerWeek: 0
      },
      
      // 目标设定
      goals: {
        weeklyGoal: 300,
        monthlyGoal: 1200
      },
      
      // 周期性数据
      weeklyProgress: {
        sessions: 0,
        totalTime: 0
      },
      monthlyProgress: {
        sessions: 0,
        totalTime: 0
      }
    }
  },
  
  computed: {
    maxSpeed() {
      if (this.progressData.speedTrend.length === 0) return 500
      return Math.max(...this.progressData.speedTrend.map(item => item.speed)) * 1.2
    },
    
    weeklyProgressPercent() {
      return Math.min(100, (this.weeklyProgress.totalTime / this.goals.weeklyGoal) * 100)
    },
    
    monthlyProgressPercent() {
      return Math.min(100, (this.monthlyProgress.totalTime / this.goals.monthlyGoal) * 100)
    },
    
    weeklyTrend() {
      // 简化的趋势计算
      const currentWeek = this.weeklyProgress.sessions
      const lastWeek = 5 // 假设值，实际应该从历史数据计算
      
      if (currentWeek > lastWeek) {
        return {
          class: 'trend-up',
          icon: 'fas fa-arrow-up',
          text: '较上周增加'
        }
      } else if (currentWeek < lastWeek) {
        return {
          class: 'trend-down',
          icon: 'fas fa-arrow-down',
          text: '较上周减少'
        }
      } else {
        return {
          class: 'trend-stable',
          icon: 'fas fa-minus',
          text: '与上周持平'
        }
      }
    },
    
    suggestions() {
      const suggestions = []
      
      // 基于数据生成建议
      if (this.weeklyProgress.sessions < 3) {
        suggestions.push({
          id: 'frequency',
          icon: 'fas fa-calendar-plus',
          title: '增加训练频率',
          description: '建议每周至少训练3次，保持技能的持续提升'
        })
      }
      
      if (this.articleStats.averageSpeed < 300) {
        suggestions.push({
          id: 'speed',
          icon: 'fas fa-tachometer-alt',
          title: '提升阅读速度',
          description: '当前速度偏低，建议逐步提高阅读速度设置'
        })
      }
      
      if (this.articleStats.averageAccuracy < 80) {
        suggestions.push({
          id: 'accuracy',
          icon: 'fas fa-bullseye',
          title: '提高理解准确率',
          description: '准确率需要改善，建议降低速度专注理解'
        })
      }
      
      if (this.threeDStats.averageTime > 5) {
        suggestions.push({
          id: 'threed',
          icon: 'fas fa-eye',
          title: '加强3D视觉训练',
          description: '3D识别时间较长，建议增加立体视觉练习'
        })
      }
      
      // 默认建议
      if (suggestions.length === 0) {
        suggestions.push({
          id: 'maintain',
          icon: 'fas fa-check-circle',
          title: '保持良好状态',
          description: '训练表现优秀，继续保持当前的训练节奏'
        })
      }
      
      return suggestions
    }
  },
  
  async mounted() {
    await this.loadData()
  },
  
  methods: {
    async loadData() {
      try {
        // 加载统计数据
        const stats = await getSpeedReadingStats()
        this.articleStats = stats.articleReading
        this.threeDStats = stats.threeDReading
        this.overallStats = stats.overall
        this.goals.weeklyGoal = stats.overall.weeklyGoal || 300
        this.goals.monthlyGoal = stats.overall.monthlyGoal || 1200
        
        // 加载进度数据
        this.progressData = await getTrainingProgress(30)
        
        // 计算周期性数据
        this.calculatePeriodData()
      } catch (error) {
        console.error('加载进度数据失败:', error)
      }
    },
    
    calculatePeriodData() {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      // 计算本周数据
      const weeklyData = this.progressData.trainingFrequency.filter(day => 
        new Date(day.date) >= weekAgo
      )
      this.weeklyProgress.sessions = weeklyData.reduce((sum, day) => sum + day.sessions, 0)
      this.weeklyProgress.totalTime = Math.round(weeklyData.reduce((sum, day) => sum + day.totalTime, 0) / 60)
      
      // 计算本月数据
      const monthlyData = this.progressData.trainingFrequency.filter(day => 
        new Date(day.date) >= monthAgo
      )
      this.monthlyProgress.sessions = monthlyData.reduce((sum, day) => sum + day.sessions, 0)
      this.monthlyProgress.totalTime = Math.round(monthlyData.reduce((sum, day) => sum + day.totalTime, 0) / 60)
    },
    
    async saveGoals() {
      try {
        const stats = await getSpeedReadingStats()
        stats.overall.weeklyGoal = this.goals.weeklyGoal
        stats.overall.monthlyGoal = this.goals.monthlyGoal
        await saveSpeedReadingStats(stats)
      } catch (error) {
        console.error('保存目标失败:', error)
      }
    },
    
    formatTime(seconds) {
      if (seconds < 60) return `${seconds}秒`
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      if (minutes < 60) {
        return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`
      }
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}小时${remainingMinutes}分钟`
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getMonth() + 1}/${date.getDate()}`
    },
    
    formatDateShort(dateString) {
      const date = new Date(dateString)
      return date.getDate().toString()
    },
    
    getHeatmapClass(sessions) {
      if (sessions === 0) return 'level-0'
      if (sessions === 1) return 'level-1'
      if (sessions === 2) return 'level-2'
      if (sessions === 3) return 'level-3'
      return 'level-4'
    },
    
    getSpeedLevel(speed) {
      if (speed >= 500) return 'level-excellent'
      if (speed >= 400) return 'level-good'
      if (speed >= 300) return 'level-average'
      return 'level-poor'
    },
    
    getSpeedLevelText(speed) {
      if (speed >= 500) return '优秀'
      if (speed >= 400) return '良好'
      if (speed >= 300) return '一般'
      return '需改善'
    },
    
    getAccuracyLevel(accuracy) {
      if (accuracy >= 90) return 'level-excellent'
      if (accuracy >= 80) return 'level-good'
      if (accuracy >= 70) return 'level-average'
      return 'level-poor'
    },
    
    getAccuracyLevelText(accuracy) {
      if (accuracy >= 90) return '优秀'
      if (accuracy >= 80) return '良好'
      if (accuracy >= 70) return '一般'
      return '需改善'
    },
    
    getTimeLevel(time) {
      if (time <= 2) return 'level-excellent'
      if (time <= 3) return 'level-good'
      if (time <= 5) return 'level-average'
      return 'level-poor'
    },
    
    getTimeLevelText(time) {
      if (time <= 2) return '优秀'
      if (time <= 3) return '良好'
      if (time <= 5) return '一般'
      return '需改善'
    }
  }
}
</script>

<style scoped>
.speed-reading-progress {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
}

/* 进度概览 */
.progress-overview {
  margin-bottom: 30px;
}

.progress-overview h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.card-content {
  flex: 1;
}

.card-number {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}

.card-label {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 8px;
}

.card-subtitle {
  color: #95a5a6;
  font-size: 12px;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
}

.trend-up { color: #27ae60; }
.trend-down { color: #e74c3c; }
.trend-stable { color: #f39c12; }

.card-progress {
  margin-top: 8px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #ecf0f1;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #7f8c8d;
}

/* 图表部分 */
.progress-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.chart-container {
  height: 200px;
  position: relative;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #95a5a6;
  text-align: center;
}

.trend-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-grid {
  flex: 1;
  display: flex;
  align-items: end;
  gap: 4px;
  padding: 10px 0;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  min-height: 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-bar:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

.accuracy-bar {
  background: linear-gradient(180deg, #2ed573 0%, #17a2b8 100%);
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #2c3e50;
  font-weight: 500;
}

.chart-labels {
  display: flex;
  gap: 4px;
  margin-top: 10px;
}

.chart-label {
  flex: 1;
  text-align: center;
  font-size: 10px;
  color: #7f8c8d;
}

/* 热力图 */
.frequency-heatmap {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.frequency-heatmap h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.heatmap-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.heatmap-cell {
  aspect-ratio: 1;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.heatmap-cell:hover {
  transform: scale(1.1);
}

.level-0 { background: #ebedf0; }
.level-1 { background: #c6e48b; }
.level-2 { background: #7bc96f; }
.level-3 { background: #239a3b; }
.level-4 { background: #196127; }

.cell-date {
  color: #2c3e50;
  font-weight: 500;
}

.cell-sessions {
  color: #7f8c8d;
  margin-top: 2px;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 12px;
  color: #7f8c8d;
}

.legend-scale {
  display: flex;
  gap: 2px;
}

.legend-item {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

/* 成绩分析 */
.performance-analysis {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.performance-analysis h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.analysis-card {
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 20px;
}

.analysis-card h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
}

.performance-metrics {
  margin-bottom: 20px;
}

.metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.metric-label {
  color: #7f8c8d;
  font-size: 14px;
}

.metric-value {
  color: #2c3e50;
  font-weight: 600;
}

.metric-level {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.level-excellent {
  background: #d4edda;
  color: #155724;
}

.level-good {
  background: #cce7ff;
  color: #004085;
}

.level-average {
  background: #fff3cd;
  color: #856404;
}

.level-poor {
  background: #f8d7da;
  color: #721c24;
}

.ability-radar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radar-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ability-name {
  width: 80px;
  font-size: 12px;
  color: #7f8c8d;
}

.ability-bar {
  flex: 1;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.ability-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.ability-score {
  width: 40px;
  text-align: right;
  font-size: 12px;
  color: #2c3e50;
  font-weight: 500;
}

/* 目标和建议 */
.goals-suggestions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.goals-section,
.suggestions-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.goals-section h3,
.suggestions-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.goal-item {
  margin-bottom: 20px;
}

.goal-item label {
  display: block;
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 8px;
}

.goal-item input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 10px;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.goal-progress .progress-bar {
  flex: 1;
}

.goal-progress span {
  font-size: 12px;
  color: #7f8c8d;
  white-space: nowrap;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.suggestion-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 5px;
}

.suggestion-description {
  color: #7f8c8d;
  font-size: 14px;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .progress-charts,
  .analysis-grid,
  .goals-suggestions {
    grid-template-columns: 1fr;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .heatmap-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  
  .heatmap-cell {
    font-size: 8px;
  }
}
</style>