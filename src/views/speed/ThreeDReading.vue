<template>
  <div class="threed-reading-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <span class="back-arrow">←</span>
        返回
      </button>
      <h1 class="page-title">3D图阅读训练</h1>
      <p class="page-description">通过立体图像训练提高空间感知和快速识别能力</p>
    </div>

    <!-- 训练模式选择 -->
    <div class="training-modes" v-if="!isTraining">
      <h2>选择训练模式</h2>
      <div class="mode-grid">
        <div 
          class="mode-card" 
          :class="{ active: selectedMode === mode.id }"
          v-for="mode in trainingModes" 
          :key="mode.id"
          @click="selectMode(mode.id)"
        >
          <div class="mode-icon">
            <i :class="mode.icon"></i>
          </div>
          <h3>{{ mode.name }}</h3>
          <p>{{ mode.description }}</p>
          <div class="mode-stats">
            <span>难度: {{ mode.difficulty }}</span>
            <span>时长: {{ mode.duration }}分钟</span>
          </div>
        </div>
      </div>
      <button class="start-btn" @click="startTraining" :disabled="!selectedMode">
        开始训练
      </button>
    </div>

    <!-- 训练界面 -->
    <div class="training-interface" v-if="isTraining">
      <!-- 训练控制栏 -->
      <div class="training-controls">
        <div class="control-group">
          <label>显示时间:</label>
          <div class="time-control">
            <button @click="adjustDisplayTime(-0.5)" :disabled="isPaused">-</button>
            <span>{{ displayTime }}秒</span>
            <button @click="adjustDisplayTime(0.5)" :disabled="isPaused">+</button>
          </div>
        </div>
        <div class="control-group">
          <button class="control-btn" @click="togglePause">
            {{ isPaused ? '继续' : '暂停' }}
          </button>
          <button class="control-btn" @click="stopTraining">结束训练</button>
        </div>
        <div class="training-stats">
          <span>已完成: {{ completedImages }}/{{ totalImages }}</span>
          <span>用时: {{ formatTime(elapsedTime) }}</span>
          <span>准确率: {{ Math.round(accuracy) }}%</span>
        </div>
      </div>

      <!-- 3D图显示区域 -->
      <div class="threed-display"
           :class="{
             'bg-black': settings.backgroundColor === 'black',
             'bg-white': settings.backgroundColor === 'white',
             'bg-gray': settings.backgroundColor === 'gray',
             'bg-dark-blue': settings.backgroundColor === 'dark-blue',
             'contrast-low': settings.contrastLevel === 'low',
             'contrast-medium': settings.contrastLevel === 'medium',
             'contrast-high': settings.contrastLevel === 'high',
             'contrast-ultra': settings.contrastLevel === 'ultra'
           }">
        <div class="display-area" v-if="!showQuestion">
          <div class="countdown" v-if="countdown > 0">
            {{ countdown }}
          </div>
          <div class="threed-image" v-else-if="currentImage">
            <div class="image-container"
                 :class="{
                   'size-small': settings.imageSize === 'small',
                   'size-medium': settings.imageSize === 'medium',
                   'size-large': settings.imageSize === 'large',
                   'size-extra-large': settings.imageSize === 'extra-large'
                 }">
              <div class="stereo-image" :style="{ backgroundImage: `url(${currentImage.url})` }">
                <!-- 3D立体图像 -->
                <div class="depth-layers">
                  <div 
                    v-for="(layer, index) in currentImage.layers" 
                    :key="index"
                    class="depth-layer"
                    :class="{
                      'blur-effect': settings.blurEffect,
                      'rotation-effect': settings.rotationEffect,
                      'pulse-effect': settings.pulseEffect,
                      'anim-slow': settings.animationSpeed === 'slow',
                      'anim-normal': settings.animationSpeed === 'normal',
                      'anim-fast': settings.animationSpeed === 'fast',
                      'anim-instant': settings.animationSpeed === 'instant'
                    }"
                    :style="{
                      transform: `translateZ(${layer.depth * (settings.layerSeparation / 20)}px)`,
                      opacity: layer.opacity,
                      color: layer.color || '#fff',
                      fontSize: layer.size || '3rem'
                    }"
                  >
                    {{ layer.content }}
                  </div>
                </div>
              </div>
            </div>
            <div class="focus-guide" v-if="settings.showFocusGuide">
              <div class="guide-dot"></div>
              <p>请放松眼睛，让视线穿透图像</p>
            </div>
          </div>
          <div class="preparation-message" v-else>
            <h3>准备观看下一张3D图</h3>
            <p>请放松眼睛，准备进入立体视觉状态</p>
          </div>
        </div>

        <!-- 问题回答区域 -->
        <div class="question-area" v-if="showQuestion">
          <h3>请回答以下问题</h3>
          <div class="question-content">
            <p>{{ currentQuestion.question }}</p>
            <div class="answer-options" v-if="currentQuestion.type === 'choice'">
              <button 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="option-btn"
                :class="{ selected: selectedAnswer === index }"
                @click="selectAnswer(index)"
              >
                {{ option }}
              </button>
            </div>
            <div class="answer-input" v-else-if="currentQuestion.type === 'input'">
              <input 
                type="text" 
                v-model="textAnswer" 
                placeholder="请输入您看到的内容"
                @keyup.enter="submitAnswer"
              >
            </div>
            <div class="answer-drawing" v-else-if="currentQuestion.type === 'draw'">
              <canvas 
                ref="drawingCanvas" 
                width="400" 
                height="300"
                @mousedown="startDrawing"
                @mousemove="draw"
                @mouseup="stopDrawing"
                @mouseleave="stopDrawing"
              ></canvas>
              <div class="drawing-controls">
                <button @click="clearCanvas">清除</button>
                <button @click="undoLastStroke">撤销</button>
              </div>
            </div>
          </div>
          <button class="submit-btn" @click="submitAnswer" :disabled="!canSubmit">
            提交答案
          </button>
        </div>
      </div>

      <!-- 训练提示 -->
      <div class="training-tips" v-if="settings.showTips">
        <h4>观看技巧</h4>
        <ul>
          <li>放松眼部肌肉，不要强行聚焦</li>
          <li>让视线穿透图像，仿佛看向远方</li>
          <li>保持耐心，立体效果需要时间显现</li>
          <li>如果感到眼部疲劳，请适当休息</li>
        </ul>
      </div>
    </div>

    <!-- 训练完成弹窗 -->
    <div class="modal-overlay" v-if="showCompletionModal">
      <div class="completion-modal">
        <h2>训练完成！</h2>
        <div class="completion-stats">
          <div class="stat-item">
            <span class="stat-label">完成图像:</span>
            <span class="stat-value">{{ completedImages }}/{{ totalImages }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总用时:</span>
            <span class="stat-value">{{ formatTime(totalTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">识别准确率:</span>
            <span class="stat-value">{{ Math.round(finalAccuracy) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">空间感知评级:</span>
            <span class="stat-value" :class="'rating-' + spatialRating.toLowerCase()">{{ spatialRating }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="secondary-btn" @click="restartTraining">重新训练</button>
          <button class="primary-btn" @click="finishTraining">完成</button>
        </div>
      </div>
    </div>

    <!-- 训练设置 -->
    <div class="training-settings" v-if="!isTraining">
      <h2>训练设置</h2>
      <div class="settings-grid">
        <!-- 基础设置 -->
        <div class="settings-section">
          <h3>基础设置</h3>
          <div class="setting-group">
            <label>初始显示时间 (秒):</label>
            <input type="range" v-model="settings.initialDisplayTime" min="1" max="10" step="0.5">
            <span>{{ settings.initialDisplayTime }}</span>
          </div>
          <div class="setting-group">
            <label>图像大小:</label>
            <select v-model="settings.imageSize">
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
              <option value="extra-large">特大</option>
            </select>
          </div>
          <div class="setting-group">
            <label>难度等级:</label>
            <select v-model="settings.difficulty">
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
              <option value="expert">专家</option>
            </select>
          </div>
          <div class="setting-group">
            <label>自动调节难度:</label>
            <input type="checkbox" v-model="settings.autoAdjustDifficulty">
          </div>
        </div>

        <!-- 视觉效果设置 -->
        <div class="settings-section">
          <h3>视觉效果</h3>
          <div class="setting-group">
            <label>背景颜色:</label>
            <select v-model="settings.backgroundColor">
              <option value="black">黑色</option>
              <option value="white">白色</option>
              <option value="gray">灰色</option>
              <option value="dark-blue">深蓝色</option>
            </select>
          </div>
          <div class="setting-group">
            <label>层次间距:</label>
            <input type="range" v-model="settings.layerSeparation" min="10" max="50" step="5">
            <span>{{ settings.layerSeparation }}px</span>
          </div>
          <div class="setting-group">
            <label>对比度:</label>
            <select v-model="settings.contrastLevel">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="ultra">超高</option>
            </select>
          </div>
          <div class="setting-group">
            <label>动画速度:</label>
            <select v-model="settings.animationSpeed">
              <option value="slow">慢</option>
              <option value="normal">正常</option>
              <option value="fast">快</option>
              <option value="instant">瞬间</option>
            </select>
          </div>
        </div>

        <!-- 特效设置 -->
        <div class="settings-section">
          <h3>特效设置</h3>
          <div class="setting-group">
            <label>模糊效果:</label>
            <input type="checkbox" v-model="settings.blurEffect">
          </div>
          <div class="setting-group">
            <label>旋转效果:</label>
            <input type="checkbox" v-model="settings.rotationEffect">
          </div>
          <div class="setting-group">
            <label>脉冲效果:</label>
            <input type="checkbox" v-model="settings.pulseEffect">
          </div>
          <div class="setting-group">
            <label>显示聚焦引导:</label>
            <input type="checkbox" v-model="settings.showFocusGuide">
          </div>
          <div class="setting-group">
            <label>显示观看技巧:</label>
            <input type="checkbox" v-model="settings.showTips">
          </div>
        </div>

        <!-- 反馈设置 -->
        <div class="settings-section">
          <h3>反馈设置</h3>
          <div class="setting-group">
            <label>反馈类型:</label>
            <select v-model="settings.feedbackType">
              <option value="visual">视觉反馈</option>
              <option value="audio">音频反馈</option>
              <option value="both">视觉+音频</option>
              <option value="none">无反馈</option>
            </select>
          </div>
          <div class="setting-group">
            <label>启用音效:</label>
            <input type="checkbox" v-model="settings.enableSound">
          </div>
          <div class="setting-group">
            <label>最小显示时间 (秒):</label>
            <input type="range" v-model="settings.minDisplayTime" min="0.5" max="5" step="0.1">
            <span>{{ settings.minDisplayTime }}</span>
          </div>
          <div class="setting-group">
            <label>最大显示时间 (秒):</label>
            <input type="range" v-model="settings.maxDisplayTime" min="5" max="20" step="0.5">
            <span>{{ settings.maxDisplayTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练统计 -->
    <div class="training-statistics" v-if="!isTraining">
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
            <div class="stat-number">{{ Math.round(statistics.averageAccuracy) }}%</div>
            <div class="stat-label">平均准确率</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ Math.round(statistics.averageTime) }}s</div>
            <div class="stat-label">平均识别时间</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ formatTime(statistics.totalTime) }}</div>
            <div class="stat-label">总训练时长</div>
          </div>
        </div>
      </div>

      <!-- 不同模式表现 -->
      <div class="stats-section">
        <h3>不同模式表现</h3>
        <div class="mode-performance">
          <div class="performance-item" v-for="mode in trainingModes" :key="mode.id">
            <div class="mode-info">
              <span class="mode-name">{{ mode.name }}</span>
              <span class="mode-difficulty">{{ mode.difficulty }}</span>
            </div>
            <div class="performance-stats">
              <div class="stat">
                <span class="stat-label">准确率:</span>
                <span class="stat-value">{{ getModeAccuracy(mode.id) }}%</span>
              </div>
              <div class="stat">
                <span class="stat-label">平均时间:</span>
                <span class="stat-value">{{ getModeTime(mode.id) }}s</span>
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
              <p>空间感知能力雷达图</p>
              <small>显示各项3D视觉能力指标</small>
            </div>
          </div>
          <div class="ability-details">
            <div class="ability-item">
              <span class="ability-name">立体视觉</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: statistics.stereoVision + '%' }"></div>
              </div>
              <span class="ability-score">{{ statistics.stereoVision }}%</span>
            </div>
            <div class="ability-item">
              <span class="ability-name">空间感知</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: statistics.spatialPerception + '%' }"></div>
              </div>
              <span class="ability-score">{{ statistics.spatialPerception }}%</span>
            </div>
            <div class="ability-item">
              <span class="ability-name">深度判断</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: statistics.depthPerception + '%' }"></div>
              </div>
              <span class="ability-score">{{ statistics.depthPerception }}%</span>
            </div>
            <div class="ability-item">
              <span class="ability-name">视觉专注</span>
              <div class="ability-bar">
                <div class="ability-progress" :style="{ width: statistics.visualFocus + '%' }"></div>
              </div>
              <span class="ability-score">{{ statistics.visualFocus }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  saveThreeDReadingSettings,
  getThreeDReadingSettings,
  saveThreeDReadingRecord,
  getThreeDReadingHistory,
  getSpeedReadingStats
} from '@/services/speedReadingStorage'

export default {
  name: 'ThreeDReading',
  emits: ['go-back'],
  data() {
    return {
      // 训练状态
      isTraining: false,
      isPaused: false,
      selectedMode: null,
      
      // 训练模式
      trainingModes: [
        {
          id: 'basic',
          name: '基础立体图',
          description: '简单的几何图形和文字',
          icon: 'fas fa-cube',
          difficulty: '简单',
          duration: 10
        },
        {
          id: 'pattern',
          name: '图案识别',
          description: '复杂图案和隐藏图像',
          icon: 'fas fa-puzzle-piece',
          difficulty: '中等',
          duration: 15
        },
        {
          id: 'text',
          name: '立体文字',
          description: '3D文字和数字识别',
          icon: 'fas fa-font',
          difficulty: '中等',
          duration: 12
        },
        {
          id: 'complex',
          name: '复杂场景',
          description: '多层次立体场景',
          icon: 'fas fa-mountain',
          difficulty: '困难',
          duration: 20
        }
      ],
      
      // 当前图像和问题
      currentImage: null,
      currentQuestion: null,
      showQuestion: false,
      
      // 训练参数
      displayTime: 3,
      completedImages: 0,
      totalImages: 10,
      elapsedTime: 0,
      totalTime: 0,
      accuracy: 0,
      finalAccuracy: 0,
      
      // 答题相关
      selectedAnswer: null,
      textAnswer: '',
      isDrawing: false,
      drawingStrokes: [],
      
      // 倒计时
      countdown: 0,
      
      // 完成状态
      showCompletionModal: false,
      spatialRating: 'B',
      
      // 定时器
      displayTimer: null,
      countdownTimer: null,
      timeTimer: null,
      
      // 设置
      settings: {
        initialDisplayTime: 3,
        imageSize: 'medium',
        showFocusGuide: true,
        showTips: true,
        backgroundColor: 'black',
        enableSound: true,
        difficulty: 'medium',
        layerSeparation: 25,
        animationSpeed: 'normal',
        contrastLevel: 'high',
        blurEffect: false,
        rotationEffect: false,
        pulseEffect: false,
        autoAdjustDifficulty: false,
        minDisplayTime: 1,
        maxDisplayTime: 10,
        feedbackType: 'visual'
      },
      
      // 统计数据
      statistics: {
        totalSessions: 0,
        averageAccuracy: 0,
        averageTime: 0,
        totalTime: 0,
        stereoVision: 0,
        spatialPerception: 0,
        depthPerception: 0,
        visualFocus: 0
      },
      
      // 图像数据库
      imageDatabase: {
        basic: [
          {
            id: 1,
            type: 'basic',
            layers: [
              { content: '●', depth: 0, opacity: 1, color: '#ff4757', size: '40px' },
              { content: '■', depth: 25, opacity: 0.8, color: '#2ed573', size: '35px' },
              { content: '▲', depth: 50, opacity: 0.6, color: '#3742fa', size: '30px' }
            ],
            question: {
              type: 'choice',
              question: '哪个图形在最前面？',
              options: ['红色圆形', '绿色方形', '蓝色三角形', '无法确定'],
              correct: 0
            }
          },
          {
            id: 2,
            type: 'basic',
            layers: [
              { content: '★', depth: 10, opacity: 0.9, color: '#ffa502', size: '45px' },
              { content: '♦', depth: 30, opacity: 0.7, color: '#ff6348', size: '40px' },
              { content: '♠', depth: 50, opacity: 0.5, color: '#2f3542', size: '35px' }
            ],
            question: {
              type: 'choice',
              question: '从前到后的图形顺序是？',
              options: ['★♦♠', '♦★♠', '♠♦★', '★♠♦'],
              correct: 0
            }
          },
          {
            id: 3,
            type: 'basic',
            layers: [
              { content: '◆', depth: 0, opacity: 1, color: '#5352ed', size: '50px' },
              { content: '◇', depth: 20, opacity: 0.8, color: '#ff3838', size: '45px' },
              { content: '○', depth: 40, opacity: 0.6, color: '#2ed573', size: '40px' },
              { content: '□', depth: 60, opacity: 0.4, color: '#ffa502', size: '35px' }
            ],
            question: {
              type: 'choice',
              question: '有多少个图形层次？',
              options: ['2个', '3个', '4个', '5个'],
              correct: 2
            }
          }
        ],
        shapes: [
          {
            id: 4,
            type: 'shapes',
            layers: [
              { content: '🔴', depth: 0, opacity: 1, size: '60px' },
              { content: '🔵', depth: 30, opacity: 0.7, size: '50px' },
              { content: '🟡', depth: 60, opacity: 0.5, size: '40px' }
            ],
            question: {
              type: 'choice',
              question: '中间层是什么颜色？',
              options: ['红色', '蓝色', '黄色', '绿色'],
              correct: 1
            }
          },
          {
            id: 5,
            type: 'shapes',
            layers: [
              { content: '🔺', depth: 15, opacity: 0.9, size: '55px' },
              { content: '🔻', depth: 35, opacity: 0.7, size: '50px' },
              { content: '⬜', depth: 55, opacity: 0.5, size: '45px' },
              { content: '⬛', depth: 75, opacity: 0.3, size: '40px' }
            ],
            question: {
              type: 'input',
              question: '请输入从前到后看到的图形数量：',
              correct: '4'
            }
          }
        ],
        text: [
          {
            id: 6,
            type: 'text',
            layers: [
              { content: 'A', depth: 0, opacity: 1, color: '#2ed573', size: '48px' },
              { content: 'B', depth: 20, opacity: 0.8, color: '#ff4757', size: '44px' },
              { content: 'C', depth: 40, opacity: 0.6, color: '#3742fa', size: '40px' }
            ],
            question: {
              type: 'input',
              question: '请输入您看到的字母序列（从前到后）：',
              correct: 'ABC'
            }
          },
          {
            id: 7,
            type: 'text',
            layers: [
              { content: '1', depth: 10, opacity: 0.9, color: '#ffa502', size: '52px' },
              { content: '2', depth: 30, opacity: 0.7, color: '#ff6348', size: '48px' },
              { content: '3', depth: 50, opacity: 0.5, color: '#5352ed', size: '44px' },
              { content: '4', depth: 70, opacity: 0.3, color: '#2f3542', size: '40px' }
            ],
            question: {
              type: 'choice',
              question: '最清晰的数字是？',
              options: ['1', '2', '3', '4'],
              correct: 0
            }
          },
          {
            id: 8,
            type: 'text',
            layers: [
              { content: 'X', depth: 5, opacity: 0.95, color: '#ff3838', size: '50px' },
              { content: 'Y', depth: 25, opacity: 0.75, color: '#2ed573', size: '46px' },
              { content: 'Z', depth: 45, opacity: 0.55, color: '#3742fa', size: '42px' }
            ],
            question: {
              type: 'input',
              question: '请输入最后面的字母：',
              correct: 'Z'
            }
          }
        ],
        complex: [
          {
            id: 9,
            type: 'complex',
            layers: [
              { content: '🏠', depth: 0, opacity: 1, size: '60px' },
              { content: '🌳', depth: 25, opacity: 0.8, size: '55px' },
              { content: '🚗', depth: 50, opacity: 0.6, size: '50px' },
              { content: '☁️', depth: 75, opacity: 0.4, size: '45px' }
            ],
            question: {
              type: 'choice',
              question: '这个场景中，什么在最前面？',
              options: ['房子', '树', '汽车', '云朵'],
              correct: 0
            }
          },
          {
            id: 10,
            type: 'complex',
            layers: [
              { content: '⭐', depth: 10, opacity: 0.9, size: '45px' },
              { content: '🌙', depth: 30, opacity: 0.7, size: '50px' },
              { content: '🌍', depth: 50, opacity: 0.5, size: '55px' },
              { content: '🌌', depth: 70, opacity: 0.3, size: '60px' }
            ],
            question: {
              type: 'choice',
              question: '在这个宇宙场景中，层次最多的是？',
              options: ['3层', '4层', '5层', '6层'],
              correct: 1
            }
          },
          {
            id: 11,
            type: 'complex',
            layers: [
              { content: '🎯', depth: 0, opacity: 1, size: '50px' },
              { content: '🏹', depth: 20, opacity: 0.8, size: '45px' },
              { content: '🎪', depth: 40, opacity: 0.6, size: '55px' },
              { content: '🎨', depth: 60, opacity: 0.4, size: '40px' },
              { content: '🎭', depth: 80, opacity: 0.2, size: '35px' }
            ],
            question: {
              type: 'input',
              question: '请输入您能清楚看到的物品数量：',
              correct: '5'
            }
          }
        ]
      }
    }
  },
  
  computed: {
    canSubmit() {
      if (this.currentQuestion?.type === 'choice') {
        return this.selectedAnswer !== null
      } else if (this.currentQuestion?.type === 'input') {
        return this.textAnswer.trim() !== ''
      } else if (this.currentQuestion?.type === 'draw') {
        return this.drawingStrokes.length > 0
      }
      return false
    }
  },
  
  async mounted() {
    await this.loadSettings()
    await this.loadStatistics()
  },
  
  beforeUnmount() {
    this.clearTimers()
  },
  
  methods: {
    // 选择训练模式
    selectMode(modeId) {
      this.selectedMode = modeId
    },
    
    // 开始训练
    startTraining() {
      if (!this.selectedMode) return
      
      this.isTraining = true
      this.isPaused = false
      this.displayTime = this.settings.initialDisplayTime
      this.completedImages = 0
      this.elapsedTime = 0
      this.accuracy = 0
      
      this.loadImagesForMode(this.selectedMode)
      this.startTimer()
      this.showNextImage()
    },
    
    // 显示下一张图像
    showNextImage() {
      if (this.completedImages >= this.totalImages) {
        this.completeTraining()
        return
      }
      
      this.showQuestion = false
      this.currentImage = this.getRandomImage()
      this.resetAnswers()
      
      // 开始倒计时
      this.countdown = 3
      this.countdownTimer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer)
          this.displayImage()
        }
      }, 1000)
    },
    
    // 显示图像
    displayImage() {
      this.displayTimer = setTimeout(() => {
        this.currentImage = null
        this.showQuestionPhase()
      }, this.displayTime * 1000)
    },
    
    // 显示问题阶段
    showQuestionPhase() {
      this.showQuestion = true
      this.currentQuestion = this.currentImage?.question
    },
    
    // 调整显示时间
    adjustDisplayTime(delta) {
      this.displayTime = Math.max(0.5, Math.min(10, this.displayTime + delta))
    },
    
    // 暂停/继续
    togglePause() {
      this.isPaused = !this.isPaused
      if (this.isPaused) {
        this.clearTimers()
      } else {
        this.startTimer()
        if (this.currentImage && !this.showQuestion) {
          this.displayImage()
        }
      }
    },
    
    // 停止训练
    stopTraining() {
      this.clearTimers()
      this.isTraining = false
      this.showCompletionModal = false
    },
    
    // 开始计时
    startTimer() {
      this.timeTimer = setInterval(() => {
        if (!this.isPaused) {
          this.elapsedTime++
        }
      }, 1000)
    },
    
    // 选择答案
    selectAnswer(index) {
      this.selectedAnswer = index
    },
    
    // 提交答案
    submitAnswer() {
      if (!this.canSubmit) return
      
      let isCorrect = false
      
      if (this.currentQuestion.type === 'choice') {
        isCorrect = this.selectedAnswer === this.currentQuestion.correct
      } else if (this.currentQuestion.type === 'input') {
        isCorrect = this.textAnswer.trim().toLowerCase() === this.currentQuestion.correct.toLowerCase()
      } else if (this.currentQuestion.type === 'draw') {
        // 简化的绘图评估
        isCorrect = this.drawingStrokes.length > 3
      }
      
      if (isCorrect) {
        this.accuracy = ((this.accuracy * this.completedImages) + 100) / (this.completedImages + 1)
        if (this.settings.enableSound) {
          this.playSound('correct')
        }
      } else {
        this.accuracy = (this.accuracy * this.completedImages) / (this.completedImages + 1)
        if (this.settings.enableSound) {
          this.playSound('incorrect')
        }
      }
      
      this.completedImages++
      
      setTimeout(() => {
        this.showNextImage()
      }, 1000)
    },
    
    // 完成训练
    completeTraining() {
      this.clearTimers()
      this.totalTime = this.elapsedTime
      this.finalAccuracy = this.accuracy
      this.calculateSpatialRating()
      this.showCompletionModal = true
      this.saveTrainingData()
    },
    
    // 计算空间感知评级
    calculateSpatialRating() {
      const accuracyScore = this.finalAccuracy
      const timeScore = Math.max(0, 100 - (this.totalTime / this.totalImages - 5) * 10)
      const overallScore = (accuracyScore + timeScore) / 2
      
      if (overallScore >= 90) this.spatialRating = 'S'
      else if (overallScore >= 80) this.spatialRating = 'A'
      else if (overallScore >= 70) this.spatialRating = 'B'
      else if (overallScore >= 60) this.spatialRating = 'C'
      else this.spatialRating = 'D'
    },
    
    // 重新训练
    restartTraining() {
      this.showCompletionModal = false
      this.startTraining()
    },
    
    // 完成训练
    finishTraining() {
      this.showCompletionModal = false
      this.isTraining = false
    },
    
    // 重置答案
    resetAnswers() {
      this.selectedAnswer = null
      this.textAnswer = ''
      this.drawingStrokes = []
      if (this.$refs.drawingCanvas) {
        const ctx = this.$refs.drawingCanvas.getContext('2d')
        ctx.clearRect(0, 0, 400, 300)
      }
    },
    
    // 绘图相关方法
    startDrawing(event) {
      this.isDrawing = true
      const rect = this.$refs.drawingCanvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      const ctx = this.$refs.drawingCanvas.getContext('2d')
      ctx.beginPath()
      ctx.moveTo(x, y)
      
      this.drawingStrokes.push([{ x, y }])
    },
    
    draw(event) {
      if (!this.isDrawing) return
      
      const rect = this.$refs.drawingCanvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      const ctx = this.$refs.drawingCanvas.getContext('2d')
      ctx.lineTo(x, y)
      ctx.stroke()
      
      const currentStroke = this.drawingStrokes[this.drawingStrokes.length - 1]
      currentStroke.push({ x, y })
    },
    
    stopDrawing() {
      this.isDrawing = false
    },
    
    clearCanvas() {
      const ctx = this.$refs.drawingCanvas.getContext('2d')
      ctx.clearRect(0, 0, 400, 300)
      this.drawingStrokes = []
    },
    
    undoLastStroke() {
      if (this.drawingStrokes.length > 0) {
        this.drawingStrokes.pop()
        this.redrawCanvas()
      }
    },
    
    redrawCanvas() {
      const ctx = this.$refs.drawingCanvas.getContext('2d')
      ctx.clearRect(0, 0, 400, 300)
      
      this.drawingStrokes.forEach(stroke => {
        if (stroke.length > 0) {
          ctx.beginPath()
          ctx.moveTo(stroke[0].x, stroke[0].y)
          stroke.slice(1).forEach(point => {
            ctx.lineTo(point.x, point.y)
          })
          ctx.stroke()
        }
      })
    },
    
    // 清除定时器
    clearTimers() {
      if (this.displayTimer) {
        clearTimeout(this.displayTimer)
        this.displayTimer = null
      }
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
      if (this.timeTimer) {
        clearInterval(this.timeTimer)
        this.timeTimer = null
      }
    },
    
    // 格式化时间
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    // 播放音效
    playSound(type) {
      // 简化的音效播放
      if (type === 'correct') {
        console.log('播放正确音效')
      } else {
        console.log('播放错误音效')
      }
    },
    
    // 加载训练模式对应的图像
    loadImagesForMode(mode) {
      // 根据模式获取对应的图像数组
      const modeImages = this.imageDatabase[mode] || this.imageDatabase.basic
      this.totalImages = Math.min(10, modeImages.length * 2) // 每种图像可以重复
    },
    
    // 获取随机图像
    getRandomImage() {
      const modeImages = this.imageDatabase[this.selectedMode] || this.imageDatabase.basic
      return modeImages[Math.floor(Math.random() * modeImages.length)]
    },
    
    // 获取模式准确率
    async getModeAccuracy(modeId) {
      try {
        const history = await getThreeDReadingHistory()
        const modeHistory = history.filter(item => item.mode === modeId)
        if (modeHistory.length === 0) return 0
        return Math.round(modeHistory.reduce((sum, item) => sum + item.accuracy, 0) / modeHistory.length)
      } catch (error) {
        console.error('获取模式准确率失败:', error)
        return 0
      }
    },
    
    // 获取模式平均时间
    async getModeTime(modeId) {
      try {
        const history = await getThreeDReadingHistory()
        const modeHistory = history.filter(item => item.mode === modeId)
        if (modeHistory.length === 0) return 0
        return Math.round(modeHistory.reduce((sum, item) => sum + item.averageTime, 0) / modeHistory.length)
      } catch (error) {
        console.error('获取模式平均时间失败:', error)
        return 0
      }
    },
    
    // 保存训练数据
    async saveTrainingData() {
      const data = {
        mode: this.selectedMode,
        accuracy: this.finalAccuracy,
        averageTime: this.totalTime / this.totalImages,
        totalTime: this.totalTime,
        rating: this.spatialRating,
        date: new Date().toISOString()
      }
      
      // 使用统一存储服务保存记录
      await saveThreeDReadingRecord(data)
      await this.loadStatistics()
    },
    
    // 更新统计数据（已废弃，由存储服务自动处理）
    updateStatistics() {
      // 此方法已由统一存储服务处理，保留以兼容现有代码
      console.log('统计数据由存储服务自动更新')
    },
    
    // 加载设置
    async loadSettings() {
      try {
        const settings = await getThreeDReadingSettings()
        this.settings = { ...this.settings, ...settings }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    },
    
    // 保存设置
    async saveSettings() {
      try {
        await saveThreeDReadingSettings(this.settings)
      } catch (error) {
        console.error('保存设置失败:', error)
      }
    },
    
    // 加载统计数据
    async loadStatistics() {
      try {
        const stats = await getSpeedReadingStats()
        const threeDStats = stats.threeDReading
        
        this.statistics.totalSessions = threeDStats.totalSessions
        this.statistics.averageAccuracy = threeDStats.averageAccuracy
        this.statistics.averageTime = threeDStats.averageTime
        this.statistics.totalTime = threeDStats.totalTime
        this.statistics.stereoVision = threeDStats.stereoVision
        this.statistics.spatialPerception = threeDStats.spatialPerception
        this.statistics.depthPerception = threeDStats.depthPerception
        this.statistics.visualFocus = threeDStats.visualFocus
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },
    
    // 返回上级页面
    goBack() {
      this.$emit('go-back')
    }
  },
  
  watch: {
    settings: {
      async handler() {
        await this.saveSettings()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.threed-reading-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  min-height: 100vh;
  color: #333;
}

/* 页面头部 */
.page-header {
  position: relative;
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) translateX(-2px);
}

.back-arrow {
  font-size: 16px;
  font-weight: bold;
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
  border-color: #2c3e50;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: white;
}

.mode-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: #2c3e50;
}

.mode-card.active .mode-icon {
  color: white;
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
  background: linear-gradient(135deg, #2c3e50, #34495e);
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
  box-shadow: 0 5px 15px rgba(44, 62, 80, 0.4);
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
  background: #2c3e50;
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
  background: #34495e;
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

/* 3D图显示区域 */
.threed-display {
  background: #000;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 30px;
  min-height: 500px;
  position: relative;
  perspective: 1000px;
  transition: all 0.3s ease;
}

/* 背景颜色变体 */
.threed-display.bg-black {
  background: #000;
}

.threed-display.bg-white {
  background: #fff;
  color: #333;
}

.threed-display.bg-gray {
  background: #666;
}

.threed-display.bg-dark-blue {
  background: #1a237e;
}

/* 对比度变体 */
.threed-display.contrast-low {
  filter: contrast(0.8);
}

.threed-display.contrast-medium {
  filter: contrast(1.0);
}

.threed-display.contrast-high {
  filter: contrast(1.3);
}

.threed-display.contrast-ultra {
  filter: contrast(1.6);
}

.display-area {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.countdown {
  font-size: 4rem;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 20px rgba(255,255,255,0.5);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.threed-image {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-container {
  width: 400px;
  height: 300px;
  position: relative;
  border: 2px solid #fff;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 图像大小变体 */
.image-container.size-small {
  width: 300px;
  height: 225px;
}

.image-container.size-medium {
  width: 400px;
  height: 300px;
}

.image-container.size-large {
  width: 500px;
  height: 375px;
}

.image-container.size-extra-large {
  width: 600px;
  height: 450px;
}

/* 深度层特效 */
.depth-layer.blur-effect {
  filter: blur(1px);
}

.depth-layer.rotation-effect {
  animation: rotate 4s linear infinite;
}

.depth-layer.pulse-effect {
  animation: pulse 2s ease-in-out infinite;
}

/* 动画速度变体 */
.depth-layer.anim-slow {
  transition: all 1s ease;
}

.depth-layer.anim-normal {
  transition: all 0.5s ease;
}

.depth-layer.anim-fast {
  transition: all 0.2s ease;
}

.depth-layer.anim-instant {
  transition: none;
}

/* 关键帧动画 */
@keyframes rotate {
  from { transform: rotateY(0deg); }
  to { transform: rotateY(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

.stereo-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  transform-style: preserve-3d;
}

.depth-layers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.depth-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  transition: all 0.5s ease;
}

.focus-guide {
  margin-top: 20px;
  text-align: center;
  color: #fff;
}

.guide-dot {
  width: 10px;
  height: 10px;
  background: #fff;
  border-radius: 50%;
  margin: 0 auto 10px;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.focus-guide p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
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
}

/* 问题回答区域 */
.question-area {
  background: #fff;
  border-radius: 10px;
  padding: 30px;
  color: #333;
}

.question-area h3 {
  text-align: center;
  margin-bottom: 25px;
  color: #2c3e50;
}

.question-content p {
  font-size: 1.2rem;
  margin-bottom: 25px;
  font-weight: bold;
  text-align: center;
}

.answer-options {
  display: grid;
  gap: 15px;
  margin-bottom: 25px;
}

.option-btn {
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.option-btn:hover {
  border-color: #2c3e50;
  background: #f8f9fa;
}

.option-btn.selected {
  border-color: #2c3e50;
  background: #2c3e50;
  color: white;
}

.answer-input {
  margin-bottom: 25px;
}

.answer-input input {
  width: 100%;
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1.1rem;
  transition: border-color 0.3s ease;
}

.answer-input input:focus {
  outline: none;
  border-color: #2c3e50;
}

.answer-drawing {
  text-align: center;
  margin-bottom: 25px;
}

.answer-drawing canvas {
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: crosshair;
  background: white;
}

.drawing-controls {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.drawing-controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.drawing-controls button:hover {
  background: #f8f9fa;
  border-color: #2c3e50;
}

.submit-btn {
  display: block;
  margin: 0 auto;
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

/* 训练提示 */
.training-tips {
  background: #e8f4fd;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.training-tips h4 {
  color: #2c3e50;
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
  background: linear-gradient(135deg, #2c3e50, #34495e);
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.settings-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.settings-section h3 {
  margin: 0 0 15px 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #2c3e50;
  padding-bottom: 8px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-group label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.setting-group input,
.setting-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.setting-group input:focus,
.setting-group select:focus {
  outline: none;
  border-color: #2c3e50;
  box-shadow: 0 0 0 2px rgba(44, 62, 80, 0.25);
}

.setting-group input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  padding: 0;
  margin: 5px 0;
}

.setting-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2c3e50;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.setting-group input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2c3e50;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.setting-group select {
  background: white;
  cursor: pointer;
}

.setting-group input[type="checkbox"] {
  width: auto;
  height: auto;
  transform: scale(1.2);
  accent-color: #2c3e50;
  margin: 0;
  padding: 0;
}

.setting-group span {
  font-weight: 600;
  color: #2c3e50;
  font-size: 13px;
  text-align: center;
  background: #e7f3ff;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  min-width: 60px;
  margin-top: 5px;
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
  border-bottom: 2px solid #2c3e50;
  padding-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(44, 62, 80, 0.3);
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
  color: #2c3e50;
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
  background: linear-gradient(90deg, #2c3e50, #34495e);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.ability-score {
  min-width: 50px;
  text-align: right;
  font-weight: bold;
  color: #2c3e50;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .threed-reading-container {
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
  
  .performance-item {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .performance-stats {
    justify-content: space-around;
  }
  
  .image-container {
    width: 300px;
    height: 225px;
  }
  
  .answer-drawing canvas {
    width: 300px;
    height: 200px;
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
  
  .image-container {
    width: 250px;
    height: 188px;
  }
  
  .answer-drawing canvas {
    width: 250px;
    height: 150px;
  }
  
  .countdown {
    font-size: 3rem;
  }
}
</style>