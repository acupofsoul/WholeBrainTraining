<template>
  <div class="expand-vision-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>扩大视野训练</h1>
      <p class="page-description">
        通过专门的视野扩展练习，提高视觉感知范围和周边视觉能力，
        为快速阅读和信息处理奠定基础。
      </p>
    </div>

    <!-- 训练模式选择 -->
    <div class="training-modes" v-if="!isTraining">
      <h3>选择训练模式</h3>
      <div class="modes-grid">
        <div 
          v-for="mode in trainingModes" 
          :key="mode.id"
          class="mode-card"
          :class="{ active: selectedMode === mode.id }"
          @click="selectMode(mode.id)"
        >
          <div class="mode-header">
            <span class="mode-icon">{{ mode.icon }}</span>
            <span class="mode-level" :class="mode.level">{{ mode.levelText }}</span>
          </div>
          <h4>{{ mode.name }}</h4>
          <p class="mode-description">{{ mode.description }}</p>
          <div class="mode-details">
            <div class="detail-item">
              <span class="detail-label">训练时长:</span>
              <span class="detail-value">{{ mode.duration }}分钟</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">难度等级:</span>
              <span class="detail-value">{{ mode.difficulty }}/5</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">推荐年龄:</span>
              <span class="detail-value">{{ mode.ageRange }}</span>
            </div>
          </div>
          <div class="mode-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: mode.progress + '%' }"></div>
            </div>
            <div class="progress-text">完成度: {{ mode.progress }}%</div>
          </div>
          <button class="start-mode-btn" @click.stop="startTraining(mode.id)">
            {{ mode.progress > 0 ? '继续训练' : '开始训练' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 训练界面 -->
    <div class="training-interface" v-if="isTraining">
      <div class="training-card">
        <div class="training-header">
          <h3>{{ getCurrentMode().name }}</h3>
          <div class="training-controls">
            <button class="control-btn" @click="pauseTraining" v-if="!isPaused">
              ⏸️
            </button>
            <button class="control-btn" @click="resumeTraining" v-if="isPaused">
              ▶️
            </button>
            <button class="control-btn" @click="stopTraining">
              ⏹️
            </button>
          </div>
        </div>

        <!-- 训练计时器 -->
        <div class="training-timer">
          <div class="timer-display">
            <div class="time-remaining">{{ formatTime(timeRemaining) }}</div>
            <div class="session-info">第 {{ currentSession }}/{{ totalSessions }} 轮</div>
          </div>
          <div class="timer-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: timerProgress + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 训练内容 -->
        <div class="training-content">
          <div class="instruction">{{ getCurrentInstruction() }}</div>
          
          <!-- 点阵训练 -->
          <div v-if="selectedMode === 'dots'" class="dots-training">
            <div class="vision-field" ref="visionField">
              <div class="center-point">+</div>
              <div 
                v-for="dot in currentDots" 
                :key="dot.id"
                class="dot-item"
                :class="{ active: dot.active, clicked: dot.clicked }"
                :style="{ 
                  left: dot.x + 'px', 
                  top: dot.y + 'px',
                  backgroundColor: dot.color 
                }"
                @click="clickDot(dot.id)"
              ></div>
            </div>
            <div class="training-stats">
              <div class="stat-item">
                <span class="stat-label">已点击</span>
                <span class="stat-value">{{ dotsClicked }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">总数量</span>
                <span class="stat-value">{{ totalDots }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">准确率</span>
                <span class="stat-value">{{ accuracy }}%</span>
              </div>
            </div>
          </div>

          <!-- 数字追踪训练 -->
          <div v-if="selectedMode === 'numbers'" class="numbers-tracking">
            <div class="vision-field" ref="visionField">
              <div class="center-point">+</div>
              <div 
                v-for="number in currentNumbers" 
                :key="number.id"
                class="number-item"
                :class="{ 
                  active: number.active, 
                  target: number.isTarget,
                  found: number.found 
                }"
                :style="{ 
                  left: number.x + 'px', 
                  top: number.y + 'px' 
                }"
                @click="clickNumber(number.id)"
              >
                {{ number.value }}
              </div>
            </div>
            <div class="target-info">
              <div class="target-display">
                目标数字: <span class="target-number">{{ targetNumber }}</span>
              </div>
              <div class="found-count">
                已找到: {{ numbersFound }}/{{ targetCount }}
              </div>
            </div>
          </div>

          <!-- 形状识别训练 -->
          <div v-if="selectedMode === 'shapes'" class="shapes-recognition">
            <div class="vision-field" ref="visionField">
              <div class="center-point">+</div>
              <div 
                v-for="shape in currentShapes" 
                :key="shape.id"
                class="shape-item"
                :class="{ 
                  active: shape.active, 
                  target: shape.isTarget,
                  found: shape.found,
                  [shape.type]: true 
                }"
                :style="{ 
                  left: shape.x + 'px', 
                  top: shape.y + 'px',
                  backgroundColor: shape.color 
                }"
                @click="clickShape(shape.id)"
              ></div>
            </div>
            <div class="target-info">
              <div class="target-display">
                目标形状: 
                <span class="target-shape" :class="targetShape.type" :style="{ backgroundColor: targetShape.color }"></span>
                <span class="target-name">{{ targetShape.name }}</span>
              </div>
              <div class="found-count">
                已找到: {{ shapesFound }}/{{ targetCount }}
              </div>
            </div>
          </div>

          <!-- 文字扫描训练 -->
          <div v-if="selectedMode === 'text'" class="text-scanning">
            <div class="vision-field text-field" ref="visionField">
              <div class="center-point">+</div>
              <div 
                v-for="word in currentWords" 
                :key="word.id"
                class="word-item"
                :class="{ 
                  active: word.active, 
                  target: word.isTarget,
                  found: word.found 
                }"
                :style="{ 
                  left: word.x + 'px', 
                  top: word.y + 'px' 
                }"
                @click="clickWord(word.id)"
              >
                {{ word.text }}
              </div>
            </div>
            <div class="target-info">
              <div class="target-display">
                目标词汇: <span class="target-word">{{ targetWord }}</span>
              </div>
              <div class="found-count">
                已找到: {{ wordsFound }}/{{ targetCount }}
              </div>
            </div>
          </div>
          
          <!-- 动态追踪训练 -->
          <div v-if="selectedMode === 'motion'" class="motion-tracking">
            <div class="vision-field" ref="visionField">
              <div class="center-point">+</div>
              <div 
                v-for="target in currentMotionTargets" 
                :key="target.id"
                class="motion-target"
                :class="{ active: target.active }"
                :style="{
                  left: target.x + 'px',
                  top: target.y + 'px',
                  backgroundColor: settings.targetColor,
                  width: settings.targetSize + 'px',
                  height: settings.targetSize + 'px'
                }"
                @click="clickMotionTarget(target.id)"
              ></div>
            </div>
            <div class="target-info">
              <div class="target-display">
                追踪移动目标
              </div>
              <div class="found-count">
                已击中: {{ currentSession }}/{{ settings.sessionCount }}
              </div>
            </div>
          </div>
          
          <!-- 周边感知训练 -->
          <div v-if="selectedMode === 'peripheral'" class="peripheral-training">
            <div class="vision-field" ref="visionField">
              <!-- 中心任务区域 -->
              <div class="center-task-area">
                <div 
                  v-for="(number, index) in currentPeripheralData.centerTask.numbers" 
                  :key="'center-' + index"
                  class="center-number"
                >
                  {{ number }}
                </div>
              </div>
              <!-- 周边目标 -->
              <div 
                v-for="target in currentPeripheralData.peripheralTargets" 
                :key="target.id"
                class="peripheral-target"
                :class="{ active: target.active }"
                :style="{
                  left: target.x + 'px',
                  top: target.y + 'px',
                  backgroundColor: target.color
                }"
                @click="clickPeripheralTarget(target.id)"
              ></div>
            </div>
            <div class="target-info">
              <div class="target-display">
                中心任务: 计算总和 = {{ currentPeripheralData.centerTask.targetSum }}
              </div>
              <div class="found-count">
                周边目标: {{ currentSession }}/{{ settings.sessionCount }}
              </div>
            </div>
          </div>
          
          <!-- 对比度训练 -->
          <div v-if="selectedMode === 'contrast'" class="contrast-training">
            <div 
              class="vision-field contrast-field" 
              ref="visionField"
              :style="{ 
                backgroundColor: settings.backgroundColor,
                filter: `contrast(${settings.contrast}%) brightness(${settings.brightness}%)`
              }"
            >
              <div class="center-point">+</div>
              <div 
                v-for="target in currentContrastTargets" 
                :key="target.id"
                class="contrast-target"
                :class="{ active: target.active, target: target.isTarget }"
                :style="{
                  left: target.x + 'px',
                  top: target.y + 'px',
                  backgroundColor: target.color,
                  opacity: target.opacity
                }"
                @click="clickContrastTarget(target.id)"
              ></div>
            </div>
            <div class="target-info">
              <div class="target-display">
                识别低对比度目标
              </div>
              <div class="found-count">
                已识别: {{ currentSession }}/{{ settings.sessionCount }}
              </div>
            </div>
          </div>
          
          <!-- 深度感知训练 -->
          <div v-if="selectedMode === 'depth'" class="depth-training">
            <div class="vision-field depth-field" ref="visionField">
              <div class="center-point">+</div>
              <div 
                v-for="target in currentDepthTargets" 
                :key="target.id"
                class="depth-target"
                :class="{ active: target.active, target: target.isTarget }"
                :style="{
                  left: target.x + 'px',
                  top: target.y + 'px',
                  backgroundColor: target.color,
                  transform: `scale(${target.scale})`,
                  zIndex: target.zIndex,
                  boxShadow: `0 ${target.depth / 10}px ${target.depth / 5}px rgba(0,0,0,0.3)`
                }"
                @click="clickDepthTarget(target.id)"
              ></div>
            </div>
            <div class="target-info">
              <div class="target-display">
                识别深度层次目标
              </div>
              <div class="found-count">
                已识别: {{ currentSession }}/{{ settings.sessionCount }}
              </div>
            </div>
          </div>
        </div>

        <!-- 训练进度 -->
        <div class="training-progress">
          <div class="progress-info">
            <span>训练进度</span>
            <span>{{ Math.round(sessionProgress) }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: sessionProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练设置 -->
    <div class="training-settings" v-if="!isTraining">
      <h3>训练设置</h3>
      <div class="settings-grid">
        <div class="setting-card">
          <h4>基础设置</h4>
          <div class="setting-item">
            <label>训练时长 (分钟)</label>
            <input 
              type="number" 
              v-model="settings.duration" 
              min="1" 
              max="30" 
              class="number-input"
            >
          </div>
          <div class="setting-item">
            <label>难度等级</label>
            <select v-model="settings.difficulty" class="select-input">
              <option value="1">简单</option>
              <option value="2">容易</option>
              <option value="3">中等</option>
              <option value="4">困难</option>
              <option value="5">专家</option>
            </select>
          </div>
          <div class="setting-item">
            <label>视野范围</label>
            <div class="range-container">
              <input 
                type="range" 
                v-model="settings.visionRange" 
                min="200" 
                max="800" 
                step="50" 
                class="range-input"
              >
              <span class="range-value">{{ settings.visionRange }}px</span>
            </div>
          </div>
        </div>

        <div class="setting-card">
          <h4>显示设置</h4>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.showGrid">
              显示网格线
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.soundEnabled">
              音效提示
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.autoNext">
              自动进入下一轮
            </label>
          </div>
          <div class="setting-item">
            <label>显示时间 (秒)</label>
            <input 
              type="number" 
              v-model="settings.displayTime" 
              min="0.5" 
              max="5" 
              step="0.1" 
              class="number-input"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 训练统计 -->
    <div class="training-statistics" v-if="!isTraining">
      <h3>训练统计</h3>
      <div class="stats-grid">
        <div class="stats-card">
          <h4>总体表现</h4>
          <div class="stats-overview">
            <div class="stat-item">
              <span class="stat-icon">📊</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.totalSessions }}</span>
                <span class="stat-label">总训练次数</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⏱️</span>
              <div class="stat-info">
                <span class="stat-value">{{ Math.round(statistics.totalTime / 60) }}</span>
                <span class="stat-label">总训练时长(分钟)</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🎯</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.averageAccuracy }}%</span>
                <span class="stat-label">平均准确率</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⚡</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.averageSpeed }}</span>
                <span class="stat-label">平均反应速度(ms)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>进步趋势</h4>
          <div class="performance-chart">
            <div class="chart-bars">
              <div 
                v-for="(data, index) in statistics.progressData" 
                :key="index"
                class="chart-bar"
                :style="{ height: (data.accuracy / 100) * 150 + 'px' }"
                :title="`第${index + 1}次: ${data.accuracy}%`"
              >
                <span class="bar-label">{{ index + 1 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>能力评估</h4>
          <div class="ability-ratings">
            <div class="rating-item">
              <span class="rating-label">视野范围</span>
              <div class="rating-stars">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  class="star"
                  :class="{ filled: i <= statistics.visionRangeRating }"
                >⭐</span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">反应速度</span>
              <div class="rating-stars">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  class="star"
                  :class="{ filled: i <= statistics.reactionSpeedRating }"
                >⭐</span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">注意力</span>
              <div class="rating-stars">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  class="star"
                  :class="{ filled: i <= statistics.attentionRating }"
                >⭐</span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">准确性</span>
              <div class="rating-stars">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  class="star"
                  :class="{ filled: i <= statistics.accuracyRating }"
                >⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练完成弹窗 -->
    <div class="modal-overlay" v-if="showCompletionModal" @click="closeCompletionModal">
      <div class="completion-modal" @click.stop>
        <div class="modal-header">
          <h3>训练完成</h3>
          <button class="close-btn" @click="closeCompletionModal">×</button>
        </div>
        
        <div class="completion-stats">
          <div class="stat-circle" :style="{ '--progress': completionData.accuracy }">
            <div class="circle-progress">
              <div class="circle-text">
                <span class="circle-value">{{ completionData.accuracy }}%</span>
                <span class="circle-label">准确率</span>
              </div>
            </div>
          </div>
          
          <div class="completion-details">
            <div class="detail-item">
              <span class="detail-label">训练时长:</span>
              <span class="detail-value">{{ formatTime(completionData.duration) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">完成轮数:</span>
              <span class="detail-value">{{ completionData.sessions }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">平均反应:</span>
              <span class="detail-value">{{ completionData.averageReaction }}ms</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">视野范围:</span>
              <span class="detail-value">{{ completionData.visionRange }}px</span>
            </div>
          </div>
        </div>

        <div class="achievement" v-if="completionData.newAchievement">
          <span class="achievement-icon">🏆</span>
          <div class="achievement-text">
            <h4>{{ completionData.achievementTitle }}</h4>
            <p>{{ completionData.achievementDescription }}</p>
          </div>
        </div>

        <div class="modal-actions">
          <button class="secondary-btn" @click="closeCompletionModal">返回</button>
          <button class="primary-btn" @click="startNextTraining">继续训练</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExpandVision',
  data() {
    return {
      // 训练状态
      isTraining: false,
      isPaused: false,
      selectedMode: null,
      currentSession: 1,
      totalSessions: 5,
      timeRemaining: 0,
      sessionProgress: 0,
      
      // 训练模式
      trainingModes: [
        {
          id: 'dots',
          name: '点阵训练',
          icon: '🔴',
          description: '通过点击周边出现的彩色圆点，扩大视觉感知范围',
          level: 'beginner',
          levelText: '初级',
          duration: 5,
          difficulty: 2,
          ageRange: '6-12岁',
          progress: 0,
          features: ['基础视野扩展', '颜色识别', '反应训练', '注意力集中'],
          benefits: ['提高周边视觉', '增强反应速度', '改善注意力分配', '扩大视觉范围'],
          bestScore: 0,
          totalAttempts: 0,
          averageAccuracy: 0
        },
        {
          id: 'numbers',
          name: '数字追踪',
          icon: '🔢',
          description: '在视野范围内快速找到指定的数字，提高数字识别能力',
          level: 'intermediate',
          levelText: '中级',
          duration: 8,
          difficulty: 3,
          ageRange: '8-15岁',
          progress: 0,
          features: ['数字识别', '目标搜索', '视觉扫描', '认知训练'],
          benefits: ['提高数字敏感度', '增强搜索能力', '改善认知速度', '训练选择性注意'],
          bestScore: 0,
          totalAttempts: 0,
          averageAccuracy: 0
        },
        {
          id: 'shapes',
          name: '形状识别',
          icon: '🔷',
          description: '识别和点击特定形状和颜色的图形，训练形状感知',
          level: 'intermediate',
          levelText: '中级',
          duration: 10,
          difficulty: 3,
          ageRange: '7-14岁',
          progress: 0,
          features: ['形状辨识', '颜色匹配', '视觉分析', '模式识别'],
          benefits: ['提高形状感知', '增强视觉分析', '改善模式识别', '训练视觉记忆'],
          bestScore: 0,
          totalAttempts: 0,
          averageAccuracy: 0
        },
        {
          id: 'text',
          name: '文字扫描',
          icon: '📝',
          description: '在文字阵列中快速定位目标词汇，提高文字识别速度',
          level: 'advanced',
          levelText: '高级',
          duration: 12,
          difficulty: 4,
          ageRange: '10-18岁',
          progress: 0,
          features: ['文字识别', '快速扫描', '词汇搜索', '阅读训练'],
          benefits: ['提高阅读速度', '增强文字敏感度', '改善扫描技巧', '训练视觉词汇'],
          bestScore: 0,
          totalAttempts: 0,
          averageAccuracy: 0
        },
        {
          id: 'motion',
          name: '动态追踪',
          icon: '🎯',
          description: '追踪移动的目标物体，训练动态视觉和预测能力',
          level: 'advanced',
          levelText: '高级',
          duration: 10,
          difficulty: 4,
          ageRange: '12-20岁',
          progress: 0,
          features: ['动态追踪', '运动预测', '视觉跟踪', '反应协调'],
          benefits: ['提高动态视觉', '增强预测能力', '改善眼球运动', '训练视觉协调'],
          bestScore: 0,
          totalAttempts: 0,
          averageAccuracy: 0
        },
        {
          id: 'peripheral',
          name: '周边感知',
          icon: '👁️',
          description: '专注中心的同时感知周边变化，训练周边视觉敏感度',
          level: 'expert',
          levelText: '专家',
          duration: 15,
          difficulty: 5,
          ageRange: '15-25岁',
          progress: 0,
          features: ['周边视觉', '双重任务', '注意分配', '视觉监控'],
          benefits: ['增强周边感知', '提高多任务能力', '改善注意分配', '训练视觉监控'],
          bestScore: 0,
          totalAttempts: 0,
          averageAccuracy: 0
        },
        {
          id: 'contrast',
          name: '对比度训练',
          icon: '🌓',
          description: '在不同对比度条件下识别目标，提高视觉敏感度',
          level: 'expert',
          levelText: '专家',
          duration: 12,
          difficulty: 5,
          ageRange: '16-30岁',
          progress: 0,
          features: ['对比度适应', '视觉敏感度', '弱光识别', '视觉阈值'],
          benefits: ['提高视觉敏感度', '增强弱光视觉', '改善对比感知', '训练视觉适应'],
          bestScore: 0,
          totalAttempts: 0,
          averageAccuracy: 0
        },
        {
          id: 'depth',
          name: '深度感知',
          icon: '🔍',
          description: '通过立体视觉训练，提高深度感知和空间定位能力',
          level: 'expert',
          levelText: '专家',
          duration: 18,
          difficulty: 5,
          ageRange: '18-35岁',
          progress: 0,
          features: ['立体视觉', '深度感知', '空间定位', '3D识别'],
          benefits: ['提高深度感知', '增强空间能力', '改善立体视觉', '训练3D认知'],
          bestScore: 0,
          totalAttempts: 0,
          averageAccuracy: 0
        }
      ],
      
      // 训练设置
      settings: {
        // 基础设置
        duration: 5,
        difficulty: 3,
        visionRange: 400,
        displayTime: 2.0,
        sessionCount: 5,
        
        // 视觉设置
        showGrid: false,
        showCenterPoint: true,
        backgroundColor: '#f5f5f5',
        targetColor: '#ff4444',
        contrast: 80,
        brightness: 100,
        
        // 反馈设置
        soundEnabled: true,
        vibrationEnabled: false,
        visualFeedback: true,
        scoreDisplay: true,
        
        // 训练流程
        autoNext: true,
        pauseBetweenSessions: true,
        sessionBreakTime: 10,
        showHints: false,
        adaptiveDifficulty: false,
        
        // 高级设置
        targetSize: 'medium',
        movementSpeed: 'normal',
        distractorCount: 3,
        randomizePositions: true,
        enableTimeLimit: true,
        
        // 个性化设置
        preferredModes: ['dots', 'numbers'],
        dailyGoal: 30,
        reminderEnabled: true,
        progressSharing: false,
        customTheme: 'default'
      },
      
      // 点阵训练数据
      currentDots: [],
      dotsClicked: 0,
      totalDots: 0,
      
      // 数字追踪数据
      currentNumbers: [],
      targetNumber: 0,
      numbersFound: 0,
      targetCount: 5,
      
      // 形状识别数据
      currentShapes: [],
      targetShape: { type: 'circle', color: '#ff0000', name: '红色圆形' },
      shapesFound: 0,
      
      // 文字扫描数据
      currentWords: [],
      targetWord: '',
      wordsFound: 0,
      
      // 动态追踪数据
      currentMotionTargets: [],
      motionAnimationId: null,
      
      // 周边感知数据
      currentPeripheralData: {
        centerTask: { type: 'counting', numbers: [], targetSum: 0 },
        peripheralTargets: []
      },
      
      // 对比度训练数据
      currentContrastTargets: [],
      
      // 深度感知数据
      currentDepthTargets: [],
      
      // 统计数据
      statistics: {
        // 基础统计
        totalSessions: 0,
        totalTime: 0,
        averageAccuracy: 0,
        averageSpeed: 0,
        bestAccuracy: 0,
        bestSpeed: 0,
        
        // 今日统计
        todayStats: {
          sessionsCompleted: 0,
          timeSpent: 0,
          averageAccuracy: 0,
          bestScore: 0,
          streakCount: 0
        },
        
        // 进度数据
        progressData: [],
        performanceHistory: [],
        
        // 能力评级
        visionRangeRating: 3,
        reactionSpeedRating: 3,
        attentionRating: 3,
        accuracyRating: 3,
        peripheralVisionRating: 3,
        trackingAbilityRating: 3,
        
        // 模式统计
        modeStats: {
          dots: { attempts: 0, bestScore: 0, averageAccuracy: 0, totalTime: 0 },
          numbers: { attempts: 0, bestScore: 0, averageAccuracy: 0, totalTime: 0 },
          shapes: { attempts: 0, bestScore: 0, averageAccuracy: 0, totalTime: 0 },
          text: { attempts: 0, bestScore: 0, averageAccuracy: 0, totalTime: 0 },
          motion: { attempts: 0, bestScore: 0, averageAccuracy: 0, totalTime: 0 },
          peripheral: { attempts: 0, bestScore: 0, averageAccuracy: 0, totalTime: 0 },
          contrast: { attempts: 0, bestScore: 0, averageAccuracy: 0, totalTime: 0 },
          depth: { attempts: 0, bestScore: 0, averageAccuracy: 0, totalTime: 0 }
        },
        
        // 训练历史
        trainingHistory: [],
        
        // 成就系统
        achievements: [
          { id: 'first_session', name: '初次体验', description: '完成第一次训练', unlocked: false, icon: '🎯' },
          { id: 'accuracy_master', name: '精准大师', description: '单次训练准确率达到95%', unlocked: false, icon: '🎯' },
          { id: 'speed_demon', name: '速度恶魔', description: '平均反应时间低于500ms', unlocked: false, icon: '⚡' },
          { id: 'consistency_king', name: '稳定之王', description: '连续5次训练准确率超过80%', unlocked: false, icon: '👑' },
          { id: 'vision_expert', name: '视野专家', description: '完成所有训练模式', unlocked: false, icon: '👁️' },
          { id: 'marathon_runner', name: '马拉松选手', description: '单日训练时间超过60分钟', unlocked: false, icon: '🏃' },
          { id: 'perfectionist', name: '完美主义者', description: '单次训练100%准确率', unlocked: false, icon: '💯' },
          { id: 'dedicated_learner', name: '专注学习者', description: '连续7天完成训练', unlocked: false, icon: '📚' }
        ],
        
        // 训练计划
        trainingPlan: {
          currentLevel: 1,
          nextGoal: '提高视野范围到500px',
          recommendations: [],
          weeklyTarget: 150,
          monthlyTarget: 600
        }
      },
      
      // 完成弹窗
      showCompletionModal: false,
      completionData: {},
      
      // 计时器
      trainingTimer: null,
      sessionTimer: null
    }
  },
  
  computed: {
    timerProgress() {
      const mode = this.getCurrentMode()
      if (!mode) return 0
      const totalTime = mode.duration * 60
      return ((totalTime - this.timeRemaining) / totalTime) * 100
    },
    
    accuracy() {
      if (this.totalDots === 0) return 0
      return Math.round((this.dotsClicked / this.totalDots) * 100)
    }
  },
  
  mounted() {
    this.loadTrainingData()
    this.loadStatistics()
  },
  
  beforeUnmount() {
    this.clearTimers()
  },
  
  methods: {
    // 模式选择
    selectMode(modeId) {
      this.selectedMode = modeId
    },
    
    getCurrentMode() {
      return this.trainingModes.find(mode => mode.id === this.selectedMode)
    },
    
    // 训练控制
    startTraining(modeId) {
      this.selectedMode = modeId
      this.isTraining = true
      this.isPaused = false
      this.currentSession = 1
      
      const mode = this.getCurrentMode()
      this.timeRemaining = mode.duration * 60
      this.totalSessions = Math.ceil(mode.duration / 2)
      
      this.initializeTrainingData()
      this.startSession()
    },
    
    pauseTraining() {
      this.isPaused = true
      this.clearTimers()
    },
    
    resumeTraining() {
      this.isPaused = false
      this.startSession()
    },
    
    stopTraining() {
      this.isTraining = false
      this.isPaused = false
      this.clearTimers()
      this.saveTrainingData()
    },
    
    // 会话管理
    startSession() {
      this.generateTrainingContent()
      this.startTimers()
    },
    
    nextSession() {
      if (this.currentSession < this.totalSessions) {
        this.currentSession++
        this.startSession()
      } else {
        this.completeTraining()
      }
    },
    
    completeTraining() {
      this.isTraining = false
      this.clearTimers()
      this.showCompletionModal = true
      this.generateCompletionData()
      this.saveTrainingData()
      this.updateStatistics()
    },
    
    // 计时器管理
    startTimers() {
      this.trainingTimer = setInterval(() => {
        if (!this.isPaused) {
          this.timeRemaining--
          if (this.timeRemaining <= 0) {
            this.completeTraining()
          }
        }
      }, 1000)
      
      this.sessionTimer = setInterval(() => {
        if (!this.isPaused) {
          this.updateSessionProgress()
        }
      }, 100)
    },
    
    clearTimers() {
      if (this.trainingTimer) {
        clearInterval(this.trainingTimer)
        this.trainingTimer = null
      }
      if (this.sessionTimer) {
        clearInterval(this.sessionTimer)
        this.sessionTimer = null
      }
    },
    
    updateSessionProgress() {
      const mode = this.getCurrentMode()
      const sessionDuration = (mode.duration * 60) / this.totalSessions
      const sessionTime = sessionDuration - (this.timeRemaining % sessionDuration)
      this.sessionProgress = (sessionTime / sessionDuration) * 100
      
      if (this.sessionProgress >= 100 && this.settings.autoNext) {
        this.nextSession()
      }
    },
    
    // 训练内容生成
    initializeTrainingData() {
      this.dotsClicked = 0
      this.totalDots = 0
      this.numbersFound = 0
      this.shapesFound = 0
      this.wordsFound = 0
    },
    
    generateTrainingContent() {
      switch (this.selectedMode) {
        case 'dots':
          this.generateDots()
          break
        case 'numbers':
          this.generateNumbers()
          break
        case 'shapes':
          this.generateShapes()
          break
        case 'text':
          this.generateWords()
          break
        case 'motion':
          this.generateMotionTargets()
          break
        case 'peripheral':
          this.generatePeripheralTask()
          break
        case 'contrast':
          this.generateContrastTargets()
          break
        case 'depth':
          this.generateDepthTargets()
          break
      }
    },
    
    generateDots() {
      this.currentDots = []
      const count = 5 + this.settings.difficulty * 2
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
      
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
        const distance = 100 + Math.random() * (this.settings.visionRange - 100)
        const x = 300 + Math.cos(angle) * distance
        const y = 200 + Math.sin(angle) * distance
        
        this.currentDots.push({
          id: i,
          x: Math.max(20, Math.min(580, x)),
          y: Math.max(20, Math.min(380, y)),
          color: colors[Math.floor(Math.random() * colors.length)],
          active: false,
          clicked: false
        })
      }
      
      this.totalDots = count
      this.activateRandomDot()
    },
    
    activateRandomDot() {
      const availableDots = this.currentDots.filter(dot => !dot.active && !dot.clicked)
      if (availableDots.length > 0) {
        const randomDot = availableDots[Math.floor(Math.random() * availableDots.length)]
        randomDot.active = true
        
        setTimeout(() => {
          if (randomDot.active && !randomDot.clicked) {
            randomDot.active = false
            this.activateRandomDot()
          }
        }, this.settings.displayTime * 1000)
      }
    },
    
    clickDot(dotId) {
      const dot = this.currentDots.find(d => d.id === dotId)
      if (dot && dot.active) {
        dot.clicked = true
        dot.active = false
        this.dotsClicked++
        
        if (this.settings.soundEnabled) {
          this.playSound('success')
        }
        
        this.activateRandomDot()
      }
    },
    
    generateNumbers() {
      this.currentNumbers = []
      this.targetNumber = Math.floor(Math.random() * 9) + 1
      this.targetCount = 3 + this.settings.difficulty
      
      const totalCount = 15 + this.settings.difficulty * 5
      let targetPlaced = 0
      
      for (let i = 0; i < totalCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = 80 + Math.random() * (this.settings.visionRange - 80)
        const x = 300 + Math.cos(angle) * distance
        const y = 200 + Math.sin(angle) * distance
        
        let value
        let isTarget = false
        
        if (targetPlaced < this.targetCount && Math.random() < 0.3) {
          value = this.targetNumber
          isTarget = true
          targetPlaced++
        } else {
          do {
            value = Math.floor(Math.random() * 9) + 1
          } while (value === this.targetNumber)
        }
        
        this.currentNumbers.push({
          id: i,
          x: Math.max(20, Math.min(580, x)),
          y: Math.max(20, Math.min(380, y)),
          value: value,
          isTarget: isTarget,
          active: true,
          found: false
        })
      }
    },
    
    clickNumber(numberId) {
      const number = this.currentNumbers.find(n => n.id === numberId)
      if (number && number.active && number.isTarget && !number.found) {
        number.found = true
        this.numbersFound++
        
        if (this.settings.soundEnabled) {
          this.playSound('success')
        }
        
        if (this.numbersFound >= this.targetCount) {
          setTimeout(() => this.nextSession(), 1000)
        }
      }
    },
    
    generateShapes() {
      this.currentShapes = []
      const shapeTypes = ['circle', 'square', 'triangle']
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
      
      this.targetShape = {
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        name: this.getShapeName(shapeTypes[Math.floor(Math.random() * shapeTypes.length)], colors[Math.floor(Math.random() * colors.length)])
      }
      
      this.targetCount = 2 + this.settings.difficulty
      const totalCount = 12 + this.settings.difficulty * 3
      let targetPlaced = 0
      
      for (let i = 0; i < totalCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = 80 + Math.random() * (this.settings.visionRange - 80)
        const x = 300 + Math.cos(angle) * distance
        const y = 200 + Math.sin(angle) * distance
        
        let type, color, isTarget = false
        
        if (targetPlaced < this.targetCount && Math.random() < 0.25) {
          type = this.targetShape.type
          color = this.targetShape.color
          isTarget = true
          targetPlaced++
        } else {
          type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]
          color = colors[Math.floor(Math.random() * colors.length)]
          
          if (type === this.targetShape.type && color === this.targetShape.color) {
            color = colors.find(c => c !== this.targetShape.color)
          }
        }
        
        this.currentShapes.push({
          id: i,
          x: Math.max(20, Math.min(580, x)),
          y: Math.max(20, Math.min(380, y)),
          type: type,
          color: color,
          isTarget: isTarget,
          active: true,
          found: false
        })
      }
    },
    
    clickShape(shapeId) {
      const shape = this.currentShapes.find(s => s.id === shapeId)
      if (shape && shape.active && shape.isTarget && !shape.found) {
        shape.found = true
        this.shapesFound++
        
        if (this.settings.soundEnabled) {
          this.playSound('success')
        }
        
        if (this.shapesFound >= this.targetCount) {
          setTimeout(() => this.nextSession(), 1000)
        }
      }
    },
    
    generateWords() {
      this.currentWords = []
      const wordList = ['苹果', '香蕉', '橙子', '葡萄', '草莓', '桃子', '梨子', '西瓜', '猫咪', '小狗', '兔子', '鸟儿', '鱼儿', '蝴蝶', '花朵', '树木', '太阳', '月亮', '星星', '彩虹']
      
      this.targetWord = wordList[Math.floor(Math.random() * wordList.length)]
      this.targetCount = 2 + Math.floor(this.settings.difficulty / 2)
      const totalCount = 10 + this.settings.difficulty * 2
      let targetPlaced = 0
      
      for (let i = 0; i < totalCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = 80 + Math.random() * (this.settings.visionRange - 80)
        const x = 300 + Math.cos(angle) * distance
        const y = 200 + Math.sin(angle) * distance
        
        let text, isTarget = false
        
        if (targetPlaced < this.targetCount && Math.random() < 0.3) {
          text = this.targetWord
          isTarget = true
          targetPlaced++
        } else {
          do {
            text = wordList[Math.floor(Math.random() * wordList.length)]
          } while (text === this.targetWord)
        }
        
        this.currentWords.push({
          id: i,
          x: Math.max(20, Math.min(580, x)),
          y: Math.max(20, Math.min(380, y)),
          text: text,
          isTarget: isTarget,
          active: true,
          found: false
        })
      }
    },
    
    clickWord(wordId) {
      const word = this.currentWords.find(w => w.id === wordId)
      if (word && word.active && word.isTarget && !word.found) {
        word.found = true
        this.wordsFound++
        
        if (this.settings.soundEnabled) {
          this.playSound('success')
        }
        
        if (this.wordsFound >= this.targetCount) {
          setTimeout(() => this.nextSession(), 1000)
        }
      }
    },
    
    // 新训练模式生成方法
    generateMotionTargets() {
      this.currentMotionTargets = []
      const count = 3 + this.settings.difficulty
      const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44']
      
      for (let i = 0; i < count; i++) {
        const startAngle = Math.random() * Math.PI * 2
        const radius = 150 + Math.random() * (this.settings.visionRange - 150)
        const speed = (this.settings.movementSpeed === 'slow' ? 0.5 : this.settings.movementSpeed === 'fast' ? 2 : 1) * (0.5 + Math.random())
        
        this.currentMotionTargets.push({
          id: i,
          angle: startAngle,
          radius: radius,
          speed: speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          active: true,
          clicked: false,
          direction: Math.random() > 0.5 ? 1 : -1
        })
      }
      
      this.startMotionAnimation()
    },
    
    generatePeripheralTask() {
      this.currentPeripheralData = {
        centerTask: {
          type: 'counting',
          numbers: [],
          targetSum: 0
        },
        peripheralTargets: []
      }
      
      // 中心任务：数字计算
      for (let i = 0; i < 5; i++) {
        const num = Math.floor(Math.random() * 9) + 1
        this.currentPeripheralData.centerTask.numbers.push(num)
        this.currentPeripheralData.centerTask.targetSum += num
      }
      
      // 周边任务：目标检测
      const targetCount = 2 + this.settings.difficulty
      const totalCount = 8 + this.settings.difficulty * 2
      
      for (let i = 0; i < totalCount; i++) {
        const angle = (Math.PI * 2 * i) / totalCount + Math.random() * 0.3
        const distance = 200 + Math.random() * (this.settings.visionRange - 200)
        const x = 300 + Math.cos(angle) * distance
        const y = 200 + Math.sin(angle) * distance
        
        this.currentPeripheralData.peripheralTargets.push({
          id: i,
          x: Math.max(20, Math.min(580, x)),
          y: Math.max(20, Math.min(380, y)),
          isTarget: i < targetCount,
          shape: i < targetCount ? 'star' : 'circle',
          found: false
        })
      }
    },
    
    generateContrastTargets() {
      this.currentContrastTargets = []
      const baseContrast = this.settings.contrast / 100
      const count = 4 + this.settings.difficulty
      
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
        const distance = 120 + Math.random() * (this.settings.visionRange - 120)
        const x = 300 + Math.cos(angle) * distance
        const y = 200 + Math.sin(angle) * distance
        
        const contrast = baseContrast * (0.3 + Math.random() * 0.7)
        const brightness = 128 + (Math.random() - 0.5) * 100 * contrast
        
        this.currentContrastTargets.push({
          id: i,
          x: Math.max(20, Math.min(580, x)),
          y: Math.max(20, Math.min(380, y)),
          brightness: Math.max(50, Math.min(200, brightness)),
          isTarget: Math.random() < 0.4,
          active: true,
          found: false
        })
      }
    },
    
    generateDepthTargets() {
      this.currentDepthTargets = []
      const count = 3 + this.settings.difficulty
      const layers = ['near', 'middle', 'far']
      
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
        const distance = 100 + Math.random() * (this.settings.visionRange - 100)
        const x = 300 + Math.cos(angle) * distance
        const y = 200 + Math.sin(angle) * distance
        
        const layer = layers[Math.floor(Math.random() * layers.length)]
        const size = layer === 'near' ? 20 : layer === 'middle' ? 15 : 10
        const opacity = layer === 'near' ? 1 : layer === 'middle' ? 0.8 : 0.6
        
        this.currentDepthTargets.push({
          id: i,
          x: Math.max(20, Math.min(580, x)),
          y: Math.max(20, Math.min(380, y)),
          layer: layer,
          size: size,
          opacity: opacity,
          isTarget: Math.random() < 0.5,
          active: true,
          found: false
        })
      }
    },
    
    // 动画和交互方法
    startMotionAnimation() {
      this.motionAnimationId = setInterval(() => {
        if (!this.isPaused && this.currentMotionTargets) {
          this.currentMotionTargets.forEach(target => {
            if (target.active) {
              target.angle += target.speed * target.direction * 0.02
              // 更新位置会在模板中通过计算属性处理
            }
          })
        }
      }, 16) // 60fps
    },
    
    clickMotionTarget(targetId) {
      const target = this.currentMotionTargets.find(t => t.id === targetId)
      if (target && target.active && !target.clicked) {
        target.clicked = true
        target.active = false
        
        if (this.settings.soundEnabled) {
          this.playSound('success')
        }
        
        // 检查是否完成
        const activeTargets = this.currentMotionTargets.filter(t => t.active)
        if (activeTargets.length === 0) {
          setTimeout(() => this.nextSession(), 1000)
        }
      }
    },
    
    clickPeripheralTarget(targetId) {
      const target = this.currentPeripheralData.peripheralTargets.find(t => t.id === targetId)
      if (target && target.isTarget && !target.found) {
        target.found = true
        
        if (this.settings.soundEnabled) {
          this.playSound('success')
        }
      }
    },
    
    clickContrastTarget(targetId) {
      const target = this.currentContrastTargets.find(t => t.id === targetId)
      if (target && target.isTarget && !target.found) {
        target.found = true
        
        if (this.settings.soundEnabled) {
          this.playSound('success')
        }
        
        // 检查完成条件
        const foundTargets = this.currentContrastTargets.filter(t => t.isTarget && t.found)
        const totalTargets = this.currentContrastTargets.filter(t => t.isTarget)
        if (foundTargets.length === totalTargets.length) {
          setTimeout(() => this.nextSession(), 1000)
        }
      }
    },
    
    clickDepthTarget(targetId) {
      const target = this.currentDepthTargets.find(t => t.id === targetId)
      if (target && target.isTarget && !target.found) {
        target.found = true
        
        if (this.settings.soundEnabled) {
          this.playSound('success')
        }
        
        // 检查完成条件
        const foundTargets = this.currentDepthTargets.filter(t => t.isTarget && t.found)
        const totalTargets = this.currentDepthTargets.filter(t => t.isTarget)
        if (foundTargets.length === totalTargets.length) {
          setTimeout(() => this.nextSession(), 1000)
        }
      }
    },
    
    // 辅助方法
    getCurrentInstruction() {
      switch (this.selectedMode) {
        case 'dots':
          return '注视中心十字，用余光观察周边，快速点击出现的彩色圆点'
        case 'numbers':
          return `保持注视中心，在周边区域找到所有数字 "${this.targetNumber}"`
        case 'shapes':
          return `注视中心点，找到所有 "${this.targetShape.name}" 形状`
        case 'text':
          return `保持中心注视，快速找到所有 "${this.targetWord}" 词汇`
        case 'motion':
          return '注视中心点，追踪并点击移动的彩色目标'
        case 'peripheral':
          return '专注中心计算任务的同时，用余光发现周边的星形目标'
        case 'contrast':
          return '在低对比度环境中，识别并点击目标图形'
        case 'depth':
          return '通过深度线索，识别不同层次的目标物体'
        default:
          return '请选择训练模式开始练习'
      }
    },
    
    getShapeName(type, color) {
      const typeNames = {
        circle: '圆形',
        square: '方形',
        triangle: '三角形'
      }
      const colorNames = {
        '#ff0000': '红色',
        '#00ff00': '绿色',
        '#0000ff': '蓝色',
        '#ffff00': '黄色',
        '#ff00ff': '紫色'
      }
      return `${colorNames[color]}${typeNames[type]}`
    },
    
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
    
    playSound(type) {
      // 音效播放逻辑
      if (this.settings.soundEnabled) {
        const audio = new Audio()
        audio.volume = 0.3
        
        switch (type) {
          case 'success':
            audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
            break
        }
        
        audio.play().catch(() => {})
      }
    },
    
    // 数据管理
    loadTrainingData() {
      const saved = localStorage.getItem('expandVisionTraining')
      if (saved) {
        const data = JSON.parse(saved)
        this.trainingModes.forEach(mode => {
          const savedMode = data.modes?.find(m => m.id === mode.id)
          if (savedMode) {
            mode.progress = savedMode.progress || 0
          }
        })
        
        if (data.settings) {
          this.settings = { ...this.settings, ...data.settings }
        }
      }
    },
    
    saveTrainingData() {
      const data = {
        modes: this.trainingModes.map(mode => ({
          id: mode.id,
          progress: mode.progress
        })),
        settings: this.settings,
        lastUpdated: Date.now()
      }
      localStorage.setItem('expandVisionTraining', JSON.stringify(data))
    },
    
    loadStatistics() {
      const saved = localStorage.getItem('expandVisionStats')
      if (saved) {
        this.statistics = { ...this.statistics, ...JSON.parse(saved) }
      }
    },
    
    updateStatistics() {
      this.statistics.totalSessions++
      this.statistics.totalTime += this.getCurrentMode().duration * 60
      
      // 更新进度数据
      const sessionData = {
        accuracy: this.accuracy,
        speed: 500, // 模拟反应速度
        date: new Date().toISOString().split('T')[0],
        mode: this.selectedMode,
        score: Math.round(this.accuracy * (500 / (500 + Math.random() * 200)))
      }
      
      this.statistics.progressData.push(sessionData)
      
      // 保持最近10次记录
      if (this.statistics.progressData.length > 10) {
        this.statistics.progressData = this.statistics.progressData.slice(-10)
      }
      
      // 计算平均值
      const recent = this.statistics.progressData.slice(-5)
      this.statistics.averageAccuracy = Math.round(
        recent.reduce((sum, item) => sum + item.accuracy, 0) / recent.length
      )
      this.statistics.averageSpeed = Math.round(
        recent.reduce((sum, item) => sum + item.speed, 0) / recent.length
      )
      
      // 更新今日统计
      const today = new Date().toDateString()
      if (this.statistics.todayStats.date !== today) {
        this.statistics.todayStats = {
          date: today,
          sessions: 0,
          time: 0,
          accuracy: 0,
          bestScore: 0
        }
      }
      
      this.statistics.todayStats.sessions++
      this.statistics.todayStats.time += this.getCurrentMode().duration * 60
      this.statistics.todayStats.accuracy = Math.round(
        (this.statistics.todayStats.accuracy * (this.statistics.todayStats.sessions - 1) + this.accuracy) /
        this.statistics.todayStats.sessions
      )
      
      if (sessionData.score > this.statistics.todayStats.bestScore) {
        this.statistics.todayStats.bestScore = sessionData.score
      }
      
      // 更新最佳记录
      if (this.accuracy > this.statistics.bestAccuracy) {
        this.statistics.bestAccuracy = this.accuracy
      }
      
      if (sessionData.speed > this.statistics.bestSpeed) {
        this.statistics.bestSpeed = sessionData.speed
      }
      
      // 更新模式统计
      const mode = this.selectedMode
      if (!this.statistics.modeStats[mode]) {
        this.statistics.modeStats[mode] = {
          attempts: 0,
          bestScore: 0,
          averageAccuracy: 0,
          totalTime: 0
        }
      }
      
      const modeStats = this.statistics.modeStats[mode]
      modeStats.attempts++
      modeStats.totalTime += this.getCurrentMode().duration * 60
      modeStats.averageAccuracy = Math.round(
        (modeStats.averageAccuracy * (modeStats.attempts - 1) + this.accuracy) /
        modeStats.attempts
      )
      
      if (sessionData.score > modeStats.bestScore) {
        modeStats.bestScore = sessionData.score
      }
      
      // 添加到性能历史
      this.statistics.performanceHistory.push({
        date: new Date().toISOString(),
        mode: mode,
        accuracy: this.accuracy,
        speed: sessionData.speed,
        score: sessionData.score,
        duration: this.getCurrentMode().duration * 60
      })
      
      // 保持历史记录在合理范围内
      if (this.statistics.performanceHistory.length > 100) {
        this.statistics.performanceHistory = this.statistics.performanceHistory.slice(-100)
      }
      
      // 添加到训练历史
      this.statistics.trainingHistory.push({
        date: new Date().toISOString(),
        mode: mode,
        settings: { ...this.settings },
        results: sessionData
      })
      
      // 保持训练历史在合理范围内
      if (this.statistics.trainingHistory.length > 50) {
        this.statistics.trainingHistory = this.statistics.trainingHistory.slice(-50)
      }
      
      // 检查成就
      this.checkAchievements(sessionData)
      
      // 更新能力评级
      this.updateAbilityRatings()
      
      localStorage.setItem('expandVisionStats', JSON.stringify(this.statistics))
    },
    
    // 检查成就
    checkAchievements(sessionData) {
      const achievements = this.statistics.achievements
      
      // 首次完成训练
      if (this.statistics.totalSessions === 1 && !achievements.firstTraining.unlocked) {
        achievements.firstTraining.unlocked = true
        achievements.firstTraining.unlockedAt = new Date().toISOString()
      }
      
      // 完美准确率
      if (sessionData.accuracy === 100 && !achievements.perfectAccuracy.unlocked) {
        achievements.perfectAccuracy.unlocked = true
        achievements.perfectAccuracy.unlockedAt = new Date().toISOString()
      }
      
      // 速度达人
      if (sessionData.speed >= 600 && !achievements.speedDemon.unlocked) {
        achievements.speedDemon.unlocked = true
        achievements.speedDemon.unlockedAt = new Date().toISOString()
      }
      
      // 坚持训练
      if (this.statistics.totalSessions >= 10 && !achievements.persistent.unlocked) {
        achievements.persistent.unlocked = true
        achievements.persistent.unlockedAt = new Date().toISOString()
      }
      
      // 全能选手
      const completedModes = Object.keys(this.statistics.modeStats).length
      if (completedModes >= 8 && !achievements.allRounder.unlocked) {
        achievements.allRounder.unlocked = true
        achievements.allRounder.unlockedAt = new Date().toISOString()
      }
    },
    
    updateAbilityRatings() {
      // 基于统计数据更新能力评级
      this.statistics.visionRangeRating = Math.min(5, Math.max(1, Math.floor(this.settings.visionRange / 160)))
      this.statistics.reactionSpeedRating = Math.min(5, Math.max(1, 6 - Math.floor(this.statistics.averageSpeed / 100)))
      this.statistics.attentionRating = Math.min(5, Math.max(1, Math.floor(this.statistics.averageAccuracy / 20)))
      this.statistics.accuracyRating = Math.min(5, Math.max(1, Math.floor(this.statistics.averageAccuracy / 20)))
    },
    
    generateCompletionData() {
      const mode = this.getCurrentMode()
      this.completionData = {
        accuracy: this.accuracy,
        duration: mode.duration * 60,
        sessions: this.currentSession,
        averageReaction: 450 + Math.random() * 200,
        visionRange: this.settings.visionRange,
        newAchievement: this.accuracy > 80,
        achievementTitle: '视野大师',
        achievementDescription: '在扩大视野训练中达到80%以上准确率！'
      }
      
      // 更新模式进度
      const currentMode = this.getCurrentMode()
      if (currentMode) {
        currentMode.progress = Math.min(100, currentMode.progress + 20)
      }
    },
    
    // 弹窗控制
    closeCompletionModal() {
      this.showCompletionModal = false
    },
    
    startNextTraining() {
      this.showCompletionModal = false
      const nextModeIndex = this.trainingModes.findIndex(mode => mode.id === this.selectedMode) + 1
      if (nextModeIndex < this.trainingModes.length) {
        this.startTraining(this.trainingModes[nextModeIndex].id)
      } else {
        this.startTraining(this.trainingModes[0].id)
      }
    }
  }
}
</script>

