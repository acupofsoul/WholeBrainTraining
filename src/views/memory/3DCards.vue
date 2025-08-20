<template>
  <div class="three-d-card-container">

    <!-- 训练模式选择 -->
    <div v-if="!isTraining" class="training-modes">
      <h2>选择训练模式</h2>
      <div class="mode-grid">
        <div 
          v-for="mode in trainingModes" 
          :key="mode.id"
          class="mode-card"
          :class="{ active: selectedMode === mode.id }"
          @click="selectMode(mode.id)"
        >
          <div class="mode-icon">{{ mode.icon }}</div>
          <h3>{{ mode.name }}</h3>
          <p>{{ mode.description }}</p>
          <div class="mode-stats">
            <span>难度: {{ mode.difficulty }}</span>
            <span>时长: {{ mode.duration }}</span>
          </div>
        </div>
      </div>
      <button 
        class="start-btn" 
        :disabled="!selectedMode"
        @click="startTraining"
      >
        开始训练
      </button>
    </div>

    <!-- 训练界面 -->
    <div v-if="isTraining" class="training-interface">
      <!-- 训练控制栏 -->
      <div class="training-controls">
        <div class="control-group">
          <label>观察时间:</label>
          <div class="time-control">
            <button @click="adjustTime(-0.5)" :disabled="trainingPhase !== 'preparation'">-</button>
            <span>{{ settings.observeTime }}s</span>
            <button @click="adjustTime(0.5)" :disabled="trainingPhase !== 'preparation'">+</button>
          </div>
        </div>
        <div class="control-group">
          <button class="control-btn" @click="pauseTraining" v-if="trainingPhase === 'observing'">暂停</button>
          <button class="control-btn" @click="resumeTraining" v-if="trainingPhase === 'paused'">继续</button>
          <button class="control-btn" @click="stopTraining">结束训练</button>
        </div>
        <div class="training-stats">
          <span>轮次: {{ currentRound }}/{{ settings.totalRounds }}</span>
          <span>正确率: {{ Math.round(correctAnswers / Math.max(currentRound - 1, 1) * 100) }}%</span>
          <span>平均时间: {{ averageTime }}s</span>
        </div>
      </div>

      <!-- 3D卡片显示区域 -->
      <div class="card-display">
        <!-- 准备阶段 -->
        <div v-if="trainingPhase === 'preparation'" class="preparation-phase">
          <div class="preparation-message">
            <h3>准备观察3D卡片</h3>
            <p>请集中注意力，仔细观察即将出现的立体卡片</p>
            <div class="countdown">{{ countdown }}</div>
          </div>
        </div>

        <!-- 观察阶段 -->
        <div v-if="trainingPhase === 'observing'" class="observing-phase">
          <div class="card-area">
            <div class="card-3d" :class="currentCard.type">
              <!-- 基础形状 -->
              <div v-if="currentCard.type === 'basic'" class="basic-shape">
                <div 
                  class="shape-item"
                  :class="currentCard.shape"
                  :style="{ backgroundColor: currentCard.color }"
                ></div>
              </div>
              
              <!-- 复合图形 -->
              <div v-if="currentCard.type === 'complex'" class="complex-shape">
                <div 
                  v-for="(item, index) in currentCard.items" 
                  :key="index"
                  class="shape-item"
                  :class="item.shape"
                  :style="{ 
                    backgroundColor: item.color,
                    transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg)`,
                    zIndex: item.layer
                  }"
                ></div>
              </div>
              
              <!-- 数字组合 -->
              <div v-if="currentCard.type === 'numbers'" class="number-combination">
                <div 
                  v-for="(num, index) in currentCard.numbers" 
                  :key="index"
                  class="number-item"
                  :style="{ 
                    color: currentCard.colors[index],
                    fontSize: currentCard.sizes[index] + 'px',
                    transform: `rotate(${currentCard.rotations[index]}deg)`
                  }"
                >
                  {{ num }}
                </div>
              </div>
              
              <!-- 符号序列 -->
              <div v-if="currentCard.type === 'symbols'" class="symbol-sequence">
                <div 
                  v-for="(symbol, index) in currentCard.symbols" 
                  :key="index"
                  class="symbol-item"
                  :style="{ 
                    color: currentCard.colors[index],
                    transform: `scale(${currentCard.scales[index]}) rotate(${currentCard.rotations[index]}deg)`
                  }"
                >
                  {{ symbol }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="observe-timer">{{ observeTimer }}</div>
          <div class="observe-instructions">
            <p>仔细观察卡片上的内容，记住所有细节</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 回答阶段 -->
        <div v-if="trainingPhase === 'answering'" class="answer-phase">
          <div class="answer-area">
            <h3>请根据记忆回答问题</h3>
            
            <!-- 基础形状问题 -->
            <div v-if="currentCard.type === 'basic'" class="basic-questions">
              <div class="question-item">
                <p>形状是什么？</p>
                <div class="shape-options">
                  <div 
                    v-for="option in shapeOptions" 
                    :key="option"
                    class="shape-option"
                    :class="{ selected: userAnswers.shape === option }"
                    @click="selectAnswer('shape', option)"
                  >
                    <div class="shape-preview" :class="option"></div>
                    <span>{{ getShapeName(option) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="question-item">
                <p>颜色是什么？</p>
                <div class="color-options">
                  <div 
                    v-for="color in colorOptions" 
                    :key="color"
                    class="color-option"
                    :class="{ selected: userAnswers.color === color }"
                    :style="{ backgroundColor: color }"
                    @click="selectAnswer('color', color)"
                  ></div>
                </div>
              </div>
            </div>
            
            <!-- 复合图形问题 -->
            <div v-if="currentCard.type === 'complex'" class="complex-questions">
              <div class="question-item">
                <p>有多少个图形？</p>
                <div class="number-options">
                  <button 
                    v-for="num in [2, 3, 4, 5, 6]" 
                    :key="num"
                    class="number-option"
                    :class="{ selected: userAnswers.count === num }"
                    @click="selectAnswer('count', num)"
                  >
                    {{ num }}
                  </button>
                </div>
              </div>
              
              <div class="question-item">
                <p>请重建图形排列</p>
                <div class="rebuild-area">
                  <div class="canvas" ref="rebuildCanvas">
                    <div 
                      v-for="(item, index) in userAnswers.arrangement" 
                      :key="index"
                      class="placed-item"
                      :class="item.shape"
                      :style="{ 
                        backgroundColor: item.color,
                        left: item.x + 'px',
                        top: item.y + 'px',
                        transform: `rotate(${item.rotation}deg)`
                      }"
                      @click="removeItem(index)"
                    ></div>
                  </div>
                  <div class="item-palette">
                    <div 
                      v-for="(item, index) in availableItems" 
                      :key="index"
                      class="palette-item"
                      :class="item.shape"
                      :style="{ backgroundColor: item.color }"
                      @click="selectItem(item)"
                      draggable="true"
                      @dragstart="startDrag(item, $event)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 数字组合问题 -->
            <div v-if="currentCard.type === 'numbers'" class="number-questions">
              <div class="question-item">
                <p>数字序列是什么？</p>
                <div class="number-input">
                  <input 
                    v-for="(num, index) in userAnswers.numbers" 
                    :key="index"
                    v-model="userAnswers.numbers[index]"
                    type="number"
                    min="0"
                    max="9"
                    class="number-field"
                  >
                </div>
              </div>
              
              <div class="question-item">
                <p>颜色顺序是什么？</p>
                <div class="color-sequence">
                  <div 
                    v-for="(color, index) in userAnswers.colorSequence" 
                    :key="index"
                    class="color-slot"
                    :style="{ backgroundColor: color || '#f0f0f0' }"
                    @click="openColorPicker(index)"
                  >
                    {{ index + 1 }}
                  </div>
                </div>
                <div class="color-picker" v-if="showColorPicker">
                  <div 
                    v-for="color in colorOptions" 
                    :key="color"
                    class="picker-color"
                    :style="{ backgroundColor: color }"
                    @click="selectColor(color)"
                  ></div>
                </div>
              </div>
            </div>
            
            <!-- 符号序列问题 -->
            <div v-if="currentCard.type === 'symbols'" class="symbol-questions">
              <div class="question-item">
                <p>符号序列是什么？</p>
                <div class="symbol-input">
                  <select 
                    v-for="(symbol, index) in userAnswers.symbols" 
                    :key="index"
                    v-model="userAnswers.symbols[index]"
                    class="symbol-select"
                  >
                    <option value="">选择符号</option>
                    <option v-for="sym in symbolOptions" :key="sym" :value="sym">{{ sym }}</option>
                  </select>
                </div>
              </div>
            </div>
            
            <button 
              class="submit-btn" 
              :disabled="!isAnswerComplete"
              @click="submitAnswer"
            >
              提交答案
            </button>
          </div>
        </div>

        <!-- 结果阶段 -->
        <div v-if="trainingPhase === 'result'" class="result-phase">
          <div class="result-area">
            <h3 :class="isCorrect ? 'correct' : 'incorrect'">
              {{ isCorrect ? '回答正确！' : '回答错误' }}
            </h3>
            
            <div class="result-comparison">
              <div class="original-card">
                <h4>原始卡片</h4>
                <div class="card-preview">
                  <!-- 显示原始卡片内容 -->
                </div>
              </div>
              <div class="user-answer">
                <h4>您的答案</h4>
                <div class="answer-preview">
                  <!-- 显示用户答案 -->
                </div>
              </div>
            </div>
            
            <div class="result-stats">
              <p>用时: {{ responseTime }}秒</p>
              <p>准确度: {{ accuracy }}%</p>
              <p>得分: {{ roundScore }}分</p>
            </div>
            
            <button class="next-btn" @click="nextRound">下一轮</button>
          </div>
        </div>
      </div>

      <!-- 训练提示 -->
      <div class="training-tips">
        <h4>训练技巧</h4>
        <ul>
          <li>观察时要注意形状、颜色、位置、大小等所有细节</li>
          <li>可以在脑中构建立体模型来帮助记忆</li>
          <li>注意图形之间的相对位置关系</li>
          <li>利用颜色和形状的组合来增强记忆</li>
          <li>练习时保持专注，避免分心</li>
        </ul>
      </div>
    </div>

    <!-- 训练完成弹窗 -->
    <div v-if="showCompletionModal" class="modal-overlay" @click="closeModal">
      <div class="completion-modal" @click.stop>
        <h2>训练完成！</h2>
        <div class="completion-stats">
          <div class="stat-item">
            <span class="stat-label">总轮次:</span>
            <span class="stat-value">{{ settings.totalRounds }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">正确率:</span>
            <span class="stat-value">{{ Math.round(correctAnswers / settings.totalRounds * 100) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均用时:</span>
            <span class="stat-value">{{ averageTime }}秒</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总得分:</span>
            <span class="stat-value">{{ totalScore }}分</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">评级:</span>
            <span class="stat-value" :class="'rating-' + rating.toLowerCase()">{{ rating }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="primary-btn" @click="restartTraining">重新训练</button>
          <button class="secondary-btn" @click="backToModes">返回模式选择</button>
        </div>
      </div>
    </div>

    <!-- 训练设置 -->
    <div v-if="!isTraining" class="training-settings">
      <h2>训练设置</h2>
      <div class="settings-grid">
        <div class="setting-group">
          <label>观察时间 (秒)</label>
          <input 
            type="range" 
            v-model="settings.observeTime" 
            min="2" 
            max="10" 
            step="0.5"
          >
          <span>{{ settings.observeTime }}秒</span>
        </div>
        <div class="setting-group">
          <label>训练轮次</label>
          <select v-model="settings.totalRounds">
            <option value="5">5轮</option>
            <option value="10">10轮</option>
            <option value="15">15轮</option>
            <option value="20">20轮</option>
          </select>
        </div>
        <div class="setting-group">
          <label>难度级别</label>
          <select v-model="settings.difficulty">
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
        <div class="setting-group">
          <label>音效反馈</label>
          <input type="checkbox" v-model="settings.soundEnabled">
        </div>
        <div class="setting-group">
          <label>自动下一轮</label>
          <input type="checkbox" v-model="settings.autoNext">
        </div>
        <div class="setting-group">
          <label>显示提示</label>
          <input type="checkbox" v-model="settings.showHints">
        </div>
      </div>
    </div>

    <!-- 训练统计 -->
    <div v-if="!isTraining" class="training-statistics">
      <h2>训练统计</h2>
      
      <!-- 总体表现 -->
      <div class="stats-section">
        <h3>总体表现</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ statistics.totalSessions }}</div>
            <div class="stat-label">训练次数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ statistics.averageAccuracy }}%</div>
            <div class="stat-label">平均正确率</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ statistics.averageTime }}s</div>
            <div class="stat-label">平均用时</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ statistics.bestScore }}</div>
            <div class="stat-label">最高得分</div>
          </div>
        </div>
      </div>
      
      <!-- 不同模式表现 -->
      <div class="stats-section">
        <h3>不同模式表现</h3>
        <div class="mode-performance">
          <div 
            v-for="mode in trainingModes" 
            :key="mode.id"
            class="performance-item"
          >
            <div class="mode-info">
              <div class="mode-name">{{ mode.name }}</div>
              <div class="mode-difficulty">{{ mode.difficulty }}</div>
            </div>
            <div class="performance-stats">
              <div class="stat">
                <div class="stat-label">次数</div>
                <div class="stat-value">{{ statistics.modeStats[mode.id]?.sessions || 0 }}</div>
              </div>
              <div class="stat">
                <div class="stat-label">正确率</div>
                <div class="stat-value">{{ statistics.modeStats[mode.id]?.accuracy || 0 }}%</div>
              </div>
              <div class="stat">
                <div class="stat-label">最佳</div>
                <div class="stat-value">{{ statistics.modeStats[mode.id]?.best || 0 }}分</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 能力分析 -->
      <div class="stats-section">
        <h3>能力分析</h3>
        <div class="ability-radar">
          <div class="radar-chart">
            <div class="chart-placeholder">
              <p>📊 能力雷达图</p>
              <small>显示各项能力的发展水平</small>
            </div>
          </div>
          <div class="ability-details">
            <div class="ability-item">
              <span class="ability-name">空间感知</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: statistics.abilities.spatial + '%' }"></div>
              </div>
              <span class="ability-score">{{ statistics.abilities.spatial }}</span>
            </div>
            <div class="ability-item">
              <span class="ability-name">形状识别</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: statistics.abilities.shape + '%' }"></div>
              </div>
              <span class="ability-score">{{ statistics.abilities.shape }}</span>
            </div>
            <div class="ability-item">
              <span class="ability-name">颜色记忆</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: statistics.abilities.color + '%' }"></div>
              </div>
              <span class="ability-score">{{ statistics.abilities.color }}</span>
            </div>
            <div class="ability-item">
              <span class="ability-name">位置记忆</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: statistics.abilities.position + '%' }"></div>
              </div>
              <span class="ability-score">{{ statistics.abilities.position }}</span>
            </div>
            <div class="ability-item">
              <span class="ability-name">序列记忆</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: statistics.abilities.sequence + '%' }"></div>
              </div>
              <span class="ability-score">{{ statistics.abilities.sequence }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ThreeDCard',
  data() {
    return {
      // 训练状态
      isTraining: false,
      trainingPhase: 'preparation', // preparation, observing, answering, result
      selectedMode: null,
      currentRound: 1,
      correctAnswers: 0,
      totalScore: 0,
      showCompletionModal: false,
      
      // 计时器
      countdown: 3,
      observeTimer: 0,
      responseTime: 0,
      averageTime: 0,
      
      // 当前卡片
      currentCard: null,
      userAnswers: {},
      isCorrect: false,
      accuracy: 0,
      roundScore: 0,
      
      // UI状态
      showColorPicker: false,
      selectedColorIndex: 0,
      selectedItem: null,
      
      // 训练模式
      trainingModes: [
        {
          id: 'basic',
          name: '基础形状',
          icon: '🔷',
          description: '记忆简单的几何形状和颜色',
          difficulty: '简单',
          duration: '5-10分钟'
        },
        {
          id: 'complex',
          name: '复合图形',
          icon: '🎯',
          description: '记忆多个图形的组合和位置',
          difficulty: '中等',
          duration: '10-15分钟'
        },
        {
          id: 'numbers',
          name: '数字组合',
          icon: '🔢',
          description: '记忆数字序列和颜色组合',
          difficulty: '中等',
          duration: '8-12分钟'
        },
        {
          id: 'symbols',
          name: '符号序列',
          icon: '🔣',
          description: '记忆复杂符号的排列组合',
          difficulty: '困难',
          duration: '12-18分钟'
        }
      ],
      
      // 训练设置
      settings: {
        observeTime: 5,
        totalRounds: 10,
        difficulty: 'medium',
        soundEnabled: true,
        autoNext: false,
        showHints: true
      },
      
      // 选项数据
      shapeOptions: ['circle', 'square', 'triangle', 'diamond', 'pentagon', 'hexagon'],
      colorOptions: ['#ff4757', '#2ed573', '#3742fa', '#ffa502', '#ff6b81', '#70a1ff', '#5352ed', '#ff9ff3'],
      symbolOptions: ['★', '♠', '♥', '♦', '♣', '◆', '◇', '○', '●', '△', '▲', '□', '■'],
      availableItems: [],
      
      // 统计数据
      statistics: {
        totalSessions: 0,
        averageAccuracy: 0,
        averageTime: 0,
        bestScore: 0,
        modeStats: {},
        abilities: {
          spatial: 75,
          shape: 68,
          color: 82,
          position: 71,
          sequence: 79
        }
      },
      
      // 计时器引用
      timers: {
        countdown: null,
        observe: null,
        response: null
      }
    }
  },
  
  computed: {
    progressPercent() {
      if (this.settings.observeTime === 0) return 0
      return ((this.settings.observeTime - this.observeTimer) / this.settings.observeTime) * 100
    },
    
    isAnswerComplete() {
      if (!this.currentCard) return false
      
      switch (this.currentCard.type) {
        case 'basic':
          return this.userAnswers.shape && this.userAnswers.color
        case 'complex':
          return this.userAnswers.count && this.userAnswers.arrangement && this.userAnswers.arrangement.length > 0
        case 'numbers':
          return this.userAnswers.numbers && this.userAnswers.numbers.every(n => n !== '') &&
                 this.userAnswers.colorSequence && this.userAnswers.colorSequence.every(c => c)
        case 'symbols':
          return this.userAnswers.symbols && this.userAnswers.symbols.every(s => s !== '')
        default:
          return false
      }
    },
    
    rating() {
      const accuracy = this.correctAnswers / this.settings.totalRounds * 100
      if (accuracy >= 90) return 'S'
      if (accuracy >= 80) return 'A'
      if (accuracy >= 70) return 'B'
      if (accuracy >= 60) return 'C'
      return 'D'
    }
  },
  
  mounted() {
    this.loadStatistics()
  },
  
  beforeUnmount() {
    this.clearAllTimers()
  },
  
  methods: {
    // 模式选择
    selectMode(modeId) {
      this.selectedMode = modeId
    },
    
    // 开始训练
    startTraining() {
      if (!this.selectedMode) return
      
      this.isTraining = true
      this.currentRound = 1
      this.correctAnswers = 0
      this.totalScore = 0
      this.trainingPhase = 'preparation'
      this.startCountdown()
    },
    
    // 倒计时
    startCountdown() {
      this.countdown = 3
      this.timers.countdown = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.timers.countdown)
          this.startObserving()
        }
      }, 1000)
    },
    
    // 开始观察
    startObserving() {
      this.generateCard()
      this.trainingPhase = 'observing'
      this.observeTimer = this.settings.observeTime
      
      this.timers.observe = setInterval(() => {
        this.observeTimer--
        if (this.observeTimer <= 0) {
          clearInterval(this.timers.observe)
          this.startAnswering()
        }
      }, 1000)
    },
    
    // 开始回答
    startAnswering() {
      this.trainingPhase = 'answering'
      this.initializeAnswers()
      this.responseTime = 0
      
      this.timers.response = setInterval(() => {
        this.responseTime++
      }, 1000)
    },
    
    // 生成卡片
    generateCard() {
      const mode = this.trainingModes.find(m => m.id === this.selectedMode)
      if (!mode) return
      
      switch (mode.id) {
        case 'basic':
          this.currentCard = this.generateBasicCard()
          break
        case 'complex':
          this.currentCard = this.generateComplexCard()
          break
        case 'numbers':
          this.currentCard = this.generateNumberCard()
          break
        case 'symbols':
          this.currentCard = this.generateSymbolCard()
          break
      }
    },
    
    // 生成基础卡片
    generateBasicCard() {
      return {
        type: 'basic',
        shape: this.shapeOptions[Math.floor(Math.random() * this.shapeOptions.length)],
        color: this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)]
      }
    },
    
    // 生成复合卡片
    generateComplexCard() {
      const count = Math.floor(Math.random() * 4) + 2 // 2-5个图形
      const items = []
      
      for (let i = 0; i < count; i++) {
        items.push({
          shape: this.shapeOptions[Math.floor(Math.random() * this.shapeOptions.length)],
          color: this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)],
          x: Math.floor(Math.random() * 200) - 100,
          y: Math.floor(Math.random() * 200) - 100,
          rotation: Math.floor(Math.random() * 360),
          layer: i + 1
        })
      }
      
      return {
        type: 'complex',
        items
      }
    },
    
    // 生成数字卡片
    generateNumberCard() {
      const count = Math.floor(Math.random() * 3) + 3 // 3-5个数字
      const numbers = []
      const colors = []
      const sizes = []
      const rotations = []
      
      for (let i = 0; i < count; i++) {
        numbers.push(Math.floor(Math.random() * 10))
        colors.push(this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)])
        sizes.push(Math.floor(Math.random() * 20) + 30) // 30-50px
        rotations.push(Math.floor(Math.random() * 60) - 30) // -30到30度
      }
      
      return {
        type: 'numbers',
        numbers,
        colors,
        sizes,
        rotations
      }
    },
    
    // 生成符号卡片
    generateSymbolCard() {
      const count = Math.floor(Math.random() * 3) + 4 // 4-6个符号
      const symbols = []
      const colors = []
      const scales = []
      const rotations = []
      
      for (let i = 0; i < count; i++) {
        symbols.push(this.symbolOptions[Math.floor(Math.random() * this.symbolOptions.length)])
        colors.push(this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)])
        scales.push(Math.random() * 0.5 + 0.8) // 0.8-1.3倍
        rotations.push(Math.floor(Math.random() * 60) - 30)
      }
      
      return {
        type: 'symbols',
        symbols,
        colors,
        scales,
        rotations
      }
    },
    
    // 初始化答案
    initializeAnswers() {
      switch (this.currentCard.type) {
        case 'basic':
          this.userAnswers = { shape: null, color: null }
          break
        case 'complex':
          this.userAnswers = { count: null, arrangement: [] }
          this.generateAvailableItems()
          break
        case 'numbers':
          this.userAnswers = {
            numbers: new Array(this.currentCard.numbers.length).fill(''),
            colorSequence: new Array(this.currentCard.colors.length).fill(null)
          }
          break
        case 'symbols':
          this.userAnswers = {
            symbols: new Array(this.currentCard.symbols.length).fill('')
          }
          break
      }
    },
    
    // 生成可用项目
    generateAvailableItems() {
      this.availableItems = []
      
      // 添加正确的项目
      this.currentCard.items.forEach(item => {
        this.availableItems.push({
          shape: item.shape,
          color: item.color
        })
      })
      
      // 添加一些干扰项目
      for (let i = 0; i < 3; i++) {
        this.availableItems.push({
          shape: this.shapeOptions[Math.floor(Math.random() * this.shapeOptions.length)],
          color: this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)]
        })
      }
      
      // 打乱顺序
      this.availableItems = this.availableItems.sort(() => Math.random() - 0.5)
    },
    
    // 选择答案
    selectAnswer(type, value) {
      this.userAnswers[type] = value
    },
    
    // 选择项目
    selectItem(item) {
      this.selectedItem = item
    },
    
    // 开始拖拽
    startDrag(item, event) {
      this.selectedItem = item
      event.dataTransfer.setData('text/plain', '')
    },
    
    // 移除项目
    removeItem(index) {
      this.userAnswers.arrangement.splice(index, 1)
    },
    
    // 打开颜色选择器
    openColorPicker(index) {
      this.selectedColorIndex = index
      this.showColorPicker = true
    },
    
    // 选择颜色
    selectColor(color) {
      this.userAnswers.colorSequence[this.selectedColorIndex] = color
      this.showColorPicker = false
    },
    
    // 提交答案
    submitAnswer() {
      clearInterval(this.timers.response)
      this.checkAnswer()
      this.trainingPhase = 'result'
      
      if (this.settings.autoNext) {
        setTimeout(() => {
          this.nextRound()
        }, 2000)
      }
    },
    
    // 检查答案
    checkAnswer() {
      let correct = false
      let accuracy = 0
      
      switch (this.currentCard.type) {
        case 'basic':
          correct = this.userAnswers.shape === this.currentCard.shape && 
                   this.userAnswers.color === this.currentCard.color
          accuracy = correct ? 100 : 0
          break
        case 'complex':
          const countCorrect = this.userAnswers.count === this.currentCard.items.length
          // 简化的位置检查
          const arrangementScore = Math.min(this.userAnswers.arrangement.length / this.currentCard.items.length, 1)
          accuracy = (countCorrect ? 50 : 0) + (arrangementScore * 50)
          correct = accuracy >= 70
          break
        case 'numbers':
          let numberScore = 0
          let colorScore = 0
          
          this.currentCard.numbers.forEach((num, index) => {
            if (parseInt(this.userAnswers.numbers[index]) === num) numberScore++
          })
          
          this.currentCard.colors.forEach((color, index) => {
            if (this.userAnswers.colorSequence[index] === color) colorScore++
          })
          
          accuracy = ((numberScore + colorScore) / (this.currentCard.numbers.length * 2)) * 100
          correct = accuracy >= 70
          break
        case 'symbols':
          let symbolScore = 0
          this.currentCard.symbols.forEach((symbol, index) => {
            if (this.userAnswers.symbols[index] === symbol) symbolScore++
          })
          accuracy = (symbolScore / this.currentCard.symbols.length) * 100
          correct = accuracy >= 70
          break
      }
      
      this.isCorrect = correct
      this.accuracy = Math.round(accuracy)
      
      if (correct) {
        this.correctAnswers++
        this.roundScore = Math.round(100 - (this.responseTime * 2)) // 基础分100，每秒扣2分
        this.roundScore = Math.max(this.roundScore, 10) // 最低10分
      } else {
        this.roundScore = Math.round(accuracy / 2) // 错误答案得一半分
      }
      
      this.totalScore += this.roundScore
      
      // 播放音效
      if (this.settings.soundEnabled) {
        this.playSound(correct ? 'correct' : 'incorrect')
      }
    },
    
    // 下一轮
    nextRound() {
      if (this.currentRound >= this.settings.totalRounds) {
        this.completeTraining()
        return
      }
      
      this.currentRound++
      this.trainingPhase = 'preparation'
      this.startCountdown()
    },
    
    // 完成训练
    completeTraining() {
      this.isTraining = false
      this.showCompletionModal = true
      this.calculateAverageTime()
      this.saveStatistics()
    },
    
    // 计算平均时间
    calculateAverageTime() {
      // 这里应该记录每轮的时间，简化处理
      this.averageTime = Math.round(this.responseTime)
    },
    
    // 暂停训练
    pauseTraining() {
      if (this.timers.observe) {
        clearInterval(this.timers.observe)
        this.trainingPhase = 'paused'
      }
    },
    
    // 恢复训练
    resumeTraining() {
      this.trainingPhase = 'observing'
      this.timers.observe = setInterval(() => {
        this.observeTimer--
        if (this.observeTimer <= 0) {
          clearInterval(this.timers.observe)
          this.startAnswering()
        }
      }, 1000)
    },
    
    // 停止训练
    stopTraining() {
      this.clearAllTimers()
      this.isTraining = false
      this.trainingPhase = 'preparation'
    },
    
    // 调整时间
    adjustTime(delta) {
      this.settings.observeTime = Math.max(2, Math.min(10, this.settings.observeTime + delta))
    },
    
    // 重新开始训练
    restartTraining() {
      this.showCompletionModal = false
      this.startTraining()
    },
    
    // 返回模式选择
    backToModes() {
      this.showCompletionModal = false
      this.selectedMode = null
    },
    
    // 关闭弹窗
    closeModal() {
      this.showCompletionModal = false
    },
    
    // 获取形状名称
    getShapeName(shape) {
      const names = {
        circle: '圆形',
        square: '正方形',
        triangle: '三角形',
        diamond: '菱形',
        pentagon: '五边形',
        hexagon: '六边形'
      }
      return names[shape] || shape
    },
    
    // 播放音效
    playSound(type) {
      // 这里可以添加音效播放逻辑
      console.log(`Playing ${type} sound`)
    },
    
    // 清除所有计时器
    clearAllTimers() {
      Object.values(this.timers).forEach(timer => {
        if (timer) clearInterval(timer)
      })
    },
    
    // 保存统计数据
    saveStatistics() {
      const stats = {
        mode: this.selectedMode,
        rounds: this.settings.totalRounds,
        correct: this.correctAnswers,
        accuracy: Math.round(this.correctAnswers / this.settings.totalRounds * 100),
        totalScore: this.totalScore,
        averageTime: this.averageTime,
        date: new Date().toISOString()
      }
      
      // 保存到localStorage
      const savedStats = JSON.parse(localStorage.getItem('threeDCardStats') || '[]')
      savedStats.push(stats)
      localStorage.setItem('threeDCardStats', JSON.stringify(savedStats))
      
      // 更新统计显示
      this.updateStatistics()
    },
    
    // 加载统计数据
    loadStatistics() {
      const savedStats = JSON.parse(localStorage.getItem('threeDCardStats') || '[]')
      if (savedStats.length > 0) {
        this.updateStatistics()
      }
    },
    
    // 更新统计数据
    updateStatistics() {
      const savedStats = JSON.parse(localStorage.getItem('threeDCardStats') || '[]')
      
      if (savedStats.length === 0) return
      
      this.statistics.totalSessions = savedStats.length
      this.statistics.averageAccuracy = Math.round(
        savedStats.reduce((sum, stat) => sum + stat.accuracy, 0) / savedStats.length
      )
      this.statistics.averageTime = Math.round(
        savedStats.reduce((sum, stat) => sum + stat.averageTime, 0) / savedStats.length
      )
      this.statistics.bestScore = Math.max(...savedStats.map(stat => stat.totalScore))
      
      // 更新模式统计
      this.trainingModes.forEach(mode => {
        const modeStats = savedStats.filter(stat => stat.mode === mode.id)
        if (modeStats.length > 0) {
          this.statistics.modeStats[mode.id] = {
            sessions: modeStats.length,
            accuracy: Math.round(
              modeStats.reduce((sum, stat) => sum + stat.accuracy, 0) / modeStats.length
            ),
            best: Math.max(...modeStats.map(stat => stat.totalScore))
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.three-d-card-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

/* 训练模式选择 */
.training-modes {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.training-modes h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-size: 1.8rem;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.mode-card {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.mode-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.mode-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.mode-card h3 {
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}

.mode-card p {
  margin: 0 0 15px 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.mode-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  opacity: 0.7;
}

.start-btn {
  display: block;
  margin: 0 auto;
  padding: 15px 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 训练界面 */
.training-interface {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

/* 训练控制栏 */
.training-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-group label {
  font-weight: bold;
  color: #333;
}

.time-control {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 8px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
}

.time-control button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.time-control button:hover:not(:disabled) {
  background: #764ba2;
  transform: scale(1.1);
}

.time-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.control-btn:first-of-type {
  background: #27ae60;
  color: white;
}

.control-btn:last-of-type {
  background: #e74c3c;
  color: white;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
}

.training-stats {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: #666;
}

/* 3D卡片显示区域 */
.card-display {
  background: #000;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 30px;
  min-height: 500px;
  position: relative;
  perspective: 1000px;
}

/* 准备阶段 */
.preparation-phase {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preparation-message {
  text-align: center;
  color: #fff;
}

.preparation-message h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.preparation-message p {
  opacity: 0.8;
  margin-bottom: 20px;
}

.countdown {
  font-size: 4rem;
  font-weight: bold;
  color: #667eea;
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* 观察阶段 */
.observing-phase {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-area {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  perspective: 1000px;
}

.card-3d {
  width: 300px;
  height: 200px;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
  animation: cardFloat 3s ease-in-out infinite;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

@keyframes cardFloat {
  0%, 100% { transform: rotateY(0deg) rotateX(0deg); }
  25% { transform: rotateY(5deg) rotateX(2deg); }
  50% { transform: rotateY(0deg) rotateX(5deg); }
  75% { transform: rotateY(-5deg) rotateX(2deg); }
}

/* 基础形状 */
.basic-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.shape-item {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.shape-item.circle {
  border-radius: 50%;
}

.shape-item.triangle {
  width: 0;
  height: 0;
  border-left: 40px solid transparent;
  border-right: 40px solid transparent;
  border-bottom: 69px solid;
  background: none !important;
  border-radius: 0;
}

.shape-item.diamond {
  transform: rotate(45deg);
}

.shape-item.pentagon {
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

.shape-item.hexagon {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

/* 复合图形 */
.complex-shape {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.complex-shape .shape-item {
  position: absolute;
  width: 40px;
  height: 40px;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
}

/* 数字组合 */
.number-combination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
}

.number-item {
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

/* 符号序列 */
.symbol-sequence {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
}

.symbol-item {
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

.observe-timer {
  font-size: 2rem;
  color: #fff;
  font-weight: bold;
  margin-bottom: 20px;
}

.observe-instructions {
  text-align: center;
  color: #fff;
}

.observe-instructions p {
  margin-bottom: 20px;
  opacity: 0.8;
}

.progress-bar {
  width: 300px;
  height: 6px;
  background: rgba(255,255,255,0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 回答阶段 */
.answer-phase {
  color: #333;
  padding: 20px;
}

.answer-area {
  background: #fff;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 20px;
}

.answer-area h3 {
  text-align: center;
  margin-bottom: 25px;
  color: #667eea;
}

/* 基础形状问题 */
.basic-questions {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.question-item {
  text-align: center;
}

.question-item p {
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.shape-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.shape-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.shape-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.shape-option.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.shape-preview {
  width: 40px;
  height: 40px;
  background: #667eea;
  border-radius: 5px;
}

.shape-preview.circle {
  border-radius: 50%;
}

.shape-preview.triangle {
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 35px solid #667eea;
  background: none;
  border-radius: 0;
}

.shape-preview.diamond {
  transform: rotate(45deg);
}

.shape-preview.pentagon {
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

.shape-preview.hexagon {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.color-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 15px;
  max-width: 500px;
  margin: 0 auto;
}

.color-option {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  border: 3px solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.color-option.selected {
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.5);
}

/* 复合图形问题 */
.complex-questions {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.number-options {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.number-option {
  width: 50px;
  height: 50px;
  border: 2px solid #ddd;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.number-option:hover {
  transform: scale(1.1);
  border-color: #667eea;
}

.number-option.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.rebuild-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.canvas {
  width: 300px;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 10px;
  position: relative;
  background: #f8f9fa;
}

.placed-item {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.placed-item:hover {
  transform: scale(1.1);
}

.item-palette {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.palette-item {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.palette-item:hover {
  transform: scale(1.1);
  border-color: #667eea;
}

/* 数字组合问题 */
.number-questions {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.number-input {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.number-field {
  width: 50px;
  height: 50px;
  border: 2px solid #ddd;
  border-radius: 8px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.number-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
}

.color-sequence {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.color-slot {
  width: 50px;
  height: 50px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #333;
  transition: all 0.3s ease;
}

.color-slot:hover {
  transform: scale(1.1);
  border-color: #667eea;
}

.color-picker {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  max-width: 400px;
  margin: 0 auto;
}

.picker-color {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.picker-color:hover {
  transform: scale(1.1);
  border-color: #667eea;
}

/* 符号序列问题 */
.symbol-questions {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.symbol-input {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.symbol-select {
  width: 80px;
  height: 50px;
  border: 2px solid #ddd;
  border-radius: 8px;
  text-align: center;
  font-size: 1.5rem;
  background: white;
}

.symbol-select:focus {
  outline: none;
  border-color: #667eea;
}

.submit-btn {
  display: block;
  margin: 20px auto 0;
  padding: 15px 40px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #2ecc71;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 结果阶段 */
.result-phase {
  color: #333;
  padding: 20px;
}

.result-area {
  background: #fff;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  margin-bottom: 20px;
}

.result-area h3 {
  font-size: 1.8rem;
  margin-bottom: 25px;
}

.result-area h3.correct {
  color: #27ae60;
}

.result-area h3.incorrect {
  color: #e74c3c;
}

.result-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 25px;
}

.original-card h4,
.user-answer h4 {
  margin-bottom: 15px;
  color: #333;
}

.card-preview,
.answer-preview {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
}

.result-stats p {
  margin: 0;
  font-weight: bold;
  color: #666;
}

.next-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

/* 训练提示 */
.training-tips {
  background: #e8f4fd;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.training-tips h4 {
  color: #667eea;
  margin-bottom: 15px;
}

.training-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #555;
}

.training-tips li {
  margin-bottom: 8px;
  line-height: 1.5;
}

/* 完成弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-modal {
  background: white;
  border-radius: 15px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.completion-modal h2 {
  color: #333;
  margin-bottom: 25px;
  font-size: 2rem;
}

.completion-stats {
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-weight: bold;
  color: #666;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.rating-s { color: #f39c12; }
.rating-a { color: #27ae60; }
.rating-b { color: #3498db; }
.rating-c { color: #f1c40f; }
.rating-d { color: #e74c3c; }

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.primary-btn, .secondary-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.secondary-btn {
  background: #95a5a6;
  color: white;
}

.primary-btn:hover, .secondary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* 训练设置 */
.training-settings {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.training-settings h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-group label {
  font-weight: bold;
  color: #333;
}

.setting-group input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
}

.setting-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
}

.setting-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
}

.setting-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #667eea;
}

/* 训练统计 */
.training-statistics {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.training-statistics h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.stats-section {
  margin-bottom: 40px;
}

.stats-section h3 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 不同模式表现 */
.mode-performance {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.performance-item {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mode-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.mode-name {
  font-weight: bold;
  color: #333;
  font-size: 1.1rem;
}

.mode-difficulty {
  color: #666;
  font-size: 0.9rem;
}

.performance-stats {
  display: flex;
  gap: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat .stat-label {
  font-size: 0.8rem;
  color: #666;
}

.stat .stat-value {
  font-weight: bold;
  color: #667eea;
}

/* 能力分析 */
.ability-radar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: center;
}

.radar-chart {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
}

.chart-placeholder {
  color: #666;
}

.chart-placeholder p {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.chart-placeholder small {
  opacity: 0.7;
}

.ability-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ability-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.ability-name {
  min-width: 100px;
  font-weight: bold;
  color: #333;
}

.ability-bar {
  flex: 1;
  height: 10px;
  background: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
}

.ability-progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.ability-score {
  min-width: 50px;
  text-align: right;
  font-weight: bold;
  color: #667eea;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .three-d-card-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .training-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    justify-content: center;
  }
  
  .training-stats {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .mode-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ability-radar {
    grid-template-columns: 1fr;
  }
  
  .result-comparison {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .performance-item {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .performance-stats {
    justify-content: space-around;
  }
  
  .card-3d {
    width: 250px;
    height: 160px;
  }
  
  .shape-options {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .color-options {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .canvas {
    width: 250px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .completion-modal {
    padding: 25px;
  }
  
  .shape-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .color-options {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .number-input {
    flex-wrap: wrap;
  }
  
  .symbol-input {
    flex-wrap: wrap;
  }
  
  .card-3d {
    width: 200px;
    height: 130px;
  }
  
  .countdown {
    font-size: 3rem;
  }
  
  .result-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .canvas {
    width: 200px;
    height: 120px;
  }
}
</style>