<template>
  <div class="brainwave-generator-container">

    <div class="brainwave-player">
      <div class="player-card">
        <div class="wave-info">
          <h3>{{ currentWave.name }}</h3>
          <p class="wave-description">{{ currentWave.description }}</p>
          <div class="wave-meta">
            <span class="frequency">🌊 {{ currentWave.frequency }}</span>
            <span class="state">🧠 {{ currentWave.state }}</span>
            <span class="benefit">✨ {{ currentWave.benefit }}</span>
          </div>
        </div>
        
        <div class="wave-visualizer">
          <canvas ref="visualizerCanvas" class="visualizer-canvas"></canvas>
          <div class="frequency-display">
            <span class="current-freq">{{ currentFrequency.toFixed(1) }} Hz</span>
          </div>
        </div>
        
        <div class="player-controls">
          <div class="session-timer">
            <div class="timer-display">
              <span class="time-remaining">{{ formatTime(timeRemaining) }}</span>
              <span class="session-duration">/ {{ formatTime(sessionDuration * 60) }}</span>
            </div>
            <div class="timer-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: sessionProgressPercentage + '%' }"></div>
              </div>
            </div>
          </div>
          
          <div class="control-buttons">
            <button class="control-btn" @click="previousWave" :disabled="currentWaveIndex === 0">
              ⏮️
            </button>
            <button class="play-pause-btn" @click="togglePlayPause">
              {{ isPlaying ? '⏸️' : '▶️' }}
            </button>
            <button class="control-btn" @click="nextWave" :disabled="currentWaveIndex === brainwaves.length - 1">
              ⏭️
            </button>
          </div>
          
          <div class="audio-controls">
            <div class="volume-control">
              <span class="volume-icon">🔊</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                v-model="volume" 
                class="volume-slider"
                @input="updateVolume"
              >
              <span class="volume-value">{{ volume }}%</span>
            </div>
            
            <div class="frequency-control">
              <label>频率调节：</label>
              <input 
                type="range" 
                :min="currentWave.minFreq" 
                :max="currentWave.maxFreq" 
                :step="0.1"
                v-model="currentFrequency" 
                class="frequency-slider"
                @input="updateFrequency"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="brainwave-library">
      <h3>脑波类型</h3>
      <div class="wave-grid">
        <div 
          v-for="(wave, index) in brainwaves" 
          :key="wave.id"
          class="wave-card"
          :class="{ active: currentWaveIndex === index }"
          @click="selectWave(index)"
        >
          <div class="wave-header">
            <div class="wave-icon" :style="{ color: wave.color }">{{ wave.icon }}</div>
            <div class="wave-indicator" v-if="currentWaveIndex === index && isPlaying">
              <div class="wave-animation"></div>
            </div>
          </div>
          
          <h4>{{ wave.name }}</h4>
          <p class="wave-freq">{{ wave.frequency }}</p>
          <p class="wave-state">{{ wave.state }}</p>
          
          <div class="wave-benefits">
            <h5>主要效果：</h5>
            <ul>
              <li v-for="benefit in wave.benefits" :key="benefit">{{ benefit }}</li>
            </ul>
          </div>
          
          <div class="wave-stats">
            <div class="stat-item">
              <span class="stat-label">使用次数：</span>
              <span class="stat-value">{{ wave.usageCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">总时长：</span>
              <span class="stat-value">{{ wave.totalMinutes || 0 }}分钟</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="session-settings">
      <h3>会话设置</h3>
      <div class="settings-grid">
        <div class="setting-card">
          <h4>⏰ 时间设置</h4>
          <div class="setting-item">
            <label>会话时长（分钟）：</label>
            <input 
              type="number" 
              v-model="sessionDuration" 
              min="5" 
              max="120" 
              class="number-input"
            >
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.autoStop">
              时间到自动停止
            </label>
          </div>
        </div>
        
        <div class="setting-card">
          <h4>🎵 音频设置</h4>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.binauralBeats">
              启用双耳节拍
            </label>
          </div>
          <div class="setting-item">
            <label>载波频率（Hz）：</label>
            <input 
              type="range" 
              min="200" 
              max="1000" 
              step="10"
              v-model="settings.carrierFreq" 
              class="frequency-slider"
              @input="updateFrequency"
            >
            <span class="frequency-value">{{ settings.carrierFreq }} Hz</span>
            <p class="setting-description">载波频率决定基础音调高低，建议范围200-1000Hz</p>
          </div>
          <div class="setting-item">
            <label>背景音类型：</label>
            <select v-model="settings.backgroundSound" class="select-input">
              <option value="none">无背景音</option>
              <option value="rain">雨声</option>
              <option value="ocean">海浪声</option>
              <option value="forest">森林声</option>
              <option value="white-noise">白噪音</option>
            </select>
          </div>
          <div class="setting-item">
            <label>背景音音量：</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              v-model="settings.backgroundVolume" 
              class="volume-slider"
            >
            <span class="volume-value">{{ settings.backgroundVolume }}%</span>
          </div>
        </div>
        
        <div class="setting-card">
          <h4>🎯 训练模式</h4>
          <div class="setting-item">
            <label class="setting-label">
              <input type="radio" v-model="settings.mode" value="single">
              单一频率模式
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="radio" v-model="settings.mode" value="sweep">
              频率扫描模式
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="radio" v-model="settings.mode" value="binaural">
              双耳节拍模式
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="training-programs">
      <h3>训练计划</h3>
      <div class="programs-grid">
        <div 
          v-for="program in trainingPrograms" 
          :key="program.id"
          class="program-card"
          @click="startProgram(program)"
        >
          <div class="program-header">
            <div class="program-icon">{{ program.icon }}</div>
            <div class="program-level" :class="program.level">
              {{ getLevelText(program.level) }}
            </div>
          </div>
          
          <h4>{{ program.name }}</h4>
          <p class="program-description">{{ program.description }}</p>
          
          <div class="program-details">
            <div class="detail-item">
              <span class="detail-label">总时长：</span>
              <span class="detail-value">{{ program.totalDuration }}分钟</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">阶段数：</span>
              <span class="detail-value">{{ program.stages.length }}个</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">频率范围：</span>
              <span class="detail-value">{{ program.frequencyRange }}</span>
            </div>
          </div>
          
          <div class="program-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (program.completedSessions / program.totalSessions) * 100 + '%' }"></div>
            </div>
            <span class="progress-text">{{ program.completedSessions }}/{{ program.totalSessions }} 完成</span>
          </div>
          
          <button class="start-program-btn">
            {{ program.completedSessions === 0 ? '开始训练' : '继续训练' }}
          </button>
        </div>
      </div>
    </div>

    <div class="usage-analytics">
      <h3>使用分析</h3>
      <div class="analytics-grid">
        <div class="analytics-card">
          <div class="analytics-header">
            <h4>📊 使用统计</h4>
            <select v-model="analyticsTimeRange" class="time-range-select">
              <option value="week">最近一周</option>
              <option value="month">最近一月</option>
              <option value="quarter">最近三月</option>
            </select>
          </div>
          
          <div class="stats-overview">
            <div class="stat-item">
              <div class="stat-icon">⏱️</div>
              <div class="stat-info">
                <span class="stat-value">{{ totalUsageMinutes }}</span>
                <span class="stat-label">总使用时长（分钟）</span>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">🎯</div>
              <div class="stat-info">
                <span class="stat-value">{{ totalSessions }}</span>
                <span class="stat-label">总会话次数</span>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">🌊</div>
              <div class="stat-info">
                <span class="stat-value">{{ favoriteWave }}</span>
                <span class="stat-label">最常用脑波</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="analytics-card">
          <h4>📈 频率使用分布</h4>
          <div class="frequency-chart">
            <div class="chart-bars">
              <div 
                v-for="(usage, freq) in frequencyUsage" 
                :key="freq"
                class="chart-bar"
                :style="{ height: (usage / maxUsage) * 100 + '%' }"
                :title="`${freq}: ${usage}次`"
              >
                <span class="bar-label">{{ freq }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="analytics-card">
          <h4>🎯 效果评估</h4>
          <div class="effect-ratings">
            <div class="rating-item">
              <span class="rating-label">专注力提升：</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= effectRatings.focus }">⭐</span>
              </div>
            </div>
            
            <div class="rating-item">
              <span class="rating-label">放松程度：</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= effectRatings.relaxation }">⭐</span>
              </div>
            </div>
            
            <div class="rating-item">
              <span class="rating-label">睡眠质量：</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= effectRatings.sleep }">⭐</span>
              </div>
            </div>
            
            <div class="rating-item">
              <span class="rating-label">创造力：</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= effectRatings.creativity }">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 会话完成弹窗 -->
    <div v-if="showSessionComplete" class="modal-overlay" @click="closeSessionModal">
      <div class="session-modal" @click.stop>
        <div class="modal-header">
          <h3>🎉 会话完成</h3>
          <button class="close-btn" @click="closeSessionModal">×</button>
        </div>
        
        <div class="modal-content">
          <p>您已完成 {{ sessionDuration }} 分钟的脑波训练！</p>
          
          <div class="session-summary">
            <div class="summary-item">
              <span class="summary-label">使用脑波：</span>
              <span class="summary-value">{{ currentWave.name }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">平均频率：</span>
              <span class="summary-value">{{ averageFrequency.toFixed(1) }} Hz</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">训练时长：</span>
              <span class="summary-value">{{ sessionDuration }}分钟</span>
            </div>
          </div>
          
          <div class="effect-feedback">
            <h4>请评价本次训练效果：</h4>
            <div class="feedback-options">
              <button 
                v-for="option in feedbackOptions" 
                :key="option.value"
                class="feedback-btn"
                :class="{ selected: sessionFeedback === option.value }"
                @click="sessionFeedback = option.value"
              >
                {{ option.icon }} {{ option.label }}
              </button>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="secondary-btn" @click="closeSessionModal">完成</button>
            <button class="primary-btn" @click="startNewSession">再来一次</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useTrainingStore } from '../../stores';