<style scoped>
.expand-vision-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

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

.training-modes {
  margin-bottom: 3rem;
}

.training-modes h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.mode-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  border: 2px solid transparent;
}

.mode-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.mode-card.active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.mode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.mode-icon {
  font-size: 2rem;
}

.mode-level {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.mode-level.beginner {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.mode-level.intermediate {
  background: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning);
}

.mode-level.advanced {
  background: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
}

.mode-card h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.mode-description {
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.mode-details {
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  font-size: 0.85rem;
}

.detail-label {
  color: var(--color-text-secondary);
}

.detail-value {
  color: var(--color-primary);
  font-weight: 600;
}

.mode-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.start-mode-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 100%;
}

.start-mode-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.training-interface {
  margin-bottom: 3rem;
}

.training-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  border: 2px solid rgba(var(--color-primary-rgb), 0.1);
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.training-header h3 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.5rem;
}

.training-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.training-timer {
  text-align: center;
  margin-bottom: 2rem;
}

.timer-display {
  margin-bottom: 1rem;
}

.time-remaining {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.session-info {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.timer-progress {
  margin-bottom: 1rem;
}

.training-content {
  margin-bottom: 2rem;
}

.instruction {
  text-align: center;
  font-size: 1.1rem;
  color: var(--color-text);
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
}

.vision-field {
  position: relative;
  width: 600px;
  height: 400px;
  background: rgba(var(--color-primary-rgb), 0.02);
  border-radius: 12px;
  margin: 0 auto 2rem;
  border: 2px solid rgba(var(--color-primary-rgb), 0.1);
  overflow: hidden;
}

.center-point {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary);
  z-index: 10;
}

.dot-item {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-normal);
  opacity: 0.3;
}

