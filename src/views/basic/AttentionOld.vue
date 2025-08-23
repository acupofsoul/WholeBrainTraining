<template>
  <div class="attention-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>注意力训练</h1>
      <p class="page-description">
        通过专注力练习和注意力分配训练，提高大脑的专注能力和抗干扰能力，
        培养持续、稳定、选择性的注意力品质。
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
              <span class="detail-label">训练类型:</span>
              <span class="detail-value">{{ mode.type }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">难度等级:</span>
              <span class="detail-value">{{ mode.difficulty }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">训练重点:</span>
              <span class="detail-value">{{ mode.focus }}</span>
            </div>
          </div>

          <div class="mode-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: mode.progress + '%' }"
              ></div>
            </div>
            <div class="progress-text">完成度: {{ mode.progress }}%</div>
          </div>

          <button 
            class="start-mode-btn"
            @click.stop="startTraining(mode.id)"
          >
            开始训练
          </button>
        </div>
      </div>
    </div>

    <!-- 训练界面 -->
    <div class="training-interface" v-if="isTraining">
      <div class="training-card">
        <div class="training-header">
          <h3>{{ currentModeData.name }}</h3>
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

        <!-- 专注力测试 -->
        <div class="focus-test" v-if="currentModeData.id === 'focus'">
          <div class="test-area">
            <div class="focus-target" 
                 :class="{ active: targetActive, correct: showCorrect, wrong: showWrong }"
                 @click="handleTargetClick">
              <div class="target-content">
                <span v-if="currentTask.type === 'color'" 
                      class="color-circle" 
                      :style="{ backgroundColor: currentTask.color }"></span>
                <span v-if="currentTask.type === 'number'" 
                      class="number-display">{{ currentTask.number }}</span>
                <span v-if="currentTask.type === 'shape'" 
                      class="shape-display">{{ currentTask.shape }}</span>
              </div>
            </div>
            
            <div class="task-instruction">
              <p>{{ currentTask.instruction }}</p>
              <div class="reaction-time" v-if="lastReactionTime > 0">
                反应时间: {{ lastReactionTime }}ms
              </div>
            </div>
          </div>
        </div>

        <!-- 选择性注意 -->
        <div class="selective-attention" v-if="currentModeData.id === 'selective'">
          <div class="attention-grid">
            <div 
              v-for="(item, index) in attentionItems" 
              :key="index"
              class="attention-item"
              :class="{ 
                target: item.isTarget, 
                distractor: !item.isTarget,
                selected: item.selected,
                correct: item.correct,
                wrong: item.wrong
              }"
              @click="selectAttentionItem(index)"
            >
              <span class="item-content">{{ item.content }}</span>
            </div>
          </div>
          
          <div class="selection-instruction">
            <p>{{ selectionTask.instruction }}</p>
            <div class="selection-stats">
              <span>目标数量: {{ selectionTask.targetCount }}</span>
              <span>已选择: {{ selectedCount }}</span>
            </div>
          </div>
        </div>

        <!-- 持续注意 -->
        <div class="sustained-attention" v-if="currentModeData.id === 'sustained'">
          <div class="vigilance-test">
            <div class="stimulus-area">
              <div class="stimulus-display" 
                   :class="{ active: stimulusActive, critical: criticalStimulus }">
                <span class="stimulus-content">{{ currentStimulus }}</span>
              </div>
            </div>
            
            <div class="vigilance-controls">
              <button class="response-btn" 
                      :class="{ active: responseActive }"
                      @click="handleVigilanceResponse"
                      :disabled="!stimulusActive">
                检测到目标
              </button>
            </div>
            
            <div class="vigilance-info">
              <p>持续观察屏幕，当出现目标刺激时立即点击按钮</p>
              <div class="vigilance-stats">
                <span>检测准确率: {{ vigilanceAccuracy }}%</span>
                <span>平均反应时间: {{ averageReactionTime }}ms</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分配注意 -->
        <div class="divided-attention" v-if="currentModeData.id === 'divided'">
          <div class="dual-task">
            <div class="task-left">
              <h4>任务A: 数字计算</h4>
              <div class="math-task">
                <div class="math-problem">{{ mathProblem.question }}</div>
                <div class="math-options">
                  <button 
                    v-for="option in mathProblem.options" 
                    :key="option"
                    class="option-btn"
                    @click="selectMathAnswer(option)"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
            </div>
            
            <div class="task-right">
              <h4>任务B: 图形识别</h4>
              <div class="shape-task">
                <div class="shape-sequence">
                  <span 
                    v-for="(shape, index) in shapeSequence" 
                    :key="index"
                    class="shape-item"
                    :class="{ highlight: index === currentShapeIndex }"
                  >
                    {{ shape }}
                  </span>
                </div>
                <div class="shape-question">
                  <p>{{ shapeQuestion.text }}</p>
                  <div class="shape-options">
                    <button 
                      v-for="option in shapeQuestion.options" 
                      :key="option"
                      class="option-btn"
                      @click="selectShapeAnswer(option)"
                    >
                      {{ option }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="dual-task-info">
            <p>同时完成两个任务，保持对两边任务的注意分配</p>
            <div class="dual-task-stats">
              <span>任务A准确率: {{ mathAccuracy }}%</span>
              <span>任务B准确率: {{ shapeAccuracy }}%</span>
              <span>综合表现: {{ overallPerformance }}%</span>
            </div>
          </div>
        </div>

        <!-- 抗干扰训练 -->
        <div class="interference-resistance" v-if="currentModeData.id === 'interference_resistance'">
          <div class="interference-area">
            <div class="target-zone">
              <div class="main-target" 
                   :class="{ visible: interferenceData.targetVisible }"
                   @click="handleInterferenceTarget">
                目标
              </div>
              
              <div 
                v-for="(distractor, index) in interferenceData.distractors" 
                :key="index"
                class="distractor"
                :style="{ 
                  left: distractor.x + 'px', 
                  top: distractor.y + 'px',
                  color: distractor.color 
                }"
                @click="handleDistractorClick">
                {{ distractor.content }}
              </div>
            </div>
            
            <div class="interference-info">
              <p>专注于中央目标，忽略周围的干扰元素</p>
              <div class="interference-stats">
                <span>干扰等级: {{ interferenceData.interferenceLevel }}</span>
                <span>抗干扰得分: {{ interferenceData.resistanceScore }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 认知灵活性训练 -->
        <div class="cognitive-flexibility" v-if="currentModeData.id === 'cognitive_flexibility'">
          <div class="flexibility-area">
            <div class="rule-display">
              <h4>当前规则: {{ flexibilityData.currentRule === 'color' ? '按颜色分类' : '按形状分类' }}</h4>
              <div class="rule-indicator" :class="flexibilityData.currentRule">
                {{ flexibilityData.currentRule === 'color' ? '🎨' : '🔷' }}
              </div>
            </div>
            
            <div class="stimulus-grid">
              <div 
                v-for="(stimulus, index) in flexibilityStimuli" 
                :key="index"
                class="flexibility-stimulus"
                :style="{ backgroundColor: stimulus.color }"
                @click="handleFlexibilityResponse(stimulus)">
                {{ stimulus.shape }}
              </div>
            </div>
            
            <div class="flexibility-info">
              <p>根据当前规则对刺激进行分类，规则会随时改变</p>
              <div class="flexibility-stats">
                <span>切换成本: {{ flexibilityData.switchCost }}ms</span>
                <span>适应时间: {{ flexibilityData.adaptationTime }}ms</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 工作记忆训练 -->
        <div class="working-memory" v-if="currentModeData.id === 'working_memory'">
          <div class="memory-area">
            <div class="sequence-display">
              <h4>记忆序列 (容量: {{ workingMemoryData.memorySpan }})</h4>
              <div class="memory-sequence">
                <div 
                  v-for="(item, index) in workingMemoryData.sequence" 
                  :key="index"
                  class="memory-item"
                  :class="{ 
                    active: index === workingMemoryData.currentPosition,
                    completed: index < workingMemoryData.currentPosition 
                  }">
                  {{ item }}
                </div>
              </div>
            </div>
            
            <div class="memory-input">
              <h4>请按顺序回忆</h4>
              <div class="input-grid">
                <button 
                  v-for="option in memoryOptions" 
                  :key="option"
                  class="memory-option"
                  @click="selectMemoryItem(option)">
                  {{ option }}
                </button>
              </div>
            </div>
            
            <div class="memory-progress">
              <div class="progress-indicator">
                <span>进度: {{ workingMemoryData.userSequence.length }} / {{ workingMemoryData.sequence.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 元认知监控训练 -->
        <div class="metacognitive-monitoring" v-if="currentModeData.id === 'metacognitive_monitoring'">
          <div class="monitoring-area">
            <div class="confidence-rating">
              <h4>预测你的表现</h4>
              <p>你认为这次任务能达到多少准确率？</p>
              <div class="confidence-scale">
                <button 
                  v-for="rating in [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]" 
                  :key="rating"
                  class="confidence-btn"
                  @click="setConfidenceRating(rating)">
                  {{ rating }}%
                </button>
              </div>
            </div>
            
            <div class="monitoring-task">
              <h4>执行任务</h4>
              <div class="task-content">
                <!-- 这里可以嵌入其他任务 -->
                <p>完成简单的认知任务...</p>
              </div>
            </div>
            
            <div class="monitoring-feedback">
              <h4>监控准确性</h4>
              <div class="monitoring-stats">
                <span>预测准确率: {{ getCurrentPrediction() }}%</span>
                <span>实际准确率: {{ getCurrentActual() }}%</span>
                <span>监控精度: {{ metacognitiveData.monitoringAccuracy }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 训练统计 -->
        <div class="training-stats">
          <div class="stat-item">
            <span class="stat-label">训练时间</span>
            <span class="stat-value">{{ formatTime(trainingTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">正确率</span>
            <span class="stat-value">{{ accuracy }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">反应时间</span>
            <span class="stat-value">{{ averageReactionTime }}ms</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">专注度</span>
            <span class="stat-value">{{ focusLevel }}/5</span>
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
              class="number-input"
              v-model="settings.duration"
              :min="1"
              :max="30"
            >
          </div>
          <div class="setting-item">
            <label>难度等级</label>
            <select class="select-input" v-model="settings.difficulty">
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
              <option value="expert">专家</option>
            </select>
          </div>
          <div class="setting-item">
            <label>刺激间隔 (秒)</label>
            <div class="range-container">
              <input 
                type="range" 
                class="range-input"
                v-model="settings.stimulusInterval"
                min="0.5"
                max="5"
                step="0.1"
              >
              <span class="range-value">{{ settings.stimulusInterval }}s</span>
            </div>
          </div>
        </div>

        <div class="setting-card">
          <h4>训练辅助</h4>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.soundFeedback"
              >
              声音反馈
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.visualFeedback"
              >
              视觉反馈
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.progressiveMode"
              >
              渐进式训练
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="settings.adaptiveDifficulty"
              >
              自适应难度
            </label>
          </div>
        </div>

        <div class="setting-card">
          <h4>个性化设置</h4>
          <div class="setting-item">
            <label>背景颜色</label>
            <select class="select-input" v-model="settings.backgroundColor">
              <option value="dark">深色</option>
              <option value="light">浅色</option>
              <option value="blue">蓝色</option>
              <option value="green">绿色</option>
            </select>
          </div>
          <div class="setting-item">
            <label>字体大小</label>
            <div class="range-container">
              <input 
                type="range" 
                class="range-input"
                v-model="settings.fontSize"
                min="12"
                max="24"
              >
              <span class="range-value">{{ settings.fontSize }}px</span>
            </div>
          </div>
          <div class="setting-item">
            <label>休息提醒 (分钟)</label>
            <input 
              type="number" 
              class="number-input"
              v-model="settings.breakReminder"
              :min="5"
              :max="60"
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
              <span class="stat-icon">🎯</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.totalSessions }}</span>
                <span class="stat-label">总训练次数</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⏱️</span>
              <div class="stat-info">
                <span class="stat-value">{{ formatTime(statistics.totalTime) }}</span>
                <span class="stat-label">总训练时间</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">✅</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.averageAccuracy }}%</span>
                <span class="stat-label">平均准确率</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⚡</span>
              <div class="stat-info">
                <span class="stat-value">{{ statistics.averageReactionTime }}ms</span>
                <span class="stat-label">平均反应时间</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>注意力类型分析</h4>
          <div class="attention-analysis">
            <div class="analysis-item">
              <span class="analysis-label">专注力</span>
              <div class="analysis-bar">
                <div 
                  class="analysis-fill" 
                  :style="{ width: statistics.focusScore + '%' }"
                ></div>
              </div>
              <span class="analysis-value">{{ statistics.focusScore }}%</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">选择性注意</span>
              <div class="analysis-bar">
                <div 
                  class="analysis-fill" 
                  :style="{ width: statistics.selectiveScore + '%' }"
                ></div>
              </div>
              <span class="analysis-value">{{ statistics.selectiveScore }}%</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">持续注意</span>
              <div class="analysis-bar">
                <div 
                  class="analysis-fill" 
                  :style="{ width: statistics.sustainedScore + '%' }"
                ></div>
              </div>
              <span class="analysis-value">{{ statistics.sustainedScore }}%</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">分配注意</span>
              <div class="analysis-bar">
                <div 
                  class="analysis-fill" 
                  :style="{ width: statistics.dividedScore + '%' }"
                ></div>
              </div>
              <span class="analysis-value">{{ statistics.dividedScore }}%</span>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>进步趋势</h4>
          <div class="progress-chart">
            <div class="chart-bars">
              <div 
                v-for="(data, index) in statistics.progressData" 
                :key="index"
                class="chart-bar"
                :style="{ height: data.score + '%' }"
                :title="`第${index + 1}次: ${data.score}%`"
              >
                <span class="bar-label">{{ index + 1 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>能力评估</h4>
          <div class="ability-radar">
            <div class="radar-chart">
              <div class="radar-grid">
                <div class="radar-line" v-for="i in 5" :key="i"></div>
              </div>
              <div class="radar-labels">
                <span class="radar-label" style="top: 0; left: 50%">专注力</span>
                <span class="radar-label" style="top: 25%; right: 0">选择性</span>
                <span class="radar-label" style="bottom: 25%; right: 0">持续性</span>
                <span class="radar-label" style="bottom: 0; left: 50%">分配性</span>
                <span class="radar-label" style="top: 25%; left: 0">抗干扰</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练完成弹窗 -->
    <div class="modal-overlay" v-if="showCompletionModal" @click="closeModal">
      <div class="completion-modal" @click.stop>
        <div class="modal-header">
          <h3>训练完成</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div class="completion-stats">
          <div class="stat-circle">
            <div 
              class="circle-progress" 
              :style="{ '--progress': completionData.accuracy }"
            >
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
              <span class="detail-label">平均反应时间:</span>
              <span class="detail-value">{{ completionData.reactionTime }}ms</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">专注度评分:</span>
              <span class="detail-value">{{ completionData.focusScore }}/5</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">完成任务数:</span>
              <span class="detail-value">{{ completionData.tasksCompleted }}</span>
            </div>
          </div>
        </div>

        <div class="achievement" v-if="completionData.achievement">
          <span class="achievement-icon">🏆</span>
          <div class="achievement-text">
            <h4>{{ completionData.achievement.title }}</h4>
            <p>{{ completionData.achievement.description }}</p>
          </div>
        </div>

        <div class="modal-actions">
          <button class="secondary-btn" @click="closeModal">返回</button>
          <button class="primary-btn" @click="restartTraining">再次训练</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Attention',
  data() {
    return {
      isTraining: false,
      isPaused: false,
      selectedMode: null,
      trainingTime: 0,
      accuracy: 0,
      averageReactionTime: 0,
      focusLevel: 0,
      showCompletionModal: false,
      
      // 训练模式
      trainingModes: [
        {
          id: 'focus',
          name: '专注力训练',
          icon: '🎯',
          level: 'beginner',
          levelText: '初级',
          description: '训练基础的专注能力，提高对单一目标的注意集中度',
          type: '专注训练',
          difficulty: '简单',
          focus: '集中注意',
          progress: 75
        },
        {
          id: 'selective',
          name: '选择性注意',
          icon: '🔍',
          level: 'intermediate',
          levelText: '中级',
          description: '训练在多个刺激中选择特定目标的能力',
          type: '选择训练',
          difficulty: '中等',
          focus: '选择注意',
          progress: 60
        },
        {
          id: 'sustained',
          name: '持续注意',
          icon: '⏰',
          level: 'intermediate',
          levelText: '中级',
          description: '训练长时间保持注意力的能力和警觉性',
          type: '持续训练',
          difficulty: '中等',
          focus: '持续注意',
          progress: 45
        },
        {
          id: 'divided',
          name: '分配注意',
          icon: '🔄',
          level: 'advanced',
          levelText: '高级',
          description: '训练同时处理多个任务的注意力分配能力',
          type: '分配训练',
          difficulty: '困难',
          focus: '注意分配',
          progress: 30
        },
        {
          id: 'interference_resistance',
          name: '抗干扰训练',
          icon: '🛡️',
          level: 'advanced',
          levelText: '高级',
          description: '训练在干扰环境中保持专注的能力，提高抗干扰性',
          type: '抗干扰训练',
          difficulty: '困难',
          focus: '抗干扰能力',
          progress: 20
        },
        {
          id: 'cognitive_flexibility',
          name: '认知灵活性',
          icon: '🧠',
          level: 'expert',
          levelText: '专家',
          description: '训练注意力在不同任务间快速切换的灵活性',
          type: '灵活性训练',
          difficulty: '专家',
          focus: '认知切换',
          progress: 15
        },
        {
          id: 'working_memory',
          name: '工作记忆训练',
          icon: '💭',
          level: 'expert',
          levelText: '专家',
          description: '训练工作记忆容量和注意力控制的协调能力',
          type: '记忆训练',
          difficulty: '专家',
          focus: '工作记忆',
          progress: 10
        },
        {
          id: 'metacognitive_monitoring',
          name: '元认知监控',
          icon: '🎛️',
          level: 'expert',
          levelText: '专家',
          description: '训练对自身注意状态的监控和调节能力',
          type: '元认知训练',
          difficulty: '专家',
          focus: '自我监控',
          progress: 5
        },
        {
          id: 'divided',
          name: '分配注意',
          icon: '🧩',
          level: 'advanced',
          levelText: '高级',
          description: '训练同时处理多个任务的注意力分配能力',
          type: '分配训练',
          difficulty: '困难',
          focus: '注意分配',
          progress: 30
        }
      ],
      
      // 当前训练模式数据
      currentModeData: {},
      
      // 专注力测试相关
      targetActive: false,
      showCorrect: false,
      showWrong: false,
      lastReactionTime: 0,
      currentTask: {
        type: 'color',
        color: '#ff0000',
        number: 5,
        shape: '●',
        instruction: '当圆圈变为红色时点击'
      },
      
      // 选择性注意相关
      attentionItems: [],
      selectedCount: 0,
      selectionTask: {
        instruction: '选择所有红色的数字',
        targetCount: 3
      },
      
      // 持续注意相关
      stimulusActive: false,
      criticalStimulus: false,
      responseActive: false,
      currentStimulus: 'X',
      vigilanceAccuracy: 0,
      
      // 分配注意相关
      mathProblem: {
        question: '15 + 23 = ?',
        options: [38, 35, 40, 33],
        correct: 38
      },
      shapeSequence: ['●', '■', '▲', '◆', '★'],
      currentShapeIndex: 0,
      shapeQuestion: {
        text: '第3个图形是什么？',
        options: ['●', '■', '▲', '◆'],
        correct: '▲'
      },
      mathAccuracy: 0,
      shapeAccuracy: 0,
      overallPerformance: 0,
      
      // 训练设置
      settings: {
        duration: 10,
        difficulty: 'medium',
        stimulusInterval: 2.0,
        soundFeedback: true,
        visualFeedback: true,
        progressiveMode: false,
        adaptiveDifficulty: true,
        backgroundColor: 'dark',
        fontSize: 16,
        breakReminder: 15
      },
      
      // 统计数据
      statistics: {
        totalSessions: 28,
        totalTime: 8400, // 秒
        averageAccuracy: 82,
        averageReactionTime: 650,
        focusScore: 85,
        selectiveScore: 78,
        sustainedScore: 80,
        dividedScore: 72,
        progressData: [
          { score: 65 },
          { score: 70 },
          { score: 75 },
          { score: 78 },
          { score: 82 },
          { score: 85 },
          { score: 88 }
        ]
      },
      
      // 完成数据
      completionData: {
        accuracy: 0,
        duration: 0,
        reactionTime: 0,
        focusScore: 0,
        tasksCompleted: 0,
        achievement: null
      },
      
      // 新增训练模式数据
      // 抗干扰训练
      interferenceData: {
        distractors: [],
        targetVisible: false,
        interferenceLevel: 1,
        resistanceScore: 0
      },
      
      // 认知灵活性训练
      flexibilityData: {
        currentRule: 'color',
        ruleHistory: [],
        switchCost: 0,
        adaptationTime: 0
      },
      
      // 工作记忆训练
      workingMemoryData: {
        sequence: [],
        userSequence: [],
        memorySpan: 3,
        currentPosition: 0
      },
      
      // 元认知监控训练
      metacognitiveData: {
        confidenceRatings: [],
        performancePredictions: [],
        actualPerformance: [],
        monitoringAccuracy: 0
      },
      
      // 定时器
      trainingTimer: null,
      stimulusTimer: null,
      taskTimer: null,
      interferenceTimer: null,
      flexibilityTimer: null,
      memoryTimer: null
    }
  },
  
  computed: {
    // 认知灵活性刺激
    flexibilityStimuli() {
      return [
        { shape: '●', color: '#ff0000' },
        { shape: '■', color: '#00ff00' },
        { shape: '▲', color: '#0000ff' },
        { shape: '◆', color: '#ffff00' },
        { shape: '★', color: '#ff00ff' },
        { shape: '●', color: '#00ffff' }
      ]
    },
    
    // 工作记忆选项
    memoryOptions() {
      return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    }
  },
  
  methods: {
    // 选择训练模式
    selectMode(modeId) {
      this.selectedMode = modeId
    },
    
    // 开始训练
    startTraining(modeId) {
      this.selectedMode = modeId
      this.currentModeData = this.trainingModes.find(mode => mode.id === modeId)
      
      // 重置训练状态
      this.resetTrainingState()
      
      this.isTraining = true
      this.startTrainingTimer()
      this.initializeTrainingMode()
    },
    
    // 暂停训练
    pauseTraining() {
      this.isPaused = true
      this.clearTimers()
    },
    
    // 恢复训练
    resumeTraining() {
      this.isPaused = false
      this.startTrainingTimer()
      this.initializeTrainingMode()
    },
    
    // 停止训练
    stopTraining() {
      this.clearTimers()
      this.calculateCompletionData()
      this.showCompletionModal = true
      this.isTraining = false
      this.isPaused = false
    },
    
    // 初始化训练模式
    initializeTrainingMode() {
      switch (this.currentModeData.id) {
        case 'focus':
          this.initializeFocusTraining()
          break
        case 'selective':
          this.initializeSelectiveTraining()
          break
        case 'sustained':
          this.initializeSustainedTraining()
          break
        case 'divided':
          this.initializeDividedTraining()
          break
        case 'interference_resistance':
          this.initializeInterferenceTraining()
          break
        case 'cognitive_flexibility':
          this.initializeFlexibilityTraining()
          break
        case 'working_memory':
          this.initializeWorkingMemoryTraining()
          break
        case 'metacognitive_monitoring':
          this.initializeMetacognitiveTraining()
          break
      }
    },
    
    // 初始化专注力训练
    initializeFocusTraining() {
      this.generateFocusTask()
      this.startFocusTimer()
    },
    
    // 生成专注力任务
    generateFocusTask() {
      const tasks = [
        {
          type: 'color',
          color: '#ff0000',
          instruction: '当圆圈变为红色时点击'
        },
        {
          type: 'number',
          number: Math.floor(Math.random() * 9) + 1,
          instruction: '当数字大于5时点击'
        },
        {
          type: 'shape',
          shape: ['●', '■', '▲', '◆'][Math.floor(Math.random() * 4)],
          instruction: '当出现圆形时点击'
        }
      ]
      
      this.currentTask = tasks[Math.floor(Math.random() * tasks.length)]
    },
    
    // 开始专注力定时器
    startFocusTimer() {
      this.stimulusTimer = setInterval(() => {
        this.activateTarget()
      }, this.settings.stimulusInterval * 1000)
    },
    
    // 激活目标
    activateTarget() {
      this.targetActive = true
      this.taskStartTime = Date.now()
      
      setTimeout(() => {
        if (this.targetActive) {
          this.targetActive = false
          // 未响应，记录错误
          this.recordResponse(false, 0)
        }
      }, 2000)
    },
    
    // 处理目标点击
    handleTargetClick() {
      if (this.targetActive) {
        const reactionTime = Date.now() - this.taskStartTime
        this.lastReactionTime = reactionTime
        this.targetActive = false
        
        // 判断是否正确
        const isCorrect = this.checkFocusResponse()
        this.recordResponse(isCorrect, reactionTime)
        
        // 显示反馈
        if (isCorrect) {
          this.showCorrect = true
          setTimeout(() => { this.showCorrect = false }, 500)
        } else {
          this.showWrong = true
          setTimeout(() => { this.showWrong = false }, 500)
        }
        
        // 生成新任务
        setTimeout(() => {
          this.generateFocusTask()
        }, 1000)
      }
    },
    
    // 检查专注力响应
    checkFocusResponse() {
      switch (this.currentTask.type) {
        case 'color':
          return this.currentTask.color === '#ff0000'
        case 'number':
          return this.currentTask.number > 5
        case 'shape':
          return this.currentTask.shape === '●'
        default:
          return false
      }
    },
    
    // 初始化选择性注意训练
    initializeSelectiveTraining() {
      this.generateAttentionItems()
    },
    
    // 生成注意力项目
    generateAttentionItems() {
      this.attentionItems = []
      const colors = ['red', 'blue', 'green', 'yellow']
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      
      // 生成目标项目
      for (let i = 0; i < this.selectionTask.targetCount; i++) {
        this.attentionItems.push({
          content: numbers[Math.floor(Math.random() * numbers.length)],
          color: 'red',
          isTarget: true,
          selected: false,
          correct: false,
          wrong: false
        })
      }
      
      // 生成干扰项目
      for (let i = 0; i < 12; i++) {
        this.attentionItems.push({
          content: numbers[Math.floor(Math.random() * numbers.length)],
          color: colors[Math.floor(Math.random() * 3) + 1], // 排除红色
          isTarget: false,
          selected: false,
          correct: false,
          wrong: false
        })
      }
      
      // 打乱顺序
      this.attentionItems = this.shuffleArray(this.attentionItems)
    },
    
    // 选择注意力项目
    selectAttentionItem(index) {
      const item = this.attentionItems[index]
      if (item.selected) return
      
      item.selected = true
      this.selectedCount++
      
      if (item.isTarget) {
        item.correct = true
      } else {
        item.wrong = true
      }
      
      // 检查是否完成
      if (this.selectedCount >= this.selectionTask.targetCount) {
        setTimeout(() => {
          this.generateAttentionItems()
          this.selectedCount = 0
        }, 1500)
      }
    },
    
    // 初始化持续注意训练
    initializeSustainedTraining() {
      this.startVigilanceTask()
    },
    
    // 开始警觉任务
    startVigilanceTask() {
      this.stimulusTimer = setInterval(() => {
        this.showStimulus()
      }, Math.random() * 3000 + 2000) // 2-5秒随机间隔
    },
    
    // 显示刺激
    showStimulus() {
      const stimuli = ['X', 'O', '+', '-', '*']
      this.currentStimulus = stimuli[Math.floor(Math.random() * stimuli.length)]
      this.criticalStimulus = this.currentStimulus === 'X'
      this.stimulusActive = true
      this.stimulusStartTime = Date.now()
      
      setTimeout(() => {
        this.stimulusActive = false
        if (this.criticalStimulus && !this.responseActive) {
          // 漏检
          this.recordVigilanceResponse(false, 0)
        }
        this.criticalStimulus = false
      }, 1500)
    },
    
    // 处理警觉响应
    handleVigilanceResponse() {
      if (this.stimulusActive) {
        const reactionTime = Date.now() - this.stimulusStartTime
        this.responseActive = true
        
        if (this.criticalStimulus) {
          // 正确检测
          this.recordVigilanceResponse(true, reactionTime)
        } else {
          // 误报
          this.recordVigilanceResponse(false, reactionTime)
        }
        
        setTimeout(() => {
          this.responseActive = false
        }, 500)
      }
    },
    
    // 记录警觉响应
    recordVigilanceResponse(correct, reactionTime) {
      // 更新警觉准确率和平均反应时间
      // 这里简化处理
      if (correct) {
        this.vigilanceAccuracy = Math.min(this.vigilanceAccuracy + 2, 100)
      } else {
        this.vigilanceAccuracy = Math.max(this.vigilanceAccuracy - 1, 0)
      }
      
      if (reactionTime > 0) {
        this.averageReactionTime = Math.round((this.averageReactionTime + reactionTime) / 2)
      }
    },
    
    // 初始化分配注意训练
    initializeDividedTraining() {
      this.generateMathProblem()
      this.generateShapeQuestion()
      this.startDualTaskTimer()
    },
    
    // 生成数学问题
    generateMathProblem() {
      const a = Math.floor(Math.random() * 50) + 10
      const b = Math.floor(Math.random() * 50) + 10
      const correct = a + b
      const options = [correct]
      
      // 生成错误选项
      while (options.length < 4) {
        const wrong = correct + Math.floor(Math.random() * 20) - 10
        if (wrong > 0 && !options.includes(wrong)) {
          options.push(wrong)
        }
      }
      
      this.mathProblem = {
        question: `${a} + ${b} = ?`,
        options: this.shuffleArray(options),
        correct: correct
      }
    },
    
    // 生成图形问题
    generateShapeQuestion() {
      const shapes = ['●', '■', '▲', '◆', '★']
      this.shapeSequence = []
      
      for (let i = 0; i < 5; i++) {
        this.shapeSequence.push(shapes[Math.floor(Math.random() * shapes.length)])
      }
      
      const questionIndex = Math.floor(Math.random() * 5)
      const correct = this.shapeSequence[questionIndex]
      const options = [correct]
      
      // 生成错误选项
      while (options.length < 4) {
        const wrong = shapes[Math.floor(Math.random() * shapes.length)]
        if (!options.includes(wrong)) {
          options.push(wrong)
        }
      }
      
      this.shapeQuestion = {
        text: `第${questionIndex + 1}个图形是什么？`,
        options: this.shuffleArray(options),
        correct: correct
      }
    },
    
    // 开始双任务定时器
    startDualTaskTimer() {
      this.taskTimer = setInterval(() => {
        this.generateMathProblem()
        this.generateShapeQuestion()
      }, 10000) // 每10秒更新任务
    },
    
    // 选择数学答案
    selectMathAnswer(answer) {
      const correct = answer === this.mathProblem.correct
      if (correct) {
        this.mathAccuracy = Math.min(this.mathAccuracy + 5, 100)
      } else {
        this.mathAccuracy = Math.max(this.mathAccuracy - 2, 0)
      }
      this.updateOverallPerformance()
    },
    
    // 选择图形答案
    selectShapeAnswer(answer) {
      const correct = answer === this.shapeQuestion.correct
      if (correct) {
        this.shapeAccuracy = Math.min(this.shapeAccuracy + 5, 100)
      } else {
        this.shapeAccuracy = Math.max(this.shapeAccuracy - 2, 0)
      }
      this.updateOverallPerformance()
    },
    
    // 更新综合表现
    updateOverallPerformance() {
      this.overallPerformance = Math.round((this.mathAccuracy + this.shapeAccuracy) / 2)
    },
    
    // 记录响应
    recordResponse(correct, reactionTime) {
      // 更新准确率和反应时间
      if (correct) {
        this.accuracy = Math.min(this.accuracy + 2, 100)
      } else {
        this.accuracy = Math.max(this.accuracy - 1, 0)
      }
      
      if (reactionTime > 0) {
        this.averageReactionTime = Math.round((this.averageReactionTime + reactionTime) / 2)
      }
      
      // 更新专注度
      this.updateFocusLevel()
    },
    
    // 更新专注度
    updateFocusLevel() {
      const accuracyFactor = this.accuracy / 100
      const speedFactor = Math.max(1 - (this.averageReactionTime - 500) / 1000, 0)
      this.focusLevel = Math.round((accuracyFactor + speedFactor) / 2 * 5)
    },
    
    // 开始训练定时器
    startTrainingTimer() {
      this.trainingTimer = setInterval(() => {
        this.trainingTime++
        
        // 检查是否达到训练时长
        if (this.trainingTime >= this.settings.duration * 60) {
          this.stopTraining()
        }
      }, 1000)
    },
    
    // 清除定时器
    clearTimers() {
      if (this.trainingTimer) {
        clearInterval(this.trainingTimer)
        this.trainingTimer = null
      }
      if (this.stimulusTimer) {
        clearInterval(this.stimulusTimer)
        this.stimulusTimer = null
      }
      if (this.taskTimer) {
        clearInterval(this.taskTimer)
        this.taskTimer = null
      }
      if (this.interferenceTimer) {
        clearInterval(this.interferenceTimer)
        this.interferenceTimer = null
      }
      if (this.flexibilityTimer) {
        clearInterval(this.flexibilityTimer)
        this.flexibilityTimer = null
      }
      if (this.memoryTimer) {
        clearInterval(this.memoryTimer)
        this.memoryTimer = null
      }
    },
    
    // 重置训练状态
    resetTrainingState() {
      this.trainingTime = 0
      this.accuracy = 50
      this.averageReactionTime = 800
      this.focusLevel = 3
      this.selectedCount = 0
      this.vigilanceAccuracy = 50
      this.mathAccuracy = 50
      this.shapeAccuracy = 50
      this.overallPerformance = 50
    },
    
    // 计算完成数据
    calculateCompletionData() {
      this.completionData = {
        accuracy: this.accuracy,
        duration: this.trainingTime,
        reactionTime: this.averageReactionTime,
        focusScore: this.focusLevel,
        tasksCompleted: Math.floor(this.trainingTime / 10),
        achievement: this.getAchievement()
      }
    },
    
    // 获取成就
    getAchievement() {
      if (this.accuracy >= 90 && this.focusLevel >= 4) {
        return {
          title: '专注大师',
          description: '达到了极高的专注水平！'
        }
      } else if (this.averageReactionTime <= 500) {
        return {
          title: '反应神速',
          description: '反应速度超越了大多数人！'
        }
      }
      return null
    },
    
    // 工具函数
    shuffleArray(array) {
      const newArray = [...array]
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
      }
      return newArray
    },
    
    // 格式化时间
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    // 关闭弹窗
    closeModal() {
      this.showCompletionModal = false
    },
    
    // 重新开始训练
    restartTraining() {
      this.closeModal()
      this.startTraining(this.selectedMode)
    },
    
    // 保存设置
    saveSettings() {
      localStorage.setItem('attentionSettings', JSON.stringify(this.settings))
    },
    
    // 加载设置
    loadSettings() {
      const saved = localStorage.getItem('attentionSettings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    },
    
    // 保存统计数据
    saveStatistics() {
      localStorage.setItem('attentionStats', JSON.stringify(this.statistics))
    },
    
    // 加载统计数据
    loadStatistics() {
      const saved = localStorage.getItem('attentionStats')
      if (saved) {
        this.statistics = { ...this.statistics, ...JSON.parse(saved) }
      }
    },
    
    // 抗干扰训练方法
    initializeInterferenceTraining() {
      this.generateInterferenceTask()
      this.startInterferenceTimer()
    },
    
    generateInterferenceTask() {
      // 生成目标和干扰项
      this.interferenceData.distractors = [
        { type: 'visual', content: '●', isTarget: false },
        { type: 'visual', content: '■', isTarget: true },
        { type: 'visual', content: '▲', isTarget: false },
        { type: 'auditory', content: '哔', isTarget: false }
      ]
      this.interferenceData.targetVisible = true
      this.interferenceData.interferenceLevel = Math.min(5, this.interferenceData.interferenceLevel + 0.1)
    },
    
    startInterferenceTimer() {
      this.interferenceTimer = setInterval(() => {
        this.generateInterferenceTask()
      }, 3000)
    },
    
    handleInterferenceResponse(item) {
      if (item.isTarget) {
        this.interferenceData.resistanceScore += 10
      } else {
        this.interferenceData.resistanceScore = Math.max(0, this.interferenceData.resistanceScore - 5)
      }
    },
    
    // 认知灵活性训练方法
    initializeFlexibilityTraining() {
      this.generateFlexibilityTask()
      this.startFlexibilityTimer()
    },
    
    generateFlexibilityTask() {
      const rules = ['color', 'shape']
      const newRule = rules[Math.floor(Math.random() * rules.length)]
      
      if (this.flexibilityData.currentRule !== newRule) {
        this.flexibilityData.ruleHistory.push(this.flexibilityData.currentRule)
        this.flexibilityData.currentRule = newRule
        this.flexibilityData.switchCost = Date.now()
      }
    },
    
    startFlexibilityTimer() {
      this.flexibilityTimer = setInterval(() => {
        this.generateFlexibilityTask()
      }, 5000)
    },
    
    handleFlexibilityResponse(stimulus) {
      const responseTime = Date.now() - this.flexibilityData.switchCost
      this.flexibilityData.adaptationTime = responseTime
      
      // 根据规则判断正确性
      let isCorrect = false
      if (this.flexibilityData.currentRule === 'color') {
        isCorrect = stimulus.color === '#ff0000' // 红色为目标
      } else {
        isCorrect = stimulus.shape === '●' // 圆形为目标
      }
      
      if (isCorrect) {
        this.accuracy = Math.min(100, this.accuracy + 2)
      } else {
        this.accuracy = Math.max(0, this.accuracy - 1)
      }
    },
    
    // 工作记忆训练方法
    initializeWorkingMemoryTraining() {
      this.generateMemorySequence()
      this.startMemoryTimer()
    },
    
    generateMemorySequence() {
      this.workingMemoryData.sequence = []
      for (let i = 0; i < this.workingMemoryData.memorySpan; i++) {
        const randomOption = this.memoryOptions[Math.floor(Math.random() * this.memoryOptions.length)]
        this.workingMemoryData.sequence.push(randomOption)
      }
      this.workingMemoryData.userSequence = []
      this.workingMemoryData.currentPosition = 0
    },
    
    startMemoryTimer() {
      this.memoryTimer = setInterval(() => {
        this.generateMemorySequence()
      }, 8000)
    },
    
    handleMemoryInput(option) {
      this.workingMemoryData.userSequence.push(option)
      
      if (this.workingMemoryData.userSequence.length === this.workingMemoryData.sequence.length) {
        this.checkMemorySequence()
      }
    },
    
    checkMemorySequence() {
      const isCorrect = JSON.stringify(this.workingMemoryData.userSequence) === 
                       JSON.stringify(this.workingMemoryData.sequence)
      
      if (isCorrect) {
        this.workingMemoryData.memorySpan = Math.min(8, this.workingMemoryData.memorySpan + 1)
        this.accuracy = Math.min(100, this.accuracy + 5)
      } else {
        this.workingMemoryData.memorySpan = Math.max(2, this.workingMemoryData.memorySpan - 1)
        this.accuracy = Math.max(0, this.accuracy - 3)
      }
      
      // 重新生成序列
      setTimeout(() => {
        this.generateMemorySequence()
      }, 1000)
    },
    
    // 元认知监控训练方法
    initializeMetacognitiveTraining() {
      this.generateMetacognitiveTask()
    },
    
    generateMetacognitiveTask() {
      // 生成需要预测表现的任务
      const task = {
        type: 'prediction',
        difficulty: Math.floor(Math.random() * 5) + 1,
        question: '请预测您在接下来的任务中的表现（1-5分）'
      }
      
      this.currentTask = task
    },
    
    handleConfidenceRating(rating) {
      this.metacognitiveData.confidenceRatings.push(rating)
    },
    
    handlePerformancePrediction(prediction) {
      this.metacognitiveData.performancePredictions.push(prediction)
    },
    
    updateMetacognitiveAccuracy(actualPerformance) {
      this.metacognitiveData.actualPerformance.push(actualPerformance)
      
      // 计算监控准确性
      if (this.metacognitiveData.performancePredictions.length > 0) {
        const predictions = this.metacognitiveData.performancePredictions
        const actual = this.metacognitiveData.actualPerformance
        
        let totalDifference = 0
        for (let i = 0; i < Math.min(predictions.length, actual.length); i++) {
          totalDifference += Math.abs(predictions[i] - actual[i])
        }
        
        this.metacognitiveData.monitoringAccuracy = 
          Math.max(0, 100 - (totalDifference / Math.min(predictions.length, actual.length)) * 20)
      }
    }
  },
  
  mounted() {
    this.loadSettings()
    this.loadStatistics()
  },
  
  beforeUnmount() {
    this.clearTimers()
  },
  
  watch: {
    settings: {
      handler() {
        this.saveSettings()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.attention-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 训练模式选择 */
.training-modes {
  margin-bottom: 40px;
}

.training-modes h3 {
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8rem;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.mode-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
}

.mode-card.active {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

.mode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.mode-icon {
  font-size: 2rem;
}

.mode-level {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
}

.mode-level.beginner {
  background: #4CAF50;
}

.mode-level.intermediate {
  background: #FF9800;
}

.mode-level.advanced {
  background: #F44336;
}

.mode-card h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.3rem;
}

.mode-description {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.mode-details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.detail-label {
  color: #666;
  font-weight: 500;
}

.detail-value {
  color: #333;
  font-weight: bold;
}

.mode-progress {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
}

.start-mode-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-mode-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* 训练界面 */
.training-interface {
  max-width: 1000px;
  margin: 0 auto;
}

.training-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.training-header h3 {
  color: #333;
  margin: 0;
  font-size: 1.8rem;
}

.training-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: #667eea;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: #5a6fd8;
  transform: scale(1.1);
}

/* 专注力测试 */
.focus-test {
  text-align: center;
}

.test-area {
  margin-bottom: 30px;
}

.focus-target {
  width: 200px;
  height: 200px;
  margin: 0 auto 30px;
  border: 3px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9f9f9;
}

.focus-target.active {
  border-color: #4CAF50;
  background: #e8f5e8;
  transform: scale(1.1);
}

.focus-target.correct {
  border-color: #4CAF50;
  background: #4CAF50;
  color: white;
}

.focus-target.wrong {
  border-color: #f44336;
  background: #f44336;
  color: white;
}

.target-content {
  font-size: 2rem;
}

.color-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-block;
}

.number-display,
.shape-display {
  font-size: 3rem;
  font-weight: bold;
}

.task-instruction {
  color: #333;
  font-size: 1.2rem;
}

.reaction-time {
  margin-top: 10px;
  color: #666;
  font-size: 1rem;
}

/* 选择性注意 */
.selective-attention {
  text-align: center;
}

.attention-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  max-width: 500px;
  margin: 0 auto 30px;
}

.attention-item {
  width: 80px;
  height: 80px;
  border: 2px solid #ddd;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9f9f9;
}

.attention-item.target {
  color: red;
}

.attention-item.distractor {
  color: blue;
}

.attention-item.selected {
  border-width: 3px;
  transform: scale(0.9);
}

.attention-item.correct {
  border-color: #4CAF50;
  background: #e8f5e8;
}

.attention-item.wrong {
  border-color: #f44336;
  background: #ffebee;
}

.item-content {
  font-size: 1.5rem;
  font-weight: bold;
}

.selection-instruction {
  color: #333;
  font-size: 1.2rem;
}

.selection-stats {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 20px;
  color: #666;
}

/* 持续注意 */
.sustained-attention {
  text-align: center;
}

.vigilance-test {
  max-width: 600px;
  margin: 0 auto;
}

.stimulus-area {
  margin-bottom: 30px;
}

.stimulus-display {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  border: 3px solid #ddd;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  transition: all 0.3s ease;
}

.stimulus-display.active {
  border-color: #2196F3;
  background: #e3f2fd;
  transform: scale(1.1);
}

.stimulus-display.critical {
  border-color: #f44336;
  background: #ffebee;
}

.stimulus-content {
  font-size: 3rem;
  font-weight: bold;
  color: #333;
}

.vigilance-controls {
  margin-bottom: 30px;
}

.response-btn {
  padding: 15px 30px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.response-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
}

.response-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.response-btn.active {
  background: #2196F3;
  transform: scale(0.95);
}

.vigilance-info {
  color: #333;
}

.vigilance-stats {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 30px;
  color: #666;
}

/* 分配注意 */
.divided-attention {
  text-align: center;
}

.dual-task {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.task-left,
.task-right {
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  background: #f9f9f9;
}

.task-left h4,
.task-right h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
}

.math-problem {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.math-options,
.shape-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.option-btn {
  padding: 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-btn:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.shape-sequence {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.shape-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1.5rem;
  background: #f9f9f9;
  transition: all 0.3s ease;
}

.shape-item.highlight {
  border-color: #4CAF50;
  background: #e8f5e8;
  transform: scale(1.2);
}

.shape-question {
  margin-top: 20px;
}

.dual-task-info {
  color: #333;
}

.dual-task-stats {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 20px;
  color: #666;
  flex-wrap: wrap;
}

/* 训练统计 */
.training-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 10px;
}

.stat-label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  color: #333;
  font-size: 1.5rem;
  font-weight: bold;
}

/* 训练设置 */
.training-settings {
  margin-bottom: 40px;
}

.training-settings h3 {
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.setting-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.setting-card h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
  text-align: center;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.number-input,
.select-input {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.number-input:focus,
.select-input:focus {
  outline: none;
  border-color: #667eea;
}

.range-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-input {
  flex: 1;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #667eea;
  border-radius: 50%;
  cursor: pointer;
}

.range-value {
  min-width: 60px;
  text-align: center;
  color: #333;
  font-weight: bold;
}

/* 训练统计页面 */
.training-statistics {
  margin-bottom: 40px;
}

.training-statistics h3 {
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.stats-card h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
  text-align: center;
}

.stats-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.stats-overview .stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 10px;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  flex: 1;
}

.stats-overview .stat-value {
  font-size: 1.3rem;
  color: #333;
  font-weight: bold;
  margin-bottom: 2px;
}

.stats-overview .stat-label {
  font-size: 0.9rem;
  color: #666;
}

/* 注意力分析 */
.attention-analysis {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.analysis-label {
  min-width: 80px;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.analysis-bar {
  flex: 1;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.analysis-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.analysis-value {
  min-width: 50px;
  text-align: right;
  color: #333;
  font-weight: bold;
  font-size: 0.9rem;
}

/* 进步趋势图 */
.progress-chart {
  height: 200px;
  display: flex;
  align-items: end;
  justify-content: center;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 100%;
}

.chart-bar {
  width: 30px;
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 4px 4px 0 0;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: end;
  justify-content: center;
  padding-bottom: 5px;
}

.chart-bar:hover {
  transform: scale(1.1);
}

.bar-label {
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

/* 能力雷达图 */
.ability-radar {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-chart {
  width: 200px;
  height: 200px;
  position: relative;
  border: 2px solid #ddd;
  border-radius: 50%;
}

.radar-grid {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.radar-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1px;
  height: 50%;
  background: #ddd;
  transform-origin: bottom;
}

.radar-line:nth-child(1) { transform: translate(-50%, -100%) rotate(0deg); }
.radar-line:nth-child(2) { transform: translate(-50%, -100%) rotate(72deg); }
.radar-line:nth-child(3) { transform: translate(-50%, -100%) rotate(144deg); }
.radar-line:nth-child(4) { transform: translate(-50%, -100%) rotate(216deg); }
.radar-line:nth-child(5) { transform: translate(-50%, -100%) rotate(288deg); }

.radar-labels {
  position: relative;
  width: 100%;
  height: 100%;
}

.radar-label {
  position: absolute;
  font-size: 0.8rem;
  color: #333;
  font-weight: 500;
  transform: translate(-50%, -50%);
}

/* 完成弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-modal {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #e0e0e0;
  color: #333;
}

.completion-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  align-items: center;
}

.stat-circle {
  flex-shrink: 0;
}

.circle-progress {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    #4CAF50 0deg,
    #4CAF50 calc(var(--progress) * 3.6deg),
    #e0e0e0 calc(var(--progress) * 3.6deg),
    #e0e0e0 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.circle-progress::before {
  content: '';
  width: 90px;
  height: 90px;
  background: white;
  border-radius: 50%;
  position: absolute;
}

.circle-text {
  position: relative;
  z-index: 1;
  text-align: center;
}

.circle-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.circle-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
}

.completion-details {
  flex: 1;
}

.completion-details .detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.completion-details .detail-label {
  color: #666;
  font-weight: 500;
}

.completion-details .detail-value {
  color: #333;
  font-weight: bold;
}

.achievement {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 15px;
  margin-bottom: 30px;
  color: white;
}

.achievement-icon {
  font-size: 2.5rem;
}

.achievement-text h4 {
  margin: 0 0 5px 0;
  font-size: 1.3rem;
}

.achievement-text p {
  margin: 0;
  opacity: 0.9;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.primary-btn,
.secondary-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.secondary-btn {
  background: #f5f5f5;
  color: #333;
}

.secondary-btn:hover {
  background: #e0e0e0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .attention-container {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .modes-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dual-task {
    grid-template-columns: 1fr;
  }
  
  .attention-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .completion-stats {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .dual-task-stats,
  .vigilance-stats,
  .selection-stats {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .training-card {
    padding: 20px;
  }
  
  .focus-target {
    width: 150px;
    height: 150px;
  }
  
  .attention-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}

/* 新训练模式样式 */
/* 抗干扰训练 */
.interference-training {
  text-align: center;
  padding: 20px;
}

.interference-area {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  max-width: 400px;
  margin: 0 auto 20px;
}

.interference-item {
  width: 80px;
  height: 80px;
  border: 2px solid #ddd;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9f9f9;
  font-size: 1.5rem;
  font-weight: bold;
}

.interference-item.target {
  border-color: #4CAF50;
  background: #e8f5e8;
}

.interference-item.distractor {
  border-color: #ff9800;
  background: #fff3e0;
}

.interference-item:hover {
  transform: scale(1.05);
}

.resistance-score {
  font-size: 1.2rem;
  color: #333;
  margin-top: 15px;
}

/* 认知灵活性训练 */
.flexibility-training {
  text-align: center;
  padding: 20px;
}

.flexibility-area {
  max-width: 500px;
  margin: 0 auto;
}

.rule-display {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: bold;
}

.stimuli-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stimulus-item {
  width: 100px;
  height: 100px;
  border: 2px solid #ddd;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 2rem;
  font-weight: bold;
}

.stimulus-item:hover {
  transform: scale(1.05);
  border-color: #667eea;
}

.adaptation-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
}

.adaptation-stat {
  text-align: center;
}

.adaptation-stat .stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.adaptation-stat .stat-label {
  font-size: 0.9rem;
  color: #666;
}

/* 工作记忆训练 */
.working-memory-training {
  text-align: center;
  padding: 20px;
}

.memory-sequence {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  min-height: 60px;
  align-items: center;
}

.memory-item {
  width: 50px;
  height: 50px;
  border: 2px solid #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  font-size: 1.2rem;
  font-weight: bold;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.memory-input {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  max-width: 300px;
  margin: 0 auto 20px;
}

.memory-option {
  width: 50px;
  height: 50px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.memory-option:hover {
  border-color: #667eea;
  background: #e3f2fd;
}

.memory-option.selected {
  border-color: #4CAF50;
  background: #e8f5e8;
}

.memory-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
}

.memory-stat {
  text-align: center;
}

.memory-stat .stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4CAF50;
}

.memory-stat .stat-label {
  font-size: 0.9rem;
  color: #666;
}

/* 元认知监控训练 */
.metacognitive-training {
  text-align: center;
  padding: 20px;
}

.prediction-area {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.prediction-question {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
}

.rating-scale {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.rating-button {
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 50%;
  background: #f9f9f9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.rating-button:hover {
  border-color: #667eea;
  background: #e3f2fd;
}

.rating-button.selected {
  border-color: #4CAF50;
  background: #4CAF50;
  color: white;
}

.monitoring-accuracy {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
}

.monitoring-accuracy .accuracy-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.monitoring-accuracy .accuracy-label {
  font-size: 1rem;
  opacity: 0.9;
  }
  
  .attention-item {
    width: 60px;
    height: 60px;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
</style>