import { audioEngine, audioUtils } from '../../utils/audioUtils';

const emit = defineEmits(['back']);

const trainingStore = useTrainingStore();

// 播放器状态
const isPlaying = ref(false);
const currentWaveIndex = ref(0);
const currentFrequency = ref(10);
const volume = ref(70);
const sessionDuration = ref(20);
const timeRemaining = ref(0);
const averageFrequency = ref(0);
const audioInitialized = ref(false);
const audioError = ref('');

// 可视化
const visualizerCanvas = ref(null);
let animationId = null;
let currentAudioNodes = null;

// 设置
const settings = ref({
  // 基础设置
  autoStop: true,
  backgroundSound: 'none',
  backgroundVolume: 30,
  mode: 'single',
  
  // 音频设置
  waveType: 'sine',
  binauralBeats: true,
  binauralBeatFreq: 10,
  carrierFreq: 440,
  fadeInTime: 5,
  fadeOutTime: 5,
  
  // 视觉设置
  visualizerType: 'wave',
  visualizerColor: 'auto',
  showFrequency: true,
  showTimer: true,
  fullscreenMode: false,
  
  // 训练设置
  adaptiveFrequency: false,
  progressiveTraining: true,
  sessionReminders: true,
  reminderInterval: 5,
  
  // 个性化设置
  preferredPrograms: [],
  customFrequencies: [],
  sessionGoals: {
    daily: 30,
    weekly: 210,
    monthly: 900
  },
  
  // 高级设置
  eegIntegration: false,
  biofeedback: false,
  heartRateSync: false,
  breathingSync: false,
  
  // 安全设置
  maxVolume: 80,
  maxSessionTime: 60,
  epilepsyProtection: true,
  ageRestriction: false
});