.dot-item.active {
  opacity: 1;
  transform: scale(1.2);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
}

.dot-item.clicked {
  opacity: 0.5;
  transform: scale(0.8);
}

.number-item {
  position: absolute;
  width: 30px;
  height: 30px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.number-item.target {
  background: rgba(var(--color-warning-rgb), 0.2);
  color: var(--color-warning);
}

.number-item.found {
  background: rgba(var(--color-success-rgb), 0.2);
  color: var(--color-success);
  transform: scale(1.1);
}

.number-item:hover {
  transform: scale(1.05);
}

.shape-item {
  position: absolute;
  width: 25px;
  height: 25px;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.shape-item.circle {
  border-radius: 50%;
}

.shape-item.square {
  border-radius: 4px;
}

.shape-item.triangle {
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 25px solid;
  background: transparent !important;
}

.shape-item.target {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.shape-item.found {
  transform: scale(1.2);
  opacity: 0.7;
}

.shape-item:hover {
  transform: scale(1.1);
}

.word-item {
  position: absolute;
  padding: 0.3rem 0.6rem;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.word-item.target {
  background: rgba(var(--color-warning-rgb), 0.2);
  color: var(--color-warning);
}

.word-item.found {
  background: rgba(var(--color-success-rgb), 0.2);
  color: var(--color-success);
  transform: scale(1.1);
}

.word-item:hover {
  transform: scale(1.05);
}

.text-field {
  background: rgba(var(--color-bg-rgb), 0.5);
}

.target-info {
  text-align: center;
  margin-bottom: 1rem;
}

.target-display {
  font-size: 1.2rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.target-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-warning);
  background: rgba(var(--color-warning-rgb), 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  margin: 0 0.5rem;
}

.target-shape {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin: 0 0.5rem;
  vertical-align: middle;
}

.target-shape.circle {
  border-radius: 50%;
}

.target-shape.square {
  border-radius: 3px;
}

.target-shape.triangle {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 20px solid;
  background: transparent !important;
}

.target-name {
  font-weight: bold;
  color: var(--color-warning);
}

.target-word {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--color-warning);
  background: rgba(var(--color-warning-rgb), 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  margin: 0 0.5rem;
}

.found-count {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.training-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.3rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

.training-progress {
  background: rgba(var(--color-primary-rgb), 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.training-settings {
  margin-bottom: 3rem;
}

.training-settings h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.setting-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.setting-card h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.setting-item {
  margin-bottom: 1rem;
}

.setting-item label {
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  cursor: pointer;
}

.number-input, .select-input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
  width: 100%;
}

.range-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.range-input {
  flex: 1;
}

.range-value {
  color: var(--color-primary);
  font-weight: 600;
  min-width: 60px;
}

.training-statistics {
  margin-bottom: 3rem;
}

.training-statistics h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.stats-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.stats-card h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.stats-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stats-overview .stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
}

.stat-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-info .stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.2rem;
}

.stat-info .stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.performance-chart {
  height: 200px;
  position: relative;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 100%;
  padding: 1rem 0;
}

.chart-bar {
  background: var(--color-primary);
  width: 25px;
  min-height: 10px;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all var(--transition-normal);
  cursor: pointer;
}

.chart-bar:hover {
  background: var(--color-primary-dark);
}

.bar-label {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.6rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.ability-ratings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rating-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-label {
  color: var(--color-text);
  font-size: 0.9rem;
}

.rating-stars {
  display: flex;
  gap: 0.2rem;
}

.star {
  font-size: 1rem;
  opacity: 0.3;
  transition: opacity var(--transition-normal);
}

.star.filled {
  opacity: 1;
}

/* 动态追踪训练样式 */
.motion-tracking .vision-field {
  overflow: hidden;
}

.motion-target {
  position: absolute;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.1s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.motion-target.active {
  animation: motionMove 2s linear infinite;
  box-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.6);
}

@keyframes motionMove {
  0% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(50px) translateY(-30px); }
  50% { transform: translateX(-30px) translateY(40px); }
  75% { transform: translateX(40px) translateY(20px); }
  100% { transform: translateX(0) translateY(0); }
}

/* 周边感知训练样式 */
.peripheral-training .center-task-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 10px;
  background: rgba(var(--color-primary-rgb), 0.1);
  padding: 15px;
  border-radius: 8px;
  border: 2px solid var(--color-primary);
}

.center-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  padding: 5px 10px;
  background: white;
  border-radius: 4px;
}

.peripheral-target {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.peripheral-target.active {
  animation: peripheralPulse 1s ease-in-out infinite;
}

@keyframes peripheralPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

/* 对比度训练样式 */
.contrast-training .contrast-field {
  position: relative;
}

.contrast-target {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.contrast-target.active {
  animation: contrastFlicker 0.5s ease-in-out;
}

.contrast-target.target {
  box-shadow: 0 0 5px rgba(255, 255, 0, 0.5);
}

@keyframes contrastFlicker {
  0%, 100% { opacity: var(--target-opacity, 0.3); }
  50% { opacity: 1; }
}

/* 深度感知训练样式 */
.depth-training .depth-field {
  perspective: 1000px;
  transform-style: preserve-3d;
}

.depth-target {
  position: absolute;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.depth-target.active {
  animation: depthFloat 2s ease-in-out infinite;
}

.depth-target.target {
  border-color: var(--color-warning);
  box-shadow: 0 0 8px rgba(var(--color-warning-rgb), 0.6);
}

@keyframes depthFloat {
  0%, 100% { transform: translateZ(0px) scale(var(--target-scale, 1)); }
  50% { transform: translateZ(20px) scale(calc(var(--target-scale, 1) * 1.1)); }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-modal {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.completion-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: center;
}

.stat-circle {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.circle-progress {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    var(--color-primary) calc(var(--progress) * 1%),
    rgba(var(--color-primary-rgb), 0.1) 0
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle-progress::before {
  content: '';
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background: var(--color-card-bg);
  position: absolute;
}

.circle-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1;
}

.circle-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

.circle-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.completion-details {
  flex: 1;
}

.completion-details .detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
}

.completion-details .detail-label {
  color: var(--color-text-secondary);
}

.completion-details .detail-value {
  color: var(--color-primary);
  font-weight: 600;
}

.achievement {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(var(--color-warning-rgb), 0.1);
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.achievement-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.achievement-text h4 {
  color: var(--color-warning);
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.achievement-text p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 0.8rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.primary-btn, .secondary-btn {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.primary-btn {
  background: var(--color-primary);
  color: white;
}

.primary-btn:hover {
  background: var(--color-primary-dark);
}

.secondary-btn {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.secondary-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.2);
}

@media (max-width: 768px) {
  .expand-vision-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .modes-grid {
    grid-template-columns: 1fr;
  }
  
  .vision-field {
    width: 100%;
    max-width: 500px;
    height: 300px;
  }
  
  .training-controls {
    flex-direction: column;
  }
  
  .time-remaining {
    font-size: 2rem;
  }
  
  .training-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .completion-stats {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .range-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .range-value {
    text-align: center;
    min-width: auto;
  }
}
</style>