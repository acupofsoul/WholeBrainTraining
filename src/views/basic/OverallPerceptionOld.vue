<template>
  <div class="overall-perception-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>整体感知训练</h1>
      <p class="page-description">
        整体感知训练是全脑开发的基础，通过训练大脑同时处理多个信息源的能力，
        提高信息整合和快速理解能力，为后续的高级训练打下坚实基础。
      </p>
    </div>

    <!-- 训练模式选择 -->
    <div class="training-modes">
      <h3>训练模式</h3>
      <div class="modes-grid">
        <div 
          v-for="mode in trainingModes" 
          :key="mode.id"
          class="mode-card"
          :class="{ active: selectedMode?.id === mode.id }"
          @click="selectMode(mode)"
        >
          <div class="mode-header">
            <div class="mode-icon">{{ mode.icon }}</div>
            <div class="mode-level" :class="mode.level">{{ mode.levelText }}</div>
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
              <span class="detail-label">完成次数:</span>
              <span class="detail-value">{{ mode.completedCount }}次</span>
            </div>
          </div>
          <div class="mode-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: mode.progress + '%' }"></div>
            </div>
            <div class="progress-text">掌握度: {{ mode.progress }}%</div>
          </div>
          <button class="start-mode-btn" @click.stop="startTraining(mode)">
            开始训练
          </button>
        </div>
      </div>
    </div>

    <!-- 训练界面 -->
    <div v-if="isTraining" class="training-interface">
      <div class="training-card">
        <div class="training-header">
          <h3>{{ selectedMode.name }}</h3>
          <div class="training-controls">
            <button class="control-btn" @click="pauseTraining">
              {{ isPaused ? '▶️' : '⏸️' }}
            </button>
            <button class="control-btn" @click="stopTraining">⏹️</button>
          </div>
        </div>

        <!-- 训练计时器 -->
        <div class="training-timer">
          <div class="timer-display">
            <div class="time-remaining">{{ formatTime(timeRemaining) }}</div>
            <div class="session-info">剩余时间</div>
          </div>
          <div class="timer-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: timerProgress + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 训练内容区域 -->
        <div class="training-content">
          <!-- 图形感知训练 -->
          <div v-if="selectedMode.id === 'shapes'" class="shapes-training">
            <div class="instruction">请观察下方图形，记住它们的位置和颜色</div>
            <div class="shapes-grid">
              <div 
                v-for="(shape, index) in currentShapes" 
                :key="index"
                class="shape-item"
                :class="shape.type"
                :style="{ 
                  backgroundColor: shape.color,
                  left: shape.x + '%',
                  top: shape.y + '%'
                }"
              ></div>
            </div>
            <div class="training-stats">
              <div class="stat-item">
                <span class="stat-label">当前关卡:</span>
                <span class="stat-value">{{ currentLevel }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">正确率:</span>
                <span class="stat-value">{{ accuracy }}%</span>
              </div>
            </div>
          </div>

          <!-- 数字感知训练 -->
          <div v-if="selectedMode.id === 'numbers'" class="numbers-training">
            <div class="instruction">快速观察数字序列，记住它们的顺序</div>
            <div class="numbers-display">
              <div 
                v-for="(number, index) in currentNumbers" 
                :key="index"
                class="number-item"
                :class="{ highlighted: highlightedIndex === index }"
              >
                {{ number }}
              </div>
            </div>
            <div class="input-area" v-if="showInput">
              <input 
                v-model="userInput" 
                @keyup.enter="checkAnswer"
                placeholder="请输入您记住的数字序列"
                class="answer-input"
              >
              <button @click="checkAnswer" class="submit-btn">提交</button>
            </div>
          </div>

          <!-- 颜色感知训练 -->
          <div v-if="selectedMode.id === 'colors'" class="colors-training">
            <div class="instruction">观察颜色变化，找出不同的颜色</div>
            <div class="colors-grid">
              <div 
                v-for="(color, index) in currentColors" 
                :key="index"
                class="color-item"
                :style="{ backgroundColor: color }"
                @click="selectColor(index)"
                :class="{ selected: selectedColorIndex === index }"
              ></div>
            </div>
            <div class="feedback" v-if="showFeedback">
              <div class="feedback-message" :class="feedbackType">
                {{ feedbackMessage }}
              </div>
            </div>
          </div>

          <!-- 文字感知训练 -->
          <div v-if="selectedMode.id === 'words'" class="words-training">
            <div class="instruction">快速识别文字内容，理解整体含义</div>
            <div class="words-display">
              <div class="text-content" :style="{ fontSize: textSize + 'px' }">
                {{ currentText }}
              </div>
            </div>
            <div class="comprehension-questions" v-if="showQuestions">
              <h4>理解测试</h4>
              <div 
                v-for="(question, index) in currentQuestions" 
                :key="index"
                class="question-item"
              >
                <p class="question-text">{{ question.text }}</p>
                <div class="options">
                  <button 
                    v-for="(option, optIndex) in question.options" 
                    :key="optIndex"
                    class="option-btn"
                    :class="{ selected: question.selected === optIndex }"
                    @click="selectOption(index, optIndex)"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
              <button @click="submitAnswers" class="submit-answers-btn">提交答案</button>
            </div>
          </div>

          <!-- 模式感知训练 -->
          <div v-if="selectedMode.id === 'patterns'" class="patterns-training">
            <div class="instruction">观察图案规律，找出下一个图案</div>
            <div class="patterns-display">
              <div class="pattern-sequence">
                <div 
                  v-for="(pattern, index) in currentPatterns" 
                  :key="index"
                  class="pattern-item"
                  :class="pattern.type"
                >
                  <div class="pattern-content" :style="{ backgroundColor: pattern.color, transform: `rotate(${pattern.rotation}deg)` }">
                    {{ pattern.symbol }}
                  </div>
                </div>
                <div class="pattern-question">
                  <span class="question-mark">?</span>
                </div>
              </div>
              <div class="pattern-options">
                <div 
                  v-for="(option, index) in patternOptions" 
                  :key="index"
                  class="pattern-option"
                  :class="{ selected: selectedPatternIndex === index }"
                  @click="selectPattern(index)"
                >
                  <div class="pattern-content" :style="{ backgroundColor: option.color, transform: `rotate(${option.rotation}deg)` }">
                    {{ option.symbol }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空间感知训练 -->
          <div v-if="selectedMode.id === 'spatial'" class="spatial-training">
            <div class="instruction">观察空间位置关系，记住物体的相对位置</div>
            <div class="spatial-display">
              <div class="spatial-grid">
                <div 
                  v-for="(item, index) in currentSpatialItems" 
                  :key="index"
                  class="spatial-item"
                  :style="{ 
                    left: item.x + '%', 
                    top: item.y + '%',
                    backgroundColor: item.color,
                    transform: `scale(${item.scale}) rotate(${item.rotation}deg)`
                  }"
                >
                  {{ item.shape }}
                </div>
              </div>
            </div>
            <div class="spatial-questions" v-if="showSpatialQuestions">
              <h4>空间关系测试</h4>
              <div class="spatial-question">
                <p>{{ currentSpatialQuestion.text }}</p>
                <div class="spatial-options">
                  <button 
                    v-for="(option, index) in currentSpatialQuestion.options" 
                    :key="index"
                    class="spatial-option-btn"
                    :class="{ selected: selectedSpatialOption === index }"
                    @click="selectSpatialOption(index)"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 记忆感知训练 -->
          <div v-if="selectedMode.id === 'memory'" class="memory-training">
            <div class="instruction">记住显示的内容，然后在隐藏后回答问题</div>
            <div class="memory-display">
              <div v-if="!memoryHidden" class="memory-content">
                <div class="memory-grid">
                  <div 
                    v-for="(item, index) in currentMemoryItems" 
                    :key="index"
                    class="memory-item"
                    :style="{ backgroundColor: item.color }"
                  >
                    <span class="memory-symbol">{{ item.symbol }}</span>
                    <span class="memory-number">{{ item.number }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="memory-hidden">
                <div class="hidden-message">内容已隐藏，请回答问题</div>
              </div>
            </div>
            <div class="memory-questions" v-if="showMemoryQuestions">
              <h4>记忆测试</h4>
              <div 
                v-for="(question, index) in currentMemoryQuestions" 
                :key="index"
                class="memory-question"
              >
                <p class="question-text">{{ question.text }}</p>
                <div class="memory-answer-input">
                  <input 
                    v-model="question.userAnswer" 
                    :placeholder="question.placeholder"
                    class="memory-input"
                  >
                </div>
              </div>
              <button @click="submitMemoryAnswers" class="submit-memory-btn">提交答案</button>
            </div>
          </div>

          <!-- 注意感知训练 -->
          <div v-if="selectedMode.id === 'attention'" class="attention-training">
            <div class="instruction">保持专注，快速识别目标元素</div>
            <div class="attention-display">
              <div class="attention-grid">
                <div 
                  v-for="(item, index) in currentAttentionItems" 
                  :key="index"
                  class="attention-item"
                  :class="{ 
                    target: item.isTarget, 
                    distractor: !item.isTarget,
                    highlighted: item.highlighted
                  }"
                  @click="selectAttentionItem(index)"
                >
                  <div class="attention-content" :style="{ 
                    color: item.color, 
                    fontSize: item.size + 'px',
                    opacity: item.opacity
                  }">
                    {{ item.content }}
                  </div>
                </div>
              </div>
            </div>
            <div class="attention-stats">
              <div class="stat-item">
                <span class="stat-label">目标找到:</span>
                <span class="stat-value">{{ attentionStats.targetsFound }}/{{ attentionStats.totalTargets }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">错误点击:</span>
                <span class="stat-value">{{ attentionStats.errors }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均反应:</span>
                <span class="stat-value">{{ attentionStats.averageReaction }}ms</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 训练进度 -->
        <div class="training-progress">
          <div class="progress-info">
            <span>进度: {{ currentStep }}/{{ totalSteps }}</span>
            <span>得分: {{ currentScore }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (currentStep / totalSteps) * 100 + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练设置 -->
    <div class="training-settings">
      <h3>训练设置</h3>
      <div class="settings-grid">
        <div class="setting-card">
          <h4>基础设置</h4>
          <div class="setting-item">
            <label>整体难度:</label>
            <select v-model="settings.difficulty" class="select-input">
              <option value="1">简单</option>
              <option value="2">普通</option>
              <option value="3">困难</option>
              <option value="4">专家</option>
              <option value="5">大师</option>
            </select>
          </div>
          <div class="setting-item">
            <label>显示时间(秒):</label>
            <input v-model.number="settings.displayTime" type="range" min="0.5" max="10" step="0.5" class="range-input">
            <span class="range-value">{{ settings.displayTime }}秒</span>
          </div>
          <div class="setting-item">
            <label>元素数量:</label>
            <input v-model.number="settings.elementCount" type="range" min="3" max="20" step="1" class="range-input">
            <span class="range-value">{{ settings.elementCount }}个</span>
          </div>
        </div>

        <div class="setting-card">
          <h4>反馈设置</h4>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.soundEnabled">
              启用音效反馈
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.vibrationEnabled">
              启用震动反馈
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.visualFeedback">
              启用视觉反馈
            </label>
          </div>
        </div>

        <div class="setting-card">
          <h4>训练流程</h4>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.autoNext">
              自动进入下一关
            </label>
          </div>
          <div class="setting-item">
            <label>关卡间隔(秒):</label>
            <input v-model.number="settings.pauseBetweenRounds" type="range" min="0" max="10" step="1" class="range-input">
            <span class="range-value">{{ settings.pauseBetweenRounds }}秒</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.showHints">
              显示提示
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.adaptiveDifficulty">
              自适应难度
            </label>
          </div>
        </div>

        <div class="setting-card">
          <h4>视觉设置</h4>
          <div class="setting-item">
            <label>背景颜色:</label>
            <select v-model="settings.backgroundColor" class="select-input">
              <option value="white">白色</option>
              <option value="black">黑色</option>
              <option value="gray">灰色</option>
              <option value="blue">蓝色</option>
            </select>
          </div>
          <div class="setting-item">
            <label>字体大小:</label>
            <input v-model.number="settings.fontSize" type="range" min="10" max="28" step="1" class="range-input">
            <span class="range-value">{{ settings.fontSize }}px</span>
          </div>
          <div class="setting-item">
            <label>对比度:</label>
            <select v-model="settings.contrast" class="select-input">
              <option value="low">低</option>
              <option value="normal">正常</option>
              <option value="high">高</option>
            </select>
          </div>
          <div class="setting-item">
            <label>配色方案:</label>
            <select v-model="settings.colorScheme" class="select-input">
              <option value="default">默认</option>
              <option value="warm">暖色调</option>
              <option value="cool">冷色调</option>
              <option value="monochrome">单色</option>
            </select>
          </div>
        </div>

        <div class="setting-card">
          <h4>高级设置</h4>
          <div class="setting-item">
            <label>训练模式:</label>
            <select v-model="settings.trainingMode" class="select-input">
              <option value="standard">标准模式</option>
              <option value="intensive">强化模式</option>
              <option value="relaxed">放松模式</option>
            </select>
          </div>
          <div class="setting-item">
            <label>会话长度:</label>
            <select v-model="settings.sessionLength" class="select-input">
              <option value="short">短 (5-10分钟)</option>
              <option value="medium">中 (10-20分钟)</option>
              <option value="long">长 (20-30分钟)</option>
            </select>
          </div>
          <div class="setting-item">
            <label>休息间隔(分钟):</label>
            <input v-model.number="settings.breakInterval" type="range" min="1" max="15" step="1" class="range-input">
            <span class="range-value">{{ settings.breakInterval }}分钟</span>
          </div>
          <div class="setting-item">
            <label>目标准确率(%):</label>
            <input v-model.number="settings.targetAccuracy" type="range" min="60" max="100" step="5" class="range-input">
            <span class="range-value">{{ settings.targetAccuracy }}%</span>
          </div>
        </div>

        <div class="setting-card">
          <h4>个性化设置</h4>
          <div class="setting-item">
            <label>每日目标(分钟):</label>
            <input v-model.number="settings.dailyGoal" type="range" min="10" max="120" step="5" class="range-input">
            <span class="range-value">{{ settings.dailyGoal }}分钟</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.reminderEnabled">
              启用训练提醒
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.progressSharing">
              允许进度分享
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练统计 -->
    <div class="training-statistics">
      <h3>训练统计</h3>
      <div class="stats-grid">
        <div class="stats-card">
          <h4>今日训练</h4>
          <div class="stats-overview">
            <div class="stat-item">
              <div class="stat-icon">⏱️</div>
              <div class="stat-info">
                <span class="stat-value">{{ todayStats.totalTime }}</span>
                <span class="stat-label">训练时长</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🎯</div>
              <div class="stat-info">
                <span class="stat-value">{{ todayStats.accuracy }}%</span>
                <span class="stat-label">平均准确率</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">📈</div>
              <div class="stat-info">
                <span class="stat-value">{{ todayStats.improvement }}%</span>
                <span class="stat-label">提升幅度</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🏃</div>
              <div class="stat-info">
                <span class="stat-value">{{ todayStats.sessionsCompleted }}</span>
                <span class="stat-label">完成会话</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⚡</div>
              <div class="stat-info">
                <span class="stat-value">{{ todayStats.averageReactionTime }}ms</span>
                <span class="stat-label">平均反应时间</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🔥</div>
              <div class="stat-info">
                <span class="stat-value">{{ todayStats.bestStreak }}</span>
                <span class="stat-label">最佳连击</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>历史表现</h4>
          <div class="performance-chart">
            <div class="chart-bars">
              <div 
                v-for="(data, index) in performanceData" 
                :key="index"
                class="chart-bar"
                :style="{ height: data.accuracy + '%' }"
                :title="`${data.date}: 准确率${data.accuracy}%, 训练时间${data.time}分钟, 会话${data.sessions}次`"
              >
                <div class="bar-fill" :style="{ height: data.accuracy + '%' }"></div>
                <div class="bar-label">{{ data.date }}</div>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color accuracy"></span>
                <span class="legend-text">准确率</span>
              </div>
              <div class="legend-item">
                <span class="legend-color time"></span>
                <span class="legend-text">训练时间</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h4>能力评估</h4>
          <div class="ability-ratings">
            <div class="rating-item">
              <span class="rating-label">图形识别</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= abilityRatings.shapes }">⭐</span>
              </div>
              <div class="rating-score">{{ abilityRatings.shapes }}/5</div>
            </div>
            <div class="rating-item">
              <span class="rating-label">数字记忆</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= abilityRatings.numbers }">⭐</span>
              </div>
              <div class="rating-score">{{ abilityRatings.numbers }}/5</div>
            </div>
            <div class="rating-item">
              <span class="rating-label">颜色感知</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= abilityRatings.colors }">⭐</span>
              </div>
              <div class="rating-score">{{ abilityRatings.colors }}/5</div>
            </div>
            <div class="rating-item">
              <span class="rating-label">文字理解</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= abilityRatings.words }">⭐</span>
              </div>
              <div class="rating-score">{{ abilityRatings.words }}/5</div>
            </div>
            <div class="rating-item">
              <span class="rating-label">模式感知</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= abilityRatings.patterns }">⭐</span>
              </div>
              <div class="rating-score">{{ abilityRatings.patterns }}/5</div>
            </div>
            <div class="rating-item">
              <span class="rating-label">空间感知</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= abilityRatings.spatial }">⭐</span>
              </div>
              <div class="rating-score">{{ abilityRatings.spatial }}/5</div>
            </div>
            <div class="rating-item">
              <span class="rating-label">记忆感知</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= abilityRatings.memory }">⭐</span>
              </div>
              <div class="rating-score">{{ abilityRatings.memory }}/5</div>
            </div>
            <div class="rating-item">
              <span class="rating-label">注意感知</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= abilityRatings.attention }">⭐</span>
              </div>
              <div class="rating-score">{{ abilityRatings.attention }}/5</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练完成弹窗 -->
    <div v-if="showCompletionModal" class="modal-overlay" @click="closeCompletionModal">
      <div class="completion-modal" @click.stop>
        <div class="modal-header">
          <h3>训练完成！</h3>
          <button @click="closeCompletionModal" class="close-btn">×</button>
        </div>
        <div class="modal-content">
          <div class="completion-stats">
            <div class="stat-circle">
              <div class="circle-progress" :style="{ '--progress': completionStats.accuracy }"></div>
              <div class="circle-text">
                <span class="circle-value">{{ completionStats.accuracy }}%</span>
                <span class="circle-label">准确率</span>
              </div>
            </div>
            <div class="completion-details">
              <div class="detail-item">
                <span class="detail-label">训练时长:</span>
                <span class="detail-value">{{ completionStats.duration }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">完成题目:</span>
                <span class="detail-value">{{ completionStats.completed }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">获得积分:</span>
                <span class="detail-value">{{ completionStats.points }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">反应时间:</span>
                <span class="detail-value">{{ completionStats.reactionTime }}ms</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">提升幅度:</span>
                <span class="detail-value">{{ completionStats.improvement }}%</span>
              </div>
              <div class="detail-item" v-if="completionStats.newRecord">
                <span class="detail-label">🎉 新纪录!</span>
                <span class="detail-value">{{ completionStats.newRecord }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">完美轮次:</span>
                <span class="detail-value">{{ completionStats.perfectRounds }}</span>
              </div>
            </div>
          </div>
          
          <!-- 成就展示 -->
          <div class="achievements-section" v-if="completionStats.achievement || achievements.filter(a => a.unlocked && a.isNew).length > 0">
            <h4>🏆 获得成就</h4>
            <div class="achievements-grid">
              <div v-if="completionStats.achievement" class="achievement-item new">
                <div class="achievement-icon">{{ completionStats.achievement.icon }}</div>
                <div class="achievement-text">
                  <h5>{{ completionStats.achievement.title }}</h5>
                  <p>{{ completionStats.achievement.description }}</p>
                </div>
              </div>
              <div v-for="achievement in achievements.filter(a => a.unlocked && a.isNew)" :key="achievement.id" class="achievement-item new">
                <div class="achievement-icon">{{ achievement.icon }}</div>
                <div class="achievement-text">
                  <h5>{{ achievement.title }}</h5>
                  <p>{{ achievement.description }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 下一个目标 -->
          <div class="next-goal" v-if="completionStats.nextGoal">
            <h4>🎯 下一个目标</h4>
            <div class="goal-item">
              <div class="goal-text">{{ completionStats.nextGoal.description }}</div>
              <div class="goal-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: completionStats.nextGoal.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ completionStats.nextGoal.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="restartTraining" class="primary-btn">再次训练</button>
          <button @click="closeCompletionModal" class="secondary-btn">返回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'OverallPerception',
  setup() {
    // 响应式数据
    const selectedMode = ref(null)
    const isTraining = ref(false)
    const isPaused = ref(false)
    const showCompletionModal = ref(false)
    const timeRemaining = ref(0)
    const currentStep = ref(1)
    const totalSteps = ref(10)
    const currentScore = ref(0)
    const currentLevel = ref(1)
    const accuracy = ref(0)
    const highlightedIndex = ref(-1)
    const showInput = ref(false)
    const userInput = ref('')
    const selectedColorIndex = ref(-1)
    const showFeedback = ref(false)
    const feedbackType = ref('')
    const feedbackMessage = ref('')
    const showQuestions = ref(false)
    const textSize = ref(16)
    
    // 训练模式数据
    const trainingModes = ref([
      {
        id: 'shapes',
        name: '图形感知训练',
        icon: '🔷',
        level: 'beginner',
        levelText: '初级',
        description: '通过观察和记忆各种图形的位置、颜色和形状，提升视觉整体感知能力',
        duration: 10,
        difficulty: 2,
        completedCount: 15,
        progress: 75,
        features: ['多种几何图形', '颜色识别', '位置记忆', '形状匹配'],
        benefits: ['提升视觉注意力', '增强空间感知', '改善图形识别能力']
      },
      {
        id: 'numbers',
        name: '数字感知训练',
        icon: '🔢',
        level: 'intermediate',
        levelText: '中级',
        description: '快速识别和记忆数字序列，训练数字信息的整体处理能力',
        duration: 15,
        difficulty: 3,
        completedCount: 8,
        progress: 60,
        features: ['数字序列记忆', '快速识别', '顺序重现', '数字运算'],
        benefits: ['提升数字敏感度', '增强短期记忆', '改善逻辑思维']
      },
      {
        id: 'colors',
        name: '颜色感知训练',
        icon: '🎨',
        level: 'beginner',
        levelText: '初级',
        description: '识别颜色差异和变化，提升色彩感知的敏锐度和整体观察力',
        duration: 8,
        difficulty: 1,
        completedCount: 22,
        progress: 85,
        features: ['色彩辨识', '细微差别', '颜色搭配', '色调变化'],
        benefits: ['提升色彩敏感度', '增强视觉辨别力', '改善美感认知']
      },
      {
        id: 'words',
        name: '文字感知训练',
        icon: '📝',
        level: 'advanced',
        levelText: '高级',
        description: '快速阅读和理解文字内容，培养文字信息的整体把握能力',
        duration: 20,
        difficulty: 4,
        completedCount: 5,
        progress: 40,
        features: ['快速阅读', '理解测试', '关键词提取', '语义分析'],
        benefits: ['提升阅读速度', '增强理解能力', '改善信息处理']
      },
      {
        id: 'patterns',
        name: '模式感知训练',
        icon: '🔄',
        level: 'intermediate',
        levelText: '中级',
        description: '识别和记忆复杂模式，训练大脑的模式识别和预测能力',
        duration: 12,
        difficulty: 3,
        completedCount: 3,
        progress: 25,
        features: ['规律识别', '模式预测', '序列完成', '变化感知'],
        benefits: ['提升逻辑推理', '增强模式识别', '改善预测能力']
      },
      {
        id: 'spatial',
        name: '空间感知训练',
        icon: '🧊',
        level: 'advanced',
        levelText: '高级',
        description: '训练三维空间想象和空间关系理解，提升空间智能',
        duration: 18,
        difficulty: 4,
        completedCount: 2,
        progress: 15,
        features: ['3D旋转', '空间定位', '立体构建', '视角转换'],
        benefits: ['提升空间想象', '增强立体思维', '改善几何理解']
      },
      {
        id: 'memory',
        name: '记忆感知训练',
        icon: '🧠',
        level: 'intermediate',
        levelText: '中级',
        description: '综合训练视觉记忆、听觉记忆和触觉记忆的整体感知能力',
        duration: 14,
        difficulty: 3,
        completedCount: 6,
        progress: 45,
        features: ['多感官记忆', '记忆宫殿', '联想记忆', '记忆测试'],
        benefits: ['提升记忆容量', '增强记忆持久性', '改善记忆策略']
      },
      {
        id: 'attention',
        name: '注意感知训练',
        icon: '👁️',
        level: 'beginner',
        levelText: '初级',
        description: '训练选择性注意和分散注意，提升注意力的灵活性和持续性',
        duration: 10,
        difficulty: 2,
        completedCount: 12,
        progress: 70,
        features: ['选择性注意', '分散注意', '注意转移', '持续专注'],
        benefits: ['提升专注力', '增强注意控制', '改善多任务处理']
      }
    ])

    // 训练设置
    const settings = reactive({
      // 基础设置
      difficulty: 2,
      displayTime: 3,
      elementCount: 8,
      
      // 反馈设置
      soundEnabled: true,
      vibrationEnabled: false,
      visualFeedback: true,
      
      // 训练流程设置
      autoNext: true,
      pauseBetweenRounds: 2,
      showHints: true,
      adaptiveDifficulty: false,
      
      // 视觉设置
      backgroundColor: 'white',
      fontSize: 16,
      contrast: 'normal',
      colorScheme: 'default',
      
      // 高级设置
      trainingMode: 'standard', // standard, intensive, relaxed
      sessionLength: 'medium', // short, medium, long
      breakInterval: 5, // 分钟
      targetAccuracy: 80, // 百分比
      
      // 个性化设置
      preferredModes: ['shapes', 'colors'],
      dailyGoal: 30, // 分钟
      reminderEnabled: true,
      progressSharing: false
    })

    // 训练数据
    const currentShapes = ref([])
    const currentNumbers = ref([])
    const currentColors = ref([])
    const currentText = ref('')
    const currentQuestions = ref([])

    // 统计数据
    const todayStats = reactive({
      totalTime: '45分钟',
      accuracy: 78,
      improvement: 12,
      sessionsCompleted: 6,
      averageReactionTime: 1.2,
      bestStreak: 15,
      pointsEarned: 340,
      achievementsUnlocked: 2
    })

    const performanceData = ref([
      { date: '周一', value: 65, accuracy: 65, time: 25, sessions: 3 },
      { date: '周二', value: 72, accuracy: 72, time: 30, sessions: 4 },
      { date: '周三', value: 68, accuracy: 68, time: 20, sessions: 2 },
      { date: '周四', value: 75, accuracy: 75, time: 35, sessions: 5 },
      { date: '周五', value: 82, accuracy: 82, time: 40, sessions: 6 },
      { date: '周六', value: 78, accuracy: 78, time: 28, sessions: 4 },
      { date: '周日', value: 85, accuracy: 85, time: 45, sessions: 6 }
    ])

    const abilityRatings = reactive({
      shapes: 4,
      numbers: 3,
      colors: 5,
      words: 2,
      patterns: 3,
      spatial: 2,
      memory: 4,
      attention: 4
    })

    // 详细训练数据
    const trainingHistory = ref([
      {
        date: '2024-01-15',
        mode: 'shapes',
        duration: 600, // 秒
        accuracy: 85,
        score: 120,
        level: 3,
        mistakes: 2
      },
      {
        date: '2024-01-15',
        mode: 'colors',
        duration: 480,
        accuracy: 92,
        score: 150,
        level: 2,
        mistakes: 1
      },
      {
        date: '2024-01-14',
        mode: 'numbers',
        duration: 720,
        accuracy: 78,
        score: 95,
        level: 4,
        mistakes: 4
      }
    ])

    // 成就系统
    const achievements = ref([
      {
        id: 'first_session',
        title: '初次尝试',
        description: '完成第一次整体感知训练',
        icon: '🎯',
        unlocked: true,
        unlockedDate: '2024-01-10'
      },
      {
        id: 'accuracy_master',
        title: '精准大师',
        description: '单次训练准确率达到95%以上',
        icon: '🎯',
        unlocked: true,
        unlockedDate: '2024-01-12'
      },
      {
        id: 'speed_demon',
        title: '速度恶魔',
        description: '平均反应时间低于1秒',
        icon: '⚡',
        unlocked: false,
        progress: 75
      },
      {
        id: 'consistency_king',
        title: '坚持之王',
        description: '连续7天完成训练',
        icon: '👑',
        unlocked: false,
        progress: 85
      },
      {
        id: 'multi_master',
        title: '全能大师',
        description: '在所有训练模式中都达到4星评级',
        icon: '🌟',
        unlocked: false,
        progress: 50
      }
    ])

    const completionStats = reactive({
      accuracy: 85,
      duration: '12分钟',
      completed: 15,
      points: 120,
      reactionTime: 1.3,
      improvement: '+5%',
      newRecord: false,
      perfectRounds: 3,
      achievement: {
        title: '感知大师',
        description: '连续完成10次训练，准确率超过80%'
      },
      nextGoal: {
        title: '下一个目标',
        description: '达到90%准确率',
        progress: 85
      }
    })

    // 训练计划和建议
    const trainingPlan = reactive({
      currentWeek: 3,
      totalWeeks: 12,
      weeklyGoal: {
        sessions: 20,
        completed: 15,
        accuracy: 85,
        current: 82
      },
      recommendations: [
        {
          type: 'focus',
          title: '专注提升',
          description: '建议增加注意力训练时间',
          priority: 'high'
        },
        {
          type: 'difficulty',
          title: '难度调整',
          description: '可以尝试提高训练难度',
          priority: 'medium'
        },
        {
          type: 'variety',
          title: '多样化训练',
          description: '尝试新的训练模式',
          priority: 'low'
        }
      ]
    })

    // 计算属性
    const timerProgress = computed(() => {
      if (!selectedMode.value) return 0
      const totalTime = selectedMode.value.duration * 60
      return ((totalTime - timeRemaining.value) / totalTime) * 100
    })

    // 训练定时器
    let trainingTimer = null

    // 方法
    const selectMode = (mode) => {
      selectedMode.value = mode
    }

    const startTraining = (mode) => {
      selectedMode.value = mode
      isTraining.value = true
      isPaused.value = false
      timeRemaining.value = mode.duration * 60
      currentStep.value = 1
      currentScore.value = 0
      
      // 初始化训练内容
      initializeTrainingContent(mode)
      
      // 开始计时器
      startTimer()
    }

    const pauseTraining = () => {
      isPaused.value = !isPaused.value
      if (isPaused.value) {
        clearInterval(trainingTimer)
      } else {
        startTimer()
      }
    }

    const stopTraining = () => {
      isTraining.value = false
      isPaused.value = false
      clearInterval(trainingTimer)
      showCompletionModal.value = true
    }

    const startTimer = () => {
      trainingTimer = setInterval(() => {
        if (timeRemaining.value > 0) {
          timeRemaining.value--
        } else {
          stopTraining()
        }
      }, 1000)
    }

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const initializeTrainingContent = (mode) => {
      switch (mode.id) {
        case 'shapes':
          generateShapes()
          break
        case 'numbers':
          generateNumbers()
          break
        case 'colors':
          generateColors()
          break
        case 'words':
          generateText()
          break
      }
    }

    const generateShapes = () => {
      const shapes = []
      const types = ['circle', 'square', 'triangle']
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
      
      for (let i = 0; i < settings.elementCount; i++) {
        shapes.push({
          type: types[Math.floor(Math.random() * types.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          x: Math.random() * 80,
          y: Math.random() * 80
        })
      }
      currentShapes.value = shapes
    }

    const generateNumbers = () => {
      const numbers = []
      for (let i = 0; i < settings.elementCount; i++) {
        numbers.push(Math.floor(Math.random() * 100))
      }
      currentNumbers.value = numbers
      
      // 显示数字序列
      showNumberSequence()
    }

    const showNumberSequence = () => {
      let index = 0
      const interval = setInterval(() => {
        highlightedIndex.value = index
        index++
        if (index >= currentNumbers.value.length) {
          clearInterval(interval)
          highlightedIndex.value = -1
          showInput.value = true
        }
      }, 1000)
    }

    const generateColors = () => {
      const baseColor = '#4ecdc4'
      const colors = [baseColor]
      
      // 生成相似颜色
      for (let i = 1; i < settings.elementCount; i++) {
        colors.push(baseColor)
      }
      
      // 随机选择一个位置放置不同颜色
      const differentIndex = Math.floor(Math.random() * colors.length)
      colors[differentIndex] = '#ff6b6b'
      
      currentColors.value = colors
    }

    const generateText = () => {
      const textsByDifficulty = {
        1: [
          '春天来了，万物复苏。',
          '今天天气很好。',
          '我喜欢读书。',
          '运动有益健康。'
        ],
        2: [
          '春天来了，万物复苏，大地一片生机勃勃的景象。',
          '科技的发展改变了我们的生活方式。',
          '阅读是获取知识的重要途径。',
          '健康的生活方式包括合理饮食和适量运动。'
        ],
        3: [
          '春天来了，万物复苏，大地一片生机勃勃的景象，花儿绽放，鸟儿歌唱。',
          '科技的发展改变了我们的生活方式，让世界变得更加便利和高效。',
          '阅读是获取知识的重要途径，也是提升思维能力的有效方法。',
          '健康的生活方式包括合理饮食、适量运动和充足睡眠，这些都是保持身心健康的关键。'
        ],
        4: [
          '在这个信息爆炸的时代，我们需要培养批判性思维，学会从海量信息中筛选出有价值的内容，并能够独立思考和判断。',
          '人工智能技术的快速发展正在深刻改变着各行各业，从医疗诊断到自动驾驶，从金融分析到教育教学，AI的应用越来越广泛。',
          '可持续发展已成为全球共识，我们需要在经济发展与环境保护之间找到平衡点，为子孙后代留下一个美好的地球家园。'
        ],
        5: [
          '量子计算作为下一代计算技术的代表，其基于量子力学原理的并行计算能力，有望在密码学、药物发现、金融建模等领域带来革命性突破，但同时也面临着量子退相干、错误率控制等技术挑战。',
          '神经科学研究表明，大脑的可塑性远超我们的想象，通过有针对性的训练和刺激，我们可以改善认知功能、增强记忆能力，甚至在一定程度上逆转某些神经退行性疾病的影响。'
        ]
      }
      
      const texts = textsByDifficulty[settings.difficulty] || textsByDifficulty[2]
      currentText.value = texts[Math.floor(Math.random() * texts.length)]
      
      // 根据文本长度调整显示时间
      const displayDuration = Math.max(settings.displayTime, currentText.value.length * 0.1)
      
      // 延迟显示问题
      setTimeout(() => {
        generateQuestions()
        showQuestions.value = true
      }, displayDuration * 1000)
    }

    const generateQuestions = () => {
      const questionTemplates = {
        main_idea: {
          text: '文章的主要内容是什么？',
          type: 'multiple_choice'
        },
        detail: {
          text: '文章中提到了哪些具体细节？',
          type: 'multiple_choice'
        },
        inference: {
          text: '从文章可以推断出什么？',
          type: 'multiple_choice'
        },
        keyword: {
          text: '文章的关键词是什么？',
          type: 'text_input'
        }
      }
      
      // 根据当前文本生成相应问题
      const questions = []
      
      if (currentText.value.includes('春天')) {
        questions.push({
          text: '文章描述的是什么季节？',
          options: ['春天', '夏天', '秋天', '冬天'],
          correct: 0,
          selected: null
        })
      } else if (currentText.value.includes('科技')) {
        questions.push({
          text: '文章主要讨论的是什么主题？',
          options: ['科技发展', '环境保护', '教育改革', '健康生活'],
          correct: 0,
          selected: null
        })
      } else if (currentText.value.includes('阅读')) {
        questions.push({
          text: '阅读的作用是什么？',
          options: ['娱乐消遣', '获取知识', '打发时间', '社交需要'],
          correct: 1,
          selected: null
        })
      } else {
        questions.push({
          text: '文章的主要观点是什么？',
          options: ['选项A', '选项B', '选项C', '选项D'],
          correct: 0,
          selected: null
        })
      }
      
      // 添加理解深度问题
      if (settings.difficulty >= 3) {
        questions.push({
          text: '你认为作者想要表达的深层含义是什么？',
          options: ['表面含义', '深层思考', '情感表达', '价值观念'],
          correct: 1,
          selected: null
        })
      }
      
      currentQuestions.value = questions
    }

    const checkAnswer = () => {
      const correctAnswer = currentNumbers.value.join('')
      if (userInput.value === correctAnswer) {
        currentScore.value += 10
        accuracy.value = Math.round((currentScore.value / (currentStep.value * 10)) * 100)
      }
      
      nextStep()
    }

    const selectColor = (index) => {
      selectedColorIndex.value = index
      
      // 检查答案
      const isCorrect = currentColors.value[index] === '#ff6b6b'
      if (isCorrect) {
        feedbackType.value = 'success'
        feedbackMessage.value = '正确！'
        currentScore.value += 10
      } else {
        feedbackType.value = 'error'
        feedbackMessage.value = '错误，请再试一次'
      }
      
      showFeedback.value = true
      
      setTimeout(() => {
        showFeedback.value = false
        if (isCorrect) {
          nextStep()
        }
      }, 1500)
    }

    const selectOption = (questionIndex, optionIndex) => {
      currentQuestions.value[questionIndex].selected = optionIndex
    }

    const submitAnswers = () => {
      let correctCount = 0
      currentQuestions.value.forEach(question => {
        if (question.selected === question.correct) {
          correctCount++
        }
      })
      
      currentScore.value += correctCount * 10
      accuracy.value = Math.round((currentScore.value / (currentStep.value * 10)) * 100)
      
      nextStep()
    }

    const nextStep = () => {
      currentStep.value++
      userInput.value = ''
      showInput.value = false
      selectedColorIndex.value = -1
      showQuestions.value = false
      
      if (currentStep.value <= totalSteps.value) {
        initializeTrainingContent(selectedMode.value)
      } else {
        stopTraining()
      }
    }

    const closeCompletionModal = () => {
      showCompletionModal.value = false
    }

    const restartTraining = () => {
      showCompletionModal.value = false
      startTraining(selectedMode.value)
    }

    const completeTraining = () => {
      isTraining.value = false
      showCompletionModal.value = true
      
      // 计算最终统计
      const accuracy = Math.round((currentScore.value / (totalSteps.value * 10)) * 100)
      const duration = timeRemaining.value
      const score = currentScore.value + (accuracy >= 90 ? 50 : accuracy >= 80 ? 30 : 10)
      
      completionStats.accuracy = accuracy
      completionStats.duration = formatTime(duration)
      completionStats.completed = totalSteps.value
      completionStats.points = score
      completionStats.reactionTime = duration / totalSteps.value
      completionStats.improvement = Math.random() > 0.5 ? `+${Math.floor(Math.random() * 10 + 1)}%` : `+${Math.floor(Math.random() * 5 + 1)}%`
      completionStats.newRecord = accuracy > (todayStats.accuracy || 0)
      completionStats.perfectRounds = Math.floor(currentScore.value / 10 * 0.8)
      
      // 更新训练统计
      const currentMode = trainingModes.value.find(m => m.id === selectedMode.value.id)
      if (currentMode) {
        updateTrainingStats(currentMode, accuracy, duration, score)
      }
      
      // 重置训练状态
      currentScore.value = 0
      currentStep.value = 0
    }

    // 生命周期
    onMounted(async () => {
      // 加载训练数据
      await loadTrainingData()
      
      // 获取个性化建议
      trainingPlan.recommendations = getPersonalizedRecommendations()
    })

    onUnmounted(() => {
      if (trainingTimer) {
        clearInterval(trainingTimer)
      }
      // 保存当前数据
      saveTrainingData()
    })

    const loadTrainingData = async () => {
      try {
        // 从本地存储加载数据
        const savedData = localStorage.getItem('overallPerceptionData')
        if (savedData) {
          const data = JSON.parse(savedData)
          Object.assign(todayStats, data.todayStats || {})
          Object.assign(abilityRatings, data.abilityRatings || {})
          Object.assign(settings, data.settings || {})
          
          if (data.trainingHistory) {
            trainingHistory.value = data.trainingHistory
          }
          if (data.achievements) {
            achievements.value = data.achievements
          }
          if (data.trainingPlan) {
            Object.assign(trainingPlan, data.trainingPlan)
          }
          
          // 更新训练模式的完成次数和进度
          if (data.modeProgress) {
            trainingModes.value.forEach(mode => {
              const savedMode = data.modeProgress[mode.id]
              if (savedMode) {
                mode.completedCount = savedMode.completedCount || 0
                mode.progress = savedMode.progress || 0
              }
            })
          }
        }
      } catch (error) {
        console.error('加载训练数据失败:', error)
      }
    }

    const saveTrainingData = async () => {
      try {
        // 保存数据到本地存储
        const modeProgress = {}
        trainingModes.value.forEach(mode => {
          modeProgress[mode.id] = {
            completedCount: mode.completedCount,
            progress: mode.progress
          }
        })
        
        const data = {
          todayStats,
          abilityRatings,
          settings,
          trainingHistory: trainingHistory.value,
          achievements: achievements.value,
          trainingPlan,
          modeProgress,
          timestamp: Date.now()
        }
        
        localStorage.setItem('overallPerceptionData', JSON.stringify(data))
      } catch (error) {
        console.error('保存训练数据失败:', error)
      }
    }

    // 新增方法：更新训练统计
    const updateTrainingStats = (mode, accuracy, duration, score) => {
      // 更新今日统计
      todayStats.sessionsCompleted++
      todayStats.accuracy = Math.round((todayStats.accuracy + accuracy) / 2)
      
      // 更新模式进度
      const modeData = trainingModes.value.find(m => m.id === mode.id)
      if (modeData) {
        modeData.completedCount++
        modeData.progress = Math.min(100, modeData.progress + 5)
      }
      
      // 更新能力评级
      const ratingKey = mode.id
      if (abilityRatings[ratingKey] !== undefined) {
        if (accuracy >= 90) {
          abilityRatings[ratingKey] = Math.min(5, abilityRatings[ratingKey] + 0.2)
        } else if (accuracy >= 80) {
          abilityRatings[ratingKey] = Math.min(5, abilityRatings[ratingKey] + 0.1)
        }
      }
      
      // 添加训练历史记录
      trainingHistory.value.unshift({
        date: new Date().toISOString().split('T')[0],
        mode: mode.id,
        duration,
        accuracy,
        score,
        level: currentLevel.value,
        mistakes: Math.round((100 - accuracy) / 10)
      })
      
      // 保持历史记录在合理范围内
      if (trainingHistory.value.length > 50) {
        trainingHistory.value = trainingHistory.value.slice(0, 50)
      }
      
      // 检查成就
      checkAchievements(accuracy, duration, score)
      
      // 保存数据
      saveTrainingData()
    }

    // 新增方法：检查成就
    const checkAchievements = (accuracy, duration, score) => {
      achievements.value.forEach(achievement => {
        if (achievement.unlocked) return
        
        switch (achievement.id) {
          case 'accuracy_master':
            if (accuracy >= 95) {
              achievement.unlocked = true
              achievement.unlockedDate = new Date().toISOString().split('T')[0]
            }
            break
          case 'speed_demon':
            if (duration < 600) { // 10分钟内完成
              achievement.progress = Math.min(100, achievement.progress + 10)
              if (achievement.progress >= 100) {
                achievement.unlocked = true
                achievement.unlockedDate = new Date().toISOString().split('T')[0]
              }
            }
            break
          case 'consistency_king':
            // 检查连续训练天数
            const recentDays = trainingHistory.value
              .map(h => h.date)
              .filter((date, index, arr) => arr.indexOf(date) === index)
              .slice(0, 7)
            
            if (recentDays.length >= 7) {
              achievement.unlocked = true
              achievement.unlockedDate = new Date().toISOString().split('T')[0]
            } else {
              achievement.progress = (recentDays.length / 7) * 100
            }
            break
        }
      })
    }

    // 新增方法：获取个性化建议
    const getPersonalizedRecommendations = () => {
      const recommendations = []
      
      // 基于准确率的建议
      if (todayStats.accuracy < 70) {
        recommendations.push({
          type: 'difficulty',
          title: '降低难度',
          description: '建议先从简单模式开始，逐步提高',
          priority: 'high'
        })
      } else if (todayStats.accuracy > 90) {
        recommendations.push({
          type: 'challenge',
          title: '挑战更高难度',
          description: '您的表现很棒，可以尝试更高难度',
          priority: 'medium'
        })
      }
      
      // 基于训练时间的建议
      const totalMinutes = parseInt(todayStats.totalTime)
      if (totalMinutes < 15) {
        recommendations.push({
          type: 'duration',
          title: '增加训练时间',
          description: '建议每日训练至少20分钟',
          priority: 'medium'
        })
      }
      
      // 基于能力评级的建议
      const weakestSkill = Object.entries(abilityRatings)
        .sort(([,a], [,b]) => a - b)[0]
      
      if (weakestSkill && weakestSkill[1] < 3) {
        const skillNames = {
          shapes: '图形识别',
          numbers: '数字记忆',
          colors: '颜色感知',
          words: '文字理解',
          patterns: '模式识别',
          spatial: '空间感知',
          memory: '记忆能力',
          attention: '注意力'
        }
        
        recommendations.push({
          type: 'skill',
          title: `加强${skillNames[weakestSkill[0]]}训练`,
          description: `您在${skillNames[weakestSkill[0]]}方面还有提升空间`,
          priority: 'high'
        })
      }
      
      return recommendations
    }

    return {
      // 响应式数据
      selectedMode,
      isTraining,
      isPaused,
      showCompletionModal,
      timeRemaining,
      currentStep,
      totalSteps,
      currentScore,
      currentLevel,
      accuracy,
      highlightedIndex,
      showInput,
      userInput,
      selectedColorIndex,
      showFeedback,
      feedbackType,
      feedbackMessage,
      showQuestions,
      textSize,
      trainingModes,
      settings,
      currentShapes,
      currentNumbers,
      currentColors,
      currentText,
      currentQuestions,
      todayStats,
      performanceData,
      abilityRatings,
      completionStats,
      trainingHistory,
      achievements,
      trainingPlan,
      
      // 计算属性
      timerProgress,
      
      // 方法
      selectMode,
      startTraining,
      pauseTraining,
      stopTraining,
      completeTraining,
      formatTime,
      checkAnswer,
      selectColor,
      selectOption,
      submitAnswers,
      closeCompletionModal,
      restartTraining,
      updateTrainingStats,
      checkAchievements,
      getPersonalizedRecommendations,
      loadTrainingData,
      saveTrainingData
    }
  }
}
</script>

<style scoped>
.overall-perception-container {
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

.shapes-training {
  text-align: center;
}

.shapes-grid {
  position: relative;
  width: 100%;
  height: 400px;
  background: rgba(var(--color-primary-rgb), 0.02);
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 2px dashed rgba(var(--color-primary-rgb), 0.2);
}

.shape-item {
  position: absolute;
  width: 30px;
  height: 30px;
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
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 30px solid;
  background: transparent !important;
}

.training-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
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

.numbers-training {
  text-align: center;
}

.numbers-display {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.number-item {
  width: 60px;
  height: 60px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-text);
  transition: all var(--transition-normal);
}

.number-item.highlighted {
  background: var(--color-primary);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.4);
}

.input-area {
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}

.answer-input {
  padding: 0.8rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 1.1rem;
  text-align: center;
  min-width: 200px;
  background: var(--color-bg);
  color: var(--color-text);
}

.answer-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.submit-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.submit-btn:hover {
  background: var(--color-primary-dark);
}

.colors-training {
  text-align: center;
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.color-item {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 3px solid transparent;
}

.color-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.color-item.selected {
  border-color: var(--color-primary);
  transform: scale(1.1);
}

.feedback {
  margin-top: 1rem;
}

.feedback-message {
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
}

.feedback-message.success {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
  border: 2px solid rgba(var(--color-success-rgb), 0.3);
}

.feedback-message.error {
  background: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
  border: 2px solid rgba(var(--color-danger-rgb), 0.3);
}

.words-training {
  text-align: center;
}

.words-display {
  margin-bottom: 2rem;
}

.text-content {
  padding: 2rem;
  background: rgba(var(--color-primary-rgb), 0.02);
  border-radius: 12px;
  line-height: 1.8;
  color: var(--color-text);
  max-width: 600px;
  margin: 0 auto;
}

.comprehension-questions {
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
}

.comprehension-questions h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  text-align: center;
}

.question-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--color-card-bg);
  border-radius: 8px;
}

.question-text {
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.options {
  display: grid;
  gap: 0.5rem;
}

.option-btn {
  padding: 0.8rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: left;
}

.option-btn:hover {
  border-color: var(--color-primary);
}

.option-btn.selected {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.submit-answers-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 100%;
  margin-top: 1rem;
}

.submit-answers-btn:hover {
  background: var(--color-primary-dark);
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

.range-input {
  width: 100%;
  margin-right: 1rem;
}

.range-value {
  color: var(--color-primary);
  font-weight: 600;
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
  .overall-perception-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .modes-grid {
    grid-template-columns: 1fr;
  }
  
  .training-controls {
    flex-direction: column;
  }
  
  .time-remaining {
    font-size: 2rem;
  }
  
  .shapes-grid {
    height: 300px;
  }
  
  .numbers-display {
    gap: 0.5rem;
  }
  
  .number-item {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .colors-grid {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  }
  
  .color-item {
    width: 60px;
    height: 60px;
  }
  
  .input-area {
    flex-direction: column;
  }
  
  .answer-input {
    min-width: auto;
    width: 100%;
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
}
</style>