// 分析数据
const analyticsTimeRange = ref('month');
const totalUsageMinutes = ref(0);
const totalSessions = ref(0);
const favoriteWave = ref('Alpha波');
const frequencyUsage = ref({});
const maxUsage = ref(0);
const effectRatings = ref({
  focus: 4,
  relaxation: 5,
  sleep: 3,
  creativity: 4
});

// 弹窗状态
const showSessionComplete = ref(false);
const sessionFeedback = ref('');

// 脑波数据
const brainwaves = ref([
  {
    id: 1,
    name: 'Delta波',
    frequency: '0.5-4 Hz',
    minFreq: 0.5,
    maxFreq: 4,
    state: '深度睡眠',
    benefit: '恢复性睡眠',
    description: 'Delta波是最慢的脑波，主要在深度睡眠时出现，有助于身体修复和记忆巩固。',
    icon: '🌙',
    color: '#4c1d95',
    benefits: ['改善睡眠质量', '促进身体恢复', '增强免疫力', '记忆巩固'],
    usageCount: 0,
    totalMinutes: 0
  },
  {
    id: 2,
    name: 'Theta波',
    frequency: '4-8 Hz',
    minFreq: 4,
    maxFreq: 8,
    state: '深度冥想',
    benefit: '创造力激发',
    description: 'Theta波出现在深度冥想和REM睡眠期间，能够激发创造力和直觉思维。',
    icon: '🧘',
    color: '#7c3aed',
    benefits: ['激发创造力', '增强直觉', '深度放松', '情绪治愈'],
    usageCount: 0,
    totalMinutes: 0
  },
  {
    id: 3,
    name: 'Alpha波',
    frequency: '8-12 Hz',
    minFreq: 8,
    maxFreq: 12,
    state: '放松专注',
    benefit: '平静警觉',
    description: 'Alpha波是放松但警觉状态的标志，有助于学习、冥想和创造性思维。',
    icon: '🌊',
    color: '#3b82f6',
    benefits: ['提升学习能力', '减少焦虑', '增强专注力', '促进冥想'],
    usageCount: 0,
    totalMinutes: 0
  },
  {
    id: 4,
    name: 'Beta波',
    frequency: '12-30 Hz',
    minFreq: 12,
    maxFreq: 30,
    state: '清醒思考',
    benefit: '逻辑分析',
    description: 'Beta波在正常清醒状态下占主导，有助于逻辑思维、问题解决和日常活动。',
    icon: '⚡',
    color: '#10b981',
    benefits: ['提升逻辑思维', '增强注意力', '改善决策能力', '提高工作效率'],
    usageCount: 0,
    totalMinutes: 0
  },
  {
    id: 5,
    name: 'Gamma波',
    frequency: '30-100 Hz',
    minFreq: 30,
    maxFreq: 100,
    state: '高度专注',
    benefit: '认知增强',
    description: 'Gamma波与高级认知功能相关，包括意识整合、学习和记忆形成。',
    icon: '🔥',
    color: '#f59e0b',
    benefits: ['增强认知能力', '提升意识水平', '改善记忆', '促进学习'],
    usageCount: 0,
    totalMinutes: 0
  }
]);

