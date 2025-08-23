<template>
  <div class="metronome-container">

    <div class="metronome-player">
      <div class="player-card">
        <div class="metronome-display">
          <div class="tempo-info">
            <h3>{{ currentTempo }} BPM</h3>
            <p class="tempo-description">{{ getTempoDescription(currentTempo) }}</p>
          </div>
          
          <div class="visual-metronome">
            <div class="metronome-pendulum" :class="{ active: isPlaying }">
              <div class="pendulum-rod" :style="{ animationDuration: animationDuration + 's' }">
                <div class="pendulum-weight"></div>
              </div>
            </div>
            
            <div class="beat-indicator">
              <div 
                v-for="(beat, index) in beatsPerMeasure" 
                :key="index"
                class="beat-dot"
                :class="{ 
                  active: currentBeat === index + 1,
                  accent: index === 0 && currentBeat === 1
                }"
              >
                {{ index + 1 }}
              </div>
            </div>
            
            <div class="measure-counter">
              <span class="measure-label">小节：</span>
              <span class="measure-number">{{ currentMeasure }}</span>
            </div>
          </div>
          
          <div class="session-timer">
            <div class="timer-display">
              <span class="time-elapsed">{{ formatTime(timeElapsed) }}</span>
              <span class="session-duration">/ {{ formatTime(sessionDuration * 60) }}</span>
            </div>
            <div class="timer-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: sessionProgressPercentage + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="metronome-controls">
          <div class="tempo-control">
            <label>节拍速度 (BPM)：</label>
            <div class="tempo-input-group">
              <button class="tempo-btn" @click="decreaseTempo" :disabled="currentTempo <= 40">-</button>
              <input 
                type="number" 
                v-model="currentTempo" 
                min="40" 
                max="200" 
                class="tempo-input"
                @input="updateTempo"
              >
              <button class="tempo-btn" @click="increaseTempo" :disabled="currentTempo >= 200">+</button>
            </div>
            <input 
              type="range" 
              v-model="currentTempo" 
              min="40" 
              max="200" 
              class="tempo-slider"
              @input="updateTempo"
            >
          </div>
          
          <div class="time-signature-control">
            <label>拍号：</label>
            <select v-model="timeSignature" @change="updateTimeSignature" class="time-signature-select">
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="2/4">2/4</option>
              <option value="6/8">6/8</option>
            </select>
          </div>
          
          <div class="play-controls">
            <button class="control-btn" @click="togglePlayPause">
              {{ isPlaying ? '⏸️' : '▶️' }}
            </button>
            <button class="control-btn" @click="stopMetronome">⏹️</button>
            <button class="control-btn" @click="tapTempo">👆 Tap</button>
          </div>
          
          <div class="audio-settings">
            <div class="volume-control">
              <label>音量：</label>
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
            
            <div class="sound-selection">
              <label>节拍音效：</label>
              <select v-model="selectedSound" @change="updateSound" class="sound-select">
                <option value="click">咔嗒声</option>
                <option value="beep">蜂鸣声</option>
                <option value="wood">木块声</option>
                <option value="bell">铃声</option>
                <option value="drum">鼓声</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="preset-tempos">
      <h3>预设节拍</h3>
      <div class="presets-grid">
        <div 
          v-for="preset in tempoPresets" 
          :key="preset.id"
          class="preset-card"
          :class="{ active: currentTempo === preset.bpm }"
          @click="setPresetTempo(preset)"
        >
          <div class="preset-icon">{{ preset.icon }}</div>
          <h4>{{ preset.name }}</h4>
          <p class="preset-bpm">{{ preset.bpm }} BPM</p>
          <p class="preset-description">{{ preset.description }}</p>
          <div class="preset-benefits">
            <span v-for="benefit in preset.benefits" :key="benefit" class="benefit-tag">
              {{ benefit }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="training-modes">
      <h3>训练模式</h3>
      <div class="modes-grid">
        <div 
          v-for="mode in trainingModes" 
          :key="mode.id"
          class="mode-card"
          :class="{ active: currentMode === mode.id }"
          @click="selectMode(mode)"
        >
          <div class="mode-header">
            <div class="mode-icon">{{ mode.icon }}</div>
            <div class="mode-level" :class="mode.level">
              {{ getLevelText(mode.level) }}
            </div>
          </div>
          
          <h4>{{ mode.name }}</h4>
          <p class="mode-description">{{ mode.description }}</p>
          
          <div class="mode-details">
            <div class="detail-item">
              <span class="detail-label">时长：</span>
              <span class="detail-value">{{ mode.duration }}分钟</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">节拍范围：</span>
              <span class="detail-value">{{ mode.tempoRange }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">难度：</span>
              <span class="detail-value">{{ mode.difficulty }}</span>
            </div>
          </div>
          
          <div class="mode-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (mode.completedSessions / mode.totalSessions) * 100 + '%' }"></div>
            </div>
            <span class="progress-text">{{ mode.completedSessions }}/{{ mode.totalSessions }} 完成</span>
          </div>
          
          <button class="start-mode-btn">
            {{ mode.completedSessions === 0 ? '开始训练' : '继续训练' }}
          </button>
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
              max="60" 
              class="number-input"
            >
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.autoStop">
              时间到自动停止
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.countIn">
              开始前预备拍
            </label>
          </div>
        </div>
        
        <div class="setting-card">
          <h4>🎵 音频设置</h4>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.accentBeat">
              强拍重音
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.visualOnly">
              仅视觉模式
            </label>
          </div>
          <div class="setting-item">
            <label>节拍细分：</label>
            <select v-model="settings.subdivision" class="select-input">
              <option value="quarter">四分音符</option>
              <option value="eighth">八分音符</option>
              <option value="sixteenth">十六分音符</option>
            </select>
          </div>
        </div>
        
        <div class="setting-card">
          <h4>🎯 训练目标</h4>
          <div class="setting-item">
            <label class="setting-label">
              <input type="radio" v-model="settings.goal" value="focus">
              专注力训练
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="radio" v-model="settings.goal" value="rhythm">
              节奏感培养
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="radio" v-model="settings.goal" value="meditation">
              冥想辅助
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="usage-analytics">
      <h3>使用分析</h3>
      <div class="analytics-grid">
        <div class="analytics-card">
          <div class="analytics-header">
            <h4>📊 训练统计</h4>
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
                <span class="stat-value">{{ totalTrainingMinutes }}</span>
                <span class="stat-label">总训练时长（分钟）</span>
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
              <div class="stat-icon">🎵</div>
              <div class="stat-info">
                <span class="stat-value">{{ averageTempo }}</span>
                <span class="stat-label">平均节拍 (BPM)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="analytics-card">
          <h4>📈 节拍分布</h4>
          <div class="tempo-chart">
            <div class="chart-bars">
              <div 
                v-for="(usage, tempo) in tempoUsage" 
                :key="tempo"
                class="chart-bar"
                :style="{ height: (usage / maxTempoUsage) * 100 + '%' }"
                :title="`${tempo} BPM: ${usage}次`"
              >
                <span class="bar-label">{{ tempo }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="analytics-card">
          <h4>🎯 训练效果</h4>
          <div class="effect-ratings">
            <div class="rating-item">
              <span class="rating-label">专注力：</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= effectRatings.focus }">⭐</span>
              </div>
            </div>
            
            <div class="rating-item">
              <span class="rating-label">节奏感：</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= effectRatings.rhythm }">⭐</span>
              </div>
            </div>
            
            <div class="rating-item">
              <span class="rating-label">放松度：</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= effectRatings.relaxation }">⭐</span>
              </div>
            </div>
            
            <div class="rating-item">
              <span class="rating-label">时间感：</span>
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= effectRatings.timing }">⭐</span>
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
          <h3>🎉 训练完成</h3>
          <button class="close-btn" @click="closeSessionModal">×</button>
        </div>
        
        <div class="modal-content">
          <p>您已完成 {{ sessionDuration }} 分钟的节拍器训练！</p>
          
          <div class="session-summary">
            <div class="summary-item">
              <span class="summary-label">平均节拍：</span>
              <span class="summary-value">{{ averageSessionTempo }} BPM</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">总节拍数：</span>
              <span class="summary-value">{{ totalBeats }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">训练模式：</span>
              <span class="summary-value">{{ getCurrentModeName() }}</span>
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
const currentTempo = ref(120);
const timeSignature = ref('4/4');
const beatsPerMeasure = ref(4);
const currentBeat = ref(0);
const currentMeasure = ref(0);
const volume = ref(70);
const selectedSound = ref('click');
const sessionDuration = ref(15);
const timeElapsed = ref(0);
const currentMode = ref('basic');
const totalBeats = ref(0);
const averageSessionTempo = ref(120);

// Tap tempo
const tapTimes = ref([]);
const maxTapInterval = 3000; // 3秒内的点击才算有效

// 音频相关
const audioInitialized = ref(false);
const audioError = ref(null);
const currentAudioNodes = ref(null);
let metronomeInterval = null;
let sessionTimer = null;

// 设置
const settings = ref({
  // 基础设置
  autoStop: true,
  countIn: true,
  accentBeat: true,
  visualOnly: false,
  subdivision: 'quarter',
  goal: 'focus',
  
  // 音频设置
  soundType: 'click',
  accentSoundType: 'bell',
  volume: 70,
  accentVolume: 80,
  fadeIn: false,
  fadeOut: false,
  
  // 视觉设置
  visualStyle: 'pendulum',
  colorTheme: 'auto',
  showBeatNumbers: true,
  showMeasureCount: true,
  showTimer: true,
  fullscreenMode: false,
  beatAnimation: 'pulse',
  
  // 训练设置
  adaptiveTempo: false,
  tempoVariation: 0,
  progressiveTraining: false,
  sessionReminders: true,
  reminderInterval: 5,
  
  // 个性化设置
  preferredTempos: [60, 80, 120],
  customTimeSignatures: ['4/4', '3/4', '2/4'],
  trainingGoals: {
    daily: 20,
    weekly: 140,
    monthly: 600
  },
  
  // 高级设置
  polyrhythm: false,
  polyrhythmRatio: '3:2',
  metronomeChain: false,
  biofeedback: false,
  heartRateSync: false,
  
  // 辅助功能
  hapticFeedback: false,
  voiceCount: false,
  accessibilityMode: false,
  largeText: false,
  highContrast: false,
  
  // 安全设置
  maxVolume: 85,
  maxSessionTime: 60,
  breakReminders: true,
  eyeStrainProtection: true
});

// 分析数据
const analyticsTimeRange = ref('month');
const totalTrainingMinutes = ref(0);
const totalSessions = ref(0);
const averageTempo = ref(120);
const tempoUsage = ref({});
const maxTempoUsage = ref(0);
const effectRatings = ref({
  focus: 4,
  rhythm: 4,
  relaxation: 3,
  timing: 4
});

// 弹窗状态
const showSessionComplete = ref(false);
const sessionFeedback = ref('');

// 预设节拍
const presetTempos = ref([
  {
    id: 1,
    name: '深度冥想',
    bpm: 60,
    icon: '🧘',
    description: '缓慢节拍，适合深度冥想和放松',
    benefits: ['深度放松', '内心平静', '压力释放'],
    category: 'meditation',
    timeSignature: '4/4',
    difficulty: 'beginner'
  },
  {
    id: 2,
    name: '专注训练',
    bpm: 80,
    icon: '🎯',
    description: '中慢节拍，提升专注力和集中度',
    benefits: ['专注力', '集中度', '心理稳定'],
    category: 'focus',
    timeSignature: '4/4',
    difficulty: 'beginner'
  },
  {
    id: 3,
    name: '标准节拍',
    bpm: 120,
    icon: '⚡',
    description: '标准节拍，适合日常训练',
    benefits: ['节奏感', '时间感', '协调性'],
    category: 'rhythm',
    timeSignature: '4/4',
    difficulty: 'intermediate'
  },
  {
    id: 4,
    name: '活力训练',
    bpm: 140,
    icon: '🔥',
    description: '快速节拍，激发活力和能量',
    benefits: ['活力提升', '反应速度', '动态平衡'],
    category: 'energy',
    timeSignature: '4/4',
    difficulty: 'intermediate'
  },
  {
    id: 5,
    name: '挑战模式',
    bpm: 180,
    icon: '🚀',
    description: '高速节拍，挑战极限专注力',
    benefits: ['极限专注', '快速反应', '高度集中'],
    category: 'challenge',
    timeSignature: '4/4',
    difficulty: 'advanced'
  },
  {
    id: 6,
    name: '呼吸同步',
    bpm: 45,
    icon: '🌬️',
    description: '超慢节拍，与深呼吸节奏同步',
    benefits: ['呼吸调节', '心率平稳', '深度放松'],
    category: 'breathing',
    timeSignature: '4/4',
    difficulty: 'beginner'
  },
  {
    id: 7,
    name: '学习辅助',
    bpm: 100,
    icon: '📚',
    description: '适中节拍，提升学习效率和记忆力',
    benefits: ['学习效率', '记忆增强', '思维清晰'],
    category: 'study',
    timeSignature: '4/4',
    difficulty: 'beginner'
  },
  {
    id: 8,
    name: '创意激发',
    bpm: 90,
    icon: '🎨',
    description: '灵感节拍，激发创造力和想象力',
    benefits: ['创造力', '灵感激发', '思维发散'],
    category: 'creativity',
    timeSignature: '3/4',
    difficulty: 'intermediate'
  },
  {
    id: 9,
    name: '运动协调',
    bpm: 160,
    icon: '🏃',
    description: '运动节拍，提升身体协调性',
    benefits: ['身体协调', '运动节奏', '肌肉记忆'],
    category: 'movement',
    timeSignature: '2/4',
    difficulty: 'intermediate'
  },
  {
    id: 10,
    name: '复合节拍',
    bpm: 110,
    icon: '🎼',
    description: '复杂拍号，训练高级节奏感',
    benefits: ['复杂节奏', '音乐感知', '认知灵活'],
    category: 'complex',
    timeSignature: '7/8',
    difficulty: 'advanced'
  },
  {
    id: 11,
    name: '睡前放松',
    bpm: 40,
    icon: '🌙',
    description: '极慢节拍，帮助入睡和深度休息',
    benefits: ['助眠效果', '深度放松', '心率下降'],
    category: 'sleep',
    timeSignature: '4/4',
    difficulty: 'beginner'
  },
  {
    id: 12,
    name: '晨间唤醒',
    bpm: 130,
    icon: '☀️',
    description: '活力节拍，唤醒身心状态',
    benefits: ['精神唤醒', '活力提升', '状态调整'],
    category: 'morning',
    timeSignature: '4/4',
    difficulty: 'intermediate'
  }
]);

// 训练模式
const trainingModes = ref([
  {
    id: 'basic',
    name: '基础训练',
    description: '固定节拍训练，建立稳定的内在节奏感',
    icon: '🎵',
    level: 'beginner',
    duration: 10,
    tempoRange: '60-120 BPM',
    difficulty: '简单',
    totalSessions: 10,
    completedSessions: 0,
    benefits: ['节奏感建立', '时间感培养', '基础协调'],
    targetAudience: '初学者、节拍器新手',
    stages: [
      { name: '适应阶段', duration: 3, tempo: 80, description: '熟悉节拍器节奏' },
      { name: '稳定阶段', duration: 4, tempo: 100, description: '保持稳定跟随' },
      { name: '巩固阶段', duration: 3, tempo: 120, description: '巩固节奏感' }
    ]
  },
  {
    id: 'progressive',
    name: '渐进训练',
    description: '节拍逐渐加快，提升适应能力',
    icon: '📈',
    level: 'intermediate',
    duration: 15,
    tempoRange: '80-160 BPM',
    difficulty: '中等',
    totalSessions: 8,
    completedSessions: 0,
    benefits: ['适应能力', '反应速度', '节奏控制'],
    targetAudience: '有基础的练习者',
    stages: [
      { name: '慢速起步', duration: 5, tempo: 80, description: '从慢速开始适应' },
      { name: '逐步加速', duration: 5, tempo: 120, description: '逐渐提升节拍速度' },
      { name: '快速挑战', duration: 5, tempo: 160, description: '挑战快速节拍' }
    ]
  },
  {
    id: 'variable',
    name: '变速训练',
    description: '节拍随机变化，增强专注力和适应性',
    icon: '🔄',
    level: 'advanced',
    duration: 20,
    tempoRange: '60-180 BPM',
    difficulty: '困难',
    totalSessions: 12,
    completedSessions: 0,
    benefits: ['专注力', '适应性', '反应灵敏'],
    targetAudience: '高级练习者',
    stages: [
      { name: '小幅变化', duration: 6, tempo: 100, description: '小范围节拍变化' },
      { name: '中幅变化', duration: 7, tempo: 120, description: '中等范围变化' },
      { name: '大幅变化', duration: 7, tempo: 140, description: '大范围随机变化' }
    ]
  },
  {
    id: 'meditation',
    name: '冥想辅助',
    description: '缓慢稳定节拍，辅助冥想练习',
    icon: '🌊',
    level: 'beginner',
    duration: 25,
    tempoRange: '40-80 BPM',
    difficulty: '简单',
    totalSessions: 15,
    completedSessions: 0,
    benefits: ['深度放松', '冥想专注', '心率调节'],
    targetAudience: '冥想练习者、放松需求者',
    stages: [
      { name: '入静准备', duration: 5, tempo: 60, description: '进入冥想状态' },
      { name: '深度冥想', duration: 15, tempo: 45, description: '深度冥想练习' },
      { name: '回归调整', duration: 5, tempo: 60, description: '逐渐回到正常状态' }
    ]
  },
  {
    id: 'complex',
    name: '复合节拍',
    description: '复杂拍号训练，提升音乐感知能力',
    icon: '🎼',
    level: 'advanced',
    duration: 18,
    tempoRange: '90-150 BPM',
    difficulty: '困难',
    totalSessions: 10,
    completedSessions: 0,
    benefits: ['音乐感知', '复杂节奏', '认知灵活'],
    targetAudience: '音乐学习者、高级练习者',
    stages: [
      { name: '3/4拍练习', duration: 6, tempo: 100, description: '三拍子节奏训练' },
      { name: '5/4拍练习', duration: 6, tempo: 110, description: '五拍子节奏训练' },
      { name: '7/8拍练习', duration: 6, tempo: 120, description: '复杂拍号训练' }
    ]
  },
  {
    id: 'breathing',
    name: '呼吸同步',
    description: '与呼吸节奏同步，调节身心状态',
    icon: '🌬️',
    level: 'beginner',
    duration: 20,
    tempoRange: '30-60 BPM',
    difficulty: '简单',
    totalSessions: 12,
    completedSessions: 0,
    benefits: ['呼吸调节', '心率平稳', '压力缓解'],
    targetAudience: '压力大的人群、呼吸练习者',
    stages: [
      { name: '自然呼吸', duration: 5, tempo: 45, description: '跟随自然呼吸节奏' },
      { name: '深度呼吸', duration: 10, tempo: 30, description: '深度呼吸练习' },
      { name: '节奏呼吸', duration: 5, tempo: 40, description: '建立规律呼吸' }
    ]
  },
  {
    id: 'focus',
    name: '专注力强化',
    description: '通过节拍训练提升专注力和注意力',
    icon: '🎯',
    level: 'intermediate',
    duration: 12,
    tempoRange: '80-120 BPM',
    difficulty: '中等',
    totalSessions: 14,
    completedSessions: 0,
    benefits: ['专注力', '注意力', '心理稳定'],
    targetAudience: '学生、需要专注的工作者',
    stages: [
      { name: '注意力集中', duration: 4, tempo: 80, description: '集中注意力训练' },
      { name: '持续专注', duration: 4, tempo: 100, description: '维持专注状态' },
      { name: '深度专注', duration: 4, tempo: 120, description: '深度专注训练' }
    ]
  },
  {
    id: 'creativity',
    name: '创意激发',
    description: '特殊节拍模式激发创造力和灵感',
    icon: '🎨',
    level: 'intermediate',
    duration: 16,
    tempoRange: '70-110 BPM',
    difficulty: '中等',
    totalSessions: 8,
    completedSessions: 0,
    benefits: ['创造力', '灵感激发', '思维发散'],
    targetAudience: '创作者、设计师、艺术家',
    stages: [
      { name: '思维放松', duration: 5, tempo: 70, description: '放松思维状态' },
      { name: '灵感涌现', duration: 6, tempo: 90, description: '激发创意灵感' },
      { name: '创意整合', duration: 5, tempo: 110, description: '整合创意思路' }
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
const animationDuration = computed(() => {
  return 60 / currentTempo.value; // 每拍的秒数
});

const sessionProgressPercentage = computed(() => {
  const totalSeconds = sessionDuration.value * 60;
  return (timeElapsed.value / totalSeconds) * 100;
});

// 方法
const getTempoDescription = (bpm) => {
  if (bpm < 60) return '极慢 - 深度冥想';
  if (bpm < 80) return '慢速 - 放松冥想';
  if (bpm < 100) return '中慢 - 专注训练';
  if (bpm < 120) return '中速 - 标准节拍';
  if (bpm < 140) return '中快 - 活力训练';
  if (bpm < 160) return '快速 - 挑战模式';
  return '极快 - 极限挑战';
};

const togglePlayPause = () => {
  if (isPlaying.value) {
    stopMetronome();
  } else {
    startMetronome();
  }
};

const startMetronome = async () => {
  isPlaying.value = true;
  currentBeat.value = 0;
  currentMeasure.value = 0;
  totalBeats.value = 0;
  
  await initAudioContext();
  if (audioInitialized.value) {
    startMetronomeLoop();
    startSessionTimer();
  } else {
    isPlaying.value = false;
  }
};

const stopMetronome = () => {
  isPlaying.value = false;
  clearInterval(metronomeInterval);
  clearInterval(sessionTimer);
};

const initAudioContext = async () => {
  try {
    audioInitialized.value = false;
    audioError.value = null;
    await audioEngine.initialize();
    audioInitialized.value = true;
  } catch (error) {
    console.error('节拍器音频初始化失败:', error);
    audioError.value = error.message;
  }
};

const playBeat = async (isAccent = false) => {
  if (settings.value.visualOnly || !audioInitialized.value) return;
  
  try {
    const frequency = isAccent && settings.value.accentBeat ? 800 : 600;
    const currentVolume = volume.value / 100;
    const duration = 0.1;
    
    await audioUtils.playMetronomeSound(frequency, currentVolume, duration);
  } catch (error) {
    console.error('播放节拍音频失败:', error);
  }
};

const startMetronomeLoop = () => {
  const interval = (60 / currentTempo.value) * 1000; // 毫秒
  
  metronomeInterval = setInterval(() => {
    currentBeat.value++;
    totalBeats.value++;
    
    if (currentBeat.value > beatsPerMeasure.value) {
      currentBeat.value = 1;
      currentMeasure.value++;
    }
    
    const isAccent = currentBeat.value === 1;
    playBeat(isAccent);
  }, interval);
};

const startSessionTimer = () => {
  sessionTimer = setInterval(() => {
    timeElapsed.value++;
    
    if (timeElapsed.value >= sessionDuration.value * 60) {
      completeSession();
    }
  }, 1000);
};

const completeSession = () => {
  stopMetronome();
  
  // 更新统计数据
  totalSessions.value++;
  totalTrainingMinutes.value += sessionDuration.value;
  averageSessionTempo.value = currentTempo.value;
  
  // 更新节拍使用统计
  const tempoRange = Math.floor(currentTempo.value / 20) * 20;
  const tempoKey = `${tempoRange}-${tempoRange + 19}`;
  tempoUsage.value[tempoKey] = (tempoUsage.value[tempoKey] || 0) + 1;
  
  // 保存数据
  saveMetronomeData();
  
  // 显示完成弹窗
  if (settings.value.autoStop) {
    showSessionComplete.value = true;
  }
};

const updateTempo = async () => {
  if (isPlaying.value) {
    stopMetronome();
    setTimeout(async () => {
      await startMetronome();
    }, 100);
  }
};

const increaseTempo = () => {
  if (currentTempo.value < 200) {
    currentTempo.value += 5;
    updateTempo();
  }
};

const decreaseTempo = () => {
  if (currentTempo.value > 40) {
    currentTempo.value -= 5;
    updateTempo();
  }
};

const updateTimeSignature = () => {
  const [numerator] = timeSignature.value.split('/');
  beatsPerMeasure.value = parseInt(numerator);
  
  if (isPlaying.value) {
    currentBeat.value = 0;
    currentMeasure.value = 0;
  }
};

const updateVolume = () => {
  // 音量在playBeat方法中使用
};

const updateSound = () => {
  // 音效类型在playBeat方法中使用
};

const tapTempo = () => {
  const now = Date.now();
  tapTimes.value.push(now);
  
  // 只保留最近的点击
  tapTimes.value = tapTimes.value.filter(time => now - time < maxTapInterval);
  
  if (tapTimes.value.length >= 2) {
    const intervals = [];
    for (let i = 1; i < tapTimes.value.length; i++) {
      intervals.push(tapTimes.value[i] - tapTimes.value[i - 1]);
    }
    
    const averageInterval = intervals.reduce((a, b) => a + b) / intervals.length;
    const newTempo = Math.round(60000 / averageInterval);
    
    if (newTempo >= 40 && newTempo <= 200) {
      currentTempo.value = newTempo;
      updateTempo();
    }
  }
};

const setPresetTempo = (preset) => {
  currentTempo.value = preset.bpm;
  updateTempo();
};

const selectMode = (mode) => {
  currentMode.value = mode.id;
  // 根据模式调整设置
  switch (mode.id) {
    case 'meditation':
      currentTempo.value = 60;
      settings.value.goal = 'meditation';
      break;
    case 'progressive':
      currentTempo.value = 80;
      settings.value.goal = 'focus';
      break;
    case 'variable':
      currentTempo.value = 120;
      settings.value.goal = 'focus';
      break;
    case 'complex':
      timeSignature.value = '3/4';
      updateTimeSignature();
      break;
    default:
      currentTempo.value = 120;
      settings.value.goal = 'rhythm';
  }
};

const getLevelText = (level) => {
  const levelMap = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  };
  return levelMap[level] || '中级';
};

const getCurrentModeName = () => {
  const mode = trainingModes.value.find(m => m.id === currentMode.value);
  return mode ? mode.name : '基础训练';
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const closeSessionModal = () => {
  showSessionComplete.value = false;
  sessionFeedback.value = '';
  timeElapsed.value = 0;
};

const startNewSession = () => {
  closeSessionModal();
  startMetronome();
};

// 数据持久化
const saveMetronomeData = () => {
  const data = {
    settings: settings.value,
    modes: trainingModes.value,
    analytics: {
      totalTrainingMinutes: totalTrainingMinutes.value,
      totalSessions: totalSessions.value,
      averageTempo: averageTempo.value,
      tempoUsage: tempoUsage.value,
      effectRatings: effectRatings.value
    }
  };
  
  trainingStore.saveMeditationModuleData('metronome', data);
};

const loadMetronomeData = () => {
  const data = trainingStore.getMeditationModuleData('metronome');
  
  if (data) {
    if (data.settings) {
      settings.value = { ...settings.value, ...data.settings };
    }
    if (data.modes) {
      trainingModes.value = data.modes;
    }
    if (data.analytics) {
      totalTrainingMinutes.value = data.analytics.totalTrainingMinutes || 0;
      totalSessions.value = data.analytics.totalSessions || 0;
      averageTempo.value = data.analytics.averageTempo || 120;
      tempoUsage.value = data.analytics.tempoUsage || {};
      effectRatings.value = { ...effectRatings.value, ...data.analytics.effectRatings };
    }
  }
  
  // 生成模拟数据
  generateMockData();
};

const generateMockData = () => {
  // 生成节拍使用数据
  const tempoRanges = ['40-59', '60-79', '80-99', '100-119', '120-139', '140-159', '160-179', '180-199'];
  tempoRanges.forEach(range => {
    tempoUsage.value[range] = Math.floor(Math.random() * 30) + 5;
  });
  
  maxTempoUsage.value = Math.max(...Object.values(tempoUsage.value));
};

// 生命周期
onMounted(() => {
  loadMetronomeData();
  updateTimeSignature();
});

onUnmounted(() => {
  stopMetronome();
  if (audioContext) {
    audioContext.close();
  }
});
</script>

<style scoped>
.metronome-container {
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

.metronome-player {
  margin-bottom: 3rem;
}

.player-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  border: 2px solid rgba(var(--color-primary-rgb), 0.1);
}

.metronome-display {
  text-align: center;
  margin-bottom: 2rem;
}

.tempo-info {
  margin-bottom: 2rem;
}

.tempo-info h3 {
  color: var(--color-primary);
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.tempo-description {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  font-style: italic;
}

.visual-metronome {
  position: relative;
  margin-bottom: 2rem;
}

.metronome-pendulum {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 200px;
  margin-bottom: 2rem;
}

.pendulum-rod {
  width: 4px;
  height: 150px;
  background: var(--color-primary);
  border-radius: 2px;
  position: relative;
  transform-origin: top center;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

.pendulum-rod.active {
  animation-name: pendulumSwing;
}

@keyframes pendulumSwing {
  0% { transform: rotate(-30deg); }
  100% { transform: rotate(30deg); }
}

.pendulum-weight {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
}

.beat-indicator {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.beat-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(var(--color-primary-rgb), 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: var(--color-text-secondary);
  transition: all var(--transition-normal);
  border: 2px solid transparent;
}

.beat-dot.active {
  background: var(--color-primary);
  color: white;
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.4);
}

.beat-dot.accent {
  background: var(--color-warning);
  border-color: var(--color-warning);
  animation: accentPulse 0.3s ease-out;
}

@keyframes accentPulse {
  0% { transform: scale(1.2); }
  50% { transform: scale(1.4); }
  100% { transform: scale(1.2); }
}

.measure-counter {
  font-size: 1.2rem;
  color: var(--color-text);
}

.measure-label {
  color: var(--color-text-secondary);
}

.measure-number {
  color: var(--color-primary);
  font-weight: bold;
  font-size: 1.5rem;
}

.session-timer {
  margin-bottom: 2rem;
}

.timer-display {
  text-align: center;
  margin-bottom: 1rem;
}

.time-elapsed {
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

.metronome-controls {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tempo-control {
  text-align: center;
}

.tempo-control label {
  display: block;
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: 1rem;
}

.tempo-input-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tempo-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.tempo-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.tempo-btn:disabled {
  background: var(--color-border);
  cursor: not-allowed;
  transform: none;
}

.tempo-input {
  width: 80px;
  padding: 0.5rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-primary);
  background: var(--color-bg);
}

.tempo-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.tempo-slider {
  width: 300px;
  height: 8px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.tempo-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(var(--color-primary-rgb), 0.3);
}

.time-signature-control {
  text-align: center;
}

.time-signature-control label {
  display: block;
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.time-signature-select {
  padding: 0.5rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 1.1rem;
  cursor: pointer;
}

.time-signature-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.play-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.control-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
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

.audio-settings {
  display: flex;
  justify-content: space-around;
  gap: 2rem;
  flex-wrap: wrap;
}

.volume-control, .sound-selection {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.volume-control label, .sound-selection label {
  color: var(--color-text);
  font-weight: 600;
  white-space: nowrap;
}

.volume-slider {
  width: 150px;
  height: 6px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
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

.sound-select {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
}

.preset-tempos {
  margin-bottom: 3rem;
}

.preset-tempos h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.preset-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  border: 2px solid transparent;
  text-align: center;
}

.preset-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.preset-card.active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.preset-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.preset-card h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.preset-bpm {
  color: var(--color-info);
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.preset-description {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.preset-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.benefit-tag {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
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
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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
  border-color: var(--color-primary);
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

.progress-text {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 0.5rem;
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

.number-input, .select-input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
  width: 100%;
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

.tempo-chart {
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
  .metronome-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .tempo-info h3 {
    font-size: 2.5rem;
  }
  
  .tempo-slider {
    width: 100%;
  }
  
  .audio-settings {
    flex-direction: column;
    align-items: center;
  }
  
  .volume-control, .sound-selection {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .volume-slider {
    width: 100%;
  }
  
  .presets-grid {
    grid-template-columns: 1fr;
  }
  
  .modes-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
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