// 训练计划
const trainingPrograms = ref([
  {
    id: 1,
    name: '专注力提升计划',
    description: '通过Alpha和Beta波训练，逐步提升专注力和工作效率',
    icon: '🎯',
    level: 'beginner',
    totalDuration: 60,
    totalSessions: 10,
    completedSessions: 0,
    frequencyRange: '8-20 Hz',
    benefits: ['提升专注力', '改善工作效率', '增强注意力持久性'],
    targetAudience: '学生、上班族、需要提升专注力的人群',
    stages: [
      { name: 'Alpha波基础', duration: 20, frequency: '8-12 Hz', description: '建立基础专注状态' },
      { name: 'Beta波训练', duration: 25, frequency: '12-20 Hz', description: '强化清醒专注能力' },
      { name: '综合训练', duration: 15, frequency: '8-20 Hz', description: '整合训练效果' }
    ]
  },
  {
    id: 2,
    name: '深度放松计划',
    description: '结合Theta和Alpha波，达到深度放松和压力释放',
    icon: '🌊',
    level: 'intermediate',
    totalDuration: 45,
    totalSessions: 8,
    completedSessions: 0,
    frequencyRange: '4-12 Hz',
    benefits: ['深度放松', '压力释放', '情绪平衡', '内心平静'],
    targetAudience: '高压人群、焦虑症患者、需要放松的人群',
    stages: [
      { name: 'Alpha波放松', duration: 15, frequency: '8-12 Hz', description: '初步放松身心' },
      { name: 'Theta波深入', duration: 20, frequency: '4-8 Hz', description: '进入深度放松状态' },
      { name: '回归整合', duration: 10, frequency: '8-12 Hz', description: '平稳回到清醒状态' }
    ]
  },
  {
    id: 3,
    name: '创造力激发计划',
    description: '通过Theta波训练，激发创造性思维和直觉能力',
    icon: '💡',
    level: 'advanced',
    totalDuration: 50,
    totalSessions: 12,
    completedSessions: 0,
    frequencyRange: '4-8 Hz',
    benefits: ['激发创造力', '增强直觉', '突破思维局限', '艺术灵感'],
    targetAudience: '艺术家、设计师、创意工作者、研究人员',
    stages: [
      { name: '意识放松', duration: 10, frequency: '8-12 Hz', description: '放松理性思维' },
      { name: 'Theta波探索', duration: 30, frequency: '4-8 Hz', description: '深入潜意识创造空间' },
      { name: '创意整合', duration: 10, frequency: '8-12 Hz', description: '整合创意灵感' }
    ]
  },
  {
    id: 4,
    name: '睡眠改善计划',
    description: '使用Delta和Theta波，改善睡眠质量和入睡速度',
    icon: '🌙',
    level: 'beginner',
    totalDuration: 40,
    totalSessions: 15,
    completedSessions: 0,
    frequencyRange: '0.5-8 Hz',
    benefits: ['改善睡眠质量', '快速入睡', '深度睡眠', '睡眠恢复'],
    targetAudience: '失眠患者、睡眠质量差的人群、倒班工作者',
    stages: [
      { name: 'Alpha波过渡', duration: 10, frequency: '8-12 Hz', description: '从清醒过渡到放松' },
      { name: 'Theta波深化', duration: 15, frequency: '4-8 Hz', description: '进入浅睡眠状态' },
      { name: 'Delta波入睡', duration: 15, frequency: '0.5-4 Hz', description: '进入深度睡眠' }
    ]
  },
  {
    id: 5,
    name: '学习记忆强化',
    description: '优化大脑学习状态，提升记忆力和信息处理能力',
    icon: '🧠',
    level: 'intermediate',
    totalDuration: 35,
    totalSessions: 12,
    completedSessions: 0,
    frequencyRange: '8-40 Hz',
    benefits: ['提升记忆力', '增强学习效率', '信息整合', '知识巩固'],
    targetAudience: '学生、研究人员、需要大量学习的人群',
    stages: [
      { name: 'Alpha波准备', duration: 10, frequency: '8-12 Hz', description: '准备学习状态' },
      { name: 'Beta波学习', duration: 15, frequency: '12-30 Hz', description: '最佳学习频率' },
      { name: 'Gamma波整合', duration: 10, frequency: '30-40 Hz', description: '信息整合巩固' }
    ]
  },
  {
    id: 6,
    name: '冥想深化训练',
    description: '通过特定脑波引导，达到更深层的冥想状态',
    icon: '🧘‍♂️',
    level: 'advanced',
    totalDuration: 55,
    totalSessions: 16,
    completedSessions: 0,
    frequencyRange: '4-12 Hz',
    benefits: ['深度冥想', '意识扩展', '内在平静', '精神成长'],
    targetAudience: '冥想练习者、精神修行者、瑜伽爱好者',
    stages: [
      { name: 'Alpha波入定', duration: 15, frequency: '8-12 Hz', description: '建立冥想基础' },
      { name: 'Theta波深入', duration: 25, frequency: '4-8 Hz', description: '进入深度冥想' },
      { name: '意识回归', duration: 15, frequency: '8-12 Hz', description: '平稳回到日常意识' }
    ]
  },
  {
    id: 7,
    name: '情绪调节计划',
    description: '通过脑波调节帮助稳定情绪，减少焦虑和抑郁',
    icon: '💚',
    level: 'beginner',
    totalDuration: 30,
    totalSessions: 10,
    completedSessions: 0,
    frequencyRange: '6-12 Hz',
    benefits: ['情绪稳定', '减少焦虑', '心情愉悦', '内在平衡'],
    targetAudience: '情绪波动大的人群、焦虑症患者、抑郁症辅助治疗',
    stages: [
      { name: '情绪识别', duration: 10, frequency: '8-12 Hz', description: '觉察当前情绪状态' },
      { name: '情绪调节', duration: 15, frequency: '6-10 Hz', description: '调节到平衡状态' },
      { name: '情绪稳定', duration: 5, frequency: '8-12 Hz', description: '巩固平衡状态' }
    ]
  },
  {
    id: 8,
    name: '能量提升计划',
    description: '激活大脑活力，提升精神能量和生命活力',
    icon: '⚡',
    level: 'intermediate',
    totalDuration: 25,
    totalSessions: 8,
    completedSessions: 0,
    frequencyRange: '12-40 Hz',
    benefits: ['提升活力', '增强精神', '消除疲劳', '激发潜能'],
    targetAudience: '疲劳人群、精神不振者、需要提升活力的人群',
    stages: [
      { name: 'Beta波激活', duration: 10, frequency: '12-30 Hz', description: '激活大脑活力' },
      { name: 'Gamma波增强', duration: 10, frequency: '30-40 Hz', description: '提升认知能量' },
      { name: '能量整合', duration: 5, frequency: '12-20 Hz', description: '整合能量状态' }
    ]
  }
]);

// 反馈选项
const feedbackOptions = ref([
  { value: 'excellent', label: '非常好', icon: '😊' },
  { value: 'good', label: '不错', icon: '🙂' },
  { value: 'average', label: '一般', icon: '😐' },
  { value: 'poor', label: '不太好', icon: '😕' }
]);

// 计算属性
const currentWave = computed(() => brainwaves.value[currentWaveIndex.value]);

const sessionProgressPercentage = computed(() => {
  const totalSeconds = sessionDuration.value * 60;
  const elapsedSeconds = totalSeconds - timeRemaining.value;
  return (elapsedSeconds / totalSeconds) * 100;
});

// 方法
const togglePlayPause = () => {
  if (isPlaying.value) {
    stopSession();
  } else {
    startSession();
  }
};

const startSession = async () => {
  isPlaying.value = true;
  timeRemaining.value = sessionDuration.value * 60;
  currentFrequency.value = currentWave.value.minFreq + (currentWave.value.maxFreq - currentWave.value.minFreq) / 2;
  
  await initAudioContext();
  if (audioInitialized.value) {
    startVisualization();
    startTimer();
  } else {
    isPlaying.value = false;
  }
};

const stopSession = () => {
  isPlaying.value = false;
  stopAudioContext();
  stopVisualization();
  stopTimer();
};

const initAudioContext = async () => {
  try {
    audioInitialized.value = false;
    audioError.value = null;
    
    await audioEngine.initialize();
    
    if (settings.value.binauralBeats && settings.value.mode === 'binaural') {
      currentAudioNodes.value = await audioEngine.createBinauralBeats(
        settings.value.carrierFreq,
        currentFrequency.value,
        volume.value / 100
      );
    } else {
      currentAudioNodes.value = await audioEngine.createTone(
        settings.value.carrierFreq + currentFrequency.value,
        volume.value / 100
      );
    }
    
    audioInitialized.value = true;
  } catch (error) {
    console.error('音频初始化失败:', error);
    audioError.value = error.message;
  }
};

const stopAudioContext = () => {
  try {
    if (currentAudioNodes.value) {
      audioEngine.stopAudio(currentAudioNodes.value);
      currentAudioNodes.value = null;
    }
    audioInitialized.value = false;
  } catch (error) {
    console.error('停止音频失败:', error);
  }
};

const updateFrequency = () => {
  try {
    if (currentAudioNodes.value && audioInitialized.value) {
      if (settings.value.binauralBeats && settings.value.mode === 'binaural') {
        audioEngine.updateBinauralFrequency(
          currentAudioNodes.value,
          settings.value.carrierFreq,
          currentFrequency.value
        );
      } else {
        audioEngine.updateFrequency(
          currentAudioNodes.value,
          settings.value.carrierFreq + currentFrequency.value
        );
      }
    }
  } catch (error) {
    console.error('更新频率失败:', error);
  }
};

const updateVolume = () => {
  try {
    if (currentAudioNodes.value && audioInitialized.value) {
      audioEngine.updateVolume(currentAudioNodes.value, volume.value / 100);
    }
  } catch (error) {
    console.error('更新音量失败:', error);
  }
};

const startVisualization = () => {
  const canvas = visualizerCanvas.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  const animate = () => {
    if (!isPlaying.value) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制波形
    const centerY = canvas.height / 2;
    const amplitude = 50;
    const frequency = currentFrequency.value / 10;
    const time = Date.now() / 1000;
    
    ctx.strokeStyle = currentWave.value.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let x = 0; x < canvas.width; x++) {
      const y = centerY + amplitude * Math.sin((x / canvas.width) * frequency * Math.PI * 2 + time * frequency);
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
};

const stopVisualization = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};

const startTimer = () => {
  const timer = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      clearInterval(timer);
      completeSession();
    }
  }, 1000);
};

const stopTimer = () => {
  // Timer is cleared in startTimer when timeRemaining reaches 0
};

const completeSession = () => {
  stopSession();
  
  // 更新统计数据
  const wave = brainwaves.value[currentWaveIndex.value];
  wave.usageCount++;
  wave.totalMinutes += sessionDuration.value;
  
  totalSessions.value++;
  totalUsageMinutes.value += sessionDuration.value;
  
  // 计算平均频率
  averageFrequency.value = currentFrequency.value;
  
  // 保存数据
  saveBrainwaveData();
  
  // 显示完成弹窗
  showSessionComplete.value = true;
};

const selectWave = async (index) => {
  currentWaveIndex.value = index;
  const wave = brainwaves.value[index];
  currentFrequency.value = wave.minFreq + (wave.maxFreq - wave.minFreq) / 2;
  
  if (isPlaying.value) {
    stopSession();
    await nextTick();
    await startSession();
  }
};

const previousWave = () => {
  if (currentWaveIndex.value > 0) {
    selectWave(currentWaveIndex.value - 1);
  }
};

const nextWave = () => {
  if (currentWaveIndex.value < brainwaves.value.length - 1) {
    selectWave(currentWaveIndex.value + 1);
  }
};

const startProgram = (program) => {
  // 实现训练计划逻辑
  console.log('开始训练计划:', program.name);
};

const getLevelText = (level) => {
  const levelMap = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  };
  return levelMap[level] || '中级';
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const closeSessionModal = () => {
  showSessionComplete.value = false;
  sessionFeedback.value = '';
};

const startNewSession = () => {
  closeSessionModal();
  startSession();
};

// 数据持久化
const saveBrainwaveData = () => {
  const data = {
    brainwaves: brainwaves.value,
    settings: settings.value,
    programs: trainingPrograms.value,
    analytics: {
      totalUsageMinutes: totalUsageMinutes.value,
      totalSessions: totalSessions.value,
      favoriteWave: favoriteWave.value,
      frequencyUsage: frequencyUsage.value,
      effectRatings: effectRatings.value
    }
  };
  
  trainingStore.saveMeditationModuleData('brainwave-generator', data);
};

const loadBrainwaveData = () => {
  const data = trainingStore.getMeditationModuleData('brainwave-generator');
  
  if (data) {
    if (data.brainwaves) {
      brainwaves.value = data.brainwaves;
    }
    if (data.settings) {
      settings.value = { ...settings.value, ...data.settings };
    }
    if (data.programs) {
      trainingPrograms.value = data.programs;
    }
    if (data.analytics) {
      totalUsageMinutes.value = data.analytics.totalUsageMinutes || 0;
      totalSessions.value = data.analytics.totalSessions || 0;
      favoriteWave.value = data.analytics.favoriteWave || 'Alpha波';
      frequencyUsage.value = data.analytics.frequencyUsage || {};
      effectRatings.value = { ...effectRatings.value, ...data.analytics.effectRatings };
    }
  }
  
  // 生成模拟使用数据
  generateMockData();
};

const generateMockData = () => {
  // 生成频率使用数据
  const frequencies = ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'];
  frequencies.forEach(freq => {
    frequencyUsage.value[freq] = Math.floor(Math.random() * 50) + 10;
  });
  
  maxUsage.value = Math.max(...Object.values(frequencyUsage.value));
};

// 生命周期
onMounted(() => {
  loadBrainwaveData();
});

onUnmounted(() => {
  stopSession();
  if (audioContext) {
    audioContext.close();
  }
});
</script>

<style scoped>
.brainwave-generator-container {
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

.brainwave-player {
  margin-bottom: 3rem;
}

.player-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  border: 2px solid rgba(var(--color-primary-rgb), 0.1);
}

.wave-info {
  text-align: center;
  margin-bottom: 2rem;
}

.wave-info h3 {
  color: var(--color-primary);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.wave-description {
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.wave-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.wave-meta span {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.wave-visualizer {
  position: relative;
  margin-bottom: 2rem;
}

.visualizer-canvas {
  width: 100%;
  height: 150px;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
}

.frequency-display {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(var(--color-primary-rgb), 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
}

.session-timer {
  margin-bottom: 1.5rem;
}

.timer-display {
  text-align: center;
  margin-bottom: 0.5rem;
}

.time-remaining {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary);
}

.session-duration {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
}

.timer-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.control-btn, .play-pause-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-pause-btn {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
}

.control-btn:hover, .play-pause-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.control-btn:disabled {
  background: var(--color-border);
  cursor: not-allowed;
  transform: none;
}

.audio-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.volume-control, .frequency-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.volume-slider, .frequency-slider {
  width: 200px;
  height: 6px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb, .frequency-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
}

.volume-value {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  min-width: 40px;
}

.brainwave-library {
  margin-bottom: 3rem;
}

.brainwave-library h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.wave-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.wave-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  border: 2px solid transparent;
}

.wave-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.wave-card.active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.wave-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.wave-icon {
  font-size: 2rem;
}

.wave-indicator {
  position: relative;
}

.wave-animation {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

.wave-card h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.wave-freq {
  color: var(--color-info);
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.wave-state {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  font-style: italic;
}

.wave-benefits {
  margin-bottom: 1rem;
}

.wave-benefits h5 {
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.wave-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.wave-benefits li {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  padding: 0.2rem 0;
  position: relative;
  padding-left: 1rem;
}

.wave-benefits li::before {
  content: '•';
  color: var(--color-primary);
  position: absolute;
  left: 0;
}

.wave-stats {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.stat-label {
  color: var(--color-text-secondary);
}

.stat-value {
  color: var(--color-primary);
  font-weight: 600;
}

.session-settings {
  margin-bottom: 3rem;
}

.session-settings h3 {
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

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  cursor: pointer;
}

.setting-item label {
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

.setting-description {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
  margin-bottom: 0;
  line-height: 1.4;
}

.frequency-value {
  font-size: 0.9rem;
  color: var(--color-primary);
  font-weight: 600;
  min-width: 60px;
}

.number-input, .select-input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
  width: 100%;
}

.training-programs {
  margin-bottom: 3rem;
}

.training-programs h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.program-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  border: 2px solid transparent;
}

.program-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.program-icon {
  font-size: 2rem;
}

.program-level {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.program-level.beginner {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.program-level.intermediate {
  background: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning);
}

.program-level.advanced {
  background: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
}

.program-card h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.program-description {
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.program-details {
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

.program-progress {
  margin-bottom: 1rem;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 0.5rem;
}

.start-program-btn {
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

.start-program-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.usage-analytics {
  margin-bottom: 3rem;
}

.usage-analytics h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.analytics-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.analytics-card h4 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.1rem;
}

.time-range-select {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.8rem;
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

.frequency-chart {
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
  width: 30px;
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
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.effect-ratings {
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

.session-modal {
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

.modal-content p {
  color: var(--color-text);
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.5;
}

.session-summary {
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  color: var(--color-text-secondary);
}

.summary-value {
  color: var(--color-primary);
  font-weight: 600;
}

.effect-feedback {
  margin-bottom: 1.5rem;
}

.effect-feedback h4 {
  color: var(--color-text);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.feedback-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.feedback-btn {
  padding: 0.6rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 0.8rem;
}

.feedback-btn:hover {
  border-color: var(--color-primary);
}

.feedback-btn.selected {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
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
  .brainwave-generator-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .wave-meta {
    gap: 1rem;
  }
  
  .audio-controls {
    align-items: stretch;
  }
  
  .volume-control, .frequency-control {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .volume-slider, .frequency-slider {
    width: 100%;
  }
  
  .wave-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .programs-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .feedback-options {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>